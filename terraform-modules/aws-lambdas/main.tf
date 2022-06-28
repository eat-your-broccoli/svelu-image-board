
locals {
  packageJSON_sha1  = sha1(join("", [for f in fileset(path.root, "${var.src_path}/package*.json") : filesha1(f)]))
  node_modules_sha1 = length(fileset(path.root, "${var.src_path}/node_modules/**"))
  src_dir_sha1 = sha1(join("", [for f in fileset(path.root, "${var.src_path}/src/**") : filesha1(f)]))
}

// installing dependencies
resource "null_resource" "lambda_dependencies" {
  provisioner "local-exec" {
    command = "cd ${var.src_path} && rm -rf node_modules/sharp && npm install --arch=x64 --platform=linux sharp && npm install"
    # yeah ... so basically sharp under windows != sharp under linux. so ... either we do this ... or there are no thumbnails :(
  }

  triggers = {
    # runs_always = "${timestamp()}" // executes every time because timestamp changes
    packageJSON_sha1  = local.packageJSON_sha1
    node_modules      = local.node_modules_sha1
  }
}

# this little fella here aaaaaaaalways runs
# this means, its hash will always change
# which means, it will be uploaded on every terraform apply
# which is something I (Luca) don't like
# rant continues at null_resource.remove_and_upload_to_s3
data "archive_file" "archive" {
  type = "zip"

  source_dir  = "${var.src_path}"
  output_path = "${var.out_path}${var.file_key}"
  excludes = ["test/", ".env", ".env.example", "docker-compose.yml"]
  depends_on = [
    null_resource.lambda_dependencies
  ]
}

# archive file uploads every time if we'd use aws_s3_object
# so ... let's use a null resource, and sync the folder of the archive file
# ONLY when triggers fire
resource "null_resource" "remove_and_upload_to_s3" {
  depends_on = [
    data.archive_file.archive
  ]
  provisioner "local-exec" {
    command = "aws s3 sync ${var.out_path} s3://${var.bucket_id}"
  }
  triggers = {
    packageJSON_sha1 = local.packageJSON_sha1
    node_modules_sha1 = local.node_modules_sha1
    src_dir_sha1 = local.src_dir_sha1
  }
}

resource "aws_lambda_function" "lambda_function" {
  for_each = var.lambdas
  function_name = each.value.function_name

  s3_bucket = var.bucket_id
  s3_key    = var.file_key

  runtime = "nodejs14.x"
  handler = "src/${each.value.handler}"

  timeout = each.value.timeout

  source_code_hash = data.archive_file.archive.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  environment {
    variables = {
      DB_USER = var.env_db_user
      DB_NAME = var.env_db_name
      DB_PASS = var.env_db_pass
      DB_PORT = var.env_db_port
      DB_HOST = var.env_db_address
      BUCKET_NAME_MEDIA = var.env_bucket_media
      BUCKET_NAME_THUMBNAILS = var.env_bucket_thumbnails
      BUCKET_MEDIA_URL = var.env_bucket_media_url
      BUCKET_THUMBNAILS_URL = var.env_bucket_thumbnails_url
    }
  }

  vpc_config {
    security_group_ids = [var.vpc_security_group_default_id]
    subnet_ids  = var.aws_subnet_rds_ids
  }
}

resource "aws_iam_role" "lambda_exec" {
  name = "lambda_api_exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      }
    ]
  })
}

resource "aws_iam_policy" "lambda_s3_policy" {
  name = "lambda_s3_policy"
  path = "/"
  description = "Allow lambda access to s3 buckets"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:*",
        ]
        Effect   = "Allow"
        Resource = "arn:aws:s3:::*"
        Sid      = "Stmt1562499798378"
      },
    ]
  })
}

resource "aws_iam_policy_attachment" "s3_attatch" {
  name = "s3_attatch"
  roles = [aws_iam_role.lambda_exec.name]
  policy_arn = aws_iam_policy.lambda_s3_policy.arn
}

resource "aws_iam_role_policy_attachment" "lambda_policy_2" {
    role       = aws_iam_role.lambda_exec.name
    policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}




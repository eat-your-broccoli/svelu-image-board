// installing dependencies
resource "null_resource" "lambda_dependencies" {
  provisioner "local-exec" {
    command = "cd ${path.module}/../../rds-migrate && npm install"
  }

  triggers = {
    # runs_always = "${timestamp()}" // executes every time because timestamp changes
  }
}


data "archive_file" "archive" {
  depends_on = [
    null_resource.lambda_dependencies
  ]
  type = "zip"

  source_dir  = var.src_path
  output_path = var.out_path
}

resource "aws_s3_bucket_object" "s3_object_lambda_api" {
  bucket = var.bucket_id
  key    = var.file_key
  source = data.archive_file.archive.output_path

  etag = data.archive_file.archive.output_md5
}

resource "aws_lambda_function" "lambda_function" {
  for_each = var.lambdas
  function_name = each.value.function_name

  s3_bucket = var.bucket_id
  s3_key    = aws_s3_bucket_object.s3_object_lambda_api.key

  runtime = "nodejs14.x"
  handler = each.value.handler

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




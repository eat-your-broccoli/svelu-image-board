data "archive_file" "lambda_rds_migration" {
  type = "zip"

  source_dir  = var.src_path
  output_path = var.out_path
}

resource "aws_s3_bucket_object" "lambda_rds_migration" {
  bucket = var.bucket_id
  key    = var.file_key
  source = data.archive_file.lambda_rds_migration.output_path

  etag = filemd5(data.archive_file.lambda_rds_migration.output_path)
}

resource "aws_lambda_function" "lambda_rds_migration" {
  function_name = var.function_name

  s3_bucket = var.bucket_id
  s3_key    = aws_s3_bucket_object.lambda_rds_migration.key

  runtime = "nodejs14.x"
  handler = "index.handler"

  timeout = 20

  source_code_hash = data.archive_file.lambda_rds_migration.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  environment {
    variables = {
      DB_USER = var.env_db_user
      DB_NAME = var.env_db_name
      DB_PASS = var.env_db_pass
      DB_PORT = var.env_db_port
      DB_HOST = var.env_db_address
    }
  }
}

resource "aws_iam_role" "lambda_exec" {
  name = "serverless_lambda"

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

resource "aws_iam_role_policy_attachment" "lambda_policy_2" {
    role       = aws_iam_role.lambda_exec.name
    policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}




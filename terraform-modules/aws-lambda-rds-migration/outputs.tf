output "lambda_func_name" {
    description = "Lambda function name"
    value = aws_lambda_function.lambda_rds_migration.function_name
}
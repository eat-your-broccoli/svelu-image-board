data "aws_lambda_invocation" "migration" {
    function_name = var.lambda_func_name
    input = <<JSON
{
}
JSON
}

output "lambda_migration_result" {
    value = jsondecode(data.aws_lambda_invocation.migration.result)["success"]
}
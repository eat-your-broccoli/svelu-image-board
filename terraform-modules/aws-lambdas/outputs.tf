output "invoke_arn" {
  description = "invoke Arn of lambda function"
  value = tomap({
      for inst in aws_lambda_function.lambda_function : inst.function_name => inst.invoke_arn
  })
}

output "arn" {
  description = "Arn of lambda function"
  value = tomap({
      for inst in aws_lambda_function.lambda_function : inst.function_name => inst.arn
  })
}

output "function_name" {
  description = "Lambda function name"
  value = tomap({
      for inst in aws_lambda_function.lambda_function : inst.function_name => inst.function_name
  })
}
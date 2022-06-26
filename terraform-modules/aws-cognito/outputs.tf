output "cognito_domain" {
  value = "https://${aws_cognito_user_pool.user_pool.endpoint}"
}

output "cognito_UserPoolId" {
  value = aws_cognito_user_pool.user_pool.id
}

output "cognito_ClientID" {
  value = aws_cognito_user_pool_client.client.id
}
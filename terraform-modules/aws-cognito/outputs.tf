output "cognito_domain" {
  value = "https://${aws_cognito_user_pool_domain.main.domain}.auth.eu-central-1.amazoncognito.com"
}
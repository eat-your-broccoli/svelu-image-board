resource "aws_cognito_user_pool" "user_pool" {
  name = "svelu_userpool"
  mfa_configuration          = "OFF"
  auto_verified_attributes = [ "email" ]
  password_policy {
    minimum_length = 10
  }
  email_verification_subject = "Complete your registration at svelu"
}


resource "aws_cognito_user_pool_client" "client" {
  name = "cognito-client"

  user_pool_id = aws_cognito_user_pool.user_pool.id
  generate_secret = false
  refresh_token_validity = 90
  prevent_user_existence_errors = "ENABLED"
  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_ADMIN_USER_PASSWORD_AUTH"
  ]
  supported_identity_providers         = ["COGNITO"]
}


resource "aws_cognito_identity_pool" "main" {
    identity_pool_name               = "svelu_identity_pool"
    allow_unauthenticated_identities = false
    allow_classic_flow               = false
}

resource "aws_cognito_user" "test-user" {
  user_pool_id = aws_cognito_user_pool.user_pool.id
  username     = "test-user"

  attributes = {
    email          = "lgoettle@stud.hs-heilbronn.de"
    email_verified = true
  }
}

resource "aws_cognito_user_pool_domain" "main" {
  domain       = "svelu-auth"
  user_pool_id = aws_cognito_user_pool.user_pool.id
}
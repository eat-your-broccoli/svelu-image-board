resource "aws_cognito_user_pool" "user_pool" {
  name = "svelu_userpool"
  mfa_configuration          = "OFF"
  auto_verified_attributes = [ "email" ]
  password_policy {
    minimum_length = 10
  }
  verification_message_template {
    default_email_option = "CONFIRM_WITH_LINK"
    email_subject =  "Complete your registration at svelu"
  }
  lambda_config {
    post_confirmation = var.post_confirmation_lambda_arn
    post_authentication = var.post_auth_lambda_arn
  }
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
    "ALLOW_USER_SRP_AUTH"
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

# some info (user pool id, user client id) is relevant for the frontend, the aws sdk needs these to make auth calls
# so we take them and put them in a json file in the frontend project
resource "local_file" "cognito_config" {
  depends_on = [
    aws_cognito_user_pool.user_pool,
    aws_cognito_user_pool_client.client
  ]
  content  = "{\n\"UserPoolId\": \"${aws_cognito_user_pool.user_pool.id}\", \n\"ClientId\": \"${aws_cognito_user_pool_client.client.id}\"\n}"
  filename = "./cloud-computing-app/src/config/cognito.config.json"
}

resource "aws_lambda_permission" "allow_execution_from_user_pool" {
  statement_id = "AllowExecutionFromUserPool"
  action = "lambda:InvokeFunction"
  function_name = var.post_confirmation_lambda_function_name
  principal = "cognito-idp.amazonaws.com"
  source_arn = aws_cognito_user_pool.user_pool.arn
}

resource "aws_lambda_permission" "allow_execution_from_user_pool_post_auth" {
  statement_id = "AllowExecutionFromUserPool"
  action = "lambda:InvokeFunction"
  function_name = var.post_auth_lambda_function_name
  principal = "cognito-idp.amazonaws.com"
  source_arn = aws_cognito_user_pool.user_pool.arn
}
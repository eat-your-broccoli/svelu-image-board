resource "aws_cognito_user_pool" "pool" {
  name = "svelu_userpool"
  mfa_configuration          = "OFF"
  auto_verified_attributes = [ "email" ]
  password_policy {
    minimum_length = 10
  }
  email_verification_subject = "Complete your registration at svelu"
}


resource "aws_cognito_identity_pool" "main" {
    identity_pool_name               = "svelu_identity_pool"
    allow_unauthenticated_identities = false
    allow_classic_flow               = false

    supported_login_providers = {
        "accounts.google.com" = "79694871530-9rpthrd3nl12kor45j2l12c5tb9d1hfn.apps.googleusercontent.com"
    }
}
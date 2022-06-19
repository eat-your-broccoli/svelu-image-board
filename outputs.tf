# output "website_outputs" {
#   description = "Domain name of the bucket"
#   value       = module.website_bucket_s3
# }

output "lambda_migration_success" {
    value = module.lambda_rds_migration_invocation.lambda_migration_result
}

output "cognito_domain" {
    value = module.cognito.cognito_domain
}

output "api_gateway_url" {
    value = module.api_gateway.url
}
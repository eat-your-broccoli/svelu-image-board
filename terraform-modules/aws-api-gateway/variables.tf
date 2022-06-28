variable "api_gateways" {
    description = "API Gateways and integrations"
    type = map(object({
        route_key = string
        integration_uri = string
        function_name = string
    }))
}
variable "cognito_user_pool_client_id" {}
variable "cognito_user_pool_endpoint" {}

variable "CORS_allowed_origins" {
    type=list(string)
}

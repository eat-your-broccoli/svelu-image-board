variable "api_gateways" {
    description = "API Gateways and integrations"
    type = map(object({
        route_key = string
        integration_uri = string
        function_name = string
    }))
}
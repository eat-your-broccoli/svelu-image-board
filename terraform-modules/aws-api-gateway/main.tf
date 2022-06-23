resource "aws_apigatewayv2_api" "api"{
    name = "svelu-api"
    description = "API gateway for svelu"
    protocol_type = "HTTP"

    cors_configuration {
        allow_origins = ["*"]
        allow_methods = ["POST", "GET", "OPTIONS", "*"]
        allow_headers = ["content-type", "Authorization"]
        max_age = 300
    }
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
    for_each = var.api_gateways
    api_id      = aws_apigatewayv2_api.api.id

    integration_type       = "AWS_PROXY"
    integration_uri        = each.value.integration_uri
    payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "route" {
    for_each = var.api_gateways
    api_id    = aws_apigatewayv2_api.api.id
    route_key = each.value.route_key

    target = "integrations/${aws_apigatewayv2_integration.lambda_integration[each.key].id}"
    authorization_type = "JWT"
    authorizer_id = aws_apigatewayv2_authorizer.auth.id
}

resource "aws_apigatewayv2_stage" "default" {
    api_id      = aws_apigatewayv2_api.api.id
    name        = "$default"
    auto_deploy = true
}

## Lambda permissions
# for api gateway permissions
resource "aws_lambda_permission" "apigw_perm" {
    for_each = var.api_gateways
    statement_id  = "AllowAPIGatewayInvoke"
    action        = "lambda:InvokeFunction"
    function_name = each.value.function_name
    principal     = "apigateway.amazonaws.com"

    # The /*/* portion grants access from any method on any resource
    # within the API Gateway "REST API".
    source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

# secure aws api gateway with cognito
resource "aws_apigatewayv2_authorizer" "auth" {
  api_id           = aws_apigatewayv2_api.api.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "cognito-authorizer"

  jwt_configuration {
    audience = ["${var.cognito_user_pool_client_id}"]
    #audience = []
    issuer   = "${var.cognito_user_pool_endpoint}"
  }
}

# 
resource "local_file" "api_config_frontend" {
  depends_on = [
    aws_apigatewayv2_stage.default
  ]
  content  = "{\n\"api_url\": \"${aws_apigatewayv2_stage.default.invoke_url}\"\n}"
  filename = "./cloud-computing-app/src/config/api.config.json"
}
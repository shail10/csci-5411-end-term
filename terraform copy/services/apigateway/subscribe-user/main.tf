resource "aws_api_gateway_resource" "subscribe_user" {
  rest_api_id = var.api_id
  parent_id   = var.root_id
  path_part   = "subscribe-user"
}

resource "aws_api_gateway_method" "post" {
  rest_api_id   = var.api_id
  resource_id   = aws_api_gateway_resource.subscribe_user.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = var.authorizer_id
}

resource "aws_api_gateway_integration" "lambda" {
  rest_api_id             = var.api_id
  resource_id             = aws_api_gateway_resource.subscribe_user.id
  http_method             = aws_api_gateway_method.post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.lambda_invoke_arn
}

resource "aws_api_gateway_method" "options" {
  rest_api_id   = var.api_id
  resource_id   = aws_api_gateway_resource.subscribe_user.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options" {
  rest_api_id             = var.api_id
  resource_id             = aws_api_gateway_resource.subscribe_user.id
  http_method             = aws_api_gateway_method.options.http_method
  type                    = "MOCK"
  integration_http_method = "OPTIONS"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options" {
  rest_api_id = var.api_id
  resource_id = aws_api_gateway_resource.subscribe_user.id
  http_method = aws_api_gateway_method.options.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "options" {
  rest_api_id = var.api_id
  resource_id = aws_api_gateway_resource.subscribe_user.id
  http_method = aws_api_gateway_method.options.http_method
  status_code = aws_api_gateway_method_response.options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'",
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  response_templates = {
    "application/json" = ""
  }
}

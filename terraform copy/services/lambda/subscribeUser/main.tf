data "aws_caller_identity" "current" {}

resource "aws_lambda_function" "subscribe_user" {
  function_name = "subscribe-user-function"
  role          = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"
  handler       = "index.handler"
  runtime       = "nodejs18.x"

  filename         = "${path.module}/subscribeUser.zip"
  source_code_hash = filebase64sha256("${path.module}/subscribeUser.zip")

  environment {
    variables = {
      SNS_TOPIC_ARN = var.sns_topic_arn
    }
  }
}

resource "aws_lambda_permission" "apigw_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.subscribe_user.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.region}:${data.aws_caller_identity.current.account_id}:${var.api_gateway_id}/*/*/subscribe-user"
}

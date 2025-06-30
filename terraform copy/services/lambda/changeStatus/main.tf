data "aws_caller_identity" "current" {}

resource "aws_lambda_function" "change_status" {
  function_name = "change-status-function"
  role          = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"
  handler       = "index.handler"
  runtime       = "nodejs18.x"

  filename         = "${path.module}/changeStatus.zip"
  source_code_hash = filebase64sha256("${path.module}/changeStatus.zip")

  environment {
    variables = {
      TABLE_NAME = var.table_name,
      BUCKET_NAME = var.bucket_name
    }
  }
}

resource "aws_lambda_permission" "apigw_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.change_status.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.region}:${data.aws_caller_identity.current.account_id}:${var.api_gateway_id}/*/*/change-status"
}

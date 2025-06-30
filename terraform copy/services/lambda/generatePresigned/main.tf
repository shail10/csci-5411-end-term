data "aws_caller_identity" "current" {}

resource "aws_lambda_function" "generate_presigned" {
  function_name = "generate-presigned-url"
  role          = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"

  runtime       = "nodejs20.x"
  handler       = "index.handler"
  filename      = "${path.module}/generatePresigned.zip"
  source_code_hash = filebase64sha256("${path.module}/generatePresigned.zip")

  environment {
    variables = {
      BUCKET_NAME = var.bucket_name,
      TABLE_NAME = var.table_name
    }
  }
}


resource "aws_lambda_permission" "apigw_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.generate_presigned.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.region}:${data.aws_caller_identity.current.account_id}:${var.api_gateway_id}/*/*/generate-presigned-url"
}
data "aws_caller_identity" "current" {}

resource "aws_lambda_function" "get_resume" {
  function_name = "get_resume"
  role          = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"

  runtime       = "nodejs20.x"
  handler       = "index.handler"
  filename      = "${path.module}/getResume.zip"
  source_code_hash = filebase64sha256("${path.module}/getResume.zip")

  environment {
    variables = {
      BUCKET_NAME = var.bucket_name
    }
  }
}


resource "aws_lambda_permission" "apigw_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_resume.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.region}:${data.aws_caller_identity.current.account_id}:${var.api_gateway_id}/*/*/get-resume"
}
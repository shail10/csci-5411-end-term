data "aws_caller_identity" "current" {}

resource "aws_lambda_function" "get_jobs" {
  function_name = "get-jobs-function"
  role          = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"
  handler       = "index.handler"
  runtime       = "nodejs18.x"

  filename         = "${path.module}/getJobs.zip"
  source_code_hash = filebase64sha256("${path.module}/getJobs.zip")

  environment {
    variables = {
      TABLE_NAME = var.table_name
    }
  }
}


resource "aws_lambda_permission" "apigw_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_jobs.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.region}:${data.aws_caller_identity.current.account_id}:${var.api_gateway_id}/*/*/jobs"
}

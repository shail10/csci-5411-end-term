data "aws_caller_identity" "current" {}

resource "aws_lambda_function" "add_jobs" {
  function_name = "add-jobs-function"
  role          = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"
  handler       = "index.handler"
  runtime       = "nodejs18.x"

  filename         = "${path.module}/addJobs.zip"
  source_code_hash = filebase64sha256("${path.module}/addJobs.zip")

  environment {
    variables = {
      TABLE_NAME = var.table_name
      EVENT_BUS_NAME  = var.event_bus_name
    }
  }
}

resource "aws_lambda_permission" "apigw_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.add_jobs.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.region}:${data.aws_caller_identity.current.account_id}:${var.api_gateway_id}/*/*/add-jobs"
}

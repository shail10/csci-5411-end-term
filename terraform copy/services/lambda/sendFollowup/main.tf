data "aws_caller_identity" "current" {}

resource "aws_lambda_function" "send_followup" {
  function_name = "send-followup"
  role          = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"

  runtime          = "nodejs20.x"
  handler          = "index.handler"
  filename         = "${path.module}/sendFollowup.zip"
  source_code_hash = filebase64sha256("${path.module}/sendFollowup.zip")

  environment {
    variables = {
      TOPIC_ARN = var.topic_arn
    }
  }
}

resource "aws_lambda_permission" "eventbridge_invoke" {
  statement_id  = "AllowEventBridgeInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.send_followup.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.job_applied_rule.arn
}

resource "aws_cloudwatch_event_rule" "job_applied_rule" {
  name           = "job-applied-followup"
  event_bus_name = var.event_bus_name
  event_pattern = jsonencode({
    source      = ["job.tracker"],
    detail-type = ["JobApplied"]
  })
}

resource "aws_cloudwatch_event_target" "lambda_target" {
  rule      = aws_cloudwatch_event_rule.job_applied_rule.name
  target_id = "SendFollowupLambda"
  arn       = aws_lambda_function.send_followup.arn

  event_bus_name = var.event_bus_name
  depends_on = [aws_cloudwatch_event_rule.job_applied_rule]
}

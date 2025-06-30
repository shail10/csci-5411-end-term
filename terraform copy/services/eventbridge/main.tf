resource "aws_cloudwatch_event_bus" "job_events" {
  name = "job-followup-bus"
}
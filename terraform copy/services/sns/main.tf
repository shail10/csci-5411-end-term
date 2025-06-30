resource "aws_sns_topic" "job_followup_reminders" {
  name = "job-followup-reminders"
}

output "sns_topic_arn" {
  value = aws_sns_topic.job_followup_reminders.arn
}

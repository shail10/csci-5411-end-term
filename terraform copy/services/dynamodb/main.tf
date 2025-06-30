resource "aws_dynamodb_table" "job_applications" {
  name           = var.table_name
  billing_mode   = "PAY_PER_REQUEST"

  hash_key       = "userId"
  range_key      = "jobId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "jobId"
    type = "S"
  }

  tags = {
    Environment = "dev"
    Project     = "job-tracker"
  }
}

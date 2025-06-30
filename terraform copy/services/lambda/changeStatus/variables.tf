variable "table_name" {
  type        = string
  description = "DynamoDB table name"
}

variable "bucket_name" {
  description = "S3 bucket for resume uploads"
  type        = string
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "api_gateway_id" {
  type        = string
  description = "ID of the API Gateway to allow invoke permissions"
}

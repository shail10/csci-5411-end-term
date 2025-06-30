variable "sns_topic_arn" {}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "api_gateway_id" {
  type        = string
  description = "ID of the API Gateway to allow invoke permissions"
}

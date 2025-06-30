variable "api_id" {
  description = "ID of the API Gateway"
  type        = string
}

variable "root_id" {
  description = "Root resource ID of the API Gateway"
  type        = string
}


variable "authorizer_id" {
  description = "Cognito Authorizer ID"
  type        = string
}

variable "lambda_invoke_arn" {
  description = "Lambda function ARN for presigned URL generation"
  type        = string
}
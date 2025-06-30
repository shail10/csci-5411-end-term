variable "env_name" {
  type        = string
  description = "Elastic Beanstalk environment name"
}

variable "app_name" {
  type        = string
  description = "Elastic Beanstalk application name"
}

variable "s3_bucket" {
  type        = string
  description = "S3 bucket where zipped frontend code is stored"
}

variable "s3_key" {
  type        = string
  description = "S3 key for the zipped frontend code"
}

variable "api_url" {
  type        = string
  description = "API URL for the frontend to connect to"
}

variable "app_client_id" {
  type        = string
  description = "API URL for the frontend to connect to"
}

variable "user_pool_id" {
  type        = string
  description = "API URL for the frontend to connect to"
}

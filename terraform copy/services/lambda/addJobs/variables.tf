variable "table_name" {
  type        = string
  description = "DynamoDB table name"
}

variable "event_bus_name" {
  type        = string
  description = "EventBridge event bus name"
  
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "api_gateway_id" {
  type        = string
  description = "ID of the API Gateway to allow invoke permissions"
}

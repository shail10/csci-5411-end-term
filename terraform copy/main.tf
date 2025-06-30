module "s3" {
  source      = "./services/s3"
  bucket_name = "resumes"
}

output "resumes_bucket_name" {
  value = module.s3.bucket_name
}

resource "random_id" "suffix" {
  byte_length = 4
}

module "cognito" {
  source         = "./services/cognito"
  user_pool_name = "job-tracker-user-pool"
  client_name    = "job-tracker-client"
}

module "dynamodb" {
  source     = "./services/dynamodb"
  table_name = "job-tracker-applications"
}

module "eventbridge" {
  source = "./services/eventbridge"
}

module "get_jobs_lambda" {
  source     = "./services/lambda/getJobs"
  table_name = module.dynamodb.table_name
  region          = "us-east-1"
  api_gateway_id  = module.apigateway.api_id
}

module "add_jobs_lambda" {
  source         = "./services/lambda/addJobs"
  table_name     = module.dynamodb.table_name
  region         = "us-east-1"
  api_gateway_id = module.apigateway.api_id
  event_bus_name = module.eventbridge.event_bus_name
}

module "generate_presigned_lambda" {
  source      = "./services/lambda/generatePresigned"
  table_name     = module.dynamodb.table_name
  bucket_name = module.s3.bucket_name
  api_gateway_id = module.apigateway.api_id
  region         = "us-east-1"
}

module "get_resume_lambda" {
  source      = "./services/lambda/getResume"
  bucket_name = module.s3.bucket_name
  api_gateway_id = module.apigateway.api_id
  region         = "us-east-1"
}

module "change_status_lambda" {
  source      = "./services/lambda/changeStatus"
  bucket_name = module.s3.bucket_name
  table_name     = module.dynamodb.table_name
  api_gateway_id = module.apigateway.api_id
  region         = "us-east-1"
}

module "lambda_subscribe_user" {
  source         = "./services/lambda/subscribeUser"
  sns_topic_arn  = module.sns.sns_topic_arn
  api_gateway_id = module.apigateway.api_id
  region         = "us-east-1"
}

module "apigateway" {
  source                     = "./services/apigateway"
  lambda_invoke_arn          = module.get_jobs_lambda.function_name
  create_job_lambda_invoke_arn = module.add_jobs_lambda.function_name
  cognito_user_pool_arn      = module.cognito.user_pool_arn
  presigned_lambda_invoke_arn = module.generate_presigned_lambda.function_name
  get_resume_invoke_arn      = module.get_resume_lambda.function_name
  change_status_invoke_arn = module.change_status_lambda.function_name
  subscribe_user_invoke_arn = module.lambda_subscribe_user.function_name
}

module "sns" {
  source = "./services/sns"
}


module "send_followup" {
  source          = "./services/lambda/sendFollowup"
  event_bus_name  = module.eventbridge.event_bus_name
  topic_arn       = module.sns.sns_topic_arn
}


module "frontend" {
  source    = "./services/beanstalk"
  env_name  = "jobpilot-dev"
  app_name  = "jobpilot-frontend"
  s3_bucket = "jobpilot-frontend"
  s3_key    = "job-tracker-frontend.zip"
  api_url   = module.apigateway.api_url
  user_pool_id = module.cognito.user_pool_id
  app_client_id =  module.cognito.user_pool_client_id
}






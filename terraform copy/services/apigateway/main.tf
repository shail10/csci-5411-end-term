resource "aws_api_gateway_rest_api" "this" {
  name = "job-tracker-api"
}

resource "aws_api_gateway_authorizer" "this" {
  name            = "cognito-authorizer"
  rest_api_id     = aws_api_gateway_rest_api.this.id
  identity_source = "method.request.header.Authorization"
  type            = "COGNITO_USER_POOLS"
  provider_arns   = [var.cognito_user_pool_arn]
}

module "jobs" {
  source            = "./jobs"
  api_id            = aws_api_gateway_rest_api.this.id
  root_id           = aws_api_gateway_rest_api.this.root_resource_id
  lambda_invoke_arn = var.lambda_invoke_arn
  authorizer_id     = aws_api_gateway_authorizer.this.id
}

module "add_jobs" {
  source            = "./add-jobs"
  api_id            = aws_api_gateway_rest_api.this.id
  root_id           = aws_api_gateway_rest_api.this.root_resource_id
  authorizer_id     = aws_api_gateway_authorizer.this.id
  lambda_invoke_arn = var.create_job_lambda_invoke_arn
}

module "generate_presigned_route" {
  source            = "./generate-presigned"
  api_id            = aws_api_gateway_rest_api.this.id
  root_id           = aws_api_gateway_rest_api.this.root_resource_id
  lambda_invoke_arn = var.presigned_lambda_invoke_arn
  authorizer_id     = aws_api_gateway_authorizer.this.id
}

module "get_resume" {
  source            = "./get-resume"
  api_id            = aws_api_gateway_rest_api.this.id
  root_id           = aws_api_gateway_rest_api.this.root_resource_id
  lambda_invoke_arn = var.get_resume_invoke_arn
  authorizer_id     = aws_api_gateway_authorizer.this.id
}

module "change_status" {
  source            = "./change-status"
  api_id            = aws_api_gateway_rest_api.this.id
  root_id           = aws_api_gateway_rest_api.this.root_resource_id
  lambda_invoke_arn = var.change_status_invoke_arn
  authorizer_id     = aws_api_gateway_authorizer.this.id
}

module "subscribe_user" {
  source            = "./subscribe-user"
  api_id            = aws_api_gateway_rest_api.this.id
  root_id           = aws_api_gateway_rest_api.this.root_resource_id
  lambda_invoke_arn = var.subscribe_user_invoke_arn
  authorizer_id     = aws_api_gateway_authorizer.this.id
}

resource "aws_api_gateway_deployment" "deployment" {
  depends_on = [
  module.jobs,
  module.add_jobs,
  module.generate_presigned_route,
  module.get_resume,
  module.change_status,
  module.subscribe_user,
]
  rest_api_id = aws_api_gateway_rest_api.this.id
}

resource "aws_api_gateway_stage" "prod" {
  stage_name    = "prod"
  rest_api_id   = aws_api_gateway_rest_api.this.id
  deployment_id = aws_api_gateway_deployment.deployment.id
}

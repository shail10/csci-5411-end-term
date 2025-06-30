resource "time_static" "app_version_time" {}

resource "aws_elastic_beanstalk_application" "frontend" {
  name        = var.app_name
  description = "React + Express frontend for JobPilot"
}

resource "aws_elastic_beanstalk_application_version" "frontend" {
  name        = "v1-${time_static.app_version_time.unix}"
  application = aws_elastic_beanstalk_application.frontend.name

  bucket = var.s3_bucket
  key    = var.s3_key

  lifecycle {
    create_before_destroy = true
  }
}

# resource "aws_iam_instance_profile" "lab_profile" {
#   name = "LabInstanceProfile"
#   role = "LabRole"
# }

resource "aws_elastic_beanstalk_environment" "frontend" {
  name                = var.env_name
  application         = aws_elastic_beanstalk_application.frontend.name
  solution_stack_name = "64bit Amazon Linux 2 v4.1.2 running Docker"
  version_label       = aws_elastic_beanstalk_application_version.frontend.name

  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "SingleInstance"
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = "LabInstanceProfile"
  }

  # setting {
  #   namespace = "aws:elasticbeanstalk:environment"
  #   name      = "ServiceRole"
  #   value     = "arn:aws:iam::303861616880:role/LabRole"
  # }

  setting {
    namespace = "aws:ec2:instances"
    name      = "InstanceTypes"
    value     = "t3.medium"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "REACT_APP_API_URL"
    value     = var.api_url
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "REACT_APP_USER_POOL_ID"
    value     = var.user_pool_id
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "REACT_APP_CLIENT_ID"
    value     = var.app_client_id
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "REACT_APP_REGION"
    value     = "us-east-1"
  }
}

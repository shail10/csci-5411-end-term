resource "random_id" "suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "resumes" {
  bucket        = "${var.bucket_name}-${random_id.suffix.hex}"
  force_destroy = true

  tags = {
    Name        = "ResumesBucket"
    Environment = "Dev"
  }
}

resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.resumes.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_cors_configuration" "cors" {
  bucket = aws_s3_bucket.resumes.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "resumes_lifecycle" {
  bucket = aws_s3_bucket.resumes.id

  rule {
    id     = "delete-rejected-resumes"
    status = "Enabled"

    filter {
      prefix = "rejected/"
    }

    expiration {
      days = 10
    }
  }
}

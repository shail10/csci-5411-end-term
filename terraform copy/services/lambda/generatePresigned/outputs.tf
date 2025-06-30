output "function_name" {
  value = aws_lambda_function.generate_presigned.invoke_arn
}

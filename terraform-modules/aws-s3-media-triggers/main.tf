resource "aws_lambda_permission" "allow_thumbs_lambda_invocation" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_thumbnail_func_name
  principal     = "s3.amazonaws.com"
  source_arn    = var.bucket_media_arn
}

resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = var.bucket_media_id

  lambda_function {
    lambda_function_arn = var.lambda_thumbnail_arn
    events              = ["s3:ObjectCreated:*"]
  }
  depends_on = [aws_lambda_permission.allow_thumbs_lambda_invocation]
}

resource "aws_lambda_permission" "allow_post_update_lambda_invocation" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_post_func_name
  principal     = "s3.amazonaws.com"
  source_arn    = var.bucket_thumbnails_arn
}

resource "aws_s3_bucket_notification" "bucket_notification_post" {
  bucket = var.bucket_thumbnails_id

  lambda_function {
    lambda_function_arn = var.lambda_post_arn
    events              = ["s3:ObjectCreated:*"]
  }
  depends_on = [aws_lambda_permission.allow_post_update_lambda_invocation]
}
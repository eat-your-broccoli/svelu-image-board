output "media_bucket_url" {
    description = "url of the media bucket"
    value = "https://${aws_s3_bucket.media.bucket_regional_domain_name}"
}
output "thumbnails_bucket_url" {
    description = "url of the thumbnails bucket"
     value = "https://${aws_s3_bucket.thumbnails.bucket_regional_domain_name}"
}

output "media_bucket_name" {
  value = aws_s3_bucket.media.bucket_regional_domain_name
}

output "bucket_arns" {
  value = [aws_s3_bucket.media.arn, aws_s3_bucket.thumbnails.arn]
}
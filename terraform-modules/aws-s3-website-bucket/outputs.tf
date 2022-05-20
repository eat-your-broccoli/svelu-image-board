output "bucket_domain_name" {
    description = "Website bucket domain"
    value = aws_s3_bucket.website.website_endpoint
}
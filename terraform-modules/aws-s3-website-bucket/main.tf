
# bucket that hosts the website
resource "aws_s3_bucket" "website" {
    bucket = var.bucket_name
    tags = var.tags

    #site-config    defined down below
    #acl            defined down below
    #policy         defined down below
}

#website config for s3
resource "aws_s3_bucket_website_configuration" "site-config" {
  bucket = aws_s3_bucket.website.bucket

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }

  routing_rule {
    condition {
      key_prefix_equals = "/"
    }
    redirect {
      replace_key_prefix_with = "index.html"
    }
  }
}

#acl for bucket
resource "aws_s3_bucket_acl" "website-acl" {
  bucket = aws_s3_bucket.website.id
  acl    = "public-read"
}

# policy for the aws website bucket
resource "aws_s3_bucket_policy" "publicRead" {
  bucket = aws_s3_bucket.website.id
  policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
          {
            Sid = "PublicReadGetObject"
            Effect = "Allow"
            Principal = "*"
            Action="s3:GetObject"
            Resource = [
                aws_s3_bucket.website.arn, "${aws_s3_bucket.website.arn}/*",
            ]
          },
      ]
  })
}

# indexfile for the aws s3 bucket
resource "aws_s3_bucket_object" "indexfile" {
  bucket = aws_s3_bucket.website.id
  key = "index.html"
  acl = "public-read"
  source = var.html_source
  content_type = "text/html"

  etag = filemd5(var.html_source)
}
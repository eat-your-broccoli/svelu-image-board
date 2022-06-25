resource "aws_s3_bucket" "thumbnails" {
    bucket = var.bucket_name_thumbnails
    tags = var.tags_thumbnails

    #acl            defined down below
    #policy         defined down below
}

resource "aws_s3_bucket" "media" {
    bucket = var.bucket_name_media
    tags = var.tags_media

    #acl            defined down below
    #policy         defined down below
}

#acl for thumbnail bucket
resource "aws_s3_bucket_acl" "thumbnail-acl" {
  bucket = aws_s3_bucket.thumbnails.id
  acl    = "public-read"
}
#acl for media bucket
resource "aws_s3_bucket_acl" "media-acl" {
  bucket = aws_s3_bucket.media.id
  acl    = "public-read"
}

# policy for the aws thumbnail bucket
resource "aws_s3_bucket_policy" "publicRead-thumbnails" {
  bucket = aws_s3_bucket.thumbnails.id
  policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
          {
            Sid = "PublicReadGetObject"
            Effect = "Allow"
            Principal = "*"
            Action="s3:GetObject"
            Resource = [
                aws_s3_bucket.thumbnails.arn, "${aws_s3_bucket.thumbnails.arn}/*",
            ]
          },
      ]
  })
}
# policy for the aws media bucket
resource "aws_s3_bucket_policy" "publicRead-media" {
  bucket = aws_s3_bucket.media.id
  policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
          {
            Sid = "PublicReadGetObject"
            Effect = "Allow"
            Principal = "*"
            Action="s3:GetObject"
            Resource = [
                aws_s3_bucket.media.arn, "${aws_s3_bucket.media.arn}/*",
            ]
          },
      ]
  })
}


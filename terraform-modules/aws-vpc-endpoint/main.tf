
resource "aws_vpc_endpoint" "s3" {
  vpc_id = var.vpc_id
  service_name = "com.amazonaws.eu-central-1.s3"

  route_table_ids = [var.main_route_table_id]
}

resource "aws_vpc_endpoint_policy" "s3_endpoint_policy" {
  vpc_endpoint_id = aws_vpc_endpoint.s3.id
  policy = jsonencode({
  "Statement": [
    {
        "Sid":"AllowS3AccessInTrustedAccounts",
        "Principal": "*",
        "Effect":"Allow",
        "Action":[
           "s3:*"
        ],
        "Resource": var.bucket_arns
    }
  ]
})
}
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }
  }

  required_version = ">= 0.14.9"
}

provider "aws" {
  profile = "default"
  region  = "eu-central-1"
}


## S3 bucket for our website
module "website_bucket_s3" {
  source = "./terraform-modules/aws-s3-website-bucket"


  bucket_name = "website-bucket-s3"
  tags = {
      Name = "Static Website Bucket"
      Environment = "Terraform"
  }
  html_source = "website/index.html"
}

## relational database service (storing posts, tags, comments)
module "rds" {
  source = "./terraform-modules/aws-rds"
  rds_name = "myRDS"
  rds_user = "root"
  rds_password = "myTotallySecure36423674534723P4w0rdddd"
}


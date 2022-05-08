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
  source = "./modules/aws-s3-website-bucket"

  bucket_name = "website-bucket-s3"

  tags = {
      Name = "Static Website Bucket"
      Environment = "Terraform"
  }

  html_source = "website/index.html"
}
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }

    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.2.0"
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
    Name        = "Static Website Bucket"
    Environment = "Terraform"
  }
  html_source = "website/index.html"
}

# relational database service (storing posts, tags, comments)
module "rds" {
 source = "./terraform-modules/aws-rds"
 rds_name = "myRDS"
 rds_user = "root"
 rds_password = "myTotallySecure36423674534723P4w0rdddd"
}

### Lambda functions

resource "aws_s3_bucket" "lambda_bucket" {
  bucket = "bucket-lambda-rds-migration"
  acl           = "private"
  force_destroy = true
}

#### lambda function for rds migrations
module "lambda_rds_migration" {
  depends_on = [
    module.rds
  ]

  source      = "./terraform-modules/aws-lambda-rds-migration"
  bucket_id = aws_s3_bucket.lambda_bucket.id
  src_path    = "./rds-migrate"
  out_path    = "./terraform-modules/aws-lambda-rds-migration/rds/lambda-rds-migrate.zip"
  file_key    = "lambda-rds-migrate.zip"
  function_name = "LambdaRdsMigration"

  env_db_name = "${module.rds.rds_name}"
  env_db_pass = "${module.rds.rds_password}"
  env_db_user = "${module.rds.rds_user}"

  env_db_address = "${module.rds.rds_address}"
  env_db_port =  "${module.rds.rds_port}"
  

}

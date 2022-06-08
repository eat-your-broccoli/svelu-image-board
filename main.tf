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

module "vpc" {
  source = "./terraform-modules/aws-vpc-rds"
}


# ## S3 bucket for our website
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
  depends_on = [
    module.vpc
  ]
 source = "./terraform-modules/aws-rds"
 rds_name = "myRDS"
 rds_user = "root"
 rds_password = "myTotallySecure36423674534723P4w0rdddd"
 rds_vpc_id = module.vpc.vpc_id
 vpc_security_group_default_id = module.vpc.vpc_security_group_default_id
  aws_db_subnet_group_default_id = module.vpc.aws_db_subnet_group_default_id
  aws_security_group_rds_id = module.vpc.aws_security_group_rds_id
}

# ### Lambda functions

resource "aws_s3_bucket" "lambda_bucket" {
  bucket = "bucket-lambda-rds-migration"
  acl           = "private"
  force_destroy = true
}

#### lambda function for rds migrations
module "lambda_rds_migration" {
  depends_on = [
    module.rds,
    module.vpc
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

  rds_vpc_id = module.vpc.vpc_id
  aws_db_subnet_group_default_id = module.vpc.aws_db_subnet_group_default_id
  aws_subnet_rds_ids = module.vpc.aws_subnet_rds_ids
  aws_security_group_rds_id = module.vpc.aws_security_group_rds_id
  vpc_security_group_default_id = module.vpc.vpc_security_group_default_id
}

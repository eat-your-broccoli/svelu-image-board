terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.19"
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

# ## S3 bucket for our website
module "website_bucket_s3" {
  source = "./terraform-modules/aws-s3-website-bucket"
  bucket_name = "website-bucket-s3-sven"
  tags = {
    Name        = "Static Website Bucket"
    Environment = "Terraform"
  }
  html_source = "website/index.html"
}

module "media_buckets" {
  source = "./terraform-modules/aws-s3-media"
  bucket_name_media = "svelu-bucket-media"
  tags_media = {
    Name        = "Media Bucket"
    Environment = "Terraform"
  }
  bucket_name_thumbnails = "svelu-bucket-thumbnails"
  tags_thumbnails = {
    Name        = "Thumbnail Bucket"
    Environment = "Terraform"
  }
}

module "vpc" {
  source = "./terraform-modules/aws-vpc-rds"
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
  public = false
}

# ### Lambda functions

resource "aws_s3_bucket" "lambda_bucket" {
  bucket = "bucket-lambda-rds-migration-sven"
  acl           = "private"
  force_destroy = true
}

module lambdas {
  depends_on = [
    module.rds,
    module.vpc,
    module.media_buckets
  ]

  source      = "./terraform-modules/aws-lambdas"
  bucket_id = aws_s3_bucket.lambda_bucket.id
  src_path    = "./rds-migrate"
  out_path    = "./terraform-modules/aws-lambdas/api/lambdas-api.zip"
  file_key    = "lambdas-api.zip"

  lambdas = {
    GetPosts = {
      function_name = "GetPosts"
      timeout = 7
      handler =  "getPosts.lambdaHandler"
    }
    CreatePost = {
      function_name = "CreatePost"
      timeout = 7
      handler = "createPost.lambdaHandler"
    }
    GetCommentsForPost = {
      function_name = "GetCommentsForPost"
      timeout = 7
      handler =  "getCommentsForPost.lambdaHandler"
    }
    CreateComment = {
      function_name = "CreateComment"
      timeout = 7
      handler = "createComment.lambdaHandler"
    }
    CreateUser = {
      function_name = "CreateUser"
      timeout = 7
      handler = "createUser.handler"
    }
    CognitoPostConfirmationLambda = {
      function_name = "CognitoPostConfirmationLambda"
      timeout = 15
      handler = "cognitoConfirmCreateUser.handler"
    }
    CognitoPreTokenGen = {
      function_name = "CognitoPreTokenGen"
      timeout = 15
      handler = "cognitoPreTokenGen.handler"
    }
    RdsMigration = {
      function_name = "RdsMigration"
      timeout = 20
      handler = "index.handler"
    }
    MediaUploadHandler = {
      function_name = "MediaUploadHandler"
      timeout = 60
      handler = "handleMediaUpload.lambdaHandler"
    }
  }

  env_db_name = "${module.rds.rds_name}"
  env_db_pass = "${module.rds.rds_password}"
  env_db_user = "${module.rds.rds_user}"
  env_bucket_media = "${module.media_buckets.media_bucket_name}"

  env_db_address = "${module.rds.rds_address}"
  env_db_port =  "${module.rds.rds_port}"

  rds_vpc_id = module.vpc.vpc_id
  aws_db_subnet_group_default_id = module.vpc.aws_db_subnet_group_default_id
  aws_subnet_rds_ids = module.vpc.aws_subnet_rds_ids
  aws_security_group_rds_id = module.vpc.aws_security_group_rds_id
  vpc_security_group_default_id = module.vpc.vpc_security_group_default_id
}

module "api_gateway" {
  depends_on = [
    module.lambdas,
    module.cognito
  ]

  source = "./terraform-modules/aws-api-gateway"
  api_gateways = {
    GetPosts = {
      route_key = "GET /posts"
      integration_uri = lookup(module.lambdas.invoke_arn, "GetPosts")
      function_name = lookup(module.lambdas.function_name, "GetPosts")
    }
    CreatePost = {
      route_key = "POST /post"
      integration_uri = lookup(module.lambdas.invoke_arn, "CreatePost")
      function_name = lookup(module.lambdas.function_name, "CreatePost")
    }
    GetCommentsForPost = {
      route_key = "GET /post/{post}/comments"
      integration_uri = lookup(module.lambdas.invoke_arn, "GetCommentsForPost")
      function_name = lookup(module.lambdas.function_name, "GetCommentsForPost")
    }
    CreateComment = {
      route_key = "POST /post/{post}/comment"
      integration_uri = lookup(module.lambdas.invoke_arn, "CreateComment")
      function_name = lookup(module.lambdas.function_name, "CreateComment")
    }
    UploadMedia = {
      route_key = "PUT /post"
      integration_uri = lookup(module.lambdas.invoke_arn, "MediaUploadHandler")
      function_name = lookup(module.lambdas.function_name, "MediaUploadHandler")
    }
  }
  cognito_user_pool_client_id = module.cognito.cognito_ClientID
  cognito_user_pool_endpoint = module.cognito.cognito_domain
}


module "lambda_rds_migration_invocation" {
  depends_on = [
    module.lambdas
  ]
  source = "./terraform-modules/aws-lambda-rds-migration-invocation"
  lambda_func_name = lookup(module.lambdas.function_name, "RdsMigration")
}

module "cognito" {
  depends_on = [
    module.lambdas
  ]
  source = "./terraform-modules/aws-cognito"
  post_confirmation_lambda_arn = lookup(module.lambdas.arn, "CognitoPostConfirmationLambda")
  post_confirmation_lambda_function_name = "CognitoPostConfirmationLambda"

  pre_token_generation_lambda_arn = lookup(module.lambdas.arn, "CognitoPreTokenGen")
  pre_token_generation_lambda_func_name = "CognitoPreTokenGen"
}
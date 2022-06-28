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
  region  = var.region
}

data "aws_region" "current" {}

# ## S3 bucket for our website
module "website_bucket_s3" {
  depends_on = [
    module.cognito, # we need to wait for cognito for the user pool id
    module.api_gateway # we need to wait for api_gateway for the url to the endpoint
  ]
  source = "./terraform-modules/aws-s3-website-bucket"
  bucket_name = var.bucket_name_website
  tags = {
    Name        = "Static Website Bucket"
    Environment = "Terraform"
  }
  app_path    = "./cloud-computing-app"
  out_path    = "./cloud-computing-app/build"
}

module "media_buckets" {
  source = "./terraform-modules/aws-s3-media"
  bucket_name_media = var.bucket_name_media
  tags_media = {
    Name        = "Media Bucket"
    Environment = "Terraform"
  }
  bucket_name_thumbnails = var.bucket_name_thumbnails
  tags_thumbnails = {
    Name        = "Thumbnail Bucket"
    Environment = "Terraform"
  }
}

module "vpc" {
  source = "./terraform-modules/aws-vpc-rds"
}

module "vpc_endpoint" {
  source = "./terraform-modules/aws-vpc-endpoint"
  depends_on = [
    module.media_buckets,
    module.vpc
  ]
  bucket_arns = module.media_buckets.bucket_arns_for_policy
  vpc_id = module.vpc.vpc_id
  main_route_table_id = module.vpc.main_route_table_id
}

# relational database service (storing posts, tags, comments)
module "rds" {
  depends_on = [
    module.vpc
  ]
  source = "./terraform-modules/aws-rds"
  rds_name = "myRDS"
  rds_user = "root"
  rds_password = var.rds_root_password
  rds_vpc_id = module.vpc.vpc_id
  vpc_security_group_default_id = module.vpc.vpc_security_group_default_id
  aws_db_subnet_group_default_id = module.vpc.aws_db_subnet_group_default_id
  aws_security_group_rds_id = module.vpc.aws_security_group_rds_id
  public = false
  is_delete_protected = var.rds_is_delete_protected
}

# ### Lambda functions

resource "aws_s3_bucket" "lambda_bucket" {
  bucket = var.bucket_name_lambdas
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
  out_path    = "./terraform-modules/aws-lambdas/api/"
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
      timeout = 20
      handler = "handleMediaUpload.lambdaHandler"
    }
    CreateThumbnail = {
      function_name = "CreateThumbnail"
      timeout = 20
      handler = "thumbnailGeneration.handler"
    }
    PostEntryUpdater = {
      function_name = "PostEntryUpdater"
      timeout = 20
      handler = "postEntryUpdater.lambdaHandler"
    }
  }

  env_db_name = "${module.rds.rds_name}"
  env_db_pass = "${module.rds.rds_password}"
  env_db_user = "${module.rds.rds_user}"
  env_bucket_media = "${var.bucket_name_media}"
  env_bucket_thumbnails = "${var.bucket_name_thumbnails}"
  env_bucket_media_url = "${module.media_buckets.media_bucket_url}"
  env_bucket_thumbnails_url = "${module.media_buckets.thumbnails_bucket_url}"
  
  env_db_address = "${module.rds.rds_address}"
  env_db_port =  "${module.rds.rds_port}"

  rds_vpc_id = module.vpc.vpc_id
  aws_db_subnet_group_default_id = module.vpc.aws_db_subnet_group_default_id
  aws_subnet_rds_ids = module.vpc.aws_subnet_rds_ids
  aws_security_group_rds_id = module.vpc.aws_security_group_rds_id
  vpc_security_group_default_id = module.vpc.vpc_security_group_default_id
}

module "media_bucket_triggers" {
  depends_on = [
    module.lambdas,
    module.media_buckets
  ]
  source = "./terraform-modules/aws-s3-media-triggers"
  lambda_thumbnail_func_name = lookup(module.lambdas.function_name, "CreateThumbnail")
  lambda_thumbnail_arn = lookup(module.lambdas.arn, "CreateThumbnail")
  bucket_media_arn = module.media_buckets.media_bucket_arn
  bucket_media_id = var.bucket_name_media

  lambda_post_func_name = lookup(module.lambdas.function_name, "PostEntryUpdater")
  lambda_post_arn = lookup(module.lambdas.arn, "PostEntryUpdater")
  bucket_thumbnails_arn = module.media_buckets.thumbnails_bucket_arn
  bucket_thumbnails_id = var.bucket_name_thumbnails
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
  CORS_allowed_origins = concat(var.cors_local_dev, ["https://${var.bucket_name_website}.s3.${var.region}.amazonaws.com", "https://${var.bucket_name_website}.s3.${var.region}.amazonaws.com/"])
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
    module.lambdas #some lambdas are triggered by cognito actions
  ]
  source = "./terraform-modules/aws-cognito"
  post_confirmation_lambda_arn = lookup(module.lambdas.arn, "CognitoPostConfirmationLambda")
  post_confirmation_lambda_function_name = "CognitoPostConfirmationLambda"

  pre_token_generation_lambda_arn = lookup(module.lambdas.arn, "CognitoPreTokenGen")
  pre_token_generation_lambda_func_name = "CognitoPreTokenGen"
  cognito_domain = var.cognito_domain
}
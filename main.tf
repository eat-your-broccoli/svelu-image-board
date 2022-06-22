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


  bucket_name = "website-bucket-s3"
  tags = {
    Name        = "Static Website Bucket"
    Environment = "Terraform"
  }
  html_source = "website/index.html"
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

module lambda_api {
  depends_on = [
    module.rds,
    module.vpc
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
      handler =  "getPosts.handler"
    }
    CreatePost = {
      function_name = "CreatePost"
      timeout = 7
      handler = "createPost.handler"
    }
    GetCommentsForPost = {
      function_name = "GetCommentsForPost"
      timeout = 7
      handler =  "getCommentsForPost.handler"
    }
    CreateComment = {
      function_name = "CreateComment"
      timeout = 7
      handler = "createComment.handler"
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
    # CognitoPostAuthLambda = {
    #   function_name = "CognitoPostAuthLambda"
    #   timeout = 7
    #   handler = "cognitoPostAuth.handler"
    # }
  }

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

module "api_gateway" {
  depends_on = [
    module.lambda_api,
    module.cognito
  ]

  source = "./terraform-modules/aws-api-gateway"
  api_gateways = {
    GetPosts = {
      route_key = "GET /posts"
      integration_uri = lookup(module.lambda_api.invoke_arn, "GetPosts")
      function_name = lookup(module.lambda_api.function_name, "GetPosts")
    }
    CreatePost = {
      route_key = "POST /post"
      integration_uri = lookup(module.lambda_api.invoke_arn, "CreatePost")
      function_name = lookup(module.lambda_api.function_name, "CreatePost")
    }
    CreateUser = {
      route_key = "POST /user"
      integration_uri = lookup(module.lambda_api.invoke_arn, "CreateUser")
      function_name = lookup(module.lambda_api.function_name, "CreateUser")
    }
    GetCommentsForPost = {
      route_key = "GET /post/:post/comments"
      integration_uri = lookup(module.lambda_api.invoke_arn, "GetCommentsForPost")
      function_name = lookup(module.lambda_api.function_name, "GetCommentsForPost")
    }
    CreateComment = {
      route_key = "POST /post/:post/comment"
      integration_uri = lookup(module.lambda_api.invoke_arn, "CreateComment")
      function_name = lookup(module.lambda_api.function_name, "CreateComment")
    }
  }
  cognito_user_pool_client_id = module.cognito.cognito_ClientID
  cognito_user_pool_endpoint = module.cognito.cognito_domain
}


module "lambda_rds_migration_invocation" {
  depends_on = [
    module.lambda_rds_migration
  ]
  source = "./terraform-modules/aws-lambda-rds-migration-invocation"
  lambda_func_name = module.lambda_rds_migration.lambda_func_name
}

module "cognito" {
  depends_on = [
    module.lambda_api
  ]
  source = "./terraform-modules/aws-cognito"
  post_confirmation_lambda_arn = lookup(module.lambda_api.arn, "CognitoPostConfirmationLambda")
  post_confirmation_lambda_function_name = "CognitoPostConfirmationLambda"

  # post_auth_lambda_arn = lookup(module.lambda_api.arn, "CognitoPostAuthLambda")
  # post_auth_lambda_function_name = "CognitoPostAuthLambda"
}
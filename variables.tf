variable "bucket_name_media" {}
variable "bucket_name_thumbnails" {}
variable "bucket_name_website" {}
variable "bucket_name_lambdas" {}
variable "cognito_domain" {}
variable "rds_root_password" {}
variable "rds_is_delete_protected" {
    default = false
}

## allow local environment access to API 
variable "cors_local_dev" {
  type = list(string)
  default = []
}

variable "region" {
  type=string
  default = "eu-central-1"
}
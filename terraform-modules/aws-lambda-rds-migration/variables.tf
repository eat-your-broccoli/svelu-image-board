variable "bucket_id"{
    description = "s3 bucket id for storing lambdas"
    type = string
}

variable "src_path"{
    description = "source path to lambda func"
    type = string
}

variable "out_path"{
    description = "out path for zip lambda files"
    type = string
}

variable "file_key"{
    description = "the name of the zip file"
    type = string
}

variable "function_name" {
  description = "unique name of the function"
  type = string
}

variable "env_db_name" {
  description = "database name"
  type = string
}

variable "env_db_user" {
  description = "database user"
  type = string
}

variable "env_db_pass" {
  description = "database password"
  type = string
}

variable "env_db_address" {
  description = "database address"
  type = string
}

variable "env_db_port" {
  description = "database port"
  type = string
}

variable "rds_vpc_id" {
  description = "rds vpc id"
  type = string
}

variable "aws_db_subnet_group_default_id" {}
variable "aws_subnet_rds_ids" {}
variable "aws_security_group_rds_id" {}
variable "vpc_security_group_default_id" {}




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







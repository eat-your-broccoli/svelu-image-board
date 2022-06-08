variable "rds_name"{
    description = "Name of the RDS"
    type = string
}

variable "rds_user"{
    description = "Root user"
    type = string
}

variable "rds_password"{
    description = "password of the root user"
    type = string
}

variable "rds_vpc_id" {
  description = "id of vpc"
  sensitive   = true
}

variable "vpc_security_group_default_id" {
  description = "id of vpc"
  sensitive   = true
}

variable "aws_db_subnet_group_default_id" {}
variable "aws_security_group_rds_id" {}

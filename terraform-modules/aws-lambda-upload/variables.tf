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


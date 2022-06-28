variable "bucket_name"{
    description = "Unique s3 bucket name"
    type = string
}

variable "tags" {
    description = "Tags to set on the bucket"
    type = map(string)
    default = {}
}

variable "app_path" {
  description = "path to the app, here npm run build will be executed"
  type = string
}

variable "out_path" {
  description = "path to the build app"
  type = string
}


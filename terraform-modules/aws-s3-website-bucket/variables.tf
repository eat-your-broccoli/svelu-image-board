variable "bucket_name"{
    description = "Unique s3 bucket name"
    type = string
}

variable "tags" {
    description = "Tags to set on the bucket"
    type = map(string)
    default = {}
}

variable "html_source" {
  description = "Source path to the html souce, e.g Dir/index.html"
  type = string
}
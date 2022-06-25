variable "bucket_name_thumbnails" {
  description = "bucket name of the thumbnail bucket"
  type = string
}

variable "bucket_name_media" {
  description = "bucket name of the media bucket"
  type = string
}

variable "tags_media" {
    description = "Tags to set on the media bucket"
    type = map(string)
    default = {}
}

variable "tags_thumbnails" {
    description = "Tags to set on the thumbnails bucket"
    type = map(string)
    default = {}
}
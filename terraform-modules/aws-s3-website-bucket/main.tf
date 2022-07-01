
# bucket that hosts the website
resource "aws_s3_bucket" "website" {
    bucket = var.bucket_name
    tags = var.tags

    #site-config    defined down below
    #acl            defined down below
    #policy         defined down below
}

#website config for s3
resource "aws_s3_bucket_website_configuration" "site-config" {
  bucket = aws_s3_bucket.website.bucket

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }

  routing_rule {
    redirect {
      replace_key_prefix_with = "/index.html"
    }
  }
}

#acl for bucket
resource "aws_s3_bucket_acl" "website-acl" {
  bucket = aws_s3_bucket.website.id
  acl    = "public-read"
}

# policy for the aws website bucket
resource "aws_s3_bucket_policy" "publicRead" {
  bucket = aws_s3_bucket.website.id
  policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
          {
            Sid = "PublicReadGetObject"
            Effect = "Allow"
            Principal = "*"
            Action="s3:GetObject"
            Resource = [
                aws_s3_bucket.website.arn, "${aws_s3_bucket.website.arn}/*",
            ]
          },
      ]
  })
}



locals {
  website_packageJSON_sha1  = sha1(filesha1("${var.app_path}/package.json"))
  # npm does not produce deterministic hash results
  # e.g. changed hash triggers npm install, which changes hash, which triggers npm install, changes hash ... ... ... 
  # that's why we only count files
  website_node_modules_sha1 = length(fileset(path.root, "${var.app_path}/node_modules/**"))
  website_dir_sha1    = sha1(join("", [for f in fileset(path.root, "${var.app_path}/src/**") : filesha1(f)]))
  website_dir_public_sha1 = sha1(join("", [for f in fileset(path.root, "${var.app_path}/public/**") : filesha1(f)]))
  website_dir_dist_sha1 = sha1(join("", [for f in fileset(path.root, "${var.app_path}/build/**") : filesha1(f)]))
}

// installing dependencies
resource "null_resource" "npm_dependencies" {
  provisioner "local-exec" {
    command = "cd ${var.app_path} && npm install"
  }

  triggers = {
    runs_always = "${timestamp()}" // executes every time because timestamp changes
    # dir_node_modules    = local.website_node_modules_sha1
    # packageJSON_sha1    = local.website_packageJSON_sha1
  }
}

// building app dependencies
resource "null_resource" "build_app" {
  depends_on = [
    null_resource.npm_dependencies
  ]
  provisioner "local-exec" {
    command = "cd ${var.app_path} && npm run build"
  }

  triggers = {
    runs_always = "${timestamp()}" // executes every time because timestamp changes
    # dir_sha1    = local.website_dir_sha1
    # dir_public_sha1    = local.website_dir_public_sha1
    # dir_node_modules    = local.website_node_modules_sha1
  }
}

resource "null_resource" "remove_and_upload_to_s3" {
  depends_on = [
    aws_s3_bucket.website,
    null_resource.build_app
  ]
  provisioner "local-exec" {
    command = "aws s3 sync ${var.out_path} s3://${aws_s3_bucket.website.id}"
  }
  triggers = {
    runs_always = "${timestamp()}"
  }
}
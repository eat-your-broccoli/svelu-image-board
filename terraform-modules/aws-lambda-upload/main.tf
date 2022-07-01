
locals {
  packageJSON_sha1  = sha1(join("", [for f in fileset(path.root, "${var.src_path}/package*.json") : filesha1(f)]))
  node_modules_sha1 = length(fileset(path.root, "${var.src_path}/node_modules/*"))
  src_dir_sha1 = sha1(join("", [for f in fileset(path.root, "${var.src_path}/src/**") : filesha1(f)]))
}

// installing dependencies
resource "null_resource" "lambda_dependencies" {
  provisioner "local-exec" {
    command = "cd ${var.src_path} && rm -rf node_modules/sharp && npm install --arch=x64 --platform=linux --libc=glibc sharp && npm install"
    # yeah ... so basically sharp under windows != sharp under linux. so ... either we do this ... or there are no thumbnails :(
  }

  triggers = {
    runs_always = "${timestamp()}" // executes every time because timestamp changes
    # packageJSON_sha1  = local.packageJSON_sha1
    # node_modules      = local.node_modules_sha1
  }
}

# this little fella here aaaaaaaalways runs
# this means, its hash will always change
# which means, it will be uploaded on every terraform apply
# which is something I (Luca) don't like
# rant continues at null_resource.remove_and_upload_to_s3
data "archive_file" "archive" {
  type = "zip"

  source_dir  = "${var.src_path}"
  output_path = "${var.out_path}${var.file_key}"
  excludes = ["test/", ".env", ".env.example", "docker-compose.yml"]
  depends_on = [
    null_resource.lambda_dependencies
  ]
}

# archive file uploads every time if we'd use aws_s3_object
# so ... let's use a null resource, and sync the folder of the archive file
# ONLY when triggers fire
resource "null_resource" "remove_and_upload_to_s3" {
  depends_on = [
    data.archive_file.archive
  ]
  provisioner "local-exec" {
    command = "ls ${var.out_path} && aws s3 sync ${var.out_path} s3://${var.bucket_id}"
  }
  triggers = {
    runs_always = "${timestamp()}"
    packageJSON_sha1 = local.packageJSON_sha1
    node_modules_sha1 = local.node_modules_sha1
    src_dir_sha1 = local.src_dir_sha1
  }
}
output "file_key" {
    value = var.file_key
}

output "archive_hash" {
    value = data.archive_file.archive.output_base64sha256
}
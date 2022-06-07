output "rds_address" {
  description = "RDS instance hostname"
  value       = aws_db_instance.myDB.address
  sensitive   = true
}

output "rds_port" {
  description = "RDS instance port"
  value       = aws_db_instance.myDB.port
  sensitive   = true
}

output "rds_password" {
  description = ""
  value       = var.rds_password
  sensitive   = true
}

output "rds_user" {
  description = ""
  value       = var.rds_user
  sensitive   = true
}

output "rds_name" {
  description = ""
  value       = var.rds_name
  sensitive   = true
}





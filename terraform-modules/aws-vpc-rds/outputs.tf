output "vpc_id" {
  description = ""
  value       = aws_vpc.vpc.id
  sensitive   = true
}

output "vpc_security_group_default_id" {
  description = ""
  value       = aws_security_group.default.id
  sensitive   = true
}

output "aws_subnet_rds_ids" {
  description = ""
  value       = aws_subnet.rds.*.id
  sensitive   = true
}


output "aws_db_subnet_group_default_id" {
  description = ""
  value       = aws_db_subnet_group.default.id
  sensitive   = true
}
output "aws_security_group_rds_id" {
  description = ""
  value       = aws_security_group.rds.id
  sensitive   = true
}



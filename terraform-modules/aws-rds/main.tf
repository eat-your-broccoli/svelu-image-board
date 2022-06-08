
# resource "aws_subnet" "rds" {
#   count                   = "${length(data.aws_availability_zones.available.names)}"
#   vpc_id                  = var.rds_vpc_id
#   cidr_block              = "10.0.${length(data.aws_availability_zones.available.names) + count.index}.0/24"
#   map_public_ip_on_launch = true
#   availability_zone       = "${element(data.aws_availability_zones.available.names, count.index)}"
#   tags = {
#     Name = "rds-${element(data.aws_availability_zones.available.names, count.index)}"
#   }
# }

# resource "aws_db_subnet_group" "default" {
#   name        = "svelu-rds-subnet-group"
#   description = "Terraform example RDS subnet group"
#   subnet_ids  = flatten(["${aws_subnet.rds.*.id}"]) # flatten the nested array caused by
# }

# resource "aws_security_group" "rds" {
#   name        = "svelu_rds_security_group"
#   description = "Terraform example RDS MySQL server"
#   vpc_id      = var.rds_vpc_id
#   # Keep the instance private by only allowing traffic from the web server.
#   ingress {
#     from_port       = 3306
#     to_port         = 3306
#     protocol        = "tcp"
#     security_groups = [var.vpc_security_group_default_id]
#   }
#   # Allow all outbound traffic.
#   egress {
#     from_port   = 0
#     to_port     = 0
#     protocol    = "-1"
#     cidr_blocks = ["0.0.0.0/0"]
#   }
#   tags = {
#     Name = "svelu-rds-security-group"
#   }
# }


resource "aws_db_instance" "myDB" {
  allocated_storage    = 7 // 1GB of storage
  engine               = "mysql"
  engine_version       = "5.7"
  instance_class       = "db.t2.micro" // instance covered by aws free tier
  name                 = var.rds_name
  username             = var.rds_user
  password             = var.rds_password
  parameter_group_name = "default.mysql5.7"
  skip_final_snapshot  = true
  // availability_zone    = "eu-central-1"
  publicly_accessible  = false

  # db_subnet_group_name      = "${aws_db_subnet_group.default.id}"
  # vpc_security_group_ids    = ["${aws_security_group.rds.id}"]
  db_subnet_group_name      = var.aws_db_subnet_group_default_id
  vpc_security_group_ids    = [var.aws_security_group_rds_id]
}
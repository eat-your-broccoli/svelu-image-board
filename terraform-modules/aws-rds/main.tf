
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
  publicly_accessible  = var.public

  # db_subnet_group_name      = "${aws_db_subnet_group.default.id}"
  # vpc_security_group_ids    = ["${aws_security_group.rds.id}"]
  db_subnet_group_name      = var.aws_db_subnet_group_default_id
  vpc_security_group_ids    = [var.aws_security_group_rds_id]
}
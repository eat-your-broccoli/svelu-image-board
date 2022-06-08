# create a VPC
resource "aws_vpc" "vpc" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "svelu-rds-vpc"
  }
}

# create a gateway to grant the vpc acccess to the internet
resource "aws_internet_gateway" "gateway" {
  vpc_id = "${aws_vpc.vpc.id}"

  tags = {
    Name = "svelu-rds-vpc-internet-gateway"
  }
}

# vpc has access to main route table
resource "aws_route" "route" {
  route_table_id         = "${aws_vpc.vpc.main_route_table_id}"
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = "${aws_internet_gateway.gateway.id}"
}

resource "aws_subnet" "main" {
  count                   = "${length(data.aws_availability_zones.available.names)}"
  vpc_id                  = "${aws_vpc.vpc.id}"
  cidr_block              = "10.0.${count.index}.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${element(data.aws_availability_zones.available.names, count.index)}"

  tags = {
    Name = "public-${element(data.aws_availability_zones.available.names, count.index)}"
  }
}

resource "aws_security_group" "default" {
  name        = "terraform_security_group"
  description = "svelu-rds-vpc-security group"
  vpc_id      = "${aws_vpc.vpc.id}"

  # Allow outbound internet access.
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags =  {
    Name = "svelu-rds-vpc-security-group"
  }
}


resource "aws_subnet" "rds" {
  count                   = "${length(data.aws_availability_zones.available.names)}"
  vpc_id                  = aws_vpc.vpc.id
  cidr_block              = "10.0.${length(data.aws_availability_zones.available.names) + count.index}.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${element(data.aws_availability_zones.available.names, count.index)}"
  tags = {
    Name = "rds-${element(data.aws_availability_zones.available.names, count.index)}"
  }
}

resource "aws_db_subnet_group" "default" {
  name        = "svelu-rds-subnet-group"
  description = "Terraform example RDS subnet group"
  subnet_ids  = flatten(["${aws_subnet.rds.*.id}"]) # flatten the nested array caused by .*.id
}

resource "aws_security_group" "rds" {
  name        = "svelu_rds_security_group"
  description = "Terraform example RDS MySQL server"
  vpc_id      = aws_vpc.vpc.id
  # Keep the instance private by only allowing traffic from the web server.
  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.default.id]
  }
  # Allow all outbound traffic.
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name = "svelu-rds-security-group"
  }
}
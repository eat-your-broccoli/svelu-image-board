# svelu cloud computing project

This project contains an imageboard hosted on AWS cloud infrastructure. Setup is done using terraform.

## Setup

### AWS credentials

- Install aws CLI
  - set aws credentials, e.g. using `aws configure`


### vars.tfvars
- copy the file `vars.tfvars.example` to `vars.tfvars`
- fill out variables


## Run

run `terraform apply -auto-approve -var-file="vars.tfvars"`

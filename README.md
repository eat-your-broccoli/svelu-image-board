# svelu cloud computing project

This project contains an imageboard hosted on AWS cloud infrastructure. Setup is done using terraform.

## Setup

### npm 

Install npm

### AWS credentials

- Install aws CLI
  - set aws credentials, e.g. using `aws configure`


### vars.tfvars
- copy the file `vars.tfvars.example` to `vars.tfvars`
- fill out variables


## Run

run `terraform apply -auto-approve -var-file="vars.tfvars"`


## Troubleshooting

### *lambda dependency sharp in module.lambdas*

TL;DR: If you're on windows, run `terraform apply` in a shell that supports the `rm` command, e.g. `git bash`.

sharp is an image manipulation library. It depends under the hood on os-specific files. If you would install sharp on your windows machine, and then deploy it to AWS, it would crash at creating a thumbnail. Thus, on `terraform apply` we run `null_resource.lambda_dependencies` in `module.lambdas`. This will run a script that first deletes the `node_modules/sharp` folder, and then install the linux specific dependencies.
If you run terraform from e.g. cmd or powershell, this will fail because it doesn't support `rm` command. 

### *thumbnailGeneration.js crashes on my machine*

TL;DR: you're using windows, but the library sharp has linux-specific dependencies installed 

Explanaition in the issue above

Delete `node_modules/sharp` folder. Run `npm install`.

### *I get CORS errors when I develop locally*

Add your local environment in `vars.tfvars` under `cors_local_dev`. E.g. `http://localhost:3000`.
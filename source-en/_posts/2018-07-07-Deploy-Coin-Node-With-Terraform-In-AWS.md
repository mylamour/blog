---
layout: post
title: Deploy Cryptocurrency Wallet Nodes Across Multiple AWS Regions with Terraform
categories: Security Engineer
kerywords: 自动化运维 AWS Terraform Coin
tags: AWS IAC Tools
translated: true
---

Demo code for deploying cryptocurrency nodes across multiple AWS regions with Terraform is [here](https://github.com/mylamour/devops-note/tree/master/terraform/cryptocoin).

The directory structure looks like this:
![image](https://img.iami.xyz/images/42406498-7e8ced92-81db-11e8-891e-f2daf1420437.png)

The idea is simple: put each coin's deployment scripts in its own folder, then call each module from `main.tf`. This isn't for mining — it's purely for syncing wallet nodes. Deploying across multiple regions keeps the nodes as up-to-date as possible with the latest blocks. You can also spin up multiple instances per region if needed.

```hcl
module "coinnode-us-east-1" {
  source = "coin/btc"
  region = "us-east-1"
}

module "coinnode-us-east-2" {
  source = "coin/btc"
  region = "us-east-2"
}

module "coinnode-us-west-1" {
 source = "coin/krb"
 region = "us-west-1"
}

module "coinnode-us-west-1" {
 source = "coin/krb"
 region = "us-west-1"
}
```

Let's walk through a single example — using KRB (Karbo) as the case study:

* module.tf
```hcl
// Search for the AMI
data "aws_ami" "default" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu-xenial-16.04*"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }

// Set up the instance

resource "aws_instance" "karbo" {
  ami                = "${data.aws_ami.default.id}"
  instance_type      = "t2.micro"
  vpc_security_group_ids = ["${aws_security_group.karbo.id}"]
  key_name = "${aws_key_pair.local.key_name}"
  
  tags {
    Name = "coinnode-karbo"
  }

  provisioner "local-exec" {
    command = "echo ${aws_instance.karbo.public_ip} >> ip_address.txt"
  }
  
  connection {
    type     = "ssh"
    user     = "ubuntu"
    private_key = "${file("~/.ssh/id_rsa")}"
  }

  provisioner "file" {
    source      = "scripts/krb/install_krb.sh"
    destination = "/tmp/install_krb.sh"
  }

  provisioner "remote-exec" {
    inline = [
      "sudo bash /tmp/install_krb.sh" ,
      "nohup karbowanecd &>/dev/null &" ,
      "sleep 1",
    ]
  }
}
```

* vpc.tf

```hcl

resource "aws_security_group" "karbo" {
    name = "karbo"
    description = "Karbo Coin Vpc Rules"

    ingress {
        from_port = 22
        to_port = 22
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    ingress {//p2p
        from_port = 32347
        to_port = 32347
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    ingress {//rpc
        from_port = 32348
        to_port = 32348
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    egress {
        from_port = 0
        to_port = 65535
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    tags {
        Name = "Karbo"
    }
}

```

# Note

* When deploying across multiple regions, the same AMI can have different image IDs in different regions — so don't hardcode the AMI ID. Use filter-based lookups instead.
* For security groups, only open what you actually need: the RPC port, the P2P port, and maybe a custom service port restricted to specific IPs. Don't leave unnecessary ports open.
* If you have GuardDuty enabled, all the traffic from node syncing will get flagged as suspicious. With SNS configured on top, you'll get notified on every single sync... heads up.
* When running non-background processes with Terraform provisioners, add a `sleep` after launching them. Otherwise Terraform exits the build before the remote server has a chance to finish executing the script.
* Every `.tf` file in the current directory gets executed. Using different filenames to separate concerns is just a code organization convention — Terraform doesn't care about the names.

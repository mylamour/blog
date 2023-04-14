---
layout: post
title: 使用Terraform在AWS多区部署虚拟货币钱包节点
categories: 安全工程师
kerywords: 自动化运维 AWS Terraform Coin
tags: 安全运维 AWS Terraform
---

Terrafrom多区部署虚拟货币的demo代码详见[这里](https://github.com/mylamour/devops-note/tree/master/terraform/cryptocoin)
目录结构如下:
![image](https://img.iami.xyz/images/42406498-7e8ced92-81db-11e8-891e-f2daf1420437.png)

只需将每个货币的部署方式和脚本实现放在对应的不同文件夹下，然后在main.tf进行每个模块的调用即可。当然，这只是为了钱包节点的同步，而不是为了挖矿。采用多区同步用于确保尽可能的使节点能够同步到最新的区块。当然还可以在每个区设置多台，然后多区部署。

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

下面看一下单独的一个示例，采用krb作为示例研究：
* module.tf 部分
```hcl
// 搜索AMI服务器镜像
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

// 设置实例

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

* 多区部署时，不像单独区一样，可能每个区对应同一个镜像的镜像id不同，所以不能采用固定的ip进行匹配，而是要采用搜索过滤的方式得到需要的
* 安全组的配置只允许对应的出入，rpc端口和p2p端口，或者再允许一个自定义的服务端口(只允许来自某些特定Ip)，不要开无必要的端口。
* 如果配置了GuardDuty，所有来自节点的同步将被认为危险的，配置了sns之后，每次同步都会被通知...
* 使用terraform执行非后台进程任务要留出sleep时间，供远端服务器执行代码。否则会退出构建过程。
* 反是当前目录下的tf文件都会执行的。不同的文件名标识其功能只是为了更好的编码。


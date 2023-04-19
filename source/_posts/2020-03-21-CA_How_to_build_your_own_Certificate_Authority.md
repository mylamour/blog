---
layout: post
title: How to build your own Certificate Authority
categories: 安全工程师
kerywords: 证书 CA Cert
tags: 数据安全 工具 旧文迁移
---

![image](https://img.iami.xyz/images/77220702-c5b0be00-6b7d-11ea-85cf-535409cb44b6.png)

# With Vault

Actually, i don't want repeat it again. so, please follow this documents: `https://learn.hashicorp.com/vault/secrets-management/sm-pki-engine`

You have three choices:

1. GUI
2. API
3. CLI

And finally, you would see that:

<img width="1652" alt="Screen Shot 2020-03-21 at 2 06 13 PM" src="https://img.iami.xyz/images/77220664-6b176200-6b7d-11ea-8c7b-82c81732a343.png">

<img width="1196" alt="Screen Shot 2020-03-21 at 2 08 51 PM" src="https://img.iami.xyz/images/77220704-c77a8180-6b7d-11ea-8d62-9a635abf3c91.png">

<img width="1165" alt="Screen Shot 2020-03-21 at 2 11 51 PM" src="https://img.iami.xyz/images/77220776-4ec7f500-6b7e-11ea-8a85-1ead1c26c13e.png">



# With Openssl

```bash
$ openssl genrsa -des3 -out rootCA.key 4096
$ openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 1024 -out rootCA.crt
$ openssl genrsa -out 91sec.vip.key 2048
$ openssl req -new -key 91sec.vip.key -out 91sec.vip.csr
$ openssl x509 -req -in 91sec.vip.csr -CA rootCA.crt -CAkey rootCA.key -CAcreateserial -out 91sec.vip.crt -days 500 -sha256
```


<img width="444" alt="Screen Shot 2020-03-21 at 2 24 14 PM" src="https://img.iami.xyz/images/77220903-aa46b280-6b7f-11ea-9589-05c2173ce9ba.png">
<img width="496" alt="Screen Shot 2020-03-21 at 2 25 51 PM" src="https://img.iami.xyz/images/77221017-b8e19980-6b80-11ea-8b73-22d39cb87eff.png">
<img width="502" alt="Screen Shot 2020-03-21 at 2 49 16 PM" src="https://img.iami.xyz/images/77221251-2d1d3c80-6b83-11ea-9033-ec34fa27c956.png">


# Install Root CA in Server

* Ubuntu

```bash
$ sudo mkdir /usr/share/ca-certificates/extra
$ sudo cp foo.crt /usr/share/ca-certificates/extra/foo.crt                    #Copy the CA .crt file to this directory
$ sudo dpkg-reconfigure ca-certificates                   #add the .crt file's path relative to /usr/share/ca-certificates to /etc/ca-certificates.conf
```

* Centos

```bash
$ sudo cp foo.crt /etc/pki/tls/certs/ca-bundle.crt
$ update-ca-trust enable
$ update-ca-trust extract
```

Also, you can install CA to gold image

# Resources

* [Build Your Own Certificate Authority (CA)](https://learn.hashicorp.com/vault/secrets-management/sm-pki-engine)
* [Self Signed Certificate with Custom Root CA](https://gist.github.com/fntlnz/cf14feb5a46b2eda428e000157447309)
* [本地建立CA签发数字证书](https://note.qidong.name/2019/01/local-certification-agent/)
* [Opensll Certificate authority](https://jamielinux.com/docs/openssl-certificate-authority)
* [How to create self signed certificate with openssl](https://stackoverflow.com/questions/10175812/how-to-create-a-self-signed-certificate-with-openssl)
* [ Install root ca in ubuntu](https://askubuntu.com/questions/73287/how-do-i-install-a-root-certificate)
* [Install root ca in centos](https://techjourney.net/update-add-ca-certificates-bundle-in-redhat-centos/)
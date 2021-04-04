---
layout: post
title: 【CA】How to install root CA in your server?
categories: 安全工程师
kerywords: 证书 CA Cert 
tags: PKI 证书 安全随笔
---

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
* [ Install root ca in ubuntu](https://askubuntu.com/questions/73287/how-do-i-install-a-root-certificate)
* [Install root ca in centos](https://techjourney.net/update-add-ca-certificates-bundle-in-redhat-centos/)
---
translated: true
layout: post
title: Build a internal CA with Openssl and SoftHsm2
categories: Security Engineer
kerywords: 证书 CA Cert Softhsm2 Openssl PKI
tags: Security Development Data Security 
---
# Intro

SoftHSM is an implementation of a cryptographic store accessible through a PKCS #11 interface. It is being developed as a part of the OpenDNSSEC project. In this blog, i use softhsm to generate key pairs and use libp11 to make it was able to used by openssl. 

![image](https://img.iami.xyz/images/102032240-332f0980-3df3-11eb-8363-d4639f197d49.png)

In this case, we create two rsa keypairs in one softhsm slot, also you can let the issue ca to use another slot.

# Requirements
* openssl 1.1.1
* softhsm2
* libp11
* pkcs11-tool

# 0x00 prepare the env

All operations are done on Ubuntu 18.04, how to install those tools would not be described here.  also suppose you already have the basics of ca. if not,  [Jamie](https://jamielinux.com/docs/openssl-certificate-authority/appendix/index.html) provide a good tutorial in this part.

1. enable pkcs11 engine for openssl.cnf
here is the example to enable pkcs11 engine for openssl .
```openssl
openssl_conf = openssl_init

[openssl_init]
engines=engine_section

[engine_section]
pkcs11 = pkcs11_section

[pkcs11_section]
engine_id = pkcs11
dynamic_path = /usr/lib/x86_64-linux-gnu/engines-1.1/libpkcs11.so
MODULE_PATH = /usr/local/lib/softhsm/libsofthsm2.so
# INIT_ARGS = connector=http://127.0.0.1:12345 debug
#sofunny
init = 696976398

```

> **please change the init vaule with your own slot id**
![image](https://img.iami.xyz/images/102035117-9b351e00-3dfa-11eb-9fbf-12c73ceadf17.png)
you can see the next section to learn how to init slot and show slot info.


also you can get this config file here and put them to the right place.  Before replace them ,you need have bakup.

```bash
sudo cp /etc/ssl/openssl.cnf /etc/ssl/openssl.cnf.bak
sudo cp /usr/lib/ssl/openssl.cnf  /usr/lib/ssl/openssl.cnf.bak
```

[openssl.cnf](https://gist.githubusercontent.com/mylamour/fd042deef17bb6aebbe21b9040caf1c3/raw/dcfe8f8f85ebb411fe0b08918f336340f34d4494/openssl.cnf)
[ssl.openssl.cnf](https://gist.githubusercontent.com/mylamour/fd042deef17bb6aebbe21b9040caf1c3/raw/dcfe8f8f85ebb411fe0b08918f336340f34d4494/sssl.openssl.cnf)

```bash
sudo cp openssl.cnf /etc/ssl/openssl.cnf
sudo cp ssl.openssl.cnf /usr/lib/ssl/openssl.cnf 
```

also, you need create some folder and files depends on the configuration.

```bash
mkdir certs private crl csr newcerts
chmod 400 private

```

here is my folder structure 

```log
~/Desktop/ca/test$ find . -type d
.
./csr
./certs
./private
./crl
./newcerts
```


# 0x01 init slots & init keys

1. init slots

```bash
softhsm2-util --init-token --slot 0 --label sofunny
softhsm2-util --show-slots
```

Here is the terminal output
```log
~/Desktop/ca/test$ softhsm2-util --show-slots
Available slots:
Slot 696976398
    Slot info:
        Description:      SoftHSM slot ID 0x298b040e                                      
        Manufacturer ID:  SoftHSM project                 
        Hardware version: 2.6
        Firmware version: 2.6
        Token present:    yes
    Token info:
        Manufacturer ID:  SoftHSM project                 
        Model:            SoftHSM v2      
        Hardware version: 2.6
        Firmware version: 2.6
        Serial number:    08e05ce5a98b040e
        Initialized:      yes
        User PIN init.:   yes
        Label:            sofunny
```

2. init rsa keypairs
you can change the key length, id & label by yourself. in this case, we use `id:01` for the root ca and `id:02` for issue ca.

```bash
pkcs11-tool --module /usr/local/lib/softhsm/libsofthsm2.so -l --keypairgen --key-type rsa:4096 --id 01 --label "SSL Root CA 01"
pkcs11-tool --module /usr/local/lib/softhsm/libsofthsm2.so -l --keypairgen --key-type rsa:2048 --id 02 --label "SSL Issue CA 01" 
```

Here is the terminal output
```log
~/Desktop/ca/test$ pkcs11-tool --module /usr/local/lib/softhsm/libsofthsm2.so -l --keypairgen --key-type rsa:4096 --id 01 --label "SSL Root CA 01"
Using slot 0 with a present token (0x298b040e)
Logging in to "sofunny".
Please enter User PIN: 
Key pair generated:
Private Key Object; RSA 
  label:      SSL Root CA 01
  ID:         01
  Usage:      decrypt, sign, unwrap
  Access:     sensitive, always sensitive, never extractable, local
Public Key Object; RSA 4096 bits
  label:      SSL Root CA 01
  ID:         01
  Usage:      encrypt, verify, wrap
  Access:     local
~/Desktop/ca/test$ pkcs11-tool --module /usr/local/lib/softhsm/libsofthsm2.so -l --keypairgen --key-type rsa:2048 --id 02 --label "SSL Issue CA 01"
Using slot 0 with a present token (0x298b040e)
Logging in to "sofunny".
Please enter User PIN: 
Key pair generated:
Private Key Object; RSA 
  label:      SSL Issue CA 01
  ID:         02
  Usage:      decrypt, sign, unwrap
  Access:     sensitive, always sensitive, never extractable, local
Public Key Object; RSA 2048 bits
  label:      SSL Issue CA 01
  ID:         02
  Usage:      encrypt, verify, wrap
  Access:     local
```

# 0x02 create root ca certs

1. create root ca cert with first keypiars(4096, id=01)

```bash
openssl req -new -x509 -days 7300 -sha512 -extensions v3_ca  -engine pkcs11 -keyform engine -key 696976398:01 -out certs/root.ca.cert.pem 
```

Here is the terminal output

```log
~/Desktop/ca/test$ openssl req -new -x509 -days 7300 -sha512 -extensions v3_ca  -engine pkcs11 -keyform engine -key 696976398:01 -out certs/root.ca.cert.pem
engine "pkcs11" set.
Enter PKCS#11 token PIN for sofunny:
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:CN
State or Province Name (full name) [Some-State]:JS
Locality Name (eg, city) []:SZ
Organization Name (eg, company) [Internet Widgits Pty Ltd]:PP
Organizational Unit Name (eg, section) []:GP
Common Name (e.g. server FQDN or YOUR name) []:SPKI SSL ROOT CA 01
Email Address []:test@test.com
```

2. verify cert

`openssl x509 -in certs/root.ca.cert.pem -noout -text`

# 0x03 create issue ca certs

1. generate csr for issue ca (2048, id=02)

```bash
openssl req -engine pkcs11 -keyform engine -key 696976398:02 -new -sha512  -out csr/issue.ca.csr 
 ```

2. request sign by root ca

```bash
openssl ca -engine pkcs11 -keyform engine -keyfile 696976398:01 -extensions v3_intermediate_ca -days 3650 -notext -md sha512 -in csr/issue.ca.csr -out certs/issue.ca.cert.pem 
 ```

3. verify issue ca cert

```bash
openssl x509 -in certs/issue.ca.cert.pem -noout -text
```

# 0x04 generate SSL Cert

1. generate key & csr

```bash
openssl genrsa -out private/www.example.com.key.pem 4096
openssl req -key private/www.example.com.key.pem -new -sha512 -out csr/www.example.com.csr.pem
```

2. sign by issue ca

```bash
openssl ca -engine pkcs11 -keyform engine -keyfile 696976398:02 -extensions server_cert -days 365 -notext -md sha512 -in csr/www.example.com.csr.pem -out certs/www.example.com.cert.pem
```

3. verify the cert

```bash
openssl x509 -noout -text -in certs/www.example.com.cert.pem
```

# 0x05 install CA Certs to Host

in this case, i put those cert in my ubuntu 18.04

```bash

$ sudo mkdir /usr/share/ca-certificates/extra
$ sudo cp certs/issue.ca.cert.pem  certs/root.ca.cert.pem  /usr/share/ca-certificates/extra/
$ sudo dpkg-reconfigure ca-certificates     

```

it's enough to non-interactive usage. but fot some web browser, maybe you still need to trust it manually.  here is the example for firefox

![image](https://img.iami.xyz/images/102035961-af7a1a80-3dfc-11eb-9ecd-6a0ac9c2faae.png)


# 0x06 write test code

```bash
 cat  certs/www.example.com.cert.pem  certs/issue.ca.cert.pem  certs/root.ca.cert.pem  > combine.pem 
```

```python

import http.server, ssl

server_address = ('localhost', 443)
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket(httpd.socket,
                               server_side=True,
                               certfile='certs/combine.pem',
                               keyfile='private/www.example.com.key.pem',
                               ssl_version=ssl.PROTOCOL_TLS)
httpd.serve_forever()

```
> in this case, i created a ssl certs for `www.example.com`. but i am not the owner of this domain, so  just modified `/etc/hosts` file, and add this line `127.0.0.1       www.example.com`

![image](https://img.iami.xyz/images/102035726-1e0aa880-3dfc-11eb-89ca-77fd7a2bdfa1.png)


# 0x07 Conclusion 

As for now, you already create a internal CA, also include SSL cert.  it's enough  for the interanl usage.  and in this case , the main purpose is to use softhsm to store the private  key , as you can see in this blog.  you can  create a key pairs with  never extracted properties which it was stored in softhsm.   softhsm is only a softhsm implement of HSM ,   the better way  is to use real HSM in your production env.  personally , i think it's enough for many case.

# 0x08 Resources

* [Openssl CA tutorial](https://jamielinux.com/docs/openssl-certificate-authority/appendix/index.html)
* [How to build your own Certificate Authority ](https://github.com/mylamour/blog/issues/74)
* [SoftHSMv2](https://github.com/opendnssec/SoftHSMv2)
* [libp11](https://github.com/OpenSC/libp11)

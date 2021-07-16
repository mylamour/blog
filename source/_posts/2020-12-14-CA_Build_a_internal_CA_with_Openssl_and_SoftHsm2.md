---
layout: post
title: 【CA】Build a internal CA with Openssl and SoftHsm2
categories: 安全工程师
kerywords: 证书 CA Cert Softhsm2 Openssl PKI
tags: PKI 证书 数据安全 
---
# Intro

SoftHSM is an implementation of a cryptographic store accessible through a PKCS #11 interface. It is being developed as a part of the OpenDNSSEC project. In this blog, i use softhsm to generate key pairs and use libp11 to make it was able to used by openssl. 

![image](https://user-images.githubusercontent.com/12653147/102032240-332f0980-3df3-11eb-8363-d4639f197d49.png)

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
![image](https://user-images.githubusercontent.com/12653147/102035117-9b351e00-3dfa-11eb-9fbf-12c73ceadf17.png)
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

```log
~/Desktop/ca/test$ openssl x509 -in certs/root.ca.cert.pem -noout -text
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number:
            67:b8:42:80:1f:ca:cb:1e:da:a1:e4:66:91:9c:c1:9f:33:a6:3e:98
        Signature Algorithm: sha512WithRSAEncryption
        Issuer: C = CN, ST = JS, L = SZ, O = PP, OU = GP, CN = SPKI SSL ROOT CA 01, emailAddress = test@test.com
        Validity
            Not Before: Dec 12 13:48:15 2020 GMT
            Not After : Dec  7 13:48:15 2040 GMT
        Subject: C = CN, ST = JS, L = SZ, O = PP, OU = GP, CN = SPKI SSL ROOT CA 01, emailAddress = test@test.com
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                RSA Public-Key: (4096 bit)
                Modulus:
                    00:c9:10:d6:0a:66:8a:70:f2:90:7a:70:18:cf:ae:
                    19:15:22:da:f4:fc:7b:2f:b0:2f:99:22:14:18:45:
                    40:fe:5a:67:87:20:fa:a6:e2:45:f8:16:60:ac:66:
                    e3:d4:df:37:2b:71:e7:8d:d3:e1:ab:5c:a5:ae:a0:
                    43:ad:b8:a2:de:06:84:b4:5f:1f:31:1b:1f:3e:ea:
                    9e:ff:cb:bb:8e:aa:32:65:4b:0e:96:44:ae:4a:1e:
                    10:5c:96:e3:6c:ec:d2:5c:0d:1e:b8:d9:17:36:3d:
                    da:91:ad:a8:34:c3:66:21:89:36:f3:79:24:ae:0f:
                    2f:86:7f:88:b0:bb:d0:64:e2:53:ef:03:b2:cc:2e:
                    9b:19:05:8e:43:87:eb:9e:f9:46:2d:40:ea:3b:27:
                    30:3e:ae:b7:c4:d2:b9:d4:0a:d3:52:f6:b9:de:c2:
                    c1:13:f5:3c:47:ae:22:2b:2c:1b:6c:46:62:fc:75:
                    c1:48:13:12:ad:15:a0:78:b6:3e:37:ae:d0:8f:9b:
                    51:13:52:85:1e:f2:a4:95:08:e8:a4:b7:3e:91:48:
                    2d:6b:c4:95:67:01:af:b0:06:c4:80:fe:ba:73:e7:
                    e6:84:a5:48:3f:e1:fe:d8:cf:b1:0f:e6:87:42:69:
                    d9:b0:32:a9:a9:d1:24:95:cf:4f:f9:c7:1d:7b:49:
                    34:91:57:be:03:b9:18:f1:e3:9e:15:3a:d7:d8:cd:
                    86:25:47:a8:2a:f5:4c:ad:da:bf:11:6c:a0:87:3d:
                    a9:b2:a0:94:5a:81:60:aa:8e:b3:44:49:39:68:42:
                    3a:ee:7a:77:f5:86:d6:eb:32:42:cc:48:ee:f1:51:
                    08:e8:22:d8:ff:44:b5:a7:18:78:f2:12:08:1f:02:
                    27:77:5e:d7:f4:d1:e3:8f:69:8f:a9:13:d4:3e:6c:
                    1a:3d:21:c7:d1:30:5c:b6:d2:b3:38:c9:35:ba:b4:
                    48:ae:61:8a:4b:26:e7:a5:68:4b:3f:e9:2a:b6:0b:
                    8d:14:16:a0:69:3f:1f:e6:c7:83:65:00:23:cb:ae:
                    c4:9c:6a:6b:73:67:3f:fd:01:b6:7c:e2:cc:54:76:
                    6a:55:d3:71:0b:35:9e:79:67:b7:5a:a1:11:99:4c:
                    20:0e:2e:7f:43:09:d0:5c:d1:b4:41:fa:d6:cf:01:
                    b2:38:0b:be:ed:70:c9:b7:eb:a7:b7:14:f2:9e:1e:
                    13:ae:91:fc:38:69:26:fd:e0:10:fd:b1:71:c0:cb:
                    2d:07:0f:19:9f:d2:d1:c4:74:90:41:9c:dd:e1:1d:
                    c9:05:ad:57:a6:89:a2:54:29:43:54:7a:7f:1a:9a:
                    ad:2d:51:a4:e7:f1:df:fc:78:26:9d:c6:b6:0a:8d:
                    2c:28:f1
                Exponent: 65537 (0x10001)
        X509v3 extensions:
            X509v3 Subject Key Identifier: 
                F1:76:ED:83:0E:B7:C5:6F:03:97:FF:4D:C1:2A:8E:B3:23:83:C6:CB
            X509v3 Authority Key Identifier: 
                keyid:F1:76:ED:83:0E:B7:C5:6F:03:97:FF:4D:C1:2A:8E:B3:23:83:C6:CB

            X509v3 Basic Constraints: critical
                CA:TRUE
    Signature Algorithm: sha512WithRSAEncryption
         6a:bc:bc:ef:95:15:ff:e3:a1:1e:da:46:77:c1:6d:69:39:0c:
         cd:42:09:5d:1b:4a:85:55:7b:92:c5:28:78:67:6a:ef:d7:8c:
         ee:7f:b8:a8:8b:d7:4e:ba:6c:92:67:00:05:60:cf:4b:84:1e:
         ea:22:31:74:68:98:16:0f:6e:a2:fa:9d:f1:06:da:82:4a:b4:
         cf:98:11:dc:fc:04:06:02:f7:4d:7e:81:dd:63:09:5c:54:d1:
         39:7c:a0:e9:30:67:02:f0:92:0b:8b:eb:4e:82:ca:b3:9a:b6:
         d5:82:5c:4d:6e:8e:a4:74:2d:e6:63:a5:36:7d:09:ec:80:7e:
         07:ad:6d:89:19:7d:19:a0:de:18:e2:ca:50:28:25:a6:0d:2b:
         d3:2d:4f:76:13:dc:62:75:82:51:8d:26:c4:ad:53:7d:73:c7:
         3c:00:4a:9d:ac:d5:e4:eb:b8:83:2a:a0:28:54:dd:81:9d:96:
         ef:e4:2b:52:cc:70:20:cf:55:23:0d:3d:ae:5f:2b:8d:cd:20:
         8c:28:0c:2a:fd:7e:0d:91:40:80:70:41:00:79:83:b4:97:cd:
         9f:0c:ed:de:26:83:8d:44:4b:e1:6f:1f:7a:ec:05:c2:b7:c1:
         eb:35:50:8d:dd:eb:32:2f:15:1c:6b:ff:72:2f:45:25:4f:48:
         d2:f5:4e:cb:34:3d:84:8b:92:3b:d5:45:f9:3b:7c:97:a9:27:
         ff:70:b2:c2:0c:89:c7:30:92:6c:0b:e2:0b:8d:69:88:a5:ef:
         5a:c8:16:8f:f5:7a:7c:9e:22:e8:e4:bf:83:89:35:80:56:90:
         44:f7:ff:54:bc:df:85:a5:60:7b:18:0a:aa:91:bc:ff:b0:73:
         21:b9:e2:5e:64:d9:00:95:20:61:9a:94:f4:b6:86:6a:ae:66:
         5f:9a:c0:4d:6d:88:b8:d6:07:f8:03:37:08:66:59:22:14:26:
         34:10:f9:e1:d9:89:66:dc:68:44:4a:83:82:ab:84:d3:6a:b9:
         b8:91:f3:4b:3b:0c:96:7a:9b:80:7a:b1:e7:21:ed:1b:84:86:
         3e:a1:f1:2e:a7:4e:70:5b:b1:ef:86:a9:ca:35:44:fc:92:0b:
         b8:24:ed:ec:61:12:5b:0d:7f:d2:ef:a2:31:58:79:53:1b:94:
         d2:de:9c:bb:2a:a0:d6:c8:b7:59:71:98:71:df:68:92:01:a0:
         a8:30:4b:3b:e3:70:c2:93:86:0e:77:a4:47:c2:32:b6:cc:bf:
         28:81:77:37:9c:68:91:5f:27:6d:4d:84:f9:45:69:a3:1f:e5:
         fb:63:92:41:b4:45:c0:17:fc:62:42:a8:7e:da:19:34:80:c9:
         e8:d4:4f:32:05:1c:ad:f1

```


# 0x03 create issue ca certs

1. generate csr for issue ca (2048, id=02)

```bash
openssl req -engine pkcs11 -keyform engine -key 696976398:02 -new -sha512  -out csr/issue.ca.csr 
 ```

Here is the terminal output

```log
~/Desktop/ca/test$ openssl req -engine pkcs11 -keyform engine -key 696976398:02 -new -sha512  -out csr/issue.ca.csr
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
Common Name (e.g. server FQDN or YOUR name) []:SPKI SSL ISSUE CA 01
Email Address []:test@test.com

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:
An optional company name []:


```

2. request sign by root ca

```bash
openssl ca -engine pkcs11 -keyform engine -keyfile 696976398:01 -extensions v3_intermediate_ca -days 3650 -notext -md sha512 -in csr/issue.ca.csr -out certs/issue.ca.cert.pem 
 ```

 Here is the terminal output

```log
~/Desktop/ca/test$ touch index.txt
~/Desktop/ca/test$ echo 1000 > serial
~/Desktop/ca/test$ openssl ca  -engine pkcs11 -keyform engine -keyfile 696976398:01 -extensions v3_intermediate_ca -days 3650 -notext -md sha512 -in csr/issue.ca.csr -out certs/issue.ca.cert.pem
engine "pkcs11" set.
Using configuration from /usr/lib/ssl/openssl.cnf
Enter PKCS#11 token PIN for sofunny:
Check that the request matches the signature
Signature ok
Certificate Details:
        Serial Number: 4096 (0x1000)
        Validity
            Not Before: Dec 12 14:01:12 2020 GMT
            Not After : Dec 10 14:01:12 2030 GMT
        Subject:
            countryName               = CN
            stateOrProvinceName       = JS
            organizationName          = PP
            organizationalUnitName    = GP
            commonName                = SPKI SSL ISSUE CA 01
            emailAddress              = test@test.com
        X509v3 extensions:
            X509v3 Subject Key Identifier: 
                0B:F7:31:43:FC:7A:0A:4C:63:C4:C7:CB:BC:CC:40:50:E7:F1:ED:74
            X509v3 Authority Key Identifier: 
                keyid:F1:76:ED:83:0E:B7:C5:6F:03:97:FF:4D:C1:2A:8E:B3:23:83:C6:CB

            X509v3 Basic Constraints: critical
                CA:TRUE, pathlen:0
            X509v3 Key Usage: critical
                Digital Signature, Certificate Sign, CRL Sign
Certificate is to be certified until Dec 10 14:01:12 2030 GMT (3650 days)
Sign the certificate? [y/n]:

1 out of 1 certificate requests certified, commit? [y/n]y
Write out database with 1 new entries
Data Base Updated
```

3. verify issue ca cert

```bash
openssl x509 -in certs/issue.ca.cert.pem -noout -text
```

Here is the terminal output
```log
~/Desktop/ca/test$ openssl x509 -in certs/issue.ca.cert.pem -noout -text
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number: 4096 (0x1000)
        Signature Algorithm: sha512WithRSAEncryption
        Issuer: C = CN, ST = JS, L = SZ, O = PP, OU = GP, CN = SPKI SSL ROOT CA 01, emailAddress = test@test.com
        Validity
            Not Before: Dec 12 14:01:12 2020 GMT
            Not After : Dec 10 14:01:12 2030 GMT
        Subject: C = CN, ST = JS, O = PP, OU = GP, CN = SPKI SSL ISSUE CA 01, emailAddress = test@test.com
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                RSA Public-Key: (2048 bit)
                Modulus:
                    00:d3:5c:43:50:1b:7b:4d:e6:39:2c:1c:54:47:e1:
                    a7:3a:20:92:77:b6:22:32:7b:82:7a:e9:7e:20:9b:
                    22:a9:59:d2:a9:6e:d4:94:38:c1:40:06:27:fd:65:
                    f2:da:e1:ae:0f:f1:94:c4:c0:da:5d:51:bf:f7:ef:
                    4e:d0:c5:6d:c4:60:6a:a8:c0:1d:83:c3:54:d8:24:
                    d2:d9:ed:94:07:2c:ea:d6:bb:9b:4f:a4:73:f1:7c:
                    86:fd:b5:32:23:91:a4:0d:27:8a:3b:49:9e:0d:8e:
                    a2:ca:80:1f:07:9c:59:55:33:c7:cb:eb:ca:49:2f:
                    51:fd:b7:b8:fb:91:99:39:26:df:8c:3f:5b:98:7a:
                    87:86:94:a1:08:e5:11:cf:fa:50:c2:fe:40:b3:10:
                    4b:5e:6a:f2:01:42:d7:90:fc:43:52:e6:2e:42:14:
                    2f:e4:2b:94:c5:0b:5b:83:80:48:ca:99:c9:d8:98:
                    da:70:82:82:bf:7e:eb:97:6b:fa:3a:63:ce:ce:4c:
                    3f:fe:83:b5:98:8a:2d:a0:fe:88:14:81:71:c8:f9:
                    88:2b:79:0f:ab:2a:97:1d:68:a1:5f:ac:fa:45:b9:
                    aa:3c:c3:9a:3d:5e:7d:0d:52:3d:da:e2:45:5b:1c:
                    10:9e:23:d5:8f:5d:6f:c6:55:44:61:a8:38:ee:f0:
                    06:c9
                Exponent: 65537 (0x10001)
        X509v3 extensions:
            X509v3 Subject Key Identifier: 
                0B:F7:31:43:FC:7A:0A:4C:63:C4:C7:CB:BC:CC:40:50:E7:F1:ED:74
            X509v3 Authority Key Identifier: 
                keyid:F1:76:ED:83:0E:B7:C5:6F:03:97:FF:4D:C1:2A:8E:B3:23:83:C6:CB

            X509v3 Basic Constraints: critical
                CA:TRUE, pathlen:0
            X509v3 Key Usage: critical
                Digital Signature, Certificate Sign, CRL Sign
    Signature Algorithm: sha512WithRSAEncryption
         32:53:f6:b2:b9:08:24:23:bf:0e:9b:a1:86:bb:25:c1:fd:f8:
         d0:29:0f:f7:c8:d1:e3:3e:ea:4b:78:ef:b8:49:df:ee:4b:c3:
         57:9d:9d:c7:2c:11:ba:be:76:fe:fa:21:a9:16:62:bc:6b:bf:
         52:22:df:e6:6d:ac:cb:f5:27:8d:90:0b:72:52:5e:bf:18:b7:
         87:ab:c3:d7:41:7e:c5:bb:2e:50:50:d8:b7:79:dc:c4:51:eb:
         a4:83:fc:41:08:0e:34:c9:9d:1d:8d:08:43:f3:47:25:bd:1b:
         c1:b7:09:28:1d:a1:ae:44:00:42:6a:d0:9a:ba:0a:79:68:20:
         a6:c4:39:fa:4b:d4:58:ce:e2:5a:fe:34:cd:6c:a0:48:56:ba:
         82:f9:b6:0a:47:82:f6:62:af:e1:b2:34:8e:f1:d1:cd:45:33:
         1f:98:ad:e6:a3:7a:08:ef:81:eb:08:d3:e1:22:3d:a7:7b:97:
         b9:5e:a1:9c:58:d8:bf:fd:9c:a8:50:54:60:16:e0:d4:ba:82:
         db:6e:20:f5:cd:0a:3c:93:7d:cb:a1:41:64:f9:8e:2d:dc:21:
         fd:04:7d:ab:c6:bf:dd:84:c7:db:68:c8:a0:ef:45:e5:16:85:
         8d:6c:f6:df:d0:bd:f9:a4:5d:81:0d:13:53:d1:79:e1:77:e0:
         ab:e8:10:1c:b3:8d:72:a8:b4:85:aa:bf:4a:b3:30:35:9d:83:
         0f:db:98:15:bf:38:8d:b9:ff:33:4f:ad:01:3b:8d:68:70:23:
         8d:75:b9:f0:bc:49:35:79:8d:5e:3e:cb:fc:78:b6:3a:0d:c3:
         29:4c:c4:d4:40:21:94:3c:54:e5:97:83:8f:99:a9:6f:c0:db:
         c2:35:81:90:dc:ac:c7:a7:57:4f:6d:42:9b:80:d5:f6:ef:d8:
         99:8e:c0:28:3d:8f:67:3e:5f:6a:84:95:8c:52:e0:1e:34:9e:
         db:98:74:56:4d:bc:ec:8c:89:af:9f:9a:51:28:47:d3:04:5e:
         56:d3:d0:eb:eb:72:d5:fe:9b:68:50:f6:f3:e4:17:ec:da:30:
         60:30:57:74:03:d4:41:1a:0a:d8:1d:1e:bf:3a:fd:20:4f:c4:
         b4:12:43:59:d1:8d:40:20:6c:e4:34:8e:c8:61:22:97:dc:b6:
         7b:de:3b:34:90:9d:c1:7b:2c:52:2e:ce:4d:99:f7:a0:24:84:
         9f:38:98:34:92:32:64:04:df:18:b4:90:8a:42:f6:09:16:be:
         bb:c4:01:57:d3:e3:47:f7:c6:7f:39:97:ee:69:06:ff:65:27:
         90:37:4f:32:c6:7d:eb:db:94:e6:66:84:b5:9c:ea:3c:1b:ca:
         45:b9:8c:36:82:46:f8:89
```

4. combine cert chain & verify

```bash
cat certs/issue.ca.cert.pem certs/root.ca.cert.pem > certs/spki.cert.pem 
openssl x509 -in certs/spki.cert.pem  -noout -text
```

# 0x04 create ssl certs

1. generate key pairs

Don't forget to cahnge permission  for private folder. eg. `chmod 400 private`

```bash
openssl genrsa -aes256 -out private/www.example.com.key.pem 2048
``` 

Here is the terminal output
```log

~/Desktop/ca/test$ openssl genrsa -aes256 -out private/www.example.com.key.pem 2048
Generating RSA private key, 2048 bit long modulus (2 primes)
...............................+++++
.....................................................................................................................................+++++
e is 65537 (0x010001)
140392395130176:error:260BC097:engine routines:int_engine_configure:invalid init value:../crypto/engine/eng_cnf.c:121:
Enter pass phrase for private/www.example.com.key.pem:
Verifying - Enter pass phrase for private/www.example.com.key.pem:
```


2. generate csr

```bash
openssl req -key private/www.example.com.key.pem -new -sha256 -out csr/www.example.com.csr.pem 
```

Here is the terminal output

```log
~/Desktop/ca/test$ openssl req -key private/www.example.com.key.pem -new -sha256 -out csr/www.example.com.csr.pem 
Enter pass phrase for private/www.example.com.key.pem:
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
Common Name (e.g. server FQDN or YOUR name) []:www.example.com     
Email Address []:admin@example.com

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:
An optional company name []:

```

3. use issue ca private key to sign the csr

```bash
openssl x509 -req -engine pkcs11 -in csr/www.example.com.csr.pem -CAkeyform engine -CAkey 696976398:02 -CA certs/spki.cert.pem  -days 365 -sha256 -out certs/www.example.com.cert.pem 
```

Here is the terminal output
```log
~/Desktop/ca/test$ echo 1000 > certs/spki.cert.srl
~/Desktop/ca/test$ openssl x509 -req -engine pkcs11 -in csr/www.example.com.csr.pem -CAkeyform engine -CAkey 696976398:02 -CA certs/spki.cert.pem  -days 365 -sha256 -out certs/www.example.com.cert.pem 
engine "pkcs11" set.
Signature ok
subject=C = CN, ST = JS, L = SZ, O = PP, OU = GP, CN = www.example.com, emailAddress = admin@example.com
Getting CA Private Key
Enter PKCS#11 token PIN for sofunny:

```
4. verify the ssl cert

```bash
openssl x509 -in certs/www.example.com.cert.pem -noout -text
```
Here is the terminal output

```log
~/Desktop/ca/test$ openssl x509 -in certs/www.example.com.cert.pem -noout -text
Certificate:
    Data:
        Version: 1 (0x0)
        Serial Number: 4097 (0x1001)
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: C = CN, ST = JS, O = PP, OU = GP, CN = SPKI SSL ISSUE CA 01, emailAddress = test@test.com
        Validity
            Not Before: Dec 12 14:08:35 2020 GMT
            Not After : Dec 12 14:08:35 2021 GMT
        Subject: C = CN, ST = JS, L = SZ, O = PP, OU = GP, CN = www.example.com, emailAddress = admin@example.com
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                RSA Public-Key: (2048 bit)
                Modulus:
                    00:bf:88:54:b8:e1:e1:6e:0c:9a:a6:d9:59:22:50:
                    10:7b:41:a1:49:19:7f:31:d2:a7:c8:bb:a3:4a:3c:
                    2d:ec:83:08:a1:9e:c9:72:af:46:9c:e5:f1:7f:53:
                    4e:60:55:67:8f:3f:44:c7:19:f6:1b:6b:78:16:aa:
                    0e:61:b2:41:b1:c2:95:d4:48:ec:37:c3:5f:4e:94:
                    df:5f:43:bf:41:23:04:54:9c:9a:e1:9f:94:8f:82:
                    b9:97:f2:44:b1:61:81:ee:b9:e7:92:52:df:83:2b:
                    df:e6:6c:39:17:64:c5:5e:d3:60:16:08:7a:34:25:
                    25:d0:1f:59:50:16:ae:74:54:c9:30:b1:fb:fa:20:
                    23:e7:d7:f4:9f:52:eb:f0:04:d4:a4:d3:42:a7:8b:
                    1e:5c:c6:6b:0c:ee:af:88:d6:63:18:c6:3c:7b:20:
                    9e:8b:1a:2f:82:8e:b4:a6:13:3a:8a:12:32:4f:b2:
                    c9:d8:d6:2c:7a:c3:86:8f:f6:36:a7:60:1f:7d:2c:
                    7c:d2:fa:29:ab:31:fc:c3:da:23:d6:14:3f:be:32:
                    40:31:2b:4e:7d:86:f1:3a:72:19:94:a5:b9:23:a1:
                    27:6a:f4:69:16:68:00:74:55:d0:de:db:da:97:6e:
                    01:3d:09:f5:c4:74:9e:a8:ea:4b:48:2f:2c:c5:20:
                    19:31
                Exponent: 65537 (0x10001)
    Signature Algorithm: sha256WithRSAEncryption
         74:4d:ac:b2:56:67:c9:0d:29:2b:f6:79:1a:ba:db:ad:40:b6:
         5a:97:02:bf:c5:ef:c9:de:68:e4:47:5a:48:6a:73:7f:5a:15:
         11:7c:d1:99:92:0e:49:71:da:c1:00:28:2f:ae:aa:d7:87:02:
         5e:45:c5:82:18:b3:96:66:15:d5:80:d0:16:4c:25:9e:84:8d:
         05:14:63:a0:0d:26:80:c7:c8:8c:76:74:9c:5c:a7:0f:dd:80:
         1e:ea:5b:99:9d:49:fe:bb:92:8e:26:10:bf:db:08:51:26:62:
         f4:aa:fa:92:70:56:59:ad:47:5e:42:70:f2:90:53:cb:9e:dc:
         33:a3:cf:81:71:c2:67:9d:eb:d3:a3:99:8a:40:bd:83:9f:99:
         c6:30:4e:86:65:e9:e9:65:c7:ba:40:48:e5:4c:4c:a1:ca:20:
         c1:04:40:37:82:fa:f2:67:f0:55:cd:76:48:ea:4c:71:d5:6e:
         40:e6:a8:ae:62:32:0e:cd:8f:d1:7b:6c:83:06:df:be:b1:b5:
         3b:4c:a5:85:d5:18:05:37:f6:b2:a0:e6:48:04:94:9e:20:20:
         64:6c:ec:f6:16:3e:07:ec:5f:80:0f:a7:a6:ac:f4:eb:a3:f8:
         d8:d5:09:ce:64:e9:ac:d5:7a:1a:62:28:1c:5f:66:95:cc:79:
         f1:1f:f0:81

```

# 0x05 install CA Certs to Host

in this case, i put those cert in my ubuntu 18.04

```bash

$ sudo mkdir /usr/share/ca-certificates/extra
$ sudo cp certs/issue.ca.cert.pem  certs/root.ca.cert.pem  /usr/share/ca-certificates/extra/
$ sudo dpkg-reconfigure ca-certificates     

```

```log
~/Desktop/ca/test$ sudo dpkg-reconfigure ca-certificates   
Updating certificates in /etc/ssl/certs...
rehash: warning: skipping spki.pem,it does not contain exactly one certificate or CRL
1 added, 0 removed; done.
Processing triggers for ca-certificates (20201027ubuntu0.20.04.1) ...
Updating certificates in /etc/ssl/certs...
0 added, 0 removed; done.
Running hooks in /etc/ca-certificates/update.d...

done.
done.

```
it's enough to non-interactive usage. but fot some web browser, maybe you still need to trust it manually.  here is the example for firefox

![image](https://user-images.githubusercontent.com/12653147/102035961-af7a1a80-3dfc-11eb-9ecd-6a0ac9c2faae.png)


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

![image](https://user-images.githubusercontent.com/12653147/102035726-1e0aa880-3dfc-11eb-89ca-77fd7a2bdfa1.png)


# 0x07 Conclusion 

As for now, you already create a internal CA, also include SSL cert.  it's enough  for the interanl usage.  and in this case , the main purpose is to use softhsm to store the private  key , as you can see in this blog.  you can  create a key pairs with  never extracted properties which it was stored in softhsm.   softhsm is only a softhsm implement of HSM ,   the better way  is to use real HSM in your production env.  personally , i think it's enough for many case.

# 0x08 Resources

* [Openssl CA tutorial](https://jamielinux.com/docs/openssl-certificate-authority/appendix/index.html)
* [How to build your own Certificate Authority ](https://github.com/mylamour/blog/issues/74)
* [SoftHSMv2](https://github.com/opendnssec/SoftHSMv2)
* [libp11](https://github.com/OpenSC/libp11)
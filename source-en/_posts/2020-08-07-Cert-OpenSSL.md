---
layout: post
title: Ramblings on Certificates in Enterprise
categories: Security Engineer
kerywords: Enterprise Security Internet Enterprise Security Data Security Certificates OpenSSL SSL Certificate Security Architecture
tags: Data Security Security Operations
translated: true
---


# Certificates in the Business

Depending on what the team needs, the common cert types you'll run into are: client, server, code signing, and email protection.
Server certs are basically SSL certs. Client certs are usually device certs. Beyond that, there are certs for encryption/decryption, signing/verification, and CA certs.

Delivery file formats: pfx/p12, jks — passwords and certs are distributed separately.
Delivery methods: file, stored in specific software, hardware token.

```bash  

openssl pkcs12 -in yourP12File.pfx -nocerts -out privateKey.pem
openssl pkcs12 -in yourP12File.pfx -clcerts -nokeys -out publicCert.pem
 
```

SM2 keys need gmssl.


# Certificate Storage

This ties in with your infrastructure setup — can't paste the diagram here. Just keep these three points in mind:

1. Private keys must be password-protected
2. Private keys can only be read by the application
3. Passwords must be stored separately in a config center, and only the application can read them

This basically means you'll have a few key pairs. Each environment gets its own set: Staging, Prod, Integration.

You can also just encrypt the private key itself:

```bash
openssl rsa -aes256 -in your.key -out your.encrypted.key
```

# SSL Pinning 

The main concern here is business continuity — especially on mobile where you've hardcoded a pin value, and then the cert expires or needs to be rotated. This is especially tricky now that public CA certs have had their validity period cut down to 1 year. And you can't just push an app update whenever you feel like it. Generally recommended to use sha256 for pin values. (Some companies like to be lazy and pin to the intermediate CA instead. Watch out — intermediate CAs rotate every 6 months now. Do NOT do this, or you'll end up killing your service.)

(HTTP Public Key Pinning (HPKP))

Both approaches to pinning — whether you pin to the cert itself or to the public key (with extra info like subjectPublicKeyInfo, RSAPublicKey/DSAPublicKey) — have their own trade-offs. You also need to think about how cert rotation would differ between the two approaches.

```bash

# Extract public key from cert
openssl x509 -pubkey -noout -in cert.pem  > pubkey.pem

# Get the digest hash and view it in base64
openssl dgst -sha256 -binary xxxx | openssl enc -base64
```

For pin values, the recommendation is that **you should include everything from the cert up to the issuing CA and root CA**. And always have a **backup pin value** ready.


# Certificate Monitoring

This is a big topic. Start by inventorying your assets, then map out the infrastructure, design a monitoring strategy, and set up alerting.

For example: you might have certs from an internal CA (possibly multiple issuing CAs), certs from a public CA, directly purchased CA certs, wildcard certs, and device certs. Do you bolt monitoring onto your CMDB, or build a standalone system? How do the two data sources cross-validate? For instance, have one monitoring setup in CMDB and another in the RA, then compare the two. (You also need to figure out who gets alerted — the business team or individual employees? What happens when someone leaves?)

Device certs can't be handled the same way as SSL certs where you just hit the hostname. So how do you handle those?

# Process Optimization

Automating the cert request workflow. Previously built a self-service request tool that hooks into the RA API. Now drawing up a UI to integrate the self-service request feature into the PaaS platform.

# Misc

1. Extract cert from a web server:
With SNI: 
`openssl s_client -showcerts -servername www.example.com -connect www.example.com:443 </dev/null`
Without SNI:
`openssl s_client -showcerts -connect www.example.com:443 </dev/null`
2. View DN: `openssl x509 -in xxx.pem | sed 's/^subject=//' `
3. Store using YubiKey
4. View CSR info: `openssl req -noout -text -in xxx.csr`
5. Verify public key between cert and CSR file, or sign/verify:
```bash
$ openssl rsautl -sign -inkey my.key -out in.txt.rsa -in in.txt
Enter pass phrase for my.key:
$ openssl rsautl -verify -inkey my-pub.pem -in in.txt.rsa -pubin
Bonjour

openssl dgst -sha256 -sign my.key -out in.txt.sha256 in.txt 
Enter pass phrase for my.key:
$ openssl dgst -sha256 -verify my-pub.pem -signature in.txt.sha256 in.txt  
Verified OK
```


# Summary
The details reveal the craft — if you want to go deeper, check the RFC docs.
Certs show up even more in financial companies because the entire ecosystem relies on mutual cert-based authentication for encrypting and signing data between institutions — think UnionPay, ChinaPay, clearing houses, and the like.

WD-40 actually works pretty well — the double-keystroke issue on my keyboard seems to have slowed down a bit.
// 20201010: WD-40 is too oily, only buys you a little time. Might as well just take the whole keyboard apart and wash it with dish soap in water (mechanical keyboard).

 

# References
* [openssl get cert from server](https://stackoverflow.com/questions/7885785/using-openssl-to-get-the-certificate-from-a-server)
* [openssl sign verify](https://stackoverflow.com/questions/5140425/openssl-command-line-to-verify-the-signature)
* SM2
* [Openssl command line utils](https://wiki.openssl.org/index.php/Command_Line_Utilities)
* [CFCA SSL TOOLS](https://ssl.cfca.com.cn)

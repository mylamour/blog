---
layout: post
title: 【CA】Overview of Certificate Filetype & How to covert it with Openssl
categories: 安全工程师
kerywords: 证书 CA Cert PKI
tags: PKI 证书 安全随笔
---

# Overview of Cert filetype

* PEM
This is a (Privacy-enhanced Electronic Mail) Base64 encoded DER certificate, enclosed between “—–BEGIN CERTIFICATE—–” and “—–END CERTIFICATE—–“
`openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem`

* CER & CRT & DER
Although usually in binary DER form, Base64-encoded certificates are also common (see .pem above).
``

* P7B & P7C
PKCS#7 SignedData structure without data, just certificate(s) or CRL(s)

* P12   
PKCS#12 files may contain certificate(s) (public) and private keys (password protected).

* PFX
PFX is the predecessor of PKCS#12. This type of file usually contains data in PKCS#12 format (e.g., with PFX files generated in IIS).
`openssl pkcs12 -export -out certificate.pfx -inkey privateKey.key -in certificate.crt -certfile more.crt`

# Openssl Tutorial & Cert Convert

## OpenSSL Convert PEM
* Convert PEM to DER
`openssl x509 -outform der -in certificate.pem -out certificate.der`

* Convert PEM to P7B
`openssl crl2pkcs7 -nocrl -certfile certificate.cer -out certificate.p7b -certfile CACert.cer`

* Convert PEM to PFX
`openssl pkcs12 -export -out certificate.pfx -inkey privateKey.key -in certificate.crt -certfile CACert.crt`

## OpenSSL Convert DER
* Convert DER to PEM
`openssl x509 -inform der -in certificate.cer -out certificate.pem`

## OpenSSL Convert P7B
* Convert P7B to PEM
`openssl pkcs7 -print_certs -in certificate.p7b -out certificate.cer`

* Convert P7B to PFX
`openssl pkcs7 -print_certs -in certificate.p7b -out certificate.cer`
`openssl pkcs12 -export -in certificate.cer -inkey privateKey.key -out certificate.pfx -certfile CACert.cer`

## OpenSSL Convert PFX
* Convert PFX to PEM
`openssl pkcs12 -in certificate.pfx -out certificate.cer -nodes`

# Resources
* [SSL cert format introduce](https://blog.freessl.cn/ssl-cert-format-introduce/)
* [Cert Convert](https://www.sslshopper.com/ssl-converter.html)
* [Cer & Crt different](https://comodosslstore.com/resources/cer-vs-crt-the-technical-difference-how-to-convert-them/)
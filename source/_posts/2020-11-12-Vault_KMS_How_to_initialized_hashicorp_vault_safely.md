---
layout: post
title: 【Vault KMS】How to initialized hashicorp vault safely
categories: 安全工程师
kerywords: 安全流程 安全规范 Opeartion Security HashicorpVault
tags: 安全运营 数据安全 Vault
---

I'm not going to introduce the basic concept of vault. and only focused on how to initialized it more secure.  this is a step by step to help you to build a simple testing.

Requirements:
* docker
* gpg

Here is the steps:

# 0x01 Starting a Vault Server
1. start the vault server

```bash
 docker run --rm --cap-add=IPC_LOCK -e 'VAULT_LOCAL_CONFIG={"backend": {"file": {"path": "/vault/file"}}, "default_lease_ttl": "168h", "max_lease_ttl": "720h", "listener": {"tcp":{ "address": "0.0.0.0:8201","tls_disable":"true"}}, "ui":"true"}' -e "VAULT_API_ADDR=http://0.0.0.0:8201" -p 8201:8201 vault server
```
**notice**:
*  If you didn't enable the `UI` option, you will see the error `404 page not found`
* you can change the listening port, also you have to change the setting to export port from docker to host

2.  access the website `https://127.0.0.1:8201`, and you will see the initialization page. input the numbers of `key share` and `key threshold`
![image](https://img.iami.xyz/images/98922122-0e522880-250d-11eb-8de4-62ee11ed9832.png)


# 0x02 Prepared GPG Public Key
1. generate the pgp key with `gpg --full-generate-key`
![image](https://img.iami.xyz/images/98922890-f8913300-250d-11eb-97fb-f32aa972cc18.png)

![image](https://img.iami.xyz/images/98922494-79036400-250d-11eb-8c4a-54f187fd22b0.png)

2. you need make sure each Key Custodian has created their own `PGP` key, and share the public key to you.  for example, if you setting  3 key shares in the first step. you have to got 3 PGP keys. also another one for root token.

# 0x03 Seal it

> When a Vault server is started, it starts in a sealed state. In this state, Vault is configured to know where and how to access the physical storage, but doesn't know how to decrypt any of it.

Unsealing is the process of obtaining the plaintext master key necessary to read the decryption key to decrypt the data, allowing access to the Vault.

1.  export `PGP` Public key and encode it with `base64`

```bash
gpg --list-keys
gpg --export 69D33CF252B5B177D67AC2728C8BF5945A111336 | base64
```

**notice**

* `gpg --export -a  'kso-01' > vault-admin.public` was not  


As you can see, i create 3 pgp keys for testing.

![image](https://img.iami.xyz/images/98923789-101ceb80-250f-11eb-9e03-b4a9ccc6f09f.png)

2.  enable text mode and put the 4 PGP public keys to the dashboard. which you got from the last step 

![image](https://img.iami.xyz/images/98924045-5d00c200-250f-11eb-9a41-7ce2563a7467.png)

3. Download the keys and tokens which was encrypted by PGP Keys

![image](https://img.iami.xyz/images/98924279-9cc7a980-250f-11eb-8ee1-9256dcd55f43.png)

Also you can click the button to show the cipher text.  but you can't get the real key without PGP private key.

![image](https://img.iami.xyz/images/98924403-bc5ed200-250f-11eb-8991-e6a97f075d39.png)

Due to you need share those keys to each Key Custodian , so the better way is to download it.

![image](https://img.iami.xyz/images/98924565-edd79d80-250f-11eb-8ae4-b1eb5f0dc3b4.png)

# 0x004  Unseal it.
1. Suppose all key custodian was get them keys. now you need to decrypt it and get the plaintext

```bash
echo xxxxxxxxxxxxx29a51e0dxxxxxxxxxxxxxxxxxxxxb48e7e5a83915a662989xxxxxxxxxxxxxxxxxxxx4077153525b0547841d52aab4dfab26f2e265f417f5e11c3a00 | xxd -r -p | gpg -d

```
![image](https://img.iami.xyz/images/98926007-b8cc4a80-2511-11eb-90e7-a6fcdfe062e2.png)

and put those key into dashboard

![image](https://img.iami.xyz/images/98926382-342dfc00-2512-11eb-90b6-670f70d72ef4.png)

![image](https://img.iami.xyz/images/98926894-d8b03e00-2512-11eb-89f3-557878ee9432.png)


# 0x004 Login into Vault

1. decrypt the token and login into 

```bash
echo xxxxxxxxxx+xxxxxxxxxxxxxxxxxxxx++xxxxxxx | base64 -d | gpg -d
``` 

**Notice**
*  Note that the decryption operations on both sides are different.  you need to use `xxd -r -p | gpg -d` to decrypt key shares and use `base64 -d | gpg -d`  to decrypt root token.

![image](https://img.iami.xyz/images/98927679-d00c3780-2513-11eb-9d2e-d5b170724e52.png)

![image](https://img.iami.xyz/images/98928014-3729ec00-2514-11eb-9eb7-40c08562182f.png)

![image](https://img.iami.xyz/images/98927934-19f51d80-2514-11eb-9f87-7df2ee26ab65.png)


2. seal again

![image](https://img.iami.xyz/images/98928149-6d676b80-2514-11eb-96aa-7010220c4240.png)

# 0x005 Conclusion 

this is a simple tutorial to help you to build a vault server with docker, and make sure it was shared to each person safety. There are many details when you deploy it into production. 

For example: 
1. use  different backend
2. configure with certificate for TLS
and so on.

Also there was many features with enterprise version.   
For example:
1. integrated vault with HSM. 
2. HA model & DR model.
 
You can find more details here: https://www.hashicorp.com/products/vault/pricing
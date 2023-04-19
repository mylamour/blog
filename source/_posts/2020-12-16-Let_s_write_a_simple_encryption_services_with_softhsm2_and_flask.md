---
layout: post
title: Encryption As A Services with softhsm2 and flask
categories: 安全工程师
kerywords: softhsm2 encryptionasaservices
tags: 安全研发 数据安全
---

# 0x01 Intro

**This project was just for fun, and `vault` was better for your prod env.**

About one month ago, i am plan to write a simple encryption as a service. after few days research, i make a simple architecture. 

![image](https://img.iami.xyz/images/100545213-b9950880-3295-11eb-905f-f0d466cc9f2d.png)

As you can see in the picture, i am going to use `softhsm` to store the private key and let `docker` as the runtime. also we build a web service with `flask`.


This is the final result:

* gnereate key

```bash
$ curl --header "Content-Type: application/json"  --request POST --data '{"secret_path":"random_test/rsa", "secret_version":"1"}' http://127.0.0.1:8443/gen/key/rsa
{
  "Info": "RSA Key with random_test/rsa Generated"
}

$ curl --header "Content-Type: application/json"  --request POST --data '{"secret_path":"random_test/rsa", "secret_version":"1"}' http://127.0.0.1:8443/gen/key/rsa
{
  "Info": "Key was exsits"
}
```

* encrypt/decrypt

```bash
$ curl --header "Content-Type: application/json"  --request POST --data '{"secret_path":"random_test/rsa", "secret_version":"2","plaintext":"you are handsome man" }' http://127.0.0.1:8443/key/encrypt/rsa
{
  "ciphertext": "a92b38d38140bd2dcb6651ee0a7001af7e48506fdecf2b30ad5767bd229456be1a5b60d8095ac3702dfd34ee4bbd46c35449ad006a48bd185e4090cfd683da26cb0e18b4c35e0a0bd0e8f11659fed5c95a120b6b9ea970b480b59cbfcd2a1f1805a652a6e31df9377456253e106656086026c54b0c81460d2990726a612a8511d755db4919bae1a3fe78e2850073f53e81b9b2cb12f16cfbc890dce2e47a3e47f9e0da4c03f337f94d5dad12b5e70cc89458730c57fece59f737a2e6fdc6713571bdcbf0178746fa595aba520f7e9050be8b20bc7ae606d96bbeeedd4039d86f0899e0ac5aa60040c5a527e23a788fcf3cda70c70e6b7043e8beec4d85c297b5"
}

$ curl --header "Content-Type: application/json"  --request POST --data '{"secret_path":"random_test/rsa","secret_version":"2", "ciphertext":"593834fa8daa9a0ae9f87f40554318ed652540e4c73ad4e07bce7c4815daee468e79cb365bcff4284762bd330eedcd0ba2b4f107c30c9f391a95a594072b2bc11e8706cff3d690f1e1cfcd146750ab4d6239991ac2aa1f87367ed903385d3a21bb8fd5de333f84efa5468e45a503bf4a3e813b7704486141a0755d11b1afdb97eebdb5ac35a6301fc773a4c9445287dadeadac416a3cdb6cfd9de7262e6e64ff201a27ef7cf4675171de42e8f4dedc75a276a26515a490ad1709a2f7dae0a5767c18c6f887db0748dbb67dcab2aeb206fe3946edca083f6198c7c1794a48e1c00fb9ad9dd6d98b4cb97569205936fce4978f581d16a1d116a4875aadbaeecafc"}' http://127.0.0.1:8443/key/decrypt/rsa
{
  "plaintext": "you are handsome man"
}
```

* sign/verify

```bash
$ curl --header "Content-Type: application/json"  --request POST --data '{"secret_path":"random_test/rsa", "secret_version":"2","data":"you are handsome man" }' http://127.0.0.1:8443/key/sign/message
{"signature":"a2060faf5d2be526e37e9e19ad992db53aee7a3cb2abe52ea65867760d3e1ab952e0f608a521a188e064cc3fd667803b38520be80c445cd36f2f71b153af613ce9ffc70d2404e12d0fbdc5843c8221090894056824f635bfe977980db2c956a6506f1b94aada4a071ead225862a2cdf77f61dc857b4af9d9d0f3c7ba3642db8d3c7a7032eb30b578e0f857aeb700d1087d8ff5c3b94a197b3393501da404d0fe239e9ccbce79cc92d355978f98686ee7d28afe5fbb2631613887fa8df27bf98ebb6b7d4c2f8f7832545575d573963b519d59178f16247579b00e3bb8473747c37036e6f432be05bc4df0036e3166f57ba7b5bf1ec93059d4de550f8a20457fef"}

$ curl --header "Content-Type: application/json"  --request POST --data '{"secret_path":"random_test/rsa", "secret_version":"2","data":"you are handsome man","signature":"a2060faf5d2be526e37e9e19ad992db53aee7a3cb2abe52ea65867760d3e1ab952e0f608a521a188e064cc3fd667803b38520be80c445cd36f2f71b153af613ce9ffc70d2404e12d0fbdc5843c8221090894056824f635bfe977980db2c956a6506f1b94aada4a071ead225862a2cdf77f61dc857b4af9d9d0f3c7ba3642db8d3c7a7032eb30b578e0f857aeb700d1087d8ff5c3b94a197b3393501da404d0fe239e9ccbce79cc92d355978f98686ee7d28afe5fbb2631613887fa8df27bf98ebb6b7d4c2f8f7832545575d573963b519d59178f16247579b00e3bb8473747c37036e6f432be05bc4df0036e3166f57ba7b5bf1ec93059d4de550f8a20457fef" }' http://127.0.0.1:8443/key/verify/message
{"Verify Result":true}

$ curl -F "data=@test.txt" -F "secret_path=random_test/rsa" -F "secret_version=2" 127.0.0.1:8443/key/sign/file
{"signature":"5c40168d2f7c1b3baaaa5828c45dc406860b6a043c8b3fe43d471e67254bf038affabba32fd27148f7ac8a78c0fa6f3457f027a6a0cbdb3b42c283d30b4041842eece25fc51d15d941f2ec5298e2fc1a1d0bb39e22a90b31c92d3491ac9864f0c633076505a9c9d31917db1a8fb9f81f94bb9348ed28e7940b2ca9350b6a7b5d334dcc5e92f75b45c28cddb526fcae897cc9f9c42eaa0ab4b6d6f3c9fbefb3287bf542114bf388f75b022c072735860be928a3cbb36a224f904148c4dd5d3cd4de9d7796be5b97f15c2e5bc20e9f4491cae9a6cd29671a2ad277cfc097a00de14612055e9b93e01b0865601e475704ec911fe8eb043547c3c848d69a66f77534"}


$ curl -F "data=@test.txt" -F "secret_path=random_test/rsa" -F "secret_version=2" -F "signature=5c40168d2f7c1b3baaaa5828c45dc406860b6a043c8b3fe43d471e67254bf038affabba32fd27148f7ac8a78c0fa6f3457f027a6a0cbdb3b42c283d30b4041842eece25fc51d15d941f2ec5298e2fc1a1d0bb39e22a90b31c92d3491ac9864f0c633076505a9c9d31917db1a8fb9f81f94bb9348ed28e7940b2ca9350b6a7b5d334dcc5e92f75b45c28cddb526fcae897cc9f9c42eaa0ab4b6d6f3c9fbefb3287bf542114bf388f75b022c072735860be928a3cbb36a224f904148c4dd5d3cd4de9d7796be5b97f15c2e5bc20e9f4491cae9a6cd29671a2ad277cfc097a00de14612055e9b93e01b0865601e475704ec911fe8eb043547c3c848d69a66f77534" 127.0.0.1:8443/key/verify/file
{"Verify Result":true}

```

you can build many funy example with a Encryption AS a services, As for me, I went on to write a simple Data-at-Rest Encryption Services for FTP.


# 0x02 Secret Engine

1. Softhsm2
Most time we are able to use file as `softhsm` backend. also you can choose to use different one : Sqlite3.  and in this case, we are going to use `file` option. 

here is a sample configuration .

```conf
# SoftHSM v2 configuration file

directories.tokendir = /var/tokens
objectstore.backend = file

# ERROR, WARNING, INFO, DEBUG
log.level = ERROR

# If CKF_REMOVABLE_DEVICE flag should be set
slots.removable = false

# Enable and disable PKCS#11 mechanisms using slots.mechanisms.
slots.mechanisms = ALL

# If the library should reset the state on fork
library.reset_on_fork = false
```

due to we are runing it  on docker, so you can generate in your local laptop, also you can generate it within docker automatically. Even mount a remote file which stored in `s3`

Normally, we use `export SOFTHSM2_CONF=/etc/softhsm2.conf` to specialized the configuration file, hence we can use `softhsm-util` to get some related info from the file folder. but it's not good option for a services, we can't `set` or `unset` within code each time. so I decided to use docker, hence we can export the configuration at initial. and mount different folder each time.


2. Slot PIN 

in many case, the system would be vulnerable once the root token was leaked. so, how to protect root key is very important.  due to I didn't have much energy to `softhsm` development. so i choose to use `Shamir secret sharing` algorithm to protect the pin secret. and make sure it was send to each key custodians safety.

> In the following sections, we use `SSS` instead of `Shamir secret sharing`.

*  `SSS` was able to make a key shares for PIN Secret 
*  `PGP Key` was able to encrypt the sensitive information with public key, and it was only able to decrypted with private  key

So here is the working flow.
    1. generate the 32 pin secret randomly
    2. get 3 PGP public keys from each key custodian
    3. split PIN secret with `SSS` into `3` parts with `threshold=2`
    4. encypted each key share with PGP public Key
    5. share the each encrypted key shares to each key custodian 

As for now  you are already have a secret engine and make the PIN secret was generated safety. but cli usage was not friendly for many services. let's do some change on that.

# 0x03 Restful Api Services

In fact, that's would be two part of webe services . one part to connect the `softhsm` with PKCS11 interface, and another one was designed to provid a api service.

1. PKCS11 interface 

I have a research on some pkcs11 library for python language.  Finally I selected [python-pkcs11](https://github.com/danni/python-pkcs11/) . this library was easy to use.

For the secret part, I write two simple classs.
    1. Key Management. eg. key generate and key rotate 
    2. Crypto Management. eg. encrypt/decrypt, sign/verify


2. Flask Api Service

Flask is a popular web framework for python programmer.  in this project, I designed some API.

```python
@app.route("/gen/key/<key_type>", methods=['GET', 'POST'])
def genkey(key_type):
    pass


@app.route("/key/encrypt/<key_type>",methods=['GET', 'POST'])
def encryptit(key_type):
    pass

@app.route("/key/decrypt/<key_type>",methods=['GET', 'POST'])
def decryptit(key_type):
    pass


@app.route("/key/sign/<payload_type>",methods=['GET', 'POST'])
def signit(payload_type):
    pass

@app.route("/key/verify/<payload_type>",methods=['GET', 'POST'])
def verifyit(payload_type):
    pass

```

All you need is only to post the plaintext/ciphertext and specialized the key path & version to server. then you will get the answer.



# 0x04 RUN IT

As for now, we already was able to run all things in the local env, but how can we make it was working with docker?

Due to we have different serivces, we can use `docker-compose` to manage it. here is the docker-compose file.

```yaml
version: "3"
services:

  softhsm2-proxy-base:
    build: base/
    image: softhsm2-proxy:base

  softhsm2-proxy:
    depends_on: 
      - softhsm2-proxy-base
    build: 
      context: softhsm2-proxy/
      args:
        HSM_KEYSHARES: ${HSM_KEYSHARES}
        HSM_KEY_THESHOLD: ${HSM_KEY_THESHOLD}
        MY_TOKENLABEL: ${MY_TOKENLABEL}
        MY_PKCS11_PROXY_PORT: ${MY_PKCS11_PROXY_PORT}
    image: mo-softhsm2-proxy
    expose: 
      - ${MY_PKCS11_PROXY_PORT}
      - 8443
    volumes:
      - ${PWD}/softhsm2-proxy:/root
```
As you can see,   the main parameters was separated from docker env. we can modified it at the configuration  file simply .

```yaml
HSM_KEYSHARES=3
HSM_KEY_THESHOLD=2
MY_TOKENLABEL=DEMO
MY_PKCS11_PROXY_PORT=5657
```

Besides the docker-compose file. we are still need to build a base image.  one for the softhsm and another one for the api services.

```dockerfile

FROM ubuntu:latest
LABEL maintainer "xxxx <xxxx@xxxx.com>"

ENV LANG=en_US.UTF-8
ENV DEBIAN_FRONTEND=noninteractive

# Change To USTC Mirror For China Users
RUN sed -i 's/archive.ubuntu.com/mirrors.ustc.edu.cn/g' /etc/apt/sources.list

RUN apt-get update && apt-get install -y opensc opensc-pkcs11 \
    ca-certificates \
    git-core \
    build-essential \
    tzdata \
    python3 \
    python3-pip \
    autoconf automake pkg-config botan openssl llvm curl gcc cmake sqlite3 \
    libtool libcrypto++ libseccomp-dev libssl-dev libsqlite3-dev libp11-dev libbotan-2-dev libengine-pkcs11-openssl  zlib1g-dev

# complied manually with botan as crypto backend ,and enable sqlite support
RUN git clone https://github.com/opendnssec/SoftHSMv2 && \
    cd SoftHSMv2 && \
    ./autogen.sh && \
    ./configure --with-crypto-backend=botan --with-objectstore-backend-db && \
    make -j8 && make install 

RUN git clone https://github.com/SUNET/pkcs11-proxy && \
    cd pkcs11-proxy && \
    cmake . && \
    make && \
    make install
```

and here is the dockerfile for encryption services:

```dockerfile
FROM softhsm2-proxy:base
LABEL maintainer "xxxx <xxxx@xxxx.com>"


ARG HSM_KEYSHARES
ARG HSM_KEY_THESHOLD
ARG MY_TOKENLABEL
ARG MY_PKCS11_PROXY_PORT

ENV HSM_KEYSHARES=$HSM_KEYSHARES
ENV HSM_KEY_THESHOLD=$HSM_KEY_THESHOLD
ENV TOKENLABEL=$MY_TOKENLABEL
ENV PKCS11_PROXY_PORT=$MY_PKCS11_PROXY_PORT


ENV SOFTHSM2_CONF="/root/softhsm2.conf"
ENV PIN_PRO_PGP_PUBLICKEYS_DIR="/opt/publickeys/"
ENV PIN_SECRET="/tmp/pinsecret"
ENV PIN_SECRET_PGP="/tmp/pinsecret.gpg"
ENV SO_PIN_SECRET="/tmp/sopinsecret"
ENV SO_PIN_SECRET_PGP="/tmp/sopinsecret.gpg"
ENV SSS_COMBINE="/usr/local/bin/secret-share-combine"
ENV SSS_SPLIT="/usr/local/bin/secret-share-split"

ENV PKCS11_MODULE="/usr/local/lib/softhsm/libsofthsm2.so"
ENV PKCS11_DAEMON_SOCKET="tls://0.0.0.0:${PKCS11_PROXY_PORT}"
ENV PKCS11_PROXY_TLS_PSK_FILE="/root/TLS-PSK"

COPY web/ /root/
RUN pip3 install -r /root/requirements.txt -i https://pypi.doubanio.com/simple

COPY publickeys/* ${PIN_PRO_PGP_PUBLICKEYS_DIR}
COPY softhsm2.conf /root/softhsm2.conf
COPY start.sh /root/start.sh
COPY TLS-PSK ${PKCS11_PROXY_TLS_PSK_FILE}
COPY sss/secret-share-combine ${SSS_COMBINE}
COPY sss/secret-share-split ${SSS_SPLIT}
RUN chmod a+x /root/start.sh
ENTRYPOINT [ "bash","/root/start.sh" ]

```

also You can find more details in https://github.com/mylamour/Mo-Vault . i write a step by step guide to help you to run it. simply, you just need to run the below command:

```bash
    docker-compose --env-file ./config/.env.dev build
    docker run --rm  -v $PWD/tokens/user02:/var/tokens -p 5657:5657 -p 8443:8443 mo-softhsm2-proxy:latest
```


# 0x05 Conclusion 

This is just a simple toy, Hope it can play a little help in your design. Maybe you can write a new one with different programming language.  For prod usage, it still need to do a lot of improvement.  


# 0x06 Resources

* [sss](https://github.com/dsprenkels/sss)
* [softhsm2](https://github.com/opendnssec/SoftHSMv2)
* [Pass variable from docker-compose file to docker file](https://github.com/docker/compose/issues/5600)
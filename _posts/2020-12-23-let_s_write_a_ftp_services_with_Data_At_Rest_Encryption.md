---
layout: post
title: let's write a ftp services with Data At Rest Encryption
categories: 安全工程师
kerywords: DARE Encryption Decryption
tags: 安全研发
---

# 0x01 Intro

In this tutorial, we will build a ftp Service with data at rest encryption. that's mean all the file was encrypted at FTP server.

This is what you need:

![image](https://user-images.githubusercontent.com/12653147/103079245-7026a780-460e-11eb-884a-77f4e129bc22.png)

* Encryption As A Services (You can find a tutorial on how to create it in the last blog #81, also you can change with other eaas )
* pyftpdlib (use it to build a ftp services) 
* pycryptodome (use it to do a local encryption/decryption function)
* docker (as run time, also you can run it in your localhost)

As you can see in this picture, we are going to use linux system authentication to verify user and use file system as the storage backend. that's mean you can integrated the auth part with linux system but not to modified the services code. 

# 0x02 Event Handler

Here is the sequence diagram. as you can see in the below picture, it was mainly with 3 parts. and here's a brief introduction.

![pki_connection (1)](https://user-images.githubusercontent.com/12653147/103064383-d3a0dd00-45ee-11eb-9e62-afc44f09480a.png)

* login
At the login part,  FTP Service will check the kek file path for each user at each login, and decrypt the KEK string to get user's AES key, then use AES key to decrypt user's file.

> KEK file should be created on the user's first login, and updated KEK file content with generate random AES key and encrypted it by RSA Key

* upload
At the upload part, ftp service was able to handle this event with a  pipeline.  for example, you can create a malware detection services for each new file. then encrypted it with user's  AES key.

* logout
At the logout part, there was two main things. one is to encrypt all unencrypted files. then encrypt the AES key by RSA key and save it

# 0x03 Encrypt/Decrypt

Before we talking about encrypt & decrypt, you should know some basic crypto algorithms. `RSA` and `AES` is a common crypto algorithm.  `AES` was a  symmetric algorithms , that's mean you can use one aes key to encrypt/decrypt file.
`RSA` was a asymmetric algorithms , and you can use public key to encrypt some message, but only able to use private key to decrypt that.  in this case, we use `RSA` to protected the `AES` key which is really used to encrypt and decrypt files. 

![image](https://user-images.githubusercontent.com/12653147/103079375-afed8f00-460e-11eb-8776-795ee6ada9cf.png)

> here is a encrypted key

```bash
➜  keks git:(main) cat .8b1c1c1eae6c650485e77efbc336c5bfb84ffe0b0bea65610b721762.secret
62a65113d8a5fab27f56491addf69fc5d03ca4441b1b6fb558e5c0a20b613d38170c341385698b078bc8fdd157cb78cd0d3c0f95bfee53e9f05e100cda01583c3a8f99250c5be8565403436b4b35356138b5397fd72a824e1d3785002347568ab92f36b511063d25a8a3915766bc3a85caf4f57d503b6aa99d9fa4e683aa8b3821a68b4ffba116350e88e2a08f8d3385764bdfe157764c85c94039f6c3a2ba37395e6ceb46f7c4be88220352bb35091b249e7b6d7fbad297def32bf86d87a1c0f4dff1a9d081eab80907934914112e18e613fd7ec27caca82e1b48a518e7b0fa5987ea8508ebc051ad94fa509c0e510636930a3b83b6f3624d416f460e3abf2e
```

* Key Encrypt/Decrypt
Here is the sample code for encrypt key, also you can change it with your own service.

```python
def key_decrypt(ciphertext):
    data = {"secret_path": SECRET_PATH, "secret_version": SECRET_VERSION, "ciphertext": ciphertext}

    response = requests.post('{}/key/decrypt/rsa'.format(EAAS_URL), json=data)

    return json.loads(response.text)['plaintext']

def key_encrypt(plaintext):
    data = {"secret_path": "{}".format(
        SECRET_PATH), "secret_version": SECRET_VERSION, "plaintext":plaintext}

    response = requests.post('{}/key/encrypt/rsa'.format(EAAS_URL), json=data)
    
    return json.loads(response.text)['ciphertext']
```

* File Encrypt/Decrypt
Here is sample code to encrypt file and decrypt file. in this case, we are use `pycryptodome` to do a local encryption/decryption.  There is no doubt that it will increase the speed compared with the use of encryption services.  

```python
class Dropzone(TLS_FTPHandler):

    def encrypt(self, message):
        message = self.pad(message)
        iv = Random.new().read(AES.block_size)
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        return iv + cipher.encrypt(message)

    def decrypt(self, ciphertext):
        iv = ciphertext[:AES.block_size]
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        plaintext = cipher.decrypt(ciphertext[AES.block_size:])
        return plaintext.rstrip(b"\0")

    def encrypt_file(self, file_name):
        with open(file_name, 'rb') as fo:
            plaintext = fo.read()
        enc = self.encrypt(plaintext)
        with open(file_name + ".enc", 'wb') as fo:
            fo.write(enc)

    def decrypt_file(self, file_name):
        with open(file_name, 'rb') as fo:
            ciphertext = fo.read()
        dec = self.decrypt(ciphertext)
        with open(file_name[:-4], 'wb') as fo:
            fo.write(dec)
```

also, as you can see, this class was Inherited from `TLS_FTPHandler`, that's mean it was able to enable FTP over TLS feature.

# 0x04 with Container

we can build a service easily with docker,  So I've been using docker to build services recently.

 here is the `docker-compose` file
```yaml
  dropzone:
    depends_on: 
      - eaas
    build: 

      context: dropzone/
      args:
        DROPZONE_PORT: ${DROPZONE_PORT}
        DROPZONE_SECRET_PATH: ${DROPZONE_SECRET_PATH}
        DROPZONE_SECRET_VERSION: ${DROPZONE_SECRET_VERSION}
      
    image: mo-vault:dropzone
    container_name: mo.vault.dropzone
    ports: 
      - "${DROPZONE_PORT}:${DROPZONE_PORT}"
    links:
      - "eaas:mo.vault.eaas"

    healthcheck:
      test: ["CMD", "curl", "-f", "http://mo.vault.eaas:8443"]
      interval: 30s
      timeout: 10s
      retries: 5
      
    volumes:
      - ${PWD}/dropzone:/dropzone
      - ${PWD}/local/dropzone/keks:/dropzone/keks
      - $PWD/local/dropzone/remote:/home/

```
> if you want access some container services within another container, you should specialized the network link.

Now, we can run it with `docker-compose` directly.

```bash
rm -rf local/tokens/user02 local/dropzone && docker-compose  --env-file ./config/.env.dev build
rm -rf local/tokens/user02 local/dropzone && docker-compose  --env-file ./config/.env.dev up eass dropzone
```

for the whole demo, you can see this recorder:
> tricks: it was recored with `asciinema`, and  you can modified the cast file to delete some personal info.

[![asciicast](https://asciinema.org/a/Jdcp0CA2DOesLr2pC3K6zlwtX.svg)](https://asciinema.org/a/Jdcp0CA2DOesLr2pC3K6zlwtX)


# 0x05 Conclusion

In this blog, we use `pyftpdliib` and `eaas` to build a  FTP services with DARE (you can find the whole project code with this [project code](https://github.com/mylamour/Mo-Vault/)).  Maybe FTP is a little out of date, but it's still a good example to explain how we build a service to support data at rest encryption.  and you can use `sftp` to do another demo, just handle the login/logout put/download event.  Also, you can change the backend with s3 fs, and integrated Auth with LDAP, and so on.


# 0x06 Resources

* [pyftpdlib](https://pyftpdlib.readthedocs.io/en/latest/tutorial.html)
* [Encrypt & Decrypt using PyCrypto AES 256](https://stackoverflow.com/questions/12524994/encrypt-decrypt-using-pycrypto-aes-256/12525165#12525165)
* [docker network](https://docs.docker.com/compose/networking/)
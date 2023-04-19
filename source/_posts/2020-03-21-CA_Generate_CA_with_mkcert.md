---
layout: post
title: How to use mkcert
categories: 安全工程师
kerywords: 证书 CA Cert
tags: 数据安全 工具 旧文迁移
---

# install & generate root CA  with mkcert

You can install `mkcert` by download  binaray from `https://github.com/FiloSottile/mkcert/releases/download/` , then move it to your custom path.  

generate Root CA like that:

```bash
i➜  /tmp  ᐅ  mkcert -install
```
(picture was take from it installed, that would be different from first time to install it)
![Screenshot from 2020-03-21 09-16-19](https://img.iami.xyz/images/77216357-99f7ee80-6b11-11ea-8ef5-52805426482c.png)

Also, you can find it in your local directory.

```bash
i➜  /tmp  ᐅ  ls -R ~/.local/share/mkcert
/home/mour/.local/share/mkcert:
rootCA-key.pem  rootCA.pem  test

/home/mour/.local/share/mkcert/test:
91sec.club.crt  91sec.club.key
```

# generate  cert with openssl & signed by your Root CA

```bash
i➜  /tmp  ᐅ  sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout 91sec.club.key  -out 91sec.club.crt
i➜  /tmp  ᐅ  mkcert -key-file 91sec.club.key -cert-file 91sec.club.crt docs.91sec.club
```

Now, upload your cert to remote server, and configure it by your cert.  `nginx -s reload`  

![Screenshot from 2020-03-21 09-21-07](https://img.iami.xyz/images/77216441-476b0200-6b12-11ea-9035-dde130b80be0.png)

#  open your browser & test and verify

open your `chrome` browser, and access your website（In my scenario, i change my host point to my website)

![Screenshot from 2020-03-06 15-52-07](https://img.iami.xyz/images/77216334-77fe6c00-6b11-11ea-9732-e6e5bade442e.png)

Attention please, **it's only worked for those computer which was installed by your root CA.**    and not


If you want find where it is, please open your `chrome` and input `chrome://settings/certificates?search=cert` and click `authorities` tab.  (that would be different in another platform. for example, cert management in MacOS was manager by `keychain access`) 

![Screenshot from 2020-03-21 09-14-09](https://img.iami.xyz/images/77216316-61f0ab80-6b11-11ea-95f6-9e203e0c43b6.png)
![Screenshot from 2020-03-21 09-14-26](https://img.iami.xyz/images/77216315-5f8e5180-6b11-11ea-95da-a7df65830343.png)

So, this is a  demo for you to learn CA part. if you want deep into it, you should know more about NSS, PKI, And so on.


# Resources
* [NSS](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/NSS)
* [mkcert](https://github.com/FiloSottile/mkcert/)




---
layout: post
title: 企业中里证书碎碎念
categories: 安全工程师
kerywords: 企业安全 互联网企业安全 数据安全 证书 OpenSSL SSL证书 安全架构
tags: 数据安全
---


# 业务上的那些证书

根据业务方需求常见有这几种client， server， codesigning， emaail protection。
server的基本就是 SSL证书，client一般是设备证书。除此之外按用途还有加解密，加签验签，CA证书等。

交付的文件格式： pfx/p12，jks, 密码和证书单独分发
交付的形式： 文件， 存储在特定软件内， 硬件介质

```bash  

openssl pkcs12 -in yourP12File.pfx -nocerts -out privateKey.pem
openssl pkcs12 -in yourP12File.pfx -clcerts -nokeys -out publicCert.pem
 
```

sm2的需要gmssl


# 证书存储方案

结合基础设施来做的。这个图不便贴。 记住以下几点：

1. 私钥必须被密码保护
2. 私钥只能被应用读取
3. 密码必须单独存储，在配置中心，只能被应用读取。

其实这也就意味着有几对Key Pair. 不同Env分别一套。 Staging, Prd, Integration

也可以只对私钥加密

```bash
openssl rsa -aes256 -in your.key -out your.encrypted.key
```

# SSL Pinning 

这里应该考虑的是业务连续性的问题，尤其是移动端预埋了pin值后，证书失效或者需要更换的一个方案，尤其是现在公签证书有效期缩短到1年之后。同时客户端也不是说发版就发版的。一般推荐使用sha256做pin值。（有的企业还喜欢使用用中间CA的偷懒，现在中间CA是6个月一换，千万注意不要这么操作，避免业务完犊子）

(HTTP Public Key Pinning (HPKP))


pinning的方式无论是选择cert还是public key(额外信息subjectPublicKeyInfo, RSAPublicKey/DSAPublicKey)都有各自的缺点。这也需要考虑到证书的更换方式有什么不一样。

```bash

# 从证书里提取公钥
openssl x509 -pubkey -noout -in cert.pem  > pubkey.pem

# 查看摘要hash并查看base64格式
openssl dgst -sha256 -binary xxxx | openssl enc -base64
```

针对pinning值的话则建议从证书到**issuing CA到root CA都应包含在内**。同时要有一个**备用的pin值**。


# 证书监控

这是很大一坨，先讲下有哪些资产，然后去理有哪些基础设施的。再设计监控策略，然后告警推送。
例如，我有自建CA的证书（可能不止一个，有多个issuing CA），公签CA的证书，直接购买的CA的证书，泛域名证书，设备证书。那么我是依托CMDB做监控，还是单独的做一套系统，监控系统间的数据怎么互相验证？ 例如CMDB里有一套监控，RA里面做一套监控，两者的数据进行对比。（还要考虑制定接收人，是选择业务方还是选择员工，员工离职了怎么办？）设备证书不能够像SSL证书一样直接通过request hostname去做，那又应该怎么去做呢？

# 流程优化

申请证书的流程自动化, 之前写了自助申请工具，对接到RA上面的接口。现在画了UI准备在PAAS平台上集成自助申请功能。

# 其他

1. 从网页提取证书,
With SNI: 
`openssl s_client -showcerts -servername www.example.com -connect www.example.com:443 </dev/null`
without SNI
`openssl s_client -showcerts -connect www.example.com:443 </dev/null`
2. 查看DN `openssl x509 -in xxx.pem | sed 's/^subject=//' `
3. 采用yubikey存储 
4. 查看CSR信息： `openssl req -noout -text -in xxx.csr`
5. 验证证书里和CSR文件公钥文件，或者加签验签
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


# 总结
细节见水平,更细的可以去看RFC文档。
金融企业里面使用证书的场景更多，因为整个生态里所有的机构之间都是通过证书认证对数据进行加解密和加签验签的。 例如网联，银联（国际），清算中心等各类。

WD-40确实很好使，键盘的连击现象似乎减缓了一些。
// 20201010: WD-40过于油腻，只能缓解一会。不如把键盘全部拆掉放水里用洗衣液洗洗（机械键盘）。

 

# 参考资料
* [openssl get cert from server](https://stackoverflow.com/questions/7885785/using-openssl-to-get-the-certificate-from-a-server)
* [openssl sign verify](https://stackoverflow.com/questions/5140425/openssl-command-line-to-verify-the-signature)
* SM2
* [Openssl command line utils](https://wiki.openssl.org/index.php/Command_Line_Utilities)
* [CFCA SSL TOOLS](https://ssl.cfca.com.cn)
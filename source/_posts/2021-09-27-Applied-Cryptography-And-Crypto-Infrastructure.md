---
layout: post
title: 浅谈加密基础设施
categories: 安全工程师
kerywords: 应用架构 安全架构 数据安全 企业安全架构 架构设计 业务驱动 密码学基础
tags: 安全架构 数据安全
---

# 0x00 前言

讲加密基础设施前，会介绍一下密码学基础，不过需要先声明一下的是我仅仅是能理解并应用。所以如果文中笔误，还请读者及时指出。如果只需要关注加密基础设施建设的一些经验，可直接跳至第二节——0x02.

# 0x01 密码学基础

以下章节中的密码学基础部分的知识主要总结自《图解密码技术》读书笔记，本节图片系原文所载。有个朋友说这个是神书，我觉得大可不必，不过确切是本好书，因为能够帮助数学基础不是很好的读者快速了解密码学基础。

## 1. 受到的部分威胁和对应的密码技术

![image](https://img.iami.xyz/images/134798799-f9e30f53-fe40-4e0e-b051-e92cbfb5fc47.png)

## 2. 基本的密码技术与常识

基本密码技术分为六部分：对称密码（Symmetric Cryptography)，非对称密码(Asymmetric Cryptography)，单向散列函数，消息认证码，数字签名，伪随机数生成器。 

![image](https://img.iami.xyz/images/134798322-444eb6ad-0e27-41c2-a56d-e18c0bf7b28a.png)
![image](https://img.iami.xyz/images/134807902-63539b95-919b-47b9-99d5-09c550051a12.png)

大部分密钥技术中都需要密钥，这里面有个值得参考的观点是————**密钥与明文是等价的** (即如果明文价值100w，那密钥也就值100w。)

以下是各种不同的密钥：
1. 对称密码的密钥与公钥密码的密钥
2. 消息认证码的密钥与数字签名的密钥
3. 用于确保机密性的密钥与用于认证的密钥
4. 会话密钥与主密钥
5. 用于加密内容的密钥与用于加密密钥的密钥
6. 基于口令的密码（Password Based Encryption)

## 3. 对称密码

对称密码可以分为两类：序列密码和分组密码。如其名，序列密码单独加密每个位，分组密码加密明文分组。 分组密码（Block Cipher)每次只能处理特定长度的一块（Block），下面主要介绍分组密码。

对称密码的加解密主要依赖是比特的异或计算， 假设明文是010101,密钥是111111， 那么异或得到的密文就是101010， 翻过来密文进行解密时候同密钥进行异或就可以得到010101

```bash
0 XOR 0 = 0
0 XOR 1 = 1
1 XOR 0 = 1
1 XOR 1 = 0
```

### 3.1 DES与3DES

DES全称是Data Encryption Standard, 1977年被FIPS采用，基本结构为Feistel网络/结构。目前不应被用于现有或新的加密用途。

Feistel网络中，加密和解密可以用完全相同的结构实现，加密的各个步骤被称为轮，轮数可以任意增加。

![image](https://img.iami.xyz/images/134833060-3c2f99b8-49bd-45aa-a32f-0bd7d3c46828.png)

DES就是一种16轮循环的Feistel网络。 即每次输入输出后左右侧对调，然后使用新的子密钥通过轮函数进行异或。
下面是一个三轮的Feistel网络。记住DES是16轮的。
![image](https://img.iami.xyz/images/134833628-ca10112e-61bb-4f60-a722-c003644bd967.png)

而3DES就是将DES重复3次得到的。
![image](https://img.iami.xyz/images/134833816-284a141d-2430-46e2-be27-6e495ccccd55.png)

不过可以发现3DES加密过程是加密-解密（这一步是为了能够向下兼容）-加密，如果DES密钥1，2，3相同那么其实3DES就和DES是一样的。 如果1，2，3完全使用不同的密钥就叫DES-3DES,如果1，3相同，2不同就是DES-EDE2。

3DES目前暂时允许使用，但不应用于新用途。

### 3.2 AES

全称是Advanced Encryption Standard，由NIST选拔作为FIPS标准。我最开始的时候以为AES是一种，其实AES是由一系列算法选拔得到的。1997年开始募集（15个算法中5个入围），2000年选定分组密码Rijndael（by比利时密码学家Joan Daemen & Vincent Rijmen）。

Rijndael也是由多个轮构成，不过用的是SPN结构，不再是Feistel网络。主要分为SubBytes（16字节分组进行处理，获得一张拥有256个值的替换表S-Box）, ShiftRows(以4字节为单位的行进行某种规则向左平移，每一行平移的字节数不同), MixColumns（对1个4字节值进行比特运算）, AddRoundKey（将MixColumns的输出与轮密钥进行异或）。完成从SubBytes->AddRoundKey算是1轮，Rijndael结构需要重复10-14轮，解密时顺序相反，方向相反即可。AddRoundKey -> InvMixColumns -> InvShiftRows -> InvSubBytes

### 3.3 填充模式的优劣对比

分组意味着能处理特定长度的，针对任意长度的就要对分组密码进行迭代，迭代的方式成为模式。

![image](https://img.iami.xyz/images/134799110-5701d4ca-0853-4ae5-b64d-3880ebe169e7.png)

OFB模式与CTR模式的对比
![image](https://img.iami.xyz/images/134799158-2b0e95ec-5dba-4587-b98b-43c991ccfa24.png)

CFB模式与OFB模式的对比
![image](https://img.iami.xyz/images/134799177-da302960-e91b-4330-bf58-1cb4db925cbb.png)

## 4. 非对称密码

又称为公钥密码(Public-Key Cryptography), 主要是依托于人类目前尚无法快速求解离散对数的原理。

![image](https://img.iami.xyz/images/134806868-a55de0d7-1ee1-4b30-8837-725ef4724ee6.png)

### 4.1 RSA
#### 4.1.1 RSA的加密和解密

![image](https://img.iami.xyz/images/134799645-35816dcc-bdde-4027-8931-13e32816c66d.png)
![image](https://img.iami.xyz/images/134799695-b79a5327-b7c8-4277-8fc3-5b56b97fa1b2.png)

#### 4.1.2 签名与验签

![image](https://img.iami.xyz/images/134807630-4abf609a-ac62-410e-b621-375e8791e44f.png)

一般有两种形式，一种是直接对消息签名，另一种是对消息的散列值进行签名。
![image](https://img.iami.xyz/images/134806849-1e0dbc09-6d2b-403a-8368-3658c33e10fe.png)

### 4.2 ECC

全称为Elliptic Curve Cryptography 椭圆曲线密码。


主要包含三个方面:
* 基于椭圆曲线的公钥密码
* 基于椭圆曲线的数字签名
* 基于椭圆曲线的密钥交换

#### 4.2.1 DH交换

![image](https://img.iami.xyz/images/134837755-5945efe9-35e8-4dc6-a375-0db70582db14.png)

### 4.3 应用与攻击方式:

应用:
* 公钥证书
* SSL/TLS

攻击方式:
* 中间人攻击
* 对单向散列函数的攻击
* 利用数字签名攻击公钥密码
* 潜在伪造

### 4.4 混合密码系统

简单来说就是用非对称密码保护对称密钥，用对称密钥进行对数据的加解密。

加密
![image](https://img.iami.xyz/images/134837318-38e63b97-e096-44f6-b96b-2c2b01e5559b.png)

解密
![image](https://img.iami.xyz/images/134837450-bad8c2b7-6278-42b9-b10e-0338bf5a7f2a.png)


## 5. 单向散列函数

英文名 One-way hash function，又称作消息摘要函数（Message digest function）、哈希函数、杂凑函数。
输入成为消息(message)也成为原像（Message digest）, 输出为散列值(hash value)也成为消息摘要（Message digest）或者指纹（fingerprint）
> 能够辨别出是否被篡改，但无法识别伪装。

特性: 
1. 根据任意长度的消息计算出固定长度的散列值
2. 能够快速计算出固定长度的散列值
3. 消息不同散列值不同（抗碰撞性）
4. 具备单向性

应用:
* 检测软件是否篡改
* 基于口令的加密
* 消息认证码
* 数字签名
* 伪随机数生成器
* 一次性口令

常见的单向散列函数:
* MD4、 MD5
* SHA-1、SHA-256、SHA-384、SHA-512
* RIPEMD-160
* SHA-3

## 6. 消息验证码

英文名 Message Authentication Code， 输入为任意长度的消息和一个发送者与接收者之间共享的密钥，输出为固定长度的数据，即MAC值。
> 能够辨别篡改和伪装，但无法解决对第三方证明，以及防止否认

### 6.1 实现方法

1. 使用单向散列函数实现
使用SHA1、SHA-224、SHA-256、SHA-384、SHA-512所构造的HMAC分别称为HMAC-SHA1、HMAC-SHA-224、HMAC-SHA-256、HMAC-SHA-384、HMAC-SHA-512
![image](https://img.iami.xyz/images/134801218-fd27c599-23ee-4253-a28e-88069b0b39ac.png)
2. 使用分组密码实现
3. 其他方法（流密码，公钥密码）

### 6.2 应用与攻击方式

应用:
* SWIFT (参考电子支付基础的一些分享资料)
* IPsec
* SSL/TLS

攻击方式:
* 重放攻击
* 密钥推测攻击

## 7. 伪随机数生成

很多地方都会用到随机数，生成密钥，密钥对，初始化向量，Nonce，盐。但是软件是没有办法生成真正的随机数的，软件生成的都是伪随机数。

![image](https://img.iami.xyz/images/134837908-cd79566b-7e25-49ba-8ef1-8f308a470865.png)

生成伪随机数有以下几种方法:
* 杂乱的方法
* 线性同余法
* 单向散列函数法
* 密码法
* ANSI X9.17

## 8. PGP

略，可参考，PGP: Pretty Good Privacy - Garfinkel Simson

## 9. 关于密码系统的信息安全常识

* 不要使用保密的密码算法
* 使用低强度的密码比不进行任何加密更危险
* 任何密码总有一天都会被破解
* 一次性密码本理论上是无法破译的，但实际过程因为面临密钥配送问题，保存问题，重用问题，同步问题，生成问题而没有得到使用。
* 盐主要是防御字典攻击的

# 0x02 加密基础设施

这里先介绍常规做基础设施需要的特性有哪些，然后针对每一种不同的不同的设施稍作补充。 图是临时画的，包含了去做一套加密基础设施涉及到的不同方面。下面我会简单介绍图中的几块。

![image](https://img.iami.xyz/images/134858593-6409a2f4-4318-4988-982f-4ec3c71072cd.png)（绘制by作者）


* Integration(Application/System)
    * Logging Management
    * Monitoring Management
    * Identify Management
    * Access Management 
    * etc...

* Optimization (Tech/Operation/...)
    * Workflow & Pipeline
    * Support Template 
    * HW/SW Performance 
    * Scenario
    * etc ...

* Customer Service (Application/User/...)
    * Support Service 
    * Self Service 



在知道在做某些Solution时需要考虑到的点后，我们看下加密基础设施的大概Scope是什么样的（绘制by作者）:

![image](https://img.iami.xyz/images/134870125-50c0bbcb-8a57-4155-a262-fe94643aebe3.png)

以PKI进行举例(之前曾经总结过[一篇关于CA/RA文章](https://iami.xyz/What-Hells-In-CA-And-RA/), 以及另[一篇关于HSM的](https://iami.xyz/What-Hells-In-HSM/)), 在确定了建设PKI的方案后，对逻辑架构和物理架构进行设计，同时包含了与其他系统/服务（日志，监控，权限，加密机等）的整合，在系统进行部署并提供服务后。继续建设整合服务，例如提供Support template， Customer Service，以及提供一定的SDK让其他系统/应用进行调用。不同功能的CA产生的不同证书提供给不同的应用或用户，其中提供给员工用于访问内部系统的证书是不是可以通过MDM工具推送到员工的Laptop，以及LB上的用于提供TLS服务的证书，以及所有需要根证书的地方等等。尽量优化日常运营中繁复的工作。

同样的针对HSM，KMS或者说Secret Management之类的也是类似的做法。 

# 0x03 总结

纸上得来终觉浅，绝知此事要躬行。

# 0x04 参考资料

* [离散对数为什么是难题](https://www.zhihu.com/question/26030513)
* [SM2国密算法/椭圆曲线密码学ECC之数学原理](https://www.jianshu.com/p/5b04b66a55a1)
* 图解密码技术
* 应用密码学
* 深入浅出密码学
* 商用密码应用安全性评估白皮书
* PGP: Pretty Good Privacy - Garfinkel Simson



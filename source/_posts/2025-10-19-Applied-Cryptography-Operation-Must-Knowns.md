---
layout: post
title: 密码学运营必知必会
categories: 安全架构师
kerywords: SM2 ECC Curve ASN.1 Applied Cryptopgraphy CipherSuite HMAC HKDF Encrypt Decrypt X509 证书 密钥 KeyBlocker
tags: 安全运营
translated: true
---

> 试着从架构师视角拆解一下日常运营中需要知识，以求即见树木，也见树林。 

# 0x01 基础知识

日常运营中最常见的无非是DER，CER，PEM格式的证书及私钥。这些文件的背后到底是如何编码定义的？实际都是通过ASN.1编码规则根据一定的数据结构定义完成的。于此同时，真随机数带来的不可预测性决定了密钥的安全性。

1. 格式与编码

![img](https://img.iami.xyz/images/cryptography/asn.1_and_cryptographic_format.png)

ASN.1定义了一系列的编码规则，能够把证书的数据结构（X.509格式定义了证书的数据结构）转换为二进制进行存储。同时根据不同的应用场景，又存在不同的证书封装格式。在不同的标准间进行转换。

// 关于X系列标准，感兴趣的可以扩展去了解一下ITU-T， IETF，ISO，IEEE之间的协作模式。看一下整体怎么做出来的，为什么有ASN, RFC, ISO标准等。他们如何负责不同领域的标准制定，以及对外进行推行。例如关于PQC的最新标准是Y.3830

2. 从随机数开始到椭圆曲线

![img](https://img.iami.xyz/images/cryptography/from_random_number_to_cryptographic_applicatoin.png)

先看随机数的生成，一般有HRPNG和CSRPNG。HSM具备HRPNG模块，提供生成真随机数的能力。真随机数是密钥体系的基础，不可预测的真随机数用来做密钥，iv，Nonce等都可以。除了HSM之外，日常硬件也提供CSRPNG能力，一般是读取各种电子噪声做为熵池，然后通过计算得出随机数。不过这些都是硬件层面和Kernel层面。在系统层面，操作系统封装了对应的接口，用来生成随机数。之后又可以通过编程语言完实现调用，并达到跨平台的作用。常见的SDK有openssl（c/c++, 同时提供了多语言的binding），tink（java系），bouncy castle（java系），cryptography.io(python系)，这些SDK封装了常见密码学的算法实现，用以支持对应的mechansim，同时支持一定的密码学套件（ciphersuite）。有的SDK甚至提供多Provider并且具备一定的Key Management功能。

![img](https://img.iami.xyz/images/cryptography/cryptographic_primitive_mechansim_ciphersuite_and_application_and_lifecycle_management.png)

不过最根本的还是数学原理，曲线方程，求余，有限域等等。

![img](https://img.iami.xyz/images/cryptography/how_ecc_works_ecdh_ecdsa.png)

因为之前的博客里总结过常见的算法（参考[浅谈加密基础设施](https://fz.cool/Applied-Cryptography-And-Crypto-Infrastructure/)，但是缺少了椭圆曲线这一块，因此特意整理了一张Slide在这里。

RSA是基于大数分解难题，而椭圆曲线则是基于椭圆曲线离散对数。这里选择的是以p256曲线为示例，通过查看对应的曲线参数并通过matplot绘制了对应的图像。但实际并无法完全可视化出来。具体生成过程和曲线要点就不介绍了。直接看图。另外就是需要着重关注的ECDH和ECDSA。也是看图吧。公式没什么可讲的。点乘且符合交换律的情况下使得S=S‘， 也因此实现了在仅知晓对方公钥的情况下完成对应的秘密交换能力。后续该S通过派生函数作为对称密钥完成后续的加密。 值得一提的是，安全的曲线生成的公钥Q一定仍在曲线之上。如果不在则是一条坏曲线，且可能存在风险。不过这些运营过程知晓即可，实际密码学库选用公开可靠的即可。类似的在ECDSA中，如果随机数K是固定的话，也是一种漏洞。可以搜索下sony ps的案例。

# 0x02. Applied Cryptography运营须知

> ECDH算法虽然能解决交换的问题，但解决不了运营过程两侧安全不对等的问题。真随机数带来的安全性也无法解决明文传输过程的泄漏。算法安全，实现的库不一定，调用起来也不一定，人的运营更无法琢磨。

实际的运营过程，最近两年也见到了传统金融机构里太多的草台班子做法。妥妥的Micky Mouse Operation（MMO）。让我们来看一下：

* 不要设计自己的加密算法，同理也不要自己实现对应的加密算法库。
MMO： 见过一些研发团队自己设计AK/SK的，所谓的AK/SK里再截取后面x个字符串作为加密算法。
* 密钥和数据的价值一致

* 不要使用固定的IV
MMO：我们在技术文档规范里约定好固定的IV，这样每家接入机构用一样的就行了。使用不固定的IV还要增加研发成本。

* 不要长时间使用同一个密钥，密钥需要具备生命周期
MMO：有什么强制规定要求要更换吗？能不能不换？能不能申请延期？密钥更换，那是影响业务的！

* 不要使用同一个密钥用在不同的业务场景里，类似的不要使用同一个随机数在两个用途上。以及使用证书也应该区分对应的业务场景。验证签名的证书和加密数据的证书等。
MMO： 还要使用两个密钥好麻烦，一个就行了吧！

* 不要密钥套密钥，在非混合加密体系之外，不用对称密钥保护对称密钥然后多套几环
MMO：A密钥明文保护B密钥，B密钥被C工具里的密钥保护，C工具里的密钥被HSM的LMK保护。

* 不要在明文上计算MAC，在密文上计算MAC
MMO：哪有什么区别，怎么方便怎么来。我就要先计算明文，再计算MAC

* 不要明文存储私钥，更不要明文存储私钥的密码。
MMO：压缩包加密一下传输不就行了！密码？密码放在配置文件里就可以了啊。

* 不要存储私钥在本地，应该放到专属的KMS里
MMO：本地建个文件夹，设置一下访问权限不就行了。

* 不要明文存储私钥的分量
MMO：不仅拿到了明文分量，还要合并起来问下，你打印的是这个明文分量吗？（内心OS：我特么怎么知道是不是这个明文分量）

* 不要使用弱曲线，弱算法，弱CipherSuite
MMO： 什么是CipherSuite， GCM我们不支持啊！为什么要升级，3DES就用着挺好的啊，为什么要用AES。有什么规定不能用吗？

* 不要忽略证书中的CRL校验
MMO：我校验个嘚，不仅不校验CRL，我连证书本身的有效期都不校验。我有专线！

* 不要只检测签发的CA，还要检测签发的对象。

* 避免使用Self Signed证书，以及签发多年期证书
MMO：能签发个5年期的TLS证书吗？ 为什么测试环境不用测试证书（测试CA签发的证书）？生产环境用生产证书？（内心OS：合着测试生产是靠CA的测试生产区分的？）

* 避免使用通配符证书
MMO：我一张证书走天下，方便使用，又好管理。还能降本增效，人见人夸。

其他运营场景问题：
* 密钥使用LMK保护还是KEK保护？如何选择？
* 如何应用Keyblocker格式以及KBPK？设置Keyblocker字段的取值？
* 交易网络中PIN Key和Mac key的重置应该如何进行？
* 是否需要设置专门的密钥接收人员？保管人员？
* 哪些情况下应用可以直接访问HSM？
* CFCA的SDK申请证书生成时不具备私钥保护口令怎么办？
* 根CA是否需要离线？“HA”在密钥场景里的实现是什么样的？
* HSM只支持白名单访问的情况下，如何设计使用？
* HSM不提供SDK，仅支持TCP/IP访问发送指令报文的情况下，设计EAAS服务使用哪种设计模式比较好？
* GCM的正确使用姿势是什么？需不需要设置附加字段？尤其是针对支付过程中的交易信息的加密？如何用好附加字段。
* 是否需要为CDN和主站签发两张证书？（同一个域名，两张证书）
* 是否需要设置双证书，用来实现HA？
* SAAS服务是否需要自定义到企业内部域名，并由内部负责签发证书？
* 【国产专题】使用CFCA双证机制，机构A支持，但机构B不支持怎么办？HSM不支持双证CSR接口怎么办？
* 【国产专题】没有CFCA的CSP时应该怎么下载证书？
* 【国产专题】CFCA返回的双证书和加密的私钥格式如何处理？

# 0x03 总结

这篇文章花了十天的时间准备（10/09-10/19）,其中主要是在绘制上面几张图。 翻了翻我的TODO记录时，发现除此之外还有一些想去记录，但没有写下来：

* 完整性校验有哪些不同的MAC算法
* Keyblocker（TR-31）的应用场景及使用？

很多东西，一旦松懈就不可能再记录下来了，于此同时也看到了草稿里一篇7月底关于AI如何设计产品的文章，翻了几次，都没有写完。写的也不甚满意。

回到这篇关于运营的文章，这两年也算是对接了国内四十多家银行、发卡、收单机构。只有一两家，也许四五家是看起来正常一些的。传统金融真是容易混日子的地方，不专心业务和技术，那就只能专注其他的细节。我最多听到的就是：“我之前怎么没见过？这个对吗？”。扯淡的对接里做扯淡的解答只会变得更加的扯淡。Micky Mouse Operation和所谓的金融安全真的是格格不入。

最后，最近一直想着去提倡`Less Operation， More Efficiency`，以及另外一个概念，`Architecture As Code, Architecture for Compliance`. 这可能是作为架构师后第一次独立提出的概念了？我疑惑着翻看了之前记录的对于SDLC，安全左移，纵深防御理解的文章，翻了翻对入侵检测领域实践，密钥实践，数据安全实践，网络和云安全实践的总结。不知道企业安全的突破点在哪里，按理说不应该这么快产生倦怠，还是看多了Micky Mouse Operation让我变得疑惑了？（音乐起： 《没出息》，本来应该是从从容容游刃有余，现在是匆匆忙忙连滚带爬。 //形容现在JV企业，真是真他妈太形象了。）

# 参考资料

* [力荐！大佬文章： A Few Thoughts on Cryptographic Engineering](https://blog.cryptographyengineering.com/top-posts/)
* [A Warm Welcome To ASN1 And Der](https://letsencrypt.org/docs/a-warm-welcome-to-asn1-and-der/)
* [ITU-T Standards Recommendations](http://itu.int/itu-t/recommendations/index.aspx)
* [ASN.1 Made Simple — What is ASN.1?](https://www.oss.com/asn1/resources/asn1-made-simple/introduction.html)
* [SM2 Curve](https://dissect.crocs.fi.muni.cz/curve/SM2)
* [Standard curve database](http://neuromancer.sk/std/methods/)
* [国密算法OID](http://gmssl.org/docs/oid.html)
* [Object Identifier (OID) Repository](https://oid-base.com/)
* [浅谈加密基础设施](https://fz.cool/Applied-Cryptography-And-Crypto-Infrastructure)
* [浅谈隐私计算和数据安全](https://fz.cool/Privacy-Computing-And-Data-Security/)
* [数学公式可视化工具](https://www.desmos.com/calculator)
* [Safe Curves](http://safecurves.cr.yp.to/rigid.html)
* [OpenSSL Architecture](https://docs.openssl.org/master/OpenSSLStrategicArchitecture/#to-be-architecture)
* [Web Crypto API to Get Randoms](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues)
* [Dual_EC_DRBG](https://en.wikipedia.org/wiki/Dual_EC_DRBG)
* [The Many Flaws of Dual_EC_DRBG](https://blog.cryptographyengineering.com/2013/09/18/the-many-flaws-of-dualecdrbg/)
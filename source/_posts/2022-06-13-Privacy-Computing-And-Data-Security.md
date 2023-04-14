---
layout: post
title: 浅谈隐私计算与数据安全
categories: 安全工程师
kerywords: 数据安全 隐私计算 安全多方计算 不经意传输 混淆电路 秘密分享 同态加密 差分隐私
tags: 安全架构
---

# 0x00 前言

本篇主要介绍隐私计算基础（内容来自学习笔记）以及在数据安全中的应用。此处对隐私计算的分类，参考了《隐私计算》这本书的介绍。将其分为两大块，一块是基于传统密码学的隐私加密计算，一块是基于概率论信息论的隐私保护计算（有的是基于软硬件的系统设计），但其实像联邦学习这种本身更多是将隐私加密计算应用到机器学习深度学习过程中了。本文仅做抛砖引玉，读者还应自行去学习每一个细节。

# 0x01 隐私计算基础

![image](https://img.iami.xyz/images/172346526-5549fe69-b2ae-4600-86fc-eca51d2c421b.png)

根据脑图，每节介绍一个场景。对应的我会画一个时序图（图无声明均为原创，如需转载请注明出处）来介绍大致流程，部分附带demo。差分隐私部分暂时跳过。

## 1. 安全多方计算

顾名思义，确保多个参与方能够进行安全的交互及运算。常见的技术有不经意传输，混淆电路，秘密分享等。

### 1.1 不经意传输(OT)

![image](https://img.iami.xyz/images/172567919-55f01a5f-b46b-47c4-b6c9-71ef5d373934.png)

跟着书本制作了个示意图，顺便模拟了下整个过程。

```bash
RUNPATH="$(
    cd -- "$(dirname "$0")" >/dev/null 2>&1
    pwd -P
)"
echo "$RUNPATH"

rm -rf recv send
mkdir -p recv/keys/ send/texts/ send/keys/
b=5 # select Message at No.5

# Receiver
cd recv/keys
for i in $(seq 9); do
    echo "Generate $i Keypairs"
    openssl genrsa | openssl rsa -pubout >$i.pub
    if [ $i == $b ]; then
        openssl genrsa -out sk && openssl rsa -in sk -pubout -out $i.pub
    fi
    cp $i.pub $RUNPATH/send/keys/
done

# Sender

cd $RUNPATH/send/

for i in $(seq 9); do
    echo "TEST$i" >texts/$i.text
    openssl pkeyutl -encrypt -inkey keys/$i.pub -pubin -in texts/$i.text -out $i.enc
    mv $i.enc $RUNPATH/recv/
done

# Reciver
cd $RUNPATH/recv/
openssl pkeyutl -decrypt -in $b.enc -inkey keys/sk -out selected_text

echo "-----------------------------------------------------"
cat selected_text
echo "-----------------------------------------------------"
```

![image](https://img.iami.xyz/images/172568131-86fc3dba-ba4e-4dc3-83b8-e7a20aee219a.png)


### 1.2 混淆电路(GC)

![image](https://img.iami.xyz/images/172749709-80f4a468-0f1f-42ab-9371-2b8e669aed2c.png)

这是以与门为例的，因为Bob能得到α和β两个密钥，便可以通过迭代查找表去解密对应的密文。

### 1.3 秘密分享(SS)

秘密分享主要分为两个过程，一是分发，二是恢复。此处本打算介绍以拉格朗日插值为基础的Shamir秘密分享。但当我整理笔记的时候发现已经有现成的了，可直接阅读[秘密共享方案](https://zhuanlan.zhihu.com/p/95362628) （ps:疑惑ing, 示例中的数字都与书中一致，两者私有抄袭之嫌？）  另需注意，可别设了8个分片，又搞了个1为阈值。这样对于恢复倒很便捷，但对于共同参与就没有什么意义了。

### 1.4 零知识证明（ZKP)

我是先看的[李永乐老师的视频](https://www.youtube.com/watch?v=FuKEpOhiVPg)了解个大概..... 后来看了些安比实验室翻译的[从零开始学习 zk-SNARK系列](https://secbit.io/blog/2019/12/25/learn-zk-snark-from-zero-part-one/)(强烈推荐)。但是这里有个问题，就是其中的一部分知识依赖同态相关的......

## 2. 同态加密(HE)

![image](https://img.iami.xyz/images/172783687-b3133db3-5239-4966-b830-58c37c0febe0.png)

举个例子理解下加法同态性。 5 -> 5^3 明文3密文5^3, 密文乘以2, 2的密文就是5^2 得到的就是5^3 x 5^2 = 5^(3+2) = 5^5 5^5是密文反向解密 5^5 -> 5； 顺便一提，Shamir的密码分享也具备加法同态性。 下图能更好的理解这个过程。

![image](https://img.iami.xyz/images/172784957-f17b19d2-fed6-446a-96be-5631828cb058.png)(截图来自Gentry的PPT)

原理和性质比较好理解，但具体的实现表示看的有点迷糊，以我的知识水平暂时无法理解。群，环尚能理解，卒于格。（基于格的密码学目前主要用于应对量子计算的破解，eg. CKKS,传统密码学对于量子计算机已经不难搞定了。)。 这些基础要比学习机器学习深度学习难多了。 推荐观看[全同态加密的发展历程](https://www.bilibili.com/video/BV1rY411V7Ko) 下表介绍了不同类型的同态加密类型及实现

![image](https://img.iami.xyz/images/172780958-b237b0e8-f7b5-4c95-a4a9-1e940dd403ef.png)

不过这并不阻碍调包的脚步，此处使用[Microsoft SEAL](https://github.com/microsoft/SEAL)及对应的[python binding](https://github.com/Huelse/SEAL-Python)
实现的bgv的demo code，可参考原repo中的example

![image](https://img.iami.xyz/images/172800849-526e9a21-743f-4eda-90c5-d2e724867dc4.png)


## 3. 联邦学习（FL）

有机器学习基础的话相对容易理解一些。这里面将联邦学习分为横向联邦学习和纵向联邦学习以及迁移学习。横向和纵向的区别在于横向是各参与方数据样本不同，特征空间和标签空间相同。而纵向是各参与方数据样本相同，但特征空间标签空间不同。 结合前面的多方计算知识介绍，不难发现可以把训练过程中的关键参数聚合到一起。例如梯度下降过程中的梯度值，Loss的值等。可以通过秘密分享，同态加密的方式去实现。当然也可以通过差分隐私实现。下面这个图介绍了横向联邦学习的训练过程。 

![image](https://img.iami.xyz/images/173265339-7f9f4bc2-ce33-4f21-a605-1fa56cd2937d.png)

因为横向联邦的各个参与方本地都有完整模型，所以在预测过程只需要本地推理即可。**不过即便是本地模型预测，也还需要保证样本对模型的隐私性，即允许模型持有者进行预测但不允许获取数据明文**， 例如人脸识别，实时人脸数据后，直接进行加密，然后模型基于密文进行计算完成验证。另外已有论文可以通过模型和一定的预测过程数据能推断出原始数据，也需要注意此类攻击。

## 4. 可信计执行环境TEE)

软硬件协同的一种计算方案，而分为REE和TEE两套环境。REE对应常规操作系统，TEE对应单独的硬件（单独的页表/内存，如果没有单独的硬件就要基于内存加密）和单独的OS（正常的是boot ROM -> boot Flash -> UEFI -> OS/Hypervisor, 以Arm Trustzone为例，TEE OS的位置位于boot Flash之后 ）用于存储Key，指纹，人脸之类的敏感数据，并在TEE所在的OS内完成加解密签名验签等操作。通常还会有物理防御的机制，例如三星手机刷机就会直接熔断Knox。三星的TEE是自研的，不过也被Lapsu$泄漏了。硬件的难度和门槛可能高一些，常见的有Arm TrustZone（建议阅读Trustzone架构设计，见参考部分）, Intel SGX, AMD SEV。TEE OS的话是有一些开源方案的，例如[OP-TEE](https://optee.readthedocs.io/en/latest/general/index.html#https://optee.readthedocs.io/en/latest/general/index.html#), [Teaclave](https://teaclave.apache.org/) 

此处以Arm Trustzone为例，交互示意图如下。图片来自论文[On The Performance of ARM TrustZone](https://arxiv.org/pdf/1906.09799.pdf)

![image](https://img.iami.xyz/images/173270597-e4ce607d-dca5-47a9-b37c-435505033249.png)


## 5. 差分隐私 (DP)

主要原理是加入随机噪声，对精确的查询结果进行掩盖。连续实数值域的实现方式有两种，分别是拉普拉斯噪声法和搞死噪声法。有些地方也看不太懂，此处暂时略过。需要注意的是，要具备攻击者视角，例如A想了解B的收入，可以通过先构造集合D（A，B)，查询D的平均收入，然后减去A自己的收入的方式获得B的收入。

## 6. 其他

多签名相关的也需要了解。比较有名的为[Schnorr](https://ethfans.org/posts/how-schnorr-signatures-may-improve-bitcoin#render)和[BLS](https://ethfans.org/posts/bls-signatures-better-than-schnorr) 


# 0x02 隐私计算与数据安全

多数情况，我们可以将数据流转过程中的角色分为图中几种。不过通常情况下，数据使用方大概率也会是数据提供方，无论是提供给合作伙伴还是政府监管。同样的平台方,服务提供方和数据使用方也极有可能是一个实体。 在这里我用韦恩图去表示各方之间的关系。
![image](https://img.iami.xyz/images/173302921-9581b414-58d0-4558-89df-02e0c4ec1d69.png)

## 1. 减少收集范围与提高数据可控能力

从图中可以看出数据提供方和平台的交集意味着提供了哪些数据，平台和提供方以及使用方三者的交集意味着真正在平台中被使用到的那部分提供数据。此处也不难看出，应该在尽量减少提供方和使用方之间的差集，即避免收集过多的信息/数据，仅收集真正使用的。这需要平台去遵守法律/行业规范（监管永远是金融行业的第一驱动力，不过大多时候监管落后了很多步）。当然作为数据提供方可以通过增加自己对数据的控制能力来保护自己（先提高隐私保护意识再去提高控制能力）。例如，Root后的手机可以通过使用一些插件去阻止其他非授权APP获取权限，或者返回给APP虚假数据，Android OS常见的工具为Xprivacy，MIUI集成了Privacy功能; IOS系统通过差分隐私得到最受欢迎的Emoj表情这类群体特征; 亦或是提供给服务方密文数据等。

## 2. 全链路安全与数据使用安全（Data In Use Security)

![image](https://img.iami.xyz/images/173315112-05361713-ef2c-4a88-b3ca-1dbbac7d7022.png)

全链路安全建设是必不可少的（包含基础设施到上层应用等等），除此之外数据在Rest和Transit的时候，大多可以通过一些密码学手段确保逻辑上的安全，当然也需要考虑软件供应链安全(eg. Crypto Library的安全)以及服务设计等。 但是对于Data In Use的场景一直没有很好的保护。此处简单讨论下隐私计算在数据使用场景（查询、分析、计算等）中的应用。一类是以个体数据为例，实现数据的可用不可见。另一类是针对群体数据的使用，如何保证计算过程/结果不会泄露个人隐私。

a. **数据可用不可见**

![image](https://img.iami.xyz/images/173346848-f167abef-793b-487e-bd62-e2f3ea7f1677.png)

这一类应用到的技术主要为TEE以及同态加密相关的技术，前者支持在可信（永远没有绝对的可信）环境内计算，后者支持密文计算。比如通过TEE存储指纹,人脸，全盘加密deKey等数据。当外部应用需要进行核验/认证的时候（例如支付，解锁等）只能通过调用API访问TEE环境，在TEE环境内对数据进行加解密。又例如FIDO2认证过程中，Server发送随机Challenge数值，经由TEE环境内私钥进行签名后发送回Server，然后Server进行验证等等。同样的对于同态加密，密文检索和云上机器学习是较常见的场景。以机器学习预测为例。用户将输入进行加密，然后将密文上传服务器器预测，服务器进行加密推理，然后返回密文结果，最后本地解密得到明文结果。当然也可以将这两种结合到一起。完善保护数据使用中的安全问题。

b. **大数据可用不可见**

主要以联邦计算和差分隐私为主要技术。在训练过程中通过掩蔽样本数据的特征或增加噪声的方式对原始样本数据进行保护，但并不影响对群体数据的统计结果。在预测过程中，能够接受密文数据进行预测。常见的场景有联合风控，欺诈识别，下一词预测，广告推荐（不再大数据杀熟）等。


# 0x03 总结

从安全多方计算（1979年）开始到提出差分隐私，再到集中计算（2006-2013年）以及目前的联邦学习（2018年）。一如往常，这些技术的概念很早之前就已经踢出来。但直到近些年才得以落地。现在将其统称为隐私计算。不过需要注意的是Data Privacy本身关注的是个人，而非数据。

![image](https://img.iami.xyz/images/172346583-1b25b79f-06fd-48d0-983b-a6efa54bfda6.png)

在这些技术中，大部分需要依赖半诚实服务器，且同时存在一定的性能/效率问题。而其中有一部分数学基础对于我来说，也不能完全理解。但这并不影响去了解新的技术，以及去应用和落地。在此之前，思考了很长时间如何对使用过程中的数据进行保护，查阅了一些TEE的资料，但脑子里却没能有一个大概。这次通过系统学习了下隐私计算的书籍（虽然之前已经看过不少相关的白皮书），只有对原理有所了解。才能够更清楚应用场景。除此之外，猛然发现自己最初在学机器学习的时候，多是考虑模型数据保护相关的问题，却没想到如何保护样本数据，当真是学无止境。

ps: 最近刷了碟中谍前4部，看到那么多不可能的地方被伊森和他的team搞定。虽然有一定的主角光环，但不得不承认: 没有绝对安全的系统。任何一项技术也不能保证。


# 0x04 参考资料

* [隐私计算（陈凯，杨强）](https://item.jd.com/13604520.html)
* [实用安全多方计算导论（刘巍然译）](https://item.jd.com/13302742.html)
* [隐私计算白皮书-信通院](https://gw.alipayobjects.com/os/bmw-prod/73c5f163-d091-487a-bf5c-41841f546bc0.pdf)
* [全同态加密的发展历程](https://www.bilibili.com/video/BV1rY411V7Ko)
* [A Decade of Fully Homonorphic Encryption.pdf](https://github.com/mylamour/blog/files/8867450/A.Decade.of.Fully.Homonorphic.Encryption.pdf)
* [零知识证明Zero-Knowledge Proof介绍](https://zhuanlan.zhihu.com/p/144847471)
* [如何理解拉格朗日插值](https://www.zhihu.com/question/58333118)
* [秘密共享方案](https://zhuanlan.zhihu.com/p/95362628)
* [从零开始学习 zk-SNARK（一）](https://secbit.io/blog/2019/12/25/learn-zk-snark-from-zero-part-one/)
* [零知识证明报告最终版.pdf](https://github.com/mylamour/blog/files/8866820/default.pdf)
* [Microsoft SEAL](https://github.com/microsoft/SEAL)
* [SEAL Python](https://github.com/Huelse/SEAL-Python)
* [BLS签名](https://ethfans.org/posts/bls-signatures-better-than-schnorr) 
* [Schnorr签名](https://ethfans.org/posts/how-schnorr-signatures-may-improve-bitcoin#render)
* [OP-TEE](https://optee.readthedocs.io/en/latest/general/index.html#https://optee.readthedocs.io/en/latest/general/index.html#)
* [Teaclave](https://teaclave.apache.org/)
* [Learn the architecture - TrustZone for AArch64](https://developer.arm.com/documentation/102418/latest/)
* [On The Performance of ARM TrustZone](https://arxiv.org/pdf/1906.09799.pdf)
* [Xandu](https://cloud.xanadu.ai/)
* [差分隐私算法基础](https://differential-privacy.cn/3-Basic-Techniques-and-Composition-Theorems/Composition-theorems/Laplace-versus-Gauss.html)
* [浅谈加密基础设施](https://iami.xyz/Applied-Cryptography-And-Crypto-Infrastructure/)
* [浅谈数据安全](https://iami.xyz/Talk-about-data-security/)
---
layout: post
title: 设计你的安全架构OKR
categories: 安全架构师
kerywords: 数据安全 应用安全 基础安全 安全策略 安全技术 安全运营 安全平台 企业安全 安全治理 OKR
tags: 安全架构
---

# 0x00 前言

这一篇简单谈谈如何设计安全架构的OKR（不是个人工作量的OKR）。架构师个人的OKR可以是去在某个季度解决某个问题（一些平台的设计，策略的推广，运营的指标等等）。


# 0x01 安全架构目标

老规矩，看图说话。 其实不难发现还是策略技术运营三块走，虽然是老一套了，但实际都具备的公司也不多。

![image](https://img.iami.xyz/images/177453812-35cbccde-a78a-404c-a7ce-08a4cd88844a.png)


## Object

1. 安全能力服务化
2. 安全服务平台化
3. 安全平台智能化

促进安全能力服务化，安全服务平台化，以及安全平台智能化。 通过对策略的制定规范化技术的基础能力，通过建设安全平台整合技术能力，通过运营进行持续的交付。图中策略技术运营三块需要做的事情为假设，架构师应根据所在企业的情况进行定制。

> 注：关注策略建设的时候，应该需要考虑到使用什么样的技术去支撑策略，考虑技术建设的时候，要考虑技术架构怎么交付出去运营（服务架构）等

## Key Resources

* 从策略角度关注价值与威胁，进行标准规范建设
* 从技术角度关注服务与交付，进行基础能力建设
* 从运营角度关注场景与质量，做好生命周期管理（闭环）


# 0x02 架构与平台

![image](https://img.iami.xyz/images/177459465-5c150ba8-fd50-4b3a-affa-06056ba4db41.png)

这里面
1. 每个治理领域都需要策略，技术，运营做支撑
2. 每个治理领域都需要架构指导，平台交付，运营服务
3. 基础安全决定了应用安全和数据安全的下限
4. 架构设计决定了安全平台和安全运营的上限

随着基础设施云化，安全服务类别增多，会逐渐形成安全平台，同时慢慢承担更多的责任。不过这里面还要看组织架构，可以结合上图思考企业是如何设计的。根据不同的组织架构，实现不同的协作模式。例如安全架构收拢需求，安全平台组通过综合各领域的安全工具，针对部分安全能力封装成服务提供给业务使用，并将服务统一化为安全平台，面向企业内部提供统一的基础设施和系统控制，安全运营提供对外服务。 例如不同治理领域组建团队，组成虚拟安全架构团队，承接需求，协作实现。然后交给安全运营或者各自运营。

拿数据安全架构举例，主要做三块（有的地方IAM不在data security范围之内）。

1. Cryptography: HSM, KMS, PKI, Crypto Agility, Encryption as service, Transparent encryption， cert management, etc.
2. Data Protection: DLP, EDR, Email Protection, Data Classification/Tagging/Privacy Platform, 3rd file sharing, etc.
3. Identity Access & Management: IDP, MFA, Hardware Key, Passwordless, Beyond Corp / Dev, etc.

再细节到Cryptography，数据安全专家需要制定Crypto Control的Policy，对不同的算法，属性，生命周期做出规定。然后推广策略，技术专家和架构师一同构建符合系统架构标准的Crypto Infrastructure，开发提供Self Service，Management Portal等等。可参考之前的一些博客，此处不深入了。同样的，对于Data Protection，需要制定数据分类分级，数据传输，防泄漏的Policy等。推广规范的同时，建立数据扫描平台，计入不同数据源，然后对各类数据打标签，提供隐私计算的一些技术，去做到数据生命周期的安全控制，同时增强数据流动的可能性，等等。 

另外就是OKR对于做架构的，做平台的和做运营的，衡量指标应该是不一样的。架构应把关键点放在解决问题的能力上，提供什么样的功能。而非要求架构师对设计的平台要求有多少的接入用户和覆盖多少场景。架构可以帮助去交付一些场景的接入，但对同质场景的推广应该是运营的指标。当然这个也需要看具体老板的认知和要求，毕竟理想和现实是有差距的。

# 0x03 总结

OKR其实已经老生常谈了，记得很早前还写过一篇OKR做过野路子安全架构设计。不过以前是做安全工程师的时候去做安全架构，通常是针对具体任务的，现在是以安全架构师的身份去做，更多要看整体。还是有些不同的，关注的点也有所改变。最明显的就是更感觉到沟通的重要性，情绪管理的重要性。老板之前跟我讲过一个三选二的思路，就是在企业中，行业经验，技术能力，沟通管理三者具备两个就能很稳定的做的很好，当然也可以在自己的优势上深入之后，再补不足。当然每一项的深入都需要投入大量的精力，学无止境，持续积累吧。
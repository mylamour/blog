---
layout: post
title: 现代化SDLC与架构评审
categories: 安全架构师
kerywords: 应用安全 SDLC 安全架构 架构评审 安全治理 架构建设
tags: 安全架构 应用安全
---

# 0x01 前言

今天讲讲我设想中的Modern SDLC & Security Architect Review。 最早做架构评审（也许只算是参与参与）大概是有一个月一次的样子，属于萌新阶段，并没有什么含量，不过当时开始参与SDLChina的建设和维护。直到后来在本地生活做架构评审，工作量就变大了，每周会有两个下午专门开评审会，会有很多新的业务上线。也是在那个时候，逐步的去接触各种各样的架构，当时的架构评审其实已经是建立了完整的流程，关注在系统和应用层面，主要是技术团队参与。而我自己是主要在做优化过程的事情，比如说建立案例库，让业务方准备好需要的文档，Checklist等。当时还总结了一篇[文章](https://iami.xyz/Security-Architecture-Review/)。至于到PayPal时其实参与的倒不多，是等到负责应用安全的同事走了之后，我临时顶上做了一些。这时候的评审会和之前又很大的差别，尤其是参会人员上。除了技术团队，还会有合规的，法务的，商务的，项目经理等等。同时值得一提的是，针对评审的结果是有一个追踪的过程，看这个问题有没有解决，而且有平台的完整支撑。当然对于更多的企业而言，别说SDLC和架构评审的平台了，甚至连SDLC也没有。当然小公司可能一年的架构评审量还不如大厂一个月的量，而这架构评审也成为了架构师日常工作中的要运营的一部分。顺便吐槽一下，有的企业招聘要做过5年架构评审以上的人，有的工程师做做代码扫描的规则维护就敢声称精通SDLC。这个行业里张嘴全是狠活的人太多，实际有点技术的人又太少。而针对之前所有的架构评审几乎都是业务侧。对支撑业务的一些系统则参与的比较少。这也是为什么要总结这篇文章的原因之一。好了，今天的前言叨叨的有点多，让我来妄谈下如何建设现代化的SDLC和架构评审吧。

# 0x02 正文

在谈现代化的SDLC之前，我先来简单的说一下SDLC为什么是现在这个样子，这里我做了一个图。

![sdlc01](https://img.iami.xyz/images/197389197-94db2c9f-6c70-4c0a-8e8d-ccc348a2d331.gif)

看图，应用经过了研发部署（R&D），在最初对系统提供的防护是在运行时的，这时候的安全能力（Security Capability）一般是提供防火墙、WAF、抗D等，这也是所谓的边界防御（Border Security）。而边界防御显然意味着在屏障被突破之后，内部没有任何的防护措施。那如果我们把Security Capability左移（Shift To Left；顺便补充个右移的概念，一般是指测试更希望在真实环境里进行故障注入等操作），为整个R&D覆盖安全能力，在每个阶段都提供一定的安全输出。因此也就从Border Security变成了Defense in Depth（当然此处只是应用视角的Defense in Depth）。

到这我们大概了解了为什么会有现在这么一个套路。不过既然聊的是现代化的SDLC和架构评审，我还需要先假设三点：

* 假设企业有着一定的项目流程和产研标准。这意味着企业内是有项目管理，研发流程等基础能力的。例如通过jira管理项目，为新的特性创建ticket，并关联到对应的代码分支上去。
* 假设企业的DevOps有一定的基础了，例如能够自动化的发布部署，业务都接入CI/CD的Pipeline，分离了不同环境的配置等。如果迈入了一定的IAC会更好，通过代码生成资源，意味着不仅可以通过CSPM类的工具在生成后检测，还可以在创建资源时按照默认的模版，以及Harden规则实现一定的Security Default。这是安全能力下沉到基础设施的体现之一。
* 假设企业的安全能力已经Ready了。如果说连基本的安全能力都不具备，此时去建设SDLC显然是不够成熟的。例如IAST，DAST，App加固，镜像扫描等各种工具是能够正常运转的，对应工具是有团队在运营管理，规则有人维护等。

OK，假设我们的假设已经实现。我们来看下如何去建设现代化的SDLC。这里关注以下几个点：

1. 建立流程和规范
2. 通过平台输出能力
3. 我认为的Modern SDLC平台是什么样的

## 1. 建设流程和规范

架构评审中有没有被问到过：“这个依据是从哪里来的？”，“这个点可以从哪里参考？”，诸如此类的问题。对于安全工作来说，最好的依据就是来自于Approved Policy。这些文件需要放在统一的Portal对外提供，需要和Draft版本区别开来。同时需要通过宣讲的方式推广给各部门同事，然后以每年或者每半年一次Update的形式进行修订。当然有的企业可能会有单独的团队负责各种Policy的编写，一般来说更多的是通过一线的资深专家去撰写，然后各级进行审批。而SOP一般不需要遵循这个流程。除此之外，还要去和不同的部门一起去制定不同的规范，例如面向运维，一起合作建立规范，使新创建的资源具备默认的安全能力，这也是安全能力下沉到基础设施的体现之一。只有通过流程和规范进行背书，安全能力才能更有效的输出出去。例如在策略里规定了某些不符合的场景如何处理，可以选择不做，那就去特批。但特批之后只是提供了一定的缓冲期，缓冲期之后还是要去完成的。不是我在挑战你，是规则在挑战你。

## 2. 通过平台输出能力

平台化会一定程度减轻重复的工作量。不过往往也会带来另一种形式的工作量。SDLC中平台输出能力的最常见形式就是为Pipeline默认覆盖安全扫描。也就是我们常说的DevSecOps平台，通过DevSecOps平台为应用在每个阶段将安全工具提供的服务接入，并通过汇总各个不同安全工具的结果，进行展示和分析，以及合并一些运营指标。同时也可以让业务方自助去使用平台。不是我不让你发布，是平台不允许你未通过检测就发布。

## 3. 我心中的Modern SDLC平台

上一段讲了平台输出能力，提到的DevSecOps平台是关注在Architect Design之后Runtime之前，而Runtime之后基本上没有什么大的变动，往往会内置流量清洗的能力，从而达到对异常流量的检测和拦截以及人机验证等。那SDLC中还剩下架构设计和评审这一块，具体是如何通过平台化去提供能力。

![SPLC](https://img.iami.xyz/images/197378430-ac3fd009-9bbd-48fc-8471-b7e8ec628aff.png)

花了一下午画了这张图，顺着图讲几句。中间这个框里代表了对Modern SDLC平台的一个需求，主要分为两块，一块是Security Capability，一块是Enhancement。 

* Design & Architecture可以对现有系统的架构进行可视化，绘制及标准网络，数据库，服务器/运行时的位置，以及相应组件的依赖和数据的流向。那针对数据流中数据的等级，方向，在Threat Modeling很快就能判断出是否合格。例如发现敏感级数据流出且未加密后将其highlight出来。
* Threat Modeling需要能够支持现有的一些分析模型，例如Attack Tree，STRIDE等。通过对Architecture中数据和组件的分析，结合一些场景库给出一些基本风险点。通过人工的定义场景库或者仅保留一些基础的风险自查点给到用户去做，剩下的由安全专家实现。这里需要吐槽一点的是，国内的平台大多喜欢吹这个作为卖点，实际上就只有银行和电商两个场景，然后需要勾选20个以上的复选框完成，最后拿着一个自动生成的文档再去和业务方对齐。要多蠢有多蠢。
* Risk Management需要针对发现的问题评估出严重程度，受影响的资产，确定存在的问题或风险点可能被利用的程度，以及相应的缓解方案。并能够通过数据分析模块给出一个评分，当评分在某个值以下，拒绝该项目进入下一过程。例如未通过无法确的申请线上资源的权限。同时针对发现的问题，建立追踪过程，每个过程必须结束。无论是通过还是未通过。
* Scenaio & Knowledge需要关注以下几个方面，Application & API（例如不同的语言，常见的框架，常见的编码问题以及对应的检测规则等），Compliance（例如GDPR，PCI-DSS，中国网络安全法，SOC2等），行业标准（例如OWASP top10，OWASP ASVS， NIST xxx， CWE，CIS Bechmark等），系统部署（例如cloud方面的best practice，Web服务器，容器，数据库，微服务鉴权等）。再吐槽一下，知识库其实也是国内SDLC类产品的一个卖点和噱头，但其实所谓的20年资深咨询专家提供的case并不会和企业内的真实情况有多么贴合。
* Security Training需要能够针对常见的编码相关问题做出小示例给到研发同学，最好能够具备评分反馈，如果没通过training或者分数较低还需要继续学习。
* System Integration是最需要关注的一部分，因为企业中的平台形形色色。SDLC平台受众也有限，很多功能其实可以通过集成实现。例如通过和Jira进行集成，完成对风险的管理追踪，用户既可以在Jira上去处理安全专家创建出来的风险点case，也可以在SDLC平台上完成。当然不仅是风险的流程管理，架构评审的流程管理也可以放到Jira去做。此时在任何一侧的更改都会同步到两个平台之上。类似的，通过和DevSecOps平台的集成，观测到一个项目在架构评审之后不同阶段的安全指标。通过和企业内部的培训平台集成，将培训部分的设计放到培训平台上，将培训内容引用到平台内。 这种系统间的整合不仅是在SDLC平台上，企业中也需要平台间的整合以增加系统的扩展性。或许更准确的说是增加数据的流动。

很多时候一个企业里没做什么SDLC，做SDLC的那一部分企业也并没有什么平台，更多的是发力在DevSecOps平台上去做SDLC上，这就像测试能够更多的检测代码质量，却不能检测架构质量。一个现代化的SDLC平台去做架构评审是非常有必要的，不能仅通过手动的去记录案例，手动的管理风险项，以及使用未发布的checklist去做架构评审。而是发布策略去支撑流程约束，通过平台输出架构评审的能力，此外关注到流程的实现，管理，问题的追踪，系统的整合等。尽可能的Shift to Left，以及Security By Default。

# 0x03 总结

最近更加喜欢采用整体的视角去high level的看一个东西。虽然以前也经常画一张图去阐述某个方面的东西，但大多是构成某个系统的设计，而现在更多的是系统间方案的的组合。当然一张大图里面的细节肯定是非常多的，并非三言两语一篇博客就能说的完的。类似的，我在博客中写了一些关注点，但更多时候也没有介绍为什么关注这个点。

我现在如果想到什么东西，某些点，都会狠快的记到note里去。因为很多观点一旦被触发，灵感爆发也就那么一小会儿。灵感的爆发来自于不停的辛勤探索，但灵感似乎又比之前的辛勤更重要一些。这里我向老板致敬，他教了我很多东西，也给了我不少灵感。像对待一个晚辈一样，教会了我许多道理。谢谢。

好了，叨叨了这么些，结束。
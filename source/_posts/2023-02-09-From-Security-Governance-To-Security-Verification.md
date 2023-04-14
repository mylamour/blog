---
layout: post
title: 玩转安全架构：从安全治理到安全验证
categories: 安全架构师
kerywords: 安全架构 企业安全 安全设计 Security Design 微服务安全 安全治理 安全验证 
tags: 安全架构
---

# 0x01 前言

瓶颈期总是让人苦恼。前些天准备继续翻译CISO访谈系列的文章。偶然读到一个CISO说他在企业里的十几年，在做架构的时候就做一件事，就是推广设计的框架（easy to use），用来帮助企业更安全。 我想自己的工作已经遇到了这么久的瓶颈，倒不如总结下安全架构的玩法。权作自娱自乐。

# 0x02 正文

以下图为例，将Governance和Design作为Logical部分，Implementation和Verification作为Physical部分。在Logical部分由Governance引导Design的架构方向，在Physical部分，由Verification检测Implementation的项目质量。同时根据Physical的反馈去修正Logical的细节。那就先暂时把这个模型命名为**LSP**模型吧。（哈哈哈）

![image](https://img.iami.xyz/images/217746259-1b5a9b78-b47d-4d84-a881-01f6f8c27a7f.png)

言归正传，我们来根据这个Model将每个过程涉及到的input和output简单列出来，详见下图。

食用注意： 
1. 你需要补充自己的Component作为Input和Output；
2. 当使用Component时需要确认是否具备对应的Input；

![image](https://img.iami.xyz/images/217699918-d37356c1-c00a-4ddc-b2c7-7dbe2a2c0881.png)

1. 具备顶层设计的安全治理多是自上而下的。这意味着得到了领导层的**support**，能获得到对应的**resource**（**support <---> resource**）。至于能够得到support，可能因为法律法规（legal部分），也可能因为面临业务上的风险或者有商誉问题（marketing&industry部分）等。
有了驱动之后，安全治理会在这个过程输出一定的Security Strategy、Policy、Standard等文档（**这些输出应该具备一定的Education Program使员工能够理解。可以是培训，测试，游戏等形式**）。
Strategy关注目标，Policy关注Rule 。一般来说Strategy还会将principle描述出来，然后细化各个领域关注哪几个点，达到什么程度。比如应用安全2023年要做供应链安全，数据安全要做Crypto Agility，云安全要做Security Policy As Code，运营做Automated Attack & Simulation，基础安全做Beyond Dev，IAM做啥等等。这些目标的制定取决于预算，企业内技术成熟度，风险评估，技术趋势，行业合规，最佳实践等等。这里有几个误区：**不应该盲目的跟随技术趋势，而是要关注所在行业的趋势。** **最佳实践一般是满足大部分场景，大多数企业的。找到你所在企业的最佳实践。把Well-Architecture 作为一种参考，不是信仰（技术）。**

2. 有了上述的各种策略、规范。就能够去做Security Design了，针对机房门禁，服务器，网络，存储，数据，身份管理，加密等给出Security Control（Security Control的内容主要来自这些1中的standard等作为输入，可以通过参考NIST，CIS等制定）。这里需要强调的是**架构融合**，安全应该做的是**使安全控制去适应企业现有架构**。技术栈，框架等等。如果这些系统的组件是由另一个系统（功能模块）提供的能力。此时就要去关注系统架构的设计，通过产品选型、技术评估等形成新的Security Solutions，怎么去logging & monitoring，以及integration等等。 这里可以思考下security architecture design和security solution design的区别，**架构设计更关注在整体结构和系统组成，解决方案更关注产品服务，功能特性等。后者帮助实现前者**。同样的按照图中模型，当需要去做某件事的时候需要先看下依赖是否存在，即上一个输入是不是有效的。举例来说，要去做Security Infrastructure的时候，发现没有Security Architecture和Controls， 即而发现没有Security Policy和Standard等。

3. **相对于Governance和Design而言实施和验证都是能够提供有效反馈的两个环节**。这两部分合为一节来写，经过installation、configuration、deployment实现了Security Infrastructure，然后去做education帮助员工/用户理解。针对这些实现，进行主动的审计和各种Review，工具来检查/验证是否和安全设计相符合。例如通过网络扫描确定是否提供了TLS endpoint，CSPM看是否启用了Encryption，主机扫描看是否本地存储了密钥等等。当然除此之外还需要持续的监控和测试等等。而来自Verification环节的输出，又可以直接体现在Security Design的输出上，同样的来自实施过程中的问题也可以直接修正Security Standard等。

到这里，应该知道可以怎么去做安全架构相关的工作了。至于怎么把图里的component填饱满，有深度就是另一回事了。比如拿你写的policy和别人写的policy比一比，看看你设计的架构和业界的解决方案就知道了。甚至不用比，也是心知肚明的。

# 0x03 总结

这里面基本上囊括了做企业安全、做安全架构的范围，虽然并不是所有工作都是安全架构师去做的。但基本都是安全架构师应该关注点。怎么样构建一个蓝图，制定一个目标，设计一个解决方案。在不同的技术领域，业务背景，部门之间给出一个交付。还有一点值得一提的是，**需要确保每个阶段能够平稳过渡。找到GAP进行修复或者接受风险**。例如从治理过程中反复的沟通获得leadership的support，到根据企业现状制定出相应的policy，再从Policy去做Security Design，衡量预算，项目周期等等。最终的目标都是希望能够持续交付，或者遵循了交付标准。那这些阶段之间的过渡过程中隐藏着各种变量，怎么尽可能维持项目风险保持在一定波动内是很考验功力的。
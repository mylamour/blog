---
layout: post
title: 安全左移移了么
categories: 安全架构师
kerywords: 安全左移 安全架构 企业安全 安全治理 左移 右移
tags: 安全架构
---

# 0x01 前言

像安全左移，安全默认这些安全设计理念已经出现很久了，但是其实没看到具体介绍怎么去做左移？到底往哪里是往左？ 今天简单聊下我理解的安全左移。

# 0x02 正文

安全左移的原文是Shift To Left。这里我依旧用中文来称呼。想理解往左移首先要理解左移是为了干什么，左移一般是为了将防御能力提前，换句话说就是**将安全默认能力提前**。那对于应用和基础设施来说，这种从内向外提供服务的一个过程，左移就是逆过来从外向内。例如从firewall/anti-ddos/waf/的边界防御提前到CI&CD的SAST/IAST就是一种左移。那对于数据这种从产生到落地的过程，左移就是前置到生成的时间节点。例如从DB的TDE到Application和EAAS的集成。除时间序列外的左移，也可能是空间上的能力覆盖（这个具体怎么表述没想好），是不是也算一种左移。例如使用KMS产生的Data Key被包裹成KEK存储在本地/任何地方，仅在运行时的加载，即在内存之中。如果认为此时仍旧存在内存被dump的风险，那可以将KEK的解密和Encalve结合到一起，使其仅在TEE环境中完成密钥和数据的计算。

下面我以三张图分别简单介绍应用，基础设施、数据这三块的安全左移。

![sdlc](https://img.iami.xyz/images/199726952-87071d81-32fe-4e04-8909-4ed5e594287c.png)

应用这块其实在之前的[现代化SDLC与架构评审](https://iami.xyz/Modern-SDLC-and-Security-Architecture-Review/)
简单提到过一嘴。（[可以看这个动图](https://img.iami.xyz/images/197389197-94db2c9f-6c70-4c0a-8e8d-ccc348a2d331.gif)）。SDLC其实也是安全左移的一个主要体现。从R&D到部署运行，出现问题的影响肯定是越来越大的，同时所需要的修复成本也是越来越高的。所以可以通过左移去提前发现问题，比如可以将边界防御提前到CICD阶段乃至架构设计阶段。但这里大多数说的其实都是业务侧的，企业建设也是关注如何为业务侧覆盖SDLC。却很少有提到支撑侧的。甚至支撑侧的产品都很少有安全能力，由于支撑侧的产品大多数是采购的，因此图中我只保留了运行时和架构设计两个阶段。试想一下，除了业务之外，我们会用到哪些产品去支撑企业。简单的有Wiki（Confluence），PM（Jira），审批系统，Payroll，电子签系统，HR系统，OA系统，权限系统等等。有多少是经过安全评审，有多少是具备标准的系统架构，寥寥无几。一方面来说，大部分这些系统存在于安全团队之前，缺乏一定的上下文。另一方面，没有谁会愿意主动去搅动屎坑，本身已经积重难返。但支撑侧的薄弱往往又会成为攻击者的入口点。

![infra](https://img.iami.xyz/images/199726996-6934d3d6-bc03-4dc4-a0ca-705310b33b6b.png)

聊完了应用这块，聊聊基础设施，应用最终是要承载到基础设施之上的，当然Serverless近些年还是蛮火的。不过serverless并不能解决所有的问题。企业也不必认为使用Severless就可以不需要安全团队了。这里我以云平台举例。大多数情况下，大厂都是有标准镜像的，根据标准镜像启动实例。然后符合baseline配置。但是在这个过程中实际上仍然会出现不少错误配置的现象，无论是宽松的测试环境账户，还是未收拢的权限和各种资源创建流程。例如有的是通过CMP平台去创建，有的是通过手动在界面创建，还有的通过AK/SK去创建等等。图中展示了如何避免在instance生成之后通过扫描到错误配置去推进修复，而采用对CMP平台创建资源的IAC Code进行扫描，尤其是针对Policy部分进行加固。例如通过tenable的CSPM可以完成对terraform的代码扫描。从而实现在资源创建阶段完成配置检测。这样就不必在资源创建以后引发线上变更了。当然policy都是为了满足通用场景的，那针对一些特殊场景，依旧需要场景化的policy。

![data](https://img.iami.xyz/images/199728242-02c5d40a-20d7-4adc-ae21-0b98bc999749.png)

Data这一块，最初画图时我没想好视角。本打算从数据产生的角度去画，但是没有想好一个场景。最终换成了以数据状态纬度来描述。图中先是介绍了数据直接以plaintext的形式落到DB的场景，这样其实对于DBA来说，可以很轻松的读到所有的数据，当然对于攻击者而言也能直接拖走所有的明文数据。那何时让数据变成加密态就可以通过左移实现。如果通过DB本身的TDE来实现，一是只有商业版来支持，二是各DB Engine对TDE的支持维度不同。有的是行级别，有的是表级别。因此可以通过将其前置到DAL（Data Access Layer）层，通过在DAL层与EAAS（加密即服务）的整合完成所有数据的加密，那么无论背后的DB是什么样的，其存储的都是密文数据。同样的还可以前置到Application层面，尤其是在企业中没有DAL的情况下。

# 0x03 总结

讲了这么多，还是要声明下永远不能为了左移而左移。以上文举例来说的，在技术侧的左移还要考虑到工程落地，考虑到产研的协同等等。例如针对数据存储时明文和密文的状态，或许使每个Application在访问DAL层时就变成了Ciphertext是最提前的，但实际上会导致每个应用都增加一定的开发量。那在DAL层存在的情况下，通过整合DAL层和EAAS就更符合工程落地的需求。除此之外左移还可以体现在策略方面，通过提前在规范中内置约束实现。

另外并不是什么都是要左移的，就像之前的文章里提到的测试需要右移。因为需要更真实的环境，以便发现实际运行时的问题。

最近真的是又感触非常多，还有两篇都列好了点，但没有来得及写。一个是讲讲安全产品的，一个是讲信息保护和数据安全的。当真是学无止境，瓶颈突破之后带来的视野能够看到更多不一样的东西，常看常新。
---
layout: post
title: 什么是安全架构《三》
categories: 安全工程师
kerywords: 企业安全 互联网企业安全 架构评审 安全架构 数据安全架构 数据安全 什么是安全架构三
tags: 安全架构 数据安全
---


# 前言

2020年最后几天，也算是把这篇文章补上了。修修补补，简单讲下在最近工作中对数据安全架构的一些认识。希望有用。 下文将以三块进行阐述，分别为数据安全的基础架构，运营管理和产品自研。文中部分场景受限于自身经历，可能各行业之间稍有差异。但道理大致相同。


# 数据安全的基础架构

在绝大部分情况下，做数据安全的同学可能并不会参与到数据安全的基础架构中去，而是更多的focus在运营和服务交付层面。比如说提供相应的咨询，处理内外客户的需求。而数据安全相关的设备/软件的部署运维大都还是由基础安全的同学进行维护。这样对于新人来说，其实比较容易进入的一个“点”上的误区。只能看到手中所处理的相关服务，从而忽视了整个面上的东西。甚至忽略了处理业务的生命周期链。了解业务才能更好的服务于业务。在数据安全的基础架构中，至少应该关注三点，**一是流程和策略的制定，二是工具和设备的维护，三是相应服务的提供（咨询，运营等）**。这三点都应该有一个框架去约束，让其能像剧本(Playbook)一样跑起来。

所以在数据安全的基础架构中，即应该关注策略也应该关注产品和服务交付的部分，这也是最先需要的做的事情——了解业务架构。因为数据安全更贴合业务，需要去知道哪里提供了什么样的服务，服务需要受到什么样的监管，现有的设计是否能够满足监管的要求等等。所以没有业务的深入理解是做不好数据安全的。其次需要从组织架构上需要建立协作的流程规范，例如获取生产数据的流程，唯一途径来自哪里（是不是需要收拢入口？）假设说只有合规部门可以取数据，那么即便法务部门需要相应的数据，也需要经过合规部门的审批。而所有的操作流程也都应该有相应的审批记录。从技术架构上建设相应的解决方案，数据怎么存储，存储在哪，怎么传输，静态数据有没有实现加密(DARE)，权限有没有管控，使用的工具是不是符合相应的标准等等，都是技术架构上需要解决的问题。

下面会以不同的视角简单的介绍一下相关的工作内容，在不同的视角下，把安全过程中涉及到的内容分散开了，乍一看会有点懵，但是事实上这种思考方式将会使安全工作更完善。例如，从银联获取数字证书的流程。那么从业务视角来看，作为接入机构需要通过证书来做身份认证，仅需要通过提供相应的行政流程（书面申请，盖章等等）即可获取。但对于如何设定证书接收人，证书接收人的信息如何处理，如何满足获取证书的环境安全，如何确保证书获取的过程可以审计，又如何使获取后的证书安全存储？是不是也属于业务范畴之内呢。 除此之外从应用视角来看时，就是提供该证书给应用进行调用即可。在这个过程中其实还需要考虑基础架构，多活、灾备机房、不同的虚拟化技术下的部署，是不是有预读取等。而回归到数据本身来看，就是怎么样把等级为xx的一对公私钥密钥对，公钥可以任意分发，私钥仅能应用在内存中读取。那如何规避非法的读取，权限的控制，以及对私钥的保护等等又是回归到了数据本身。

## 业务视角

// 仅以个例说明下业务视角下数据安全涉及到一些事情。

![image](https://img.iami.xyz/images/103196520-4e376880-491f-11eb-8fa3-60556afd9fa5.png)

业务上更多的会关注在流程和合规。而无论是在国内还是国外，合规基本上可以说是企业的生死线了。单从金融支付的业务来说，涉及到的合作伙伴就有中国网联(NUCC),中国银联（CUP),互金协会(NIFAC)，清算协会(PCAC)。除此之外，无论是中央政府还是地方政府又有着相应的政策策略要求。中央性质的比如中央人民银行(PBOC)，中国金融协会(CFA)，公安部。地方性质的比如PBOC的北京办公室、上海办公室，上海的浦东金融服务办公室。作为四方（用户=持卡人、线下/线上商户、发卡机构、收单机构）模式中的角色，是难免和这些部门进行打交道。当然，更多地时候是法务部门去进行接洽，以及传达相应的政策。但实际上的安全合规只能有技术中心互相协作完成。 无论是CFA的支付业务的支付持牌认证，还是接入银联的UPDSS认证，亦或者是比较通用的等保认证(MIPS)，以及一些网警的临检，或者是央行新发的第X号令，都是无法避免的的工作量。 

以业务的视角来看，数据的分类分级和数据移动（包含传输）在此处显得尤为重要（因为大部分时间下，业务方关注的是方案“可用”，但不关注背后的实现是否“可行”，最常见的是关注如何获取数据，而非数据怎么存储的）。那么针对数据的分类分级是由法务部门来做呢？还是安全合规部门来做呢？又怎么样设计流程化的约束，和行为的审计去满足数据移动过程的安全要求呢？简单举例，如何安全的提供持卡人人脸识别信息给到一些部门做身份验证？如何通过流程获取接入机构的数字证书？如何定期的同步政要信息（已公开的）？如何验证投诉用户的个人信息？如何提取一定时间内用户的账单？ 商用密码的要求、网络IPv6的改造等等。都需要能够针对已有业务进行梳理，不仅包含于生产上的业务，还包含安全部门对外提供的业务。

## 应用视角

大的趋势是往云原生在走，对应服务网格的概念也有同行提出了安全切面。应用和服务是业务的最直观体现，用代码承载了业务流程，用IT基础设施存储了业务数据。 简单的来看，是用户发起了请求，应用进行了响应。而实际的应用可能部署在不同的数据中心，不同的安全域内。不同应用下的不同服务也在进行着调用。画了一个简单的图来表面应用视角下数据的流向。

![image](https://img.iami.xyz/images/101589426-58063400-3a23-11eb-97bb-1a08f96b9b47.png)

以应用视角来看，在应用生命周期内，鉴权和加解密是至关重要的一项。全链路TLS，不仅需要从client到application，还需要service之间进行加密传输。怎么设计CA，怎么使用证书，需要明确哪些policy，传输过程需要支持相应的TLS Cipher Suite， Version， Algorithoms等等。又需要明确哪些启用国密算法。除去业务应用之外，基础服务例如APM， Logging数据等又该如何存储，这些服务了服务的服务(为应用提供基础服务的Service），自身是否实现了同一个安全等级的要求？在不同Zone间交互的ACL策略又能否遵循最小化原则？加解密服务是否做了权限控制？ 如果再回到SDLC中去，那么是否存在可能的越权（或其他）漏洞，使得在应用中解密了相应的加密数据， 源码是否泄漏到公开的托管网站？会不会存在针对扫描服务器的白名单“陷阱”。回到线上的话，又有多少恶意流量被清洗掉，无论是四层还是七层。当然这些似乎已经脱离了数据安全，实际并不然。正如前文所述，均为互相依赖。是不是可以在流量清洗时补充相关的风控数据？更新的feed源是不是有可能被污染？诸如此类不胜枚举。

所以在关注应用的时候，还需要关注承载应用的基础设施，以及网络流量的清洗，和应用本身的代码相关。并不是说堆了多少设备，买了多少服务就能够解决问题的。

## 数据视角

谈完了应用视角和业务视角。终于回归到了数据本身。数据视角的处理方式，最根本最直接的就是对不同类型的数据提供安全存储（加解密）的同时能够在可审计的授权下确保数据转移过程中的一致性。当然可以跳过这句话去看看DSMM之类，之所以在此时才提到DSMM，是因为DSMM模型本身缺乏在业务和应用上的框架约束。当然更深入的应该还是读书和实践。简单举例来说，在数据安全工作中，涉及到的有用户数据，不仅出现在流量中，还出现在日志中了，数据库中。在不同的位置，数据在什么时候是明文的，又有什么时候是加密的？什么场景下取什么数据都是需要根据相应的策略和约束进行的。除此之外，在考虑到数据等级和数据类别的同时，还需要考虑到是不是这个数据能在这里获取/打开，是不是能够存储。例如针对持卡人数据是不是能存储在本地，是不是能出境等等都需要考虑。在针对静态数据的加密，动态数据的分类扫描以及相应的权限管理等安全控制之后，还有一项必要措施就是针对所有的行为进行审计。而所有的审计日志，无论是数据库审计还是DAL层，亦或者是针对不同设备的常见的操作日志。都应该推送到集中的日志集群。冷热分离，计算分析。同样在这个过程中有哪些场景需要针对敏感数据的脱敏？

<!-- 目标范围：日志，数据库
对文件的加密，音视频的加密，密码的加密，持卡的加密。
静态数据加密
动态数据扫描
行为审计
权限管理
加密存储
数据库的审计
行为审计，堡垒机 -->

在数据视角上还是需要回归到数据本身，丰富数据的属性，关注数据的流动以及相应的流程制度。那谈完了数据安全的基础架构之后，我们可以看看怎么在基础架构上做相应的运营管理。

# 数据安全的运营管理

上面在基础治理方面做好了运维部署，产品的运营管理之外，最主要的是对外提供服务的运营部分。 一般来说体系的建设离不开标准的制定和专项的服务。而大多数时候，提供技术运营占据了工作的大头。但细看一下，可以分为三类，一种是技术咨询，一种是合规审计，最后一类专项服务才是技术运营。至于标准的制定，往往是管理者进行，当然也不乏许多一线工程师进行编写然后逐级批准的案例。(最好还是专项的manager负责或者资深的技术专家)

![image](https://img.iami.xyz/images/103217098-b8b5cc00-4952-11eb-86c8-b5f2fb1a8144.png)


1 策略
就策略而言，准确的来说是策略-标准-流程-指南的一个过程，策略告诉了你why，标准告诉了你what，流程告诉了how，而指南就是step by step.

2 协作
协作是至关重要的，本来我是抽出来放到了策略流程里。但是后来想了下这些约定似乎并没有明确的流程规定。例如，规范统一的接口团队和接口人。

3 咨询
咨询是一项繁复又考研自控力的工作，就像运营工作中难免遇到一些傻傻的问题，那我们应该撒气或者生闷气吗，显然不必要的。这也是极为考研提供咨询答疑之类support角色的心理。下面提到的专项中的合规审计其实也有很大一部分是咨询的工作。但是对于很多企业并不会单独为该项服务设立单独的角色。

4 专项
具体可以做的一些基础工作可以参考之前写的一篇文章 [浅谈数据安全](https://iami.xyz/Talk-about-data-security/) ，当然这篇文章也并不是列出了全部。下面也就简单举例一二。（由于每一项都需要有系统的基础运维日志收集监控等，因此暂时不列在下面了）

* Crypto/Secret - 算法选择咨询/密钥的生命周期管理（增补删除）
* PKI —— CA/RA - 申请证书的答疑咨询/证书生命周期管理
* IAM —— AD/SSO/MFA  - 接入SSO的答疑咨询/账号的生命周期管理
* Log/Audit/Analaysis - ...
* DLP - ...
* AVScan - ... 
* Data Movement - ...
* 合规审计

有一点值得一提的是，对外提供服务运营涉及到数据安全部分的工作需要有留存的审批流程，以及相应的审计日志。同时在完成对应操作之前需要确保背后的解决方案是否可行。不过在运营阶段很多时候技术架构师已经确认的了。简单举例来说，有一个被approve的数据移动请求，如果是第一次接触则需要背后的技术架构是否允许相应的动作，为什么移动，移动到哪，移动的数据级别。否则仅是流程允许是不可以的。假设获取的是高敏感数据，同时不允许在某些设备上存储或获取，那原有的方案就需要调整。

# 数据安全的产品自研

在企业安全的成熟度模型里，很少有企业能够发展到安全产品自研阶段，更不要提数据安全产品了。能喊得上来的也屈指可数。由于我本人只写过一些小工具，并没有参与研发过工程化的企业级安全产品中去，因此仅就观察到的一些经验加以阐述。在数据安全产品自研的过程中，或者说在安全产品的自研过程中。绝大部分是为了解决企业内部场景的适应性问题。这些产品具有商业化产品的类似功能，但又能适应场景。比如拿KMS来说，外部的KMS可能无法很好的集成到现有的基础设施中去，无法使自有的脚手架代码快速Build。亦或者HSM，如果没钱买HSM，那么Softhsm就成了一个可选项，配合着TPM对自有的加密服务进行集成。亦或者是加密即服务，结合HSM做根密钥管理，KMS做密钥管理，提供对应用服务的加密服务，亦或者是数据库审计服务，日志分析等等。亦或者内部的自助服务，比如自助证书申请，数据分类分级工具。这里面的一个关键问题就是工程化问题，很多时候安全工程师能够给出原型代码，但大多数不是工程化的代码，不能提供出来性能功能兼备的产品。当然这并不是绝对的，还是有很多优秀的工程师可以以一己之力完成。不过互相配合岂不更好。

在企业中很多时候在自研安全产品上，必须给出足够的说服力，否则老板会想我已经花了2kw买产品，你为什么又要招安全研发工程师呢？而向上阐述安全的价值，自我了解到的现状看来，绝非易事。

# 后记

不同于基础安全的High risk， 应用安全的High threat，数据安全本身的特性更加偏向于High Value. 这也意味着数据安全工程师需要投入更多的精力，但是这些工作又绝非孤立能够完成的，必须要联合起其他方向的安全工程师一起努力，持续运营。 

每当遇到瓶颈都要告诉自己，瓶颈之外还有新的技术视野。持续学习吧！

关于安全架构写了三篇，分别浅谈了应用安全架构，基础安全架构和数据安全架构: 
* [什么是安全架构《一》](https://iami.xyz/Security-Architecture-Review/) 
* [什么是安全架构《二》](https://iami.xyz/Security-Architecture-Review-II/)
* [什么是安全架构《三》](https://iami.xyz/Security-Architecture-Review-III/)



2020给自己定下的目标是健康，戒急。2021不妨也定个目标吧，锻炼，戒忿。

这篇文章也算是拖拖拉拉写了1个多月，行吧。就这先。
![image](https://img.iami.xyz/images/103219192-fcf79b00-4957-11eb-863f-ecf840011745.png)
---
layout: post
title: 再谈安全架构《二》
categories: 安全工程师
kerywords: 应用架构 安全架构 数据安全 企业安全架构 架构设计 业务驱动
tags: 安全架构
---

# 前言
原本近期是不打算再写安全架构系列的文章了，想着自从写完[《安全架构要参》](https://book.iami.xyz)之后，对安全架构的认知在短时间内应该不会有大的提升了。事实也的确如此，不过恰巧因为团队的一点小变动，个人又接触到了应用架构评审的一些工作内容。回想两年多前的[安全架构开篇](https://iami.xyz/Security-Architecture-Review/)里，正是从学习架构评审（技术架构评审为主），做解决方案开始的，于是便打算稍作总结，谈谈全球化业务是怎么处理业务上的架构评审的，也间杂着一些其他思考。

# 安全建设与安全能力
反复的讲这个话题，多少会有点新瓶装旧酒的嫌疑。唯一需要强调的就是**安全建设一定要能够达到有效的输出**。否则安全团队做的再多再好，也更像自娱自乐罢了。举例说， 选型做好了终端安全的测试，部署等等，从预研到采购在安全团队似乎都非常的流程。等到实际部署时发现OS版本多，网络复杂，缺乏MDM等等。虽然并不一定影响最终的安全能力输出，但却极大的增加了工作量。类似的还有，建设好了特性充足的KMS，PKI等，发现无法有效覆盖，也无法有效推送或者让别人有效接入，就会是非常大的问题。要能明确团队的定位是在什么样的位置，无论是采购，自研亦或开源，引入的工具能否成功的输出安全能力。例如建设`Crypto Agility `，建设`Security As Code`(同Infrastructure as code,有多少个类似的概念衍生？), **有多少是现阶段需要的，又有多少是能够应用到当前基建的？** 类似的问题在其他团队也有。

# 业务架构评审与流程管理

## 业务架构评审
国际化的业务往往覆盖在不同国家，在业务性质上涉及到跨境的首先就会面临到不同区域的**法务以及风险合规**。其次是**职责分工**，比方说这个业务在global和local两侧都有开发，那么如何遵循SPLC/SDLC？是global和local各采用一套，还是统一标准采用global或local的？最后就是**流程管理** ，使用什么样的工具去追溯各方需求和进度以及协调资源等。下面以一个不涉及新业务上线，仅针对业务流程变更的评审会议为例介绍。
参会各方和主要职能如下：

| 角色   |      职责      |  备注 |
|----------|:-------------:|------:|
| Business Risk Control |   Business Risk   |    |
| Security Consulting | Security Consulting |     |
| Infomation Security | Infosec Policy | 是否符合内部策略    |
| Enterprise Security  | Security Tech | 是否符合内部技术标准    |
| Legal Counsel | Legal Consulting | 包含了Local & Regional   |
| Risk and Compliance  | Compliance | 是否符合合规 |
| Product Manager  | Presentation | 回答参会者的提问    |
| Project Manager |  Project Management  | 回答参会者的提问 |
| Software Engineer/Architect   | Presentation  |  回答参会者的提问 |
| Data Science | Presentation  |  视情况而定   |


这里明显感到和过往经历的架构评审有所不同，之前所参与的更偏向于技术的架构评审，是针对业务的具体实现的一些发问（记得当时与会者也分别是不同技术团队的架构师）。

## 流程管理
我们再谈谈流程管理，如何把职责分布到不同流程中去。假设把SDLC这个流程简单分为五个阶段,每个阶段有不少过程。
1. 安全架构设计
过程: Abuse Case Analysis，Checklist，Risk Control and Identification Process etc.

2. 安全开发（Secure Coding)
过程: Security SDK/Frameworks, SAST, OSS(Open Source Scanning)， Mobile Security etc.

3. 持续构建
过程: SAST, OSS, Mobile Security, DAST, Penetration Testing, Container image scan etc.

4. 持续部署
过程:Image Scan, Release Checklist etc.

5. 持续防御 （Defense and Monitoring)
过程: DFIR, Bug Bounty, Penetration Testing , Vuln Management etc. 

不少情况CI/CD都放在一起了，其实还是应该区分开的。那么针对以上简单的5个阶段中的不同过程，又有多少个触发点呢？比如说Pull下代码或者Commit代码，应该触发那些Security Control？ 同样的，从build到打Package到Stage，亦或发布到Artifcat/Image Repo 等。都是值得思考。

除此之外，假设存在一个平台能承担上述的流程管理和过程控制，那同时还要考虑不同区域的业务是否都能放进来。因为不同区域的法规不一定能够满足最理想的状况。例如这个企业如果在国内有分公司，那根据China Data Security Law，就不一定能允许这些数据放到一个全球化的平台去完成安全控制。因为可能涉及到数据出境。当然是不是能把平台本地化呢？那就是另一个话题了。如果不能本地化，如何以另一种形式输出安全能力？规范和流程如何相同等等，都是值得深思的。


# 总结
开始体验到那种首先要满足某个target而不强求具体的实现了。虽然这依旧会让人感到不满，但也能理解这是个逐渐优化的过程。例如有些平台没有的时候，就要靠其他工具实现，可能不是完全自动化的。也就是说只是在某几个点是自动化的，但是整个流程不是自动化的。


# 参考
* [安全架构要参:构建企业适用的安全架构](https://book.iami.xyz)
* [什么是安全架构](https://iami.xyz/Security-Architecture-Review/)

---
layout: post
title: 管理团队与项目
categories: HowTo
kerywords: 项目管理 数字化运营 沟通 管理转型 安全团队建设 团队管理 向上管理
tags: 漫漫人生路
---

# 0x01 前言

最近扮演了一段时间Head Of Security的黑脸（Head自身比较友善，但是团队确实需要往某些方向带一带），我自己心中知道这可能是一个得罪人的工作。不过也只能就事论事，不卑不亢。我知道为什么做这件事，所以时常反省，避免自以为是，相对来说算是比较清醒的了。在这段时间里，面对一个30余人的安全团队，我也确切体会到了负责人不容易的地方，从团队建设，项目管理，资源协调等等各方面。多多少少，有点总结。虽然比较忙，但还是简单记录一下，以供时常反思。

# 0x02 正文

日常任务不足以作为凸显团队工作内容。如果团队需要承担更大的职责，获取更多的资源，就需要去妥善管理内部的项目，并通过定期汇报获取Leadership的支持，同时也能为团队带来更多的利益。

## 项目

项目是团队很重要的输出，做项目就意味着一段时间内需要将人力物力等资源放在某项事情上，获得一个结果并展示出来。项目管理上来说，我总结了以下几点：

* 敏捷交付与沟通
> **项目管理的核心是沟通，沟通的关键是学会聆听**。敏捷交付的原则之一就是通过沟通去满足用户需求进行交付。对于敏捷交付可能并不完全适用安全团队。尤其是当安全团队在自研产品这一块能力缺陷的时候。不过我们依旧可以吸取敏捷交付的一些实践。例如每日站会，任何人都可以去主持；每周花1h去细化下一个迭代的细节；每两周一个交付；每月一次总结和汇报等。至于产品选型，解决方案交付依旧可以采用传统项目管理的方式。因为从Demo到POC，到采购，部署这一套流程是相对成熟和固定的。而无论是敏捷交付还是传统项目跟踪，沟通都是至关重要的。切记切记。
* 信息差与交付质量
> 提到复盘、闭环、拉齐（阿里黑话），碰碰、摩擦摩擦（腾讯黑话），有时候内心难免反感。但实际上沟通目的之一就是为了降低信息差，确保大家对于需求的理解是一致的（参考三个人依次双手搭在伙伴背上画图的视频）。否则业务需求在架构设计出现偏差，架构设计在选型时缺少功能覆盖，再到部署出现稳定性问题，一系列的失之毫厘，最终将谬之千里。我在几年前已深刻体验到。例如某项OKR的交付物是部署了X台安全产品，但实际上可能没有正确部署，或者功能也未启用。这种部署率的交付质量就堪忧。
* 跟踪与汇报/展示
> **无论是跟踪项目还是建立流程，最好都是要有工具去支撑的，能把流程自动化效果更佳**。只有这样才能避免人说什么就是什么。阿里系那一套是自研的，就以M365举例吧。跟踪部分可以使用Planner去做为看板计划任务，并调度到邮件日程；员工也可以在自己的To Do里看到；使用Project去管理跟踪项目；还可以把Jira和Confluence内的相关文档附进去。汇报部分，团队内部的汇报可以以Excel较为方便，可以采用一页纸汇报的方式，对比风险与进度；对与Peer或者VP或非专业背景等汇报形式时可以采用PPT啦。对于外部展示，可以使用Sharepoint而非Wiki。当然这里面可能已有一些问题，就是工具多，但实际上各个部分的使用频率不一致，有的并不需要日常去更新）。同时也可以通过PowerAPP平台对一些流程自动化，例如使用Form收集风险并在Planner自动新增，同时对新增风险提供Review功能，通过Teams内的Approval流程确认风险是否成立。

## 团队

参加了30多周的安全部同各业务VP的例会，也整理了一段时间团队内各组的周报，结合之前对安全部组织架构模式的一些理解，总结几点如下： 

* 使用好OKR与KPI
> 设立团队的年度OKR，让每个Team Leader给出季度的OKR，并对齐年度OKR。无论是年度OKR还是季度OKR，都需要做Breakdown成Task，同时该升级为项目的做项目。使用Viva Goal记录，在OKR被Approval之后固定，在Check-In某项KR之前在系统上把各组OKR做好Alignment。而季度性的Review OKR的实现，使交付数字化，并作为KPI的一部分。OKR更多的用于帮助管理团队/个人的目标及交付，并不意味着有OKR就没有KPI，除非是一个没有KPI的公司（真香）。
* 设立虚拟角色或团队
> 受限于HC，或者专职人员的分散程度。通过设立虚拟角色或成立虚拟团队能够最大化现有资源。比如架构师作为某条业务线的BISO；Head、架构师、Team Leader构成安全治理委员会，用于对接内部需求；从基础安全、应用安全、安全运营团队抽出一些具备Pentest背景的同事组建红队等等。不过这也存在一些问题，双线汇报问题，虚拟组织话语权问题（没有KPI情况下如何进行约束）等。
* 区分项目与任务
> 参考上一节，不能把Project和Task混淆。Head更希望看到的是Project的更新，以及Event相关的，并不会十分关注BAU（Business-as-Usual）。
* Leadership与协作
> 定好一个项目，确定去做，获得了领导层的支持。能走多远就看Leadership的支持了。这种情况，做项目是依赖组织架构的。同时，能做的多好（落地）就看Team Leader或者参与成员的Leadership了，能不能做下去，做的怎么样，遇到困难怎么办，都需要Leader在前面冲锋陷阵。无论你是不是组织架构上的manager，此时你都应该先把自己作为Leader来看待。当染这也需要一个有效的协作流程，协作其实也意味着划地盘，在谁的Scope内谁负责，边界上的事情怎么处理等等。
* Training&Education
> 确保你的团队是专业的，但不能确保用户是有技术背景的。准备相应的Training或启动Education项目是有必要的。同样的，团队内部如果要打造复合型人才（加钱）也是需要Cross Training的。以及在某些演练之后通过Training完成闭环。

# 0x03 总结

在写这篇总结的时候，我又回顾了下19年写的——[做Project Leader的一些经验](https://iami.xyz/Project-Manager/)， 有些问题我仍旧思考了一下，记不起一些细节里，略微遗憾当时未曾记载下最初的看法。

聆听是一件非常重要的事情，学会聆听对沟通至关重要。

白驹过隙，愈发觉得时间珍贵，更珍贵的是在某段时光里的记忆。自为人父，至儿子呱呱坠地，其中欢喜与辛苦不尽可数。也体会到了，人生之事，不足为外人道也。多少事，都需毅力、恒心。换尿布也变得得心应手，拍嗝也顺手拈来。此篇正写于换完尿布之后。
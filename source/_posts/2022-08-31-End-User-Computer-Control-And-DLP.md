---
layout: post
title: 浅谈终端安全与DLP治理
categories: 安全架构师
kerywords: 数据安全 安全策略 安全技术 安全运营 安全平台 企业安全 安全治理 DLP 数据防泄漏 终端安全
tags: 安全架构
---

# 终端安全治理

![image](https://img.iami.xyz/images/187610583-acca64c5-105b-4893-b932-aa969c502093.png)

终端安全简单将其分为两类，一类是安全主打的终端控制，一类是IT主打的设备管理。

其中EUC控制（End-User Computer Control）又可以细分为 
* 反病毒和终端检测及响应（Anti-Malware and Endpoint Detection and Response）
* 漏洞管理和强化合规性（Vulnerability Management and Hardening Compliance）
* 系统加固
* 数据防泄漏DLP（Data Loss Prevention）

可以很明确的看出来这些工具以及对应的能力提供和运营来自安全部门。同样的，我们还需要IT去做些工作。
* 设备准入（SASE： Secure Access Service Edge）
* 用户设备管理（UEM： Unified endpoint management）
* 自助服务中心（Self Services）

那么此时端上就变成了这样的一个状态：
* 使用AAD的账户密码替代本地的用户密码，这样在AAD启用的密码策略同样作用于端上。
* 使用系统加固收拢DLP控制点。例如全盘加密避免PE的copy，禁止了USB存储而不需需DLP一直监控USB存储，Admin权限降级避免卸载终端的安全软件等。
* 全盘加密（File Vault/Bitlocker）使用的Key记录到UEM安全保存。
* 使用允许的软件并禁用黑名单软件，例如阿里工作的一定概率要禁止使用企业微信作为IM，在腾讯也不会推荐用钉钉。同样的各种网盘，云笔记，远控，代理等也是不推荐在系统中使用的。
* 结合设备证书Enroll你的设备，当满足安全标准之后推送准入软件（SASE）等。例如仅当安装了AVScan，DLP，EDR之后才能使用VPN/SASE类工具。
* 使用用户证书增强VPN/SASE的准入，并保持网络的接入状态。当然有条件的话用户证书也可以直接存到硬件中，例如yubikey。
* SASE里可以控制访问到Internal的流量协议类型，例如仅支持RDP，SSH和HTTPS。同样的也可以控制到访问到Internet时支持URL Filter。
* 使用RBVM工具同步UEM中软件资产，生成对应的补丁或者更新，并通过UEM进行推送。

# DLP治理

数据防泄漏一直是安全治理中的重要一环，但大部分企业往往是通过Host DLP和Network DLP去实现的。最初我在做的时候也是仅仅是依赖单点工具，而DLP的治理显然是不应该如此的。我仅结合终端安全简单谈谈一些看法：

* DLP的治理需要红线政策配合技术支撑（可以单点，建议尽量把各种能力配合起来）以及运营管理。
* 同样的需要有数据分类分级的标准，针对不同等级的数据做不同的控制。参考上一篇博客。
* DLP的规则在DLP Policy注明Approved File Type进行监控。例如：word processing类型的后缀文件，prensentation类文件，email，sourcecode等。
* 一般来说更多的是Monitor而不是直接Block/Deny。
* 终端捕获的数据应该加密后回传。
* 结合一些特定场景，尤其是入职离职，AK的拷贝等进行重点关注，同样的针对一些特殊关注也需要自定义策略。另外针对离职还需要做到离职权限的自动化回收。
* 安全自己也要闭环，包含日志审计等。例如安全自己去查这些事件的行为也应当被记录，不能因为提供安全能力而存在持续的exception。
* 针对Cloud APP的DLP，使用Azure得话可以直接结合Microsoft Defeneder实现。
* 微软的DLP可以做到一些自动分类，但是不支持国内的敏感信息识别，需要自己自定义实体。说明我们的数据安全规范整体做的不是很好。（其实其他领域也一样）
* 系统架构的标准化是非常有必要的，例如各个工具的管理端都要支持HA，FQDN，TLS，SSO/LDAP，Logging，Monitoring等。（可以看到图中各个工具管理端都支持SSO登录。）
* 针对默认的安全措施提供exception的流程，针对exception的流程提供对应的处理方式并以自动化的形式实现。例如默认收回了Admin权限，那针对Admin的权限获取在Approve之后，应该能够及时的通过UEM为终端电脑赋予相应权限。
* 提供统一的文件分享工具（需符合系统架构标准），无论是办公网到生产网，还是提供给公司的合作伙伴。
* 针对Mail的DLP看具体Mail Server的实现方式，一般来说服务端可以转发到DLP服务器，同时结合客户端做相应的动作。例如Outlook支持对数据进行标记，根据不同等级禁止copy，禁止转发，签名水印等。
* 尽量避免使用传统的NDLP在网络层接收流量分析，如需使用应该和SASE结合起来。

# 后记

心中踌躇，散步归来记录此篇，真道是天凉好个秋。 
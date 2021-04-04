---
layout: post
title: 安全运维以及AWS云安全之外的一点点思考
categories: 
kerywords: 
tags: 
---
## 安全无小事
到BTCC也快一个月了，入职以来的第一件事就是负责安全架构的设计和整个体系的架构。很忙，东西基本也有出来个眉目了。干了不少事，也没时间记录，抽空码一点吧。当然，此处特别感谢安全小飞侠师傅最初给的一些建议。思路吻合，非常不错。整理了一下，我在整个过程中需要面临的问题。

- [x] 基线加固和架构安全 
- [x] AWS云安全 (Done, AWS配置策略检查，IAM权限划分，并依托AWS自身的Guardduty, WAF&shield,Cloudwatch等服务,建立监测报警体系，SNS推送)
- [x] 内网安全(Doing, 已经做了划出单独网段，与市场，运营，客服分开。跳板机记录开发人员操作历史)
- [ ] 开发SDL落地与安全意识培训
- [x] 流量监控和服务器状态监控分析(Doing,基于AWS的一套已经差不多了，但是目前计划要切k8s)
- [ ] 日志聚集和分析
- [ ] 入侵检测和应急响应
- [x] SRC的构建(Doing: 拖了运维和IT小哥算是组了个超级简陋的SRC)

那么又如何结合云平台如何实现，云上安全体系的构建是否完全等同于传统构建思路。根据常规的安全运维方案对比AWS实现来做，如何结合AWS自身的一些产品建立起监控报警体系，是否需要拥抱新技术。例如在云上无法收集到EC2服务器间的内部流量请求，依旧需要采用ELK的方式去收集日志并进行分析。同时还有的就是，和ELK对比，是不是可以采用Grafa替代Kibana, 采用Graylog更好一些。采用Splunk进行日志分析呢(Splunk真是好，就是目前买不起企业版的)？如果拥抱新技术的话，k8s是一个不错的选择，当然需要一定的学习成本，但依旧是最好的选择，按照Server Mesh的理念去做。无疑来说监控监测等方面会更加的方便。

## AWS安全

这边主要采用得就是EC2,RDS,ELB,EBS,S3. 基本原则就是记录一切log，定期打快照，以备不测，由于快照是增量的，也不会增加过多的收费。

* S3安全，策略配置，是否未授权访问，访问token过期时间是否设置，访问s3是否记录访问log
* VPC与安全组，入站和出站的流量，是否开启了不必要的端口，是否只允许指向特定ip或只允许特定ip访问。VPC附加的是否有冲突，优先级由哪个来确定
* RDS所有log开启以及记录慢查询，是否属于未授权访问。错误日志，访问日志打到S3,配合后期进行分析，同时通过Guardduty触发特定动作操作，并启动通知至SNS。
* EC2服务器安全，服务器安全参照常规服务器安全加固，以及checklist
* IAM配置以及策略配置，角色和策略需要控制好，道理很明白，切勿权限过大。
* CloudWatch 通过对不同事件和服务器的物理指标以及网络流量(入站出站)进行监控，并触发相应的设定操作
* Guardduty, WAF & Shield 配置WAF 进行网络层和应用层的攻击拦截，可以挂载到CDN后，也可以挂载到ELB后面。GuardDuty和WAF都支持自定义威胁ip列表，而且WAF支持更多的配置项。相对于阿里云waf，有一定的使用门槛，但是定制度高。(不过最后还是选择了阿里云waf，因为省事...)

其实还有要改进的地方，例如采用kms控制s3/rds数据流加密。对EBS卷加密都还没有做。暂时不是很需要。

# Other

即便如此，出在应用层的问题还是不少的。开张没两天就有人来勒索5个BTC，后来又来要10个BTC。当然也有一些安全研究员提交漏洞。自己也挖了几个简单的XSS和CSRF的漏洞。但是总归精力有限，职责有限。联系的知道创宇的测试服务也就要开展了。

拥抱新技术或者说学习新技术的过程中总是充满乐趣(踩坑)DevOps。目前已经可以采用Terraform进行了自动化多区域部署不同币种的钱包同步节点，并采用S3进行增量更新。来确保区块同步时尽量不丢块，这样对于交易所来说检测交易对是否成交从而确认交易是否到账起到了很大的作用。

k8s把资源对象化，就像Terraform把基础架构代码化(IAC)一样,为SRE提供了极大的方便，我是刚接触使用k8s,不多做评价，感觉极好，尤其是在自动化扩容和磁盘共享上有天然优势，监控也是。等后期更加深入再做介绍。

**保持思考，如果自己的观点正确，请保持自己的立场**

# Resources

* [S3Scanner](https://github.com/sa7mon/S3Scanner)
* [Scans](https://github.com/cloudsploit/scans)
* [Security Monkey](https://github.com/Netflix/security_monkey)
* [Scout2](https://github.com/nccgroup/Scout2)
* [Google SOC](https://static.googleusercontent.com/media/gsuite.google.com/en//files/google-apps-security-and-compliance-whitepaper.pdf)
* [AWS Security Checklist](https://d1.awsstatic.com/whitepapers/Security/AWS_Security_Checklist.pdf)
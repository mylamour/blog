---
layout: post
title: 架构要略
categories: 安全工程师
kerywords: 企业架构 应用架构 安全架构 数据安全 企业数据架构 数据架构
tags: 安全架构
---


> 总结自2021年PayPal春季架构大会， 着实学习了一下Distinguished Architects的知识经验。本文题名要略，加之学自内部，故仅列要点，不涉详情。

# 0x00 总体设计
总体设计即是蓝图设计，包含了整个企业运转的架构设计，从商业到IT，从本地化到全球化再到本地化。建立支撑所有业务的基础设施，自业务线产品线抽象形成通用平台，为不同的客户提供服务。每个企业都应该有自己的蓝图规划，即所谓的企业架构设计，依此为标准完成相关工作。

* 基础设施与安全： 基础设施，数据平台，安全，开发平台，集团服务等
* 通用平台： 卡，风险，支付，认证，合规，金融，客户服务等
* 产品线： xxx， yyy等
* 客户： 消费者，商户（小微，企业，合作伙伴），全球本地化（xxx，快速市场，yyy)等

# 0x01 应用架构
产品是业务的直接体现，作为支撑产品的应用架构，在设计时需要考虑哪些特性？又需要什么样的设计模式？不同层面的设计模式有什么差别。

## 1. 架构规范
* 可操作原则 —— Actionable principles
* 指南 —— Guides
* 参考架构 —— Reference architectures
* 经过审查的可执行代码示例和工具 —— Vetted executable code examples, and Tools

## 2. 系统目标
* 安全 —— Secure
* 可靠 —— Reliable
* 成本控制（效益） —— Cost-Effective
* 高性能 —— Highly Performant

## 3. 架构质量（Architecture Quality）
* 通用类（Universal)
    * 安全 —— Security
    * 合规 —— Legal & Regulatory
    * 灾难恢复 —— DR
* 对外的（Exported）
    * 可用性 —— Availability
    * 性能 —— Performance
    * 容量 —— Capacity
    * 隔离 —— Isolation （AZ, Edge, Regions)
    * 可视化 —— Visibility
* 本地的（Local）
    * 成本效率 —— Cost Efficiency
    * 可扩展性 —— Extensibility
    * 可操作性 —— Operability
    * 可维护性 —— Maintainability
    * 可伸缩性 —— Scalability

## 4. 弹性（Resilience）模式 
* 舱壁隔离 —— Bulkhead 
* 断路开关 —— Circuit Breaker
* 补偿交易 —— Compensating Transaction
* 端点健康监测 —— Health Endpoint Monitoring
* 节点选举 —— Leader Election
* 基于队列的负载均衡 —— Queue-Based Load Leveling
* 重试（失败重试） —— Retry
* 调度监督 —— Scheduler Agent Supervisor

# 0x02 数据架构
开始第一次真正理解什么是数据治理，从概念到实际工作的映射。企业数据策略通过驱动数据治理以实现商业价值，通过组织架构，技术管理，流程控制，策略标准以实现之间的Change Management去实现数据治理。

## 1. 数据治理
* 组织架构及运营模型
* 策略及流程
* 数据域模型及所有者
* 数据问题管理
* 数据变更管理

## 2. 数据质量 
* 数据分析
* 业务规则和阈值
* 数据清洗
* 数据补救
* 数据质量报告

## 3. 元数据
* 业务分类
* 数据字典
* 元数据管理维护
* 元数据访问

## 4. 主从数据
* 标准及聚合
* 业务和数据规则
* 数据中心和常用服务
* 主从数据持久化
* 主从数据访问

## 5. 数据运营
* 数据生命周期管理（收集 -> 存储 -> 使用 -> 分享 -> 销毁）
* 数据供应及源认证
* 数据转移和持久化
* SLA管理
* 数据认证

## 6. 平台及架构
* 数据模型
* 数据管理平台
* 数据整合
* 数据架构

## 7. 数据保护
* 数据安全
* 数据隐私

## 8. 数据风险管理
略



# 0x03 最佳实践
总结了一下全球化设计以及平台架构的可观测设计相关。

## 1. 架构设计
可以看到相同的东西在不同的时间考虑时定位是不一样的。例如前面在考虑应用架构设计时，根据Universal/Local/Export去考虑时，安全是否被通用的覆盖到。但是在架构Review时，安全又是独立作为一部分出现，是不是满足合规和安全。同样，这些特性也被分到不同的Category里，Scalability、Stability、以及等等。

* Scalability
    * Capacity
    * Scalability
    * Visibility
    * Performace
    * Efficiency 
* Stability	
    * Availablitiy
    * Operability
    * Isolation
    * Maintainability
    * DR
* Speed	
    * Extensibility
    * Testing Strategy
* Simplicity
    * Cost Effectiveness
    * Reduced Technical debt
* Security
    * Complicance
    * Security

## 2. 可观测（Observability）性平台架构设计
E2E (Collect->Ingest->Process->Index/Store->Alert->Query/Visualize)

* Architecture
    * Observability & Monitoring 
    * Deployment 
        * Core development 
        * Ingestion pipeline 
        * Access 
        * HA & Fault Tolerate 
        * Security 
        * Coverage 
    * Logging, Tracing, Metrics, and Alerting Features 
* Availability  & Lag Measurement
* Subsidiary Convergence

## 3. 全球化架构设计
对比在将国内业务作为全球业务本地化的一部分时，不难看出一些设计理念的应用。

* 产品内容 —— Product Content
    * 代码内容分离 —— Separate Code and Content 	 					
    * 独立化部署 —— Independent Deployment					 					
    * 本地化内容 —— Personalized Content 
* 全球化框架 —— Globalization framework
* 本地化支持 —— Localization support
* 统一开发套件 —— Front-end SDKs	


# 0x04 结论及其他
不难发现，无论是数据生命周期管理，还是应用生命周期管理，乃至数据安全应用安全，甚至整个安全体系，均是整个企业架构中的一部分。之所以故意未将安全架构放在此文中，是希望去掉一个先入为主的概念，然后对照应用和数据本身进行一定的思考。

* 每个特性需要有对应的计算以及评估方式。例如Availability的评估，从Human review & Audit 到Chaos Testing
* 一些特性对应着具体的Pattern，以便于落地
* Reliability: Availability, Isolation, Capacity, Scalability, Operability
* Google提出的一些概念怎么在企业内进行落地，例如：SRE -> SRCE （ C:Cloud)
* Quality是一个经常在不同类别里提到的东西，是根据Modeling列出更加具体的适应Theory的一些东西。
* 怎么样从engineer成为Architecture呢？先看Architecture要解决的是哪些问题，然后再看需要哪些能力。补充学习，对比参考经验，总结为知识。
* 不同的BU在一些基础设施的上建设优势不同，例如有的把Infrastructure As Code做的很好，有的把容器化做的很好。都值得学习。

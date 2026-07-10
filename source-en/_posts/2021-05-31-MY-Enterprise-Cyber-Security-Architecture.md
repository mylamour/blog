---
layout: post
title: My Take on Enterprise Security
categories: Security Engineer
kerywords: Enterprise Security Internet Enterprise Security Architecture Review Security Architecture Data Security IAAS PAAS
tags: Security Architecture
translated: true
---


# 0x00 Preface

I was originally planning to write a few new posts on security architecture, and it happened to line up with some frameworks I'd been reading the past few months. So I decided to do a summary first and save the deep dives into each layer for later. This post is inevitably a bit one-sided given my personal experience — keep that in mind and think critically. Let the diagrams do the talking ↓

# 0x01 Starting with Enterprise Architecture

![image](https://img.iami.xyz/images/120158690-fd59d200-c226-11eb-9166-79f08063e497.png)

I want to start with enterprise architecture, because understanding the enterprise isn't where security work begins — but it does determine how far you can take it.

* TOGAF provides a general methodology that bridges business architecture to IT architecture. ITIL provides hands-on guidance for implementing IT infrastructure, and ITSM is a service management framework for IT operations.
* TOGAF defines a four-layer BDAT model. Here I'm treating the T layer as Infrastructure.
* The definitions of products within IAAS and PAAS are actually relative. For example, a DB can be part of PAAS, or it can be SAAS — and for financial enterprises, on-prem is usually the requirement. Also, setting compliance aside, a private cloud can run on top of public cloud infrastructure. The IAAS, PAAS, public/private distinctions here are defined by their business nature.
* Delivering services requires a focus on Customer Centricity (trustworthy, sustainable, fast delivery, maintaining customer relationships as appropriate). Enterprise security work should borrow this mindset too — whether you're serving internal or external stakeholders, you should be oriented around continuous delivery.
* As you move from IAAS to SAAS, the CSP handles more and more while you manage less and less. But IAAS isn't just about infrastructure security — data security should also be customized around HW/SW, storage, and databases in day-to-day scenarios.
* GRC is often the first layer of problems products face externally, and it's also the force that drives internal IT architecture changes.
* In business architecture, strategy, operations, and technology are all non-negotiable.
* Architecture is basically a set of frameworks that conform to various rules and then impose constraints on new business. The business can be customer-facing or internal. For the security team, the direct customers are the other departments inside the company.

# 0x02 Revisiting Security Architecture

![image](https://img.iami.xyz/images/120158828-20848180-c227-11eb-9fdc-b2ae48efb43d.png)
* What drives enterprises to take security seriously generally falls into these categories: compliance, public safety, reputation, and financial security. From a business perspective, the most immediate pressure is regulatory compliance and internal risk management. Business demands drive IT changes, and those IT changes feed back into how the business evolves. Policies and compliance clearly shape what the business can and can't do.
* Here I'm simplifying security governance in IT architecture into three layers: infrastructure security, application security, and data security. Worth noting though — the corporate network's business systems aren't necessarily deployed in the office, and the DC isn't necessarily running only production workloads. In a remote-work setup, you might not even deploy a corporate network (Corp) environment at all.
* CIS provides the most precise Control Set at the infrastructure layer. ISMS, as part of ISO 27001, provides a guidance framework for information security management.
* Things like logging and monitoring — that's core ops-level stuff, and it's not necessarily the security team leading it. And it's not limited to infrastructure security either; applications also need logging and monitoring, that's a universal requirement. Same story for audit, account management, and authentication integration.

![image](https://img.iami.xyz/images/120158876-2da17080-c227-11eb-8933-ec103482587f.png)
* Looking vertically at how an application gets deployed: business gets broken down into components — you can slice by processing order or by business type when doing application design. Once the application is designed, it runs on a specific system architecture (meaning concrete components like Nginx, Tomcat, LVS, gateways, etc.), then VMs are requested according to that system architecture and deployed to the appropriate data center. Cloud-native deployment obviously makes this flow a lot smoother.
* Most companies probably don't actually have things like TAL, CAL, CAS, or DAL in their system architecture...
* Security operations, security management, and security technology are the three dimensions of security work. We need to be able to produce policies, standards, guidelines, and SOPs for external stakeholders. And throughout that process, you should be able to achieve a reasonable level of automation — especially in operations.

![image](https://img.iami.xyz/images/120158929-3abe5f80-c227-11eb-99ee-d501e230659e.png)

This is a guide from TOGAF on handling architecture — refer to the TOGAF framework for full details.
* Define scope, clarify objectives. Take a series of inputs through a set of steps to produce corresponding outputs.
* Assess the required resources or resource pools. The goal is to deliver a service — which could also be a product or a physical thing. Once you've assessed what's needed, you complete the goal through different means: commercial procurement, absorbing it internally, outsourcing development, having a vendor handle it, etc.
* Identify your Stakeholders, Points of Contact, and Roadmap.
* Lock in a regular communication plan, do good project management, iterate fast in Scrum meetings.
* Designing architecture means tackling high availability, scalability, and Capability Assessment.
* What architecture you need to think about varies by layer. For example, with infrastructure security — WAF and bastion hosts — you're mainly focused on physical and system architecture for design and deployment. For something like KMS or CA, you need to consider application architecture and system architecture, then map that to Zones, VMs, and various infrastructure pieces like LB, DB, etc. And that's still just within the services the security team provides. If you're doing dependency analysis for the PD team's architecture designs as part of SDLC, the focus shifts again.


# 0x03 Collaboration and Org Structure

![image](https://img.iami.xyz/images/120159151-7527fc80-c227-11eb-9831-b35d43d71d0d.png)

This isn't exhaustive — my experience bouncing between local-life business and Alibaba Group Security, and now navigating China and Global interactions, has been pretty different in each context.

* The left diagram shows the typical breakdown of security functions in an enterprise. When you get to a group/conglomerate level, the security function structure gets relatively more complete.
* Under the CRO line, CTO line, and CSO line, things are definitely different.
* Does collaboration between departments within a tech center, and coordination between first-level departments, need a unified intake point? For example, using DevOps to collect requirements from both inside and outside the tech center.
* KPIs constrain people, OKRs constrain individuals' goals on a project. Scrum manages the rapid iteration of those projects.
* Find the stakeholders, then go request resources from the corresponding resource pools and consume them. No PMO? Get one. Short on devs? Hire them. Have vendors do it, outsource it, do it yourself — whatever works.
* Find your project contact, coordinate the relevant resources in a unified way, and track project progress.
* Leaders/managers need real leadership — actually motivating and inspiring the team, not PUA-ing people. Also manage upward properly, otherwise your team will be burning out doing great work that never gets recognized. Awkward.
* A leadership perspective is genuinely useful — ideally you should be able to support the team to produce results. Measurable outcomes benefit everyone, and cross-team collaboration in a company can often achieve win-win outcomes. But what you'll actually run into more often is finger-pointing, blame-shifting, and credit-grabbing.
* Attitude always comes first, technical skills second — but your technical vision and depth are what determine how far you can actually take things. Hold yourself to the same standard you hold others, but also know when to keep your distance from people who'll just drag you down.
* The three lines of defense required in financial security are actually pretty hard to represent clearly in an org chart — it's more like a virtual defense line concept that cuts across different departments.
* Large enterprises will do their own security research, build products on top of their security technology, promote internally, and form Core Products — without just reinventing the wheel.
* Different types of enterprises have different security needs and build priorities accordingly. Both internal and external pressures drive things forward.
* Your role shapes your perspective — just do your job well. Lifelong learning is your own responsibility, not the company's. If you can learn from work, great. If not, no big deal.
* Language and communication are actually an important soft skill. Choose your skill points deliberately and cultivate your skill tree — don't let it grow crooked.

# 0x04 Summary

In the evolution of enterprise and enterprise security, we spot problems, propose solutions, then run into new problems and propose new solutions. But the most important thing is the ability to rapidly learn about unknown or unfamiliar domains, identify problems, and come up with solutions. Whether you're in security management, security technology, or security operations — it's all a long-haul game. ☯️

**This post also took about two months to write. All articles on this site are original — please get my authorization before reposting.**

# References
* [TOGAF9](https://pubs.opengroup.org/architecture/togaf9-doc/arch/)
* [CIS Controls](https://www.cisecurity.org/controls/)
* [ITIL v4 Framework Overview](http://wallizard.com/eric/share/itil/02_ITIL4%E6%95%99%E6%9D%90/06_ITILv4%E6%A1%86%E6%9E%B6%E6%A6%82%E8%BF%B0_15%E9%A1%B5.pdf)
* [Deep Dive into Enterprise IaaS Architecture](https://www.infoq.cn/article/depth-analysis-of-enterprise-iaas-architecture)
* [Google Infrastructure Security Design Overview](https://cloud.google.com/security/infrastructure/design)
* [Architecture Knowledge Body](https://zhuanlan.zhihu.com/p/42830778)

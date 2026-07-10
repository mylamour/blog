---
layout: post
title: Architecture Discussion
categories: Security Architect
kerywords: high availability architecture design data security service reliability business-driven SRE DevOps
tags: Security Architecture
translated: true
---

# Intro

Lately I've been feeling stuck at a bottleneck. I wanted to vent, but then figured it wasn't worth it, so I didn't update the blog much. Instead I bought a few books to learn from and broaden my perspective. This post is mainly about high availability and infrastructure-related architecture. Some of it comes from summarizing *Ctrip Architecture in Practice*, and some comes from my own project experience. If anything's off, feel free to point it out.

![image](https://img.iami.xyz/images/171167622-2ad1250d-8b23-4803-8b7f-908da13edcae.png)

# Infrastructure

Having worked at companies of different scales, I really appreciate how much infrastructure affects product iteration, ops management, and security governance. Some people say standardization is a prerequisite for governance — but in big companies, things are always splitting and merging. Same goes for shared platforms and BUs.

* IAAS & PAAS (hybrid cloud / public cloud / private cloud) provide storage, compute, and network resources through resource pooling. The rise of cloud-native has also pushed the convergence of IAAS and PAAS.
* A unified access layer is genuinely great — too bad not everywhere has one. Done right, it handles end-to-end traffic scrubbing and gives users a convenient entry point. This kind of layered design also shows up in CAL and DAL. Once you have layers, you can attach different capabilities to each one — security features, for example.
* Monitoring platforms generally aim to be end-to-end and full-chain. The overall flow is: data collection → analysis → visualization → alerting. It's the foundation of any observability architecture.
* Large enterprises today move fast, which means tons of CI/CD. A good release platform needs to improve efficiency while also ensuring quality. (Yeah, obvious, but still.)
* In the big data era, a data platform is non-negotiable — covering data transport, storage, and processing, and feeding back into the business model to drive revenue. Security is obviously part of that too.

# Service Reliability

I first came across the concept of Site Reliability from [Google SRE](https://sre.google/sre-book/table-of-contents/), as a DevOps practice. It covers high availability, operability, maintainability, and pretty much everything from planning to release, and from monitoring to incident response.

## High Availability

Skipping the math on how website availability is calculated here.

* While ensuring business HA, you need to prioritize ops tooling HA first — otherwise when something breaks, you can't fix it in time. Priority order: fault recovery tools > monitoring tools > resource delivery tools (e.g. CRM platform) > code deployment tools.
* Common HA working modes: A/S (A/P); A/A; Cluster; LB. (Note: A = Active, S = Standby, P = Passive)
* In terms of principles, HA generally falls into three areas: capacity management, disaster management, and fault management. Capacity management covers capacity estimation, redundancy, rate limiting, scaling, and clustering. Disaster management typically follows the "two locations, three data centers" model — two DCs in the same city, one DC in a remote location. Cold/hot standby exists too, but it's not recommended. Fault management is usually handled at the application or system layer via degradation or circuit breaking — you preset conditions to contain the blast radius of anomalies, shut down non-critical features, and keep the core system running.
* From a layered architecture perspective, HA should cover everything — business layer, persistence layer, data layer, etc. The mindmap here just lists the more visible ones: network layer, application layer, data layer. DCs should also follow a unit-based architecture and achieve disaster recovery at the IDC level — which is what disaster management above refers to. On the data layer specifically: databases have modes like MGR, MHA, and PXC to maintain HA. M-M and MGR are essentially the A-A pattern.
* Scalability means you can quickly add compute resources to dynamically meet business growth. There are two main approaches: vertical and horizontal. In modern large-scale architectures, load balancing provides great scalability. See the reading notes below for details. ![image](https://img.iami.xyz/images/171173708-8afbe253-04ae-45cf-a6a1-0d66217f90ca.png)
* Not going to talk about security here — I've already written a bunch of blog posts on security architecture. I might add something later about security product design and privacy computing. One recent insight: if security can be built in from the very beginning of DC design all the way through IAAS and PAAS platform setup, it would do a much better job of fulfilling the Security by Origin design philosophy.
* Data sync needs HA, and HA also needs data sync. But per the CAP theorem, you can only pick two out of three. This section briefly covers some simple data sync scenarios — service discovery, cache sync, and cross-datacenter DB replication.

# Wrap-up

Whether it's external-facing services or internal ones, you should always start by understanding the characteristics of each business, then aim for high availability as much as possible. Beyond that, you also need to think about the tradeoffs between standardization, automation, and full-chain coverage.

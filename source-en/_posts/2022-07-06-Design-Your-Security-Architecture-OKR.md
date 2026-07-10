---
layout: post
title: Design Your Security Architecture OKR
categories: Security Architect
kerywords: data security application security infrastructure security security policy security technology security operations security platform enterprise security security governance OKR
tags: Security Architecture
translated: true
---

# 0x00 Intro

This one's a quick take on how to design OKRs for security architecture — and I mean architecture-level OKRs, not your personal workload OKRs. A security architect's personal OKR might be something like: solve a specific problem this quarter (platform design, policy rollout, operational metrics, etc.).


# 0x01 Security Architecture Goals

Let the diagram do the talking first. It's not hard to see it still comes down to three pillars: policy, technology, and operations. Yeah, same old framework — but honestly, not many companies actually have all three running properly.

![image](https://img.iami.xyz/images/177453812-35cbccde-a78a-404c-a7ce-08a4cd88844a.png)


## Object

1. Security capabilities as services
2. Security services as a platform
3. Security platform with intelligence built in

The goal is to push security capability into services, aggregate those services into a platform, and layer intelligence on top of that platform. Policy standardizes the foundational tech. The security platform consolidates technical capabilities. Operations drives continuous delivery. The specific work under policy, technology, and operations in the diagram is just an example — architects should tailor it to their company's actual situation.

> Note: When focusing on policy, you need to think about what technology actually supports that policy. When focusing on technology, you need to think about how that technology gets delivered and operated (service architecture), etc.

## Key Resources

* Policy lens: focus on value and threats, build standards and specs
* Technology lens: focus on services and delivery, build foundational capabilities
* Operations lens: focus on scenarios and quality, manage the full lifecycle (close the loop)


# 0x02 Architecture and Platform

![image](https://img.iami.xyz/images/177459465-5c150ba8-fd50-4b3a-affa-06056ba4db41.png)

A few things to keep in mind here:
1. Every governance domain needs policy, technology, and operations as support
2. Every governance domain needs architecture guidance, platform delivery, and operational services
3. Infrastructure security sets the floor for application security and data security
4. Architecture design sets the ceiling for the security platform and security operations

As infrastructure moves to the cloud and the variety of security services grows, a security platform naturally starts to take shape and gradually takes on more responsibilities. That said, org structure matters a lot here — think about how your company is actually designed based on the diagram above. Different org structures lead to different collaboration models. For example: security architecture centralizes requirements; a security platform team consolidates tools across domains, wraps certain capabilities into services for business teams to consume, and unifies those services into a platform that provides standardized infrastructure and system controls internally; security operations then handles external-facing services. Another model: each governance domain builds its own team, forming a virtual security architecture team that handles requirements and collaborates on delivery, then hands off to either centralized security ops or domain-specific ops.

Let's take data security architecture as an example. It mainly covers three areas (some places don't put IAM under data security, but whatever):

1. Cryptography: HSM, KMS, PKI, Crypto Agility, Encryption as service, Transparent encryption, cert management, etc.
2. Data Protection: DLP, EDR, Email Protection, Data Classification/Tagging/Privacy Platform, 3rd file sharing, etc.
3. Identity Access & Management: IDP, MFA, Hardware Key, Passwordless, BeyondCorp / Dev, etc.

Zoom into Cryptography specifically: data security experts need to define Crypto Control Policy — covering different algorithms, properties, and lifecycle rules. Then roll that policy out. Tech experts and architects work together to build a Crypto Infrastructure that meets architectural standards, and developers build out Self Service portals, Management Portals, etc. I've covered some of this in older posts so I won't go deep here. Same story for Data Protection: you need policies for data classification, data in transit, and DLP. While rolling out those standards, you build a data scanning platform that ingests from different data sources, tags various types of data, and provides privacy-computing capabilities — all to enforce security controls across the data lifecycle while also enabling data to flow more freely.

One more thing: OKRs should look different for architects, platform builders, and operators. For architects, the key metric is problem-solving capability — what capabilities are you actually delivering. Don't ask architects to hit adoption targets or coverage percentages for the platforms they designed. An architect can help onboard specific use cases, but pushing adoption across similar scenarios? That's an operations metric. Of course, this depends on what your management actually thinks and expects — ideal and reality don't always line up.

# 0x03 Wrap-up

OKR is well-trodden territory at this point. I remember writing something a long time ago about using OKRs for scrappy security architecture design. Back then I was a security engineer doing architecture work — usually scoped to specific tasks. Now I'm doing it as a security architect, and the view is necessarily broader. It's a real difference, and what I pay attention to has shifted. The most obvious change: I feel the importance of communication and emotional management a lot more acutely. My manager once shared a "pick two of three" framework with me — in a company, if you have any two of: industry experience, technical ability, and communication/management skills, you can do really well. Obviously you can also go deep on your strengths first, then shore up the gaps. Either way, going deep on any of these takes serious effort. Learning never stops — just keep stacking it up.

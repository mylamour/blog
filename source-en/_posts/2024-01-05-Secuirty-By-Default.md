---
layout: post
title:  What Are We Really Talking About When We Say Security by Default
categories: Security Architect
kerywords: security architecture security compliance network security application security data security secure design security by default
tags: Security Architecture
translated: true
---


Security by Default is a topic that gets brought up all the time. Today let's casually talk about what role Security by Default actually plays in security architecture design. To make things easier to follow, I'll cover it through the lens of network, application, and data — though in practice, you'd think in terms of specific scenarios: default security for hosts, email, storage, etc. Physical data centers add another layer — things like cabinet isolation for sensitive workloads, dedicated lines, individual cabinet locks — but I won't get into that here (mainly because I don't know enough about it).

# 1. Some Defaults in Design

Security by Default can be thought of as a process that goes from policy design all the way to tool implementation — and note that Security by Default is heavily dependent on tooling. At the design stage, you're laying out plans for network, application, and data. At that point it's really just a vision of what "secure by default" looks like. The actual capability only kicks in after you've convinced all the stakeholders to align and finished the implementation. Take networking as an example: say you've got DLP, Proxy, Firewall, WAF, IDS, and so on — now you need to figure out how to design Zone segmentation, what security controls apply to cross-Zone traffic, and what access rules to use. Once that's nailed down, you've got a baseline Security by Default for the network layer. **This frees security operations from manually tweaking firewall rules every time, frees employees from submitting tickets for every service request, and reduces the overhead of rule audits down the line.** Let's dig into each area.

## 1.1 Network

For networking, the first thing is to look at the business attributes of each Zone, then design security controls from there — it's a process that has to stay close to the business. Some questions worth thinking through: What security controls sit between the DMZ and HRZ? What about traffic from the Internet to the DMZ? Or from the DMZ out to the Internet? Once defaults are established, any exceptions should go through a ticketing process and follow change management. That said, sometimes you have to admit the reality: **even a well-designed system can become unrecognizable after enough "exceptional" operations pile up.**

A few more things I'd flag to consider during design, in order to achieve Security by Default:

* Applications are only allowed to live in Zones that match their business classification
* Data in higher-classification Zones cannot flow to lower-classification Zones — data should only flow toward higher classification
* The same Zone across different DCs should have the same security controls, but Zones aren't automatically interconnected by default
* Data flowing from production to office environments is only allowed to reach the Confidential zone
* By default, no firewall rules need to be opened between Zone A and Zone B — or alternatively, only specific ports (e.g. 21, 443) are allowed between Zone X and Zone Y
* All transport protocols default to TLS-enabled versions: HTTP → HTTPS, LDAP → LDAPS, etc.
* Internal traffic uses PKI-signed certificates by default; external traffic uses Public CA-signed certificates
* Internal and external access are fully separated — any service with both internal and external access needs separate endpoints
* All server access goes through a bastion host Zone only

## 1.2 Application

For applications, security capabilities are more commonly baked in through the SDLC to achieve Security by Default and automation. Whether it's the gating mechanism in architecture review (applications must go through CI/CD — and that call might not even be security's to make), or the baseline requirements for releases, these all implement Security by Default to some degree.

* Any new component introduced must be evaluated — unevaluated components are not allowed
* Use a unified dependency source and have it scanned
* Purchased systems deployed on-premise must swap in standardized internal components
* Integrate the appropriate security SDK across all client types
* CI/CD must include SCA, SAST, IAST, Docker image scanning (optionally extend left to local dev scanning, or right to scanning the final APK/APP package)
* Vulnerabilities in high-sensitivity applications must be remediated within X time
* Applications with condition Y are not allowed to go live
* High-sensitivity applications must pass code audit and penetration testing
* Sensitive application config must be stored in Vault
* Applications must verify their integrity at bootstrap
* Inter-application authentication uses certificates and mTLS
* Applications are not allowed to expose NodePorts directly — only through a load balancer or API Gateway
* Any web service deployed through CI/CD automatically gets network-layer security coverage (WAF, Anti-DDoS, etc.)

## 1.3 Data

Data is kind of a blind spot — the one thing sitting right under the lamp. On paper, there's a lot of attention on protecting data, but in practice, Security by Default for data tends to be the thing that gets overlooked. Most of the time, focus goes to application code scanning and network transport encryption. But the actual flow of data across classification levels often gets ignored. For example: data classified at X or above cannot leave its Zone, and can only be accessed under specific conditions.

* Data classified at X or above may not be stored
* Data classified at X or above may not be shared
* Local storage of certain classified data is prohibited (PC, USB drives, removable media, etc.)
* Data classified at X or above is encrypted by default and must use keys stored in an HSM
* Weak cryptographic algorithms are not allowed
* Data classified at X or above is only accessible under strict authorization
* Certificate and key generation must happen in a defined environment
* Certificate and key distribution must use approved tooling
* System logs must be integrated into a centralized log system

**Worth noting: in actual implementation, you don't work through data/application/network as separate tracks — you think in terms of specific systems and scenarios.** Take host security as an example: security tools are packaged into a standard image at build time, so the business teams never even know they're there. Things like EDR, HIDS, and certificate chains go into the server image; DLP, SASE, and UEM go into the laptop image. The moment an image becomes an instance, the default security protections spin up automatically. Or take application proxies — from the business side, it just looks like outbound traffic going through a proxy. In reality, inbound traffic has been through AV scanning and outbound traffic has been through DLP. Of course, it's not always completely invisible — sometimes you need to sync with the business team upfront about certain scenarios and make sure production security devices are configured before go-live.

# 2. Wrap-up

Throughout the discussion of Security by Default for applications and data, I kept saying "data classified at X" and "Y-type business" — that's intentional. **Security by Default for applications and data needs to be grounded in the actual business context. Different business attributes X and Y lead to different levels of security controls.** The design rules listed above are just a starting point from a design perspective; product selection, implementation, and operational details still need to be worked out. For instance, you need to push rules into tools like Firewalls, HIDS, and SAST. Also important: **security devices and security operations engineers themselves need to be included in the existing defense framework — don't leave security itself unsecured.** If you audit business logs, audit security logs too. If you separate permissions for business systems, separate permissions for security systems too. **When doing actual design work, always keep in mind: stay close to the business, serve the business (not your colleagues).**

In reality, all those preset rules and constraints are what form Security by Default. Without them, every interaction would require its own ad-hoc verification — which is essentially Zero (No) Trust. And it's not hard to see that Security by Default is about making security invisible, reducing its friction with the business. It's a space-for-time trade: lay the defensive infrastructure in advance so the business can iterate faster. Shift Left, on the other hand, is a time-for-space trade: get security involved earlier so risks can be resolved before go-live, leaving more room to react when threats show up. The difference between blocking a vulnerability through WAF rules at runtime versus fixing it properly through code audit is huge.

Think about it: why did the concept of Security by Default come first, then Security by Design (wouldn't a good Design be what enables Security by Default?), and then Shift Left? Because Default at runtime turns out to be less effective than getting it right at the Architecture and CI/CD stages. Also, for SaaS services where the runtime is controlled by the vendor, evaluation and gating are really the only levers at review time — and Security by Default there seems like something only the SaaS vendor can control. So what can Security by Default actually do in that context? Worth thinking through what else an organization can do to achieve Security by Default for SaaS — I'll write about that when I get a chance.

// Woke up the morning of Jan 6th and revised this — I was way too tired last night, nearly fell asleep writing it.

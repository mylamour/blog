---
layout: post
title:  Summary of Network and Cloud Security Architecture Design
description: "Field notes on network and cloud security architecture: segmentation, perimeter design, traffic control, and fixing bad designs along the way."
categories: Security Architect
kerywords: security architecture security compliance cloud migration network security cloud security Alibaba Cloud AWS network security application security data security security design secure by default
tags: Security Architecture
translated: true
---


# 0x00 Intro

Most of my time has been spent looking at security issues directly on the cloud, so going through a cloud migration design gave me some new thoughts worth writing down. Some of what's here is experience, some is stuff that goes without saying — but I ended up saying it anyway because I ran into some truly bad designs and had to explain why the right way is, in fact, right.

This post breaks cloud security design into five parts:
* Network and Access
* Identity and Authentication
* Data and Storage
* Application and Deployment
* Detection and Response

I'll start from the migration process itself, then move to solutions on the cloud, and wrap up with a summary.

# 0x01 Going to the Cloud: Be Bold About Subtraction

Some companies go to the cloud to cut costs and improve efficiency. Some go back to on-prem for the same reason. Startups tend to go fully cloud-native; large enterprises often build private clouds. My boss mentioned one company that bought an entire AWS private deployment — serious money. I've been through the experience of a full cloud migration push, seen individual AWS accounts with monthly bills in the millions of dollars, even seen someone drop a screenshot in the ops chat of a monthly bill north of ten million. Before cloud migration, most small and medium businesses had their own data centers — self-built or collocated. But I've noticed that even a project as disruptive as cloud migration can end up being mostly cosmetic.

I can't always judge the right moment to migrate. But let me describe what I've observed. **The initial design is usually solid, but day-to-day operations gradually break all the rules until things are a mess.** When I talked with the network director, I found the original network architecture was genuinely standard — aligned with industry best practices. From a network perspective: Border-Leaf from edge to core. From a business perspective: external-facing zone, business zone, dev zone, management zone, and so on. Separate switches and firewalls for isolation, separate racks, physical redundancy — the whole deal. I don't know networking as deeply as he does, but for a financial industry design, this was textbook. Then daily operations kicked in. Process lapses, ad-hoc exceptions, "innovative requirements" driven by business-first thinking. The result: office systems landed in the business zone, some remote management functions ended up in the business zone, and the dev zone went semi-autonomous. Beyond the logic mess, this created chaos in security zone definitions — the same zone got repeatedly sub-divided for different business lines. Of course, given the "robustness" requirements of financial systems, and the classic **"it still works though"** attitude, the status quo just... persisted. Pushing through a cloud migration in that context takes real courage. Whether it'll actually succeed is still an open question. And my own understanding of system stability is completely different from traditional finance's: **I think a stable system isn't one that never changes — it's one that adapts well to change and stays stable through it.** For example, rotating a certificate is just a routine config management task; at an internet company or internet-finance firm it's a simple change. But at a traditional financial institution, it gets buried under invented concerns and verification theater. They call it "protecting system stability and transaction integrity." I call it **"calcified thinking."**

The same goes for cloud migration in financial enterprises — the technical challenges are actually secondary. Regulators are vague: they won't actively say no, but they won't nod either. Business teams don't really care whether IT keeps up with the business; the "it still works" mindset means policy and workaround cancel each other out, never mind user experience. Especially after an initial review of the existing DC security design, optimism becomes hard to maintain. At that point I finally understood what the CTO meant: **"We're not going from 0 to 1 here — we need to go from -1 to 0 first."** And I started quietly wondering: "Maybe cloud migration is just two negatives making a positive?"

## 1. Cut and Replace

Apparently, back in the company's glory days, they tried out all kinds of "cutting-edge" security products. Bought and deployed various EDR and NDR solutions, but in practice there was no real operation — no effective use. The boss said last year's budget was already locked in, and the vendors kept saying the product could do so much more if only you'd use it like this or that. My bigger takeaway: **pick good products first, then make those products work well.** Financial companies copied the three-tier model from customer service for security operations — Layer 1 handles and responds, Layer 3 researches and analyzes — but also absorbed the traditional outsourcing mentality. Nine out of ten Layer 1 employees are contractors, sometimes all ten. A solid tiered structure means nothing without technical capability and a real platform; you can't run meaningful operations on process alone. There's no knowledge accumulation, you're simultaneously trying to manage vendors and contractors, and Layer 2 is constantly firefighting while Layer 1 closes tickets. I don't know why so many people with consulting backgrounds at enterprises prefer this model, or maybe everyone's just trapped inside the traditional finance ops framework. Either way: useless, and bad.

Faced with so many ineffective products and ineffective operations, the SOC prototype design required aggressive cutting. **Remove useless products, consolidate duplicates** — for example, cut some AV and HIDS products and fold them into EDR; drop standalone WAF and anti-DDoS and fold them into a CDN product; drop AD Proxy and the old CA and build a Private PKI instead; replace Proxy and VPN with SASE; avoid calling HSM or KMS directly for encryption/decryption and use EaaS-style services instead.

The reason I haven't mentioned **using the latest products** is that we're also facing a localization mandate. The potential in localization products is huge, but the user experience is absolutely terrible. **How can something that never changes stay ahead of the curve?**

## 2. Unify the Approach

Another hallmark of financial enterprises is **business-line-driven isolation**. For example, a product line governed by a specific regulatory policy needs separate isolation at the dedicated line, network, storage, server, and rack levels. That means higher build costs and higher operating costs. Security has picked up the same habit: DMZ facing the internet, DMZ facing third parties, DMZ facing partner institutions; IAM for internal users, IAM for vendors, IAM for test environments; Splunk for audit, Splunk for SOC, and so on. On top of that: test environments exposed to the public internet, internal domain names used for external services, internet-facing services just thrown into the DMZ. **Blind trust in isolation creates all kinds of exceptions in operations**, and thinking gradually calcifies around perimeter security — **"isolation is enough to be secure!! IP whitelists ARE security!! (wrong answer)**"

Cloud migration is an opportunity to fix what's broken — standardizing systems and unifying solutions. As I've mentioned in previous posts: standardize HA, access, ports, protocols, and log monitoring across systems; standardize internal/external access control, domain resolution, DNS servers, etc. Only by standardizing systems first can you standardize architectures, and only then can you actually achieve a unified approach. For example, consolidate DMZs into a unified ingress — and don't assume a dedicated line using HTTP is inherently more secure than a public API over HTTPS. For everything except special business isolation requirements, use logical network-level isolation; physical and logical network isolation won't stop application-layer attacks. There's no need to physically isolate networks to prevent application-layer attacks — what you actually need is better detection and response capability. For encryption-as-a-service calls, PKCS11 vs. REST API doesn't matter much — both require careful attention to auth and permissions when accessing key indices. All externally exposed services should go through a proxy, not be thrown directly into the DMZ. Proxy product types are well-defined and get timely vulnerability updates; business products sitting in the DMZ can't effectively reduce attack surface. And then there's unified key management, log collection, bastion host management, and more — the list goes on.

This process also involves product selection. Whether you use the CSP's own security products or deploy third-party ones, the design goal should be architectural stability and operational simplicity. Don't mix different products for the same solution — a "unified approach" built from mismatched products is fake. Aim to cover all three levels: **product selection, business scenario, and system architecture**. Take key management as an example: you need one EaaS product that can provide encryption/decryption services both on-cloud and on-prem while keeping root keys secure. Supporting diversity sounds nice in theory, but nobody in practice wants to maintain Alibaba Cloud KMS for cloud, Cyberark for DC, and Hashicorp Vault because the K8S team picked it for their service. Better to deploy one product across multiple regions and serve different endpoints from it. Same logic for server CLI access — you don't need Alibaba Cloud's operation security center for that while also running both Qizhi bastion host and Cyberark in the DC. SaaS product procurement for business teams should also account for multi-cloud and hybrid cloud operational scenarios.

I'm listing all these issues not to complain about the status quo, but to think about how to improve the experience by finding and solving problems. I've never thought admitting failure is shameful, but ideals are always far from reality. Whether it's "business first" or "security is everyone's responsibility" — these ideas mostly stay at the level of slogans and lip service. Real improvement requires trust and honesty from everyone involved (maybe someday I'll come to terms with the fact that what's actually needed is financial incentives).

# 0x02 On the Cloud: Avoid Absolutes

When it comes to cloud migration and cloud solutions, nothing is absolute. If every architect involved is locked into "it must be A" or "it must be B," the resulting cloud design will be a total mess on top of a mess. Design requires balance; architecture is decision-making. Incompetence is fine — what's not fine is incompetence that won't take feedback.

* No single cloud is best (AWS and Azure international versions are both solid, but the policy-mandated versions — 21Vianet and Sinnet-operated clouds — won't be anyone's first choice)
* No single solution is mandatory (LB in front of or behind WAF, or using a CDN with anti-DDoS and WAF built in — all acceptable; VPN or SASE — both work)
* Nothing is absolutely secure (IP whitelists and dedicated lines on one extreme, defense in depth on the other — neither extreme guarantees absolute security)

![img](https://img.iami.xyz/images/overview-of-netowrk-and-cloud-security-architecture-xmind.png)

I turned the five areas from the intro into a mind map, and from here I'll walk through an imagined cloud migration scenario:
* Migrate the office systems out of the DC business zone
* Isolate business systems into internal and external segments
* Move part of the production environment to the cloud

## 1. Platform and Access

**Network and identity are the foundation for accessing data and applications.** I've split this into two parts: the network (path) and identity during access, and the applications and data within the platform.

For infrastructure design, start with basic isolation principles. On the logical level: domain names, certificates, endpoints, resolution. On the physical level: switches, routers, rack servers, etc.

![img](https://img.iami.xyz/images/network-and-cloud-security/go-to-cloud.png)

After the isolation-based design, enumerate your security zones and the security controls applicable to each — anti-DDoS, WAF, firewall, traffic analysis, etc. For multi-tenant cloud deployments, every VPC created under a production account can be treated as an HRZ zone. If you're on a single cloud account, map each VPC to a security zone based on business division, and deploy security controls between zones — for example, use cloud-native firewalls between VPCs for inter-VPC access control, and security groups on elastic network interfaces for instance-level access control. You'll also need to define default inter-zone access rules including protocols and ports, establishing default security levels between zones. **Low-trust zones can push data to high-trust zones, but two zones at the same trust level should not have default open access to each other.** For example, HRZ zones in Region A and Region B should not have default open access between them; data sync should happen at the DB layer.

![img](https://img.iami.xyz/images/network-and-cloud-security/security-control-between-zone.png)

This is just a simplified zone list — you'll need to design your own zones based on your actual requirements and implement the corresponding isolation. Then think about access from the control plane to the data plane: SASE-type products can deploy agents locally to split endpoint traffic to the internet, and from remote work environments provide separated access to cloud console and other purchased SaaS products.

![img](https://img.iami.xyz/images/network-and-cloud-security/isolation-of-control-pane-and-data-pane.png)

Especially for business admin backends: avoid direct access from office zones as much as possible. At minimum, gate it through something like Cyberark or AVD. If you have the resources, design a zero trust architecture — use a policy engine and access engine to completely abstract away the actual backend services from users. Beyond user-to-service zero trust, there's also service-to-service zero trust. For microservices, the most common pattern is K8S + Istio: proxies and certificates handle service-to-service authorization.

Everything above is about network and cloud security design. For hosts and applications specifically, my experience is that there's not much difference from a traditional DC setup. Even for networking, the changes mostly come from product selection and design philosophy rather than fundamental differences.

## 2. Design and Operations

All these so-called designs fall apart without operations once they land. Some contradictions show up even before anything is deployed. **Design determines how you operate, but in reality your operational capability shapes your design.** For example, **how do you build DevSecOps if you don't even have DevOps?** How do you talk about data-driven operations without standardized systems? There's a lot more to say but I've been writing this post for two months and I'm tired — I'll leave the rest for another time.

I've also started experiencing what I'd call "four wheels spinning wildly across the prairie" — 21Vianet-operated M365 doesn't support SSO, can only be configured with OAuth Client ID/Secret, and after configuration the app redirects to the global `.com` site for authentication. Completely incoherent. This kind of operational problem exists because the architecture design phase failed to fully identify operational risks upfront.

## 3. Alibaba Cloud Example

Here's a quick example using Alibaba Cloud: I put together a setup with DCDN (which actually got blocked because the domain wasn't ICP-registered) → GTM → SLB across four availability zones in two regions, with WAF 3.0 enabled on the SLBs. The SLBs act as ingress for ACK and route external traffic. Everything in the dashed box on the left is externally exposed: GTM splits business traffic, SLB exposes services, API Gateway splits application traffic — nothing else is directly exposed. During the POC phase, access to ECS instances was restricted to the office network segment only. It's a pretty standard POC, though we ran into quite a few issues during actual deployment.

![img](https://img.iami.xyz/images/network-and-cloud-security/aliyun-security-poc-allinone.png)

Using a CSP's own security products on the cloud is convenient, but the operational overhead is still very high. And you shouldn't validate the outcome just by testing the security products themselves — you need to deploy the actual minimum viable infrastructure with real workloads and test against that. To give a quick rundown of the Alibaba Cloud security product experience: Cloud Security Center is called a "Center" but the tenant experience is more like a money-eating beast. You'd forgive it if it actually centrally managed all cloud security products, but in reality DNS security is in the cloud DNS product, TLS policy config is in the SLB product, and if you want all security products writing to the same SLS, you need to plan out every logstore in advance. On top of that, enabling logging for most cloud products requires going in and manually enabling it product by product. The application security folks had additional complaints — and this is supposedly a leading cloud provider -_-# Meanwhile, in all our interactions, Alibaba Cloud employees were never prompt to respond and never once showed up to an online meeting on time. As the famous General MacArthur would say: "In front of Alibaba Cloud security, I'm just a new recruit."

# 0x03 Summary and Other Notes

In *Beautiful Architecture*, some veterans argue that architecture is a process, not a destination; others say architecture is all about balance. For traditional security architecture design, the philosophy has been shifting — from perimeter to defense in depth, from isolation to zero trust. As cloud platforms provide elastic scale, security architecture design needs to lean into cloud-native characteristics to replace or unify security controls. There are no absolutes here, only what fits and what doesn't. And on the journey from -1 to 0, organizational inertia and financial network resistance create far more friction than any technical problem.

If you run into a colleague who says "Totally Wrong" every other sentence (former Tencent Cloud pre-sales architect, who single-handedly lowered my opinion of Tencent Cloud): try to keep your distance. Ask them to compare two approaches and you'll get back "which company have you seen do it that way?"; explain a security implementation and you'll hear "you're talking concepts, I'm talking principles." Sometimes they'll flip it entirely: stop asking me questions, you answer mine. No sense of professional boundaries, no real security knowledge, but desperate to seem more expert than the actual security experts.

Read. Learn. Practice. Reflect. And still hate dealing with idiots. Stay away from idiots. Stay away from misery.

Recently finished *The Invisible VISA: The Mixed-Order Organization for the Future* — highly recommend it. I picked it up to understand the business side of things, but ended up finding it a very accurate description of the constraints that traditional finance operates under. Even decades later, the industry hasn't changed much. I'll write up some notes on it later. Keep pushing forward.

---
layout: post
title: Data Security Architecture Summary and Case Studies
categories: Security Architect
kerywords: Security Architecture Enterprise Security Security Design Security Governance Data Security
tags: Security Architecture
translated: true
---

> Written on June 19th, published on June 25th

# 0x00 Overview

I've written a few articles about data security before, feel free to check out my previous blog posts if you're interested. This article puts together a mind map, but I won't dive deep into data classification and grading, nor will I talk about security projects like full-site TLS, or how to build KMS, PKI, etc. The focus is more on the overall connections.

![img](https://img.iami.xyz/images/data+security+in+action.png)


Simply put, **we use policies and standards to support technical implementation, then through regular security training and audits we check the actual operational status**. Security training and corporate security culture may seem abstract, but they become critically important once your foundational infrastructure reaches a certain level. Because awareness is often the first line of defense, sometimes even more important than tools. You need to keep in mind what data can be transmitted where, what data cannot be stored where. Always stay vigilant about external input information.

Data classification and grading is the first step in data governance (data governance is a topic that's complex in theory and even more complex in practice). Of course, considering different businesses, products, and infrastructure, different companies approach this differently. It might fall on the data team, the risk control team, the internal control team, or a collaboration (the standard way for data governance, but make sure you distinguish the responsibilities of different teams from the start). In reality, **the cost for security teams to push classification and grading implementation is far higher than you'd imagine, while producing classification and grading policies might be more appropriate**. By constraining different levels of data throughout their lifecycle, we ensure data security. But the common protection techniques are far from being just data security techniques. In architecture design, besides encryption, tokenization, and masking, you also need to consider identity authentication and authorization, network access control, logging, monitoring, and auditing. In other words, you need to build on top of the security controls of the infrastructure. Only after you've properly divided different security zones and established network isolation can you place data of the corresponding level into the corresponding areas. Restricted access to PCI storage and control zones versus unrestricted PCI storage and control access are different. As for within the corresponding zones, application services and admin backends have different access methods, identity authentication requirements, transmission requirements, etc. Additionally, you need corresponding standards for client-side data storage.



Let's take a quick look at the overall data security architecture design for office networks and production networks below.

# 0x01 Data Security Architecture

## 0x01 Office Network Data Security Architecture Design

I originally wanted to show how to transition from the existing architecture to the target architecture. But then I thought, every company's situation is different, so it's better to just briefly touch on a few key points.

![img](https://img.iami.xyz/images/office+data+sec+arch.png)

1. Separate service and control plane
This borrows terminology from microservices, but it's pretty straightforward - separate resource creation and resource usage. For example, AWS Console is the control plane, where you create service resources. However, this division isn't absolute. In AWS EKS, access to EKS belongs to the control plane, while access to SVC belongs to service resources. The principle followed is SOD and least privilege. Ensure that unnecessary permissions don't flow out.
2. Tiered control of access terminals
Office terminals in an enterprise usually include laptops, phones, and virtual desktops like AVD, VDI, etc., generally called thin clients. For different levels of terminals, besides establishing standardized security controls, you still need tiered control. For example, mobile devices can access Services but not Portals, and some sensitive systems need to be behind laptops and Citrix. Similarly, it varies for different user groups - customer service terminals should never access Bastions, etc.
3. NACL
This is a fairly common topic, and I'll discuss it in the production network architecture diagram later. Let's talk about the office network first. Regarding network ACLs, protocols, and ports, I won't go into details. One thing to note is **NACL transfer failure caused by hierarchical dependencies** and the target system's support for NACL. For example, a certain Cloud Service is configured with SSO login, SSO has NACL restrictions on access IPs, but after successfully logging into the Wiki, because the system itself has no NACL configured, the Session remains valid and can bypass detection and directly export data, causing data leakage.
4. Conditional access, SSO, and privileged account management
**Different systems must use a unified IDP for login authentication and complete authorization. And be able to restrict login behavior through conditions like network location, authentication difficulty, etc., allowing login or not**. At the same time, manage privileged accounts separately. For example, after separating privileged accounts and regular accounts, combined with conditional access, only allow login when coming from a certain IP range on a trusted device after completing MFA. Beyond this, you also need corresponding logging and monitoring.
5. Detection and response
The operational model will be discussed later in the data-driven SOC security architecture section. Regarding detection, most office network data is unstructured and complex in type. After user permissions are reduced, account logins are restricted and can only access appropriate files and install necessary software, you still need to detect outbound data. On one hand, through information labels, set default control measures and urge users to manually adjust file levels. On the other hand, through DLP tools, detect at the endpoint and network layer. Beyond technical measures is assessment and training. Office network data security mainly focuses on terminal management and control. You can refer to my previous article [A Brief Discussion on Endpoint Security and DLP Governance](/end-user-computer-control-and-dlp/). As for providing services to end users, what belongs to the Corp side will be viewed from the Prod dimension later (note, not from the Corp/Site dimension).

## 0x02 Production Network Data Security Architecture Design

Compared to office networks, production network data is well-structured with fixed patterns. Data security governance for production networks is much easier than office networks.

![img](https://img.iami.xyz/images/prod+data+sec+arch.png)

1. Perimeter protection
Need to focus on access control and network isolation. External traffic coming through the perimeter needs traffic scrubbing, IDS, WAF, etc., perimeter isolation and control from office network to production network. Network isolation between different areas within the production network, etc. However, for NACL here, you need to consider both layer 4 and layer 7. Taking AWS EKS as an example, when setting security groups, if you use the AWS CNI plugin and use ENI, then when the IP bound to the ENI changes, it can be detected and automatically adjusted, so it doesn't affect POD-level security groups. But if you use Trunk mode, the security group can only work at the Node level. If you use K8S network policy, you need to ensure there's no layer 4 svc in the Pod, otherwise it can't solve the problem of security groups responding to IP changes.
2. Outbound audit
Actually also part of the perimeter, singled out separately because outbound traffic is heavily controlled. It's actually about consolidating data transmission channels, then opening up restricted secure channels, and only allowing fixed protocols, etc.
3. Keys and encryption
I've talked about this too much before, won't discuss it. **First, the value of keys equals the value of data, second, pay attention to the transmission of root trust**. Don't use self-created encryption algorithms. I've seen some "complex" self-created encryption algorithms, absolutely mind-boggling. I suggest using approved encryption algorithms, creating keys through root trust transmission. But you need to act within your means, considering budget, after all HSMs and public certificates aren't cheap.
4. Backup and recovery
From small things like database snapshots to large things like establishing DR centers, backup recovery is the last line of defense. Is backup achieved through synchronization or through snapshots? How to encrypt snapshots? Access control for backups? Who has permission to recover, integrity of backups, etc.
5. Detection and response
This part is placed in the SOC architecture, see below.

If you break down the inside of ServeMesh in detail, there's another separate architecture diagram, won't discuss it for now. Additionally, besides the data protection platform, you also need a data scanning platform, data dictionary, metadata query, and other tools.

## 0x03 Data-Driven SOC Security Architecture

The reason I'm pulling this part out separately is that data security incident operations can actually be merged into the SOC and made data-driven. Some details are hidden here, focusing on the SOC workflow. Data security incident detection and response is just one type, the principle is similar.

![img](https://img.iami.xyz/images/data+driven+soc+arch.png)

After purchased or self-developed systems or products complete standardized system capabilities, through operations in different scenarios and forming SOPs for specific tools, we cut into automated operations, and the execution of specific playbooks works on the corresponding systems. In this process, the first stage of operations is completed, and data-driven is based on this, collecting and processing various data for detection, etc., thus generating new alerts and events, and triggering corresponding SOPs. For the entire operational quality, visualization dashboards are the main focus. Alert false positive rate, deployment coverage rate, average response time, scenario triggering, etc.

I still have to complain, operations work isn't about rhetoric, beating around the bush. If your skills aren't good enough, you need to learn, you can't just bullshit. On the other hand, leaders without experience also can't effectively identify output quality.

There's another old topic, which is operations-technology-management. Doing something, especially operations (operations handles incidents, architecture designs, etc.) definitely requires demonstrating the combined effect of policy, process, and tools. You need policy support, standardized processes, and platform or tool implementation. Whether it's architecture design or security consulting, etc., everything must eventually enter the routine operations stage. Rogue methods are another story, those are too wild. For example, without policy constraints, how should logs work across clouds, can they or not?

Also, I often see people who can't distinguish between policies, standards, and processes. Here's a simple diagram I drew.
![img](https://img.iami.xyz/images/diff-policy-sop-guidline.png)

Also, when defining policies, you need to consider whether it's to land and adapt to the current situation, or to guide changes to the current situation. If it's just to adapt to the current situation, to have a certain policy in order to pass certain checks. Then it becomes, I already have certain things that meet standards / or don't meet standards, and then put these things in the document. When checking, we have this policy, it's just that the granularity of the policy isn't fine enough, so "we'll modify it later". Of course, more often you might just need to have this policy, no one even reads the content. The other kind is, using policy to support technical constraint implementation, even if the current infrastructure or applications don't comply, they'll transition in this direction later. This is a very important distinction. The former isn't completely meaningless, but this kind of periodic scrambling often can't change the current situation. (People who've supplemented various SOPs and policies before passing checks should understand what I mean.)

# 0x02 Data Security Architecture Case Studies

Selected some data security-related architecture design cases from the past year. Due to space limitations, I can't expand and analyze each one, just sharing. What details can you think of?

![img](https://img.iami.xyz/images/data+security+case.png)


# 0x03 Summary

From the above, you can see that these control measures don't just focus on data security technical measures, but also consider security training, log monitoring, etc. Additionally, considering the data lifecycle, you need to apply related technologies to different stages. And for technical bypasses, for example, for file deletion, is it wipe, purge, or destroy? Some people have thought that using Serverless can avoid vulnerabilities beyond the application layer, similarly that having MFA can avoid permission issues, that password complexity reaching a certain level is secure enough. But sometimes, are we thinking too simply? 

The basic IT environment within an enterprise can be divided into IDC (On-Prem), Cloud (Serverless, IAAS, PAAS, SAAS), and SAAS. In the process from IDC to Cloud to SAAS, there's less and less self-managed stuff ([you can check out this diagram](https://img.iami.xyz/images/on-prem-to-saas.png)). From another perspective, there might be more energy/resources invested in controlling data. But the reality is quite the opposite. In the process from IAAS to SAAS, enterprises have fewer and fewer data management tools, even though SAAS service providers are bound by GDPR, they still can't **provide complete data management functionality to customers**. Because when vendors provide SAAS services, although the underlying control behavior is shielded from users, the actual data is still stored in the Data Center. So if you need to open up this capability to customers, it brings very high costs. As the client side, you'd rather gain complete control over data, not just focus on data loss prevention. Only by gaining complete control can you handle problems related to data flow. I see most articles, when talking about data security, it's classification and grading, lifecycle management, and data loss prevention - three big topics. As for key encryption, architecture design, log monitoring, etc., are rarely mentioned in data security, and you can't ignore the importance of infrastructure just because it's abstracted away during cloud migration.

Interested students can read some of my previous articles about data security.
* [More on Data Security](/build-your-data-security-architecture/)
* [A Brief Discussion on Cryptographic Infrastructure](/applied-cryptography-and-crypto-infrastructure/)

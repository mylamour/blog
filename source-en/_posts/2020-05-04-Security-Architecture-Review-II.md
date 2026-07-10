---
layout: post
title: What is Security Architecture (Part II)
categories: Security Engineer
kerywords: Enterprise Security Internet Enterprise Security Architecture Review Security Architecture Fundamental Security Architecture Fundamental Security What is Security Architecture Part Two
tags: Security Architecture Fundamental Security
translated: true
---


# Preface

> Actually, it's been a while since the first article on security architecture /security-architecture-review/. The previous one mainly talked about the required capabilities from the perspective of a security architect's main responsibilities. However, our understanding always evolves with experience. Today I'll write a second piece on what security architecture is, again from a shallow perspective - focusing on specific solutions. You might have seen in a previous article that I explored a workflow for designing solutions. It may not be universally applicable, just sharing my experience.


# A New Perspective

![image](https://img.iami.xyz/images/80931431-61278680-8dec-11ea-9803-530780eab435.png)

Generally speaking, the structure of enterprise security teams basically follows this pattern (ignore the ugly diagram...). Personnel are divided into compliance, technical, and operations, with domains mainly focused on infrastructure security, application security, and data security. Of course, depending on organizational structure, team composition varies. Some divide teams by technical perspective into infrastructure security team, application security team, and data security team. Undeniably in recent years, security operations, trusted computing and other infrastructure-related matters have been consolidated into the infrastructure security team. Some organize by operational perspective, which depends on the maturity of internal security development. Few divide team structure by compliance perspective, though compliance work often involves the entire security team. Besides this, some enterprises directly divide by PDR timeline, establishing security technology team, security detection team, and security response team.

![image](https://img.iami.xyz/images/80931434-6389e080-8dec-11ea-97e3-a17d70531ff2.png)

Overall, it depends on the company's own situation assessment, technical needs, and personnel budget to divide the entire security organizational structure. Whether security reports to operations or operations reports to security, you need to remember that security and operations/development are not adversaries - different roles, collaborative work. As for conflicts and disputes, they also shouldn't hinder business development, but baseline policies (if baseline policies already exist, review/revise them by fiscal year; if not, collaborate with department heads to create version 1.0, escalate to technical committee or CTO/CSO for approval) are generally non-negotiable.

// Drawing this diagram is because security technical domains also have considerable overlap, especially on the client side. Also hope that technical people can think about operations work in technical domains from an operational perspective, and operations people can understand technical work in different domains. Additionally, whether infrastructure security, application security or data security, different enterprises have different layouts in different domains, which involves how to avoid attribution ambiguity when dividing, otherwise application security people think they should hold it, but infrastructure security people think you ate my cake. Meanwhile data security is thinking how they can't get involved.



# Solutions

In "What is Security Architecture: Part I" I mainly talked about the knowledge a security architect needs and briefly introduced solutions and architecture review. Actually overall, architecture review is also to output certain solutions. As for Deployment, Operation, Administration - who does what is another matter.

A small story. Before the New Year, a technical lead said his definition of architecture refers to choosing a certain framework within the enterprise for three to five years - like adopting SOA or microservices. Everything else doesn't count as architecture. Of course, different people have different understandings, big and small, no need to argue. Does doing application security architecture mean not considering network security architecture? Does doing data security architecture not combine network security and application architecture?

## Security Compliance

From my previous experience, technical people often don't consider compliance as the first step. And facing regulation, there seem to be many ways to get by (bastion host not powered, firewall not installed, etc.). But for business, pressure from regulation can weaken or destroy a company in a short time. A certain red book, a certain moment being taken down, a certain coin exchange exiting - behind it all is violating regulatory rules. Similarly for establishing data centers, compliance is indeed paramount. Especially information security in the financial industry has become an ecosystem - NetsUnion, ChinaPay, CFCA, BCTC etc all have their place. For financial enterprises, compliance can be said to be a lifeline, so here it's the First Line. But since my compliance experience isn't very rich, I'll briefly mention some points. (Not only compliance, but also company internal policies to ensure security) It's an & relationship. Compliance & compliance - one non-compliance out of 1-n will cause the "and" relationship to fail.

* Need to apply for corresponding qualifications (ISP dedicated line, website filing, payment license, bank dedicated line, etc.)
* Do purchased products have corresponding qualifications, like FIPS certification, national cryptography certification, ISO27K certification, etc.
* Do you have corresponding policies or processes that comply with regulations (scope and notification of user information collection, log collection audit policy, VPN, bastion host high availability and switching, disaster recovery center, data classification and grading, etc.)
* Do you need to pass relevant qualification certifications: UPDSS, PCI-DSS, etc.

Also, security audit is actually part of compliance. Different standards have made requirements for audits - audit records by role and time. Letting the compliance team also participate in certain technical matters, though this may just be a good idea, actual implementation needs consideration.

## Technical Security

This part includes not only technology but also technical operations. Technology determines defense quality, operations determine user experience. Security defense also depends on how you balance between HLD (High-Level Design) and LLD (Low-Level Design). One problem has different solutions, how to implement to meet different roles' needs?

One is security knowledge involved in different domains, another is different knowledge involved in security domains. For example, how you consider some security protection points when doing network architecture design belongs to the first kind; how you consider network issues when deploying security devices is the second kind. Bit convoluted, but it's actually domain intersection. In data center construction, from providing hosts to providing platforms to hosting applications, and process automation, monitoring, alerting - everything needs consideration.

### Dragon Body - Overall Design

Mainly focus on three parts: infrastructure security, application security and data security. Application security can refer to previous articles and won't be elaborated here. My views on data security haven't progressed much, but I'll briefly talk about it. The following thoughts mainly come from DC construction process, all are to throw out a brick to attract jade, so won't go into very detailed level.

#### Infrastructure Security  

Infrastructure security sounds very basic, but actually it's not basic at all. Needs a lot of experience to hold. Involves many aspects - network security, host security, cryptography, security operations, etc. Infrastructure security technology involves many points, but when doing security architecture, technology is often just one point. Not one technology can solve security threats. So here I'll introduce what corresponding functions security products representing corresponding technologies carry, and the pitfalls in the cooperation process. Previous experience in infrastructure security was mostly based on self-developed products and existing infrastructure - network, machines etc were ready-made, so there's quite a difference from current experience.

The design process can consider many principles. First you need to distinguish what these concepts are, how to use them, when to use them, what the impacts are, how to mitigate or solve them, whether the loss is acceptable to me. For example, not all enterprises adopt zero trust at the beginning of architecture design. Zero trust sounds like zero, but doing it is a chain - ensuring a trusted link. Build trusted terminal environment, achieve full communication encryption and service authentication between applications. All processes can achieve least privilege principle and Security By Default. Your office network infrastructure and production network infrastructure don't necessarily have to be together. As for whether to put in office or IDC is another matter. Different processes follow different policies.

How to go from high-level design to low-level design? Can policy formulation at infrastructure security level be recognized and implemented, what about organizational structure issues? The more fundamental something is, the more careful consideration it needs. Different working modes also have different resistance. Compared to previous cross-team communication within the company and cross-BU within the group, to now different teams and communication with integrators, suppliers, implementers, efficiency and methods are also different. Admittedly, as a former colleague said, in many external enterprises without corresponding value constraints, security is quite difficult. Fortunately, financial enterprises still value security quite highly.

<!-- 1.1. Infrastructure and Security Products -->

Security products have software and hardware differences, so deployment varies slightly. In infrastructure security protection, at least need to consider access mode, cabling method, disaster recovery strategy, operation strategy and other related parts. Each part has both HLD and LLD, can also string all HLD and LLD together separately. For example, WAF access mode - reverse proxy or transparent bridge, disaster recovery design etc are all HLD; which port, what cable, which connects to switch, which connects to F5 - this is LLD. Below briefly lists some considerations.

* Access mode (Need to consider a lot here. After all, how to deploy security products - software and hardware in intrusive or non-intrusive form into your infrastructure is both technical and experience-dependent. How to do HA, multi-active Active/Active or master-standby Active/Standby? How to do authentication, use password or certificate, what about MFA? Which machines and systems in DMZ? Management in MGMT, database in HRZ or HRZ-DB, or? Does it affect session passing on application? How many retries? Is security zone division referenced to business design? Which virtualization technology to use - VMware vSphere, OpenStack? Do physical machines have DLP, what OS version, what hardening, which packages to solidify? Do you need to embed Root CA? Where to place scanning system - open to all network segments or put one set in each zone? What about license and budget? How to build log collection system, did you consider data volume growth, what query optimization methods for ES/Splunk? How to audit when querying data?)
* Cabling method (Bypass, inline, purchase separate bypass switch device or use own switch, how many internal IP and external IP can one device have? Use fiber or network port? Can device's network port pass through when powered off, what about fiber? Do machines and switches both need bonding? Switch deployment mode, Active-Active dependencies and impacts on other devices, whether traffic transparently passes through bridge or mirror traffic. What about memory? And so on.)
* Disaster recovery strategy (Another set of network links or another set of cold standby machines? How to monitor to achieve automatic traffic switching? New disaster recovery center? Emergency startup process, how to execute? Business continuity guarantee policy?)
* Operation strategy (Is there audit process for sensitive data? Do you follow separation of duties principle? How to keep HSM's LMK? What about the security design of the safe itself? What means to ensure trust root node's trust? How much human resources divided for device maintenance, based on business or device? )
* Acceptance testing (Redundancy testing of network links, does security still need to participate in link redundancy apart from HA? Do corresponding functions of security devices regularly do attack verification? How to ensure infrastructure security in acceptance testing, any backdoors left? Clear various device accounts, physical machines, virtual machines, switches.)

<!-- 1.2  Connectivity and Access Control  -->

Besides this, should also focus on connectivity and access control related issues. Access control is generally done at network level, besides there's also port control and login control on hosts. Physically there's multi-level access cards, key+password, etc. But doesn't prevent you from using various concepts - threat modeling, 3A, Security By Default, etc. You can design security matrix rule to plan access rules for each zone corresponding to roles. Need to consider connectivity verification, connectivity between people-(device-application-data), under normal circumstances and "escape routes". Below briefly lists some questions to think about.

* Router link connection, redundancy testing?
* Does it have power-off pass-through function, is it necessary to redundantly create a separate line?
* Do you use ILO, out-of-band through network port or fiber port?
* How to divide security zones, how to divide network segments, large segments or small segments, does it conflict with your security zone design concept, need to integrate with business?
* How to connect to Internet? How to connect between DCs? How to connect corp? How many dedicated lines needed from different providers?
* Does DMZ still need Firewall (generally speaking, in financial industry or banks during inspection you might see this requirement)
* Can loadbalance directly replace FW, act as traffic entry? What about failover?

Of course need to see not only connectivity in network access, but also some logical ones, like user accessing data. Generally I'll consider based on some listed check items.

![image](https://img.iami.xyz/images/80916915-39093a80-8d8e-11ea-93d6-e5623010a3d3.png)


| Access            | Consideration 1           | Consideration 2                        | Consideration 3 |   
|-------------------|---------------------------|----------------------------------------|-----------------|
| Person-Device     | Permission (Access Control)| Audit (Behavior Control)              | ...             |   
| Device-Application| Function (Routing, Detection, Blocking)| Performance (Degradation/Circuit Breaking/Power-off Pass-through)| ...             |   
| Application-Data  | Business (Commercial Value)| Storage (Data Value)                   | ....            |   

//This section isn't very satisfying, slightly rough. Hope to supplement more completely in the future.

As for implementation part, need to at least clarify three parts (as much as possible): see through what needs to be done, see clearly what technology to use, see accurately what people to use. Doesn't necessarily need to be detailed, but need to do project management well. Progress tracking, problem feedback, appropriately push. How is the way of doing things, do people like to PUSH or be PUSHED, owner consciousness, ownership sounds like nonsense, but indeed easier to show when working. If the entire solution implementation is within BU or within the group, what's the process; if it's handed to third-party integrator or supplier, what's the process; the granularity and control of information sharing, etc. (I might be a very polite client)

#### Application Security

Pass, please refer to previous articles.

#### Data Security

Data security needs to run through people-infrastructure-application-data, considering the entire lifecycle. But in data center construction process, it appears more in policy form, constraining each control domain. Since I previously experienced DSMM training, most security views are also based on DSMM. But currently, considering data security also looks at three cycles separately, then synthesizes together. That is, considering from infrastructure, application full lifecycle, and data security three levels, putting them together can be called full lifecycle. Looking at it in reverse, data security cannot exist in isolation, needs to rely on different infrastructure and policies in each link to improve.

Data security at infrastructure layer I haven't had much exposure to before, especially production network infrastructure data security. But for office network terminal suites, I have some experience. Currently, encryption and decryption work design process combines with HSM, HSM itself combines with security policies, internal PKI system design and construction, whether production network and office network need two separate sets, server hardware DLP module, construction personnel account permission control, etc. How to better confirm trust root node's trust - actually many contents are mentioned in infrastructure security. As for application layer and data layer data security, temporarily no big changes. Maybe part of it is application layer experience mainly in pre-collection compliance and transmission during collection and storage use destruction after collection, etc. Some similar work done before might be data collection, table data cleaning, etc. Now it's more communication encryption, IAM design related. Data layer data security I've been exposed to relatively more in previous work, mostly appearing in forms like data classification and grading, labeling, desensitization, permission control, log audit, disaster recovery backup and detection and analysis. Now it's storage encryption and decryption. Overall, still have a lot of room for improvement. By the way, Meituan Emergency Security Response Center has an article on data security that's quite good.

###  Finishing Touch - Targeted Gap Filling

After the overall security architecture is built, according to the barrel's short board theory, details still need fixing. But this stage is more targeted and phased customization. For example, at this point you might need to consider email security solutions - certificates, encryption and decryption, DLP, proxy and authentication related solutions. Based on Corp and Site deployment locations, existing tools, etc., make targeted customization. This is basically an afterthought, won't introduce in detail for now.


# Afterword

I've said more than once that a good way to learn architecture is to look at major companies' online architectures. If you can't see the whole thing, look at one system's architecture. From system to product to business line, platform, middle platform, etc. Looking back at the first article, when talking about architecture it seemed high-level, but actually lacked some down-to-earth feel. However, it's precisely because predecessors blazed the trail that we can open up the forest. Undeniably, Alibaba has a deep treasure trove of knowledge. Standing on the shoulders of giants, naturally you can forget further. However, the advantages brought by the platform are precisely its defects. You walk on the main road but can't see the paving process. And precisely because of this, when you do it yourself, you may not be able to take care of all aspects. This time I was fortunate to participate in the data center construction process, only then did I know the hardship behind 0-1. Fortunately, the boss who hired me has another perspective on security. Although he doesn't specialize in security, he also very much agrees with full lifecycle security governance. Perhaps after a while looking back at this article, I'll find it superficial again. But whether superficial or not, organizing and recording gains at that time is a valuable thing.

Looking at it, again dragging and pulling, fixing and patching for 2 weeks 
<img width="149" alt="Screen Shot 2020-05-04 at 11 37 17 PM" src="https://img.iami.xyz/images/80984301-41ca4100-8e60-11ea-861b-e6a4f3e03936.png">


2020/11/07 update: This is the first article [What is Security Architecture](/security-architecture-review/)

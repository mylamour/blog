---
layout: post
title: What is Security Architecture
categories: Security Engineer
kerywords: Enterprise Security Internet Enterprise Security Architecture Review Security Architecture Application Security Architecture Application Security What is Security Architecture
tags: Security Architecture
translated: true
---

# Preface

> As time goes by, perspectives on things tend to shift. Looking back at some thoughts and details from previous security architecture reviews and comparing them with my current thinking, I've gained some new insights. Recording them here for readers.

# Architecture Fundamentals

You might find the stuff listed below a bit abstract, but based on experience, a competent security architect really does need these capabilities. Of course, this doesn't mean you need to have all this knowledge from day one. But if the security architect you meet doesn't have this knowledge and shows no desire to learn it, chances are they won't be a qualified security architect. Of course, this is just one person's opinion, take it as reference. If you disagree, feel free to email and discuss.

## Professional Related

* Basic software engineering knowledge, such as agile development, software development lifecycle, etc.;
* Basic architecture knowledge, such as: SOLID principles, component-based architecture, microservices, SOA, etc.;
* Senior-level basic security knowledge and risk identification capabilities, such as: network security risk identification and solutions, SDL solutions, etc.;
* Proficient in relevant product knowledge involved in basic security, such as: WAF, HIDS solutions and implementations, etc.;
* Senior-level secure development knowledge, such as: OWASP TOP10 hardening implementation in specific programming languages;
> Security architects should ideally also have the ability to lead teams in developing security tools, though this may not be critical depending on specific enterprise needs.

## Enterprise Related

* Internal R&D system processes, such as: language stack, release cycle, deployment system, base libraries, middleware, etc.;
* Internal infrastructure deployment, such as: network planning, server locations, cloud VPC partitioning, etc.;
* Internal organizational structure, such as: X-side R&D leaders, project managers, product owners, etc.;

# Security Architecture

## Solutions

Solutions focus on many aspects, from assessment to design, implementation, and operations. I won't introduce the complete solution design process here, just talk about the technical areas of focus when security architecture outputs solutions.

Architecture is a big layer. Apart from architectural design principles, security architecture itself relies on application architecture, network architecture, and business architecture. This means at least three layers need consideration: infrastructure, applications, and business. Specifically, it's basically the interactions involved when users access business through applications on top of infrastructure. This application could be a web app, PC app, or mobile app (generally one application externally, but actually composed of several applications internally). Security architecture needs to focus on the security within both ends and between the two ends. Common focus areas include:

* Business interaction flow, which is basically looking at what functions and data are provided, and what logic provides them. For example, from the business level, looking at whether sensitive data is involved, whether the involved data has been processed, etc.;
* Applications and middleware - applications and middleware are the concrete embodiment of the entire business, and are also the focus of application security and data security, from secure development training to security SDK packages, from code white-box scanning to release checks, how data production is provided to applications, how it's consumed by applications, how to implement corresponding access control, etc.;
* Basic network architecture - how a request reaches the service from the client, and which routes services go through to complete. This might be a problem - note that the network architecture diagram in the review document given to you by the software architect might only be part of what they know, and more often, they don't seem to care;
* Physical deployment situation - IDC or cloud, blade servers or ECS? If cloud, is it IaaS, PaaS, or SaaS? Different deployment forms have different focus points. Also need to consider specific ACLs, VPC partitioning, network planning, security product locations, etc.;
* Global stability - whether SOPs are established and can be followed, gray release mechanisms, rollback mechanisms, etc., to ensure damage scope can be minimized and problems quickly recovered when errors occur. Besides, need to consider the SLA of security products themselves, and how many milliseconds of latency adding security products adds to the entire chain, whether it's acceptable, etc.;

Actually these all focus on the surface level. Each part, in addition to common considerations, needs to be combined with the enterprise's own situation, depending on the R&D system and operations system.

## Architecture Review

When talking about security architecture, we inevitably have to mention another main output of security architects: architecture review. So what we need to know first is: what's the significance of security architecture review? The most original purpose might be to **identify potential threats in the early project stage and propose corresponding solutions**. What else? On another front, it can also be seen as enhancing the security team's influence. Of course, only high-quality output can increase influence and voice. Normally it's just brushing up presence. The issue of scholars looking down on each other has existed since ancient times. Even at the architect level, colleagues from frontend/backend domains, network domain, database domain, and security domain might also appear to be "arrogant". Of course, many times it might also be because the security architects participating in architecture reviews can't hit the key points, lack a global perspective and some of the preparatory knowledge mentioned earlier, making the security department even harder to be recognized by other architects. Of course, security architects themselves also have part of the problem - the focus points during review are too random and lack structure, or they don't know the business characteristics and haven't fully understood in advance, so communication lacks targeted questions and such.

From an SDL perspective, if there are problems with architecture review, it means the first step of SDL wasn't done well. After knowing what architecture review is for, one more thing to remember is that although implementation may not be achieved at this stage, it must be raised during the architecture review stage. So how to make the project architecture develop in the expected direction? How to output better? Let's look at the HOW part according to the WHY, WHAT, HOW steps:

1. Do design domain risk checks based on PRD documents, and threat modeling for large projects
2. Output secure development and security testing related knowledge to development and testing colleagues respectively
3. Confirm during architecture review meetings and output solutions or mitigation measures
4. Introduce related security products that can be provided in continuous deployment form
5. Close-loop verification for output solutions, tracking implementation and vulnerability situations

Compared to architects, security architects focus more on the security domain. Of course, this doesn't mean basic architecture knowledge isn't needed. When doing architecture reviews, the most original and direct way to understand the business is through the corresponding architecture diagrams in PRD documents (note the difference between business-provided architecture diagrams and global architecture diagrams):

* Business domain diagram
* System dependency diagram
* Data flow diagram
* Physical deployment diagram

Through the above architecture diagrams, you can directly understand business logic, physical deployment, data flow direction, etc. Skilled security architects can even directly spot corresponding problem points. But to achieve the so-called know yourself and your enemy, win every battle, still depends on experience from stepping on mines. (For example, if the business logic architecture uses Alibaba Cloud ODPS service for access control, it seems secure, but it's easy to overlook whether data has been tagged. If not tagged, this data flow access control relying on ODPS has certain defects.) **After understanding the overall architecture, the threat modeling step should first decompose the application, discover external dependencies, find entry points, analyze what assets the service uses, the resulting attack surface, analyze corresponding data flows, etc.** (You're really a talent, talking like a textbook). Of course this is just theory, you still need to refer to design domains and related checklists. Analyze threats from system functions, system deployment, system dependencies, etc. Threat modeling has traditionally used STRIDE, so I won't introduce it much. So how to prioritize threats? You can specifically refer to Microsoft's proposed DREAD.

![image](https://img.iami.xyz/images/69245770-6f893980-0be2-11ea-8b6c-b1738106e538.png)

But even if you can truly follow specifications and establish review mechanisms, in large companies, architecture review work can still be quite heavy. Business iteration changes very fast, with several architecture reviews every week. How to improve efficiency?

<!-- 
If you want to improve efficiency, first need to see what the output points are. For example:
* Pre-project architecture review (risk identification)
* Pre-development security training (secure development for R&D department, security testing for QA department, special governance for disaster areas)
* Pre and post-release security product continuous deployment (can be fully automated, WAF, HIDS, black/white box scanning, database auditing, etc.)
* Post-launch vulnerability operations (SRC operations) -->

**First automate what can be automated, such as security product deployment and black/white box scanning. Second, transfer capabilities that can't be automated - spread related capabilities to testing and development departments, making them security-aware. Let developers understand how to use security packages and have secure coding abilities, while letting testing departments have some basic penetration testing capabilities. Finally, distill knowledge bases and case libraries (stepping-on-mines checklists) from capabilities that can neither be automated nor transferred. This is the first big step. The second big step is tracking results and establishing positive feedback based on results to drive or push other teams to keep moving forward.**

Of course, there are some details not written, and related architecture review forms not posted. So how can you be considered a qualified security architect? I believe you have your own answer in your heart. And when you have this perspective, many things aren't that difficult to do yourself.

# Summary

Security architecture isn't achieved overnight, and enterprises can't rely solely on penetration testing to improve security defense construction. While keeping up with technical progress, you also need to accurately distinguish whether something is hype or bandwagoning. As an important role in enterprise security departments, security architects need continuous learning while having corresponding capabilities. Hope there will be more qualified security architects among security industry practitioners in the future. As a youngster in the security industry, there's still much to learn. Along the way, thanks.
Late night, putting down the pen.

2020/11/09 update: [What is Security Architecture Part II](/Security-Architecture-Review-II/)

<!-- # References
* "Clean Architecture"
* "Application Software Security Code Review Guide" -->

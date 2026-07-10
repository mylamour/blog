---
layout: post
title: What is Security Architecture Part III
categories: Security Engineer
keywords: Enterprise Security Internet Enterprise Security Architecture Review Security Architecture Data Security Architecture Data Security What is Security Architecture Part III
tags: Security Architecture Data Security
translated: true
---


# Preface

In the last few days of 2020, I finally managed to complete this article. With some tweaking and patching, I'll briefly share my understanding of data security architecture from recent work. Hope it's useful. The following will be divided into three parts: the fundamental infrastructure of data security, operational management, and product self-development. Some scenarios in the article are limited by my own experience and may vary slightly across industries, but the principles are roughly the same.


# Fundamental Infrastructure of Data Security

In most cases, folks working on data security may not actually participate in building the fundamental infrastructure of data security, but instead focus more on operations and service delivery. For example, providing relevant consulting services and handling internal and external customer requirements. The deployment and maintenance of data security-related equipment/software is mostly still maintained by basic security folks. For newcomers, this can easily lead to a "point" rather than "surface" misunderstanding. They can only see the related services they're handling, thus ignoring the bigger picture. They even ignore the lifecycle chain of handling business. Understanding the business is essential to better serve the business. In the fundamental infrastructure of data security, at least three points should be focused on: **first is the formulation of processes and policies, second is the maintenance of tools and equipment, and third is the provision of corresponding services (consulting, operations, etc.)**. All three should have a framework to constrain them, allowing them to run like a Playbook.

So in the fundamental infrastructure of data security, you should pay attention to both policies and the product and service delivery parts. This is also the first thing you need to do—understand the business architecture. Because data security is more closely aligned with business, you need to know where what services are provided, what kind of supervision services need to be subject to, whether the existing design can meet regulatory requirements, and so on. So without a deep understanding of the business, you can't do data security well. Secondly, from an organizational architecture perspective, you need to establish collaborative process specifications, such as the process for obtaining production data, where the only way comes from (does the entry point need to be consolidated?). Let's say only the compliance department can retrieve data, then even if the legal department needs the corresponding data, it also needs approval from the compliance department. And all operational processes should have corresponding approval records. From a technical architecture perspective, build corresponding solutions: how to store data, where to store it, how to transmit it, whether static data has implemented encryption (DARE), whether permissions are controlled, whether the tools used meet corresponding standards, etc. These are all problems that need to be solved at the technical architecture level.

Below I'll briefly introduce related work content from different perspectives. Looking at different perspectives, the content involved in the security process is scattered, which might seem confusing at first glance, but in fact this way of thinking will make security work more complete. For example, the process of obtaining a digital certificate from China UnionPay. From a business perspective, as an access institution, you need to use certificates for identity authentication, which only requires providing corresponding administrative processes (written application, stamping, etc.). But how to set the certificate recipient, how to handle the recipient's information, how to meet the environmental security of obtaining the certificate, how to ensure the process of obtaining the certificate can be audited, and how to ensure safe storage after obtaining the certificate? Are these also within the business scope? In addition, from an application perspective, it's just providing that certificate to the application for invocation. In this process, you actually need to consider the basic infrastructure, multi-active, disaster recovery data centers, deployment under different virtualization technologies, whether there's pre-reading, etc. And returning to the data itself, it's how to handle a key pair of level xx, where the public key can be distributed arbitrarily, but the private key can only be read by the application in memory. So how to avoid illegal reading, permission control, and protection of the private key, etc., all return to the data itself.

## Business Perspective

// Just using a single example to illustrate some things involved in data security from a business perspective.

![image](https://img.iami.xyz/images/103196520-4e376880-491f-11eb-8fa3-60556afd9fa5.png)

From a business perspective, more attention is paid to processes and compliance. Whether domestically or abroad, compliance can basically be said to be the lifeline of enterprises. Just from the financial payment business, the partners involved include NetsUnion Clearing Corporation (NUCC), China UnionPay (CUP), National Internet Finance Association (NIFAC), and Payment & Clearing Association of China (PCAC). In addition, whether it's the central government or local governments, there are corresponding policy and strategy requirements. Central-level ones include the People's Bank of China (PBOC), China Finance Association (CFA), and the Ministry of Public Security. Local ones include PBOC's Beijing office, Shanghai office, and Shanghai's Pudong Financial Services Office. As a role in the four-party (user = cardholder, offline/online merchants, issuing institution, acquiring institution) model, it's inevitable to deal with these departments. Of course, more often it's the legal department that conducts the liaison and communicates corresponding policies. But the actual security compliance can only be completed through cooperation with the technology center. Whether it's CFA's payment license certification for payment business, or access to UnionPay's UPDSS certification, or the more general Multi-Level Protection Scheme (MIPS) certification, as well as some network police temporary inspections, or the new No. X order issued by the central bank, all are unavoidable workloads.

From a business perspective, data classification and grading and data movement (including transmission) are particularly important here (because most of the time, business parties focus on whether the solution is "available", but don't care whether the implementation behind it is "feasible". The most common is focusing on how to obtain data, rather than how data is stored). So who does the data classification and grading—the legal department? Or the security compliance department? And how to design process-based constraints and behavior audits to meet the security requirements of the data movement process? Simple examples: How to securely provide cardholder facial recognition information to some departments for identity verification? How to obtain digital certificates from access institutions through processes? How to regularly synchronize political figures' information (already public)? How to verify the personal information of complaining users? How to extract users' bills within a certain period? Commercial cryptography requirements, IPv6 network transformation, etc. All require combing through existing businesses, not only including production businesses, but also businesses provided externally by the security department.

## Application Perspective

The big trend is moving toward cloud native, and some peers have also proposed the concept of security facets corresponding to service mesh. Applications and services are the most direct manifestation of business, with code carrying business processes and IT infrastructure storing business data. Simply put, users initiate requests and applications respond. But actual applications may be deployed in different data centers and different security domains. Different services under different applications are also making calls. I drew a simple diagram to show the data flow from an application perspective.

![image](https://img.iami.xyz/images/101589426-58063400-3a23-11eb-97bb-1a08f96b9b47.png)

From an application perspective, within the application lifecycle, authentication and encryption/decryption are crucial. Full-link TLS is needed not only from client to application, but also for encrypted transmission between services. How to design CA, how to use certificates, what policies need to be clarified, the transmission process needs to support corresponding TLS Cipher Suite, Version, Algorithms, etc. And which ones need to enable national cryptography algorithms. Apart from business applications, basic services such as APM, Logging data, etc., how should they be stored? These services that serve services (Services that provide basic services for applications), have they themselves implemented the same security level requirements? Can ACL policies for interactions between different Zones follow the principle of minimization? Does the encryption and decryption service have permission control? If we go back to SDLC, are there possible privilege escalation (or other) vulnerabilities that decrypt corresponding encrypted data in the application? Has the source code leaked to public hosting websites? Will there be "traps" for scanning server whitelists? Back to production, how much malicious traffic is being cleaned, whether it's Layer 4 or Layer 7. Of course, these seem to have deviated from data security, but actually not. As mentioned earlier, they are all interdependent. Can relevant risk control data be supplemented during traffic cleaning? Can the updated feed source be polluted? And so on, the list is endless.

So when focusing on applications, you also need to focus on the infrastructure that carries the applications, as well as network traffic cleaning, and the application's own code. It's not that piling up equipment or buying services can solve the problem.

## Data Perspective

After talking about the application perspective and business perspective, we finally return to the data itself. The most fundamental and direct way to handle things from a data perspective is to provide secure storage (encryption and decryption) for different types of data while ensuring data consistency during transfer under auditable authorization. Of course, you can skip this sentence and look at DSMM and the like. The reason DSMM is only mentioned now is that the DSMM model itself lacks framework constraints at the business and application levels. Of course, deeper should still be reading and practice. For a simple example, in data security work, user data involved appears not only in traffic but also in logs and databases. In different locations, when is the data in plaintext, and when is it encrypted? What scenarios retrieve what data all need to be done according to corresponding policies and constraints. In addition, while considering data levels and data categories, you also need to consider whether this data can be obtained/opened here, whether it can be stored. For example, whether cardholder data can be stored locally, whether it can go abroad, etc., all need to be considered. After security controls for static data encryption, dynamic data classification scanning, and corresponding permission management, another necessary measure is to audit all behaviors. And all audit logs, whether database audits or DAL layer, or common operation logs for different devices, should all be pushed to a centralized log cluster. Hot and cold separation, computing and analysis. Also in this process, what scenarios require desensitization of sensitive data?

<!-- Target scope: logs, databases
Encryption of files, audio and video encryption, password encryption, cardholder encryption.
Static data encryption
Dynamic data scanning
Behavior audit
Permission management
Encrypted storage
Database audit
Behavior audit, bastion host -->

From a data perspective, you still need to return to the data itself, enrich data attributes, focus on data flow, and corresponding process systems. After talking about the fundamental infrastructure of data security, we can see how to do corresponding operational management on the infrastructure.

# Operational Management of Data Security

After doing well in basic governance in terms of operation and maintenance deployment and product operational management, the most important thing is the operational part of providing external services. Generally speaking, system construction is inseparable from standard formulation and specialized services. And most of the time, providing technical operations occupies the bulk of the work. But looking closely, it can be divided into three categories: one is technical consulting, one is compliance auditing, and the last category of specialized services is technical operations. As for standard formulation, it's often done by managers, though there are also many cases of front-line engineers writing and then getting approval level by level. (It's best to have a specialized manager or senior technical expert in charge)

![image](https://img.iami.xyz/images/103217098-b8b5cc00-4952-11eb-86c8-b5f2fb1a8144.png)


1 Policy
As far as policy is concerned, it's actually a process of policy-standard-process-guideline. Policy tells you why, standards tell you what, processes tell you how, and guidelines are step by step.

2 Collaboration
Collaboration is crucial. Originally, I pulled it out and put it into policy processes. But later I thought that these agreements don't seem to have clear process regulations. For example, standardizing unified interface teams and contact persons.

3 Consulting
Consulting is a complicated job that tests self-control. Just like in operational work, you inevitably encounter some silly questions. Should we vent or sulk? Obviously not necessary. This also greatly tests the psychology of those in support roles who provide consulting and Q&A services. The compliance auditing mentioned in the specialized services below actually has a large part that is consulting work. But many enterprises won't set up a separate role for this service alone.

4 Specialized Services
Specific basic work that can be done can refer to a previous article I wrote [Talk about Data Security](/talk-about-data-security/). Of course, this article doesn't list everything either. Below I'll just give a couple of simple examples. (Since each item needs systematic basic operation and maintenance log collection monitoring, etc., it's not listed below for now)

* Crypto/Secret - Algorithm selection consulting / Key lifecycle management (add, supplement, delete)
* PKI —— CA/RA - Certificate application Q&A consulting / Certificate lifecycle management
* IAM —— AD/SSO/MFA - SSO access Q&A consulting / Account lifecycle management
* Log/Audit/Analysis - ...
* DLP - ...
* AVScan - ... 
* Data Movement - ...
* Compliance Audit

One thing worth mentioning is that service operations provided externally involving data security work need to have retained approval processes and corresponding audit logs. At the same time, before completing corresponding operations, you need to ensure whether the solution behind it is feasible. However, in the operational stage, technical architects have often already confirmed this. For a simple example, there's an approved data movement request. If it's the first time encountering it, you need to check whether the technical architecture behind it allows corresponding actions, why move it, where to move it, and the data level of the movement. Otherwise, just process permission is not acceptable. Assuming the data obtained is highly sensitive and is not allowed to be stored or obtained on certain devices, then the original plan needs to be adjusted.

# Product Self-Development for Data Security

In the enterprise security maturity model, very few enterprises can develop to the stage of security product self-development, let alone data security products. Those that can be named are also few and far between. Since I've only written some small tools and haven't participated in developing engineering-level enterprise security products, I'll only elaborate based on some observed experiences. In the process of data security product self-development, or rather in the process of security product self-development, the vast majority is to solve the adaptability problem of internal enterprise scenarios. These products have similar functions to commercial products but can adapt to scenarios. For example, take KMS—external KMS may not integrate well into existing infrastructure and can't make self-owned scaffolding code build quickly. Or HSM—if you don't have money to buy HSM, then Softhsm becomes an option, cooperating with TPM to integrate self-owned encryption services. Or encryption as a service, combining HSM for root key management, KMS for key management, providing encryption services for application services, or database audit services, log analysis, etc. Or internal self-service services, such as self-service certificate applications, data classification and grading tools. A key issue here is engineering. Many times security engineers can provide prototype code, but most is not engineering code that can't provide products with both performance and functionality. Of course, this isn't absolute—there are still many excellent engineers who can complete it on their own. But wouldn't mutual cooperation be better?

In enterprises, many times when self-developing security products, you must provide enough persuasiveness. Otherwise, the boss will think I've already spent 20 million buying products, why do you need to recruit security R&D engineers? And articulating the value of security upward, from what I've learned about the current situation, is by no means easy.

# Afterword

Unlike the high risk of basic security and the high threat of application security, the characteristics of data security itself are more inclined toward high value. This also means that data security engineers need to invest more energy, but this work absolutely can't be completed in isolation. It must unite security engineers from other directions to work together and operate continuously.

Whenever you encounter a bottleneck, tell yourself that beyond the bottleneck there are new technical horizons. Keep learning!

I've written three articles about security architecture, briefly discussing application security architecture, basic security architecture, and data security architecture respectively:
* [What is Security Architecture Part I](/security-architecture-review/)
* [What is Security Architecture Part II](/security-architecture-review-ii/)
* [What is Security Architecture Part III](/security-architecture-review-iii/)



The goal I set for myself in 2020 was health and to avoid impatience. Why not set a goal for 2021 too—exercise and avoid anger.

This article has been dragging on for over a month. Alright, that's it for now.
![image](https://img.iami.xyz/images/103219192-fcf79b00-4957-11eb-863f-ecf840011745.png)

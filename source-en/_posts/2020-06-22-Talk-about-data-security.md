---
layout: post
title: A Brief Talk on Data Security
categories: Security Engineer
kerywords: Enterprise Security Internet Enterprise Security Data Security Security Architecture
tags: Security Architecture Data Security
translated: true
---


# Preface

> About a year ago, I wanted to learn more about data security, and later participated in the DSMM Phase IV training. Got a decent overview of data security, though still lacking in many details. Of course, gotta mention Alibaba's generous resources and support for this kind of training. Even though I went through the training, I didn't actually participate much in data security work afterward (even though data security itself can be scattered across various stages). Anyway, now I've had the chance to do some minor data security work, and wanted to share my thoughts.
Before writing this, I re-read Meituan's article several times - [Building a Data Security System for Internet Companies](https://tech.meituan.com/2018/05/24/data-security-system-construction.html). This article gave me a lot of perspectives. Though next time I ask the author, they'll probably say this is from a long time ago and things have changed a lot. Hard to catch up with that level.

# Data Security

Data security control heavily depends on management support. Common strategies include separation of three powers, document auditing, two-factor authentication, access control, etc. After setting the strategy layer, implementation relies on institutional frameworks. Create explicit regulations, list specific details in institutional documents (or standard docs), form effective approval processes, use tools for control, and let people handle approvals. Also need to note the difference between privacy protection and data security. Privacy protection is part of achieving data security, but more often appears in compliance form. There's still a gap from the actual "data security" implementation. Following common categorization, let's briefly talk about everything from collection to destruction. Each section can be considered through the full lifecycle.

![Data Security Draft](https://img.iami.xyz/images/85988403-8833ba80-ba21-11ea-9ef0-35c853a9b682.png)

 
## Collection

Data collection without prior data - from outside in, business-focused, making it your own. Collection of existing data - host-level info, middleware logs, etc., primarily infrastructure-based collection.

* Device Unique Identification

Whether it's browser fingerprinting or device fingerprinting, both use various algorithms to calculate the same user behavior, all to discover uniqueness. One is in an environment you can control, the other you can't. For example, browser fingerprints are limited by browser engines, hard to read more hardware info. The other can read hardware info through embedded SDKs. Fundamentally, it's about finding invariance in variance. What information on the same host doesn't change - from software to hardware, collect the info, make algorithms to calculate or hash to identify unique devices. Beyond that, there's cross-browser fingerprinting - calculating webgl graphics rendering in different browsers, finding invariance (graphics computing power) in variance (browsers). Though cross-browser fingerprinting isn't very useful. On the flip side, data collection needed to calculate device unique identifiers needs attention to privacy protection and compliance.

* Account Security

For startups, one round of wool-pulling might kill the sheep. Accounts as user login credentials - when black/gray market controls massive zombie accounts to perform batch business operations, it causes huge business losses. How to identify risky behavior and risky accounts is extremely important for account security. Also note that any data security consideration can be reconsidered through the entire data lifecycle. Take accounts for example - what tier account (VIP, regular, SVIP), what info collected at registration, information classification level, whether compliance explanation needed, how to transmit, how to store, should data be encrypted, how to provide deletion and destruction interfaces, soft delete or physical destruction, whether requiring approval flow, etc.


* IAM

Accounts are entry credentials, permissions are keys to opening the safe. Access management is crucial, mainly targeting internal systems and infrastructure control. Users, permissions, roles - all mapped one-to-one. Also authentication methods, authentication protocols, open ports all need consideration, plus permission approval flows and audit management, etc. Access management can be said to be the top priority of Zero Trust. Let's try that full lifecycle thinking approach mentioned earlier - doing IAM, what data does IAM have? What level? How to transmit? How to store? When providing authentication, how to set firewall rules? Use SSO or LDAP, should Corp and Site be separated, how to sync data? Is there a unified ACL system?


* Trusted Computing

What I'm talking about here should be applications of trusted computing. Basic security constitutes a trusted computing environment, especially cryptography-related. For office terminals, devices bound to certificates. So even if you get employee username and password, you still can't log in - only terminals with pre-installed certificates can access. Mobile terminals do similar restrictions. For convenient mobile work, can use generic virtual entry points, most with read-only policies. Similarly, major companies pre-install lots of security protection software on employee terminals to build trusted environments. AV, DLP, EDR, etc. Of course, not sure if anti-debugging and anti-reverse engineering for business user side counts as trusted environment - they also have one device one certificate. Or maybe my understanding is off - is trusted computing about achieving a trusted environment?


* Anti-Crawling

Whether it's black/gray market, competitors, or regulators, getting first-hand data has inexpressible value. How to prevent batch fast data acquisition through public interfaces is a crucial step. Full-chain anti-crawling is very difficult - through trusted SDKs on the client side collecting relevant info, getting unique identifiers, network layer proxy identification, indicator statistical analysis, combined with threat intelligence and account security to do it, while fitting specific scenarios to do rate limiter, captcha, deny, etc., and how to subsequently achieve platformization, how to control granularity to API level, etc., all gradually develops. Compared to previous work experience, an obvious difference is before we only collected corresponding business requirements when doing anti-crawling for specific businesses, then opened corresponding defense rules, gray-scale launch. But now the action is moved forward - before app launch, have business give expected rate limiter threshold, configure policies for specific APIs, and enable observation mode. Also refer to previous summary [Breaking Out of Anti-Crawling Difficulties](/Anti-Spider/)

## Transmission

* Full-Site TLS

Including encrypted communication for internal and external systems, not just business but management platforms, audit systems, and encryption for inter-business system calls. For example, grpc calls using TLS protocol. But also need to note two things - one is watch for TLS version vulnerabilities, don't choose wrong. Two is certificate selection (algorithm support, which TLS suites does the server support?), generation, distribution, storage. Update mechanisms, etc. Of course, might even need to build offline CA, RA, and internally build multiple intermediate sub-CAs, or in other words issuer CAs. For internal systems like istio doing mTLS, no need to integrate the entire RA API, but make it a separate sub-CA. For more, refer to previous summary [Some Gains from CA/RA](/What-Hells-In-CA-And-RA/)

* Keyless CDN

Solves the problem of achieving origin encryption without needing private keys.

* DAL

Database Access Layer - basic function is to provide API services for DB access, while auditing database query operations. And shielding applications from database dependencies. Generally large enterprises self-develop this product. Back to the previous point, also need to note that application access to DB needs to support TLS.

## Storage

Data on disk should all be encrypted, so what needs attention is how to classify data levels. Completely public data doesn't need storage encryption. Storage encryption is divided into volume encryption, i.e., filesystem encryption. Next is file encryption - files dropped on volumes, PDFs, audio/video files, etc., sensitive data all need encryption. Also, more universally, encrypting data itself, like account info, user info, logs, etc. Of course, beyond this, physical storage security also needs key attention.

* Filesystem Encryption

Hard disk empty volume encryption, filesystem encryption - mostly see fuse encryption, for example Ceph now supports automatic disk encryption, but still experimental. PVC in k8s directly mounting Ceph, can it be single volume single key? Office system computers enabling encryption, like Mac enabling FileVault.

* File Encryption

Single file encryption, especially photos, or liveness authentication videos all need file-level encryption, but different file types have different encryption methods. PDF, Word have their own encryption methods, mp4, avi have corresponding encryption methods. Need to note that encryption and encoding/decoding are two different things. Hash algorithms are for making digests, not encryption algorithms. Encryption is also divided into symmetric and asymmetric. Asymmetric keys are generally issued in certificate form. Beyond this, PGP and PKI systems are different. Different application scenarios are also different. Host files, network files - talking about this, gotta mention doing unified antivirus gateways for uploaded files. Detect at both network layer and host layer. So is it batch encryption or real-time encryption?

* Keys

Keys are the foundation of all encryption. Don't really understand the principle of true random number generation, so in application the root key is still mainly HSM-based, hierarchical keys given to different businesses, establish unified algorithm usage standards, including strength, algorithm types. Plus considering domestic requirements for algorithms, especially national cryptographic algorithms in financial industry reform plans. Of course, key data synchronization and backup should all be key focuses. Meanwhile, KMS does key management, provides unified API interfaces, best if KMS can directly connect to HSM. Of course, domestic vendor package products still need improvement, poor user experience. Foreign products don't suit domestic conditions. Details can refer to previous record [Some Gains from KMS/HSM](/What-Hells-In-HSM/)  


* Safe

Safes and data center security both belong to physical security. Where to store root key backup data is crucial. Generally, keys need three people holding three segments, combined into one. Safes are generally key plus password or fingerprint plus password. If extremely important, the safe storing a single segment should also be managed by two people. So physical security access beyond this - monitoring, recording, institutional framework is even more crucial. But be careful not to let monitoring become useless.

## Exchange  

Data exchange steps are generally the easiest stage for leaks. Due to many scenarios, roughly divided into internal and external.

### Internal

* Bastion Host

Bastion host is undoubtedly the key to accessing servers. Accounts should be able to integrate with domain accounts, whether LDAP or SSO depends on the bastion host. Of course, from the above, also depends on how many AD domains you have. Meanwhile, data warehouse and operations should be separated. In production, ACL should also separate servers where data warehouse is located from normal business servers in different network segments. Like being in hrz, hrz_db, hrz_dw.


* R&D/Operations Separation

Internet companies don't seem to have explicit regulations requiring this, but it's very common in traditional banking. Some banks even set up special HVRs, deploy corresponding monitoring and recording devices to monitor R&D needing to access production networks. Under normal circumstances, R&D data is deployed online through operations. But in the internet industry, iteration is fast, and so-called flat structure can also cause certain emotional impacts.

### External

Simply divided into authorized, unauthorized, no authorization needed. Normally, for open platforms, between partners. For important partners, need dedicated lines, front-end machines. Specific people get specific certificates or keys. Open platforms are the easiest place for problems - open platform account governance and anti-crawling are also very important. As for preventing downstream caching, I hadn't thought of this before. According to previously learned experience, it's making non-standard environments standard, forcing SDK integration, moving into unified environment.

### Between Internal and External

Mainly focus on three areas: one is compliance - can data be exposed? Does it follow privacy statements, is authorization reviewed? Two is technical level - if not allowed, is DLP done? After DLP fails, are there visible and invisible watermarks for tracking? Is common data already desensitized, so even if transmitted out, impact is reduced? How to desensitize, how to anonymize? What are the requirements?


## Destruction

Software erasure and physical destruction. Similarly, after meeting destruction conditions, in a secure environment, generally in HVR, multiple people under monitoring and other means to operate, generally physical destruction. Of course, full disk encryption and key destruction is also a good method.

# Other

Some people write books with one theory after another. Really confident, right? Writing books is not something to muddle through.

When referencing previous materials, found many images can't load. I generally use gist as image host, probably all blocked. Network needs to be "normal" to display.

Whether viewing architecture from basic security angle or viewing data security architecture - data security is never isolated outside basic security, basic security also contains data security parts. It all sounds simple, but understanding two or three parts is already good. When you actually do it, it's all details. Don't say you understand it - saying you understand would be insulting.

Farmers have farmers' hardships, scholars have scholars' hardships. Temper and mentality are very important. Small temper, good mentality.

# Resources

* [DSMM Phase IV and My Data Security Perspective](/DSMM-Date-Security/)
* [Building a Data Security System for Internet Companies](https://tech.meituan.com/2018/05/24/data-security-system-construction.html)
* [From SDL to DevSecOps: Security Throughout the Development Lifecycle](https://www.freebuf.com/vuls/240074.html)
<!-- * [Ele.me MySQL Multi-Region Active-Active Bidirectional Data Replication Experience](https://dbaplus.cn/news-11-1399-1.html) -->
* [Google Infrastructure Security Design Overview](https://cloud.google.com/security/infrastructure/design/)
* [Some Gains from KMS/HSM](/What-Hells-In-HSM/)
* [Some Gains from CA/RA](/What-Hells-In-CA-And-RA/)
* [Some Gains from Bastion Host](/What-Hells-In-JumpServer/)
* [Breaking Out of Anti-Crawling Difficulties](/Anti-Spider/)
* [istio Security](https://istio.io/latest/docs/concepts/security/)

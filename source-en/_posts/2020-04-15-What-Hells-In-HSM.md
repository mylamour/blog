---
layout: post
title:  A Few Lessons Learned from KMS/HSM
categories: Security Engineer
kerywords:  Enterprise Security Internet Security
tags:  Security Operations Security Architecture Data Security
translated: true
---

HSMs aren't something you see much in internet companies — they're basically standard equipment in financial services. As a critical piece of the data security puzzle, they handle key storage, data encryption/decryption, and full lifecycle key management. That said, it's worth stepping back and asking: does data security actually depend more on policy and strategy than on the hardware itself?

For a few reasons I won't be sharing the architecture diagrams here. But I want to jot down some of the questions that came up — see if you've thought through all of these. Every data security problem should be grounded in a specific, concrete scenario.

Hardware/Software (Architecture, Networking, Cryptography)
* How does HSM interact with KMS? Are there situations where KMS can't reach the HSM?
* How do applications interact with HSM and KMS? Does every app need to talk directly to HSM or KMS?
* If there's middleware sitting between apps and KMS/HSM, what's the minimum information that middleware needs to store to do its job?
* What specific capabilities do you actually need from KMS and HSM? Does your KMS have a built-in HSM module, or are you running a separate HSM appliance?
* What management interfaces do HSM and KMS each support? How do you ensure the security of remote management?
* How do you reconcile China's national cryptography standards (国密局) with FIPS requirements?
* Can the LMK be exported? If you're manually entering LMKs, is it even possible to get consistent values across different vendors?
* What's the export mechanism for symmetric vs. asymmetric keys? How automated is that process?
* What does the access control model look like for exports and day-to-day operations?
* Does the medium storing admin login credentials store anything else?
* Is communication between middleware, HSM, and KMS encrypted and cert-authenticated? (Don't assume you can skip this just because everything's in your own IDC)
* Key distribution, import, and verification?
* How do you ensure data consistency across multiple HSM units? What sync operations are involved?
* CA systems — how do you securely get financial ecosystem certificates into the HSM? Is that even supported? (Think NUCC, CFCA, CUP, etc.)
* Do your connections to related systems need dedicated lines? How do you handle network access control, and does it affect your existing security policies?
* What are the performance and throughput characteristics of the current architecture?

(There's really no substitute for hands-on experience. Knowing something and having actually done it are completely different things. The process of building this out is painful, but you learn a ton. Here's hoping the path from deep knowledge to deep experience goes smoothly — wishing myself luck filling in the gaps.)

Policy and Physical Security
* Receiving policy: roles involved, verification process, documentation process, how to handle unexpected situations
* Rack-mounting policy: roles involved, verification process, documentation process
* Decommissioning and data destruction policy, verification process, documentation process
* Backup policy, maintenance policy, cold standby policy, custody policy, safes, etc.
* KSO role definitions, how to control various baselines, etc.


# Other Notes

You really do need solid PKI knowledge, basic cryptography fundamentals, and a good handle on relevant architecture design. Recently while translating the CISO interview series, JP Morgan's CISO made a point I hadn't fully considered — the ecosystem problem in financial services. Because of the extremely high security requirements and the deep interdependencies between institutions, there's inevitably a whole lot to think about beyond the systems themselves. I've been quiet for a while, so here are two posts to catch up. The data security architecture piece has been sitting in drafts for over a month — when am I actually going to write it?

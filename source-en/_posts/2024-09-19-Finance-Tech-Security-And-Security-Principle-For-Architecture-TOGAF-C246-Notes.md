---
layout: post
title:  Reflections on Security Architecture Design in Financial Services
categories: Security Architect
kerywords: Security Architecture Learning Summary Thoughts TOGAF Security Design Principles Architecture Finance Industry Internet Technology Traditional Financial Institutions TradFi FinTech Architecture Security CyberSecurity CISO
tags: Security Architecture
translated: true
---

My recent work has been pretty limited on the technical growth side, but eye-opening on the process side. It was my first time seeing how process gets used to paper over technical uncertainty. I went from reading about this stuff to actually watching it play out in real life — architecture design does need process to ensure downstream operations, but I'd never seen a shop that was *completely* dependent on process to hold things together. These bloated processes do deliver a kind of guarantee, but at massive cost in headcount and time. Granted, the cost math might actually favor people over tooling in some cases (¥1M in tools vs ¥1M in people over 2-3 years), but day-to-day operations under this model are almost completely un-automatable and you can't fix mistakes fast. So I don't think it's worth emulating — though reasonable people can disagree. My read is that this situation exists because financial services tech is just behind the times, and because traditional enterprise culture and internal politics make change very hard. Working in an environment where technology barely supports the business, I genuinely started doubting both the tech *and* myself (the greatest hits: "It still works, doesn't it?" "It was fine before!" "Follow the existing process!" "Why do we need to integrate XXX?" "Do you have an asset register?" "Don't try to apply internet industry thinking to finance"). I'm climbing out of that emotional hole now. As my boss puts it: "Keep learning — it never ends."

Once I accepted that this wasn't my fault, I started thinking seriously: can internet-era technology actually be transplanted into finance? Where exactly are the principles and boundaries in security architecture design? And when everyone keeps saying "serve the business," how do you keep that from becoming a blanket excuse? Around the same time, a project put me face-to-face with the arrogance and bureaucracy of various institutions — card issuers and acquirers alike. A narrow view, sure, but still worth writing up. Everything I'm describing here applies to TradFi institutions specifically — not FinTech.


# TradFi Technology: Questions Worth Asking

I remember a line in *The Illustrated CIO Guide* — one of the CIO's jobs is to make sure technology keeps pace with business development. Given how slowly business models in financial services actually change, and for a bunch of other reasons, nobody seems to sweat these technical questions. I'm listing them anyway (I've removed my own answers — some are yes, some no, and context matters a lot):

* When you're only connecting to a limited number of institutions (and the total universe is small), do you still need DNS?
* If you're on a dedicated leased line, can you just use HTTP and skip HTTPS?
* When does hardware-level isolation actually make sense? Is a dedicated leased line a necessary cost of doing business as an institution?
* If you have a leased line, can you get away with just a Firewall and drop the WAF?
* Once an institution is on a leased line, is it OK to hardcode IPs in the codebase?
* Do financial institutions actually need to build private cloud?
* Can financial institutions use public cloud? Is public cloud a true red line in finance?
* Financial institutions mostly pass data via HTML forms — is it worth switching to JSON or XML?
* Do financial institutions need systems with proper APIs? Is REST API worth it?
* For tokenization: some places apparently use sequential random-number increments, others use symmetric encryption — how do you choose?
* Finance dev is mostly Java — is it worth experimenting with Go, Node.js, Rust, etc.?
* Do financial institutions need modern databases (MySQL, PostgreSQL, NoSQL — anything other than DB2)?
* Traditional institutions use username/password plus certificates for auth, with cookies as session tokens. The internet world has largely moved to JWT — is JWT worth adopting?
* Do inter-system and inter-app calls within a financial institution need proper authorization?
* Financial institutions heavily use SFTP for file transfers — can that be replaced with HTTPS?
* Do institutional keys need rotation?
* Do financial institutions need real-time data warehouses?
* Once a real-time risk control system is live, do you still need a near-real-time one alongside it?
* Most financial institutions run monolithic apps — is microservices architecture worth it?
* Do financial institutions need CI/CD?
* Do financial institutions need containerization and Kubernetes?
* Do financial institutions need to support canary/gray traffic release?

After going through all this, I have a much better appreciation for why institutions want to shut down their systems as much as possible during HW (red team exercises). And it raises a new question: can solid process actually fill in for weak technology? Is the process actually solid? How does bloated, complex process compare to technical solutions? Do all those approval nodes actually get real scrutiny? In practice, the people who write the processes often don't have hands-on execution experience. The technical liaison contacts at institutions often aren't specialists. Processes frequently require multiple layers of approval — sometimes physical wet ink signatures. Technical operations mostly run on a vendor-supported model, and many shops can't even handle minor incidents on their own.

# Security Principles in Architecture Design

There's no shortage of security architecture principles — defense in depth, secure by default, zero trust, and more. But what about the security principles *within* the architecture design process itself? As a security architect, you need to know how to combine security principles and hold the line on design principles. I've read through Security Principles for Architecture (C246) a few times, and honestly it reads more like something written for enterprise architects (not security architects specifically) — which actually fits TOGAF's positioning. I'll try to summarize it from my notes anyway. (I've broken up the original and reorganized the C246 content — recommend reading C246 first.)

1. Vision: Enable the enterprise to achieve security agility through security design
2. Method: Balance productivity and security protection at design time
3. Strategy: Compliance-driven, risk management, third-party (3rd-Party) management
4. Approach: Validate security elements, establish security frameworks, design in depth, design for failure, validate security design, design for compromise, design for simplicity, automate process activities

By balancing Production and Protection at design time to achieve enterprise security agility, here are the C246 points I found most worth flagging:

* Architecture must be periodically evaluated and adapted to the latest security changes
* Security design and implementation should be periodically reviewed to identify whether it's drifting from its intended purpose (simplest example: regularly review firewall rules — old holes get exploited in new ways)
* Security design should be evaluated for unnecessary complexity
* Technical debt must be explicitly identified and incorporated into the enterprise's existing risk management process (never let tech debt disappear from the radar)
* Systems and assets must have an Owner, and that Owner must understand the risk and tech debt in what they own
* Systems must be configured securely by default (this is what "secure by default" actually means in practice)
* Systems must be explicitly protected — not just obscured (e.g., moving port 22 to 2222 is obscurity, not protection)
* Systems should be designed to be secure — not designed with the expectation that security gets bolted on later
* Systems must be able to handle internal failures and failures in other systems without compromising security controls
* Remediation plans must be in place to address control deficiencies
* When security and productivity conflict, choose business continuity
* IT evolution and security posture must stay aligned (same logic as keeping IT and business aligned)
* People and process problems that technology alone can't solve must be identified at the start of the design process
* Organizations must have sufficient security resources to support development teams — including training them, and assisting with architecture, design, and testing
* Organizations should bring in third parties for additional validation and testing where possible
* Organizations must plan and budget for incident response *before* incidents happen
* Organizations must consider and document potential system failure modes
* Organizations must pursue automation wherever possible
* Development and test teams must have security expertise
* Test cases must include security test cases
* Compliance and privacy expertise and requirements must be communicated to development teams
* Operational processes must explicitly specify how to handle sensitive data
* All teams must share security, productivity, and other goals (the accountability structure must ensure that all team members share security, productivity, and other goals — Microsoft has said something similar)
* All third-party solutions (including but not limited to IaaS, PaaS, SaaS) must have security controls imposed on them
* All networks should be treated as untrusted; all devices must be capable of maintaining security policy on untrusted networks
* Adopt asset-centric (Asset-Level) security protection rather than relying solely on network-based measures
* Internal systems must have access control policies to validate access requests
* So-called isolated networks are almost never truly isolated — cutting off external network access entirely is almost never achievable as a threat mitigation strategy
* Attack surface must be reduced to achieve protection and control of assets
* Use IPDRR to ensure the complete security lifecycle
* All security elements (products, tools, processes — including backup and recovery processes) must be validated through testing to confirm they actually work
* Keep the enterprise's internal security control framework updated in sync with industry frameworks

Here's the reorganized diagram. ![img](https://img.iami.xyz/images/c246-redraw.jpg)

Through all of this, we still need to ask ourselves:
1. How do you avoid over-engineering?
2. What does "balancing technology and cost" actually look like in practice?
3. When facing technical debt, where do you draw the compromise line?

Architecture design needs security principles. But financial institutions often don't actually want the security those principles produce — or the only security principle that matters is regulatory compliance and following the process.

# Some Real Failure Cases

* Using a dedicated leased line but communicating over HTTP at the same time; also using HTTP on internal networks
* Using SSO but passing the ticket in the URL
* Using certificates for authentication but not validating certificate expiry
* Using certificates for encryption, but a particular certificate only has signature verification capability flagged
* Using keys for security — and to ensure key security, requiring dedicated personnel to generate them. But not preventing a single person from holding all key components, stored in a TXT file
* Key rotation agreed upon in policy; in practice, rotation never happens before destruction for "stability" reasons
* Individual key destruction agreed upon in policy; HSM keys never get destroyed "for stability" — even unused ones
* Using a Chinese cryptographic algorithm (ShangMi) for HTTPS, but unable to automatically distinguish between SM2 and RSA CipherSuite traffic
* Using CAPTCHA to protect file downloads, but files can be downloaded directly by path
* Using tokens for authorization, but tokens never refresh — old tokens remain valid after new ones are created
* Using username/password for identity verification, but transmitting passwords in plaintext instead of verifying hashes
* Using IP-based access control for login; after login, session is active but the system no longer enforces the IP whitelist
* Using XXX system, but the effective policies in XXX system count is: zero

# Wrap-Up

To answer the title again: does financial services need security architecture design? Subjectively — desperately, yes. Objectively — it seems out of reach for now. Regulatory pressure will probably ensure roles like this exist, but whether they actually accomplish anything is another question entirely, and how much you can really do is something only you know. If security is the in-house vendor inside the client organization, red teams still get their moment in the sun. Operations that can do attribution, forensics, and incident response still have a real function. But architecture? Feels optional. It's that saying: if things go well, why do we need you? If things go badly, why do we need you?

Self-doubt in certain situations often isn't actually your fault — it's the environment. My emotional state didn't start to shift until I was reading documentation from AMEX Global, Visa, and Mastercard. Turns out not every institution's tech is this far behind, and not every liaison contact has this thick a skin. This job gave me my first career-level depression — about six months of it. I got through it thanks to my wife's support, my former boss's perspective, and my current boss's trust. Sometimes I wonder if he made a mistake hiring me. All I can say is: keep moving, appreciate what you have.

There's a particular kind of arrogance that invites your questions but never answers them. I've started to accept that sometimes there is no answer — but you still need to ask good questions.

On breaking through plateaus: I hit one recently. Less new technology to absorb, interpersonal complexity I don't want to engage with, less free time, less writing. I've realized you can't force your way through a plateau. The answer is to keep reading and observing good design work, accumulate slowly, and accept that slow is fast. One article I've been writing has already sent me down the rabbit hole of three business books — the more I write, the more I read, and the harder it is to put words down. Started in February, still going. Hoping to actually go deep on the business side and produce something worth reading.

On courage: In youth I led with hot blood and raw nerve. Now it takes deliberate effort and stubborn forward motion.

Closing with a poem often attributed to Plato — worth holding up as a mirror:

If sharp criticism disappears entirely,  
mild criticism will seem intolerable.  
If mild criticism is no longer permitted,  
silence will be seen as malicious.  
If silence is no longer allowed,  
insufficient enthusiasm for praise becomes a crime.  
If only one voice is permitted to exist,  
then  
the only voice that exists is a lie.  
— Plato

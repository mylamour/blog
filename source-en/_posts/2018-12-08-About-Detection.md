---
layout: post
title: A Survey of Computer Threat Detection
categories: Security Engineer
kerywords: machine learning intrusion detection webshell detection malware detection APT detection threat detection
tags: Intrusion Detection and Counter-Intrusion Security Operations
translated: true
---

# Foreword

The internet has evolved at a breakneck pace, with technologies stacking on top of each other layer by layer. From the room-sized machines that could barely crunch numbers to today's compact, high-performance desktop PCs — computer hardware really did follow Moore's Law to the letter. That raw computing power finally gave NLP, CV, and automation the fuel they needed to take off. Neural network architectures have been popping up left and right, and things are genuinely exciting.

But trailing right behind all this progress: computer security threats, multiplying just as fast, and not something you can afford to ignore.

This post looks at those threats and how we detect them, from a software/logical perspective rather than a physical hardware angle.

> Why write this? Two reasons: to review what I've learned, and because I couldn't find an article like this that tied everything together. Started drafting on December 8th, finished December 16th. Revised seven-plus times, but survey-style articles are genuinely hard to write well, and I'm sure there are gaps. If you spot something wrong or have a better take, please let me know.



# Computer Threat Detection

Computer threats can be split by source — internal vs. external — or by who's behind them — human vs. non-human. The classic threat modeling framework STRIDE breaks things into six categories. But offense and defense is a continuous back-and-forth: even if your defenses look solid right now, you can't measure how effective or how timely they really are by a snapshot in time. Attackers will always find a way around whatever defenders put up, so the whole point of threat defense is to *slow things down*, not to achieve some impossible "zero incidents" goal. The reason zero incidents is impossible: every new technology that patches old vulnerabilities inevitably introduces new ones. And even when the technology itself is fine, fuzzy business logic creates logic-level vulnerabilities — like password-reset flows with flawed logic.

Targeted attacks from different sources directly or indirectly cost companies their assets. Just on the data security side, attacks can lead to data theft, tampering, or abuse. And throughout the whole defense process, defenders have to keep tightening up their own systems — otherwise a breach doesn't just hit the immediate system, it cascades into dependent systems. I'll touch on this more in the architecture section: reducing coupling between systems to improve stability and limit blast radius.

As various concepts matured, a whole ecosystem of security products emerged. The most common: firewalls and IDS. And within IDS alone, you've got HIDS and NIDS. Firewalls come in software, hardware, and chip variants. WAFs, for example, handle SQLi detection, XSS detection, webshell detection, and so on. These standard detection mechanisms start defending at the application layer. But if something slips past the WAF (say, a flood of requests across WAF nodes faster than they can process), NIDS steps in for further analysis. A NIDS analyzer can classify network traffic and use pattern matching to catch things like URL obfuscation and DGA (Domain Generation Algorithm) attacks. Then when files hit disk, HIDS and antivirus software run their checks — AV can scan for viruses, malware, spyware, ransomware, trojans, worms, and more. Layer after layer of defense, which sounds pretty solid on paper. But in reality, attackers still get through. Why? Is it flaws in the design of the security products themselves, or in their implementation? Security products are software too — they have bugs.

More recently, API gateways have taken on some defensive duties as well, extending WAF-like functionality through plugins on top of their core routing features. Are there common threads running through all these detection mechanisms? Obviously yes. The rest of this post lays out a methodology for threat detection from a generalized perspective — one that applies even to special cases like APT detection.

# Methodology

Attackers pursue different tactics to reach their goals, and defenders need to find the common thread across those tactics. Facing a sprawling attack surface, the core idea behind detection is: *track enough records to surface attack behaviors tied to a specific entity*. This methodology covers three areas: how to collect enough records, how to identify a unique entity, and how to spot attack behavior.

## Log Collection

A key principle of defense-in-depth is log collection — analyze logs, defend from logs. The essentials of log collection come down to: broad coverage and detailed records. Classify logs by level (error, info, etc.) and make sure you're covering different layers (network layer, application layer, system layer — depth) as well as different business systems (breadth). Storage and retrieval matter too. The mature open-source option is the ELK stack; there are also solid commercial solutions like Splunk.

## Unique Identification

![img](https://img.iami.xyz/images/threatIntroduction/whoareu.png)

When analyzing an attacker entity, nailing down a unique identifier is critical. Without knowing *who* you're looking at, you can't distinguish attacker behavior from normal behavior, or assess the blast radius within your systems. You identify a unique entity by correlating attributes: browser fingerprint (cross-browser fingerprinting), device fingerprint, IP, wireless router ID, geolocation (lat/long), and so on. The point here is correlating data to arrive at a single unique entity — not the technical implementation details of how you capture any individual attribute. This process also involves handling massive volumes of data that a single machine can't handle, which is why distributed clusters are necessary for processing at scale.

## Threat Detection

<!-- Includes but is not limited to: webshell detection, XSS detection, DGA detection, SQL injection detection, etc. As a survey, the details aren't fully fleshed out here. Each of the three methods has its own weaknesses, and different combinations of methods within a given approach have different tradeoffs. Those tradeoffs are exactly what drives new approaches to emerge. Dynamic and static analysis are implementation techniques; the methods below are implementation-agnostic.
-->

After correlating and deduplicating entities across the full chain, you've got each entity's specific behaviors and attributes. Threat detection then means analyzing those behaviors and attributes to answer: is this entity's behavior an attack, and is this entity already on a threat list?

There are generally three detection methods: blocklists/allowlists, pattern matching, and computational models. The first two are fairly intuitive. Threat lists are maintained by aggregating feeds from various sources. Pattern matching typically involves outputting IOCs for matching, or regex matching run by a rules engine. The well-known pattern matching engine Yara even includes a numeric computation module (think pattern matching with logic) and a sandbox module, and you can write custom modules to scan memory blocks.

![img](https://img.iami.xyz/images/threatIntroduction/method.png)

Computational models are where machine learning has taken over — classification and clustering for the win. You've got anomaly detection algorithms, supervised classifiers trained on labeled data, and unsupervised clustering that creates new categories from unlabeled data. This is the hot approach of the last few years. As the mainstream rushes toward AI, the right mindset is: neither dismiss it nor drink the Kool-Aid. There are plenty of gotchas in the details. Webshell and XSS detection can be framed as text classification. Malware detection can use API call sequences and thread counts as features, or map binaries to "gene maps" and run image classification on them. The approaches vary widely and still need a lot of experimentation — but as knowledge transfer between disciplines, there's real practical value here.

For general threat detection, the methods above usually get the job done. APT (Advanced Persistent Threat) detection is another story — there's no reliably effective defense. The common saying is: if you can detect it, it's not really APT. That sounds like a paradox, but it doesn't mean APT is undetectable. With the right resources and a bit of luck, you *can* surface APT intrusions — it's just hard. In APT scenarios, blocklist attributes often fail, pattern matching can't stop 0-days, and when every device is already compromised, whether a computational model can catch an APT group is an open question. That said, discovering new correlatable attributes during detection can dramatically improve results and make findings more credible — like Mandiant's imphash from 2004, which detected related malware families by hashing PE file import tables.

When you combine all these detection methods, you inevitably run into encryption/decryption and debugging/anti-debugging challenges. How the offense-defense arms race keeps evolving and improving detection effectiveness (getting IOCs is one thing, but you also need post-decryption IOCs) can't be separated from two key factors: context and strategy. The next section briefly covers existing limitations through the lens of those two factors.


# Context and Strategy

<!-- This section needs rethinking — it lacks coherence -->

![img](https://img.iami.xyz/images/threatIntroduction/sense.png)

An entity's time-sequenced actions within a context form a strategy — true for both attackers and defenders. A defensive strategy divorced from a concrete context isn't worth much. Think through the following:

1. Against crawlers: How do you detect them? What are they after? What's the impact? Is it a regulator? A competitor? A search engine? What's the defender's strategy, and which layers do you respond at?
2. Against intruders: Which layer did the intrusion happen at? How was it detected? What is the attacker currently doing — do you kick them out and forensically image the machine, or redirect them to a honeypot for further observation? What if you haven't observed an attack but you've already been hit?
3. Against network traffic: When do you start analyzing Layer 4 vs. Layer 7 traffic data? How do you optimize the tradeoff between performance and effectiveness?

An application's interaction with users can be roughly divided into two parts: the client side (browser, mobile, whatever) and the server side. The service flow goes: user sends a request to the service layer → server processes it through a series of steps → result returned to user. Everything that happens after a request comes in — auth, risk assessment, calling services, hitting the database — is typically invisible and out of the user's control. Users don't care about any of that; they just want the service to work. As a defender, you still have to keep user experience in mind. Nailing a malicious attacker is great — but what about false positives that hurt legitimate users? How do you handle that? Context has to be defined clearly before any strategy makes sense.

Also: how do you make sure users are operating in a trusted environment (or at least a reasonably trusted one)? When you detect DNS hijacking, how do you technically ensure users load the correct resources? Mapping out a clear series of responses within the context and assembling them into a strategy — that's how you hit back. But how clearly you can define context depends entirely on your ability to think like an attacker ("fighting yourself" ability) — your personal or team experience. People who haven't thought through enough scenarios tend to miss the forest for the trees.


# Architecture and Product Implementation

<!-- A bit forced — struggling to express what I actually want to convey here.

Higher deployment cost = lower availability. How do you achieve one-click deployment?

Microservices? Small granularity, single responsibility, easy to refactor, local deployment, easy to develop, clear boundaries, stable interfaces. But when you scale to thousands of services, deployment alone becomes terrifying, and wiring up inter-service connections causes a ton of problems.
SOA?
Cloud-native? Hybrid cloud?

Update: v5, leaving this as-is for now
-->

![img](https://img.iami.xyz/images/threatIntroduction/architecture.png)

The purpose of software architecture is to make it easier to develop, deploy, run, and maintain the system components. SDL (Security Development Lifecycle) runs as a security guardrail throughout the entire software lifecycle. Security architecture is one piece of SDL — specifically, a design concern that doesn't always get its own explicit step in the SDL process — and it needs to be factored in from the very beginning of software development.

If you want runtime protection baked in from the start (intrusive, build-time), you have to embed or integrate an SDK into the application itself by modifying the code. That adds dependencies to the software architecture and increases the cost of future changes. So the question becomes: how do you balance software architecture with security architecture to minimize coupling between business operations and security controls? If you go non-intrusive, you only need to hook into the network or host layer through ops tooling, with minimal impact on the existing software architecture.

Traditional architectures can be handled that way. Cloud-native security is a different story — it mostly means buying the cloud provider's native security services or integrating third-party security services. You use what's available. Microservice architectures depend heavily on their deployment model. Container-based microservices can be defended through full-chain monitoring, analyzing metrics and logs to surface threats (there are now complete cloud-based solutions for this). The appeal of microservices is in the "micro" — small, single-responsibility services are easy to refactor, develop, and deploy, and their clear boundaries and stable interfaces make security issues easier to spot and fix. But when you have thousands of them, just deploying is daunting, and managing inter-service connectivity causes a mountain of problems. The higher the deployment cost, the lower the actual availability.

On top of all this: as software projects grow, coordinating across product and engineering teams gets harder, communication efficiency drops, and iterating the codebase makes it harder to maintain. At that point, you're not just thinking about architecture design — you're also balancing software development velocity. Sometimes you have to deliberately trim features from the architectural design (including security architecture) to actually ship within the expected timeframe.

# Business and Operations

![img](https://img.iami.xyz/images/threatIntroduction/yunying.png)

Specific business needs define specific contexts, and the business operators define (or should define) the strategy. Threat detection and defense gets applied based on the specific business and specific context. The methodology described earlier isn't hard to understand in theory, but if you want it to actually work well, you need refined operations.

Refined operations is honestly one of the most tedious parts of running threat detection. By separating product functions and reducing operational complexity and cost, you start to get somewhere. One of the biggest weaknesses in security products today is that a single product often requires a whole team of engineers to operate behind it — which drives up product costs and creates redundant work (both between competing companies and between teams within the same company). Automating the fine-grained operational work is how you free up human capacity. The end goal of refined operations is fully automated operations. Early on, you do semi-automated operations so that ops engineers have bandwidth to focus on getting the fine-grained part right. Later, you move to fully automated, fine-grained operations — which means higher detection efficiency and faster response times.

# Summary and Outlook

Threat detection already has a fairly mature ecosystem. What's covered in this post only scratches the surface of software and system-layer detection — it's not a true end-to-end threat detection picture (which would include physical-layer and personnel-layer considerations too). From the application layer to the network layer to the host layer, there are all kinds of products filling different roles. But looking across the board at detection output, there's still room to improve. Beyond that, how to platformize, productize, and visualize intrusion detection capabilities on public cloud is still a wide open direction. On the visualization side alone: imagine detecting an intruder and showing, visually, exactly where they are in your asset model — predicting their next move, simulating their likely attack path, and generating targeted defensive responses on the fly. That's still basically a blank space.

Last thought: the right way to think about computational models is to neither blindly believe that machine learning can solve everything, nor to discount it entirely. When you apply ML models, understand *why* they work, not just *that* they work.

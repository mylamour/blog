---
layout: post
title: Talking About Defense in Depth in Security Design
categories: Security Architect
kerywords: security architecture enterprise security security design defense in depth microservices security service plane Defense In Depth design principles
tags: security architecture fundamentals
translated: true
---

# 0x01 Preface

Been slammed lately. A lot of pressure.

# 0x02 The Meat of It

Let's get back to the design concept itself. The original term is Defense in Depth — it's literally about depth. So today let's just talk through what actually counts as Defense in Depth.

Defense in Depth as a design concept generally applies to a Layered Architecture. My take: **no layered architecture, no Defense in Depth**. The whole point is providing multiple layers of controls to mitigate threats. (Matching the concept to the right context is important. Same as when I wrote about Shift Left — that concept applies to proactive, forward-looking security work, moving defensive capabilities earlier in the process. So if you're doing reactive, after-the-fact work, this concept doesn't really fit. Forcing it in would just feel contrived.)

Defense in Depth design generally needs to cover four directions:

* System
* Network
* Permissions
* Data

Let's start with systems — this is a pretty broad concept. Think of it as a set of hardware and software that together provide a service, all treated as one system. A system is obviously layered: from hardware up to the OS, then virtualization or containerization, then the actual applications/processes running on top. If we start our focus at the hardware level, we're talking about defensive techniques like TPM, TEE, Root of Trust, Hardware Based Encryption, and so on. Then at the OS level: VMP, HIDS, EDR, AV, etc. Going further up, things like RASP and Security SDKs are what you can do at the application layer. And never forget logging. If we've now roughly completed Defense in Depth for a single monolithic system, then in a microservices world, connecting multiple such systems together forms what's called a service plane.

![image](https://img.iami.xyz/images/221557980-b0c7be68-c624-4e92-a42c-c54d6be7c211.png)

Now that we have a service plane, from an end-user's perspective, the access chain starts from the client side and passes through CDN, Firewall, WAF, NIDS, and a bunch of other security devices/tools. If you're running your own data center, you'd likely see something like the left side of the diagram below. Traffic gets sidelined via BGP or other protocols to divert interesting flows to security devices — this means traffic from machines on different racks all passes through the firewall for inspection. Otherwise you'd end up in a situation where users are accessing services through the normal access chain, but the microservices deployed across different security zones have no inspection between them. For example, payment services and wallet services deployed in different VPCs, but traffic between those VPCs goes unchecked — meaning once the perimeter is breached, you're looking at unlimited lateral movement. This whole thing also ties into the OSI model, as shown on the right side of the diagram. The flow from application layer traffic down to transport layer, then to network layer — there's a transmit and receive process involved. Even though security devices already have built-in defenses at different layers, architects still need to keep this in mind during design.

![image](https://img.iami.xyz/images/221558012-cad3039e-aeca-4477-8276-c240373af8e1.png)

# 0x03 Wrap-Up

Defense in Depth is something everyone in security design throws around, but the actual quality of implementation is questionable. A lot of the time people don't even recognize the value of their data, let alone think seriously about security design.

I didn't cover permissions and data Defense in Depth in this post — honestly because I couldn't figure out a good way to diagram them, so I just skipped the drawings. Both are pretty abstract. For permissions, Defense in Depth usually means doing SOD (Separation of Duties). Take Root of Trust as an example: root keys must always be split and held by different people. Similarly for key management, the Import, Assign to applications, and Enable/Disable operations should be assigned to different roles. From a process management standpoint, roles like operator, admin, analyst, and auditor are pretty common in systems. On the tooling side, things have evolved from SMS-based 2FA to app-based MFA, which brings MFA into the Defense in Depth space too. Same idea goes for moving from single-point authentication to per-request authentication. Data is the same story — internal logic processing, cross-system flows, what happens inside the DB. From hashing and signing, to TLS in transit, to AES at rest in the DB, to encrypted binlog sync, and so on.

Need to sit down and organize this properly before writing more. Too tired right now. I'd seen more companies hiring data security architects lately and wanted to write something about that, but never had the energy to finish it.

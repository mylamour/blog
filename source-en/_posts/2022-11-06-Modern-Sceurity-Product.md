---
layout: post
title: Modern Security Products
categories: Security Architect
kerywords: security products security architecture enterprise security security innovation
tags: security products
translated: true
---

# 0x01 Intro

I originally wanted to call this "What Kind of Security Products Does a Security Architect Need," but then I thought — who am I to speak for all security architects? After some deliberation, I settled on "Modern Security Products," and I'll just share my take based on real experience.


# 0x02 Main

![image](https://img.iami.xyz/images/200170892-3ae0b2f1-e926-4e56-bdcd-205627b1d97d.png)

1. Clear boundaries and solid domain expertise
> This means two things: **what problem it solves** (scope) and **how well it solves it** (depth of the moat). Stuff outside the boundary gets handed off to other products (and that's how a product line is born), while stuff inside the boundary needs to reach a real level of professionalism — technically that means platform compatibility, scenario support, feature coverage, performance, etc.; on the services side that means pre-sales, post-sales, procurement mechanisms, and so on. In practice though, a lot of security products can't figure out their own boundaries — either missing features or throwing in stuff that doesn't belong. Take a certain vendor's KMS: it ships with a bare-bones PKI baked in. Nothing about that sentence really tells you much — nobody actually uses it — but it always shows up in the marketing materials. All sizzle, no steak. Another example: Microsoft's Information Barriers (IB). The implementation is Exchange-first, with effects on SharePoint, OneDrive, and Teams. But policy propagation time is unpredictable — usually 30 minutes or more. The UI only lets you add policies; deleting one requires the command line. On SharePoint, IB works, but policy enforcement stretches to over an hour, and you can still add external sharing at the same time — basically punching a hole right through the isolation you just set up. And then there's Defender — the boundary definitions are actually pretty clean (Defender for IoT, Defender for Endpoint, etc.), but you still run into issues like incomplete platform support, zombie processes, and no debug logs. On the scenario side, a good product shouldn't just support specific scenarios — it should abstract common capabilities out of them. If you can detect process privilege escalation and reverse shell connections, you should also be building toward multi-source data ingestion, a generic detection engine, event correlation, and alert analysis.

2. Solid system fundamentals
> As a product, it **must have basic system-level capabilities** built in. I'm not sure there's a perfect term for this, but what I mean is the availability, reliability, and security requirements any system should meet — things like logging & monitoring, TLS, HA & DR, SSO integration, backup & recovery, and so on. Simply put, a security product can no longer get away with "it's on the internal network, so HTTP is fine." One vendor's HSM drops log entries. Another vendor's EDR has no debug logs. I could keep going — there are plenty of products like this. Some don't support HA. Some don't support TLS. And the moment you ask for these things, you're told it requires "custom development" at a premium price. On top of that, **security products absolutely must secure themselves**. Splunk, for example, supports masked queries but doesn't support encrypted storage of indexed data. Sure, a SIEM isn't storing massive amounts of raw data, but you can't encrypt what's in the index. There are plenty of similar examples — like CyberArk supporting certificate authentication but not actually validating the certificate's CA.

3. Simple to use, with an expert mode
> I still remember early in my security engineering days, my team lead told me: make the features idiot-proof. One button click, all the steps happen automatically, user gets the result. Sure, partly that was because our target users weren't very technical. But looking back, keeping a product simple and approachable is still a strong selling point — if something can be done in 3 clicks, nobody wants to do it in 10. Beyond **making things easy for the end user**, you also need to **lower the ops burden for deployment and maintenance** — like supporting IaC-based deployment automation, or one-click cloud deployment. Take a certain X engine's standard product: its deployment mixes VMs and containers, but it defaults to a self-managed K8s cluster and doesn't support EKS. Now, about expert mode — why bring that up? Microsoft's security products are actually ahead of the curve on simplicity: no complex config screens, most things done in a few clicks. But that same simplicity makes customization a nightmare — instead of writing YAML or a DSL to express what you want, you end up clicking through an endless series of menus.

4. Extensibility
> First: **let data flow between systems through APIs or industry-standard protocols**. For example, Vault integrates with HSMs via PKCS12; Workday integrates with SailPoint via SCIM; SAML for AAD integration; ACME for certificate management; KMIP for key management — all of that. Second: **provide a plugin mechanism for scenario-specific customization**. Vault, for instance, uses custom plugins to support Chinese national cryptography standards. Third: **support system-level integration**. Enterprises always have a bunch of ops platforms running, and a product needs to be able to connect with them — logs piped to Splunk, monitoring hooked into Zabbix, access management integrated with AAD and SailPoint, and so on.

5. Separation of duties (SOD)
> Most products default to "super admin can do everything" — adjust logs, grant permissions, the works. In reality, a super admin should only need to manage users and handle authorization. The actual responsibilities within each role should be handled by specific users. An auditor gets global read-only; an ops person gets configuration management; and so on. Microsoft actually handles SOD pretty well — but it goes a bit too far. More often than not, after getting the role you applied for, you still need to go apply for sub-permissions for each individual feature you need to use.

6. Modern UI
> This is usually the first thing people think of, but what actually counts as a modern UI is a job for a UI designer to define. What I know is: IBM's IGA product is still using JSPX with a form-style interface straight out of last century. Meanwhile, CyberArk's switch to HTML5 has load times north of a minute. Performance optimization isn't optional.


# 0x03 Wrap-up

I'm not a consultant, and I'm not a product person (though I have designed a few simple security products). Since joining the industry, I've done in-house development, written small tools, played around with open-source products, used home-grown products, and used a ton of commercial products — basically the top names in each space, largely thanks to a security budget that was, let's say, generous. I follow Gartner, but I care more about what actually works in the real world — especially when thinking through things from an architecture angle. Like in the [endpoint security governance](/End-User-Computer-Control-And-DLP/) write-up: the real work is thinking through IT and security collaboration, the impact security controls have on employees, exception channels, policy frameworks, and so on. Not just picking the "top" product, but **choosing the right approach and the right product for the situation**.

These days you see all kinds of "learn hacking in 7 days" tutorials everywhere — same playbook as the "programmer making 10k a month" bootcamps. Mostly just covering basic tool usage. And the way I see it, knowing how to use tools should be table stakes. In the end, the training companies walk away with full pockets, bystanders get their entertainment and move on, and the industry and the people actually doing the work are left holding the consequences.

Learned quite a bit lately, so figured I'd write more of these.

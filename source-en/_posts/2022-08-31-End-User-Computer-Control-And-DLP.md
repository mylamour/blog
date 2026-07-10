---
layout: post
title: A Practical Look at Endpoint Security and DLP Governance
categories: Security Architect
kerywords: data security security policy security technology security operations security platform enterprise security security governance DLP data loss prevention endpoint security
tags: security architecture data security endpoint security
translated: true
---

# Endpoint Security Governance

![image](https://img.iami.xyz/images/187610583-acca64c5-105b-4893-b932-aa969c502093.png)

Endpoint security can be split into two buckets: one is the security team's domain — endpoint control — and the other is IT's domain — device management.

EUC (End-User Computer Control) breaks down further into:
* Anti-Malware and Endpoint Detection and Response (EDR)
* Vulnerability Management and Hardening Compliance
* System hardening
* Data Loss Prevention (DLP)

These tools and their capabilities are pretty clearly owned and operated by the security team. On the IT side, you also need:
* Device admission control (SASE: Secure Access Service Edge)
* User device management (UEM: Unified Endpoint Management)
* Self-service portal

So the end state on the endpoint side looks something like this:
* Use AAD accounts instead of local passwords — password policies enforced in AAD apply to the endpoint automatically.
* Use system hardening to consolidate DLP control points. For example: full-disk encryption removes the need to monitor physical copy-out (PE), disabling USB storage means DLP doesn't need to constantly watch USB, and stripping admin rights prevents users from uninstalling security software.
* Full-disk encryption (FileVault/BitLocker) keys are escrowed in UEM for safe keeping.
* Maintain an approved software list and block blacklisted apps. If you work at Alibaba there's a decent chance WeChat Work (企业微信) is blocked; at Tencent, DingTalk wouldn't be recommended either. Same goes for personal cloud storage, note-syncing apps, remote access tools, and proxies — these generally shouldn't be on managed machines.
* Enroll devices with a device certificate, then push SASE/admission software only after the device meets security standards — for example, requiring AVScan, DLP, and EDR to be installed before VPN/SASE access is granted.
* Use user certificates to strengthen VPN/SASE admission and maintain network connectivity. If you have the infrastructure, user certs can even be stored in hardware like a YubiKey.
* Inside SASE, you can restrict the traffic protocols allowed into internal networks — say, only RDP, SSH, and HTTPS. You can also enforce URL filtering on internet-bound traffic.
* Use RBVM tools to sync software asset data from UEM, generate corresponding patches or updates, and push them back through UEM.

# DLP Governance

DLP has always been a critical piece of security governance, but most companies implement it purely through Host DLP and Network DLP. When I first got into this space I was the same — relying on a single point-solution. That's not the right approach. Here are some thoughts, specifically from the endpoint angle:

* DLP governance needs a red-line policy, technical enforcement (point tools are okay, but ideally layer multiple capabilities together), and operational management. You need all three.
* You also need a data classification and grading standard so you can apply different controls to data at different sensitivity levels. See my previous post for details.
* DLP rules in your DLP Policy should call out approved file types to monitor — things like word processing file extensions, presentation files, email, source code, etc.
* Generally speaking, you want to Monitor first rather than jumping straight to Block/Deny.
* Data captured on the endpoint should be encrypted before it's sent back.
* Pay extra attention to specific high-risk scenarios: onboarding and offboarding, copying access keys, etc. You'll also want custom policies for anyone under special scrutiny. For offboarding in particular, you need automated permission revocation.
* Security needs to close the loop on itself too — including log auditing. Even the act of security personnel querying these events should be logged. You can't have a permanent exception just because you're the one providing the security capability.
* For Cloud App DLP, if you're on Azure you can wire this up directly through Microsoft Defender.
* Microsoft DLP supports some auto-classification, but it doesn't recognize Chinese sensitive information patterns out of the box — you have to define custom entities yourself. That's a pretty clear signal that data security standards in China still have room to grow (honestly, this is true in other domains too).
* Standardizing your system architecture is essential. Every management console — for every tool — should support HA, FQDN, TLS, SSO/LDAP, logging, and monitoring. (You can see in the diagram above that all the management consoles support SSO login.)
* For every default security control, you need an exception process — and that process should be automated. For example, if admin rights are stripped by default, then when a user gets approval to elevate, UEM should automatically grant the right permissions to their machine without someone doing it manually.
* Provide a unified, approved file-sharing tool (one that meets your architecture standards) — whether it's for moving files from the office network to production, or sharing with external partners.
* Mail DLP depends on your mail server implementation. Typically you can set up server-side forwarding to a DLP server, combined with client-side actions. Outlook, for instance, supports labeling data and enforcing controls based on sensitivity level — blocking copy, restricting forwarding, adding watermarks or signatures.
* Avoid relying on traditional NDLP for traffic interception at the network layer when you can. If you do need it, integrate it with SASE.

# Afterword

Wandering thoughts, jotted down after an evening walk. Cool autumn air — good time to reflect.

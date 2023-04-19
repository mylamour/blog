---
layout: post
title: Thoughts on Fast Incident Response(FIR)
categories: 安全工程师
kerywords: Incident Response
tags: 应急响应 旧文迁移
---

About FireEye being attacked by APT. They showed a very sincere attitude. This is worthy of respect and learning. But for other companies how to deal with subsequent impact is a problem.

1. Check the contents of the weapon library and make patches for the attack surface.

* Which affected products are used in your company？
* What is the impact on the business? which businesses have higher levels？
* What is the fastest potential way to protect it?
Also in most cases, manufacturers will release official patches. if not, you should be able to do soft patches.

2. Extract the IOC from the weapon library and make a scan on the whole assets.

* Analyze the sample library and get some IOC
* Find your asset list and Identify potentially affected assets
* Sort out the targets that can be detected, Whether it’s files, network traffic, or anything else.
* At the same time, you need to know which places are inaccessible and monitor them accordingly

According to Tencent's Security Laboratory, they have detected many new IOC

3. Tracing the Corresponding Attacks and Make a Forensic Analysis.

* Know how the attack is formed
* Fixed evidence is the most important, memory mirroring is also necessary
* According to the analysis results and find some information from Threat Intelligence Base. (Maybe you have your own channel information)

The premise is that there are sufficient resources, and most cases can only meet the first two steps. Professional traceability analysts are not easy to find.

At the same time, don’t forget to follow the company’s internal regulations to initiate corresponding changes. For example:

* Follow the Online Change Plan and Special Approval Process
* Prepare SOP in advance，Include repair plan and rollback plan, etc.
* Quickly find the interface person and implement the steps
* Notify relevant departments whether the repair is completed and whether it takes effect
* Add to a Disaster Drill Plan And conduct regular drills

It is still necessary to recruit professional security engineers and continuously optimize the security defense architecture and improve the emergency response process in order to achieve the fastest recovery measures. Win precious time difference in the war with the attacker. also for security engineers, solving problems should be value-driven, threat-driven, and disaster-driven, not management-driven. I have to say, it's so funny.
---
layout: post
title: DSMM Session 4 and My Take on Data Security
categories: Security Engineer
kerywords: thoughts reflection issues work experience summary
tags: Data Security
translated: true
---

I was lucky enough to attend the fourth session of our group's DSMM training, and it did shift my thinking on security quite a bit. So I'm writing this down to capture what I learned.

# Data Security Maturity Model

DSMM stands for Data Security Maturity Model. Before this, when I thought about data security and data loss prevention, my main focus was basically three things: mapping data flows, tiered access control, and anomaly monitoring. But from a DSMM assessor's perspective, you need to look at the entire data security lifecycle. Here's the well-known DSMM architecture diagram:

![img](https://img.iami.xyz/images/56093317-99b2a480-5ef9-11e9-8056-97e648bbbc1d.png)

You can clearly see the model is defined across three dimensions: capability maturity, capability dimension, and process dimension. (Studying DSMM also means learning about the Personal Information Security Specification and the Cybersecurity Law — don't laugh and say it's all BS or act like it's pointless.) These three dimensions each represent a different aspect of data security:

1. Organizational capability — whether the company actually has the capacity and the will to do data security;
2. Personnel capability — whether the people responsible for defining and executing the strategy actually know what they're doing.

The big difference between Level 2 and Level 3 is whether data security is being ensured effectively and systematically at the organizational level.

Traditional SDL focuses on the software itself — finding and fixing potential security issues from design through prototyping, delivery, and maintenance. DSMM, on the other hand, covers the entire data chain: collection, transmission, storage, processing, exchange, and destruction. The general security domains it covers touch on basically every angle of security governance. Obviously, a piece of data usually lives longer than the software that handles it. Looking at the problem through the lens of the data chain (from network layer to application layer to host layer to storage layer) also gives you a more complete picture, whereas the traditional approach tends to split responsibility along org chart lines.

![img](https://img.iami.xyz/images/56093321-b9e26380-5ef9-11e9-9b9f-3053e7d53e11.png)

# Building Data Security Capabilities

Data security has to be built top-down. Leadership sets the strategy, and dedicated roles implement it all the way down — covering operational capability, technical capability, compliance capability, management capability, and so on.

![img](https://img.iami.xyz/images/56093303-68d26f80-5ef9-11e9-9797-5784f5f2524d.png)

# Data Security Assessment Capabilities

Being a data security assessor is a different game from building data security. In the building phase, dedicated data security roles design and implement the controls. Assessment, though, is usually done by a third party. An assessor doesn't just need to understand how each data security process domain is designed at a given company — they also need to know how to communicate effectively throughout the assessment process and stay as objective and impartial as possible.

![img](https://img.iami.xyz/images/56093313-89022e80-5ef9-11e9-9c31-396af5ed6b97.png)

# Misc

Every industry goes through its hype cycles — AR/VR, then AI, then blockchain. When the hype hits, these concepts inevitably bleed into whatever field you're in. I'm not sure whether GDPR and DSMM are going to make data security the next big thing domestically, but I'm going to keep orienting my view of security offense, defense, and governance around the data security lifecycle from now on.

# Resources

* [Personal Information Security Specification](https://www.tc260.org.cn/upload/2018-01-24/1516799764389090333.pdf)
* [Cybersecurity Law of the People's Republic of China](http://www.npc.gov.cn/npc/xinwen/2016-11/07/content_2001605.htm)
* [DSMM Final Draft for Review]()
* [A Side-by-Side Comparison of the Personal Information Security Specification and GDPR](http://www.anjielaw.com/uploads/soft/180620/1-1P620103453.pdf)

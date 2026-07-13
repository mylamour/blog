---
layout: post
title: Study Notes on Data Security Regulations
description: "A technologist's map of China's data security regulations: CSL, DSL, PIPL, and supporting standards - what actually matters for compliance."
categories: Security Architect
kerywords: security compliance data security law cybersecurity law security regulations China personal information protection law
tags: Security Architecture
translated: true
---

> I've always believed that if you design security right, compliance will take care of itself. But in all these years, I've never met a compliance person who actually gets the tech, and never met a tech person who actually gets compliance. I've been through a few compliance projects, but honestly never had the bandwidth to read every detail. So I decided to sit down and sort this out myself. These are my study notes.

# 1. Regulations and Standards

One habit I have is learning by asking questions first. For example, I didn't know what security-related regulations even existed, or how they're actually applied in practice, or how regulations map to technical standards. So I figured I'd start by looking at the legal hierarchy.

## 1.1 Legal Hierarchy

![img](https://img.iami.xyz/images/how-law-created-and-worked.png)
(Image from the internet, source unknown)

**Laws are divided by their authority level into superior law, subordinate law, and co-equal law. Superior law takes precedence over subordinate law, and the latter cannot conflict with the former. Co-equal laws carry equivalent authority and are each applied within their respective jurisdictions.** From this diagram it's easy to see that the Constitution sits at the top of everything — it's the superior law, and the National People's Congress (NPC) and its Standing Committee are responsible for amending, overseeing, and interpreting it. Below that come the general laws enacted based on the Constitution. Then come administrative regulations and departmental rules issued by the State Council and its subordinate agencies, while local governments and people's congresses can enact corresponding local regulations.

![img](https://img.iami.xyz/images/type-of-law.png)

In this process, Article 78 of the Constitution stipulates that **the Constitution has supreme legal authority, and no law, administrative regulation, local regulation, autonomous ordinance, separate regulation, or rule may contradict the Constitution.** From this mind map you can also see that, beyond the laws themselves, there are also **legal interpretations, decisions on legal questions and major issues, and decisions to amend or repeal laws**.

## 1.2 List of Regulations

On the international side, the most well-known is the General Data Protection Regulation (GDPR) — personally I'd say GDPR was a watershed moment for data protection legislation globally. China's equivalent is the Data Security Law. Beyond that, the UK has the Data Protection Act 2018, Canada has the Personal Information Protection and Electronic Documents Act (PIPEDA), and California has the California Consumer Privacy Act (CCPA).

Domestically, the regulations related to data security are shown in the diagram below (the Criminal Code also covers some relevant areas but isn't listed here).

![img](https://img.iami.xyz/images/infosec-law.png)

It's easy to spot that 2021 was another watershed year (the technical standards I'll cover later also saw a big wave of new releases around 2021-2022). Guiyang, as China's big data city, was also out ahead of the curve — it introduced relevant regulations back in 2017 and then revised them in 2021. Meanwhile, you can see some cities that drew up information system security ordinances back in 2009 and haven't touched them since. Times have changed.

I also didn't include regulations from the Cyberspace Administration of China (CAC) here, because the CAC is not a ministerial body and technically doesn't have legislative authority under the Legislation Law (《立法法》). However, the State Council did grant the CAC comprehensive authority over nationwide internet information content management in 2014 (via a notice), which suggests it may function as a directly subordinate administrative body. But administrative law also provides that notices don't constitute valid administrative authorization. That probably needs a legal expert to untangle. One pet peeve though: you literally cannot find a searchable archive of historical CAC regulations on the CAC's own website.

Here's a legal map of China's new data order compiled by NSFOCUS (绿盟科技) in 2021. You can see that beyond the laws and regulations listed above, there are also specific areas worth paying attention to — like children's personal information and cryptography.

![img](https://img.iami.xyz/images/china-data-security-law-2021.png)
(Image from NSFOCUS)

## 1.3 Technical Standards

First, let's look at the national standard technical requirements:

![img](https://img.iami.xyz/images/data-security-tech-standard-in-china.png)

You can see that after October 2022, specific data security requirements were established for various industries and for biometric data, and they came into effect after this past May Day holiday. These cover telecom, healthcare, logistics, ride-hailing, and e-commerce payments, among others. According to TC260 (the National Information Security Standardization Technical Committee), they've filled a huge number of standard gaps in recent years.

![img](https://img.iami.xyz/images/tc260-all.png)

That said, it does make you wonder: at this pace of output, are we overdoing it?

For the finance industry specifically, beyond the national standards there's also a whole separate set of financial standards (金标, or JR/T standards). It's clear that the financial payments industry, given its nature, developed corresponding standards early on — from data lifecycle specifications and data classification guidelines, to online banking systems, bank cards, payment terminals, cloud computing environments, and so on.

![img](https://img.iami.xyz/images/finance-standard-in-china.png)

# 2. Analysis and Interpretation

I mainly referenced interpretations from Deloitte (DTT), with a bit from PWC and EY thrown in — they're mostly saying the same things. Early on I also shared some PIPL analysis pieces on WeChat. These interpretations don't really get into technical frameworks though; they tend to approach things from a legislative angle. I'll skip the Cybersecurity Law (CSL) for now — while CSL does touch on data security and personal information protection to some degree, the Data Security Law (DSL) and PIPL are more specific and worth looking at directly.

## 2.1 《网络安全法》 (Cybersecurity Law, CSL)

Skipping for now.

## 2.2 《数据安全法》 (Data Security Law, DSL)

![img](https://img.iami.xyz/images/ra-data-security-law-china.jpg) (Image from Deloitte)

* Focus areas: tiered data protection, risk assessment and monitoring, emergency response, protection obligations, talent development, and transaction security.
* Defines data as: any electronic or other form of recording of information.
* Applies a territoriality principle: this law applies to data processing activities conducted within the territory of the People's Republic of China and their security oversight.
* Tiered classification: introduces the concept of "national core data" subject to "stricter management systems." Violations can result in fines up to RMB 10 million, plus potential suspension of operations, business rectification, revocation of relevant licenses or business licenses, and possible criminal liability.
* Risk assessment: organizations that handle important data must "conduct regular risk assessments" and meet specific requirements for assessment report content. Violations can result in fines up to RMB 2 million for the organization and up to RMB 200,000 for directly responsible individuals.
* Cross-border: "The security management measures for the export of important data collected and generated by other data processors during operations within the territory of the PRC shall be formulated by **the national cyberspace authorities in conjunction with relevant State Council departments**." Violations can result in fines up to RMB 10 million for the organization and up to RMB 1 million for directly responsible individuals. Also explicitly establishes that **overseas judicial or law enforcement agencies** seeking access to data held within China must go through China's competent authorities pursuant to applicable **international treaties, agreements, or the principle of equal reciprocity**. Violations here can result in fines up to RMB 5 million for the organization and up to RMB 500,000 for individuals.

## 2.3 《个人信息保护法》 (Personal Information Protection Law, PIPL)

![img](https://img.iami.xyz/images/cn-risk-chinainfo-digi-1n1-by-deloitte.jpg) (Image from Deloitte)

* Acts as a bridge between CSL and DSL, extending and carving out personal information as a distinct category from the network data (electronic data) definition in CSL.
* Applies both the territoriality principle and the nationality principle. Responsible authorities include the CAC plus relevant departments under the State Council and local governments; enforcement methods include inquiries, interviews, investigations, on-site inspections, and equipment checks.
* If your data volume hits a certain threshold, you must appoint a dedicated person in charge (though the threshold isn't clearly defined).
* Penalties: order to rectify, confiscation of illegal gains, warning; for failure to rectify, fines up to RMB 1 million; directly responsible supervisors and other directly liable individuals face fines from RMB 10,000 to RMB 100,000.
* Individuals have data subject rights, including: right to know (including notification of data breaches), right to decide, right to access and copy, right to correct and supplement, right to explanation, right to delete, and rights regarding deceased persons. When using data for marketing, an option not targeted to that individual's specific characteristics must be provided.
* Explicitly requires overseas processors to establish a dedicated institution in China or designate a representative responsible for handling personal information protection matters. **Data must be stored domestically; when transferring abroad, a security assessment is required, individuals must be informed of relevant details, and consent must be obtained.**
* Defines consent standards: consent must be voluntary; for minors, consent of their guardian is required; users have the right to withdraw consent; processors must inform individuals of processing rules. (This shows up on OPPO phones in a... "interesting" way — the moment you withdraw consent, the corresponding app won't let you use it anymore. Kind of pushing the line.)
* Defines the responsibilities of joint processors, entrusted processors, and transfers to third parties. Third parties may only process data within the original purpose, method, and category; any change requires obtaining fresh consent. (I wonder how many third parties actually follow the rules?)
* **When processing sensitive personal information, separate consent specifically for the sensitive data must be obtained.**
* Data processors are required to have: management systems + operational procedures + tiered classification + encryption/de-identification technology + reasonable access controls + regular training + emergency response plans + regular audits. **Assessment reports and processing records must be retained for three years.**

## 2.4 Relevant Domestic Technical Standards

Let me pick two industry-specific data security requirements as examples: [Data Security Requirements for Online Payment Services](http://c.gb688.cn/bzgk/gb/showGb?type=online&hcno=CEB5771DBBF05ED5EA99EBA50896537F) and [Data Security Requirements for Express Delivery and Logistics Services](http://c.gb688.cn/bzgk/gb/showGb?type=online&hcno=CDBCE8F2E4CDE60A86092361A8796178). Both start with industry-specific terminology definitions, then give an overview of the industry's business components and interaction diagrams, followed by basic requirements and requirements covering the full data lifecycle from collection through storage and use. For personal information collection, the primary standard to follow is GB/T 35273-2020 (Information Security Technology — Personal Information Security Specification). Worth noting: in the system permissions section, the requirements specify that courier apps should not request location permissions when the user isn't actively using the shipping service. Of course, that's another one most apps haven't actually implemented.

On data storage and transmission, beyond common encryption measures and sensitive data protection, the two standards have some notable differences:

1. Online Payment requirements:
    * Must not store user bank card magnetic stripe data, chip data, card verification codes, or bank card passwords;
    * If business needs require storing a user's bank card expiry date, authorization from both the user and the online payment service accounting platform must be obtained;
    * At least two of the following backup methods must be used: local backup, off-site backup, and off-premises backup;
    * Encrypted channels or data encryption must be used for transmitting personal identity authentication information, personal information that can identify a specific data subject and their financial status, and other critical information used for online payment services;
    * Cryptographic technology must be used to protect the security of personal identity authentication information;
    * Transmission messages, logs, and other files between client and server must not contain plaintext user authentication information or sensitive personal information.

2. Express Delivery industry requirements:
    * Personal information collected by smart service terminals must be stored offline, with a retention period preferably under 30 days;
    * Personal information and pickup verification codes stored offline on smart service terminals must be encrypted;
    * Providers must maintain an asset list of decommissioned smart service terminals and delete business data stored on those decommissioned devices;
    * When transmitting sensitive personal information to other personal information processors via system interfaces, at minimum whitelist controls (by IP, domain, etc.) must be used, along with digital signatures, OAuth (Open Authorization), or similar methods to authenticate the calling information system;
    * When transmitting user personal identity information, phone numbers, addresses, etc. over the internet or through offline channels, data must be encrypted before transmission and sent through a secure channel.

Also worth noting: for express delivery companies not involved in international business, user data cannot be transferred overseas — see the Didi RMB 8 billion fine as a reference point. The express delivery industry doesn't actually require records of cross-border data transfers, while the payments industry requires at least 5 years of records. On the flip side, the express delivery requirements add smart terminal management requirements that the online payment standard doesn't have.


# 3. Case Studies

Recently, a number of companies, organizations, and universities have been penalized for data security incidents — all newsworthy enough to be reported. Not sure if they just paid the fines and moved on without any litigation. But searching the China Judgment Documents Online (中国裁判文书网) database, I actually couldn't find any judgments citing DSL or PIPL — only CSL-based ones. Some of those cases were actually about personal information protection, but were decided under the Civil Code. This suggests that DSL, CSL, and PIPL are still seeing relatively limited application in actual court proceedings. For penalty cases, go check the judgment documents yourself — I won't go through them all here.

## 3.1 Cross-Border Data Transfers

Skipping for now.

## 3.2 How It Shows Up in Products

Click around in any mainstream app and you can easily find privacy protection statements. Worth reading through. As for how professional they are and whether the user experience is any good — that's for everyone to judge for themselves.

* WeChat: Me (bottom right) → Settings (at the bottom)
* Alipay: My (bottom right) → Settings (gear icon, top right) → Privacy
* Taobao: My Taobao (bottom right) → Settings (gear icon, top right) → Privacy → Privacy Statement (scroll to bottom)
* Douyin: Me (bottom right) → ≡ (top right) → Settings (at the bottom) → About (scroll to bottom)
* Bilibili: My (bottom right) → Settings (scroll to bottom) → Privacy Policy (scroll to bottom)
* Pipixia: My (bottom right) → Privacy Settings

In practice though, I haven't actually seen an option to withdraw data collection consent in any of these apps — something like what's shown below.

<img src="https://img.iami.xyz/images/revoke-PI.jpg" style="margin-left:auto; margin-right:auto; width:50%; height:50%; display:block">

Sure, they can refuse to let you use the app if you don't agree. But more apps don't even have a button to withdraw authorization in the first place. That's just the state of things — the behavior is pretty shameless and personal data is treated as nearly worthless. Beyond the apps, real-life examples are everywhere. Residential building entry systems using facial recognition as the only way in and out — and the device displays your full name, ID number, and home address. Buildings that use the blank backs of health check forms for reprinting — while the original side still shows another patient's personal and medical information. Once you start looking, these examples are literally everywhere. (Which is exactly why there are so many people trafficking personal information.)

# 4. Summary

I've always avoided digging into compliance because of inconsistent assessment standards, flawed audit processes, and companies participating in compliance projects not to actually be compliant, but just to get the license. On top of that, the standards are often written by technical experts in the industry, while the auditors doing the actual reviews frequently lack technical backgrounds. Under those conditions, how can you achieve genuine "compliance"?

But here's the thing — those auditors are also the ones who decide whether your license gets approved. So as the party being audited, you just have to save your energy and say with a smile: "Sure thing. What else do you need me to clarify?"

Beyond the auditors, a company's compliance team during an audit acts more like a PM — running between the auditors and subject matter experts, setting up meetings, writing summaries. Even when you can glance at an item and immediately know what it's about, you still have to explain it once to the compliance expert and then again to the auditing expert.

So here's the picture: industry technical experts write the standards; accredited audit firms recruit and train their auditors/experts; companies purchase equipment from approved vendors with specific certifications; and the compliance specialists inside the company — without technical backgrounds — all get together. "Let's set up a meeting." And then the pressure gets dumped on the engineering team. The engineering team usually isn't worried about meeting the letter of the standard — they're worried about how the auditor is going to interpret it.

Compliance audits are fundamentally externally driven — they use pressure from industry bodies and regulators to push companies to improve their internal security posture. Classified Protection assessments (等保), PCI DSS, CFA — they all work this way. But honestly, if companies were designing security architecture with high standards in mind from the start, out of a genuine sense of responsibility toward their users' data and a desire to protect their business reputation — rather than chasing a certificate — they'd naturally meet the vast majority of compliance requirements by design. And then you have to wonder how many companies out there purchased security products, passed the audit, and never plugged the equipment in.

Do security right and compliance follows naturally. The standards committees only started cranking out standards in the last few years — so what were the compliance people actually doing before then?


# 5. References

* [Law Interpretations and Q&A > Constitutional > Interpretation of the Legislation Law of the PRC > Chapter 5: Application and Record Filing](http://www.npc.gov.cn/npc/c2163/200108/5ead5307172c4eb1b871bdbf73774a46.shtml)
* [National Laws and Regulations Database](https://flk.npc.gov.cn/)
* [National Information Security Standardization Technical Committee (TC260)](https://www.tc260.org.cn/front/bzcx/yfgbcx.html)
* [National Regulations Repository](https://www.gov.cn/zhengce/xxgk/gjgzk/index.htm)
* [National Standards Information Public Service Platform](https://std.samr.gov.cn/gb/search/gbAdvancedSearch?type=std)
* [Financial Standards Full-Text Public System](https://www.cfstc.org/bzgk/)
* [China CAC](http://www.cac.gov.cn/)
* [State Secrecy Administration — Policies and Regulations](https://www.gjbmj.gov.cn/409049/index.html)
* [Deloitte: Twelve Responses to the Personal Information Protection Law — Financial Industry](https://www2.deloitte.com/cn/zh/pages/risk/articles/personal-information-protection-standardize-digital-econ.html)
* [Deloitte: Key Highlights of the Personal Information Protection Law](https://www2.deloitte.com/cn/zh/pages/risk/articles/personal-information-protection-law-analysis.html?nc=1)
* [Deloitte: Interpretation of China's Data Security Law](https://www2.deloitte.com/cn/zh/pages/risk/articles/china-data-security-law-interpretation.html)
* [Deloitte: White Paper on Cross-Border Data Compliance Governance Practice](https://www2.deloitte.com/content/dam/Deloitte/cn/Documents/risk/deloitte-cn-risk-data-cross-border-white-paper-211202.pdf)
* [NSFOCUS: Personal Information Security Legal Umbrella — Interpretation of the Personal Information Protection Law of the PRC](https://www.nsfocus.com.cn/html/2021/21_0823/1141.html)
* [Most Complete Compilation of China's Recent Data Security Laws and Regulations](https://zhuanlan.zhihu.com/p/386878730)
* [2022 China Cybersecurity Regulations Overview | FreeBuf Annual Review](https://www.freebuf.com/articles/neopoints/354719.html)
* [Report on Administrative Enforcement Since China's Data Security Law Took Effect](https://www.secrss.com/articles/55729)
* [Issues and Responses Regarding China's Data Protection Officer System](https://www.thepaper.cn/newsDetail_forward_15349171)
* [China Judgment Documents Online](https://wenshu.court.gov.cn/)
* [Ctrip Big Data Price Discrimination Case — Judgment](https://wenshu.court.gov.cn/website/wenshu/181107ANFZ0BXSK4/index.html?docId=GvdWoLTHX0XEcThcuH4aPKqFtTH/NsXalF6MXzGRxlUeASDnIR5v+Z/dgBYosE2gpUC3i5dEkX8+vdlqpwKoEt9KCi8EQhF86zm4EqFo5gc4HC+bfcN4LGnPJai8tUTS)

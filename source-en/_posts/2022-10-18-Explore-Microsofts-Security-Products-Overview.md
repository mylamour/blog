---
layout: post
title: A Quick Look at Microsoft's Security Products
categories: Security Architect
kerywords: data security cloud security security strategy security technology security operations security platform enterprise security security governance information protection data governance data protection
tags: security products
translated: true
---

# Preface

Since the National Day holiday, temperatures have dropped fast. From a high of 38°C to a low of 10°C in just two or three days — that 20-degree swing dragged us straight from scorching summer into winter, with autumn barely leaving a trace. The osmanthus trees in the neighborhood are blooming in all sorts of varieties, filling the air with a faint, cool fragrance that somehow feels almost unreal. Work has been getting busier and I've had little downtime, so I haven't had time to write anything lately (just noticed I started drafting this back on the 9th).

# Microsoft's Security Products

> First, a disclaimer: I hadn't used Microsoft's security products before. I've been studying them recently for work, so parts of this article may have inaccuracies. For actual usage of each product, refer to the official docs.

![MicrosoftProductOview](https://img.iami.xyz/images/196314165-04f2aaca-d61f-4d81-9da9-f4ad54bdf0c8.png)

Microsoft's security capabilities break down into three parts: security products, security solutions, and security services. This post only covers the products side. There are 6 product lines, which can roughly be grouped into three buckets. Defender and Sentinel handle threat detection and response for endpoints, cloud, and cloud applications. Entra and Intune handle identity and access — things like device management and user admission control. Purview and Priva focus on compliance and privacy, and also cover data loss prevention and information protection.

<!-- * Defender（XDR，CSPM，ASM，VM)
* Sentinel(SIEM)
* Purview（Compliance）
* Priva（Privacy）
* Entra(Identity & Access)
* Intune(Endpoint Management) -->

# Security and Compliance

So those are Microsoft's product lines — and really, everything revolves around two things: security and compliance. Let me walk through each briefly.

## Security

On the security capability side, beyond asset management and identity management, there's detection and response coverage for both cloud and endpoints. On the operations side, it supports SIEM, SOAR, and vulnerability management. The overall flow is: collect data → detect in the cloud → push response actions. Some detection also happens on the endpoint itself. Most of the data collection and detection relies on the Defender family — for example, Defender for Endpoint. Microsoft's products naturally integrate well with each other, but the experience on Mac and Linux isn't as smooth. If you add other tools on the endpoint, Defender can even run into conflicts — for instance, Defender's processes can conflict with the core processes of certain UEM products. On the integration front, probably because Microsoft's own ecosystem is so complete, third-party integrations aren't that friendly — Intune's official docs, for example, only support Jamf Pro. The main areas of Microsoft's security management portal are:

* Security Center (threat analytics, Advanced Hunting, incidents and alerts)
* Assets (devices, identities)
* Endpoints (vulnerability management, threat simulation & evaluation/Evaluation & Tutorial, third-party capability integrations)
* Email & Collaboration (threat investigation and tracking, phishing attack simulation)
* Cloud Apps (app discovery, app governance, activity logs)

Two things worth calling out specifically. First, the threat simulation/evaluation and phishing attack simulation features (I'm grouping these together) — phishing simulation can quickly push payloads to a selected group of users and then offer security training targeted at whoever got tricked. Second, Advanced Hunting (the Chinese translation "搜寻" really doesn't capture it well — I'll call it AH for short). AH supports searching across alerts, apps and identities, devices, and threat & vulnerability management by default. It has built-in schemas and functions — for example, querying network, file, and process events on devices, or email URLs and attachments. Sometimes though it feels more like a fancy intrusion detection tool rather than a true hunting platform.

![advanced Hunting](https://img.iami.xyz/images/196439697-aaeae9f3-1baa-417c-ac06-a745113b46b7.png)

Overall it's a data-driven product that does a solid job visualizing asset information, vulnerability data, and current threat status. For installing Defender, Windows is easy — no extra steps needed, though some advanced features or licenses still require manual activation. Other platforms aren't quite as seamless.

## Compliance

So what is compliance, exactly? Simply put, it means **presenting your security capabilities to a third party** to meet their requirements. That also means compliance only works after you've actually built security — you can't put the cart before the horse. When using Microsoft's compliance features, some of them require endpoint security products (i.e., Defender for XXX) to be deployed first. And equally important: **you can't let compliance drive security**. Compliance-driven security just gets you through audits with minimum viable protection (think: buying hardware just to pass an audit and never plugging it in). So when I used to see people on WeChat Moments hyping up compliance — "this is great for security!", "I should've gone into compliance earlier!" — it always felt like they hadn't really thought it through.

Microsoft's compliance features are largely under the Purview portal, which covers:

* Privacy (actually part of the Priva product line)
* Information Protection and Governance (data lifecycle management, data loss prevention, information protection, records management)
* Insider Risk Management (communication compliance, information barriers, insider risk management)
* Audit
* Discovery and Response (eDiscovery, data subject requests, audit)

Don't get too hung up on whether Microsoft's module breakdown makes sense. Let me briefly cover Information Barriers and Communication Compliance. Information Barriers provide a way to restrict users in different segments from searching or communicating with each other via Teams, SharePoint, or OneDrive — typically used for geographic isolation based on certain regulatory requirements. Communication Compliance is pretty self-explanatory: for example, not allowing NSFW content or harassment in chat.

Under the Information Protection module, there are data classification, labeling, and DLP. Purview ships with 308 default Sensitive Info Types and also supports machine learning to automatically discover new sensitive data. However, for mainland China, it only provides one type: China Resident Identity Card (PRC) Number. That means if you create a PII-Passport data label to trigger controls when detected in emails, chats, or documents, the label list (268 total) includes passport types from 39 countries — but none for China. There are plenty of similar gaps. Some PII types are similar enough that you might be able to adapt existing Sensitive Info Types with modifications. That said, generic detection rules can't be modified — things like the generic "All Credential Types" or "Access Key" rules are locked. And policies take at least 30 minutes to take effect; event data search isn't real-time, with some things taking over a day. That's honestly hard to accept.

For DLP detection specifically, it's no longer endpoint- or software-based — instead it's identity-centric. Wherever you are, if it's under an enterprise account, DLP applies across the entire Office suite. Another nice thing is that you can use connectors to integrate other data sources for DLP coverage. For labeled sensitive data, you can also set specific roles to control who can view it, along with notices explaining what to do. Of course, these permissions can also take 30+ minutes to kick in, and some features need over 24 hours to propagate.

# Summary

Microsoft's security product portfolio is broad and comprehensive (though the naming is all over the place and keeps changing). They have a natural advantage on Windows and Office products, letting enterprises get up and running quickly with relatively simple operations. On one hand, they've set a benchmark for security-as-a-service. On the other hand, customization is limited — there's no real "advanced" mode, for example you can only configure rules via toggles with no support for templating languages. In practice, if your environment has any real complexity, their products either can't handle it or you're paying extra for customization.

Also, because Microsoft's own ecosystem is so complete, they tend to push the "use all Microsoft, all the time" approach. But from a security design perspective, you're probably better off picking best-of-breed solutions per domain and integrating them. That same completeness also means third-party integrations tend to be an afterthought. And as a global company, some security capabilities have poor localization support for China — though that's not entirely Microsoft's fault.

On top of all that: overly granular permissions, an interface that throws errors at the slightest provocation — all signs that rapid expansion left a bit of a mess behind. Pricing? Budget-breaking. Implementation? Looks like it gets outsourced.

---

One more thing I've been feeling more and more lately: understanding business requirements really matters. No matter how polished a tool is, there are always ambiguous requirements. That forces engineers to go back to actual users again and again, clarify and re-clarify — and it really drains you.

---
layout: post
title: "Understanding Clearing Networks: Business, Technology, and Security"
categories: Security Architecture
kerywords: clearing network settlement acquiring issuing card scheme UnionPay Visa Mastercard AMEX payment security cross-border payment applied cryptography network security
tags: Security Architecture
translated: true
description: How clearing networks work — the business of acquiring and issuing, the technology stack behind card schemes like Visa and UnionPay, and the security architecture that protects them.
---

# 0x00 Introduction

Clearing networks are the connective tissue of the payment industry. They do two things that everyone else in the value chain depends on: **switching** transactions between acquirers and issuers, and **clearing & settlement** of the money that moves as a result. Globally, the well-known clearing organizations are Visa, Mastercard, American Express (AMEX for the rest of the article), Discover, and UnionPay. In China the picture is more layered — UnionPay (CUP) handles bank-card payments, NUCC ("NetsUnion Clearing Corporation") handles non-bank third-party payments, and if you widen the lens further there are also domain-specific systems like the City Bank Clearing Payment System and the Rural Credit Bank Payment Clearing System.

NUCC exists because Chinese regulators wanted third-party payment providers to route through a licensed, supervised clearing house rather than plug straight into commercial banks — the so-called **"cutting the direct connection" (`断直连`) mandate of 2017–2018**. The result is a very different topology from the US or EU, and it will come up more than once below.

AMEX and Mastercard both received China's Bank Card Clearing License — AMEX in 2019, Mastercard in 2023. AMEX went in with Lianlian DigiTech and partners with UnionPay; Mastercard set up a joint venture with NUCC. These arrangements — commonly called **JVs (joint ventures)** — are how foreign card schemes actually run domestic business inside China. The trade-off is complexity: multiple parties, cross-border data flows, and layered compliance regimes, all of which multiply the security surface.

This piece is a security architect's tour of what a clearing network actually is. Business first, then technology, then security, then operations. If you have only ever thought about payments from the merchant or wallet side, the parts you rarely see are what this is about.


# 0x01 Business

> This is not the market-analyst view — no wealth management, no consumer credit, no lending. The focus is on the parties in a payment transaction and the transactions themselves. Everything below is **retail payments** (BIS definition: payments between non-financial institutions such as households, non-financial corporations, or government agencies), not **wholesale payments** (payments between financial institutions).

## 1. Who is in a payment?

Start from ordinary situations to see who is actually involved:

* An employer deposits payroll into an employee's bank account each month.
* Someone withdraws cash from an ATM or a teller — turning a bank balance into physical currency.
* A customer buys bubble tea with cash — money changes hands directly with the clerk.
* A customer uses Alipay or WeChat Pay in a store — either the merchant scans the customer's payment code, or the customer scans the merchant's QR, drawing from a linked bank card or wallet balance.
* A customer buys a voucher on Meituan with a bank card; the merchant later redeems it.
* A customer pays inside their bank's own mobile app.

Even in these everyday flows you can already see four roles: **cardholder, merchant, payment platform (acquirer), and bank (issuer)**. What most people never see is a fifth: the **card scheme**. The card scheme's job is to route the transaction to the right issuer, run the switching, and drive clearing & settlement (both the clearing splits and the actual funds movement).

When the card scheme and the issuer are the same institution, this is called a **three-party model**. When they are separate, it is a **four-party model**. Discover and AMEX are three-party. Visa, Mastercard, and UnionPay are four-party.

![3-party vs 4-party](https://img.iami.xyz/images/8bfc250c9f53aaa6680e60afc31e72245a4a9611717a947f7467bb2a24fbcf37.png)

Diagram from the European Central Bank's *The Payment System* (full reference in the appendix). Each model has trade-offs. The three-party model is asset-heavy and expensive to run, but the scheme directly controls both issuing and acquiring — it can offer a more integrated financial service stack. The four-party model is positioned as a network operator: it scales more easily because it does not have to sit on either side of the customer relationship, but it has to negotiate with many issuers and acquirers, which raises coordination cost.

## 2. How does a transaction actually happen?

A "classic" transaction breaks into two phases: **authorization** and **clearing & settlement**. Note that "transaction" here doesn't only mean "buying something" — it means anything the network treats as a message: purchase, refund, balance inquiry, enrollment, cancellation, notification, and so on. Depending on whether a physical card is present at the point of sale, transactions are also classified as **card-present** or **card-not-present** (CNP).

The common protocols on the wire are **ISO 8583**, **ISO 20022**, and — specific to the Chinese domestic ecosystem — an XML-over-HTTPS style protocol we'll refer to as the "domestic XML protocol". Back to the flow itself, this is what an authorization looks like:

![authorization](https://img.iami.xyz/images/d4eac8944f2879566eec10f6a807b9fe238ea9e11b4588ef19bb48bbd4d20556.png)

Abstracted:

![payment workflow](https://img.iami.xyz/images/6873f69d127f001932b1772642acbc5e1127acb5f997d3d7397d70b5db28e6cf.png)

The "Acquire System" in that diagram can be a POS terminal, SoftPOS, mPOS, a virtual terminal, or a payment gateway. And the actual transaction lifecycle from the acquirer sending the authorization request to receiving the response is more elaborate than the diagram lets on:

![whole transaction lifecycle behind payment workflow](https://img.iami.xyz/images/ee8ecd2d09c52cc7e3ad4d62b452de4a34a7a0a421e60b3c26bc0eb96681349c.png)

## 3. Where does the money go?

> Ever notice how JD.com pushes JD Pay, Meituan pushes Meituan Pay, Ctrip pushes Ctrip Pay, and so on? Everyone owns a wallet. There's a reason.

The amount the cardholder pays does not all end up in the merchant's account. Along the way it splits into **network fees, scheme fees, interchange fees, cross-border fees**, and more. Under China's post-reform pricing, if we only count interchange and assume the acquirer earns 5 bps (0.05%) — on ¥100M of volume the acquirer walks away with ¥50,000.

For scale: according to the [PBoC 2024 Payment System Report](http://www.pbc.gov.cn/zhifujiesuansi/128525/128545/128643/5589365/2025021417373037368.pdf), NUCC alone processes roughly ¥1.42 trillion a day (2.83 billion transactions daily). In 2023 it cleared ¥497.90 trillion; in 2024 ¥520.5 trillion — up 4.54% YoY. UnionPay volume in the same period was down 8.61% YoY, at ¥697.9 billion per day across 914 million daily transactions (note the order-of-magnitude difference between the two: NUCC clears trillions daily while UnionPay clears hundreds of billions).

So on the third-party payment side, roughly **¥72.5 million a day** of interchange is up for grabs, even before you factor in that fee rates differ by merchant category. This remains a market north of ¥10 billion a year. There are around 170 licensed non-bank payment institutions in China, but the head e-commerce and social platforms take most of the pie. And it's rarely just about the interchange. Consumer credit products built on top of the wallet — JD Baitiao, Ant Huabei, Meituan Pay Later ("do I really need to defer paying for a lunchbox?") — are far more profitable. Under the pressure of consumerism, financial securitization gets increasingly baroque, and the customer's data and debts have quietly been resold a few times over by the time anyone notices.


# 0x02 Technology

Clearing networks are conservative by nature — the technology is deliberately unglamorous. Given how downstream every institution is on the network, 24×7 reliability outweighs novelty every single time. Let's look at what is actually going on inside.

## 1. Protocol: how does business turn into a data stream?

As noted, domestic Chinese clearing runs on two main protocols: **ISO 8583** (over TCP/IP) and the **domestic XML protocol** (over HTTPS).

![switching](https://img.iami.xyz/images/b694a498cd094fca99420c80ae2a2a03d7b3dea46d48f76a5297244b49abd086.png)

Acquirers push the transaction into the network — through the acquiring **front-end (`前置`)**, which in China refers to a dedicated boundary gateway box on the acquirer side. On the network side the "acquirer-front-end" is actually the network's back-end, and the network's own front-end is the box facing the issuer. CNP payments often need to be tunneled through the existing ISO 8583 link — a legacy of history rather than an ideal design.

ISO 8583 is not new. The original version dates to **1987**, with the latest revision in 2003. It uses a bitmap-based structure: each bit position indicates the presence of a particular field, so business semantics are encoded by turning bits on and off. Message layout is **MTI + Bitmap + Data**.

![ISO8583](https://img.iami.xyz/images/6134082bcdb17ece61a3e3244741e8e9145f13fc82ddd910d7a341454339e986.png)

Field usage, value ranges, and single-message vs. dual-message conventions differ between schemes. AMEX uses dual-message (authorization and capture are two separate messages); UnionPay uses single-message. So even on the same protocol, you still need scheme-specific conversion for localization and scheme configuration.

![XML Switching](https://img.iami.xyz/images/9cd5723bee5e361a60264a881eee19854175f9f910868e9c338f35f85e1be0b7.png)

The domestic XML protocol isn't particularly interesting on its own but we'll include it for completeness. It maps business fields to XML elements over HTTPS. And as noted, in some flows these XML messages still get translated to ISO 8583 for downstream switching — a historical decision, not an optimal one.

**ISO 20022** is worth mentioning even though we won't walk through it here. Also XML-based, but far better specified. XML lets you carry more information and remain human-readable. Different countries' domestic protocols vary, and driven by SWIFT, international wholesale payments have been migrating to ISO 20022 for years. Newer work is also worth watching: while learning about CBDC I ran into the BIS **mBridge** project, which uses a shared protocol to make cross-border CBDC settlement possible between participating central banks. Worth a look.

## 2. Network: how do participants actually connect to the clearing DC?

This is where "network" finally means what a networking engineer thinks it means. No matter what protocol you use on top, bytes still have to move.

In a clearing network, both security and stability requirements drive institutions (issuer- and acquirer-side alike) to connect through **dedicated leased lines** to a **front-end box (`前置机`)** on the participant's side. Some networks even provide a co-located rack — the "front-end room" — where participants place their gateway boxes right next to the network's own infrastructure. The front-end box sometimes enforces OS-level baseline controls, or runs a custom OS; sometimes it is really just a specific application (some bank-corporate direct-connect systems are like that).

![connection between institute](https://img.iami.xyz/images/242e7be7e406c8c1b662ebe3c0675a4499de22732ec10da9b4f4225cfad1bec0.png)

Even though "two-region, three-data-center" (`两地三中心`) is the recommended DR posture domestically, in practice there is still real business running in single-DC single-region setups. Why? Not clear — likely inertia. Besides physical leased lines, IPsec is also a valid link-layer option. If you need high availability, common patterns are multiple leased lines across different carriers, or one leased line plus one IPsec tunnel — which one depends on the scheme's connectivity policy.

Inside the clearing network itself, mainstream data-center fabrics apply. Take Spine-Leaf as an example:

![Spine-Leaf](https://img.iami.xyz/images/7d657302c8f2ca2da5ca1f49eab65243452e67b9bb28e2c1ae98f44d874419d2.png)

With multiple DCs, border-leaf switches at each site are connected across dedicated links for stable transport:

![Spine-Leaf-DR](https://img.iami.xyz/images/b97f9c3d3c5b3df2c915d7a7e856db2f455faa1ebb7accd9340f5192d053743e.png)

Two border leaves per DC ensures no single border-leaf failure can isolate a DC. If one DC's network fails outright, applications can still fail over to the surviving DC via the L2/L3 fabric extended by VXLAN EVPN. I'm not deep enough in low-level networking to pretend expertise — if you want to go further, comparing modern AI-DC fabric designs against financial DC fabrics is a good exercise. [Huawei's recent AI DC network architecture writeup](https://mp.weixin.qq.com/s/ItcnOkB1f_H-0gPiFSjzMg) is a decent starting point.

## 3. Applications: what are the core and supporting systems?

We covered how business maps into ISO 8583 or XML, gets carried over trusted links with TLS. Beyond the two crown-jewel functions — **switching** and **clearing & settlement** — what else has to exist for the network to actually run?

Zoom out from a system perspective. The core sits in the middle (switching + clearing), with concentric rings of supporting systems built around it. Switching we already covered. Clearing touches money movement — clearing splits and settlement — so around it live the funds transfer system, clearing engine, file transfer system, payment tokenization, exceptions/disputes system, and the risk system. The risk system also operates inline on the switching path — that's what "real-time risk control" means in this context. The file transfer system acts as the network's upstream data ingest, pulling data from many sources and feeding it to internal systems; the data warehouse / big-data platform processes it and hands cleaned data to other consumers.

![support system](https://img.iami.xyz/images/c1cc6cd295ce678c4b63017438a97a0c7836c32813c33b5ea723a1f31a5fb29f.png)

In the diagram above, the clearing network is presented as a B2B business — it serves institutions. But in the three-party model, the scheme also owns the cardholder relationship (assuming the loyalty program is actually good — a real assumption), which brings B2C business into play. Around that grow whole new subsystems: campaign management, user behavior analytics, internal risk management, negative-list screening, reconciliation and billing. The scheme ends up serving both institutions and cardholders.

![core system](https://img.iami.xyz/images/3376f2eb55f14e9e5a99838ee041e6fa0d202d8c4b6431908955536ee19eb530.png)

At the application layer, there is honestly less to argue about than people pretend. I'm not going to fight over "cutting-edge vs. appropriate". If a monolith gives you the stability you need, and the business doesn't demand rapid scaling or shipping new capabilities weekly, it's fine. Monolith, SOA, or event-driven (personally I think event-driven fits payments quite well) — anything that meets the requirements works. That said, it does not mean you should still be writing JSP or ASP in 202X. Even setting aside the antique UI, you owe your future self a few basic modern practices. Not to mention actually abstracting shared frameworks and components. This is part of why "simple" upgrades in this industry routinely cost millions to tens of millions — a lot of it is puppetry inside political inheritance.


# 0x03 Security

> Not going to attempt a whole-system security design here — that's the [security architecture tag](https://fz.cool/tag/#%E5%AE%89%E5%85%A8%E6%9E%B6%E6%9E%84) on the Chinese site if you're curious. Also see [Reflections on Financial Security Architecture Design](https://fz.cool/Finance-Tech-Security-And-Security-Principle-For-Architecture-TOGAF-C246-Notes/). Below we look at security through the transaction and payment lens.

Financial payment diagrams often show two flows: **information flow** and **money flow**. Information flow includes the transaction instructions, account info, payment status, and authentication data. Money flow is the actual movement of funds. But regardless of which flow, what is really moving is *data* — and this is where clearing networks are most security-sensitive.

Data protection here is grounded in applied cryptography — primarily symmetric-key encryption, PKI, and hybrid schemes. This section will walk through the fundamentals: certificates and keys. (I've run out of energy for drawing more diagrams. Tokenization — which is genuinely important — and how AMEX SafeKey uses biometric authentication on top of 3DS will have to wait for another post.)

## 1. Certificates and CNP quick payments

* HTTPS transport encryption is enabled for XML messages via certificates.
* CSRs are generated directly inside the HSM.
* Certificates come from a public CA.
* Certificate validation covers expiration, CRL, and the full chain.
* Sign/verify and encrypt/decrypt key usage are split into two separate certificates.
* Private keys for the encryption cert come from the CA.
* Sensitive fields are encrypted with the encryption certificate.
* The message body is signed and the signature appended at the tail of the message.
* The network publishes its signing verification cert to all institutions, and loads the verification certs of every participant.

![certificate usage](https://img.iami.xyz/images/181fb0b4dbaa4f19eac85444acd4bd7606ebe77d3d23e94f17279c17bf2acdb7.png)

The rest of the flow is in the diagram. Beyond this, other things worth watching include: how certificates are used on cards themselves (anti-counterfeit); how certificate-based auth is applied to operational back-office login; and how hardware key injection guarantees the private key never leaves the secure boundary.

## 2. Symmetric keys and traditional card-present transactions

If you just want the shape:

![MMK Delivery and how encrypted](https://img.iami.xyz/images/4376c43dceba8acf977e9c2baee77ec973f86b75ae3c9a8f50cfbe54b51f4440.png)

For the detail:

* Generate the symmetric master key inside the HSM and courier it out as **key envelopes** (split components delivered separately to different recipients).
* On the receiving side, two or three envelope components are combined and imported into the receiver's HSM, protected by the receiver's own master key.
* Both sides then replicate the key across their respective HSM clusters.
* Working keys — **data keys** including a MAC key and a PIN key — are derived from the master key and used to encrypt payloads and generate MACs (HMAC).
* Depending on the agreed padding, either specific ISO 8583 fields are encrypted or the full message is encrypted.
* The receiver validates the message against the MAC.
* At the scheme, incoming acquirer-side traffic is decrypted, and on the outbound leg re-encrypted with the pre-shared key the issuer holds.

![symmetric Key usage](https://img.iami.xyz/images/29db0e3627b96b75c26a8f7616d33327db1fde478ed75fc3e559c217019e6bd9.png)

Other things worth digging into: hybrid encryption (using an asymmetric key to wrap a one-time symmetric key), PGP-based file exchange, and — importantly — using **TR-31 Key Blocks** to bind usage constraints to the key itself and to synchronize keys more safely. TR-31 background: [ANSI X9.143-2022](https://webstore.ansi.org/standards/ASCX9/ansix91432022).


# 0x04 Operations

I've written before that traditional finance leans heavily on process and operations to achieve safety and stability. Clearing networks take this to another level — the reliance on established processes is deeply, structurally baked in. With a limited number of network participants, the whole thing operates at a "well, it works, doesn't it?" level. Someone will say: with only a few dozen connected institutions, why bother with DNS when you can just hard-code all the IPs? The reasoning is even sort of plausible. Just keep the spreadsheet up to date, right?

## 1. From institution onboarding

<!-- Start from the process controls during onboarding, and use them to talk about how operations shape security in this business. -->

Whether it's the key distribution or certificate exchange in the previous section, or leased-line provisioning — all of this happens for the first time when an institution onboards to a clearing network. (Ongoing rotation is covered in the next subsection.)

* **Qualification review and agreement signing**: the onboarding institution supplies license and compliance documentation — e.g. proof of relevant business licenses, AML controls in place.
* **Key resource allocation and configuration**: everything from applying for an institution code (the unique identifier inside the clearing network), to card BIN application, to clearing-info config; plus permissions for key back-office platforms — merchant management, exceptions management, risk management.
* **Endorsement and certification**: terminals get certified, cards get certified, and the institution passes relevant compliance certifications (PCI-DSS, UPDSS, China's Multi-Level Protection Scheme (`等保`, MLPS — the national IT security certification regime).
* **Keys and certificates**: apply for sign/verify certificates, dual-application certificates, platform operator login certs, and more.
* **Connectivity and system integration**: physical leased-line provisioning, then offline (local) testing, online (UAT-equivalent) testing, and beta (production-like) testing.
* **Go-live**.

These are listed as steps but do not run strictly in that order. What they illustrate is how multi-department coordination and a strong ledger culture together support the whole journey from onboarding to go-live. Nearly every step needs approvals from several departments or nodes. In the normal case, five working days per step is considered *fast*. This isn't about efficiency being high — nor is it because everyone is drowning in work. It just is what it is.

## 2. Processes and exceptions

**Where there is process, there are exceptions**. Process operations do provide meaningful security controls. But process only really has jurisdiction inside a single enterprise (unless one party has extraordinary leverage over the counterparty). And when that's the case, **asymmetry of process control leads directly to asymmetry of security control — and the whole control effectively fails**. As I've written before: the network applies extremely strict key custodian procedures to courier a multi-part key envelope to institution A; the counterparty faithfully has two people receive it, then they meet up, open the envelopes together, type the components into a plaintext file, and take a photo to send to you. The review procedure is technically rigorous — the method is wrong. Which is why you should rely on **technology** for control, not process.

Day to day, **most processes lean on ledgers — Excel application forms and license photocopies get archived, physical seals ("chops") establish authority, multi-department participation dilutes accountability, self-signed declarations denote acknowledgment, and legal binding is deferred to the contract**. But you can't push too hard on this kind of process — it's not "1 is 1, 2 is 2" like an accounting entry. Every process implementation has slack, and sometimes even the necessity or effectiveness of the process is arguable. Ask yourself: do exceptions get retroactively documented after the fact? Should the participant list of a process be updated? How do you actually assess the effectiveness of a process? That said, some process designs are genuinely elegant — for instance, the failover behavior of Global Authorization Network (GAN) automatically routing data to the GAN Issuer Gateway is a nice piece of design.

## 3. Regulation and compliance

Regulation is a life-or-death line for anyone in finance. Give you an exception and you get to remediate; refuse to and things get awkward fast. This topic is heavy — I won't dig in — but a few specific regulatory programs are worth calling out for how they shape security. These aren't all "technical security"; some are process, some are money, some are both.

* **Cutting the direct connection (`断直连`)**: PBoC mandate that all third-party payment providers must connect to UnionPay or NUCC — banks and payment providers can no longer transact directly, and traffic between banks (including city clearing / rural credit clearing members) and payment providers no longer counts against banks' internal, UnionPay's, or the rural credit clearing systems' business volume. This was the 2017–2018 restructuring that gave NUCC its reason for being.
* **Commercial cryptography migration (`商密改造`)**: migrating symmetric and asymmetric primitives to Chinese national algorithms — SM4 for symmetric, SM2 for asymmetric.
* **Merchant information reporting**: third-party payment providers must report merchant info.
* **Transactional personal-privacy data protection**: encrypting sensitive fields in ISO 8583 and XML messages.

Beyond these, there are industry-specific compliance regimes:
* PCI-DSS-driven Key Block migration requirements.
* JR/T (`金融行业标准`, financial-industry standard) annual light audit, triennial deep audit.
* Cross-border data transfer security assessment.

Plus assorted requirements from other regulators — the "three-high, one-weak" risk sweep, cyber-drill exercises (`护网`), and so on. And ongoing legislative work — the [recent draft revision of the Cybersecurity Law](https://www.cac.gov.cn/2025-03/28/c_1744779434867328.htm), the [draft Bank Card Clearing Institution Management Measures](http://images.policy.mofcom.gov.cn/file/20250102/40551735783217520.pdf). Historically there were also cross-holding projects between NUCC and UnionPay where each held minimal counterparty-side systems, providing baseline resilience for the country's financial infrastructure (from what I've heard).


# 0x05 Wrap-up

**On card schemes**, I originally wanted to close by comparing AMEX, Visa, and Mastercard along several axes — business model, security, documentation quality, onboarding & testing experience, developer friendliness, and value-added ecosystem services. Too much to fit in one article, so I dropped it. But I did put together a business-model comparison of the three (the diagram is compiled from public sources) and will comment briefly based on personal impression.

![business model amex vs mastercard vs visa](https://img.iami.xyz/images/f81aede92f9c504779321f3bf196eb6ac8d739edaf14d619a1b73088c7eed8d7.png)

The takeaway that matters most for security teams: in a clearing network, **the security function can demonstrate business value through value-added services**. Mastercard has leaned into this the hardest, and it shows — 17% YoY growth in value-added services revenue, contributing to overall revenue at the $28B scale. Meanwhile, Mastercard's China JV with NUCC (`万事网联`) and AMEX's JV with Lianlian on top of UnionPay (via UnionPay International) mean the technology stacks converge from multiple directions. NUCC has a "second mover" advantage architecturally, while UnionPay International (UPI) tracks international standards more closely and reflects newer requirements back into UnionPay proper. From a documentation perspective, I personally prefer Visa's and Mastercard's style — especially Mastercard's engineering blog. Both have solid developer portals. For process learning material, AMEX's docs are the best of the three. On specs vs. business ops docs, it's hard to tell what's been API-Gateway-fied from the outside, but AMEX's GNS and Visa's VisaNet look like they've evolved toward API-Gateway shapes. On connectivity: foreign schemes are more relaxed about IPsec than domestic ones.

**On cross-border payments**, for third-party payment platforms, the funds usually move through a **correspondent banking** chain. For clearing networks / card schemes, there's another option: routing transaction info through a **localized clearing center**. Foreign-card-domestic-use and domestic-card-foreign-use are the two sides. A domestic bank's card getting acquired by AMEX's Global network is routed through the network conversion (that single-vs-dual-message conversion from earlier) back to the domestic network, then delivered to the issuing bank. Vice versa. On the wholesale side, watch what's happening with CBDCs.

**On JV entities**, JVs are like the rapeseed fields at a scenic spot — the brand looks great from the road, but up close the field is riddled with weeds. And when you finally see a real farmer's rapeseed patch, it hits you: skinny stalks, few seeds. It's fine — the JVs only need to serve as a storefront to bring visitors in.

**On technology trends**, "crypto agility" has been talked about for years and is finally getting real. When certificate lifetimes drop toward ~40 days, everything gets forced into automation whether you liked it or not. On China's domestic tech-substitution push, what matters most is building a real ecosystem and high-quality supporting services around it — you can play a domestic game, but the goal shouldn't be a walled garden. The goal should be to be internationally interoperable, ideally better than the international baseline.

I first tried to write this in February 2024. Every time I sat down I felt I was missing too much context and went back to studying. I started summarizing pieces every few months, but still couldn't write the piece I wanted. Early this year I re-organized the material, deliberately restricted the lens to "look at security from a whole-system perspective," and finally picked it up again on March 25, 2025 — finishing today (2025-04-05). Given the limits of what I know, if anything is off, corrections welcome at **ZnpAY2lzby5jaGF0** (Base64). One last note: the sequence diagrams were drafted by hand first, then generated as PlantUML by AI from my prose description, then adjusted and rendered. PlantUML source is [here](https://gist.github.com/mylamour/060707806ab98f5052cea9c36c1e84c9). Faster overall — though AI still routinely mis-orders participants or corrupts flow steps in the middle.


# Appendix: References

* [Licensed bank card clearing institutions (PBoC)](http://www.pbc.gov.cn/zhengwugongkai/4081330/4081344/4081407/4081702/4081752/4081796/index.html)
* [Licensed non-bank payment institutions (PBoC)](http://www.pbc.gov.cn/zhengwugongkai/4081330/4081344/4081407/4081702/4081749/4081783/9398ddc0/index1.html)
* [Bank Card Clearing Institution Management Measures (2017)](http://www.pbc.gov.cn/zhifujiesuansi/128525/128535/128623/3301219/2017050409262886703.pdf)
* [Bank Card Clearing Institution Management Measures — draft revision (2024)](http://images.policy.mofcom.gov.cn/file/20250102/40551735783217520.pdf)
* [PBoC Order No. 1 (2021) — Non-bank Payment Institution Client Reserve Fund Custody Measures](http://www.pbc.gov.cn/tiaofasi/144941/144957/4168458/index.html)
* [PBoC: 2024 Payment System Report](http://www.pbc.gov.cn/zhifujiesuansi/128525/128545/128643/5589365/2025021417373037368.pdf)
* [BIS Working Papers No 1178: Finternet — the financial system for the future](https://www.bis.org/publ/work1178.htm)
* [Stripe: Introduction to online payments](https://stripe.com/en/guides/introduction-to-online-payments)
* [Stripe: Guide to managing network costs](https://stripe.com/en/guides/guide-to-managing-network-costs)
* [Stripe: Card authorization explained](https://stripe.com/en-it/resources/more/card-authorization-explained)
* [ECB: The Payment System — Payments, Securities and Derivatives, and the Role of the Eurosystem (Tom Kokkola, Sept 2010)](https://www.ecb.europa.eu/pub/pdf/other/paymentsystem201009en.pdf)
* [Visa: Beyond the Acquirer — Additional Visa Acceptance Entities](https://usa.visa.com/dam/VCOM/global/support-legal/documents/visa-acceptance-entities.pdf)
* [Mastercard: Glossary of payment terms](https://www.mastercardservices.com/en/advisors/payments-consulting/insights/glossary-payment-terms)
* [ISO 20022](https://www.iso20022.org/)
* [Huawei: latest AI data center network architecture (Chinese)](https://mp.weixin.qq.com/s/ItcnOkB1f_H-0gPiFSjzMg)
* [UB-Mesh: a Hierarchically Localized nD-FullMesh Datacenter Network Architecture](https://arxiv.org/pdf/2503.20377)
* [Reflections on financial security architecture design](https://fz.cool/Finance-Tech-Security-And-Security-Principle-For-Architecture-TOGAF-C246-Notes/)
* [PlantUML source snippets](https://gist.github.com/mylamour/060707806ab98f5052cea9c36c1e84c9)
* [ANSI X9.143-2022](https://webstore.ansi.org/standards/ASCX9/ansix91432022)
* [Security architecture tag (Chinese)](https://fz.cool/tag/#%E5%AE%89%E5%85%A8%E6%9E%B6%E6%9E%84)
* [Draft revision of the PRC Cybersecurity Law (public consultation notice)](https://www.cac.gov.cn/2025-03/28/c_1744779434867328.htm)
* [Demand for security solutions boosts Mastercard's value-added services revenues 17%](https://www.pymnts.com/earnings/2024/demand-for-security-solutions-helps-mastercards-value-added-services-revenues-climb-17/)

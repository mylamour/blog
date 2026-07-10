---
layout: post
title: "Reading Notes: Advanced Guide to Internet Enterprise Security"
categories: Security Engineer
kerywords:  enterprise security internet security study reading notes zhaoyan good books
tags:  intrusion detection security architecture
translated: true
---


Overall, this book opened up my perspective quite a bit as a newcomer to the field, and it raised a bunch of questions worth thinking through — like which scenarios involve a parent process with lower privileges but a child process with higher ones. You can clearly feel that the author has both a wide strategic view of security architecture and solid depth on technical details. That combo is rare in Chinese security books. Personally, I got a lot out of it. It gave me some new angles on security architecture and intrusion detection systems. The book also points out more than once that a lot of current solutions — and products from security companies — feel like old wine in new bottles. It also notes that some emerging technologies can't fully cover today's real-world needs. Some people know this, some don't, and of those who do, most just keep quiet about it. The fact that the author is willing to say it straight out is genuinely admirable. I've always respected people who speak the truth. The book also addresses the current state of the security industry — no need to spell it out. But for some reason, the later chapters feel patched together and the quality drops noticeably. Chapters 10 and 15 in particular are, from a reader's standpoint, failures. If you're calling something an "advanced guide," you can't pad it with filler.

Below are some thoughts I had while reading.

# Chapter 1

The scope of enterprise security seems broader than most people think:
* Network security
* Platform and business security
* Information security
* IT risk management, IT audit & internal controls
* Business Continuity Management (BCM)
* Security brand marketing and channel maintenance

# Chapter 2:

* Keep peace and love — slow down when you're looking at a chaotic JD, talk it through first to understand what's really going on.
* The security maturity of geek startups, early-stage companies, SMBs, and large enterprises are all going to be different. And even within a single company, the security posture at each growth stage is different.
* Do the baseline work upfront. New servers need to be validated before going live; retrofit intrusion detection gradually on older ones. Once you've taken care of basic security (roughly 10% of your effort), put some real effort into business security and start producing new results. Focus areas include anti-scraping, account security, etc. — priorities vary by industry. After that, focus on tooling automation and process automation.

# Chapter 3

* Management is initially driven by incidents and by organizational mandate.
* For security work centered on web products: one, the cost of post-hoc fixes is relatively low; two, some products have short lifecycles anyway.
* Looks like STRIDE is a widely used method — glad I read *Threat Modeling* beforehand. I remember someone saying: if you want to really learn something, go buy all the books in that domain and read them.

TODO:
- [ ] Standards to study: ITIL (BS15000/ISO20000)
- [ ] Standards to study: ISO27001

Questions a CSO faces:
How do you push security policies through?
How do you gain recognition and credibility?
How should you think about SDL? What stops it from actually being implemented?

# Chapter 4

* OWASP rose to prominence because firewalls, like underwear, serve to consolidate ports and act as netfilter. Once everything funnels through port 80, attacks targeting HTTP applications naturally become the primary defense focus. You can also think of WAF as a Layer 7 traffic-scrubbing NIDS device.
* When a complex production network has thousands of servers spread across IDCs around the world, each owned by different SAs — security teams should think ahead: what's the gap between the logical architecture and the deployment architecture? And who organizationally owns the assets in the current setup?

# Chapter 5

This chapter covers some foundational principles in security architecture.
* Defense in depth starts by dividing the network into domains based on business tiers, then further splitting hosts with the same security level into new security zones. At the database layer (which may be business-agnostic), you create additional security zones.
* When designing controlled access paths into production machines, beyond the network segmentation considerations, you also need to think about the special tools that different user roles use. For example, DevOps might use automated deployment tools — what kind of access restrictions should you put on those?
* When building layered threat defenses, consider where a given risk appears at each layer, and what different risks exist at each layer.
* Adversarial competition isn't just technical — it's also operational, intelligence-gathering, and more.
* An architecture proposal should have at least three options (A, B, C), so you have meaningful disaster recovery alternatives.
* Security domain isolation is primarily a business-layer concern; data link layer isolation is a network-layer concern; port filtering sits between network layer and host layer — it's more concrete and specific.

Key considerations:
* Defense scalability and horizontal elasticity. In today's cloud environments, how does security self-adapt as services scale out?
* High-performance detection with low performance overhead.
* Business transparency — reduce coupling in the architecture. (The sidecar/transparent proxy pattern pretty much fits this.)
* Cost must be controllable. For large internet companies with massive IDC footprints, how do you keep costs manageable?
* "Information silos" are a serious problem — they dramatically reduce operational efficiency.

# Chapter 6
This chapter covers technical details for baseline security operations.
* You need multi-end coordination to force data and runtime state to converge. For example, using customized images to disable certain kernel switches and forcing specific data to flow through user space.
* Network baselines, host baselines, ACL baselines, application baselines (writable but not parseable, parseable but not writable), and other infrastructure baselines (LDAP, etc.) — the key point is mapping a policy across different environments. Baselines are fundamentally management policies. Everything that changes must be under controlled change management.
* Use whitelist-based filtering against the black. Build behavior profiles for normal admins and ops staff, train offline models to detect anomalies.

TODO:
- [ ] Put together a security baseline checklist (covering network, security group configs, system configs, app configs, SSH policies, account/password policies, etc. — attack surface reduction from multiple angles)

# Chapter 7

This chapter covers network security within enterprise security.
* Know when to Detect and when to Prevent — control and understand the latency budget you're working with. Build detection and protection around that. Whether D or P, having both with one as backup is mandatory.
* WAF deployment architectures vary: on-prem, CNAME-based, host-based, or hybrid — choose based on the situation. And rule feedback loops need to actually work.
* Building T-level DDoS defense: from ISP near-source scrubbing to CDN selection or self-built solutions. HTTP-DNS is also a reasonable option. But even if all these measures are deployed, you need to verify the availability of the corresponding call interfaces — otherwise you end up with capability that you can't actually invoke in the moment. (Ultimately, you're still mostly depending on the ISP.)

TODO:
- [ ] Common implementation options behind each type of DDoS attack. For example, which protocols are commonly amplified in reflection attacks.

# Chapter 8
This chapter covers architecture and technical details around intrusion detection — including but not limited to HIDS, NIDS, RASP, and database auditing. In other words, all of these fall under the umbrella of an intrusion detection system.

* Enterprises should adapt their intrusion detection priorities based on business characteristics — don't try to cover every possible scenario.
* Track the call chain from web layer → CGI layer → system layer to identify attack progression, i.e., focus on contextual events.
* Self-built HIDS architecture has design details I hadn't thought about before. From the start, the design needs to fit the company's own ops infrastructure — regulatory requirements, basic security needs, company-specific risk requirements, and network environment adaptability.
* Control management sometimes needs a self-destruct function. Some capabilities should lay low, reducing their exploitability.
* My earlier webshell work was text-based detection. A better approach: establish baseline behavior from business request patterns, then use that to detect anomalies for specific services.
* Architecture deployment needs to account for the company's service scale. Where a device sits in the network determines whether it can actually do its job.
* AST parsing is still a solid approach.

TODO:
- [ ] How do you accurately detect how a function change cascades into other parts of the system? For example, privilege escalation via sudo causes env field changes — how do you set up an experiment environment to capture that?
- [ ] File monitoring techniques beyond inotify?
- [ ] Technical approaches for gathering process information?
> Periodic /proc traversal
User-space Libc function hooking
LSM module interface
Kernel-space Libc function hooking

- [ ] What are the normal scenarios where a parent process has lower privileges but a child process has higher ones?
- [ ] How do you build detection strategies specifically for worms and botnets, with some containment capability?

# Chapter 8

This chapter covers vulnerability scanning, and of course mentions big data applications here too.

* Start with port scanning and high-risk port monitoring — ACL scans should happen daily.
* For system and application scanning, you don't have to rely entirely on network scanners.
* Vuln scanners can also serve as a way to enrich your asset inventory.
* Reducing the network overhead of vuln scanning is important — and you should also reduce scanning tasks overall. Everything should follow priority and urgency.

# Chapter 9

Not very familiar with mobile security, so not much to say here. The writing felt fairly mediocre too.

# Chapter 10

This chapter is even thinner — basically just an intro to the open-source static analysis tool Coverity. Reference: https://scan.coverity.com

# Chapter 11

This chapter covers corporate network (office network) security.

* Set different security policies for different types of employees — this avoids pushback from different user groups. What policy do you give engineering? What about ops? Marketing?

# Chapter 12

Also about office network security. The quality drop in the later chapters is pretty noticeable.

* Pay attention to the characteristics of different user groups and adjust policies accordingly. Engineers love freedom, operations folks don't have deep computer knowledge. Different crowds get different security controls.
* The office network needs a clear sense of what it's actually trying to defend.
* BeyondCorp doesn't mean there are literally no boundaries — Google only applied this to the office network. What it depends on is a complete authentication/authorization system and fully controlled endpoints.
* For APT, you can't just throw up your hands, but you also can't go down the rabbit hole. APT governance must consider ROI — deploying honeypots might actually be the right call.
* If money's no object, just follow Gartner and buy buy buy.
* Culture management, endpoint management (AV, DLP, remote access), security gateways, dev environment controls — all combined together.
* A lot of solutions are really just deterrence against honest mistakes, not real adversaries. Real attackers will always find a way around. You have to go hard on both the technical side and the management side.

# Chapter 13

Finally, this chapter gets into security management systems.

* Figure 13-1: Information Security Universe
* Who are security's customers? Two groups: internally, it's the sibling departments that depend on security; externally, whether you're B2C or B2B, they're all users — and they're all our customers.
* KPI reference: IT Balanced Scorecard
* You need both internal and external evaluation metrics.
> Internal metrics: coverage rate, coverage depth (e.g., SQL injection detection from code scanning → WAF → DB proxy → DB auditing), detection rate, proactive loss-prevention rate, TCO/ROI, technical progress metrics

> External metrics: offensive/defensive capability, visibility and methodology, engineering capability, business influence

* Asset management is critical — system dependency impact analysis is part of it.
* Keep things within a controllable minimum set. Have coverage before, during, and after an incident.
* Define the responsibility matrix upfront. RACI: Responsible, Accountable, Consulted, Informed. Contact person, executor, commander. Worth looking carefully at — Table 13-3 and Figure 13-5.
* Prepare playbooks in advance, have someone in command during an incident, things move in an orderly way, losses stay minimal.
* SRC needs to become an ecosystem — and this goes beyond SRC alone; internal products should also move from platform-oriented to ecosystem-oriented. Expand from one company to the whole group to the whole industry.


TODO:
- [ ] Need to read: ISMS
- [ ] BCM — Business Continuity Management
- [ ] DRP
- [ ] Business impact analysis
- [ ] Full lifecycle availability management
- [ ] Security impact isolation


# Chapter 14

This chapter is about privacy protection.
* Who has access to what resources, with what permissions, for how long.

TODO
- [ ] Some data encryption methods mentioned in the book that I'm not familiar with — need to dig into those.

# Chapter 15
# Chapter 16

From a defense-in-depth perspective, the chapter introduces multiple analytical lenses: data flow view, server view, IDC view, logical attack/defense view, etc. The idea is to tailor your approach to different IDC scales and business types. But honestly, breaking all of this into actual paragraphs and writing it coherently is genuinely hard.

# Chapter 17

Getting the basics right defends against most attacks. In the early stages of building out defenses, put 80% of your effort here. Once you have a foundation, move into systematic construction — multiple products forming a solution ecosystem. Maybe eventually you'll have capacity to invest in homegrown tools. Finally, start paying full attention to SDL. Even after all of that, you're probably at 60–80 points. Then you need to clean up the gray areas: missed assets, missed systems, bugs introduced by changes, new ACL gaps, weak passwords, and so on.

Next up is building solid incident response capability with multi-vector containment. From organizational structure to process to technical execution — everyone should know their role, follow a process, and use the right tools to get the job done. Speed is everything. Fast detection, fast response, fast resolution.

Ongoing operations consume 80%+ of the effort across a security team's entire existence. Operations is what keeps things working. But operations isn't just pure operations — you also need to keep pushing technical depth. From single-point intrusion detection to large-scale intrusion detection, reducing the flood of alerts (seriously, who's going to read a huge pile of noise?), and closing the risk loop so you can sustain operations continuously.

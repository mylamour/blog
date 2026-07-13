---
layout: post
title: "Self-Cultivation of a Security Architect: From Principles to Practice"
description: "Six years of security architecture distilled: principles, methodology, and a practical path to building enterprise security programs that last."
categories: Security Architect
kerywords: Enterprise Security Financial Enterprise Security Architecture Design Security Architecture Data Security Security Governance Security Design Architecture Security Security Operations
tags: Security Architecture
translated: true
---

# 0x00 Preface

Six years ago I started documenting "architecture" knowledge on this blog (see [#Security Architecture tag](https://fz.cool/tag/#%E5%AE%89%E5%85%A8%E6%9E%B6%E6%9E%84)). Three years ago my thinking on enterprise security had mostly solidified (see [My Enterprise Cyber Security Architecture](https://fz.cool/MY-Enterprise-Cyber-Security-Architecture/)). Years passed — there was hesitation, there was doubt. A slow horse that keeps going still covers the distance. Today, I want to talk again about how I understand enterprise security — or put another way, what it means to me to be a security architect.

# 0x01 Security Design Principles Through Architecture Evolution

Applications went from single-machine to distributed. Architecture evolved along with them: from monolith to C/S, server-side clustering, then layered architecture, SOA, microservices, and Serverless. Some say business requirements drove architectural evolution, others say compute changes drove the technical iteration. As for what's actually behind it — you probably need to have lived through it to know. I haven't, so I'm not going to speculate. Either way, none of this is new — not in application architecture, and not in security design thinking.

Least Privilege was first articulated in the 1970s. Defense in Depth came out in the 1990s. Even Zero Trust, which Google popularized around 2010, was actually created by Dr. Stephen Paul Marsh back in 1994.

![img](https://img.iami.xyz/images/cbd5b120b872a903580352f9a4542aeb1b0c.png)
// Note: The "Application Architecture" column includes both Architecture Styles and Architecture Patterns, combined here for comparison purposes.

Setting aside the question of what's fundamentally driving tech trends — look at how programming languages evolved in parallel: from C's procedural model to C++'s object-oriented approach, then functional programming and beyond. Leaving aside early ad-hoc programming and configuration (there probably wasn't much security design thinking back then — I couldn't find evidence of it in early literature), when applications moved from monolith to C/S architecture, security design principles shifted from focusing on Isolation toward Least Privilege.

My rough read: the monolith era was mostly client programs (from a historical timeline perspective, not referring to monoliths that still exist today) — you just needed isolation. If you could open the machine, you could access it. When server-side programs appeared and the architecture became client-server, you had to think beyond isolating the server endpoint. You also had to control who could access what. That's when Least Privilege emerged as a principle — and RBAC models were created around the same time.

Similarly, Security by Default and Minimal Exposure followed for the server side. When Layered Architecture arrived, security thinking shifted toward Defense in Depth. Through SOA and microservices, the field kept building on Defense in Depth (which honestly was still sufficient). Then came cloud, containerization, cloud-native — IaaS, PaaS, SaaS, and even Serverless architecture (I once heard a risk management director claim that using serverless means you don't need to worry about application security — incredible).

As microservices scaled massively, service-to-service authentication became a hard requirement. Zero Trust finally had a realistic shot at implementation. Istio and Kubernetes on the application side, boundary products on the infrastructure side, Zscaler on the access side, and SASE on the endpoint side — the overall Zero Trust architecture managed to find some footing. Domestic replacements will be discussed later, especially the One Agent type products that keep consolidating then fragmenting again.

Back to security products — let's look at how they've supported security design principles over time. At the very beginning it was probably just manually configuring Unix file permissions to achieve isolation and Least Privilege. Then Firewall products appeared, though in hindsight those probably looked more like scripts and tools. Gradually all sorts of products emerged: from logging to SIEM, from iptables to UFW, from encryption to KMS, from Nginx WAF to RASP, and cloud-era products like CSPM. // This is based on research and inference, not personal experience. I'd love to read accounts from veterans on the vendor side.

There's an illusion that security products exploded — every vertical building specialized tools. But comparing domestic and international ecosystems, the gap is still significant. Especially in infrastructure integration and inter-product connectivity within enterprises.

## 1. From Isolation to Zero Trust

**Introducing a new security design principle doesn't mean discarding the old ones.** As application architecture evolved, the attack surface changed dramatically. In the journey from 127.0.0.1 to 0.0.0.0, business complexity grew — and neither access isolation nor permission isolation (I treat Least Privilege as another form of isolation — permission isolation — because fundamentally both are about minimizing the overlap of resources between the requesting entity and the serving entity) could fully meet security requirements anymore.

From a network perspective, if you still use firewall five-tuples for isolation, you end up with massive business-coupled rule sets that become unmaintainable — and they block "agile development." (Security at this point regularly hears: "You're blocking Production!!") From an application perspective, the inside of a microservices mesh has almost zero protection and no meaningful isolation. I heard "micro-segmentation" mentioned for a while, but before I'd even figured out what that meant, it had already quietly faded away.

Isolation is the most common security design principle. From a physical dimension: separate buildings, access control, dedicated lines, caged racks, electromagnetic shielded cabinets, hardware encryption modules. From a network dimension: VLAN, MPLS, VPN, network firewalls, iptables, ufw. In financial services, application and data isolation is typically handled first through physical and network means — which obviously creates significant ops and maintenance problems, though under a compliance-first mandate it doesn't actually stop business from running. Beyond that: authentication and authorization (SSO, MFA, RBAC), sandboxing, and virtualization for application-layer isolation; segmentation, masking, encryption (different keys, homomorphic encryption), and multi-party computation for data-layer "isolation."

When perfect isolation isn't achievable in practice, the usual pattern is a proxy design with detection and monitoring layered on top — Web firewalls, outbound proxies, email gateways, web behavior proxies, DLP, bastion hosts, and so on.

Zero Trust feels more like it's taking over from physical and network isolation at the application layer. ZTA handles: application-to-application access control, user-to-application access control, and user-to-machine access control. Software-defined security really does fit business needs better. Introduce Istio inside K8S to use mTLS for service-to-service auth and encrypted transport. With SASE, from any internet access point, after a client-side compliance check, SSO into the SASE network access point and then roam the internal network freely — use Citrix to access internal applications. The applications being accessed (including SASE and Citrix) can configure user and group authorization when integrating with the IdP, and SASE's management console can also manage user access to specific applications.

The design principles around isolation include ACL and Least Privilege. Zero Trust principles refine the authorization scenarios further and raise the bar for authentication strength. At the design pattern level, all of these are implemented through proxy, singleton, and chain-of-responsibility patterns — centralized control. Personally, even though Zero Trust does deliver more effective security controls at the application layer, you still need basic isolation as a backstop. Fundamental physical isolation, appropriate Security Zones (Zero Trust allows relaxing zone granularity somewhat) — these still matter.

## 2. From Simple Encryption to Privacy Computing

If we extend the isolation thinking: **controlling access to the key is fundamentally controlling access to the data.** Technically, this runs from symmetric encryption for data at rest (DARE — Data at Rest Encryption), to asymmetric encryption for data in transit (TLS key negotiation, Data at Transit Encryption), to the PKI infrastructure development that added entity identity verification alongside encryption requirements.

We know that even going from RSA to ECC families probably won't hold up against quantum computing attacks. Kyber's emergence signals that encryption has entered the post-quantum era. // Awkward moment — I just realized IBM Quantum Lab shut down.

Operationally, the list of disasters is long: home-brewed "encryption" algorithms, custom "SDKs," N business teams using the same fixed IV, "keys" displayed in plaintext, unequal Secret Sharing protection, certificate misuse (there are even more scenarios there), storing usernames and passwords as cookies on the frontend (I came across this in an article from 2018 while researching this piece — unbelievable), confusion between hashing and encryption. Pull on any of these threads and you end up with a trail of absurdities stretching from Root of Trust (RoT) all the way to end-to-end encryption (E2E).

The overall pattern is clear though: on the technical side, raise algorithm strength. On the operational side, protect private keys and shorten rotation cycles (for both keys and certificates). Both working together to handle encryption of data at rest and in transit.

But none of this actually solved security for data in use. Even if you use strong asymmetric algorithms to protect symmetric key generation, hybrid encryption doesn't touch ciphertext computation. Given that keys and plaintext are equally sensitive, any computation on cleartext data can't escape the key dependency. But **computing on ciphertext breaks the coupling between keys and plaintext during data use.**

Privacy computing covers a lot of ground technically, and there was a wave of publishing hype around it two years ago. For a deeper dive, see this earlier post: [Privacy Computing and Data Security](https://fz.cool/Privacy-Computing-And-Data-Security/). In practice it's still rare to see deployed, but the trajectory is clear — as compute improves and cloud adoption grows, scenarios with multiple mutually distrusting parties will only increase. Security designs that enable computation while keeping data safe will become more and more common. // This also opens another conversation: how do you weigh the cost of contractual solutions versus technical solutions?

## 3. From Security by Default to Shift Left

Not a lot more needs to be said here — the concepts are clear enough, it's just that understanding them and actually landing them are two different things. For more detail:
* [What Are We Actually Talking About When We Talk About Security by Default](https://fz.cool/Secuirty-By-Default/)
* [Did Security Actually Shift Left?](https://fz.cool/Security-Shift-To-Left/)

The arc: monolith era focused on Security by Default in configuration. As application lifecycle management came into focus, SDLC emerged. In the microservices era, agile's rapid iteration obviously surfaced a huge volume of latent issues — even with security scanning tools baked into CI/CD, new threats kept appearing. Supply chain poisoning: backdoored tools like XShell, poisoned PyPI sources, compromised Docker images. That's when Shift Left was proposed. The idea: not only achieve Security by Default, but move that capability earlier in the lifecycle. In practice, plenty of enterprises can't even get Security by Default right — let alone actually shift left. // Think about what Security by Default actually covers in your organization: which processes, which tools, which parts of the business or infrastructure has it touched? Then ask whether "shift left" is even in reach.

## 4. From Logging and Monitoring to Security Validation

Looking at basic security through the lens of design principles — isolation to Zero Trust. Application security — default-at-build-time to shift-left. Data security — simple encryption to ciphertext computation. I haven't covered operational design evolution, but since operations is unavoidable after a design lands, I'll write a bit about how I've seen security operations change.

Honestly speaking, in-house security in China's early days probably had no real security design at all. The focus was security operations — flashy, visible, something you could show off. Polished on the outside, brutal for the frontline team inside. That was my most intense period of frustration with security operations "culture" back in 2018 — everyone hyping operations, but in reality it was case-by-case firefighting and guild politics. That frustration drove me hard toward data security architecture. I'm well past that now, and my combativeness has mellowed considerably — I've come to see that even in architecture work, operations is unavoidable. See [Operations Inside Security Architecture](https://fz.cool/Operation-within-Security-Architect/) for more.

Back to the design view: enterprises started with centralized log collection (even earlier than that there probably wasn't much). Security log collection was either standalone or part of standard infrastructure. No concept of data analytics or automation yet. SIEM products emerged, features kept growing — scenario-based analysis, automated response, SOPs for handling, external process documentation. This was the transition from manual to automated, and it also created the organizational need for SOC-type teams. SOC teams were then asked to be metrics-driven: alert volume reduction, intrusion detection rate, time-to-respond, dashboards, IM notifications. Then came SOAR as a commercial product category, moving away from hand-maintained custom scripts — which I think is better from a platform management perspective. The product arc goes: SIEM → SOAR → BAS (though I'm not sure BAS fully qualifies, since security validation can also be implemented through custom SOAR scripts). The overall trajectory is: security operations gradually automated, and security design getting validated through it. Because there are plenty of blind spots in how designs land — daily operations output is what calibrates the design. Which also opens another topic: you can trust the team but not fully trust what operations delivers.

# 0x02 Key Balancing Acts in Architecture Governance

When pursuing Business Goals, how you balance Management, Operations, and Technology determines whether an enterprise grows or stagnates. Within Technology, finding the right equilibrium between IT and Business is equally critical. And nesting inside that: implementing Technology requires you to balance Management and Operations difficulty again — it's turtles all the way down.

![img](https://img.iami.xyz/images/488584a24e39ee0561e012abc7f6517bf46d.gif)

Given the scope of what could be covered, this section uses a series of questions to discuss key balance points in architecture governance — instead of letting "balance" recurse infinitely. None of these questions have an objectively correct answer. Who is the decision maker? Who chooses between operational cost, security protection, and high performance? Architecture, to a large degree, is the art of balancing trade-offs.

## 1. Where's the Baseline?

The baseline sets the floor — but landing a baseline can't be done through technical means alone. It has to be aligned with business context and implemented jointly through process, policy, and platform tooling. From an accountability standpoint, to care about who breaks the baseline, you first need to establish who the last gatekeeper is. Is it the process and policy? A key role? Automated platform tooling?

When process comes first with tooling as support, the last gatekeeper in an exception approval flow is whoever sits at the final approval node. When business comes first, the gatekeeper is the process and policy itself — remember it's not Person X obstructing Person Y, it's the process that's there. Though the human enforcing it is still in the loop. And yes, sometimes you end up making way for business needs. But some baselines can be compromised, and others absolutely cannot. Whitelisting externally-exposed endpoints? Negotiable. Using wildcard certificates? Negotiable. Using HTTP? Non-starter.

## 2. How Deep Is Deep Enough?

Defense in Depth and Zero Trust are rarely fully deployed. Gaps in understanding, gaps in tooling (vendor products may be technically solid but weak on infrastructure integration). Take isolation, for example — from physical to application to data, there are different approaches at each layer. Do you need separate badge access? Separate electromagnetic enclosures? Hardware HSMs? Dedicated lines, or just IP allowlists?

And for end-to-end Zero Trust — what does that actually look like? How do you protect the client endpoint? The network edge? The application layer? Application-to-application? On the data side: how is encryption handled? What if you don't trust the communication path? What if you don't trust storage either? What if you don't even trust the cloud KMS? For all of these, technical solutions exist. But how do you balance High Performance and Cost Efficiency? Can you introduce TEE into K8S? What if it triggers a regulatory policy? Should you drop the depth requirement?

And going back to what was said earlier: is data flow ensured by contract really that much worse than privacy computing? In what scenarios can process and policy compensate for technical gaps? When does platform tooling become truly necessary? Or is "necessary" just engineers feeling righteous about their work?

Other practical questions: How do you gate deployments without killing business iteration velocity? For vulnerability operations — what additional dimensions should you factor in beyond a CVSS 9 score in your specific environment? When someone has no maintenance window, does that turn into theater? Can we actually implement our own crypto library? Do we have the capability Meta has with fizz? Should you avoid metric traps, or just obsess over ticket counts and alert volumes? Do you need to do due diligence on every SaaS service? Figure out what not to automate before deciding what to automate? On that last question: in practice, business teams always expect security to define automation requirements, while security wants business to first map out existing scenarios. In that back-and-forth, the only thing I can say is: whoever holds the gatekeeper position has the standing to make the call.

## 3. Where's the Cost?

Howard Schultz in *Pour Your Heart Into It* treats employees as the core asset of a company. Whether it's people or tools, cost is a reality when landing anything. A few typical cost questions I run into: When resources are short, do you do a Phase 1 and defer Phase 2? When headcount is about to close, do you just hire someone to hold the position? Should operational cost be factored into best-practice designs? Put another way — if you design a sloppy solution that makes operations miserable, whose KPI is that? Or has everyone already decided it's a win-win? Low-cost solution met the company's requirements; high incident volume keeps the operations report looking busy.

When a group of people with strong soft skills but weak hard skills gets together, the priority isn't to solve problems — it's to solve the person who found the problem. I don't want to untangle who's wrong in the cost section. But you shouldn't just run on human batteries and process under "good enough, it still works" thinking, endlessly making do and compromising.

# 0x03 Self-Cultivation of a Security Architect

One day I got complained about. Another day I got complained about again. I showed my boss the chat logs, and he said: **"See — the reason you keep getting complained about is that you don't know why you're getting complained about."** Later I taped a note at my desk that said "Think Three Times Before Acting." My boss started calling me "Think Three Times, Then Still Don't Act."

There's a quote from *Renjian Cihua* about three stages a person must pass through in life: "Last night's west wind withered the green trees; I climbed alone to the high tower, gazing out to the horizon's end." Then: "The belt loosens gradually, but I have no regret — I've grown thin with longing." And finally: "I searched for her a thousand times in the crowd; turning back, there she was — in the dim light where lanterns glow."

Borrowing those three as frames: climbing alone to the high tower — is it cold? Belt loosening, still no regret — any regrets? Turning back — is she still there?

## 1. Climbing Alone to the High Tower — Is It Cold?

Four years ago I was taught: "Focus on the work, not the people. Stay technical, manage your emotions. If you have communication skills, experience, and technical ability — any two of the three is enough to keep growing well." Over the past year, my boss taught me: "Protect what matters most to you deep inside. Don't expect others to hold themselves to your same standards. Keep grinding. Just Do It Later." Two months ago I stopped the pendulum swinging in my head, and wrote a piece to mark that passage.

Climbing alone to the high tower — yes, it's cold. But you have to be able to bear the cold. If there are others on the same path, the road ahead isn't as hard.

**a. Can architecture design actually drive security?**

Dr. Werner Vogels (AWS CTO) said at this year's re:Invent: "Everything starts with security." So what does it take to start with security? Speaking from my own experience: I've rarely had a strong sense of "Security by Design" during forward design phases. What I've seen far more of is the cascade of problems from failed designs — which made me realize that if you want to maintain "Starts With Security," it must be "Starts With Security by Design."

A different way to ask the question: do frameworks help? Does experience matter? Because good design is necessarily built on best practices. And per Tesler's Law (Law of Conservation of Complexity): **for any system, there's a level of complexity that cannot be reduced — intrinsic complexity can only be shifted and balanced through product design.** Managing that complexity shift requires doing system design upfront, taking the full view, and building on accumulated experience.

And ultimately: if you as the architect don't believe in the value of architecture design, what standing do you have to be doing it?

**b. How to think about the latest security trends?**

Once you've already deployed leading-edge designs and they've been running stably for a while, then explore and experiment with the so-called new trends. For very traditional industries, you don't necessarily need to track every shift — sometimes you can leapfrog directly when the time is right, even if you skipped some intermediate steps.

**c. How to see the big picture as scale grows?**

Design simply, account for complex deployment, build resilience into the architecture (requires technical depth), and think through a rich range of scenarios (requires business experience). Per Kidlin's Law: **if you can clearly write out a hard problem, you've already solved half of it.** Don't worry too much about whether you can handle the scale changes ahead. Master the method, use systems thinking, and don't dismiss scenarios as absurd. Let the system analysis drive the design.

**d. Security team as a service?**

Serviceability requires that the team have Visibility — the ability to externally offer the team's internal security product capabilities. But "service" shouldn't mean using people as the unit of consumption. It needs platform and tooling support. If it doesn't, the security team isn't yet ready for serviceability.

**e. What can a Security Architecture team actually do?**

Deliver training to Security BPs, PMs, and peer teams. Write policies and strategies. Do architecture design (overall security architecture and individual product solution design). Run architecture reviews. Provide security consulting and other security services.

<!-- **How does design get implemented?** -->
<!-- **How should a security architect develop?** -->

## 2. Belt Loosening — Any Regrets?

In the poem, the loosening belt signals the person wasting away. I'd rather widen the belt — adding layers. A friend and I once discussed career growth and landed on: "If you're lucky enough to work in a field you genuinely care about and grow within it, that's real fortune." As it happened, working in security turned out to be exactly that for me.

Looking back at the security architecture series I've written over the years, I started from device operations and maintenance, gradually touched different security product solution architectures, and eventually got to overall security architecture. Along the way I came to understand that "technology-driven" should never be an empty slogan. When no one else is paying attention to outcomes, someone has to stand up and do their job. When no one cares about the results of the security program, the security architect has to be that person. That's not just the role — it's professional integrity.

Three directions I'm continuing to push on:

**Communication and Collaboration:**
Follow Senior Leadership and learn from them. Take what I've learned from books about communication and emotional management and actually practice it — turn the sticky notes in front of me into genuine internal reflection, until the day I take them down. Always give a stranger one chance at trust, so we can build mutual trust and mutual respect together. But once lost, there's no rebuilding it.

**Project Experience:** No shortcuts — read more, learn more, practice more, summarize more. When working with people who don't have a technical background, always work to explain things in terms they can actually understand.

**Technical Shifts:** Even though I have a handle on the overall design and individual product solutions, I'm starting to notice that I can no longer hold every technical detail with full confidence. I've seen how some people handle this situation — not a method I'd recommend, but it's a no-blame approach. My own choice: use systems thinking to analyze quickly and transfer analogies across domains. And maintain genuine humility, trusting people who are more specialized than I am.

## 3. Turning Back — Is She Still There?

Five years later. Even though I feel like I've lost some sharpness, and I think I've become softer in both technical discussions and communication — there are still people who think I'm a hothead. I don't know what kind of hothead I seemed like to the friends I made back then. When I was training myself to communicate better, all those reminders were just mottos floating in front of my eyes. I thought I'd improved — turns out I just hadn't encountered the right situation yet.

Having now been through enough situations: not every Charlie Simms has a Frank to defend them at a crossroads. Protecting the integrity at your core is genuinely hard. Even the same cut of beef, done with cold-fresh versus thaw-from-frozen, produces braised beef that tastes completely different — nothing to do with cooking time or seasoning. Not spoiled. Just different.

For the next five years: **I hope to build a solid Security Architecture & Engineering team that uses design-driven security for enterprise security programs, keeps focus on operational service quality as a continuous deliverable, and maintains the right balance between Security First, Cost Efficiency, and High Performance.**

# 0x04 Looking Ahead

Analyzing problems takes systems thinking. Imagining the future takes a bit of romanticism.

During my time learning machine learning and deep learning, I got discouraged early — I didn't understand how to design neural network layers, and I was skeptical of parameter-tuning as a discipline. Gradually I started treating ML/DL mainly as applied tools borrowed into security: CNN-based webshell classification, LSTM-enhanced WAF, and so on. The first commercial product I saw using machine learning was Radware's anti-DDoS solution. But with the rise of ChatGPT and successive B-scale parameter models, and after experimenting with prompt engineering across various scenarios myself, I've increasingly come to believe the future of security will be **AI-Powered Security.**

Especially for the functions a security architect typically provides — a significant portion of security consulting and training-type work can be handled by well-designed prompts.

![img](https://img.iami.xyz/images/288da2bf5b9c1df96137977cdd048936bb9b.jpeg)

In the diagram above I've broken prompt design into blocks ([ChatGPT: using the above prompt as an example](https://chatgpt.com/share/675ff074-b624-8008-a871-d047b78cf4a1)). The first block is base configuration — various baseline parameters. The second block is the prompt itself, broken into:
* Instructions (what role is being played, what capabilities it has)
* Input (what the user might provide in subsequent Q&A)
* Domain/Context (scenario-specific context // for something concrete like code analysis, this part works even better)
* Output (what to produce and in what format)
* Tricky (apparently adding flattery and self-deprecating language produces higher quality results)

After using this regularly, it becomes clear that a well-designed prompt for a specific scenario is not much worse than a junior security architect — and in some respects actually outperforms manual work, particularly in the draft phase where it can save significant time. The future of security architecture will rely heavily on AI. For smaller organizations the impact could be surprisingly large. By the same token, security research on AI itself will enter a new phase — **prompt jailbreak defenses, security of self-hosted models, training data poisoning** — a whole new architecture domain. Google's SAIF framework is an early example of this.

# 0x05 Wrap-Up

Security serves business. At the architecture level, that means security architecture serves business architecture and IT architecture. But various forces prevent business and IT from aligning, and simultaneously prevent IT and security from aligning. That means at some point someone successfully avoided the best solution and picked the complement. That then generates new operational problems, which repeat the cycle.

Looking across the full arc of architectural evolution and security design evolution, the logic and lineage are clear. Almost every security problem has a technical solution — yet the technical solution is usually not what gets applied. What does that tell us?

The reason I'm writing this summary (I had originally planned to call it "My Enterprise Cyber Security Architecture II") is that over the past year I experienced a level of self-doubt about architecture work I'd never had before. For a stretch, I couldn't even convince myself. I know the solution to any problem isn't singular. I know most people don't genuinely care whether the work is good or not. But it still gets to you. The gap between design and implementation, in some environments, is bafflingly large.

One more communication story — personal experience. I put forward a proposal in an email thread. Someone skipped over my email and kept "discussing." I replied all again. Their exchange skipped my email again. On and on. By the end I was exhausted — I felt like I'd done my part, but my leadership capital from that one interaction had been completely drained, and the day felt wrecked. I don't resist learning — whether it's communication or technical. But when you find that no matter how you adjust, the situation doesn't de-escalate, only the other side gets more aggressive — there's no point continuing to back down. I'll call that state: "Think Three Times, Then Still Don't Act."

I've also entertained the thought that maybe being muddled through is fine too. But within half a day I was ashamed of myself for thinking it. In that moment I deeply questioned whether doing architecture work means anything. You assume the other person doesn't understand security. Meanwhile they're laughing at you for not understanding how people work.

Between simple design and complex implementation, as an architect, the training never stops. Stay humble, avoid arrogance. A friend put it well: "Sometimes architects do things that feel clever in the moment but turn out not to matter much." He called it **"architectural juggling"** — I use that to remind myself not to juggle. And finally: right before leaving the office one day, I asked my boss what a Business-Driven report looks like. He smiled 🤷: "Did you save the company money? Did you make the company money?" I figured it out later — **for a commercial company, business activity that doesn't aim at profit is considered to have drifted from the company's fundamental purpose and reason for existing.**

> "there is one and only one social responsibility of business—to use its resources and engage in activities designed to increase its profits so long as it stays within the rules of the game, which is to say, engages in open and free competition without deception or fraud." —— Milton Friedman

// Outline drafted in October, writing started December 9, finished today. Found another draft from April on payment architecture. Two books still unread from this year's plan. Time really doesn't wait for anyone — nostalgia is one of the signs of getting old.

# Appendix: References
* [Dr. Werner Vogels Blog: Tech predictions for 2025 and beyond](https://www.allthingsdistributed.com/2024/12/tech-predictions-for-2025-and-beyond.html)
* [Post-quantum readiness for TLS at Meta](https://engineering.fb.com/2024/05/22/security/post-quantum-readiness-tls-pqr-meta/)
* [Software Architecture and Design](https://learn.microsoft.com/en-us/previous-versions/msp-n-p/ee658093(v=pandp.10))
* [Azure Architecture Center: Architecture styles](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/)
* [Shor's algorithm](https://www.qutube.nl/quantum-algorithms/shors-algorithm)
* [Privacy Computing and Data Security](https://fz.cool/Privacy-Computing-And-Data-Security/)
* [Applied Cryptography and Crypto Infrastructure](https://fz.cool/Applied-Cryptography-And-Crypto-Infrastructure/)
* [My Enterprise Cyber Security Architecture](https://fz.cool/MY-Enterprise-Cyber-Security-Architecture/)
* [What Are We Actually Talking About When We Talk About Security by Default](https://fz.cool/Secuirty-By-Default/)
* [Did Security Actually Shift Left?](https://fz.cool/Security-Shift-To-Left/)
* [Data Security Architecture Summary and Case Studies](https://fz.cool/Data-Security-And-Archtecture-Selected/)
* [Network and Cloud Security Architecture Design Summary](https://fz.cool/Summary-Of-Network-And-Cloud-Security-Architecture-Design/)
* [Modern SDLC and Security Architecture Review](https://fz.cool/Modern-SDLC-and-Security-Architecture-Review/)
* [Operations Inside Security Architecture](https://fz.cool/Operation-within-Security-Architect/)
* [A Friedman doctrine — The Social Responsibility of Business Is to Increase Its Profits](https://www.nytimes.com/1970/09/13/archives/a-friedman-doctrine-the-social-responsibility-of-business-is-to.html)
* [Confidential Kubernetes: Use Confidential Virtual Machines and Enclaves to improve your cluster security](https://kubernetes.io/blog/2023/07/06/confidential-kubernetes/)
* [Law of conservation of complexity](https://en.wikipedia.org/wiki/Law_of_conservation_of_complexity)
* [You cannot KEEP it simple, if it's already complex!](https://blogg.knowit.no/make-it-simple-stupid)
* [Book recommendation on emotional management: The Elephant Behind the Mosquito](https://book.douban.com/subject/36683853/)
* [Google's Secure AI Framework](https://safety.google/intl/en_us/cybersecurity-advancements/saif/)

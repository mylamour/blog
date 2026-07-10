---
layout: post
title: A Casual Take on Anti-Intrusion
categories: Security Engineer
kerywords: Security Thinking Reflection Security Architecture Security Innovation Summary Anti-Intrusion Security Operations Chaos Security Enterprise Security Anti-Intrusions Enterprise Security
tags: Intrusion Detection and Anti-Intrusion Security Operations
translated: true
---

# Preface

In my last post I said I might be breaking through a bottleneck, and that I'd probably hit a new one right after. Then I realized that wasn't quite right — looks like last time was just the seed sprouting, and now it's actually bloomed.

This post takes a casual look at how to build an anti-intrusion program.

# Principles

There's this concept of Dao-Shu-Qi — the direction of governance, the methods, and the tools you rely on. Think of it like driving somewhere: the direction is where you're headed, the method is how you drive, and the tool is the vehicle itself. For anti-intrusion, you can sum it all up in one sentence: use security products to Identify, Protect, Detect, Respond, and Recover — looking at both data security and product security angles. Identify and Protect are Preventive; Respond and Recover are Corrective; and then there's the Detective piece in the middle. A complete governance program moves from prevention through detection and finally to correction. And at each stage, you keep applying this same direction-method-tool model to your thinking.

![image](https://img.iami.xyz/images/59910314-3b97c580-9444-11e9-868a-0dafa6c2facc.png)


# The Direction of Governance

## Identify

Let's start with Identify — there are two kinds: **asset identification** and **risk identification**. Both exist to support defense, whether that's network-layer defense, host-layer defense, incident response, or disaster recovery after the fact. Not knowing where your assets are is like crossing a river without knowing its depth — you're flying blind. Without understanding your asset landscape, forget about building defenses. When something goes wrong you can't even estimate the blast radius, let alone do incident response or recovery. If you don't know where your assets are, how do you find them? How do you defend them?

So asset identification is step one for any enterprise anti-intrusion program — and building an asset collection system is the absolute top priority. That said, this is relative: if a company only has 10 servers, building an asset collection system is obviously a low-ROI activity. No need — you can see everything at a glance. Beyond asset identification, you've also got risk identification, which is basically threat modeling. Except here you're not doing STRIDE on a single system — you're doing it across the entire enterprise: how systems are distributed, the network environment, physical deployment, host systems, access controls, and so on. After you've identified your enterprise assets, you do unified threat modeling against the architecture and use that to drive governance decisions. So identification is step one — but building the asset system isn't necessarily the very first step (depends on company size).

## Protect

Once identification is done, you can start building out your defenses — appropriately. Why "appropriately"? Because some folks' first instinct is to jump straight to intrusion detection before they even understand their inputs and outputs. The right way to think about threat defense is defense-in-depth, not betting everything on a single layer.

When it comes to protection, there are two angles to consider: **products** and **data**. Before data security was taken seriously, defense conversations were mostly centered on SDL. Let's start from the product angle. The lifecycle of a product basically looks like this:

![image](https://img.iami.xyz/images/59911833-63d4f380-9447-11e9-8bb6-97072ba86b43.png)

So you need to think about security across architecture, development, runtime, deployment, and operations. Start with a security review at the architecture stage — evaluate security from system architecture, network architecture, dependencies, and supporting infrastructure angles. Then during development, push for secure coding: train developers to have security awareness, provide secure coding guidelines and security SDKs (basically Security-by-Default libraries). By this point you've tried to ensure security at both the architecture and development levels. Once the prototype is ready and you move to the runtime stage, the pentest team does a round of attacks — web, PC, app, bug bounty, black/white-box scanning, code audits — to assess the current security posture. After you've provisionally secured things "in the shallow end," it's time to deploy and ship.

Why just "provisionally in the shallow end"? Anyone in security knows you always have to respect your adversary — you never know when a new 0day will surface. And your assessment environment can never cover every real-world user environment. Back to deployment: whether it's C/S or B/S architecture, there's always an S. At this point you need host and network security defenses. With cloud becoming the default, most companies go cloud — but does that solve most problems and let you lean on the cloud provider for security? Not necessarily. Misconfigured RBAC and bad VPC configs still create new security problems. New technology solves some security problems while introducing new ones. Cloud is still the trend, but it's not magic.

And even after covering security from architecture through deployment, you're not done. Continuous operations are what keep the entire product lifecycle secure — handling external feedback, threat intel, SRC bug bounty reports, internally discovered alerts, applying host patches, and so on. Operations never stop.

Now let's look at data security. Data is a core asset — products generate data, and data makes products more valuable. From a data security lens: how do you protect data through collection, transmission, storage, processing, exchange, and destruction? It's a different mindset, though there's some overlap with SDL. One thing I learned from the data security governance approach is the idea of Management, Organization, Technology — data security emphasizes setting policy at the management level, with the organization ensuring the technology can actually execute it.

In DSMM (Data Security Maturity Model), there are 30 process domains with 5 maturity levels each. I won't go through every one, but here's a quick tour: **Collection** deals with compliance and some client-side countermeasures like unique identifiers and anti-reverse engineering. **Transmission** touches network security and application security — is the data tampered with in transit from client to server? How do you detect tampering? Is a given request a threat? **Storage** is what most people think of as the core data security piece, though it's just one process domain — you need logical storage security, media security, and backup/recovery. **Destruction** is mostly internal — whether you're doing physical wipe or hardware destruction, outsiders won't know, but the key is making sure it's thorough and unrecoverable.

That leaves **Processing** and **Exchange** — both face internal and external concerns. Internally, you need to secure the processing environment, ensure privilege separation on your data platforms, minimize what gets imported/exported, and define legitimate use (each company needs to define this based on their own business context). Externally, data must be de-identified before sharing — substitution, randomization, shifting, rounding — whatever technique you use, make sure the anonymized data can't be re-identified. The **Common Process Domains** are where data security and product security overlap the most: incident response, asset management, monitoring and auditing all live here.


## Detect

When it comes to detection, the key is being clear on **inputs** and **outputs**. Once you know both, you know what you actually want. I've seen people jump straight to "I want to build a model" or "I want to use machine learning" — sounds impressive, but it's not. Models without context, models without grounding in real data — they don't deliver much value. So **scenario-driven data models** are the right call. And models aren't even your only option (technically rules are a kind of model in the broad sense, but I'll keep them separate here). Don't dismiss rules and IOC/threat intel lists, and don't blindly trust ML/DL either. Any false positive triggering a production incident is a loss for the company.

That said, NLP and CV transfer learning is genuinely delivering good results in some areas: malicious file detection, bot traffic identification, intrusion detection — things like CNN + webshell classification, BIRCH clustering + URL pattern extraction, semi-automated penetration testing, and more.

![image](https://img.iami.xyz/images/59914572-3db25200-944d-11e9-93a2-542f113f8f7c.png)

The foundation of detection is collecting enough data — and ideally data with unique identifiers like device fingerprints or browser fingerprints. Of course, anything coming from the client side can be tampered with.

Once you've collected data, detection is fundamentally about computation and correction. You need to know: is the entity you're computing on **in a file** or **in memory**? The answer determines how you deploy. Memory-based detection can't work by uploading files to a remote service — you need to deploy at one or a few nodes in the traffic path (and if you're deploying on-device, you also need to protect the model itself against reverse engineering). File-based detection can go either way — remote detection is popular because it offloads compute from the host.

So now you know your input (the entity being computed). Next is the computation engine — your IOC lists, rule sets, models, etc. You feed in the data, run the computation, and get a result: is this a threat? There's also the real-time vs. offline question. How do you actually deploy your detection capability — real-time monitoring or offline analysis? This is where you choose between (or combine) **lists**, **rules**, and **models**. A good setup has detection capability in real-time, near-line, and offline modes: IOC filtering and rule matching in real-time, a model trained on T-1 day data doing near-line computation with results feeding back into the lists, and T-day data going into offline analysis. Then between the near-line model and the real-time rule engine comes another layer of choices: enable or disable? Auto-degrade? Can the system tune itself automatically?


## Respond and Recover

Whether you blocked the threat, missed it, or detected it in the Detection phase — either way, you need to stop the bleeding. On a timeline: pre-incident, during-incident, and post-incident.

![image](https://img.iami.xyz/images/59974662-7b47e400-95e1-11e9-8208-ed77a42bbf9c.png)

Pre-incident is mostly prevention — the defense work we already covered. Post-incident retrospectives also feed back into pre-incident prevention. During-incident, the focus is stopping internal and external threats as fast as possible and minimizing damage the moment malicious activity is detected. You need to assess the blast radius, figure out what might be at risk, and remediate. If the attack was targeted, you also need to preserve the scene and collect forensic evidence. And again — asset identification is critical. If you don't know where your assets are, you can't quickly locate affected systems, which means you can't respond or recover. A lot of post-incident recovery success also depends on what you did pre-incident — if you didn't set up disaster recovery, and your data gets corrupted, good luck recovering it.


# The Methods of Governance

We've covered the direction — what needs to be done. Now let's look at how to do it. In practice, it comes down to people. How you execute is a balancing act between individuals and the organization.

## Individual

On the individual level, it depends where you sit in the anti-intrusion program. But setting that aside, a solid security engineer should have depth in three areas: **security** knowledge itself, **engineering** ability, and **algorithmic** ability. Security knowledge is your admission ticket to this industry. Engineering skills — development and architecture — let you take a new idea and quickly prototype it, and also help you understand architectural decisions. Algorithmic ability is something most security folks are weak on, but algorithms are what turn a square wheel into a round one. People who understand algorithms can see through to the core logic behind any product.

Having these three skill sets isn't enough though — you also need to know how to demonstrate them inside a company. That means having **strategic direction** and **project management** ability. These matter a lot when you're driving projects. Sometimes you don't have to be in the weeds on everything, but you always need to know where things are heading and what the expected outcome is. (Not being in the weeds doesn't mean you don't understand the technical details — you absolutely need to know them, and you need to be able to independently build proof-of-concept implementations.)

And beyond the hard skills, projects today are rarely single-person efforts. You need the soft skills: **coordination and communication**. Knowing how to communicate and collaborate effectively is what actually moves projects forward fast.

## Enterprise

None of this works without buy-in from the organization itself. Anti-intrusion is no exception — you need enterprise support.

![image](https://img.iami.xyz/images/59978126-992a3e80-960b-11e9-96f0-2bb99ea36351.png)

Governance strategy gets set at the management level, the org structure ensures it gets executed, and the technology is what makes it happen. All the technical stuff discussed earlier falls under anti-intrusion, and the key is recognizing your specific scenarios and then applying the right governance approach to the corresponding data in each scenario.

As you build, you also want to build platform-level infrastructure:

![image](https://img.iami.xyz/images/59978754-9f6fe900-9612-11e9-95df-06c18dfac64e.png)

This is what enables the whole process to move toward automation. Most of these platform-level products are internal-facing — few are open-sourced, though some are. This is where you go from team-scale to company-scale, and eventually form an ecosystem. Things like the ASRC alliance are ecosystem plays — taking governance capabilities that existed between business units and extending them across companies, then potentially becoming industry-wide standards. DSMM, for example, started as Alibaba's internal data security best practices and may become a national standard. Going from enterprise anti-intrusion governance to setting security standards for an entire industry is a long road, and it takes both platform scale and the right opportunity.


# The Tools of Governance

We've covered the direction and the methods. Now what do you actually rely on to make it happen? Like knowing you want to drive somewhere but not having the car yet. In anti-intrusion governance, you'll inevitably depend on a lot of external tools — you can't build everything in-house.

So how do you choose?

![image](https://img.iami.xyz/images/59979125-093dc200-9616-11e9-8ec3-632fc7793ff8.png)

Build in-house? No time, no bandwidth? Buy commercial? No budget? Open source? Not confident enough to trust it? Or just outsource the whole security program to a third party? That last one is clearly not a good answer. The right choice really depends on your company's situation — whether to hire a security team, purchase commercial products, build on top of open source, or self-develop. Bottom line: what fits you best is what's best.


# Other Thoughts

I've rambled on a lot here — rewrote this over two days. Even if you do all of the above and know how to do it, you'll still hit tons of landmines that you can only discover by stepping on them. Team communication, technical execution — both have real costs that you can't ignore. Foundational security work and continuous operations are both critical parts of any anti-intrusion program.

Last weekend I participated in a campus security event organized by Clover Security. We contributed a student-version talk on anti-intrusion. It was different from this post — that one was more about painting a picture of enterprise security and the career paths within it. Results weren't great though. Then at Zhengzhou University I did a more focused talk for first-year grad students on intrusion detection combined with machine learning and deep learning. That didn't land super well either. Seems like enterprise security and anti-intrusion topics resonate better when the audience actually works at a company.

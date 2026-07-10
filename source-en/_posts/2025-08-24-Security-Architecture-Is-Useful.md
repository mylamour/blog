---
layout: post
title: Do We Really Need Security Architects?
categories: Security Architect
kerywords: enterprise security architecture design data security security governance security design OT IT security management application security
tags: security architecture security insight
translated: true
---

> This post went through several working titles — "Do You Need a Security Architect?", then "The Art of Balance in Security Architecture Design", then "A Security Architect's Venting Session", then "The Team's Deadweight — Security Architects"

## What Does a Security Architect Actually Do?

First, ask yourself: is a security architect's job just doing architecture design? From an engineering angle, a security architect needs to cover a lot of ground. At the top level: writing Policy (senior folks might also need to define Strategy), analyzing requirements, scoping, identifying gaps, building solutions. In the middle: implementation, POC and vendor selection, deployment and ops, delivery. At the bottom: security operations, alert analysis, writing SOPs, knowledge training, incident response, post-mortems. In other words, they need to be able to step into any role at any time.

From a team and project angle, a solid architect should be able to lead a project from start to finish, handle cross-team communication, coordinate competing interests from a solution perspective, get stakeholders on board, and actually drive things forward. And then follow through.

From a governance angle, they need to understand how regulatory and compliance requirements translate into technical language — meaning: whose rules are we playing by? Who's the regulator? What's the cost? What can we actually do? Where are the hard lines and where are the gray areas? How do you turn official language into something actionable inside a company? How do you fit frameworks, models, and new tech into an existing stack? Where do process and policy fill the gaps? Does this require a new product? Can we score a quick win?

![img](https://img.iami.xyz/images/8dcd3c98a5c8411c82cf7122211dc1a0.png)

Of course, that's the ideal. In practice, an architect only occupies a tiny slice of all that. They play a specific role in a specific area. Sometimes they end up doing things that have nothing to do with any of it.

## Does a Security Architect Need to Be Professional?

My answer: Yes. Not just technically, but in how they operate professionally. Whether you're running a POC or rebranded as a Business Partner, you need to actually play the role. I'm not a rigid process zealot, but I do insist on the non-negotiable checkpoints. A lot of people say "tech isn't the issue" — which usually means they've already run into a ton of technical problems. And sure, plenty of people are smarter about it: "It's not my company, why should I care? If I leave, it's not my problem anymore." No judgment on that — different positions lead to different conclusions.

On the question of whether a security architect needs to be professional, let me throw out some questions to think about:

* How do you think about and evaluate future architecture needs from a business perspective?
* How do you avoid "cost reduction + efficiency" becoming "cost reduction + embarrassment"? In a cost-cutting exercise, which things can use open source — or can everything just use open source?
* Am I building defense in depth or just defense in repetition? // turns out I was the one covering my own ears
* Where is the right balance in technical design?
* Are the goals and metrics you're setting actually achievable? How do you measure them?

> Beyond technical skills, team management really matters. If management isn't working, all the technical solutions and "collaboration" in the world mean nothing. You can rebrand roles a hundred times — from POC to BP (Business Partner) — and it's still the same thing with a different name. Sometimes what looks like a perfectly normal initiative moving smoothly forward (or maybe that's just my wishful thinking) hits a weird colleague and suddenly everything goes sideways, turning into a pile of garbage.

I've also collected some case studies that show whether technical depth actually matters. (Once you've seen all the chaos, maybe you'll understand why I care about being professional):

* Financial enterprises often refuse to put data in the cloud for various reasons, which spawned these so-called "compute-storage separation" architectures. Where exactly is the boundary? At a glance, it seems like decryption location defines the boundary. But then: how do you determine that boundary? Can you use memory dumps to check if memory is secure? Should you require vendors in cloud environments to provide documentation on key security — on top of keeping customer data in the IDC? Does that mean bringing in TPM? Two-level or three-level key hierarchies? Do you need key components? For key distribution and verification, do you need keyblock and padding mode requirements? GCM or CBC? What if the business doesn't support it?
* Financial enterprises also work hard to keep PII out of places it shouldn't be — like logs. So what's the solution: upgrade a shared SDK to handle unified log desensitization? Process all middleware that emits logs and run everything through a rule engine? Go through all the code, run some regex, package a new release?
* Lately every vendor wants to do ALL-IN-ONE, everyone's jumping on the same bandwagon. The pitch sounds good, but how do you actually use it? XDR can push baselines, but what about UEM? Here's a real problem: overlapping features. How do you make sure a setting only lives in one place? You've got Proxy wanting to decrypt traffic, DLP wanting to decrypt traffic, SASE wanting to decrypt traffic. And then you've also committed to M365 as your ecosystem (setting aside the enormous pain of domestic vs. international version differences). How do you integrate third-party products? You want Conditional Access to trigger two-step verification in one place — but what about Entra? One product needs a blocklist, another does too, and suddenly you've got a pile of products trying to run simultaneously.
* Cloud and SaaS adoption is also a selection trend. If all my vendors only offer SaaS products, what controls can I actually implement beyond contract clauses, procurement requirements, and third-party certifications?

In all these scenarios, it's not just about identifying problems technically and proposing solutions — it also tests whether you have the mental resilience to step back when you need to. I bet most people have had the thought: "It's not like it won't work." But don't give up before you've even started. Sometimes you know a decision isn't yours to make, but you shouldn't surrender before you've even tried.

I hate being unprofessional, so I often doubt myself. If it's an environment problem, don't drain yourself over it — it's not you. In whatever position you're in, just do your job well. Sometimes I hear some real circular nonsense and almost have to laugh. For example: "The feature can definitely be implemented, but it might affect performance." But if you actually follow up — asking when it can be done and how much performance degradation to expect compared to the original — suddenly you're the difficult one, the jerk who doesn't know how to read the room. Doesn't matter your tone, your attitude, or your intentions.

## Does Your Team Need a Security Architect?

> This role seems like it can help you get better, but can't stop you from getting worse.

I genuinely can't answer this — it's a question for the bosses. Small companies probably don't have a security architect and wouldn't hire one separately. A single security engineer covers operations and maintenance. There's no point dreaming about comprehensive policies or procedures — getting a basic SOP off the ground is already a miracle. Meanwhile, just staying alive as a company is the real win. Forget about budget — beyond the things you absolutely have to buy, everything is open source. Documentation accumulates depending on luck. For B2B companies, besides getting a security certification from a third party for sales purposes, there's basically nothing else. As the team grows to 3–5 people, it means the company has gone from noticing security to actually paying for it — but in practice, nothing really changes. A few people rotate through operations products, handle attacks, process alerts. Management buys some peace of mind. At 5–10 people, compliance starts coming into focus — there's investment in certifications like Level 3 Protection and ISO 27001, dedicated roles start appearing. But behind a professional compliance program, you often don't need a dedicated compliance team. A solid project manager can pull it off — just collect the right materials. Of course, actually finding a professional with a security project management background is like finding a needle in a haystack. Open source products still require in-house deployment and operational expertise. In-house development isn't necessarily cheaper than commercial procurement, but it fits internal customization needs better. And pure vendor outsourcing management? What can you really get out of that? In many foreign companies, it's just a middleman plus a vendor service and that's it. I used to think engineers needed to deeply understand their products — then I worked at a company where there were more Directors than engineers, and watched how the Proxy model actually ran. Sometimes I think a few real estate brokers could do just as well. At least they'd have a clear understanding of their scope and know where the boundaries are. Of course, when there are people like that in the team, a security architect isn't really needed anymore — because no one can save it at that point.

So the question is: when you feel operational standards are too low? When you feel the products aren't working? When you've spent a lot of money and ended up with a pile of junk? When you've hired a lot of people but the ticket backlog is still choking everyone? When you thought you bought advanced products but alerts and incidents keep piling up? Maybe a budget of 10M RMB isn't huge, but it's not small either — so why does the security posture keep deteriorating? From a budget efficiency, operational effectiveness, and architectural vision standpoint, do you need a security architect? Internally I think you desperately need a professional architect with real leadership to make sweeping changes. But I'm not the boss, so I can't answer the question.

Looking back, is there a strong barrier to entry for security architecture work? Maybe not. Feed AI enough context and it seems like nothing is unsolvable. Especially when no one cares about quality, why not just use AI? And it's not like human judgment is so much better — biases toward certain vendors, fear of the unknown, and so on. Sometimes I feel like I don't really need to be on the current team, because I'm not contributing to cost reduction or efficiency gains at all. Less Operation, More Efficient? That's stepping on too many people's territory. Defense In Depth? Right, my "DID" is just repetition with no actual depth. Zero Trust? Not a chance — I'm practically running three separate MFA setups already. Who's going to trust me?

When I have nothing to do, I scroll LinkedIn looking at how Principal Security Architects and CISOs built their careers. I thought I was looking out a window at the world, forgetting that firefly light doesn't last long. At some point, ordinary technical practice became the entire sky as seen from the bottom of a well. If you've never seen anything else, how could you know it's real? Everyone around me looks smart, with impressive backgrounds. I'm just the one who isn't that smart.

It's tasteless to eat, yet a pity to throw away. // actually, no — not even a pity.

---
layout: post
title: Process Design and Optimization
categories: Security Architect
kerywords: security architecture enterprise security process design security governance systems thinking solutions
tags: Security Architecture
translated: true
---

# 0x01 Preface

Wind howling outside, snow flying everywhere. Nothing better to do, so I figured I'd turn part of last weekend's tech sharing session into a blog post and jot it down here.

# 0x02 The Meat of It

Whether you're building things proactively or reactively, whether you're starting from experience or top-down design — when it comes to taking strategy down to technical standards and operational procedures, the ultimate reference for getting things done is the process itself. Doesn't matter if it's admin stuff or business stuff: HR has their onboarding/offboarding/transfer flows, Finance has their accounting flows, Engineering has their release and change flows. These all start as documents that get approved, then get enforced through some platform, which is how you actually manage things. The most common platforms are things like Jira and ServiceNow — they handle Business Process Management (BPM) pretty well, and the main interface is basically tickets/work orders.

Here's a quick rundown of how to design and optimize processes from scratch. (The reactive approach usually starts from day-to-day work — **it's the process of taking best practices from experience and locking them into a repeatable pattern**. Most scenario-based SOPs are built this way.)

![build-process](https://img.iami.xyz/images/212522556-99299279-04ee-4074-9e1b-93861b3bbd3e.png)

**Requirements Analysis and Dependency Management**

* **Don't expect to nail all requirements in one shot.** When you're designing a process, you'll get requirements coming from every direction. And even after the process is live, you'll keep running into new scenarios and problems, which spawn new requirements. Optimization depends on this kind of continuous feedback loop — keep finding problems, keep fixing them. You can't expect to solve everything at once, but you should aim to design a comprehensive solution that can cover different requirements and pain points in phases as you roll it out. Don't design a new solution for every single problem — that approach creates more and more incidents over time and the whole system starts falling apart.

* **Keep dependencies updated and requirements aligned.** This comes down to how broad and frequent your communication is. Make sure all stakeholders are looped in and that requirements are moving in the same direction. You can't have one requirement saying "make information transparent" while another says "keep information siloed" — those contradict each other and can't both be satisfied. Take architecture review as an example. If you're building this process from zero, you need to account for: PMO's project management needs, Ops' resource management needs, Security's control baseline needs, Dev's iteration and release needs, Legal/Compliance's needs. And you need to make sure all these requirements roughly align on a common principle. For instance, if Security wants to gate releases on scan results to shift left and achieve security-by-default, but some teams want faster releases and want to avoid fixing vulnerabilities before shipping — that kind of conflict with the original design needs multiple rounds of conversation to reach something everyone can live with.

**Pattern Integration and System Implementation**

* **The different patterns/models distilled from experience make up what people call "best practices," and long-term best practices gradually become reference architectures.** These patterns are basically rule sets — each one is made up of individual rules. Every domain has its own patterns to follow (Domain Models). These patterns work together to form a System. In software architecture, common patterns include C/S, M/S, MVC, Pipeline, Broker, Plugin, etc. In security, Domain Models include SABSA, O-ESA, STRIDE. For enterprise architecture, there's TOGAF. When analyzing requirements and solving problems, you need to blend reference architectures from different domains — you can think of it as knowledge transfer. See the framework fusion section from my previous post for reference. The big thing to watch out for is don't come in with preconceived notions. Do multiple rounds of research and conversations in domains you're unfamiliar with.

* **System implementation means the goal can be broken down into pieces, and the implementation process is structured.** The end result of "system implementation" doesn't have to be an IT system or software — in this case it's just establishing a process. How do you break down the process? How do you combine pipeline nodes and sequence them? Through applying different patterns, you end up with the corresponding system.

![model](https://img.iami.xyz/images/212538730-e9c1a995-92ff-41a1-be18-4682a8f3d5df.gif)

At a logical level, that's roughly the thinking behind designing and optimizing a process. **It can be an actual process — like a ticket flow for production changes — or it can be a thought process for solving a problem.**

Take corporate network security governance as an example (see [A Quick Take on Endpoint Security](/end-user-computer-control-and-dlp/) for endpoint security details). Just in endpoint security alone you've got: software blacklist/whitelist enforcement flows, centralized software push flows, admin privilege revocation flows, privilege escalation flows after revocation, certificate push flows, data breach response flows, IT asset management flows, employee role change flows, and more. This involves coordination between IT and Security, plus employees across different departments with their own productivity needs. So the design questions become: how do you reflect these policies in employee conduct guidelines? How do you embed specific control points in the implementation? Who raises it, who approves it, what are the branches, who implements it, where does it get logged, where does auditing happen, where does enforcement happen? These all need to be mapped to tickets in your platform/system — turning every flow into a Ticket.

Let me use microservices security as another example to illustrate the systematic thinking and problem-solving process.

1. Requirements Analysis: solve problems X1, X2, X3
2. Dependency Management: AWS Cloud, K8S, Service Mesh, Spring Cloud. Ops team prefers XX, won't do XX. App team prefers XX, won't do XX. Security wants XX, YY.
3. Pattern Integration: existing change flows, existing release patterns, existing infrastructure, existing security management. What best practices did we reference? What are the integration points? [E.g., the security architecture and TOGAF fusion mentioned in my previous post](https://img.iami.xyz/images/210775112-b782b001-52b1-441b-ad79-1f4e2d4c0e62.png)
4. System Implementation: long-term solution at the infrastructure layer to do XXX, solves which problems. Short-term solution at the application layer to do XXX, solves which problems; the long-term solution requires steps A1, A2, A3, A4, each addressing XXX problem.

# 0x03 Wrap-up

Writing the conclusion, I suddenly realized — even though this was supposed to be about process design, it's really more about describing the process of systematic thinking. How to logically break down a problem, combine the relevant factors, then work toward a solution.

Systematic thinking does have its benefits for technical work. But sometimes I feel like being rigorous about logic also means losing a bit of naivety and the freedom to imagine things.

<!-- ![corp-security](https://img.iami.xyz/images/212540121-2d3f68e2-ec50-43cb-873a-06f1e7a74e22.png) -->

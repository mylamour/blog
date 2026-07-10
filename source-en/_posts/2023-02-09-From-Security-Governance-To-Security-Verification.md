---
layout: post
title: "Security Architecture in Practice: From Security Governance to Security Verification"
categories: Security Architect
kerywords: Security Architecture Enterprise Security Security Design Microservices Security Security Governance Security Verification
tags: Security Architecture
translated: true
---

# 0x01 Intro

Hitting a plateau is always frustrating. A while back I was planning to keep working on that CISO interview series. Then I stumbled on something a CISO said — that over his decade-plus in enterprise work, he focused on exactly one thing when doing architecture: promoting easy-to-use design frameworks that help companies be more secure. Given that I've been stuck in my own plateau for a while now, I figured I'd just sit down and write up how I think about security architecture. Call it a brain dump.

# 0x02 Main Content

Take the diagram below as a starting point. Governance and Design sit on the Logical side. Implementation and Verification sit on the Physical side. On the Logical side, Governance steers the direction of Design. On the Physical side, Verification checks the quality of what Implementation actually produced. And the feedback from the Physical side loops back to refine the details on the Logical side. Let's call this the **LSP model** for now. (lol)

![image](https://img.iami.xyz/images/217746259-1b5a9b78-b47d-4d84-a881-01f6f8c27a7f.png)

Anyway, let's use this model to walk through the inputs and outputs for each stage. See the diagram below.

A couple of things to keep in mind:
1. You'll need to fill in your own components as inputs and outputs;
2. When using a component, always check whether the required inputs actually exist;

![image](https://img.iami.xyz/images/217699918-d37356c1-c00a-4ddc-b2c7-7dbe2a2c0881.png)

1. Security governance with real top-down design almost always flows from leadership down. This means you've got leadership **support**, which gets you the **resource** you need (**support <---> resource**). That support might come from regulatory requirements (the legal angle), or from business risk exposure, or from reputational concerns (the marketing & industry angle).

   Once you have that driver, security governance will produce outputs like Security Strategy, Policy, Standards, and related documents (**these outputs should come with an Education Program so employees can actually understand them — could be training, quizzes, games, whatever works**).

   Strategy focuses on goals; Policy focuses on rules. Generally, a Strategy will also spell out principles, then break down which areas to focus on and to what extent. For example: AppSec focuses on supply chain security in 2023, data security focuses on Crypto Agility, cloud security focuses on Security Policy as Code, operations focuses on Automated Attack & Simulation, infra focuses on Beyond Dev, IAM focuses on X, and so on. Setting these goals depends on budget, internal technical maturity, risk assessments, tech trends, industry compliance, and best practices.

   A few common pitfalls here: **Don't blindly chase tech trends — pay attention to the trends in your specific industry.** **Best practices are designed for most use cases and most companies. Find the best practice for your company.** **Treat Well-Architecture as a reference, not gospel.**

2. Once you have all those strategies and standards, you can actually start doing Security Design — defining Security Controls for things like data center access control, servers, networks, storage, data, identity management, encryption, and so on. The content for these Security Controls mainly comes from the standards defined in step 1 (you can reference NIST, CIS, etc. when building them out). The key point here is **architectural integration**: security's job is to **make security controls fit the company's existing architecture** — the tech stack, the frameworks, all of it. If a system's components draw capabilities from another system (a functional module), then you need to care about how that system is designed architecturally, and work through product selection and technical evaluation to come up with new Security Solutions — how to handle logging & monitoring, integration, and so on.

   It's worth thinking about the difference between security architecture design and security solution design here. **Architecture design focuses on the overall structure and system composition. Solution design focuses on products, services, and feature specifics. The latter helps implement the former.** Following the model in the diagram, before doing anything, check whether the dependencies exist — i.e., whether the previous inputs are actually valid. For example, if you're trying to build Security Infrastructure but realize there's no Security Architecture or Controls defined, you'll quickly discover there's no Security Policy or Standard either.

3. **Compared to Governance and Design, Implementation and Verification are the two stages that can actually give you useful feedback.** Let's cover these two together. After going through installation, configuration, and deployment to build out the Security Infrastructure, you do education to help employees and users understand it. Then for all of that implementation, you proactively audit and run various reviews — using tooling to check and verify whether everything lines up with the security design. For example: use network scanning to confirm TLS endpoints are in place, CSPM to check whether encryption is enabled, host scanning to verify keys aren't stored locally, and so on. On top of that you need continuous monitoring and testing. The outputs from the Verification stage can directly show up as updates to Security Design outputs, and similarly, issues discovered during implementation can directly feed back into fixing the Security Standards.

At this point, you should have a pretty clear picture of how to approach security architecture work. As for how to actually fill in those components with real depth — that's a whole other conversation. One easy sanity check: compare your policy with someone else's, or compare your architecture design against industry solutions. You'll know pretty quickly where the gaps are. Actually, you probably already know without even comparing.

# 0x03 Summary

This basically covers the full scope of enterprise security and security architecture work — even if not every piece of it falls under the security architect's job title. But it's all within the security architect's sphere of concern: how to build a blueprint, set a goal, design a solution, and deliver across different technical domains, business contexts, and departments.

One more thing worth calling out: **you need to make sure each stage transitions smoothly. Find the GAPs and either fix them or formally accept the risk.** For example: repeatedly communicating through the governance process to get leadership support, then translating the current state of the company into actual policies, then using those policies to drive Security Design, balancing budget and project timelines. The end goal is always continuous delivery, or at minimum meeting the delivery standards you've set. There are all kinds of variables hiding in those transitions between stages — keeping project risk within a manageable range is where the real craft shows up.

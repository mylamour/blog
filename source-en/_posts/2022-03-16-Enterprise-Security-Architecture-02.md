---
layout: post
title: "More on Security Architecture, Part II"
categories: Security Architect
kerywords: application architecture security architecture data security enterprise security architecture architecture design business driven
tags: security architecture
translated: true
---

# Preface

I wasn't planning to write another piece in the security architecture series anytime soon. After finishing [*Security Architecture Reference*](https://book.iami.xyz), I figured my understanding of security architecture wouldn't shift significantly in the short term. And that's pretty much held true — except that some recent team changes pulled me back into application architecture reviews. It reminded me of how I got started with architecture reviews two-plus years ago in [the first security architecture post](/Security-Architecture-Review/) — learning technical architecture review, building solutions. So I figured I'd write up some notes: how global businesses handle architecture reviews, mixed in with some other thoughts.

# Security Capability vs. Security Execution

I've beaten this topic to death, and I know repeating it risks sounding like old wine in a new bottle. But the one thing I keep coming back to is this: **security work has to produce real, effective output**. Otherwise, no matter how much great work the security team does, it's basically just entertaining itself.

Here's an example: say you've done thorough evaluation and testing for endpoint security — from proof-of-concept to procurement, the security team's process looks solid. Then you actually try to deploy it and discover fragmented OS versions, complex network topology, no MDM in place... None of that necessarily kills the outcome, but it massively inflates the workload.

Same thing with building out a fully-featured KMS or PKI — if you can't get effective coverage, can't push it out, or can't get other teams to integrate with it, you've got a serious problem. You have to be honest about what your team's actual position is. Whether you're buying something off the shelf, building in-house, or going open source — can whatever you're bringing in actually deliver security capability?

Take `Crypto Agility` or `Security as Code` (similar to Infrastructure as Code — how many spinoffs of that concept exist now?). **How much of it is actually needed right now, and how much of it can realistically apply to your current infrastructure?** Other teams run into the same thing.

# Business Architecture Review and Process Management

## Business Architecture Review

Internationalized businesses typically span multiple countries, and any cross-border business will immediately run into **legal and risk compliance** requirements across different regions. Then there's **ownership and accountability** — if a product has both global and local dev teams, how do you apply SPLC/SDLC? Does each side run its own? Or do you standardize on global or local? And finally there's **process management** — what tools do you use to track requirements, progress, and coordinate resources across stakeholders?

Here's a quick example: an architecture review meeting for a business process change (not a new product launch). The attendees and their roles:

| Role | Responsibility | Notes |
|------|:--------------:|------:|
| Business Risk Control | Business Risk | |
| Security Consulting | Security Consulting | |
| Information Security | Infosec Policy | Does it comply with internal policy? |
| Enterprise Security | Security Tech | Does it comply with internal technical standards? |
| Legal Counsel | Legal Consulting | Covers both Local & Regional |
| Risk and Compliance | Compliance | Does it meet compliance requirements? |
| Product Manager | Presentation | Answers questions from attendees |
| Project Manager | Project Management | Answers questions from attendees |
| Software Engineer/Architect | Presentation | Answers questions from attendees |
| Data Science | Presentation | Situational |

This felt noticeably different from the architecture reviews I'd been part of before. Previous ones were more technical — digging into concrete implementation details, with attendees mostly being architects from different tech teams.

## Process Management

Let's talk about process management — specifically how to map ownership across different phases. Take SDLC simplified into five stages, each with its own set of activities:

1. **Security Architecture Design**
   Activities: Abuse Case Analysis, Checklist, Risk Control and Identification Process, etc.

2. **Secure Coding**
   Activities: Security SDK/Frameworks, SAST, OSS (Open Source Scanning), Mobile Security, etc.

3. **Continuous Build**
   Activities: SAST, OSS, Mobile Security, DAST, Penetration Testing, Container image scan, etc.

4. **Continuous Deploy**
   Activities: Image Scan, Release Checklist, etc.

5. **Continuous Defense and Monitoring**
   Activities: DFIR, Bug Bounty, Penetration Testing, Vuln Management, etc.

A lot of people lump CI/CD together, but they're worth separating. And across these five stages, how many trigger points are there? For example, when you pull or commit code — what Security Controls should fire? Same question going from build to packaging to staging, or pushing to an Artifact/Image Repo. All worth thinking through carefully.

Beyond that, if you have a platform that can handle all this process management and control — you also need to check whether every regional business can actually use it. Because the regulations in different regions don't always allow the ideal setup. For instance, if the company has a subsidiary in China, China's Data Security Law might prevent you from feeding that data into a global platform to run security controls — because it could involve cross-border data transfer. And sure, you could ask whether the platform can be localized. But that's a whole different conversation. If it can't be localized, how do you deliver security capability in an alternative form? How do you keep standards and processes consistent? These are questions worth sitting with.

# Wrap-up

Starting to feel what it's like to prioritize hitting a target without being attached to exactly how you get there. It's still unsatisfying in some ways, but I get it — optimization is gradual. When certain platforms don't exist yet, you fill the gaps with other tools, and maybe the process is only automated at a few specific points rather than end-to-end.

# References

* [Security Architecture Reference: Building Enterprise-Ready Security Architecture](https://book.iami.xyz)
* [What Is Security Architecture](/Security-Architecture-Review/)

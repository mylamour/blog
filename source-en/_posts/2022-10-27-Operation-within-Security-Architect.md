---
layout: post
title: Operations Inside the Security Architect Role
categories: Security Architect
kerywords: security operations security architecture enterprise security security governance
tags: security architecture security operations
translated: true
---

# 0x01 Intro

Engineers think once they make it to principal/staff, they're done with operations. Security ops folks think once they move into architecture, they don't need to care about operations anymore. In reality, operations is something you can never escape. At least this year it's not being hyped as hard as the past two years. Here's a quick rundown of the operations work that comes with the architecture role.

# 0x02 The Real Stuff

Let's start with what routine operations actually looks like. **Requirements gathering** (all sorts of weird requests from inside and outside the security team) and **risk tracking** are the two things that show up most in day-to-day work, mainly through architecture reviews and security consulting.

Take architecture reviews as an example — you're constantly negotiating to get the business side to accept a certain baseline. But business stakeholders always have their reasons:

* We're on the internal network, we don't need passwords, don't need TLS, just store the keys in the database;
* That's how everyone else does it, that's how other companies do it;
* This thing has a ton of stars on GitHub;
* This is urgent, top priority;

When there's this kind of knowledge gap, on one hand you rely on policies and standards to force the business side to follow the rules, and on the other hand you have to patiently walk through the context over and over again. And then the outcome often ends up being:

* A one-page doc with ten sentences, no architecture diagram, no recorded context;
* Someone drops a link to a third-party tool and says "go read it yourself";
* Can't tell the difference between encryption, hashing, and encoding;
* A few meetings later and nothing that was supposed to change has changed;

The more architecture reviews you do, the more hopeless it feels. As for post-hoc risk management — even if you track things through a formal process, you'll often end up with solutions that completely miss the point. What gets said in the meeting is one thing, what actually gets implemented is another, and sometimes a risk gets closed out without even designing anything to address it.

On top of that there's **standards development** — internally (or with other teams) **writing policies, baselines, management procedures, process docs, and so on**. The typical structure is: purpose, scope, content, appendix. After the first draft, you go through review/cross-review, release, and update cycles. These docs need consistent formatting, numbering, watermarks, and a fixed update cadence. And since some are written for employees, some for IT, and some for ops teams, they're all different audiences.

This also ties into **capability promotion**, which covers **training, roadshows, and knowledge sharing** in various forms. You might also need to **build an external-facing portal for the security team** where employees from other departments can look things up. It usually has sections like org & leadership, mission, capability, events, policies & SOPs — everything on the portal is considered a released version. Draft versions live on the wiki for editing.

# 0x03 Wrap Up

Used to be a "bricklayer" in an architecture role. Now I'm an "architect" doing bricklaying. Since September it's been averaging 20 hours of meetings per week, and the last few weeks of October have been absolutely brutal — feels like we're hitting 30 hours on average. Sometimes I genuinely don't know what's going to arrive first: the future or the straw that breaks the camel's back.

When you're exhausted, your brain just buzzes constantly. Thoughts go everywhere. Sometimes writing things down helps a bit, sometimes it doesn't. Realized I haven't run in forever. Went for a run today — barely 2km and I was already drenched in sweat. Thought about it and decided to just take a day off. Give yourself a break. Life comes first.

<!-- Project management, emotional management, managing up, leadership — the operations side of management isn't covered here. -->

// Microsoft's technical support is genuinely terrible. Even with an A Case opened (supposedly A Case engineers have 8+ years of experience — can't really wrap my head around that), a lot of bugs just don't get resolved in time. This also shows that security products in this space are still pretty immature. Will write a separate post about it later.

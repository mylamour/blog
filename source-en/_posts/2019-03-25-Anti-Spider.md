---
layout: post
title: Getting Out of the Anti-Scraping Trap
categories: Security Engineer
kerywords: thoughts reflection issues work experience summary anti-scraping spider Anti-Spider
tags: Spider & Anti-Spider Security Operations
translated: true
---

# Intro

Web scraping has been around forever, and tutorials for it are everywhere. But when it comes to anti-scraping techniques, everyone seems to keep things under wraps. And honestly, that secrecy mindset — believing you've cracked some secret sauce (when most of it is just reinventing the wheel) — is exactly why results are rarely satisfying. You end up drowning in endless rule maintenance and toggling switches on and off.

Same deal at big companies. This stuff is often (always) a black box. Even the internal wiki is on a separate access tier — which, fine, that's actually a reasonable control. For my part, I wasn't doing in-house anti-scraping R&D. So I figured I'd write up my design thinking and lessons learned from past anti-scraping work, and share it here.

# Overview

I touched briefly on request signing and verification in [Anti-Spam Registration](https://github.com/mylamour/blog/issues/34), and later sketched out anti-scraping techniques across the entire request lifecycle: ![mthink](https://img.iami.xyz/images/47093786-7c5b9100-d25c-11e8-88fa-f97c50b980a2.png). Now let's look at how to design an anti-scraping system from a higher level. (The diagram was drawn a few months ago — there are parts that could be expanded, but I haven't gotten around to it.)

## Understand the Business

Know yourself, know your enemy. Figure out where your product actually exposes data, then prioritize protecting the scenarios scrapers care about most. That's step one.

* What does the product offer?
* What does the scraper want?
* What are the risk areas?

Also watch out for data leaks caused by logic bugs in your design — that can gut your anti-scraping system's effectiveness down to basically zero.

## Collect Data

Use the data you have; create opportunities to collect what you don't. From frontend to network to backend, there's a ton of signal you can capture across the whole stack. The key questions: what should you collect, how do you store it, and how do you feed it back into detection? A solid identity system and clean data pipeline are what make your enforcement actions actually work. I'll break this down into three angles: **data generation**, **data identification**, and **data features**.

Think about:

### Data Generation

* What data is produced during a full user interaction? What's missing? (For example, if you lack keystroke timing — how do you go about collecting it?)
* Where does collected data get stored? How do you aggregate frontend, backend, and network signals together? And how does it feed back into your detection layer?

Here's a simple diagram: ![image](https://img.iami.xyz/images/54924594-b2a5e680-4f47-11e9-8827-ba8245245ca2.png)

This gives you a rough idea of how a typical anti-scraping system is put together. Going back to the "understand the business" point — when you design an anti-scraping system, you're not just thinking about generic scraping scenarios. You probably also need to handle business-level and even API-level cases (with separate rules per business or endpoint, not just generic logic). As you can see, your blocklists and enforcement actions depend entirely on data collection and analysis. A few more things to get clear on:

### Data Identification

* Identity system
* Client-side controls (whether it's request signing, device fingerprinting — these approaches are always vulnerable to reverse engineering, simulation, and proxies; protecting against bypass is just as important)

Identity is a big concept. ![image](https://img.iami.xyz/images/54925119-a5d5c280-4f48-11e9-8c46-7efbb9daf1dc.png) The challenge is: in a single user request, how do you make your identifier as unique as possible? You've got human identity, device identity, account identity, network environment, and more.

This identification process also generates a ton of data. If it were you — what dimensions would you use to uniquely identify an entity?
![image](https://img.iami.xyz/images/54925811-06b1ca80-4f4a-11e9-8359-e757b543e002.png)

### Data Features

Features can come from the raw data itself, or from statistical analysis. Raw data alone often isn't enough — you usually need to do some manual feature engineering on top of it.

* Features derived from entity attributes (what characteristics do humans, IPs, locations, devices each have?)
* Features from statistical analysis (frequency, intervals, page similarity, etc.)

## Analysis and Computation

A standard computation engine should have both online and offline components — one for real-time processing, one for T+1 feedback (filling in gaps in blocklists; though not always T+1).

* Split by latency: Online vs. Offline computation
* Split by method: Rule engine vs. Model engine (rules are generally for pattern matching, models for offline analysis, etc.)

At this point I'm not going to harp on ML for security applications again. Rule engines are the same old playbook. Throw some boosting at it? Haven't you heard of XGBoost, LightGBM, CatBoost? And are those inherited hyperparameters still doing anything useful?

## Enforcement and Response

This is the part where anti-scraping actually does something. Let me be clear: banning IPs has never been the best option. You also need to make sure your enforcement actions can't be bypassed — it's not just data collection that faces bypass risk, every link in the chain from detection to enforcement can be bypassed. The question is just whether it's within acceptable range.

* Actions: Ban, Deny, Delay, Waiting, Login, CAPTCHA, Poison, Honey Pot.
* Platforms: Android, iOS, Browser (Chrome, Firefox, Opera, IE...)


# Detection Framework

OK. So you can design an anti-scraping system from a technical standpoint — but when you actually ship it, what else do you need to think about?

* Business-facing: integration method, integration scenarios
* Operations-facing: rule operations, rule maintenance, model updates, etc.
* Infra-facing: stability, availability, hot updates, model deployment, model maintenance, metrics (success rate, failure rate), degradation switches, etc.

Only after thinking through all of this can you actually say you've designed a complete anti-scraping system. Once that's done, you move into tech stack selection and figure out what each part of the pipeline needs to handle — frontend log collection and storage, backend log collection, ETL, message queues, rule engine, compute architecture, all of it.


# Summary

Real anti-scraping shouldn't rely entirely on manual rule edits. If it does, it's basically no different from traditional WAF inspection or webshell detection that's just encoding expert intuition. The focus should be on bringing in new technology while also automating things — manual changes tend to cause more unpredictable incidents. Think it through. What the hell's going on.

* Object-oriented design thinking applies pretty well to system design too
* Sometimes you need to read non-technical books to broaden your perspective

# Resources

* [Anti-Spam Registration](https://github.com/mylamour/blog/issues/34)
* [Anti-Scraping Mind Map](https://img.iami.xyz/images/47093786-7c5b9100-d25c-11e8-88fa-f97c50b980a2.png)

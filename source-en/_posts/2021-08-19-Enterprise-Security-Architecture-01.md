---
layout: post
title: Revisiting Security Architecture (Part 1)
categories: Security Engineer
kerywords: Application Architecture Security Architecture Data Security Enterprise Security Architecture Architecture Design Business-Driven
tags: Security Architecture
translated: true
---

# Preface

Back in May I'd already decided to write a few new posts on security architecture, but ended up only getting a small part done. Progress was limited, ideas hadn't fully settled, and my thinking kept hitting walls. Recently though, I feel like I've absorbed quite a bit, and when I flipped back through *Enterprise Security Architecture* I realized I'd been reading it for several months already — so I figured it was time to turn my notes into something coherent.

The previous three-part series "What is Security Architecture" was mostly experience-driven, bottom-up, summing up practical methods learned from hands-on work. This time I'm using *Enterprise Security Architecture* as a reference to take a top-down look at the journey from methodology to actual implementation. The more I read, the more I find the two perspectives reinforce each other.

# Enterprise Security Architecture Methodology

## Concepts

![image](https://img.iami.xyz/images/130034048-e75b342d-f4f2-4651-8df3-aa19790e3ea0.png)
> Any universal method still needs to be adapted to its context. After finishing the book, it really helped me pull together everything I'd been accumulating...

Since each phase has a lot of things to consider independently, I put together a table based on the book's content, and also posted a **text version** [summary here on gist](https://gist.github.com/mylamour/64ef30331cda95f08570f11ce135e171):

![image](https://img.iami.xyz/images/130034780-a64ea58f-ecaf-4d96-9f45-9dc208855969.png)

**Note: All screenshots below are from the original book**

At a high level, there are three Phases and six Layers.
The three phases are: Strategy/Planning → Design → Operations. The six layers are:

* Contextual Security Architecture
* Conceptual Security Architecture
* Logical Security Architecture
* Physical Security Architecture
* Component Security Architecture
* Operational Security Architecture

In terms of processing order, by the time you're defining the Operational Security Architecture, you should already have thought through the Logical and Physical Security Architectures, along with potential issues at the Component level.

![0112_001](https://img.iami.xyz/images/130037905-a48e043f-5b05-4140-acd5-a685224aa823.jpg)

> In other words, whenever anything needs to be delivered as output, Manage & Measure is happening in the background — whether driven by yourself or by others/the team.

The diagram below uses Directory Services as an example to show how the 6 Layers are formed.

![0131_002](https://img.iami.xyz/images/130038184-78723488-2eec-4347-b784-dd993b238623.jpg)

## 0-1

There are two diagrams here, each showing how this framework operates. The first covers the entire three phases (at an abstracted level) — how business strategy, influenced by various inputs (Goals, market, financials, raw product signals), feeds back into security strategy, and the cases and factors considered as you move from Logical → Physical, all the way to establishing trusted operations.

![0127_001](https://img.iami.xyz/images/130038090-fcb8797b-379d-41b7-989e-c4fb6f8b5d3a.jpg)

Whether some parts of this are outdated doesn't really matter for now. In methodology migration, the details rarely have a big impact. You can even map Yin-Yang theory onto security (the following is just riffing):

* **Opposition and Constraint**
> The adversarial relationship between attackers and defenders. Inside an enterprise, critical permissions get split across different departments — that's constraint too. Externally, companies and regulators constrain each other. Not necessarily opposition, but mutual check. Take internal red-vs-blue: is it opposition? Sort of, but not really — they end up doing a joint debrief afterward. Why bring in a Blue Team? To surface risks early, use offense to drive defense.

* **Mutual Containment**
> Offense contains defense; defense contains offense. You put up a block, and the attacker's infrastructure is already automated around it. They get in, so you set up a honeypot. Inside the company, red and blue teams form an inside-outside dynamic. New technology brings new risk, which drives new security.

* **Interdependence**
> No attack, no defense. But no theft prevention doesn't mean no theft. Vendors sell to enterprises, provide tech support, and then some of those enterprise folks spin out their own companies. Everyone's circling the same ecosystem. The polite framing is "mutual growth." Inside the enterprise, it's the same logic — platforms, middle-layers, collections of components that product lines pull from as needed.

* **Dynamic Balance**
> It's all about momentum. Attack and defense rise and fall against each other. Same with team dynamics: if your project is strong, stakeholders push back; if you're weak, your manager might come advocate for you. If attackers hit hard and you can't hold, law enforcement steps in. If your defenses are solid and the business is humming, more people will come at you.

* **Mutual Transformation**
> People move from the vendor side to the enterprise side and back. There's also the saying: "How can you defend what you don't know how to attack?" Without that perspective, defense is always reactive.

These things are great for talking through problems and expanding your thinking. But they're not a good method for grounding actual design decisions. Real implementation means working through complexity, evaluating management cost, budgets, and all the rest — approached with rigor, not handwaving.

# Summary

It's not hard to see that the practical experience from before and the methodology in this book share a common core. Even though the book came out in 2005, it still holds up as a desk reference today — especially for folks who just moved into enterprise-side security (fellow new-generation migrant workers in the information technology services sector, who should embrace optimism, acceptance, and freedom from worry). It doesn't need to be read cover to cover; for experienced practitioners, skimming the table of contents is probably enough to get the gist. Its biggest value is helping you build the big picture — knowing what belongs where, and when to do what.

# References

* [Enterprise Security Architecture](https://www.amazon.com/Enterprise-Security-Architecture-Business-Driven-Approach-ebook/dp/B00UVAQ75G)
* [Architect's Handbook](https://tonydeng.github.io/architect-manual/ch1/1.1.html)



<!-- ![0117_001](https://img.iami.xyz/images/130038046-89a065ea-248f-4ad4-96e0-3efd91ded825.jpg) -->
<!-- ![0294_001](https://img.iami.xyz/images/130038412-39a8b77a-f1be-4659-a053-cbbd9ae31b19.jpg) 策略管理里的好图 -->

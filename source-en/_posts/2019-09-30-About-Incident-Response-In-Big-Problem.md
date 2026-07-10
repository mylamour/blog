---
layout: post
title: On Major Security Events and How to Handle Them
categories: Security Engineer
kerywords: major event protection phased inspection
tags: security operations legacy
translated: true
---

Just a quick write-up of some thoughts. Will add more later.

First, from a management perspective — there are two ways to drive security work forward: **event-driven** and **management-driven**. Major security protection events (重保) are a classic example of event-driven, and a very powerful one at that. These events are typically initiated by government or regulatory bodies, and with the government increasingly serious about cybersecurity, the pressure they put on companies is real. It's one of the most effective ways to get a security team's work actually taken seriously and implemented.

That said — whether it's event-driven or management-driven — communication is still the most important thing. Don't jump straight to event-driven. Start with communication. If communication doesn't get the results you need, then you bring in the event-driven angle. Use the problems that come in from external sources to push internal improvement — like the saying goes, "a monk from out of town recites better scriptures." But be careful not to position yourself as the adversary of the dev and ops teams. You're there to collaborate, not to fight. Everyone's goal is to provide better security for the users.

Second, let's talk about what these major protection events actually look like in practice — they tend to be pretty form-over-substance. Sometimes they don't actually hit the real problems in a company's security posture. But that doesn't mean they're useless. They do expose issues. The key lesson here: **never let tactical hustle cover up for strategic laziness**. A bunch of people grinding away, burning the midnight oil, 24h online during the protection window doing Incident Response on the fly — that only proves one thing: the company's security architecture wasn't built properly ahead of time, and there's no automation for detection and response. Relying on a high-intensity burst of work during the protection window to pass the inspection doesn't work either. Especially when the Incident Response is all reactive, and the stopgap operations have no rehearsal or standardized runbooks. But if a company can actually absorb the lessons from these events and use them to improve their security posture afterward, it's worth it. Bottom line: don't just stop at going through the motions.

Third, let me flip to a different scenario — e-commerce peak events versus regulatory protection windows. A company's own major sales events (like 618 or Double 11) are very different from government-mandated protection exercises. These are major business decisions driven by marketing. Whether it's risk controls or security, the protection work during these peak sales windows is absolutely critical. But for large internet companies, peak traffic during a big promo can be on par with a massive DDOS attack. Yes, some of that gets scrubbed at the ISP and CDN layer, and some users get filtered through bot detection and CAPTCHA challenges — but the traffic volume and user count are still enormous.

At the same time, both anti-bot systems and security devices often get degraded during these events. For example: not doing full-volume inspection, scaling back on rules, keeping only the core WAF rules, and so on — the goal being to avoid a choke point at the perimeter. On top of that, the spike in business request volume causes a surge in the log collection system's load. To prevent cascading failures, logging sometimes gets turned off entirely. The priority is to throw all available resources at keeping the business running.

So what do you do in that situation? When the tiger takes a nap, you need to rely on the perimeter fence. That means hard boundary defense plus hardware traffic mirroring, combined with big-data-based detection platforms. Even if the normal log collection pipeline breaks down, you still need to ensure detection capability at the perimeter. Given the characteristics of peak sale events — they're not continuous, they have distinct time windows — you can tune the rules differently for each phase and apply degradation accordingly.

One more really important thing: **run drills ahead of time**. Don't let the degradation knock something critical over, and then find yourself dealing with hidden mines when it's the real thing. During peak events, the business comes first — and if something breaks then, everyone will be caught completely off guard. One more thought: establish a single incident response entry point — a "nuclear button." And a single risk control entry point: a centralized set of degradation switches.

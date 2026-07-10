---
layout: post
title: ATT&CK and Intrusion Detection
categories: Security Engineer
kerywords: log collection intrusion detection
tags: Intrusion Detection and Counter-Intrusion
translated: true
---


All of a sudden, my feed was flooded with people hyping up ATT&CK again. No idea why this framework blew up out of nowhere. Most of it was just bandwagon jumping — ask anyone how they actually implemented it and they'd go quiet. Then I started seeing it pop up on internal channels too. It reminded me of the stock market: the people who actually profit aren't the ones reacting to every up and down — they're the ones who read the trend. Some can, some can't. Anyway, this stuff is actually related to what I've been working on. Using ATT&CK as a spec for intrusion detection to get full scenario coverage. (Though honestly, I still think you shouldn't be over-reliant on any single framework. Exploring the unknown is the right path.)

So let's talk about planning intrusion detection rules with ATT&CK. Take a look at the diagram below. This is a basic detection pipeline I designed. The core idea is layered data filtering — when you're data-poor, the most important thing is knowing exactly what data you need and how to fill the gaps to meet your detection requirements. This applies whether you're dealing with raw data or alert data. One thing to keep in mind: once an alert escalates to an incident, the incident response chain should be as fast and lean as possible.

![image](https://img.iami.xyz/images/64482549-61a05b00-d226-11e9-8cf1-ab8d89318e43.png)

As you can see from the diagram: **data warehouse construction** and **layered detection**. In practice this means tiered rules, a feedback loop, and using the data pipeline as the foundation for performance control on detection. But watch out — for example, if you're relying on data collected by HIDS, can you guarantee coverage? If not, what's your plan? If you're relying on asset data, can you guarantee it stays up to date? If not, how much lag can you tolerate?

Still haven't really mentioned ATT&CK yet, right? Well, from where I sit, ATT&CK's role here is simple: take the scenarios it provides and generate corresponding rules. Those rules can be single-point checks or chain-based detections. In terms of rules that just means how many data sources you bring in for a single detection pass. That's really all there is to it.

On the data warehouse side, I wrote a piece about log collection before — but that's just the starting point. What we actually need is to output domain knowledge from the data.

![image](https://img.iami.xyz/images/64482719-e6d93f00-d229-11e9-8612-e33aa0789dc9.png)

You can use the diagram above as a reference and adapt based on your company's actual situation. When a user reaches a host through a business interaction, they'll pass through roughly the following components (varies by role — not all of these will always apply). Here's what a typical attack chain looks like:

![image](https://img.iami.xyz/images/64482550-66fda580-d226-11e9-858c-7d1325581029.png)

The goal is mainly to get host-level interaction through business-layer interaction (each outer layer in the diagram is either a defense or detection system — one thing the diagram doesn't show is the coverage problem caused by differences between business/IT systems, cloud environments, and IDC environments). Traffic can exit directly from the host, or return the same way it came in (that second one is way harder to detect). For outbound detection: if you've got five-tuple data for both IDC and cloud egress, combined with an asset inventory and the list of machines accessing the entry layer (all derivable from your asset database), you've covered the basics of outbound traffic control. Your dependencies are: newly added machines and whitelist entries need to get into asset data promptly, and you need to make sure egress traffic capture is actually reliable.

Still feels like ATT&CK hasn't come up much, right? Actually it has — you've already been building rule coverage for some of those scenarios. Here's another example, this time specifically for the production network (some scenarios in the diagram aren't from production):

![image](https://img.iami.xyz/images/64482770-a1694180-d22a-11e9-9f43-059843236089.png)

I pulled these scenarios from ATT&CK and started building detection rules. Why skip the Initial Access section? Partly because the business systems here already have WAF protection at the traffic layer plus Alibaba Cloud's infrastructure-level defenses. That doesn't mean other companies can skip it. And the reason I picked these particular scenarios is also partly because some data just isn't collectible. In intrusion detection, a key piece is baseline data analysis — you analyze the metrics, then use those metrics to hunt for targets. Take `Commonly Used Port` in a C2 scenario: you first need to analyze what ports are commonly used across the whole environment, then analyze it at the per-host level. Then you filter out the common ones and tune per VPC and per IDC. Don't just jump straight to writing a rule that says "filter out 22, 23, 80, 443, 8080... and call it done." Same thing with DGA detection — you need captured domain data and then apply both rule-based and model-based approaches separately.

Anyway, this post ended up being more about intrusion detection than ATT&CK specifically. The main point is: most intrusion detection rules can be written with ATT&CK as a reference. And for rules you've already got, tag them with the relevant ATT&CK scenario. Down the line you can bring in Deep Learning or Display Learning to automatically discover scenarios your rules never caught.

---

That's it for this article. On a personal note — I first ran into ATT&CK back around mid-2017 when I was researching APT attack techniques. Now I use it for writing intrusion detection rules. But it's definitely useful for more than that. Like tagging your IOCs with scenario labels — that's pretty great too. Or using ATT&CK scenarios to tune a honeypot system so it automatically adapts to attacker behavior and baits their tools.


# Misc

I've always thought: being dumb isn't scary, being malicious is. Making fun of people makes you an idiot; telling people to pull all-nighters makes you a jerk.

Also, lately I've been seeing a wave of people hyping up "security operations" like it's the most important thing in security. Sure, security operations matters — that's not up for debate. But the technical bar for security ops honestly isn't that high, which makes it a role that's relatively easy to find replacements for. Not saying security ops is bad — I do some of it myself, and you can't really have opinions on things you haven't done. But based on the people around me and the state of the industry, it's not hard to see what's happening: in a small circle where technical depth is no longer the main currency, if you still want to hold onto your position, pushing everyone toward "security ops" as the new hot thing is a natural move. Unless you're defining security ops as literally everything except security R&D — in which case I have no comeback. But the reality is that a huge chunk of security ops folks have wildly varying skill levels, just like the security industry in general. Security ops is the most visible role. Case in point: I once asked a security ops person from a group company for access to endpoint device data, explaining it was for office network security analysis. The response was "what's office network security and what does that have to do with this data?" (No beef with this person, we'd never even met.) And the same pattern shows up here at Ele.me — some security ops folks who are more talk than substance. The only edge left might be soft skills and temperament. Can't write everyone off entirely, but can't hype everyone up either. Same logic as ATT&CK — don't over-hype it, don't dismiss it. Try it and you'll see what it's worth.


# Resources

* [ATT&CK Homepage](https://attack.mitre.org/)
* [OSI protocols](https://en.wikipedia.org/wiki/List_of_network_protocols_(OSI_model))
* [Opertaion System](https://en.wikipedia.org/wiki/Kernel_(operating_system))
* [Linux Kernel Layer](https://en.wikipedia.org/wiki/File:Linux_kernel_and_gaming_input-output_latency.svg)

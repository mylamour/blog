---
layout: post
title: Before the Data Breach
categories: Security Engineer
tags: tips learning-data-mining data-security
translated: true
---

# Preface

![img](https://img.iami.xyz/images/goodbaytoonionblog.png)

Shut down the blog on Tor. Why bring this up first? Because I want to talk about how to exist anonymously on the internet — though the moment I publish this post, I'm no longer anonymous. Like someone once said: when you observe something, the act of observation changes it. I know I know less and less. I have a pretty clear sense of my own level. But after thinking it over for a long time, I still decided to write it down. So — this post is just my record of thoughts on internet privacy.

# The Data That Was There Before It Disappeared

What kind of data are we talking about? Data recorded by carriers, data stored by major tech companies — email records, traffic logs, device info, and so on. For someone doing raw internet dumpster diving, picking the right target can be pretty profitable. With Elasticsearch specifically, bulk scanning tends to turn up roughly the following, and before the last scan there were definitely some big company datasets in the mix:

* Taobao customer address and phone info (already gone...)
* Access card data (addresses, user info, card details)
* Address and phone info (just addresses and phone numbers)
* Social engineering databases (collections of various dumps — passwords, emails, and detailed personal info, mostly overseas)
* WiFi password data (with geolocation tags)
* Names and ID numbers (credit data, historical leftovers)
* Government/enterprise filing company data (company and applicant info)
* School enrollment info, class schedules, and student data
* Application logs from various companies — actually pretty useful. One of them was some kind of cloud platform.

ES is normally just used for aggregating and analyzing logs, but a lot of companies use it as a database to store product data directly, so the backend can read from it easily. After the ES cluster ransomware wave last year, the number of publicly exposed ES instances dropped sharply for a while. Then, as time passed, people (new people) forgot about the risk of password-free public exposure, and inevitably a bunch more showed up online. This is a pretty good illustration of the fact that security is something you have to keep reminding yourself about — you can never let your guard down. Because there's no such thing as a minor security issue. Once something goes wrong, the damage is almost always irreversible. Take the examples above: when you have enough of this data, you can figure out where someone lives, their phone number, their access card PIN, where their kids go to school, who their teachers are, where those teachers live... which cafes they've connected to WiFi at, where they are right now. Once you aggregate it into a graph and lay it all out, everything is visible. Sure, not every dataset has all of this — but there's no question that this isn't science fiction. It's doable. And it probably already exists.

# What You Should Actually Do to Prevent Data Leaks

<font color="red">Data flow encryption</font> and <font color="yellow">tiered permission control</font> are the two most fundamental things I can think of for DLP — whether you're looking at STRIDE in threat modeling or attack tree models. Only by properly controlling permission tiers and encrypting data transmission across those tiers can you actually prevent data leaks. At the network layer, or when you're dealing with document fingerprinting, the detection methods are different — but at that point you're really already in the business of slowing down an attack (internal data leaks, whether from insiders or external intrusions, should both be treated as part of an attack). Either way, it's still part of the DLP picture.

Hack intrusion is In, DLP leak is Out. Whether it's In or Out, the detection techniques are largely the same. Same underlying principle. The sample features used in intrusion detection to identify malicious requests can also be used in DLP to tag sensitive data. Something simple like DGA detection works in both cases — for intrusions and for exfiltration. It all sits within the same security lifecycle. As long as you have solid control over those two endpoints — In and Out — you can build solid security protection. And if you want to get granular, you'd extend that all the way down to each DMZ and each device's own In/Out.

# Thoughts and What Else Can Be Done

- [ ] Is a universal detection framework actually feasible?
> Link data across layers by data dimension and device type, in streaming form, with layered control and analysis. Aggregate different types of incoming data, apply different detection methods, with the detection models themselves also layered and plugin-based. Use a mix of traditional rule-based detection, allow/block lists, machine learning, and time-series analysis (haven't figured that one out yet).

- [ ] Protecting your own privacy
> Is there even any privacy left?
> Does knowing all the logical fallacies mean you can make the right choices? Kid, everyone who's caught in a logical fallacy thinks they made the right choice. Don't let the idea of "being correct" blind you and take away your ability to actually choose. (From today's reading-and-forgetting session.)

- [ ] Using ML or deep learning to surface interesting data (though direct pattern matching works too)
> In a DLP context, that's a good thing. In an attacker's hands, it means automatically finding sensitive data exposed on the internet.
> Automatic text summarization

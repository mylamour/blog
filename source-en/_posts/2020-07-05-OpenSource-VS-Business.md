---
layout: post
title: Working with Commercial Security Appliances
categories: Security Engineer
kerywords: enterprise security internet security data security
tags: Security Operations Security Architecture
translated: true
---

# Preface

Looking back at my career, early on was pretty much the open-source era — production networks running ossec, wazuh, suricata, almost zero purchased products. Most things were built on open-source tooling. On the office network side, endpoint controls were basically non-existent, with the perimeter being the main line of defense. That said, since production environments were on public cloud (AWS, Alibaba Cloud), some baseline defenses were already baked in by the cloud vendors. Budget constraints meant we couldn't buy many cloud security products either.

Later, at a big tech company, most things shifted to in-house builds, with heavy customization tied into internal systems and very clearly divided job responsibilities. The office network still had some purchased security products — but even a small amount of procurement can be a serious budget hit. Think about it: a license that costs 100 RMB per endpoint, covering 50,000 endpoints — how much does that add up to? At the same time, as we were migrating from IDC to cloud, the security product landscape was also changing — driven by the group's security strategy on one side, Alibaba Cloud's offerings on another, and in-house builds on a third front.

Now at a financial institution, the environment is neither multi-cloud nor multi-IDC-plus-cloud — it's pure IDC. Understandable given regulatory requirements.

# Main Content

Commercial appliances are generally more mature, but their iteration speed often lags behind open source.

Characteristics:

* Sold as hardware + software bundles. The management platform is typically software, with licenses renewed annually or every 3 years.
* Custom OS, restricted CLI — but usually wrapped in a way that lets you access a full shell via special commands.
* Design flaws in edge cases, especially around file read/write operations — some products will straight-up delete files in specific directories after password failures.
* Vendors have put enormous effort into license activation to prevent piracy, but the results seem... limited.
* When issues come up, they generally get resolved quickly — no need to go digging through community forums.

Issues:

In reality, from procurement through POC, through maintenance, and into supporting business teams — the problems just keep stacking up. Thinking ahead about functionality, performance, ops, operations, and application scenarios during the POC phase is never a waste of time.

* Commercial products are expensive, and tech support / after-sales service is usually decent, but they're not a fit for every company. The demand for customization remains high.
* Anything you want to make HA — even the management platform — requires buying two licenses. (Vendors tend to push users to buy even more management platform licenses.) But each device can't be registered to multiple management platforms, which creates single points of failure. Separate registrations increase operational overhead.
* Compared to in-house builds or open source, each product comes with its own learning curve. And ironically, many commercial products are themselves built on open-source tech under the hood — Radware, for example, uses ELK internally.
* In a lot of companies, everything from product selection to deployment to configuration is basically done by the vendor's tech support team (honestly, that's the common scenario). So do the companies themselves actually understand the details and gotchas?
* A lot of companies assume that buying commercial products means they're covered. In reality, quite a few of these appliances are exposed to the internet — check around and you'll find them. There are researchers focused on every major product line. And because commercial products don't build community around their users, when something goes wrong, the blast radius is bigger.
* There's relatively little vulnerability research on commercial appliances, which means vulnerabilities tend to stay undisclosed longer. In-the-wild exploitation doesn't get detected in time.
* Backend storage varies across different products, which means maintaining more types of databases. Do you hand that off to a DBA, or build the cluster yourself? Is there a read/write splitting scenario?

Tips:

* If uploads are slow, copy the file to a machine on the production network first, then use internal sftp/ftp — much faster.
* Tech support for state-owned enterprises or banks tends to be... unenthusiastic. You usually need to push through the business relationship side to get things moving.

# Summary

Early in my career, I saw job listings that asked operations folks to have experience managing around 100 devices — and I wasn't even in ops. Later I saw Meituan recruiting for anti-intrusion roles that required experience governing 100k+ servers (though back then production might have been 20k+ machines, office network maybe 30k). But when I suddenly realized that the security team's own devices and servers — excluding the big data platforms — were also creeping into the hundreds, it got me thinking.

From a maintenance standpoint: more product types means more complexity and harder upkeep. From a business standpoint: more services being exposed means you need more operations headcount. I'll dig into this more in a future post on DevSecOps.

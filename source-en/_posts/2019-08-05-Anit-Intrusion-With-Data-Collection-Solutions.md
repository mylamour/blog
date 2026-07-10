---
layout: post
title: An Overview of Log Collection Solutions
categories: Security Engineer
kerywords: log collection solutions big data data warehouse intrusion detection Log Solutions DataCenter
tags: intrusion-detection security-operations data-mining
translated: true
---

I've been spending a good chunk of time lately on log collection work, and picked up some useful stuff — mostly around data warehouse design. So I put together a diagram to get a feel for the big picture. It's a comparison of different approaches to log collection, or you could call it data collection, since these solutions aren't limited to logs — they work for any kind of data ingestion.

![image](https://img.iami.xyz/images/62468743-5e4e2580-b7c9-11e9-9b35-1cb67531caf0.png)

The first thing you need to figure out for log collection is what data types need to be collected and how to collect them. Take a look at the diagram — the green-marked parts are categories shared between the production network and the office network, meaning you need to collect them regardless of which environment you're in. That includes DNS resolution records, VPN requests, NAT logs, and NIDS logs from both networks. On top of that, try to cover each environment as specifically as you can. That might sound obvious, but it's true. Production networks are generally cleaner and easier to collect from than office networks. Office networks are a mess — fragmented, spread out, with poor coverage and hard-to-collect data. Think about a company with 40 offices across the country, outsourced employees, shared accounts, and network setups that don't meet collection requirements.

The whole data pipeline basically comes down to: collect, store, read, compute. It's usually made up of a few pieces: log collection, databases, message queues, search engines, and real-time compute. Not all of these are required. Take message queues — when log volume is high, subscribing via a message queue helps prevent data loss, but at low volume it's honestly not necessary. Similarly, you could push everything straight into Elasticsearch without a database at all. For most scenarios, something like `(32C*64G) * 4 slaves + (40C*128G) * 1 master` is plenty. Of course, you might run into painfully slow queries that need tuning. On the collection side, `filebeat` and `logstash` are solid baseline choices — those are what I use. For `syslog` collection, `rsyslog` is also an option. For real-time compute, the choices are basically `spark` or `flink`. Spark has better documentation and community support, but flink wins on actual real-time processing — Spark is batch-only, so if you need streaming, go with flink.

Now that we've walked through the on-prem pipeline, let's take a quick look at cloud-based setups. The fundamentals are the same, but since it's PaaS, check out [this comparison](https://docs.google.com/spreadsheets/d/1Ee4TJyeaxRhEAlxQCoeuB0TZryv5HjoaCDiVq4a5_78/edit?usp=sharing) of log collection services across different cloud providers. (The CSV-to-markdown rendering isn't great — recommend viewing it through the shared doc link above.)

![image](https://img.iami.xyz/images/62481535-3b316f00-b7e5-11e9-8bf2-b12a2b439c70.png)

I compared Alibaba Cloud, Tencent Cloud, Huawei Cloud, and AWS across dimensions like collection methods, querying, storage, consumption, self-monitoring, and access control. Top picks are AWS and Alibaba Cloud — and within China, Alibaba Cloud SLS is the go-to.

The last thing I want to cover is data warehouse design. The core idea is **layered output** of data — it's a pipeline from raw data → structured data → metric data. There's a lot more nuance to it than that, but the high-level view shows metadata and data source layers feeding into data extraction, then into data marts and ETL jobs, ultimately producing intelligence-rich metric data and logically organized datasets, along with monitoring for the whole pipeline. It's a massive project. Under the hood, it's all built on top of `Hadoop`, `Hive`, or `ODPS` — you create different projects, write SQL, set up scheduled tasks, and wire everything up according to your predefined logic. One of the key things in this process is identifying entities and models, finding the relationships between them, and defining the attributes of each model. The `CIM` section at the bottom of the diagram pulls from `Splunk`, and you can clearly see the domain models built on top of different raw data types. Take `Vuln` for example — [check here](https://docs.splunk.com/Documentation/CIM/4.13.0/User/Vulnerabilities) to see the attributes defined for the vulnerability entity:

* cve
* tag
* url
* user_agent

Those are the more intuitive ones, but there are other attributes defined for vulnerabilities too. Similarly, `Malware`, `Email`, and others each have their own model definitions — there's a lot more where that came from.

# Other Thoughts

Lately I've been doing some standardization work on traditional rule-based intrusion detection. Wrote some docs to formalize it. The summary: there's now a data source onboarding guide, rule naming conventions, entity classification, and a debugging handbook. The idea is to map data from different sources (`hids`, `edr`, etc.) covering different entities (`file`, `system`, `network`, `host`, etc.) to different rule types (`exec`, `ioc`, `connect`, `behavior`, etc.), and produce alerts at different severity levels (scored 1-10), delivered via webhook or DingTalk to the right people. Along the way, you can also tag each rule with an `ATT&CK` identifier. That's the ideal state, of course. Standardizing across different data sources is where you'll step on the most landmines.

Step on a landmine, fill it in. Blame isn't the goal — solving the problem is. Maybe I'll write something about rule authoring next.

It's almost 1 AM as I write this.

# Resources

* [Splunk CIM](https://docs.splunk.com/Documentation/CIM/4.13.0/User/Overview)
* [Log Collection Service Comparison Across Cloud Providers](https://docs.google.com/spreadsheets/d/1Ee4TJyeaxRhEAlxQCoeuB0TZryv5HjoaCDiVq4a5_78/edit?usp=sharing)

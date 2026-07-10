---
layout: post
title:  Some Takeaways from CA/RA
categories: Security Engineer
kerywords:  Enterprise Security Internet Security
tags:  Security Operations Security Architecture Data Security
translated: true
---

The certificate system is one piece of the PKI puzzle. It's a solid real-world example of how a chain of trust actually works. I won't pretend I fully grasp every nuance of elliptic curve cryptography, but there's plenty worth writing down about certificate systems. Same as my earlier posts on KMS and HSM — this is just a running list of things to think about, not a deep architectural design doc. We're talking compliance, certificate types, supported algorithms, key strength, CA/RA deployment topology (logical, physical, host-level, database-related), network access, auth methods, monitoring, cert storage media, cert issuance flow (CSR templates, policies for office vs. production environments, expiry alerts, renewal), revocation, and requirements from dependent systems.

That said, not every situation calls for building your own PKI. And even if you do build one, you might not need a full CA/RA setup. Compared to non-finance industries, CA and RA are pretty standard systems in both fintech and traditional finance.

* Do you actually need to build your own CA or RA? Any regulatory pressure pushing you that direction? (Self-built CA and self-built RA are two different things — a big chunk of the pressure comes from internal and external regulators, each with their own standards.)
* Can your CA system integrate with an HSM? Which HSM vendors are supported, and what features do you actually use?
* Can you run an offline CA? How do you keep your root CA safely locked away?
* Do you need an Offline CA? (Offline CA means the root CA stays offline — day-to-day cert signing goes through an intermediate sub-CA.)
* Can the RA be fully API-driven? For example, CFCA in China normally requires the whole Windows + IE + CFCA Toolbox + certificate + cert password dance — super painful.
* Does it cover basic functionality? Beyond algorithm support, does it handle multi-domain certs without overflowing? What about single-cert vs. dual-cert? Composite certs? Is the CRL accessible to everyone who needs it?
* Are you relying on the HSM module inside your KMS, or buying a dedicated HSM?
* Does the Offline CA need HA? And how do you handle HA for the intermediate sub-CA?
* Should the database be on the same host as CA/RA?
* Can RA and CA live in the same network zone?
* Can the HSMs used by CA share the same rack?
* Does the HSM where certs are stored support importing network-authority certificates? (You need to think about everything that might be touched in the broader ecosystem — especially in finance, where there are tons of ecosystem-level constraints and custom frameworks. You have to consider the downstream business scenarios your service will support.)
* Can HashiCorp Vault integrate with an HSM? (Can Vault satisfy your self-built PKI needs? It doesn't support Chinese national crypto algorithms, which is now becoming a compliance headache.)
* Does the HSM support Microsoft ADCS calls?
* How do you design cert storage — workflow, media?
* What's your cert monitoring and renewal cadence?
* What's your policy for cert usage in test vs. production environments? Are wildcard certs allowed?
* How do you handle database HA? Is that your problem to solve, or should the DB team own it?
* Can the CA system auto-failover?
* In actual usage, how do you handle the different formats needed by DBs, web servers, and other consumers? Is there a browser-access scenario? How do you handle publicly-signed certs?
* Beyond full-site HTTPS, does log collection need cert-based transport? Are you signing/verifying or encrypting/decrypting?
* For certs like network-authority certs that auto-renew daily, how do you design the fetch workflow and storage solution?
* How do you get different endpoints to trust your certs — production Linux servers, Docker, Kubernetes, office Macs, Windows machines, etc.? What's the management and coordination strategy?

Beyond deployment architecture, process management, template design, and usage scenarios — my experience at my current company is colored by the fact that a big chunk of our infrastructure comes from vendor procurement. That creates a specific kind of friction: you end up with, say, a cert system from Vendor A and an HSM from Vendor B, and when you need to integrate them, coordinating the details across company lines is genuinely painful even as the customer. So project management ends up being a real part of the job — you're juggling quality, timelines, and stakeholder relationships, all while trying not to come across as throwing your weight around. It's all a skill in itself.

# Resources 

* [【CA】How to install root CA in your server?](https://github.com/mylamour/blog/issues/75)
* [【CA】How to build your own Certificate Authority](https://github.com/mylamour/blog/issues/74)
* [【CA】Overview of Certificate Filetype & How to covert it with Openssl](https://github.com/mylamour/blog/issues/73)
* [【CA】Generate CA with mkcert](https://github.com/mylamour/blog/issues/72)

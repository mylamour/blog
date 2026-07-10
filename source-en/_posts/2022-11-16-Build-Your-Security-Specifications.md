---
layout: post
title: Building Security Specifications - A Practical Guide
categories: Security Architect
keywords: Security Policy Security Architecture Enterprise Security Architecture Specifications SOP Security Standards Policy Standard Procedure
tags: Security Architecture
translated: true
---

# 0x01 Introduction

In my article last year about [enterprise security architecture](/my-enterprise-cyber-security-architecture/), I mentioned that doing security architecture requires management, operations, and technology to work together. But how do they work together? How should technology be implemented? There needs to be a reference point or baseline. If everything is just made up on the fly, over time there won't be much "architecture" to speak of. Documents, as a form of deliverable, can serve as the most basic reference. Today, let's look at how to build security specifications from an architecture perspective.

# 0x02 Main Content

![management](https://img.iami.xyz/images/201935506-1dc5a487-16cd-4ced-a522-22da19b96f22.png)

## Domains and Scope

* Policy is what architects mainly reference and rely on. Compared to procedures and standards, it's more abstract (using XX algorithm or implementing XX control) and technology-agnostic (not tied to using XX tool). When writing policy, you also need to build in some flexibility (exception cases). Security policy formulation mainly comes from the architecture team. Architects need to have a thorough understanding of security technologies in different domains, application scenarios (for example, should common data classification be adjusted for web3/crypto?), and their pros and cons - this is High Level Design. Taking crypto management as an example, you need to be proficient in key lifecycle management (how to generate, store, backup, recover, destroy, etc.) and familiar with various application scenarios (which symmetric key algorithms to use, for encryption or integrity checking, which asymmetric keys for authentication or encryption, length controls). Here I can also talk about how flexible design in architecture is reflected in policy. For instance, when formulating policy, you specify that DES cannot be used, and CBC padding can't be used either. Using this policy as the dividing line, there will definitely be some legacy systems using these before the policy. And the policy's effective boundary is after Release/Approve. So for these legacy systems, you need to note in the policy that certain weak algorithms are only allowed for legacy systems, while new business systems must follow the new specifications. Similarly, policy can require enterprises under the group to comply (in reality, even different BUs might not fully comply), but you can't require partners to fully comply (or partners can't fully comply - similar cases include data flows between open platforms, market makers, and investment institutions). For example, if you need to integrate someone's face recognition service, although the policy defines that X-class data must be encrypted with AES256 or above, you suddenly find that their interface only supports 3DES - what do you do? When business is the priority, you have to allow it. This needs to be planned into the policy in advance, providing an exception channel. For instance, getting approval from XX person in charge, and besides that, exceptions that violate the baseline are only allowed once and must be fixed within XX timeframe. Similarly for network security management, you need to define how to divide security zones, what applications can be placed in what zones, what permissions are needed to access what zones, etc., as well as network configuration backup and recovery, storage of logs and traffic mirrors, etc. So if special network openings are needed between these boundary zones, they need to go through a special exception process.

* Procedure is what operations teams must follow - generally standard processes for different scenarios across various platforms, products, tools, systems, etc. Usually SOPs are written by managers/leaders of frontline engineers. Though more often, frontline engineers write them and leaders review them. Writing SOPs requires a thorough understanding of technical implementations and existing resources in your domain. For example, writing device hardening or system hardening procedures - how to disable unused protocols, how to transmit logs to a centralized logging platform, how to backup, how to recover, etc. (The policy mentioned earlier would specify that backup and recovery should exist, and how often backups should be managed. The backup here refers to the specific backup process - for example, using XX command to periodically generate backup files, performing hash verification, then syncing to XXX location via XXX. There's one process for GitHub backup, another for DB, another for JFrog, etc.). Besides this, a large part of process generation is in security operations and incident response. For example, the process for handling phishing emails, dealing with endpoint antivirus software, etc. These specific scenario-based workflows are relatively easy to write, but some security engineers doing operations are often unwilling to produce processes - partly due to blind confidence, partly due to resistance to documentation work (not seeing it as technical work). But actual experience tells me that lacking SOPs creates dependency on individual capabilities (the actual responding employee) during incidents, and under pressure it's easy to lack systematic thinking.

* Standard refers more to technical standards, including definitions of standard configurations, baseline definitions, etc. We mentioned policy that defines management constraints, and procedures for using different tools in specific scenarios. Standards are the specific standard configuration documents for these tools and products. For example, if policy mentioned backup, and procedure mentioned using SSH for backup, then the company's SSH-related standard must specify the default SSH configuration - like using SSH-2 or above, curve25519, disabling 3des-cbc cipher, using hmac not md5, etc. - these are all basic technical baselines. Similarly, if using TLS, use TLS1.2 or above, which allowed Ciphersuites to use, the selection order of Ciphersuites, how to configure on the server side, how to configure on clients (iOS, Android, OSX, etc.), where certificates come from, certificate selection and configuration, etc. Generally, industries provide certain technical standard documents and best practices (whether for policy or standard, both involve referencing industry standards). You can create enterprise-applicable ones based on these standards.

## Format and Content

I won't discuss format choices like font selection and font size. Generally, the first page specifies the specification name, number, version number, approval status, history, etc. The footer notes internal use only, the header contains the number and name, plus watermark. If it's an international enterprise, you also need to prepare multilingual versions. Here's a screenshot.

![img](https://img.iami.xyz/images/202150833-1f8b8204-fb21-41f5-adc4-69369407c5d2.png)

Generally content includes these points:
* Overview and Purpose
* General Scope
* Key Definitions
* Role and Position Descriptions
* Approval Requirements
* Implementation and Exceptions

Note that when formulating, you need to reference international standards as well as domestic ones - like MLPS2.0, Cryptography Law, etc. Besides this, you need to avoid ambiguous language - be clear about scenarios and scenario constraints. Try to keep it official, and don't use descriptors like "you", "me", "him".

## Audit and Exceptions

Specifications themselves need lifecycle management. When to update, what process to go through for release, under what circumstances specifications no longer apply, etc. All released specifications (policies, procedures, standards) need approval (internally distinguish between Release and draft versions). Once Approved and Released, whether frontline engineers or management, everyone is expected to comply with the specification. But as mentioned earlier, there will definitely be exception cases. For exception cases, you can provide an exception process, but this process must have a high cost. Set exception admission criteria, elevate exception approval nodes (like line heads), set remediation deadlines (like resolve within 3 months), etc.

# 0x03 Summary

Building specifications exists as a baseline. Different baselines form a framework. We hope to build a flexible framework as much as possible, covering common scenarios. But obviously not all businesses can fit within this framework. As an architect, you're just trying to choose the most suitable solution, not the best solution.

Understanding Policy, Procedure, and Standard, you'll know where checklists in architecture reviews come from, and where knowledge bases in SDLC platforms come from. Besides this, there's another question worth thinking about: how can those making policy (policy formulation doesn't necessarily all come from architecture teams - some come from compliance teams) avoid disconnecting from operations and technical stuff? Besides establishing feedback mechanisms, you still need to understand certain technical details - for example, knowing what kind of tool achieves what kind of effect through what kind of operation.

Although I've talked so much, in reality small companies basically haven't reached the conditions for formulating policy, and large companies generally don't need to build policy from scratch (most have dedicated teams responsible). But regardless, those doing architecture still need to clearly know what these specifications look like.

//Recently discovered LaTeX is simply a magic tool for writing specification documents

//A few days ago I asked in three different group chats how to evaluate the output of security architecture groups and security architects. Facts prove that talking about experience without having gone through it is hard to align. I'll write a separate article later about how to measure this.

---
layout: post
title: Let's Talk About Data Security Again
categories: Security Architect
keywords: data security application security infrastructure security security strategy DLP CASB data classification DSMM cryptography IAM
tags: Security Architecture Data Security
translated: true
---

# 0x00 Preface

Data breaches have been happening left and right lately — one particular city has been especially hit hard, too many cases to list. As a security practitioner you can't help but feel something about it, so let me jot down some thoughts here.

# 0x01 Data Protection

When people talk about Data Privacy, the essence is really about people, not just data — "Data privacy is not about data but person." So Data Privacy focuses mostly on compliance across the lifecycle: collection, transmission, storage, processing, sharing, and destruction.

Data Security, on the other hand, focuses on the data itself and its value — specifically the security of data in different states (Data at Rest / Data in Transit / Data in Motion), things like encryption/decryption and secret sharing. In practice, these two concerns are usually handled by different teams, so it's worth separating the concepts upfront. That said, even with different teams, both Data Privacy and Data Security need to be on everyone's radar. On top of that, Data Classification, Tagging, and Tracing are universal tools that apply to both.

If you approach data protection through the lens of data classification, then beyond setting up security controls for data in different states, you also need to make sure data producers and consumers are actually following those controls.

![data control](https://img.iami.xyz/images/185795167-9d6a69ae-8cc7-46de-856c-f0b3b2eefc1a.png)

In the diagram above, C1 data is not allowed to be stored at all. C2-C3 data must be encrypted using HSM-based keys. For C1-C4 data, TLS backed by x509 certificates is required during transmission. C5 data has no restrictions. Similarly, during destruction, different procedures apply depending on whether the storage medium will be reused or leaves the controlled environment.

All of the above is data-centric thinking. But data obviously transitions between static and dynamic states, and those transitions — as well as the data itself — still need technical support. For example: a unified data source ingestion layer that scans and classifies/tags data automatically; centralized access control. On ingress, provide virus scanning for files. On egress, use a standardized 3rd-party file sharing tool and route traffic through DLP. When data needs to flow between business units within a group — say, to a risk control team or an analytics partner — consider privacy-preserving computing techniques like Federated Learning (FL).

![image](https://img.iami.xyz/images/182520933-dd09221b-fb69-4c96-b3a0-ec9bb719b03d.png)

A few more things worth thinking about:

* Data privacy lacks a universal legal definition — it varies by industry and region. How you define your classification tiers needs to closely follow your specific industry's regulations.
* Who actually owns defining the data classification framework? Legal, Audit, Internal Controls, Compliance, Security — or some combination?
* Once you've mapped out the roles and scenarios that access data (user/application), do you set different controls for each?
* What's the scope of DLP coverage? (Host / Network / Cloud / Cloud Apps / Mail)
* How does DLP coordinate with UEM and network admission tools (SASE)? Where do the boundaries sit?
* How do you verify that your 3rd-party file sharing solution actually meets your security bar?
* How do you build an Exception process for default rules? E.g., "software X is banned from being uninstalled" → "user Y is allowed to uninstall it."
* How do you bake security in from the start of a data warehouse build? If you can't get in early, how do you plug in later? (This isn't just about the data itself — it covers node authentication, user access control and permissions, log desensitization, metadata management, network segmentation, and more.)
* Does the data warehouse support multi-tenancy so the security team can operate as a tenant with their own isolated storage?
* When it comes to table-level permissions and access requests — is there just an approval workflow, or do you also have audit logs and proper permission scoping so users can only see the tables they're authorized for?
* If there's no data warehouse and you're just using a SIEM or open-source tools like ELK to collect data, how do you implement the above security controls in that context?


# 0x02 Cryptography

From the previous section it's pretty clear that cryptography is the backbone of security controls for data at rest, in transit, and in motion. Things like at-rest encryption, split-key root key management, encryption-as-a-service, and transparent encryption/decryption — these are the logical foundation for data protection. Cryptographic infrastructure is honestly one of the key pillars of data security. I've written about building out these capabilities in earlier posts, so I'll skip the details here.

![image](https://img.iami.xyz/images/182515944-0b04bf5e-46dd-4346-bb59-cd0d70bbde2e.png)


# 0x03 Identity & Access Management

IAM is about who can authenticate, what identity/role they get, what authorizations come with that role, and therefore what data they can access. Inside an enterprise, the typical flow is: HR system (e.g. Workday) provisions the user → data syncs to a directory service (AAD, AD, etc.) → an IDP provides authentication services. At the same time, applications (Service Providers) need to be configured to integrate with the IDP. The result: when users access an SP, they get redirected to a centralized login page to authenticate (user/pass + MFA, cert + MFA, OTP), and then receive the appropriate permissions in that system.

Common protocols here include SAML, OIDC, Radius, and LDAP. Where possible, prefer TLS-based variants — LDAPS, RADSEC, etc. For OIDC specifically, go with PKCE mode.

![image](https://img.iami.xyz/images/182621923-e9bebaad-62a4-4de0-af0d-2ffd2e4b64e2.png)

Side rant: vendor implementations of SAML (and honestly other protocols too) are often a complete mess — leading to all kinds of bizarre configuration requirements. Fireeye products are a particularly painful example. Within the same product line, attribute-value ordering can be completely reversed. On HX you configure `admin="appliance.role.default"`, but on ETP it flips to `appliance.role.default="admin"`. The documentation is useless; you end up solving it through trial and error. Similar issues show up during SSO integration with SaaS products — some let you configure things yourself, some require you to submit settings to the vendor, some offer a custom UI but won't let you change the callback URL, and the callback URL is pointing to an internal network address.

On top of all this, hardware keys (security keys) can strengthen the entire authentication flow, and you can also store and compute private keys inside a TEE.

A few things worth thinking about here too:

* If different business units have separate account systems, should those be unified? If unification isn't feasible, can you at least establish user-entity mappings across them?
* How do you keep application permissions in sync with the IDP? SCIM is the standard answer here.
* How do you automate the flow from "permission request submitted" to "permissions actually granted in the target system"? In other words, how do you tie ticketing workflows into permission provisioning?
* How do you provide a unified credential experience for both web UI access and CLI access? More broadly, what standards govern authentication for users vs. applications?
* How do you automate permission revocation when someone leaves the company?
* Can cloud environment identity management lean on the cloud provider's native tools? E.g., AWS IAM.
* How do you manage service accounts? Password rotation, etc. — for example, Tenable using Vault to store host account credentials for scanning while rotating passwords at the same time.
* Is network admission enforced at the endpoint level or the user level? VPN or SASE?
* What's your take on passwordless? Worth the tradeoff?
* After unified authentication, is logout a soft logout (just deleting the local token cache) or a hard logout (terminating the session at the IDP)? And does hard logout only log out of your own application, or everything?


# 0x04 Summary

Lately I've been noticing that a lot of what falls under "data security" is actually work that used to live inside basic infrastructure security and application security — it's been gradually extracted out and is becoming more specialized and systematic. PKI, for instance, traditionally sat in infrastructure security; certificate management and key management were in application security. Now they're all migrating under the data security umbrella.

That said, most data security work still depends heavily on solid infrastructure foundations — whether that's security operations or security platform engineering, I won't go into detail here. The point is: you need to standardize your system architecture (see some of my earlier posts for reference), while also making **security capabilities sink into the infrastructure layer** as a core goal of security governance.

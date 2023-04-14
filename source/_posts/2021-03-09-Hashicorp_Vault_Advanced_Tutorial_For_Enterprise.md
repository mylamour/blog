---
layout: post
title: Hashicorp Vault Advanced Tutorial For Enterprise
categories: 安全工程师
kerywords: Hashicorp Vault Enterprise
tags: Vault 安全架构 数据安全
---

In this tutorial, I'd like to share something on the principles how to design the architecture for Hashicorp Vault. Not only Infrastructure , but also Crypto and Operation. but I won't show the configuration command. and you can find those in Hashicorp Vault Homepage basically.

Requirements
* Vault enterprise Version
* Load Balance
* HSM

# 0x01 Basics

In general, Hashicorp was able to work with API, CLI, and Web UI.  I strongly recommend to use CLI for operation, API for application. and web ui has little bugs. you don't want to use that.  Basically, we can enable different auth method for each scenario and make sure it has corresponding  policy to read/write secret paths. and you can imaging  all the resources was a path within Hashicorp Vault.

For Vault enterprise version, you can find the details with this [link](https://www.hashicorp.com/products/vault/pricing), and i will have a basic intro.

* ENTERPRISE PLATFORM
It supported Disaster Recovery,  Logging & Monitoring now.  and we can use namespace to separated secrets for Tenant Isolation, also Self-Management.

* MULTI-DATACENTER & SCALE
It supported performance standby and able to scaling 

* GOVERNANCE & POLICY
It supported use HSM for the crypto part, and MFA for operation part.

* ADVANCED DATA PROTECTION
it supported Application to use KMIP in more Scenario.
![image](https://img.iami.xyz/images/110409935-083b1580-80c3-11eb-85ca-93dd3ccdfcaa.png)
(image from [ThalesGroup](https://dis-blog.thalesgroup.com/security/2019/02/11/what-is-the-key-management-interoperability-protocol-kmip-the-benefit-of-a-kmip-compliant-key-manager/))

# 0x02 Best Practice

## Infrastructure

we need to keep the services  was supported continuity of business.  it most important things for infrastructure part.

* High availability 
> There was a problem, Vault not able to prompt DR cluster to Primary role automatically. at the same time, we need to specialized the status code to avoid alarm submergence for LB.  also it need a capacity assessment.
* Data Backup & Restore
> We can backup it to  local disk or remote bucket with s3 interface, also any s3 compatible product.
* Logging
* Monitoring
> The most important things to monitor the Seal status beyond basic monitoring.
* Auditing
> We can record all the behavior audit logs

As for OS Harden, you can find it in Hashicorp Homepage.

## Crypto

First, you need to confirm which  algorithms was used.  Just kindly reminder, Hashicorp Vault was not support SM algorithms.
* Use TLS1.2 or above for any internal or external Connection which certificate was signed by Trusted CA
* Use HSM to protected Master key 
* Use HSM to enable Auto unseal (that's mean you can use vault directly  after services restarted) 
* Use HSM to gain more entropy to generate Key


## Operation

* Use Namespace to separated  secretes for each team or application.
* Use SSO/LDAP/Github/K8S to login into account but not  Local Account
* Use token for Application and Services
* Use leases Manage
* Use PGP public key to protect the  key shares and send it to different key custodian
* Use MFA
* Use Terraform to manage the Vault , it was the first step to the Infrastructure as a code
* Use Entities for user if they have different auth method, and make sure it was managed by groups 

# 0x03 Scenario

## Secret As A Service
As mentioned before, all resources in Hashicorp Vault. you can imagine it is a path.  And there was a basic function  for  different secret engine. in general, KV engine can store any key-value.  and it suitable  for most scenario.   

### Service Account Management 
It was little bit different with KV Engine.  We can use vault to manage IAM Users or Service Account. as you can see in the dashboard, it support to manage the AD Service Account, Azure/Google/Alibaba Cloud IAM users. 

### Key Management 
In fact, we can use KV engine to implement this function, you can keep all credentials or secrets with KV Engine.  Besides that, vault provide a Google cloud KMS Engine.  also we can use vault as a KMIP Server with KMIP Engine. 

### Dynamic Secrets
Dynamic secret  is necessary for the key point. and I just give two scenario.  the first one is to rotate password for all the virtualization host.  e.g, we can integrated it with VMware or Other hypervisors. and rotated all the Linux/Windows host password regularly.  the second one is to rotate database password.  Application can get the temp username and password  each time when it try to connect  to database.  and it will changed automatically  after the lease time passed.

## Encryption As a Service
Transit engine was included generally ,  even for open source version. and we can enable different transit engine for different services , also it was able to store & rotate the transit key.  and it support version management for the key.  in general,  application can get the ciphertext after send the plaintext to the transit engine. then can store it to anywhere.  here is a simple explanation from Hashicorp learning center. 

![image](https://img.iami.xyz/images/110428807-ddfa4f80-80e4-11eb-9d2e-d7ed2ba5d26e.png)

## PKI Services 
we can use PKI Engine to build a  PKI Service simply , and it only have basic function , so I will not intro it here. if you want know to build a Internal CA, you need to use a more professional product, e.g. EJCBA.  

# 0x04 Conclusion 

Hashicorp vault is to be satisfied more scenario in most Enterprise.  But also it still need to improved in some ways.  e.g. Prompt DR Cluster to Primary  automatically if the primary cluster was done.   

Anyway,  It was only some suggestions in architecture design. you need to considered more details to make sure it was tailored.  and there would be more difficult in the implement process.  

# Resources
* Namespaces: https://learn.hashicorp.com/tutorials/vault/namespaces
* KMIP:  https://dis-blog.thalesgroup.com/security/2019/02/11/what-is-the-key-management-interoperability-protocol-kmip-the-benefit-of-a-kmip-compliant-key-manager/
* Transit Engine: https://learn.hashicorp.com/tutorials/vault/eaas-transit
* PKI Engine: https://learn.hashicorp.com/tutorials/vault/pki-engine
* Azure Engine: https://learn.hashicorp.com/tutorials/vault/azure-secrets
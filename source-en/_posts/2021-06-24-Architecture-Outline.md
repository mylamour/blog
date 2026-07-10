---
layout: post
title: Architecture Outline
categories: Security Architect
kerywords: enterprise architecture application architecture security architecture data security enterprise data architecture
tags: Security Architecture
translated: true
---


> Notes from PayPal's Spring 2021 Architecture Conference — got a real education from the Distinguished Architects there. Keeping things high-level here since this came from internal sessions, so just the key points, no deep dives.

# 0x00 Overall Design
Overall design is basically blueprint-level work. It covers the full enterprise architecture from business to IT, from localization to globalization and back to localization. The idea is to build the infrastructure that supports all business lines, abstract shared capabilities out of individual product lines into common platforms, and serve different customer segments from there. Every company should have its own blueprint — that's what enterprise architecture is — and use it as the standard to drive everything else.

* Infrastructure & Security: infrastructure, data platforms, security, dev platforms, group services, etc.
* Common Platforms: cards, risk, payments, auth, compliance, finance, customer service, etc.
* Product Lines: xxx, yyy, etc.
* Customers: consumers, merchants (SMB, enterprise, partners), global localization (xxx, fast-track markets, yyy), etc.

# 0x01 Application Architecture
Products are the direct expression of the business. So what properties should you think about when designing the application architecture that supports those products? What design patterns do you need? And how do those patterns differ at different levels?

## 1. Architecture Standards
* Actionable principles
* Guides
* Reference architectures
* Vetted executable code examples and tools

## 2. System Goals
* Secure
* Reliable
* Cost-Effective
* Highly Performant

## 3. Architecture Quality
* Universal
    * Security
    * Legal & Regulatory
    * DR
* Exported
    * Availability
    * Performance
    * Capacity
    * Isolation (AZ, Edge, Regions)
    * Visibility
* Local
    * Cost Efficiency
    * Extensibility
    * Operability
    * Maintainability
    * Scalability

## 4. Resilience Patterns
* Bulkhead
* Circuit Breaker
* Compensating Transaction
* Health Endpoint Monitoring
* Leader Election
* Queue-Based Load Leveling
* Retry
* Scheduler Agent Supervisor

# 0x02 Data Architecture
This was the first time I really got what data governance actually means — mapping it from concept to real work. The enterprise data strategy drives data governance to deliver business value, and it gets implemented through organizational structure, technical management, process control, policy standards, and the Change Management between all of them.

## 1. Data Governance
* Organizational structure and operating model
* Policies and processes
* Data domain model and ownership
* Data issue management
* Data change management

## 2. Data Quality
* Data analysis
* Business rules and thresholds
* Data cleansing
* Data remediation
* Data quality reporting

## 3. Metadata
* Business classification
* Data dictionary
* Metadata management and maintenance
* Metadata access

## 4. Master Data
* Standards and aggregation
* Business and data rules
* Data hubs and common services
* Master data persistence
* Master data access

## 5. Data Operations
* Data lifecycle management (Collect -> Store -> Use -> Share -> Destroy)
* Data provisioning and source certification
* Data transfer and persistence
* SLA management
* Data certification

## 6. Platform & Architecture
* Data model
* Data management platform
* Data integration
* Data architecture

## 7. Data Protection
* Data security
* Data privacy

## 8. Data Risk Management
Skipping the details.



# 0x03 Best Practices
A few notes on globalization design and observability architecture for platform design.

## 1. Architecture Design
One thing that stood out: the same property can land in completely different buckets depending on when you're thinking about it. For example, when you're designing application architecture using the Universal/Local/Exported model, security gets covered under Universal. But when you're doing an architecture review, security shows up as its own standalone category — does this meet compliance and security requirements? Same thing happens with Scalability, Stability, and others getting sorted into different buckets.

* Scalability
    * Capacity
    * Scalability
    * Visibility
    * Performance
    * Efficiency
* Stability
    * Availability
    * Operability
    * Isolation
    * Maintainability
    * DR
* Speed
    * Extensibility
    * Testing Strategy
* Simplicity
    * Cost Effectiveness
    * Reduced Technical Debt
* Security
    * Compliance
    * Security

## 2. Observability Platform Architecture
E2E (Collect -> Ingest -> Process -> Index/Store -> Alert -> Query/Visualize)

* Architecture
    * Observability & Monitoring
    * Deployment
        * Core development
        * Ingestion pipeline
        * Access
        * HA & Fault Tolerance
        * Security
        * Coverage
    * Logging, Tracing, Metrics, and Alerting Features
* Availability & Lag Measurement
* Subsidiary Convergence

## 3. Globalization Architecture Design
Comparing domestic business treated as a localized part of a global operation, you can see some of these design principles playing out pretty clearly.

* Product Content
    * Separate Code and Content
    * Independent Deployment
    * Personalized Content
* Globalization framework
* Localization support
* Front-end SDKs


# 0x04 Conclusion
Not hard to see that whether it's data lifecycle management, application lifecycle management, data security, application security, or the entire security program — they're all just pieces of the overall enterprise architecture. I intentionally left security architecture out of this post. The goal was to strip away the preconception and look at applications and data on their own terms first.

* Every property needs a corresponding way to measure and evaluate it. Take Availability — you can evaluate it anywhere from human review & audit all the way to chaos testing.
* Some properties map to specific patterns to help you actually implement them.
* Reliability: Availability, Isolation, Capacity, Scalability, Operability.
* How do you take concepts Google introduced — like SRE -> SRCE (C: Cloud) — and actually land them in an enterprise context?
* Quality keeps popping up in different categories. It's more about using modeling to surface concrete things that fit a given theory.
* How do you go from engineer to architect? Start by figuring out what problems architecture is actually trying to solve, then figure out what skills you need. Study up, compare against experience, and turn it into knowledge.
* Different BUs have built up different strengths on top of the shared infrastructure. Some teams have Infrastructure as Code dialed in, others have containerization nailed. All worth learning from.

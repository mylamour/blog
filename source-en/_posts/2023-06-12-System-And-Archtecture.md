---
layout: post
title: System and Architecture
categories: Security Architect
kerywords: Security Architecture Enterprise Security Security Design Security Governance Security Validation
tags: Security Architecture
translated: true
---

> Written on June 12, published on June 16

> Well-structured creative activity beats unstructured creative activity. — *System Architecture: Strategy and Product Development for Complex Systems*

> A note upfront: life and work have both been pretty packed lately, and I've hit a plateau technically for a while now. So I've been trying to read through books while summarizing cases, hoping something clicks. Not a ton of new insight, but worth jotting down. This post is mainly drawn from *System Architecture: Strategy and Product Development for Complex Systems*. The unfortunate thing is: people without experience won't follow it, and people with experience may not need it.

Before diving in, let's be clear on what a system actually is. Simply put: **a system is a collection of entities and their relationships, where the emergent function of the whole is greater than the sum of its parts**.

* **The relationships between entities in a system are mainly of two kinds: functional relationships and formal relationships**. Functional relationships are sometimes called interaction relationships; formal relationships are sometimes called structural relationships. Worth noting: **functional relationships generally require formal relationships as a prerequisite**.
* **Beyond functional emergence, systems also exhibit other emergent properties — things like reliability, maintainability, operability, security, and performance. Unexpected emergent properties are what we usually call emergencies**.

The form a system takes depends on how you're cutting it. For example, a product can be a system (though **some things are products but not systems, and some things are systems but not products**). DLP and UEM are each independent systems, but when you lump them together under "office network security" and treat the whole thing as one system, DLP and UEM become modules/components. Same logic applies to people — a person has organs and is a system; a team has members and is also a system.

The "unexpected emergent properties" mentioned above actually break down into two scenarios: **one where the expected good emergence fails to appear, and one where unexpected bad emergence shows up**. Both cause system failures.

Understanding emergence is really the core goal of systems thinking. You can only master a system by working to understand and predict its emergent properties and how they affect the system. There are three main ways to predict emergence:

* Precedent — reasoning from experience.
* Experiment — validating hypotheses through combinations, e.g. spiral development.
* Modeling — completing design through data and computation, e.g. integrated circuit development.

In architecture work, you want to avoid pure reliance on precedent. Instead, abstract experience from cases into standards/policies/SOPs for later modeling, and gradually shift toward modeling as the primary approach for daily tasks. For example, in architecture reviews: some parts rely on experience, some need POC (experiments), but what's really needed is the ability to use modeling to control and track the architectural design results. Take a cloud system's network architecture — once you've drawn it out, you can apply industry-standard controls based on the IaaS provider's product characteristics, and also flag issues against custom policy rules (e.g. custom network security zones).

What if a system has no precedent, can't be experimented on, and can't be reliably modeled? In that case, you're mostly relying on judgment to reason things through — but you still want to find as much supporting evidence as possible before reasoning about the emergent functions, or try using incomplete modeling. You can think top-down or bottom-up, outer-in. Of course, all of this is within the bounds of systems thinking. If you have the budget to fail fast, creative thinking can absolutely be its own kind of adventure.

So when we're analyzing a system, what do we actually need to figure out?

* What is the system's form (what it is) and function (what it does)?
* What is the system boundary and its environment?
  The system boundary sits between the system and the larger environment. When entities inside the system have formal or functional relationships with entities outside the system, those relationships cross the external interface.
* What is the form and function of each entity within the system?
* What are the relationships between entities and at the boundary — and what are the form and function of those relationships? (Form and function are the two big buckets: what something is, and what it can do.)
* What are the emergent properties of the system (the functional interactions between entities)?

Once you have answers to all of the above (form and function, entities and relationships, abstraction and emergence, boundaries and environment), there are still two higher-level goals left:

* **Predict how the system changes when a given entity changes**
* **Synthesize the entire system from its components**

**Complex systems are made up of many highly interdependent, highly interconnected, or highly intertwined elements and entities**. Decomposition is the most common way to handle complex systems — though the decomposition itself isn't the hard part. Integration is where you need to think more carefully, like whether different entities can actually be properly joined together. Hierarchy is another useful lens for thinking about complex systems — and then doing decomposition at different levels of that hierarchy. The AWS Well-Architected Framework's Six Pillars is a good example. Things that lose all meaning the moment you decompose them are called atomic parts. There are also some logical relationships to keep in mind when managing complexity: 1. class-instance; 2. specialization-generalization; 3. recursion.

Architecture is exactly **an abstract description of the entities in a system and the relationships between them**. Put another way, architecture **is the allocation of the correspondence between form and function, and the definition of relationships between elements and between elements and their environment** (yes, that's a mouthful in the original too). Important distinction: form and function are both properties of a system, but architecture is not — it's the mapping between form and function. As an architect, one of your jobs is to train your thinking so you can understand complex systems, ideally quickly, while also being able to build systems that are easy to use and understand. And **easy to use doesn't mean simplistic — it means not hard to understand, even with a certain level of complexity underneath**.

As mentioned earlier, entity relationships are mainly formal and functional. Form is what has been or will eventually be realized — it includes all entities and describes what the system is and how it carries certain functions. So form is basically formal entities plus structure (structural relationships are mainly spatial/topological and connection relationships, plus address, sequence, membership, ownership relationships, etc.). These formal relationships can be represented using a Dependency Structure Matrix (DSM), or through SysML and OPM (Object Process Methodology). UAM and MBSE are also worth looking at if you're curious.

The principles of system architecture are: Emergence, Holism, and Focus. When observing a system's form, the holism principle is very effective. Applying holism to observe a system and its environment, you can break things down into the whole product system (which includes the product/system itself plus the accompanying system — and you still need to define the system boundary), and the context of use. For software systems, code is the formal object. Software's form can be decomposed into modules and procedures, then further into individual lines of code. The whole product system includes the code, compiler, CPU, OS, and so on. One thing that's slightly different from physical system abstraction is that the form of information systems always needs some physical form to store or encode it.

Alongside form, there's also the activity of function. The functions we use at the surface of a system emerge from the interactions between functional entities inside the system and from the whole product system. That's the real challenge of system design. **Functions can be decomposed into two parts: processes and operands**. Operands can be thought of as objects; processes are transformation patterns that act on one or more objects — usually involving creating, destroying, or changing operands. **To do architecture well, you must stay focused on the emergence of externally visible functions**. And those external functions and performance properties emerge from internal functions and relationships. Beyond the three methods already mentioned (precedent, experiment, modeling), internal functions can also be analyzed through reverse engineering, standard blueprint method, and metaphor method. The standard blueprint method refers to how certain functions naturally generate a set of internal functions that stay stable for many years. For example, transporting heavy objects requires overcoming gravity, overcoming resistance, and moving the object forward. Making decisions requires gathering information, generating alternatives, establishing criteria for evaluation, assessing alternatives, and confirming the final choice. Once you've identified the internal functional entities, you also need to confirm functional interactions (processes exchanging or sharing operands between each other). **Functions and functional interactions together form the functional architecture**. This can be analyzed specifically using a PO matrix (rows are processes, columns are operands), which can also be generated from an OPM diagram. **If a system can create significant value at a reasonable cost, that system has high value** — and that means putting effort into high-value operands. For IDS, that's detecting intrusions and generating alerts; for XSOAR, that's automating SOPs.

Form, function, and functional interactions are all static analyses. When a system is actually running, you also need to pay attention to operators, operational behavior, and operational cost. **Behavior is a sequence made up of functions and the state changes associated with those functions — the formal objects in the system should execute their functions in this order**. Think: login and logout. As for operational cost, that's something architects need to treat carefully in architecture decisions. It's made up of direct costs (R&D costs) and indirect costs (maintenance, upgrades, etc.), and it ultimately determines whether the system you design is actually competitive.

The content above covers form, function, environment, and relationships in system architecture. The parts I haven't gotten to yet are "concept" and the path from concept to architecture. I'll circle back and wrap those up when I have time — honestly, just reading the original book might be more effective. I had a few examples ready to go, but the text itself probably needs a bit of digesting first, so I'll hold off. Not sure if I've just been writing less lately, but even getting a single blog post out takes a few evenings of spare time now. Gotta write more consistently.

Finished at 10 PM on June 16, 2023.

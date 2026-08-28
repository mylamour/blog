---
layout: post
title: "SDLC in the AI Agent Era: Reapplying Security Engineering"
description: "Security governance, architecture reviews, defense in depth, identity, and cryptographic infrastructure did not become obsolete when agents arrived. What changed are the actor, the boundaries, and the speed. This article explains how those principles apply to an SDLC with agents, and which controls must become machine-verifiable."
categories: CTO
tags: [Security Architecture, AI Software Engineering, Agentic SDLC]
keywords: [AI Agent SDLC, AI-Native SDLC, Security Architecture, Policy as Code, Workload Identity, PKI, KMS, Evidence]
translated: true
---

> Claude's [“AI-Native SDLC Playbook”](https://claude.com/blog/the-ai-native-sdlc-playbook) discusses how to bring AI into Plan, Design, Build, Test, Deploy, and Maintain. It redesigns how people, AI, processes, and artifacts work together.
>
> The question I want to pursue is not whether we need to invent another SDLC. It is this: when an agent can read private repositories, run commands, call external services, modify multiple repositories, and even affect real environments, how should existing security governance, architecture reviews, defense in depth, identity and access controls, and cryptographic infrastructure be repositioned?
>
> To answer it, I went back through the articles I had written under the “Security Architecture” tag. The conclusion is not new: **the established principles of security engineering still hold; what changed are the actor, the boundaries, and the speed.**
>
> This article is about agents participating in software delivery. It is not about the lifecycle of AI/ML models, nor is it about how to build an agent product. I occasionally use `Agentic SDLC` as a descriptive label.
>
> *Co-created with AI.*

# 0x00 The Old Principles Still Hold; the Actor Has Changed

<!-- ![img](https://img.iami.xyz/images/agent-sdlc/agent-sdlc-architecture-chapter-00.png) -->

When I wrote [“What is Security Architecture”](https://iami.xyz/security-architecture-review/) in 2019, I placed security architecture at the intersection of business, applications, networks, deployment, and operations. **An architecture review is not a meeting followed by a checklist. It identifies risk from the business and its data flows, proposes solutions, and then tracks whether those solutions were actually implemented.**

Later, in [“Modern SDLC and Security Architecture Review”](https://iami.xyz/modern-sdlc-and-security-architecture-review/), I still argued for three things:

1. Use approved policies and specifications as the basis for review, rather than personal preference.
2. Use platforms to bring scanning, risk, exceptions, and release gates into the development process.
3. Put design, architecture, threat modeling, risk management, knowledge, and system integration into one lifecycle.

[“Building Security Specifications: A Practical Guide”](https://iami.xyz/build-your-security-specifications/) separated that chain more clearly:

- **Policy** defines principles, scope, and the baselines that cannot be casually crossed.
- **Standard** translates those principles into technical baselines.
- **Procedure / SOP** specifies who does what, under which conditions, in a given scenario.
- **Exception** allows the business to depart from a baseline only with an explicit owner, approver, compensating controls, and expiry date.

[“Security Architecture in Practice: From Security Governance to Security Verification”](https://iami.xyz/from-security-governance-to-security-verification/) reduced it to a feedback chain:

```text
Business and risk
  -> Governance and authoritative specifications
  -> Scenario-specific design
  -> Engineering implementation
  -> Independent verification and continuous operations
  -> Feedback, correction, or risk acceptance
```

This has been the most consistent thread in my writing. **Security architecture is not a product inventory or a transcription of “best practices.” It combines business scenarios, organizational responsibilities, technical implementation, and operational capability into a system that can be delivered continuously.** There is no universally best solution—only one that better fits the current business, infrastructure, cost, and risk constraints.

**Agents did not invalidate these principles. What is disappearing are some of the constraints that organizational separation, human waiting time, and system boundaries used to provide naturally.**

# 0x01 Agents Turn Implicit Boundaries into Explicit Control Problems

In a traditional SDLC, requirements, design, development, testing, release, and operations are usually handled by different people, at different times, in different systems. That process is not always efficient, but it provides several boundaries for free: developers usually cannot unilaterally approve the risks they introduce, testing and release offer another opportunity to observe the result, and production credentials do not automatically appear in a developer's hands.

An agent can cross all of those stages within one task. It can write the implementation, choose the tests, explain failures, generate a report, create a PR, trigger a deployment, and then announce completion. **Once the pace increases, the separation of duties that used to hide inside waiting periods and handoffs is no longer reliable.**

![img](https://img.iami.xyz/images/agent-sdlc/agent-sdlc-architecture-chapter-01.png)

| Implicit boundary we used to rely on | What changes when agents participate | What must become explicit |
|---|---|---|
| Division of labor stands in for identity and responsibility | One account may represent a person, an agent, a runner, a retry, or a successor | Separate human authority, agent/session/attempt identity, workload identity, and the evidence issuer |
| Stage handoffs create another review point | One agent can cross several stages continuously | Every state transition has inputs, outputs, admission conditions, and legitimate failure exits |
| Human waiting time limits the speed of action | Agents can create side effects rapidly and in parallel | Task-scoped grants, rate and budget limits, and revocable paths |
| Engineers choose their own context | Agents read repositories, web pages, issues, and tool output | Provenance, authority, digest, freshness, and applicability must be checkable |
| Review is assumed to be independent from authorship | An agent may modify both implementation and tests or validators | Fixed decision rules, protected verification environments, and review of verification-mechanism changes |
| Operations rechecks successful deployments | Agents can mistake a script's return value for a runtime fact | Artifact provenance, workload identity, configuration, business semantics, and rollback readback |
| People decide when to stop after failure | Agents tend to retry, degrade, or switch paths until something turns green | `NOT_RUN`, `HITL`, `FAILED`, cancellation, handoff, and revocation are legitimate outcomes |

In this article, `Agentic SDLC` describes only this situation: **an agent, with tools, state, constrained permissions, and the ability to create side effects, participates in an existing software lifecycle.** It does not mean a fully autonomous SDLC, nor does it mean the lifecycle for building an agent product.

The real question is not whether the agent is smart enough, but whether the system can answer four simple questions:

1. **Who authorized it to do this?**
2. **Which objects did it actually affect?**
3. **Who verified the result, and with which rules?**
4. **Who is responsible for stopping, revocation, and recovery?**

# 0x02 Repositioning Established Security Engineering Principles

Putting the earlier articles back together makes one point clear: **governance, defense in depth, and cryptographic infrastructure are not separate topics. They belong on the same delivery chain.**

| Established security principle | The original problem it addresses | Implementation when agents participate |
|---|---|---|
| Governance and specifications | Where do the rules come from? Who approves them? How are exceptions handled? | Machines consume an approved policy projection with a version and applicability; exceptions bind an owner, expiry date, and compensating controls |
| Architecture review | Are the business, data, dependencies, and threats visible? | Before task admission, bind scope, dependencies, data flows, acceptance criteria, and stop conditions; reject progress when critical facts are missing |
| Shift Left | Move appropriate controls into design, coding, build, and resource-creation stages | Before an agent receives the ability to create side effects, perform task admission, policy matching, scope and dependency analysis, data classification, context-freshness checks, exact-revision binding, and permission checks; workload identity, business semantics, and recovery still require verification in the real environment |
| Security by Default | Avoid asking every project to request and configure the same controls manually | Default to read-only access, the minimum tool set, isolated workspaces, denied unrelated network and filesystem access, and short-lived identities |
| Defense in depth | Preserve independent defenses when one control fails | Task gates, identity gates, tool sandboxes, code review, independent CI, artifact admission, and runtime readback use different evidence and permissions |
| Identity and separation of duties | Who may act, approve, and audit? | Separate human authority, agent identity, workload identity, reviewer, approver, and evidence issuer |
| Trust establishment and authentication (PKI) | Establish, issue, renew, and revoke trust | Issue short-lived certificates to agents, runners, and services; make issuance, renewal, revocation, and trust distribution auditable |
| Key and credential management (KMS/HSM) | Manage the lifecycle of secrets and keys | Agents receive only a secret reference or short-lived lease; key generation, use, rotation, backup, recovery, and destruction remain inside the cryptographic boundary |
| Data security | Control data across collection, transmission, storage, use, sharing, and destruction | Classify prompts, context, logs, evidence, and memory; minimize collection, restrict egress, and define retention and deletion |
| Design for failure | Controls, processes, and operations will fail | Preserve kill, revoke, rollback, checkpoint, and handoff paths, and continuously verify that the controls themselves still work |

In [“Has Security Actually Shifted Left?”](https://iami.xyz/security-shift-to-left/), I described Shift Left as **moving security-by-default capabilities earlier**: move application controls from runtime into architecture and CI/CD; move infrastructure controls into IaC and resource creation; and move data protection toward data creation and the access layer. That argument still holds in the agent era.

What needs to move earlier has changed. In the past, we primarily moved scanning, baselines, and configuration checks earlier. Now, before an agent is granted side-effecting capabilities, the system must also complete task admission, policy matching, scope and dependency analysis, data classification, context-freshness checks, exact-revision binding, and permission checks. Put differently, **Shift Left is no longer only about finding code defects earlier. It must also decide earlier whether an automated action may happen at all, and within which boundaries it may happen.**

But not every proof can shift left. Whether an artifact was truly deployed, whether the workload identity is correct, whether the business semantics hold, whether cancellation took effect, and whether rollback restores the system can only be verified in the real environment. The agent era therefore needs:

```text
Security by Default: provide secure boundaries by default
Shift Left: complete admission and constraints before side effects occur
Runtime Closure: verify results and recovery in the real environment
```

The right direction is **to move controls earlier while preserving runtime closure—not to move every form of verification to the left.**

## 1. Rules Must Be Machine-Usable, but Authority Must Not Move into the Prompt

The distinction among Policy, Standard, and Procedure matters even more in the agent era.

`AGENTS.md`, `CLAUDE.md`, Rules, and Skills can project rules into different tools, but they are not inherently authoritative. **A real rule still has to answer: who approved it, which version applies, which repositories and environments it governs, when it takes effect, when it expires, and how exceptions are requested.**

An agent may read a policy, but it cannot gain administrative authority because a prompt says, “you are an administrator.” Nor may it silently expand scope, rewrite acceptance criteria, or convert a temporary bypass into a permanent rule. An exception without an approver, reason, compensating controls, and expiry date is simply another permanent backdoor.

Architecture review cannot be reduced to asking a model for a threat list either. At a minimum, the review must bind the business objective, system dependencies, data flows, trust boundaries, critical assets, failure impact, and risk owner. An agent can help organize and check those facts, but it cannot replace the final business judgment or risk acceptance.

## 2. Defense in Depth Is Not “Add Another Agent”

I have long understood defense in depth as independent controls across a layered architecture: systems, networks, identities, and data each absorb different failures. Separation among key custodians and among import, assignment, enablement, and disablement roles—as well as separating certificate issuance from certificate use—are also forms of depth.

The same applies to agents:

```text
Task admission
  -> Human authority and task-scoped grant
  -> Agent / workload identity
  -> Tool gateway, filesystem, and network sandbox
  -> Change scope and branch protection
  -> Independent verification
  -> Artifact admission
  -> Deployment identity and runtime readback
  -> Revocation, rollback, and recovery
```

Those layers must have different permissions and failure modes. **Having a second model review the first does not automatically create defense in depth. If both share the same stale checkout, the same incorrect context, and the same candidate validator, they merely repeat the same assumption.**

The security controls themselves also need protection. If a candidate change can modify the validator, workflow, policy, and tests alongside the implementation, its own green result cannot issue a trustworthy conclusion. That is no different in principle from deploying a security product with zero active policies, broken logging, or certificate checks that ignore expiry.

## 3. Identity and Cryptographic Infrastructure Form a Trust Chain

When I wrote about KMS/HSM, CA/RA, Vault, and SoftHSM, I was not concerned only with algorithms. I was concerned with a complete system: identity, authorization, key generation and storage, certificate issuance and distribution, rotation, revocation, backup and recovery, auditing, monitoring, performance, and cross-system integration.

With agents, that chain can be applied like this:

```text
Human authority
  -> Task-scoped grant
  -> Agent / session / attempt
  -> Runner workload identity
  -> Short-lived certificate or secret lease
  -> Tool and external-service calls
  -> Audit, expiry, revocation, and rotation
```

CA/RA determines who may receive which certificate and how that certificate is renewed and revoked. Vault and KMS/HSM govern the conditions under which secrets and keys are generated, used, rotated, backed up, and destroyed. **An agent does not need to see a long-lived private key or raw cloud credential. It needs only a short-lived, minimally scoped, revocable right to use the required capability within an authorized execution boundary.**

**Raw credentials should never enter prompts, chat logs, or long-term memory.** When an application needs to decrypt, sign, or obtain a temporary database account, it should call Vault or KMS/HSM at the workload boundary. The infrastructure performs the cryptographic operation and records the audit trail.

SoftHSM still has value. In development and testing, it can verify PKCS#11 integration, CA issuance, non-exportable keys, and application workflows. But passing a SoftHSM test proves only that the interface and workflow function in the test environment. It does not prove the physical protection, dual control, compliance certification, disaster recovery, or operating capability of a production HSM.

## 4. Context and Evidence Are Part of the Data-Security Lifecycle

When writing about data security, I have typically followed collection, transmission, storage, use, sharing, and destruction. Agent context, prompts, logs, screenshots, traces, tool output, and long-term memory must pass through the same lifecycle.

At a minimum, ask:

- Does the agent genuinely need this data, or can it receive only a summary or redacted fields?
- Where did the data come from, who authorized it, which task does it apply to, and is it stale?
- Which information may enter model context, and which may be used only at the tool-execution boundary?
- Do outputs and logs contain credentials, personal information, customer data, or internal paths?
- How long is the evidence retained, who can read it, and how is it deleted or sealed after the task ends?
- If data crosses regions, organizations, or a third-party model boundary, does the transfer comply with regulatory and contractual constraints?

**“We used TLS” or “the data is encrypted” is not proof that data security is complete.** Certificate trust, caller identity, key ownership, data classification, access authorization, retention, and destruction still have to be verified.

# 0x03 Which Controls Must Be Machine-Verifiable

**Machine-verifiable does not mean handing every judgment to a machine.** Business objectives, risk acceptance, material exceptions, and production authority still belong to authorized people. Machines are better suited to making sure applicable rules cannot be forgotten, objects and revisions cannot be swapped, and missing evidence cannot be written as green.

| Control point | Facts that must be recorded at minimum | Behavior on failure |
|---|---|---|
| Task admission | task ID, owner, scope, risk, acceptance, dependencies, stop conditions, exact base revision | Do not begin when facts are missing or conflicting |
| Authority and identity | human approver, agent/session/attempt, workload identity, grant scope, expiry | Reject side effects when identity is unknown, authority is insufficient, or the lease has expired |
| Context | source, authority, content digest, freshness, applicability | Invalidate old conclusions when provenance is untrusted or content changes |
| Execution environment | image/runtime, dependency lock, worktree, filesystem and network permissions, credential class | Reverify after environment drift |
| Change and impact | actual diff, owned paths, dependency closure, whether the validator changed | Stop when writes exceed scope or impact remains unknown |
| Verification obligations | policy source, fixed decision rule, command, fixture, environment, result | `NOT_RUN`, `ERROR`, and `UNKNOWN` cannot advance |
| Artifact admission | source revision, builder, artifact digest, SBOM, signature, policy result | Reject release when provenance or digest cannot be matched |
| Deployment and runtime | environment, workload identity, configuration, instance identity, migration, business semantics, rollback ref | With only a successful script result, remain “unproven” |
| Cancellation and recovery | kill/revoke result, checkpoint, handoff, remaining subprocesses and remote actions | Do not claim the task ended when stop confirmation is missing |

A task record can be small, but it cannot be only the natural-language sentence “please do this well.” At a minimum, it should bind the objective, scope, accountable owner and risk, exact revision, acceptance criteria, dependencies, and stop conditions. An agent may request changes to those fields, but it may not silently rewrite an admitted task.

**Results must not be flattened into a single `passed=true` either.** At a minimum, distinguish `PASS`, `FAIL`, `NOT_RUN`, `FLAKY`, `ERROR`, `UNKNOWN`, `CONFLICT`, and `NOT_APPLICABLE`. Enter `HITL` when human judgment is required; use `FAILED` or `HANDOFF` when the workflow cannot continue. These are legitimate states. There is no need to retry until something turns green.

More importantly, do not mix facts from different layers:

```text
Evidence
  -> VerificationResult
  -> Receipt
  -> Decision
  -> Outcome
```

- **Evidence** is a log, screenshot, trace, artifact, or source-code window.
- **VerificationResult** is the conclusion a fixed decision rule draws from the evidence.
- **Receipt** binds that result to the task, subject, revision, environment, and policy.
- **Decision** is a state transition made by an authorized party on the basis of the receipt.
- **Outcome** is what actually changes in the real world after deployment or during runtime.

**A screenshot is not deployment authority; a green job is not necessarily a trustworthy receipt; a merged PR is not a business outcome.** Only by separating these layers can we know who is authorized to stand behind which conclusion.

## A Multi-Agent, Cross-Repository Delivery Example

Suppose one change spans a shared contract, a producer, a consumer, and a deployment environment. **The correct order is not to let three agents race on one shared branch. First bind dependencies and ownership:**

```text
Accepted architecture decision / contract
  -> Contract repository
  -> Producer repository
  -> Consumer repository
  -> Artifact admission
  -> Deployment and runtime readback
```

Each child task uses its own branch, worktree, owner, and owned paths. When the contract changes, both producer and consumer must run their own contract verification. A new push invalidates evidence bound to the old head. Repositories move forward in dependency order; several green PRs do not become one completed transaction.

Local tests help an agent correct inexpensive errors quickly, but final verification must recompute the actual diff, affected closure, and applicable obligations, then bind the result to the exact PR head or merge-group revision. If the candidate also changes tests, workflows, or validators, the verification mechanism itself requires independent review.

# 0x04 Put the Controls Back into the Real Software Lifecycle

These controls do not require building a complete, all-encompassing agent platform in one step. A more practical approach is to retain the existing SDLC and add agent-specific identity, boundaries, and evidence at the handoff points that need the most protection.

| Stage | What established security engineering still covers | What agents add | Evidence required before advancing |
|---|---|---|---|
| Plan | business objective, compliance, data classification, owner, risk, exceptions | bind task scope, available tools, budget, stop conditions, and human authority | approved task, applicable policy version, risk owner |
| Design | architecture review, threat modeling, data flows, trust boundaries, cryptographic design | mark agent-readable data, external capabilities, identity, and revocation paths | architecture decision, dependency graph, data classification, acceptance criteria |
| Build | secure coding, dependency governance, secrets management, least privilege | isolated worktree, owned paths, short-lived identity, deny-by-default sandbox | exact diff, dependency changes, environment fingerprint, no out-of-scope writes |
| Test / Review | SAST/SCA/testing, human review, separation of duties | fixed decision rules, independent affected-closure calculation, protection against self-review and candidate-modified validators | applicable obligations and results on the exact revision |
| Merge / Release | change management, branch protection, artifact and supply-chain controls | bind verification receipt to head; automatically invalidate old approval after a new push | merge decision, artifact digest, SBOM, signature |
| Deploy | configuration management, PKI, credentials, staged rollout, rollback | workload identity, short-lived secrets, instance and business-semantic readback | source-artifact-environment correspondence, runtime identity, rollback ref |
| Maintain / Learn | monitoring, audit, rotation, response, retrospective, improvement | revoke agent grants, clean up remote actions, quarantine “lessons” that have not been independently reproduced | stop confirmation, certificate/lease revocation, independent reproduction, correction record |

Two boundaries must not be swallowed by automation.

First, **machines execute rules; people carry authority.** A machine can determine that a signature is missing, scope was exceeded, or a test did not run. It cannot unilaterally accept business risk. Risk acceptance, material exceptions, production authorization, and irreversible actions still belong to explicit human roles.

Second, **automation strength must match risk and infrastructure maturity.** An individual project can start with exact revisions, isolated worktrees, explicit result states, and reproducible commands. A team can add centralized CI, short-lived identities, an artifact registry, and evidence storage. Only high-risk production actions need protected runners, policy engines, HSM/KMS integration, remote attestation, and stricter dual control. When the infrastructure is missing, reduce agent authority rather than pretending a prompt created the control.

# 0x05 What Counts as Done

**A change involving an agent can be called done only when the conditions appropriate to its risk and claim strength have been satisfied:**

- The task, identity, scope, risk, acceptance criteria, dependencies, and stop conditions were admitted by an authorized party.
- The agent's actual actions stayed within its grant, and credentials did not enter context or logs where they did not belong.
- The actual diff, affected closure, and verification obligations were independently computed, without hiding `NOT_RUN`, `ERROR`, `UNKNOWN`, or `CONFLICT`.
- Review, verification receipt, merge decision, and release artifact bind to the same exact revision.
- A deployment claim carries artifact provenance, the real workload identity, business-semantic checks, and rollback evidence.
- Exceptions, residual risk, handoffs, and retirement plans for temporary paths all have explicit owners.
- At task end, grants, short-lived certificates, secret leases, subprocesses, and remote actions have expired, been revoked, or been explicitly taken over.

**“Done” is derived from facts. It is not a Boolean that the agent writes back.**

Equally important is preserving the boundary of what cannot yet be claimed:

1. Writing down these controls does not mean any organization has implemented them.
2. One `PASS` does not establish long-term control effectiveness or production reliability.
3. Passing SoftHSM, sandbox, or adapter tests does not establish production-HSM capability, production isolation, or production authority.
4. A merged PR, generated artifact, healthy deployment, or visible page does not by itself prove a business outcome.
5. An agent's review, summary, or retrospective is a candidate judgment, not inherently independent evidence.
6. Token count, lines of code, session count, and completion claims do not directly establish productivity, security benefit, or failure rate.
7. `Agentic SDLC` is only a working label in this article, not a methodology I invented or a standard that already exists.

After rereading those earlier articles, I did not arrive at a security theory that needed a new name. I arrived at the same simple chain:

> **The established principles of security engineering still hold.**  
> **→ Agents change the actor, the boundaries, and the speed.**  
> **→ Governance, defense in depth, identity, and cryptographic infrastructure must be repositioned.**  
> **→ Controls that authorize side effects and state transitions must become machine-verifiable.**  
> **→ Claims that exceed the evidence must not be made.**

AI agents can move fast. The job of the SDLC is to ensure that speed always lands on an authoritative task, a constrained identity, the correct object, and a reality from which the system can recover.

# References

- [The AI-Native SDLC Playbook](https://claude.com/blog/the-ai-native-sdlc-playbook)
- [What is Security Architecture](https://iami.xyz/security-architecture-review/)
- [My View of Enterprise Security Architecture](https://iami.xyz/my-enterprise-cyber-security-architecture/)
- [Modern SDLC and Security Architecture Review](https://iami.xyz/modern-sdlc-and-security-architecture-review/)
- [Building Security Specifications: A Practical Guide](https://iami.xyz/build-your-security-specifications/)
- [Security Architecture in Practice: From Security Governance to Security Verification](https://iami.xyz/from-security-governance-to-security-verification/)
- [Talking About Defense in Depth in Security Design](https://iami.xyz/how-to-defense-in-depth/)
- [What Are We Really Talking About When We Say Security by Default](https://iami.xyz/secuirty-by-default/)
- [Security Operations — Design for Failure](https://iami.xyz/security-operation-design-for-failure/)
- [A Brief Talk on Data Security](https://iami.xyz/talk-about-data-security/)
- [Applied Cryptography and Crypto Infrastructure](https://iami.xyz/applied-cryptography-and-crypto-infrastructure/)
- [A Few Lessons Learned from KMS/HSM](https://iami.xyz/what-hells-in-hsm/)
- [Some Takeaways from CA/RA](https://iami.xyz/what-hells-in-ca-and-ra/)
- [Hashicorp Vault Advanced Tutorial For Enterprise](https://iami.xyz/hashicorp-vault-advanced-tutorial-for-enterprise/)
- [Git Workflow for the Multi-Agent Era](https://iami.xyz/multi-agent-git-workflow/)
- [NIST Secure Software Development Framework](https://csrc.nist.gov/pubs/sp/800/218/final)

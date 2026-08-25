---
layout: post
title: "How Agents Fail: The Verification Breakpoints Behind False Done"
description: "The configuration changed, tests passed, and the service reported active—yet the old process was still handling requests. False Done begins when an agent mistakes a local signal for an external fact."
categories: CTO
tags: [Security Architecture, AI Software Engineering, Agentic SDLC, Failure Engineering, Evidence Engineering]
keywords: [Agentic SDLC, AI Coding, Failure Engineering, Evidence Provenance, Runtime Proof, Proof-Carrying Delivery]
translated: true
---

> The previous article, [“Agentic Assurance Engineering: Bringing AI Coding into Real-World Engineering”](https://iami.xyz/agentic-software-engineering-real-sdlc/), asked what gives an agent's actions, judgments, and delivery the right to enter a real SDLC. This article turns the question around: when every light is green, how is “done” faked? Agent failure here is not limited to model output. It also includes a delivery chain mistaking a local signal for an external fact. I use “False Done” as shorthand for a completion claim supported only by local signals, not by the external fact it names. The examples below extract mechanisms rather than estimate prevalence; incident names, dates, and sensitive identifiers have been withheld.

> *Co-created with AI.*

# 0x01 The Configuration Is New, but the Old Process Still Handles Requests

I once investigated a deployment fix that appeared complete. The configuration had been updated, the service directory had switched to the new checkout, and the service manager reported `active`. But when I followed the request path, the live process actually handling traffic still came from the old checkout and still held the old state file.

None of those three signals was false. They simply referred to different things: the configuration pointed to the new version, the process was running the old one, and `active` meant only that “a process is alive”—not which process. Put simply, **one service had split into two identities**: the one we changed and the one doing the work.

This was one fix I handled; it is not enough evidence to say how common the failure is. The check is concrete: start with the live process ID (PID), read back its working directory and revision, and then confirm that requests actually reach that process.

I call this **done-by-belief**: the system checks a state it wrote itself, but never goes on to read the reality that state claims to have changed.

```text
DoneClaim = subject + revision + environment + predicate
          + evidence_locator + independent_observer + limits
```

This is not a mathematical equation. It is the minimum record for a claim of completion. `subject` identifies the service, process, or build artifact under examination. `revision` and `environment` bind its version and runtime boundary. `predicate` states the property that must hold. `evidence_locator` must lead back to a real file, a reproducible run, or a queryable execution record. `independent_observer` records who verifies it using a different evidence source or role. `limits` states where the conclusion stops. Authorization, owner, scope, and risk acceptance remain governance conditions; this schema does not replace them. A label, test source, or zero exit code is not enough on its own to declare completion.

> I borrow `dereference` here in a practical sense: a label is a reference to reality, and verification must follow that reference back to the object itself. For example, read the working directory and revision from the live PID, then confirm that requests hit it; do not conclude from an `active` or `v2` label alone.

# 0x02 Four Dereference Breakpoints

Across four retrospectives, I found not a staircase of increasingly severe failures, but four verification relationships that can break independently:

| Where the relationship breaks | The green signal you see | What still needs to be checked |
|---|---|---|
| Subject identity: did we change the thing actually serving the request? | Configuration, directory, label, and declared version all look right | The live process, the code actually loaded, and the route the request really took |
| Acceptance predicate: did we verify the property the user needs? | The component renders, an assertion exists, or the API returns 200 | Whether the user can complete the path end to end and whether frontend and backend implement the same rule |
| Workload / lifecycle: did we test the world that actually runs? | Before/after numbers look good or a timeout signal appeared | The same code, the same workload, the live runtime, and whether the work truly stopped |
| Claim provenance: does the evidence support the claim being made? | The report is complete, the numbers are precise, and there seem to be many cases | First-party sources, a common denominator, preserved snapshots, and the evidence that could overturn the claim |

These are diagnostic dimensions; they do not replace the Source / CI / Deploy provenance / Runtime readback evidence layers from the previous article. One delivery may break in several dimensions. During an actual audit, however, the audit still stops at the `first-breakpoint`—the first trustworthy invariant that fails—and records later stages as `not reached`.

Here is each one in turn.

## Subject Identity: I Changed A, but B Is Serving the Request

A name is an index, not the object itself. `active` does not mean traffic has moved to the new version, and a directory named `v2` does not mean the process loaded `v2`. To establish that “the thing I changed is the thing serving,” I need to align the expected revision, the live PID, its working directory, the code it actually loaded, and the request path. If one is missing or the identities do not match, the correct result is “unknown,” not “done.”

Consider a similar case. Finding a capability name in a registry does not mean the referenced revision contains an executable entry point. The name is registration metadata; the entry point is the implementation. At minimum, a capability must identify its repository, exact revision, entry point, and output contract. Missing any of those is enough to reject the registration—but no more than that. It does not prove that “the product has no such capability.”

When someone says “it has been released,” ask one question first: **which process is handling the request?**

## Acceptance Predicate: The Object Is Right, but the Test Checks the Wrong Property

The frontend is a common place for this breakpoint to hide. Suppose a high-risk feature is disabled by default. The backend correctly rejects the entire class of requests while disabled, but the UI entry button checks only whether the user is logged in, so the button remains visible. Each side has a locally coherent rule: the backend is right to reject, and the frontend is consistent with its narrower “logged in means visible” condition. The gap lies between them: nobody owned the answer to “when the feature is disabled, should this button appear at all?”

That is what I mean by **frontend and backend interpreting the same rule differently**. The root cause is not merely a defect in one layer; the rule was never written as a shared acceptance criterion across both layers. Nobody verified what happens when the user clicks.

So when a component renders or an API returns 200, the user path and the property the user actually needs still have to be exercised.

## Workload / Lifecycle: Testing One Version Is Not Testing the World That Is Running

I once declared a performance optimization successful on the strength of a convincing before/after result. When I later tried to verify it, nothing aligned: the code revision, environment, workload size, and measurement method had not been preserved. The numbers may well have been real, and the code change still looked plausible, but nobody could reproduce the result. That makes it an impression, not a performance fact.

Performance claims must always include “under what load.” Change the scale, frequency, concurrency, or cost, and the conclusion may change too. One fast request does not prove stability under real traffic. The same problem appears at shutdown: a caller timeout does not guarantee that the worker underneath has stopped. It may have detached from its caller and continued running. “I sent cancellation” therefore needs a matching “the work stopped and its resources were reclaimed.”

A performance conclusion has to be read together with its subject, workload, and stop confirmation: what was measured, at what scale, and who confirmed that the work actually ended?

## Claim Provenance: A Complete Report Can Still Describe the Wrong World

The artifact most likely to be repeated secondhand is often not code, but a polished retrospective.

We once used a script to extract several groups of suspected problems from logs, then wrote them up as “verified cases.” The problem was attribution. Events close in time are not necessarily the same event, and three excerpts from one event do not become three independent sources. A pile of leads remains a pile of leads: it cannot become a case set or a failure rate until each item is traced back to first-party evidence and judged individually.

Correction must preserve the scene as well. Editing a report in place may remove the stable public reference to its earlier version, making a previously quoted statement hard to recover in its original snapshot. A safer rule is to fail closed: if the source is unclear, the denominator is missing or incomparable, the code revision is unbound, or the snapshot was not preserved, the conclusion cannot be promoted. If the denominator must be recomputed, publish a new version and state which version it supersedes.

This report-promotion rule—the claim-provenance gate—is still `PROPOSED`. I have not yet used counterexamples to prove that it blocks an invalid promotion, so it must not be presented as a live capability.

A report that cannot identify its sources and the evidence that could overturn it must remain a candidate claim.

# 0x03 From the Failure Map Back to Assurance

All four breakpoints share one rule: do not stop at the word “done.” Read the object that the word claims was changed, satisfied, measured, or proven.

Assurance here does not promise that the system will always succeed. It ensures that failure, uncertainty, conflict, and missing evidence are not disguised as `DONE`. An agent may execute actions and collect evidence; a verifier reads the result back; an owner with risk-acceptance authority makes the final judgment.

That is what Agentic Assurance Engineering is meant to govern. Every action must state who authorized it, who owns it, and who accepts the residual risk. Every delivery must bind the subject, revision, and evidence. The state machine must preserve legitimate distinctions: verification results include `PASS`, `FAIL`, `NOT_RUN`, `UNKNOWN`, `CONFLICT`, and `ERROR`; an obligation that does not apply is `NOT_APPLICABLE`; when human authority or risk adjudication is required, enter `HITL`; and an exhausted or terminated workflow is `FAILED`. A green icon must not flatten these states into one conclusion.

If `DONE` remains at all, it can only be derived from claim strength and applicable obligations. For the four dimensions relevant to the claim—subject identity, acceptance predicate, workload/lifecycle, and claim provenance—every applicable check must reach `PASS` or `VERIFIED` within the stated boundary (`PASS` is an individual check result; `VERIFIED` is a claim-level conclusion). A dimension that genuinely does not apply must be marked `NOT_APPLICABLE`. High-risk claims also require runtime readback. Authorization and risk-acceptance conditions must hold as well. Otherwise the result remains `NOT_RUN`, `UNKNOWN`, `CONFLICT`, `FAIL`, `ERROR`, `FAILED`, or `HITL`. **An agent cannot write `true` into its own `done` field.**

Putting this into practice does not require building a complete platform first. Start by requiring every completion claim to answer four questions: what are the subject and revision, what is the acceptance predicate, what is the workload/lifecycle boundary, and can the evidence be independently dereferenced? If any applicable question cannot be answered, retain the corresponding `NOT_RUN`, `UNKNOWN`, `CONFLICT`, or `HITL` state. Do not let polished language promote it to `DONE`.

The next four articles each take one breakpoint as their primary lens: a full catalog of nine forms of False Done, silent degradation in the frontend, runtime scale and lifecycle, and the ways a retrospective report can fail its own test. A final article, “SDLC in the Agent Era,” then places tool identity, context and data, supply-chain isolation, approval revocation, and runtime readback into one state chain—making high-risk actions harder to execute without authority and success claims easier to check against external facts.

> What an agent delivers is, by default, a draft awaiting verification. To become a fact, it must provide evidence about the object, property, scenario, and source—and the scope of that fact can never exceed the scope supported by its evidence.

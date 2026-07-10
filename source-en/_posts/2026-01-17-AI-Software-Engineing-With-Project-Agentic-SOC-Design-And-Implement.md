---
layout: post
title: "AI Software Engineering in Practice: Building an Enterprise-Grade Agentic SOC Platform"
categories: Security Architect
kerywords: AI Coding Cursor Gemini3 Opus Claude Coding Product Design Agentic SOC Prototype Design Launch Frontend Backend Separation Rapid Prototype Agile AI Security LLM AI Security Operations Center Agent As Engineer
tags: Security Architecture Security Products Security Engineering
translated: true
---

> Over the course of one project sprint, we burned through roughly 2.3 billion tokens and used Cursor Ultra together with Claude Code to build an enterprise-grade Agentic SOC platform. This post is a software engineering retrospective — how we used architectural constraints, test-driven development, and documentation discipline to steer AI from generating 350,000 lines of code down to 80,000 lines of actual production code.

# 0x00 Introduction

By the end of 2025, Phase 1 of the Agentic SOC platform was finally wrapping up. Looking back at those two months, my biggest takeaway wasn't about talking to an Agent — it was about talking to dollars ($). Even with Cursor Ultra and a Claude Code proxy, token consumption was brutal. Rough estimates: during the initial framework-building phase, code cost around ¥3–5 per line; the feature-implementation phase dropped to ¥0.5/line; documentation was as cheap as ¥0.1/line. The upside: features that might have taken months to develop got compressed to one or two weeks with AI Coding.

That expensive tuition taught me one thing: AI coding can take a 10x engineer to 100x, but it can also drag a 1x engineer down to 0.5x. The difference is whether you're using software engineering to drive AI, or letting the data AI generates drive you.

This post pulls from recent practice to walk through how to effectively drive AI through the full lifecycle of a large project — design through delivery.

# 0x01 Agentic SOC: The Project

> Knowing the domain is what makes a great product: the people who truly understand security are the ones who build great security products.

The platform was designed around the concept of **Model As Agent, Agent As Engineer** — giving Agents enhanced prompts, a RAG knowledge base, access to an enterprise asset inventory (as part of authorization), and specific MCP Tools. Traditional automation is **system executes tasks, humans analyze results**. Agentic SOC aims for **AI executes system tasks, AI analyzes results**.

In this design, Agents aren't chatbots. They're virtual engineers with specific roles: the Agent is the SOC Engineer, the alert analyst, the incident response expert, the report analyst — every role from L1 to L3. And beyond that, architecture review experts, solution specialists, and more. Different Agents together form a virtual SOC team handling day-to-day operations.

For Phase 1, we stuck with the traditional Agent conversation model for task handling. Input is unified through AgentRunner for scheduling, which routes to different conversation modes (Direct/ReAct/Workflow) based on task complexity. I won't go deep on task handling, Agent memory management, or MCP execution here. But one thing worth noting: sometimes introducing a "new design" actually backfires. For example, once we enabled ReAct mode, the Agent started amplifying hallucinations throughout its think/observe/act loop. Lesson learned: **picking a smart, capable model (like Gemini 3 Pro, Claude 4.5 Sonnet) matters more than complex prompt engineering.**

Here's what it looks like across different scenarios:

* Code audit directly in chat
![img](https://img.iami.xyz/images/ai-coding/agentic-soc-code-audit-demo.png)

* Source code scanning with report generation
![img](https://img.iami.xyz/images/ai-coding/agentic-soc-code-scan-demo.png)

* Threat intelligence queries
![img](https://img.iami.xyz/images/ai-coding/agentic-soc-misp-demo.png)

* Knowledge base (RAG)
![img](https://img.iami.xyz/images/ai-coding/agentic-soc-rag-demo.png)

* Sensitive data leak detection
![img](https://img.iami.xyz/images/ai-coding/agentic-soc-remote-leak-detection-demo.png)

* Workflow scheduling and execution
![img](https://img.iami.xyz/images/ai-coding/agentic-soc-workflow-n8n-demo.png)

# 0x02 From Vibe Coding to Enterprise SOC: Real Software Engineering

AI Coding still requires you to actually understand software engineering. The people who know how to use AI are the ones who won't be replaced by it. But in the journey from requirements to product, the most important thing isn't coding chops or AI tooling expertise — it's understanding your own business domain and knowing how to translate it into a platform product. The shift from "everyone's a product manager" to "everyone's a full-stack engineer" demands a solid understanding of software engineering. How does one person, working with AI, go from product architecture to UI decomposition, from frontend API routing to backend logic? How do you manage your own AI project?

Since the focus here is AI software engineering in practice, I'll walk through **architecture design → coding → testing → documentation → common pitfalls** in that order.

## 1. Architecture: From Requirements to Product

> Architecture design is a balancing act: AI can help with the design and the trade-offs, but only if you have the judgment to evaluate the output.

When it comes to product architecture, you should actually resist Vibe Coding. Before you push back on that — this isn't saying Vibe Coding has no value (you'll see plenty of Vibe Coding examples later in this post). The point is to use it in the right places. For the product architecture itself, what you need is a deep understanding of the business requirements and a gap analysis. I did start with Gemini's Deep Research for a feasibility study. At the technical architecture level, you need to pick the right tech stack — especially one that integrates with your organization's existing stack. AI can help evaluate options, but you still need to be able to judge the output yourself. Don't fall into the trap of letting the model flatter you into bad decisions.

![img](https://img.iami.xyz/images/ai-coding/architecuture-of-Agentic-SOC-Arch-Platform20260109.png)

The Agentic SOC architecture above wasn't heavily AI-assisted (it didn't start out looking like this). Most of it was sketched on paper — UI layout, tech stack, feature modules — then built up incrementally. From experience, using a layered architecture to iteratively add functionality (which requires designing for extensibility from the start) combined with domain-driven design is absolutely viable. Some practical tips on using AI for architecture:

* During overall architecture design, use `Gemini 3 Pro` for feasibility analysis (Deep Research), then use `Opus 4.5` for component/domain refinement. Don't rush straight to coding.
* Domain-driven architecture design: drill down into each domain for specific framework-level code — e.g., agent domain → execution and reasoning, validation domain → anti-hallucination, knowledge domain → RAG and documents, tools domain → invocation and execution.
* Once architecture is done, you'll have multiple feature areas to implement. Use Opus to break work into Phases and document them. Treat documentation as the model's "memory bank" — organize the directory structure and track document status so coding can flow smoothly. See the [Documentation section](#4-Documentation-Keep-a-Record) for details.

For documentation and diagramming (keep throwing your architecture docs at AI to check for implementation consistency, gaps, and ongoing architecture reviews during the coding phase):
* `Mermaid` works better than `PlantUML` in most cases, but note that Gemini generates Mermaid syntax errors significantly more often than Opus.
* For presentation-quality architecture diagrams, have Gemini describe a Mermaid diagram, then feed that description to AI for rendering — the result is surprisingly technical-looking. [See reference here](#3-Testing-Trust-but-Verify). Works for fancy unusual diagrams too.

Some common Prompt patterns for similar scenarios (filling in an existing architecture, analyzing implementation gaps):

| Task         | Prompt Pattern                                                              |
|--------------|-----------------------------------------------------------------------------|
| New Feature  | "Design [feature] following the domain pattern in COMPLETE_ARCHITECTURE.md" |
| Gap Analysis | "What's missing from Phase X? Suggest implementation"                       |
| Integration  | "How should [new component] integrate with [existing domain]?"              |
| Refactor     | "Refactor [component] to match the layered anti-hallucination pattern"      |
| Review       | "Review this architecture for security/scalability issues"                  |

If you genuinely don't know anything about architecture design, just describe your requirements to AI as thoroughly as you can and compare the research results and architecture recommendations across different models. At the early product stage, the idea itself isn't that important — what matters is who moves first.

## 2. Coding: Intent Is Code

> Software engineering drives AI coding: AI can take a 10x engineer to 100x, or drop a 1x engineer to 0.5x.

I saw a Gemini particle interaction tutorial on Xiaohongshu where the creator made an important point — they used a prompt specifically to stop AI from using React and keep it to a single HTML file. That's great for early demos and toys, no argument there. But it obviously can't hold up in real product design and implementation. Which raises the question: AI understands tech stacks — do you? AI can help you pick a tech stack — can you? Can you review the code and judge whether the tech choices are reasonable? That's the difference. People who spend 10 minutes Vibe Coding and then three days debugging are the 1x-going-to-0.5x case.

### 2.1 Coding Tips

1. Use Gemini 3 Pro to write framework code and get the initial architecture implemented.
2. Use Opus 4.5 for specific feature implementation — multiple MCP Servers, task scheduling optimization, etc. Then use Gemini 3 Pro to review the architecture design and implementations, identifying optimization opportunities.
3. Implement one independent feature (or a set of tightly related features) at a time. When you're not sure the feature design is solid, have the Agent generate documentation first before writing code.
4. Use a separate Agent conversation with Gemini 3 Pro to fix backend and frontend errors.
5. Always write test cases and documentation. **Trust but Verify.**
6. After tests pass, manually review the independent feature's code and documentation — is the implementation sound? Did anything get accidentally changed?
7. Commit. Repeat.

### 2.2 Feature Design Tips

1. Early UI design will need multiple rounds of debugging. Before the framework is fully populated, AI will do unexpected things. Check frontend page interaction logic multiple times before locking in styles. For frontend product design, check out [Product Design Learning Hub](https://design.fz.cool/) — covers common layouts, styles, behaviors, and frameworks.
2. Even for the fastest MVP prototype, use migratable interfaces. This looks more expensive upfront but makes future migrations much easier. For example, use an ORM framework — SQLite for MVP, then migrate to PostgreSQL later. (What looks expensive to a human is often not much different for AI to implement.)
3. Before bringing in any new component, read and analyze it first. Assess feasibility. For example: choosing Qdrant vs. Milvus — underestimating Milvus's deployment complexity and poor SDK quality led to huge amounts of time spent having AI repeatedly fix code.
4. Before implementing complex components on both frontend and backend, re-read the SOLID principles: Single Responsibility (SRP), Open/Closed (OCP), Liskov Substitution (LSP), Interface Segregation (ISP), and Dependency Inversion (DIP). Don't rely on AI to do the balancing for you.

### 2.3 Cursor Tips

* Cursor automatically excludes `.gitignore`'d files from its Vector Store index.
* If you've got multiple Agent sessions open and things seem out of sync, go to Cursor Settings → Indexing & Docs and manually sync or delete the index and start fresh.
* Click the "Browse Tab" button in the Agent chat box and use the selection tool to directly select UI elements and pull their code into the conversation. This is especially useful when you want element A to follow the style and layout of element B — way more effective than describing it in text.
* If you accidentally implemented multiple features in one session (not recommended — see coding tips above) and can't remember what changed, open a new window and ask the Agent.

### 2.4 Claude Tips

* Claude Code CLI only has a 200K context window, so keep `CLAUDE.md` lean. I once migrated my Cursor rules into CLAUDE rules at about 990 lines — quality was fine, but it wasted context and triggered auto-compact more often. Better to move things into separate rules files.

`.claude` directory structure:
```shell
.claude
├── rules
│   ├── agents
│   │   └── agent-development.md
│   ├── backend
│   │   └── python-standards.md
│   ├── docs
│   │   └── documentation-standards.md
│   ├── frontend
│   │   └── typescript-standards.md
│   └── metabrain
│       └── metabrain-standards.md
└── settings.local.json

7 directories, 6 files
```
`.claude/rules/backend/python-standards.md` — note it only applies to backend code:
```markdown
---
paths:
  - "backend/**/*.py"
  - "*.py"
---

# Python Backend Standards

```
* If you need to run Claude CLI in parallel, create a separate `CLAUDE.md` in each subfolder.
* When using a third-party Claude proxy, check whether the API endpoint supports cache hit. I initially used a proxy that claimed to support caching but had a hit rate of 0, then it suddenly started working later.
* After installing the ClaudeCode plugin in Cursor, use the `/ide` command in the Claude CLI to connect to Cursor's IDE, then open the interface inside Cursor with `Super+Shift+ESC`.
* If you're using a cheap proxy model, consider limiting it to documentation tasks only — don't use it for coding.

### 2.5 Parallel AI Driving (Cursor + Claude Together)

`Agentic SOC` directory structure:

```shell
Agentic SOC
├── backend
│   ├── __pycache__
│   ├── core
│   ├── data
│   ├── features
│   ├── scripts
│   ├── tests
│   └── venv
├── docs
├── frontend
│   ├── dist
│   ├── node_modules
│   ├── public
│   ├── src
│   └── tests
├── Brain
├── nginx
└── scripts
    └── systemd
42 directories
```

I typically run four Claude Code CLI windows and one Cursor window: one for the overall Agentic SOC project, and separate CLI windows for backend, frontend, and brain — each with its own CLAUDE rules so I can quickly develop new features independently in each context. The main SOC window handles global documentation updates.

One thing I ran into: backend code updates would often ripple into frontend, but the frontend CLI window wouldn't automatically pick up those changes. The fix was adding a `sync-context` Skill — whenever a file belonging to another window's domain changed, the first step in the next conversation was running `sync-context` to sync up. (`/compact` and `claude --resume` aren't really my thing — I usually just keep windows open and keep driving, rarely need to resume.)

Weekend driving session stats:
![img](https://img.iami.xyz/images/ai-coding/claudecodecli-at-weekend.png)

Here's what `~/.claude/skills/sync-context/SKILL.md` looks like:

````markdown
name: sync-context
description: Generate a Handoff Artifact for switching between frontend, backend, or brain contexts. Helps maintain continuity when changing development focus or handing off to another agent.
---

# Context Synchronization Skill

## When to use
- User says "I'm moving to frontend", "switching to backend", "sync context"
- User says "Sync this with brain" or "handoff to frontend"
- User invokes `/sync-context` directly
- When a backend API change affects the UI or Agent ic

## Instructions
1.  **Analyze** the last 3 code changes made in the current session.
2.  **Summarize** the "Contract Changes":
    - New API Endpoints (Method, URL, Payload).
    - Database Schema updates.
    - ic changes that affect behavior.
3.  **Generate Artifact:**
    - Create/Update a file at the project root: `.handoff_status.md`
    - Format:
      ```markdown
      ## Sync Timestamp: {CURRENT_TIME}
      ### Source: {CURRENT_FOLDER}
      ### Changes:
      - [ ] API: POST /v1/alert/analyze changed to accept `severity` param.
      - [ ] DB: Added `severity_score` column to `alerts` table.
      ### Required Actions for Consumer:
      - Update UI to send `severity` field.
      ```
4.  **Notify User:** "Handoff note created. You can now switch terminals and tell the next agent to 'Read the handoff note'."

````

Circling back to the Agentic SOC platform's design philosophy — **Model As Agent, Agent As Engineer** — this same thinking applies during coding itself. Open multiple Agents in parallel: a code review engineer, a documentation engineer, a test engineer, a dev engineer, and so on. Find a workflow that fits your design philosophy, and use a management mindset to drive AI coding. Agent-as-Engineer works both as a platform design concept and as a way to manage your own virtual dev team. Encode that into rules for your coding tools.

That said, stay alert. Sudden model degradation can wreck a project. There are also project-specific situations to consider — using `git submodule` to split out functional blocks, for example, providing standard interfaces to reduce context consumption for your coding tools.

## 3. Testing: Trust but Verify

> ⚠️ Check carefully: did AI fix the source code to pass the tests, or did AI modify the test cases to pass?

Every new feature needs corresponding unit tests. TDD means writing test cases first to define expected behavior, then writing the business logic. But in large AI projects, TDD is hard to apply strictly — the model's context window may not be large enough to remember the existing structural design. In practice, it's more common to write the business logic first, then test. But don't stop at unit tests — integration tests matter too. If one feature change affects other components, ask yourself: when we added support for multiple AI Providers for Embedding, does that theoretically affect the Vector Store or the RAG knowledge base lookup during chat? Just because it "shouldn't" doesn't mean you skip integration tests.

![img](https://img.iami.xyz/images/ai-coding/Simple-version-of-architecture-agentic-soc-low.png)

Unit tests will surface things like different AI Providers having different Embedding chunk sizes. Integration tests will catch things like AI code changes silently breaking Hybrid Search on the RAG knowledge base.

If you have performance requirements, you'll also need performance testing and optimization. For example, after adding a caching layer, you need to verify cache hit rates — run performance tests before and after to confirm the cache is actually working. You can feel the faster response in the UI intuitively, but you need the numbers to back it up. For the Agentic SOC project: frontend performance testing with `playwright`, backend with `locust`.

Testing surfaces not just code-level optimizations but architectural ones. The backend started with PostgreSQL storing everything — Embedding JSON, uploaded files, chat messages. The first optimization was indexing. Then we added `Redis` as a cache layer between frontend and backend. Then Minio for independent file storage, with the DB only storing paths. Then Embedding JSON moved from PG Vector to a dedicated `Qdrant` instance. (`Milvus` wasn't worth it.) On the frontend: Bundle Optimization (React.lazy + Suspense for core route splitting), Aggregated Endpoints (batching multiple config requests into one to reduce RTT), and integrating `react-virtuoso` for windowed rendering. Regardless of message count, DOM node count stays constant.

One critical thing: **always check whether AI's test fixes actually fix the source code to match the test expectations, or whether AI modified the test cases to improve pass rates.** In one case during unit testing, 19 tests failed and 3 passed. On review, I found the source code was returning `200` as the status code for resource creation — it should return `201`. But AI, to get the tests passing, had gone and modified the test assertions to expect `200` instead. Manual review caught it: the right fix was to change the source code to return `201`, not to weaken the assertion to `assert status_code == 200`.

This sounds like just a status code, trivially unimportant. And misused status codes are everywhere in human-written code too, right? Actually that's missing the point. This example illustrates a pattern in Vibe Coding: AI will often prioritize satisfying your immediate request, treating it as high-priority and delivering a quick fix. In a large project, that's extremely dangerous. Small leftover bugs compound, and the further you go, the harder it gets to add new features cleanly. Around 20–30k lines of code, you start noticing AI-edited code needs to be rejected more often. Between domain-driven design, TDD, and test-phase verification, the message is the same: **without software engineering constraints, the high of Vibe Coding is an expensive illusion.**

![img](https://img.iami.xyz/images/ai-coding/Cursor-display-line-editor.png)

Cursor's stats show 330,000 lines of edits accepted, while the actual project contains roughly 80,000 lines of code (`cloc $(git ls-files)` or `cloc --vcs=git .`).

![img](https://img.iami.xyz/images/ai-coding/code-summary-cloc-with-gitignore.png)

Cursor's stats aren't fully accurate either — beyond Cursor, there were 20,000+ lines of documentation and code from Claude CLI. But even at face value: despite a claimed 93.9% accept rate (334,713 / 356,439 lines), **the actual surviving code is only about 20%** (80k / 350k — and the real denominator is way higher than 350k; the rest got `git checkout .`'d away).

## 4. Documentation: Keep a Record

> AI's three daily self-checks: Did I implement this feature? Did I write test cases and make sure they pass? Did I document it?

Three core principles for documentation:

* Organize docs by directory structure

`docs` directory structure:
```shell
.
├── architecture
│   ├── AGENTICA_COMPLETE_ARCHITECTURE.md
│   └── PERFORMANCE_ARCHITECTURE.md
├── development
│   ├── RESOLVED_ISSUES.md
├── examples
│   └── PENTEST_GUIDE_JUICE_SHOP.md
├── features
│   ├── agents
│   │   ├── MULTI_AGENT_SYSTEM.md
│   ├── knowledge
│   │   ├── RAG_CHAT_INTEGRATION.md
├── guides
│   └── USER_MANUAL.md
├── HEADER_STANDARDIZATION.md
├── operations
│   ├── CONFIGURATION_SUMMARY.md
│   ├── NATIVE_DEPLOYMENT.md
└── todo
    ├── ANTI_HALLUCINATION_IMPROVEMENTS.md
    ├── FEATURE_REQUESTS.md

14 directories, 56 files
```

* Update docs with progress status

Example from `docs/agent/AGENT_ARCHITECTURE`:
```markdown

# Agent Architecture: Model as Agent, Agent as Engineer

**Created**: 2026-01-01
**Updated**: 2026-01-13
**Status**: ✅ 100% Implemented (Production Ready)
**Priority**: High

---

```

Example from `docs/development/RESOLVED_ISSUES`:
```markdown
# Resolved Issues Index

**Created**: 2026-01-13
**Updated**: 2026-01-13
**Status**: 🔄 Active/Tracking

Quick reference to all resolved issues with links to detailed documentation.
---

## By Category

### Frontend/UI Issues
table 1
### Agent/Backend Issues
table 2

## Quick Stats

- **Total Resolved**: 11
- **Frontend/UI**: 6
- **Backend/Agent**: 2
- **Knowledge/RAG**: 1
- **CI/CD**: 2
---
```

* Compare against source code before AI doc updates

For large projects, using tools to extract actual state before asking AI to update docs is far more efficient. Instead of having Opus scan the codebase and trigger continuous auto-compact, write a script to analyze the AST structure and feed the output to Opus for analysis. For FastAPI backends, hit `curl http://localhost:8000/openapi.json` to get the actual API interface and feed that as part of the architecture update to AI — much better than a broad codebase scan followed by endless `auto-compact`. For databases, use `eralchemy2`: `eralchemy2 -i postgresql://username:password@localhost:5432/databasename -o /tmp/testing.png`.

The three questions I ask AI most often during development: Did you implement this feature? Did you write test cases and make sure they pass? Did you document it? But the results aren't always reliable. With Opus, it tends not to update docs immediately after implementing a feature even with a rule saying to do so. With Sonnet, it strictly follows the rule but puts docs in the wrong place. That's a small bug. And in Cursor, switching from Claude Code to Claude CLI causes doc updates to stop happening — not sure if that's the proxy model or the tooling.

# 0x03 Lessons Burned Into Token Receipts: What to Avoid

![img](https://img.iami.xyz/images/ai-coding/cursor-summary.png)
![img](https://img.iami.xyz/images/ai-coding/claude-status-count.png)

## 1. Model & Tooling

* Model Selection:
    * Reject "dumbed-down" models: In a ReAct Loop, Tier 1 models (e.g., Opus 4.5 / Gemini 3.5 Pro) can complete a full closed loop. Tier 2 / Tier 3 models often quit after a few rounds or just one. **For core logic, never use low-intelligence models.**
    * Security scenario fit: Avoid models with overly high "moral standards" that refuse red team simulation tasks. In pentesting scenarios, those refusals are a real blocker.
* Anti-Hallucination:
    * HITL (Human-in-the-Loop): For critical steps, force human intervention with `ask_human`. Watch out: due to AI output instability, the returned instruction might be `ASK_HUMAN` or `ask_human` — normalize with `.lower()` in code, or the frontend modal will silently fail.
    * Honesty Agent: Introduce an independent "honesty supervisor agent" running in Direct (single-turn) mode with its own session, dedicated to verifying consistency between tool output and model response logic — prevents fabricated data.
    * Fact Verify: Simple regex before HITL and Honesty Agent to validate entity format in the data.
* Tool Differences:
    * SDK auth differences: Official model vs. third-party proxy SDKs often have different parameter conventions. For example, Anthropic's official API uses `ANTHROPIC_API_KEY`, while some proxies require the `SK` to be passed via `ANTHROPIC_AUTH_TOKEN`.
    * Claude CLI "silent fallback": Even if you select the Opus model in Claude CLI, connecting to Cursor IDE through the ClaudeCode interface can silently fall back to the default model (Sonnet or Haiku). Confirm the config multiple times — silent model downgrade is a code quality killer.
    * Embedding compatibility: Different models (OpenAI / Gemini / Qwen) have different Embedding chunk sizes. Always run compatibility tests when switching AI Model Providers.
    * Model knowledge staleness: Model training data has cutoffs. Both Anthropic and Google models tend to default to things like Gemini 1.5 Pro or GPT-3o in generated code — they don't know the latest model parameters. And Claude CLI is the worst offender when generating code that integrates with Anthropic's own API — forgetting headers, forgetting parameters. (Could be proxy-related too.)

## 2. Data Flow & Interaction

* Structured Output:
    * Never execute raw LLM string output: Don't use LLM-generated strings directly as commands. LLM-assembled JSON is prone to multiple-escaping issues. Always enforce **Structured Output** (e.g., Pydantic objects) with strict filtering. **Make the LLM fill in the blanks.**
    * Format normalization: Different models produce different output formats for the same prompt. Before frontend rendering, implement a Formatter in the middleware layer to normalize format and ensure consistent UI behavior. Or insert specific symbols or emoji as delimiters for parsing and cleanup.
* Data Fabric:
    * Cross-component data flow: Data silos between platform components (MCP Server, RAG Storage, Chat) — bridge them with an OSS (object storage) Data Fabric. For example, the Remote Terminal MCP Server needed OSS to pull files uploaded in chat. (This came up because the Platform and red team Infra were deployed on different servers.)
* Component ROI:
    * Favor simple, elegant architectures: When choosing components, prefer simple and extensible options (like Qdrant) over complex behemoths (like Milvus). The latter might cost you $100 to implement and debug, then $50 the next day to roll back. Qdrant's file-based storage delivers sub-50ms queries across 2k–20k documents.

## 3. Environment & Performance

* Dev Environment Consistency (DevOps):
    * Docker volume path mounting: Local dev and remote Docker environments frequently have path mismatches. Always verify volume mount paths, or decouple file dependencies with a Data Fabric. (I've since switched to native deployment — only the DB runs in Docker now.)
    * Build traps: Watch for the `npm run dev` works / `npm run build` fails situation. For remote deployment, always use `docker compose build --no-cache` to avoid mysterious bugs from stale cache.
    * Runtime versions: Ubuntu ships with Node.js 18.x by default. If the frontend needs 22.x, install NVM first on native deployment. Also, AI-generated start scripts often miss error checking for `pip install` or `npm install` network failures — teach AI to add error handling. AI-generated ops scripts have a surprisingly high error rate and poor compatibility. Whether it's Let's Encrypt shell scripts, systemd service setup, web server directory permissions, or service user permission configs — Docker deployment eliminates most of these headaches.
* Performance Optimization Gotchas:
    * Gzip vs SSE: Enabling Gzip compression to optimize backend performance causes the gateway to buffer data, which breaks SSE streaming output — the frontend conversation gets severe "stuttering." **Don't enable Gzip for streaming endpoints.** (Could also be a config error on my end.)
    * Cache overwrite risk: After introducing React Query caching, watch out for **stale data overwriting new data**. For example, renaming a chat and then having the 30-second auto-cache on the frontend immediately overwrite the new name back to the old one.
    * High score, low performance: Running performance tests showed Best Practice score of 100, Performance score of 25. Code quality standards ≠ runtime performance. Always measure actual load times.

# 0x03 Summary

Looking back at Cursor's 2025 annual report, I burned through roughly 700M tokens. About 100M went into toy demos; the rest was almost entirely poured into building the Agentic SOC platform (mostly on Gemini-3-Pro). Early on, framework-building cost roughly ¥3–5 per line of code. Feature implementation dropped to about ¥0.5/line. Documentation was as low as ¥0.1/line.

In the token-billing era, every conversation is essentially a payment. The quality of your architecture directly determines whether you're spending money on the right things or burning it on useless context.

As a Cursor Ultra user, I have to call out their recent update strategy. Frequent Update & Install cycles brought zero visible feature improvements but constant workflow disruption — the Agent panel and folder view kept jumping between left and right sides, sidebar collapse logic changed repeatedly. This leads to another tooling lesson: **don't blindly stockpile AI Coding subscriptions.** I once bought a year of Trae to save money. Same prompts, "same models" — completely different code quality. This confirms something about the AI infrastructure layer: **"cheap" usually means silent model capability downgrade.** For users, identifying a tool's real capabilities matters more than collecting logos. Time and energy wasted on cheap tools are far more costly than the money saved.

In the AI era, a 10x engineer becoming a 100x engineer is no longer a myth. But there's one prerequisite: **you must have the ability to evaluate and judge the output.** Without software engineering constraints, no amount of tokens will produce an enterprise-grade product. I'm not worried about being replaced by AI — because the faster LLMs iterate, the higher the bar for domain knowledge and architectural decision-making. You get out what you put in. Keep going deep in your domain, learning, practicing, and sharing — that's what stands the test of time.

# References

* [MCP Security "Health Check" | AI-Driven MCP Security Scanning System](https://developer.volcengine.com/articles/7553893038204911679)
* [AI for Security Offense and Defense: Engineering Design and Practice of Automated Penetration Agents (Agent Pattern Graph and Meta-Tooling)](https://l3yx.github.io/2025/12/07/AI-for-%E5%AE%89%E5%85%A8%E6%94%BB%E9%98%B2%EF%BC%9A%E8%87%AA%E5%8A%A8%E5%8C%96%E6%B8%97%E9%80%8F-Agent-%E7%9A%84%E5%B7%A5%E7%A8%8B%E8%AE%BE%E8%AE%A1%E4%B8%8E%E5%AE%9E%E8%B7%B5%EF%BC%88Agent-Pattern-Graph-%E4%B8%8E-Meta-Tooling%EF%BC%89/)
* [This Buzzy Cyber Startup Wants to Take On Dangerous AI Threat](https://www.wsj.com/tech/ai/this-buzzy-cyber-startup-wants-to-take-on-dangerous-ai-threat-c0916a3a?gaa_at=eafs&gaa_n=AWEtsqfdHR3NvKGUW_WdZNq_m7qF6BpUUP7yUDpz86iuVVivdSF6pd9TgRAHczHe4KI%3D&gaa_ts=6969dbb6&gaa_sig=-qpTLMDpQMPQX1PbiKzNs4INJA4bt4ecSBSL3kZhmC69pt6txkZfzxeVgU9xNoBXcwB82FBQxHvFTiHu0g8Y0w%3D%3D)
* [AI Coding Best Practices Summary](https://fz.cool/AI-Coding-Best-Practice-With-Cursor/)
* [Software Engineering Practice: A Python Example](https://fz.cool/Coding-With-Python/)
* [From Dropping the DB to Running for Cover: My Python Full-Stack War Stories](https://fz.cool/Python-FullStack-In-Action-And-Issues/)
* [codeguide](https://www.codeguide.dev/)
* [Claude Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
* [Use Claude Code in VS Code](https://code.claude.com/docs/en/vs-code)
* [AI Coding Agent Design](https://developer.aliyun.com/article/1704760)

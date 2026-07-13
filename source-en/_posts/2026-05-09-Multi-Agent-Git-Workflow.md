---
layout: post
title: Git Workflow for the Multi-Agent Era
description: "A Git workflow for the multi-agent era: branching, commit conventions, and conflict prevention when multiple AI agents ship code in parallel."
categories: Security Architect
keywords: Multi-Agent Worktree Claude Code Cursor Codex Gemini CLI Git AI Programming Collaboration Standards Vibe Coding Engineering Practices AI Collaboration Agent
tags: Security Architecture Security Products Security Development
translated: true
---

> This is not a Git tutorial. This is a set of "anti-trampling" collaboration rules summarized from team collaboration and single-developer multi-Agent product iterations. Co-authored with AI.

# 0x00 Preface: Git Standards Now Face a Different Opponent

A few years ago, Git standards focused on branch naming, commit message format, and PR merging. Those old rules were designed for "slow-typing humans". Back in 2018 when developing, we'd just shout at each other, and after review we'd push straight to main. Nobody imagined git worktree would actually become useful.

But now it's different. In my personal projects, I routinely have Cursor, Claude Code, and Codex running simultaneously. // The previous article mentioned 8.4 billion tokens over 4 months; now 2 months later it's grown to 20.4 billion tokens, a 2.4x increase in just two months. Also newly introduced Codex. ⚠️ Codex performs well on long-running tasks, especially debug scenarios.

These tools share one thing: **they write code orders of magnitude faster than humans—and make mistakes just as fast**. A real multi-Agent scenario looks like this:

- Claude Code modifies schema in worktree A
- Cursor modifies consumer in worktree B
- Codex "helpfully" touches the contract file in the main directory
- You look back and find three local commits on `main`, nobody remembers who pushed them
- Some agent does `git stash` and hides another engineer's uncommitted work

At this point, Git standards aren't about "pretty history" anymore—they're about: **making all concurrent work locatable, isolated, reviewable, verifiable, and rollbackable**.

Simply put, the faster AI writes code, the more teams need to slow down destructive actions and clarify responsibility boundaries. Below are the rules I've summarized from months of trial and error, in four main chapters, ending with a checklist summary.

# 0x01 Workspace Isolation: From `main` to worktree

The easiest thing to lose control of in multi-Agent concurrency isn't model capability—it's **ownership ambiguity**. Two agents edit the same contract file simultaneously, whose diff is correct? Nobody knows. So the solution isn't more complex verbal agreements, but building isolation into the workflow structure.

## 1. `main` Is for Integration Only, Not Development

The first rule is simplest and most easily violated: **don't develop directly on `main`, and definitely don't let AI modify code on `main`**. `main` should serve only one purpose—integration branch, representing the team's currently accepted integration state, not anyone's or any Agent's temporary scratch pad.

Recommended local configuration:

```bash

git config pull.rebase true
git config pull.ff only
git config branch.main.rebase false

```

| Config | Meaning |
|------|------|
| `pull.rebase true` | Non-shared feature branches default to rebasing onto `origin/main` |
| `pull.ff only` | `main` only allows fast-forward, no mysterious merge commits |
| `branch.main.rebase false` | Shared branches must coordinate with owner before rebasing, can't be automatic |

Before syncing `main`, diagnose first, then act:

```bash

git fetch origin --prune
git status --short --branch
git rev-list --left-right --count main...origin/main

```

If both local `main` and remote `origin/main` have moved forward, **don't pull directly on dirty `main` to resolve conflicts**. The correct approach: create an isolated integration worktree, replay the target branch from `origin/main`, run tests, check diff, verify it passes, then merge.

This is the first "slow motion" in the AI era—any conflict resolution on `main` must assume there are N agents concurrently writing on the other end.

## 2. One Task = One Branch + One Worktree + One Owner + One Scope

Physical isolation starts with worktree area allocation. My local repo defaults to this structure:

```text

repo/
  .claude/worktrees/   // Reserved for Claude Code
  .cursor/worktrees/   // Reserved for Cursor
  .worktrees/          // Codex or general tasks

```

Worktree directories are ignored via `.git/info/exclude` to avoid accidentally committing local execution environments (venv, node_modules, temp caches).

Branch naming should carry source and intent—it's an index in collaboration, not decoration:

```text

codex/<scope>-<task>
claude/<scope>-<task>
cursor/<scope>-<task>
docs/<topic>
feat/<topic>
fix/<topic>
backup/<topic>-<date>

```

Avoid names like `update`, `fixes`, `wip`, `new-code` that reveal nothing about responsibility or boundaries. You should be able to tell at a glance which agent created a branch and what scope it modifies.

Finally, the **task assignment contract**—giving AI a natural language goal is far from enough. A controllable AI coding task needs at least these fields clearly defined:

| Field | Example |
|------|------|
| branch name | `claude/auth-rotate-key` |
| owned files | `src/auth/`, `tests/auth/` |
| out-of-scope | `src/billing/`, `migrations/` |
| test command | `pytest tests/auth -x` |
| can commit? | yes |
| can push? | no |
| dependency PRs | `#1024` (start after it merges) |

This contract does two things: **limits AI's write scope** (reduces "drive-by refactoring" and unrelated file drift), **provides reviewers judgment criteria** (does this change respect scope).

Parallel agents are only suitable for tasks with **non-overlapping** write scopes. One agent modifying docs, another modifying adapter tests, a third reviewing contract fixtures—that's safe splitting. Two agents simultaneously editing one contract file, or one modifying schema while another unknowingly modifies consumer—that's a landmine.

# 0x02 Three Checkpoints: Need Reproducible Evidence Before Editing, Before Commit, Before PR

"Looks fine" has no value in multi-Agent collaboration. Every stage needs reproducible evidence, otherwise there's no way to replay when problems occur.

**Before editing**:

```bash

git fetch origin --prune
git switch main
git pull --ff-only
git worktree add .worktrees/<task-name> -b <branch-name> origin/main
git status --short --branch    # Must be clean
git branch -vv

```

**During development**:

```bash

git status --short
git diff --stat
git diff --check    // This line specifically catches trailing whitespace, mixed space-tab, etc.

```

**Before commit**:

```bash

git diff --name-only
git diff --cached --name-only

```

If the staged file list contains paths you didn't expect—stop, reassess. **AI often "helpfully" touches files outside scope.**

**Before PR**:

```bash

git fetch origin --prune
git log --oneline origin/main..HEAD
git diff --name-only origin/main...HEAD
git diff --check

```

The purpose of these commands isn't ceremony, but to show reviewers three things: this PR only changed expected files, diff has no low-level format errors, commit history only contains commits this task should bring (no "smuggled contraband").

> PR Template: Must Be Readable

In AI-involved projects, **small PRs are 10x more important than large automated output**. PRs must be small enough that a human reviewer can actually read them completely. Each PR should at least include:

```markdown
## Summary
- what changed

## Dependency
- dependency PRs, branches, or versions

## Test Plan
- [x] command actually run

## Risk / Rollback
- risk and rollback path
```

AI-assisted work needs additional clarification: which agent/tool wrote it, who the branch owner is, what verification commands were actually run. The key is "actually run"—AI writes "all tests pass" in the PR description, but reviewers pull it down and find dependencies aren't even installed—this happens far more often in multi-agent projects than you'd imagine.

Default merge strategy is squash merge—one PR corresponds to one commit on mainline, easier to revert, easier to generate release notes. Only use rebase merge when the commit sequence itself has clear review value. In multi-agent collaboration, **clean mainline history is more valuable than preserving every AI's intermediate attempts**.

# 0x03 Destructive Actions Must Be Slow Motion

The faster AI writes code, the slower destructive Git operations must be. List high-risk actions and their "brakes":

| Action | Risk | Must Do First |
|------|------|------|
| `git stash` | Hides someone else's uncommitted changes | `git status --short` + `git diff --stat` confirm all changes are yours |
| `git reset --hard` | Loses local work | First `git stash` or `git branch backup/...` |
| `git push --force` | Overwrites upstream, overwrites others' work | Confirm owner, old state has backup branch or tag |
| Delete branch | Loses review context | No open PR dependencies, commits already merged |
| Delete worktree | Loses local unpushed work | Run checklist below |

Before stash, always check `git status --short` and `git diff --stat`. If changes might contain files belonging to another agent or engineer, **stop and identify owner**:

```bash

git worktree list
git branch -vv
```

Default strategy for worktree cleanup is—**when uncertain, keep it**. When AI sessions end, tools often ask whether to delete worktree, default answer is "keep", unless all five pass:

```bash

git status --short                              # clean
git branch -vv                                  # no unpushed commits
git worktree list                               # nobody using it
gh pr list --state open --head <branch-name>    # no open PR
git log --oneline origin/main..<branch-name>    # valuable commits already pushed or merged

```

Keeping review context is usually far more important than saving a bit of local disk space.

# 0x04 AI Context Is the Real "Starting Line"

Git isolation solves **workspace** problems, AI context solves **understanding** problems. These are two different dimensions, but many teams only solve the former.

Many AI accidents aren't because models can't write code, but because **they write seemingly reasonable code based on incorrect reality**. For example: old architecture docs say a certain module still exists, but it's long deleted from code; AI looks at old docs and keeps calling it, discovers import failure when running; then it starts "confidently" creating a fake module to fill the gap.

Every product repo should provide lightweight context so all tools start from the same set of facts:

| File | Purpose |
|------|------|
| `CLAUDE.md` | Repo guide for Claude Code |
| `AGENTS.md` | Tool-neutral agent instructions and repo boundaries |
| `docs/VIBE_CODING_CONTEXT.md` | Two-minute working memory: what currently exists, what's deleted, tech stack, current sprint |
| `docs/architecture/STATUS.md` | **Single source of truth** for implemented / partial / deleted / design-only / planned |
| `.cursor/rules/*.mdc` | Cursor-specific rules, but must align with the above |

AI session reading order should also be fixed: read product current context (`VIBE_CODING_CONTEXT.md`) first, then status (`STATUS.md`), then agent instructions (`CLAUDE.md` / `AGENTS.md`), cross-product then read platform docs and contracts. `STATUS.md` conflicts with old architecture docs? Follow `STATUS.md`. Documentation rot is normal, giving one clear "source of truth" is more honest than pretending all docs are correct.

Cross-repo changes **cannot** be solved by "opening several PRs simultaneously". Recommended order: dependency repository PRs → product repository integration PRs → documentation index or release notes → cleanup branches. For submodule pointer changes, must first commit, push, PR merge inside submodule, then update parent repository pointer. The essence of cross-repo collaboration—make dependency direction clearly visible in Git history too.

# 0x05 Summary

The Git standard for multi-Agent collaboration boils down to one sentence—**draw clear responsibility boundaries for tools**. Next time before starting multiple agents, scan this table:

| Stage | Required Checks |
|------|---------|
| Before new task | `git fetch origin --prune` → create worktree from `origin/main` → `git status` must be clean |
| Before starting AI | Write down branch / scope / out-of-scope / test command / can-push? |
| Before commit | `git diff --name-only` check if only in-scope files were touched |
| Before PR | `git diff --check` + run real tests + specify agent / owner / dependency |
| stash / reset / force push | Confirm owner, backup old state, human confirmation |
| Before deleting worktree | clean + no unpushed commits + no open PR + nobody using |
| AI Context | `STATUS.md` is single source of truth; defer to it when old docs conflict |

Looking back, none of these rules are "AI-only needed"—they were always good engineering practices. AI just turned them from "recommendations" into "requirements". Because when humans make mistakes, there are still a few seconds of hesitation before commit; when AI makes mistakes, from thought to disk write might be under a second.

When these rules become the default workflow, multiple IDEs, multiple agents, multiple engineers are no longer concurrent writers trampling each other, but collaborators who can work in parallel, verify independently, and ultimately integrate in order.

# References

* [git-worktree official documentation](https://git-scm.com/docs/git-worktree)
* [Trunk-Based Development](https://trunkbaseddevelopment.com/)
* [Conventional Commits](https://www.conventionalcommits.org/)
* [Vibe Coding Survival Guide](/vibe-coding-complete-guide/)
* [AI Software Engineering Practices: Building Enterprise-Level Agentic SOC Platform](/ai-software-engineing-with-project-agentic-soc-design-and-implement/)

---
layout: post
title: 多Agent协作时代的Git规范
categories: 安全架构师
keywords: 多Agent Worktree Claude Code Cursor Codex Gemini CLI Git AI编程 协作规范 Vibe Coding 工程实践 AI协作 Agent
tags: 安全架构 安全产品 安全研发
---

> 这不是Git入门教程。这是团队协作，单人多Agent在产品迭代时总结出来的一套"防互相踩踏"协作规约。文章系AI共同创作。

# 0x00 前言：Git规范的对手已经换人了

几年前讨论 Git 规范，重点是分支怎么命名、commit message 怎么写、PR 怎么合并。这套老规矩是给"打字慢的人类"准备的。18年开发的时候还互相喊一嗓子，review完就先推main了。谁也没想到git worktree能够用起来。

但是现在不一样了。我个人开发项目里常态是同时挂着 Cursor、Claude Code、Codex在跑。 // 上一篇文章是之前4个月84亿token，现在是2个月后增加到了204亿token，短短两个月翻了2.4倍。同时新引入了codex的使用。⚠️codex在长程任务上效果良好，尤其是debug类的场景。

这些工具有一个共同点：**写代码比人快好几个数量级，当然犯错也是**。一个真实的多 Agent 场景大概长这样：

- Claude Code 在 worktree A 里改 schema
- Cursor 在 worktree B 里改 consumer
- Codex 在主目录里"顺手"动了 contract file
- 回头一看 `main` 上多了三个本地 commit，没人记得是谁推的
- 某个 agent 一句 `git stash` 把另一个工程师的未提交工作藏了起来

这时候 Git 规范的目标已经不是"历史好看"，而是：**让所有并发工作都能被定位、隔离、审查、验证、回滚**。

简单的说，AI 写代码越快，团队就越需要把破坏性动作变慢，把责任边界变清晰。下面是我这几个月踩坑总结出来的规约，分四章正文，最后是总结的checklist。

# 0x01 工作区隔离：从 `main` 到 worktree

多 Agent 并发最容易失控的不是模型能力，是 **ownership 模糊**。两个 agent 同时编辑同一个 contract file，谁的 diff 是对的？没人知道。所以解决方案不是更复杂的口头约定，而是把隔离结构做进工作流。

## 1. `main` 只做集成，不做开发

第一条最简单也最容易被破坏：**不要在 `main` 上直接开发，更不要让 AI 在 `main` 上改代码**。`main` 应该只承担一个职责——integration branch，代表团队当前认可的集成状态，不是任何人或任何 Agent 的临时草稿区。

推荐的本地配置：

```bash

git config pull.rebase true
git config pull.ff only
git config branch.main.rebase false

```

| 配置 | 含义 |
|------|------|
| `pull.rebase true` | 非共享 feature branch 默认 rebase 到 `origin/main` |
| `pull.ff only` | `main` 只允许 fast-forward，不允许莫名其妙的 merge commit |
| `branch.main.rebase false` | 共享分支 rebase 前必须协调 owner，不能自动来 |

同步 `main` 之前，先诊断，再动手：

```bash

git fetch origin --prune
git status --short --branch
git rev-list --left-right --count main...origin/main

```

如果本地 `main` 和远程 `origin/main` 都向前走了一步，**不要在脏的 `main` 上直接 pull 解决冲突**。正确的做法是：创建一个隔离的 integration worktree，从 `origin/main` 重放目标分支，跑测试、看 diff、验证通过再合入。

这是 AI 时代第一条"慢动作"——在 `main` 上的任何冲突解决，都要假设另一头还有 N 个 agents 在并发写入。

## 2. 一个任务 = 一个 branch + 一个 worktree + 一个 owner + 一份 scope

物理隔离从 worktree 区域分配开始。我自己的本地仓库默认长这样：

```text

repo/
  .claude/worktrees/   // 留给 Claude Code
  .cursor/worktrees/   // 留给 Cursor
  .worktrees/          // Codex 或通用任务

```

worktree 目录用 `.git/info/exclude` 忽略掉，避免本地执行环境（venv、node_modules、临时缓存）跟着 commit 误提交。

分支命名要携带来源和意图——它在多人协作里是索引，不是装饰品：

```text

codex/<scope>-<task>
claude/<scope>-<task>
cursor/<scope>-<task>
docs/<topic>
feat/<topic>
fix/<topic>
backup/<topic>-<date>

```

避免 `update`、`fixes`、`wip`、`new-code` 这种看不出责任和边界的名字。一个分支是哪个 agent 创建的、改的什么 scope，光看名字就该一目了然。

最后是 **任务分配契约**——给 AI 一句自然语言目标是远远不够的。一份可控的 AI coding 任务，至少要明确这些字段：

| 字段 | 例子 |
|------|------|
| branch name | `claude/auth-rotate-key` |
| owned files | `src/auth/`, `tests/auth/` |
| out-of-scope | `src/billing/`, `migrations/` |
| test command | `pytest tests/auth -x` |
| can commit? | yes |
| can push? | no |
| dependency PRs | `#1024` (在它合并后再开始) |

这份契约干两件事：**限制 AI 的写入范围**（减少"顺手重构"和无关文件漂移），**给 reviewer 提供判断依据**（这次改动是否尊重 scope）。

并行 agent 只适合写入范围**不重叠**的任务。一个 agent 改文档、另一个改 adapter tests、第三个 review contract fixtures，是安全拆分。两个 agents 同时编辑一个 contract file，或者一个改 schema、另一个不知情地改 consumer，这就是地雷。

# 0x02 三道关卡：编辑前、commit 前、PR 前都要有可复现证据

多 Agent 协作里"看起来没问题"是没有价值的。每个阶段都要留下可复现的证据，不然出问题没法回放。

**编辑前**：

```bash

git fetch origin --prune
git switch main
git pull --ff-only
git worktree add .worktrees/<task-name> -b <branch-name> origin/main
git status --short --branch    # 必须 clean
git branch -vv

```

**开发中**：

```bash

git status --short
git diff --stat
git diff --check    // 这一行专门挑出尾随空格、混合空格Tab之类的低级错

```

**commit 前**：

```bash

git diff --name-only
git diff --cached --name-only

```

如果 staged 文件列表里出现了你没预期的路径——停下，重新审视。**AI 经常会"顺手"动到不在 scope 里的文件。**

**PR 前**：

```bash

git fetch origin --prune
git log --oneline origin/main..HEAD
git diff --name-only origin/main...HEAD
git diff --check

```

这些命令的目的不是仪式感，而是让 reviewer 看到三件事：这个 PR 只改了预期文件、diff 没有低级格式错误、提交历史只包含本任务应该带来的 commits（没有"夹带私货"）。

> PR 模板：必须能被读完

在 AI 参与的项目里，**小 PR 比大而全的自动化产出重要 10 倍**。PR 必须小到一个人类 reviewer 真的能读完。每个 PR 至少应该带：

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

AI-assisted 的工作还要额外说明：哪个 agent / tool 写的、branch owner 是谁、实际跑过的验证命令是什么。重点是"实际跑过"——AI 在 PR 描述里写 "all tests pass"，但 reviewer 一拉下来发现连依赖都没装，这种事在多 agent 项目里发生的频率远超你想象。

合并策略默认 squash merge——一个 PR 对应 mainline 上一个 commit，更容易 revert，也更容易生成 release notes。只有当 commit sequence 本身有清晰审查价值时，才用 rebase merge。在多 agent 协作下，**干净的 mainline 历史比保留每个 AI 的中间尝试更有价值**。

# 0x03 破坏性动作必须慢动作

AI 写代码越快，破坏性 Git 操作就越要慢。把高风险动作和它们的"刹车"列出来：

| 动作 | 风险 | 必须先做的事 |
|------|------|------|
| `git stash` | 把别人的未提交变更藏起来 | `git status --short` + `git diff --stat` 确认所有变更都是自己的 |
| `git reset --hard` | 丢失本地工作 | 先 `git stash` 或 `git branch backup/...` |
| `git push --force` | 覆盖上游、覆盖别人的工作 | 确认 owner、旧状态有 backup branch 或 tag |
| 删 branch | 丢失 review 上下文 | 没有 open PR 依赖、commits 已 merged |
| 删 worktree | 丢失本地未推送工作 | 跑下面的清单 |

stash 之前一定要先看 `git status --short` 和 `git diff --stat`。如果变更里有可能属于另一个 agent 或工程师的文件，**停下来识别 owner**：

```bash

git worktree list
git branch -vv
```

worktree 清理的默认策略是——**不确定就保留**。AI session 结束时工具经常会问要不要删 worktree，默认答案是"保留"，除非五条全过：

```bash

git status --short                              # clean
git branch -vv                                  # 没有 unpushed commits
git worktree list                               # 没有人在用
gh pr list --state open --head <branch-name>    # 没有 open PR
git log --oneline origin/main..<branch-name>    # 有价值的 commits 已 push 或 merge

```

保留一份 review context 通常比省一点本地磁盘重要得多。

# 0x04 AI Context 才是真正的"起跑线"

Git 隔离解决的是**工作区**问题，AI context 解决的是**理解**问题。这是两个不同维度，但很多团队只解决了前者。

很多 AI 事故不是模型不会写代码，而是**它基于错误的现实写出了看起来很合理的代码**。比如：旧架构文档里某个 module 还在，但代码里早就删了；AI 看着旧文档继续调用，跑起来才发现 import 失败；然后它开始"自信地"造一个假的 module 来补全。

每个产品仓库都应该提供一份轻量上下文，让所有工具从同一组事实开始：

| 文件 | 作用 |
|------|------|
| `CLAUDE.md` | 面向 Claude Code 的仓库指南 |
| `AGENTS.md` | 工具中立的 agent 指令和仓库边界 |
| `docs/VIBE_CODING_CONTEXT.md` | 两分钟工作记忆：当前存在什么、删除了什么、技术栈、当前 sprint |
| `docs/architecture/STATUS.md` | implemented / partial / deleted / design-only / planned 的**单一事实源** |
| `.cursor/rules/*.mdc` | Cursor 专属规则，但必须和上面这些一致 |

AI session 的阅读顺序也要固定：先读产品当前 context（`VIBE_CODING_CONTEXT.md`），再读 status（`STATUS.md`），再读 agent 指令（`CLAUDE.md` / `AGENTS.md`），跨产品再读平台文档和契约。`STATUS.md` 跟旧架构文档冲突？以 `STATUS.md` 为准。文档腐烂是常态，给一个明确的"事实源"比假装所有文档都对要诚实。

跨仓库改动**不能**靠"同时开几个 PR"解决。推荐顺序是：dependency repository PRs → product repository integration PRs → documentation index 或 release notes → cleanup branches。涉及 submodule pointer 的，必须先在 submodule 内 commit、push、PR merge，再更新 parent repository pointer。跨仓库协作的本质——让依赖方向在 Git 历史里也清晰可见。

# 0x05 总结

多Agent协作的Git规范，本质就是一句话——**给工具划清责任边界**。下次开多个 agent 之前，对着这张表扫一遍：

| 阶段 | 必做检查 |
|------|---------|
| 开新任务前 | `git fetch origin --prune` → 从 `origin/main` 创建 worktree → `git status` 必须 clean |
| 启动 AI 前 | 写下 branch / scope / out-of-scope / test command / can-push? |
| commit 前 | `git diff --name-only` 看是否只动了 scope 内的文件 |
| PR 前 | `git diff --check` + 跑一次真实测试 + 写明 agent / owner / dependency |
| stash / reset / force push | 确认 owner、备份旧状态、人类确认 |
| 删 worktree 前 | clean + 无 unpushed commit + 无 open PR + 无人在用 |
| AI Context | `STATUS.md` 是单一事实源；旧文档冲突时以它为准 |

回过头看，这套规约里没有任何一条是"AI 才需要"的——它们本来就是好工程实践。AI 只是把它们从"建议"变成了"必须"。因为人犯错，commit 之前还有几秒钟的犹豫；AI 犯错，从思考到写盘可能不到一秒。

当这些规则成为默认工作流，多个 IDE、多个 agents、多个工程师就不再是互相踩踏的并发写入者，而是可以并行推进、独立验证、最终有序集成的协作者。

# 参考

* [git-worktree 官方文档](https://git-scm.com/docs/git-worktree)
* [Trunk-Based Development](https://trunkbaseddevelopment.com/)
* [Conventional Commits](https://www.conventionalcommits.org/)
* [Vibe Coding 生存指南](/2026/03/09/vibe-coding-complete-guide/)
* [AI软件工程实践：构建企业级Agentic SOC平台](https://fz.cool/AI-Software-Engineing-With-Project-Agentic-SOC-Design-And-Implement/)
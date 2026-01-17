---
layout: post
title: AI软件工程实战：从零构建Agentic SOC平台的架构与落地
categories: 安全架构师
kerywords: AI编程 Cursor Gemini3 Opus Claude 编码 产品设计 AgenticSOC 原型设计 上线 前后端分离 快速原型 敏捷开发 AI安全 LLM AI安全运营中心 Agent As Engineer
tags: 安全架构 安全产品 安全研发
---

> 在刚刚过去的一期项目中，我们消耗了约18亿Token，使用Cursor Ultra与Claude Code构建了一个企业级 Agentic SOC 平台。本文不谈“Vibe Coding”（凭感觉编程），而是从软件工程的角度，复盘如何通过架构约束、测试驱动与文档管理，驾驭AI完成从33万行生成代码到8万行核心代码的提炼。

# 0x00 前言: 与美元对话

2025年底，Agentic SOC 平台的一期开发终于快要收官。回顾这两个月，我最大的感受不是在和智能体（Agent）对话，而是在和美元（$）对话。即便使用了 Cursor Ultra 会员和 Claude Code 的代理，高强度的开发依然让 Token 消耗惊人。粗略测算下来，项目初期构建框架时，代码成本高达3-5元/行；后期功能实现阶段降至0.5元/行；而文档编写成本约为 0.1元/行。这笔昂贵的学费教会了我一个道理：AI编程可以使10倍工程师进化为100倍，也能让1倍工程师退化为0.5倍。 区别在于，你是在用软件工程鞭策AI，还是在被AI产生的“垃圾代码”所淹没。

本篇就结合近期实践和总结，介绍一下如何有效鞭策AI完成大型项目的设计及落地。

# 0x01 AgenticSOC: Model As Agent, Agent As Engineer

> 懂业务才能做出好产品：真正懂得安全的人更能做出优秀的安全产品。

通过为Agent设置增强的Prompt，引入RAG的知识库，并读取企业资产列表（作为授权的一部分）同时使用特定的MCP Tools来实现以**Model As Agent，Agent As Engineer**为设计理念的Agentic SOC平台。传统的自动化（Playbook）是**系统执行任务，人工分析结果**；而Agentic SOC旨在实现**AI执行系统任务，AI分析结果**。在这个设计理念里，Agent不再是简单的聊天机器人，而是被赋予了具体职能的虚拟工程师：不同的Agent共同构成了一个虚拟SOC团队用来处理日常任务。

在落地过程中，发现虽然有时引入了所谓新的设计逻辑，但实际效果却大不如之前。例如在开启ReAct模式之后，Agent反而在思考/观察/执行的过程中持续放大幻觉。所以也要注意，在AI类的产品使用中，无论是代码实现，还是用于对话处理其他任务，都一定要优先选择聪明好用的模型。**优先选择聪明好用的模型（如 Gemini 3 Pro, Claude 4.5 Sonnet）比复杂的 Prompt 工程更重要**。

在SOC的日常运营过程中，如何将【系统执行任务-人工进行分析】的过程先变成【系统执行任务-AI进行分析】最后到【AI执行系统任务- AI进行分析】是实现Agentic SOC产品的关键。以此来符合最终“Model As Agent，Agent As Engineer”的理念。假想一下既然每天可以让工程师执行告警分析，执行扫描任务，为什么不是AI每天帮助SOC Engineer进行执行告警分析和扫描任务？

先看一下其在不同场景的实现：

* 直接在聊天中进行代码审计
![img](https://img.iami.xyz/images/ai-coding/agentic-soc-code-audit-demo.png)

* 进行源代码扫描并生成报告
![img](https://img.iami.xyz/images/ai-coding/agentic-soc-code-scan-demo.png)

* 查询威胁情报
![img](https://img.iami.xyz/images/ai-coding/agentic-soc-misp-demo.png)

* 知识库功能
![img](https://img.iami.xyz/images/ai-coding/agentic-soc-rag-demo.png)

* 敏感信息泄漏检测
![img](https://img.iami.xyz/images/ai-coding/agentic-soc-remote-leak-detection-demo.png)

* 工作流调度执行
![img](https://img.iami.xyz/images/ai-coding/agentic-soc-workflow-n8n-demo.png)

在一期的设计实现过程中，依旧是遵循传统的User和Agent对话的形式，用来完成日常任务的处理。输入层统一收敛至AgentRunner实现调度，通过判断任务复杂实现不同的对话模式（Direct/ReAct/Workflow）。其实最早的设计实现仅具备Direc模式,想来还是太高估模型的能力了。后续则陆续引入了ReAct以及Workflow模式。针对任务的处理，以及Agent的记忆管理，MCP的执行等等细节也不在此赘述。

# 0x02 使用AI进行软件工程实践

使用AI Coding仍需要懂得软件工程，懂得使用AI的人才不会被AI取代（至少目前看来是的，也许有一天AI进化的完全能够自主控制一切，尚未可知）。其实从需求到产品的过程中，最重要的不是代码功底实现，也不是对AI编程工具的使用。而是能够理解自己的业务场景，并且知道能如何转换为平台产品。人人都是产品经理到人人都是全栈工程师的转变，恰恰需要对软件工程深入的了解。一个人配合AI是如何从产品架构设计到UI分区的解耦，从前端API路由再到后端的逻辑实现。如何管理实现自己的AI项目，对软件工程的经验功底还是比较考验的。另外因为讲的是AI软件工程的实践，整体将按照**架构设计-编程实现-测试-文档以及常见问题**的流程去介绍在这些过程中使用AI所需要注意的点。 

## 1. 架构：从需求到产品

> 架构设计是一种平衡的艺术：AI可以帮你设计、平衡；但前提使用者要有判断的能力；

关于产品本身的可行性的研究分析，最初使用Gemini进行了Deep Research。 但在对AgenticSOC产品的架构设计，反而没有使用过多的AI辅助，基本都是纸上写写画画，包括UI布局，技术栈，功能模块等。而是否可以使用AI帮助进行架构设计，从经验上看在小型项目上应该是完全可以的。或者就是通过分层架构的形式逐步迭代产品的功能（这要求设计之初具备可扩展性）。不过还是推荐更多使用Gemini 3在技术栈的选型上面（如果你真的不懂架构设计，那就尽可能的把需求描述给AI吧，多对比不同AI模型的Research结果）。


![img](https://img.iami.xyz/images/ai-coding/architecuture-of-Agentic-SOC-Arch-Platform20260109.png)

以上图关于Agentic SOC Architecutre而言：

* 在整体架构设计阶段推荐使用`Gemini 3 Pro`做可行性分析（Deep Research），并选择`Opus4.5`做组件/领域细化，不建议直接开始编程实现；
* 领域驱动架构设计：可以通过细分到每个领域来实现具体框架内的代码：比如代理领域->执行和推理、验证领域->反幻觉、知识领域->RAG和文档、工具领域->调用执行等；
* 架构设计结束之后，会意味着有多个方向的特征需要编程实现，可以使用 Opus 完成Phase拆分，并记录成文档。要把文档作为模型的“记忆库”，通过组织文档目录结构，记录文档状态（状态跟踪表）以便实现丝滑的代码实现。详细参考[文档章节](#4-文档保持纪录) ；

对于文档和绘图相关（要把架构设计相关的文档经常丢给AI检查，是否实现逻辑一致，有无GAP并进行分析等，即时刻关注编程实现过程中的架构review）：

* 使用`Mermaid`比`Plantuml`的效果更好一些，但是注意Gemini生成的`Mermaid`的语法错误次数要比Opus高很多；
* 对汇报的架构图的绘制，则可以通过使用Gemini对Mermaid架构图的描述之后丢给AI实现，效果还是非常符合技术范的：[参考此处](#3-测试相信但验证)。甚至需要各种高大上的奇怪图也是可以的。

另附上一些常见的Prompt针对该类场景：

| Task         | Prompt Pattern                                                              |
|--------------|-----------------------------------------------------------------------------|
| New Feature  | "Design [feature] following the domain pattern in COMPLETE_ARCHITECTURE.md" |
| Gap Analysis | "What's missing from Phase X? Suggest implementation"                       |
| Integration  | "How should [new component] integrate with [existing domain]?"              |
| Refactor     | "Refactor [component] to match the layered anti-hallucination pattern"      |
| Review       | "Review this architecture for security/scalability issues"                  |

## 2. 编程：意图即代码

> 软件工程驱动AI编程：AI编程可以使10倍工程师变成100倍工程师，也可以使1倍工程师变成0.5倍工程师。

我在小红书上看到一个Gemini制作手势交互的粒子教程，其中博主讲了一个很重要的点，就是有一句提示词用来避免AI使用React，而是使用单个的Html文件。这在早期进行demo非常有效，作为玩具来说也无可厚非。但是在真正的产品设计和实现里显然是无法满足业务需求的。那么问题来了？AI懂技术栈，你懂吗？AI可以帮你选型技术栈，你吗？能够review代码，能够判断技术栈的合理程度吗？AI编程可以使10倍工程师变成100倍工程师，也可以使1倍工程师变成0.5倍工程师。那些非常头疼于Vibe Coding 10分钟，调试三天的就属于这种情况。

### 2.1 编程的一些技巧

1. 使用Gemini3 Pro编写框架代码，完成初期架构的实现；
2. 使用Opus 4.5进行具体的功能实现，例如多个MCP Server的编写，调度任务的优化。之后使用Gemini3 Pro去Review架构设计和具体的功能实现。判断优化的点；
3. 每次实现一个独立的feature，或者是功能相关联的feature实现；当你不确定feature设计是否完善时，可以指定先用Agent模式生成文档；
4. 使用独立的Agent对话，用Gemini3 Pro去修复backend error以及frontend的error；
5. 确保编写Test Case以及Document，需要**Trust but Verify**
6. 测试案例通过后，手工Review这个独立Feature的代码实现以及文档是不是可行的，有没有导致意外修改；
7. 进行Commit提交；重复以上步骤；

### 2.2 产品设计的一些技巧

1. 初期的UI界面设计会面临多次的调试。因为框架没有被填充完整之前，会被AI出现意外发挥。需要在样式固定完之前，多次检查前端的页面交互逻辑；关于产品设计的前端相关，可以访问此处[Product Design Learning Hub](https://design.fz.cool/)，里面有介绍常见布局，样式，行为，框架等知识。
2. 即便是为了完成最快的原型MVP，也要使用可迁移的接口，这种实现看似成本较高，实则更便于后续的迁移。例如使用ORM框架，MVP时用Sqlite，之后migrate到Pg；（人眼中的成本更高实际对于AI实现而言，有时候差别并不大）
3. 在引入新的组件时一定要先阅读分析，判断新的组件的可行性。例如使用Qdrant还是Milvus，低估了搭建的复杂度，SDK的差劲之后，会耗费大量的精力在AI重复修复代码上；
4. 复杂的功能组件在前后端实现之前，记得再读读SOLID五大原则：单一职责（SRP）、开闭（OCP）、里氏替换（LSP）、接口隔离（ISP）和 依赖反转（DIP），不能完全依赖AI帮你进行平衡设计；

### 2.3 Curosr 使用的一些技巧

* Curosr会自动忽略Gitignore内的文件不被index到Vector store；
* 如果某些时候，你开了很多个Agent之后，发现内容不同步了。记得进入cursor settings-> Indexing & Docs, 手动Sync, 或者Delete Index 重来；
* 点击Agent对话框里的Brower Tab，使用选取框直接勾选对应的样式，代入对应的代码进入对话框。尤其是你需要A元素去遵循B元素的样式和布局时非常好用。比直接文字描述使A和B一样时更有效；
* 如果一次实现了多个Feature（不建议，参考前面的编程技巧），但也记不清是啥了，记得新开一个窗口问一下Agent。 

### 2.4 Claude使用的一些技巧

* Claude Code的CLI里模型只有200K窗口，所以`CLAUDE.md`千万不要太大；我之前迁移Cursor Rule到CLAUDE规则时写了大概990行的Rule，效果不差，但是浪费Context，auto-compact次数增加。不如移动到独立的rules里面。
`.claude`的目录结构
```shell
.claude
├── rules
│   ├── agents
│   │   └── agent-development.md
│   ├── backend
│   │   └── python-standards.md
│   ├── docs
│   │   └── documentation-standards.md
│   ├── frontend
│   │   └── typescript-standards.md
│   └── metabrain
│       └── metabrain-standards.md
└── settings.local.json

7 directories, 6 files
```
`.claude/rules/backend/python-standards.md`, 可以看到其只作用于后端代码
```markdown
---
paths:
  - "backend/**/*.py"
  - "*.py"
---

# Python Backend Standards

```
* 如果你需要并行使用Claude CLI进行编程，可以在每个字文件夹建立对应的`CLAUDE.md`
* 如果使用三方代理商的Claude模型，注意使用的接口是否带缓存命中机制； 初期使用的三方代理不提供缓存命中也许提供，但是命中率为0，后期又突然能够命中。
* 在Cursor里安装ClaudeCode插件后通过在claude cli里使用`/ide` 命令能够连接到Cursor的IDE，然后通过`Super+Shift+ESC`在Cursor内打开界面
* 如果你使用较为便宜的代理商的模型，可以只用来整理文档，避免编写代码；

### 2.5 并行鞭策AI进行编程（结合Cursor和Claude）

`AgenticSOC`的目录结构

```shell
AgenticSOC
├── backend
│   ├── __pycache__
│   ├── core
│   ├── data
│   ├── features
│   ├── scripts
│   ├── tests
│   └── venv
├── docs
├── frontend
│   ├── dist
│   ├── node_modules
│   ├── public
│   ├── src
│   └── tests
├── Brain
├── nginx
└── scripts
    └── systemd
42 directories
```

我通常会开四个ClaudeCode CLI的窗口，一个Cursor的窗口。 AgenticSOC的CLI窗口和backend, frontend, brain三个CLI的窗口，然后每个都会建立独立的CLAUDE规则，方便快速的分别实现各个新功能的开发。同时使用AgenticSOC窗口进行全局文档的更新。不过后来发现backend的代码更新经常会触发到frontend的代码更新，而当前的frontend的cli窗口可能并不会主动的发现更新。于是便通过增加`sync-context` Skill的方式，在一个窗口鞭策完AI，如果另一个窗口归属的文档发生了变化就先执行一个`sync-context`的方式进行。 （`/compact` 和 `claude --resume`对于我来说用处不大，我一般会持续的开着窗口鞭策AI，很少有resume的情况）
![img](https://img.iami.xyz/images/ai-coding/claudecodecli-at-weekend.png)

此处为 `~/.claude/skills/sync-context/SKILL.md`

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

回到对AgenticSOC平台的设计理念**Model As Agent, Agent As Engineer**，其实在编程过程中，我们也可以用这个思维，开多个Agent并行编程，什么代码review工程师，文档工程师，测试工程师，研发工程师等等。 找到符合你的设计理念，并将其转换成对应的编程工具的rules； 同时在实践的过程中，保持警惕，避免因为AI模型突然降智导致项目变得拉垮。其他还有一些情况视具体项目实现，比如使用`git submodule`来拆分功能块，通过提供标准接口，来减少当前编程工具对上下文的感知消耗。

## 3. 测试：相信但验证

> ⚠️需要检查AI是为了通过测试修改了源代码，还是修改了测试用例为了通过？

每次增加新的功能特性之后，都需要进行对应的单元测试。如果使用TDD的方式，则是先写测试用例来判断使其符合对应的功能预期，之后编写对应的业务逻辑代码。但是在AI类的大型项目里面则不太适用。因为对于模型而言，上下文的容量可能还不够记住原有的结构设计。所以更多的时候通过直接编写业务逻辑，并且事后进行测试。但注意不仅要做单元测试，还要做集成测试。尤其是一个功能改变影响到了其他组件，比如增加了多个AI Provider支持Embedding之后，理论上并不影响Vector Store也不影响Chat过程中对RAG知识库的Involve。但是是否就不需要进行集成测试了？

![img](https://img.iami.xyz/images/ai-coding/Simple-version-of-architecture-agentic-soc-low.png)

显然不是，你会通过单元测试发现不同的AI Provider对Embedding chunck size的不同，也会发现在集成测试中，AI的某些代码实现导致无法对RAG知识库进行Hybrid Search了。 除此之外如果对性能有要求的话，可能还要做性能测试并进行优化。例如，增加Cache功能之后，需要验证Cache的命中率。并且在前后都运行性能测试工具来验证Cache是否生效。虽然直观的可以感受到在前端交互界面的响应快慢，但最后要通过数据来说话。针对AgenticSOC项目的性能测试前端可以采用`playwright`，后端则使用 `locust`。而通过测试能够除了发现代码上的优化，还可以发现如何在架构上进行优化。比如后端最开始使用PG存储所有数据，Embedding Json，Uploaded File， Chat Message。 所以对DB得优化最先开始先对DB建立索引，之后在前后端之间用`Redis`作为Cache层。最后又通过使用Minio对上传文件进行独立存储，只用DB存路径，然后Embedding Json也从PG Vector单独使用`Qdrant`进行存储。（`Milvus`不好用）；前端则通过Bundle Optimization（React.lazy + Suspense 对核心路由进行拆分）、Aggregated Endpoint（多个配置请求聚合为单次，降低RTT），集成`react-virtuoso`实现窗口化渲染。无论消息堆积至多少，DOM节点数维持常数级。

不过最后重要的一点，就是一定要注意检查AI在测试后的修复，是真正改了源代码为了符合测试用例，还是测试用例改了为了提高通过率？在实际过程中发现有一次单元测试中19个失败3个成功，检查之后，发现源代码本身是返回`200`作为创建资源之后的状态码，其实应该是返回`201`。但是AI为了确保测试案例通过直接去修改了测试案例。而经过人工review代码发现实际是代码中应该返回`201`，而不是`asset status_code == 200` , 最后则通过修复源代码，而提高了通过率。这个案例看起来似乎只是状态码而已，有点无关紧要。而且人工编程中，乱用状态码的比比皆是。是不是就无所谓了？实际并非如此，这个案例只是为了说明，在vibe coding的过程中，AI往往为了满足你的一时需求，而以高优先级的姿态短暂实现。这种在大型项目中极为禁忌，遗留的小bug往往造成难以估测，尤其是越往后，增加起新的feature就越差。 目前感觉代码在2-3万行左右之后, Agent编辑后的代码需要Reject的就会变多。

![img](https://img.iami.xyz/images/ai-coding/Cursor-display-line-editor.png)

Cursor得这个统计显示接受了33w行的编辑，而实际在项目里的只有大概8W行左右的代码(`cloc $(git ls-files)`或者`cloc --vcs=git .`)。

![img](https://img.iami.xyz/images/ai-coding/code-summary-cloc-with-gitignore.png)
不过Cursor这个统计并不完全准确，因为还有不止2w行的文档和代码来自ClaudeCode的编写。但另一方面来看，即便Agent在编程测试的过程中有着高达334,713/ 356,439的接受率，**实际却只有可怜的20多%** （8w/35w，实际分母应该是远远超过35w行的，剩下的都被`git checkout .`掉了）

## 4. 文档：保持纪录

> AI三省其身：实现这个功能了吗？有编写测试用例并确保通过吗？有写文档记录下来吗？

对待文档，有三条主要的设计原则:
* 文档按目录结构存储
`docs`的目录结构
```shell
.
├── architecture
│   ├── AGENTICA_COMPLETE_ARCHITECTURE.md
│   └── PERFORMANCE_ARCHITECTURE.md
├── development
│   ├── RESOLVED_ISSUES.md
├── examples
│   └── PENTEST_GUIDE_JUICE_SHOP.md
├── features
│   ├── agents
│   │   ├── MULTI_AGENT_SYSTEM.md
│   ├── knowledge
│   │   ├── RAG_CHAT_INTEGRATION.md
├── guides
│   └── USER_MANUAL.md
├── HEADER_STANDARDIZATION.md
├── operations
│   ├── CONFIGURATION_SUMMARY.md
│   ├── NATIVE_DEPLOYMENT.md
└── todo
    ├── ANTI_HALLUCINATION_IMPROVEMENTS.md
    ├── FEATURE_REQUESTS.md

14 directories, 56 files
```
* 文档按进度状态更新
`docs/agent/AGENT_ARCHITECTURE`的示例内容
```markdown

# Agent Architecture: Model as Agent, Agent as Engineer

**Created**: 2026-01-01
**Updated**: 2026-01-13
**Status**: ✅ 100% Implemented (Production Ready)
**Priority**: High

---

```
`docs/development/RESOLVED_ISSUES`的示例内容
```markdown
# Resolved Issues Index

**Created**: 2026-01-13
**Updated**: 2026-01-13
**Status**: 🔄 Active/Tracking

Quick reference to all resolved issues with links to detailed documentation.
---

## By Category

### Frontend/UI Issues
tabel 1
### Agent/Backend Issues
tabel 2

## Quick Stats

- **Total Resolved**: 11
- **Frontend/UI**: 6
- **Backend/Agent**: 2
- **Knowledge/RAG**: 1
- **CI/CD**: 2
---
```
* 功能实现后的文档更新需要比对源代码
对于大型项目而言，使用AI进行文档更新之前，使用工具先获取对应的结果会更加高效。比如让Opus去check code并更新文档时，不如提供一个脚本分析AST结构，再给到Opus去分析脚本输出。对于`fastapi`做后端的项目，可以通过访问 `curl http://localhost:8000/openapi.json` 来获取API接口并作为更新架构的一部分给到AI去分析，相较于大规模的扫描源代码然后持续的`auto-compact`效果会更好。对于数据库则可以通过 `eralchemy2`实现， `eralchemy2 -i postgresql://username:password@localhost:5432/databasename -o /tmp/testing.png`

而在编程中日常问AI最多的三句话就是：你实现这个功能了吗？你有编写测试用例并确保通过吗？你有写文档记录下来吗？但有时候效果却并不是那么好，使用Opus时似乎不会遵循每次实现完feature就更新文档的Rule，使用Sonnet时则会严格遵守写完feature就更新文档，但是文档的位置却不对。也算是一个小的bug吧。而且在Cursor中使用Claude Code能够去更新文档，切换为Claude CLI就不会。不知道是代理模型的问题，还是工具的问题。

## 5. 常见问题

模型接口和编程工具问题：
* 弱智模型不要用；
* 道德感较高的模型不要用；
* 模型的幻觉在渗透测试环节非常严重，抵抗幻觉尤为重要。通过增强Prompt，对生成内容的实体进行匹配，确保不是瞎造数据。还要引入HITL (Human-in-the-loop)，让关键步骤通过 `ask_human` 工具强制人工介入。除此之外还做了一个Honesty Agent，让每轮进行Direct模式独立会话，检查工具输出和模型输入和响应的逻辑是否一致；
* 模型的数据知识有限，无论是Anthrropic家，Google家，在产生代码时往往里面写的是Gemini1.5 pro之类，不知道使用最新的；
* CLAUDE的CLI里面选择使用Opus模型，在connect 到Cursor IDE之后打开的ClaudeCode界面里没有自动使用Opus，而是default，多次强制设置为Opus之后，依然会使用Sonnet和Haiku
* 使用不同的模型作为AI Provider时，返回的ASK_HUAMN有可能是大写有可能是小写，因为AI代码的不够健壮，导致HITL时未正确弹窗，需要注意在类似的编程过程中，校验格式时统一大小写，或者统一lower()掉；
* 需要注意使用代理商的模型和原厂的模型时针对SDK得不同实现，尤其是Claude类模型需要使用原厂的好像可以配置AUTH_TOKENANTHROPIC_API_KEY 而三方代理通过配置ANTHROPIC_AUTH_TOKEN；
* 不同模型提供Embedding的时候的Chunk Size是不一样的；注意代码的兼容性，尤其是支持不同Model进行Embedding时；
* 不同模型进入ReAct Loop时，Tier 1级别的会去Loop，但是Tier 2级别的会Loop个2轮3轮， Tier 3 的只会一轮就结束了；

数据流的问题：
* 使用不同的模型时如何使前端行为的样式一致。因为模型本身输出的结果不一定按照预期实现，所以需要实现不同的模型都能够具备一致的格式输出；
* 平台内不同的组件如何能够打通数据流， 使用Data Fabric建立供不同组件使用数据的服务。用OSS串起来在MCP Server， RAG Storage， Chat，Agent之间进行数据流通；
* 不能直接使用LLM输出作为命令执行的字符串，需要使用Structure Output，进行过滤执行。LLM直接拼接的字符串，容易遇到JSON的多次转义问题，导致直接执行时出现失败；
* 使用简单易扩展的产品去填充整体框架里的空白，例如使用QDrant而不是Milvus。否则你可能花费100$调试一个集成后的bug，之后在第二天又回退了50$的代码；

环境及性能相关的问题：
* 本地dev开发，和远程环境使用docker时，会出现类似的针对路径错误的问题。注意记得挂载正确路径。或者提供Data Fabric打通内部组件间的数据流；
* 注意`npm run dev`时不报错，但`npm run build`可能也会报不少错。这也导致了一些前端feature本地运行正常，但在服务器端无法使用；
* 远程部署时还是要注意docker compose build --no-cache才行；
* ubuntu默认使用的nodejs18.x，如果你是native部署，而你的前端代码又需要22.x，记得安装先nvm；
* 无论是安装nvm还是安装uv，或者pip install依赖，AI的start脚本一般不会发现过程的失败，尤其是远程服务器的网络问题导致拉取失败时。需要告诉AI记得检查和判断有没有成功；
* gzip针对SSE Stream的问题，性能优化推荐开启GZip，但将导致SSE失败。该点不易作为性能优化使用；
* 增加缓存架构之后，发现点击重命名chat失败，发现是前端30秒缓存覆盖了react query
* 前端的性能测试过程中，代码best practice达到了100分，但是 performance只得到了25分； 说明best practice并不能带来更好的性能；


# 0x03 总结

25年的curosr年度报告里使用了700M左右的Token，其中100M得token做了几个小玩具。而剩下的Token使用则就只在搭建AgenticSOC平台的框架（主要使用Gemini3）了。根据前期的测算，最早的构建框架过程中，大概约3-5块一行代码，后期功能实现约0.5元一行代码，而对于文档的编写，则大约0.1元。再一次形象的说明了**每次对话都是和💲对话**

![img](https://img.iami.xyz/images/ai-coding/cursor-summary.png)

而自从充了Cursor的Ultra会员后，Cursor也是非常积极的三天两头开始更新。动辄的Update&Install，结果对于本用户而言，就是看到Agent看板挪到了编辑器右边，哦，新版本又更新挪到了左边； 哦，编辑器侧边栏不展开了，哦，编辑器又默认展开了。 哦，对了，突然想到一个事情，就是不要盲目的去充各类AI的会员，虽然说一个年纪有一个年纪要领的鸡蛋。但当时图便宜冲了Trae的年费会员，结果同样的Prompt使用“同样的模型”（真的吗？），得到了一个明显不是一个Level的Demo构建，从此吃灰。

在AI时代，配合合适的工具，通过对模型付费以及正确的使用，确实能够大幅的缩短时间。10倍工程师可以变成100倍工程师的可能性也大大提升。但与此同时，对输出的鉴别判断能力，也显得更为珍贵。只有持续的投入到专业领域，学习实践和总结输出才能够不被AI淘汰。大家都知道需要投入才会有产出，如果没有投入，又期待什么产出呢？我一直没有所谓被AI淘汰的焦虑，但也不得不承认LLM的迭代速度真的是非常惊人。

当然最近也常常听到技术并不重要，但技术真的不那么重要吗？也许，只是对那些不太懂技术的人来说，技术确实并不重要。



# 参考

* [AI for 安全攻防：自动化渗透 Agent 的工程设计与实践（Agent Pattern Graph 与 Meta-Tooling）](https://l3yx.github.io/2025/12/07/AI-for-%E5%AE%89%E5%85%A8%E6%94%BB%E9%98%B2%EF%BC%9A%E8%87%AA%E5%8A%A8%E5%8C%96%E6%B8%97%E9%80%8F-Agent-%E7%9A%84%E5%B7%A5%E7%A8%8B%E8%AE%BE%E8%AE%A1%E4%B8%8E%E5%AE%9E%E8%B7%B5%EF%BC%88Agent-Pattern-Graph-%E4%B8%8E-Meta-Tooling%EF%BC%89/)
* [This Buzzy Cyber Startup Wants to Take On Dangerous AI Threat](https://www.wsj.com/tech/ai/this-buzzy-cyber-startup-wants-to-take-on-dangerous-ai-threat-c0916a3a?gaa_at=eafs&gaa_n=AWEtsqfdHR3NvKGUW_WdZNq_m7qF6BpUUP7yUDpz86iuVVivdSF6pd9TgRAHczHe4KI%3D&gaa_ts=6969dbb6&gaa_sig=-qpTLMDpQMPQX1PbiKzNs4INJA4bt4ecSBSL3kZhmC69pt6txkZfzxeVgU9xNoBXcwB82FBQxHvFTiHu0g8Y0w%3D%3D)
* [AI编程实践总结](https://fz.cool/AI-Coding-Best-Practice-With-Cursor/)
* [软件工程实践：以Python为例](https://fz.cool/Coding-With-Python/)
* [从删库到跑路：我的Python全栈踩坑实录](https://fz.cool/Python-FullStack-In-Action-And-Issues/)
* [codeguide](https://www.codeguide.dev/)
* [Qdrant](https://qdrant.tech/)
* [FastAPI](https://fastapi.tiangolo.com/)
* [Claude Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
* [Use Claude Code in VS Code](https://code.claude.com/docs/en/vs-code)
* [AI coding 智能体设计](https://developer.aliyun.com/article/1704760)
* [MCP 安全“体检” | AI 驱动的 MCP 安全扫描系统](https://developer.volcengine.com/articles/7553893038204911679)
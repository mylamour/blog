---
layout: post
title: AI Agent 时代的 SDLC：安全工程如何重新落地
description: "既有的安全治理、架构评审、纵深防御、身份与密码基础设施并没有因为 Agent 的出现而过时；真正变化的是执行主体、边界和速度。本文讨论这些原则如何进入 Agent 参与的软件生命周期，以及哪些控制必须由机器核验。"
categories: CTO
tags: [安全架构, AI 软件工程, Agentic SDLC]
keywords: [AI Agent SDLC, AI-Native SDLC, Security Architecture, Policy as Code, Workload Identity, PKI, KMS, Evidence]
translated: true
---

> Claude 的[《AI-Native SDLC Playbook》](https://claude.com/blog/the-ai-native-sdlc-playbook)讨论了怎样让 AI 进入 Plan、Design、Build、Test、Deploy 和 Maintain。它重新设计了人、AI、流程和工件之间的协作方式。
>
> 我想继续追问的不是“要不要再发明一套 SDLC”，而是：当 Agent 能读私有仓库、运行命令、调用外部服务、修改多个仓库，甚至影响真实环境时，过去的安全治理、架构评审、纵深防御、身份权限和密码基础设施应该怎样重新落位？
>
> 为了回答这个问题，我重新翻出了过去挂有“安全架构”标签的文章，结论并不新鲜：**既有安全工程原则仍然成立，变化的是执行主体、边界和速度。**
>
> 本文讨论的是 Agent 参与软件交付后的 SDLC，不是 AI/ML 模型自身的生命周期，也不是如何开发一个 Agent 产品。文中偶尔使用 `Agentic SDLC` 作为描述性标签。
>
> *本文系 AI 共同创作*

# 0x00 旧原则没有过时，变化的是执行主体

<!-- ![img](https://img.iami.xyz/images/agent-sdlc/agent-sdlc-architecture-chapter-00.png) -->

2019 年写[《什么是安全架构》](https://fz.cool/Security-Architecture-Review/)时，我把安全架构放在业务、应用、网络、部署和运营的交叉处。**架构评审不是开完会给一份 Checklist，而是从业务与数据流中识别风险，给出解决方案，再追踪它有没有真正落地。**

后来写[《现代化 SDLC 与架构评审》](https://fz.cool/Modern-SDLC-and-Security-Architecture-Review/)，主张仍然是三件事：

1. 用经过批准的策略与规范作为评审依据，而不是依赖个人偏好；
2. 通过平台把扫描、风险、例外和发布门接入研发流程；
3. 把设计、架构、威胁建模、风险管理、知识与系统集成放进同一个生命周期。

[《安全规范建设指北》](https://fz.cool/Build-Your-Security-Specifications/)又把这条链拆得更清楚：

- **Policy** 定义原则、范围和不可随意突破的底线；
- **Standard** 把原则翻译成技术基线；
- **Procedure / SOP** 规定具体场景下谁在什么条件下做什么；
- **Exception** 允许业务在明确 owner、批准人、补偿控制和到期时间下偏离基线。

[《从安全治理到安全验证》](https://fz.cool/From-Security-Governance-To-Security-Verification/)则把它收成一条反馈链：

```text
业务与风险
  -> 治理和权威规范
  -> 场景化设计
  -> 工程实施
  -> 独立验证与持续运营
  -> 反馈、修正或风险接受
```

这也是我过去文章里最稳定的一条主线。**安全架构不是产品清单，也不是“最佳实践”抄写；它要把业务场景、组织职责、技术实现和运营能力组合成可以持续交付的系统。** 没有最好的通用方案，只有在当前业务、基础设施、成本和风险条件下更合适的方案。

**Agent 并没有让这些原则失效。真正变化的是，过去由组织分工、人工等待和系统边界自然提供的一部分约束，正在消失。**

# 0x01 Agent 把隐含边界变成了显式控制问题

传统 SDLC 里，需求、设计、开发、测试、发布和运营通常由不同的人，在不同时间、不同系统中完成。这个过程不一定高效，却免费提供了几道边界：开发者通常不能单方面批准自己引入的风险，测试和发布有机会重新观察结果，生产凭据也不会默认出现在开发者手里。

Agent 可以在一次任务里跨过这些阶段。它既能写实现，也能选择测试、解释失败、生成报告、创建 PR、触发部署，然后宣布“完成”。**速度提高以后，原来藏在等待和交接里的职责分离不再可靠。**

![img](https://img.iami.xyz/images/agent-sdlc/agent-sdlc-architecture-chapter-01.png)

| 过去经常依赖的隐含边界 | Agent 参与后的变化 | 必须显式补上的控制 |
|---|---|---|
| 人员分工代表身份与责任 | 同一账号后可能是人、Agent、runner、重试或接手者 | 区分人类权威、Agent/session/attempt、运行身份与证据签发者 |
| 阶段交接带来重新检查 | 一个 Agent 可以连续跨过多个阶段 | 每次状态迁移都有输入、输出、进入条件和合法失败出口 |
| 人工等待限制动作速度 | Agent 可以高频、并行地制造副作用 | 任务级授权、速率和预算限制、可撤销路径 |
| 工程师自己选择上下文 | Agent 会读取仓库、网页、Issue 和工具输出 | 来源、权威、摘要、新鲜度与适用范围必须可核对 |
| Review 默认独立于作者 | Agent 可以改实现，也可以改测试和验证器 | 固定判定规则、受保护验证环境、验证机制变更审查 |
| 部署成功常由运维复核 | Agent 容易把脚本返回值当成运行事实 | 制品来源、运行身份、配置、业务语义与回滚回读 |
| 失败由人决定停止 | Agent 往往重试、降级或换路径直到变绿 | `NOT_RUN`、`HITL`、`FAILED`、取消、交接和撤销都是合法结果 |

因此，本文所谓的 `Agentic SDLC` 只是在描述这个场景：**Agent 作为拥有工具、状态、受限权限和副作用能力的参与者进入现有软件生命周期。** 它不是“完全自治的 SDLC”，也不是“开发 Agent 产品的生命周期”。

问题也不在于 Agent 是否足够聪明，而在于系统能否回答四个朴素的问题：

1. **谁授权它做这件事？**
2. **它实际影响了什么对象？**
3. **谁用什么规则验证了结果？**
4. **失败、撤销和恢复由谁负责？**

# 0x02 原有安全工程原则如何重新落位

把旧文章重新放在一起后，可以看到**治理、纵深防御和密码基础设施并不是互相独立的专题，它们本来就应该作用在同一条交付链上。**

| 既有安全工程原则 | 原来解决的问题 | Agent 参与后的实现 |
|---|---|---|
| 治理与规范 | 规则从哪里来，谁批准，怎样例外 | 机器读取经过批准、带版本和适用范围的策略投影；例外绑定 owner、期限和补偿控制 |
| 架构评审 | 业务、数据、依赖和威胁是否被看见 | 任务准入前固定范围、依赖、数据流、验收与停止条件；缺少关键事实时拒绝继续 |
| 安全左移（Shift To Left） | 把适合的控制前置到设计、编码、构建和资源创建阶段 | 在 Agent 获得副作用能力前完成任务准入、策略匹配、范围与依赖分析、数据分类、上下文新鲜度、精确版本和权限校验；运行身份、业务语义与恢复能力仍需在真实环境核验 |
| Security by Default | 不让每个项目重复申请和手工配置 | 默认只读、最小工具集、隔离工作区、拒绝无关网络和文件访问、短时身份 |
| 纵深防御 | 单层控制失效后仍有独立防线 | 任务门、身份门、工具沙箱、代码 Review、独立 CI、制品准入和运行时回读使用不同证据与权限 |
| 身份与职责分离 | 谁能做、谁能批、谁能审计 | 分离人类 authority、Agent 身份、workload identity、reviewer、approver 和 evidence issuer |
| 信任与认证传递（PKI） | 建立、签发、更新和撤销信任 | 为 Agent、runner 和服务签发短时证书；签发、续期、吊销和信任分发可审计 |
| 密钥凭证管理（KMS/HSM） | 管理机密与密钥全生命周期 | Agent 只获得 secret reference 或短时租约；密钥生成、使用、轮换、备份、恢复和销毁留在密码边界 |
| 数据安全 | 数据在收集、传输、存储、使用、分享和销毁中的控制 | 对 prompt、上下文、日志、证据和记忆分类；最小化采集，限制出站，规定保留和删除 |
| 面向失败设计 | 控制、流程和运营必然会失效 | 预留 kill、revoke、rollback、checkpoint、handoff，并持续验证控制本身是否还有效 |


我过去在[《安全左移移了么》](https://fz.cool/Security-Shift-To-Left/)中，把安全左移理解为**将安全默认能力提前**：应用控制从运行期前移到架构设计和 CI/CD，基础设施控制前移到 IaC 与资源创建，数据保护则尽量前移到数据产生和访问层。这个判断在 Agent 时代仍然成立。

变化的是需要前置的对象。过去主要前置扫描、基线和配置检查；现在还要在 Agent 获得副作用能力之前，完成任务准入、策略匹配、范围与依赖分析、数据分类、上下文新鲜度、精确版本和权限校验。换句话说，**安全左移不再只是更早发现代码问题，还要更早决定一次自动化行动是否允许发生，以及它只能在什么边界内发生。**

但并非所有证明都能左移。制品是否真正部署、运行身份是否正确、业务语义是否成立、取消是否生效、回滚能否恢复，都只能在真实环境中核验。因此 Agent 时代需要的是：

```text
Security by Default：默认提供安全边界
Shift Left：在副作用发生前完成准入与约束
Runtime Closure：在真实环境核验结果与恢复能力
```

正确方向是 **“控制前置 + 运行闭环”，而不是把所有验证都搬到左边。**


## 1. 规范要机器可用，但权威不能交给 Prompt

Policy、Standard 和 Procedure 的区分，在 Agent 时代反而更重要。

`AGENTS.md`、`CLAUDE.md`、Rules 和 Skills 可以把规则投影给不同工具，但它们不天然是权威来源。**真正的规则仍要回答：谁批准、哪个版本、适用于哪些仓库与环境、何时生效、何时过期、如何申请例外。**

Agent 可以读取策略，却不能因为 Prompt 写着“你是管理员”就获得管理员权限；也不能静默扩大 scope、修改验收条件或把临时绕过变成长期规则。例外如果没有批准人、理由、补偿控制和到期时间，只是另一个永久后门。

架构评审也不能缩成让模型生成一份威胁清单。评审至少要固定业务目标、系统依赖、数据流、信任边界、关键资产、失败影响和 risk owner。Agent 可以帮助整理和检查，但不能替代最终的业务判断与风险接受。

## 2. 纵深防御不是多放几个 Agent

我过去把纵深防御理解为分层架构上的独立控制：系统、网络、身份和数据各自承担不同的失败。密钥管理中的分权、导入与启停角色分离，证书签发与使用分离，也是纵深的一部分。

Agent 场景同样如此：

```text
任务准入
  -> 人类权威与任务级授权
  -> Agent / workload 身份
  -> 工具网关、文件与网络沙箱
  -> 变更范围与分支保护
  -> 独立验证
  -> 制品准入
  -> 部署身份与运行时回读
  -> 撤销、回滚与恢复
```

这些层必须拥有不同的权限和失败方式。**让第二个模型 Review 第一个模型，不会自动形成纵深；如果它们共享同一个过期 checkout、同一套错误上下文和同一个候选验证器，只是在重复同一假设。**

安全控制本身也要被保护。验证器、workflow、policy 和测试如果能被候选变更一起修改，就不能单靠自己的绿色结果签发可信结论。这和“安全产品已经部署，但策略为零、日志不工作、证书不校验有效期”没有本质区别。

## 3. 身份与密码基础设施是一条信任链

过去写 KMS/HSM、CA/RA、Vault 和 SoftHSM 时，我反复关注的并不只是算法，而是完整系统：身份、权限、密钥生成与存储、证书签发、分发、轮换、吊销、备份恢复、审计、监控、性能和跨系统集成。

Agent 进入后，这条链可以这样落地：

```text
人类权威
  -> 任务级授权
  -> Agent / session / attempt
  -> runner 的 workload identity
  -> 短时证书或 secret lease
  -> 工具与外部服务调用
  -> 审计、到期、撤销和轮换
```

CA/RA 负责谁可以获得什么证书，以及怎样续期和吊销；Vault、KMS/HSM 负责机密和密钥在什么条件下被生成、使用、轮换、备份与销毁。 **Agent 不需要看到长期私钥或云凭据原文，它只需要在获准的执行边界获得一个短时、最小范围、可撤销的使用权。** 

**凭据原文不应该进入 Prompt、聊天记录或长期记忆。** 应用需要解密、签名或取临时数据库账号时，应在 workload 边界调用 Vault/KMS/HSM，由基础设施执行密码操作并记录审计。

SoftHSM 仍然有价值：它适合在开发和测试中验证 PKCS#11、CA 签发、不可导出密钥和应用集成流程。但 SoftHSM 测试通过，只能证明这套接口与流程在测试环境可运行，不能证明已经获得生产 HSM 的物理保护、双人控制、合规认证、灾备和运营能力。

## 4. 上下文与证据也属于数据安全

过去谈数据安全时，我习惯沿着收集、传输、存储、使用、分享和销毁看问题。Agent 的上下文、Prompt、日志、截图、trace、工具输出和长期记忆，同样要走这条生命周期。

至少需要问：

- 是否真的需要把这份数据交给 Agent，能否只提供摘要或脱敏字段？
- 数据来自哪里、由谁授权、适用于哪个任务，是否已经过期？
- 哪些内容可以进入模型上下文，哪些只能在工具执行边界使用？
- 输出和日志是否包含凭据、个人信息、客户数据或内部路径？
- 证据保存多久，谁能读取，任务结束后怎样删除或封存？
- 数据跨区域、跨组织或发给第三方模型时，是否满足合规与合同边界？

**“使用了 TLS”或“数据已经加密”不是数据安全的完成证明。** 还要核对证书信任、调用身份、密钥归属、数据分类、访问授权、保留期限和销毁结果。

# 0x03 哪些控制必须能够被机器核验

**机器可验证不等于所有判断都交给机器。** 业务目标、风险接受、重大例外和生产授权仍然需要有权的人负责。机器更适合做的是：让适用规则无法被遗忘，让对象与版本无法被偷换，让缺失证据不能被写成绿色。

| 控制点 | 至少记录的事实 | 失败时的行为 |
|---|---|---|
| 任务准入 | task ID、owner、scope、风险、验收、依赖、停止条件、精确 base revision | 缺失或冲突时不开始执行 |
| 权威与身份 | 人类批准者、Agent/session/attempt、workload identity、grant scope、过期时间 | 身份不明、权限不足或租约过期时拒绝副作用 |
| 上下文 | 来源、权威、内容摘要、digest、新鲜度、适用范围 | 来源不可信或内容变化时旧结论失效 |
| 执行环境 | image/runtime、依赖锁、worktree、文件与网络权限、凭据类别 | 环境漂移时重新验证 |
| 变更与影响 | actual diff、owned paths、依赖闭包、验证器是否被修改 | 越界写入或影响范围不明时停止 |
| 验证义务 | policy 来源、固定判定规则、命令、fixture、环境、结果 | `NOT_RUN`、`ERROR`、`UNKNOWN` 不得晋级 |
| 制品准入 | source revision、构建器、artifact digest、SBOM、签名与策略结果 | 来源或摘要无法对应时拒绝发布 |
| 部署与运行 | 环境、workload identity、配置、实例身份、migration、业务语义、rollback ref | 只看到脚本成功时保持“未证明” |
| 取消与恢复 | kill/revoke 结果、checkpoint、handoff、残留子进程和远程动作 | 无法确认停止时不得宣称任务已结束 |

一项任务的最小记录可以很简单，但不能只有一句自然语言“请把它做好”。至少应固定目标、范围、负责人与风险、精确版本、验收条件、依赖和停止条件。Agent 可以申请变更这些字段，但不能静默改写已经准入的任务。

**结果也不能继续被压成一个 `passed=true`。** 至少要区分 `PASS`、`FAIL`、`NOT_RUN`、`FLAKY`、`ERROR`、`UNKNOWN`、`CONFLICT` 和 `NOT_APPLICABLE`。需要人工决策时进入 `HITL`；流程无法继续时可以 `FAILED` 或 `HANDOFF`。这些都是合法状态，不需要重试到绿色。

更重要的是，不要把不同层级的事实混在一起：

```text
Evidence
  -> VerificationResult
  -> Receipt
  -> Decision
  -> Outcome
```

- **Evidence（原始证据）** 是日志、截图、trace、制品或源码窗口；
- **VerificationResult（验证结果）** 是固定判定规则对证据作出的结论；
- **Receipt（验证凭证）** 把结果绑定到任务、对象、版本、环境和策略；
- **Decision（决策）** 是有权主体依据凭证作出的状态迁移；
- **Outcome（实际结果）** 是部署或运行后现实世界发生的变化。

**截图不是部署授权；绿色 job 不一定是可信验证凭证；merged PR 不是业务结果。** 只有把这些层次分开，才能知道谁有权对哪一种结论负责。

## 多 Agent、跨仓交付的例子

假设一次变更同时涉及契约、生产者、消费者和部署环境。**正确的并行顺序不是三个 Agent 在共享 branch 上竞速，而是先固定依赖和所有权：**

```text
已接受的架构决策 / 契约
  -> 契约仓库
  -> 生产者仓库
  -> 消费者仓库
  -> 制品准入
  -> 部署与运行时回读
```

每个子任务使用独立 branch、worktree、owner 和负责路径。契约变化后，生产者与消费者都要运行自己的契约验证；new push 使旧 head 的证据失效；跨仓库按依赖顺序进入下一状态，而不是把几个绿色 PR 当成一笔已经完成的事务。

本地测试可以帮助 Agent 快速修错，但最终验证必须重新计算实际 diff、受影响范围和适用义务，并绑定精确 PR head 或 merge-group revision。若候选变更同时修改了测试、workflow 或验证器，验证机制本身也要被独立审查。

# 0x04 把控制放回真实的软件生命周期

上述控制不需要一口气建设成“大而全”的 Agent 平台。更实际的做法，是沿用原来的 SDLC，把已有原则放进最需要保护的交接点。

| 阶段 | 既有安全工程仍然负责什么 | Agent 参与后增加什么 | 进入下一阶段前的证据 |
|---|---|---|---|
| Plan | 业务目标、合规、数据分类、owner、风险与例外 | 固定任务范围、可用工具、预算、停止条件和人类 authority | 已批准的任务、适用策略版本、risk owner |
| Design | 架构评审、威胁建模、数据流、信任边界、密码方案 | 标记 Agent 可读数据、外部能力、身份与撤销路径 | 架构决策、依赖图、数据分类、验收条件 |
| Build | 安全编码、依赖治理、机密管理、最小权限 | 独立 worktree、负责路径、短时身份、deny-by-default sandbox | 精确 diff、依赖变化、环境指纹、无越界写入 |
| Test / Review | SAST/SCA/测试、人工 Review、职责分离 | 固定判定规则，独立计算影响范围，防止 self-review 和自改验证器 | 精确 revision 上的适用义务与结果 |
| Merge / Release | 变更管理、分支保护、制品和供应链控制 | 验证凭证绑定 head，new push 自动使旧批准失效 | merge decision、artifact digest、SBOM、签名 |
| Deploy | 配置管理、PKI、凭据、灰度、回滚 | workload identity、短时 secret、实例与业务语义回读 | source-artifact-environment 对应、运行身份、rollback ref |
| Maintain / Learn | 监控、审计、轮换、响应、复盘与改进 | 撤销 Agent grant，清理远程动作，隔离未经复现的“经验” | 停止确认、证书/租约撤销、独立复现与纠错记录 |

这里有两条边界不能被自动化吞掉。

第一，**机器执行规则，人承担权威。** 机器可以判断“缺少签名”“scope 越界”“测试没跑”，却不能擅自接受业务风险。风险接受、重大例外、生产授权和不可逆动作仍要由明确的人类角色负责。

第二，**自动化强度要与风险和基础设施匹配。** 个人项目可以从精确版本、独立 worktree、结果状态和可复现命令开始；团队再增加集中 CI、短时身份、制品仓库和证据存储；只有高风险生产动作才需要受保护 runner、策略引擎、HSM/KMS、远程证明和更严格的双人控制。缺少基础设施，就缩小 Agent 权限，而不是用 Prompt 假装控制已经存在。

# 0x05 什么才算完成

**一项 Agent 参与的变更，只有在与风险和主张匹配的条件满足时，才可以称为完成：**

- 任务、身份、范围、风险、验收、依赖和停止条件已经由有权主体准入；
- Agent 的实际动作没有越过 grant，凭据没有进入不该进入的上下文和日志；
- actual diff、影响范围和验证义务被独立计算，结果没有隐藏 `NOT_RUN`、`ERROR`、`UNKNOWN` 或 `CONFLICT`；
- Review、验证凭证、合并决策和发布制品绑定同一个精确版本；
- 部署主张有制品来源、真实运行身份、业务语义检查和回滚证据；
- 例外、残余风险、交接和临时路径退役都有明确 owner；
- 任务结束时，授权、短时证书、secret lease、子进程和远程动作已经到期、撤销或被明确接管。

**这里的“完成”是由事实派生出的结果，不是 Agent 写回的布尔值。**

把这些旧文章重新读完以后，我并没有得出一个需要重新命名的安全理论。得到的仍是过去那条朴素链路：

> **既有安全工程原则仍然成立**  
> **→ Agent 改变了执行主体、边界和速度**  
> **→ 治理、纵深防御、身份与密码基础设施需要重新落位**  
> **→ 决定副作用和状态晋级的控制必须能够被机器核验**  
> **→ 证据之外的结论仍然不能宣称**

AI Agent 可以很快。SDLC 的工作，是让这种速度始终落在有权威的任务、受限的身份、正确的对象和可以恢复的现实上。

# 参考

- [The AI-Native SDLC Playbook](https://claude.com/blog/the-ai-native-sdlc-playbook)
- [什么是安全架构](https://fz.cool/Security-Architecture-Review/)
- [我的企业安全观](https://fz.cool/MY-Enterprise-Cyber-Security-Architecture/)
- [现代化 SDLC 与架构评审](https://fz.cool/Modern-SDLC-and-Security-Architecture-Review/)
- [安全规范建设指北](https://fz.cool/Build-Your-Security-Specifications/)
- [从安全治理到安全验证](https://fz.cool/From-Security-Governance-To-Security-Verification/)
- [谈谈安全设计中的纵深防御](https://fz.cool/How-To-Defense-In-Depth/)
- [当我们在谈安全默认时我们在谈什么](https://fz.cool/Secuirty-By-Default/)
- [面向失败设计的安全运营](https://fz.cool/Security-Operation-Design-For-Failure/)
- [浅谈数据安全](https://fz.cool/Talk-about-data-security/)
- [浅谈加密基础设施](https://fz.cool/Applied-Cryptography-And-Crypto-Infrastructure/)
- [KMS/HSM 的一点收益](https://fz.cool/What-Hells-In-HSM/)
- [CA/RA 的一点收益](https://fz.cool/What-Hells-In-CA-And-RA/)
- [Hashicorp Vault Advanced Tutorial For Enterprise](https://fz.cool/Hashicorp_Vault_Advanced_Tutorial_For_Enterprise/)
- [多 Agent 协作时代的 Git 规范](https://fz.cool/Multi-Agent-Git-Workflow/)
- [NIST Secure Software Development Framework](https://csrc.nist.gov/pubs/sp/800/218/final)

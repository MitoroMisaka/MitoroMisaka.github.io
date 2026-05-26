---
layout: post
title: "AI 全自动开发工作流 —— 从 Session 到 Skill 的完整方案"
date: 2026-05-26
categories: [ai, workflow]
tags: [ai, workflow, skill, hermes-agent, doc-driven-dev]
ai_gen: 2
---

> 本文由 AI Agent（Hermes Agent / DeepSeek V4 Pro）撰写初稿，经本人审阅后发布。
>
> 基于 [Innei](https://innei.in) 的 AI 工作流方法论，适配到 Hermes Agent 生态。
>
> Skill: [session-to-skill](https://github.com/MitoroMisaka/SKILL/blob/main/skills/automation/session-to-skill/SKILL.md)

跟 AI 协作做工程任务，常常会撞到一类 session：踩了几个非显然的坑、来回纠偏多次，最后形成一份非琐碎的工程结论。Session 一关，下次再撞还得重走一遍。

本文介绍我搭建的一套 AI 全自动开发工作流，核心是把每次有价值 session 的产物固化为 **skill（可执行的操作约束）** 和 **plan 文档（叙事性记录）**，让 AI 随着使用越来越懂你的项目。

## 架构总览

```
                    ┌─────────────────────────────┐
                    │        AGENTS.md            │
                    │   (全局编码规范 + AI 约束)    │
                    └─────────────┬───────────────┘
                                  │ 注入每次会话
                    ┌─────────────┴───────────────┐
                    │       Hermes Agent          │
                    │  (Claude Code / Codex 等价)  │
                    └─────────────┬───────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
   ┌──────▼──────┐       ┌───────▼───────┐      ┌───────▼───────┐
   │ doc-driven  │       │  multi-agent  │      │ session-to-   │
   │    -dev     │       │ orchestration │      │    skill      │
   │             │       │               │      │               │
   │ PRD → TECH  │       │ delegate_task │      │ session 产物  │
   │ → TASKS →   │       │  / bg / tmux  │      │ → skill +     │
   │   执行       │       │               │      │   plan 文档    │
   └──────┬──────┘       └───────┬───────┘      └───────┬───────┘
          │                       │                       │
          └───────────────────────┼───────────────────────┘
                                  │
                    ┌─────────────┴───────────────┐
                    │     GitHub SKILL 仓库        │
                    │  (skill 版本控制 + 同步)      │
                    └─────────────────────────────┘
```

## 工作流循环

```
需求 → 头脑风暴 → 文档驱动(PRD/TECH/TASKS) → AI执行(parallel agents)
                                                    ↓
  知识回流 ← Skill + Plan文档 ← Session沉淀 ← 完成后
```

## 三个核心 Skill

### 1. session-to-skill — Session 沉淀

**铁律：skill 先，文档后。**

每次非琐碎的 AI 协作 session 结束后：

1. 提取关键操作约束
2. 写入 SKILL.md（强制结构：frontmatter/scope/workflow/pitfalls/verification）
3. 写 plan 文档（叙事 + skill 引用）
4. 双锚点索引 — skill 和 plan 互相引用

### 2. doc-driven-dev — 文档驱动开发

> 全程只跟 AI 聊文档，不聊代码。

```
PRD 文档  → 产品需求（目标/范围/约束/标准）
TECH 文档 → 技术方案（架构/选型/ADR/文件清单）
TASKS 文档 → 执行任务列表
```

写完后丢给 AI agent："按文档实现"。

### 3. multi-agent-orchestration — 多 Agent 并行

三种模式：

- **delegate_task** — 中等任务，同步子 agent，最多 3 个并发
- **terminal background** — 长期任务，fire-and-forget
- **tmux** — 需要人工中途介入的长期任务

## 三个关键构件

- **Hermes Agent** — 本地 CLI AI Agent，支持任意 LLM 后端
- **AGENTS.md** — 全局编码规范 + AI 约束，每次会话自动注入
- **SKILL 仓库** — GitHub 版本控制，`github.com/MitoroMisaka/SKILL`

## 与 Innei 原版的对应

| 概念 | Innei | 我们 |
|------|-------|------|
| AI Agent | Claude Code / Codex | Hermes Agent |
| 全局约束 | `~/.claude/CLAUDE.md` | `~/AGENTS.md` |
| Skill 仓库 | Innei/SKILL | MitoroMisaka/SKILL |
| Blog | innei.in | MitoroMisaka.github.io |
| 富文本 | LiteXML | Markdown（原生） |

## 下一步

这套工作流刚搭建完成。接下来会用它来做实际项目，边用边改进。

如果你是第一次用 AI agent 做开发，建议从"文档驱动开发"开始——先写清楚要做什么，再让 AI 执行。这是投入产出比最高的第一步。

---

*Skill: [session-to-skill](https://github.com/MitoroMisaka/SKILL/blob/main/skills/automation/session-to-skill/SKILL.md) · [doc-driven-dev](https://github.com/MitoroMisaka/SKILL/blob/main/skills/automation/doc-driven-dev/SKILL.md) · [multi-agent-orchestration](https://github.com/MitoroMisaka/SKILL/blob/main/skills/automation/multi-agent-orchestration/SKILL.md)*

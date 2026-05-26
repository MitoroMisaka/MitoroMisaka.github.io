# 写作指南

## 新建文章（Post）

1. 在 `src/content/posts/` 创建 `.mdx` 文件，例如 `my-new-post.mdx`
2. 文件名即 slug（去掉空格，用连字符分隔）

### Frontmatter

```yaml
---
title: "文章标题"
description: "简要描述，用于首页列表和 SEO"
date: 2026-05-26
updated: 2026-05-26   # 可选
category: "技术"       # 必须与已有分类一致，或新分类
tags:                  # 可选，用于标签页聚合
  - ai
  - workflow
draft: false           # draft: true 的文章不会发布
slug: "my-new-post"    # URL 路径，建议与文件名一致
---
```

### 编写内容

从 `## 标题` 开始。支持标准 Markdown：

- 标题 `##` / `###`
- 列表 `-` / `1.`
- 代码块 ` ``` ` （自动高亮 + 复制按钮）
- 引用 `>`
- 链接 `[text](url)`

不要在第一行重复文章标题——页面自动渲染。

---

## 新建碎念（Note）

1. 在 `src/content/notes/` 创建 `.mdx` 文件，例如 `thinking-about-agents.mdx`
2. 文件名即 slug

### Frontmatter

```yaml
---
title: "思考：AI Agent 的上下文管理"  # 可选，无标题时显示"无标题碎念"
description: "一些零散想法"           # 可选
date: 2026-05-26
updated: 2026-05-26                   # 可选
tags:                                 # 可选
  - ai
  - workflow
draft: false
slug: "thinking-about-agents"
pinned: false                         # 置顶到碎念列表顶部
mood: "🤔"                            # 可选，显示在详情页日期旁
---
```

### 编写内容

碎念不需要完整文章结构，可以是一段话、几个要点、一张截图说明。

无标题碎念：不填 `title` 字段，正文第一行不会重复显示。

### 碎念约定

- 碎念是短内容，建议控制在 500 字以内。
- 比正式文章更随意，但 `draft: true` 仍生效。
- 每条碎念都有独立详情页 `/notes/<slug>` 和 Reaction 按钮。
- 主 RSS `/rss.xml` 只输出正式文章；碎念不会混入。

---

## 新建时间线事件（Timeline）

1. 在 `src/content/timeline/` 创建 `.mdx` 文件

### Frontmatter

```yaml
---
title: "博客二期上线"
description: "Notes / Timeline / Projects 增强 / Reaction 全部完成"  # 可选
date: 2026-05-26
type: milestone         # post | note | project | milestone | life
url: ""                 # 可选，如 "/notes/phase2-start"
tags:                   # 可选
  - blog
draft: false
---
```

### 类型说明

| type | 说明 | 使用场景 |
|------|------|----------|
| `milestone` | 通用里程碑 | 站点上线、版本发布、大型重构 |
| `life` | 生活事件 | 不是项目/文章/碎念，但有纪念意义 |
| `post` | 文章 | 一般不需要手动创建，Timeline 自动聚合 |
| `note` | 碎念 | 同上 |
| `project` | 项目 | 同上 |

时间线页面自动聚合源内容（posts、notes、projects），手动 `timeline` events 用于补充无法归属的里程碑。

### 编写内容

正文可选，可以用一句话说明事件背景。

---

## 维护项目详情（Project）

现有项目内容在 `src/content/projects/`。

### Frontmatter

```yaml
---
name: "项目名称"
description: "简短描述，用于列表卡片"
repo: "https://github.com/..."     # 可选
demo: "https://..."                 # 可选
tags: ["AI", "tool"]               # 可选
featured: true                     # 首页精选展示
status: active                     # active | planned | archived
slug: "my-project"                 # URL 路径，不填则用文件名
date: 2026-05-26                   # 项目起始日期
updated: 2026-05-26                # 最后更新
stack: ["Swift", "SwiftUI"]        # 技术栈
role: "独立开发"                    # 角色
links:                             # 额外链接
  - label: "文档"
    href: "https://docs.example.com"
weight: 10                         # 排序权重，越大越前
---
```

### 编写内容

项目详情页支持完整 MDX 正文：项目背景、架构说明、截图、维护状态等。

---

## Newsletter 内容

站点的 Newsletter 通过 Buttondown 提供邮件订阅服务。

### 哪些内容会发送到 Newsletter

- 只有 `src/content/posts/` 中的正式文章会自动出现在 `/rss.xml` 中。
- RSS 可作为 Buttondown 的自动导入源（如用户后续配置了 auto-import），实现文章发布后自动推送。
- 碎念（notes）、时间线事件（timeline）、项目（projects）不会进入 RSS，因此也不会被 Newsletter 推送。

### 当前工作模式

Newsletter 当前为手动触发模式：

1. 文章发布到站点后，作者登录 Buttondown 后台手动撰写邮件并发送。
2. 如果未来配置了 Buttondown 的 RSS-to-email 功能，则文章发布后会自动触发推送。

### 订阅入口

- 站点 `/newsletter` 页面提供邮件订阅表单。
- 订阅 API：`POST /api/newsletter/subscribe`，传入 `{"email": "..."}`。
- 部署前需在 Cloudflare Pages 环境变量中配置 `BUTTONDOWN_API_KEY`。

---

## 本地预览

```bash
npm run dev
```

打开 http://localhost:4321 ，修改 markdown 后自动刷新。

## 发布

```bash
# 构建（含 Pagefind 索引）
npm run build

# 部署到 Cloudflare Pages
npm run deploy:cf
# 或
npx wrangler pages deploy dist --project-name mitoromisaka-blog

# 提交代码
git add -A
git commit -m "feat: new post <标题>"
git push
```

注意：Node 版本需要 >= 22.12。如果系统默认版本较低：

```bash
PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build
```

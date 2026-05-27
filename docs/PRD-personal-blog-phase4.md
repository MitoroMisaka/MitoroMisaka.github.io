# Product Requirements Document: 个人技术博客四期（深度内容组织、动态感与内容增强）

> 日期: 2026-05-26
> 三期基线: `docs/PRD-personal-blog-phase3.md`
> 技术方案: `docs/TECH-personal-blog-phase4.md`
> 执行计划: `docs/TASKS-personal-blog-phase4.md`
> 状态: 草案

## 目标

- 在已有内容基础设施（文章、碎念、时光、项目、Reaction、统计、RSS 订阅）之上，补全内容组织和发现能力。
- 新增"内容专题/系列文章"机制，让多篇关联文章有清晰的导航和聚合入口。
- 新增"知识库/Digital Garden"内容类型，让概念、术语、技术要点能以网状而非时间线形式组织。
- 增强首页动态感：写作热力图、站点活动流、阅读统计卡片。
- 增强文章内容展示：Mermaid 图表、代码块文件名与 diff 高亮、图片 lightbox。
- Notes 社交同步作为可选能力，提供手动或半自动分享到 X(Twitter) 的入口。
- 纯静态或轻动态方案优先，不引入后端服务或 CMS。
- 延续日系极简、高留白、内容优先的设计语言。

## 用户故事

- 作为站点作者，我想把同一主题的多篇文章组织为"系列"，以便读者按顺序阅读，发现相关内容。
- 作为站点作者，我想有一个知识库/概念卡片系统，以便记录和引用技术概念、工具对比和长期维护的要点。
- 作为读者，我能在系列文章之间用上一篇/下一篇导航，看到当前进度。
- 作为读者，我想在首页看到站点的写作活跃度和最近动态，以便判断站点是否还在活跃。
- 作为读者，我想在知识库中按分类浏览概念卡片，并通过双向链接发现关联条目。
- 作为读者，我想在文章中看到 Mermaid 流程图、代码块文件名和变更高亮，以便更清晰理解技术内容。
- 作为移动端用户，新产品模块在移动端应有良好的阅读和浏览体验。

## 功能范围

### Feature 1: 内容专题/系列文章

#### In Scope

- 在 posts schema 中新增可选字段 `series`（系列标识）和 `seriesOrder`（系列内序号）。
- 新增 `/series` 页面，列出所有系列及其简介、文章计数。
- 新增 `/series/[slug]` 详情页，展示系列标题、描述、按序排列的文章目录，带阅读进度指示。
- 系列内文章在文章页底部或侧边展示上一篇/下一篇导航。
- 系列文章在文章头部显示系列名和进度（如 "AI 工作流系列 · 第 2 篇 / 共 5 篇"）。
- 首页或文章列表页可标注某文章属于某个系列。
- 系列页面显示"已完成/总篇数"进度条。

#### Out of Scope

- 系列内文章的自动排序（手动指定 seriesOrder）。
- 付费系列、会员专属内容。
- 系列订阅或邮件系列通知。
- 系列封面图自动生成。

### Feature 2: 知识库/Digital Garden

#### In Scope

- 新增 `garden` content collection（文件驱动，MDX）。
- Garden 条目 schema：`title`、`description`、`category`（自由标签）、`tags`、`stage`（seedling/budding/evergreen）、`related`（手动关联的条目 slug 列表）、`date`、`updated`、`draft`。
- `/garden` 列表页：
  - 按 `category` 分组展示（如"AI 工作流"、"Swift/Apple"、"前端"、"工具"）。
  - 每个条目卡片显示标题、描述、成长阶段图标（🌱 seedling / 🌿 budding / 🌳 evergreen）、标签、更新日期。
  - 支持按 category / stage 筛选（纯静态或 React island）。
- `/garden/[slug]` 详情页：
  - 正文（MDX 渲染）。
  - 成长阶段徽标。
  - 标签与分类。
  - **前向链接**：渲染正文中 `[[]]` 双括号语法为链接到其他 garden 条目。如果目标存在，显示可点击链接；如果不存在，标记为"尚未创建"并降级展示。
  - **反向链接（backlinks）**：在详情页底部展示哪些 garden 条目链接到了当前条目。通过构建期静态分析所有 garden 条目正文中的 `[[]]` 引用关系计算。
  - 最后更新时间。
- 导航栏新增" Garden"入口（如果导航栏过长，可放在 footer 或作为二级入口）。

#### Out of Scope

- 全文 Wiki 语法解析（只支持 `[[slug]]`）。
- 引用关系可视化图谱（可在后续迭代添加）。
- 从文章/碎念到 Garden 的自动双向链接。
- Garden 条目的 Reaction 或评论。

### Feature 3: Notes 社交同步

#### In Scope

- 在 Note 详情页和碎念管理流中，提供"分享到 X"的可选入口。
- 两种模式：
  - **简易模式（推荐 MVP）**：一个"分享到 X"按钮，使用 `https://x.com/intent/tweet?text=...&url=...` 预填内容，用户手动点击后在新窗口发布。零后端、零 API key。
  - **半自动模式（可选）**：Cloudflare Pages Function 调用 X API v2 发推。需要 X API key 和用户配置环境变量。创建时默认不启用。
- 分享内容：Note 标题（或正文首行截断）+ 链接。

#### Out of Scope

- 全自动发推（需要长期维护的 cron/API key）。
- 从 X 拉取回复或互动数据回站点。
- 同步到 Mastodon 等其他平台。
- 文章自动分享。

### Feature 4: 首页增强

#### In Scope

- **站点动态/活动流**：首页新增"最近动态"模块，聚合最近更新的文章、碎念、项目状态变更和 Garden 条目创建。展示格式："发布了新文章「xxx」"、"更新了碎念「xxx」"、"开始做新项目「xxx」"、"新增 Garden「xxx」"。
- **写作热力图**：首页或数据页面新增 GitHub 风格的写作热力图（12 列 x 7 行），按日聚合文章/碎念/Garden 的创建日期，颜色深浅表示当日内容产出量。
  - 纯客户端 React island。
  - 数据来源：构建期生成静态 JSON（所有 posts/notes/garden 的 date 汇总），无需 KV。
  - 可选深色/浅色主题配色。
- **阅读统计卡片**：首页 Hero 区域增加"累计字数"和"持续天数"。
  - 字数统计：构建期计算所有 posts、notes、garden 条目的正文字数。
  - 持续天数：计算从第一篇内容到今天跨越的总天数。
  - 纯静态数据，编译期计算。

#### Out of Scope

- 热力图点击跳转到具体日期的内容。
- 热力图数据来源切换（按内容类型筛选）。
- 动态流自动刷新（纯静态，构建时生成）。
- 实时在线人数、页面浏览量等实时数据。

### Feature 5: 内容增强

#### In Scope

- **Mermaid 图表**：
  - 在 MDX 文章中渲染 Mermaid 图表块（语法 ` ```mermaid ... ``` `）。
  - 使用 `astro-expressive-code` 的 `@expressive-code/plugin-mermaid` 或手动集成 Mermaid 客户端渲染。
  - 支持流程图、时序图、类图等标准 Mermaid 图表类型。
- **代码块增强**：
  - 代码块文件名提示（在 fences 后面加 `:filename.py`）。
  - diff 高亮（在 fences 语言后加 `diff`，用 `+`/`-` 行高亮增删）。
  - 两者都通过 `astro-expressive-code` 的 `plugin-frames` 和 `diff` 语法原生支持，无需额外依赖。
- **图片 lightbox**：
  - 文章中 `<img>` 或 Markdown `![alt](url)` 图片点击后弹出 lightbox 查看大图。
  - React island，点击图片 → 全屏 overlay → 点击背景或 × 关闭。
  - 支持键盘 Escape 关闭。
  - 不引入中型图片库，自建轻量组件。

#### Out of Scope

- Mermaid 主题定制（使用 Mermaid 默认主题 + 站点 CSS 变量适配）。
- 代码块一键复制按钮（可在后续添加）。
- 图片画廊/轮播。
- 视频嵌入增强。

## 技术约束

- 延续现有技术栈：Astro v6、MDX、Content Collections、React islands、TailwindCSS v4、Cloudflare Pages。
- Base layout 的 `is:inline` Pagefind 初始化逻辑不变。
- Node 使用 Homebrew node@22。
- 新增 Content Collection 必须向后兼容现有内容。
- 不读取 `.env` 文件内容。
- 不提交任何 API key 或 token。
- 纯静态能力优先：图文内容、数据聚合、热力图数据在构建期生成，不需要 Cloudflare Functions。
- 只有 X 自动分享模式需要 Cloudflare Functions 和 OAuth 1.0a 签名，但 MVP 用 `intent/tweet` 方案完全规避。
- `[[]]` 双括号语法通过 Astro MDX 的 rehype 插件在编译期处理，不需要客户端 JS。
- Mermaid 图表通过客户端渲染（动态 import `mermaid`），不增加构建体积。

## 质量标准

- 质量门禁:
  - `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run check` 0 errors。
  - `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build` 通过。
  - Pagefind 索引覆盖所有新页面。

- 性能:
  - 首页 Lighthouse Performance >= 85（新版块不影响核心指标）。
  - Mermaid 图表延迟加载，不影响首屏正文。
  - Lightbox 组件轻量，不增加 >10KB 的 JS。
  - Garden backlinks 在构建期计算，不增加运行时开销。
  - 热力图 JSON 静态生成，< 5KB。

- 可维护性:
  - `[[]]` 解析逻辑封装为独立 rehype 插件或 `src/lib/` 工具函数。
  - 系列文章导航封装为组件，在文章详情页复用。
  - Garden、Series 的页面结构遵循与 Notes/Projects 一致的 Astro 页面模式。
  - 所有新增内容类型的写作规范写入 `docs/WRITING.md`。

- 兼容性:
  - 现有 posts/notes/projects/timeline 不受影响。
  - 新增 schema 字段必须有默认值或 optional。
  - 移动端导航栏新入口不应溢出（已有 8 项）。

## UI/UX 参考

- 系列文章导航：参考 `innei.in` 的系列文章底部导航，或 `overreacted.io` 的 prev/next 导航。
- 知识库/Digital Garden：参考 `maggieappleton.com/garden` 和 `notes.joshuatz.com` 的概念卡片 + 双向链接。
- 写作热力图：参考 GitHub 贡献图，使用 `<rect>` 或 div grid。
- Mermaid 图表：参考 `swyx.io` 和 `innei.in` 文章中 Mermaid 图表的展示风格——简洁、无边框、与文章体系统一。
- Lightbox：参考 Medium 的图片点击放大体验。
- 全程保持日系极简、低饱和、高留白，新增模块应像现有系统自然长出的功能，不引入新的设计语言。

## 四期完成标准

- `/series` 和 `/series/[slug]` 可访问，至少有 1 个系列示例（将现有文章归入）。
- `/garden` 和 `/garden/[slug]` 可访问，至少有 2-3 个 Garden 条目示例，双向链接可工作。
- Note 详情页有"分享到 X"按钮（`intent/tweet` 模式）。
- 首页有写作热力图、最近动态流和阅读统计卡片。
- Mermaid 图表可渲染，代码块有文件名和 diff 高亮，图片 lightbox 可工作。
- `npm run build` 通过，Pagefind 索引覆盖所有新页面。
- 写作指南更新，覆盖 series、garden 内容创建规范。
- README/AGENTS/DEPLOYMENT 更新。

## 五期候选方向

- Garden 关系可视化图谱。
- 全站内容搜索支持 Garden 和 Series 过滤。
- 系列文章 Zine/PDF 导出。
- 社交同步半自动模式（通过 Functions 调用 X API）。
- Newsletter 自动生成（从最近文章自动写摘要）。

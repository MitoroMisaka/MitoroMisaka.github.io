# Product Requirements Document: 个人技术博客二期（内容表达与轻互动）

> 日期: 2026-05-26
> 状态: 草案
> 一期基线: `docs/PRD-personal-blog.md`
> 技术方案: `docs/TECH-personal-blog-phase2.md`
> 执行计划: `docs/TASKS-personal-blog-phase2.md`

## 目标

- 在一期“可发布、可阅读、可搜索、可评论”的博客基础上，补齐更个人化的内容表达入口：Notes / 碎念、Timeline / 时光页、Projects 增强。
- 增加低成本轻互动能力，让读者无需登录也能对文章或碎念表达 reaction，但不引入完整账号系统。
- 保持 Astro 静态优先架构，不为了二期功能过早演进成重动态应用。
- 继续靠近 `https://innei.in` 的日系极简、高留白、内容优先气质，但保持站点自己的个人辨识度。
- 让二期完成后，站点从“博客首页 + 文章系统”升级为“个人技术主页 + 写作/碎念/项目/时间线的内容网络”。

## 用户故事

- 作为站点作者，我想发布比正式文章更短、更随手的碎念，以便记录 AI 工作流、开发过程、小发现和临时想法。
- 作为站点作者，我想有一个时间线页面，以便把文章、项目、碎念和重要里程碑串成长期轨迹。
- 作为站点作者，我想增强 Projects 页面，以便每个项目有更清晰的状态、技术栈、链接和详情说明。
- 作为读者，我想在首页看到最近碎念和项目动态，以便不用只通过长文了解作者最近在做什么。
- 作为读者，我想通过 reaction 快速表达“有用 / 喜欢 / 期待 / 围观”，而不一定要登录 GitHub 写评论。
- 作为移动端用户，我想在碎念流、时间线和项目页中顺畅浏览，不被复杂交互打断。

## 功能范围

### In Scope

- Notes / 碎念系统
  - 新增文件驱动的 `notes` content collection。
  - 新增 `/notes` 碎念列表页。
  - 新增 `/notes/[slug]` 碎念详情页，便于分享和被搜索索引。
  - 首页增加 Latest Notes 轻量预览模块。
  - Notes 支持 draft、tags、date、updated、pinned 等基础元数据。

- Timeline / 时光页
  - 新增 `/timeline` 页面。
  - 时间线聚合文章、碎念、项目和手动里程碑。
  - 新增可选的 `timeline` content collection，用于记录不适合放入文章/碎念/项目的事件。
  - 时间线按年份/月分组，重点强调长期积累而不是社交动态流。

- Projects 页增强
  - 保留现有 `projects` content collection，并向后兼容现有项目内容。
  - 新增项目详情页 `/projects/[slug]`。
  - Projects 列表支持按状态、技术栈/标签筛选或分组展示。
  - 项目详情展示背景、技术栈、链接、状态、维护说明和关键截图/摘要（如果有）。

- 轻量 Reaction
  - 在文章页和碎念详情页提供若干固定 reaction：喜欢、有用、期待、围观。
  - 使用 Cloudflare Pages Functions + KV 实现简单聚合计数。
  - 不做账号系统，不收集个人身份信息。
  - 前端使用 localStorage 做本机重复点击提示和轻量冷却，不承诺强防刷。

- 搜索、RSS、SEO 集成
  - Pagefind 搜索应覆盖 Notes、Projects 详情和 Timeline 关键内容。
  - 可新增 Notes RSS，或在主 RSS 中保留正式文章、另行提供 Notes feed。
  - 新页面具备 title、description、canonical、OpenGraph 基础信息。

- 文档与写作流程
  - 更新 `docs/WRITING.md`，补充 Notes、Timeline、Projects 的内容创建规范。
  - 更新项目 README 或 AGENTS 中必要的二期说明。
  - 每个实现 Phase 结束必须 commit。

### Out of Scope（这个版本不做）

- Newsletter 邮件订阅与投递系统。
- 自建登录、用户系统、评论系统或管理后台。
- 完整站点访问统计仪表盘。
- 复杂 reaction 风控、IP 指纹、设备识别或反作弊系统。
- 多语言系统。
- 图片瀑布流、相册、重动画、3D 或大规模视觉实验。
- 自定义域名绑定。若用户单独提供域名和 DNS 策略，可作为独立运维任务处理，不混入二期主体开发。
- 将 Notes 同步到外部社交平台（X/Twitter、Mastodon 等）。

## 技术约束

- 必须延续一期技术栈：Astro v6、MDX、Content Collections、React islands、TailwindCSS v4、Pagefind、Cloudflare Pages。
- 内容仍然以文件驱动为主，Notes / Timeline / Projects 不引入 CMS。
- 动态能力只允许收敛到 Cloudflare Pages Functions + KV，避免引入独立后端服务。
- Reaction API 不得读取或写入任何 `.env` 内容；Cloudflare 绑定通过 `wrangler.jsonc` 和 Cloudflare 项目配置处理。
- 新增 collection schema 必须向后兼容现有 `posts` 和 `projects` 内容，不能让现有构建失败。
- React islands 只用于必要交互：reaction、筛选、轻量 UI 状态。静态内容渲染仍优先使用 Astro。
- 不复制 `innei.in` 的具体代码或视觉资产，只参考信息层级、高留白、轻动效和内容组织方式。
- 部署仍以 Cloudflare Pages Direct Upload / Wrangler deploy 为准；不切换到 Git-connected build，除非用户明确要求。

## 质量标准

- 性能基准:
  - 首页、文章页、Notes 列表页、Timeline 页桌面端 Lighthouse Performance 目标 >= 90。
  - 新增页面首屏必须静态渲染，reaction 加载失败不得阻塞正文阅读。
  - 反应组件 JS 尺寸保持轻量，不引入大型状态管理库。

- 可维护性要求:
  - 新增内容模型必须集中定义在 `src/content.config.ts`。
  - 内容读取、排序、聚合逻辑放在 `src/lib/`，页面只负责组装展示。
  - Notes、Timeline、Projects 的卡片组件可复用，避免每个页面重复写相同结构。
  - 新增 Cloudflare Functions 保持小文件、少依赖、输入校验明确。

- 内容维护要求:
  - 新建 Note 的流程不超过：复制模板 / 新建 MDX / 填 frontmatter / 写正文。
  - Timeline 事件可以由内容自动生成，也可以手动补充特殊事件。
  - Projects 详情页不强制每个项目都有长文，允许短项目卡片和长项目详情共存。

- 测试与验收标准:
  - `npm run check` 通过。
  - `npm run build` 通过，并成功生成 Pagefind 索引。
  - 手动验收：首页、Notes、Note 详情、Timeline、Projects 列表、Project 详情、文章 reaction。
  - 如果实现 Reaction，需验证本地 Pages Functions 或线上 API 的 GET / POST 都可用。
  - 线上部署后检查至少一个 reaction 能成功计数，API 异常时 UI 有降级提示。

## UI/UX 参考

- 参考项目 A: `https://innei.in`
  - 参考重点：个人动态感、碎念/短内容呈现、时间线氛围、细腻但克制的交互。
  - 不参考：直接复制布局细节、图标、动画、配色或特定组件实现。

- 站点现有一期风格
  - 继续使用低饱和色、圆角卡片、细线分隔、高留白。
  - 保持 Light / Dark / System 三档主题一致性。
  - 新页面应看起来像一期系统自然长出的模块，而不是另一个主题。

- 设计倾向:
  - Notes：像安静的短句流，不做社交信息流的强刺激。
  - Timeline：按年份沉淀，强调“长期轨迹”而不是“即时动态”。
  - Projects：更像作品档案，不做营销落地页。
  - Reaction：轻、克制、可忽略，不抢文章正文和评论区的注意力。

## 版本边界

### 二期完成标准

- `/notes`、`/notes/[slug]`、`/timeline`、`/projects/[slug]` 均可访问并有示例内容。
- 首页能展示最近 Notes，不破坏一期 Hero / Recent Writing / Featured Projects 的节奏。
- Projects 页面比一期更适合长期维护，能展示项目状态和详情。
- 文章页和碎念详情页具备可用的 reaction，或在 Cloudflare KV 未配置时有明确降级和文档说明。
- 写作指南覆盖 posts / notes / timeline / projects 四类内容。
- 构建、部署、线上核心路径验收通过。

### 三期候选方向

- Newsletter。
- 自定义域名与更完整部署策略。
- 站点访问统计或公开数据面板。
- Notes 与外部社交平台同步。
- 更复杂的内容专题、系列文章和知识库视图。

## 成功标准

- 读者进入首页后，不仅能看到文章，也能快速感知作者近期动态、项目进展和长期轨迹。
- 作者能稳定发布短内容，不必把所有想法都包装成完整长文。
- Projects 页面能承载公开作品集功能，而不是只作为两个链接卡片。
- Reaction 提供轻互动，但站点仍保持静态优先、阅读优先、低维护成本。

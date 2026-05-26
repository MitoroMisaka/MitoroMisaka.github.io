# 技术方案: 个人技术博客网站（MitoroMisaka.github.io 重建）

> 基于 PRD: `/Users/liaojinchuan/.hermes/plans/personal-tech-blog/PRD-personal-blog.md`
> 日期: 2026-05-26

## 架构概览

```text
GitHub Repo (source)
└── Astro Project
    ├── src/
    │   ├── content/
    │   │   ├── config.ts
    │   │   ├── posts/
    │   │   ├── pages/
    │   │   └── projects/
    │   ├── components/
    │   │   ├── site/
    │   │   ├── post/
    │   │   └── ui/
    │   ├── layouts/
    │   ├── lib/
    │   ├── styles/
    │   └── pages/
    │       ├── index.astro
    │       ├── about.astro
    │       ├── projects.astro
    │       ├── tags/[tag].astro
    │       ├── categories/[category].astro
    │       └── posts/[...slug].astro
    ├── public/
    ├── astro.config.mjs
    ├── tailwind.config.mjs
    └── package.json

Content Authoring
MD/MDX -> Astro Content Collections -> Layout / Components -> Static HTML
                                                 ├─ TOC / reading progress (client islands)
                                                 ├─ code copy / theme toggle (client islands)
                                                 ├─ Pagefind index (postbuild)
                                                 └─ Giscus comments (article page)

Build & Deploy
GitHub repo push -> Cloudflare Pages build -> static site publish
```

## 技术选型

| 层 | 选择 | 理由 |
|----|------|------|
| 框架 | Astro | 静态优先、内容站友好、性能好，且能用 islands 精准引入交互能力。 |
| 内容系统 | MDX + Astro Content Collections | 既保留 Markdown 写作效率，又支持技术文章内嵌组件与结构化校验。 |
| 交互层 | React islands | 只在主题切换、目录高亮、阅读进度、评论挂载等局部场景启用客户端逻辑。 |
| 样式 | TailwindCSS | 快速搭建高留白、轻卡片化设计系统，统一主题和响应式实现。 |
| 语法高亮 | Expressive Code（或 Shiki 集成） | 技术文章体验优先，支持更好的代码块可读性与扩展能力。 |
| 搜索 | Pagefind | 纯静态全文搜索，适合 Cloudflare Pages，无需后端。 |
| 评论 | Giscus | 与 GitHub Discussions 集成，面向技术读者，免自建后端。 |
| 路由 | Astro 文件路由 | 内容站结构天然匹配，维护成本低。 |
| 状态管理 | 本地状态 + 少量 DOM/React state | 第一版无复杂全局状态，避免引入额外状态库。 |
| 部署 | Cloudflare Pages | 静态部署简单，未来可自然扩展到 Workers / D1 / KV。 |
| Feed / SEO | Astro 原生能力 + 自定义元数据封装 | RSS、sitemap、canonical、OG 信息易于静态生成。 |

## 数据与内容模型

### 文章（posts）

建议 frontmatter 字段：

- `title`
- `description`
- `date`
- `updated`
- `category`
- `tags`
- `draft`
- `slug`
- `cover`（可选）
- `hero`（可选）
- `toc`（可选，默认开启）

### 独立页面（pages）

用于 About、Links、Now 或其他非文章内容页。

### 项目（projects）

用于首页与 Projects 页面展示，字段可包含：

- `name`
- `description`
- `repo`
- `demo`
- `tags`
- `featured`
- `status`

## 关键页面与模块设计

### 1. 首页 `index.astro`

模块建议：

- Hero：站点名、作者定位、一句话介绍、社交链接
- Recent Writing：最近文章列表，突出时间、分类、标题
- Featured Projects：精选项目
- Notes Preview（可选轻量版）：少量短句，不做完整系统
- Footer：关于、项目、RSS、GitHub、主题切换等入口

### 2. 文章详情页 `posts/[...slug].astro`

模块建议：

- 标题区：标题、日期、分类、标签、阅读时间
- 文章摘要 / description
- 正文内容渲染
- 右侧目录（桌面端）
- 阅读进度
- 代码块复制
- 上一篇 / 下一篇导航（可选）
- Giscus 评论区

### 3. 列表与归档页

- 文章列表页
- 标签页
- 分类页
- Projects 页
- About 页
- 搜索入口页（或导航弹出入口）

## API 设计（第一期）

第一期不自建后端 API，以静态生成为主。

| 能力 | 方案 | 说明 |
|------|------|------|
| 评论 | Giscus | 基于 GitHub Discussions，无需站点后端。 |
| 搜索 | Pagefind | 构建时生成索引，前端静态查询。 |
| RSS | Astro 构建生成 | 无需运行时 API。 |
| sitemap | Astro 构建生成 | 无需运行时 API。 |

### 未来预留（第二期及以后）

若需要动态能力，统一收敛到 Cloudflare Workers 路径，例如：

| 方法 | 路径 | 用途 |
|------|------|------|
| GET | /api/notes | 获取碎念列表 |
| POST | /api/reactions | 提交点赞 / reaction |
| GET | /api/stats | 获取文章或站点统计 |

## 关键决策记录（ADR）

### ADR-001: 选择 Astro，而不是继续使用 Jekyll 或直接采用 Next.js

**背景**: 项目目标是个人技术博客，核心是内容发布与阅读体验，而不是先搭动态应用平台。

**选项**:
- A: 继续 Jekyll —— 迁移成本低，但现代组件化、交互增强、MDX 和长期可维护性较弱。
- B: Next.js —— 动态能力强，但对第一期内容站来说偏重，复杂度和维护成本更高。
- C: Astro —— 更适合内容站，静态输出能力强，且能按需引入 React islands。

**决定**: 选 C，因为它最符合“静态优先 + 局部交互增强”的产品目标。

### ADR-002: 采用 Cloudflare Pages 作为部署目标

**背景**: 用户明确选择 Cloudflare Pages，希望后续具备向 Workers / D1 / KV 扩展的空间。

**选项**:
- A: GitHub Pages —— 与 `github.io` 域名天然契合，但动态扩展能力较弱。
- B: Vercel —— 更偏 Next.js 体验，对当前 Astro 站点不是最自然选择。
- C: Cloudflare Pages —— 静态部署方便，后续边缘能力扩展顺滑。

**决定**: 选 C，但需接受一个前提：`*.github.io` 域名不能直接由 Cloudflare Pages 托管。若没有自定义域名，第一期默认使用 Cloudflare Pages 域名，或后续单独调整部署策略。

### ADR-003: 内容采用文件驱动的 MDX，而不是 CMS

**背景**: 作者以 Git 为中心工作，希望文章和项目内容可版本化、可本地编辑、可随代码一起演进。

**选项**:
- A: Headless CMS —— 编辑体验友好，但引入额外平台与维护负担。
- B: 文件驱动 MDX —— 与 Git 工作流天然一致，技术文章扩展性更强。

**决定**: 选 B，因为第一期更重视可控性、可维护性与技术写作能力。

### ADR-004: 评论系统采用 Giscus，而不是自建评论能力

**背景**: 第一期开站的重点不是搭评论基础设施，而是尽快建立可用内容站。

**选项**:
- A: 自建评论系统 —— 自由度高，但需要登录、存储、审核、运维。
- B: Giscus —— 技术站点兼容性高，接入成本低。

**决定**: 选 B，以最小代价满足评论互动需求。

### ADR-005: 完全重建站点，而不是在旧 Jekyll 基础上做兼容性改造

**背景**: 旧站的技术基础过于轻量，不适合作为新体验的长期承载层。

**选项**:
- A: 旧站渐进改造 —— 风险看似低，但历史包袱会持续拖累架构。
- B: 全新重建 —— 前期工作量更集中，但架构更干净、边界更清晰。

**决定**: 选 B，以一次性架构升级换取后续开发和维护效率。

## 风险与注意事项

- 域名策略尚需最终确认：若没有可接入 Cloudflare 的自定义域名，线上地址将不是 `mitoromisaka.github.io`。
- 旧文迁移时需重点检查：slug、frontmatter、引用资源路径、代码块语法和日期字段。
- 若首页模块过多，易偏离“高留白、内容优先”的目标；需严格控制首屏信息密度。
- 若 React islands 过多，可能损害 Astro 的静态优势；应尽量将交互局限在必要模块。

## 文件变更清单（预估）

| 文件 | 操作 | 说明 |
|------|------|------|
| package.json | 新增/重写 | 定义 Astro 项目依赖与脚本 |
| astro.config.mjs | 新增 | Astro、MDX、Cloudflare Pages 等配置 |
| tailwind.config.mjs | 新增 | 主题、颜色、排版与设计 token |
| tsconfig.json | 新增/修改 | TypeScript 配置 |
| src/content/config.ts | 新增 | Content Collections schema |
| src/content/posts/*.mdx | 新增/迁移 | 技术文章内容 |
| src/content/pages/about.mdx | 新增 | About 页面内容 |
| src/content/projects/*.mdx | 新增 | 项目内容源 |
| src/layouts/base-layout.astro | 新增 | 全站基础布局 |
| src/layouts/post-layout.astro | 新增 | 文章布局 |
| src/components/site/site-header.astro | 新增 | 顶部导航 |
| src/components/site/site-footer.astro | 新增 | 页脚 |
| src/components/home/hero-section.astro | 新增 | 首页 Hero |
| src/components/home/recent-writing.astro | 新增 | 最近文章列表 |
| src/components/home/featured-projects.astro | 新增 | 首页项目模块 |
| src/components/post/table-of-contents.tsx | 新增 | 文章目录高亮 |
| src/components/post/reading-progress.tsx | 新增 | 阅读进度 |
| src/components/post/code-copy-button.tsx | 新增 | 代码复制交互 |
| src/components/ui/theme-toggle.tsx | 新增 | 主题切换 |
| src/components/post/giscus-comments.tsx | 新增 | 评论区挂载 |
| src/lib/site-config.ts | 新增 | 站点元信息配置 |
| src/lib/content-helpers.ts | 新增 | 内容读取、排序、标签聚合 |
| src/pages/index.astro | 新增 | 首页 |
| src/pages/about.astro | 新增 | About 页面 |
| src/pages/projects.astro | 新增 | Projects 页面 |
| src/pages/tags/[tag].astro | 新增 | 标签页 |
| src/pages/categories/[category].astro | 新增 | 分类页 |
| src/pages/posts/[...slug].astro | 新增 | 文章详情页 |
| src/pages/rss.xml.js | 新增 | RSS 输出 |
| public/ | 新增 | favicon、静态资源 |
| README.md | 重写 | 项目简介、开发与部署说明 |
| AGENTS.md | 新增/更新 | 项目级 AI 协作规范 |

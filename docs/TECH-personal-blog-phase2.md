# 技术方案: 个人技术博客二期（内容表达与轻互动）

> 基于 PRD: `docs/PRD-personal-blog-phase2.md`
> 执行计划: `docs/TASKS-personal-blog-phase2.md`
> 日期: 2026-05-26
> 状态: 草案

## 架构概览

```text
Astro static site
├── Content Collections
│   ├── posts/       -> 正式技术文章（一期已有）
│   ├── notes/       -> 二期新增：短内容 / 碎念
│   ├── projects/    -> 一期已有，二期增强详情字段
│   └── timeline/    -> 二期新增：手动里程碑事件
│
├── Static routes
│   ├── /                 -> 首页，增加 Latest Notes
│   ├── /posts/[slug]     -> 文章详情，增加 Reaction
│   ├── /notes            -> Notes 列表
│   ├── /notes/[slug]     -> Note 详情，增加 Reaction
│   ├── /timeline         -> 聚合时间线
│   ├── /projects         -> 项目列表增强
│   └── /projects/[slug]  -> 项目详情
│
├── React islands
│   ├── theme-toggle.tsx      -> 一期已有
│   ├── pagefind-search.tsx   -> 一期已有
│   ├── reaction-bar.tsx      -> 二期新增：轻互动
│   └── project-filter.tsx    -> 二期可选：项目筛选
│
└── Cloudflare Pages Functions
    └── /api/reactions        -> GET 读取计数 / POST 增量计数
        └── Cloudflare KV     -> reaction:v1:{target}:{emoji} = count
```

## 技术选型

| 层 | 选择 | 理由 |
|----|------|------|
| 框架 | Astro v6 | 延续一期架构，静态优先，适合内容扩展。 |
| 内容系统 | Astro Content Collections + MDX | Notes / Timeline / Projects 都可文件化、可校验、可 Git 管理。 |
| 页面渲染 | Astro 静态路由 | Notes、Timeline、Projects 详情都应在构建期生成。 |
| 交互 | React islands | 仅在 reaction、筛选等局部功能使用客户端 JS。 |
| 样式 | TailwindCSS v4 + 全局 CSS variables | 延续一期设计系统，保证 Light / Dark / System 一致。 |
| 搜索 | Pagefind | 构建时索引新增页面，无需后端。 |
| 动态计数 | Cloudflare Pages Functions + KV | 与现有部署平台一致，避免独立服务。 |
| 数据校验 | Zod schema in `src/content.config.ts` | 构建期发现内容字段错误。 |
| 状态管理 | React local state + localStorage | Reaction / filter 足够轻量，不引入全局状态库。 |

## 内容模型设计

### Notes collection

新增目录：`src/content/notes/`

建议 schema：

```ts
const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    slug: z.string(),
    pinned: z.boolean().default(false),
    mood: z.string().optional(),
  }),
});
```

设计说明：

- `title` 可选，支持无标题短句。
- `description` 可选，用于 SEO 和列表摘要；为空时可从正文裁剪。
- `slug` 仍显式声明，保持与 posts 一致。
- `pinned` 用于 Notes 列表置顶少量关键碎念。
- `mood` 只是展示字段，不参与核心逻辑。

### Timeline collection

新增目录：`src/content/timeline/`

建议 schema：

```ts
const timeline = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/timeline' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    type: z.enum(['post', 'note', 'project', 'milestone', 'life']).default('milestone'),
    url: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});
```

设计说明：

- 自动事件：从 posts / notes / projects 生成基础 timeline entries。
- 手动事件：使用 `timeline` collection 记录无法归属到单个内容的里程碑。
- 页面展示层统一消费 `TimelineEntry`，不直接依赖某个 collection。

### Projects collection 增强

现有目录：`src/content/projects/`

必须保持现有内容可构建。新增字段应尽量 optional：

```ts
const projectLink = z.object({
  label: z.string(),
  href: z.string().url(),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    status: z.enum(['active', 'archived', 'planned']).default('active'),

    // Phase 2 optional fields
    slug: z.string().optional(),
    date: z.coerce.date().optional(),
    updated: z.coerce.date().optional(),
    stack: z.array(z.string()).default([]),
    role: z.string().optional(),
    links: z.array(projectLink).default([]),
    weight: z.number().default(0),
  }),
});
```

设计说明：

- `slug` 可选；如果缺失，路由 fallback 到 collection entry id。
- `stack` 与 `tags` 分离：`stack` 表示技术栈，`tags` 表示主题标签。
- `weight` 用于手动排序，不影响日期逻辑。
- 旧字段 `repo` / `demo` 保留，避免迁移成本。

## 统一类型与辅助函数

新增或扩展 `src/lib/content-helpers.ts`：

```ts
type TimelineEntry = {
  id: string;
  title: string;
  description?: string;
  date: Date;
  type: 'post' | 'note' | 'project' | 'milestone' | 'life';
  url?: string;
  tags: string[];
};
```

建议新增函数：

- `getPublishedNotes()`
- `getRecentNotes(limit = 5)`
- `getPinnedNotes()`
- `getAllTimelineEntries()`
- `groupTimelineEntriesByYear(entries)`
- `getPublishedProjects()`
- `getProjectSlug(project)`
- `getProjectBySlug(slug)`
- `getAllProjectTags()` 或 `getAllProjectStacks()`

实现原则：

- 排序逻辑统一放在 helper 中。
- 页面不要重复写过滤 draft、排序、slug fallback。
- Timeline 聚合函数负责把不同 collection 映射到统一 `TimelineEntry`。

## 页面与组件设计

### `/notes`

文件：`src/pages/notes/index.astro`

职责：

- 展示置顶 Notes。
- 按时间倒序展示所有公开 Notes。
- 显示日期、标签、正文摘要、可选 mood。
- 每条 Note 链接到 `/notes/[slug]`。
- 空状态：没有 Notes 时显示安静提示，不报错。

组件建议：

- `src/components/notes/note-card.astro`
- `src/components/notes/notes-list.astro`

### `/notes/[slug]`

文件：`src/pages/notes/[slug].astro`

职责：

- 静态生成每条 Note 详情。
- 展示完整 MDX 内容、日期、标签。
- 底部展示 ReactionBar。
- 可选展示返回 Notes 列表的链接。

组件建议：

- `src/layouts/note-layout.astro`
- 也可复用 `base-layout.astro`，避免过早创建复杂 layout。

### `/timeline`

文件：`src/pages/timeline.astro`

职责：

- 调用 `getAllTimelineEntries()`。
- 按年份分组，年份内倒序。
- 区分不同类型：post / note / project / milestone / life。
- 每条 entry 有 title、date、description、tags、可选 url。

组件建议：

- `src/components/timeline/timeline-list.astro`
- `src/components/timeline/timeline-item.astro`

### `/projects` 增强

文件：`src/pages/projects.astro`

职责：

- 展示项目列表，并支持按 status / stack 分组或筛选。
- 每个项目卡片链接到 `/projects/[slug]`。
- 保持轻量，不做重动画。

可选 React island：

- `src/components/projects/project-filter.tsx`
- 若筛选逻辑可以静态分组解决，就不引入 island。

### `/projects/[slug]`

文件：`src/pages/projects/[slug].astro`

职责：

- 静态生成项目详情。
- 展示项目名称、描述、状态、技术栈、链接、正文 MDX。
- 支持 repo / demo / links 多入口。
- 可选展示相关 posts / notes（若标签匹配）。

### 首页集成

文件：`src/pages/index.astro`

新增模块：

- `src/components/home/latest-notes.astro`

职责：

- 展示最近 3 条 Notes。
- 不抢 Recent Writing 主优先级。
- 移动端保持短列表，避免首屏过长。

## Reaction API 设计

### 路径

优先采用单 API 路径：

| 方法 | 路径 | 用途 |
|------|------|------|
| GET | `/api/reactions?target=<target>` | 获取某个目标的 reaction 计数 |
| POST | `/api/reactions` | 对某个目标的某个 emoji 计数 +1 |

Cloudflare Pages Functions 文件建议：

```text
functions/
└── api/
    └── reactions.ts
```

### 请求与响应

GET query：

```text
/api/reactions?target=post:ai-full-auto-workflow
```

GET response：

```json
{
  "target": "post:ai-full-auto-workflow",
  "counts": {
    "heart": 3,
    "clap": 1,
    "rocket": 2,
    "eyes": 0
  }
}
```

POST request：

```json
{
  "target": "post:ai-full-auto-workflow",
  "emoji": "heart"
}
```

POST response：

```json
{
  "target": "post:ai-full-auto-workflow",
  "emoji": "heart",
  "count": 4
}
```

### KV 设计

KV namespace binding：`REACTIONS`

Key：

```text
reaction:v1:{target}:{emoji}
```

示例：

```text
reaction:v1:post:ai-full-auto-workflow:heart = "4"
reaction:v1:note:phase2-start:rocket = "2"
```

### 输入校验

- `target` 只允许：`post:<slug>`、`note:<slug>`、`project:<slug>`。
- `emoji` 只允许固定枚举：`heart`、`clap`、`rocket`、`eyes`。
- target 最大长度限制，避免异常 key。
- POST body 必须是 JSON。
- API 错误返回明确状态码：400 / 405 / 500。

### 前端降级

组件：`src/components/ui/reaction-bar.tsx`

- 初次加载失败：显示静态按钮和“暂时不可用”提示。
- POST 失败：不更新本地计数，显示短暂错误状态。
- localStorage 记录用户本机已点过的 `{target}:{emoji}`，用于禁用重复点击或显示已点状态。
- localStorage 只是体验层，不作为真实反作弊。

## SEO / RSS / 搜索

- Notes 详情页必须有独立 title / description。
- Timeline 页面 meta description 应说明这是长期轨迹页。
- Projects 详情页使用项目 description 作为 SEO description。
- Pagefind 默认索引静态页面；若某些 UI 文本不应被索引，可用 Pagefind 排除属性。
- RSS 策略：
  - 主 RSS `/rss.xml` 继续只包含正式文章。
  - 新增 `/notes.xml` 或 `/notes/rss.xml` 可选，专门输出 Notes。
  - 不把所有碎念混入主 RSS，避免订阅者被短内容打扰。

## 关键决策记录（ADR）

### ADR-001: Notes 继续采用文件驱动，而不是外部微博客服务

**背景**: 二期需要短内容表达，但站点仍以 Git + MDX 工作流为核心。

**选项**:
- A: 外部微博客服务嵌入 —— 发布方便，但数据不在仓库内，长期可控性弱。
- B: 文件驱动 Notes —— 与现有写作流程一致，可版本化，可被搜索和 RSS 使用。

**决定**: 选 B。二期先保证内容可控，未来如需同步外部平台再单独做。

### ADR-002: Timeline 采用“自动聚合 + 手动事件”的混合方案

**背景**: 纯手动 timeline 容易重复维护；纯自动 timeline 又无法表达特殊里程碑。

**选项**:
- A: 只手动维护 Timeline —— 灵活但维护成本高。
- B: 只从 posts / notes / projects 自动生成 —— 低维护但表达不完整。
- C: 自动生成基础事件，同时允许 `timeline` collection 手动补充。

**决定**: 选 C。聚合逻辑复杂度可控，长期维护体验最好。

### ADR-003: Reaction 使用 Cloudflare KV，而不是 D1 或 Giscus

**背景**: Reaction 只需要按 target + emoji 做计数，不需要关系查询。

**选项**:
- A: Giscus 评论反应 —— 依赖 GitHub 登录，不适合轻量点击。
- B: D1 —— 数据建模更强，但对简单计数偏重。
- C: KV —— 简单键值计数，和 Pages Functions 集成成本低。

**决定**: 选 C。接受其最终一致性和轻防刷限制，换取低维护成本。

### ADR-004: Newsletter 延后到三期

**背景**: Newsletter 涉及邮件服务、订阅管理、退订、合规和密钥配置。

**决定**: 二期不做 Newsletter，避免把内容体验扩展和外部服务运维混在一起。

### ADR-005: 自定义域名作为独立运维任务

**背景**: 自定义域名需要用户提供域名、DNS 托管状态和 Cloudflare 配置决策。

**决定**: 不纳入二期主体。若用户明确给出域名，再单独写运维 checklist 并执行。

## 文件变更清单（预估）

| 文件 | 操作 | 说明 |
|------|------|------|
| `docs/PRD-personal-blog-phase2.md` | 新增 | 二期产品需求 |
| `docs/TECH-personal-blog-phase2.md` | 新增 | 二期技术方案 |
| `docs/TASKS-personal-blog-phase2.md` | 新增 | 二期执行任务 |
| `docs/WRITING.md` | 修改 | 增加 Notes / Timeline / Projects 写作规范 |
| `src/content.config.ts` | 修改 | 新增 notes / timeline collections，增强 projects schema |
| `src/content/notes/*.mdx` | 新增 | 示例 Notes 内容 |
| `src/content/timeline/*.mdx` | 新增 | 示例里程碑事件 |
| `src/content/projects/*.mdx` | 修改 | 补充 slug / stack / links / date 等可选字段 |
| `src/lib/content-helpers.ts` | 修改 | 新增 notes / timeline / projects helper |
| `src/lib/reaction-config.ts` | 新增 | reaction emoji 枚举、target 工具函数 |
| `src/components/home/latest-notes.astro` | 新增 | 首页 Notes 预览 |
| `src/components/notes/note-card.astro` | 新增 | Note 卡片 |
| `src/components/notes/notes-list.astro` | 新增 | Notes 列表 |
| `src/components/timeline/timeline-list.astro` | 新增 | Timeline 列表 |
| `src/components/timeline/timeline-item.astro` | 新增 | Timeline 单项 |
| `src/components/projects/project-card.astro` | 新增/重构 | 项目卡片复用组件 |
| `src/components/projects/project-filter.tsx` | 可选新增 | 项目筛选 React island |
| `src/components/ui/reaction-bar.tsx` | 新增 | Reaction 前端组件 |
| `src/pages/index.astro` | 修改 | 接入 Latest Notes |
| `src/pages/notes/index.astro` | 新增 | Notes 列表页 |
| `src/pages/notes/[slug].astro` | 新增 | Note 详情页 |
| `src/pages/timeline.astro` | 新增 | Timeline 页面 |
| `src/pages/projects.astro` | 修改 | Projects 列表增强 |
| `src/pages/projects/[slug].astro` | 新增 | Project 详情页 |
| `src/pages/posts/[slug].astro` | 修改 | 文章页接入 ReactionBar |
| `src/pages/notes.xml.ts` | 可选新增 | Notes RSS |
| `functions/api/reactions.ts` | 新增 | Cloudflare Pages Function |
| `wrangler.jsonc` | 修改 | KV binding：`REACTIONS` |
| `package.json` | 修改 | 如需新增本地 Pages Functions 开发脚本 |
| `README.md` | 修改 | 更新二期功能说明 |
| `AGENTS.md` | 修改 | 更新项目结构和验收约束 |

## 风险与注意事项

- Cloudflare KV binding 需要 Cloudflare 项目侧配置；如果执行环境未登录或无权限，应把 Reaction 阶段标记为 blocked，不要假装完成。
- KV increment 不是强事务，简单计数可接受；若未来需要严格计数再迁移到 D1。
- Notes 内容过多会稀释正式文章权重：首页只展示少量最近 Notes。
- Timeline 聚合时要避免重复事件：同一个项目发布既可能来自 project，也可能来自手动 milestone，需在 helper 中去重或在内容规范中约束。
- 新增 schema 时不要把 optional 字段误设为 required，避免现有内容构建失败。
- Reaction API 不应记录 IP、UA 等个人信息，避免隐私和合规复杂度。

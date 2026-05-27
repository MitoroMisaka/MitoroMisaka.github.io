# 技术方案: 个人技术博客四期（深度内容组织、动态感与内容增强）

> 基于 PRD: `docs/PRD-personal-blog-phase4.md`
> 执行计划: `docs/TASKS-personal-blog-phase4.md`
> 日期: 2026-05-26
> 状态: 草案

## 架构概览

```text
Astro v6 static-first site (18 pages → 预计 25+ pages)
│
├── Feature 1: 内容专题/系列文章
│   ├── src/content.config.ts             -> posts schema 新增 series/seriesOrder
│   ├── src/lib/content-helpers.ts        -> getSeriesList(), getPostsInSeries()
│   ├── src/pages/series.astro            -> /series 列表
│   ├── src/pages/series/[slug].astro     -> /series/[slug] 详情
│   ├── src/components/series/series-nav.astro -> 系列内上一篇/下一篇
│   └── src/components/series/series-indicator.astro -> 文章头部系列进度条
│
├── Feature 2: 知识库/Digital Garden
│   ├── src/content.config.ts             -> 新增 garden collection
│   ├── src/content/garden/               -> MDX 文件
│   ├── src/lib/garden.ts                 -> 解析 [[]] 引用、计算 backlinks
│   ├── src/pages/garden.astro            -> /garden 列表（按 category 分组）
│   ├── src/pages/garden/[slug].astro     -> /garden/[slug] 详情 + backlinks
│   └── src/components/garden/garden-card.astro
│
├── Feature 3: Notes 社交同步
│   ├── src/components/notes/share-button.tsx -> Intent Tweet 按钮（React island）
│   └── src/pages/notes/[slug].astro      -> 接入 share button
│
├── Feature 4: 首页增强
│   ├── src/lib/activity-feed.ts          -> 聚合最近动态（构建期生成）
│   ├── src/lib/writing-heatmap.ts        -> 热力图 JSON 数据计算
│   ├── src/components/home/activity-feed.astro
│   ├── src/components/home/writing-heatmap.tsx -> React island 热力图渲染
│   ├── src/pages/index.astro             -> 接入热力图 + 动态流 + 阅读统计
│   └── src/lib/site-stats.ts             -> 总字数、持续天数
│
└── Feature 5: 内容增强
    ├── mermaid/                          -> 客户端渲染（动态 import）
    ├── src/components/ui/mermaid.astro   -> Mermaid 图表组件
    ├── 代码块文件名/diff 高亮            -> astro-expressive-code 原生支持
    └── src/components/ui/lightbox.tsx    -> 图片 lightbox React island
```

## 技术选型

| 层 | 选择 | 理由 |
|----|------|------|
| 框架 | Astro v6 + MDX | 延续现有架构，Series/Garden 用 Content Collections 文件化管理。 |
| 内容系统 | Astro Content Collections + MDX | Garden 的 schema 与 posts/notes 同模式，零学习成本。 |
| Wiki 链接 `[[]]` | 自定义 rehype 插件 | 编译期 AST 处理，生成 `<a>` 标签。无运行时成本。 |
| Backlinks 计算 | `astro:content` getCollection + 正则 | 构建期全量扫描 Garden 条目正文，计算反向引用映射。纯静态无 KV。 |
| Mermaid 图表 | 客户端动态 import `mermaid` | 不增加首屏体积，Astro island `client:idle` 延迟加载。 |
| 代码块文件名/diff | astro-expressive-code 原生 | 已安装 0.42.0，`plugin-frames` + `diff` 语法无需额外配置。 |
| 图片 lightbox | 自建 React island + CSS | 避免引入中型库（<100 行代码）。 |
| X(Twitter) 分享 | `intent/tweet` URL | MVP 零后端、零 API key。半自动模式（X API）作为可选后续。 |
| 热力图渲染 | React island + static JSON | 数据在构建期生成到 `public/heatmap.json`，客户端读取渲染。 |
| 字数/天数统计 | 构建期 Astro 静态计算 | `src/lib/site-stats.ts` 遍历所有 collection 入口统计字数。 |

## 内容模型设计

### Posts schema 增强

在现有 `posts` collection schema 追加 optional 字段：

```ts
series: z.string().optional(),       // 系列标识 slug，如 "ai-workflow-series"
seriesOrder: z.number().optional(),  // 系列内序号，1-indexed
```

系列标识自由命名（建议 `kebab-case`）。属于同一 `series` 的多篇文章按 `seriesOrder` 排序展示。系列名称和描述在 `/series` 页面配置中定义（建议一个简单的 `src/lib/series-config.ts` 映射，而非引入新 collection）。

### Garden collection (新增)

新增目录：`src/content/garden/`

```ts
const garden = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/garden' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    stage: z.enum(['seedling', 'budding', 'evergreen']).default('seedling'),
    related: z.array(z.string()).default([]),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});
```

- `stage`: 🌱 seedling（初始想法）→ 🌿 budding（生长中）→ 🌳 evergreen（成熟稳定）。用 emoji + 中文标签展示。
- `related`: 手动指定关联条目 slug（如 `["swift-concurrency", "appkit-vs-swiftui"]`），在详情页以链接列表展示。
- `slug`: 不使用显式 slug 字段，文件名的 stem 作为 slug（与 `getStaticPaths` 对应）。
- 正文中的 `[[slug]]` 双括号由 rehype 插件处理为链接，与 `related` 互补。

### `[[]]` 解析方案

在 MDX 的 markdown 处理流水线中注册一个自定义 rehype 插件：

1. 遍历 AST 中所有 `text` 节点。
2. 正则匹配 `\[\[([a-zA-Z0-9-_.]+)\]\]`。
3. 对于每个匹配，将文本节点拆分为 `[before]` → `<a href="/garden/${slug}">` → `[after]`。
4. 如果 `allGardenSlugs` 中不存在该 slug，链接添加 `.pending` class（灰色、虚线下划线）。

构建期依赖：需要在构建时提供一个 `Set<string>` 包含所有 garden 条目的 slug。通过 `getCollection('garden')` 预先获取。

### Backlinks 计算

`src/lib/garden.ts`:

```ts
export async function computeBacklinks(): Promise<Map<string, string[]>> {
  const entries = await getCollection('garden', ({ data }) => !data.draft);
  const slugs = new Set(entries.map(e => e.id));

  // For each entry, scan its body for [[links]]
  // Accumulate: targetSlug -> [sourceSlug1, sourceSlug2, ...]
  const backlinks = new Map<string, string[]>();

  for (const entry of entries) {
    const links = extractWikiLinks(entry.body); // regex
    for (const target of links) {
      if (slugs.has(target)) {
        const existing = backlinks.get(target) || [];
        existing.push(entry.id);
        backlinks.set(target, existing);
      }
    }
  }
  return backlinks;
}
```

在 `garden/[slug].astro` 的 `getStaticPaths` 中调用 `computeBacklinks()` 一次，按 slug 分配到各自页面。

## Feature 设计细节

### Feature 1: 系列文章

**`/series` 列表页**:
- 调用 `getSeriesList()`，从 `posts` 中按 `series` 字段分组。
- 每组显示系列名（从 `src/lib/series-config.ts` 获取中文名和描述）、文章计数（含 draft 过滤）、最近更新日期。
- 每个卡片链接到 `/series/${seriesSlug}`。

**`/series/[slug]` 详情页**:
- 列出该系列所有已发布文章，按 `seriesOrder` 排序。
- 每篇文章卡片显示标题、发布日期、摘要、标签。
- 顶部显示进度："3 篇已完成"。
- 如果文章 `seriesOrder` 未设置，排在最后。

**文章页内系列导航**:
- 文章头部（标题上方或标题下方）显示系列名 + "第 N 篇 / 共 M 篇"。
- 文章底部（正文后、Reaction 前）显示上一篇/下一篇链接。
- 以上均为 Astro 组件，纯静态。

### Feature 2: 知识库/Garden

**Garden 详情页 (`/garden/[slug]`)**:
- Astro 页面，`getStaticPaths` 枚举所有已发布条目。
- 页面布局：标题 → 成长阶段徽标 → 分类 + 标签 → 正文 → 关联条目列表 → backlinks。
- 正文通过 MDX `Content` 组件渲染，`[[]]` 已由 rehype 插件转为链接。
- Backlinks 从预计算的映射中获取，显示为"哪些页面引用了本文"。

**Garden 列表页 (`/garden`)**:
- 按 `category` 分组（如 "AI 工作流"、"Swift/Apple"）。
- 每个条目卡片显示 title、description、stage emoji、tags、updated date。
- 纯 Astro 静态分组，不做 React 筛选。

**Garden 导航入口**:
- 导航栏已 8 项（首页/文章/碎念/时光/项目/关于/订阅/数据）→ 9 项不算溢出。
- 在"数据"之后加 `{ label: ' Garden', href: '/garden' }`。

### Feature 3: Notes 社交同步

**`src/components/notes/share-button.tsx`**（React island）:
```tsx
const shareText = `${title} ${window.location.href}`;
const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
```
一个带 X logo 的按钮，点击 `window.open(tweetUrl, '_blank')`。
放在 Note 详情页底部、Reaction 之前。

### Feature 4: 首页增强

**写作热力图**:
- 数据文件 `src/pages/heatmap.json.ts`（Astro endpoint 或构建脚本生成到 `public/heatmap.json`）。
- 数据结构：`{ date: "2026-01-15", count: 2 }[]`，覆盖从第一篇内容到今天的所有日期。
- 数据来源：`getCollection('posts')` + `getCollection('notes')` + `getCollection('garden')` 的 `date` 字段。
- `writing-heatmap.tsx` React island 读取 `public/heatmap.json`，用 div grid 渲染。
- 配色：参考 GitHub 热力图，4 级颜色：无（`var(--bg)`）、1-2（`var(--brand)` 浅）、3-5（中等）、5+（深）。
- 默认展示最近 12 个月。

**最近动态流**:
- 数据文件 `src/lib/activity-feed.ts`，构建时生成 `ActivityItem[]`。
- `ActivityItem = { type: 'post' | 'note' | 'project' | 'garden', title: string, url: string, date: Date, action: 'created' | 'updated' }`。
- 按 `date` 倒序取前 10 条，去重同一天。
- `src/components/home/activity-feed.astro` 渲染，显示图标 + 文案 + 日期。
- 示例："📝 发布了新文章「xxx」"、"💭 更新了碎念「xxx」"、"🚀 新增项目「xxx」"、"🌱 新增 Garden「xxx」"。

**阅读统计卡片**:
- `src/lib/site-stats.ts` 两个导出：
  - `getTotalWordCount()`：读取所有 posts/notes/garden 的 `body` 字段，统计非空白中文字符 + 英文单词数。
  - `getTotalDays()`：从第一篇内容日期到今天的天数。
- 首页 Hero 区域新增一行展示：`1 篇 · 3,200 字 · 1 天`（替换现有"1 篇 · 0 万字 · 0 天"的假数据）。

### Feature 5: 内容增强

**Mermaid 图表**:
- `src/components/ui/mermaid.astro`：
  - 接受 `code` prop（Mermaid 源码字符串）。
  - 使用 `<script type="module" is:inline>` 动态 import `mermaid` 并在客户端渲染。
  - 或使用 `@expressive-code/plugin-mermaid`（若 astro-expressive-code 0.42 支持）。
- MDX 文章中无需特殊语法，直接在 markdown 中用 ` ```mermaid ... ``` `，通过 `astro-expressive-code` 的 `shiki` 处理。如果不支持，使用 `<Mermaid code={"graph TD..."} />` 组件方式。
- 最简方案：`mermaid` npm 包 + `<pre class="mermaid">` → 客户端 `mermaid.run()` 渲染。React island `client:idle`。

**代码块文件名 + diff**:
- `astro-expressive-code` 的 `frames` 插件支持在 `code` fence 的 meta 中写 `title="filename.py"`。
- diff 语法：` ```diff ` 或 ` ```ts diff ` → 行首 `+`/`-` 自动高亮。
- 配置在 `astro.config.mjs` 的 expressiveCode 选项中，无需额外代码。

**图片 lightbox**:
- `src/components/ui/lightbox.tsx` React island，`client:idle`。
- 监听 `main` 区域内所有 `<img>` 点击，将 `src` 传给全局 overlay 状态。
- Overlay：全屏黑色半透明背景 + 居中图片 + 右上角 × 按钮。
- 点击背景或 × 关闭。Escape 键关闭。
- CSS 动画：淡入淡出。

## 关键决策记录（ADR）

### ADR-001: Garden `[[]]` 解析在编译期而非客户端

**背景**: Digial Garden 常用 `[[]]` 语法做双向链接，Obsidian、Foam 等工具广泛使用。

**选项**:
- A: 客户端 JS 扫描 DOM 替换 `[[xxx]]` → 简单但闪屏、SEO 差。
- B: rehype 插件在 MDX 编译期处理 AST → 复杂但零运行时成本、SEO 友好。

**决定**: 选 B。写一个轻量 `rehype-wiki-links` 插件，约 50 行代码。

### ADR-002: Garden entry slug 基于文件名而非显式字段

**背景**: Garden 条目不需要 URL 定制化，用文件名作为 slug 足够。

**决定**: `garden/[slug].astro` 的 `getStaticPaths` 用 `entry.id`（文件名 stem）作为 slug。不需要 `slug` 字段。如果未来需要自定义 slug，可以加一个 optional 字段。

### ADR-003: Mermaid 图表客户端渲染

**背景**: Mermaid 在构建期渲染（SSR）是可能的，但 Vite SSR 环境下 mermaid 的 DOM 依赖会出问题。

**决定**: 客户端渲染。`<pre class="mermaid">` 元素 → `client:idle` React island 调用 `mermaid.run()`。首屏布局不跳跃（`pre.mermaid` 有固定高度占位）。

### ADR-004: 热力图数据静态 JSON vs Cloudflare KV

**背景**: 热力图需要按日聚合历史数据。两个路径：静态 JSON（构建期生成）或 API（实时查询 KV）。

**决定**: 静态 JSON。数据源（posts/notes/garden）都是文件驱动的，没有实时写入需求。静态 JSON 约 5KB，零延迟，不耗用 KV 读取额度。

### ADR-005: X 分享 MVP 用 intent/tweet，不做 API 集成

**背景**: 需要"分享到 X"的入口。API v2 需要 OAuth 1.0a 签名、API key 和长期 token。

**决定**: 使用 `intent/tweet` URL。零依赖、零配置、零成本。用户手动点击确认发布，符合"半自动"理念。如果以后需要全自动，可以加一个 Cloudflare Function 调度。

## 文件变更清单（预估）

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/content.config.ts` | 修改 | posts schema 追加 series/seriesOrder，新增 garden collection |
| `src/content/garden/*.mdx` | 新增 | 2-3 个示例条目 |
| `src/lib/series-config.ts` | 新增 | 系列名称/描述映射 |
| `src/lib/content-helpers.ts` | 修改 | getSeriesList, getPostsInSeries, validateSeriesConfig |
| `src/lib/garden.ts` | 新增 | computeBacklinks, getGardenSlugs |
| `src/pages/series.astro` | 新增 | /series 列表 |
| `src/pages/series/[slug].astro` | 新增 | /series/[slug] 详情 |
| `src/pages/garden.astro` | 新增 | /garden 列表（按 category 分组） |
| `src/pages/garden/[slug].astro` | 新增 | /garden/[slug] 详情 |
| `src/pages/heatmap.json.ts` | 新增 | 热力图 JSON endpoint |
| `src/components/series/series-nav.astro` | 新增 | 上一篇/下一篇导航 |
| `src/components/series/series-indicator.astro` | 新增 | 文章头部系列进度 |
| `src/components/garden/garden-card.astro` | 新增 | Garden 条目卡片 |
| `src/components/notes/share-button.tsx` | 新增 | Intent Tweet 按钮 |
| `src/components/home/activity-feed.astro` | 新增 | 首页动态流 |
| `src/components/home/writing-heatmap.tsx` | 新增 | 热力图 React island |
| `src/components/ui/lightbox.tsx` | 新增 | 图片 lightbox |
| `src/lib/activity-feed.ts` | 新增 | 动态流数据聚合 |
| `src/lib/site-stats.ts` | 新增 | 字数/天数统计 |
| `src/pages/index.astro` | 修改 | 接入热力图、动态流、阅读统计 |
| `src/pages/posts/[slug].astro` | 修改 | 接入系列导航 |
| `src/pages/notes/[slug].astro` | 修改 | 接入 share button |
| `src/lib/site-config.ts` | 修改 | 导航加 Garden 入口 |
| `docs/WRITING.md` | 修改 | 补充 series + garden 写作规范 |
| `README.md` | 修改 | 补充四期路由、技术栈 |
| `AGENTS.md` | 修改 | 补充 garden 目录、series 约束 |

总计: ~28 个文件，~12 个新增文件，~16 个修改文件。

## 验证策略

- 本地:
  - `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run check` 0 errors。
  - `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build` 通过（预计 20+ pages）。
  - Pagefind 索引覆盖 garden、series 页面。
- 线上:
  - `/series` 有至少 1 个系列。
  - `/series/xxx` 有文章列表和进度。
  - 文章详情有系列进度条和上一篇/下一篇导航。
  - `/garden` 有至少 2 个条目。
  - `/garden/xxx` 有正文、backlinks、`[[]]` 链接可点击。
  - Note 详情有"分享到 X"按钮。
  - 首页有热力图、动态流、正确的阅读统计。
  - Mermaid 图可渲染。
  - 代码块有 diff 高亮和文件名。
  - 图片可点击放大。

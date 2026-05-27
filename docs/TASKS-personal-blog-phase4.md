# 执行任务: 个人技术博客四期（深度内容组织、动态感与内容增强）

> 基于 PRD: `docs/PRD-personal-blog-phase4.md`
> 基于 TECH: `docs/TECH-personal-blog-phase4.md`
> 日期: 2026-05-26
> 状态: 文档阶段，尚未执行

## 执行总原则

- 每个 Phase 结束必须 `git add -A && git commit -m "..."`。
- 不要把未完成项标记为完成；blocked 就写 blocked，未做就保持 `[ ]`。
- 不读取 `.env` 文件内容。
- 不提交 API key、token。
- 大型重构时可以跳过 lint/format，先提交可回滚版本，再单独修。
- 所有新增 Content Collection schema 必须有默认值或 optional 字段。
- 新页面必须在 `npm run build` 输出中可见，Pagefind 索引覆盖。

## Phase 0: 文档准备

- [ ] 读取三期基线文档（PRD/TECH/TASKS phase3）和现有代码结构。
- [ ] 信息检查: `src/content.config.ts`、`package.json`、`astro.config.mjs`、`tailwind` 配置。
- [ ] 提交: `docs: add phase 4 PRD, TECH, TASKS`（本次三份文档的首次提交）

## Phase 1: 基础设施 — content schema + 导航

- [ ] `src/content.config.ts`：
  - [ ] posts schema 追加 `series: z.string().optional()` + `seriesOrder: z.number().optional()`。
  - [ ] 新增 garden collection（schema 见 TECH，loader 为 glob，base `./src/content/garden`）。
- [ ] 创建 `src/content/garden/` 目录。
- [ ] `src/lib/series-config.ts`：系列 slug → 名称/描述的映射表（初始含 1 个示例系列）。
- [ ] `src/lib/site-config.ts`：导航新增 `{ label: ' Garden', href: '/garden' }`。
- [ ] `npm run check` 通过，`npm run build` 包含 garden collection。
- [ ] 提交: `feat: add garden collection and series schema`

## Phase 2: Feature 1 — 内容专题/系列文章

- [ ] `src/lib/content-helpers.ts`：
  - [ ] `getSeriesList()`：从 posts 中按 `series` 分组返回 `Map<string, {posts, config}>`。
  - [ ] `getPostsInSeries(seriesSlug)`：返回该系列所有已发布文章，按 `seriesOrder` 排序。
  - [ ] `getSeriesNeighbors(slug, seriesSlug)`：返回系列中某篇文章的上一篇/下一篇。
- [ ] `src/pages/series.astro`：
  - [ ] 列出所有系列卡片（系列名、描述、文章计数、最近更新）。
  - [ ] 空态：若无系列文章，显示优雅空提示。
- [ ] `src/pages/series/[slug].astro`：
  - [ ] `getStaticPaths` 返回所有 series slug。
  - [ ] 展示系列标题、描述、文章列表（含日期），进度 "N 篇已完成"。
- [ ] `src/components/series/series-indicator.astro`：
  - [ ] 在文章头部渲染：系列名 + "第 N 篇 / 共 M 篇" 进度条。
- [ ] `src/components/series/series-nav.astro`：
  - [ ] 文章底部渲染：← 上一篇 | 下一篇 →，首篇隐藏 ←，末篇隐藏 →。
- [ ] `src/pages/posts/[slug].astro`：接入 series-indicator + series-nav（从 frontmatter 读取 series + seriesOrder）。
- [ ] 验证：为已存在的文章（如 `ai-full-auto-workflow`）加上 series 字段（示例），确认 `/series` 和文章详情展示正常。
- [ ] `npm run check && npm run build` 通过。
- [ ] 提交: `feat: add content series with prev/next navigation`

## Phase 3: Feature 2 — 知识库/Digital Garden

> 前向链接（`[[slug]]`）和 backlinks 是这个 Feature 的核心复杂度——务必先在独立分支中跑通一个简单 case，再扩展到所有条目。

### 3.1: Garden 页面与列表

- [ ] `src/pages/garden.astro`：
  - [ ] 按 `category` 分组展示所有非 draft garden 条目。
  - [ ] 每个条目卡片：title、description（截断）、🌱🌿🌳 stage emoji+label、tags、updated date。
  - [ ] 空态：若无条目，提示 "Garden 尚未播种 🌱"。
- [ ] `src/components/garden/garden-card.astro`：可复用卡片组件。
- [ ] `src/pages/garden/[slug].astro`：
  - [ ] `getStaticPaths` 枚举所有已发布条目。
  - [ ] 展示 title、stage badge、category + tags、正文（MDX `Content`）、`related` 链接列表。
  - [ ] 底部展示 backlinks（从预计算数据读取）。

### 3.2: `[[]]` Wiki 链接解析

- [ ] `src/lib/garden.ts`：
  - [ ] `getGardenSlugSet()` → `Set<string>`（所有已发布条目的 slug）。
  - [ ] `extractWikiLinks(body: string)` → `string[]`（正则提取 `[[slug]]`）。
  - [ ] `computeBacklinks()` → `Map<string, string[]>`（target slug → 引用它的 source slugs）。
- [ ] `src/lib/rehype-wiki-links.ts`（自定义 rehype plugin）：
  - [ ] 遍历 AST text 节点，正则匹配 `[[slug]]`。
  - [ ] 将匹配到的文本替换为 `<a href="/garden/${slug}">slug</a>`。
  - [ ] 如果 slug 不在 `getGardenSlugSet()` 中，添加 `.pending` class（灰字+虚线）。
- [ ] `astro.config.mjs`：在 MDX 的 rehypePlugins 中注册 `rehype-wiki-links`。
  - [ ] 注意：插件需要在构建时获取 garden slugs，使用 Astro 的 `getCollection`（只能在 `.astro` 或 content layer 中使用）可能有限制。**PITFALL**: rehype 插件运行在 unified 管道中，不能直接调用 `getCollection`。替代方案：在 `astro.config.mjs` 中通过文件系统手动扫描 `src/content/garden/` 目录获取 slug 列表，或使用 `import.meta.glob` (Vite)。或者更简单的：在 `garden/[slug].astro` 的 MDX render 步骤中 pass 一个 `gardenSlugs` prop 给组件，由 React/Astro 组件在渲染后处理。最优方案：用构建期 `getCollection('garden')` 计算 `slugSet`，传给 `rehype-wiki-links` 作为配置。Astro v6 支持在 `astro.config.mjs` 中 `import { getCollection } from 'astro:content'` 吗？大概率不支持——内容在 config 执行时尚不可用。**Fallback**: 使用 `import.meta.glob('/src/content/garden/*.mdx')` 在 `astro.config.mjs` 中静态获取文件名列表，构造 slugs。或者最简方案：rehype 插件不做存在校验，直接转成链接；不存在的 slug 在 `garden/[slug].astro` 中标记 pending（CSS 处理，但这样所有页面都会出现灰色链接）。选方案 A：用 `import.meta.glob` 在 config 层获取 slugs。

### 3.3: Backlinks 计算

- [ ] `src/pages/garden/[slug].astro`：
  - [ ] 在 `getStaticPaths` 中调用 `computeBacklinks()` 一次。
  - [ ] 将结果按 slug 分配到各自页面的 props。
  - [ ] 详情页底部渲染 backlinks 列表（"哪些页面引用了本文"）。

### 3.4: 示例内容

- [ ] 创建 2-3 个 garden 示例条目：
  - [ ] `src/content/garden/ai-multi-agent-patterns.mdx` — seedling，包含 `[[ai-full-auto-workflow]]` 式前向链接。
  - [ ] `src/content/garden/swift-concurrency-pitfalls.mdx` — budding。
  - [ ] `src/content/garden/astro-v6-cf-pages.mdx` — budding。
- [ ] 在至少一个条目的正文中使用 `[[another-garden-slug]]`，确保双向链接可工作。

### 3.5: 验证

- [ ] `/garden` 可访问，按 category 分组展示 2-3 个条目。
- [ ] `/garden/[slug]` 可访问，backlinks 正确显示。
- [ ] `[[slug]]` 链接在详情页正文中可点击。
- [ ] 不存在的 `[[slug]]` 显示为灰色 pending 样式。
- [ ] `npm run check && npm run build` 通过，Pagefind 索引覆盖 `/garden` 页面。
- [ ] 提交: `feat: add garden/knowledge-base with wiki links and backlinks`

## Phase 4: Feature 3 — Notes 社交同步（intent/tweet）

- [ ] `src/components/notes/share-button.tsx`（React island, `client:idle`）：
  - [ ] 一个带 🐦 图标的按钮，点击 `window.open(tweetUrl, '_blank')`。
  - [ ] tweet URL 格式：`https://x.com/intent/tweet?text=${encodeURIComponent(title + '\n' + url)}`。
- [ ] `src/pages/notes/[slug].astro`：在 Reaction 之前接入 `<ShareButton client:idle />`。
- [ ] 验证：Note 详情页有分享按钮，点击弹出 X intent 新窗口。
- [ ] `npm run check && npm run build` 通过。
- [ ] 提交: `feat: add share-to-x button on notes`

## Phase 5: Feature 4 — 首页增强

### 5.1: 阅读统计卡片

- [ ] `src/lib/site-stats.ts`：
  - [ ] `getTotalWordCount()` → number：遍历所有 posts/notes/garden 的 body 字段，用正则统计中文字符 + 英文单词数。
  - [ ] `getTotalDays()` → number：从最早 `date` 到今天的天数差（至少为 1）。
- [ ] `src/pages/index.astro`：Hero 区域替换假数据为真实统计（X 篇文章 · X 字 · X 天）。

### 5.2: 最近动态流

- [ ] `src/lib/activity-feed.ts`：
  - [ ] `ActivityItem` 类型：`{ type, title, url, date, action }`。
  - [ ] `getActivityFeed(limit: number)` → `ActivityItem[]`：
    - 从 posts/notes/projects/garden 分别读取。
    - 按 date 倒排序，取前 N 条。
    - 合并逻辑：同一日多条时合并展示。
- [ ] `src/components/home/activity-feed.astro`：
  - [ ] 渲染动态列表，每条显示 emoji + 文案（"📝 发布了「xxx」"/"💭 更新了「xxx」"等）+ 相对日期。
  - [ ] 纯 Astro 组件，无客户端 JS。
- [ ] `src/pages/index.astro`：在 Hero 下方插入 `<ActivityFeed />`。

### 5.3: 写作热力图

- [ ] `src/lib/writing-heatmap.ts`：
  - [ ] `getHeatmapData()` → `{ date: string, count: number }[]`。
  - [ ] 从 posts/notes/garden 的 `date` 字段聚合，不包括 draft。
  - [ ] 覆盖从第一篇到今天的所有日期（count = 0 的日期也包含，用于热力图空白格）。
  - [ ] 不生成静态文件，由 Astro endpoint 或 page 组件直接 import。
- [ ] `src/pages/heatmap.json.ts`（Astro endpoint）或直接在 `index.astro` 中调用 `getHeatmapData()`：
  - [ ] 如果 endpoint：GET `/heatmap.json` 返回 JSON。
  - [ ] 如果 inline：在 `index.astro` 中计算后以 prop 传给 React island。
  - [ ] 推荐：inline（减少一次 HTTP 请求，数据量小）。
- [ ] `src/components/home/writing-heatmap.tsx`（React island, `client:idle`）：
  - [ ] 接收 `{ data: { date: string, count: number }[] }` prop。
  - [ ] 渲染 12×7 或 N×7 div grid，每个 cell 根据 count 着色。
  - [ ] 4 级颜色：0 → `var(--color-bg-secondary)`，1-2 → `var(--color-brand-light)`，3-5 → `var(--color-brand)`，5+ → `var(--color-brand-heavy)`。
  - [ ] 默认显示最近 52 周（可配置）。
  - [ ] 移动端：7 列不变但缩小组件宽度，水平滚动。
- [ ] `src/pages/index.astro`：在 Hero 下方/动态流上方插入 `<WritingHeatmap data={data} client:idle />`。

### 5.4: 验证

- [ ] 首页有真实字数统计。
- [ ] 首页有站点动态流。
- [ ] 首页有热力图（即使只有 1-2 篇也有对应的格子着色）。
- [ ] `npm run check && npm run build` 通过。
- [ ] 提交: `feat: add reading stats, activity feed, and writing heatmap to homepage`

## Phase 6: Feature 5 — 内容增强

### 6.1: Mermaid 图表

- [ ] 安装依赖: `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm install mermaid`。
- [ ] `src/components/ui/mermaid.astro`：
  - [ ] 接收 `code` prop（Mermaid 源码）。
  - [ ] 渲染 `<pre class="mermaid">{code}</pre>`。
  - [ ] 包含 `<script is:inline>` 动态 import `mermaid` → `mermaid.run()`。
  - [ ] `client:idle` 或 `client:load` 确保首屏不阻塞。
- [ ] 在 `post-layout.astro` 的 MDX 渲染中测试。
  - [ ] **PITFALL**: MDX 中 ` ```mermaid ` 代码块默认由 astro-expressive-code 处理，会变成语法高亮的代码块，而非 mermaid 图。需要配置 express-code 跳过 `mermaid` 语言，或将 `mermaid` 语言块单独提取给客户端。
  - [ ] **方案**: 在 `astro.config.mjs` expressiveCode 配置中排除 `mermaid` language（即不注册 mermaid 的 shiki 语法高亮），使其在构建时保持为普通 `<pre><code class="language-mermaid">`，然后由客户端 `mermaid.run()` 接管。或使用 MDX component mapping：在 MDX 中写 ` ```mermaid ` 块时，通过 remark plugin 替换为 `<Mermaid code="..." />` 组件。
  - [ ] **推荐方案**: 使用 astro-expressive-code 配置中 `languages` exclude mermaid，让代码块输出原生 `<pre><code class="language-mermaid">`，然后 mermaid 客户端脚本找到这些元素并渲染。最简单且不与代码高亮冲突。
- [ ] 创建一篇示例文章的某段包含 Mermaid 图表，验证渲染。
- [ ] 验证：Mermaid 图在页面加载后正确渲染，深色/浅色模式适配。

### 6.2: 代码块文件名与 diff 高亮

- [ ] 检查 `astro.config.mjs` 的 `expressiveCode` 配置：
  - [ ] `frames` 插件已启用（支持 `title="xxx.py"` 语法）。
  - [ ] `styleOverrides` 确保 frames 样式与日系风格协调。
- [ ] 在现有文章的代码块上添加文件名示例：` ```ts title="config.ts" `。
- [ ] 验证 diff 高亮：` ```diff ` 或 ` ```ts diff `（行首 `+`/`-` 自动着色）。
  - [ ] **PITFALL**: `astro-expressive-code` 0.42 对 `diff` 语法有两种模式：
    - A: 语言标记为 `diff` → 整个文件视为 diff，`+`/`-` 行自动着色。
    - B: 语言标记为 `ts diff` → TypeScript 语法高亮 + diff 行标记。可能需要在 meta string 中加 `ins={2,3}` / `del={5}` 或类似语法。具体看 expressive-code 文档。
  - [ ] **PITFALL 确认**: 查看 `astro-expressive-code` 0.42 文档，确认 `diff` 的正确使用方式。如果 ` ```ts diff ` 不生效，方案 A（整个块用 `diff` 语言）是最低风险的 fallback。
- [ ] 更新 `docs/WRITING.md`：添加代码块文件名和 diff 高亮的写作示例。
- [ ] 验证：`npm run build` 后文章页代码块有文件名提示和 diff 高亮。

### 6.3: 图片 lightbox

- [ ] `src/components/ui/lightbox.tsx`（React island, `client:idle`）：
  - [ ] 状态：`{ open: boolean, src: string }`。
  - [ ] `useEffect` 在 `document` 上监听 `click` 事件，如果 target 是 `<img>`，读取 `src` 打开 lightbox。
  - [ ] Overlay: 全屏 `position: fixed`，黑色半透明背景，居中图片（max 90vw/90vh）。
  - [ ] 右上角 × 按钮 + 点击背景 = 关闭。
  - [ ] `useEffect` 监听 Escape 键关闭。
  - [ ] 动画：opacity transition + scale (0.95 → 1)。
- [ ] 在 `post-layout.astro` 和 `garden/[slug].astro` 中引入 `<Lightbox client:idle />`。
- [ ] 验证：点击文章图片 → lightbox 弹出 → Escape 或点击背景关闭。
- [ ] 验证：移动端图片 lightbox 可正常工作。

### 6.4: 验证

- [ ] Mermaid 图表示例可渲染。
- [ ] 代码块文件名显示在代码块顶部。
- [ ] Diff 行有绿色/红色背景高亮。
- [ ] 图片 lightbox 可用。
- [ ] `npm run check && npm run build` 通过。
- [ ] 提交: `feat: add mermaid, code block enhancements, and image lightbox`

## Phase 7: 文档更新与收尾

- [ ] `docs/WRITING.md`：
  - [ ] 新增 `series` 字段说明（如何创建系列，seriesOrder 用法）。
  - [ ] 新增 `garden` 内容创建指南（文件命名、frontmatter 字段、stage 含义、`[[]]` 语法、related 字段）。
  - [ ] 新增 Mermaid 图表用法（` ```mermaid ` 语法、支持的图表类型）。
  - [ ] 新增代码块文件名 (`title="xxx.py"`) 和 diff (` ```diff `) 用法。
  - [ ] 新增图片 lightbox（任何 markdown `![alt](url)` 图片自动支持）。
- [ ] `README.md`：
  - [ ] 新增四期路由：`/series`、`/series/[slug]`、`/garden`、`/garden/[slug]`。
  - [ ] 目录结构补充 `src/content/garden/`、`src/lib/garden.ts`、`src/lib/rehype-wiki-links.ts`、`src/lib/writing-heatmap.ts`、`src/lib/activity-feed.ts`、`src/lib/site-stats.ts`。
- [ ] `AGENTS.md`：
  - [ ] 补充 garden content collection 约束（文件名 = slug、stage 枚举、related 引用格式、`[[]]` 语法）。
  - [ ] 补充系列文章的 series/seriesOrder 约束。
  - [ ] 补充 Mermaid 图表不注册 shiki 语言、图片 lightbox 自动生效。
- [ ] `docs/DEPLOYMENT.md`：
  - [ ] 补充四期新增的 Cloudflare Pages 路由。
  - [ ] Mermaid 客户端渲染不依赖新增 Functions。
- [ ] 提交: `docs: update writing guide, README, AGENTS, DEPLOYMENT for phase 4`

## Phase 8: 部署与线上验收

- [ ] `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run check` 0 errors。
- [ ] `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build` 通过。
- [ ] Pagefind postbuild 索引包含所有新页面（`/series`、`/garden`、各详情页）。
- [ ] 部署: `PATH=/opt/homebrew/opt/node@22/bin:$PATH npx wrangler pages deploy dist --project-name mitoromisaka-blog`。
- [ ] 线上验收：
  - [ ] `/` 首页：热力图渲染、动态流展示、阅读统计准确。
  - [ ] `/series`：至少 1 个系列。
  - [ ] `/series/[slug]`：文章列表 + 进度。
  - [ ] 文章详情：系列名称 + "第 N 篇 / 共 M 篇" + 上一篇/下一篇导航（若属于系列）。
  - [ ] `/garden`：至少 2 个条目，按 category 分组，stage emoji 展示。
  - [ ] `/garden/[slug]`：正文 + `[[link]]` 可点击 + backlinks 展示。
  - [ ] `/notes/[slug]`：分享到 X 按钮存在，点击弹出 intent tweet。
  - [ ] 首页：热力图、动态流、字数统计全面可用。
  - [ ] 文章：代码块有文件名（若配置）、diff 高亮（若配置）、Mermaid 图渲染（若有）、图片 lightbox。
  - [ ] 移动端：所有新页面在新手机上浏览正常。
  - [ ] 搜索：Pagefind 搜索可命中 series/garden 页面内容。
- [ ] 如有问题，记录到 `docs/QA-personal-blog-phase4.md`，Phase 8 重新标 `[ ]` 待修复。
- [ ] 提交: `docs: complete phase 4 deployment and verification`

---

> 执行指令：按 Phase 顺序执行。每个 Phase 结束后 `git add -A && git commit`。大型重构时跳过 lint/format。Phase 3（Garden + `[[]]` + backlinks）是复杂度和风险最高的 Phase，建议用 delegate_task 单独执行或分多个小步骤手动执行。
>
> 预估工作量：Phase 1-2（2-3 commit），Phase 3（4-6 commit——backlinks 和 wiki links 可能迭代），Phase 4-5（2-3 commit），Phase 6（2-3 commit——Mermaid 可能有适配问题），Phase 7-8（2 commit）。

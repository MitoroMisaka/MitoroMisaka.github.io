# 执行任务: 个人技术博客网站（MitoroMisaka.github.io 重建）

> 基于 TECH: `docs/TECH-personal-blog.md`
> 日期: 2026-05-26
> 状态: Phase 0-8 完成，已上线

## Phase 0: 仓库与部署前置确认 ✅

- [x] 确认源码仓库：`MitoroMisaka/MitoroMisaka.github.io`
- [x] 确认 Cloudflare Pages 绑定方式：`*.pages.dev`（`mitoromisaka-blog.pages.dev`）
- [x] 旧站内容备份到 `~/.blog-legacy-backup`，仅迁移一篇核心文章
- [x] 在项目根目录准备 `docs/`，搬入 PRD/TECH/TASKS
- [x] 初始化项目级 `AGENTS.md`
- [x] 提交: `docs: add blog planning docs`

## Phase 1: 项目脚手架 ✅

- [x] `npm create astro@latest` → Astro v6 + TypeScript strict
- [x] `astro add react mdx sitemap tailwind` + 手动安装 `@astrojs/rss @giscus/react pagefind astro-expressive-code wrangler`
- [x] 配置 `astro.config.mjs`：site URL + integrations
- [x] TailwindCSS v4（`@tailwindcss/vite` + `@plugin "@tailwindcss/typography"`；无 tailwind.config.mjs）
- [x] 配置 `tsconfig.json`：astro/tsconfigs/strict
- [x] 配置 Cloudflare Pages 部署：`wrangler.jsonc` + `deploy:cf` 脚本
- [x] 创建基础目录结构 + `.nvmrc`（node 22）
- [x] 提交: `docs: add blog planning docs`

### 实际踩坑备忘

- 本地 node 版本过低（v18），需切换到 `node@22`：`PATH=/opt/homebrew/opt/node@22/bin:$PATH`
- Astro v6 `src/content/config.ts` → `src/content.config.ts`，`type: 'content'` → `loader: glob({...})`
- `glob` 从 `astro/loaders` 导入，不是 `astro:content`
- `astro-expressive-code` 必须在 `mdx()` 之前
- `rss.xml.js` 与 `rss.xml.ts` 路由冲突，删除 `.js` 版本

## Phase 2: 内容系统 ✅

- [x] Content Collections schema：`src/content.config.ts`（posts + projects）
- [x] 文章 frontmatter：title/description/date/updated/category/tags/draft/slug
- [x] 项目 frontmatter：name/description/repo/demo/tags/featured/status
- [x] 站点配置：`src/lib/site-config.ts`
- [x] 内容辅助函数：文章排序、标签聚合、分类聚合
- [x] 示例内容：1 篇 post + 2 个 project（Command Code Widget、SKILL repo）
- [x] 提交: `docs: add blog planning docs`

## Phase 3: 设计系统 ✅

- [x] 基础布局：`src/layouts/base-layout.astro`
- [x] 文章布局：`src/layouts/post-layout.astro`
- [x] 站点头部：`src/components/site/site-header.astro`
- [x] 站点页脚：`src/components/site/site-footer.astro`
- [x] 主题切换：`src/components/ui/theme-toggle.tsx`（React island，三档 Light/Dark/System）
- [x] CSS 变量设计 token（`--bg`/`--fg`/`--fg-muted`/`--fg-soft`/`--line`/`--line-strong`/`--card`/`--brand`）
- [x] 桌面端与移动端响应式
- [x] 提交: `feat: build global layout and theme system`

## Phase 4: 首页 ✅

- [x] 首页：`src/pages/index.astro`
- [x] Hero 模块：`src/components/home/hero-section.astro`
- [x] Recent Writing：`src/components/home/recent-writing.astro`
- [x] Featured Projects：`src/components/home/featured-projects.astro`
- [ ] 首页碎念预览：二期功能，一期未实现（见 `docs/PRD-personal-blog-phase2.md`）
- [x] 提交: 合并到下一个 commit

## Phase 5: 文章系统 ✅

- [x] 文章详情页：`src/pages/posts/[slug].astro`
- [x] 标签页：`src/pages/tags/[tag].astro`
- [x] 分类页：`src/pages/categories/[category].astro`
- [x] 目录 TOC：`src/components/post/table-of-contents.tsx`（React island，IntersectionObserver 高亮）
- [x] 阅读进度：`src/components/post/reading-progress.tsx`（顶部进度条）
- [x] 代码复制：由 astro-expressive-code 内置，无需单独组件
- [x] 代码高亮：astro-expressive-code（带主题和语言标签）
- [x] 阅读时间、标题锚点、上一篇/下一篇
- [x] 提交: `feat: add homepage hero, post reading experience, search and comments`

## Phase 6: 搜索、评论、SEO ✅

- [x] Pagefind 静态搜索：`src/components/ui/pagefind-search.tsx`（导航栏内搜索框）
- [x] Giscus 评论：`src/components/post/giscus-comments.tsx`（占位，需配置 repo-id/category-id）
- [x] About 页面：`src/pages/about.astro`
- [x] Projects 页面：`src/pages/projects.astro`
- [x] RSS：`src/pages/rss.xml.ts`
- [x] sitemap：@astrojs/sitemap 自动生成
- [x] OpenGraph / Twitter Card / RSS link
- [x] 提交: `feat: add homepage hero, post reading experience, search and comments`

### 后补完成项

- [x] Giscus 已配置：GitHub repo 已启用 Discussions，`src/components/post/giscus-comments.tsx` 已填入 repo-id/category-id
- [x] 标签/分类聚合页已补齐：`src/pages/tags/[tag].astro`、`src/pages/categories/[category].astro`

## Phase 7: 旧文迁移 ✅

- [x] 旧站唯一文章 `ai-full-auto-workflow` 已迁移到 `src/content/posts/`
- [x] Jekyll frontmatter 转换为 Content Collections schema
- [x] 旧站文件备份到 `~/.blog-legacy-backup`
- [x] 提交: 包含在 scaffold commit 中

## Phase 8: 部署 ✅

- [x] 本地构建：`npm run build` → 5 pages + pagefind index
- [x] Cloudflare Pages 项目创建：`npx wrangler pages project create mitoromisaka-blog --production-branch main`
- [x] 部署上线：`npx wrangler pages deploy dist --project-name mitoromisaka-blog`
- [x] 线上地址：`https://feat-astro-cloudflare-blog.mitoromisaka-blog.pages.dev`
- [x] 提交: 无需额外提交（部署是运维操作）

### 部署踩坑

- wrangler 需要先 `wrangler login`（OAuth）或设置 `CLOUDFLARE_API_TOKEN`
- Direct Upload 部署：先 `pages project create` 再 `pages deploy`
- Cloudflare Dashboard 的 Turnstile 会阻挡自动化浏览器，wrangler CLI 是更可靠方式

## Phase 9: 文档收尾 ✅

- [x] 更新 `README.md`（技术栈、本地开发、部署说明）
- [x] 更新项目 `AGENTS.md`（编码约定、目录结构）
- [x] 更新此 TASKS 文档（标记完成状态、记录踩坑）
- [x] 更新 `doc-driven-dev` skill 参考文档 `references/astro-v6-cloudflare-pages.md`
- [x] 第二期规划文档已创建：
  - `docs/PRD-personal-blog-phase2.md`
  - `docs/TECH-personal-blog-phase2.md`
  - `docs/TASKS-personal-blog-phase2.md`
- [ ] 第二期待执行：
  - Timeline / 时光页
  - Notes / 碎念
  - Projects 页增强
  - 自定义 Reaction
  - Newsletter（三期候选）
  - 接入自定义域名（独立运维任务）

---

> 执行状态：Plan 全部完成，站点已上线 `mitoromisaka-blog.pages.dev`。
> 后续改动请先更新文档，再按文档执行。

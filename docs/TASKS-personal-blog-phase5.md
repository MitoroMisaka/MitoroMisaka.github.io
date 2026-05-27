# 执行任务: 个人技术博客五期（页面美术设计工程 · 余白 / Yohaku）

> 基于 TECH: `docs/TECH-personal-blog-phase5.md`
> 日期: 2026-05-27
> 状态: 草案

---

## Phase 1: 基础设施 — Design Token 迁移

- [ ] `npm install @yohaku/design-system` — 已完成 ✅
- [ ] 重写 `src/styles/global.css`：移除旧颜色变量 `--bg/--fg/--card/--brand`，替换为 Yohaku Token
  - `@import "@yohaku/design-system/tokens.css";`
  - `@import "tailwindcss";`
  - `html { font-size: 14px; }`
  - `[data-theme='dark']` 块：覆盖 `--surface-paper`、`--color-neutral-*`、`--bg-opacity`、`--color-border`
  - 保留热力图变量 `--heatmap-*`（与 Yohaku 不冲突）
  - 保留 `.prose a`、`.heading-anchor`、`.pending` 样式
- [ ] 创建 `src/styles/yohaku-extras.css`：
  - `.hero-blob` 光斑动画（`blob-entrance` + `blob-float` keyframes）
  - `.link-underline` 下划线展开动画
  - `.markdown--note` 手记排版变体（衬线 + 首字下沉 + 段落缩进）
  - `*::-webkit-scrollbar` 定制（6px 圆角）
  - `[data-hide-print]` 打印样式
  - Header 毛玻璃 `.site-header-glass`
- [ ] 字体加载：`base-layout.astro` 添加 `<link>` 预加载 Instrument Sans + Noto Serif SC
- [ ] 全局字体栈更新：`--font-sans` 包含 Instrument Sans 回退链
- [ ] 构建验证：`npm run build`，确认无 broken token 引用
- [ ] 提交: `feat: phase5 infra — Yohaku tokens + extras CSS`

## Phase 2: 首页 Hero 重塑

- [ ] 头像替换：`src/components/home/hero-section.astro` 中将头像路径改为 `/avatar.png`
- [ ] 创建 `src/components/home/hero-animated.tsx`：
  - 头像 fade-in + scale（`client:load`）
  - 标题逐字 slide-up（每个 `<span>` 用 `animation-delay: calc(var(--i) * 50ms)`）
  - 副标题 fade-in（`animation-delay: 800ms`）
  - 社交图标容器依次 fade-in（stagger 100ms）
- [ ] Hero 背景加 `.hero-blob` 光斑容器（两个伪元素）
- [ ] 光斑颜色使用 `var(--color-accent)` 的低透明度 + `filter: blur(60px)`
- [ ] "AI ⚙ Workflow" 风格标签（可选）：CSS 辉光 + 流光动画
- [ ] 构建验证：`npm run build` + 本地 `npm run dev` 确认动画正常
- [ ] 视觉验收：与 innei.in 首页截图对比布局和动画节奏
- [ ] 提交: `feat: phase5 hero redesign — avatar + blob + entrance animation`

## Phase 3: 排版与组件视觉打磨

- [ ] 文章列表卡片样式：
  - 移除 card 背景（如有），使用纯文本排版
  - 标题字号 `text-title-20`
  - 摘要区添加 `ring-1 ring-accent/10 rounded-md px-4 py-2`
  - "阅读全文 →" 链接加 `.link-underline` class
- [ ] 手记内容排版变体：
  - `post-layout.astro` 中判断 content type，手记添加 `markdown--note` class
  - 验证衬线体 + 首字下沉 + 段落缩进渲染正确
- [ ] Header 毛玻璃：
  - `site-header.astro` 添加 `.site-header-glass` class
  - `backdrop-filter: blur(12px)` + 半透明背景
- [ ] Footer 更新：
  - 添加 "Built with Astro · Powered by 余白 / Yohaku" 文字
  - 链接到 `https://github.com/Innei/Yohaku`
- [ ] 构建验证
- [ ] 视觉验收：亮/暗色模式下各页面确认
- [ ] 提交: `feat: phase5 visual polish — typography + header + footer`

## Phase 4: 全站 class 迁移

- [ ] 搜索所有组件中旧的 `--bg / --fg / --card / --brand` 变量引用
- [ ] 替换为 Yohaku Token：
  - `bg-[var(--bg)]` → `bg-neutral-1`
  - `text-[var(--fg)]` → `text-neutral-9`
  - `text-[var(--fg-muted)]` → `text-neutral-7`
  - `text-[var(--fg-soft)]` → `text-neutral-5`（仅边框/图标，不作文本！）
  - `bg-[var(--card)]` → `bg-neutral-1`
  - `border-[var(--line)]` → `border-neutral-3`
  - `text-[var(--brand)]` → `text-accent`
  - `bg-[var(--brand)]` → `bg-accent`
- [ ] 特别注意 `neutral-5` — 只能用于 `border`/`divide`/`decoration`，不能用于 `text-*`
  - 若发现 `text-neutral-5` 使用，替换为 `text-neutral-7` 或 `text-neutral-6`
- [ ] 构建 + 视觉验收
- [ ] 提交: `feat: phase5 migrate all components to Yohaku tokens`

## Phase 5: 文档更新

- [ ] 更新 `README.md`：
  - 设计理念：日系极简 · 余白排版 · 内容优先
  - 技术栈加入 `@yohaku/design-system`
  - 页脚标注 "Powered by 余白 / Yohaku"
- [ ] 更新 `AGENTS.md`：
  - 编码约定中加入 Yohaku Token 禁用规则
  - 颜色使用约束：禁止 `text-neutral-50…950`，禁止 `text-neutral-5`
  - 字号使用约束：禁止 `text-xs/sm/base/lg/xl/2xl/3xl`，只用 `text-copy-N/text-title-N`
- [ ] 更新 `docs/WRITING.md`：
  - 排版引用更新为 Yohaku scale
- [ ] 提交: `docs: phase5 docs update — Yohaku conventions`

## Phase 6: 部署与验收

- [ ] 全站构建：`PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`
- [ ] 全站检查：`PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run check`
- [ ] 部署到 Cloudflare Pages
- [ ] 逐页验收 checklist：
  - [ ] 首页：头像、光斑、入场动画、Yohaku 配色
  - [ ] 文章列表：无边框卡片、下划线动画、元数据排版
  - [ ] 文章详情：正文排版、accent 色使用、TOC 样式
  - [ ] 手记列表/详情：衬线体 + 首字下沉
  - [ ] 系列页、Garden、项目页
  - [ ] 搜索、标签页、分类页
  - [ ] Stats/NFT 页
  - [ ] 暗色模式切换：所有页面验证
  - [ ] 移动端响应式验证
- [ ] 提交: `feat: phase5 deploy + acceptance`

# 执行任务: 个人技术博客网站（MitoroMisaka.github.io 重建）

> 基于 TECH: `/Users/liaojinchuan/.hermes/plans/personal-tech-blog/TECH-personal-blog.md`
> 日期: 2026-05-26

## Phase 0: 仓库与部署前置确认

- [ ] 确认源码仓库是否继续使用 `MitoroMisaka/MitoroMisaka.github.io`
- [ ] 确认 Cloudflare Pages 绑定方式：
  - [ ] 使用 `*.pages.dev` 临时上线
  - [ ] 或接入自定义域名
- [ ] 明确旧站保留策略：
  - [ ] 内容迁移名单
  - [ ] 旧 URL 保留 / redirect 策略
- [ ] 在项目根目录准备 `docs/`，将当前 PRD/TECH/TASKS 搬入项目内
- [ ] 初始化项目级 `AGENTS.md`
- [ ] 代码提交: `docs: add blog planning docs`

## Phase 1: 项目脚手架与基础配置

- [ ] 创建 Astro 项目
- [ ] 安装依赖：Astro、MDX、React、TailwindCSS、Pagefind、Giscus 所需包
- [ ] 配置 `astro.config.mjs`
- [ ] 配置 `tailwind.config.mjs`
- [ ] 配置 `tsconfig.json`
- [ ] 配置 Cloudflare Pages 构建命令与输出目录
- [ ] 配置基础目录结构：
  - [ ] `src/content/`
  - [ ] `src/components/`
  - [ ] `src/layouts/`
  - [ ] `src/lib/`
  - [ ] `src/pages/`
  - [ ] `public/`
- [ ] 代码提交: `feat: bootstrap astro blog foundation`

## Phase 2: 内容系统与站点配置

- [ ] 定义 Content Collections schema：`src/content/config.ts`
- [ ] 定义文章 frontmatter 规则
- [ ] 定义项目内容 frontmatter 规则
- [ ] 实现站点配置文件：`src/lib/site-config.ts`
- [ ] 实现内容辅助函数：
  - [ ] 文章排序
  - [ ] 标签聚合
  - [ ] 分类聚合
  - [ ] 阅读时间计算
- [ ] 创建示例内容：
  - [ ] `src/content/posts/`
  - [ ] `src/content/pages/about.mdx`
  - [ ] `src/content/projects/`
- [ ] 代码提交: `feat: add content collections and site config`

## Phase 3: 设计系统与全站布局

- [ ] 实现基础布局：`src/layouts/base-layout.astro`
- [ ] 实现文章布局：`src/layouts/post-layout.astro`
- [ ] 实现站点头部：`src/components/site/site-header.astro`
- [ ] 实现站点页脚：`src/components/site/site-footer.astro`
- [ ] 实现全站主题变量与排版规范
- [ ] 实现主题切换组件：`src/components/ui/theme-toggle.tsx`
- [ ] 定义颜色、间距、卡片、代码块、提示块等基础样式
- [ ] 完成桌面端与移动端基础布局
- [ ] 代码提交: `feat: build global layout and theme system`

## Phase 4: 首页与信息架构

- [ ] 实现首页：`src/pages/index.astro`
- [ ] 实现 Hero 模块：`src/components/home/hero-section.astro`
- [ ] 实现 Recent Writing 模块：`src/components/home/recent-writing.astro`
- [ ] 实现 Featured Projects 模块：`src/components/home/featured-projects.astro`
- [ ] 实现首页基础碎念预览（如决定保留）
- [ ] 调整首页信息密度与留白节奏，使其靠近日系极简目标
- [ ] 代码提交: `feat: add homepage hero and content sections`

## Phase 5: 文章系统与阅读体验

- [ ] 实现文章详情页：`src/pages/posts/[...slug].astro`
- [ ] 实现标签页：`src/pages/tags/[tag].astro`
- [ ] 实现分类页：`src/pages/categories/[category].astro`
- [ ] 实现目录组件：`src/components/post/table-of-contents.tsx`
- [ ] 实现阅读进度组件：`src/components/post/reading-progress.tsx`
- [ ] 实现代码复制按钮：`src/components/post/code-copy-button.tsx`
- [ ] 配置代码高亮与技术文章样式
- [ ] 支持 heading anchor、阅读时间、上一篇/下一篇（可选）
- [ ] 代码提交: `feat: build post pages and reading experience`

## Phase 6: 搜索、评论、SEO 与信息页

- [ ] 接入 Pagefind 静态搜索
- [ ] 接入 Giscus 评论组件：`src/components/post/giscus-comments.tsx`
- [ ] 实现 About 页面：`src/pages/about.astro`
- [ ] 实现 Projects 页面：`src/pages/projects.astro`
- [ ] 配置 RSS：`src/pages/rss.xml.js`
- [ ] 配置 sitemap
- [ ] 配置 canonical、OpenGraph、Twitter Card
- [ ] 完善 favicon、站点图标、社交元信息
- [ ] 代码提交: `feat: add search comments and seo`

## Phase 7: 旧文迁移与内容整理

- [ ] 梳理旧站文章清单
- [ ] 迁移有价值文章到 `src/content/posts/`
- [ ] 统一 slug、日期、分类、标签
- [ ] 修复旧文中的图片、链接、代码块与引用格式
- [ ] 验证旧 URL 是否需要重定向
- [ ] 至少准备一批可公开展示的核心文章
- [ ] 代码提交: `feat: migrate legacy content into new blog`

## Phase 8: 部署联通与验收

- [ ] 本地构建验证：`npm run build`
- [ ] 本地预览验证：`npm run preview`
- [ ] 检查首页、文章页、标签页、About、Projects 页面
- [ ] 检查移动端布局与主题切换
- [ ] 检查搜索、评论、RSS、sitemap、SEO 元标签
- [ ] 部署到 Cloudflare Pages
- [ ] 验证线上构建与页面可访问性
- [ ] 代码提交: `chore: prepare cloudflare deployment release`

## Phase 9: 收尾与文档沉淀

- [ ] 更新 `README.md`
- [ ] 更新项目 `AGENTS.md`
- [ ] 补充部署说明与写作说明
- [ ] 记录第二期 backlog：Timeline、Notes、Reaction、Newsletter 等
- [ ] 最终检查每个阶段 commit 是否齐全
- [ ] 代码提交: `docs: finalize blog docs and next-phase backlog`

---

> 执行指令：按 Phase 顺序执行。每个 Phase 结束后 git commit，跳过 lint/format；大型重构阶段允许直接 commit，后续再补整理。
> 如需切换到快速执行模型，可在实施阶段使用更快模型按本 TASKS 文档逐阶段落地。

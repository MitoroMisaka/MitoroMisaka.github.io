# MitoroMisaka.github.io 项目协作规范

## 项目简介与技术栈

- 项目目标：个人技术博客，聚焦 AI workflow、开发实践和技术写作。
- 技术栈：Astro v6 + MDX + React islands + TailwindCSS v4 + **[@yohaku/design-system](https://www.npmjs.com/package/@yohaku/design-system)** + Cloudflare Pages。
- 设计系统：Yohaku (余白) — MIT 协议的开源排版系统。
- 部署目标：Cloudflare Pages（`mitoromisaka-blog.pages.dev`）。

## 目录结构说明

- `src/content/`：内容源（posts / notes / projects / timeline / garden）
- `src/components/`：页面组件与交互组件（含 analytics / garden / home / notes / post / projects / series / site / stats / timeline / ui）
- `src/layouts/`：基础布局与文章布局
- `src/lib/`：站点配置、内容工具函数
- `src/pages/`：页面路由
- `src/styles/`：Yohaku Token + 动画 + 排版变体（`global.css` + `yohaku-extras.css`）
- `functions/`：Cloudflare Pages Functions（API 路由）
- `docs/`：PRD / TECH / TASKS / WRITING / DEPLOYMENT / ANALYSIS

## 构建与运行命令

- 开发：`npm run dev`
- 构建：`npm run build`（含 Pagefind postbuild）
- 部署：`npx wrangler pages deploy dist --project-name mitoromisaka-blog`
- Node 版本要求 >= 22.12，本地切换：`PATH=/opt/homebrew/opt/node@22/bin:$PATH`

## 编码约定

- TypeScript 严格模式，优先使用明确类型。
- 单文件尽量不超过 500 行。
- .tsx 文件用 `className`，不是 `class`。
- 新增内容参考 `docs/WRITING.md`。
- 风格目标：日系极简、高留白、内容优先。
- 文档优先于代码：改动前先更新 PRD / TECH / TASKS。

## Yohaku 设计约束（必须遵守）

### 颜色
- **禁止** `text-neutral-50…950`（Tailwind 默认 gray scale — 全项目禁用）
- **禁止** `text-neutral-5`（对比度不够 — 仅用于边框/分割线）
- 使用 Yohaku 10 级中性色阶：`text-neutral-1…10`
- accent 色 `#c56473`（变量 `--color-accent`），占表面 ≤5%
- 语义色仅用 `info/success/warning/error`

### 字号
- **禁止** `text-xs/sm/base/lg/xl/2xl/3xl/4xl/5xl/6xl/7xl/8xl/9xl`
- **禁止** 硬编码 `text-[Npx]`
- 仅使用 Yohaku 字号 token：
  - `text-caption-10` / `text-label-12`
  - `text-copy-13` / `text-copy-14` (默认) / `text-copy-15` / `text-copy-16`
  - `text-title-20` / `text-title-24` / `text-title-28`
  - `text-display-36` / `text-display-48`
- 加粗中文只允许 `font-medium` (500)，禁止 `font-bold` (700) — CJK 没有真正的粗体

### 字体
- 三个字体角色：`--font-sans` / `--font-serif` / `--font-mono`
- 中文/日文渲染必须带有 CJK 回退链
- 禁止硬编码 `font-family`

### 深度和阴影
- **禁止** 硬 drop shadow（`box-shadow: 0 4px 6px ...`）
- 使用 ring 或 whisper shadow（0 0 0 1px + 微弱的 blur shadow）
- 毛玻璃使用四个预定义的 opacity+blur 级别

## 外部依赖说明

- 评论系统：Giscus（GitHub Discussions，repo-id `R_kgDOSoDQEg`，category-id `DIC_kwDOSoDQEs4C9364`）
- 静态搜索：Pagefind（构建时自动索引）
- 语法高亮：astro-expressive-code (含 frames 插件)
- 动态 Reaction：Cloudflare Pages Functions + KV（binding `REACTIONS`）
- 隐私友好统计：Cloudflare Pages Functions + KV（binding `ANALYTICS`）
- Mermaid 图表：客户端渲染（动态 import mermaid）
- 图片 lightbox：React island `client:idle`
- 设计系统：`@yohaku/design-system` v0.0.2 (MIT)

## 新增内容类型约束

### Garden 条目

- 文件位置：`src/content/garden/*.mdx`，文件名 = slug
- Frontmatter：`title`(必填)、`description`(必填)、`category`(必填)、`stage`(seedling|budding|evergreen)、`related`(string[])、`tags`、`date`、`updated`、`draft`
- 正文可用 `[[other-garden-slug]]` wiki 链接
- Backlinks 在构建期全量计算

### 系列文章

- 同系列文章使用相同的 `series` frontmatter 值
- 使用 `seriesOrder`（1-indexed）指定系列内顺序
- 系列名称和描述在 `src/lib/series-config.ts` 中维护

### Mermaid 图表注意事项

- `astro-expressive-code` 排除 `mermaid` 语言
- Mermaid 在客户端动态 import 渲染

## Cloudflare Functions / KV 注意事项

- KV namespace 通过 `wrangler.jsonc` 绑定：
  - `REACTIONS` id: `66a6f0b892864883b270d6ef246e3879`
  - `ANALYTICS` id: `71b964e0d8324338b921464708fdbc6c`
- 前端 `reaction-bar.tsx` 通过 `localStorage` 防止同设备重复点击

## 安全与发布约束

- 禁止读取 `.env` 文件内容。
- 禁止提交任何密钥或令牌。
- 环境变量通过 Cloudflare Pages 后台配置。
- 线上变更前先本地 build 成功。
- 每个逻辑阶段完成后提交 commit。
- 不要把未完成项标记为完成；没做的标 ❌。

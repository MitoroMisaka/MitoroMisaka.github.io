# MitoroMisaka.github.io 项目协作规范

## 项目简介与技术栈

- 项目目标：个人技术博客，聚焦 AI workflow、开发实践和技术写作。
- 技术栈：Astro v6 + MDX + React islands + TailwindCSS v4 + Cloudflare Pages。
- 部署目标：Cloudflare Pages（`mitoromisaka-blog.pages.dev`）。

## 目录结构说明

- `src/content/`：内容源（posts / notes / projects / timeline）
- `src/components/`：页面组件与交互组件（含 analytics / newsletter / stats）
- `src/layouts/`：基础布局与文章布局
- `src/lib/`：站点配置、内容工具函数（含 analytics-config / kv-types / newsletter-provider / mood-labels / seo）
- `src/pages/`：页面路由（含 stats.astro / newsletter.astro）
- `functions/`：Cloudflare Pages Functions（API 路由）
  - `functions/api/reactions.ts` — Reaction API
  - `functions/api/analytics/` — 统计 API（view + summary）
  - `functions/api/newsletter/` — Newsletter 订阅 API
- `docs/`：PRD / TECH / TASKS / WRITING / DEPLOYMENT

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

## 外部依赖说明

- 评论系统：Giscus（GitHub Discussions，repo-id `R_kgDOSoDQEg`，category-id `DIC_kwDOSoDQEs4C9364`）
- 静态搜索：Pagefind（构建时自动索引）
- 语法高亮：astro-expressive-code
- 动态 Reaction：Cloudflare Pages Functions + KV（binding `REACTIONS`）
- Reaction API：`GET /api/reactions?target=...` / `POST /api/reactions`
- 隐私友好统计：Cloudflare Pages Functions + KV（binding `ANALYTICS`），按日聚合，不追踪个人用户
- 统计 API：`POST /api/analytics/view`（浏览上报）/ `GET /api/analytics/summary`（聚合摘要）
- Newsletter 订阅：Buttondown，需 `BUTTONDOWN_API_KEY` 环境变量（格式 `sk-*`）
- Newsletter API：`POST /api/newsletter/subscribe`

## Cloudflare Functions / KV 注意事项

- `functions/api/reactions.ts` 使用 Cloudflare Workers 运行时类型（KVNamespace），本地 IDE 报 TS 错误属正常。
- `functions/api/analytics/` 目录下的 view 和 summary 函数同样使用 KV 绑定（`ANALYTICS`），按日聚合计数字段。
- `functions/api/newsletter/` 目录下的 subscribe 函数依赖 `BUTTONDOWN_API_KEY` 环境变量，本地开发时需在 `.dev.vars` 中配置。
- KV namespace 通过 `wrangler.jsonc` 绑定：
  - `REACTIONS` id 为 `66a6f0b892864883b270d6ef246e3879`
  - `ANALYTICS` id 待填入
- 前端 `reaction-bar.tsx` 通过 `localStorage` 防止同设备重复点击；API 层只做简单计数，无用户鉴权。
- 如果部署后 API 不可用，检查 Cloudflare Pages 项目是否关联了 KV namespace。

## 安全与发布约束

- 禁止读取 `.env` 文件内容。
- 禁止提交任何密钥或令牌（包括 `BUTTONDOWN_API_KEY`）。
- 环境变量通过 Cloudflare Pages 后台配置，不在代码仓库中存储。
- 线上变更前先本地 build 成功。
- 每个逻辑阶段完成后提交 commit。
- 不要把未完成项标记为完成；没做的标 ❌。

## 新增内容类型说明

### Stats 页面（`/stats`）

- 数据来源：Cloudflare KV（`ANALYTICS` binding），通过 `/api/analytics/summary` 获取
- 页面组件位于 `src/components/stats/`，路由页面为 `src/pages/stats.astro`
- 新增统计组件时添加到 `src/components/analytics/` 目录

### Newsletter 页面（`/newsletter`）

- 订阅表单组件位于 `src/components/newsletter/`
- 路由页面为 `src/pages/newsletter.astro`
- 后端 API：`functions/api/newsletter/subscribe.ts`，需 `BUTTONDOWN_API_KEY` 环境变量
- 当前为手动触发模式，作者在 Buttondown 后台手动发送 Newsletter

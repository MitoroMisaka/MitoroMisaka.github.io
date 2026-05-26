# 技术方案: 个人技术博客三期（上线硬化、订阅与数据反馈）

> 基于 PRD: `docs/PRD-personal-blog-phase3.md`
> 二期复验: `docs/QA-personal-blog-phase2.md`
> 执行计划: `docs/TASKS-personal-blog-phase3.md`
> 日期: 2026-05-26
> 状态: 草案

## 架构概览

```text
Astro v6 static-first site
├── 二期质量回补
│   ├── functions/api/reactions.ts        -> 修复 KV 类型声明，恢复 npm run check
│   ├── src/components/ui/pagefind-search -> 加载 Pagefind runtime + empty/loading states
│   ├── src/components/site/site-header   -> 移动端可访问导航
│   ├── src/pages/notes/index.astro       -> 修复置顶/全部计数
│   ├── src/layouts/*                     -> canonical / og:url / RSS alternates
│   └── src/pages/projects/[slug].astro   -> 链接去重
│
├── Custom domain / deploy hardening
│   ├── src/lib/site-config.ts            -> siteUrl 切换到用户确认域名
│   ├── astro.config.mjs                  -> sitemap site 读取 siteConfig 或同源配置
│   ├── public/_redirects                 -> 保留旧路径 redirect；可选 canonical redirect 文档
│   └── docs/DEPLOYMENT.md                -> Cloudflare Pages + DNS + 回滚流程
│
├── Privacy analytics
│   ├── src/lib/analytics-config.ts       -> 允许统计的 path/type 规则
│   ├── src/components/analytics/tracker.tsx
│   ├── functions/api/analytics/view.ts   -> POST 聚合浏览事件
│   ├── functions/api/analytics/summary.ts-> GET 聚合统计摘要
│   └── Cloudflare KV: ANALYTICS          -> analytics:v1:{date}:{path} = count
│
├── Public stats
│   ├── src/pages/stats.astro
│   ├── src/components/stats/stats-dashboard.tsx
│   └── src/components/stats/*            -> 小型图表/列表，无大型依赖
│
└── Newsletter
    ├── src/pages/newsletter.astro
    ├── src/components/newsletter/newsletter-form.tsx
    ├── src/lib/newsletter-provider.ts
    ├── functions/api/newsletter/subscribe.ts
    └── External provider adapter          -> Buttondown / Resend / other, 由用户确认
```

## 技术选型

| 层 | 选择 | 理由 |
|----|------|------|
| 框架 | Astro v6 | 延续现有内容站架构，静态优先。 |
| 内容 | MDX + Content Collections | 三期不引入 CMS。 |
| 交互 | React islands | 搜索、移动导航、统计面板、订阅表单是局部交互。 |
| 样式 | TailwindCSS v4 + CSS variables | 延续现有设计系统。 |
| 搜索 | Pagefind runtime + build-time index | 已有依赖，修复前端接入即可。 |
| 动态 API | Cloudflare Pages Functions | 与 Reaction 架构一致，不引入独立后端。 |
| 统计存储 | Cloudflare KV | 低成本聚合计数；接受 eventually consistent。 |
| Newsletter provider | Adapter 模式 | 用户未确认 provider 前不绑定具体服务，避免误用外部 API。 |
| 域名/DNS | Cloudflare Pages custom domains | 与部署平台一致；DNS 操作需用户确认。 |

## 二期质量回补设计

### 1. Cloudflare KV 类型修复

当前问题:

```ts
interface Env {
  REACTIONS: KVNamespace;
}

declare const KVNamespace: any;
```

`KVNamespace` 被声明为 runtime value，但又作为 type 使用，导致 `astro check` 失败。

推荐方案:

```ts
type KVBinding = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

interface Env {
  REACTIONS: KVBinding;
}
```

理由:

- 不额外引入 Cloudflare workers types 也能通过本项目的实际使用。
- 只暴露当前函数需要的最小 KV 方法。
- 后续 Analytics / Newsletter 也可复用 `KVBinding` 类型。

可选方案:

- 安装并配置 `@cloudflare/workers-types`。
- 优点是类型更完整；缺点是需要新增依赖和 tsconfig 配置。

### 2. Pagefind 搜索修复

当前问题:

- `pagefind-search.tsx` 使用 `window.pagefind`。
- Layout 没有加载 Pagefind runtime。
- 输入关键词后静默失败。

推荐实现:

```ts
async function loadPagefind() {
  if (window.pagefind) return window.pagefind;
  await import(/* @vite-ignore */ '/pagefind/pagefind.js');
  return window.pagefind;
}
```

注意事项:

- `dist/pagefind/` 由 postbuild 生成，开发环境可能不存在；开发环境需显示“搜索索引未生成”降级态。
- 搜索组件应有 loading / no results / unavailable 状态。
- 搜索占位文案应从“搜索文章...”调整为“搜索内容...”，因为已覆盖 Notes / Projects。

### 3. 移动端导航修复

当前问题:

```astro
<ul class="hidden md:flex ...">
```

`md` 以下主导航隐藏，且没有 mobile menu。

推荐方案:

- 新增 `src/components/site/mobile-nav.tsx` React island。
- Header 桌面端保留现有 nav。
- 移动端显示一个轻量 `Menu` 按钮，点击后展开站内链接。
- 保证 keyboard 可访问：button 有 `aria-expanded`、`aria-controls`，Esc 关闭。

备选方案:

- 使用横向滚动 nav，不引入 JS。
- 优点是更轻；缺点是导航项多时体验一般。

### 4. Notes 计数修复

当前问题:

```astro
全部碎念 ({allNotes.length})
<NotesList notes={regularNotes} />
```

推荐方案:

- 置顶区域显示 `pinnedNotes`。
- 下方标题改为 `其他碎念 ({regularNotes.length})`。
- 如果 `regularNotes.length === 0`，空状态显示“暂无其他碎念”。

### 5. SEO 元信息修复

新增 layout props:

```ts
interface BaseSeoProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article';
  rssAlternates?: Array<{ href: string; title: string }>;
}
```

输出:

```astro
<link rel="canonical" href={canonicalUrl} />
<meta property="og:url" content={canonicalUrl} />
<link rel="alternate" type="application/rss+xml" href="/rss.xml" title="静かな森" />
<link rel="alternate" type="application/rss+xml" href="/notes.xml" title="静かな森 — 碎念" />
```

注意:

- `siteConfig.siteUrl` 是 canonical 源。
- 自定义域名确认后必须同步更新。

### 6. Project 链接去重

推荐做法:

- 构造统一 `projectLinks` 数组。
- 按 `href` 去重。
- `repo` / `demo` 仍保留兼容，但渲染前合并。

### 7. Note mood 展示

推荐新增:

```ts
const moodLabels: Record<string, string> = {
  excited: '✨ 兴奋',
  calm: '🌿 平静',
  thinking: '💭 思考',
};
```

未知 mood fallback 为原文，但可以降低视觉权重。

## 自定义域名方案

### 数据源

`src/lib/site-config.ts`:

```ts
siteUrl: 'https://<USER_CONFIRMED_DOMAIN>'
```

`astro.config.mjs` 应与 `siteConfig.siteUrl` 保持一致；如果 Astro config 不能直接 import TS，则使用单独 `site-meta.mjs` 或保持手动同步并在 TASKS 中明确检查。

### Cloudflare Pages 操作

执行前必须确认域名。步骤文档写入 `docs/DEPLOYMENT.md`:

1. Cloudflare Pages 项目 `mitoromisaka-blog` 添加 Custom domain。
2. 按 Cloudflare 提示配置 DNS。
3. 等待证书 active。
4. 用浏览器验证 HTTPS。
5. 检查 canonical、RSS、sitemap 是否指向新域名。
6. 保留 `pages.dev` 作为回退。

### Redirect 策略

- GitHub Pages 旧路径继续通过 `public/_redirects` 维护。
- 是否将 `pages.dev` 301 到自定义域名，取决于 Cloudflare Pages 支持和用户确认；默认不强制。

## 隐私统计方案

### 数据模型

KV keys:

```text
analytics:v1:day:{YYYY-MM-DD}:path:{encodedPath} = count
analytics:v1:day:{YYYY-MM-DD}:type:{post|note|project|page} = count
analytics:v1:total:path:{encodedPath} = count
analytics:v1:total:type:{type} = count
```

可选 referrer host:

```text
analytics:v1:day:{YYYY-MM-DD}:ref:{hostname} = count
```

不存储:

- IP
- User-Agent 原文
- cookie / localStorage ID
- 完整 referrer URL
- 邮箱或其他身份信息

### API 设计

| 方法 | 路径 | 用途 | 说明 |
|------|------|------|------|
| POST | `/api/analytics/view` | 记录一次页面浏览 | body 只接受 path / type / referrerHost；服务端过滤路径。 |
| GET | `/api/analytics/summary` | 获取公开聚合数据 | 返回 total、last7Days、last30Days、topPaths、typeBreakdown。 |

POST body:

```json
{
  "path": "/posts/ai-full-auto-workflow/",
  "type": "post",
  "referrerHost": "example.com"
}
```

响应:

```json
{ "ok": true }
```

错误策略:

- 无效 path/type 返回 400。
- KV 不可用返回 503。
- 前端 tracker 静默失败，不影响页面。

### 前端上报

`src/components/analytics/tracker.tsx`:

- `client:load` 或 `client:idle`。
- 使用 `navigator.sendBeacon`，fallback 到 `fetch(..., { keepalive: true })`。
- 只在生产域名启用；本地开发默认 disabled。

### Stats 页面

`src/pages/stats.astro` 静态壳 + React island fetch summary。

展示:

- 总浏览量。
- 最近 7 天趋势。
- 最近 30 天趋势。
- 热门内容路径。
- 类型分布：post / note / project / page。
- 数据说明：隐私友好、聚合、非实时。

## Newsletter 方案

### Provider adapter

`src/lib/newsletter-provider.ts`:

```ts
export interface NewsletterProvider {
  subscribe(email: string, source: string): Promise<{ ok: true } | { ok: false; message: string }>;
}
```

Provider 选择由用户确认。默认文档推荐:

| Provider | 优点 | 代价 |
|----------|------|------|
| Buttondown | 低维护，自带订阅管理和退订 | 品牌/样式受 provider 限制 |
| Resend | 可自定义发信域名，开发者友好 | 需要自己处理订阅状态/退订链路 |
| Mailchimp / ConvertKit | 功能完整 | 对个人技术博客偏重 |

三期 MVP 推荐优先 Buttondown；如果用户明确要自定义发信域名，再选 Resend。

### API 设计

| 方法 | 路径 | 用途 |
|------|------|------|
| POST | `/api/newsletter/subscribe` | 提交订阅邮箱 |

Request:

```json
{
  "email": "reader@example.com",
  "source": "newsletter-page"
}
```

Response:

```json
{ "ok": true, "message": "请检查邮箱确认订阅。" }
```

错误:

- 400 invalid email。
- 429 rate limited（可选）。
- 503 provider not configured。
- 502 provider error。

### 安全与反滥用

MVP:

- 基础 email 格式校验。
- 同一请求不暴露 provider error 细节。
- 不在 repo 存储 API key。

可选:

- Cloudflare Turnstile。
- KV 简单 rate limit。

## API 错误响应统一格式

```json
{
  "ok": false,
  "error": "invalid_email",
  "message": "邮箱格式不正确。"
}
```

成功:

```json
{
  "ok": true,
  "message": "..."
}
```

## 关键决策记录（ADR）

### ADR-001: 三期先修复二期质量问题，再做新功能

背景: 二期已部署，但复验发现 `npm run check`、搜索、移动导航、SEO 等问题。

选项:

- A: 直接做 Newsletter / Stats / 自定义域名。
- B: 先关闭 P2-QA-001 至 P2-QA-007。

决定: 选 B。

理由: 生产化功能会放大已有质量问题；先恢复质量门禁，后续执行更可控。

### ADR-002: 统计采用自有轻量 KV 聚合，不接入重型第三方 SDK

背景: 需要基础访问反馈，但站点强调隐私和低维护。

选项:

- A: Google Analytics / 类似重型 SDK。
- B: Plausible / Umami 等第三方。
- C: Cloudflare Pages Functions + KV 自建聚合计数。

决定: 三期 MVP 选 C。

理由: 控制采集字段，不设置 cookie，与现有 Cloudflare 架构一致。缺点是数据不如专业 analytics 精准，但足够指导个人博客内容方向。

### ADR-003: Newsletter 使用 provider adapter，执行前由用户确认 provider

背景: 邮件订阅涉及外部服务、密钥、退订合规、发信域名。

选项:

- A: 直接固定 Buttondown。
- B: 直接固定 Resend。
- C: 先抽象 adapter，执行到 Newsletter Phase 前确认 provider。

决定: 选 C。

理由: 避免在未确认服务和密钥的情况下写死实现；保持文档驱动但不猜测外部服务。

### ADR-004: 自定义域名是受控运维任务，不自动执行

背景: 域名和 DNS 是外部服务操作，错误配置会影响访问。

决定: 文档和代码准备可以先做；实际绑定域名前必须用户确认域名和 DNS 管理方式。

## 文件变更清单（预估）

| 文件 | 操作 | 说明 |
|------|------|------|
| `docs/QA-personal-blog-phase2.md` | 新增 | 二阶段复验报告。 |
| `docs/TASKS-personal-blog-phase2.md` | 修改 | 标注复验不通过项。 |
| `docs/PRD-personal-blog-phase3.md` | 新增 | 三期 PRD。 |
| `docs/TECH-personal-blog-phase3.md` | 新增 | 三期技术方案。 |
| `docs/TASKS-personal-blog-phase3.md` | 新增 | 三期执行计划。 |
| `functions/api/reactions.ts` | 修改 | KV 类型修复。 |
| `src/components/ui/pagefind-search.tsx` | 修改 | 加载 runtime，增加状态。 |
| `src/components/site/site-header.astro` | 修改 | 接入移动端导航。 |
| `src/components/site/mobile-nav.tsx` | 新增 | 移动端菜单。 |
| `src/pages/notes/index.astro` | 修改 | 修复置顶/全部计数。 |
| `src/layouts/base-layout.astro` | 修改 | canonical / og:url / rss alternates。 |
| `src/layouts/post-layout.astro` | 修改 | canonical / og:url / rss alternates。 |
| `src/lib/seo.ts` | 新增 | URL、canonical、alternate helper。 |
| `src/pages/projects/[slug].astro` | 修改 | 链接去重。 |
| `src/lib/mood-labels.ts` | 新增 | Note mood 展示映射。 |
| `src/lib/site-config.ts` | 修改 | siteUrl / nav 加 Stats / Newsletter。 |
| `src/lib/analytics-config.ts` | 新增 | 统计路径/type 规则。 |
| `src/components/analytics/tracker.tsx` | 新增 | 浏览事件上报。 |
| `functions/api/analytics/view.ts` | 新增 | 统计上报 API。 |
| `functions/api/analytics/summary.ts` | 新增 | 公开聚合 API。 |
| `src/pages/stats.astro` | 新增 | 公开统计页面。 |
| `src/components/stats/stats-dashboard.tsx` | 新增 | Stats React island。 |
| `src/pages/newsletter.astro` | 新增 | Newsletter 页面。 |
| `src/components/newsletter/newsletter-form.tsx` | 新增 | 订阅表单。 |
| `src/lib/newsletter-provider.ts` | 新增 | Provider adapter。 |
| `functions/api/newsletter/subscribe.ts` | 新增 | 订阅 API。 |
| `wrangler.jsonc` | 修改 | 新增 `ANALYTICS` KV binding；Newsletter env 只记录变量名，不写密钥。 |
| `docs/DEPLOYMENT.md` | 新增 | 域名、部署、回滚、KV、环境变量说明。 |
| `docs/WRITING.md` | 修改 | Newsletter / Stats / 发布说明。 |
| `README.md` | 修改 | 三期功能和运维说明。 |
| `AGENTS.md` | 修改 | 三期目录、约束、命令更新。 |

## 验证策略

- 本地:
  - `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run check`
  - `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`
- 线上:
  - 搜索关键词 `Reaction` / `Command Code`。
  - 移动端导航可访问主页面。
  - `/notes` 不再出现计数与空状态不一致。
  - canonical / og:url / RSS alternate 存在。
  - `/stats` API 成功和失败状态均可展示。
  - `/newsletter` invalid email / success / provider unavailable 状态可展示。
- 外部服务:
  - 自定义域名绑定、Newsletter provider 调用、KV namespace 创建都必须用户确认后执行。

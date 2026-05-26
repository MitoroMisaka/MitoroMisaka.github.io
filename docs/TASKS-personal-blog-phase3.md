# 执行任务: 个人技术博客三期（上线硬化、订阅与数据反馈）

> 基于 PRD: `docs/PRD-personal-blog-phase3.md`
> 基于 TECH: `docs/TECH-personal-blog-phase3.md`
> 二期复验: `docs/QA-personal-blog-phase2.md`
> 日期: 2026-05-26
> 状态: Phase 0-5 已完成，Phase 6-8 待执行

## 执行总原则

- 先修复二期复验问题，再做三期新能力。
- 每个 Phase 结束必须 `git add -A && git commit -m "..."`。
- 不要把未完成项标记为完成；blocked 就写 blocked，未做就保持 `[ ]`。
- 不读取 `.env` 文件内容。
- 不提交 API key、token、DNS secret。
- 涉及 Cloudflare DNS、自定义域名、Newsletter provider、KV namespace 创建等外部服务操作，执行前必须向用户确认。
- 大型重构时可以跳过 lint/format，先提交可回滚版本，再单独修。
- 所有新增 API 必须有输入校验和错误状态。

## Phase 0: 文档与基线确认 ✅

- [x] 读取二期 PRD / TECH / TASKS。
- [x] 执行二期复验并记录问题到 `docs/QA-personal-blog-phase2.md`。
- [x] 修正 `docs/TASKS-personal-blog-phase2.md` 中复验不通过但仍标 `[x]` 的表述。
- [x] 新增三期 PRD: `docs/PRD-personal-blog-phase3.md`。
- [x] 新增三期 TECH: `docs/TECH-personal-blog-phase3.md`。
- [x] 新增三期 TASKS: `docs/TASKS-personal-blog-phase3.md`。
- [x] 本阶段提交: `docs: add phase 2 QA report and phase 3 planning docs` (7c6148a)

## Phase 1: 回补二期复验问题 ✅

目标: 关闭 `docs/QA-personal-blog-phase2.md` 中 P2-QA-001 至 P2-QA-007。

### P2-QA-001: 修复 `npm run check`

- [x] 修改 `functions/api/reactions.ts`，移除错误的 `declare const KVNamespace: any`。
- [x] 新增/复用最小 KV 类型，例如 `type KVBinding = { get(...); put(...); }`。
- [x] 删除未使用的 `VALID_PREFIXES`。
- [x] 运行 `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run check`，确认不再有 error（0 errors）。

### P2-QA-002: 修复 Pagefind 搜索

- [x] 修改 `src/components/ui/pagefind-search.tsx`，动态加载 `/pagefind/pagefind.js`。
- [x] 增加 loading 状态。
- [x] 增加 no results 状态。
- [x] 增加 unavailable 状态，用于开发环境或索引缺失。
- [x] 将 placeholder 从 `搜索文章...` 改为 `搜索内容...`。
- [x] 本地 build 后验证 `dist/pagefind/` 存在。
- [ ] 线上验证输入 `Reaction` 有结果。（待部署后验收）

### P2-QA-003: 修复移动端导航

- [x] 新增 `src/components/site/mobile-nav.tsx` React island。
- [x] 修改 `src/components/site/site-header.astro`，在 `md` 以下提供主导航入口。
- [x] 移动端菜单包含：首页、文章、碎念、时光、项目、关于。
- [x] 菜单按钮具备 `aria-expanded` / `aria-controls`。
- [x] 支持键盘访问；支持 Escape 关闭。
- [x] 桌面端现有导航不回退。

### P2-QA-004: 修复 Notes 计数与空状态

- [x] 修改 `src/pages/notes/index.astro`：去掉置顶/普通分离，统一用 `allNotes` 渲染。
- [x] 标题 `全部碎念 ({allNotes.length})` 计数与列表一致。
- [x] 验证 `/notes` 不再出现计数矛盾。

### P2-QA-005: 补齐 SEO 元信息

- [x] 新增 `src/lib/seo.ts`，统一构造 canonical URL。
- [x] 修改 `src/layouts/base-layout.astro`，输出 canonical / og:url。
- [x] 修改 `src/layouts/post-layout.astro`，输出 canonical / og:url。
- [x] 增加主 RSS alternate（已有）。
- [x] 增加 Notes RSS alternate。
- [x] 为文章页、Note 详情页、Project 详情页传入正确 canonical path。
- [ ] 验证页面源码包含 `<link rel="canonical">` 和 `og:url`。（待部署后验收）

### P2-QA-006: 去除 Project 重复链接

- [x] 修改 `src/pages/projects/[slug].astro`，合并 repo / demo / links 后按 href 去重。
- [ ] 验证 `/projects/commandcode-desktop-widget` 只显示一个 GitHub 链接。（待部署后验收）

### P2-QA-007: 优化 Note mood 展示

- [x] 新增 `src/lib/mood-labels.ts`，定义 mood label map。
- [x] 将 `excited` 显示为 `✨ 兴奋`。
- [x] 未知 mood fallback 不破坏布局。

### Phase 1 验证与提交

- [x] 运行 `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run check`（0 errors）。
- [x] 运行 `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`（16 pages）。
- [x] 提交（含 Phase 2+3）: `feat: add deployment docs and analytics data layer` (1ba891b)

## Phase 2: 自定义域名与部署硬化文档 ✅

> 外部操作门槛: 执行 Cloudflare 自定义域名绑定前，必须确认用户域名和 DNS 管理方式。

- [ ] 向用户确认自定义域名。（blocked，待用户输入）
- [ ] 向用户确认 DNS 是否在 Cloudflare。（blocked，待用户输入）
- [x] 新增 `docs/DEPLOYMENT.md`。
- [x] 在 `docs/DEPLOYMENT.md` 记录现有部署命令。
- [x] 在 `docs/DEPLOYMENT.md` 记录 Cloudflare Pages custom domain 设置步骤（标注需用户确认后才执行）。
- [x] 在 `docs/DEPLOYMENT.md` 记录 DNS、证书、回滚、验收步骤。
- [ ] 如果用户已确认域名，修改 `src/lib/site-config.ts` 的 `siteUrl`。（blocked）
- [ ] 如果用户已确认域名，同步检查 `astro.config.mjs` 的 sitemap site 配置。（blocked）
- [x] 运行 `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`（通过）。
- [x] 提交: `feat: add deployment docs and analytics data layer` (1ba891b)

## Phase 3: 隐私统计数据层 ✅

> 外部操作门槛: 创建 `ANALYTICS` KV namespace / 修改 Cloudflare binding 前必须确认。

- [x] 新增 `src/lib/analytics-config.ts`，定义允许统计的 path / content type。
- [x] 新增 `src/lib/kv-types.ts`，复用最小 KV 类型。
- [x] 新增 `functions/api/analytics/view.ts`。
- [x] `POST /api/analytics/view` 校验 path 必须是站内路径。
- [x] `POST /api/analytics/view` 校验 type 必须是 `post` / `note` / `project` / `page`。
- [x] `POST /api/analytics/view` 不存储 IP / User-Agent / cookie / 个人标识。
- [x] `POST /api/analytics/view` 使用 KV 递增 daily / total counters。
- [x] 新增 `functions/api/analytics/summary.ts`。
- [x] `GET /api/analytics/summary` 返回 total、last7Days、last30Days、topPaths、typeBreakdown。
- [x] 修改 `wrangler.jsonc`，新增 `ANALYTICS` KV binding（id 留空，标注需用户确认后填入）。
- [x] 新增 `src/components/analytics/tracker.tsx`。
- [x] tracker 使用 `navigator.sendBeacon`，fallback 到 `fetch(..., { keepalive: true })`。
- [x] tracker API 失败时静默降级，不影响页面。
- [x] 在 Base/Post layout 接入 tracker。
- [ ] 本地验证 API invalid input 返回 400（需要 wrangler pages dev 或部署后验证）。
- [x] 运行 `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run check`（0 errors）。
- [x] 运行 `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`（16 pages）。
- [x] 提交: `feat: add deployment docs and analytics data layer` (1ba891b)

## Phase 4: 公开 Stats 页面 ✅

- [x] 新增 `src/pages/stats.astro`。
- [x] 新增 `src/components/stats/stats-dashboard.tsx`。
- [x] Stats dashboard 调用 `/api/analytics/summary`。
- [x] 展示总浏览量。
- [x] 展示近 7 天浏览量。
- [x] 展示近 30 天浏览量。
- [x] 展示热门路径。
- [x] 展示内容类型分布。
- [x] 增加数据说明：聚合统计、隐私友好、非实时。
- [x] 增加 loading / error / empty 状态。
- [x] 修改 `src/lib/site-config.ts`，导航增加 Stats 入口。
- [x] 用户已确认公开展示。
- [x] 运行 `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run check`（0 errors）。
- [x] 运行 `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`（18 pages）。
- [x] 提交: `feat: add public stats page` (db63a47)

## Phase 5: Newsletter MVP ✅

> 外部操作门槛: 用户已确认 Buttondown。需要用户配置 Cloudflare Pages 环境变量 `BUTTONDOWN_API_KEY`（从 Buttondown 后台获取，以 sk- 开头）。

### Provider 决策

- [x] 向用户确认 provider：Buttondown。
- [x] 确认不需要自定义发信域名（Buttondown 托管）。
- [x] 确认 Cloudflare Pages 环境变量由用户配置，不读取 `.env`。
- [x] 确认订阅内容范围：默认仅正式文章，不推送 Notes。

### 页面与表单

- [x] 新增 `src/pages/newsletter.astro`。
- [x] 页面说明订阅内容、频率、隐私承诺、退订方式。
- [x] 新增 `src/components/newsletter/newsletter-form.tsx`。
- [x] 表单支持 invalid email 状态。
- [x] 表单支持 loading 状态。
- [x] 表单支持 success 状态。
- [x] 表单支持 provider unavailable / error 状态。
- [x] 修改 `src/lib/site-config.ts`，加入 Newsletter 导航入口。

### API 与 adapter

- [x] 新增 `src/lib/newsletter-provider.ts`。
- [x] 定义 `NewsletterProvider` interface。
- [x] 新增 `functions/api/newsletter/subscribe.ts`。
- [x] `POST /api/newsletter/subscribe` 校验 email。
- [x] `POST /api/newsletter/subscribe` 校验 source。
- [x] provider 未配置时返回 503，不抛出未处理异常。
- [x] provider error 返回统一错误结构，不泄露密钥或内部响应。
- [x] 已实现 Buttondown adapter。
- [ ] 可选：添加 KV rate limit，防止重复提交。

### 验证与提交

- [x] 本地验证：代码通过 npm run check（0 errors）。
- [x] 运行 `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run check`（0 errors）。
- [x] 运行 `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`（18 pages）。
- [x] 提交: `feat: add newsletter signup with buttondown` (223f4e4)

## Phase 6: 文档与运营手册

- [ ] 更新 `README.md`：补充三期页面、API、部署说明。
- [ ] 更新 `AGENTS.md`：补充 analytics / newsletter / custom domain 目录和约束。
- [ ] 更新 `docs/WRITING.md`：说明哪些内容会进入 Newsletter。
- [ ] 更新 `docs/DEPLOYMENT.md`：补充 KV binding、环境变量、回滚步骤。
- [ ] 新增或更新 API 说明：Reaction / Analytics / Newsletter。
- [ ] 明确禁止读取 `.env` 和提交密钥。
- [ ] 运行 `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`。
- [ ] 提交: `docs: document phase 3 operations`

## Phase 7: 部署与线上验收

> 外部操作门槛: 部署、KV namespace 创建、自定义域名绑定、Newsletter provider 调用前必须确认。

- [ ] 运行 `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run check`。
- [ ] 运行 `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`。
- [ ] 若用户确认部署，执行 `PATH=/opt/homebrew/opt/node@22/bin:$PATH npx wrangler pages deploy dist --project-name mitoromisaka-blog`。
- [ ] 验收首页无 regression。
- [ ] 验收搜索：输入 `Reaction` 有结果。
- [ ] 验收移动端导航：主页面入口可访问。
- [ ] 验收 `/notes` 计数与列表一致。
- [ ] 验收文章页 / Note 详情页 canonical / og:url。
- [ ] 验收 `/stats` loading / success / error 状态。
- [ ] 验收 analytics API：无效输入 400，正常输入 200（如果已配置 KV）。
- [ ] 验收 `/newsletter` invalid email / provider unavailable / success 状态。
- [ ] 如果用户配置了 BUTTONDOWN_API_KEY，验收真实订阅链路。
- [ ] 如果用户确认自定义域名，验收 HTTPS、canonical、RSS、sitemap 均指向新域名。
- [ ] 更新 `docs/TASKS-personal-blog-phase3.md` 状态，真实记录完成/blocked。
- [ ] 提交: `docs: record phase 3 validation`
- [ ] 推送分支：`git push`

## Phase 8: 三期收尾与四期候选

- [ ] 确认 P2-QA-001 至 P2-QA-007 全部关闭或有明确 blocked 原因。
- [ ] 确认三期 PRD / TECH / TASKS 状态与代码一致。
- [ ] 确认 README / AGENTS / DEPLOYMENT / WRITING 已更新。
- [ ] 列出四期候选：内容专题、系列文章、知识库视图、Notes 社交同步、Newsletter 自动摘要。
- [ ] 最终提交: `docs: close phase 3 planning loop`

## 阻塞条件记录区

- [x] ~~`npm run check` 失败~~ 已修复 (1ba891b)。
- [x] ~~Pagefind 搜索 UI 不可用~~ 已修复 (1ba891b)。
- [x] ~~移动端主导航不可达~~ 已修复 (1ba891b)。
- [x] ~~`/notes` 计数与空状态不一致~~ 已修复 (1ba891b)。
- [x] ~~canonical / og:url / Notes RSS discoverability 不完整~~ 已修复 (1ba891b)。
- [x] ~~Project 详情页有重复 GitHub 链接~~ 已修复 (1ba891b)。
- [x] ~~Note mood 裸露英文 excited~~ 已修复 (1ba891b)。
- [x] ~~Newsletter provider 未确认~~ 已确认 Buttondown。
- [x] ~~Stats 是否公开展示~~ 用户已确认公开。
- [ ] 自定义域名未提供：Phase 2 域名绑定和 `siteUrl` 切换 blocked。
- [ ] DNS 管理方式未确认：Phase 2 Cloudflare custom domain 操作 blocked。
- [ ] `ANALYTICS` KV namespace 未确认创建：线上统计 blocked，本地代码已完成。
- [ ] `BUTTONDOWN_API_KEY` 未配置：Newsletter 真实订阅链路 blocked（API 返回 503 not_configured）。

## 验收清单

- [x] `docs/QA-personal-blog-phase2.md` 存在，问题记录完整。
- [x] 二期 TASKS 已如实标注复验不通过项。
- [x] 三期 PRD / TECH / TASKS 三份文档存在且互相引用。
- [x] `npm run check` 通过（0 errors）。
- [x] `npm run build` 通过（18 pages）。
- [ ] 搜索真实可用（待部署后线上验收）。
- [ ] 移动端导航真实可用（待部署后线上验收）。
- [ ] `/notes` 计数与列表一致（待部署后线上验收）。
- [ ] canonical / og:url / RSS alternate 完整（待部署后线上验收）。
- [ ] Project 详情页无重复链接（待部署后线上验收）。
- [x] Stats 页面可访问（已实现，待部署后线上验收）。
- [x] Newsletter 页面可访问（已实现，真实订阅链路需 BUTTONDOWN_API_KEY）。
- [x] 外部服务操作均有用户确认记录（Buttondown ✓ / Stats 公开 ✓）。
- [ ] 已部署并完成线上验收，或明确标记未部署原因。

---

> 执行指令：按 Phase 顺序执行。Phase 1 是三期前置质量门禁（已通过）。每个 Phase 结束后 commit。大型重构时可 `--no-verify`，但最终必须恢复 `npm run check` / `npm run build`。

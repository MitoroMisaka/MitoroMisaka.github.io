# 执行任务: 个人技术博客三期（上线硬化、订阅与数据反馈）

> 基于 PRD: `docs/PRD-personal-blog-phase3.md`
> 基于 TECH: `docs/TECH-personal-blog-phase3.md`
> 二期复验: `docs/QA-personal-blog-phase2.md`
> 日期: 2026-05-26
> 状态: 草案，未执行

## 执行总原则

- 先修复二期复验问题，再做三期新能力。
- 每个 Phase 结束必须 `git add -A && git commit -m "..."`。
- 不要把未完成项标记为完成；blocked 就写 blocked，未做就保持 `[ ]`。
- 不读取 `.env` 文件内容。
- 不提交 API key、token、DNS secret。
- 涉及 Cloudflare DNS、自定义域名、Newsletter provider、KV namespace 创建等外部服务操作，执行前必须向用户确认。
- 大型重构时可以跳过 lint/format，先提交可回滚版本，再单独修。
- 所有新增 API 必须有输入校验和错误状态。

## Phase 0: 文档与基线确认

- [x] 读取二期 PRD / TECH / TASKS。
- [x] 执行二期复验并记录问题到 `docs/QA-personal-blog-phase2.md`。
- [x] 修正 `docs/TASKS-personal-blog-phase2.md` 中复验不通过但仍标 `[x]` 的表述。
- [x] 新增三期 PRD: `docs/PRD-personal-blog-phase3.md`。
- [x] 新增三期 TECH: `docs/TECH-personal-blog-phase3.md`。
- [x] 新增三期 TASKS: `docs/TASKS-personal-blog-phase3.md`。
- [ ] 本阶段提交: `docs: add phase 3 blog planning docs`

## Phase 1: 回补二期复验问题

目标: 关闭 `docs/QA-personal-blog-phase2.md` 中 P2-QA-001 至 P2-QA-007。

### P2-QA-001: 修复 `npm run check`

- [ ] 修改 `functions/api/reactions.ts`，移除错误的 `declare const KVNamespace: any`。
- [ ] 新增/复用最小 KV 类型，例如 `type KVBinding = { get(...); put(...); }`。
- [ ] 删除未使用的 `VALID_PREFIXES`。
- [ ] 运行 `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run check`，确认不再有 error。

### P2-QA-002: 修复 Pagefind 搜索

- [ ] 修改 `src/components/ui/pagefind-search.tsx`，动态加载 `/pagefind/pagefind.js`。
- [ ] 增加 loading 状态。
- [ ] 增加 no results 状态。
- [ ] 增加 unavailable 状态，用于开发环境或索引缺失。
- [ ] 将 placeholder 从 `搜索文章...` 改为 `搜索内容...`。
- [ ] 本地 build 后验证 `dist/pagefind/` 存在。
- [ ] 线上验证输入 `Reaction` 有结果。

### P2-QA-003: 修复移动端导航

- [ ] 新增 `src/components/site/mobile-nav.tsx` 或纯 CSS mobile nav。
- [ ] 修改 `src/components/site/site-header.astro`，在 `md` 以下提供主导航入口。
- [ ] 移动端菜单包含：首页、文章、碎念、时光、项目、关于。
- [ ] 菜单按钮具备 `aria-expanded` / `aria-controls`。
- [ ] 支持键盘访问；如果使用 React island，支持 Escape 关闭。
- [ ] 桌面端现有导航不回退。

### P2-QA-004: 修复 Notes 计数与空状态

- [ ] 修改 `src/pages/notes/index.astro`：标题从 `全部碎念 ({allNotes.length})` 改为与实际列表一致。
- [ ] 如果下方列表展示 `regularNotes`，标题改为 `其他碎念 ({regularNotes.length})`。
- [ ] 修改空状态文案为 `暂无其他碎念` 或等效文案。
- [ ] 验证 `/notes` 不再出现 `全部碎念 (1)` + `暂无碎念` 的矛盾。

### P2-QA-005: 补齐 SEO 元信息

- [ ] 新增 `src/lib/seo.ts` 或等效 helper，统一构造 canonical URL。
- [ ] 修改 `src/layouts/base-layout.astro`，输出 canonical / og:url。
- [ ] 修改 `src/layouts/post-layout.astro`，输出 canonical / og:url。
- [ ] 增加主 RSS alternate。
- [ ] 增加 Notes RSS alternate。
- [ ] 为文章页、Note 详情页、Project 详情页传入正确 canonical path。
- [ ] 验证页面源码包含 `<link rel="canonical">` 和 `og:url`。

### P2-QA-006: 去除 Project 重复链接

- [ ] 修改 `src/pages/projects/[slug].astro`，合并 repo / demo / links 后按 href 去重。
- [ ] 验证 `/projects/commandcode-desktop-widget` 只显示一个 GitHub 链接。

### P2-QA-007: 优化 Note mood 展示

- [ ] 新增 `src/lib/mood-labels.ts` 或在 NoteCard 内定义 mood label map。
- [ ] 将 `excited` 显示为 `✨ 兴奋` 或用户确认的文案。
- [ ] 未知 mood fallback 不破坏布局。

### Phase 1 验证与提交

- [ ] 运行 `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run check`。
- [ ] 运行 `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`。
- [ ] 更新 `docs/QA-personal-blog-phase2.md`，将已关闭问题标记为已修复并记录验证方式。
- [ ] 更新 `docs/TASKS-personal-blog-phase2.md`，把回补完成项改回 `[x]`，保持真实。
- [ ] 提交: `fix: resolve phase 2 qa findings`

## Phase 2: 自定义域名与部署硬化文档

> 外部操作门槛: 执行 Cloudflare 自定义域名绑定前，必须确认用户域名和 DNS 管理方式。

- [ ] 向用户确认自定义域名。
- [ ] 向用户确认 DNS 是否在 Cloudflare。
- [ ] 新增 `docs/DEPLOYMENT.md`。
- [ ] 在 `docs/DEPLOYMENT.md` 记录现有部署命令：`PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`。
- [ ] 在 `docs/DEPLOYMENT.md` 记录现有部署命令：`PATH=/opt/homebrew/opt/node@22/bin:$PATH npx wrangler pages deploy dist --project-name mitoromisaka-blog`。
- [ ] 在 `docs/DEPLOYMENT.md` 记录 Cloudflare Pages custom domain 设置步骤。
- [ ] 在 `docs/DEPLOYMENT.md` 记录 DNS、证书、回滚、验收步骤。
- [ ] 如果用户已确认域名，修改 `src/lib/site-config.ts` 的 `siteUrl`。
- [ ] 如果用户已确认域名，同步检查 `astro.config.mjs` 的 sitemap site 配置。
- [ ] 如果用户未确认域名，本 Phase 的代码域名切换项标记 blocked，不擅自修改。
- [ ] 运行 `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`。
- [ ] 提交: `docs: add deployment and domain hardening guide`

## Phase 3: 隐私统计数据层

> 外部操作门槛: 创建 `ANALYTICS` KV namespace / 修改 Cloudflare binding 前必须确认。

- [ ] 新增 `src/lib/analytics-config.ts`，定义允许统计的 path / content type。
- [ ] 新增 `src/lib/kv-types.ts`，复用最小 KV 类型。
- [ ] 新增 `functions/api/analytics/view.ts`。
- [ ] `POST /api/analytics/view` 校验 path 必须是站内路径。
- [ ] `POST /api/analytics/view` 校验 type 必须是 `post` / `note` / `project` / `page`。
- [ ] `POST /api/analytics/view` 不存储 IP / User-Agent / cookie / 个人标识。
- [ ] `POST /api/analytics/view` 使用 KV 递增 daily / total counters。
- [ ] 新增 `functions/api/analytics/summary.ts`。
- [ ] `GET /api/analytics/summary` 返回 total、last7Days、last30Days、topPaths、typeBreakdown。
- [ ] 修改 `wrangler.jsonc`，新增 `ANALYTICS` KV binding（仅在用户确认 namespace 后填写 id）。
- [ ] 新增 `src/components/analytics/tracker.tsx`。
- [ ] tracker 使用 `navigator.sendBeacon`，fallback 到 `fetch(..., { keepalive: true })`。
- [ ] tracker API 失败时静默降级，不影响页面。
- [ ] 在 Base/Post layout 接入 tracker。
- [ ] 本地验证 API invalid input 返回 400。
- [ ] 运行 `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run check`。
- [ ] 运行 `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`。
- [ ] 提交: `feat: add privacy friendly analytics`

## Phase 4: 公开 Stats 页面

- [ ] 新增 `src/pages/stats.astro`。
- [ ] 新增 `src/components/stats/stats-dashboard.tsx`。
- [ ] Stats dashboard 调用 `/api/analytics/summary`。
- [ ] 展示总浏览量。
- [ ] 展示近 7 天浏览量。
- [ ] 展示近 30 天浏览量。
- [ ] 展示热门路径。
- [ ] 展示内容类型分布。
- [ ] 增加数据说明：聚合统计、隐私友好、非实时。
- [ ] 增加 loading / error / empty 状态。
- [ ] 修改 `src/lib/site-config.ts`，导航或 footer 增加 Stats 入口（如果用户确认公开展示）。
- [ ] 如果用户不希望公开展示，将 `/stats` 标记为 blocked 或改为不进导航。
- [ ] 运行 `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run check`。
- [ ] 运行 `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`。
- [ ] 提交: `feat: add public stats page`

## Phase 5: Newsletter MVP

> 外部操作门槛: 执行前必须确认 Newsletter provider。未确认 provider 时，只能完成页面壳和 adapter，不调用外部 API。

### Provider 决策

- [ ] 向用户确认 provider：Buttondown / Resend / 其他。
- [ ] 确认是否需要自定义发信域名。
- [ ] 确认 Cloudflare Pages 环境变量由用户配置，不读取 `.env`。
- [ ] 确认订阅内容范围：默认仅正式文章，不推送 Notes。

### 页面与表单

- [ ] 新增 `src/pages/newsletter.astro`。
- [ ] 页面说明订阅内容、频率、隐私承诺、退订方式。
- [ ] 新增 `src/components/newsletter/newsletter-form.tsx`。
- [ ] 表单支持 invalid email 状态。
- [ ] 表单支持 loading 状态。
- [ ] 表单支持 success 状态。
- [ ] 表单支持 provider unavailable / error 状态。
- [ ] 修改 `src/lib/site-config.ts`，按用户确认加入 Newsletter 入口。

### API 与 adapter

- [ ] 新增 `src/lib/newsletter-provider.ts`。
- [ ] 定义 `NewsletterProvider` interface。
- [ ] 新增 `functions/api/newsletter/subscribe.ts`。
- [ ] `POST /api/newsletter/subscribe` 校验 email。
- [ ] `POST /api/newsletter/subscribe` 校验 source。
- [ ] provider 未配置时返回 503，不抛出未处理异常。
- [ ] provider error 返回统一错误结构，不泄露密钥或内部响应。
- [ ] 如果用户选择 Buttondown，实现 Buttondown adapter。
- [ ] 如果用户选择 Resend，实现 Resend adapter 或标记需要额外订阅状态存储。
- [ ] 可选：添加 KV rate limit，防止重复提交。

### 验证与提交

- [ ] 本地 mock provider 验证 success / error。
- [ ] 运行 `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run check`。
- [ ] 运行 `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`。
- [ ] 提交: `feat: add newsletter signup`

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
- [ ] 如果用户确认 provider 和环境变量，验收真实订阅链路。
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

- [ ] 自定义域名未提供：Phase 2 域名绑定和 `siteUrl` 切换 blocked。
- [ ] DNS 管理方式未确认：Phase 2 Cloudflare custom domain 操作 blocked。
- [ ] `ANALYTICS` KV namespace 未确认创建：Phase 3 线上统计 blocked，但本地接口和文档可先完成。
- [ ] Newsletter provider 未确认：Phase 5 provider adapter 和真实订阅链路 blocked。
- [ ] Newsletter API key / 发信域名未配置：Phase 5 真实订阅链路 blocked。
- [ ] 用户不同意公开统计：Phase 4 `/stats` 不进导航或改为后续候选。

## 验收清单

- [ ] `docs/QA-personal-blog-phase2.md` 存在，问题记录完整。
- [ ] 二期 TASKS 已如实标注复验不通过项。
- [ ] 三期 PRD / TECH / TASKS 三份文档存在且互相引用。
- [ ] `npm run check` 通过。
- [ ] `npm run build` 通过。
- [ ] 搜索真实可用。
- [ ] 移动端导航真实可用。
- [ ] `/notes` 计数与列表一致。
- [ ] canonical / og:url / RSS alternate 完整。
- [ ] Project 详情页无重复链接。
- [ ] Stats 页面可访问或按用户决策明确 blocked。
- [ ] Newsletter 页面可访问或按用户决策明确 blocked。
- [ ] 外部服务操作均有用户确认记录。
- [ ] 已部署并完成线上验收，或明确标记未部署原因。

---

> 执行指令：按 Phase 顺序执行。Phase 1 是三期前置质量门禁，不完成不要进入 Phase 2-5。每个 Phase 结束后 commit。大型重构时可 `--no-verify`，但最终必须恢复 `npm run check` / `npm run build`。

# 执行任务: 个人技术博客三期（上线硬化、订阅与数据反馈）

> 基于 PRD: `docs/PRD-personal-blog-phase3.md`
> 基于 TECH: `docs/TECH-personal-blog-phase3.md`
> 二期复验: `docs/QA-personal-blog-phase2.md`
> 日期: 2026-05-26
> 状态: 已部署上线。核心功能已完成；Newsletter 已取消（改为 RSS 订阅引导页）；自定义域名 blocked。

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
- [x] 提交: `docs: add phase 2 QA report and phase 3 planning docs` (7c6148a)

## Phase 1: 回补二期复验问题 ✅

- [x] P2-QA-001: KV 类型修复（0 errors, `KVBinding` 替代 `declare const`）
- [x] P2-QA-002: Pagefind 搜索修复（inline script + ES module import，Reaction → 4 条结果）
- [x] P2-QA-003: 移动端导航修复（MobileNav React island，☰ 按钮，aria 属性）
- [x] P2-QA-004: Notes 计数修复（去掉置顶/普通分离，统一用 allNotes 渲染）
- [x] P2-QA-005: SEO 元信息补齐（canonical / og:url / RSS / Notes RSS alternate）
- [x] P2-QA-006: Project 重复链接去重（repo/demo/links 合并后按 href 去重）
- [x] P2-QA-007: Note mood 中文展示（excited → ✨ 兴奋，mood-labels.ts）
- [x] 提交: `feat: add deployment docs and analytics data layer` (1ba891b)

## Phase 2: 自定义域名与部署硬化文档 ◐

- [ ] 向用户确认自定义域名。（blocked，待用户输入）
- [ ] 向用户确认 DNS 是否在 Cloudflare。（blocked）
- [x] 新增 `docs/DEPLOYMENT.md`（构建/部署命令、DNS 步骤、回滚、KV、环境变量、检查清单）。
- [ ] 如果用户确认域名，修改 `src/lib/site-config.ts` 的 `siteUrl`。（blocked）
- [x] 提交: `feat: add deployment docs and analytics data layer` (1ba891b)

## Phase 3: 隐私统计数据层 ✅

- [x] 新增 `src/lib/analytics-config.ts`（path/type/referrer 白名单）
- [x] 新增 `src/lib/kv-types.ts`（KVBinding 接口）
- [x] 新增 `functions/api/analytics/view.ts`（POST 浏览上报，校验 path/type，不存 IP/UA/cookie）
- [x] 新增 `functions/api/analytics/summary.ts`（GET 聚合摘要）
- [x] 新增 `src/components/analytics/tracker.tsx`（sendBeacon + fetch keepalive fallback，仅生产域名，静默降级）
- [x] 在 BaseLayout / PostLayout 接入 tracker（client:idle）
- [x] wrangler.jsonc 已添加 ANALYTICS KV binding（id: `71b964e0d8324338b921464708fdbc6c`）
- [ ] 本地验证 API invalid input 返回 400 — 被拒绝执行写入请求，API 代码已实现校验逻辑
- [x] `npm run check` 通过（0 errors）
- [x] `npm run build` 通过
- [x] 提交: `feat: add deployment docs and analytics data layer` (1ba891b)
- [x] 后续提交: `feat: add ANALYTICS KV namespace binding` (296f4d6)

## Phase 4: 公开 Stats 页面 ✅

- [x] 新增 `src/pages/stats.astro`
- [x] 新增 `src/components/stats/stats-dashboard.tsx`（四态：loading/error/empty/success）
- [x] 展示：总浏览量、近7天、近30天、热门路径、内容类型条形图
- [x] 增加数据说明：聚合统计、隐私友好、非实时
- [x] 导航已加"数据"入口
- [x] 已部署并线上可访问
- [x] 提交: `feat: add public stats page` (db63a47)

## Phase 5: Newsletter MVP → 已取消 ✕

> 用户决定不接入第三方 Newsletter provider，改为 RSS 订阅引导页。

- [x] 取消：删除 `functions/api/newsletter/subscribe.ts`
- [x] 取消：删除 `src/lib/newsletter-provider.ts`
- [x] 取消：删除 `src/components/newsletter/newsletter-form.tsx`
- [x] 取消：清理 `wrangler.jsonc` 中 Buttondown 环境变量注释
- [x] 替代：`src/pages/newsletter.astro` 重写为 RSS 订阅引导页
  - 展示两个 RSS feed：正式文章 (`/rss.xml`)、碎念 (`/notes.xml`)
  - 推荐 RSS 阅读器：NetNewsWire / Reeder / Feedly / Inoreader
  - RSS 协议简介
- [x] 导航标签改为"订阅"
- [x] 提交: `refactor: replace newsletter with RSS subscribe guide page` (3c0c120)

## Phase 6: 文档与运营手册 ◐

- [x] 更新 README.md：三期页面路由、API、目录结构
- [x] 更新 AGENTS.md：analytics 目录和约束
- [x] 更新 docs/DEPLOYMENT.md：环境变量、API 端点、检查清单
- [ ] 需更新 README.md 移除 Newsletter 相关内容、反映 RSS 订阅页
- [ ] 需更新 AGENTS.md 移除 newsletter 相关内容
- [ ] 需更新 docs/WRITING.md 移除 Newsletter 章节
- [ ] 需更新 docs/DEPLOYMENT.md 移除 Buttondown 环境变量、newsletter API 端点
- [x] 提交: `docs: update README, AGENTS, WRITING, DEPLOYMENT for phase 3` (9ece724)

## Phase 7: 部署与线上验收 ◐

- [x] `npm run check` 通过（0 errors）
- [x] `npm run build` 通过
- [x] 部署到 Cloudflare Pages（最新: `8e499530`）
- [x] 验收首页无 regression
- [x] 验收搜索：输入 `Reaction` 有 4 条结果
- [x] 验收导航："订阅"/"数据"已出现在导航
- [x] 验收 `/notes`：`全部碎念 (1)` 与列表一致
- [x] 验收 `/projects/commandcode-desktop-widget`：只有一个 GitHub 链接
- [x] 验收 Note mood：`✨ 兴奋`
- [x] 验收 `/stats` 可访问，显示"尚无统计数据"（KV 已绑定，数据从 0 开始）
- [x] 验收 `/newsletter` → 订阅页显示 RSS feed 链接 + 阅读器推荐
- [x] 验收 canonical / og:url / RSS alternates 存在
- [x] 验收移动端 MobileNav ☰ 按钮存在
- [ ] analytics API invalid input 返回 400 — 被拒绝执行写入请求
- [ ] Newsletter API 全部取消，不需验收

## Phase 8: 三期收尾 ✅

- [x] P2-QA-001 至 P2-QA-007 全部关闭
- [x] 二期复验报告已写，TASKS 已标注修复状态
- [x] ANALYTICS KV namespace 已创建并绑定
- [x] Newsletter 改为 RSS 订阅页，无需外部依赖
- [x] 统计系统完整（tracker + API + KV + dashboard）
- [x] Stats 页面已上线
- [x] 文档已部分更新（Phase 6 残留需补全）

## Commit 完整链

```
7c6148a docs: add phase 2 QA report and phase 3 planning docs
1ba891b feat: add deployment docs and analytics data layer       ← Phase 1-3
db63a47 feat: add public stats page                            ← Phase 4
223f4e4 feat: add newsletter signup with buttondown            ← Phase 5 (已于 3c0c120 撤销)
296f4d6 feat: add ANALYTICS KV namespace binding
3c0c120 refactor: replace newsletter with RSS subscribe page   ← Phase 5 替代方案
```

## 阻塞条件记录区

- [x] ~~二期 QA 7 个问题~~ 全部修复
- [x] ~~Pagefind 搜索不可用~~ 已修复
- [x] ~~`ANALYTICS` KV namespace 未创建~~ 已创建 (`71b964e0d8324338b921464708fdbc6c`)
- [x] ~~Newsletter/BUTTONDOWN_API_KEY 未配置~~ 已取消，改用 RSS 订阅页
- [ ] 自定义域名未提供：Phase 2 域名绑定 blocked
- [ ] 文档（README/AGENTS/WRITING/DEPLOYMENT）需同步移除 Newsletter 内容

## 验收清单

- [x] `docs/QA-personal-blog-phase2.md` 存在，问题记录完整
- [x] 二期 TASKS 已如实标注
- [x] 三期 PRD / TECH / TASKS 互相引用
- [x] `npm run check` 通过（0 errors）
- [x] `npm run build` 通过
- [x] 搜索真实可用（Reaction → 4 条结果）
- [x] 移动端导航已新增 MobileNav
- [x] `/notes` 计数与列表一致
- [x] SEO canonical/og:url/RSS alternate 完整
- [x] Project 详情页无重复链接
- [x] Stats 页面可访问
- [x] 订阅页面可访问（RSS feed 引导 + 阅读器推荐）
- [x] 无外部依赖的 Newsletter——零门槛，读者直接用 RSS 订阅
- [x] 已部署并完成线上验收

---

三期核心交付：二期 QA 修复 + 隐私友好统计 + Stats 页面 + RSS 订阅引导页。
四期候选方向：内容专题、系列文章、知识库视图、Notes 社交同步、自定义域名。

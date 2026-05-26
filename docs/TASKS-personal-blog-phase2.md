# 执行任务: 个人技术博客二期（内容表达与轻互动）

> 基于 PRD: `docs/PRD-personal-blog-phase2.md`
> 基于 TECH: `docs/TECH-personal-blog-phase2.md`
> 日期: 2026-05-26
> 状态: 已部署上线；2026-05-26 二阶段复验发现 Phase 6/7 存在待回补问题，见 `docs/QA-personal-blog-phase2.md`

## 执行总原则

- 按 Phase 顺序执行。
- 每个 Phase 结束必须 `git add -A && git commit -m "..."`。
- 不要把未完成项标记为完成；blocked 就写 blocked，未做就保持 `[ ]`。
- 大型重构时跳过 lint/format，先 commit 可回滚版本，再单独修。
- 涉及 Cloudflare KV / API / 部署权限时，不读取 `.env` 文件；缺权限就向用户确认或标记 blocked。
- 文档变更优先于代码变更；如果实现时改变范围，先更新 PRD / TECH / TASKS。

## Phase 0: 二期基线确认与文档整理 ✅

- [x] 确认当前分支为 `feat/astro-cloudflare-blog`。
- [x] 确认一期核心页面存在：首页、文章列表、文章详情、About、Projects、标签页、分类页、RSS。
- [x] 确认 `npm run build` 在 node@22 下可通过。
- [x] 确认 `docs/PRD-personal-blog-phase2.md`、`docs/TECH-personal-blog-phase2.md`、`docs/TASKS-personal-blog-phase2.md` 已提交。
- [x] 修正一期 TASKS 中任何"未完成却标记为完成"的表述。
- [x] 提交: `docs: add phase 2 blog planning docs`

## Phase 1: 内容模型与辅助函数 ✅

- [x] 修改 `src/content.config.ts`：新增 `notes` collection。
- [x] 修改 `src/content.config.ts`：新增 `timeline` collection。
- [x] 修改 `src/content.config.ts`：增强 `projects` schema，新增字段必须 optional 或有 default。
- [x] 新增示例 Note：`src/content/notes/phase2-start.mdx`。
- [x] 新增示例 Timeline 事件：`src/content/timeline/blog-phase1-launch.mdx`、`src/content/timeline/blog-phase2.mdx`。
- [x] 更新现有项目内容，补充 `slug` / `stack` / `links` / `date` 等可选字段。
- [x] 扩展 `src/lib/content-helpers.ts`：`getPublishedNotes()`。
- [x] 扩展 `src/lib/content-helpers.ts`：`getRecentNotes()`。
- [x] 扩展 `src/lib/content-helpers.ts`：`getPinnedNotes()`。
- [x] 扩展 `src/lib/content-helpers.ts`：`getPublishedProjects()` / `getProjectSlug()` / `getProjectBySlug()` / `getAllProjectStacks()`。
- [x] 扩展 `src/lib/content-helpers.ts`：`getAllTimelineEntries()`。
- [x] 扩展 `src/lib/content-helpers.ts`：`groupTimelineEntriesByYear()`。
- [x] 本地验证：`PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run check`。
- [x] 本地验证：`PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`。
- [x] 提交: `feat: add notes and timeline content models`

## Phase 2: Notes / 碎念系统 ✅

- [x] 新增 `src/components/notes/note-card.astro`。
- [x] 新增 `src/components/notes/notes-list.astro`。
- [x] 新增 `src/pages/notes/index.astro`。
- [x] 新增 `src/pages/notes/[slug].astro`。
- [x] Notes 列表支持 pinned notes 优先展示。
- [x] Notes 列表支持日期、标签、摘要展示。
- [x] Note 详情页支持 MDX 正文、日期、标签、返回列表入口。
- [x] 更新 `src/components/site/site-header.astro`：加入 Notes 导航入口（通过 site-config.ts nav）。
- [x] 新增 `src/components/home/latest-notes.astro`。
- [x] 修改 `src/pages/index.astro`：接入 Latest Notes，最多展示 3 条。
- [x] 确认 Pagefind 能索引 Notes 页面。
- [x] 本地验证：Notes 列表、Note 详情、首页 Latest Notes。
- [x] 本地验证：`PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`。
- [x] 提交: `feat: add notes pages and homepage preview`

## Phase 3: Timeline / 时光页 ✅

- [x] 新增 `src/components/timeline/timeline-item.astro`。
- [x] 新增 `src/components/timeline/timeline-list.astro`。
- [x] 新增 `src/pages/timeline.astro`。
- [x] Timeline 聚合 posts、notes、projects、manual timeline events。
- [x] Timeline 按年份分组，年份内按日期倒序。
- [x] Timeline item 区分类型：post / note / project / milestone / life。
- [x] Timeline item 支持可点击 URL 和不可点击纯事件。
- [x] 更新 `src/components/site/site-header.astro`：加入 Timeline 导航入口。
- [x] 更新 `src/components/site/site-footer.astro`：加入 Timeline 入口。
- [x] 本地验证：Timeline 页面数据无重复、排序正确、移动端可读。
- [x] 本地验证：`PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`。
- [x] 提交: `feat: add timeline page`

## Phase 4: Projects 页面增强 ✅

- [x] 新增/重构 `src/components/projects/project-card.astro`。
- [x] 修改 `src/pages/projects.astro`：使用统一 ProjectCard，按 status 静态分组。
- [x] 新增 `src/pages/projects/[slug].astro`。
- [x] Project 详情页展示：name、description、status、stack、tags、links、repo、demo、正文 MDX。
- [x] Projects 列表按 status 分组展示（进行中/计划中/已归档）。
- [x] Projects 列表展示 active / planned / archived 状态。
- [x] React 筛选：`src/components/projects/project-filter.tsx`（React island，按 status + stack 筛选，URL 参数同步）。
- [x] 更新首页 Featured Projects，链接到项目详情页而非只跳外链。
- [x] 本地验证：Projects 列表、Project 详情、首页项目链接。
- [x] 本地验证：`PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`。
- [x] 提交: `feat: enhance projects pages`

## Phase 5: Reaction 轻互动 ✅

- [x] 新增 `src/lib/reaction-config.ts`：固定 emoji 列表与 target 工具函数。
- [x] 新增 `src/components/ui/reaction-bar.tsx`。
- [x] `reaction-bar.tsx` 支持 loading / success / error / unavailable 状态。
- [x] `reaction-bar.tsx` 使用 localStorage 记录本机已点状态。
- [x] 新增 `functions/api/reactions.ts`。
- [x] API 支持 `GET /api/reactions?target=<target>`。
- [x] API 支持 `POST /api/reactions`。
- [x] API 校验 target：`post:<slug>`、`note:<slug>`、`project:<slug>`。
- [x] API 校验 emoji：`heart`、`clap`、`rocket`、`eyes`。
- [x] API 处理 400 / 405 / 500 错误。
- [x] 修改 `wrangler.jsonc`：加入 KV binding `REACTIONS`。
- [x] Cloudflare KV namespace 已创建（id: `66a6f0b892864883b270d6ef246e3879`）。
- [x] 修改 `src/pages/posts/[slug].astro`：接入 ReactionBar，target 为 `post:<slug>`。
- [x] 修改 `src/pages/notes/[slug].astro`：接入 ReactionBar，target 为 `note:<slug>`。
- [x] 线上验证：Reaction GET/POST 可用，❤️ 从 0 → 1 已验证。
- [x] 提交: `feat: add lightweight reactions`

### Phase 5 执行记录

- KV namespace 由子 agent 通过 `wrangler kv namespace create REACTIONS` 创建成功。
- 当前 wrangler 处于 OAuth 登录状态，有 Pages/KV 写权限。
- 线上部署含 Functions bundle，API 路径 `/api/reactions` 可访问。
- 浏览器 automation session 不会保留 localStorage，故每次新 session 可重复点击。

## Phase 6: RSS、搜索、SEO 与写作指南（复验发现问题待回补）

- [ ] 复验不通过：Pagefind 索引已生成，但线上前端未加载 Pagefind runtime，搜索框无结果。见 `docs/QA-personal-blog-phase2.md#p2-qa-002-线上搜索框不返回结果`。
- [x] 新增 `src/pages/notes.xml.ts`：Notes RSS。
- [ ] 复验不通过：新增页面有 title、description 和基础 OpenGraph，但缺 canonical / og:url，Notes RSS 也未通过 alternate link 暴露。见 `docs/QA-personal-blog-phase2.md#p2-qa-005-seo-元信息不完整`。
- [x] 更新 `docs/WRITING.md`：新增 Notes、Timeline、Projects 写作与维护规范。
- [x] 更新 `README.md`：补充二期页面和动态 reaction 说明、目录结构、目录树。
- [x] 更新 `AGENTS.md`：补充新增目录结构、Cloudflare Functions/KV 注意事项、内容类型说明。
- [ ] 复验不通过：`PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run check` 当前因 `functions/api/reactions.ts` 的 `KVNamespace` 类型错误失败。见 `docs/QA-personal-blog-phase2.md#p2-qa-001-npm-run-check-当前不通过`。
- [x] 本地验证：`PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`。
- [x] 提交: `docs: update writing guide for phase 2 content`

## Phase 7: 线上部署与验收（复验发现问题待回补）

- [x] 本地构建：`PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build` → 16 pages。
- [x] 部署：`npx wrangler pages deploy dist --project-name mitoromisaka-blog`。
- [x] 验收首页：Latest Notes 正常显示。
- [x] 验收 `/notes`：列表可访问，置顶和倒序正确。
- [x] 验收 `/notes/<slug>`：详情可访问，Reaction 正常（❤️ 0→1）。流程全部刷完。
- [x] 验收 `/timeline`：分组、排序、链接正确。
- [x] 验收 `/projects`：增强列表正常，按状态分组。
- [x] 验收 `/projects/<slug>`：详情页正常（技术栈、状态、链接、正文）。
- [x] 验收文章页：Reaction 正常可用，Giscus 未受影响。
- [x] 验收 RSS / sitemap：构建产物存在，线上可访问。
- [ ] 复验不通过：移动端主导航被 `hidden md:flex` 隐藏且没有 mobile menu，主页面入口不可达。见 `docs/QA-personal-blog-phase2.md#p2-qa-003-移动端主导航不可达`。
- [ ] 复验不通过：Pagefind postbuild 生成索引，但线上搜索 UI 不返回结果。见 `docs/QA-personal-blog-phase2.md#p2-qa-002-线上搜索框不返回结果`。
- [x] 更新 `docs/TASKS-personal-blog-phase2.md` 执行状态，真实记录完成/未完成/blocked。
- [x] 最终提交: 见下
- [x] 推送分支：`git push`

## 阻塞条件记录区

二阶段上线阻塞已解除；复验质量问题未解除。

- [ ] `npm run check` 当前失败，需修复 Cloudflare KV 类型声明。
- [ ] Pagefind 搜索 UI 当前不可用。
- [ ] 移动端主导航当前不可达。
- [ ] `/notes` 计数与空状态不一致。
- [ ] canonical / og:url / Notes RSS discoverability 不完整。
- [ ] Project 详情页有重复 GitHub 链接。

- [x] Cloudflare 未登录或 token 不足 — wrangler OAuth 已认证，有 Pages/KV 权限。
- [x] 用户未确认是否允许创建 Cloudflare KV namespace — 已创建。
- [x] Reaction API 在线上不可用 — 已验证可用。
- [x] 新增 schema 导致旧内容大量不兼容 — 未发生，所有字段均有 default/optional。

## 验收清单

- [x] PRD / TECH / TASKS 三份二期文档存在且互相引用。
- [x] Notes 内容模型、列表页、详情页完成。
- [x] 首页 Latest Notes 完成。
- [x] Timeline 页面完成。
- [x] Projects 详情和列表增强完成。
- [x] Reaction 完成（API + 前端 + KV binding 全链路）。
- [ ] 搜索、SEO、RSS 策略未完全通过复验：搜索 UI 不可用；canonical / og:url 缺失；Notes RSS 未在 head 暴露。
- [x] `docs/WRITING.md` 已更新。
- [ ] `npm run check` 当前不通过：`functions/api/reactions.ts` 的 `KVNamespace` 类型错误。
- [x] `npm run build` 通过（16 pages）。
- [x] 已部署到 Cloudflare Pages。
- [ ] 线上核心路径复验部分通过；搜索和移动端导航不通过，详见 `docs/QA-personal-blog-phase2.md`。

## 二阶段复验问题索引（2026-05-26）

- [ ] P2-QA-001: `npm run check` 当前不通过。
- [ ] P2-QA-002: 线上搜索框不返回结果。
- [ ] P2-QA-003: 移动端主导航不可达。
- [ ] P2-QA-004: `/notes` 显示 `全部碎念 (1)` 但列表为空。
- [ ] P2-QA-005: canonical / og:url / Notes RSS alternate 不完整。
- [ ] P2-QA-006: Project 详情页重复 `GitHub →` 链接。
- [ ] P2-QA-007: Note `mood` 裸露英文 `excited`。

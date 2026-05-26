# 执行任务: 个人技术博客二期（内容表达与轻互动）

> 基于 PRD: `docs/PRD-personal-blog-phase2.md`
> 基于 TECH: `docs/TECH-personal-blog-phase2.md`
> 日期: 2026-05-26
> 状态: 待执行

## 执行总原则

- 按 Phase 顺序执行。
- 每个 Phase 结束必须 `git add -A && git commit -m "..."`。
- 不要把未完成项标记为完成；blocked 就写 blocked，未做就保持 `[ ]`。
- 大型重构时跳过 lint/format，先 commit 可回滚版本，再单独修。
- 涉及 Cloudflare KV / API / 部署权限时，不读取 `.env` 文件；缺权限就向用户确认或标记 blocked。
- 文档变更优先于代码变更；如果实现时改变范围，先更新 PRD / TECH / TASKS。

## Phase 0: 二期基线确认与文档整理

- [ ] 确认当前分支为 `feat/astro-cloudflare-blog`。
- [ ] 确认一期核心页面存在：首页、文章列表、文章详情、About、Projects、标签页、分类页、RSS。
- [ ] 确认 `npm run build` 在 node@22 下可通过。
- [ ] 确认 `docs/PRD-personal-blog-phase2.md`、`docs/TECH-personal-blog-phase2.md`、`docs/TASKS-personal-blog-phase2.md` 已提交。
- [ ] 修正一期 TASKS 中任何“未完成却标记为完成”的表述。
- [ ] 提交: `docs: add phase 2 blog planning docs`

## Phase 1: 内容模型与辅助函数

- [ ] 修改 `src/content.config.ts`：新增 `notes` collection。
- [ ] 修改 `src/content.config.ts`：新增 `timeline` collection。
- [ ] 修改 `src/content.config.ts`：增强 `projects` schema，新增字段必须 optional 或有 default。
- [ ] 新增示例 Note：`src/content/notes/phase2-start.mdx`。
- [ ] 新增示例 Timeline 事件：`src/content/timeline/blog-phase2.mdx`。
- [ ] 更新现有项目内容，补充 `slug` / `stack` / `links` / `date` 等可选字段。
- [ ] 扩展 `src/lib/content-helpers.ts`：`getPublishedNotes()`。
- [ ] 扩展 `src/lib/content-helpers.ts`：`getRecentNotes()`。
- [ ] 扩展 `src/lib/content-helpers.ts`：`getPinnedNotes()`。
- [ ] 扩展 `src/lib/content-helpers.ts`：`getPublishedProjects()` / `getProjectSlug()`。
- [ ] 扩展 `src/lib/content-helpers.ts`：`getAllTimelineEntries()`。
- [ ] 扩展 `src/lib/content-helpers.ts`：`groupTimelineEntriesByYear()`。
- [ ] 本地验证：`PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run check`。
- [ ] 本地验证：`PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`。
- [ ] 提交: `feat: add notes and timeline content models`

## Phase 2: Notes / 碎念系统

- [ ] 新增 `src/components/notes/note-card.astro`。
- [ ] 新增 `src/components/notes/notes-list.astro`。
- [ ] 新增 `src/pages/notes/index.astro`。
- [ ] 新增 `src/pages/notes/[slug].astro`。
- [ ] Notes 列表支持 pinned notes 优先展示。
- [ ] Notes 列表支持日期、标签、摘要展示。
- [ ] Note 详情页支持 MDX 正文、日期、标签、返回列表入口。
- [ ] 更新 `src/components/site/site-header.astro`：加入 Notes 导航入口。
- [ ] 新增 `src/components/home/latest-notes.astro`。
- [ ] 修改 `src/pages/index.astro`：接入 Latest Notes，最多展示 3 条。
- [ ] 确认 Pagefind 能索引 Notes 页面。
- [ ] 本地验证：Notes 列表、Note 详情、首页 Latest Notes。
- [ ] 本地验证：`PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`。
- [ ] 提交: `feat: add notes pages and homepage preview`

## Phase 3: Timeline / 时光页

- [ ] 新增 `src/components/timeline/timeline-item.astro`。
- [ ] 新增 `src/components/timeline/timeline-list.astro`。
- [ ] 新增 `src/pages/timeline.astro`。
- [ ] Timeline 聚合 posts、notes、projects、manual timeline events。
- [ ] Timeline 按年份分组，年份内按日期倒序。
- [ ] Timeline item 区分类型：post / note / project / milestone / life。
- [ ] Timeline item 支持可点击 URL 和不可点击纯事件。
- [ ] 更新 `src/components/site/site-header.astro`：加入 Timeline 导航入口，或在 More/页脚中加入入口。
- [ ] 更新 `src/components/site/site-footer.astro`：加入 Timeline 入口。
- [ ] 本地验证：Timeline 页面数据无重复、排序正确、移动端可读。
- [ ] 本地验证：`PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`。
- [ ] 提交: `feat: add timeline page`

## Phase 4: Projects 页面增强

- [ ] 新增或重构 `src/components/projects/project-card.astro`。
- [ ] 修改 `src/pages/projects.astro`：使用统一 ProjectCard。
- [ ] 新增 `src/pages/projects/[slug].astro`。
- [ ] Project 详情页展示：name、description、status、stack、tags、links、repo、demo、正文 MDX。
- [ ] Projects 列表按 status 或 weight/date 排序。
- [ ] Projects 列表展示 active / planned / archived 状态。
- [ ] 可选：新增 `src/components/projects/project-filter.tsx`，支持前端筛选 stack/status。
- [ ] 如果不做 React 筛选，需实现静态分组并在 TASKS 中说明原因。
- [ ] 更新首页 Featured Projects，链接到项目详情页而非只跳外链。
- [ ] 本地验证：Projects 列表、Project 详情、首页项目链接。
- [ ] 本地验证：`PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`。
- [ ] 提交: `feat: enhance projects pages`

## Phase 5: Reaction 轻互动

- [ ] 新增 `src/lib/reaction-config.ts`：固定 emoji 列表与 target 工具函数。
- [ ] 新增 `src/components/ui/reaction-bar.tsx`。
- [ ] `reaction-bar.tsx` 支持 loading / success / error / unavailable 状态。
- [ ] `reaction-bar.tsx` 使用 localStorage 记录本机已点状态。
- [ ] 新增 `functions/api/reactions.ts`。
- [ ] API 支持 `GET /api/reactions?target=<target>`。
- [ ] API 支持 `POST /api/reactions`。
- [ ] API 校验 target：`post:<slug>`、`note:<slug>`、`project:<slug>`。
- [ ] API 校验 emoji：`heart`、`clap`、`rocket`、`eyes`。
- [ ] API 处理 400 / 405 / 500 错误。
- [ ] 修改 `wrangler.jsonc`：加入 KV binding `REACTIONS`。
- [ ] 如果 Cloudflare KV namespace 尚未创建：使用 Wrangler 创建，或将本 Phase 标记 blocked 并让用户确认。
- [ ] 修改 `src/pages/posts/[slug].astro`：接入 ReactionBar，target 为 `post:<slug>`。
- [ ] 修改 `src/pages/notes/[slug].astro`：接入 ReactionBar，target 为 `note:<slug>`。
- [ ] 本地验证：`wrangler pages dev dist` 或等价方式能访问 Functions。
- [ ] 线上验证：至少一个 target 的 GET / POST 可用。
- [ ] 如果 API 未部署成功，不得把本 Phase 标记完成。
- [ ] 提交: `feat: add lightweight reactions`

## Phase 6: RSS、搜索、SEO 与写作指南

- [ ] 确认 Pagefind 搜索覆盖 Notes、Timeline、Project 详情。
- [ ] 可选新增 `src/pages/notes.xml.ts`：Notes RSS。
- [ ] 主 RSS `/rss.xml` 保持正式文章，不混入碎念；如果改变策略，先更新 PRD。
- [ ] 新增页面补齐 title、description、canonical、OpenGraph。
- [ ] 更新 `docs/WRITING.md`：新增 Notes 写作规范。
- [ ] 更新 `docs/WRITING.md`：新增 Timeline 事件规范。
- [ ] 更新 `docs/WRITING.md`：新增 Projects 详情维护规范。
- [ ] 更新 `README.md`：补充二期页面和动态 reaction 说明。
- [ ] 更新 `AGENTS.md`：补充新增目录结构和 Cloudflare Functions/KV 注意事项。
- [ ] 本地验证：`PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run check`。
- [ ] 本地验证：`PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`。
- [ ] 提交: `docs: update writing guide for phase 2 content`

## Phase 7: 线上部署与验收

- [ ] 确认工作区干净或只有部署无关临时文件。
- [ ] 本地构建：`PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`。
- [ ] 部署：`npx wrangler pages deploy dist --project-name mitoromisaka-blog`。
- [ ] 验收首页：Latest Notes 正常显示。
- [ ] 验收 `/notes`：列表可访问，置顶和倒序正确。
- [ ] 验收 `/notes/<slug>`：详情可访问，Reaction 正常或明确降级。
- [ ] 验收 `/timeline`：分组、排序、链接正确。
- [ ] 验收 `/projects`：增强列表正常。
- [ ] 验收 `/projects/<slug>`：详情页正常。
- [ ] 验收文章页：Reaction 正常或明确降级，Giscus 不受影响。
- [ ] 验收搜索：能搜到 Note / Project 详情内容。
- [ ] 验收 RSS / sitemap：构建产物存在，线上可访问。
- [ ] 验收移动端：Notes、Timeline、Projects 无明显布局溢出。
- [ ] 更新 `docs/TASKS-personal-blog-phase2.md` 执行状态，真实记录完成/未完成/blocked。
- [ ] 最终提交: `docs: record phase 2 completion status`
- [ ] 推送分支：`git push`

## 阻塞条件记录区

执行时如遇以下情况，不要硬做：

- [ ] Cloudflare 未登录或 token 不足，导致 KV namespace / Pages Functions 无法部署。
- [ ] 用户未确认是否允许创建 Cloudflare KV namespace。
- [ ] Reaction API 在线上不可用，但本地构建成功。
- [ ] 新增 schema 导致旧内容大量不兼容，需要重新确认字段设计。

## 验收清单

- [ ] PRD / TECH / TASKS 三份二期文档存在且互相引用。
- [ ] Notes 内容模型、列表页、详情页完成。
- [ ] 首页 Latest Notes 完成。
- [ ] Timeline 页面完成。
- [ ] Projects 详情和列表增强完成。
- [ ] Reaction 完成，或因 Cloudflare KV 明确 blocked 且文档记录原因。
- [ ] 搜索、SEO、RSS 策略已处理。
- [ ] `docs/WRITING.md` 已更新。
- [ ] `npm run check` 通过。
- [ ] `npm run build` 通过。
- [ ] 已部署到 Cloudflare Pages。
- [ ] 线上核心路径验收通过。

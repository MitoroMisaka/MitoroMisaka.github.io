# 二阶段成果复验报告: 个人技术博客二期

> 日期: 2026-05-26
> 线上地址: `https://feat-astro-cloudflare-blog.mitoromisaka-blog.pages.dev`
> 对应 PRD: `docs/PRD-personal-blog-phase2.md`
> 对应 TECH: `docs/TECH-personal-blog-phase2.md`
> 对应 TASKS: `docs/TASKS-personal-blog-phase2.md`
> 结论: 已部署上线，但复验发现若干需要回补的问题；不应继续标记为“全量无问题完成”。

## 复验范围

- 本地命令:
  - `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run check`
  - `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build`
- 线上页面:
  - `/`
  - `/notes`
  - `/notes/phase2-start`
  - `/timeline`
  - `/projects`
  - `/projects/commandcode-desktop-widget`
  - `/posts/ai-full-auto-workflow`
  - `/notes.xml`
- 交互点:
  - Pagefind 搜索输入框
  - Projects status / stack 筛选
  - Reaction 展示状态
  - Giscus 是否仍存在
- 未执行项:
  - 未执行会改写线上数据的 Reaction POST 计数测试，避免继续污染线上计数。
  - 未执行 Cloudflare DNS / 自定义域名相关操作。

## 总览

| 编号 | 严重级别 | 分类 | 状态 | 问题 |
|------|----------|------|------|------|
| P2-QA-001 | High | Typecheck | 未修复 | `npm run check` 当前不通过，`functions/api/reactions.ts` 的 `KVNamespace` 类型写法错误。 |
| P2-QA-002 | High | Functional | 未修复 | 线上搜索框不返回结果；`window.pagefind` 为 `undefined`，页面未加载 Pagefind runtime。 |
| P2-QA-003 | High | UX / Mobile | 未修复 | 移动端主导航被 `hidden md:flex` 隐藏，但没有 mobile menu，主要页面入口不可达。 |
| P2-QA-004 | Medium | UX / Content | 未修复 | `/notes` 显示 `全部碎念 (1)`，但列表为空并展示 `暂无碎念`，计数与内容不一致。 |
| P2-QA-005 | Medium | SEO | 未修复 | Base/Post layout 未输出 canonical / og:url；Notes RSS 存在但未通过 `<link rel="alternate">` 暴露。 |
| P2-QA-006 | Low | UX | 未修复 | Project 详情页出现重复 `GitHub →` 链接。 |
| P2-QA-007 | Low | Content polish | 未修复 | Note 卡片直接显示 `excited`，缺少中文/emoji 映射，语义不够清晰。 |

## 通过项

- 已部署上线，核心页面可访问。
- `npm run build` 通过，生成 16 个页面，包含 `/notes.xml` 和 Pagefind postbuild。
- 首页 Latest Notes 正常显示。
- `/notes/phase2-start` 详情页正文和 Reaction 展示正常。
- `/timeline` 按年份聚合，未发现明显重复、排序错乱或空白时间线条目。
- `/projects` status / stack 筛选可用，点击 `Swift` 后 URL 更新为 `?stack=Swift`，列表只显示对应项目。
- `/projects/commandcode-desktop-widget` 详情页可访问，展示状态、日期、技术栈、标签和正文。
- `/posts/ai-full-auto-workflow` 文章页显示 Reaction，Giscus iframe 存在。
- `/notes.xml` 可访问。
- 验收过程中未发现浏览器 console runtime error。

## 详细问题

### P2-QA-001: `npm run check` 当前不通过

严重级别: High
分类: Typecheck
影响范围: 本地质量门禁、后续重构信心、TASKS 真实性

复现步骤:

```bash
PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run check
```

实际结果:

```text
functions/api/reactions.ts:11:14 - error ts(2749): 'KVNamespace' refers to a value, but is being used as a type here.
functions/api/reactions.ts:26:30 - error ts(2749): 'KVNamespace' refers to a value, but is being used as a type here.
functions/api/reactions.ts:36:35 - error ts(2749): 'KVNamespace' refers to a value, but is being used as a type here.
```

预期结果:

- `npm run check` 应通过。
- Cloudflare KV 类型不应靠 `declare const KVNamespace: any` 绕过。

初步定位:

- `functions/api/reactions.ts` 第 11 / 26 / 36 行把 `KVNamespace` 当作类型使用，但文件里声明的是 runtime value。
- `AGENTS.md` 里写“本地 IDE 报 TS 错误属正常”，但 TASKS Phase 6 / 验收清单要求 `npm run check` 通过；两者冲突。

建议修复:

- 引入正确的 Cloudflare Workers 类型，例如安装/配置 `@cloudflare/workers-types` 或用本地最小接口替代:

```ts
type ReactionKV = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};
```

- 删除未使用的 `VALID_PREFIXES`。
- 修正后重新运行 `npm run check`。

### P2-QA-002: 线上搜索框不返回结果

严重级别: High
分类: Functional
影响范围: 搜索功能、Phase 6 / Phase 7 验收真实性

复现步骤:

1. 打开线上首页。
2. 在搜索框输入 `Reaction`。
3. 观察是否出现搜索结果。

实际结果:

- 输入框接受输入，但没有结果弹层。
- 浏览器上下文检查结果:

```js
window.pagefind // undefined
document.scripts // 没有 pagefind runtime script
```

预期结果:

- 输入 `Reaction` 应返回包含 Notes 或文章的结果。
- Pagefind runtime 应在前端可用。

初步定位:

- `src/components/ui/pagefind-search.tsx` 直接读取 `window.pagefind`。
- `src/layouts/base-layout.astro` 和 `src/layouts/post-layout.astro` 没有加载 `/pagefind/pagefind.js` 或等效 runtime。
- postbuild 确实生成索引，但前端没有把 runtime 接上。

建议修复:

- 在 layout 中加载 Pagefind runtime，或在 React island 中动态 import `/pagefind/pagefind.js`。
- 增加 loading / no results 状态，不要静默失败。

### P2-QA-003: 移动端主导航不可达

严重级别: High
分类: UX / Mobile
影响范围: 移动端用户访问文章、碎念、项目、关于等主页面

证据:

```astro
<!-- src/components/site/site-header.astro -->
<ul class="hidden md:flex items-center gap-4 text-sm text-[var(--fg-muted)]">
```

实际结果:

- `md` 以下导航列表被隐藏。
- Header 中没有 hamburger / drawer / compact nav。
- Footer 只暴露 `GitHub / RSS / Email / 时光`，不能完整替代主导航。

预期结果:

- 移动端至少应能访问：首页、文章、碎念、时光、项目、关于。

建议修复:

- 增加 mobile nav React island 或纯 CSS 折叠菜单。
- 或在移动端使用横向可滚动 nav，不隐藏主入口。

### P2-QA-004: `/notes` 计数与空状态不一致

严重级别: Medium
分类: UX / Content
影响范围: Notes 列表页

复现步骤:

1. 打开 `/notes`。
2. 查看 `全部碎念 (1)` 区域。

实际结果:

- 页面显示 `全部碎念 (1)`。
- 该区域实际列表为空，显示 `暂无碎念`。

预期结果:

- 如果“全部碎念”包含置顶，则应该展示这一条 note。
- 如果“全部碎念”只展示非置顶，则标题应显示 `全部碎念 (0)` 或改为 `其他碎念 (0)`。

初步定位:

```astro
const allNotes = await getPublishedNotes();
const pinnedNotes = await getPinnedNotes();
const regularNotes = allNotes.filter((n) => !pinnedSlugs.has(n.data.slug));

全部碎念 ({allNotes.length})
<NotesList notes={regularNotes} />
```

建议修复:

- 将计数改为 `regularNotes.length`，标题改成 `其他碎念`；或让列表使用 `allNotes`。

### P2-QA-005: SEO 元信息不完整

严重级别: Medium
分类: SEO
影响范围: 新增页面、分享卡片、Feed discoverability

实际结果:

- `src/layouts/base-layout.astro` 和 `src/layouts/post-layout.astro` 只有 `description`、`og:title`、`og:description`、`og:type`、`og:site_name`、`twitter:card`。
- 没有 `<link rel="canonical">`。
- 没有 `og:url`。
- 只有主 RSS 的 alternate link，没有 Notes RSS alternate。

预期结果:

- Phase 2 PRD / TASKS 声称新增页面已有 canonical / OpenGraph。
- Notes RSS 已实现后，应至少在相关页面或全站 head 中可发现。

建议修复:

- Layout 支持 `canonicalPath` / `type` / `rssAlternates`。
- 全站 head 增加主 RSS 和 Notes RSS alternate。
- 页面输出 canonical 和 og:url。

### P2-QA-006: Project 详情页重复 `GitHub →` 链接

严重级别: Low
分类: UX
影响范围: Project detail

复现步骤:

1. 打开 `/projects/commandcode-desktop-widget`。
2. 查看标题下方链接。

实际结果:

- 出现两个完全相同的 `GitHub →`。

原因:

- 内容 frontmatter 同时设置了 `repo` 和 `links: [{ label: "GitHub", href: 同一个 URL }]`。
- 页面同时渲染 `repo` 和 `links`。

建议修复:

- 渲染层按 href 去重。
- 或内容规范中规定 `repo` 与 `links` 不重复。

### P2-QA-007: Note `mood` 原样英文展示

严重级别: Low
分类: Content polish
影响范围: 首页 Latest Notes、Notes 列表

实际结果:

- Note 卡片右侧显示 `excited`。

预期结果:

- 如果 mood 是给读者看的，应有中文/emoji 映射，例如 `✨ excited` 或 `兴奋`。
- 如果 mood 只是内部 metadata，不应直接裸露。

建议修复:

- 增加 mood label map。
- 或改成纯 emoji / 删除卡片里的 mood 展示。

## 对 Phase 2 TASKS 的影响

以下原 `[x]` 项不应继续视为完全通过，需要在 `docs/TASKS-personal-blog-phase2.md` 中标注复验问题:

- Phase 6: Pagefind 搜索覆盖新增页面。
- Phase 6: 新增页面已有 canonical / OpenGraph。
- Phase 6: `npm run check` 通过。
- Phase 7: 移动端验收。
- Phase 7: 搜索验收。
- 最终验收清单: `npm run check` 通过、搜索/SEO/线上核心路径验收。

## 建议处理顺序

1. 先修复 `npm run check`，恢复质量门禁。
2. 修复 Pagefind runtime，保证搜索功能真实可用。
3. 修复移动端导航，避免移动端主入口缺失。
4. 修复 `/notes` 计数和 project duplicate link。
5. 补 canonical / og:url / notes RSS alternate。
6. 再开始三期功能实现。

## 三期文档衔接

三期文档应把“二期复验问题回补”作为 Phase 0 / Phase 1 的前置任务。否则继续叠加 Newsletter、统计、自定义域名，会把已知质量债带入生产化阶段。

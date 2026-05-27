# Product Requirements Document: 个人技术博客五期（页面美术设计工程 · 余白 / Yohaku）

> 日期: 2026-05-27（修订: 2026-05-28）
> 四期基线: `docs/PRD-personal-blog-phase4.md`
> 设计分析: `docs/ANALYSIS-design-phase5.md`
> 技术方案: `docs/TECH-personal-blog-phase5.md`
> 执行计划: `docs/TASKS-personal-blog-phase5.md`
> 状态: 修订中

## v2 修订说明

v1 聚焦于 Yohaku token 迁移和 Hero 重塑。v2 补充：
1. 页面宽度修复（`max-w-5xl` → `max-w-7xl`，对标 innei.in 的 1120px）
2. 樱花飘落背景动画（Canvas 粒子系统）
3. 技术栈评估：Astro vs Next.js（Shiro 架构）
4. 全站页面重建：学习 innei.in 所有页面的布局和交互模式

## 目标

- 引入 **Yohaku (余白) 设计系统** 作为全站排版基底，获得与 innei.in 相同的设计语言（配色、字号体系、设计约束），同时保持自己的视觉辨识度。
- 重塑首页 Hero：二次元头像替代 + Yohaku 排版 + 光斑背景 + 入场动画。
- 重塑文章列表与阅读体验：无边框卡片、下划线展开动画、手记衬线体排版。
- Header 毛玻璃、滚动条定制、打印样式等全局视觉打磨。
- Footer 标注 "Powered by 余白 / Yohaku" 作为设计理念的署名。
- **页面宽度标准化**：全站内容容器统一为 `max-w-7xl`（1120px），正文 `max-w-3xl`（672px），对标 innei.in。
- **樱花飘落动画**：Canvas 实现的随机飘落粒子系统，覆盖全屏背景。
- **全站页面对标**：学习 innei.in 的 /posts（文稿列表）、/notes（手记 / 年鉴式）、/timeline（时光）、/thinking（思考 / 社交动态）、/projects（项目）的布局和交互模式，重建本博客对应页面。
- 不引入新后端/CMS/框架，不复制 Shiro 代码，纯粹 Astro + CSS + 少量 React islands。

## 用户故事

- 作为站点作者，我希望博客的视觉气质达到 innei.in 级别的日系极简美学，以建立个人品牌。
- 作为站点作者，我希望能引用 Innei 的 Yohaku 设计系统，在 footer 标注 "Powered by 余白 / Yohaku" 以表达设计哲学上的认同。
- 作为读者，我希望首页有温和的入场动画和舒适的光斑装饰，不刺眼但精致。
- 作为读者，我希望文章列表和手记页面有独特的排版节奏，与普通博客拉开差距。
- 作为读者，我希望能看到作者的个人辨识度（二次元头像），而不只是模板化的站点。
- 作为读者，我希望页面宽度适中（1120px 内容区），在宽屏显示器上不显得局促。
- 作为读者，我希望有樱花飘落的氛围动画，增添站点的日系美学调性。

## 功能范围

### In Scope

- 引入 `@yohaku/design-system` npm 包，替换全站颜色 token 和字号体系。
- 全局排版基线：14px 全局字号 + Yohaku 排版 scale（caption-10 → display-48）。
- Web Font：Instrument Sans (西文) + Noto Serif SC (中文衬线)。
- 首页 Hero 重塑：
  - 二次元头像（`public/avatar.png`，1254×1254 PNG）替代现有头像
  - Hero 入场动画（标题逐字上浮、副标题/社交图标依次淡入）
  - 页首光斑背景（CSS blob-entrance + blob-float 浮动模糊圆）
  - "AI Agents" 风格的特效标签（CSS 辉光 + 流光动画）
- 全局视觉打磨：
  - 暖纸白背景色 (`#fefefb` / dark `#242424`)
  - 下划线展开动画（`shiro-link--underline` CSS 参考）
  - Header 毛玻璃效果
  - 滚动条定制（6px + 圆角）
  - 打印样式（`data-hide-print`）
- 手记正文排版变体：衬线体 + 首字下沉 + 段落缩进（`.markdown--note` CSS）
- 文章列表卡片：无边框 + 摘要 accent 环
- "阅读全文 →" 箭头 hover 动效
- Footer 更新：标注 "Powered by 余白 / Yohaku" + 链接
- 仓库 LICENSE：AGPLv3

### In Scope（v2 新增）

- **页面宽度升级**：全站布局容器从 `max-w-5xl`（896px）改为 `max-w-7xl`（1120px），对标 innei.in。文章详情正文保持 `max-w-3xl`（672px）。
- **樱花飘落动画**（`src/components/fx/sakura-particles.tsx`）：
  - Canvas 全屏覆盖（fixed, pointer-events-none, z-50）
  - 随机生成的樱花瓣粒子（淡粉色椭圆形，透明度 0.1-0.4）
  - 物理模拟：重力（0.3-0.8px/frame）+ 风力（sin 波动，振幅 0.5-2px）+ 旋转（0.2-2°/frame）
  - requestAnimationFrame 驱动，60fps 目标
  - 性能优化：ResizeObserver 自适应 + 粒子数量上限（桌面 60 个，移动 30 个）+ visibilitychange 暂停
- **文章列表页（/posts）对标**：
  - 顶部 "BLOG" 标签 + H1 "文章"
  - 置顶文章特殊样式（accent 色背景 strip）
  - 文章项：标题 + 摘要（max-w-[65ch]）+ 元信息行（日期 · 分类 / 标签）
  - 右侧栏：标签云 + 搜索（可选，保留现有 Pagefind）
  - 排序切换：最新 / 最早（可选）
  - 分页导航
- **手记/碎念页（/notes）对标**：
  - 年鉴式排版（ANNO 2026 · 7 LETTERS）
  - 每篇手记：日期（日 · 月 · 周几）+ 标题 + 摘要 + LETTER № + "阅读全文 →"
  - 心情图标（天气 + 五味瓶等）
  - 首篇展开全文（最新手记完整渲染）
  - 底部 "更早的手记" 分页
- **时光页（/timeline）对标**：
  - 纵向时间线，左侧年份 + 右侧内容
  - 混合类型：文章（post）、手记（note）、项目（project）、动态（activity）
  - 每一项：类型图标 + 日期 + 标题（链接）+ 描述
  - 按年份分组，每组有年份标题
- **思考页（/thinking）对标**：
  - 类似社交媒体动态流
  - 每条：头像 + 用户名 + 相对时间 + 正文 + TMDB 链接卡片（自动 enrich）
  - 互动：喜欢 / 踩 / 评论 按钮
  - 仅登录用户可发布（本博客: 可选，或隐藏发布框）
  - 无限滚动
- **项目页（/projects）对标**：
  - 头部："项目 — github.com/XXX ↗"
  - 项目卡片网格（2 列）
  - 每张卡片：图标/emoji + 名称 + 描述 + 标签 + GitHub stars（可选）

### Out of Scope

- Framer Motion 或其他重动画框架。动画用 CSS @keyframes 或轻量 React island 实现。
- Canvas 粒子或 WebGL 效果（innei.in 也没有）。**→ v2 修正：innei.in 有 Canvas 樱花粒子（来自 Mix Space CMS 自定义脚本注入），本博客将用独立的 React island 实现。**
- 友链页、思考页、关于页等全面页面开发（这些属于后续功能扩展）。**→ v2 修正：思考页、项目页纳入五期范围。**
- Shiro 源码的直接复制——所有效果基于视觉规则自己实现。
- 多语言支持。
- 旧 Jekyll 内容再迁移。
- 技术栈迁移（Astro → Next.js）。**→ v2 评估：innei.in 基于 Next.js（React Router Framework Mode）+ Mix Space CMS。本博客保持 Astro v6 SSG + Cloudflare Pages KV 架构，不迁移技术栈。原因：(1) Astro 的 SSG 模式更适合作者只有 ~10 篇内容的个人博客，无需 SSR 开销；(2) Mix Space CMS 引入了后端 API 复杂度，不适合零运维目标；(3) 所有 innei.in 的视觉效果均可在 Astro 中通过 React islands + CSS 复现。**

## 技术约束

- 所有颜色、字号必须使用 Yohaku Token（`text-neutral-N`、`text-copy-N`、`text-title-N` 等），禁止硬编码 `text-[Npx]` 和 `text-neutral-50...950`。
- `neutral-5` 禁止作文本色。
- accent 色使用 Yohaku 默认 `#c56473`（柔和珊瑚色），但可以通过 `--color-accent` 变量保持可配置性。
- 动画使用纯 CSS @keyframes 或 Astro island 中的轻量实现，不引入 Framer Motion。
- 头像替换为 `public/avatar.png`。
- 必须在桌面端保持 Lighthouse Performance >= 90（不因 animation 引入大 JS bundle）。
- 样式修改集中在 `src/styles/global.css` 和新增的 `src/styles/yohaku-extras.css`。
- **v2 新增**：页面宽度使用 `max-w-7xl`（1120px），正文区 `max-w-3xl`（672px）。全局 `<main>` 容器统一 `mx-auto max-w-7xl px-4 lg:px-8`。
- **v2 新增**：Canvas 动画使用 requestAnimationFrame，粒子数量上限 60（桌面）/ 30（移动），页面不可见时暂停（document.hidden）。

## 质量标准

- 视觉验收: 首页、文章列表、手记详情、手记列表、时光、思考、项目在亮/暗色模式下对比 innei.in 截图，确认排版气质一致。
- 性能: 构建后 JS bundle 不应因动画引入超过 5KB 额外体积。
- 可维护性: 所有自定义 CSS/动画集中管理，不散落在组件文件中。
- 排版: 严格遵循 Yohaku CHEATSHEET 的 10 条不变量，通过视觉审查确认无违规。

## 设计参考

- innei.in（Shiro + Yohaku）: 全局设计语言、排版节奏、动效哲学
- `@yohaku/design-system` CHEATSHEET.md: 10 条不变量 + 颜色/字号速查表
- `docs/ANALYSIS-design-phase5.md`: Shiro 源码级 CSS 实现细节

### innei.in 全站页面参考清单（2026-05-28 浏览器实测 + Shiro 源码对照）

共参考 **12 个页面**：

| # | 页面 | 路径 | 结构要点 | 关键技术点 |
|---|------|------|---------|-----------|
| 1 | 首页 | `/` | body `max-w-[1280px]`, `max-w-7xl`, Hero + ActivityScreen(三栏) + HomePageTimeLine + Windsock | Framer Motion 逐字动画, FABContainer, 搜索热键 |
| 2 | 文稿列表 | `/posts` | 顶部标签 "BLOG" + H1 "文章", 置顶文章 accent strip, 排序(最新/最早/最近更新), 右侧标签云, 分页(第 N 页/共 M 页) | PostLooseItem, MagneticHoverEffect, PostMetaBar(👁阅读数+👍点赞数), FloatPopover 标签弹窗 |
| 3 | 文稿详情 | `/posts/<category>/<slug>` | 三栏布局: 左侧系列导航 / 正文 / 右侧 TOC, 代码块+复制按钮, (已编辑) tooltip, 系列系列前后导航 | Shiki 语法高亮, Markdown 渲染, 阅读量统计, Creative Commons 声明 |
| 4 | 手记列表 | `/notes` | 年鉴式: "ANNO 2026 · N LETTERS", 首篇完整渲染, 日期徽章(日·月·周几), 心情图标(天气/五味瓶), LETTER № + "阅读全文 →" | NoteHeadCover(封面图), NoteTimeline(同题笔记), 分页 |
| 5 | 手记详情 | `/notes/<id>` | 三栏: NoteLeftSidebar(封面+同题笔记) / 正文(markdown--note) / NoteFooterNav(上/下篇), AI 摘要("关键洞察") | NoteMarkdownRenderer, 互动按钮(点赞/分享/评论/捐赠), 多语言切换 |
| 6 | 时光 | `/timeline` | 纵向时间线, 年份分组, 混合类型(文章/手记/项目/动态), 类型图标+日期+标题+描述 | CSS timeline-reveal mask 动画 |
| 7 | 思考 | `/thinking` | 社交动态流, 每条: 头像+用户名+相对时间+正文+TMDB卡片+互动(喜欢/踩/评论), 无限滚动, 登录后可发布 | useInfiniteQuery, TMDB API enrich(自动展开链接为富媒体电影/电视剧卡片), PostBox 乐观更新 |
| 8 | 思考详情 | `/thinking/<id>` | 展开单条思考 + 评论列表 + 回复框 | 评论系统, 互动统计 |
| 9 | 项目 | `/projects` | 头部 "项目 — github.com/XXX ↗", 2列网格, 项目卡片(图标+名称+描述+标签), 计数 "14 projects" | GitHub API (stars 数据), 磁吸 hover |
| 10 | 友链 | `/friends` | 两类: 友链(随机排列) / 收藏(固定顺序), 申请表单(名称/URL/描述/头像), 友链规则 Markdown | shuffle()随机排序, Form+FormInput, Markdown渲染 |
| 11 | 自述 | `/about` | 个人信息(现状/名字由来/域名/联系方式/设备), DisclosureTriangle折叠面板, GitHub 贡献图表 | 自定义页面路由 `[slug]`, Markdown渲染 |
| 12 | 一言 | `/says` | 随机语录展示(Hiokoto), 刷新按钮获取新语录 | API fetch, 动画过渡 |
| + | 404 | `/*` | 大号 3D 文字 "404" + "返回首页" 链接 | hit-the-floor text-shadow 多层渐进阴影 |
| + | 站点地图 | `/sitemap` | XML sitemap | 自动生成 |
| + | RSS/Feed | `/feed` | RSS 2.0 / Atom | API 生成 |
| + | 订阅 | `/subscribe` | 邮件订阅表单 | API |
| + | 监控 | 外部 dashboard | Grafana/自建监控 | 外部链接 |
| + | 照片廊 | 外部 | 图库 | 外部链接 |

### innei.in 核心 Shiro 组件清单（源码发现）

| 组件 | 路径 | 作用 |
|------|------|------|
| MagneticHoverEffect | `components/ui/effect/MagneticHoverEffect.tsx` | 卡片磁吸微动效 |
| FloatPopover | `components/ui/float-popover/FloatPopover.tsx` | 悬浮弹窗 |
| TextUpTransitionView | `components/ui/transition/TextUpTransitionView.tsx` | 逐字上浮动画 |
| BottomToUpTransitionView | `components/ui/transition/BottomToUpTransitionView.tsx` | 元素从下方淡入 |
| NumberSmoothTransition | `components/ui/number-transition/NumberSmoothTransition.tsx` | 数字平滑过渡 |
| ScrollArea | `components/ui/scroll-area/ScrollArea.tsx` | 滚动容器 + mask-scroller |
| Paper | `components/layout/container/Paper.tsx` | 毛玻璃纸张容器 |
| ActivityScreen | `components/home/ActivityScreen` | 首页三栏(笔墨/碎念/来信) |
| HomePageTimeLine | `components/home/HomePageTimeLine` | 首页时间线流 |
| Windsock | `components/home/Windsock` | 首页底部导航网格(8个图标) |
| NoteTimeline | `components/modules/note/NoteTimelineItem.tsx` | 手记同题系列侧栏 |
| NoteHeadCover | `components/modules/note/NoteHeadCover.tsx` | 手记封面图 |
| Markdown | `components/ui/markdown/Markdown.tsx` | Markdown 渲染(含 Shiki 语法高亮) |
| VideoPlayer | `components/ui/media/VideoPlayer.tsx` | 视频播放器 |
| LinkCard | `components/ui/link-card/LinkCard.tsx` | 链接卡片(TMDB enrich 等) |

## 版本边界

五期结束后，博客应具备：
- Yohaku 设计系统的完整 Design Token 体系
- 与 innei.in 气质相近的日系极简视觉风格
- 二次元头像 + "Powered by 余白 / Yohaku" 的个人辨识度
- 精致的入场动画和排版节奏
- AGPLv3 LICENSE 保护源码
- **v2 新增**：1120px 标准内容宽度，正文 672px 最大文本行宽
- **v2 新增**：Canvas 樱花飘落背景动画（60/30 粒子，60fps）
- **v2 新增**：对标 innei.in 的文章列表、手记年鉴、时光时间线、思考动态流、项目网格

# 技术方案: 个人技术博客五期（页面美术设计工程 · 余白 / Yohaku）

> 基于 PRD: `docs/PRD-personal-blog-phase5.md`
> 设计分析: `docs/ANALYSIS-design-phase5.md`
> 日期: 2026-05-27

## 架构概览

```
┌─ Yohaku Design Tokens (CSS @theme) ─┐
│ @yohaku/design-system/tokens.css     │  ← npm 包 (MIT)
│   - 10 级中性色阶 (neutral-1…10)     │
│   - accent 珊瑚色 #c56473            │
│   - 语义色 (info/success/warn/error)  │
│   - 字号系统 (caption-10→display-48)  │
│   - 字体栈 (sans/serif/mono)          │
└──────────────────────────────────────┘
              ↓ @import
┌─ 本博客 CSS ─────────────────────────┐
│ src/styles/global.css                 │  ← 覆盖/扩展
│   - [data-theme='dark'] 变量覆盖      │
│   - 自定义组件样式                    │
│ src/styles/yohaku-extras.css          │  ← 新增: 动画/排版变体
│   - shiro-link--underline 动画        │
│   - page-head-gradient 光斑           │
│   - markdown--note 手记变体           │
│   - scrollbar 定制                    │
│   - data-hide-print 打印样式          │
└──────────────────────────────────────┘
              ↓ 被引入
┌─ Astro 组件 ─────────────────────────┐
│ src/components/home/hero-section.astro│  ← 头像替换 + 入场动画
│ src/components/site/site-header.astro │  ← 毛玻璃效果
│ src/components/site/site-footer.astro │  ← powered by Yohaku
│ src/layouts/post-layout.astro         │  ← 排版变量切换
│ ...                                   │
└──────────────────────────────────────┘
```

## 技术选型

| 层 | 选择 | 理由 |
|----|------|------|
| Design Tokens | `@yohaku/design-system` v0.0.2 | MIT 协议、Tailwind v4 `@theme` 兼容、与 innei.in 同源 |
| 西文字体 | Instrument Sans (Google Fonts, CDN) | Yohaku 默认西文字体，几何感强 |
| 中文字体 | Noto Serif SC (Google Fonts, CDN) | Yohaku 默认衬线中文字体 |
| 动画 | CSS @keyframes | 零 JS 体积，覆盖 90% 动画需求 |
| 入场动画 | 轻量 React island (motion 或 CSS) | 仅 Hero 区域需要逐字动画 |
| 头像处理 | Astro `<Image>` 或 `<img>` | 1254×1254 PNG，无需优化 |

## 颜色迁移方案

**迁移前**（现有自定义变量）→ **迁移后**（Yohaku Token）：

| 现有变量 | 旧值 | Yohaku Token | 新值 |
|----------|------|-------------|------|
| `--bg` | `#f7f8fb` | `text-neutral-1` | `#f9f8f5` |
| `--fg` | `#1f2530` | `text-neutral-9` | `#24231f` |
| `--fg-muted` | `#566070` | `text-neutral-7` | `#5c5a55` |
| `--fg-soft` | `#8d96a3` | `text-neutral-5` | `#a8a69f` (仅边框，不作文本) |
| `--line` | `#dde3ec` | `text-neutral-3` | `#e3e1db` |
| `--line-strong` | `#b9c4d1` | `text-neutral-4` | `#d0cec6` |
| `--card` | `#ffffff` | `text-neutral-1` | `#f9f8f5` |
| `--brand` | `#6e78f5` | `text-accent` | `#c56473` |

注意：`neutral-5` 不能直接用于文本——需要用 `neutral-7` 或 `neutral-6` 作为替代。

## 字体加载方案

不使用 `next/font`（那是 Next.js 独有），改用 Google Fonts CDN + `@font-face`：

```css
/* 西文正文字体 */
@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap');

/* 中文衬线体 (用于手记) */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');
```

或使用 `<link>` 标签预加载（在 `base-layout.astro` 中），避免阻塞渲染。

## 动画实现方案

所有动画均为 CSS-only，无需 JS 框架：

### 页首光斑 (`page-head-gradient`)

```css
/* 两个浮动模糊圆，参考 Shiro layer.css */
.hero-blob::before, .hero-blob::after {
  content: ''; position: absolute; border-radius: 50%;
  filter: blur(60px);
  animation: blob-entrance 2s ease-out both, blob-float 20s ease-in-out 2.5s infinite;
}
.hero-blob::before { width: 350px; height: 350px; background: var(--color-accent); opacity: 0.08; top: -120px; left: 5%; }
.hero-blob::after  { width: 250px; height: 250px; background: var(--color-accent); opacity: 0.12; top: -80px; right: 15%; }
```

### 入场动画

Hero 模块使用一个轻量 React island (`hero-animated.tsx`)，包含：
- 头像 fade-in + scale
- 标题逐字 slide-up（CSS `animation-delay` 或 JS 计算每个字符 delay）
- 副标题 fade-in（delay 500ms）
- 社交图标依次 fade-in（stagger 100ms）

如果不想要 JS，可以用纯 CSS `animation-delay` 嵌套多个 `<span>` 实现逐字动画。

### 下划线展开动画

```css
.link-underline {
  background-image: linear-gradient(var(--color-accent), var(--color-accent));
  background-size: 0% 1.5px;
  background-repeat: no-repeat;
  background-position: left 1.2em;
  transition: background-size 300ms ease;
}
.link-underline:hover {
  background-size: 100% 1.5px;
}
```

## 手记排版变体

`.markdown--note` class 用于手记正文（参考 Shiro `markdown-variants.css`）：

```css
.markdown--note {
  font-family: var(--font-serif);
  font-size: 1.125rem;
  line-height: 1.8;
}
.markdown--note > p:first-child::first-letter {
  float: left;
  font-size: 2.4em;
  margin: 0 0.2em 0 0;
}
.markdown--note p + p {
  text-indent: 2rem;
}
```

在 Astro 中根据内容类型动态添加 class：手记/碎念 → `.markdown--note`，技术文章 → 默认 sans。

## Header 毛玻璃

```css
.site-header {
  background: rgba(254, 254, 251, 0.82);
  backdrop-filter: blur(12px);
}
[data-theme='dark'] .site-header {
  background: rgba(28, 28, 30, 0.82);
  backdrop-filter: blur(12px);
}
```

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `package.json` | 修改 | 新增 `@yohaku/design-system` 依赖 |
| `LICENSE` | 新增 | AGPLv3 协议 |
| `src/styles/global.css` | 重写 | 替换颜色变量为 Yohaku Token + `@import "@yohaku/design-system/tokens.css"` |
| `src/styles/yohaku-extras.css` | 新增 | 动画、排版变体、滚动条、打印样式 |
| `src/components/home/hero-section.astro` | 修改 | 头像替换为 `avatar.png` + 光斑背景 |
| `src/components/home/hero-animated.tsx` | 新增 | 入场动画 React island |
| `src/components/site/site-header.astro` | 修改 | 毛玻璃效果 |
| `src/components/site/site-footer.astro` | 修改 | "Powered by 余白 / Yohaku" |
| `src/layouts/post-layout.astro` | 修改 | 手记/文章排版变量切换 |
| `src/layouts/base-layout.astro` | 修改 | Web Font 预加载 link |
| `public/avatar.png` | 新增 | 二次元头像 (1254×1254) |
| `docs/ANALYSIS-design-phase5.md` | 已有 | 设计审计文档 |
| `docs/PRD-personal-blog-phase5.md` | 新增 | 本文件 |
| `docs/TECH-personal-blog-phase5.md` | 新增 | 本文件 |
| `docs/TASKS-personal-blog-phase5.md` | 新增 | 执行计划 |
| `README.md` | 修改 | 更新设计理念 + 技术栈 |
| `AGENTS.md` | 修改 | 更新编码约定 |
| `docs/DEPLOYMENT.md` | 修改 | 无需改动（依赖已在 package.json） |
| `docs/WRITING.md` | 修改 | 更新排版引用 |

## 风险与注意事项

- Yohaku npm 包当前版本 0.0.2，API 不稳定。如果 `@import` 失败，备用方案：手动复制 `tokens.css` 到本仓库 `src/styles/` 目录。
- Instrument Sans 通过 Google Fonts CDN 加载，在中国大陆可能被墙。国内读者可能看到回退字体（PingFang SC / Noto Sans SC），不影响可读性。
- 暖纸白背景色在暗色模式下需要仔细调校，确保中性色阶在 `data-theme='dark'` 下正确反转。
- 动画不应影响 Lighthouse Performance 分数——CSS 动画本身无 JS 开销，但需确保不在首屏阻塞渲染。
- `neutral-5` 禁用为文本色的约束需要逐个组件检查，避免无意中使用。

## 关键决策记录

### ADR-P5-001: 采用 Yohaku Design System 作为全站排版基底

**背景**: 一期 PRD 明确要求"参考 innei.in 的设计风格"。经过五期源码审计，发现 innei.in 基于 Yohaku 设计系统。Yohaku 的 `@yohaku/design-system` 以 MIT 协议发布，提供完整的 Design Token 体系。

**选项**:
- A: 纯自己写所有颜色/排版 — 自由但费时，容易偏离目标。
- B: Fork Shiro 仓库 — 协议冲突 (AGPLv3+附加)，架构不兼容 (Next.js vs Astro)。
- C: 复用 Yohaku Design Tokens + 自己写 Astro 组件 — MIT 安全，Token 精确，保有 Astro 架构。

**决定**: 选 C。

### ADR-P5-002: 动画方案选择纯 CSS，而非 Framer Motion

**背景**: innei.in 使用 Framer Motion 做入场动画和磁吸效果。本博客是 Astro SSG，JS bundle 需要严格控制。

**选项**:
- A: 引入 Framer Motion — 动画能力强，但 +~32KB gzip
- B: 纯 CSS @keyframes — 零 JS 体积，覆盖大部分需求
- C: 轻量 CSS + 可选 React island — Hero 入场用 React，其余 CSS

**决定**: 选 C。Hero 逐字动画需要 JS 计算 stagger delay，其余（光斑、下划线、hover 效果）纯 CSS。

### ADR-P5-003: LICENSE 选择 AGPLv3

**背景**: 用户希望"不能直接 copy 的 license"。AGPLv3 是最强的 copyleft 协议，要求网络使用也必须开源。

**选项**:
- A: MIT — 最宽松，任何人可随意使用
- B: GPLv3 — 强 copyleft，但不覆盖网络使用
- C: AGPLv3 — 最强 copyleft，覆盖网络使用（包括 Cloudflare Pages 部署）

**决定**: 选 C，与 Shiro 同协议，确保源码公开但禁止闭源商用。

## v2 新增：页面宽度升级

### 当前状态

本博客全站使用 `max-w-5xl`（Tailwind 默认 1024px → 本博客 14px baseline 下约 896px）。innei.in 使用 `max-w-7xl`（1120px）+ body `max-w-[1280px]`。

### 方案

| 元素 | 当前 | innei.in | 新值 |
|------|------|---------|------|
| 全局容器 | `max-w-5xl` (896px) | `max-w-7xl` (1120px) | `max-w-7xl` |
| 正文区 | 无限制 | `max-w-3xl` (672px) | `max-w-3xl` |
| padding | `px-5 md:px-8` | `px-4 lg:px-8` | `px-4 lg:px-8` |
| header/footer | 同 main | 独立 width | `mx-auto max-w-7xl px-4 lg:px-8` |

文件变更：
- `src/layouts/base-layout.astro`: `max-w-5xl` → `max-w-7xl`, `px-5 md:px-8` → `px-4 lg:px-8`
- `src/layouts/post-layout.astro`: 同上
- `src/components/site/site-header.astro`: `max-w-5xl` → `max-w-7xl`, `px-5 md:px-8` → `px-4 lg:px-8`
- `src/components/site/site-footer.astro`: 同上
- 各页面独立容器同步修改

## v2 新增：樱花飘落动画

### 设计

innei.in 通过 Mix Space CMS 的 `scripts` 字段注入了一段自定义 Canvas 脚本。Shiro 源码中无此代码，它通过 `<ScriptInjectProvider>` 在运行时动态注入到 `<head>`。

### 本博客方案

使用 Astro React island (`src/components/fx/sakura-particles.tsx`, `client:load`)：

```tsx
// 粒子数据结构
interface Petal {
  x: number; y: number;           // 位置
  size: number;                    // 大小 (6-14px 长轴)
  rotation: number;                // 当前旋转角度
  rotationSpeed: number;           // 旋转速度 (0.2-2°/frame)
  speedX: number;                  // 水平漂移速度 (sin 波动基频)
  speedY: number;                  // 下落速度 (0.3-0.8px/frame)
  opacity: number;                 // 透明度 (0.1-0.4)
  phase: number;                   // sin 波动相位偏移
}
```

实现细节：
- Canvas 元素：`position: fixed; inset: 0; pointer-events: none; z-index: 50`
- 粒子数量：桌面 60 个 / 移动 30 个（通过 matchMedia 响应）
- 绘制：每个粒子为淡粉色（`rgba(255, 183, 197, opacity)`）椭圆 + `rotate(rotation)`
- 循环逻辑：`requestAnimationFrame` 驱动，每帧更新位置 + 清除 + 重绘
- 性能：`ResizeObserver` 自适应 Canvas 尺寸；`document.hidden` 时暂停循环
- 粒子重置：超出视口底部后重置到顶部随机位置
- 暗色模式：粉色透明度微调（略增亮）

文件变更：
- `src/components/fx/sakura-particles.tsx` — 新增 React island
- `src/layouts/base-layout.astro` — 插入 `<SakuraParticles client:load />`
- `src/pages/index.astro` — 同上（首页优先加载）

## v2 新增：全站页面结构对标

### 文稿列表 /posts

innei.in 结构（浏览器实测）：
```
<sectionheader> "BLOG" + H1 "文章" + 置顶文章条
  └─ 文章列表
      ├─ 每项: 标题 + 摘要(65ch 截断) + 元信息(日期·(已编辑)·分类/标签)
      └─ 分页: 上一页 / 下一页 / "第 1 页，共 N 页"
<complementary> 标签云（右侧栏）
```

本博客改造任务：
- 添加置顶文章标记样式（`pinned: true` frontmatter → accent 色 strip）
- 文章项排版：标题 → `text-title-20`，摘要 → `text-copy-14 text-neutral-7 line-clamp-2 max-w-[65ch]`
- 元信息行：`text-label-12 text-neutral-7`，分类可点击，标签可点击
- 添加分页导航（以下功能可用 Astro `paginate()` 或手动分页参数实现）
- 右侧标签云（可选，考虑当前内容量较少）

### 手记列表 /notes

innei.in 结构（浏览器实测）：
```
当前最新手记（完整渲染）
├─ 标题 + 日期(日·月·周几) + 心情(天气/五味瓶图标)
├─ 正文全文（markdown--note 变体）
└─ footer: "YOHAKU · LETTER №XXX" + "阅读全文 →"
"更早的手记"
├─ "ANNO 2026" + "7 LETTERS"
└─ 每篇: 日期徽章(日·月·周几) + 标题 + 心情标签 + LETTER № + "阅读全文 →"
"ANNO 2025" + "2 LETTERS"
分页: "更近的手记" / "更早的手记"
```

本博客改造任务：
- 手记列表页改为年鉴式排版（按年份分组）
- 每篇手记显示：日期徽章 + 标题 + 心情图标 + 摘要
- 首篇展开全文
- 分页导航

### 时光 /timeline

innei.in 结构（浏览器实测）：
```
纵向时间线
├─ 年份标题
│   ├─ [类型图标] + 日期 + 标题(链接) + 描述 + 标签
│   └─ ...
└─ 按时间倒序
```

当前本博客已有基本实现，需增强：
- 年份分组视觉分隔
- 时间线居中竖线 + 圆点（纯 CSS `::before/::after`）
- 混合内容类型图标

### 思考 /thinking

innei.in 结构（浏览器实测）：
```
社交媒体动态流
├─ 每条: 头像 + 用户名 + 相对时间 + 正文
│   ├─ TMDB 富媒体卡片（自动 enrich 链接）
│   └─ 互动: 喜欢/踩/评论
└─ 无限滚动（useInfiniteQuery）
```

本博客改造：
- 新建 `/thinking` 页面（或使用现有 Garden 作为思考区）
- 思考条目使用 Markdown/MDX 存储在 `src/content/thinking/`
- 不需要 TMDB enrich（太复杂，超出范围）
- 不需要无限滚动（使用 SSG 静态页面即可）

### 项目 /projects

innei.in 结构（浏览器实测）：
```
头部: "项目 — github.com/XXX ↗"
网格: 2 列卡片 (14 projects)
├─ 卡片: 图标 + 名称 + 描述 + 标签
└─ 计数: "14 projects"
```

当前本博客已有 ProjectFilter 组件（分类 + 技术栈筛选），无需大改。需增强：
- 添加 GitHub 链接行（头部）
- 项目计数
- 卡片 hover 微动效

文件变更清单（v2）：
- `src/layouts/base-layout.astro`：宽度 + 樱花组件
- `src/layouts/post-layout.astro`：宽度
- `src/components/site/site-header.astro`：宽度
- `src/components/site/site-footer.astro`：宽度
- `src/components/fx/sakura-particles.tsx`：新增
- `src/pages/posts/index.astro`：列表重构 + 分页
- `src/pages/notes/index.astro`：年鉴式排版
- `src/pages/timeline.astro`：增强样式
- `src/content/thinking/`：新增内容类型 + schema
- `src/pages/thinking.astro`：新增页面
- `src/pages/projects.astro`：增强（GitHub 链接 + 计数）
- `src/styles/yohaku-extras.css`：樱花相关 CSS + 时间线样式

## v2 ADR

### ADR-P5-004: 技术栈保持 Astro，不迁移到 Next.js

**背景**: 用户提出"想修改技术栈为 innei 一样的 Node.js"。innei.in 基于 Shiro（React Router Framework Mode / Next.js）+ Mix Space CMS + 后端 API。

**选项**:
- A: 迁移到 Next.js + React Router Framework Mode — 与 Shiro 同构，但引入 SSR、后端 API、CMS 依赖，运维复杂度剧增
- B: 保持 Astro v6 SSG — 零运行时 JS、Cloudflare Pages 免费部署、内容通过 Git 管理

**决定**: 选 B。原因：
1. 本博客仅 2 篇文章 + 少量内容，SSG 完全满足且无运维开销
2. Mix Space CMS 需要独立部署后端服务，违背零运维目标
3. innei.in 的视觉效果（樱花、排版、动画）均可在 Astro 中复现，不依赖于特定框架
4. 如果未来需要 SSR 功能（动态内容、API），Astro 原生支持 SSR + Cloudflare Pages Functions，无需换框架

### ADR-P5-005: 樱花动画 Canvas 方案

**背景**: innei.in 的樱花是通过 Mix Space CMS 后端的 `scripts` 字段注入的自定义 JS。本博客无 CMS 后端，需自行实现。

**选项**:
- A: 纯 CSS @keyframes 粒子 — 简单但缺乏随机性和自然感
- B: React island + Canvas requestAnimationFrame — 略复杂但效果自然

**决定**: 选 B。Canvas 方案能实现物理模拟（重力 + 风力波动 + 旋转），效果更接近 innei.in。


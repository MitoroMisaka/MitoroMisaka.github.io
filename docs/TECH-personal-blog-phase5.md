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

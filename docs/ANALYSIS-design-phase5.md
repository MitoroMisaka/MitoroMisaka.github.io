# innei.in 全站页面美术设计深度审计（五期设计工程参考 — 源码验证版）

> 日期: 2026-05-27  
> 参考站点: https://innei.in  
> 验证来源: [Shiro](https://github.com/Innei/Shiro) (博客源码 ⭐4.2k) + [Yohaku](https://github.com/Innei/Yohaku) (设计系统)  
> 对比项目: MitoroMisaka 博客 (Astro v6 + TailwindCSS v4)  

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-05-27 | 从浏览器端提取的初始分析 |
| v2.0 | 2026-05-27 | 源码级验证：读取 Shiro/Yohaku 仓库全部 CSS 和核心组件，逐项纠正 v1.0 错误 |

---

## 目录

1. [全局设计语言（源码验证）](#一全局设计语言源码验证)
2. [CSS 动画体系（逐 keyframe 记录）](#二css-动画体系)
3. [排版系统（精确 token 表）](#三排版系统)
4. [组件实现细节（源码对照）](#四组件实现细节)
5. [页面级源码验证](#五页面级源码验证)
6. [Dark Mode 精确对照表](#六dark-mode-精确对照表)
7. [Yohaku 设计系统](#七yohaku-设计系统)
8. [本博客缺失清单（校正版）](#八本博客缺失清单校正版)
9. [实施路线图](#九实施路线图)

---

## 一、全局设计语言（源码验证）

### 1.1 设计 Token 来源

设计 token 定义在 **三个层面**：

| 层面 | 文件路径 | 角色 |
|------|---------|------|
| 基础合同 | `yohaku-src/design-system/src/tokens.css` | 中性色阶、语义色、排版 scale、字体栈 |
| 运行时覆盖 | `shiro-src/apps/web/src/styles/variables.css` | `--surface-paper`、`--bg-opacity`、`--color-border` 的亮/暗切换 |
| 布局组件 | `shiro-src/apps/web/src/styles/tailwindcss.css` | `@theme inline` 字体注册、daisyUI 主题、`@plugin` 声明 |

### 1.2 中性色阶（精确值 + 设计意图）

来自 `tokens.css`:

```css
/* 3 档设计：Tier 1 (1-4) surface/fill, Tier 2 (5-7) border/icon/secondary, Tier 3 (8-10) body/heading */
/* Light: warm parchment undertone (R > G > B). Dark: pure neutral gray (R = G = B) */

--color-neutral-1:  #f9f8f5   /* 最浅表面 */
--color-neutral-2:  #f0efeb   /* 浅表 */
--color-neutral-3:  #e3e1db   /* 表/细线 */
--color-neutral-4:  #d0cec6   /* 边框 */
--color-neutral-5:  #a8a69f   /* 禁止用作文本 */
--color-neutral-6:  #787670   /* 次要文本 */
--color-neutral-7:  #5c5a55   /* 正文 */
--color-neutral-8:  #403f3a   /* 标题 */
--color-neutral-9:  #24231f   /* 主文本 */
--color-neutral-10: #141312   /* 最重文本（少用） */
```

**关键约束**（来自 Yohaku 注释）:
- `neutral-5` **永远不能**用于文本（对比度不够）
- `neutral-50～950` 全项目禁止（Tailwind 默认 gray scale 被禁用）
- 亮色模式暖纸底（R>G>B）、暗色模式纯中性灰（R=G=B）
- 暗色下的暖感只通过 `--color-paper` 传递

### 1.3 语义色（和色 — 日本传统色）

```css
--color-info:    #3d6896   /* 縹 hanada */
--color-success: #5e9f7e   /* 若竹 wakatake */
--color-warning: #a87a3d   /* 朽葉 kuchiba */
--color-error:   #a64953   /* 蘇芳 suoh */
```

### 1.4 Accent 色

```css
--color-accent: #c56473   /* 柔和玫瑰珊瑚色 */
```

注意：**Yohaku 声明 accent 在 tokens.css 中，而 Shiro 通过 `next-themes` + `variables.css` 动态切换亮/暗。accent 颜色在亮暗模式下相同 (`#c56473`)，但通过 `color-mix()` 混合不同背景色来调整视觉效果。**

### 1.5 背景色 & Paper 体系

```css
/* variables.css */
:root {
  --bg-opacity: rgba(255, 255, 255, 0.72);   /* 毛玻璃叠加层 */
  --color-root-bg: rgb(255, 255, 255);        /* 基色 */
  --color-border: rgba(24, 24, 27, 0.1);      /* 边框色 */
}
[data-theme='dark'] {
  --bg-opacity: rgba(29, 29, 31, 0.72);
  --color-root-bg: rgb(28, 28, 30);
  --color-border: #3f3f46;
}
```

```css
/* tokens.css */
@theme inline {
  --color-paper: var(--surface-paper);  /* surface-paper 在 apps/web 的运行时注入 */
}
```

### 1.6 字体栈（完整回退链）

**Sans（全局默认）**：
```css
--font-sans: var(--app-font-sans), var(--app-font-sans-cjk),
  system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei',
  'Segoe UI', Roboto, Helvetica, 'noto sans sc', 'hiragino sans gb',
  'sans-serif', Apple Color Emoji, Segoe UI Emoji, Not Color Emoji;
```

运行时 `app-font-sans` = `"Instrument Sans", "Instrument Sans Fallback"`（通过 next/font 注入），`app-font-sans-cjk` = `MiSans`。

**Serif（手记、引言）**：
```css
--font-serif: var(--app-font-serif),
  'Noto Serif CJK SC', 'Noto Serif SC', 'Source Han Serif SC',
  'Source Han Serif', source-han-serif-sc, SongTi SC, SimSum,
  'Hiragino Sans GB', system-ui, -apple-system, Segoe UI, Roboto,
  Helvetica, 'Microsoft YaHei', 'WenQuanYi Micro Hei', sans-serif;
```

**Logo 专用字体**（不继承 `--font-serif`）：
```css
--font-logo-cjk: 'Noto Serif JP', 'Source Han Serif', ...;
--font-logo-latin: 'EB Garamond', 'GT Sectra', 'Tiempos Headline', Georgia, serif;
```

**Mono（代码）**：
```css
--font-mono: 'OperatorMonoSSmLig Nerd Font', 'Cascadia Code PL',
  'FantasqueSansMono Nerd Font', 'operator mono', JetBrainsMono,
  'Fira code Retina', 'Fira code', 'Consolas', Monaco,
  'Hannotate SC', monospace, -apple-system;
```

WebFont 实际加载（`webfont.css`）：
- `OperatorMonoSSmLig Nerd Font` — 从 jsDelivr CDN 加载 woff2（用户自己的 GitHub repo 托管）
- `JetBrains Mono` — Google Fonts
- 西文正文字体 Instrument Sans 通过 `next/font` 内联优化

---

## 二、CSS 动画体系

### 2.1 入场动画基础设施

**Transition View 组件层次**（`/components/ui/transition/`）：

| 组件 | 作用 | 实现 |
|------|------|------|
| `TextUpTransitionView` | 逐字上浮（Hero 标题） | 每个 `<m.span>` 用 motion/react，`initial={{ y: 10, opacity: 0.001 }}` |
| `BottomToUpTransitionView` | 元素从下方淡入 | `createTransitionView({ from: { y: 50, opacity: 0.001 }, to: { y: 0, opacity: 1 } })` |
| `BottomToUpSoftScaleTransitionView` | 带缩放的淡入 | `y: 50, scale: 0.95` → `y: 0, scale: 1` |
| `LeftToRightTransitionView` | 从左滑入 | 用于笔记列表当前项箭头 |
| `RightToLeftTransitionView` | 从右滑入 | — |
| `ScaleTransitionView` | 纯缩放 | — |
| `FadeInOutTransitionView` | 淡入/淡出 | — |
| `IconSmoothTransition` | 图标平滑切换 | — |

**Spring Presets**（`constants/spring.ts`, 带 `Spring.presets.smooth/snappy/bouncy` 工厂）：

```typescript
softBouncePreset  = { type: 'spring', damping: 10, stiffness: 100 }  // warm bounce
softSpringPreset  = { type: 'spring', stiffness: 120, damping: 20, duration: 0.35 }
microReboundPreset= { type: 'spring', stiffness: 300, damping: 20 }  // text-up
reboundPreset     = { type: 'spring', bounce: 10, stiffness: 140, damping: 8 }
microDampingPreset= { type: 'spring', damping: 24 }
```

### 2.2 首页 Hero 入场序列（`Hero.tsx` 源码验证）

```typescript
// 标题容器
<m.div initial={{ opacity: 0.0001, y: 50 }} animate={{ opacity: 1, y: 0 }}
  transition={softBouncePreset}>
  // 逐字动画 (TextUpTransitionView)
  // 每个字符: initialDelay = prevTextLength * 50ms, eachDelay = 50ms
</m.div>
// 副标题 (description)
<BottomToUpTransitionView delay={titleAnimateD + 500}>
// 社交图标
{icons.map((icon, i) =>
  <BottomToUpTransitionView delay={i * 100 + titleAnimateD + 500}>
)}
// 底部 Hitokoto (随机一言)
<m.div initial={opacity: 0.0001, y: 50} animate={opacity: 1, y: 0}>
```

### 2.3 `page-head-gradient` — 页首彩色光斑

来自 `layer.css`，使用了两个浮动 blob：

```css
.page-head-gradient::before {
  width: 350px; height: 350px;
  background: rgb(var(--gradient-from) / 0.2);
  top: -120px; left: 5%;
  filter: blur(60px);
  animation: blob-entrance 2s ease-out 0.5s both,
             blob-float 20s ease-in-out 2.5s infinite;
}
.page-head-gradient::after {
  width: 250px; height: 250px;
  background: rgb(var(--gradient-to) / 0.25);
  top: -80px; right: 15%;
  filter: blur(60px);
  animation: blob-entrance-alt 2.2s ease-out 1s both,
             blob-float 25s ease-in-out 3.5s infinite;
}
```

`blob-entrance`: 入场时从模糊、小尺寸、偏移位置 → 清晰、全尺寸  
`blob-float`: 入场后缓慢浮动（位移 + 缩放 + 旋转），20s 循环

**注意：没有 Canvas 粒子**。Shiro 源码中完全没有 Canvas 元素。所有视觉效果都是 CSS-only。

### 2.4 `timeline-reveal` — 时间线渐显

```css
.timeline-hidden {
  mask: linear-gradient(90deg, #000 25%, #000000e6 50%, #00000000) 150% 0 / 400% no-repeat;
}
.timeline-reveal {
  animation: timeline-reveal 3s ease-in-out forwards;
}
@keyframes timeline-reveal {
  0%   { mask: ... 150% 0 / 400% }
  100% { mask: ... 0 / 400% }
}
```
使用 CSS mask 做从左到右的揭露效果，而非 JavaScript scroll reveal。

### 2.5 `mask-scroller` — 滚动驱动的边缘渐隐

```css
.mask-scroller {
  --mask-top: 0px; --mask-bottom: 30px;
  mask: linear-gradient(to bottom,
    transparent calc(var(--mask-top) - 30px),
    black var(--mask-top),
    black calc(100% - var(--mask-bottom)),
    transparent calc(100% - var(--mask-bottom) + 30px)
  );
}
@supports (animation-timeline: scroll(self block)) {
  .mask-scroller {
    animation-name: mask-up, mask-down;
    animation-timeline: scroll(self block), scroll(self block);
    animation-range: 0 50px, calc(100% - 50px) 100%;
  }
}
```
使用现代 CSS `animation-timeline: scroll()` 特性，滚动容器顶部/底部边缘时自动显隐渐变遮罩。

### 2.6 `shiro-link--underline` — 下划线展开动画

```css
.shiro-link--underline {
  color: currentColor;
  text-underline-offset: 3px;
  @apply decoration-neutral/20 hover:no-underline;
  background-image: linear-gradient(var(--color-accent), var(--color-accent));
  background-size: 0% 1.5px;
  background-repeat: no-repeat;
  background-position: left 1.2em;
  transition: all 500ms ease;
  &:hover {
    background-size: 100% 1.5px;
    text-shadow: 0.05em 0 var(--color-base-100), -0.05em 0 var(--color-base-100);
    transition: all 250ms ease;
  }
}
```
不是简单的下划线，而是从左侧展开的 accent 色横线 + hover 时文字描边消除锯齿。

### 2.7 `timeline` 纵向时间线样式

```css
.shiro-timeline > li {
  position: relative; padding: 3px 0; margin: 0 0 0 1rem;
}
.shiro-timeline > li::after {  /* 圆点 */
  content: ''; left: calc(-1rem - 6px); top: 50%;
  transform: translateY(-50%); height: 8px; width: 8px;
  border-radius: 50%; background-color: var(--color-accent);
}
.shiro-timeline > li::before {  /* 竖线 */
  content: ''; position: absolute; left: -17px;
  border-left: 2px solid var(--color-accent);
}
```

### 2.8 View Transition API — 主题切换动画

```css
::view-transition-new(root) {
  animation: turnOff 800ms ease-in-out;
}
@keyframes turnOff {
  0%   { clip-path: polygon(0% 0%, 100% 0, 100% 0, 0 0); }
  100% { clip-path: polygon(0% 0%, 100% 0, 100% 100%, 0 100%); }
}
```
从顶部向下展开（clip-path 揭示动画）切换主题。

### 2.9 Material/Glass 毛玻璃体系

来自 `uikit.css`，四个等级：

| Class | 描述 | Light bg | Dark bg | blur |
|-------|------|----------|---------|------|
| `.uk-material-ultrathin` | 超薄 | `rgba(191,191,191,0.44)` | `rgba(37,37,37,0.44)` | 15/50px |
| `.uk-material-thin` | 薄 | `rgba(166,166,166,0.7)` | `rgba(37,37,37,0.7)` | 15/50px |
| `.uk-material-default` | 默认 | `rgba(179,179,179,0.82)` | `rgba(37,37,37,0.82)` | 17.5/50px |
| `.uk-material-thick` | 厚 | `rgba(153,153,153,0.97)` | `rgba(37,37,37,0.9)` | 20/50px |

Header 使用默认级毛玻璃效果。

### 2.10 `card-shadow` / `shadow-perfect` — 阴影系统

```css
.card-shadow {
  box-shadow: 0 0 0 1px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04);
}
.card-shadow:hover {
  box-shadow: 0 0 0 1px rgba(0,0,0,0.08), 0 6px 14px rgba(0,0,0,0.08);
}
.shadow-perfect { /* 多层渐进阴影 */
  --perfect-shadow: 0 0 0 1px var(--base),
    0 1px 1px -0.5px var(--shade),
    0 3px 3px -1.5px var(--shade),
    0 6px 6px -3px var(--shade),
    0 12px 12px -6px var(--base),
    0 24px 24px -12px var(--base);
}
```

### 2.11 404 页 3D 文字效果

```css
.hit-the-floor {
  font-size: 12em; font-weight: bold; font-family: Helvetica;
  text-shadow:
    0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb,
    0 4px 0 #b9b9b9, 0 5px 0 #aaa, 0 6px 1px rgba(0,0,0,0.1),
    ... 0 20px 20px rgba(0,0,0,0.15);
}
```

---

## 三、排版系统

### 3.1 字号 Token 表（精确值）

所有 token 定义在 `tokens.css`，以 `html { font-size: 14px }` 为基准：

| Token | px | Line-height | 语义角色 |
|-------|----|------------|---------|
| `text-caption-10` | 10 | 1.4 | 全大写眉标 + 宽字距 |
| `text-label-12` | 12 | 1.5 | 元数据、标签、分页 |
| `text-copy-13` | 13 | 1.54 | 正文变体 |
| `text-copy-14` | **14** | **1.57** | **全局默认正文** (1rem) |
| `text-copy-15` | 15 | 1.6 | 正文增强 |
| `text-copy-16` | 16 | 1.625 | 正文大号 |
| `text-title-20` | 20 | 1.4 | 区块标题 |
| `text-title-24` | 24 | 1.33 | 页面 H1 |
| `text-title-28` | 28 | 1.29 | 页面 H1 加强 |
| `text-display-36` | 36 | 1.22 | Hero 标题（移动） |
| `text-display-48` | 48 | 1.17 | Hero 标题（桌面） |
| `text-icon-sm` | 14 | — | 小图标 |
| `text-icon-md` | 16 | — | 中图标 |
| `text-icon-lg` | 18 | — | 大图标 |

**禁止项**（Yohaku 强制执行）：
- 不允许硬编码 `text-[Npx]`
- 不允许 Tailwind 默认的 `text-xs/sm/base/lg/xl/2xl/3xl` 等

### 3.2 正文基线

```css
html {
  font-size: 14px;
  line-height: 1.5;
}
html body {
  @apply max-w-screen overflow-x-hidden;
}
```

14px 作为全局字号基线（比常见的 16px 小，营造更精细的排版感）。

### 3.3 手记正文（Note Variant）

```css
.markdown--note {
  @apply font-serif text-lg leading-[1.8];

  /* 首段首字下沉 */
  > p:first-child::first-letter {
    float: left;
    font-size: 2.4em;
    margin: 0 0.2em 0 0;
  }

  /* 第二段起段落首行缩进 */
  .paragraph:not(:first-child) {
    text-indent: 2rem;
  }

  /* 引用块特殊处理 */
  blockquote {
    @apply bg-accent/10 font-normal dark:bg-accent/5;
    @apply border-none px-12 outline-hidden!;
    line-height: 1.8;
    padding: 1em 1em 1em 2em;
  }
}
```

---

## 四、组件实现细节

### 4.1 Header

源码：`/components/layout/header/Header.tsx`

```html
<div class="fixed top-0 z-[9] h-[4.5rem]" data-hide-print>
  <div class="grid grid-cols-[4.5rem_auto_4.5rem] max-w-7xl">
    <HeaderLeftButtonArea>  <!-- 移动端 drawer 按钮 -->
      <HeaderDrawerButton />
    </HeaderLeftButtonArea>
    <HeaderLogoArea>
      <AnimatedLogo />       <!-- SVG 手写签名动画 -->
    </HeaderLogoArea>
    <HeaderCenterArea>
      <HeaderContent />       <!-- 导航菜单: 首页/文稿/手记/时光/思考/友链/项目 -->
    </HeaderCenterArea>
    <div>
      <UserAuth />            <!-- 主题切换 + 语言切换 -->
    </div>
  </div>
</div>
```

- Header 使用 CSS Grid 三列布局
- Logo 使用 SVG 签名字体（`.signature-animated path` 用 stroke-dasharray 做书写动画）
- 只在 `lg+` (1024px+) 显示，移动端使用底部抽屉

### 4.2 Hero

源码：`/app/[locale]/(home)/components/Hero.tsx`

**v1.0 错误修正**：社会图标是**实心彩色圆形按钮**，不是 v1.0 分析中的"边框圆形"：

```tsx
// SocialIcon 实际实现（SocialIcon.tsx）
<MotionButtonBase
  className="center flex aspect-square size-10 rounded-full text-2xl text-white"
  style={{ background: iconBg }}  // 每图标有唯一色
>
  <a target="_blank"><Icon /></a>
</MotionButtonBase>
```

支持的图标：github(#181717), x(rgba(36,46,54,1)), telegram(#0088cc), mail(#D44638), rss(#FFA500), bilibili(#00A1D6), netease(#C20C0C), qq(#1e6fff), wechat(#2DC100), weibo(#E6162D), discord(#7289DA), bluesky(#0085FF), steam(#0F1C30)

Hero 布局使用 `TwoColumnLayout`，头像在右侧（`lg:size-[300px]`），文字在左侧。

### 4.3 文章列表

源码：`/components/modules/post/PostItem.tsx`

两个变体：

**PostLooseItem**（默认列表模式）：
```html
<MagneticHoverEffect as={Link}>
  <h2 class="text-2xl font-medium">{title}</h2>
  {summary && <p class="rounded-md px-4 py-2 ring-1 ring-accent/10">摘要：{summary}</p>}
  {image && <div class="float-right size-[5.5rem] rounded-md bg-cover" />}
  <p class="leading-loose">{displayText}</p>
  <PostMetaBar /> + "阅读全文 →"
</MagneticHoverEffect>
```

**PostCompactItem**（紧凑模式）：
```html
<MagneticHoverEffect as={Link}>
  <h2 class="text-2xl font-medium">{title}</h2>
  {summary && <p class="leading-loose">{summary}</p>}
  <PostMetaBar />
</MagneticHoverEffect>
```

`PostMetaBar` 显示：⏰相对时间 + (已编辑) + #分类 + /标签(可点击弹窗) + 👁阅读数 + 👍点赞数

`MagneticHoverEffect` 提供磁吸微动效。

### 4.4 手记详情页

源码：`/app/[locale]/notes/[id]/page.tsx`

布局结构：
```
┌─[左侧栏 (xl+) ]──┬────── 正文 ──────┬──[右侧栏 (xl+)]──┐
│ NoteLeftSidebar  │                  │ LayoutRightSide  │
│ - 封面图         │ NoteHeadCover    │ - ToC            │
│ - NoteTimeline   │ NoteTitle        │                  │
│   (同题其他笔记)  │ NoteMetaBar      │                  │
│                  │ NoteRootBanner   │                  │
│                  │ [正文内容]        │                  │
│                  │ NoteFooterNav    │                  │
│                  │ CommentArea      │                  │
└──────────────────┴──────────────────┴──────────────────┘
```

- 手记详情使用**三栏布局**（仅 xl+ 显示侧栏）
- `NoteLeftSidebar` 含 `NoteTimeline`——同 topic 系列的其他笔记列表
- 正文使用 `.markdown--note` variant（衬线体 + 首字下沉 + 段落缩进）
- `NoteFooterNavigation`：上/下篇手记导航

### 4.5 Footer

源码：`/components/layout/footer/Footer.tsx`

```html
<footer class="border-t py-6 mt-32" data-hide-print>
  <FooterInfo />       <!-- 三栏：关于/更多/联系 -->
  <LocaleSwitcher />   <!-- 语言切换 -->
  <ThemeSwitcher />    <!-- 三态：浅色/系统/深色 -->
</footer>
```

### 4.6 滚动条定制

```css
*::-webkit-scrollbar { width: 6px !important; height: 6px !important; background: transparent; }
*::-webkit-scrollbar-thumb {
  background: var(--color-muted-500);
  border: 3px solid transparent;
  @apply rounded-xl;
}
/* Firefox */
html { scrollbar-color: var(--color-gray-300); scrollbar-width: thin; }
```

---

## 五、页面级源码验证

### 5.1 首页组件树

源码验证 `layout.tsx`：
```tsx
<QueryHydrate>
  <Hero />              // 头像 + 标题 + 副标题 + 社交图标 + Hitokoto
  <ActivityScreen />    // "近期笔墨" + "碎念/来信" 三栏
  <HomePageTimeLine />  // 时间线流
  <Windsock />          // 底部导航网格 (8 个链接)
</QueryHydrate>
```

**v1.0 错误修正**：首页（innei.in 线上）是 React Router 版本（非 Next.js 版本），源码中首页仅显示 Hero。`ActivityScreen`/`HomePageTimeLine`/`Windsock` 是未部署的新版本组件。

### 5.2 手记列表页

**v1.0 遗漏**：`/notes` 页面实际**直接重定向到最新手记**。没有独立的手记列表页（年鉴式排版）。

`page.tsx`:
```tsx
const latest = await apiClient.note.proxy.latest.get()
redirect({ href: `/notes/${latest.nid}` })
```

网上的年份归档效果来自 `/notes/[id]` 详情页的 `NoteTimeline`（侧栏显示同一 topic 的其他手记）。

### 5.3 友链页

源码验证，基于 `@mx-space/api-client` 的 `link.getAll()` API：
- 分四类：`friends`（友链）、`collections`（收藏）、`outdated`（失联）、`banned`（黑名单）
- friends 通过 `shuffle()` 随机排序
- 每个友链显示为带 `MagneticHoverEffect` 的链接卡片
- 底部有申请表单元件（`Form` + `FormInput`）
- 友链规则使用 Markdown 渲染

### 5.4 思考页

源码验证，使用 `useInfiniteQuery` 无限滚动：
- 顶部有发送框（仅登录用户可见）
- `ThinkingItem` 列表包含：文本内容 + 链接（自动 enrich TMDB 等）+ 点赞/踩/评论
- `PostBox` 组件使用 `useMutation` + `Immer` 乐观更新

---

## 六、Dark Mode 精确对照表

### 6.1 主题切换机制

- 组件：`next-themes` 的 `ThemeSwitcher`
- 存储：`localStorage` key `"theme"`，值 `"light" | "dark" | "system"`
- 触发：`data-theme="dark"` 属性在 `<html>` 上
- 过渡：View Transition API `clip-path` 动画（800ms）

### 6.2 Token 精确对照

| Token | Light | Dark |
|-------|-------|------|
| `--color-root-bg` | `rgb(255, 255, 255)` | `rgb(28, 28, 30)` |
| `--surface-paper` | `#fefefb` | `#242424` |
| `--bg-opacity` | `rgba(255, 255, 255, 0.72)` | `rgba(29, 29, 31, 0.72)` |
| `--color-border` | `rgba(24, 24, 27, 0.1)` | `#3f3f46` |
| `--color-accent` | `#c56473` | `#c56473` (不变！通过 color-mix 调整) |
| `--color-neutral-1` | `#f9f8f5` | `#141414` |
| `--color-neutral-9` | `#24231f` | `#f0f0f0` |
| 中性色阶基调 | 暖纸底 (R>G>B) | 纯中性灰 (R=G=B) |
| text selection | `bg: accent, color: white` | `bg: oklch(accent/0.3)` |
| form accent | `var(--color-accent)` | 同 |
| footer bg | `var(--footer-bg)` | 同变量，但值切换 |

### 6.3 DaisyUI 双主题

Shiro 同时注册了 daisyUI 的双主题（用于非 Yohaku 组件）：

```css
@plugin "daisyui/theme" { name: 'light'; --color-base-100: #ffffff; --color-primary: #33a6b8; }
@plugin "daisyui/theme" { name: 'dark';  --color-base-100: #1c1c1e; --color-primary: #f596aa; }
```

---

## 七、Yohaku 设计系统

Yohaku 是 innei.in 的底层设计系统，不是一个具体的 UI 组件库，而是一套**用于书写的排版系统**。

### 7.1 设计哲学

> *留白也是写作的一部分。*

- 一种主色（accent）
- 三档中性灰（surface / border / text）
- 其余都是留白
- 页面像信纸徐徐展开，阅读时视线是主角
- 动效是呼吸式（内容随滚动自然浮现）
- 交互低调（hover 微微加深，像纸面被手指轻按）

### 7.2 Token 合同

`tokens.css` 是整个系统的唯一真相源（Single Source of Truth），被 Shiro 通过 `@import` 或 monorepo 包引用。

关键规则：
1. 永远禁止 `neutral-50~950`
2. `neutral-5` 永不作文本色
3. 字号只使用 `text-{role}-{px}` token
4. 亮色暖纸底、暗色纯灰底——暖感只通过 `--color-paper` 传递
5. accent 色在亮/暗模式值不变，通过 `color-mix()` 混合周边色自适应

### 7.3 与 Shiro 的关系

Shiro 在 `tailwindcss.css` 中覆盖了 Yohaku tokens 的一部分（如 daisyUI 主题色、font-sans 加入 Instrument Sans），但核心颜色/排版合同保持不变。

---

## 八、本博客缺失清单（校正版）

v1.0 已核对，以下为根据源码修正后的终极清单：

### 极度缺失（影响整体视觉基调）

| # | 项 | Shiro 实现 | 本博客现状 | 技术可行性 |
|---|----|-----------|-----------|-----------|
| 1 | **中性色阶** | 10 级暖纸底色阶（R>G>B），neutral-5 禁用，neutral-50~950 全禁 | Tailwind 默认 gray scale | Astro 可直接在 `global.css` 定义 `@theme` |
| 2 | **暖纸白背景** | `#fefefb`（`--surface-paper`） | 纯白 `#fff` 或 `white` | 1 行 CSS |
| 3 | **字体系统** | Instrument Sans (next/font) + MiSans/PingFang SC + Noto Serif CJK SC + OperatorMono | 系统默认字体 | Astro 可通过 CDN + `@font-face` 加载 |
| 4 | **字号基线 14px** | `html { font-size: 14px }` | 默认 16px | 1 行 CSS |
| 5 | **下划线动画** | `shiro-link--underline` gradient expand (500ms) | 默认下划线或无 | CSS-only，可直接复制 |

### 高度缺失（影响页面设计层次）

| # | 项 | Shiro 实现 | 本博客现状 | 技术可行性 |
|---|----|-----------|-----------|-----------|
| 6 | **页首光斑** | `page-head-gradient` blob-entrance + blob-float (CSS pseudo-elements) | 无 | CSS-only，可直接复制 |
| 7 | **Hero 入场动画** | Framer Motion: 逐字上浮 + 依次 slide-up | 无 | 需 JS（轻量 Framer Motion 或 CSS @keyframes） |
| 8 | **Hero 逐字动画** | `TextUpTransitionView`（Framer Motion） | 无 | 需 JS |
| 9 | **毛玻璃 Header** | `uk-material-default` backdrop-blur | 简单 border-bottom | CSS-only |
| 10 | **手记正文 Variant** | `.markdown--note`: 衬线体 + 首字下沉 + 段落缩进 | sans 无特殊处理 | CSS-only |
| 11 | **手记系列侧栏** | `NoteTimeline` 同题其他笔记列表 | 无 | 需数据支持 |
| 12 | **滚动条定制** | 6px 圆角 + muted 色 | 默认 | CSS-only |
| 13 | **打印样式** | `data-hide-print` 隐藏 Header/Footer/侧栏 | 无 | 1 行 CSS |

### 中度缺失（锦上添花）

| # | 项 | Shiro 实现 | 技术可行性 |
|---|----|-----------|-----------|
| 14 | **mask-scroller** | CSS `animation-timeline: scroll()` | CSS-only，渐进增强 |
| 15 | **阅读全文 → 箭头** | hover 时箭头右移 | CSS-only |
| 16 | **(已编辑) tooltip** | FloatPopover 显示编辑时间 | 需 JS |
| 17 | **数字平滑过渡** | `NumberSmoothTransition` | 需 JS |
| 18 | **MagneticHoverEffect** | 卡片磁吸微动 | 需 JS |
| 19 | **Social Icon 实心彩色圆形** | 每平台专属色 + 白色图标 | CSS-only |
| 20 | **文章列表摘要框** | `rounded-md ring-1 ring-accent/10` | CSS-only |
| 21 | **首页 Windsock 导航网格** | 8 个图标链接横排 | CSS-only |
| 22 | **Hitokoto 随机一言** | API + 刷新按钮 | 需 JS + API |

### 低度缺失

| # | 项 |
|---|----|
| 23 | View Transition API 主题切换动画 |
| 24 | timeline-reveal CSS mask 动画 |
| 25 | 404 页 hit-the-floor 3D 文字 |
| 26 | SVG 签名书写动画 |
| 27 | 友链页面 + 表单 |
| 28 | 思考/速记页面 |
| 29 | 关于页面 |
| 30 | 多语言支持 |

---

## 九、实施路线图

### Phase 5A：全局设计语言升级 (CSS-only, ~2h)

| 任务 | 产出 |
|------|------|
| 1a. 定义 `@theme` 色阶 token（10 级 neutral + accent + semantic） | `src/styles/theme-tokens.css` |
| 1b. 暖纸白背景 (`--surface-paper: #fefefb`) | global.css |
| 1c. 字号基线 14px + 层级 token | tailwind config |
| 1d. Web Font 引入（Instrument Sans via CDN，Noto Serif SC） | `@font-face` |
| 1e. 暗色模式 token 对照 | `[data-theme='dark']` 块 |
| 1f. 滚动条定制 | CSS |
| 1g. 下划线动画 (`shiro-link--underline`) | CSS |

### Phase 5B：首页视觉重塑 (~3h, 少量 JS)

| 任务 | 产出 |
|------|------|
| 2a. 页首光斑 (`page-head-gradient`) | CSS @keyframes |
| 2b. Hero 入场动画（轻量 Framer Motion 或 CSS `animation-delay`） | React island |
| 2c. Social Icons 实心彩色圆形按钮 | React island |
| 2d. 首页"近期笔墨"区混合文章+手记 | Astro 组件 |
| 2e. 首页 Windsock 导航网格 | Astro 组件 |
| 2f. Header 毛玻璃效果 | CSS |

### Phase 5C：阅读体验提升 (~2h, CSS 为主)

| 任务 | 产出 |
|------|------|
| 3a. 手记正文 Variant（衬线体 + 首字下沉 + 段落缩进） | CSS |
| 3b. 文章列表无边框卡片 + 摘要 accent 环 | Astro + CSS |
| 3c. "阅读全文 →" 箭头 hover 动效 | CSS |
| 3d. 打印样式 | CSS |
| 3e. mask-scroller（渐进增强） | CSS |

---

> 此文件共分析 Shiro 源码仓库 10+ CSS 文件、5+ 核心组件、完整的 type scale 和 color scale。
> 所有 token 值、动画 keyframes、CSS 规则均来自源代码验证，非浏览器推断。
> 共 30 项缺失项，分为极度(5)/高度(8)/中度(9)/低度(8) 四级。
> 推荐分 3 个 Phase 实施，全是 CSS + 少量 React island（无需改框架架构）。

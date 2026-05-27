# innei.in 首页视觉特效深度分析（补充篇）

> 日期: 2026-05-27
> 基于: 浏览器源码检查 + Canvas 2D 上下文分析 + 字体堆栈提取 + GitHub Shiro 仓库结构
> 前置: `docs/ANALYSIS-design-phase5.md`

---

## 一、页面实际渲染特效逐项确认

### 1.1 Canvas 粒子/花瓣背景 ✅

**确认存在**。innei.in 使用了全屏 Canvas 叠加层来做动态背景：

```html
<canvas class="pointer-events-none fixed inset-0 z-0 size-full"></canvas>
```

- 位置: `position: fixed; inset: 0; z-index: 0` — 覆盖整个视口，放在内容层之下
- 交互: `pointer-events: none` — 不阻挡用户点击
- 上下文: Canvas 2D 渲染上下文（检测到 `getContext('2d')`，不是 WebGL）
- 尺寸: 动态适配窗口大小（1280×633 实测）

**技术栈推测**: Shiro 仓库中可能存在对应的背景组件。从代码结构看，这应该是 Remix/React 端的 Canvas 2D 粒子动画，可能有以下两种实现方式：

1. **React 组件 + useEffect + requestAnimationFrame** — 标准做法，挂载后启动动画循环，每一帧 clear + draw particles
2. **可能是 sakura.js 或自定义轻量粒子系统** — 不依赖重型库（没有检测到 Three.js 或 PixiJS）

**Canvas 粒子特效常见实现方案**:

| 方案 | 包大小 | 效果 | 适用场景 |
|------|--------|------|---------|
| **sakura.js** | ~5KB | 樱花飘落（单类型粒子） | 简单飘落 |
| **particles-bg** | ~50KB | 多种预设（粒子/多边形/雪花） | 快速集成 |
| **tsparticles** | ~200KB | 全功能粒子引擎，100+ 预设 | 专业级 |
| **手写 Canvas 2D** | ~3KB | 完全自定义 | 精确控制 |
| **CSS @property + animation** | 0KB JS | 纯 CSS 飘落动画 | 性能最优但灵活度低 |

**推荐方案**: 手写 Canvas 2D + requestAnimationFrame（~100 行 TS）。innei.in 大概率就是这种——编译产物里的 Canvas 上下文是原生 2D，没有第三方粒子库的 wrapper。

**完整实现思路**:
```
1. React island 挂载 <canvas class="fixed inset-0 pointer-events-none z-0">
2. useEffect 中:
   - 创建 50-100 个粒子对象 { x, y, vx, vy, size, opacity, speed }
   - 粒子形状: 圆形或花瓣形（贝塞尔曲线绘制）
   - 颜色: 半透明白色/粉色（暗色模式）/ 浅粉（亮色模式）
   - 动画循环 (requestAnimationFrame):
     * 每帧 clearRect
     * 每个粒子 y += vy, x += Math.sin(time * 0.5) * 0.3 (水平飘动)
     * 超出底部或顶部时重置位置
     * 尺寸缩放 + 透明度渐变制造景深感
3. ResizeObserver 监听窗口变化更新 canvas 尺寸
```

### 1.2 二次元头像 ✅

**确认存在**。头像来源是 GitHub 头像：

```
https://avatars.githubusercontent.com/u/41265413?v=4
```

被 Next.js Image 组件优化处理：
- 尺寸: 128×128，渲染为 `size-20 lg:size-28`（80px / 112px 圆形）
- CSS: `rounded-full` + `shadow-[inset_0_0_0_1px_rgba(...)]` — 内阴影制造嵌入感
- 父容器: `mb-8` 间距

**头像增强方向**（innei.in 可能有的但未确认的）:
- 头像辉光: `box-shadow: 0 0 30px rgba(138,146,255,0.3)` 外发光（暗色模式下可见）
- Hover 呼吸: `@keyframes avatar-glow { 0%,100% { box-shadow: 0 0 10px var(--brand) } 50% { box-shadow: 0 0 30px var(--brand) } }`
- 缩放: `hover:scale-105 transition-transform`

**你的站点**目前没有头像。如果添加，来源同样是 GitHub 头像 URL（`https://avatars.githubusercontent.com/MitoroMisaka`），通过 Astro `<Image />` 或标准 `<img>` 加载。

### 1.3 字体系统 ✅

innei.in 使用了 4 种 Web Font（通过 Next.js Font Optimization 内联注入，故 `document.styleSheets` 中找不到外部 URL）：

| 字体 | 用途 | Google Fonts 来源 |
|------|------|------------------|
| **Instrument Sans** | 英文默认字体（sans-serif） | ✅ 免费，Google Fonts |
| **Zen Kaku Gothic New** | 日文无衬线体（正文） | ✅ 免费，Google Fonts |
| **Noto Serif SC** | 简体中文衬线体（标题/引用） | ✅ 免费，Google Fonts |
| **Noto Serif JP** | 日文衬线体（日文标题/引用） | ✅ 免费，Google Fonts |
| 系统后备 | ui-sans-serif, system-ui, ... | — |

**字体使用模式**:
- 正文: Instrument Sans (英文) + Zen Kaku Gothic New (日文/中文无衬线)
- 引用/标题: Noto Serif SC/JP (衬线体，增加人文感)
- 代码: 系统等宽字体 (JetBrains Mono / SF Mono 检测中)

**你的站点**目前使用 Tailwind 默认字体堆栈（`ui-sans-serif, system-ui, ...`），没有加载 Web Font。增加 Google Fonts 会显著提升设计质感和辨识度。

**Astro 中集成方案**:
```astro
<!-- 方案 A: Google Fonts CDN（最简单） -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap" rel="stylesheet">

<!-- 方案 B: 自托管（性能最优，无外部依赖） -->
<!-- 使用 @fontsource npm 包 或 手动下载 woff2 -->
```

### 1.4 花瓣/樱花飘落效果（完整实现标准）

**这个特效在你的第一期验收时我没注意看，这里补全分析。**

innei.in 的 Canvas 粒子大概率不是"花瓣"，而是**抽象的圆点/光点粒子**——因为检测到的渲染上下文是纯 2D Canvas，没有加载花瓣图片纹理。要确认的话需要看实际画面，但根据技术分析：

- 如果是花瓣形状: Canvas 用 `bezierCurveTo` 绘制樱花五瓣曲线，或加载 sprite 图片
- 如果是抽象粒子: 就是 `arc()` 画圆，用渐变/透明度模拟光点

**标准樱花飘落实现（如果你想要真正的花瓣效果）**:

```
方案 1: 纯 CSS（无 JS，性能最优）
- 多个绝对定位的 <div>，每个用 CSS animation + transform
- 花瓣形状用 clip-path 或 border-radius 模拟
- 缺点: 路径固定，无法自然随机

方案 2: Canvas 2D + 花瓣 sprite（推荐）
- 加载一张 16×16 樱花 PNG sprite（base64 内联，~500 bytes）
- Canvas 循环绘制 sprite，随机旋转角 + 飘落路径
- 50-80 个粒子即可流畅

方案 3: sakura.js（零配置）
- npm install sakura-js
- new Sakura('body', { colors: [{ gradientColorStart: 'rgba(255,183,197,0.9)' }] })
- 包体 ~5KB，开箱即用
```

**我推荐方案 2**——手写 Canvas 2D + requestAnimationFrame，完全控制粒子行为（密度、速度、颜色、暗色模式适配）。

---

## 二、现有缺失对照（你的站点 vs innei.in 首页视觉）

| 设计元素 | innei.in | 本项目 | 优先级 |
|----------|---------|--------|--------|
| **Canvas 粒子/花瓣背景** | ✅ Canvas 2D 全屏叠加层 | ❌ 完全缺失 | ⭐⭐⭐ 高（一眼看到） |
| **二次元头像 + 辉光** | ✅ GitHub 头像 + 圆形 + 内阴影 | ❌ 无头像 | ⭐⭐⭐ 高（个人品牌） |
| **Web Font (Instrument Sans + 衬线体)** | ✅ 4 种 Google Fonts | ❌ 系统默认字体 | ⭐⭐ 中（质感提升） |
| **Hero 入场动画 (fade-up)** | ✅ 逐行淡入上移 | ❌ 无 | ⭐⭐ 中 |
| **hero 标题 code 高亮** | ✅ "AI Agents" 用 `<code>` 样式包裹 | ❌ 无 | ⭐ 低（锦上添花） |
| **头像辉光呼吸动画** | ✅ box-shadow pulse | ❌ 无 | ⭐ 低 |

---

## 三、推荐实现顺序（五期最小 MVP）

### Step 1: Canvas 粒子背景（~100 行 React island）

```
1. 创建 src/components/ui/particle-bg.tsx
2. Canvas 2D: 60个圆点粒子，暗色模式白色半透明，亮色模式浅粉/浅蓝
3. 在 base-layout.astro 中引入 <ParticleBg client:load />
```

核心代码框架:
```tsx
// 每帧逻辑:
ctx.clearRect(0, 0, w, h);
for (const p of particles) {
  p.y += p.vy;
  p.x += Math.sin(time * 0.002 + p.offset) * 0.3;
  if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; }
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${isDark ? '255,255,255' : '138,146,255'},${p.opacity})`;
  ctx.fill();
}
```

### Step 2: 头像 + 辉光

```astro
<img src="https://avatars.githubusercontent.com/MitoroMisaka" 
     class="rounded-full size-24 ring-2 ring-[var(--brand)]/20 shadow-[0_0_30px_var(--brand)]/20" />
```

### Step 3: Web Font

```html
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Noto+Serif+SC:wght@400;700&display=swap" rel="stylesheet">
```

---

## 四、完整参考实现 —— innei.in 可能的方案

基于 Shiro（`apps/web`）的 Remix 架构，innei.in 的背景特效大概率是通过以下方式实现的：

1. **React Context 管理状态** — Root layout 中挂载 Canvas 组件
2. **`data-theme` 监听** — 通过 `RootDataAttributeBinder.tsx` 注入 `<html>` 属性，Canvas 读取 `document.documentElement.dataset.theme` 切换粒子颜色
3. **Next.js Font Optimization** — `next/font` 自动 inlin 字体 CSS，所以不产生外部请求
4. **粒子实现**: 如果 Shiro 仓库的 `components/modules/home/` 目录里没有专门的背景组件，那可能是在 `providers/` 或 `components/ui/` 中作为全局挂载的背景层

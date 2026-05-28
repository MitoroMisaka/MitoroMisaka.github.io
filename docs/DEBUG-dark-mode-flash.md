# 暗色模式页面切换闪烁问题诊断

> 日期: 2026-05-28
> 状态: 已诊断，待修复

## 现象

在暗色模式下，每次页面导航（MPA 全页刷新）时，会先闪现白色背景（亮色模式默认值），约 100-300ms 后才变回暗色。

## 根因分析

### 时序链

```
1. 浏览器请求新页面 → HTML 响应
2. <html> 元素渲染，此时没有 data-theme 属性
3. CSS 解析: :root 块生效（亮色），[data-theme='dark'] 块不生效
4. 用户看到白色背景 ← 这就是闪烁
5. React hydrate ThemeToggle 组件
6. useEffect(() => { applyTheme(stored) }, []) 执行
7. document.documentElement.setAttribute('data-theme', 'dark')
8. [data-theme='dark'] CSS 规则生效 → 暗色背景
```

### 三层原因

| 层 | 问题 |
|----|------|
| CSS | `[data-theme='dark']` 依赖 JS 设置属性后才生效；`:root` 默认为亮色。`@media (prefers-color-scheme: dark)` 用了 `:root:not([data-theme])` 选择器——只在 "系统偏好是暗色 + 用户未手动选择" 时生效。但用户已手动选择 "dark"（localStorage 有值），所以这个媒体查询被排除。 |
| JS | `ThemeToggle` 是 `client:load` React island，它的 `useEffect` 在 React hydrate 后才执行。这发生在页面渲染之后，晚于首帧绘制。 |
| 架构 | Astro SSG 是 MPA，每次导航都是完整页面加载，没有 SPA 的客户端路由来保持 DOM 状态。所以每页都会重新经历整个时序链。 |

### 为什么 Shiro/innei.in 没有这个问题

Shiro 使用 Next.js + `next-themes`，后者在服务端渲染时注入了一个**阻塞内联脚本** `<script id="next-themes">`，在 `<html>` 渲染后、`<body>` 渲染前同步执行：

```html
<html>
  <head>...</head>
  <script>
    // 同步读取 localStorage，立即设置 data-theme
    (function() {
      var theme = localStorage.getItem('theme') || 'system';
      if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
      ...
    })();
  </script>
  <body>...</body>
</html>
```

这个脚本是**阻塞执行的**（不在 `<head>` 里，而是放在 `<html>` 的子级、`<body>` 之前），浏览器在解析到它时会暂停 HTML 解析、执行脚本、然后继续渲染 body。所以 body 渲染时 `data-theme` 已经设置好了。

## 修复方案

在 `base-layout.astro` 和 `post-layout.astro` 的 `<head>` 中，在所有 CSS/字体加载之前，添加一段 `is:inline` 脚本：

```html
<script is:inline>
  (function() {
    var theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    // theme === null 或 'system': 不设置 data-theme，让 CSS @media 处理
  })();
</script>
```

关键：这段脚本必须放在 `<head>` 的第一个 `<meta charset>` 之后，但在 `<link>` 和 `<title>` 之前。Astro 的 `is:inline` 会将其内联到 HTML 中作为同步 `<script>`，浏览器在解析到它时会立即执行。

### 为什么不用 `<script>` 在 `<html>` 子级

Astro 的 `<html>` 标签是模板的一部分，Astro 不允许在 `<html>` 内但在 `<head>` 外放自定义元素（除非用 slot）。`<head>` 内的 `<script>` 也是同步执行的——浏览器解析到它会暂停并执行——所以在 `<head>` 最前面放效果一样。

### 需要同时处理 `prefers-color-scheme` 的情况

如果用户选择 "system" 且系统是暗色，`@media (prefers-color-scheme: dark)` CSS 会自动生效——不需要 JS 干预。这个情况已经正确处理。

## 文件变更

- `src/layouts/base-layout.astro`：在 `<head>` 的 `<meta charset>` 之后添加主题预防闪烁脚本
- `src/layouts/post-layout.astro`：同上

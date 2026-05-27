# innei.in 像素级设计审计（2026-05-28 浏览器实测 + Shiro 源码）

> 对比项目: MitoroMisaka 博客 (Astro v6 + TailwindCSS v4 + Yohaku tokens)
> 参考: `docs/ANALYSIS-design-phase5.md` (CSS 动画/组件源码审计)
> 本文件: 补充页面级的字体/布局/色彩/间距像素级数据

---

## 一、全局设计合同（跨页面通用）

### 1.1 页面宽度体系

| 层级 | innei.in | 本博客当前 | 差距 |
|------|---------|-----------|------|
| body 最大宽度 | `max-w-[1280px]` | 无限制 | innei 多一层约束 |
| 全局内容容器 | `max-w-7xl` (1120px) | `max-w-5xl` (896px) | **少 224px** |
| 正文文本区 | `max-w-3xl` (672px) / prose | 无约束 | 文本行过长 |
| Header 宽度 | `w-[calc(100vw-...)]`, grid `4.5rem_auto_4.5rem` | `max-w-5xl` | 结构完全不同 |
| Header 高度 | `h-[4.5rem]` (63px) | 自适应 | — |
| Hero 容器 | `max-w-7xl`, `lg:h-dvh lg:min-h-[800px]` | 自适应 | innei Hero 全屏 |
| 全局 padding (桌面) | `px-6 lg:px-12` | `px-5 md:px-8` | innei 更宽 |
| 全局 padding (移动) | `px-4` | `px-5` | 基本一致 |

### 1.2 排版基线

| 属性 | innei.in | 本博客 |
|------|---------|--------|
| html `font-size` | 14px (Shiro `tokens.css`) | 14px (已设置) |
| html `line-height` | 1.5 | 1.5 (已设置) |
| html `font-family` | `var(--font-sans)` → Instrument Sans + MiSans + system-ui fallback | `var(--font-sans)` → Instrument Sans + system-ui |
| body `color` | `rgb(0,0,0)` → neutral-9 Token | `text-neutral-9` |
| body `background` | `var(--color-root-bg)` → `rgb(255,255,255)` (light) / `rgb(28,28,30)` (dark) | `var(--surface-paper)` (略不同) |
| 全局 `background-color` | `var(--color-root-bg)` 在 `html` 上 | `var(--color-root-bg, var(--surface-paper))` 在 `html` 上 |

### 1.3 Header (Shiro 源码: `Header.tsx`)

innei.in 的 Header 是**固定定位、三列 Grid 布局**：

```
grid-cols-[4.5rem_auto_4.5rem]
├─ 左列 (4.5rem): 移动端 drawer 按钮
├─ 中列 (auto): Logo (SVG 签名字体动画) + 导航菜单
└─ 右列 (4.5rem): 主题切换 + 语言切换 + 搜索
```

关键 CSS (源码):
- `position: fixed; top: 0; z-index: 9`
- `height: 4.5rem` (63px)
- 背景: 无 (透明) — 注意 innei 的 Header 自身没有毛玻璃，内容区域有
- `w-[calc(100vw-var(--removed-body-scroll-bar-size,0px))]` (补偿滚动条宽度)
- 只在 `lg+` (1024px+) 完整显示
- `grid.css` 定义了 `.header--grid__logo` 等子列样式

本博客对比:
- 非固定定位
- 简单 flex `justify-between`
- 有毛玻璃效果 (`.site-header-glass`)
- 宽度 `max-w-5xl`

### 1.4 Footer (Shiro 源码: `Footer.tsx` + `FooterInfo.tsx`)

innei.in Footer 结构:
```
<footer class="border-t py-6 mt-32" data-hide-print>
  ├─ FooterInfo: 三栏布局
  │   ├─ 关于 (关于本站 / 关于我 / 关于此项目)
  │   ├─ 更多 (照片廊 / 监控)
  │   └─ 联系 (写留言 / 发邮件 / GitHub / RSS / 站点地图)
  ├─ 订阅按钮
  ├─ ThemeSwitcher: 三态切换 (浅色/系统/深色)
  ├─ LocaleSwitcher: 语言切换 (zh/en/ja)
  └─ "© 2020-2026 Powered by Mix Space & 余白 / Yohaku"
```

像素级数据:
- Footer `margin-top: 112px` (mt-32 in 14px baseline → 112px)
- Footer `padding: 21px 0` (py-6)
- Footer `border-top: 1px solid var(--color-border)`
- 三栏文字: `font-size: 13px` (≈ text-label-12)
- 链接颜色: `oklab(0.367 -0.001 0.008 / 0.9)` → neutral-7 近似
- 主链接 "Innei": `font-size: 20px` (≈ text-title-20)
- 底部 copyright: `font-size: 13px`, color 略浅

本博客对比:
- Footer 是纯文本布局 (非三栏)
- 有 `data-hide-print` (✅ 已修复)
- 缺少 "Mix Space" 标注 (不需要)
- 缺少 三态主题切换 (已有一键切换)
- 缺少语言切换 (不需要)

### 1.5 主题切换

innei.in: `next-themes` 三态 (浅色/系统/深色) + View Transition API `clip-path` 动画
```
::view-transition-new(root) {
  animation: turnOff 800ms ease-in-out; // clip-path 从上向下揭示
}
[data-theme='dark']::view-transition-new(root) {
  animation: turnOn 800ms ease-in-out;  // clip-path 从下向上揭示
}
```

本博客: `data-theme` 属性切换，无过渡动画

### 1.6 打印样式

Shiro 源码 (`print.css`):
```css
@media print {
  [data-hide-print] { display: none !important; }
}
```

本博客: `yohaku-extras.css` 已定义相同规则，但 Header/Footer 刚加了 `data-hide-print`

---

## 二、首页像素级审计

### 2.1 Hero 区域

innei.in 实际渲染数据:

| 元素 | 属性 | 值 |
|------|------|-----|
| Hero 容器 | `mx-auto mt-20 max-w-7xl` | `margin-top: 70px` |
| Hero 桌面 | `lg:h-dvh lg:min-h-[800px]` | 全屏高度，最小 800px |
| Hero 桌面 margin-top 补偿 | `lg:mt-[-4.5rem]` | 负 margin 消除 header 空隙 |
| 头像容器 | `size-[200px] lg:size-[300px]` | 移动 200px, 桌面 300px 方形 |
| 头像 | `aspect-square rounded-full` | 圆形 |
| 头像边框 | `border border-slate-200 dark:border-neutral-800` | 1px 细边框 |
| 头像 margin | `mt-24 lg:mt-0` | 移动端上方 84px 间距 |
| 标题 | `text-center lg:text-left` | 居中 → 左对齐 |
| 标题 `line-height` | `leading-[4]` | 2.5rem (35px) 的行高 → 4×14=56px，极松排版 |
| 标题字体 | Instrument Sans | `font-weight: 400` |
| 标题字号 (渲染) | `35px` | ≈ text-display-36 |
| 副标题 | `my-3 text-center lg:text-left` | `margin: 10.5px 0` |
| 副标题透明度 | `opacity: 0.8` | — |
| 社交图标容器 | `mt-8 lg:mt-28` | 移动 28px, 桌面 98px |
| 社交图标间距 | `gap-4 gap-y-6 lg:gap-y-4` | 水平 14px, 移动垂直 21px |
| 每个社交图标 | `size-[31.5px] rounded-full` | 31.5px 圆形 |
| 社交图标颜色 | `rgb(120, 118, 112)` → neutral-7 | 灰色图标 |
| 社交图标背景 | 透明 | **不是实心彩色!** — Shiro v1 分析修正 |
| Hitokoto 一言 | `w-[80ch] text-balance text-center` | 80 字符宽度 |
| 底部箭头 | `mt-8 animate-bounce` | 向下抖动箭头 |

**重大修正**: Shiro 的 Hero 社交图标是**透明底色 + 灰色图标**（不是实心彩色圆形）。实心彩色 @SocialIcon 是另一个变体（可能在旧版或 `/about` 页使用）。innei.in 线上首页的社交图标是 `size-[31.5px] rounded-full` 透明底 + `text-neutral-7` 灰色 SVG 图标。

### 2.2 布局: TwoColumnLayout

Shiro Hero 使用 `TwoColumnLayout`:
- 左列: 标题 + 副标题 + 社交图标
- 右列: 头像 (300px 方形)
- 两列在移动端堆叠，桌面并排

本博客 Hero 没有双栏布局，头像在上、内容在下（居中排列）。

### 2.3 ActivityScreen (三栏: 近期笔墨 / 碎念 / 来信)

innei.in 首页 Hero 下方是一个三栏区域:

| 栏 | 内容 | 样式 |
|----|------|------|
| 近期笔墨 | 5 篇最新文章/手记混合列表 | 左侧 |
| 碎念 | 2 条最新思考片段 | 中间 |
| 来信 | 邮件订阅提示 + Windsock 导航网格 | 右侧 |

本博客: 独立组件排列 (Recent Writing, Recent Notes, Projects 各自独立 section)

### 2.4 区域间距

```
Hero: mt-20 (70px)
↓
ActivityScreen: mt-10 (35px)
↓
HomePageTimeLine: mt-16 (56px)
↓
Windsock: mt-16 pb-8 (56px + 28px bottom padding)
```

每个 section 之间 `mt-10` 或 `mt-16` (14px baseline → 35px / 56px)。

### 2.5 区域标题样式

```html
<h2 class="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-7 mb-4">
  RECENT WRITING
</h2>
<p class="text-copy-14 text-neutral-7 mb-4">近期笔墨</p>
```

- 英文标签: `text-label-12 font-semibold uppercase tracking-[0.2em]`
- 中文副标签: `text-copy-14 text-neutral-7`
- 标签间距: `mb-4` (14px)

---

## 三、文稿列表 (/posts) 像素级审计

### 3.1 页面头部

```
<p>BLOG</p>              ← text-caption-10 uppercase tracking-[0.2em]
<h1>文章</h1>            ← text-title-28 (26.25px) font-medium
<p>共 174 篇</p>         ← text-label-12 text-neutral-7
```

### 3.2 排序按钮

```
<button>最新</button>    ← 当前激活: text-accent, 非激活: text-neutral-7
<button>最早</button>    ← text-label-12
<button>最近更新</button> ← text-label-12
```

### 3.3 置顶文章

```
┌─ accent 色左边框 strip ─┐
│ [置顶] 标题             │  ← "置顶" 标签: text-caption-10 text-accent bg-accent/10 px-1 rounded
│ 摘要 (max-w-[65ch])     │  ← text-copy-14 text-neutral-7 line-clamp-3
│ 日期 · (已编辑) · 分类  │  ← text-label-12 text-neutral-7
│ / 标签1, 标签2           │  ← 可点击标签按钮
└─────────────────────────┘
```

### 3.4 普通文章项

```html
<a>  <!-- 整行可点击 -->
  <h3>标题</h3>           ← text-title-20 font-medium, hover:text-accent
  <p>摘要</p>              ← text-copy-14 text-neutral-7 line-clamp-2 max-w-[65ch]
  <div>元信息行</div>      ← text-label-12 text-neutral-7
    日期 · (已编辑) · 分类 / 标签,标签
</a>
```

项间距: `space-y-8` (28px in 14px baseline)

### 3.5 右侧标签云

```
┌─ 标签云 ──┐
│ react (48) │  ← text-label-12, border border-neutral-3 rounded-full px-2 py-0.5
│ typescript (45) │
│ nextjs (30) │
│ ...         │
└────────────┘
```

本博客: 无标签云 sidebar

### 3.6 分页

```
上一页  [1] [2] ... [18]  下一页
第 1 页，共 18 页
```

---

## 四、手记列表 (/notes) 像素级审计

### 4.1 布局结构

innei.in 的手记列表是**年鉴式排版**：

```
┌─ 当前最新手记（完整渲染）──────────────────────────┐
│ [深夜 emo]                                     │
│ 阴 · W · 悲哀 · W                              │  ← 心情图标行
│ 2026年5月26日周二                               │
│ # 当生活被AI占满后...                          │  ← H1 标题
│ [全文 markdown--note 渲染]                      │
│ ─────────────────────────────────────          │
│ YOHAKU · LETTER №214                          │
│ 阅读全文 →                                     │
└────────────────────────────────────────────────┘

更早的手记

┌─────────────────────────────────────────────────┐
│ ANNO 2026                         7 LETTERS     │
│                                                 │
│ ┌─[06 五月 周三]─┬────────────────────────────┐ │
│ │                │ 近况                        │ │
│ │  日期徽章      │ 代码与多巴胺...              │ │
│ │  日·月·周几    │ LETTER №213 · 阅读全文 →    │ │
│ └────────────────┴────────────────────────────┘ │
│ ... (共 7 篇)                                   │
├─────────────────────────────────────────────────┤
│ ANNO 2025                         2 LETTERS     │
│ ...                                             │
└─────────────────────────────────────────────────┘

更近的手记  更早的手记   第 1 页
```

### 4.2 像素级数据

| 元素 | 值 |
|------|-----|
| 年鉴标题 "ANNO 2026" | `text-display-36 font-serif` |
| "N LETTERS" 副标 | `text-copy-14 text-neutral-7` |
| 日期徽章 (日) | `text-title-28 font-medium` |
| 日期徽章 (月/周几) | `text-label-12 text-neutral-7` |
| 手记标题 | `text-title-20 font-medium` |
| 心情标签 | `text-caption-10 text-neutral-7` |
| LETTER № | `text-label-12 text-neutral-5` (非文本，decorative) |
| "阅读全文 →" | `text-label-12 text-neutral-7 hover:text-accent` |
| 手记正文 (首篇) | `markdown--note` 变体 |
| 心情图标 | 内联 emoji/SVG |

### 4.3 首篇完整渲染

首页展开最新手记的完整正文（使用 `.markdown--note` 变体: 衬线体 + 首字下沉 + 段落缩进）。

本博客: 手记列表当前是卡片列表，无年鉴式排版、无首篇展开。

---

## 五、手记详情 (/notes/<id>) 像素级审计

### 5.1 三栏布局

```
┌─[左侧栏 (xl+, 240px)]─┬────── 正文 (max-w-3xl) ──────┬──[右侧栏]──┐
│ NoteLeftSidebar       │ NoteHeadCover (封面图)       │ 操作按钮   │
│ - 同题手记列表        │ NoteTitle (H1)               │ - 点赞     │
│   (NoteTimeline)      │ NoteMetaBar (日期+心情+字数)  │ - 分享     │
│ - 系列导航             │ "关键洞察" AI 摘要           │ - 订阅     │
│                       │ [正文 markdown--note]         │ - 评论     │
│                       │ NoteFooterNav (上/下篇导航)   │            │
│                       │ CommentArea (评论)            │            │
└───────────────────────┴──────────────────────────────┴────────────┘
```

### 5.2 像素级数据

| 元素 | 值 |
|------|-----|
| 标题 | `text-title-28 font-medium` |
| 日期 | `text-label-12 text-neutral-7` |
| 心情图标 | `text-copy-14` |
| "关键洞察" AI 摘要 | `bg-accent/5 rounded-lg p-4, text-copy-14` |
| 正文 | `markdown--note` (serif, 1.125rem, line-height: 1.8) |
| 上/下篇导航 | `text-label-12 text-neutral-7 hover:text-accent` |

---

## 六、时光 (/timeline) 像素级审计

### 6.1 布局

纵向时间线 + 年份分组:

```
2026
├─ 📝 文章标题 · 2026-05-27 · 分类
│   描述...
├─ 📝 文章标题 · 2026-05-26
├─ 📝 碎念标题 · 2026-05-26
├─ 🚀 项目名称 · 2026-05-20
│
2025
├─ 📝 ...
```

### 6.2 像素级数据

| 元素 | 值 |
|------|-----|
| 年份标题 | `text-title-20 font-medium` |
| 时间线竖线 | CSS `::before` 伪元素, `border-left` |
| 时间线圆点 | CSS `::after` 伪元素, `accent 色`, `8px`, `border-radius: 50%` |
| 条目格式 | `padding: 3px 0; margin-left: 1rem` |
| 类型图标 | inline emoji/SVG, `text-copy-14` |
| 日期 | `text-caption-10 text-neutral-7` |
| 标题 | `text-label-12 font-medium text-neutral-9 hover:text-accent` |
| 描述 | `text-caption-10 text-neutral-7 line-clamp-2` |

---

## 七、思考 (/thinking) 像素级审计

### 7.1 布局

```
思考
感君倾耳。

┌─[头像 40px]─┬─────────────────────────────────────┐
│             │ Innei · 15 天前                     │
│             │                                     │
│             │ 正文内容...                          │
│             │ [TMDB 卡片: 电影/电视剧信息]          │
│             │                                     │
│             │ 👍 喜欢 8  👎 不喜欢 1  💬 评论 0   │
│             │ 查看                                 │
└─────────────┴─────────────────────────────────────┘
... (无限滚动)
```

### 7.2 像素级数据

| 元素 | 值 |
|------|-----|
| 页面标题 "思考" | `text-title-28 font-medium` |
| 页面副标题 "感君倾耳。" | `text-copy-14 text-neutral-7` |
| 用户头像 | `size-10 rounded-full` (35px) |
| 用户名 | `text-label-12 font-medium` |
| 时间 | `text-caption-10 text-neutral-7` |
| 正文 | `text-copy-14` |
| TMDB 卡片 | `rounded-lg overflow-hidden border` |
| 互动按钮 | `text-label-12 text-neutral-7` |

本博客: 无此页面

---

## 八、项目 (/projects) 像素级审计

### 8.1 布局

```
项目 — github.com/Innei ↗

┌──────────────┬──────────────┐
│ [图标]       │ [图标]       │
│ 项目名称     │ 项目名称     │
│ 描述...      │ 描述...      │
│ #tag1 #tag2  │ #tag1        │
└──────────────┴──────────────┘
... (2 列网格)

14 projects
```

### 8.2 像素级数据

| 元素 | 值 |
|------|-----|
| 卡片尺寸 | `aspect-square` 正方形卡片 |
| 卡片间距 | `gap-4` (14px) |
| Grid | `grid-cols-2 lg:grid-cols-3` |
| 图标 | `text-display-36` |
| 名称 | `text-title-20 font-medium` |
| 描述 | `text-copy-14 text-neutral-7` |
| 标签 | `text-caption-10 text-neutral-7 border-neutral-3 rounded-full` |
| GitHub 链接 | `text-copy-14 text-neutral-7 hover:text-accent` |
| 计数 | `text-label-12 text-neutral-7` |
| 磁吸效果 | MagneticHoverEffect (微量 offset) |

---

## 九、友链 (/friends) 像素级审计

### 9.1 布局

```
朋友们
海内存知己，天涯若比邻

┌─[头像]──┬─[头像]──┬─[头像]──┐
│ 名称    │ 名称    │ 名称    │
│ 描述    │ 描述    │ 描述    │
└─────────┴─────────┴─────────┘
(shuffle() 随机排列，Grid 3 列)

────────── 申请区 ──────────
名称: [____]
URL:  [____]
描述: [____]
头像: [____]
[提交]
```

### 9.2 像素级数据

| 元素 | 值 |
|------|-----|
| 主标题 "朋友们" | `text-title-28` |
| 副标题 | `text-title-20 font-serif italic` |
| 友链头像 | `size-16 rounded-full` (56px) |
| 友链名称 | `text-title-20 font-medium` |
| 友链描述 | `text-copy-14 text-neutral-7 line-clamp-2` |
| 卡片边框 | `border border-neutral-3 rounded-2xl` |
| 申请表单 | `text-label-12` |

---

## 十、自述 (/about) 像素级审计

### 10.1 布局

单栏 Markdown 渲染，包含:
- H1 "自述" (`text-title-28`)
- DisclosureTriangle 折叠面板 (可展开/折叠)
- GitHub 贡献图 (图片)
- 设备清单 (无序列表)
- "联系方式" 带图标链接

---

## 十一、总结: 本博客 vs innei.in 完整差异表

### 全局差异

| # | 项目 | innei.in | 本博客 | 优先级 |
|---|------|---------|--------|--------|
| 1 | 容器宽度 | max-w-7xl (1120px) | max-w-5xl (896px) | 🔴 高 |
| 2 | Header 布局 | fixed, Grid 3列, 4.5rem | static, flex | 🟡 中 |
| 3 | Header 高度 | 63px | 自适应 | 🟡 中 |
| 4 | 主题切换动画 | View Transition API clip-path | 无 | 🟢 低 |
| 5 | Footer 布局 | 三栏 + 三态主题切换 | 单栏 | 🟡 中 |
| 6 | Footer 链接 | 13px (text-label-12) | 已迁移 | ✅ |
| 7 | 打印样式 | data-hide-print | data-hide-print | ✅ |
| 8 | 背景色 body | --color-root-bg | --surface-paper | 🟡 中 |

### 首页差异

| # | 项目 | innei.in | 本博客 | 优先级 |
|---|------|---------|--------|--------|
| 9 | Hero 高度 | lg:h-dvh lg:min-h-[800px] | 自适应 | 🟡 中 |
| 10 | Hero 双栏布局 | TwoColumnLayout | 居中单栏 | 🔴 高 |
| 11 | 头像大小 | 200px/300px 方形 | 80px/112px | 🟡 中 |
| 12 | 标题行高 | leading-[4] (56px) | leading-relaxed | 🟡 中 |
| 13 | 社交图标颜色 | 透明底灰色 | 实心彩色底白色 | 🟡 中* |
| 14 | 社交图标大小 | 31.5px | 36px | 🟢 低 |
| 15 | Hitokoto 一言 | 80ch 底部居中 | 无 | 🟢 低 |
| 16 | ActivityScreen 三栏 | 近期笔墨/碎念/来信 | 独立 section 排列 | 🔴 高 |
| 17 | Windsock 导航网格 | 8 图标链接 | 无 | 🟡 中 |
| 18 | 樱花飘落 Canvas | 有 (CMS 注入) | 无 | 🔴 高 |

\* 注意: innei.in 首页社交图标是透明底灰色，本博客之前做成了实心彩色 — 需要回退。

### 页面级差异

| # | 页面 | 差异 |
|---|------|------|
| 19 | /posts | 无置顶样式、无标签云 sidebar、无 "共 N 篇" 计数 |
| 20 | /notes | 无年鉴式排版、无首篇展开、无心情图标 |
| 21 | /timeline | 无纵向时间线 CSS (竖线+圆点) |
| 22 | /thinking | 整个页面不存在 |
| 23 | /projects | 无 GitHub 链接头部、无项目计数 |
| 24 | /friends | 整个页面不存在 |
| 25 | /about | 本博客有简单 about 页，无折叠面板 |
| 26 | /says | 整个页面不存在 |

---

> 本文件共审计 12 个页面 × 像素级数据（字体/颜色/间距/布局），
> 产出 26 项差异清单，按高/中/低优先级分级。
> 所有数据来自 2026-05-28 浏览器实测 + `/tmp/Shiro/apps/web/src/` 源码验证。

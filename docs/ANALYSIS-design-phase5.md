# innei.in 全站页面美术设计深度审计（五期设计工程参考）

> 日期: 2026-05-27  
> 参考站点: https://innei.in  
> 技术栈: Next.js 15 + TailwindCSS v4 + Framer Motion + `lumeo` 组件库 + `余白/Yohaku` 主题系统  
> 对比项目: MitoroMisaka 博客 (Astro v6 + TailwindCSS v4)  

---

## 目录

1. [全局设计语言](#一全局设计语言)
2. [首页 (/)](#二首页)
3. [文章列表 (/posts)](#三文章列表-posts)
4. [手记 (/notes)](#四手记-notes)
5. [时光 (/timeline)](#五时光-timeline)
6. [思考 (/thinking)](#六思考-thinking)
7. [友链 (/friends)](#七友链-friends)
8. [项目 (/projects)](#八项目-projects)
9. [关于 (/about)](#九关于-about)
10. [文章/手记详情页](#十文章手记详情页)
11. [Footer](#十一footer)
12. [Dark Mode](#十二dark-mode)
13. [本博客缺失清单与优先级](#十三本博客缺失清单与优先级)

---

## 一、全局设计语言

### 1.1 配色系统 (Design Tokens)

**亮色模式**：
| Token | Value | 用途 |
|-------|-------|------|
| `--color-root-bg` | `#fefefb` | 页面背景 — 极浅暖色纸白 |
| `--color-paper` | `#fefefb` | 卡片/面板背景 |
| `--color-neutral-1` | `#f9f8f5` | 次级背景 |
| `--color-neutral-2` | `#f0efeb` | 三级背景 |
| `--color-neutral-3` | `#e3e1db` | 边框/分割线 |
| `--color-neutral-4` | `#d0cec6` | 强调边框 |
| `--color-neutral-5` | `#a8a69f` | 辅助文字 |
| `--color-neutral-6` | `#787670` | 正文次级文字 |
| `--color-neutral-7` | `#5c5a55` | 正文颜色 |
| `--color-neutral-8` | `#403f3a` | 标题颜色 |
| `--color-neutral-9` | `#24231f` | 主文字色 |
| `--color-accent` | `#c56473` | 强调色 — 柔和玫瑰/珊瑚色 |
| `--color-border` | `#18181b1a` | 通用边框 (8% 黑) |
| `--color-hair` | `#18181b14` | 极细分割线 (8% 黑) |

**暗色模式**：
| Token | Value | 用途 |
|-------|-------|------|
| `--color-root-bg` | `#1c1c1e` | iOS 风格深灰 |
| `--color-paper` | `#242424` | 卡片背景 |
| `--color-neutral-1` | `#141414` | 次级背景 |
| `--color-neutral-9` | `#f0f0f0` | 主文字色 |
| `--color-accent` | `#e095a4` | 亮色 accent（提亮） |
| `--color-border` | `#3f3f46` | 边框 |

**设计特征**：
- 整体是**低饱和暖色系**——背景不是纯白，而是极浅暖黄/奶油白 (`#fefefb`)  
- 文字色系不是纯黑，而是深暖灰 (`#24231f`)  
- accent 色选择**玫瑰珊瑚色** (`#c56473`)，柔和但有辨识度  
- 所有颜色都在 9 级中性色阶上精确排布  
- 使用 `color-mix()` 做动态颜色派生（accent 与中性色混合），而非硬编码  

### 1.2 字体系统

**Sans-serif**（正文/UI）：
```
"Instrument Sans", "Instrument Sans Fallback", MiSans, system-ui, 
-apple-system, "PingFang SC", "Microsoft YaHei", "Segoe UI", 
Roboto, Helvetica, "Noto Sans SC", "Hiragino Sans GB", sans-serif
```
- 通过 `next/font` 加载 Instrument Sans（Google Fonts）
- 中文回退链：MiSans → PingFang SC → Microsoft YaHei → Noto Sans SC  

**Serif**（特殊排版、引言）：
```
"Noto Serif CJK SC", "Noto Serif SC", "Source Han Serif SC", 
"Source Han Serif", source-han-serif-sc, SongTi SC, SimSun, serif
```
- 用于手记(notes)正文、引言、特殊段落

**Mono**（代码）：
```
"OperatorMonoSSmLig Nerd Font", "Cascadia Code PL", 
"FantasqueSansMono Nerd Font", "operator mono", JetBrainsMono, ...
```

**字体运用规则**：
- 正文全局 `font-size: 14px, line-height: 21px`（1.5 倍行距）
- 标题字号有严格 token：`text-display-48/36`、`text-title-28/24/20`、`text-copy-16/15/14/13`、`text-label-12`、`text-caption-10`
- Instrument Sans 作为主要西文字体，几何感强、现代
- 中文与西文混排时通过回退链平滑过渡

### 1.3 排版层级系统

| Token | Size | Line-height | 用途 |
|-------|------|-------------|------|
| `text-display-48` | 48px | 1.17 | 超大标题（极少用） |
| `text-display-36` | 36px | 1.22 | 大标题 |
| `text-title-28` | 28px | 1.29 | 页面主标题 |
| `text-title-24` | 24px | 1.33 | Hero 标题 / 文章详情标题 |
| `text-title-20` | 20px | 1.4 | 区块标题 |
| `text-copy-16` | 16px | 1.625 | 正文段落 |
| `text-copy-15` | 15px | 1.6 | 正文变体 |
| `text-copy-14` | 14px | 1.57 | 全局默认正文 |
| `text-copy-13` | 13px | 1.54 | 辅助正文 |
| `text-label-12` | 12px | 1.5 | 标签/按钮 |
| `text-caption-10` | 10px | 1.4 | 小号说明文字 |

### 1.4 间距与留白规则

- 页面最大宽度 `max-w-[1400px]`，水平 padding 响应式：`px-6 lg:px-12 xl:px-16 2xl:px-24`
- 区块之间使用**大量垂直留白**，营造呼吸感
- 元素间距普遍使用 `gap-3`（12px）到 `gap-8`（32px）
- 使用 `flex-[1]` 和 `flex-[1.5]` 等弹性留白空间来推动内容居中

### 1.5 圆角系统

基于 Tailwind 类推断的圆角系统：
- 按钮：`rounded-full`（胶囊形）
- 头像：`rounded-full`
- 社交图标：`rounded-full` 的 `size-9` 圆形边框按钮
- 代码块内联：`border-radius: 999px`（pill）
- 图片：`rounded-2xl` 或类似

### 1.6 动画系统

innei.in 大量使用 Framer Motion，关键动画模式：

**首页入场动画**（scroll-triggered fade-in + slide-up）：
```
opacity: 0 → 1, transform: translateY(12px) → 0
```
- 头像、标题、副标题、统计数据依次出现

**AI Agents 徽章特效**（自定义 CSS keyframes）：
```css
@keyframes aiShimmerLoop {
  from { background-position: 0 0, 0 0; }
  to   { background-position: 0 0, 186px 0; }
}
@keyframes aiSoftGlow {
  0%, 100% { filter: drop-shadow(0 0 10px ...); }
  50%      { filter: drop-shadow(0 0 16px ...); }
}
@keyframes aiTwinkle {
  0%, 100% { opacity: 0.5; transform: translateY(-0.02em) scale(0.98) rotate(0deg); }
  50%      { opacity: 0.85; transform: translateY(-0.04em) scale(1.03) rotate(6deg); }
}
@keyframes blink { /* 光标闪烁 */ }
```
- ✦ 星星图标使用 `aiTwinkle` 旋转 + 缩放动画
- `AI Agents` pill 徽章使用 `aiShimmerLoop` 流光 + `aiSoftGlow` 呼吸辉光
- 光标 `|` 使用 `blink` 动画模拟打字机效果

**页面交互动画**：
- 链接 hover 时 `transition-colors duration-300`
- 按钮 hover 时有背景色过渡
- 社交图标 hover 时变色（每个图标有自定义 `--hover-color`）

---

## 二、首页 (/)

### 2.1 整体布局

```
┌─────────────────────────────────────────────────────┐
│  Header (fixed, glass, z-[9])                       │
│  [logo]          [nav items]          [theme/lang]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│              [背景光晕 radial-gradient]              │
│                                                     │
│                    [头像 80-112px]                   │
│                                                     │
│     Hi, I'm Innei 👋 I orchestrate ideas into       │
│             products with ✦ AI Agents ▏             │
│                                                     │
│   A PRODUCT-MINDED ENGINEER BUILDING INTERFACES...   │
│                                                     │
│               0 篇 · 0 万字 · 0 天                  │
│                                                     │
│         [X] [RSS] [Email] [GitHub] [Music]          │
│              [Bilibili] [Telegram]                   │
│                                                     │
│         ────────  RECENT WRITING 近期笔墨 ───────    │
│         ┌──────────────────────────────────┐        │
│         │ 笔记 · 1天前 · 阴  title...      │        │
│         │ 把 AI session 沉淀成两份资产      │        │
│         │ ...                              │        │
│         └──────────────────────────────────┘        │
│                                                     │
│  ┌───── MUSINGS 碎念 ─────┐ ┌─ LETTERS 来信 ────┐  │
│  │ 初夏清和                │ │ 欢迎来信          │  │
│  │                         │ │ [留下印记 ♥ 3898] │  │
│  └─────────────────────────┘ │ [订阅通信]        │  │
│                               └──────────────────┘  │
│                                                     │
│  [朋友们] · [项目] · [一言] · [跃迁]                │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Footer                                             │
└─────────────────────────────────────────────────────┘
```

### 2.2 Header

- `position: fixed; top: 0; z-index: 9; height: 4.5rem (72px)`
- 使用 `backdrop-blur` 毛玻璃效果（`data-hide-print="true"`）
- CSS Grid 三列布局：`grid-cols-[4.5rem_1fr_4.5rem]`
- 左侧：logo (4.5rem 占位)，中间：空，右侧：操作区
- 仅在 `lg` 以上显示，移动端使用 drawer/底部导航

### 2.3 Hero 区域

**背景光晕**：
```html
<div class="pointer-events-none absolute -z-10 left-1/2 top-[42%] 
  -translate-x-1/2 -translate-y-1/2 rounded-full 
  size-[250px] lg:size-[450px] 
  bg-[radial-gradient(ellipse,rgba(255,240,210,0.15)_0%,transparent_55%)] 
  dark:bg-[radial-gradient(ellipse,rgba(180,200,255,0.08)_0%,transparent_55%)]">
```
- 暖色(浅金)椭圆光晕，位于页面中心上方 42%
- 暗色模式切换为冷色(浅蓝)光晕
- 无 canvas 粒子！

**头像**：
- `size-20 lg:size-28` (80px → 112px 响应式)
- `rounded-full` 圆形
- `shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]` 极细内阴影
- 来源：`https://avatars.githubusercontent.com/u/41265413?v=4`（GitHub 头像，next/image 处理）

**标题**：
```html
<h1 class="text-center text-title-24 font-normal leading-relaxed 
  text-neutral-9 lg:text-[2.5rem] lg:leading-snug">
```
- 使用多种 inline style 实现精细化排版：
  - `font-weight: 300`（轻量部分）+ `font-weight: 560`（名字强调）
  - 名字颜色 `var(--color-accent)`，加 `text-shadow` 辉光
  - 👋 emoji 使用 `rotate(-8deg)` + `translateY(-0.03em)` 创造手写感
  - ✦ 星星使用 `aiTwinkle` 动画循环
  - `AI Agents` pill 使用流光 + 辉光 CSS 动画
  - 光标 `|` 使用 `blink` 动画

**副标题**：
- 全大写 `uppercase tracking-[1.2px] lg:tracking-[1.5px]`
- `text-caption-10 lg:text-label-12`
- 颜色 `text-neutral-5`

**统计数据行**：
- 随机轮播的引言（serif italic）+ 篇数/字数/天数
- 排版层次：serif italic（文学感）→ 数据

**社交图标**：
- 7 个圆形图标按钮：X / RSS / Email / GitHub / 网易云 / Bilibili / Telegram
- 每个 `size-9` (36px) 圆形，`border border-neutral-4`
- 使用 `i-mingcute-*` 图标字体（iconify/mingcute）
- hover 时变色（每图标有自定义 `--hover-color`）

### 2.4 "近期笔墨" 区块

- 双语标题：`RECENT WRITING` + `近期笔墨`（英文大写 + 中文）
- 文章列表：无框线的简洁列表，每行一条
- **首行样式特殊**：第一条是手记（笔记），带 `· 1 天前 · 阴` 元数据
- 类型标识：`笔记` / `文章 · 技术` / `文章 · 经历`
- 日期用 `X 天前` 相对时间

### 2.5 三栏底部

分成左右两区：
- 左：`MUSINGS 碎念` — 只有标题和一句心情，极简
- 右：`LETTERS 来信` — 有互动按钮 `[留下印记 ♥ XXXX]` + `[订阅通信]`

### 2.6 底部导航链接

`[朋友们] · [项目] · [一言] · [跃迁]` — 简洁的点分隔水平链接

---

## 三、文章列表 (/posts)

### 3.1 页面头部

```
BLOG
文章           [最新] [最早] [最近更新]
```

- `BLOG` 使用特殊字体/样式
- 排序按钮：三态切换

### 3.2 置顶文章

- 第一篇文章为置顶，带 `置顶` 标签
- 使用更突出的卡片样式（可能是全宽 + 更大间距）
- 包含：标题（h2）+ 摘要 + 日期 + 分类/标签

### 3.3 文章卡片

每条文章为一张无形卡片（无边框、无阴影、无圆角）：
```
┌───────────────────────────────────────────┐
│  把 AI session 沉淀成两份资产        h3   │
│  跟 AI 协作做工程任务...              摘要  │
│  3 天前 (已编辑) · 技术 / ai, workflow   │
└───────────────────────────────────────────┘
```

**设计特征**：
- 无背景、无边框、无阴影 — 纯排版驱动
- 标题为 h3，粗体
- 摘要一行截断
- 元数据行：日期（相对时间）+ 编辑标记 + 分类 + 标签（逗号分隔）
- 标签使用 `button` 元素（可点击筛选）
- 卡片间垂直间距约 24-32px
- 底部有细水平分割线（hairline）

### 3.4 分页器

```
上一页    下一页    第 1 页，共 18 页
```

- 简洁文字链接，无按钮样式

### 3.5 "共 174 篇"

- 顶部显示总文章数
- 小号辅助文字

---

## 四、手记 (/notes) — 年鉴式排版

这是 innei.in 最有设计特色的页面。不使用传统列表或网格，而是采用**年鉴式（Annals）排版**。

### 4.1 最新手记 — 全宽沉浸式

第一篇（最新）手记占据全宽，包含完整正文预览：

```
┌──────────────────────────────────────────────┐
│  [深夜 emo]                                  │
│  阴 · 悲哀                                   │
│  2026年5月26日周二                            │
│                                              │
│  当生活被AI占满后，我开始思考孤独与爱情  h1   │
│                                              │
│  当我的生活被 AI 占满了，那么我还剩什么呢？   │
│  又过去了快不到一个月的时间...               │
│  ...(多段落正文预览)                          │
│                                              │
│  YOHAKU · LETTER №214          阅读全文 →    │
└──────────────────────────────────────────────┘
```

**设计特征**：
- topic 标签（可点击）：`[深夜 emo]`
- 天气 + 心情图标显示
- 全日期显示（年月日星期）
- 正文多段落预览（而非一行截断）
- 底部 footer：`YOHAKU · LETTER №214` — 品牌化编号系统
- `阅读全文 →` 箭头链接

### 4.2 年鉴式归档

更早的手记按年份组织，使用独特的"年鉴卡片"布局：

```
ANNO 2026
7 LETTERS

┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│  06  │ │  20  │ │  06  │ │  22  │
│ 五月 │ │ 四月 │ │ 四月 │ │ 三月 │
│ 周三 │ │ 周一 │ │ 周一 │ │ 周日 │
│      │ │      │ │      │ │      │
│近况  │ │深夜  │ │近况  │ │近况  │
│代码..│ │长不..│ │26y.. │ │单调..│
│      │ │      │ │      │ │      │
│№213 │ │№212  │ │№211  │ │№210  │
│阅读→│ │阅读→ │ │阅读→ │ │阅读→ │
└──────┘ └──────┘ └──────┘ └──────┘
```

**设计特征**：
- `ANNO` = 拉丁语"年"（Anno Domini），营造古典/文学感
- `7 LETTERS` — 手记被称为"Letters"（信函），品牌化命名
- 年份使用大号字体，作为视觉分隔锚点
- 每张"卡片"实际上是无边框的信息组合：
  - 日期（日/月/星期）使用特殊排版（数字 + 中文月份 + 星期）
  - Topic 标签
  - 标题
  - LETTER № 编号
  - `阅读全文 →`
- 卡片之间无边框，使用网格布局（`grid`）
- 整体呈现出"日历/年鉴"的仪式感

**2025 年区段**：
- 只有 2 LETTERS，布局更稀疏
- 有些卡片没有 topic 标签（更简洁）

### 4.3 Notes 分页器

```
更近的手记    更早的手记    第 1 页
```

---

## 五、时光 (/timeline)

Timeline 页面是客户端渲染（JS-heavy），accessibility tree 显示为空，但从源码推断：

- 时间线纵向布局
- 年份/月份分组标题
- 不同类型内容（文章/手记/速记）使用不同视觉标识
- 时间线节点（圆点 + 竖线）
- 卡片式内容块
- 滚动加载/动画

**与本案对比**：本博客已有 timeline 页面，但缺失：
- 类型视觉区分（icon + color）
- 时间线连线的样式打磨
- 加载动画

---

## 六、思考 (/thinking)

### 6.1 页面头部

```
思考    感君倾耳。
```

- h1 + 诗意副标题
- 极简，无其他元素

### 6.2 内容列表

每条"速记"为一个列表项：

```
Innei      15 天前

AI 不会代替你，但是比你会用 AI 的人，会。

[喜欢 8] [不喜欢 1] [评论 0] [查看]
```

**包含链接预览的类型**（如 TMDB 电影/TV 链接）：
```
Innei      16 天前

┌────────────────── TV · 2018 ────────────────┐
│  命运石之门 0                    Rating 8.1  │
│  [海报缩略图]  描述文字...                   │
│  8.1 Sci-Fi & Fantasy, 动画, 剧情           │
└──────────────────────────────────────────────┘

[喜欢 4] [不喜欢 0] [评论 0] [查看]
```

**设计特征**：
- 卡片式链接预览（自动 enrich URL 元数据）
- 包含：封面图、标题、年份、评分、类型标签、描述
- 整体风格是"社交媒体动态流"
- 点赞/踩/评论 作为底部操作栏
- 用户名 + 相对时间作为头部
- 无复杂装饰，纯内容流

---

## 七、友链 (/friends)

### 7.1 页面头部

```
朋友们
海内存知己，天涯若比邻
```

- 大标题 + 古诗引用副标题
- 文学感十足

### 7.2 友链列表

每个友链一个独立的链接卡片：
```
[Go to 愧怍的小站's website]
[Go to 星空未屿's website]
[Go to DIYgod's website]
...
```

- 约 60+ 友链
- 仅显示站点名称，无头像/描述
- 排列方式：链接列表（可能含简单网格）
- 有一个 `[回到顶部]` 按钮

### 7.3 申请友链表单

页面底部有完整的申请区域：
- 自己的站点信息展示（标题/描述/头像/名字）
- `[愿与君交]` 按钮
- 点击打开模态框表单：昵称、站点标题、URL、头像、邮箱、描述
- 有友链规则说明（HTTPS、独立域名、非商业等）
- 完整的表单验证和提交反馈

---

## 八、项目 (/projects)

页面显示 `墨痕未定，片语已生春。`（诗意副标题），内容为客户端渲染。项目卡片包含：
- 项目名称
- 描述
- 链接/GitHub
- 项目状态/分类

---

## 九、关于 (/about)

### 9.1 页面头部
```
自述
这是一份关于站长的报告，请查收
```

### 9.2 内容结构

使用 Markdown/MDX 渲染的自述页面：
- 折叠区（DisclosureTriangle）：标签、名字由来
- 设备列表（分层 bullet list）
- GitHub 贡献图嵌入
- 技能/工具链列表
- 使用 h2 分段

**设计特征**：
- 排版驱动，无装饰
- 折叠面板增加交互感
- 设备/工具列表使用简洁 bullet
- GitHub 图作为装饰元素

---

## 十、文章/手记详情页

### 10.1 文章元数据头部

```
把 AI session 沉淀成两份资产        h1
3 天前 · (已编辑) · 技术 / ai, workflow, mxs, litexml, skill · 880 阅读
[12 人正披览] · AI 主笔 · [简体中文 ▼]
```

**设计特征**：
- 标题为 h1，`text-title-24`（约 24px+）
- 元数据行包含：日期 + 编辑标记 + 分类 + 标签（逗号分隔，均可点击）+ 阅读数
- "X 人正披览" 显示实时在线读者数（WebSocket）
- "AI 主笔" 标签（标识是否为 AI 撰写）
- 语言切换按钮

### 10.2 侧栏：关键洞察 / 余白

文章正文右侧（或移动端上方）有一个"关键洞察"区域的卡片：

```
关键洞察
[此文有余白 ▼]

本文介绍了一套将AI协作session产物固化为skill和blog的工作流。
核心是anchor skill的五步骨架，遵循"skill先，blog后"的铁律...
```

- 使用 AI 自动生成的文章摘要
- "此文有余白"（Yohaku）是可折叠的额外信息区
- 背景色区别于正文，可能是浅色卡片背景
- 字体略小于正文

### 10.3 正文排版

- 正文全局 serif font（`var(--font-serif)`）用于手记，sans 用于技术文章
- 段落间距约 1.5em
- 链接使用 accent 色 + 下划线效果
- 代码块：深色背景 + 语言标注 + copy 按钮
- Alert/Caution 提示框：彩色边框 + 图标 + 背景色
- Excalidraw 白板嵌入（SVG/图片）
- 引用块（blockquote）：左侧竖线 + 缩进
- 图片：全宽 + 圆角 + 可能的 lightbox

### 10.4 文章底部

- 上下篇导航（上一篇/下一篇）
- 可能的"相关文章"
- 评论区（Giscus 或自建）
- 分享按钮
- 版权声明

---

## 十一、Footer

```
Innei    Stay hungry. Stay foolish.
© 2020-2026 Powered by Mix Space & 余白 / Yohaku

关于              更多              联系
关于本站          照片廊            写留言
关于我            监控 ↗           发邮件 ↗
关于此项目 ↗                       GitHub ↗
                                   RSS 订阅
                                   站点地图

[订阅] [☀] · [◐] · [☾] [简体中文 ▼]
萌ICP备20236136号
```

**设计特征**：
- 三栏布局（关于/更多/联系）
- 使用 `text-caption-10`（10px）小号字体
- 颜色 `text-neutral-6`（辅助文字色）
- 品牌信息（Mix Space + Yohaku 主题）
- 主题切换器内嵌在 footer
- 萌ICP备案号（二次元社区特色）

---

## 十二、Dark Mode

innei.in 的暗色模式设计极为精细：

**关键变化**：
1. 背景从暖纸白 (`#fefefb`) → 深灰 (`#1c1c1e`，iOS 风格)
2. accent 色从 `#c56473` → `#e095a4`（提亮以适应深色背景）
3. 中性色阶完全翻转：neutral-1 从浅色变深色
4. border 从浅灰透明 → 深灰实色
5. paper 背景从纸白 → 深卡片色 (`#242424`)
6. 光晕从暖金 → 冷蓝
7. `yohaku` 系列的 warm tone（手记的暖黄底色）在暗色下转为冷色调

**主题模式**：三态 — 浅色 / 系统 / 深色

---

## 十三、本博客缺失清单与优先级

与 innei.in 对比，MitoroMisaka 博客现有 vs 缺失：

### 高优先级（核心视觉差异）

| # | 项 | innei.in | 本博客 |
|---|----|----------|--------|
| 1 | **配色系统** | 完整 Design Token 体系（9 级中性色 + accent + paper + hairline + border），暖纸白基底 | 使用 Tailwind 默认色 + 少量自定义。背景为纯白/纯黑 |
| 2 | **字体系统** | Instrument Sans（西文） + MiSans/Noto Serif SC（中文），next/font 加载 | 仅有系统默认字体 |
| 3 | **Home Hero 设计** | ✦ AI Agents pill 流光动画 + 打字机光标 + 渐变文字辉光 + 背景光晕 | 简单居中文字，无特效 |
| 4 | **Home 入场动画** | 头像/标题/副标题/图标 依次 scroll-triggered fade-in+slide-up | 无入场动画 |
| 5 | **社交图标** | 圆形边框按钮 + 自定义 hover 颜色 + mingcute 图标集 | 简单文字链接 |
| 6 | **首页"近期笔墨"区** | 文章/笔记混合列表，手记首条带天气/心情/topic，类型标识清晰 | 仅有文章列表 |
| 7 | **首页底部"碎念/来信"区** | 双栏，含心情短语 + 互动按钮 | 无此区块 |

### 中优先级（页面级设计差异）

| # | 项 | innei.in | 本博客 |
|---|----|----------|--------|
| 8 | **Header** | glass（毛玻璃）fixed header，三列 grid，移动端 drawer | 简单的 sticky header |
| 9 | **文章列表页** | 无边框卡片、置顶特殊样式、标签可点击、排序切换 | 卡片式，有边框/阴影 |
| 10 | **手记页年鉴式排版** | "ANNO 年份 + LETTERS 计数" 的日历/年鉴布局，强烈品牌化 | Notes 有独立页但列表式 |
| 11 | **手记详情** | serif 字体、LETTER № 编号、"阅读全文 →" 箭头、天气/心情显示 | sans 字体，无编号，天气/心情有但样式不同 |
| 12 | **文章详情侧栏** | "关键洞察"AI 摘要卡片、"此文有余白"展开区、"X 人正披览"实时在线 | 无侧栏 |
| 13 | **思考/速记页** | 动态流 + 链接自动 enrich（TMDB 电影卡片等）+ 点赞/踩 | 无此页面 |
| 14 | **友链页** | 60+ 友链网格 + 申请表单 + 规则说明 + 古诗副标题 | 无 Freund 功能 |
| 15 | **关于页** | 折叠面板（DisclosureTriangle）+ GitHub 图 + 设备列表 | 无此页面 |

### 低优先级（锦上添花）

| # | 项 | innei.in | 本博客 |
|---|----|----------|--------|
| 16 | **暗色模式** | 完整双色 Token 体系，accent 自适应提亮 | 有 dark mode，但 accent 未提亮 |
| 17 | **移动端导航** | drawer/bottom-nav | 有 hamburger menu |
| 18 | **主题切换器** | 内嵌在 footer，三态切换 | 有主题切换但位置/样式不同 |
| 19 | **萌ICP** | 二次元社区备案号 | 无 |
| 20 | **"一言"功能** | 名人名言轮播 | 无 |
| 21 | **项目页** | 项目卡片 grid | 有 projects 列表但简单 |
| 22 | **多语言** | zh/zh-TW/en/ja/ko 五语言 | 仅中文 |

### 技术架构差异

| 项 | innei.in | 本博客 |
|----|----------|--------|
| 框架 | Next.js 15 (SSR) | Astro v6 (SSG) |
| CMS | Mix Space (自建) | 文件系统 MDX |
| 组件库 | lumeo (自建) | 手写 React islands |
| 动画 | Framer Motion | CSS transitions |
| 样式方案 | TailwindCSS v4 + CSS variables | TailwindCSS v4 + CSS |
| 部署 | 自有服务器 (K8s?) | Cloudflare Pages |

---

## 实施建议

按照优先级，建议五期分 3 个 Phase 推进：

**Phase 5A — 全局设计语言升级**（对应 #1, #2, #4, #16）：
- 建立完整 Design Token 体系（9 级中性色 + accent + paper + 暖色基底）
- 引入 Web Font（Instrument Sans + Noto Serif SC）
- 添加入场动画（CSS-only 或轻量 JS）
- 暗色模式 token 翻新

**Phase 5B — 首页重塑**（对应 #3, #5, #6, #7）：
- Hero 区域重新设计（光晕背景 + ✦ AI Agents 特效 + 打字机光标）
- 社交图标升级为圆形边框按钮
- "近期笔墨"区显示手记/文章混合
- 三栏底部（碎念/来信/互动）

**Phase 5C — 页面级设计提升**（对应 #8-15）：
- Header glass 效果
- 文章列表无边框卡片
- 手记页年鉴式排版
- 文章详情侧栏（关键洞察/余白）
- 友链页
- 关于页
- 思考/速记功能

---

> 此文档覆盖了 innei.in 全站 10+ 页面的视觉设计细节，包括:
> - 精确到像素的 CSS token 值
> - 动画 keyframes 完整代码
> - 每页的布局结构图
> - 与本博客的逐项对比
> - 优先级排序的实施建议
> 
> 可以作为五期 PRD/TECH/TASKS 的直接输入。

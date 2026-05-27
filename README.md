# 静かな森 (MitoroMisaka.github.io)

个人技术博客。从旧 Jekyll 站点迁移到 Astro + Cloudflare Pages 的内容优先架构，聚焦 AI workflow、开发实践和技术写作。

**设计理念**：日系极简 · 余白排版 · 内容优先。基于 [Yohaku (余白)](https://github.com/Innei/Yohaku) 设计系统。

## 技术栈

- Astro v6
- MDX + Content Collections
- React islands
- TailwindCSS v4
- **[@yohaku/design-system](https://www.npmjs.com/package/@yohaku/design-system)** (Design Tokens)
- astro-expressive-code
- Pagefind (静态搜索)
- Giscus (评论)
- Cloudflare Pages + Wrangler
- Cloudflare Pages Functions + KV (Reaction + 隐私友好统计)

## 页面

| 路径 | 说明 |
|------|------|
| `/` | 首页：Hero、写作热力图、最近动态、阅读统计、Recent Writing、Latest Notes、Featured Projects |
| `/posts` / `/posts/<slug>` | 文章列表与详情（含系列进度、TOC、阅读进度、Reaction、Giscus 评论） |
| `/notes` / `/notes/<slug>` | 碎念列表与详情（含 Reaction、分享到 X） |
| `/timeline` | 聚合时间线（posts + notes + projects + 手动事件） |
| `/projects` / `/projects/<slug>` | 项目列表与详情（技术栈、状态、链接） |
| `/series` / `/series/<slug>` | 内容系列：系列列表 + 详情页（含文章进度） |
| `/garden` / `/garden/<slug>` | 知识库/Digital Garden：概念卡片 + wiki 链接 + backlinks |
| `/tags/<tag>` | 标签聚合 |
| `/categories/<category>` | 分类聚合 |
| `/about` | 关于 |
| `/rss.xml` | RSS 订阅 |
| `/notes.xml` | 碎念 RSS 订阅 |
| `/stats` | 站点数据（页面访问量、热门文章、数据摘要） |
| `/newsletter` | RSS 订阅（文章 + 碎念） |

## 本地开发

要求 Node.js >= 22.12（推荐使用 Homebrew 的 node@22）。

```bash
# 如果系统默认 node 版本较低，可临时切换到 node@22
export PATH=/opt/homebrew/opt/node@22/bin:$PATH

npm install
npm run dev
```

## 常用命令

```bash
npm run dev        # 启动开发服务器
npm run build      # 生产构建（自动生成 Pagefind 索引）
npm run preview    # 本地预览构建结果
npm run check      # Astro 类型检查
npm run deploy:cf  # 部署到 Cloudflare Pages
```

## 目录结构

```text
.
├── docs/                    # PRD / TECH / TASKS / WRITING / DEPLOYMENT
├── functions/               # Cloudflare Pages Functions
│   ├── api/reactions.ts     # Reaction API (GET + POST)
│   └── api/analytics/       # 统计 API（view + summary）
├── src/
│   ├── content/             # posts / notes / projects / timeline / garden
│   ├── components/          # 组件
│   │   ├── analytics/       # 统计相关组件
│   │   ├── garden/          # Garden 组件
│   │   ├── home/            # 首页模块 (heatmap, activity-feed)
│   │   ├── notes/           # Notes 组件 (share-button)
│   │   ├── post/            # 文章组件
│   │   ├── projects/        # 项目组件
│   │   ├── series/          # 系列组件
│   │   ├── site/            # header / footer / mobile-nav
│   │   ├── stats/           # 站点统计组件
│   │   ├── timeline/        # Timeline 组件
│   │   └── ui/              # theme-toggle / search / reaction-bar / mermaid / lightbox
│   ├── layouts/             # base-layout / post-layout
│   ├── lib/                 # 配置和工具函数
│   ├── styles/              # global.css / yohaku-extras.css
│   └── pages/               # 路由页面
├── public/
│   └── avatar.png           # 二次元头像 (1254×1254)
├── astro.config.mjs
└── wrangler.jsonc           # Cloudflare 配置 (含 KV binding)
```

## 设计理念

本博客采用 [余白 / Yohaku](https://github.com/Innei/Yohaku) 设计系统（MIT 协议）作为排版基底。核心理念：

> 留白也是写作的一部分。

- **色是克制的**：暖纸白底 + 单种 accent 色（柔和珊瑚 #c56473），三档中性灰。
- **字是有质感的**：Instrument Sans (西文) + Noto Serif SC (中文衬线)，14px 基线下 12 级字号。
- **动效是呼吸式的**：内容随滚动自然浮现，不跳跃不打扰。
- **交互是低调的**：hover 微微加深，像纸面被手指轻轻按过。

## 部署说明

- 线上地址：`mitoromisaka-blog.pages.dev`
- 别名地址：`feat-astro-cloudflare-blog.mitoromisaka-blog.pages.dev`
- 部署命令：`npm run deploy:cf`

## Reaction API

- `GET  /api/reactions?target=post:<slug>` — 获取计数
- `POST /api/reactions` `{"target":"post:<slug>","emoji":"heart"}` — 计数 +1
- 存储：Cloudflare KV (`REACTIONS` binding)

## 统计 API

- `POST /api/analytics/view` `{"path":"/posts/my-slug","title":"文章标题"}` — 页面浏览上报
- `GET  /api/analytics/summary?days=30` — 获取聚合摘要
- 存储：Cloudflare KV (`ANALYTICS` binding)，按日聚合，不存储个人标识信息

## 许可

源码采用 GNU Affero General Public License v3.0 (AGPLv3)。设计系统基于 Yohaku (MIT)。

---

**Powered by [Astro](https://astro.build) · [余白 / Yohaku](https://github.com/Innei/Yohaku)** · Deployed on [Cloudflare Pages](https://pages.cloudflare.com)

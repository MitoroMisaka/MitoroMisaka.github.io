# 静かな森 (MitoroMisaka.github.io)

个人技术博客。从旧 Jekyll 站点迁移到 Astro + Cloudflare Pages 的内容优先架构，聚焦 AI workflow、开发实践和技术写作。

## 技术栈

- Astro v6
- MDX + Content Collections
- React islands
- TailwindCSS v4
- astro-expressive-code
- Pagefind (静态搜索)
- Giscus (评论)
- Cloudflare Pages Functions + KV (Reaction)
- Cloudflare Pages Functions + KV (隐私友好统计)
- Buttondown (邮件订阅 provider)
- Cloudflare Pages + Wrangler

## 页面

| 路径 | 说明 |
|------|------|
| `/` | 首页：Hero、Recent Writing、Latest Notes、Featured Projects |
| `/posts` / `/posts/<slug>` | 文章列表与详情（含 TOC、阅读进度、Reaction、Giscus 评论） |
| `/notes` / `/notes/<slug>` | 碎念列表与详情（含 Reaction） |
| `/timeline` | 聚合时间线（posts + notes + projects + 手动事件） |
| `/projects` / `/projects/<slug>` | 项目列表与详情（技术栈、状态、链接） |
| `/tags/<tag>` | 标签聚合 |
| `/categories/<category>` | 分类聚合 |
| `/about` | 关于 |
| `/rss.xml` | RSS 订阅 |
| `/stats` | 站点数据（页面访问量、热门文章、数据摘要） |
| `/newsletter` | 邮件订阅（Buttondown） |

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
npm run cf:whoami  # 检查 Cloudflare 登录状态
npm run deploy:cf  # 部署到 Cloudflare Pages
```

## 目录结构

```text
.
├── docs/                    # PRD / TECH / TASKS / WRITING / DEPLOYMENT
├── functions/               # Cloudflare Pages Functions
│   ├── api/reactions.ts     # Reaction API (GET + POST)
│   ├── api/analytics/       # 统计 API（view + summary）
│   └── api/newsletter/      # Newsletter 订阅 API
├── src/
│   ├── content/             # posts / notes / projects / timeline
│   ├── components/          # 组件
│   │   ├── analytics/       # 统计相关组件
│   │   ├── home/            # 首页模块
│   │   ├── newsletter/      # Newsletter 订阅组件
│   │   ├── notes/           # Notes 组件
│   │   ├── post/            # 文章组件
│   │   ├── projects/        # 项目组件
│   │   ├── site/            # header / footer / mobile-nav
│   │   ├── stats/           # 站点统计组件
│   │   ├── timeline/        # Timeline 组件
│   │   └── ui/              # theme-toggle / search / reaction-bar
│   ├── layouts/             # base-layout / post-layout
│   ├── lib/                 # 配置和工具函数
│   │   ├── analytics-config.ts
│   │   ├── kv-types.ts
│   │   ├── mood-labels.ts
│   │   ├── newsletter-provider.ts
│   │   └── seo.ts
│   └── pages/               # 路由页面
├── public/
├── astro.config.mjs
└── wrangler.jsonc           # Cloudflare 配置 (含 KV binding)
```

## 部署说明

当前默认目标为 Cloudflare Pages，项目名：`mitoromisaka-blog`。

- 线上地址：`mitoromisaka-blog.pages.dev`
- 别名地址：`feat-astro-cloudflare-blog.mitoromisaka-blog.pages.dev`
- 部署命令：`npm run deploy:cf` 或 `npx wrangler pages deploy dist --project-name mitoromisaka-blog`

注意：`mitoromisaka.github.io` 域名无法直接由 Cloudflare Pages 托管。
后续可绑定自定义域名。

Newsletter 功能需要在 Cloudflare Pages 环境变量中配置 `BUTTONDOWN_API_KEY`（格式 `sk-*`），否则订阅 API 不可用。

## Reaction API

- `GET  /api/reactions?target=post:<slug>` — 获取计数
- `POST /api/reactions` `{"target":"post:<slug>","emoji":"heart"}` — 计数 +1
- 支持 emoji：❤️(heart) / 👏(clap) / 🚀(rocket) / 👀(eyes)
- 存储：Cloudflare KV (`REACTIONS` binding)

## 统计 API

- `POST /api/analytics/view` `{"path":"/posts/my-slug","title":"文章标题"}` — 页面浏览上报
- `GET  /api/analytics/summary?days=30` — 获取聚合摘要（总 PV、热门页面、访客趋势）
- 存储：Cloudflare KV (`ANALYTICS` binding)，按日聚合，不存储个人标识信息

## Newsletter API

- `POST /api/newsletter/subscribe` `{"email":"user@example.com"}` — 邮件订阅
- Provider：Buttondown，需 `BUTTONDOWN_API_KEY` 环境变量

## 写作指南

参见 `docs/WRITING.md`。

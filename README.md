# 静かな森 (MitoroMisaka.github.io)

个人技术博客重建项目。

目标：从旧 Jekyll 站点迁移到 Astro + Cloudflare Pages 的内容优先架构，聚焦 AI workflow、开发实践和技术写作。

## 技术栈

- Astro
- MDX + Content Collections
- React islands
- TailwindCSS
- astro-expressive-code
- Pagefind
- Giscus
- Cloudflare Pages + Wrangler

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
├── docs/                  # PRD / TECH / TASKS
├── src/
│   ├── content/           # posts / projects 内容源
│   ├── components/        # 组件
│   ├── layouts/           # 页面布局
│   ├── lib/               # 配置和工具函数
│   └── pages/             # 路由页面
├── public/
├── astro.config.mjs
└── wrangler.jsonc
```

## 部署说明

当前默认目标为 Cloudflare Pages，项目名：`mitoromisaka-blog`。

注意：`mitoromisaka.github.io` 域名无法直接由 Cloudflare Pages 托管。

- 临时可使用 `*.pages.dev` 上线
- 后续可绑定自定义域名

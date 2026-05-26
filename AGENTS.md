# MitoroMisaka.github.io 项目协作规范

## 项目简介与技术栈

- 项目目标：重建个人技术博客，替换旧 Jekyll 站点。
- 技术栈：Astro + MDX + React islands + TailwindCSS。
- 部署目标：Cloudflare Pages（第一期默认 `*.pages.dev`）。

## 目录结构说明

- `src/content/`：内容源（posts/pages/projects）
- `src/components/`：页面组件与交互组件
- `src/layouts/`：基础布局与文章布局
- `src/lib/`：站点配置、内容工具函数
- `src/pages/`：页面路由
- `docs/`：PRD / TECH / TASKS 文档

## 构建与运行命令

- 开发：`npm run dev`
- 构建：`npm run build`
- 预览：`npm run preview`
- Cloudflare 构建：`npm run build`（含 Pagefind postbuild）
- Cloudflare 部署：`npm run deploy:cf`

## 编码约定

- TypeScript 严格模式，优先使用明确类型。
- 单文件尽量不超过 500 行。
- 非显而易见逻辑添加注释，必要时写 `# Reason:`。
- 风格目标：日系极简、高留白、内容优先。

## 外部依赖说明

- 评论系统：Giscus（GitHub Discussions）
- 静态搜索：Pagefind
- 语法高亮：astro-expressive-code

## 安全与发布约束

- 禁止读取 `.env` 文件内容。
- 禁止提交任何密钥或令牌。
- 线上变更前先本地 build 成功。
- 每个逻辑阶段完成后提交 commit。
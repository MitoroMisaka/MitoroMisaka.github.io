# 写作指南

## 新建文章

1. 在 `src/content/posts/` 创建 `.mdx` 文件，例如 `my-new-post.mdx`
2. 文件名即 slug（去掉空格，用连字符分隔）

## Frontmatter

```yaml
---
title: "文章标题"
description: "简要描述，用于首页列表和 SEO"
date: 2026-05-26
updated: 2026-05-26   # 可选
category: "技术"       # 必须与已有分类一致，或新分类
tags:                  # 可选，用于标签页聚合
  - ai
  - workflow
draft: false           # draft: true 的文章不会发布
slug: "my-new-post"    # URL 路径，建议与文件名一致
---
```

## 编写内容

从 `## 标题` 开始。支持标准 Markdown：

- 标题 `##` / `###`
- 列表 `-` / `1.`
- 代码块 ` ``` ` （自动高亮 + 复制按钮）
- 引用 `>`
- 链接 `[text](url)`

不要在第一行重复文章标题——页面自动渲染。

## 本地预览

```bash
npm run dev
```

打开 http://localhost:4321 ，修改 markdown 后自动刷新。

## 发布

```bash
# 构建
npm run build

# 部署到 Cloudflare Pages
npx wrangler pages deploy dist --project-name mitoromisaka-blog

# 提交代码
git add -A
git commit -m "feat: new post <标题>"
git push
```

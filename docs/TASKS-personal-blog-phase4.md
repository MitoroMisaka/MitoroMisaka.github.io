# 执行任务: 个人技术博客四期（深度内容组织、动态感与内容增强）

> 基于 PRD: `docs/PRD-personal-blog-phase4.md`
> 基于 TECH: `docs/TECH-personal-blog-phase4.md`
> 日期: 2026-05-26
> 最后更新: 2026-05-27
> 状态: ✅ 核心功能完成，3 项未实现（非阻塞）

## Commit Chain

```
1737341 feat: add garden collection and series schema              ← Phase 1
89b2c5b feat: add content series with prev/next navigation         ← Phase 2
e24efa8 feat: add garden lib and rehype wiki-links plugin          ← Phase 3
2998bb9 feat: add garden list and detail pages with backlinks      ← Phase 3
d95a49b feat: add 3 garden example entries                         ← Phase 3
b837ccc fix: convert rehype-wiki-links to .mjs                     ← Phase 3
25e674b docs: mark Phase 3 garden/knowledge-base as complete       ← Phase 3
2849bb3 feat: add share-to-x button on notes                       ← Phase 4
4978a68 feat: add reading stats, activity feed, heatmap            ← Phase 5
0a26473 feat: add mermaid chart support and image lightbox         ← Phase 6
c0e8cfc feat: enable code block filename, diff highlighting        ← Phase 6
b028b20 docs: update writing guide, README, AGENTS, DEPLOYMENT     ← Phase 7
980c831 fix: remark plugin to extract mermaid blocks               ← Phase 8
d1762be fix: add mermaid client-side render script                 ← Phase 8
44b1220 fix: React island for mermaid, fix Lightbox import         ← Phase 8
d63c3df fix: static import for mermaid                            ← Phase 8
0be170e chore: remove unused mermaid components                    ← cleanup
a3bb575 refactor: use Vite-processed script with dynamic import    ← Mermaid optimization
ada8771 feat: add second series article with image                 ← QA fix
```

## 逐项验收 (vs PRD Phase 4)

### Feature 1: 内容专题/系列文章

| PRD 要求 | 状态 | 验证方式 |
|-----------|------|----------|
| posts schema `series` / `seriesOrder` | ✅ | `content.config.ts` |
| `/series` 列表页 | ✅ | 显示 1 个系列卡片 |
| `/series/ai-workflow` 详情页 + 进度 | ✅ | "2 篇已完成" badge |
| 文章头部进度条 "第 N 篇 / 共 M 篇" | ✅ | "第 2 篇 / 共 2 篇" |
| 系列内上一篇/下一篇导航 | ✅ | 2 篇文章: ← 上一篇 / 下一篇 → 均可见 |
| **文章列表页系列标注** | ✅ | `/posts` 列表显示 "系列：ai-workflow" |

### Feature 2: 知识库/Digital Garden

| PRD 要求 | 状态 | 验证方式 |
|-----------|------|----------|
| garden content collection | ✅ | 3 个条目，3 个 category 分组 |
| schema: title/description/category/stage/related/... | ✅ | seedling/budding/evergreen |
| `/garden` 按 category 分组 | ✅ | 三组卡片 |
| stage emoji + 中文标签 | ✅ | 🌱 嫩芽 / 🌿 生长中 |
| `[[]]` wiki 前向链接 | ✅ | 已知可点击，未知灰色虚线 |
| backlinks 反向链接 | ✅ | "哪些页面引用了本文" |
| 导航栏 Garden 入口 | ✅ | 9 项不溢出 |
| **category/stage 筛选交互** | ❌ | 仅静态列表，无筛选 React island |

### Feature 3: Notes 社交同步

| PRD 要求 | 状态 | 验证方式 |
|-----------|------|----------|
| "分享到 X" 按钮 | ✅ | Note 详情页可见按钮 |
| intent/tweet 模式 | ✅ | `window.open` |
| 零后端、零 API key | ✅ | — |

### Feature 4: 首页增强

| PRD 要求 | 状态 | 验证方式 |
|-----------|------|----------|
| 最近动态流 | ✅ | 8 条动态，含 emoji+文案+日期 |
| 写作热力图 | ✅ | 12 月 × 7 天 grid + Less/More legend |
| 阅读统计 | ✅ | "2 篇 · 0.4 万字 · 70 天" |
| **热力图深色/浅色主题 CSS 变量** | ❌ | `var(--heatmap-*)` 变量未定义暗色/亮色两套值 |

### Feature 5: 内容增强

| PRD 要求 | 状态 | 验证方式 |
|-----------|------|----------|
| Mermaid 图表渲染 | ✅ | flowchart + sequence diagram 均生成 SVG |
| Mermaid 懒加载 (Vite-processed script) | ✅ | 独立 chunk `mermaid.core.js` |
| 代码块文件名 `title="xxx.py"` | ✅ | Figcaption 显示文件名 |
| diff 高亮 (`+`/`-`) | ✅ | 绿色/红色行高亮 |
| **图片 lightbox** | ✅ | 点击 Hermes 架构图 → overlay + × 按钮关闭 |
| 图片 lightbox 无外部依赖 | ✅ | 自建 React island，~4KB |

### 质量标准

| PRD 要求 | 状态 |
|-----------|------|
| `npm run check` 0 errors | ✅ |
| `npm run build` 通过 | ✅ 26 pages |
| Pagefind 索引覆盖新页面 | ✅ "workflow" 搜索命中全站 |
| `[[]]` 独立 rehype 插件 | ✅ `rehype-wiki-links.mjs` |
| WRITING/README/AGENTS/DEPLOYMENT 更新 | ✅ |

## 未完成项（3 项）

```
❌ Garden 页面无 category/stage 筛选交互（纯静态列表）
   原因: 未实现 React island 筛选组件；当前仅按 category 分组展示
   影响: 条目增多后浏览效率降低，3 条目时无明显问题
   修复: 添加 React island 筛选（按 category 下拉 + stage 切换），约 1-2 小时

❌ 热力图无深色/浅色主题 CSS 变量适配
   原因: `var(--heatmap-1)` / `var(--heatmap-2)` / `var(--heatmap-3)` 等变量
        未在 global.css 的暗色主题选择器中定义
   影响: 切换暗色模式后热力图颜色不变，视觉上不协调
   修复: 在 global.css 的 `[data-theme="dark"]` 块中定义对应的热力图颜色变量

❌ Mermaid 深色模式不支持（固定 theme: 'default'）
   原因: mermaid 初始化时 theme 写死为 'default'
   修复: 读取 document data-theme 属性动态选择 mermaid theme
```

## 部署状态

- 线上地址: https://feat-astro-cloudflare-blog.mitoromisaka-blog.pages.dev
- 最新部署: `d5e24f81`
- 页面数: 26
- Git 分支: feat/astro-cloudflare-blog，已 push

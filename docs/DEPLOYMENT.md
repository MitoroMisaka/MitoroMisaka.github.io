# 部署文档

> 项目: MitoroMisaka.github.io（个人技术博客）
> 目标平台: Cloudflare Pages
> 项目名称: `mitoromisaka-blog`

## 环境要求

- Node.js >= 22.12
- npm（随 Node.js 附带）
- `wrangler` CLI（通过 `npx wrangler` 使用，无需全局安装）

本地 Node 版本切换命令（macOS Homebrew）：

```bash
PATH=/opt/homebrew/opt/node@22/bin:$PATH
```

## 构建

```bash
cd /Users/liaojinchuan/Projects/MitoroMisaka.github.io
PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build
```

构建产物输出到 `dist/` 目录。构建过程包含:

1. Astro 静态站点生成（SSG）
2. Pagefind 搜索索引生成（postbuild hook）

首次构建前需安装依赖：

```bash
PATH=/opt/homebrew/opt/node@22/bin:$PATH npm install
```

## 部署

```bash
PATH=/opt/homebrew/opt/node@22/bin:$PATH \
  npx wrangler pages deploy dist --project-name mitoromisaka-blog
```

### 部署前检查

- `npm run check` 无错误
- `npm run build` 成功
- 确认 `dist/` 目录存在
- 确认 `wrangler.jsonc` 中 KV namespace binding 与 Cloudflare 项目配置一致

### 回退 URL

如自定义域名不可用，默认回退入口：

```
https://mitoromisaka-blog.pages.dev
```

## 部署分支策略

- 默认从 `feat/astro-cloudflare-blog` 分支构建和部署
- 部署前确保分支代码为最新版本
- 建议：上线前在本地运行完整构建和检查

## Cloudflare Pages 自定义域名

> ⚠️ 此部分需要用户确认域名和 DNS 管理方式后才执行。

### 前提条件

1. 用户拥有一个域名（例如 `example.com`）
2. 确认 DNS 是否托管在 Cloudflare
   - 如果在 Cloudflare：在 Cloudflare Pages 项目设置中添加自定义域名，系统自动配置 DNS 和 SSL
   - 如果不在 Cloudflare：需手动添加 CNAME 记录指向 `mitoromisaka-blog.pages.dev`，并在 Cloudflare Pages 项目中验证域名所有权

### 操作步骤（DNS 在 Cloudflare 时）

1. 登录 Cloudflare Dashboard
2. 进入 Pages 项目 `mitoromisaka-blog`
3. 点击 "Custom domains" 标签
4. 输入自定义域名并点击 "Continue"
5. Cloudflare 自动添加 DNS 记录并签发 SSL 证书
6. 等待 SSL 证书生效（通常 5-15 分钟）

### 操作步骤（DNS 不在 Cloudflare 时）

1. 登录 Cloudflare Dashboard → Pages → `mitoromisaka-blog` → Custom domains
2. 输入自定义域名
3. Cloudflare 会显示需要添加的 DNS 记录（CNAME）
4. 在域名 DNS 管理后台添加对应记录
5. 回到 Cloudflare 页面验证域名所有权
6. 等待 SSL 证书签发

### 代码侧切换（域名确认后执行）

- [ ] 修改 `src/lib/site-config.ts` 中 `siteUrl` 为自定义域名
- [ ] 确认 `astro.config.mjs` 中 sitemap site 指向新域名
- [ ] 重新构建并部署

### 验收清单（域名绑定后）

- [ ] 自定义域名 HTTPS 可访问
- [ ] 旧 `pages.dev` URL 自动重定向到自定义域名
- [ ] canonical URL 指向新域名
- [ ] RSS feed 链接指向新域名
- [ ] sitemap.xml 中 URL 指向新域名
- [ ] Giscus 评论可正常加载（需在 GitHub 安装配置中更新域名）

## 回滚步骤

### 代码回滚

```bash
# 回退到上一个可工作 commit
git revert <commit-hash>
# 或重置到特定 commit
git reset --hard <commit-hash>
```

### 部署回滚

Cloudflare Pages 部署回滚：

1. 登录 Cloudflare Dashboard → Pages → `mitoromisaka-blog` → Deployments
2. 找到上一个成功的部署记录
3. 点击 "..." → "Rollback to this deployment"

或通过 CLI 重新部署上一个构建产物：

```bash
# 回退代码后重新构建并部署
PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build
PATH=/opt/homebrew/opt/node@22/bin:$PATH npx wrangler pages deploy dist --project-name mitoromisaka-blog
```

### 自定义域名回滚

如需临时切回 `pages.dev`：

1. Cloudflare Dashboard → Pages → Custom domains
2. 移除自定义域名绑定
3. 访问 `https://mitoromisaka-blog.pages.dev` 确认可用
4. 修改 `site-config.ts` 中 `siteUrl` 为 `https://mitoromisaka-blog.pages.dev` 并重新部署

## KV Namespace 说明

项目使用两个 Cloudflare KV namespace：

| Binding 名称 | 用途 | Namespace ID |
|---|---|---|
| `REACTIONS` | 文章/笔记/项目 Reaction 计数 | `66a6f0b892864883b270d6ef246e3879` |
| `ANALYTICS` | 页面浏览统计数据（按日/总计） | 待用户确认后填入 |

### KV Binding 配置

KV namespace 在 `wrangler.jsonc` 中声明：

```jsonc
{
  "kv_namespaces": [
    {
      "binding": "REACTIONS",
      "id": "66a6f0b892864883b270d6ef246e3879"
    },
    {
      "binding": "ANALYTICS",
      "id": ""  // 待用户确认后填入 Cloudflare KV namespace ID
    }
  ]
}
```

### 创建新的 KV Namespace

```bash
npx wrangler kv namespace create ANALYTICS
```

执行后会在终端输出 namespace ID，将其填入 `wrangler.jsonc` 的 `ANALYTICS` binding `id` 字段。

### 注意事项

- KV 数据存储在 Cloudflare 边缘网络，最终一致性（通常 < 60 秒）
- 本地开发时 KV 不可用，通过 `wrangler pages dev` 可模拟
- 数据统计为聚合计数，不存储个人标识信息

## 环境变量

以下环境变量需在 Cloudflare Pages 项目设置中配置（具体值不在此文档中记录）：

| 变量名 | 用途 | 备注 |
|---|---|---|
| `SITE_URL` | 生产环境站点 URL | 用于 canonical URL 等场景 |
| `GISCUS_REPO` | Giscus 评论仓库 | 当前硬编码在组件中 |

> ⚠️ 禁止将任何密钥、token、API key 提交到代码仓库。

## API 端点清单

以下为站点当前可用的 API 端点（均通过 Cloudflare Pages Functions 实现）：

| 方法 | 路径 | 说明 | 依赖 |
|---|---|---|---|
| GET | `/api/reactions` | 获取 Reaction 计数 | KV `REACTIONS` |
| POST | `/api/reactions` | 提交 Reaction 计数 +1 | KV `REACTIONS` |
| POST | `/api/analytics/view` | 页面浏览上报 | KV `ANALYTICS` |
| GET | `/api/analytics/summary` | 获取聚合摘要（总 PV、热门页面） | KV `ANALYTICS` |

## 发布检查清单

每次部署前确认：

- [ ] `npm run check` 通过
- [ ] `npm run build` 通过
- [ ] 无 TypeScript 错误
- [ ] 无 ESLint 错误
- [ ] `dist/` 目录包含完整构建产物
- [ ] `dist/pagefind/` 搜索索引存在
- [ ] 未提交 `.env` 文件或 API key
- [ ] 如涉及 KV binding 变更，确认 Cloudflare 侧已同步
- [ ] 验证 `/stats` 页面可正常访问，数据加载无报错
- [ ] 验证 `/newsletter` 页面可正常访问，RSS 链接和阅读器推荐正确

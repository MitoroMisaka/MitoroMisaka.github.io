# Product Requirements Document: 个人技术博客三期（上线硬化、订阅与数据反馈）

> 日期: 2026-05-26
> 状态: 草案
> 二期基线: `docs/PRD-personal-blog-phase2.md`
> 二期复验: `docs/QA-personal-blog-phase2.md`
> 技术方案: `docs/TECH-personal-blog-phase3.md`
> 执行计划: `docs/TASKS-personal-blog-phase3.md`

## 目标

- 先回补二阶段复验发现的问题，恢复 `npm run check`、搜索、移动端导航、SEO 元信息等基础质量门禁。
- 将站点从“功能已上线”推进到“可长期运营”：自定义域名、稳定发布策略、隐私友好的访问统计、公开数据面板。
- 增加低维护 Newsletter 能力，让读者能订阅正式文章更新，但不引入用户系统或管理后台。
- 保持 Astro 静态优先架构，动态能力继续限制在 Cloudflare Pages Functions + KV / 外部邮件服务 adapter 内。
- 延续日系极简、高留白、内容优先风格，新增运营功能不能破坏阅读体验。

## 用户故事

- 作为站点作者，我想先修复二期复验缺口，以便后续功能叠加在可信的质量基线上。
- 作为移动端读者，我想在手机上也能访问文章、碎念、时光、项目和关于页面，以便不依赖桌面导航。
- 作为读者，我想搜索站内文章、碎念和项目，以便快速找到相关内容。
- 作为站点作者，我想使用自定义域名，以便博客具备更稳定的公开入口和长期品牌识别。
- 作为站点作者，我想看到基础访问趋势和热门内容，以便知道哪些文章/碎念/项目更有价值。
- 作为读者，我想通过邮件订阅正式文章更新，以便不需要频繁主动打开网站。
- 作为隐私敏感读者，我希望站点统计不追踪个人身份，不设置跨站 cookie，不采集可识别个人的信息。

## 功能范围

### In Scope

- 二期复验问题回补
  - 修复 `npm run check` 当前失败的问题。
  - 修复 Pagefind 搜索 UI 不加载 runtime 的问题。
  - 修复移动端主导航不可达的问题。
  - 修复 `/notes` 计数与空状态不一致。
  - 补齐 canonical / og:url / RSS alternate。
  - 去除 Project 详情页重复链接。
  - 优化 Note mood 展示。

- 自定义域名与发布策略
  - 支持用户提供的自定义域名，更新 `siteConfig.siteUrl`、canonical、sitemap、RSS link。
  - 记录 Cloudflare Pages 自定义域名和 DNS 设置步骤。
  - 保留 `pages.dev` 作为回退入口。
  - 更新部署/回滚/验收文档。

- 隐私友好访问统计
  - 新增轻量浏览事件上报，只记录聚合数据。
  - 统计维度控制在：日期、路径、内容类型、可选 referrer host。
  - 不持久化 IP、User-Agent、cookie、设备指纹或个人标识。
  - 统计失败不得影响正文阅读。

- 公开数据面板
  - 新增 `/stats` 页面，展示站点总览和近期趋势。
  - 展示内容包括：总浏览量、近 7/30 天浏览量、热门路径、内容类型分布。
  - 使用简洁静态/轻交互图表，不引入大型可视化依赖。

- Newsletter MVP
  - 新增 `/newsletter` 页面说明订阅内容、频率、隐私承诺。
  - 新增订阅表单，支持 loading / success / error 状态。
  - 通过 Cloudflare Pages Functions 调用外部邮件服务 provider。
  - 默认订阅正式文章更新；不把 Notes/碎念默认推送到邮件。
  - 支持 provider 侧 double opt-in 或等效确认机制。

- 文档与运营说明
  - 更新 `README.md` / `AGENTS.md` / `docs/WRITING.md`。
  - 新增域名、统计、Newsletter 的运维说明。
  - 三期每个 Phase 结束必须 commit。

### Out of Scope（这个版本不做）

- 自建完整用户系统、登录、个人资料页。
- 付费订阅、会员内容、付费邮件。
- 邮件活动营销自动化、复杂分组、A/B 测试。
- 完整反作弊/风控系统。
- 侵入式访问追踪、跨站 cookie、设备指纹。
- 评论系统替换；继续使用 Giscus。
- CMS / 后台管理系统。
- 多语言系统。
- 大型图表库或复杂数据仓库。

## 需要用户确认的决策

这些不是代码实现细节，执行到对应 Phase 前必须确认，不能擅自调用外部服务：

1. 自定义域名
   - 域名是什么？例如 `blog.example.com` 或 apex domain。
   - DNS 是否由 Cloudflare 托管？如果不是，是否允许按 Cloudflare Pages 指引添加 CNAME / TXT？

2. Newsletter provider
   - 低维护推荐：Buttondown / ConvertKit / Mailchimp 这类 provider-hosted subscriber list。
   - 自定义域名邮件推荐：Resend + Cloudflare Function adapter，但需要 API key 和发信域名验证。
   - 执行前必须由用户确认 provider，不读取 `.env`，不把 API key 写入代码。

3. 统计范围
   - 是否允许记录 referrer host。
   - `/stats` 是否公开展示，还是仅保留本地/私有接口。

## 技术约束

- 必须延续现有技术栈：Astro v6、MDX、Content Collections、React islands、TailwindCSS v4、Pagefind、Cloudflare Pages。
- Node 仍使用 Homebrew node@22：`PATH=/opt/homebrew/opt/node@22/bin:$PATH`。
- 动态 API 只允许使用 Cloudflare Pages Functions；存储优先使用 KV。
- 不读取 `.env` 文件内容；外部服务密钥只能由用户配置到 Cloudflare Pages 环境变量。
- 不提交任何 API key、token、DNS secret。
- 自定义域名和 Newsletter provider 属外部服务操作，执行前必须二次确认。
- 新增 tracking 必须隐私优先，不持久化个人可识别信息。
- 新增 React islands 必须保持小而局部，不引入全局状态库。
- 三期前置修复完成前，不开始 Newsletter / 统计等新功能实现。

## 质量标准

- 质量门禁:
  - `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run check` 通过。
  - `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build` 通过。
  - Pagefind 搜索在首页、文章页、新增页面均可返回结果或明确展示无结果状态。

- 可用性:
  - 移动端可以访问全部主导航页面。
  - Newsletter 表单具备 loading / success / error / invalid email 状态。
  - Stats 页面 API 异常时有降级提示。
  - Analytics / Newsletter API 失败不得影响正文页面首屏阅读。

- 隐私:
  - 不设置统计 cookie。
  - 不把 IP、User-Agent 原文写入 KV。
  - Newsletter 明确告知订阅用途、频率和退订方式。

- 性能:
  - 首页、文章页、Notes、Timeline、Projects、Stats 页面桌面端 Lighthouse Performance 目标 >= 90。
  - 新增客户端 JS 尺寸可控，不引入大型 chart / analytics SDK。
  - 统计上报异步执行，不阻塞主线程关键路径。

- 可维护性:
  - Analytics、Newsletter、SEO 元信息分别封装到 `src/lib/` 或专门组件中。
  - Cloudflare Functions 输入校验明确，错误响应结构统一。
  - 外部 provider 通过 adapter 隔离，后续可替换。

## UI/UX 参考

- 延续 `https://innei.in` 的克制、轻运营感和个人站氛围，不复制具体设计资产。
- Newsletter 页面像一张安静说明卡，而不是强营销落地页。
- Stats 页面像“公开状态页 / 年轮”，不做商业数据大屏。
- 移动端导航应轻，不破坏顶部简洁感。
- 搜索结果应快速、低打扰；无结果时给出明确但克制的空状态。

## 版本边界

### 三期完成标准

- 二期复验报告中的 P2-QA-001 至 P2-QA-007 全部关闭或明确保留原因。
- `npm run check` 和 `npm run build` 都通过。
- 线上搜索真实可用。
- 移动端主导航可用。
- 自定义域名文档完成；如果用户提供域名并授权，则完成绑定和 canonical 切换。
- `/stats` 可访问，并展示隐私友好的聚合数据。
- `/newsletter` 可访问；如果用户确认 provider 并提供环境变量，则订阅链路可用。
- README / AGENTS / WRITING 更新，包含三期运维说明。

### 四期候选方向

- 内容专题 / 系列文章 / 知识库视图。
- Notes 与外部社交平台同步。
- 更细粒度的公开 changelog。
- 图片/图表/演示型内容增强。
- Newsletter 摘要自动生成与定时发送。

## 成功标准

- 站点不只是“能看”，而是具备长期运营所需的基础：域名、搜索、移动端可用、质量门禁、统计反馈、订阅入口。
- 用户能通过公开页面理解站点正在持续更新，并选择订阅正式文章。
- 作者能用数据判断内容方向，但不牺牲读者隐私。
- 后续四期可以在稳定基线上继续迭代，而不是继续修补二期遗留问题。

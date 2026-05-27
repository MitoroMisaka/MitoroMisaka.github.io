# Product Requirements Document: 个人技术博客五期（页面美术设计工程 · 余白 / Yohaku）

> 日期: 2026-05-27
> 四期基线: `docs/PRD-personal-blog-phase4.md`
> 设计分析: `docs/ANALYSIS-design-phase5.md`
> 技术方案: `docs/TECH-personal-blog-phase5.md`
> 执行计划: `docs/TASKS-personal-blog-phase5.md`
> 状态: 草案

## 目标

- 引入 **Yohaku (余白) 设计系统** 作为全站排版基底，获得与 innei.in 相同的设计语言（配色、字号体系、设计约束），同时保持自己的视觉辨识度。
- 重塑首页 Hero：二次元头像替代 + Yohaku 排版 + 光斑背景 + 入场动画。
- 重塑文章列表与阅读体验：无边框卡片、下划线展开动画、手记衬线体排版。
- Header 毛玻璃、滚动条定制、打印样式等全局视觉打磨。
- Footer 标注 "Powered by 余白 / Yohaku" 作为设计理念的署名。
- 不引入新后端/CMS/框架，不复制 Shiro 代码，纯粹 Astro + CSS + 少量 React islands。

## 用户故事

- 作为站点作者，我希望博客的视觉气质达到 innei.in 级别的日系极简美学，以建立个人品牌。
- 作为站点作者，我希望能引用 Innei 的 Yohaku 设计系统，在 footer 标注 "Powered by 余白 / Yohaku" 以表达设计哲学上的认同。
- 作为读者，我希望首页有温和的入场动画和舒适的光斑装饰，不刺眼但精致。
- 作为读者，我希望文章列表和手记页面有独特的排版节奏，与普通博客拉开差距。
- 作为读者，我希望能看到作者的个人辨识度（二次元头像），而不只是模板化的站点。

## 功能范围

### In Scope

- 引入 `@yohaku/design-system` npm 包，替换全站颜色 token 和字号体系。
- 全局排版基线：14px 全局字号 + Yohaku 排版 scale（caption-10 → display-48）。
- Web Font：Instrument Sans (西文) + Noto Serif SC (中文衬线)。
- 首页 Hero 重塑：
  - 二次元头像（`public/avatar.png`，1254×1254 PNG）替代现有头像
  - Hero 入场动画（标题逐字上浮、副标题/社交图标依次淡入）
  - 页首光斑背景（CSS blob-entrance + blob-float 浮动模糊圆）
  - "AI Agents" 风格的特效标签（CSS 辉光 + 流光动画）
- 全局视觉打磨：
  - 暖纸白背景色 (`#fefefb` / dark `#242424`)
  - 下划线展开动画（`shiro-link--underline` CSS 参考）
  - Header 毛玻璃效果
  - 滚动条定制（6px + 圆角）
  - 打印样式（`data-hide-print`）
- 手记正文排版变体：衬线体 + 首字下沉 + 段落缩进（`.markdown--note` CSS）
- 文章列表卡片：无边框 + 摘要 accent 环
- "阅读全文 →" 箭头 hover 动效
- Footer 更新：标注 "Powered by 余白 / Yohaku" + 链接
- 仓库 LICENSE：AGPLv3

### Out of Scope

- Framer Motion 或其他重动画框架。动画用 CSS @keyframes 或轻量 React island 实现。
- Canvas 粒子或 WebGL 效果（innei.in 也没有）。
- 友链页、思考页、关于页等全面页面开发（这些属于后续功能扩展）。
- Shiro 源码的直接复制——所有效果基于视觉规则自己实现。
- 多语言支持。
- 旧 Jekyll 内容再迁移。

## 技术约束

- 所有颜色、字号必须使用 Yohaku Token（`text-neutral-N`、`text-copy-N`、`text-title-N` 等），禁止硬编码 `text-[Npx]` 和 `text-neutral-50...950`。
- `neutral-5` 禁止作文本色。
- accent 色使用 Yohaku 默认 `#c56473`（柔和珊瑚色），但可以通过 `--color-accent` 变量保持可配置性。
- 动画使用纯 CSS @keyframes 或 Astro island 中的轻量实现，不引入 Framer Motion。
- 头像替换为 `public/avatar.png`，通过 `<Image>` 组件引用。
- 必须在桌面端保持 Lighthouse Performance >= 90（不因 animation 引入大 JS bundle）。
- 样式修改集中在 `src/styles/global.css` 和新增的 `src/styles/yohaku-extras.css`。

## 质量标准

- 视觉验收: 首页、文章列表、手记详情、手记列表在亮/暗色模式下对比 innei.in 截图，确认排版气质一致。
- 性能: 构建后 JS bundle 不应因动画引入超过 5KB 额外体积。
- 可维护性: 所有自定义 CSS/动画集中管理，不散落在组件文件中。
- 排版: 严格遵循 Yohaku CHEATSHEET 的 10 条不变量，通过视觉审查确认无违规。

## 设计参考

- innei.in（Shiro + Yohaku）: 全局设计语言、排版节奏、动效哲学
- `@yohaku/design-system` CHEATSHEET.md: 10 条不变量 + 颜色/字号速查表
- `docs/ANALYSIS-design-phase5.md`: Shiro 源码级 CSS 实现细节

## 版本边界

五期结束后，博客应具备：
- Yohaku 设计系统的完整 Design Token 体系
- 与 innei.in 气质相近的日系极简视觉风格
- 二次元头像 + "Powered by 余白 / Yohaku" 的个人辨识度
- 精致的入场动画和排版节奏
- AGPLv3 LICENSE 保护源码

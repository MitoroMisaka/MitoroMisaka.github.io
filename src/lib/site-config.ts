export const siteConfig = {
  title: '静かな森',
  description:
    'AI workflows, development notes, and technical writing. Documenting the journey of building with AI agents.',
  locale: 'zh-CN',
  author: 'MitoroMisaka',
  siteUrl: 'https://mitoromisaka-blog.pages.dev',
  hero: {
    subtitle: 'AI 工作流 · 开发随笔 · 技术写作',
    quote: '记录与 AI Agent 协作开发的实践经验。',
  },
  nav: [
    { label: '首页', href: '/' },
    { label: '文章', href: '/posts' },
    { label: '碎念', href: '/notes' },
    { label: '时光', href: '/timeline' },
    { label: '项目', href: '/projects' },
    { label: '关于', href: '/about' },
    { label: ' Newsletter', href: '/newsletter' },
    { label: '数据', href: '/stats' },
  ],
  social: [
    { label: 'GitHub', href: 'https://github.com/MitoroMisaka' },
    { label: 'RSS', href: '/rss.xml' },
    { label: 'Email', href: 'mailto:ljc2472319246@gmail.com' },
  ],
};

export type SiteConfig = typeof siteConfig;

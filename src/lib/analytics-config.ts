/**
 * 统计数据层配置
 * 定义允许统计的路径前缀、内容类型和 referrer 白名单。
 */

/** 路径前缀白名单：只有匹配这些前缀的 path 才被接受上报 */
export const ANALYTICS_PATH_PREFIXES = ['/posts/', '/notes/', '/projects/', '/about', '/timeline', '/', '/stats'] as const;

/** 内容类型白名单 */
export const ANALYTICS_CONTENT_TYPES = ['post', 'note', 'project', 'page'] as const;
export type AnalyticsContentType = (typeof ANALYTICS_CONTENT_TYPES)[number];

/**
 * referrer host 白名单（可选，默认允许所有）。
 * 如需限制只统计来自特定域名的访问，可添加条目。
 * 例如: ['mitoromisaka-blog.pages.dev', 'example.com']
 */
export const ANALYTICS_REFERRER_HOSTS: string[] = [];

/** 判断给定的 path 是否在白名单前缀内 */
export function isAnalyticsPathAllowed(path: string): boolean {
  if (!path.startsWith('/')) return false;
  return ANALYTICS_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}

/** 判断给定的 content type 是否在白名单内 */
export function isAnalyticsTypeAllowed(type: string): type is AnalyticsContentType {
  return (ANALYTICS_CONTENT_TYPES as readonly string[]).includes(type);
}

/** 判断 referrer host 是否在白名单内（如果白名单为空，则允许所有） */
export function isReferrerHostAllowed(host: string): boolean {
  if (ANALYTICS_REFERRER_HOSTS.length === 0) return true;
  return ANALYTICS_REFERRER_HOSTS.some((h) => h === host || host.endsWith('.' + h));
}

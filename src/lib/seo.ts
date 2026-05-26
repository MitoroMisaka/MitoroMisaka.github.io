import { siteConfig } from './site-config';

export function getCanonicalUrl(path: string): string {
  const base = siteConfig.siteUrl.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

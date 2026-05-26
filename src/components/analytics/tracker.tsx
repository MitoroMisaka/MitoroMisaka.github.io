/**
 * Analytics Tracker — React island 组件
 *
 * 在页面加载后通过 navigator.sendBeacon 上报页面浏览到 /api/analytics/view。
 * 仅在生产环境启用，失败时静默降级，不影响页面体验。
 *
 * 使用方式：在 Astro layout 中引入
 *   import AnalyticsTracker from '../components/analytics/tracker';
 *   <AnalyticsTracker client:idle />
 */

import { useEffect } from 'react';

/** 从当前 URL path 推断内容类型 */
function getContentType(pathname: string): string {
  if (pathname.startsWith('/posts/')) return 'post';
  if (pathname.startsWith('/notes/')) return 'note';
  if (pathname.startsWith('/projects/')) return 'project';
  return 'page';
}

/** 使用 sendBeacon 上报，不支持时 fallback 到 fetch */
function sendAnalytics(data: { path: string; type: string; referrerHost?: string }): void {
  const body = JSON.stringify(data);
  const url = '/api/analytics/view';

  // 优先使用 sendBeacon（不阻塞页面卸载）
  const blob = new Blob([body], { type: 'application/json' });
  const sent = navigator.sendBeacon(url, blob);

  if (!sent) {
    // sendBeacon 失败（如数据过大），降级到 fetch with keepalive
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      // 静默降级，不影响页面
    });
  }
}

export default function AnalyticsTracker(): null {
  useEffect(() => {
    // 仅在非本地环境启用
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
      return;
    }

    const path = window.location.pathname;
    const type = getContentType(path);
    const referrerHost = document.referrer ? new URL(document.referrer).hostname : undefined;

    sendAnalytics({ path, type, referrerHost });
  }, []);

  // 组件不渲染任何 UI
  return null;
}

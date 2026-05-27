/**
 * Stats Dashboard — React island 组件
 *
 * 调用 GET /api/analytics/summary 获取聚合统计数据，
 * 展示总浏览量、近 7/30 天趋势、热门内容和类型分布。
 * 四态：loading / error / empty / success。
 */
'use client';

import { useState, useEffect } from 'react';

/* ---------- 类型定义 ---------- */

interface DayCount {
  date: string;
  count: number;
}

interface PathCount {
  path: string;
  count: number;
}

interface StatsSummary {
  total: number;
  last7Days: DayCount[];
  last30Days: DayCount[];
  topPaths: PathCount[];
  typeBreakdown: Record<string, number>;
}

type Status = 'loading' | 'error' | 'empty' | 'success';

/* ---------- 类型标签映射 ---------- */

const TYPE_LABELS: Record<string, string> = {
  post: '文章',
  note: '碎念',
  project: '项目',
  page: '页面',
};

/* ---------- 骨架占位 ---------- */

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-neutral-3 bg-neutral-1 p-5 space-y-2">
      <div className="h-4 w-16 rounded bg-neutral-3" />
      <div className="h-8 w-24 rounded bg-neutral-3" />
    </div>
  );
}

/* ---------- 条形图条 ---------- */

function BarItem({
  label,
  count,
  maxCount,
}: {
  label: string;
  count: number;
  maxCount: number;
}) {
  const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 shrink-0 text-label-12 text-neutral-7">{label}</span>
      <div className="flex-1 h-5 rounded-sm bg-neutral-3/30 overflow-hidden">
        <div
          className="h-full rounded-sm bg-accent/70 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-16 shrink-0 text-right text-label-12 text-neutral-7 tabular-nums">
        {count.toLocaleString()}
      </span>
    </div>
  );
}

/* ---------- 主组件 ---------- */

export default function StatsDashboard() {
  const [data, setData] = useState<StatsSummary | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let cancelled = false;

    async function fetchSummary() {
      try {
        const res = await fetch('/api/analytics/summary');
        if (!res.ok) {
          if (!cancelled) setStatus(res.status === 404 ? 'empty' : 'error');
          return;
        }
        const json = (await res.json()) as StatsSummary;
        if (!cancelled) {
          if (json.total === 0 && json.topPaths.length === 0) {
            setStatus('empty');
          } else {
            setData(json);
            setStatus('success');
          }
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    fetchSummary();
    return () => { cancelled = true; };
  }, []);

  /* ---------- loading ---------- */

  if (status === 'loading') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  /* ---------- error ---------- */

  if (status === 'error') {
    return (
      <div className="rounded-lg border border-neutral-3 bg-neutral-1 p-10 text-center">
        <p className="text-neutral-7">数据暂时不可用</p>
      </div>
    );
  }

  /* ---------- empty ---------- */

  if (status === 'empty' || !data) {
    return (
      <div className="rounded-lg border border-neutral-3 bg-neutral-1 p-10 text-center">
        <p className="text-neutral-7">尚无统计数据</p>
      </div>
    );
  }

  /* ---------- success ---------- */

  const { total, last7Days, last30Days, topPaths, typeBreakdown } = data;

  const last7Total = last7Days.reduce((s, d) => s + d.count, 0);
  const last30Total = last30Days.reduce((s, d) => s + d.count, 0);

  const typeEntries = Object.entries(typeBreakdown)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
  const typeMax = typeEntries.length > 0 ? typeEntries[0][1] : 0;

  const sortedPaths = [...topPaths].sort((a, b) => b.count - a.count).slice(0, 10);

  return (
    <div className="space-y-10">
      {/* ===== 顶部卡片 ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-neutral-3 bg-neutral-1 p-5">
          <p className="text-caption-10 uppercase tracking-wide text-neutral-7">总浏览量</p>
          <p className="mt-1 text-title-28 font-medium tabular-nums">
            {total.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-3 bg-neutral-1 p-5">
          <p className="text-caption-10 uppercase tracking-wide text-neutral-7">近 7 天</p>
          <p className="mt-1 text-title-28 font-medium tabular-nums">
            {last7Total.toLocaleString()}
          </p>
          {last7Days.length === 0 && (
            <p className="mt-1 text-caption-10 text-neutral-7">暂无数据</p>
          )}
        </div>
        <div className="rounded-lg border border-neutral-3 bg-neutral-1 p-5">
          <p className="text-caption-10 uppercase tracking-wide text-neutral-7">近 30 天</p>
          <p className="mt-1 text-title-28 font-medium tabular-nums">
            {last30Total.toLocaleString()}
          </p>
          {last30Days.length === 0 && (
            <p className="mt-1 text-caption-10 text-neutral-7">暂无数据</p>
          )}
        </div>
      </div>

      {/* ===== 热门内容 ===== */}
      <section>
        <h2 className="text-copy-16 font-medium mb-4">热门内容</h2>
        {sortedPaths.length === 0 ? (
          <p className="text-label-12 text-neutral-7">暂无数据</p>
        ) : (
          <div className="divide-y divide-neutral-3 border border-neutral-3 rounded-lg bg-neutral-1">
            {sortedPaths.map((item, idx) => (
              <div
                key={item.path}
                className="flex items-center justify-between px-4 py-2.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-caption-10 w-6 text-right tabular-nums text-neutral-7">
                    {idx + 1}
                  </span>
                  <a
                    href={item.path}
                    className="truncate text-label-12 text-neutral-9 hover:text-accent transition-colors"
                  >
                    {item.path}
                  </a>
                </div>
                <span className="ml-3 shrink-0 text-label-12 tabular-nums text-neutral-7">
                  {item.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== 内容类型分布 ===== */}
      <section>
        <h2 className="text-copy-16 font-medium mb-4">内容类型</h2>
        {typeEntries.length === 0 ? (
          <p className="text-label-12 text-neutral-7">暂无数据</p>
        ) : (
          <div className="space-y-2 rounded-lg border border-neutral-3 bg-neutral-1 p-5">
            {typeEntries.map(([type, count]) => (
              <BarItem
                key={type}
                label={TYPE_LABELS[type] ?? type}
                count={count}
                maxCount={typeMax}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

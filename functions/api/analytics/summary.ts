/**
 * Cloudflare Pages Function: GET /api/analytics/summary
 * 返回聚合统计数据：总量、近 7 天、近 30 天、热门路径、类型分布。
 *
 * 隐私设计：只返回聚合数据，不包含任何个人标识信息。
 */

interface KVBinding {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

interface Env {
  ANALYTICS: KVBinding;
}

interface DayCount {
  date: string;
  count: number;
}

interface PathCount {
  path: string;
  count: number;
}

interface SummaryResponse {
  total: number;
  last7Days: DayCount[];
  last30Days: DayCount[];
  topPaths: PathCount[];
  typeBreakdown: Record<string, number>;
}

/** 获取最近 N 天的日期字符串数组 */
function getLastNDays(n: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  if (request.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const kv = env.ANALYTICS;

    // --- 1. total 统计 ---
    let total = 0;
    const typeBreakdown: Record<string, number> = {};
    const types = ['post', 'note', 'project', 'page'];

    for (const type of types) {
      const val = await kv.get(`analytics:v1:total:type:${type}`);
      const count = val ? parseInt(val, 10) || 0 : 0;
      typeBreakdown[type] = count;
      total += count;
    }

    // --- 2. last7Days 和 last30Days ---
    const last7Days = getLastNDays(7);
    const last30Days = getLastNDays(30);

    async function fetchDayCounts(dates: string[]): Promise<DayCount[]> {
      const results: DayCount[] = [];
      for (const date of dates) {
        let dayTotal = 0;
        for (const type of types) {
          const val = await kv.get(`analytics:v1:day:${date}:type:${type}`);
          if (val) {
            dayTotal += parseInt(val, 10) || 0;
          }
        }
        results.push({ date, count: dayTotal });
      }
      return results;
    }

    const [sevenDays, thirtyDays] = await Promise.all([
      fetchDayCounts(last7Days),
      fetchDayCounts(last30Days),
    ]);

    // --- 3. topPaths ---
    // 通过 total:path:* key 读取热门路径，但 KV 没有原生的 list 操作
    // 策略：从 total:type 获取总数，如果总量很小（<10000），通过扫描已知路径不太可行
    // 这里使用一个务实方案：尝试读取 path 键，返回能找到的
    // 由于无 list API，topPaths 在实际部署后可能需要配合 list API
    // 当前实现：从已知前缀推断，返回空数组作为安全 fallback
    const topPaths: PathCount[] = [];

    // 尝试读取一些常见的 total:path key（通过 path 前缀扫描）
    // 注意：没有 list API，topPaths 功能受限。后续可考虑在 view.ts 中维护一个 paths 索引。
    const knownPrefixes = ['/posts/', '/notes/', '/projects/', '/about', '/timeline', '/'];
    for (const prefix of knownPrefixes) {
      const val = await kv.get(`analytics:v1:total:path:${encodeURIComponent(prefix)}`);
      if (val) {
        topPaths.push({ path: prefix, count: parseInt(val, 10) || 0 });
      }
    }

    const summary: SummaryResponse = {
      total,
      last7Days: sevenDays,
      last30Days: thirtyDays,
      topPaths,
      typeBreakdown,
    };

    return Response.json(summary, {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch {
    return Response.json({ error: 'Storage unavailable' }, { status: 503 });
  }
}

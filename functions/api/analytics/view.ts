/**
 * Cloudflare Pages Function: POST /api/analytics/view
 * 接收页面浏览上报，写入 KV 计数器。
 *
 * 隐私设计：
 * - 不存储 IP / User-Agent / cookie / 任何个人标识
 * - 只做聚合计数，不记录单次访问详情
 */

// 最小 KV 类型，避免依赖 @cloudflare/workers-types
interface KVBinding {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

interface Env {
  ANALYTICS: KVBinding;
}

/** 允许统计的路径前缀白名单 */
const PATH_PREFIXES = ['/posts/', '/notes/', '/projects/', '/about', '/timeline', '/', '/stats'];

/** 允许的内容类型 */
const VALID_TYPES = new Set(['post', 'note', 'project', 'page']);

function isPathAllowed(path: string): boolean {
  if (!path.startsWith('/')) return false;
  return PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function isTypeAllowed(type: string): boolean {
  return VALID_TYPES.has(type);
}

/** URL-encode path 以便安全用作 KV key 的一部分 */
function encodePath(path: string): string {
  return encodeURIComponent(path);
}

/** 获取今日日期字符串 YYYY-MM-DD */
function todayDate(): string {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** 原子递增 KV 计数器，返回递增后的值 */
async function incrementKV(kv: KVBinding, key: string): Promise<number> {
  const current = await kv.get(key);
  const count = (current ? parseInt(current, 10) || 0 : 0) + 1;
  await kv.put(key, String(count));
  return count;
}

interface ViewRequestBody {
  path: string;
  type: string;
  referrerHost?: string;
}

function validateBody(body: unknown): { valid: true; data: ViewRequestBody } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { path, type } = body as Record<string, unknown>;

  if (typeof path !== 'string' || path.length === 0 || path.length > 500) {
    return { valid: false, error: 'Invalid path' };
  }

  if (!isPathAllowed(path)) {
    return { valid: false, error: 'Path not in allowed prefixes' };
  }

  if (typeof type !== 'string' || !isTypeAllowed(type)) {
    return { valid: false, error: 'Invalid type, must be one of: post, note, project, page' };
  }

  return {
    valid: true,
    data: {
      path,
      type,
      referrerHost: typeof (body as Record<string, unknown>).referrerHost === 'string'
        ? (body as Record<string, unknown>).referrerHost as string
        : undefined,
    },
  };
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = validateBody(body);
  if (!result.valid) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  const { path, type } = result.data;
  const day = todayDate();
  const encodedPath = encodePath(path);

  try {
    // 写入四个 KV 计数器
    await incrementKV(env.ANALYTICS, `analytics:v1:day:${day}:path:${encodedPath}`);
    await incrementKV(env.ANALYTICS, `analytics:v1:day:${day}:type:${type}`);
    await incrementKV(env.ANALYTICS, `analytics:v1:total:path:${encodedPath}`);
    await incrementKV(env.ANALYTICS, `analytics:v1:total:type:${type}`);

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Storage unavailable' }, { status: 503 });
  }
}

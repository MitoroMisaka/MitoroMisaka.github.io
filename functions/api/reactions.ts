/**
 * Cloudflare Pages Function: /api/reactions
 * KV-backed reaction counts for posts, notes, and projects.
 *
 * GET  /api/reactions?target=post:my-slug
 * POST /api/reactions  { "target": "post:my-slug", "emoji": "heart" }
 */

type KVBinding = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

interface Env {
  REACTIONS: KVBinding;
}

const VALID_EMOJIS = new Set(['heart', 'clap', 'rocket', 'eyes']);

function validateTarget(target: unknown): string | null {
  if (typeof target !== 'string' || target.length > 200) return null;
  const match = target.match(/^(post|note|project):([a-zA-Z0-9\-_.]+)$/);
  return match ? target : null;
}

async function getCounts(kv: KVBinding, target: string): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const emoji of VALID_EMOJIS) {
    const key = `reaction:v1:${target}:${emoji}`;
    const val = await kv.get(key);
    counts[emoji] = val ? parseInt(val, 10) || 0 : 0;
  }
  return counts;
}

async function incrementCount(kv: KVBinding, target: string, emoji: string): Promise<number> {
  const key = `reaction:v1:${target}:${emoji}`;
  const val = await kv.get(key);
  const count = (val ? parseInt(val, 10) || 0 : 0) + 1;
  await kv.put(key, String(count));
  return count;
}

async function handleGet(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const target = url.searchParams.get('target');
  const validTarget = validateTarget(target);
  if (!validTarget) {
    return Response.json({ error: 'Invalid target parameter' }, { status: 400 });
  }
  const counts = await getCounts(env.REACTIONS, validTarget);
  return Response.json({ target: validTarget, counts });
}

async function handlePost(request: Request, env: Env): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { target, emoji } = body;
  const validTarget = validateTarget(target);
  if (!validTarget) {
    return Response.json({ error: 'Invalid target' }, { status: 400 });
  }
  if (typeof emoji !== 'string' || !VALID_EMOJIS.has(emoji)) {
    return Response.json({ error: 'Invalid emoji' }, { status: 400 });
  }

  const count = await incrementCount(env.REACTIONS, validTarget, emoji);
  return Response.json({ target: validTarget, emoji, count });
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  switch (request.method) {
    case 'GET':
      return handleGet(request, env);
    case 'POST':
      return handlePost(request, env);
    default:
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }
}

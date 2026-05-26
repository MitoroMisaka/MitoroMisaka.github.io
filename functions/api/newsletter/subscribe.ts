/**
 * Cloudflare Pages Function: POST /api/newsletter/subscribe
 * 订阅  Newsletter，后端使用 Buttondown API。
 *
 * Body: { email: string, source?: string }
 *
 * 环境变量：
 * - BUTTONDOWN_API_KEY: Buttondown API key（以 sk- 开头），在 Cloudflare Pages 后台配置
 */

// 最小 KV 类型，避免依赖 @cloudflare/workers-types
interface Env {
  BUTTONDOWN_API_KEY?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email) && email.length <= 254;
}

interface SubscribeRequest {
  email: string;
  source?: string;
}

function parseBody(body: unknown): { valid: true; data: SubscribeRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { email, source } = body as Record<string, unknown>;

  if (typeof email !== 'string' || !isValidEmail(email)) {
    return { valid: false, error: '请输入有效的邮箱地址。' };
  }

  return {
    valid: true,
    data: {
      email: email.trim().toLowerCase(),
      source: typeof source === 'string' ? source : 'newsletter-page',
    },
  };
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return Response.json({ ok: false, error: 'method_not_allowed', message: '仅支持 POST 请求。' }, { status: 405 });
  }

  // 检查 API key 是否配置
  const apiKey = env.BUTTONDOWN_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return Response.json(
      { ok: false, error: 'not_configured', message: '订阅服务尚未配置。' },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: 'invalid_json', message: '请求格式错误。' },
      { status: 400 }
    );
  }

  const parsed = parseBody(body);
  if (!parsed.valid) {
    return Response.json(
      { ok: false, error: 'invalid_email', message: parsed.error },
      { status: 400 }
    );
  }

  const { email } = parsed.data;

  try {
    const res = await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (res.status === 201) {
      return Response.json({ ok: true, message: '订阅确认邮件已发送，请检查邮箱。' });
    }

    if (res.status === 400) {
      const resBody = (await res.json()) as { code?: string; detail?: string };
      if (resBody?.code === 'email_already_exists') {
        return Response.json(
          { ok: false, error: 'already_subscribed', message: '该邮箱已订阅。' },
          { status: 400 }
        );
      }
      return Response.json(
        { ok: false, error: 'bad_request', message: '订阅失败，请检查邮箱格式。' },
        { status: 400 }
      );
    }

    return Response.json(
      { ok: false, error: 'provider_error', message: '订阅服务暂时不可用，请稍后再试。' },
      { status: 502 }
    );
  } catch {
    return Response.json(
      { ok: false, error: 'provider_error', message: '订阅服务暂时不可用，请稍后再试。' },
      { status: 502 }
    );
  }
}

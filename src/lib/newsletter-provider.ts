/**
 * Newsletter provider abstraction.
 * Currently only Buttondown is supported.
 */

export interface NewsletterProvider {
  subscribe(email: string, source: string): Promise<SubscribeResult>;
}

export type SubscribeResult =
  | { ok: true; message: string }
  | { ok: false; message: string; code?: string };

export class ButtondownProvider implements NewsletterProvider {
  private apiKey: string;
  private readonly apiUrl = 'https://api.buttondown.email/v1/subscribers';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async subscribe(email: string, _source: string): Promise<SubscribeResult> {
    try {
      const res = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (res.status === 201) {
        return { ok: true, message: '订阅确认邮件已发送，请检查邮箱。' };
      }

      if (res.status === 400) {
        const body = (await res.json()) as { code?: string; detail?: string };
        if (body?.code === 'email_already_exists') {
          return { ok: false, message: '该邮箱已订阅。', code: 'already_subscribed' };
        }
        return { ok: false, message: '订阅失败，请检查邮箱格式。', code: 'bad_request' };
      }

      return { ok: false, message: '订阅服务暂时不可用，请稍后再试。', code: 'provider_error' };
    } catch {
      return { ok: false, message: '订阅服务暂时不可用，请稍后再试。', code: 'provider_error' };
    }
  }
}

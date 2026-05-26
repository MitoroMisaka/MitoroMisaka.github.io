import { useState } from 'react';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

interface ApiResponse {
  ok: boolean;
  message?: string;
  error?: string;
}

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [message, setMessage] = useState('');

  function isValidEmail(val: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
    setMessage('请输入有效的邮箱地址。');
    setStatus('error');
      return;
    }

    setStatus('loading');
    setMessage('');
    setErrorType('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, source: 'newsletter-page' }),
      });

      const data = (await res.json()) as ApiResponse;

      if (data.ok) {
        setMessage(data.message || '订阅确认邮件已发送，请检查邮箱。');
        setStatus('success');
        return;
      }

      // 处理各种错误
      setErrorType(data.error || 'provider_error');

      switch (data.error) {
        case 'already_subscribed':
          setMessage('该邮箱已订阅。');
          break;
        case 'not_configured':
          setMessage('订阅功能尚未开放。');
          break;
        case 'invalid_email':
          setMessage('请输入有效的邮箱地址。');
          break;
        default:
          setMessage('订阅服务暂时不可用，请稍后再试。');
          break;
      }
      setStatus('error');
    } catch {
      setErrorType('network_error');
      setMessage('订阅服务暂时不可用，请稍后再试。');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <p className="text-green-600 dark:text-green-400">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="flex-1">
        <label htmlFor="newsletter-email" className="sr-only">
          邮箱地址
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={status === 'loading'}
          className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-soft)] focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)] disabled:opacity-50"
        />
      </div>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="rounded-lg bg-[var(--brand)] px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {status === 'loading' ? '订阅中...' : '订阅'}
      </button>
      {status === 'error' && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{message}</p>
      )}
    </form>
  );
}

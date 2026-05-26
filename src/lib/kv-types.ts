/**
 * 最小 KV binding 类型，供 Cloudflare Pages Functions 使用。
 * 避免直接依赖 @cloudflare/workers-types，保证本地 TypeScript 检查通过。
 */

export interface KVBinding {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

/**
 * Reaction emoji configuration and target utilities.
 */

export const REACTION_EMOJIS = {
  heart: { emoji: '❤️', label: '喜欢' },
  clap: { emoji: '👏', label: '有用' },
  rocket: { emoji: '🚀', label: '期待' },
  eyes: { emoji: '👀', label: '围观' },
} as const;

export type ReactionEmoji = keyof typeof REACTION_EMOJIS;

export const REACTION_EMOJI_LIST: ReactionEmoji[] = ['heart', 'clap', 'rocket', 'eyes'];

export const VALID_TARGET_PREFIXES = ['post', 'note', 'project'] as const;
export type TargetPrefix = (typeof VALID_TARGET_PREFIXES)[number];

/**
 * Validate a target string like "post:my-slug" or "note:some-note".
 */
export function validateTarget(target: string): { prefix: TargetPrefix; slug: string } | null {
  // Maximum target length to avoid abuse
  if (target.length > 200) return null;

  const match = target.match(/^(post|note|project):([a-zA-Z0-9\-_.]+)$/);
  if (!match) return null;

  return { prefix: match[1] as TargetPrefix, slug: match[2] };
}

/**
 * Validate that an emoji name is one of the allowed reactions.
 */
export function validateEmoji(emoji: string): ReactionEmoji | null {
  if (emoji in REACTION_EMOJIS) {
    return emoji as ReactionEmoji;
  }
  return null;
}

/**
 * Build a KV key for a given target and emoji.
 */
export function buildKVKey(target: string, emoji: ReactionEmoji): string {
  return `reaction:v1:${target}:${emoji}`;
}

export const moodLabels: Record<string, string> = {
  excited: '✨ 兴奋',
  calm: '🌿 平静',
  thinking: '💭 思考',
};

export function getMoodLabel(mood: string): string {
  return moodLabels[mood] ?? mood;
}

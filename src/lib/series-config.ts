export interface SeriesConfig {
  name: string;
  description: string;
}

// 系列 slug → 名称/描述映射表
// 添加新系列时只需在此追加条目即可
const seriesConfigMap: Record<string, SeriesConfig> = {
  'ai-workflow': {
    name: 'AI 工作流',
    description: '探索 AI 辅助开发的完整工作流',
  },
};

export function getSeriesConfig(seriesSlug: string): SeriesConfig | undefined {
  return seriesConfigMap[seriesSlug];
}

export function getAllSeriesSlugs(): string[] {
  return Object.keys(seriesConfigMap);
}

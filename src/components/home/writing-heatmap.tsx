import { useMemo } from 'react';

export interface HeatmapDatum {
  date: string;   // "YYYY-MM-DD"
  count: number;
}

interface WritingHeatmapProps {
  data: HeatmapDatum[];
}

const WEEK_LABELS: Record<number, string> = {
  0: '',
  1: 'Mon',
  3: 'Wed',
  5: 'Fri',
};

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function getHeatmapLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  return 3;
}

interface CellData {
  date: string;
  dayOfWeek: number; // 0 = Sunday
  weekIndex: number;  // 0-based relative to start
  count: number;
  level: number;
  monthLabel: string | null;
}

interface WeekData {
  cells: CellData[];
  weekOffset: number;
}

function buildGrid(data: HeatmapDatum[]): { weeks: WeekData[]; weekOffset: number } | null {
  if (data.length === 0) return null;

  const now = new Date();
  const endDate = now; // today
  // Go back ~52 weeks from today
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 364);

  // Build a lookup
  const lookup = new Map<string, number>();
  for (const d of data) {
    lookup.set(d.date, d.count);
  }

  // Align to start of the week that contains startDate (Sunday)
  const gridStart = new Date(startDate);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  // Generate all days from gridStart to endDate
  const cells: CellData[] = [];
  const iter = new Date(gridStart);
  let weekIndex = 0;
  while (iter <= endDate) {
    const key = toDateKey(iter);
    const count = lookup.get(key) || 0;
    const dayOfWeek = iter.getDay();
    cells.push({
      date: key,
      dayOfWeek,
      weekIndex,
      count,
      level: getHeatmapLevel(count),
      monthLabel: null,
    });
    if (dayOfWeek === 6) weekIndex++;
    iter.setDate(iter.getDate() + 1);
  }

  // Assign month labels (first cell of each month)
  let lastMonth = '';
  for (const cell of cells) {
    const m = cell.date.substring(5, 7);
    if (m !== lastMonth) {
      cell.monthLabel = MONTH_LABELS[parseInt(m, 10) - 1];
      lastMonth = m;
    }
  }

  // Group by week
  const weekMap = new Map<number, CellData[]>();
  for (const cell of cells) {
    if (!weekMap.has(cell.weekIndex)) weekMap.set(cell.weekIndex, []);
    weekMap.get(cell.weekIndex)!.push(cell);
  }

  const weeks: WeekData[] = [];
  for (const [idx, cells] of weekMap) {
    weeks.push({ cells, weekOffset: idx });
  }
  weeks.sort((a, b) => a.weekOffset - b.weekOffset);

  return { weeks, weekOffset: weeks[0]?.weekOffset ?? 0 };
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const LEVEL_COLORS: Record<number, string> = {
  0: 'var(--heatmap-bg)',
  1: 'var(--heatmap-1)',
  2: 'var(--heatmap-2)',
  3: 'var(--heatmap-3)',
};

export default function WritingHeatmap({ data }: WritingHeatmapProps) {
  const grid = useMemo(() => buildGrid(data), [data]);

  if (!grid || grid.weeks.length === 0) {
    return null;
  }

  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = [];
    for (const week of grid.weeks) {
      const idx = week.weekOffset;
      for (const cell of week.cells) {
        if (cell.monthLabel) {
          labels.push({ label: cell.monthLabel, col: idx });
          break;
        }
      }
    }
    return labels;
  }, [grid.weeks]);

  return (
    <section className="mt-12">
      <h2 className="mb-4 text-label-12 font-medium uppercase tracking-[0.2em] text-neutral-7">
        写作热力图
      </h2>

      <div className="overflow-x-auto pb-2">
        {/* Month labels row */}
        <div
          className="mb-1 ml-7 flex text-caption-10 text-neutral-7"
          style={{ gap: 'var(--cell-gap, 3px)' }}
        >
          {monthLabels.map((m, i) => (
            <span
              key={i}
              style={{
                gridColumn: m.col - grid.weekOffset + 1,
                position: 'relative',
                left: `calc(${(m.col - grid.weekOffset)} * (var(--cell-size, 12px) + var(--cell-gap, 3px)))`,
              }}
              className="absolute text-caption-10"
            >
              {m.label}
            </span>
          ))}
        </div>

        {/* Grid with day labels */}
        <div className="flex">
          {/* Day labels (y-axis) */}
          <div
            className="mr-1.5 flex flex-col pt-px text-caption-10 leading-none text-neutral-7"
            style={{ gap: 'var(--cell-gap, 3px)' }}
          >
            {[0, 1, 2, 3, 4, 5, 6].map((d) => (
              <div
                key={d}
                style={{
                  width: 'var(--cell-size, 12px)',
                  height: 'var(--cell-size, 12px)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {WEEK_LABELS[d] ?? ''}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div
            className="grid grid-flow-col"
            style={{
              gridTemplateRows: 'repeat(7, var(--cell-size, 12px))',
              gap: 'var(--cell-gap, 3px)',
            }}
          >
            {grid.weeks.map((week) =>
              week.cells.map((cell) => (
                <div
                  key={cell.date}
                  title={`${cell.date}: ${cell.count} 篇`}
                  style={{
                    width: 'var(--cell-size, 12px)',
                    height: 'var(--cell-size, 12px)',
                    backgroundColor: LEVEL_COLORS[cell.level],
                    borderRadius: '2px',
                  }}
                  className="transition-colors"
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-1.5 text-caption-10 text-neutral-7">
        <span>Less</span>
        {[0, 1, 2, 3].map((level) => (
          <div
            key={level}
            style={{
              width: '10px',
              height: '10px',
              backgroundColor: LEVEL_COLORS[level],
              borderRadius: '2px',
            }}
          />
        ))}
        <span>More</span>
      </div>
    </section>
  );
}

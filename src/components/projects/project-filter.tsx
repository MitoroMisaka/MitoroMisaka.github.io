import { useState, useEffect, useMemo } from 'react';

interface ProjectData {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: string;
  stack: string[];
}

interface ProjectFilterProps {
  projects: ProjectData[];
}

const STATUS_LABELS: Record<string, string> = {
  active: '进行中',
  planned: '计划中',
  archived: '已归档',
};

const STATUS_ORDER = ['active', 'planned', 'archived'];

export default function ProjectFilter({ projects }: ProjectFilterProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(
    () => {
      if (typeof window === 'undefined') return null;
      const p = new URL(window.location.href).searchParams.get('status');
      return p && STATUS_ORDER.includes(p) ? p : null;
    }
  );
  const [selectedStack, setSelectedStack] = useState<string | null>(
    () => {
      if (typeof window === 'undefined') return null;
      const p = new URL(window.location.href).searchParams.get('stack');
      return p || null;
    }
  );

  // Derive available stacks from current status filter
  const availableStacks = useMemo(() => {
    const stacks = new Set<string>();
    const filtered = selectedStatus
      ? projects.filter((p) => p.status === selectedStatus)
      : projects;
    for (const p of filtered) {
      for (const s of p.stack ?? []) {
        stacks.add(s);
      }
    }
    return [...stacks].sort();
  }, [projects, selectedStatus]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (selectedStatus && p.status !== selectedStatus) return false;
      if (selectedStack && !(p.stack ?? []).includes(selectedStack)) return false;
      return true;
    });
  }, [projects, selectedStatus, selectedStack]);

  // Sync URL params
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (selectedStatus) url.searchParams.set('status', selectedStatus);
    else url.searchParams.delete('status');
    if (selectedStack) url.searchParams.set('stack', selectedStack);
    else url.searchParams.delete('stack');
    window.history.replaceState({}, '', url.toString());
  }, [selectedStatus, selectedStack]);

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Status filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-caption-10 font-medium text-neutral-7 mr-1">状态:</span>
          <button
            onClick={() => setSelectedStatus(null)}
            className={`rounded-full border px-2.5 py-0.5 text-caption-10 transition ${
              !selectedStatus
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-neutral-3 text-neutral-7 hover:border-neutral-4'
            }`}
          >
            全部
          </button>
          {STATUS_ORDER.map((s) => {
            const count = projects.filter((p) => p.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`rounded-full border px-2.5 py-0.5 text-caption-10 transition ${
                  selectedStatus === s
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-neutral-3 text-neutral-7 hover:border-neutral-4'
                }`}
              >
                {STATUS_LABELS[s]} {count}
              </button>
            );
          })}
        </div>

        {/* Stack filter */}
        {availableStacks.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-caption-10 font-medium text-neutral-7 mr-1">技术栈:</span>
            <button
              onClick={() => setSelectedStack(null)}
              className={`rounded-full border px-2.5 py-0.5 text-caption-10 transition ${
                !selectedStack
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-neutral-3 text-neutral-7 hover:border-neutral-4'
              }`}
            >
              全部
            </button>
            {availableStacks.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStack(s)}
                className={`rounded-full border px-2.5 py-0.5 text-caption-10 transition ${
                  selectedStack === s
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-neutral-3 text-neutral-7 hover:border-neutral-4'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Project grid */}
      {filteredProjects.length === 0 ? (
        <div className="py-10 text-center text-label-12 text-neutral-7">
          没有符合条件的项目
        </div>
      ) : (
        <div className="space-y-6">
          {STATUS_ORDER.map((status) => {
            const items = filteredProjects.filter((p) => p.status === status);
            if (items.length === 0) return null;
            return (
              <div key={status} className="space-y-3">
                {selectedStatus === null && (
                  <h2 className="text-label-12 font-medium text-neutral-7 uppercase tracking-wide">
                    {STATUS_LABELS[status]}
                  </h2>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  {items.map((project) => (
                    <a
                      key={project.id}
                      href={`/projects/${project.slug}`}
                      className="rounded-xl border border-neutral-3 px-5 py-4 transition hover:border-neutral-4 hover:bg-neutral-1"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-medium text-neutral-9">{project.name}</h3>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-caption-10 font-medium ${
                          project.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                          project.status === 'planned' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                          'bg-zinc-500/10 text-zinc-500'
                        }`}>
                          {STATUS_LABELS[project.status] ?? project.status}
                        </span>
                      </div>
                      {project.description && (
                        <p className="mt-2 text-label-12 text-neutral-7 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      {project.stack.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {project.stack.map((s: string) => (
                            <span
                              key={s}
                              className="rounded-full border border-neutral-3 px-2 py-px text-caption-10 text-neutral-7"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

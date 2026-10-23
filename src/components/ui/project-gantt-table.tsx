import { useState } from 'react';
import { Calendar, Clock, ListFilter, BarChart2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface ProjectPhaseItem {
  id?: string | number;
  name: string;
  tasks: string[];
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  sortOrder?: number;
  duration?: string;
}

interface ProjectGanttTableProps {
  phases: ProjectPhaseItem[];
}

function formatDate(dateVal?: string | Date | null): string {
  if (!dateVal) return '-';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateVal);
  }
}

function calculateDuration(start?: string | Date | null, end?: string | Date | null): string {
  if (!start || !end) return '-';
  try {
    const d1 = new Date(start);
    const d2 = new Date(end);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return '-';
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} Days`;
  } catch {
    return '-';
  }
}

export function ProjectGanttTable({ phases }: ProjectGanttTableProps) {
  const [viewMode, setViewMode] = useState<'table' | 'visual'>('table');

  if (!phases || phases.length === 0) {
    return null;
  }

  // Calculate earliest and latest dates for relative visual bar sizing
  const validPhasesWithDates = phases.map((phase, idx) => {
    const s = phase.startDate ? new Date(phase.startDate).getTime() : null;
    const e = phase.endDate ? new Date(phase.endDate).getTime() : null;
    const durationStr = phase.duration || calculateDuration(phase.startDate, phase.endDate);
    return {
      ...phase,
      displayId: idx + 1,
      startTime: s,
      endTime: e,
      durationStr,
    };
  });

  const allStartTimes = validPhasesWithDates.map(p => p.startTime).filter(Boolean) as number[];
  const allEndTimes = validPhasesWithDates.map(p => p.endTime).filter(Boolean) as number[];
  const minTime = allStartTimes.length > 0 ? Math.min(...allStartTimes) : 0;
  const maxTime = allEndTimes.length > 0 ? Math.max(...allEndTimes) : 0;
  const totalSpan = maxTime > minTime ? maxTime - minTime : 1;

  return (
    <div className="w-full space-y-3">
      {/* View Switcher Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h4 className="font-semibold text-sm text-foreground">Project Gantt Chart & Schedule</h4>
        </div>
        <div className="inline-flex items-center rounded-md border bg-muted/30 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'table' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ListFilter className="w-3 h-3" /> Table
          </button>
          <button
            type="button"
            onClick={() => setViewMode('visual')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'visual' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart2 className="w-3 h-3" /> Timeline
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* TABLE VIEW matching user's dark screenshot */
        <div className="overflow-x-auto rounded-lg border border-border/80 bg-card text-card-foreground shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/50 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3 w-12 text-center">ID</th>
                <th className="py-2.5 px-4 min-w-[140px]">Phase</th>
                <th className="py-2.5 px-4 min-w-[240px]">Task Name</th>
                <th className="py-2.5 px-3 min-w-[95px]">Start Date</th>
                <th className="py-2.5 px-3 min-w-[95px]">End Date</th>
                <th className="py-2.5 px-3 min-w-[90px]">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {validPhasesWithDates.map((item) => (
                <tr key={item.id || item.displayId} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3 text-center font-medium text-muted-foreground align-top">
                    {item.displayId}
                  </td>
                  <td className="py-3 px-4 font-semibold text-foreground align-top">
                    {item.name}
                  </td>
                  <td className="py-3 px-4 align-top">
                    {Array.isArray(item.tasks) && item.tasks.length > 0 ? (
                      <ul className="space-y-1">
                        {item.tasks.map((task, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-muted-foreground text-xs leading-relaxed">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary/70 mt-1.5 shrink-0" />
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted-foreground italic">No tasks listed</span>
                    )}
                  </td>
                  <td className="py-3 px-3 align-top font-mono text-muted-foreground whitespace-nowrap">
                    {formatDate(item.startDate)}
                  </td>
                  <td className="py-3 px-3 align-top font-mono text-muted-foreground whitespace-nowrap">
                    {formatDate(item.endDate)}
                  </td>
                  <td className="py-3 px-3 align-top whitespace-nowrap">
                    <Badge variant="secondary" className="font-medium text-[11px] gap-1 px-2 py-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {item.durationStr}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* VISUAL GANTT BAR TIMELINE */
        <div className="rounded-lg border border-border/80 bg-card p-4 space-y-3.5 shadow-sm">
          {validPhasesWithDates.map((item) => {
            const leftPct = item.startTime && totalSpan > 1 ? ((item.startTime - minTime) / totalSpan) * 100 : 0;
            const widthPct = item.startTime && item.endTime && totalSpan > 1
              ? Math.max(5, ((item.endTime - item.startTime) / totalSpan) * 100)
              : 25;

            return (
              <div key={item.id || item.displayId} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    {item.displayId}. {item.name}
                  </span>
                  <span className="text-muted-foreground font-mono text-[11px]">
                    {formatDate(item.startDate)} → {formatDate(item.endDate)} ({item.durationStr})
                  </span>
                </div>
                <div className="w-full bg-muted/50 h-6 rounded-md relative flex items-center border border-border/40 overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 bg-primary/80 hover:bg-primary rounded-md transition-all flex items-center px-2"
                    style={{
                      left: `${Math.min(90, Math.max(0, leftPct))}%`,
                      width: `${Math.min(100 - leftPct, Math.max(8, widthPct))}%`,
                    }}
                  >
                    <span className="text-[10px] font-semibold text-primary-foreground truncate drop-shadow-xs">
                      {item.tasks?.[0] || item.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

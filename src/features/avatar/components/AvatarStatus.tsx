import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/api/avatar";

type AvatarStatusProps = {
  phase: string;
  elapsedSeconds: number;
  maxCallSeconds: number;
  usage: {
    month: string;
    secondsUsed: number;
    secondsBudget: number;
    remainingSeconds: number;
    perUserSecondsUsed: number;
    perUserSecondsBudget: number;
    perUserRemainingSeconds: number;
  } | null;
};

const PHASE_LABEL: Record<string, string> = {
  loading: "Loading",
  idle: "Ready",
  connecting: "Connecting",
  live: "Live",
  ending: "Ending",
  ended: "Ended",
  error: "Error",
};

const DOT_CLASS: Record<string, string> = {
  live: "bg-emerald-500",
  connecting: "bg-amber-500 animate-pulse",
  ending: "bg-amber-500 animate-pulse",
  error: "bg-red-500",
  ended: "bg-violet-500",
  idle: "bg-slate-400",
  loading: "bg-slate-400",
};

function Meter({ used, total, tone }: { used: number; total: number; tone: string }) {
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;

  return (
    <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-200" title={`${formatDuration(used)} of ${formatDuration(total)}`}>
      <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function AvatarStatus({ phase, elapsedSeconds, maxCallSeconds, usage }: AvatarStatusProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm">
      <div className="flex items-center gap-3">
        <span className={cn("h-2 w-2 rounded-full", DOT_CLASS[phase] ?? "bg-slate-400")} aria-hidden="true" />
        <span className="font-medium text-slate-800">{PHASE_LABEL[phase] ?? phase}</span>
        <span className="tabular-nums text-slate-600">{formatDuration(elapsedSeconds)}</span>
        <span className="text-slate-400">/ {formatDuration(maxCallSeconds)} per call</span>
      </div>

      {usage && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>
              Your allowance today {formatDuration(usage.perUserRemainingSeconds)} left
            </span>
            <Meter
              used={usage.perUserSecondsUsed}
              total={usage.perUserSecondsBudget}
              tone="bg-violet-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span>
              {usage.month} pool {formatDuration(usage.remainingSeconds)} left
            </span>
            <Meter used={usage.secondsUsed} total={usage.secondsBudget} tone="bg-slate-400" />
          </div>
        </div>
      )}
    </div>
  );
}
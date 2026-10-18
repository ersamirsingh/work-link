export const STATUS_THEMES = {
  broadcasting: {
    label: "Open for Quotes",
    classes: "bg-slate-500/10 text-slate-300 border-slate-500/25",
    barColor: "bg-slate-400",
    dot: "bg-slate-400",
    percent: 20,
  },
  worker_selected: {
    label: "Worker Assigned",
    classes: "bg-indigo-500/10 text-indigo-300 border-indigo-500/25",
    barColor: "bg-indigo-500",
    dot: "bg-indigo-400",
    percent: 45,
  },
  in_progress: {
    label: "Work in Progress",
    classes: "bg-sky-500/10 text-sky-300 border-sky-500/25",
    barColor: "bg-sky-500",
    dot: "bg-sky-400",
    percent: 70,
  },
  completed_pending_confirmation: {
    label: "Pending Confirmation",
    classes: "bg-amber-500/10 text-amber-300 border-amber-500/25",
    barColor: "bg-amber-500",
    dot: "bg-amber-400",
    percent: 90,
  },
  completed: {
    label: "Completed",
    classes: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
    barColor: "bg-emerald-500",
    dot: "bg-emerald-400",
    percent: 100,
  },
  cancelled: {
    label: "Cancelled",
    classes: "bg-zinc-500/10 text-zinc-400 border-zinc-500/25",
    barColor: "bg-zinc-500",
    dot: "bg-zinc-400",
    percent: 100,
  },
  disputed: {
    label: "Dispute in Review",
    classes: "bg-rose-500/10 text-rose-300 border-rose-500/25",
    barColor: "bg-rose-500",
    dot: "bg-rose-400",
    percent: 85,
  },
  warranty_claimed: {
    label: "Warranty Revisit",
    classes: "bg-amber-500/10 text-amber-300 border-amber-500/25",
    barColor: "bg-amber-500",
    dot: "bg-amber-400",
    percent: 75,
  },
  active: {
    label: "Active",
    classes: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
    barColor: "bg-emerald-500",
    dot: "bg-emerald-400",
    percent: 100,
  },
  inactive: {
    label: "Inactive",
    classes: "bg-zinc-500/10 text-zinc-400 border-zinc-500/25",
    barColor: "bg-zinc-500",
    dot: "bg-zinc-400",
    percent: 0,
  },
  pending: {
    label: "Pending",
    classes: "bg-amber-500/10 text-amber-300 border-amber-500/25",
    barColor: "bg-amber-500",
    dot: "bg-amber-400",
    percent: 50,
  },
  resolved: {
    label: "Resolved",
    classes: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
    barColor: "bg-emerald-500",
    dot: "bg-emerald-400",
    percent: 100,
  },
};

export const STATUS_LABELS = Object.fromEntries(
  Object.entries(STATUS_THEMES).map(([k, v]) => [k, v.label])
);

export default function StatusBadge({ value, className = "" }) {
  const theme = STATUS_THEMES[value] || {
    label: String(value || "unknown")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    classes: "bg-white/5 text-base-content/75 border-white/10",
    dot: "bg-base-content/50",
  };

  return (
    <span
      className={`inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border min-w-[140px] sm:min-w-[160px] text-center tracking-normal transition shrink-0 ${theme.classes} ${className}`}
    >
      <span className={`h-2 w-2 rounded-full shrink-0 ${theme.dot}`} />
      <span className="truncate">{theme.label}</span>
    </span>
  );
}

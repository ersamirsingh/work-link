export const STATUS_THEMES = {
  broadcasting: {
    label: "Open for Quotes",
    classes: "bg-sky-500/15 text-sky-300 border-sky-500/35 shadow-sky-500/10",
    barColor: "bg-gradient-to-r from-sky-500 to-blue-500",
    dot: "bg-sky-400 animate-pulse",
    percent: 25,
  },
  worker_selected: {
    label: "Worker Assigned",
    classes: "bg-amber-400/15 text-amber-300 border-amber-400/35 shadow-amber-400/10",
    barColor: "bg-gradient-to-r from-amber-500 to-yellow-400",
    dot: "bg-amber-400 animate-pulse",
    percent: 50,
  },
  in_progress: {
    label: "Work in Progress",
    classes: "bg-cyan-500/15 text-cyan-300 border-cyan-500/35 shadow-cyan-500/10",
    barColor: "bg-gradient-to-r from-cyan-500 to-teal-400",
    dot: "bg-cyan-400 animate-pulse",
    percent: 75,
  },
  completed_pending_confirmation: {
    label: "Pending Confirmation",
    classes: "bg-purple-500/15 text-purple-300 border-purple-500/35 shadow-purple-500/10",
    barColor: "bg-gradient-to-r from-purple-500 to-pink-500",
    dot: "bg-purple-400 animate-pulse",
    percent: 90,
  },
  completed: {
    label: "Completed",
    classes: "bg-emerald-500/15 text-emerald-300 border-emerald-500/35 shadow-emerald-500/10",
    barColor: "bg-gradient-to-r from-emerald-500 to-green-400",
    dot: "bg-emerald-400",
    percent: 100,
  },
  cancelled: {
    label: "Cancelled",
    classes: "bg-slate-500/15 text-slate-400 border-slate-500/35 shadow-slate-500/10",
    barColor: "bg-slate-500",
    dot: "bg-slate-400",
    percent: 100,
  },
  disputed: {
    label: "Dispute in Review",
    classes: "bg-rose-500/15 text-rose-300 border-rose-500/35 shadow-rose-500/10",
    barColor: "bg-gradient-to-r from-rose-500 to-red-500",
    dot: "bg-rose-400 animate-ping",
    percent: 80,
  },
  warranty_claimed: {
    label: "Warranty Revisit",
    classes: "bg-orange-500/15 text-orange-300 border-orange-500/35 shadow-orange-500/10",
    barColor: "bg-gradient-to-r from-orange-500 to-amber-400",
    dot: "bg-orange-400 animate-pulse",
    percent: 75,
  },
  active: {
    label: "Active",
    classes: "bg-emerald-500/15 text-emerald-300 border-emerald-500/35 shadow-emerald-500/10",
    barColor: "bg-emerald-500",
    dot: "bg-emerald-400",
    percent: 100,
  },
  inactive: {
    label: "Inactive",
    classes: "bg-white/10 text-base-content/60 border-white/15",
    barColor: "bg-white/20",
    dot: "bg-white/40",
    percent: 0,
  },
  pending: {
    label: "Pending",
    classes: "bg-amber-500/15 text-amber-300 border-amber-500/35 shadow-amber-500/10",
    barColor: "bg-amber-500",
    dot: "bg-amber-400",
    percent: 50,
  },
  resolved: {
    label: "Resolved",
    classes: "bg-emerald-500/15 text-emerald-300 border-emerald-500/35 shadow-emerald-500/10",
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
    classes: "bg-white/10 text-base-content/75 border-white/15",
    dot: "bg-base-content/50",
  };

  return (
    <span
      className={`inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border min-w-[150px] sm:min-w-[170px] text-center shadow-md tracking-wide transition shrink-0 ${theme.classes} ${className}`}
    >
      <span className={`h-2 w-2 rounded-full shrink-0 ${theme.dot}`} />
      <span className="truncate">{theme.label}</span>
    </span>
  );
}

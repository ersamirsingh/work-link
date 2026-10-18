export const STATUS_LABELS = {
  broadcasting: "Open",
  worker_selected: "Assigned",
  in_progress: "In Progress",
  completed_pending_confirmation: "Pending Confirmation",
  completed: "Completed",
  cancelled: "Cancelled",
  disputed: "Disputed",
  warranty_claimed: "Warranty Revisit",
  active: "Active",
  inactive: "Inactive",
  pending: "Pending",
  resolved: "Resolved",
};

const map = {
  broadcasting: "badge-info",
  worker_selected: "badge-warning",
  in_progress: "badge-secondary",
  completed_pending_confirmation: "badge-accent",
  completed: "badge-success",
  cancelled: "badge-error",
  disputed: "badge-error",
  warranty_claimed: "badge-warning",
  active: "badge-success",
  inactive: "badge-ghost",
  pending: "badge-warning",
  resolved: "badge-success",
};

export default function StatusBadge({ value }) {
  const label =
    STATUS_LABELS[value] ||
    String(value || "unknown")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span className={`status-chip badge ${map[value] || "badge-ghost"}`}>
      {label}
    </span>
  );
}

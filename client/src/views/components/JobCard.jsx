import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, RadioTower, Sparkles, UserRound, Wallet } from "lucide-react";
import StatusBadge, { STATUS_THEMES } from "./StatusBadge.jsx";
import { formatCurrency, formatDateTime } from "../../models/format.model.js";
import { useAppController } from "../../controllers/AppController.jsx";

const PROGRESS_LABELS = {
  broadcasting: "Waiting for worker interest",
  worker_selected: "Assigned and en route",
  in_progress: "Repair in progress",
  completed_pending_confirmation: "Awaiting customer confirmation",
  completed: "Closed successfully",
  cancelled: "Cancelled",
  disputed: "Dispute open",
  warranty_claimed: "Warranty revisit requested",
};

export default function JobCard({ job, href, action, showAssignment = false }) {
  const { user } = useAppController();
  const isCustomer = user?.activeMode === "customer";
  const statusTheme = STATUS_THEMES[job?.status] || STATUS_THEMES.broadcasting;

  const amount =
    job?.pricing?.standardRate ||
    job?.pricing?.inspectionFee ||
    job?.pricing?.totalUserPayable ||
    job?.wage ||
    0;
  const assignedWorkerName = job?.selectedWorker?.Name || "";

  // Resolve the single latest milestone reached instead of displaying past milestones simultaneously
  const getLatestMilestone = (j) => {
    if (j?.timeline?.closedAt || j?.status === "completed") {
      return { label: "Job Closed", time: j?.timeline?.closedAt };
    }
    if (j?.timeline?.workCompletedAt || j?.status === "completed_pending_confirmation") {
      return { label: "Work Completed", time: j?.timeline?.workCompletedAt };
    }
    if (j?.timeline?.workerArrivedAt || j?.status === "in_progress") {
      return { label: "Worker Arrived", time: j?.timeline?.workerArrivedAt };
    }
    if (j?.selectedWorker) {
      return { label: "Worker Assigned", time: j?.timeline?.selectedAt };
    }
    return null;
  };

  const latestMilestone = getLatestMilestone(job);

  const progressText =
    job?.status === "completed_pending_confirmation"
      ? isCustomer
        ? "Awaiting your confirmation"
        : "Awaiting customer confirmation"
      : PROGRESS_LABELS[job?.status] || "Status unavailable";

  return (
    <motion.article
      whileHover={{ y: -5 }}
      className="glass-panel relative overflow-hidden rounded-[1.75rem] p-5"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-base-content/45">
              {job.category || "General"}
            </p>
            <h3 className="text-xl font-semibold text-base-100">{job.title}</h3>
          </div>
          <StatusBadge value={job.status} />
        </div>

        <p className="line-clamp-2 text-sm leading-7 text-base-content/65">
          {job.description}
        </p>

        <div className="grid gap-3 text-sm text-base-content/65 md:grid-cols-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-warning" />
            <span>
              {job.distanceKm !== undefined && job.distanceKm !== null
                ? `${job.distanceKm.toFixed(1)} km away (${job.locationText || "Location pending"})`
                : job.locationText || "Location pending"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-warning" />
            <span>{formatCurrency(amount)}</span>
          </div>
          <div className="flex items-center gap-2">
            <RadioTower className="h-4 w-4 text-warning" />
            <span>{job.pricingModel === "standard" ? "Fixed rate" : "Inspection-first"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-warning" />
            <span>{formatDateTime(job.createdAt)}</span>
          </div>
        </div>

        {showAssignment ? (
          <div className="rounded-[1.2rem] border border-white/6 bg-white/3 px-4 py-3.5 space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <UserRound className="h-4 w-4 text-warning shrink-0" />
                <span className="text-base-content/55">Assigned to:</span>
                <span className="text-base-100 font-medium">
                  {assignedWorkerName || "No worker assigned yet"}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-base-content/55">Progress:</span>{" "}
                <span className="text-base-100 font-medium">
                  {progressText}
                </span>
              </div>
            </div>

            {/* Full-width colored horizontal status bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-base-content/65 font-medium flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${statusTheme.dot}`} />
                  <span>Status: <strong className="text-base-100">{statusTheme.label}</strong></span>
                </span>
                <span className="text-xs font-bold text-base-content/80">{statusTheme.percent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-500 shadow-sm ${statusTheme.barColor}`}
                  style={{ width: `${statusTheme.percent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs pt-0.5">
              <span className="text-base-content/50 font-medium">Latest Milestone:</span>
              {latestMilestone ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold bg-white/5 text-base-content/85 border border-white/10">
                  <span className={`h-1.5 w-1.5 rounded-full ${statusTheme.dot}`} />
                  <span>{latestMilestone.label}</span>
                  {latestMilestone.time ? (
                    <span className="text-base-content/40 font-normal">
                      ({formatDateTime(latestMilestone.time)})
                    </span>
                  ) : null}
                </span>
              ) : (
                <span className="text-base-content/40">
                  No lifecycle milestone reached yet
                </span>
              )}
            </div>

            {job?.finalRating ? (
              <div className="text-sm">
                <span className="text-base-content/55">Rating:</span>{" "}
                <span className="text-base-100">{job.finalRating}/5</span>
                <span className="text-base-content/50">
                  {job.finalReview ? ` · ${job.finalReview}` : " · Review saved"}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(job.skills || []).slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-base-content/75 border border-white/5"
              >
                {skill}
              </span>
            ))}
            {job.applications?.length ? (
              <span className="badge badge-warning rounded-full px-2.5 py-1 text-xs font-semibold text-black">
                {job.applications.length} interest{job.applications.length > 1 ? "s" : ""}
              </span>
            ) : null}
          </div>
          <div className="flex gap-3">
            {href ? (
              <Link className="k-btn-ghost" to={href}>
                View
              </Link>
            ) : null}
            {action}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

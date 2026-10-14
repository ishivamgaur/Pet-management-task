import { Hourglass, Check, X } from "reicon-react";

// One place that decides what a status looks like, used by every page.
const META = {
  pending: { label: "Pending", Icon: Hourglass, tone: "bg-[#fbe7bd] text-[#7a4d0d]" },
  approved: { label: "Approved", Icon: Check, tone: "bg-mint text-forest" },
  rejected: { label: "Not selected", Icon: X, tone: "bg-blush text-[#8a2318]" },
  available: { label: "Available", tone: "bg-mint text-forest" },
  adopted: { label: "Adopted", tone: "bg-[#e4e4e4] text-[#555]" },
};

// Compact badge for card overlays and admin lists.
export function StatusBadge({ status, withIcon = true }) {
  const meta = META[status] || META.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-bold tracking-[0.04em] uppercase ${meta.tone}`}
    >
      {withIcon && meta.Icon ? <meta.Icon size={11} weight="Filled" aria-hidden="true" /> : null}
      {meta.label}
    </span>
  );
}

// Larger tag for dashboard rows, where the status is the main message.
export function StatusTag({ status }) {
  const meta = META[status] || META.pending;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.75 text-[0.82rem] font-semibold whitespace-nowrap ${meta.tone}`}
    >
      {meta.Icon ? <meta.Icon size={14} aria-hidden="true" /> : null}
      {meta.label}
    </span>
  );
}

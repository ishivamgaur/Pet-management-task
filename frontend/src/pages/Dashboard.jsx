import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, FileText, Hourglass, Check, X, Calendar } from "reicon-react";
import { useMyApplications } from "../api/queries";
import { readJSON, writeJSON } from "../utils/storage";
import { petPhoto } from "../components/PetCard";
import { StatGridSkeleton, PetRowListSkeleton, HeadingSkeleton } from "../components/Skeleton";
import { btnClass } from "../lib/ui";

const statusMeta = {
  pending: { label: "Pending", Icon: Hourglass, tone: "bg-[#fbe7bd] text-[#7a4d0d]" },
  approved: { label: "Approved", Icon: Check, tone: "bg-mint text-forest" },
  rejected: { label: "Not selected", Icon: X, tone: "bg-blush text-[#8a2318]" },
};

const stats = [
  { key: "total", label: "Total sent", Icon: FileText, tone: "bg-cream text-forest" },
  { key: "pending", label: "Waiting", Icon: Hourglass, tone: "bg-[#fbe7bd] text-[#7a4d0d]" },
  { key: "approved", label: "Approved", Icon: Check, tone: "bg-mint text-forest" },
  { key: "rejected", label: "Not selected", Icon: X, tone: "bg-blush text-[#8a2318]" },
];

function daysAgo(date) {
  const days = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(date).toLocaleDateString();
}

export default function Dashboard() {
  const [updates, setUpdates] = useState([]);
  const { data, isPending } = useMyApplications();

  // Anything whose status changed since the last visit is news. Kept out of
  // the cache on purpose, it is a one-off notice rather than server data.
  useEffect(() => {
    if (!data) return;
    const seen = readJSON("seenApps", {});
    setUpdates(data.filter((a) => seen[a._id] && seen[a._id] !== a.status));
    const next = {};
    data.forEach((a) => (next[a._id] = a.status));
    writeJSON("seenApps", next);
  }, [data]);

  const apps = data ?? [];
  const loading = isPending;

  if (loading)
    return (
      <div className="page-shell max-w-[1080px]">
        <div className="mb-2">
          <HeadingSkeleton lines={1} />
        </div>
        <StatGridSkeleton />
        <h2 className="mb-4 font-display text-[1.25rem]">All requests</h2>
        <PetRowListSkeleton />
      </div>
    );

  const counts = {
    total: apps.length,
    pending: apps.filter((a) => a.status === "pending").length,
    approved: apps.filter((a) => a.status === "approved").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="page-shell max-w-[1080px]">
      <h1 className="page-title-lg mb-2">My applications</h1>
      <p className="mb-7.5 text-muted">Track every request you have sent to the shelter.</p>

      {updates.length > 0 && (
        <div
          role="status"
          className="mb-7 flex items-start justify-between gap-4 rounded-panel bg-mint p-5.5 text-forest"
        >
          <div>
            <strong className="inline-flex items-center gap-2">
              <Sparkles size={18} /> {updates.length} update{updates.length > 1 ? "s" : ""}
            </strong>
            <ul className="mt-2 mb-0 pl-5">
              {updates.map((u) => (
                <li key={u._id}>
                  {u.pet?.name || "A pet"}:{" "}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[0.78rem] font-bold text-white ${u.status === "approved" ? "bg-forest" : u.status === "rejected" ? "bg-[#8a2318]" : "bg-[#7a4d0d]"}`}
                  >
                    {u.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => setUpdates([])}
            className={btnClass({ variant: "ghost", size: "sm" })}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="mb-10 grid grid-cols-4 gap-3.5 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
        {stats.map(({ key, label, Icon, tone }) => (
          <div
            key={key}
            className="flex items-center gap-3.5 rounded-[18px] bg-paper p-4.5 shadow-card"
          >
            <span
              className={`grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl ${tone}`}
            >
              <Icon size={18} />
            </span>
            <div className="grid gap-0.5">
              <strong className="tnum font-display text-[1.5rem] leading-[1.1] font-bold text-forest">
                {counts[key]}
              </strong>
              <span className="text-[0.82rem] font-semibold text-muted">{label}</span>
            </div>
          </div>
        ))}
      </div>

      {apps.length === 0 ? (
        <div className="py-18 text-center">
          <h2 className="section-title">Nothing here yet</h2>
          <p className="mt-2 text-muted">Browse pets and send your first application.</p>
          <Link to="/" className={btnClass({ size: "sm", className: "mt-3.5" })}>
            Browse pets
          </Link>
        </div>
      ) : (
        <>
          <h2 className="mb-4 font-display text-[1.25rem]">All requests</h2>
          <div className="grid gap-4">
            {apps.map((a) => {
              const meta = statusMeta[a.status] || statusMeta.pending;
              const StatusIcon = meta.Icon;
              return (
                <div
                  key={a._id}
                  className="flex items-center gap-4 rounded-2xl bg-paper py-4 pr-5 pl-3 shadow-card max-[860px]:flex-wrap"
                >
                  <img
                    src={petPhoto(a.pet)}
                    alt=""
                    aria-hidden="true"
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <strong className="block font-display text-base">
                      {a.pet?.name || "Pet removed"}
                    </strong>
                    <p className="mt-1.5 mb-0 flex items-center gap-1 text-[0.9rem] text-muted">
                      <Calendar size={12} /> {daysAgo(a.createdAt)}
                    </p>
                    {a.message && (
                      <p className="mt-1.5 mb-0 text-[0.9rem] text-[#4c554f]">{a.message}</p>
                    )}
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.75 text-[0.82rem] font-semibold whitespace-nowrap ${meta.tone}`}
                  >
                    <StatusIcon size={14} /> {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

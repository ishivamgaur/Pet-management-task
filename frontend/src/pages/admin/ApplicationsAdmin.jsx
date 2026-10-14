import { useEffect, useMemo, useState } from "react";
import { Check, X, Phone } from "reicon-react";
import { toast } from "sonner";
import { appsApi, petsApi } from "../../api";
import { petPhoto } from "../../components/PetCard";
import { btnClass } from "../../lib/ui";
import { StatusTag } from "../../components/StatusBadge";
import AdminLayout from "./AdminLayout";
import { daysAgo } from "../../components/PetRow";
import { ApplicationListSkeleton } from "../../components/Skeleton";

const FILTERS = [
  ["", "All"],
  ["pending", "Pending"],
  ["approved", "Approved"],
  ["rejected", "Not selected"],
];

export default function ApplicationsAdmin() {
  const [apps, setApps] = useState([]);
  const [petsCount, setPetsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    Promise.all([appsApi.all(), petsApi.stats()]).then(([a, p]) => {
      setApps(a.data);
      setPetsCount(p.data.total);
      setLoading(false);
    });
  }, []);

  async function refresh() {
    const a = await appsApi.all();
    setApps(a.data);
  }

  async function decide(id, status, petName) {
    await appsApi.decide(id, status);
    toast.success(status === "approved" ? `${petName} is going home 🏠` : `Request declined`);
    refresh();
  }

  const pendingCount = apps.filter((a) => a.status === "pending").length;
  const shown = useMemo(
    () => (filter ? apps.filter((a) => a.status === filter) : apps),
    [apps, filter]
  );

  return (
    <AdminLayout
      title="Adoption requests"
      subtitle="Review every application and decide who goes home."
      tabs={[
        { to: "/admin", label: "Pets", count: petsCount, end: true },
        { to: "/admin/applications", label: "Requests", count: pendingCount, suffix: " pending" },
      ]}
    >
      <div className="mb-7 flex flex-wrap items-center gap-2">
        <div className="inline-flex flex-wrap gap-1 rounded-[14px] bg-cream p-1">
          {FILTERS.map(([value, label]) => {
            const n = value ? apps.filter((a) => a.status === value).length : apps.length;
            const on = filter === value;
            return (
              <button
                key={value}
                onClick={() => setFilter(value)}
                aria-pressed={on}
                className={`tnum inline-flex min-h-9 items-center gap-2 rounded-[10px] px-3.5 text-[0.85rem] font-semibold transition-colors duration-150 ${
                  on
                    ? "bg-paper text-forest shadow-[0_1px_2px_rgba(30,58,43,0.12)]"
                    : "text-muted hover:text-forest"
                }`}
              >
                {label}
                <span className={on ? "text-forest/60" : "text-muted/70"}>{n}</span>
              </button>
            );
          })}
        </div>

        {filter && (
          <button
            onClick={() => setFilter("")}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-[10px] px-3 text-[0.85rem] font-semibold text-muted transition-colors hover:text-forest"
          >
            <X size={14} aria-hidden="true" /> Clear
          </button>
        )}
      </div>

      {loading ? (
        <ApplicationListSkeleton />
      ) : shown.length === 0 ? (
        <div className="py-16 text-center">
          <h2 className="section-title">Nothing to review</h2>
          <p className="mt-2 text-muted">
            {filter ? "No requests with that status." : "No applications yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {shown.map((a) => (
            <article
              key={a._id}
              className="grid gap-4 rounded-card bg-paper p-4 shadow-card max-[820px]:grid-cols-[80px_1fr] max-[820px]:gap-x-4 sm:grid-cols-[80px_1fr_auto] sm:items-center"
            >
              <img
                src={petPhoto(a.pet)}
                alt=""
                aria-hidden="true"
                className="h-20 w-20 rounded-panel object-cover max-[820px]:col-start-1 max-[820px]:row-start-1"
              />

              <div className="min-w-0 max-[820px]:col-start-2 max-[820px]:row-start-1">
                <h3 className="m-0 font-display text-[1.15rem] font-semibold text-forest">
                  {a.pet?.name || "Pet removed"}
                </h3>
                <p className="mt-1 mb-0 text-[0.88rem] text-muted">
                  Requested by <strong className="font-semibold text-forest">{a.user?.name}</strong>{" "}
                  · {daysAgo(a.createdAt)}
                </p>
                <p className="mt-1 mb-0 flex flex-wrap items-center gap-x-2 text-[0.85rem] text-muted">
                  <span>{a.user?.email}</span>
                  {a.phone && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        <Phone size={12} aria-hidden="true" />
                        {a.phone}
                      </span>
                    </>
                  )}
                </p>

                {a.message && (
                  <p className="mt-3 mb-0 rounded-xl bg-cream px-3.5 py-2.5 text-[0.88rem] leading-[1.6] text-[#4c554f]">
                    {a.message}
                  </p>
                )}
              </div>

              {a.status === "pending" ? (
                <div className="col-span-full grid grid-cols-2 gap-2 sm:col-start-3 sm:w-auto sm:shrink-0">
                  <button
                    onClick={() => decide(a._id, "approved", a.pet?.name)}
                    className={btnClass({ size: "sm", className: "w-full" })}
                  >
                    <Check size={15} /> Approve
                  </button>
                  <button
                    onClick={() => decide(a._id, "rejected", a.pet?.name)}
                    className={btnClass({ variant: "ghost", size: "sm", className: "w-full" })}
                  >
                    <X size={15} /> Reject
                  </button>
                </div>
              ) : (
                <div className="max-[820px]:col-start-2 sm:col-start-3">
                  <StatusTag status={a.status} />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

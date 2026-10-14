// Loading placeholders. Each one mirrors the real component's exact
// grid, dimensions, radii and spacing, so swapping skeleton for content
// causes no layout shift.
//
// The grid classes are exported and shared with the pages rather than
// repeated here, because a skeleton in a different grid than its card is
// the whole thing this is meant to avoid.

export const PET_GRID =
  "grid grid-cols-4 gap-6 max-[1100px]:grid-cols-3 max-[860px]:grid-cols-2 max-[560px]:grid-cols-1";

export const ADMIN_PET_GRID = "grid grid-cols-2 gap-5 max-[760px]:grid-cols-1";

// Hides the blocks from screen readers and announces once instead.
//
// The inner wrapper must be display:contents. Without it the wrapper itself
// becomes the grid's only child, so the cards stack in a single column
// instead of filling the grid, even though the computed grid still reports
// the right column count.
function Loading({ label, children, className = "" }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      <div className="contents" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}

// The single primitive everything else composes from.
function Bar({ className = "" }) {
  return <div className={`shimmer ${className}`} />;
}

// Mirrors components/PetCard.jsx
export function PetCardSkeleton() {
  return (
    <div className="relative">
      <div className="block overflow-hidden rounded-card bg-paper shadow-card">
        <div className="relative overflow-hidden">
          <Bar className="block h-[220px] w-full" />
          <Bar className="absolute top-2.5 left-2.5 h-[22px] w-16 rounded-full" />
        </div>
        <div className="px-5 pt-5 pb-6">
          <div className="flex items-baseline justify-between gap-2">
            <Bar className="h-[1.3rem] w-24 rounded-[10px]" />
            <Bar className="h-[22px] w-14 rounded-full" />
          </div>
          <Bar className="mt-2.5 h-[0.9rem] w-3/4 rounded-[10px]" />
          <Bar className="mt-3.5 h-[0.9rem] w-28 rounded-[10px]" />
        </div>
      </div>
      <Bar className="absolute top-2.5 right-2.5 h-9 w-9 rounded-full" />
    </div>
  );
}

export function PetGridSkeleton({ count = 9 }) {
  return (
    <Loading label="Loading pets" className={PET_GRID}>
      {Array.from({ length: count }, (_, i) => (
        <PetCardSkeleton key={i} />
      ))}
    </Loading>
  );
}

// Mirrors the pet card in pages/admin/PetsAdmin.jsx
export function AdminPetSkeleton() {
  return (
    <div className="overflow-hidden rounded-card bg-paper shadow-card">
      <div className="relative">
        <Bar className="block h-44 w-full" />
        <Bar className="absolute top-3 left-3 h-6 w-20 rounded-full" />
      </div>
      <div className="p-5">
        <Bar className="h-[1.2rem] w-32 rounded-[10px]" />
        <Bar className="mt-1 h-[0.88rem] w-4/5 rounded-[10px]" />
        <Bar className="mt-3 h-[0.88rem] w-full rounded-[10px]" />
        <Bar className="mt-1.5 h-[0.88rem] w-3/5 rounded-[10px]" />
        <div className="mt-4 flex gap-2">
          <Bar className="h-10 flex-1 rounded-full" />
          <Bar className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function AdminPetGridSkeleton({ count = 4 }) {
  return (
    <Loading label="Loading pets" className={ADMIN_PET_GRID}>
      {Array.from({ length: count }, (_, i) => (
        <AdminPetSkeleton key={i} />
      ))}
    </Loading>
  );
}

// Mirrors components/PetRow.jsx
export function PetRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-paper py-3 pr-5 pl-3 shadow-card max-[860px]:flex-wrap">
      <Bar className="h-16 w-16 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <Bar className="h-5 w-40 rounded-[10px]" />
        <Bar className="mt-1.5 h-[0.9rem] w-28 rounded-[10px]" />
        <Bar className="mt-1.5 h-[0.9rem] w-36 rounded-[10px]" />
      </div>
      <Bar className="h-7 w-24 shrink-0 rounded-full" />
    </div>
  );
}

export function PetRowListSkeleton({ count = 3 }) {
  return (
    <Loading label="Loading applications" className="grid gap-4">
      {Array.from({ length: count }, (_, i) => (
        <PetRowSkeleton key={i} />
      ))}
    </Loading>
  );
}

// Mirrors the request card in pages/admin/ApplicationsAdmin.jsx
export function ApplicationSkeleton() {
  return (
    <div className="grid gap-4 rounded-card bg-paper p-4 shadow-card max-[820px]:grid-cols-[80px_1fr] max-[820px]:gap-x-4 sm:grid-cols-[80px_1fr_auto] sm:items-center">
      <Bar className="h-20 w-20 rounded-panel max-[820px]:col-start-1 max-[820px]:row-start-1" />
      <div className="min-w-0 max-[820px]:col-start-2 max-[820px]:row-start-1">
        <Bar className="h-[1.15rem] w-32 rounded-[10px]" />
        <Bar className="mt-1 h-[0.88rem] w-52 max-[820px]:w-full rounded-[10px]" />
        <Bar className="mt-1 h-[0.85rem] w-44 rounded-[10px]" />
        <Bar className="mt-3 h-14 w-full rounded-xl" />
      </div>
      <Bar className="col-span-full h-10 rounded-full sm:col-start-3 sm:w-24" />
    </div>
  );
}

export function ApplicationListSkeleton({ count = 3 }) {
  return (
    <Loading label="Loading applications" className="grid gap-4">
      {Array.from({ length: count }, (_, i) => (
        <ApplicationSkeleton key={i} />
      ))}
    </Loading>
  );
}

// Mirrors the stat tiles on the user dashboard
export function StatSkeleton() {
  return (
    <div className="flex items-center gap-3.5 rounded-[18px] bg-paper p-4.5 shadow-card">
      <Bar className="h-[42px] w-[42px] shrink-0 rounded-xl" />
      <div className="grid gap-1.5">
        <Bar className="h-[1.5rem] w-10 rounded-[10px]" />
        <Bar className="h-[0.82rem] w-20 rounded-[10px]" />
      </div>
    </div>
  );
}

export function StatGridSkeleton({ count = 4 }) {
  return (
    <Loading
      label="Loading applications"
      className="mb-10 grid grid-cols-4 gap-3.5 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1"
    >
      {Array.from({ length: count }, (_, i) => (
        <StatSkeleton key={i} />
      ))}
    </Loading>
  );
}

// Page heading block, used where a title and subtitle are still unknown.
export function HeadingSkeleton({ lines = 2 }) {
  return (
    <div aria-hidden="true">
      <Bar className="h-[2rem] w-64 rounded-[10px] max-[560px]:w-48" />
      {Array.from({ length: lines }, (_, i) => (
        <Bar
          key={i}
          className={`h-[0.95rem] rounded-[10px] ${i === 0 ? "mt-2 w-72" : "mt-2 w-52"}`}
        />
      ))}
    </div>
  );
}

// Mirrors pages/PetDetails.jsx
export function PetDetailsSkeleton() {
  return (
    <Loading label="Loading pet" className="page-shell max-w-[1080px]">
      <Bar className="h-[1.15rem] w-24 rounded-[10px]" />

      <div className="mt-7 grid grid-cols-[1.05fr_1fr] gap-12 max-[900px]:grid-cols-1 max-[900px]:gap-8">
        <div className="relative">
          <Bar className="block h-[520px] w-full rounded-[26px] max-[900px]:h-[340px]" />
          <Bar className="absolute top-4 left-4 h-8 w-24 rounded-full" />
        </div>

        <div className="max-[900px]:mt-2">
          <Bar className="h-[0.78rem] w-16 rounded-[10px]" />
          <Bar className="mt-3 h-[3rem] w-56 rounded-[10px]" />
          <Bar className="mt-3 h-[1.1rem] w-40 rounded-[10px]" />

          <div className="mt-6 flex flex-wrap gap-2.5">
            <Bar className="h-[42px] w-28 rounded-full" />
            <Bar className="h-[42px] w-28 rounded-full" />
          </div>

          <Bar className="mt-9 h-[1.3rem] w-52 rounded-[10px]" />
          <Bar className="mt-4 h-[1.15rem] w-full rounded-[10px]" />
          <Bar className="mt-2.5 h-[1.15rem] w-full rounded-[10px]" />
          <Bar className="mt-2.5 h-[1.15rem] w-3/4 rounded-[10px]" />

          <div className="mt-9 grid gap-4 rounded-panel bg-paper p-6 shadow-card">
            <Bar className="h-[1.3rem] w-64 rounded-[10px]" />
            <Bar className="mt-1.5 h-[0.92rem] w-48 rounded-[10px]" />
            <Bar className="mt-3 h-[48px] w-full rounded-xl" />
            <Bar className="h-[132px] w-full rounded-xl" />
            <Bar className="mt-1 h-[48px] w-full rounded-full" />
          </div>
        </div>
      </div>
    </Loading>
  );
}

export { Loading, Bar };

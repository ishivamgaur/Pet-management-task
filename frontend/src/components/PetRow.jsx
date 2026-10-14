import { petPhoto } from "./PetCard";
import { Calendar } from "reicon-react";

function daysAgo(date) {
  const days = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(date).toLocaleDateString();
}

// Shared row for anything that belongs to a pet: photo, details, status.
// Used by the user dashboard and the admin shelter desk.
export default function PetRow({ pet, title, subtitle, meta, note, trailing }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-paper py-3 pr-5 pl-3 shadow-card max-[860px]:flex-wrap">
      <img
        src={petPhoto(pet)}
        alt=""
        aria-hidden="true"
        className="h-16 w-16 shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <strong className="block font-display text-base">{title}</strong>
        {subtitle && <p className="mt-1.5 mb-0 text-[0.9rem] text-muted">{subtitle}</p>}
        {meta && (
          <p className="mt-1.5 mb-0 flex flex-wrap items-center gap-1 text-[0.9rem] text-muted">
            <Calendar size={12} /> {meta}
          </p>
        )}
        {note && <p className="mt-1.5 mb-0 text-[0.9rem] text-[#4c554f]">{note}</p>}
      </div>
      {trailing}
    </div>
  );
}

export { daysAgo };

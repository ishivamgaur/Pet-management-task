import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Paw, ArrowRight } from "reicon-react";
import { ageLabel, genderIcon } from "../utils/pet";
import { readJSON, writeJSON } from "../utils/storage";
import { statusTone } from "../lib/ui";

const FALLBACK = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80";

export function petPhoto(pet) {
  if (!pet?.photoUrl) return FALLBACK;
  if (pet.photoUrl.startsWith("http")) return pet.photoUrl;
  const base = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");
  return base + pet.photoUrl;
}

export default function PetCard({ pet }) {
  const [faved, setFaved] = useState(() => readJSON("favPets", []).includes(pet._id));

  function toggleFav(e) {
    e.preventDefault();
    const favs = readJSON("favPets", []);
    writeJSON("favPets", faved ? favs.filter((id) => id !== pet._id) : [...favs, pet._id]);
    setFaved(!faved);
  }

  return (
    <div className="relative">
      <Link
        to={`/pets/${pet._id}`}
        className="group block overflow-hidden rounded-card bg-paper shadow-card transition-transform duration-200 ease-out-soft hover:-translate-y-[3px] hover:shadow-card-hover"
      >
        <div className="relative overflow-hidden">
          <img
            src={petPhoto(pet)}
            alt={pet.name}
            loading="lazy"
            className="block h-[220px] w-full object-cover transition-transform duration-300 ease-out-soft group-hover:scale-105"
          />
          <span
            className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.68rem] font-bold tracking-[0.04em] uppercase shadow-[0_2px_10px_rgba(30,58,43,0.18)] ${statusTone(pet.status)}`}
          >
            <Paw size={10} weight="Filled" aria-hidden="true" />
            {pet.status}
          </span>
        </div>

        <div className="px-5 pt-5 pb-6">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="m-0 text-[1.3rem] font-semibold">{pet.name}</h3>
            <span className="tnum shrink-0 rounded-full bg-cream px-2.5 py-0.5 text-[0.85rem] text-muted">
              {ageLabel(pet.age)}
            </span>
          </div>
          <p className="mt-2.5 mb-0 flex items-center gap-1.5 text-[0.9rem] text-muted capitalize">
            <Paw size={14} aria-hidden="true" />
            {pet.breed || "Mixed breed"} · {genderIcon(pet.gender)} {pet.gender}
          </p>
          <p className="mt-3.5 mb-0 flex items-center gap-1.5 text-[0.9rem] font-semibold text-forest">
            Meet {pet.name}
            <ArrowRight
              size={15}
              aria-hidden="true"
              className="transition-transform duration-200 ease-out-soft group-hover:translate-x-1"
            />
          </p>
        </div>
      </Link>

      <button
        type="button"
        onClick={toggleFav}
        aria-pressed={faved}
        aria-label={faved ? `Remove ${pet.name} from favorites` : `Save ${pet.name} to favorites`}
        className="absolute top-2.5 right-2.5 grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-[0_2px_10px_rgba(30,58,43,0.18)] transition-transform duration-150 before:absolute before:-inset-1.5 before:content-[''] hover:scale-[1.08] active:scale-96"
      >
        <Heart
          size={13}
          weight={faved ? "Filled" : "Outline"}
          color={faved ? "#d33f2e" : "#8a8478"}
        />
      </button>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, House, Paw, Cake, Phone, Check } from "reicon-react";
import { petsApi, appsApi } from "../api";
import { useAuth } from "../context/AuthContext";
import { petPhoto } from "../components/PetCard";
import { ageLabel, genderIcon } from "../utils/pet";
import { btnClass, statusTone } from "../lib/ui";

const field =
  "min-h-[48px] w-full rounded-xl border-[1.5px] border-line bg-paper px-4 py-2.5 font-sans text-[0.95rem] text-ink outline-none transition-colors focus:border-moss";

export default function PetDetails() {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    petsApi.get(id).then((res) => setPet(res.data));
  }, [id]);

  async function apply(e) {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await appsApi.apply({ petId: id, message, phone });
      setSent(true);
      setNote("Application sent! Track it under My applications.");
    } catch (err) {
      setSent(false);
      setNote(err.response?.data?.message || "Could not apply");
    }
  }

  if (!pet) return <p className="page-shell max-w-[1080px]">Loading pet…</p>;

  return (
    <div className="page-shell max-w-[1080px]">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 font-semibold text-moss transition-colors hover:text-forest"
      >
        <ArrowLeft size={16} /> All pets
      </Link>

      <div className="mt-7 grid grid-cols-[1.05fr_1fr] gap-12 max-[900px]:grid-cols-1 max-[900px]:gap-8">
        <div className="relative">
          <img
            src={petPhoto(pet)}
            alt={pet.name}
            className="block h-[520px] w-full rounded-[26px] object-cover max-[900px]:h-[340px]"
          />
          <span
            className={`absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.7rem] font-bold tracking-[0.04em] uppercase shadow-[0_2px_10px_rgba(30,58,43,0.2)] ${statusTone(pet.status)}`}
          >
            <Paw size={11} weight="Filled" aria-hidden="true" />
            {pet.status}
          </span>
        </div>

        <div className="max-[900px]:mt-2">
          <p className="m-0 mb-2 text-[0.78rem] font-bold tracking-[0.08em] text-moss uppercase">
            {pet.species}
          </p>
          <h1 className="m-0 font-display text-[clamp(2.2rem,5vw,3rem)] leading-[1.05]">
            {pet.name}
          </h1>
          <p className="mt-2.5 mb-0 text-[1.1rem] text-muted">{pet.breed || "Mixed breed"}</p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2.5 text-[0.88rem] font-semibold text-forest">
              <Cake size={15} aria-hidden="true" /> {ageLabel(pet.age)} old
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2.5 text-[0.88rem] font-semibold text-forest capitalize">
              {genderIcon(pet.gender)} {pet.gender}
            </span>
          </div>

          <h2 className="mt-9 mb-3 font-display text-[1.3rem]">About {pet.name}</h2>
          <p className="m-0 leading-[1.75]">{pet.description || "No notes yet. Come meet them!"}</p>

          {pet.status === "adopted" ? (
            <p className="mt-8 flex items-center gap-2.5 rounded-[14px] bg-mint px-4 py-3.5 font-semibold text-forest">
              <House size={18} /> {pet.name} already found a home
            </p>
          ) : (
            <form
              onSubmit={apply}
              className="mt-9 grid gap-4 rounded-panel bg-paper p-6 shadow-card"
            >
              <div>
                <h2 className="m-0 font-display text-[1.3rem]">Apply to adopt {pet.name}</h2>
                <p className="mt-1.5 mb-0 text-[0.92rem] text-muted">
                  The shelter replies within a day or two.
                </p>
              </div>

              <label className="grid gap-2 text-[0.88rem] font-semibold">
                Phone number
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Where can the shelter reach you?"
                  className={field}
                />
              </label>

              <label className="grid gap-2 text-[0.88rem] font-semibold">
                A little about your home
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your home, routine, past pets…"
                  className={`${field} resize-y`}
                />
              </label>

              <button type="submit" className={btnClass({ className: "mt-1 w-full" })}>
                Send application
              </button>

              {note && (
                <p
                  className={`m-0 flex items-start gap-2 rounded-[12px] px-4 py-3 font-semibold ${
                    sent ? "bg-mint text-forest" : "bg-[#fbe3e0] text-[#a02a20]"
                  }`}
                >
                  {sent && <Check size={16} className="mt-0.5 shrink-0" />}
                  {note}
                </p>
              )}

              {!user && (
                <p className="m-0 flex items-center gap-2 text-[0.88rem] text-muted">
                  <Phone size={14} className="shrink-0" /> You will be asked to log in first.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

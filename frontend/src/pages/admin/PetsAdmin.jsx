import { useEffect, useState } from "react";
import { Edit, Trash, Plus } from "reicon-react";
import { toast } from "sonner";
import { petsApi, appsApi } from "../../api";
import { petPhoto } from "../../components/PetCard";
import { ageLabel } from "../../utils/pet";
import { btnClass } from "../../lib/ui";
import { TextField } from "../../components/FormField";
import { StatusBadge } from "../../components/StatusBadge";
import AdminLayout from "./AdminLayout";
import { AdminPetGridSkeleton, ADMIN_PET_GRID } from "../../components/Skeleton";

const blank = {
  name: "",
  species: "dog",
  breed: "",
  age: "",
  gender: "male",
  description: "",
  photoUrl: "",
  status: "available",
};

const speciesList = ["dog", "cat", "rabbit", "bird"];
const statusList = ["available", "pending", "adopted"];

export default function PetsAdmin() {
  const [pets, setPets] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const [p, a] = await Promise.all([petsApi.list({ limit: 100 }), appsApi.all()]);
    setPets(p.data.pets);
    setPendingCount(a.data.filter((x) => x.status === "pending").length);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const payload = { ...form, age: Number(form.age) };
      if (editing) await petsApi.update(editing, payload);
      else await petsApi.create(payload);
      toast.success(editing ? `${form.name} updated` : `${form.name} added to the shelter`);
      setForm(blank);
      setEditing(null);
      refresh();
    } catch (err) {
      const message = err.response?.data?.message || "Could not save this pet";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  function startEdit(pet) {
    setEditing(pet._id);
    setError("");
    setForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || "",
      age: pet.age,
      gender: pet.gender,
      description: pet.description || "",
      photoUrl: pet.photoUrl || "",
      status: pet.status,
    });
    document.getElementById("pet-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelEdit() {
    setEditing(null);
    setForm(blank);
    setError("");
  }

  async function remove(pet) {
    if (!confirm(`Remove ${pet.name} from the shelter?`)) return;
    await petsApi.remove(pet._id);
    if (editing === pet._id) cancelEdit();
    toast.success(`${pet.name} removed`);
    refresh();
  }

  return (
    <AdminLayout
      title="Shelter desk"
      subtitle="Add pets, keep their details current."
      tabs={[
        { to: "/admin", label: "Pets", count: pets.length, end: true },
        { to: "/admin/applications", label: "Requests", count: pendingCount, suffix: " pending" },
      ]}
    >
      <form
        id="pet-form"
        onSubmit={save}
        className="mb-9 grid gap-4 rounded-panel border border-line bg-paper p-6 scroll-mt-24"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 font-display text-[1.25rem]">
            {editing ? `Editing ${form.name}` : "Add a new pet"}
          </h2>
          {editing && (
            <button
              type="button"
              onClick={cancelEdit}
              className={btnClass({ variant: "ghost", size: "sm" })}
            >
              Cancel
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Bruno"
            required
          />
          <label className="grid gap-2 text-[0.88rem] font-semibold">
            <span className="text-muted">Species</span>
            <select
              value={form.species}
              onChange={(e) => set("species", e.target.value)}
              className="min-h-[50px] rounded-[14px] border-[1.5px] border-line bg-paper px-4 py-3 font-sans text-[0.95rem] outline-none focus:border-moss"
            >
              {speciesList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <TextField
            label="Breed"
            value={form.breed}
            onChange={(e) => set("breed", e.target.value)}
            placeholder="Labrador"
          />
          <TextField
            label="Age in years"
            type="number"
            step="0.5"
            min="0"
            value={form.age}
            onChange={(e) => set("age", e.target.value)}
            placeholder="2"
            required
          />
          <label className="grid gap-2 text-[0.88rem] font-semibold">
            <span className="text-muted">Gender</span>
            <select
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
              className="min-h-[50px] rounded-[14px] border-[1.5px] border-line bg-paper px-4 py-3 font-sans text-[0.95rem] outline-none focus:border-moss"
            >
              <option value="male">male</option>
              <option value="female">female</option>
              <option value="unknown">unknown</option>
            </select>
          </label>
          <label className="grid gap-2 text-[0.88rem] font-semibold">
            <span className="text-muted">Status</span>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className="min-h-[50px] rounded-[14px] border-[1.5px] border-line bg-paper px-4 py-3 font-sans text-[0.95rem] outline-none focus:border-moss"
            >
              {statusList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        <TextField
          label="Photo URL"
          value={form.photoUrl}
          onChange={(e) => set("photoUrl", e.target.value)}
          placeholder="https://…"
        />
        <TextField
          as="textarea"
          label="Short description"
          rows={2}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="A calm senior who loves quiet evenings."
        />

        {error && (
          <p className="m-0 rounded-[10px] bg-[#fbe3e0] px-3.5 py-2.5 text-[0.9rem] text-[#a02a20]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className={btnClass({ className: "mt-1 justify-self-start" })}
        >
          <Plus size={16} /> {editing ? "Save changes" : "Add pet"}
        </button>
      </form>

      <h2 className="section-title mb-4">All pets</h2>
      {loading ? (
        <AdminPetGridSkeleton />
      ) : pets.length === 0 ? (
        <p className="text-muted">No pets yet. Add the first one above.</p>
      ) : (
        <div className={ADMIN_PET_GRID}>
          {pets.map((pet) => (
            <article key={pet._id} className="overflow-hidden rounded-card bg-paper shadow-card">
              <div className="relative">
                <img
                  src={petPhoto(pet)}
                  alt={pet.name}
                  className="block h-44 w-full object-cover"
                />
                <span className="absolute top-3 left-3">
                  <StatusBadge status={pet.status} />
                </span>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="m-0 font-display text-[1.2rem] font-semibold">{pet.name}</h3>
                    <p className="mt-1 mb-0 text-[0.88rem] text-muted">
                      {pet.breed || "Mixed breed"} · {pet.species} · {ageLabel(pet.age)} ·{" "}
                      {pet.gender}
                    </p>
                  </div>
                </div>

                {pet.description && (
                  <p className="mt-3 mb-0 line-clamp-2 text-[0.88rem] leading-[1.6] text-[#4c554f]">
                    {pet.description}
                  </p>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => startEdit(pet)}
                    className={btnClass({ variant: "ghost", size: "sm", className: "flex-1" })}
                  >
                    <Edit size={15} /> Edit
                  </button>
                  <button
                    onClick={() => remove(pet)}
                    aria-label={`Remove ${pet.name}`}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#b3352b] transition-colors hover:bg-[#fbe3e0]"
                  >
                    <Trash size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

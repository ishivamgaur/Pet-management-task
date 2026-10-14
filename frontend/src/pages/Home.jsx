import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowLeft, ArrowRight, Send, House, Filter, X } from "reicon-react";
import { petsApi } from "../api";
import PetCard from "../components/PetCard";
import Select from "../components/Select";
import FilterMenu from "../components/FilterMenu";
import Magnetic from "../components/Magnetic";
import { prefersCalm } from "../utils/motion";

const PAGE_SIZE = 12;

const speciesTabs = [
  { value: "", label: "All pets" },
  { value: "dog", label: "Dogs" },
  { value: "cat", label: "Cats" },
  { value: "rabbit", label: "Rabbits" },
  { value: "bird", label: "Birds" },
];

const steps = [
  {
    title: "Browse pets",
    body: "Search by name or breed, filter by species and age, and open any profile to learn their story.",
    Icon: Search,
    tint: "bg-peach",
    color: "text-[#c97f1e]",
  },
  {
    title: "Send an application",
    body: "Tell the shelter a little about your home. It takes about a minute, and applying is free.",
    Icon: Send,
    tint: "bg-mint-soft",
    color: "text-moss",
  },
  {
    title: "Welcome them home",
    body: "Track your application status online. Approved pets go home vaccinated and vet checked.",
    Icon: House,
    tint: "bg-lilac",
    color: "text-plum",
  },
];

export default function Home() {
  const [pets, setPets] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [status, setStatus] = useState("");
  const [breedOptions, setBreedOptions] = useState([]);
  const [speciesCounts, setSpeciesCounts] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sheetRef = useRef(null);
  const drag = useRef({ start: 0, y: 0, time: 0, active: false });
  const closeTimer = useRef(null);
  const mouseDown = useRef(false);

  const hasFilters = search || species || breed || maxAge || status;
  const activeCount = [species, breed, maxAge, status].filter(Boolean).length;

  // Lock the page behind the mobile sheet so pushing
  // the sheet never scrolls the listing underneath.
  useEffect(() => {
    document.body.style.overflow = filtersOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [filtersOpen]);

  useEffect(() => {
    load(1);
    // One request fills both the breed list and the species counts.
    petsApi.list({ limit: 100 }).then((res) => {
      const names = [...new Set(res.data.pets.map((p) => p.breed).filter(Boolean))].sort();
      setBreedOptions(names);
      const counts = {};
      res.data.pets.forEach((p) => {
        counts[p.species] = (counts[p.species] || 0) + 1;
      });
      setSpeciesCounts(counts);
    });
    // eslint-disable-next-line
  }, []);

  function scrollToPets() {
    const el = document.getElementById("pets");
    if (!el) return;
    el.scrollIntoView({ behavior: prefersCalm() ? "auto" : "smooth", block: "start" });
  }

  async function load(nextPage = 1, override = {}, scroll = false) {
    setLoading(true);
    const f = { search, species, breed, maxAge, status, ...override };
    const params = { page: nextPage, limit: PAGE_SIZE };
    if (f.search) params.search = f.search;
    if (f.species) params.species = f.species;
    if (f.breed) params.breed = f.breed;
    if (f.maxAge) params.maxAge = f.maxAge;
    if (f.status) params.status = f.status;
    try {
      const res = await petsApi.list(params);
      setPets(res.data.pets);
      setPage(res.data.page);
      setPages(res.data.pages);
      setTotal(res.data.total);
      if (scroll) scrollToPets();
    } finally {
      setLoading(false);
    }
  }

  function onSearch(e) {
    e.preventDefault();
    load(1, {}, true);
  }

  function speciesCount(value) {
    if (!value) return total;
    return speciesCounts[value] || 0;
  }

  function clearAll() {
    setSearch("");
    setSpecies("");
    setBreed("");
    setMaxAge("");
    setStatus("");
    load(1, { search: "", species: "", breed: "", maxAge: "", status: "" }, true);
  }

  // Slides out before unmounting so dismissals animate too.
  function dismissSheet() {
    const el = sheetRef.current;
    if (el && !prefersCalm()) {
      el.style.transition = "transform 220ms cubic-bezier(0.32, 0.72, 0, 1)";
      void el.offsetHeight;
      el.style.transform = "translateY(105%)";
      if (closeTimer.current) clearTimeout(closeTimer.current);
      closeTimer.current = window.setTimeout(() => setFiltersOpen(false), 200);
    } else {
      setFiltersOpen(false);
    }
  }

  function openSheet() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setFiltersOpen(true);
  }

  // Native-feel swipe to dismiss. A fast flick closes
  // no matter the distance, a slow drag needs 120px.
  function onSheetTouchStart(e) {
    drag.current = { start: e.touches[0].clientY, y: 0, time: Date.now(), active: true };
    if (sheetRef.current) sheetRef.current.style.transition = "none";
  }

  function onSheetTouchMove(e) {
    if (!drag.current.active || prefersCalm()) return;
    // Let scrolled content scroll instead of dragging the sheet.
    const inFields = e.target.closest && e.target.closest(".sheet-fields");
    const scrolled = sheetRef.current && sheetRef.current.scrollTop > 0;
    if (inFields && scrolled) {
      drag.current.active = false;
      return;
    }
    const y = Math.max(0, e.touches[0].clientY - drag.current.start);
    drag.current.y = y;
    if (sheetRef.current) sheetRef.current.style.transform = `translateY(${y}px)`;
  }

  function onSheetTouchEnd() {
    if (!drag.current.active) return;
    drag.current.active = false;
    const passed = Date.now() - drag.current.time;
    const velocity = drag.current.y / Math.max(1, passed);
    if (drag.current.y > 120 || velocity > 0.4) {
      dismissSheet();
    } else if (sheetRef.current) {
      sheetRef.current.style.transition = "transform 260ms cubic-bezier(0.32, 0.72, 0, 1)";
      sheetRef.current.style.transform = "";
    }
  }

  // Same feel with a mouse, for desktop testing.
  function onSheetMouseDown(e) {
    mouseDown.current = true;
    drag.current = { start: e.clientY, y: 0, time: Date.now(), active: true };
    if (sheetRef.current) sheetRef.current.style.transition = "none";
  }

  function onSheetMouseMove(e) {
    if (!mouseDown.current || prefersCalm()) return;
    const y = Math.max(0, e.clientY - drag.current.start);
    drag.current.y = y;
    if (sheetRef.current) sheetRef.current.style.transform = `translateY(${y}px)`;
  }

  function onSheetMouseUp() {
    if (!mouseDown.current) return;
    mouseDown.current = false;
    onSheetTouchEnd();
  }

  function pageNumbers() {
    const nums = [];
    const start = Math.max(1, Math.min(page - 2, pages - 4));
    for (let n = start; n <= Math.min(pages, start + 4); n++) nums.push(n);
    return nums;
  }

  return (
    <div className="page-shell max-w-[1280px]">
      <section className="pt-8 text-center max-[860px]:pt-6">
        <div className="mx-auto max-w-[780px]">
          <p className="m-0 inline-block rounded-full bg-mint px-4 py-1.5 text-[0.82rem] font-semibold text-forest">
            A small shelter with big hearts
          </p>
          <h1 className="mt-6 mb-4 text-[clamp(2rem,7vw,3.75rem)] leading-[1.06] max-[560px]:mt-5">
            Find the one who’s been <em className="not-italic text-moss">waiting for you.</em>
          </h1>
          <p className="mx-auto mb-7 max-w-[44ch] text-[1.06rem] leading-[1.7] text-muted max-[560px]:text-[0.95rem] max-[560px]:leading-[1.6]">
            Every pet below is vaccinated, health checked and ready to go home. Apply in a minute.
            Our team replies fast.
          </p>

          <div className="mx-auto mt-7.5 max-w-[760px] rounded-[20px] border-[1.5px] border-line bg-paper p-1.5 shadow-card max-[560px]:mt-6 max-[560px]:rounded-2xl max-[560px]:p-1">
            <form
              role="search"
              onSubmit={onSearch}
              className="flex items-center gap-1.5 rounded-[14px] bg-cream py-1 pr-1 pl-4 transition-shadow focus-within:shadow-[0_0_0_3px_rgba(45,90,61,0.13)] max-[560px]:rounded-[12px] max-[560px]:pl-3.5"
            >
              <Search
                size={19}
                className="shrink-0 text-muted max-[560px]:size-[17px]"
                aria-hidden="true"
              />
              <input
                placeholder="Search by name or breed…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search pets by name or breed"
                className="min-w-0 flex-1 border-0 bg-transparent px-1 py-2 font-sans text-[0.95rem] outline-none max-[560px]:text-[0.875rem]"
              />
              <button
                type="submit"
                className="inline-flex min-h-10 shrink-0 items-center rounded-[10px] bg-forest px-5 text-[0.9rem] font-semibold text-white transition-colors duration-150 hover:bg-moss active:scale-96 max-[560px]:min-h-9 max-[560px]:rounded-[8px] max-[560px]:px-4 max-[560px]:text-[0.85rem]"
              >
                Search
              </button>
            </form>

            <div
              role="group"
              aria-label="Browse by species"
              className="flex flex-wrap justify-center gap-1 px-1 pt-1.5 pb-0.5 max-[560px]:gap-0.5"
            >
              {speciesTabs.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  aria-pressed={species === t.value}
                  onClick={() => {
                    setSpecies(t.value);
                    load(1, { species: t.value }, true);
                  }}
                  className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3.5 font-sans text-[0.88rem] font-semibold transition-colors duration-150 max-[560px]:min-h-[34px] max-[560px]:gap-1 max-[560px]:px-2.5 max-[560px]:text-[0.8rem] ${
                    species === t.value
                      ? "bg-forest text-white"
                      : "text-muted hover:bg-cream hover:text-forest"
                  }`}
                >
                  {t.label}
                  <span
                    className={`tnum rounded-full px-2 py-px text-[0.72rem] font-bold max-[560px]:px-1.5 max-[560px]:text-[0.65rem] ${
                      species === t.value ? "bg-white/25 text-white" : "bg-mint text-forest"
                    }`}
                  >
                    {speciesCount(t.value)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-10 mb-2 flex justify-end max-[900px]:hidden">
        <FilterMenu activeCount={activeCount}>{filterFields("bar")}</FilterMenu>
      </div>

      <button
        type="button"
        onClick={openSheet}
        className="fixed bottom-6 left-1/2 z-40 hidden min-h-[46px] -translate-x-1/2 items-center gap-2 rounded-2xl border-[1.5px] border-forest bg-forest px-5 py-2.5 text-[0.88rem] font-bold whitespace-nowrap text-white shadow-[0_10px_28px_rgba(30,58,43,0.34)] transition-colors duration-150 hover:bg-moss max-[900px]:inline-flex"
      >
        <Filter size={18} aria-hidden="true" /> Filters
        {activeCount > 0 && (
          <span className="tnum grid h-[21px] min-w-[21px] place-items-center rounded-full bg-honey px-1.5 text-[0.72rem] text-forest">
            {activeCount}
          </span>
        )}
      </button>

      {filtersOpen && (
        <div
          onClick={dismissSheet}
          className="animate-fade-in fixed inset-0 z-40 bg-[rgba(26,30,28,0.45)] max-[900px]:grid"
        >
          <div
            ref={sheetRef}
            role="dialog"
            aria-label="Filters"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onSheetTouchStart}
            onTouchMove={onSheetTouchMove}
            onTouchEnd={onSheetTouchEnd}
            onMouseDown={onSheetMouseDown}
            onMouseMove={onSheetMouseMove}
            onMouseUp={onSheetMouseUp}
            onMouseLeave={onSheetMouseUp}
            className="animate-sheet-up fixed inset-x-2.5 bottom-2.5 z-50 max-h-[78vh] overflow-auto rounded-[28px] border border-line bg-cream px-4 pt-2.5 pb-5 shadow-[0_18px_50px_rgba(30,58,43,0.28)] max-[900px]:block"
          >
            <div style={{ touchAction: "none" }}>
              <div
                className="mx-auto mb-3 h-[6px] w-14 rounded-full bg-[#d9cdb9]"
                aria-hidden="true"
              />
              <div className="flex items-center justify-between">
                <h3 className="m-0 font-display text-[1.3rem]">Filters</h3>
                <button
                  type="button"
                  onClick={dismissSheet}
                  aria-label="Close filters"
                  className="grid h-10 w-10 place-items-center rounded-full border border-line bg-paper text-forest"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="sheet-fields mt-3.5 mb-5 grid gap-4 [overscroll-behavior:contain]">
              {filterFields("sheet")}
            </div>
            <button
              type="button"
              onClick={dismissSheet}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-forest font-semibold text-white"
            >
              Show {loading ? "…" : `${total} ${total === 1 ? "pet" : "pets"}`}
            </button>
          </div>
        </div>
      )}

      <div className="scroll-mt-24 mt-14 mb-6 flex items-baseline justify-between gap-3">
        <h2 className="section-title m-0">Meet the pets</h2>
        <p className="section-count m-0">
          {loading ? "Looking…" : `${total} ${total === 1 ? "pet" : "pets"} found`}
        </p>
      </div>

      {loading ? (
        <p className="py-18 text-center text-muted">Fetching pets…</p>
      ) : pets.length === 0 ? (
        <div className="py-18 text-center">
          <h2 className="section-title">No pets match that search</h2>
          <p className="mt-2 text-muted">Try a different name or clear the filters.</p>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="mt-4 inline-flex min-h-10 items-center rounded-full border-[1.5px] border-line bg-paper px-5 text-sm font-semibold text-forest"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6 max-[1100px]:grid-cols-3 max-[860px]:grid-cols-2 max-[560px]:grid-cols-1">
          {pets.map((p) => (
            <PetCard key={p._id} pet={p} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-16 mb-4 flex flex-wrap items-center justify-center gap-3.5">
          <button
            onClick={() => load(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            className="inline-flex min-h-10 items-center gap-1 rounded-full border-[1.5px] border-line bg-paper px-4 text-sm font-semibold text-forest transition-colors hover:border-forest disabled:pointer-events-none disabled:opacity-40"
          >
            <ArrowLeft size={16} /> Prev
          </button>
          <div className="flex gap-1.5">
            {pageNumbers().map((n) => (
              <button
                key={n}
                onClick={() => load(n)}
                aria-label={`Page ${n}`}
                aria-current={n === page ? "page" : undefined}
                className={`tnum h-10 min-w-10 rounded-full px-2 text-sm font-semibold transition-colors ${
                  n === page
                    ? "bg-forest text-white"
                    : "text-muted hover:border-[1.5px] hover:border-line hover:text-forest"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            onClick={() => load(page + 1)}
            disabled={page >= pages}
            aria-label="Next page"
            className="inline-flex min-h-10 items-center gap-1 rounded-full border-[1.5px] border-line bg-paper px-4 text-sm font-semibold text-forest transition-colors hover:border-forest disabled:pointer-events-none disabled:opacity-40"
          >
            Next <ArrowRight size={16} />
          </button>
        </div>
      )}

      <section
        aria-label="How adoption works"
        className="mt-18 grid grid-cols-3 gap-5 max-[900px]:grid-cols-1"
      >
        {steps.map((s, i) => (
          <Magnetic key={s.title}>
            <a
              href="#pets"
              onClick={(e) => {
                e.preventDefault();
                scrollToPets();
              }}
              className={`flex h-full gap-4.5 rounded-panel ${s.tint} p-7 pb-7.5 transition-shadow duration-200 hover:shadow-card-hover`}
            >
              <span className="relative grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full bg-white shadow-[0_8px_22px_rgba(30,58,43,0.12)]">
                <s.Icon size={28} className={s.color} aria-hidden="true" />
                <span className="tnum absolute -right-1 -bottom-1 grid h-[26px] w-[26px] place-items-center rounded-full border-[2.5px] border-white bg-forest text-[0.78rem] font-bold text-white">
                  {i + 1}
                </span>
              </span>
              <div>
                <h3 className="mt-4 mb-2.5 font-display text-[1.45rem] font-semibold tracking-[-0.015em]">
                  {s.title}
                </h3>
                <p className="m-0 max-w-[32ch] text-[0.98rem] leading-[1.7] text-[#4c554f]">
                  {s.body}
                </p>
              </div>
            </a>
          </Magnetic>
        ))}
      </section>

      <p className="mt-12 mb-0 text-center text-[0.95rem] text-muted">
        Ready to meet them?{" "}
        <Link to="/register" className="font-semibold text-forest underline decoration-line underline-offset-4 transition-colors hover:decoration-forest">
          Create a free account
        </Link>{" "}
        and apply in about a minute.
      </p>
    </div>
  );

  // Shared fields for the desktop popover and the mobile sheet.
  function filterFields(suffix) {
    return (
      <>
        <Select
          label="Breed"
          bare
          value={breed}
          placeholder="All breeds"
          options={[
            { value: "", label: "All breeds" },
            ...breedOptions.map((b) => ({ value: b, label: b })),
          ]}
          onPick={(v) => {
            setBreed(v);
            load(1, { breed: v }, true);
          }}
        />
        <Select
          label="Age"
          bare
          value={maxAge}
          placeholder="Any age"
          options={[
            { value: "", label: "Any age" },
            { value: "1", label: "Under 1 year" },
            { value: "3", label: "Under 3 years" },
            { value: "7", label: "Under 7 years" },
          ]}
          onPick={(v) => {
            setMaxAge(v);
            load(1, { maxAge: v }, true);
          }}
        />
        <div className="grid gap-1.5">
          <div
            id={`status-label-${suffix}`}
            className="flex gap-0.5 rounded-xl border-[1.5px] border-line bg-paper p-1"
            role="group"
            aria-labelledby={`status-label-${suffix}`}
          >
            {[
              ["", "All"],
              ["available", "Available"],
              ["pending", "Pending"],
              ["adopted", "Adopted"],
            ].map(([value, label]) => (
              <button
                key={label}
                type="button"
                aria-pressed={status === value}
                onClick={() => {
                  setStatus(value);
                  load(1, { status: value }, true);
                }}
                className={`min-h-9 flex-1 rounded-lg px-2 text-[0.8rem] font-semibold whitespace-nowrap transition-colors duration-150 ${
                  status === value ? "bg-forest text-white" : "text-muted hover:text-forest"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {suffix === "bar" && hasFilters && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 text-[0.88rem] font-semibold text-muted transition-colors hover:text-forest"
          >
            <X size={14} aria-hidden="true" /> Clear all
          </button>
        )}
      </>
    );
  }
}

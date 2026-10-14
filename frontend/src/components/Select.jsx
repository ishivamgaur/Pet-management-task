import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "reicon-react";

// Dropdown that looks the same in every browser.
// options: [{ value, label }]. Closes on outside click or Escape.
export default function Select({ label, value, options, placeholder, onPick, bare }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const picked = options.find((o) => o.value === value);

  useEffect(() => {
    function outside(e) {
      if (box.current && !box.current.contains(e.target)) setOpen(false);
    }
    function esc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  return (
    <div ref={box} className="relative grid gap-1.5">
      {!bare && <span className="text-[0.78rem] font-semibold text-muted">{label}</span>}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={[
          "flex w-full items-center justify-between gap-3 rounded-xl border-[1.5px] bg-paper",
          "min-h-12 px-4 font-sans text-[0.95rem] text-ink transition-colors duration-150",
          "hover:border-moss cursor-pointer",
          open ? "border-moss shadow-[0_0_0_3px_rgba(45,90,61,0.13)]" : "border-line",
        ].join(" ")}
      >
        <span className="truncate">{picked ? picked.label : placeholder}</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`shrink-0 text-muted transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 m-0 max-h-64 list-none overflow-auto rounded-[14px] border border-line bg-paper p-1.5 shadow-panel [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {options.map((o) => (
            <li key={o.label} role="option" aria-selected={o.value === value}>
              <button
                type="button"
                onClick={() => {
                  onPick(o.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-[9px] px-3 py-2.5 text-left font-sans text-[0.92rem] transition-colors ${
                  o.value === value ? "font-bold text-forest" : "text-ink hover:bg-cream"
                }`}
              >
                <span className="truncate">{o.label}</span>
                {o.value === value && (
                  <Check size={15} aria-hidden="true" className="shrink-0 text-moss" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

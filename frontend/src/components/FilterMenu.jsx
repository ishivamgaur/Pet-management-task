import { useEffect, useRef, useState } from "react";
import { Filter, X } from "reicon-react";

// One compact trigger that reveals the secondary filters in a
// floating panel. Hidden on phones, where the bottom sheet is used.
export default function FilterMenu({ activeCount, children }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);

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
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`inline-flex min-h-[42px] items-center gap-2 rounded-full border-[1.5px] bg-paper px-4 font-sans text-[0.9rem] font-semibold transition-colors duration-150 hover:bg-cream hover:border-forest ${
          open ? "border-moss bg-cream text-forest" : "border-line text-forest"
        }`}
      >
        <Filter size={18} aria-hidden="true" />
        More filters
        {activeCount > 0 && (
          <span className="tnum grid h-[22px] min-w-[22px] place-items-center rounded-full bg-forest px-1 text-[0.75rem] font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="More filters"
          className="animate-pop-in absolute top-[calc(100%+10px)] right-0 z-60 grid w-[300px] max-w-[calc(100vw-3rem)] gap-3 rounded-[18px] border border-line bg-paper p-4 shadow-panel"
        >
          <div className="flex items-center justify-between">
            <strong className="font-display">More filters</strong>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close filters"
              className="grid h-[34px] w-[34px] place-items-center rounded-full border border-line text-forest transition-colors hover:bg-cream"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          {children}
        </div>
      )}
    </div>
  );
}

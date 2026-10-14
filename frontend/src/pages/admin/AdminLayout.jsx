import { NavLink } from "react-router-dom";

// Shared frame for the shelter desk. Two routes, one tab bar.
export default function AdminLayout({ title, subtitle, tabs, children }) {
  return (
    <div className="page-shell max-w-[1100px]">
      <h1 className="page-title-lg mb-2">{title}</h1>
      <p className="mb-7 text-[0.95rem] text-muted">{subtitle}</p>

      <nav aria-label="Shelter sections" className="mb-9 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              [
                "inline-flex min-h-11 items-center gap-2 rounded-[14px] px-4",
                "font-sans text-[0.9rem] font-semibold transition-colors duration-150",
                isActive
                  ? "bg-forest text-white"
                  : "bg-paper text-forest ring-1 ring-line hover:bg-cream",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                {t.label}
                <span
                  className={`tnum rounded-[9px] px-1.5 py-0.5 text-[0.75rem] font-bold ${
                    isActive ? "bg-white/25 text-white" : "bg-cream text-muted"
                  }`}
                >
                  {t.count}
                  {t.suffix}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {children}
    </div>
  );
}

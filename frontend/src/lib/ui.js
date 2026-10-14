// Shared UI atoms so button styling lives in one place.

export function btnClass({ variant = "primary", size = "md", className = "" } = {}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap " +
    "transition-[transform,background-color,border-color,box-shadow] duration-150 " +
    "active:scale-[0.96] disabled:opacity-45 disabled:pointer-events-none disabled:active:scale-100";

  const sizes = {
    sm: "min-h-10 px-4.5 text-[0.85rem]",
    md: "min-h-11 px-6 text-[0.95rem]",
  };

  const variants = {
    primary:
      "bg-forest text-white border-[1.5px] border-forest shadow-[0_1px_2px_rgba(20,40,28,0.18)] " +
      "hover:bg-moss hover:border-moss hover:shadow-[0_4px_14px_rgba(30,58,43,0.24)] " +
      "active:shadow-[0_1px_2px_rgba(20,40,28,0.18)]",
    light:
      "bg-honey text-forest border-[1.5px] border-honey shadow-[0_1px_2px_rgba(20,40,28,0.18)] " +
      "hover:bg-[#f0b866] hover:border-[#f0b866] hover:shadow-[0_4px_14px_rgba(232,168,76,0.4)]",
    ghost:
      "bg-paper text-forest border-[1.5px] border-line " + "hover:bg-cream hover:border-forest",
    danger:
      "bg-[#b3352b] text-white border-[1.5px] border-[#b3352b] " +
      "hover:bg-[#93291f] hover:border-[#93291f] hover:shadow-[0_4px_14px_rgba(179,53,43,0.28)]",
  };

  return `${base} ${sizes[size]} ${variants[variant]} ${className}`;
}

export function statusTone(status) {
  if (status === "approved") return "bg-mint text-forest";
  if (status === "rejected") return "bg-blush text-[#8a2318]";
  if (status === "pending") return "bg-[#fbe7bd] text-[#7a4d0d]";
  return "bg-[#e4e4e4] text-[#555]";
}

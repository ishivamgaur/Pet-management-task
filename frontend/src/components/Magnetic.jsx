import { useRef } from "react";
import { prefersCalm } from "../utils/motion";

// Very small magnetic pull toward the cursor on hover.
// Skipped for touch devices and reduced-motion users.
const PULL = 10; // full swing in px, so max 5px each way

export default function Magnetic({ children }) {
  const ref = useRef(null);

  function onMove(e) {
    const el = ref.current;
    if (!el || prefersCalm()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `translate(${(x * PULL).toFixed(1)}px, ${(y * PULL).toFixed(1)}px)`;
  }

  function onLeave() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="transition-transform duration-200 ease-out-soft"
    >
      {children}
    </div>
  );
}

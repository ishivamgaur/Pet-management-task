// True when the user asked for less motion.
// Animations and smooth scrolling check this first.
export function prefersCalm() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

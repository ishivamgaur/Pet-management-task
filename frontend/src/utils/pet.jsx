import { Male, Female, Paw } from "reicon-react";

// Turns a stored age into words. "0.4" becomes "5 mo", "2" becomes "2 yr".
export function ageLabel(age) {
  if (age < 1) return `${Math.max(1, Math.round(age * 12))} mo`;
  return `${age} yr`;
}

export function genderIcon(gender) {
  if (gender === "male") return <Male size={14} aria-hidden="true" />;
  if (gender === "female") return <Female size={14} aria-hidden="true" />;
  return <Paw size={14} aria-hidden="true" />;
}

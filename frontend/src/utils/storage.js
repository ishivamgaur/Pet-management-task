// Safe JSON helpers for localStorage. Never throws,
// returns the fallback when the key is missing or broken.
export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

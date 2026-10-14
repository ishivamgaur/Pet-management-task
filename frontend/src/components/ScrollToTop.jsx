import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Browsers keep scroll position when the route changes, so a new page can
// land halfway down. This resets to the top on every navigation, except
// when the URL carries a hash we want to honour.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  return null;
}

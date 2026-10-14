import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Paw, Logout, Menu, X } from "reicon-react";
import { useAuth } from "../context/AuthContext";
import { btnClass } from "../lib/ui";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  // Visible at the top, hides when scrolling down,
  // and slides back in from the top when scrolling up.
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      const delta = y - lastY.current;

      // ignore tiny movements so a trackpad twitch never toggles it
      if (Math.abs(delta) < 4) return;

      if (y < 72) setHidden(false);
      else setHidden(delta > 0);

      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate("/");
  }

  const links = (
    <>
      <Link className="font-medium hover:text-moss" to="/">
        Browse
      </Link>
      {user && user.role !== "admin" && (
        <Link className="font-medium hover:text-moss" to="/dashboard">
          My applications
        </Link>
      )}
      {user?.role === "admin" && (
        <Link className="font-medium hover:text-moss" to="/admin">
          Shelter desk
        </Link>
      )}
      {!user && (
        <Link className="font-medium hover:text-moss" to="/login">
          Log in
        </Link>
      )}
      {!user && (
        <Link to="/register" className={btnClass({ size: "sm", className: "hover:text-white" })}>
          Join free
        </Link>
      )}
      {user && (
        <button
          type="button"
          onClick={handleLogout}
          className={btnClass({ variant: "ghost", size: "sm" })}
        >
          <Logout size={16} /> Log out ({user.name.split(" ")[0]})
        </button>
      )}
    </>
  );

  // Same destinations, as full width rows inside the mobile panel.
  const row = "rounded-[14px] px-3.5 py-3 font-semibold transition-colors hover:bg-cream";

  const mobileLinks = (
    <>
      <Link className={row} to="/" onClick={closeMenu}>
        Browse
      </Link>
      {user && user.role !== "admin" && (
        <Link className={row} to="/dashboard" onClick={closeMenu}>
          My applications
        </Link>
      )}
      {user?.role === "admin" && (
        <Link className={row} to="/admin" onClick={closeMenu}>
          Shelter desk
        </Link>
      )}
      {!user && (
        <Link className={row} to="/login" onClick={closeMenu}>
          Log in
        </Link>
      )}
      {!user && (
        <Link
          to="/register"
          onClick={closeMenu}
          className={btnClass({ size: "sm", className: "mt-1 w-full hover:text-white" })}
        >
          Join free
        </Link>
      )}
      {user && (
        <button
          type="button"
          onClick={handleLogout}
          className={btnClass({
            variant: "ghost",
            size: "sm",
            className: "mt-1 w-full justify-center",
          })}
        >
          <Logout size={16} /> Log out ({user.name.split(" ")[0]})
        </button>
      )}
    </>
  );

  return (
    <header
      className={`sticky top-0 z-30 flex min-h-16 items-center justify-between gap-4 border-b border-line bg-cream/92 px-6 backdrop-blur-md max-[860px]:fixed max-[860px]:inset-x-3 max-[860px]:top-2.5 max-[860px]:min-h-14 max-[860px]:gap-2 max-[860px]:rounded-full max-[860px]:border max-[860px]:border-line max-[860px]:bg-cream/95 max-[860px]:p-1.5 max-[860px]:pr-1.5 max-[860px]:pl-4 max-[860px]:shadow-[0_10px_28px_rgba(30,58,43,0.14)] ${
        hidden ? "nav-hidden" : "nav-shown"
      }`}
    >
      <Link
        to="/"
        className="flex items-center gap-2 font-display text-[1.4rem] font-semibold whitespace-nowrap text-forest max-[860px]:text-[1.2rem]"
      >
        <Paw size={26} weight="Filled" className="max-[860px]:h-[22px] max-[860px]:w-[22px]" />
        PawHome
      </Link>

      <nav aria-label="Main" className="flex flex-wrap items-center gap-5 max-[860px]:hidden">
        {links}
      </nav>

      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        className="hidden h-11 w-11 shrink-0 place-items-center rounded-full border-[1.5px] border-forest bg-forest text-white transition-colors duration-150 hover:bg-moss active:scale-96 max-[860px]:grid"
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {menuOpen && (
        <nav
          aria-label="Mobile"
          className="animate-pop-in absolute inset-x-0 top-[calc(100%+10px)] grid gap-1 rounded-[26px] border border-line bg-paper p-2 shadow-panel max-[860px]:grid"
        >
          {mobileLinks}
        </nav>
      )}
    </header>
  );
}

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Paw } from "reicon-react";
import { Toaster, toast } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Protected from "./components/Protected";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import PetDetails from "./pages/PetDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/admin/PetsAdmin";
import ApplicationsAdmin from "./pages/admin/ApplicationsAdmin";

// Lives inside AuthProvider so it can hide links that do not
// apply to the current role.
function Footer() {
  const admin = useAuth().user?.role === "admin";

  const columns = [
    {
      title: "Explore",
      items: [
        ["Browse pets", "/"],
        // A personal dashboard means nothing to a shelter admin.
        ...(admin ? [] : [["My applications", "/dashboard"]]),
        ["Join free", "/register"],
      ],
    },
    {
      title: "Shelter",
      // The shelter desk is staff-only, so it stays out of the visitor footer.
      items: admin ? [["Shelter desk", "/admin"], ["Log in", "/login"]] : [["Log in", "/login"]],
    },
  ];

  return (
    <footer className="mt-16 border-t border-line bg-paper">
      <div className="mx-auto grid max-w-[1280px] grid-cols-[1.4fr_1fr_1fr] gap-12 px-6 pt-14 pb-10 max-[900px]:grid-cols-2 max-[900px]:gap-10 max-[560px]:grid-cols-1 max-[560px]:pt-10">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 font-display text-[1.5rem] font-semibold tracking-[-0.02em] text-forest max-[560px]:text-[1.35rem]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-forest text-honey">
              <Paw size={22} weight="Filled" aria-hidden="true" />
            </span>
            PawHome
          </Link>
          <p className="mt-4 mb-0 max-w-[34ch] text-pretty leading-[1.7] text-[0.95rem] text-muted">
            A small shelter with big hearts. Every pet is vaccinated, health checked, and ready to
            meet you.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-[0.82rem] font-bold tracking-[0.06em] text-forest uppercase">
              {col.title}
            </h4>
            <ul className="m-0 grid list-none gap-3 p-0">
              {col.items.map(([label, to]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-[0.95rem] text-muted transition-colors hover:text-forest"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-6 text-[0.82rem] text-muted max-[560px]:flex-col max-[560px]:gap-1">
        <p className="m-0">Built with love for shelter pets</p>
        <p className="m-0">Vaccinated · Vet checked · Ready to adopt</p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pets/:id" element={<PetDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <Protected userOnly>
                  <Dashboard />
                </Protected>
              }
            />
            <Route
              path="/admin"
              element={
                <Protected adminOnly>
                  <Admin />
                </Protected>
              }
            />
            <Route
              path="/admin/applications"
              element={
                <Protected adminOnly>
                  <ApplicationsAdmin />
                </Protected>
              }
            />
          </Routes>
        </main>

        <Footer />
      </BrowserRouter>

      <Toaster
        position="bottom-center"
        toastOptions={{
          classNames: {
            toast:
              "!rounded-full !border-forest !bg-forest !text-white !font-sans !shadow-[0_14px_34px_rgba(30,58,43,0.32)]",
            description: "!text-white/80",
          },
        }}
      />
    </AuthProvider>
  );
}

export { toast };

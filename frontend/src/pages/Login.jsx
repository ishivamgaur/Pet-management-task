import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Paw } from "reicon-react";
import { toast } from "sonner";
import { authApi } from "../api";
import { useAuth } from "../context/AuthContext";
import { btnClass } from "../lib/ui";
import { TextField } from "../components/FormField";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { saveLogin } = useAuth();
  const navigate = useNavigate();

  function fillDemo() {
    setEmail("admin@shelter.com");
    setPassword("admin123");
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await authApi.login({ email, password });
      saveLogin(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name.split(" ")[0]}`);
      navigate(res.data.user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      toast.error(message);
    }
  }

  return (
    <div className="page-shell grid min-h-[68vh] max-w-[460px] place-items-center pb-6">
      <div className="animate-drop-in w-full">
        <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-forest text-honey">
          <Paw size={22} weight="Filled" aria-hidden="true" />
        </span>

        <h1 className="mb-2 font-display text-[1.75rem] tracking-[-0.02em]">Welcome back</h1>
        <p className="mb-7 text-[0.98rem] text-muted">Log in to apply or manage the shelter.</p>

        <div className="-mt-3.5 mb-6 flex items-center gap-2.5 rounded-xl bg-cream px-3.5 py-2.5 text-[0.82rem] text-muted">
          <span className="font-bold tracking-[0.05em] uppercase">Demo admin</span>
          <button
            onClick={fillDemo}
            className="border-0 border-b border-line bg-transparent p-0 font-sans text-[0.82rem] font-semibold text-forest transition-colors hover:border-forest"
          >
            admin@shelter.com
          </button>
        </div>

        <form onSubmit={submit} className="grid gap-4.5">
          <TextField
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
          />
          <TextField
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            required
          />

          {error && (
            <p className="-mt-1 mb-0 rounded-[10px] bg-[#fbe3e0] px-3.5 py-2.5 text-[0.9rem] text-[#a02a20]">
              {error}
            </p>
          )}

          <button type="submit" className={btnClass({ className: "mt-1.5 w-full" })}>
            Log in
          </button>
        </form>

        <p className="mt-6 mb-0 text-center text-[0.92rem] text-muted">
          New here?{" "}
          <Link
            to="/register"
            className="border-b-[1.5px] border-line font-semibold text-forest transition-colors hover:border-forest"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

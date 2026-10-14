import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Paw } from "reicon-react";
import { toast } from "sonner";
import { authApi } from "../api";
import { useAuth } from "../context/AuthContext";
import { btnClass } from "../lib/ui";
import { TextField } from "../components/FormField";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { saveLogin } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await authApi.register({ name, email, password });
      saveLogin(res.data.token, res.data.user);
      toast.success(`Account created. Welcome, ${res.data.user.name.split(" ")[0]}`);
      navigate("/");
    } catch (err) {
      const message = err.response?.data?.message || "Could not register";
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

        <h1 className="mb-2 font-display text-[1.75rem] tracking-[-0.02em]">Adopt in minutes</h1>
        <p className="mb-7 text-[0.98rem] text-muted">One account to apply for any pet.</p>

        <form onSubmit={submit} className="grid gap-4.5">
          <TextField
            label="Your name"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Asha"
            required
          />
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
            placeholder="At least 6 characters"
            minLength={6}
            required
          />

          {error && (
            <p className="-mt-1 mb-0 rounded-[10px] bg-[#fbe3e0] px-3.5 py-2.5 text-[0.9rem] text-[#a02a20]">
              {error}
            </p>
          )}

          <button type="submit" className={btnClass({ className: "mt-1.5 w-full" })}>
            Create account
          </button>
        </form>

        <p className="mt-6 mb-0 text-center text-[0.92rem] text-muted">
          Already have one?{" "}
          <Link
            to="/login"
            className="border-b-[1.5px] border-line font-semibold text-forest transition-colors hover:border-forest"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

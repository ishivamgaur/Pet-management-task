import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Protected({ children, adminOnly, userOnly }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="page-shell max-w-[1080px]">Loading…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;
  // Admins manage pets from the shelter desk, not from a personal dashboard.
  if (userOnly && user.role === "admin") return <Navigate to="/admin" replace />;
  return children;
}

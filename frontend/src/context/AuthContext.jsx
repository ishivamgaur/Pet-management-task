import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  function saveLogin(token, userData) {
    localStorage.setItem("token", token);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, saveLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

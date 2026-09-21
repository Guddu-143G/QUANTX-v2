import { createContext, useCallback, useContext, useEffect, useState } from "react";

type User = { id: number; email: string; full_name: string; created_at: string };
type AuthContext = { user: User | null; loading: boolean; refresh: () => Promise<void>; signOut: () => Promise<void> };
const AuthCtx = createContext<AuthContext>({ user: null, loading: true, refresh: async () => {}, signOut: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("quantx_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const token = localStorage.getItem("quantx_token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const r = await fetch("/api/v1/auth/me", { credentials: "include", headers });
      if (r.ok) {
        const data = await r.json();
        if (data.user) {
          setUser(data.user);
          try {
            localStorage.setItem("quantx_user", JSON.stringify(data.user));
          } catch {}
        }
      } else {
        const saved = localStorage.getItem("quantx_user");
        if (saved) {
          try {
            setUser(JSON.parse(saved));
          } catch {}
        }
      }
    } catch {
      const saved = localStorage.getItem("quantx_user");
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    try {
      const token = localStorage.getItem("quantx_token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      await fetch("/api/v1/auth/logout", { method: "POST", credentials: "include", headers });
    } catch {}
    try {
      localStorage.removeItem("quantx_user");
      localStorage.removeItem("quantx_token");
    } catch {}
    setUser(null);
    window.location.hash = "/signin";
  }, []);

  return <AuthCtx.Provider value={{ user, loading, refresh, signOut }}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);

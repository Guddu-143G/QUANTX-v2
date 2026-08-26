import { createContext, useCallback, useContext, useEffect, useState } from "react";

type User = { id: number; email: string; full_name: string; created_at: string };
type AuthContext = { user: User | null; loading: boolean; refresh: () => Promise<void>; signOut: () => Promise<void> };
const AuthCtx = createContext<AuthContext>({ user: null, loading: true, refresh: async () => {}, signOut: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => { try { const r = await fetch("/api/v1/auth/me", { credentials: "include" }); setUser(r.ok ? (await r.json()).user : null); } finally { setLoading(false); } }, []);
  useEffect(() => { refresh(); }, [refresh]);
  const signOut = useCallback(async () => { await fetch("/api/v1/auth/logout", { method: "POST", credentials: "include" }); setUser(null); window.location.hash = "/signin"; }, []);
  return <AuthCtx.Provider value={{ user, loading, refresh, signOut }}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);

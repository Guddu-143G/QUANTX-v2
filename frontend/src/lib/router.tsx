import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Ctx = { path: string; navigate: (to: string) => void };
const RouterCtx = createContext<Ctx>({ path: "/", navigate: () => {} });

const read = () => {
  const h = window.location.hash.replace(/^#/, "");
  return h || "/";
};

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [path, setPath] = useState(read);

  useEffect(() => {
    const on = () => {
      setPath(read());
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  const navigate = useCallback((to: string) => {
    if (read() === to) return;
    window.location.hash = to;
  }, []);

  const value = useMemo(() => ({ path, navigate }), [path, navigate]);
  return <RouterCtx.Provider value={value}>{children}</RouterCtx.Provider>;
}

export const useRouter = () => useContext(RouterCtx);

export function Link({
  to,
  children,
  className,
  ...rest
}: { to: string; children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLAnchorElement>) {
  const { navigate } = useRouter();
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

/** Matches "/assets/RELIANCE" → { base: "/assets", param: "RELIANCE" } */
export function splitRoute(path: string) {
  const clean = path.split("?")[0];
  const seg = clean.split("/").filter(Boolean);
  return { seg, clean };
}

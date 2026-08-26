import { useEffect, useState, type ReactNode } from "react";
import {
  Bell, ChevronsLeft, ChevronsRight, Command, FlaskConical, LineChart, PanelLeft, Search,
  Settings, ShieldAlert, Sparkles, Wallet, X,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { Badge, IconButton, StatusIndicator, Tooltip, useToast } from "../ui";
import { IndexPill } from "../finance";
import { Link, useRouter } from "../../lib/router";
import { NAV_GROUPS, ROUTE_TITLES } from "../../constants/nav";
import { INDICES } from "../../data/market";
import { ALERTS } from "../../data/quant";
import { CommandPalette } from "./CommandPalette";
import { timeIST } from "../../lib/format";
import { useAuth } from "../../lib/auth";
import { CONFIG } from "../../config";

/* ══════════════════════════════ LOGO ══════════════════════════════ */

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border border-acc/25 bg-acc/8">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M2 12.5 L5 7.5 L8 9.5 L11 3.5 L14 6" stroke="#3DDC97" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="11" cy="3.5" r="1.4" fill="#3DDC97" />
          <path d="M2 14.2 H14" stroke="#202B36" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block text-[14px] font-bold leading-none tracking-[0.14em] text-txt-primary">QUANTX</span>
          <span className="mt-1 block text-[8.5px] leading-none tracking-[0.16em] text-txt-disabled uppercase">Quant Intelligence</span>
        </span>
      )}
    </span>
  );
}

/* ══════════════════════════════ SIDEBAR ══════════════════════════════ */

function Sidebar({ collapsed, setCollapsed, onCloseMobile, mobileOpen }: {
  collapsed: boolean; setCollapsed: (v: boolean) => void; onCloseMobile: () => void; mobileOpen: boolean;
}) {
  const { path } = useRouter();
  const { user } = useAuth();
  const initials = (user?.full_name ?? "User").split(/\s+/).map((name) => name[0]).slice(0, 2).join("").toUpperCase();
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-[60] bg-black/70 lg:hidden" onClick={onCloseMobile} />}
      <aside
        aria-label="Primary navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-[65] flex flex-col border-r border-line-subtle bg-bg-secondary transition-[width,transform] duration-250 ease-out",
          collapsed ? "w-[72px]" : "w-[248px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className={cn("flex h-14 shrink-0 items-center border-b border-line-subtle", collapsed ? "justify-center px-2" : "justify-between px-4")}>
          <Link to="/dashboard" aria-label="QUANTX home"><Logo compact={collapsed} /></Link>
          {!collapsed && <IconButton label="Close navigation" icon={X} className="lg:hidden" onClick={onCloseMobile} />}
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 no-scrollbar">
          {NAV_GROUPS.map((g) => (
            <div key={g.title} className="mb-4">
              {!collapsed && <div className="mb-1.5 px-4 label-xs text-txt-disabled">{g.title}</div>}
              {collapsed && <div className="mx-auto mb-2 h-px w-6 bg-line-subtle" />}
              <ul className="space-y-px px-2">
                {g.items.map((it) => {
                  const active = path === it.to || (it.to !== "/dashboard" && path.startsWith(it.to + "/"));
                  const content = (
                    <Link
                      to={it.to}
                      onClick={onCloseMobile}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-[6px] transition-all duration-150",
                        collapsed ? "h-9 justify-center px-0" : "h-8 px-2.5",
                        active ? "bg-surface-selected text-txt-primary" : "text-txt-secondary hover:bg-surface-hover hover:text-txt-primary",
                      )}
                    >
                      {active && <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-acc" />}
                      <it.icon size={15} strokeWidth={1.55} className={cn("shrink-0 transition-colors", active ? "text-acc" : "text-txt-muted group-hover:text-txt-secondary")} />
                      {!collapsed && <span className="flex-1 truncate text-[12.5px]">{it.label}</span>}
                      {!collapsed && it.badge && (
                        <span className={cn(
                          "shrink-0 rounded-[3px] border px-1 py-px text-[9px] font-medium leading-none tracking-wider",
                          it.tone === "neg" ? "border-neg/30 bg-neg/10 text-neg" : it.tone === "warn" ? "border-warn/30 bg-warn/10 text-warn" : "border-acc/30 bg-acc/10 text-acc",
                        )}>{it.badge}</span>
                      )}
                      {collapsed && it.badge && (
                        <span className={cn("absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full", it.tone === "neg" ? "bg-neg" : it.tone === "warn" ? "bg-warn" : "bg-acc")} />
                      )}
                    </Link>
                  );
                  return (
                    <li key={it.to}>
                      {collapsed ? <Tooltip content={it.label} side="right">{content}</Tooltip> : content}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-line-subtle p-2">
          <div className={cn("mb-2 flex flex-col gap-1.5 rounded-[6px] border border-line-subtle bg-bg-primary/50", collapsed ? "p-1.5 items-center" : "px-2.5 py-2")}>
            {collapsed ? (
              <Tooltip content={`Environment: ${CONFIG.DATA_MODE}`} side="right">
                <span className={cn("block h-1.5 w-1.5 rounded-full anim-pulse-dot", CONFIG.DATA_MODE === "LIVE" ? "bg-pos" : CONFIG.DATA_MODE === "PAPER" ? "bg-warn" : "bg-acc")} />
              </Tooltip>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full anim-pulse-dot", CONFIG.DATA_MODE === "LIVE" ? "bg-pos" : CONFIG.DATA_MODE === "PAPER" ? "bg-warn" : "bg-acc")} />
                  <span className={cn("label-xs uppercase", CONFIG.DATA_MODE === "LIVE" ? "text-pos" : CONFIG.DATA_MODE === "PAPER" ? "text-warn" : "text-acc")}>{CONFIG.DATA_MODE} TRADING</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9.5px] font-medium uppercase tracking-wider text-txt-disabled">{CONFIG.DATA_MODE} MARKET DATA</span>
                  <span className="text-[9.5px] font-medium uppercase tracking-wider text-txt-disabled">{CONFIG.EXECUTION_MODE} EXECUTION</span>
                </div>
              </>
            )}
          </div>

          <div onClick={() => { window.location.hash = "/profile"; }} className={cn("flex cursor-pointer items-center gap-2.5 rounded-[6px] p-1.5 transition-colors hover:bg-surface-hover", collapsed && "justify-center")}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-surface-high text-[10px] font-semibold text-txt-secondary">{initials}</span>
            {!collapsed && (
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11.5px] text-txt-primary">{user?.full_name ?? "User"}</span>
                <span className="block truncate text-[9.5px] text-txt-muted">Portfolio Manager · Desk 04</span>
              </span>
            )}
            {!collapsed && <IconButton label="Settings" icon={Settings} size={13} className="h-6 w-6" onClick={(e) => { e.stopPropagation(); window.location.hash = "/settings"; }} />}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn("mt-1 hidden w-full items-center gap-2 rounded-[6px] px-2.5 py-1.5 text-[11px] text-txt-muted transition-colors hover:bg-surface-hover hover:text-txt-secondary lg:flex", collapsed && "justify-center px-0")}
          >
            {collapsed ? <ChevronsRight size={13} /> : <><ChevronsLeft size={13} /> Collapse</>}
          </button>
        </div>
      </aside>
    </>
  );
}

/* ══════════════════════════ MARKET STATUS STRIP ══════════════════════════ */

function MarketStrip() {
  const [now, setNow] = useState(timeIST());
  useEffect(() => {
    const t = setInterval(() => setNow(timeIST()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex h-10 items-center border-b border-line-subtle bg-bg-primary/80">
      <div className="flex shrink-0 items-center gap-2 border-r border-line-subtle px-3.5">
        <StatusIndicator tone="pos" label="Market Open" />
        <span className="mono hidden text-[10px] text-txt-disabled sm:inline">{now} IST</span>
      </div>
      <div className="flex flex-1 items-center overflow-x-auto no-scrollbar">
        {INDICES.map((i) => <IndexPill key={i.key} idx={i} />)}
      </div>
      <div className="hidden shrink-0 items-center gap-2 border-l border-line-subtle px-3.5 xl:flex">
        <span className="label-xs text-txt-disabled">Breadth</span>
        <span className="mono text-[10.5px] text-pos">1284↑</span>
        <span className="mono text-[10.5px] text-neg">742↓</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════ TOPBAR ══════════════════════════════ */

function Topbar({ onMenu, onOpenPalette, crumbs }: { onMenu: () => void; onOpenPalette: () => void; crumbs: string[] }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const { navigate } = useRouter();
  const unread = ALERTS.filter((a) => !a.ack).length;
  const { user } = useAuth();
  const initials = (user?.full_name ?? "User").split(/\s+/).map((name) => name[0]).slice(0, 2).join("").toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-line-subtle bg-bg-primary/92 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-3 sm:px-4">
        <IconButton label="Open navigation" icon={PanelLeft} className="lg:hidden" onClick={onMenu} />

        <nav aria-label="Breadcrumb" className="hidden min-w-0 shrink items-center gap-1.5 md:flex">
          {crumbs.map((c, i) => (
            <span key={c} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-txt-disabled">/</span>}
              <span className={cn("truncate text-[11.5px]", i === crumbs.length - 1 ? "text-txt-primary" : "text-txt-muted")}>{c}</span>
            </span>
          ))}
        </nav>

        <button
          onClick={onOpenPalette}
          className="group mx-auto flex h-8 w-full max-w-[420px] items-center gap-2.5 rounded-[6px] border border-line-subtle bg-bg-secondary px-3 text-left transition-colors hover:border-line hover:bg-surface"
          aria-label="Open command palette"
        >
          <Search size={12.5} className="shrink-0 text-txt-muted" strokeWidth={1.7} />
          <span className="flex-1 truncate text-[11.5px] text-txt-disabled">Search assets, portfolios, signals, models…</span>
          <span className="hidden shrink-0 items-center gap-0.5 rounded-[3px] border border-line bg-bg-primary px-1 py-0.5 text-[9px] text-txt-muted sm:flex">
            <Command size={8} /> K
          </span>
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <div className="mr-1 hidden items-center gap-3 border-r border-line-subtle pr-3 xl:flex">
            {INDICES.slice(0, 3).map((i) => (
              <span key={i.key} className="flex items-baseline gap-1.5">
                <span className="label-xs text-txt-disabled">{i.name}</span>
                <span className={cn("mono text-[10.5px]", i.chgPct >= 0 ? "text-pos" : "text-neg")}>
                  {i.chgPct >= 0 ? "↑" : "↓"}{Math.abs(i.chgPct).toFixed(2)}%
                </span>
              </span>
            ))}
          </div>

          <div className="relative">
            <IconButton label={`Notifications (${unread} unread)`} icon={Bell} active={notifOpen} onClick={() => setNotifOpen((v) => !v)} />
            {unread > 0 && <span className="pointer-events-none absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-neg ring-2 ring-bg-primary" />}
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-10 z-50 w-[340px] overflow-hidden rounded-[8px] border border-line glass shadow-[0_30px_70px_-24px_rgba(0,0,0,0.95)] anim-scale-in">
                  <div className="flex items-center justify-between border-b border-line-subtle px-3 py-2">
                    <span className="label-sm text-txt-secondary">Alerts</span>
                    <Badge tone="neg">{unread} new</Badge>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    {ALERTS.slice(0, 5).map((a) => (
                      <button key={a.id} onClick={() => { navigate("/alerts"); setNotifOpen(false); }}
                        className="flex w-full gap-2.5 border-b border-line-subtle px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-surface-hover/60">
                        <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", a.severity === "CRITICAL" ? "bg-neg" : a.severity === "WARNING" ? "bg-warn" : "bg-acc2")} />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-[11.5px] font-medium text-txt-primary">{a.title}</span>
                            <span className="mono shrink-0 text-[9.5px] text-txt-disabled">{a.time}</span>
                          </span>
                          <span className="mt-0.5 line-clamp-2 block text-[10.5px] leading-relaxed text-txt-muted">{a.body}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => { navigate("/alerts"); setNotifOpen(false); }} className="w-full border-t border-line-subtle py-2 text-center label-xs text-txt-secondary transition-colors hover:bg-surface-hover hover:text-txt-primary">
                    View all alerts
                  </button>
                </div>
              </>
            )}
          </div>

          <Tooltip content="Quant Copilot">
            <Link to="/copilot" className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-acc/25 bg-acc/8 text-acc transition-colors hover:bg-acc/14" aria-label="Open Quant Copilot">
              <Sparkles size={14} strokeWidth={1.6} />
            </Link>
          </Tooltip>

          <Link to="/profile" className="ml-1 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface-high text-[10px] font-semibold text-txt-secondary" aria-label="Open profile">{initials}</Link>
        </div>
      </div>
    </header>
  );
}

/* ══════════════════════════ MOBILE BOTTOM NAV ══════════════════════════ */

const MOBILE_NAV = [
  { label: "Portfolio", to: "/portfolio", icon: Wallet },
  { label: "Risk", to: "/risk", icon: ShieldAlert },
  { label: "Alpha", to: "/research/alpha", icon: FlaskConical },
  { label: "Markets", to: "/markets", icon: LineChart },
  { label: "AI", to: "/copilot", icon: Sparkles },
];

function MobileNav() {
  const { path } = useRouter();
  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-[70] border-t border-line-subtle bg-bg-secondary/97 backdrop-blur-xl md:hidden">
      <ul className="grid grid-cols-5">
        {MOBILE_NAV.map((n) => {
          const active = path === n.to;
          return (
            <li key={n.label}>
              <Link to={n.to} className={cn("flex flex-col items-center gap-1 py-2.5 transition-colors", active ? "text-acc" : "text-txt-muted")}>
                <n.icon size={16} strokeWidth={1.6} />
                <span className="text-[9.5px] tracking-wide">{n.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ══════════════════════════════ SHELL ══════════════════════════════ */

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { path, navigate } = useRouter();
  const { push } = useToast();

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((v) => !v); }
      if (e.key === "/" && !(e.target as HTMLElement)?.closest("input,textarea")) { e.preventDefault(); setPaletteOpen(true); }
      if ((e.metaKey || e.ctrlKey) && e.key === "b") { e.preventDefault(); setCollapsed((v) => !v); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const crumbs = ROUTE_TITLES[path] ?? (path.startsWith("/assets/") ? ["Workspace", "Markets", path.split("/")[2]] : ["Workspace"]);

  const onAction = (a: string) => {
    if (a.startsWith("ask:")) { sessionStorage.setItem("qx-copilot-ask", a.slice(4)); navigate("/copilot"); return; }
    if (a === "toggle-env") { push({ title: "Environment locked", body: "Live trading requires desk-head approval (2FA).", tone: "warn" }); return; }
    if (a === "run-backtest") sessionStorage.setItem("qx-autorun", "1");
    if (a === "optimize") sessionStorage.setItem("qx-autoopt", "1");
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className={cn("transition-[padding] duration-250 ease-out", collapsed ? "lg:pl-[72px]" : "lg:pl-[248px]")}>
        <Topbar onMenu={() => setMobileOpen(true)} onOpenPalette={() => setPaletteOpen(true)} crumbs={crumbs} />
        <MarketStrip />
        <main className="relative min-h-[calc(100vh-6rem)] pb-20 md:pb-8">
          <div className="pointer-events-none fixed inset-0 grid-texture opacity-70" aria-hidden />
          <div className="relative mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-5 lg:px-6">{children}</div>
        </main>
      </div>
      <MobileNav />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onAction={onAction} />
    </div>
  );
}

/* Shared page header used by every route — one coherent product. */
export function PageHeader({ title, sub, actions, meta }: { title: string; sub?: string; actions?: ReactNode; meta?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-line-subtle pb-4">
      <div className="min-w-0">
        <h1 className="text-[19px] font-semibold leading-tight tracking-[-0.02em] text-txt-primary sm:text-[22px]">{title}</h1>
        {sub && <p className="mt-1 max-w-[70ch] text-[12px] leading-relaxed text-txt-secondary">{sub}</p>}
        {meta && <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-1.5">{actions}</div>}
    </div>
  );
}

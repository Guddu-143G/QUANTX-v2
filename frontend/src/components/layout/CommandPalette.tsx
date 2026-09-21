import { useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft, Search, TrendingUp } from "lucide-react";
import { cn } from "../../utils/cn";
import { Kbd } from "../ui";
import { COMMANDS } from "../../constants/nav";
import { ASSETS } from "../../data/market";
import { useRouter } from "../../lib/router";
import { num } from "../../lib/format";

export function CommandPalette({
  open, onClose, onAction,
}: { open: boolean; onClose: () => void; onAction: (a: string) => void }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const { navigate } = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    const cmds = COMMANDS.filter((c) => !s || c.label.toLowerCase().includes(s) || (c.keywords ?? "").includes(s) || (c.hint ?? "").toLowerCase().includes(s))
      .map((c) => ({ type: "cmd" as const, ...c }));
    const assets = (s.length >= 1 ? ASSETS.filter((a) => a.ticker.toLowerCase().includes(s) || a.name.toLowerCase().includes(s)) : ASSETS.slice(0, 4))
      .slice(0, 6)
      .map((a) => ({ type: "asset" as const, id: `as-${a.ticker}`, label: a.name, group: "Assets", ticker: a.ticker, price: a.price, chg: a.chgPct }));
    return [...cmds.slice(0, 9), ...assets];
  }, [q]);

  useEffect(() => setSel(0), [q]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(results.length - 1, s + 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
      if (e.key === "Enter") {
        e.preventDefault();
        const r = results[sel];
        if (!r) return;
        if (r.type === "asset") navigate(`/assets/${r.ticker}`);
        else {
          if (r.to) navigate(r.to);
          if (r.action) onAction(r.action);
        }
        onClose();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, results, sel, navigate, onClose, onAction]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-i="${sel}"]`)?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  if (!open) return null;

  let lastGroup = "";
  return (
    <div className="fixed inset-0 z-[95] flex items-start justify-center px-4 pt-[12vh] anim-fade" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative w-full max-w-[620px] overflow-hidden rounded-[10px] border border-line glass shadow-[0_50px_110px_-40px_rgba(0,0,0,1)] anim-scale-in">
        <div className="flex items-center gap-2.5 border-b border-line-subtle px-3.5">
          <Search size={14} className="text-txt-muted" strokeWidth={1.6} />
          <input
            ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search assets, portfolios, signals, models…"
            aria-label="Command palette search"
            className="h-11 flex-1 bg-transparent text-[13px] text-txt-primary placeholder:text-txt-disabled focus:outline-none"
          />
          <Kbd>ESC</Kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto py-1.5">
          {results.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-[12px] text-txt-secondary">No matches for “{q}”</p>
              <p className="mt-1 text-[11px] text-txt-muted">Try “risk”, “optimize”, “RELIANCE” or “drawdown”.</p>
            </div>
          )}
          {results.map((r, i) => {
            const head = r.group !== lastGroup ? r.group : null;
            lastGroup = r.group;
            const active = i === sel;
            return (
              <div key={r.id}>
                {head && <div className="px-3.5 pb-1 pt-2.5 label-xs text-txt-disabled">{head}</div>}
                <button
                  data-i={i} onMouseEnter={() => setSel(i)}
                  onClick={() => {
                    if (r.type === "asset") navigate(`/assets/${r.ticker}`);
                    else { if (r.to) navigate(r.to); if (r.action) onAction(r.action); }
                    onClose();
                  }}
                  className={cn("flex w-full items-center gap-2.5 px-3.5 py-2 text-left transition-colors duration-100", active ? "bg-surface-active" : "hover:bg-surface-hover/60")}
                >
                  {r.type === "cmd" ? (
                    <r.icon size={13} strokeWidth={1.6} className={cn(active ? "text-acc" : "text-txt-muted")} />
                  ) : (
                    <TrendingUp size={13} strokeWidth={1.6} className={cn(active ? "text-acc" : "text-txt-muted")} />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate text-[12.5px]", active ? "text-txt-primary" : "text-txt-secondary")}>
                      {r.type === "asset" ? <><span className="mono">{r.ticker}</span> <span className="text-txt-muted">· {r.label}</span></> : r.label}
                    </span>
                    {r.type === "cmd" && r.hint && <span className="block truncate text-[10.5px] text-txt-muted">{r.hint}</span>}
                  </span>
                  {r.type === "asset" && (
                    <span className="flex items-center gap-2">
                      <span className="mono text-[11px] text-txt-secondary">₹{num(r.price, 2)}</span>
                      <span className={cn("mono text-[10.5px]", r.chg >= 0 ? "text-pos" : "text-neg")}>{r.chg >= 0 ? "↑" : "↓"}{Math.abs(r.chg).toFixed(2)}%</span>
                    </span>
                  )}
                  {active && <CornerDownLeft size={11} className="text-txt-muted" />}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-line-subtle px-3.5 py-2">
          <div className="flex items-center gap-3 text-[10px] text-txt-muted">
            <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
            <span className="flex items-center gap-1"><Kbd>↵</Kbd> select</span>
          </div>
          <span className="label-xs text-txt-disabled">QUANTX Command</span>
        </div>
      </div>
    </div>
  );
}

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from "react";
import { AlertTriangle, Check, ChevronRight, Info, Loader2, X, XCircle } from "lucide-react";
import { cn } from "../../utils/cn";
import { arrow } from "../../lib/format";

/* ═══════════════════════════ BUTTON ═══════════════════════════ */

type BtnVariant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "gold";
type BtnSize = "xs" | "sm" | "md" | "lg";

const BTN_V: Record<BtnVariant, string> = {
  primary:
    "bg-acc text-[#04140d] hover:bg-[#4ee9a5] active:bg-[#35c384] font-semibold shadow-[0_0_0_1px_rgba(61,220,151,0.35),0_8px_24px_-12px_rgba(61,220,151,0.55)]",
  secondary: "bg-surface-high text-txt-primary border border-line hover:border-line-strong hover:bg-surface-active",
  ghost: "text-txt-secondary hover:text-txt-primary hover:bg-surface-hover",
  outline: "border border-line text-txt-secondary hover:text-txt-primary hover:border-line-strong",
  danger: "bg-neg/12 text-neg border border-neg/35 hover:bg-neg/20",
  gold: "bg-gold/12 text-gold border border-gold/35 hover:bg-gold/20",
};
const BTN_S: Record<BtnSize, string> = {
  xs: "h-6 px-2 text-[10px] gap-1 rounded-[4px] tracking-[0.06em] uppercase font-medium",
  sm: "h-7.5 px-3 text-[11px] gap-1.5 rounded-[5px]",
  md: "h-9 px-4 text-[12px] gap-2 rounded-[6px]",
  lg: "h-11 px-6 text-[12px] gap-2 rounded-[6px] tracking-[0.1em] uppercase font-semibold",
};

export function Button({
  variant = "secondary", size = "sm", className, children, loading, icon: Icon, ...rest
}: {
  variant?: BtnVariant; size?: BtnSize; loading?: boolean; icon?: React.ElementType;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap transition-all duration-150 select-none",
        "disabled:opacity-40 disabled:pointer-events-none",
        BTN_V[variant], BTN_S[size], className,
      )}
      {...rest}
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : Icon ? <Icon size={size === "xs" ? 11 : 13} strokeWidth={1.75} /> : null}
      {children}
    </button>
  );
}

export function IconButton({
  label, icon: Icon, active, className, size = 15, ...rest
}: { label: string; icon: React.ElementType; active?: boolean; size?: number } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      aria-label={label} title={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-transparent transition-all duration-150",
        active ? "bg-surface-active text-txt-primary border-line" : "text-txt-secondary hover:text-txt-primary hover:bg-surface-hover",
        className,
      )}
      {...rest}
    >
      <Icon size={size} strokeWidth={1.6} />
    </button>
  );
}

/* ═══════════════════════════ BADGES ═══════════════════════════ */

type Tone = "pos" | "neg" | "warn" | "neu" | "info" | "gold";
const TONE_BADGE: Record<Tone, string> = {
  pos: "text-pos bg-pos/10 border-pos/25",
  neg: "text-neg bg-neg/10 border-neg/25",
  warn: "text-warn bg-warn/10 border-warn/25",
  neu: "text-txt-secondary bg-white/4 border-line",
  info: "text-acc2 bg-acc2/10 border-acc2/25",
  gold: "text-gold bg-gold/10 border-gold/25",
};

export function Badge({ tone = "neu", children, className, dot }: { tone?: Tone; children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 border px-1.5 py-0.5 rounded-[4px] label-xs", TONE_BADGE[tone], className)}>
      {dot && <span className="h-1 w-1 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function SignalBadge({ signal }: { signal: string }) {
  const map: Record<string, Tone> = { BUY: "pos", HOLD: "neu", REDUCE: "warn", SELL: "neg" };
  const mark: Record<string, string> = { BUY: "▲", HOLD: "■", REDUCE: "▽", SELL: "▼" };
  return (
    <span className={cn("inline-flex items-center gap-1 border px-1.5 py-0.5 rounded-[4px] label-xs tabular-nums", TONE_BADGE[map[signal] ?? "neu"])}>
      <span className="text-[7px] leading-none">{mark[signal]}</span>
      {signal}
    </span>
  );
}

export function RiskBadge({ level }: { level: string }) {
  const map: Record<string, Tone> = {
    LOW: "pos", MEDIUM: "warn", HIGH: "neg", HEALTHY: "pos", DEGRADED: "warn", STALE: "neg",
    "WITHIN LIMITS": "pos", ELEVATED: "warn", BREACH: "neg", PRODUCTION: "pos", STAGING: "info",
    SHADOW: "neu", RETRAINING: "warn", ACTIVE: "pos", MONITOR: "warn", DECAY: "neg",
    OPERATIONAL: "pos", CRITICAL: "neg", WARNING: "warn", INFO: "info",
    FILLED: "pos", PARTIAL: "warn", CANCELLED: "neu",
  };
  return <Badge tone={map[level] ?? "neu"} dot>{level}</Badge>;
}

export function StatusIndicator({ tone = "pos", label, pulse = true }: { tone?: Tone; label: string; pulse?: boolean }) {
  const c: Record<Tone, string> = {
    pos: "bg-pos", neg: "bg-neg", warn: "bg-warn", neu: "bg-neu", info: "bg-acc2", gold: "bg-gold",
  };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative flex h-1.5 w-1.5">
        {pulse && <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-60 anim-pulse-dot", c[tone])} />}
        <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", c[tone])} />
      </span>
      <span className="label-xs text-txt-secondary">{label}</span>
    </span>
  );
}

/* ═══════════════════════════ DELTA / METRIC ═══════════════════════════ */

export function Delta({ value, suffix = "%", digits = 2, className, showArrow = true }: {
  value: number; suffix?: string; digits?: number; className?: string; showArrow?: boolean;
}) {
  const t = value > 0 ? "text-pos" : value < 0 ? "text-neg" : "text-txt-secondary";
  return (
    <span className={cn("tnum inline-flex items-center gap-0.5 font-medium", t, className)}>
      {showArrow && <span aria-hidden className="text-[0.85em]">{arrow(value)}</span>}
      <span className="sr-only">{value >= 0 ? "up" : "down"} </span>
      {value >= 0 ? "+" : "−"}{Math.abs(value).toFixed(digits)}{suffix}
    </span>
  );
}

/* ═══════════════════════════ SURFACES ═══════════════════════════ */

/** Level 1 — flat section grouping (no card chrome). */
export function Section({ title, sub, actions, children, className, id }: {
  title?: string; sub?: string; actions?: ReactNode; children: ReactNode; className?: string; id?: string;
}) {
  return (
    <section id={id} className={cn("min-w-0", className)}>
      {(title || actions) && (
        <header className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-txt-primary">{title}</h2>}
            {sub && <p className="mt-0.5 text-[11px] text-txt-muted">{sub}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

/** Level 2/3 — subtle surface / elevated module. */
export function Panel({
  title, sub, actions, children, className, bodyClass, level = 2, tone, footer,
}: {
  title?: ReactNode; sub?: string; actions?: ReactNode; children?: ReactNode;
  className?: string; bodyClass?: string; level?: 2 | 3; tone?: "warn" | "neg" | "pos"; footer?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-[8px] border transition-colors duration-200",
        level === 2 ? "bg-surface/70 border-line-subtle" : "bg-surface-high border-line shadow-[0_1px_0_rgba(255,255,255,0.02)_inset]",
        tone === "warn" && "border-warn/40", tone === "neg" && "border-neg/40", tone === "pos" && "border-pos/35",
        className,
      )}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 border-b border-line-subtle px-3.5 py-2.5">
          <div className="min-w-0">
            {typeof title === "string" ? <h3 className="label-sm text-txt-secondary">{title}</h3> : title}
            {sub && <p className="mt-1 text-[11px] text-txt-muted">{sub}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
        </div>
      )}
      <div className={cn("p-3.5", bodyClass)}>{children}</div>
      {footer && <div className="border-t border-line-subtle px-3.5 py-2">{footer}</div>}
    </div>
  );
}

/* ═══════════════════════════ CONTROLS ═══════════════════════════ */

export function SegmentedControl<T extends string>({
  options, value, onChange, size = "sm", className, ariaLabel,
}: { options: readonly T[]; value: T; onChange: (v: T) => void; size?: "xs" | "sm"; className?: string; ariaLabel?: string }) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={cn("inline-flex items-center gap-0.5 rounded-[6px] border border-line-subtle bg-bg-secondary p-0.5", className)}>
      {options.map((o) => (
        <button
          key={o} role="tab" aria-selected={value === o} onClick={() => onChange(o)}
          className={cn(
            "rounded-[4px] transition-all duration-150 tnum",
            size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
            value === o ? "bg-surface-active text-txt-primary shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]" : "text-txt-muted hover:text-txt-secondary",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange, className }: {
  tabs: readonly { key: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; className?: string;
}) {
  return (
    <div role="tablist" className={cn("flex items-center gap-0 overflow-x-auto no-scrollbar border-b border-line-subtle", className)}>
      {tabs.map((t) => (
        <button
          key={t.key} role="tab" aria-selected={value === t.key} onClick={() => onChange(t.key)}
          className={cn(
            "relative whitespace-nowrap px-3 py-2 text-[12px] transition-colors duration-150",
            value === t.key ? "text-txt-primary" : "text-txt-muted hover:text-txt-secondary",
          )}
        >
          {t.label}
          {t.count !== undefined && <span className="ml-1.5 tnum text-[10px] text-txt-muted">{t.count}</span>}
          {value === t.key && <span className="absolute inset-x-2 -bottom-px h-px bg-acc" />}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-[11px] text-txt-secondary transition-colors hover:text-txt-primary"
    >
      <span className={cn("relative h-3.5 w-6.5 rounded-full border transition-colors duration-200", checked ? "border-acc/50 bg-acc/25" : "border-line bg-bg-secondary")}>
        <span className={cn("absolute top-0.5 h-2.5 w-2.5 rounded-full transition-all duration-200", checked ? "left-3 bg-acc" : "left-0.5 bg-txt-muted")} />
      </span>
      {label}
    </button>
  );
}

export function Slider({ label, value, onChange, min, max, step = 1, unit = "", tone = "acc" }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; unit?: string; tone?: "acc" | "acc2" | "gold";
}) {
  const pctv = ((value - min) / (max - min)) * 100;
  const col = tone === "acc" ? "var(--color-acc)" : tone === "acc2" ? "var(--color-acc2)" : "var(--color-gold)";
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[11px] text-txt-secondary">{label}</span>
        <span className="mono text-[11px] text-txt-primary">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(+e.target.value)} aria-label={label}
        className="h-1 w-full cursor-pointer appearance-none rounded-full outline-none
          [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md
          [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white"
        style={{ background: `linear-gradient(90deg, ${col} ${pctv}%, #202b36 ${pctv}%)` }}
      />
    </label>
  );
}

/* ═══════════════════════════ TOOLTIP ═══════════════════════════ */

export function Tooltip({ content, children, side = "top" }: { content: ReactNode; children: ReactNode; side?: "top" | "bottom" | "right" }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
      {children}
      {open && (
        <span
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-50 w-max max-w-[260px] rounded-[6px] border border-line bg-[#0d141c]/97 px-2.5 py-1.5 text-[11px] leading-relaxed font-normal normal-case tracking-normal text-txt-secondary shadow-[0_18px_40px_-16px_rgba(0,0,0,0.9)] anim-scale-in",
            side === "top" && "bottom-full left-1/2 mb-1.5 -translate-x-1/2",
            side === "bottom" && "top-full left-1/2 mt-1.5 -translate-x-1/2",
            side === "right" && "left-full top-1/2 ml-2 -translate-y-1/2",
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}

export const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd className="inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-[3px] border border-line bg-bg-secondary px-1 font-sans text-[9.5px] font-medium text-txt-muted">
    {children}
  </kbd>
);

/* ═══════════════════════════ FEEDBACK ═══════════════════════════ */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-[4px]", className)} />;
}

export function ChartSkeleton({ height = 240, label = "Rendering series…" }: { height?: number; label?: string }) {
  return (
    <div className="relative flex items-end gap-1 overflow-hidden rounded-[6px] border border-line-subtle bg-bg-secondary/50 px-3 pb-3 pt-8" style={{ height }}>
      {Array.from({ length: 34 }).map((_, i) => (
        <div key={i} className="skeleton flex-1 rounded-[2px]" style={{ height: `${18 + ((i * 37) % 68)}%`, animationDelay: `${i * 22}ms` }} />
      ))}
      <span className="absolute left-3 top-3 label-xs text-txt-muted">{label}</span>
    </div>
  );
}

export function TableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-line-subtle">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-3 py-2.5">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={cn("h-3", c === 0 ? "w-28" : "flex-1")} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function Progress({ value, tone = "acc", height = 3 }: { value: number; tone?: "acc" | "warn" | "neg" | "acc2" | "gold"; height?: number }) {
  const c = { acc: "bg-acc", warn: "bg-warn", neg: "bg-neg", acc2: "bg-acc2", gold: "bg-gold" }[tone];
  return (
    <div className="w-full overflow-hidden rounded-full bg-line-subtle" style={{ height }} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full transition-[width] duration-500 ease-out", c)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body, action }: { icon: React.ElementType; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-line bg-bg-secondary">
        <Icon size={17} strokeWidth={1.4} className="text-txt-muted" />
      </div>
      <div>
        <p className="text-[13px] font-medium text-txt-primary">{title}</p>
        <p className="mx-auto mt-1 max-w-[320px] text-[11.5px] leading-relaxed text-txt-muted">{body}</p>
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ title, body, meta, onRetry }: { title: string; body: string; meta?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-[8px] border border-neg/30 bg-neg/5 p-4">
      <div className="flex items-center gap-2">
        <XCircle size={14} className="text-neg" strokeWidth={1.7} />
        <span className="label-sm text-neg">{title}</span>
      </div>
      <p className="text-[12px] leading-relaxed text-txt-secondary">{body}</p>
      {meta && <p className="mono text-[10.5px] text-txt-muted">{meta}</p>}
      {onRetry && <Button size="xs" variant="secondary" onClick={onRetry}>Retry</Button>}
    </div>
  );
}

export function AlertBanner({ severity, title, children, onDismiss }: {
  severity: "INFO" | "WARNING" | "CRITICAL"; title: string; children?: ReactNode; onDismiss?: () => void;
}) {
  const cfg = {
    INFO: { i: Info, c: "border-acc2/30 bg-acc2/6", t: "text-acc2" },
    WARNING: { i: AlertTriangle, c: "border-warn/35 bg-warn/6", t: "text-warn" },
    CRITICAL: { i: AlertTriangle, c: "border-neg/40 bg-neg/7", t: "text-neg" },
  }[severity];
  const I = cfg.i;
  return (
    <div className={cn("flex items-start gap-2.5 rounded-[7px] border px-3 py-2.5", cfg.c)}>
      <I size={13} className={cn("mt-0.5 shrink-0", cfg.t)} strokeWidth={1.8} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn("label-xs", cfg.t)}>{severity}</span>
          <span className="text-[12px] font-medium text-txt-primary">{title}</span>
        </div>
        {children && <div className="mt-1 text-[11.5px] leading-relaxed text-txt-secondary">{children}</div>}
      </div>
      {onDismiss && <IconButton label="Dismiss" icon={X} size={12} className="h-5 w-5" onClick={onDismiss} />}
    </div>
  );
}

/* ═══════════════════════════ MODAL / DRAWER ═══════════════════════════ */

export function Modal({ open, onClose, title, children, width = "max-w-lg" }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 anim-fade" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/72 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cn("relative w-full overflow-hidden rounded-[10px] border border-line glass shadow-[0_40px_90px_-30px_rgba(0,0,0,0.95)] anim-scale-in", width)}>
        <div className="flex items-center justify-between border-b border-line-subtle px-4 py-3">
          <h3 className="label-sm text-txt-primary">{title}</h3>
          <IconButton label="Close" icon={X} onClick={onClose} size={14} />
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ TOASTS ═══════════════════════════ */

type Toast = { id: number; title: string; body?: string; tone?: Tone; metrics?: { k: string; v: string; tone?: Tone }[] };
const ToastCtx = createContext<{ push: (t: Omit<Toast, "id">) => void }>({ push: () => {} });
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = ++idRef.current;
    setItems((p) => [...p, { ...t, id }]);
    setTimeout(() => setItems((p) => p.filter((x) => x.id !== id)), 5200);
  }, []);
  const value = useMemo(() => ({ push }), [push]);
  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[330px] flex-col gap-2">
        {items.map((t) => (
          <div key={t.id} className="pointer-events-auto overflow-hidden rounded-[8px] border border-line glass shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] anim-fade-up">
            <div className="flex items-start gap-2.5 px-3.5 py-3">
              <span className={cn("mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full", t.tone === "neg" ? "bg-neg/15 text-neg" : t.tone === "warn" ? "bg-warn/15 text-warn" : "bg-acc/15 text-acc")}>
                {t.tone === "neg" ? <X size={9} strokeWidth={3} /> : t.tone === "warn" ? <AlertTriangle size={9} strokeWidth={2.5} /> : <Check size={9} strokeWidth={3} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-txt-primary">{t.title}</p>
                {t.body && <p className="mt-0.5 text-[11px] leading-relaxed text-txt-muted">{t.body}</p>}
                {t.metrics && (
                  <div className="mt-2 grid grid-cols-3 gap-2 border-t border-line-subtle pt-2">
                    {t.metrics.map((m) => (
                      <div key={m.k}>
                        <div className="label-xs text-txt-muted">{m.k}</div>
                        <div className={cn("mono mt-0.5 text-[12px]", m.tone === "pos" ? "text-pos" : m.tone === "neg" ? "text-neg" : "text-txt-primary")}>{m.v}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-acc/60 to-transparent" />
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ═══════════════════════════ BREADCRUMB ═══════════════════════════ */

export function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 overflow-hidden">
      {items.map((it, i) => (
        <span key={it.label} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={11} className="text-txt-disabled" />}
          <span className={cn("truncate text-[11.5px]", i === items.length - 1 ? "text-txt-primary" : "text-txt-muted")}>{it.label}</span>
        </span>
      ))}
    </nav>
  );
}

/* ═══════════════════════════ HOOKS ═══════════════════════════ */

/** Async data hook with loading + error states — mirrors a real query client. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fn()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(String(e)))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => reload(), [reload]);
  return { data, loading, error, reload };
}

/** Animated numeric counter — subtle value transitions. */
export function useCountUp(target: number, duration = 620) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setV(a + (target - a) * e);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

/** Scroll reveal for the landing page. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    el.querySelectorAll(".reveal").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
}

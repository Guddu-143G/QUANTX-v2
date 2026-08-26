import { Info } from "lucide-react";
import { cn } from "../../utils/cn";
import { Badge, Delta, RiskBadge, Tooltip } from "../ui";
import { Sparkline } from "../charts";
import { sparkOf } from "../../data/market";
import { num } from "../../lib/format";
import { Link } from "../../lib/router";
export { PerformanceAttribution } from "./PerformanceAttribution";

/* ─────────────────────────── KPI / Metric modules ─────────────────────────── */

export function MetricCard({
  label, value, change, changeLabel, context, seed, tone = "neu", tip, absolute, className,
}: {
  label: string; value: string; change: number; changeLabel: string; context?: string;
  seed: number; tone?: "pos" | "neg" | "warn" | "neu"; tip?: string; absolute?: boolean; className?: string;
}) {
  const sparkTone = tone === "warn" ? "gold" : tone === "neg" ? "neg" : tone === "pos" ? "pos" : "neu";
  return (
    <div className={cn(
      "group relative min-w-0 overflow-hidden rounded-[8px] border border-line-subtle bg-surface/60 px-3.5 py-3 transition-all duration-200",
      "hover:border-line hover:bg-surface-high/70",
      className,
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1">
          <span className="label-xs text-txt-muted">{label}</span>
          {tip && (
            <Tooltip content={tip}>
              <Info size={9.5} className="text-txt-disabled transition-colors group-hover:text-txt-muted" />
            </Tooltip>
          )}
        </div>
        <div className="opacity-70 transition-opacity duration-200 group-hover:opacity-100">
          <Sparkline data={sparkOf(seed, 24, tone === "neg" ? -0.2 : 0.24, 0.16)} tone={sparkTone as "pos"} width={62} height={20} strokeWidth={1} />
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="tnum text-[21px] font-semibold leading-none tracking-[-0.02em] text-txt-primary">{value}</span>
        <Delta value={change} suffix={absolute ? "" : "%"} digits={2} className="text-[11.5px]" />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 border-t border-line-subtle pt-2">
        <span className="truncate text-[10.5px] text-txt-muted">{context}</span>
        <span className="label-xs shrink-0 text-txt-disabled">{changeLabel}</span>
      </div>
      <div className={cn(
        "absolute inset-x-0 bottom-0 h-px scale-x-0 transition-transform duration-300 group-hover:scale-x-100",
        tone === "pos" ? "bg-acc/50" : tone === "warn" ? "bg-warn/50" : tone === "neg" ? "bg-neg/50" : "bg-acc2/40",
      )} />
    </div>
  );
}

export function FinancialMetric({
  label, value, delta, sub, tone, size = "md", align = "left",
}: {
  label: string; value: string; delta?: number; sub?: string;
  tone?: "pos" | "neg" | "warn" | "neu"; size?: "sm" | "md" | "lg"; align?: "left" | "right";
}) {
  const s = { sm: "text-[13px]", md: "text-[16px]", lg: "text-[24px]" }[size];
  const tc = tone === "pos" ? "text-pos" : tone === "neg" ? "text-neg" : tone === "warn" ? "text-warn" : "text-txt-primary";
  return (
    <div className={cn("min-w-0", align === "right" && "text-right")}>
      <div className="label-xs text-txt-muted">{label}</div>
      <div className={cn("tnum mt-1 font-semibold leading-none tracking-[-0.015em]", s, tc)}>{value}</div>
      {(delta !== undefined || sub) && (
        <div className={cn("mt-1.5 flex items-center gap-1.5 text-[10.5px] text-txt-muted", align === "right" && "justify-end")}>
          {delta !== undefined && <Delta value={delta} className="text-[10.5px]" />}
          {sub && <span className="truncate">{sub}</span>}
        </div>
      )}
    </div>
  );
}

/** Compact stat used inside dense panels. */
export function StatCell({ k, v, tone, sub }: { k: string; v: string; tone?: "pos" | "neg" | "warn"; sub?: string }) {
  return (
    <div className="min-w-0 border-l border-line-subtle pl-2.5 first:border-l-0 first:pl-0">
      <div className="label-xs truncate text-txt-muted">{k}</div>
      <div className={cn("mono mt-1 text-[13px]", tone === "pos" ? "text-pos" : tone === "neg" ? "text-neg" : tone === "warn" ? "text-warn" : "text-txt-primary")}>{v}</div>
      {sub && <div className="mt-0.5 truncate text-[10px] text-txt-disabled">{sub}</div>}
    </div>
  );
}

/* ─────────────────────────── Asset primitives ─────────────────────────── */

export function TickerCell({ ticker, name, exch = "NSE" }: { ticker: string; name?: string; exch?: string }) {
  return (
    <Link to={`/assets/${ticker}`} className="group/t flex min-w-0 items-center gap-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] border border-line-subtle bg-bg-secondary mono text-[9px] text-txt-secondary transition-colors group-hover/t:border-line-strong group-hover/t:text-txt-primary">
        {ticker.slice(0, 2)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[11.5px] font-medium text-txt-primary transition-colors group-hover/t:text-acc">{ticker}</span>
        {name && <span className="block truncate text-[10px] text-txt-muted">{name}</span>}
        {!name && <span className="block text-[9.5px] text-txt-disabled">{exch}</span>}
      </span>
    </Link>
  );
}

/** Subtle heatmap intensity cell for factor scores. */
export function ScoreCell({ v, max = 100 }: { v: number; max?: number }) {
  const t = Math.max(0, Math.min(1, Math.abs(v) / max));
  const positive = v >= 50;
  const bg = positive ? `rgba(61,220,151,${(0.05 + t * 0.16).toFixed(3)})` : `rgba(255,92,108,${(0.05 + (1 - t) * 0.16).toFixed(3)})`;
  return (
    <span className="inline-flex min-w-[38px] justify-end rounded-[3px] px-1.5 py-0.5 mono text-[11px] text-txt-primary" style={{ background: bg }}>
      {v >= 0 ? "+" : "−"}{Math.abs(v)}
    </span>
  );
}

export function ProbCell({ v }: { v: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-1 w-8 overflow-hidden rounded-full bg-line-subtle">
        <span className="block h-full rounded-full" style={{ width: `${v}%`, background: v > 65 ? "var(--color-acc)" : v > 45 ? "var(--color-warn)" : "var(--color-neg)" }} />
      </span>
      <span className="mono text-[11px] text-txt-primary">{v}%</span>
    </span>
  );
}

/* ─────────────────────────── Model card ─────────────────────────── */

export function ModelCard({ m, onClick }: {
  m: { name: string; version: string; type: string; status: string; sharpe: number; accuracy: number; drift: string; trained: string; features: number; rows: string; latency: string; deployed: string; series: number[]; owner: string };
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className="group w-full min-w-0 rounded-[8px] border border-line-subtle bg-surface/60 p-3.5 text-left transition-all duration-200 hover:border-line hover:bg-surface-high/70">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-[13px] font-semibold tracking-[-0.01em] text-txt-primary">{m.name}</span>
            <span className="mono shrink-0 rounded-[3px] border border-line-subtle px-1 text-[9.5px] text-txt-muted">v{m.version}</span>
          </div>
          <p className="mt-0.5 truncate text-[10.5px] text-txt-muted">{m.type} · {m.owner}</p>
        </div>
        <RiskBadge level={m.status} />
      </div>

      <div className="mt-3 opacity-80 transition-opacity group-hover:opacity-100">
        <Sparkline data={m.series} width={260} height={30} tone={m.drift === "HIGH" ? "neg" : "pos"} strokeWidth={1} fluid />
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 border-t border-line-subtle pt-2.5">
        <StatCell k="Sharpe" v={m.sharpe ? m.sharpe.toFixed(2) : "—"} />
        <StatCell k="Accuracy" v={m.accuracy ? `${m.accuracy.toFixed(1)}%` : "—"} />
        <StatCell k="Drift" v={m.drift} tone={m.drift === "HIGH" ? "neg" : m.drift === "MEDIUM" ? "warn" : "pos"} />
        <StatCell k="Latency" v={m.latency} />
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t border-line-subtle pt-2 text-[10px] text-txt-disabled">
        <span>{m.features} features · {m.rows}</span>
        <span>Trained {m.trained}</span>
      </div>
    </button>
  );
}

/* ─────────────────────────── News row ─────────────────────────── */

export function NewsRow({ n }: {
  n: { headline: string; source: string; time: string; ticker: string; sentiment: string; confidence: number; impact: number; category: string };
}) {
  const tone = n.sentiment === "POSITIVE" ? "pos" : n.sentiment === "NEGATIVE" ? "neg" : "neu";
  return (
    <article className="group grid grid-cols-[46px_1fr] gap-3 border-b border-line-subtle px-3 py-2.5 transition-colors hover:bg-surface-hover/50 md:grid-cols-[46px_1fr_120px_112px]">
      <time className="mono pt-0.5 text-[10.5px] text-txt-muted">{n.time}</time>
      <div className="min-w-0">
        <p className="text-[12px] leading-snug text-txt-primary transition-colors group-hover:text-white">{n.headline}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-txt-muted">
          <span>{n.source}</span>
          <span className="text-txt-disabled">·</span>
          <Link to={`/assets/${n.ticker}`} className="mono text-txt-secondary transition-colors hover:text-acc">{n.ticker}</Link>
          <span className="text-txt-disabled">·</span>
          <span>{n.category}</span>
          <span className="md:hidden"><Badge tone={tone as "pos"}>{n.sentiment} {n.confidence}%</Badge></span>
        </div>
      </div>
      <div className="hidden md:block">
        <Badge tone={tone as "pos"}>{n.sentiment}</Badge>
        <div className="mt-1 mono text-[10px] text-txt-muted">conf {n.confidence}%</div>
      </div>
      <div className="hidden text-right md:block">
        <div className="label-xs text-txt-disabled">α impact</div>
        <div className={cn("mono mt-0.5 text-[12px]", n.impact > 0 ? "text-pos" : n.impact < 0 ? "text-neg" : "text-txt-secondary")}>
          {n.impact >= 0 ? "+" : "−"}{Math.abs(n.impact).toFixed(2)}
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────── Index pill ─────────────────────────── */

export function IndexPill({ idx, compact = false }: {
  idx: { key: string; name: string; value: number; chgPct: number; spark: number[] }; compact?: boolean;
}) {
  const inverse = idx.key === "VIX";
  const tone = inverse ? (idx.chgPct <= 0 ? "pos" : "neg") : idx.chgPct >= 0 ? "pos" : "neg";
  return (
    <div className="group flex shrink-0 items-center gap-2.5 border-r border-line-subtle px-3.5 py-1.5 last:border-r-0">
      <div className="min-w-0">
        <div className="label-xs whitespace-nowrap text-txt-muted">{idx.name}</div>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="mono text-[11.5px] text-txt-primary">{num(idx.value, idx.value > 1000 ? 2 : 2)}</span>
          <Delta value={idx.chgPct} className={cn("text-[10px]", tone === "pos" ? "!text-pos" : "!text-neg")} />
        </div>
      </div>
      {!compact && (
        <div className="opacity-60 transition-opacity group-hover:opacity-100">
          <Sparkline data={idx.spark} width={46} height={18} tone={tone as "pos"} strokeWidth={0.9} fill={false} animate={false} />
        </div>
      )}
    </div>
  );
}

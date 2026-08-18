import { useId, useMemo } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, LineChart,
  ReferenceArea, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis,
} from "recharts";
import { cn } from "../../utils/cn";
import { num } from "../../lib/format";

export const C = {
  acc: "#3DDC97", acc2: "#6EA8FE", gold: "#C8A96B", neg: "#FF5C6C",
  warn: "#E8B75A", neu: "#8290A0", grid: "#16202a", axis: "#647180",
};

/* ───────────────────────── Shared tooltip shell ───────────────────────── */

export function TipShell({ label, rows }: { label?: string; rows: { k: string; v: string; c?: string }[] }) {
  return (
    <div className="rounded-[6px] border border-line bg-[#0b1119]/97 px-2.5 py-2 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.95)] backdrop-blur-sm">
      {label && <div className="label-xs mb-1.5 text-txt-muted">{label}</div>}
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.k} className="flex items-center justify-between gap-5">
            <span className="flex items-center gap-1.5 text-[11px] text-txt-secondary">
              {r.c && <span className="h-[2px] w-2.5 rounded-full" style={{ background: r.c }} />}
              {r.k}
            </span>
            <span className="mono text-[11px] text-txt-primary">{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────── Sparkline ───────────────────────────── */

export function Sparkline({
  data, width = 88, height = 26, tone, strokeWidth = 1.25, fill = true, animate = true, fluid = false,
}: { data: number[]; width?: number; height?: number; tone?: "pos" | "neg" | "neu" | "gold"; strokeWidth?: number; fill?: boolean; animate?: boolean; fluid?: boolean }) {
  const id = useId();
  const { d, area, color } = useMemo(() => {
    if (!data?.length) return { d: "", area: "", color: C.neu };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const r = max - min || 1;
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * (width - 2) + 1;
      const y = height - 2 - ((v - min) / r) * (height - 4);
      return [x, y] as const;
    });
    const path = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
    const up = data[data.length - 1] >= data[0];
    const col = tone === "gold" ? C.gold : tone === "neu" ? C.neu : tone === "neg" ? C.neg : tone === "pos" ? C.acc : up ? C.acc : C.neg;
    return { d: path, area: `${path} L${width - 1},${height} L1,${height} Z`, color: col };
  }, [data, width, height, tone]);

  return (
    <svg
      width={fluid ? "100%" : width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={fluid ? "none" : "xMidYMid meet"}
      className={cn("overflow-visible", fluid && "block w-full")}
      aria-hidden
    >
      <defs>
        <linearGradient id={`sg${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.24} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#sg${id})`} />}
      <path
        d={d} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinejoin="round" strokeLinecap="round"
        vectorEffect={fluid ? "non-scaling-stroke" : undefined}
        className={animate ? "anim-draw" : ""}
      />
    </svg>
  );
}

/* ──────────────────── Performance (portfolio vs bench) ──────────────────── */

type PerfDatum = { d: string; portfolio: number; nifty: number; bench: number; dd: number };

export function PerformanceChart({
  data, height = 300, showBench = true, showNifty = true, showDD = false, markers = [],
}: {
  data: PerfDatum[]; height?: number; showBench?: boolean; showNifty?: boolean; showDD?: boolean;
  markers?: { d: string; label: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: -18 }}>
        <defs>
          <linearGradient id="pfFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.acc} stopOpacity={0.2} />
            <stop offset="100%" stopColor={C.acc} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="ddFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.neg} stopOpacity={0.22} />
            <stop offset="100%" stopColor={C.neg} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={C.grid} strokeDasharray="0" vertical={false} />
        <XAxis dataKey="d" tickLine={false} axisLine={false} minTickGap={52} tick={{ fontSize: 10 }} />
        <YAxis yAxisId="l" tickLine={false} axisLine={false} width={46} tick={{ fontSize: 10 }} domain={["dataMin - 2", "dataMax + 2"]} />
        {showDD && <YAxis yAxisId="r" orientation="right" tickLine={false} axisLine={false} width={34} tick={{ fontSize: 10 }} domain={[-30, 0]} />}
        <Tooltip
          cursor={{ stroke: "#2e3d4c", strokeDasharray: "3 3" }}
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <TipShell
                label={String(label)}
                rows={payload.map((p) => ({
                  k: String(p.name), c: p.color as string,
                  v: p.dataKey === "dd" ? `${num(Number(p.value), 2)}%` : num(Number(p.value), 2),
                }))}
              />
            ) : null
          }
        />
        {showDD && <Area yAxisId="r" type="monotone" dataKey="dd" name="Drawdown" stroke={C.neg} strokeWidth={0.75} fill="url(#ddFill)" isAnimationActive={false} />}
        <Area yAxisId="l" type="monotone" dataKey="portfolio" name="Portfolio" stroke={C.acc} strokeWidth={1.4} fill="url(#pfFill)" dot={false} animationDuration={900} />
        {showNifty && <Line yAxisId="l" type="monotone" dataKey="nifty" name="NIFTY 50" stroke={C.acc2} strokeWidth={1} dot={false} animationDuration={900} />}
        {showBench && <Line yAxisId="l" type="monotone" dataKey="bench" name="Benchmark 60/40" stroke={C.neu} strokeWidth={0.9} strokeDasharray="3 3" dot={false} animationDuration={900} />}
        {markers.map((m) => (
          <ReferenceLine key={m.label} yAxisId="l" x={m.d} stroke="#2e3d4c" strokeDasharray="2 2"
            label={{ value: m.label, position: "insideTopLeft", fill: "#647180", fontSize: 9 }} />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/* ──────────────────────────── Simple series ──────────────────────────── */

export function MiniArea({ data, dataKey = "v", color = C.acc, height = 120, xKey = "d", format = (v: number) => num(v, 2) }: {
  data: Record<string, unknown>[]; dataKey?: string; color?: string; height?: number; xKey?: string; format?: (v: number) => string;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 2, bottom: 0, left: -26 }}>
        <defs>
          <linearGradient id={`ma${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={C.grid} vertical={false} />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} minTickGap={40} tick={{ fontSize: 9 }} />
        <YAxis tickLine={false} axisLine={false} width={40} tick={{ fontSize: 9 }} domain={["dataMin", "dataMax"]} />
        <Tooltip content={({ active, payload, label }) => active && payload?.length ? <TipShell label={String(label)} rows={[{ k: "Value", v: format(Number(payload[0].value)), c: color }]} /> : null} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.2} fill={`url(#ma${id})`} dot={false} animationDuration={800} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MultiLine({ data, series, height = 260, xKey = "i" }: {
  data: Record<string, unknown>[]; series: { key: string; name: string; color: string; dash?: string }[]; height?: number; xKey?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: -22 }}>
        <CartesianGrid stroke={C.grid} vertical={false} />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} minTickGap={44} tick={{ fontSize: 10 }} />
        <YAxis tickLine={false} axisLine={false} width={44} tick={{ fontSize: 10 }} domain={["dataMin - 2", "dataMax + 2"]} />
        <Tooltip cursor={{ stroke: "#2e3d4c", strokeDasharray: "3 3" }}
          content={({ active, payload, label }) => active && payload?.length
            ? <TipShell label={String(label)} rows={payload.map((p) => ({ k: String(p.name), v: num(Number(p.value), 2), c: p.color as string }))} /> : null} />
        {series.map((s) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={1.15}
            strokeDasharray={s.dash} dot={false} animationDuration={850} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ───────────────────────────── Drawdown ───────────────────────────── */

export function DrawdownChart({ data, height = 130, xKey = "d" }: { data: Record<string, unknown>[]; height?: number; xKey?: string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
        <defs>
          <linearGradient id="ddG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.neg} stopOpacity={0.03} />
            <stop offset="100%" stopColor={C.neg} stopOpacity={0.26} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={C.grid} vertical={false} />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} minTickGap={44} tick={{ fontSize: 9 }} />
        <YAxis tickLine={false} axisLine={false} width={42} tick={{ fontSize: 9 }} tickFormatter={(v) => `${v}%`} />
        <Tooltip content={({ active, payload, label }) => active && payload?.length ? <TipShell label={String(label)} rows={[{ k: "Drawdown", v: `${num(Number(payload[0].value), 2)}%`, c: C.neg }]} /> : null} />
        <ReferenceLine y={0} stroke="#2e3d4c" />
        <Area type="monotone" dataKey="dd" stroke={C.neg} strokeWidth={0.9} fill="url(#ddG)" dot={false} animationDuration={800} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ─────────────────────────── Waterfall / Bars ─────────────────────────── */

export function WaterfallChart({ data, height = 200 }: { data: { name: string; value: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -24 }}>
        <CartesianGrid stroke={C.grid} vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 9 }} interval={0} angle={-16} textAnchor="end" height={46} />
        <YAxis tickLine={false} axisLine={false} width={42} tick={{ fontSize: 9 }} tickFormatter={(v) => `${v}%`} />
        <Tooltip cursor={{ fill: "rgba(255,255,255,0.025)" }}
          content={({ active, payload, label }) => active && payload?.length
            ? <TipShell label={String(label)} rows={[{ k: "Contribution", v: `${Number(payload[0].value) >= 0 ? "+" : "−"}${Math.abs(Number(payload[0].value)).toFixed(2)}pp` }]} /> : null} />
        <ReferenceLine y={0} stroke="#2e3d4c" />
        <Bar dataKey="value" radius={[2, 2, 0, 0]} animationDuration={700} maxBarSize={44}>
          {data.map((d, i) => <Cell key={i} fill={d.value >= 0 ? C.acc : C.neg} fillOpacity={0.82} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HistogramChart({ data, height = 180 }: { data: { bucket: string; n: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -26 }}>
        <CartesianGrid stroke={C.grid} vertical={false} />
        <XAxis dataKey="bucket" tickLine={false} axisLine={false} tick={{ fontSize: 9 }} interval={0} />
        <YAxis tickLine={false} axisLine={false} width={40} tick={{ fontSize: 9 }} />
        <Tooltip cursor={{ fill: "rgba(255,255,255,0.025)" }}
          content={({ active, payload, label }) => active && payload?.length ? <TipShell label={String(label)} rows={[{ k: "Trades", v: String(payload[0].value) }]} /> : null} />
        <Bar dataKey="n" radius={[2, 2, 0, 0]} animationDuration={650} maxBarSize={40}>
          {data.map((d, i) => <Cell key={i} fill={d.bucket.includes("−") || d.bucket.startsWith("<") ? C.neg : C.acc} fillOpacity={0.72} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ─────────────────────── Efficient frontier scatter ─────────────────────── */

export type FrontierPt = { risk: number; ret: number; name?: string; kind?: string };

export function EfficientFrontier({ curve, points, height = 320, onHover }: {
  curve: FrontierPt[]; points: (FrontierPt & { color: string })[]; height?: number; onHover?: (p: FrontierPt | null) => void;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 12, right: 16, bottom: 6, left: -14 }}>
        <CartesianGrid stroke={C.grid} />
        <XAxis type="number" dataKey="risk" name="Risk" domain={[6, 22]} tickLine={false} axisLine={false}
          tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`}
          label={{ value: "PORTFOLIO RISK (σ, ann.)", position: "insideBottom", offset: -2, fill: "#647180", fontSize: 9, letterSpacing: 1 }} />
        <YAxis type="number" dataKey="ret" name="Return" domain={[6, 24]} tickLine={false} axisLine={false} width={46}
          tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`}
          label={{ value: "EXPECTED RETURN", angle: -90, position: "insideLeft", offset: 22, fill: "#647180", fontSize: 9, letterSpacing: 1 }} />
        <ZAxis range={[36, 36]} />
        <Tooltip cursor={{ strokeDasharray: "3 3", stroke: "#2e3d4c" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload as FrontierPt;
            return <TipShell label={p.name ?? "Frontier"} rows={[
              { k: "Expected return", v: `${p.ret.toFixed(2)}%` },
              { k: "Risk (σ)", v: `${p.risk.toFixed(2)}%` },
              { k: "Sharpe", v: ((p.ret - 6.8) / p.risk).toFixed(2) },
            ]} />;
          }} />
        <Scatter data={curve} line={{ stroke: C.acc2, strokeWidth: 1.1 }} shape={() => <g />} isAnimationActive={false} />
        {points.map((p) => (
          <Scatter key={p.name} data={[p]} fill={p.color} shape="circle" isAnimationActive={false}
            onMouseEnter={() => onHover?.(p)} onMouseLeave={() => onHover?.(null)} />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}

/* ────────────────────────── Allocation radial ────────────────────────── */

export function AllocationRadial({ data, size = 200 }: { data: { key: string; value: number; color: string }[]; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const gap = 3.2;
  let start = -90;
  const rings = [
    { r: size / 2 - 6, w: 9 },
    { r: size / 2 - 19, w: 9 },
    { r: size / 2 - 32, w: 9 },
    { r: size / 2 - 45, w: 9 },
  ];
  const arcs = data.map((d, i) => {
    const sweep = (d.value / 100) * 360 - gap;
    const a0 = start;
    const a1 = start + sweep;
    start += (d.value / 100) * 360;
    const ring = rings[Math.min(i, rings.length - 1)];
    const rad = (a: number) => ((a * Math.PI) / 180);
    const x0 = cx + ring.r * Math.cos(rad(a0));
    const y0 = cy + ring.r * Math.sin(rad(a0));
    const x1 = cx + ring.r * Math.cos(rad(a1));
    const y1 = cy + ring.r * Math.sin(rad(a1));
    const large = sweep > 180 ? 1 : 0;
    return { d: `M${x0},${y0} A${ring.r},${ring.r} 0 ${large} 1 ${x1},${y1}`, color: d.color, w: ring.w, key: d.key, value: d.value, r: ring.r };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Portfolio allocation">
      {rings.map((r, i) => <circle key={i} cx={cx} cy={cy} r={r.r} fill="none" stroke="#141d26" strokeWidth={r.w} />)}
      {arcs.map((a, i) => (
        <path key={a.key} d={a.d} fill="none" stroke={a.color} strokeWidth={a.w} strokeLinecap="round"
          style={{ strokeDasharray: 2 * Math.PI * a.r, strokeDashoffset: 0, animation: `qx-draw 1.1s ${i * 90}ms var(--ease-out-quant) both` }} />
      ))}
    </svg>
  );
}

/* ───────────────────────────── Heatmaps ───────────────────────────── */

export function heatColor(v: number, max = 1) {
  const t = Math.max(-1, Math.min(1, v / max));
  if (t >= 0) return `rgba(61, 220, 151, ${(0.06 + t * 0.42).toFixed(3)})`;
  return `rgba(255, 92, 108, ${(0.06 + Math.abs(t) * 0.42).toFixed(3)})`;
}

export function CorrelationMatrix({ labels, matrix, compact = false }: { labels: string[]; matrix: number[][]; compact?: boolean }) {
  return (
    <div className="overflow-x-auto no-scrollbar">
      <table className="w-full border-separate border-spacing-[2px]">
        <thead>
          <tr>
            <th className="w-16" />
            {labels.map((l) => (
              <th key={l} className="label-xs pb-1 text-txt-muted" style={{ fontSize: 9 }}>{compact ? l.slice(0, 4) : l.slice(0, 6)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={labels[i]}>
              <td className="pr-2 text-right label-xs text-txt-muted whitespace-nowrap" style={{ fontSize: 9 }}>{compact ? labels[i].slice(0, 4) : labels[i].slice(0, 8)}</td>
              {row.map((v, j) => (
                <td key={j} className="group relative h-7 rounded-[3px] text-center transition-transform duration-150 hover:z-10 hover:scale-[1.12]"
                  style={{ background: i === j ? "rgba(255,255,255,0.05)" : heatColor(v) }} title={`${labels[i]} × ${labels[j]} = ${v.toFixed(2)}`}>
                  <span className="mono text-[9.5px] text-txt-primary/85">{v.toFixed(2)}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MonthlyHeatmap({ rows, months }: { rows: { year: number; months: (number | null)[] }[]; months: string[] }) {
  return (
    <div className="overflow-x-auto no-scrollbar">
      <table className="w-full border-separate border-spacing-[2px] min-w-[560px]">
        <thead>
          <tr>
            <th className="w-10" />
            {months.map((m) => <th key={m} className="label-xs pb-1 text-txt-muted" style={{ fontSize: 9 }}>{m}</th>)}
            <th className="label-xs pb-1 pl-2 text-txt-muted" style={{ fontSize: 9 }}>YR</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const tot = r.months.reduce<number>((a, b) => a + (b ?? 0), 0);
            return (
              <tr key={r.year}>
                <td className="pr-2 text-right mono text-[10px] text-txt-muted">{r.year}</td>
                {r.months.map((v, i) => (
                  <td key={i} className="h-7 rounded-[3px] text-center transition-transform duration-150 hover:scale-[1.1]"
                    style={{ background: v === null ? "rgba(255,255,255,0.02)" : heatColor(v, 6) }}
                    title={v === null ? "—" : `${months[i]} ${r.year}: ${v > 0 ? "+" : ""}${v}%`}>
                    <span className="mono text-[9.5px] text-txt-primary/85">{v === null ? "" : v.toFixed(1)}</span>
                  </td>
                ))}
                <td className="pl-2 text-right mono text-[10px]" style={{ color: tot >= 0 ? C.acc : C.neg }}>{tot >= 0 ? "+" : "−"}{Math.abs(tot).toFixed(1)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ───────────────────────── Horizontal bar list ───────────────────────── */

export function BarList({ items, max, unit = "%", tone = "acc" }: {
  items: { label: string; value: number; limit?: number; sub?: string }[]; max?: number; unit?: string; tone?: "acc" | "acc2" | "gold";
}) {
  const m = max ?? Math.max(...items.map((i) => Math.max(i.value, i.limit ?? 0))) * 1.05;
  const col = tone === "acc" ? "bg-acc/70" : tone === "acc2" ? "bg-acc2/70" : "bg-gold/70";
  return (
    <div className="space-y-2">
      {items.map((it) => {
        const near = it.limit !== undefined && it.value / it.limit > 0.9;
        return (
          <div key={it.label} className="group">
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="truncate text-[11.5px] text-txt-secondary">{it.label}</span>
              <span className={cn("mono text-[11px]", near ? "text-warn" : "text-txt-primary")}>
                {it.value.toFixed(1)}{unit}{it.sub && <span className="ml-1.5 text-txt-muted">{it.sub}</span>}
              </span>
            </div>
            <div className="relative h-1.5 overflow-hidden rounded-full bg-line-subtle">
              <div className={cn("h-full rounded-full transition-all duration-700 ease-out", near ? "bg-warn/80" : col)} style={{ width: `${(it.value / m) * 100}%` }} />
              {it.limit !== undefined && (
                <div className="absolute top-0 h-full w-px bg-neg/60" style={{ left: `${(it.limit / m) * 100}%` }} title={`Limit ${it.limit}${unit}`} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── Candlestick ─────────────────────────── */

export function Candles({ data, height = 240 }: { data: { t: string; o: number; h: number; l: number; c: number }[]; height?: number }) {
  const min = Math.min(...data.map((d) => d.l));
  const max = Math.max(...data.map((d) => d.h));
  const r = max - min || 1;
  const w = 100 / data.length;
  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      <svg width="100%" height={height} preserveAspectRatio="none" viewBox={`0 0 100 ${height}`} className="overflow-visible">
        {[0, 0.25, 0.5, 0.75, 1].map((g) => <line key={g} x1={0} x2={100} y1={g * height} y2={g * height} stroke={C.grid} strokeWidth={0.5} />)}
        {data.map((d, i) => {
          const x = i * w + w / 2;
          const y = (v: number) => height - ((v - min) / r) * (height - 12) - 6;
          const up = d.c >= d.o;
          const col = up ? C.acc : C.neg;
          const top = y(Math.max(d.o, d.c));
          const bot = y(Math.min(d.o, d.c));
          return (
            <g key={i} opacity={0.92}>
              <line x1={x} x2={x} y1={y(d.h)} y2={y(d.l)} stroke={col} strokeWidth={0.22} />
              <rect x={x - w * 0.3} y={top} width={w * 0.6} height={Math.max(0.6, bot - top)} fill={col} fillOpacity={up ? 0.55 : 0.75} stroke={col} strokeWidth={0.16} />
            </g>
          );
        })}
      </svg>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex w-12 flex-col justify-between py-1 text-right">
        <span className="mono text-[9px] text-txt-muted">{max.toFixed(0)}</span>
        <span className="mono text-[9px] text-txt-muted">{((max + min) / 2).toFixed(0)}</span>
        <span className="mono text-[9px] text-txt-muted">{min.toFixed(0)}</span>
      </div>
    </div>
  );
}

/* ───────────────────── Risk contribution stacked bar ───────────────────── */

export function StackedBar({ items, height = 12 }: { items: { name: string; value: number; color: string }[]; height?: number }) {
  const total = items.reduce((a, b) => a + b.value, 0);
  return (
    <div className="flex w-full overflow-hidden rounded-[3px]" style={{ height }}>
      {items.map((i) => (
        <div key={i.name} className="group relative h-full transition-opacity duration-150 hover:opacity-80"
          style={{ width: `${(i.value / total) * 100}%`, background: i.color, opacity: 0.82 }} title={`${i.name}: ${i.value.toFixed(1)}%`} />
      ))}
    </div>
  );
}

export { ReferenceArea };

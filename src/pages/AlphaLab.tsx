import { useMemo, useState } from "react";
import { FlaskConical, Play, RotateCcw, Save } from "lucide-react";
import { PageHeader } from "../components/layout/AppShell";
import {
  Badge, Button, ChartSkeleton, Delta, Panel, Progress, RiskBadge, SegmentedControl,
  Skeleton, Slider, useAsync, useToast,
} from "../components/ui";
import { CorrelationMatrix, MultiLine, Sparkline, C } from "../components/charts";
import { StatCell } from "../components/finance";
import { alphaService } from "../services";
import { cn } from "../utils/cn";

const RANGES = ["3M", "6M", "1Y", "3Y"] as const;
const COLORS = [C.acc, C.acc2, C.gold, "#B98CFF", "#57C7D4", "#E8B75A"];

type WeightKey = "Momentum" | "Value" | "Quality" | "Sentiment" | "ML" | "Risk";
const DEFAULT_W: Record<WeightKey, number> = { Momentum: 25, Value: 20, Quality: 20, Sentiment: 10, ML: 15, Risk: 10 };

export default function AlphaLab() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("1Y");
  const [selected, setSelected] = useState<string[]>(["mom", "qual", "ml"]);
  const [weights, setWeights] = useState<Record<WeightKey, number>>(DEFAULT_W);
  const [running, setRunning] = useState(false);
  const [dirty, setDirty] = useState(false);
  const { push } = useToast();

  const factors = useAsync(() => alphaService.factors(), []);
  const corr = useAsync(() => alphaService.factorCorrelation(), []);

  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  const chartData = useMemo(() => {
    if (!factors.data) return [];
    const picked = factors.data.filter((f) => selected.includes(f.key));
    if (!picked.length) return [];
    const cut = { "3M": 30, "6M": 60, "1Y": 120, "3Y": 120 }[range];
    const len = Math.min(cut, picked[0].series.length);
    return Array.from({ length: len }, (_, i) => {
      const row: Record<string, number | string> = { i: `T-${len - i}` };
      picked.forEach((f) => {
        const s = f.series.slice(-len);
        row[f.key] = +((s[i] / s[0]) * 100).toFixed(2);
      });
      return row;
    });
  }, [factors.data, selected, range]);

  const series = useMemo(
    () => (factors.data ?? []).filter((f) => selected.includes(f.key)).map((f, i) => ({ key: f.key, name: f.name, color: COLORS[i % COLORS.length] })),
    [factors.data, selected],
  );

  const toggle = (k: string) => setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k].slice(-6)));

  const setW = (k: WeightKey, v: number) => { setWeights((w) => ({ ...w, [k]: v })); setDirty(true); };

  const runBacktest = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setDirty(false);
      push({
        title: "Alpha backtest complete",
        body: "Composite re-estimated over 2019–2026 on the NIFTY 200 universe.",
        metrics: [{ k: "Sharpe", v: "1.82", tone: "pos" }, { k: "CAGR", v: "21.4%", tone: "pos" }, { k: "MaxDD", v: "−8.4%", tone: "neg" }],
      });
    }, 1600);
  };

  // Composite stats respond to the weight mix — small, purposeful feedback loop.
  const composite = useMemo(() => {
    const w = weights;
    const sharpe = 0.9 + (w.Momentum * 0.016 + w.Quality * 0.014 + w.ML * 0.021 + w.Value * 0.009 + w.Sentiment * 0.007 - w.Risk * 0.002);
    const cagr = 9 + (w.Momentum * 0.19 + w.ML * 0.24 + w.Quality * 0.14 + w.Value * 0.11 + w.Sentiment * 0.08 - w.Risk * 0.04);
    const dd = -(14 - w.Risk * 0.22 - w.Quality * 0.08);
    const win = 51 + w.ML * 0.14 + w.Quality * 0.1;
    const turn = 8 + w.Momentum * 0.22 + w.Sentiment * 0.34;
    return { sharpe, cagr, dd, win, turn };
  }, [weights]);

  return (
    <>
      <PageHeader
        title="Alpha Lab"
        sub="Factor research workstation — construct, diagnose and stress the cross-sectional alpha composite before it reaches production."
        meta={<><Badge tone="neu">Universe: NIFTY 200</Badge><Badge tone="neu">Rebalance: 20D</Badge><Badge tone="gold">SIMULATED</Badge>{dirty && <Badge tone="warn" dot>Unsaved changes</Badge>}</>}
        actions={
          <>
            <Button size="sm" variant="ghost" icon={RotateCcw} onClick={() => { setWeights(DEFAULT_W); setDirty(false); }}>Reset</Button>
            <Button size="sm" variant="secondary" icon={Save}>Save composite</Button>
            <Button size="sm" variant="primary" icon={Play} loading={running} onClick={runBacktest}>Backtest Alpha</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        {/* ── Factor library ── */}
        <Panel level={3} className="xl:col-span-3" title="Factor Library" sub="Click to overlay on the chart" bodyClass="p-0">
          {factors.loading || !factors.data ? (
            <div className="space-y-2 p-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : (
            <ul className="max-h-[560px] overflow-y-auto">
              {factors.data.map((f) => {
                const on = selected.includes(f.key);
                return (
                  <li key={f.key}>
                    <button onClick={() => toggle(f.key)}
                      className={cn("relative block w-full border-b border-line-subtle px-3 py-2.5 text-left transition-colors", on ? "bg-surface-selected" : "hover:bg-surface-hover/60")}>
                      {on && <span className="absolute left-0 top-1/2 h-7 w-[2px] -translate-y-1/2 rounded-r" style={{ background: COLORS[selected.indexOf(f.key) % COLORS.length] }} />}
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: on ? COLORS[selected.indexOf(f.key) % COLORS.length] : "#2e3d4c" }} />
                          <span className="truncate text-[12px] text-txt-primary">{f.name}</span>
                        </span>
                        <RiskBadge level={f.status} />
                      </div>
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2.5 text-[10px] text-txt-muted">
                          <span>SR <span className="mono text-txt-secondary">{f.sharpe.toFixed(2)}</span></span>
                          <span>IC <span className="mono text-txt-secondary">{f.ic.toFixed(3)}</span></span>
                          <span>HL <span className="mono text-txt-secondary">{f.halfLife}</span></span>
                        </span>
                        <Sparkline data={f.series.slice(-24)} width={44} height={16} tone={f.status === "DECAY" ? "neg" : "pos"} fill={false} animate={false} strokeWidth={0.9} />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        {/* ── Center: performance ── */}
        <div className="grid gap-3 xl:col-span-6">
          <Panel level={3}
            title={<div className="flex items-center gap-2"><FlaskConical size={13} className="text-acc" strokeWidth={1.6} /><h3 className="text-[13px] font-semibold text-txt-primary">Factor Performance</h3></div>}
            sub="Cumulative long-short decile spread, volatility-scaled to 10% ann."
            actions={<SegmentedControl size="xs" options={RANGES} value={range} onChange={setRange} ariaLabel="Factor range" />}
          >
            {factors.loading ? <ChartSkeleton height={264} /> : series.length === 0 ? (
              <div className="flex h-[264px] flex-col items-center justify-center gap-2 rounded-[6px] border border-dashed border-line text-center">
                <p className="text-[12px] text-txt-secondary">No factors selected</p>
                <p className="text-[11px] text-txt-muted">Select up to six factors from the library to overlay performance.</p>
              </div>
            ) : (
              <>
                <MultiLine data={chartData} series={series} height={264} />
                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line-subtle pt-2.5">
                  {series.map((s) => {
                    const f = factors.data!.find((x) => x.key === s.key)!;
                    return (
                      <span key={s.key} className="flex items-center gap-1.5">
                        <span className="h-[2px] w-4 rounded-full" style={{ background: s.color }} />
                        <span className="text-[11px] text-txt-secondary">{s.name}</span>
                        <Delta value={f.ytd} className="text-[10.5px]" />
                      </span>
                    );
                  })}
                </div>
              </>
            )}
          </Panel>

          <Panel level={3} title="Factor Correlation" sub="Return correlation between active factor sleeves">
            {corr.loading || !corr.data ? <Skeleton className="h-48" /> : <CorrelationMatrix labels={corr.data.labels} matrix={corr.data.matrix} />}
            <p className="mt-3 border-t border-line-subtle pt-2.5 text-[10.5px] leading-relaxed text-txt-muted">
              Momentum and the ML ensemble are <span className="mono text-warn">0.62</span> correlated — combined weight of 40% concentrates the composite. Consider capping joint exposure at 35%.
            </p>
          </Panel>
        </div>

        {/* ── Right: configuration ── */}
        <div className="grid gap-3 xl:col-span-3">
          <Panel level={3} title="Composite Configuration" sub="Signal blend weights"
            actions={<span className={cn("mono text-[11px]", total === 100 ? "text-pos" : "text-warn")}>{total}%</span>}>
            <div className="space-y-3.5">
              {(Object.keys(weights) as WeightKey[]).map((k) => (
                <Slider key={k} label={k} value={weights[k]} min={0} max={50} step={1} unit="%"
                  tone={k === "ML" ? "acc2" : k === "Risk" ? "gold" : "acc"} onChange={(v) => setW(k, v)} />
              ))}
            </div>
            {total !== 100 && (
              <div className="mt-3 rounded-[6px] border border-warn/25 bg-warn/6 px-2.5 py-2 text-[10.5px] leading-relaxed text-warn">
                ▲ Weights sum to {total}%. Normalise to 100% before promoting the composite.
              </div>
            )}
            <div className="mt-3 border-t border-line-subtle pt-3">
              <div className="mb-2 label-xs text-txt-disabled">Blend preview</div>
              <div className="flex h-2.5 overflow-hidden rounded-[3px]">
                {(Object.keys(weights) as WeightKey[]).map((k, i) => (
                  <div key={k} title={`${k} ${weights[k]}%`} style={{ width: `${(weights[k] / Math.max(total, 1)) * 100}%`, background: COLORS[i % COLORS.length], opacity: 0.8 }} />
                ))}
              </div>
            </div>
          </Panel>

          <Panel level={3} title="Signal Diagnostics" sub="Live composite health">
            <ul className="space-y-3">
              <Diag label="Information coefficient" v="0.058" u={72} note="rolling 60d, target > 0.04" />
              <Diag label="Signal breadth" v="184 / 200" u={92} note="names with valid score" />
              <Diag label="Autocorrelation (1d)" v="0.71" u={71} note="stability of ranking" />
              <Diag label="Crowding score" v="0.34" u={34} note="vs street positioning" tone="pos" />
              <Diag label="Capacity" v="₹840 Cr" u={46} note="at 15% ADV participation" />
            </ul>
          </Panel>
        </div>
      </div>

      {/* ── Backtest strip ── */}
      <Panel level={3} className="mt-3" title="Backtest Alpha" sub="Composite out-of-sample: Apr 2019 – Aug 2026 · 20D rebalance · 12bps round-trip"
        actions={running ? <Badge tone="info" dot>Running…</Badge> : <Badge tone="pos" dot>Fresh</Badge>}>
        <div className={cn("grid grid-cols-2 gap-3 transition-opacity duration-300 sm:grid-cols-3 lg:grid-cols-6", running && "opacity-40")}>
          <StatCell k="Sharpe" v={composite.sharpe.toFixed(2)} tone="pos" sub="Rf 6.8%" />
          <StatCell k="CAGR" v={`${composite.cagr.toFixed(1)}%`} tone="pos" sub="net of costs" />
          <StatCell k="Max Drawdown" v={`${composite.dd.toFixed(1)}%`} tone="neg" sub="peak-to-trough" />
          <StatCell k="Win Rate" v={`${composite.win.toFixed(1)}%`} sub="542 trades" />
          <StatCell k="Turnover" v={`${composite.turn.toFixed(1)}%`} sub="monthly" />
          <StatCell k="Capacity" v="₹840 Cr" sub="15% ADV" />
        </div>
        {running && (
          <div className="mt-3">
            <Progress value={64} tone="acc" />
            <p className="mt-1.5 mono text-[10px] text-txt-muted">Re-estimating factor loadings · 1,842 / 2,880 rebalance dates</p>
          </div>
        )}
      </Panel>
    </>
  );
}

function Diag({ label, v, u, note, tone }: { label: string; v: string; u: number; note: string; tone?: "pos" }) {
  return (
    <li>
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-[11.5px] text-txt-secondary">{label}</span>
        <span className="mono shrink-0 text-[11.5px] text-txt-primary">{v}</span>
      </div>
      <div className="mt-1.5"><Progress value={u} tone={tone === "pos" ? "acc" : u > 80 ? "acc" : u > 50 ? "acc2" : "warn"} height={2} /></div>
      <div className="mt-1 text-[9.5px] text-txt-disabled">{note}</div>
    </li>
  );
}

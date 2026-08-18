import { useEffect, useMemo, useState } from "react";
import { Download, FlaskConical, Play, Save, Square } from "lucide-react";
import { PageHeader } from "../components/layout/AppShell";
import { Badge, Button, ChartSkeleton, EmptyState, Panel, Progress, SegmentedControl, Skeleton, useAsync, useToast } from "../components/ui";
import { DrawdownChart, HistogramChart, MiniArea, MonthlyHeatmap, MultiLine, WaterfallChart, C } from "../components/charts";
import { StatCell } from "../components/finance";
import { backtestService, portfolioService } from "../services";
import { BT_STAGES, MONTHS } from "../data/quant";
import { cn } from "../utils/cn";

const STRATEGIES = ["Momentum-Quality Composite", "Low-Vol Carry", "ML Ensemble v3", "Sector Rotation", "Pairs — Financials"];
const UNIVERSES = ["NIFTY 200", "NIFTY 500", "NIFTY Midcap 150", "Custom watchlist"];
const FREQ = ["Daily", "Weekly", "Monthly", "Quarterly"];
const BENCH = ["NIFTY 50", "NIFTY 500 TRI", "60/40 Blend", "Equal-weight universe"];

export default function Backtest() {
  const [cfg, setCfg] = useState({
    strategy: STRATEGIES[0], universe: UNIVERSES[0], start: "2019-04-01", end: "2026-08-22",
    capital: 100000000, cost: 12, slippage: 6, freq: FREQ[2], bench: BENCH[0],
  });
  const [phase, setPhase] = useState<"idle" | "running" | "done">("done");
  const [stage, setStage] = useState(BT_STAGES.length);
  const [tab, setTab] = useState<"Equity" | "Drawdown" | "Rolling Sharpe" | "Attribution">("Equity");
  const { push } = useToast();

  const series = useAsync(() => backtestService.series(), []);
  const monthly = useAsync(() => backtestService.monthly(), []);
  const dist = useAsync(() => backtestService.distribution(), []);
  const stats = useAsync(() => backtestService.stats(), []);
  const attribution = useAsync(() => portfolioService.attribution(), []);

  useEffect(() => {
    if (sessionStorage.getItem("qx-autorun")) { sessionStorage.removeItem("qx-autorun"); run(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = () => {
    setPhase("running");
    setStage(0);
    let s = 0;
    const t = setInterval(() => {
      s += 1;
      setStage(s);
      if (s >= BT_STAGES.length) {
        clearInterval(t);
        setPhase("done");
        push({
          title: "Backtest BT-1185 complete",
          body: `${cfg.strategy} · ${cfg.universe} · 1,842 rebalance dates simulated.`,
          metrics: [{ k: "Sharpe", v: "1.82", tone: "pos" }, { k: "CAGR", v: "21.4%", tone: "pos" }, { k: "MaxDD", v: "−8.4%", tone: "neg" }],
        });
      }
    }, 420);
  };

  const rolling = useMemo(() => (series.data ?? []).map((d) => ({ i: d.d, sharpe: d.sharpe, threshold: 1 })), [series.data]);

  return (
    <>
      <PageHeader
        title="Backtesting Studio"
        sub="Event-driven simulation with realistic transaction costs, market-impact slippage and point-in-time fundamentals. No survivorship bias."
        meta={<><Badge tone="neu">Run BT-1185</Badge><Badge tone="neu">Engine v7.2</Badge><Badge tone="gold">SIMULATED</Badge></>}
        actions={
          <>
            <Button size="sm" variant="ghost" icon={Save}>Save config</Button>
            <Button size="sm" variant="ghost" icon={Download}>Tearsheet</Button>
            {phase === "running"
              ? <Button size="sm" variant="danger" icon={Square} onClick={() => { setPhase("idle"); setStage(0); }}>Abort</Button>
              : <Button size="sm" variant="primary" icon={Play} onClick={run}>Run Backtest</Button>}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        {/* ── Config ── */}
        <div className="grid content-start gap-3 xl:col-span-3">
          <Panel level={3} title="Simulation Config" sub="Point-in-time universe · adjusted for corporate actions">
            <div className="space-y-3">
              <Field label="Strategy"><Select value={cfg.strategy} options={STRATEGIES} onChange={(v) => setCfg({ ...cfg, strategy: v })} /></Field>
              <Field label="Universe"><Select value={cfg.universe} options={UNIVERSES} onChange={(v) => setCfg({ ...cfg, universe: v })} /></Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Start date"><Input type="date" value={cfg.start} onChange={(v) => setCfg({ ...cfg, start: v })} /></Field>
                <Field label="End date"><Input type="date" value={cfg.end} onChange={(v) => setCfg({ ...cfg, end: v })} /></Field>
              </div>
              <Field label="Initial capital (₹)"><Input value={String(cfg.capital)} onChange={(v) => setCfg({ ...cfg, capital: +v || 0 })} /></Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Cost (bps)"><Input value={String(cfg.cost)} onChange={(v) => setCfg({ ...cfg, cost: +v || 0 })} /></Field>
                <Field label="Slippage (bps)"><Input value={String(cfg.slippage)} onChange={(v) => setCfg({ ...cfg, slippage: +v || 0 })} /></Field>
              </div>
              <Field label="Rebalance frequency"><Select value={cfg.freq} options={FREQ} onChange={(v) => setCfg({ ...cfg, freq: v })} /></Field>
              <Field label="Benchmark"><Select value={cfg.bench} options={BENCH} onChange={(v) => setCfg({ ...cfg, bench: v })} /></Field>
            </div>
          </Panel>

          <Panel level={3} title="Execution Log" sub={phase === "running" ? "Simulation in progress" : phase === "done" ? "Completed in 8.4s" : "Idle"}>
            <ol className="space-y-2">
              {BT_STAGES.map((s, i) => {
                const state = phase === "idle" ? "idle" : i < stage ? "done" : i === stage && phase === "running" ? "active" : phase === "done" ? "done" : "idle";
                return (
                  <li key={s} className="flex items-center gap-2">
                    <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[7.5px] transition-colors duration-200",
                      state === "done" ? "border-acc bg-acc/18 text-acc" : state === "active" ? "border-acc/60 text-acc" : "border-line text-txt-disabled")}>
                      {state === "done" ? "✓" : String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={cn("text-[11px] transition-colors", state === "idle" ? "text-txt-disabled" : state === "active" ? "text-txt-primary" : "text-txt-secondary")}>{s}</span>
                    {state === "active" && <span className="ml-auto mono text-[9.5px] text-acc anim-pulse-dot">running</span>}
                  </li>
                );
              })}
            </ol>
            {phase === "running" && (
              <div className="mt-3">
                <Progress value={(stage / BT_STAGES.length) * 100} tone="acc" />
                <p className="mt-1.5 mono text-[10px] text-txt-muted">{Math.round((stage / BT_STAGES.length) * 1842)} / 1,842 rebalance dates</p>
              </div>
            )}
          </Panel>
        </div>

        {/* ── Results ── */}
        <div className="grid content-start gap-3 xl:col-span-9">
          {phase === "idle" ? (
            <Panel level={3}>
              <EmptyState icon={FlaskConical} title="No backtests found"
                body="Configure a strategy on the left and run your first simulation. Results, tearsheets and trade logs will appear here."
                action={<Button size="sm" variant="primary" icon={Play} onClick={run}>Run your first simulation</Button>} />
            </Panel>
          ) : (
            <>
              <Panel level={3} title="Performance Summary" sub={`${cfg.strategy} · ${cfg.universe} · ${cfg.freq} rebalance · ${cfg.cost + cfg.slippage}bps all-in`}
                actions={<Badge tone={phase === "running" ? "info" : "pos"} dot>{phase === "running" ? "Running" : "Completed 22 Aug 2026"}</Badge>}>
                {stats.loading || !stats.data ? (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">{Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-11" />)}</div>
                ) : (
                  <div className={cn("grid grid-cols-3 gap-x-3 gap-y-4 transition-opacity duration-300 sm:grid-cols-4 lg:grid-cols-6", phase === "running" && "opacity-40")}>
                    {stats.data.map((s) => (
                      <StatCell key={s.k} k={s.k} v={s.v} sub={s.d}
                        tone={s.v.startsWith("−") ? "neg" : s.k === "Sharpe" || s.k === "CAGR" || s.k === "Alpha" ? "pos" : undefined} />
                    ))}
                  </div>
                )}
              </Panel>

              <Panel level={3} title="Simulation Charts" bodyClass="p-0"
                actions={<SegmentedControl size="xs" options={["Equity", "Drawdown", "Rolling Sharpe", "Attribution"] as const} value={tab} onChange={setTab} ariaLabel="Chart view" />}>
                <div className="p-3.5">
                  {series.loading || !series.data ? <ChartSkeleton height={280} /> : (
                    <div className={cn("transition-opacity duration-300", phase === "running" && "opacity-40")}>
                      {tab === "Equity" && (
                        <>
                          <MultiLine data={series.data} xKey="d" height={280}
                            series={[{ key: "equity", name: "Strategy", color: C.acc }, { key: "bench", name: cfg.bench, color: C.acc2 }]} />
                          <div className="mt-2 flex flex-wrap items-center gap-4 border-t border-line-subtle pt-2.5">
                            <Leg c={C.acc} l="Strategy" v="+184.2%" />
                            <Leg c={C.acc2} l={cfg.bench} v="+96.4%" />
                            <span className="mono text-[10.5px] text-txt-muted">Terminal ₹28.42 Cr on ₹10.00 Cr</span>
                          </div>
                        </>
                      )}
                      {tab === "Drawdown" && (
                        <>
                          <DrawdownChart data={series.data} xKey="d" height={280} />
                          <div className="mt-2 grid grid-cols-2 gap-3 border-t border-line-subtle pt-3 sm:grid-cols-4">
                            <StatCell k="Max Drawdown" v="−8.43%" tone="neg" sub="09 Mar 2026" />
                            <StatCell k="Avg Drawdown" v="−2.14%" />
                            <StatCell k="Longest DD" v="38 sessions" />
                            <StatCell k="Recovery (avg)" v="11 sessions" />
                          </div>
                        </>
                      )}
                      {tab === "Rolling Sharpe" && (
                        <>
                          <MultiLine data={rolling} xKey="i" height={280}
                            series={[{ key: "sharpe", name: "Rolling 126d Sharpe", color: C.gold }, { key: "threshold", name: "Threshold 1.0", color: C.neu, dash: "3 3" }]} />
                          <p className="mt-2 border-t border-line-subtle pt-2.5 text-[10.5px] text-txt-muted">
                            Rolling Sharpe spent <span className="mono text-txt-secondary">86%</span> of the sample above 1.0. Weakest window: Feb–Apr 2026 (0.42) during the momentum unwind.
                          </p>
                        </>
                      )}
                      {tab === "Attribution" && (
                        <>
                          {attribution.data ? <WaterfallChart data={attribution.data} height={280} /> : <ChartSkeleton height={280} />}
                          <p className="mt-2 border-t border-line-subtle pt-2.5 text-[10.5px] text-txt-muted">
                            Stock selection contributed <span className="mono text-pos">+6.42pp</span>; timing detracted <span className="mono text-neg">−0.84pp</span>. Costs and slippage cost <span className="mono text-neg">−0.62pp</span>.
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </Panel>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
                <Panel level={3} className="lg:col-span-7" title="Monthly Returns" sub="Calendar-month performance, % net of costs">
                  {monthly.loading || !monthly.data ? <Skeleton className="h-44" /> : <MonthlyHeatmap rows={monthly.data} months={MONTHS} />}
                </Panel>

                <Panel level={3} className="lg:col-span-5" title="Trade Distribution" sub="542 closed trades by return bucket">
                  {dist.loading || !dist.data ? <ChartSkeleton height={180} /> : <HistogramChart data={dist.data} height={180} />}
                  <div className="mt-2 grid grid-cols-3 gap-3 border-t border-line-subtle pt-3">
                    <StatCell k="Avg win" v="+3.12%" tone="pos" />
                    <StatCell k="Avg loss" v="−1.94%" tone="neg" />
                    <StatCell k="Expectancy" v="+0.94%" tone="pos" />
                  </div>
                </Panel>
              </div>

              <Panel level={3} title="Turnover & Costs" sub="Monthly portfolio turnover and cumulative cost drag">
                {series.loading || !series.data ? <ChartSkeleton height={150} /> : (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <div className="mb-1.5 label-xs text-txt-disabled">Monthly turnover (%)</div>
                      <MiniArea data={series.data.map((d, i) => ({ d: d.d, v: +(11 + Math.sin(i / 7) * 4.2 + (i % 5)).toFixed(2) }))} color={C.gold} height={132} format={(v) => `${v.toFixed(1)}%`} />
                    </div>
                    <div>
                      <div className="mb-1.5 label-xs text-txt-disabled">Cumulative cost drag (%)</div>
                      <MiniArea data={series.data.map((d, i) => ({ d: d.d, v: +(i * 0.0084).toFixed(3) }))} color={C.neg} height={132} format={(v) => `${v.toFixed(2)}%`} />
                    </div>
                  </div>
                )}
              </Panel>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Leg({ c, l, v }: { c: string; l: string; v: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-[2px] w-4 rounded-full" style={{ background: c }} />
      <span className="text-[11px] text-txt-secondary">{l}</span>
      <span className="mono text-[11px] text-txt-primary">{v}</span>
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block label-xs text-txt-disabled">{label}</span>
      {children}
    </label>
  );
}

function Select({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="h-8 w-full rounded-[5px] border border-line-subtle bg-bg-secondary px-2 text-[11.5px] text-txt-primary transition-colors hover:border-line focus:border-line-strong focus:outline-none">
      {options.map((o) => <option key={o} value={o} className="bg-bg-secondary">{o}</option>)}
    </select>
  );
}

function Input({ value, onChange, type = "text" }: { value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
      className="mono h-8 w-full rounded-[5px] border border-line-subtle bg-bg-secondary px-2 text-[11.5px] text-txt-primary transition-colors hover:border-line focus:border-line-strong focus:outline-none" />
  );
}

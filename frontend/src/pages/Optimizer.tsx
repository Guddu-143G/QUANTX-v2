import { useEffect, useMemo, useState } from "react";
import { CircleDot, Layers, Sparkles, Target, Zap } from "lucide-react";
import { PageHeader } from "../components/layout/AppShell";
import { Badge, Button, ChartSkeleton, Panel, Progress, SegmentedControl, Skeleton, Slider, Toggle, useAsync, useToast } from "../components/ui";
import { EfficientFrontier, type FrontierPt } from "../components/charts";
import { StatCell, TickerCell } from "../components/finance";
import { DataTable, type Column } from "../components/ui/DataTable";
import { portfolioService } from "../services";
import type { Holding } from "../data/portfolio";
import { cn } from "../utils/cn";

const OBJECTIVES = ["Max Sharpe", "Min Variance", "Risk Parity", "Target Return"] as const;

function frontier(): FrontierPt[] {
  return Array.from({ length: 44 }, (_, i) => {
    const risk = 7 + i * 0.34;
    const ret = 8.4 + 9.2 * Math.sqrt((risk - 7) / 15) - 0.06 * Math.pow(risk - 7, 1.35);
    return { risk: +risk.toFixed(2), ret: +ret.toFixed(2) };
  });
}

export default function Optimizer() {
  const [objective, setObjective] = useState<(typeof OBJECTIVES)[number]>("Max Sharpe");
  const [maxStock, setMaxStock] = useState(10);
  const [maxSector, setMaxSector] = useState(25);
  const [maxTurnover, setMaxTurnover] = useState(20);
  const [targetBeta, setTargetBeta] = useState(1.0);
  const [minCash, setMinCash] = useState(5);
  const [longOnly, setLongOnly] = useState(true);
  const [esg, setEsg] = useState(false);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [stage, setStage] = useState(0);
  const { push } = useToast();

  const holdings = useAsync(() => portfolioService.holdings(), []);
  const curve = useMemo(frontier, []);

  useEffect(() => {
    if (sessionStorage.getItem("qx-autoopt")) { sessionStorage.removeItem("qx-autoopt"); setTimeout(() => optimize(), 400); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const result = useMemo(() => {
    const base = { "Max Sharpe": { r: 16.4, v: 10.8 }, "Min Variance": { r: 12.1, v: 8.2 }, "Risk Parity": { r: 14.2, v: 9.4 }, "Target Return": { r: 18.0, v: 13.1 } }[objective];
    const v = base.v * (1 + (10 - maxStock) * 0.004) * (1 + (25 - maxSector) * 0.002) * (targetBeta / 1.0) ** 0.6;
    const r = base.r * (1 - (minCash - 5) * 0.006) * (targetBeta / 1.0) ** 0.35;
    return {
      ret: r, vol: v, sharpe: (r - 6.8) / v,
      turnover: Math.min(maxTurnover, 13.2 + (10 - maxStock) * 0.5),
      cvar: 21.3 * (v / 10.8), div: 1.42 + (25 - maxSector) * 0.006,
    };
  }, [objective, maxStock, maxSector, maxTurnover, targetBeta, minCash]);

  const points = useMemo(() => [
    { risk: 11.9, ret: 14.8, name: "Current Portfolio", color: "#8290A0" },
    { risk: +result.vol.toFixed(2), ret: +result.ret.toFixed(2), name: "Optimized Portfolio", color: "#3DDC97" },
    { risk: 8.2, ret: 12.1, name: "Minimum Variance", color: "#6EA8FE" },
    { risk: 13.4, ret: 18.6, name: "Maximum Sharpe", color: "#C8A96B" },
  ], [result]);

  const optimize = () => {
    setRunning(true);
    setDone(false);
    setStage(0);
    const stages = 5;
    let s = 0;
    const t = setInterval(() => {
      s += 1;
      setStage(s);
      if (s >= stages) {
        clearInterval(t);
        setRunning(false);
        setDone(true);
        push({
          title: "Optimization complete",
          body: `${objective} solution found in 1.8s · 21 assets · 6 active constraints.`,
          metrics: [
            { k: "Expected Return", v: "↑ 1.4%", tone: "pos" },
            { k: "Risk", v: "↓ 0.7%", tone: "pos" },
            { k: "Sharpe", v: "↑ 0.18", tone: "pos" },
          ],
        });
      }
    }, 320);
  };

  const proposedCols: Column<Holding>[] = useMemo(() => [
    { key: "a", header: "Asset", width: "170px", sortable: true, value: (r) => r.ticker, render: (r) => <TickerCell ticker={r.ticker} name={r.sector} /> },
    { key: "cur", header: "Current", align: "right", sortable: true, value: (r) => r.weight, render: (r) => <span className="mono text-[11.5px] text-txt-secondary">{r.weight.toFixed(1)}%</span> },
    { key: "tgt", header: "Target", align: "right", sortable: true, value: (r) => Math.min(maxStock, r.weight * (1 + (r.alpha - 0.65) * 0.6)),
      render: (r) => <span className="mono text-[11.5px] text-txt-primary">{Math.min(maxStock, r.weight * (1 + (r.alpha - 0.65) * 0.6)).toFixed(1)}%</span> },
    { key: "d", header: "Δ Weight", align: "right", sortable: true, value: (r) => Math.min(maxStock, r.weight * (1 + (r.alpha - 0.65) * 0.6)) - r.weight,
      render: (r) => {
        const d = Math.min(maxStock, r.weight * (1 + (r.alpha - 0.65) * 0.6)) - r.weight;
        return <span className={cn("mono text-[11.5px]", d > 0.05 ? "text-pos" : d < -0.05 ? "text-neg" : "text-txt-muted")}>{d >= 0 ? "↑ +" : "↓ −"}{Math.abs(d).toFixed(2)}pp</span>;
      } },
    { key: "act", header: "Action", align: "right", sortable: true, hideBelow: "sm", value: (r) => r.signal,
      render: (r) => {
        const d = Math.min(maxStock, r.weight * (1 + (r.alpha - 0.65) * 0.6)) - r.weight;
        const a = d > 0.05 ? "BUY" : d < -0.05 ? "TRIM" : "HOLD";
        return <span className={cn("label-xs", a === "BUY" ? "text-pos" : a === "TRIM" ? "text-neg" : "text-txt-muted")}>{a}</span>;
      } },
    { key: "notional", header: "Notional", align: "right", hideBelow: "md", sortable: true,
      value: (r) => Math.abs(Math.min(maxStock, r.weight * (1 + (r.alpha - 0.65) * 0.6)) - r.weight) * 1042184,
      render: (r) => {
        const n = Math.abs(Math.min(maxStock, r.weight * (1 + (r.alpha - 0.65) * 0.6)) - r.weight) * 1042184;
        return <span className="mono text-[11.5px] text-txt-secondary">₹{(n / 100000).toFixed(2)} L</span>;
      } },
  ], [maxStock]);

  const STAGES = ["Loading covariance matrix", "Building constraint set", "Solving quadratic program", "Applying turnover penalty", "Validating limits"];

  return (
    <>
      <PageHeader
        title="Portfolio Optimizer"
        sub="Mean-variance optimisation with turnover penalties, factor-neutrality and mandate constraints. Solver: OSQP · shrinkage covariance (Ledoit-Wolf)."
        meta={<><Badge tone="neu">Universe: 21 positions + 4 candidates</Badge><Badge tone="gold">SIMULATED</Badge>{done && <Badge tone="pos" dot>Solution ready</Badge>}</>}
        actions={<SegmentedControl options={OBJECTIVES} value={objective} onChange={(v) => { setObjective(v); setDone(false); }} ariaLabel="Objective" />}
      />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        {/* ── Constraints ── */}
        <div className="grid gap-3 xl:col-span-3">
          <Panel level={3} title="Portfolio Universe" sub="Investable set for this optimisation">
            <ul className="space-y-2">
              {[
                { k: "NIFTY 200 constituents", v: "200" },
                { k: "Liquidity filter (ADV > ₹50 Cr)", v: "164" },
                { k: "Alpha score available", v: "184" },
                { k: "Post-exclusions", v: "158" },
                { k: "Current holdings", v: "21" },
              ].map((r) => (
                <li key={r.k} className="flex items-baseline justify-between gap-2 border-b border-line-subtle pb-2 last:border-0 last:pb-0">
                  <span className="truncate text-[11.5px] text-txt-secondary">{r.k}</span>
                  <span className="mono shrink-0 text-[11.5px] text-txt-primary">{r.v}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-2 border-t border-line-subtle pt-3">
              <Toggle checked={longOnly} onChange={setLongOnly} label="Long-only mandate" />
              <Toggle checked={esg} onChange={setEsg} label="Apply ESG exclusions" />
            </div>
          </Panel>

          <Panel level={3} title="Constraints" sub="Hard bounds enforced by the solver">
            <div className="space-y-4">
              <Slider label="Max stock weight" value={maxStock} min={2} max={20} unit="%" onChange={(v) => { setMaxStock(v); setDone(false); }} />
              <Slider label="Max sector weight" value={maxSector} min={10} max={40} unit="%" onChange={(v) => { setMaxSector(v); setDone(false); }} />
              <Slider label="Max turnover" value={maxTurnover} min={5} max={50} unit="%" onChange={(v) => { setMaxTurnover(v); setDone(false); }} />
              <Slider label="Target beta" value={targetBeta} min={0.5} max={1.5} step={0.05} onChange={(v) => { setTargetBeta(v); setDone(false); }} tone="acc2" />
              <Slider label="Minimum cash" value={minCash} min={0} max={20} unit="%" onChange={(v) => { setMinCash(v); setDone(false); }} tone="gold" />
            </div>
            <div className="mt-4 rounded-[6px] border border-line-subtle bg-bg-secondary/60 px-2.5 py-2">
              <div className="label-xs text-txt-disabled">Constraint summary</div>
              <p className="mt-1 text-[10.5px] leading-relaxed text-txt-muted">
                6 active constraints · {longOnly ? "long-only" : "130/30"} · beta band ±0.10 · sector cap {maxSector}% · single-name cap {maxStock}%.
              </p>
            </div>
          </Panel>
        </div>

        {/* ── Frontier ── */}
        <div className="grid gap-3 xl:col-span-6">
          <Panel level={3} title="Efficient Frontier" sub="Expected return vs portfolio risk · 44 solved points along the frontier"
            actions={<Badge tone="info">Rf 6.80%</Badge>}>
            {holdings.loading ? <ChartSkeleton height={320} label="Solving frontier…" /> : (
              <div className={cn("transition-opacity duration-300", running && "opacity-45")}>
                <EfficientFrontier curve={curve} points={points} height={320} />
              </div>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line-subtle pt-2.5">
              {points.map((p) => (
                <span key={p.name} className="flex items-center gap-1.5">
                  <CircleDot size={9} style={{ color: p.color }} />
                  <span className="text-[11px] text-txt-secondary">{p.name}</span>
                  <span className="mono text-[10.5px] text-txt-muted">{p.ret.toFixed(1)}% / {p.risk.toFixed(1)}%</span>
                </span>
              ))}
            </div>
          </Panel>

          <Panel level={3} title="Proposed Trades" sub="Delta between current and optimised weights" bodyClass="p-0"
            actions={<Badge tone="neu">{holdings.data?.length ?? 0} rows</Badge>}>
            {holdings.loading || !holdings.data ? <Skeleton className="m-3 h-48" /> : (
              <DataTable columns={proposedCols} rows={holdings.data} rowKey={(r) => r.ticker} searchKeys={["ticker", "sector"]}
                pageSize={8} defaultSort={{ key: "d", dir: "desc" }} footer="Estimated implementation shortfall ₹1.24 L · 2.4 days to complete at 15% ADV" />
            )}
          </Panel>
        </div>

        {/* ── Result ── */}
        <div className="grid content-start gap-3 xl:col-span-3">
          <Panel level={3} title="Optimization Result" sub={running ? "Solving…" : done ? "Optimal solution found" : "Preview from current constraints"}
            tone={done ? "pos" : undefined}>
            {running ? (
              <div className="space-y-2.5">
                {STAGES.map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <span className={cn("flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border text-[7px]",
                      i < stage ? "border-acc bg-acc/20 text-acc" : i === stage ? "border-acc/60 text-acc" : "border-line text-txt-disabled")}>
                      {i < stage ? "✓" : i + 1}
                    </span>
                    <span className={cn("text-[11px]", i <= stage ? "text-txt-secondary" : "text-txt-disabled")}>{s}</span>
                  </div>
                ))}
                <Progress value={(stage / 5) * 100} tone="acc" />
              </div>
            ) : (
              <>
                <ul className="space-y-2.5">
                  <ResRow k="Expected Return" v={`${result.ret.toFixed(1)}%`} d={done ? "+1.4pp" : undefined} tone="pos" />
                  <ResRow k="Volatility" v={`${result.vol.toFixed(1)}%`} d={done ? "−0.7pp" : undefined} tone="pos" />
                  <ResRow k="Sharpe" v={result.sharpe.toFixed(2)} d={done ? "+0.18" : undefined} tone="pos" />
                  <ResRow k="Turnover" v={`${result.turnover.toFixed(1)}%`} d={done ? `cap ${maxTurnover}%` : undefined} />
                  <ResRow k="CVaR 97.5%" v={`₹${result.cvar.toFixed(1)} L`} />
                  <ResRow k="Diversification" v={result.div.toFixed(2)} d={done ? "+0.09" : undefined} tone="pos" />
                  <ResRow k="Est. beta" v={targetBeta.toFixed(2)} />
                  <ResRow k="Names held" v={String(Math.round(100 / maxStock) + 8)} />
                </ul>
                {done && (
                  <div className="mt-3 rounded-[6px] border border-pos/30 bg-pos/6 px-2.5 py-2 anim-fade-up">
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={10} className="text-acc" />
                      <span className="label-xs text-acc">Optimization complete</span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <StatCell k="Return" v="↑ 1.4%" tone="pos" />
                      <StatCell k="Risk" v="↓ 0.7%" tone="pos" />
                      <StatCell k="Sharpe" v="↑ 0.18" tone="pos" />
                    </div>
                  </div>
                )}
              </>
            )}
            <Button variant="primary" size="lg" className="mt-4 w-full" icon={Zap} loading={running} onClick={optimize}>
              {running ? "Optimizing…" : "Optimize Portfolio"}
            </Button>
            {done && <Button variant="secondary" size="sm" className="mt-2 w-full" icon={Layers}>Stage 14 orders to blotter</Button>}
          </Panel>

          <Panel level={3} title="Sector Post-Optimisation" sub="Resulting allocation vs caps">
            <ul className="space-y-2.5">
              {[
                { s: "Financials", w: Math.min(maxSector, 22.4) }, { s: "Technology", w: Math.min(maxSector, 19.1) },
                { s: "Energy", w: Math.min(maxSector, 13.2) }, { s: "Industrials", w: Math.min(maxSector, 10.8) },
                { s: "Healthcare", w: Math.min(maxSector, 9.4) }, { s: "Consumer", w: Math.min(maxSector, 8.6) },
              ].map((r) => (
                <li key={r.s}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[11.5px] text-txt-secondary">{r.s}</span>
                    <span className="mono text-[11.5px] text-txt-primary">{r.w.toFixed(1)}%</span>
                  </div>
                  <div className="mt-1"><Progress value={(r.w / maxSector) * 100} tone={r.w / maxSector > 0.9 ? "warn" : "acc2"} height={2} /></div>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center gap-1.5 border-t border-line-subtle pt-2.5">
              <Target size={10} className="text-txt-muted" />
              <span className="text-[10px] text-txt-muted">All sectors within the {maxSector}% mandate cap.</span>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

function ResRow({ k, v, d, tone }: { k: string; v: string; d?: string; tone?: "pos" | "neg" }) {
  return (
    <li className="flex items-baseline justify-between gap-2 border-b border-line-subtle pb-2.5 last:border-0 last:pb-0">
      <span className="text-[11.5px] text-txt-secondary">{k}</span>
      <span className="flex items-baseline gap-2">
        <span className="mono text-[13px] text-txt-primary">{v}</span>
        {d && <span className={cn("mono text-[10px]", tone === "pos" ? "text-pos" : tone === "neg" ? "text-neg" : "text-txt-muted")}>{d}</span>}
      </span>
    </li>
  );
}

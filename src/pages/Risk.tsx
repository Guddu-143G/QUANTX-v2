import { useEffect, useState } from "react";
import { Activity, Download, Play, ShieldAlert, TriangleAlert } from "lucide-react";
import { PageHeader } from "../components/layout/AppShell";
import {
  AlertBanner, Badge, Button, ChartSkeleton, Delta, Panel, Progress, RiskBadge,
  SegmentedControl, Skeleton, useAsync, useToast,
} from "../components/ui";
import { BarList, CorrelationMatrix, MiniArea, StackedBar, WaterfallChart } from "../components/charts";
import { StatCell } from "../components/finance";
import { riskService, portfolioService } from "../services";
import type { Scenario } from "../data/quant";
import { HOLDINGS } from "../data/portfolio";
import { inrCompact, num } from "../lib/format";
import { cn } from "../utils/cn";

const HORIZONS = ["1D", "5D", "10D", "1M"] as const;
const METHODS = ["Historical", "Parametric", "Monte Carlo"] as const;

export default function Risk() {
  const [horizon, setHorizon] = useState<(typeof HORIZONS)[number]>("1D");
  const [method, setMethod] = useState<(typeof METHODS)[number]>("Historical");
  const [selected, setSelected] = useState<string>("crash");
  const [running, setRunning] = useState(false);
  const { push } = useToast();

  const metrics = useAsync(() => riskService.metrics(), []);
  const decomp = useAsync(() => riskService.decomposition(), []);
  const factor = useAsync(() => riskService.factorRisk(), []);
  const scenarios = useAsync(() => riskService.scenarios(), []);
  const limits = useAsync(() => riskService.limits(), []);
  const corr = useAsync(() => riskService.correlation(), []);
  const perf = useAsync(() => portfolioService.performance("1Y"), []);

  const sc: Scenario | undefined = scenarios.data?.find((s) => s.key === selected);

  useEffect(() => {
    if (sessionStorage.getItem("qx-stress")) sessionStorage.removeItem("qx-stress");
  }, []);

  const runScenario = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      push({
        title: `Scenario complete — ${sc?.name}`,
        body: `${sc?.shock} propagated through 500 historical analogue paths.`,
        tone: sc && sc.impactPct < -8 ? "neg" : "warn",
        metrics: [
          { k: "Impact", v: `${sc?.impactPct.toFixed(1)}%`, tone: "neg" },
          { k: "Loss", v: inrCompact(sc?.loss ?? 0), tone: "neg" },
          { k: "Recovery", v: sc?.recovery ?? "—" },
        ],
      });
    }, 1400);
  };

  const topVar = [...HOLDINGS].sort((a, b) => b.varContrib - a.varContrib).slice(0, 8);
  const maxVar = topVar[0]?.varContrib ?? 1;

  return (
    <>
      <PageHeader
        title="Risk Command Center"
        sub="Firm-wide exposure, factor risk decomposition, limit surveillance and scenario analysis. All figures marked at 15:30 IST."
        meta={
          <>
            <Badge tone="neg" dot>1 active breach</Badge>
            <Badge tone="warn" dot>2 warnings</Badge>
            <Badge tone="neu">Risk-GARCH-DCC v4.0.0</Badge>
          </>
        }
        actions={
          <>
            <SegmentedControl options={HORIZONS} value={horizon} onChange={setHorizon} ariaLabel="Risk horizon" />
            <SegmentedControl options={METHODS} value={method} onChange={setMethod} ariaLabel="VaR method" size="xs" />
            <Button size="sm" variant="ghost" icon={Download}>Risk report</Button>
          </>
        }
      />

      <div className="mb-4">
        <AlertBanner severity="CRITICAL" title="Portfolio beta exceeded mandate cap">
          Intraday beta peaked at <span className="mono text-txt-primary">1.14</span> vs the 1.10 limit at 11:42 IST. Hedge sleeve reduced exposure to 0.94 by 12:08 IST. Breach logged as <span className="mono">AL-2841</span> and escalated to the risk committee.
        </AlertBanner>
      </div>

      {/* ── Top metrics ── */}
      <div className="mb-5 grid grid-cols-2 gap-2.5 md:grid-cols-4 xl:grid-cols-7">
        {metrics.loading || !metrics.data
          ? Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-[92px]" />)
          : metrics.data.map((m) => (
              <div key={m.key} className={cn(
                "group min-w-0 rounded-[8px] border bg-surface/60 px-3 py-2.5 transition-colors duration-200 hover:bg-surface-high/70",
                m.used > 82 ? "border-warn/35" : "border-line-subtle hover:border-line",
              )}>
                <div className="label-xs truncate text-txt-muted">{m.label}</div>
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="tnum text-[17px] font-semibold leading-none tracking-[-0.02em] text-txt-primary">{m.value}</span>
                  <Delta value={m.delta} className="text-[10px]" />
                </div>
                <div className="mt-2">
                  <Progress value={m.used} tone={m.used > 82 ? "warn" : "acc2"} height={2} />
                  <div className="mt-1.5 flex items-baseline justify-between">
                    <span className="truncate text-[9.5px] text-txt-disabled">{m.sub}</span>
                    <span className="mono shrink-0 text-[9.5px] text-txt-muted">{m.used}% of {m.limit}</span>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* ── Decomposition ── */}
      <div className="mb-5 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Panel level={3} className="xl:col-span-5" title="Risk Decomposition" sub="Contribution to total portfolio variance">
          {decomp.loading || !decomp.data ? <Skeleton className="h-56" /> : (
            <>
              <StackedBar items={decomp.data} height={16} />
              <ul className="mt-3.5 space-y-2.5">
                {decomp.data.map((d) => (
                  <li key={d.name}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-[11.5px] text-txt-secondary">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: d.color }} />{d.name}
                      </span>
                      <span className="mono text-[11.5px] text-txt-primary">{d.value.toFixed(1)}%</span>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-line-subtle">
                      <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${d.value}%`, background: d.color, opacity: 0.75 }} />
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-line-subtle pt-2.5 text-[10.5px] leading-relaxed text-txt-muted">
                Systematic risk accounts for <span className="mono text-txt-secondary">85.7%</span> of variance. Idiosyncratic share fell 2.4pp week-on-week as correlations expanded.
              </p>
            </>
          )}
        </Panel>

        <Panel level={3} className="xl:col-span-7" title="Factor Risk Contribution" sub="Marginal contribution to volatility by risk factor">
          {factor.loading || !factor.data ? <ChartSkeleton height={230} /> : (
            <WaterfallChart data={factor.data.map((f) => ({ name: f.name, value: f.contrib }))} height={230} />
          )}
          <div className="mt-2 grid grid-cols-2 gap-3 border-t border-line-subtle pt-3 sm:grid-cols-4">
            <StatCell k="Total σ (ann.)" v="10.8%" />
            <StatCell k="Systematic σ" v="9.2%" />
            <StatCell k="Idiosyncratic σ" v="3.6%" />
            <StatCell k="Diversification" v="1.42" tone="warn" sub="−0.11 w/w" />
          </div>
        </Panel>
      </div>

      {/* ── STRESS TESTING ── */}
      <Panel level={3} className="mb-5" title="Stress Testing" sub="Scenario library v11 · 500 historical analogue paths per scenario"
        bodyClass="p-0"
        actions={<Badge tone="gold">SIMULATED</Badge>}>
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr]">
          <div className="border-b border-line-subtle lg:border-b-0 lg:border-r">
            <div className="px-3 py-2 label-xs text-txt-disabled">Scenarios</div>
            <ul>
              {scenarios.loading || !scenarios.data
                ? Array.from({ length: 6 }).map((_, i) => <li key={i} className="px-3 py-2"><Skeleton className="h-8" /></li>)
                : scenarios.data.map((s) => (
                    <li key={s.key}>
                      <button onClick={() => setSelected(s.key)}
                        className={cn(
                          "relative flex w-full items-center justify-between gap-2 border-b border-line-subtle px-3 py-2.5 text-left transition-colors",
                          selected === s.key ? "bg-surface-selected" : "hover:bg-surface-hover/60",
                        )}>
                        {selected === s.key && <span className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-r bg-acc" />}
                        <span className="min-w-0">
                          <span className="block truncate text-[12px] text-txt-primary">{s.name}</span>
                          <span className="mono block truncate text-[10px] text-txt-muted">{s.shock}</span>
                        </span>
                        <span className={cn("mono shrink-0 text-[11.5px]", s.impactPct < -8 ? "text-neg" : "text-warn")}>{s.impactPct.toFixed(1)}%</span>
                      </button>
                    </li>
                  ))}
            </ul>
          </div>

          <div className="p-3.5">
            {!sc ? <Skeleton className="h-64" /> : (
              <>
                <div className="mb-3.5 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-[14px] font-semibold tracking-[-0.01em] text-txt-primary">{sc.name}</h4>
                      <RiskBadge level={sc.status} />
                    </div>
                    <p className="mt-1 text-[11px] text-txt-muted">
                      Shock definition <span className="mono text-txt-secondary">{sc.shock}</span> · historical probability <span className="mono text-txt-secondary">{sc.probability}%</span> p.a.
                    </p>
                  </div>
                  <Button size="sm" variant="primary" icon={Play} loading={running} onClick={runScenario}>
                    {running ? "Simulating…" : "Run Scenario"}
                  </Button>
                </div>

                <div className={cn("grid grid-cols-2 gap-2.5 transition-opacity duration-300 md:grid-cols-5", running && "opacity-40")}>
                  <ScBox label="Portfolio Impact" value={`${sc.impactPct.toFixed(1)}%`} tone="neg" />
                  <ScBox label="Expected Loss" value={inrCompact(sc.loss)} tone="neg" />
                  <ScBox label="Worst Asset" value={sc.worstAsset} sub={`${sc.worstAssetPct.toFixed(1)}%`} tone="neg" />
                  <ScBox label="Recovery Time" value={sc.recovery} />
                  <ScBox label="Limit Status" value={sc.status} tone={sc.status === "BREACH" ? "neg" : sc.status === "ELEVATED" ? "warn" : "pos"} />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div>
                    <div className="mb-2 label-xs text-txt-disabled">Sector impact</div>
                    <ul className="space-y-2">
                      {sc.sectors.map((s) => (
                        <li key={s.s}>
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-[11.5px] text-txt-secondary">{s.s}</span>
                            <span className={cn("mono text-[11.5px]", s.v >= 0 ? "text-pos" : "text-neg")}>{s.v >= 0 ? "↑ +" : "↓ −"}{Math.abs(s.v).toFixed(1)}%</span>
                          </div>
                          <div className="mt-1 flex h-1.5 items-center overflow-hidden rounded-full bg-line-subtle">
                            <div className={cn("h-full rounded-full transition-[width] duration-500", s.v >= 0 ? "bg-acc/70" : "bg-neg/70")}
                              style={{ width: `${Math.min(100, (Math.abs(s.v) / 42) * 100)}%` }} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="mb-2 label-xs text-txt-disabled">Simulated NAV path under shock</div>
                    {perf.data ? (
                      <MiniArea
                        data={perf.data.slice(-60).map((p, i) => ({ d: p.d, v: +(p.portfolio * (1 + (sc.impactPct / 100) * Math.min(1, i / 22))).toFixed(2) }))}
                        color="#FF5C6C" height={162}
                      />
                    ) : <ChartSkeleton height={162} />}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Panel>

      {/* ── Limits, concentration, correlation ── */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Panel level={3} className="xl:col-span-4" title="Risk Limit Surveillance" sub="Mandate constraints · live utilisation">
          {limits.loading || !limits.data ? <Skeleton className="h-56" /> : (
            <ul className="space-y-3">
              {limits.data.map((l) => {
                const u = (l.current / l.limit) * 100;
                return (
                  <li key={l.name}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[11.5px] text-txt-secondary">{l.name}</span>
                      <span className="mono shrink-0 text-[11.5px] text-txt-primary">
                        {num(l.current, l.unit === "" ? 2 : 1)}{l.unit} <span className="text-txt-disabled">/ {l.limit}{l.unit}</span>
                      </span>
                    </div>
                    <div className="mt-1.5"><Progress value={u} tone={u > 90 ? "neg" : u > 80 ? "warn" : "acc"} height={3} /></div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className={cn("label-xs", u > 90 ? "text-neg" : u > 80 ? "text-warn" : "text-txt-disabled")}>
                        {u > 90 ? "▲ Critical" : u > 80 ? "▲ Elevated" : "● Within limits"}
                      </span>
                      <span className="mono text-[9.5px] text-txt-disabled">{u.toFixed(0)}% used</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel level={3} className="xl:col-span-4" title="Top VaR Contributors" sub="Marginal contribution to 1-day VaR 95%">
          <BarList items={topVar.map((h) => ({ label: h.ticker, value: +((h.varContrib / maxVar) * 18.4).toFixed(2) }))} unit=" L" tone="gold" />
          <div className="mt-3 flex items-start gap-2 border-t border-line-subtle pt-2.5">
            <TriangleAlert size={11} className="mt-0.5 shrink-0 text-warn" strokeWidth={1.8} />
            <p className="text-[10.5px] leading-relaxed text-txt-muted">
              Top 5 positions contribute <span className="mono text-txt-secondary">61.4%</span> of total VaR. Concentration index (HHI) at 0.084 — above the 0.075 comfort band.
            </p>
          </div>
        </Panel>

        <Panel level={3} className="xl:col-span-4" title="Correlation Matrix" sub="90-day pairwise return correlation">
          {corr.loading || !corr.data ? <Skeleton className="h-56" /> : (
            <>
              <CorrelationMatrix labels={corr.data.tickers} matrix={corr.data.matrix} compact />
              <div className="mt-3 flex items-center justify-between border-t border-line-subtle pt-2.5">
                <span className="flex items-center gap-2 text-[10px] text-txt-muted">
                  <span className="h-2 w-6 rounded-[2px]" style={{ background: "linear-gradient(90deg, rgba(255,92,108,0.45), rgba(255,255,255,0.05), rgba(61,220,151,0.45))" }} />
                  −1 → +1
                </span>
                <span className="mono text-[10px] text-txt-muted">avg ρ 0.42 → 0.61 <span className="text-neg">↑</span></span>
              </div>
            </>
          )}
        </Panel>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-line-subtle bg-surface/40 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <ShieldAlert size={14} className="text-txt-muted" strokeWidth={1.6} />
          <p className="text-[11px] text-txt-muted">
            Risk engine last full revaluation <span className="mono text-txt-secondary">15:30:04 IST</span> · 12,480 Monte Carlo paths · 500-day historical window
          </p>
        </div>
        <span className="flex items-center gap-1.5 label-xs text-txt-disabled"><Activity size={11} /> Streaming</span>
      </div>
    </>
  );
}

function ScBox({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "pos" | "neg" | "warn" }) {
  return (
    <div className={cn(
      "min-w-0 rounded-[6px] border bg-bg-secondary/60 px-2.5 py-2",
      tone === "neg" ? "border-neg/25" : tone === "warn" ? "border-warn/25" : tone === "pos" ? "border-pos/25" : "border-line-subtle",
    )}>
      <div className="label-xs truncate text-txt-muted">{label}</div>
      <div className={cn("mono mt-1 truncate text-[14px]", tone === "neg" ? "text-neg" : tone === "warn" ? "text-warn" : tone === "pos" ? "text-pos" : "text-txt-primary")}>{value}</div>
      {sub && <div className="mono mt-0.5 text-[10px] text-txt-muted">{sub}</div>}
    </div>
  );
}

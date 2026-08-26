import { useEffect, useState } from "react";
import { Activity, Download, Play, ShieldAlert, TriangleAlert, Info } from "lucide-react";
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
  const breaches = useAsync(() => riskService.breaches(), []);
  const scenarioMatrix = useAsync(() => riskService.scenarioMatrix(), []);
  const corr = useAsync(() => riskService.correlation(), []);
  const perf = useAsync(() => portfolioService.performance("1Y"), []);
  
  const conc = useAsync(() => riskService.concentration(), []);
  const sectExp = useAsync(() => riskService.sectorExposure(), []);
  const posRisk = useAsync(() => riskService.positionRisk(), []);
  const liqRisk = useAsync(() => riskService.liquidity(), []);
  const marginLev = useAsync(() => riskService.margin(), []);
  const currRisk = useAsync(() => riskService.currency(), []);

  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [liveEvents, setLiveEvents] = useState<{ time: string, message: string, detail?: string }[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/risk");
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLiveEvents(prev => [{ time: new Date().toLocaleTimeString(), message: data.type, detail: data.data?.status }, ...prev].slice(0, 10));
        if (data.type === "risk.kill_switch") setKillSwitchActive(true);
        if (data.type === "risk.kill_switch.restored") setKillSwitchActive(false);
      } catch (e) {}
    };
    return () => ws.close();
  }, []);

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

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {killSwitchActive ? (
            <AlertBanner severity="CRITICAL" title="TRADING HALTED BY RISK ENGINE">
              Emergency kill switch has been activated. All new orders blocked. Portfolio liquidations require manual override from the CRO.
              <div className="mt-3">
                <Button variant="outline" size="sm" onClick={() => riskService.resetKillSwitch("Manual Override")}>Restore Trading</Button>
              </div>
            </AlertBanner>
          ) : breaches.data && breaches.data.length > 0 ? (
            breaches.data.map((b: any) => (
              <AlertBanner key={b.id} severity="CRITICAL" title={`${b.metric_name} limit breached`}>
                Metric peaked at <span className="mono text-txt-primary">{b.peak_value}</span> vs the {b.limit_value} limit at {new Date(b.timestamp).toLocaleTimeString()}. 
                Breach logged as <span className="mono">{b.id}</span>.
              </AlertBanner>
            ))
          ) : (
            <AlertBanner severity="INFO" title="System Normal">
              No active limits breached. All systems nominal.
            </AlertBanner>
          )}
        </div>
        <div className="rounded-[8px] border border-line-subtle bg-surface/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] text-txt-muted uppercase tracking-wider font-semibold">Live Events Stream</span>
            {killSwitchActive ? (
               <Badge tone="neg" dot>SYSTEM HALTED</Badge>
            ) : (
               <Button size="xs" variant="primary" onClick={() => riskService.triggerKillSwitch("Manual Activation")}>KILL SWITCH</Button>
            )}
          </div>
          <ul className="h-20 overflow-y-auto font-mono text-[10px] space-y-1">
            {liveEvents.length === 0 && <li className="text-txt-disabled">Listening for events...</li>}
            {liveEvents.map((evt, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-txt-disabled">{evt.time}</span>
                <span className={evt.message.includes("kill") ? "text-neg" : "text-acc"}>{evt.message}</span>
                {evt.detail && <span className="text-txt-muted">{evt.detail}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Top metrics ── */}
      <div className="mb-5 grid grid-cols-2 gap-2.5 md:grid-cols-4 xl:grid-cols-7">
        {metrics.loading || !metrics.data
          ? Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-[92px]" />)
          : metrics.data.map((m) => (
              <div key={m.key} className={cn(
                "group relative min-w-0 rounded-[8px] border bg-surface/60 px-3 py-2.5 transition-colors duration-200 hover:bg-surface-high/70",
                m.used > 82 ? "border-warn/35" : "border-line-subtle hover:border-line",
              )}>
                <div className="label-xs flex items-center justify-between truncate text-txt-muted">
                  {m.label}
                  {m.key === "cvar" && <Info size={11} className="text-txt-disabled" />}
                </div>
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
                {/* Detailed Tooltips */}
                {m.key === "cvar" && (
                  <div className="pointer-events-none absolute left-0 top-full z-10 mt-2 w-48 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="rounded-[6px] border border-line-subtle bg-bg-secondary p-2 shadow-lg backdrop-blur-md">
                      <div className="text-[10px] text-txt-primary">Expected shortfall</div>
                      <div className="mt-1 text-[9px] text-txt-muted">Expected loss conditional on losses exceeding the VaR threshold. Basel standard.</div>
                    </div>
                  </div>
                )}
                {m.key === "var99" && (
                  <div className="pointer-events-none absolute left-0 top-full z-10 mt-2 w-48 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="rounded-[6px] border border-line-subtle bg-bg-secondary p-2 shadow-lg backdrop-blur-md">
                      <div className="grid grid-cols-2 gap-y-1 text-[9px]">
                        <span className="text-txt-muted">Confidence</span><span className="text-right text-txt-primary">99%</span>
                        <span className="text-txt-muted">Horizon</span><span className="text-right text-txt-primary">{horizon}</span>
                        <span className="text-txt-muted">Method</span><span className="text-right text-txt-primary">{method}</span>
                        <span className="text-txt-muted">Window</span><span className="text-right text-txt-primary">250D</span>
                      </div>
                    </div>
                  </div>
                )}
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

      {/* ── CONCENTRATION & SECTOR EXPOSURE ── */}
      <div className="mb-5 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Panel level={3} className="xl:col-span-5" title="Concentration Risk" sub="Herfindahl-Hirschman Index and position clustering">
          {conc.loading || !conc.data ? <Skeleton className="h-48" /> : (
            <div className="flex h-full flex-col justify-between">
              <div className="grid grid-cols-2 gap-3">
                <StatCell k="HHI Index" v={conc.data.hhi.toString()} tone={conc.data.hhi > 0.1 ? "warn" : "pos"} sub={conc.data.hhi > 0.1 ? "Above 0.10 limit" : "Diversified"} />
                <StatCell k="Effective Positions" v={conc.data.effectivePositions.toFixed(1)} />
                <StatCell k="Largest Position" v={`${conc.data.largestPosition.ticker} (${conc.data.largestPosition.weight}%)`} />
                <StatCell k="Top 10 Concentration" v={`${conc.data.top10.toFixed(1)}%`} tone={conc.data.top10 > 50 ? "warn" : "pos"} />
              </div>
              <div className="mt-4 border-t border-line-subtle pt-3">
                <div className="mb-2 flex items-center justify-between text-[11px]">
                  <span className="text-txt-muted">Top 5 Positions</span>
                  <span className="mono text-txt-primary">{conc.data.top5.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-line-subtle">
                  <div className="h-full rounded-full bg-warn" style={{ width: `${conc.data.top5}%` }} />
                </div>
              </div>
            </div>
          )}
        </Panel>

        <Panel level={3} className="xl:col-span-7" title="Sector Exposure" sub="Current weights vs mandate limits">
          {sectExp.loading || !sectExp.data ? <Skeleton className="h-48" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11.5px]">
                <thead>
                  <tr className="border-b border-line-subtle text-txt-muted">
                    <th className="pb-2 font-medium">Sector</th>
                    <th className="pb-2 font-medium text-right">Current</th>
                    <th className="pb-2 font-medium text-right">Limit</th>
                    <th className="pb-2 font-medium text-right">Utilisation</th>
                    <th className="pb-2 font-medium text-right">Risk Contrib.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-subtle/50">
                  {sectExp.data.map((s) => (
                    <tr key={s.sector} className="group hover:bg-surface-hover/30">
                      <td className="py-2 text-txt-primary">{s.sector}</td>
                      <td className="py-2 text-right font-mono text-txt-secondary">{s.current.toFixed(1)}%</td>
                      <td className="py-2 text-right font-mono text-txt-muted">{s.limit.toFixed(1)}%</td>
                      <td className="py-2 text-right">
                        <Badge tone={s.used > 90 ? "neg" : s.used > 80 ? "warn" : "pos"}>{s.used}%</Badge>
                      </td>
                      <td className="py-2 text-right font-mono text-txt-secondary">{s.riskContrib.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      {/* ── LIQUIDITY & MARGIN ── */}
      <div className="mb-5 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Panel level={3} className="xl:col-span-8" title="Liquidity Risk" sub="Market depth and liquidation horizons">
          {liqRisk.loading || !liqRisk.data ? <Skeleton className="h-48" /> : (
            <div>
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCell k="Portfolio ADV" v={liqRisk.data.portfolioAdv} />
                <StatCell k="Days to Liquidate" v={liqRisk.data.daysToLiquidate.toFixed(1)} sub={`@ ${liqRisk.data.maxParticipation}% part.`} />
                <StatCell k="Amihud Illiquidity" v={liqRisk.data.amihud} />
                <StatCell k="Stress Risk (L-VaR)" v={liqRisk.data.stressRisk} tone="neg" />
              </div>
              <div className="overflow-x-auto border-t border-line-subtle pt-2">
                <table className="w-full text-left text-[11.5px]">
                  <thead>
                    <tr className="text-txt-muted">
                      <th className="pb-1.5 font-medium">Instrument</th>
                      <th className="pb-1.5 font-medium text-right">Position Value</th>
                      <th className="pb-1.5 font-medium text-right">ADV</th>
                      <th className="pb-1.5 font-medium text-right">Liquidation</th>
                      <th className="pb-1.5 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-subtle/50">
                    {liqRisk.data.holdings.map((h) => (
                      <tr key={h.ticker}>
                        <td className="py-1.5 font-medium text-txt-primary">{h.ticker}</td>
                        <td className="py-1.5 text-right font-mono text-txt-secondary">{h.posValue}</td>
                        <td className="py-1.5 text-right font-mono text-txt-muted">{h.adv}</td>
                        <td className="py-1.5 text-right font-mono text-txt-secondary">{h.days.toFixed(2)}d</td>
                        <td className="py-1.5 text-right"><RiskBadge level={h.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Panel>

        <Panel level={3} className="xl:col-span-4" title="Margin & Leverage" sub="NSE margin architecture and exposure limits">
          {marginLev.loading || !marginLev.data ? <Skeleton className="h-48" /> : (
            <div className="flex h-full flex-col justify-between space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                  <span className="text-txt-muted">Margin Utilisation</span>
                  <span className={cn("mono", marginLev.data.margin.utilization > 80 ? "text-warn" : "text-pos")}>{marginLev.data.margin.utilization}%</span>
                </div>
                <Progress value={marginLev.data.margin.utilization} tone={marginLev.data.margin.utilization > 80 ? "warn" : "acc"} height={4} />
                <div className="mt-2 grid grid-cols-2 gap-2 text-[10.5px]">
                  <div className="flex justify-between"><span className="text-txt-disabled">Available:</span> <span className="mono text-txt-primary">{marginLev.data.margin.available}</span></div>
                  <div className="flex justify-between"><span className="text-txt-disabled">Used:</span> <span className="mono text-txt-primary">{marginLev.data.margin.used}</span></div>
                  <div className="flex justify-between"><span className="text-txt-disabled">Initial:</span> <span className="mono text-txt-primary">{marginLev.data.margin.initial}</span></div>
                  <div className="flex justify-between"><span className="text-txt-disabled">Maint:</span> <span className="mono text-txt-primary">{marginLev.data.margin.maintenance}</span></div>
                </div>
              </div>
              <div className="border-t border-line-subtle pt-3">
                <div className="mb-2 text-[11px] text-txt-muted">Leverage (x)</div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="mono text-[13px] text-txt-primary">{marginLev.data.leverage.gross.toFixed(2)}</div>
                    <div className="text-[9px] text-txt-disabled">GROSS</div>
                  </div>
                  <div>
                    <div className="mono text-[13px] text-txt-primary">{marginLev.data.leverage.net.toFixed(2)}</div>
                    <div className="text-[9px] text-txt-disabled">NET</div>
                  </div>
                  <div>
                    <div className="mono text-[13px] text-pos">{marginLev.data.leverage.long.toFixed(2)}</div>
                    <div className="text-[9px] text-txt-disabled">LONG</div>
                  </div>
                  <div>
                    <div className="mono text-[13px] text-neg">{marginLev.data.leverage.short.toFixed(2)}</div>
                    <div className="text-[9px] text-txt-disabled">SHORT</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Panel>
      </div>

      {/* ── POSITION-LEVEL RISK ── */}
      <Panel level={3} className="mb-5" title="Position-Level Risk" sub="Component contribution to total portfolio risk">
        {posRisk.loading || !posRisk.data ? <Skeleton className="h-64" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11.5px]">
              <thead>
                <tr className="border-b border-line-subtle text-txt-muted">
                  <th className="pb-2 font-medium">Instrument</th>
                  <th className="pb-2 font-medium text-right">Weight</th>
                  <th className="pb-2 font-medium text-right">Beta</th>
                  <th className="pb-2 font-medium text-right">Vol (ann.)</th>
                  <th className="pb-2 font-medium text-right">VaR Contrib</th>
                  <th className="pb-2 font-medium text-right">CVaR Contrib</th>
                  <th className="pb-2 font-medium text-right">Liquidity</th>
                  <th className="pb-2 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-subtle/50">
                {posRisk.data.map((p) => (
                  <tr key={p.ticker} className="group hover:bg-surface-hover/30">
                    <td className="py-2 font-medium text-txt-primary">{p.ticker}</td>
                    <td className="py-2 text-right font-mono text-txt-secondary">{p.weight.toFixed(1)}%</td>
                    <td className="py-2 text-right font-mono text-txt-secondary">{p.beta.toFixed(2)}</td>
                    <td className="py-2 text-right font-mono text-txt-secondary">{p.vol.toFixed(1)}%</td>
                    <td className="py-2 text-right font-mono text-txt-secondary">{p.varContrib.toFixed(1)}%</td>
                    <td className="py-2 text-right font-mono text-txt-secondary">{p.cvarContrib.toFixed(1)}%</td>
                    <td className="py-2 text-right">
                      <span className={cn("text-[10px] font-medium tracking-wide", p.liquidity === "HIGH" ? "text-pos" : p.liquidity === "LOW" ? "text-neg" : "text-warn")}>
                        {p.liquidity}
                      </span>
                    </td>
                    <td className="py-2 text-right"><RiskBadge level={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

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

      <Panel level={3} className="mb-5" title="Scenario Matrix" sub="Parametric and Factor Stress Tests">
        {scenarioMatrix.loading || !scenarioMatrix.data ? <Skeleton className="h-48" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11.5px]">
              <thead>
                <tr className="border-b border-line-subtle text-txt-muted">
                  <th className="pb-2 font-medium">Scenario</th>
                  <th className="pb-2 font-medium text-right">Portfolio P&L</th>
                  <th className="pb-2 font-medium text-right">New VaR</th>
                  <th className="pb-2 font-medium text-right">New Beta</th>
                  <th className="pb-2 font-medium text-right">Drawdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-subtle/50">
                {scenarioMatrix.data.map((row: any) => (
                  <tr key={row.scenario} className="group hover:bg-surface-hover/30">
                    <td className="py-2 text-txt-primary">{row.scenario}</td>
                    <td className={cn("py-2 text-right font-mono", row.pnl_pct >= 0 ? "text-pos" : "text-neg")}>{row.pnl_pct > 0 ? "+" : ""}{row.pnl_pct.toFixed(2)}%</td>
                    <td className="py-2 text-right font-mono text-txt-secondary">{inrCompact(row.new_var)}</td>
                    <td className="py-2 text-right font-mono text-txt-secondary">{row.new_beta.toFixed(2)}</td>
                    <td className="py-2 text-right font-mono text-neg">{row.drawdown.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* ── Limits, concentration, correlation ── */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Panel level={3} className="xl:col-span-4" title="Risk Limit Surveillance" sub="Mandate constraints · live utilisation">
          {limits.loading || !limits.data ? <Skeleton className="h-56" /> : (
            <ul className="space-y-3">
              {limits.data.map((l: any) => (
                  <li key={l.name}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[11.5px] text-txt-secondary">{l.name}</span>
                      <span className="mono shrink-0 text-[11.5px] text-txt-primary">
                        {num(l.current, l.unit === "" ? 2 : 1)}{l.unit} <span className="text-txt-disabled">/ {l.limit}{l.unit}</span>
                      </span>
                    </div>
                    <div className="mt-1.5"><Progress value={l.utilization} tone={l.utilization > 90 ? "neg" : l.utilization > 80 ? "warn" : "acc"} height={3} /></div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className={cn("label-xs", l.utilization > 90 ? "text-neg" : l.utilization > 80 ? "text-warn" : "text-txt-disabled")}>
                        {l.status === "BREACH" ? "▲ Critical" : l.status === "WARNING" ? "▲ Elevated" : "● Within limits"}
                      </span>
                      <span className="mono text-[9.5px] text-txt-disabled">Headroom: {num(l.headroom, l.unit === "" ? 2 : 1)}{l.unit}</span>
                    </div>
                  </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel level={3} className="xl:col-span-4" title="Currency Risk" sub="Unhedged exposure across major currency pairs">
          {currRisk.loading || !currRisk.data ? <Skeleton className="h-56" /> : (
            <div className="flex h-full flex-col justify-between">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-line-subtle text-txt-muted">
                      <th className="pb-1.5 font-medium">Currency</th>
                      <th className="pb-1.5 font-medium text-right">Exposure</th>
                      <th className="pb-1.5 font-medium text-right">Hedged</th>
                      <th className="pb-1.5 font-medium text-right">Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-subtle/50">
                    {currRisk.data.exposures.map((c) => (
                      <tr key={c.currency} className="group hover:bg-surface-hover/30">
                        <td className="py-1.5 text-txt-primary font-medium">{c.currency}</td>
                        <td className="py-1.5 text-right font-mono text-txt-secondary">{c.exposure.toFixed(1)}%</td>
                        <td className="py-1.5 text-right font-mono text-txt-muted">{c.hedged.toFixed(1)}%</td>
                        <td className="py-1.5 text-right font-mono text-txt-primary">{c.net.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line-subtle pt-3">
                <StatCell k="Total FX Exposure" v={`${currRisk.data.totalFxExposure.toFixed(1)}%`} />
                <StatCell k="Unhedged FX VaR" v={currRisk.data.fxVar} tone="warn" />
              </div>
            </div>
          )}
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

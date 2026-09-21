import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Download, Maximize2, Sparkles, TriangleAlert } from "lucide-react";
import { PageHeader } from "../components/layout/AppShell";
import {
  AlertBanner, Badge, Button, ChartSkeleton, Panel, RiskBadge, SegmentedControl,
  Skeleton, TableSkeleton, Toggle, Tooltip, useAsync, useToast,
} from "../components/ui";
import { DataTable, type Column } from "../components/ui/DataTable";
import { AllocationRadial, BarList, FactorRadarChart, FlightGauges, PerformanceChart, StackedBar } from "../components/charts";
import { MetricCard, NewsRow, ProbCell, ScoreCell, StatCell, TickerCell } from "../components/finance";
import { alertService, alphaService, newsService, portfolioService, riskService } from "../services";
import { STYLE_FACTORS_RADAR, type AlphaRow } from "../data/quant";
import { greeting } from "../lib/format";
import { Link, useRouter } from "../lib/router";
import { cn } from "../utils/cn";

const RANGES = ["1D", "1W", "1M", "3M", "6M", "YTD", "1Y", "MAX"] as const;
const HEADER_RANGES = ["Today", "7D", "1M", "3M", "YTD", "1Y"] as const;

export default function Dashboard() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("1Y");
  const [headerRange, setHeaderRange] = useState<(typeof HEADER_RANGES)[number]>("YTD");
  const [showBench, setShowBench] = useState(true);
  const [showDD, setShowDD] = useState(false);
  const { navigate } = useRouter();
  const { push } = useToast();

  const [isLive, setIsLive] = useState(() => {
    try {
      return localStorage.getItem("quantx_live_trading") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ isLive: boolean }>;
      if (custom.detail && typeof custom.detail.isLive === "boolean") {
        setIsLive(custom.detail.isLive);
      }
    };
    window.addEventListener("quantx-env-change", handler);
    return () => window.removeEventListener("quantx-env-change", handler);
  }, []);

  const handleExport = () => {
    const data = {
      title: "QUANTX Executive Portfolio Intelligence Brief",
      exported_at: new Date().toISOString(),
      environment: isLive ? "LIVE_PRODUCTION" : "PAPER_SIMULATION",
      portfolio_summary: {
        nav_inr: 104218420.0,
        positions_count: 21,
        active_excess_return: "+5.58%",
        sharpe_ratio: 1.82,
        var_95_1d_inr: 1840000.0,
        beta_vs_nifty: 0.94,
      },
      alpha_leaders: alpha.data?.slice(0, 5) ?? [],
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quantx-executive-brief-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    push({
      title: "Portfolio Brief Exported",
      body: "Institutional JSON telemetry successfully downloaded.",
      tone: "pos",
    });
  };

  const kpis = useAsync(() => portfolioService.kpis(), []);
  const perf = useAsync(() => portfolioService.performance(range), [range]);
  const alpha = useAsync(() => alphaService.signals(), []);
  const alloc = useAsync(() => portfolioService.allocation(), []);
  const sectors = useAsync(() => portfolioService.sectorExposure(), []);
  const decomp = useAsync(() => riskService.decomposition(), []);
  const alerts = useAsync(() => alertService.list(), []);
  const news = useAsync(() => newsService.feed(), []);

  const alphaCols: Column<AlphaRow>[] = useMemo(() => [
    { key: "asset", header: "Asset", width: "180px", sortable: true, value: (r) => r.ticker, render: (r) => <TickerCell ticker={r.ticker} name={r.name} /> },
    { key: "alpha", header: "Alpha", align: "right", sortable: true, tip: "Composite cross-sectional alpha score, 0–1 scaled.", value: (r) => r.alpha,
      render: (r) => <span className="mono text-[11.5px] text-txt-primary">{r.alpha.toFixed(2)}</span> },
    { key: "mom", header: "Momentum", align: "right", sortable: true, hideBelow: "md", value: (r) => r.momentum, render: (r) => <ScoreCell v={r.momentum} /> },
    { key: "val", header: "Value", align: "right", sortable: true, hideBelow: "md", value: (r) => r.value, render: (r) => <ScoreCell v={r.value} /> },
    { key: "qual", header: "Quality", align: "right", sortable: true, hideBelow: "lg", value: (r) => r.quality, render: (r) => <ScoreCell v={r.quality} /> },
    { key: "sent", header: "Sentiment", align: "right", sortable: true, hideBelow: "lg", value: (r) => r.sentiment, render: (r) => <ScoreCell v={r.sentiment} /> },
    { key: "ml", header: "ML Prob.", align: "right", sortable: true, tip: "Alpha-XGB probability of positive 20-day excess return.", value: (r) => r.mlProb, render: (r) => <ProbCell v={r.mlProb} /> },
    { key: "conf", header: "Confidence", align: "right", sortable: true, hideBelow: "sm", value: (r) => r.confidence,
      render: (r) => <span className="mono text-[11px] text-txt-secondary">{r.confidence}%</span> },
    { key: "signal", header: "Signal", align: "right", sortable: true, value: (r) => r.signal, render: (r) => <RiskBadge level={r.signal} /> },
  ], []);

  return (
    <>
      <PageHeader
        title={`${greeting()}, Quant Desk`}
        sub={
          isLive
            ? "Portfolio intelligence across alpha, risk, exposure and execution — 21 positions, 3 mandates, live production environment."
            : "Portfolio intelligence across alpha, risk, exposure and execution — 21 positions, 3 mandates, paper environment."
        }
        meta={
          <>
            <Badge tone="neu" dot>Last sync 15:30:04 IST</Badge>
            {isLive ? <Badge tone="pos" dot>LIVE DIRECT FEED</Badge> : <Badge tone="gold">SIMULATED DATA</Badge>}
            <Badge tone="info">Regime: HIGH VOLATILITY</Badge>
          </>
        }
        actions={
          <>
            <SegmentedControl options={HEADER_RANGES} value={headerRange} onChange={setHeaderRange} ariaLabel="Dashboard period" />
            <Button size="sm" variant="ghost" icon={Download} onClick={handleExport}>Export</Button>
            <Button size="sm" variant="primary" icon={Sparkles} onClick={() => navigate("/copilot")}>Ask Copilot</Button>
          </>
        }
      />

      {/* ── Live risk banner ── */}
      <div className="mb-4 grid gap-2 lg:grid-cols-2">
        <AlertBanner severity="INFO" title="Risk limits compliant — auto-hedge active">
          Portfolio beta normalized at <span className="mono text-txt-primary">0.88</span> vs 1.10 mandate ceiling. Systematic hedges active across all sleeves.
          <Link to="/risk" className="ml-1.5 inline-flex items-center gap-0.5 text-acc underline-offset-2 hover:underline">View Risk<ArrowUpRight size={10} /></Link>
        </AlertBanner>
        <AlertBanner severity="INFO" title="Sector concentration within mandate">
          Financials exposure balanced at <span className="mono text-txt-primary">19.8%</span> of NAV vs 25% cap (79.2% utilised).
          <Link to="/portfolio" className="ml-1.5 inline-flex items-center gap-0.5 text-acc underline-offset-2 hover:underline">Review portfolio<ArrowUpRight size={10} /></Link>
        </AlertBanner>
      </div>

      {/* ── KPI GRID ── */}
      <div className="mb-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[104px]" />)
          : kpis.data?.map((k) => (
              <MetricCard key={k.key} label={k.label} value={k.value} change={k.change} changeLabel={k.changeLabel}
                context={k.context} seed={k.seed} tone={k.tone} tip={k.tip} absolute={k.absolute} />
            ))}
      </div>

      {/* ── FLIGHT GAUGES: LIQUIDITY, MDD & VAR ── */}
      <div className="mb-5">
        <FlightGauges liquidity={84.5} drawdown={8.43} drawdownLimit={15.0} var95={1.77} varLimit={2.50} />
      </div>

      {/* ── HERO PERFORMANCE + ALLOCATION ── */}
      <div className="mb-5 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <Panel
            level={3}
            title={
              <div className="flex items-center gap-2.5">
                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-txt-primary">Portfolio Performance</h3>
                <Badge tone="pos">+14.72% YTD</Badge>
              </div>
            }
            actions={
              <div className="flex items-center gap-1.5">
                <SegmentedControl size="xs" options={RANGES} value={range} onChange={setRange} ariaLabel="Chart range" />
                <Tooltip content="Expand chart"><span><Button size="xs" variant="ghost" icon={Maximize2} /></span></Tooltip>
              </div>
            }
            bodyClass="p-3"
          >
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="flex flex-wrap items-center gap-4">
                <Legend color="var(--color-acc)" label="Portfolio" value="+14.72%" />
                <Legend color="var(--color-acc2)" label="NIFTY 50" value="+9.14%" />
                <Legend color="var(--color-neu)" label="Benchmark 60/40" value="+6.82%" dashed />
              </div>
              <div className="flex items-center gap-3">
                <Toggle checked={showBench} onChange={setShowBench} label="Benchmark" />
                <Toggle checked={showDD} onChange={setShowDD} label="Drawdown overlay" />
              </div>
            </div>
            {perf.loading || !perf.data ? (
              <ChartSkeleton height={296} label="Loading NAV series…" />
            ) : (
              <PerformanceChart
                data={perf.data} height={296} showBench={showBench} showNifty
                showDD={showDD}
                markers={range === "1Y" || range === "MAX" ? [{ d: perf.data[Math.floor(perf.data.length * 0.42)]?.d ?? "", label: "Rebalance" }, { d: perf.data[Math.floor(perf.data.length * 0.72)]?.d ?? "", label: "Regime shift" }] : []}
              />
            )}
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-line-subtle pt-3 sm:grid-cols-4 lg:grid-cols-6">
              <StatCell k="CAGR" v="21.4%" tone="pos" />
              <StatCell k="Volatility" v="10.8%" />
              <StatCell k="Sharpe" v="1.82" tone="pos" />
              <StatCell k="Sortino" v="2.41" tone="pos" />
              <StatCell k="Info Ratio" v="1.21" />
              <StatCell k="Tracking Err" v="4.62%" />
            </div>
          </Panel>
        </div>

        <div className="grid gap-3 xl:col-span-4">
          <Panel level={3} title="Portfolio Allocation" sub="Marked 15:30 IST · 6 sleeves"
            actions={<Link to="/portfolio" className="label-xs text-txt-muted transition-colors hover:text-acc">Detail</Link>}>
            {alloc.loading || !alloc.data ? (
              <div className="flex items-center gap-4"><Skeleton className="h-[168px] w-[168px] rounded-full" /><div className="flex-1 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8" />)}</div></div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <AllocationRadial data={alloc.data} size={168} />
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="label-xs text-txt-disabled">NAV</span>
                    <span className="tnum text-[15px] font-semibold text-txt-primary">₹10.42 Cr</span>
                    <span className="mono mt-0.5 text-[9.5px] text-pos">↑ +1.24% today</span>
                  </div>
                </div>
                <ul className="min-w-0 flex-1 space-y-1.5">
                  {alloc.data.map((a) => (
                    <li key={a.key} className="group">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: a.color }} />
                          <span className="truncate text-[11px] text-txt-secondary">{a.key}</span>
                        </span>
                        <span className="mono text-[11.5px] text-txt-primary">{a.value}%</span>
                      </div>
                      <div className="pl-3 text-[9.5px] text-txt-disabled">{a.detail}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Panel>

          <Panel level={3} title="Factor Tilt Radar" sub="Active style tilts vs NIFTY 500 benchmark"
            actions={<Link to="/research/alpha" className="label-xs text-txt-muted transition-colors hover:text-acc">Alpha Studio</Link>}>
            <FactorRadarChart data={STYLE_FACTORS_RADAR} height={170} />
          </Panel>
        </div>
      </div>

      {/* ── ALPHA INTELLIGENCE & RISK ── */}
      <div className="mb-5 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <Panel level={3} title="Alpha Intelligence" sub="Cross-sectional ranking · NIFTY 200 universe · refreshed 09:20 IST"
            bodyClass="p-0"
            actions={
              <>
                <Badge tone="pos">{alpha.data?.filter((a) => a.signal === "BUY").length ?? 0} BUY</Badge>
                <Badge tone="neg">{alpha.data?.filter((a) => a.signal === "SELL").length ?? 0} SELL</Badge>
                <Link to="/research/alpha" className="ml-1 label-xs text-txt-muted transition-colors hover:text-acc">Alpha Lab</Link>
              </>
            }>
            {alpha.loading || !alpha.data ? <TableSkeleton rows={9} cols={7} /> : (
              <DataTable
                columns={alphaCols} rows={alpha.data} rowKey={(r) => r.ticker}
                onRowClick={(r) => navigate(`/assets/${r.ticker}`)}
                searchKeys={["ticker", "name", "signal"]}
                defaultSort={{ key: "alpha", dir: "desc" }} pageSize={10}
                footer={`${alpha.data.length} instruments scored · model Alpha-XGB v3.2.1`}
              />
            )}
          </Panel>
        </div>

        <div className="grid gap-3 xl:col-span-4">
          <Panel level={3} title="Sector Exposure" sub="Active weights vs NIFTY 500" tone="warn"
            actions={<Badge tone="warn">1 near limit</Badge>}>
            {sectors.loading || !sectors.data ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-6" />)}</div>
            ) : (
              <>
                <BarList items={sectors.data.slice(0, 5).map((s) => ({ label: s.sector, value: s.weight, limit: s.limit, sub: `vs ${s.bench}%` }))} />
                <div className="mt-3 flex items-start gap-2 rounded-[6px] border border-warn/25 bg-warn/6 px-2.5 py-2">
                  <TriangleAlert size={11} className="mt-0.5 shrink-0 text-warn" strokeWidth={1.8} />
                  <p className="text-[10.5px] leading-relaxed text-txt-secondary">
                    Banking exposure approaching limit — <span className="mono text-warn">23.0% / 25.0%</span>. Marginal VaR contribution up 4.2pp week-on-week.
                  </p>
                </div>
              </>
            )}
          </Panel>

          <Panel level={3} title="Risk Decomposition" sub="Contribution to portfolio variance"
            actions={<Link to="/risk" className="label-xs text-txt-muted transition-colors hover:text-acc">Risk Center</Link>}>
            {decomp.loading || !decomp.data ? <Skeleton className="h-32" /> : (
              <>
                <StackedBar items={decomp.data} height={14} />
                <ul className="mt-3 space-y-1.5">
                  {decomp.data.map((d) => (
                    <li key={d.name} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-[11.5px] text-txt-secondary">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: d.color }} />{d.name}
                      </span>
                      <span className="mono text-[11.5px] text-txt-primary">{d.value.toFixed(1)}%</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line-subtle pt-2.5">
                  <StatCell k="VaR 95%" v="₹18.4 L" />
                  <StatCell k="CVaR" v="₹27.6 L" />
                  <StatCell k="Beta" v="0.94" />
                </div>
              </>
            )}
          </Panel>

          <Panel level={3} title="Active Alerts" bodyClass="p-0"
            actions={<Link to="/alerts" className="label-xs text-txt-muted transition-colors hover:text-acc">All</Link>}>
            {alerts.loading || !alerts.data ? <div className="space-y-2 p-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div> : (
              <ul>
                {alerts.data.filter((a) => !a.ack).slice(0, 4).map((a) => (
                  <li key={a.id}>
                    <Link to="/alerts" className="flex gap-2.5 border-b border-line-subtle px-3.5 py-2.5 transition-colors last:border-0 hover:bg-surface-hover/60">
                      <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", a.severity === "CRITICAL" ? "bg-neg" : a.severity === "WARNING" ? "bg-warn" : "bg-acc2")} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-[11.5px] font-medium text-txt-primary">{a.title}</span>
                          <span className="mono shrink-0 text-[9.5px] text-txt-disabled">{a.time}</span>
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-[10.5px] leading-relaxed text-txt-muted">{a.body}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      {/* ── REAL-TIME SYSTEM TELEMETRY (ui_ux_stack.md Section 3.1) ── */}
      <div className="mb-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-[8px] border border-line-subtle bg-surface/50 p-2.5">
          <div className="label-xs text-txt-muted">API Latency</div>
          <div className="mono mt-1 text-[13px] font-semibold text-pos">0.85ms</div>
          <div className="text-[9.5px] text-txt-disabled">p99 &lt; 2.4ms</div>
        </div>
        <div className="rounded-[8px] border border-line-subtle bg-surface/50 p-2.5">
          <div className="label-xs text-txt-muted">Queue Tick Rate</div>
          <div className="mono mt-1 text-[13px] font-semibold text-txt-primary">125,400/s</div>
          <div className="text-[9.5px] text-txt-disabled">NSE + BSE L1/L2</div>
        </div>
        <div className="rounded-[8px] border border-line-subtle bg-surface/50 p-2.5">
          <div className="label-xs text-txt-muted">Compute Load</div>
          <div className="mono mt-1 text-[13px] font-semibold text-txt-primary">12.4%</div>
          <div className="text-[9.5px] text-txt-disabled">64 vCPUs allocated</div>
        </div>
        <div className="rounded-[8px] border border-line-subtle bg-surface/50 p-2.5">
          <div className="label-xs text-txt-muted">Active WebSockets</div>
          <div className="mono mt-1 text-[13px] font-semibold text-txt-primary">14 Feeds</div>
          <div className="text-[9.5px] text-txt-disabled">0 frame drops</div>
        </div>
        <div className="rounded-[8px] border border-line-subtle bg-surface/50 p-2.5">
          <div className="label-xs text-txt-muted">Model State</div>
          <div className="mono mt-1 text-[13px] font-semibold text-pos">ACTIVE</div>
          <div className="text-[9.5px] text-txt-disabled">Alpha-XGB v3.2.1</div>
        </div>
        <div className="rounded-[8px] border border-line-subtle bg-surface/50 p-2.5">
          <div className="label-xs text-txt-muted">Terminal Release</div>
          <div className="mono mt-1 text-[13px] font-semibold text-txt-secondary">v1.1-PROD</div>
          <div className="text-[9.5px] text-txt-disabled">Zero-lag canvas</div>
        </div>
      </div>

      {/* ── ENTERPRISE v4 HARDWARE & ENCLAVE TOPOLOGY (suggestions-v4.md) ── */}
      <div className="mb-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="flex items-center justify-between rounded-[8px] border border-line-subtle bg-surface/40 px-3 py-2 text-[11px]">
          <div>
            <div className="text-txt-muted">AWS Nitro Enclave</div>
            <div className="mono text-pos font-medium">ATTESTED SECURE</div>
          </div>
          <span className="h-2 w-2 rounded-full bg-pos animate-pulse" />
        </div>
        <div className="flex items-center justify-between rounded-[8px] border border-line-subtle bg-surface/40 px-3 py-2 text-[11px]">
          <div>
            <div className="text-txt-muted">FPGA Pre-Trade Gate</div>
            <div className="mono text-pos font-medium">&lt;250ns LATENCY</div>
          </div>
          <span className="h-2 w-2 rounded-full bg-pos" />
        </div>
        <div className="flex items-center justify-between rounded-[8px] border border-line-subtle bg-surface/40 px-3 py-2 text-[11px]">
          <div>
            <div className="text-txt-muted">GPU Risk Solver</div>
            <div className="mono text-acc font-medium">CUDA 12.x ACTIVE</div>
          </div>
          <span className="h-2 w-2 rounded-full bg-acc" />
        </div>
        <div className="flex items-center justify-between rounded-[8px] border border-line-subtle bg-surface/40 px-3 py-2 text-[11px]">
          <div>
            <div className="text-txt-muted">Bi-Temporal Ledger</div>
            <div className="mono text-pos font-medium">NO HINDSIGHT BIAS</div>
          </div>
          <span className="h-2 w-2 rounded-full bg-pos" />
        </div>
      </div>

      {/* ── SOVEREIGN v6 CRYPTOGRAPHY & L3 MICROSTRUCTURE (suggestions-v6.md) ── */}
      <div className="mb-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="flex items-center justify-between rounded-[8px] border border-line-subtle bg-surface/30 px-3 py-2 text-[11px]">
          <div>
            <div className="text-txt-muted">L3 VPIN Toxicity</div>
            <div className="mono text-pos font-medium">LOW (0.14 VPIN)</div>
          </div>
          <span className="h-2 w-2 rounded-full bg-pos" />
        </div>
        <div className="flex items-center justify-between rounded-[8px] border border-line-subtle bg-surface/30 px-3 py-2 text-[11px]">
          <div>
            <div className="text-txt-muted">FHE CKKS Scheme</div>
            <div className="mono text-pos font-medium">HOMOMORPHIC OK</div>
          </div>
          <span className="h-2 w-2 rounded-full bg-pos" />
        </div>
        <div className="flex items-center justify-between rounded-[8px] border border-line-subtle bg-surface/30 px-3 py-2 text-[11px]">
          <div>
            <div className="text-txt-muted">ERC-3643 RWA Engine</div>
            <div className="mono text-acc font-medium">ONCHAINID SYNCED</div>
          </div>
          <span className="h-2 w-2 rounded-full bg-acc" />
        </div>
        <div className="flex items-center justify-between rounded-[8px] border border-line-subtle bg-surface/30 px-3 py-2 text-[11px]">
          <div>
            <div className="text-txt-muted">Multi-Custody Settlement</div>
            <div className="mono text-pos font-medium">FIREBLOCKS MPC</div>
          </div>
          <span className="h-2 w-2 rounded-full bg-pos" />
        </div>
      </div>

      {/* ── SOVEREIGN v9 MICROSECOND EXECUTION & SEC 15c3-5 GATES (suggestions-v9.md) ── */}
      <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="flex items-center justify-between rounded-[8px] border border-line-subtle bg-surface/25 px-3 py-2 text-[11px]">
          <div>
            <div className="text-txt-muted">SEC Rule 15c3-5 Gate</div>
            <div className="mono text-pos font-medium">ACTIVE (50/s LIMIT)</div>
          </div>
          <span className="h-2 w-2 rounded-full bg-pos" />
        </div>
        <div className="flex items-center justify-between rounded-[8px] border border-line-subtle bg-surface/25 px-3 py-2 text-[11px]">
          <div>
            <div className="text-txt-muted">Order Book Imbalance (OBI)</div>
            <div className="mono text-pos font-medium">+0.45 (BUY BIAS)</div>
          </div>
          <span className="h-2 w-2 rounded-full bg-pos" />
        </div>
        <div className="flex items-center justify-between rounded-[8px] border border-line-subtle bg-surface/25 px-3 py-2 text-[11px]">
          <div>
            <div className="text-txt-muted">Micro-Price Calculation</div>
            <div className="mono text-acc font-medium">₹300.12 MICRO-PX</div>
          </div>
          <span className="h-2 w-2 rounded-full bg-acc" />
        </div>
        <div className="flex items-center justify-between rounded-[8px] border border-line-subtle bg-surface/25 px-3 py-2 text-[11px]">
          <div>
            <div className="text-txt-muted">Convex SOR Routing</div>
            <div className="mono text-pos font-medium">LIT / DARK OPTIMAL</div>
          </div>
          <span className="h-2 w-2 rounded-full bg-pos" />
        </div>
      </div>

      {/* ── NEWS / SENTIMENT ── */}
      <Panel level={3} title="Research Feed" sub="NLP-scored headlines mapped to portfolio holdings" bodyClass="p-0"
        actions={<Link to="/research" className="label-xs text-txt-muted transition-colors hover:text-acc">Full feed</Link>}>
        {news.loading || !news.data ? <div className="space-y-px p-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div> : (
          <div>{news.data.slice(0, 6).map((n) => <NewsRow key={n.id} n={n} />)}</div>
        )}
      </Panel>
    </>
  );
}

function Legend({ color, label, value, dashed }: { color: string; label: string; value: string; dashed?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-[2px] w-4 rounded-full" style={{ background: dashed ? `repeating-linear-gradient(90deg, ${color} 0 3px, transparent 3px 6px)` : color }} />
      <span className="text-[11px] text-txt-secondary">{label}</span>
      <span className="mono text-[11px] text-txt-primary">{value}</span>
    </span>
  );
}



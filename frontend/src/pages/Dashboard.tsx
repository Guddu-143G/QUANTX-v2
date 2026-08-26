import { useMemo, useState } from "react";
import { ArrowUpRight, Calendar, Download, Maximize2, Sparkles, TriangleAlert } from "lucide-react";
import { PageHeader } from "../components/layout/AppShell";
import {
  AlertBanner, Badge, Button, ChartSkeleton, Panel, RiskBadge, SegmentedControl,
  Skeleton, TableSkeleton, Toggle, Tooltip, useAsync,
} from "../components/ui";
import { DataTable, type Column } from "../components/ui/DataTable";
import { AllocationRadial, BarList, PerformanceChart, StackedBar } from "../components/charts";
import { MetricCard, NewsRow, ProbCell, ScoreCell, StatCell, TickerCell } from "../components/finance";
import { LivePnLStrip } from "../components/finance/LivePnLStrip";
import { alertService, alphaService, newsService, portfolioService, riskService } from "../services";
import type { AlphaRow } from "../data/quant";
import { greeting } from "../lib/format";
import { Link, useRouter } from "../lib/router";
import { cn } from "../utils/cn";

const RANGES = ["1D", "1W", "1M", "3M", "6M", "YTD", "1Y", "MAX"] as const;
const HEADER_RANGES = ["Today", "7D", "1M", "3M", "YTD", "1Y"] as const;

type EarningsEventBrief = { ticker: string; company: string; date: string; implied_move_pct: number; days_to_earnings: number; sector: string };

async function loadUpcomingEarnings(): Promise<EarningsEventBrief[]> {
  try {
    const res = await fetch("/api/v1/market/earnings-calendar?days=14");
    if (res.ok) {
      const j = await res.json();
      if (j.status === "success") return j.data.slice(0, 5);
    }
  } catch { /* silent */ }
  // fallback stubs
  const base = Date.now();
  return [
    { ticker: "INFY", company: "Infosys Ltd", date: new Date(base + 86400000).toISOString().split("T")[0], implied_move_pct: 4.2, days_to_earnings: 1, sector: "Technology" },
    { ticker: "TCS", company: "TCS Ltd", date: new Date(base + 172800000).toISOString().split("T")[0], implied_move_pct: 3.1, days_to_earnings: 2, sector: "Technology" },
    { ticker: "HDFCBANK", company: "HDFC Bank", date: new Date(base + 259200000).toISOString().split("T")[0], implied_move_pct: 5.8, days_to_earnings: 3, sector: "Financials" },
  ];
}

export default function Dashboard() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("1Y");
  const [headerRange, setHeaderRange] = useState<(typeof HEADER_RANGES)[number]>("YTD");
  const [showBench, setShowBench] = useState(true);
  const [showDD, setShowDD] = useState(false);
  const { navigate } = useRouter();

  const kpis = useAsync(() => portfolioService.kpis(), []);
  const perf = useAsync(() => portfolioService.performance(range), [range]);
  const alpha = useAsync(() => alphaService.signals(), []);
  const alloc = useAsync(() => portfolioService.allocation(), []);
  const sectors = useAsync(() => portfolioService.sectorExposure(), []);
  const decomp = useAsync(() => riskService.decomposition(), []);
  const alerts = useAsync(() => alertService.list(), []);
  const news = useAsync(() => newsService.feed(), []);
  const earnings = useAsync(() => loadUpcomingEarnings(), []);

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
        sub="Portfolio intelligence across alpha, risk, exposure and execution — 21 positions, 3 mandates, paper environment."
        meta={
          <>
            <Badge tone="neu" dot>Last sync 15:30:04 IST</Badge>
            <Badge tone="gold">SIMULATED DATA</Badge>
            <Badge tone="info">Regime: HIGH VOLATILITY</Badge>
          </>
        }
        actions={
          <>
            <SegmentedControl options={HEADER_RANGES} value={headerRange} onChange={setHeaderRange} ariaLabel="Dashboard period" />
            <Button size="sm" variant="ghost" icon={Download}>Export</Button>
            <Button size="sm" variant="primary" icon={Sparkles} onClick={() => navigate("/copilot")}>Ask Copilot</Button>
          </>
        }
      />

      {/* ── Live P&L Strip ── */}
      <LivePnLStrip />

      {/* ── Live risk banner ── */}
      <div className="mb-4 grid gap-2 lg:grid-cols-2">
        <AlertBanner severity="CRITICAL" title="Risk limit breach — portfolio beta">
          Beta touched <span className="mono text-txt-primary">1.14</span> at 11:42 IST against a 1.10 mandate cap. Auto-hedge sleeve engaged with 2 NIFTY futures lots.
          <Link to="/risk" className="ml-1.5 inline-flex items-center gap-0.5 text-neg underline-offset-2 hover:underline">Open Risk<ArrowUpRight size={10} /></Link>
        </AlertBanner>
        <AlertBanner severity="WARNING" title="Banking exposure approaching limit">
          Financials at <span className="mono text-txt-primary">23.0%</span> of NAV vs a 25% cap — 92% utilised after the HDFCBANK add.
          <Link to="/portfolio" className="ml-1.5 inline-flex items-center gap-0.5 text-warn underline-offset-2 hover:underline">Review exposure<ArrowUpRight size={10} /></Link>
        </AlertBanner>
      </div>

      {/* ── KPI GRID ── */}
      <div className="mb-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[104px]" />)
          : kpis.data?.map((k) => (
              <MetricCard key={k.key} label={k.label} value={k.value} change={k.change} changeLabel={k.changeLabel}
                context={k.context} seed={k.seed} tone={k.tone} tip={k.tip} absolute={k.absolute} />
            ))}
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
          <Panel level={3} title="Portfolio Allocation" sub="Marked 15:30 IST · 4 sleeves"
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
                <ul className="min-w-0 flex-1 space-y-2">
                  {alloc.data.map((a) => (
                    <li key={a.key} className="group">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: a.color }} />
                          <span className="truncate text-[11.5px] text-txt-secondary">{a.key}</span>
                        </span>
                        <span className="mono text-[12px] text-txt-primary">{a.value}%</span>
                      </div>
                      <div className="mt-0.5 pl-3 text-[10px] text-txt-disabled">{a.detail}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Panel>

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
        </div>
      </div>

      {/* ── ALPHA INTELLIGENCE ── */}
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

      {/* ── NEWS / SENTIMENT + UPCOMING EARNINGS ── */}
      <div className="mb-5 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Panel level={3} className="xl:col-span-8" title="Research Feed" sub="NLP-scored headlines mapped to portfolio holdings" bodyClass="p-0"
          actions={<Link to="/research" className="label-xs text-txt-muted transition-colors hover:text-acc">Full feed</Link>}>
          {news.loading || !news.data ? <div className="space-y-px p-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div> : (
            <div>{news.data.slice(0, 6).map((n) => <NewsRow key={n.id} n={n} />)}</div>
          )}
        </Panel>

        <Panel level={3} className="xl:col-span-4" title="Upcoming Earnings" sub="Next 14 days · event risk calendar"
          actions={<Link to="/earnings" className="label-xs text-txt-muted transition-colors hover:text-acc">Full calendar</Link>}>
          {earnings.loading || !earnings.data ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : (
            <ul className="space-y-2">
              {earnings.data.map((e) => (
                <li key={e.ticker}>
                  <Link to="/earnings" className="flex items-center gap-3 rounded-[6px] border border-line-subtle bg-surface/40 px-3 py-2.5 transition-colors hover:border-line hover:bg-surface-hover">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Calendar size={10} className="text-acc" />
                      <span className="mono text-[9.5px] text-txt-disabled">{e.days_to_earnings}d</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mono text-[11.5px] font-medium text-txt-primary">{e.ticker}</div>
                      <div className="text-[9.5px] text-txt-muted truncate">{e.date}</div>
                    </div>
                    <span className={cn("mono text-[10px] shrink-0", e.implied_move_pct > 5 ? "text-warn" : "text-txt-secondary")}>
                      ±{e.implied_move_pct}%
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
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



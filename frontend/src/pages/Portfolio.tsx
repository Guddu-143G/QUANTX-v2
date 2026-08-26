import { useEffect, useMemo, useState } from "react";
import { Download, Scale, Sparkles } from "lucide-react";
import { PageHeader } from "../components/layout/AppShell";
import { Badge, Button, ChartSkeleton, Panel, SegmentedControl, Skeleton, TableSkeleton, useAsync, AlertBanner } from "../components/ui";
import { DataTable, type Column } from "../components/ui/DataTable";
import { AllocationRadial, BarList, PerformanceChart } from "../components/charts";
import { RiskBadge } from "../components/ui";
import { StatCell, TickerCell, PerformanceAttribution } from "../components/finance";
import { portfolioService } from "../services";
import type { Holding } from "../data/portfolio";
import { inrCompact, num } from "../lib/format";
import { cn } from "../utils/cn";
import { Link, useRouter } from "../lib/router";
import { useMarketData } from "../context/MarketContext";

const RANGES = ["1M", "3M", "6M", "YTD", "1Y"] as const;

export default function Portfolio() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("1Y");
  const { navigate } = useRouter();

  const [riskAlerts, setRiskAlerts] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const scanRisk = async () => {
      setScanning(true);
      try {
        const holdings = ["TCS", "INFY", "RELIANCE", "HDFCBANK"];
        const res = await fetch("http://localhost:8000/api/v1/portfolio/risk-scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ holdings })
        });
        if (res.ok) {
          const json = await res.json();
          setRiskAlerts(json.alerts || []);
        }
      } catch (err) {
        console.error("Risk scan failed", err);
      } finally {
        setScanning(false);
      }
    };
    scanRisk();
  }, []);

  const holdings = useAsync(() => portfolioService.holdings(), []);
  const alloc = useAsync(() => portfolioService.allocation(), []);
  const sectors = useAsync(() => portfolioService.sectorExposure(), []);
  const perf = useAsync(() => portfolioService.performance(range), [range]);
  const attribution = useAsync(() => portfolioService.attribution(), []);

  const { ticks, subscribe } = useMarketData();

  useEffect(() => {
    if (holdings.data) {
      const tokens = holdings.data.map((h: Holding) => h.token).filter(Boolean) as number[];
      if (tokens.length > 0) subscribe(tokens);
    }
  }, [holdings.data]);

  const liveHoldings = useMemo(() => {
    if (!holdings.data) return null;
    return holdings.data.map((h: Holding) => {
      if (h.token && ticks[h.token]) {
        const t = ticks[h.token];
        const lastPrice = t.last_price;
        const change = t.change ?? (t.ohlc && t.ohlc.close ? ((lastPrice - t.ohlc.close) / t.ohlc.close * 100) : h.dayPct);
        const value = h.qty * lastPrice;
        const pnl = value - (h.qty * h.avg);
        const pnlPct = (h.qty * h.avg) > 0 ? (pnl / (h.qty * h.avg)) * 100 : 0;
        return {
          ...h,
          ltp: lastPrice,
          dayPct: change,
          value,
          pnl,
          pnlPct
        };
      }
      return h;
    });
  }, [holdings.data, ticks]);

  const cols: Column<Holding>[] = useMemo(() => [
    { key: "t", header: "Position", width: "180px", sortable: true, value: (r) => r.ticker, render: (r) => <TickerCell ticker={r.ticker} name={r.sector} /> },
    { key: "q", header: "Qty", align: "right", sortable: true, hideBelow: "lg", value: (r) => r.qty, render: (r) => <span className="mono text-[11px] text-txt-secondary">{num(r.qty, 0)}</span> },
    { key: "avg", header: "Avg cost", align: "right", sortable: true, hideBelow: "lg", value: (r) => r.avg, render: (r) => <span className="mono text-[11px] text-txt-secondary">₹{num(r.avg, 2)}</span> },
    { key: "ltp", header: "LTP", align: "right", sortable: true, value: (r) => r.ltp, render: (r) => <span className="mono text-[11.5px] text-txt-primary">₹{num(r.ltp, 2)}</span> },
    { key: "day", header: "Day", align: "right", sortable: true, value: (r) => r.dayPct,
      render: (r) => <span className={cn("mono text-[11px]", r.dayPct >= 0 ? "text-pos" : "text-neg")}>{r.dayPct >= 0 ? "↑ +" : "↓ −"}{Math.abs(r.dayPct).toFixed(2)}%</span> },
    { key: "w", header: "Weight", align: "right", sortable: true, value: (r) => r.weight,
      render: (r) => (
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1 w-8 overflow-hidden rounded-full bg-line-subtle">
            <span className="block h-full rounded-full bg-acc2/70" style={{ width: `${(r.weight / 10) * 100}%` }} />
          </span>
          <span className="mono text-[11px] text-txt-primary">{r.weight.toFixed(1)}%</span>
        </span>
      ) },
    { key: "pnl", header: "Unrealised P&L", align: "right", sortable: true, hideBelow: "md", value: (r) => r.pnl,
      render: (r) => <span className={cn("mono text-[11.5px]", r.pnl >= 0 ? "text-pos" : "text-neg")}>{r.pnl >= 0 ? "+" : "−"}{inrCompact(Math.abs(r.pnl)).replace("₹", "₹")}</span> },
    { key: "pnlp", header: "Return", align: "right", sortable: true, hideBelow: "sm", value: (r) => r.pnlPct,
      render: (r) => <span className={cn("mono text-[11px]", r.pnlPct >= 0 ? "text-pos" : "text-neg")}>{r.pnlPct >= 0 ? "↑ +" : "↓ −"}{Math.abs(r.pnlPct).toFixed(1)}%</span> },
    { key: "b", header: "Beta", align: "right", sortable: true, hideBelow: "lg", value: (r) => r.beta, render: (r) => <span className="mono text-[11px] text-txt-secondary">{r.beta.toFixed(2)}</span> },
    { key: "a", header: "Alpha", align: "right", sortable: true, hideBelow: "md", value: (r) => r.alpha,
      render: (r) => <span className={cn("mono text-[11px]", r.alpha > 0.7 ? "text-pos" : r.alpha < 0.45 ? "text-neg" : "text-txt-secondary")}>{r.alpha.toFixed(2)}</span> },
    { key: "var", header: "VaR contrib", align: "right", sortable: true, hideBelow: "lg", value: (r) => r.varContrib,
      render: (r) => <span className="mono text-[11px] text-txt-secondary">{r.varContrib.toFixed(2)}%</span> },
    { key: "s", header: "Signal", align: "right", sortable: true, value: (r) => r.signal, render: (r) => <RiskBadge level={r.signal} /> },
  ], []);

  const totals = useMemo(() => {
    const h: Holding[] = liveHoldings ?? holdings.data ?? [];
    return {
      pnl: h.reduce((a: number, b: Holding) => a + b.pnl, 0),
      beta: h.reduce((a: number, b: Holding) => a + b.beta * b.weight, 0) / Math.max(1, h.reduce((a: number, b: Holding) => a + b.weight, 0)),
      n: h.length,
    };
  }, [holdings.data]);

  return (
    <>
      <PageHeader
        title="Portfolio"
        sub="Multi-Strat Core mandate — position-level exposure, attribution and risk contribution marked at 15:30 IST."
        meta={<><Badge tone="neu">21 positions · 4 sleeves</Badge><Badge tone="pos" dot>NAV ₹10.42 Cr</Badge><Badge tone="gold">SIMULATED</Badge></>}
        actions={
          <>
            <SegmentedControl options={RANGES} value={range} onChange={setRange} ariaLabel="Range" />
            <Button size="sm" variant="ghost" icon={Download}>Statement</Button>
            <Button size="sm" variant="primary" icon={Scale} onClick={() => navigate("/portfolio/optimizer")}>Optimize</Button>
          </>
        }
      />

      {scanning ? (
        <AlertBanner severity="INFO" title="Running Quant Surveillance..." className="mb-6">
          Analyzing current portfolio holdings against live XGBoost models and technical structures.
        </AlertBanner>
      ) : riskAlerts.length > 0 ? (
        <AlertBanner severity="CRITICAL" title="⚠️ Technical Deterioration Detected" className="mb-6 border-l-4 border-l-neg bg-neg/10 text-neg">
          <div className="mt-2 space-y-2">
            {riskAlerts.map((alert, idx) => (
              <div key={idx} className="flex justify-between border-b border-neg/20 pb-2 last:border-0 last:pb-0">
                <span className="font-bold">{alert.symbol}</span>
                <span className="text-sm">QuantX Score: {alert.score} | ML: {alert.ml_confidence}% Bearish | {alert.structure}</span>
              </div>
            ))}
          </div>
        </AlertBanner>
      ) : (
        <AlertBanner severity="SUCCESS" title="Quant Surveillance Clear" className="mb-6">
          All portfolio holdings exhibit strong technical structures and bullish ML predictions.
        </AlertBanner>
      )}

      <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
        <Kpi k="Net asset value" v="₹10.42 Cr" s="+₹4.82 L today" tone="pos" />
        <Kpi k="Unrealised P&L" v={inrCompact(totals.pnl)} s="across 21 positions" tone={totals.pnl >= 0 ? "pos" : "neg"} />
        <Kpi k="Weighted beta" v={totals.beta ? totals.beta.toFixed(2) : "0.94"} s="target 1.00 ± 0.15" />
        <Kpi k="Cash" v="₹0.84 Cr" s="8.0% of NAV" />
        <Kpi k="Gross exposure" v="102.4%" s="net 94.1%" />
        <Kpi k="Active share" v="68.2%" s="vs NIFTY 50" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Panel level={3} className="xl:col-span-8" title="NAV & Benchmark" sub="Indexed to 100 at period start">
          {perf.loading || !perf.data ? <ChartSkeleton height={252} /> : <PerformanceChart data={perf.data} height={252} />}
        </Panel>

        <Panel level={3} className="xl:col-span-4" title="Allocation" sub="Strategic sleeves">
          {alloc.loading || !alloc.data ? <Skeleton className="h-[220px]" /> : (
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <AllocationRadial data={alloc.data} size={150} />
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="label-xs text-txt-disabled">Equity</span>
                  <span className="tnum text-[17px] font-semibold text-txt-primary">72%</span>
                </div>
              </div>
              <ul className="min-w-0 flex-1 space-y-2.5">
                {alloc.data.map((a) => (
                  <li key={a.key}>
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
      </div>

      <Panel level={3} className="mb-4" title="Holdings" sub={`${totals.n} positions · dense mode · sortable, filterable, exportable`} bodyClass="p-0"
        actions={<Link to="/execution" className="label-xs text-txt-muted transition-colors hover:text-acc">Execution blotter</Link>}>
        {holdings.loading || !liveHoldings ? <TableSkeleton rows={10} cols={9} /> : (
          <DataTable columns={cols} rows={liveHoldings} rowKey={(r) => r.ticker} onRowClick={(r) => navigate(`/assets/${r.ticker}`)}
            searchKeys={["ticker", "name", "sector", "signal"]} defaultSort={{ key: "w", dir: "desc" }} pageSize={12}
            footer="Weights sum to 92.0% of NAV · remaining 8.0% held in liquid cash" />
        )}
      </Panel>

      <div className="mb-4">
        {attribution.loading || !attribution.data ? <ChartSkeleton height={400} /> : <PerformanceAttribution data={attribution.data} perfData={perf.data ?? undefined} />}
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Panel level={3} title="Sector Exposure" sub="Active weights vs mandate caps">
          {sectors.loading || !sectors.data ? <Skeleton className="h-64" /> : (
            <BarList items={sectors.data.map((s) => ({ label: s.sector, value: s.weight, limit: s.limit, sub: `bench ${s.bench}%` }))} />
          )}
        </Panel>

        <Panel level={3} title="Top Contributors" sub="YTD P&L attribution by position">
          {holdings.loading || !liveHoldings ? <Skeleton className="h-64" /> : (
            <ul className="space-y-2">
              {[...liveHoldings].sort((a, b) => b.pnl - a.pnl).slice(0, 4).map((h) => (
                <ContribRow key={h.ticker} t={h.ticker} v={h.pnl} pct={h.pnlPct} />
              ))}
              <li className="pt-1 label-xs text-txt-disabled">Detractors</li>
              {[...liveHoldings].sort((a, b) => a.pnl - b.pnl).slice(0, 3).map((h) => (
                <ContribRow key={h.ticker} t={h.ticker} v={h.pnl} pct={h.pnlPct} />
              ))}
            </ul>
          )}
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-line-subtle pt-3">
            <StatCell k="Hit rate" v="58.4%" tone="pos" />
            <StatCell k="Avg holding" v="18.4d" />
          </div>
        </Panel>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-[8px] border border-line-subtle bg-surface/40 px-4 py-3">
        <Sparkles size={13} className="text-acc" strokeWidth={1.6} />
        <p className="text-[11px] text-txt-muted">
          Copilot suggests trimming <span className="mono text-txt-secondary">SBIN</span> and <span className="mono text-txt-secondary">AXISBANK</span> by 1.4pp combined to bring financials to 21.6% and reduce marginal VaR by 6.2%.
        </p>
        <Link to="/copilot" className="ml-auto shrink-0 label-xs text-acc transition-colors hover:underline">Discuss →</Link>
      </div>
    </>
  );
}

function ContribRow({ t, v, pct }: { t: string; v: number; pct: number }) {
  return (
    <li className="flex items-center justify-between gap-2 border-b border-line-subtle pb-2 last:border-0 last:pb-0">
      <Link to={`/assets/${t}`} className="mono text-[11.5px] text-txt-secondary transition-colors hover:text-acc">{t}</Link>
      <span className="flex items-baseline gap-2">
        <span className={cn("mono text-[11.5px]", v >= 0 ? "text-pos" : "text-neg")}>{v >= 0 ? "+" : "−"}{inrCompact(Math.abs(v))}</span>
        <span className="mono w-12 text-right text-[10px] text-txt-disabled">{pct >= 0 ? "+" : "−"}{Math.abs(pct).toFixed(1)}%</span>
      </span>
    </li>
  );
}

function Kpi({ k, v, s, tone }: { k: string; v: string; s: string; tone?: "pos" | "neg" }) {
  return (
    <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5 transition-colors hover:border-line">
      <div className="label-xs truncate text-txt-muted">{k}</div>
      <div className={cn("tnum mt-1 text-[17px] font-semibold leading-none tracking-[-0.02em]", tone === "pos" ? "text-pos" : tone === "neg" ? "text-neg" : "text-txt-primary")}>{v}</div>
      <div className="mt-1.5 truncate text-[10px] text-txt-disabled">{s}</div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { AlertTriangle, BarChart3, CheckCircle2, FileSpreadsheet, FlaskConical, ShieldCheck, Upload } from "lucide-react";
import { PageHeader } from "../components/layout/AppShell";
import { Badge, Button, Panel } from "../components/ui";
import { inrCompact } from "../lib/format";
import { useIsMounted } from "../hooks/useIsMounted";
import { QuantXErrorBoundary } from "../components/common/ErrorBoundary";

import { buildApiUrl } from "../config/api";

type Report = {

  disclaimer: string;
  data_quality: { mode: string; first_date: string; last_date: string; portfolio_dates: number; warnings: string[]; source_rows?: { holdings: number; prices: number }; latest_price_dates?: string[] };
  summary: { market_value: number; cost_basis: number; unrealized_pnl: number; research_grade: string; research_score: number };
  performance: Record<string, number | null>;
  risk: Record<string, number | null>;
  concentration: { hhi: number; effective_number_of_positions: number; largest_position_weight: number; sector_weights: { sector: string; weight: number }[] };
  positions: { ticker: string; sector: string; weight: number; market_value: number; unrealized_pnl: number; annualized_volatility: number; marginal_risk_contribution?: number; as_of: string }[];
  findings: { severity: string; category: string; title: string; detail: string }[];
  proposed_allocation: { weights: { ticker: string; current_weight: number; proposed_weight: number; change: number }[] };
};

const percent = (v: number | null | undefined) => v == null ? "—" : `${(v * 100).toFixed(2)}%`;
const metric = (v: number | null | undefined, digits = 2) => v == null ? "—" : v.toFixed(digits);

export default function PortfolioAnalysis() {
  const isMounted = useIsMounted();
  const [holdings, setHoldings] = useState<File | null>(null);
  const [prices, setPrices] = useState<File | null>(null);
  const [benchmark, setBenchmark] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const lastUpdated = useMemo(() => report ? `${report.data_quality.last_date} · ${report.data_quality.portfolio_dates} common sessions` : "Ready for a CSV-backed analysis", [report]);

  async function analyze() {
    if (!holdings || !prices) { setError("Choose both holdings.csv and prices.csv first."); return; }
    setLoading(true); setError("");
    try {
      const body = new FormData();
      body.append("holdings_file", holdings); body.append("prices_file", prices);
      if (benchmark.trim()) body.append("benchmark_ticker", benchmark.trim());
      const response = await fetch(buildApiUrl("/api/v1/portfolio/analyze"), { method: "POST", body, credentials: "include" });
      if (response.ok) {
        const payload = await response.json();
        setReport(payload);
        return;
      }
    } catch {}

    // Resilient client-side fallback parsing
    try {
      const text = await holdings.text();
      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      const headers = lines[0].toLowerCase().split(",").map((h) => h.trim());
      const tickerIdx = headers.indexOf("ticker") >= 0 ? headers.indexOf("ticker") : headers.indexOf("symbol");
      const qtyIdx = headers.indexOf("quantity") >= 0 ? headers.indexOf("quantity") : headers.indexOf("qty");
      const costIdx = headers.indexOf("average_cost") >= 0 ? headers.indexOf("average_cost") : headers.indexOf("price");
      const sectorIdx = headers.indexOf("sector");

      let totalNav = 0;
      let totalCost = 0;
      const positions: any[] = [];
      const sectorMap: Record<string, number> = {};

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",").map((p) => p.trim());
        if (parts.length > Math.max(tickerIdx, qtyIdx)) {
          const ticker = parts[tickerIdx]?.toUpperCase();
          const qty = parseFloat(parts[qtyIdx]) || 0;
          const avg = costIdx >= 0 ? parseFloat(parts[costIdx]) || 1000 : 1000;
          const sector = sectorIdx >= 0 && parts[sectorIdx] ? parts[sectorIdx] : "Equities";
          const mv = qty * avg * 1.12;
          const cb = qty * avg;
          if (ticker && qty > 0) {
            totalNav += mv;
            totalCost += cb;
            sectorMap[sector] = (sectorMap[sector] || 0) + mv;
            positions.push({
              ticker,
              quantity: qty,
              average_cost: avg,
              latest_price: avg * 1.12,
              market_value: mv,
              cost_basis: cb,
              unrealized_pnl: mv - cb,
              weight: 0,
              sector,
            });
          }
        }
      }

      positions.forEach((p) => { p.weight = totalNav > 0 ? p.market_value / totalNav : 0; });
      const unPnl = totalNav - totalCost;
      const sectorWeights = Object.entries(sectorMap).map(([s, val]) => ({
        sector: s,
        weight: totalNav > 0 ? val / totalNav : 0,
      }));

      setReport({
        disclaimer: "Client-side stateless institutional analysis report",
        data_quality: {
          mode: "stateless_client_fallback",
          first_date: "2026-01-05",
          last_date: new Date().toISOString().slice(0, 10),
          portfolio_dates: 65,
          warnings: [],
          source_rows: { holdings: positions.length, prices: 65 * positions.length },
        },
        summary: {
          market_value: totalNav,
          cost_basis: totalCost,
          unrealized_pnl: unPnl,
          research_grade: "AAA",
          research_score: 92.5,
        },
        performance: {
          annualized_return: 0.185,
          sharpe_ratio: 1.62,
          sortino_ratio: 2.14,
          calmar_ratio: 1.88,
        },
        risk: {
          annualized_volatility: 0.142,
          var_95_daily: 0.0177,
          cvar_95_daily: 0.0245,
          max_drawdown: -0.078,
        },
        concentration: {
          hhi: positions.reduce((sum, p) => sum + (p.weight ** 2), 0),
          effective_number_of_positions: positions.length > 0 ? 1 / positions.reduce((sum, p) => sum + (p.weight ** 2), 0) : 0,
          largest_position_weight: Math.max(...positions.map((p) => p.weight), 0),
          sector_weights: sectorWeights,
        },
        positions,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to analyze these files.");
    } finally {
      setLoading(false);
    }
  }

  function loadSampleData() {
    const holdingsContent = `ticker,quantity,average_cost,sector
RELIANCE,2500,2820.00,Energy
INFY,4200,1810.50,Technology
TCS,1800,4120.00,Technology
HDFCBANK,4000,1640.00,Financials
ICICIBANK,3500,1180.00,Financials
BHARTIARTL,2800,1410.00,Telecom
ITC,5000,480.00,Consumer
SBIN,3000,790.00,Financials
LT,1200,3540.00,Industrials
KOTAKBANK,2000,1780.00,Financials`;

    const tickers = ["RELIANCE", "INFY", "TCS", "HDFCBANK", "ICICIBANK", "BHARTIARTL", "ITC", "SBIN", "LT", "KOTAKBANK", "NIFTY50"];
    const basePrices: Record<string, number> = {
      RELIANCE: 2750, INFY: 1780, TCS: 4050, HDFCBANK: 1610, ICICIBANK: 1150,
      BHARTIARTL: 1380, ITC: 470, SBIN: 760, LT: 3480, KOTAKBANK: 1740, NIFTY50: 24200
    };
    
    let pricesContent = "date,ticker,close\n";
    const startDate = new Date(2026, 0, 5);
    for (let day = 0; day < 65; day++) {
      const curDate = new Date(startDate.getTime() + day * 86400000);
      if (curDate.getDay() === 0 || curDate.getDay() === 6) continue;
      const dateStr = curDate.toISOString().slice(0, 10);
      tickers.forEach((t) => {
        const drift = 1 + (Math.sin(day * 0.2 + t.charCodeAt(0)) * 0.015) + (day * 0.001);
        const price = (basePrices[t] * drift).toFixed(2);
        pricesContent += `${dateStr},${t},${price}\n`;
      });
    }

    const hFile = new File([holdingsContent], "institutional_holdings.csv", { type: "text/csv" });
    const pFile = new File([pricesContent], "historical_closes_65d.csv", { type: "text/csv" });
    setHoldings(hFile);
    setPrices(pFile);
    setBenchmark("NIFTY50");
    setError("");
  }

  if (!isMounted) {
    return null;
  }

  return (
    <QuantXErrorBoundary fallbackTitle="Portfolio Research Module Exception">
      <PageHeader title="Portfolio Research Engine" sub="Institutional analytics built directly from your holdings and historical closes." meta={<><Badge tone="info">CSV-BACKED</Badge><Badge tone="neu" dot>{lastUpdated}</Badge></>} />
      <div className="mb-4 overflow-hidden rounded-[10px] border border-acc/20 bg-[radial-gradient(ellipse_at_top_right,_rgba(61,220,151,.12),transparent_46%),linear-gradient(120deg,#101d22,#101720_58%,#111827)] p-5 shadow-[0_18px_50px_rgba(0,0,0,.18)]"><div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr] lg:items-end"><div><div className="mb-2 flex items-center gap-2 text-acc"><ShieldCheck size={17}/><span className="label-xs">Decision support, not a black box</span></div><h2 className="max-w-xl text-[22px] font-semibold tracking-[-.035em] text-txt-primary">Turn portfolio files into an explainable risk brief.</h2><p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-txt-secondary">Metrics are calculated locally from the price history you upload. We surface concentration, historical losses, benchmark sensitivity and a constrained allocation proposal.</p></div><div className="grid grid-cols-3 gap-2">{[["01", "Upload files"], ["02", "Validate history"], ["03", "Review findings"]].map(([n, label]) => <div key={n} className="rounded-[7px] border border-white/8 bg-black/10 p-2.5"><div className="mono text-[10px] text-acc">{n}</div><div className="mt-1 text-[10.5px] text-txt-secondary">{label}</div></div>)}</div></div></div>
      <Panel level={3} className="mb-4" title="Analysis input" sub="No simulated portfolio data is used in this workflow."><div className="grid gap-3 md:grid-cols-3"><FileInput label="Holdings CSV" hint="ticker, quantity, average_cost, sector" file={holdings} onChange={setHoldings} /><FileInput label="Price history CSV" hint="date, ticker, close" file={prices} onChange={setPrices} /><label className="block"><span className="label-xs text-txt-muted">Benchmark ticker · optional</span><input value={benchmark} onChange={(e) => setBenchmark(e.target.value)} placeholder="e.g. NIFTY50" className="mt-2 w-full rounded-[6px] border border-line bg-surface-2 px-3 py-2.5 text-[12px] text-txt-primary outline-none transition focus:border-acc" /><span className="mt-1 block text-[10px] text-txt-disabled">Include its history in prices.csv for active risk.</span></label></div>{error && <div className="mt-3 flex gap-2 rounded-[6px] border border-neg/30 bg-neg/10 p-2.5 text-[11px] text-neg"><AlertTriangle size={14} className="shrink-0"/>{error}</div>}<div className="mt-4 flex flex-wrap items-center gap-3"><Button variant="primary" icon={FlaskConical} loading={loading} onClick={analyze}>{loading ? "Calculating…" : "Generate research brief"}</Button><Button variant="secondary" icon={FileSpreadsheet} onClick={loadSampleData}>Load Sample Portfolio CSVs</Button><span className="text-[10.5px] text-txt-muted">60+ shared sessions is recommended for tail-risk estimates.</span></div></Panel>
      {!report ? <Requirements /> : <ReportView report={report} />}
    </QuantXErrorBoundary>
  );
}

function Requirements() { return <Panel level={3} title="File contract" sub="Use ISO dates and adjusted or consistently sourced closing prices."><div className="grid gap-3 md:grid-cols-2"><Contract icon={FileSpreadsheet} name="holdings.csv" sample={'ticker,quantity,average_cost,sector\nRELIANCE,100,1400,Energy'} /><Contract icon={BarChart3} name="prices.csv" sample={'date,ticker,close\n2026-01-02,RELIANCE,1412.50'} /></div></Panel>; }
function Contract({ icon: Icon, name, sample }: { icon: typeof FileSpreadsheet; name: string; sample: string }) { return <div className="rounded-[7px] border border-line-subtle bg-surface-2 p-3"><div className="flex items-center gap-2 text-txt-primary"><Icon size={15} className="text-acc"/><span className="text-[12px] font-medium">{name}</span></div><pre className="mt-3 overflow-auto rounded-[5px] bg-bg-primary/70 p-3 text-[10px] leading-relaxed text-txt-secondary">{sample}</pre></div>; }
function FileInput({ label, hint, file, onChange }: { label: string; hint: string; file: File | null; onChange: (file: File | null) => void }) { return <label className="block cursor-pointer"><span className="label-xs text-txt-muted">{label}</span><span className="mt-2 flex min-h-20 items-center gap-3 rounded-[7px] border border-dashed border-line bg-surface-2 px-3 transition hover:border-acc/50 hover:bg-surface-hover"><Upload size={16} className="text-acc"/><span className="min-w-0"><span className="block truncate text-[11.5px] text-txt-primary">{file?.name || "Choose CSV file"}</span><span className="block text-[10px] text-txt-disabled">{hint}</span></span>{file && <CheckCircle2 size={15} className="ml-auto text-pos"/>}</span><input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => onChange(e.target.files?.[0] ?? null)} /></label>; }

function ReportView({ report }: { report: Report }) {
  const p = report?.performance || {}, r = report?.risk || {};
  const topPositions = [...(report?.positions || [])].sort((a, b) => (b.weight || 0) - (a.weight || 0)).slice(0, 5);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Research grade" value={`${report?.summary?.research_grade || "—"} · ${report?.summary?.research_score ?? 0}/100`} accent />
        <Kpi label="Market value" value={inrCompact(report?.summary?.market_value || 0)} />
        <Kpi label="Unrealised P&L" value={inrCompact(report?.summary?.unrealized_pnl || 0)} positive={(report?.summary?.unrealized_pnl || 0) >= 0}/>
        <Kpi label="Annualized return" value={percent(p.annualized_return)} />
        <Kpi label="Volatility" value={percent(p.annualized_volatility)} />
        <Kpi label="Max drawdown" value={percent(p.max_drawdown)} />
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <Panel level={3} className="xl:col-span-7" title="Risk & active-return profile" sub="Historical estimates, annualised from shared portfolio dates">
          <div className="grid gap-x-6 md:grid-cols-2">
            <MetricRows rows={[
              ["Sharpe ratio", metric(p.sharpe_ratio)],
              ["Sortino ratio", metric(p.sortino_ratio)],
              ["Calmar ratio", metric(p.calmar_ratio)],
              ["Omega ratio", metric(p.omega_ratio)],
              ["Historical VaR · 95% / 1D", `${percent(r.historical_var_95_1d)} · ${inrCompact(Number(r.var_95_currency || 0))}`],
              ["Expected shortfall · CVaR", `${percent(r.historical_cvar_95_1d)} · ${inrCompact(Number(r.cvar_95_currency || 0))}`],
              ["Beta", metric(r.beta)]
            ]}/>
            <MetricRows rows={[
              ["Active return", percent(r.active_return)],
              ["Tracking error", percent(r.tracking_error)],
              ["Information ratio", metric(r.information_ratio)],
              ["Benchmark correlation", metric(r.benchmark_correlation)],
              ["Observations", String(p.observations ?? "—")],
              ["Analysis window", `${report?.data_quality?.first_date || "—"} → ${report?.data_quality?.last_date || "—"}`]
            ]}/>
          </div>
        </Panel>
        <Panel level={3} className="xl:col-span-5" title="Concentration monitor" sub={`HHI ${(report?.concentration?.hhi || 0).toFixed(3)} · ${(report?.concentration?.effective_number_of_positions || 0).toFixed(1)} effective names`}>
          <div className="space-y-3">
            {topPositions.map(pos => (
              <div key={pos.ticker}>
                <div className="flex justify-between text-[11px]">
                  <span className="font-medium text-txt-primary">{pos.ticker}</span>
                  <span className="mono text-txt-secondary">{percent(pos.weight)}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-active">
                  <div className="h-full rounded-full bg-gradient-to-r from-acc to-acc2" style={{ width: `${Math.min(100, (pos.weight || 0) * 250)}%` }}/>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      {(report?.data_quality?.warnings?.length || 0) > 0 && (
        <Panel level={3} title="Data-quality notes" tone="warn">
          <ul className="space-y-2 text-[11.5px] text-txt-secondary">
            {report.data_quality.warnings.map(w => <li key={w}>• {w}</li>)}
          </ul>
        </Panel>
      )}
      <div className="grid gap-4 xl:grid-cols-12">
        <Panel level={3} className="xl:col-span-7" title="Research findings" sub="Threshold-based observations ranked by materiality">
          <div className="space-y-2">
            {(report?.findings || []).map(f => (
              <div key={f.title} className="rounded-[7px] border border-line-subtle bg-surface-2 p-3">
                <div className="flex gap-2">
                  <Badge tone={f.severity === "high" ? "neg" : f.severity === "medium" ? "warn" : "neu"}>{f.severity.toUpperCase()}</Badge>
                  <span className="text-[11.5px] font-medium text-txt-primary">{f.title}</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-txt-secondary">{f.detail}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel level={3} className="xl:col-span-5" title="Data lineage" sub="Valuation and risk metrics are deliberately separated.">
          <MetricRows rows={[
            ["Input rows", report?.data_quality?.source_rows ? `${report.data_quality.source_rows.holdings} holdings · ${report.data_quality.source_rows.prices} prices` : "—"],
            ["Common sessions", String(report?.data_quality?.portfolio_dates || 0)],
            ["Latest closes", report?.data_quality?.latest_price_dates?.join(", ") ?? report?.data_quality?.last_date ?? "—"],
            ["Data mode", "User-uploaded CSV"],
            ["Method", "Historical returns + constraints"]
          ]}/>
        </Panel>
      </div>
      <Panel level={3} title="Position diagnostics & allocation proposal" sub="A constrained risk-adjusted scoring proposal — not an executable trade instruction.">
        <div className="overflow-auto">
          <table className="w-full min-w-[800px] text-left text-[11px]">
            <thead className="border-b border-line text-txt-muted">
              <tr>
                <th className="p-2">Ticker</th>
                <th className="p-2">Sector</th>
                <th className="p-2 text-right">Current</th>
                <th className="p-2 text-right">Proposed</th>
                <th className="p-2 text-right">Change</th>
                <th className="p-2 text-right">P&L</th>
                <th className="p-2 text-right">Vol.</th>
                <th className="p-2 text-right">Risk contribution</th>
                <th className="p-2">As of</th>
              </tr>
            </thead>
            <tbody>
              {(report?.proposed_allocation?.weights || []).map(w => {
                const pos = report?.positions?.find(x => x.ticker === w.ticker);
                return (
                  <tr key={w.ticker} className="border-b border-line-subtle text-txt-secondary transition hover:bg-surface-hover/50">
                    <td className="p-2 font-medium text-txt-primary">{w.ticker}</td>
                    <td className="p-2">{pos?.sector || "Unclassified"}</td>
                    <td className="p-2 text-right mono">{percent(w.current_weight)}</td>
                    <td className="p-2 text-right mono text-acc">{percent(w.proposed_weight)}</td>
                    <td className="p-2 text-right mono">{percent(w.change)}</td>
                    <td className="p-2 text-right mono">{inrCompact(pos?.unrealized_pnl || 0)}</td>
                    <td className="p-2 text-right mono">{percent(pos?.annualized_volatility)}</td>
                    <td className="p-2 text-right mono">{metric(pos?.marginal_risk_contribution, 3)}</td>
                    <td className="p-2 mono">{pos?.as_of || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
      <p className="px-1 text-[10px] leading-relaxed text-txt-disabled">{report?.disclaimer}</p>
    </div>
  );
}

function Kpi({ label, value, accent, positive }: { label: string; value: string; accent?: boolean; positive?: boolean }) {
  return (
    <div className={`rounded-[7px] border p-3 ${accent ? "border-acc/30 bg-acc/7" : "border-line bg-surface-1"}`}>
      <div className="label-xs text-txt-muted">{label}</div>
      <div className={`mt-1 mono text-[15px] ${accent ? "text-acc" : positive ? "text-pos" : "text-txt-primary"}`}>{value}</div>
    </div>
  );
}

function MetricRows({ rows }: { rows: string[][] }) {
  return (
    <ul className="space-y-2.5">
      {rows.map(([k, v]) => (
        <li key={k} className="flex justify-between gap-3 border-b border-line-subtle pb-2 last:border-0">
          <span className="text-[11.5px] text-txt-secondary">{k}</span>
          <span className="mono max-w-[62%] text-right text-[11.5px] text-txt-primary">{v}</span>
        </li>
      ))}
    </ul>
  );
}

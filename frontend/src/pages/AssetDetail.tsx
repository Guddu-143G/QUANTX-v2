import { useMemo, useState } from "react";
import { ArrowLeft, Bookmark, Plus } from "lucide-react";
import { Badge, Button, ChartSkeleton, EmptyState, Panel, Progress, RiskBadge, SegmentedControl, Skeleton, Tabs, useAsync } from "../components/ui";
import { Candles, MiniArea, Sparkline, C } from "../components/charts";
import { NewsRow, ProbCell, ScoreCell, StatCell } from "../components/finance";
import { marketService, newsService } from "../services";
import { ALPHA_ROWS } from "../data/quant";
import { HOLDINGS } from "../data/portfolio";
import { num } from "../lib/format";
import { cn } from "../utils/cn";
import { Link } from "../lib/router";

const TABS = [
  { key: "overview", label: "Overview" }, { key: "fundamentals", label: "Fundamentals" },
  { key: "factors", label: "Factors & Alpha" }, { key: "risk", label: "Risk" }, { key: "news", label: "News" },
] as const;
type TabKey = (typeof TABS)[number]["key"];
const RANGES = ["1D", "1W", "1M", "3M", "1Y"] as const;

export default function AssetDetail({ ticker }: { ticker: string }) {
  const [tab, setTab] = useState<TabKey>("overview");
  const [range, setRange] = useState<(typeof RANGES)[number]>("1D");

  const asset = useAsync(() => marketService.asset(ticker), [ticker]);
  const candles = useAsync(() => marketService.candles(ticker), [ticker]);
  const news = useAsync(() => newsService.feed(), []);

  const a = asset.data;
  const alpha = useMemo(() => ALPHA_ROWS.find((r) => r.ticker === ticker.toUpperCase()), [ticker]);
  const holding = useMemo(() => HOLDINGS.find((h) => h.ticker === ticker.toUpperCase()), [ticker]);
  const related = (news.data ?? []).filter((n) => n.ticker === ticker.toUpperCase());

  if (!asset.loading && !a)
    return (
      <Panel level={3}>
        <EmptyState icon={ArrowLeft} title={`No instrument found for “${ticker}”`}
          body="This symbol is not in the covered universe. Try searching from the command palette or return to the market screener."
          action={<Link to="/markets"><Button size="sm" variant="secondary">Back to Markets</Button></Link>} />
      </Panel>
    );

  return (
    <>
      {/* ── Instrument header ── */}
      <div className="mb-4 border-b border-line-subtle pb-4">
        <Link to="/markets" className="mb-2.5 inline-flex items-center gap-1 label-xs text-txt-muted transition-colors hover:text-txt-secondary">
          <ArrowLeft size={10} /> Markets
        </Link>
        {asset.loading || !a ? <Skeleton className="h-16" /> : (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-[20px] font-semibold uppercase tracking-[-0.01em] text-txt-primary sm:text-[24px]">{a.name}</h1>
                <span className="mono rounded-[4px] border border-line-subtle px-1.5 py-0.5 text-[10px] text-txt-muted">{a.ticker}</span>
                <Badge tone="neu">{a.exch}</Badge>
                <Badge tone="neu">{a.sector}</Badge>
                {holding && <Badge tone="info">Held · {holding.weight.toFixed(1)}%</Badge>}
              </div>
              <div className="mt-2.5 flex flex-wrap items-baseline gap-3">
                <span className="tnum text-[28px] font-semibold leading-none tracking-[-0.025em] text-txt-primary">₹{num(a.price, 2)}</span>
                <span className={cn("mono text-[14px]", a.chgPct >= 0 ? "text-pos" : "text-neg")}>
                  {a.chgPct >= 0 ? "↑ +" : "↓ −"}{Math.abs(a.chgPct).toFixed(2)}%
                  <span className="ml-1.5 text-[12px] text-txt-muted">({a.chgPct >= 0 ? "+" : "−"}₹{Math.abs((a.price * a.chgPct) / 100).toFixed(2)})</span>
                </span>
                <span className="label-xs text-txt-disabled">Last 15:30:04 IST</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkline data={a.spark} width={140} height={38} strokeWidth={1.1} />
              <Button size="sm" variant="ghost" icon={Bookmark}>Watch</Button>
              <Button size="sm" variant="primary" icon={Plus}>Add to portfolio</Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Quick stats ── */}
      <div className="mb-4 grid grid-cols-3 gap-x-3 gap-y-3 rounded-[8px] border border-line-subtle bg-surface/50 px-3.5 py-3 sm:grid-cols-4 lg:grid-cols-8">
        {asset.loading || !a ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-9" />) : (
          <>
            <StatCell k="Mkt Cap" v={`₹${(a.mcapCr / 100000).toFixed(2)} L Cr`} />
            <StatCell k="Turnover" v={`₹${num(a.volumeCr, 0)} Cr`} />
            <StatCell k="P/E" v={a.pe.toFixed(1)} />
            <StatCell k="P/B" v={a.pb.toFixed(1)} />
            <StatCell k="Div yield" v={`${a.divYield.toFixed(2)}%`} />
            <StatCell k="ROE" v={`${a.roe.toFixed(1)}%`} />
            <StatCell k="Beta" v={a.beta.toFixed(2)} />
            <StatCell k="σ 30D" v={`${a.vol30.toFixed(1)}%`} />
          </>
        )}
      </div>

      <Tabs tabs={TABS} value={tab} onChange={setTab} className="mb-4" />

      {tab === "overview" && (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
          <Panel level={3} className="xl:col-span-8" title="Price Chart" sub="Intraday 5-minute candles · NSE consolidated"
            actions={<SegmentedControl size="xs" options={RANGES} value={range} onChange={setRange} ariaLabel="Chart range" />}>
            {candles.loading || !candles.data ? <ChartSkeleton height={260} /> : (
              <>
                <Candles data={candles.data} height={260} />
                <div className="mt-3 grid grid-cols-3 gap-3 border-t border-line-subtle pt-3 sm:grid-cols-6">
                  <StatCell k="Open" v={`₹${num(candles.data[0].o, 2)}`} />
                  <StatCell k="High" v={`₹${num(Math.max(...candles.data.map((c) => c.h)), 2)}`} tone="pos" />
                  <StatCell k="Low" v={`₹${num(Math.min(...candles.data.map((c) => c.l)), 2)}`} tone="neg" />
                  <StatCell k="Close" v={`₹${num(candles.data[candles.data.length - 1].c, 2)}`} />
                  <StatCell k="VWAP" v={`₹${num(candles.data.reduce((s, c) => s + c.c, 0) / candles.data.length, 2)}`} />
                  <StatCell k="Volume" v={`${num(candles.data.reduce((s, c) => s + c.v, 0) / 100, 1)} L`} />
                </div>
              </>
            )}
          </Panel>

          <div className="grid content-start gap-3 xl:col-span-4">
            <Panel level={3} title="Model Prediction" sub="Alpha-XGB v3.2.1 · 20-day horizon">
              {!alpha ? <p className="text-[11.5px] text-txt-muted">No live signal for this instrument.</p> : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="label-xs text-txt-disabled">Composite alpha</div>
                      <div className="tnum mt-1 text-[24px] font-semibold leading-none text-txt-primary">{alpha.alpha.toFixed(2)}</div>
                    </div>
                    <RiskBadge level={alpha.signal} />
                  </div>
                  <div className="mt-3 space-y-2.5">
                    <Row k="ML probability"><ProbCell v={alpha.mlProb} /></Row>
                    <Row k="Model confidence"><span className="mono text-[11.5px] text-txt-primary">{alpha.confidence}%</span></Row>
                    <Row k="Signal horizon"><span className="mono text-[11.5px] text-txt-primary">{alpha.horizon}</span></Row>
                    <Row k="Expected excess"><span className="mono text-[11.5px] text-pos">+2.14%</span></Row>
                  </div>
                  <p className="mt-3 border-t border-line-subtle pt-2.5 text-[10.5px] leading-relaxed text-txt-muted">
                    Signal driven primarily by momentum persistence and positive earnings-revision breadth. Decay half-life 28 sessions.
                  </p>
                </>
              )}
            </Panel>

            <Panel level={3} title="Portfolio Exposure" sub={holding ? "Active position" : "Not currently held"}>
              {holding ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <StatCell k="Weight" v={`${holding.weight.toFixed(1)}%`} />
                    <StatCell k="Quantity" v={num(holding.qty, 0)} />
                    <StatCell k="Avg cost" v={`₹${num(holding.avg, 2)}`} />
                    <StatCell k="Unrealised" v={`${holding.pnl >= 0 ? "+" : "−"}₹${Math.abs(holding.pnl / 100000).toFixed(2)} L`} tone={holding.pnl >= 0 ? "pos" : "neg"} />
                  </div>
                  <div className="mt-3 border-t border-line-subtle pt-2.5">
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-[11px] text-txt-muted">Position vs 10% cap</span>
                      <span className="mono text-[11px] text-txt-primary">{holding.weight.toFixed(1)} / 10.0%</span>
                    </div>
                    <Progress value={(holding.weight / 10) * 100} tone={holding.weight > 8.5 ? "warn" : "acc"} />
                  </div>
                </>
              ) : (
                <p className="text-[11.5px] leading-relaxed text-txt-muted">
                  Not held in the Multi-Strat Core mandate. Optimiser suggests an initial weight of 1.8% at current alpha and liquidity.
                </p>
              )}
            </Panel>
          </div>
        </div>
      )}

      {tab === "fundamentals" && a && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <Panel level={3} className="lg:col-span-5" title="Valuation" sub="Trailing twelve months vs 5-year median">
            <ul className="space-y-3">
              {[
                { k: "P/E", v: a.pe, med: a.pe * 0.88, u: "x" }, { k: "P/B", v: a.pb, med: a.pb * 1.06, u: "x" },
                { k: "EV/EBITDA", v: a.pe * 0.62, med: a.pe * 0.58, u: "x" }, { k: "Dividend yield", v: a.divYield, med: a.divYield * 1.12, u: "%" },
                { k: "FCF yield", v: 3.4, med: 2.9, u: "%" },
              ].map((r) => (
                <li key={r.k}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[11.5px] text-txt-secondary">{r.k}</span>
                    <span className="flex items-baseline gap-2">
                      <span className="mono text-[11.5px] text-txt-primary">{r.v.toFixed(2)}{r.u}</span>
                      <span className="mono text-[10px] text-txt-disabled">med {r.med.toFixed(2)}{r.u}</span>
                    </span>
                  </div>
                  <div className="relative mt-1.5 h-1.5 rounded-full bg-line-subtle">
                    <span className="absolute top-0 h-full rounded-full bg-acc2/60" style={{ width: `${Math.min(100, (r.v / (r.med * 1.8)) * 100)}%` }} />
                    <span className="absolute top-[-2px] h-[10px] w-px bg-gold" style={{ left: `${Math.min(100, (r.med / (r.med * 1.8)) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel level={3} className="lg:col-span-7" title="Financial Trend" sub="Revenue and margin trajectory, indexed">
            <MiniArea data={a.spark.map((v, i) => ({ d: `Q${(i % 4) + 1}`, v: +v.toFixed(2) }))} color={C.acc2} height={200} />
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-line-subtle pt-3 sm:grid-cols-4">
              <StatCell k="Revenue growth" v="+12.4%" tone="pos" sub="YoY" />
              <StatCell k="EBITDA margin" v="21.8%" sub="+120bps" />
              <StatCell k="Net debt / EBITDA" v="0.84x" sub="comfortable" />
              <StatCell k="ROIC" v={`${(a.roe * 0.82).toFixed(1)}%`} tone="pos" />
            </div>
          </Panel>
        </div>
      )}

      {tab === "factors" && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <Panel level={3} className="lg:col-span-6" title="Factor Exposures" sub="Z-scores vs NIFTY 200 cross-section">
            {!alpha ? <p className="text-[11.5px] text-txt-muted">No factor scores available.</p> : (
              <ul className="space-y-3">
                {[
                  { k: "Momentum", v: alpha.momentum }, { k: "Value", v: alpha.value }, { k: "Quality", v: alpha.quality },
                  { k: "Sentiment", v: alpha.sentiment }, { k: "Low volatility", v: 100 - (a?.vol30 ?? 20) * 2 },
                ].map((r) => (
                  <li key={r.k} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-[11.5px] text-txt-secondary">{r.k}</span>
                    <span className="relative h-1.5 flex-1 rounded-full bg-line-subtle">
                      <span className="absolute left-1/2 top-[-3px] h-[12px] w-px bg-line-strong" />
                      <span className={cn("absolute top-0 h-full rounded-full", r.v >= 50 ? "left-1/2 bg-acc/70" : "right-1/2 bg-neg/70")}
                        style={{ width: `${Math.abs(r.v - 50)}%` }} />
                    </span>
                    <ScoreCell v={Math.round(r.v)} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel level={3} className="lg:col-span-6" title="Alpha Attribution" sub="Contribution to composite score by sleeve">
            <ul className="space-y-2.5">
              {[
                { k: "Momentum sleeve", v: 0.31 }, { k: "ML ensemble", v: 0.24 }, { k: "Quality sleeve", v: 0.18 },
                { k: "Sentiment sleeve", v: 0.11 }, { k: "Value sleeve", v: 0.09 }, { k: "Risk penalty", v: -0.02 },
              ].map((r) => (
                <li key={r.k}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[11.5px] text-txt-secondary">{r.k}</span>
                    <span className={cn("mono text-[11.5px]", r.v >= 0 ? "text-pos" : "text-neg")}>{r.v >= 0 ? "+" : "−"}{Math.abs(r.v).toFixed(2)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line-subtle">
                    <span className={cn("block h-full rounded-full", r.v >= 0 ? "bg-acc/70" : "bg-neg/70")} style={{ width: `${(Math.abs(r.v) / 0.35) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}

      {tab === "risk" && a && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <Panel level={3} title="Volatility & Beta">
            <div className="grid grid-cols-2 gap-3">
              <StatCell k="σ 30D" v={`${a.vol30.toFixed(1)}%`} />
              <StatCell k="σ 252D" v={`${(a.vol30 * 0.92).toFixed(1)}%`} />
              <StatCell k="Beta (90d)" v={a.beta.toFixed(2)} />
              <StatCell k="Downside β" v={(a.beta * 1.14).toFixed(2)} tone="warn" />
            </div>
          </Panel>
          <Panel level={3} title="Tail Risk">
            <div className="grid grid-cols-2 gap-3">
              <StatCell k="VaR 95% (1d)" v={`−${(a.vol30 / 16).toFixed(2)}%`} tone="neg" />
              <StatCell k="CVaR 97.5%" v={`−${(a.vol30 / 11).toFixed(2)}%`} tone="neg" />
              <StatCell k="Max DD (1Y)" v={`−${(a.vol30 * 1.4).toFixed(1)}%`} tone="neg" />
              <StatCell k="Skew" v="−0.42" />
            </div>
          </Panel>
          <Panel level={3} title="Liquidity">
            <div className="grid grid-cols-2 gap-3">
              <StatCell k="ADV (20d)" v={`₹${num(a.volumeCr, 0)} Cr`} />
              <StatCell k="Days to exit" v={`${(1 + a.vol30 / 22).toFixed(1)}d`} sub="at 15% ADV" />
              <StatCell k="Spread (bps)" v="3.2" tone="pos" />
              <StatCell k="Impact (50bps)" v="8.4bps" />
            </div>
          </Panel>
        </div>
      )}

      {tab === "news" && (
        <Panel level={3} title="News & Sentiment" sub={`${related.length} scored documents mentioning ${ticker.toUpperCase()}`} bodyClass="p-0">
          {news.loading ? <div className="space-y-px p-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            : related.length === 0
              ? <EmptyState icon={Bookmark} title="No recent coverage" body={`No documents mentioning ${ticker.toUpperCase()} were scored in the last 48 hours. Coverage resumes at the next ingestion cycle.`} />
              : <div>{related.map((n) => <NewsRow key={n.id} n={n} />)}</div>}
        </Panel>
      )}
    </>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-line-subtle pb-2 last:border-0 last:pb-0">
      <span className="text-[11.5px] text-txt-muted">{k}</span>
      {children}
    </div>
  );
}

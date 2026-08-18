import { useMemo, useState } from "react";
import { PageHeader } from "../components/layout/AppShell";
import { Badge, Panel, SegmentedControl, Skeleton, TableSkeleton, useAsync } from "../components/ui";
import { DataTable, type Column } from "../components/ui/DataTable";
import { Sparkline } from "../components/charts";
import { NewsRow, StatCell, TickerCell } from "../components/finance";
import { marketService, newsService } from "../services";
import type { Asset } from "../data/market";
import { compact, num } from "../lib/format";
import { cn } from "../utils/cn";
import { useRouter } from "../lib/router";

const VIEWS = ["All", "Gainers", "Losers", "Most active"] as const;

export default function Markets() {
  const [view, setView] = useState<(typeof VIEWS)[number]>("All");
  const { navigate } = useRouter();

  const indices = useAsync(() => marketService.indices(), []);
  const assets = useAsync(() => marketService.assets(), []);
  const sectors = useAsync(() => marketService.sectors(), []);
  const breadth = useAsync(() => marketService.breadth(), []);

  const rows = useMemo(() => {
    const a = assets.data ?? [];
    if (view === "Gainers") return [...a].sort((x, y) => y.chgPct - x.chgPct).slice(0, 10);
    if (view === "Losers") return [...a].sort((x, y) => x.chgPct - y.chgPct).slice(0, 10);
    if (view === "Most active") return [...a].sort((x, y) => y.volumeCr - x.volumeCr).slice(0, 10);
    return a;
  }, [assets.data, view]);

  const cols: Column<Asset>[] = useMemo(() => [
    { key: "t", header: "Instrument", width: "190px", sortable: true, value: (r) => r.ticker, render: (r) => <TickerCell ticker={r.ticker} name={r.name} /> },
    { key: "sec", header: "Sector", sortable: true, hideBelow: "lg", value: (r) => r.sector, render: (r) => <span className="text-[11px] text-txt-muted">{r.sector}</span> },
    { key: "p", header: "LTP", align: "right", sortable: true, value: (r) => r.price, render: (r) => <span className="mono text-[11.5px] text-txt-primary">₹{num(r.price, 2)}</span> },
    { key: "c", header: "Chg %", align: "right", sortable: true, value: (r) => r.chgPct,
      render: (r) => <span className={cn("mono text-[11.5px]", r.chgPct >= 0 ? "text-pos" : "text-neg")}>{r.chgPct >= 0 ? "↑ +" : "↓ −"}{Math.abs(r.chgPct).toFixed(2)}%</span> },
    { key: "sp", header: "30D", align: "center", hideBelow: "sm", render: (r) => <span className="inline-block"><Sparkline data={r.spark} width={62} height={18} fill={false} animate={false} strokeWidth={0.9} /></span> },
    { key: "v", header: "Turnover", align: "right", sortable: true, hideBelow: "md", value: (r) => r.volumeCr, render: (r) => <span className="mono text-[11px] text-txt-secondary">₹{num(r.volumeCr, 0)} Cr</span> },
    { key: "m", header: "Mkt Cap", align: "right", sortable: true, hideBelow: "lg", value: (r) => r.mcapCr, render: (r) => <span className="mono text-[11px] text-txt-secondary">₹{compact(r.mcapCr * 1e7, 1)}</span> },
    { key: "b", header: "Beta", align: "right", sortable: true, hideBelow: "md", value: (r) => r.beta, render: (r) => <span className="mono text-[11px] text-txt-secondary">{r.beta.toFixed(2)}</span> },
    { key: "vol", header: "σ 30D", align: "right", sortable: true, hideBelow: "lg", value: (r) => r.vol30, render: (r) => <span className="mono text-[11px] text-txt-secondary">{r.vol30.toFixed(1)}%</span> },
    { key: "a", header: "Alpha", align: "right", sortable: true, value: (r) => r.alpha,
      render: (r) => <span className={cn("mono text-[11.5px]", r.alpha > 0.7 ? "text-pos" : r.alpha < 0.45 ? "text-neg" : "text-txt-secondary")}>{r.alpha.toFixed(2)}</span> },
  ], []);

  return (
    <>
      <PageHeader
        title="Markets"
        sub="Consolidated view of index levels, sector rotation, breadth and single-name microstructure across NSE, BSE and global venues."
        meta={<><Badge tone="pos" dot>NSE OPEN · closes 15:30 IST</Badge><Badge tone="neu">Delayed 0s · direct feed</Badge><Badge tone="gold">SIMULATED</Badge></>}
        actions={<SegmentedControl options={VIEWS} value={view} onChange={setView} ariaLabel="Market view" />}
      />

      <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-8">
        {indices.loading || !indices.data
          ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[86px]" />)
          : indices.data.map((i) => {
              const inverse = i.key === "VIX";
              const good = inverse ? i.chgPct <= 0 : i.chgPct >= 0;
              return (
                <div key={i.key} className="group min-w-0 rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5 transition-colors hover:border-line hover:bg-surface-high/70">
                  <div className="label-xs truncate text-txt-muted">{i.name}</div>
                  <div className="mono mt-1.5 text-[15px] text-txt-primary">{num(i.value, 2)}</div>
                  <div className="mt-1 flex items-center justify-between gap-1">
                    <span className={cn("mono text-[10.5px]", good ? "text-pos" : "text-neg")}>{i.chgPct >= 0 ? "↑ +" : "↓ −"}{Math.abs(i.chgPct).toFixed(2)}%</span>
                    <Sparkline data={i.spark} width={44} height={16} tone={good ? "pos" : "neg"} fill={false} animate={false} strokeWidth={0.9} />
                  </div>
                </div>
              );
            })}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Panel level={3} className="xl:col-span-5" title="Sector Rotation" sub="Intraday sector performance and alpha contribution">
          {sectors.loading || !sectors.data ? <Skeleton className="h-64" /> : (
            <ul className="space-y-2.5">
              {sectors.data.map((s) => (
                <li key={s.sector}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[11.5px] text-txt-secondary">{s.sector}</span>
                    <span className="flex items-baseline gap-3">
                      <span className="mono text-[10px] text-txt-disabled">α {s.alpha >= 0 ? "+" : "−"}{Math.abs(s.alpha).toFixed(2)}</span>
                      <span className={cn("mono w-14 text-right text-[11.5px]", s.chg >= 0 ? "text-pos" : "text-neg")}>{s.chg >= 0 ? "↑ +" : "↓ −"}{Math.abs(s.chg).toFixed(2)}%</span>
                    </span>
                  </div>
                  <div className="relative mt-1 flex h-1.5 overflow-hidden rounded-full bg-line-subtle">
                    <span className="absolute left-1/2 top-0 h-full w-px bg-line-strong" />
                    <span className={cn("absolute top-0 h-full rounded-full", s.chg >= 0 ? "left-1/2 bg-acc/70" : "right-1/2 bg-neg/70")}
                      style={{ width: `${Math.min(48, (Math.abs(s.chg) / 2.5) * 48)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel level={3} className="xl:col-span-3" title="Market Breadth" sub="NSE all-cap universe">
          {breadth.loading || !breadth.data ? <Skeleton className="h-64" /> : (
            <>
              <div className="flex h-3 overflow-hidden rounded-[3px]">
                <span className="bg-acc/75" style={{ width: `${(breadth.data.advances / 2122) * 100}%` }} />
                <span className="bg-neu/40" style={{ width: `${(breadth.data.unchanged / 2122) * 100}%` }} />
                <span className="bg-neg/75" style={{ width: `${(breadth.data.declines / 2122) * 100}%` }} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <StatCell k="Advances" v={String(breadth.data.advances)} tone="pos" />
                <StatCell k="Declines" v={String(breadth.data.declines)} tone="neg" />
                <StatCell k="Unchanged" v={String(breadth.data.unchanged)} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line-subtle pt-3">
                <StatCell k="52W highs" v={String(breadth.data.high52)} tone="pos" />
                <StatCell k="52W lows" v={String(breadth.data.low52)} tone="neg" />
              </div>
              <div className="mt-3 border-t border-line-subtle pt-2.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-txt-muted">Advance / decline ratio</span>
                  <span className="mono text-[12px] text-pos">1.73</span>
                </div>
                <p className="mt-1.5 text-[10.5px] leading-relaxed text-txt-muted">
                  Breadth is constructive but narrowing — the top 10 names contributed 62% of index gains.
                </p>
              </div>
            </>
          )}
        </Panel>

        <Panel level={3} className="xl:col-span-4" title="Global Cues" sub="Overnight and pre-open drivers">
          <ul className="space-y-2.5">
            {[
              { k: "S&P 500 futures", v: "+0.31%", t: "pos" }, { k: "Brent crude", v: "$86.24 · +1.84%", t: "neg" },
              { k: "US 10Y yield", v: "4.28% · +4bps", t: "neg" }, { k: "Dollar index (DXY)", v: "104.12 · −0.18%", t: "pos" },
              { k: "FII flows (prev)", v: "+₹2,418 Cr", t: "pos" }, { k: "DII flows (prev)", v: "+₹1,104 Cr", t: "pos" },
              { k: "India VIX", v: "14.24 · −3.21%", t: "pos" },
            ].map((r) => (
              <li key={r.k} className="flex items-baseline justify-between gap-2 border-b border-line-subtle pb-2.5 last:border-0 last:pb-0">
                <span className="text-[11.5px] text-txt-secondary">{r.k}</span>
                <span className={cn("mono text-[11.5px]", r.t === "pos" ? "text-pos" : "text-neg")}>{r.v}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel level={3} title="Instrument Screener" sub={`${rows.length} instruments · click any row for the full research view`} bodyClass="p-0">
        {assets.loading ? <TableSkeleton rows={10} cols={8} /> : (
          <DataTable columns={cols} rows={rows} rowKey={(r) => r.ticker} onRowClick={(r) => navigate(`/assets/${r.ticker}`)}
            searchKeys={["ticker", "name", "sector"]} pageSize={12} defaultSort={{ key: "m", dir: "desc" }} />
        )}
      </Panel>
    </>
  );
}

/* ─────────────────────── Research / News & Sentiment ─────────────────────── */

export function Research() {
  const news = useAsync(() => newsService.feed(), []);
  const [filter, setFilter] = useState<"All" | "Positive" | "Negative" | "Neutral">("All");
  const list = (news.data ?? []).filter((n) => filter === "All" || n.sentiment === filter.toUpperCase());

  return (
    <>
      <PageHeader
        title="Research Feed"
        sub="NLP-scored news, filings and broker notes mapped to portfolio holdings with estimated alpha impact."
        meta={<><Badge tone="neu">Sentiment-FinBERT v1.8.0</Badge><Badge tone="neu">3,412 documents / 48h</Badge><Badge tone="gold">SIMULATED</Badge></>}
        actions={<SegmentedControl options={["All", "Positive", "Negative", "Neutral"] as const} value={filter} onChange={setFilter} ariaLabel="Sentiment filter" />}
      />

      <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatBox k="Net sentiment" v="+0.34" s="portfolio-weighted" tone="pos" />
        <StatBox k="Documents scored" v="3,412" s="last 48 hours" />
        <StatBox k="Alpha impact (est.)" v="+0.42" s="aggregate, 20D horizon" tone="pos" />
        <StatBox k="Coverage" v="98.6%" s="of portfolio by weight" />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Panel level={3} className="xl:col-span-8" title="Headlines" sub="Compact research-terminal rows · ranked by estimated alpha impact" bodyClass="p-0">
          {news.loading ? <div className="space-y-px p-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            : list.length === 0 ? <div className="px-4 py-12 text-center text-[12px] text-txt-muted">No documents match this sentiment filter.</div>
            : <div>{list.map((n) => <NewsRow key={n.id} n={n} />)}</div>}
        </Panel>

        <div className="grid content-start gap-3 xl:col-span-4">
          <Panel level={3} title="Sentiment by Sector" sub="Rolling 48h, portfolio-weighted">
            <ul className="space-y-2.5">
              {[
                { s: "Industrials", v: 0.62 }, { s: "Energy", v: 0.41 }, { s: "Financials", v: 0.28 },
                { s: "Healthcare", v: 0.22 }, { s: "Consumer", v: -0.08 }, { s: "Technology", v: -0.21 }, { s: "Materials", v: -0.34 },
              ].map((r) => (
                <li key={r.s}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[11.5px] text-txt-secondary">{r.s}</span>
                    <span className={cn("mono text-[11.5px]", r.v >= 0 ? "text-pos" : "text-neg")}>{r.v >= 0 ? "+" : "−"}{Math.abs(r.v).toFixed(2)}</span>
                  </div>
                  <div className="relative mt-1 h-1.5 rounded-full bg-line-subtle">
                    <span className="absolute left-1/2 top-0 h-full w-px bg-line-strong" />
                    <span className={cn("absolute top-0 h-full rounded-full", r.v >= 0 ? "left-1/2 bg-acc/70" : "right-1/2 bg-neg/70")} style={{ width: `${Math.abs(r.v) * 48}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel level={3} title="Event Calendar" sub="Next 7 sessions">
            <ul className="space-y-2.5">
              {[
                { d: "23 Aug", e: "RBI MPC minutes", i: "HIGH" }, { d: "26 Aug", e: "INFY analyst day", i: "MEDIUM" },
                { d: "27 Aug", e: "US GDP revision (Q2)", i: "MEDIUM" }, { d: "29 Aug", e: "India Q1 GDP print", i: "HIGH" },
                { d: "30 Aug", e: "Monthly F&O expiry", i: "HIGH" }, { d: "01 Sep", e: "Auto monthly volumes", i: "MEDIUM" },
              ].map((r) => (
                <li key={r.e} className="flex items-center justify-between gap-2 border-b border-line-subtle pb-2.5 last:border-0 last:pb-0">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="mono shrink-0 text-[10.5px] text-txt-muted">{r.d}</span>
                    <span className="truncate text-[11.5px] text-txt-secondary">{r.e}</span>
                  </span>
                  <Badge tone={r.i === "HIGH" ? "warn" : "neu"}>{r.i}</Badge>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

function StatBox({ k, v, s, tone }: { k: string; v: string; s: string; tone?: "pos" | "neg" }) {
  return (
    <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
      <div className="label-xs truncate text-txt-muted">{k}</div>
      <div className={cn("tnum mt-1 text-[18px] font-semibold leading-none", tone === "pos" ? "text-pos" : tone === "neg" ? "text-neg" : "text-txt-primary")}>{v}</div>
      <div className="mt-1.5 truncate text-[10px] text-txt-disabled">{s}</div>
    </div>
  );
}

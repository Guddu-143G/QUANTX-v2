import { useEffect, useState, useMemo } from "react";
import { Calendar, Filter, BarChart3 } from "lucide-react";
import { PageHeader } from "../components/layout/AppShell";
import { Badge, Panel, Skeleton, SegmentedControl } from "../components/ui";
import { StatCell } from "../components/finance";
import { cn } from "../utils/cn";
import { Link } from "../lib/router";
import { HOLDINGS } from "../data/portfolio";

type EarningsEvent = {
  ticker: string;
  company: string;
  sector: string;
  date: string;
  time: string;
  eps_estimate: number;
  eps_prev: number;
  eps_surprise_prev: number;
  revenue_estimate_cr: number;
  iv_rank: number;
  implied_move_pct: number;
  avg_post_move_pct: number;
  historical_moves: number[];
  consensus: "BEAT" | "IN-LINE" | "MISS";
  analyst_count: number;
  days_to_earnings: number;
};

const SECTORS = ["All", "Technology", "Financials", "Energy", "Consumer", "Auto", "Healthcare", "Industrials", "Utilities", "Materials", "Telecom"];
const VIEWS = ["Table", "Calendar"] as const;

const holdingTickers = new Set(HOLDINGS.map((h) => h.ticker));

async function fetchEarnings(sector?: string): Promise<EarningsEvent[]> {
  try {
    const url = `/api/v1/market/earnings-calendar?days=30${sector && sector !== "All" ? `&sector=${sector}` : ""}`;
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      if (json.status === "success") return json.data;
    }
  } catch { /* fallback below */ }
  // Fallback demo data if backend unavailable
  return DEMO_EVENTS;
}

export default function EarningsCalendar() {
  const [events, setEvents] = useState<EarningsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState("All");
  const [view, setView] = useState<"Table" | "Calendar">("Table");
  const [portfolioOnly, setPortfolioOnly] = useState(false);
  const [selected, setSelected] = useState<EarningsEvent | null>(null);
  const [sortKey, setSortKey] = useState<keyof EarningsEvent>("days_to_earnings");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    setLoading(true);
    fetchEarnings(sector).then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, [sector]);

  const filtered = useMemo(() => {
    let list = portfolioOnly ? events.filter((e) => holdingTickers.has(e.ticker)) : events;
    return [...list].sort((a, b) => {
      const av = a[sortKey] as number | string;
      const bv = b[sortKey] as number | string;
      return sortDir === "asc" ? (av < bv ? -1 : 1) : av > bv ? -1 : 1;
    });
  }, [events, portfolioOnly, sortKey, sortDir]);

  const toggleSort = (key: keyof EarningsEvent) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const grouped = useMemo(() => {
    const map = new Map<string, EarningsEvent[]>();
    filtered.forEach((e) => {
      const k = e.date;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <>
      <PageHeader
        title="Earnings Calendar"
        sub="Upcoming result dates, EPS estimates, IV rank, and historical post-earnings price distributions."
        meta={
          <>
            <Badge tone="neu">{events.length} events · next 30 days</Badge>
            <Badge tone="warn">{events.filter((e) => holdingTickers.has(e.ticker)).length} in portfolio</Badge>
          </>
        }
        actions={
          <div className="flex items-center gap-2">
            <SegmentedControl options={VIEWS} value={view} onChange={setView} ariaLabel="View mode" />
            <button
              onClick={() => setPortfolioOnly((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[6px] border px-2.5 py-1.5 text-[11px] transition-colors",
                portfolioOnly
                  ? "border-acc/40 bg-acc/10 text-acc"
                  : "border-line-subtle bg-surface text-txt-muted hover:border-line hover:text-txt-secondary"
              )}
            >
              <Filter size={11} /> Portfolio only
            </button>
          </div>
        }
      />

      {/* Sector filter strip */}
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {SECTORS.map((s) => (
          <button
            key={s}
            onClick={() => setSector(s)}
            className={cn(
              "shrink-0 rounded-[5px] border px-2.5 py-1 text-[11px] transition-colors whitespace-nowrap",
              sector === s
                ? "border-acc/40 bg-acc/10 text-acc"
                : "border-line-subtle bg-surface/60 text-txt-muted hover:border-line hover:text-txt-secondary"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Main content */}
        <div className={cn("flex-1 min-w-0", selected && "hidden xl:block")}>
          {loading ? (
            <Panel level={3} bodyClass="p-0">
              <div className="space-y-0">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="border-b border-line-subtle px-4 py-3">
                    <Skeleton className="h-10" />
                  </div>
                ))}
              </div>
            </Panel>
          ) : view === "Table" ? (
            <Panel level={3} title={`${filtered.length} Events`} sub="Sorted by date · click a row for detail" bodyClass="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-line-subtle">
                      {[
                        { label: "Company", key: "ticker" },
                        { label: "Date", key: "date" },
                        { label: "EPS Est.", key: "eps_estimate" },
                        { label: "EPS Prev", key: "eps_prev" },
                        { label: "IV Rank", key: "iv_rank" },
                        { label: "Impl. Move", key: "implied_move_pct" },
                        { label: "Avg Move", key: "avg_post_move_pct" },
                        { label: "Consensus", key: "consensus" },
                      ].map(({ label, key }) => (
                        <th
                          key={key}
                          onClick={() => toggleSort(key as keyof EarningsEvent)}
                          className="cursor-pointer px-4 py-2.5 text-left label-xs text-txt-disabled font-normal hover:text-txt-secondary transition-colors select-none"
                        >
                          {label} {sortKey === key ? (sortDir === "asc" ? "↑" : "↓") : ""}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((e) => {
                      const inPortfolio = holdingTickers.has(e.ticker);
                      return (
                        <tr
                          key={e.ticker}
                          onClick={() => setSelected(e)}
                          className={cn(
                            "border-b border-line-subtle last:border-0 cursor-pointer transition-colors",
                            selected?.ticker === e.ticker
                              ? "bg-surface-selected"
                              : "hover:bg-surface-hover/60"
                          )}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="mono text-[12px] font-medium text-txt-primary">{e.ticker}</span>
                                  {inPortfolio && <Badge tone="info">Held</Badge>}
                                </div>
                                <div className="text-[10px] text-txt-muted truncate max-w-[140px]">{e.sector}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="mono text-[11px] text-txt-primary">{e.date}</div>
                            <div className="text-[9.5px] text-txt-disabled">{e.time}</div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="mono text-[11.5px] text-txt-primary">₹{e.eps_estimate.toFixed(2)}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="mono text-[11px] text-txt-secondary">₹{e.eps_prev.toFixed(2)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-line-subtle">
                                <div
                                  className={cn("h-full rounded-full", e.iv_rank > 70 ? "bg-neg/70" : e.iv_rank > 50 ? "bg-warn/70" : "bg-acc/70")}
                                  style={{ width: `${e.iv_rank}%` }}
                                />
                              </div>
                              <span className="mono text-[10px] text-txt-secondary">{e.iv_rank}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={cn("mono text-[11.5px]", e.implied_move_pct > 5 ? "text-warn" : "text-txt-primary")}>
                              ±{e.implied_move_pct}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="mono text-[11px] text-txt-secondary">±{e.avg_post_move_pct}%</span>
                          </td>
                          <td className="px-4 py-3">
                            <ConsensusBadge c={e.consensus} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
          ) : (
            /* Calendar view */
            <div className="space-y-4">
              {grouped.map(([date, dayEvents]) => (
                <div key={date}>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-[5px] border border-line-subtle bg-surface px-2.5 py-1">
                      <Calendar size={11} className="text-acc" />
                      <span className="label-xs text-txt-primary">{new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span>
                    </div>
                    <span className="text-[10px] text-txt-disabled">{dayEvents.length} result{dayEvents.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {dayEvents.map((e) => (
                      <button
                        key={e.ticker}
                        onClick={() => setSelected(e)}
                        className={cn(
                          "text-left rounded-[8px] border px-3 py-2.5 transition-colors",
                          holdingTickers.has(e.ticker) ? "border-acc/30 bg-acc/5" : "border-line-subtle bg-surface/40",
                          "hover:border-line hover:bg-surface-hover"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="mono text-[12px] font-medium text-txt-primary">{e.ticker}</span>
                          <ConsensusBadge c={e.consensus} />
                        </div>
                        <div className="mt-1 text-[10px] text-txt-muted">{e.sector} · {e.time}</div>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-[10px] text-txt-disabled">EPS Est: <span className="text-txt-secondary">₹{e.eps_estimate.toFixed(2)}</span></span>
                          <span className={cn("text-[10px]", e.implied_move_pct > 5 ? "text-warn" : "text-txt-disabled")}>±{e.implied_move_pct}% move</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-full xl:w-[340px] xl:shrink-0">
            <Panel level={3} title={selected.ticker} sub={selected.company}
              actions={<button onClick={() => setSelected(null)} className="label-xs text-txt-muted hover:text-txt-secondary">Close</button>}
            >
              <div className="space-y-4">
                {/* Key metrics */}
                <div className="grid grid-cols-2 gap-2">
                  <StatCell k="EPS Estimate" v={`₹${selected.eps_estimate.toFixed(2)}`} />
                  <StatCell k="EPS Previous" v={`₹${selected.eps_prev.toFixed(2)}`} />
                  <StatCell k="Prev Surprise" v={`${selected.eps_surprise_prev > 0 ? "+" : ""}${selected.eps_surprise_prev}%`} tone={selected.eps_surprise_prev > 0 ? "pos" : "neg"} />
                  <StatCell k="Revenue Est." v={`₹${(selected.revenue_estimate_cr / 100).toFixed(0)} Cr`} />
                  <StatCell k="IV Rank" v={`${selected.iv_rank}%`} tone={selected.iv_rank > 70 ? "neg" : selected.iv_rank > 50 ? "warn" : undefined} />
                  <StatCell k="Implied Move" v={`±${selected.implied_move_pct}%`} />
                  <StatCell k="Avg Historical" v={`±${selected.avg_post_move_pct}%`} />
                  <StatCell k="Analysts" v={`${selected.analyst_count}`} />
                </div>

                {/* IV Rank bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="label-xs text-txt-muted">IV Rank</span>
                    <span className="mono text-[10px] text-txt-secondary">{selected.iv_rank}%ile</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-line-subtle">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", selected.iv_rank > 70 ? "bg-neg/70" : selected.iv_rank > 50 ? "bg-warn/70" : "bg-acc/70")}
                      style={{ width: `${selected.iv_rank}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[9.5px] text-txt-disabled">
                    {selected.iv_rank > 70 ? "High IV — options pricing in large move" : selected.iv_rank > 50 ? "Elevated IV — moderate event risk" : "Normal IV — limited event premium"}
                  </div>
                </div>

                {/* Historical moves mini chart */}
                <div>
                  <div className="mb-2 label-xs text-txt-muted flex items-center gap-1.5">
                    <BarChart3 size={10} /> Post-earnings moves (last 8 quarters)
                  </div>
                  <div className="flex items-end gap-1 h-16">
                    {selected.historical_moves.map((m, i) => {
                      const height = Math.min(100, (Math.abs(m) / selected.implied_move_pct) * 100);
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                          <div
                            className={cn("w-full rounded-[2px] transition-all duration-300", m >= 0 ? "bg-pos/60" : "bg-neg/60")}
                            style={{ height: `${Math.max(4, height)}%` }}
                          />
                          <span className={cn("mt-0.5 text-[8px] mono", m >= 0 ? "text-pos" : "text-neg")}>
                            {m >= 0 ? "+" : ""}{m.toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-line-subtle">
                  <Link to={`/assets/${selected.ticker}`}>
                    <button className="w-full rounded-[6px] border border-line-subtle py-2 text-[11px] text-txt-secondary hover:border-acc hover:text-acc transition-colors">
                      Open Asset Detail →
                    </button>
                  </Link>
                </div>
              </div>
            </Panel>
          </div>
        )}
      </div>
    </>
  );
}

function ConsensusBadge({ c }: { c: string }) {
  return (
    <span className={cn(
      "rounded-[3px] border px-1.5 py-0.5 text-[9px] font-medium",
      c === "BEAT" ? "border-pos/30 bg-pos/10 text-pos" : c === "MISS" ? "border-neg/30 bg-neg/10 text-neg" : "border-line bg-surface text-txt-muted"
    )}>
      {c}
    </span>
  );
}

// Fallback demo events if backend is down
const DEMO_EVENTS: EarningsEvent[] = [
  { ticker: "INFY", company: "Infosys Ltd", sector: "Technology", date: new Date(Date.now() + 86400000).toISOString().split("T")[0], time: "15:30", eps_estimate: 18.6, eps_prev: 17.2, eps_surprise_prev: 4.2, revenue_estimate_cr: 2100, iv_rank: 62, implied_move_pct: 4.2, avg_post_move_pct: 3.8, historical_moves: [3.4, -2.1, 5.8, 1.2, -3.4, 4.6, 2.1, -1.8], consensus: "BEAT", analyst_count: 28, days_to_earnings: 1 },
  { ticker: "TCS", company: "TCS Ltd", sector: "Technology", date: new Date(Date.now() + 172800000).toISOString().split("T")[0], time: "After Market", eps_estimate: 29.4, eps_prev: 28.1, eps_surprise_prev: 2.1, revenue_estimate_cr: 4200, iv_rank: 48, implied_move_pct: 3.1, avg_post_move_pct: 2.8, historical_moves: [2.1, -1.4, 3.2, 0.8, -2.1, 1.9, 0.6, -1.2], consensus: "IN-LINE", analyst_count: 32, days_to_earnings: 2 },
  { ticker: "HDFCBANK", company: "HDFC Bank", sector: "Financials", date: new Date(Date.now() + 259200000).toISOString().split("T")[0], time: "14:00", eps_estimate: 44.8, eps_prev: 41.2, eps_surprise_prev: 6.8, revenue_estimate_cr: 6800, iv_rank: 74, implied_move_pct: 5.8, avg_post_move_pct: 4.6, historical_moves: [4.2, -3.1, 6.8, 2.4, -4.2, 5.1, 3.2, -2.8], consensus: "BEAT", analyst_count: 24, days_to_earnings: 3 },
];

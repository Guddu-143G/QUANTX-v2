import { useState, useMemo } from "react";
import { BellOff, BookmarkMinus, Plus, Trash2, X, AlertTriangle } from "lucide-react";
import { PageHeader } from "../components/layout/AppShell";
import { Badge, Button, EmptyState, Panel } from "../components/ui";
import { TickerCell } from "../components/finance";
import { Sparkline } from "../components/charts";
import { useWatchlist, type AlertRule } from "../context/WatchlistContext";
import { useMarketData } from "../context/MarketContext";
import { ASSETS } from "../data/market";
import { num } from "../lib/format";
import { cn } from "../utils/cn";
import { Link } from "../lib/router";

const ALERT_TYPES = [
  { value: "price_above", label: "Price rises above" },
  { value: "price_below", label: "Price drops below" },
  { value: "pct_change", label: "% move exceeds" },
] as const;

export default function Watchlist() {
  const { items, alerts, removeFromWatchlist, addAlert, removeAlert, clearTriggered, triggeredCount } = useWatchlist();
  const { ticks } = useMarketData();
  const [showAddAlert, setShowAddAlert] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<AlertRule["type"]>("price_above");
  const [alertThreshold, setAlertThreshold] = useState("");

  const enriched = useMemo(() =>
    items.map((item) => {
      const asset = ASSETS.find((a) => a.ticker === item.ticker);
      if (!asset) return null;
      const tick = asset.token ? ticks[asset.token] : null;
      const price = tick?.last_price ?? asset.price;
      const chgPct = tick?.change ?? asset.chgPct;
      return { ...asset, price, chgPct, addedAt: item.addedAt };
    }).filter(Boolean) as (typeof ASSETS[number] & { price: number; chgPct: number; addedAt: number })[],
    [items, ticks]
  );

  const handleAddAlert = (ticker: string) => {
    const v = parseFloat(alertThreshold);
    if (!isNaN(v) && v > 0) {
      addAlert({ ticker, type: alertType, threshold: v });
      setShowAddAlert(null);
      setAlertThreshold("");
    }
  };

  return (
    <>
      <PageHeader
        title="Watchlist"
        sub="Track instruments and set real-time price alerts. Persisted across sessions."
        meta={
          <>
            <Badge tone="neu">{items.length} instruments</Badge>
            <Badge tone="warn">{alerts.length} alerts</Badge>
            {triggeredCount > 0 && <Badge tone="neg">{triggeredCount} triggered</Badge>}
          </>
        }
        actions={
          <>
            {triggeredCount > 0 && (
              <Button size="sm" variant="ghost" icon={BellOff} onClick={clearTriggered}>
                Clear triggered
              </Button>
            )}
            <Link to="/markets">
              <Button size="sm" variant="primary" icon={Plus}>Add from Markets</Button>
            </Link>
          </>
        }
      />

      {items.length === 0 ? (
        <Panel level={3}>
          <EmptyState
            icon={BookmarkMinus}
            title="Watchlist is empty"
            body="Click 'Watch' on any asset in Markets or Asset Detail to add it here. You can then set price alerts."
            action={<Link to="/markets"><Button size="sm" variant="primary">Browse Markets</Button></Link>}
          />
        </Panel>
      ) : (
        <div className="space-y-3">
          {/* Instruments table */}
          <Panel level={3} title="Watched Instruments" sub={`${items.length} positions · live prices · click to manage alerts`} bodyClass="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line-subtle">
                    {["Instrument", "Price", "Day Δ", "Sparkline", "Alerts", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left label-xs text-txt-disabled font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {enriched.map((asset) => {
                    const assetAlerts = alerts.filter((a) => a.ticker === asset.ticker);
                  return (
                      <tr key={asset.ticker} className="border-b border-line-subtle last:border-0 hover:bg-surface-hover/50 transition-colors">
                        <td className="px-4 py-3">
                          <Link to={`/assets/${asset.ticker}`}>
                            <TickerCell ticker={asset.ticker} name={asset.name} />
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="mono text-[12px] text-txt-primary">₹{num(asset.price, 2)}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={cn("mono text-[11.5px]", asset.chgPct >= 0 ? "text-pos" : "text-neg")}>
                            {asset.chgPct >= 0 ? "↑ +" : "↓ −"}{Math.abs(asset.chgPct).toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Sparkline data={asset.spark} width={80} height={28} strokeWidth={1} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {assetAlerts.length === 0 ? (
                              <span className="text-[10px] text-txt-disabled">No alerts</span>
                            ) : (
                              assetAlerts.map((al) => (
                                <span key={al.id} className={cn(
                                  "inline-flex items-center gap-1 rounded-[3px] border px-1.5 py-0.5 text-[9px]",
                                  al.triggered
                                    ? "border-neg/30 bg-neg/10 text-neg"
                                    : "border-warn/30 bg-warn/10 text-warn"
                                )}>
                                  {al.triggered && <AlertTriangle size={8} />}
                                  {al.type === "price_above" ? `≥₹${al.threshold}` : al.type === "price_below" ? `≤₹${al.threshold}` : `Δ${al.threshold}%`}
                                  <button onClick={() => removeAlert(al.id)} className="ml-0.5 hover:text-neg transition-colors">
                                    <X size={7} />
                                  </button>
                                </span>
                              ))
                            )}
                            {showAddAlert === asset.ticker ? (
                              <div className="flex items-center gap-1.5 mt-1">
                                <select
                                  value={alertType}
                                  onChange={(e) => setAlertType(e.target.value as AlertRule["type"])}
                                  className="rounded border border-line-subtle bg-surface text-[10px] text-txt-secondary px-1.5 py-1 focus:outline-none"
                                >
                                  {ALERT_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                  ))}
                                </select>
                                <input
                                  type="number"
                                  value={alertThreshold}
                                  onChange={(e) => setAlertThreshold(e.target.value)}
                                  placeholder={alertType === "pct_change" ? "% e.g. 2" : "₹ price"}
                                  className="w-20 rounded border border-line-subtle bg-surface text-[10px] text-txt-primary px-2 py-1 focus:outline-none focus:border-acc"
                                />
                                <button onClick={() => handleAddAlert(asset.ticker)} className="rounded bg-acc/20 border border-acc/30 text-acc text-[9px] px-2 py-1 hover:bg-acc/30 transition-colors">Set</button>
                                <button onClick={() => setShowAddAlert(null)} className="text-txt-muted hover:text-txt-secondary transition-colors"><X size={11} /></button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowAddAlert(asset.ticker)}
                                className="inline-flex items-center gap-0.5 rounded border border-line-subtle px-1.5 py-0.5 text-[9px] text-txt-muted hover:border-acc hover:text-acc transition-colors"
                              >
                                <Plus size={8} /> Alert
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => removeFromWatchlist(asset.ticker)}
                            className="inline-flex items-center gap-1 rounded border border-line-subtle px-2 py-1 text-[10px] text-txt-muted hover:border-neg hover:text-neg transition-colors"
                          >
                            <Trash2 size={10} /> Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* Alert Rules panel */}
          {alerts.length > 0 && (
            <Panel level={3} title="All Alert Rules" sub="Price and movement thresholds for watched instruments"
              actions={<button onClick={clearTriggered} className="label-xs text-txt-muted hover:text-txt-secondary transition-colors">Clear triggered</button>}
            >
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {alerts.map((al) => {
                  const asset = ASSETS.find((a) => a.ticker === al.ticker);
                  return (
                    <div key={al.id} className={cn(
                      "flex items-center justify-between gap-3 rounded-[6px] border px-3 py-2.5 transition-colors",
                      al.triggered ? "border-neg/30 bg-neg/5" : "border-line-subtle bg-surface/40"
                    )}>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn("mono text-[11px] font-medium", al.triggered ? "text-neg" : "text-txt-primary")}>{al.ticker}</span>
                          {al.triggered && <Badge tone="neg">TRIGGERED</Badge>}
                        </div>
                        <div className="mt-0.5 text-[10px] text-txt-muted">
                          {al.type === "price_above" ? `Price ≥ ₹${al.threshold}` : al.type === "price_below" ? `Price ≤ ₹${al.threshold}` : `Move ≥ ${al.threshold}%`}
                        </div>
                        <div className="mt-0.5 text-[9.5px] text-txt-disabled">
                          Current: ₹{num(asset?.price ?? 0, 2)}
                        </div>
                      </div>
                      <button onClick={() => removeAlert(al.id)} className="shrink-0 rounded p-1 text-txt-muted hover:bg-neg/10 hover:text-neg transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </Panel>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs text-txt-muted">Watchlist Size</div>
              <div className="tnum mt-1 text-[18px] font-semibold text-txt-primary">{items.length}</div>
            </div>
            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs text-txt-muted">Active Alerts</div>
              <div className="tnum mt-1 text-[18px] font-semibold text-warn">{alerts.filter(a => !a.triggered).length}</div>
            </div>
            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs text-txt-muted">Triggered</div>
              <div className="tnum mt-1 text-[18px] font-semibold text-neg">{triggeredCount}</div>
            </div>
            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs text-txt-muted">Gainers Today</div>
              <div className="tnum mt-1 text-[18px] font-semibold text-pos">{enriched.filter(a => a.chgPct >= 0).length}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

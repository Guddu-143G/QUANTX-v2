import { useMemo } from "react";
import { useMarketData } from "../../context/MarketContext";
import { HOLDINGS } from "../../data/portfolio";
import { num } from "../../lib/format";
import { cn } from "../../utils/cn";

export function LivePnLStrip() {
  const { ticks } = useMarketData();

  const positions = useMemo(() =>
    HOLDINGS.map((h) => {
      const tick = h.token ? ticks[h.token] : null;
      const price = tick?.last_price ?? h.ltp;
      const chgPct = tick?.change ?? h.dayPct;
      const pnl = h.qty * (price - h.avg);
      return { ticker: h.ticker, price, chgPct, pnl };
    }),
    [ticks]
  );

  // Duplicate for seamless scroll
  const doubled = [...positions, ...positions];

  return (
    <div className="relative overflow-hidden border-y border-line-subtle bg-bg-secondary/80 py-1.5">
      <div
        className="flex gap-0 whitespace-nowrap"
        style={{
          animation: "qx-ticker 40s linear infinite",
          width: "max-content",
        }}
      >
        {doubled.map((p, i) => (
          <span
            key={`${p.ticker}-${i}`}
            className="inline-flex items-center gap-2 px-4 border-r border-line-subtle/40 last:border-r-0"
          >
            <span className="mono text-[10.5px] font-medium text-txt-secondary">{p.ticker}</span>
            <span className="mono text-[10.5px] text-txt-primary">₹{num(p.price, 2)}</span>
            <span className={cn("mono text-[10px]", p.chgPct >= 0 ? "text-pos" : "text-neg")}>
              {p.chgPct >= 0 ? "▲" : "▼"} {Math.abs(p.chgPct).toFixed(2)}%
            </span>
            <span className={cn("mono text-[9.5px]", p.pnl >= 0 ? "text-pos/70" : "text-neg/70")}>
              {p.pnl >= 0 ? "+" : "-"}₹{Math.abs(p.pnl / 1000).toFixed(0)}K
            </span>
          </span>
        ))}
      </div>
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-bg-secondary/80 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-bg-secondary/80 to-transparent" />
    </div>
  );
}

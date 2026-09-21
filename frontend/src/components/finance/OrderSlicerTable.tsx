import React, { useState } from "react";
import { type OrderSlicePlan } from "../../services/v30";
import { inrCompact, num } from "../../lib/format";

interface OrderSlicerTableProps {
  plan: OrderSlicePlan;
  onSliceOrder: (params: {
    ticker: string;
    targetWeight: number;
    vpin: number;
    urgency: string;
    side: string;
  }) => void;
  loading?: boolean;
}

export const OrderSlicerTable: React.FC<OrderSlicerTableProps> = ({
  plan,
  onSliceOrder,
  loading = false,
}) => {
  const [ticker, setTicker] = useState(plan.ticker || "RELIANCE");
  const [targetWeightPct, setTargetWeightPct] = useState(plan.target_weight_requested * 100 || 8.0);
  const [vpin, setVpin] = useState(plan.vpin_toxicity || 0.18);
  const [urgency, setUrgency] = useState(plan.urgency || "NORMAL");
  const [side, setSide] = useState<string>(plan.side || "BUY");

  // Simulated execution animation state
  const [executing, setExecuting] = useState(false);
  const [executedCount, setExecutedCount] = useState<number>(0);

  const handleSimulateExecution = () => {
    setExecuting(true);
    setExecutedCount(0);
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setExecutedCount(current);
      if (current >= plan.child_slices.length) {
        clearInterval(interval);
        setExecuting(false);
      }
    }, 450);
  };

  const algoColors: Record<string, { bg: string; text: string; border: string }> = {
    DIRECT_LIMIT_PASSIVE: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
    TWAP_TIME_WEIGHTED: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30" },
    VWAP_VOLUME_WEIGHTED: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
    POV_PERCENTAGE_OF_VOLUME: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
    IMPLEMENTATION_SHORTFALL: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30" },
  };

  const currentAlgoColor = algoColors[plan.selected_algo] || algoColors.DIRECT_LIMIT_PASSIVE;

  return (
    <div className="space-y-4">
      {/* ── Slicing Configuration Controls ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-subtle pb-3">
          <div>
            <h3 className="text-sm font-bold text-txt-primary">
              Capital-Scale Algorithmic Order Slicer (TWAP / VWAP / POV / IS)
            </h3>
            <p className="text-xs text-txt-muted mt-0.5">
              Automated child order routing constrained by ADTV liquidity caps and order toxicity
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-bg px-2.5 py-1 font-mono text-xs text-txt-secondary border border-line-subtle">
              {plan.capital_tier_label}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div>
            <label className="text-[10.5px] uppercase font-mono text-txt-muted block mb-1">Ticker</label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="w-full rounded-[6px] border border-line-subtle bg-bg px-2.5 py-1.5 font-mono text-xs text-txt-primary uppercase outline-none focus:border-acc"
            />
          </div>

          <div>
            <label className="text-[10.5px] uppercase font-mono text-txt-muted block mb-1">Target Weight</label>
            <input
              type="number"
              min="0.5"
              max="25"
              step="0.5"
              value={targetWeightPct}
              onChange={(e) => setTargetWeightPct(parseFloat(e.target.value) || 1.0)}
              className="w-full rounded-[6px] border border-line-subtle bg-bg px-2.5 py-1.5 font-mono text-xs text-txt-primary outline-none focus:border-acc"
            />
          </div>

          <div>
            <label className="text-[10.5px] uppercase font-mono text-txt-muted block mb-1">Side</label>
            <select
              value={side}
              onChange={(e) => setSide(e.target.value)}
              className="w-full rounded-[6px] border border-line-subtle bg-bg px-2.5 py-1.5 font-mono text-xs text-txt-primary outline-none focus:border-acc"
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>

          <div>
            <label className="text-[10.5px] uppercase font-mono text-txt-muted block mb-1">VPIN Toxicity</label>
            <input
              type="number"
              min="0.05"
              max="0.60"
              step="0.02"
              value={vpin}
              onChange={(e) => setVpin(parseFloat(e.target.value) || 0.18)}
              className="w-full rounded-[6px] border border-line-subtle bg-bg px-2.5 py-1.5 font-mono text-xs text-txt-primary outline-none focus:border-acc"
            />
          </div>

          <div>
            <label className="text-[10.5px] uppercase font-mono text-txt-muted block mb-1">Urgency</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full rounded-[6px] border border-line-subtle bg-bg px-2.5 py-1.5 font-mono text-xs text-txt-primary outline-none focus:border-acc"
            >
              <option value="NORMAL">NORMAL</option>
              <option value="HIGH_RISK_BREACH">HIGH RISK (IS)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() =>
                onSliceOrder({
                  ticker,
                  targetWeight: targetWeightPct / 100.0,
                  vpin,
                  urgency,
                  side,
                })
              }
              disabled={loading}
              className="w-full rounded-[6px] bg-acc py-1.5 text-xs font-bold text-txt-primary hover:bg-acc/80 transition-colors"
            >
              Recalculate Slices
            </button>
          </div>
        </div>
      </div>

      {/* ── Strategy Output Banner ── */}
      <div className={`rounded-[8px] border p-4 ${currentAlgoColor.bg} ${currentAlgoColor.border}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`text-base font-bold font-mono ${currentAlgoColor.text}`}>
              {plan.selected_algo}
            </span>
            <span className="rounded bg-bg/60 px-2 py-0.5 text-[10px] font-mono text-txt-secondary">
              {plan.slice_count} Child Slices · {plan.duration_minutes}m Window
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSimulateExecution}
              disabled={executing || plan.child_slices.length === 0}
              className="rounded bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-mono font-bold text-emerald-400 hover:bg-emerald-500/30 transition-all disabled:opacity-50"
            >
              {executing ? `Executing (${executedCount}/${plan.child_slices.length})...` : "▶ Simulate Slice Execution"}
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-txt-secondary leading-relaxed">
          {plan.algo_description}
        </p>
        <div className="mt-3 flex flex-wrap gap-4 text-xs font-mono">
          <div>
            Target Notional: <span className="font-bold text-txt-primary">₹{inrCompact(plan.target_notional)}</span>
          </div>
          <div>
            Total Shares: <span className="font-bold text-txt-primary">{num(plan.total_shares, 0)}</span>
          </div>
          <div>
            Order % ADTV: <span className="font-bold text-acc">{plan.order_pct_adtv.toFixed(4)}%</span>
          </div>
          <div>
            Participation Rate: <span className="font-bold text-txt-primary">{(plan.participation_rate * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* ── Child Order Slices Table ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary overflow-hidden">
        <div className="px-4 py-3 border-b border-line-subtle flex items-center justify-between">
          <span className="text-xs font-bold uppercase font-mono text-txt-muted">
            Child Slices Execution Schedule ({plan.child_slices.length} Orders)
          </span>
          <span className="text-[11px] font-mono text-txt-disabled">
            Limit Offset: ±0.05% Microprice · Indian Market Trading Hours
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b border-line-subtle bg-surface/40 text-[10px] uppercase text-txt-disabled">
              <tr>
                <th className="py-2.5 pl-4">Slice #</th>
                <th className="py-2.5 text-center">Side</th>
                <th className="py-2.5 text-right">Shares</th>
                <th className="py-2.5 text-right">Notional (₹)</th>
                <th className="py-2.5 text-right">Time Offset</th>
                <th className="py-2.5 text-right">Limit Price</th>
                <th className="py-2.5 text-right">Est. Slippage</th>
                <th className="py-2.5 text-right">Particip. Rate</th>
                <th className="py-2.5 pr-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-subtle/50">
              {plan.child_slices.map((slice, idx) => {
                const isExecuted = executedCount > idx;
                return (
                  <tr
                    key={slice.slice_index}
                    className={`transition-colors ${
                      isExecuted ? "bg-emerald-500/10 text-emerald-300" : "hover:bg-surface/30"
                    }`}
                  >
                    <td className="py-2.5 pl-4 font-bold text-txt-primary">
                      #{slice.slice_index}
                    </td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          slice.side === "BUY"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        {slice.side}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-medium text-txt-primary">
                      {num(slice.shares, 0)}
                    </td>
                    <td className="py-2.5 text-right text-txt-secondary">
                      ₹{inrCompact(slice.notional_inr).replace("₹", "")}
                    </td>
                    <td className="py-2.5 text-right text-txt-muted">
                      +{slice.time_offset_mins}m
                    </td>
                    <td className="py-2.5 text-right font-medium text-txt-primary">
                      ₹{num(slice.limit_price, 2)}
                    </td>
                    <td className="py-2.5 text-right text-amber-400">
                      {slice.estimated_slippage_bps.toFixed(2)} bps
                    </td>
                    <td className="py-2.5 text-right text-txt-muted">
                      {(slice.participation_rate * 100).toFixed(0)}%
                    </td>
                    <td className="py-2.5 pr-4 text-center">
                      <span
                        className={`rounded px-2 py-0.5 text-[9px] font-bold ${
                          isExecuted
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-surface/50 text-txt-disabled"
                        }`}
                      >
                        {isExecuted ? "FILLED" : slice.execution_status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

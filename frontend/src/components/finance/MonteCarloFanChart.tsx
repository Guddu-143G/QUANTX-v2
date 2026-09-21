import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
} from "recharts";
import { type MonteCarloStressResponse } from "../../services/v30";
import { inrCompact, num } from "../../lib/format";

interface MonteCarloFanChartProps {
  data: MonteCarloStressResponse;
  rateShiftBps: number;
  onRateShiftChange: (val: number) => void;
  selectedHorizon: "30d" | "90d" | "365d";
  onHorizonChange: (h: "30d" | "90d" | "365d") => void;
  loading?: boolean;
}

export const MonteCarloFanChart: React.FC<MonteCarloFanChartProps> = ({
  data,
  rateShiftBps,
  onRateShiftChange,
  selectedHorizon,
  onHorizonChange,
  loading = false,
}) => {
  const {
    n_paths,
    median_final_nav,
    var_95_nav,
    var_95_pct,
    var_99_pct,
    cvar_95_pct,
    max_drawdown_95_pct,
    stress_status,
    wacc_stress,
    horizon_forecasts,
    percentile_trajectories,
    capital_tier_transition_matrix,
  } = data;

  const currentHorizonData = horizon_forecasts[selectedHorizon];

  return (
    <div className="space-y-4">
      {/* ── Top Controls & Shock Banner ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-txt-primary">
                100,000-Path Monte Carlo Rate Stress Simulator
              </h3>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold font-mono ${
                  stress_status === "PASS"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse"
                }`}
              >
                STRESS TEST: {stress_status}
              </span>
            </div>
            <p className="text-xs text-txt-muted mt-0.5">
              Cox-Ingersoll-Ross (CIR) Interest Rate Diffusion coupled with Stochastic Volatility SDE
            </p>
          </div>

          {/* Horizon Selection Buttons */}
          <div className="flex items-center gap-1 rounded-[6px] border border-line-subtle bg-bg p-1">
            {(["30d", "90d", "365d"] as const).map((h) => (
              <button
                key={h}
                onClick={() => onHorizonChange(h)}
                className={`rounded px-3 py-1 text-xs font-mono font-bold transition-all ${
                  selectedHorizon === h
                    ? "bg-acc text-txt-primary shadow-sm"
                    : "text-txt-secondary hover:text-txt-primary"
                }`}
              >
                {h.toUpperCase()} Horizon
              </button>
            ))}
          </div>
        </div>

        {/* Rate Shock Slider */}
        <div className="mt-4 rounded-[6px] border border-line-subtle bg-bg/50 p-3.5">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-txt-muted">Macro Policy Rate Shift Scenario (Δr):</span>
            <span className="text-sm font-bold text-acc">
              {rateShiftBps >= 0 ? `+${rateShiftBps}` : rateShiftBps} bps (
              {data.benchmark_repo_rate_pct.toFixed(2)}% ➔ {data.target_repo_rate_pct.toFixed(2)}%)
            </span>
          </div>
          <input
            type="range"
            min="-250"
            max="350"
            step="25"
            value={rateShiftBps}
            onChange={(e) => onRateShiftChange(parseInt(e.target.value, 10))}
            className="w-full accent-acc cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-txt-disabled mt-1.5">
            <span>-250 bps (Aggressive Cut)</span>
            <span>0 bps (Status Quo 6.50%)</span>
            <span>+150 bps (Hawkish Stance)</span>
            <span>+350 bps (Emergency Hike)</span>
          </div>
        </div>
      </div>

      {/* ── Key KPI Ribbon ── */}
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-3">
          <div className="text-[10.5px] uppercase font-mono text-txt-muted">Median Horizon NAV</div>
          <div className="mt-1 text-lg font-bold font-mono text-txt-primary">
            ₹{inrCompact(currentHorizonData?.median_nav || median_final_nav).replace("₹", "")}
          </div>
          <div className="text-[10px] text-txt-disabled mt-0.5">
            Return: {currentHorizonData?.expected_return_pct >= 0 ? "+" : ""}{currentHorizonData?.expected_return_pct.toFixed(2)}%
          </div>
        </div>

        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-3">
          <div className="text-[10.5px] uppercase font-mono text-txt-muted">95% Value-at-Risk (VaR)</div>
          <div className="mt-1 text-lg font-bold font-mono text-amber-400">
            {var_95_pct.toFixed(2)}%
          </div>
          <div className="text-[10px] text-txt-disabled mt-0.5">
            Floor: ₹{inrCompact(currentHorizonData?.var_95_nav || var_95_nav).replace("₹", "")}
          </div>
        </div>

        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-3">
          <div className="text-[10.5px] uppercase font-mono text-txt-muted">95% Expected Shortfall (CVaR)</div>
          <div className="mt-1 text-lg font-bold font-mono text-rose-400">
            {cvar_95_pct.toFixed(2)}%
          </div>
          <div className="text-[10px] text-txt-disabled mt-0.5">99% VaR: {var_99_pct.toFixed(2)}%</div>
        </div>

        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-3">
          <div className="text-[10.5px] uppercase font-mono text-txt-muted">Max Drawdown (95th %ile)</div>
          <div className="mt-1 text-lg font-bold font-mono text-rose-400">
            {max_drawdown_95_pct.toFixed(2)}%
          </div>
          <div className="text-[10px] text-txt-disabled mt-0.5">Cutoff: -20.00%</div>
        </div>

        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-3">
          <div className="text-[10.5px] uppercase font-mono text-txt-muted">Stressed WACC</div>
          <div className="mt-1 text-lg font-bold font-mono text-txt-primary">
            {wacc_stress.stressed_wacc_pct.toFixed(2)}%
          </div>
          <div className="text-[10px] text-txt-disabled mt-0.5">
            Δ {wacc_stress.wacc_delta_bps > 0 ? `+${wacc_stress.wacc_delta_bps}` : wacc_stress.wacc_delta_bps} bps
          </div>
        </div>

        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-3">
          <div className="text-[10.5px] uppercase font-mono text-txt-muted">DSCR Erosion</div>
          <div className="mt-1 text-lg font-bold font-mono text-amber-400">
            -{wacc_stress.dscr_erosion_pct.toFixed(1)}%
          </div>
          <div className="text-[10px] text-txt-disabled mt-0.5">Under rate passthrough</div>
        </div>
      </div>

      {/* ── Stochastic Percentile Trajectory Fan Chart ── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8 rounded-[8px] border border-line-subtle bg-bg-secondary p-4">
          <div className="mb-3 flex items-center justify-between border-b border-line-subtle pb-3">
            <div>
              <h4 className="text-xs font-bold uppercase font-mono text-txt-muted">
                Stochastic SDE Fan Chart (p5 / p25 / Median / p75 / p95)
              </h4>
              <p className="text-[11px] text-txt-secondary">
                Simulated over {n_paths.toLocaleString()} sample paths with CIR interest rate diffusion
              </p>
            </div>
            <span className="font-mono text-[11px] text-txt-muted">
              Horizon: {selectedHorizon.toUpperCase()} ({percentile_trajectories.length} checkpoints)
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={percentile_trajectories} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="fanOuter" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fanInner" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis
                  dataKey="day"
                  stroke="#64748b"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  tickFormatter={(val) => `D${val}`}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  tickFormatter={(val) => `₹${inrCompact(val).replace("₹", "")}`}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const pt = payload[0].payload;
                      return (
                        <div className="rounded-[6px] border border-line bg-bg-secondary p-2.5 font-mono text-[11px] shadow-xl">
                          <div className="font-bold text-txt-primary mb-1">Day {pt.day} Trajectory</div>
                          <div className="text-emerald-400">95th %ile (Bull): ₹{inrCompact(pt.p95)}</div>
                          <div className="text-cyan-400">75th %ile: ₹{inrCompact(pt.p75)}</div>
                          <div className="text-txt-primary font-bold">50th %ile (Median): ₹{inrCompact(pt.p50_median)}</div>
                          <div className="text-amber-400">25th %ile: ₹{inrCompact(pt.p25)}</div>
                          <div className="text-rose-400">5th %ile (Tail): ₹{inrCompact(pt.p5)}</div>
                          <div className="text-txt-muted mt-1 text-[10px]">CIR Rate: {pt.mean_rate_pct.toFixed(2)}%</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* 95th percentile area */}
                <Area type="monotone" dataKey="p95" stroke="#3b82f6" fill="url(#fanOuter)" strokeWidth={1} />
                {/* 75th percentile area */}
                <Area type="monotone" dataKey="p75" stroke="#06b6d4" fill="url(#fanInner)" strokeWidth={1} />
                {/* Median line */}
                <Line type="monotone" dataKey="p50_median" stroke="#10b981" strokeWidth={2.5} dot={false} />
                {/* 25th percentile line */}
                <Line type="monotone" dataKey="p25" stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 3" dot={false} />
                {/* 5th percentile line */}
                <Line type="monotone" dataKey="p5" stroke="#ef4444" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Capital Tier Transition Probability Matrix Heatmap ── */}
        <div className="xl:col-span-4 rounded-[8px] border border-line-subtle bg-bg-secondary p-4 space-y-3">
          <div>
            <h4 className="text-xs font-bold uppercase font-mono text-txt-muted">
              Capital Grade Transition Matrix P(Grade_t ➔ Grade_{"{t+1}"})
            </h4>
            <p className="text-[11px] text-txt-secondary">
              Markov transition probabilities under rate shock Δr = {rateShiftBps} bps
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center font-mono text-xs">
              <thead>
                <tr className="border-b border-line-subtle text-[10px] text-txt-muted uppercase">
                  <th className="py-2 text-left pl-2">From \ To</th>
                  <th className="py-2">S</th>
                  <th className="py-2">A</th>
                  <th className="py-2">B</th>
                  <th className="py-2">C</th>
                  <th className="py-2 pr-2">D</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-subtle/50">
                {capital_tier_transition_matrix.map((row) => (
                  <tr key={row.from_grade} className="hover:bg-surface/30">
                    <td className="py-2 text-left pl-2 font-bold text-txt-primary">
                      Grade {row.from_grade}
                    </td>
                    <td className={`py-2 ${row.to_S > 0.3 ? "bg-emerald-500/20 text-emerald-400 font-bold" : "text-txt-muted"}`}>
                      {(row.to_S * 100).toFixed(0)}%
                    </td>
                    <td className={`py-2 ${row.to_A > 0.3 ? "bg-emerald-500/15 text-emerald-400" : "text-txt-muted"}`}>
                      {(row.to_A * 100).toFixed(0)}%
                    </td>
                    <td className={`py-2 ${row.to_B > 0.3 ? "bg-amber-500/15 text-amber-400" : "text-txt-muted"}`}>
                      {(row.to_B * 100).toFixed(0)}%
                    </td>
                    <td className={`py-2 ${row.to_C > 0.3 ? "bg-orange-500/20 text-orange-400" : "text-txt-muted"}`}>
                      {(row.to_C * 100).toFixed(0)}%
                    </td>
                    <td className={`py-2 pr-2 ${row.to_D > 0.2 ? "bg-rose-500/25 text-rose-400 font-bold" : "text-txt-muted"}`}>
                      {(row.to_D * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded bg-bg/50 p-2.5 text-[11px] text-txt-disabled">
            ℹ Grade transitions model institutional downgrade risk from increased borrowing costs and interest coverage contraction.
          </div>
        </div>
      </div>
    </div>
  );
};

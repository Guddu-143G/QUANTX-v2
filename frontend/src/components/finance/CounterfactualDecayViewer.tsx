import React, { useState, useEffect } from "react";
import {
  type CounterfactualStressResponse,
  type AlphaDecayMonitorResponse,
  worldModelV31Service,
} from "../../services/v31";
import { inr, inrCompact, pct, num } from "../../lib/format";
import {
  BrainCircuit,
  Flame,
  TrendingDown,
  TrendingUp,
  AlertOctagon,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Sparkles,
  BarChart2,
  GitBranch,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";

export const CounterfactualDecayViewer: React.FC = () => {
  const [stressData, setStressData] = useState<CounterfactualStressResponse | null>(null);
  const [decayData, setDecayData] = useState<AlphaDecayMonitorResponse | null>(null);
  const [loadingStress, setLoadingStress] = useState(false);
  const [loadingDecay, setLoadingDecay] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>("CRUDE_OIL_SURGE_25PCT");
  const [error, setError] = useState<string | null>(null);

  const scenarios = [
    { id: "CRUDE_OIL_SURGE_25PCT", name: "Crude Oil Surge (+25%)", icon: Flame, color: "text-amber-400" },
    { id: "RBI_REPO_HIKE_50BPS", name: "RBI Repo Hike (+50 bps)", icon: TrendingUp, color: "text-purple-400" },
    { id: "GLOBAL_TECH_CRASH_8PCT", name: "Global Tech Crash (-8%)", icon: TrendingDown, color: "text-rose-400" },
    { id: "USD_INR_DEPRECIATION_3PCT", name: "USD/INR Depr (-3%)", icon: GitBranch, color: "text-cyan-400" },
  ];

  const fetchStress = async (scenarioId: string) => {
    setLoadingStress(true);
    setError(null);
    try {
      const res = await worldModelV31Service.evaluateCounterfactualShocks({ scenario_id: scenarioId });
      setStressData(res);
    } catch (err: any) {
      setError(err.message || "Counterfactual stress evaluation failed.");
    } finally {
      setLoadingStress(false);
    }
  };

  const fetchDecay = async () => {
    setLoadingDecay(true);
    try {
      const res = await worldModelV31Service.monitorAlphaDecayIC();
      setDecayData(res);
    } catch (err: any) {
      console.error("Alpha decay fetch failed:", err);
    } finally {
      setLoadingDecay(false);
    }
  };

  useEffect(() => {
    fetchStress(selectedScenario);
    fetchDecay();
  }, [selectedScenario]);

  const chartData = decayData?.factors.map((f) => ({
    name: f.factor_name,
    baseline: parseFloat((f.baseline_ic * 100).toFixed(2)),
    rolling21d: parseFloat((f.rolling_ic_21d * 100).toFixed(2)),
    zScore: parseFloat(f.ic_z_score.toFixed(2)),
    isAlert: f.decay_status === "ALPHA_DECAY_ALERT",
  })) || [];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-subtle pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-500/10 text-purple-400">
                <BrainCircuit className="h-4 w-4" />
              </span>
              <h2 className="text-base font-semibold text-text-primary">
                Counterfactual Stress Engine & Alpha Decay Surveillance
              </h2>
              <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-purple-400">
                SCM Do-Calculus + 9-Factor IC
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Structural Causal Model interventions [E[Y | do(Shock)]] and continuous Information Coefficient decay tracking ($z_&#123;IC&#125; &lt; -2.0$).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchStress(selectedScenario);
                fetchDecay();
              }}
              disabled={loadingStress || loadingDecay}
              className="flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-purple-500 disabled:opacity-50 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingStress || loadingDecay ? "animate-spin" : ""}`} />
              Recalculate SCM & IC
            </button>
          </div>
        </div>

        {/* ── Scenario Picker Buttons ── */}
        <div className="mt-4">
          <label className="text-xs font-medium text-text-muted">Select Causal Intervention Scenario:</label>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {scenarios.map((sc) => {
              const Icon = sc.icon;
              const isSelected = selectedScenario === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenario(sc.id)}
                  className={`flex items-center gap-2.5 rounded-[8px] border p-3 text-left transition ${
                    isSelected
                      ? "border-purple-500/50 bg-purple-500/10 shadow-sm"
                      : "border-line-subtle bg-bg-primary hover:border-purple-500/30"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${sc.color}`} />
                  <div>
                    <div className="text-xs font-semibold text-text-primary">{sc.name}</div>
                    <div className="text-[10px] text-text-muted font-mono">{sc.id.split("_")[0]}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-[8px] border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-400">
          <AlertOctagon className="mr-2 inline h-4 w-4" />
          {error}
        </div>
      )}

      {/* ── Stress Impact Summary ── */}
      {stressData && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Scenario Causal Formula */}
            <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-4">
              <span className="text-xs font-medium text-text-muted">Causal Intervention</span>
              <div className="mt-2 text-xs font-mono font-bold text-purple-400 break-words">
                {stressData.causal_intervention}
              </div>
              <p className="mt-1 text-[11px] text-text-muted">Pearl's do-calculus DAG propagation</p>
            </div>

            {/* Portfolio Impact % */}
            <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-4">
              <span className="text-xs font-medium text-text-muted">Portfolio P&L Delta</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-2xl font-bold font-mono ${
                  stressData.portfolio_impact_pct >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {pct(stressData.portfolio_impact_pct, 2)}
                </span>
                <span className="text-xs font-mono text-text-muted">
                  ({inrCompact(stressData.total_pnl_impact_inr)})
                </span>
              </div>
              <p className="mt-1 text-[11px] text-text-muted">Across active institutional book</p>
            </div>

            {/* Stressed Notional Value */}
            <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-4">
              <span className="text-xs font-medium text-text-muted">Total Portfolio Notional</span>
              <div className="mt-2 text-xl font-bold font-mono text-text-primary">
                {inrCompact(stressData.total_portfolio_notional)}
              </div>
              <p className="mt-1 text-[11px] text-text-muted">Pre-shock aggregate balance</p>
            </div>

            {/* Stress Resilience Status */}
            <div className={`rounded-[8px] border p-4 ${
              stressData.stress_resilience === "RESILIENT"
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-rose-500/30 bg-rose-500/10"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-muted">Resilience Status</span>
                {stressData.stress_resilience === "RESILIENT" ? (
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertOctagon className="h-4 w-4 text-rose-400" />
                )}
              </div>
              <div className={`mt-2 text-lg font-bold font-mono ${
                stressData.stress_resilience === "RESILIENT" ? "text-emerald-400" : "text-rose-400"
              }`}>
                {stressData.stress_resilience}
              </div>
              <p className="mt-1 text-[11px] text-text-muted">
                {stressData.stress_resilience === "RESILIENT"
                  ? "P&L impact contained within institutional tolerances"
                  : "Requires defensive delta hedge or sector rebalancing"}
              </p>
            </div>
          </div>

          {/* ── Stressed Holdings Breakdown Table ── */}
          <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5">
            <div className="flex items-center justify-between border-b border-line-subtle pb-3">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-text-primary">
                  Causal DAG Propagation Across Holdings ({stressData.scenario_name})
                </h3>
              </div>
              <span className="text-xs font-mono text-text-muted">
                {stressData.stressed_holdings.length} assets evaluated
              </span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-line-subtle text-text-muted font-medium">
                    <th className="py-2 px-3">Ticker</th>
                    <th className="py-2 px-3">Sector</th>
                    <th className="py-2 px-3">Pre-Shock Value</th>
                    <th className="py-2 px-3">Causal Multiplier</th>
                    <th className="py-2 px-3">Stressed Value</th>
                    <th className="py-2 px-3">P&L Impact (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-subtle font-mono">
                  {stressData.stressed_holdings.map((h) => (
                    <tr key={h.ticker} className="hover:bg-bg-primary/50 transition">
                      <td className="py-2.5 px-3 font-semibold text-text-primary">{h.ticker}</td>
                      <td className="py-2.5 px-3">
                        <span className="rounded bg-bg-primary px-2 py-0.5 text-[10px] text-text-secondary border border-line-subtle">
                          {h.sector}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-text-primary">{inr(h.current_market_value, 0)}</td>
                      <td className="py-2.5 px-3">
                        <span className={`font-semibold ${
                          h.causal_multiplier_pct >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}>
                          {pct(h.causal_multiplier_pct, 2)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-text-primary">{inr(h.stressed_market_value, 0)}</td>
                      <td className="py-2.5 px-3 font-semibold">
                        <span className={h.pnl_impact_inr >= 0 ? "text-emerald-400" : "text-rose-400"}>
                          {inr(h.pnl_impact_inr, 0)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Rolling 9-Factor Alpha Decay Section ── */}
      {decayData && (
        <div className="space-y-4">
          {/* Recalibration Alert Banner */}
          {decayData.recalibration_required && (
            <div className="rounded-[8px] border border-amber-500/40 bg-amber-500/10 p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-amber-400 shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-amber-300">
                    AUTOMATED GRADIENT-BOOSTED ENSEMBLE RECALIBRATION TRIGGERED
                  </div>
                  <div className="mt-0.5 text-[11px] text-text-muted">
                    {decayData.decay_alerts_count} of {decayData.total_factors_tracked} factors breached $z_&#123;IC&#125; &lt; -2.0$ decay threshold. {decayData.recalibration_action}.
                  </div>
                </div>
                <span className="rounded bg-amber-500/20 px-2.5 py-1 text-[11px] font-mono font-bold text-amber-400 border border-amber-500/30">
                  REWEIGHT ACTIVE
                </span>
              </div>
            </div>
          )}

          {/* 9-Factor IC Chart & Metrics Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Factor IC Bar Comparison Chart */}
            <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-line-subtle pb-3">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-semibold text-text-primary">
                    9-Factor Information Coefficient (Baseline vs Rolling 21D)
                  </h3>
                </div>
                <span className="text-xs font-mono text-text-muted">
                  {decayData.monitoring_period}
                </span>
              </div>

              <div className="mt-4 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#9ca3af", fontSize: 10 }}
                      tickLine={false}
                      angle={-25}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis
                      tick={{ fill: "#6b7280", fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: "#374151" }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        borderColor: "#374151",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontFamily: "monospace",
                      }}
                      formatter={(value: any) => [`${Number(value).toFixed(2)}%`, ""]}
                    />
                    <Legend
                      verticalAlign="top"
                      wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }}
                    />
                    <ReferenceLine y={0} stroke="#4b5563" />
                    <Bar dataKey="baseline" name="Baseline IC" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="rolling21d" name="Rolling 21D IC" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Factor Status Table */}
            <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-line-subtle pb-3">
                  <h3 className="text-sm font-semibold text-text-primary">Factor Decay Matrix</h3>
                  <span className="text-xs font-mono text-text-muted">z-score threshold -2.0</span>
                </div>

                <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
                  {decayData.factors.map((factor) => {
                    const isAlert = factor.decay_status === "ALPHA_DECAY_ALERT";
                    return (
                      <div
                        key={factor.factor_name}
                        className={`rounded border p-2.5 transition ${
                          isAlert
                            ? "border-rose-500/40 bg-rose-500/10"
                            : "border-line-subtle bg-bg-primary"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-text-primary">
                            {factor.factor_name}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                              isAlert
                                ? "bg-rose-500/20 text-rose-400"
                                : "bg-emerald-500/20 text-emerald-400"
                            }`}
                          >
                            {factor.decay_status === "ALPHA_DECAY_ALERT" ? "DECAY ALERT" : "STABLE"}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-text-muted">
                          <span>z_IC: <strong className={isAlert ? "text-rose-400" : "text-emerald-400"}>{factor.ic_z_score.toFixed(2)}</strong></span>
                          <span>21D: {(factor.rolling_ic_21d * 100).toFixed(1)}%</span>
                          <span>Action: <strong className="text-text-primary">{factor.recommended_weight_action}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-line-subtle text-[11px] text-text-muted flex justify-between">
                <span>Total Factors: <strong className="text-text-primary">{decayData.total_factors_tracked}</strong></span>
                <span>Breached: <strong className="text-rose-400">{decayData.decay_alerts_count}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

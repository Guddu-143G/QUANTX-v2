import React, { useState, useEffect } from "react";
import {
  type CausalDagUpdateResponse,
  type CounterfactualRewardResponse,
  postQuantumV32Service,
} from "../../services/v32";
import {
  Network,
  BrainCircuit,
  GitBranch,
  AlertTriangle,
  RefreshCw,
  Zap,
  ShieldCheck,
  TrendingUp,
  Activity,
  Sliders,
  Sparkles,
} from "lucide-react";

export const SelfCorrectingCausalGraphViewer: React.FC = () => {
  const [loadingDag, setLoadingDag] = useState(false);
  const [loadingReward, setLoadingReward] = useState(false);
  const [dagData, setDagData] = useState<CausalDagUpdateResponse | null>(null);
  const [rewardData, setRewardData] = useState<CounterfactualRewardResponse | null>(null);
  const [macroShock, setMacroShock] = useState<boolean>(false);
  const [proposedAction, setProposedAction] = useState<string>("EXECUTE_ADAPTIVE_POV");
  const [error, setError] = useState<string | null>(null);

  const fetchDag = async (shock: boolean) => {
    setLoadingDag(true);
    setError(null);
    try {
      const res = await postQuantumV32Service.updateCausalDag({
        macro_shock_detected: shock,
        vpin_toxicity: shock ? 0.38 : 0.16,
        spread_bps: shock ? 18.2 : 3.8,
      });
      setDagData(res);
    } catch (err: any) {
      setError(err.message || "Failed to update causal DAG.");
    } finally {
      setLoadingDag(false);
    }
  };

  const fetchReward = async (action: string) => {
    setLoadingReward(true);
    try {
      const res = await postQuantumV32Service.computeCounterfactualReward({
        proposed_action: action,
        participation_rate: 0.08,
      });
      setRewardData(res);
    } catch (err: any) {
      console.error("Failed to compute counterfactual reward:", err);
    } finally {
      setLoadingReward(false);
    }
  };

  useEffect(() => {
    fetchDag(macroShock);
    fetchReward(proposedAction);
  }, [macroShock, proposedAction]);

  return (
    <div className="space-y-6">
      {/* ── Control Header ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-subtle pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-500/10 text-purple-400">
                <Network className="h-4 w-4" />
              </span>
              <h2 className="text-base font-semibold text-text-primary">
                Self-Correcting Causal Graph & Counterfactual RL (SC-CRL)
              </h2>
              <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-purple-400">
                Kernel PC/FCI Discovery
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Dynamically re-learns market causal graphs upon regime breaks, preventing hallucinations and optimizing RL rewards under Pearl's do-calculus.
            </p>
          </div>

          {/* Regime Shock Toggle Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMacroShock(false);
                fetchDag(false);
              }}
              className={`rounded px-3 py-1.5 text-xs font-bold transition ${
                !macroShock
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-bg-primary text-text-muted border border-line-subtle hover:text-text-primary"
              }`}
            >
              Normal Continuous Regime
            </button>
            <button
              onClick={() => {
                setMacroShock(true);
                fetchDag(true);
              }}
              className={`rounded px-3 py-1.5 text-xs font-bold transition ${
                macroShock
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                  : "bg-bg-primary text-text-muted border border-line-subtle hover:text-text-primary"
              }`}
            >
              Inject Volatility Shock
            </button>
          </div>
        </div>

        {/* ── Regime Status Indicators ── */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded border border-line-subtle bg-bg-primary p-4">
            <span className="text-xs font-medium text-text-muted">Active Causal Regime</span>
            <div
              className={`mt-2 text-sm font-bold font-mono ${
                dagData?.regime_status === "NORMAL_CONTINUOUS_REGIME"
                  ? "text-emerald-400"
                  : "text-rose-400"
              }`}
            >
              {dagData?.regime_status.replace(/_/g, " ") || "NORMAL CONTINUOUS REGIME"}
            </div>
            <div className="mt-1 text-[11px] text-text-muted">PC/FCI conditional independence test</div>
          </div>

          <div className="rounded border border-line-subtle bg-bg-primary p-4">
            <span className="text-xs font-medium text-text-muted">Active Causal Edges</span>
            <div className="mt-2 text-2xl font-bold font-mono text-cyan-400">
              {dagData?.active_causal_edges_count || 6} edges
            </div>
            <div className="mt-1 text-[11px] text-text-muted">Dynamic structural DAG links</div>
          </div>

          <div className="rounded border border-line-subtle bg-bg-primary p-4">
            <span className="text-xs font-medium text-text-muted">Kernel Independence p-value</span>
            <div className="mt-2 text-2xl font-bold font-mono text-purple-400">
              {dagData?.independence_test_p_value.toFixed(4) || "0.0840"}
            </div>
            <div className="mt-1 text-[11px] text-text-muted">
              {macroShock ? "p < 0.01: Shock dependency inserted" : "p > 0.05: Baseline structure"}
            </div>
          </div>

          <div className="rounded border border-line-subtle bg-bg-primary p-4">
            <span className="text-xs font-medium text-text-muted">Discovery Engine</span>
            <div className="mt-2 text-sm font-bold font-mono text-text-primary">
              Kernel PC/FCI Hybrid
            </div>
            <div className="mt-1 text-[11px] text-text-muted">Spirtes-Glymour-Scheines causal search</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-[8px] border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-400">
          <AlertTriangle className="mr-2 inline h-4 w-4" />
          {error}
        </div>
      )}

      {/* ── Active Causal DAG Visualizer & Edge Stream ── */}
      {dagData && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Causal Graph Edges Box */}
          <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-line-subtle pb-3">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-text-primary">
                  Structural Causal Model DAG (Directed Dependencies)
                </h3>
              </div>
              <span className="text-xs font-mono text-text-muted">
                {dagData.active_causal_edges_count} directed edges
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {dagData.causal_dag.map((edge, idx) => {
                const isContagionEdge =
                  edge.from.includes("VPIN") ||
                  edge.to.includes("Slippage") ||
                  edge.to.includes("Drawdown");
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between rounded p-3 text-xs font-mono transition ${
                      isContagionEdge
                        ? "border border-rose-500/40 bg-rose-500/10"
                        : "border border-line-subtle bg-bg-primary hover:border-purple-500/40"
                    }`}
                  >
                    <span className="font-semibold text-text-primary">{edge.from}</span>
                    <span className="text-purple-400 font-bold mx-2">→</span>
                    <span
                      className={`font-semibold ${
                        isContagionEdge ? "text-rose-400" : "text-cyan-400"
                      }`}
                    >
                      {edge.to}
                    </span>
                  </div>
                );
              })}
            </div>

            {macroShock && (
              <div className="mt-4 rounded bg-rose-500/10 p-3 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-rose-400 shrink-0" />
                <span>
                  <strong>Dynamic Causal Edge Injected:</strong> Market volatility spike triggered emerging edge: <code>Liquidity_VPIN → BidAskSpread → ExecutionSlippage</code>.
                </span>
              </div>
            )}
          </div>

          {/* Node Centrality & In/Out-Degree */}
          <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-line-subtle pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-text-primary">Node Centrality Degrees</h3>
                </div>
              </div>

              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto font-mono text-xs">
                {Object.entries(dagData.node_degrees).map(([node, degree]) => (
                  <div
                    key={node}
                    className="flex items-center justify-between rounded bg-bg-primary p-2 border border-line-subtle"
                  >
                    <span className="text-text-muted">{node}</span>
                    <span className="rounded bg-cyan-500/10 px-2 py-0.5 font-bold text-cyan-400 border border-cyan-500/30">
                      {degree} deg
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-line-subtle text-[11px] text-text-muted">
              <span>Causal Interventions: <strong>Pearl's Do-Calculus (Backdoor Adjustment)</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ── Counterfactual RL Reward Simulator ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-subtle pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-text-primary">
                Counterfactual RL Reward Under Updated Causal Structure
              </h3>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Evaluates R_counterfactual = E[Reward | do(Action), G_updated] to select the optimal execution policy.
            </p>
          </div>

          {/* Action Selector */}
          <div className="flex items-center gap-2">
            {["EXECUTE_ADAPTIVE_POV", "EXECUTE_PASSIVE_TWAP", "EXECUTE_AGGRESSIVE_MARKET"].map((act) => (
              <button
                key={act}
                onClick={() => setProposedAction(act)}
                className={`rounded px-3 py-1.5 text-xs font-mono font-bold transition ${
                  proposedAction === act
                    ? "bg-purple-600 text-white shadow"
                    : "bg-bg-primary text-text-muted border border-line-subtle hover:text-text-primary"
                }`}
              >
                {act.replace("EXECUTE_", "")}
              </button>
            ))}
          </div>
        </div>

        {rewardData && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded border border-line-subtle bg-bg-primary p-4">
              <span className="text-xs font-medium text-text-muted">Do-Calculus Formulation</span>
              <div className="mt-2 text-xs font-mono font-bold text-purple-400 break-words">
                {rewardData.do_calculus_expression}
              </div>
            </div>

            <div className="rounded border border-line-subtle bg-bg-primary p-4">
              <span className="text-xs font-medium text-text-muted">Counterfactual RL Reward</span>
              <div
                className={`mt-2 text-2xl font-bold font-mono ${
                  rewardData.counterfactual_reward >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {rewardData.counterfactual_reward >= 0 ? "+" : ""}
                {rewardData.counterfactual_reward.toFixed(3)}
              </div>
              <div className="mt-1 text-[11px] text-text-muted">Expected policy return</div>
            </div>

            <div className="rounded border border-line-subtle bg-bg-primary p-4">
              <span className="text-xs font-medium text-text-muted">Expected Slippage</span>
              <div
                className={`mt-2 text-2xl font-bold font-mono ${
                  rewardData.expected_slippage_bps <= 15.0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {rewardData.expected_slippage_bps.toFixed(1)} <span className="text-xs font-normal">bps</span>
              </div>
              <div className="mt-1 text-[11px] text-text-muted">Under updated causal DAG</div>
            </div>

            <div className="rounded border border-purple-500/30 bg-purple-500/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-muted">Recommended Action</span>
                <ShieldCheck className="h-4 w-4 text-purple-400" />
              </div>
              <div className="mt-2 text-sm font-bold font-mono text-purple-300">
                {rewardData.recommended_strategy}
              </div>
              <div className="mt-1 text-[11px] text-text-muted">Maximizes counterfactual reward</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

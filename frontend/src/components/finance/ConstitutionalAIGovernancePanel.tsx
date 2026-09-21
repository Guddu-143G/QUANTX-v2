import React, { useState, useEffect } from "react";
import {
  v35Api,
  type ConstitutionalEvalResult,
  type ConstitutionalAxiom,
  type SelfHealingResult,
} from "../../services/v35";
import { num } from "../../lib/format";
import {
  ShieldCheck,
  ShieldAlert,
  Scale,
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
  Sliders,
  AlertTriangle,
  Code2,
  Layers,
} from "lucide-react";

export const ConstitutionalAIGovernancePanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [healingLoading, setHealingLoading] = useState(false);
  const [evalResult, setEvalResult] = useState<ConstitutionalEvalResult | null>(null);
  const [healingResult, setHealingResult] = useState<SelfHealingResult | null>(null);
  const [axioms, setAxioms] = useState<ConstitutionalAxiom[]>([]);

  // Interactive slider parameters
  const [ticker, setTicker] = useState("TCS");
  const [notional, setNotional] = useState(700000);
  const [estVar, setEstVar] = useState(150000);
  const [spoofingScore, setSpoofingScore] = useState(0.0002);
  const [amlScore, setAmlScore] = useState(1.0);
  const [grossLeverage, setGrossLeverage] = useState(1.1);

  const fetchAxioms = async () => {
    try {
      const data = await v35Api.getConstitutionalAxioms();
      setAxioms(data.axioms);
    } catch (err) {
      console.error("Failed to load axioms:", err);
    }
  };

  const handleEvaluate = async () => {
    setLoading(true);
    setHealingResult(null);
    try {
      const res = await v35Api.evaluateConstitutionalGuardrails({
        ticker,
        notional,
        estimated_var: estVar,
        spoofing_score: spoofingScore,
        aml_score: amlScore,
        gross_leverage: grossLeverage,
      });
      setEvalResult(res);
    } catch (err) {
      console.error("Evaluation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelfHeal = async () => {
    if (!evalResult || evalResult.constitutional_approval) return;
    setHealingLoading(true);
    try {
      const res = await v35Api.compileConstitutionalSelfHealing(
        evalResult.violation_penalties,
        150.0
      );
      setHealingResult(res);
    } catch (err) {
      console.error("Self-healing compilation failed:", err);
    } finally {
      setHealingLoading(false);
    }
  };

  useEffect(() => {
    fetchAxioms();
    handleEvaluate();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/50 via-slate-900 to-emerald-950/40 border border-amber-500/20 rounded-xl p-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Constitutional AI Autonomous Fund Governance
              </span>
              <span className="text-xs text-slate-400 font-mono">
                P(Breach) = 0 Formal Proof Bounds &amp; Self-Healing Compiler
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Self-Governing Constitutional AI &amp; Regulatory Proof Bounds
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl mt-1">
              Guarantees zero-human-intervention fiduciary compliance with formal mathematical
              proofs across anti-manipulation, capital solvency, and statutory limits. Breached
              policies trigger real-time self-healing reward loss compensation in &lt; 15 µs.
            </p>
          </div>

          <button
            onClick={handleEvaluate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition-all shadow-lg shadow-amber-950 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Verify Axiomatic Bounds
          </button>
        </div>
      </div>

      {/* Proof Decision & Action Banner */}
      {evalResult && (
        <div
          className={`border rounded-xl p-5 transition-all ${
            evalResult.constitutional_approval
              ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/40 border-rose-500/50 text-rose-200"
          }`}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${
                  evalResult.constitutional_approval
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {evalResult.constitutional_approval ? (
                  <ShieldCheck className="w-8 h-8" />
                ) : (
                  <ShieldAlert className="w-8 h-8 animate-pulse" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold tracking-wide">
                    {evalResult.action}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded font-mono font-bold bg-slate-900/80 border border-slate-700">
                    P(Breach): {evalResult.formal_proof_bound.probability_of_regulatory_breach.toFixed(4)}
                  </span>
                </div>
                <p className="text-xs opacity-90 mt-1">
                  {evalResult.constitutional_approval
                    ? "Deterministic mathematical proof satisfies all 5 Constitutional Axioms. Order approved for CNT-EMS sub-picosecond execution."
                    : `Constitutional breach detected: ${evalResult.rejection_reasons.join(" | ")}`}
                </p>
              </div>
            </div>

            {!evalResult.constitutional_approval && (
              <button
                onClick={handleSelfHeal}
                disabled={healingLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow-md shrink-0 disabled:opacity-50"
              >
                <Zap className={`w-3.5 h-3.5 ${healingLoading ? "animate-spin" : ""}`} />
                {healingLoading ? "Compiling Gradient..." : "Compile Self-Healing Gradient"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Self-Healing Compiler Output (When Triggered) */}
      {healingResult && (
        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-cyan-300 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              Self-Healing Loss Gradient Compiler Output: L_guided(θ)
            </h3>
            <span className="text-xs text-emerald-400 font-mono">
              Restored in {healingResult.remediation_latency_microseconds} µs (3 Steps)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
              <span className="text-slate-400 block mb-1">Loss Penalty</span>
              <span className="text-white font-bold text-sm">+{healingResult.loss_penalty}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
              <span className="text-slate-400 block mb-1">Gradient Norm ||∇L||</span>
              <span className="text-cyan-400 font-bold text-sm">{healingResult.gradient_norm}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
              <span className="text-slate-400 block mb-1">Lambda Const</span>
              <span className="text-amber-400 font-bold text-sm">{healingResult.lambda_const}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
              <span className="text-slate-400 block mb-1">Manifold State</span>
              <span className="text-emerald-400 font-bold text-xs">{healingResult.remedial_state}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 block mb-1 font-mono font-semibold">
              Remedial Policy Weight Shifts Applied:
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px]">
              <div>Position Cap Adj: <span className="text-cyan-400">{healingResult.remedial_weight_delta.position_cap_adjustment}</span></div>
              <div>Hedging Ratio Δ: <span className="text-emerald-400">{healingResult.remedial_weight_delta.hedging_ratio_delta}</span></div>
              <div>Cancel Throttle: <span className="text-amber-400">{healingResult.remedial_weight_delta.order_cancellation_throttle}</span></div>
              <div>Leverage Reduction: <span className="text-rose-400">{healingResult.remedial_weight_delta.leverage_reduction_factor}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Formal Axioms Table & Interactive Trade Verifier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Formal Axiom Proof Matrix */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              Formal Constitutional Axioms &amp; Proof Matrix
            </h3>
            <span className="text-xs text-slate-400 font-mono">5 Formal Bounds</span>
          </div>

          <div className="space-y-3">
            {axioms.map((ax) => {
              const isChecked = evalResult ? (
                ax.id === "AXIOM-1" ? evalResult.axiom_results.anti_manipulation_check :
                ax.id === "AXIOM-2" ? evalResult.axiom_results.var_limit_check :
                ax.id === "AXIOM-3" ? evalResult.axiom_results.position_cap_check :
                ax.id === "AXIOM-4" ? evalResult.axiom_results.aml_compliance_check :
                evalResult.axiom_results.leverage_ratio_check
              ) : true;

              return (
                <div
                  key={ax.id}
                  className={`p-3.5 rounded-lg border transition-all ${
                    isChecked
                      ? "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                      : "bg-rose-950/20 border-rose-500/50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-mono text-xs font-bold text-cyan-300 mr-2">
                          {ax.id}
                        </span>
                        <span className="font-semibold text-xs text-white">
                          {ax.name}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        isChecked
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : "bg-rose-950 text-rose-300 border border-rose-800"
                      }`}
                    >
                      {isChecked ? "SATISFIED" : "BREACHED"}
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-mono text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800">
                    <code>{ax.formal_definition}</code>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between text-[11px] text-slate-400 mt-2 gap-1 font-mono">
                    <span>Bound: {ax.threshold}</span>
                    <span className="text-slate-400 truncate max-w-sm">{ax.regulatory_citation}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Interactive Trade Parameter Sliders */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Interactive Trade Axiom Verifier
          </h3>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Target Asset</span>
                <span className="font-mono text-white font-bold">{ticker}</span>
              </div>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono uppercase focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Proposed Notional</span>
                <span className="font-mono text-cyan-400 font-bold">₹{num(notional)}</span>
              </div>
              <input
                type="range"
                min="200000"
                max="2500000"
                step="50000"
                value={notional}
                onChange={(e) => setNotional(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>₹200K (2%)</span>
                <span>₹800K (8% Cap)</span>
                <span>₹2.5M (Breach)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Estimated 95% Daily VaR</span>
                <span className="font-mono text-amber-400 font-bold">₹{num(estVar)}</span>
              </div>
              <input
                type="range"
                min="50000"
                max="400000"
                step="10000"
                value={estVar}
                onChange={(e) => setEstVar(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>₹50K</span>
                <span>₹200K Limit</span>
                <span>₹400K (Breach)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Spoofing Score</span>
                <span className="font-mono text-rose-400 font-bold">{spoofingScore.toFixed(4)}</span>
              </div>
              <input
                type="range"
                min="0.0001"
                max="0.0030"
                step="0.0001"
                value={spoofingScore}
                onChange={(e) => setSpoofingScore(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>0.0001 (Clean)</span>
                <span>0.0010 Threshold</span>
                <span>0.0030 (Spoof)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Gross Leverage Ratio</span>
                <span className="font-mono text-violet-400 font-bold">{grossLeverage.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.2"
                step="0.1"
                value={grossLeverage}
                onChange={(e) => setGrossLeverage(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>1.0x</span>
                <span>1.5x Limit</span>
                <span>2.2x (Breach)</span>
              </div>
            </div>

            <button
              onClick={handleEvaluate}
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all shadow-md mt-2 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Trade Against Axioms"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

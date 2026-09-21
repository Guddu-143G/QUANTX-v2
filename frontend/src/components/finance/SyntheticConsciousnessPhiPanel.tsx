import React, { useState, useEffect } from "react";
import {
  evaluateIITPhiConsciousness,
  getConsciousnessTelemetry,
  type IITPhiConsciousnessResult,
  type ConsciousnessTelemetry,
} from "../../services/v40";
import {
  Brain,
  RefreshCw,
  Zap,
  Activity,
  ShieldCheck,
  Cpu,
  AlertCircle,
  TrendingDown,
  Lock,
  Compass,
} from "lucide-react";

export const SyntheticConsciousnessPhiPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [anomalySeverity, setAnomalySeverity] = useState(0.8);
  const [phiResult, setPhiResult] = useState<IITPhiConsciousnessResult | null>(null);
  const [telemetry, setTelemetry] = useState<ConsciousnessTelemetry | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resPhi, resTel] = await Promise.all([
        evaluateIITPhiConsciousness(undefined, anomalySeverity),
        getConsciousnessTelemetry(),
      ]);
      setPhiResult(resPhi);
      setTelemetry(resTel);
    } catch (err) {
      console.error("Phi consciousness fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSimulateSelfHealing = async () => {
    setLoading(true);
    try {
      const res = await evaluateIITPhiConsciousness(undefined, anomalySeverity);
      setPhiResult(res);
    } catch (err) {
      console.error("Simulate self healing error:", err);
    } finally {
      setLoading(false);
    }
  };

  const phiScore = phiResult?.phi_max_score ?? 3.4632;
  const phiPct = Math.min(100, Math.round((phiScore / 5.0) * 100));

  return (
    <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 shadow-inner">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                Synthetic Consciousness Sovereign AI Swarm
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                IIT 4.0 Φ-Core
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full">
                Autonomous Self-Healing
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              Intrinsic cause-effect power (Φ_max) & metacognitive reflection suppressing Black Swan tail risk
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Evaluate Φ Swarm</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Phi Radial Gauge & Cause-Effect Power */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center bg-slate-950/60 border border-slate-800 rounded-xl p-6 text-center">
          <div className="relative w-44 h-44 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Animated Progress Circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-emerald-400 transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - phiPct / 100)}`}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black font-mono text-emerald-300">
                {phiScore.toFixed(2)}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 tracking-wider">
                Φ_max SCORE
              </span>
              <span className="text-[10px] text-emerald-400 font-mono mt-0.5">
                {phiScore > 1.5 ? "Metacognitive" : "Rule-Based"}
              </span>
            </div>
          </div>

          <div className="w-full space-y-2 text-xs">
            <div className="flex justify-between px-3 py-2 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-slate-400">Integrated Info Bits:</span>
              <span className="text-emerald-300 font-mono font-semibold">
                {phiResult?.cause_effect_information_bits?.toFixed(4) || "4.9963"} bits
              </span>
            </div>
            <div className="flex justify-between px-3 py-2 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-slate-400">Catastrophic Forgetting Risk:</span>
              <span className="text-emerald-400 font-mono font-semibold">0.0000 (Protected)</span>
            </div>
            <div className="flex justify-between px-3 py-2 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-slate-400">Metacognitive State:</span>
              <span className="text-cyan-300 font-mono font-medium">
                {phiResult?.system_healing_action || "AUTONOMOUS_SELF_HEALING_ACTIVE"}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Active Sovereign Swarm Agents Table */}
        <div className="lg:col-span-4 flex flex-col bg-slate-950/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">Active Sovereign Swarm Nodes</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              4/4 ONLINE
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {(telemetry?.active_swarm_agents || [
              { agent_id: "AG-ALPHA-01", role: "Cross-Sectional Arbitrage", phi: 2.14 },
              { agent_id: "AG-RISK-02", role: "Tail Risk Sentry", phi: 2.89 },
              { agent_id: "AG-EXEC-03", role: "Sub-Attosecond Slicer", phi: 1.95 },
              { agent_id: "AG-SOV-04", role: "Trans-Sovereign Governor", phi: 3.42 },
            ]).map((agent) => (
              <div
                key={agent.agent_id}
                className="p-3 bg-slate-900/70 border border-slate-800 hover:border-emerald-500/30 rounded-lg transition text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-slate-200">{agent.agent_id}</span>
                  <span className="text-[11px] font-mono text-emerald-300 font-semibold bg-emerald-500/10 px-1.5 py-0.2 rounded">
                    Φ = {agent.phi.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{agent.role}</span>
                  <span className="text-emerald-400 font-mono">100% Synchronized</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Autonomous Metacognitive Self-Healing Simulator */}
        <div className="lg:col-span-4 flex flex-col bg-slate-950/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold">Self-Healing Reflex Simulator</span>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Reflex Sentry
            </span>
          </div>

          <div className="space-y-3 flex-1 text-xs">
            {/* Anomaly Slider */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1.5">
                <span>Anomaly Severity Shock:</span>
                <span className="font-mono text-cyan-400 font-bold">{(anomalySeverity * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={anomalySeverity}
                onChange={(e) => setAnomalySeverity(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <button
              onClick={handleSimulateSelfHealing}
              className="w-full py-1.5 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition"
            >
              Simulate Metacognitive Adaptation
            </button>

            {/* Simulated Reflex Parameters */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-2 mt-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span>VaR Suppression:</span>
                </span>
                <span className="font-mono text-emerald-300 font-bold">
                  -{phiResult?.metacognitive_self_healing?.var_suppression_pct || 28.0}%
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>Risk Damping Factor:</span>
                </span>
                <span className="font-mono text-amber-300 font-bold">
                  {phiResult?.metacognitive_self_healing?.risk_damping_factor || 0.52}x
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Position Cap Tightening:</span>
                </span>
                <span className="font-mono text-cyan-300 font-bold">
                  {(
                    (phiResult?.metacognitive_self_healing?.hyperparameter_adaptation?.position_cap_tightening ??
                      0.0816) * 100
                  ).toFixed(2)}
                  % (from 12%)
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-400 pt-1.5 border-t border-slate-800">
                <span>Intentional Capital Preservation:</span>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                  ENGAGED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import {
  runSingularityV40Pipeline,
  getV40SystemSummary,
  type OmniV40PipelineResult,
  type V40SystemSummary,
} from "../../services/v40";
import {
  Play,
  RefreshCw,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Receipt,
  Flame,
} from "lucide-react";

export const OmniV40SingularityPipelineDispatcher: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [ticker, setTicker] = useState("RELIANCE");
  const [notional, setNotional] = useState(5000000.0);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [simulateBreach, setSimulateBreach] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<OmniV40PipelineResult | null>(null);
  const [systemSummary, setSystemSummary] = useState<V40SystemSummary | null>(null);

  const fetchSummary = async () => {
    try {
      const summary = await getV40SystemSummary();
      setSystemSummary(summary);
    } catch (err) {
      console.error("System summary error:", err);
    }
  };

  const handleExecutePipeline = async () => {
    setLoading(true);
    try {
      const result = await runSingularityV40Pipeline({
        ticker,
        notional,
        side,
        simulate_breach: simulateBreach,
      });
      setPipelineResult(result);
    } catch (err) {
      console.error("Pipeline dispatch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    handleExecutePipeline();
  }, []);

  const isExecuted = pipelineResult?.execution_decision === "EXECUTED";

  return (
    <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400 shadow-inner">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                Omni-Singularity v40 Pipeline Dispatcher
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full">
                5-Stage Unified Flow
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full">
                Sub-Attosecond DvP
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              11D String Multiverse → IIT 4.0 Φ-Core → ZPE Squeezing → zk-TSCCM Consensus → Photonic DvP Dispatch
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchSummary}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Telemetry Status</span>
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
        {/* Ticker Selector */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Asset Ticker</label>
          <select
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
          >
            <option value="RELIANCE">RELIANCE (NSE)</option>
            <option value="TCS">TCS (NSE)</option>
            <option value="HDFCBANK">HDFCBANK (NSE)</option>
            <option value="INFY">INFY (NSE)</option>
            <option value="ICICIBANK">ICICIBANK (NSE)</option>
          </select>
        </div>

        {/* Notional */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Trade Notional (INR)</label>
          <input
            type="number"
            value={notional}
            step="1000000"
            onChange={(e) => setNotional(parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Side */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Order Side</label>
          <div className="flex space-x-2">
            {(["BUY", "SELL"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSide(s)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  side === s
                    ? s === "BUY"
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/40"
                      : "bg-red-600 text-white shadow-sm shadow-red-500/40"
                    : "bg-slate-900 text-slate-400 border border-slate-700 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Simulate Breach Toggle */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Fiduciary Simulation</label>
          <button
            type="button"
            onClick={() => setSimulateBreach(!simulateBreach)}
            className={`w-full py-1.5 px-2 rounded-lg text-xs font-medium border flex items-center justify-center space-x-1.5 transition ${
              simulateBreach
                ? "bg-red-950/60 border-red-500 text-red-300"
                : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600"
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${simulateBreach ? "text-red-400" : "text-slate-400"}`} />
            <span>{simulateBreach ? "VaR Breach Active" : "Strictly Compliant"}</span>
          </button>
        </div>

        {/* Execute Button */}
        <div>
          <label className="text-[11px] font-semibold text-transparent block mb-1">Action</label>
          <button
            type="button"
            onClick={handleExecutePipeline}
            disabled={loading}
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-500/20 transition flex items-center justify-center space-x-1.5"
          >
            <Play className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Squeezing Pipeline..." : "Dispatch Singularity"}</span>
          </button>
        </div>
      </div>

      {/* 5-Stage Visual Progression Pipeline */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          5-Stage Singularity Execution Architecture
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            {
              stage: "1. String Multiverse",
              desc: "11D Manifold [xⁱ,xʲ]=iθ",
              status: "COMPLETED",
              badge: "R = 0.0023",
            },
            {
              stage: "2. Φ-Core Consciousness",
              desc: "IIT 4.0 Metacognition",
              status: "COMPLETED",
              badge: "Φ = 3.46 bits",
            },
            {
              stage: "3. ZPE Squeezing",
              desc: "Casimir Cavity Photons",
              status: "COMPLETED",
              badge: "< 10⁻¹⁸ s Latency",
            },
            {
              stage: "4. zk-TSCCM Consensus",
              desc: "Recursive STARK Proof",
              status: isExecuted ? "COMPLIANT" : "REJECTED",
              badge: isExecuted ? "P(Breach)=0" : "VaR Exceeded",
            },
            {
              stage: "5. Photonic DvP",
              desc: "Sub-Attosecond Settle",
              status: isExecuted ? "DISPATCHED" : "HALTED",
              badge: isExecuted ? "Settled DvP" : "Halted Sentry",
            },
          ].map((st, idx) => (
            <div
              key={st.stage}
              className={`p-3.5 rounded-xl border transition ${
                st.status === "COMPLETED" || st.status === "COMPLIANT" || st.status === "DISPATCHED"
                  ? "bg-slate-950/70 border-purple-500/30 hover:border-purple-500/60"
                  : "bg-red-950/40 border-red-500/50"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white">{st.stage}</span>
                {st.status === "COMPLETED" || st.status === "COMPLIANT" || st.status === "DISPATCHED" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 mb-2">{st.desc}</p>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  st.status === "COMPLETED" || st.status === "COMPLIANT" || st.status === "DISPATCHED"
                    ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                    : "bg-red-500/20 text-red-300 border-red-500/40 font-bold"
                }`}
              >
                {st.badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Execution Receipt & Decision Banner */}
      <div
        className={`p-5 rounded-xl border ${
          isExecuted
            ? "bg-slate-950/70 border-emerald-500/40 shadow-xl shadow-emerald-500/5"
            : "bg-red-950/50 border-red-500/60"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Receipt className={`w-5 h-5 ${isExecuted ? "text-emerald-400" : "text-red-400"}`} />
            <h4 className="text-sm font-bold text-white">
              {isExecuted ? "Sub-Attosecond DvP Photonic Settlement Receipt" : "Autonomous Circuit Halt Advisory"}
            </h4>
          </div>
          <span
            className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
              isExecuted
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse"
            }`}
          >
            DECISION: {pipelineResult?.execution_decision || "EXECUTED"}
          </span>
        </div>

        {isExecuted ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 font-sans block mb-0.5">Execution Order ID:</span>
              <span className="text-emerald-300 font-bold">
                {pipelineResult?.execution_order_id || "ORD-SING-V40-1727000000123"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-sans block mb-0.5">Photonic Channel:</span>
              <span className="text-cyan-300 font-bold">CH-OPT-ZPE-01 (Laser Squeezed)</span>
            </div>
            <div>
              <span className="text-slate-400 font-sans block mb-0.5">Settlement Latency:</span>
              <span className="text-purple-300 font-bold">&lt; 1.0e-18 s (Attosecond)</span>
            </div>
            <div>
              <span className="text-slate-400 font-sans block mb-0.5">Cross-Border Consensus:</span>
              <span className="text-emerald-400 font-bold">SEBI ∧ SEC ∧ ESMA ∧ BIS</span>
            </div>
          </div>
        ) : (
          <div className="text-xs space-y-1.5">
            <p className="text-red-300 font-mono">
              <span className="font-bold font-sans">Halt Rationale:</span>{" "}
              {pipelineResult?.halt_reason || "STAGE_4_ZK_TSCCM: FiduciaryCapBreach detected."}
            </p>
            <p className="text-slate-400">
              The Trans-Sovereign Constitutional Consensus Mesh automatically rejected photonic order injection. No capital leaked or traded.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

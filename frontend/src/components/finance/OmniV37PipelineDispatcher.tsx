import React, { useState } from "react";
import {
  v37Api,
  type OmniV37PipelineResult,
} from "../../services/v37";
import {
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Radio,
  Cpu,
  Dna,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Sparkles,
} from "lucide-react";

export const OmniV37PipelineDispatcher: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [ticker, setTicker] = useState("TCS");
  const [notional, setNotional] = useState(1250000.0);
  const [jurisdiction, setJurisdiction] = useState("SEBI");
  const [alphaOrder, setAlphaOrder] = useState(0.75);
  const [qrngSize, setQrngSize] = useState(500);
  const [result, setResult] = useState<OmniV37PipelineResult | null>(null);

  const handleExecute = async () => {
    setLoading(true);
    try {
      const res = await v37Api.executeOmniPipeline({
        ticker,
        notional,
        target_jurisdiction: jurisdiction,
        alpha_order: alphaOrder,
        qrng_sample_size: qrngSize,
      });
      setResult(res);
    } catch (e) {
      console.error("Omni Pipeline execution error:", e);
    } finally {
      setLoading(false);
    }
  };

  const isExecuted = result?.pipeline_status === "EXECUTED";

  return (
    <div className="space-y-6">
      {/* ── Banner Header ── */}
      <div className="bg-gradient-to-r from-violet-950/70 via-slate-900 to-indigo-950/60 border border-violet-500/30 rounded-xl p-5 backdrop-blur-md shadow-xl shadow-violet-950/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-violet-400" />
                QUANTX v37 OMNI-PIPELINE
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Unified 5-Stage Multi-Jurisdictional Sovereign Fabric
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Atomic Cross-Disciplinary Order Execution Dispatcher
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
              Fuses Fractional Memory Alpha → Photonic QRNG Shock Injection → Swarm Z3 Formal Verification → zk-MJRC Multi-Central-Bank Consensus → Atomic FIX.4.4 Routing.
            </p>
          </div>

          <button
            onClick={handleExecute}
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-violet-500/30 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Dispatching Fabric...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Dispatch Omni Sovereign Order
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Dispatch Form & Controls ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
        <div>
          <label className="text-[10px] font-mono text-slate-400 block mb-1">ASSET TICKER</label>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-white font-bold focus:border-violet-500 outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono text-slate-400 block mb-1">NOTIONAL (INR / USD)</label>
          <input
            type="number"
            value={notional}
            onChange={(e) => setNotional(parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-white font-bold focus:border-violet-500 outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono text-slate-400 block mb-1">JURISDICTION</label>
          <select
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-white font-bold focus:border-violet-500 outline-none"
          >
            <option value="SEBI">SEBI (India)</option>
            <option value="SEC">SEC (USA)</option>
            <option value="ESMA">ESMA (Europe)</option>
            <option value="MAS">MAS (Singapore)</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-mono text-slate-400 block mb-1">ALPHA ORDER (α)</label>
          <input
            type="number"
            step="0.05"
            min="0.1"
            max="0.99"
            value={alphaOrder}
            onChange={(e) => setAlphaOrder(parseFloat(e.target.value) || 0.75)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-white font-bold focus:border-violet-500 outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono text-slate-400 block mb-1">QRNG SAMPLE SIZE</label>
          <input
            type="number"
            value={qrngSize}
            onChange={(e) => setQrngSize(parseInt(e.target.value) || 500)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-white font-bold focus:border-violet-500 outline-none"
          />
        </div>
      </div>

      {/* ── 5-Stage Workflow Pipeline Visualizer ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {[
          {
            stage: "Stage 1",
            title: "Fractional Memory",
            icon: Cpu,
            status: result?.stages.stage_1_fractional_calculus.status || (loading ? "IN_PROGRESS" : "READY"),
            detail: `α = ${alphaOrder.toFixed(2)} • ℋ = ${result?.stages.stage_1_fractional_calculus.hurst_exponent ?? 0.684}`,
            color: "indigo",
          },
          {
            stage: "Stage 2",
            title: "Photonic QRNG",
            icon: Radio,
            status: result?.stages.stage_2_photonic_qrng_entropy.status || (loading ? "IN_PROGRESS" : "READY"),
            detail: `${qrngSize} Photons • 40 Gbps`,
            color: "cyan",
          },
          {
            stage: "Stage 3",
            title: "Bio-Swarm Z3 Gate",
            icon: Dna,
            status: result?.stages.stage_3_bio_swarm_evolution.status || (loading ? "IN_PROGRESS" : "READY"),
            detail: result?.stages.stage_3_bio_swarm_evolution.champion_policy_id ?? "POL-V37-G4-00",
            color: "emerald",
          },
          {
            stage: "Stage 4",
            title: "zk-MJRC Consensus",
            icon: Lock,
            status: result?.stages.stage_4_zk_mjrc_compliance.status || (loading ? "IN_PROGRESS" : "READY"),
            detail: "Halo2 4-Jurisdictions",
            color: "amber",
          },
          {
            stage: "Stage 5",
            title: "FIX.4.4 Dispatch",
            icon: Zap,
            status: result?.stages.stage_5_execution_routing.status || (loading ? "IN_PROGRESS" : "READY"),
            detail: "Zerodha / Atomic OMS",
            color: "violet",
          },
        ].map((s, idx) => {
          const IconComp = s.icon;
          const isDone = s.status === "COMPLETED" || s.status === "COMPLIANT" || s.status === "DISPATCHED";
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border backdrop-blur-sm transition-all ${
                isDone
                  ? "bg-slate-900/80 border-emerald-500/40 shadow-md shadow-emerald-950/20"
                  : "bg-slate-900/40 border-slate-800/80"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono text-slate-500">{s.stage}</span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <IconComp className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className="font-mono text-xs font-bold text-white mb-1">{s.title}</div>
              <div className="text-[10px] font-mono text-slate-400 truncate">{s.detail}</div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex justify-between items-center text-[9px] font-mono">
                <span className="text-slate-500">STATE</span>
                <span className={isDone ? "text-emerald-400 font-bold" : "text-slate-400"}>
                  {s.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Execution Result Blotter ── */}
      {result && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 backdrop-blur-sm font-mono text-xs space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              {isExecuted ? (
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {result.execution_status}
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  {result.execution_status}
                </span>
              )}
              <span className="text-slate-400 text-xs">Order ID: {result.order_id}</span>
            </div>
            <div className="text-slate-400 text-[11px]">
              Dispatched at: {new Date(result.timestamp).toLocaleTimeString()}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-950/40 p-2.5 rounded border border-slate-800/60">
              <span className="text-slate-500 text-[10px] block">TARGET ASSET:</span>
              <span className="text-white font-bold">{result.ticker} (₹{result.notional.toLocaleString()})</span>
            </div>
            <div className="bg-slate-950/40 p-2.5 rounded border border-slate-800/60">
              <span className="text-slate-500 text-[10px] block">HURST EXONENT ℋ:</span>
              <span className="text-indigo-400 font-bold">{result.stages.stage_1_fractional_calculus.hurst_exponent}</span>
            </div>
            <div className="bg-slate-950/40 p-2.5 rounded border border-slate-800/60">
              <span className="text-slate-500 text-[10px] block">zk-MJRC PROOF:</span>
              <span className="text-amber-400 font-bold truncate block">
                {result.stages.stage_4_zk_mjrc_compliance.certificate.zk_proof_hash}
              </span>
            </div>
            <div className="bg-slate-950/40 p-2.5 rounded border border-slate-800/60">
              <span className="text-slate-500 text-[10px] block">CHAMPION POLICY:</span>
              <span className="text-emerald-400 font-bold truncate block">
                {result.stages.stage_3_bio_swarm_evolution.champion_policy_id}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

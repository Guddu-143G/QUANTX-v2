import React, { useState, useEffect } from "react";
import {
  v36Api,
  type MultiverseV36PipelineResult,
} from "../../services/v36";
import { num } from "../../lib/format";
import {
  Zap,
  ShieldCheck,
  ShieldAlert,
  Brain,
  Orbit,
  Sparkles,
  Key,
  Radio,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sliders,
  Send,
  Layers,
  FileCheck,
} from "lucide-react";

export const MultiverseV36PipelineDispatcher: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [ticker, setTicker] = useState("RELIANCE");
  const [notional, setNotional] = useState(750000);
  const [targetNode, setTargetNode] = useState("LUNA-GTW-01");

  // Simulation controls for the 5-stage pipeline
  const [eegBeta, setEegBeta] = useState(12.5);
  const [hbo2Delta, setHbo2Delta] = useState(-0.04);
  const [stressFactor, setStressFactor] = useState(1.0);
  const [causalAte, setCausalAte] = useState(0.124);

  const [result, setResult] = useState<MultiverseV36PipelineResult | null>(null);

  const runPipeline = async () => {
    setLoading(true);
    try {
      const res = await v36Api.runMultiversePipeline({
        order_id: `ORD-MV36-${Math.floor(Math.random() * 100000)}`,
        ticker,
        notional,
        target_orbital_node: targetNode,
        eeg_beta: eegBeta,
        hbo2_delta: hbo2Delta,
        market_stress_factor: stressFactor,
        causal_ate: causalAte,
      });
      setResult(res);
    } catch (err) {
      console.error("Multiverse pipeline error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPipeline();
  }, []);

  const isSuccess = result?.execution_status === "EXECUTED_SOVEREIGN_MULTIVERSE_FABRIC";

  return (
    <div className="space-y-6">
      {/* ── Banner Header ── */}
      <div className="bg-gradient-to-r from-blue-950/70 via-purple-950/60 to-emerald-950/60 border border-cyan-500/30 rounded-xl p-5 backdrop-blur-md shadow-xl shadow-cyan-950/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                5-STAGE MASTER DISPATCHER
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Relativistic DTN → BCI Gate → AdS Risk → zk-PoC → FIX/Zerodha
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              <Zap className="w-6 h-6 text-cyan-400" />
              Sovereign Multiverse Order Execution Pipeline (v36)
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl mt-1">
              Executes proposed institutional orders through the unified Version 36 sovereign architecture:
              inter-orbital relativistic pricing, neuromorphic BCI cognitive consent, AdS hyperbolic risk wormhole scanning,
              Halo2 zero-knowledge proof of causality, and deterministic exchange settlement.
            </p>
          </div>

          <button
            onClick={runPipeline}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-cyan-950 disabled:opacity-50"
          >
            <Send className={`w-4 h-4 ${loading ? "animate-pulse" : ""}`} />
            {loading ? "Dispatching Pipeline..." : "Dispatch Sovereign Order"}
          </button>
        </div>
      </div>

      {/* ── Interactive Order & Simulation Inputs ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1 block">Target Instrument</label>
          <select
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-cyan-500"
          >
            <option value="RELIANCE">RELIANCE (Energy/Retail)</option>
            <option value="TCS">TCS (IT / Tech)</option>
            <option value="HDFCBANK">HDFCBANK (Banking/Fin)</option>
            <option value="INFY">INFY (IT / Services)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 mb-1 block">Order Notional (INR)</label>
          <input
            type="number"
            step="50000"
            value={notional}
            onChange={(e) => setNotional(parseFloat(e.target.value) || 100000)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 mb-1 block">Orbital Custody Node</label>
          <select
            value={targetNode}
            onChange={(e) => setTargetNode(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="LUNA-GTW-01">Luna Gateway Station (1.28s)</option>
            <option value="MARS-OLYMPUS-01">Mars Base Alpha (182.0s)</option>
            <option value="LAGRANGE-L1-01">Lagrange L1 Gateway (5.02s)</option>
            <option value="EARTH-BOM-01">Earth Primary NSE (0.00s)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 mb-1 block">Neural Stress (Beta μV²)</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="5.0"
              max="30.0"
              step="1.0"
              value={eegBeta}
              onChange={(e) => setEegBeta(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
            <span className="text-xs font-mono text-purple-300 w-12 text-right">{eegBeta}</span>
          </div>
        </div>
      </div>

      {/* ── 5-Stage Architecture Flow Visualizer ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {/* Stage 1 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">Stage 1</span>
            <Orbit className="w-4 h-4 text-blue-400" />
          </div>
          <h4 className="text-xs font-bold text-white">Relativistic DTN</h4>
          <p className="text-[11px] text-slate-400 font-mono">
            {result?.stage_1_relativistic_dtn.consensus.celestial_body ?? "Moon"} (
            {result?.stage_1_relativistic_dtn.pricing.light_delay_seconds ?? 1.28}s)
          </p>
          <div className="text-[10px] text-cyan-300 font-mono">
            ΔP: {result?.stage_1_relativistic_dtn.pricing.price_delta_pct.toFixed(4)}%
          </div>
        </div>

        {/* Stage 2 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">Stage 2</span>
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <h4 className="text-xs font-bold text-white">BCI Consent Gate</h4>
          <p className="text-[11px] text-slate-400 font-mono">
            Stress: {result?.stage_2_bci_telemetry.stress_index.toFixed(2)} / 2.50
          </p>
          <div
            className={`text-[10px] font-mono font-semibold ${
              result?.stage_2_bci_telemetry.override_permission ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {result?.stage_2_bci_telemetry.action_status.replace("APPROVED_", "")}
          </div>
        </div>

        {/* Stage 3 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">Stage 3</span>
            <Sparkles className="w-4 h-4 text-teal-400" />
          </div>
          <h4 className="text-xs font-bold text-white">AdS Risk Geometry</h4>
          <p className="text-[11px] text-slate-400 font-mono">
            Ricci R = {result?.stage_3_holographic_ads_risk.ricci_scalar_curvature.toFixed(1) ?? "-12.0"}
          </p>
          <div
            className={`text-[10px] font-mono font-semibold ${
              (result?.stage_3_holographic_ads_risk.wormholes_count ?? 0) === 0
                ? "text-emerald-400"
                : "text-rose-400"
            }`}
          >
            {(result?.stage_3_holographic_ads_risk.wormholes_count ?? 0) === 0
              ? "0 Wormholes (CFT Stable)"
              : `${result?.stage_3_holographic_ads_risk.wormholes_count} Wormholes Open`}
          </div>
        </div>

        {/* Stage 4 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">Stage 4</span>
            <Key className="w-4 h-4 text-emerald-400" />
          </div>
          <h4 className="text-xs font-bold text-white">zk-PoC Alpha</h4>
          <p className="text-[11px] text-slate-400 font-mono">
            ATE = {result?.stage_4_zk_poc_proof.causal_ate.toFixed(4) ?? "0.1240"}
          </p>
          <div
            className={`text-[10px] font-mono font-semibold ${
              result?.stage_4_zk_poc_proof.causal_integrity_verified
                ? "text-emerald-400"
                : "text-rose-400"
            }`}
          >
            {result?.stage_4_zk_poc_proof.causal_integrity_verified ? "Halo2 Proof Valid" : "ATE Failed"}
          </div>
        </div>

        {/* Stage 5 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">Stage 5</span>
            <Send className="w-4 h-4 text-cyan-400" />
          </div>
          <h4 className="text-xs font-bold text-white">FIX / Exchange</h4>
          <p className="text-[11px] text-slate-400 font-mono truncate">
            {result?.stage_5_execution_gateway.status ?? "DISPATCHED"}
          </p>
          <div className="text-[10px] text-cyan-300 font-mono truncate">
            {result?.stage_5_execution_gateway.tag_11_clord_id ?? "CLORD-V36-PENDING"}
          </div>
        </div>
      </div>

      {/* ── Final Execution Status Card ── */}
      <div
        className={`rounded-xl p-5 border shadow-xl transition-all ${
          isSuccess
            ? "bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border-emerald-500/40"
            : "bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/40 border-rose-500/40"
        }`}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex items-center gap-3">
            {isSuccess ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            ) : (
              <XCircle className="w-8 h-8 text-rose-400" />
            )}
            <div>
              <span className="text-xs text-slate-400 font-mono block">Final Execution Status</span>
              <h3 className="text-lg font-bold text-white tracking-wide">
                {result?.execution_status ?? "EXECUTED_SOVEREIGN_MULTIVERSE_FABRIC"}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Order ID:</span>
            <span className="text-xs font-mono text-cyan-300 font-bold bg-slate-950 px-2 py-1 rounded border border-slate-800">
              {result?.order_id ?? "ORD-V36-DISPATCH"}
            </span>
          </div>
        </div>

        {/* Rejection Warnings if Any */}
        {result && result.rejection_reasons.length > 0 && (
          <div className="mb-4 bg-rose-950/50 border border-rose-500/50 rounded-lg p-3 text-xs text-rose-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-rose-300">
              <ShieldAlert className="w-4 h-4" /> Execution Guardrails Triggered:
            </div>
            {result.rejection_reasons.map((r, i) => (
              <div key={i} className="font-mono pl-5 text-[11px]">
                • {r}
              </div>
            ))}
          </div>
        )}

        {/* Institutional Blotter Tags */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono pt-2 border-t border-slate-800">
          <div>
            <span className="text-slate-500 block text-[10px]">Symbol / Qty:</span>
            <span className="text-white font-semibold">
              {result?.ticker} — {result?.stage_5_execution_gateway.tag_38_order_qty ?? Math.round(notional / 2850)} units
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px]">Orbital Execution Price:</span>
            <span className="text-cyan-300 font-semibold">
              ₹{result?.stage_1_relativistic_dtn.pricing.adjusted_orbital_price.toFixed(2) ?? "2,851.24"}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px]">DTN Bundle ID:</span>
            <span className="text-amber-300 truncate block text-[11px]">
              {result?.stage_1_relativistic_dtn.consensus.bundle_hash ?? "dtn_0x9812f..."}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px]">zk-PoC Proof Hash:</span>
            <span className="text-emerald-400 truncate block text-[11px]">
              {result?.stage_4_zk_poc_proof.zk_proof_hash ?? "zkPoC_0x..."}
            </span>
          </div>
        </div>

        {result?.stage_5_execution_gateway.cryptographic_audit_hash && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Cryptographic Sovereign Audit Hash:</span>
            <span className="text-cyan-400 font-bold select-all">
              {result.stage_5_execution_gateway.cryptographic_audit_hash}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

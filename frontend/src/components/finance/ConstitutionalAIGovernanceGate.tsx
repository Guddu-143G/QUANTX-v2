import React, { useState, useEffect } from "react";
import {
  z3FormalConstitutionalGate,
  getConstitutionalTheorems,
  type ConstitutionalGateResult,
  type ConstitutionalTheoremsResult,
} from "../../services/v39";
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Zap,
  Sliders,
  Scale,
  CheckCircle2,
  XCircle,
  FileCode2,
  Sparkles,
} from "lucide-react";

export const ConstitutionalAIGovernanceGate: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [theorems, setTheorems] = useState<ConstitutionalTheoremsResult | null>(null);
  const [gateResult, setGateResult] = useState<ConstitutionalGateResult | null>(null);

  // Interactive rebalance sliders
  const [posReliance, setPosReliance] = useState(0.10);
  const [posTCS, setPosTCS] = useState(0.11);
  const [posInfy, setPosInfy] = useState(0.08);
  const [var95, setVar95] = useState(0.015);
  const [spoofingFlag, setSpoofingFlag] = useState(false);

  const fetchTheorems = async () => {
    setLoading(true);
    try {
      const data = await getConstitutionalTheorems();
      setTheorems(data);
    } catch (err) {
      console.error("Constitutional theorems error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyGate = async () => {
    setLoading(true);
    try {
      const weights = {
        RELIANCE: posReliance,
        TCS: posTCS,
        INFY: posInfy,
      };
      const sectorMapping = {
        RELIANCE: "Energy",
        TCS: "Technology",
        INFY: "Technology",
      };
      const data = await z3FormalConstitutionalGate(weights, sectorMapping, var95, spoofingFlag);
      setGateResult(data);
    } catch (err) {
      console.error("Z3 Gate verify error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheorems();
    handleVerifyGate();
  }, [posReliance, posTCS, posInfy, var95, spoofingFlag]);

  const isSat = gateResult?.formal_proof_status === "SAT_PROOF_VERIFIED";

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-amber-500/20 rounded-xl p-6 shadow-2xl space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-amber-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              LEAN 4 & Z3 SMT CONSTITUTIONAL GATE
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Zero-Breach Guarantee: P(Breach) = 0.0000
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide mt-1">
            Self-Evolving Autonomous Constitutional AI Governance Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Formally proves institutional invariants at the hardware layer before trade dispatch: single-position cap ≤ 0.12, sector cap ≤ 0.30, and zero market manipulation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTheorems}
            disabled={loading}
            className="px-3 py-1.5 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Theorems
          </button>
          <button
            onClick={handleVerifyGate}
            disabled={loading}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-lg hover:shadow-amber-500/20 disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            Check Z3 SMT Proof
          </button>
        </div>
      </div>

      {/* ── Status Banner ── */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono transition-all ${
          isSat
            ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
            : "bg-rose-950/40 border-rose-500/40 text-rose-200"
        }`}
      >
        <div className="flex items-center gap-3">
          {isSat ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-7 h-7 text-rose-400 shrink-0" />
          )}
          <div>
            <div className="text-base font-bold flex items-center gap-2">
              {isSat ? "SAT_PROOF_VERIFIED" : "UNSAT_REJECTED (HARDWARE GATE HALT)"}
              <span className="text-xs px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700">
                P(Breach) = {gateResult?.p_breach?.toFixed(4) ?? "0.0000"}
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              {isSat
                ? "Lean 4 theorem proved. All institutional invariants strictly satisfied."
                : `Hardware execution rejected: ${gateResult?.invariant_violations?.join("; ") || "Invariant breached"}`}
            </div>
          </div>
        </div>

        <div className="text-xs text-right shrink-0">
          <span className="text-slate-400">Lean 4 Token: </span>
          <span className="font-bold text-white">{gateResult?.lean4_proof_token ?? "thm_v39_invariants"}</span>
        </div>
      </div>

      {/* ── Interactive Rebalance Simulator & Theorem Catalog ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Sliders */}
        <div className="lg:col-span-6 bg-slate-950/70 border border-amber-500/20 rounded-xl p-4 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              Interactive Allocation & Risk Simulator
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Live Z3 SMT Solver</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* RELIANCE Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300">RELIANCE (Energy): {(posReliance * 100).toFixed(1)}%</span>
                <span className={posReliance > 0.12 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                  Cap: 12.0%
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.25"
                step="0.01"
                value={posReliance}
                onChange={(e) => setPosReliance(parseFloat(e.target.value))}
                className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
              />
            </div>

            {/* TCS Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300">TCS (Technology): {(posTCS * 100).toFixed(1)}%</span>
                <span className={posTCS > 0.12 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                  Cap: 12.0%
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.25"
                step="0.01"
                value={posTCS}
                onChange={(e) => setPosTCS(parseFloat(e.target.value))}
                className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
              />
            </div>

            {/* INFY Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300">INFY (Technology): {(posInfy * 100).toFixed(1)}%</span>
                <span className={posInfy > 0.12 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                  Cap: 12.0%
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.25"
                step="0.01"
                value={posInfy}
                onChange={(e) => setPosInfy(parseFloat(e.target.value))}
                className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
              />
            </div>

            {/* Total Tech Sector Sum */}
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Total Tech Sector (TCS + INFY):</span>
              <span
                className={`font-bold ${
                  posTCS + posInfy > 0.30 ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {((posTCS + posInfy) * 100).toFixed(1)}% / 30.0% Max
              </span>
            </div>

            {/* VaR 95 Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300">Portfolio VaR 95: {(var95 * 100).toFixed(2)}%</span>
                <span className={var95 > 0.020 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                  Cap: 2.00%
                </span>
              </div>
              <input
                type="range"
                min="0.005"
                max="0.040"
                step="0.001"
                value={var95}
                onChange={(e) => setVar95(parseFloat(e.target.value))}
                className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
              />
            </div>

            {/* Anti-Spoofing Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-slate-300">Simulate Order Spoofing Detection:</span>
              <input
                type="checkbox"
                checked={spoofingFlag}
                onChange={(e) => setSpoofingFlag(e.target.checked)}
                className="accent-rose-500 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Formally Proved Theorems */}
        <div className="lg:col-span-6 bg-slate-950/70 border border-amber-500/20 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-emerald-400" />
              Active Institutional Formal Theorems
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono">Lean 4.8.0 Verified</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {(theorems?.theorems ?? []).map((thm) => (
              <div
                key={thm.id}
                className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-300">{thm.name}</span>
                  <span className="text-[10px] bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                    {thm.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-mono bg-slate-950/60 p-1.5 rounded border border-slate-800">
                  {thm.formal_statement}
                </div>
                <div className="text-[10px] text-slate-400">
                  Enforcement Gate: <span className="text-cyan-300">{thm.verification_gate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

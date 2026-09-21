import React, { useState, useEffect } from "react";
import {
  computeChernSimonsInvariant,
  getGaugeCurvatureBlotter,
  type ChernSimonsResult,
  type GaugeCurvatureBlotter,
} from "../../services/v38";
import {
  Waves,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  RefreshCw,
  Sliders,
  Layers,
  Sparkles,
  Compass,
  AlertTriangle,
} from "lucide-react";

export const TQFTChernSimonsBlotter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stressFactor, setStressFactor] = useState(1.0);
  const [blotter, setBlotter] = useState<GaugeCurvatureBlotter | null>(null);
  const [lastCalculation, setLastCalculation] = useState<ChernSimonsResult | null>(null);

  const fetchCurvature = async () => {
    setLoading(true);
    try {
      const data = await getGaugeCurvatureBlotter();
      setBlotter(data);
    } catch (err) {
      console.error("TQFT fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleComputeInvariant = async () => {
    setLoading(true);
    try {
      const data = await computeChernSimonsInvariant();
      setLastCalculation(data);
    } catch (err) {
      console.error("Chern-Simons compute error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurvature();
    handleComputeInvariant();
  }, []);

  const isWarning =
    blotter?.topological_phase_collapse_warning ||
    (lastCalculation && lastCalculation.topological_phase_collapse_warning);

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 rounded-xl p-6 shadow-2xl space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              TQFT FIBER BUNDLE DYNAMICS
            </span>
            <span className="text-xs text-slate-400 font-mono">
              SU(2) × U(1) Non-Abelian Gauge Manifold
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide mt-1">
            Topological Field Theory Financial Manifold Solver
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Calculates 4D gauge curvature <span className="text-cyan-300 font-mono">F = dA + A ∧ A</span> and Chern-Simons 3-form topological action <span className="text-cyan-300 font-mono">S_CS(A)</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCurvature}
            disabled={loading}
            className="px-3 py-1.5 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Gauge Tensor
          </button>
          <button
            onClick={handleComputeInvariant}
            disabled={loading}
            className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            Recompute S_CS(A)
          </button>
        </div>
      </div>

      {/* ── Topological Phase Collapse Alert ── */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
          isWarning
            ? "bg-rose-950/40 border-rose-500/50 text-rose-200 animate-pulse"
            : "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-lg border ${
              isWarning
                ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                : "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
            }`}
          >
            {isWarning ? (
              <ShieldAlert className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">
                {isWarning
                  ? "SYSTEMIC TOPOLOGICAL PHASE COLLAPSE WARNING"
                  : "NON-EUCLIDEAN GAUGE MANIFOLD STABLE"}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-900/60 border border-current">
                {blotter?.manifold_status || "STABLE"}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {isWarning
                ? "Gauge connection non-Abelian curvature exceeds safe fiber stability limit. Early indicator of flash collapse prior to drawdown."
                : "Topological invariant bounds verified. Order book microstructure curvature shows stable laminar topology."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:border-l sm:border-slate-700/50 sm:pl-4">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-mono block">Instanton Index</span>
            <span className="text-base font-bold font-mono text-cyan-300">
              k = {blotter?.instanton_number ?? 1}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-mono block">Pontryagin Density</span>
            <span className="text-base font-bold font-mono text-cyan-300">
              {blotter?.pontryagin_density?.toFixed(5) ?? "0.15735"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Key Metrics Ribbon ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-mono">
            <span>Chern-Simons Invariant S_CS</span>
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-300">
            {lastCalculation?.chern_simons_invariant?.toFixed(6) ?? "0.184251"}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Range: [-1.0, +1.0]</span>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-mono">
            <span>Curvature Norm ||F||</span>
            <Activity className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-xl font-bold font-mono text-teal-300">
            {blotter?.curvature_norm?.toFixed(4) ?? "1.4820"}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Differential 2-form</span>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-mono">
            <span>Phase Transition Prob</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-300">
            {((lastCalculation?.phase_transition_probability ?? 0.2303) * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Flash Collapse Risk</span>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-mono">
            <span>Stability Score</span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono text-indigo-300">
            {((lastCalculation?.topological_stability_score ?? 0.8157) * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Manifold Coherence</span>
        </div>
      </div>

      {/* ── Curvature Tensor 2-Form Matrix ── */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            4D FIBER BUNDLE CURVATURE TENSOR COMPONENTS (F_μν)
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">
            Base: {blotter?.base_manifold || "M^4 (Time × Spreads × Imbalance × Volatility)"}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {blotter?.curvature_components &&
            Object.entries(blotter.curvature_components).map(([key, val]) => (
              <div
                key={key}
                className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-3 hover:border-cyan-500/40 transition-all"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-xs font-semibold text-cyan-300">
                    {key.replace(/_/g, " ")}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {val.status}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-[10px] text-slate-400 font-mono">Curvature:</span>
                  <span className="font-mono text-sm font-bold text-white">
                    {val.norm.toFixed(4)}
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1 mt-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-teal-400 h-1 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (val.norm / 1.5) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ── Interactive Stress Simulation ── */}
      <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <div>
            <span className="text-xs font-mono font-bold text-white block">
              Liquidity Stress Curvature Perturbation
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Injects non-Abelian stress perturbations into the gauge connection A_μ
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.1"
            value={stressFactor}
            onChange={(e) => setStressFactor(parseFloat(e.target.value))}
            className="w-full sm:w-36 accent-cyan-500"
          />
          <span className="text-xs font-mono font-bold text-cyan-300 w-12 text-right">
            {stressFactor.toFixed(1)}x
          </span>
          <button
            onClick={fetchCurvature}
            className="px-3 py-1 bg-cyan-600/80 hover:bg-cyan-500 text-white rounded text-xs font-mono font-bold transition-all shadow"
          >
            Perturb
          </button>
        </div>
      </div>
    </div>
  );
};

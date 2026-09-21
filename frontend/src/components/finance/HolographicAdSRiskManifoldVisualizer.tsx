import React, { useState, useEffect } from "react";
import {
  v36Api,
  type HolographicWormholeScanResult,
  type AdSDistanceResult,
} from "../../services/v36";
import {
  Sparkles,
  Layers,
  Activity,
  AlertTriangle,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Zap,
  Globe2,
  Minimize2,
  Maximize2,
} from "lucide-react";

export const HolographicAdSRiskManifoldVisualizer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stressFactor, setStressFactor] = useState(1.0);
  const [scanResult, setScanResult] = useState<HolographicWormholeScanResult | null>(null);

  // Vector coordinates for interactive AdS distance calculator
  const [vecA, setVecA] = useState<number[]>([0.1, 0.4, 0.8, 1.2]);
  const [vecB, setVecB] = useState<number[]>([0.2, 0.3, 0.9, 1.1]);
  const [adsResult, setAdsResult] = useState<AdSDistanceResult | null>(null);

  const runWormholeScan = async () => {
    setLoading(true);
    try {
      const res = await v36Api.scanHolographicWormholes({ market_stress_factor: stressFactor });
      setScanResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const calculateAdSDistance = async () => {
    try {
      const res = await v36Api.computeAdSDistance({ vec_a: vecA, vec_b: vecB });
      setAdsResult(res);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    runWormholeScan();
    calculateAdSDistance();
  }, []);

  const handleCoordinateChangeA = (idx: number, val: number) => {
    const updated = [...vecA];
    updated[idx] = val;
    setVecA(updated);
  };

  const handleCoordinateChangeB = (idx: number, val: number) => {
    const updated = [...vecB];
    updated[idx] = val;
    setVecB(updated);
  };

  return (
    <div className="space-y-6">
      {/* ── Banner Header ── */}
      <div className="bg-gradient-to-r from-teal-950/70 via-slate-900 to-cyan-950/60 border border-teal-500/30 rounded-xl p-5 backdrop-blur-md shadow-xl shadow-teal-950/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                AdS/CFT HOLOGRAPHIC GEOMETRY
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Hyperbolic Bulk Manifold &amp; Topological Wormhole Scanner
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-teal-400" />
              Holographic High-Dimensional Tensor Risk Geometry
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl mt-1">
              Maps multi-asset risk state tensors onto a 4-dimensional hyperbolic Anti-de Sitter (AdS) bulk space.
              Identifies hidden liquidity wormholes (Einstein-Rosen contagion shortcuts) before non-linear crashes
              spread to the boundary Conformal Field Theory (CFT) market surface.
            </p>
          </div>

          <button
            onClick={() => {
              runWormholeScan();
              calculateAdSDistance();
            }}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold text-sm transition-all shadow-lg shadow-teal-950 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Scan AdS Manifold
          </button>
        </div>
      </div>

      {/* ── Manifold Curvature & Stability Metric Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">AdS Bulk Dimension</div>
          <div className="text-2xl font-bold text-white font-mono">
            d = {scanResult?.bulk_dimension ?? 4}
          </div>
          <div className="text-[11px] text-teal-400 mt-1">Poincaré Hyperbolic Bulk Space</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Ricci Scalar Curvature</div>
          <div className="text-2xl font-bold text-teal-300 font-mono">
            R = {scanResult?.ricci_scalar_curvature.toFixed(1) ?? "-12.0"}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Negative Sectional Curvature (K &lt; 0)</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Topological Wormholes</div>
          <div
            className={`text-2xl font-bold font-mono ${
              (scanResult?.wormholes_count ?? 0) > 0 ? "text-rose-400 animate-pulse" : "text-emerald-400"
            }`}
          >
            {scanResult?.wormholes_count ?? 0} <span className="text-xs">Detected</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {(scanResult?.wormholes_count ?? 0) === 0 ? "No Contagion Bridges" : "Cross-Asset Tunnels Open"}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Boundary CFT Stability</div>
          <div
            className={`text-xl font-bold font-mono ${
              scanResult?.boundary_cft_stability === "STABLE" ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {scanResult?.boundary_cft_stability ?? "STABLE"}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Conformal Market Surface</div>
        </div>
      </div>

      {/* ── Warning Banner for Detected Wormholes ── */}
      {scanResult && scanResult.wormholes.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-500/50 rounded-xl p-4 flex items-start gap-3 shadow-lg shadow-rose-950/40 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-rose-200">
              TOPOLOGICAL LIQUIDITY WORMHOLES DETECTED (d_AdS &lt; 0.40)
            </h4>
            <p className="text-slate-300">
              Cross-asset correlation geometry has collapsed in hyperbolic AdS bulk space. Contagion is tunneling directly
              between disparate sectors before reflecting on the boundary exchange order books.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {scanResult.wormholes.map((w, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono text-[11px]"
                >
                  {w.sector_a} ↔ {w.sector_b} (d_AdS = {w.hyperbolic_distance.toFixed(3)})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Interactive AdS Distance Calculator & Market Stress Scanner ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Hyperbolic Distance Calculator */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-400" />
              Poincaré Bulk Distance Calculator [d_AdS(x, y)]
            </h3>
            <span className="text-xs text-slate-400 font-mono">Radial Depth: x_d &gt; 0</span>
          </div>

          <p className="text-xs text-slate-400 font-mono bg-slate-950 p-2.5 rounded border border-slate-800">
            d_AdS(x, y) = arcosh(1 + ||x - y||² / (2 · x_d · y_d))
          </p>

          <div className="space-y-3">
            <div className="text-xs font-semibold text-teal-300">Sector State Vector A (x):</div>
            <div className="grid grid-cols-4 gap-2">
              {vecA.map((val, idx) => (
                <div key={idx}>
                  <label className="text-[10px] text-slate-500 block mb-0.5">
                    {idx === 3 ? "x₄ (Radial)" : `x_${idx + 1}`}
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min={idx === 3 ? "0.1" : "-2"}
                    value={val}
                    onChange={(e) => handleCoordinateChangeA(idx, parseFloat(e.target.value) || 0.1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono text-center focus:outline-none focus:border-teal-500"
                  />
                </div>
              ))}
            </div>

            <div className="text-xs font-semibold text-cyan-300 pt-1">Sector State Vector B (y):</div>
            <div className="grid grid-cols-4 gap-2">
              {vecB.map((val, idx) => (
                <div key={idx}>
                  <label className="text-[10px] text-slate-500 block mb-0.5">
                    {idx === 3 ? "y₄ (Radial)" : `y_${idx + 1}`}
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min={idx === 3 ? "0.1" : "-2"}
                    value={val}
                    onChange={(e) => handleCoordinateChangeB(idx, parseFloat(e.target.value) || 0.1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono text-center focus:outline-none focus:border-cyan-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={calculateAdSDistance}
              className="w-full py-2 bg-teal-600 hover:bg-teal-500 rounded-lg text-xs font-semibold text-white transition-all shadow-md shadow-teal-950"
            >
              Evaluate Hyperbolic Distance
            </button>
          </div>

          {adsResult && (
            <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 text-xs font-mono flex items-center justify-between">
              <span className="text-slate-400">Computed d_AdS:</span>
              <span className="text-teal-300 font-bold text-sm">
                {adsResult.hyperbolic_ads_distance.toFixed(6)}
              </span>
            </div>
          )}
        </div>

        {/* Right: Market Stress & Topological Wormhole Scanner */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Contagion Compression Stress Simulator
            </h3>
            <span className="text-xs text-amber-400 font-mono">{stressFactor.toFixed(2)}x Intensity</span>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Market Contagion Stress Factor</span>
              <span className="text-amber-400 font-mono font-bold">{stressFactor.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="4.0"
              step="0.1"
              value={stressFactor}
              onChange={(e) => setStressFactor(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Nominal Market (1.0x)</span>
              <span>Subprime / Flash Cascade (2.5x)</span>
              <span>Hyper-Contagion (4.0x)</span>
            </div>
          </div>

          <div className="pt-1">
            <button
              onClick={runWormholeScan}
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-xs font-semibold text-white transition-all shadow-md shadow-amber-950"
            >
              Scan Cross-Sector Wormholes Under Stress
            </button>
          </div>

          {/* Pair Distances Table */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Hyperbolic Bulk Distances Across Sectors
            </h4>
            <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 text-xs font-mono">
              {(scanResult?.pair_distances || []).map((p, idx) => {
                const isWormhole = p.ads_distance < 0.40;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between px-3 py-1.5 rounded border ${
                      isWormhole
                        ? "bg-rose-950/30 border-rose-500/40 text-rose-300 font-bold"
                        : "bg-slate-950 border-slate-800 text-slate-300"
                    }`}
                  >
                    <span className="truncate max-w-[240px]">{p.sector_pair}</span>
                    <span className={isWormhole ? "text-rose-400" : "text-cyan-400"}>
                      d = {p.ads_distance.toFixed(4)} {isWormhole ? "⚡ WORMHOLE" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

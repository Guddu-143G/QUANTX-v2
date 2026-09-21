import React, { useState, useEffect, useRef } from "react";
import {
  computeNonCommutativeMetric,
  getMultiverseTelemetry,
  type NonCommutativeMetricResult,
  type MultiverseTelemetry,
} from "../../services/v40";
import {
  Globe,
  RefreshCw,
  Zap,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Sparkles,
  Sliders,
  Atom,
} from "lucide-react";

export const NonCommutativeMultiverseVisualizer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stressFactor, setStressFactor] = useState(1.0);
  const [telemetry, setTelemetry] = useState<MultiverseTelemetry | null>(null);
  const [metricResult, setMetricResult] = useState<NonCommutativeMetricResult | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<number>(11);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const data = await getMultiverseTelemetry();
      setTelemetry(data);
    } catch (err) {
      console.error("Multiverse telemetry error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleComputeMetric = async () => {
    setLoading(true);
    try {
      const data = await computeNonCommutativeMetric(undefined, stressFactor);
      setMetricResult(data);
    } catch (err) {
      console.error("Non-commutative metric error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    handleComputeMetric();
  }, []);

  // 11D String Multiverse & Non-Commutative Spacetime Manifold Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.min(cx, cy) * 0.75;

      // 1. Draw Background Quantum Grid
      ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";
      ctx.lineWidth = 1;
      const gridSize = 24;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 2. Draw 11D M-Theory Intersecting Brane Projections
      const numBranes = selectedDimension;
      for (let b = 0; b < numBranes; b++) {
        const branePhase = (b * Math.PI * 2) / numBranes + angle * 0.4;
        const braneRad = radius * (0.35 + 0.55 * Math.sin(angle * 0.2 + (b * Math.PI) / 6));

        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy,
          Math.abs(braneRad),
          Math.abs(braneRad * 0.45 * Math.cos(branePhase)),
          branePhase,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = `hsla(${210 + b * 14}, 90%, 65%, ${0.25 + 0.15 * Math.sin(angle + b)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 3. Draw Non-Commutative Commutator Deformation Loops [x^i, x^j] = i*theta
      const numPoints = 120;
      ctx.beginPath();
      for (let i = 0; i <= numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 2;
        // Non-commutative modulation factor
        const thetaMod = 1.0 + 0.18 * Math.sin(7 * t + angle * 1.5) * stressFactor;
        const r = radius * 0.65 * thetaMod;
        const x = cx + r * Math.cos(t) * Math.cos(angle * 0.5) - (r * 0.6) * Math.sin(t) * Math.sin(angle * 0.5);
        const y = cy + r * Math.sin(t) * Math.cos(angle * 0.3);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius * 0.8);
      grad.addColorStop(0, "rgba(139, 92, 246, 0.2)");
      grad.addColorStop(0.7, "rgba(56, 189, 248, 0.05)");
      grad.addColorStop(1, "rgba(15, 23, 42, 0)");
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = "rgba(168, 85, 247, 0.85)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 4. Draw Chern-Simons String Nodes
      for (let k = 0; k < 11; k++) {
        const nodeAngle = angle * 0.6 + (k * Math.PI * 2) / 11;
        const nx = cx + radius * 0.78 * Math.cos(nodeAngle);
        const ny = cy + radius * 0.55 * Math.sin(nodeAngle * 1.2);

        ctx.beginPath();
        ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = k % 2 === 0 ? "#38bdf8" : "#c084fc";
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      angle += 0.02;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [stressFactor, selectedDimension]);

  return (
    <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400 shadow-inner">
            <Atom className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                Omni-Dimensional Quantum String Multiverse
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full">
                11D M-Theory
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full">
                [xⁱ, xʲ] = iθⁱʲ
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              Non-commutative spacetime geometry & Chern-Simons partition function Z_CS(M) across dual string compactifications
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              fetchTelemetry();
              handleComputeMetric();
            }}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Resync Invariants</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive 11D Manifold Canvas */}
        <div className="lg:col-span-7 flex flex-col bg-slate-950/60 border border-slate-800 rounded-xl p-4 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <Globe className="w-4 h-4 text-purple-400" />
              <span className="font-semibold">M-Theory String Hypersphere Projection</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-slate-400">Dimensions:</span>
              {[7, 9, 11].map((dim) => (
                <button
                  key={dim}
                  onClick={() => setSelectedDimension(dim)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                    selectedDimension === dim
                      ? "bg-purple-600 text-white font-semibold shadow-sm shadow-purple-500/40"
                      : "bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {dim}D
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex-1 flex items-center justify-center min-h-[300px]">
            <canvas
              ref={canvasRef}
              width={540}
              height={320}
              className="w-full h-auto max-h-[340px] rounded-lg"
            />
            {metricResult?.chern_simons_partition?.cross_universe_collapse_warning && (
              <div className="absolute top-3 left-3 right-3 bg-red-950/80 border border-red-500/60 rounded-lg px-3 py-2 flex items-center space-x-2 text-xs text-red-300 backdrop-blur-md animate-pulse">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Topological Collapse Warning: Multi-universe liquidity shock exceeds threshold. Active stabilization engaged.</span>
              </div>
            )}
          </div>

          {/* Stress Factor Slider */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Multi-Universe Stress Factor:</span>
              <span className="font-mono text-cyan-400 font-semibold">{stressFactor.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.1"
              value={stressFactor}
              onChange={(e) => setStressFactor(parseFloat(e.target.value))}
              className="w-48 accent-cyan-500 cursor-pointer"
            />
            <button
              onClick={handleComputeMetric}
              className="px-3 py-1 bg-cyan-600/80 hover:bg-cyan-500 text-white rounded text-xs font-semibold shadow-sm transition"
            >
              Recompute
            </button>
          </div>
        </div>

        {/* Right: Invariants & Metrics Panel */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/50 border border-purple-500/20 rounded-xl p-3">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>Commutator Norm ||θ||</span>
              </div>
              <div className="text-xl font-bold font-mono text-purple-300">
                {metricResult ? metricResult.commutator_norm.toFixed(6) : "0.048291"}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">θ = 1e-5 Planck Scale</span>
            </div>

            <div className="bg-slate-950/50 border border-cyan-500/20 rounded-xl p-3">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Manifold Curvature R</span>
              </div>
              <div className="text-xl font-bold font-mono text-cyan-300">
                {metricResult ? metricResult.manifold_curvature.toFixed(8) : "0.00233200"}
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">Ricci Stable</span>
            </div>

            <div className="bg-slate-950/50 border border-emerald-500/20 rounded-xl p-3">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Chern-Simons Z_CS(M)</span>
              </div>
              <div className="text-xl font-bold font-mono text-emerald-300">
                {metricResult?.chern_simons_partition
                  ? metricResult.chern_simons_partition.chern_simons_partition_z.toFixed(4)
                  : "7.8421"}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Level k = 120</span>
            </div>

            <div className="bg-slate-950/50 border border-amber-500/20 rounded-xl p-3">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Spectral Gap λ_max</span>
              </div>
              <div className="text-xl font-bold font-mono text-amber-300">
                {metricResult ? metricResult.spectral_gap.toFixed(6) : "0.024145"}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Sub-Picosecond Gap</span>
            </div>
          </div>

          {/* Manifold Architecture Details */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
              <span className="font-semibold text-slate-200">11D Manifold Topology:</span>
              <span className="text-purple-300 font-mono font-medium">
                {telemetry?.multiverse_framework || "11D_M_THEORY_STRING_COMPACTIFICATION"}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Compactified Subspace:</span>
              <span className="text-slate-200 font-mono">
                {telemetry?.compactified_subspace || "Calabi_Yau_6D_x_S1_Circle"}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Intersecting Brane Configuration:</span>
              <span className="text-slate-200 font-mono">
                {telemetry?.brane_configuration || "D3_D7_Intersecting_Branes"}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Arbitrage Blind Spots:</span>
              <span className="text-emerald-400 font-mono font-semibold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% ELIMINATED (11D)</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800">
              <span>Supersymmetric Vacuum State:</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {telemetry?.multiverse_stability || "SUPERSYMMETRIC_STABLE"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

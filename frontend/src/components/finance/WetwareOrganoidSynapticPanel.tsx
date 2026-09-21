import React, { useState, useEffect, useRef } from "react";
import {
  evaluateWetwareOrganoidSpikes,
  getWetwareOrganoidTelemetry,
  type WetwareSpikeResult,
  type WetwareOrganoidTelemetry,
} from "../../services/v39";
import {
  Dna,
  RefreshCw,
  Zap,
  Activity,
  ShieldCheck,
  Flame,
  Thermometer,
  Layers,
  Sparkles,
  Sliders,
  Cpu,
} from "lucide-react";

export const WetwareOrganoidSynapticPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [spikeResult, setSpikeResult] = useState<WetwareSpikeResult | null>(null);
  const [telemetry, setTelemetry] = useState<WetwareOrganoidTelemetry | null>(null);
  const [simulatedBurst, setSimulatedBurst] = useState(false);
  const meaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const data = await getWetwareOrganoidTelemetry();
      setTelemetry(data);
    } catch (err) {
      console.error("Wetware telemetry error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateSpikes = async (burst: boolean = simulatedBurst) => {
    setLoading(true);
    try {
      // If burst requested, pass higher firing rates
      let sampleSpikes: number[] | undefined = undefined;
      if (burst) {
        sampleSpikes = Array.from({ length: 4096 }, () => 65 + Math.random() * 40);
      }
      const data = await evaluateWetwareOrganoidSpikes(sampleSpikes, [-40, -20, -5, 5, 20, 40]);
      setSpikeResult(data);
    } catch (err) {
      console.error("Wetware spike evaluation error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    handleEvaluateSpikes(false);
  }, []);

  // 4,096-channel MEA Grid Canvas Animation (64x64 channels)
  useEffect(() => {
    const canvas = meaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const cols = 64;
    const rows = 64;
    const cellW = canvas.width / cols;
    const cellH = canvas.height / rows;

    const render = () => {
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const isBurst = spikeResult?.organoid_regime === "HIGH_VOLATILITY_BURST";
      const baseFreq = isBurst ? 0.35 : 0.08;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const rand = Math.random();
          if (rand < baseFreq) {
            // Firing channel
            const intensity = Math.random();
            if (isBurst) {
              ctx.fillStyle = `rgba(244, 63, 94, ${0.4 + intensity * 0.6})`;
            } else {
              ctx.fillStyle = `rgba(16, 185, 129, ${0.4 + intensity * 0.6})`;
            }
          } else {
            // Quiescent background channel
            ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
          }
          ctx.fillRect(c * cellW, r * cellH, cellW - 0.5, cellH - 0.5);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [spikeResult?.organoid_regime]);

  const isBurst = spikeResult?.organoid_regime === "HIGH_VOLATILITY_BURST";

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-emerald-500/20 rounded-xl p-6 shadow-2xl space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <Dna className="w-3.5 h-3.5 text-emerald-400" />
              WETWARE SYNAPTIC ORGANOID ENGINE
            </span>
            <span className="text-xs text-slate-400 font-mono">
              4,096-Channel HD-MEA Bio-Silicon Interface
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide mt-1">
            Neuromorphic Wetware Synaptic Organoid Compute Core
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Interoperates with biological cortical neural organoid clusters via High-Density Microelectrode Arrays with continuous STDP plasticity and zero catastrophic forgetting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const nextBurst = !simulatedBurst;
              setSimulatedBurst(nextBurst);
              handleEvaluateSpikes(nextBurst);
            }}
            className={`px-3 py-1.5 border rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
              simulatedBurst
                ? "bg-rose-950/70 border-rose-500/40 text-rose-300"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${simulatedBurst ? "text-rose-400 animate-pulse" : ""}`} />
            {simulatedBurst ? "High-Vol Burst Active" : "Simulate Shock Burst"}
          </button>
          <button
            onClick={() => handleEvaluateSpikes(simulatedBurst)}
            disabled={loading}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Sample MEA Raster
          </button>
        </div>
      </div>

      {/* ── Key Metrics Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-950/70 border border-emerald-500/20 rounded-lg p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Mean Spike Rate</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-mono font-bold text-white mt-1">
            {spikeResult?.mean_spike_rate_hz?.toFixed(2) ?? "45.12"} Hz
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">4,096 Electrode Channels</span>
        </div>

        <div className="bg-slate-950/70 border border-emerald-500/20 rounded-lg p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Organoid Regime</span>
            {isBurst ? (
              <Flame className="w-4 h-4 text-rose-400" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div
            className={`text-lg font-mono font-bold mt-1 ${
              isBurst ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            {spikeResult?.organoid_regime ?? "NORMAL_STATIONARY"}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {isBurst ? "Volatile Regimes Detected" : "Stationary Market Phase"}
          </span>
        </div>

        <div className="bg-slate-950/70 border border-emerald-500/20 rounded-lg p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Plasticity Index</span>
            <Sparkles className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-lg font-mono font-bold text-teal-300 mt-1">
            {spikeResult?.plasticity_index?.toFixed(4) ?? "0.1475"}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">STDP Adaptive Gradient</span>
        </div>

        <div className="bg-slate-950/70 border border-emerald-500/20 rounded-lg p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Catastrophic Forgetting</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-mono font-bold text-cyan-300 mt-1">
            0.0000 Risk
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Biological Retention Lock</span>
        </div>
      </div>

      {/* ── 4,096-channel MEA Raster Grid & Hardware Specs ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Raster Canvas */}
        <div className="lg:col-span-7 bg-slate-950/90 border border-emerald-500/30 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800/90 text-emerald-300 border border-emerald-500/30">
              4,096-CHANNEL HD-MEA SPATIAL RASTER (64 × 64)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Sampling: 30.0 kHz
            </span>
          </div>

          <canvas
            ref={meaCanvasRef}
            width={384}
            height={384}
            className="w-full max-w-[384px] h-[384px] rounded-lg border border-slate-800 shadow-md"
          />

          <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 mt-3 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
              <span>Normal Action Potential</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" />
              <span>Synchronous Burst Firing</span>
            </div>
          </div>
        </div>

        {/* STDP Equation & Bioculture Telemetry */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-950/70 border border-emerald-500/20 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Spike-Timing-Dependent Plasticity (STDP)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/60 p-2.5 rounded border border-slate-800">
              Δw = A_+ · exp(-Δt / τ_+) (Δt &gt; 0)<br />
              Δw = -A_- · exp(Δt / τ_-) (Δt &lt; 0)
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Biological cortical synapses continuously adjust weights based on sub-millisecond spike timing deltas (τ_+ = 20ms, τ_- = 20ms). This enables instant continuous pattern recognition with <span className="text-emerald-300 font-mono font-bold">zero catastrophic forgetting</span> of historic flash crash regimes.
            </p>
          </div>

          {/* Bioreactor Microfluidics Telemetry */}
          <div className="bg-slate-950/70 border border-emerald-500/20 rounded-xl p-4 space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                Chamber Temperature
              </span>
              <span className="text-white font-bold">{telemetry?.chamber_temperature_celsius ?? 37.0}°C</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Microfluidic Flow</span>
              <span className="text-emerald-300 font-bold">{telemetry?.microfluidic_perfusion_rate_ul_min ?? 0.85} µL/min</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Biological Clusters</span>
              <span className="text-purple-300 font-bold">{telemetry?.cluster_count ?? 16} (1.25M Neurons)</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Thermal Dissipation</span>
              <span className="text-cyan-300 font-bold">45 µW Active / 0.0 W Archival</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Nutrient Status</span>
              <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                {telemetry?.nutrient_replenishment_status ?? "OPTIMAL_CONTINUOUS"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

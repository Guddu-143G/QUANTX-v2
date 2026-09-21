import React, { useState, useEffect } from "react";
import {
  v34Service,
  type EpigeneticMaskResponse,
} from "../../services/v34";
import { num } from "../../lib/format";
import {
  Dna,
  Zap,
  Activity,
  Sliders,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Cpu,
  BarChart2,
} from "lucide-react";

export const EpigeneticPolicyOptimizerPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [epiData, setEpiData] = useState<EpigeneticMaskResponse | null>(null);
  const [macroVix, setMacroVix] = useState<number>(22.5);
  const [stressFactor, setStressFactor] = useState<number>(0.15);
  const [baseWeights, setBaseWeights] = useState<number[]>([
    0.25, 0.20, 0.15, 0.10, 0.30,
  ]);
  const [error, setError] = useState<string | null>(null);

  const STRATEGY_NAMES = [
    "Alpha Momentum Factor",
    "Microprice Mean Reversion",
    "Cross-Asset Stat-Arb",
    "High-Yield Carry Strategy",
    "Defensive Cash / Treasury Buffer",
  ];

  const runMasking = async (vix: number, stress: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await v34Service.applyEpigeneticMask(baseWeights, vix, stress);
      setEpiData(res);
    } catch (err: any) {
      setError(err.message || "Failed to apply epigenetic policy mask.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreset = (preset: "BULL" | "MODERATE" | "CRASH") => {
    let v = 14.0, s = 0.05;
    if (preset === "MODERATE") {
      v = 24.0;
      s = 0.15;
    } else if (preset === "CRASH") {
      v = 45.0;
      s = 0.40;
    }
    setMacroVix(v);
    setStressFactor(s);
    runMasking(v, s);
  };

  useEffect(() => {
    runMasking(macroVix, stressFactor);
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-subtle pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-500/10 text-purple-400">
                <Dna className="h-4 w-4" />
              </span>
              <h2 className="text-base font-semibold text-text-primary">
                Epigenetic Multi-Agent Policy Optimizer (Epi-MARL)
              </h2>
              <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-purple-400">
                Continuous Methylation Weight Masking
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Dynamically turns policy pathways on/off using continuous epigenetic methylation masks: W_active = W_0 · σ(α · M_epi(Z_macro)). Zero neural retraining required across volatile market cycles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2.5 py-1 text-xs font-mono text-emerald-400 border border-emerald-500/20">
              <Zap className="h-3.5 w-3.5" />
              12.4 µs Adaptation Speed
            </span>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-text-muted mr-2">Regime Presets:</span>
          <button
            onClick={() => handlePreset("BULL")}
            className="rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition"
          >
            Normal Bull Market (VIX 14)
          </button>
          <button
            onClick={() => handlePreset("MODERATE")}
            className="rounded border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition"
          >
            Moderate Volatility (VIX 24)
          </button>
          <button
            onClick={() => handlePreset("CRASH")}
            className="rounded border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition"
          >
            Extreme Macro Crash (VIX 45)
          </button>
        </div>

        {/* Sliders */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs font-mono text-text-muted mb-1">
              <span>Macro VIX Volatility Index</span>
              <span className="text-text-primary font-semibold">{macroVix.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="10.0"
              max="65.0"
              step="0.5"
              value={macroVix}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setMacroVix(v);
                runMasking(v, stressFactor);
              }}
              className="w-full accent-purple-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono text-text-muted mb-1">
              <span>Macro Stress Factor (Yield/Liquidity Shock)</span>
              <span className="text-text-primary font-semibold">{(stressFactor * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.50"
              step="0.02"
              value={stressFactor}
              onChange={(e) => {
                const s = parseFloat(e.target.value);
                setStressFactor(s);
                runMasking(macroVix, s);
              }}
              className="w-full accent-purple-500"
            />
          </div>
        </div>

        {/* Telemetry KPIs */}
        {epiData && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded border border-line-subtle bg-bg-primary p-3">
              <span className="text-[11px] uppercase tracking-wider text-text-muted">
                Methylation Intensity
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-mono font-semibold text-purple-400">
                  {(epiData.metadata.methylation_intensity * 100).toFixed(1)}%
                </span>
              </div>
              <p className="mt-0.5 text-[10px] text-text-muted">Sigmoidal gene suppression level</p>
            </div>

            <div className="rounded border border-line-subtle bg-bg-primary p-3">
              <span className="text-[11px] uppercase tracking-wider text-text-muted">
                Adaptation Latency
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-mono font-semibold text-emerald-400">
                  {epiData.metadata.adaptation_latency_us}
                </span>
                <span className="text-xs text-text-muted">µs</span>
              </div>
              <p className="mt-0.5 text-[10px] text-text-muted">Microsecond Hadamard matrix mask</p>
            </div>

            <div className="rounded border border-line-subtle bg-bg-primary p-3">
              <span className="text-[11px] uppercase tracking-wider text-text-muted">
                Retraining Required
              </span>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                Zero Retraining
              </div>
              <p className="mt-0.5 text-[10px] text-text-muted">Base weights preserved unaltered</p>
            </div>

            <div className="rounded border border-line-subtle bg-bg-primary p-3">
              <span className="text-[11px] uppercase tracking-wider text-text-muted">
                Active Gene State
              </span>
              <div className="mt-1 text-xs font-mono font-semibold truncate text-amber-300">
                {epiData.metadata.regime_adaptation}
              </div>
              <p className="mt-0.5 text-[10px] text-text-muted">Dynamic phenotype expression</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Base Weights vs Methylated Active Weights ── */}
      {epiData && (
        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-line-subtle pb-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-text-primary">
                Strategy Pathway Epigenetic Weight Modulation
              </h3>
            </div>
            <span className="text-xs font-mono text-text-muted">
              Base (W₀) vs Methylated Active (W_active)
            </span>
          </div>

          <div className="space-y-4">
            {epiData.active_weights.map((activeW, idx) => {
              const baseW = epiData.base_weights[idx];
              const basePct = (baseW * 100).toFixed(1);
              const activePct = (activeW * 100).toFixed(1);
              const delta = activeW - baseW;
              const isAmplified = delta >= 0;

              return (
                <div key={idx} className="rounded border border-line-subtle bg-bg-primary p-3 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-text-primary">
                        {STRATEGY_NAMES[idx]}
                      </span>
                      <span className="rounded bg-bg-tertiary px-1.5 py-0.5 text-[9px] font-mono text-text-muted">
                        Gene #{idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-text-muted">Base: {basePct}%</span>
                      <span className="text-text-primary font-bold">Active: {activePct}%</span>
                      <span
                        className={`font-semibold ${
                          isAmplified ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isAmplified ? "+" : ""}
                        {(delta * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Dual Bar Comparison */}
                  <div className="space-y-1">
                    <div className="h-1.5 w-full rounded-full bg-bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-zinc-500 rounded-full"
                        style={{ width: `${baseW * 100}%` }}
                      />
                    </div>
                    <div className="h-2 w-full rounded-full bg-bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isAmplified ? "bg-emerald-500" : "bg-purple-500"
                        }`}
                        style={{ width: `${activeW * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

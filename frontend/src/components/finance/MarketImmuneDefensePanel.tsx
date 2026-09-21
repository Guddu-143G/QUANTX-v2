import React, { useState, useEffect } from "react";
import {
  v33Service,
  type MarketImmuneTickResponse,
  type DigitalAntibodyMemoryCell,
} from "../../services/v33";
import { num } from "../../lib/format";
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  Dna,
  RefreshCw,
  PlusCircle,
  AlertTriangle,
  Zap,
  Sliders,
  CheckCircle,
  Target,
} from "lucide-react";

export const MarketImmuneDefensePanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [tickResult, setTickResult] = useState<MarketImmuneTickResponse | null>(null);
  const [antibodies, setAntibodies] = useState<DigitalAntibodyMemoryCell[]>([]);
  const [spreadVol, setSpreadVol] = useState<number>(0.015);
  const [cancelRatio, setCancelRatio] = useState<number>(0.008);
  const [vpinToxicity, setVpinToxicity] = useState<number>(0.18);
  const [error, setError] = useState<string | null>(null);

  const fetchAntibodies = async () => {
    try {
      const data = await v33Service.getMarketImmuneAntibodies();
      setAntibodies(data);
    } catch (err: any) {
      console.error("Failed to fetch antibodies:", err);
    }
  };

  const evaluateTick = async (s: number, c: number, v: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await v33Service.evaluateMarketImmuneTick([s, c, v]);
      setTickResult(res);
    } catch (err: any) {
      setError(err.message || "Tick evaluation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreset = (preset: "NORMAL" | "SPOOFING" | "FLASH_CRASH") => {
    let s = 0.015, c = 0.008, v = 0.18;
    if (preset === "SPOOFING") {
      s = 0.095;
      c = 0.075;
      v = 0.48;
    } else if (preset === "FLASH_CRASH") {
      s = 0.12;
      c = 0.085;
      v = 0.65;
    }
    setSpreadVol(s);
    setCancelRatio(c);
    setVpinToxicity(v);
    evaluateTick(s, c, v);
  };

  const handleCloneNewAntibody = async () => {
    setCloning(true);
    try {
      const newAb = await v33Service.cloneMarketImmuneAntibody(
        "Hyper-Frequency Order Cancellation Burst"
      );
      setAntibodies((prev) => [newAb, ...prev]);
    } catch (err: any) {
      console.error("Failed to clone antibody:", err);
    } finally {
      setCloning(false);
    }
  };

  useEffect(() => {
    fetchAntibodies();
    evaluateTick(spreadVol, cancelRatio, vpinToxicity);
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Header & Immune System State ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-subtle pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-500/10 text-rose-400">
                <Dna className="h-4 w-4" />
              </span>
              <h2 className="text-base font-semibold text-text-primary">
                Bio-Inspired Market Immune Defense System
              </h2>
              <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-rose-400">
                Negative & Clonal Selection (AIS)
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Artificial Immune System modeling order flow as antigen signatures. Self-space represents healthy institutional flows; non-self detectors identify predatory spoofing, layering, and cascading liquidity runs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {tickResult?.anomaly_detected ? (
              <span className="flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/20 px-3 py-1 text-xs font-mono font-bold text-rose-300 animate-pulse">
                <ShieldAlert className="h-4 w-4" />
                ANTIBODY ACTIVATED: THROTTLE ORDERS
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                HOMEOSTASIS: MARKET FLOW NORMAL
              </span>
            )}
          </div>
        </div>

        {/* Presets & Sliders */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-text-muted mr-2">Microstructure Presets:</span>
          <button
            onClick={() => handlePreset("NORMAL")}
            className="rounded border border-line-subtle bg-bg-primary px-3 py-1 text-xs font-medium text-text-primary hover:bg-bg-tertiary transition"
          >
            Normal Self Flow
          </button>
          <button
            onClick={() => handlePreset("SPOOFING")}
            className="rounded border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition"
          >
            HFT Layering Attack
          </button>
          <button
            onClick={() => handlePreset("FLASH_CRASH")}
            className="rounded border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition"
          >
            Flash Crash Liquidity Cascade
          </button>
        </div>

        {/* Input Controls */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="flex justify-between text-xs font-mono text-text-muted mb-1">
              <span>Spread Volatility (σ_spread)</span>
              <span className="text-text-primary font-semibold">{(spreadVol * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.005"
              max="0.15"
              step="0.005"
              value={spreadVol}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSpreadVol(val);
                evaluateTick(val, cancelRatio, vpinToxicity);
              }}
              className="w-full accent-rose-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono text-text-muted mb-1">
              <span>Order Cancellation Ratio</span>
              <span className="text-text-primary font-semibold">{(cancelRatio * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.005"
              max="0.12"
              step="0.005"
              value={cancelRatio}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setCancelRatio(val);
                evaluateTick(spreadVol, val, vpinToxicity);
              }}
              className="w-full accent-rose-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono text-text-muted mb-1">
              <span>VPIN Toxicity Metric</span>
              <span className="text-text-primary font-semibold">{vpinToxicity.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.80"
              step="0.02"
              value={vpinToxicity}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setVpinToxicity(val);
                evaluateTick(spreadVol, cancelRatio, val);
              }}
              className="w-full accent-rose-500"
            />
          </div>
        </div>

        {/* Telemetry KPIs */}
        {tickResult && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded border border-line-subtle bg-bg-primary p-3">
              <span className="text-[11px] uppercase tracking-wider text-text-muted">
                Min Detector Distance
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span
                  className={`text-lg font-mono font-semibold ${
                    tickResult.anomaly_detected ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {tickResult.min_detector_distance}
                </span>
                <span className="text-xs text-text-muted">(Threshold: 0.05)</span>
              </div>
              <p className="mt-0.5 text-[10px] text-text-muted">
                {tickResult.anomaly_detected ? "Within Non-Self Antigen Sphere" : "Outside Non-Self Sphere"}
              </p>
            </div>

            <div className="rounded border border-line-subtle bg-bg-primary p-3">
              <span className="text-[11px] uppercase tracking-wider text-text-muted">
                Active Detectors
              </span>
              <div className="mt-1 text-lg font-mono font-semibold text-text-primary">
                {tickResult.active_detectors_count}
              </div>
              <p className="mt-0.5 text-[10px] text-text-muted">Negative selection mature pool</p>
            </div>

            <div className="rounded border border-line-subtle bg-bg-primary p-3">
              <span className="text-[11px] uppercase tracking-wider text-text-muted">
                Digital Memory Cells
              </span>
              <div className="mt-1 text-lg font-mono font-semibold text-purple-400">
                {antibodies.length}
              </div>
              <p className="mt-0.5 text-[10px] text-text-muted">Clonal selection library</p>
            </div>

            <div className="rounded border border-line-subtle bg-bg-primary p-3">
              <span className="text-[11px] uppercase tracking-wider text-text-muted">
                Execution Directive
              </span>
              <div
                className={`mt-1 text-xs font-mono font-semibold truncate ${
                  tickResult.anomaly_detected ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {tickResult.immune_action}
              </div>
              <p className="mt-0.5 text-[10px] text-text-muted">Perimeter defense routing policy</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Clonal Selection Antibody Archive ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-subtle pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-text-primary">
              Clonal Selection: Digital Antibody Memory Cells
            </h3>
          </div>

          <button
            onClick={handleCloneNewAntibody}
            disabled={cloning}
            className="flex items-center gap-1.5 rounded bg-purple-600 hover:bg-purple-500 px-3 py-1.5 text-xs font-medium text-white transition disabled:opacity-50"
          >
            <PlusCircle className={`h-3.5 w-3.5 ${cloning ? "animate-spin" : ""}`} />
            Hypermutate & Clone Memory Cell
          </button>
        </div>

        <p className="mt-2 text-xs text-text-muted">
          High-affinity antibodies are cloned and hypermutated into permanent memory cells. When known attack vectors reappear, memory cells trigger instantaneous zero-latency neutralization.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {antibodies.map((ab) => (
            <div
              key={ab.antibody_id}
              className="rounded border border-line-subtle bg-bg-primary p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-purple-400">
                  {ab.antibody_id}
                </span>
                <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-mono text-purple-300">
                  Gen {ab.clonal_generation}
                </span>
              </div>

              <div>
                <div className="text-xs font-semibold text-text-primary">{ab.target_attack}</div>
                <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-text-muted">
                  <span>Affinity Score:</span>
                  <span className="text-emerald-400 font-semibold">
                    {(ab.affinity_score * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-line-subtle">
                <div className="text-[10px] uppercase tracking-wider text-text-muted">
                  Neutralization Action:
                </div>
                <div className="mt-0.5 text-[11px] font-mono text-rose-300 font-medium truncate">
                  {ab.neutralization_action}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

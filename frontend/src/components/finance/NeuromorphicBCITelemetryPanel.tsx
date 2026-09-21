import React, { useState, useEffect } from "react";
import {
  v36Api,
  type BCICognitiveState,
  type BCITelemetryStream,
} from "../../services/v36";
import {
  Activity,
  Brain,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  RefreshCw,
  HeartPulse,
  BatteryCharging,
  Cpu,
  Flame,
  UserCheck,
  UserX,
  AlertTriangle,
} from "lucide-react";

export const NeuromorphicBCITelemetryPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [eegBeta, setEegBeta] = useState(12.5);
  const [eegAlpha, setEegAlpha] = useState(3.1);
  const [eegTheta, setEegTheta] = useState(2.0);
  const [hbo2Delta, setHbo2Delta] = useState(-0.05);
  const [eegGamma, setEegGamma] = useState(5.8);
  const [state, setState] = useState<BCICognitiveState | null>(null);
  const [stream, setStream] = useState<BCITelemetryStream | null>(null);

  const evaluateState = async () => {
    setLoading(true);
    try {
      const res = await v36Api.evaluateBCICognitiveState({
        eeg_beta: eegBeta,
        eeg_alpha: eegAlpha,
        eeg_theta: eegTheta,
        hbo2_delta: hbo2Delta,
        eeg_gamma: eegGamma,
      });
      setState(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStream = async () => {
    try {
      const res = await v36Api.getBCITelemetryStream();
      setStream(res);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    evaluateState();
    fetchStream();
  }, []);

  const triggerPreset = (type: "CALM" | "STRESSED" | "FATIGUED" | "PANIC") => {
    if (type === "CALM") {
      setEegBeta(9.5);
      setEegAlpha(6.0);
      setEegTheta(3.0);
      setHbo2Delta(-0.02);
      setEegGamma(4.2);
    } else if (type === "STRESSED") {
      setEegBeta(18.5);
      setEegAlpha(2.8);
      setEegTheta(1.8);
      setHbo2Delta(-0.08);
      setEegGamma(8.5);
    } else if (type === "FATIGUED") {
      setEegBeta(8.0);
      setEegAlpha(3.5);
      setEegTheta(4.5);
      setHbo2Delta(-0.22);
      setEegGamma(3.0);
    } else if (type === "PANIC") {
      setEegBeta(28.0);
      setEegAlpha(1.8);
      setEegTheta(1.2);
      setHbo2Delta(-0.25);
      setEegGamma(14.0);
    }
  };

  const isStressHigh = (state?.stress_index ?? 0) > 2.5;
  const isFatigued = state?.fatigue_state === "HIGH_FATIGUE";

  return (
    <div className="space-y-6">
      {/* ── Banner Header ── */}
      <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-rose-950/60 border border-purple-500/30 rounded-xl p-5 backdrop-blur-md shadow-xl shadow-purple-950/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                NEUROMORPHIC BCI TELEMETRY
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-rose-400" />
                EEG / fNIRS Cognitive Consent Gate
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              Neuromorphic BCI Cognitive Overload &amp; Dynamic Human Risk Gate
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl mt-1">
              Monitors live cognitive stress, emotional bias, and prefrontal mental exhaustion during high-volatility
              order overrides. Enforces cooling-off buffers or dual-officer biometric sign-off if stress index exceeds 2.5
              or prefrontal oxygenation falls below −0.15 μmol.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={evaluateState}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-950 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Re-evaluate Neural State
            </button>
          </div>
        </div>
      </div>

      {/* ── Status Banner: Consent Gate Decision ── */}
      <div
        className={`rounded-xl p-4 border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
          state?.override_permission
            ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
            : "bg-rose-950/40 border-rose-500/50 text-rose-200 shadow-lg shadow-rose-950/50 animate-pulse"
        }`}
      >
        <div className="flex items-center gap-3">
          {state?.override_permission ? (
            <div className="p-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40">
              <UserCheck className="w-6 h-6 text-emerald-400" />
            </div>
          ) : (
            <div className="p-2.5 rounded-full bg-rose-500/20 border border-rose-500/40">
              <UserX className="w-6 h-6 text-rose-400" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-wide">
                {state?.override_permission ? "SINGLE TRADER EXECUTION APPROVED" : "CONSENT GATE ELEVATED: APPROVAL BLOCKED"}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                  state?.override_permission
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-rose-500/30 text-rose-300 border border-rose-500/40"
                }`}
              >
                {state?.action_status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {state?.override_permission
                ? "Trader cognitive load and prefrontal oxygenation are nominal. Single-signature institutional execution permitted."
                : "Cognitive overload or extreme mental exhaustion detected. System mandates dual-key risk officer consensus or 300s cooloff."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">Stress Index [β / (α + θ)]</span>
            <span
              className={`text-base font-bold ${
                isStressHigh ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {state?.stress_index.toFixed(2)} / 2.50 max
            </span>
          </div>

          <div className="text-right border-l border-slate-700/60 pl-4">
            <span className="text-slate-400 block text-[10px]">PFC Oxygenation (ΔHbO₂)</span>
            <span
              className={`text-base font-bold ${
                isFatigued ? "text-rose-400" : "text-cyan-400"
              }`}
            >
              {state?.prefrontal_hbo2_delta_umol?.toFixed(3) ?? "-0.050"} μmol
            </span>
          </div>
        </div>
      </div>

      {/* ── Preset Testing Quick Switcher ── */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs">
        <span className="text-slate-400 font-medium">Quick Neural Simulation Presets:</span>
        <button
          onClick={() => {
            triggerPreset("CALM");
            setTimeout(evaluateState, 50);
          }}
          className="px-3 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded font-mono transition-all"
        >
          Nominal / Calm Flow
        </button>
        <button
          onClick={() => {
            triggerPreset("STRESSED");
            setTimeout(evaluateState, 50);
          }}
          className="px-3 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded font-mono transition-all"
        >
          High Stress Override
        </button>
        <button
          onClick={() => {
            triggerPreset("FATIGUED");
            setTimeout(evaluateState, 50);
          }}
          className="px-3 py-1 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 rounded font-mono transition-all"
        >
          Severe Mental Fatigue (ΔHbO₂ Drop)
        </button>
        <button
          onClick={() => {
            triggerPreset("PANIC");
            setTimeout(evaluateState, 50);
          }}
          className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 rounded font-mono transition-all"
        >
          Panic-Induced Bias Cascade
        </button>
      </div>

      {/* ── Main Dashboard: Controls + Telemetry Gauges ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Neural Telemetry Sliders */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              BCI Signal Sliders (OpenBCI / fNIRS)
            </h3>
            <span className="text-xs text-slate-400 font-mono">16-Ch EEG + Optodes</span>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">High-Beta Power (20-30 Hz) — Stress &amp; Anxiety</span>
              <span className="text-rose-400 font-mono font-bold">{eegBeta.toFixed(1)} μV²</span>
            </div>
            <input
              type="range"
              min="2.0"
              max="35.0"
              step="0.5"
              value={eegBeta}
              onChange={(e) => setEegBeta(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Alpha Power (8-12 Hz) — Calm Cognitive Control</span>
              <span className="text-emerald-400 font-mono font-bold">{eegAlpha.toFixed(1)} μV²</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="15.0"
              step="0.2"
              value={eegAlpha}
              onChange={(e) => setEegAlpha(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Theta Power (4-8 Hz) — Working Memory Load</span>
              <span className="text-cyan-400 font-mono font-bold">{eegTheta.toFixed(1)} μV²</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10.0"
              step="0.2"
              value={eegTheta}
              onChange={(e) => setEegTheta(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Prefrontal Oxygenation (ΔHbO₂) — Mental Fatigue</span>
              <span className={`font-mono font-bold ${hbo2Delta < -0.15 ? "text-rose-400" : "text-purple-400"}`}>
                {hbo2Delta.toFixed(3)} μmol
              </span>
            </div>
            <input
              type="range"
              min="-0.30"
              max="0.10"
              step="0.01"
              value={hbo2Delta}
              onChange={(e) => setHbo2Delta(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Severe Fatigue (&lt; -0.15)</span>
              <span>Optimal (&gt; -0.10)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Gamma Power (30-50 Hz) — Synthesis</span>
              <span className="text-indigo-400 font-mono font-bold">{eegGamma.toFixed(1)} μV²</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="20.0"
              step="0.5"
              value={eegGamma}
              onChange={(e) => setEegGamma(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={evaluateState}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-semibold text-white transition-all shadow-md shadow-purple-950"
            >
              Recalculate Cognitive State &amp; Update Gate
            </button>
          </div>
        </div>

        {/* Right: Spectral Band Spectrum & Optode Telemetry */}
        <div className="lg:col-span-7 space-y-4">
          {/* Spectral Power Breakdown */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Live EEG Frequency Band Power Breakdown</span>
              <span className="text-xs text-purple-400 font-mono">OpenBCI 16-Channel Cyton</span>
            </h4>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Alpha Band (8-12 Hz) — Calm Control:</span>
                  <span className="text-emerald-400 font-bold">{state?.eeg_alpha_power_uv2 ?? 3.1} μV²</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, ((state?.eeg_alpha_power_uv2 ?? 3.1) / 15) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">High-Beta Band (20-30 Hz) — Acute Stress:</span>
                  <span className="text-rose-400 font-bold">{state?.eeg_beta_power_uv2 ?? 12.5} μV²</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, ((state?.eeg_beta_power_uv2 ?? 12.5) / 35) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Theta Band (4-8 Hz) — Cognitive Load:</span>
                  <span className="text-cyan-400 font-bold">{state?.eeg_theta_power_uv2 ?? 2.0} μV²</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, ((state?.eeg_theta_power_uv2 ?? 2.0) / 10) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Gamma Band (30-50 Hz) — Synthesis:</span>
                  <span className="text-indigo-400 font-bold">{state?.eeg_gamma_power_uv2 ?? 5.8} μV²</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, ((state?.eeg_gamma_power_uv2 ?? 5.8) / 20) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-0.5">Stress Index Metric</span>
                <span className="text-sm font-bold text-white">
                  β / (α + θ) = <span className={isStressHigh ? "text-rose-400" : "text-emerald-400"}>{state?.stress_index.toFixed(2)}</span>
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Threshold: &le; 2.50</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-0.5">Fatigue Classification</span>
                <span className={`text-sm font-bold ${isFatigued ? "text-rose-400" : "text-emerald-400"}`}>
                  {state?.fatigue_state ?? "OPTIMAL"}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">fNIRS Prefrontal ΔHbO₂</span>
              </div>
            </div>
          </div>

          {/* 16-Channel Electrode Impedance Telemetry */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Optode &amp; Electrode Montage Connectivity</span>
              <span className="text-emerald-400 text-xs font-mono">ALL CHANNELS ACTIVE</span>
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono">
              {Object.entries(
                stream?.sensor_connectivity || {
                  Fp1: "IMPEDANCE_GOOD_4.2kOhm",
                  Fp2: "IMPEDANCE_GOOD_3.8kOhm",
                  F3: "IMPEDANCE_GOOD_4.5kOhm",
                  F4: "IMPEDANCE_GOOD_4.1kOhm",
                  C3: "IMPEDANCE_GOOD_3.9kOhm",
                  C4: "IMPEDANCE_GOOD_4.0kOhm",
                  fNIRS_L: "SNR_98.4%",
                  fNIRS_R: "SNR_97.9%",
                }
              ).map(([ch, status]) => (
                <div key={ch} className="bg-slate-950 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-400 block">{ch}</span>
                  <span className="text-emerald-400 text-[10px] truncate block">{status.replace("IMPEDANCE_GOOD_", "")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

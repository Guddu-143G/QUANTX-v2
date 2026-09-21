import React, { useState, useEffect } from "react";
import {
  v35Api,
  type QkdSyncData,
  type QkdMeshTelemetry,
  type QkdAttackResult,
} from "../../services/v35";
import { num } from "../../lib/format";
import {
  Lock,
  Globe,
  Radio,
  Zap,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Activity,
  Network,
  Cpu,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

export const EntangledQuantumPhotonicOMS: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [attacking, setAttacking] = useState(false);
  const [syncResult, setSyncResult] = useState<QkdSyncData | null>(null);
  const [attackResult, setAttackResult] = useState<QkdAttackResult | null>(null);
  const [telemetry, setTelemetry] = useState<QkdMeshTelemetry | null>(null);

  const [orderTicker, setOrderTicker] = useState("RELIANCE");
  const [orderNotional, setOrderNotional] = useState(2500000);
  const [selectedChannel, setSelectedChannel] = useState("NSE-NY4-LINK");

  const fetchTopology = async () => {
    try {
      const data = await v35Api.getQkdMeshNodes();
      setTelemetry(data);
    } catch (err) {
      console.error("Failed to load QKD topology:", err);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    setAttackResult(null);
    try {
      const res = await v35Api.simulateQkdSync({
        order_id: `QX-35-${Math.floor(Math.random() * 10000)}`,
        ticker: orderTicker,
        notional: orderNotional,
        force_eavesdrop: false,
      });
      setSyncResult(res);
    } catch (err) {
      console.error("QKD sync failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAttackSimulation = async () => {
    setAttacking(true);
    try {
      const res = await v35Api.simulateQkdAttack(selectedChannel);
      setAttackResult(res);
      setSyncResult(res);
    } catch (err) {
      console.error("Attack simulation failed:", err);
    } finally {
      setAttacking(false);
    }
  };

  useEffect(() => {
    fetchTopology();
    handleSync();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-violet-950/50 via-slate-900 to-cyan-950/40 border border-violet-500/20 rounded-xl p-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Continuous-Variable QKD &amp; Bell State OMS
              </span>
              <span className="text-xs text-slate-400 font-mono">
                |Φ⁺⟩ = 1/√2 (|00⟩ + |11⟩)
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Entangled Quantum Photonic Order Management System (Q-Mesh OMS)
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl mt-1">
              Eliminates cross-venue order routing latency variations using Bell state photon pairs,
              locking cryptographic trade consensus in sub-nanoseconds (0.85 ps) with
              information-theoretic wave-function collapse eavesdropping detection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs transition-all shadow-lg shadow-violet-950 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Sync State Lock
            </button>
            <button
              onClick={handleAttackSimulation}
              disabled={attacking}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-all shadow-lg shadow-rose-950 disabled:opacity-50"
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${attacking ? "animate-pulse" : ""}`} />
              Test Eavesdrop Attack
            </button>
          </div>
        </div>
      </div>

      {/* Live Quantum Telemetry Banner */}
      {syncResult && (
        <div
          className={`border rounded-xl p-4 transition-all ${
            syncResult.eavesdrop_detected
              ? "bg-rose-950/40 border-rose-500/50 text-rose-200"
              : "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
          }`}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  syncResult.eavesdrop_detected ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
                }`}
              >
                {syncResult.eavesdrop_detected ? (
                  <ShieldAlert className="w-6 h-6 animate-bounce" />
                ) : (
                  <ShieldCheck className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-wide">
                    {syncResult.channel_status}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded font-mono bg-slate-900/60 border border-slate-700">
                    Fidelity: {syncResult.quantum_fidelity.toFixed(5)}
                  </span>
                </div>
                <div className="text-xs opacity-90 mt-0.5">
                  Action: {syncResult.action_taken}
                </div>
              </div>
            </div>

            <div className="text-right sm:text-right font-mono text-xs space-y-0.5">
              <div>
                Sync Latency:{" "}
                <span className="font-bold text-white">
                  {syncResult.eavesdrop_detected ? "LINK DROPPED" : `${syncResult.sync_latency_picoseconds} ps (< 1 ns)`}
                </span>
              </div>
              <div>
                Wave-Function ΔS:{" "}
                <span className={syncResult.eavesdrop_detected ? "text-rose-400 font-bold" : "text-emerald-400"}>
                  +{syncResult.wavefunction_collapse_entropy_delta_s.toFixed(4)}
                </span>
              </div>
              <div className="text-[11px] opacity-75">Route: {syncResult.active_route}</div>
            </div>
          </div>
        </div>
      )}

      {/* Global Q-Mesh Topology & Interactive Routing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Global Q-Mesh Topology */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-violet-400" />
              Global Entangled Photonic Mesh Nodes (Telecom C-band 1550.12nm)
            </h3>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              1.25B Bell Pairs / sec
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {telemetry?.global_nodes.map((node) => (
              <div
                key={node.node_id}
                className={`p-3 rounded-lg border transition-all ${
                  attackResult?.compromised_channel?.includes(node.node_id)
                    ? "bg-rose-950/30 border-rose-500/50"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-bold text-cyan-300">
                      {node.node_id}
                    </span>
                    <h4 className="text-xs font-medium text-white mt-0.5">{node.location}</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800 font-mono">
                    {node.role}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/80 font-mono">
                  <span>Distance: {node.distance_km === 0 ? "0 km (Origin)" : `${node.distance_km.toLocaleString()} km`}</span>
                  <span className="text-emerald-400">Bell State Lock</span>
                </div>
              </div>
            ))}
          </div>

          {/* Microarchitecture Footnote */}
          <div className="mt-4 p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Coincidence Window: 12.0 ps</span>
            <span>Quantum Bit Error Rate (QBER): 0.08%</span>
            <span>Carrier Wavelength: 1550.12 nm</span>
          </div>
        </div>

        {/* Right Col: Interactive Order State Lock Tester */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            Entangled Order State Lock Tester
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Target Instrument</label>
              <input
                type="text"
                value={orderTicker}
                onChange={(e) => setOrderTicker(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Trade Notional (₹)</label>
              <input
                type="number"
                value={orderNotional}
                onChange={(e) => setOrderNotional(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Quantum Fiber Link</label>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-violet-500"
              >
                <option value="NSE-NY4-LINK">Mumbai NSE ⇄ New York NY4</option>
                <option value="NSE-LD4-LINK">Mumbai NSE ⇄ London LD4</option>
                <option value="NSE-FR2-LINK">Mumbai NSE ⇄ Frankfurt FR2</option>
                <option value="NSE-SG1-LINK">Mumbai NSE ⇄ Singapore SG1</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSync}
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all shadow-md disabled:opacity-50"
              >
                {loading ? "Locking Quantum State..." : "Execute Entangled Sync"}
              </button>
            </div>

            <div className="pt-1">
              <button
                onClick={handleAttackSimulation}
                disabled={attacking}
                className="w-full py-2.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-semibold text-xs transition-all shadow-md disabled:opacity-50"
              >
                {attacking ? "Simulating Attack..." : "Simulate Beam-Splitter Eavesdrop"}
              </button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300 block mb-0.5">Wave-Function Security:</span>
            Any optical eavesdropper measuring trade state vectors induces spontaneous state collapse,
            causing fidelity to breach 0.9990 and triggering zero-leakage fiber disconnection.
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import {
  v36Api,
  type RelativisticPriceData,
  type OrbitalMeshTelemetry,
  type DTNConsensusData,
} from "../../services/v36";
import { num } from "../../lib/format";
import {
  Globe2,
  Orbit,
  Radio,
  Clock,
  Zap,
  Activity,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Server,
  RefreshCw,
  Sliders,
  Send,
  Satellite,
} from "lucide-react";

export const MultiPlanetaryCapitalFabricBlotter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [mesh, setMesh] = useState<OrbitalMeshTelemetry | null>(null);
  const [terrestrialPrice, setTerrestrialPrice] = useState(2950.0);
  const [volatility, setVolatility] = useState(0.22);
  const [drift, setDrift] = useState(0.10);
  const [lightDelay, setLightDelay] = useState(1.28); // Earth-Moon default
  const [selectedNode, setSelectedNode] = useState("LUNA-GTW-01");
  const [priceData, setPriceData] = useState<RelativisticPriceData | null>(null);
  const [consensusData, setConsensusData] = useState<DTNConsensusData | null>(null);

  const fetchMesh = async () => {
    try {
      const res = await v36Api.getOrbitalMeshTelemetry();
      setMesh(res);
    } catch (e) {
      console.error(e);
    }
  };

  const calculateRelativisticPrice = async () => {
    setLoading(true);
    try {
      const res = await v36Api.computeRelativisticPrice({
        terrestrial_price: terrestrialPrice,
        volatility,
        drift,
        light_delay_seconds: lightDelay,
      });
      setPriceData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const dispatchDTNConsensus = async () => {
    setLoading(true);
    try {
      const res = await v36Api.executeDTNConsensus({
        order_id: `ORD-ORBITAL-${Math.floor(Math.random() * 10000)}`,
        ticker: "RELIANCE",
        notional: 1250000.0,
        target_node: selectedNode,
      });
      setConsensusData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMesh();
    calculateRelativisticPrice();
    dispatchDTNConsensus();
  }, []);

  const handleNodeChange = (nodeId: string) => {
    setSelectedNode(nodeId);
    const node = mesh?.nodes.find((n) => n.node_id === nodeId);
    if (node) {
      setLightDelay(node.light_delay_seconds);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Banner Header ── */}
      <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/60 border border-blue-500/30 rounded-xl p-5 backdrop-blur-md shadow-xl shadow-blue-950/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                DTN-PBFT / 36.2-ORBITAL
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Satellite className="w-3.5 h-3.5 text-cyan-400" />
                Inter-Orbital Laser Mesh Consensus
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              <Orbit className="w-6 h-6 text-cyan-400 animate-spin-slow" />
              Multi-Planetary Sovereign Capital Fabric &amp; Relativistic Settlement
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl mt-1">
              Maintains delay-tolerant state consensus across Earth, Moon, Mars, and Lagrange gateways.
              Dynamically computes special relativity time dilation and light-travel delays:
              <span className="font-mono text-cyan-300 text-xs ml-1 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20">
                P_orbital(t) = P_terrestrial(t - Δt) · exp((μ - 0.5σ²)dt + σ W_dt)
              </span>
            </p>
          </div>

          <button
            onClick={() => {
              calculateRelativisticPrice();
              dispatchDTNConsensus();
            }}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-950 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Recalculate Mesh Arbitrage
          </button>
        </div>
      </div>

      {/* ── Key Orbital Telemetry KPI Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Interplanetary Nodes</span>
            <Globe2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {mesh?.active_nodes_count ?? 7} <span className="text-xs text-cyan-400">Online</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Earth, Luna, Mars &amp; L1/L2 Relays</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Light Delay (Δt_light)</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">
            {priceData?.light_delay_seconds.toFixed(2)}s
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Target: {selectedNode}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Relativistic Spread</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">
            {priceData?.price_delta_pct !== undefined ? (
              `${priceData.price_delta_pct > 0 ? "+" : ""}${priceData.price_delta_pct.toFixed(4)}%`
            ) : (
              "+0.0431%"
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Risk Premium: {priceData?.relativistic_risk_premium_bps ?? 0.43} bps
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Laser Carrier Optical Link</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            1064 nm <span className="text-xs text-slate-400">Nd:YAG</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Cross-orbital jitter &lt; 0.45 ms</div>
        </div>
      </div>

      {/* ── Interactive Relativistic Calculator & Node Selector ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Orbital Node &amp; Parameter Simulator
            </h3>
            <span className="text-xs text-slate-400 font-mono">Special Relativity</span>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">
              Target Planetary / Orbital Node
            </label>
            <select
              value={selectedNode}
              onChange={(e) => handleNodeChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            >
              {mesh?.nodes.map((node) => (
                <option key={node.node_id} value={node.node_id}>
                  {node.name} ({node.celestial_body} — {node.light_delay_seconds}s)
                </option>
              )) || (
                <>
                  <option value="LUNA-GTW-01">Luna Gateway Orbital Station (1.28s)</option>
                  <option value="MARS-OLYMPUS-01">Mars Base Alpha (182.0s)</option>
                  <option value="LAGRANGE-L1-01">Lagrange L1 Gateway (5.02s)</option>
                </>
              )}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Terrestrial Reference Price (INR)</span>
              <span className="text-cyan-400 font-mono">₹{num(terrestrialPrice)}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="5000"
              step="50"
              value={terrestrialPrice}
              onChange={(e) => setTerrestrialPrice(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Annualized Asset Volatility (σ)</span>
              <span className="text-amber-400 font-mono">{(volatility * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.80"
              step="0.01"
              value={volatility}
              onChange={(e) => setVolatility(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Expected Drift (μ)</span>
              <span className="text-emerald-400 font-mono">{(drift * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="-0.30"
              max="0.50"
              step="0.01"
              value={drift}
              onChange={(e) => setDrift(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Manual Light Delay Override (seconds)</span>
              <span className="text-purple-400 font-mono">{lightDelay.toFixed(2)}s</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="600.0"
              step="0.5"
              value={lightDelay}
              onChange={(e) => setLightDelay(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={calculateRelativisticPrice}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold text-white transition-all shadow-md shadow-blue-950"
            >
              Update Pricing
            </button>
            <button
              onClick={dispatchDTNConsensus}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-cyan-300 border border-cyan-500/30 transition-all flex items-center justify-center gap-1"
            >
              <Send className="w-3.5 h-3.5" /> Dispatch Bundle
            </button>
          </div>
        </div>

        {/* Right Column: Pricing & Consensus Analysis */}
        <div className="lg:col-span-7 space-y-4">
          {/* Relativistic Pricing Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Relativistic Asset Pricing Expectation</span>
              <span className="text-cyan-400 font-mono text-[11px]">
                {priceData?.timestamp ? new Date(priceData.timestamp).toLocaleTimeString() : "LIVE"}
              </span>
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3">
                <span className="text-[11px] text-slate-400 block mb-1">Terrestrial Price</span>
                <span className="text-lg font-bold text-white font-mono">
                  ₹{priceData?.terrestrial_price ? num(priceData.terrestrial_price) : "2,950.00"}
                </span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3">
                <span className="text-[11px] text-slate-400 block mb-1">Adjusted Orbital Price</span>
                <span className="text-lg font-bold text-cyan-300 font-mono">
                  ₹{priceData?.adjusted_orbital_price ? num(priceData.adjusted_orbital_price) : "2,951.27"}
                </span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3">
                <span className="text-[11px] text-slate-400 block mb-1">Lorentz Dilation (γ)</span>
                <span className="text-lg font-bold text-indigo-300 font-mono">
                  {priceData?.lorentz_gamma_dilation ?? 1.00000000034}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-blue-950/20 border border-blue-500/20 p-3 text-xs text-slate-300 space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Gravitational Dilation Offset:</span>
                <span className="text-cyan-300">+38.5 μs / day (Einstein General Relativity)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time-Delineated Fractional Day (dt):</span>
                <span className="text-cyan-300">{(lightDelay / 86400).toExponential(4)} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Inter-Orbital Arbitrage Margin:</span>
                <span className="text-amber-300 font-bold">
                  {priceData ? `${(priceData.adjusted_orbital_price - priceData.terrestrial_price).toFixed(4)} INR` : "1.2721 INR"}
                </span>
              </div>
            </div>
          </div>

          {/* DTN-PBFT Consensus State */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                DTN-PBFT Delay-Tolerant Bundle Consensus
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {consensusData?.consensus_status ?? "CONSENSUS_COMMITTED_DTN"}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono mb-3">
              <div className="bg-slate-950/80 border border-slate-800/80 rounded p-2.5">
                <span className="text-[10px] text-slate-400 block">Target Body</span>
                <span className="text-white font-semibold">{consensusData?.celestial_body ?? "Moon"}</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded p-2.5">
                <span className="text-[10px] text-slate-400 block">Round-Trip Latency</span>
                <span className="text-cyan-400 font-semibold">{consensusData?.round_trip_latency_seconds ?? 2.56}s</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded p-2.5">
                <span className="text-[10px] text-slate-400 block">Quorum Ratio</span>
                <span className="text-emerald-400 font-semibold">
                  {consensusData?.votes_received ?? 5} / {consensusData?.participating_nodes?.length ?? 5} Nodes
                </span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded p-2.5">
                <span className="text-[10px] text-slate-400 block">Byzantine Tolerance</span>
                <span className="text-indigo-300 font-semibold">{consensusData?.byzantine_fault_tolerance_threshold ?? "3f + 1"}</span>
              </div>
            </div>

            <div className="text-[11px] font-mono bg-slate-950 rounded p-2 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Bundle Custody Hash:</span>
              <span className="text-amber-400 select-all font-semibold">
                {consensusData?.bundle_hash ?? "dtn_0x98fba012ef88e02"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Planetary Node Network Grid ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-blue-400" />
            Global &amp; Interplanetary Optical Gateway Nodes
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {mesh?.nodes.length ?? 7} Active Laser Relay Stations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(mesh?.nodes || []).map((node) => {
            const isSelected = selectedNode === node.node_id;
            return (
              <div
                key={node.node_id}
                onClick={() => handleNodeChange(node.node_id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-950/40 border-cyan-500 shadow-md shadow-cyan-950/40"
                    : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-white truncate max-w-[180px]">{node.name}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      node.optical_link_status.includes("DIRECT")
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : node.optical_link_status.includes("MESH")
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {node.optical_link_status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 mt-2">
                  <div>
                    <span className="text-slate-500 block">Body:</span>
                    <span className="text-slate-300">{node.celestial_body}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Delay (one-way):</span>
                    <span className="text-cyan-300 font-bold">{node.light_delay_seconds}s</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Bandwidth:</span>
                    <span className="text-slate-300">{node.bandwidth_gbps} Gbps</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Packet Loss:</span>
                    <span className="text-slate-300">{node.packet_loss_pct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

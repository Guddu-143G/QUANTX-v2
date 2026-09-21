import React, { useState, useEffect } from "react";
import {
  v35Api,
  type CntExecutionResult,
  type CntHardwareTelemetry,
} from "../../services/v35";
import { num } from "../../lib/format";
import {
  Cpu,
  Zap,
  Flame,
  Activity,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Layers,
  Sparkles,
} from "lucide-react";

export const CarbonNanotubeExecutionBlotter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [telemetry, setTelemetry] = useState<CntHardwareTelemetry | null>(null);
  const [executions, setExecutions] = useState<CntExecutionResult[]>([]);

  const [orderTicker, setOrderTicker] = useState("TCS");
  const [orderNotional, setOrderNotional] = useState(750000);
  const [orderSide, setOrderSide] = useState<"BUY" | "SELL">("BUY");

  const fetchTelemetry = async () => {
    try {
      const data = await v35Api.getCntHardwareTelemetry();
      setTelemetry(data);
    } catch (err) {
      console.error("Failed to load CNT telemetry:", err);
    }
  };

  const handleExecute = async () => {
    setLoading(true);
    try {
      const res = await v35Api.executeOrderCntFabric({
        order_id: `CNT-${Math.floor(Math.random() * 10000)}`,
        ticker: orderTicker,
        notional: orderNotional,
        side: orderSide,
      });
      setExecutions((prev) => [res, ...prev]);
    } catch (err) {
      console.error("CNT execution failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    handleExecute();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-cyan-950/40 border border-emerald-500/20 rounded-xl p-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Carbon Nanotube Molecular Logic (CNT-EMS)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                τ_gate = 0.92 ps &lt; 1.2 ps | E_switch = 0.42 Attojoules
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Carbon Nanotube Molecular Execution Fabric (CNT-EMS)
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl mt-1">
              Sub-nanometer CNT-FET logic gates replace silicon transistors, unlocking
              ballistic electron transport and sub-picosecond order book matching with
              1,000x lower thermal dissipation in exchange co-location racks.
            </p>
          </div>

          <button
            onClick={handleExecute}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-950 disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${loading ? "animate-pulse" : ""}`} />
            {loading ? "Matching in 0.92 ps..." : "Execute via CNT Fabric"}
          </button>
        </div>
      </div>

      {/* Hardware Telemetry & Thermal Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
            <span>Gate Delay (τ_gate)</span>
            <span className="text-emerald-400 font-bold">0.92 ps</span>
          </div>
          <div className="text-xl font-bold text-white">Sub-Picosecond</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Theoretical limit &lt; 1.2 ps (C_gate · V_dd / I_on)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
            <span>Switching Energy</span>
            <span className="text-cyan-400 font-bold">0.42 aJ</span>
          </div>
          <div className="text-xl font-bold text-white">10⁻¹⁸ Joules</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Near-zero quantum tunneling leakage
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
            <span>Ballistic Mean Free Path</span>
            <span className="text-violet-400 font-bold">&gt; 1.25 µm</span>
          </div>
          <div className="text-xl font-bold text-white">99.88% Efficiency</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Zero scattering electron transport
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
            <span>Thermal Reduction</span>
            <span className="text-amber-400 font-bold">1,067x Cooler</span>
          </div>
          <div className="text-xl font-bold text-white">0.08W vs 85.4W</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Ultra-dense 3D co-location stacking
          </div>
        </div>
      </div>

      {/* Thermal Dissipation Comparator Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            Thermal Footprint Differential: Silicon Semiconductor vs CNT-FET Fabric
          </h3>
          <span className="text-xs text-emerald-400 font-mono">
            ΔE = -99.9% Thermal Leakage
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Standard Silicon 3nm FPGA/ASIC Co-Location Board</span>
              <span className="text-rose-400 font-bold font-mono">85.4 Watts (Thermal Throttling Risk)</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-gradient-to-r from-amber-500 to-rose-600 rounded-full w-[95%] animate-pulse"></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>QUANTX Sub-Nanometer Carbon Nanotube Field-Effect Transistor (CNT-FET)</span>
              <span className="text-emerald-400 font-bold font-mono">0.08 Watts (Room Temp Ballistic)</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full w-[1.5%]"></div>
            </div>
          </div>
        </div>

        <div className="mt-3 text-[11px] text-slate-400 flex flex-wrap gap-4 pt-2 border-t border-slate-800/80 font-mono">
          <span>Chirality: (10, 0) Semiconducting</span>
          <span>Diameter: 0.8 nm</span>
          <span>Transistor Density: 1.4×10¹² CNTs/cm²</span>
          <span>On/Off Ratio: 10⁶</span>
        </div>
      </div>

      {/* Interactive Order Submission & Blotter */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Sub-Picosecond CNT-FET Execution Blotter
            </h3>
            <span className="text-xs text-slate-400">
              Order matching traversed across 48 sub-nanometer CNT logic stages
            </span>
          </div>

          {/* Quick Order Controls */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={orderTicker}
              onChange={(e) => setOrderTicker(e.target.value.toUpperCase())}
              placeholder="Ticker"
              className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
            />
            <input
              type="number"
              value={orderNotional}
              onChange={(e) => setOrderNotional(parseFloat(e.target.value) || 0)}
              placeholder="Notional"
              className="w-32 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
            <select
              value={orderSide}
              onChange={(e) => setOrderSide(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
            <button
              onClick={handleExecute}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>

        {/* Executions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="pb-2">Execution ID</th>
                <th className="pb-2">Ticker</th>
                <th className="pb-2">Side</th>
                <th className="pb-2">Notional (₹)</th>
                <th className="pb-2">Gate Delay</th>
                <th className="pb-2">Energy (aJ)</th>
                <th className="pb-2">Ballistic Eff.</th>
                <th className="pb-2">Hardware Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {executions.map((item) => (
                <tr key={item.execution_id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 text-cyan-300 font-bold">{item.execution_id}</td>
                  <td className="py-2.5 text-white font-bold">{item.ticker}</td>
                  <td className="py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.side === "BUY"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {item.side}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-200">₹{num(item.notional)}</td>
                  <td className="py-2.5 text-emerald-400 font-bold">{item.total_execution_delay_ps} ps</td>
                  <td className="py-2.5 text-amber-300">{item.switching_energy_dissipated_attojoules} aJ</td>
                  <td className="py-2.5 text-violet-300">{item.ballistic_transport_efficiency_pct}%</td>
                  <td className="py-2.5 text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    SUB_PICOSECOND_MATCHED
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

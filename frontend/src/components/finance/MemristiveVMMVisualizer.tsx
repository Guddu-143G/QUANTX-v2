import React, { useState, useEffect } from "react";
import {
  v33Service,
  type MemristiveVmmResponse,
  type MemristiveSpdeResponse,
} from "../../services/v33";
import { num } from "../../lib/format";
import {
  Cpu,
  Zap,
  Activity,
  Gauge,
  Layers,
  RefreshCw,
  Flame,
  CheckCircle,
  TrendingUp,
  Grid,
  Shield,
  Sliders,
} from "lucide-react";

export const MemristiveVMMVisualizer: React.FC = () => {
  const [loadingVmm, setLoadingVmm] = useState(false);
  const [loadingSpde, setLoadingSpde] = useState(false);
  const [vmmData, setVmmData] = useState<MemristiveVmmResponse | null>(null);
  const [spdeData, setSpdeData] = useState<MemristiveSpdeResponse | null>(null);
  const [spotPrice, setSpotPrice] = useState<number>(2950.0);
  const [error, setError] = useState<string | null>(null);

  const runVmm = async () => {
    setLoadingVmm(true);
    setError(null);
    try {
      const res = await v33Service.executeMemristiveVMM();
      setVmmData(res);
    } catch (err: any) {
      setError(err.message || "Failed to execute memristive VMM.");
    } finally {
      setLoadingVmm(false);
    }
  };

  const runSpde = async (price: number) => {
    setLoadingSpde(true);
    try {
      const res = await v33Service.getMemristiveSpdeSurface(price, 0.065, 0.04);
      setSpdeData(res);
    } catch (err: any) {
      console.error("Failed to solve SPDE surface:", err);
    } finally {
      setLoadingSpde(false);
    }
  };

  useEffect(() => {
    runVmm();
    runSpde(spotPrice);
  }, []);

  const handleSpotPriceChange = (newPrice: number) => {
    setSpotPrice(newPrice);
    runSpde(newPrice);
  };

  return (
    <div className="space-y-6">
      {/* ── Header & Hardware Specs ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-subtle pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
                <Cpu className="h-4 w-4" />
              </span>
              <h2 className="text-base font-semibold text-text-primary">
                Neuromorphic Analog Memristive Co-Processor
              </h2>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-emerald-400">
                Ohm's & Kirchhoff's Law VMM (I = G · V)
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Physical electron-drift crossbar array computing continuous stochastic PDEs and dense matrix products at sub-picosecond analog speeds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                runVmm();
                runSpde(spotPrice);
              }}
              disabled={loadingVmm || loadingSpde}
              className="flex items-center gap-1.5 rounded border border-line-subtle bg-bg-primary px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-bg-tertiary transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingVmm ? "animate-spin" : ""}`} />
              Pulse Crossbar Array
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Telemetry KPI Cards */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded border border-line-subtle bg-bg-primary p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-text-muted">Analog Latency</span>
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-mono font-semibold text-emerald-400">
                {vmmData ? vmmData.execution_latency_picoseconds : 0.78}
              </span>
              <span className="text-xs text-text-muted">ps</span>
            </div>
            <p className="mt-0.5 text-[10px] text-text-muted">&lt; 1 picosecond physical drift</p>
          </div>

          <div className="rounded border border-line-subtle bg-bg-primary p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-text-muted">Energy Efficiency</span>
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-mono font-semibold text-cyan-400">
                {vmmData ? vmmData.energy_efficiency_fJ_per_op : 0.15}
              </span>
              <span className="text-xs text-text-muted">fJ/op</span>
            </div>
            <p className="mt-0.5 text-[10px] text-text-muted">Femtojoules per analog MAC</p>
          </div>

          <div className="rounded border border-line-subtle bg-bg-primary p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-text-muted">Thermal Dissipation</span>
              <Flame className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-mono font-semibold text-amber-400">100x</span>
              <span className="text-xs text-text-muted">Reduction</span>
            </div>
            <p className="mt-0.5 text-[10px] text-text-muted">Near-zero Joule heating</p>
          </div>

          <div className="rounded border border-line-subtle bg-bg-primary p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-text-muted">Continuous SPDE Solve</span>
              <Gauge className="h-3.5 w-3.5 text-purple-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-mono font-semibold text-purple-400">
                {spdeData ? spdeData.spde_solver_latency_ms : 0.14}
              </span>
              <span className="text-xs text-text-muted">ms</span>
            </div>
            <p className="mt-0.5 text-[10px] text-text-muted">Heston/SABR surface solution</p>
          </div>
        </div>
      </div>

      {/* ── Memristive Crossbar Array Inspection ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-line-subtle pb-3">
          <div className="flex items-center gap-2">
            <Grid className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-text-primary">
              Physical Memristor Nanodevice Crossbar Array (8×8 Grid)
            </h3>
          </div>
          <span className="text-xs font-mono text-text-muted">
            Status: {vmmData?.status || "READY"}
          </span>
        </div>

        <p className="mt-2 text-xs text-text-muted">
          Each nanoscale cross-point cell maintains a programmable non-volatile conductance state $G_{'{i,j}'}$. Inflow voltages $V_i$ induce Kirchhoff currents $I_j = \sum G_{'{i,j}'} V_i$ aggregated down vertical bitlines.
        </p>

        {/* Input Voltage Bar */}
        {vmmData && (
          <div className="mt-4 rounded border border-line-subtle bg-bg-primary p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
                Input Wordline Voltages (V_i)
              </span>
              <span className="text-[10px] font-mono text-emerald-400">8 Wordline Channels Active</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {vmmData.input_voltage_vector.map((v, idx) => (
                <div key={idx} className="rounded border border-emerald-500/20 bg-emerald-500/5 p-1.5 text-center">
                  <div className="text-[10px] font-mono text-text-muted">V[{idx}]</div>
                  <div className="text-xs font-mono font-semibold text-emerald-300">{v.toFixed(2)}V</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Crossbar 4x4 Sample Cells */}
        {vmmData && vmmData.crossbar_cells_grid.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
              Nanoscale Filament Conductance Matrix Cells ($G_{'{i,j}'}$)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {vmmData.crossbar_cells_grid.flat().map((cell, idx) => (
                <div
                  key={idx}
                  className={`rounded border p-2.5 transition ${
                    cell.filament_state === "LOW_RESISTANCE_ON"
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-line-subtle bg-bg-primary"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-text-muted">{cell.cell_id}</span>
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        cell.filament_state === "LOW_RESISTANCE_ON" ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
                      }`}
                    />
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-xs font-mono font-bold text-text-primary">{cell.conductance_mS} mS</span>
                    <span className="text-[10px] font-mono text-text-muted">{cell.resistance_kOhm} kΩ</span>
                  </div>
                  <div className="mt-1 text-[9px] font-mono text-text-muted truncate">
                    {cell.filament_state}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Output Bitline Currents */}
        {vmmData && (
          <div className="mt-4 rounded border border-line-subtle bg-bg-primary p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
                Accumulated Bitline Output Currents (I_j = Σ G_ij · V_i)
              </span>
              <span className="text-[10px] font-mono text-cyan-400">Kirchhoff Current Sum</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {vmmData.output_currents_mA.map((curr, idx) => (
                <div key={idx} className="rounded border border-cyan-500/20 bg-cyan-500/5 p-1.5 text-center">
                  <div className="text-[10px] font-mono text-text-muted">I[{idx}]</div>
                  <div className="text-xs font-mono font-semibold text-cyan-300">{curr.toFixed(3)} mA</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Continuous Heston/SABR SPDE Implied Vol Surface ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-subtle pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-text-primary">
              Continuous Heston/SABR SPDE Implied Volatility Surface
            </h3>
            <span className="rounded bg-purple-500/10 px-2 py-0.5 text-[10px] font-mono text-purple-400">
              Analog SPDE Solver
            </span>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-text-muted flex items-center gap-2">
              <span>Underlying Spot (₹):</span>
              <input
                type="number"
                step="50"
                value={spotPrice}
                onChange={(e) => handleSpotPriceChange(parseFloat(e.target.value) || 2950)}
                className="w-24 rounded border border-line-subtle bg-bg-primary px-2 py-1 text-xs font-mono text-text-primary focus:border-purple-500 focus:outline-none"
              />
            </label>
          </div>
        </div>

        <p className="mt-2 text-xs text-text-muted">
          Analog crossbars directly map continuous space-time differential operators $\frac{'\u2202V'}{'\u2202t'} + \frac{1}{2}\sigma^2 S^2 \frac{'\u2202^2 V'}{'\u2202S^2'} + \rho\sigma v S \frac{'\u2202^2 V'}{'\u2202S \u2202v'} + \kappa(\theta - v)\frac{'\u2202V'}{'\u2202v'} - rV = 0$ onto electrical potential distributions.
        </p>

        {spdeData && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-line-subtle bg-bg-primary text-text-muted">
                  <th className="p-2.5">Maturity (Days)</th>
                  {spdeData.strikes.map((k) => (
                    <th key={k} className="p-2.5 text-center">
                      ₹{k}
                      <div className="text-[10px] font-normal text-text-muted">
                        ({((k / spdeData.spot_price - 1) * 100).toFixed(0)}%)
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line-subtle">
                {spdeData.vol_surface_matrix.map((row, rIdx) => {
                  const days = spdeData.maturities_days[rIdx];
                  return (
                    <tr key={days} className="hover:bg-bg-tertiary/40 transition">
                      <td className="p-2.5 font-semibold text-text-primary">
                        {days} Days (T={((days / 365).toFixed(2))}y)
                      </td>
                      {row.map((vol, cIdx) => {
                        const volPct = (vol * 100).toFixed(1);
                        const intensity = Math.min(Math.max((vol - 0.15) / 0.25, 0), 1);
                        return (
                          <td key={cIdx} className="p-2.5 text-center">
                            <span
                              className="inline-block rounded px-2 py-0.5 text-xs font-semibold"
                              style={{
                                backgroundColor: `rgba(168, 85, 247, ${0.1 + intensity * 0.4})`,
                                color: intensity > 0.5 ? "#e9d5ff" : "#c084fc",
                              }}
                            >
                              {volPct}%
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

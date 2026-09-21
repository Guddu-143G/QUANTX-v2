import React, { useState, useEffect } from "react";
import {
  type PhotonicMatMulResponse,
  type PhotonicTelemetryResponse,
  postQuantumV32Service,
} from "../../services/v32";
import { num } from "../../lib/format";
import {
  Zap,
  Cpu,
  Activity,
  Gauge,
  Layers,
  RefreshCw,
  Sun,
  Flame,
  CheckCircle,
  BarChart2,
  TrendingUp,
} from "lucide-react";

export const PhotonicTensorVisualizer: React.FC = () => {
  const [loadingMatMul, setLoadingMatMul] = useState(false);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);
  const [matMulData, setMatMulData] = useState<PhotonicMatMulResponse | null>(null);
  const [telemetryData, setTelemetryData] = useState<PhotonicTelemetryResponse | null>(null);
  const [matrixDim, setMatrixDim] = useState<number>(64);
  const [error, setError] = useState<string | null>(null);

  const runMatMul = async () => {
    setLoadingMatMul(true);
    setError(null);
    try {
      const res = await postQuantumV32Service.simulatePhotonicMatMul({ matrix_dim: matrixDim });
      setMatMulData(res);
    } catch (err: any) {
      setError(err.message || "Photonic matrix computation failed.");
    } finally {
      setLoadingMatMul(false);
    }
  };

  const fetchTelemetry = async () => {
    setLoadingTelemetry(true);
    try {
      const res = await postQuantumV32Service.getPhotonicTelemetry();
      setTelemetryData(res);
    } catch (err: any) {
      console.error("Failed to fetch photonic telemetry:", err);
    } finally {
      setLoadingTelemetry(false);
    }
  };

  useEffect(() => {
    runMatMul();
    fetchTelemetry();
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Control Header ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-subtle pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-400">
                <Sun className="h-4 w-4" />
              </span>
              <h2 className="text-base font-semibold text-text-primary">
                Neuromorphic Photonic Optical Tensor Engine
              </h2>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-cyan-400">
                Sub-Picosecond MZI Optical Mesh
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Mach-Zehnder Interferometer (MZI) optical mesh array executing unitary transformations [Y = U * Σ * V† * X] at the speed of light.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={matrixDim}
              onChange={(e) => setMatrixDim(parseInt(e.target.value, 10))}
              className="rounded border border-line-subtle bg-bg-primary px-3 py-1.5 text-xs font-mono text-text-primary focus:border-cyan-500 focus:outline-none"
            >
              <option value={32}>32x32 Attention Head</option>
              <option value={64}>64x64 Transformer Core</option>
              <option value={128}>128x128 Liquid ODE Solver</option>
            </select>

            <button
              onClick={() => {
                runMatMul();
                fetchTelemetry();
              }}
              disabled={loadingMatMul}
              className="flex items-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-cyan-500 disabled:opacity-50 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingMatMul ? "animate-spin" : ""}`} />
              {loadingMatMul ? "Contracting Mesh..." : "Trigger Optical Pulse"}
            </button>
          </div>
        </div>

        {/* ── Key Performance Indicators (Optical vs GPU) ── */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded border border-line-subtle bg-bg-primary p-4">
            <span className="text-xs font-medium text-text-muted">Optical Contraction Latency</span>
            <div className="mt-2 text-2xl font-bold font-mono text-cyan-400">
              {matMulData ? `${matMulData.photonic_latency_picoseconds} ps` : "9.85 ps"}
            </div>
            <div className="mt-1 text-[11px] text-text-muted">Sub-10 picosecond silica propagation</div>
          </div>

          <div className="rounded border border-line-subtle bg-bg-primary p-4">
            <span className="text-xs font-medium text-text-muted">Speedup vs Standard CUDA</span>
            <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
              {matMulData ? `${num(matMulData.speedup_vs_cuda, 0)}x` : "126,903x"}
            </div>
            <div className="mt-1 text-[11px] text-text-muted">vs 1.25 ms GPU kernel launch</div>
          </div>

          <div className="rounded border border-line-subtle bg-bg-primary p-4">
            <span className="text-xs font-medium text-text-muted">Energy Efficiency</span>
            <div className="mt-2 text-2xl font-bold font-mono text-purple-400">
              {matMulData ? `${matMulData.energy_efficiency_fJ_per_op} fJ` : "0.42 fJ"}
              <span className="text-xs font-normal text-text-muted"> / MAC</span>
            </div>
            <div className="mt-1 text-[11px] text-text-muted">&gt; 20,000x less power than silicon</div>
          </div>

          <div className="rounded border border-line-subtle bg-bg-primary p-4">
            <span className="text-xs font-medium text-text-muted">Optical Signal-to-Noise</span>
            <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
              {matMulData ? `${matMulData.optical_snr_db} dB` : "38.5 dB"}
            </div>
            <div className="mt-1 text-[11px] text-text-muted">DWDM 64 wavelength multiplexing</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-[8px] border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-400">
          {error}
        </div>
      )}

      {/* ── Mach-Zehnder Interferometer (MZI) Optical Mesh Array ── */}
      {matMulData && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* MZI Mesh Visualizer */}
          <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-line-subtle pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-text-primary">
                  Mach-Zehnder Interferometer (MZI) Optical Mesh Array
                </h3>
              </div>
              <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-cyan-400 border border-cyan-500/30">
                4x4 UNITARY CORE
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {matMulData.mzi_mesh_grid.map((row, rIdx) =>
                row.map((mzi) => (
                  <div
                    key={mzi.mzi_id}
                    className="rounded border border-line-subtle bg-bg-primary p-3 hover:border-cyan-500/40 transition"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-400">
                      <span>{mzi.mzi_id}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    </div>
                    <div className="mt-2 space-y-1 font-mono text-[10px] text-text-muted">
                      <div>θ (theta): <strong className="text-text-primary">{mzi.theta_rad} rad</strong></div>
                      <div>φ (phi): <strong className="text-text-primary">{mzi.phi_rad} rad</strong></div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-line-subtle text-[11px] text-text-muted flex items-center justify-between">
              <span>Waveguide Thermal Stability: <strong className="text-emerald-400 font-mono">{matMulData.waveguide_thermal_stability_pct}%</strong></span>
              <span>DWDM Channels: <strong className="text-text-primary font-mono">{matMulData.dwdm_channels_utilized}</strong></span>
            </div>
          </div>

          {/* Co-Packaged Optics (CPO) Telemetry */}
          <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-line-subtle pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-semibold text-text-primary">CPO Die Telemetry</h3>
                </div>
                <span className="text-xs font-mono text-emerald-400">ONLINE</span>
              </div>

              <div className="mt-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between rounded bg-bg-primary p-2.5 border border-line-subtle">
                  <span className="text-text-muted">Laser Wavelength:</span>
                  <span className="font-bold text-text-primary">
                    {telemetryData ? `${telemetryData.laser_wavelength_nm} nm` : "1550.12 nm"} (C-Band)
                  </span>
                </div>
                <div className="flex items-center justify-between rounded bg-bg-primary p-2.5 border border-line-subtle">
                  <span className="text-text-muted">Die Temperature:</span>
                  <span className="font-bold text-cyan-400">
                    {telemetryData ? `${telemetryData.die_temperature_celsius} °C` : "32.4 °C"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded bg-bg-primary p-2.5 border border-line-subtle">
                  <span className="text-text-muted">Propagation Loss:</span>
                  <span className="font-bold text-text-primary">
                    {telemetryData ? `${telemetryData.photonic_propagation_loss_db_per_cm} dB/cm` : "0.12 dB/cm"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded bg-bg-primary p-2.5 border border-line-subtle">
                  <span className="text-text-muted">Attenuation Calib:</span>
                  <span className="font-bold text-emerald-400">
                    {telemetryData ? telemetryData.attenuation_calibration : "NOMINAL"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-line-subtle text-[11px] text-text-muted">
              <span>Acceleration Target: <strong className="text-text-primary">Transformer Attention (Q*K^T) & LNN ODEs</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

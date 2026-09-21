import React, { useState, useEffect } from "react";
import {
  v35Api,
  type SyntheticUniverseData,
  type MultiverseMonteCarloData,
} from "../../services/v35";
import { num } from "../../lib/format";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import {
  Sparkles,
  Layers,
  AlertTriangle,
  RefreshCw,
  Activity,
  Sliders,
  TrendingDown,
  ShieldAlert,
  BarChart2,
  Zap,
} from "lucide-react";

export const SyntheticMarketSingularityStudio: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [timesteps, setTimesteps] = useState(100);
  const [shockIntensity, setShockIntensity] = useState(2.8);
  const [scenarioType, setScenarioType] = useState("LIQUIDITY_VACUUM");
  const [interestShockBps, setInterestShockBps] = useState(150);
  const [geopoliticalStress, setGeopoliticalStress] = useState(0.85);

  const [universeData, setUniverseData] = useState<SyntheticUniverseData | null>(null);
  const [multiverseData, setMultiverseData] = useState<MultiverseMonteCarloData | null>(null);
  const [viewMode, setViewMode] = useState<"SINGLE" | "MULTIVERSE">("SINGLE");

  const runSimulation = async () => {
    setLoading(true);
    try {
      const data = await v35Api.generateSyntheticUniverse({
        n_timesteps: timesteps,
        shock_intensity: shockIntensity,
        scenario_type: scenarioType,
        conditioning_vector: {
          interest_rate_shock_bps: interestShockBps,
          geopolitical_stress_idx: geopoliticalStress,
          market_maker_inventory_stress: 0.92,
          credit_spread_widening_bps: 220.0,
        },
      });
      setUniverseData(data);

      const mv = await v35Api.runMultiverseMonteCarlo({
        n_universes: 20,
        n_timesteps: timesteps,
        shock_intensity: shockIntensity,
      });
      setMultiverseData(mv);
    } catch (err) {
      console.error("Failed to generate synthetic universe:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  // Format chart data
  const chartData = universeData
    ? universeData.synthetic_price_path.map((p, i) => ({
        t: i,
        price: p,
        depth: universeData.synthetic_book_depth[i] || 0,
        spread: universeData.synthetic_spread_bps[i] || 0,
        vol: universeData.synthetic_volatility_pct[i] || 0,
      }))
    : [];

  const multiverseChartData = multiverseData
    ? multiverseData.envelope_p50.map((p50, i) => ({
        t: i,
        p5: multiverseData.envelope_p5[i],
        p50: p50,
        p95: multiverseData.envelope_p95[i],
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-950/50 via-slate-900 to-indigo-950/40 border border-cyan-500/20 rounded-xl p-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                v35 Latent Diffusion Transformer (DiT)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                q(z_t | z_0) &amp; Score-Based Reverse SDE
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Generative Synthetic Market Singularity Universe
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl mt-1">
              Generates high-dimensional, non-stationary synthetic financial multi-verses
              conditioned on macro shock vectors, testing portfolio resilience against
              15-sigma volatility gaps and 99% order book liquidity collapse.
            </p>
          </div>

          <button
            onClick={runSimulation}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-all shadow-lg shadow-cyan-950 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Diffusing Universe..." : "Regenerate Universe"}
          </button>
        </div>
      </div>

      {/* Parameter Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>Scenario Type</span>
            <span className="text-cyan-400 font-mono text-[11px]">{scenarioType}</span>
          </label>
          <select
            value={scenarioType}
            onChange={(e) => setScenarioType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="LIQUIDITY_VACUUM">Liquidity Vacuum (99% Depth Cliff)</option>
            <option value="VOLATILITY_CASCADE_15SIGMA">15-Sigma Volatility Cascade</option>
            <option value="FLASH_CRASH_AND_REBOUND">Flash Crash &amp; Non-Linear Rebound</option>
          </select>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Shock Intensity</span>
            <span className="font-mono text-cyan-400 font-semibold">{shockIntensity.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="5.0"
            step="0.1"
            value={shockIntensity}
            onChange={(e) => setShockIntensity(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>1.0x (Mild)</span>
            <span>2.5x (Tail)</span>
            <span>5.0x (Singularity)</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Horizon Timesteps</span>
            <span className="font-mono text-indigo-400 font-semibold">{timesteps} ticks</span>
          </div>
          <input
            type="range"
            min="40"
            max="200"
            step="10"
            value={timesteps}
            onChange={(e) => setTimesteps(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>40 ticks</span>
            <span>100 ticks</span>
            <span>200 ticks</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Rate Shock Conditioning</span>
            <span className="font-mono text-amber-400 font-semibold">+{interestShockBps} bps</span>
          </div>
          <input
            type="range"
            min="25"
            max="400"
            step="25"
            value={interestShockBps}
            onChange={(e) => setInterestShockBps(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>+25 bps</span>
            <span>+200 bps</span>
            <span>+400 bps</span>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      {universeData && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className={`p-4 rounded-xl border ${universeData.liquidity_vacuum_detected ? 'bg-rose-950/30 border-rose-500/40 text-rose-300' : 'bg-slate-900/60 border-slate-800 text-slate-300'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono tracking-wider">Vacuum Status</span>
              <AlertTriangle className={`w-4 h-4 ${universeData.liquidity_vacuum_detected ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
            </div>
            <div className="text-lg font-bold mt-1">
              {universeData.liquidity_vacuum_detected ? "VACUUM DETECTED" : "NORMAL DEPTH"}
            </div>
            <div className="text-[11px] opacity-80 mt-0.5">
              Min Depth: {universeData.min_book_depth_contracts} contracts
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs uppercase font-mono text-slate-400 tracking-wider">Max Sigma Jump</span>
            <div className="text-xl font-bold text-cyan-400 mt-1">
              {universeData.max_sigma_jump}σ
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Instantaneous Tail Discontinuity</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs uppercase font-mono text-slate-400 tracking-wider">Tail VaR (99.9%)</span>
            <div className="text-xl font-bold text-amber-400 mt-1">
              {universeData.tail_var_99_9_pct}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">CVaR: {universeData.tail_cvar_99_9_pct}%</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs uppercase font-mono text-slate-400 tracking-wider">Latent Dimension</span>
            <div className="text-xl font-bold text-indigo-400 mt-1">
              {universeData.dit_latent_dimension}-D
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">DiT Score Network</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs uppercase font-mono text-slate-400 tracking-wider">World Model Fidelity</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {(universeData.world_model_fidelity * 100).toFixed(2)}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Adversarial Realism Score</div>
          </div>
        </div>
      )}

      {/* Main Chart View */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              {viewMode === "SINGLE" ? "Synthetic Price & Order Book Liquidity Trajectory" : "Multi-Verse Monte Carlo Envelopes (P5 / P50 / P95)"}
            </h3>
            <span className="text-xs text-slate-400">
              {viewMode === "SINGLE"
                ? "Simulated Level-3 order book depth collapse during conditioned macro shock"
                : `Aggregated distribution over ${multiverseData?.n_universes || 20} simulated universes`}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode("SINGLE")}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${viewMode === "SINGLE" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
            >
              Single Universe
            </button>
            <button
              onClick={() => setViewMode("MULTIVERSE")}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${viewMode === "MULTIVERSE" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
            >
              Multi-Verse Envelopes
            </button>
          </div>
        </div>

        {viewMode === "SINGLE" ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="t" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="left"
                  stroke="#38bdf8"
                  tick={{ fontSize: 11 }}
                  domain={["auto", "auto"]}
                  tickFormatter={(val) => `₹${val}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#f43f5e"
                  tick={{ fontSize: 11 }}
                  domain={[0, "auto"]}
                  tickFormatter={(val) => `${val}c`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: "12px" }}
                  formatter={(val: any, name: any) => [
                    name === "price" ? `₹${num(val)}` : `${val} contracts`,
                    name === "price" ? "Synthetic Price" : "Book Depth",
                  ]}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="price"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={false}
                  name="price"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="depth"
                  stroke="#f43f5e"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  dot={false}
                  name="depth"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={multiverseChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="t" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#818cf8" tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="p95" stroke="#4338ca" fill="#4338ca" fillOpacity={0.15} name="P95 Upper" />
                <Area type="monotone" dataKey="p50" stroke="#818cf8" fill="#818cf8" fillOpacity={0.3} strokeWidth={2} name="P50 Median" />
                <Area type="monotone" dataKey="p5" stroke="#e11d48" fill="#e11d48" fillOpacity={0.15} name="P5 Lower Tail" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart Legends */}
        <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400 mt-2">
          {viewMode === "SINGLE" ? (
            <>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-sky-400 inline-block"></span>
                  Synthetic Price (Left Axis)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-rose-500 border-dashed border-t border-rose-500 inline-block"></span>
                  Order Book Depth (Right Axis)
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                Score: ∇_z log p_t(z_t) | Shock: {shockIntensity}x
              </span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 bg-indigo-500/20 border border-indigo-500 inline-block rounded-xs"></span>
                  P95 Optimistic Path
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-indigo-400 inline-block"></span>
                  P50 Median Horizon
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 bg-rose-500/20 border border-rose-500 inline-block rounded-xs"></span>
                  P5 Catastrophic Tail Envelope
                </span>
              </div>
              {multiverseData && (
                <span className="font-mono text-[11px] text-rose-400">
                  Vacuum Probability: {multiverseData.liquidity_vacuum_frequency_pct}% | Worst DD: {multiverseData.worst_case_drawdown_pct}%
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

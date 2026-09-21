import React, { useState, useEffect } from "react";
import {
  type OrderBookSimulationResponse,
  worldModelV31Service,
} from "../../services/v31";
import { inr, num } from "../../lib/format";
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  Zap,
  TrendingUp,
  Cpu,
  RefreshCw,
  Sliders,
  Layers,
  BarChart2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface MarketWorldModelVisualizerProps {
  onSimulationComplete?: (data: OrderBookSimulationResponse) => void;
}

export const MarketWorldModelVisualizer: React.FC<MarketWorldModelVisualizerProps> = ({
  onSimulationComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [simulationData, setSimulationData] = useState<OrderBookSimulationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Input states
  const [midPrice, setMidPrice] = useState<number>(2850.0);
  const [totalShares, setTotalShares] = useState<number>(10000);
  const [nSteps, setNSteps] = useState<number>(40);
  const [vpin, setVpin] = useState<number>(0.18);
  const [side, setSide] = useState<string>("BUY");

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await worldModelV31Service.simulateOrderbook({
        mid_price: midPrice,
        total_order_shares: totalShares,
        n_steps: nSteps,
        vpin: vpin,
        side: side,
      });
      setSimulationData(res);
      if (onSimulationComplete) {
        onSimulationComplete(res);
      }
    } catch (err: any) {
      setError(err.message || "Simulation failed. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  const bids = simulationData?.orderbook_l2_depth.bids || [];
  const asks = simulationData?.orderbook_l2_depth.asks || [];
  const maxBidShares = Math.max(...bids.map((b) => b.shares), 1);
  const maxAskShares = Math.max(...asks.map((a) => a.shares), 1);

  return (
    <div className="space-y-6">
      {/* ── Control Header ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-subtle pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-400">
                <Cpu className="h-4 w-4" />
              </span>
              <h2 className="text-base font-semibold text-text-primary">
                Generative Multi-Agent Market World Model
              </h2>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-cyan-400">
                L2/L3 Limit Order Book
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Pre-trade synthetic slippage validation gate ($\le 15$ bps) simulating Avellaneda-Stoikov MMs, Almgren-Chriss liquidators, and OBI arbitrageurs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runSimulation}
              disabled={loading}
              className="flex items-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-cyan-500 disabled:opacity-50 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Simulating Market..." : "Run World Model Sim"}
            </button>
          </div>
        </div>

        {/* ── Parameter Controls ── */}
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          <div>
            <label className="text-[11px] font-medium text-text-muted">Mid Price (₹)</label>
            <input
              type="number"
              value={midPrice}
              onChange={(e) => setMidPrice(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-3 py-1.5 text-xs font-mono text-text-primary focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-text-muted">Order Shares</label>
            <input
              type="number"
              value={totalShares}
              onChange={(e) => setTotalShares(parseInt(e.target.value, 10) || 0)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-3 py-1.5 text-xs font-mono text-text-primary focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-text-muted">VPIN Toxicity ({vpin.toFixed(2)})</label>
            <input
              type="range"
              min="0.05"
              max="0.45"
              step="0.01"
              value={vpin}
              onChange={(e) => setVpin(parseFloat(e.target.value))}
              className="mt-2 w-full accent-cyan-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-text-muted">Side</label>
            <select
              value={side}
              onChange={(e) => setSide(e.target.value)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-3 py-1.5 text-xs font-mono text-text-primary focus:border-cyan-500 focus:outline-none"
            >
              <option value="BUY">BUY (Parent Long)</option>
              <option value="SELL">SELL (Parent Short)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-text-muted">Simulation Steps</label>
            <input
              type="number"
              value={nSteps}
              onChange={(e) => setNSteps(parseInt(e.target.value, 10) || 10)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-3 py-1.5 text-xs font-mono text-text-primary focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-[8px] border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-400">
          <AlertTriangle className="mr-2 inline h-4 w-4" />
          {error}
        </div>
      )}

      {simulationData && (
        <>
          {/* ── KPI Validation Gate Banner ── */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Status Gate */}
            <div className={`rounded-[8px] border p-4 ${
              simulationData.validation_status === "APPROVED"
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-amber-500/30 bg-amber-500/10"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-muted">Validation Gate</span>
                {simulationData.validation_status === "APPROVED" ? (
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                )}
              </div>
              <div className={`mt-2 text-lg font-bold ${
                simulationData.validation_status === "APPROVED" ? "text-emerald-400" : "text-amber-400"
              }`}>
                {simulationData.validation_status}
              </div>
              <p className="mt-1 text-[11px] text-text-muted">
                {simulationData.validation_status === "APPROVED"
                  ? "Slippage strictly within 15.0 bps threshold"
                  : "Order slice impact exceeds threshold; reduce slice participation"}
              </p>
            </div>

            {/* Slippage vs Threshold */}
            <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-4">
              <span className="text-xs font-medium text-text-muted">Simulated Slippage</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-2xl font-bold font-mono ${
                  simulationData.simulated_slippage_bps <= 15.0 ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {simulationData.simulated_slippage_bps.toFixed(2)} <span className="text-xs font-normal">bps</span>
                </span>
                <span className="text-xs text-text-muted font-mono">
                  / {simulationData.slippage_limit_bps.toFixed(1)} max
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-bg-primary overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    simulationData.simulated_slippage_bps <= 15.0 ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.min((simulationData.simulated_slippage_bps / 25) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Microprice & Spread */}
            <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-4">
              <span className="text-xs font-medium text-text-muted">Microprice & Spread</span>
              <div className="mt-2 text-xl font-bold font-mono text-cyan-400">
                ₹{simulationData.microprice.toFixed(2)}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-text-muted">
                <span>Spread: ₹{simulationData.spread.toFixed(2)}</span>
                <span className="font-mono">Mid: ₹{simulationData.mid_price.toFixed(2)}</span>
              </div>
            </div>

            {/* Predatory Sandwich Alert */}
            <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-4">
              <span className="text-xs font-medium text-text-muted">Sandwich Arbitrage Risk</span>
              <div className="mt-2 flex items-center gap-2">
                {simulationData.predatory_sandwich_detected ? (
                  <>
                    <span className="flex h-3 w-3 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-sm font-bold text-rose-400">PREDATORY SPREAD DETECTED</span>
                  </>
                ) : (
                  <>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="text-sm font-bold text-emerald-400">CLEAR (NO FRONT-RUN)</span>
                  </>
                )}
              </div>
              <p className="mt-1 text-[11px] text-text-muted">
                OBI momentum arbitrageur front-running filter
              </p>
            </div>
          </div>

          {/* ── Level 2/3 Order Book Depth Ladder & Agent Telemetry ── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* L2 Depth Ladder */}
            <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-line-subtle pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-text-primary">
                    Level-2/3 Limit Order Book Ladder
                  </h3>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-text-muted">
                  <span className="text-emerald-400 font-semibold">
                    Bid Depth: {num(simulationData.orderbook_l2_depth.total_bid_depth, 0)} shs
                  </span>
                  <span className="text-rose-400 font-semibold">
                    Ask Depth: {num(simulationData.orderbook_l2_depth.total_ask_depth, 0)} shs
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Asks (Sell Orders - Top down or Highest to Lowest) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted border-b border-line-subtle pb-1">
                    <span>Ask Price (₹)</span>
                    <span>Shares</span>
                    <span>Orders</span>
                  </div>
                  {asks.map((ask) => {
                    const barWidthPct = Math.min((ask.shares / maxAskShares) * 100, 100);
                    return (
                      <div
                        key={`ask-${ask.level}`}
                        className="relative flex items-center justify-between rounded px-2 py-1 text-xs font-mono hover:bg-rose-500/5 transition"
                      >
                        <div
                          className="absolute right-0 top-0 bottom-0 bg-rose-500/15 rounded-r pointer-events-none"
                          style={{ width: `${barWidthPct}%` }}
                        />
                        <span className="z-10 text-rose-400 font-medium">₹{ask.price.toFixed(2)}</span>
                        <span className="z-10 text-text-primary">{num(ask.shares, 0)}</span>
                        <span className="z-10 text-text-muted">{ask.orders}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Bids (Buy Orders) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted border-b border-line-subtle pb-1">
                    <span>Bid Price (₹)</span>
                    <span>Shares</span>
                    <span>Orders</span>
                  </div>
                  {bids.map((bid) => {
                    const barWidthPct = Math.min((bid.shares / maxBidShares) * 100, 100);
                    return (
                      <div
                        key={`bid-${bid.level}`}
                        className="relative flex items-center justify-between rounded px-2 py-1 text-xs font-mono hover:bg-emerald-500/5 transition"
                      >
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-emerald-500/15 rounded-l pointer-events-none"
                          style={{ width: `${barWidthPct}%` }}
                        />
                        <span className="z-10 text-emerald-400 font-medium">₹{bid.price.toFixed(2)}</span>
                        <span className="z-10 text-text-primary">{num(bid.shares, 0)}</span>
                        <span className="z-10 text-text-muted">{bid.orders}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Multi-Agent Persona Telemetry */}
            <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-line-subtle pb-3">
                  <Activity className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-semibold text-text-primary">
                    Synthetic Persona Telemetry
                  </h3>
                </div>

                <div className="mt-4 space-y-4">
                  {/* Persona 1: Avellaneda-Stoikov HFT */}
                  <div className="rounded border border-line-subtle bg-bg-primary p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-cyan-400">Avellaneda-Stoikov HFT</span>
                      <span className="font-mono text-xs font-bold text-text-primary">
                        {simulationData.agent_telemetry.hft_market_maker_quotes} quotes
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-text-muted">
                      Optimal inventory-skewed quoting & continuous two-sided liquidity.
                    </p>
                  </div>

                  {/* Persona 2: Almgren-Chriss Liquidators */}
                  <div className="rounded border border-line-subtle bg-bg-primary p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-purple-400">Almgren-Chriss Institutional</span>
                      <span className="font-mono text-xs font-bold text-text-primary">
                        {simulationData.agent_telemetry.institutional_block_fills} fills
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-text-muted">
                      Trajectory execution liquidating blocks with temporary price impact.
                    </p>
                  </div>

                  {/* Persona 3: Momentum Arbitrageurs */}
                  <div className="rounded border border-line-subtle bg-bg-primary p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-400">OBI Momentum Arbitrageurs</span>
                      <span className="font-mono text-xs font-bold text-text-primary">
                        {simulationData.agent_telemetry.arbitrageur_bursts} bursts
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-text-muted">
                      Order book imbalance sniper agents attacking transient queue deficits.
                    </p>
                  </div>

                  {/* Persona 4: Retail Noise Traders */}
                  <div className="rounded border border-line-subtle bg-bg-primary p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-400">Retail Noise Flow</span>
                      <span className="font-mono text-xs font-bold text-text-primary">
                        {simulationData.agent_telemetry.retail_noise_trades} fills
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-text-muted">
                      Stochastic Poisson arrivals injecting authentic retail churn.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-line-subtle text-[11px] text-text-muted flex items-center justify-between">
                <span>Avg Fill Price: <strong className="text-text-primary font-mono">₹{simulationData.avg_executed_price.toFixed(2)}</strong></span>
                <span>Order Shares: <strong className="text-text-primary font-mono">{num(simulationData.total_order_shares, 0)}</strong></span>
              </div>
            </div>
          </div>

          {/* ── Price Trajectory Recharts Line ── */}
          <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5">
            <div className="flex items-center justify-between border-b border-line-subtle pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-text-primary">
                  Simulated Market Price Trajectory ({nSteps} Execution Steps)
                </h3>
              </div>
              <div className="text-xs font-mono text-text-muted">
                Initial: ₹{simulationData.price_trajectory[0]?.price.toFixed(2) || "0.00"} → Final: ₹
                {simulationData.price_trajectory[simulationData.price_trajectory.length - 1]?.price.toFixed(2) || "0.00"}
              </div>
            </div>

            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulationData.price_trajectory}>
                  <XAxis
                    dataKey="step"
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: "#374151" }}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: "#374151"} }
                    tickFormatter={(v) => `₹${v.toFixed(1)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      borderColor: "#374151",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontFamily: "monospace",
                    }}
                    formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, "Price"]}
                    labelFormatter={(label) => `Step ${label}`}
                  />
                  <ReferenceLine
                    y={simulationData.mid_price}
                    stroke="#4b5563"
                    strokeDasharray="3 3"
                    label={{ value: "Initial Mid", fill: "#9ca3af", fontSize: 10, position: "top" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#22d3ee" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

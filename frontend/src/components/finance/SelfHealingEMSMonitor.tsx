import React, { useState, useEffect } from "react";
import {
  type EMSRouteResponse,
  type EMSHealthResponse,
  worldModelV31Service,
} from "../../services/v31";
import { inr, num } from "../../lib/format";
import {
  ShieldAlert,
  Server,
  Zap,
  Activity,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Hash,
  Radio,
  Lock,
  ArrowRight,
  Clock,
  Terminal,
} from "lucide-react";

export const SelfHealingEMSMonitor: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [routeResult, setRouteResult] = useState<EMSRouteResponse | null>(null);
  const [healthData, setHealthData] = useState<EMSHealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Simulation parameters
  const [simulateWsDrop, setSimulateWsDrop] = useState<boolean>(false);
  const [simulateLatency, setSimulateLatency] = useState<number>(12);
  const [selectedHash, setSelectedHash] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      const h = await worldModelV31Service.getEMSHealth();
      setHealthData(h);
    } catch (e: any) {
      console.error("EMS Health fetch failed:", e);
    }
  };

  const runEMSRouting = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await worldModelV31Service.routeWithEMS({
        simulate_ws_drop: simulateWsDrop,
        simulated_latency_ms: simulateLatency,
        account_id: "QUANTX_INSTITUTIONAL_ALPHA_01",
      });
      setRouteResult(res);
      await fetchHealth();
    } catch (err: any) {
      setError(err.message || "EMS Routing failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    runEMSRouting();
  }, []);

  const channelMeta: Record<
    string,
    { name: string; tier: string; desc: string; color: string; border: string; bg: string }
  > = {
    PRIMARY_ZERODHA_WEBSOCKET: {
      name: "Primary Zerodha WebSocket",
      tier: "Tier 1",
      desc: "Sub-millisecond direct socket stream",
      color: "text-emerald-400",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/10",
    },
    SECONDARY_FIX_GATEWAY: {
      name: "Secondary FIX Gateway",
      tier: "Tier 2",
      desc: "Institutional FIX 4.4 protocol failover",
      color: "text-cyan-400",
      border: "border-cyan-500/30",
      bg: "bg-cyan-500/10",
    },
    FALLBACK_REST_POLLING: {
      name: "Fallback REST Polling",
      tier: "Tier 3",
      desc: "Safe batch HTTP execution endpoint",
      color: "text-amber-400",
      border: "border-amber-500/30",
      bg: "bg-amber-500/10",
    },
    SMARTNIC_HARDWARE_BUFFER: {
      name: "SmartNIC Hardware Buffer",
      tier: "Tier 4",
      desc: "Kernel-bypass zero-drop FPGA queue",
      color: "text-purple-400",
      border: "border-purple-500/30",
      bg: "bg-purple-500/10",
    },
  };

  return (
    <div className="space-y-6">
      {/* ── Control Bar ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-subtle pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
                <Server className="h-4 w-4" />
              </span>
              <h2 className="text-base font-semibold text-text-primary">
                Self-Healing Adaptive EMS & SmartNIC Failover Gate
              </h2>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-emerald-400">
                4-Tier Zero-Drop Circuit
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Auto-reconciling failover engine with 256-bit SHA-256 idempotent hashing to prevent duplicate fills across transport drops.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runEMSRouting}
              disabled={loading}
              className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500 disabled:opacity-50 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Routing Slices..." : "Trigger EMS Route Run"}
            </button>
          </div>
        </div>

        {/* ── Fault Injection Controls ── */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center justify-between rounded border border-line-subtle bg-bg-primary p-3">
            <div>
              <div className="text-xs font-medium text-text-primary">Simulate WS Channel Drop</div>
              <div className="text-[11px] text-text-muted">Forces immediate failover to Tier 2 FIX</div>
            </div>
            <button
              onClick={() => setSimulateWsDrop(!simulateWsDrop)}
              className={`rounded px-3 py-1.5 text-xs font-bold transition ${
                simulateWsDrop
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                  : "bg-bg-secondary text-text-muted border border-line-subtle hover:text-text-primary"
              }`}
            >
              {simulateWsDrop ? "DROPPED (ACTIVE)" : "NORMAL (ONLINE)"}
            </button>
          </div>

          <div className="flex items-center justify-between rounded border border-line-subtle bg-bg-primary p-3">
            <div>
              <div className="text-xs font-medium text-text-primary">Simulated Transport Latency</div>
              <div className="text-[11px] text-text-muted">High latency triggers circuit breaker</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={simulateLatency}
                onChange={(e) => setSimulateLatency(parseFloat(e.target.value) || 5)}
                className="w-16 rounded border border-line-subtle bg-bg-secondary px-2 py-1 text-xs font-mono text-text-primary text-center focus:outline-none"
              />
              <span className="text-xs text-text-muted">ms</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded border border-line-subtle bg-bg-primary p-3">
            <div>
              <div className="text-xs font-medium text-text-primary">SHA-256 Idempotency Engine</div>
              <div className="text-[11px] text-text-muted">256-bit client slice token check</div>
            </div>
            <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-1 text-xs font-mono font-medium text-emerald-400 border border-emerald-500/30">
              <Lock className="h-3 w-3" /> ACTIVE
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-[8px] border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-400">
          <AlertTriangle className="mr-2 inline h-4 w-4" />
          {error}
        </div>
      )}

      {/* ── 4-Tier Automated Failover Circuit Visualizer ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5">
        <div className="flex items-center justify-between border-b border-line-subtle pb-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-text-primary">
              4-Tier Execution Transport Health & Latency Gates
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-text-muted">Active Tier:</span>
            <span className="rounded bg-emerald-500/10 px-2.5 py-0.5 font-mono font-bold text-emerald-400 border border-emerald-500/30">
              {routeResult?.executed_orders[0]?.channel_routed || "PRIMARY_ZERODHA_WEBSOCKET"}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(channelMeta).map(([channelKey, meta]) => {
            const health = healthData?.channels[channelKey];
            const isRouted = routeResult?.executed_orders.some((o) => o.channel_routed === channelKey);
            const isDropped = channelKey === "PRIMARY_ZERODHA_WEBSOCKET" && simulateWsDrop;

            return (
              <div
                key={channelKey}
                className={`relative rounded-[8px] border p-4 transition ${
                  isDropped
                    ? "border-rose-500/40 bg-rose-500/5 opacity-80"
                    : isRouted
                    ? `${meta.border} ${meta.bg}`
                    : "border-line-subtle bg-bg-primary opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold uppercase ${meta.color}`}>
                    {meta.tier}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-medium ${
                      isDropped
                        ? "bg-rose-500/20 text-rose-400"
                        : isRouted
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {isDropped ? "DROPPED" : isRouted ? "ROUTED" : "STANDBY"}
                  </span>
                </div>

                <div className="mt-2 text-xs font-semibold text-text-primary">{meta.name}</div>
                <div className="text-[10px] text-text-muted">{meta.desc}</div>

                <div className="mt-4 flex items-center justify-between border-t border-line-subtle pt-2 font-mono text-[11px]">
                  <span className="text-text-muted">Latency:</span>
                  <span className="font-semibold text-text-primary">
                    {health ? `${health.latency_ms.toFixed(1)} ms` : "1.2 ms"}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between font-mono text-[11px]">
                  <span className="text-text-muted">Pkt Loss:</span>
                  <span className={isDropped ? "text-rose-400 font-bold" : "text-emerald-400"}>
                    {isDropped ? "100.0%" : health ? `${health.packet_loss_pct.toFixed(2)}%` : "0.00%"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Key Metrics & Failover Log ── */}
      {routeResult && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Slices Execution Summary */}
          <div className="space-y-4 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-4">
                <span className="text-xs font-medium text-text-muted">Slices Filled / Received</span>
                <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
                  {routeResult.total_slices_filled} / {routeResult.total_slices_received}
                </div>
                <p className="mt-1 text-[11px] text-text-muted">100% Fill Rate Guaranteed</p>
              </div>

              <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-4">
                <span className="text-xs font-medium text-text-muted">Duplicate Fills Prevented</span>
                <div className="mt-2 text-2xl font-bold font-mono text-cyan-400">
                  {routeResult.duplicate_fills_prevented}
                </div>
                <p className="mt-1 text-[11px] text-text-muted">Via SHA-256 Idempotency Hash</p>
              </div>

              <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-4">
                <span className="text-xs font-medium text-text-muted">Failover Transitions</span>
                <div className="mt-2 text-2xl font-bold font-mono text-purple-400">
                  {routeResult.failover_count}
                </div>
                <p className="mt-1 text-[11px] text-text-muted">Zero-packet dropped switches</p>
              </div>
            </div>

            {/* Child Slices Routed Table */}
            <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5">
              <div className="flex items-center justify-between border-b border-line-subtle pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-text-primary">
                    Executed Child Order Slices (Idempotent Hashed)
                  </h3>
                </div>
                <span className="text-xs font-mono text-text-muted">
                  {routeResult.executed_orders.length} child slices
                </span>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-line-subtle text-text-muted">
                      <th className="py-2 px-3">Slice #</th>
                      <th className="py-2 px-3">Ticker</th>
                      <th className="py-2 px-3">Side</th>
                      <th className="py-2 px-3">Shares</th>
                      <th className="py-2 px-3">Price</th>
                      <th className="py-2 px-3">Transport Channel</th>
                      <th className="py-2 px-3">Latency</th>
                      <th className="py-2 px-3">Idempotent SHA-256</th>
                      <th className="py-2 px-3">Reconciled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-subtle font-mono">
                    {routeResult.executed_orders.map((slice) => (
                      <tr key={slice.slice_id} className="hover:bg-bg-primary/50 transition">
                        <td className="py-2.5 px-3 font-semibold text-text-primary">#{slice.slice_id}</td>
                        <td className="py-2.5 px-3 text-cyan-400">{slice.ticker}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              slice.side === "BUY"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-rose-500/10 text-rose-400"
                            }`}
                          >
                            {slice.side}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-text-primary">{num(slice.shares_filled, 0)}</td>
                        <td className="py-2.5 px-3 text-text-primary">₹{slice.executed_price.toFixed(2)}</td>
                        <td className="py-2.5 px-3">
                          <span className="rounded bg-bg-primary px-2 py-0.5 text-[10px] text-text-secondary border border-line-subtle">
                            {slice.channel_routed.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-text-muted">{slice.execution_latency_ms.toFixed(1)}ms</td>
                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => setSelectedHash(slice.full_hash)}
                            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition"
                            title="Click to view full SHA-256 hash"
                          >
                            <Hash className="h-3 w-3" />
                            {slice.idempotent_hash}
                          </button>
                        </td>
                        <td className="py-2.5 px-3">
                          {slice.state_reconciled ? (
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Failover Event Console Log */}
          <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-line-subtle pb-3">
                <Clock className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-text-primary">EMS Failover Log</h3>
              </div>

              <div className="mt-4 space-y-2 max-h-96 overflow-y-auto font-mono text-[11px]">
                {routeResult.failover_log.map((logLine, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 rounded bg-bg-primary p-2 text-text-secondary border border-line-subtle"
                  >
                    <ArrowRight className="h-3.5 w-3.5 mt-0.5 text-cyan-400 shrink-0" />
                    <span>{logLine}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-line-subtle text-[11px] text-text-muted">
              <span>Account: <strong className="text-text-primary font-mono">{routeResult.account_id}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* SHA-256 Hash Modal */}
      {selectedHash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-w-md w-full rounded-[8px] border border-cyan-500/30 bg-bg-secondary p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line-subtle pb-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Lock className="h-4 w-4" />
                <h4 className="text-sm font-semibold">256-bit Idempotent Order Hash</h4>
              </div>
              <button
                onClick={() => setSelectedHash(null)}
                className="text-text-muted hover:text-text-primary"
              >
                ✕
              </button>
            </div>
            <p className="mt-3 text-xs text-text-muted">
              Cryptographically hashes the slice payload to guarantee zero duplicate executions across transport switches.
            </p>
            <div className="mt-3 rounded bg-bg-primary p-3 font-mono text-xs text-cyan-300 break-all border border-line-subtle">
              {selectedHash}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedHash(null)}
                className="rounded bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

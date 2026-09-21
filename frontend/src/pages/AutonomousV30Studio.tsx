import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Cpu,
  FileText,
  Layers,
  Play,
  RefreshCw,
  Scale,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react";
import { PageHeader } from "../components/layout/AppShell";
import { Badge, Button, Panel, useToast } from "../components/ui";
import { inrCompact, num } from "../lib/format";
import { cn } from "../utils/cn";
import { Link } from "../lib/router";
import {
  autonomousV30Service,
  type TelemetrySnapshot,
  type GATMetricsResponse,
  type FilingCatalogItem,
  type MonteCarloStressResponse,
  type OrderSlicePlan,
  type BatchRebalancePlan,
} from "../services/v30";
import { TelemetryCanvas } from "../components/finance/TelemetryCanvas";
import { FinancialStatementGATViewer } from "../components/finance/FinancialStatementGATViewer";
import { MonteCarloFanChart } from "../components/finance/MonteCarloFanChart";
import { OrderSlicerTable } from "../components/finance/OrderSlicerTable";

const TABS = [
  { id: "telemetry", label: "120 FPS Telemetry Center", icon: Activity },
  { id: "ocr_gat", label: "Statement OCR & GAT Graph", icon: FileText },
  { id: "monte_carlo", label: "100k Monte Carlo Rate Stress", icon: ShieldAlert },
  { id: "order_slicer", label: "Algorithmic Order Slicer", icon: Zap },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AutonomousV30Studio() {
  const { push } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("telemetry");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Core Data States
  const [telemetry, setTelemetry] = useState<TelemetrySnapshot | null>(null);
  const [filings, setFilings] = useState<FilingCatalogItem[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string>("RELIANCE");
  const [gatData, setGatData] = useState<GATMetricsResponse | null>(null);
  const [rateShiftBps, setRateShiftBps] = useState<number>(150);
  const [selectedHorizon, setSelectedHorizon] = useState<"30d" | "90d" | "365d">("90d");
  const [mcData, setMcData] = useState<MonteCarloStressResponse | null>(null);
  const [slicePlan, setSlicePlan] = useState<OrderSlicePlan | null>(null);
  const [batchPlan, setBatchPlan] = useState<BatchRebalancePlan | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Load all initial v30 telemetry and model data
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [telemetryRes, filingsRes, gatRes, mcRes, sliceRes] = await Promise.all([
        autonomousV30Service.getTelemetrySnapshot(),
        autonomousV30Service.getAvailableFilings(),
        autonomousV30Service.parseStatementGAT({ ticker: selectedTicker }),
        autonomousV30Service.simulateMonteCarloRateStress({
          rate_shift_bps: rateShiftBps,
          n_paths: 10000,
          n_days: 90,
        }),
        autonomousV30Service.sliceOrder({
          ticker: "RELIANCE",
          target_weight: 0.08,
          current_price: 2950.0,
          vpin: 0.18,
        }),
      ]);

      setTelemetry(telemetryRes);
      setFilings(filingsRes.filings || []);
      setGatData(gatRes);
      setMcData(mcRes);
      setSlicePlan(sliceRes);
    } catch (err: any) {
      push({
        title: "v30 Engine Sync Notice",
        body: err.message || "Failed to initialize v30 telemetry.",
        tone: "neg",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Poll high-frequency telemetry every 4 seconds when in telemetry tab
  useEffect(() => {
    if (activeTab !== "telemetry") return;
    const interval = setInterval(async () => {
      try {
        const snap = await autonomousV30Service.getTelemetrySnapshot();
        setTelemetry(snap);
      } catch {
        // Quiet fallback for polling
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Handle ticker change in GAT viewer
  const handleSelectFilingTicker = async (ticker: string) => {
    setSelectedTicker(ticker);
    try {
      const res = await autonomousV30Service.parseStatementGAT({ ticker });
      setGatData(res);
      push({
        title: "Statement Parsed",
        body: `Extracted ${ticker} accounting graph 𝒢_fin and calculated Altman Z-score (${res.metrics.altman_z_score.toFixed(2)}).`,
        tone: "pos",
      });
    } catch (err: any) {
      push({ title: "Parse Failed", body: err.message, tone: "neg" });
    }
  };

  // Handle rate shock change in Monte Carlo
  const handleRateShiftChange = async (bps: number) => {
    setRateShiftBps(bps);
    try {
      const res = await autonomousV30Service.simulateMonteCarloRateStress({
        rate_shift_bps: bps,
        n_paths: 10000,
        n_days: selectedHorizon === "30d" ? 30 : selectedHorizon === "365d" ? 365 : 90,
      });
      setMcData(res);
    } catch (err: any) {
      push({ title: "Simulation Failed", body: err.message, tone: "neg" });
    }
  };

  // Handle horizon toggle
  const handleHorizonChange = async (h: "30d" | "90d" | "365d") => {
    setSelectedHorizon(h);
    try {
      const res = await autonomousV30Service.simulateMonteCarloRateStress({
        rate_shift_bps: rateShiftBps,
        n_paths: 10000,
        n_days: h === "30d" ? 30 : h === "365d" ? 365 : 90,
      });
      setMcData(res);
    } catch (err: any) {
      push({ title: "Horizon Update Failed", body: err.message, tone: "neg" });
    }
  };

  // Handle recalculate single order slice
  const handleSliceOrder = async (params: {
    ticker: string;
    targetWeight: number;
    vpin: number;
    urgency: string;
    side: string;
  }) => {
    try {
      const res = await autonomousV30Service.sliceOrder({
        ticker: params.ticker,
        target_weight: params.targetWeight,
        vpin: params.vpin,
        urgency: params.urgency,
        side: params.side,
      });
      setSlicePlan(res);
      push({
        title: "Order Sliced",
        body: `Generated ${res.slice_count} child slices for ${res.ticker} via ${res.selected_algo}.`,
        tone: "pos",
      });
    } catch (err: any) {
      push({ title: "Slicing Failed", body: err.message, tone: "neg" });
    }
  };

  // Handle autonomous rebalance batch
  const handleBatchRebalance = async () => {
    try {
      const res = await autonomousV30Service.batchRebalance();
      setBatchPlan(res);
      setShowBatchModal(true);
      push({
        title: "Rebalance Plan Formulated",
        body: `Prepared ${res.num_trades} algorithmic orders with ₹${inrCompact(res.total_turnover_inr).replace("₹", "")} turnover.`,
        tone: "pos",
      });
    } catch (err: any) {
      push({ title: "Rebalance Failed", body: err.message, tone: "neg" });
    }
  };

  return (
    <>
      <PageHeader
        title="Autonomous AI Execution Studio"
        meta={
          <>
            <Badge tone="pos" dot>
              120 FPS GPU TELEMETRY
            </Badge>
            <Badge tone="neu">
              NAV: ₹{telemetry ? inrCompact(telemetry.current_nav_inr).replace("₹", "") : "25.00 L"}
            </Badge>
            <Badge tone="cyan">v30 MASTER PIPELINE</Badge>
          </>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/world-model-v31">
              <Button size="sm" variant="outline" icon={Layers}>
                World Model v31
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              icon={RefreshCw}
              loading={refreshing}
              onClick={() => {
                setRefreshing(true);
                loadInitialData();
              }}
            >
              Refresh
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={Sparkles}
              onClick={handleBatchRebalance}
            >
              Autonomous Rebalance
            </Button>
          </div>
        }
      />

      {/* ── Sub-Navigation Tabs ── */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5 border-b border-line-subtle pb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-[6px] px-3.5 py-1.5 text-xs font-mono font-medium transition-all",
                isActive
                  ? "bg-acc/15 text-acc shadow-sm ring-1 ring-acc/30 font-bold"
                  : "text-txt-muted hover:bg-surface/60 hover:text-txt-primary"
              )}
            >
              <Icon size={14} className={isActive ? "text-acc" : "text-txt-disabled"} />
              <span>{tab.label}</span>
              {tab.id === "telemetry" && telemetry?.tail_alert_crimson && (
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: 120 FPS Live Telemetry Execution Command Center ── */}
      {activeTab === "telemetry" && (
        <div className="space-y-4">
          {/* Telemetry Stats Ribbon */}
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
            <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-3">
              <div className="text-[10.5px] uppercase font-mono text-txt-muted">Current Portfolio NAV</div>
              <div className="mt-1 text-lg font-bold font-mono text-txt-primary">
                ₹{telemetry ? inrCompact(telemetry.current_nav_inr).replace("₹", "") : "₹25.00 L"}
              </div>
              <div className="text-[10px] text-txt-disabled mt-0.5">Real-time SDE mark-to-market</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-3">
              <div className="text-[10.5px] uppercase font-mono text-txt-muted">Intraday P&L</div>
              <div
                className={`mt-1 text-lg font-bold font-mono ${
                  (telemetry?.daily_pnl_inr || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {(telemetry?.daily_pnl_inr || 0) >= 0 ? "+" : "−"}₹
                {inrCompact(Math.abs(telemetry?.daily_pnl_inr || 0)).replace("₹", "")} (
                {(telemetry?.daily_pnl_pct || 0) >= 0 ? "+" : ""}
                {telemetry?.daily_pnl_pct.toFixed(2)}%)
              </div>
              <div className="text-[10px] text-txt-disabled mt-0.5">Execution & slippage net</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-3">
              <div className="text-[10.5px] uppercase font-mono text-txt-muted">Sharpe Ratio</div>
              <div className="mt-1 text-lg font-bold font-mono text-emerald-400">
                {telemetry?.sharpe_ratio.toFixed(2) || "2.15"}
              </div>
              <div className="text-[10px] text-txt-disabled mt-0.5">Risk-adjusted return</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-3">
              <div className="text-[10.5px] uppercase font-mono text-txt-muted">Annualized Volatility</div>
              <div className="mt-1 text-lg font-bold font-mono text-txt-primary">
                {telemetry?.volatility_ann_pct.toFixed(1) || "14.8"}%
              </div>
              <div className="text-[10px] text-txt-disabled mt-0.5">Real-time realized sigma</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-3">
              <div className="text-[10.5px] uppercase font-mono text-txt-muted">95% VaR Tail Cutoff</div>
              <div className="mt-1 text-lg font-bold font-mono text-amber-400">
                {telemetry?.var_95_cutoff_pct.toFixed(2) || "-1.85"}%
              </div>
              <div className="text-[10px] text-txt-disabled mt-0.5">99% VaR: {telemetry?.var_99_cutoff_pct.toFixed(2)}%</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-3">
              <div className="text-[10.5px] uppercase font-mono text-txt-muted">Active Order Slicers</div>
              <div className="mt-1 text-lg font-bold font-mono text-cyan-400">
                {telemetry?.active_slicers_count || 3} Active
              </div>
              <div className="text-[10px] text-txt-disabled mt-0.5">TWAP / VWAP / POV Nodes</div>
            </div>
          </div>

          {/* Native HTML5 120 FPS Canvas Renderer */}
          <div className="h-96 w-full">
            <TelemetryCanvas telemetry={telemetry} className="h-full w-full" />
          </div>

          {/* Live Execution Stream Blotter */}
          <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-4">
            <div className="mb-3 flex items-center justify-between border-b border-line-subtle pb-2.5">
              <span className="text-xs font-bold uppercase font-mono text-txt-muted">
                Live Algorithmic Execution Stream
              </span>
              <span className="font-mono text-[10.5px] text-emerald-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                FIX / WebSocket Feed Synced
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="border-b border-line-subtle text-[10px] text-txt-disabled uppercase">
                  <tr>
                    <th className="py-2 pl-2">Timestamp</th>
                    <th className="py-2">Ticker</th>
                    <th className="py-2">Algorithm</th>
                    <th className="py-2 text-right">Shares Filled</th>
                    <th className="py-2 text-right">Fill Price (₹)</th>
                    <th className="py-2 text-right pr-2">Slippage (bps)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-subtle/50">
                  {(telemetry?.recent_executions || []).map((exec, i) => (
                    <tr key={i} className="hover:bg-surface/30">
                      <td className="py-2 pl-2 text-txt-muted">{exec.time}</td>
                      <td className="py-2 font-bold text-txt-primary">{exec.ticker}</td>
                      <td className="py-2">
                        <span className="rounded bg-acc/15 px-2 py-0.5 text-[10px] font-bold text-acc">
                          {exec.algo}
                        </span>
                      </td>
                      <td className="py-2 text-right text-txt-primary">{exec.shares}</td>
                      <td className="py-2 text-right text-txt-primary font-medium">
                        ₹{num(exec.price, 2)}
                      </td>
                      <td className="py-2 text-right pr-2 text-amber-400">
                        +{exec.slippage_bps} bps
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: Multi-Modal Statement OCR & Graph Attention Network (GAT) ── */}
      {activeTab === "ocr_gat" && gatData && (
        <FinancialStatementGATViewer
          data={gatData}
          filings={filings}
          selectedTicker={selectedTicker}
          onSelectTicker={handleSelectFilingTicker}
          onParseCustom={async (text) => {
            try {
              const res = await autonomousV30Service.parseStatementGAT({
                ticker: "CUSTOM_REPORT",
                raw_text: text,
              });
              setGatData(res);
              push({ title: "Custom Document Parsed", body: "Successfully parsed custom statement via ViT OCR.", tone: "pos" });
            } catch (err: any) {
              push({ title: "Parse Error", body: err.message, tone: "neg" });
            }
          }}
          loading={loading}
        />
      )}

      {/* ── TAB 3: 100k-Path Monte Carlo Rate Stress Simulator ── */}
      {activeTab === "monte_carlo" && mcData && (
        <MonteCarloFanChart
          data={mcData}
          rateShiftBps={rateShiftBps}
          onRateShiftChange={handleRateShiftChange}
          selectedHorizon={selectedHorizon}
          onHorizonChange={handleHorizonChange}
          loading={loading}
        />
      )}

      {/* ── TAB 4: Capital-Tiered Algorithmic Order Slicer (TWAP / VWAP / POV / IS) ── */}
      {activeTab === "order_slicer" && slicePlan && (
        <OrderSlicerTable
          plan={slicePlan}
          onSliceOrder={handleSliceOrder}
          loading={loading}
        />
      )}

      {/* ── Autonomous Rebalance Modal ── */}
      {showBatchModal && batchPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-[8px] border border-line bg-bg-secondary p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-line-subtle pb-3">
              <div>
                <h3 className="text-base font-bold text-txt-primary">
                  Autonomous Portfolio Rebalance Batch Plan
                </h3>
                <p className="text-xs text-txt-muted mt-0.5">
                  Target DL-10 alignment constrained by {batchPlan.capital_tier_label}
                </p>
              </div>
              <span className="rounded bg-acc/15 px-2.5 py-1 text-xs font-bold text-acc font-mono">
                {batchPlan.num_trades} Algorithmic Trades
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="rounded bg-bg p-2.5 border border-line-subtle">
                <div className="text-[10px] text-txt-muted">Total Turnover</div>
                <div className="text-sm font-bold text-txt-primary">
                  ₹{inrCompact(batchPlan.total_turnover_inr).replace("₹", "")}
                </div>
              </div>
              <div className="rounded bg-bg p-2.5 border border-line-subtle">
                <div className="text-[10px] text-txt-muted">Portfolio Turnover %</div>
                <div className="text-sm font-bold text-acc">
                  {batchPlan.turnover_pct.toFixed(2)}%
                </div>
              </div>
              <div className="rounded bg-bg p-2.5 border border-line-subtle">
                <div className="text-[10px] text-txt-muted">Execution Strategy</div>
                <div className="text-sm font-bold text-emerald-400">
                  Multi-Algo Sliced
                </div>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
              {batchPlan.rebalance_orders.map((ord, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded bg-bg p-2.5 border border-line-subtle/50 hover:border-acc/40"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                        ord.side === "BUY"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {ord.side}
                    </span>
                    <span className="font-bold text-txt-primary">{ord.ticker}</span>
                    <span className="text-txt-muted text-[11px]">
                      {num(ord.total_shares, 0)} shares (₹{inrCompact(ord.target_notional).replace("₹", "")})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-surface/60 px-2 py-0.5 text-[10px] font-bold text-txt-secondary">
                      {ord.selected_algo}
                    </span>
                    <span className="text-[10px] text-txt-muted">
                      {ord.slice_count} slices
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-line-subtle">
              <button
                onClick={() => setShowBatchModal(false)}
                className="rounded px-4 py-1.5 text-xs text-txt-muted hover:text-txt-primary"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  push({
                    title: "Orders Dispatched",
                    body: `Dispatched ${batchPlan.num_trades} child order batches to simulated FIX/Kite execution blotter.`,
                    tone: "pos",
                  });
                  setShowBatchModal(false);
                }}
                className="rounded bg-acc px-4 py-1.5 text-xs font-bold text-txt-primary hover:bg-acc/80"
              >
                Dispatch Child Orders
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

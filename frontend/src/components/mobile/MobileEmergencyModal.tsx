import { useState, useEffect } from "react";
import {
  Smartphone, Watch, ShieldAlert, Zap, AlertTriangle, CheckCircle2,
  RefreshCw, X, Radio, Fingerprint, Activity
} from "lucide-react";
import { Badge, Button, useToast } from "../ui";
import { v10Service, type HedgeResult, type LiquidationResult } from "../../services/v10";
import { cn } from "../../utils/cn";

interface MobileEmergencyModalProps {
  open: boolean;
  onClose: () => void;
}

export function MobileEmergencyModal({ open, onClose }: MobileEmergencyModalProps) {
  const { push } = useToast();
  const [deviceMode, setDeviceMode] = useState<"phone" | "watch">("phone");
  const [activeTab, setActiveTab] = useState<"telemetry" | "hedge" | "killswitch">("telemetry");
  const [biometricAuthenticated, setBiometricAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [confirmPin, setConfirmPin] = useState("");
  const [isExecutingHedge, setIsExecutingHedge] = useState(false);
  const [isExecutingKill, setIsExecutingKill] = useState(false);
  const [hedgeResult, setHedgeResult] = useState<HedgeResult | null>(null);
  const [killResult, setKillResult] = useState<LiquidationResult | null>(null);

  // Live telemetry state
  const [livePnl, setLivePnl] = useState({
    nav: 104280000, // ₹10.428 Cr
    pnlToday: 153400,
    pnlPct: 1.49,
    var95: 1842000,
    varPct: 1.77,
    netDelta: 14.2,
    exposurePct: 78.4,
    latencyMs: 1.4,
  });

  // Telemetry fluctuation simulator
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setLivePnl((prev) => {
        const deltaJitter = (Math.random() - 0.5) * 0.4;
        const pnlJitter = (Math.random() - 0.48) * 800;
        return {
          ...prev,
          pnlToday: prev.pnlToday + pnlJitter,
          pnlPct: Number(((prev.pnlToday + pnlJitter) / prev.nav * 100).toFixed(2)),
          netDelta: Number((prev.netDelta + deltaJitter).toFixed(2)),
          latencyMs: Number((1.2 + Math.random() * 0.5).toFixed(1)),
        };
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [open]);

  if (!open) return null;

  const handleBiometricAuth = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      setBiometricAuthenticated(true);
      push({
        title: "Biometric Verified",
        body: "Hardware secure enclave confirmed: Portfolio Manager Desk 04",
        tone: "pos",
      });
    }, 800);
  };

  const handleExecuteHedge = async () => {
    if (!biometricAuthenticated) {
      push({
        title: "Authentication Required",
        body: "Authenticate with Biometrics or Secure PIN before dispatching hedge",
        tone: "warn",
      });
      return;
    }
    setIsExecutingHedge(true);
    try {
      const res = await v10Service.triggerDeltaHedge(0.0);
      setHedgeResult(res);
      setLivePnl((prev) => ({ ...prev, netDelta: res.resulting_beta }));
      push({
        title: "Delta-Neutral Hedge Complete",
        body: `Dispatched ${res.hedge_order.contracts} contracts of ${res.hedge_order.instrument} (₹${(res.hedge_order.notional_hedged / 100000).toFixed(1)}L). Delta flattened to ${res.resulting_beta}.`,
        tone: "pos",
      });
    } catch (err) {
      push({
        title: "Hedge Execution Failed",
        body: String(err),
        tone: "neg",
      });
    } finally {
      setIsExecutingHedge(false);
    }
  };

  const handleExecuteKillSwitch = async () => {
    if (confirmPin !== "KILL" && confirmPin !== "1234") {
      push({
        title: "Invalid Authorization Token",
        body: "Type 'KILL' or enter your emergency PIN '1234' to confirm liquidation.",
        tone: "warn",
      });
      return;
    }
    setIsExecutingKill(true);
    try {
      const res = await v10Service.triggerKillSwitch("Emergency Mobile Terminal 1-Tap Trigger");
      setKillResult(res);
      setLivePnl((prev) => ({ ...prev, netDelta: 0, exposurePct: 0 }));
      push({
        title: "KILL-SWITCH ACTIVATED",
        body: `Liquidated ${res.orders_sent} positions (₹${(res.total_notional_liquidated / 10000000).toFixed(2)} Cr). Dispatched IOC sweep orders.`,
        tone: "neg",
      });
    } catch (err) {
      push({
        title: "Kill-Switch Execution Error",
        body: String(err),
        tone: "neg",
      });
    } finally {
      setIsExecutingKill(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 anim-fade-in">
      {/* Container Dialog */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-line-subtle bg-bg-secondary shadow-2xl">
        {/* Modal Window Header */}
        <div className="flex items-center justify-between border-b border-line-subtle px-5 py-3.5 bg-bg-primary">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-acc/30 bg-acc/10 text-acc">
              {deviceMode === "phone" ? <Smartphone size={17} /> : <Watch size={17} />}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold tracking-tight text-txt-primary">
                  QUANTX Mobile & Wearable Terminal
                </span>
                <Badge tone="warn" className="text-[10px]">v10.0 Native</Badge>
              </div>
              <p className="text-[11px] text-txt-muted">
                Section 5: Biometric Kill-Switch & 1-Tap Delta Neutral Hedge
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Form-Factor Switcher */}
            <div className="flex items-center rounded-lg border border-line-subtle bg-surface p-0.5">
              <button
                onClick={() => setDeviceMode("phone")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                  deviceMode === "phone" ? "bg-bg-primary text-txt-primary shadow-sm" : "text-txt-muted hover:text-txt-secondary"
                )}
              >
                <Smartphone size={13} /> iPhone / Android
              </button>
              <button
                onClick={() => setDeviceMode("watch")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                  deviceMode === "watch" ? "bg-bg-primary text-txt-primary shadow-sm" : "text-txt-muted hover:text-txt-secondary"
                )}
              >
                <Watch size={13} /> Apple Watch / WearOS
              </button>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-txt-muted hover:bg-surface-hover hover:text-txt-primary"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Modal Body: Device Simulation Stage */}
        <div className="flex flex-col items-center justify-center p-6 bg-radial-vignette">
          {deviceMode === "phone" ? (
            /* 📱 SMARTPHONE SIMULATOR FRAME */
            <div className="relative w-[360px] rounded-[40px] border-[6px] border-surface-high/80 bg-bg-primary p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
              {/* Dynamic Island / Speaker Notch */}
              <div className="mx-auto mb-3 flex h-5 w-24 items-center justify-center rounded-full bg-black">
                <span className="h-2.5 w-2.5 rounded-full bg-surface-high/60 mr-1" />
                <span className="h-2 w-2 rounded-full bg-acc/80 anim-pulse-dot" />
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between px-2 text-[10px] text-txt-muted pb-3 border-b border-line-subtle">
                <span className="font-semibold text-txt-primary">09:41</span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[9px] text-acc">
                    <Radio size={10} className="anim-pulse-dot" /> {livePnl.latencyMs}ms
                  </span>
                  <span className="font-mono text-[9px]">5G Ultra</span>
                  <span className="h-2 w-4 rounded-sm border border-txt-muted/60 p-0.5">
                    <span className="block h-full w-3/4 rounded-2xs bg-txt-primary" />
                  </span>
                </div>
              </div>

              {/* Terminal Title & Authenticated Operator */}
              <div className="mt-3 flex items-center justify-between px-1">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-txt-disabled font-semibold">
                    Desk 04 · Vol Arbitrage
                  </span>
                  <span className="text-[13px] font-bold text-txt-primary flex items-center gap-1.5">
                    QUANTX Emergency Core
                  </span>
                </div>
                <button
                  onClick={handleBiometricAuth}
                  disabled={biometricAuthenticated || isAuthenticating}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all",
                    biometricAuthenticated
                      ? "bg-acc/10 text-acc border border-acc/30"
                      : "bg-surface-high text-txt-secondary hover:bg-surface-hover border border-line"
                  )}
                >
                  <Fingerprint size={12} className={cn(isAuthenticating && "animate-spin")} />
                  {biometricAuthenticated ? "Enclave OK" : isAuthenticating ? "Scanning..." : "Biometric"}
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-surface p-1 border border-line-subtle">
                <button
                  onClick={() => setActiveTab("telemetry")}
                  className={cn(
                    "rounded-lg py-1.5 text-[11px] font-medium transition-all",
                    activeTab === "telemetry" ? "bg-bg-primary text-txt-primary shadow-xs" : "text-txt-muted hover:text-txt-secondary"
                  )}
                >
                  Status
                </button>
                <button
                  onClick={() => setActiveTab("hedge")}
                  className={cn(
                    "rounded-lg py-1.5 text-[11px] font-medium transition-all",
                    activeTab === "hedge" ? "bg-bg-primary text-acc shadow-xs font-semibold" : "text-txt-muted hover:text-txt-secondary"
                  )}
                >
                  1-Tap Hedge
                </button>
                <button
                  onClick={() => setActiveTab("killswitch")}
                  className={cn(
                    "rounded-lg py-1.5 text-[11px] font-medium transition-all",
                    activeTab === "killswitch" ? "bg-bg-primary text-neg shadow-xs font-semibold" : "text-txt-muted hover:text-txt-secondary"
                  )}
                >
                  Kill-Switch
                </button>
              </div>

              {/* Tab 1: Live Telemetry */}
              {activeTab === "telemetry" && (
                <div className="mt-3 space-y-2.5">
                  <div className="rounded-xl border border-line-subtle bg-surface/50 p-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10.5px] text-txt-muted">Portfolio Net NAV</span>
                      <span className="text-[10.5px] font-mono text-txt-secondary">INR</span>
                    </div>
                    <div className="mt-0.5 text-[20px] font-bold font-mono tracking-tight text-txt-primary">
                      ₹{(livePnl.nav / 10000000).toFixed(3)} Cr
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span className="text-txt-muted">Intraday PnL</span>
                      <span className={cn("font-mono font-medium", livePnl.pnlPct >= 0 ? "text-pos" : "text-neg")}>
                        {livePnl.pnlPct >= 0 ? "+" : ""}₹{Math.round(livePnl.pnlToday).toLocaleString("en-IN")} ({livePnl.pnlPct >= 0 ? "+" : ""}{livePnl.pnlPct}%)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-line-subtle bg-surface/30 p-2.5">
                      <span className="block text-[9.5px] uppercase tracking-wider text-txt-disabled">95% 1-Day VaR</span>
                      <span className="mt-1 block font-mono text-[13px] font-bold text-warn">
                        ₹{(livePnl.var95 / 100000).toFixed(1)} L
                      </span>
                      <span className="text-[10px] text-txt-muted">{livePnl.varPct}% of NAV</span>
                    </div>

                    <div className="rounded-xl border border-line-subtle bg-surface/30 p-2.5">
                      <span className="block text-[9.5px] uppercase tracking-wider text-txt-disabled">Net Delta Drift</span>
                      <span className={cn("mt-1 block font-mono text-[13px] font-bold", Math.abs(livePnl.netDelta) > 10 ? "text-warn" : "text-txt-primary")}>
                        {livePnl.netDelta > 0 ? "+" : ""}{livePnl.netDelta} NIFTY
                      </span>
                      <span className="text-[10px] text-txt-muted">Target: 0.00</span>
                    </div>
                  </div>

                  {/* Limits bar */}
                  <div className="rounded-xl border border-line-subtle bg-surface/30 p-2.5">
                    <div className="flex justify-between text-[10.5px]">
                      <span className="text-txt-muted">Gross Exposure Capacity</span>
                      <span className="font-mono text-txt-primary">{livePnl.exposurePct}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-surface-high overflow-hidden">
                      <div
                        className="h-full rounded-full bg-acc transition-all duration-300"
                        style={{ width: `${livePnl.exposurePct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-acc/5 p-2 border border-acc/20 text-[10px] text-txt-muted">
                    <Activity size={13} className="text-acc shrink-0" />
                    <span>Cross-venue connectivity active. 5 liquidity bridges connected.</span>
                  </div>
                </div>
              )}

              {/* Tab 2: 1-Tap Delta-Neutral Hedge */}
              {activeTab === "hedge" && (
                <div className="mt-3 space-y-3">
                  <div className="rounded-xl border border-acc/20 bg-acc/5 p-3">
                    <span className="block text-[10px] uppercase font-semibold text-acc tracking-wider">
                      Auto-Hedge Calculation
                    </span>
                    <p className="mt-1 text-[11px] text-txt-secondary leading-relaxed">
                      Computes offsetting futures contracts for open equity/option delta drift and fires atomic IOC order.
                    </p>
                    <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="block text-[9.5px] text-txt-muted">Current Net Delta</span>
                        <span className="font-mono font-bold text-txt-primary">+{livePnl.netDelta}</span>
                      </div>
                      <div>
                        <span className="block text-[9.5px] text-txt-muted">Hedge Instrument</span>
                        <span className="font-mono font-medium text-txt-primary">NIFTY-FUT-CURRENT</span>
                      </div>
                    </div>
                  </div>

                  {hedgeResult && (
                    <div className="rounded-xl border border-pos/30 bg-pos/10 p-2.5 text-[11px] text-txt-primary space-y-1">
                      <div className="flex items-center gap-1.5 text-pos font-semibold">
                        <CheckCircle2 size={13} /> Delta Flattened to {hedgeResult.resulting_beta}
                      </div>
                      <div className="text-[10px] text-txt-secondary">
                        Dispatched {hedgeResult.hedge_order.side} {hedgeResult.hedge_order.contracts} lots ({hedgeResult.hedge_order.underlying_units} units) of {hedgeResult.hedge_order.instrument}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleExecuteHedge}
                    disabled={isExecutingHedge}
                    className="w-full relative overflow-hidden rounded-xl border border-acc/40 bg-acc/15 py-3 text-center text-[12.5px] font-bold text-acc transition-all hover:bg-acc/25 active:scale-[0.98] disabled:opacity-60"
                  >
                    {isExecutingHedge ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw size={14} className="animate-spin" /> Flattening Delta...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Zap size={14} /> [ 1-TAP DELTA-NEUTRAL HEDGE ]
                      </span>
                    )}
                  </button>
                  <p className="text-center text-[9.5px] text-txt-disabled">
                    Max slippage capped at 8.0 bps. Dispatched over direct exchange colocation.
                  </p>
                </div>
              )}

              {/* Tab 3: Kill-Switch Liquidation */}
              {activeTab === "killswitch" && (
                <div className="mt-3 space-y-3">
                  <div className="rounded-xl border border-neg/30 bg-neg/10 p-3">
                    <div className="flex items-center gap-1.5 text-neg font-bold text-[12px]">
                      <AlertTriangle size={14} /> CRITICAL PROTOCOL
                    </div>
                    <p className="mt-1 text-[11px] text-txt-secondary leading-relaxed">
                      Submits IOC Market Liquidation orders to cancel all active bids/asks and liquidate desk holdings into cash reserves.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10.5px] text-txt-muted">
                      Type <span className="font-mono font-bold text-neg">KILL</span> or PIN <span className="font-mono text-txt-primary">1234</span> to unlock:
                    </label>
                    <input
                      type="password"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="Enter Confirmation Code"
                      className="w-full rounded-lg border border-line-subtle bg-surface px-3 py-2 text-[12px] font-mono text-txt-primary placeholder:text-txt-disabled focus:border-neg focus:outline-none"
                    />
                  </div>

                  {killResult && (
                    <div className="rounded-xl border border-neg/30 bg-neg/10 p-2.5 text-[11px] text-txt-primary space-y-1">
                      <div className="flex items-center gap-1.5 text-neg font-semibold">
                        <ShieldAlert size={13} /> Execution Completed
                      </div>
                      <div className="text-[10px] text-txt-secondary">
                        Liquidated {killResult.orders_sent} positions (₹{(killResult.total_notional_liquidated / 10000000).toFixed(2)} Cr). Dispatched IOC sweep orders. Audit: {killResult.audit_hash}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleExecuteKillSwitch}
                    disabled={isExecutingKill}
                    className="w-full rounded-xl border border-neg/60 bg-neg py-3 text-center text-[12px] font-bold text-white shadow-lg transition-all hover:bg-neg/90 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isExecutingKill ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw size={14} className="animate-spin" /> Sweeping Orderbooks...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <ShieldAlert size={14} /> LIQUIDATE POSITIONS TO CASH
                      </span>
                    )}
                  </button>
                  <p className="text-center text-[9.5px] text-txt-disabled">
                    Requires dual-party audit trail log. All state logged to compliance vault.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* ⌚ WEARABLE / SMARTWATCH SIMULATOR */
            <div className="relative flex flex-col items-center">
              {/* Watch Strap Top */}
              <div className="h-10 w-28 rounded-t-xl bg-surface-high border-t border-x border-line-subtle" />

              {/* Watch Body */}
              <div className="relative flex h-[290px] w-[260px] flex-col items-center justify-between rounded-[48px] border-[6px] border-surface-high/80 bg-black p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
                {/* Crown dial */}
                <div className="absolute -right-3 top-20 h-8 w-2 rounded-r-md bg-surface-high" />

                {/* Watch Header */}
                <div className="w-full flex items-center justify-between px-2 pt-1 text-[10px] text-txt-muted">
                  <span className="font-bold text-txt-primary">09:41</span>
                  <span className="flex items-center gap-1 text-[9px] text-acc">
                    <Radio size={9} className="anim-pulse-dot" /> 1.4ms
                  </span>
                </div>

                {/* Center Content */}
                <div className="text-center w-full my-auto space-y-1">
                  <span className="text-[9px] uppercase tracking-wider text-txt-disabled block">
                    Desk 04 · Live NAV
                  </span>
                  <span className="text-[17px] font-bold font-mono text-txt-primary block">
                    ₹{(livePnl.nav / 10000000).toFixed(2)} Cr
                  </span>
                  <span className={cn("text-[11px] font-mono font-medium block", livePnl.pnlPct >= 0 ? "text-pos" : "text-neg")}>
                    {livePnl.pnlPct >= 0 ? "+" : ""}{livePnl.pnlPct}% PnL
                  </span>

                  {/* Quick Delta Badge */}
                  <div className="inline-flex items-center gap-1 rounded-full bg-surface-high px-2 py-0.5 text-[9px] text-txt-secondary">
                    <span>Delta:</span>
                    <span className="font-mono text-txt-primary">{livePnl.netDelta > 0 ? "+" : ""}{livePnl.netDelta}</span>
                  </div>
                </div>

                {/* Watch Actions */}
                <div className="w-full space-y-1.5 pb-1">
                  <button
                    onClick={handleExecuteHedge}
                    disabled={isExecutingHedge}
                    className="w-full rounded-full border border-acc/40 bg-acc/20 py-2 text-[10px] font-bold text-acc transition-transform active:scale-95 flex items-center justify-center gap-1"
                  >
                    <Zap size={11} /> 1-Tap Neutral Hedge
                  </button>
                  <button
                    onClick={() => {
                      setConfirmPin("1234");
                      handleExecuteKillSwitch();
                    }}
                    disabled={isExecutingKill}
                    className="w-full rounded-full border border-neg/60 bg-neg py-2 text-[10px] font-bold text-white transition-transform active:scale-95 flex items-center justify-center gap-1 shadow-md"
                  >
                    <ShieldAlert size={11} /> Kill-Switch Sweep
                  </button>
                </div>
              </div>

              {/* Watch Strap Bottom */}
              <div className="h-10 w-28 rounded-b-xl bg-surface-high border-b border-x border-line-subtle" />
            </div>
          )}
        </div>

        {/* Modal Window Footer */}
        <div className="flex items-center justify-between border-t border-line-subtle px-5 py-3 bg-bg-primary text-[11px] text-txt-muted">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-pos" />
            <span>Encrypted Session: TLS 1.3 · Mutual Auth</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Terminal
          </Button>
        </div>
      </div>
    </div>
  );
}

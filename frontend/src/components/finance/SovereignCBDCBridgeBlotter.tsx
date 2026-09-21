import React, { useState, useEffect } from "react";
import {
  v34Service,
  type CBDCSwapRecord,
  type CBDCSwapResponse,
} from "../../services/v34";
import { num } from "../../lib/format";
import {
  ArrowRightLeft,
  ShieldCheck,
  Lock,
  Clock,
  CheckCircle2,
  RefreshCw,
  Send,
  Building2,
  DollarSign,
  Coins,
  Scale,
} from "lucide-react";

export const SovereignCBDCBridgeBlotter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [ledger, setLedger] = useState<CBDCSwapRecord[]>([]);
  const [fromCurrency, setFromCurrency] = useState<string>("e-INR");
  const [toCurrency, setToCurrency] = useState<string>("e-USD");
  const [amountFrom, setAmountFrom] = useState<number>(835000.0);
  const [latestSwap, setLatestSwap] = useState<CBDCSwapResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLedger = async () => {
    try {
      const data = await v34Service.getCBDCSettlementLedger();
      setLedger(data);
    } catch (err: any) {
      console.error("Failed to fetch CBDC ledger:", err);
    }
  };

  const handleSwap = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await v34Service.initiateAtomicCBDCSwap(
        fromCurrency,
        toCurrency,
        amountFrom,
        "ACC-INST-TREASURY"
      );
      setLatestSwap(res);
      setLedger((prev) => [res.swap_record, ...prev]);
    } catch (err: any) {
      setError(err.message || "CBDC swap failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const getEstimatedRate = () => {
    if (fromCurrency === "e-INR" && toCurrency === "e-USD") return 1 / 83.5;
    if (fromCurrency === "e-INR" && toCurrency === "e-EUR") return 1 / 91.2;
    if (fromCurrency === "e-USD" && toCurrency === "e-INR") return 83.5;
    if (fromCurrency === "e-EUR" && toCurrency === "e-INR") return 91.2;
    if (fromCurrency === "e-EUR" && toCurrency === "e-USD") return 91.2 / 83.5;
    if (fromCurrency === "e-USD" && toCurrency === "e-EUR") return 83.5 / 91.2;
    return 1.0;
  };

  const estTargetAmount = (amountFrom * getEstimatedRate()).toFixed(2);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-subtle pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-400">
                <Coins className="h-4 w-4" />
              </span>
              <h2 className="text-base font-semibold text-text-primary">
                Sovereign CBDC Cross-Chain Liquidity & DvP Bridge
              </h2>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-amber-400">
                RBI e-Rupee · Fed e-USD · ECB e-EUR
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Atomic cross-fiat Delivery-versus-Payment (DvP) settlement protocol eliminating correspondent banking friction using Hashed Timelock Contracts (HTLC) and zero-knowledge zk-IBC state transition verification in &lt; 12 ms.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2.5 py-1 text-xs font-mono text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              Zero Counterparty Risk (HTLC)
            </span>
          </div>
        </div>

        {/* Swap Launcher Bar */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
              Source Currency (Pay)
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-3 py-1.5 text-xs font-mono text-text-primary focus:border-amber-500 focus:outline-none"
            >
              <option value="e-INR">RBI e-Rupee (e-INR)</option>
              <option value="e-USD">Federal Reserve Digital Dollar (e-USD)</option>
              <option value="e-EUR">ECB Digital Euro (e-EUR)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
              Target Currency (Receive)
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-3 py-1.5 text-xs font-mono text-text-primary focus:border-amber-500 focus:outline-none"
            >
              <option value="e-USD">Federal Reserve Digital Dollar (e-USD)</option>
              <option value="e-INR">RBI e-Rupee (e-INR)</option>
              <option value="e-EUR">ECB Digital Euro (e-EUR)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
              Amount ({fromCurrency})
            </label>
            <input
              type="number"
              step="1000"
              value={amountFrom}
              onChange={(e) => setAmountFrom(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-3 py-1.5 text-xs font-mono text-text-primary focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <button
              onClick={handleSwap}
              disabled={loading || fromCurrency === toCurrency}
              className="w-full flex items-center justify-center gap-1.5 rounded bg-amber-600 hover:bg-amber-500 px-3 py-1.5 text-xs font-medium text-white transition disabled:opacity-50"
            >
              <Send className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Settle Atomic Swap (≈ {estTargetAmount} {toCurrency})
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Latest Swap Confirmation Banner */}
        {latestSwap && (
          <div className="mt-4 rounded border border-emerald-500/40 bg-emerald-500/10 p-4 transition">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono text-emerald-300">
                      {latestSwap.status} ({latestSwap.swap_record.swap_id})
                    </span>
                    <span className="rounded bg-bg-primary/80 px-2 py-0.5 text-xs font-mono text-text-primary border border-line-subtle">
                      {latestSwap.swap_record.amount_from} {latestSwap.swap_record.from_currency} → {latestSwap.swap_record.amount_to} {latestSwap.swap_record.to_currency}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    HTLC Hashlock: {latestSwap.swap_record.hashlock} | zk-IBC Proof: {latestSwap.swap_record.zk_ibc_proof} | Latency: {latestSwap.swap_record.settlement_latency_ms} ms
                  </p>
                </div>
              </div>

              <div className="text-xs font-mono text-emerald-300 font-semibold">
                {latestSwap.counterparty_risk}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Cross-Chain Sovereign CBDC Settlement Ledger ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-line-subtle pb-3">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-text-primary">
              Immutable Cross-Chain Sovereign CBDC Settlement Ledger
            </h3>
          </div>
          <span className="text-xs font-mono text-text-muted">
            {ledger.length} Atomic Swaps Logged
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-line-subtle bg-bg-primary text-text-muted">
                <th className="p-2.5">Swap ID</th>
                <th className="p-2.5">Route</th>
                <th className="p-2.5">Paid</th>
                <th className="p-2.5">Received</th>
                <th className="p-2.5">FX Rate</th>
                <th className="p-2.5">Hashlock</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Latency</th>
                <th className="p-2.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-subtle">
              {ledger.map((s) => (
                <tr key={s.swap_id} className="hover:bg-bg-tertiary/40 transition">
                  <td className="p-2.5 font-bold text-amber-400">{s.swap_id}</td>
                  <td className="p-2.5 font-semibold text-text-primary">
                    {s.from_currency} → {s.to_currency}
                  </td>
                  <td className="p-2.5 text-text-muted">
                    {num(s.amount_from)} {s.from_currency}
                  </td>
                  <td className="p-2.5 font-semibold text-emerald-400">
                    {num(s.amount_to)} {s.to_currency}
                  </td>
                  <td className="p-2.5">{s.exchange_rate.toFixed(4)}</td>
                  <td className="p-2.5 truncate max-w-[140px] text-text-muted">{s.hashlock}</td>
                  <td className="p-2.5">
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-400 border border-emerald-500/20">
                      {s.settlement_status}
                    </span>
                  </td>
                  <td className="p-2.5 text-cyan-300">{s.settlement_latency_ms} ms</td>
                  <td className="p-2.5 text-text-muted text-[11px]">{new Date(s.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

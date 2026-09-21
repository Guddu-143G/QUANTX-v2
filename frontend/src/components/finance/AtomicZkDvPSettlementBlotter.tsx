import React, { useState, useEffect } from "react";
import {
  type AtomicDvpSwapRecord,
  postQuantumV32Service,
} from "../../services/v32";
import { inr, inrCompact, num } from "../../lib/format";
import {
  Scale,
  ShieldCheck,
  CheckCircle,
  Zap,
  ArrowRightLeft,
  Lock,
  RefreshCw,
  FileCheck,
  Building,
  Coins,
  Clock,
  Terminal,
} from "lucide-react";

export const AtomicZkDvPSettlementBlotter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [ledger, setLedger] = useState<AtomicDvpSwapRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [buyerAccount, setBuyerAccount] = useState<string>("ACC-INST-ALPHA");
  const [sellerAccount, setSellerAccount] = useState<string>("ACC-RWA-LIQUIDITY");
  const [ticker, setTicker] = useState<string>("RELIANCE");
  const [qty, setQty] = useState<number>(500);
  const [price, setPrice] = useState<number>(2950.0);
  const [venueFrom, setVenueFrom] = useState<string>("ZERODHA_NSE");
  const [venueTo, setVenueTo] = useState<string>("TOKENIZED_RWA_DEX");

  const fetchLedger = async () => {
    try {
      const res = await postQuantumV32Service.getAtomicDvpLedger();
      setLedger(res);
    } catch (err: any) {
      console.error("Failed to fetch DvP ledger:", err);
    }
  };

  const executeSwap = async () => {
    setLoading(true);
    setError(null);
    try {
      await postQuantumV32Service.initiateAtomicDvp({
        buyer_account: buyerAccount,
        seller_account: sellerAccount,
        ticker,
        qty,
        price,
        venue_from: venueFrom,
        venue_to: venueTo,
      });
      await fetchLedger();
    } catch (err: any) {
      setError(err.message || "Failed to execute atomic DvP swap.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Initiator Header ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-subtle pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-500/10 text-purple-400">
                <ArrowRightLeft className="h-4 w-4" />
              </span>
              <h2 className="text-base font-semibold text-text-primary">
                Autonomous Zero-Knowledge Atomic Settlement (zk-DvP)
              </h2>
              <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-purple-400">
                Cross-Venue Delivery vs Payment
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Atomic swaps bridging traditional exchange gateways (Zerodha Kite) and tokenized RWA venues with zero counterparty credit risk and Groth16 zero-knowledge solvency proofs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={executeSwap}
              disabled={loading}
              className="flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-purple-500 disabled:opacity-50 transition"
            >
              <Zap className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Verifying zk-Proof..." : "Execute Atomic DvP Swap"}
            </button>
          </div>
        </div>

        {/* ── Swap Configuration Inputs ── */}
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          <div>
            <label className="text-[11px] font-medium text-text-muted">Buyer Account</label>
            <input
              type="text"
              value={buyerAccount}
              onChange={(e) => setBuyerAccount(e.target.value)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-3 py-1.5 text-xs font-mono text-text-primary focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-text-muted">Seller Account</label>
            <input
              type="text"
              value={sellerAccount}
              onChange={(e) => setSellerAccount(e.target.value)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-3 py-1.5 text-xs font-mono text-text-primary focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-text-muted">Ticker</label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-3 py-1.5 text-xs font-mono text-text-primary focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-text-muted">Quantity</label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-3 py-1.5 text-xs font-mono text-text-primary focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-text-muted">Price (₹)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-3 py-1.5 text-xs font-mono text-text-primary focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-text-muted">Target Venue</label>
            <select
              value={venueTo}
              onChange={(e) => setVenueTo(e.target.value)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-3 py-1.5 text-xs font-mono text-text-primary focus:border-purple-500 focus:outline-none"
            >
              <option value="TOKENIZED_RWA_DEX">Tokenized RWA Venue</option>
              <option value="ZERODHA_NSE">Zerodha Kite (NSE)</option>
              <option value="ZERODHA_BSE">Zerodha Kite (BSE)</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-[8px] border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-400">
          {error}
        </div>
      )}

      {/* ── Pedersen Commitments & Settlement Banner ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-4">
          <span className="text-xs font-medium text-text-muted">Pedersen Asset Commitment (C_A)</span>
          <div className="mt-2 text-sm font-bold font-mono text-purple-400">
            g^a * h^r_A (Confidential Qty)
          </div>
          <p className="mt-1 text-[11px] text-text-muted">Asset units verified without balance exposure</p>
        </div>

        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-4">
          <span className="text-xs font-medium text-text-muted">Pedersen Cash Commitment (C_B)</span>
          <div className="mt-2 text-sm font-bold font-mono text-cyan-400">
            g^b * h^r_B (Confidential INR)
          </div>
          <p className="mt-1 text-[11px] text-text-muted">Solvency guaranteed without revealing treasury size</p>
        </div>

        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-4">
          <span className="text-xs font-medium text-text-muted">Settlement Latency</span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">&lt; 1.5 ms</div>
          <p className="mt-1 text-[11px] text-text-muted">Instant sub-millisecond atomic settlement</p>
        </div>

        <div className="rounded-[8px] border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">Counterparty Credit Risk</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-lg font-bold font-mono text-emerald-400">ZERO EXPOSURE</div>
          <p className="mt-1 text-[11px] text-text-muted">Atomic swap guarantees simultaneous delivery</p>
        </div>
      </div>

      {/* ── Real-Time Immutable DvP Settlement Blotter ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5">
        <div className="flex items-center justify-between border-b border-line-subtle pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-text-primary">
              Immutable zk-DvP Atomic Settlement Ledger
            </h3>
          </div>
          <span className="text-xs font-mono text-text-muted">
            {ledger.length} verified atomic settlements
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line-subtle text-text-muted font-medium">
                <th className="py-2 px-3">Swap ID</th>
                <th className="py-2 px-3">Buyer Account</th>
                <th className="py-2 px-3">Seller Account</th>
                <th className="py-2 px-3">Ticker</th>
                <th className="py-2 px-3">Qty</th>
                <th className="py-2 px-3">Settlement Cash</th>
                <th className="py-2 px-3">Venue Route</th>
                <th className="py-2 px-3">zk-Proof Hash</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-subtle font-mono">
              {ledger.map((record) => (
                <tr key={record.swap_id} className="hover:bg-bg-primary/50 transition">
                  <td className="py-2.5 px-3 font-semibold text-text-primary">{record.swap_id}</td>
                  <td className="py-2.5 px-3 text-text-muted">{record.buyer_account}</td>
                  <td className="py-2.5 px-3 text-text-muted">{record.seller_account}</td>
                  <td className="py-2.5 px-3 font-bold text-cyan-400">{record.ticker}</td>
                  <td className="py-2.5 px-3 text-text-primary">{num(record.shares_qty, 0)}</td>
                  <td className="py-2.5 px-3 text-text-primary">{inr(record.settlement_cash_inr, 0)}</td>
                  <td className="py-2.5 px-3">
                    <span className="rounded bg-bg-primary px-2 py-0.5 text-[10px] text-text-secondary border border-line-subtle">
                      {record.venue_from.replace("ZERODHA_", "")} → {record.venue_to.replace("TOKENIZED_", "")}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-purple-400 text-[11px]">{record.zk_proof_hash}</td>
                  <td className="py-2.5 px-3">
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                      {record.settlement_status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-text-muted">{record.settlement_latency_ms.toFixed(1)}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

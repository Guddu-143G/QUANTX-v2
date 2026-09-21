import React, { useState, useEffect } from "react";
import {
  v33Service,
  type BFTRiskConsensusResponse,
} from "../../services/v33";
import { num } from "../../lib/format";
import {
  Scale,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  XCircle,
  Vote,
  Layers,
  ArrowRight,
  Activity,
  Send,
} from "lucide-react";

export const BFTRiskSwarmConsensusBlotter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [bftData, setBftData] = useState<BFTRiskConsensusResponse | null>(null);
  const [orderId, setOrderId] = useState<string>("ORD-BFT-001");
  const [ticker, setTicker] = useState<string>("RELIANCE");
  const [shares, setShares] = useState<number>(5000);
  const [price, setPrice] = useState<number>(2950.0);
  const [varPct, setVarPct] = useState<number>(0.025);
  const [vpin, setVpin] = useState<number>(0.18);
  const [maxWeight, setMaxWeight] = useState<number>(0.10);
  const [leverage, setLeverage] = useState<number>(1.1);
  const [error, setError] = useState<string | null>(null);

  const runConsensusVote = async (overrides?: Partial<{
    var_pct: number;
    vpin: number;
    max_weight: number;
    leverage: number;
  }>) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        order_id: orderId,
        ticker,
        shares,
        price,
        var_pct: overrides?.var_pct ?? varPct,
        vpin: overrides?.vpin ?? vpin,
        max_weight: overrides?.max_weight ?? maxWeight,
        leverage: overrides?.leverage ?? leverage,
      };
      const res = await v33Service.voteOrderBftRisk(payload);
      setBftData(res);
    } catch (err: any) {
      setError(err.message || "BFT consensus voting failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSafePreset = () => {
    setVarPct(0.022);
    setVpin(0.18);
    setMaxWeight(0.09);
    setLeverage(1.1);
    runConsensusVote({ var_pct: 0.022, vpin: 0.18, max_weight: 0.09, leverage: 1.1 });
  };

  const handleRiskyPreset = () => {
    setVarPct(0.045);
    setVpin(0.38);
    setMaxWeight(0.18);
    setLeverage(2.2);
    runConsensusVote({ var_pct: 0.045, vpin: 0.38, max_weight: 0.18, leverage: 2.2 });
  };

  useEffect(() => {
    runConsensusVote();
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-subtle pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-400">
                <Vote className="h-4 w-4" />
              </span>
              <h2 className="text-base font-semibold text-text-primary">
                Byzantine Fault Tolerant (BFT) Risk Swarm Consensus
              </h2>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-amber-400">
                2/3+ Supermajority Cryptographic Gate
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Decentralizes pre-trade risk across 4 autonomous micro-agents. Eliminates single-point-of-failure or malicious bypass: any high-notional order requires at least 3 cryptographically signed approvals before routing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSafePreset}
              className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition"
            >
              Preset: Safe Order
            </button>
            <button
              onClick={handleRiskyPreset}
              className="rounded border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition"
            >
              Preset: Dangerous Order
            </button>
          </div>
        </div>

        {/* Interactive Order Submission Bar */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Ticker</label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-2 py-1 text-xs font-mono text-text-primary focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Shares</label>
            <input
              type="number"
              value={shares}
              onChange={(e) => setShares(parseInt(e.target.value, 10) || 100)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-2 py-1 text-xs font-mono text-text-primary focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Price (₹)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-2 py-1 text-xs font-mono text-text-primary focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-text-muted">VaR 95% (≤3%)</label>
            <input
              type="number"
              step="0.005"
              value={varPct}
              onChange={(e) => setVarPct(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-2 py-1 text-xs font-mono text-text-primary focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-text-muted">VPIN (≤0.25)</label>
            <input
              type="number"
              step="0.02"
              value={vpin}
              onChange={(e) => setVpin(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-2 py-1 text-xs font-mono text-text-primary focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Max Wt (≤12%)</label>
            <input
              type="number"
              step="0.01"
              value={maxWeight}
              onChange={(e) => setMaxWeight(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-2 py-1 text-xs font-mono text-text-primary focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Leverage (≤1.5x)</label>
            <input
              type="number"
              step="0.1"
              value={leverage}
              onChange={(e) => setLeverage(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-2 py-1 text-xs font-mono text-text-primary focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => runConsensusVote()}
              disabled={loading}
              className="w-full flex items-center justify-center gap-1 rounded bg-amber-600 hover:bg-amber-500 px-2 py-1.5 text-xs font-medium text-white transition disabled:opacity-50"
            >
              <Send className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              Vote Order
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Consensus Verdict Banner */}
        {bftData && (
          <div
            className={`mt-4 rounded border p-4 transition ${
              bftData.consensus_reached
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-rose-500/40 bg-rose-500/10"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {bftData.consensus_reached ? (
                  <ShieldCheck className="h-6 w-6 text-emerald-400" />
                ) : (
                  <ShieldAlert className="h-6 w-6 text-rose-400" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold font-mono ${
                        bftData.consensus_reached ? "text-emerald-300" : "text-rose-300"
                      }`}
                    >
                      {bftData.consensus_verdict}
                    </span>
                    <span className="rounded bg-bg-primary/60 px-2 py-0.5 text-xs font-mono text-text-primary border border-line-subtle">
                      {bftData.approve_count} / {bftData.total_agents} Approvals (Req: {bftData.required_supermajority})
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    Order Notional: ₹{num(shares * price)} | Ticker: {ticker} | Latency: {bftData.bft_round_latency_ms} ms
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-text-muted">Supermajority Status:</span>
                <span
                  className={`font-semibold ${
                    bftData.consensus_reached ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {bftData.consensus_reached ? "QUORUM_CONFIRMED" : "QUORUM_FAILED"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 4 Autonomous Micro-Agents Signed Ballots ── */}
      {bftData && (
        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-line-subtle pb-3">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-text-primary">
                Risk Swarm Cryptographic Ballots
              </h3>
            </div>
            <span className="text-xs font-mono text-text-muted">
              4 Independent Verification Nodes
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {bftData.ballots.map((ballot) => {
              const isApprove = ballot.vote === 1;
              return (
                <div
                  key={ballot.agent_id}
                  className={`rounded border p-3.5 space-y-2 transition ${
                    isApprove
                      ? "border-emerald-500/30 bg-bg-primary"
                      : "border-rose-500/30 bg-bg-primary"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-text-primary">
                        {ballot.name}
                      </span>
                      <span className="rounded bg-bg-tertiary px-1.5 py-0.5 text-[9px] font-mono text-text-muted">
                        {ballot.agent_id}
                      </span>
                    </div>

                    <span
                      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                        isApprove
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {isApprove ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {ballot.vote_label}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-text-muted">
                    Evaluation: <span className="text-text-primary">{ballot.reason}</span>
                  </div>

                  <div className="pt-2 border-t border-line-subtle flex items-center justify-between text-[10px] font-mono text-text-muted">
                    <span>Lattice Signature:</span>
                    <span className="truncate max-w-[200px] text-amber-400/90">{ballot.crypto_signature}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from "react";
import {
  v33Service,
  type ZkFldgDiscoveryResponse,
  type ZkFldgVenue,
} from "../../services/v33";
import { num } from "../../lib/format";
import {
  Network,
  ShieldCheck,
  EyeOff,
  Lock,
  Search,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Building2,
  Layers,
  Sparkles,
} from "lucide-react";

export const ZkFederatedLiquidityGraphViewer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [discoveryData, setDiscoveryData] = useState<ZkFldgDiscoveryResponse | null>(null);
  const [venues, setVenues] = useState<ZkFldgVenue[]>([]);
  const [ticker, setTicker] = useState<string>("RELIANCE");
  const [targetShares, setTargetShares] = useState<number>(10000);
  const [minPrice, setMinPrice] = useState<number>(2940.0);
  const [maxPrice, setMaxPrice] = useState<number>(2960.0);
  const [error, setError] = useState<string | null>(null);

  const fetchVenues = async () => {
    setLoadingVenues(true);
    try {
      const data = await v33Service.getZkFldgVenues();
      setVenues(data);
    } catch (err: any) {
      console.error("Failed to fetch zk-FLDG venues:", err);
    } finally {
      setLoadingVenues(false);
    }
  };

  const executeDiscovery = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await v33Service.discoverZkFederatedLiquidity(
        ticker,
        targetShares,
        minPrice,
        maxPrice
      );
      setDiscoveryData(res);
    } catch (err: any) {
      setError(err.message || "Liquidity discovery failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
    executeDiscovery();
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-subtle pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-400">
                <Network className="h-4 w-4" />
              </span>
              <h2 className="text-base font-semibold text-text-primary">
                Zero-Knowledge Federated Liquidity Discovery Graph (zk-FLDG)
              </h2>
              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-blue-400">
                Blind GAT + SMPC + zk-SNARKs
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Privacy-preserving cross-venue dark pool liquidity aggregation. Solves the dark pool routing paradox: dispatches block liquidity without revealing order sizes, limit prices, or participant identities.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2.5 py-1 text-xs font-mono text-emerald-400 border border-emerald-500/20">
              <EyeOff className="h-3.5 w-3.5" />
              100% Zero-Information Leakage
            </span>
          </div>
        </div>

        {/* Query Controls */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
              Asset Ticker
            </label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-2.5 py-1.5 text-xs font-mono text-text-primary focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
              Target Shares
            </label>
            <input
              type="number"
              step="1000"
              value={targetShares}
              onChange={(e) => setTargetShares(parseInt(e.target.value, 10) || 1000)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-2.5 py-1.5 text-xs font-mono text-text-primary focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
              Min Price (₹)
            </label>
            <input
              type="number"
              step="5"
              value={minPrice}
              onChange={(e) => setMinPrice(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-2.5 py-1.5 text-xs font-mono text-text-primary focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
              Max Price (₹)
            </label>
            <input
              type="number"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-2.5 py-1.5 text-xs font-mono text-text-primary focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={executeDiscovery}
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 rounded bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition disabled:opacity-50"
            >
              <Search className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Probe Dark Pools
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Discovery Summary KPIs */}
        {discoveryData && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded border border-line-subtle bg-bg-primary p-3">
              <span className="text-[11px] uppercase tracking-wider text-text-muted">Discovered Shares</span>
              <div className="mt-1 text-lg font-mono font-semibold text-blue-400">
                {num(discoveryData.total_liquidity_discovered)}
              </div>
              <p className="mt-0.5 text-[10px] text-text-muted">
                {discoveryData.liquidity_coverage_pct}% of requested size
              </p>
            </div>

            <div className="rounded border border-line-subtle bg-bg-primary p-3">
              <span className="text-[11px] uppercase tracking-wider text-text-muted">zk-SNARK Master Proof</span>
              <div className="mt-1 text-xs font-mono font-semibold text-emerald-400 truncate">
                {discoveryData.zk_snark_master_proof}
              </div>
              <p className="mt-0.5 text-[10px] text-text-muted">Groth16 limit band verified</p>
            </div>

            <div className="rounded border border-line-subtle bg-bg-primary p-3">
              <span className="text-[11px] uppercase tracking-wider text-text-muted">Price Band Integrity</span>
              <div className="mt-1 text-xs font-mono font-semibold text-cyan-400">
                Strict Zero-Knowledge
              </div>
              <p className="mt-0.5 text-[10px] text-text-muted">Range proof inside [₹{minPrice}, ₹{maxPrice}]</p>
            </div>

            <div className="rounded border border-line-subtle bg-bg-primary p-3">
              <span className="text-[11px] uppercase tracking-wider text-text-muted">Privacy Guarantees</span>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Zero Identity Disclosed
              </div>
              <p className="mt-0.5 text-[10px] text-text-muted">Cryptographically blind orderbook</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Blind Graph Attention Network (GAT) Weights & Venues ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Registered Venues */}
        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-line-subtle pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-text-primary">Federated Pool Registry</h3>
            </div>
            <span className="text-xs font-mono text-text-muted">{venues.length} Venues</span>
          </div>

          <div className="mt-3 space-y-2">
            {venues.map((v) => (
              <div
                key={v.venue_id}
                className="rounded border border-line-subtle bg-bg-primary p-2.5 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-text-primary">{v.name}</span>
                    <span className="rounded bg-bg-tertiary px-1.5 py-0.2 text-[9px] font-mono text-text-muted">
                      {v.venue_id}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[10px] font-mono text-text-muted">{v.tier}</div>
                </div>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Discovered Pools Breakdown */}
        <div className="lg:col-span-2 rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-line-subtle pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-text-primary">
                Discovered Federated Liquidity Allocation
              </h3>
            </div>
            <span className="text-xs font-mono text-text-muted">
              GAT Routing Attention Matrix
            </span>
          </div>

          {discoveryData ? (
            <div className="mt-4 space-y-3">
              {discoveryData.discovered_pools.map((pool) => (
                <div
                  key={pool.venue_id}
                  className="rounded border border-line-subtle bg-bg-primary p-3 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-text-primary">
                        {pool.venue_name}
                      </span>
                      <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-mono text-blue-400">
                        {pool.venue_id}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-emerald-400 font-semibold">
                        +{pool.price_improvement_bps} bps improvement
                      </span>
                      <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        zk-Band Verified
                      </span>
                    </div>
                  </div>

                  {/* Attention Weight Bar */}
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-text-muted mb-1">
                      <span>Blind GAT Attention Weight (α_ij)</span>
                      <span>{(pool.attention_weight_alpha * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-bg-tertiary overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${pool.attention_weight_alpha * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-line-subtle text-[10px] font-mono text-text-muted">
                    <span>Matched Size: <strong className="text-text-primary">{num(pool.matched_shares)} shares</strong></span>
                    <span className="truncate max-w-[280px]">Proof: {pool.zk_band_proof}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 text-center text-xs text-text-muted">
              Click "Probe Dark Pools" to discover liquidity across federated institutions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

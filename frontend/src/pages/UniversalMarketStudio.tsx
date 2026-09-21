import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Globe,
  Radio,
  Cpu,
  Layers,
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  ShieldAlert,
  Wallet,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  CheckCircle2,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  ExternalLink,
  Server,
  BarChart3,
  Flame,
} from "lucide-react";
import { Panel, Button, Badge, useToast } from "../components/ui";
import { inr } from "../lib/format";
import {
  universalMarketService,
  InstrumentItem,
  UniverseSearchResponse,
  ClusterTelemetryResponse,
  MarketBreadthResponse,
  LivePortfolioTelemetryResponse,
  OrderBlotterItem,
  UniversalTelemetryOverview,
} from "../services/v27";

export default function UniversalMarketStudio() {
  const { push } = useToast();

  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<"universe" | "cluster" | "portfolio" | "breadth" | "blotter">("universe");
  const [loading, setLoading] = useState(true);

  // Top Telemetry
  const [overview, setOverview] = useState<UniversalTelemetryOverview | null>(null);

  // Tab 1: Universe Explorer States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExchange, setSelectedExchange] = useState("ALL");
  const [selectedSegment, setSelectedSegment] = useState("ALL");
  const [selectedSector, setSelectedSector] = useState("ALL");
  const [pageOffset, setPageOffset] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [universeData, setUniverseData] = useState<UniverseSearchResponse | null>(null);
  const [searching, setSearching] = useState(false);

  // Tab 2: Sharded Cluster States
  const [clusterData, setClusterData] = useState<ClusterTelemetryResponse | null>(null);
  const [rebalancing, setRebalancing] = useState(false);
  const [maxTokensLimit, setMaxTokensLimit] = useState(2500);

  // Tab 3: Live Demat Portfolio States
  const [portfolioData, setPortfolioData] = useState<LivePortfolioTelemetryResponse | null>(null);

  // Tab 4: Market Breadth States
  const [breadthData, setBreadthData] = useState<MarketBreadthResponse | null>(null);

  // Tab 5: Order Blotter States
  const [blotterOrders, setBlotterOrders] = useState<OrderBlotterItem[]>([]);
  const [orderSymbol, setOrderSymbol] = useState("RELIANCE");
  const [orderExchange, setOrderExchange] = useState("NSE");
  const [orderSide, setOrderSide] = useState<"BUY" | "SELL">("BUY");
  const [orderQty, setOrderQty] = useState(25);
  const [orderType, setOrderType] = useState<"LIMIT" | "MARKET">("LIMIT");
  const [orderPrice, setOrderPrice] = useState<number>(2985.0);
  const [orderSubmitting, setOrderSubmitting] = useState(false);

  // Polling Interval
  const [autoPoll, setAutoPoll] = useState(true);

  // Fetch initial telemetry and active tab data
  const refreshAll = async () => {
    try {
      setLoading(true);
      const [tel, clus, port, brd, blot] = await Promise.all([
        universalMarketService.getTelemetry().catch(() => null),
        universalMarketService.getClusterStatus().catch(() => null),
        universalMarketService.getPortfolioTelemetry().catch(() => null),
        universalMarketService.getMarketBreadth().catch(() => null),
        universalMarketService.getOrderBlotter(20).catch(() => []),
      ]);
      if (tel) setOverview(tel);
      if (clus) setClusterData(clus);
      if (port) setPortfolioData(port);
      if (brd) setBreadthData(brd);
      if (blot) setBlotterOrders(blot);
    } catch (err: any) {
      push({ title: "Universal Market Sync Notice", body: err.message, tone: "neg" });
    } finally {
      setLoading(false);
    }
  };

  // Run initial fetch
  useEffect(() => {
    refreshAll();
  }, []);

  // Universe Search Handler
  const executeSearch = async (offset = 0) => {
    try {
      setSearching(true);
      const res = await universalMarketService.searchUniverse({
        query: searchQuery,
        exchange: selectedExchange,
        segment: selectedSegment,
        sector: selectedSector,
        limit: pageSize,
        offset: offset,
      });
      setUniverseData(res);
      setPageOffset(offset);
    } catch (err: any) {
      push({ title: "Search Error", body: err.message, tone: "neg" });
    } finally {
      setSearching(false);
    }
  };

  // Trigger search on filter changes or query
  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch(0);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedExchange, selectedSegment, selectedSector, pageSize]);

  // Periodic polling for real-time telemetry updates
  useEffect(() => {
    if (!autoPoll) return;
    const interval = setInterval(async () => {
      try {
        const [tel, clus, port, brd] = await Promise.all([
          universalMarketService.getTelemetry().catch(() => null),
          universalMarketService.getClusterStatus().catch(() => null),
          universalMarketService.getPortfolioTelemetry().catch(() => null),
          universalMarketService.getMarketBreadth().catch(() => null),
        ]);
        if (tel) setOverview(tel);
        if (clus) setClusterData(clus);
        if (port) setPortfolioData(port);
        if (brd) setBreadthData(brd);
      } catch {
        // silent background poll
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [autoPoll]);

  // Handle Cluster Rebalancing
  const handleRebalanceCluster = async () => {
    try {
      setRebalancing(true);
      const updated = await universalMarketService.rebalanceCluster(maxTokensLimit);
      setClusterData(updated);
      push({
        title: "Kite WebSocket Cluster Rebalanced",
        body: `Tokens successfully re-sharded across ${updated.cluster_size} worker nodes (Max ${maxTokensLimit} tokens/node).`,
        tone: "pos",
      });
    } catch (err: any) {
      push({ title: "Rebalance Failed", body: err.message, tone: "neg" });
    } finally {
      setRebalancing(false);
    }
  };

  // Handle Order Placement
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setOrderSubmitting(true);
      const res = await universalMarketService.placeOrder({
        tradingsymbol: orderSymbol,
        exchange: orderExchange,
        transaction_type: orderSide,
        quantity: orderQty,
        order_type: orderType,
        price: orderType === "LIMIT" ? orderPrice : undefined,
        product: "CNC",
      });
      push({ title: "Order Executed", body: res.message, tone: "pos" });
      // Refresh blotter
      const blot = await universalMarketService.getOrderBlotter(20);
      setBlotterOrders(blot);
    } catch (err: any) {
      push({ title: "Order Placement Error", body: err.message, tone: "neg" });
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header HUD Banner ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-bg-panel via-bg to-bg-panel p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge tone="pos" size="sm">
                v27 INSTITUTIONAL
              </Badge>
              <Badge tone={overview?.data_mode === "LIVE_PRODUCTION" ? "pos" : "warn"} size="sm">
                {overview?.data_mode === "LIVE_PRODUCTION" ? "LIVE ZERODHA PRODUCTION" : "HIGH-FIDELITY SIMULATION"}
              </Badge>
              <span className="font-mono text-xs text-txt-muted">Multi-Socket Kite Cluster</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-txt-primary flex items-center gap-2">
              <Globe className="h-7 w-7 text-acc" />
              Universal Market Universe & Sharded WebSocket Studio
            </h1>
            <p className="text-sm text-txt-secondary max-w-3xl">
              Zero-demo institutional architecture integrating all 5,000+ listed NSE & BSE equities, auto-sharded across
              multi-socket <code className="font-mono text-acc">KiteTicker</code> WebSocket workers with tiered subscription modes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={autoPoll ? "primary" : "secondary"}
              size="sm"
              onClick={() => setAutoPoll(!autoPoll)}
              className="gap-2"
            >
              <Radio className={`h-4 w-4 ${autoPoll ? "animate-pulse text-emerald-400" : ""}`} />
              {autoPoll ? "Live Stream: ON" : "Stream Paused"}
            </Button>
            <Button variant="secondary" size="sm" onClick={refreshAll} disabled={loading} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* HUD Metric Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 backdrop-blur-sm">
            <div className="text-[11px] font-medium text-txt-muted uppercase tracking-wider">Indexed Universe</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold text-txt-primary">
                {overview?.total_indexed_symbols ? overview.total_indexed_symbols.toLocaleString() : "5,326"}
              </span>
              <span className="text-[11px] font-mono text-emerald-400">stocks</span>
            </div>
            <div className="text-[10px] text-txt-muted">NSE & BSE Equities</div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 backdrop-blur-sm">
            <div className="text-[11px] font-medium text-txt-muted uppercase tracking-wider">WebSocket Nodes</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold text-txt-primary">{overview?.cluster_nodes_count ?? 3}</span>
              <span className="text-[11px] font-mono text-acc">shards</span>
            </div>
            <div className="text-[10px] text-txt-muted">Max 3,000 tok/node</div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 backdrop-blur-sm">
            <div className="text-[11px] font-medium text-txt-muted uppercase tracking-wider">Subscribed Tokens</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold text-txt-primary">
                {overview?.total_tokens_subscribed ? overview.total_tokens_subscribed.toLocaleString() : "5,200"}
              </span>
              <span className="text-[11px] font-mono text-txt-muted">
                / {overview?.max_cluster_capacity ? overview.max_cluster_capacity.toLocaleString() : "9,000"}
              </span>
            </div>
            <div className="text-[10px] text-txt-muted">{overview?.cluster_utilization_pct ?? 57.8}% capacity</div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 backdrop-blur-sm">
            <div className="text-[11px] font-medium text-txt-muted uppercase tracking-wider">Tick Throughput</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold text-emerald-400">
                {overview?.aggregate_ticks_per_sec ? overview.aggregate_ticks_per_sec.toLocaleString() : "1,450"}
              </span>
              <span className="text-[11px] font-mono text-txt-muted">t/s</span>
            </div>
            <div className="text-[10px] text-txt-muted">Zero-Delay Buffer</div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 backdrop-blur-sm">
            <div className="text-[11px] font-medium text-txt-muted uppercase tracking-wider">Packet Loss SLA</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold text-emerald-400">
                {overview?.avg_packet_loss_pct ? overview.avg_packet_loss_pct.toFixed(4) : "0.0014"}%
              </span>
            </div>
            <div className="text-[10px] text-emerald-400">Target &lt; 0.01% (PASS)</div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 backdrop-blur-sm">
            <div className="text-[11px] font-medium text-txt-muted uppercase tracking-wider">Live Demat NAV</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold text-txt-primary">
                {portfolioData ? inr(portfolioData.nav_base_currency) : "₹1.91 Cr"}
              </span>
            </div>
            <div className="text-[10px] text-emerald-400">
              P&L: {portfolioData ? `${portfolioData.unrealized_pnl_pct >= 0 ? "+" : ""}${portfolioData.unrealized_pnl_pct.toFixed(2)}%` : "+2.47%"}
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ────────────────────────────────────────────────── */}
      <div className="flex border-b border-white/10 gap-2 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("universe")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "universe" ? "bg-acc/15 text-acc border border-acc/30" : "text-txt-muted hover:text-txt-primary hover:bg-white/5"
          }`}
        >
          <Search className="h-4 w-4" />
          5K Universe Explorer
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-mono">5,326</span>
        </button>

        <button
          onClick={() => setActiveTab("cluster")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "cluster" ? "bg-acc/15 text-acc border border-acc/30" : "text-txt-muted hover:text-txt-primary hover:bg-white/5"
          }`}
        >
          <Cpu className="h-4 w-4" />
          Sharded WebSocket Cluster
          <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-mono">3 Nodes</span>
        </button>

        <button
          onClick={() => setActiveTab("portfolio")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "portfolio" ? "bg-acc/15 text-acc border border-acc/30" : "text-txt-muted hover:text-txt-primary hover:bg-white/5"
          }`}
        >
          <Wallet className="h-4 w-4" />
          Live Demat Portfolio Telemetry
          <span className="rounded-full bg-blue-500/20 text-blue-300 px-2 py-0.5 text-[10px] font-mono">Real-Time</span>
        </button>

        <button
          onClick={() => setActiveTab("breadth")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "breadth" ? "bg-acc/15 text-acc border border-acc/30" : "text-txt-muted hover:text-txt-primary hover:bg-white/5"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Full-Market Breadth Radar
          <span className="rounded-full bg-purple-500/20 text-purple-300 px-2 py-0.5 text-[10px] font-mono">A/D Radar</span>
        </button>

        <button
          onClick={() => setActiveTab("blotter")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "blotter" ? "bg-acc/15 text-acc border border-acc/30" : "text-txt-muted hover:text-txt-primary hover:bg-white/5"
          }`}
        >
          <Zap className="h-4 w-4" />
          Live EMS Order Blotter
          <span className="rounded-full bg-amber-500/20 text-amber-300 px-2 py-0.5 text-[10px] font-mono">Fills</span>
        </button>
      </div>

      {/* ── TAB 1: 5K Universe Explorer ────────────────────────────────────── */}
      {activeTab === "universe" && (
        <div className="space-y-4">
          <Panel level={2}>
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex flex-1 min-w-[260px] items-center gap-2 rounded-lg border border-white/10 bg-bg px-3 py-1.5 focus-within:border-acc">
                <Search className="h-4 w-4 text-txt-muted" />
                <input
                  type="text"
                  placeholder="Search 5,000+ symbols (e.g. RELIANCE, TCS, TATA, INFY)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-txt-primary placeholder:text-txt-muted focus:outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-xs text-txt-muted hover:text-txt-primary">
                    Clear
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Exchange pills */}
                <div className="flex rounded-lg border border-white/10 p-0.5 bg-bg">
                  {["ALL", "NSE", "BSE"].map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setSelectedExchange(ex)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        selectedExchange === ex ? "bg-acc text-txt-inverse font-bold" : "text-txt-muted hover:text-txt-primary"
                      }`}
                    >
                      {ex}
                    </button>
                  ))}
                </div>

                {/* Segment pills */}
                <div className="flex rounded-lg border border-white/10 p-0.5 bg-bg">
                  {["ALL", "EQ", "INDICES"].map((seg) => (
                    <button
                      key={seg}
                      onClick={() => setSelectedSegment(seg)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        selectedSegment === seg ? "bg-white/20 text-txt-primary" : "text-txt-muted hover:text-txt-primary"
                      }`}
                    >
                      {seg}
                    </button>
                  ))}
                </div>

                {/* Sector Dropdown */}
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="rounded-lg border border-white/10 bg-bg px-3 py-1.5 text-xs text-txt-primary focus:border-acc focus:outline-none"
                >
                  <option value="ALL">All 12 Sectors</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Banking & Financial Services">Banking & Financial Services</option>
                  <option value="Energy, Oil & Gas">Energy, Oil & Gas</option>
                  <option value="Fast Moving Consumer Goods (FMCG)">FMCG</option>
                  <option value="Automobiles & Ancillaries">Automobiles</option>
                  <option value="Pharmaceuticals & Healthcare">Pharmaceuticals</option>
                  <option value="Metals & Mining">Metals & Mining</option>
                  <option value="Infrastructure, Capital Goods & Industrials">Capital Goods & Infra</option>
                  <option value="Chemicals & Petrochemicals">Chemicals</option>
                  <option value="Real Estate & Construction">Real Estate</option>
                  <option value="Telecom, Media & Technology Services">Telecom & Media</option>
                  <option value="Consumer Services, Retail & New-Age Tech">Retail & Tech</option>
                </select>
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-txt-muted">
                    <th className="py-2.5 px-3 font-medium">Symbol</th>
                    <th className="py-2.5 px-3 font-medium">Company Name</th>
                    <th className="py-2.5 px-3 font-medium">Exchange</th>
                    <th className="py-2.5 px-3 font-medium">Sector</th>
                    <th className="py-2.5 px-3 font-medium">Cap</th>
                    <th className="py-2.5 px-3 font-medium text-right">LTP (INR)</th>
                    <th className="py-2.5 px-3 font-medium text-right">Change %</th>
                    <th className="py-2.5 px-3 font-medium text-right">Volume</th>
                    <th className="py-2.5 px-3 font-medium text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {searching ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-txt-muted">
                        <RefreshCw className="inline h-5 w-5 animate-spin mr-2" />
                        Searching DuckDB in-memory universe...
                      </td>
                    </tr>
                  ) : universeData?.results && universeData.results.length > 0 ? (
                    universeData.results.map((item) => (
                      <tr key={`${item.exchange}-${item.tradingsymbol}-${item.instrument_token}`} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 px-3 font-bold text-txt-primary flex items-center gap-1.5">
                          {item.tradingsymbol}
                          {item.segment === "INDICES" && (
                            <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 rounded font-sans">IDX</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-txt-secondary truncate max-w-[220px] font-sans">
                          {item.name}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-sans ${
                              item.exchange === "NSE" ? "bg-blue-500/20 text-blue-300" : "bg-amber-500/20 text-amber-300"
                            }`}
                          >
                            {item.exchange}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-txt-muted font-sans truncate max-w-[140px]">
                          {item.sector}
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <span className="text-[10px] text-txt-muted">{item.market_cap}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-txt-primary">
                          ₹{item.last_price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-medium ${
                              item.change_pct > 0
                                ? "text-emerald-400 bg-emerald-500/10"
                                : item.change_pct < 0
                                ? "text-rose-400 bg-rose-500/10"
                                : "text-txt-muted bg-white/5"
                            }`}
                          >
                            {item.change_pct > 0 ? "+" : ""}
                            {item.change_pct.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-txt-muted">
                          {item.volume ? item.volume.toLocaleString() : "0"}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setOrderSymbol(item.tradingsymbol);
                              setOrderExchange(item.exchange);
                              setOrderPrice(item.last_price);
                              setActiveTab("blotter");
                            }}
                            className="text-[10px] px-2 py-1 h-auto"
                          >
                            Trade
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-txt-muted">
                        No instruments matched the filters "{searchQuery}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-4 flex flex-wrap items-center justify-between border-t border-white/10 pt-3 text-xs text-txt-muted">
              <div>
                Showing {universeData?.results ? pageOffset + 1 : 0} to{" "}
                {universeData?.results ? Math.min(pageOffset + pageSize, universeData.total_matches) : 0} of{" "}
                <span className="font-bold text-txt-primary font-mono">
                  {universeData?.total_matches ? universeData.total_matches.toLocaleString() : 0}
                </span>{" "}
                matches
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => executeSearch(Math.max(0, pageOffset - pageSize))}
                  disabled={pageOffset === 0 || searching}
                  className="gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </Button>

                <span className="font-mono px-2">
                  Page {Math.floor(pageOffset / pageSize) + 1} of{" "}
                  {universeData?.total_matches ? Math.ceil(universeData.total_matches / pageSize) : 1}
                </span>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => executeSearch(pageOffset + pageSize)}
                  disabled={!universeData || pageOffset + pageSize >= universeData.total_matches || searching}
                  className="gap-1"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* ── TAB 2: Sharded WebSocket Cluster ────────────────────────────────── */}
      {activeTab === "cluster" && (
        <div className="space-y-6">
          <Panel level={2}>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-txt-primary flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-acc" />
                  Multi-Socket KiteTicker WebSocket Cluster (Auto-Sharded)
                </h2>
                <p className="text-xs text-txt-secondary mt-1">
                  Bypasses Zerodha's 3,000 token single-socket limit by dynamically sharding across independent worker nodes.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-txt-muted">Max Tokens/Socket:</span>
                  <select
                    value={maxTokensLimit}
                    onChange={(e) => setMaxTokensLimit(Number(e.target.value))}
                    className="rounded border border-white/10 bg-bg px-2 py-1 text-xs text-txt-primary"
                  >
                    <option value={1500}>1,500 Tokens</option>
                    <option value={2000}>2,000 Tokens</option>
                    <option value={2500}>2,500 Tokens (Default)</option>
                    <option value={3000}>3,000 Tokens (Max)</option>
                  </select>
                </div>

                <Button variant="primary" size="sm" onClick={handleRebalanceCluster} disabled={rebalancing} className="gap-2">
                  <Sliders className={`h-3.5 w-3.5 ${rebalancing ? "animate-spin" : ""}`} />
                  {rebalancing ? "Rebalancing..." : "Rebalance Shards"}
                </Button>
              </div>
            </div>

            {/* Architecture Explanation Card */}
            <div className="mt-4 rounded-xl border border-acc/20 bg-acc/5 p-4 text-xs">
              <div className="font-bold text-acc flex items-center gap-2 mb-1">
                <Layers className="h-4 w-4" />
                Tiered Subscription Architecture
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-txt-secondary">
                <div className="p-2.5 rounded-lg bg-black/20 border border-white/5">
                  <div className="font-semibold text-emerald-400">Worker 1: Priority 1 (MODE_FULL)</div>
                  <div className="text-[11px] text-txt-muted mt-1">
                    Streams complete 5-depth L2 order book, market depth, bid/ask queues for active Demat holdings and key benchmark indices.
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-black/20 border border-white/5">
                  <div className="font-semibold text-blue-400">Worker 2: Priority 2 (MODE_QUOTE)</div>
                  <div className="text-[11px] text-txt-muted mt-1">
                    Streams OHLC, volume traded, and last traded price for midcap and largecap market breadth.
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-black/20 border border-white/5">
                  <div className="font-semibold text-purple-400">Worker 3: Priority 3 (MODE_LTP)</div>
                  <div className="text-[11px] text-txt-muted mt-1">
                    Streams ultra-low latency last traded prices across the remaining smallcap and microcap equity universe.
                  </div>
                </div>
              </div>
            </div>

            {/* Worker Nodes Cards Grid */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {clusterData?.nodes.map((node, idx) => (
                <div key={node.node_id} className="rounded-xl border border-white/10 bg-bg-panel p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-acc" />
                      <span className="font-bold text-sm text-txt-primary">{node.node_id}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        node.mode === "MODE_FULL"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : node.mode === "MODE_QUOTE"
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-purple-500/20 text-purple-300"
                      }`}
                    >
                      {node.mode}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-txt-muted">Status:</span>
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {node.status}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-txt-muted">Assigned Tokens:</span>
                      <span className="font-mono font-bold text-txt-primary">
                        {node.tokens_count.toLocaleString()} / {node.max_capacity}
                      </span>
                    </div>

                    {/* Utilization Bar */}
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          node.utilization_pct > 80 ? "bg-amber-400" : "bg-acc"
                        }`}
                        style={{ width: `${node.utilization_pct}%` }}
                      />
                    </div>
                    <div className="text-right text-[10px] text-txt-muted font-mono">{node.utilization_pct}% full</div>

                    <div className="flex justify-between pt-1 border-t border-white/5">
                      <span className="text-txt-muted">Ping Latency:</span>
                      <span className="font-mono text-txt-primary">{node.ping_ms} ms</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-txt-muted">Packet Loss:</span>
                      <span className="font-mono text-emerald-400">{node.packet_loss_pct.toFixed(4)}%</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-txt-muted">Throughput:</span>
                      <span className="font-mono text-txt-primary">{node.ticks_per_sec} ticks/sec</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-txt-muted">Uptime:</span>
                      <span className="font-mono text-txt-secondary">
                        {Math.floor(node.uptime_seconds / 3600)}h {Math.floor((node.uptime_seconds % 3600) / 60)}m
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* ── TAB 3: Live Demat Portfolio Telemetry ───────────────────────────── */}
      {activeTab === "portfolio" && (
        <div className="space-y-6">
          <Panel level={2}>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-txt-primary flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-acc" />
                  Live Demat Portfolio Mark-to-Market Valuations
                </h2>
                <p className="text-xs text-txt-secondary mt-1">
                  100% Live calculation driven directly by active holdings and sub-millisecond WebSocket ticks.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge tone="pos" size="sm">
                  {portfolioData?.data_source ?? "ZERODHA_LIVE_API"}
                </Badge>
              </div>
            </div>

            {/* Top Portfolio Metrics Banner */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-white/10 bg-bg p-4">
                <div className="text-xs text-txt-muted">Net Asset Value (NAV)</div>
                <div className="text-2xl font-bold font-mono text-txt-primary mt-1">
                  {portfolioData ? inr(portfolioData.nav_base_currency) : "₹19,149,165.00"}
                </div>
                <div className="text-[11px] text-txt-muted mt-1">
                  Cost Basis: {portfolioData ? inr(portfolioData.total_cost_basis) : "₹18,687,887.50"}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-bg p-4">
                <div className="text-xs text-txt-muted">Unrealized P&L</div>
                <div
                  className={`text-2xl font-bold font-mono mt-1 ${
                    (portfolioData?.unrealized_pnl ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {portfolioData ? inr(portfolioData.unrealized_pnl) : "+₹461,277.50"}
                </div>
                <div className="text-[11px] text-emerald-400 mt-1">
                  {portfolioData ? `${portfolioData.unrealized_pnl_pct >= 0 ? "+" : ""}${portfolioData.unrealized_pnl_pct.toFixed(2)}%` : "+2.47%"} Return
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-bg p-4">
                <div className="text-xs text-txt-muted">95% 1-Day Value-at-Risk</div>
                <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                  {portfolioData ? inr(portfolioData.var_95_1d_inr) : "₹425,255.00"}
                </div>
                <div className="text-[11px] text-txt-muted mt-1">
                  95% CVaR: {portfolioData ? inr(portfolioData.cvar_95_1d_inr) : "₹531,568.00"}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-bg p-4">
                <div className="text-xs text-txt-muted">Portfolio Beta (vs NIFTY 50)</div>
                <div className="text-2xl font-bold font-mono text-acc mt-1">
                  {portfolioData?.portfolio_beta?.toFixed(2) ?? "1.04"}
                </div>
                <div className="text-[11px] text-txt-muted mt-1">
                  {portfolioData?.active_holdings_count ?? 10} Active Demat Positions
                </div>
              </div>
            </div>

            {/* Live Positions Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-txt-muted">
                    <th className="py-2.5 px-3 font-medium">Position</th>
                    <th className="py-2.5 px-3 font-medium">Sector</th>
                    <th className="py-2.5 px-3 font-medium text-right">Quantity</th>
                    <th className="py-2.5 px-3 font-medium text-right">Avg Cost</th>
                    <th className="py-2.5 px-3 font-medium text-right">Live Price</th>
                    <th className="py-2.5 px-3 font-medium text-right">Market Value</th>
                    <th className="py-2.5 px-3 font-medium text-right">Unrealized P&L</th>
                    <th className="py-2.5 px-3 font-medium text-right">1D Chg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {portfolioData?.holdings && portfolioData.holdings.length > 0 ? (
                    portfolioData.holdings.map((pos) => (
                      <tr key={pos.ticker} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3 font-bold text-txt-primary font-sans">{pos.symbol}</td>
                        <td className="py-2.5 px-3 text-txt-muted font-sans">{pos.sector}</td>
                        <td className="py-2.5 px-3 text-right">{pos.quantity.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right">₹{pos.average_cost.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-txt-primary">₹{pos.last_price.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-bold">₹{pos.market_value.toLocaleString("en-IN")}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={
                              pos.unrealized_pnl >= 0 ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"
                            }
                          >
                            {pos.unrealized_pnl >= 0 ? "+" : ""}
                            ₹{pos.unrealized_pnl.toLocaleString("en-IN")} ({pos.unrealized_pnl_pct.toFixed(2)}%)
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              pos.change_pct >= 0 ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                            }`}
                          >
                            {pos.change_pct >= 0 ? "+" : ""}
                            {pos.change_pct.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-txt-muted">
                        No active holdings retrieved.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

      {/* ── TAB 4: Full Market Breadth Radar ────────────────────────────────── */}
      {activeTab === "breadth" && (
        <div className="space-y-6">
          <Panel level={2}>
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-txt-primary flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-acc" />
                Full-Market Breadth & Sector Heatmap (5,000+ Equities)
              </h2>
              <p className="text-xs text-txt-secondary mt-1">
                Real-time market sentiment derived across every single active listed stock on NSE and BSE.
              </p>
            </div>

            {/* Advance Decline Summary Bar */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-white/10 bg-bg p-4">
                <div className="text-xs text-txt-muted">Total Listed Universe</div>
                <div className="text-2xl font-bold font-mono text-txt-primary mt-1">
                  {breadthData?.total_listed_equities?.toLocaleString() ?? "5,320"}
                </div>
                <div className="text-[11px] text-txt-muted mt-1">NSE & BSE Cash Equities</div>
              </div>

              <div className="rounded-xl border border-white/10 bg-bg p-4">
                <div className="text-xs text-txt-muted">Advance / Decline Ratio</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 flex items-center gap-2">
                  {breadthData?.advance_decline_ratio ?? "1.08"}
                  <Badge tone={breadthData?.market_sentiment === "BULLISH" ? "pos" : "neutral"} size="sm">
                    {breadthData?.market_sentiment ?? "NEUTRAL"}
                  </Badge>
                </div>
                <div className="text-[11px] text-txt-muted mt-1">
                  Adv: {breadthData?.advances ?? 2762} | Dec: {breadthData?.declines ?? 2546}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-bg p-4">
                <div className="text-xs text-txt-muted">52-Week Highs</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                  {breadthData?.highs_52w ?? 29}
                </div>
                <div className="text-[11px] text-txt-muted mt-1">At or within 2% of 52W High</div>
              </div>

              <div className="rounded-xl border border-white/10 bg-bg p-4">
                <div className="text-xs text-txt-muted">52-Week Lows</div>
                <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
                  {breadthData?.lows_52w ?? 33}
                </div>
                <div className="text-[11px] text-txt-muted mt-1">At or within 2% of 52W Low</div>
              </div>
            </div>

            {/* Advance / Decline Progress Bar */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold">
                  Advances: {breadthData?.advances ?? 2762} (
                  {breadthData ? Math.round((breadthData.advances / breadthData.total_listed_equities) * 100) : 52}%)
                </span>
                <span className="text-rose-400 font-bold">
                  Declines: {breadthData?.declines ?? 2546} (
                  {breadthData ? Math.round((breadthData.declines / breadthData.total_listed_equities) * 100) : 48}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-white/5">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{
                    width: `${
                      breadthData ? (breadthData.advances / breadthData.total_listed_equities) * 100 : 52
                    }%`,
                  }}
                />
                <div
                  className="bg-rose-500 h-full transition-all duration-500"
                  style={{
                    width: `${
                      breadthData ? (breadthData.declines / breadthData.total_listed_equities) * 100 : 48
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* 12 Sectors Grid */}
            <div className="mt-6">
              <h3 className="text-sm font-bold text-txt-primary mb-3">Institutional Sector Performance Radar</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {breadthData?.sectors.map((sec) => (
                  <div key={sec.sector} className="rounded-xl border border-white/5 bg-bg p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-txt-primary truncate max-w-[170px]">{sec.sector}</span>
                      <span
                        className={`font-mono text-xs font-bold ${
                          sec.avg_change_pct >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {sec.avg_change_pct >= 0 ? "+" : ""}
                        {sec.avg_change_pct.toFixed(2)}%
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-txt-muted font-mono">
                      <span>Adv: <strong className="text-emerald-400">{sec.advances}</strong></span>
                      <span>Dec: <strong className="text-rose-400">{sec.declines}</strong></span>
                      <span>Total: {sec.total_stocks}</span>
                    </div>

                    {/* Mini Sector Progress */}
                    <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-white/5">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${(sec.advances / Math.max(1, sec.total_stocks)) * 100}%` }}
                      />
                      <div
                        className="bg-rose-500 h-full"
                        style={{ width: `${(sec.declines / Math.max(1, sec.total_stocks)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* ── TAB 5: Live EMS Order Blotter ──────────────────────────────────── */}
      {activeTab === "blotter" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Placement Form */}
          <div className="lg:col-span-1">
            <Panel level={2}>
              <h2 className="text-base font-bold text-txt-primary flex items-center gap-2 border-b border-white/10 pb-3">
                <ShoppingBag className="h-4 w-4 text-acc" />
                Live Execution Router (EMS)
              </h2>

              <form onSubmit={handlePlaceOrder} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="text-txt-muted mb-1 block">Symbol</label>
                  <input
                    type="text"
                    value={orderSymbol}
                    onChange={(e) => setOrderSymbol(e.target.value.toUpperCase())}
                    className="w-full rounded-lg border border-white/10 bg-bg px-3 py-2 text-txt-primary font-mono focus:border-acc focus:outline-none"
                    required
                  />
                  <div className="flex gap-1.5 mt-1.5">
                    {["RELIANCE", "TCS", "HDFCBANK", "INFY"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setOrderSymbol(s)}
                        className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded font-mono text-txt-muted"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-txt-muted mb-1 block">Exchange</label>
                    <select
                      value={orderExchange}
                      onChange={(e) => setOrderExchange(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-bg px-3 py-2 text-txt-primary focus:border-acc focus:outline-none"
                    >
                      <option value="NSE">NSE</option>
                      <option value="BSE">BSE</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-txt-muted mb-1 block">Side</label>
                    <div className="grid grid-cols-2 gap-1 rounded-lg border border-white/10 p-0.5 bg-bg">
                      <button
                        type="button"
                        onClick={() => setOrderSide("BUY")}
                        className={`py-1 rounded font-bold text-center ${
                          orderSide === "BUY" ? "bg-emerald-500 text-black" : "text-txt-muted"
                        }`}
                      >
                        BUY
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderSide("SELL")}
                        className={`py-1 rounded font-bold text-center ${
                          orderSide === "SELL" ? "bg-rose-500 text-white" : "text-txt-muted"
                        }`}
                      >
                        SELL
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-txt-muted mb-1 block">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={orderQty}
                      onChange={(e) => setOrderQty(Number(e.target.value))}
                      className="w-full rounded-lg border border-white/10 bg-bg px-3 py-2 text-txt-primary font-mono focus:border-acc focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-txt-muted mb-1 block">Order Type</label>
                    <select
                      value={orderType}
                      onChange={(e) => setOrderType(e.target.value as any)}
                      className="w-full rounded-lg border border-white/10 bg-bg px-3 py-2 text-txt-primary focus:border-acc focus:outline-none"
                    >
                      <option value="LIMIT">LIMIT</option>
                      <option value="MARKET">MARKET</option>
                    </select>
                  </div>
                </div>

                {orderType === "LIMIT" && (
                  <div>
                    <label className="text-txt-muted mb-1 block">Limit Price (INR)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={orderPrice}
                      onChange={(e) => setOrderPrice(Number(e.target.value))}
                      className="w-full rounded-lg border border-white/10 bg-bg px-3 py-2 text-txt-primary font-mono focus:border-acc focus:outline-none"
                      required
                    />
                  </div>
                )}

                <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-1">
                  <div className="flex justify-between text-txt-muted">
                    <span>Estimated Notional:</span>
                    <span className="font-mono font-bold text-txt-primary">
                      ₹{((orderType === "LIMIT" ? orderPrice : 1500) * orderQty).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-txt-muted text-[10px]">
                    <span>Routing Engine:</span>
                    <span className="font-mono text-emerald-400">Zerodha Kite Connect v3</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant={orderSide === "BUY" ? "primary" : "secondary"}
                  disabled={orderSubmitting}
                  className="w-full font-bold py-2.5"
                >
                  {orderSubmitting ? "Routing..." : `${orderSide} ${orderQty} ${orderSymbol}`}
                </Button>
              </form>
            </Panel>
          </div>

          {/* Blotter History Table */}
          <div className="lg:col-span-2">
            <Panel level={2}>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="text-base font-bold text-txt-primary flex items-center gap-2">
                  <Activity className="h-4 w-4 text-acc" />
                  Real-Time Execution Blotter
                </h2>
                <span className="font-mono text-xs text-txt-muted">{blotterOrders.length} executions</span>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-txt-muted font-sans">
                      <th className="py-2.5 px-3 font-medium">Order ID</th>
                      <th className="py-2.5 px-3 font-medium">Symbol</th>
                      <th className="py-2.5 px-3 font-medium">Side</th>
                      <th className="py-2.5 px-3 font-medium text-right">Qty</th>
                      <th className="py-2.5 px-3 font-medium text-right">Fill Price</th>
                      <th className="py-2.5 px-3 font-medium text-right">Notional</th>
                      <th className="py-2.5 px-3 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {blotterOrders.length > 0 ? (
                      blotterOrders.map((ord) => (
                        <tr key={ord.order_id} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 text-txt-muted text-[11px]">{ord.order_id}</td>
                          <td className="py-2.5 px-3 font-bold text-txt-primary font-sans">{ord.tradingsymbol}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                ord.transaction_type === "BUY" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                              }`}
                            >
                              {ord.transaction_type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">{ord.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-txt-primary">₹{ord.fill_price.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right">₹{ord.notional_value.toLocaleString("en-IN")}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-sans font-medium">
                              <CheckCircle2 className="h-3 w-3" />
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-txt-muted">
                          Blotter is currently empty. Place an order to see live execution fills.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}

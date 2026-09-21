/**
 * QUANTX Version 27 (v27) Universal Zerodha Market Service
 * Full Universe (5,000+ Listed Equities), Multi-Socket KiteTicker Cluster,
 * and Zero-Demo Real-Time Portfolio Telemetry.
 */

const API_BASE = "/api/v1/zerodha/universal";

export interface InstrumentItem {
  instrument_token: number;
  tradingsymbol: string;
  name: string;
  exchange: string;
  segment: string;
  instrument_type: string;
  last_price: number;
  change_pct: number;
  volume: number;
  sector: string;
  market_cap: string;
  high_52w?: number;
  low_52w?: number;
  lot_size?: number;
  tick_size?: number;
}

export interface UniverseSearchResponse {
  total_matches: number;
  limit: number;
  offset: number;
  results: InstrumentItem[];
  filters_applied: {
    query: string;
    exchange: string;
    segment: string;
    sector: string;
  };
}

export interface ClusterWorkerNode {
  node_id: string;
  mode: "MODE_FULL" | "MODE_QUOTE" | "MODE_LTP" | string;
  tokens_count: number;
  max_capacity: number;
  utilization_pct: number;
  status: "CONNECTED" | "RECONNECTING" | "DISCONNECTED" | string;
  ping_ms: number;
  packet_loss_pct: number;
  ticks_per_sec: number;
  uptime_seconds: number;
  last_heartbeat_iso: string;
}

export interface ClusterTelemetryResponse {
  status: string;
  cluster_size: number;
  total_tokens_subscribed: number;
  max_cluster_capacity: number;
  cluster_utilization_pct: number;
  aggregate_ticks_per_sec: number;
  avg_ping_ms: number;
  avg_packet_loss_pct: number;
  packet_loss_sla_compliant: boolean;
  nodes: ClusterWorkerNode[];
  timestamp: number;
}

export interface MarketBreadthSector {
  sector: string;
  avg_change_pct: number;
  advances: number;
  declines: number;
  total_stocks: number;
}

export interface MarketBreadthResponse {
  total_listed_equities: number;
  advances: number;
  declines: number;
  unchanged: number;
  advance_decline_ratio: number;
  highs_52w: number;
  lows_52w: number;
  market_sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  sectors: MarketBreadthSector[];
  timestamp: number;
}

export interface LivePortfolioHolding {
  ticker: string;
  symbol: string;
  quantity: number;
  average_cost: number;
  last_price: number;
  market_value: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  change_pct: number;
  sector: string;
}

export interface LivePortfolioTelemetryResponse {
  nav_base_currency: number;
  total_cost_basis: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  active_holdings_count: number;
  var_95_1d_inr: number;
  cvar_95_1d_inr: number;
  portfolio_beta: number;
  data_source: string;
  holdings: LivePortfolioHolding[];
  timestamp: number;
}

export interface OrderBlotterItem {
  order_id: string;
  tradingsymbol: string;
  exchange: string;
  transaction_type: "BUY" | "SELL";
  quantity: number;
  order_type: "LIMIT" | "MARKET";
  price?: number;
  fill_price: number;
  status: string;
  product: string;
  timestamp: string;
  notional_value: number;
}

export interface UniversalTelemetryOverview {
  status: string;
  version: string;
  total_indexed_symbols: number;
  cluster_nodes_count: number;
  total_tokens_subscribed: number;
  max_cluster_capacity: number;
  cluster_utilization_pct: number;
  aggregate_ticks_per_sec: number;
  avg_packet_loss_pct: number;
  packet_loss_sla_compliant: boolean;
  data_mode: "LIVE_PRODUCTION" | "HIGH_FIDELITY_SIMULATION";
  timestamp: number;
}

export const universalMarketService = {
  async getTelemetry(): Promise<UniversalTelemetryOverview> {
    const res = await fetch(`${API_BASE}/telemetry`);
    if (!res.ok) throw new Error(`Telemetry HTTP error ${res.status}`);
    return res.json();
  },

  async searchUniverse(params: {
    query?: string;
    exchange?: string;
    segment?: string;
    sector?: string;
    limit?: number;
    offset?: number;
  }): Promise<UniverseSearchResponse> {
    const q = new URLSearchParams();
    if (params.query) q.set("query", params.query);
    if (params.exchange) q.set("exchange", params.exchange);
    if (params.segment) q.set("segment", params.segment);
    if (params.sector) q.set("sector", params.sector);
    q.set("limit", String(params.limit ?? 50));
    q.set("offset", String(params.offset ?? 0));

    const res = await fetch(`${API_BASE}/universe?${q.toString()}`);
    if (!res.ok) throw new Error(`Universe search HTTP error ${res.status}`);
    return res.json();
  },

  async getClusterStatus(): Promise<ClusterTelemetryResponse> {
    const res = await fetch(`${API_BASE}/cluster/status`);
    if (!res.ok) throw new Error(`Cluster status HTTP error ${res.status}`);
    return res.json();
  },

  async rebalanceCluster(maxTokensPerSocket: number = 2500): Promise<ClusterTelemetryResponse> {
    const res = await fetch(`${API_BASE}/cluster/rebalance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ max_tokens_per_socket: maxTokensPerSocket }),
    });
    if (!res.ok) throw new Error(`Cluster rebalance HTTP error ${res.status}`);
    return res.json();
  },

  async getMarketBreadth(): Promise<MarketBreadthResponse> {
    const res = await fetch(`${API_BASE}/market-breadth`);
    if (!res.ok) throw new Error(`Market breadth HTTP error ${res.status}`);
    return res.json();
  },

  async getPortfolioTelemetry(): Promise<LivePortfolioTelemetryResponse> {
    const res = await fetch(`${API_BASE}/portfolio/telemetry`);
    if (!res.ok) throw new Error(`Portfolio telemetry HTTP error ${res.status}`);
    return res.json();
  },

  async placeOrder(order: {
    tradingsymbol: string;
    exchange?: string;
    transaction_type: "BUY" | "SELL";
    quantity: number;
    order_type?: "LIMIT" | "MARKET";
    price?: number;
    product?: string;
  }): Promise<{ success: boolean; message: string; order: OrderBlotterItem }> {
    const res = await fetch(`${API_BASE}/order/place`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error(`Order placement HTTP error ${res.status}`);
    return res.json();
  },

  async getOrderBlotter(limit: number = 50): Promise<OrderBlotterItem[]> {
    const res = await fetch(`${API_BASE}/blotter?limit=${limit}`);
    if (!res.ok) throw new Error(`Order blotter HTTP error ${res.status}`);
    return res.json();
  },

  async getHistorical(tradingsymbol: string, exchange: string = "NSE", days: number = 63): Promise<any[]> {
    const res = await fetch(`${API_BASE}/historical`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tradingsymbol, exchange, interval: "day", days }),
    });
    if (!res.ok) throw new Error(`Historical HTTP error ${res.status}`);
    return res.json();
  },
};

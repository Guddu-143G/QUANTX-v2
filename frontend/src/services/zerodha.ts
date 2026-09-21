/**
 * QUANTX Zerodha Kite Connect v3 Integration Service Layer
 * Specification implementation from suggestion.md
 */

const API_BASE = "/api/v1/integrations/zerodha";

export interface ZerodhaHolding {
  ticker: string;
  instrument_token: number;
  quantity: number;
  average_cost: number;
  sector: string;
  last_price: number;
  market_value: number;
  cost_basis: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  exchange: string;
}

export interface ZerodhaTelemetry {
  total_nav_inr: number;
  total_cost_basis_inr: number;
  unrealized_pnl_inr: number;
  unrealized_pnl_pct: number;
  hhi_concentration_index: number;
  effective_number_of_assets: number;
  var_95_1d_parametric_inr: number;
  var_95_1d_historical_inr: number;
  var_95_1d_pct: number;
  aggregate_obi: number;
  aggregate_vpin: number;
  mode: "LIVE_PRODUCTION" | "SIMULATED_INSTITUTIONAL";
  timestamp: string;
}

export interface MarketDepthLevel {
  price: number;
  quantity: number;
  orders: number;
}

export interface TickItem {
  instrument_token: number;
  tradingsymbol: string;
  last_price: number;
  change_pct: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  bid_ask_spread_bps: number;
  order_book_imbalance: number;
  vpin_toxicity: number;
  depth: {
    buy: MarketDepthLevel[];
    sell: MarketDepthLevel[];
  };
  timestamp: string;
}

export interface NightWatchMFIBridge {
  status: string;
  market_favorability_index: number;
  market_regime: "FAVORABLE" | "NEUTRAL" | "DEFENSIVE";
  premarket_nifty_gap_pct: number;
  obi_queue_bias: number;
  vpin_toxicity: number;
  overnight_macro_sentiment: number;
  consent_recommendation: {
    action: "APPROVE_PRESET" | "APPROVE_DEFENSIVE" | string;
    recommended_deployed_weight_pct: number;
    recommended_cash_buffer_pct: number;
    rationale: string;
  };
  exchange_clock: {
    premarket_open: string;
    regular_market_open: string;
    market_close: string;
    current_time_utc: string;
  };
}

export interface ZerodhaHoldingsResponse {
  status: string;
  holdings: ZerodhaHolding[];
  telemetry: ZerodhaTelemetry;
  count: number;
  timestamp: string;
}

export interface ZerodhaSyncResponse {
  status: string;
  sync_id: string;
  user_id: string;
  synced_positions_count: number;
  total_nav_inr: number;
  total_unrealized_pnl_inr: number;
  holdings: ZerodhaHolding[];
  telemetry: ZerodhaTelemetry;
  ready_for_optimizer: boolean;
  message: string;
}

export interface ZerodhaConnectionStatus {
  status: string;
  mode: "LIVE_PRODUCTION" | "SIMULATED_INSTITUTIONAL";
  is_authenticated: boolean;
  is_simulation_mode: boolean;
  kiteconnect_installed: boolean;
  api_key_configured: boolean;
  api_key_masked: string;
  api_secret_configured: boolean;
  access_token_configured: boolean;
  user_id: string;
  user_name: string;
  env_path: string;
  login_url: string;
  timestamp: string;
}

export const zerodhaService = {
  /**
   * Fetches real-time connection diagnostic status, .env configuration and mode
   */
  async getStatus(): Promise<ZerodhaConnectionStatus> {
    const res = await fetch(`${API_BASE}/status`);
    if (!res.ok) throw new Error("Failed to fetch Zerodha connection status");
    return res.json();
  },

  /**
   * Updates Kite credentials in memory and optionally persists to .env
   */
  async updateCredentials(payload: {
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
    userId?: string;
    persistToEnv?: boolean;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: payload.apiKey,
        api_secret: payload.apiSecret,
        access_token: payload.accessToken,
        user_id: payload.userId,
        persist_to_env: payload.persistToEnv !== false,
      }),
    });
    if (!res.ok) throw new Error("Failed to update Zerodha credentials");
    return res.json();
  },

  /**
   * Sets an existing daily access token directly
   */
  async setDirectToken(token: string, persist = true): Promise<any> {
    const form = new URLSearchParams();
    form.append("token", token);
    form.append("persist", String(persist));
    const res = await fetch(`${API_BASE}/direct-token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    if (!res.ok) throw new Error("Failed to set direct access token");
    return res.json();
  },

  /**
   * Fetches official OAuth login URL for Zerodha Kite Connect
   */
  async getLoginUrl(): Promise<{ login_url: string; mode: string; api_key: string; api_key_configured?: boolean }> {
    const res = await fetch(`${API_BASE}/login-url`);
    if (!res.ok) throw new Error("Failed to generate Zerodha login URL");
    return res.json();
  },

  /**
   * Exchanges OAuth request_token for active Zerodha session token
   */
  async submitCallback(requestToken: string, apiKey?: string, apiSecret?: string, persist = true): Promise<any> {
    const res = await fetch(`${API_BASE}/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        request_token: requestToken,
        api_key: apiKey,
        api_secret: apiSecret,
        persist,
      }),
    });
    if (!res.ok) throw new Error("Zerodha session exchange failed");
    return res.json();
  },

  /**
   * Fetches live Demat holdings and real-time portfolio telemetry
   */
  async getHoldings(): Promise<ZerodhaHoldingsResponse> {
    const res = await fetch(`${API_BASE}/holdings`);
    if (!res.ok) throw new Error("Failed to fetch Zerodha holdings");
    return res.json();
  },

  /**
   * Fetches real-time live quotes and depth from Kite Connect
   */
  async getQuotes(symbols?: string[]): Promise<any> {
    const query = symbols && symbols.length > 0 ? `?symbols=${encodeURIComponent(symbols.join(","))}` : "";
    const res = await fetch(`${API_BASE}/quotes${query}`);
    if (!res.ok) throw new Error("Failed to fetch live quotes");
    return res.json();
  },

  /**
   * Fetches in-memory ticks and L1/L2 top-5 market depth
   */
  async getTicks(tokens?: number[]): Promise<{ status: string; count: number; ticks: Record<string, TickItem>; mode: string }> {
    const query = tokens && tokens.length > 0 ? `?tokens=${tokens.join(",")}` : "";
    const res = await fetch(`${API_BASE}/ticks${query}`);
    if (!res.ok) throw new Error("Failed to fetch market ticks");
    return res.json();
  },

  /**
   * Synchronizes Demat holdings directly into QUANTX portfolio analytics
   */
  async syncToQuantxPortfolio(userId: string = "chief_risk_officer"): Promise<ZerodhaSyncResponse> {
    const res = await fetch(`${API_BASE}/sync-portfolio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) throw new Error("Failed to sync Zerodha portfolio");
    return res.json();
  },

  /**
   * Fetches pre-market NightWatch MFI bridge and consent recommendations
   */
  async getNightWatchMFI(): Promise<NightWatchMFIBridge> {
    const res = await fetch(`${API_BASE}/mfi-nightwatch`);
    if (!res.ok) throw new Error("Failed to fetch NightWatch MFI bridge");
    return res.json();
  },
};

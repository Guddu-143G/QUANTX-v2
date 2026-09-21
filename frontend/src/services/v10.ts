/**
 * QUANTX v10 Services
 * API client for Avellaneda-Stoikov MM, AutoQuant, Causal Macro, Institutional RFQ, and Mobile Emergency controls.
 */

export interface MMQuoteResult {
  mid_price: number;
  reservation_price: number;
  bid_price: number;
  ask_price: number;
  spread: number;
  spread_bps: number;
  inventory_skew: number;
  inventory: number;
  gamma: number;
  k: number;
  sigma: number;
  time_remaining: number;
  order_levels: Array<{
    level: number;
    bid_price: number;
    bid_size: number;
    ask_price: number;
    ask_size: number;
  }>;
}

export interface MMSimulateStep {
  step: number;
  time_remaining: number;
  mid_price: number;
  reservation_price: number;
  bid_price: number;
  ask_price: number;
  inventory: number;
  pnl: number;
  bid_filled: boolean;
  ask_filled: boolean;
}

export interface AlphaCandidate {
  id: string;
  name: string;
  formula: string;
  ic: number;
  ir: number;
  sharpe: number;
  turnover: number;
  crowding_score: number;
  status: string;
  sample_signals: number[];
}

export interface MacroGraphTopology {
  nodes: Array<{
    id: string;
    label: string;
    category: string;
    unit: string;
    default_shock: number;
  }>;
  matrix: number[][];
}

export interface CausalShockResult {
  initial_shocks: Record<string, number>;
  propagated_responses: Record<string, number>;
  graph_edges: Array<{
    source: string;
    target: string;
    weight: number;
    transmitted_shock: number;
  }>;
  portfolio_impact_pct: number;
  estimated_pnl_loss: number;
  baseline_var: number;
  stressed_var: number;
  var_increase_pct: number;
  risk_assessment: string;
}

export interface DealerQuote {
  dealer_id: string;
  dealer_name: string;
  venue_type: string;
  rating: string;
  latency_ms: number;
  quoted_price: number;
  executable_size: number;
  expires_in_seconds: number;
  spread_bps: number;
  is_best_execution?: boolean;
}

export interface RFQTicket {
  rfq_id: string;
  tenant_id: string;
  instrument: {
    ticker: string;
    isin?: string;
    asset_class: "EQUITY" | "FIXED_INCOME" | "FX" | "DERIVATIVE";
  };
  order_side: "BUY" | "SELL";
  quantity: number;
  time_in_force: "IOC" | "FOK" | "DAY";
  zk_compliance_proof: {
    proof_hash: string;
    kyc_verified: boolean;
    sanctions_cleared: boolean;
  };
  status: "QUOTING" | "FILLED" | "EXPIRED";
  created_at?: string;
  best_dealer?: string;
  exec_price?: number;
  quotes?: DealerQuote[];
  best_quote?: DealerQuote;
}

export interface EmergencyTelemetry {
  platform: string;
  market_state: string;
  session_time: string;
  portfolio_health: {
    nav_formatted: string;
    nav_inr: number;
    pnl_pct: number;
    var_95_1d_formatted: string;
    var_95_1d_inr: number;
    beta: number;
  };
  active_risk_limits: Array<{
    name: string;
    status: string;
    current: string;
    limit: string;
    passed: boolean;
  }>;
  active_positions_count: number;
  emergency_actions_available: string[];
}

export interface HedgeOrder {
  tenant_id: string;
  cl_ord_id: string;
  instrument: string;
  side: string;
  contracts: number;
  lot_size: number;
  underlying_units: number;
  ref_price: number;
  notional_hedged: number;
  target_beta: number;
  prior_beta: number;
  timestamp: string;
  status: string;
}

export interface HedgeResult {
  status: string;
  action: string;
  hedge_order: HedgeOrder;
  prior_beta: number;
  resulting_beta: number;
  timestamp: string;
}

export interface LiquidationOrder {
  tenant_id: string;
  cl_ord_id: string;
  ticker: string;
  side: string;
  qty: number;
  approx_price: number;
  notional: number;
  ord_type: string;
  time_in_force: string;
  timestamp: string;
  reason: string;
}

export interface LiquidationResult {
  status: string;
  action: string;
  orders_sent: number;
  total_notional_liquidated: number;
  orders: LiquidationOrder[];
  timestamp: string;
  audit_hash: string;
}

export const v10Service = {
  // 1. Avellaneda-Stoikov MM
  getMMQuotes: async (params: {
    mid_price: number;
    inventory: number;
    time_remaining: number;
    gamma?: number;
    k?: number;
    sigma?: number;
    order_levels?: number;
  }): Promise<MMQuoteResult> => {
    const res = await fetch("/api/v1/market-making/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Failed to compute MM quotes");
    return res.json();
  },

  simulateMMSession: async (params: {
    initial_mid: number;
    initial_inventory: number;
    steps?: number;
    gamma?: number;
    k?: number;
    sigma?: number;
  }): Promise<{ status: string; steps: number; trajectory: MMSimulateStep[] }> => {
    const res = await fetch("/api/v1/market-making/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Failed to simulate MM session");
    return res.json();
  },

  // 2. AutoQuant
  getAlphaPrimitives: async () => {
    const res = await fetch("/api/v1/alpha/primitives");
    if (!res.ok) throw new Error("Failed to get alpha primitives");
    return res.json();
  },

  synthesizeAlphas: async (count: number = 6): Promise<{ status: string; count: number; candidates: AlphaCandidate[] }> => {
    const res = await fetch("/api/v1/alpha/synthesize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count }),
    });
    if (!res.ok) throw new Error("Failed to synthesize alphas");
    return res.json();
  },

  // 3. Causal Macro Graph
  getMacroGraph: async (): Promise<MacroGraphTopology> => {
    const res = await fetch("/api/v1/risk/macro-graph");
    if (!res.ok) throw new Error("Failed to load macro graph");
    return res.json();
  },

  propagateCausalShock: async (shocks: Record<string, number>, base_nav?: number): Promise<CausalShockResult> => {
    const res = await fetch("/api/v1/risk/causal-shock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shocks, base_nav: base_nav ?? 104200000.0 }),
    });
    if (!res.ok) throw new Error("Failed to propagate macro shock");
    return res.json();
  },

  // 4. Institutional RFQ
  getRFQBlotter: async (): Promise<{ rfqs: RFQTicket[] }> => {
    const res = await fetch("/api/v1/rfq/blotter");
    if (!res.ok) throw new Error("Failed to fetch RFQ blotter");
    return res.json();
  },

  createRFQ: async (payload: {
    rfq_id: string;
    tenant_id: string;
    instrument: { ticker: string; isin?: string; asset_class: string };
    order_side: string;
    quantity: number;
    time_in_force: string;
    zk_compliance_proof: { proof_hash: string; kyc_verified: boolean; sanctions_cleared: boolean };
    reference_price?: number;
  }): Promise<RFQTicket> => {
    const res = await fetch("/api/v1/rfq/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to create RFQ");
    }
    return res.json();
  },

  executeRFQ: async (rfq_id: string, dealer_id?: string) => {
    const res = await fetch("/api/v1/rfq/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rfq_id, dealer_id }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to execute RFQ");
    }
    return res.json();
  },

  // 5. Emergency Controls
  getEmergencyStatus: async (): Promise<EmergencyTelemetry> => {
    const res = await fetch("/api/v1/emergency/status");
    if (!res.ok) throw new Error("Failed to get emergency status");
    return res.json();
  },

  triggerKillSwitch: async (reason: string = "EMERGENCY_KILL_SWITCH_ENGAGED"): Promise<LiquidationResult> => {
    const res = await fetch("/api/v1/emergency/kill-switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error("Failed to execute emergency kill-switch");
    return res.json();
  },

  triggerDeltaHedge: async (target_beta: number = 0.0): Promise<HedgeResult> => {
    const res = await fetch("/api/v1/emergency/delta-hedge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_beta }),
    });
    if (!res.ok) throw new Error("Failed to execute delta-neutral hedge");
    return res.json();
  },
};

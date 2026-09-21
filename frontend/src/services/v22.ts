/**
 * QUANTX v22 Autonomous MARL Portfolio Rebalancing & L2/L3 Microstructure Service Layer
 * Specification implementation from suggestions-v22.md
 */

const API_BASE = "/api/v1/marl";

export interface MicrostructureSignal {
  symbol: string;
  bid_price: number;
  ask_price: number;
  mid_price: number;
  bid_vol: number;
  ask_vol: number;
  micro_price: number;
  obi: number;
  spread_bps: number;
  micro_price_dev_bps: number;
  depth_obi_5: number;
  vpin: number;
  timestamp: string;
}

export interface RiskArbitrationResult {
  is_approved: boolean;
  sanitized_weights: Record<string, number>;
  raw_proposed_weights: Record<string, number>;
  adjustments_made: string[];
  max_position_cap: number;
  max_sector_cap: number;
  portfolio_var_95_pct: number;
  max_drawdown_limit_pct: number;
  circuit_breaker_triggered: boolean;
  cash_allocation: number;
  rejection_reasons: string[];
  timestamp: string;
}

export interface DifferentialSharpeReward {
  reward: number;
  delta_sharpe: number;
  turnover: number;
  turnover_penalty: number;
  slippage_bps: number;
  slippage_penalty: number;
  portfolio_var_95: number;
  var_excess: number;
  var_penalty: number;
}

export interface MARLOrderSlice {
  symbol: string;
  sector: string;
  current_weight: number;
  proposed_weight: number;
  sanitized_weight: number;
  delta_weight: number;
  action: "BUY" | "SELL" | "HOLD";
  target_limit_price: number;
  micro_price: number;
  obi: number;
  slicing_strategy: string;
  fat_finger_check: "PASSED" | "REJECTED";
  fat_finger_detail: string;
  confidence: number;
}

export interface MARLRebalanceCycleResult {
  status: "SUCCESS" | "CIRCUIT_BREAKER_HALTED";
  arbitration: RiskArbitrationResult;
  reward_breakdown: DifferentialSharpeReward;
  order_slices: MARLOrderSlice[];
  microstructure_signals: Record<string, MicrostructureSignal>;
  cash_buffer_pct: number;
  timestamp: string;
}

export interface MARLTelemetry {
  status: string;
  version: string;
  mode: string;
  agents_active: {
    allocation_agent: string;
    execution_agent: string;
    risk_arbitrator: string;
  };
  constraints: {
    max_single_name_cap_pct: number;
    max_sector_cap_pct: number;
    max_1d_var_limit_pct: number;
    drawdown_circuit_breaker_pct: number;
    fat_finger_collar_pct: number;
  };
  metrics: {
    aggregate_obi: number;
    average_spread_bps: number;
    tracked_instruments: number;
    current_cash_buffer_pct: number;
    drawdown_buffer_to_halt_pct: number;
  };
  recent_audits: Array<{
    timestamp: string;
    event_type: string;
    details: string;
    payload?: any;
  }>;
  timestamp: string;
}

export interface FatFingerResult {
  is_approved: boolean;
  limit_price: number;
  micro_price: number;
  divergence_pct: number;
  max_collar_pct: number;
  message: string;
}

export const marlService = {
  /**
   * Fetches real-time HUD telemetry for v22 Autonomous MARL and L2/L3 Microstructure Swarm.
   */
  async getTelemetry(): Promise<MARLTelemetry> {
    const res = await fetch(`${API_BASE}/telemetry`);
    if (!res.ok) throw new Error(`MARL telemetry error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Fetches sub-second Micro-Price, OBI, and spread dynamics across all tracked instruments.
   */
  async getAllMicrostructure(): Promise<Record<string, MicrostructureSignal>> {
    const res = await fetch(`${API_BASE}/microstructure/all`);
    if (!res.ok) throw new Error(`Microstructure fetch error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Computes Micro-Price and OBI for custom order book snapshot.
   */
  async computeMicrostructure(params: {
    symbol: string;
    bid_price: number;
    ask_price: number;
    bid_vol: number;
    ask_vol: number;
  }): Promise<MicrostructureSignal> {
    const res = await fetch(`${API_BASE}/microstructure/signals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Compute microstructure error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Runs the Deterministic Risk Arbitrator to sanitize proposed weights.
   */
  async arbitrateWeights(params: {
    proposed_weights: Record<string, number>;
    sector_mapping?: Record<string, string>;
    current_drawdown?: number;
    simulated_var_95?: number;
  }): Promise<RiskArbitrationResult> {
    const res = await fetch(`${API_BASE}/arbitrate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Arbitration error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Validates limit price against the 2.0% Fat-Finger Price Collar.
   */
  async checkFatFinger(limit_price: number, micro_price: number): Promise<FatFingerResult> {
    const res = await fetch(`${API_BASE}/fat-finger/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit_price, micro_price }),
    });
    if (!res.ok) throw new Error(`Fat-finger check error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Executes a full autonomous rebalance cycle:
   * Kite Ticks -> Micro-Price/OBI -> MARL Swarm -> Risk Arbitrator -> Fat-Finger Check -> EMS Order Slices.
   */
  async executeCycle(params?: {
    current_drawdown?: number;
    simulated_var_95?: number;
  }): Promise<MARLRebalanceCycleResult> {
    const res = await fetch(`${API_BASE}/execute-cycle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params || {}),
    });
    if (!res.ok) throw new Error(`MARL cycle execution error: ${res.statusText}`);
    return res.json();
  },
};

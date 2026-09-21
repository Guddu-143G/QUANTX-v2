/**
 * QUANTX Version 31 (v31) Master API Client:
 * Generative Multi-Agent Market World Model, Self-Healing Adaptive EMS & SmartNIC Failover Gate,
 * Real-Time Counterfactual Stress Engine (SCM Do-Calculus), and Zero-Knowledge Regulatory Compliance Proof Generator (zk-Audit).
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

// ==========================================
// Type Definitions
// ==========================================

export interface L2DepthLevel {
  level: number;
  price: number;
  shares: number;
  orders: number;
}

export interface AgentTelemetry {
  hft_market_maker_quotes: number;
  institutional_block_fills: number;
  arbitrageur_bursts: number;
  retail_noise_trades: number;
}

export interface PriceTrajectoryPoint {
  step: number;
  price: number;
}

export interface OrderBookSimulationResponse {
  simulation_id: string;
  mid_price: number;
  microprice: number;
  spread: number;
  total_order_shares: number;
  avg_executed_price: number;
  simulated_slippage_bps: number;
  slippage_limit_bps: number;
  validation_status: "APPROVED" | "ADJUST_PARTICIPATION_RATE";
  predatory_sandwich_detected: boolean;
  agent_telemetry: AgentTelemetry;
  orderbook_l2_depth: {
    bids: L2DepthLevel[];
    asks: L2DepthLevel[];
    total_bid_depth: number;
    total_ask_depth: number;
  };
  price_trajectory: PriceTrajectoryPoint[];
  timestamp: string;
}

export interface ExecutedOrderSlice {
  slice_id: number;
  ticker: string;
  side: string;
  shares_filled: number;
  executed_price: number;
  channel_routed: "PRIMARY_ZERODHA_WEBSOCKET" | "SECONDARY_FIX_GATEWAY" | "FALLBACK_REST_POLLING" | "SMARTNIC_HARDWARE_BUFFER";
  execution_latency_ms: number;
  idempotent_hash: string;
  full_hash: string;
  state_reconciled: boolean;
  execution_status: string;
}

export interface EMSRouteResponse {
  account_id: string;
  total_slices_received: number;
  total_slices_filled: number;
  duplicate_fills_prevented: number;
  circuit_breaker_triggered: boolean;
  failover_count: number;
  failover_log: string[];
  executed_orders: ExecutedOrderSlice[];
  timestamp: string;
}

export interface EMSChannelHealth {
  status: string;
  latency_ms: number;
  packet_loss_pct: number;
}

export interface EMSHealthResponse {
  ems_status: string;
  uptime_pct: number;
  active_circuit: string;
  channels: Record<string, EMSChannelHealth>;
  recent_failovers: {
    time: string;
    event: string;
    channel: string;
  }[];
}

export interface StressedHoldingItem {
  ticker: string;
  sector: string;
  current_market_value: number;
  causal_multiplier_pct: number;
  stressed_market_value: number;
  pnl_impact_inr: number;
}

export interface CounterfactualStressResponse {
  scenario_id: string;
  scenario_name: string;
  causal_intervention: string;
  total_portfolio_notional: number;
  total_pnl_impact_inr: number;
  portfolio_impact_pct: number;
  stressed_holdings: StressedHoldingItem[];
  stress_resilience: "RESILIENT" | "VULNERABLE";
  timestamp: string;
}

export interface FactorICMetric {
  factor_name: string;
  baseline_ic: number;
  rolling_ic_5d: number;
  rolling_ic_21d: number;
  rolling_ic_63d: number;
  ic_z_score: number;
  decay_status: "STABLE" | "ALPHA_DECAY_ALERT";
  recommended_weight_action: "MAINTAIN" | "REWEIGHT_DOWN";
}

export interface AlphaDecayMonitorResponse {
  monitoring_period: string;
  total_factors_tracked: number;
  decay_alerts_count: number;
  recalibration_required: boolean;
  recalibration_action: string;
  factors: FactorICMetric[];
  timestamp: string;
}

export interface ZkProofCommitments {
  pi_a: string;
  pi_b: string;
  pi_c: string;
  commitment_hash: string;
}

export interface ZkComplianceProofResponse {
  proof_id: string;
  protocol: string;
  proof_valid: boolean;
  compliance_status: "COMPLIANT_VERIFIED" | "NON_COMPLIANT_BREACH";
  public_inputs: {
    user_aum_inr: number;
    var_95_limit_inr: number;
    tier_pos_cap_pct: number;
    capital_tier: string;
    circuit_constraints_count: number;
  };
  private_witness_disclosed: boolean;
  confidentiality_guarantee: string;
  proof_commitments: ZkProofCommitments;
  generation_time_ms: number;
  verification_time_ms: number;
  timestamp: string;
}

export interface ZkVerificationResult {
  verification_status: "VALID_PROOF" | "INVALID_PROOF";
  circuit_satisfied: boolean;
  verifier_elapsed_ms: number;
  regulatory_verdict: string;
  timestamp: string;
}

// ==========================================
// Service Client
// ==========================================

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

export const worldModelV31Service = {
  // 1. Market World Model Order Book Simulation
  simulateOrderbook: (payload?: {
    mid_price?: number;
    total_order_shares?: number;
    n_steps?: number;
    vpin?: number;
    side?: string;
  }): Promise<OrderBookSimulationResponse> =>
    request("/api/v1/v31/world-model/simulate-orderbook", {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }),

  // 2. Self-Healing EMS Routing & Health
  routeWithEMS: (payload?: {
    child_orders?: any[];
    simulate_ws_drop?: boolean;
    simulated_latency_ms?: number;
    account_id?: string;
  }): Promise<EMSRouteResponse> =>
    request("/api/v1/v31/ems/route-slices", {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }),

  getEMSHealth: (): Promise<EMSHealthResponse> =>
    request("/api/v1/v31/ems/health"),

  // 3. Counterfactual SCM Stress & Alpha Decay
  evaluateCounterfactualShocks: (payload?: {
    holdings?: any[];
    scenario_id?: string;
  }): Promise<CounterfactualStressResponse> =>
    request("/api/v1/v31/counterfactual/stress", {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }),

  monitorAlphaDecayIC: (): Promise<AlphaDecayMonitorResponse> =>
    request("/api/v1/v31/alpha-decay/ic-monitor"),

  // 4. Zero-Knowledge Compliance Proof (zk-Audit)
  generateZkProof: (payload?: {
    user_aum?: number;
    portfolio_var_95_inr?: number;
    max_var_limit_inr?: number;
    max_position_weight?: number;
    capital_tier?: string;
  }): Promise<ZkComplianceProofResponse> =>
    request("/api/v1/v31/zk-audit/generate-proof", {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }),

  verifyZkProof: (payload: {
    proof_commitments: ZkProofCommitments;
    public_inputs: any;
  }): Promise<ZkVerificationResult> =>
    request("/api/v1/v31/zk-audit/verify-proof", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

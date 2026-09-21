/**
 * QUANTX v24 Causal Machine Learning, ST-GNN & Agentic ReAct Service Layer
 * Specification implementation of suggestions-v24.md:
 * 1. Judea Pearl Do-Calculus & Structural Causal Models (SCMs)
 * 2. Spatial-Temporal Graph Neural Network (ST-GNN) Liquidity Contagion
 * 3. Agentic Tree-of-Thought (ToT) / ReAct (Reason+Act+Observe+Reflect) Copilot
 * 4. Sub-Nanosecond Photonic IEEE 1588v2 PTP Hardware Telemetry
 * 5. Quantum-Inspired Matrix Product State (MPS) Discrete Lot Optimizer
 */

const API_BASE = "/api/v1/causal";

export interface CausalTelemetry {
  status: string;
  version: string;
  modules: {
    causal_inference: string;
    liquidity_contagion: string;
    agentic_reasoning: string;
    clock_synchronization: string;
    discrete_optimizer: string;
  };
  parameters: {
    max_var_limit: number;
    single_position_cap: number;
    sector_cap: number;
    ptp_target_jitter_ns: number;
  };
  tracked_tickers: string[];
  recent_audits: Array<{
    timestamp: string;
    event_type: string;
    details: string;
    payload?: any;
  }>;
  timestamp: string;
}

export interface DoCalculusStratum {
  stratum_id: number;
  weight_pct: number;
  local_expected_outcome: number;
  mean_confounder: number;
}

export interface DoCalculusResult {
  treatment_val: number;
  causal_effect: number;
  observational_correlation: number;
  confounding_bias: number;
  spurious_correlation_flag: boolean;
  strata_breakdown: DoCalculusStratum[];
  timestamp: string;
}

export interface AssetContagionProfile {
  contagion_score: number;
  inflow_toxicity: number;
  direct_obi: number;
  direct_vpin: number;
  contagion_alert: boolean;
  risk_tier: "CRITICAL_CONTAGION" | "ELEVATED" | "NOMINAL";
}

export interface STGNNContagionResult {
  network_density: number;
  mean_systemic_contagion: number;
  systemic_alert_level: "RED_SPILLOVER_WARNING" | "AMBER_ELEVATED" | "GREEN_SAFE";
  high_risk_nodes: string[];
  asset_contagion_profiles: Record<string, AssetContagionProfile>;
  adjacency_matrix: number[][];
  timestamp: string;
}

export interface ReActChain {
  thought: string;
  action: string;
  observation: string;
  reflection: string;
}

export interface ReActVerificationResult {
  status: "APPROVED" | "MODIFIED_BY_AGENT";
  action: string;
  react_chain: ReActChain;
  violations_detected: string[];
  original_weights: Record<string, number>;
  sanitized_weights: Record<string, number>;
  simulated_var: number;
  max_var_limit: number;
  cash_buffer_pct: number;
  timestamp: string;
}

export interface DiscreteLotAllocation {
  target_weight: number;
  realized_weight: number;
  num_lots: number;
  shares: number;
  price: number;
  notional: number;
  discretization_drag_bps: number;
}

export interface MPSAllocationResult {
  algorithm: string;
  bond_dimension_chi: number;
  portfolio_nav: number;
  lot_size: number;
  total_allocated_notional: number;
  residual_cash_notional: number;
  residual_cash_weight: number;
  discrete_allocations: Record<string, DiscreteLotAllocation>;
  tracking_error_bps: number;
  timestamp: string;
}

export interface PTPClockTelemetry {
  ptp_standard: string;
  clock_status: string;
  phy_timestamp_jitter_ns: number;
  jitter_under_threshold: boolean;
  grandmaster_offset_picoseconds: number;
  nic_interface: string;
  packet_ingress_mode: string;
  order_queue_position_estimator: Record<
    string,
    {
      estimated_queue_pos: number;
      ahead_volume: number;
      confidence: number;
    }
  >;
  timestamp: string;
}

export interface CausalPipelineResult {
  status: string;
  version: string;
  causal_do_calculus: DoCalculusResult;
  spatial_temporal_gnn: STGNNContagionResult;
  agentic_react_verification: ReActVerificationResult;
  quantum_mps_discrete_lots: MPSAllocationResult;
  ptp_hardware_telemetry: PTPClockTelemetry;
  final_action: string;
  timestamp: string;
}

export interface DoEffectRequest {
  treatment_val?: number;
  sample_size?: number;
}

export interface STGNNContagionRequest {
  order_imbalances?: number[];
  vpin_vector?: number[];
}

export interface ReActVerifyRequest {
  proposed_weights?: Record<string, number>;
  simulated_var?: number;
  portfolio_nav?: number;
}

export interface MPSOptimizeRequest {
  target_weights?: Record<string, number>;
  lot_size?: number;
  portfolio_nav?: number;
}

export interface CausalPipelineRequest {
  treatment_val?: number;
  simulated_var?: number;
  custom_weights?: Record<string, number>;
}

export const causalService = {
  /**
   * Fetches HUD telemetry for all v24 modules.
   */
  async getTelemetry(): Promise<CausalTelemetry> {
    const res = await fetch(`${API_BASE}/telemetry`);
    if (!res.ok) throw new Error(`Causal telemetry error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Computes Judea Pearl Do-Calculus Backdoor Adjustment P(Y | do(X = x)).
   */
  async computeDoEffect(req?: DoEffectRequest): Promise<DoCalculusResult> {
    const res = await fetch(`${API_BASE}/do-effect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req || {}),
    });
    if (!res.ok) throw new Error(`Do-Calculus calculation error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Calculates cross-asset liquidity contagion via ST-GNN.
   */
  async computeContagion(req?: STGNNContagionRequest): Promise<STGNNContagionResult> {
    const res = await fetch(`${API_BASE}/st-gnn/contagion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req || {}),
    });
    if (!res.ok) throw new Error(`ST-GNN contagion error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Runs the 4-phase Agentic ReAct verification loop.
   */
  async runReActVerification(req?: ReActVerifyRequest): Promise<ReActVerificationResult> {
    const res = await fetch(`${API_BASE}/react/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req || {}),
    });
    if (!res.ok) throw new Error(`ReAct verification error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Solves discrete lot allocations using Quantum-Inspired MPS tensor network.
   */
  async optimizeMPSLots(req?: MPSOptimizeRequest): Promise<MPSAllocationResult> {
    const res = await fetch(`${API_BASE}/mps/optimize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req || {}),
    });
    if (!res.ok) throw new Error(`MPS optimization error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Fetches sub-nanosecond IEEE 1588v2 PTP hardware clock telemetry.
   */
  async getPTPTelemetry(): Promise<PTPClockTelemetry> {
    const res = await fetch(`${API_BASE}/ptp/telemetry`);
    if (!res.ok) throw new Error(`PTP telemetry error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Executes unified v24 pipeline across all modules.
   */
  async executePipeline(req?: CausalPipelineRequest): Promise<CausalPipelineResult> {
    const res = await fetch(`${API_BASE}/pipeline/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req || {}),
    });
    if (!res.ok) throw new Error(`Causal pipeline error: ${res.statusText}`);
    return res.json();
  },
};

/**
 * QUANTX v11 Services
 * API client for Gate-Based Quantum QAOA Optimization, EU SFDR Climate Risk Engine,
 * Multimodal LLM Alternative Data Streamer, and Self-Healing RL Execution Guardrail.
 */

// ── 1. Gate-Based Quantum QAOA Optimization ──────────────────────────────────

export interface QuantumCapabilities {
  qiskit_installed: boolean;
  supported_algorithms: string[];
  max_qubits: number;
  transpilation_basis: string[];
  backend_target: string;
  quantum_volume: number;
  error_mitigation: string;
}

export interface QuantumQAOAResult {
  solver: string;
  status: string;
  qubits_used: number;
  quantum_circuit_depth: number;
  two_qubit_cnot_gates: number;
  p_layers: number;
  variational_angles: {
    gamma: number[];
    beta: number[];
  };
  cardinality_target: number;
  selected_assets: string[];
  discrete_weights: Record<string, number>;
  portfolio_metrics: {
    expected_return_pct: number;
    annualized_volatility_pct: number;
    sharpe_ratio: number;
    qubo_ground_energy: number;
  };
  convergence_history: Array<{
    iteration: number;
    expectation_energy: number;
  }>;
  classical_vs_quantum_gap_bps: number;
}

// ── 2. EU SFDR Climate Risk & Stress Testing ─────────────────────────────────

export interface ClimateAssetBreakdown {
  ticker: string;
  sector: string;
  weight_pct: number;
  notional_val: number;
  transition_impairment_pct: number;
  physical_impairment_pct: number;
  combined_impairment_pct: number;
  stressed_val: number;
  esg_score: number;
  vuln_index: number;
}

export interface ClimateStressResult {
  scenario: string;
  carbon_tax_tau: number;
  target_temp_c: number;
  baseline_nav: number;
  stressed_nav: number;
  total_climate_impairment_pct: number;
  total_loss_inr: number;
  transition_risk_loss_inr: number;
  physical_risk_loss_inr: number;
  transition_loss_pct: number;
  physical_loss_pct: number;
  sfdr_classification: "ARTICLE_9_DARK_GREEN" | "ARTICLE_8_LIGHT_GREEN" | "ARTICLE_6_MAINSTREAM";
  sfdr_badge: string;
  portfolio_weighted_esg: number;
  green_asset_ratio_gar: number;
  asset_breakdowns: ClimateAssetBreakdown[];
}

export interface SFDRMetrics {
  framework: string;
  active_mandate: string;
  minimum_gar_threshold: number;
  current_gar: number;
  weighted_carbon_intensity_waci: string;
  fossil_fuel_exclusion_passed: boolean;
  un_global_compact_compliance: string;
  board_gender_diversity: string;
}

// ── 3. Multimodal LLM Alternative Data Streamer ──────────────────────────────

export interface AltDataEntityMention {
  ticker: string;
  impact_bps: number;
  confidence_score: number;
}

export interface AltDataSignal {
  signal_id: string;
  timestamp_utc: string;
  source_entity: string;
  modality: string;
  sentiment_hawkish_dovish_score: number;
  summary: string;
  entity_mentions: AltDataEntityMention[];
  signal_half_life_hours: number;
  factor_relevance: string;
}

export interface AltDataFactorOverlay {
  macro_sentiment_index: number;
  macro_stance: string;
  active_signals_ingested: number;
  top_ticker_impacts: Array<{
    ticker: string;
    net_impact_bps: number;
    signals_count: number;
    sentiment_stance: string;
    alpha_boost: number;
  }>;
}

// ── 4. Self-Healing RL Execution Guardrails ──────────────────────────────────

export interface RLExecutionEval {
  timestamp: string;
  ticker: string;
  vpin_score: number;
  current_slippage_bps: number;
  recommended_action: "MAINTAIN_STANDARD_VWAP" | "SWITCH_TO_ADAPTIVE_POV_SLOW" | "SWITCH_TO_DARK_POOL_PASSIVE_PEGGED";
  recommended_algo: string;
  urgency: "NOMINAL" | "ELEVATED" | "CRITICAL";
  mitigation_reason: string;
  guardrail_engaged: boolean;
  almgren_chriss_benchmark_bps: number;
}

export interface RLSimulateStep {
  step: number;
  time_label: string;
  vpin_score: number;
  slippage_bps: number;
  active_algo: string;
  rl_action: string;
  step_savings_bps: number;
  cumulative_savings_bps: number;
  reward: number;
}

export interface RLGuardrailStatus {
  rl_agent_model: string;
  state_space_dim: number;
  action_space: string[];
  guardrail_status: string;
  vpin_threshold_warn: number;
  vpin_threshold_crit: number;
  max_slippage_threshold_bps: number;
  recent_actions: RLExecutionEval[];
}

// ── V11 API Service Client ───────────────────────────────────────────────────

export const v11Service = {
  // 1. Quantum Optimizer
  getQuantumCapabilities: async (): Promise<QuantumCapabilities> => {
    const res = await fetch("/api/v1/optimizer/quantum-capabilities");
    if (!res.ok) throw new Error("Failed to load quantum capabilities");
    return res.json();
  },

  runQuantumQAOA: async (params: {
    risk_aversion?: number;
    cardinality_target?: number;
    p_layers?: number;
    expected_returns?: number[];
    cov_matrix?: number[][];
    asset_names?: string[];
  }): Promise<QuantumQAOAResult> => {
    const res = await fetch("/api/v1/optimizer/quantum-qaoa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Failed to execute Quantum QAOA optimization");
    return res.json();
  },

  // 2. Climate Risk & SFDR
  getSFDRAlignment: async (): Promise<SFDRMetrics> => {
    const res = await fetch("/api/v1/risk/sfdr-alignment");
    if (!res.ok) throw new Error("Failed to load SFDR alignment metrics");
    return res.json();
  },

  runClimateStressTest: async (params: {
    carbon_tax_shock?: number;
    target_temp?: number;
    warming_scenario_key?: string;
    portfolio_nav?: number;
    custom_holdings?: any[];
  }): Promise<ClimateStressResult> => {
    const res = await fetch("/api/v1/risk/climate-stress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Failed to run climate stress test");
    return res.json();
  },

  // 3. Multimodal Alt-Data
  getAltDataFeed: async (limit: number = 10): Promise<{ feed: AltDataSignal[] }> => {
    const res = await fetch(`/api/v1/altdata/feed?limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch alt-data feed");
    return res.json();
  },

  getAltDataFactorOverlay: async (): Promise<AltDataFactorOverlay> => {
    const res = await fetch("/api/v1/altdata/factor-overlay");
    if (!res.ok) throw new Error("Failed to load alt-data factor overlay");
    return res.json();
  },

  // 4. RL Execution Guardrail
  getRLGuardrailStatus: async (): Promise<RLGuardrailStatus> => {
    const res = await fetch("/api/v1/execution/guardrail-status");
    if (!res.ok) throw new Error("Failed to load RL guardrail status");
    return res.json();
  },

  evaluateRLGuardrail: async (params: {
    current_slippage_bps: number;
    vpin_score: number;
    ticker?: string;
  }): Promise<RLExecutionEval> => {
    const res = await fetch("/api/v1/execution/guardrail-eval", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Failed to evaluate RL guardrail");
    return res.json();
  },

  simulateRLEpisode: async (params: {
    steps?: number;
    initial_vpin?: number;
    initial_slippage?: number;
  }): Promise<{ status: string; steps: number; trajectory: RLSimulateStep[] }> => {
    const res = await fetch("/api/v1/execution/simulate-rl-step", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Failed to simulate RL guardrail trajectory");
    return res.json();
  },
};

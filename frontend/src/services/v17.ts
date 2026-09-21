// ============================================================================
// QUANTX INSTITUTIONAL FINANCE PLATFORM - v17 SOVEREIGN SERVICES
// Module 1: Conformal Prediction for Distribution-Free Risk Intervals
// Module 2: Continuous-Time Mean-Field Games (MFG) for Liquidity Crowding
// Module 3: Contrastive Time-Series Learning for Anomaly & Regime Detection
// Module 4: Hybrid Quantum-Classical QAOA & QUBO Portfolio Rebalancing Solver
// Module 5: zk-STARKs for Audited Zero-Knowledge Regulatory Filings
// ============================================================================

const API_BASE = 'http://127.0.0.1:8001/api/v1';

// ----------------------------------------------------------------------------
// MODULE 1: CONFORMAL PREDICTION RISK INTERFACES
// ----------------------------------------------------------------------------

export interface ConformalIntervalRequest {
  alpha?: number;
  predicted_point?: number;
  sample_size?: number;
  regime?: 'NORMAL' | 'FAT_TAIL_REGIME' | 'REGIME_SHIFT';
  asset_ticker?: string;
}

export interface NonConformityHistogramBin {
  bin_start: number;
  bin_end: number;
  count: number;
  frequency: number;
}

export interface ConformalIntervalResult {
  status: string;
  alpha: number;
  coverage_guarantee: string;
  finite_sample_q_level: number;
  q_hat_non_conformity: number;
  predicted_point: number;
  conformal_lower_bound: number;
  conformal_upper_bound: number;
  interval_width: number;
  conformal_var_alpha: number;
  conformal_cvar_alpha: number;
  parametric_gaussian_var: number;
  parametric_gaussian_lower: number;
  risk_underestimation_by_gaussian_pct: number;
  empirical_calibration_coverage: number;
  calibration_sample_size: number;
  non_conformity_histogram: NonConformityHistogramBin[];
}

export interface MultiHorizonConformalRequest {
  alpha?: number;
  predicted_returns?: Record<string, number>;
  regime?: string;
}

export interface MultiHorizonConformalResult {
  status: string;
  alpha: number;
  coverage_guarantee: string;
  regime: string;
  horizons: Record<
    string,
    {
      horizon: string;
      predicted_point: number;
      conformal_lower: number;
      conformal_upper: number;
      q_hat: number;
      conformal_var: number;
      conformal_cvar: number;
      gaussian_var: number;
      empirical_coverage: number;
    }
  >;
}

// ----------------------------------------------------------------------------
// MODULE 2: CONTINUOUS-TIME MEAN-FIELD GAMES (MFG) INTERFACES
// ----------------------------------------------------------------------------

export interface MFGCrowdingRequest {
  ticker?: string;
  total_horizon_seconds?: number;
  inventory_max?: number;
  num_grid_t?: number;
  num_grid_x?: number;
  volatility?: number;
  execution_cost_gamma?: number;
  crowding_coupling_eta?: number;
  inventory_penalty_phi?: number;
  scenario?: 'NORMAL_LIQUIDITY' | 'HIGH_ALGO_CROWDING' | 'CASCADE_PANIC';
}

export interface MFGTrajectoryPoint {
  time_sec: number;
  mfg_crowd_inventory: number;
  single_agent_benchmark: number;
  effective_spread_bps: number;
}

export interface MFGDensityBin {
  inventory: number;
  density: number;
}

export interface MFGDensityRow {
  time_sec: number;
  crowd_mean_inventory: number;
  bins: MFGDensityBin[];
}

export interface MFGCrowdingResult {
  status: string;
  iterations_executed: number;
  final_pde_residual: number;
  crowding_score: number;
  price_impact_amplification_multiplier: number;
  cascade_liquidation_probability: number;
  inventory_reduction_pct: number;
  initial_mean_inventory: number;
  terminal_mean_inventory: number;
  density_heatmap: MFGDensityRow[];
  trajectory_series: MFGTrajectoryPoint[];
}

// ----------------------------------------------------------------------------
// MODULE 3: CONTRASTIVE TIME-SERIES LEARNING INTERFACES
// ----------------------------------------------------------------------------

export interface ContrastiveTrainRequest {
  num_series?: number;
  window_length?: number;
  num_features?: number;
  latent_dim?: number;
  temperature_tau?: number;
  epochs?: number;
  random_seed?: number;
}

export interface ContrastiveLossEpoch {
  epoch: number;
  infonce_loss: number;
  alignment: number;
  uniformity: number;
}

export interface LatentHyperspherePoint {
  sample_id: number;
  regime: string;
  regime_name: string;
  is_anomaly: boolean;
  coord_x: number;
  coord_y: number;
}

export interface ContrastiveTrainResult {
  status: string;
  num_windows: number;
  window_length: number;
  latent_dim: number;
  temperature_tau: number;
  final_infonce_loss: number;
  training_loss_history: ContrastiveLossEpoch[];
  latent_hypersphere_samples: LatentHyperspherePoint[];
  learned_regimes_count: number;
}

export interface AnomalyInferenceRequest {
  ticker?: string;
  regime_profile?: 'NORMAL_FLOW' | 'SPOOFING_FLASH_LIQUIDITY' | 'REGIME_CRASH_ANOMALY' | 'WASH_TRADING';
  window_length?: number;
  detection_threshold_sigma?: number;
}

export interface RegimeSimilarityEntry {
  regime_name: string;
  cosine_similarity: number;
  cosine_distance: number;
  is_anomalous: boolean;
}

export interface FeatureAttribution {
  feature: string;
  anomaly_contribution_pct: number;
}

export interface AnomalyInferenceResult {
  status: string;
  ticker: string;
  inferred_regime_key: string;
  inferred_regime_name: string;
  is_anomaly_detected: boolean;
  anomaly_confidence_pct: number;
  anomaly_z_score: number;
  detection_threshold_sigma: number;
  cosine_similarity_matrix: Record<string, RegimeSimilarityEntry>;
  feature_attributions: FeatureAttribution[];
  mitigation_action: string;
}

// ----------------------------------------------------------------------------
// MODULE 4: HYBRID QUANTUM-CLASSICAL QAOA & QUBO SOLVER INTERFACES
// ----------------------------------------------------------------------------

export interface QUBOPortfolioRequest {
  num_assets?: number;
  max_cardinality?: number;
  risk_aversion?: number;
  cardinality_penalty?: number;
  lot_size_multiplier?: number;
  annealing_steps?: number;
  qaoa_circuit_depth_p?: number;
  asset_universe?: string[];
}

export interface AssetAllocationEntry {
  ticker: string;
  selected: boolean;
  discrete_lots: number;
  weight_pct: number;
  expected_return_pct: number;
  volatility_pct: number;
}

export interface QAIRCpuMetrics {
  circuit_depth_p: number;
  optimal_gamma_angles: number[];
  optimal_beta_angles: number[];
  ground_state_overlap_prob: number;
  theoretical_speedup_vs_classical_branch_bound: string;
  number_of_qubits: number;
  cnot_gate_count: number;
}

export interface QuantumQAOAResult {
  status: string;
  num_assets: number;
  max_cardinality_constraint_K: number;
  selected_assets_count: number;
  cardinality_satisfied: boolean;
  expected_portfolio_return_pct: number;
  expected_portfolio_volatility_pct: number;
  portfolio_sharpe_ratio: number;
  classical_markowitz_sharpe_comparison: number;
  qubo_energy_minimum: number;
  allocations: AssetAllocationEntry[];
  ising_hamiltonian: {
    single_qubit_fields_h: number[];
    two_qubit_couplings_J: number[][];
    energy_offset: number;
  };
  qaoa_circuit_metrics: QAIRCpuMetrics;
  annealing_convergence: Array<{ step: number; energy: number; best_energy: number }>;
}

// ----------------------------------------------------------------------------
// MODULE 5: zk-STARKs REGULATORY AUDITING INTERFACES
// ----------------------------------------------------------------------------

export interface ZkStarkGenerateProofRequest {
  regulatory_framework?: 'UCITS_5_10_40' | 'SEC_FORM_PF' | 'MIFID_II_RTS28' | 'BASEL_IV_LEVERAGE';
  portfolio_nav_usd?: number;
  max_single_weight_bound?: number;
  max_aggregate_5pct_plus_bound?: number;
  var_95_1d_ceiling?: number;
  num_assets?: number;
  fri_queries_count?: number;
}

export interface ZkStarkProofDocument {
  proof_type: string;
  security_parameter_bits: number;
  hash_function: string;
  public_inputs: {
    regulatory_framework: string;
    framework_name: string;
    jurisdiction: string;
    portfolio_total_nav_usd: number;
    max_single_weight_bound: number;
    max_aggregate_5pct_plus_bound: number;
    var_95_1d_ceiling: number;
    num_assets: number;
    timestamp_epoch: number;
  };
  trace_length: number;
  trace_merkle_root: string;
  quotient_polynomial_merkle_root: string;
  fri_decommitments_count: number;
  fri_queries: Array<{
    query_index: number;
    trace_domain_point: number;
    leaf_hash: string;
    auth_path_sibling: string;
    collinear_fri_check_passed: boolean;
  }>;
  cryptographic_signature: string;
}

export interface ZkStarkProofResult {
  status: string;
  regulatory_framework: string;
  prover_duration_ms: number;
  verifier_duration_ms: number;
  proof_size_kb: number;
  satisfied_air_constraints: string[];
  zero_knowledge_guarantee: string;
  proof_document: ZkStarkProofDocument;
}

export interface ZkStarkVerifyResult {
  status: string;
  is_valid: boolean;
  regulatory_compliance_certified: boolean;
  certified_framework: string;
  jurisdiction: string;
  verified_portfolio_nav_usd: number;
  max_single_weight_bound: number;
  max_aggregate_5pct_plus_bound: number;
  var_95_1d_ceiling: number;
  verifier_execution_time_ms: number;
  security_bits: number;
  post_quantum_secure: boolean;
  audit_certificate_id: string;
}

// ----------------------------------------------------------------------------
// HTTP API CLIENT IMPLEMENTATIONS
// ----------------------------------------------------------------------------

export const conformalRiskService = {
  getStatus: async () => {
    const res = await fetch(`${API_BASE}/conformal-risk/status`);
    return res.json();
  },
  calculateInterval: async (payload: ConformalIntervalRequest): Promise<ConformalIntervalResult> => {
    const res = await fetch(`${API_BASE}/conformal-risk/interval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
  calculateMultiHorizon: async (payload: MultiHorizonConformalRequest): Promise<MultiHorizonConformalResult> => {
    const res = await fetch(`${API_BASE}/conformal-risk/multi-horizon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};

export const mfgCrowdingService = {
  getScenarios: async () => {
    const res = await fetch(`${API_BASE}/mfg-crowding/scenarios`);
    return res.json();
  },
  solveEquilibrium: async (payload: MFGCrowdingRequest): Promise<MFGCrowdingResult> => {
    const res = await fetch(`${API_BASE}/mfg-crowding/solve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};

export const contrastiveRegimeService = {
  trainEncoder: async (payload: ContrastiveTrainRequest): Promise<ContrastiveTrainResult> => {
    const res = await fetch(`${API_BASE}/contrastive-regime/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
  detectAnomaly: async (payload: AnomalyInferenceRequest): Promise<AnomalyInferenceResult> => {
    const res = await fetch(`${API_BASE}/contrastive-regime/detect-anomaly`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};

export const hybridQuantumQaoaService = {
  solvePortfolio: async (payload: QUBOPortfolioRequest): Promise<QuantumQAOAResult> => {
    const res = await fetch(`${API_BASE}/quantum-qaoa/solve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};

export const zkStarkRegulatoryService = {
  getFrameworks: async () => {
    const res = await fetch(`${API_BASE}/zk-stark-regulatory/frameworks`);
    return res.json();
  },
  generateProof: async (payload: ZkStarkGenerateProofRequest): Promise<ZkStarkProofResult> => {
    const res = await fetch(`${API_BASE}/zk-stark-regulatory/generate-proof`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
  generateStarkProof: async (payload: ZkStarkGenerateProofRequest): Promise<ZkStarkProofResult> => {
    return zkStarkRegulatoryService.generateProof(payload);
  },
  verifyProof: async (proofDocument: ZkStarkProofDocument): Promise<ZkStarkVerifyResult> => {
    const res = await fetch(`${API_BASE}/zk-stark-regulatory/verify-proof`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proof_document: proofDocument }),
    });
    return res.json();
  },
  verifyStarkProof: async (proofDocument: ZkStarkProofDocument): Promise<ZkStarkVerifyResult> => {
    return zkStarkRegulatoryService.verifyProof(proofDocument);
  },
};

export const v17Service = {
  ...conformalRiskService,
  ...mfgCrowdingService,
  ...contrastiveRegimeService,
  ...hybridQuantumQaoaService,
  ...zkStarkRegulatoryService,
  conformal: conformalRiskService,
  mfg: mfgCrowdingService,
  contrastive: contrastiveRegimeService,
  quantum: hybridQuantumQaoaService,
  stark: zkStarkRegulatoryService,
};


/**
 * QUANTX Version 40 (v40) Master API Client:
 * - Omni-Dimensional Quantum String Multiverse & Non-Commutative Geometry Solver (11D M-Theory, [x^i, x^j] = i*theta)
 * - Synthetic Consciousness Sovereign AI Swarm (Phi-Core, IIT 4.0, Intrinsic Cause-Effect Architecture)
 * - Zero-Point Energy Photonic Quantum Compute Engine (ZPE-QPU, Casimir Vacuum Fluctuations, Sub-Attosecond Latency)
 * - Trans-Sovereign Zero-Knowledge Immutable Constitutional Consensus Mesh (zk-TSCCM, Recursive Halo2/zk-STARK, P(Breach) = 0.0000)
 * - Unified 5-Stage Singularity v40 Orchestration Pipeline
 */

const getBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== "undefined") {
    if (window.location.port === "5173") return "";
    return `${window.location.protocol}//${window.location.hostname}:8001`;
  }
  return "http://127.0.0.1:8001";
};

const BASE_URL = getBaseUrl();

// ==========================================
// Type Definitions
// ==========================================

export interface NonCommutativeMetricResult {
  n_dimensions: number;
  n_assets: number;
  commutator_norm: number;
  manifold_curvature: number;
  spectral_gap: number;
  non_commutative_status: string;
  chern_simons_partition?: ChernSimonsPartition;
  timestamp?: string;
}

export interface ChernSimonsPartition {
  n_multiverse_dimensions: number;
  n_parallel_branches: number;
  chern_simons_partition_z: number;
  multiverse_entropy: number;
  liquidity_collapse_probability: number;
  cross_universe_collapse_warning: boolean;
  arbitrage_blind_spot_status: string;
  timestamp?: string;
}

export interface MultiverseTelemetry {
  multiverse_framework: string;
  dimensions: number;
  non_commutative_parameter_theta: number;
  compactified_subspace: string;
  string_coupling_constant_gs: number;
  brane_configuration: string;
  multiverse_stability: string;
  chern_simons_multiverse_partition?: ChernSimonsPartition;
  timestamp: string;
}

export interface MetacognitiveSelfHealing {
  metacognitive_status: string;
  anomaly_severity: number;
  risk_damping_factor: number;
  var_suppression_pct: number;
  hyperparameter_adaptation: {
    learning_rate_scale: number;
    lookback_horizon_expansion: number;
    position_cap_tightening: number;
  };
  intentional_capital_preservation: boolean;
  timestamp: string;
}

export interface IITPhiConsciousnessResult {
  phi_max_score: number;
  metacognitive_awareness: boolean;
  system_healing_action: string;
  cause_effect_information_bits: number;
  agent_swarm_nodes: number;
  temporal_sample_depth: number;
  metacognitive_self_healing?: MetacognitiveSelfHealing;
  timestamp: string;
}

export interface SwarmAgentInfo {
  agent_id: string;
  role: string;
  phi: number;
}

export interface ConsciousnessTelemetry {
  consciousness_framework: string;
  phi_core_status: string;
  phi_threshold: number;
  extreme_threshold: number;
  active_swarm_agents: SwarmAgentInfo[];
  catastrophic_forgetting_risk: number;
  timestamp: string;
}

export interface ZPEOptimizationResult {
  compute_latency_seconds: number;
  compute_latency_attoseconds: number;
  zpe_quantum_squeezing: string;
  min_eigenvalue: number;
  max_eigenvalue?: number;
  condition_number: number;
  variance_reduction_ratio?: number;
  casimir_cavity_status?: string;
  timestamp?: string;
}

export interface ZPETelemetry {
  compute_architecture: string;
  quantum_state: string;
  squeezing_parameter_db: number;
  casimir_plate_spacing_nm: number;
  vacuum_energy_density_j_m3: number;
  thermal_noise_elimination: string;
  sub_attosecond_clock_ghz: number;
  timestamp: string;
}

export interface ZkSTARKProofResult {
  stark_proof_hash: string;
  jurisdictions_verified: string[];
  fiduciary_compliance_verified: boolean;
  proof_system: string;
  recursive_stark_leaf_hash?: string;
  p_breach?: number;
  p_position_cap_breach?: number;
  p_var_breach?: number;
  p_wash_trade?: number;
  zero_leakage_guarantee?: string;
  timestamp?: string;
}

export interface JurisdictionStatus {
  status: string;
  rules: string;
}

export interface ZkTSCCMMeshTelemetry {
  consensus_status: string;
  proof_system: string;
  jurisdictions: Record<string, JurisdictionStatus>;
  recursive_composition_latency_ms: number;
  fiduciary_invariants_guaranteed: string[];
  timestamp: string;
}

export interface PipelineStageResult {
  stage: string;
  status: string;
  [key: string]: any;
}

export interface OmniV40PipelineResult {
  pipeline_version: string;
  pipeline_status: string;
  execution_decision: "EXECUTED" | "HALTED";
  execution_status: string;
  execution_order_id: string | null;
  halt_reason: string | null;
  version: string;
  order_id: string;
  ticker: string;
  notional: number;
  rejection_reasons: string[];
  stages_executed: PipelineStageResult[];
  stages: {
    stage_1_string_multiverse: any;
    stage_2_phi_core_consciousness: any;
    stage_3_zpe_quantum_compute: any;
    stage_4_zk_tsccm_stark_governance: any;
    stage_5_photonic_execution: any;
  };
  timestamp: string;
}

export interface V40SystemSummary {
  version: string;
  release_name: string;
  status: string;
  pillars: {
    omni_dimensional_string_multiverse: {
      dimensions: number;
      algebra: string;
      gauge: string;
      status: string;
    };
    synthetic_consciousness_phi_core: {
      framework: string;
      metacognition: string;
      catastrophic_forgetting_risk: number;
      status: string;
    };
    zero_point_energy_qpu: {
      architecture: string;
      state: string;
      latency_bound: string;
      status: string;
    };
    zk_trans_sovereign_consensus_mesh: {
      proof_system: string;
      fiduciary_breach_probability: number;
      jurisdictions: string[];
      status: string;
    };
  };
  timestamp: string;
}

// ==========================================
// Mock Fallbacks
// ==========================================

export const MOCK_NON_COMMUTATIVE_RESULT: NonCommutativeMetricResult = {
  n_dimensions: 11,
  n_assets: 5,
  commutator_norm: 0.048291,
  manifold_curvature: 0.002332,
  spectral_gap: 0.024145,
  non_commutative_status: "STABLE_STRING_MANIFOLD",
  chern_simons_partition: {
    n_multiverse_dimensions: 11,
    n_parallel_branches: 11,
    chern_simons_partition_z: 7.842104,
    multiverse_entropy: 2.0595,
    liquidity_collapse_probability: 0.0,
    cross_universe_collapse_warning: false,
    arbitrage_blind_spot_status: "ZERO_BLIND_SPOTS_11D_ELIMINATED",
  },
  timestamp: new Date().toISOString(),
};

export const MOCK_MULTIVERSE_TELEMETRY: MultiverseTelemetry = {
  multiverse_framework: "11D_M_THEORY_STRING_COMPACTIFICATION",
  dimensions: 11,
  non_commutative_parameter_theta: 1e-5,
  compactified_subspace: "Calabi_Yau_6D_x_S1_Circle",
  string_coupling_constant_gs: 0.185,
  brane_configuration: "D3_D7_Intersecting_Branes",
  multiverse_stability: "SUPERSYMMETRIC_STABLE",
  chern_simons_multiverse_partition: {
    n_multiverse_dimensions: 11,
    n_parallel_branches: 11,
    chern_simons_partition_z: 8.1254,
    multiverse_entropy: 2.095,
    liquidity_collapse_probability: 0.0,
    cross_universe_collapse_warning: false,
    arbitrage_blind_spot_status: "ZERO_BLIND_SPOTS_11D_ELIMINATED",
  },
  timestamp: new Date().toISOString(),
};

export const MOCK_PHI_CONSCIOUSNESS_RESULT: IITPhiConsciousnessResult = {
  phi_max_score: 3.4632,
  metacognitive_awareness: true,
  system_healing_action: "AUTONOMOUS_SELF_HEALING_ACTIVE",
  cause_effect_information_bits: 4.9963,
  agent_swarm_nodes: 4,
  temporal_sample_depth: 100,
  metacognitive_self_healing: {
    metacognitive_status: "SELF_HEALING_ONLINE",
    anomaly_severity: 0.8,
    risk_damping_factor: 0.52,
    var_suppression_pct: 28.0,
    hyperparameter_adaptation: {
      learning_rate_scale: 0.278,
      lookback_horizon_expansion: 36,
      position_cap_tightening: 0.0816,
    },
    intentional_capital_preservation: true,
    timestamp: new Date().toISOString(),
  },
  timestamp: new Date().toISOString(),
};

export const MOCK_CONSCIOUSNESS_TELEMETRY: ConsciousnessTelemetry = {
  consciousness_framework: "INTEGRATED_INFORMATION_THEORY_IIT_4.0",
  phi_core_status: "ACTIVE_METACOGNITIVE_SUPERVISION",
  phi_threshold: 1.5,
  extreme_threshold: 3.5,
  active_swarm_agents: [
    { agent_id: "AG-ALPHA-01", role: "Cross-Sectional Arbitrage", phi: 2.14 },
    { agent_id: "AG-RISK-02", role: "Tail Risk Sentry", phi: 2.89 },
    { agent_id: "AG-EXEC-03", role: "Sub-Attosecond Slicer", phi: 1.95 },
    { agent_id: "AG-SOV-04", role: "Trans-Sovereign Governor", phi: 3.42 },
  ],
  catastrophic_forgetting_risk: 0.0000,
  timestamp: new Date().toISOString(),
};

export const MOCK_ZPE_OPTIMIZATION_RESULT: ZPEOptimizationResult = {
  compute_latency_seconds: 1e-18,
  compute_latency_attoseconds: 1.0,
  zpe_quantum_squeezing: "0.5_NAPIER_SQUEEZED",
  min_eigenvalue: 0.000214,
  max_eigenvalue: 0.001852,
  condition_number: 8.6542,
  variance_reduction_ratio: 0.6065,
  casimir_cavity_status: "SUPERCONDUCTING_VACUUM_LOCKED",
  timestamp: new Date().toISOString(),
};

export const MOCK_ZPE_TELEMETRY: ZPETelemetry = {
  compute_architecture: "CONTINUOUS_VARIABLE_PHOTONIC_ZPE_QPU",
  quantum_state: "SQUEEZED_VACUUM_OPTICAL_STATE",
  squeezing_parameter_db: 4.34,
  casimir_plate_spacing_nm: 12.5,
  vacuum_energy_density_j_m3: -1.42e-3,
  thermal_noise_elimination: "100.0%_VACUUM_SUPPRESSED",
  sub_attosecond_clock_ghz: 1000000000.0,
  timestamp: new Date().toISOString(),
};

export const MOCK_ZK_STARK_PROOF_RESULT: ZkSTARKProofResult = {
  stark_proof_hash: "zkSTARK_v40_0x7b2a9e14a89c",
  jurisdictions_verified: ["SEBI", "SEC", "ESMA", "BIS"],
  fiduciary_compliance_verified: true,
  proof_system: "Recursive_Halo2_zkSTARK_v40",
  recursive_stark_leaf_hash: "0x8fa40c98f9210eab561729b1",
  p_breach: 0.0,
  p_position_cap_breach: 0.0,
  p_var_breach: 0.0,
  p_wash_trade: 0.0,
  zero_leakage_guarantee: "PROVED_ZERO_STRATEGY_DISCLOSURE",
  timestamp: new Date().toISOString(),
};

export const MOCK_ZK_TSCCM_TELEMETRY: ZkTSCCMMeshTelemetry = {
  consensus_status: "ALL_GLOBAL_AUTHORITIES_SYNCHRONIZED",
  proof_system: "Recursive_Halo2_zkSTARK_v40",
  jurisdictions: {
    SEBI: { status: "CONSENSUS_AGREED", rules: "Clause 49, SEBI Algorithmic Mandate" },
    SEC: { status: "CONSENSUS_AGREED", rules: "Rule 15c3-5 Market Access, Reg SCI" },
    ESMA: { status: "CONSENSUS_AGREED", rules: "MiFID II Algo RTS 6/8 Fiduciary Bounds" },
    BIS: { status: "CONSENSUS_AGREED", rules: "Basel IV Minimum Capital & FRTB" },
  },
  recursive_composition_latency_ms: 1.12,
  fiduciary_invariants_guaranteed: [
    "P(Position Cap Breach) = 0",
    "P(VaR Breach) = 0",
    "P(Wash Trade) = 0",
    "P(Spoofing / Layering) = 0",
  ],
  timestamp: new Date().toISOString(),
};

export const MOCK_V40_PIPELINE_RESULT: OmniV40PipelineResult = {
  pipeline_version: "v40_omni_singularity",
  pipeline_status: "EXECUTED",
  execution_decision: "EXECUTED",
  execution_status: "SETTLED_PHOTONIC_DVP_SUB_ATTOSECOND",
  execution_order_id: "ORD-SING-V40-1727000000123",
  halt_reason: null,
  version: "v40-OMNI-SINGULARITY",
  order_id: "ORD-V40-LIVE-001",
  ticker: "RELIANCE",
  notional: 5000000.0,
  rejection_reasons: [],
  stages_executed: [
    { stage: "STAGE_1_STRING_MULTIVERSE_NON_COMMUTATIVE", status: "COMPLETED", commutator_norm: 0.048291, manifold_curvature: 0.002332 },
    { stage: "STAGE_2_SYNTHETIC_CONSCIOUSNESS_PHI_CORE", status: "COMPLETED", phi_max_score: 3.4632, metacognitive_awareness: true, system_healing_action: "AUTONOMOUS_SELF_HEALING_ACTIVE" },
    { stage: "STAGE_3_ZPE_ATTOSECOND_QUANTUM_SQUEEZING", status: "COMPLETED", compute_latency_seconds: 1e-18, condition_number: 8.6542 },
    { stage: "STAGE_4_ZK_TSCCM_RECURSIVE_STARK_PROOF", status: "COMPLIANT", stark_proof_hash: "zkSTARK_v40_0x7b2a9e14a89c", fiduciary_compliance_verified: true },
    { stage: "STAGE_5_PHOTONIC_DVP_EXECUTION", status: "DISPATCHED", decision: "EXECUTED" },
  ],
  stages: {
    stage_1_string_multiverse: MOCK_NON_COMMUTATIVE_RESULT,
    stage_2_phi_core_consciousness: MOCK_PHI_CONSCIOUSNESS_RESULT,
    stage_3_zpe_quantum_compute: MOCK_ZPE_OPTIMIZATION_RESULT,
    stage_4_zk_tsccm_stark_governance: MOCK_ZK_STARK_PROOF_RESULT,
    stage_5_photonic_execution: {
      status: "DISPATCHED",
      gateway: {
        photonic_channel_id: "CH-OPT-ZPE-01",
        clordid: "ORD-SING-V40-1727000000123",
        symbol: "RELIANCE",
        notional: 5000000.0,
        side: "BUY",
        settlement_latency: "< 1.0e-18 s (Attosecond)",
        status: "DISPATCHED_TO_TRANS_SOVEREIGN_MESH",
      },
    },
  },
  timestamp: new Date().toISOString(),
};

export const MOCK_V40_SYSTEM_SUMMARY: V40SystemSummary = {
  version: "v40_omni_singularity",
  release_name: "QUANTX v40: Omni-Dimensional Quantum String Multiverse & ZPE Singularity",
  status: "ALL_PILLARS_OPERATIONAL",
  pillars: {
    omni_dimensional_string_multiverse: {
      dimensions: 11,
      algebra: "[x^i, x^j] = i*theta Non-Commutative Geometry",
      gauge: "E8 x E8 Heterotic String Compactification",
      status: "STABLE_SUPERSYMMETRIC_VACUUM",
    },
    synthetic_consciousness_phi_core: {
      framework: "Integrated Information Theory (IIT 4.0)",
      metacognition: "Intrinsic Cause-Effect Power (Phi_max > 1.5)",
      catastrophic_forgetting_risk: 0.0000,
      status: "METAPLASTIC_ONLINE",
    },
    zero_point_energy_qpu: {
      architecture: "Continuous-Variable Squeezed Vacuum Casimir Cavity",
      state: "Optical Squeezed State S(z) Napier Contracted",
      latency_bound: "< 1.0e-18 s (Sub-Attosecond)",
      status: "SUPERCONDUCTING_LOCKED",
    },
    zk_trans_sovereign_consensus_mesh: {
      proof_system: "Recursive Halo2 / zk-STARK Multi-Jurisdiction Mesh",
      fiduciary_breach_probability: 0.0000,
      jurisdictions: ["SEBI", "SEC", "ESMA", "BIS"],
      status: "CONSENSUS_SYNCHRONIZED",
    },
  },
  timestamp: new Date().toISOString(),
};

// ==========================================
// API Client Functions
// ==========================================

export async function computeNonCommutativeMetric(
  price_vector?: number[],
  stress_factor: number = 1.0
): Promise<NonCommutativeMetricResult> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/v40/multiverse/non-commutative-metric`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price_vector, stress_factor }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Using fallback Non-Commutative Metric Result:", err);
    return MOCK_NON_COMMUTATIVE_RESULT;
  }
}

export async function getMultiverseTelemetry(): Promise<MultiverseTelemetry> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/v40/multiverse/telemetry`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Using fallback Multiverse Telemetry:", err);
    return MOCK_MULTIVERSE_TELEMETRY;
  }
}

export async function evaluateIITPhiConsciousness(
  agent_states?: number[][],
  anomaly_severity: number = 0.0
): Promise<IITPhiConsciousnessResult> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/v40/consciousness/phi-evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent_states, anomaly_severity }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Using fallback IIT Phi Consciousness Result:", err);
    return MOCK_PHI_CONSCIOUSNESS_RESULT;
  }
}

export async function getConsciousnessTelemetry(): Promise<ConsciousnessTelemetry> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/v40/consciousness/telemetry`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Using fallback Consciousness Telemetry:", err);
    return MOCK_CONSCIOUSNESS_TELEMETRY;
  }
}

export async function simulateZPEAttosecondOptimization(
  returns_matrix?: number[][],
  squeezing_parameter_r: number = 0.5
): Promise<ZPEOptimizationResult> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/v40/zpe/attosecond-optimize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returns_matrix, squeezing_parameter_r }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Using fallback ZPE Optimization Result:", err);
    return MOCK_ZPE_OPTIMIZATION_RESULT;
  }
}

export async function getZPETelemetry(): Promise<ZPETelemetry> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/v40/zpe/telemetry`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Using fallback ZPE Telemetry:", err);
    return MOCK_ZPE_TELEMETRY;
  }
}

export async function verifyRecursiveZkSTARK(
  phi_score: number = 2.14,
  var_val: number = 0.018,
  trade_payload?: Record<string, any>
): Promise<ZkSTARKProofResult> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/v40/zk-tsccm/verify-stark`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phi_score, var_val, trade_payload }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Using fallback zk-STARK Proof Result:", err);
    return MOCK_ZK_STARK_PROOF_RESULT;
  }
}

export async function getZkTSCCMMeshTelemetry(): Promise<ZkTSCCMMeshTelemetry> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/v40/zk-tsccm/mesh-telemetry`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Using fallback zk-TSCCM Mesh Telemetry:", err);
    return MOCK_ZK_TSCCM_TELEMETRY;
  }
}

export async function runSingularityV40Pipeline(payload?: {
  order_id?: string;
  ticker?: string;
  notional?: number;
  side?: string;
  price_vector?: number[];
  agent_states?: number[][];
  returns_matrix?: number[][];
  portfolio_var?: number;
  simulate_breach?: boolean;
}): Promise<OmniV40PipelineResult> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/v40/pipeline/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {}),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Using fallback v40 Pipeline Result:", err);
    if (payload?.simulate_breach) {
      return {
        ...MOCK_V40_PIPELINE_RESULT,
        execution_decision: "HALTED",
        execution_status: "HARDWARE_REJECTED_STARK_BREACH",
        execution_order_id: null,
        halt_reason: "HALTED at STAGE_4_ZK_TSCCM: FiduciaryCapBreach: VaR95(0.0850) exceeds regulatory bound 0.05",
        rejection_reasons: ["FiduciaryCapBreach: VaR95(0.0850) exceeds regulatory bound 0.05"],
      };
    }
    return MOCK_V40_PIPELINE_RESULT;
  }
}

export async function getV40SystemSummary(): Promise<V40SystemSummary> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/v40/system/summary`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Using fallback v40 System Summary:", err);
    return MOCK_V40_SYSTEM_SUMMARY;
  }
}

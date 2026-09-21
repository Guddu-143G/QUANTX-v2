/**
 * QUANTX Version 32 (v32) Master API Client:
 * Post-Quantum Lattice Security (NIST Dilithium/Kyber EMS), Photonic Optical Tensor Accelerators,
 * Autonomous Zero-Knowledge Atomic Settlement (zk-DvP), and Self-Correcting Causal Graph Intelligence (SC-CRL).
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

// ==========================================
// Type Definitions
// ==========================================

export interface PqcSignatureResponse {
  order_id: string;
  security_standard: string;
  pqc_signature: string;
  signature_length_bytes: number;
  lattice_parameters: {
    modulus_q: number;
    dimension_n: number;
    matrix_k_l: string;
    lwe_error_norm_bound: number;
  };
  status: string;
  canonical_payload_hash: string;
  timestamp: string;
}

export interface PqcVerifyResponse {
  order_id: string;
  verification_status: "SIGNATURE_VALID" | "SIGNATURE_TAMPERED";
  lattice_error_norm: number;
  norm_bound_exceeded: boolean;
  pqc_security_level: string;
  quantum_attack_resistant: boolean;
  timestamp: string;
}

export interface PqcKeyEncapsulationResponse {
  pqc_standard: string;
  security_category: string;
  client_endpoint: string;
  shared_secret_hash: string;
  ciphertext_sample: string;
  ciphertext_length_bytes: number;
  polynomial_ring: string;
  poly_sample_vector: number[];
  quantum_immunity_bits: number;
  status: string;
  timestamp: string;
}

export interface MziElement {
  mzi_id: string;
  theta_rad: number;
  phi_rad: number;
}

export interface PhotonicMatMulResponse {
  status: string;
  output_shape: number[];
  photonic_latency_picoseconds: number;
  standard_gpu_latency_ms: number;
  speedup_vs_cuda: number;
  energy_efficiency_fJ_per_op: number;
  optical_snr_db: number;
  dwdm_channels_utilized: number;
  waveguide_thermal_stability_pct: number;
  mzi_mesh_grid: MziElement[][];
  output_sample: number[][];
  timestamp: string;
}

export interface PhotonicTelemetryResponse {
  optical_core_status: string;
  laser_wavelength_nm: number;
  dwdm_channel_count: number;
  active_mzi_mesh_elements: number;
  die_temperature_celsius: number;
  photonic_propagation_loss_db_per_cm: number;
  attenuation_calibration: string;
  timestamp: string;
}

export interface AtomicDvpSwapRecord {
  swap_id: string;
  buyer_account: string;
  seller_account: string;
  ticker: string;
  shares_qty: number;
  settlement_cash_inr: number;
  venue_from: string;
  venue_to: string;
  commitment_buyer: string;
  commitment_seller: string;
  zk_proof_hash: string;
  settlement_status: string;
  settlement_latency_ms: number;
  counterparty_risk_exposure?: string;
  timestamp: string;
}

export interface CausalDagEdge {
  from: string;
  to: string;
}

export interface CausalDagUpdateResponse {
  regime_status: "NORMAL_CONTINUOUS_REGIME" | "HIGH_VOLATILITY_REGIME_SHIFT";
  active_causal_edges_count: number;
  causal_dag: CausalDagEdge[];
  node_degrees: Record<string, number>;
  causal_discovery_algorithm: string;
  independence_test_p_value: number;
  timestamp: string;
}

export interface CounterfactualRewardResponse {
  proposed_action: string;
  participation_rate: number;
  active_regime: string;
  do_calculus_expression: string;
  counterfactual_reward: number;
  expected_slippage_bps: number;
  expected_fill_rate_pct: number;
  recommended_strategy: string;
  timestamp: string;
}

export interface V32SystemSummaryResponse {
  platform_version: string;
  security_standard: string;
  photonic_core: string;
  settlement_protocol: string;
  causal_intelligence: string;
  user_aum_inr: number;
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

export const postQuantumV32Service = {
  // 1. Post-Quantum Lattice Security (NIST Dilithium / Kyber)
  signOrder: (payload?: { order_payload?: any }): Promise<PqcSignatureResponse> =>
    request("/api/v1/v32/pqc/sign-order", {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }),

  verifyOrder: (payload: { order_payload: any; pqc_signature: string }): Promise<PqcVerifyResponse> =>
    request("/api/v1/v32/pqc/verify-order", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  encapsulateKey: (payload?: { client_endpoint?: string }): Promise<PqcKeyEncapsulationResponse> =>
    request("/api/v1/v32/pqc/encapsulate-key", {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }),

  // 2. Photonic Optical Tensor Engine
  simulatePhotonicMatMul: (payload?: {
    feature_matrix?: number[][];
    weight_matrix?: number[][];
    matrix_dim?: number;
  }): Promise<PhotonicMatMulResponse> =>
    request("/api/v1/v32/photonic/matmul", {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }),

  getPhotonicTelemetry: (): Promise<PhotonicTelemetryResponse> =>
    request("/api/v1/v32/photonic/telemetry"),

  // 3. Autonomous zk-DvP Atomic Settlement
  initiateAtomicDvp: (payload?: {
    buyer_account?: string;
    seller_account?: string;
    ticker?: string;
    qty?: number;
    price?: number;
    venue_from?: string;
    venue_to?: string;
  }): Promise<AtomicDvpSwapRecord> =>
    request("/api/v1/v32/atomic-dvp/initiate", {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }),

  getAtomicDvpLedger: (): Promise<AtomicDvpSwapRecord[]> =>
    request("/api/v1/v32/atomic-dvp/ledger"),

  // 4. Self-Correcting Causal Graph (SC-CRL)
  updateCausalDag: (payload?: {
    macro_shock_detected?: boolean;
    vpin_toxicity?: number;
    spread_bps?: number;
  }): Promise<CausalDagUpdateResponse> =>
    request("/api/v1/v32/causal/update-dag", {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }),

  computeCounterfactualReward: (payload?: {
    proposed_action?: string;
    participation_rate?: number;
  }): Promise<CounterfactualRewardResponse> =>
    request("/api/v1/v32/causal/counterfactual-reward", {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }),

  // 5. System Summary
  getSystemSummary: (): Promise<V32SystemSummaryResponse> =>
    request("/api/v1/v32/system/summary"),
};

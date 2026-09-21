/**
 * QUANTX v25 Sovereign Master Service Layer
 * Specification implementation of suggestions-v25.md:
 * 1. Neuromorphic Liquid Neural Networks (LNNs) - Continuous-Time ODE dynamics & dynamic tau_eff
 * 2. Zero-Knowledge Proof-of-Solvency (zk-PoS) - Pedersen commitments & Groth16 verification
 * 3. Federated Cross-Desk Alpha Orchestration - (epsilon, delta)-Differential Privacy & SMPC
 * 4. Sovereign Bare-Metal Edge Firmware - Sub-500ns execution & offline fallback delta hedging
 */

const API_BASE = "/api/v1/sovereign";

export interface SovereignTelemetry {
  status: string;
  version: string;
  modules: {
    neuromorphic_lnn: string;
    zero_knowledge_solvency: string;
    federated_learning: string;
    edge_firmware: string;
  };
  metrics: {
    edge_latency_ns: number;
    target_sla_latency_ns: number;
    dp_epsilon: number;
    dp_delta: number;
    offline_fallback: string;
  };
  tracked_assets: string[];
  timestamp: number;
}

export interface LNNStepResult {
  tickers: string[];
  raw_ticks: number[];
  dt_seconds: number;
  effective_tau_ms: number;
  regime: "HIGH_VOLATILITY_ACCELERATED" | "NORMAL_STABLE";
  readout: {
    alpha_return_pct: number;
    predicted_volatility_pct: number;
    confidence_score: number;
    energy_norm: number;
  };
  hidden_state_sample: number[];
  timestamp: number;
}

export interface ZkProofResult {
  commitment_hash: string;
  pedersen_commitment_int: number;
  groth16_proof: {
    pi_a: [string, string];
    pi_b: [[string, string], [string, string]];
    pi_c: [string, string];
    protocol: string;
    curve: string;
  };
  public_signals: {
    solvency_satisfied: boolean;
    concentration_cap_satisfied: boolean;
    var_compliance_satisfied: boolean;
    max_var_limit_inr: number;
    circuit_valid: boolean;
  };
  private_witness_summary: {
    solvency_margin_inr: number;
    calculated_var_inr: number;
    max_weight_observed: number;
    total_positions_committed: number;
  };
  verification_status: "PROVEN_AND_SATISFIED" | "CONSTRAINT_BREACH_REJECTED";
  proof_generation_ms: number;
  timestamp: number;
}

export interface ZkVerifyResult {
  verified: boolean;
  verifier_protocol: string;
  verification_time_us: number;
  pairing_checks: string;
  message: string;
}

export interface DeskTelemetry {
  raw_gradient_norm: number;
  clipped_gradient_norm: number;
  dp_noise_added_norm: number;
  privacy_guarantee: string;
}

export interface FederatedResult {
  federated_round_id: number;
  participating_desks: string[];
  privacy_parameters: {
    epsilon: number;
    delta: number;
    sigma_noise_scale: number;
    clipping_bound_S: number;
    cumulative_epsilon_spent: number;
  };
  desk_telemetry: Record<string, DeskTelemetry>;
  smpc_aggregated_weights: number[];
  consensus_sharpe_projection: number;
  cross_desk_alignment_pct: number;
  timestamp: number;
}

export interface EdgeFirmwareStatus {
  firmware_version: string;
  hardware_target: string;
  compilation_mode: string;
  pcie_interface: string;
  memory_footprint_kb: number;
  measured_inference_latency_ns: number;
  target_latency_ns: number;
  target_sla_latency_ns: number;
  sla_compliance: boolean;
  clock_jitter_ns: number;
  offline_fallback_status: "ONLINE_STANDBY" | "ACTIVE_DEFENSIVE_HEDGE";
  autonomous_safety_checks: string[];
  timestamp: number;
}

export interface SovereignPipelineResult {
  pipeline_status: string;
  lnn_ode_step: LNNStepResult;
  zk_proof_of_solvency: ZkProofResult;
  zk_verification: ZkVerifyResult;
  federated_alpha_smpc: FederatedResult;
  bare_metal_edge_firmware: EdgeFirmwareStatus;
  executive_summary: {
    market_regime: string;
    effective_tau_ms: number;
    zk_solvency_proven: boolean;
    solvency_margin_inr: number;
    edge_latency_ns: number;
    edge_sla_met: boolean;
    consensus_sharpe: number;
  };
  timestamp: number;
}

export const sovereignService = {
  async getTelemetry(): Promise<SovereignTelemetry> {
    const res = await fetch(`${API_BASE}/telemetry`);
    if (!res.ok) throw new Error(`Telemetry failed with status ${res.status}`);
    return res.json();
  },

  async stepLNN(payload: {
    ticks?: number[];
    dt?: number;
    hidden_state?: number[];
  }): Promise<LNNStepResult> {
    const res = await fetch(`${API_BASE}/lnn/step`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`LNN step failed with status ${res.status}`);
    return res.json();
  },

  async proveSolvency(payload: {
    portfolio_weights?: number[];
    portfolio_nav?: number;
    liabilities_inr?: number;
    max_var_limit?: number;
  }): Promise<ZkProofResult> {
    const res = await fetch(`${API_BASE}/zk/prove-solvency`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`zk Prove Solvency failed with status ${res.status}`);
    return res.json();
  },

  async verifyProof(payload: {
    commitment_int: number;
    public_signals: Record<string, any>;
    proof: Record<string, any>;
  }): Promise<ZkVerifyResult> {
    const res = await fetch(`${API_BASE}/zk/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`zk Verify failed with status ${res.status}`);
    return res.json();
  },

  async runFederatedAggregation(payload: {
    epsilon?: number;
    delta?: number;
  }): Promise<FederatedResult> {
    const res = await fetch(`${API_BASE}/federated/aggregate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Federated aggregation failed with status ${res.status}`);
    return res.json();
  },

  async getEdgeStatus(): Promise<EdgeFirmwareStatus> {
    const res = await fetch(`${API_BASE}/edge/status`);
    if (!res.ok) throw new Error(`Edge status failed with status ${res.status}`);
    return res.json();
  },

  async toggleOfflineFallback(enable: boolean = true): Promise<{
    offline_fallback_active: boolean;
    action: string;
    failover_latency_us: number;
    message: string;
  }> {
    const res = await fetch(`${API_BASE}/edge/toggle-fallback?enable=${enable}`, {
      method: "POST",
    });
    if (!res.ok) throw new Error(`Toggle offline fallback failed with status ${res.status}`);
    return res.json();
  },

  async executePipeline(payload: {
    ticks?: number[];
    dt?: number;
    portfolio_weights?: number[];
    portfolio_nav?: number;
    liabilities_inr?: number;
    max_var_limit?: number;
    epsilon?: number;
  }): Promise<SovereignPipelineResult> {
    const res = await fetch(`${API_BASE}/pipeline/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Pipeline execution failed with status ${res.status}`);
    return res.json();
  },
};

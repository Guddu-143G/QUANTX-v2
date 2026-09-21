/**
 * QUANTX Platform v12 Master Sovereign Intelligence API Client.
 * Implements TypeScript definitions & endpoints for all 6 v12 modules:
 * 1. Auto-Quant Swarms (4-Agent Alpha Discovery)
 * 2. Generative Conditional Diffusion L3 LOB Simulator
 * 3. Post-Quantum Cryptographic (PQC) Security
 * 4. Real-Time Multi-Period Liquidity Optimizer
 * 5. Institutional Cross-Margining & ISDA SIMM Solver
 * 6. Automated Regulatory Reporting (SEC Form PF, MiFID II RTS 28, Rule 206(4)-7)
 */

// ── 1. Auto-Quant Swarms (v12 Section 2) ──────────────────────────────────────

export interface SwarmCandidateAlpha {
  name: string;
  formula: string;
  family: string;
  complexity: number;
  decay_half_life_days: number;
  raw_ic: number;
  orthogonal_ic: number;
  ic_t_stat: number;
  slippage_drag_bps: number;
  net_sharpe: number;
  status: "PROMOTABLE" | "REJECTED_LOW_IC" | "REJECTED_COLLINEAR";
  verdict: string;
  uniqueness_pct: number;
  sample_curve: number[];
}

export interface SwarmRegisteredFactor {
  name: string;
  family: string;
  raw_ic: number;
  orthogonal_ic: number;
  sharpe: number;
  half_life_days: number;
  status: string;
  promoted_at?: string;
}

// ── 2. Generative Market Regime & Diffusion L3 Simulator (v12 Section 3) ───────

export interface LOBDiffusionTick {
  tick: number;
  time_ms: number;
  time_label: string;
  mid_price: number;
  bid_price: number;
  ask_price: number;
  spread_bps: number;
  bid_depth_contracts: number;
  ask_depth_contracts: number;
  vpin_toxicity: number;
  ofi_imbalance: number;
  score_norm: number;
}

export interface L3LadderLevel {
  level: number;
  bid_price: number;
  bid_size: number;
  ask_price: number;
  ask_size: number;
}

export interface DiffusionLOBResult {
  scenario: string;
  scenario_key: string;
  diffusion_score_steps: number;
  simulated_ticks_count: number;
  max_spread_widening_bps: number;
  peak_vpin_toxicity: number;
  min_bid_depth_contracts: number;
  total_price_displacement_pct: number;
  trajectory: LOBDiffusionTick[];
  l3_depth_snapshot: L3LadderLevel[];
}

export interface DiffusionScenarioInfo {
  name: string;
  drift_bias: number;
  diffusion_vol: number;
  depth_drain_pct: number;
  vpin_peak: number;
  spread_widening_factor: number;
  description: string;
}

// ── 3. Post-Quantum Cryptographic Security (v12 Section 4) ────────────────────

export interface PQCSignatureRecord {
  log_id: string;
  timestamp_utc: string;
  action: string;
  entity_id: string;
  signature_scheme: string;
  signature_bytes_len: number;
  signature_hash?: string;
  public_key_fingerprint: string;
  verification_status: string;
  quantum_entropy_source: string;
}

export interface PQCSecurityStatus {
  pqc_enabled: boolean;
  fips_compliance: string;
  key_encapsulation: string;
  digital_signatures: string;
  symmetric_cipher: string;
  key_derivation: string;
  lattice_dimension_k: number;
  security_level: string;
  active_pqc_sessions: number;
  hardware_security_module: string;
  hybrid_tls_mode: string;
  recent_audit_signatures: PQCSignatureRecord[];
}

// ── 4. Multi-Period Liquidity-Adjusted Optimizer (v12 Section 5) ───────────────

export interface GlidepathPeriod {
  period: number;
  label: string;
  weights: Record<string, number>;
  expected_return_pct: number;
  volatility_pct: number;
  turnover_pct: number;
  transaction_cost_bps: number;
  net_sharpe: number;
  hhi_concentration: number;
}

export interface MultiPeriodResult {
  status: string;
  horizon_periods: number;
  assets: string[];
  ledoit_wolf_shrinkage_delta: number;
  cumulative_turnover_pct: number;
  total_transaction_cost_bps: number;
  annualized_net_alpha_bps: number;
  trajectory: GlidepathPeriod[];
}

// ── 5. Institutional Cross-Margining & ISDA SIMM Solver (v12 Section 6) ───────

export interface ISDACollateralResult {
  status: string;
  solver: string;
  total_margin_required_usd: number;
  total_carry_cost_annual_usd: number;
  unoptimized_carry_cost_usd: number;
  annual_carry_savings_usd: number;
  annual_carry_savings_pct: number;
  allocation_matrix: Record<string, Record<string, number>>;
  ccp_effective_posted: Record<string, number>;
  asset_utilization_breakdown: Record<
    string,
    {
      posted_usd: number;
      total_available_usd: number;
      utilization_pct: number;
    }
  >;
}

export interface ISDACollateralDefaults {
  ccps: string[];
  assets: string[];
  margin_requirements_usd: Record<string, number>;
  asset_holdings_usd: Record<string, number>;
  haircuts: Record<string, Record<string, number>>;
  carry_costs_annual_pct: Record<string, number>;
}

// ── 6. Automated Regulatory Reporting (v12 Section 7) ─────────────────────────

export interface FormPFFiling {
  form_type: string;
  filing_period: string;
  reporting_fund_id: string;
  fund_legal_name: string;
  lei_identifier: string;
  regulatory_metrics: {
    gross_notional_value_usd: number;
    net_asset_value_usd: number;
    gross_leverage_ratio: number;
    net_leverage_ratio: number;
    daily_var_95_1d_pct: number;
    daily_var_99_1d_pct: number;
    monthly_turnover_rate_pct: number;
    portfolio_liquidity_profile: {
      liquid_within_1_day_pct: number;
      liquid_within_7_days_pct: number;
      illiquid_over_30_days_pct: number;
    };
    asset_allocation_breakdown: Array<{
      asset_class: string;
      gross_usd: number;
      pct: number;
    }>;
    top_5_borrowing_counterparties: Array<{
      counterparty: string;
      exposure_usd: number;
      rating: string;
    }>;
  };
  filing_status: string;
  generated_timestamp_utc: string;
  xbrl_conformance_hash: string;
}

export interface MiFID2RTS28Venue {
  rank: number;
  venue_name: string;
  mic_code: string;
  volume_pct: number;
  orders_pct: number;
  passive_orders_pct: number;
  aggressive_orders_pct: number;
  avg_slippage_vs_arrival_bps: number;
  best_execution_passed: boolean;
}

export interface MiFID2RTS28Report {
  regulation: string;
  reporting_year: number;
  asset_class: string;
  client_order_profile: string;
  venues_summary: MiFID2RTS28Venue[];
  execution_quality_assessment: string;
}

export interface ComplianceLedgerEvent {
  event_id: string;
  timestamp_utc: string;
  model_id: string;
  model_name: string;
  transition: string;
  approver: string;
  governance_rule: string;
  sha256_fingerprint: string;
  scrypt_salt_hash: string;
  pqc_signature: string;
  compliance_status: string;
}

// ── V12 API Service Client ───────────────────────────────────────────────────

export const v12Service = {
  // 1. Auto-Quant Swarms
  getSwarmRegisteredFactors: async (): Promise<{ factors: SwarmRegisteredFactor[] }> => {
    const res = await fetch("/api/v1/swarm/registered-factors");
    if (!res.ok) throw new Error("Failed to load registered swarm factors");
    return res.json();
  },

  generateSwarmAlphas: async (count: number = 5): Promise<{ count: number; candidates: SwarmCandidateAlpha[] }> => {
    const res = await fetch("/api/v1/swarm/generate-alphas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count }),
    });
    if (!res.ok) throw new Error("Failed to execute Auto-Quant Swarm generation");
    return res.json();
  },

  promoteSwarmAlpha: async (params: { name: string; formula: string; family: string }): Promise<{ factor: SwarmRegisteredFactor }> => {
    const res = await fetch("/api/v1/swarm/promote-alpha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Failed to promote candidate alpha");
    return res.json();
  },

  // 2. Generative Conditional Diffusion L3 Simulator
  getDiffusionScenarios: async (): Promise<{ scenarios: Record<string, DiffusionScenarioInfo> }> => {
    const res = await fetch("/api/v1/simulator/scenarios");
    if (!res.ok) throw new Error("Failed to load diffusion scenarios");
    return res.json();
  },

  runDiffusionLOBSimulation: async (params: {
    scenario_key: string;
    mid_price?: number;
    steps?: number;
    diffusion_steps?: number;
  }): Promise<DiffusionLOBResult> => {
    const res = await fetch("/api/v1/simulator/diffusion-lob", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Failed to run conditional diffusion simulation");
    return res.json();
  },

  // 3. Post-Quantum Cryptographic Security
  getPQCStatus: async (): Promise<PQCSecurityStatus> => {
    const res = await fetch("/api/v1/security/pqc-status");
    if (!res.ok) throw new Error("Failed to fetch PQC security status");
    return res.json();
  },

  signPQCPayload: async (payload: any, contextLabel: string = "QUANTX_TRANSACTION"): Promise<PQCSignatureRecord> => {
    const res = await fetch("/api/v1/security/pqc-sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload, context_label: contextLabel }),
    });
    if (!res.ok) throw new Error("Failed to sign payload with ML-DSA-87");
    return res.json();
  },

  // 4. Multi-Period Liquidity Optimizer
  runMultiPeriodOptimization: async (params: {
    horizon_periods?: number;
    initial_weights?: Record<string, number>;
    risk_aversion?: number;
    linear_cost_bps?: number;
    quadratic_cost_bps?: number;
    custom_expected_returns?: number[];
  }): Promise<MultiPeriodResult> => {
    const res = await fetch("/api/v1/optimizer/multi-period", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Failed to execute multi-period optimization");
    return res.json();
  },

  // 5. Institutional Cross-Margining & ISDA SIMM Solver
  getISDACollateralDefaults: async (): Promise<ISDACollateralDefaults> => {
    const res = await fetch("/api/v1/risk/isda-collateral-defaults");
    if (!res.ok) throw new Error("Failed to load ISDA collateral defaults");
    return res.json();
  },

  optimizeISDACollateral: async (params: {
    margin_requirements?: Record<string, number>;
    asset_holdings?: Record<string, number>;
    haircuts?: Record<string, Record<string, number>>;
    carry_costs?: Record<string, number>;
  }): Promise<ISDACollateralResult> => {
    const res = await fetch("/api/v1/risk/isda-collateral-optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Failed to optimize ISDA collateral allocations");
    return res.json();
  },

  // 6. Automated Regulatory Reporting
  getFormPFFiling: async (): Promise<FormPFFiling> => {
    const res = await fetch("/api/v1/regulatory/form-pf");
    if (!res.ok) throw new Error("Failed to generate SEC Form PF filing");
    return res.json();
  },

  getMiFID2RTS28Report: async (): Promise<MiFID2RTS28Report> => {
    const res = await fetch("/api/v1/regulatory/mifid2-rts28");
    if (!res.ok) throw new Error("Failed to generate MiFID II RTS 28 report");
    return res.json();
  },

  getComplianceLedger: async (): Promise<{ status: string; ledger: ComplianceLedgerEvent[] }> => {
    const res = await fetch("/api/v1/regulatory/compliance-ledger");
    if (!res.ok) throw new Error("Failed to load compliance audit ledger");
    return res.json();
  },

  recordComplianceEvent: async (params: {
    model_id: string;
    model_name: string;
    transition: string;
    approver: string;
  }): Promise<ComplianceLedgerEvent> => {
    const res = await fetch("/api/v1/regulatory/record-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Failed to record model compliance event");
    return res.json();
  },
};

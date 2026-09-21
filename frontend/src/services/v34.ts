/**
 * QUANTX Version 34 (v34) Master API Client:
 * Biological DNA Data Archival, Topological Quantum Neural Processing Units (tQNPU),
 * Sovereign CBDC Cross-Chain Liquidity Bridges & Epigenetic MARL Policy Optimization.
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

export interface DnaMetrics {
  total_bases: number;
  gc_content_pct: number;
  melting_temp_celsius: number;
  base_distribution: {
    A: number;
    C: number;
    G: number;
    T: number;
  };
  homopolymers_prevented: boolean;
  density_capacity: string;
  outer_reed_solomon_code: string;
  max_tolerable_strand_damage_pct: number;
  projected_shelf_life_years: number;
}

export interface DnaEncodeResponse {
  original_payload: string;
  dna_sequence: string;
  oligomer_length: number;
  metrics: DnaMetrics;
}

export interface DnaDecodeResponse {
  dna_sequence: string;
  decoded_text: string;
  byte_count: number;
  status: string;
}

export interface DnaVaultRecord {
  archive_id: string;
  order_id: string;
  ticker: string;
  notional_inr: number;
  dna_sequence_preview: string;
  full_dna_sequence?: string;
  oligomer_length_bases: number;
  gc_content_pct: number;
  melting_temp_c: number;
  reed_solomon_parity_symbols: number;
  durability_years: number;
  timestamp: string;
}

export interface TopologicalOptimizeResponse {
  n_assets_optimized: number;
  topological_qubits: number;
  gate_fidelity: number;
  decoherence_rate_per_sec: number;
  braiding_trajectory_2d: number[][];
  yang_baxter_satisfied: boolean;
  chern_number: number;
  optimal_weight_sample: number[];
  status: string;
  timestamp: string;
}

export interface TopologicalTelemetryResponse {
  qpu_architecture: string;
  physical_qubit_type: string;
  quantum_error_correction: string;
  chern_invariant: number;
  braiding_clock_speed_ghz: number;
  coherence_time_limit: string;
  status: string;
  timestamp: string;
}

export interface CBDCSwapRecord {
  swap_id: string;
  from_currency: string;
  to_currency: string;
  amount_from: number;
  amount_to: number;
  exchange_rate: number;
  hashlock: string;
  timelock_seconds: number;
  zk_ibc_proof: string;
  settlement_status: string;
  settlement_latency_ms: number;
  timestamp: string;
}

export interface CBDCSwapResponse {
  status: string;
  swap_record: CBDCSwapRecord;
  counterparty_risk: string;
  zk_ibc_verification: string;
}

export interface EpigeneticMaskResponse {
  active_weights: number[];
  base_weights: number[];
  metadata: {
    macro_vix: number;
    effective_vix: number;
    methylation_intensity: number;
    adaptation_latency_us: number;
    retraining_required: boolean;
    regime_adaptation: string;
    catastrophic_forgetting_risk: string;
    timestamp: string;
  };
}

export interface V34SystemSummary {
  platform_version: string;
  dna_archival: string;
  quantum_processor: string;
  settlement_layer: string;
  adaptation_ai: string;
  user_aum_inr: number;
  benchmark_rate: number;
  timestamp: string;
}

// ==========================================
// API Methods
// ==========================================

export const v34Service = {
  /**
   * Encodes trade audit payload into synthetic DNA nucleotides.
   */
  async encodeDnaSequence(
    payloadText: string = "QUANTX_TRADE_AUDIT_VERIFIED_95VAR_PASS_2026_09_17"
  ): Promise<DnaEncodeResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/v34/dna/encode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload_text: payloadText }),
    });
    if (!res.ok) {
      throw new Error(`Failed to encode DNA sequence: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Decodes synthetic DNA sequence back into original binary text.
   */
  async decodeDnaSequence(dnaSequence: string): Promise<DnaDecodeResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/v34/dna/decode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dna_sequence: dnaSequence }),
    });
    if (!res.ok) {
      throw new Error(`Failed to decode DNA sequence: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Synthesizes and vaults an immutable DNA record for trade audit.
   */
  async archiveDnaTradeAudit(
    orderId: string = "ORD-INST-9023",
    ticker: string = "RELIANCE",
    notionalInr: number = 12500000.0,
    zkProof: string = "zk-snark-0x8f92b4"
  ): Promise<{ status: string; record: DnaVaultRecord; metrics: DnaMetrics }> {
    const res = await fetch(`${BASE_URL}/api/v1/v34/dna/archive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: orderId,
        ticker,
        notional_inr: notionalInr,
        zk_proof: zkProof,
      }),
    });
    if (!res.ok) {
      throw new Error(`Failed to archive DNA trade audit: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Retrieves synthetic DNA immutable archival vault records.
   */
  async getDnaVaultRecords(): Promise<DnaVaultRecord[]> {
    const res = await fetch(`${BASE_URL}/api/v1/v34/dna/vault`);
    if (!res.ok) {
      throw new Error(`Failed to fetch DNA vault records: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Simulates non-Abelian anyon braiding for fault-tolerant discrete portfolio optimization.
   */
  async optimizeTopologicalPortfolio(
    nAssets: number = 1000
  ): Promise<TopologicalOptimizeResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/v34/tqnpu/optimize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ n_assets: nAssets }),
    });
    if (!res.ok) {
      throw new Error(`Failed to optimize topological portfolio: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Returns hardware telemetry for simulated Majorana anyon braiding chips.
   */
  async getTopologicalTelemetry(): Promise<TopologicalTelemetryResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/v34/tqnpu/braiding-telemetry`);
    if (!res.ok) {
      throw new Error(`Failed to fetch topological telemetry: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Executes cross-chain sovereign CBDC atomic DvP swap with HTLC and zk-IBC verification.
   */
  async initiateAtomicCBDCSwap(
    fromCurrency: string = "e-INR",
    toCurrency: string = "e-USD",
    amountFrom: number = 835000.0,
    userAccount: string = "ACC-INST-TREASURY"
  ): Promise<CBDCSwapResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/v34/cbdc/initiate-swap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from_currency: fromCurrency,
        to_currency: toCurrency,
        amount_from: amountFrom,
        user_account: userAccount,
      }),
    });
    if (!res.ok) {
      throw new Error(`Failed to initiate CBDC swap: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Returns immutable cross-chain sovereign CBDC atomic settlement ledger.
   */
  async getCBDCSettlementLedger(): Promise<CBDCSwapRecord[]> {
    const res = await fetch(`${BASE_URL}/api/v1/v34/cbdc/ledger`);
    if (!res.ok) {
      throw new Error(`Failed to fetch CBDC settlement ledger: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Applies dynamic epigenetic methylation mask over policy weights based on macro VIX and stress.
   */
  async applyEpigeneticMask(
    baseWeights?: number[],
    macroVix: number = 22.5,
    macroStressFactor: number = 0.15
  ): Promise<EpigeneticMaskResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/v34/epigenetic/apply-mask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base_weights: baseWeights ?? null,
        macro_vix: macroVix,
        macro_stress_factor: macroStressFactor,
      }),
    });
    if (!res.ok) {
      throw new Error(`Failed to apply epigenetic mask: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Retrieves overall status of QUANTX Version 34 Sovereign Platform.
   */
  async getSystemSummary(): Promise<V34SystemSummary> {
    const res = await fetch(`${BASE_URL}/api/v1/v34/system/summary`);
    if (!res.ok) {
      throw new Error(`Failed to fetch v34 system summary: ${res.statusText}`);
    }
    return res.json();
  },
};

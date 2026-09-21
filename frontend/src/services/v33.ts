/**
 * QUANTX Version 33 (v33) Master API Client:
 * Neuromorphic Analog Memristive Computing, Zero-Knowledge Federated Liquidity Discovery (zk-FLDG),
 * BFT Risk Swarm Consensus & Bio-Inspired Market Immune Defense.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

// ==========================================
// Type Definitions
// ==========================================

export interface CrossbarCell {
  cell_id: string;
  conductance_mS: number;
  resistance_kOhm: number;
  filament_state: string;
}

export interface MemristiveVmmResponse {
  status: string;
  execution_latency_picoseconds: number;
  energy_efficiency_fJ_per_op: number;
  thermal_dissipation_reduction_factor: string;
  input_voltage_vector: number[];
  output_currents_mA: number[];
  crossbar_cells_grid: CrossbarCell[][];
  timestamp: string;
}

export interface MemristiveSpdeResponse {
  model: string;
  spot_price: number;
  strikes: number[];
  maturities_days: number[];
  vol_surface_matrix: number[][];
  spde_solver_latency_ms: number;
  pde_boundary_conditions: string;
  timestamp: string;
}

export interface DiscoveredPool {
  venue_id: string;
  venue_name: string;
  matched_shares: number;
  attention_weight_alpha: number;
  limit_band_verified: boolean;
  zk_band_proof: string;
  price_improvement_bps: number;
}

export interface ZkFldgVenue {
  venue_id: string;
  name: string;
  tier: string;
  status: string;
}

export interface ZkFldgDiscoveryResponse {
  ticker: string;
  target_shares: number;
  price_band: {
    min_price: number;
    max_price: number;
  };
  total_liquidity_discovered: number;
  liquidity_coverage_pct: number;
  blind_gat_attention_weights: Record<string, number>;
  zk_snark_master_proof: string;
  price_band_integrity: string;
  participant_identities_disclosed: boolean;
  discovered_pools: DiscoveredPool[];
  timestamp: string;
}

export interface MarketImmuneTickResponse {
  market_state: number[];
  min_detector_distance: number;
  anomaly_detected: boolean;
  immune_system_state: string;
  immune_action: string;
  active_detectors_count: number;
  memory_cells_count: number;
  timestamp: string;
}

export interface DigitalAntibodyMemoryCell {
  antibody_id: string;
  target_attack: string;
  affinity_score: number;
  clonal_generation: number;
  neutralization_action: string;
  created_at: string;
}

export interface BFTRiskBallot {
  agent_id: string;
  name: string;
  vote: number;
  vote_label: "APPROVE" | "REJECT";
  reason: string;
  crypto_signature: string;
}

export interface BFTRiskConsensusResponse {
  proposed_order: {
    order_id?: string;
    ticker?: string;
    shares?: number;
    price?: number;
    var_pct?: number;
    vpin?: number;
    max_weight?: number;
    leverage?: number;
    [key: string]: any;
  };
  ballots: BFTRiskBallot[];
  approve_count: number;
  total_agents: number;
  required_supermajority: number;
  consensus_reached: boolean;
  consensus_verdict: string;
  bft_round_latency_ms: number;
  timestamp: string;
}

export interface V33SystemSummary {
  platform_version: string;
  analog_core: string;
  liquidity_protocol: string;
  defense_system: string;
  risk_governance: string;
  user_aum_inr: number;
  timestamp: string;
}

// ==========================================
// API Methods
// ==========================================

export const v33Service = {
  /**
   * Simulates sub-picosecond analog memristor crossbar Vector-Matrix Multiplication (VMM).
   */
  async executeMemristiveVMM(
    weights?: number[],
    conductanceMatrix?: number[][]
  ): Promise<MemristiveVmmResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/v33/memristor/vmm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weights: weights ?? null,
        conductance_matrix: conductanceMatrix ?? null,
      }),
    });
    if (!res.ok) {
      throw new Error(`Failed to execute memristive VMM: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Solves continuous Heston/SABR SPDE implied volatility surface using analog memristor solver.
   */
  async getMemristiveSpdeSurface(
    spotPrice: number = 2950.0,
    r: number = 0.065,
    v0: number = 0.04
  ): Promise<MemristiveSpdeResponse> {
    const params = new URLSearchParams({
      spot_price: spotPrice.toString(),
      r: r.toString(),
      v0: v0.toString(),
    });
    const res = await fetch(`${BASE_URL}/api/v1/v33/memristor/spde-surface?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch memristive SPDE surface: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Executes blind multi-party GAT liquidity discovery with zk-SNARK price band verification.
   */
  async discoverZkFederatedLiquidity(
    ticker: string = "RELIANCE",
    targetShares: number = 10000,
    minPrice: number = 2940.0,
    maxPrice: number = 2960.0
  ): Promise<ZkFldgDiscoveryResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/v33/zk-fldg/discover-liquidity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticker,
        target_shares: targetShares,
        min_price: minPrice,
        max_price: maxPrice,
      }),
    });
    if (!res.ok) {
      throw new Error(`Failed to discover federated liquidity: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Retrieves registered dark pools and execution venues.
   */
  async getZkFldgVenues(): Promise<ZkFldgVenue[]> {
    const res = await fetch(`${BASE_URL}/api/v1/v33/zk-fldg/venues`);
    if (!res.ok) {
      throw new Error(`Failed to fetch zk-FLDG venues: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Evaluates incoming tick state against negative selection immune detectors.
   */
  async evaluateMarketImmuneTick(
    marketState?: [number, number, number]
  ): Promise<MarketImmuneTickResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/v33/immune/evaluate-tick`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        market_state: marketState ?? null,
      }),
    });
    if (!res.ok) {
      throw new Error(`Failed to evaluate immune tick: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Clonal selection: Clones and hypermutates an active antibody memory cell.
   */
  async cloneMarketImmuneAntibody(
    targetAttack: string
  ): Promise<DigitalAntibodyMemoryCell> {
    const res = await fetch(`${BASE_URL}/api/v1/v33/immune/clone-antibody`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_attack: targetAttack }),
    });
    if (!res.ok) {
      throw new Error(`Failed to clone market immune antibody: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Fetches active digital antibody memory cells.
   */
  async getMarketImmuneAntibodies(): Promise<DigitalAntibodyMemoryCell[]> {
    const res = await fetch(`${BASE_URL}/api/v1/v33/immune/antibodies`);
    if (!res.ok) {
      throw new Error(`Failed to fetch antibodies: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Executes 2/3+ BFT supermajority risk consensus across 4 autonomous micro-agents.
   */
  async voteOrderBftRisk(
    order: {
      order_id?: string;
      ticker?: string;
      shares?: number;
      price?: number;
      var_pct?: number;
      vpin?: number;
      max_weight?: number;
      leverage?: number;
    }
  ): Promise<BFTRiskConsensusResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/v33/bft-risk/vote-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    if (!res.ok) {
      throw new Error(`Failed to execute BFT risk consensus: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Fetches overall status of QUANTX Version 33 Sovereign Platform.
   */
  async getSystemSummary(): Promise<V33SystemSummary> {
    const res = await fetch(`${BASE_URL}/api/v1/v33/system/summary`);
    if (!res.ok) {
      throw new Error(`Failed to fetch v33 system summary: ${res.statusText}`);
    }
    return res.json();
  },
};

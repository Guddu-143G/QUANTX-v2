/**
 * QUANTX Platform — Version 19 (v19)
 * Ultra-Low-Latency Real-Time Production & High-Frequency Engineering Service Layer
 */

const API_BASE = 'http://127.0.0.1:8001/api/v1';

// ── 1. Kernel-Bypass DPDK & EF_VI Tick Ingestion ────────────────────────────

export interface DPDKTelemetry {
  nic_interface: string;
  architecture: string;
  mean_wire_latency_ns: number;
  p99_jitter_ns: number;
  throughput_msg_per_sec: number;
  total_packets_processed: number;
  ring_buffer_utilization_pct: number;
  kernel_context_switches: number;
  memory_pinning: string;
}

export interface DPDKPacket {
  msg_type: string;
  stock_locate: number;
  tracking_num: number;
  timestamp_ns: number;
  order_ref_num: number;
  side: string;
  shares: number;
  symbol: string;
  price: number;
  wire_to_memory_latency_ns: number;
  ring_index: number;
  clock_drift_ns: number;
  status: string;
}

export interface DPDKPacketStreamResponse {
  status: string;
  symbol: string;
  packets: DPDKPacket[];
}

export interface DPDKParsePacketRequest {
  stock_locate?: number;
  tracking_num?: number;
  timestamp_ns?: number;
  order_ref_num?: number;
  buy_sell_indicator?: string;
  shares?: number;
  stock_symbol?: string;
  price?: number;
}

// ── 2. Real-Time Order Flow Toxicity & Dynamic VPIN Surface ─────────────────

export interface VPINBucketRecord {
  bucket_index: number;
  buy_volume: number;
  sell_volume: number;
  imbalance: number;
  imbalance_ratio: number;
  price_mark: number;
}

export interface VPINProcessTickResponse {
  price: number;
  volume: number;
  tick_direction: string;
  vpin_score: number;
  vpin_updated: boolean;
  toxicity_regime: 'NORMAL' | 'ELEVATED' | 'HIGH_TOXICITY';
  adverse_selection_risk_bps: number;
  completed_buckets_count: number;
  current_bucket_fill_pct: number;
  recent_buckets: VPINBucketRecord[];
}

export interface VPINSimulateSurfaceRequest {
  symbol?: string;
  base_price?: number;
  num_ticks?: number;
  stress_mode?: boolean;
}

export interface VPINSimulateSurfaceResponse {
  symbol: string;
  total_ticks_processed: number;
  stress_mode: boolean;
  latest_vpin_score: number;
  latest_regime: 'NORMAL' | 'ELEVATED' | 'HIGH_TOXICITY';
  adverse_selection_risk_bps: number;
  completed_buckets: VPINBucketRecord[];
  tick_trajectory: VPINProcessTickResponse[];
}

// ── 3. Hardware-Accelerated FPGA Pre-Trade Risk Gate ─────────────────────────

export interface FPGAInspectOrderRequest {
  order_id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  qty: number;
  price: number;
  reference_price: number;
  desk_id?: string;
}

export interface FPGAInspectOrderResponse {
  order_id: string;
  symbol: string;
  side: string;
  qty: number;
  price: number;
  notional_usd: number;
  reference_price: number;
  approved: boolean;
  reject_code: number;
  reject_reason: string;
  compliance_rules_verified: string[];
  fpga_telemetry: {
    fpga_card: string;
    clock_frequency_mhz: number;
    hardware_cycles_consumed: number;
    logic_latency_ns: number;
    total_gate_wire_latency_ns: number;
    sub_120ns_sla_passed: boolean;
  };
}

export interface FPGAGateStatusResponse {
  gate_status: string;
  hardware_platform: string;
  clock_frequency_mhz: number;
  max_order_notional_usd: number;
  max_order_qty: number;
  price_collar_ticks: number;
  total_orders_inspected: number;
  approved_orders: number;
  rejected_orders: number;
  approval_rate_pct: number;
  p99_gate_latency_ns: number;
}

// ── 4. Bi-Temporal Vector RAG Engine ────────────────────────────────────────

export interface BiTemporalContextChunk {
  chunk_id: string;
  source: string;
  domain: string;
  text: string;
  effective_time: string;
  assertion_time: string;
  similarity_score: number;
}

export interface BiTemporalQueryRequest {
  query_text: string;
  effective_timestamp_utc?: string;
  assertion_timestamp_utc?: string;
  top_k?: number;
}

export interface BiTemporalQueryResponse {
  status: string;
  query_text: string;
  effective_time_queried: string;
  assertion_time_queried: string;
  look_ahead_bias_guarantee: string;
  retrieval_latency_ms: number;
  sub_5ms_sla_passed: boolean;
  chunks_matched: number;
  retrieved_context: BiTemporalContextChunk[];
}

// ── 5. Multi-Venue Dark Pool Liquidity Probing via Thompson Sampling ─────────

export interface VenueAllocationStat {
  venue: string;
  alpha_successes: number;
  beta_penalties: number;
  expected_fill_probability: number;
  std_deviation: number;
  recommended_allocation_pct: number;
  venue_tier: string;
}

export interface ThompsonRoutingSurfaceResponse {
  total_routing_events: number;
  venues: VenueAllocationStat[];
  top_recommended_venue: string;
  recent_feedback_events: Array<{
    step: number;
    venue: string;
    fill_ratio: number;
    slippage_bps: number;
    outcome: string;
    updated_alpha: number;
    updated_beta: number;
  }>;
}

export interface ThompsonFeedbackRequest {
  venue: string;
  fill_ratio: number;
  execution_slip_bps: number;
}

export interface ThompsonSimulateRequest {
  parent_order_shares?: number;
  slice_size_shares?: number;
}

export interface ThompsonSimulateResponse {
  parent_order_shares: number;
  slices_routed: number;
  average_slippage_bps: number;
  slice_distribution: Record<string, number>;
  surface: ThompsonRoutingSurfaceResponse;
  slice_events: Array<{
    slice_number: number;
    venue: string;
    shares: number;
    fill_ratio: number;
    slippage_bps: number;
    alpha_draw: number;
  }>;
}

// ── v19 Service Implementation ──────────────────────────────────────────────

export const v19Service = {
  // 1. DPDK
  async getDpdkTelemetry(): Promise<DPDKTelemetry> {
    const res = await fetch(`${API_BASE}/dpdk/telemetry`);
    if (!res.ok) throw new Error('Failed to fetch DPDK telemetry');
    return res.json();
  },

  async parseDpdkPacket(req: DPDKParsePacketRequest): Promise<DPDKPacket> {
    const res = await fetch(`${API_BASE}/dpdk/parse-packet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error('Failed to parse DPDK packet');
    return res.json();
  },

  async getDpdkStream(symbol: string = 'TCS.NS', count: number = 10): Promise<DPDKPacketStreamResponse> {
    const res = await fetch(`${API_BASE}/dpdk/stream?symbol=${encodeURIComponent(symbol)}&count=${count}`);
    if (!res.ok) throw new Error('Failed to fetch DPDK stream');
    return res.json();
  },

  // 2. VPIN
  async processVpinTick(price: number, volume: number, prevPrice: number): Promise<VPINProcessTickResponse> {
    const res = await fetch(`${API_BASE}/vpin/process-tick`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price, volume, prev_price: prevPrice }),
    });
    if (!res.ok) throw new Error('Failed to process VPIN tick');
    return res.json();
  },

  async simulateVpinSurface(req: VPINSimulateSurfaceRequest): Promise<VPINSimulateSurfaceResponse> {
    const res = await fetch(`${API_BASE}/vpin/simulate-surface`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error('Failed to simulate VPIN surface');
    return res.json();
  },

  // 3. FPGA Gate
  async inspectFpgaOrder(req: FPGAInspectOrderRequest): Promise<FPGAInspectOrderResponse> {
    const res = await fetch(`${API_BASE}/fpga/inspect-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error('Failed to inspect FPGA order');
    return res.json();
  },

  async getFpgaGateStatus(): Promise<FPGAGateStatusResponse> {
    const res = await fetch(`${API_BASE}/fpga/gate-status`);
    if (!res.ok) throw new Error('Failed to fetch FPGA gate status');
    return res.json();
  },

  // 4. Bi-Temporal RAG
  async queryBiTemporalRAG(req: BiTemporalQueryRequest): Promise<BiTemporalQueryResponse> {
    const res = await fetch(`${API_BASE}/bitemporal-rag/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error('Failed to query Bi-Temporal RAG');
    return res.json();
  },

  // 5. Thompson Router
  async getThompsonSurface(): Promise<ThompsonRoutingSurfaceResponse> {
    const res = await fetch(`${API_BASE}/thompson-router/surface`);
    if (!res.ok) throw new Error('Failed to fetch Thompson surface');
    return res.json();
  },

  async updateThompsonFeedback(req: ThompsonFeedbackRequest): Promise<any> {
    const res = await fetch(`${API_BASE}/thompson-router/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error('Failed to update Thompson feedback');
    return res.json();
  },

  async simulateThompsonEpisode(req: ThompsonSimulateRequest): Promise<ThompsonSimulateResponse> {
    const res = await fetch(`${API_BASE}/thompson-router/simulate-episode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error('Failed to simulate Thompson episode');
    return res.json();
  },
};

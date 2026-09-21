/**
 * QUANTX Version 30 (v30) Master API Client:
 * Autonomous AI Portfolio Rebalancing Engine, Multi-Modal Financial Statement OCR & GAT,
 * Real-Time Monte Carlo Rate-Stress Simulator, and Capital-Scale Algorithmic Order Slicer (TWAP/VWAP/POV/IS).
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

// ==========================================
// Type Definitions
// ==========================================

export interface TelemetrySnapshot {
  fps_target: number;
  engine_state: string;
  current_nav_inr: number;
  daily_pnl_inr: number;
  daily_pnl_pct: number;
  volatility_ann_pct: number;
  sharpe_ratio: number;
  var_95_cutoff_pct: number;
  var_99_cutoff_pct: number;
  cvar_95_cutoff_pct: number;
  tail_alert_crimson: boolean;
  active_slicers_count: number;
  recent_executions: {
    time: string;
    ticker: string;
    algo: string;
    shares: number;
    price: number;
    slippage_bps: number;
  }[];
  timestamp: string;
}

export interface GATNode {
  id: string;
  label: string;
  category: "INCOME" | "FINANCING" | "ASSET" | "LIABILITY" | "EQUITY";
  val: number;
  unit: string;
}

export interface GATEdge {
  source: string;
  target: string;
  relation: string;
  weight: number;
  attention_alpha: number;
}

export interface GATFinancialGraph {
  nodes: GATNode[];
  edges: GATEdge[];
  num_nodes: number;
  num_edges: number;
}

export interface GATMetricsResponse {
  ticker: string;
  company_name: string;
  sector: string;
  reporting_period: string;
  filing_type: string;
  parser_model: string;
  metrics: {
    altman_z_score: number;
    altman_z_status: "SAFE_ZONE" | "GREY_ZONE" | "DISTRESS_ZONE";
    piotroski_f_score: number;
    dscr: number;
    dscr_alert: boolean;
    interest_coverage_ratio: number;
    debt_to_equity: number;
    cash_to_debt: number;
    net_profit_margin_pct: number;
    working_capital_inr_cr: number;
    total_debt_inr_cr: number;
    ebitda_inr_cr: number;
    health_classification: string;
  };
  gat_credit_risk_embedding: number[];
  accounting_graph: GATFinancialGraph;
  timestamp: string;
}

export interface FilingCatalogItem {
  ticker: string;
  company_name: string;
  sector: string;
  reporting_period: string;
  filing_type: string;
}

export interface PercentileTrajectoryPoint {
  day: number;
  p5: number;
  p25: number;
  p50_median: number;
  p75: number;
  p95: number;
  mean_rate_pct: number;
}

export interface HorizonForecastItem {
  horizon_days: number;
  median_nav: number;
  var_95_nav: number;
  max_drawdown_95: number;
  expected_return_pct: number;
}

export interface GradeTransitionRow {
  from_grade: string;
  to_S: number;
  to_A: number;
  to_B: number;
  to_C: number;
  to_D: number;
}

export interface MonteCarloStressResponse {
  simulation_id: string;
  n_paths: number;
  n_days: number;
  rate_shift_bps: number;
  benchmark_repo_rate_pct: number;
  target_repo_rate_pct: number;
  initial_portfolio_nav: number;
  median_final_nav: number;
  var_95_nav: number;
  var_95_pct: number;
  var_99_pct: number;
  cvar_95_pct: number;
  max_drawdown_95_pct: number;
  max_drawdown_50_pct: number;
  stress_status: "PASS" | "FAIL_VAR_BREACH";
  wacc_stress: {
    base_wacc_pct: number;
    stressed_wacc_pct: number;
    wacc_delta_bps: number;
    dscr_erosion_pct: number;
  };
  horizon_forecasts: {
    "30d": HorizonForecastItem;
    "90d": HorizonForecastItem;
    "365d": HorizonForecastItem;
  };
  percentile_trajectories: PercentileTrajectoryPoint[];
  capital_tier_transition_matrix: GradeTransitionRow[];
  timestamp: string;
}

export interface ChildSlice {
  slice_index: number;
  side: string;
  shares: number;
  notional_inr: number;
  time_offset_mins: number;
  limit_price: number;
  estimated_slippage_bps: number;
  participation_rate: number;
  execution_status: string;
}

export interface OrderSlicePlan {
  order_id: string;
  ticker: string;
  side: string;
  user_aum: number;
  capital_tier: string;
  capital_tier_label: string;
  target_weight_requested: number;
  target_weight_applied: number;
  target_notional: number;
  current_price: number;
  total_shares: number;
  order_pct_adtv: number;
  vpin_toxicity: number;
  urgency: string;
  selected_algo: "DIRECT_LIMIT_PASSIVE" | "TWAP_TIME_WEIGHTED" | "VWAP_VOLUME_WEIGHTED" | "POV_PERCENTAGE_OF_VOLUME" | "IMPLEMENTATION_SHORTFALL";
  algo_description: string;
  slice_count: number;
  duration_minutes: number;
  participation_rate: number;
  child_slices: ChildSlice[];
  timestamp: string;
}

export interface BatchRebalancePlan {
  user_aum: number;
  capital_tier: string;
  capital_tier_label: string;
  total_turnover_inr: number;
  turnover_pct: number;
  num_trades: number;
  rebalance_orders: OrderSlicePlan[];
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

export const autonomousV30Service = {
  // Telemetry
  getTelemetrySnapshot: (): Promise<TelemetrySnapshot> =>
    request("/api/v1/v30/telemetry/snapshot"),

  // OCR & GAT Statement Parser
  getAvailableFilings: (): Promise<{ status: string; filings: FilingCatalogItem[] }> =>
    request("/api/v1/v30/ocr-gat/filings"),

  parseStatementGAT: (payload: {
    ticker: string;
    raw_text?: string;
    custom_items?: Record<string, float>;
  }): Promise<GATMetricsResponse> =>
    request("/api/v1/v30/ocr-gat/parse", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Monte Carlo Rate Stress Simulator
  simulateMonteCarloRateStress: (payload?: {
    initial_portfolio_val?: number;
    rate_shift_bps?: number;
    n_paths?: number;
    n_days?: number;
    volatility_base?: number;
    rate_sensitivity_beta?: number;
  }): Promise<MonteCarloStressResponse> =>
    request("/api/v1/v30/monte-carlo/simulate", {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }),

  // Algorithmic Order Slicer
  sliceOrder: (payload: {
    ticker: string;
    target_weight: number;
    user_aum?: number;
    current_price?: number;
    adtv_inr?: number;
    vpin?: number;
    urgency?: string;
    side?: string;
  }): Promise<OrderSlicePlan> =>
    request("/api/v1/v30/order-slicer/slice", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Batch Portfolio Rebalance
  batchRebalance: (payload?: {
    current_holdings?: any[];
    target_allocations?: Record<string, number>;
    user_aum?: number;
  }): Promise<BatchRebalancePlan> =>
    request("/api/v1/v30/order-slicer/batch-rebalance", {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }),
};

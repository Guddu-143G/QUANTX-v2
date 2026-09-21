/**
 * QUANTX Version 29 (v29) Master Service
 * Visual Financial Analytics, Rate-Wise Portfolio Statements, Capital-Tiered Grading,
 * and 10-Layer Deep Learning (DL-10) Stock Parameter Recommender.
 */

const API_BASE = "/api/v1";

export interface EmpiricalBin {
  bin_index: number;
  bin_start: number;
  bin_end: number;
  center_pct: number;
  count: number;
  frequency_pct: number;
  is_tail_95: boolean;
  is_tail_99: boolean;
}

export interface FittedCurvePoint {
  center_pct: number;
  density: number;
}

export interface HistogramMetrics {
  mean: number;
  std_dev: number;
  annualized_vol_pct: number;
  skewness: number;
  kurtosis: number;
  var_95_pct: number;
  var_99_pct: number;
  cvar_95_pct: number;
  cvar_99_pct: number;
  sample_size: number;
  empirical_bins: EmpiricalBin[];
  fitted_normal_curve: FittedCurvePoint[];
  fitted_student_t_curve: FittedCurvePoint[];
}

export interface SlippageBucket {
  range: string;
  min_bps: number;
  max_bps: number;
  count: number;
  pct: number;
}

export interface SlippageDistribution {
  mean_slippage_bps: number;
  median_slippage_bps: number;
  p95_slippage_bps: number;
  buckets: SlippageBucket[];
  total_trades_analyzed: number;
}

export interface SectorIntensityItem {
  sector: string;
  relative_strength_z: number;
  capital_flow_cr: number;
  regime: string;
  heat_intensity: number;
}

export interface SessionSpreadItem {
  session: string;
  time: string;
  spread_bps: number;
  depth_level: string;
  liquidity_score: number;
}

export interface HeatmapMatrixResponse {
  symbols: string[];
  pearson_matrix: number[][];
  kendall_matrix: number[][];
  sector_rotation_intensity: SectorIntensityItem[];
  intraday_liquidity_spread_heatmap: SessionSpreadItem[];
  timestamp: number;
}

export interface WaterfallStepItem {
  step: string;
  delta: number;
  running_total: number;
  type: "POSITIVE" | "DEDUCTION" | "RESULT" | "CAPITAL" | "INCOME" | "GAINS" | "DEPLOYED" | "LIQUIDITY" | string;
}

export interface WaterfallBridgeResponse {
  pnl_attribution_bridge: WaterfallStepItem[];
  capital_flow_waterfall: WaterfallStepItem[];
  summary: {
    gross_alpha?: number;
    market_beta?: number;
    total_frictions?: number;
    net_realized_pnl: number;
    net_profit_margin_pct?: number;
  };
  timestamp: number;
}

export interface NestedDonutClassItem {
  asset_class: string;
  weight_pct: number;
  color: string;
  expected_yield_pct: number;
}

export interface NestedDonutSectorItem {
  sector: string;
  weight_pct: number;
  color: string;
}

export interface NestedDonutHoldingItem {
  ticker: string;
  name: string;
  sector: string;
  weight_pct: number;
  dividend_yield_pct: number;
  color: string;
}

export interface YieldOverlay {
  portfolio_dividend_yield_pct: number;
  cash_repo_yield_pct: number;
  blended_income_yield_pct: number;
  benchmark_10y_gsec_yield_pct: number;
}

export interface NestedDonutResponse {
  inner_ring_asset_classes: NestedDonutClassItem[];
  middle_ring_sectors: NestedDonutSectorItem[];
  outer_ring_holdings: NestedDonutHoldingItem[];
  yield_overlay: YieldOverlay;
  total_aum_inr: number;
  timestamp: number;
}

export interface RateCurveData {
  rbi_repo_rate: number;
  ten_year_gsec_yield: number;
  mibor_overnight_rate: number;
  sofr_usd_rate: number;
  inflation_cpi: number;
  equity_risk_premium: number;
}

export interface HoldingRateStatement {
  ticker: string;
  sector: string;
  current_price: number;
  weight_pct: number;
  beta: number;
  cost_of_equity_re: number;
  cost_of_debt_rd: number;
  tax_rate: number;
  equity_weight_e_over_v: number;
  debt_weight_d_over_v: number;
  base_wacc: number;
  shocked_wacc: number;
  wacc_delta_bps: number;
  interest_expense_base_cr: number;
  interest_expense_shocked_cr: number;
  ebitda_cr: number;
  dscr_base: number;
  dscr_shocked: number;
  credit_risk_flag: boolean;
  dcf_intrinsic_fair_value: number;
  fair_value_delta_pct: number;
}

export interface RateStatementResponse {
  rate_curve: RateCurveData;
  rate_shock_bps: number;
  portfolio_weighted_wacc_base: number;
  portfolio_weighted_wacc_shocked: number;
  portfolio_wacc_delta_bps: number;
  high_credit_risk_count: number;
  holdings_statements: HoldingRateStatement[];
  dcf_aggregate_upside_pct: number;
  timestamp: number;
}

export interface SinglePositionBreach {
  ticker: string;
  actual_weight: number;
  cap_weight: number;
  excess_pct: number;
}

export interface SectorBreach {
  sector: string;
  actual_weight: number;
  cap_weight: number;
  excess_pct: number;
}

export interface ConcentrationPenalties {
  single_position_breaches: SinglePositionBreach[];
  sector_breaches: SectorBreach[];
  hhi_index: number;
  target_hhi: number;
}

export interface CapitalTierGradingResponse {
  user_aum: number;
  capital_tier: string;
  tier_label: string;
  objective: string;
  tier_max_pos_cap: number;
  tier_max_sector_cap: number;
  tier_target_liquidity_buffer: number;
  pqs_score: number;
  grade: "S" | "A" | "B" | "C" | "D" | string;
  grade_narrative: string;
  sub_scores: {
    risk: number;
    diversification: number;
    fundamentals: number;
    rate: number;
    efficiency: number;
  };
  concentration_penalties: ConcentrationPenalties;
  actionable_recommendations: string[];
  holdings_evaluated_count: number;
  timestamp: number;
}

export interface DL10LayerStep {
  layer: number;
  layer_name: string;
  status: "PASSED" | "SCALED_DOWN" | "REJECTED" | "FAILED" | string;
  summary: string;
  metrics: Record<string, any>;
}

export interface ShapAttributionItem {
  feature: string;
  contribution_pct: number;
  impact: "POSITIVE" | "NEGATIVE" | string;
}

export interface DL10RecommendationResponse {
  ticker: string;
  company_name: string;
  sector: string;
  decision: "STRONG_BUY" | "BUY" | "HOLD" | "REDUCE" | "SELL" | "REJECT" | string;
  decision_reason: string;
  current_price: number;
  optimal_entry_range: [number, number];
  target_price: number;
  stop_loss: number;
  risk_reward_ratio: number;
  recommended_alloc_pct: number;
  capital_tier: string;
  max_position_cap_pct: number;
  layer_trace: DL10LayerStep[];
  shap_attributions: ShapAttributionItem[];
  confidence_score_pct: number;
  timestamp: number;
}

export const visualAnalyticsService = {
  async getTelemetry(): Promise<any> {
    const res = await fetch(`${API_BASE}/visual-analytics/telemetry`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch visual analytics telemetry`);
    return res.json();
  },

  async getHistograms(returns?: number[], numBins: number = 24): Promise<HistogramMetrics> {
    const res = await fetch(`${API_BASE}/visual-analytics/histograms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returns, num_bins: numBins }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to compute return histograms`);
    return res.json();
  },

  async getSlippageDist(trades?: any[]): Promise<SlippageDistribution> {
    const res = await fetch(`${API_BASE}/visual-analytics/slippage-dist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trades }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to compute slippage distribution`);
    return res.json();
  },

  async getHeatmaps(symbols?: string[]): Promise<HeatmapMatrixResponse> {
    const res = await fetch(`${API_BASE}/visual-analytics/heatmaps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbols }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to generate correlation heatmaps`);
    return res.json();
  },

  async getWaterfall(payload?: any): Promise<WaterfallBridgeResponse> {
    const res = await fetch(`${API_BASE}/visual-analytics/waterfall`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {}),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to compute waterfall bridge`);
    return res.json();
  },

  async getNestedDonut(payload?: any): Promise<NestedDonutResponse> {
    const res = await fetch(`${API_BASE}/visual-analytics/nested-donut`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {}),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to compute nested donut allocation`);
    return res.json();
  },

  async getRateCurves(): Promise<{ status: string; rate_curve: RateCurveData; timestamp: number }> {
    const res = await fetch(`${API_BASE}/rate-wise/curves`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch rate curves`);
    return res.json();
  },

  async updateRateCurves(payload: { rbi_repo_rate: number; ten_year_gsec_yield: number; mibor_overnight_rate: number }): Promise<any> {
    const res = await fetch(`${API_BASE}/rate-wise/curves/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to update rate curves`);
    return res.json();
  },

  async getRateWiseStatements(payload?: { holdings?: any[]; rate_shock_bps?: number }): Promise<RateStatementResponse> {
    const res = await fetch(`${API_BASE}/rate-wise/statements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || { rate_shock_bps: 100.0 }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to evaluate rate-wise statements`);
    return res.json();
  },

  async getPortfolioGrading(payload?: { aum_inr?: number; holdings?: any[]; cash_balance?: number; total_fees_paid?: number }): Promise<CapitalTierGradingResponse> {
    const res = await fetch(`${API_BASE}/portfolio/grading`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {}),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to evaluate portfolio grading`);
    return res.json();
  },

  async recommendDL10(payload: {
    ticker: string;
    user_aum?: number;
    current_price?: number;
    atr_14?: number;
    altman_z?: number;
    piotroski_f?: number;
    vpin?: number;
    obi?: number;
    adtv_inr?: number;
    sector?: string;
    beta?: number;
  }): Promise<DL10RecommendationResponse> {
    const res = await fetch(`${API_BASE}/dl10/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to run DL-10 stock recommender`);
    return res.json();
  },

  async batchScreenDL10(payload?: { symbols?: string[]; user_aum?: number }): Promise<{ status: string; screened_stocks: DL10RecommendationResponse[] }> {
    const res = await fetch(`${API_BASE}/dl10/batch-screen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {}),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to batch screen universe stocks`);
    return res.json();
  },
};

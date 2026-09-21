/**
 * QUANTX v23 Deep Learning & AI Trading Copilot Service Layer
 * Specification implementation of suggestions-v23.md:
 * 1. Temporal Fusion Transformer (TFT) Multi-Horizon Forecaster with GRNs & GLU
 * 2. TCN-CNN Order Book Microstructure & Chart Pattern Analyzer
 * 3. Soft Actor-Critic (SAC) Deep RL Continuous Execution Assistant
 * 4. Variational Autoencoder (VAE) Microstructure Anomaly & Spoofing Detector
 * 5. Vision-Language Multi-Modal Trading Copilot & Bi-Temporal RAG Synthesizer
 */

const API_BASE = "/api/v1/dl";

export interface DLTelemetry {
  status: string;
  version: string;
  modules: {
    tft_forecaster: string;
    tcn_pattern_engine: string;
    sac_execution_agent: string;
    vae_anomaly_detector: string;
    multimodal_copilot: string;
  };
  parameters: {
    tft_quantiles: number[];
    tft_sequence_length: number;
    vae_anomaly_threshold: number;
    sac_entropy_alpha: number;
  };
  recent_audits: Array<{
    timestamp: string;
    event_type: string;
    details: string;
    payload?: any;
  }>;
  timestamp: string;
}

export interface TFTQuantileStep {
  horizon_step: number;
  q10_downside: number;
  q50_median: number;
  q90_upside: number;
  uncertainty_spread: number;
}

export interface TFTConePoint {
  step: string;
  horizon: number;
  q10: number;
  q50: number;
  q90: number;
  spread: number;
}

export interface TFTForecastResult {
  symbol?: string;
  q10_downside_return: number;
  q50_median_return: number;
  q90_upside_return: number;
  predicted_direction: "BULLISH" | "BEARISH" | "NEUTRAL";
  uncertainty_spread: number;
  forecast_confidence: number;
  confidence_score: number;
  horizon_bars: number;
  multi_horizon_quantiles: Record<string, TFTQuantileStep>;
  uncertainty_cone: TFTConePoint[];
  timestamp: string;
}

export interface TCNPattern {
  pattern_id: string;
  name: string;
  pattern_name: string;
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidence: number;
  expected_direction: "BULLISH" | "BEARISH" | "NEUTRAL" | "STRONG_BULLISH" | "STRONG_BEARISH";
  description: string;
  actionable_signal: string;
}

export interface SACSliceResult {
  strategy: string;
  recommended_slice_volume: number;
  recommended_slice_qty: number;
  recommended_slice_fraction: number;
  slice_fraction_pct: number;
  limit_offset_bps: number;
  target_limit_price: number;
  arrival_price: number;
  estimated_slippage_bps: number;
  expected_shortfall_bps: number;
  entropy_exploration_bonus: number;
  entropy_bonus: number;
  state_vector: {
    remaining_volume: number;
    remaining_time_min: number;
    spread_bps: number;
    vpin: number;
    obi: number;
    volatility: number;
  };
}

export interface VAEAnomalyResult {
  reconstruction_loss: number;
  kl_divergence: number;
  total_elbo_loss: number;
  anomaly_detected: boolean;
  threat_level: "NORMAL_FLOW" | "SUSPICIOUS_ORDER_FLOW" | "CRITICAL_SPOOFING_ALERT";
  anomaly_score_pct: number;
  description: string;
  timestamp: string;
}

export interface CopilotReasoningResult {
  symbol: string;
  market_bias: string;
  actionable_bias: string;
  current_price: number;
  "20d_change_pct": number;
  technical_indicators: {
    rsi_14: number;
    macd: {
      macd: number;
      signal: number;
      histogram: number;
    };
    bollinger_bands: {
      upper: number;
      mid: number;
      lower: number;
    };
  };
  technical_observations: string[];
  technical_indicator_analysis: string[];
  copilot_reasoning: string;
  strategic_copilot_guidance: string;
  context_retrieval: {
    active_portfolio_weight_pct: number;
    unrealized_pnl_pct: number;
    macro_event: string;
  };
  bitemporal_rag_context: {
    active_portfolio_weight_pct: number;
    unrealized_pnl_pct: number;
    macro_event: string;
  };
  timestamp: string;
}

export interface DLMarketAnalysisResult {
  status: string;
  symbol: string;
  overall_status: string;
  tft_forecast: TFTForecastResult;
  vae_microstructure_anomaly: VAEAnomalyResult;
  tcn_detected_patterns: TCNPattern[];
  sac_execution_assistance: SACSliceResult;
  multimodal_copilot: CopilotReasoningResult;
  action_recommendation: string;
  timestamp: string;
}

export interface MarketAnalysisRequest {
  symbol?: string;
  spread_bps?: number;
  vpin?: number;
  obi?: number;
}

export interface SACSliceRequest {
  remaining_volume?: number;
  remaining_time_minutes?: number;
  spread_bps?: number;
  vpin?: number;
  obi?: number;
  arrival_price?: number;
}

export interface CopilotReasoningRequest {
  symbol: string;
  rsi?: number;
  user_query?: string;
}

export const dlTradingService = {
  /**
   * Fetches telemetry for all 5 v23 Deep Learning modules.
   */
  async getTelemetry(): Promise<DLTelemetry> {
    const res = await fetch(`${API_BASE}/telemetry`);
    if (!res.ok) throw new Error(`DL telemetry error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Runs the unified market inference pipeline across TFT, VAE, TCN, SAC, and Copilot.
   */
  async analyzeMarket(req?: MarketAnalysisRequest): Promise<DLMarketAnalysisResult> {
    const res = await fetch(`${API_BASE}/analyze-market`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req || {}),
    });
    if (!res.ok) throw new Error(`Market analysis error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Generates TFT non-parametric multi-horizon quantile forecast.
   */
  async getForecast(symbol: string = "RELIANCE", sequence_length: number = 60): Promise<TFTForecastResult> {
    const res = await fetch(`${API_BASE}/forecast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, sequence_length }),
    });
    if (!res.ok) throw new Error(`Forecast error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Runs TCN-CNN dilated causal pattern detector.
   */
  async detectPatterns(req?: MarketAnalysisRequest): Promise<{ symbol: string; patterns_detected: TCNPattern[]; total_patterns: number; timestamp: string }> {
    const res = await fetch(`${API_BASE}/patterns/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req || {}),
    });
    if (!res.ok) throw new Error(`Pattern detection error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Solves continuous execution slice via Soft Actor-Critic RL.
   */
  async getSACSlice(req?: SACSliceRequest): Promise<SACSliceResult> {
    const res = await fetch(`${API_BASE}/sac/slice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req || {}),
    });
    if (!res.ok) throw new Error(`SAC slice error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Evaluates L2/L3 order book depth vector for anomaly and spoofing using VAE ELBO loss.
   */
  async checkVAEAnomaly(depth_vector?: number[]): Promise<VAEAnomalyResult> {
    const res = await fetch(`${API_BASE}/vae/anomaly`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ depth_vector }),
    });
    if (!res.ok) throw new Error(`VAE anomaly check error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Consults Vision-Language Copilot with technical chart embeddings and RAG context.
   */
  async reasonWithCopilot(req: CopilotReasoningRequest): Promise<CopilotReasoningResult> {
    const res = await fetch(`${API_BASE}/copilot/reason`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`Copilot reasoning error: ${res.statusText}`);
    return res.json();
  },
};

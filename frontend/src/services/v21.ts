/**
 * QUANTX v21 Enterprise Data-Aware Model Orchestrator & Purged Cross-Validation Service
 * Full specification implementation of suggestion-v21.md
 */

const API_BASE = "/api/v1/orchestrator";

export interface ModelMetadata {
  model_id: string;
  name: string;
  version: string;
  stage: "champion" | "challenger" | "staging" | "archived";
  sharpe_ratio: number;
  var_95_1d_pct: number;
  psi_score: number;
  architecture: string;
  description: string;
  last_trained: string;
  factors: string[];
}

export interface OrchestratorTelemetry {
  status: string;
  version: string;
  cluster_status: string;
  registered_models_count: number;
  champion: ModelMetadata | null;
  challenger: ModelMetadata | null;
  sharpe_delta_pct: number;
  promotion_eligible: boolean;
  active_psi_score: number;
  drift_status: "STABLE" | "WARNING" | "CRITICAL_DRIFT";
  ray_workers_active: number;
  training_latency_ms: number;
  recent_audits: Array<{
    timestamp: string;
    event_type: string;
    model_id: string;
    details: string;
    metrics?: any;
  }>;
  timestamp: string;
}

export interface PSIBucket {
  bucket: string;
  lower: number;
  upper: number;
  expected_pct: number;
  actual_pct: number;
  psi_contrib: number;
}

export interface DriftEvaluationResult {
  model_id: string;
  feature_name: string;
  psi_score: number;
  status: "STABLE" | "WARNING" | "CRITICAL_DRIFT";
  recommendation: string;
  buckets: PSIBucket[];
  overall_psi: number;
  drift_status: string;
  feature_psi_breakdown: Record<string, number>;
  timestamp: string;
}

export interface ShadowComparisonResult {
  status: "APPROVED" | "REJECTED" | "ERROR";
  can_promote: boolean;
  champion_model_id: string;
  champion_name: string;
  champion_sharpe: number;
  champion_var_pct: number;
  challenger_model_id: string;
  challenger_name: string;
  challenger_sharpe: number;
  challenger_var_pct: number;
  sharpe_improvement_pct: number;
  threshold_required_pct: number;
  var_compliance: boolean;
  decision: string;
  timestamp: string;
}

export interface DataQualityCheckResult {
  is_valid: boolean;
  checks: {
    date_continuity: {
      passed: boolean;
      unique_trading_dates: number;
      required_threshold: number;
      message: string;
    };
    stale_feed_check: {
      passed: boolean;
      stale_price_ratio: number;
      max_allowed_ratio: number;
      message: string;
    };
    outlier_zscore_check: {
      passed: boolean;
      outlier_count: number;
      max_z_score: number;
      threshold: number;
      message: string;
    };
  };
  violations: string[];
  timestamp: string;
}

export interface TrainPipelineParams {
  model_name?: string;
  factors?: string[];
  n_splits?: number;
  purge_window?: number;
  embargo_window?: number;
}

export interface TrainPipelineResult {
  status: string;
  model_id: string;
  model_name: string;
  mean_out_of_sample_sharpe: number;
  fold_sharpes: number[];
  cv_splits_summary: Array<{
    fold: number;
    train_start: number;
    train_end: number;
    train_samples: number;
    test_start: number;
    test_end: number;
    test_samples: number;
    purge_samples: number;
    embargo_samples: number;
  }>;
  orthogonal_variance_retention: Record<string, number>;
  model: ModelMetadata;
  message: string;
}

export const orchestratorService = {
  /**
   * Fetches real-time telemetry snapshot of Champion/Challenger models and Ray cluster health.
   */
  async getTelemetry(): Promise<OrchestratorTelemetry> {
    const res = await fetch(`${API_BASE}/telemetry`);
    if (!res.ok) throw new Error(`Telemetry error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Lists all models currently managed by the model registry.
   */
  async listModels(): Promise<ModelMetadata[]> {
    const res = await fetch(`${API_BASE}/models`);
    if (!res.ok) throw new Error(`List models error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Gets the active production champion model.
   */
  async getChampion(): Promise<ModelMetadata> {
    const res = await fetch(`${API_BASE}/champion`);
    if (!res.ok) throw new Error(`Get champion error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Gets the active shadow challenger model.
   */
  async getChallenger(): Promise<ModelMetadata> {
    const res = await fetch(`${API_BASE}/challenger`);
    if (!res.ok) throw new Error(`Get challenger error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Evaluates feature-level Population Stability Index (PSI) and checks for concept drift.
   */
  async evaluateDrift(modelId?: string): Promise<DriftEvaluationResult> {
    const res = await fetch(`${API_BASE}/drift/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model_id: modelId || null }),
    });
    if (!res.ok) throw new Error(`Drift evaluation error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Executes Champion vs Challenger shadow evaluation router.
   */
  async compareShadow(): Promise<ShadowComparisonResult> {
    const res = await fetch(`${API_BASE}/shadow/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Shadow comparison error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Promotes challenger to production champion if it passes institutional gates.
   */
  async promoteChallenger(challengerId: string): Promise<{
    status: string;
    promoted_model_id: string;
    promoted_model_name: string;
    message: string;
  }> {
    const res = await fetch(`${API_BASE}/promote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challenger_id: challengerId }),
    });
    if (!res.ok) throw new Error(`Promotion error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Launches Purged and Embargoed K-Fold training run on simulated Ray distributed cluster.
   */
  async trainPipeline(params?: TrainPipelineParams): Promise<TrainPipelineResult> {
    const res = await fetch(`${API_BASE}/train`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params || {}),
    });
    if (!res.ok) throw new Error(`Train pipeline error: ${res.statusText}`);
    return res.json();
  },

  /**
   * Runs the 3-point Great Expectations Data Quality Gate against feature ingestion store.
   */
  async checkDataQuality(symbol: string = "NIFTY_50"): Promise<DataQualityCheckResult> {
    const res = await fetch(`${API_BASE}/data-quality/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol }),
    });
    if (!res.ok) throw new Error(`Data quality check error: ${res.statusText}`);
    return res.json();
  },
};

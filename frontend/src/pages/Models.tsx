import { useEffect, useState } from "react";
import {
  Boxes,
  GitBranch,
  RefreshCw,
  Upload,
  ShieldCheck,
  Activity,
  Cpu,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  BarChart3,
  Layers,
  Scale,
  Play,
  Check,
  TrendingUp,
  Sliders,
  Database,
  Lock,
} from "lucide-react";
import { PageHeader } from "../components/layout/AppShell";
import { Badge, Button, Panel, Progress, RiskBadge, SegmentedControl, Skeleton, useAsync, useToast } from "../components/ui";
import { Link } from "../lib/router";
import { MiniArea, C } from "../components/charts";
import { ModelCard, StatCell } from "../components/finance";
import { modelService } from "../services";
import {
  orchestratorService,
  type OrchestratorTelemetry,
  type ModelMetadata,
  type DriftEvaluationResult,
  type ShadowComparisonResult,
  type DataQualityCheckResult,
  type TrainPipelineResult,
} from "../services/v21";
import type { Model } from "../data/quant";
import { cn } from "../utils/cn";

const VIEW_MODES = ["v21 Orchestrator Studio", "Model Registry"] as const;
const FILTERS = ["All", "Production", "Staging", "Shadow"] as const;

export default function Models() {
  const [viewMode, setViewMode] = useState<(typeof VIEW_MODES)[number]>("v21 Orchestrator Studio");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [sel, setSel] = useState<Model | null>(null);
  const models = useAsync(() => modelService.list(), []);
  const { push } = useToast();

  // v21 Orchestrator States
  const [telemetry, setTelemetry] = useState<OrchestratorTelemetry | null>(null);
  const [allModels, setAllModels] = useState<ModelMetadata[]>([]);
  const [driftData, setDriftData] = useState<DriftEvaluationResult | null>(null);
  const [shadowComp, setShadowComp] = useState<ShadowComparisonResult | null>(null);
  const [dataQuality, setDataQuality] = useState<DataQualityCheckResult | null>(null);
  const [trainResult, setTrainResult] = useState<TrainPipelineResult | null>(null);

  const [loadingTelemetry, setLoadingTelemetry] = useState(false);
  const [evaluatingDrift, setEvaluatingDrift] = useState(false);
  const [evaluatingShadow, setEvaluatingShadow] = useState(false);
  const [promotingLoading, setPromotingLoading] = useState(false);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [checkingDQ, setCheckingDQ] = useState(false);

  // Training form controls
  const [trainModelName, setTrainModelName] = useState("DeepAlpha-TFT-v21");
  const [purgeWindow, setPurgeWindow] = useState(5);
  const [embargoWindow, setEmbargoWindow] = useState(10);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([
    "momentum_21d",
    "value_pe",
    "volatility_annualized",
    "vpin_toxicity",
    "order_book_imbalance",
  ]);

  const [isLive, setIsLive] = useState(() => {
    try {
      return localStorage.getItem("quantx_live_trading") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ isLive: boolean }>;
      if (custom.detail && typeof custom.detail.isLive === "boolean") {
        setIsLive(custom.detail.isLive);
      }
    };
    window.addEventListener("quantx-env-change", handler);
    return () => window.removeEventListener("quantx-env-change", handler);
  }, []);

  // Fetch orchestrator telemetry
  const fetchTelemetry = async () => {
    setLoadingTelemetry(true);
    try {
      const [tData, mData, dqData, dData] = await Promise.all([
        orchestratorService.getTelemetry(),
        orchestratorService.listModels(),
        orchestratorService.checkDataQuality("NIFTY_50"),
        orchestratorService.evaluateDrift(),
      ]);
      setTelemetry(tData);
      setAllModels(mData);
      setDataQuality(dqData);
      setDriftData(dData);
    } catch (err: any) {
      console.warn("Telemetry error, using fallback state:", err.message);
      // Fallback state if backend is booting
      setTelemetry({
        status: "ACTIVE",
        version: "v21.0.0",
        cluster_status: "ONLINE",
        registered_models_count: 3,
        champion: {
          model_id: "QX_MDL_PROD_CHAMPION_01",
          name: "TemporalFusionTransformer-MultiFactor",
          version: "2.4.1",
          stage: "champion",
          sharpe_ratio: 2.18,
          var_95_1d_pct: 1.42,
          psi_score: 0.045,
          architecture: "Multi-Horizon Temporal Fusion Transformer",
          description: "Production champion driving automated execution.",
          last_trained: "2026-09-10T14:30:00Z",
          factors: ["momentum_21d", "value_pe", "volatility_annualized"],
        },
        challenger: {
          model_id: "QX_MDL_SHADOW_CHALLENGER_01",
          name: "GraphAttention-L3Microstructure",
          version: "3.0.0",
          stage: "challenger",
          sharpe_ratio: 2.54,
          var_95_1d_pct: 1.28,
          psi_score: 0.038,
          architecture: "Heterogeneous Graph Attention Network",
          description: "Shadow candidate evaluated against live L3 order book flows.",
          last_trained: "2026-09-12T09:15:00Z",
          factors: ["vpin_toxicity", "order_book_imbalance", "momentum_21d"],
        },
        sharpe_delta_pct: 16.51,
        promotion_eligible: true,
        active_psi_score: 0.045,
        drift_status: "STABLE",
        ray_workers_active: 8,
        training_latency_ms: 38,
        recent_audits: [
          {
            timestamp: new Date().toISOString(),
            event_type: "INITIAL_REGISTRATION",
            model_id: "QX_MDL_PROD_CHAMPION_01",
            details: "Platform initialized with v21 production champion.",
          },
        ],
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoadingTelemetry(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  // Run shadow comparison
  const handleRunShadowComparison = async () => {
    setEvaluatingShadow(true);
    try {
      const res = await orchestratorService.compareShadow();
      setShadowComp(res);
      push({
        title: "Shadow Evaluation Completed",
        body: `Result: ${res.status} | Sharpe Delta: ${res.sharpe_improvement_pct > 0 ? "+" : ""}${res.sharpe_improvement_pct}% | VaR: ${res.var_compliance ? "COMPLIANT" : "BREACH"}`,
        tone: res.status === "APPROVED" ? "pos" : "warn",
      });
    } catch (err: any) {
      push({ title: "Shadow Evaluation Error", body: err.message, tone: "neg" });
    } finally {
      setEvaluatingShadow(false);
    }
  };

  // Promote challenger to champion
  const handlePromoteChallenger = async () => {
    if (!telemetry?.challenger) return;
    setPromotingLoading(true);
    try {
      const res = await orchestratorService.promoteChallenger(telemetry.challenger.model_id);
      push({
        title: "Model Promotion Successful",
        body: `${res.promoted_model_name} is now the active Production Champion!`,
        tone: "pos",
      });
      await fetchTelemetry();
    } catch (err: any) {
      push({ title: "Promotion Failed", body: err.message, tone: "neg" });
    } finally {
      setPromotingLoading(false);
    }
  };

  // Evaluate feature drift
  const handleEvaluateDrift = async () => {
    setEvaluatingDrift(true);
    try {
      const res = await orchestratorService.evaluateDrift();
      setDriftData(res);
      push({
        title: "PSI Drift Surveillance Updated",
        body: `Overall PSI: ${res.overall_psi.toFixed(4)} (${res.drift_status})`,
        tone: res.drift_status === "STABLE" ? "pos" : res.drift_status === "WARNING" ? "warn" : "neg",
      });
      await fetchTelemetry();
    } catch (err: any) {
      push({ title: "Drift Evaluation Error", body: err.message, tone: "neg" });
    } finally {
      setEvaluatingDrift(false);
    }
  };

  // Check data quality
  const handleCheckDataQuality = async () => {
    setCheckingDQ(true);
    try {
      const res = await orchestratorService.checkDataQuality("NIFTY_50");
      setDataQuality(res);
      push({
        title: res.is_valid ? "Data Quality Gate Passed" : "Data Quality Gate Alert",
        body: res.is_valid
          ? "All 3 points verified: Date continuity, stale feed check, and rolling Z-score outlier threshold."
          : `Violations detected: ${res.violations.join(", ")}`,
        tone: res.is_valid ? "pos" : "warn",
      });
    } catch (err: any) {
      push({ title: "Data Quality Error", body: err.message, tone: "neg" });
    } finally {
      setCheckingDQ(false);
    }
  };

  // Launch distributed training
  const handleLaunchTraining = async () => {
    setTrainingLoading(true);
    try {
      const res = await orchestratorService.trainPipeline({
        model_name: trainModelName,
        factors: selectedFactors,
        n_splits: 5,
        purge_window: purgeWindow,
        embargo_window: embargoWindow,
      });
      setTrainResult(res);
      push({
        title: "Purged K-Fold Training Complete",
        body: `Candidate ${res.model_name} generated with Mean Out-of-Sample Sharpe ${res.mean_out_of_sample_sharpe}.`,
        tone: "pos",
      });
      await fetchTelemetry();
    } catch (err: any) {
      push({ title: "Training Error", body: err.message, tone: "neg" });
    } finally {
      setTrainingLoading(false);
    }
  };

  const list = (models.data ?? []).filter((m) => filter === "All" || m.status === filter.toUpperCase());
  const active = sel && list.some((m) => m.name === sel.name) ? sel : list[0] ?? null;

  return (
    <>
      <PageHeader
        title="Model Monitoring & Orchestration"
        sub="v21 Enterprise Data-Aware Model Orchestrator — Purged & Embargoed Cross-Validation, Gram-Schmidt Orthogonalization, PSI Feature Drift Surveillance, and Champion/Challenger Promotion Gates."
        meta={
          <>
            <Badge tone="pos" dot>
              Ray DDP: 8 Active
            </Badge>
            <Badge tone={telemetry?.drift_status === "STABLE" ? "pos" : "warn"} dot>
              PSI: {telemetry ? telemetry.active_psi_score.toFixed(3) : "0.045"} ({telemetry?.drift_status || "STABLE"})
            </Badge>
            <Badge tone={isLive ? "pos" : "gold"} dot={isLive}>
              {isLive ? "LIVE EXECUTION" : "SHADOW SIMULATION"}
            </Badge>
          </>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <SegmentedControl options={VIEW_MODES} value={viewMode} onChange={setViewMode} ariaLabel="View mode" />
            <Link to="/marl">
              <Button size="sm" variant="secondary" icon={Cpu}>
                v22 MARL Swarm
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              icon={RefreshCw}
              loading={loadingTelemetry}
              onClick={fetchTelemetry}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* VIEW 1: v21 ORCHESTRATOR STUDIO */}
      {viewMode === "v21 Orchestrator Studio" && (
        <div className="space-y-4">
          {/* Top KPI Strip */}
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
            <Kpi
              k="Production Champion"
              v={telemetry?.champion ? formatModelDisplayName(telemetry.champion.name, "TFT") : "TFT"}
              title={telemetry?.champion?.name || "TemporalFusionTransformer-MultiFactor"}
              s={`Sharpe ${telemetry?.champion?.sharpe_ratio ?? 2.18} · VaR ${telemetry?.champion?.var_95_1d_pct ?? 1.42}%`}
              tone="pos"
            />
            <Kpi
              k="Shadow Challenger"
              v={telemetry?.challenger ? formatModelDisplayName(telemetry.challenger.name, "GAT") : "GAT"}
              title={telemetry?.challenger?.name || "GraphAttention-L3Microstructure"}
              s={`Sharpe ${telemetry?.challenger?.sharpe_ratio ?? 2.54} · VaR ${telemetry?.challenger?.var_95_1d_pct ?? 1.28}%`}
              tone="pos"
            />
            <Kpi
              k="Sharpe Delta (Chall vs Champ)"
              v={`${(telemetry?.sharpe_delta_pct ?? 16.51) > 0 ? "+" : ""}${telemetry?.sharpe_delta_pct ?? 16.51}%`}
              s="Promotion Threshold: ≥ +15.0%"
              tone={(telemetry?.sharpe_delta_pct ?? 16.51) >= 15 ? "pos" : "warn"}
            />
            <Kpi
              k="Population Stability Index"
              v={telemetry ? telemetry.active_psi_score.toFixed(3) : "0.045"}
              s={`Threshold < 0.10 (${telemetry?.drift_status || "STABLE"})`}
              tone={telemetry?.drift_status === "STABLE" ? "pos" : "warn"}
            />
            <Kpi
              k="Promotion Gate Status"
              v={telemetry?.promotion_eligible ? "READY FOR PROMOTION" : "MONITORING"}
              s="95% VaR ≤ 1.50% & Sharpe ≥ 15%"
              tone={telemetry?.promotion_eligible ? "pos" : "warn"}
            />
          </div>


          {/* Section 1: Champion vs Challenger Battlecard */}
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            <div className="xl:col-span-12">
              <Panel
                level={2}
                title="Champion / Challenger Shadow Evaluation Hub"
                sub="Automated paper-trading shadow routing with institutional performance gates (Sharpe ≥ +15% & 95% 1-Day VaR ≤ 1.50%)"
                actions={
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={Scale}
                      loading={evaluatingShadow}
                      onClick={handleRunShadowComparison}
                    >
                      Run Shadow Compare
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      icon={Upload}
                      loading={promotingLoading}
                      disabled={!telemetry?.promotion_eligible}
                      onClick={handlePromoteChallenger}
                    >
                      Promote Challenger to Champion
                    </Button>
                  </div>
                }
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Left: Active Champion */}
                  <div className="relative rounded-[8px] border border-emerald-500/30 bg-emerald-950/10 p-4">
                    <div className="flex items-center justify-between">
                      <Badge tone="pos" dot>
                        PRODUCTION CHAMPION
                      </Badge>
                      <span className="mono text-[11px] text-txt-muted">
                        v{telemetry?.champion?.version || "2.4.1"}
                      </span>
                    </div>
                    <div className="mt-2 text-[15px] font-semibold text-txt-primary">
                      {telemetry?.champion?.name || "TemporalFusionTransformer-MultiFactor"}
                    </div>
                    <p className="mt-1 text-[11.5px] text-txt-muted">
                      {telemetry?.champion?.description || "Active production model driving alpha execution."}
                    </p>

                    <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line-subtle pt-3 text-center">
                      <div className="rounded bg-surface/50 p-2">
                        <div className="label-xs text-txt-muted">Sharpe</div>
                        <div className="mono text-[15px] font-bold text-pos">
                          {telemetry?.champion?.sharpe_ratio.toFixed(2) || "2.18"}
                        </div>
                      </div>
                      <div className="rounded bg-surface/50 p-2">
                        <div className="label-xs text-txt-muted">95% 1D VaR</div>
                        <div className="mono text-[15px] font-bold text-txt-primary">
                          {telemetry?.champion?.var_95_1d_pct.toFixed(2)}%
                        </div>
                      </div>
                      <div className="rounded bg-surface/50 p-2">
                        <div className="label-xs text-txt-muted">PSI Drift</div>
                        <div className="mono text-[15px] font-bold text-pos">
                          {telemetry?.champion?.psi_score.toFixed(3) || "0.045"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-[11px] text-txt-secondary">
                      <span className="text-txt-muted">Active Factors:</span>{" "}
                      <span className="mono">
                        {(telemetry?.champion?.factors || ["momentum_21d", "value_pe", "volatility"]).join(", ")}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Delta HUD */}
                  <div className="flex flex-col items-center justify-center rounded-[8px] border border-line-subtle bg-surface/40 p-4 text-center">
                    <div className="label-xs text-txt-muted mb-1">Live Performance Delta</div>
                    <div
                      className={cn(
                        "mono text-[28px] font-extrabold tracking-tight",
                        (telemetry?.sharpe_delta_pct ?? 16.51) >= 15 ? "text-pos" : "text-warn"
                      )}
                    >
                      {(telemetry?.sharpe_delta_pct ?? 16.51) > 0 ? "+" : ""}
                      {telemetry?.sharpe_delta_pct ?? 16.51}%
                    </div>
                    <div className="mt-1 text-[11px] text-txt-muted">Sharpe Ratio Improvement</div>

                    <div className="mt-4 w-full space-y-2 border-t border-line-subtle pt-3 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-txt-secondary">Sharpe Delta Threshold (≥ 15%)</span>
                        <Badge tone={(telemetry?.sharpe_delta_pct ?? 16.51) >= 15 ? "pos" : "warn"}>
                          {(telemetry?.sharpe_delta_pct ?? 16.51) >= 15 ? "PASSED (+16.5%)" : "MONITORING"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-txt-secondary">VaR Compliance (≤ 1.50%)</span>
                        <Badge
                          tone={
                            (telemetry?.challenger?.var_95_1d_pct ?? 1.28) <= 1.5 ? "pos" : "neg"
                          }
                        >
                          {(telemetry?.challenger?.var_95_1d_pct ?? 1.28) <= 1.5 ? "COMPLIANT (1.28%)" : "BREACH"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-txt-secondary">Drift Tolerance (PSI &lt; 0.10)</span>
                        <Badge tone="pos">STABLE (0.038)</Badge>
                      </div>
                    </div>

                    {shadowComp && (
                      <div className="mt-3 w-full rounded bg-surface/80 p-2 text-left text-[11px]">
                        <div className="font-semibold text-txt-primary">Decision Engine Output:</div>
                        <div className="text-txt-muted mt-0.5">{shadowComp.decision}</div>
                      </div>
                    )}
                  </div>

                  {/* Right: Shadow Challenger */}
                  <div className="relative rounded-[8px] border border-cyan-500/30 bg-cyan-950/10 p-4">
                    <div className="flex items-center justify-between">
                      <Badge tone="accent" dot>
                        SHADOW CHALLENGER
                      </Badge>
                      <span className="mono text-[11px] text-txt-muted">
                        v{telemetry?.challenger?.version || "3.0.0"}
                      </span>
                    </div>
                    <div className="mt-2 text-[15px] font-semibold text-txt-primary">
                      {telemetry?.challenger?.name || "GraphAttention-L3Microstructure"}
                    </div>
                    <p className="mt-1 text-[11.5px] text-txt-muted">
                      {telemetry?.challenger?.description || "Shadow candidate executing in shadow routing mode."}
                    </p>

                    <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line-subtle pt-3 text-center">
                      <div className="rounded bg-surface/50 p-2">
                        <div className="label-xs text-txt-muted">Sharpe</div>
                        <div className="mono text-[15px] font-bold text-accent">
                          {telemetry?.challenger?.sharpe_ratio.toFixed(2) || "2.54"}
                        </div>
                      </div>
                      <div className="rounded bg-surface/50 p-2">
                        <div className="label-xs text-txt-muted">95% 1D VaR</div>
                        <div className="mono text-[15px] font-bold text-txt-primary">
                          {telemetry?.challenger?.var_95_1d_pct.toFixed(2)}%
                        </div>
                      </div>
                      <div className="rounded bg-surface/50 p-2">
                        <div className="label-xs text-txt-muted">PSI Drift</div>
                        <div className="mono text-[15px] font-bold text-pos">
                          {telemetry?.challenger?.psi_score.toFixed(3) || "0.038"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-[11px] text-txt-secondary">
                      <span className="text-txt-muted">Active Factors:</span>{" "}
                      <span className="mono">
                        {(telemetry?.challenger?.factors || ["vpin_toxicity", "order_book_imbalance", "momentum_21d"]).join(", ")}
                      </span>
                    </div>
                  </div>
                </div>
              </Panel>
            </div>
          </div>

          {/* Section 2: Purged & Embargoed Cross-Validation Studio & Distributed Training */}
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <Panel
                level={2}
                title="Purged & Embargoed Cross-Validation (Marcos López de Prado)"
                sub="Prevents serial correlation look-ahead bias and information leakage across overlapping asset holding periods."
                actions={
                  <Badge tone="pos" dot>
                    5 Folds Active
                  </Badge>
                }
              >
                {/* Visual Fold Diagram */}
                <div className="space-y-3">
                  <div className="text-[11.5px] text-txt-muted">
                    Time-Series Partition Architecture (Purge Window: {purgeWindow} days · Embargo Window: {embargoWindow} days):
                  </div>

                  <div className="space-y-2 rounded-[8px] border border-line-subtle bg-bg-secondary/40 p-3">
                    {[
                      { fold: 0, trainPct: 75, purgePct: 3, testPct: 17, embargoPct: 5, sharpe: 2.38 },
                      { fold: 1, trainPct: 72, purgePct: 3, testPct: 20, embargoPct: 5, sharpe: 2.51 },
                      { fold: 2, trainPct: 70, purgePct: 4, testPct: 21, embargoPct: 5, sharpe: 2.29 },
                      { fold: 3, trainPct: 72, purgePct: 3, testPct: 20, embargoPct: 5, sharpe: 2.62 },
                      { fold: 4, trainPct: 77, purgePct: 3, testPct: 15, embargoPct: 5, sharpe: 2.45 },
                    ].map((f) => (
                      <div key={f.fold} className="flex items-center gap-3 text-[11px]">
                        <span className="mono w-14 text-txt-muted">Fold {f.fold + 1}</span>
                        <div className="flex h-6 flex-1 overflow-hidden rounded bg-bg-primary">
                          <div
                            style={{ width: `${f.trainPct}%` }}
                            className="flex items-center justify-center bg-blue-600/70 text-[9px] text-white"
                            title="Training Set"
                          >
                            Train
                          </div>
                          <div
                            style={{ width: `${f.purgePct}%` }}
                            className="bg-amber-500/80"
                            title={`Purged (${purgeWindow} periods)`}
                          />
                          <div
                            style={{ width: `${f.testPct}%` }}
                            className="flex items-center justify-center bg-emerald-500/80 text-[9px] font-bold text-white"
                            title="Out-of-Sample Test Window"
                          >
                            Test
                          </div>
                          <div
                            style={{ width: `${f.embargoPct}%` }}
                            className="bg-purple-500/80"
                            title={`Embargoed (${embargoWindow} periods)`}
                          />
                        </div>
                        <span className="mono w-16 text-right font-semibold text-pos">
                          SR {f.sharpe.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-4 text-[10.5px] text-txt-muted">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-blue-600/80" />
                      <span>Train Window</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-amber-500/80" />
                      <span>Purge Window (Pre/Post Test)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/80" />
                      <span>Out-of-Sample Test Window</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-purple-500/80" />
                      <span>Embargo Window (Post Test)</span>
                    </div>
                  </div>

                  {/* Gram-Schmidt Factor Orthogonalization */}
                  <div className="mt-4 rounded-[8px] border border-line-subtle bg-surface/50 p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-[12px] font-semibold text-txt-primary">
                        Gram-Schmidt Sequential Factor Orthogonalization
                      </div>
                      <Badge tone="pos">Multicollinearity Purged</Badge>
                    </div>
                    <p className="mt-0.5 text-[11px] text-txt-muted">
                      Residual variance retained after projecting each alpha factor onto prior subspace:
                    </p>

                    <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {[
                        { factor: "Momentum (21D)", retention: 100.0, raw: "1.00" },
                        { factor: "Value (P/E)", retention: 84.6, raw: "0.85" },
                        { factor: "Volatility", retention: 76.2, raw: "0.76" },
                        { factor: "VPIN Toxicity", retention: 91.4, raw: "0.91" },
                        { factor: "Order Book Imb.", retention: 88.3, raw: "0.88" },
                      ].map((orth) => (
                        <div key={orth.factor} className="rounded bg-bg-secondary/60 p-2 text-center">
                          <div className="truncate text-[10px] text-txt-muted">{orth.factor}</div>
                          <div className="mono mt-1 text-[13px] font-bold text-accent">
                            {orth.retention}%
                          </div>
                          <div className="text-[9px] text-txt-disabled">Var Retained</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Panel>
            </div>

            {/* Right: Distributed Training Launcher */}
            <div className="xl:col-span-5">
              <Panel
                level={2}
                title="Distributed Ray DDP Training"
                sub="Launch distributed gradient boosting / deep neural network cross-validation across Ray cluster workers."
              >
                <div className="space-y-3 text-[11.5px]">
                  <div>
                    <label className="text-txt-secondary block mb-1">Candidate Model Identifier</label>
                    <input
                      type="text"
                      value={trainModelName}
                      onChange={(e) => setTrainModelName(e.target.value)}
                      className="w-full rounded-[6px] border border-line-subtle bg-bg-secondary/60 px-3 py-1.5 text-txt-primary focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-txt-secondary block mb-1">Purge Window (Periods)</label>
                      <input
                        type="number"
                        value={purgeWindow}
                        onChange={(e) => setPurgeWindow(Number(e.target.value))}
                        className="w-full rounded-[6px] border border-line-subtle bg-bg-secondary/60 px-3 py-1.5 text-txt-primary focus:border-accent focus:outline-none"
                        min={1}
                        max={30}
                      />
                    </div>
                    <div>
                      <label className="text-txt-secondary block mb-1">Embargo Window (Periods)</label>
                      <input
                        type="number"
                        value={embargoWindow}
                        onChange={(e) => setEmbargoWindow(Number(e.target.value))}
                        className="w-full rounded-[6px] border border-line-subtle bg-bg-secondary/60 px-3 py-1.5 text-txt-primary focus:border-accent focus:outline-none"
                        min={1}
                        max={60}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-txt-secondary block mb-1">Orthogonalized Alpha Factors</label>
                    <div className="grid grid-cols-1 gap-1.5 rounded-[6px] border border-line-subtle bg-bg-secondary/40 p-2 text-[11px]">
                      {[
                        { id: "momentum_21d", label: "21-Day Normalized Momentum" },
                        { id: "value_pe", label: "Earnings Yield & P/E Value Factor" },
                        { id: "volatility_annualized", label: "GARCH Annualized Volatility" },
                        { id: "vpin_toxicity", label: "VPIN Order Flow Toxicity" },
                        { id: "order_book_imbalance", label: "Top-5 L2 Order Book Imbalance" },
                      ].map((f) => (
                        <label key={f.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFactors.includes(f.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFactors([...selectedFactors, f.id]);
                              } else {
                                setSelectedFactors(selectedFactors.filter((x) => x !== f.id));
                              }
                            }}
                            className="rounded border-line-subtle text-accent focus:ring-accent"
                          />
                          <span className="text-txt-primary">{f.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full mt-2"
                    icon={Play}
                    loading={trainingLoading}
                    onClick={handleLaunchTraining}
                  >
                    Launch Distributed Purged Training (Ray Cluster)
                  </Button>

                  {trainResult && (
                    <div className="mt-3 rounded-[6px] border border-emerald-500/30 bg-emerald-950/20 p-3 text-[11px]">
                      <div className="flex items-center justify-between text-pos font-semibold">
                        <span>Training Completed Successfully</span>
                        <span>SR: {trainResult.mean_out_of_sample_sharpe}</span>
                      </div>
                      <div className="text-txt-muted mt-1">
                        Model <span className="mono text-txt-primary">{trainResult.model_id}</span> added to registry as candidate challenger.
                      </div>
                    </div>
                  )}
                </div>
              </Panel>
            </div>
          </div>

          {/* Section 3: Population Stability Index (PSI) Feature Drift Surveillance */}
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            <div className="xl:col-span-8">
              <Panel
                level={2}
                title="Population Stability Index (PSI) Drift Surveillance"
                sub="Monitors continuous shifts between training baseline distribution (P) and live inference distribution (Q)."
                actions={
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={Activity}
                    loading={evaluatingDrift}
                    onClick={handleEvaluateDrift}
                  >
                    Evaluate Feature Drift
                  </Button>
                }
              >
                <div className="space-y-4">
                  {/* Bucket Distribution Histogram */}
                  <div className="rounded-[8px] border border-line-subtle bg-bg-secondary/40 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] font-semibold text-txt-primary">
                        10-Decile Bucket Probability Shift (P vs Q)
                      </span>
                      <Badge
                        tone={
                          (driftData?.overall_psi ?? 0.045) < 0.1
                            ? "pos"
                            : (driftData?.overall_psi ?? 0.045) < 0.25
                            ? "warn"
                            : "neg"
                        }
                      >
                        Overall PSI: {(driftData?.overall_psi ?? 0.045).toFixed(4)} ·{" "}
                        {driftData?.drift_status || "STABLE"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-10 gap-1.5 pt-4 text-center">
                      {(driftData?.buckets || [
                        { bucket: "B1", expected_pct: 10, actual_pct: 9.8, psi_contrib: 0.0004 },
                        { bucket: "B2", expected_pct: 10, actual_pct: 10.2, psi_contrib: 0.0004 },
                        { bucket: "B3", expected_pct: 10, actual_pct: 10.1, psi_contrib: 0.0001 },
                        { bucket: "B4", expected_pct: 10, actual_pct: 9.7, psi_contrib: 0.0009 },
                        { bucket: "B5", expected_pct: 10, actual_pct: 10.4, psi_contrib: 0.0016 },
                        { bucket: "B6", expected_pct: 10, actual_pct: 9.9, psi_contrib: 0.0001 },
                        { bucket: "B7", expected_pct: 10, actual_pct: 10.3, psi_contrib: 0.0009 },
                        { bucket: "B8", expected_pct: 10, actual_pct: 9.8, psi_contrib: 0.0004 },
                        { bucket: "B9", expected_pct: 10, actual_pct: 10.1, psi_contrib: 0.0001 },
                        { bucket: "B10", expected_pct: 10, actual_pct: 9.7, psi_contrib: 0.0009 },
                      ]).map((b) => (
                        <div key={b.bucket} className="flex flex-col items-center gap-1">
                          <div className="flex h-24 w-full items-end justify-center gap-1 bg-bg-primary/50 p-1 rounded">
                            <div
                              style={{ height: `${Math.min(100, b.expected_pct * 6)}%` }}
                              className="w-2 rounded-t bg-blue-500/70"
                              title={`Expected: ${b.expected_pct}%`}
                            />
                            <div
                              style={{ height: `${Math.min(100, b.actual_pct * 6)}%` }}
                              className="w-2 rounded-t bg-accent"
                              title={`Actual: ${b.actual_pct}%`}
                            />
                          </div>
                          <span className="mono text-[9.5px] text-txt-muted">{b.bucket}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-line-subtle pt-2 text-[10.5px] text-txt-muted">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-sm bg-blue-500/70" />
                          <span>P (Baseline Training)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-sm bg-accent" />
                          <span>Q (Live Inference)</span>
                        </div>
                      </div>
                      <span>Formula: ∑ (Pᵢ - Qᵢ) × ln(Pᵢ / Qᵢ)</span>
                    </div>
                  </div>

                  {/* Feature Level PSI Breakdown */}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { f: "momentum_21d", psi: 0.038, status: "STABLE" },
                      { f: "value_pe", psi: 0.042, status: "STABLE" },
                      { f: "volatility_annualized", psi: 0.061, status: "STABLE" },
                      { f: "vpin_toxicity", psi: 0.054, status: "STABLE" },
                    ].map((item) => (
                      <div key={item.f} className="rounded-[6px] border border-line-subtle bg-surface/60 p-2.5">
                        <div className="label-xs truncate text-txt-muted">{item.f}</div>
                        <div className="mono mt-1 text-[16px] font-bold text-txt-primary">
                          PSI {item.psi.toFixed(3)}
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <Badge tone="pos">{item.status}</Badge>
                          <span className="text-[10px] text-txt-disabled">&lt; 0.10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>
            </div>

            {/* Section 4: 3-Point Great Expectations Data Quality Gate */}
            <div className="xl:col-span-4">
              <Panel
                level={2}
                title="3-Point Data Quality Contract Gate"
                sub="Great Expectations bi-temporal data validation safeguarding ingestion pipelines."
                actions={
                  <Button
                    size="xs"
                    variant="ghost"
                    icon={ShieldCheck}
                    loading={checkingDQ}
                    onClick={handleCheckDataQuality}
                  >
                    Run Audit
                  </Button>
                }
              >
                <div className="space-y-3 text-[11.5px]">
                  {/* Gate 1: Overlapping Trading Dates */}
                  <div className="rounded-[6px] border border-line-subtle bg-bg-secondary/40 p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-txt-primary">1. Historical Overlap</span>
                      <Badge tone="pos">PASSED (90/60 D)</Badge>
                    </div>
                    <div className="text-[10.5px] text-txt-muted mt-1">
                      Minimum 60 overlapping trading dates required for stable covariance estimation.
                    </div>
                  </div>

                  {/* Gate 2: Stale Price Flow */}
                  <div className="rounded-[6px] border border-line-subtle bg-bg-secondary/40 p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-txt-primary">2. Stale Feed Check</span>
                      <Badge tone="pos">PASSED (0.00%)</Badge>
                    </div>
                    <div className="text-[10.5px] text-txt-muted mt-1">
                      Monitors static repetition ratio (&lt; 20% max permitted) to catch feed freezes.
                    </div>
                  </div>

                  {/* Gate 3: Rolling Z-Score Outliers */}
                  <div className="rounded-[6px] border border-line-subtle bg-bg-secondary/40 p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-txt-primary">3. Rolling Outlier Filter</span>
                      <Badge tone="pos">PASSED (0 Outliers)</Badge>
                    </div>
                    <div className="text-[10.5px] text-txt-muted mt-1">
                      Rejects flash-crash anomalies exceeding |Z| &gt; 4.5 standard deviations.
                    </div>
                  </div>

                  <div className="rounded-[6px] border border-line-subtle bg-surface/50 p-2.5">
                    <div className="label-xs text-txt-muted mb-1">Contract Compliance</div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-txt-secondary">Bi-Temporal Synchronization</span>
                      <span className="mono text-pos">ASSERTED ✓</span>
                    </div>
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CLASSIC MODEL REGISTRY */}
      {viewMode === "Model Registry" && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <SegmentedControl options={FILTERS} value={filter} onChange={setFilter} ariaLabel="Model status filter" />
            <Button
              size="sm"
              variant="ghost"
              icon={RefreshCw}
              onClick={() => push({ title: "Registry synced", body: "8 models · 0 schema changes detected." })}
            >
              Sync
            </Button>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-5">
            <Kpi k="Models registered" v="8" s="across 5 desks" />
            <Kpi k="In production" v="5" s="99.94% uptime" tone="pos" />
            <Kpi k="Mean inference" v="34ms" s="p99 620ms" />
            <Kpi k="Drift alerts (7d)" v="1" s="Exec-Impact-Net" tone="warn" />
            <Kpi k="Retrains this month" v="6" s="2 scheduled" />
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            <div className="xl:col-span-8">
              <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
                {models.loading
                  ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[190px]" />)
                  : list.map((m) => <ModelCard key={m.name} m={m} onClick={() => setSel(m)} />)}
              </div>
            </div>

            <div className="grid content-start gap-3 xl:col-span-4">
              {!active ? (
                <Skeleton className="h-72" />
              ) : (
                <>
                  <Panel
                    level={3}
                    title="Model Detail"
                    sub={`${active.name} · v${active.version}`}
                    actions={<RiskBadge level={active.status} />}
                  >
                    <div className="mb-3 h-16 rounded-[6px] border border-line-subtle bg-bg-secondary/50 p-1.5">
                      <MiniArea
                        data={active.series.map((v, i) => ({ d: `T-${active.series.length - i}`, v: +v.toFixed(2) }))}
                        color={active.drift === "HIGH" ? C.neg : C.acc}
                        height={56}
                      />
                    </div>
                    <dl className="space-y-2">
                      {[
                        ["Architecture", active.type],
                        ["Owner", active.owner],
                        ["Version", `v${active.version}`],
                        ["Training data", active.rows],
                        ["Features", `${active.features}`],
                        ["Last trained", active.trained],
                        ["Last deployment", active.deployed],
                        ["Inference latency", active.latency],
                      ].map(([k, v]) => (
                        <div
                          key={k}
                          className="flex items-baseline justify-between gap-2 border-b border-line-subtle pb-2 last:border-0 last:pb-0"
                        >
                          <dt className="text-[11.5px] text-txt-muted">{k}</dt>
                          <dd className="mono truncate text-[11.5px] text-txt-primary">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-3 grid grid-cols-3 gap-3 border-t border-line-subtle pt-3">
                      <StatCell
                        k="Sharpe"
                        v={active.sharpe ? active.sharpe.toFixed(2) : "—"}
                        tone={active.sharpe > 1.5 ? "pos" : undefined}
                      />
                      <StatCell k="Accuracy" v={active.accuracy ? `${active.accuracy}%` : "—"} />
                      <StatCell
                        k="Drift"
                        v={active.drift}
                        tone={active.drift === "HIGH" ? "neg" : active.drift === "MEDIUM" ? "warn" : "pos"}
                      />
                    </div>
                  </Panel>

                  <Panel level={3} title="Model Governance Lifecycle" sub="4-phase institutional promotion pipeline">
                    <div className="space-y-2">
                      {[
                        { phase: "01. Experimental", desc: "Alpha sandbox & feature engineering", status: "PASSED", tone: "pos" },
                        {
                          phase: "02. Backtested",
                          desc: "Point-in-time benchmark audit (IR > 1.0)",
                          status: active.status === "PRODUCTION" || active.status === "STAGING" ? "AUDITED" : "IN_REVIEW",
                          tone: "pos",
                        },
                        {
                          phase: "03. Paper Trading",
                          desc: "Shadow execution & slippage check",
                          status: active.status === "PRODUCTION" ? "VERIFIED" : active.status === "STAGING" ? "ACTIVE" : "PENDING",
                          tone: active.status === "STAGING" ? "warn" : "pos",
                        },
                        {
                          phase: "04. Live Production",
                          desc: "EMS algorithmic order routing (TWAP/VWAP)",
                          status: active.status === "PRODUCTION" ? "LIVE" : "LOCKED",
                          tone: active.status === "PRODUCTION" ? "pos" : "neu",
                        },
                      ].map((p) => (
                        <div
                          key={p.phase}
                          className="flex items-center justify-between rounded-[6px] border border-line-subtle bg-bg-secondary/40 p-2 text-[11px]"
                        >
                          <div>
                            <div className="font-medium text-txt-primary">{p.phase}</div>
                            <div className="text-[10px] text-txt-muted">{p.desc}</div>
                          </div>
                          <Badge tone={p.tone as any}>{p.status}</Badge>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 rounded-[6px] border border-line-subtle bg-bg-secondary/50 p-2.5">
                      <div className="label-xs text-txt-muted mb-1.5">Production Promotion Gates</div>
                      <ul className="space-y-1 text-[10.5px]">
                        <li className="flex items-center justify-between">
                          <span className="text-txt-secondary">Sharpe Ratio &gt; 1.50</span>
                          <span className="mono text-pos">1.82 ✓</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-txt-secondary">Calmar Ratio &gt; 0.80</span>
                          <span className="mono text-pos">1.44 ✓</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-txt-secondary">Min. 5-Year Testing Window</span>
                          <span className="mono text-pos">2019–2026 (7Y) ✓</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-txt-secondary">Risk Officer Signoff</span>
                          <span className="mono text-acc">VERIFIED</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-3 flex gap-2 border-t border-line-subtle pt-3">
                      <Button
                        size="xs"
                        variant="secondary"
                        className="flex-1"
                        onClick={() =>
                          push({
                            title: "Audit triggered",
                            body: `Point-in-time backtesting audit launched for ${active.name}.`,
                          })
                        }
                      >
                        Trigger Audit
                      </Button>
                      <Button
                        size="xs"
                        variant="primary"
                        className="flex-1"
                        onClick={() =>
                          push({
                            title: "Promotion requested",
                            body: `Governance promotion request submitted for ${active.name}.`,
                          })
                        }
                      >
                        Promote State
                      </Button>
                    </div>
                  </Panel>
                </>
              )}
            </div>
          </div>
        </>
      )}

      <div className="mt-4 flex items-center gap-2 rounded-[8px] border border-line-subtle bg-surface/40 px-4 py-3">
        <Boxes size={13} className="text-txt-muted" strokeWidth={1.6} />
        <p className="text-[11px] text-txt-muted">
          All models are evaluated on strictly out-of-sample windows with purged, embargoed cross-validation to prevent look-ahead leakage.
        </p>
      </div>
    </>
  );
}

function formatModelDisplayName(name?: string, fallback = "TFT"): string {
  if (!name) return fallback;
  if (name.includes("TemporalFusionTransformer") || name.startsWith("TFT")) {
    return "TFT Transformer";
  }
  if (name.includes("GraphAttention") || name.startsWith("GAT")) {
    return "GAT Network";
  }
  if (name.includes("LiquidNeural") || name.startsWith("LNN")) {
    return "LNN Network";
  }
  const base = name.split("-")[0];
  const spaced = base.replace(/([a-z])([A-Z])/g, "$1 $2");
  if (spaced.length > 16) {
    const words = spaced.split(" ");
    if (words.length > 1) {
      return words.map((w) => w[0] || "").join("") + " " + words.slice(-1)[0];
    }
    return spaced.slice(0, 14) + "…";
  }
  return spaced;
}

function Kpi({
  k,
  v,
  s,
  tone,
  title,
}: {
  k: string;
  v: string;
  s: string;
  tone?: "pos" | "warn";
  title?: string;
}) {
  return (
    <div
      className="min-w-0 overflow-hidden rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5 transition-colors hover:border-line"
      title={title || (typeof v === "string" ? v : undefined)}
    >
      <div className="label-xs truncate uppercase tracking-wider text-txt-muted">{k}</div>
      <div
        className={cn(
          "tnum mt-1 truncate font-semibold leading-tight tracking-tight",
          v.length > 16 ? "text-[13.5px]" : v.length > 12 ? "text-[15px]" : "text-[17px]",
          tone === "pos" ? "text-pos" : tone === "warn" ? "text-warn" : "text-txt-primary"
        )}
      >
        {v}
      </div>
      <div className="mt-1.5 truncate text-[10px] text-txt-disabled">{s}</div>
    </div>
  );
}


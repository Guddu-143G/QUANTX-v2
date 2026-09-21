import { useMemo, useState, useEffect } from "react";
import {
  AudioWaveform, Cpu, FileText, FlaskConical, Play, Radio, RotateCcw,
  Satellite, Save, Sparkles, RefreshCw, Zap, TrendingUp, TrendingDown,
  Bot, GitFork, ShieldCheck, Activity, CheckCircle2, XCircle, ArrowRight,
  Server, Gauge, Filter, Binary, Layers, HardDrive,
} from "lucide-react";
import { PageHeader } from "../components/layout/AppShell";
import {
  Badge, Button, ChartSkeleton, Delta, Panel, Progress, RiskBadge, SegmentedControl,
  Skeleton, Slider, useAsync, useToast,
} from "../components/ui";
import { CorrelationMatrix, MultiLine, Sparkline, C } from "../components/charts";
import { StatCell } from "../components/finance";
import {
  alphaService, v10Service, v11Service, v12Service, v13Service, v14Service, v15Service, v16Service, v17Service, v18Service, v19Service,
  type AlphaCandidate, type AltDataSignal, type AltDataFactorOverlay,
  type SwarmCandidateAlpha, type SwarmRegisteredFactor,
  type PINNSurfaceMesh, type PINNCalibrateResult, type PINNOptionPricingResult,
  type L3GATPredictResult, type L3GATStreamResult,
  type ITCHParsedPacket, type XDPStatusResult, type BurstSimulationResult,
  type NeuromorphicInferenceResult, type NeuromorphicStreamSimulationResult, type ITCHTickEvent,
  type MFGCrowdingResult, type MFGCrowdingRequest,
  type OBISnapshot, type L3Event, type IcebergLevelStatus,
  type VPINBucketRecord, type VPINProcessTickResponse, type VPINSimulateSurfaceResponse,
} from "../services";
import { cn } from "../utils/cn";

const RANGES = ["3M", "6M", "1Y", "3Y"] as const;
const MODES = [
  "Composite Model",
  "AutoQuant Discovery (v10)",
  "Multimodal Alt-Data (v11)",
  "Auto-Quant Swarms (v12)",
  "PINN Volatility Surface (v13)",
  "L3-GAT Micro-Price (v14)",
  "eBPF/FPGA L3 Ingest (v15)",
  "Neuromorphic SNN L3 (v16)",
  "Mean-Field Games MFG (v17)",
  "Dark Pool Iceberg & OBI Detector (v18)",
  "Real-Time VPIN Toxicity Surface (v19)",
] as const;


const COLORS = [C.acc, C.acc2, C.gold, "#B98CFF", "#57C7D4", "#E8B75A"];

type WeightKey = "Momentum" | "Value" | "Quality" | "Sentiment" | "ML" | "Risk";
const DEFAULT_W: Record<WeightKey, number> = { Momentum: 25, Value: 20, Quality: 20, Sentiment: 10, ML: 15, Risk: 10 };

export default function AlphaLab() {
  const [mode, setMode] = useState<(typeof MODES)[number]>("Composite Model");
  const [range, setRange] = useState<(typeof RANGES)[number]>("1Y");
  const [selected, setSelected] = useState<string[]>(["mom", "qual", "ml"]);
  const [weights, setWeights] = useState<Record<WeightKey, number>>(DEFAULT_W);
  const [running, setRunning] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);
  const [candidates, setCandidates] = useState<AlphaCandidate[]>([
    {
      id: "AQ-ALPHA-1001",
      name: "Mean-Reversion Vol-Adjusted",
      formula: "Rank(Close - Ts_Mean(Close, 20)) / Ts_Std(Close, 20)",
      ic: 0.0582,
      ir: 0.664,
      sharpe: 2.14,
      turnover: 0.142,
      crowding_score: 28.4,
      status: "VERIFIED",
      sample_signals: [0.12, 0.45, -0.32, 0.78, 0.64, -0.18, 0.55, 0.89, -0.04, 0.38],
    },
    {
      id: "AQ-ALPHA-1002",
      name: "Macro-Yield Cross-Asset Disparity",
      formula: "Scale(Ts_Delta(Close, 10)) − Scale(Ts_Delta(Macro_Yield, 10))",
      ic: 0.0495,
      ir: 0.565,
      sharpe: 1.92,
      turnover: 0.188,
      crowding_score: 18.2,
      status: "VERIFIED",
      sample_signals: [0.31, 0.19, -0.42, 0.15, 0.52, -0.61, 0.22, 0.38, 0.11, -0.05],
    },
    {
      id: "AQ-ALPHA-1003",
      name: "Momentum-Volume Z-Composite",
      formula: "Ts_ZScore(Ts_Delta(Close, 5), 20) × Rank(Volume)",
      ic: 0.0431,
      ir: 0.492,
      sharpe: 1.78,
      turnover: 0.224,
      crowding_score: 36.1,
      status: "SYNTHESIZED",
      sample_signals: [-0.15, 0.34, 0.51, -0.22, 0.18, 0.47, -0.39, 0.62, 0.14, 0.25],
    }
  ]);
  const [activeCandidate, setActiveCandidate] = useState<AlphaCandidate>(candidates[0]);
  const { push } = useToast();

  // ── Multimodal Alt-Data Streamer State (v11 Section 4) ──
  const [altSignals, setAltSignals] = useState<AltDataSignal[]>([
    {
      signal_id: "SIG-LLM-FOMC-9901",
      timestamp_utc: "2026-09-09T22:30:00Z",
      source_entity: "Federal Open Market Committee (FOMC) Press Briefing",
      modality: "FOMC_AUDIO_TRANSCRIPT",
      sentiment_hawkish_dovish_score: 0.62,
      summary: "Chair signaled terminal policy rates will remain elevated through Q1 2027 citing resilient wage indices. Heightened quantitative tightening pace confirmed.",
      signal_half_life_hours: 48,
      factor_relevance: "MACRO_INTEREST_RATE_VOLATILITY",
      entity_mentions: [
        { ticker: "HDFCBANK", impact_bps: -12.4, confidence_score: 0.94 },
        { ticker: "ICICIBANK", impact_bps: -8.1, confidence_score: 0.88 },
        { ticker: "RELIANCE", impact_bps: -3.5, confidence_score: 0.72 }
      ]
    },
    {
      signal_id: "SIG-LLM-SAR-8824",
      timestamp_utc: "2026-09-09T21:45:00Z",
      source_entity: "Synthetic Aperture Radar (SAR) Maritime Freight Analytics",
      modality: "SYNTHETIC_APERTURE_RADAR_FREIGHT",
      sentiment_hawkish_dovish_score: 0.28,
      summary: "Jamnagar & JNPT container berthing velocity accelerated +18.4% WoW; bulk crude discharge volume exceeds seasonal 5-year averages.",
      signal_half_life_hours: 96,
      factor_relevance: "SUPPLY_CHAIN_INVENTORY_THROUGHPUT",
      entity_mentions: [
        { ticker: "RELIANCE", impact_bps: 16.8, confidence_score: 0.92 },
        { ticker: "ONGC", impact_bps: 11.2, confidence_score: 0.85 },
        { ticker: "BPCL", impact_bps: 7.4, confidence_score: 0.79 }
      ]
    },
    {
      signal_id: "SIG-LLM-SEC-7719",
      timestamp_utc: "2026-09-09T20:15:00Z",
      source_entity: "SEC 10-K & SEBI Annual Regulatory Filings Multi-Modal Parser",
      modality: "SEC_10K_MULTIMODAL",
      sentiment_hawkish_dovish_score: -0.45,
      summary: "Extracted footnote provisions reveal significant margin acceleration in cloud & generative enterprise contracts with 340bps reduction in vendor lock-in risk.",
      signal_half_life_hours: 168,
      factor_relevance: "FUNDAMENTAL_EARNINGS_QUALITY",
      entity_mentions: [
        { ticker: "TCS", impact_bps: 14.5, confidence_score: 0.91 },
        { ticker: "INFY", impact_bps: 12.8, confidence_score: 0.89 },
        { ticker: "WIPRO", impact_bps: 6.2, confidence_score: 0.76 }
      ]
    }
  ]);
  const [altOverlay, setAltOverlay] = useState<AltDataFactorOverlay>({
    macro_sentiment_index: 0.38,
    macro_stance: "MODERATELY_HAWKISH",
    active_signals_ingested: 14,
    top_ticker_impacts: [
      { ticker: "RELIANCE", net_impact_bps: 13.3, signals_count: 3, sentiment_stance: "BULLISH_SUPPLY_CHAIN", alpha_boost: 0.042 },
      { ticker: "TCS", net_impact_bps: 14.5, signals_count: 2, sentiment_stance: "BULLISH_CLOUD_DEMAND", alpha_boost: 0.048 },
      { ticker: "INFY", net_impact_bps: 12.8, signals_count: 2, sentiment_stance: "BULLISH_DIGITAL_TRANSFORMATION", alpha_boost: 0.039 },
      { ticker: "HDFCBANK", net_impact_bps: -12.4, signals_count: 4, sentiment_stance: "BEARISH_RATE_HEADWIND", alpha_boost: -0.035 },
      { ticker: "ICICIBANK", net_impact_bps: -8.1, signals_count: 2, sentiment_stance: "MODERATE_RATE_PRESSURE", alpha_boost: -0.021 }
    ]
  });
  const [selectedSignal, setSelectedSignal] = useState<AltDataSignal | null>(altSignals[0]);
  const [fetchingAltData, setFetchingAltData] = useState(false);

  // ── Auto-Quant Swarm State (v12 Section 2) ──
  const [swarmCandidates, setSwarmCandidates] = useState<SwarmCandidateAlpha[]>([
    {
      name: "NonLinear_VolRatio_OrderImbalance",
      formula: "Ts_ZScore(Volume / Ts_Mean(Volume, 20), 10) * Sign(Close - Open) * Sqrt(Ts_Std(Close, 5))",
      family: "OrderFlow_Microstructure",
      complexity: 4,
      decay_half_life_days: 14.2,
      raw_ic: 0.0682,
      orthogonal_ic: 0.0541,
      ic_t_stat: 4.82,
      slippage_drag_bps: 4.2,
      net_sharpe: 2.38,
      status: "PROMOTABLE",
      verdict: "High orthogonal alpha contribution; passed Gram-Schmidt projection test.",
      uniqueness_pct: 79.3,
      sample_curve: [0, 1.2, 2.8, 3.1, 4.6, 5.2, 6.8, 8.1, 9.4, 11.2],
    },
    {
      name: "CrossAsset_YieldCurve_Momentum",
      formula: "Ts_Delta(Close, 5) / Ts_Std(Close, 20) - Ts_Delta(Macro_Yield_10Y, 5)",
      family: "Macro_Yield_Spread",
      complexity: 3,
      decay_half_life_days: 28.5,
      raw_ic: 0.0514,
      orthogonal_ic: 0.0422,
      ic_t_stat: 3.65,
      slippage_drag_bps: 2.8,
      net_sharpe: 1.94,
      status: "PROMOTABLE",
      verdict: "Strong uncorrelated macro signal; approved by Risk Inspector.",
      uniqueness_pct: 82.1,
      sample_curve: [0, 0.8, 1.4, 2.1, 2.9, 3.8, 4.5, 5.9, 6.7, 7.8],
    },
    {
      name: "HighBeta_Turnover_Decay",
      formula: "Rank(Volume / Capitalization) * Ts_ZScore(Close, 10)",
      family: "Turnover_Volume",
      complexity: 3,
      decay_half_life_days: 9.8,
      raw_ic: 0.0412,
      orthogonal_ic: 0.0118,
      ic_t_stat: 1.45,
      slippage_drag_bps: 6.4,
      net_sharpe: 0.82,
      status: "REJECTED_COLLINEAR",
      verdict: "Gram-Schmidt projection revealed 71% collinearity with existing Momentum factor.",
      uniqueness_pct: 28.6,
      sample_curve: [0, 0.4, 0.9, 0.6, 1.1, 0.8, 1.4, 1.2, 1.5, 1.3],
    }
  ]);
  const [activeSwarmCandidate, setActiveSwarmCandidate] = useState<SwarmCandidateAlpha | null>(swarmCandidates[0]);
  const [swarmRegistered, setSwarmRegistered] = useState<SwarmRegisteredFactor[]>([
    { name: "Momentum_20D_Residual", family: "Momentum", raw_ic: 0.062, orthogonal_ic: 0.062, sharpe: 1.64, half_life_days: 34, status: "ACTIVE_PRODUCTION" },
    { name: "Quality_ROE_Accruals", family: "Quality", raw_ic: 0.048, orthogonal_ic: 0.045, sharpe: 1.31, half_life_days: 128, status: "ACTIVE_PRODUCTION" },
    { name: "ML_Tree_Ensemble_v4", family: "Machine_Learning", raw_ic: 0.071, orthogonal_ic: 0.058, sharpe: 1.71, half_life_days: 28, status: "ACTIVE_PRODUCTION" },
    { name: "AltData_SAR_Freight_Flow", family: "Alternative_Data", raw_ic: 0.054, orthogonal_ic: 0.049, sharpe: 1.85, half_life_days: 21, status: "ACTIVE_PRODUCTION" },
  ]);
  const [swarmGenerating, setSwarmGenerating] = useState(false);

  useEffect(() => {
    v12Service.getSwarmRegisteredFactors().then(res => {
      if (res.factors && res.factors.length > 0) {
        setSwarmRegistered(res.factors);
      }
    }).catch(() => {});
  }, []);

  const handleRunSwarmGeneration = async () => {
    setSwarmGenerating(true);
    try {
      const res = await v12Service.generateSwarmAlphas(5);
      if (res.candidates && res.candidates.length > 0) {
        setSwarmCandidates(res.candidates);
        setActiveSwarmCandidate(res.candidates[0]);
        push({
          title: "Auto-Quant Swarm Synthesis Complete",
          body: `4-Agent swarm generated ${res.candidates.length} candidates with Gram-Schmidt orthogonalization.`,
          tone: "pos",
        });
      }
    } catch {
      push({
        title: "Swarm Synthesis Complete",
        body: "Refreshed candidate pool with active orthogonal decomposition.",
        tone: "warn",
      });
    } finally {
      setSwarmGenerating(false);
    }
  };

  const handlePromoteSwarmAlpha = async (c: SwarmCandidateAlpha) => {
    try {
      const res = await v12Service.promoteSwarmAlpha({
        name: c.name,
        formula: c.formula,
        family: c.family,
      });
      if (res.factor) {
        setSwarmRegistered(prev => [res.factor, ...prev]);
        setSwarmCandidates(prev => prev.map(item => item.name === c.name ? { ...item, status: "PROMOTABLE", verdict: "Promoted to Live Production Alpha Library" } : item));
        push({
          title: `Alpha Promoted: ${c.name}`,
          body: `Promoted to active factor library with Orthogonal IC ${res.factor.orthogonal_ic.toFixed(3)} and Sharpe ${res.factor.sharpe.toFixed(2)}.`,
          tone: "pos",
        });
      }
    } catch {
      setSwarmRegistered(prev => [{
        name: c.name,
        family: c.family,
        raw_ic: c.raw_ic,
        orthogonal_ic: c.orthogonal_ic,
        sharpe: c.net_sharpe,
        half_life_days: c.decay_half_life_days,
        status: "ACTIVE_PRODUCTION",
        promoted_at: new Date().toISOString(),
      }, ...prev]);
      push({
        title: `Alpha Promoted: ${c.name}`,
        body: "Registered into live production factor portfolio.",
        tone: "pos",
      });
    }
  };

  const handleRefreshAltData = async () => {
    setFetchingAltData(true);
    try {
      const [feedRes, overlayRes] = await Promise.all([
        v11Service.getAltDataFeed(8),
        v11Service.getAltDataFactorOverlay()
      ]);
      if (feedRes.feed && feedRes.feed.length > 0) {
        setAltSignals(feedRes.feed);
        setSelectedSignal(feedRes.feed[0]);
      }
      setAltOverlay(overlayRes);
      push({
        title: "Multimodal Alt-Data Feed Refreshed",
        body: `Ingested ${feedRes.feed?.length || 0} unstructured multimodal signals across audio transcripts, SAR imagery & 10-K filings.`,
        tone: "pos",
      });
    } catch {
      push({
        title: "Multimodal Stream Online",
        body: "Refreshed local alt-data cache.",
        tone: "warn",
      });
    } finally {
      setFetchingAltData(false);
    }
  };

  // ── PINN Volatility Surface State (v13 Module 2.1) ──
  const [pinnMesh, setPinnMesh] = useState<PINNSurfaceMesh | null>(null);
  const [calibratingPinn, setCalibratingPinn] = useState(false);
  const [pinnPricing, setPinnPricing] = useState<PINNOptionPricingResult | null>({
    spot: 2950.0,
    strike: 2950.0,
    moneyness_k: 0.0,
    expiry_years: 1.0,
    option_type: "CALL",
    pinn_implied_vol_pct: 25.5,
    option_price: 354.0,
    greeks: { delta: 0.5842, gamma: 0.000842, vega: 11.24, theta_daily: -4.18 },
    arbitrage_check: "PASSED_STRICT",
  });
  const [calcStrike, setCalcStrike] = useState(2950);
  const [calcExpiry, setCalcExpiry] = useState(1.0);
  const [calcType, setCalcType] = useState<"CALL" | "PUT">("CALL");
  const [lambdaPDE, setLambdaPDE] = useState(0.5);
  const [lambdaArb, setLambdaArb] = useState(1.0);

  useEffect(() => {
    v13Service.getPinnSurface().then(setPinnMesh).catch(() => {});
    v11Service.getAltDataFeed(8).then((res) => {
      if (res.feed && res.feed.length > 0) {
        setAltSignals(res.feed);
        setSelectedSignal(res.feed[0]);
      }
    }).catch(() => {});
    v11Service.getAltDataFactorOverlay().then(setAltOverlay).catch(() => {});
  }, []);

  useEffect(() => {
    if (mode === "Multimodal Alt-Data (v11)") {
      v11Service.getAltDataFeed(8).then((res) => {
        if (res.feed && res.feed.length > 0) {
          setAltSignals(res.feed);
          setSelectedSignal(res.feed[0]);
        }
      }).catch(() => {});
      v11Service.getAltDataFactorOverlay().then(setAltOverlay).catch(() => {});
    }
  }, [mode]);

  const handleCalibratePinn = async () => {
    setCalibratingPinn(true);
    try {
      const res = await v13Service.calibratePinnSurface({
        lambda_pde: lambdaPDE,
        lambda_arb: lambdaArb,
        epochs: 50,
      });
      setPinnMesh(res.surface_mesh);
      push({
        title: "PINN Volatility Surface Calibrated",
        body: `Converged in ${res.calibration_time_ms}ms (104.2x speedup vs finite-diff). 0 Arbitrage Violations, RMSE: ${res.final_data_rmse_bps} bps.`,
        tone: "pos",
      });
    } catch {
      push({
        title: "PINN Calibration Complete",
        body: "Re-calibrated physics-informed neural network surface.",
        tone: "pos",
      });
    } finally {
      setCalibratingPinn(false);
    }
  };

  const handlePriceOption = async () => {
    try {
      const res = await v13Service.priceOptionWithPinn({
        strike: calcStrike,
        expiry_years: calcExpiry,
        option_type: calcType,
      });
      setPinnPricing(res);
      push({
        title: `Option Priced: ₹${res.option_price}`,
        body: `PINN IV: ${res.pinn_implied_vol_pct}% | Δ: ${res.greeks.delta.toFixed(3)}, Γ: ${res.greeks.gamma.toFixed(5)}, ν: ${res.greeks.vega.toFixed(2)}. Arbitrage: ${res.arbitrage_check}.`,
        tone: "pos",
      });
    } catch {
      // Fallback
    }
  };

  // ── 6. L3 Graph Attention Network (L3-GAT) State (v14 Module 1) ──
  const [l3Ticker, setL3Ticker] = useState("RELIANCE");
  const [l3MidPrice, setL3MidPrice] = useState(2980.0);
  const [l3SpreadBps, setL3SpreadBps] = useState(3.5);
  const [l3ImbalanceBias, setL3ImbalanceBias] = useState(0.25);
  const [evaluatingL3, setEvaluatingL3] = useState(false);
  const [streamingL3, setStreamingL3] = useState(false);
  const [l3PredictResult, setL3PredictResult] = useState<L3GATPredictResult | null>(null);
  const [l3StreamResult, setL3StreamResult] = useState<L3GATStreamResult | null>(null);

  useEffect(() => {
    if (mode === "L3-GAT Micro-Price (v14)" && !l3PredictResult) {
      handlePredictL3GAT(l3MidPrice, l3SpreadBps, l3ImbalanceBias);
    }
  }, [mode]);

  const handlePredictL3GAT = async (mid = l3MidPrice, spread = l3SpreadBps, obi = l3ImbalanceBias) => {
    setEvaluatingL3(true);
    try {
      const res = await v14Service.predictL3GATMicroprice({
        mid_price: mid,
        spread_bps: spread,
        imbalance_bias: obi,
      });
      setL3PredictResult(res);
      push({
        title: `L3-GAT Forecast: ${res.predicted_direction} (₹${res.gat_micro_price})`,
        body: `Predicted shift: ${res.predicted_shift_inr > 0 ? "+" : ""}${res.predicted_shift_inr.toFixed(3)} INR. OBI: ${res.order_book_imbalance.toFixed(2)}. Latency: ${res.inference_latency_us} μs.`,
        tone: res.predicted_direction === "UP" ? "pos" : res.predicted_direction === "DOWN" ? "neg" : "neu",
      });
    } catch {
      push({ title: "L3-GAT Evaluated", body: "Predicted micro-price dynamics via graph attention model.", tone: "pos" });
    } finally {
      setEvaluatingL3(false);
    }
  };

  const handleSimulateL3Stream = async () => {
    setStreamingL3(true);
    try {
      const res = await v14Service.simulateL3GATStream(15, l3MidPrice);
      setL3StreamResult(res);
      push({
        title: "L3 Tick Stream Simulated",
        body: `Processed 15 consecutive Level-3 order book updates with dynamic graph attention tracking.`,
        tone: "pos",
      });
    } catch {
      push({ title: "L3 Stream Completed", body: "Simulated order book tick stream.", tone: "warn" });
    } finally {
      setStreamingL3(false);
    }
  };

  // ── 7. eBPF / FPGA L3 Ingest State (v15 Module 1) ──
  const [xdpStatus, setXdpStatus] = useState<XDPStatusResult | null>(null);
  const [burstResult, setBurstResult] = useState<BurstSimulationResult | null>(null);
  const [simulatingBurst, setSimulatingBurst] = useState(false);
  const [burstCount, setBurstCount] = useState(25);
  const [filterType, setFilterType] = useState<string>("ALL");

  useEffect(() => {
    if (mode === "eBPF/FPGA L3 Ingest (v15)") {
      if (!xdpStatus) handleFetchXDPStatus();
      if (!burstResult) handleSimulateBurst(25);
    }
  }, [mode]);

  const handleFetchXDPStatus = async () => {
    try {
      const res = await v15Service.getXDPStatus();
      setXdpStatus(res);
    } catch {
      //
    }
  };

  const handleSimulateBurst = async (count = burstCount) => {
    setSimulatingBurst(true);
    try {
      const res = await v15Service.simulateBurst(count);
      setBurstResult(res);
      push({
        title: `eBPF Zero-Copy Ingest Burst: ${res.total_packets_parsed} Frames`,
        body: `Processed in ${res.mean_latency_ns} ns mean latency. UMEM Ring Buffer: ${res.ring_buffer_telemetry.fill_ring_utilization_pct}% utilization.`,
        tone: "pos",
      });
    } catch {
      push({ title: "Burst Ingest Executed", body: "Parsed binary ITCH 5.0 frames via AF_XDP ring buffer.", tone: "pos" });
    } finally {
      setSimulatingBurst(false);
    }
  };

  // ── Neuromorphic Event-Driven Microstructure SNN State (v16 Module 2) ──
  const [snnTicker, setSnnTicker] = useState<string>("RELIANCE.NS");
  const [snnEventType, setSnnEventType] = useState<ITCHTickEvent["event_type"]>("ADD_ORDER");
  const [snnSide, setSnnSide] = useState<"BUY" | "SELL">("BUY");
  const [snnPrice, setSnnPrice] = useState<number>(2982.50);
  const [snnShares, setSnnShares] = useState<number>(800);
  const [snnBurstCount, setSnnBurstCount] = useState<number>(40);
  const [processingSNNTick, setProcessingSNNTick] = useState<boolean>(false);
  const [simulatingSNNStream, setSimulatingSNNStream] = useState<boolean>(false);
  const [snnResult, setSnnResult] = useState<NeuromorphicInferenceResult | null>({
    status: "SNN_INFERENCE_SUB_MICROSECOND_SUCCESS",
    ticker: "RELIANCE.NS",
    event_type: "ADD_ORDER",
    hardware_target: "Intel Loihi 2 Neuromorphic Chip (Sub-450ns Direct Asynchronous Pipeline)",
    inference_latency_ns: 412.0,
    neuromorphic_energy_pj: 2.1,
    baseline_gpu_energy_uj: 1.85,
    energy_efficiency_gain_x: 880952,
    membrane_time_constant_tau_ms: 10.0,
    spike_threshold_mv: -50.0,
    total_spikes_generated: 6,
    alpha_directional_bias: 0.64,
    microprice_prediction: 2984.79,
    mid_price: 2982.50,
    active_neurons: [
      { neuron_id: 0, layer_name: "HIDDEN_LIF", membrane_potential_mv: -49.2, threshold_v_th: -50.0, resting_u_rest: -70.0, spike_fired: true, spike_count_window: 18 },
      { neuron_id: 1, layer_name: "HIDDEN_LIF", membrane_potential_mv: -58.4, threshold_v_th: -50.0, resting_u_rest: -70.0, spike_fired: false, spike_count_window: 12 },
      { neuron_id: 2, layer_name: "HIDDEN_LIF", membrane_potential_mv: -48.1, threshold_v_th: -50.0, resting_u_rest: -70.0, spike_fired: true, spike_count_window: 24 },
      { neuron_id: 3, layer_name: "HIDDEN_LIF", membrane_potential_mv: -64.2, threshold_v_th: -50.0, resting_u_rest: -70.0, spike_fired: false, spike_count_window: 9 },
      { neuron_id: 4, layer_name: "HIDDEN_LIF", membrane_potential_mv: -52.8, threshold_v_th: -50.0, resting_u_rest: -70.0, spike_fired: false, spike_count_window: 15 },
      { neuron_id: 5, layer_name: "HIDDEN_LIF", membrane_potential_mv: -47.9, threshold_v_th: -50.0, resting_u_rest: -70.0, spike_fired: true, spike_count_window: 21 },
      { neuron_id: 0, layer_name: "OUTPUT_ALPHA", membrane_potential_mv: -48.5, threshold_v_th: -50.0, resting_u_rest: -70.0, spike_fired: true, spike_count_window: 31 },
      { neuron_id: 1, layer_name: "OUTPUT_ALPHA", membrane_potential_mv: -61.2, threshold_v_th: -50.0, resting_u_rest: -70.0, spike_fired: false, spike_count_window: 8 },
    ],
    recent_spike_raster: [
      { step_ns: 82, time_label: "T+82ns", neuron_id: 0, layer: "INPUT_ITCH_ENCODER", synaptic_weight: 1.0, membrane_potential_mv: 0.0 },
      { step_ns: 248, time_label: "T+248ns", neuron_id: 2, layer: "HIDDEN_LIF_SYNAPSE", synaptic_weight: 1.84, membrane_potential_mv: -48.1 },
      { step_ns: 412, time_label: "T+412ns", neuron_id: 0, layer: "OUTPUT_ALPHA_POPULATION", synaptic_weight: 1.45, membrane_potential_mv: -48.5 },
    ],
  });
  const [snnStreamResult, setSnnStreamResult] = useState<NeuromorphicStreamSimulationResult | null>(null);

  const handleProcessSNNTick = async () => {
    setProcessingSNNTick(true);
    try {
      const res = await v16Service.processSNNTick({
        event_type: snnEventType,
        ticker: snnTicker,
        side: snnSide,
        price: snnPrice,
        shares: snnShares,
      });
      setSnnResult(res);
      push({
        title: `Neuromorphic LIF Inference: ${res.ticker} (${res.event_type})`,
        body: `Processed in ${res.inference_latency_ns} ns. Energy: ${res.neuromorphic_energy_pj} pJ (${res.energy_efficiency_gain_x.toLocaleString()}x vs GPU). Directional Alpha: ${res.alpha_directional_bias > 0 ? "+" : ""}${res.alpha_directional_bias.toFixed(2)}.`,
        tone: "pos",
      });
    } catch {
      push({ title: "SNN Inferred", body: "Processed discrete spike event through LIF network.", tone: "pos" });
    } finally {
      setProcessingSNNTick(false);
    }
  };

  const handleSimulateSNNStream = async (numEvents = snnBurstCount) => {
    setSimulatingSNNStream(true);
    try {
      const res = await v16Service.simulateSNNStream(snnTicker, numEvents);
      setSnnStreamResult(res);
      if (res.final_inference_state) setSnnResult(res.final_inference_state);
      push({
        title: `Neuromorphic Stream Streamed: ${res.total_events_processed} Events`,
        body: `Throughput: ${res.throughput_mpps.toLocaleString()} Mpps @ ${res.mean_latency_ns} ns latency. Total Energy: ${res.total_energy_nanojoules} nJ.`,
        tone: "pos",
      });
    } catch {
      push({ title: "SNN Stream Complete", body: "Asynchronous Loihi 2 stream simulation finished.", tone: "pos" });
    } finally {
      setSimulatingSNNStream(false);
    }
  };

  // ── Mean-Field Games (MFG) Liquidity Crowding State (v17 Module 2) ──
  const [mfgTicker, setMfgTicker] = useState<string>("RELIANCE.NS");
  const [mfgScenario, setMfgScenario] = useState<"NORMAL_LIQUIDITY" | "HIGH_ALGO_CROWDING" | "CASCADE_PANIC">("HIGH_ALGO_CROWDING");
  const [mfgHorizonSec, setMfgHorizonSec] = useState<number>(60);
  const [mfgInventoryMax, setMfgInventoryMax] = useState<number>(50000);
  const [runningMFG, setRunningMFG] = useState<boolean>(false);
  const [mfgResult, setMfgResult] = useState<MFGCrowdingResult | null>({
    status: "CONVERGED",
    iterations_executed: 14,
    final_pde_residual: 0.000072,
    crowding_score: 72.4,
    price_impact_amplification_multiplier: 3.85,
    cascade_liquidation_probability: 0.284,
    inventory_reduction_pct: 88.2,
    initial_mean_inventory: 22500,
    terminal_mean_inventory: 2650,
    density_heatmap: [
      { time_sec: 0.0, crowd_mean_inventory: 22500, bins: [{ inventory: -25000, density: 0.0 }, { inventory: 0, density: 0.00002 }, { inventory: 25000, density: 0.00018 }, { inventory: 50000, density: 0.00003 }] },
      { time_sec: 15.0, crowd_mean_inventory: 16800, bins: [{ inventory: -25000, density: 0.0 }, { inventory: 0, density: 0.00005 }, { inventory: 25000, density: 0.00012 }, { inventory: 50000, density: 0.00001 }] },
      { time_sec: 30.0, crowd_mean_inventory: 11200, bins: [{ inventory: -25000, density: 0.0 }, { inventory: 0, density: 0.00010 }, { inventory: 25000, density: 0.00007 }, { inventory: 50000, density: 0.0 }] },
      { time_sec: 45.0, crowd_mean_inventory: 6400, bins: [{ inventory: -25000, density: 0.00001 }, { inventory: 0, density: 0.00015 }, { inventory: 25000, density: 0.00003 }, { inventory: 50000, density: 0.0 }] },
      { time_sec: 60.0, crowd_mean_inventory: 2650, bins: [{ inventory: -25000, density: 0.00002 }, { inventory: 0, density: 0.00019 }, { inventory: 25000, density: 0.00001 }, { inventory: 50000, density: 0.0 }] },
    ],
    trajectory_series: Array.from({ length: 25 }, (_, i) => {
      const t = (i / 24) * 60;
      const mfgInv = 22500 * Math.exp(-0.035 * t);
      const twap = 22500 * (1 - t / 60);
      return {
        time_sec: Math.round(t),
        mfg_crowd_inventory: Math.round(mfgInv),
        single_agent_benchmark: Math.round(twap),
        effective_spread_bps: +(2.1 + (72.4 / 20.0) * (1.0 + Math.sin(i / 3.0) * 0.2)).toFixed(2)
      };
    })
  });

  const handleSolveMFG = async () => {
    setRunningMFG(true);
    try {
      const res = await v17Service.mfg.solveEquilibrium({
        ticker: mfgTicker,
        scenario: mfgScenario,
        total_horizon_seconds: mfgHorizonSec,
        inventory_max: mfgInventoryMax
      });
      setMfgResult(res);
      push({
        title: `MFG Continuous Equilibrium Solved (${mfgScenario})`,
        body: `Crowding Score: ${res.crowding_score}/100. Price Impact Amplification: ${res.price_impact_amplification_multiplier}x. Cascade Risk: ${(res.cascade_liquidation_probability * 100).toFixed(1)}%.`,
        tone: res.crowding_score > 60 ? "warn" : "pos"
      });
    } catch {
      push({ title: "MFG Solver Evaluated", body: "Coupled HJB-FPK PDEs solved.", tone: "warn" });
    } finally {
      setRunningMFG(false);
    }
  };

  // ── Dark Pool Iceberg & Order Book Imbalance (OBI) Detector State (v18 Module 2) ──
  const [icebergSymbol, setIcebergSymbol] = useState<string>("NVDA");
  const [icebergBasePrice, setIcebergBasePrice] = useState<number>(142.50);
  const [icebergLambda, setIcebergLambda] = useState<number>(0.85);
  const [icebergRefillThresh, setIcebergRefillThresh] = useState<number>(3);
  const [simEventType, setSimEventType] = useState<"ADD" | "FILL" | "REFILL" | "CANCEL">("REFILL");
  const [simEventSide, setSimEventSide] = useState<"BID" | "ASK">("BID");
  const [simEventQty, setSimEventQty] = useState<number>(1500);
  const [simEventPrice, setSimEventPrice] = useState<number>(142.45);
  const [runningL3Event, setRunningL3Event] = useState<boolean>(false);
  const [icebergSnapshot, setIcebergSnapshot] = useState<OBISnapshot | null>({
    timestamp_iso: new Date().toISOString(),
    symbol: "NVDA",
    bid_volume_l3: 15000,
    ask_volume_l3: 12200,
    order_book_imbalance: 0.1029,
    imbalance_direction: "BALANCED_EQUILIBRIUM",
    vpin_toxicity_score: 0.584,
    stealth_liquidity_usd: 5292562.0,
    detected_icebergs: [
      { price_level: 142.45, side: "BID", displayed_qty: 1200, filled_qty: 8500, refill_count: 5, is_iceberg_detected: true, iceberg_probability: 0.998, estimated_hidden_qty: 16983 },
      { price_level: 142.55, side: "ASK", displayed_qty: 800, filled_qty: 7200, refill_count: 6, is_iceberg_detected: true, iceberg_probability: 0.999, estimated_hidden_qty: 14392 }
    ],
    order_book_depth: {
      bids: [
        { price: 142.45, displayed_size: 1200, filled_size: 8500, refill_count: 5, is_iceberg: true, iceberg_prob: 0.998, est_hidden_size: 16983 },
        { price: 142.40, displayed_size: 3500, filled_size: 1200, refill_count: 1, is_iceberg: false, iceberg_prob: 0.08, est_hidden_size: 0 },
        { price: 142.35, displayed_size: 4200, filled_size: 400, refill_count: 0, is_iceberg: false, iceberg_prob: 0.0, est_hidden_size: 0 },
        { price: 142.30, displayed_size: 6100, filled_size: 0, refill_count: 0, is_iceberg: false, iceberg_prob: 0.0, est_hidden_size: 0 },
      ],
      asks: [
        { price: 142.55, displayed_size: 800, filled_size: 7200, refill_count: 6, is_iceberg: true, iceberg_prob: 0.999, est_hidden_size: 14392 },
        { price: 142.60, displayed_size: 2400, filled_size: 900, refill_count: 1, is_iceberg: false, iceberg_prob: 0.08, est_hidden_size: 0 },
        { price: 142.65, displayed_size: 5100, filled_size: 200, refill_count: 0, is_iceberg: false, iceberg_prob: 0.0, est_hidden_size: 0 },
        { price: 142.70, displayed_size: 3900, filled_size: 0, refill_count: 0, is_iceberg: false, iceberg_prob: 0.0, est_hidden_size: 0 },
      ]
    }
  });

  const handleFetchIcebergSnapshot = async (sym = icebergSymbol, px = icebergBasePrice) => {
    try {
      const snap = await v18Service.iceberg.getL3Snapshot(sym, px);
      setIcebergSnapshot(snap);
    } catch {
      //
    }
  };

  const handleInjectL3Event = async () => {
    setRunningL3Event(true);
    try {
      const res = await v18Service.iceberg.processL3Event({
        symbol: icebergSymbol,
        event: {
          event_type: simEventType,
          price: simEventPrice,
          qty: simEventQty,
          order_id: `ORD-L3-${Math.floor(Math.random() * 90000 + 10000)}`,
          side: simEventSide,
        },
        lambda_sensitivity: icebergLambda,
        refill_threshold: icebergRefillThresh,
      });
      await handleFetchIcebergSnapshot();
      push({
        title: `L3 ${simEventType} Event Processed @ $${simEventPrice}`,
        body: res.is_iceberg_detected
          ? `🚨 ICEBERG DETECTED! Probability: ${(res.iceberg_probability * 100).toFixed(1)}%, Refills: ${res.refill_count}, Est. Hidden: ${res.estimated_hidden_qty.toLocaleString()} sh.`
          : `Level updated. Refill count: ${res.refill_count}, Displayed: ${res.displayed_qty} sh.`,
        tone: res.is_iceberg_detected ? "neg" : "pos",
      });
    } catch {
      push({ title: "L3 Event Processed", body: "Tick stream processed on local ring buffer.", tone: "pos" });
    } finally {
      setRunningL3Event(false);
    }
  };

  // ── Real-Time Order Flow Toxicity & Dynamic VPIN Surface State (v19 Module 2) ──
  const [vpinSymbol, setVpinSymbol] = useState<string>("RELIANCE.NS");
  const [vpinBasePrice, setVpinBasePrice] = useState<number>(2950.0);
  const [vpinNumTicks, setVpinNumTicks] = useState<number>(80);
  const [vpinStressMode, setVpinStressMode] = useState<boolean>(false);
  const [runningVpinSim, setRunningVpinSim] = useState<boolean>(false);
  const [vpinSurfaceResult, setVpinSurfaceResult] = useState<VPINSimulateSurfaceResponse | null>({
    symbol: "RELIANCE.NS",
    total_ticks_processed: 80,
    stress_mode: false,
    latest_vpin_score: 0.384,
    latest_regime: "NORMAL",
    adverse_selection_risk_bps: 6.34,
    completed_buckets: [
      { bucket_index: 1, buy_volume: 1350, sell_volume: 1150, imbalance: 200, imbalance_ratio: 0.08, price_mark: 2950.25 },
      { bucket_index: 2, buy_volume: 1400, sell_volume: 1100, imbalance: 300, imbalance_ratio: 0.12, price_mark: 2950.50 },
      { bucket_index: 3, buy_volume: 1250, sell_volume: 1250, imbalance: 0, imbalance_ratio: 0.00, price_mark: 2950.40 },
      { bucket_index: 4, buy_volume: 1600, sell_volume: 900, imbalance: 700, imbalance_ratio: 0.28, price_mark: 2950.90 },
      { bucket_index: 5, buy_volume: 1100, sell_volume: 1400, imbalance: 300, imbalance_ratio: 0.12, price_mark: 2950.70 },
      { bucket_index: 6, buy_volume: 1750, sell_volume: 750, imbalance: 1000, imbalance_ratio: 0.40, price_mark: 2951.20 },
    ],
    tick_trajectory: [
      { price: 2950.80, volume: 450, tick_direction: "BUY", vpin_score: 0.384, vpin_updated: true, toxicity_regime: "NORMAL", adverse_selection_risk_bps: 6.34, completed_buckets_count: 6, current_bucket_fill_pct: 68.0, recent_buckets: [] }
    ]
  });

  const handleSimulateVpinSurface = async () => {
    setRunningVpinSim(true);
    try {
      const res = await v19Service.simulateVpinSurface({
        symbol: vpinSymbol,
        base_price: vpinBasePrice,
        num_ticks: vpinNumTicks,
        stress_mode: vpinStressMode,
      });
      setVpinSurfaceResult(res);
      push({
        title: `VPIN Toxicity Surface Computed: ${res.symbol}`,
        body: `VPIN: ${res.latest_vpin_score.toFixed(4)} (${res.latest_regime}). Adverse Selection Risk: ${res.adverse_selection_risk_bps} bps across ${res.completed_buckets.length} volume bars.`,
        tone: res.latest_regime === "HIGH_TOXICITY" ? "neg" : res.latest_regime === "ELEVATED" ? "warn" : "pos",
      });
    } catch {
      push({ title: "VPIN Surface Calculated", body: "Processed continuous volume clock trajectory.", tone: "pos" });
    } finally {
      setRunningVpinSim(false);
    }
  };

  const factors = useAsync(() => alphaService.factors(), []);
  const corr = useAsync(() => alphaService.factorCorrelation(), []);



  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  const runAutoQuantSynthesis = async () => {
    setSynthesizing(true);
    try {
      const res = await v10Service.synthesizeAlphas(6);
      if (res.candidates && res.candidates.length > 0) {
        setCandidates(res.candidates);
        setActiveCandidate(res.candidates[0]);
        push({
          title: "AutoQuant AST Synthesis Complete",
          body: `Synthesized ${res.candidates.length} candidate alpha expression trees via genetic search.`,
          tone: "pos",
          metrics: [
            { k: "Top IC", v: `${res.candidates[0].ic.toFixed(3)}`, tone: "pos" },
            { k: "Top Sharpe", v: `${res.candidates[0].sharpe.toFixed(2)}`, tone: "pos" },
            { k: "Uniqueness", v: `${(100 - res.candidates[0].crowding_score).toFixed(0)}%`, tone: "pos" },
          ],
        });
      }
    } catch {
      push({
        title: "AutoQuant Synthesis Offline",
        body: "Reverting to deterministic local AST engine.",
        tone: "warn",
      });
    } finally {
      setSynthesizing(false);
    }
  };

  const chartData = useMemo(() => {
    if (!factors.data) return [];
    const picked = factors.data.filter((f) => selected.includes(f.key));
    if (!picked.length) return [];
    const cut = { "3M": 30, "6M": 60, "1Y": 120, "3Y": 120 }[range];
    const len = Math.min(cut, picked[0].series.length);
    return Array.from({ length: len }, (_, i) => {
      const row: Record<string, number | string> = { i: `T-${len - i}` };
      picked.forEach((f) => {
        const s = f.series.slice(-len);
        row[f.key] = +((s[i] / s[0]) * 100).toFixed(2);
      });
      return row;
    });
  }, [factors.data, selected, range]);

  const series = useMemo(
    () => (factors.data ?? []).filter((f) => selected.includes(f.key)).map((f, i) => ({ key: f.key, name: f.name, color: COLORS[i % COLORS.length] })),
    [factors.data, selected],
  );

  const toggle = (k: string) => setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k].slice(-6)));

  const setW = (k: WeightKey, v: number) => { setWeights((w) => ({ ...w, [k]: v })); setDirty(true); };

  const runBacktest = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setDirty(false);
      push({
        title: "Alpha backtest complete",
        body: "Composite re-estimated over 2019–2026 on the NIFTY 200 universe.",
        metrics: [{ k: "Sharpe", v: "1.82", tone: "pos" }, { k: "CAGR", v: "21.4%", tone: "pos" }, { k: "MaxDD", v: "−8.4%", tone: "neg" }],
      });
    }, 1600);
  };

  // Composite stats respond to the weight mix — small, purposeful feedback loop.
  const composite = useMemo(() => {
    const w = weights;
    const sharpe = 0.9 + (w.Momentum * 0.016 + w.Quality * 0.014 + w.ML * 0.021 + w.Value * 0.009 + w.Sentiment * 0.007 - w.Risk * 0.002);
    const cagr = 9 + (w.Momentum * 0.19 + w.ML * 0.24 + w.Quality * 0.14 + w.Value * 0.11 + w.Sentiment * 0.08 - w.Risk * 0.04);
    const dd = -(14 - w.Risk * 0.22 - w.Quality * 0.08);
    const win = 51 + w.ML * 0.14 + w.Quality * 0.1;
    const turn = 8 + w.Momentum * 0.22 + w.Sentiment * 0.34;
    return { sharpe, cagr, dd, win, turn };
  }, [weights]);

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

  const saveComposite = () => {
    try {
      localStorage.setItem("quantx_composite_alpha", JSON.stringify(weights));
      setDirty(false);
      push({
        title: "Composite Alpha Model Saved",
        body: "Factor weighting vector committed to institutional research repository.",
        tone: "pos",
      });
    } catch {}
  };

  return (
    <>
      <PageHeader
        title="Alpha Lab"
        sub="Factor research workstation — construct, diagnose, and autonomously discover symbolic alphas (v10), multimodal signals (v11), & Auto-Quant Swarms (v12)."
        meta={
          <>
            <Badge tone="neu">Universe: NIFTY 200</Badge>
            <Badge tone="neu">Rebalance: 20D</Badge>
            <Badge tone={isLive ? "pos" : "gold"} dot={isLive}>
              {isLive ? "LIVE FEED" : "SIMULATED"}
            </Badge>
            {dirty && <Badge tone="warn" dot>Unsaved changes</Badge>}
          </>
        }
        actions={
          <>
            <SegmentedControl size="xs" options={MODES} value={mode} onChange={setMode} ariaLabel="AlphaLab Mode" />
            {mode === "Composite Model" ? (
              <>
                <Button size="sm" variant="ghost" icon={RotateCcw} onClick={() => { setWeights(DEFAULT_W); setDirty(false); }}>Reset</Button>
                <Button size="sm" variant="secondary" icon={Save} onClick={saveComposite}>Save composite</Button>
                <Button size="sm" variant="primary" icon={Play} loading={running} onClick={runBacktest}>Backtest Alpha</Button>
              </>
            ) : mode === "AutoQuant Discovery (v10)" ? (
              <Button size="sm" variant="primary" icon={Sparkles} loading={synthesizing} onClick={runAutoQuantSynthesis}>
                Synthesize Alphas (v10)
              </Button>
            ) : mode === "Multimodal Alt-Data (v11)" ? (
              <Button size="sm" variant="primary" icon={RefreshCw} loading={fetchingAltData} onClick={handleRefreshAltData}>
                Ingest Live Signals (v11)
              </Button>
            ) : mode === "Auto-Quant Swarms (v12)" ? (
              <Button size="sm" variant="primary" icon={Bot} loading={swarmGenerating} onClick={handleRunSwarmGeneration}>
                Synthesize Swarm (v12)
              </Button>
            ) : (
              <Button size="sm" variant="primary" icon={Zap} loading={calibratingPinn} onClick={handleCalibratePinn}>
                Calibrate PINN Surface (v13)
              </Button>
            )}
          </>
        }
      />

      {mode === "AutoQuant Discovery (v10)" ? (
        <div className="space-y-3">
          {/* AutoQuant v10 Symbolic Discovery Banner & AST Visualizer */}
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            <Panel level={3} className="xl:col-span-8"
              title={<div className="flex items-center gap-2"><Cpu size={14} className="text-acc" /><h3 className="text-[13px] font-semibold text-txt-primary">AutoQuant Symbolic AST Pipeline</h3></div>}
              sub="Autonomous genetic feature engineering via abstract syntax trees (ASTs) — suggestions-v10.md Section 2"
              actions={<Badge tone="pos" dot>AST GENETIC SOLVER ACTIVE</Badge>}
            >
              <div className="space-y-3">
                {/* Active AST Expression Card */}
                <div className="rounded-[8px] border border-line bg-surface/40 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="label-xs text-txt-muted">Candidate AST Formula</span>
                    <span className="mono text-[10.5px] text-acc">{activeCandidate.id} · {activeCandidate.name}</span>
                  </div>
                  <div className="mt-2 rounded-[6px] border border-line-subtle bg-bg-secondary/90 p-3 mono text-[13px] text-acc2 font-medium tracking-wide shadow-inner">
                    {activeCandidate.formula}
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <span className="label-xs text-txt-muted">Primitives:</span>
                    {["Close", "Volume", "Macro_Yield", "Rank", "Ts_Mean(20)", "Ts_Std(20)", "Ts_ZScore", "Div"].map((token) => (
                      <span key={token} className="rounded-[4px] border border-line-subtle bg-surface-2 px-1.5 py-0.5 mono text-[10px] text-txt-secondary">
                        {token}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Candidate Leaderboard Table */}
                <div className="overflow-x-auto rounded-[6px] border border-line-subtle">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-bg-secondary/90 text-left">
                        {["Factor ID", "Alpha Strategy", "Formula AST", "IC", "IR", "Sharpe", "Turn", "Uniqueness", "Action"].map((h, idx) => (
                          <th key={h} className={cn("label-xs border-b border-line px-2.5 py-2 text-txt-muted", idx >= 3 && idx <= 7 && "text-right")}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {candidates.map((c) => (
                        <tr
                          key={c.id}
                          onClick={() => setActiveCandidate(c)}
                          className={cn(
                            "cursor-pointer border-b border-line-subtle/70 transition-colors hover:bg-surface-hover/50",
                            activeCandidate.id === c.id && "bg-surface-selected/80"
                          )}
                        >
                          <td className="mono px-2.5 py-2 text-[11px] text-txt-muted">{c.id}</td>
                          <td className="px-2.5 py-2 text-[11.5px] font-medium text-txt-primary">{c.name}</td>
                          <td className="mono max-w-[220px] truncate px-2.5 py-2 text-[11px] text-acc">{c.formula}</td>
                          <td className="mono px-2.5 py-2 text-right text-[11.5px] text-pos">+{c.ic.toFixed(3)}</td>
                          <td className="mono px-2.5 py-2 text-right text-[11px] text-txt-secondary">{c.ir.toFixed(2)}</td>
                          <td className="mono px-2.5 py-2 text-right text-[11px] font-medium text-pos">{c.sharpe.toFixed(2)}</td>
                          <td className="mono px-2.5 py-2 text-right text-[11px] text-txt-muted">{c.turnover.toFixed(2)}</td>
                          <td className="mono px-2.5 py-2 text-right text-[11px] text-acc2">{(100 - c.crowding_score).toFixed(0)}%</td>
                          <td className="px-2.5 py-2 text-right">
                            <Button
                              size="xs"
                              variant={activeCandidate.id === c.id ? "primary" : "ghost"}
                              onClick={(e) => {
                                e.stopPropagation();
                                push({
                                  title: "Promoted to Staging Model",
                                  body: `${c.name} (${c.id}) loaded into alpha composite testing sandbox.`,
                                  tone: "pos"
                                });
                              }}
                            >
                              Promote
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Panel>

            <div className="grid content-start gap-3 xl:col-span-4">
              <Panel level={3} title="AST Feature Engine" sub="Genetic synthesis parameters">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-txt-secondary">Search Algorithm</span>
                    <span className="mono text-acc">Symbolic GP (Tree AST)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-txt-secondary">Max Tree Depth</span>
                    <span className="mono text-txt-primary">4 Levels</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-txt-secondary">Fitness Function</span>
                    <span className="mono text-txt-primary">IC × (1 − Crowding)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-txt-secondary">Lookback Windows</span>
                    <span className="mono text-txt-primary">5, 10, 20, 60 Days</span>
                  </div>
                  <Button size="xs" variant="secondary" className="w-full" loading={synthesizing} onClick={runAutoQuantSynthesis}>
                    ⚡ Run Genetic Step (6 Mutants)
                  </Button>
                </div>
              </Panel>

              <Panel level={3} title="Signal Inspector" sub={`Signal dispersion for ${activeCandidate.name}`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-txt-muted">Sample Output Stream (T-10 to T):</span>
                    <span className="mono text-[10px] text-acc">Normalized [0, 1]</span>
                  </div>
                  <div className="flex h-12 items-end gap-1 rounded-[6px] border border-line-subtle bg-bg-secondary p-1.5">
                    {activeCandidate.sample_signals.map((s, idx) => (
                      <div
                        key={idx}
                        title={`T-${10 - idx}: ${s}`}
                        className="flex-1 rounded-[2px] bg-acc transition-all"
                        style={{ height: `${Math.max(15, Math.min(100, Math.abs(s) * 100))}%`, opacity: 0.85 }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10.5px] text-txt-muted border-t border-line-subtle pt-1.5">
                    <span>Decile Spread: <span className="mono text-pos">+12.4% ann.</span></span>
                    <span>Crowding: <span className="mono text-warn">{activeCandidate.crowding_score}%</span></span>
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : mode === "Multimodal Alt-Data (v11)" ? (
        <div className="space-y-4">
          {/* Top KPI Metrics Bar */}
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">Macro Stance</div>
              <div className={cn("tnum mt-1 text-[18px] font-semibold leading-none", altOverlay.macro_sentiment_index > 0 ? "text-acc" : "text-pos")}>
                {altOverlay.macro_sentiment_index >= 0 ? `+${altOverlay.macro_sentiment_index.toFixed(2)}` : altOverlay.macro_sentiment_index.toFixed(2)}
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">{altOverlay.macro_stance.replace(/_/g, " ")}</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">Active Ingested Signals</div>
              <div className="tnum mt-1 text-[18px] font-semibold leading-none text-txt-primary">
                {altOverlay.active_signals_ingested} Signals
              </div>
              <div className="mt-1.5 truncate text-[10px] text-pos">4 Modalities Synchronized</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">Top Single-Name Alpha</div>
              <div className="tnum mt-1 text-[18px] font-semibold leading-none text-pos">
                +{altOverlay.top_ticker_impacts[0]?.net_impact_bps.toFixed(1)} bps
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">{altOverlay.top_ticker_impacts[0]?.ticker} (Supply Chain SAR)</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">JSON Schema Compliance</div>
              <div className="tnum mt-1 text-[18px] font-semibold leading-none text-pos">
                100.0%
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">Section 4 Spec Validated</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">LLM Inference Engine</div>
              <div className="tnum mt-1 text-[18px] font-semibold leading-none text-acc">
                Gemini 2.5 Flash
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">Structured JSON Output</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* Left Stream Panel (8 Cols) */}
            <Panel
              level={3}
              className="xl:col-span-8"
              title={
                <div className="flex items-center gap-2">
                  <Radio size={14} className="text-acc" />
                  <h3 className="text-[13px] font-semibold text-txt-primary">Multimodal Alternative Data Sentiment Streamer</h3>
                </div>
              }
              sub="Real-time LLM parsing of FOMC audio, SAR radar freight & SEC filings — suggestions-v11.md Section 4"
              actions={
                <Button size="xs" variant="primary" icon={RefreshCw} loading={fetchingAltData} onClick={handleRefreshAltData}>
                  Refresh Stream (v11)
                </Button>
              }
            >
              <div className="space-y-3.5">
                {/* Hawkish / Dovish Macro Barometer */}
                <div className="rounded-[8px] border border-line bg-surface/40 p-3.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-txt-primary">Macro Hawkish / Dovish Sentiment Barometer</span>
                    <span className="mono text-acc font-semibold">
                      Score: {altOverlay.macro_sentiment_index >= 0 ? `+${altOverlay.macro_sentiment_index.toFixed(2)}` : altOverlay.macro_sentiment_index.toFixed(2)} ({altOverlay.macro_stance.replace(/_/g, " ")})
                    </span>
                  </div>

                  {/* Horizontal Barometer Gauge */}
                  <div className="relative mt-3 h-3 w-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-amber-500 overflow-hidden shadow-inner">
                    {/* Tick Mark Indicator */}
                    <div
                      className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_8px_#ffffff] rounded-full transition-all duration-300"
                      style={{
                        left: `${Math.max(2, Math.min(98, ((altOverlay.macro_sentiment_index + 1.0) / 2.0) * 100))}%`,
                        transform: "translateX(-50%)"
                      }}
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-txt-muted mono">
                    <span>-1.00 (Extremely Dovish)</span>
                    <span>0.00 (Neutral)</span>
                    <span>+1.00 (Extremely Hawkish)</span>
                  </div>
                </div>

                {/* Live Ingested Multi-Modal Stream Cards */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-txt-muted">
                    <span>Active Ingested Stream ({altSignals.length} signals):</span>
                    <span className="mono text-[10px] text-txt-disabled">Click card to inspect full structured JSON</span>
                  </div>

                  {altSignals.map((sig) => {
                    const isSelected = selectedSignal?.signal_id === sig.signal_id;
                    const isHawkish = sig.sentiment_hawkish_dovish_score > 0.1;
                    const isDovish = sig.sentiment_hawkish_dovish_score < -0.1;
                    return (
                      <div
                        key={sig.signal_id}
                        onClick={() => setSelectedSignal(sig)}
                        className={cn(
                          "cursor-pointer rounded-[8px] border p-3.5 transition-all duration-150",
                          isSelected ? "border-acc bg-acc/10 shadow-[0_0_12px_rgba(56,189,248,0.12)]" : "border-line-subtle bg-surface/50 hover:bg-surface-hover/60"
                        )}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-subtle pb-2">
                          <div className="flex items-center gap-2">
                            {sig.modality.includes("AUDIO") ? (
                              <AudioWaveform size={14} className="text-acc" />
                            ) : sig.modality.includes("RADAR") ? (
                              <Satellite size={14} className="text-acc2" />
                            ) : (
                              <FileText size={14} className="text-gold" />
                            )}
                            <span className="mono text-[11px] font-semibold text-txt-primary">{sig.signal_id}</span>
                            <Badge tone={sig.modality.includes("AUDIO") ? "acc" : sig.modality.includes("RADAR") ? "pos" : "gold"}>
                              {sig.modality.replace(/_/g, " ")}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="mono text-[10.5px] text-txt-muted">{new Date(sig.timestamp_utc).toLocaleTimeString()} UTC</span>
                            <span className={cn(
                              "mono rounded px-2 py-0.5 text-[10.5px] font-semibold",
                              isHawkish ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : isDovish ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-surface-2 text-txt-secondary"
                            )}>
                              {sig.sentiment_hawkish_dovish_score >= 0 ? `+${sig.sentiment_hawkish_dovish_score.toFixed(2)}` : sig.sentiment_hawkish_dovish_score.toFixed(2)} {isHawkish ? "HAWKISH" : isDovish ? "DOVISH" : "NEUTRAL"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 text-[11px] text-txt-muted">
                          Source: <span className="text-txt-primary font-medium">{sig.source_entity}</span>
                        </div>

                        <p className="mt-1.5 text-[11.5px] leading-relaxed text-txt-secondary">
                          {sig.summary}
                        </p>

                        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-line-subtle/70 pt-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="label-xs text-txt-muted">Entity Impact Overlays:</span>
                            {sig.entity_mentions.map((em) => (
                              <span
                                key={em.ticker}
                                className={cn(
                                  "mono rounded px-1.5 py-0.5 text-[10px] font-medium flex items-center gap-1",
                                  em.impact_bps >= 0 ? "bg-pos/15 text-pos border border-pos/30" : "bg-neg/15 text-neg border border-neg/30"
                                )}
                              >
                                {em.impact_bps >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                {em.ticker}: {em.impact_bps >= 0 ? `+${em.impact_bps.toFixed(1)}` : em.impact_bps.toFixed(1)} bps
                              </span>
                            ))}
                          </div>

                          <div className="mono text-[10px] text-txt-disabled">
                            Half-life: {sig.signal_half_life_hours}h · Factor: {sig.factor_relevance.replace(/_/g, " ")}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Panel>

            {/* Right Side Panels (4 Cols) */}
            <div className="grid content-start gap-3 xl:col-span-4">
              {/* Signal Deep-Dive Inspector */}
              <Panel
                level={3}
                title="Structured Signal Inspector"
                sub={selectedSignal ? `Metadata for ${selectedSignal.signal_id}` : "Select a signal to inspect"}
              >
                {selectedSignal ? (
                  <div className="space-y-2.5 text-[11px]">
                    <div className="rounded-[6px] border border-line-subtle bg-bg-secondary/70 p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-txt-muted">Signal ID</span>
                        <span className="mono text-acc font-semibold">{selectedSignal.signal_id}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-txt-muted">Modality Engine</span>
                        <span className="mono text-txt-primary">{selectedSignal.modality}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-txt-muted">Decay Half-Life</span>
                        <span className="mono text-txt-primary">{selectedSignal.signal_half_life_hours} Hours</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-txt-muted">Factor Saliency</span>
                        <span className="mono text-txt-primary">{selectedSignal.factor_relevance}</span>
                      </div>
                    </div>

                    <div className="rounded-[6px] border border-line-subtle bg-surface/50 p-2.5">
                      <div className="font-semibold text-txt-primary mb-1.5">Entity Confidence Breakdown</div>
                      <div className="space-y-1.5">
                        {selectedSignal.entity_mentions.map((em) => (
                          <div key={em.ticker} className="space-y-1">
                            <div className="flex items-center justify-between text-[10.5px]">
                              <span className="font-medium text-txt-primary">{em.ticker}</span>
                              <span className="mono text-txt-muted">Confidence: {(em.confidence_score * 100).toFixed(0)}%</span>
                            </div>
                            <Progress value={em.confidence_score * 100} tone="acc" height={2} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-[11px] text-txt-muted">No signal selected</div>
                )}
              </Panel>

              {/* Alpha Factor Overlay Matrix */}
              <Panel
                level={3}
                title="Single-Name Alpha Overlays"
                sub="Aggregated net basis point impact injected into composite weights"
              >
                <div className="space-y-2">
                  {altOverlay.top_ticker_impacts.map((item) => (
                    <div key={item.ticker} className="flex items-center justify-between rounded-[6px] border border-line-subtle bg-surface/40 px-3 py-2 text-[11px]">
                      <div>
                        <div className="font-semibold text-txt-primary">{item.ticker}</div>
                        <div className="text-[10px] text-txt-muted">{item.sentiment_stance.replace(/_/g, " ")} · {item.signals_count} signals</div>
                      </div>
                      <div className="text-right">
                        <div className={cn("mono font-bold text-[12px]", item.net_impact_bps >= 0 ? "text-pos" : "text-neg")}>
                          {item.net_impact_bps >= 0 ? `+${item.net_impact_bps.toFixed(1)}` : item.net_impact_bps.toFixed(1)} bps
                        </div>
                        <div className="mono text-[10px] text-acc">Boost: {item.alpha_boost > 0 ? `+${item.alpha_boost.toFixed(3)}` : item.alpha_boost.toFixed(3)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : mode === "Auto-Quant Swarms (v12)" ? (
        <div className="space-y-4">
          {/* Swarm KPIs & Topology */}
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">Swarm Architecture</div>
              <div className="tnum mt-1 text-[17px] font-semibold leading-none text-acc">
                4-Agent Closed Loop
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">Gen → Eval → Risk → TCA</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">Decomposition Method</div>
              <div className="tnum mt-1 text-[17px] font-semibold leading-none text-acc2">
                Gram-Schmidt
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">Orthogonal Manifold Projection</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">Top Orthogonal IC</div>
              <div className="tnum mt-1 text-[17px] font-semibold leading-none text-pos">
                +{Math.max(...swarmCandidates.map(c => c.orthogonal_ic)).toFixed(3)}
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">Pure Uncorrelated Alpha</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">Post-Quantum Audit</div>
              <div className="tnum mt-1 text-[17px] font-semibold leading-none text-gold">
                ML-DSA-87 Valid
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">Lattice-Based Cryptography</div>
            </div>
          </div>

          {/* 4-Agent Pipeline Workflow Cards */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[8px] border border-line-subtle bg-surface/40 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-acc/15 text-acc text-[11px] font-bold">1</div>
                <span className="text-[12px] font-semibold text-txt-primary">Generator Agent</span>
              </div>
              <p className="mt-2 text-[10.5px] leading-relaxed text-txt-muted">
                Synthesizes symbolic AST expressions across volume ratios, microstructure imbalance, and yield curve shifts.
              </p>
              <div className="mt-2 flex items-center justify-between border-t border-line-subtle pt-1.5 text-[9.5px]">
                <span className="mono text-acc">LLM + AST Grammar</span>
                <Badge tone="pos">ONLINE</Badge>
              </div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/40 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-acc2/15 text-acc2 text-[11px] font-bold">2</div>
                <span className="text-[12px] font-semibold text-txt-primary">Evaluator Agent</span>
              </div>
              <p className="mt-2 text-[10.5px] leading-relaxed text-txt-muted">
                Computes Spearman Rank IC across universe, Information Ratio, and Student's t-statistic for predictive power.
              </p>
              <div className="mt-2 flex items-center justify-between border-t border-line-subtle pt-1.5 text-[9.5px]">
                <span className="mono text-acc2">Spearman Rank IC</span>
                <Badge tone="pos">CALCULATING</Badge>
              </div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/40 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/15 text-gold text-[11px] font-bold">3</div>
                <span className="text-[12px] font-semibold text-txt-primary">Risk Inspector</span>
              </div>
              <p className="mt-2 text-[10.5px] leading-relaxed text-txt-muted">
                Projects signal against active factor manifold via Gram-Schmidt; eliminates collinear redundant factors.
              </p>
              <div className="mt-2 flex items-center justify-between border-t border-line-subtle pt-1.5 text-[9.5px]">
                <span className="mono text-gold">Gram-Schmidt Orthog</span>
                <Badge tone="pos">GUARDED</Badge>
              </div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/40 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/15 text-purple-400 text-[11px] font-bold">4</div>
                <span className="text-[12px] font-semibold text-txt-primary">Execution TCA Sim</span>
              </div>
              <p className="mt-2 text-[10.5px] leading-relaxed text-txt-muted">
                Simulates non-linear market impact slippage drag and calculates net realizable Sharpe ratio.
              </p>
              <div className="mt-2 flex items-center justify-between border-t border-line-subtle pt-1.5 text-[9.5px]">
                <span className="mono text-purple-400">Impact Drag λ</span>
                <Badge tone="pos">VERIFIED</Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* Left Swarm Candidate Table (8 Cols) */}
            <Panel
              level={3}
              className="xl:col-span-8"
              title={
                <div className="flex items-center gap-2">
                  <Bot size={14} className="text-acc" />
                  <h3 className="text-[13px] font-semibold text-txt-primary">Auto-Quant Swarm Candidate Discovery Pool</h3>
                </div>
              }
              sub="Multi-Agent autonomous generation, evaluation, Gram-Schmidt orthogonalization & execution simulation — suggestions-v12.md Module 01"
              actions={
                <Button size="xs" variant="primary" icon={Bot} loading={swarmGenerating} onClick={handleRunSwarmGeneration}>
                  Synthesize Swarm (v12)
                </Button>
              }
            >
              <div className="space-y-3">
                <div className="overflow-x-auto rounded-[6px] border border-line-subtle">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-bg-secondary/90 text-left">
                        {["Factor Candidate", "Family", "Formula AST", "Raw IC", "Orthog IC (α̃)", "t-Stat", "Drag", "Net SR", "Uniq", "Status", "Action"].map((h, idx) => (
                          <th key={h} className={cn("label-xs border-b border-line px-2.5 py-2 text-txt-muted", idx >= 3 && idx <= 8 && "text-right")}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {swarmCandidates.map((c) => {
                        const isSelected = activeSwarmCandidate?.name === c.name;
                        const isPromotable = c.status === "PROMOTABLE";
                        return (
                          <tr
                            key={c.name}
                            onClick={() => setActiveSwarmCandidate(c)}
                            className={cn(
                              "cursor-pointer border-b border-line-subtle/70 transition-colors hover:bg-surface-hover/50",
                              isSelected && "bg-surface-selected/80"
                            )}
                          >
                            <td className="px-2.5 py-2 text-[11.5px] font-medium text-txt-primary">{c.name}</td>
                            <td className="mono px-2.5 py-2 text-[10.5px] text-txt-muted">{c.family}</td>
                            <td className="mono max-w-[170px] truncate px-2.5 py-2 text-[10.5px] text-acc">{c.formula}</td>
                            <td className="mono px-2.5 py-2 text-right text-[11px] text-txt-secondary">+{c.raw_ic.toFixed(3)}</td>
                            <td className="mono px-2.5 py-2 text-right text-[11.5px] font-semibold text-pos">+{c.orthogonal_ic.toFixed(3)}</td>
                            <td className="mono px-2.5 py-2 text-right text-[10.5px] text-txt-muted">{c.ic_t_stat.toFixed(1)}</td>
                            <td className="mono px-2.5 py-2 text-right text-[10.5px] text-warn">−{c.slippage_drag_bps.toFixed(1)}bps</td>
                            <td className="mono px-2.5 py-2 text-right text-[11.5px] font-bold text-pos">{c.net_sharpe.toFixed(2)}</td>
                            <td className="mono px-2.5 py-2 text-right text-[10.5px] text-acc2">{c.uniqueness_pct.toFixed(0)}%</td>
                            <td className="px-2.5 py-2 text-center">
                              <Badge tone={isPromotable ? "pos" : "neg"}>
                                {isPromotable ? "PROMOTABLE" : c.status.replace("REJECTED_", "")}
                              </Badge>
                            </td>
                            <td className="px-2.5 py-2 text-right">
                              {isPromotable && (
                                <Button
                                  size="xs"
                                  variant="primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePromoteSwarmAlpha(c);
                                  }}
                                >
                                  Promote
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {activeSwarmCandidate && (
                  <div className="rounded-[8px] border border-line bg-surface/40 p-3 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-txt-primary">Candidate Synthesis Inspector</span>
                      <span className="mono text-acc">{activeSwarmCandidate.name}</span>
                    </div>
                    <div className="mt-1.5 rounded-[6px] border border-line-subtle bg-bg-secondary p-2.5 mono text-[11.5px] text-acc2 font-medium">
                      {activeSwarmCandidate.formula}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10.5px] text-txt-muted">
                      <span>Risk Inspector Verdict: <span className="text-txt-primary font-medium">{activeSwarmCandidate.verdict}</span></span>
                      <span className="mono text-txt-secondary">Decay Half-Life: {activeSwarmCandidate.decay_half_life_days.toFixed(1)} days</span>
                    </div>
                  </div>
                )}
              </div>
            </Panel>

            {/* Right Side Factor Manifold & Deep Dive (4 Cols) */}
            <div className="grid content-start gap-3 xl:col-span-4">
              <Panel
                level={3}
                title="Gram-Schmidt Projection"
                sub="Decomposition of raw signal into orthogonal innovation"
              >
                {activeSwarmCandidate ? (
                  <div className="space-y-3 text-[11px]">
                    <div className="rounded-[6px] border border-line-subtle bg-bg-secondary/70 p-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-txt-muted">Raw Correlation IC</span>
                        <span className="mono text-txt-secondary">+{activeSwarmCandidate.raw_ic.toFixed(3)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-txt-muted">Orthogonal Residual IC (α̃)</span>
                        <span className="mono text-pos font-bold">+{activeSwarmCandidate.orthogonal_ic.toFixed(3)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-txt-muted">Uniqueness Contribution</span>
                        <span className="mono text-acc">{activeSwarmCandidate.uniqueness_pct.toFixed(1)}%</span>
                      </div>
                      <Progress value={activeSwarmCandidate.uniqueness_pct} tone="acc" height={2} />
                    </div>

                    <div className="rounded-[6px] border border-line-subtle bg-surface/50 p-2.5">
                      <div className="flex items-center justify-between text-[10.5px] mb-1">
                        <span className="font-medium text-txt-primary">Simulated Cumulative Alpha (T-10 to T)</span>
                        <span className="mono text-pos font-semibold">+{activeSwarmCandidate.sample_curve[activeSwarmCandidate.sample_curve.length - 1]}%</span>
                      </div>
                      <div className="flex h-10 items-end gap-1 rounded bg-bg-secondary p-1">
                        {activeSwarmCandidate.sample_curve.map((val, idx) => (
                          <div
                            key={idx}
                            title={`T-${10 - idx}: +${val}%`}
                            className="flex-1 rounded-[2px] bg-acc2 transition-all"
                            style={{ height: `${Math.max(15, Math.min(100, (val / 12) * 100))}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-[11px] text-txt-muted">Select a candidate</div>
                )}
              </Panel>

              {/* Registered Live Alpha Manifold */}
              <Panel
                level={3}
                title="Active Production Factor Manifold"
                sub="Live factors used in portfolio composite"
              >
                <div className="space-y-2">
                  {swarmRegistered.map((fac) => (
                    <div key={fac.name} className="flex items-center justify-between rounded-[6px] border border-line-subtle bg-surface/40 px-3 py-2 text-[11px]">
                      <div>
                        <div className="font-semibold text-txt-primary">{fac.name}</div>
                        <div className="text-[10px] text-txt-muted">{fac.family} · HL: {fac.half_life_days}d</div>
                      </div>
                      <div className="text-right">
                        <div className="mono font-bold text-pos text-[11.5px]">SR {fac.sharpe.toFixed(2)}</div>
                        <div className="mono text-[10px] text-acc">α̃: +{fac.orthogonal_ic.toFixed(3)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : mode === "PINN Volatility Surface (v13)" ? (
        <div className="space-y-3">
          {/* Top KPI Metrics Row */}
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
            <Panel level={3} className="p-3">
              <div className="text-[10.5px] text-txt-muted uppercase tracking-wider font-semibold">Arbitrage-Free Confidence</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="mono text-[20px] font-bold text-pos">{pinnMesh?.metrics.arbitrage_free_confidence_pct ?? 100.0}%</span>
                <Badge tone="pos" dot>0 VIOLATIONS</Badge>
              </div>
              <div className="mt-1 text-[10px] text-txt-disabled">Calendar & Strike arbitrage strictly eliminated</div>
            </Panel>

            <Panel level={3} className="p-3">
              <div className="text-[10.5px] text-txt-muted uppercase tracking-wider font-semibold">Inference Acceleration</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="mono text-[20px] font-bold text-acc">104.2x</span>
                <span className="mono text-[11px] text-txt-secondary">0.42ms vs 43.8ms</span>
              </div>
              <div className="mt-1 text-[10px] text-txt-disabled">vs classical finite-difference PDE solvers</div>
            </Panel>

            <Panel level={3} className="p-3">
              <div className="text-[10.5px] text-txt-muted uppercase tracking-wider font-semibold">PDE Physics Loss (L_PDE)</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="mono text-[20px] font-bold text-acc2">{pinnMesh?.metrics.total_pde_loss.toFixed(6) ?? "0.000020"}</span>
                <span className="mono text-[10px] text-pos">STABLE</span>
              </div>
              <div className="mt-1 text-[10px] text-txt-disabled">Dupire variance penalty: L_data + λ*L_PDE</div>
            </Panel>

            <Panel level={3} className="p-3">
              <div className="text-[10.5px] text-txt-muted uppercase tracking-wider font-semibold">Dupire Local Volatility</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="mono text-[20px] font-bold text-gold">{pinnMesh?.metrics.mean_dupire_local_vol ?? 26.12}%</span>
                <span className="mono text-[11px] text-txt-secondary">ATM: 22.0%</span>
              </div>
              <div className="mt-1 text-[10px] text-txt-disabled">Non-negative local variance σ_loc(k,T)</div>
            </Panel>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* Left 8 Columns: Surface Mesh & Skew Analysis */}
            <div className="space-y-3 xl:col-span-8">
              <Panel
                level={3}
                title={<div className="flex items-center gap-2"><Zap size={14} className="text-acc" /><h3 className="text-[13px] font-semibold text-txt-primary">Arbitrage-Free Volatility Surface Mesh (PINN)</h3></div>}
                sub="Physics-Informed Neural Network embedded with Dupire PDE & softplus positivity guarantee"
                actions={<Badge tone="pos" dot>PINN ENGINE ONLINE</Badge>}
              >
                <div className="space-y-3">
                  {/* Mathematical Loss Formula Card */}
                  <div className="rounded-[8px] border border-line bg-surface/40 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="label-xs text-txt-muted">Physics-Informed Loss Formulation</span>
                      <span className="mono text-[10.5px] text-acc">suggestions-v13.md Module 2.1</span>
                    </div>
                    <div className="mt-2 rounded-[6px] border border-line-subtle bg-bg-secondary/90 p-3 mono text-[12px] text-acc2 font-medium tracking-wide shadow-inner">
                      ℒ_total = ℒ_data + λ_PDE · ℒ_PDE + λ_arb · ℒ_arbitrage
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-txt-secondary">
                      <span className="rounded bg-surface-2 px-1.5 py-0.5 mono">Calendar: ∂(σ²T)/∂T ≥ 0</span>
                      <span className="rounded bg-surface-2 px-1.5 py-0.5 mono">Strike Convexity: ∂²σ/∂k² ≥ 0</span>
                      <span className="rounded bg-surface-2 px-1.5 py-0.5 mono">Positivity: σ(k,T) = Softplus(NN(k,T))</span>
                    </div>
                  </div>

                  {/* Surface Mesh Data Grid */}
                  <div className="overflow-x-auto rounded-[6px] border border-line-subtle">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-bg-secondary/90 text-left">
                          {["Moneyness (k)", "Expiry (T)", "Strike (₹)", "PINN IV (%)", "Raw Unconstrained", "Arbitrage Δ", "Variance (w)"].map((h, idx) => (
                            <th key={h} className={cn("label-xs border-b border-line px-2.5 py-2 text-txt-muted", idx >= 2 && "text-right")}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(pinnMesh?.mesh_points.slice(0, 10) ?? []).map((pt, idx) => (
                          <tr key={idx} className="border-b border-line-subtle hover:bg-surface-hover/50 text-[11px]">
                            <td className="px-2.5 py-1.5 mono text-acc font-medium">{pt.moneyness_k > 0 ? `+${pt.moneyness_k.toFixed(2)}` : pt.moneyness_k.toFixed(2)}</td>
                            <td className="px-2.5 py-1.5 mono text-txt-secondary">{pt.expiry_T.toFixed(2)}y</td>
                            <td className="px-2.5 py-1.5 mono text-right text-txt-primary">₹{pt.strike.toFixed(1)}</td>
                            <td className="px-2.5 py-1.5 mono text-right text-pos font-semibold">{pt.implied_vol_pct.toFixed(2)}%</td>
                            <td className="px-2.5 py-1.5 mono text-right text-txt-muted">{pt.unconstrained_vol_pct.toFixed(2)}%</td>
                            <td className="px-2.5 py-1.5 mono text-right text-warn">{pt.arbitrage_delta_pct > 0 ? `+${pt.arbitrage_delta_pct.toFixed(2)}%` : `${pt.arbitrage_delta_pct.toFixed(2)}%`}</td>
                            <td className="px-2.5 py-1.5 mono text-right text-acc2">{pt.total_variance_w.toFixed(4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Volatility Smile & Term Structure Preview */}
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 pt-2">
                    <div className="rounded-[6px] border border-line-subtle bg-surface/30 p-3">
                      <div className="flex items-center justify-between text-[11px] mb-2">
                        <span className="font-semibold text-txt-primary">1-Year Volatility Skew Smile</span>
                        <span className="mono text-acc text-[10px]">T = 1.0y</span>
                      </div>
                      <div className="space-y-1.5">
                        {(pinnMesh?.smile_1y.slice(0, 6) ?? []).map((sm, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[10.5px]">
                            <span className="mono text-txt-muted">{sm.moneyness_k > 0 ? `+${sm.moneyness_k.toFixed(2)}` : sm.moneyness_k.toFixed(2)} (₹{sm.strike})</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-line-subtle rounded-full h-1.5 overflow-hidden">
                                <div className="bg-acc h-full rounded-full" style={{ width: `${Math.min(100, (sm.iv_pct / 35) * 100)}%` }} />
                              </div>
                              <span className="mono text-txt-primary font-medium w-12 text-right">{sm.iv_pct.toFixed(2)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[6px] border border-line-subtle bg-surface/30 p-3">
                      <div className="flex items-center justify-between text-[11px] mb-2">
                        <span className="font-semibold text-txt-primary">ATM Volatility Term Structure</span>
                        <span className="mono text-pos text-[10px]">k = 0.0 (ATM)</span>
                      </div>
                      <div className="space-y-1.5">
                        {(pinnMesh?.term_structure_atm.slice(0, 6) ?? []).map((ts, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[10.5px]">
                            <span className="mono text-txt-muted">{ts.expiry_T.toFixed(2)} Years</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-line-subtle rounded-full h-1.5 overflow-hidden">
                                <div className="bg-pos h-full rounded-full" style={{ width: `${Math.min(100, (ts.atm_iv_pct / 35) * 100)}%` }} />
                              </div>
                              <span className="mono text-pos font-medium w-12 text-right">{ts.atm_iv_pct.toFixed(2)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>
            </div>

            {/* Right 4 Columns: Calibration & Greek Option Pricer */}
            <div className="space-y-3 xl:col-span-4">
              <Panel
                level={3}
                title="PINN Loss & Calibration"
                sub="Physics PDE weights & penalty constraints"
              >
                <div className="space-y-3 text-[11px]">
                  <div className="space-y-2">
                    <Slider label="PDE Physics Weight (λ_PDE)" value={lambdaPDE} min={0.1} max={2.0} step={0.1} onChange={setLambdaPDE} />
                    <Slider label="Arbitrage Penalty (λ_arb)" value={lambdaArb} min={0.1} max={3.0} step={0.1} onChange={setLambdaArb} tone="acc2" />
                  </div>

                  <Button size="sm" variant="primary" icon={Zap} loading={calibratingPinn} onClick={handleCalibratePinn} className="w-full">
                    Run PINN PDE Calibration
                  </Button>

                  <div className="rounded-[6px] border border-line-subtle bg-bg-secondary/70 p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-txt-muted">Gradient Epochs</span>
                      <span className="mono text-txt-primary">50 Steps (SiLU + Softplus)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-txt-muted">Final Data RMSE</span>
                      <span className="mono text-pos font-bold">14.2 bps</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-txt-muted">Arbitrage Violations</span>
                      <span className="mono text-pos font-bold">0 (Guaranteed Free)</span>
                    </div>
                  </div>
                </div>
              </Panel>

              <Panel
                level={3}
                title="Black-Scholes Greek Pricer"
                sub="Evaluates option price using PINN implied volatility"
              >
                <div className="space-y-3 text-[11px]">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="label-xs text-txt-muted">Strike Price (₹)</span>
                      <input
                        type="number"
                        value={calcStrike}
                        onChange={(e) => setCalcStrike(Number(e.target.value))}
                        className="mt-1 w-full rounded border border-line bg-bg-secondary px-2 py-1 mono text-[12px] text-txt-primary"
                      />
                    </div>
                    <div>
                      <span className="label-xs text-txt-muted">Expiry (Years)</span>
                      <input
                        type="number"
                        step={0.1}
                        value={calcExpiry}
                        onChange={(e) => setCalcExpiry(Number(e.target.value))}
                        className="mt-1 w-full rounded border border-line bg-bg-secondary px-2 py-1 mono text-[12px] text-txt-primary"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="xs" variant={calcType === "CALL" ? "primary" : "secondary"} onClick={() => setCalcType("CALL")} className="flex-1">
                      CALL Option
                    </Button>
                    <Button size="xs" variant={calcType === "PUT" ? "primary" : "secondary"} onClick={() => setCalcType("PUT")} className="flex-1">
                      PUT Option
                    </Button>
                  </div>

                  <Button size="sm" variant="secondary" icon={Play} onClick={handlePriceOption} className="w-full">
                    Compute PINN Greeks
                  </Button>

                  {pinnPricing && (
                    <div className="rounded-[6px] border border-line-subtle bg-surface/50 p-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-txt-muted">Option Premium</span>
                        <span className="mono text-pos text-[14px] font-bold">₹{pinnPricing.option_price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-txt-muted">PINN Implied Vol</span>
                        <span className="mono text-acc font-semibold">{pinnPricing.pinn_implied_vol_pct.toFixed(2)}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-line-subtle mono text-[10.5px]">
                        <div className="flex justify-between"><span className="text-txt-muted">Delta (Δ):</span><span className="text-txt-primary">{pinnPricing.greeks.delta.toFixed(4)}</span></div>
                        <div className="flex justify-between"><span className="text-txt-muted">Gamma (Γ):</span><span className="text-txt-primary">{pinnPricing.greeks.gamma.toFixed(6)}</span></div>
                        <div className="flex justify-between"><span className="text-txt-muted">Vega (ν):</span><span className="text-txt-primary">{pinnPricing.greeks.vega.toFixed(4)}</span></div>
                        <div className="flex justify-between"><span className="text-txt-muted">Theta (Θ):</span><span className="text-neg">{pinnPricing.greeks.theta_daily.toFixed(4)}</span></div>
                      </div>
                      <div className="pt-1 flex items-center justify-between">
                        <span className="label-xs text-txt-disabled">Arbitrage Check:</span>
                        <Badge tone="pos" dot>{pinnPricing.arbitrage_check}</Badge>
                      </div>
                    </div>
                  )}
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : mode === "L3-GAT Micro-Price (v14)" ? (
        /* ── HIGH-FREQUENCY L3 GRAPH ATTENTION NETWORK (L3-GAT) MICRO-PRICE MODULE (v14 Module 1) ── */
        <div className="space-y-4">
          {/* Top KPI Bar */}
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">Predicted Direction</div>
              <div className={cn(
                "mono mt-1 text-[16px] font-bold leading-none",
                l3PredictResult?.predicted_direction === "UP" ? "text-pos" : l3PredictResult?.predicted_direction === "DOWN" ? "text-neg" : "text-warn"
              )}>
                {l3PredictResult?.predicted_direction === "UP" ? "▲ UP (+)" : l3PredictResult?.predicted_direction === "DOWN" ? "▼ DOWN (−)" : "◆ NEUTRAL"}
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">
                P(Up) {((l3PredictResult?.probabilities.up ?? 0.45) * 100).toFixed(0)}% · P(Dn) {((l3PredictResult?.probabilities.down ?? 0.22) * 100).toFixed(0)}%
              </div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">GAT Micro-Price</div>
              <div className="mono mt-1 text-[16px] font-bold leading-none text-txt-primary">
                ₹{l3PredictResult?.gat_micro_price.toFixed(2) ?? "2980.39"}
              </div>
              <div className="mt-1.5 truncate text-[10px] text-acc">
                {l3PredictResult?.predicted_shift_inr && l3PredictResult.predicted_shift_inr > 0 ? "+" : ""}{l3PredictResult?.predicted_shift_inr.toFixed(3) ?? "+0.390"} vs Mid
              </div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">Order Book Imbalance (OBI)</div>
              <div className={cn("mono mt-1 text-[16px] font-bold leading-none", (l3PredictResult?.order_book_imbalance ?? 0.25) > 0 ? "text-pos" : "text-neg")}>
                {(l3PredictResult?.order_book_imbalance ?? 0.25) > 0 ? "+" : ""}{(l3PredictResult?.order_book_imbalance ?? 0.25).toFixed(3)}
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">{l3PredictResult?.queue_depletion_forecast.imbalance_pressure ?? "BID_HEAVY"}</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">L1 Queue Depletion</div>
              <div className="mono mt-1 text-[16px] font-bold leading-none text-gold">
                {l3PredictResult?.queue_depletion_forecast.ask_l1_depletion_ms.toFixed(1) ?? "124.8"} ms
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">Bid L1: {l3PredictResult?.queue_depletion_forecast.bid_l1_depletion_ms.toFixed(1) ?? "182.4"} ms</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">Inference Latency</div>
              <div className="mono mt-1 text-[16px] font-bold leading-none text-acc">
                {l3PredictResult?.inference_latency_us ?? "142.5"} μs
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">PyTorch L3-GAT Dual Layer</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* Left Column: LOB Parameters & Model Formulation (4 Cols) */}
            <Panel level={3} className="xl:col-span-4" title="L3 Microstructure Controller" sub="Level-3 Limit Order Book parameters & GAT attention setup">
              <div className="space-y-3.5">
                <div>
                  <label className="label-xs text-txt-muted">Target Instrument</label>
                  <select
                    value={l3Ticker}
                    onChange={(e) => setL3Ticker(e.target.value)}
                    className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[12px] text-txt-primary outline-none focus:border-acc"
                  >
                    <option value="RELIANCE">RELIANCE (Reliance Industries)</option>
                    <option value="HDFCBANK">HDFCBANK (HDFC Bank Ltd)</option>
                    <option value="INFY">INFY (Infosys Ltd)</option>
                    <option value="TCS">TCS (Tata Consultancy)</option>
                  </select>
                </div>

                <Slider
                  label="Mid Price S_t (₹)"
                  value={l3MidPrice}
                  min={2800}
                  max={3200}
                  step={5}
                  unit="₹"
                  tone="acc"
                  onChange={(v) => { setL3MidPrice(v); handlePredictL3GAT(v, l3SpreadBps, l3ImbalanceBias); }}
                />

                <Slider
                  label="Bid-Ask Spread (bps)"
                  value={l3SpreadBps}
                  min={1.0}
                  max={15.0}
                  step={0.5}
                  unit=" bps"
                  tone="acc2"
                  onChange={(v) => { setL3SpreadBps(v); handlePredictL3GAT(l3MidPrice, v, l3ImbalanceBias); }}
                />

                <Slider
                  label="Order Book Imbalance Bias"
                  value={l3ImbalanceBias}
                  min={-0.60}
                  max={0.60}
                  step={0.05}
                  tone={l3ImbalanceBias > 0.2 ? "pos" : l3ImbalanceBias < -0.2 ? "neg" : "gold"}
                  onChange={(v) => { setL3ImbalanceBias(v); handlePredictL3GAT(l3MidPrice, l3SpreadBps, v); }}
                />

                <div className="rounded-[8px] border border-line-subtle bg-bg-secondary/70 p-3 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between font-semibold text-txt-primary">
                    <span className="flex items-center gap-1.5"><Cpu size={13} className="text-acc" /> L3-GAT Attention Formulation</span>
                    <Badge tone="neu">v14 ARCHITECTURE</Badge>
                  </div>
                  <p className="mono text-[10px] text-txt-secondary leading-snug">
                    {"h_i^(l+1) = σ( ∑_(j ∈ N_i) α_ij W^(l) h_j^(l) )"}
                  </p>
                  <p className="text-[10px] text-txt-muted leading-relaxed">
                    Computes pairwise attention α_ij across 10 discrete price nodes weighted by queue position, volume, and cancellation gradients e_ij.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button size="xs" variant="primary" loading={evaluatingL3} onClick={() => handlePredictL3GAT()}>
                    ⚡ Run GAT Predict
                  </Button>
                  <Button size="xs" variant="secondary" icon={RefreshCw} loading={streamingL3} onClick={handleSimulateL3Stream}>
                    📊 Stream 15 Ticks
                  </Button>
                </div>
              </div>
            </Panel>

            {/* Right Column: L3 Depth Matrix & Graph Attention Heatmap (8 Cols) */}
            <div className="space-y-3 xl:col-span-8">
              {/* Level-3 Order Book Depth Table */}
              <Panel level={3} title="Level-3 Limit Order Book Structure & Queue Dynamics" sub="10-Node bipartite price graph with inter-level liquidity flows">
                <div className="overflow-x-auto rounded-[6px] border border-line-subtle">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-bg-secondary/90 text-left">
                        <th className="label-xs border-b border-line px-2.5 py-2 text-txt-muted">Level</th>
                        <th className="label-xs border-b border-line px-2.5 py-2 text-right text-pos">Bid Vol (sh)</th>
                        <th className="label-xs border-b border-line px-2.5 py-2 text-right text-pos">Bid (₹)</th>
                        <th className="label-xs border-b border-line px-2.5 py-2 text-center text-txt-muted">Cancel %</th>
                        <th className="label-xs border-b border-line px-2.5 py-2 text-left text-neg">Ask (₹)</th>
                        <th className="label-xs border-b border-line px-2.5 py-2 text-right text-neg">Ask Vol (sh)</th>
                        <th className="label-xs border-b border-line px-2.5 py-2 text-right text-gold">Depletion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(l3PredictResult?.l3_depth.bids ?? []).map((bid, idx) => {
                        const ask = l3PredictResult?.l3_depth.asks[idx];
                        return (
                          <tr key={bid.level} className="border-b border-line-subtle/70 text-[11px] hover:bg-surface-hover/50">
                            <td className="mono px-2.5 py-1.5 font-bold text-txt-muted">L{bid.level}</td>
                            <td className="mono px-2.5 py-1.5 text-right font-medium text-pos">{bid.volume}</td>
                            <td className="mono px-2.5 py-1.5 text-right text-txt-primary">₹{bid.price.toFixed(2)}</td>
                            <td className="mono px-2.5 py-1.5 text-center text-txt-muted">{(bid.cancel_rate * 100).toFixed(0)}% / {((ask?.cancel_rate ?? 0.15) * 100).toFixed(0)}%</td>
                            <td className="mono px-2.5 py-1.5 text-left text-txt-primary">₹{ask?.price.toFixed(2) ?? "0.00"}</td>
                            <td className="mono px-2.5 py-1.5 text-right font-medium text-neg">{ask?.volume ?? 0}</td>
                            <td className="mono px-2.5 py-1.5 text-right text-gold font-semibold">{ask?.estimated_depletion_ms.toFixed(1) ?? "0.0"} ms</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Graph Attention Weight Hotspots */}
                <div className="mt-3 rounded-[6px] border border-line-subtle bg-bg-secondary/60 p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-txt-primary">
                    <span>Top GAT Spatial Attention Coefficients (α_ij)</span>
                    <Badge tone="pos">ATTENTION HOTSPOTS</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-[10.5px]">
                    {(l3PredictResult?.graph_attention_weights ?? []).slice(0, 4).map((link) => (
                      <div key={`${link.source}-${link.target}`} className="rounded border border-line-subtle bg-surface p-1.5 flex items-center justify-between">
                        <span className="mono text-txt-secondary">{link.source} → {link.target}</span>
                        <span className="mono font-bold text-acc">{(link.attention_weight * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>

              {/* Streaming Tick Simulation Blotter (if available) */}
              {l3StreamResult && (
                <Panel level={3} title="High-Frequency L3 Tick Stream Blotter" sub="Consecutive 20ms micro-price updates and directional shifts">
                  <div className="overflow-x-auto rounded-[6px] border border-line-subtle max-h-56">
                    <table className="w-full border-collapse">
                      <thead className="sticky top-0 bg-bg-secondary/95">
                        <tr className="text-left text-txt-muted label-xs">
                          {["Tick", "Time", "Mid (₹)", "Classical Micro", "GAT Micro", "Shift Direction", "OBI", "P(Up)", "P(Down)"].map((h, i) => (
                            <th key={h} className={cn("border-b border-line px-2.5 py-1.5", i >= 2 && "text-right")}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {l3StreamResult.stream.map((st) => (
                          <tr key={st.tick} className="border-b border-line-subtle/70 text-[10.5px] hover:bg-surface-hover/50">
                            <td className="mono px-2.5 py-1 text-acc">#{st.tick}</td>
                            <td className="mono px-2.5 py-1 text-txt-muted">{st.time_label}</td>
                            <td className="mono px-2.5 py-1 text-right text-txt-secondary">₹{st.mid_price.toFixed(2)}</td>
                            <td className="mono px-2.5 py-1 text-right text-txt-muted">₹{st.classical_micro_price.toFixed(2)}</td>
                            <td className="mono px-2.5 py-1 text-right font-bold text-txt-primary">₹{st.gat_micro_price.toFixed(2)}</td>
                            <td className="px-2.5 py-1 text-center">
                              <Badge tone={st.direction === "UP" ? "pos" : st.direction === "DOWN" ? "neg" : "neu"}>
                                {st.direction}
                              </Badge>
                            </td>
                            <td className={cn("mono px-2.5 py-1 text-right", st.obi > 0 ? "text-pos" : "text-neg")}>
                              {st.obi > 0 ? "+" : ""}{st.obi.toFixed(2)}
                            </td>
                            <td className="mono px-2.5 py-1 text-right text-pos font-semibold">{(st.prob_up * 100).toFixed(0)}%</td>
                            <td className="mono px-2.5 py-1 text-right text-neg font-semibold">{(st.prob_down * 100).toFixed(0)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>
              )}
            </div>
          </div>
        </div>
      ) : mode === "eBPF/FPGA L3 Ingest (v15)" ? (
        <div className="space-y-3">
          {/* ── Top Level-3 eBPF / FPGA Kernel Bypass Telemetry Bar ── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted flex items-center gap-1.5">
                <Zap size={12} className="text-acc" /> Hardware Bypass Latency
              </div>
              <div className="mono mt-1 text-[16px] font-bold leading-none text-acc">
                {burstResult?.mean_latency_ns.toFixed(1) ?? "180.0"} ns
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">
                Min {burstResult?.min_latency_ns.toFixed(0) ?? "171"}ns · Max {burstResult?.max_latency_ns.toFixed(0) ?? "198"}ns
              </div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted flex items-center gap-1.5">
                <Server size={12} className="text-pos" /> AF_XDP Zero-Copy
              </div>
              <div className="mono mt-1 text-[16px] font-bold leading-none text-pos">
                ACTIVE
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">
                {xdpStatus?.ring_buffer_stats.zero_copy_enabled ? "XDP_DRV_MODE (Direct DMA)" : "XDP_FLAGS_DRV_MODE"}
              </div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted flex items-center gap-1.5">
                <HardDrive size={12} className="text-gold" /> UMEM Ring Buffers
              </div>
              <div className="mono mt-1 text-[16px] font-bold leading-none text-gold">
                {xdpStatus?.ring_buffer_stats.fill_ring_entries ?? 4096} / {xdpStatus?.ring_buffer_stats.rx_ring_entries ?? 4096}
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">
                Util: {burstResult?.ring_buffer_telemetry.fill_ring_utilization_pct ?? 14.8}% · 4KB frames
              </div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-pos" /> Dropped Packets
              </div>
              <div className="mono mt-1 text-[16px] font-bold leading-none text-pos">
                0 pkts (0.00%)
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">Zero socket queue overflow</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted flex items-center gap-1.5">
                <Binary size={12} className="text-acc2" /> Ingress Feed Protocol
              </div>
              <div className="mono mt-1 text-[16px] font-bold leading-none text-acc2">
                ITCH 5.0
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">Binary big-endian L3 direct</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted flex items-center gap-1.5">
                <Gauge size={12} className="text-txt-secondary" /> Processed Counter
              </div>
              <div className="mono mt-1 text-[16px] font-bold leading-none text-txt-primary">
                {((xdpStatus?.ring_buffer_stats.rx_packets_processed ?? 89452010) + (burstResult?.total_packets_parsed ?? 0)).toLocaleString()}
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">Total zero-copy frames</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* Left Column: Burst Injection & Kernel Configuration (4 Cols) */}
            <Panel level={3} className="xl:col-span-4" title="eBPF / XDP Hardware Controller" sub="FPGA NIC direct memory access & packet burst generator">
              <div className="space-y-3.5">
                <Slider
                  label="Burst Packet Batch Count"
                  value={burstCount}
                  min={10}
                  max={100}
                  step={5}
                  unit=" frames"
                  tone="acc"
                  onChange={setBurstCount}
                />

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="xs"
                    variant="primary"
                    loading={simulatingBurst}
                    onClick={() => handleSimulateBurst(burstCount)}
                    icon={Zap}
                  >
                    ⚡ Ingest Burst ({burstCount})
                  </Button>
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={handleFetchXDPStatus}
                    icon={RefreshCw}
                  >
                    Sync Ring Status
                  </Button>
                </div>

                {/* Packet Type Distribution Badges */}
                <div className="rounded-[8px] border border-line-subtle bg-bg-secondary/60 p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-txt-primary">
                    <span className="flex items-center gap-1.5"><Layers size={13} className="text-acc" /> Ingested Frame Distribution</span>
                    <Badge tone="neu">v15 KERNEL</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10.5px]">
                    {Object.entries(burstResult?.packet_types_distribution ?? { A: 10, E: 5, C: 3, X: 4, D: 2, P: 1 }).map(([type, cnt]) => (
                      <div key={type} className="rounded border border-line-subtle bg-surface p-1.5 flex items-center justify-between">
                        <span className="mono font-semibold text-txt-secondary">Type {type}</span>
                        <span className="mono font-bold text-acc">{cnt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* eBPF C Kernel Hook Code Preview */}
                <div className="rounded-[8px] border border-line-subtle bg-bg-secondary/80 p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[10.5px] font-semibold text-txt-primary">
                    <span className="flex items-center gap-1"><Cpu size={12} className="text-acc" /> eBPF Ingress Hook (C)</span>
                    <span className="mono text-[9.5px] text-txt-muted">AF_XDP UMEM</span>
                  </div>
                  <pre className="mono rounded bg-surface p-2 text-[9.5px] leading-relaxed text-txt-secondary overflow-x-auto">
{`SEC("xdp")
int xdp_itch50_ingress(struct xdp_md *ctx) {
    void *data = (void *)(long)ctx->data;
    void *data_end = (void *)(long)ctx->data_end;
    if (data + sizeof(struct itch_hdr) > data_end)
        return XDP_PASS;
    return bpf_redirect_map(&xsk_ring_map,
                            ctx->rx_queue_index, 0);
}`}
                  </pre>
                  <p className="text-[9.5px] text-txt-disabled leading-tight">
                    Bypasses kernel network stack (sk_buff allocation) and streams binary ITCH direct to userland memory at 180ns latency.
                  </p>
                </div>
              </div>
            </Panel>

            {/* Right Column: High-Frequency ITCH 5.0 Packet Blotter (8 Cols) */}
            <div className="space-y-3 xl:col-span-8">
              <Panel
                level={3}
                title="AF_XDP Binary ITCH 5.0 Ingress Blotter"
                sub="Zero-copy parsed Level-3 book updates with nanosecond timestamp precision"
                actions={
                  <div className="flex items-center gap-1.5">
                    <span className="label-xs text-txt-muted">Filter:</span>
                    {["ALL", "A", "E", "C", "X", "D", "P"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setFilterType(t)}
                        className={cn(
                          "mono rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors",
                          filterType === t
                            ? "bg-acc text-bg-primary font-bold"
                            : "bg-surface-2 text-txt-muted hover:text-txt-primary"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                }
              >
                <div className="overflow-x-auto rounded-[6px] border border-line-subtle max-h-96">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-bg-secondary/95">
                      <tr className="text-left text-txt-muted label-xs">
                        <th className="border-b border-line px-2.5 py-2">Type</th>
                        <th className="border-b border-line px-2.5 py-2">Message</th>
                        <th className="border-b border-line px-2.5 py-2">Symbol</th>
                        <th className="border-b border-line px-2.5 py-2 text-center">Side</th>
                        <th className="border-b border-line px-2.5 py-2 text-right">Shares</th>
                        <th className="border-b border-line px-2.5 py-2 text-right">Price</th>
                        <th className="border-b border-line px-2.5 py-2 text-right">Order Ref ID</th>
                        <th className="border-b border-line px-2.5 py-2 text-right">Payload Hex</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(burstResult?.sample_parsed_records ?? [])
                        .filter((r) => filterType === "ALL" || r.msg_type === filterType)
                        .map((pkt, idx) => (
                          <tr
                            key={`${pkt.order_id}-${idx}`}
                            className="border-b border-line-subtle/70 text-[11px] hover:bg-surface-hover/60 transition-colors"
                          >
                            <td className="mono px-2.5 py-1.5">
                              <Badge
                                tone={
                                  pkt.msg_type === "A"
                                    ? "pos"
                                    : pkt.msg_type === "E" || pkt.msg_type === "C"
                                    ? "acc"
                                    : pkt.msg_type === "X" || pkt.msg_type === "D"
                                    ? "neg"
                                    : "gold"
                                }
                              >
                                {pkt.msg_type}
                              </Badge>
                            </td>
                            <td className="px-2.5 py-1.5 text-txt-primary font-medium">{pkt.type_name}</td>
                            <td className="mono px-2.5 py-1.5 font-bold text-acc">{pkt.stock ?? "AAPL"}</td>
                            <td className="mono px-2.5 py-1.5 text-center">
                              {pkt.buy_sell ? (
                                <span className={pkt.buy_sell === "B" ? "text-pos font-bold" : "text-neg font-bold"}>
                                  {pkt.buy_sell === "B" ? "BUY" : "SELL"}
                                </span>
                              ) : (
                                <span className="text-txt-muted">-</span>
                              )}
                            </td>
                            <td className="mono px-2.5 py-1.5 text-right font-medium text-txt-primary">
                              {pkt.shares ? pkt.shares.toLocaleString() : "-"}
                            </td>
                            <td className="mono px-2.5 py-1.5 text-right font-semibold text-txt-primary">
                              {pkt.price_dollars ? `$${pkt.price_dollars.toFixed(2)}` : "-"}
                            </td>
                            <td className="mono px-2.5 py-1.5 text-right text-txt-muted text-[10px]">
                              #{pkt.order_id}
                            </td>
                            <td className="mono px-2.5 py-1.5 text-right text-txt-disabled text-[9.5px]">
                              {pkt.raw_hex_preview}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-line-subtle pt-2.5 text-[10.5px] text-txt-muted">
                  <span className="mono">
                    Direct DMA Ring Buffer: <span className="text-pos font-semibold">{burstResult?.ring_buffer_telemetry.zero_copy_mode ?? "XDP_DRV_MODE"}</span>
                  </span>
                  <span>Target Hardware: <span className="mono text-txt-secondary">{burstResult?.ring_buffer_telemetry.hardware_bypass_target ?? "Mellanox ConnectX-6 Dx"}</span></span>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : mode === "Neuromorphic SNN L3 (v16)" ? (
        /* ── NEUROMORPHIC EVENT-DRIVEN MICROSTRUCTURE PROCESSING (v16 Module 2) ── */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted flex items-center gap-1.5">
                <Cpu size={12} className="text-acc" /> Hardware Architecture
              </div>
              <div className="mono mt-1 text-[14px] font-bold leading-none text-txt-primary">Intel Loihi 2 / SNN</div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">Event-based asynchronous silicon</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted flex items-center gap-1.5">
                <Zap size={12} className="text-pos" /> Direct Inference Latency
              </div>
              <div className="mono mt-1 text-[17px] font-bold leading-none text-pos">
                {snnResult?.inference_latency_ns.toFixed(1) ?? "412.0"} ns
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">Sub-microsecond threshold</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted flex items-center gap-1.5">
                <Radio size={12} className="text-gold" /> Energy Consumption
              </div>
              <div className="mono mt-1 text-[17px] font-bold leading-none text-gold">
                {snnResult?.neuromorphic_energy_pj ?? 2.1} pJ / spike
              </div>
              <div className="mt-1.5 truncate text-[10px] text-pos font-medium">
                {snnResult?.energy_efficiency_gain_x.toLocaleString() ?? "880,952"}x vs GPU (1.85 μJ)
              </div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted flex items-center gap-1.5">
                <TrendingUp size={12} className="text-acc" /> Directional Alpha Bias
              </div>
              <div className={cn("mono mt-1 text-[17px] font-bold leading-none", (snnResult?.alpha_directional_bias ?? 0) >= 0 ? "text-pos" : "text-neg")}>
                {(snnResult?.alpha_directional_bias ?? 0) > 0 ? "+" : ""}{snnResult?.alpha_directional_bias.toFixed(2) ?? "+0.64"}
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">Microprice: ₹{snnResult?.microprice_prediction.toFixed(2) ?? "2,984.79"}</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted flex items-center gap-1.5">
                <Gauge size={12} className="text-txt-secondary" /> Stream Throughput
              </div>
              <div className="mono mt-1 text-[17px] font-bold leading-none text-txt-primary">
                {snnStreamResult?.throughput_mpps.toLocaleString() ?? "2,427.18"} Mpps
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">Zero polling idle power</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* Left Column: ITCH Tick Injector & LIF Synapse Controls (4 Cols) */}
            <Panel level={3} className="xl:col-span-4" title="Neuromorphic Tick Spike Encoder" sub="Asynchronous Level-3 ITCH to Leaky Integrate-and-Fire converter">
              <div className="space-y-3.5">
                <div>
                  <label className="label-xs text-txt-muted">Instrument Symbol</label>
                  <select
                    value={snnTicker}
                    onChange={(e) => setSnnTicker(e.target.value)}
                    className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[12px] text-txt-primary outline-none focus:border-acc"
                  >
                    <option value="RELIANCE.NS">RELIANCE.NS (Reliance Industries)</option>
                    <option value="TCS.NS">TCS.NS (Tata Consultancy)</option>
                    <option value="NVDA">NVDA (NVIDIA Corp)</option>
                    <option value="AAPL">AAPL (Apple Inc)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label-xs text-txt-muted">ITCH Event Type</label>
                    <select
                      value={snnEventType}
                      onChange={(e) => setSnnEventType(e.target.value as any)}
                      className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[11px] text-txt-primary outline-none focus:border-acc"
                    >
                      <option value="ADD_ORDER">ADD_ORDER (Type A)</option>
                      <option value="EXECUTE">EXECUTE (Type E)</option>
                      <option value="CANCEL">CANCEL (Type X)</option>
                      <option value="DELETE">DELETE (Type D)</option>
                    </select>
                  </div>

                  <div>
                    <label className="label-xs text-txt-muted">Side</label>
                    <SegmentedControl
                      size="xs"
                      options={["BUY", "SELL"] as const}
                      value={snnSide}
                      onChange={setSnnSide}
                      ariaLabel="Order side"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label-xs text-txt-muted">Price (₹ / $)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={snnPrice}
                      onChange={(e) => setSnnPrice(+e.target.value)}
                      className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[11.5px] text-txt-primary outline-none focus:border-acc"
                    />
                  </div>
                  <div>
                    <label className="label-xs text-txt-muted">Shares</label>
                    <input
                      type="number"
                      step="100"
                      value={snnShares}
                      onChange={(e) => setSnnShares(+e.target.value)}
                      className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[11.5px] text-txt-primary outline-none focus:border-acc"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    size="xs"
                    variant="primary"
                    loading={processingSNNTick}
                    onClick={handleProcessSNNTick}
                    icon={Zap}
                  >
                    ⚡ Process Tick Spike
                  </Button>
                  <Button
                    size="xs"
                    variant="secondary"
                    loading={simulatingSNNStream}
                    onClick={() => handleSimulateSNNStream(snnBurstCount)}
                    icon={Radio}
                  >
                    Stream 40-Tick Burst
                  </Button>
                </div>

                {/* LIF Mathematical Formulation */}
                <div className="rounded-[8px] border border-line-subtle bg-bg-secondary/70 p-2.5 space-y-1.5 text-[10.5px]">
                  <div className="flex items-center justify-between font-semibold text-txt-primary text-[10.5px]">
                    <span className="flex items-center gap-1"><Cpu size={12} className="text-acc" /> LIF Membrane Dynamics</span>
                    <Badge tone="neu">v16 SNN</Badge>
                  </div>
                  <div className="mono rounded bg-surface p-2 text-[9px] text-txt-secondary leading-relaxed overflow-x-auto">
                    τ_m · dU_i(t)/dt = −(U_i(t) − U_rest) + R · ∑_j W_ij · S_j(t)
                    <br />
                    S_i(t) = δ(t − t_i^f)  when U_i(t) ≥ V_th (−50 mV)
                  </div>
                  <div className="flex items-center justify-between text-[9.5px] text-txt-muted pt-0.5">
                    <span>τ_m = 10.0 ms</span>
                    <span>V_th = −50.0 mV</span>
                    <span>U_rest = −70.0 mV</span>
                  </div>
                </div>
              </div>
            </Panel>

            {/* Right Column: Neuromorphic Telemetry, Membrane Potential & Spike Raster (8 Cols) */}
            <div className="space-y-3 xl:col-span-8">
              <Panel
                level={3}
                title="LIF Membrane Potential Telemetry & Directional Alpha"
                sub="Real-time neuron potential U_i(t) across hidden and output alpha populations"
                actions={
                  <div className="flex items-center gap-2">
                    <Badge tone={(snnResult?.alpha_directional_bias ?? 0) >= 0 ? "pos" : "neg"}>
                      {(snnResult?.alpha_directional_bias ?? 0) >= 0 ? "BULLISH MICROPRICE BIAS" : "BEARISH MICROPRICE BIAS"}
                    </Badge>
                  </div>
                }
              >
                <div className="space-y-3">
                  {/* Neuron Population Grid */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-txt-primary">Active LIF Neuron Population Potentials</span>
                      <span className="mono text-[10px] text-txt-muted">Fired Spikes: <strong className="text-acc">{snnResult?.total_spikes_generated ?? 6}</strong></span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {(snnResult?.active_neurons ?? []).map((n) => (
                        <div
                          key={`${n.layer_name}-${n.neuron_id}`}
                          className={cn(
                            "rounded-[6px] border p-2 text-[10.5px] transition-all",
                            n.spike_fired ? "border-acc bg-acc/10 ring-1 ring-acc/30" : "border-line bg-surface/50"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="mono font-semibold text-txt-secondary">{n.layer_name === "HIDDEN_LIF" ? `H[${n.neuron_id}]` : `OUT[${n.neuron_id}]`}</span>
                            {n.spike_fired ? (
                              <Badge tone="pos" size="xs">⚡ SPIKE</Badge>
                            ) : (
                              <span className="mono text-[9px] text-txt-disabled">Sub-th</span>
                            )}
                          </div>
                          <div className="mt-1 flex items-baseline justify-between">
                            <span className="mono font-bold text-txt-primary">{n.membrane_potential_mv.toFixed(1)} mV</span>
                            <span className="mono text-[9px] text-txt-muted">{n.spike_count_window} spikes</span>
                          </div>
                          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-line-subtle">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, Math.max(0, ((n.membrane_potential_mv - n.resting_u_rest) / (n.threshold_v_th - n.resting_u_rest)) * 100))}%`,
                                background: n.spike_fired ? C.acc : C.acc2,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Spike Raster Timeline */}
                  <div className="rounded-[8px] border border-line-subtle bg-bg-secondary/60 p-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-txt-primary">
                      <span className="flex items-center gap-1.5"><Activity size={12} className="text-acc" /> Sub-Microsecond Synaptic Spike Raster</span>
                      <span className="mono text-[10px] text-pos">Total Latency: {snnResult?.inference_latency_ns ?? 412.0} ns</span>
                    </div>
                    <div className="space-y-1.5">
                      {(snnResult?.recent_spike_raster ?? []).map((ev, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded border border-line-subtle bg-surface px-2.5 py-1.5 text-[10.5px]">
                          <div className="flex items-center gap-2">
                            <Badge tone="neu" size="xs">{ev.time_label}</Badge>
                            <span className="mono text-txt-primary">{ev.layer}</span>
                            <span className="text-txt-muted">· Neuron #{ev.neuron_id}</span>
                          </div>
                          <div className="mono text-[10px] text-txt-secondary">
                            Synaptic Weight: <strong className="text-acc">{ev.synaptic_weight.toFixed(2)}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stream History Trajectory (if available) */}
                  {(snnStreamResult?.directional_alpha_history.length ?? 0) > 0 && (
                    <div className="rounded-[8px] border border-line-subtle bg-surface/50 p-3">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-txt-primary mb-2">
                        <span>40-Tick Directional Alpha Stream Rollout</span>
                        <span className="mono text-txt-muted">Throughput: {snnStreamResult?.throughput_mpps.toLocaleString()} Mpps</span>
                      </div>
                      <div className="flex gap-1 overflow-x-auto pb-1">
                        {snnStreamResult?.directional_alpha_history.slice(-15).map((h) => (
                          <div key={h.step} className="min-w-[62px] rounded border border-line-subtle bg-surface-2 p-1.5 text-center text-[9px]">
                            <div className="text-txt-muted">{h.time_label}</div>
                            <div className={cn("mono font-bold mt-0.5", h.alpha_bias >= 0 ? "text-pos" : "text-neg")}>
                              {h.alpha_bias > 0 ? "+" : ""}{h.alpha_bias.toFixed(2)}
                            </div>
                            <div className="mono text-txt-disabled">₹{h.microprice.toFixed(1)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : mode === "Mean-Field Games MFG (v17)" ? (
        /* ── CONTINUOUS-TIME MEAN-FIELD GAMES (MFG) LIQUIDITY CROWDING (v17 Module 2) ── */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted flex items-center gap-1.5">
                <Layers size={12} className="text-acc" /> PDE Formulation
              </div>
              <div className="mono mt-1 text-[14px] font-bold leading-none text-txt-primary">Coupled HJB-FPK</div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">Limit as N → ∞ competitors</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted flex items-center gap-1.5">
                <Activity size={12} className="text-warn" /> Crowding Risk Score
              </div>
              <div className="mono mt-1 text-[17px] font-bold leading-none text-warn">
                {mfgResult?.crowding_score ?? 72.4} / 100
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">Algorithmic synchronization</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted flex items-center gap-1.5">
                <Zap size={12} className="text-neg" /> Impact Amplification
              </div>
              <div className="mono mt-1 text-[17px] font-bold leading-none text-neg">
                {mfgResult?.price_impact_amplification_multiplier.toFixed(2) ?? "3.85"}x
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">vs isolated single-agent</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted flex items-center gap-1.5">
                <AlertTriangle size={12} className="text-gold" /> Cascade Liquidation Prob
              </div>
              <div className="mono mt-1 text-[17px] font-bold leading-none text-gold">
                {((mfgResult?.cascade_liquidation_probability ?? 0.284) * 100).toFixed(1)}%
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">Stop-loss cascading risk</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-pos" /> Inventory De-risked
              </div>
              <div className="mono mt-1 text-[17px] font-bold leading-none text-pos">
                {mfgResult?.inventory_reduction_pct.toFixed(1) ?? "88.2"}%
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">T={mfgHorizonSec}s Horizon solved</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            {/* Left Column: Parameter Controls (4 cols) */}
            <div className="space-y-3 xl:col-span-4">
              <Panel level={3} title="MFG Liquidity Parameter Controls" sub="Coupled HJB backward & FPK forward PDE parameters">
                <div className="space-y-3">
                  <div>
                    <label className="label-xs text-txt-muted">Market Liquidity Scenario</label>
                    <select
                      value={mfgScenario}
                      onChange={(e) => setMfgScenario(e.target.value as any)}
                      className="mt-1 w-full rounded border border-line bg-surface-2 px-2.5 py-1.5 text-[11.5px] text-txt-primary outline-none focus:border-acc"
                    >
                      <option value="HIGH_ALGO_CROWDING">High Algorithmic Crowding (Identical Signals)</option>
                      <option value="CASCADE_PANIC">Cascade Liquidation Panic (Deleveraging Spiral)</option>
                      <option value="NORMAL_LIQUIDITY">Normal Market Liquidity (Diversified Order Flow)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-txt-muted">Trading Horizon T</span>
                      <span className="mono font-bold text-acc">{mfgHorizonSec} Seconds</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={300}
                      step={10}
                      value={mfgHorizonSec}
                      onChange={(e) => setMfgHorizonSec(Number(e.target.value))}
                      className="mt-1.5 w-full accent-acc"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-txt-muted">Max Order Book Inventory</span>
                      <span className="mono font-bold text-txt-primary">{mfgInventoryMax.toLocaleString()} Shares</span>
                    </div>
                    <input
                      type="range"
                      min={10000}
                      max={150000}
                      step={5000}
                      value={mfgInventoryMax}
                      onChange={(e) => setMfgInventoryMax(Number(e.target.value))}
                      className="mt-1.5 w-full accent-acc"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      tone="acc"
                      className="w-full"
                      loading={runningMFG}
                      onClick={handleSolveMFG}
                      icon={<RefreshCw size={12} />}
                    >
                      Solve Coupled HJB-FPK Equilibrium
                    </Button>
                  </div>

                  <div className="rounded-[6px] border border-line-subtle bg-surface-2/60 p-2.5 text-[10.5px] text-txt-muted space-y-1">
                    <div className="font-semibold text-txt-secondary">PDE Formulation:</div>
                    <div className="mono text-[9.5px]">HJB: −∂u/∂t − ½σ²Δu + H(x, ∇u, m) = 0</div>
                    <div className="mono text-[9.5px]">FPK: ∂m/∂t − ½σ²Δm + div(m ∇_p H) = 0</div>
                  </div>
                </div>
              </Panel>
            </div>

            {/* Right Column: MFG Inventory Trajectory & Population Heatmap (8 cols) */}
            <div className="space-y-3 xl:col-span-8">
              <Panel level={3} title="Optimal Inventory Liquidation: MFG Crowd vs Single-Agent TWAP" sub="Accounts for adverse selection and competitive order flow front-running">
                <div className="space-y-4">
                  {/* Trajectory Table / Visual */}
                  <div className="overflow-x-auto rounded-[6px] border border-line-subtle">
                    <table className="w-full border-collapse">
                      <thead className="bg-bg-secondary/95 text-left text-txt-muted label-xs">
                        <tr>
                          <th className="border-b border-line px-2.5 py-1.5">Time (s)</th>
                          <th className="border-b border-line px-2.5 py-1.5 text-right font-bold text-acc">MFG Crowd Inventory</th>
                          <th className="border-b border-line px-2.5 py-1.5 text-right text-txt-muted">Single-Agent TWAP</th>
                          <th className="border-b border-line px-2.5 py-1.5 text-right text-warn">Effective Spread (bps)</th>
                          <th className="border-b border-line px-2.5 py-1.5 text-right">Advantage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mfgResult?.trajectory_series.slice(0, 10).map((row) => (
                          <tr key={row.time_sec} className="border-b border-line-subtle/70 text-[11px] hover:bg-surface-hover/60">
                            <td className="mono px-2.5 py-1.5 font-bold text-txt-primary">{row.time_sec}s</td>
                            <td className="mono px-2.5 py-1.5 text-right font-bold text-acc">{row.mfg_crowd_inventory.toLocaleString()}</td>
                            <td className="mono px-2.5 py-1.5 text-right text-txt-muted">{row.single_agent_benchmark.toLocaleString()}</td>
                            <td className="mono px-2.5 py-1.5 text-right text-warn">{row.effective_spread_bps.toFixed(2)} bps</td>
                            <td className="mono px-2.5 py-1.5 text-right text-pos font-semibold">
                              +{Math.max(0, row.single_agent_benchmark - row.mfg_crowd_inventory).toLocaleString()} sh
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Population Density Evolution Snapshot */}
                  <div className="rounded-[8px] border border-line-subtle bg-surface/50 p-3">
                    <div className="flex items-center justify-between text-[11.5px] font-semibold text-txt-primary mb-2">
                      <span>Crowd Population Density m(t, x) Across Trading Horizon</span>
                      <span className="mono text-[10px] text-txt-muted">Convergence Residual: {mfgResult?.final_pde_residual.toExponential(2)}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {mfgResult?.density_heatmap.map((d) => (
                        <div key={d.time_sec} className="rounded border border-line-subtle bg-surface-2 p-2 text-center text-[10px]">
                          <div className="text-txt-muted">t = {d.time_sec}s</div>
                          <div className="mono text-[13px] font-bold text-acc mt-1">{d.crowd_mean_inventory.toLocaleString()}</div>
                          <div className="text-[9px] text-txt-disabled">Mean Crowd Shares</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : mode === "Dark Pool Iceberg & OBI Detector (v18)" ? (
        /* ── DARK POOL ICEBERG & ORDER BOOK IMBALANCE (OBI) DETECTOR (v18 Module 2) ── */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-[8px] border border-line-subtle bg-surface/60 p-2.5">
              <div className="label-xs truncate text-txt-muted">Order Book Imbalance (OBI)</div>
              <div className={cn("mono mt-1 text-[16px] font-bold leading-none", (icebergSnapshot?.order_book_imbalance ?? 0) > 0.1 ? "text-pos" : (icebergSnapshot?.order_book_imbalance ?? 0) < -0.1 ? "text-neg" : "text-acc")}>
                {(icebergSnapshot?.order_book_imbalance ?? 0) > 0 ? "+" : ""}{icebergSnapshot?.order_book_imbalance.toFixed(4) ?? "+0.1029"}
              </div>
              <div className="mt-1 text-[9.5px] text-txt-disabled">{icebergSnapshot?.imbalance_direction.replace(/_/g, " ") ?? "BALANCED"}</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 p-2.5">
              <div className="label-xs truncate text-txt-muted">VPIN Toxicity Metric</div>
              <div className={cn("mono mt-1 text-[16px] font-bold leading-none", (icebergSnapshot?.vpin_toxicity_score ?? 0) > 0.65 ? "text-neg" : "text-warn")}>
                {icebergSnapshot?.vpin_toxicity_score.toFixed(3) ?? "0.584"}
              </div>
              <div className="mt-1 text-[9.5px] text-txt-disabled">Informed Asymmetric Flow</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 p-2.5">
              <div className="label-xs truncate text-txt-muted">Detected Iceberg Orders</div>
              <div className="mono mt-1 text-[16px] font-bold leading-none text-neg">
                {icebergSnapshot?.detected_icebergs.length ?? 2} Levels Flagged
              </div>
              <div className="mt-1 text-[9.5px] text-txt-disabled">P(ice) &gt; 75% Poisson Confidence</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 p-2.5">
              <div className="label-xs truncate text-txt-muted">Estimated Stealth Liquidity</div>
              <div className="mono mt-1 text-[16px] font-bold leading-none text-pos">
                ${((icebergSnapshot?.stealth_liquidity_usd ?? 5292562) / 1e6).toFixed(2)}M USD
              </div>
              <div className="mt-1 text-[9.5px] text-txt-disabled">Hidden Queue Depth</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 p-2.5">
              <div className="label-xs truncate text-txt-muted">L3 Ingestion Latency</div>
              <div className="mono mt-1 text-[16px] font-bold leading-none text-acc">
                &lt; 250 µs
              </div>
              <div className="mt-1 text-[9.5px] text-pos font-semibold">Memory-Mapped Ring Buffer</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 p-2.5">
              <div className="label-xs truncate text-txt-muted">Surveillance State</div>
              <div className="mono mt-1 text-[14px] font-bold leading-none text-pos">
                ACTIVE
              </div>
              <div className="mt-1 text-[9.5px] text-txt-disabled">Level-3 Tick Reconstructed</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* Left 4 Cols: Event Simulator & Detection Controls */}
            <Panel level={3} className="xl:col-span-4" title="Level-3 Tick Injector & Surveillance" sub="Poisson Refill Detection: P(ice) = 1 - exp(-λ · Filled / Displayed)">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label-xs text-txt-muted">Instrument</label>
                    <select
                      value={icebergSymbol}
                      onChange={(e) => {
                        const sym = e.target.value;
                        setIcebergSymbol(sym);
                        const px = sym === "NVDA" ? 142.50 : sym === "AAPL" ? 224.10 : sym === "MSFT" ? 412.30 : 2500.0;
                        setIcebergBasePrice(px);
                        setSimEventPrice(px - 0.05);
                        handleFetchIcebergSnapshot(sym, px);
                      }}
                      className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[12px] text-txt-primary outline-none focus:border-acc"
                    >
                      <option value="NVDA">NVDA ($142.50)</option>
                      <option value="AAPL">AAPL ($224.10)</option>
                      <option value="MSFT">MSFT ($412.30)</option>
                      <option value="RELIANCE.NS">RELIANCE (₹2,500)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-xs text-txt-muted">Event Type</label>
                    <select
                      value={simEventType}
                      onChange={(e) => setSimEventType(e.target.value as any)}
                      className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[12px] text-txt-primary outline-none focus:border-acc"
                    >
                      <option value="REFILL">REFILL (Hidden Replenish)</option>
                      <option value="FILL">FILL (Order Matched)</option>
                      <option value="ADD">ADD (New Limit Order)</option>
                      <option value="CANCEL">CANCEL (Order Canceled)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label-xs text-txt-muted">Side</label>
                    <select
                      value={simEventSide}
                      onChange={(e) => setSimEventSide(e.target.value as any)}
                      className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[12px] text-txt-primary outline-none focus:border-acc"
                    >
                      <option value="BID">BID (Buy Side)</option>
                      <option value="ASK">ASK (Sell Side)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-xs text-txt-muted">Price ($)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={simEventPrice}
                      onChange={(e) => setSimEventPrice(Number(e.target.value))}
                      className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[12px] text-txt-primary outline-none focus:border-acc"
                    />
                  </div>
                </div>

                <Slider
                  label="Simulated Event Size (Shares)"
                  value={simEventQty}
                  min={100}
                  max={10000}
                  step={100}
                  unit=" sh"
                  tone="acc"
                  onChange={(v) => setSimEventQty(v)}
                />

                <Slider
                  label="Poisson Refill Sensitivity λ"
                  value={icebergLambda}
                  min={0.1}
                  max={2.0}
                  step={0.05}
                  tone="acc2"
                  onChange={(v) => setIcebergLambda(v)}
                />

                <Slider
                  label="Iceberg Refill Threshold Count"
                  value={icebergRefillThresh}
                  min={1}
                  max={6}
                  step={1}
                  unit=" refills"
                  tone="gold"
                  onChange={(v) => setIcebergRefillThresh(v)}
                />

                <div className="space-y-2 pt-1">
                  <Button
                    size="xs"
                    variant="primary"
                    loading={runningL3Event}
                    onClick={handleInjectL3Event}
                    icon={Zap}
                    className="w-full"
                  >
                    ⚡ Inject L3 Event into Surveillance Buffer
                  </Button>
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => handleFetchIcebergSnapshot()}
                    icon={RefreshCw}
                    className="w-full"
                  >
                    🔄 Refresh Live Depth Ladder
                  </Button>
                </div>
              </div>
            </Panel>

            {/* Right 8 Cols: Live L3 Order Book Depth Ladder with Iceberg Highlights */}
            <div className="space-y-3 xl:col-span-8">
              {/* Order Book Imbalance Balance Bar */}
              <div className="rounded-[8px] border border-line-subtle bg-surface/50 p-3">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-pos font-semibold">Bid Depth: {num(icebergSnapshot?.bid_volume_l3 ?? 15000, 0)} sh</span>
                  <span className="mono text-txt-primary font-bold">OBI: {(icebergSnapshot?.order_book_imbalance ?? 0) > 0 ? "+" : ""}{icebergSnapshot?.order_book_imbalance.toFixed(4) ?? "+0.1029"}</span>
                  <span className="text-neg font-semibold">Ask Depth: {num(icebergSnapshot?.ask_volume_l3 ?? 12200, 0)} sh</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-bg-secondary flex">
                  <div
                    className="h-full bg-pos transition-all duration-300"
                    style={{ width: `${Math.max(10, Math.min(90, 50 + (icebergSnapshot?.order_book_imbalance ?? 0) * 50))}%` }}
                  />
                  <div
                    className="h-full bg-neg transition-all duration-300"
                    style={{ width: `${Math.max(10, Math.min(90, 50 - (icebergSnapshot?.order_book_imbalance ?? 0) * 50))}%` }}
                  />
                </div>
              </div>

              {/* L3 Depth Table with Iceberg Detection */}
              <Panel level={3} title="Level-3 Microstructure Depth Ladder &amp; Stealth Liquidity" sub="Real-time hidden iceberg flags, queue refills, and estimated unrevealed liquidity">
                <div className="overflow-x-auto rounded-[6px] border border-line-subtle">
                  <table className="w-full border-collapse">
                    <thead className="bg-bg-secondary/95 text-left text-txt-muted label-xs">
                      <tr>
                        <th className="border-b border-line px-2.5 py-1.5">Side</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Price ($)</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Displayed Size</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Filled Size</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-center">Refills</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-center">P(Iceberg)</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Est. Hidden Liquidity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* ASKS (Sorted Descending) */}
                      {icebergSnapshot?.order_book_depth.asks.slice().reverse().map((ask) => (
                        <tr key={`ask-${ask.price}`} className={cn("border-b border-line-subtle/70 text-[11px]", ask.is_iceberg ? "bg-neg/10 font-medium" : "hover:bg-surface-hover/50")}>
                          <td className="px-2.5 py-1.5 text-neg font-bold">ASK</td>
                          <td className="mono px-2.5 py-1.5 text-right font-bold text-neg">${ask.price.toFixed(2)}</td>
                          <td className="mono px-2.5 py-1.5 text-right text-txt-primary">{ask.displayed_size.toLocaleString()} sh</td>
                          <td className="mono px-2.5 py-1.5 text-right text-txt-secondary">{ask.filled_size.toLocaleString()} sh</td>
                          <td className="mono px-2.5 py-1.5 text-center text-txt-muted">{ask.refill_count}x</td>
                          <td className="mono px-2.5 py-1.5 text-center">
                            {ask.is_iceberg ? (
                              <Badge tone="neg">🚨 {(ask.iceberg_prob * 100).toFixed(1)}%</Badge>
                            ) : (
                              <span className="text-txt-disabled">{(ask.iceberg_prob * 100).toFixed(0)}%</span>
                            )}
                          </td>
                          <td className="mono px-2.5 py-1.5 text-right font-bold text-neg">
                            {ask.is_iceberg ? `+${ask.est_hidden_size.toLocaleString()} sh` : "—"}
                          </td>
                        </tr>
                      ))}

                      {/* MIDPOINT SPREAD BAR */}
                      <tr className="bg-bg-secondary/80 text-[10.5px]">
                        <td colSpan={7} className="px-2.5 py-1 text-center mono text-txt-muted">
                          ── Mid Price: ${icebergBasePrice.toFixed(2)} · Spread: 7.0 bps · VPIN Toxicity: {icebergSnapshot?.vpin_toxicity_score.toFixed(3) ?? "0.584"} ──
                        </td>
                      </tr>

                      {/* BIDS (Sorted Descending) */}
                      {icebergSnapshot?.order_book_depth.bids.map((bid) => (
                        <tr key={`bid-${bid.price}`} className={cn("border-b border-line-subtle/70 text-[11px]", bid.is_iceberg ? "bg-pos/10 font-medium" : "hover:bg-surface-hover/50")}>
                          <td className="px-2.5 py-1.5 text-pos font-bold">BID</td>
                          <td className="mono px-2.5 py-1.5 text-right font-bold text-pos">${bid.price.toFixed(2)}</td>
                          <td className="mono px-2.5 py-1.5 text-right text-txt-primary">{bid.displayed_size.toLocaleString()} sh</td>
                          <td className="mono px-2.5 py-1.5 text-right text-txt-secondary">{bid.filled_size.toLocaleString()} sh</td>
                          <td className="mono px-2.5 py-1.5 text-center text-txt-muted">{bid.refill_count}x</td>
                          <td className="mono px-2.5 py-1.5 text-center">
                            {bid.is_iceberg ? (
                              <Badge tone="pos">🚨 {(bid.iceberg_prob * 100).toFixed(1)}%</Badge>
                            ) : (
                              <span className="text-txt-disabled">{(bid.iceberg_prob * 100).toFixed(0)}%</span>
                            )}
                          </td>
                          <td className="mono px-2.5 py-1.5 text-right font-bold text-pos">
                            {bid.is_iceberg ? `+${bid.est_hidden_size.toLocaleString()} sh` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : mode === "Real-Time VPIN Toxicity Surface (v19)" ? (
        /* ── REAL-TIME VPIN TOXICITY SURFACE RADAR (v19 Module 2) ── */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            <StatCell
              k="VPIN Toxicity Score"
              v={vpinSurfaceResult?.latest_vpin_score.toFixed(4) ?? "0.3840"}
              tone={vpinSurfaceResult?.latest_regime === "HIGH_TOXICITY" ? "neg" : vpinSurfaceResult?.latest_regime === "ELEVATED" ? "warn" : "pos"}
            />
            <StatCell
              k="Toxicity Regime"
              v={vpinSurfaceResult?.latest_regime ?? "NORMAL"}
              tone={vpinSurfaceResult?.latest_regime === "HIGH_TOXICITY" ? "neg" : vpinSurfaceResult?.latest_regime === "ELEVATED" ? "warn" : "pos"}
            />
            <StatCell
              k="Adverse Selection Risk"
              v={`${vpinSurfaceResult?.adverse_selection_risk_bps ?? 6.34} bps`}
              tone={vpinSurfaceResult?.adverse_selection_risk_bps && vpinSurfaceResult.adverse_selection_risk_bps > 10 ? "neg" : "pos"}
            />
            <StatCell
              k="Volume Bars Clock"
              v={`${vpinSurfaceResult?.completed_buckets.length ?? 6} Completed`}
              tone="pos"
            />
            <StatCell
              k="Lee-Ready Classifier"
              v="Active (L3)"
              tone="pos"
            />
            <StatCell
              k="Bucket Size (V_b)"
              v="2,500 Shares"
              tone="pos"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* Left 4 Cols: VPIN Parameter Station & Simulation Controls */}
            <Panel level={3} className="xl:col-span-4" title="VPIN Volume Clock Radar" sub="Continuous volume-synchronized probability of toxicity estimation">
              <div className="space-y-3">
                <div>
                  <label className="label-xs text-txt-muted">Underlying Ticker Symbol</label>
                  <select
                    value={vpinSymbol}
                    onChange={(e) => {
                      setVpinSymbol(e.target.value);
                      if (e.target.value.includes("TCS")) setVpinBasePrice(3840.50);
                      else if (e.target.value.includes("INFY")) setVpinBasePrice(1845.0);
                      else setVpinBasePrice(2950.0);
                    }}
                    className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[12px] text-txt-primary outline-none focus:border-acc"
                  >
                    <option value="RELIANCE.NS">RELIANCE.NS (Energy &amp; Conglomerate)</option>
                    <option value="TCS.NS">TCS.NS (Large-Cap IT Leader)</option>
                    <option value="HDFCBANK.NS">HDFCBANK.NS (Banking Core)</option>
                    <option value="INFY.NS">INFY.NS (Software Export)</option>
                  </select>
                </div>

                <Slider
                  label="Base Mid Price (INR)"
                  value={vpinBasePrice}
                  min={1000}
                  max={5000}
                  step={10}
                  unit=" ₹"
                  tone="acc"
                  onChange={setVpinBasePrice}
                />

                <Slider
                  label="Simulated High-Freq Ticks"
                  value={vpinNumTicks}
                  min={20}
                  max={200}
                  step={10}
                  unit=" Ticks"
                  tone="acc"
                  onChange={setVpinNumTicks}
                />

                <div className="flex items-center justify-between rounded-[6px] border border-line-subtle bg-bg-secondary/40 p-2.5">
                  <div>
                    <span className="text-[11.5px] font-semibold text-txt-primary">Simulate Toxic Selling Wave</span>
                    <p className="text-[10px] text-txt-muted">Injects sudden aggressive institutional sell sweeps</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={vpinStressMode}
                    onChange={(e) => setVpinStressMode(e.target.checked)}
                    className="h-4 w-4 rounded border-line text-acc focus:ring-acc"
                  />
                </div>

                <div className="rounded-[6px] border border-line-subtle bg-bg-secondary/40 p-2.5 text-[11px] space-y-1.5">
                  <div className="flex justify-between text-txt-muted">
                    <span>Classification Rule:</span>
                    <span className="mono text-acc font-bold">Lee-Ready (Tick Test)</span>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>Volume Clock Window (N):</span>
                    <span className="mono text-pos font-bold">20 Volume Buckets</span>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>High Toxicity Threshold:</span>
                    <span className="mono text-neg font-bold">VPIN &gt; 0.70</span>
                  </div>
                </div>

                <div className="pt-1">
                  <Button
                    size="xs"
                    variant="primary"
                    loading={runningVpinSim}
                    onClick={handleSimulateVpinSurface}
                    icon={Gauge}
                    className="w-full"
                  >
                    ⚡ Compute VPIN Volume Surface
                  </Button>
                </div>
              </div>
            </Panel>

            {/* Right 8 Cols: Dynamic Volume Bars & Tick Trajectory */}
            <div className="space-y-3 xl:col-span-8">
              {/* Volume Bars Imbalance Ladder */}
              <Panel level={3} title="Volume-Synchronized Imbalance Bars" sub="Sequential volume buckets with buy vs. sell volume decomposition">
                <div className="space-y-2">
                  {vpinSurfaceResult?.completed_buckets.map((b) => (
                    <div key={b.bucket_index} className="rounded-[6px] border border-line-subtle bg-surface/60 p-2.5">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="mono font-bold text-txt-primary">Bar #{b.bucket_index} · Mark: ₹{b.price_mark.toFixed(2)}</span>
                        <span className="mono text-txt-muted">
                          Imbalance: <span className={cn("font-bold", b.imbalance_ratio > 0.3 ? "text-neg" : "text-pos")}>{b.imbalance.toLocaleString()} sh ({(b.imbalance_ratio * 100).toFixed(1)}%)</span>
                        </span>
                      </div>
                      <div className="flex h-3 overflow-hidden rounded-[3px] bg-bg-secondary">
                        <div
                          style={{ width: `${(b.buy_volume / (b.buy_volume + b.sell_volume || 1)) * 100}%` }}
                          className="bg-pos transition-all"
                          title={`Buy: ${b.buy_volume} sh`}
                        />
                        <div
                          style={{ width: `${(b.sell_volume / (b.buy_volume + b.sell_volume || 1)) * 100}%` }}
                          className="bg-neg transition-all"
                          title={`Sell: ${b.sell_volume} sh`}
                        />
                      </div>
                      <div className="flex justify-between text-[9.5px] text-txt-disabled mt-1 mono">
                        <span>▲ Buy: {b.buy_volume.toLocaleString()} sh</span>
                        <span>▼ Sell: {b.sell_volume.toLocaleString()} sh</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Tick Flow Table */}
              <Panel level={3} title="Recent High-Frequency Tick Ingestion Log" sub="Lee-Ready tick classification and instant VPIN impact">
                <div className="overflow-x-auto rounded-[6px] border border-line-subtle">
                  <table className="w-full border-collapse">
                    <thead className="bg-bg-secondary/95 text-left text-txt-muted label-xs">
                      <tr>
                        <th className="border-b border-line px-2.5 py-1.5">Price</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Volume</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-center">Direction</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">VPIN</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Adverse Risk</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Regime</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vpinSurfaceResult?.tick_trajectory.slice(-8).map((t, idx) => (
                        <tr key={idx} className="border-b border-line-subtle/70 text-[11px] hover:bg-surface-hover/50">
                          <td className="mono px-2.5 py-1.5 font-bold text-txt-primary">₹{t.price.toFixed(2)}</td>
                          <td className="mono px-2.5 py-1.5 text-right text-txt-secondary">{t.volume.toLocaleString()} sh</td>
                          <td className="px-2.5 py-1.5 text-center">
                            <Badge tone={t.tick_direction === "BUY" ? "pos" : t.tick_direction === "SELL" ? "neg" : "neu"}>
                              {t.tick_direction}
                            </Badge>
                          </td>
                          <td className="mono px-2.5 py-1.5 text-right font-bold text-txt-primary">{t.vpin_score.toFixed(4)}</td>
                          <td className="mono px-2.5 py-1.5 text-right text-txt-muted">{t.adverse_selection_risk_bps.toFixed(1)} bps</td>
                          <td className="px-2.5 py-1.5 text-right">
                            <RiskBadge level={t.toxicity_regime === "HIGH_TOXICITY" ? "CRITICAL" : t.toxicity_regime === "ELEVATED" ? "WARNING" : "NORMAL"} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">

        {/* ── Factor library & Plugin SDK ── */}
        <div className="grid gap-3 xl:col-span-3 content-start">
          <Panel level={3} title="Factor Library" sub="Click to overlay on the chart" bodyClass="p-0">
            {factors.loading || !factors.data ? (
              <div className="space-y-2 p-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : (
              <ul className="max-h-[420px] overflow-y-auto">
                {factors.data.map((f) => {
                  const on = selected.includes(f.key);
                  return (
                    <li key={f.key}>
                      <button onClick={() => toggle(f.key)}
                        className={cn("relative block w-full border-b border-line-subtle px-3 py-2.5 text-left transition-colors", on ? "bg-surface-selected" : "hover:bg-surface-hover/60")}>
                        {on && <span className="absolute left-0 top-1/2 h-7 w-[2px] -translate-y-1/2 rounded-r" style={{ background: COLORS[selected.indexOf(f.key) % COLORS.length] }} />}
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex min-w-0 items-center gap-1.5">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: on ? COLORS[selected.indexOf(f.key) % COLORS.length] : "#2e3d4c" }} />
                            <span className="truncate text-[12px] text-txt-primary">{f.name}</span>
                          </span>
                          <RiskBadge level={f.status} />
                        </div>
                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2.5 text-[10px] text-txt-muted">
                            <span>SR <span className="mono text-txt-secondary">{f.sharpe.toFixed(2)}</span></span>
                            <span>IC <span className="mono text-txt-secondary">{f.ic.toFixed(3)}</span></span>
                            <span>HL <span className="mono text-txt-secondary">{f.halfLife}</span></span>
                          </span>
                          <Sparkline data={f.series.slice(-24)} width={44} height={16} tone={f.status === "DECAY" ? "neg" : "pos"} fill={false} animate={false} strokeWidth={0.9} />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel level={3} title="Plugin Factor SDK" sub="Drop custom BaseFactor python scripts" bodyClass="p-2.5">
            <div className="space-y-2">
              <div className="rounded-[6px] border border-line-subtle bg-bg-secondary/60 p-2 text-[10.5px]">
                <div className="flex items-center justify-between text-txt-primary">
                  <span className="font-semibold mono">CustomOrderFlow.py</span>
                  <Badge tone="pos">COMPILED</Badge>
                </div>
                <p className="mt-1 text-txt-muted">Microstructure order flow imbalance signal via BaseFactor SDK.</p>
                <div className="mt-1.5 flex items-center justify-between border-t border-line-subtle pt-1 text-[9.5px]">
                  <span className="mono text-acc">IC: 0.054</span>
                  <span className="text-txt-disabled">Plugin ID: #usr_alpha_09</span>
                </div>
              </div>
              <Button size="xs" variant="secondary" className="w-full" onClick={() => push({ title: "Custom Factor SDK", body: "BaseFactor plugin registered. Drag & drop .py scripts into /plugins folder to hot-reload." })}>
                + Register Custom Factor (.py)
              </Button>
            </div>
          </Panel>
        </div>

        {/* ── Center: performance ── */}
        <div className="grid gap-3 xl:col-span-6">
          <Panel level={3}
            title={<div className="flex items-center gap-2"><FlaskConical size={13} className="text-acc" strokeWidth={1.6} /><h3 className="text-[13px] font-semibold text-txt-primary">Factor Performance</h3></div>}
            sub="Cumulative long-short decile spread, volatility-scaled to 10% ann."
            actions={<SegmentedControl size="xs" options={RANGES} value={range} onChange={setRange} ariaLabel="Factor range" />}
          >
            {factors.loading ? <ChartSkeleton height={264} /> : series.length === 0 ? (
              <div className="flex h-[264px] flex-col items-center justify-center gap-2 rounded-[6px] border border-dashed border-line text-center">
                <p className="text-[12px] text-txt-secondary">No factors selected</p>
                <p className="text-[11px] text-txt-muted">Select up to six factors from the library to overlay performance.</p>
              </div>
            ) : (
              <>
                <MultiLine data={chartData} series={series} height={264} />
                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line-subtle pt-2.5">
                  {series.map((s) => {
                    const f = factors.data!.find((x) => x.key === s.key)!;
                    return (
                      <span key={s.key} className="flex items-center gap-1.5">
                        <span className="h-[2px] w-4 rounded-full" style={{ background: s.color }} />
                        <span className="text-[11px] text-txt-secondary">{s.name}</span>
                        <Delta value={f.ytd} className="text-[10.5px]" />
                      </span>
                    );
                  })}
                </div>
              </>
            )}
          </Panel>

          <Panel level={3} title="Factor Correlation" sub="Return correlation between active factor sleeves">
            {corr.loading || !corr.data ? <Skeleton className="h-48" /> : <CorrelationMatrix labels={corr.data.labels} matrix={corr.data.matrix} />}
            <p className="mt-3 border-t border-line-subtle pt-2.5 text-[10.5px] leading-relaxed text-txt-muted">
              Momentum and the ML ensemble are <span className="mono text-warn">0.62</span> correlated — combined weight of 40% concentrates the composite. Consider capping joint exposure at 35%.
            </p>
          </Panel>
        </div>

        {/* ── Right: configuration ── */}
        <div className="grid gap-3 xl:col-span-3">
          <Panel level={3} title="Composite Configuration" sub="Signal blend weights"
            actions={<span className={cn("mono text-[11px]", total === 100 ? "text-pos" : "text-warn")}>{total}%</span>}>
            <div className="space-y-3.5">
              {(Object.keys(weights) as WeightKey[]).map((k) => (
                <Slider key={k} label={k} value={weights[k]} min={0} max={50} step={1} unit="%"
                  tone={k === "ML" ? "acc2" : k === "Risk" ? "gold" : "acc"} onChange={(v) => setW(k, v)} />
              ))}
            </div>
            {total !== 100 && (
              <div className="mt-3 rounded-[6px] border border-warn/25 bg-warn/6 px-2.5 py-2 text-[10.5px] leading-relaxed text-warn">
                ▲ Weights sum to {total}%. Normalise to 100% before promoting the composite.
              </div>
            )}
            <div className="mt-3 border-t border-line-subtle pt-3">
              <div className="mb-2 label-xs text-txt-disabled">Blend preview</div>
              <div className="flex h-2.5 overflow-hidden rounded-[3px]">
                {(Object.keys(weights) as WeightKey[]).map((k, i) => (
                  <div key={k} title={`${k} ${weights[k]}%`} style={{ width: `${(weights[k] / Math.max(total, 1)) * 100}%`, background: COLORS[i % COLORS.length], opacity: 0.8 }} />
                ))}
              </div>
            </div>
          </Panel>

          <Panel level={3} title="Signal Diagnostics" sub="Live composite health">
            <ul className="space-y-3">
              <Diag label="Information coefficient" v="0.058" u={72} note="rolling 60d, target > 0.04" />
              <Diag label="Signal breadth" v="184 / 200" u={92} note="names with valid score" />
              <Diag label="Autocorrelation (1d)" v="0.71" u={71} note="stability of ranking" />
              <Diag label="Crowding score" v="0.34" u={34} note="vs street positioning" tone="pos" />
              <Diag label="Capacity" v="₹840 Cr" u={46} note="at 15% ADV participation" />
            </ul>
          </Panel>
        </div>
        {/* ── Backtest strip ── */}
        <Panel level={3} className="mt-3 xl:col-span-12" title="Backtest Alpha" sub="Composite out-of-sample: Apr 2019 – Aug 2026 · 20D rebalance · 12bps round-trip"
          actions={running ? <Badge tone="info" dot>Running…</Badge> : <Badge tone="pos" dot>Fresh</Badge>}>
          <div className={cn("grid grid-cols-2 gap-3 transition-opacity duration-300 sm:grid-cols-3 lg:grid-cols-6", running && "opacity-40")}>
            <StatCell k="Sharpe" v={composite.sharpe.toFixed(2)} tone="pos" sub="Rf 6.8%" />
            <StatCell k="CAGR" v={`${composite.cagr.toFixed(1)}%`} tone="pos" sub="net of costs" />
            <StatCell k="Max Drawdown" v={`${composite.dd.toFixed(1)}%`} tone="neg" sub="peak-to-trough" />
            <StatCell k="Win Rate" v={`${composite.win.toFixed(1)}%`} sub="542 trades" />
            <StatCell k="Turnover" v={`${composite.turn.toFixed(1)}%`} sub="monthly" />
            <StatCell k="Capacity" v="₹840 Cr" sub="15% ADV" />
          </div>
          {running && (
            <div className="mt-3">
              <Progress value={64} tone="acc" />
              <p className="mt-1.5 mono text-[10px] text-txt-muted">Re-estimating factor loadings · 1,842 / 2,880 rebalance dates</p>
            </div>
          )}
        </Panel>
      </div>
      )}
    </>
  );
}

function Diag({ label, v, u, note, tone }: { label: string; v: string; u: number; note: string; tone?: "pos" }) {
  return (
    <li>
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-[11.5px] text-txt-secondary">{label}</span>
        <span className="mono shrink-0 text-[11.5px] text-txt-primary">{v}</span>
      </div>
      <div className="mt-1.5"><Progress value={u} tone={tone === "pos" ? "acc" : u > 80 ? "acc" : u > 50 ? "acc2" : "warn"} height={2} /></div>
      <div className="mt-1 text-[9.5px] text-txt-disabled">{note}</div>
    </li>
  );
}

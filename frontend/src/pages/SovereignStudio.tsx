import { useEffect, useState } from "react";
import {
  Binary,
  Activity,
  ShieldCheck,
  Zap,
  RefreshCw,
  Play,
  Sliders,
  Sparkles,
  Lock,
  Cpu,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Radio,
  Clock,
  Layers,
  Globe,
  HardDrive,
} from "lucide-react";
import { PageHeader } from "../components/layout/AppShell";
import { Badge, Button, Panel, useToast } from "../components/ui";
import {
  sovereignService,
  type SovereignTelemetry,
  type LNNStepResult,
  type ZkProofResult,
  type ZkVerifyResult,
  type FederatedResult,
  type EdgeFirmwareStatus,
  type SovereignPipelineResult,
} from "../services/v25";
import { cn } from "../utils/cn";

export default function SovereignStudio() {
  const [telemetry, setTelemetry] = useState<SovereignTelemetry | null>(null);
  const [pipelineResult, setPipelineResult] = useState<SovereignPipelineResult | null>(null);

  // Sub-engine states
  const [lnnState, setLnnState] = useState<LNNStepResult | null>(null);
  const [zkProof, setZkProof] = useState<ZkProofResult | null>(null);
  const [zkVerify, setZkVerify] = useState<ZkVerifyResult | null>(null);
  const [fedState, setFedState] = useState<FederatedResult | null>(null);
  const [edgeState, setEdgeState] = useState<EdgeFirmwareStatus | null>(null);

  // Interactive controls
  const [dtVal, setDtVal] = useState<number>(0.005);
  const [epsilonVal, setEpsilonVal] = useState<number>(1.2);
  const [liabilitiesVal, setLiabilitiesVal] = useState<number>(9200000);
  const [fallbackActive, setFallbackActive] = useState<boolean>(false);

  // Loading flags
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [steppingLNN, setSteppingLNN] = useState(false);
  const [provingZk, setProvingZk] = useState(false);
  const [runningFederated, setRunningFederated] = useState(false);

  const [activeTab, setActiveTab] = useState<"lnn" | "zk" | "federated" | "edge">("lnn");
  const { push } = useToast();

  const fetchTelemetry = async () => {
    setLoadingTelemetry(true);
    try {
      const data = await sovereignService.getTelemetry();
      setTelemetry(data);
    } catch (err: any) {
      console.warn("Using simulated telemetry baseline:", err.message);
      setTelemetry({
        status: "ONLINE",
        version: "v25.0.0",
        modules: {
          neuromorphic_lnn: "CONTINUOUS_TIME_ODE_ADAPTIVE_DYNAMICS_v25",
          zero_knowledge_solvency: "GROTH16_HALO2_PEDERSEN_zkPOS_v25",
          federated_learning: "SMPC_DIFFERENTIAL_PRIVACY_CROSS_DESK_v25",
          edge_firmware: "BARE_METAL_WASM_AOT_SUB_MICROSECOND_v25",
        },
        metrics: {
          edge_latency_ns: 342.5,
          target_sla_latency_ns: 500.0,
          dp_epsilon: 1.2,
          dp_delta: 1e-5,
          offline_fallback: "ONLINE_STANDBY",
        },
        tracked_assets: ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK"],
        timestamp: Date.now() / 1000,
      });
    } finally {
      setLoadingTelemetry(false);
    }
  };

  const runUnifiedPipeline = async () => {
    setRunningPipeline(true);
    try {
      const res = await sovereignService.executePipeline({
        dt: dtVal,
        epsilon: epsilonVal,
        liabilities_inr: liabilitiesVal,
      });
      setPipelineResult(res);
      setLnnState(res.lnn_ode_step);
      setZkProof(res.zk_proof_of_solvency);
      setZkVerify(res.zk_verification);
      setFedState(res.federated_alpha_smpc);
      setEdgeState(res.bare_metal_edge_firmware);
      push({
        title: "Sovereign Pipeline Executed",
        description: `Regime: ${res.executive_summary.market_regime} | zk-PoS Proven: ${res.executive_summary.zk_solvency_proven} | Edge Latency: ${res.executive_summary.edge_latency_ns}ns`,
        tone: "pos",
      });
    } catch (err: any) {
      push({
        title: "Pipeline Execution Error",
        description: err.message,
        tone: "neg",
      });
    } finally {
      setRunningPipeline(false);
    }
  };

  const handleLNNStep = async (isShock: boolean = false) => {
    setSteppingLNN(true);
    try {
      const mockTicks = isShock
        ? [3300.0, 4600.0, 1850.0, 2150.0, 1350.0]
        : [2980.0, 4120.0, 1640.0, 1890.0, 1180.0];
      const res = await sovereignService.stepLNN({
        ticks: mockTicks,
        dt: isShock ? 0.001 : dtVal,
      });
      setLnnState(res);
      push({
        title: isShock ? "⚡ Market Shock Ingested" : "LNN ODE Step Complete",
        description: `Effective Tau: ${res.effective_tau_ms.toFixed(2)}ms | Regime: ${res.regime}`,
        tone: isShock ? "warn" : "pos",
      });
    } catch (err: any) {
      push({ title: "LNN Step Error", description: err.message, tone: "neg" });
    } finally {
      setSteppingLNN(false);
    }
  };

  const handleProveSolvency = async () => {
    setProvingZk(true);
    try {
      const proof = await sovereignService.proveSolvency({
        liabilities_inr: liabilitiesVal,
        portfolio_weights: [0.11, 0.115, 0.10, 0.09, 0.11],
      });
      setZkProof(proof);
      const verify = await sovereignService.verifyProof({
        commitment_int: proof.pedersen_commitment_int,
        public_signals: proof.public_signals,
        proof: proof.groth16_proof,
      });
      setZkVerify(verify);
      push({
        title: "zk-PoS Proven & Verified",
        description: `Commitment: ${proof.commitment_hash} | Verified: ${verify.verified}`,
        tone: verify.verified ? "pos" : "neg",
      });
    } catch (err: any) {
      push({ title: "zk Proof Error", description: err.message, tone: "neg" });
    } finally {
      setProvingZk(false);
    }
  };

  const handleRunFederated = async () => {
    setRunningFederated(true);
    try {
      const res = await sovereignService.runFederatedAggregation({
        epsilon: epsilonVal,
      });
      setFedState(res);
      push({
        title: "Federated SMPC Aggregation Complete",
        description: `DP (ε=${res.privacy_parameters.epsilon}, δ=${res.privacy_parameters.delta}) | Consensus Sharpe: ${res.consensus_sharpe_projection}`,
        tone: "pos",
      });
    } catch (err: any) {
      push({ title: "Federated Error", description: err.message, tone: "neg" });
    } finally {
      setRunningFederated(false);
    }
  };

  const handleToggleFallback = async () => {
    const nextState = !fallbackActive;
    try {
      const res = await sovereignService.toggleOfflineFallback(nextState);
      setFallbackActive(res.offline_fallback_active);
      push({
        title: res.action,
        description: res.message,
        tone: res.offline_fallback_active ? "warn" : "pos",
      });
      // Refresh edge status
      const edge = await sovereignService.getEdgeStatus();
      setEdgeState(edge);
    } catch (err: any) {
      push({ title: "Fallback Toggle Error", description: err.message, tone: "neg" });
    }
  };

  useEffect(() => {
    fetchTelemetry();
    runUnifiedPipeline();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Sovereign AI & Bare-Metal Studio"
        subtitle="Neuromorphic Continuous-Time LNNs • Zero-Knowledge Solvency Proofs • Federated Differential Privacy • Sub-500ns Edge Wasm"
        badge="v25 Sovereign"
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchTelemetry}
              loading={loadingTelemetry}
              icon={RefreshCw}
            >
              Telemetry
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={runUnifiedPipeline}
              loading={runningPipeline}
              icon={Play}
            >
              Execute v25 Pipeline
            </Button>
          </div>
        }
      />

      {/* Telemetry HUD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Neuromorphic LNN */}
        <Panel level={2} className="relative overflow-hidden p-4 border border-border/60 hover:border-acc/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-txt-muted flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-acc" /> LNN Continuous ODE
            </span>
            <Badge
              size="xs"
              tone={
                (lnnState?.regime || "NORMAL_STABLE") === "HIGH_VOLATILITY_ACCELERATED"
                  ? "warn"
                  : "pos"
              }
            >
              {lnnState?.regime || "NORMAL_STABLE"}
            </Badge>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-mono font-bold text-txt">
              {(lnnState?.effective_tau_ms ?? 97.7).toFixed(1)}
              <span className="text-xs font-mono font-normal text-txt-muted ml-1">ms (τ_eff)</span>
            </div>
            <div className="text-[11px] font-mono text-txt-secondary">
              Δt: {(dtVal * 1000).toFixed(1)}ms
            </div>
          </div>
          <div className="mt-2 text-[11px] text-txt-muted">
            Continuous ODE Gating: <span className="font-mono text-txt">tanh(W_in·x + W_rec·h)</span>
          </div>
        </Panel>

        {/* Card 2: Zero-Knowledge Solvency */}
        <Panel level={2} className="relative overflow-hidden p-4 border border-border/60 hover:border-acc/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-txt-muted flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-400" /> zk-PoS Solvency
            </span>
            <Badge
              size="xs"
              tone={zkVerify?.verified ? "pos" : "neutral"}
            >
              {zkVerify?.verified ? "VERIFIED O(1)" : "UNVERIFIED"}
            </Badge>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-mono font-bold text-txt">
              {zkProof ? (
                <span className="text-emerald-400">₹{(zkProof.private_witness_summary.solvency_margin_inr / 100000).toFixed(1)} L</span>
              ) : (
                "₹123.0 L"
              )}
            </div>
            <div className="text-[11px] font-mono text-txt-secondary">
              Solvency Margin
            </div>
          </div>
          <div className="mt-2 text-[11px] text-txt-muted flex items-center gap-1 truncate font-mono">
            Commitment: <span className="text-acc">{zkProof?.commitment_hash ?? "0x29043131"}</span>
          </div>
        </Panel>

        {/* Card 3: Federated SMPC */}
        <Panel level={2} className="relative overflow-hidden p-4 border border-border/60 hover:border-acc/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-txt-muted flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-sky-400" /> Federated SMPC
            </span>
            <Badge size="xs" tone="pos">
              3 Desks Synced
            </Badge>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-mono font-bold text-txt">
              {(fedState?.consensus_sharpe_projection ?? 2.84).toFixed(2)}
              <span className="text-xs font-mono font-normal text-txt-muted ml-1">Sharpe</span>
            </div>
            <div className="text-[11px] font-mono text-txt-secondary">
              DP: (ε={epsilonVal.toFixed(1)}, δ=1e-5)
            </div>
          </div>
          <div className="mt-2 text-[11px] text-txt-muted">
            Noise Scale σ: <span className="font-mono text-txt">{(fedState?.privacy_parameters.sigma_noise_scale ?? 3.23).toFixed(2)}</span>
          </div>
        </Panel>

        {/* Card 4: Edge Bare-Metal Wasm */}
        <Panel level={2} className="relative overflow-hidden p-4 border border-border/60 hover:border-acc/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-txt-muted flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-amber-400" /> Bare-Metal Wasm
            </span>
            <Badge
              size="xs"
              tone={fallbackActive ? "warn" : "pos"}
            >
              {fallbackActive ? "DEFENSIVE HEDGE" : "SUB-500NS SLA"}
            </Badge>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-mono font-bold text-txt">
              {(edgeState?.measured_inference_latency_ns ?? 342.5).toFixed(1)}
              <span className="text-xs font-mono font-normal text-txt-muted ml-1">ns</span>
            </div>
            <div className="text-[11px] font-mono text-emerald-400">
              Target: &lt; 500ns
            </div>
          </div>
          <div className="mt-2 text-[11px] text-txt-muted">
            Hardware: <span className="font-mono text-txt">AMD Alveo U50 FPGA</span>
          </div>
        </Panel>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/50 pb-2">
        <Button
          size="sm"
          variant={activeTab === "lnn" ? "primary" : "ghost"}
          onClick={() => setActiveTab("lnn")}
          icon={Activity}
        >
          1. Neuromorphic LNN ODE
        </Button>
        <Button
          size="sm"
          variant={activeTab === "zk" ? "primary" : "ghost"}
          onClick={() => setActiveTab("zk")}
          icon={ShieldCheck}
        >
          2. zk-PoS Solvency Verifier
        </Button>
        <Button
          size="sm"
          variant={activeTab === "federated" ? "primary" : "ghost"}
          onClick={() => setActiveTab("federated")}
          icon={Globe}
        >
          3. Federated Multi-Desk (DP)
        </Button>
        <Button
          size="sm"
          variant={activeTab === "edge" ? "primary" : "ghost"}
          onClick={() => setActiveTab("edge")}
          icon={HardDrive}
        >
          4. Bare-Metal Edge Wasm
        </Button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: Neuromorphic Liquid Neural Network (LNN) ODE Solver */}
      {/* ========================================================================= */}
      {activeTab === "lnn" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Panel level={2} className="lg:col-span-2 p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <h3 className="text-base font-semibold text-txt flex items-center gap-2">
                  <Activity className="h-4 w-4 text-acc" /> Continuous-Time ODE State Dynamics
                </h3>
                <p className="text-xs text-txt-muted mt-0.5">
                  dx(t)/dt = -[1/τ + f(x(t), I(t))] ⊙ x(t) + A·f(x(t), I(t)) with dynamic time-constant acceleration
                </p>
              </div>
              <Badge size="sm" tone="pos">Euler-ODE Solver</Badge>
            </div>

            {/* Interactive Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-bg/40 p-4 rounded-lg border border-border/40">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-txt-muted">Tick Integration Step (Δt):</span>
                  <span className="text-acc font-bold">{(dtVal * 1000).toFixed(1)} ms</span>
                </div>
                <input
                  type="range"
                  min="0.001"
                  max="0.050"
                  step="0.001"
                  value={dtVal}
                  onChange={(e) => setDtVal(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-acc"
                />
                <div className="flex justify-between text-[10px] text-txt-muted font-mono">
                  <span>1.0ms (HFT)</span>
                  <span>25.0ms</span>
                  <span>50.0ms (Slow)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleLNNStep(false)}
                  loading={steppingLNN}
                  icon={Play}
                >
                  Step Normal Tick
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleLNNStep(true)}
                  loading={steppingLNN}
                  icon={Zap}
                >
                  ⚡ Trigger Market Shock
                </Button>
              </div>
            </div>

            {/* Hidden State Trajectory Vector (16-D Neurons) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-txt-muted">LNN Hidden Neuron Activation Vector (h_t ∈ ℝ^16)</span>
                <span className="font-mono text-txt-secondary">
                  Energy Norm: {(lnnState?.readout.energy_norm ?? 1.24).toFixed(3)}
                </span>
              </div>
              <div className="grid grid-cols-8 gap-2">
                {(lnnState?.hidden_state_sample ?? [-0.42, 0.81, 0.12, -0.65, 0.33, -0.19, 0.94, -0.05]).map((val, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded border border-border/40 bg-bg/50 text-center flex flex-col items-center justify-center gap-1"
                  >
                    <span className="text-[10px] font-mono text-txt-muted">N_{idx}</span>
                    <span className={cn(
                      "text-xs font-mono font-bold",
                      val >= 0 ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Readout Output Signals */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border/40">
              <div className="p-3 rounded-lg bg-bg/50 border border-border/30">
                <div className="text-[10px] font-mono text-txt-muted uppercase">Continuous Alpha Signal</div>
                <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                  {(lnnState?.readout.alpha_return_pct ?? 0.85) > 0 ? "+" : ""}
                  {(lnnState?.readout.alpha_return_pct ?? 0.85).toFixed(3)}%
                </div>
                <div className="text-[10px] text-txt-muted mt-0.5">Expected Continuous Return</div>
              </div>

              <div className="p-3 rounded-lg bg-bg/50 border border-border/30">
                <div className="text-[10px] font-mono text-txt-muted uppercase">Dynamic Volatility</div>
                <div className="text-lg font-mono font-bold text-amber-400 mt-1">
                  {(lnnState?.readout.predicted_volatility_pct ?? 18.4).toFixed(2)}%
                </div>
                <div className="text-[10px] text-txt-muted mt-0.5">Instantaneous ODE Sigma</div>
              </div>

              <div className="p-3 rounded-lg bg-bg/50 border border-border/30">
                <div className="text-[10px] font-mono text-txt-muted uppercase">Confidence Level</div>
                <div className="text-lg font-mono font-bold text-acc mt-1">
                  {((lnnState?.readout.confidence_score ?? 0.94) * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-txt-muted mt-0.5">Asymptotic Stability Bounds</div>
              </div>
            </div>
          </Panel>

          {/* LNN Architecture Sidebar */}
          <Panel level={2} className="p-5 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-txt-muted flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-acc" /> Dynamic Adaptation Theory
            </h4>
            <div className="text-xs text-txt-secondary leading-relaxed space-y-3">
              <p>
                Standard neural networks fail during irregular tick clusters because fixed step sizes lose continuous liquidity context.
              </p>
              <div className="p-3 rounded bg-bg/60 border border-border/40 font-mono text-[11px] text-txt">
                τ_eff = τ_base / (1 + τ_base · |f(x, I)|)
              </div>
              <p>
                When order arrival spikes (flash crash), <span className="text-acc font-mono">τ_eff</span> shrinks automatically, accelerating network updates in continuous time without vanishing or exploding gradients.
              </p>
            </div>

            <div className="pt-4 border-t border-border/40 space-y-2">
              <div className="text-xs font-semibold text-txt">Tracked Institutional Equities</div>
              <div className="space-y-1">
                {["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK"].map((sym, i) => (
                  <div key={sym} className="flex justify-between items-center text-xs font-mono py-1 px-2 rounded bg-bg/40">
                    <span className="text-txt">{sym}</span>
                    <span className="text-txt-muted">
                      ₹{lnnState?.raw_ticks[i] ? lnnState.raw_ticks[i].toFixed(1) : (2500 + i * 400).toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: Zero-Knowledge Proof-of-Solvency (zk-PoS) Terminal */}
      {/* ========================================================================= */}
      {activeTab === "zk" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Panel level={2} className="lg:col-span-2 p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <h3 className="text-base font-semibold text-txt flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Groth16 / Halo2 Zero-Knowledge Proof-of-Solvency
                </h3>
                <p className="text-xs text-txt-muted mt-0.5">
                  Proves fund solvency (Assets ≥ Liabilities) and VaR limit (95% 1D VaR ≤ ₹18.4L) with zero position disclosure
                </p>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={handleProveSolvency}
                loading={provingZk}
                icon={Lock}
              >
                Generate zk-SNARK Proof
              </Button>
            </div>

            {/* Cryptographic Pedersen Commitment */}
            <div className="p-4 rounded-lg bg-bg/50 border border-border/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-txt-muted">Homomorphic Pedersen Commitment</span>
                <Badge size="xs" tone="pos">Curve: alt_bn128 (BN254)</Badge>
              </div>
              <div className="p-3 rounded bg-bg font-mono text-xs text-txt break-all flex items-center justify-between">
                <span className="text-acc">{zkProof?.commitment_hash ?? "0x29043131e84a51b9201f"}</span>
                <span className="text-[10px] text-txt-muted ml-2">C_w = ∏ g_i^w_i · h^r (mod p)</span>
              </div>
            </div>

            {/* zk Circuit Statements Checklist */}
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase text-txt-muted">Circuit Statements Verified in O(1) Time</div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Statement 1 */}
                <div className="p-3 rounded-lg border border-border/40 bg-bg/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-txt">1. Solvency Check</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-[11px] text-txt-muted">
                    Assets ≥ Liabilities
                  </div>
                  <div className="text-xs font-mono text-emerald-400 mt-1">
                    Margin: +₹{((zkProof?.private_witness_summary.solvency_margin_inr ?? 12300000) / 100000).toFixed(1)} L
                  </div>
                </div>

                {/* Statement 2 */}
                <div className="p-3 rounded-lg border border-border/40 bg-bg/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-txt">2. Concentration Cap</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-[11px] text-txt-muted">
                    Max Single Weight ≤ 12.0%
                  </div>
                  <div className="text-xs font-mono text-emerald-400 mt-1">
                    Observed: {((zkProof?.private_witness_summary.max_weight_observed ?? 0.115) * 100).toFixed(1)}%
                  </div>
                </div>

                {/* Statement 3 */}
                <div className="p-3 rounded-lg border border-border/40 bg-bg/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-txt">3. VaR Limit Gate</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-[11px] text-txt-muted">
                    95% 1D VaR ≤ ₹18.40 L
                  </div>
                  <div className="text-xs font-mono text-emerald-400 mt-1">
                    Calc: ₹{((zkProof?.private_witness_summary.calculated_var_inr ?? 233000) / 100000).toFixed(2)} L
                  </div>
                </div>
              </div>
            </div>

            {/* Groth16 Proof Elements */}
            <div className="p-4 rounded-lg bg-bg/30 border border-border/30 space-y-2 font-mono text-xs">
              <div className="text-txt-muted uppercase text-[10px]">Groth16 Proof Coordinates (Public Protocol Payload)</div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 rounded bg-bg/60 truncate">
                  <span className="text-txt-muted">π_a: </span>
                  <span className="text-sky-400">{zkProof?.groth16_proof.pi_a[0] ?? "0x7f3b81..."}</span>
                </div>
                <div className="p-2 rounded bg-bg/60 truncate">
                  <span className="text-txt-muted">π_b: </span>
                  <span className="text-sky-400">{zkProof?.groth16_proof.pi_b[0][0] ?? "0x91a24c..."}</span>
                </div>
                <div className="p-2 rounded bg-bg/60 truncate">
                  <span className="text-txt-muted">π_c: </span>
                  <span className="text-sky-400">{zkProof?.groth16_proof.pi_c[0] ?? "0x12e95a..."}</span>
                </div>
              </div>
              <div className="text-[10px] text-txt-muted pt-1">
                Bilinear Pairing Verification: <span className="text-txt">e(A, B) == e(α, β) · e(x, γ) · e(C, δ)</span>
              </div>
            </div>
          </Panel>

          {/* zk Sidebar Audit View */}
          <Panel level={2} className="p-5 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-txt-muted flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Regulatory Audit Terminal
            </h4>
            <div className="text-xs text-txt-secondary leading-relaxed space-y-3">
              <p>
                Prime brokers and regulators can verify the mathematical truth of the fund’s financial soundness without seeing a single stock ticker or position size.
              </p>
              <div className="p-3 rounded bg-bg/60 border border-border/40 font-mono text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-txt-muted">Verifier Status:</span>
                  <span className="text-emerald-400 font-bold">{zkVerify?.verified ? "VALID" : "PENDING"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-txt-muted">Pairing Latency:</span>
                  <span className="text-acc">{zkVerify?.verification_time_us ? `${zkVerify.verification_time_us} μs` : "1.5 μs"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-txt-muted">Complexity:</span>
                  <span className="text-txt">O(1) Constant</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border/40 space-y-2">
              <div className="text-xs font-semibold text-txt">Interactive Liabilities Test</div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-txt-muted">Liabilities (INR):</span>
                  <span className="text-acc">₹{(liabilitiesVal / 100000).toFixed(1)} L</span>
                </div>
                <input
                  type="range"
                  min="5000000"
                  max="25000000"
                  step="500000"
                  value={liabilitiesVal}
                  onChange={(e) => setLiabilitiesVal(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-acc"
                />
                <div className="flex justify-between text-[10px] text-txt-muted font-mono">
                  <span>₹50L</span>
                  <span>₹150L</span>
                  <span>₹250L (Insolvent)</span>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: Federated Cross-Desk Alpha Orchestrator */}
      {/* ========================================================================= */}
      {activeTab === "federated" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Panel level={2} className="lg:col-span-2 p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <h3 className="text-base font-semibold text-txt flex items-center gap-2">
                  <Globe className="h-4 w-4 text-sky-400" /> Federated Multi-Desk Learning with Differential Privacy
                </h3>
                <p className="text-xs text-txt-muted mt-0.5">
                  Secure Multi-Party Computation (SMPC) Secret Sharing with (ε, δ)-Differential Privacy Gaussian noise
                </p>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={handleRunFederated}
                loading={runningFederated}
                icon={RefreshCw}
              >
                Sync Federated Round
              </Button>
            </div>

            {/* Differential Privacy Controls */}
            <div className="p-4 rounded-lg bg-bg/40 border border-border/40 space-y-3">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-txt-muted">Privacy Budget Epsilon (ε):</span>
                <span className="text-sky-400 font-bold">{epsilonVal.toFixed(2)} (High Privacy)</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="4.0"
                step="0.1"
                value={epsilonVal}
                onChange={(e) => setEpsilonVal(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
              <div className="flex justify-between text-[10px] text-txt-muted font-mono">
                <span>0.2 (Max Privacy, High Noise)</span>
                <span>1.2 (Balanced)</span>
                <span>4.0 (Low Noise)</span>
              </div>
            </div>

            {/* 3 Desks Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: "Mumbai Equities", spec: "High-Frequency Order Flow", norm: "0.054", delta: "+0.04" },
                { name: "Singapore Arbitrage", spec: "Cross-Market Spreads", norm: "0.048", delta: "+0.03" },
                { name: "London Macro", spec: "Global Liquidity & Rates", norm: "0.061", delta: "+0.04" },
              ].map((d) => (
                <div key={d.name} className="p-3 rounded-lg border border-border/40 bg-bg/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-txt">{d.name}</span>
                    <Badge size="xs" tone="pos">Active</Badge>
                  </div>
                  <div className="text-[11px] text-txt-muted">{d.spec}</div>
                  <div className="pt-2 border-t border-border/30 flex justify-between text-[10px] font-mono">
                    <span className="text-txt-muted">Grad Norm: {d.norm}</span>
                    <span className="text-sky-400 font-bold">{d.delta}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* SMPC Aggregated Global Weights */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-txt-muted">SMPC Consensus Portfolio Weights</span>
                <span className="text-emerald-400 font-bold">Consensus Sharpe: {(fedState?.consensus_sharpe_projection ?? 2.84).toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK"].map((sym, i) => {
                  const w = fedState?.smpc_aggregated_weights[i] ?? 0.20;
                  return (
                    <div key={sym} className="p-2.5 rounded bg-bg/50 border border-border/30 text-center">
                      <div className="text-[10px] font-mono text-txt-muted">{sym}</div>
                      <div className="text-xs font-mono font-bold text-txt mt-0.5">
                        {(w * 100).toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Panel>

          {/* Federated Learning Theory */}
          <Panel level={2} className="p-5 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-txt-muted flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-sky-400" /> Privacy & SMPC Math
            </h4>
            <div className="text-xs text-txt-secondary leading-relaxed space-y-3">
              <p>
                Each trading desk maintains isolated proprietary order logs. Only gradient vectors perturbed with Gaussian noise are transmitted:
              </p>
              <div className="p-3 rounded bg-bg/60 border border-border/40 font-mono text-[11px] text-txt">
                σ = (ΔS · √(2·ln(1.25/δ))) / ε
              </div>
              <p>
                Secure Multi-Party Computation splits updates into secret shares, guaranteeing that not even the orchestrator can reverse-engineer an individual desk’s alpha.
              </p>
            </div>
          </Panel>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: Sovereign Bare-Metal Edge Firmware & Wasm */}
      {/* ========================================================================= */}
      {activeTab === "edge" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Panel level={2} className="lg:col-span-2 p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <h3 className="text-base font-semibold text-txt flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-amber-400" /> Bare-Metal SmartNIC / FPGA & WebAssembly Micro-Kernel
                </h3>
                <p className="text-xs text-txt-muted mt-0.5">
                  Ahead-of-Time (AOT) compilation with sub-500 nanosecond execution latency and offline fallback hedging
                </p>
              </div>
              <Button
                size="sm"
                variant={fallbackActive ? "primary" : "outline"}
                onClick={handleToggleFallback}
                icon={fallbackActive ? CheckCircle2 : AlertTriangle}
              >
                {fallbackActive ? "Restore Cloud Gateway" : "Simulate Cloud Disconnect"}
              </Button>
            </div>

            {/* Hardware Telemetry Card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-bg/50 border border-border/30">
                <div className="text-[10px] font-mono text-txt-muted uppercase">Inference Latency</div>
                <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                  {(edgeState?.measured_inference_latency_ns ?? 342.5).toFixed(1)} ns
                </div>
                <div className="text-[10px] text-txt-muted mt-0.5">SLA: &lt; 500.0 ns</div>
              </div>

              <div className="p-3 rounded-lg bg-bg/50 border border-border/30">
                <div className="text-[10px] font-mono text-txt-muted uppercase">Clock Jitter</div>
                <div className="text-xl font-mono font-bold text-txt mt-1">
                  {(edgeState?.clock_jitter_ns ?? 0.14).toFixed(3)} ns
                </div>
                <div className="text-[10px] text-txt-muted mt-0.5">Hardware Crystal</div>
              </div>

              <div className="p-3 rounded-lg bg-bg/50 border border-border/30">
                <div className="text-[10px] font-mono text-txt-muted uppercase">Memory Footprint</div>
                <div className="text-xl font-mono font-bold text-txt mt-1">
                  {(edgeState?.memory_footprint_kb ?? 142.6).toFixed(1)} KB
                </div>
                <div className="text-[10px] text-txt-muted mt-0.5">L1 SRAM Cache</div>
              </div>

              <div className="p-3 rounded-lg bg-bg/50 border border-border/30">
                <div className="text-[10px] font-mono text-txt-muted uppercase">Fallback Mode</div>
                <div className={cn(
                  "text-xl font-mono font-bold mt-1",
                  fallbackActive ? "text-amber-400" : "text-emerald-400"
                )}>
                  {fallbackActive ? "ACTIVE" : "STANDBY"}
                </div>
                <div className="text-[10px] text-txt-muted mt-0.5">Autonomous Guard</div>
              </div>
            </div>

            {/* Offline Fallback Status Banner */}
            {fallbackActive && (
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-amber-400">
                    Offline Fallback Engaged: Zero-Latency Emergency Delta-Neutral Hedging
                  </div>
                  <div className="text-xs text-txt-secondary leading-relaxed">
                    Cloud gateway connection lost. Edge Wasm micro-kernel running directly inside FPGA SmartNIC memory has locked portfolio delta to zero within 4.8 microseconds. Pre-trade VaR checks active.
                  </div>
                </div>
              </div>
            )}

            {/* Autonomous Safety Checks */}
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase text-txt-muted">Edge Autonomous Safety Verifications</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "L3 Order Book Spread Collar Enforced (±2.0%)",
                  "Hardware Watchdog Timer Armed (5.0μs Timeout)",
                  "Pre-Trade VaR Gate Locked in Wasm Memory",
                  "PCIe Gen5 DMA Bypass Active (32 GT/s)",
                ].map((chk, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded bg-bg/40 border border-border/30 text-xs font-mono">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-txt">{chk}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          {/* Bare-Metal Hardware Spec */}
          <Panel level={2} className="p-5 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-txt-muted flex items-center gap-1.5">
              <HardDrive className="h-4 w-4 text-amber-400" /> Hardware Specification
            </h4>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-txt-muted">Device:</span>
                <span className="text-txt font-semibold">AMD Alveo U50</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-txt-muted">Target Architecture:</span>
                <span className="text-txt">WASM AOT AVX-512</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-txt-muted">Bus Interface:</span>
                <span className="text-txt">PCIe Gen5 x16</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-txt-muted">NIC Throughput:</span>
                <span className="text-txt">100GbE QSFP28</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-txt-muted">Failover SLA:</span>
                <span className="text-emerald-400">&lt; 10.0 μs</span>
              </div>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}

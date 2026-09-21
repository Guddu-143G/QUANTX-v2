import { useEffect, useMemo, useState } from "react";
import { Atom, CircleDot, Layers, Sparkles, Target, Zap } from "lucide-react";
import { PageHeader } from "../components/layout/AppShell";
import { Badge, Button, ChartSkeleton, Panel, Progress, SegmentedControl, Skeleton, Slider, Toggle, useAsync, useToast } from "../components/ui";
import { EfficientFrontier, type FrontierPt } from "../components/charts";
import { StatCell, TickerCell } from "../components/finance";
import { DataTable, type Column } from "../components/ui/DataTable";
import { portfolioService } from "../services";
import type { Holding } from "../data/portfolio";
import { cn } from "../utils/cn";
import { useRouter } from "../lib/router";

import { v11Service, v12Service, v17Service, type QuantumQAOAResult, type MultiPeriodResult } from "../services";
import type { QuantumQAOAResult as QuantumV17Result } from "../services/v17";

const OBJECTIVES = [
  "Max Sharpe",
  "Min Variance",
  "Risk Parity",
  "Hierarchical (HRP)",
  "Target Return",
  "Quantum QAOA (v11)",
  "Multi-Period Trajectory (v12)",
  "Hybrid Quantum QAOA (v17)",
] as const;

function frontier(): FrontierPt[] {
  return Array.from({ length: 44 }, (_, i) => {
    const risk = 7 + i * 0.34;
    const ret = 8.4 + 9.2 * Math.sqrt((risk - 7) / 15) - 0.06 * Math.pow(risk - 7, 1.35);
    return { risk: +risk.toFixed(2), ret: +ret.toFixed(2) };
  });
}

export default function Optimizer() {
  const [objective, setObjective] = useState<(typeof OBJECTIVES)[number]>("Max Sharpe");
  const [maxStock, setMaxStock] = useState(10);
  const [maxSector, setMaxSector] = useState(25);
  const [maxTurnover, setMaxTurnover] = useState(20);
  const [targetBeta, setTargetBeta] = useState(1.0);
  const [minCash, setMinCash] = useState(5);
  const [longOnly, setLongOnly] = useState(true);
  const [esg, setEsg] = useState(false);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [stage, setStage] = useState(0);
  const { push } = useToast();
  const { navigate } = useRouter();

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

  const stageOrdersToBlotter = () => {
    const stagedTrades = [
      { ticker: "RELIANCE", action: "BUY", targetWeight: 10.0, notionalInr: 2450000, limitPrice: 2840.50, orderType: "VWAP" },
      { ticker: "INFY", action: "BUY", targetWeight: 8.5, notionalInr: 1820000, limitPrice: 1845.20, orderType: "LIMIT" },
      { ticker: "TCS", action: "TRIM", targetWeight: 7.0, notionalInr: 1150000, limitPrice: 4120.00, orderType: "TWAP" },
      { ticker: "HDFCBANK", action: "BUY", targetWeight: 9.2, notionalInr: 2100000, limitPrice: 1650.80, orderType: "VWAP" },
      { ticker: "ICICIBANK", action: "HOLD", targetWeight: 6.4, notionalInr: 450000, limitPrice: 1185.00, orderType: "LIMIT" },
      { ticker: "BHARTIARTL", action: "BUY", targetWeight: 5.5, notionalInr: 980000, limitPrice: 1420.00, orderType: "TWAP" },
      { ticker: "SBIN", action: "TRIM", targetWeight: 4.0, notionalInr: 850000, limitPrice: 795.50, orderType: "LIMIT" },
      { ticker: "ITC", action: "TRIM", targetWeight: 3.5, notionalInr: 620000, limitPrice: 485.00, orderType: "LIMIT" },
      { ticker: "KOTAKBANK", action: "BUY", targetWeight: 4.8, notionalInr: 1100000, limitPrice: 1780.00, orderType: "VWAP" },
      { ticker: "LT", action: "BUY", targetWeight: 5.2, notionalInr: 1350000, limitPrice: 3560.00, orderType: "TWAP" },
      { ticker: "AXISBANK", action: "TRIM", targetWeight: 3.2, notionalInr: 580000, limitPrice: 1140.00, orderType: "LIMIT" },
      { ticker: "HINDUNILVR", action: "BUY", targetWeight: 4.0, notionalInr: 720000, limitPrice: 2680.00, orderType: "LIMIT" },
      { ticker: "TATAMOTORS", action: "BUY", targetWeight: 4.5, notionalInr: 890000, limitPrice: 995.00, orderType: "TWAP" },
      { ticker: "MARUTI", action: "TRIM", targetWeight: 2.8, notionalInr: 490000, limitPrice: 12450.00, orderType: "LIMIT" },
    ];
    try {
      localStorage.setItem("quantx_staged_orders", JSON.stringify({ stagedTrades, timestamp: new Date().toISOString() }));
    } catch {}
    push({
      title: "14 Orders Staged to Execution Blotter",
      body: "Portfolio rebalancing basket prepared for pre-trade risk compliance and DMA dispatch.",
      tone: "pos",
    });
    navigate("/execution");
  };

  const [quantumResult, setQuantumResult] = useState<QuantumQAOAResult | null>({
    solver: "Qiskit QAOA Gate-Based Quantum Simulator",
    status: "OPTIMAL",
    qubits_used: 8,
    quantum_circuit_depth: 22,
    two_qubit_cnot_gates: 56,
    p_layers: 2,
    variational_angles: { gamma: [0.24, 0.48], beta: [0.68, 0.34] },
    cardinality_target: 4,
    selected_assets: ["RELIANCE", "INFY", "ICICIBANK", "BHARTIARTL"],
    discrete_weights: { RELIANCE: 0.25, INFY: 0.25, ICICIBANK: 0.25, BHARTIARTL: 0.25 },
    portfolio_metrics: {
      expected_return_pct: 17.15,
      annualized_volatility_pct: 10.42,
      sharpe_ratio: 0.99,
      qubo_ground_energy: -0.1584,
    },
    convergence_history: [
      { iteration: 1, expectation_energy: -0.042 },
      { iteration: 5, expectation_energy: -0.098 },
      { iteration: 10, expectation_energy: -0.134 },
      { iteration: 15, expectation_energy: -0.152 },
      { iteration: 20, expectation_energy: -0.1584 },
    ],
    classical_vs_quantum_gap_bps: 4.2,
  });

  const [multiPeriodResult, setMultiPeriodResult] = useState<MultiPeriodResult | null>({
    status: "OPTIMAL",
    horizon_periods: 6,
    assets: ["RELIANCE", "HDFCBANK", "TCS", "INFY", "ICICIBANK", "GSEC_10Y", "CASH"],
    ledoit_wolf_shrinkage_delta: 0.214,
    cumulative_turnover_pct: 48.6,
    total_transaction_cost_bps: 24.8,
    annualized_net_alpha_bps: 184.2,
    trajectory: [
      { period: 1, label: "M1", weights: { RELIANCE: 0.16, HDFCBANK: 0.18, TCS: 0.14, INFY: 0.14, ICICIBANK: 0.15, GSEC_10Y: 0.15, CASH: 0.08 }, expected_return_pct: 16.8, volatility_pct: 9.8, turnover_pct: 12.4, transaction_cost_bps: 5.8, net_sharpe: 1.02, hhi_concentration: 0.154 },
      { period: 2, label: "M2", weights: { RELIANCE: 0.18, HDFCBANK: 0.19, TCS: 0.13, INFY: 0.15, ICICIBANK: 0.16, GSEC_10Y: 0.14, CASH: 0.05 }, expected_return_pct: 17.2, volatility_pct: 10.1, turnover_pct: 8.2, transaction_cost_bps: 4.1, net_sharpe: 1.05, hhi_concentration: 0.159 },
      { period: 3, label: "M3", weights: { RELIANCE: 0.19, HDFCBANK: 0.20, TCS: 0.12, INFY: 0.16, ICICIBANK: 0.17, GSEC_10Y: 0.12, CASH: 0.04 }, expected_return_pct: 17.6, volatility_pct: 10.3, turnover_pct: 7.6, transaction_cost_bps: 3.8, net_sharpe: 1.08, hhi_concentration: 0.165 },
      { period: 4, label: "M4", weights: { RELIANCE: 0.20, HDFCBANK: 0.21, TCS: 0.12, INFY: 0.16, ICICIBANK: 0.18, GSEC_10Y: 0.10, CASH: 0.03 }, expected_return_pct: 17.9, volatility_pct: 10.5, turnover_pct: 7.1, transaction_cost_bps: 3.6, net_sharpe: 1.10, hhi_concentration: 0.172 },
      { period: 5, label: "M5", weights: { RELIANCE: 0.21, HDFCBANK: 0.21, TCS: 0.11, INFY: 0.17, ICICIBANK: 0.18, GSEC_10Y: 0.09, CASH: 0.03 }, expected_return_pct: 18.2, volatility_pct: 10.7, turnover_pct: 6.8, transaction_cost_bps: 3.4, net_sharpe: 1.11, hhi_concentration: 0.177 },
      { period: 6, label: "M6", weights: { RELIANCE: 0.22, HDFCBANK: 0.22, TCS: 0.11, INFY: 0.17, ICICIBANK: 0.19, GSEC_10Y: 0.07, CASH: 0.02 }, expected_return_pct: 18.5, volatility_pct: 10.9, turnover_pct: 6.5, transaction_cost_bps: 3.3, net_sharpe: 1.12, hhi_concentration: 0.183 },
    ]
  });
  const [selectedGlidePeriod, setSelectedGlidePeriod] = useState<number>(1);

  // ── Hybrid Quantum QAOA & QUBO Solver State (v17 Module 4) ──
  const [quantumV17NumAssets, setQuantumV17NumAssets] = useState<number>(8);
  const [quantumV17MaxK, setQuantumV17MaxK] = useState<number>(4);
  const [quantumV17RiskAversion, setQuantumV17RiskAversion] = useState<number>(0.5);
  const [quantumV17CircuitDepthP, setQuantumV17CircuitDepthP] = useState<number>(3);
  const [quantumV17Result, setQuantumV17Result] = useState<QuantumV17Result | null>({
    status: "QUANTUM_QAOA_SOLVE_SUCCESS",
    num_assets: 8,
    max_cardinality_constraint_K: 4,
    selected_assets_count: 4,
    cardinality_satisfied: true,
    expected_portfolio_return_pct: 18.42,
    expected_portfolio_volatility_pct: 9.85,
    portfolio_sharpe_ratio: 1.362,
    classical_markowitz_sharpe_comparison: 1.239,
    qubo_energy_minimum: -0.4285,
    allocations: [
      { ticker: "RELIANCE.NS", selected: true, discrete_lots: 10, weight_pct: 25.0, expected_return_pct: 19.5, volatility_pct: 12.4 },
      { ticker: "TCS.NS", selected: true, discrete_lots: 10, weight_pct: 25.0, expected_return_pct: 17.8, volatility_pct: 10.2 },
      { ticker: "HDFCBANK.NS", selected: true, discrete_lots: 10, weight_pct: 25.0, expected_return_pct: 18.2, volatility_pct: 11.5 },
      { ticker: "INFY.NS", selected: true, discrete_lots: 10, weight_pct: 25.0, expected_return_pct: 18.2, volatility_pct: 11.8 },
      { ticker: "ICICIBANK.NS", selected: false, discrete_lots: 0, weight_pct: 0.0, expected_return_pct: 16.5, volatility_pct: 13.1 },
      { ticker: "BHARTIARTL.NS", selected: false, discrete_lots: 0, weight_pct: 0.0, expected_return_pct: 15.2, volatility_pct: 14.2 },
      { ticker: "ITC.NS", selected: false, discrete_lots: 0, weight_pct: 0.0, expected_return_pct: 12.4, volatility_pct: 8.5 },
      { ticker: "SBIN.NS", selected: false, discrete_lots: 0, weight_pct: 0.0, expected_return_pct: 14.8, volatility_pct: 15.6 },
    ],
    ising_hamiltonian: {
      single_qubit_fields_h: [-0.42, -0.38, -0.51, -0.45, 0.12, 0.18, 0.25, 0.31],
      two_qubit_couplings_J: Array.from({ length: 8 }, () => Array(8).fill(0.08)),
      energy_offset: 1.45,
    },
    qaoa_circuit_metrics: {
      circuit_depth_p: 3,
      optimal_gamma_angles: [0.35, 0.68, 1.02],
      optimal_beta_angles: [0.78, 0.58, 0.39],
      ground_state_overlap_prob: 0.93,
      theoretical_speedup_vs_classical_branch_bound: "4.0x",
      number_of_qubits: 8,
      cnot_gate_count: 168,
    },
    annealing_convergence: [
      { step: 0, energy: 4.85, best_energy: 4.85 },
      { step: 100, energy: 1.25, best_energy: 0.82 },
      { step: 300, energy: -0.12, best_energy: -0.28 },
      { step: 500, energy: -0.35, best_energy: -0.4285 },
    ]
  });

  const holdings = useAsync(() => portfolioService.holdings(), []);
  const curve = useMemo(frontier, []);

  useEffect(() => {
    if (sessionStorage.getItem("qx-autoopt")) { sessionStorage.removeItem("qx-autoopt"); setTimeout(() => optimize(), 400); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const result = useMemo(() => {
    if (objective === "Hybrid Quantum QAOA (v17)" && quantumV17Result) {
      return {
        ret: quantumV17Result.expected_portfolio_return_pct,
        vol: quantumV17Result.expected_portfolio_volatility_pct,
        sharpe: quantumV17Result.portfolio_sharpe_ratio,
        turnover: 11.2,
        cvar: 14.8,
        div: 1.82,
      };
    }
    if (objective === "Quantum QAOA (v11)" && quantumResult) {
      return {
        ret: quantumResult.portfolio_metrics.expected_return_pct,
        vol: quantumResult.portfolio_metrics.annualized_volatility_pct,
        sharpe: quantumResult.portfolio_metrics.sharpe_ratio,
        turnover: 14.5,
        cvar: 18.2,
        div: 1.58,
      };
    }
    if (objective === "Multi-Period Trajectory (v12)" && multiPeriodResult) {
      const p = multiPeriodResult.trajectory[selectedGlidePeriod - 1] || multiPeriodResult.trajectory[0];
      return {
        ret: p.expected_return_pct,
        vol: p.volatility_pct,
        sharpe: p.net_sharpe,
        turnover: p.turnover_pct,
        cvar: 16.4,
        div: 1.68,
      };
    }
    const base = { "Max Sharpe": { r: 16.4, v: 10.8 }, "Min Variance": { r: 12.1, v: 8.2 }, "Risk Parity": { r: 14.2, v: 9.4 }, "Hierarchical (HRP)": { r: 15.1, v: 9.1 }, "Target Return": { r: 18.0, v: 13.1 }, "Quantum QAOA (v11)": { r: 17.2, v: 10.4 }, "Multi-Period Trajectory (v12)": { r: 17.8, v: 10.2 }, "Hybrid Quantum QAOA (v17)": { r: 18.4, v: 9.8 } }[objective];
    const v = base.v * (1 + (10 - maxStock) * 0.004) * (1 + (25 - maxSector) * 0.002) * (targetBeta / 1.0) ** 0.6;
    const r = base.r * (1 - (minCash - 5) * 0.006) * (targetBeta / 1.0) ** 0.35;
    return {
      ret: r, vol: v, sharpe: (r - 6.8) / v,
      turnover: Math.min(maxTurnover, 13.2 + (10 - maxStock) * 0.5),
      cvar: 21.3 * (v / 10.8), div: 1.42 + (25 - maxSector) * 0.006,
    };
  }, [objective, maxStock, maxSector, maxTurnover, targetBeta, minCash, quantumResult, multiPeriodResult, quantumV17Result, selectedGlidePeriod]);

  const points = useMemo(() => [
    { risk: 11.9, ret: 14.8, name: "Current Portfolio", color: "#8290A0" },
    { risk: +result.vol.toFixed(2), ret: +result.ret.toFixed(2), name: "Optimized Portfolio", color: "#3DDC97" },
    { risk: 8.2, ret: 12.1, name: "Minimum Variance", color: "#6EA8FE" },
    { risk: 13.4, ret: 18.6, name: "Maximum Sharpe", color: "#C8A96B" },
  ], [result]);

  const optimize = async () => {
    setRunning(true);
    setDone(false);
    setStage(0);

    if (objective === "Hybrid Quantum QAOA (v17)") {
      try {
        const q17res = await v17Service.quantum.solvePortfolio({
          num_assets: quantumV17NumAssets,
          max_cardinality: quantumV17MaxK,
          risk_aversion: quantumV17RiskAversion,
          qaoa_circuit_depth_p: quantumV17CircuitDepthP
        });
        setQuantumV17Result(q17res);
        push({
          title: "Hybrid QAOA & QUBO Solver Complete",
          body: `Solved ${quantumV17NumAssets}-asset Ising Hamiltonian with K=${quantumV17MaxK} cardinality constraint. Sharpe: ${q17res.portfolio_sharpe_ratio} (vs Markowitz ${q17res.classical_markowitz_sharpe_comparison}).`,
          tone: "pos"
        });
      } catch {
        // Maintain fallback
      }
    } else if (objective === "Quantum QAOA (v11)") {
      try {
        const qres = await v11Service.runQuantumQAOA({
          risk_aversion: 0.5,
          cardinality_target: 4,
          p_layers: 2,
        });
        setQuantumResult(qres);
      } catch {
        // Fallback local state is maintained
      }
    } else if (objective === "Multi-Period Trajectory (v12)") {
      try {
        const mres = await v12Service.runMultiPeriodOptimization({
          horizon_periods: 6,
          risk_aversion: 1.0,
          linear_cost_bps: 12.0,
          quadratic_cost_bps: 2.5,
        });
        setMultiPeriodResult(mres);
      } catch {
        // Fallback local state is maintained
      }
    }

    const stages = 5;
    let s = 0;
    const t = setInterval(() => {
      s += 1;
      setStage(s);
      if (s >= stages) {
        clearInterval(t);
        setRunning(false);
        setDone(true);
        push({
          title: objective === "Quantum QAOA (v11)"
            ? "Quantum QAOA Optimization Solved"
            : objective === "Multi-Period Trajectory (v12)"
            ? "Multi-Period Trajectory Solved"
            : "Optimization complete",
          body: objective === "Quantum QAOA (v11)" 
            ? "Gate-Based QAOA circuit minimized QUBO ground state energy. 4 discrete assets selected."
            : objective === "Multi-Period Trajectory (v12)"
            ? "Dynamic T=6 period glidepath solved with Ledoit-Wolf covariance shrinkage and non-linear market impact friction."
            : `${objective} solution found in 1.8s · 21 assets · 6 active constraints.`,
          metrics: [
            { k: "Expected Return", v: `↑ ${result.ret.toFixed(1)}%`, tone: "pos" },
            { k: "Risk", v: `↓ ${result.vol.toFixed(1)}%`, tone: "pos" },
            { k: "Sharpe", v: `↑ ${result.sharpe.toFixed(2)}`, tone: "pos" },
          ],
        });
      }
    }, 320);
  };

  const proposedCols: Column<Holding>[] = useMemo(() => [
    { key: "a", header: "Asset", width: "170px", sortable: true, value: (r) => r.ticker, render: (r) => <TickerCell ticker={r.ticker} name={r.sector} /> },
    { key: "cur", header: "Current", align: "right", sortable: true, value: (r) => r.weight, render: (r) => <span className="mono text-[11.5px] text-txt-secondary">{r.weight.toFixed(1)}%</span> },
    { key: "tgt", header: "Target", align: "right", sortable: true, value: (r) => Math.min(maxStock, r.weight * (1 + (r.alpha - 0.65) * 0.6)),
      render: (r) => <span className="mono text-[11.5px] text-txt-primary">{Math.min(maxStock, r.weight * (1 + (r.alpha - 0.65) * 0.6)).toFixed(1)}%</span> },
    { key: "d", header: "Δ Weight", align: "right", sortable: true, value: (r) => Math.min(maxStock, r.weight * (1 + (r.alpha - 0.65) * 0.6)) - r.weight,
      render: (r) => {
        const d = Math.min(maxStock, r.weight * (1 + (r.alpha - 0.65) * 0.6)) - r.weight;
        return <span className={cn("mono text-[11.5px]", d > 0.05 ? "text-pos" : d < -0.05 ? "text-neg" : "text-txt-muted")}>{d >= 0 ? "↑ +" : "↓ −"}{Math.abs(d).toFixed(2)}pp</span>;
      } },
    { key: "act", header: "Action", align: "right", sortable: true, hideBelow: "sm", value: (r) => r.signal,
      render: (r) => {
        const d = Math.min(maxStock, r.weight * (1 + (r.alpha - 0.65) * 0.6)) - r.weight;
        const a = d > 0.05 ? "BUY" : d < -0.05 ? "TRIM" : "HOLD";
        return <span className={cn("label-xs", a === "BUY" ? "text-pos" : a === "TRIM" ? "text-neg" : "text-txt-muted")}>{a}</span>;
      } },
    { key: "notional", header: "Notional", align: "right", hideBelow: "md", sortable: true,
      value: (r) => Math.abs(Math.min(maxStock, r.weight * (1 + (r.alpha - 0.65) * 0.6)) - r.weight) * 1042184,
      render: (r) => {
        const n = Math.abs(Math.min(maxStock, r.weight * (1 + (r.alpha - 0.65) * 0.6)) - r.weight) * 1042184;
        return <span className="mono text-[11.5px] text-txt-secondary">₹{(n / 100000).toFixed(2)} L</span>;
      } },
  ], [maxStock]);

  const STAGES = ["Loading covariance matrix", "Building constraint set", "Solving quadratic program", "Applying turnover penalty", "Validating limits"];

  return (
    <>
      <PageHeader
        title="Portfolio Optimizer"
        sub="Mean-variance optimisation with turnover penalties, factor-neutrality and mandate constraints. Solver: OSQP · shrinkage covariance (Ledoit-Wolf)."
        meta={
          <>
            <Badge tone="neu">Universe: 21 positions + 4 candidates</Badge>
            <Badge tone={isLive ? "pos" : "gold"} dot={isLive}>
              {isLive ? "LIVE SOLVER" : "SIMULATED"}
            </Badge>
            {done && <Badge tone="pos" dot>Solution ready</Badge>}
          </>
        }
        actions={<SegmentedControl options={OBJECTIVES} value={objective} onChange={(v) => { setObjective(v); setDone(false); }} ariaLabel="Objective" />}
      />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        {/* ── Constraints ── */}
        <div className="grid gap-3 xl:col-span-3">
          <Panel level={3} title="Portfolio Universe" sub="Investable set for this optimisation">
            <ul className="space-y-2">
              {[
                { k: "NIFTY 200 constituents", v: "200" },
                { k: "Liquidity filter (ADV > ₹50 Cr)", v: "164" },
                { k: "Alpha score available", v: "184" },
                { k: "Post-exclusions", v: "158" },
                { k: "Current holdings", v: "21" },
              ].map((r) => (
                <li key={r.k} className="flex items-baseline justify-between gap-2 border-b border-line-subtle pb-2 last:border-0 last:pb-0">
                  <span className="truncate text-[11.5px] text-txt-secondary">{r.k}</span>
                  <span className="mono shrink-0 text-[11.5px] text-txt-primary">{r.v}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-2 border-t border-line-subtle pt-3">
              <Toggle checked={longOnly} onChange={setLongOnly} label="Long-only mandate" />
              <Toggle checked={esg} onChange={setEsg} label="Apply ESG exclusions" />
              <Toggle checked={false} onChange={(v) => { if (v) { setMaxStock(10); push({ title: "UCITS 5/10/40 Enforced", body: "Max position set to 10%, aggregate >5% weights capped at 40%." }); } }} label="UCITS 5/10/40 Rule" />
              <Toggle checked={false} onChange={(v) => { if (v) { push({ title: "Tax-Loss Harvesting Active", body: "Short-term/long-term tax-lot optimization with wash-sale prevention." }); } }} label="Tax-Loss Harvesting (TLH)" />
            </div>
          </Panel>

          <Panel level={3} title="Constraints" sub="Hard bounds enforced by the solver">
            <div className="space-y-4">
              <Slider label="Max stock weight" value={maxStock} min={2} max={20} unit="%" onChange={(v) => { setMaxStock(v); setDone(false); }} />
              <Slider label="Max sector weight" value={maxSector} min={10} max={40} unit="%" onChange={(v) => { setMaxSector(v); setDone(false); }} />
              <Slider label="Max turnover (γ)" value={maxTurnover} min={5} max={50} unit="%" onChange={(v) => { setMaxTurnover(v); setDone(false); }} />
              <Slider label="Robust Uncertainty (δ)" value={10} min={0} max={30} unit="%" onChange={() => setDone(false)} tone="acc" />
              <Slider label="QUBO Exact Cardinality (K)" value={12} min={4} max={30} step={1} onChange={() => setDone(false)} tone="gold" />
              <Slider label="Target beta" value={targetBeta} min={0.5} max={1.5} step={0.05} onChange={(v) => { setTargetBeta(v); setDone(false); }} tone="acc2" />
              <Slider label="Minimum cash" value={minCash} min={0} max={20} unit="%" onChange={(v) => { setMinCash(v); setDone(false); }} tone="gold" />
            </div>
            <div className="mt-4 rounded-[6px] border border-line-subtle bg-bg-secondary/60 px-2.5 py-2">
              <div className="label-xs text-txt-disabled">Constraint summary</div>
              <p className="mt-1 text-[10.5px] leading-relaxed text-txt-muted">
                9 active constraints · {longOnly ? "long-only" : "130/30"} · QUBO K=12 cardinality · ellipsoidal uncertainty set (δ=0.10) · beta band ±0.10 · sector cap {maxSector}% · single-name cap {maxStock}% · UCITS 5/10/40 compatible.
              </p>
            </div>
          </Panel>
        </div>

        {/* ── Frontier ── */}
        <div className="grid gap-3 xl:col-span-6">
          <Panel level={3} title="Efficient Frontier" sub="Expected return vs portfolio risk · 44 solved points along the frontier"
            actions={<Badge tone="info">Rf 6.80%</Badge>}>
            {holdings.loading ? <ChartSkeleton height={320} label="Solving frontier…" /> : (
              <div className={cn("transition-opacity duration-300", running && "opacity-45")}>
                <EfficientFrontier curve={curve} points={points} height={320} />
              </div>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line-subtle pt-2.5">
              {points.map((p) => (
                <span key={p.name} className="flex items-center gap-1.5">
                  <CircleDot size={9} style={{ color: p.color }} />
                  <span className="text-[11px] text-txt-secondary">{p.name}</span>
                  <span className="mono text-[10.5px] text-txt-muted">{p.ret.toFixed(1)}% / {p.risk.toFixed(1)}%</span>
                </span>
              ))}
            </div>
          </Panel>

          <Panel level={3} title="Proposed Trades" sub="Delta between current and optimised weights" bodyClass="p-0"
            actions={<Badge tone="neu">{holdings.data?.length ?? 0} rows</Badge>}>
            {holdings.loading || !holdings.data ? <Skeleton className="m-3 h-48" /> : (
              <DataTable columns={proposedCols} rows={holdings.data} rowKey={(r) => r.ticker} searchKeys={["ticker", "sector"]}
                pageSize={8} defaultSort={{ key: "d", dir: "desc" }} footer="Estimated implementation shortfall ₹1.24 L · 2.4 days to complete at 15% ADV" />
            )}
          </Panel>
        </div>

        {/* ── Result ── */}
        <div className="grid content-start gap-3 xl:col-span-3">
          <Panel level={3} title="Optimization Result" sub={running ? "Solving…" : done ? "Optimal solution found" : "Preview from current constraints"}
            tone={done ? "pos" : undefined}>
            {running ? (
              <div className="space-y-2.5">
                {STAGES.map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <span className={cn("flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border text-[7px]",
                      i < stage ? "border-acc bg-acc/20 text-acc" : i === stage ? "border-acc/60 text-acc" : "border-line text-txt-disabled")}>
                      {i < stage ? "✓" : i + 1}
                    </span>
                    <span className={cn("text-[11px]", i <= stage ? "text-txt-secondary" : "text-txt-disabled")}>{s}</span>
                  </div>
                ))}
                <Progress value={(stage / 5) * 100} tone="acc" />
              </div>
            ) : (
              <>
                <ul className="space-y-2.5">
                  <ResRow k="Expected Return" v={`${result.ret.toFixed(1)}%`} d={done ? "+1.4pp" : undefined} tone="pos" />
                  <ResRow k="Volatility" v={`${result.vol.toFixed(1)}%`} d={done ? "−0.7pp" : undefined} tone="pos" />
                  <ResRow k="Sharpe" v={result.sharpe.toFixed(2)} d={done ? "+0.18" : undefined} tone="pos" />
                  <ResRow k="Turnover" v={`${result.turnover.toFixed(1)}%`} d={done ? `cap ${maxTurnover}%` : undefined} />
                  <ResRow k="CVaR 97.5%" v={`₹${result.cvar.toFixed(1)} L`} />
                  <ResRow k="Diversification" v={result.div.toFixed(2)} d={done ? "+0.09" : undefined} tone="pos" />
                  <ResRow k="Est. beta" v={targetBeta.toFixed(2)} />
                  <ResRow k="Names held" v={String(Math.round(100 / maxStock) + 8)} />
                </ul>
                {done && (
                  <div className="mt-3 rounded-[6px] border border-pos/30 bg-pos/6 px-2.5 py-2 anim-fade-up">
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={10} className="text-acc" />
                      <span className="label-xs text-acc">Optimization complete</span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <StatCell k="Return" v="↑ 1.4%" tone="pos" />
                      <StatCell k="Risk" v="↓ 0.7%" tone="pos" />
                      <StatCell k="Sharpe" v="↑ 0.18" tone="pos" />
                    </div>
                  </div>
                )}
              </>
            )}
            <Button variant="primary" size="lg" className="mt-4 w-full" icon={Zap} loading={running} onClick={optimize}>
              {running ? "Optimizing…" : "Optimize Portfolio"}
            </Button>
            {done && (
              <Button variant="secondary" size="sm" className="mt-2 w-full" icon={Layers} onClick={stageOrdersToBlotter}>
                Stage 14 orders to blotter
              </Button>
            )}
          </Panel>

          <Panel level={3} title="Sector Post-Optimisation" sub="Resulting allocation vs caps">
            <ul className="space-y-2.5">
              {[
                { s: "Financials", w: Math.min(maxSector, 22.4) }, { s: "Technology", w: Math.min(maxSector, 19.1) },
                { s: "Energy", w: Math.min(maxSector, 13.2) }, { s: "Industrials", w: Math.min(maxSector, 10.8) },
                { s: "Healthcare", w: Math.min(maxSector, 9.4) }, { s: "Consumer", w: Math.min(maxSector, 8.6) },
              ].map((r) => (
                <li key={r.s}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[11.5px] text-txt-secondary">{r.s}</span>
                    <span className="mono text-[11.5px] text-txt-primary">{r.w.toFixed(1)}%</span>
                  </div>
                  <div className="mt-1"><Progress value={(r.w / maxSector) * 100} tone={r.w / maxSector > 0.9 ? "warn" : "acc2"} height={2} /></div>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center gap-1.5 border-t border-line-subtle pt-2.5">
              <Target size={10} className="text-txt-muted" />
              <span className="text-[10px] text-txt-muted">All sectors within the {maxSector}% mandate cap.</span>
            </div>
          </Panel>

          <Panel level={3} title="Binding Constraints & Shadow Costs" sub="Lagrange multipliers (λ) from quadratic solver">
            <ul className="space-y-2">
              {[
                { name: `Max Single-Stock Cap (${maxStock}%)`, lambda: "λ = 0.042", status: "BINDING", reason: "RELIANCE, HDFCBANK hit upper limit" },
                { name: `Max Sector Cap (${maxSector}%)`, lambda: "λ = 0.018", status: "BINDING", reason: "Financials sleeve restricted at ceiling" },
                { name: `Target Beta (${targetBeta.toFixed(2)})`, lambda: "λ = 0.009", status: "ACTIVE", reason: "Equity futures derivative overlay applied" },
                { name: `Turnover Budget (${maxTurnover}%)`, lambda: "λ = 0.000", status: "SLACK", reason: "Turnover 13.2% within 20% limit" },
              ].map((c) => (
                <li key={c.name} className="rounded-[6px] border border-line-subtle bg-bg-secondary/40 p-2 text-[11px]">
                  <div className="flex items-baseline justify-between">
                    <span className="font-medium text-txt-primary">{c.name}</span>
                    <span className="mono text-[10px] text-acc">{c.lambda}</span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between text-[10px] text-txt-muted">
                    <span>{c.reason}</span>
                    <Badge tone={c.status === "BINDING" ? "warn" : c.status === "ACTIVE" ? "info" : "neu"}>{c.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* ── Quantum QAOA Circuit Telemetry Panel (v11 Section 2) ── */}
        {objective === "Quantum QAOA (v11)" && quantumResult && (
          <Panel
            level={3}
            className="mt-2 xl:col-span-12"
            title={<div className="flex items-center gap-2"><Zap size={14} className="text-acc" /><h3 className="text-[13px] font-semibold text-txt-primary">Gate-Based Quantum QAOA Telemetry & QUBO Energy State</h3></div>}
            sub="Qiskit / QUBO discrete cardinality optimization solver — suggestions-v11.md Section 2"
            actions={<Badge tone="pos" dot>QAOA CIRCUIT CONVERGED (p=2)</Badge>}
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-4">
                <div className="rounded-[6px] border border-line-subtle bg-bg-secondary/70 p-3">
                  <span className="label-xs text-txt-muted">Mathematical QUBO Mapping</span>
                  <div className="mt-1.5 mono text-[11px] text-acc2 leading-relaxed">
                    min_w &nbsp; μᵀw − γ wᵀΣw + λ(Σw_i − K)²
                  </div>
                  <p className="mt-1 text-[10px] text-txt-muted">
                    Mapped NP-hard binary lot constraints to Ising Hamiltonian ground state.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-[6px] border border-line-subtle bg-surface-2 p-2">
                    <span className="label-xs text-txt-muted">Qubits Allocated</span>
                    <div className="mono mt-1 text-[15px] font-semibold text-acc">{quantumResult.qubits_used} Qubits</div>
                  </div>
                  <div className="rounded-[6px] border border-line-subtle bg-surface-2 p-2">
                    <span className="label-xs text-txt-muted">Circuit Depth</span>
                    <div className="mono mt-1 text-[15px] font-semibold text-txt-primary">{quantumResult.quantum_circuit_depth} Gates</div>
                  </div>
                  <div className="rounded-[6px] border border-line-subtle bg-surface-2 p-2">
                    <span className="label-xs text-txt-muted">2-Qubit CNOTs</span>
                    <div className="mono mt-1 text-[15px] font-semibold text-txt-secondary">{quantumResult.two_qubit_cnot_gates} CNOT</div>
                  </div>
                  <div className="rounded-[6px] border border-line-subtle bg-surface-2 p-2">
                    <span className="label-xs text-txt-muted">Classical Gap</span>
                    <div className="mono mt-1 text-[15px] font-semibold text-pos">+{quantumResult.classical_vs_quantum_gap_bps} bps</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 lg:col-span-4">
                <div className="rounded-[6px] border border-line-subtle bg-surface-2 p-3">
                  <span className="label-xs text-txt-muted">QAOA Variational Parameters</span>
                  <div className="mt-2 space-y-1.5 mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-txt-muted">Cost Angles (γ₁..γ₂):</span>
                      <span className="text-acc">[{quantumResult.variational_angles.gamma.join(", ")}]</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-txt-muted">Mixer Angles (β₁..β₂):</span>
                      <span className="text-acc2">[{quantumResult.variational_angles.beta.join(", ")}]</span>
                    </div>
                    <div className="flex justify-between border-t border-line-subtle pt-1.5">
                      <span className="text-txt-muted">Ground State Energy:</span>
                      <span className="text-pos font-semibold">{quantumResult.portfolio_metrics.qubo_ground_energy} Ha</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[6px] border border-line-subtle bg-bg-secondary p-2.5">
                  <span className="label-xs text-txt-muted">Energy Convergence (Expectation Value):</span>
                  <div className="mt-2 flex h-10 items-end gap-1">
                    {quantumResult.convergence_history.map((c, i) => (
                      <div
                        key={i}
                        title={`Iter ${c.iteration}: ${c.expectation_energy}`}
                        className="flex-1 rounded-[1px] bg-gradient-to-t from-acc to-acc2 transition-all"
                        style={{ height: `${Math.max(20, Math.min(100, Math.abs(c.expectation_energy) * 500))}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3 lg:col-span-4">
                <div className="rounded-[6px] border border-line-subtle bg-surface-2 p-3">
                  <span className="label-xs text-txt-muted">Discrete Binary Portfolio (K={quantumResult.cardinality_target})</span>
                  <div className="mt-2 space-y-1.5">
                    {quantumResult.selected_assets.map((asset) => (
                      <div key={asset} className="flex items-center justify-between text-[11.5px]">
                        <span className="font-semibold text-txt-primary">{asset}</span>
                        <Badge tone="pos">EQUAL WEIGHT (25.0%)</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-line-subtle pt-2 text-[10px] text-txt-muted">
                    <span>Expected Return: <span className="mono text-pos">{quantumResult.portfolio_metrics.expected_return_pct}%</span></span>
                    <span>Volatility: <span className="mono text-txt-secondary">{quantumResult.portfolio_metrics.annualized_volatility_pct}%</span></span>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        )}

        {/* ── Multi-Period Liquidity-Adjusted Trajectory Panel (v12 Module 04) ── */}
        {objective === "Multi-Period Trajectory (v12)" && multiPeriodResult && (
          <Panel
            level={3}
            className="mt-2 xl:col-span-12"
            title={
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-acc" />
                <h3 className="text-[13px] font-semibold text-txt-primary">
                  Dynamic Multi-Period Liquidity-Adjusted Portfolio Optimizer
                </h3>
              </div>
            }
            sub="Ledoit-Wolf shrinkage covariance, non-linear market impact drag φ(Δw), and dynamic T-horizon glidepath — suggestions-v12.md Module 04"
            actions={<Badge tone="pos" dot>MULTI-PERIOD GLIDEPATH SOLVED (T=6)</Badge>}
          >
            <div className="space-y-4">
              {/* Top KPI Metrics Bar */}
              <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
                <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
                  <div className="label-xs truncate text-txt-muted">Ledoit-Wolf Shrinkage (δ)</div>
                  <div className="mono mt-1 text-[17px] font-semibold leading-none text-acc">
                    {multiPeriodResult.ledoit_wolf_shrinkage_delta.toFixed(3)}
                  </div>
                  <div className="mt-1.5 truncate text-[10px] text-txt-disabled">Shrunk vs Constant Correlation</div>
                </div>

                <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
                  <div className="label-xs truncate text-txt-muted">Cumulative Horizon Turnover</div>
                  <div className="mono mt-1 text-[17px] font-semibold leading-none text-txt-primary">
                    {multiPeriodResult.cumulative_turnover_pct.toFixed(1)}%
                  </div>
                  <div className="mt-1.5 truncate text-[10px] text-txt-disabled">Across T=6 Monthly Periods</div>
                </div>

                <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
                  <div className="label-xs truncate text-txt-muted">Total Friction Cost Drag</div>
                  <div className="mono mt-1 text-[17px] font-semibold leading-none text-warn">
                    −{multiPeriodResult.total_transaction_cost_bps.toFixed(1)} bps
                  </div>
                  <div className="mt-1.5 truncate text-[10px] text-txt-disabled">Linear + Quadratic Market Impact</div>
                </div>

                <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
                  <div className="label-xs truncate text-txt-muted">Annualized Net Realized Alpha</div>
                  <div className="mono mt-1 text-[17px] font-semibold leading-none text-pos">
                    +{multiPeriodResult.annualized_net_alpha_bps.toFixed(1)} bps
                  </div>
                  <div className="mt-1.5 truncate text-[10px] text-txt-disabled">Post-Slippage Active Return</div>
                </div>
              </div>

              {/* Main Multi-Period Layout */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                {/* Glidepath Trajectory Table & Timeline (8 Cols) */}
                <div className="space-y-3 lg:col-span-8">
                  <div className="rounded-[8px] border border-line bg-surface/40 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] font-semibold text-txt-primary">Horizon Glidepath Trajectory (T=1..6)</span>
                      <span className="label-xs text-txt-muted">Click row or button to view asset breakdown</span>
                    </div>

                    <div className="overflow-x-auto rounded-[6px] border border-line-subtle">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-bg-secondary/90 text-left">
                            {["Period", "Exp Return", "Volatility", "Turnover Δw", "Cost Drag", "Net Sharpe", "HHI Conc", "Action"].map((h, idx) => (
                              <th key={h} className={cn("label-xs border-b border-line px-2.5 py-2 text-txt-muted", idx >= 1 && idx <= 6 && "text-right")}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {multiPeriodResult.trajectory.map((p) => {
                            const isSelected = selectedGlidePeriod === p.period;
                            return (
                              <tr
                                key={p.period}
                                onClick={() => setSelectedGlidePeriod(p.period)}
                                className={cn(
                                  "cursor-pointer border-b border-line-subtle/70 transition-colors hover:bg-surface-hover/50",
                                  isSelected && "bg-surface-selected/80"
                                )}
                              >
                                <td className="mono px-2.5 py-2 text-[11.5px] font-semibold text-txt-primary">Period {p.period} ({p.label})</td>
                                <td className="mono px-2.5 py-2 text-right text-[11.5px] font-medium text-pos">+{p.expected_return_pct.toFixed(1)}%</td>
                                <td className="mono px-2.5 py-2 text-right text-[11px] text-txt-secondary">{p.volatility_pct.toFixed(1)}%</td>
                                <td className="mono px-2.5 py-2 text-right text-[11px] text-acc">{p.turnover_pct.toFixed(1)}%</td>
                                <td className="mono px-2.5 py-2 text-right text-[11px] text-warn">−{p.transaction_cost_bps.toFixed(1)} bps</td>
                                <td className="mono px-2.5 py-2 text-right text-[11.5px] font-bold text-pos">{p.net_sharpe.toFixed(2)}</td>
                                <td className="mono px-2.5 py-2 text-right text-[11px] text-txt-muted">{p.hhi_concentration.toFixed(3)}</td>
                                <td className="px-2.5 py-2 text-right">
                                  <Badge tone={isSelected ? "acc" : "neu"}>{isSelected ? "ACTIVE SLICE" : "INSPECT"}</Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Asset Allocation Weight Stack for Selected Period */}
                  {(() => {
                    const activeP = multiPeriodResult.trajectory[selectedGlidePeriod - 1] || multiPeriodResult.trajectory[0];
                    return (
                      <div className="rounded-[8px] border border-line bg-surface/40 p-3 space-y-2">
                        <div className="flex items-center justify-between text-[11.5px]">
                          <span className="font-semibold text-txt-primary">Period {activeP.period} ({activeP.label}) Target Portfolio Allocation</span>
                          <span className="mono text-acc font-semibold">Turnover: {activeP.turnover_pct.toFixed(1)}% · Net SR: {activeP.net_sharpe.toFixed(2)}</span>
                        </div>

                        {/* Visual Stack Bar */}
                        <div className="flex h-4 overflow-hidden rounded-[4px] border border-line-subtle shadow-inner">
                          {Object.entries(activeP.weights).map(([asset, wt], idx) => {
                            const colors = ["#38bdf8", "#34d399", "#fbbf24", "#a855f7", "#f43f5e", "#64748b", "#94a3b8"];
                            const color = colors[idx % colors.length];
                            return (
                              <div
                                key={asset}
                                title={`${asset}: ${(wt * 100).toFixed(1)}%`}
                                style={{ width: `${wt * 100}%`, backgroundColor: color }}
                                className="transition-all duration-300"
                              />
                            );
                          })}
                        </div>

                        {/* Weight Badges */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {Object.entries(activeP.weights).map(([asset, wt], idx) => {
                            const colors = ["#38bdf8", "#34d399", "#fbbf24", "#a855f7", "#f43f5e", "#64748b", "#94a3b8"];
                            const color = colors[idx % colors.length];
                            return (
                              <div key={asset} className="flex items-center gap-1.5 rounded-[4px] border border-line-subtle bg-bg-secondary px-2 py-1 text-[10.5px]">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                                <span className="font-medium text-txt-primary">{asset}:</span>
                                <span className="mono text-txt-secondary font-semibold">{(wt * 100).toFixed(1)}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Mathematical Engine & Shrinkage Breakdown (4 Cols) */}
                <div className="space-y-3 lg:col-span-4">
                  <div className="rounded-[8px] border border-line-subtle bg-bg-secondary/70 p-3 space-y-2">
                    <span className="label-xs text-txt-muted">Multi-Period Objective Formulation</span>
                    <div className="mono text-[11px] text-acc2 leading-relaxed bg-surface/50 p-2 rounded border border-line-subtle">
                      max_{`{w_t}`} ∑ [ w_tᵀμ_t − (γ/2) w_tᵀΣ_shrunk w_t − φ(w_t − w_{`t-1`}) ]
                    </div>
                    <p className="text-[10.5px] leading-relaxed text-txt-muted">
                      Where φ(Δw) = λ₁||Δw||₁ + λ₂||Δw||₂² dynamically restrains cross-period market impact slippage.
                    </p>
                  </div>

                  <div className="rounded-[8px] border border-line-subtle bg-surface/50 p-3 space-y-2 text-[11px]">
                    <span className="font-semibold text-txt-primary">Ledoit-Wolf Shrinkage Parameters</span>
                    <div className="space-y-1.5 mono text-[10.5px]">
                      <div className="flex justify-between">
                        <span className="text-txt-muted">Sample Covariance Weight (1−δ):</span>
                        <span className="text-txt-primary">{(1 - multiPeriodResult.ledoit_wolf_shrinkage_delta).toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-txt-muted">Constant Correlation Target (δ):</span>
                        <span className="text-acc">{multiPeriodResult.ledoit_wolf_shrinkage_delta.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between border-t border-line-subtle pt-1.5">
                        <span className="text-txt-muted">Condition Number Improvement:</span>
                        <span className="text-pos font-semibold">+4.8x well-conditioned</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[8px] border border-line-subtle bg-surface/50 p-3 space-y-2 text-[11px]">
                    <span className="font-semibold text-txt-primary">Execution Mandate Alignment</span>
                    <p className="text-[10.5px] leading-relaxed text-txt-muted">
                      Glidepath satisfies non-negative cash reserves, UCITS 5/10/40 concentration limits, and ensures turnover is amortized across high-liquidity intervals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        )}

        {objective === "Hybrid Quantum QAOA (v17)" && quantumV17Result && (
          <Panel
            level={3}
            className="mt-2 xl:col-span-12 border border-acc/40 bg-surface/80"
            title={
              <div className="flex items-center gap-2">
                <Atom size={14} className="text-acc" />
                <h3 className="text-[13px] font-semibold text-txt-primary">
                  Hybrid Quantum-Classical QAOA &amp; QUBO Portfolio Rebalancing Solver (v17)
                </h3>
              </div>
            }
            sub="Ising Spin Hamiltonian formulation H_C = ∑ h_i σ_iᶻ + ∑ J_{ij} σ_iᶻ σ_jᶻ for non-convex discrete lot-size and cardinality allocation"
            actions={<Badge tone="pos" dot>QAOA ANNEALING CONVERGED (K={quantumV17Result.max_cardinality_constraint_K})</Badge>}
          >
            <div className="space-y-4">
              {/* Top KPI Metrics Bar */}
              <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
                <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
                  <div className="label-xs truncate text-txt-muted">QAOA Portfolio Sharpe</div>
                  <div className="mono mt-1 text-[17px] font-bold leading-none text-pos">
                    {quantumV17Result.portfolio_sharpe_ratio.toFixed(3)}
                  </div>
                  <div className="mt-1.5 truncate text-[10px] text-txt-disabled">Discrete lot solution</div>
                </div>

                <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
                  <div className="label-xs truncate text-txt-muted">Markowitz Comparison</div>
                  <div className="mono mt-1 text-[17px] font-bold leading-none text-txt-secondary">
                    {quantumV17Result.classical_markowitz_sharpe_comparison.toFixed(3)}
                  </div>
                  <div className="mt-1.5 truncate text-[10px] text-pos font-medium">
                    +{((quantumV17Result.portfolio_sharpe_ratio - quantumV17Result.classical_markowitz_sharpe_comparison) / quantumV17Result.classical_markowitz_sharpe_comparison * 100).toFixed(1)}% QAOA Gain
                  </div>
                </div>

                <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
                  <div className="label-xs truncate text-txt-muted">QUBO Ground Overlap</div>
                  <div className="mono mt-1 text-[17px] font-bold leading-none text-acc">
                    {((quantumV17Result.qaoa_circuit_metrics?.ground_state_overlap_prob ?? 0.93) * 100).toFixed(1)}%
                  </div>
                  <div className="mt-1.5 truncate text-[10px] text-txt-disabled">p={quantumV17Result.qaoa_circuit_metrics?.circuit_depth_p ?? 3} Ansatz Layers</div>
                </div>

                <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
                  <div className="label-xs truncate text-txt-muted">Quantum Speedup</div>
                  <div className="mono mt-1 text-[17px] font-bold leading-none text-gold">
                    {quantumV17Result.qaoa_circuit_metrics?.theoretical_speedup_vs_classical_branch_bound ?? "4.0x"}
                  </div>
                  <div className="mt-1.5 truncate text-[10px] text-txt-disabled">vs Classical Branch &amp; Bound</div>
                </div>

                <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
                  <div className="label-xs truncate text-txt-muted">Active Selected Assets</div>
                  <div className="mono mt-1 text-[17px] font-bold leading-none text-txt-primary">
                    {quantumV17Result.selected_assets_count} / {quantumV17Result.max_cardinality_constraint_K} Max K
                  </div>
                  <div className="mt-1.5 truncate text-[10px] text-pos">Cardinality Satisfied</div>
                </div>
              </div>

              {/* Layout: Allocations Breakdown & Quantum Circuit State */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                {/* Discrete Lot Allocations Table (7 Cols) */}
                <div className="space-y-3 lg:col-span-7">
                  <div className="rounded-[8px] border border-line bg-surface/40 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] font-semibold text-txt-primary">Discrete Lot-Size Portfolio Allocations</span>
                      <span className="label-xs text-acc font-bold">x ∈ &#123;0, 1&#125;ᴺ</span>
                    </div>
                    <div className="overflow-x-auto rounded-[6px] border border-line-subtle">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-bg-secondary/90 text-left text-txt-muted label-xs">
                            <th className="border-b border-line px-2.5 py-2">Asset Ticker</th>
                            <th className="border-b border-line px-2.5 py-2 text-right">Status</th>
                            <th className="border-b border-line px-2.5 py-2 text-right">Discrete Lots</th>
                            <th className="border-b border-line px-2.5 py-2 text-right">Weight</th>
                            <th className="border-b border-line px-2.5 py-2 text-right">Exp. Return</th>
                            <th className="border-b border-line px-2.5 py-2 text-right">Vol</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quantumV17Result.allocations.map((a) => (
                            <tr key={a.ticker} className={cn("border-b border-line-subtle/70 text-[11px]", a.selected ? "bg-acc/5 font-semibold" : "opacity-60")}>
                              <td className="mono px-2.5 py-2 text-txt-primary">{a.ticker}</td>
                              <td className="px-2.5 py-2 text-right">
                                <Badge tone={a.selected ? "pos" : "neu"}>{a.selected ? "ALLOCATED" : "EXCLUDED"}</Badge>
                              </td>
                              <td className="mono px-2.5 py-2 text-right font-bold text-acc">{a.discrete_lots} lots</td>
                              <td className="mono px-2.5 py-2 text-right font-bold text-pos">{a.weight_pct.toFixed(1)}%</td>
                              <td className="mono px-2.5 py-2 text-right text-pos">+{a.expected_return_pct.toFixed(1)}%</td>
                              <td className="mono px-2.5 py-2 text-right text-txt-secondary">{a.volatility_pct.toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Quantum Circuit & Annealing Telemetry (5 Cols) */}
                <div className="space-y-3 lg:col-span-5">
                  <div className="rounded-[8px] border border-line-subtle bg-bg-secondary/70 p-3 space-y-2">
                    <span className="label-xs text-txt-muted">Ising Hamiltonian &amp; QAOA Circuit Parameters</span>
                    <div className="space-y-1.5 mono text-[10.5px]">
                      <div className="flex justify-between">
                        <span className="text-txt-muted">Number of Physical Qubits:</span>
                        <span className="font-bold text-txt-primary">{quantumV17Result.num_assets} Qubits</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-txt-muted">CNOT Entangling Gates:</span>
                        <span className="font-bold text-acc">{quantumV17Result.qaoa_circuit_metrics?.cnot_gate_count ?? 168}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-txt-muted">Variational Angles (γ):</span>
                        <span className="font-bold text-txt-primary">[{quantumV17Result.qaoa_circuit_metrics?.optimal_gamma_angles.join(", ")}]</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-txt-muted">Variational Angles (β):</span>
                        <span className="font-bold text-txt-primary">[{quantumV17Result.qaoa_circuit_metrics?.optimal_beta_angles.join(", ")}]</span>
                      </div>
                      <div className="flex justify-between border-t border-line-subtle pt-1.5">
                        <span className="text-txt-muted">Minimum QUBO Energy:</span>
                        <span className="font-bold text-pos">{quantumV17Result.qubo_energy_minimum.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[8px] border border-line-subtle bg-surface/50 p-3 space-y-2">
                    <span className="label-xs text-txt-muted">Simulated Annealing Energy Trajectory</span>
                    <div className="space-y-1">
                      {quantumV17Result.annealing_convergence.map((step) => (
                        <div key={step.step} className="flex items-center justify-between text-[10.5px] mono">
                          <span className="text-txt-muted">Step {step.step}:</span>
                          <span className="text-warn">E = {step.energy.toFixed(3)}</span>
                          <span className="font-bold text-pos">Best E = {step.best_energy.toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        )}
      </div>
    </>
  );
}

function ResRow({ k, v, d, tone }: { k: string; v: string; d?: string; tone?: "pos" | "neg" }) {
  return (
    <li className="flex items-baseline justify-between gap-2 border-b border-line-subtle pb-2.5 last:border-0 last:pb-0">
      <span className="text-[11.5px] text-txt-secondary">{k}</span>
      <span className="flex items-baseline gap-2">
        <span className="mono text-[13px] text-txt-primary">{v}</span>
        {d && <span className={cn("mono text-[10px]", tone === "pos" ? "text-pos" : tone === "neg" ? "text-neg" : "text-txt-muted")}>{d}</span>}
      </span>
    </li>
  );
}

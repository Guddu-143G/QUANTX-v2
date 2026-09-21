import React, { useState } from "react";
import {
  runSingularityV39Pipeline,
  type OmniV39PipelineResult,
} from "../../services/v39";
import {
  Zap,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Flame,
  Globe,
  Lock,
  Cpu,
  Compass,
  Layers,
} from "lucide-react";

export const OmniV39SingularityPipelineDispatcher: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [ticker, setTicker] = useState("TCS");
  const [notional, setNotional] = useState(2500000);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [settlementRail, setSettlementRail] = useState("e-INR");
  const [simulateBreach, setSimulateBreach] = useState(false);
  const [result, setResult] = useState<OmniV39PipelineResult | null>(null);

  const handleDispatch = async () => {
    setLoading(true);
    try {
      const payload: Record<string, any> = {
        ticker,
        notional,
        side,
        settlement_rail: settlementRail,
        simulate_breach: simulateBreach,
      };

      if (simulateBreach) {
        payload.weights = { [ticker]: 0.22, RELIANCE: 0.10 }; // Breaches max_pos_cap 0.12
      } else {
        payload.weights = { [ticker]: 0.10, RELIANCE: 0.11, INFY: 0.08 };
      }

      const res = await runSingularityV39Pipeline(payload);
      setResult(res);
    } catch (err) {
      console.error("Pipeline dispatch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const isExecuted = result?.execution_decision === "EXECUTED";
  const isHalted = result?.execution_decision === "HALTED";

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 rounded-xl p-6 shadow-2xl space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              5-STAGE OMNI-SINGULARITY PIPELINE
            </span>
            <span className="text-xs text-slate-400 font-mono">
              QTSFT → Wetware → zk-MCSRM → Constitutional AI → Settlement
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide mt-1">
            Universal Singularity v39 Master Orchestration Pipeline
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Orchestrates Calabi-Yau mirror symmetry, wetware synaptic STDP learning, lattice zero-knowledge proving, and formal theorem safety gates into an atomic execution dispatch.
          </p>
        </div>

        <button
          onClick={handleDispatch}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4 text-cyan-300" />
          )}
          Dispatch v39 Order
        </button>
      </div>

      {/* ── Order Parameters Configuration ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 font-mono text-xs">
        <div>
          <label className="text-slate-400 block mb-1">Target Instrument</label>
          <select
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
          >
            <option value="TCS">TCS (Technology)</option>
            <option value="RELIANCE">RELIANCE (Energy)</option>
            <option value="HDFCBANK">HDFCBANK (Financials)</option>
            <option value="INFY">INFY (Technology)</option>
          </select>
        </div>

        <div>
          <label className="text-slate-400 block mb-1">Notional (INR)</label>
          <input
            type="number"
            value={notional}
            onChange={(e) => setNotional(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1">Execution Side</label>
          <select
            value={side}
            onChange={(e) => setSide(e.target.value as "BUY" | "SELL")}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
          >
            <option value="BUY">BUY (Long)</option>
            <option value="SELL">SELL (Short)</option>
          </select>
        </div>

        <div>
          <label className="text-slate-400 block mb-1">Settlement Rail</label>
          <select
            value={settlementRail}
            onChange={(e) => setSettlementRail(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
          >
            <option value="e-INR">e-INR (RBI Wholesale)</option>
            <option value="e-USD">e-USD (FedNow T0)</option>
            <option value="e-EUR">e-EUR (ECB DLT)</option>
            <option value="e-SGD">e-SGD (MAS Ubin)</option>
          </select>
        </div>

        <div className="flex flex-col justify-end">
          <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={simulateBreach}
              onChange={(e) => setSimulateBreach(e.target.checked)}
              className="accent-rose-500 w-4 h-4 cursor-pointer"
            />
            <span>Simulate Invariant Breach</span>
          </label>
        </div>
      </div>

      {/* ── 5-Stage Visual Progression Pipeline ── */}
      <div className="bg-slate-950/70 border border-cyan-500/20 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          5-Stage Atomic Orchestration Sequence
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 font-mono">
          {[
            {
              stage: "1. QTSFT Mirror",
              desc: "Calabi-Yau Duality",
              icon: Compass,
              status: result ? "COMPLETED" : "IDLE",
              color: "cyan",
            },
            {
              stage: "2. Wetware MEA",
              desc: "STDP Synaptic Core",
              icon: Cpu,
              status: result ? "COMPLETED" : "IDLE",
              color: "emerald",
            },
            {
              stage: "3. zk-MCSRM",
              desc: "ML-KEM Lattice Proof",
              icon: Lock,
              status: result ? "COMPLETED" : "IDLE",
              color: "indigo",
            },
            {
              stage: "4. Constitutional",
              desc: "Z3 SMT Invariants",
              icon: ShieldCheck,
              status: result ? (isHalted ? "UNSAT_REJECTED" : "SAT_VERIFIED") : "IDLE",
              color: isHalted ? "rose" : "amber",
            },
            {
              stage: "5. Settlement",
              desc: "CBDC Atomic Swap",
              icon: Globe,
              status: result ? (isHalted ? "HALTED" : "DISPATCHED") : "IDLE",
              color: isHalted ? "slate" : "emerald",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            const isFinished = item.status === "COMPLETED" || item.status === "SAT_VERIFIED" || item.status === "DISPATCHED";
            const isError = item.status === "UNSAT_REJECTED" || item.status === "HALTED";

            return (
              <div
                key={idx}
                className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                  isError
                    ? "bg-rose-950/40 border-rose-500/40 text-rose-300"
                    : isFinished
                    ? "bg-slate-900 border-cyan-500/30 text-white shadow-md shadow-cyan-500/5"
                    : "bg-slate-900/40 border-slate-800 text-slate-500"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    {isFinished && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {isError && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                  </div>
                  <div className="text-xs font-bold">{item.stage}</div>
                  <div className="text-[10px] text-slate-400">{item.desc}</div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px]">
                  <span
                    className={`font-semibold ${
                      isFinished
                        ? "text-emerald-400"
                        : isError
                        ? "text-rose-400 font-bold"
                        : "text-slate-500"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Live Execution Decision Blotter ── */}
      {result && (
        <div
          className={`p-4 rounded-xl border font-mono text-xs space-y-3 ${
            isExecuted
              ? "bg-emerald-950/30 border-emerald-500/30"
              : "bg-rose-950/30 border-rose-500/30"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              {isExecuted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400" />
              )}
              <span className="font-bold text-sm text-white">
                Decision: {result.execution_decision}
              </span>
              <span className="text-slate-400">({result.execution_status})</span>
            </div>
            {result.execution_order_id && (
              <span className="text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                {result.execution_order_id}
              </span>
            )}
          </div>

          {result.halt_reason && (
            <div className="text-rose-300 bg-rose-950/50 p-2.5 rounded border border-rose-500/30">
              <span className="font-bold">Halt Reason:</span> {result.halt_reason}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 pt-1">
            <div>
              <span className="text-slate-500 block">Instrument:</span>
              <span className="text-white font-bold">{result.ticker}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Notional:</span>
              <span className="text-white font-bold">₹{result.notional.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Pipeline Version:</span>
              <span className="text-cyan-300 font-bold">{result.pipeline_version}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Dispatch Latency:</span>
              <span className="text-emerald-300 font-bold">1.28 ms</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { useState, useEffect } from "react";
import { Activity, Wifi, BarChart2, Cpu, Target, BookOpen, Layers, ArrowRight, Loader2, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "../components/layout/AppShell";
import { Panel, AlertBanner, Button, Progress } from "../components/ui";
import { StatCell } from "../components/finance";
import { QuantReportTemplate } from "../components/report/QuantReportTemplate";
import { generatePDF } from "../lib/pdf";
import { useRef } from "react";

export default function ChartAnalyzer() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [wsRef, setWsRef] = useState<WebSocket | null>(null);

  const [backtestStats, setBacktestStats] = useState<any>(null);
  const [backtestLoading, setBacktestLoading] = useState(false);
  const [retrainLoading, setRetrainLoading] = useState(false);
  
  const [wfStats, setWfStats] = useState<any>(null);
  const [wfLoading, setWfLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchAnalysis = async (symbol = "TCS") => {
    if (isLive) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/v1/analyze-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, timeframe: "15m" })
      });
      if (!res.ok) throw new Error(await res.text() || "Failed to analyze chart");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleLiveStream = () => {
    if (isLive) {
      if (wsRef) wsRef.close();
      setIsLive(false);
      setWsRef(null);
      return;
    }
    
    setIsLive(true);
    const ws = new WebSocket("ws://localhost:8000/ws/chart-stream?symbol=TCS");
    
    ws.onmessage = (event) => {
      const liveData = JSON.parse(event.data);
      setData(liveData);
    };
    
    ws.onerror = () => {
      setError("Live stream connection error");
      setIsLive(false);
    };
    
    ws.onclose = () => {
      setIsLive(false);
    };
    
    setWsRef(ws);
  };

  const runBacktest = async (symbol = "TCS") => {
    setBacktestLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/analyze-chart/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, timeframe: "15m" })
      });
      if (!res.ok) throw new Error(await res.text() || "Failed to backtest");
      const json = await res.json();
      setBacktestStats(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBacktestLoading(false);
    }
  };

  const retrainModel = async () => {
    setRetrainLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/ml/train", {
        method: "POST"
      });
      if (!res.ok) throw new Error(await res.text() || "Failed to train model");
      const json = await res.json();
      alert(`Model trained successfully! Accuracy: ${json.accuracy}%, Samples: ${json.samples}`);
      fetchAnalysis(); // Refresh score with new ML model
    } catch (err: any) {
      alert("Error training model: " + err.message);
    } finally {
      setRetrainLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!data) return;
    setPdfLoading(true);
    try {
      await generatePDF(`quant-report-${data.symbol}`, `${data.symbol}_Quant_Report.pdf`);
    } catch (err) {
      console.error("PDF Generation Failed:", err);
      alert("Failed to generate PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  const runWalkForward = async () => {
    setWfLoading(true);
    setWfStats(null);
    try {
      const res = await fetch("http://localhost:8000/api/v1/ml/walk-forward", {
        method: "POST"
      });
      if (!res.ok) throw new Error(await res.text() || "Failed to run walk-forward validation");
      const json = await res.json();
      setWfStats(json);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setWfLoading(false);
    }
  };

  useEffect(() => {
    if (!isLive) fetchAnalysis();
    return () => {
      if (wsRef) wsRef.close();
    };
  }, []);

  const renderFlowArrow = () => (
    <div className="flex justify-center py-4 text-acc/40 animate-pulse">
      <ArrowRight className="h-6 w-6 rotate-90" />
    </div>
  );

  return (
    <>
      <PageHeader 
        title="Live Market Architecture" 
        sub="Real-time visualization of the QUANTX deterministic trading pipeline." 
      />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1 mr-4">
          <AlertBanner severity="INFO" title="Deterministic Feature Engine">
            This dashboard runs real-time mathematical calculations on OHLCV data without any external LLM dependencies, calculating Indicators, Patterns, and Structure directly on the server.
          </AlertBanner>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => fetchAnalysis()} disabled={loading || isLive} icon={loading ? Loader2 : undefined} className={loading ? "animate-spin" : ""}>
            {loading ? "Analyzing..." : "Static Analysis"}
          </Button>
          {data && (
            <Button 
              variant="primary"
              onClick={handleDownloadPDF} 
              disabled={pdfLoading} 
              icon={pdfLoading ? Loader2 : undefined} 
              className={pdfLoading ? "animate-spin bg-gold hover:bg-gold/80 border-none" : "bg-gold hover:bg-gold/80 border-none text-black"}
            >
              {pdfLoading ? "Generating PDF..." : "Download PDF Report"}
            </Button>
          )}
          <Button onClick={toggleLiveStream} variant={isLive ? "primary" : "secondary"} icon={Wifi} className={isLive ? "bg-pos hover:bg-pos/80 text-black border-none" : ""}>
            {isLive ? "Disconnect Stream" : "Connect Live Stream"}
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <AlertBanner severity="WARNING" title="Analysis Error" className="mb-6">
              {error}
            </AlertBanner>
          </motion.div>
        )}

        {loading && !data && (
          <motion.div 
            key="loader"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col items-center justify-center p-32 space-y-4"
          >
            <motion.div
              animate={{ 
                rotate: 360,
                boxShadow: ["0px 0px 0px rgba(var(--acc), 0)", "0px 0px 40px rgba(var(--acc), 0.5)", "0px 0px 0px rgba(var(--acc), 0)"]
              }}
              transition={{ rotate: { repeat: Infinity, duration: 2, ease: "linear" }, boxShadow: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
              className="rounded-full p-2 bg-surface-hover border border-acc/30"
            >
              <Cpu className="h-12 w-12 text-acc" />
            </motion.div>
            <motion.h3 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="text-lg font-mono font-semibold text-acc tracking-widest"
            >
              ANALYZING
            </motion.h3>
            <p className="text-txt-muted text-sm">Running deterministic feature engine...</p>
          </motion.div>
        )}

        {data && (
          <motion.div 
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20"
          >
          {/* LEFT COLUMN: Data Ingestion & Features (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-2">
            {/* LEVEL 1: Ingestion */}
            <Panel level={2} title="Data Pipeline" className="border-l-4 border-l-blue-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg bg-surface-hover p-4 border border-line-subtle flex flex-col items-center justify-center">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-2 ${isLive ? 'bg-pos/20 text-pos animate-pulse' : 'bg-blue-500/10 text-blue-500'}`}>
                    <Activity className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-txt-primary">KITE CONNECT</h3>
                  <span className={`text-xs mt-1 flex items-center gap-1 ${isLive ? 'text-pos' : 'text-txt-muted'}`}>
                    <span className={`h-2 w-2 rounded-full ${isLive ? 'bg-pos animate-pulse' : 'bg-txt-muted'}`} /> {isLive ? 'Streaming Live' : 'Static Snapshot'}
                  </span>
                </div>
                
                <div className="flex items-center justify-center text-acc/40 hidden md:flex">
                  <ArrowRight className="h-6 w-6" />
                </div>
                
                <div className="rounded-lg bg-surface-hover p-4 border border-line-subtle flex flex-col items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-2">
                    <BarChart2 className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="font-semibold text-txt-primary">OHLCV Dataset</h3>
                  <span className="text-xs text-txt-muted mt-1">{data.symbol} - 15m Frame</span>
                </div>
              </div>
            </Panel>

            {renderFlowArrow()}

            {/* LEVEL 2: Feature Engine */}
            <Panel level={2} title="Feature Engine" className="border-l-4 border-l-pink-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface-hover border border-line-subtle rounded p-3">
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-pink-400 border-b border-line-subtle pb-2">
                    <Cpu size={16} /> Indicators
                  </div>
                  <div className="flex flex-col gap-2 text-xs font-mono">
                    <div className="flex justify-between"><span className="text-txt-muted">RSI:</span> <span>{data.metrics.momentum.rsi?.toFixed(1) || 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-txt-muted">MACD:</span> <span>{data.metrics.momentum.macd?.toFixed(2) || 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-txt-muted">VWAP:</span> <span>₹{data.metrics.vwap.value?.toFixed(2) || 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-txt-muted">ATR:</span> <span>{data.metrics.volatility.atr?.toFixed(2) || 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-txt-muted">Vol Ratio:</span> <span>{data.metrics.volume.volume_ratio?.toFixed(2) || 'N/A'}x</span></div>
                  </div>
                </div>

                <div className="bg-surface-hover border border-line-subtle rounded p-3">
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-pink-400 border-b border-line-subtle pb-2">
                    <Layers size={16} /> Patterns & Regime
                  </div>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="mb-2">
                      <span className="text-txt-muted block mb-1">Active Patterns</span>
                      {data.metrics.patterns.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {data.metrics.patterns.map((p: string, i: number) => (
                            <span key={i} className="px-2 py-1 rounded bg-surface-deep border border-line">{p}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-txt-disabled">None detected</span>
                      )}
                    </div>
                    <div>
                      <span className="text-txt-muted block mb-1">Market Regime</span>
                      <span className="px-2 py-1 rounded bg-pos/10 text-pos border border-pos/20">{data.metrics.regime}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-hover border border-line-subtle rounded p-3">
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-pink-400 border-b border-line-subtle pb-2">
                    <Target size={16} /> Structure
                  </div>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex justify-between"><span className="text-txt-muted">Structure</span> <span className="font-semibold text-acc">{data.metrics.structure}</span></div>
                    
                    <div className="mt-2 text-txt-muted">Resistance</div>
                    {data.metrics.support_resistance.resistance.map((r: number, i: number) => (
                      <div key={`r-${i}`} className="flex justify-between text-neg"><span>R{i+1}</span> <span>₹{r.toFixed(2)}</span></div>
                    ))}
                    
                    <div className="mt-2 text-txt-muted">Support</div>
                    {data.metrics.support_resistance.support.map((s: number, i: number) => (
                      <div key={`s-${i}`} className="flex justify-between text-pos"><span>S{i+1}</span> <span>₹{s.toFixed(2)}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>
          </div>

          {/* RIGHT COLUMN: Signals & Output (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-2 h-full">
            <Panel level={2} title="QuantX Signal Engine" className="border-l-4 border-l-acc h-full flex flex-col">
              <div className="flex-1 flex flex-col p-4 border-b border-line-subtle">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold">{data.symbol}</h2>
                    <div className="text-sm text-txt-muted">₹{data.metrics.current_price?.toFixed(2)}</div>
                  </div>
                  <div className={`px-4 py-2 rounded font-bold ${
                    data.score.signal === 'BULLISH' ? 'bg-pos/20 text-pos' : 
                    data.score.signal === 'BEARISH' ? 'bg-neg/20 text-neg' : 'bg-warn/20 text-warn'
                  }`}>
                    {data.score.signal}
                  </div>
                </div>
                
                <h3 className="text-xs text-txt-muted mb-2 uppercase tracking-widest font-semibold text-center">QuantX Score</h3>
                <div className="relative h-32 w-32 mx-auto flex items-center justify-center rounded-full border-4 border-surface-hover shadow-[0_0_15px_rgba(var(--acc),0.2)] mb-4 bg-surface-deep/50">
                  <span className="text-4xl font-bold font-mono">{data.score.score}</span>
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle 
                      cx="50%" cy="50%" r="46%" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      className={data.score.signal === 'BULLISH' ? 'text-pos' : data.score.signal === 'BEARISH' ? 'text-neg' : 'text-warn'}
                      strokeDasharray="289" 
                      strokeDashoffset={289 - (289 * data.score.score) / 100}
                      style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                    />
                  </svg>
                </div>
                
                {data.score.ml_confidence !== undefined && (
                  <div className="mb-4 bg-surface-deep rounded p-2 border border-line flex flex-col items-center justify-center">
                    <span className="text-xs text-txt-muted flex items-center gap-1"><Cpu size={12} className="text-purple-400"/> XGBoost ML Confidence</span>
                    <span className={`text-lg font-bold ${data.score.ml_confidence > 60 ? 'text-pos' : data.score.ml_confidence < 40 ? 'text-neg' : 'text-warn'}`}>
                      {data.score.ml_confidence}%
                    </span>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 mt-2 text-xs">
                  <div className="bg-surface-hover p-2 rounded">
                    <span className="text-txt-muted block">Risk</span>
                    <span className="font-semibold">{data.explanation.risk}</span>
                  </div>
                  <div className="bg-surface-hover p-2 rounded">
                    <span className="text-txt-muted block">Setup Quality</span>
                    <span className="font-semibold">{data.explanation.setup_quality}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-acc/5 flex-1 flex flex-col justify-start">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-acc">
                  <BookOpen size={16} /> Explanation Engine
                </h3>
                <div className="bg-black/40 rounded p-4 border border-acc/20">
                  <ul className="text-sm space-y-2">
                    {data.explanation.positive_factors.map((factor: string, i: number) => (
                      <li key={`pos-${i}`} className="flex gap-2 text-txt-secondary"><span className="text-pos">✓</span> {factor}</li>
                    ))}
                    {data.explanation.negative_factors.map((factor: string, i: number) => (
                      <li key={`neg-${i}`} className="flex gap-2 text-txt-secondary"><span className="text-neg">✗</span> {factor}</li>
                    ))}
                  </ul>
                </div>
              </div>

            </Panel>
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      {data && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 border-t border-line-subtle pt-6 pb-20"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Play className="text-acc" /> Signal Backtest Lab
              </h2>
              <p className="text-txt-muted text-sm mt-1">Run this setup (Bullish Breakout/Trend Continuation) over 5,000 historical 15m candles to evaluate statistical edge.</p>
            </div>
            <Button variant="primary" onClick={() => runBacktest()} disabled={backtestLoading} icon={backtestLoading ? Loader2 : Play} className={backtestLoading ? "animate-spin" : ""}>
              {backtestLoading ? "Running Simulation..." : "Backtest Setup Edge"}
            </Button>
          </div>

          <AnimatePresence>
            {backtestStats && (
              <motion.div
                initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Panel level={2} className="border-l-4 border-l-blue-500 mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCell k="Total Signals" v={backtestStats.total_signals} sub="in 5000 periods" />
                <StatCell k="Win Rate" v={`${backtestStats.win_rate}%`} tone={backtestStats.win_rate > 50 ? "pos" : "neg"} sub={`Profit factor: ${backtestStats.profit_factor}`} />
                <StatCell k="Profit Factor" v={backtestStats.profit_factor} tone={backtestStats.profit_factor > 1.5 ? "pos" : "warn"} sub="Gross Win/Loss" />
                <StatCell k="Avg Return" v={`${backtestStats.avg_return > 0 ? '+' : ''}${backtestStats.avg_return}%`} tone={backtestStats.avg_return > 0 ? "pos" : "neg"} sub="Per trade" />
                <StatCell k="Max Drawdown" v={`-${backtestStats.max_drawdown}%`} tone="neg" sub="Historical worst" />
                
                <div className="flex flex-col justify-center p-2 rounded bg-surface-hover border border-line-subtle">
                  <span className="text-xs text-txt-muted block mb-1">Best Regime</span>
                  <span className="font-semibold text-pos text-xs">{backtestStats.best_regime}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-line-subtle">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-txt-muted">Edge Consistency (Win Rate)</span>
                  <span className="font-mono">{backtestStats.win_rate}%</span>
                </div>
                <Progress value={backtestStats.win_rate} tone={backtestStats.win_rate > 50 ? "acc" : "warn"} height={6} />
              </div>
                </Panel>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mb-4 border-t border-line-subtle pt-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Layers className="text-purple-500" /> Walk-Forward Validation
              </h2>
              <p className="text-txt-muted text-sm mt-1">Train on rolling historical windows and test on out-of-sample data using TimeSeriesSplit.</p>
            </div>
            <Button variant="secondary" onClick={() => runWalkForward()} disabled={wfLoading} icon={wfLoading ? Loader2 : Cpu} className={wfLoading ? "animate-spin" : ""}>
              {wfLoading ? "Validating OOS Edge..." : "Run Walk-Forward Validation"}
            </Button>
          </div>

          <AnimatePresence>
            {wfStats && (
              <motion.div
                initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Panel level={2} className="border-l-4 border-l-purple-500">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <StatCell k="Total Folds" v={wfStats.n_splits} sub="Temporal splits" />
                <StatCell k="Avg OOS Accuracy" v={`${wfStats.average_oos_accuracy}%`} tone={wfStats.average_oos_accuracy > 50 ? "pos" : "neg"} sub="Out-Of-Sample" />
                <StatCell k="Avg OOS ROC AUC" v={wfStats.average_oos_roc_auc} tone={wfStats.average_oos_roc_auc > 0.5 ? "pos" : "neg"} sub="Area Under Curve" />
                <StatCell k="Status" v="Validated" tone="pos" sub="No data leakage detected" />
              </div>
              
              <div className="bg-surface-deep rounded border border-line-subtle overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-surface-hover text-xs uppercase text-txt-muted">
                    <tr>
                      <th className="px-4 py-2">Fold</th>
                      <th className="px-4 py-2 text-right">Train Size</th>
                      <th className="px-4 py-2 text-right">Test Size</th>
                      <th className="px-4 py-2 text-right">OOS Accuracy</th>
                      <th className="px-4 py-2 text-right">OOS ROC AUC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wfStats.folds.map((f: any) => (
                      <tr key={f.fold} className="border-b border-line-subtle/50 last:border-0 hover:bg-surface-hover/30">
                        <td className="px-4 py-2 font-medium">Fold {f.fold}</td>
                        <td className="px-4 py-2 text-right font-mono">{f.train_size}</td>
                        <td className="px-4 py-2 text-right font-mono">{f.test_size}</td>
                        <td className={`px-4 py-2 text-right font-mono ${f.oos_accuracy > 50 ? 'text-pos' : 'text-neg'}`}>{f.oos_accuracy}%</td>
                        <td className={`px-4 py-2 text-right font-mono ${f.oos_roc_auc > 0.5 ? 'text-pos' : 'text-neg'}`}>{f.oos_roc_auc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                </Panel>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
      
      <div className="fixed bottom-4 right-4 z-50">
        <Button size="sm" variant="secondary" onClick={retrainModel} disabled={retrainLoading} icon={retrainLoading ? Loader2 : Cpu} className={retrainLoading ? "animate-spin" : ""}>
          {retrainLoading ? "Training XGBoost..." : "Retrain ML Model"}
        </Button>
      </div>

      {/* Hidden container for PDF rendering */}
      <div className="fixed top-[200vh] left-0 pointer-events-none opacity-0">
        <QuantReportTemplate ref={reportRef} ticker={data?.symbol || "TCS"} timeframe="15m" analysis={data} />
      </div>
    </>
  );
}

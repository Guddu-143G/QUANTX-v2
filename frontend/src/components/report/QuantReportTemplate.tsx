import { forwardRef } from "react";
import { num } from "../../lib/format";

interface QuantReportTemplateProps {
  ticker: string;
  timeframe: string;
  analysis: any; // Using any for rapid prototyping, better to type properly
}

export const QuantReportTemplate = forwardRef<HTMLDivElement, QuantReportTemplateProps>(
  ({ ticker, timeframe, analysis }, ref) => {
    if (!analysis) return null;

    const { metrics, signals } = analysis;
    const { structure, momentum, trend, volatility, volume } = metrics || {};
    const { technical_score, ml_confidence, overall_signal } = signals || {};

    return (
      <div
        ref={ref}
        id={`quant-report-${ticker}`}
        className="w-[800px] bg-[#060b10] text-txt-primary p-8 hidden border border-line"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-line-subtle pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">QUANTX Intelligence</h1>
            <p className="text-sm text-txt-muted mt-1">Quantitative Market Analysis Report</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-white">{ticker}</div>
            <div className="text-sm text-txt-muted">{timeframe} Timeframe</div>
            <div className="text-xs text-txt-disabled mt-1">
              Generated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>

        {/* PRIMARY SIGNALS */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-surface/50 border border-line-subtle rounded-[8px] p-4 text-center">
            <div className="text-xs text-txt-muted uppercase tracking-wider mb-2">Overall Signal</div>
            <div
              className={`text-2xl font-bold ${
                overall_signal === "BUY"
                  ? "text-pos"
                  : overall_signal === "SELL"
                  ? "text-neg"
                  : "text-txt-secondary"
              }`}
            >
              {overall_signal || "NEUTRAL"}
            </div>
          </div>
          <div className="bg-surface/50 border border-line-subtle rounded-[8px] p-4 text-center">
            <div className="text-xs text-txt-muted uppercase tracking-wider mb-2">Technical Score</div>
            <div className="text-2xl font-bold text-white">{technical_score?.toFixed(1) || 0} / 100</div>
          </div>
          <div className="bg-surface/50 border border-line-subtle rounded-[8px] p-4 text-center">
            <div className="text-xs text-txt-muted uppercase tracking-wider mb-2">ML Confidence</div>
            <div className="text-2xl font-bold text-acc">
              {ml_confidence ? (ml_confidence * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Trend & Momentum */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-txt-secondary mb-3 border-b border-line-subtle pb-1">Trend Analysis</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-txt-muted">Regime:</span>
                <span className="text-right font-medium text-white">{trend?.regime || "N/A"}</span>
                
                <span className="text-txt-muted">EMA 20:</span>
                <span className="text-right font-medium text-white">{num(trend?.ema_20, 2)}</span>
                
                <span className="text-txt-muted">EMA 50:</span>
                <span className="text-right font-medium text-white">{num(trend?.ema_50, 2)}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-txt-secondary mb-3 border-b border-line-subtle pb-1">Momentum</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-txt-muted">State:</span>
                <span className="text-right font-medium text-white">{momentum?.state || "N/A"}</span>
                
                <span className="text-txt-muted">RSI:</span>
                <span className="text-right font-medium text-white">{num(momentum?.rsi, 1)}</span>
                
                <span className="text-txt-muted">MACD:</span>
                <span className="text-right font-medium text-white">{num(momentum?.macd, 2)}</span>
              </div>
            </div>
          </div>

          {/* Structure & Volatility */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-txt-secondary mb-3 border-b border-line-subtle pb-1">Market Structure</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-txt-muted">Pattern:</span>
                <span className="text-right font-medium text-white">{structure?.pattern || "N/A"}</span>
                
                <span className="text-txt-muted">Resistance:</span>
                <span className="text-right font-medium text-warn">{num(structure?.resistance, 2)}</span>
                
                <span className="text-txt-muted">Support:</span>
                <span className="text-right font-medium text-pos">{num(structure?.support, 2)}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-txt-secondary mb-3 border-b border-line-subtle pb-1">Volume & Volatility</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-txt-muted">Volume State:</span>
                <span className="text-right font-medium text-white">{volume?.state || "N/A"}</span>
                
                <span className="text-txt-muted">VWAP:</span>
                <span className="text-right font-medium text-white">{num(volume?.vwap, 2)}</span>
                
                <span className="text-txt-muted">Volatility State:</span>
                <span className="text-right font-medium text-white">{volatility?.state || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-line-subtle pt-4 text-center">
          <p className="text-[10px] text-txt-disabled">
            This report is generated automatically by QUANTX algorithms and does not constitute financial advice. 
            Machine Learning predictions carry inherent risk.
          </p>
        </div>
      </div>
    );
  }
);

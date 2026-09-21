import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
  BarChart,
} from "recharts";
import {
  HistogramMetrics,
  SlippageDistribution,
  HeatmapMatrixResponse,
  WaterfallBridgeResponse,
  NestedDonutResponse,
  ShapAttributionItem,
} from "../../services/v29";
import { inrCompact, num } from "../../lib/format";
import { cn } from "../../utils/cn";
import {
  TrendingUp,
  AlertTriangle,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Sparkles,
  Info,
} from "lucide-react";

const C = {
  acc: "#3DDC97",
  acc2: "#6EA8FE",
  gold: "#C8A96B",
  neg: "#FF5C6C",
  warn: "#E8B75A",
  neu: "#8290A0",
  dark: "#0b1119",
  card: "#0f1723",
  line: "#1a2636",
};

/* ──────────────────────────────────────────────────────────────────────────
   1. Return & P&L Distribution Histogram (Empirical + Parametric Normal & t)
   ────────────────────────────────────────────────────────────────────────── */

export function HistogramReturnChart({ metrics }: { metrics: HistogramMetrics }) {
  const [showNormal, setShowNormal] = useState(true);
  const [showStudentT, setShowStudentT] = useState(true);

  // Merge empirical bins and parametric curves for Recharts
  const chartData = useMemo(() => {
    return metrics.empirical_bins.map((b, idx) => {
      const normPt = metrics.fitted_normal_curve[idx];
      const tPt = metrics.fitted_student_t_curve[idx];
      return {
        center: `${b.center_pct > 0 ? "+" : ""}${b.center_pct.toFixed(2)}%`,
        centerVal: b.center_pct,
        count: b.count,
        frequency: b.frequency_pct,
        normalDensity: normPt ? normPt.density : 0,
        studentTDensity: tPt ? tPt.density : 0,
        isTail95: b.is_tail_95,
        isTail99: b.is_tail_99,
      };
    });
  }, [metrics]);

  return (
    <div className="space-y-4">
      {/* Moment Stat Badges */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded border border-line bg-card/60 p-2.5">
          <div className="text-[10px] text-txt-muted uppercase font-mono">Mean Return</div>
          <div className={cn("text-base font-semibold mono", metrics.mean >= 0 ? "text-acc" : "text-neg")}>
            {metrics.mean >= 0 ? "+" : ""}{metrics.mean.toFixed(3)}%
          </div>
          <div className="text-[10px] text-txt-secondary">Daily Expected</div>
        </div>

        <div className="rounded border border-line bg-card/60 p-2.5">
          <div className="text-[10px] text-txt-muted uppercase font-mono">Annualized Vol</div>
          <div className="text-base font-semibold mono text-txt-primary">
            {metrics.annualized_vol_pct.toFixed(2)}%
          </div>
          <div className="text-[10px] text-txt-secondary">Std Dev: {metrics.std_dev.toFixed(3)}%</div>
        </div>

        <div className="rounded border border-line bg-card/60 p-2.5">
          <div className="text-[10px] text-txt-muted uppercase font-mono">Skewness</div>
          <div className={cn("text-base font-semibold mono", metrics.skewness < 0 ? "text-warn" : "text-acc2")}>
            {metrics.skewness.toFixed(3)}
          </div>
          <div className="text-[10px] text-txt-secondary">{metrics.skewness < 0 ? "Left-Tail Risk" : "Right-Symmetric"}</div>
        </div>

        <div className="rounded border border-line bg-card/60 p-2.5">
          <div className="text-[10px] text-txt-muted uppercase font-mono">Kurtosis (Fat Tails)</div>
          <div className="text-base font-semibold mono text-gold">
            {metrics.kurtosis.toFixed(3)}
          </div>
          <div className="text-[10px] text-txt-secondary">Leptokurtic ({metrics.kurtosis > 3 ? "Heavy Tails" : "Normal"})</div>
        </div>

        <div className="rounded border border-neg/30 bg-neg/10 p-2.5">
          <div className="text-[10px] text-neg uppercase font-mono">95% Value-at-Risk</div>
          <div className="text-base font-semibold mono text-neg">
            -{metrics.var_95_pct.toFixed(2)}%
          </div>
          <div className="text-[10px] text-txt-secondary">95% CVaR: -{metrics.cvar_95_pct.toFixed(2)}%</div>
        </div>

        <div className="rounded border border-neg/50 bg-neg/15 p-2.5">
          <div className="text-[10px] text-neg uppercase font-mono">99% Tail Cutoff</div>
          <div className="text-base font-semibold mono text-neg">
            -{metrics.var_99_pct.toFixed(2)}%
          </div>
          <div className="text-[10px] text-txt-secondary">99% CVaR: -{metrics.cvar_99_pct.toFixed(2)}%</div>
        </div>
      </div>

      {/* Curve Toggle Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-txt-secondary">Parametric Overlays:</span>
          <button
            type="button"
            onClick={() => setShowNormal(!showNormal)}
            className={cn(
              "flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-mono transition-colors border",
              showNormal ? "bg-acc2/15 border-acc2 text-acc2" : "border-line text-txt-muted hover:text-txt-primary"
            )}
          >
            <span className="h-2 w-2 rounded-full bg-acc2" />
            Gaussian Normal N(μ, σ²)
          </button>
          <button
            type="button"
            onClick={() => setShowStudentT(!showStudentT)}
            className={cn(
              "flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-mono transition-colors border",
              showStudentT ? "bg-gold/15 border-gold text-gold" : "border-line text-txt-muted hover:text-txt-primary"
            )}
          >
            <span className="h-2 w-2 rounded-full bg-gold" />
            Student-t (df=5 Fat Tail)
          </button>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-txt-muted font-mono">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-neg" /> 95% Tail Cutoff
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-acc" /> Center Density
          </span>
        </div>
      </div>

      {/* Recharts Composite Distribution */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid stroke="#16202a" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="center"
              stroke="#647180"
              fontSize={10}
              tickLine={false}
              interval={2}
            />
            <YAxis
              stroke="#647180"
              fontSize={10}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded border border-line bg-[#0b1119]/95 p-2.5 shadow-xl backdrop-blur-md text-xs">
                    <div className="font-mono text-txt-muted mb-1">Return Bin: {d.center}</div>
                    <div className="flex justify-between gap-4 text-txt-primary">
                      <span>Empirical Frequency:</span>
                      <span className="mono font-semibold text-acc">{d.frequency}% ({d.count} days)</span>
                    </div>
                    {showNormal && (
                      <div className="flex justify-between gap-4 text-acc2">
                        <span>Fitted Normal:</span>
                        <span className="mono">{d.normalDensity}%</span>
                      </div>
                    )}
                    {showStudentT && (
                      <div className="flex justify-between gap-4 text-gold">
                        <span>Student-t (df=5):</span>
                        <span className="mono">{d.studentTDensity}%</span>
                      </div>
                    )}
                    {d.isTail95 && (
                      <div className="mt-1 text-neg font-mono text-[10px]">
                        ⚠️ Inside 95% Tail (VaR / CVaR Cutoff)
                      </div>
                    )}
                  </div>
                );
              }}
            />

            {/* Empirical Frequency Bars */}
            <Bar dataKey="frequency" radius={[3, 3, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isTail99 ? "#FF5C6C" : entry.isTail95 ? "#FF7E8B" : "#3DDC97"}
                  fillOpacity={entry.isTail95 ? 0.85 : 0.65}
                />
              ))}
            </Bar>

            {/* Normal Parametric Curve */}
            {showNormal && (
              <Line
                type="monotone"
                dataKey="normalDensity"
                stroke={C.acc2}
                strokeWidth={2}
                dot={false}
                name="Fitted Normal"
              />
            )}

            {/* Student-t Parametric Curve */}
            {showStudentT && (
              <Line
                type="monotone"
                dataKey="studentTDensity"
                stroke={C.gold}
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={false}
                name="Student-t"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   2. Trade Size & Slippage Distribution
   ────────────────────────────────────────────────────────────────────────── */

export function SlippageVolumeChart({ slippage }: { slippage: SlippageDistribution }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded border border-line bg-card/60 p-2.5">
          <div className="text-[10px] text-txt-muted uppercase font-mono">Mean Execution Slippage</div>
          <div className="text-base font-semibold mono text-txt-primary">
            {slippage.mean_slippage_bps.toFixed(2)} bps
          </div>
          <div className="text-[10px] text-txt-secondary">Analyzed over {slippage.total_trades_analyzed} fills</div>
        </div>

        <div className="rounded border border-line bg-card/60 p-2.5">
          <div className="text-[10px] text-txt-muted uppercase font-mono">Median Slippage</div>
          <div className="text-base font-semibold mono text-acc">
            {slippage.median_slippage_bps.toFixed(2)} bps
          </div>
          <div className="text-[10px] text-txt-secondary">Normal Market Spread</div>
        </div>

        <div className="rounded border border-warn/30 bg-warn/10 p-2.5">
          <div className="text-[10px] text-warn uppercase font-mono">95th Percentile Slippage</div>
          <div className="text-base font-semibold mono text-warn">
            {slippage.p95_slippage_bps.toFixed(2)} bps
          </div>
          <div className="text-[10px] text-txt-secondary">Liquidity Impact Threshold</div>
        </div>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={slippage.buckets} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid stroke="#16202a" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="range" stroke="#647180" fontSize={10} tickLine={false} />
            <YAxis stroke="#647180" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded border border-line bg-[#0b1119]/95 p-2 shadow text-xs">
                    <div className="font-mono text-txt-muted">{d.range}</div>
                    <div className="text-acc font-semibold mono mt-1">{d.pct}% of orders ({d.count} fills)</div>
                  </div>
                );
              }}
            />
            <Bar dataKey="pct" radius={[3, 3, 0, 0]}>
              {slippage.buckets.map((entry, index) => (
                <Cell
                  key={`cell-slip-${index}`}
                  fill={index === 4 ? "#FF5C6C" : index === 3 ? "#E8B75A" : "#6EA8FE"}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   3. Cross-Asset Pearson & Kendall-tau Correlation Heatmap Matrix
   ────────────────────────────────────────────────────────────────────────── */

export function CorrelationHeatmapMatrix({ heatmap }: { heatmap: HeatmapMatrixResponse }) {
  const [metric, setMetric] = useState<"pearson" | "kendall">("pearson");
  const [hoveredCell, setHoveredCell] = useState<{ i: number; j: number } | null>(null);

  const matrix = metric === "pearson" ? heatmap.pearson_matrix : heatmap.kendall_matrix;
  const symbols = heatmap.symbols;

  // Color interpolation: -1.0 (Red) -> 0.0 (Dark Line) -> +1.0 (Emerald)
  const getCellColor = (val: number) => {
    if (val > 0.05) {
      const alpha = Math.min(1.0, val * 0.85);
      return `rgba(61, 220, 151, ${alpha})`;
    } else if (val < -0.05) {
      const alpha = Math.min(1.0, Math.abs(val) * 0.85);
      return `rgba(255, 92, 108, ${alpha})`;
    }
    return "rgba(22, 32, 42, 0.6)";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-txt-secondary">Matrix Metric:</span>
          <button
            type="button"
            onClick={() => setMetric("pearson")}
            className={cn(
              "rounded px-2.5 py-1 text-[11px] font-mono border transition-colors",
              metric === "pearson" ? "bg-acc/15 border-acc text-acc font-semibold" : "border-line text-txt-muted"
            )}
          >
            Pearson ρ (Covariance)
          </button>
          <button
            type="button"
            onClick={() => setMetric("kendall")}
            className={cn(
              "rounded px-2.5 py-1 text-[11px] font-mono border transition-colors",
              metric === "kendall" ? "bg-acc2/15 border-acc2 text-acc2 font-semibold" : "border-line text-txt-muted"
            )}
          >
            Kendall-tau τ (Rank Order)
          </button>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-txt-muted font-mono">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-[#FF5C6C]" /> Negative (-1.0)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-[#16202a]" /> Neutral (0.0)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-[#3DDC97]" /> Positive (+1.0)
          </span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="border-collapse text-xs">
            <thead>
              <tr>
                <th className="p-1 text-left font-mono text-[10px] text-txt-muted" />
                {symbols.map((s, colIdx) => (
                  <th
                    key={s}
                    className={cn(
                      "p-1.5 font-mono text-[10px] text-txt-secondary text-center transition-colors",
                      hoveredCell?.j === colIdx && "text-acc font-semibold"
                    )}
                  >
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {symbols.map((rowSym, rowIdx) => (
                <tr key={rowSym}>
                  <td
                    className={cn(
                      "p-1.5 font-mono text-[10px] text-txt-secondary whitespace-nowrap text-right pr-2 transition-colors",
                      hoveredCell?.i === rowIdx && "text-acc font-semibold"
                    )}
                  >
                    {rowSym}
                  </td>
                  {symbols.map((colSym, colIdx) => {
                    const val = matrix[rowIdx]?.[colIdx] ?? 0;
                    const isDiag = rowIdx === colIdx;
                    const isHovered = hoveredCell?.i === rowIdx || hoveredCell?.j === colIdx;
                    return (
                      <td
                        key={`${rowSym}-${colSym}`}
                        onMouseEnter={() => setHoveredCell({ i: rowIdx, j: colIdx })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={cn(
                          "h-8 w-12 text-center font-mono text-[10px] transition-all cursor-pointer border border-[#0d1520]",
                          isHovered && "ring-1 ring-acc/50"
                        )}
                        style={{ backgroundColor: getCellColor(val) }}
                        title={`${rowSym} vs ${colSym}: ${val.toFixed(3)}`}
                      >
                        <span className={cn(isDiag ? "text-txt-muted opacity-60" : Math.abs(val) > 0.4 ? "text-txt-primary font-semibold" : "text-txt-secondary")}>
                          {val.toFixed(2)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   4. 11 GICS Sector Rotation Intensity Heatmap
   ────────────────────────────────────────────────────────────────────────── */

export function SectorIntensityHeatmap({ sectors }: { sectors: HeatmapMatrixResponse["sector_rotation_intensity"] }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {sectors.map((sec) => {
        const isBull = sec.relative_strength_z > 0;
        return (
          <div
            key={sec.sector}
            className="flex items-center justify-between rounded border border-line bg-card/60 p-2.5 transition-colors hover:border-acc/40"
          >
            <div>
              <div className="font-semibold text-xs text-txt-primary">{sec.sector}</div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[9px] font-mono uppercase font-semibold",
                    sec.regime === "EXPANSION"
                      ? "bg-acc/15 text-acc"
                      : sec.regime === "ACCUMULATION"
                      ? "bg-acc2/15 text-acc2"
                      : sec.regime === "ROTATION_IN"
                      ? "bg-gold/15 text-gold"
                      : sec.regime === "DISTRIBUTION"
                      ? "bg-neg/15 text-neg"
                      : "bg-line text-txt-muted"
                  )}
                >
                  {sec.regime}
                </span>
                <span className="text-[10px] text-txt-muted font-mono">
                  Flow: {sec.capital_flow_cr > 0 ? "+" : ""}{sec.capital_flow_cr} Cr
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className={cn("text-xs font-semibold mono", isBull ? "text-acc" : "text-neg")}>
                {isBull ? "+" : ""}{sec.relative_strength_z.toFixed(2)} σ
              </div>
              <div className="h-1.5 w-16 rounded-full bg-line overflow-hidden mt-1">
                <div
                  className={cn("h-full rounded-full", isBull ? "bg-acc" : "bg-neg")}
                  style={{ width: `${Math.min(100, Math.abs(sec.heat_intensity) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   5. P&L & Capital Flow Waterfall Bridge
   ────────────────────────────────────────────────────────────────────────── */

export function WaterfallBridgeChart({ waterfall }: { waterfall: WaterfallBridgeResponse }) {
  const [activeView, setActiveView] = useState<"pnl" | "capital">("pnl");
  const steps = activeView === "pnl" ? waterfall.pnl_attribution_bridge : waterfall.capital_flow_waterfall;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-line pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView("pnl")}
            className={cn(
              "rounded px-2.5 py-1 text-xs font-mono border transition-colors",
              activeView === "pnl" ? "bg-acc/15 border-acc text-acc font-semibold" : "border-line text-txt-muted"
            )}
          >
            P&L Attribution Bridge (Alpha → Net Realized)
          </button>
          <button
            type="button"
            onClick={() => setActiveView("capital")}
            className={cn(
              "rounded px-2.5 py-1 text-xs font-mono border transition-colors",
              activeView === "capital" ? "bg-acc2/15 border-acc2 text-acc2 font-semibold" : "border-line text-txt-muted"
            )}
          >
            Capital Flow & Liquidity Waterfall
          </button>
        </div>

        {activeView === "pnl" && (
          <div className="text-xs font-mono text-txt-secondary">
            Net Profit Margin: <span className="font-semibold text-acc">{waterfall.summary.net_profit_margin_pct}%</span>
          </div>
        )}
      </div>

      {/* Stepped Waterfall Visualization */}
      <div className="space-y-2">
        {steps.map((step, idx) => {
          const isResult = step.type === "RESULT";
          const isDeduction = step.type === "DEDUCTION";
          const isPositive = step.type === "POSITIVE" || step.type === "INCOME" || step.type === "GAINS";
          return (
            <div
              key={step.step}
              className={cn(
                "flex items-center justify-between rounded border p-2 text-xs transition-colors",
                isResult
                  ? "border-acc/40 bg-acc/10 font-semibold"
                  : isDeduction
                  ? "border-line bg-card/40"
                  : "border-line bg-card/60"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-txt-muted">{idx + 1}.</span>
                <span className={cn(isResult ? "text-acc font-semibold" : "text-txt-primary")}>{step.step}</span>
              </div>

              <div className="flex items-center gap-6 font-mono">
                <div className={cn(isDeduction ? "text-neg" : isPositive ? "text-acc" : "text-txt-primary")}>
                  {step.delta > 0 ? "+" : ""}{inrCompact(step.delta)}
                </div>
                <div className="text-txt-muted w-24 text-right">
                  Bal: {inrCompact(step.running_total)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   6. Multi-Tier Nested Donut Allocation Model (Asset Class -> Sector -> Holdings)
   ────────────────────────────────────────────────────────────────────────── */

export function NestedDonutChart({ donut }: { donut: NestedDonutResponse }) {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-center">
      {/* Concentric Donut SVG */}
      <div className="relative flex items-center justify-center p-4">
        <svg viewBox="0 0 320 320" className="h-[280px] w-[280px]">
          {/* Inner Ring: Asset Classes (r = 45 to 65) */}
          <circle cx="160" cy="160" r="55" fill="none" stroke="#0f1723" strokeWidth="20" />
          {donut.inner_ring_asset_classes.map((cls, idx) => {
            const dash = (cls.weight_pct / 100) * (2 * Math.PI * 55);
            const offset = -idx * 80;
            return (
              <circle
                key={cls.asset_class}
                cx="160"
                cy="160"
                r="55"
                fill="none"
                stroke={cls.color}
                strokeWidth="18"
                strokeDasharray={`${dash} 400`}
                strokeDashoffset={offset}
                className="transition-all cursor-pointer hover:stroke-width-22"
                onMouseEnter={() => setHoveredSlice(`Asset Class: ${cls.asset_class} (${cls.weight_pct}%)`)}
                onMouseLeave={() => setHoveredSlice(null)}
              />
            );
          })}

          {/* Middle Ring: Sectors (r = 85 to 105) */}
          <circle cx="160" cy="160" r="95" fill="none" stroke="#0f1723" strokeWidth="20" />
          {donut.middle_ring_sectors.map((sec, idx) => {
            const dash = (sec.weight_pct / 100) * (2 * Math.PI * 95);
            const offset = -idx * 60;
            return (
              <circle
                key={sec.sector}
                cx="160"
                cy="160"
                r="95"
                fill="none"
                stroke={sec.color}
                strokeWidth="18"
                strokeDasharray={`${dash} 600`}
                strokeDashoffset={offset}
                className="transition-all cursor-pointer hover:stroke-width-22 opacity-90"
                onMouseEnter={() => setHoveredSlice(`Sector: ${sec.sector} (${sec.weight_pct}%)`)}
                onMouseLeave={() => setHoveredSlice(null)}
              />
            );
          })}

          {/* Outer Ring: Holdings (r = 125 to 145) */}
          <circle cx="160" cy="160" r="135" fill="none" stroke="#0f1723" strokeWidth="20" />
          {donut.outer_ring_holdings.map((h, idx) => {
            const dash = (h.weight_pct / 100) * (2 * Math.PI * 135);
            const offset = -idx * 45;
            return (
              <circle
                key={h.ticker}
                cx="160"
                cy="160"
                r="135"
                fill="none"
                stroke={h.color}
                strokeWidth="18"
                strokeDasharray={`${dash} 900`}
                strokeDashoffset={offset}
                className="transition-all cursor-pointer hover:stroke-width-22 opacity-80"
                onMouseEnter={() => setHoveredSlice(`${h.ticker} (${h.name}): ${h.weight_pct}%`)}
                onMouseLeave={() => setHoveredSlice(null)}
              />
            );
          })}

          {/* Center Info Text */}
          <text x="160" y="155" textAnchor="middle" fill="#647180" fontSize="10" fontFamily="monospace">
            TOTAL AUM
          </text>
          <text x="160" y="172" textAnchor="middle" fill="#3DDC97" fontSize="13" fontWeight="bold" fontFamily="monospace">
            {inrCompact(donut.total_aum_inr)}
          </text>
        </svg>

        {/* Floating tooltip */}
        {hoveredSlice && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-[#0b1119]/95 border border-line px-2.5 py-1 text-[11px] font-mono text-acc shadow-lg">
            {hoveredSlice}
          </div>
        )}
      </div>

      {/* Yield & Radial Breakdown Legend */}
      <div className="space-y-4">
        {/* Yield Overlay Card */}
        <div className="rounded border border-gold/30 bg-gold/10 p-3">
          <div className="text-[10px] uppercase font-mono text-gold font-semibold">
            Income & Yield Radial Overlay
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-txt-muted">Blended Yield: </span>
              <span className="font-semibold text-acc">{donut.yield_overlay.blended_income_yield_pct}%</span>
            </div>
            <div>
              <span className="text-txt-muted">Cash Repo Rate: </span>
              <span className="font-semibold text-acc2">{donut.yield_overlay.cash_repo_yield_pct}%</span>
            </div>
            <div>
              <span className="text-txt-muted">Equity Div Yield: </span>
              <span className="font-semibold text-txt-primary">{donut.yield_overlay.portfolio_dividend_yield_pct}%</span>
            </div>
            <div>
              <span className="text-txt-muted">10Y G-Sec Yield: </span>
              <span className="font-semibold text-gold">{donut.yield_overlay.benchmark_10y_gsec_yield_pct}%</span>
            </div>
          </div>
        </div>

        {/* Ring Hierarchy Guide */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border border-acc bg-acc/30" />
            <span className="font-mono text-txt-secondary">Inner Ring: Asset Class (Equity vs Cash)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border border-acc2 bg-acc2/30" />
            <span className="font-mono text-txt-secondary">Middle Ring: Sector Diversification</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border border-gold bg-gold/30" />
            <span className="font-mono text-txt-secondary">Outer Ring: Individual Holdings & Weight</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   7. TreeSHAP Feature Attribution Waterfall for DL-10 Recommender
   ────────────────────────────────────────────────────────────────────────── */

export function ShapWaterfallChart({ attributions }: { attributions: ShapAttributionItem[] }) {
  return (
    <div className="space-y-2.5">
      <div className="text-[11px] font-mono text-txt-secondary flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-acc" />
        TreeSHAP Feature Attributions (Unbiased Layer 10 Explanation)
      </div>

      <div className="space-y-1.5">
        {attributions.map((attr) => {
          const isPos = attr.impact === "POSITIVE" || attr.contribution_pct >= 0;
          return (
            <div key={attr.feature} className="flex items-center justify-between text-xs font-mono">
              <span className="text-txt-secondary truncate max-w-[200px]">{attr.feature}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 rounded-full bg-line overflow-hidden flex">
                  {isPos ? (
                    <div
                      className="h-full bg-acc rounded-full"
                      style={{ width: `${Math.min(100, Math.abs(attr.contribution_pct) * 8)}%` }}
                    />
                  ) : (
                    <div
                      className="h-full bg-neg rounded-full ml-auto"
                      style={{ width: `${Math.min(100, Math.abs(attr.contribution_pct) * 8)}%` }}
                    />
                  )}
                </div>
                <span className={cn("w-12 text-right font-semibold", isPos ? "text-acc" : "text-neg")}>
                  {isPos ? "+" : ""}{attr.contribution_pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

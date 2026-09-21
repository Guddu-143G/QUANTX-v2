import React, { useState } from "react";
import { type GATMetricsResponse, type GATNode, type FilingCatalogItem } from "../../services/v30";
import { num, inrCompact } from "../../lib/format";

interface FinancialStatementGATViewerProps {
  data: GATMetricsResponse;
  filings: FilingCatalogItem[];
  selectedTicker: string;
  onSelectTicker: (ticker: string) => void;
  onParseCustom?: (rawText: string) => void;
  loading?: boolean;
}

export const FinancialStatementGATViewer: React.FC<FinancialStatementGATViewerProps> = ({
  data,
  filings,
  selectedTicker,
  onSelectTicker,
  onParseCustom,
  loading = false,
}) => {
  const [selectedNode, setSelectedNode] = useState<GATNode | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [customText, setCustomText] = useState("");
  const [showCustomModal, setShowCustomModal] = useState(false);

  const { metrics, accounting_graph, gat_credit_risk_embedding } = data;

  const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    INCOME: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
    FINANCING: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
    ASSET: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30" },
    LIABILITY: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30" },
    EQUITY: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  };

  const filteredNodes = accounting_graph.nodes.filter(
    (n) => activeCategory === "ALL" || n.category === activeCategory
  );

  return (
    <div className="space-y-4">
      {/* ── Top Bar: Filing Selector & Model Badge ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-line-subtle bg-bg-secondary p-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-mono uppercase text-txt-muted">Select Corporate Filing:</label>
          <select
            value={selectedTicker}
            onChange={(e) => onSelectTicker(e.target.value)}
            disabled={loading}
            className="rounded-[6px] border border-line-subtle bg-bg px-3 py-1.5 font-mono text-xs text-txt-primary outline-none focus:border-acc"
          >
            {filings.map((f) => (
              <option key={f.ticker} value={f.ticker}>
                {f.ticker} — {f.company_name} ({f.reporting_period})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded bg-acc/10 px-2 py-1 font-mono text-[10px] text-acc border border-acc/25">
            MODEL: ViT-LayoutLMv3 OCR + GAT
          </span>
          <button
            onClick={() => setShowCustomModal(true)}
            className="rounded border border-line-subtle bg-bg px-2.5 py-1 text-xs text-txt-secondary hover:text-txt-primary hover:border-acc transition-colors"
          >
            + Ingest Custom Report
          </button>
        </div>
      </div>

      {/* ── Fundamental Ratio Metrics Ribbon ── */}
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-3">
          <div className="text-[10.5px] uppercase font-mono text-txt-muted">Altman Z-Score</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-txt-primary">
              {metrics.altman_z_score.toFixed(2)}
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-bold font-mono ${
                metrics.altman_z_status === "SAFE_ZONE"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : metrics.altman_z_status === "GREY_ZONE"
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-rose-500/20 text-rose-400"
              }`}
            >
              {metrics.altman_z_status}
            </span>
          </div>
          <div className="text-[10px] text-txt-disabled mt-0.5">Cutoff: &gt; 2.99 Safe Zone</div>
        </div>

        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-3">
          <div className="text-[10.5px] uppercase font-mono text-txt-muted">Piotroski F-Score</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-emerald-400">
              {metrics.piotroski_f_score}
            </span>
            <span className="text-xs font-mono text-txt-disabled">/ 9</span>
          </div>
          <div className="text-[10px] text-txt-disabled mt-0.5">High Quality: 7 - 9</div>
        </div>

        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-3">
          <div className="text-[10.5px] uppercase font-mono text-txt-muted">DSCR (Debt Service)</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-xl font-bold font-mono ${metrics.dscr_alert ? "text-rose-400" : "text-txt-primary"}`}>
              {metrics.dscr.toFixed(2)}x
            </span>
            {metrics.dscr_alert && (
              <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-400 animate-pulse">
                ALERT &lt; 1.25x
              </span>
            )}
          </div>
          <div className="text-[10px] text-txt-disabled mt-0.5">Threshold: 1.25x Minimum</div>
        </div>

        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-3">
          <div className="text-[10.5px] uppercase font-mono text-txt-muted">Interest Coverage (ICR)</div>
          <div className="mt-1 text-xl font-bold font-mono text-txt-primary">
            {metrics.interest_coverage_ratio.toFixed(2)}x
          </div>
          <div className="text-[10px] text-txt-disabled mt-0.5">EBIT / Interest Expense</div>
        </div>

        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-3">
          <div className="text-[10.5px] uppercase font-mono text-txt-muted">Debt-to-Equity (D/E)</div>
          <div className="mt-1 text-xl font-bold font-mono text-txt-primary">
            {metrics.debt_to_equity.toFixed(2)}
          </div>
          <div className="text-[10px] text-txt-disabled mt-0.5">
            Cash/Debt: {metrics.cash_to_debt.toFixed(2)}x
          </div>
        </div>

        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-3">
          <div className="text-[10.5px] uppercase font-mono text-txt-muted">Net Profit Margin</div>
          <div className="mt-1 text-xl font-bold font-mono text-emerald-400">
            {metrics.net_profit_margin_pct.toFixed(2)}%
          </div>
          <div className="text-[10px] text-txt-disabled mt-0.5">
            Health: {metrics.health_classification}
          </div>
        </div>
      </div>

      {/* ── Accounting Dependency Graph Visualizer ── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8 rounded-[8px] border border-line-subtle bg-bg-secondary p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-line-subtle pb-3">
            <div>
              <h3 className="text-sm font-bold text-txt-primary">
                Accounting Identity Graph <span className="font-mono text-xs text-acc">𝒢_fin = (𝒱, ℰ)</span>
              </h3>
              <p className="text-xs text-txt-muted">
                Line item dependencies constrained by fundamental accounting balance laws
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1">
              {["ALL", "INCOME", "FINANCING", "ASSET", "LIABILITY", "EQUITY"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded px-2 py-1 text-[10px] font-mono transition-colors ${
                    activeCategory === cat
                      ? "bg-acc text-txt-primary font-bold"
                      : "bg-surface/40 text-txt-secondary hover:bg-surface/70"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Node Grid Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {filteredNodes.map((node) => {
              const col = categoryColors[node.category] || categoryColors.INCOME;
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`cursor-pointer rounded-[6px] border p-2.5 transition-all ${col.bg} ${col.border} ${
                    isSelected ? "ring-2 ring-acc shadow-lg scale-102" : "hover:border-acc/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-txt-muted">{node.id}</span>
                    <span className={`text-[9px] font-mono px-1 rounded ${col.text} bg-bg/50`}>
                      {node.category}
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-semibold text-txt-primary truncate">
                    {node.label}
                  </div>
                  <div className="mt-1.5 font-mono text-sm font-bold text-txt-primary">
                    ₹{inrCompact(node.val * 10000000).replace("₹", "")} <span className="text-[10px] font-normal text-txt-muted">{node.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Directed Accounting Identity Equations */}
          <div className="mt-4 rounded-[6px] border border-line-subtle bg-bg/40 p-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-txt-muted block mb-2">
              Directed Graph Attention Edges (ℰ) with Multi-Head Attention Weights (α_ij)
            </span>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-2">
              {accounting_graph.edges.map((e, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-[11px] font-mono rounded bg-surface/30 px-2.5 py-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-txt-primary">{e.source}</span>
                    <span className="text-txt-disabled">➔</span>
                    <span className="font-bold text-txt-primary">{e.target}</span>
                    <span className="text-[9px] text-txt-muted">[{e.relation}]</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-txt-secondary">Weight: {e.weight > 0 ? `+${e.weight}` : e.weight}</span>
                    <span className="rounded bg-acc/15 px-1.5 py-0.5 text-acc text-[10px] font-bold">
                      α = {e.attention_alpha.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Node Inspection & GAT Embedding Card ── */}
        <div className="xl:col-span-4 space-y-3">
          <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-txt-muted">
              {selectedNode ? `Node Inspector: ${selectedNode.id}` : "GAT Credit Risk Embedding"}
            </h4>

            {selectedNode ? (
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between border-b border-line-subtle/50 pb-1.5">
                  <span className="text-txt-muted">Line Item:</span>
                  <span className="font-bold text-txt-primary">{selectedNode.label}</span>
                </div>
                <div className="flex justify-between border-b border-line-subtle/50 pb-1.5">
                  <span className="text-txt-muted">Category:</span>
                  <span className="font-mono text-acc font-bold">{selectedNode.category}</span>
                </div>
                <div className="flex justify-between border-b border-line-subtle/50 pb-1.5">
                  <span className="text-txt-muted">Extracted Value:</span>
                  <span className="font-mono font-bold text-txt-primary">
                    ₹{num(selectedNode.val, 1)} {selectedNode.unit}
                  </span>
                </div>
                <div className="mt-3 text-[11px] text-txt-secondary">
                  Connected Edges in 𝒢_fin:
                </div>
                <div className="space-y-1 font-mono text-[10.5px]">
                  {accounting_graph.edges
                    .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                    .map((e, i) => (
                      <div key={i} className="rounded bg-bg p-1.5 text-txt-muted">
                        {e.source} ➔ {e.target} ({e.relation}) · α = {e.attention_alpha}
                      </div>
                    ))}
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="mt-2 w-full rounded bg-surface/50 py-1 text-[11px] text-txt-secondary hover:bg-surface"
                >
                  Clear Selection
                </button>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-txt-secondary">
                  Non-linear credit risk representation generated by GAT attention pooling over statement graph:
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-xs">
                  {gat_credit_risk_embedding.map((emb, idx) => (
                    <div key={idx} className="rounded bg-bg p-2 border border-line-subtle">
                      <div className="text-[10px] text-txt-muted">Dim {idx + 1}</div>
                      <div className="text-sm font-bold text-emerald-400">{emb > 0 ? `+${emb}` : emb}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded bg-bg/60 p-2.5 text-[11px] text-txt-disabled mt-2">
                  ℹ Direct feed into DL-10 Layer 5 (Fundamental Health Net) and Layer 6 (Macro Rate Sensitivity).
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-4 text-xs space-y-2">
            <div className="font-bold text-txt-primary">Filing Metadata & ViT OCR</div>
            <div className="text-txt-muted">
              <div>Company: <span className="text-txt-primary font-medium">{data.company_name}</span></div>
              <div>Sector: <span className="text-txt-primary font-medium">{data.sector}</span></div>
              <div>Period: <span className="text-txt-primary font-medium">{data.reporting_period}</span></div>
              <div>Type: <span className="text-txt-primary font-medium">{data.filing_type}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Custom Ingestion Modal ── */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[8px] border border-line bg-bg-secondary p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-txt-primary">
              Multi-Modal Statement Ingestion (ViT-LayoutLMv3 OCR)
            </h3>
            <p className="text-xs text-txt-secondary">
              Paste raw balance sheet/income statement text, annual report disclosure, or XBRL JSON to parse:
            </p>
            <textarea
              rows={6}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g. Operating Revenue: 1,50,000 Cr, EBITDA: 35,000 Cr, Interest Expense: 4,000 Cr, Total Debt: 25,000 Cr..."
              className="w-full rounded-[6px] border border-line-subtle bg-bg p-3 font-mono text-xs text-txt-primary outline-none focus:border-acc"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="rounded px-3 py-1.5 text-xs text-txt-muted hover:text-txt-primary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onParseCustom && customText.trim()) {
                    onParseCustom(customText);
                  }
                  setShowCustomModal(false);
                }}
                className="rounded bg-acc px-4 py-1.5 text-xs font-bold text-txt-primary hover:bg-acc/80"
              >
                Parse & Build Graph
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

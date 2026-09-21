import { useState, useEffect } from "react";
import {
  Activity,
  Layers,
  Sparkles,
  TrendingUp,
  Scale,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Search,
  Sliders,
  DollarSign,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  Cpu,
  BrainCircuit,
  CheckCircle2,
  XCircle,
  Clock,
  PieChart,
  BarChart3,
  Bot,
} from "lucide-react";
import { useRouter } from "../lib/router";
import { PageHeader } from "../components/layout/AppShell";
import { Badge, Button, Panel, useToast } from "../components/ui";
import { inrCompact, num } from "../lib/format";
import { cn } from "../utils/cn";
import {
  visualAnalyticsService,
  HistogramMetrics,
  SlippageDistribution,
  HeatmapMatrixResponse,
  WaterfallBridgeResponse,
  NestedDonutResponse,
  RateStatementResponse,
  CapitalTierGradingResponse,
  DL10RecommendationResponse,
} from "../services/v29";
import {
  HistogramReturnChart,
  SlippageVolumeChart,
  CorrelationHeatmapMatrix,
  SectorIntensityHeatmap,
  WaterfallBridgeChart,
  NestedDonutChart,
  ShapWaterfallChart,
} from "../components/finance/VisualAnalyticsCharts";
import { universalMarketService, InstrumentItem } from "../services/v27";

const STUDIO_TABS = [
  { id: "grading", label: "Capital-Tiered Grading", icon: Scale, badge: "PQS" },
  { id: "visuals", label: "Visual Financial Analytics", icon: BarChart3, badge: "Charts" },
  { id: "rate-wise", label: "Rate-Wise Statements & WACC", icon: TrendingUp, badge: "Macro" },
  { id: "dl10", label: "DL-10 Stock Recommender", icon: BrainCircuit, badge: "10-Layer" },
] as const;

type StudioTabId = (typeof STUDIO_TABS)[number]["id"];

export default function VisualDL10Studio() {
  const { push } = useToast();
  const { navigate } = useRouter();

  const [activeTab, setActiveTab] = useState<StudioTabId>("grading");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Capital scale
  const [userAum, setUserAum] = useState<number>(104200000.0); // 10.42 Cr default Institutional

  // Data states
  const [grading, setGrading] = useState<CapitalTierGradingResponse | null>(null);
  const [histograms, setHistograms] = useState<HistogramMetrics | null>(null);
  const [slippage, setSlippage] = useState<SlippageDistribution | null>(null);
  const [heatmaps, setHeatmaps] = useState<HeatmapMatrixResponse | null>(null);
  const [waterfall, setWaterfall] = useState<WaterfallBridgeResponse | null>(null);
  const [donut, setDonut] = useState<NestedDonutResponse | null>(null);
  const [rateStatements, setRateStatements] = useState<RateStatementResponse | null>(null);

  // Rate shock state (bps)
  const [rateShockBps, setRateShockBps] = useState<number>(100.0);

  // DL-10 Recommender state
  const [selectedTicker, setSelectedTicker] = useState("RELIANCE");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<InstrumentItem[]>([]);
  const [recommendation, setRecommendation] = useState<DL10RecommendationResponse | null>(null);
  const [analyzingDL10, setAnalyzingDL10] = useState(false);

  // Visual sub-tab
  const [visualSubTab, setVisualSubTab] = useState<"histogram" | "slippage" | "heatmaps" | "sectors" | "waterfall" | "donut">("histogram");

  const loadAllData = async () => {
    try {
      setRefreshing(true);
      const [gr, hist, slip, hm, wf, nd, rs, rec] = await Promise.all([
        visualAnalyticsService.getPortfolioGrading({ aum_inr: userAum }),
        visualAnalyticsService.getHistograms(),
        visualAnalyticsService.getSlippageDist(),
        visualAnalyticsService.getHeatmaps(),
        visualAnalyticsService.getWaterfall(),
        visualAnalyticsService.getNestedDonut({ total_aum: userAum }),
        visualAnalyticsService.getRateWiseStatements({ rate_shock_bps: rateShockBps }),
        visualAnalyticsService.recommendDL10({ ticker: selectedTicker, user_aum: userAum }),
      ]);

      setGrading(gr);
      setHistograms(hist);
      setSlippage(slip);
      setHeatmaps(hm);
      setWaterfall(wf);
      setDonut(nd);
      setRateStatements(rs);
      setRecommendation(rec);
    } catch (err: any) {
      push({ title: "Failed to load v29 analytics", body: err.message, tone: "neg" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [userAum]);

  const handleRateShockChange = async (newShockBps: number) => {
    setRateShockBps(newShockBps);
    try {
      const rs = await visualAnalyticsService.getRateWiseStatements({ rate_shock_bps: newShockBps });
      setRateStatements(rs);
    } catch (err: any) {
      push({ title: "Rate Shock calculation failed", body: err.message, tone: "neg" });
    }
  };

  const handleRunDL10 = async (ticker: string) => {
    try {
      setAnalyzingDL10(true);
      setSelectedTicker(ticker);
      const rec = await visualAnalyticsService.recommendDL10({ ticker, user_aum: userAum });
      setRecommendation(rec);
      push({ title: `DL-10 analysis complete: ${ticker}`, body: `Decision Tag: [${rec.decision}]`, tone: "pos" });
    } catch (err: any) {
      push({ title: "DL-10 evaluation failed", body: err.message, tone: "neg" });
    } finally {
      setAnalyzingDL10(false);
    }
  };

  const handleSearchSymbols = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await universalMarketService.searchInstruments({ query: q, limit: 6 });
      setSearchResults(res.results || []);
    } catch {
      // Fallback
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-acc border-t-transparent" />
        <span className="font-mono text-xs text-txt-muted">Initializing QUANTX v29 Visual & DL-10 Engine…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visual Financial Analytics & DL-10 Studio"
        subtitle="Version 29 Master Specification: Empirical Histograms, Rate-Wise Statements, Capital-Tiered Grading & 10-Layer Deep Learning Recommender"
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={Bot}
              onClick={() => navigate("/autonomous-v30")}
            >
              Autonomous AI (v30)
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={Layers}
              onClick={() => navigate("/world-model-v31")}
            >
              World Model (v31)
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={RefreshCw}
              loading={refreshing}
              onClick={() => loadAllData()}
            >
              Refresh Feeds
            </Button>
            <Badge tone="pos" size="sm">v29 PRODUCTION</Badge>
          </div>
        }
      />

      {/* Top Banner: Macro Benchmark Rate Curves & Capital Scale Selector */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Macro Rate 1: RBI Repo */}
        <div className="rounded-lg border border-line bg-card p-3 shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-txt-muted font-mono">
            <span>RBI REPO RATE</span>
            <Badge size="xs" tone="pos">LIVE</Badge>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-acc">
              {rateStatements ? (rateStatements.rate_curve.rbi_repo_rate * 100).toFixed(2) : "6.50"}%
            </span>
            <span className="text-[10px] text-txt-secondary font-mono">Policy Baseline</span>
          </div>
        </div>

        {/* Macro Rate 2: 10Y G-Sec */}
        <div className="rounded-lg border border-line bg-card p-3 shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-txt-muted font-mono">
            <span>10Y G-SEC YIELD</span>
            <Badge size="xs" tone="warn">BENCHMARK</Badge>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-gold">
              {rateStatements ? (rateStatements.rate_curve.ten_year_gsec_yield * 100).toFixed(2) : "7.10"}%
            </span>
            <span className="text-[10px] text-txt-secondary font-mono">Risk-Free Rf</span>
          </div>
        </div>

        {/* Macro Rate 3: MIBOR */}
        <div className="rounded-lg border border-line bg-card p-3 shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-txt-muted font-mono">
            <span>MIBOR OVERNIGHT</span>
            <Badge size="xs" tone="neutral">INTERBANK</Badge>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-acc2">
              {rateStatements ? (rateStatements.rate_curve.mibor_overnight_rate * 100).toFixed(2) : "6.75"}%
            </span>
            <span className="text-[10px] text-txt-secondary font-mono">Floating Debt Base</span>
          </div>
        </div>

        {/* Capital Scale Selector */}
        <div className="rounded-lg border border-line bg-card p-3 shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-txt-muted font-mono">
            <span>CAPITAL SCALE MANDATE</span>
            <Badge size="xs" tone={userAum > 5000000 ? "pos" : userAum > 500000 ? "warn" : "neutral"}>
              {grading?.tier_label || "Active Tier"}
            </Badge>
          </div>
          <div className="mt-1">
            <select
              value={userAum}
              onChange={(e) => setUserAum(Number(e.target.value))}
              aria-label="Select Capital Scale Tier"
              className="w-full rounded border border-line bg-bg px-2 py-1 text-xs font-mono text-txt-primary focus:border-acc focus:outline-none"
            >
              <option value={350000}>Retail Micro (&lt; ₹5 Lakhs)</option>
              <option value={2500000}>High Net Worth (₹25 Lakhs / HNI)</option>
              <option value={104200000}>Institutional Mandate (₹10.42 Cr)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Studio Tabs */}
      <div className="flex items-center gap-2 border-b border-line pb-1 overflow-x-auto">
        {STUDIO_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-t-md px-3.5 py-2 text-xs font-mono transition-colors border-b-2",
                isActive
                  ? "border-acc text-acc bg-acc/10 font-semibold"
                  : "border-transparent text-txt-muted hover:text-txt-primary hover:bg-card/50"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              <span className={cn("rounded px-1 text-[10px]", isActive ? "bg-acc/20 text-acc" : "bg-line text-txt-muted")}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          TAB 1: CAPITAL-TIERED PORTFOLIO EVALUATION & GRADING (PQS)
         ────────────────────────────────────────────────────────────────── */}
      {activeTab === "grading" && grading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Grade S/A/B/C/D Card */}
            <Panel level={2} className="flex flex-col items-center justify-center p-6 text-center">
              <div className="text-xs font-mono text-txt-muted uppercase">Portfolio Quality Grade</div>
              <div
                className={cn(
                  "my-4 flex h-24 w-24 items-center justify-center rounded-full border-4 text-4xl font-black font-mono shadow-2xl transition-transform hover:scale-105",
                  grading.grade === "S"
                    ? "border-acc bg-acc/15 text-acc shadow-acc/30"
                    : grading.grade === "A"
                    ? "border-acc2 bg-acc2/15 text-acc2 shadow-acc2/30"
                    : grading.grade === "B"
                    ? "border-gold bg-gold/15 text-gold shadow-gold/30"
                    : grading.grade === "C"
                    ? "border-warn bg-warn/15 text-warn shadow-warn/30"
                    : "border-neg bg-neg/15 text-neg shadow-neg/30"
                )}
              >
                {grading.grade}
              </div>
              <div className="text-sm font-semibold text-txt-primary">
                PQS Score: <span className="font-mono text-acc">{grading.pqs_score} / 100</span>
              </div>
              <p className="mt-2 text-xs text-txt-secondary leading-relaxed px-4">
                {grading.grade_narrative}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge size="xs" tone="pos">{grading.tier_label}</Badge>
                <Badge size="xs" tone="neutral">Max Pos: {(grading.tier_max_pos_cap * 100).toFixed(0)}%</Badge>
                <Badge size="xs" tone="neutral">Max Sector: {(grading.tier_max_sector_cap * 100).toFixed(0)}%</Badge>
              </div>
            </Panel>

            {/* 5-Factor Sub-Score Breakdown */}
            <Panel level={2} title="Portfolio Quality Scorecard (PQS Breakdown)" className="lg:col-span-2">
              <div className="space-y-3 p-4">
                {Object.entries(grading.sub_scores).map(([k, score]) => {
                  const labelMap: Record<string, string> = {
                    risk: "Risk & Drawdown Defense (30%)",
                    diversification: "Diversification & Tier Cap Adherence (25%)",
                    fundamentals: "Fundamental Quality (Altman Z / Piotroski F) (20%)",
                    rate: "Macro Interest Rate & DSCR Resilience (15%)",
                    efficiency: "Execution & Fee Drag Efficiency (10%)",
                  };
                  return (
                    <div key={k} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-mono text-txt-secondary">{labelMap[k] || k}</span>
                        <span className="font-mono font-semibold text-txt-primary">{score} / 100</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-line overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            score >= 80 ? "bg-acc" : score >= 65 ? "bg-gold" : "bg-neg"
                          )}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                <div className="mt-4 pt-3 border-t border-line grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="rounded bg-card/60 p-2 border border-line">
                    <div className="text-txt-muted text-[10px]">Herfindahl-Hirschman Index</div>
                    <div className="text-txt-primary font-semibold mt-0.5">
                      {grading.concentration_penalties.hhi_index} / Target: {grading.concentration_penalties.target_hhi}
                    </div>
                  </div>
                  <div className="rounded bg-card/60 p-2 border border-line">
                    <div className="text-txt-muted text-[10px]">Holdings Evaluated</div>
                    <div className="text-acc font-semibold mt-0.5">
                      {grading.holdings_evaluated_count} Active Demat Positions
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          </div>

          {/* Actionable Recommendations & Concentration Alerts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Actionable Recommendations */}
            <Panel level={2} title="Actionable Institutional Recommendations">
              <div className="space-y-2 p-4">
                {grading.actionable_recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 rounded border border-line bg-card/40 p-2.5 text-xs text-txt-primary">
                    <CheckCircle2 className="h-4 w-4 text-acc shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Concentration Cap Breaches */}
            <Panel level={2} title="Single Position & Sector Cap Surveillance">
              <div className="p-4 space-y-3">
                {grading.concentration_penalties.single_position_breaches.length === 0 &&
                grading.concentration_penalties.sector_breaches.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <ShieldCheck className="h-8 w-8 text-acc mb-2" />
                    <div className="text-xs font-semibold text-txt-primary">All Positions Within Mandate</div>
                    <div className="text-[11px] text-txt-muted">Zero single-stock or sector breaches for {grading.tier_label}.</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {grading.concentration_penalties.single_position_breaches.map((b) => (
                      <div key={b.ticker} className="flex items-center justify-between rounded border border-warn/30 bg-warn/10 p-2.5 text-xs">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-warn" />
                          <span className="font-semibold text-txt-primary">{b.ticker}</span>
                        </div>
                        <div className="font-mono text-txt-secondary">
                          {b.actual_weight}% vs Cap {b.cap_weight}% (<span className="text-warn">+{b.excess_pct}%</span>)
                        </div>
                      </div>
                    ))}
                    {grading.concentration_penalties.sector_breaches.map((sb) => (
                      <div key={sb.sector} className="flex items-center justify-between rounded border border-neg/30 bg-neg/10 p-2.5 text-xs">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-neg" />
                          <span className="font-semibold text-txt-primary">Sector: {sb.sector}</span>
                        </div>
                        <div className="font-mono text-txt-secondary">
                          {sb.actual_weight}% vs Cap {sb.cap_weight}% (<span className="text-neg">+{sb.excess_pct}%</span>)
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          TAB 2: VISUAL FINANCIAL ANALYTICS SUITE
         ────────────────────────────────────────────────────────────────── */}
      {activeTab === "visuals" && (
        <div className="space-y-6">
          {/* Sub-nav buttons */}
          <div className="flex items-center gap-2 border-b border-line pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setVisualSubTab("histogram")}
              className={cn("rounded px-3 py-1.5 text-xs font-mono border transition-colors", visualSubTab === "histogram" ? "bg-acc/15 border-acc text-acc" : "border-line text-txt-muted")}
            >
              Return Histogram & Moments
            </button>
            <button
              type="button"
              onClick={() => setVisualSubTab("slippage")}
              className={cn("rounded px-3 py-1.5 text-xs font-mono border transition-colors", visualSubTab === "slippage" ? "bg-acc/15 border-acc text-acc" : "border-line text-txt-muted")}
            >
              Trade Slippage Distribution
            </button>
            <button
              type="button"
              onClick={() => setVisualSubTab("heatmaps")}
              className={cn("rounded px-3 py-1.5 text-xs font-mono border transition-colors", visualSubTab === "heatmaps" ? "bg-acc/15 border-acc text-acc" : "border-line text-txt-muted")}
            >
              Correlation Matrix Heatmap
            </button>
            <button
              type="button"
              onClick={() => setVisualSubTab("sectors")}
              className={cn("rounded px-3 py-1.5 text-xs font-mono border transition-colors", visualSubTab === "sectors" ? "bg-acc/15 border-acc text-acc" : "border-line text-txt-muted")}
            >
              11 GICS Sector Rotation
            </button>
            <button
              type="button"
              onClick={() => setVisualSubTab("waterfall")}
              className={cn("rounded px-3 py-1.5 text-xs font-mono border transition-colors", visualSubTab === "waterfall" ? "bg-acc/15 border-acc text-acc" : "border-line text-txt-muted")}
            >
              P&L Waterfall Bridge
            </button>
            <button
              type="button"
              onClick={() => setVisualSubTab("donut")}
              className={cn("rounded px-3 py-1.5 text-xs font-mono border transition-colors", visualSubTab === "donut" ? "bg-acc/15 border-acc text-acc" : "border-line text-txt-muted")}
            >
              Multi-Tier Nested Donut
            </button>
          </div>

          {/* Sub-Views */}
          {visualSubTab === "histogram" && histograms && (
            <Panel level={2} title="Daily Return Empirical & Parametric Distribution (Normal vs Student-t)">
              <div className="p-4">
                <HistogramReturnChart metrics={histograms} />
              </div>
            </Panel>
          )}

          {visualSubTab === "slippage" && slippage && (
            <Panel level={2} title="Execution Slippage Distribution & Volume Impact Buckets">
              <div className="p-4">
                <SlippageVolumeChart slippage={slippage} />
              </div>
            </Panel>
          )}

          {visualSubTab === "heatmaps" && heatmaps && (
            <Panel level={2} title="Pairwise Pearson & Kendall-tau Correlation Heatmap Matrix">
              <div className="p-4">
                <CorrelationHeatmapMatrix heatmap={heatmaps} />
              </div>
            </Panel>
          )}

          {visualSubTab === "sectors" && heatmaps && (
            <Panel level={2} title="11 GICS Sector Rotation Intensity & Relative Strength">
              <div className="p-4">
                <SectorIntensityHeatmap sectors={heatmaps.sector_rotation_intensity} />
              </div>
            </Panel>
          )}

          {visualSubTab === "waterfall" && waterfall && (
            <Panel level={2} title="P&L Attribution Waterfall Bridge (Gross Alpha → Net Realized P&L)">
              <div className="p-4">
                <WaterfallBridgeChart waterfall={waterfall} />
              </div>
            </Panel>
          )}

          {visualSubTab === "donut" && donut && (
            <Panel level={2} title="3-Tier Nested Donut Allocation Model with Yield Overlay">
              <div className="p-4">
                <NestedDonutChart donut={donut} />
              </div>
            </Panel>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          TAB 3: RATE-WISE PORTFOLIO STATEMENTS & WACC SENSITIVITY
         ────────────────────────────────────────────────────────────────── */}
      {activeTab === "rate-wise" && rateStatements && (
        <div className="space-y-6">
          {/* Rate Shock Controls & Aggregate Impact */}
          <Panel level={2} className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-txt-primary">Macro Rate Shock Simulator (Δr)</div>
                <div className="text-xs text-txt-muted">Stress test WACC, interest expenses, and intrinsic DCF fair values under interest rate hikes.</div>
              </div>

              {/* Slider for Rate Shock */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-xs font-mono text-txt-secondary">Shock:</span>
                <input
                  type="range"
                  min="-100"
                  max="250"
                  step="25"
                  value={rateShockBps}
                  onChange={(e) => handleRateShockChange(Number(e.target.value))}
                  aria-label="Rate Shock Slider in Basis Points"
                  className="accent-acc h-1.5 w-44 rounded bg-line cursor-pointer"
                />
                <span className={cn("font-mono text-xs font-semibold w-16", rateShockBps > 0 ? "text-warn" : "text-acc")}>
                  {rateShockBps > 0 ? "+" : ""}{rateShockBps} bps
                </span>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-line pt-3">
              <div>
                <div className="text-[10px] text-txt-muted font-mono uppercase">Base Portfolio WACC</div>
                <div className="text-base font-bold font-mono text-acc2">
                  {rateStatements.portfolio_weighted_wacc_base}%
                </div>
              </div>

              <div>
                <div className="text-[10px] text-txt-muted font-mono uppercase">Shocked WACC (+{rateShockBps}bps)</div>
                <div className="text-base font-bold font-mono text-warn">
                  {rateStatements.portfolio_weighted_wacc_shocked}%
                </div>
              </div>

              <div>
                <div className="text-[10px] text-txt-muted font-mono uppercase">WACC Expansion Delta</div>
                <div className="text-base font-bold font-mono text-txt-primary">
                  +{rateStatements.portfolio_wacc_delta_bps} bps
                </div>
              </div>

              <div>
                <div className="text-[10px] text-txt-muted font-mono uppercase">Credit Risk Flags (DSCR &lt; 1.25x)</div>
                <div className={cn("text-base font-bold font-mono", rateStatements.high_credit_risk_count > 0 ? "text-neg" : "text-acc")}>
                  {rateStatements.high_credit_risk_count} Holdings at Risk
                </div>
              </div>
            </div>
          </Panel>

          {/* Holdings Rate Statements Table */}
          <Panel level={2} title="Holding-by-Holding Rate Sensitivity & DCF Delta">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-line text-txt-muted font-mono text-[10px] uppercase">
                    <th className="p-3">Ticker / Sector</th>
                    <th className="p-3">Weight</th>
                    <th className="p-3">Beta</th>
                    <th className="p-3">Cost Equity (Re)</th>
                    <th className="p-3">Cost Debt (Rd)</th>
                    <th className="p-3">Base WACC</th>
                    <th className="p-3">Shocked WACC</th>
                    <th className="p-3">DSCR (Base → Shock)</th>
                    <th className="p-3">DCF Fair Value</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/40">
                  {rateStatements.holdings_statements.map((h) => (
                    <tr key={h.ticker} className="hover:bg-card/40 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-txt-primary">{h.ticker}</div>
                        <div className="text-[10px] text-txt-muted">{h.sector}</div>
                      </td>
                      <td className="p-3 font-mono">{h.weight_pct}%</td>
                      <td className="p-3 font-mono">{h.beta}</td>
                      <td className="p-3 font-mono text-acc2">{h.cost_of_equity_re}%</td>
                      <td className="p-3 font-mono text-txt-secondary">{h.cost_of_debt_rd}%</td>
                      <td className="p-3 font-mono text-txt-primary">{h.base_wacc}%</td>
                      <td className="p-3 font-mono text-warn font-semibold">
                        {h.shocked_wacc}% (+{h.wacc_delta_bps} bps)
                      </td>
                      <td className="p-3 font-mono">
                        <span>{h.dscr_base}x</span> →{" "}
                        <span className={cn("font-semibold", h.credit_risk_flag ? "text-neg" : "text-acc")}>
                          {h.dscr_shocked}x
                        </span>
                      </td>
                      <td className="p-3 font-mono">
                        <div>₹{h.dcf_intrinsic_fair_value}</div>
                        <div className={cn("text-[10px]", h.fair_value_delta_pct >= 0 ? "text-acc" : "text-neg")}>
                          {h.fair_value_delta_pct > 0 ? "+" : ""}{h.fair_value_delta_pct}%
                        </div>
                      </td>
                      <td className="p-3">
                        {h.credit_risk_flag ? (
                          <Badge size="xs" tone="neg">DSCR RISK</Badge>
                        ) : (
                          <Badge size="xs" tone="pos">RESILIENT</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          TAB 4: 10-LAYER DEEP LEARNING (DL-10) STOCK PARAMETER RECOMMENDER
         ────────────────────────────────────────────────────────────────── */}
      {activeTab === "dl10" && (
        <div className="space-y-6">
          {/* Ticker Search & Preset Bar */}
          <Panel level={2} className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-txt-muted" />
                <input
                  type="text"
                  placeholder="Search 5,000+ Universe Stocks…"
                  value={searchQuery}
                  onChange={(e) => handleSearchSymbols(e.target.value)}
                  className="w-full rounded border border-line bg-bg pl-9 pr-3 py-1.5 text-xs font-mono text-txt-primary focus:border-acc focus:outline-none"
                />
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded border border-line bg-[#0b1119] shadow-xl">
                    {searchResults.map((r) => (
                      <button
                        key={r.symbol}
                        type="button"
                        onClick={() => {
                          handleRunDL10(r.symbol);
                          setSearchResults([]);
                          setSearchQuery("");
                        }}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-card border-b border-line/30 last:border-0"
                      >
                        <span className="font-mono font-semibold text-acc">{r.symbol}</span>
                        <span className="text-[10px] text-txt-muted">{r.sector || r.exchange}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-mono text-txt-muted">Presets:</span>
                {["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "LT", "ITC", "SBIN"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleRunDL10(s)}
                    className={cn(
                      "rounded px-2.5 py-1 text-xs font-mono border transition-colors",
                      selectedTicker === s ? "bg-acc/15 border-acc text-acc font-semibold" : "border-line text-txt-secondary hover:text-txt-primary"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </Panel>

          {/* Recommendation Output Card & SHAP Attribution */}
          {recommendation && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Output Parameters Card */}
              <Panel level={2} className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono text-txt-muted">{recommendation.sector}</div>
                    <div className="text-xl font-bold font-mono text-txt-primary">{recommendation.ticker}</div>
                  </div>
                  <Badge
                    size="md"
                    tone={
                      recommendation.decision === "STRONG_BUY" || recommendation.decision === "BUY"
                        ? "pos"
                        : recommendation.decision === "HOLD"
                        ? "warn"
                        : "neg"
                    }
                  >
                    {recommendation.decision}
                  </Badge>
                </div>

                <div className="text-xs text-txt-secondary leading-relaxed border-l-2 border-acc pl-2.5 italic">
                  "{recommendation.decision_reason}"
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-line pt-3 text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-txt-muted">Current Price</div>
                    <div className="text-sm font-semibold text-txt-primary">₹{recommendation.current_price}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-txt-muted">Target Price (TFT 90th)</div>
                    <div className="text-sm font-semibold text-acc">₹{recommendation.target_price}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-txt-muted">Stop Loss (2x ATR)</div>
                    <div className="text-sm font-semibold text-neg">₹{recommendation.stop_loss}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-txt-muted">Risk-to-Reward</div>
                    <div className="text-sm font-semibold text-gold">{recommendation.risk_reward_ratio}x</div>
                  </div>
                </div>

                <div className="rounded bg-card/60 p-3 border border-line space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-txt-muted">Recommended Allocation:</span>
                    <span className="text-acc font-semibold">{recommendation.recommended_alloc_pct}%</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-txt-secondary">
                    <span>Tier Single Position Cap:</span>
                    <span>{recommendation.max_position_cap_pct}%</span>
                  </div>
                </div>

                {/* TreeSHAP Explanation */}
                <div className="border-t border-line pt-3">
                  <ShapWaterfallChart attributions={recommendation.shap_attributions} />
                </div>
              </Panel>

              {/* 10-Layer Neural Decision Stepper */}
              <Panel level={2} title="10-Layer Deep Learning Decision Pipeline (DL-10 Trace)" className="lg:col-span-2">
                <div className="p-4 space-y-2.5 max-h-[560px] overflow-y-auto">
                  {recommendation.layer_trace.map((step) => (
                    <div
                      key={step.layer}
                      className={cn(
                        "rounded border p-3 text-xs transition-colors",
                        step.status === "PASSED"
                          ? "border-line bg-card/40"
                          : step.status === "SCALED_DOWN"
                          ? "border-warn/30 bg-warn/10"
                          : "border-neg/30 bg-neg/10"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-acc font-bold">L{step.layer}:</span>
                          <span className="font-semibold text-txt-primary">{step.layer_name}</span>
                        </div>
                        <Badge
                          size="xs"
                          tone={step.status === "PASSED" ? "pos" : step.status === "SCALED_DOWN" ? "warn" : "neg"}
                        >
                          {step.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[11px] text-txt-secondary leading-relaxed">
                        {step.summary}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-mono text-txt-muted">
                        {Object.entries(step.metrics).map(([mk, mv]) => (
                          <span key={mk} className="rounded bg-line/60 px-1.5 py-0.5">
                            {mk}: {typeof mv === "number" ? mv.toFixed(2) : String(mv)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

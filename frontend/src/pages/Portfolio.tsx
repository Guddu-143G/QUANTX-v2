import React, { useEffect, useMemo, useState, Fragment } from "react";
import {
  Download,
  Scale,
  Sparkles,
  Radio,
  Plus,
  RefreshCw,
  Layers,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  DollarSign,
  Activity,
  FileText,
  ChevronDown,
  ChevronRight,
  Scissors,
  Sliders,
  CheckCircle2,
  Trash2,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Bot,
  Lock,
  Cpu,
  Dna,
} from "lucide-react";
import { PageHeader } from "../components/layout/AppShell";
import {
  Badge,
  Button,
  Panel,
  Skeleton,
  TableSkeleton,
  SkeletonLoader,
  useToast,
} from "../components/ui";
import { QuantXErrorBoundary } from "../components/common/ErrorBoundary";
import { useIsMounted } from "../hooks/useIsMounted";
import { TickerCell } from "../components/finance";
import { inrCompact, num } from "../lib/format";
import { cn } from "../utils/cn";
import { Link, useRouter } from "../lib/router";
import {
  portfolioLedgerService,
  type PortfolioLedgerSummary,
  type TaxLot,
  type TaxLossHarvestingResponse,
  type BrinsonAttributionResponse,
  type DriftSurveillanceResponse,
  type LedgerTransaction,
  type RecordTransactionPayload,
  type CorporateActionPayload,
  type MarginHealthResponse,
} from "../services/v28";
import { universalMarketService, type InstrumentItem } from "../services/v27";

const TABS = [
  { id: "holdings", label: "Holdings & Tax-Lots", icon: Layers },
  { id: "transactions", label: "Trade Entry & Audit", icon: Plus },
  { id: "brinson", label: "Brinson-Fachler Attribution", icon: TrendingUp },
  { id: "drift", label: "Drift Surveillance", icon: Sliders },
  { id: "harvesting", label: "Tax-Loss & Margin", icon: Scissors },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Portfolio() {
  const { navigate } = useRouter();
  const { push } = useToast();
  const isMounted = useIsMounted();

  const [activeTab, setActiveTab] = useState<TabId>("holdings");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Core Ledger Data
  const [summary, setSummary] = useState<PortfolioLedgerSummary | null>(null);
  const [taxLots, setTaxLots] = useState<TaxLot[]>([]);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [brinson, setBrinson] = useState<BrinsonAttributionResponse | null>(null);
  const [drift, setDrift] = useState<DriftSurveillanceResponse | null>(null);
  const [harvesting, setHarvesting] = useState<TaxLossHarvestingResponse | null>(null);
  const [margin, setMargin] = useState<MarginHealthResponse | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  // UI state
  const [expandedTickers, setExpandedTickers] = useState<Record<string, boolean>>({});
  const [showTxModal, setShowTxModal] = useState(false);
  const [showCorpModal, setShowCorpModal] = useState(false);

  // Transaction form state
  const [txSymbol, setTxSymbol] = useState("RELIANCE");
  const [txAction, setTxAction] = useState<"BUY" | "SELL" | "SHORT" | "COVER" | "CASH_DEPOSIT" | "CASH_WITHDRAWAL">("BUY");
  const [txQty, setTxQty] = useState<number>(100);
  const [txPrice, setTxPrice] = useState<number>(2950.0);
  const [txStrategy, setTxStrategy] = useState<"HIFO" | "FIFO" | "LIFO">("HIFO");
  const [txNotes, setTxNotes] = useState("");
  const [symbolSuggestions, setSymbolSuggestions] = useState<InstrumentItem[]>([]);
  const [searchingSymbols, setSearchingSymbols] = useState(false);

  // Corporate action form state
  const [corpSymbol, setCorpSymbol] = useState("RELIANCE");
  const [corpAction, setCorpAction] = useState<"SPLIT" | "BONUS" | "DIVIDEND">("SPLIT");
  const [corpRatio, setCorpRatio] = useState<number>(2.0);
  const [corpCash, setCorpCash] = useState<number>(10.0);
  const [corpNotes, setCorpNotes] = useState("");

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

  // Fetch all ledger data with robust resilience and real-time synchronization
  const loadAllData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [sumRes, lotsRes, txRes, brinsonRes, driftRes, harvestRes, marginRes] = await Promise.allSettled([
        portfolioLedgerService.getSummary(),
        portfolioLedgerService.getTaxLots(),
        portfolioLedgerService.getTransactions(50),
        portfolioLedgerService.getBrinsonAttribution(),
        portfolioLedgerService.getDriftSurveillance(),
        portfolioLedgerService.getTaxLossHarvesting(),
        portfolioLedgerService.getMarginHealth(),
      ]);

      if (sumRes.status === "fulfilled" && sumRes.value) {
        setSummary(sumRes.value);
      }
      if (lotsRes.status === "fulfilled" && lotsRes.value) {
        setTaxLots(lotsRes.value.tax_lots || []);
      }
      if (txRes.status === "fulfilled" && txRes.value) {
        setTransactions(txRes.value.transactions || []);
      }
      if (brinsonRes.status === "fulfilled" && brinsonRes.value) {
        setBrinson(brinsonRes.value);
      }
      if (driftRes.status === "fulfilled" && driftRes.value) {
        setDrift(driftRes.value);
      }
      if (harvestRes.status === "fulfilled" && harvestRes.value) {
        setHarvesting(harvestRes.value);
      }
      if (marginRes.status === "fulfilled" && marginRes.value) {
        setMargin(marginRes.value);
      }
    } catch (err: any) {
      if (!silent) {
        push({
          title: "Ledger Sync Warning",
          body: err.message || "Failed to poll portfolio ledger state.",
          tone: "neg",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const ws = portfolioLedgerService.connectPortfolioLiveWS((msg) => {
      if (msg && msg.event_type === "PORTFOLIO_LEDGER_UPDATE" && msg.data) {
        setWsConnected(true);
        const { summary: liveSummary, margin: liveMargin, drift: liveDrift } = msg.data;
        if (liveSummary) {
          setSummary(liveSummary);
        }
        if (liveMargin) {
          setMargin(liveMargin);
        }
        if (liveDrift) {
          setDrift(liveDrift);
        }
      }
    });
    if (ws) {
      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => setWsConnected(false);
      ws.onerror = () => setWsConnected(false);
    }
    const interval = setInterval(() => {
      loadAllData(true);
    }, 4000);
    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, []);

  // Symbol auto-complete search when typing in transaction modal
  useEffect(() => {
    if (!txSymbol || txAction === "CASH_DEPOSIT" || txAction === "CASH_WITHDRAWAL") {
      setSymbolSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingSymbols(true);
      try {
        const res = await universalMarketService.searchInstruments({
          query: txSymbol,
          limit: 6,
        });
        setSymbolSuggestions(res.results || []);
        // If exact match found, update price
        const exact = res.results.find((r) => r.tradingsymbol === txSymbol.toUpperCase());
        if (exact && exact.last_price > 0) {
          setTxPrice(exact.last_price);
        }
      } catch {
        // quiet fallback
      } finally {
        setSearchingSymbols(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [txSymbol, txAction]);

  // Handle manual transaction submit
  const handleRecordTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: RecordTransactionPayload = {
        ticker: txAction.startsWith("CASH") ? "INR" : txSymbol.toUpperCase(),
        action: txAction,
        qty: txQty,
        price: txPrice,
        strategy: txStrategy,
        notes: txNotes || `Manual ${txAction} execution via v28 Portfolio Terminal`,
      };
      await portfolioLedgerService.recordTransaction(payload);
      push({
        title: "Transaction Logged",
        body: `Successfully recorded ${txAction} of ${txQty} ${payload.ticker} at ₹${num(txPrice, 2)}.`,
        tone: "pos",
      });
      setShowTxModal(false);
      loadAllData(true);
    } catch (err: any) {
      push({
        title: "Transaction Failed",
        body: err.message || "Could not log transaction.",
        tone: "neg",
      });
    }
  };

  // Handle corporate action submit
  const handleCorporateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: CorporateActionPayload = {
        ticker: corpSymbol.toUpperCase(),
        action_type: corpAction,
        ratio: corpRatio,
        cash_amount: corpCash,
        notes: corpNotes || `Applied ${corpAction} via corporate ledger`,
      };
      await portfolioLedgerService.applyCorporateAction(payload);
      push({
        title: "Corporate Action Applied",
        body: `Reconciled ${corpAction} for ${corpSymbol.toUpperCase()} across inventory tax-lots.`,
        tone: "pos",
      });
      setShowCorpModal(false);
      loadAllData(true);
    } catch (err: any) {
      push({
        title: "Corporate Action Failed",
        body: err.message || "Could not apply corporate action.",
        tone: "neg",
      });
    }
  };

  // Handle Zero-State Reset
  const handleResetLedger = async () => {
    if (!window.confirm("Purge all lots and transactions to reset to 0.00 zero-state?")) return;
    try {
      await portfolioLedgerService.resetLedger();
      push({
        title: "Ledger Purged",
        body: "Portfolio successfully reset to zero holdings and empty cash balance.",
        tone: "neu",
      });
      loadAllData(true);
    } catch (err: any) {
      push({ title: "Reset Failed", body: err.message, tone: "neg" });
    }
  };

  // Handle Baseline Seed
  const handleSeedBaseline = async () => {
    try {
      await portfolioLedgerService.seedBaseline(104200000.0);
      push({
        title: "Institutional Mandate Seeded",
        body: "Seeded 12 top-tier NSE equities with institutional tax lots and ₹25L cash buffer.",
        tone: "pos",
      });
      loadAllData(true);
    } catch (err: any) {
      push({ title: "Seed Failed", body: err.message, tone: "neg" });
    }
  };

  const toggleExpand = (ticker: string) => {
    setExpandedTickers((prev) => ({ ...prev, [ticker]: !prev[ticker] }));
  };

  // Live estimated fees for modal
  const estimatedNotional = (txQty || 0) * (txPrice || 0);
  const estimatedStt = txAction.startsWith("CASH") ? 0 : Math.round(estimatedNotional * 0.001 * 100) / 100;
  const estimatedBrokerage = txAction.startsWith("CASH") ? 0 : Math.min(20, Math.round(estimatedNotional * 0.0003 * 100) / 100);
  const estimatedTurnover = txAction.startsWith("CASH") ? 0 : Math.round(estimatedNotional * 0.0000345 * 100) / 100;
  const estimatedGst = txAction.startsWith("CASH") ? 0 : Math.round((estimatedBrokerage + estimatedTurnover) * 0.18 * 100) / 100;
  const estimatedTotalFees = estimatedStt + estimatedBrokerage + estimatedTurnover + estimatedGst;

  const isZeroState = !summary || summary.is_zero_state || ((summary.holdings?.length ?? 0) === 0 && transactions.length === 0);

  const downloadAuditStatement = () => {
    const data = {
      platform: "QUANTX Institutional Finance Platform",
      ledgerVersion: "v28 Master Institutional Ledger",
      timestamp: new Date().toISOString(),
      summary,
      taxLots,
      transactions,
      attribution: brinson,
      driftSurveillance: drift,
      marginHealth: margin,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quantx-ledger-audit-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    push({
      title: "Ledger Audit Exported",
      body: `Complete tax-lot and transaction ledger exported (${taxLots.length} tax lots, ${transactions.length} transactions).`,
      tone: "pos",
    });
  };

  if (!isMounted) {
    return <SkeletonLoader height="600px" title="Hydrating Institutional Portfolio Engine..." subtitle="Preventing SSR hydration mismatch and initializing stateless memory ledger" />;
  }

  return (
    <QuantXErrorBoundary fallbackTitle="Institutional Portfolio Ledger Runtime Notice">
      <PageHeader
        title="Institutional Portfolio Ledger"
        meta={
          <>
            <Badge tone={isZeroState ? "neu" : "pos"} dot={!isZeroState}>
              {isZeroState ? "ZERO-STATE INITIALIZED" : `${summary?.active_positions_count || 0} Holdings · ${summary?.total_lots || 0} Tax-Lots`}
            </Badge>
            <Badge tone="neu">
              NAV: ₹{summary?.total_aum ? inrCompact(summary.total_aum).replace("₹", "") : "0.00"}
            </Badge>
            <Badge tone={wsConnected ? "pos" : "neu"} dot={wsConnected}>
              {wsConnected ? "STREAMING (LIVE WS)" : "POLLING (4s)"}
            </Badge>
            <Badge tone={isLive ? "pos" : "gold"} dot={isLive}>
              {isLive ? "LIVE DMA KITE" : "SIMULATED LEDGER"}
            </Badge>
          </>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={RefreshCw}
              loading={refreshing}
              onClick={() => {
                setRefreshing(true);
                loadAllData(true);
              }}
            >
              Refresh Live
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={BarChart3}
              onClick={() => navigate("/visual-dl10")}
            >
              Visual & DL-10 (v29)
            </Button>
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
              variant="outline"
              icon={Layers}
              onClick={() => navigate("/world-model-v31")}
            >
              World Model & EMS (v31)
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={Lock}
              onClick={() => navigate("/post-quantum-v32")}
            >
              Post-Quantum (v32)
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={Cpu}
              onClick={() => navigate("/sovereign-v33")}
            >
              Sovereign Memristive (v33)
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={Dna}
              onClick={() => navigate("/sovereign-v34")}
            >
              Sovereign DNA & Quantum (v34)
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={ShieldCheck}
              onClick={() => navigate("/omni-v41")}
            >
              Resilience (v41)
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={Plus}
              onClick={() => setShowTxModal(true)}
            >
              Log Trade
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={Activity}
              onClick={() => setShowCorpModal(true)}
            >
              Corp Action
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={Download}
              onClick={downloadAuditStatement}
            >
              Statement
            </Button>
            {isZeroState ? (
              <Button
                size="sm"
                variant="outline"
                icon={Database}
                onClick={handleSeedBaseline}
              >
                Seed Mandate
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                icon={Trash2}
                onClick={handleResetLedger}
                title="Reset to empty zero-state"
              >
                Reset
              </Button>
            )}
          </div>
        }
      />

      {/* ── KPI Summary Cards ── */}
      <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
        <Kpi
          k="Total Portfolio AUM"
          v={summary ? `₹${inrCompact(summary.total_aum).replace("₹", "")}` : "₹0.00"}
          s={summary ? `Invested: ₹${inrCompact(summary.invested_market_value_inr).replace("₹", "")}` : "0 positions"}
          tone="pos"
        />
        <Kpi
          k="Cash & Collateral"
          v={summary ? `₹${inrCompact(summary.cash_balance).replace("₹", "")}` : "₹0.00"}
          s={summary?.total_aum ? `${((summary.cash_balance / summary.total_aum) * 100).toFixed(1)}% of NAV` : "0.0%"}
        />
        <Kpi
          k="Unrealised P&L"
          v={summary ? `${summary.unrealized_pnl_inr >= 0 ? "+" : "−"}₹${inrCompact(Math.abs(summary.unrealized_pnl_inr)).replace("₹", "")}` : "₹0.00"}
          s={summary ? `${summary.unrealized_pnl_pct >= 0 ? "↑ +" : "↓ "}${summary.unrealized_pnl_pct.toFixed(2)}%` : "0.00%"}
          tone={summary && summary.unrealized_pnl_inr >= 0 ? "pos" : "neg"}
        />
        <Kpi
          k="Realized Taxable P&L"
          v={summary ? `₹${inrCompact(summary.realized_pnl_inr).replace("₹", "")}` : "₹0.00"}
          s={`STCG: ₹${inrCompact(summary?.realized_stcg_inr || 0)} · LTCG: ₹${inrCompact(summary?.realized_ltcg_inr || 0)}`}
          tone={summary && summary.realized_pnl_inr >= 0 ? "pos" : "neg"}
        />
        <Kpi
          k="Statutory Fees & STT"
          v={summary ? `₹${num(summary.total_fees_paid_inr, 2)}` : "₹0.00"}
          s={`STT: ₹${num(summary?.total_stt_paid_inr || 0, 2)}`}
        />
        <Kpi
          k="Margin Health"
          v={margin ? `${margin.health_score}/100` : "100/100"}
          s={`IM: ${margin ? margin.im_utilization_pct.toFixed(1) : "0.0"}% utilized`}
          tone={margin?.status === "EXCELLENT" ? "pos" : "neg"}
        />
      </div>

      {/* ── ZERO-STATE EMPTY STATE HANDLER ── */}
      {isZeroState && !loading && (
        <Panel level={2} className="mb-4 border-acc/30 bg-gradient-to-br from-surface/90 to-surface/40 p-8 text-center">
          <div className="mx-auto flex max-w-xl flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-acc/10 text-acc">
              <Database size={32} />
            </div>
            <h2 className="text-xl font-bold text-txt-primary">Portfolio Ledger Empty (Zero-State)</h2>
            <p className="mt-2 text-sm text-txt-secondary">
              All mock demo placeholders have been purged. You are in a clean institutional ledger state.
              Sync your live Zerodha Kite Demat account, record a trade, or seed the institutional baseline mandate.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                variant="primary"
                icon={Radio}
                onClick={() => navigate("/integrations/zerodha")}
              >
                Sync Zerodha Demat
              </Button>
              <Button
                variant="outline"
                icon={Download}
                onClick={() => navigate("/portfolio/analysis")}
              >
                Upload Holdings CSV
              </Button>
              <Button
                variant="outline"
                icon={Plus}
                onClick={() => setShowTxModal(true)}
              >
                Log First Trade
              </Button>
              <Button
                variant="outline"
                icon={Sparkles}
                onClick={handleSeedBaseline}
              >
                Seed Institutional Mandate
              </Button>
            </div>
            <div className="mt-6 text-xs text-txt-disabled">
              Supported matching methods: HIFO (Tax-Optimal), FIFO, LIFO · Real-time STCG/LTCG holding period tracking.
            </div>
          </div>
        </Panel>
      )}

      {/* ── Navigation Sub-Tabs ── */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5 border-b border-line-subtle pb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-[6px] px-3 py-1.5 text-[12px] font-medium transition-all",
                isActive
                  ? "bg-acc/15 text-acc shadow-sm ring-1 ring-acc/30"
                  : "text-txt-muted hover:bg-surface/60 hover:text-txt-primary"
              )}
            >
              <Icon size={14} className={isActive ? "text-acc" : "text-txt-disabled"} />
              <span>{tab.label}</span>
              {tab.id === "drift" && drift?.rebalance_required && (
                <span className="h-1.5 w-1.5 rounded-full bg-neg animate-pulse" />
              )}
              {tab.id === "harvesting" && (harvesting?.candidates_count || 0) > 0 && (
                <span className="rounded bg-acc/20 px-1 text-[9px] font-bold text-acc">
                  {harvesting?.candidates_count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: Holdings & Expandable Tax-Lots ── */}
      {activeTab === "holdings" && (
        <Panel
          level={3}
          className="mb-4"
          title="Active Holdings & Tax-Lot Inventory"
          sub="Dense institutional position surveillance with multi-lot tax matching"
          bodyClass="p-0"
        >
          {loading ? (
            <TableSkeleton rows={8} cols={9} />
          ) : (summary?.holdings?.length ?? 0) === 0 ? (
            <div className="p-8 text-center text-sm text-txt-muted">
              No active positions in the ledger. Click <strong className="text-acc">Log Trade</strong> or <strong className="text-acc">Seed Mandate</strong> to begin.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11.5px]">
                <thead className="border-b border-line-subtle bg-surface/50 text-[10.5px] uppercase tracking-wider text-txt-disabled">
                  <tr>
                    <th className="py-2.5 pl-4 pr-2">Symbol / Position</th>
                    <th className="px-2 text-right">Qty</th>
                    <th className="px-2 text-right">Avg Cost</th>
                    <th className="px-2 text-right">LTP</th>
                    <th className="px-2 text-right">Cost Basis</th>
                    <th className="px-2 text-right">Market Value</th>
                    <th className="px-2 text-right">Weight</th>
                    <th className="px-2 text-right">Unrealized P&L</th>
                    <th className="px-2 text-center">Tax-Lots</th>
                    <th className="py-2.5 pl-2 pr-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-subtle">
                  {summary?.holdings?.map((h) => {
                    const isExpanded = !!expandedTickers[h.ticker];
                    const positionLots = taxLots.filter((l) => l.ticker === h.ticker);
                    const isProfitable = h.unrealized_pnl >= 0;

                    return (
                      <Fragment key={h.ticker}>
                        <tr
                          className={cn(
                            "cursor-pointer transition-colors hover:bg-surface/40",
                            isExpanded && "bg-surface/20"
                          )}
                          onClick={() => toggleExpand(h.ticker)}
                        >
                          <td className="py-3 pl-4 pr-2">
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronDown size={14} className="text-acc shrink-0" />
                              ) : (
                                <ChevronRight size={14} className="text-txt-disabled shrink-0" />
                              )}
                              <TickerCell ticker={h.ticker} name={h.sector} />
                            </div>
                          </td>
                          <td className="px-2 text-right mono font-medium text-txt-primary">
                            {num(h.quantity, 0)}
                          </td>
                          <td className="px-2 text-right mono text-txt-secondary">
                            ₹{num(h.average_cost, 2)}
                          </td>
                          <td className="px-2 text-right mono font-medium text-txt-primary">
                            ₹{num(h.last_price, 2)}
                          </td>
                          <td className="px-2 text-right mono text-txt-secondary">
                            ₹{inrCompact(h.cost_basis).replace("₹", "")}
                          </td>
                          <td className="px-2 text-right mono font-medium text-txt-primary">
                            ₹{inrCompact(h.market_value).replace("₹", "")}
                          </td>
                          <td className="px-2 text-right mono text-txt-secondary">
                            {h.weight_pct.toFixed(2)}%
                          </td>
                          <td className="px-2 text-right mono font-medium">
                            <span className={isProfitable ? "text-pos" : "text-neg"}>
                              {isProfitable ? "+" : "−"}₹{inrCompact(Math.abs(h.unrealized_pnl)).replace("₹", "")}{" "}
                              ({isProfitable ? "+" : ""}{h.unrealized_pnl_pct.toFixed(2)}%)
                            </span>
                          </td>
                          <td className="px-2 text-center">
                            <Badge tone="neu">
                              {h.tax_lots_count} {h.tax_lots_count === 1 ? "Lot" : "Lots"}
                            </Badge>
                          </td>
                          <td className="py-3 pl-2 pr-4 text-center">
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTxSymbol(h.ticker);
                                setTxPrice(h.last_price);
                                setShowTxModal(true);
                              }}
                            >
                              Trade
                            </Button>
                          </td>
                        </tr>

                        {/* Expanded Tax Lots Sub-Table */}
                        {isExpanded && (
                          <tr className="bg-surface/10">
                            <td colSpan={10} className="px-6 py-3">
                              <div className="rounded-[6px] border border-line-subtle bg-bg-secondary/70 p-3">
                                <div className="mb-2 flex items-center justify-between">
                                  <span className="label-xs text-txt-muted uppercase tracking-wider">
                                    Inventory Tax-Lots for {h.ticker} ({positionLots.length} Active Lots)
                                  </span>
                                  <span className="mono text-[10.5px] text-txt-disabled">
                                    Tax Strategy: HIFO (Highest Cost First)
                                  </span>
                                </div>
                                <table className="w-full text-left text-[11px]">
                                  <thead className="border-b border-line-subtle text-[10px] uppercase text-txt-disabled">
                                    <tr>
                                      <th className="py-1.5">Lot ID</th>
                                      <th className="py-1.5">Acquisition Date</th>
                                      <th className="py-1.5 text-right">Holding Days</th>
                                      <th className="py-1.5 text-center">Tax Class</th>
                                      <th className="py-1.5 text-right">Qty</th>
                                      <th className="py-1.5 text-right">Buy Price</th>
                                      <th className="py-1.5 text-right">Current Price</th>
                                      <th className="py-1.5 text-right">Unrealized P&L</th>
                                      <th className="py-1.5 text-right">Tax Rate</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-line-subtle/50">
                                    {positionLots.map((lot) => {
                                      const isLtcg = lot.tax_classification === "LTCG" || lot.holding_period_days >= 365;
                                      const lotProfitable = lot.unrealized_pnl >= 0;
                                      return (
                                        <tr key={lot.lot_id} className="hover:bg-surface/30">
                                          <td className="py-1.5 mono text-[10.5px] text-txt-secondary">
                                            {lot.lot_id}
                                          </td>
                                          <td className="py-1.5 text-txt-muted">
                                            {lot.acquisition_date}
                                          </td>
                                          <td className="py-1.5 text-right mono">
                                            {lot.holding_period_days}d
                                          </td>
                                          <td className="py-1.5 text-center">
                                            <Badge tone={isLtcg ? "pos" : "gold"}>
                                              {isLtcg ? "LTCG" : "STCG"}
                                            </Badge>
                                          </td>
                                          <td className="py-1.5 text-right mono text-txt-primary">
                                            {num(lot.qty, 0)}
                                          </td>
                                          <td className="py-1.5 text-right mono text-txt-secondary">
                                            ₹{num(lot.purchase_price, 2)}
                                          </td>
                                          <td className="py-1.5 text-right mono text-txt-primary">
                                            ₹{num(lot.current_price, 2)}
                                          </td>
                                          <td className="py-1.5 text-right mono font-medium">
                                            <span className={lotProfitable ? "text-pos" : "text-neg"}>
                                              {lotProfitable ? "+" : "−"}₹{num(Math.abs(lot.unrealized_pnl), 2)}
                                            </span>
                                          </td>
                                          <td className="py-1.5 text-right mono text-txt-muted">
                                            {isLtcg ? "12.5%" : "20.0%"}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}

      {/* ── TAB 2: Trade Entry & Audit Log ── */}
      {activeTab === "transactions" && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <Panel
            level={3}
            className="xl:col-span-5"
            title="Real-Time Trade Entry Engine"
            sub="Manual order execution with automatic Indian statutory fee deduction"
          >
            <form onSubmit={handleRecordTransaction} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-xs text-txt-muted">Action Side</label>
                  <select
                    value={txAction}
                    onChange={(e) => setTxAction(e.target.value as any)}
                    className="mt-1 w-full rounded-[6px] border border-line-subtle bg-bg-secondary px-2.5 py-1.5 text-[12px] text-txt-primary outline-none focus:border-acc"
                  >
                    <option value="BUY">BUY (Delivery)</option>
                    <option value="SELL">SELL (HIFO Exit)</option>
                    <option value="SHORT">SHORT</option>
                    <option value="COVER">COVER</option>
                    <option value="CASH_DEPOSIT">CASH DEPOSIT</option>
                    <option value="CASH_WITHDRAWAL">CASH WITHDRAWAL</option>
                  </select>
                </div>
                <div>
                  <label className="label-xs text-txt-muted">Tax-Lot Match Strategy</label>
                  <select
                    value={txStrategy}
                    onChange={(e) => setTxStrategy(e.target.value as any)}
                    className="mt-1 w-full rounded-[6px] border border-line-subtle bg-bg-secondary px-2.5 py-1.5 text-[12px] text-txt-primary outline-none focus:border-acc"
                  >
                    <option value="HIFO">HIFO (Tax-Optimal)</option>
                    <option value="FIFO">FIFO (Chronological)</option>
                    <option value="LIFO">LIFO (Tactical)</option>
                  </select>
                </div>
              </div>

              {!txAction.startsWith("CASH") && (
                <div className="relative">
                  <label className="label-xs text-txt-muted">Tradingsymbol / Ticker</label>
                  <input
                    type="text"
                    value={txSymbol}
                    onChange={(e) => setTxSymbol(e.target.value.toUpperCase())}
                    placeholder="Search 5,000+ equities..."
                    className="mt-1 w-full rounded-[6px] border border-line-subtle bg-bg-secondary px-2.5 py-1.5 mono text-[12px] uppercase text-txt-primary outline-none focus:border-acc"
                    required
                  />
                  {symbolSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-[6px] border border-line bg-bg-secondary/95 shadow-xl backdrop-blur-md">
                      {symbolSuggestions.map((item) => (
                        <div
                          key={item.tradingsymbol}
                          onClick={() => {
                            setTxSymbol(item.tradingsymbol);
                            setTxPrice(item.last_price || 1000);
                            setSymbolSuggestions([]);
                          }}
                          className="flex cursor-pointer items-center justify-between px-3 py-2 text-[11.5px] hover:bg-surface/50"
                        >
                          <div>
                            <span className="mono font-bold text-txt-primary">{item.tradingsymbol}</span>
                            <span className="ml-2 text-txt-muted text-[10px]">{item.sector}</span>
                          </div>
                          <span className="mono text-txt-secondary">₹{num(item.last_price, 2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-xs text-txt-muted">
                    {txAction.startsWith("CASH") ? "Deposit / Withdrawal Amount (₹)" : "Quantity (Shares)"}
                  </label>
                  <input
                    type="number"
                    value={txQty}
                    onChange={(e) => setTxQty(parseFloat(e.target.value) || 0)}
                    min="1"
                    step="any"
                    className="mt-1 w-full rounded-[6px] border border-line-subtle bg-bg-secondary px-2.5 py-1.5 mono text-[12px] text-txt-primary outline-none focus:border-acc"
                    required
                  />
                </div>
                <div>
                  <label className="label-xs text-txt-muted">Execution Price (₹)</label>
                  <input
                    type="number"
                    value={txPrice}
                    onChange={(e) => setTxPrice(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="any"
                    disabled={txAction.startsWith("CASH")}
                    className="mt-1 w-full rounded-[6px] border border-line-subtle bg-bg-secondary px-2.5 py-1.5 mono text-[12px] text-txt-primary outline-none focus:border-acc disabled:opacity-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label-xs text-txt-muted">Execution Notes / Mandate Tag</label>
                <input
                  type="text"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder="e.g. Tactical swing hedge, Core rebalance..."
                  className="mt-1 w-full rounded-[6px] border border-line-subtle bg-bg-secondary px-2.5 py-1.5 text-[12px] text-txt-primary outline-none focus:border-acc"
                />
              </div>

              {/* Fee Breakdown Box */}
              {!txAction.startsWith("CASH") && (
                <div className="rounded-[6px] border border-line-subtle bg-surface/30 p-3 text-[11px] space-y-1">
                  <div className="flex justify-between text-txt-muted">
                    <span>Order Notional Value:</span>
                    <strong className="mono text-txt-primary">₹{inrCompact(estimatedNotional)}</strong>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>STT (0.1%):</span>
                    <span className="mono text-txt-secondary">₹{num(estimatedStt, 2)}</span>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>Brokerage & Turnover + GST:</span>
                    <span className="mono text-txt-secondary">₹{num(estimatedBrokerage + estimatedTurnover + estimatedGst, 2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-line-subtle pt-1 font-semibold text-txt-primary">
                    <span>Total Statutory Fees:</span>
                    <span className="mono text-acc">₹{num(estimatedTotalFees, 2)}</span>
                  </div>
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full" icon={Plus}>
                Record Transaction into Ledger
              </Button>
            </form>
          </Panel>

          {/* Audit Log Table */}
          <Panel
            level={3}
            className="xl:col-span-7"
            title="Chronological Audit Blotter"
            sub={`Immutable audit log of all manual and institutional fills (${transactions.length} entries)`}
            bodyClass="p-0"
          >
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-sm text-txt-muted">No transactions recorded yet.</div>
            ) : (
              <div className="max-h-[520px] overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="sticky top-0 border-b border-line-subtle bg-surface text-[10px] uppercase text-txt-disabled">
                    <tr>
                      <th className="py-2 pl-3">Timestamp / TX ID</th>
                      <th className="py-2">Side</th>
                      <th className="py-2">Ticker</th>
                      <th className="py-2 text-right">Qty</th>
                      <th className="py-2 text-right">Price</th>
                      <th className="py-2 text-right">Fees</th>
                      <th className="py-2 text-right">Realized P&L</th>
                      <th className="py-2 pr-3 text-right">Strategy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-subtle">
                    {transactions.map((tx) => (
                      <tr key={tx.tx_id} className="hover:bg-surface/30">
                        <td className="py-2 pl-3">
                          <div className="mono text-[10.5px] text-txt-primary">{tx.timestamp}</div>
                          <div className="mono text-[9.5px] text-txt-disabled">{tx.tx_id}</div>
                        </td>
                        <td className="py-2">
                          <Badge
                            tone={
                              tx.action === "BUY"
                                ? "pos"
                                : tx.action === "SELL"
                                ? "neg"
                                : tx.action.startsWith("CASH")
                                ? "gold"
                                : "neu"
                            }
                          >
                            {tx.action}
                          </Badge>
                        </td>
                        <td className="py-2 mono font-medium text-txt-primary">
                          {tx.ticker || tx.symbol}
                        </td>
                        <td className="py-2 text-right mono text-txt-secondary">
                          {num(tx.qty, 0)}
                        </td>
                        <td className="py-2 text-right mono text-txt-primary">
                          ₹{num(tx.price, 2)}
                        </td>
                        <td className="py-2 text-right mono text-txt-muted">
                          ₹{num(tx.fees?.total || tx.fees?.total_fees || 0, 2)}
                        </td>
                        <td className="py-2 text-right mono font-medium">
                          {tx.realized_pnl !== 0 ? (
                            <span className={tx.realized_pnl > 0 ? "text-pos" : "text-neg"}>
                              {tx.realized_pnl > 0 ? "+" : "−"}₹{num(Math.abs(tx.realized_pnl), 2)}
                            </span>
                          ) : (
                            <span className="text-txt-disabled">—</span>
                          )}
                        </td>
                        <td className="py-2 pr-3 text-right text-[10px] text-txt-muted">
                          {tx.strategy}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      )}

      {/* ── TAB 3: Intraday Brinson-Fachler Attribution ── */}
      {activeTab === "brinson" && brinson && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi
              k="Active Excess Return"
              v={`${brinson.active_return >= 0 ? "+" : ""}${(brinson.active_return * 100).toFixed(2)} bps`}
              s={`Portfolio: ${brinson.portfolio_return}% vs NIFTY: ${brinson.benchmark_return}%`}
              tone={brinson.active_return >= 0 ? "pos" : "neg"}
            />
            <Kpi
              k="Allocation Effect (A_i)"
              v={`${brinson.total_allocation_effect_bps >= 0 ? "+" : ""}${brinson.total_allocation_effect_bps.toFixed(2)} bps`}
              s="Over/underweighting sector decisions"
              tone={brinson.total_allocation_effect_bps >= 0 ? "pos" : "neg"}
            />
            <Kpi
              k="Selection Effect (S_i)"
              v={`${brinson.total_selection_effect_bps >= 0 ? "+" : ""}${brinson.total_selection_effect_bps.toFixed(2)} bps`}
              s="Security picking within sectors"
              tone={brinson.total_selection_effect_bps >= 0 ? "pos" : "neg"}
            />
            <Kpi
              k="Interaction Effect (I_i)"
              v={`${brinson.total_interaction_effect_bps >= 0 ? "+" : ""}${brinson.total_interaction_effect_bps.toFixed(2)} bps`}
              s="Combined allocation × selection"
              tone={brinson.total_interaction_effect_bps >= 0 ? "pos" : "neg"}
            />
          </div>

          <Panel
            level={3}
            title="Sector Decomposition vs NIFTY 50"
            sub="Intraday Brinson-Fachler attribution model: Active Return = Allocation + Selection + Interaction"
            bodyClass="p-0"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11.5px]">
                <thead className="border-b border-line-subtle bg-surface/50 text-[10.5px] uppercase tracking-wider text-txt-disabled">
                  <tr>
                    <th className="py-2.5 pl-4">Sector</th>
                    <th className="px-2 text-right">Portfolio Wt</th>
                    <th className="px-2 text-right">NIFTY Wt</th>
                    <th className="px-2 text-right">Portfolio Ret</th>
                    <th className="px-2 text-right">NIFTY Ret</th>
                    <th className="px-2 text-right">Allocation (bps)</th>
                    <th className="px-2 text-right">Selection (bps)</th>
                    <th className="px-2 text-right">Interaction (bps)</th>
                    <th className="py-2.5 pl-2 pr-4 text-right">Total Active (bps)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-subtle">
                  {brinson.sector_breakdown.map((row) => (
                    <tr key={row.sector} className="hover:bg-surface/40">
                      <td className="py-2.5 pl-4 font-medium text-txt-primary">
                        {row.sector}
                      </td>
                      <td className="px-2 text-right mono text-txt-secondary">
                        {row.portfolio_weight_pct.toFixed(1)}%
                      </td>
                      <td className="px-2 text-right mono text-txt-muted">
                        {row.benchmark_weight_pct.toFixed(1)}%
                      </td>
                      <td className="px-2 text-right mono">
                        <span className={row.portfolio_return_pct >= 0 ? "text-pos" : "text-neg"}>
                          {row.portfolio_return_pct >= 0 ? "+" : ""}{row.portfolio_return_pct.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-2 text-right mono text-txt-muted">
                        {row.benchmark_return_pct >= 0 ? "+" : ""}{row.benchmark_return_pct.toFixed(2)}%
                      </td>
                      <td className="px-2 text-right mono font-medium">
                        <span className={row.allocation_effect_bps >= 0 ? "text-pos" : "text-neg"}>
                          {row.allocation_effect_bps >= 0 ? "+" : ""}{row.allocation_effect_bps.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-2 text-right mono font-medium">
                        <span className={row.selection_effect_bps >= 0 ? "text-pos" : "text-neg"}>
                          {row.selection_effect_bps >= 0 ? "+" : ""}{row.selection_effect_bps.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-2 text-right mono font-medium">
                        <span className={row.interaction_effect_bps >= 0 ? "text-pos" : "text-neg"}>
                          {row.interaction_effect_bps >= 0 ? "+" : ""}{row.interaction_effect_bps.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2.5 pl-2 pr-4 text-right mono font-bold">
                        <span className={row.total_active_effect_bps >= 0 ? "text-pos" : "text-neg"}>
                          {row.total_active_effect_bps >= 0 ? "+" : ""}{row.total_active_effect_bps.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

      {/* ── TAB 4: Drift Surveillance & Rebalance ── */}
      {activeTab === "drift" && drift && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi
              k="L1-Norm Portfolio Drift"
              v={`${drift.l1_norm_drift_pct.toFixed(2)}%`}
              s={`Threshold: ${drift.portfolio_drift_threshold_pct}%`}
              tone={drift.l1_norm_drift_pct > drift.portfolio_drift_threshold_pct ? "neg" : "pos"}
            />
            <Kpi
              k="Max Single Position Drift"
              v={`${(drift.max_single_drift * 100).toFixed(2)}%`}
              s={`Tolerance: ±${drift.max_drift_threshold_pct}%`}
              tone={drift.max_single_drift * 100 > drift.max_drift_threshold_pct ? "neg" : "pos"}
            />
            <Kpi
              k="Active Drift Alerts"
              v={`${drift.alerts_count} Positions`}
              s={drift.alerts_count > 0 ? "Immediate rebalance advised" : "Within mandate tolerance"}
              tone={drift.alerts_count > 0 ? "neg" : "pos"}
            />
            <Kpi
              k="Rebalance Status"
              v={drift.rebalance_required ? "REBALANCE NEEDED" : "COMPLIANT"}
              s={drift.rebalance_required ? "Drift exceeds mandate threshold" : "Optimal asset glidepath"}
              tone={drift.rebalance_required ? "neg" : "pos"}
            />
          </div>

          {drift.alerts.length > 0 && (
            <Panel level={2} className="border-neg/40 bg-neg/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={20} className="text-neg shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-txt-primary">Portfolio Weight Drift Alert Triggered</h4>
                    <p className="text-xs text-txt-secondary">
                      {drift.alerts_count} positions have deviated beyond the ±{drift.max_drift_threshold_pct}% institutional boundary.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  icon={Scale}
                  onClick={() => navigate("/portfolio/optimizer")}
                >
                  Solve Optimal Rebalance
                </Button>
              </div>
            </Panel>
          )}

          <Panel
            level={3}
            title="Weight Allocation vs Target Mandate"
            sub="Real-time surveillance of current weights against institutional model target weights"
            bodyClass="p-0"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11.5px]">
                <thead className="border-b border-line-subtle bg-surface/50 text-[10.5px] uppercase tracking-wider text-txt-disabled">
                  <tr>
                    <th className="py-2.5 pl-4">Asset Symbol</th>
                    <th className="px-2 text-right">Actual Weight</th>
                    <th className="px-2 text-right">Target Weight</th>
                    <th className="px-2 text-right">Drift (Delta)</th>
                    <th className="px-4 text-center">Visual Alignment</th>
                    <th className="py-2.5 pl-2 pr-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-subtle">
                  {drift.positions.map((pos) => {
                    const isOver = pos.drift > 0;
                    const isExceeded = pos.threshold_exceeded;
                    return (
                      <tr key={pos.ticker} className="hover:bg-surface/40">
                        <td className="py-2.5 pl-4 font-medium mono text-txt-primary">
                          {pos.ticker}
                        </td>
                        <td className="px-2 text-right mono font-medium text-txt-primary">
                          {pos.actual_weight_pct.toFixed(2)}%
                        </td>
                        <td className="px-2 text-right mono text-txt-muted">
                          {pos.target_weight_pct.toFixed(2)}%
                        </td>
                        <td className="px-2 text-right mono font-bold">
                          <span className={isExceeded ? "text-neg" : isOver ? "text-pos" : "text-txt-secondary"}>
                            {isOver ? "+" : ""}{pos.drift_pct.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-4">
                          <div className="relative h-2 w-full overflow-hidden rounded-full bg-line-subtle">
                            {/* Target Marker */}
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-txt-primary z-10"
                              style={{ left: `${Math.min(100, pos.target_weight_pct * 3)}%` }}
                              title={`Target: ${pos.target_weight_pct}%`}
                            />
                            {/* Actual Bar */}
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                isExceeded ? "bg-neg" : "bg-acc"
                              )}
                              style={{ width: `${Math.min(100, pos.actual_weight_pct * 3)}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-2.5 pl-2 pr-4 text-center">
                          {isExceeded ? (
                            <Badge tone="neg">{isOver ? "TRIM" : "ADD"}</Badge>
                          ) : (
                            <Badge tone="pos">ALIGNED</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

      {/* ── TAB 5: Tax-Loss Harvesting & Collateral Margin Health ── */}
      {activeTab === "harvesting" && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          {/* Tax-Loss Harvesting Scanner */}
          <Panel
            level={3}
            className="xl:col-span-6"
            title="Tax-Loss Harvesting Scanner"
            sub="Identifies inventory lots with unrealized losses to offset taxable capital gains"
          >
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-[6px] border border-line-subtle bg-surface/40 p-3">
                <div className="label-xs text-txt-muted">Harvestable Losses</div>
                <div className="mono text-lg font-bold text-neg">
                  ₹{inrCompact(harvesting?.total_harvestable_loss || 0)}
                </div>
                <div className="text-[10px] text-txt-disabled">
                  {harvesting?.candidates_count || 0} candidate tax-lots in loss
                </div>
              </div>
              <div className="rounded-[6px] border border-line-subtle bg-surface/40 p-3">
                <div className="label-xs text-txt-muted">Estimated Tax Savings</div>
                <div className="mono text-lg font-bold text-pos">
                  ₹{inrCompact(harvesting?.potential_tax_savings || 0)}
                </div>
                <div className="text-[10px] text-txt-disabled">
                  Offsets STCG @ 20% / LTCG @ 12.5%
                </div>
              </div>
            </div>

            {(!harvesting?.opportunities || harvesting.opportunities.length === 0) ? (
              <div className="rounded-[6px] border border-line-subtle bg-surface/20 p-6 text-center text-xs text-txt-muted">
                <CheckCircle2 size={24} className="mx-auto mb-2 text-pos" />
                No tax-loss harvesting candidates detected. All current inventory lots are trading above or near cost basis.
              </div>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {harvesting.opportunities.map((opp) => (
                  <div
                    key={opp.lot_id}
                    className="flex items-center justify-between rounded-[6px] border border-line-subtle bg-surface/40 p-3 text-[11.5px]"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="mono font-bold text-txt-primary">{opp.ticker}</span>
                        <Badge tone="neu">{num(opp.qty, 0)} shs</Badge>
                        <Badge tone={opp.tax_classification === "LTCG" ? "pos" : "gold"}>
                          {opp.tax_classification} ({opp.holding_period_days}d)
                        </Badge>
                      </div>
                      <div className="mt-1 text-[10px] text-txt-muted">
                        Cost: ₹{num(opp.cost_price, 2)} → LTP: ₹{num(opp.current_price, 2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="mono font-bold text-neg">
                        −₹{inrCompact(opp.harvestable_loss_inr)}
                      </div>
                      <div className="text-[10.5px] text-pos font-medium">
                        Save ~₹{num(opp.tax_offset_potential_inr, 2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Margin Health Surveillance */}
          <Panel
            level={3}
            className="xl:col-span-6"
            title="Institutional Collateral Margin Health"
            sub="Pledged collateral haircut (18%), Initial Margin (IM), and Maintenance Margin (MM)"
          >
            {margin && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between rounded-[6px] border border-line-subtle bg-surface/50 p-3">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={24} className="text-pos shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-txt-primary">Collateral Buffer Score</div>
                      <div className="text-xs text-txt-secondary">
                        Status: <strong className="text-pos">{margin.status}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mono text-2xl font-bold text-pos">{margin.health_score}/100</div>
                    <div className="text-[10px] text-txt-disabled">Liquidation Safe</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11.5px]">
                  <div className="rounded-[6px] border border-line-subtle bg-surface/30 p-2.5">
                    <span className="text-txt-muted">Pledged Equity Value</span>
                    <div className="mono text-sm font-bold text-txt-primary">
                      ₹{inrCompact(margin.pledged_equity_value_inr)}
                    </div>
                  </div>
                  <div className="rounded-[6px] border border-line-subtle bg-surface/30 p-2.5">
                    <span className="text-txt-muted">Haircut (18.0%)</span>
                    <div className="mono text-sm font-bold text-neg">
                      −₹{inrCompact(margin.haircut_deduction_inr)}
                    </div>
                  </div>
                  <div className="rounded-[6px] border border-line-subtle bg-surface/30 p-2.5">
                    <span className="text-txt-muted">Cash Buffer Collateral</span>
                    <div className="mono text-sm font-bold text-txt-primary">
                      ₹{inrCompact(margin.cash_collateral_inr)}
                    </div>
                  </div>
                  <div className="rounded-[6px] border border-line-subtle bg-surface/30 p-2.5">
                    <span className="text-txt-muted">Net Usable Collateral</span>
                    <div className="mono text-sm font-bold text-acc">
                      ₹{inrCompact(margin.total_collateral_margin_inr)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-txt-muted">Initial Margin (IM) Utilization</span>
                    <span className="mono font-bold text-txt-primary">{margin.im_utilization_pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-line-subtle">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        margin.im_utilization_pct > 75 ? "bg-neg" : "bg-acc"
                      )}
                      style={{ width: `${Math.min(100, margin.im_utilization_pct)}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-txt-disabled">
                    <span>Required: ₹{inrCompact(margin.initial_margin_required_inr)}</span>
                    <span>MM Floor: ₹{inrCompact(margin.maintenance_margin_required_inr)}</span>
                  </div>
                </div>
              </div>
            )}
          </Panel>
        </div>
      )}

      {/* ── Transaction Entry Modal ── */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[8px] border border-line bg-surface p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-txt-primary">Log Manual Transaction</h3>
              <button
                onClick={() => setShowTxModal(false)}
                className="text-txt-disabled hover:text-txt-primary"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRecordTransaction} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="label-xs text-txt-muted">Action</label>
                  <select
                    value={txAction}
                    onChange={(e) => setTxAction(e.target.value as any)}
                    className="mt-1 w-full rounded border border-line-subtle bg-bg-secondary p-1.5 text-xs text-txt-primary"
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                    <option value="SHORT">SHORT</option>
                    <option value="COVER">COVER</option>
                    <option value="CASH_DEPOSIT">CASH DEPOSIT</option>
                    <option value="CASH_WITHDRAWAL">CASH WITHDRAWAL</option>
                  </select>
                </div>
                <div>
                  <label className="label-xs text-txt-muted">Lot Matching</label>
                  <select
                    value={txStrategy}
                    onChange={(e) => setTxStrategy(e.target.value as any)}
                    className="mt-1 w-full rounded border border-line-subtle bg-bg-secondary p-1.5 text-xs text-txt-primary"
                  >
                    <option value="HIFO">HIFO (Tax-Optimal)</option>
                    <option value="FIFO">FIFO</option>
                    <option value="LIFO">LIFO</option>
                  </select>
                </div>
              </div>

              {!txAction.startsWith("CASH") && (
                <div>
                  <label className="label-xs text-txt-muted">Symbol</label>
                  <input
                    type="text"
                    value={txSymbol}
                    onChange={(e) => setTxSymbol(e.target.value.toUpperCase())}
                    className="mt-1 w-full rounded border border-line-subtle bg-bg-secondary p-1.5 mono text-xs uppercase text-txt-primary"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="label-xs text-txt-muted">
                    {txAction.startsWith("CASH") ? "Amount (₹)" : "Quantity"}
                  </label>
                  <input
                    type="number"
                    value={txQty}
                    onChange={(e) => setTxQty(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded border border-line-subtle bg-bg-secondary p-1.5 mono text-xs text-txt-primary"
                    required
                  />
                </div>
                <div>
                  <label className="label-xs text-txt-muted">Price (₹)</label>
                  <input
                    type="number"
                    value={txPrice}
                    onChange={(e) => setTxPrice(parseFloat(e.target.value) || 0)}
                    disabled={txAction.startsWith("CASH")}
                    className="mt-1 w-full rounded border border-line-subtle bg-bg-secondary p-1.5 mono text-xs text-txt-primary disabled:opacity-50"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="ghost" type="button" onClick={() => setShowTxModal(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  Execute & Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Corporate Action Modal ── */}
      {showCorpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[8px] border border-line bg-surface p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-txt-primary">Reconcile Corporate Action</h3>
              <button
                onClick={() => setShowCorpModal(false)}
                className="text-txt-disabled hover:text-txt-primary"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCorporateAction} className="space-y-3">
              <div>
                <label className="label-xs text-txt-muted">Corporate Action Type</label>
                <select
                  value={corpAction}
                  onChange={(e) => setCorpAction(e.target.value as any)}
                  className="mt-1 w-full rounded border border-line-subtle bg-bg-secondary p-1.5 text-xs text-txt-primary"
                >
                  <option value="SPLIT">STOCK SPLIT</option>
                  <option value="BONUS">BONUS SHARES</option>
                  <option value="DIVIDEND">CASH DIVIDEND</option>
                </select>
              </div>

              <div>
                <label className="label-xs text-txt-muted">Symbol</label>
                <input
                  type="text"
                  value={corpSymbol}
                  onChange={(e) => setCorpSymbol(e.target.value.toUpperCase())}
                  className="mt-1 w-full rounded border border-line-subtle bg-bg-secondary p-1.5 mono text-xs uppercase text-txt-primary"
                  required
                />
              </div>

              {corpAction !== "DIVIDEND" ? (
                <div>
                  <label className="label-xs text-txt-muted">
                    {corpAction === "SPLIT" ? "Split Ratio (e.g. 2.0 for 2:1)" : "Bonus Ratio (e.g. 1.0 for 1:1)"}
                  </label>
                  <input
                    type="number"
                    value={corpRatio}
                    onChange={(e) => setCorpRatio(parseFloat(e.target.value) || 1)}
                    step="0.1"
                    min="0.1"
                    className="mt-1 w-full rounded border border-line-subtle bg-bg-secondary p-1.5 mono text-xs text-txt-primary"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="label-xs text-txt-muted">Dividend Per Share (₹)</label>
                  <input
                    type="number"
                    value={corpCash}
                    onChange={(e) => setCorpCash(parseFloat(e.target.value) || 0)}
                    step="0.05"
                    min="0"
                    className="mt-1 w-full rounded border border-line-subtle bg-bg-secondary p-1.5 mono text-xs text-txt-primary"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="ghost" type="button" onClick={() => setShowCorpModal(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  Apply Action
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </QuantXErrorBoundary>
  );
}

function Kpi({ k, v, s, tone }: { k: string; v: string; s: string; tone?: "pos" | "neg" }) {
  return (
    <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5 transition-colors hover:border-line">
      <div className="label-xs truncate text-txt-muted">{k}</div>
      <div
        className={cn(
          "tnum mt-1 text-[17px] font-semibold leading-none tracking-[-0.02em]",
          tone === "pos" ? "text-pos" : tone === "neg" ? "text-neg" : "text-txt-primary"
        )}
      >
        {v}
      </div>
      <div className="mt-1.5 truncate text-[10px] text-txt-disabled">{s}</div>
    </div>
  );
}

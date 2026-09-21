/**
 * QUANTX Version 28 (v28) Master Portfolio Ledger & Tax-Lot Accounting Service
 * Zero-Demo Architecture, Real-Time User Transactions, FIFO/HIFO/LIFO Matching,
 * Intraday Brinson-Fachler Attribution, Portfolio Drift, and Collateral Margin Surveillance.
 */

const API_BASE = "/api/v1/portfolio/ledger";

export interface PortfolioHolding {
  ticker: string;
  symbol: string;
  quantity: number;
  qty: number;
  average_cost: number;
  last_price: number;
  cost_basis: number;
  market_value: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  weight_pct: number;
  sector: string;
  tax_lots_count: number;
}

export interface PortfolioLedgerSummary {
  total_aum: number;
  total_nav_inr: number;
  cash_balance: number;
  cash_balance_inr: number;
  invested_market_value_inr: number;
  total_cost_basis_inr: number;
  unrealized_pnl_inr: number;
  unrealized_pnl_pct: number;
  realized_pnl_inr: number;
  realized_stcg_inr: number;
  realized_ltcg_inr: number;
  total_fees_paid_inr: number;
  total_stt_paid_inr: number;
  total_lots: number;
  active_positions_count: number;
  holdings: PortfolioHolding[];
  is_zero_state: boolean;
  timestamp: number;
}

export interface TaxLot {
  lot_id: string;
  ticker: string;
  symbol: string;
  exchange: string;
  qty: number;
  quantity: number;
  purchase_price: number;
  buy_price: number;
  current_price: number;
  cost_basis: number;
  market_value: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  acquisition_date: string;
  holding_period_days: number;
  holding_days: number;
  tax_classification: "STCG" | "LTCG" | string;
  gain_type: "STCG" | "LTCG" | string;
  applicable_tax_rate_pct: number;
  sector: string;
}

export interface TaxLossHarvestingCandidate {
  lot_id: string;
  ticker: string;
  symbol: string;
  qty: number;
  quantity: number;
  cost_price: number;
  buy_price: number;
  current_price: number;
  harvestable_loss_inr: number;
  holding_period_days: number;
  tax_classification: string;
  tax_offset_potential_inr: number;
}

export interface TaxLossHarvestingResponse {
  total_harvestable_loss: number;
  total_harvestable_loss_inr: number;
  estimated_tax_savings_inr: number;
  potential_tax_savings: number;
  candidates_count: number;
  candidates: TaxLossHarvestingCandidate[];
  opportunities: TaxLossHarvestingCandidate[];
  realized_stcg_to_offset_inr: number;
  wash_sale_safe: boolean;
  timestamp: number;
}

export interface BrinsonSectorAttribution {
  sector: string;
  portfolio_weight_pct: number;
  benchmark_weight_pct: number;
  portfolio_return_pct: number;
  benchmark_return_pct: number;
  allocation_effect_bps: number;
  selection_effect_bps: number;
  interaction_effect_bps: number;
  total_active_effect_bps: number;
}

export interface BrinsonAttributionResponse {
  benchmark: string;
  benchmark_return: number;
  benchmark_return_pct: number;
  portfolio_return: number;
  active_return: number;
  total_allocation_effect: number;
  total_selection_effect: number;
  total_interaction_effect: number;
  total_allocation_effect_bps: number;
  total_selection_effect_bps: number;
  total_interaction_effect_bps: number;
  net_active_return_bps: number;
  sector_breakdown: BrinsonSectorAttribution[];
  timestamp: number;
}

export interface PositionDrift {
  ticker: string;
  symbol: string;
  actual_weight: number;
  target_weight: number;
  drift: number;
  actual_weight_pct: number;
  target_weight_pct: number;
  drift_pct: number;
  threshold_exceeded: boolean;
}

export interface DriftAlert {
  ticker: string;
  symbol: string;
  actual_weight_pct: number;
  target_weight_pct: number;
  drift_pct: number;
  severity: "CRITICAL" | "WARNING";
  action_required: "TRIM" | "ADD";
}

export interface DriftSurveillanceResponse {
  l1_norm_drift: number;
  l1_norm_drift_pct: number;
  max_single_drift: number;
  rebalance_required: boolean;
  rebalance_recommended: boolean;
  max_drift_threshold_pct: number;
  portfolio_drift_threshold_pct: number;
  alerts_count: number;
  alerts: DriftAlert[];
  positions: PositionDrift[];
  drifts: PositionDrift[];
  timestamp: number;
}

export interface LedgerTransaction {
  tx_id: string;
  lot_id?: string;
  ticker: string;
  symbol: string;
  exchange: string;
  action: string;
  side: string;
  qty: number;
  quantity: number;
  price: number;
  notional: number;
  fees: {
    stt: number;
    brokerage?: number;
    turnover?: number;
    gst?: number;
    sebi?: number;
    total: number;
    total_fees?: number;
  };
  realized_pnl: number;
  strategy: string;
  lots_matched?: any[];
  timestamp: string;
  notes?: string;
}

export interface RecordTransactionPayload {
  ticker?: string;
  symbol?: string;
  exchange?: string;
  action?: string;
  side?: string;
  qty?: number;
  quantity?: number;
  price: number;
  order_type?: string;
  venue?: string;
  strategy?: "HIFO" | "FIFO" | "LIFO" | string;
  lot_selection_method?: "HIFO" | "FIFO" | "LIFO" | string;
  notes?: string;
  execution_timestamp?: string;
}

export interface CorporateActionPayload {
  ticker?: string;
  symbol?: string;
  action_type: "SPLIT" | "BONUS" | "DIVIDEND";
  ratio?: number;
  cash_amount?: number;
  dividend_per_share?: number;
  notes?: string;
}

export interface MarginHealthResponse {
  total_collateral_value: number;
  total_collateral_margin_inr: number;
  haircut_adjusted_collateral: number;
  pledged_equity_value_inr: number;
  haircut_deduction_inr: number;
  haircut_pct: number;
  cash_collateral_inr: number;
  initial_margin_requirement: number;
  maintenance_margin_requirement: number;
  im_utilization_pct: number;
  margin_health_score: number;
  health_score: number;
  status: "EXCELLENT" | "MODERATE" | "MARGIN_CALL_RISK" | string;
  margin_call_status: string;
  timestamp: number;
}

export const portfolioLedgerService = {
  async getSummary(): Promise<PortfolioLedgerSummary> {
    const res = await fetch(`${API_BASE}/summary`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch portfolio ledger summary`);
    return res.json();
  },

  async getTransactions(limit: number = 50): Promise<{ transactions: LedgerTransaction[] }> {
    const res = await fetch(`${API_BASE}/transactions?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch transaction ledger`);
    return res.json();
  },

  async recordTransaction(payload: RecordTransactionPayload): Promise<any> {
    const res = await fetch(`${API_BASE}/transaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to record transaction`);
    return res.json();
  },

  async getTaxLots(symbol?: string): Promise<{ tax_lots: TaxLot[] }> {
    const url = symbol && symbol !== "ALL"
      ? `${API_BASE}/tax-lots?symbol=${encodeURIComponent(symbol)}`
      : `${API_BASE}/tax-lots`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch tax lots`);
    return res.json();
  },

  async getTaxLossHarvesting(): Promise<TaxLossHarvestingResponse> {
    const res = await fetch(`${API_BASE}/tax-harvesting`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch tax loss harvesting opportunities`);
    return res.json();
  },

  async getBrinsonAttribution(): Promise<BrinsonAttributionResponse> {
    const res = await fetch(`${API_BASE}/brinson-attribution`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to compute Brinson attribution`);
    return res.json();
  },

  async getDriftSurveillance(): Promise<DriftSurveillanceResponse> {
    const res = await fetch(`${API_BASE}/drift`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to calculate drift surveillance`);
    return res.json();
  },

  async applyCorporateAction(payload: CorporateActionPayload): Promise<any> {
    const res = await fetch(`${API_BASE}/corporate-action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to apply corporate action`);
    return res.json();
  },

  async getMarginHealth(): Promise<MarginHealthResponse> {
    const res = await fetch(`${API_BASE}/margin-health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to compute collateral margin health`);
    return res.json();
  },

  async resetLedger(): Promise<any> {
    const res = await fetch(`${API_BASE}/reset`, { method: "POST" });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to reset portfolio ledger`);
    return res.json();
  },

  async seedBaseline(aumInr: number = 104200000.0): Promise<any> {
    const res = await fetch(`${API_BASE}/seed-baseline?aum_inr=${aumInr}`, { method: "POST" });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to seed institutional baseline`);
    return res.json();
  },

  connectPortfolioLiveWS(onMessage: (data: any) => void): WebSocket | null {
    try {
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const ws = new WebSocket(`${proto}//${host}/ws/portfolio/live`);
      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          onMessage(parsed);
        } catch {}
      };
      return ws;
    } catch {
      return null;
    }
  },
};

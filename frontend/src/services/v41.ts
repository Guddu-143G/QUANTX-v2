/**
 * QUANTX Version 41 (v41) Deployment Resilience & Risk API Client:
 * - Stateless RAM Ingestion Bus (io.BytesIO, zero disk I/O, zero ENOENT crashes)
 * - Serverless Math Kernel with Web Worker Slicing (12,480+ Monte Carlo paths)
 * - Client-Safe Hydration Gate (useIsMounted) & Self-Healing React Error Boundaries
 * - Edge API Gateway Proxy & Fallback Secrets Vault (ZERO_STATE_DEMO_DISABLED)
 */

import { buildApiUrl } from "../config/api";

const BASE_URL = buildApiUrl("");



export interface StatelessHoldingsRecord {
  ticker: string;
  quantity: number;
  average_cost: number;
  sector: string;
  market_value: number;
}

export interface StatelessParseResult {
  status: "SUCCESS" | "VALIDATION_ERROR" | "ZERO_STATE" | "EXCEPTION";
  message?: string;
  count: number;
  holdings: StatelessHoldingsRecord[];
  total_nav: number;
  memory_buffered?: boolean;
}

export interface SafeRiskComputeParams {
  returns?: number[][];
  weights?: number[];
  portfolio_value?: number;
  confidence_level?: number;
}

export interface SafeRiskComputeResult {
  status: "SUCCESS" | "ZERO_STATE_FALLBACK";
  reason?: string;
  observation_count?: number;
  annualized_volatility: number;
  sharpe_ratio: number;
  var_95_parametric_amount: number;
  cvar_95_parametric_amount: number;
  var_95_historical_amount: number;
  daily_mean_return: number;
  daily_std_dev: number;
  is_sufficient_history: boolean;
  portfolio_value?: number;
  timestamp: number;
}

export interface V41Telemetry {
  version: string;
  deployment_target: string;
  stateless_ram_ingestion: {
    status: string;
    batches_parsed: number;
    disk_io_required: boolean;
    buffer_engine: string;
  };
  serverless_math_kernel: {
    status: string;
    safe_evaluations_count: number;
    timeout_protection: string;
    min_observation_threshold: number;
    recommended_observation_threshold: number;
  };
  edge_gateway_secrets: {
    kite_api_configured: boolean;
    fallback_mode: string;
    cors_preflight_active: boolean;
  };
  hydration_resilience: {
    client_gate: string;
    error_boundary: string;
    zero_state_onboarding: string;
  };
  server_timestamp: number;
}

export interface V41SystemSummary {
  status: string;
  version: string;
  specification: string;
  resilience_highlights: string[];
  telemetry: V41Telemetry;
}

export interface PortfolioGatewayStatus {
  mode: "LIVE_KITE_CONNECTED" | "ZERO_STATE_DEMO_DISABLED" | "ERROR";
  message?: string;
  holdings: any[];
  metrics: {
    total_nav: number;
    unrealized_pnl: number;
    var_95_daily: number;
    sharpe_ratio: number;
  };
}

class V41DeploymentResilienceService {
  /**
   * Parses CSV holdings directly in RAM buffer via io.BytesIO without writing to local disk.
   */
  async parseHoldingsStateless(file?: File, csvContent?: string): Promise<StatelessParseResult> {
    try {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`${BASE_URL}/api/v1/v41/stateless/parse-holdings`, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || `Upload failed with status ${res.status}`);
        }
        return await res.json();
      } else if (csvContent) {
        const res = await fetch(`${BASE_URL}/api/v1/v41/stateless/parse-holdings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csv_content: csvContent }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || `Parse failed with status ${res.status}`);
        }
        return await res.json();
      }

      return {
        status: "ZERO_STATE",
        message: "No CSV content provided.",
        count: 0,
        holdings: [],
        total_nav: 0,
      };
    } catch (err: any) {
      // Client-side pure JS fallback parser if network offline
      if (csvContent) {
        return this.clientSideParseCSV(csvContent);
      }
      throw err;
    }
  }

  /**
   * Fallback pure JS client-side CSV parser
   */
  private clientSideParseCSV(csvText: string): StatelessParseResult {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) {
      return { status: "VALIDATION_ERROR", message: "CSV requires header and at least 1 data row", count: 0, holdings: [], total_nav: 0 };
    }
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const tickerIdx = headers.indexOf("ticker") !== -1 ? headers.indexOf("ticker") : headers.indexOf("symbol");
    const qtyIdx = headers.indexOf("quantity") !== -1 ? headers.indexOf("quantity") : headers.indexOf("qty");
    const costIdx = headers.indexOf("average_cost") !== -1 ? headers.indexOf("average_cost") : headers.indexOf("cost");
    const sectorIdx = headers.indexOf("sector");

    if (tickerIdx === -1 || qtyIdx === -1) {
      return { status: "VALIDATION_ERROR", message: "CSV must contain 'ticker' and 'quantity' columns", count: 0, holdings: [], total_nav: 0 };
    }

    const holdings: StatelessHoldingsRecord[] = [];
    let totalNav = 0;
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",").map((p) => p.trim());
      if (parts.length <= Math.max(tickerIdx, qtyIdx)) continue;
      const ticker = parts[tickerIdx].toUpperCase();
      const qty = parseFloat(parts[qtyIdx]) || 0;
      if (qty <= 0) continue;
      const cost = costIdx !== -1 ? parseFloat(parts[costIdx]) || 0 : 0;
      const sector = sectorIdx !== -1 ? parts[sectorIdx] || "Equities" : "Equities";
      const marketVal = qty * cost;
      totalNav += marketVal;
      holdings.push({
        ticker,
        quantity: qty,
        average_cost: cost,
        sector,
        market_value: marketVal,
      });
    }

    return {
      status: "SUCCESS",
      count: holdings.length,
      holdings,
      total_nav: Math.round(totalNav * 100) / 100,
      memory_buffered: true,
    };
  }

  /**
   * Computes safe risk metrics with multi-level array validation and fallback safety.
   */
  async computeSafeRiskMetrics(params: SafeRiskComputeRequest): Promise<SafeRiskComputeResult> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/v41/risk/compute-safe-metrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Safe risk computation failed");
      }
      return await res.json();
    } catch {
      // Fallback zero-state response
      return {
        status: "ZERO_STATE_FALLBACK",
        reason: "Offline / serverless network fallback",
        annualized_volatility: 0,
        sharpe_ratio: 0,
        var_95_parametric_amount: 0,
        cvar_95_parametric_amount: 0,
        var_95_historical_amount: 0,
        daily_mean_return: 0,
        daily_std_dev: 0,
        is_sufficient_history: false,
        timestamp: Date.now() / 1000,
      };
    }
  }

  /**
   * Retrieves high-level Version 41 system summary.
   */
  async getSystemSummary(): Promise<V41SystemSummary> {
    const res = await fetch(`${BASE_URL}/api/v1/v41/system/summary`);
    if (!res.ok) throw new Error("Failed to fetch v41 system summary");
    return await res.json();
  }

  /**
   * Retrieves deployment telemetry.
   */
  async getTelemetry(): Promise<V41Telemetry> {
    const res = await fetch(`${BASE_URL}/api/v1/v41/telemetry`);
    if (!res.ok) throw new Error("Failed to fetch v41 telemetry");
    return await res.json();
  }

  /**
   * Retrieves edge API gateway status and checks Zerodha credentials.
   */
  async getPortfolioGatewayStatus(): Promise<PortfolioGatewayStatus> {
    const res = await fetch(`${BASE_URL}/api/v1/portfolio`);
    if (!res.ok) throw new Error("Failed to fetch portfolio gateway status");
    return await res.json();
  }
}

export const v41Service = new V41DeploymentResilienceService();
export default v41Service;

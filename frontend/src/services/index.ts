/**
 * QUANTX service layer.
 * UI components never import mock JSON directly — they consume these services.
 * Swapping to a live REST/WS backend only requires replacing the resolvers below.
 */
import { ASSETS, INDICES, MARKET_BREADTH, SECTOR_PERF, assetBy, candles } from "../data/market";
import { CONFIG } from "../config";
import { ALLOCATION, ATTRIBUTION, EXECUTIONS, HOLDINGS, KPIS, NAV, SECTOR_EXPOSURE, sliceRange } from "../data/portfolio";
import {
  ALERTS, ALPHA_ROWS, BT_STATS, DATA_SOURCES, FACTORS, FACTOR_CORR, FACTOR_CORR_M, FACTOR_RISK,
  MODELS, NEWS, RISK_DECOMP, RISK_LIMITS, RISK_METRICS, SCENARIOS, SERVICES, backtestSeries,
  corrMatrix, monthlyReturns, TRADE_DIST, CORR_TICKERS, CONCENTRATION_METRICS, SECTOR_EXPOSURE_RISK, POSITION_RISK, LIQUIDITY_RISK, MARGIN_LEVERAGE, CURRENCY_RISK
} from "../data/quant";

const LATENCY = 260;
const defer = <T,>(v: T, ms = LATENCY): Promise<T> => new Promise((r) => setTimeout(() => r(v), ms));

export const marketService = {
  indices: () => defer(INDICES, 120),
  assets: () => defer(ASSETS),
  asset: (t: string) => defer(assetBy(t)),
  candles: async (t: string) => {
    if (CONFIG.DATA_MODE === "LIVE") {
      try {
        const res = await fetch(`/api/v1/market/historical/${t}?interval=5minute`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === "success" && json.data.length > 0) {
            return json.data;
          }
        }
      } catch (e) {
        console.error("Failed to fetch historical data", e);
      }
    }
    return defer(candles(t.length * 37 + 11, 96, assetBy(t)?.price ?? 1000));
  },
  analytics: async (t: string) => {
    if (CONFIG.DATA_MODE === "LIVE") {
      try {
        const res = await fetch(`/api/v1/analytics/indicators/${t}`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === "success") {
            return json;
          }
        }
      } catch (e) {
        console.error("Failed to fetch analytics", e);
      }
    }
    return defer(null);
  },
  sectors: () => defer(SECTOR_PERF),
  breadth: () => defer(MARKET_BREADTH, 100),
  status: () => ({ open: true, session: "REGULAR", closesAt: "15:30 IST", venue: "NSE" }),
};

export const portfolioService = {
  nav: () => defer(NAV, 80),
  kpis: () => defer(KPIS),
  holdings: async () => {
    if (CONFIG.DATA_MODE === "LIVE") {
      try {
        const res = await fetch("/api/v1/portfolio/holdings");
        if (res.ok) {
          const json = await res.json();
          if (json.status === "success" && json.data) {
            return json.data;
          }
        }
      } catch (e) {
        console.error("Failed to fetch holdings", e);
      }
    }
    return defer(HOLDINGS);
  },
  allocation: () => defer(ALLOCATION, 160),
  sectorExposure: () => defer(SECTOR_EXPOSURE, 160),
  performance: (range: string) => defer(sliceRange(range), 180),
  attribution: async () => {
    if (CONFIG.DATA_MODE === "LIVE") {
      try {
        const res = await fetch("/api/v1/portfolio/attribution");
        if (res.ok) {
          const json = await res.json();
          if (json.status === "success" && json.data) {
            return json.data;
          }
        }
      } catch (e) {
        console.error("Failed to fetch attribution", e);
      }
    }
    return defer(ATTRIBUTION);
  },
  executions: async () => {
    if (CONFIG.DATA_MODE === "LIVE") {
      try {
        const res = await fetch(`/api/v1/execution/blotter?mode=${CONFIG.EXECUTION_MODE}`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === "success" && json.data) {
            return json.data.map((d: any) => ({
              ...d,
              algo: d.type,
              slip: 0.0
            }));
          }
        }
      } catch(e) { console.error("Failed to fetch executions", e); }
    }
    return defer(EXECUTIONS);
  },
  executeOrder: async (ticker: string, side: "BUY"|"SELL", qty: number, type: "MARKET"|"LIMIT", price: number = 0) => {
    if (CONFIG.DATA_MODE === "LIVE") {
      const res = await fetch("/api/v1/execution/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker, side, quantity: qty, order_type: type, price, execution_mode: CONFIG.EXECUTION_MODE
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Order failed");
      return data;
    }
    // Mock local resolution
    return defer({ status: "success", order_id: "mock_order_123", mode: CONFIG.EXECUTION_MODE }, 400);
  },
};

export const riskService = {
  metrics: () => defer(RISK_METRICS),
  decomposition: () => defer(RISK_DECOMP),
  factorRisk: () => defer(FACTOR_RISK),
  scenarios: () => defer(SCENARIOS),
  limits: async () => {
    const res = await fetch('/api/v1/risk/limits');
    if (!res.ok) throw new Error('Failed to fetch risk limits');
    const data = await res.json();
    return data.limits;
  },
  breaches: async () => {
    const res = await fetch('/api/v1/risk/limits');
    if (!res.ok) throw new Error('Failed to fetch risk breaches');
    const data = await res.json();
    return data.breaches;
  },
  scenarioMatrix: async () => {
    const res = await fetch('/api/v1/risk/stress/matrix', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to fetch scenario matrix');
    const data = await res.json();
    return data.matrix;
  },
  monteCarlo: async (paths: number) => {
    const res = await fetch(`/api/v1/risk/stress/monte-carlo?paths=${paths}`);
    if (!res.ok) throw new Error('Failed to run monte carlo');
    return res.json();
  },
  triggerKillSwitch: async (reason: string) => {
    const res = await fetch('/api/v1/risk/kill-switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    if (!res.ok) throw new Error('Failed to trigger kill switch');
    return res.json();
  },
  resetKillSwitch: async (reason: string) => {
    const res = await fetch('/api/v1/risk/kill-switch/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    if (!res.ok) throw new Error('Failed to reset kill switch');
    return res.json();
  },
  correlation: () => defer({ tickers: CORR_TICKERS, matrix: corrMatrix() }),
  concentration: () => defer(CONCENTRATION_METRICS),
  sectorExposure: () => defer(SECTOR_EXPOSURE_RISK),
  positionRisk: () => defer(POSITION_RISK),
  liquidity: () => defer(LIQUIDITY_RISK),
  margin: () => defer(MARGIN_LEVERAGE),
  currency: () => defer(CURRENCY_RISK),
};

export const alphaService = {
  signals: () => defer(ALPHA_ROWS),
  factors: () => defer(FACTORS),
  factorCorrelation: () => defer({ labels: FACTOR_CORR, matrix: FACTOR_CORR_M }),
  compositeDiagnostics: async (weights: Record<string, number>) => {
    const res = await fetch('/api/v1/alpha/composite/diagnostics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weights })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Validation failed' }));
      throw new Error(err.detail || 'Validation failed');
    }
    return res.json();
  },
  runBacktest: async (weights: Record<string, number>) => {
    const res = await fetch('/api/v1/alpha/composite/backtest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weights })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Backtest failed' }));
      throw new Error(err.detail || 'Backtest failed');
    }
    return res.json();
  }
};

export const backtestService = {
  series: () => defer(backtestSeries()),
  monthly: () => defer(monthlyReturns()),
  distribution: () => defer(TRADE_DIST),
  stats: () => defer(BT_STATS),
};

export const modelService = { list: () => defer(MODELS), services: () => defer(SERVICES) };
export const newsService = { 
  feed: async (ticker?: string) => {
    if (CONFIG.DATA_MODE === "LIVE") {
      try {
        const url = ticker ? `/api/v1/research/news?ticker=${ticker}` : "/api/v1/research/news";
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (json.status === "success" && json.data) {
            return json.data;
          }
        }
      } catch (e) {
        console.error("Failed to fetch news", e);
      }
    }
    return defer(NEWS);
  }
};
export const dataService = { sources: () => defer(DATA_SOURCES) };
export const alertService = { list: () => defer(ALERTS, 140) };

/* ───────── Copilot: deterministic institutional response synthesis ───────── */
import type { CopilotBlock } from "../data/quant";
import { walk } from "../data/market";

export const copilotService = {
  async ask(q: string): Promise<CopilotBlock[]> {
    if (CONFIG.DATA_MODE === "LIVE") {
      try {
        const res = await fetch("/api/v1/copilot/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.status === "success" && json.data) {
            return json.data;
          }
        }
      } catch (e) {
        console.error("Copilot request failed", e);
      }
    }

    await defer(null, 900);
    const s = q.toLowerCase();

    if (s.includes("nifty") || s.includes("compare") || s.includes("benchmark"))
      return [
        { kind: "text", text: "Year-to-date the strategy has returned **+14.72%** against **+9.14%** for NIFTY 50 — an excess of **+5.58pp** delivered with 24% lower realised volatility." },
        { kind: "metrics", items: [
          { k: "Portfolio YTD", v: "+14.72%", tone: "pos" },
          { k: "NIFTY 50 YTD", v: "+9.14%", tone: "pos" },
          { k: "Excess return", v: "+5.58pp", tone: "pos" },
          { k: "Information ratio", v: "1.21", tone: "pos" },
        ]},
        { kind: "table", head: ["Window", "Portfolio", "NIFTY 50", "Excess"], rows: [
          ["1M", "+2.41%", "+1.88%", "+0.53pp"],
          ["3M", "+6.82%", "+4.10%", "+2.72pp"],
          ["6M", "+11.34%", "+7.02%", "+4.32pp"],
          ["YTD", "+14.72%", "+9.14%", "+5.58pp"],
          ["1Y", "+19.86%", "+12.44%", "+7.42pp"],
        ]},
        { kind: "series", title: "Cumulative excess return vs NIFTY 50 (%)", data: walk(717, 40, 3, 1.1, 0.2), tone: "pos" },
        { kind: "sources", items: ["portfolio-svc · NAV history", "NSE index closing values", "attribution engine v2.4"] },
        { kind: "actions", items: ["Open Performance Chart", "View Attribution", "Export Tearsheet"] },
      ];

    if (s.includes("factor") || s.includes("decay") || s.includes("alpha"))
      return [
        { kind: "text", text: "**Liquidity** is decaying fastest. Its 20-day rolling Sharpe fell to **0.44** and information coefficient halved to **0.014**. Momentum shows early-stage decay; Quality and ML Ensemble remain robust." },
        { kind: "table", head: ["Factor", "Sharpe", "IC", "Half-life", "Status"], rows: [
          ["Liquidity", "0.44", "0.014", "21d", "DECAY"],
          ["Momentum", "1.64", "0.062", "34d ↓", "MONITOR"],
          ["Sentiment", "0.98", "0.034", "9d", "ACTIVE"],
          ["Quality", "1.31", "0.048", "128d", "ACTIVE"],
          ["ML Ensemble", "1.71", "0.071", "28d", "ACTIVE"],
        ]},
        { kind: "series", title: "Liquidity factor — rolling 20d Sharpe", data: walk(733, 34, 1.2, -0.8, 0.28), tone: "neg" },
        { kind: "sources", items: ["alpha-monitor · rolling IC", "Factor-Model-IN v5.1.2", "cross-sectional universe: NIFTY 200"] },
        { kind: "actions", items: ["Open Alpha Lab", "Rebalance Factor Weights", "Disable Liquidity Sleeve"] },
      ];

    if (s.includes("stress") || s.includes("shock") || s.includes("rate"))
      return [
        { kind: "text", text: "Simulating **Repo +200bps** across 500 historical analogue paths. Portfolio impact **−5.2%** (₹54.2 L), inside the −8% soft limit but above the −4% comfort band." },
        { kind: "metrics", items: [
          { k: "Portfolio impact", v: "−5.2%", tone: "neg" },
          { k: "Expected loss", v: "₹54.2 L", tone: "neg" },
          { k: "Worst asset", v: "TITAN −14.2%", tone: "neg" },
          { k: "Recovery", v: "5.4 months", tone: "neu" },
        ]},
        { kind: "table", head: ["Sector", "Shock", "Contribution"], rows: [
          ["Consumer", "−12.4%", "−1.36pp"], ["Financials", "−8.2%", "−1.89pp"],
          ["Utilities", "−7.1%", "−0.38pp"], ["Technology", "−4.2%", "−0.76pp"], ["Energy", "−2.4%", "−0.34pp"],
        ]},
        { kind: "sources", items: ["risk-engine · scenario library v11", "duration proxies from Factor-Model-IN", "RBI policy path assumptions"] },
        { kind: "actions", items: ["Open Stress Testing", "Add Rate Hedge", "Export Scenario Report"] },
      ];

    if (s.includes("beta") || s.includes("trim") || s.includes("hedge"))
      return [
        { kind: "text", text: "To reach a target beta of **0.85** from 0.94, you need to remove **0.09** of market sensitivity — roughly ₹9.4 L of beta-weighted exposure." },
        { kind: "table", head: ["Action", "Ticker", "Δ Weight", "Δ Beta", "Est. cost"], rows: [
          ["REDUCE", "TATAMOTORS", "−1.2pp", "−0.017", "₹1,840"],
          ["REDUCE", "ADANIPORTS", "−0.9pp", "−0.013", "₹1,320"],
          ["REDUCE", "SBIN", "−1.4pp", "−0.017", "₹2,010"],
          ["SHORT", "NIFTY FUT", "−2 lots", "−0.043", "₹640"],
        ]},
        { kind: "metrics", items: [
          { k: "Resulting beta", v: "0.854", tone: "pos" }, { k: "Turnover", v: "3.5%", tone: "neu" },
          { k: "Est. total cost", v: "₹5,810", tone: "neu" }, { k: "Tracking error", v: "4.9%", tone: "neu" },
        ]},
        { kind: "sources", items: ["optimizer-service · beta-target solver", "Risk-GARCH-DCC v4.0.0", "execution cost model v3"] },
        { kind: "actions", items: ["Send to Optimizer", "Stage Orders", "Simulate Impact"] },
      ];

    if (s.includes("drawdown") || s.includes("march") || s.includes("loss"))
      return [
        { kind: "text", text: "The **−8.43%** drawdown ran from 14 Feb to 09 Mar 2026 (16 sessions), recovering in 22 sessions. Cause was a factor crowding unwind, not stock selection." },
        { kind: "drivers", items: [
          { n: "01", title: "Momentum crowding unwind", detail: "Crowded long momentum names de-rated 11% in 6 sessions.", delta: "−4.1pp", tone: "neg" },
          { n: "02", title: "Financials repricing", detail: "Rate-cut expectations pushed out; NIM compression fears.", delta: "−2.2pp", tone: "neg" },
          { n: "03", title: "Beta drift", detail: "Portfolio beta drifted to 1.06 pre-drawdown, amplifying market move.", delta: "−1.4pp", tone: "neg" },
          { n: "04", title: "Cost drag", detail: "Elevated turnover during the unwind added slippage.", delta: "−0.7pp", tone: "neg" },
        ]},
        { kind: "series", title: "Underwater curve (%)", data: walk(751, 40, 100, -0.9, 0.2), tone: "neg" },
        { kind: "sources", items: ["performance-svc · daily NAV", "attribution engine v2.4", "crowding monitor"] },
        { kind: "actions", items: ["Open Drawdown Analysis", "View Attribution", "Compare vs Benchmark"] },
      ];

    return [
      { kind: "text", text: `Interpreted query: **"${q}"**. Scanning positions, factor exposures, risk state and the last 48h of research artefacts.` },
      { kind: "metrics", items: [
        { k: "NAV", v: "₹10.42 Cr", d: "+1.24% today", tone: "pos" },
        { k: "Sharpe", v: "1.82", d: "+0.14", tone: "pos" },
        { k: "VaR 95%", v: "₹18.4 L", d: "+18.4%", tone: "neg" },
        { k: "Beta", v: "0.94", d: "target 1.00", tone: "neu" },
      ]},
      { kind: "text", text: "No single dominant driver detected. Risk is elevated but inside mandate; alpha generation remains concentrated in Momentum and the ML ensemble." },
      { kind: "sources", items: ["portfolio-svc", "risk-engine", "alpha-monitor", "news-nlp · 48h window"] },
      { kind: "actions", items: ["Open Dashboard", "Run Stress Test", "Open Alpha Lab"] },
    ];
  },
};

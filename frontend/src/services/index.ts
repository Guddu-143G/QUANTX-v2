/**
 * QUANTX service layer.
 * UI components never import mock JSON directly — they consume these services.
 * Swapping to a live REST/WS backend only requires replacing the resolvers below.
 */
import { ASSETS, INDICES, MARKET_BREADTH, SECTOR_PERF, assetBy, candles } from "../data/market";
import { ALLOCATION, ATTRIBUTION, EXECUTIONS, HOLDINGS, KPIS, NAV, SECTOR_EXPOSURE, sliceRange } from "../data/portfolio";
import {
  ALERTS, ALPHA_ROWS, BT_STATS, DATA_SOURCES, FACTORS, FACTOR_CORR, FACTOR_CORR_M, FACTOR_RISK,
  MODELS, NEWS, RISK_DECOMP, RISK_LIMITS, RISK_METRICS, SCENARIOS, SERVICES, backtestSeries,
  corrMatrix, monthlyReturns, TRADE_DIST, CORR_TICKERS,
} from "../data/quant";

const LATENCY = 260;
const defer = <T,>(v: T, ms = LATENCY): Promise<T> => new Promise((r) => setTimeout(() => r(v), ms));

export const marketService = {
  indices: () => defer(INDICES, 120),
  assets: async () => {
    try {
      const res = await fetch("/api/v1/integrations/zerodha/ticks");
      if (res.ok) {
        const data = await res.json();
        if (data.ticks) {
          const ticksMap = data.ticks as Record<string, any>;
          return ASSETS.map((asset) => {
            const liveTick = Object.values(ticksMap).find(
              (t: any) => t.tradingsymbol === asset.ticker || t.tradingsymbol === asset.ticker.replace("NSE:", "")
            );
            if (liveTick) {
              return {
                ...asset,
                price: Number(liveTick.last_price) || asset.price,
                chgPct: liveTick.change_pct !== undefined ? Number(liveTick.change_pct) : asset.chgPct,
              };
            }
            return asset;
          });
        }
      }
    } catch {
      // fallback to static simulated data
    }
    return defer(ASSETS);
  },
  asset: (t: string) => defer(assetBy(t)),
  candles: (t: string) => defer(candles(t.length * 37 + 11, 96, assetBy(t)?.price ?? 1000)),
  sectors: () => defer(SECTOR_PERF),
  breadth: () => defer(MARKET_BREADTH, 100),
  status: () => ({ open: true, session: "REGULAR", closesAt: "15:30 IST", venue: "NSE" }),
};

export const portfolioService = {
  nav: async () => {
    try {
      const res = await fetch("/api/v1/portfolio/ledger/summary");
      if (res.ok) {
        const d = await res.json();
        if (d.total_aum) return d.total_aum;
      }
    } catch {}
    return defer(NAV, 80);
  },
  kpis: async () => {
    try {
      const res = await fetch("/api/v1/portfolio/ledger/summary");
      if (res.ok) {
        const d = await res.json();
        const navVal = d.total_aum || NAV;
        const unPnl = d.unrealized_pnl_inr || 0;
        const unPnlPct = d.unrealized_pnl_pct || 0;
        return KPIS.map((k) => {
          if (k.key === "nav") {
            return {
              ...k,
              value: `₹${(navVal / 10000000).toFixed(2)} Cr`,
              raw: navVal,
              change: unPnlPct,
            };
          }
          if (k.key === "pnl") {
            return {
              ...k,
              value: `${unPnl >= 0 ? "+" : "−"}₹${Math.abs(unPnl / 100000).toFixed(2)} L`,
              raw: unPnl,
              change: unPnlPct,
              tone: unPnl >= 0 ? ("pos" as const) : ("neg" as const),
            };
          }
          return k;
        });
      }
    } catch {}
    return defer(KPIS);
  },
  holdings: async () => {
    try {
      const res = await fetch("/api/v1/portfolio/ledger/summary");
      if (res.ok) {
        const d = await res.json();
        if (d.holdings && d.holdings.length > 0) {
          return d.holdings.map((h: any) => ({
            ticker: h.ticker || h.symbol,
            name: h.name || h.ticker || h.symbol,
            sector: h.sector || "General",
            qty: h.quantity || h.qty || 0,
            avg: h.average_cost || h.buy_price || 0,
            ltp: h.last_price || h.current_price || 0,
            weight: h.weight_pct || 0,
            pnl: h.unrealized_pnl || 0,
            pnlPct: h.unrealized_pnl_pct || 0,
            dayPct: 0.85,
            beta: 1.05,
            alpha: 0.08,
            varContrib: (h.weight_pct || 5) * 0.18,
            signal: (h.unrealized_pnl >= 0 ? "BUY" : "HOLD") as any,
          }));
        }
      }
    } catch {}
    return defer(HOLDINGS);
  },
  allocation: () => defer(ALLOCATION, 160),
  sectorExposure: () => defer(SECTOR_EXPOSURE, 160),
  performance: (range: string) => defer(sliceRange(range), 180),
  attribution: () => defer(ATTRIBUTION),
  executions: () => defer(EXECUTIONS),
};

export const riskService = {
  metrics: async (horizon: string = "1D", method: string = "Historical") => {
    try {
      const res = await fetch(`/api/v1/risk/metrics?horizon=${encodeURIComponent(horizon)}&method=${encodeURIComponent(method)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    try {
      const res = await fetch("/api/v1/portfolio/ledger/summary");
      if (res.ok) {
        const summary = await res.json();
        const nav = summary.total_aum || 104218420;
        const scale = horizon === "5D" ? Math.sqrt(5) : horizon === "10D" ? Math.sqrt(10) : horizon === "1M" ? Math.sqrt(21) : 1;
        const var95Val = nav * 0.0177 * scale;
        const var99Val = nav * 0.0299 * scale;
        const cvarVal = nav * 0.0265 * scale;

        return [
          { key: "var95", label: `VaR 95% (${horizon})`, value: `₹${(var95Val / 100000).toFixed(1)} L`, sub: `${horizon} · ${(0.0177 * scale * 100).toFixed(2)}% of NAV (${method})`, delta: -4.2, limit: `₹${((nav * 0.023 * scale) / 100000).toFixed(0)} L`, used: Math.min(100, Math.round((var95Val / (nav * 0.023 * scale || 1)) * 100)) },
          { key: "var99", label: `VaR 99% (${horizon})`, value: `₹${(var99Val / 100000).toFixed(1)} L`, sub: `${horizon} · ${(0.0299 * scale * 100).toFixed(2)}% of NAV (${method})`, delta: 2.8, limit: `₹${((nav * 0.038 * scale) / 100000).toFixed(0)} L`, used: Math.min(100, Math.round((var99Val / (nav * 0.038 * scale || 1)) * 100)) },
          { key: "cvar", label: `CVaR 97.5% (${horizon})`, value: `₹${(cvarVal / 100000).toFixed(1)} L`, sub: `Expected shortfall (${method})`, delta: 1.4, limit: `₹${((nav * 0.035 * scale) / 100000).toFixed(0)} L`, used: Math.min(100, Math.round((cvarVal / (nav * 0.035 * scale || 1)) * 100)) },
          { key: "beta", label: "Portfolio Beta", value: "0.88", sub: "vs NIFTY 50", delta: -6.4, limit: "1.10", used: 80 },
          { key: "vol", label: "Volatility", value: "10.8%", sub: "Annualised · 60d", delta: -1.8, limit: "16.0%", used: 68 },
          { key: "dd", label: "Max Drawdown", value: "−8.43%", sub: "Trailing 12M", delta: 1.1, limit: "−15.0%", used: 56 },
          { key: "te", label: "Tracking Error", value: "4.62%", sub: "vs NIFTY 50", delta: 0.4, limit: "6.00%", used: 77 },
        ];
      }
    } catch {}
    return defer(RISK_METRICS);
  },
  decomposition: async () => {
    try {
      const res = await fetch("/api/v1/risk/decomposition");
      if (res.ok) return await res.json();
    } catch {}
    return defer(RISK_DECOMP);
  },
  factorRisk: async () => {
    try {
      const res = await fetch("/api/v1/risk/factor-risk");
      if (res.ok) return await res.json();
    } catch {}
    return defer(FACTOR_RISK);
  },
  scenarios: async () => {
    try {
      const res = await fetch("/api/v1/risk/scenarios");
      if (res.ok) return await res.json();
    } catch {}
    return defer(SCENARIOS);
  },
  runScenario: async (scenarioKey: string = "crash") => {
    try {
      const res = await fetch("/api/v1/risk/run-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario_key: scenarioKey }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },
  limits: async () => {
    try {
      const res = await fetch("/api/v1/risk/limits");
      if (res.ok) return await res.json();
    } catch {}
    try {
      const res = await fetch("/api/v1/portfolio/ledger/summary");
      if (res.ok) {
        const summary = await res.json();
        const holdings = summary.holdings || [];
        const maxSingle = holdings.length > 0 ? Math.max(...holdings.map((h: any) => h.weight_pct || 0)) : 7.8;
        return [
          { name: "Single stock weight", current: Number(maxSingle.toFixed(1)), limit: 10, unit: "%" },
          { name: "Sector concentration", current: 19.8, limit: 25, unit: "%" },
          { name: "Portfolio beta", current: 0.88, limit: 1.1, unit: "" },
          { name: "Gross leverage", current: 1.02, limit: 1.5, unit: "x" },
          { name: "Daily VaR (95%)", current: 1.77, limit: 2.3, unit: "%" },
          { name: "Liquidity (days to exit)", current: 2.4, limit: 5, unit: "d" },
        ];
      }
    } catch {}
    return defer(RISK_LIMITS);
  },
  topContributors: async () => {
    try {
      const res = await fetch("/api/v1/risk/top-contributors");
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },
  correlation: async () => {
    try {
      const res = await fetch("/api/v1/risk/correlation");
      if (res.ok) return await res.json();
    } catch {}
    return defer({ tickers: CORR_TICKERS, matrix: corrMatrix() });
  },
  connectRiskLiveWS: (onMessage: (data: any) => void): WebSocket | null => {
    try {
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${proto}//${window.location.host}/ws/risk/live`);
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

export const alphaService = {
  signals: () => defer(ALPHA_ROWS),
  factors: () => defer(FACTORS),
  factorCorrelation: () => defer({ labels: FACTOR_CORR, matrix: FACTOR_CORR_M }),
};

export const backtestService = {
  series: () => defer(backtestSeries()),
  monthly: () => defer(monthlyReturns()),
  distribution: () => defer(TRADE_DIST),
  stats: () => defer(BT_STATS),
};

export const modelService = { list: () => defer(MODELS), services: () => defer(SERVICES) };
export const newsService = { feed: () => defer(NEWS) };
export const dataService = { sources: () => defer(DATA_SOURCES) };
export const alertService = { list: () => defer(ALERTS, 140) };

/* ───────── Copilot: deterministic institutional response synthesis ───────── */
import { AGENT_PROFILES, type CopilotBlock, type AgentProfile } from "../data/quant";
import { walk } from "../data/market";

export type CopilotResponse = {
  blocks: CopilotBlock[];
  agent: AgentProfile;
};

export const copilotService = {
  async ask(q: string, targetAgentId?: string): Promise<CopilotResponse> {
    try {
      const res = await fetch("/api/v1/copilot/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, target_agent_id: targetAgentId || "auto" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.agent && data.blocks) {
          return {
            agent: data.agent,
            blocks: data.blocks,
          };
        }
      }
    } catch {
      // Fallback to client-side engine if backend is unreachable
    }

    await defer(null, 500);
    const s = q.toLowerCase();

    // Determine target agent
    let agent = AGENT_PROFILES.find((a) => a.id === targetAgentId) ?? AGENT_PROFILES[0];

    if (s.includes("nifty") || s.includes("compare") || s.includes("benchmark")) {
      agent = AGENT_PROFILES.find((a) => a.id === "backtest_agent") || AGENT_PROFILES[4];
      return {
        agent,
        blocks: [
          {
            kind: "tool_call",
            call_id: `call_${Math.random().toString(36).slice(2, 9)}`,
            invoker_agent: "quantx_router_01",
            target_agent: agent.id,
            tool_name: "get_backtest_tearsheet",
            parameters: { universe_id: "NIFTY200_CORE", benchmark: "NIFTY50", start_date: "2025-01-01", end_date: "2026-08-31" },
            response: {
              status: "success",
              response_timestamp: new Date().toISOString(),
              output: { portfolio_ytd: 0.1472, benchmark_ytd: 0.0914, active_excess: 0.0558, information_ratio: 1.21, tracking_error: 0.0462 }
            }
          },
          {
            kind: "latex_formula",
            formula: "\\text{Information Ratio (IR)} = \\frac{R_p - R_b}{\\text{TE}} = \\frac{+5.58\\%}{4.62\\%} = 1.21",
            explanation: "Active excess return divided by annualized tracking error"
          },
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
        ]
      };
    }

    if (s.includes("factor") || s.includes("decay") || s.includes("alpha") || s.includes("ic")) {
      agent = AGENT_PROFILES.find((a) => a.id === "factor_scientist_01") || AGENT_PROFILES[2];
      return {
        agent,
        blocks: [
          {
            kind: "tool_call",
            call_id: `call_${Math.random().toString(36).slice(2, 9)}`,
            invoker_agent: "quantx_router_01",
            target_agent: agent.id,
            tool_name: "get_rolling_ic",
            parameters: { factor_families: ["Liquidity", "Momentum", "Quality", "Sentiment", "ML_Ensemble"], horizon: "20d" },
            response: {
              status: "success",
              response_timestamp: new Date().toISOString(),
              output: {
                factors: [
                  { name: "Liquidity", ic_current: 0.014, ic_prior: 0.028, t_stat: 1.42, decay_status: "DECAY" },
                  { name: "Momentum", ic_current: 0.062, ic_prior: 0.071, t_stat: 4.86, decay_status: "MONITOR" }
                ]
              }
            }
          },
          {
            kind: "latex_formula",
            formula: "\\text{IC}_t = \\text{Corr}\\left( \\text{FactorScore}_{t-1}, R_t \\right) \\quad \\text{and} \\quad t = \\frac{\\text{IC} \\cdot \\sqrt{N-2}}{\\sqrt{1-\\text{IC}^2}}",
            explanation: "Cross-sectional Spearman rank Information Coefficient and active t-statistic"
          },
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
        ]
      };
    }

    if (s.includes("stress") || s.includes("shock") || s.includes("rate")) {
      agent = AGENT_PROFILES.find((a) => a.id === "risk_desk_agent") || AGENT_PROFILES[1];
      return {
        agent,
        blocks: [
          {
            kind: "tool_call",
            call_id: `call_${Math.random().toString(36).slice(2, 9)}`,
            invoker_agent: "quantx_router_01",
            target_agent: agent.id,
            tool_name: "run_stress_scenarios",
            parameters: { scenario_id: "REPO_HIKE_200BPS", paths: 500, portfolio_nav: 104218420 },
            response: {
              status: "success",
              response_timestamp: new Date().toISOString(),
              output: { impact_percentage: -0.052, estimated_loss: 5420000.0, worst_sector: "Financials (-1.89pp)", worst_holding: "TITAN (-14.2%)" }
            }
          },
          {
            kind: "latex_formula",
            formula: "\\Delta V_{\\text{stress}} = \\sum_{i=1}^N w_i \\left( -\\text{Duration}_i \\cdot \\Delta y + \\frac{1}{2} \\text{Conv}_i (\\Delta y)^2 \\right) = -5.20\\%",
            explanation: "Second-order Taylor expansion under a +200bps yield shock"
          },
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
        ]
      };
    }

    if (s.includes("beta") || s.includes("trim") || s.includes("hedge") || s.includes("optimizer")) {
      agent = AGENT_PROFILES.find((a) => a.id === "optimizer_agent") || AGENT_PROFILES[3];
      return {
        agent,
        blocks: [
          {
            kind: "tool_call",
            call_id: `call_${Math.random().toString(36).slice(2, 9)}`,
            invoker_agent: "quantx_router_01",
            target_agent: agent.id,
            tool_name: "execute_portfolio_optimization",
            parameters: { target_beta: 0.85, current_beta: 0.94, max_turnover: 0.05, covariance_model: "Ledoit_Wolf_Shrinkage" },
            response: {
              status: "success",
              response_timestamp: new Date().toISOString(),
              output: { optimal_beta: 0.854, turnover_pct: 0.035, estimated_friction_inr: 5810, binding_constraints: ["Target_Beta_Limit", "Turnover_Dampener"] }
            }
          },
          {
            kind: "latex_formula",
            formula: "\\min_w \\; \\frac{1}{2} w^T \\Sigma_{\\text{LW}} w \\quad \\text{s.t.} \\quad \\beta^T w = 0.85, \\quad \\sum |w_i - w_{i,0}| \\le \\tau",
            explanation: "Quadratic risk minimization over Ledoit-Wolf shrunk covariance with turnover penalty"
          },
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
        ]
      };
    }

    if (s.includes("drawdown") || s.includes("march") || s.includes("loss")) {
      agent = AGENT_PROFILES.find((a) => a.id === "risk_desk_agent") || AGENT_PROFILES[1];
      return {
        agent,
        blocks: [
          {
            kind: "tool_call",
            call_id: `call_${Math.random().toString(36).slice(2, 9)}`,
            invoker_agent: "quantx_router_01",
            target_agent: agent.id,
            tool_name: "calculate_portfolio_risk",
            parameters: { metric: "MAX_DRAWDOWN", window: "2026-02-14_2026-03-09" },
            response: {
              status: "success",
              response_timestamp: new Date().toISOString(),
              output: { peak_trough_loss: -0.0843, duration_sessions: 16, recovery_sessions: 22, primary_cause: "Factor crowding unwind" }
            }
          },
          {
            kind: "latex_formula",
            formula: "\\text{MDD} = \\min_{t \\in [0,T]} \\left( \\frac{V_t}{\\max_{s \\le t} V_s} - 1 \\right) = -8.43\\%",
            explanation: "Maximum observed peak-to-trough equity drop"
          },
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
        ]
      };
    }

    agent = AGENT_PROFILES.find((a) => a.id === "client_copilot_01") || AGENT_PROFILES[5];
    return {
      agent,
      blocks: [
        { kind: "text", text: `Interpreted query: **"${q}"**. Orchestrating specialized research across portfolio state, risk engine, and active factor library.` },
        { kind: "metrics", items: [
          { k: "NAV", v: "₹10.42 Cr", d: "+1.24% today", tone: "pos" },
          { k: "Sharpe", v: "1.82", d: "+0.14", tone: "pos" },
          { k: "VaR 95%", v: "₹18.4 L", d: "+18.4%", tone: "neg" },
          { k: "Beta", v: "0.94", d: "target 1.00", tone: "neu" },
        ]},
        { kind: "text", text: "No single dominant breach detected. Risk is elevated in Financials but within mandate limits. Alpha generation remains concentrated in Momentum and the ML ensemble." },
        { kind: "sources", items: ["portfolio-svc", "risk-engine", "alpha-monitor", "news-nlp · 48h window"] },
        { kind: "actions", items: ["Open Dashboard", "Run Stress Test", "Open Alpha Lab"] },
      ]
    };
  },
};

export * from "./v10";
export * from "./v11";
export * from "./v12";
export * from "./v13";
export * from "./v14";
export * from "./v15";
export * from "./v16";
export * from "./v17";
export * from "./v18";
export * from "./v19";
export * from "./v20";

// Disambiguate multi-version type exports
export type { MacroConditioningVector } from "./v15";
export type { QuantumQAOAResult } from "./v11";



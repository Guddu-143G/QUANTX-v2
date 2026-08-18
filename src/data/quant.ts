import { gauss, mulberry32 } from "../lib/format";
import { walk } from "./market";

/* ─────────────────────────── ALPHA INTELLIGENCE ─────────────────────────── */

export type AlphaRow = {
  ticker: string;
  name: string;
  alpha: number;
  momentum: number;
  value: number;
  quality: number;
  sentiment: number;
  mlProb: number;
  confidence: number;
  signal: "BUY" | "HOLD" | "REDUCE" | "SELL";
  horizon: string;
};

export const ALPHA_ROWS: AlphaRow[] = [
  ["RELIANCE", "Reliance Industries", 0.91, 82, 67, 73, 78, 74, 91, "BUY", "20D"],
  ["HDFCBANK", "HDFC Bank", 0.88, 76, 72, 81, 69, 71, 88, "BUY", "20D"],
  ["INFY", "Infosys", 0.83, 79, 64, 76, 71, 69, 83, "BUY", "10D"],
  ["LT", "Larsen & Toubro", 0.86, 88, 51, 68, 74, 72, 85, "BUY", "20D"],
  ["ICICIBANK", "ICICI Bank", 0.84, 71, 69, 78, 66, 68, 84, "BUY", "20D"],
  ["TCS", "Tata Consultancy", 0.79, 62, 58, 88, 61, 63, 76, "HOLD", "20D"],
  ["BHARTIARTL", "Bharti Airtel", 0.77, 74, 42, 66, 72, 65, 78, "BUY", "10D"],
  ["TATAMOTORS", "Tata Motors", 0.74, 91, 38, 54, 68, 66, 71, "BUY", "5D"],
  ["ADANIPORTS", "Adani Ports & SEZ", 0.71, 86, 41, 58, 62, 61, 68, "HOLD", "10D"],
  ["SUNPHARMA", "Sun Pharmaceutical", 0.69, 64, 56, 74, 58, 59, 72, "BUY", "20D"],
  ["MARUTI", "Maruti Suzuki", 0.72, 68, 61, 71, 55, 60, 74, "HOLD", "20D"],
  ["SBIN", "State Bank of India", 0.68, 44, 78, 62, 41, 48, 61, "REDUCE", "10D"],
  ["TITAN", "Titan Company", 0.63, 58, 32, 76, 64, 54, 66, "HOLD", "20D"],
  ["NTPC", "NTPC Limited", 0.58, 61, 71, 58, 44, 52, 64, "HOLD", "20D"],
  ["CIPLA", "Cipla", 0.56, 52, 62, 68, 48, 51, 62, "HOLD", "20D"],
  ["AXISBANK", "Axis Bank", 0.58, 38, 74, 61, 36, 44, 58, "REDUCE", "10D"],
  ["KOTAKBANK", "Kotak Mahindra Bank", 0.54, 34, 66, 72, 39, 43, 56, "REDUCE", "20D"],
  ["POWERGRID", "Power Grid Corp", 0.52, 48, 68, 54, 42, 47, 59, "HOLD", "20D"],
  ["ULTRACEMCO", "UltraTech Cement", 0.48, 31, 44, 66, 38, 39, 51, "REDUCE", "10D"],
  ["ITC", "ITC Limited", 0.61, 42, 72, 78, 46, 53, 64, "HOLD", "20D"],
  ["ONGC", "Oil & Natural Gas", 0.42, 24, 81, 42, 29, 34, 46, "SELL", "5D"],
  ["ASIANPAINT", "Asian Paints", 0.31, 18, 28, 62, 26, 27, 41, "SELL", "10D"],
  ["WIPRO", "Wipro", 0.38, 22, 46, 51, 31, 31, 44, "SELL", "10D"],
  ["HINDUNILVR", "Hindustan Unilever", 0.44, 29, 38, 74, 34, 38, 49, "HOLD", "20D"],
].map((r) => ({
  ticker: r[0] as string, name: r[1] as string, alpha: r[2] as number,
  momentum: r[3] as number, value: r[4] as number, quality: r[5] as number,
  sentiment: r[6] as number, mlProb: r[7] as number, confidence: r[8] as number,
  signal: r[9] as AlphaRow["signal"], horizon: r[10] as string,
}));

/* ─────────────────────────────── FACTORS ─────────────────────────────── */

export type Factor = {
  key: string; name: string; sharpe: number; ytd: number; ic: number;
  halfLife: string; weight: number; status: "ACTIVE" | "MONITOR" | "DECAY";
  series: number[]; desc: string;
};

export const FACTORS: Factor[] = [
  { key: "mom", name: "Momentum", sharpe: 1.64, ytd: 18.4, ic: 0.062, halfLife: "34d", weight: 25, status: "ACTIVE", series: walk(11, 120, 100, 0.22, 0.13), desc: "12-1 month cross-sectional price momentum, volatility scaled." },
  { key: "val", name: "Value", sharpe: 1.12, ytd: 11.2, ic: 0.041, halfLife: "96d", weight: 20, status: "ACTIVE", series: walk(23, 120, 100, 0.14, 0.11), desc: "Composite of EV/EBITDA, P/B and FCF yield, sector-neutralised." },
  { key: "qual", name: "Quality", sharpe: 1.31, ytd: 13.8, ic: 0.048, halfLife: "128d", weight: 20, status: "ACTIVE", series: walk(37, 120, 100, 0.17, 0.09), desc: "ROIC stability, accruals, leverage and earnings variability." },
  { key: "vol", name: "Low Volatility", sharpe: 0.86, ytd: 7.4, ic: 0.028, halfLife: "82d", weight: 0, status: "MONITOR", series: walk(53, 120, 100, 0.09, 0.07), desc: "Inverse 252-day realised volatility with beta adjustment." },
  { key: "liq", name: "Liquidity", sharpe: 0.44, ytd: 3.1, ic: 0.014, halfLife: "21d", weight: 0, status: "DECAY", series: walk(67, 120, 100, 0.04, 0.12), desc: "Amihud illiquidity and turnover-based microstructure signal." },
  { key: "sent", name: "Sentiment", sharpe: 0.98, ytd: 9.6, ic: 0.034, halfLife: "9d", weight: 10, status: "ACTIVE", series: walk(83, 120, 100, 0.12, 0.16), desc: "FinBERT news polarity, analyst revisions and options skew." },
  { key: "macro", name: "Macro", sharpe: 0.72, ytd: 5.8, ic: 0.022, halfLife: "64d", weight: 0, status: "MONITOR", series: walk(97, 120, 100, 0.07, 0.1), desc: "Rates, INR, crude and liquidity regime betas." },
  { key: "tech", name: "Technical", sharpe: 0.91, ytd: 8.2, ic: 0.031, halfLife: "12d", weight: 0, status: "MONITOR", series: walk(109, 120, 100, 0.1, 0.18), desc: "Mean reversion, breakout and volume-profile ensemble." },
  { key: "alt", name: "Alternative Data", sharpe: 1.08, ytd: 10.4, ic: 0.038, halfLife: "17d", weight: 0, status: "ACTIVE", series: walk(127, 120, 100, 0.13, 0.14), desc: "Satellite freight, UPI velocity, hiring and web traffic." },
  { key: "ml", name: "ML Ensemble", sharpe: 1.71, ytd: 21.2, ic: 0.071, halfLife: "28d", weight: 15, status: "ACTIVE", series: walk(139, 120, 100, 0.26, 0.14), desc: "Gradient-boosted stack over 142 engineered features." },
];

export const FACTOR_CORR = ["Momentum", "Value", "Quality", "Low Vol", "Sentiment", "ML"];
export const FACTOR_CORR_M = [
  [1, -0.34, 0.18, -0.22, 0.41, 0.62],
  [-0.34, 1, 0.28, 0.36, -0.12, 0.08],
  [0.18, 0.28, 1, 0.44, 0.16, 0.31],
  [-0.22, 0.36, 0.44, 1, -0.08, 0.04],
  [0.41, -0.12, 0.16, -0.08, 1, 0.48],
  [0.62, 0.08, 0.31, 0.04, 0.48, 1],
];

/* ──────────────────────────────── RISK ──────────────────────────────── */

export const RISK_METRICS = [
  { key: "var95", label: "VaR 95%", value: "₹18.4 L", sub: "1-day · 1.77% of NAV", delta: -4.2, limit: "₹24 L", used: 76 },
  { key: "var99", label: "VaR 99%", value: "₹31.2 L", sub: "1-day · 2.99% of NAV", delta: 2.8, limit: "₹40 L", used: 78 },
  { key: "cvar", label: "CVaR 97.5%", value: "₹27.6 L", sub: "Expected shortfall", delta: 1.4, limit: "₹36 L", used: 77 },
  { key: "beta", label: "Portfolio Beta", value: "0.94", sub: "vs NIFTY 50", delta: -3.1, limit: "1.10", used: 85 },
  { key: "vol", label: "Volatility", value: "10.8%", sub: "Annualised · 60d", delta: -1.8, limit: "16.0%", used: 68 },
  { key: "dd", label: "Max Drawdown", value: "−8.43%", sub: "Trailing 12M", delta: 1.1, limit: "−15.0%", used: 56 },
  { key: "te", label: "Tracking Error", value: "4.62%", sub: "vs NIFTY 50", delta: 0.4, limit: "6.00%", used: 77 },
];

export const RISK_DECOMP = [
  { name: "Market", value: 46.2, color: "#6EA8FE" },
  { name: "Sector", value: 21.4, color: "#3DDC97" },
  { name: "Factor", value: 18.1, color: "#C8A96B" },
  { name: "Idiosyncratic", value: 11.8, color: "#8290A0" },
  { name: "Currency", value: 2.5, color: "#E8B75A" },
];

export const FACTOR_RISK = [
  { name: "Market", contrib: 46.2 }, { name: "Momentum", contrib: 12.4 },
  { name: "Value", contrib: -4.8 }, { name: "Quality", contrib: 6.2 },
  { name: "Size", contrib: -3.1 }, { name: "Volatility", contrib: 8.4 },
  { name: "Liquidity", contrib: 2.2 }, { name: "Residual", contrib: 32.5 },
];

export type Scenario = {
  key: string; name: string; shock: string; impactPct: number; loss: number;
  worstAsset: string; worstAssetPct: number; recovery: string; probability: number;
  sectors: { s: string; v: number }[]; status: "WITHIN LIMITS" | "ELEVATED" | "BREACH";
};

export const SCENARIOS: Scenario[] = [
  {
    key: "crash", name: "Market Crash", shock: "NIFTY −10%", impactPct: -9.1, loss: 9483880,
    worstAsset: "TATAMOTORS", worstAssetPct: -16.4, recovery: "4.2 months", probability: 6.4,
    sectors: [{ s: "Financials", v: -11.2 }, { s: "Auto", v: -14.1 }, { s: "Technology", v: -7.4 }, { s: "Energy", v: -9.8 }, { s: "Consumer", v: -5.2 }],
    status: "ELEVATED",
  },
  {
    key: "bank", name: "Banking Crisis", shock: "Financials −20%", impactPct: -6.8, loss: 7086850,
    worstAsset: "AXISBANK", worstAssetPct: -24.2, recovery: "6.8 months", probability: 2.1,
    sectors: [{ s: "Financials", v: -20.0 }, { s: "Auto", v: -6.4 }, { s: "Technology", v: -2.1 }, { s: "Energy", v: -3.2 }, { s: "Consumer", v: -4.4 }],
    status: "BREACH",
  },
  {
    key: "oil", name: "Oil Shock", shock: "Brent +25%", impactPct: -2.4, loss: 2501242,
    worstAsset: "MARUTI", worstAssetPct: -11.8, recovery: "2.1 months", probability: 11.2,
    sectors: [{ s: "Energy", v: 8.4 }, { s: "Auto", v: -11.8 }, { s: "Industrials", v: -6.2 }, { s: "Consumer", v: -4.1 }, { s: "Financials", v: -2.8 }],
    status: "WITHIN LIMITS",
  },
  {
    key: "rates", name: "Interest Rate Shock", shock: "Repo +200bps", impactPct: -5.2, loss: 5419358,
    worstAsset: "TITAN", worstAssetPct: -14.2, recovery: "5.4 months", probability: 8.6,
    sectors: [{ s: "Financials", v: -8.2 }, { s: "Consumer", v: -12.4 }, { s: "Utilities", v: -7.1 }, { s: "Technology", v: -4.2 }, { s: "Energy", v: -2.4 }],
    status: "ELEVATED",
  },
  {
    key: "tech", name: "Technology Selloff", shock: "IT Index −15%", impactPct: -3.6, loss: 3751863,
    worstAsset: "WIPRO", worstAssetPct: -18.6, recovery: "3.1 months", probability: 9.4,
    sectors: [{ s: "Technology", v: -15.0 }, { s: "Consumer", v: -2.8 }, { s: "Financials", v: -1.9 }, { s: "Industrials", v: -2.2 }, { s: "Energy", v: -0.8 }],
    status: "WITHIN LIMITS",
  },
  {
    key: "covid", name: "COVID-style Shock", shock: "Mar-2020 replay", impactPct: -23.4, loss: 24387110,
    worstAsset: "ADANIPORTS", worstAssetPct: -41.2, recovery: "11.6 months", probability: 0.8,
    sectors: [{ s: "Financials", v: -31.4 }, { s: "Auto", v: -34.2 }, { s: "Energy", v: -28.1 }, { s: "Technology", v: -18.4 }, { s: "Healthcare", v: 6.2 }],
    status: "BREACH",
  },
];

export const RISK_LIMITS = [
  { name: "Single stock weight", current: 8.4, limit: 10, unit: "%" },
  { name: "Sector concentration", current: 23.0, limit: 25, unit: "%" },
  { name: "Portfolio beta", current: 0.94, limit: 1.1, unit: "" },
  { name: "Gross leverage", current: 1.02, limit: 1.5, unit: "x" },
  { name: "Daily VaR (95%)", current: 1.77, limit: 2.3, unit: "%" },
  { name: "Liquidity (days to exit)", current: 2.4, limit: 5, unit: "d" },
];

export const CORR_TICKERS = ["RELIANCE", "HDFCBANK", "ICICIBANK", "INFY", "TCS", "LT", "ITC", "SBIN"];
export function corrMatrix() {
  const rnd = mulberry32(555);
  const n = CORR_TICKERS.length;
  const m: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = i; j < n; j++) {
      const v = i === j ? 1 : +(0.12 + rnd() * 0.62).toFixed(2);
      m[i][j] = v;
      m[j][i] = v;
    }
  return m;
}

/* ───────────────────────────── BACKTESTING ───────────────────────────── */

export function backtestSeries(n = 260) {
  const rnd = mulberry32(3141);
  const rndb = mulberry32(2718);
  let eq = 100;
  let bm = 100;
  let peak = 100;
  const out: { i: number; d: string; equity: number; bench: number; dd: number; sharpe: number }[] = [];
  for (let i = 0; i < n; i++) {
    const m = gauss(rndb) * 0.0088 + 0.0003;
    eq *= 1 + (m * 0.86 + gauss(rnd) * 0.006 + 0.00042);
    bm *= 1 + m;
    peak = Math.max(peak, eq);
    out.push({
      i,
      d: new Date(2024, 3, 1 + i * 2).toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
      equity: +eq.toFixed(2),
      bench: +bm.toFixed(2),
      dd: +(((eq - peak) / peak) * 100).toFixed(2),
      sharpe: +(1.2 + Math.sin(i / 26) * 0.55 + gauss(rnd) * 0.08).toFixed(3),
    });
  }
  return out;
}

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function monthlyReturns() {
  const rnd = mulberry32(8642);
  const years = [2022, 2023, 2024, 2025, 2026];
  return years.map((y) => ({
    year: y,
    months: MONTHS.map((_, i) => (y === 2026 && i > 7 ? null : +(gauss(rnd) * 3.4 + 1.1).toFixed(2))),
  }));
}

export const TRADE_DIST = [
  { bucket: "< −6%", n: 14 }, { bucket: "−6→−4%", n: 31 }, { bucket: "−4→−2%", n: 68 },
  { bucket: "−2→0%", n: 112 }, { bucket: "0→2%", n: 138 }, { bucket: "2→4%", n: 96 },
  { bucket: "4→6%", n: 54 }, { bucket: "> 6%", n: 29 },
];

export const BT_STATS = [
  { k: "CAGR", v: "21.4%", d: "vs 12.8% bench" },
  { k: "Sharpe", v: "1.82", d: "Rf 6.8%" },
  { k: "Sortino", v: "2.41", d: "downside σ 6.2%" },
  { k: "Max Drawdown", v: "−8.43%", d: "09 Mar 2026" },
  { k: "Calmar", v: "2.54", d: "CAGR / MaxDD" },
  { k: "Win Rate", v: "58.4%", d: "542 trades" },
  { k: "Profit Factor", v: "1.94", d: "gross w/l" },
  { k: "Turnover", v: "13.2%", d: "monthly" },
  { k: "Alpha", v: "+7.9%", d: "annualised" },
  { k: "Beta", v: "0.86", d: "vs NIFTY 50" },
  { k: "Volatility", v: "10.8%", d: "annualised" },
  { k: "Avg Hold", v: "18.4d", d: "per position" },
];

export const BT_STAGES = [
  "Initializing dataset",
  "Loading features",
  "Generating signals",
  "Running portfolio simulation",
  "Applying transaction costs",
  "Calculating risk",
  "Generating report",
];

/* ─────────────────────────────── MODELS ─────────────────────────────── */

export type Model = {
  name: string; version: string; type: string;
  status: "PRODUCTION" | "STAGING" | "SHADOW" | "RETRAINING";
  sharpe: number; accuracy: number; drift: "LOW" | "MEDIUM" | "HIGH";
  trained: string; features: number; rows: string; latency: string;
  deployed: string; series: number[]; owner: string;
};

export const MODELS: Model[] = [
  { name: "Alpha-XGB", version: "3.2.1", type: "Gradient Boosting", status: "PRODUCTION", sharpe: 1.71, accuracy: 64.8, drift: "LOW", trained: "19 Aug 2026", features: 142, rows: "8.4M", latency: "12ms", deployed: "21 Aug 2026", series: walk(301, 60, 100, 0.24, 0.11), owner: "alpha-desk" },
  { name: "Regime-HMM", version: "2.0.4", type: "Hidden Markov", status: "PRODUCTION", sharpe: 1.24, accuracy: 71.2, drift: "LOW", trained: "02 Aug 2026", features: 24, rows: "1.2M", latency: "4ms", deployed: "04 Aug 2026", series: walk(311, 60, 100, 0.16, 0.08), owner: "macro-desk" },
  { name: "Sentiment-FinBERT", version: "1.8.0", type: "Transformer NLP", status: "PRODUCTION", sharpe: 0.98, accuracy: 82.4, drift: "MEDIUM", trained: "12 Aug 2026", features: 768, rows: "4.1M docs", latency: "62ms", deployed: "13 Aug 2026", series: walk(317, 60, 100, 0.12, 0.15), owner: "nlp-research" },
  { name: "Factor-Model-IN", version: "5.1.2", type: "Linear Factor", status: "PRODUCTION", sharpe: 1.42, accuracy: 0, drift: "LOW", trained: "01 Aug 2026", features: 38, rows: "12.6M", latency: "3ms", deployed: "01 Aug 2026", series: walk(331, 60, 100, 0.18, 0.09), owner: "risk-desk" },
  { name: "Risk-GARCH-DCC", version: "4.0.0", type: "Multivariate GARCH", status: "PRODUCTION", sharpe: 0, accuracy: 0, drift: "LOW", trained: "18 Aug 2026", features: 52, rows: "6.8M", latency: "18ms", deployed: "18 Aug 2026", series: walk(337, 60, 100, 0.06, 0.05), owner: "risk-desk" },
  { name: "Exec-Impact-Net", version: "0.9.3", type: "Neural Net", status: "SHADOW", sharpe: 0, accuracy: 78.1, drift: "HIGH", trained: "21 Aug 2026", features: 96, rows: "2.9M fills", latency: "8ms", deployed: "—", series: walk(347, 60, 100, 0.02, 0.16), owner: "execution" },
  { name: "Alpha-Transformer", version: "0.4.0", type: "Temporal Fusion", status: "STAGING", sharpe: 1.58, accuracy: 62.1, drift: "MEDIUM", trained: "20 Aug 2026", features: 214, rows: "9.1M", latency: "44ms", deployed: "—", series: walk(353, 60, 100, 0.21, 0.13), owner: "alpha-desk" },
  { name: "AltData-Satellite", version: "1.2.7", type: "CNN + Tabular", status: "RETRAINING", sharpe: 1.08, accuracy: 59.4, drift: "MEDIUM", trained: "22 Aug 2026", features: 64, rows: "412K", latency: "120ms", deployed: "10 Aug 2026", series: walk(359, 60, 100, 0.13, 0.14), owner: "alt-data" },
];

/* ─────────────────────────────── ALERTS ─────────────────────────────── */

export type Alert = {
  id: string; severity: "INFO" | "WARNING" | "CRITICAL"; title: string;
  body: string; time: string; source: string; ack: boolean;
};

export const ALERTS: Alert[] = [
  { id: "AL-2841", severity: "CRITICAL", title: "Risk Limit Breach", body: "Portfolio beta exceeded 1.10 intraday (peak 1.14 at 11:42). Auto-hedge sleeve engaged with NIFTY futures.", time: "11:42:16", source: "risk-engine", ack: false },
  { id: "AL-2840", severity: "WARNING", title: "Alpha Decay", body: "Momentum factor 20-day rolling Sharpe dropped below 0.50 (0.44). Half-life shortened 34d → 21d.", time: "10:18:04", source: "alpha-monitor", ack: false },
  { id: "AL-2839", severity: "WARNING", title: "Model Drift", body: "Alpha-XGB feature distribution shifted 12.4% (PSI 0.18) on volume-profile inputs. Retrain recommended.", time: "09:51:33", source: "mlops", ack: false },
  { id: "AL-2838", severity: "INFO", title: "Market Regime Change", body: "Regime-HMM detected transition: LOW VOLATILITY → HIGH VOLATILITY. Posterior probability 0.78.", time: "09:34:12", source: "regime-model", ack: true },
  { id: "AL-2837", severity: "WARNING", title: "Concentration Warning", body: "Banking exposure 23.0% approaching 25% mandate limit after HDFCBANK add.", time: "09:22:47", source: "compliance", ack: false },
  { id: "AL-2836", severity: "INFO", title: "Rebalance Scheduled", body: "Monthly rebalance queued for 01 Sep 2026, 09:20 IST. Estimated turnover 13.2%.", time: "08:40:00", source: "portfolio-svc", ack: true },
  { id: "AL-2835", severity: "CRITICAL", title: "Data Feed Interrupted", body: "Alternative data (satellite freight) feed stale for 4h 12m. Fallback to last-known values.", time: "05:28:19", source: "data-platform", ack: true },
  { id: "AL-2834", severity: "INFO", title: "Backtest Completed", body: "BT-1184 Momentum-Quality Composite finished. Sharpe 1.82, CAGR 21.4%, MaxDD −8.43%.", time: "04:12:55", source: "backtest-svc", ack: true },
];

/* ──────────────────────────── NEWS & SENTIMENT ──────────────────────────── */

export type NewsItem = {
  id: string; headline: string; source: string; time: string; ticker: string;
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL"; confidence: number;
  impact: number; category: string;
};

export const NEWS: NewsItem[] = [
  { id: "N1", headline: "Reliance commissions 20 GW solar module line at Jamnagar, ahead of schedule", source: "Reuters", time: "09:42", ticker: "RELIANCE", sentiment: "POSITIVE", confidence: 87, impact: 0.14, category: "Operations" },
  { id: "N2", headline: "HDFC Bank Q1 NIM expands 12bps as deposit repricing completes", source: "Bloomberg", time: "09:28", ticker: "HDFCBANK", sentiment: "POSITIVE", confidence: 91, impact: 0.11, category: "Earnings" },
  { id: "N3", headline: "RBI holds repo at 6.50%, signals extended pause on stable core inflation", source: "Mint", time: "09:04", ticker: "NIFTY", sentiment: "NEUTRAL", confidence: 74, impact: 0.03, category: "Macro" },
  { id: "N4", headline: "Infosys large-deal TCV guidance trimmed on BFSI discretionary softness", source: "Economic Times", time: "08:51", ticker: "INFY", sentiment: "NEGATIVE", confidence: 79, impact: -0.09, category: "Guidance" },
  { id: "N5", headline: "L&T wins ₹15,400 Cr offshore order from ADNOC; order book at record high", source: "Business Standard", time: "08:33", ticker: "LT", sentiment: "POSITIVE", confidence: 94, impact: 0.18, category: "Orders" },
  { id: "N6", headline: "Asian Paints loses further share to Birla Opus in decorative segment", source: "Moneycontrol", time: "08:12", ticker: "ASIANPAINT", sentiment: "NEGATIVE", confidence: 83, impact: -0.16, category: "Competition" },
  { id: "N7", headline: "Tata Motors JLR retail volumes up 8.4% YoY, China recovery sustains", source: "Reuters", time: "07:58", ticker: "TATAMOTORS", sentiment: "POSITIVE", confidence: 81, impact: 0.12, category: "Volumes" },
  { id: "N8", headline: "Brent crude climbs to $86 on renewed Red Sea shipping disruption", source: "Bloomberg", time: "07:41", ticker: "ONGC", sentiment: "POSITIVE", confidence: 68, impact: 0.07, category: "Commodity" },
  { id: "N9", headline: "SEBI proposes tighter disclosure norms for algorithmic order flow", source: "Mint", time: "07:20", ticker: "NIFTY", sentiment: "NEUTRAL", confidence: 62, impact: -0.02, category: "Regulation" },
  { id: "N10", headline: "Sun Pharma receives USFDA EIR for Halol facility with zero observations", source: "Economic Times", time: "06:55", ticker: "SUNPHARMA", sentiment: "POSITIVE", confidence: 89, impact: 0.13, category: "Regulatory" },
];

/* ──────────────────────────── DATA QUALITY ──────────────────────────── */

export type DataSource = {
  name: string; category: string; status: "HEALTHY" | "DEGRADED" | "STALE";
  updated: string; coverage: number; missing: number; latency: string;
  rows: string; vendor: string;
};

export const DATA_SOURCES: DataSource[] = [
  { name: "NSE Market Data", category: "Market Data", status: "HEALTHY", updated: "09:32:04 IST", coverage: 99.7, missing: 0.3, latency: "18ms", rows: "412M ticks/day", vendor: "NSE Direct" },
  { name: "BSE Market Data", category: "Market Data", status: "HEALTHY", updated: "09:32:01 IST", coverage: 99.4, missing: 0.6, latency: "24ms", rows: "186M ticks/day", vendor: "BSE Direct" },
  { name: "Global Equities L1", category: "Market Data", status: "HEALTHY", updated: "09:31:58 IST", coverage: 98.9, missing: 1.1, latency: "42ms", rows: "1.2B ticks/day", vendor: "Refinitiv" },
  { name: "Fundamentals (IN)", category: "Fundamentals", status: "HEALTHY", updated: "06:00:00 IST", coverage: 99.1, missing: 0.9, latency: "daily", rows: "4,218 issuers", vendor: "Capitaline" },
  { name: "Corporate Actions", category: "Fundamentals", status: "DEGRADED", updated: "05:14:22 IST", coverage: 96.2, missing: 3.8, latency: "daily", rows: "18.4K events", vendor: "Internal" },
  { name: "Analyst Estimates", category: "Fundamentals", status: "HEALTHY", updated: "06:12:40 IST", coverage: 91.4, missing: 8.6, latency: "daily", rows: "62K estimates", vendor: "Visible Alpha" },
  { name: "News & Filings", category: "News", status: "HEALTHY", updated: "09:31:12 IST", coverage: 99.8, missing: 0.2, latency: "1.4s", rows: "48K docs/day", vendor: "Multi-vendor" },
  { name: "Macro Series", category: "Macro", status: "HEALTHY", updated: "08:00:00 IST", coverage: 100, missing: 0, latency: "daily", rows: "2,840 series", vendor: "RBI / MOSPI / FRED" },
  { name: "Satellite Freight", category: "Alternative", status: "STALE", updated: "05:28:19 IST", coverage: 84.2, missing: 15.8, latency: "4h 12m", rows: "1.8K ports", vendor: "Orbital Insight" },
  { name: "UPI Transaction Velocity", category: "Alternative", status: "HEALTHY", updated: "07:45:00 IST", coverage: 97.6, missing: 2.4, latency: "daily", rows: "312 merchants", vendor: "Internal" },
];

/* ─────────────────────────────── COPILOT ─────────────────────────────── */

export type CopilotBlock =
  | { kind: "text"; text: string }
  | { kind: "drivers"; items: { n: string; title: string; detail: string; delta: string; tone: "pos" | "neg" | "neu" }[] }
  | { kind: "metrics"; items: { k: string; v: string; d?: string; tone?: "pos" | "neg" | "neu" }[] }
  | { kind: "series"; title: string; data: number[]; tone?: "pos" | "neg" }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "sources"; items: string[] }
  | { kind: "actions"; items: string[] };

export type CopilotMsg = { role: "user" | "ai"; text?: string; blocks?: CopilotBlock[]; ts: string };

export const COPILOT_SUGGESTIONS = [
  "Why did portfolio risk increase today?",
  "Compare portfolio vs NIFTY 50 YTD",
  "Which factor is decaying fastest?",
  "Explain the March drawdown",
  "Stress test a 200bps rate shock",
  "What should I trim to cut beta to 0.85?",
];

export const COPILOT_SEED: CopilotMsg[] = [
  { role: "user", text: "Why did portfolio risk increase today?", ts: "09:41" },
  {
    role: "ai",
    ts: "09:41",
    blocks: [
      { kind: "text", text: "Portfolio 1-day VaR (95%) increased **18.4%** to ₹18.4 L. The move is concentrated in the financials sleeve and is driven by correlation expansion rather than volatility alone." },
      {
        kind: "drivers",
        items: [
          { n: "01", title: "Banking correlation expanded", detail: "Pairwise correlation across the financials sleeve rose 0.42 → 0.61 over 5 sessions.", delta: "+45.2%", tone: "neg" },
          { n: "02", title: "HDFCBANK weight increased", detail: "Position scaled 5.2% → 7.1% on the 22 Aug rebalance; marginal VaR contribution now 14.8%.", delta: "+1.9pp", tone: "neg" },
          { n: "03", title: "Realised market volatility up", detail: "NIFTY 20-day realised vol moved 11.2% → 12.5% annualised.", delta: "+12.0%", tone: "neg" },
          { n: "04", title: "Sector concentration increased", detail: "Financials at 23.0% vs 25% mandate cap — 92% of limit utilised.", delta: "+2.4pp", tone: "warn" as unknown as "neg" },
        ],
      },
      {
        kind: "metrics",
        items: [
          { k: "VaR 95%", v: "₹18.4 L", d: "+18.4%", tone: "neg" },
          { k: "CVaR 97.5%", v: "₹27.6 L", d: "+14.1%", tone: "neg" },
          { k: "Beta", v: "0.94", d: "+0.06", tone: "neu" },
          { k: "Diversification ratio", v: "1.42", d: "−0.11", tone: "neg" },
        ],
      },
      { kind: "series", title: "Portfolio VaR — trailing 30 sessions (₹L)", data: walk(909, 30, 15.2, 0.9, 0.22), tone: "neg" },
      { kind: "sources", items: ["risk-engine · historical simulation 500d", "positions snapshot 22 Aug 2026 15:30 IST", "Risk-GARCH-DCC v4.0.0", "NSE tick data"] },
      { kind: "actions", items: ["View Risk Attribution", "Run Stress Test", "Open Portfolio", "Draft Hedge Ticket"] },
    ],
  },
];

/* ───────────────────────────── MONITORING ───────────────────────────── */

export const SERVICES = [
  { name: "market-data-gateway", status: "OPERATIONAL", uptime: 99.98, p99: "22ms", region: "ap-south-1" },
  { name: "alpha-engine", status: "OPERATIONAL", uptime: 99.94, p99: "148ms", region: "ap-south-1" },
  { name: "risk-engine", status: "OPERATIONAL", uptime: 99.99, p99: "86ms", region: "ap-south-1" },
  { name: "optimizer-service", status: "DEGRADED", uptime: 99.21, p99: "1.8s", region: "ap-south-1" },
  { name: "backtest-cluster", status: "OPERATIONAL", uptime: 99.87, p99: "—", region: "ap-south-1" },
  { name: "copilot-inference", status: "OPERATIONAL", uptime: 99.91, p99: "620ms", region: "ap-south-1" },
  { name: "execution-oms", status: "OPERATIONAL", uptime: 100.0, p99: "9ms", region: "colo-mumbai" },
  { name: "data-lakehouse", status: "OPERATIONAL", uptime: 99.96, p99: "310ms", region: "ap-south-1" },
];

import { gauss, mulberry32 } from "../lib/format";
import { ASSETS } from "./market";

export const NAV = 104218420; // ₹10.42 Cr

export type Holding = {
  ticker: string;
  name: string;
  sector: string;
  qty: number;
  avg: number;
  ltp: number;
  weight: number;
  pnl: number;
  pnlPct: number;
  dayPct: number;
  beta: number;
  alpha: number;
  varContrib: number;
  signal: "BUY" | "HOLD" | "REDUCE" | "SELL";
};

const W = [
  ["RELIANCE", 8.4, "BUY"], ["HDFCBANK", 7.1, "BUY"], ["ICICIBANK", 6.2, "BUY"],
  ["INFY", 5.8, "BUY"], ["TCS", 5.1, "HOLD"], ["LT", 4.6, "BUY"],
  ["BHARTIARTL", 4.2, "HOLD"], ["ITC", 3.8, "HOLD"], ["SBIN", 3.4, "REDUCE"],
  ["SUNPHARMA", 3.1, "BUY"], ["MARUTI", 2.9, "HOLD"], ["TATAMOTORS", 2.7, "BUY"],
  ["AXISBANK", 2.4, "REDUCE"], ["TITAN", 2.2, "HOLD"], ["NTPC", 2.0, "BUY"],
  ["ADANIPORTS", 1.8, "BUY"], ["CIPLA", 1.6, "HOLD"], ["POWERGRID", 1.5, "HOLD"],
  ["ULTRACEMCO", 1.3, "REDUCE"], ["ASIANPAINT", 1.1, "SELL"], ["WIPRO", 0.8, "SELL"],
] as const;

export const HOLDINGS: Holding[] = W.map(([ticker, weight, signal], i) => {
  const a = ASSETS.find((x) => x.ticker === ticker)!;
  const rnd = mulberry32(700 + i * 31);
  const value = (NAV * (weight as number)) / 100;
  const qty = Math.round(value / a.price);
  const avg = a.price / (1 + (gauss(rnd) * 0.14 + 0.06));
  const pnl = qty * (a.price - avg);
  return {
    ticker,
    name: a.name,
    sector: a.sector,
    qty,
    avg,
    ltp: a.price,
    weight: weight as number,
    pnl,
    pnlPct: (a.price / avg - 1) * 100,
    dayPct: a.chgPct,
    beta: a.beta,
    alpha: a.alpha,
    varContrib: (weight as number) * a.beta * (a.vol30 / 18),
    signal: signal as Holding["signal"],
  };
});

export const ALLOCATION = [
  { key: "Equity", value: 72, color: "var(--color-acc)", detail: "₹7.50 Cr · 21 positions" },
  { key: "Debt", value: 10, color: "var(--color-acc2)", detail: "₹1.04 Cr · G-Sec + AAA" },
  { key: "Alternatives", value: 10, color: "var(--color-gold)", detail: "₹1.04 Cr · REIT / InvIT" },
  { key: "Cash", value: 8, color: "#4c5a68", detail: "₹0.84 Cr · Liquid" },
];

export const SECTOR_EXPOSURE = [
  { sector: "Financials", weight: 23.0, limit: 25, bench: 34.2 },
  { sector: "Technology", weight: 18.0, limit: 25, bench: 14.1 },
  { sector: "Energy", weight: 14.0, limit: 20, bench: 11.4 },
  { sector: "Consumer", weight: 11.0, limit: 20, bench: 9.8 },
  { sector: "Healthcare", weight: 9.0, limit: 20, bench: 4.2 },
  { sector: "Industrials", weight: 8.4, limit: 20, bench: 7.6 },
  { sector: "Auto", weight: 6.2, limit: 15, bench: 6.4 },
  { sector: "Utilities", weight: 5.4, limit: 15, bench: 3.1 },
  { sector: "Materials", weight: 5.0, limit: 15, bench: 9.2 },
];

export type PerfPoint = { i: number; d: string; portfolio: number; nifty: number; bench: number; dd: number };

/** 1Y daily indexed performance: strategy vs NIFTY 50 vs 60/40 blended benchmark. */
export function performanceSeries(points = 252): PerfPoint[] {
  const rnd = mulberry32(9081);
  const rndB = mulberry32(4417);
  const out: PerfPoint[] = [];
  let p = 100;
  let n = 100;
  let b = 100;
  let peak = 100;
  const start = new Date(2025, 8, 1).getTime();
  for (let i = 0; i < points; i++) {
    const mkt = gauss(rndB) * 0.0092 + 0.00035;
    const idio = gauss(rnd) * 0.0055;
    p *= 1 + (mkt * 0.94 + idio + 0.00026);
    n *= 1 + mkt;
    b *= 1 + (mkt * 0.62 + 0.00012);
    peak = Math.max(peak, p);
    const date = new Date(start + i * 86400000 * 1.45);
    out.push({
      i,
      d: date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      portfolio: +p.toFixed(3),
      nifty: +n.toFixed(3),
      bench: +b.toFixed(3),
      dd: +(((p - peak) / peak) * 100).toFixed(3),
    });
  }
  return out;
}

export const PERF = performanceSeries();

export function sliceRange(range: string): PerfPoint[] {
  const map: Record<string, number> = { "1D": 8, "1W": 14, "1M": 26, "3M": 64, "6M": 126, YTD: 168, "1Y": 252, MAX: 252 };
  const n = map[range] ?? 252;
  return PERF.slice(-n);
}

export const KPIS = [
  {
    key: "nav", label: "Portfolio NAV", value: "₹10.42 Cr", raw: 104218420,
    change: 14.72, changeLabel: "YTD", context: "Since 01 Apr 2026 · AUM across 3 mandates",
    seed: 21, tone: "pos" as const,
    tip: "Net asset value across all sleeves, marked to last traded price at 15:30 IST.",
  },
  {
    key: "pnl", label: "Portfolio P&L", value: "+₹4.82 L", raw: 482000,
    change: 1.24, changeLabel: "Today", context: "Realised ₹1.14 L · Unrealised ₹3.68 L",
    seed: 34, tone: "pos" as const,
    tip: "Mark-to-market profit and loss for the current session, net of transaction costs.",
  },
  {
    key: "sharpe", label: "Sharpe Ratio", value: "1.82", raw: 1.82,
    change: 0.14, changeLabel: "vs 30D", context: "Rf 6.8% · 252d rolling window",
    seed: 47, tone: "pos" as const, absolute: true,
    tip: "Annualised excess return per unit of total volatility, 252-day rolling.",
  },
  {
    key: "dd", label: "Max Drawdown", value: "−8.43%", raw: -8.43,
    change: 1.12, changeLabel: "recovered", context: "Peak 14 Feb · Trough 09 Mar · Controlled",
    seed: 58, tone: "warn" as const, absolute: true,
    tip: "Largest peak-to-trough decline over the trailing 12 months. Limit: −15%.",
  },
  {
    key: "var", label: "VaR 95%", value: "₹18.4 L", raw: 1840000,
    change: -4.2, changeLabel: "vs yesterday", context: "1-day horizon · Historical simulation",
    seed: 63, tone: "neu" as const, absolute: true,
    tip: "1-day 95% Value at Risk, historical simulation over 500 trading days.",
  },
  {
    key: "beta", label: "Portfolio Beta", value: "0.94", raw: 0.94,
    change: -0.03, changeLabel: "vs NIFTY 50", context: "Target 1.00 ± 0.15 · Market neutral-ish",
    seed: 71, tone: "neu" as const, absolute: true,
    tip: "Sensitivity of portfolio returns to NIFTY 50, estimated by 90-day OLS regression.",
  },
];

export const ATTRIBUTION = [
  { name: "Stock selection", value: 6.42 },
  { name: "Sector allocation", value: 2.18 },
  { name: "Factor tilt", value: 3.64 },
  { name: "Timing", value: -0.84 },
  { name: "Currency", value: 0.21 },
  { name: "Costs & slippage", value: -0.62 },
];

export const EXECUTIONS = [
  { time: "15:24:08", ticker: "LT", side: "BUY", qty: 420, px: 3617.4, algo: "VWAP", slip: -0.04, status: "FILLED" },
  { time: "14:58:41", ticker: "ASIANPAINT", side: "SELL", qty: 380, px: 2320.6, algo: "TWAP", slip: 0.02, status: "FILLED" },
  { time: "14:12:19", ticker: "TATAMOTORS", side: "BUY", qty: 1250, px: 741.2, algo: "POV 8%", slip: -0.11, status: "FILLED" },
  { time: "13:40:55", ticker: "SBIN", side: "SELL", qty: 900, px: 813.9, algo: "IS", slip: 0.06, status: "PARTIAL" },
  { time: "12:06:33", ticker: "ADANIPORTS", side: "BUY", qty: 640, px: 1378.5, algo: "VWAP", slip: -0.02, status: "FILLED" },
  { time: "11:22:07", ticker: "WIPRO", side: "SELL", qty: 1500, px: 544.1, algo: "TWAP", slip: 0.09, status: "FILLED" },
  { time: "10:04:12", ticker: "NTPC", side: "BUY", qty: 2100, px: 400.8, algo: "POV 5%", slip: -0.03, status: "FILLED" },
  { time: "09:41:50", ticker: "CIPLA", side: "BUY", qty: 310, px: 1519.7, algo: "IS", slip: -0.07, status: "CANCELLED" },
];

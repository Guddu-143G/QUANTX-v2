import { gauss, mulberry32 } from "../lib/format";

export type Point = { t: number; v: number; d?: string };

export type Asset = {
  ticker: string;
  name: string;
  sector: string;
  exch: "NSE" | "BSE" | "NASDAQ";
  price: number;
  chgPct: number;
  volumeCr: number;
  mcapCr: number;
  beta: number;
  vol30: number;
  pe: number;
  pb: number;
  divYield: number;
  roe: number;
  alpha: number;
  spark: number[];
};

/** Geometric random-walk price path with mean reversion — stable per seed. */
export function walk(seed: number, n: number, start: number, drift = 0.09, vol = 0.18): number[] {
  const rnd = mulberry32(seed);
  const dt = 1 / 252;
  const out: number[] = [start];
  let p = start;
  for (let i = 1; i < n; i++) {
    const shock = gauss(rnd) * vol * Math.sqrt(dt);
    p = p * Math.exp((drift - (vol * vol) / 2) * dt + shock);
    out.push(p);
  }
  return out;
}

export function sparkOf(seed: number, n = 28, drift = 0.1, vol = 0.2) {
  return walk(seed, n, 100, drift, vol);
}

type Row = [string, string, string, number, number, number, number, number, number, number, number, number, number, number];

// ticker, name, sector, price, chg%, vol(Cr), mcap(Cr), beta, vol30, pe, pb, divY, roe, alpha
const RAW: Row[] = [
  ["RELIANCE", "Reliance Industries", "Energy", 1482.4, 1.82, 4218, 2006400, 1.04, 18.2, 24.8, 2.1, 0.42, 9.1, 0.91],
  ["HDFCBANK", "HDFC Bank", "Financials", 1712.05, 0.94, 3860, 1304200, 0.96, 15.4, 19.2, 2.8, 1.12, 16.8, 0.88],
  ["ICICIBANK", "ICICI Bank", "Financials", 1284.6, 1.21, 2940, 903100, 1.02, 16.1, 18.4, 3.1, 0.86, 18.2, 0.84],
  ["INFY", "Infosys", "Technology", 1874.3, -0.62, 2110, 778500, 0.81, 19.6, 27.1, 8.4, 2.31, 31.4, 0.83],
  ["TCS", "Tata Consultancy Services", "Technology", 4126.8, -0.38, 1780, 1492000, 0.74, 17.3, 30.2, 14.1, 1.68, 46.2, 0.79],
  ["LT", "Larsen & Toubro", "Industrials", 3618.95, 2.14, 1490, 497200, 1.18, 21.7, 34.6, 5.2, 0.74, 15.1, 0.86],
  ["ITC", "ITC Limited", "Consumer", 468.2, 0.31, 1320, 585400, 0.62, 13.8, 25.4, 7.6, 3.28, 28.9, 0.61],
  ["BHARTIARTL", "Bharti Airtel", "Telecom", 1642.5, 1.06, 1610, 946800, 0.88, 20.4, 62.8, 9.2, 0.48, 12.4, 0.77],
  ["SBIN", "State Bank of India", "Financials", 812.35, -1.14, 2260, 724900, 1.24, 22.9, 10.8, 1.7, 1.72, 17.6, 0.68],
  ["AXISBANK", "Axis Bank", "Financials", 1148.7, -0.42, 1420, 355200, 1.16, 21.2, 13.6, 2.2, 0.09, 16.4, 0.58],
  ["KOTAKBANK", "Kotak Mahindra Bank", "Financials", 1786.4, 0.58, 1180, 355000, 0.92, 18.6, 18.9, 2.7, 0.11, 14.2, 0.54],
  ["HINDUNILVR", "Hindustan Unilever", "Consumer", 2412.6, -0.24, 940, 566800, 0.54, 14.2, 52.4, 10.8, 1.82, 20.6, 0.44],
  ["MARUTI", "Maruti Suzuki India", "Auto", 12184.0, 1.42, 860, 383100, 0.98, 20.8, 27.6, 4.1, 1.04, 16.2, 0.72],
  ["TATAMOTORS", "Tata Motors", "Auto", 742.85, 2.68, 2480, 273400, 1.42, 29.4, 9.2, 2.6, 0.41, 28.4, 0.74],
  ["SUNPHARMA", "Sun Pharmaceutical", "Healthcare", 1798.2, 0.86, 780, 431200, 0.71, 17.1, 36.4, 5.8, 0.62, 16.8, 0.69],
  ["CIPLA", "Cipla", "Healthcare", 1524.4, 0.42, 520, 123100, 0.68, 18.4, 26.8, 4.2, 0.86, 15.4, 0.56],
  ["ULTRACEMCO", "UltraTech Cement", "Materials", 11642.0, -0.94, 410, 336200, 1.08, 22.1, 44.2, 4.8, 0.36, 11.6, 0.48],
  ["TITAN", "Titan Company", "Consumer", 3384.5, 1.18, 690, 300400, 1.06, 23.4, 88.6, 26.4, 0.32, 32.1, 0.63],
  ["ASIANPAINT", "Asian Paints", "Materials", 2318.9, -1.62, 540, 222400, 0.84, 21.8, 48.2, 12.6, 1.42, 26.4, 0.31],
  ["POWERGRID", "Power Grid Corporation", "Utilities", 318.4, 0.68, 620, 296100, 0.58, 16.2, 17.4, 3.1, 3.42, 18.9, 0.52],
  ["NTPC", "NTPC Limited", "Utilities", 402.6, 1.24, 710, 390400, 0.74, 18.8, 16.2, 2.2, 2.18, 13.8, 0.58],
  ["ONGC", "Oil & Natural Gas Corp", "Energy", 268.9, -1.86, 890, 338200, 1.34, 26.4, 8.4, 1.1, 4.12, 14.2, 0.42],
  ["ADANIPORTS", "Adani Ports & SEZ", "Industrials", 1382.7, 3.24, 1040, 298700, 1.48, 31.2, 32.8, 6.2, 0.22, 18.4, 0.71],
  ["WIPRO", "Wipro", "Technology", 542.8, -0.86, 620, 283900, 0.86, 20.6, 24.2, 4.1, 0.18, 15.6, 0.38],
];

export const ASSETS: Asset[] = RAW.map((r, i) => ({
  ticker: r[0],
  name: r[1],
  sector: r[2],
  exch: "NSE",
  price: r[3],
  chgPct: r[4],
  volumeCr: r[5],
  mcapCr: r[6],
  beta: r[7],
  vol30: r[8],
  pe: r[9],
  pb: r[10],
  divYield: r[11],
  roe: r[12],
  alpha: r[13],
  spark: sparkOf(1201 + i * 17, 30, r[4] > 0 ? 0.28 : -0.14, 0.16 + i * 0.004),
}));

export const assetBy = (t: string) => ASSETS.find((a) => a.ticker === t.toUpperCase());

export type Index = {
  key: string;
  name: string;
  value: number;
  chgPct: number;
  spark: number[];
  region: "IN" | "US" | "VOL";
};

export const INDICES: Index[] = [
  { key: "NIFTY", name: "NIFTY 50", value: 24812.4, chgPct: 0.72, spark: sparkOf(41, 32, 0.24, 0.11), region: "IN" },
  { key: "SENSEX", name: "SENSEX", value: 81420.16, chgPct: 0.54, spark: sparkOf(77, 32, 0.2, 0.11), region: "IN" },
  { key: "BANKNIFTY", name: "BANK NIFTY", value: 53184.9, chgPct: 0.91, spark: sparkOf(93, 32, 0.3, 0.14), region: "IN" },
  { key: "NASDAQ", name: "NASDAQ", value: 19440.32, chgPct: 0.81, spark: sparkOf(131, 32, 0.32, 0.15), region: "US" },
  { key: "SPX", name: "S&P 500", value: 5842.11, chgPct: 0.46, spark: sparkOf(157, 32, 0.22, 0.1), region: "US" },
  { key: "VIX", name: "INDIA VIX", value: 14.24, chgPct: -3.21, spark: sparkOf(181, 32, -0.4, 0.32), region: "VOL" },
  { key: "USDINR", name: "USD/INR", value: 83.42, chgPct: 0.12, spark: sparkOf(199, 32, 0.03, 0.04), region: "IN" },
  { key: "GOLD", name: "GOLD MCX", value: 74280, chgPct: -0.34, spark: sparkOf(223, 32, 0.12, 0.09), region: "IN" },
];

export const SECTOR_PERF = [
  { sector: "Financials", chg: 1.24, weight: 23.4, alpha: 0.42 },
  { sector: "Technology", chg: -0.58, weight: 18.2, alpha: 0.31 },
  { sector: "Energy", chg: 1.86, weight: 14.1, alpha: 0.28 },
  { sector: "Consumer", chg: 0.34, weight: 11.4, alpha: -0.12 },
  { sector: "Healthcare", chg: 0.72, weight: 9.2, alpha: 0.18 },
  { sector: "Industrials", chg: 2.04, weight: 8.6, alpha: 0.44 },
  { sector: "Auto", chg: 1.62, weight: 6.4, alpha: 0.21 },
  { sector: "Materials", chg: -1.18, weight: 4.8, alpha: -0.24 },
  { sector: "Utilities", chg: 0.94, weight: 3.9, alpha: 0.08 },
];

export const MARKET_BREADTH = { advances: 1284, declines: 742, unchanged: 96, high52: 148, low52: 37 };

/** Intraday OHLC candles for the asset detail page. */
export function candles(seed: number, n: number, start: number) {
  const rnd = mulberry32(seed);
  const out: { t: string; o: number; h: number; l: number; c: number; v: number }[] = [];
  let c = start;
  for (let i = 0; i < n; i++) {
    const o = c;
    const move = gauss(rnd) * start * 0.008;
    c = Math.max(start * 0.7, o + move);
    const h = Math.max(o, c) + Math.abs(gauss(rnd)) * start * 0.004;
    const l = Math.min(o, c) - Math.abs(gauss(rnd)) * start * 0.004;
    const hh = 9 + Math.floor((i * 375) / n / 60);
    const mm = Math.floor(((i * 375) / n) % 60);
    out.push({
      t: `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`,
      o, h, l, c,
      v: 40 + rnd() * 160,
    });
  }
  return out;
}

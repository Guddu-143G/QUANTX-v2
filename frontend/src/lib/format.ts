/** QUANTX — financial formatting primitives. All values tabular-safe. */

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Deterministic PRNG so mock series never re-shuffle between renders. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box–Muller normal draw from a uniform generator. */
export function gauss(rnd: () => number) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rnd();
  while (v === 0) v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Indian digit grouping: 1,04,21,842 */
export function inGroup(n: number, decimals = 2): string {
  const neg = n < 0;
  const abs = Math.abs(n);
  const fixed = abs.toFixed(decimals);
  const [int, dec] = fixed.split(".");
  let out = "";
  if (int.length > 3) {
    const last3 = int.slice(-3);
    let rest = int.slice(0, -3);
    const parts: string[] = [];
    while (rest.length > 2) {
      parts.unshift(rest.slice(-2));
      rest = rest.slice(0, -2);
    }
    if (rest.length) parts.unshift(rest);
    out = parts.join(",") + "," + last3;
  } else out = int;
  return (neg ? "-" : "") + out + (dec ? "." + dec : "");
}

export const inr = (n: number, d = 2) => `₹${inGroup(n, d)}`;

/** Compact Indian scale: Cr / L / K */
export function inrCompact(n: number, d = 2): string {
  const neg = n < 0;
  const a = Math.abs(n);
  const s = neg ? "-" : "";
  if (a >= 1e7) return `${s}₹${(a / 1e7).toFixed(d)} Cr`;
  if (a >= 1e5) return `${s}₹${(a / 1e5).toFixed(d)} L`;
  if (a >= 1e3) return `${s}₹${(a / 1e3).toFixed(1)}K`;
  return `${s}₹${a.toFixed(0)}`;
}

export function compact(n: number, d = 1): string {
  const a = Math.abs(n);
  const s = n < 0 ? "-" : "";
  if (a >= 1e7) return `${s}${(a / 1e7).toFixed(d)}Cr`;
  if (a >= 1e5) return `${s}${(a / 1e5).toFixed(d)}L`;
  if (a >= 1e3) return `${s}${(a / 1e3).toFixed(d)}K`;
  return `${s}${a.toFixed(0)}`;
}

/** Signed percentage with explicit sign — never rely on colour alone. */
export const pct = (n: number, d = 2) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(d)}%`;
export const pctPlain = (n: number, d = 1) => `${n.toFixed(d)}%`;
export const signed = (n: number, d = 2) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(d)}`;
export const arrow = (n: number) => (n >= 0 ? "↑" : "↓");
export const dirWord = (n: number) => (n >= 0 ? "up" : "down");

export const num = (n: number, d = 2) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });

export function toneOf(n: number): "pos" | "neg" | "neu" {
  if (n > 0.00001) return "pos";
  if (n < -0.00001) return "neg";
  return "neu";
}

export const toneText: Record<string, string> = {
  pos: "text-pos",
  neg: "text-neg",
  neu: "text-txt-secondary",
  warn: "text-warn",
};

export function timeIST(d = new Date()) {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

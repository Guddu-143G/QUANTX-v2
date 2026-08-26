import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useMarketData } from "./MarketContext";
import { ASSETS } from "../data/market";

export type AlertRule = {
  id: string;
  ticker: string;
  type: "price_above" | "price_below" | "pct_change";
  threshold: number;
  triggered: boolean;
  createdAt: number;
};

export type WatchlistItem = {
  ticker: string;
  addedAt: number;
};

type WatchlistContextType = {
  items: WatchlistItem[];
  alerts: AlertRule[];
  isWatched: (ticker: string) => boolean;
  addToWatchlist: (ticker: string) => void;
  removeFromWatchlist: (ticker: string) => void;
  toggleWatchlist: (ticker: string) => void;
  addAlert: (rule: Omit<AlertRule, "id" | "triggered" | "createdAt">) => void;
  removeAlert: (id: string) => void;
  clearTriggered: () => void;
  triggeredCount: number;
};

const WatchlistCtx = createContext<WatchlistContextType | null>(null);

const LS_ITEMS = "qx-watchlist-items";
const LS_ALERTS = "qx-watchlist-alerts";

function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WatchlistItem[]>(() => loadLS<WatchlistItem[]>(LS_ITEMS, []));
  const [alerts, setAlerts] = useState<AlertRule[]>(() => loadLS<AlertRule[]>(LS_ALERTS, []));
  const { ticks } = useMarketData();
  const toastCbRef = useRef<((msg: string, ticker: string) => void) | null>(null);

  useEffect(() => { localStorage.setItem(LS_ITEMS, JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem(LS_ALERTS, JSON.stringify(alerts)); }, [alerts]);

  // Check alerts against live ticks
  useEffect(() => {
    setAlerts((prev) =>
      prev.map((rule) => {
        if (rule.triggered) return rule;
        const asset = ASSETS.find((a) => a.ticker === rule.ticker);
        if (!asset?.token) return rule;
        const tick = ticks[asset.token];
        if (!tick) return rule;
        const price = tick.last_price;
        let fired = false;
        if (rule.type === "price_above" && price >= rule.threshold) fired = true;
        if (rule.type === "price_below" && price <= rule.threshold) fired = true;
        if (rule.type === "pct_change") {
          const change = tick.change ?? 0;
          if (Math.abs(change) >= rule.threshold) fired = true;
        }
        if (fired) {
          toastCbRef.current?.(
            rule.type === "price_above"
              ? `${rule.ticker} crossed ₹${rule.threshold} (above)`
              : rule.type === "price_below"
              ? `${rule.ticker} dropped to ₹${rule.threshold} (below)`
              : `${rule.ticker} moved ${rule.threshold}%+`,
            rule.ticker
          );
          return { ...rule, triggered: true };
        }
        return rule;
      })
    );
  }, [ticks]);

  const isWatched = useCallback((ticker: string) => items.some((i) => i.ticker === ticker), [items]);
  const addToWatchlist = useCallback((ticker: string) => {
    setItems((prev) => prev.some((i) => i.ticker === ticker) ? prev : [...prev, { ticker, addedAt: Date.now() }]);
  }, []);
  const removeFromWatchlist = useCallback((ticker: string) => {
    setItems((prev) => prev.filter((i) => i.ticker !== ticker));
  }, []);
  const toggleWatchlist = useCallback((ticker: string) => {
    if (isWatched(ticker)) removeFromWatchlist(ticker);
    else addToWatchlist(ticker);
  }, [isWatched, addToWatchlist, removeFromWatchlist]);
  const addAlert = useCallback((rule: Omit<AlertRule, "id" | "triggered" | "createdAt">) => {
    setAlerts((prev) => [...prev, { ...rule, id: `al-${Date.now()}`, triggered: false, createdAt: Date.now() }]);
  }, []);
  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);
  const clearTriggered = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, triggered: false })));
  }, []);

  const triggeredCount = alerts.filter((a) => a.triggered).length;

  return (
    <WatchlistCtx.Provider value={{ items, alerts, isWatched, addToWatchlist, removeFromWatchlist, toggleWatchlist, addAlert, removeAlert, clearTriggered, triggeredCount }}>
      {children}
    </WatchlistCtx.Provider>
  );
};

export const useWatchlist = () => {
  const ctx = useContext(WatchlistCtx);
  if (!ctx) throw new Error("useWatchlist must be used within WatchlistProvider");
  return ctx;
};

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { CONFIG } from "../config";
import { ASSETS } from "../data/market";

export type TickData = {
  instrument_token: number;
  last_price: number;
  average_trade_price?: number;
  volume_traded?: number;
  total_buy_quantity?: number;
  total_sell_quantity?: number;
  ohlc?: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
  change?: number;
};

type MarketContextType = {
  ticks: Record<number, TickData>;
  subscribe: (tokens: number[]) => void;
  unsubscribe: (tokens: number[]) => void;
  connected: boolean;
};

const MarketContext = createContext<MarketContextType | null>(null);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ticks, setTicks] = useState<Record<number, TickData>>({});
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const subscriptions = useRef<Set<number>>(new Set());

  useEffect(() => {
    // DEMO mode — simulated price random-walk ticks every 2s
    if (CONFIG.DATA_MODE !== "LIVE") {
      // Seed initial prices
      const initial: Record<number, TickData> = {};
      ASSETS.forEach((a) => {
        if (a.token) initial[a.token] = { instrument_token: a.token, last_price: a.price, change: a.chgPct };
      });
      setTicks(initial);
      setConnected(true);

      const interval = window.setInterval(() => {
        setTicks((prev) => {
          const next = { ...prev };
          ASSETS.forEach((a) => {
            if (!a.token) return;
            const existing = prev[a.token];
            if (!existing) return;
            // Random walk: ±0.08% per tick, clamped to ±5% daily
            const drift = (Math.random() - 0.5) * 0.0016;
            const newPrice = +(existing.last_price * (1 + drift)).toFixed(2);
            const change = +((newPrice - a.price) / a.price * 100).toFixed(3);
            next[a.token] = { ...existing, last_price: newPrice, change };
          });
          return next;
        });
      }, 2000);
      return () => window.clearInterval(interval);
    }

    // LIVE mode — connect to websocket
    let ws: WebSocket;
    let reconnectTimer: number;

    const connect = () => {
      ws = new WebSocket("ws://localhost:8000/ws/market");
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        // Resubscribe to existing tokens on reconnect
        if (subscriptions.current.size > 0) {
          ws.send(JSON.stringify({ action: "subscribe", tokens: Array.from(subscriptions.current) }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data: TickData = JSON.parse(event.data);
          setTicks((prev) => ({ ...prev, [data.instrument_token]: data }));
        } catch (e) {
          console.error("Failed to parse tick", e);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        // Reconnect logic
        reconnectTimer = window.setTimeout(connect, 3000);
      };
      
      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        ws.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const subscribe = (tokens: number[]) => {
    tokens.forEach((t) => subscriptions.current.add(t));
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "subscribe", tokens }));
    }
  };

  const unsubscribe = (tokens: number[]) => {
    tokens.forEach((t) => subscriptions.current.delete(t));
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "unsubscribe", tokens }));
    }
  };

  return (
    <MarketContext.Provider value={{ ticks, subscribe, unsubscribe, connected }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarketData = () => {
  const context = useContext(MarketContext);
  if (!context) throw new Error("useMarketData must be used within MarketProvider");
  return context;
};

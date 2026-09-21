"""
quantx/core/l3_microstructure.py
Level-3 Order Book Reconstruction, Micro-Price & Order Book Imbalance (OBI) Engine.
Implements the formulation from suggestions-v9.md Section 2.
"""

from __future__ import annotations
from typing import Any, Dict, Tuple


class L3MicrostructureEngine:
    """
    Sovereign-Grade Level-3 Order Book Reconstruction and Microstructure 
    Toxicity Engine. Computes Micro-Price, OBI, and Spread Elasticity.
    """
    def __init__(self, ticker: str):
        self.ticker = ticker
        self.bids: Dict[float, float] = {}
        self.asks: Dict[float, float] = {}

    def update_order_book(self, side: str, action: str, price: float, qty: float) -> None:
        """Updates the L3 order book state based on event actions (ADD, CANCEL, FILL)."""
        book = self.bids if side.upper() == "BUY" else self.asks
        
        if action.upper() == "ADD":
            book[price] = book.get(price, 0.0) + qty
        elif action.upper() in ["CANCEL", "FILL"]:
            if price in book:
                book[price] -= qty
                if book[price] <= 1e-6:
                    del book[price]

    def get_best_bid_ask(self) -> Tuple[Tuple[float, float], Tuple[float, float]]:
        """Returns ((best_bid_price, volume), (best_ask_price, volume))."""
        if not self.bids or not self.asks:
            return (0.0, 0.0), (0.0, 0.0)
        best_bid = max(self.bids.keys())
        best_ask = min(self.asks.keys())
        return (best_bid, self.bids[best_bid]), (best_ask, self.asks[best_ask])

    def calculate_metrics(self) -> Dict[str, Any]:
        """
        Computes mathematical micro-price, order book imbalance (OBI), and spread:
        P_micro = (V_bid * P_ask + V_ask * P_bid) / (V_bid + V_ask)
        OBI = (V_bid - V_ask) / (V_bid + V_ask)
        """
        (bid_px, bid_vol), (ask_px, ask_vol) = self.get_best_bid_ask()
        
        if bid_px == 0.0 or ask_px == 0.0:
            return {
                "micro_price": 0.0,
                "obi": 0.0,
                "spread_bps": 0.0,
                "mid_price": 0.0
            }
            
        spread = ask_px - bid_px
        mid_price = (bid_px + ask_px) / 2.0
        spread_bps = (spread / mid_price) * 10000
        
        total_vol = bid_vol + ask_vol
        micro_price = ((bid_vol * ask_px) + (ask_vol * bid_px)) / total_vol if total_vol > 0 else mid_price
        obi = (bid_vol - ask_vol) / total_vol if total_vol > 0 else 0.0
        
        return {
            "best_bid_px": bid_px,
            "best_bid_vol": bid_vol,
            "best_ask_px": ask_px,
            "best_ask_vol": ask_vol,
            "mid_price": mid_price,
            "micro_price": micro_price,
            "obi": obi,
            "spread_bps": spread_bps
        }

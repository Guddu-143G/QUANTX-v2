"""
quantx/core/l3_orderbook.py
Level-3 Limit Order Book (LOB) Reconstruction & VPIN Microstructure Engine.
Implements the formulation from suggestions-v6.md Section 1.
"""

from __future__ import annotations
from typing import Any, Dict, List, Tuple
import numpy as np


class L3PriceLevel:
    def __init__(self, price: float):
        self.price: float = price
        self.total_volume: float = 0.0
        self.orders: Dict[str, float] = {}

    def add_order(self, order_id: str, size: float):
        self.orders[order_id] = size
        self.total_volume += size

    def update_order(self, order_id: str, new_size: float):
        if order_id in self.orders:
            diff = new_size - self.orders[order_id]
            self.orders[order_id] = new_size
            self.total_volume += diff

    def remove_order(self, order_id: str):
        if order_id in self.orders:
            self.total_volume -= self.orders[order_id]
            del self.orders[order_id]


class Level3OrderBook:
    def __init__(self, ticker: str):
        self.ticker: str = ticker
        self.bids: Dict[float, L3PriceLevel] = {}
        self.asks: Dict[float, L3PriceLevel] = {}
        self.order_map: Dict[str, Tuple[float, str]] = {}

    def process_message(self, msg: dict):
        m_type = msg.get("type", "ADD")
        order_id = msg.get("order_id", "")
        
        if m_type == "ADD":
            price = float(msg.get("price", 0.0))
            side = msg.get("side", "B")
            size = float(msg.get("size", 0.0))
            self.order_map[order_id] = (price, side)
            book = self.bids if side == "B" else self.asks
            if price not in book:
                book[price] = L3PriceLevel(price)
            book[price].add_order(order_id, size)
            
        elif m_type == "MODIFY":
            if order_id in self.order_map:
                price, side = self.order_map[order_id]
                book = self.bids if side == "B" else self.asks
                if price in book:
                    book[price].update_order(order_id, float(msg.get("size", 0.0)))
                
        elif m_type in ["CANCEL", "EXECUTE"]:
            if order_id in self.order_map:
                price, side = self.order_map[order_id]
                book = self.bids if side == "B" else self.asks
                if price in book:
                    book[price].remove_order(order_id)
                    if book[price].total_volume <= 0.0:
                        del book[price]
                del self.order_map[order_id]

    def get_spread(self) -> Tuple[float, float, float]:
        best_bid = max(self.bids.keys()) if self.bids else 0.0
        best_ask = min(self.asks.keys()) if self.asks else 0.0
        spread = best_ask - best_bid if (best_bid and best_ask) else 0.0
        return best_bid, best_ask, spread


def calculate_vpin(
    buy_volumes: List[float],
    sell_volumes: List[float],
    bucket_volume: float
) -> float:
    """
    Computes Volume-Synchronized Probability of Toxicity (VPIN):
    VPIN = Sum(|V_tau^B - V_tau^S|) / (N * V)
    """
    n = min(len(buy_volumes), len(sell_volumes))
    if n == 0 or bucket_volume <= 0:
        return 0.0
        
    imbalance_sum = sum(abs(buy_volumes[i] - sell_volumes[i]) for i in range(n))
    vpin = imbalance_sum / (n * bucket_volume)
    return float(vpin)

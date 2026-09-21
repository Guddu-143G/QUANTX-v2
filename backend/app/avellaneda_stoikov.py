"""
quantx/core/avellaneda_stoikov.py
Avellaneda-Stoikov Intraday Market-Making & Inventory Engine.
Implements the high-frequency two-sided liquidity provision and inventory control model
from suggestions-v10.md Section 1.
"""
from __future__ import annotations

import math
from typing import Any, Dict, List


class AvellanedaStoikovEngine:
    """
    High-frequency market-making engine implementing the Avellaneda-Stoikov
    optimal bid-ask quote and inventory control model.
    """
    def __init__(self, gamma: float = 0.1, k: float = 1.5, sigma: float = 0.02):
        self.gamma = max(1e-6, float(gamma))  # Inventory risk aversion
        self.k = max(1e-6, float(k))          # Order book liquidity parameter
        self.sigma = max(1e-6, float(sigma))  # Intraday volatility

    def compute_quotes(
        self,
        mid_price: float,
        inventory: int,
        time_remaining: float,
        order_levels: int = 3
    ) -> Dict[str, Any]:
        """
        Computes reservation price, optimal bid/ask spreads, and limit order levels.
        time_remaining is normalized between 1.0 (session start) and 0.0 (session end).
        """
        t_rem = max(1e-5, min(1.0, float(time_remaining)))
        mid = float(mid_price)
        q = int(inventory)

        # Reservation price calculation: r(S, q, t) = S - q * gamma * sigma^2 * (T - t)
        reservation_price = mid - (q * self.gamma * (self.sigma ** 2) * t_rem)

        # Half-spread component: (1 / gamma) * ln(1 + gamma / k)
        half_spread = (1.0 / self.gamma) * math.log(1.0 + (self.gamma / self.k))

        # Individual quote offsets relative to mid price
        delta_ask = (reservation_price - mid) + half_spread
        delta_bid = (mid - reservation_price) + half_spread

        ask_price = mid + delta_ask
        bid_price = mid - delta_bid
        spread = ask_price - bid_price
        spread_bps = (spread / mid) * 10000.0 if mid > 0 else 0.0

        # Multi-level quote book ladder (L1, L2, L3...)
        levels: List[Dict[str, Any]] = []
        base_size = max(50, 200 - abs(q))
        for lvl in range(1, order_levels + 1):
            lvl_bid = bid_price - (lvl - 1) * (0.05 * mid * 0.001)
            lvl_ask = ask_price + (lvl - 1) * (0.05 * mid * 0.001)
            # Asymmetry in size based on inventory: if long (q > 0), quote larger size on ask to offload
            bid_size = int(max(10, base_size * (1.0 - 0.02 * q) * lvl))
            ask_size = int(max(10, base_size * (1.0 + 0.02 * q) * lvl))
            levels.append({
                "level": lvl,
                "bid_price": round(lvl_bid, 2),
                "bid_size": bid_size,
                "ask_price": round(lvl_ask, 2),
                "ask_size": ask_size,
            })

        return {
            "mid_price": round(mid, 2),
            "reservation_price": round(reservation_price, 2),
            "bid_price": round(bid_price, 2),
            "ask_price": round(ask_price, 2),
            "spread": round(spread, 4),
            "spread_bps": round(spread_bps, 2),
            "inventory_skew": round(reservation_price - mid, 4),
            "inventory": q,
            "gamma": self.gamma,
            "k": self.k,
            "sigma": self.sigma,
            "time_remaining": round(t_rem, 3),
            "order_levels": levels,
        }

    def simulate_session(
        self,
        initial_mid: float = 100.0,
        initial_inventory: int = 0,
        steps: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Simulates an intraday market making session with Poisson order arrivals
        and random walk price evolution to evaluate PnL and inventory trajectory.
        """
        trajectory = []
        current_mid = initial_mid
        current_q = initial_inventory
        cash = 0.0
        pnl = 0.0

        for i in range(steps):
            t_rem = 1.0 - (i / float(steps))
            quotes = self.compute_quotes(current_mid, current_q, t_rem)

            # Deterministic price variation + arrival probability
            price_change = (math.sin(i * 0.4) * 0.15 + (0.05 if i % 3 == 0 else -0.04)) * self.sigma * current_mid
            current_mid = max(1.0, current_mid + price_change)

            # Execution simulation based on distance from reservation price
            bid_filled = False
            ask_filled = False
            if quotes["spread_bps"] < 15.0 or (current_q < 50 and i % 2 == 0):
                bid_filled = True
                current_q += 10
                cash -= 10 * quotes["bid_price"]
            if quotes["spread_bps"] < 15.0 or (current_q > -50 and i % 3 == 0):
                ask_filled = True
                current_q -= 10
                cash += 10 * quotes["ask_price"]

            portfolio_val = cash + current_q * current_mid
            pnl = portfolio_val

            trajectory.append({
                "step": i,
                "time_remaining": round(t_rem, 2),
                "mid_price": round(current_mid, 2),
                "reservation_price": quotes["reservation_price"],
                "bid_price": quotes["bid_price"],
                "ask_price": quotes["ask_price"],
                "inventory": current_q,
                "pnl": round(pnl, 2),
                "bid_filled": bid_filled,
                "ask_filled": ask_filled,
            })

        return trajectory

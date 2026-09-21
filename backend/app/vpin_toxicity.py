"""
QUANTX Platform — Version 19 (v19)
Module 2: Real-Time Order Flow Toxicity & Dynamic VPIN Surface Radar
"""

import math
from typing import List, Dict, Any, Optional

class RealTimeVPINEngine:
    """
    High-Frequency Volume-Synchronized Probability of Toxicity (VPIN) Engine.
    Processes live ticks and updates toxicity metrics across dynamic volume bars.
    """
    def __init__(self, volume_bucket_size: int = 10000, num_buckets: int = 50):
        self.bucket_size = volume_bucket_size
        self.num_buckets = num_buckets
        self.current_bucket_volume = 0
        self.current_buy_volume = 0.0
        self.current_sell_volume = 0.0
        self.bucket_imbalances: List[float] = []
        self.bucket_history: List[Dict[str, Any]] = []

    def process_tick(self, price: float, volume: int, prev_price: float) -> Dict[str, Any]:
        """
        Processes a single market tick, applies Lee-Ready classification,
        and updates rolling VPIN.
        """
        # Lee-Ready Tick Classification Rule
        if price > prev_price:
            buy_vol = float(volume)
            sell_vol = 0.0
            tick_direction = "BUY"
        elif price < prev_price:
            buy_vol = 0.0
            sell_vol = float(volume)
            tick_direction = "SELL"
        else:
            # Zero-tick fallback (split 50/50)
            buy_vol = volume / 2.0
            sell_vol = volume / 2.0
            tick_direction = "ZERO_TICK"

        remaining_vol = volume
        vpin_updated = False
        vpin_score = 0.0

        while remaining_vol > 0:
            space_in_bucket = self.bucket_size - self.current_bucket_volume
            fill_amount = min(remaining_vol, space_in_bucket)

            ratio = fill_amount / max(1, volume)
            self.current_buy_volume += buy_vol * ratio
            self.current_sell_volume += sell_vol * ratio
            self.current_bucket_volume += fill_amount
            remaining_vol -= fill_amount

            # If bucket is complete, calculate imbalance and append to queue
            if self.current_bucket_volume >= self.bucket_size:
                imbalance = abs(self.current_buy_volume - self.current_sell_volume)
                self.bucket_imbalances.append(imbalance)

                bucket_record = {
                    "bucket_index": len(self.bucket_history) + 1,
                    "buy_volume": round(self.current_buy_volume, 1),
                    "sell_volume": round(self.current_sell_volume, 1),
                    "imbalance": round(imbalance, 1),
                    "imbalance_ratio": round(imbalance / max(1.0, self.bucket_size), 4),
                    "price_mark": price
                }
                self.bucket_history.append(bucket_record)
                if len(self.bucket_history) > 60:
                    self.bucket_history.pop(0)

                if len(self.bucket_imbalances) > self.num_buckets:
                    self.bucket_imbalances.pop(0)

                # Reset bucket accumulators
                self.current_bucket_volume = 0
                self.current_buy_volume = 0.0
                self.current_sell_volume = 0.0
                vpin_updated = True

        if len(self.bucket_imbalances) > 0:
            vpin_score = sum(self.bucket_imbalances) / (len(self.bucket_imbalances) * self.bucket_size)
        else:
            vpin_score = 0.25  # Prior baseline

        toxicity_regime = "HIGH_TOXICITY" if vpin_score > 0.70 else ("ELEVATED" if vpin_score > 0.45 else "NORMAL")
        adverse_selection_risk_bps = round(vpin_score * 16.5, 2)

        return {
            "price": price,
            "volume": volume,
            "tick_direction": tick_direction,
            "vpin_score": round(vpin_score, 4),
            "vpin_updated": vpin_updated,
            "toxicity_regime": toxicity_regime,
            "adverse_selection_risk_bps": adverse_selection_risk_bps,
            "completed_buckets_count": len(self.bucket_imbalances),
            "current_bucket_fill_pct": round((self.current_bucket_volume / self.bucket_size) * 100, 1),
            "recent_buckets": self.bucket_history[-10:]
        }

    def simulate_toxicity_surface(
        self,
        symbol: str = "RELIANCE.NS",
        base_price: float = 2950.0,
        num_ticks: int = 100,
        stress_mode: bool = False
    ) -> Dict[str, Any]:
        """
        Simulates high-frequency tick stream and computes VPIN surface across volume buckets.
        """
        engine = RealTimeVPINEngine(volume_bucket_size=2500, num_buckets=20)
        ticks = []
        curr_p = base_price

        for i in range(num_ticks):
            vol = 300 + (i % 7) * 200
            if stress_mode and i > 40 and i < 70:
                # Sudden toxic selling wave
                vol = 1500 + (i % 5) * 400
                curr_p -= (0.50 + (i % 3) * 0.20)
            else:
                drift = 0.25 if (i % 3 == 0) else (-0.20 if (i % 3 == 1) else 0.0)
                curr_p += drift

            res = engine.process_tick(round(curr_p, 2), vol, round(curr_p - 0.1, 2))
            ticks.append(res)

        final_state = ticks[-1] if ticks else {}
        return {
            "symbol": symbol,
            "total_ticks_processed": num_ticks,
            "stress_mode": stress_mode,
            "latest_vpin_score": final_state.get("vpin_score", 0.35),
            "latest_regime": final_state.get("toxicity_regime", "NORMAL"),
            "adverse_selection_risk_bps": final_state.get("adverse_selection_risk_bps", 5.2),
            "completed_buckets": engine.bucket_history,
            "tick_trajectory": ticks[-25:]
        }

vpin_engine = RealTimeVPINEngine()

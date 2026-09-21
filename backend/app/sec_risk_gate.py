"""
quantx/core/sec_risk_gate.py
SEC Rule 15c3-5 Pre-Trade Regulatory Risk Gate & Fat-Finger Protection.
Implements the formulation from suggestions-v9.md Section 6.
"""

from __future__ import annotations
from typing import Any, Dict, List


class SEC15c35PreTradeRiskGate:
    """
    High-Performance Pre-Trade Risk Surveillance Engine to enforce compliance 
    under SEC Rule 15c3-5 (Market Access Rule) with fat-finger price collars,
    single-order notional caps, daily aggregate limits, and leaky-bucket throttlers.
    """
    def __init__(
        self,
        max_notional_per_order: float = 1_000_000.0,
        max_aggregate_daily_notional: float = 25_000_000.0,
        fat_finger_collar_pct: float = 0.05,
        max_orders_per_second: int = 50
    ):
        self.max_notional_per_order = max_notional_per_order
        self.max_aggregate_daily_notional = max_aggregate_daily_notional
        self.fat_finger_collar_pct = fat_finger_collar_pct
        self.max_orders_per_second = max_orders_per_second
        
        self.daily_accumulated_notional = 0.0
        self.order_timestamps: List[float] = []

    def verify_pre_trade_limits(
        self,
        symbol: str,
        qty: int,
        price: float,
        reference_last_price: float,
        timestamp_epoch_ms: float
    ) -> Dict[str, Any]:
        """
        Executes four sequential low-latency checks before approving an order for routing:
        1. Fat-Finger Price Collar Check
        2. Single-Order Notional Cap Check
        3. Multi-Tenant Daily Aggregate Exposure Check
        4. High-Frequency Order-Rate Throttler (Leaky Bucket)
        """
        order_notional = qty * price
        
        # Check 1: Fat-Finger Price Collar Check
        lower_collar = reference_last_price * (1.0 - self.fat_finger_collar_pct)
        upper_collar = reference_last_price * (1.0 + self.fat_finger_collar_pct)
        if price < lower_collar or price > upper_collar:
            return {
                "approved": False, 
                "reject_code": "FAT_FINGER_PRICE_COLLAR_BREACH", 
                "details": f"Price {price:.2f} deviates from reference price {reference_last_price:.2f} beyond {self.fat_finger_collar_pct*100:.1f}% collar."
            }
            
        # Check 2: Single-Order Notional Cap Check
        if order_notional > self.max_notional_per_order:
            return {
                "approved": False, 
                "reject_code": "SINGLE_ORDER_NOTIONAL_CAP_BREACH", 
                "details": f"Order Notional {order_notional:.2f} exceeds single order limit {self.max_notional_per_order:.2f}."
            }
            
        # Check 3: Multi-Tenant Daily Aggregate Exposure Check
        if self.daily_accumulated_notional + order_notional > self.max_aggregate_daily_notional:
            return {
                "approved": False, 
                "reject_code": "AGGREGATE_DAILY_NOTIONAL_BREACH", 
                "details": f"Adding this order violates total daily allowance {self.max_aggregate_daily_notional:.2f}."
            }
            
        # Check 4: High-Frequency Order-Rate Throttler (Leaky Bucket)
        current_time_sec = timestamp_epoch_ms / 1000.0
        self.order_timestamps = [t for t in self.order_timestamps if current_time_sec - t <= 1.0]
        
        if len(self.order_timestamps) >= self.max_orders_per_second:
            return {
                "approved": False, 
                "reject_code": "ORDER_RATE_LIMIT_EXCEEDED", 
                "details": f"Throttling triggered: {len(self.order_timestamps)} orders submitted in trailing 1s window (Limit: {self.max_orders_per_second}/s)."
            }
            
        # Secure Commit
        self.daily_accumulated_notional += order_notional
        self.order_timestamps.append(current_time_sec)
        
        return {
            "approved": True, 
            "reject_code": None, 
            "allocated_notional": order_notional,
            "running_daily_notional": self.daily_accumulated_notional
        }

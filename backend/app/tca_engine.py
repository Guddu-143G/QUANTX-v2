"""
quantx/core/tca_engine.py
Real-Time Transaction Cost Analysis (TCA) Engine & Almgren-Chriss Market Impact Solver.
Implements the formulation from suggestions-v8.md Section 3.
"""

from __future__ import annotations
from typing import Any, Dict
import numpy as np
import pandas as pd


class RealTimeTCAEngine:
    """
    Enterprise Transaction Cost Analysis (TCA) Engine for pre-trade 
    impact modeling and real-time execution slip measurement.
    """
    def __init__(
        self,
        gamma: float = 0.5,
        eta: float = 0.1,
        alpha: float = 1.0,
        beta: float = 1.0
    ):
        self.gamma = gamma  # Permanent impact coefficient
        self.eta = eta      # Temporary impact coefficient
        self.alpha = alpha  # Permanent non-linear exponent
        self.beta = beta    # Temporary non-linear exponent

    def estimate_pre_trade_impact(
        self,
        size: float,
        adv: float,
        daily_vol: float,
        duration_pct: float,
        price: float
    ) -> Dict[str, float]:
        """
        Estimates permanent, temporary, and dollar-value market impact using the Almgren-Chriss framework:
        Total Cost = I_perm + I_temp = gamma * sigma * (theta / ADV)^alpha + eta * sigma * (theta / (tau * ADV))^beta
        """
        if adv <= 0 or duration_pct <= 0:
            raise ValueError("Average Daily Volume (ADV) and execution duration percentage must be positive.")
        
        participation_rate = size / adv
        
        # Permanent impact
        perm_impact_pct = self.gamma * daily_vol * (participation_rate ** self.alpha)
        # Temporary impact
        temp_impact_pct = self.eta * daily_vol * ((participation_rate / duration_pct) ** self.beta)
        
        total_impact_pct = perm_impact_pct + temp_impact_pct
        dollar_cost = size * price * total_impact_pct
        
        return {
            "permanent_impact_bps": perm_impact_pct * 10000,
            "temporary_impact_bps": temp_impact_pct * 10000,
            "total_estimated_impact_bps": total_impact_pct * 10000,
            "estimated_cost_usd": dollar_cost
        }

    def calculate_realtime_slippage(
        self,
        execution_fills: pd.DataFrame,
        arrival_price: float
    ) -> Dict[str, Any]:
        """
        Processes execution fills to compute Implementation Shortfall (IS) 
        and volume-weighted average price (VWAP) slippage.
        """
        if execution_fills.empty:
            return {"slippage_usd": 0.0, "slippage_bps": 0.0, "total_executed_value": 0.0}
            
        execution_fills["fill_value"] = execution_fills["qty"] * execution_fills["price"]
        total_executed_value = float(execution_fills["fill_value"].sum())
        total_qty = float(execution_fills["qty"].sum())
        
        weighted_average_fill_price = total_executed_value / total_qty if total_qty > 0 else arrival_price
        
        # Implementation Shortfall (IS) slippage
        is_slippage_bps = float(((weighted_average_fill_price - arrival_price) / arrival_price) * 10000)
        is_slippage_usd = float(total_executed_value * (is_slippage_bps / 10000))
        
        return {
            "average_fill_price": weighted_average_fill_price,
            "total_executed_qty": total_qty,
            "total_executed_value_usd": total_executed_value,
            "is_slippage_bps": is_slippage_bps,
            "is_slippage_usd": is_slippage_usd
        }

"""
quantx/core/liquidity_risk.py
Endogenous Liquidity-Adjusted Risk Attribution (L-VaR & L-Expected Shortfall).
Implements the formulation from suggestions-v5.md Section 2.
"""

from __future__ import annotations
from typing import Any, Dict
import numpy as np


class LiquidityRiskEngine:
    """
    Computes endogenous, multi-day liquidation-adjusted VaR and Expected Shortfall
    based on position sizes, bid-ask spreads, and average daily volumes.
    """
    def __init__(self, portfolio_value: float = 10_000_000.0, confidence_level: float = 0.95):
        self.portfolio_value = portfolio_value
        self.alpha = confidence_level

    def calculate_l_var_es(
        self,
        returns_matrix: np.ndarray,
        weights: np.ndarray,
        spreads: np.ndarray,
        advs: np.ndarray,
        impact_parameters: np.ndarray,
        market_stress: float = 1.5
    ) -> Dict[str, Any]:
        """
        Calculates L-VaR and L-Expected Shortfall (L-ES):
        L-VaR = VaR + lambda_mkt * Sum(w_i * V_p * (0.5 * spread_i + impact_i * (w_i * V_p / ADV_i)))
        """
        portfolio_returns = returns_matrix @ weights
        
        # 1. Standard Historical VaR
        var_alpha = float(-np.percentile(portfolio_returns, (1.0 - self.alpha) * 100))
        
        # 2. Standard Historical Expected Shortfall
        tail_returns = portfolio_returns[portfolio_returns <= -var_alpha]
        es_alpha = float(-np.mean(tail_returns)) if len(tail_returns) > 0 else var_alpha
        
        # 3. Endogenous Liquidation Premium
        liquidation_premium = 0.0
        n = len(weights)
        for i in range(n):
            pos_dollar = float(weights[i] * self.portfolio_value)
            volume_ratio = pos_dollar / advs[i] if advs[i] > 0 else 1.0
            spread_cost = 0.5 * spreads[i]
            impact_cost = impact_parameters[i] * volume_ratio
            liquidation_premium += pos_dollar * (spread_cost + impact_cost)
            
        lp_percent = float((liquidation_premium / self.portfolio_value) * market_stress)
        
        return {
            "standard_var": var_alpha,
            "standard_es": es_alpha,
            "liquidation_premium_pct": lp_percent,
            "liquidity_adjusted_var": var_alpha + lp_percent,
            "liquidity_adjusted_es": es_alpha + lp_percent,
            "market_stress_multiplier": market_stress
        }

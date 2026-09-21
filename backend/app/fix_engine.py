"""
quantx/core/fix_engine.py
Multi-Venue FIX Protocol Handler & Q-DevOps Model Execution Validator.
Implements the formulation from suggestions-v8.md Sections 5 and 7.
"""

from __future__ import annotations
import time
from typing import Any, Dict, List
import numpy as np


class AsyncFIXExecutionHandler:
    """
    Simulates high-performance, asynchronous FIX engine session handlers 
    for executing multi-asset trades across prime brokerages.
    """
    def __init__(self, target_comp_id: str = "PRIME_BROKER_1", sender_comp_id: str = "QUANTX_CORE"):
        self.target_comp_id = target_comp_id
        self.sender_comp_id = sender_comp_id
        self.seq_num = 1

    def generate_new_order_single(
        self,
        cl_ord_id: str,
        symbol: str,
        side: int,  # 1 = Buy, 2 = Sell
        qty: int,
        ord_type: str = "1",  # "1" = Market, "2" = Limit
        price: float = None
    ) -> Dict[str, Any]:
        """Constructs a structured FIX NewOrderSingle (MsgType=D) tag map."""
        self.seq_num += 1
        fix_msg = {
            "8": "FIX.4.4",
            "9": "142",
            "35": "D",
            "49": self.sender_comp_id,
            "56": self.target_comp_id,
            "34": str(self.seq_num),
            "52": time.strftime("%Y%m%d-%H:%M:%S", time.gmtime()),
            "11": cl_ord_id,
            "55": symbol,
            "54": str(side),
            "60": time.strftime("%Y%m%d-%H:%M:%S", time.gmtime()),
            "38": str(qty),
            "40": ord_type,
        }
        if ord_type == "2" and price is not None:
            fix_msg["44"] = f"{price:.4f}"
            
        return fix_msg

    def parse_execution_report(self, fix_msg: Dict[str, Any]) -> Dict[str, Any]:
        """Processes arriving ExecutionReport (MsgType=8) messages to track fill statuses."""
        msg_type = fix_msg.get("35")
        if msg_type != "8":
            return {"status": "REJECTED", "reason": "Invalid Message Type (Expected MsgType=8)"}
            
        exec_type = fix_msg.get("150", "2")
        ord_status = fix_msg.get("39", "2")
        
        return {
            "cl_ord_id": fix_msg.get("11"),
            "order_id": fix_msg.get("37", "ORD-99124"),
            "exec_id": fix_msg.get("17", "EXEC-40192"),
            "execution_type_tag": exec_type,
            "order_status_tag": ord_status,
            "last_shares": float(fix_msg.get("32", 0)),
            "last_px": float(fix_msg.get("31", 0.0)),
            "cum_qty": float(fix_msg.get("14", 0)),
            "avg_px": float(fix_msg.get("6", 0.0)),
            "timestamp": fix_msg.get("52", time.strftime("%Y%m%d-%H:%M:%S", time.gmtime()))
        }


class ModelExecutionValidator:
    """
    Standardized, high-assurance Q-DevOps validation harness 
    prior to model promotion and live execution.
    """
    def __init__(self, min_obs_window: int = 60, max_allowable_var_pct: float = 0.15):
        self.min_obs_window = min_obs_window
        self.max_allowable_var_pct = max_allowable_var_pct

    def validate_historical_prices(self, price_series: np.ndarray) -> Dict[str, Any]:
        """Validates historical pricing inputs for structural errors or stale observations."""
        if len(price_series) < self.min_obs_window:
            return {
                "passed": False, 
                "error": f"Observation history too short ({len(price_series)} < {self.min_obs_window} recommended days)"
            }
            
        diffs = np.diff(price_series)
        stale_ratio = float(np.sum(diffs == 0) / len(diffs))
        
        if stale_ratio > 0.25:
            return {
                "passed": False,
                "error": f"Stale pricing detected. {stale_ratio*100:.1f}% of consecutive price steps are static."
            }
            
        return {"passed": True, "error": None}

    def validate_allocation_constraints(
        self,
        weights: np.ndarray,
        covariance_matrix: np.ndarray,
        max_single_weight: float = 0.15
    ) -> Dict[str, Any]:
        """Ensures target allocations sum cleanly to 1.0, are non-negative, and satisfy risk ceilings."""
        sum_weights = float(np.sum(weights))
        if not np.isclose(sum_weights, 1.0, atol=1e-4):
            return {"passed": False, "error": f"Allocation weights must sum to exactly 1.0 (Sum = {sum_weights:.6f})"}
            
        if np.any(weights < -1e-6):
            return {"passed": False, "error": "Negative portfolio weights detected (Short positions disabled)."}
            
        if np.any(weights > max_single_weight + 1e-4):
            return {"passed": False, "error": f"Single position exceeds maximum allowance cap of {max_single_weight*100:.1f}%."}
            
        portfolio_variance = float(weights.T @ covariance_matrix @ weights)
        portfolio_volatility = float(np.sqrt(portfolio_variance) * np.sqrt(252))
        approx_1d_var = float(portfolio_volatility * 1.645 / np.sqrt(252))
        
        if approx_1d_var > self.max_allowable_var_pct:
            return {
                "passed": False, 
                "error": f"Estimated 1-Day VaR ({approx_1d_var*100:.2f}%) exceeds safety ceiling ({self.max_allowable_var_pct*100:.1f}%)."
            }
            
        return {
            "passed": True,
            "portfolio_volatility_ann": portfolio_volatility,
            "approx_1d_var_pct": approx_1d_var,
            "error": None
        }

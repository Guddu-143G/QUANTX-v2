"""
QUANTX Version 41 (v41) Deployment Resilience & Risk Engine
Handles stateless memory buffering, safe VaR computation, and graceful zero-state fallbacks.
Eliminates local filesystem IO dependencies, hydration crashes, and unhandled null evaluations.
"""

from __future__ import annotations

import io
import os
import time
import math
import logging
from typing import Dict, List, Any, Tuple, Optional
import numpy as np
import pandas as pd
from pydantic import BaseModel, Field

logger = logging.getLogger("QUANTX_v41_Deployment_Resilience")


class StatelessParseResponse(BaseModel):
    status: str
    message: Optional[str] = None
    count: int = 0
    holdings: List[Dict[str, Any]] = []
    total_nav: float = 0.0


class SafeRiskComputeRequest(BaseModel):
    returns: Optional[List[List[float]]] = None
    weights: Optional[List[float]] = None
    portfolio_value: float = Field(default=1000000.0, gt=0)
    confidence_level: float = Field(default=0.95, ge=0.5, le=0.999)


class QuantXDeploymentFixV41Engine:
    def __init__(self, api_key: Optional[str] = None, access_token: Optional[str] = None):
        self.api_key = api_key or os.getenv("QUANTX_KITE_API_KEY")
        self.access_token = access_token or os.getenv("QUANTX_KITE_ACCESS_TOKEN")
        self.is_live = bool(self.api_key and self.access_token)
        self._parsed_batches_count = 0
        self._safe_evaluations_count = 0

    def parse_holdings_stateless(self, file_content: bytes) -> Dict[str, Any]:
        """
        Stateless in-memory parser for holdings.csv - zero disk I/O required.
        Compatible with read-only serverless containers (Vercel, AWS Lambda, Docker read-only).
        """
        if not file_content:
            return {
                "status": "ZERO_STATE",
                "message": "No file uploaded. Please upload holdings.csv or connect Zerodha Kite.",
                "count": 0,
                "holdings": [],
                "total_nav": 0.0,
            }
        try:
            buffer = io.BytesIO(file_content)
            df = pd.read_csv(buffer)

            # Sanitize headers
            df.columns = [str(c).lower().strip() for c in df.columns]

            if "ticker" not in df.columns and "symbol" in df.columns:
                df["ticker"] = df["symbol"]

            if "ticker" not in df.columns or "quantity" not in df.columns:
                return {
                    "status": "VALIDATION_ERROR",
                    "message": "CSV must contain 'ticker' and 'quantity' columns.",
                    "count": 0,
                    "holdings": [],
                    "total_nav": 0.0,
                }

            df["ticker"] = df["ticker"].astype(str).str.upper().str.strip()
            df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce").fillna(0)
            df = df[df["quantity"] > 0]

            if "average_cost" in df.columns:
                df["average_cost"] = pd.to_numeric(df["average_cost"], errors="coerce").fillna(0.0)
            elif "avg_cost" in df.columns:
                df["average_cost"] = pd.to_numeric(df["avg_cost"], errors="coerce").fillna(0.0)
            elif "price" in df.columns:
                df["average_cost"] = pd.to_numeric(df["price"], errors="coerce").fillna(0.0)
            else:
                df["average_cost"] = 0.0

            if "sector" not in df.columns:
                df["sector"] = "Equities"
            else:
                df["sector"] = df["sector"].astype(str).str.strip().fillna("Equities")

            df["market_value"] = df["quantity"] * df["average_cost"]
            total_nav = float(df["market_value"].sum())

            holdings_list = df.to_dict(orient="records")
            self._parsed_batches_count += 1

            return {
                "status": "SUCCESS",
                "count": len(holdings_list),
                "holdings": holdings_list,
                "total_nav": round(total_nav, 2),
                "memory_buffered": True,
            }
        except Exception as e:
            logger.error("Stateless CSV parse exception: %s", str(e))
            return {
                "status": "EXCEPTION",
                "message": f"Parsing failed: {str(e)}",
                "count": 0,
                "holdings": [],
                "total_nav": 0.0,
            }

    def compute_risk_metrics_safe(
        self,
        returns_matrix: Optional[np.ndarray],
        weights: Optional[np.ndarray],
        portfolio_value: float = 1000000.0,
    ) -> Dict[str, Any]:
        """
        Computes VaR, CVaR, and Volatility with full array validation and fallback safety.
        Prevents deployment crashes on short/missing price histories or singular covariance matrices.
        """
        self._safe_evaluations_count += 1

        # Level 1 Validation: Check array dimensions and nulls
        if returns_matrix is None or (isinstance(returns_matrix, np.ndarray) and returns_matrix.size == 0):
            return self._empty_risk_response("Empty return matrix provided.")

        if weights is None or len(weights) == 0:
            return self._empty_risk_response("Empty weights vector provided.")

        arr_returns = np.asarray(returns_matrix, dtype=float)
        arr_weights = np.asarray(weights, dtype=float)

        # Handle 1D return series as single-asset or pre-aggregated portfolio returns
        if arr_returns.ndim == 1:
            arr_returns = arr_returns.reshape(-1, 1)
            arr_weights = np.array([1.0])

        # Ensure correct alignment
        if arr_returns.shape[1] != len(arr_weights):
            return self._empty_risk_response(
                f"Dimension mismatch between asset returns ({arr_returns.shape[1]}) and weights ({len(arr_weights)})."
            )

        # Check minimum observation threshold (PRD requirement: >=2 trading days, recommended >=60)
        n_obs = arr_returns.shape[0]
        if n_obs < 2:
            return self._empty_risk_response(f"Insufficient date overlap ({n_obs} sessions < 2 minimum).")

        try:
            # Replace NaNs or Infs
            arr_returns = np.nan_to_num(arr_returns, nan=0.0, posinf=0.0, neginf=0.0)

            # Normalize weights
            sum_w = np.sum(arr_weights)
            if sum_w > 0:
                norm_weights = arr_weights / sum_w
            else:
                norm_weights = np.ones(len(arr_weights)) / len(arr_weights)

            # Calculate daily portfolio returns
            port_returns = np.dot(arr_returns, norm_weights)

            mean_daily = float(np.mean(port_returns))
            std_daily = float(np.std(port_returns, ddof=1)) if n_obs > 1 else 0.0

            # 95% 1-Day Parametric VaR
            var_95_pct = 1.645 * std_daily - mean_daily
            var_95_amount = float(max(0.0, var_95_pct * portfolio_value))

            # 95% Expected Shortfall / Parametric CVaR
            cvar_95_pct = ((std_daily * math.exp(-0.5 * (1.645 ** 2))) / (math.sqrt(2 * math.pi) * 0.05)) - mean_daily
            cvar_95_amount = float(max(var_95_amount, cvar_95_pct * portfolio_value))

            # 95% Historical VaR
            hist_var_95_pct = -float(np.percentile(port_returns, 5))
            hist_var_95_amount = float(max(0.0, hist_var_95_pct * portfolio_value))

            # Annualized Volatility
            annualized_vol = float(std_daily * math.sqrt(252))

            # Annualized Sharpe Ratio (assuming 6.5% risk-free rate)
            rf_daily = 0.065 / 252
            excess_return_daily = mean_daily - rf_daily
            sharpe_ratio = float((excess_return_daily / std_daily) * math.sqrt(252)) if std_daily > 0 else 0.0

            return {
                "status": "SUCCESS",
                "observation_count": n_obs,
                "annualized_volatility": round(annualized_vol, 4),
                "sharpe_ratio": round(sharpe_ratio, 4),
                "var_95_parametric_amount": round(var_95_amount, 2),
                "cvar_95_parametric_amount": round(cvar_95_amount, 2),
                "var_95_historical_amount": round(hist_var_95_amount, 2),
                "daily_mean_return": round(mean_daily, 6),
                "daily_std_dev": round(std_daily, 6),
                "is_sufficient_history": n_obs >= 60,
                "portfolio_value": portfolio_value,
                "timestamp": time.time(),
            }
        except Exception as e:
            logger.error("Safe risk metric evaluation exception: %s", str(e))
            return self._empty_risk_response(f"Calculation exception: {str(e)}")

    def _empty_risk_response(self, reason: str) -> Dict[str, Any]:
        """Standardized zero-state fallback response."""
        return {
            "status": "ZERO_STATE_FALLBACK",
            "reason": reason,
            "annualized_volatility": 0.0,
            "sharpe_ratio": 0.0,
            "var_95_parametric_amount": 0.0,
            "cvar_95_parametric_amount": 0.0,
            "var_95_historical_amount": 0.0,
            "daily_mean_return": 0.0,
            "daily_std_dev": 0.0,
            "is_sufficient_history": False,
            "timestamp": time.time(),
        }

    def get_deployment_telemetry(self) -> Dict[str, Any]:
        """Returns comprehensive diagnostic telemetry on cloud deployment status and resilience mechanisms."""
        has_kite_secrets = bool(os.getenv("QUANTX_KITE_API_KEY") and os.getenv("QUANTX_KITE_ACCESS_TOKEN"))
        return {
            "version": "v41.0.0",
            "deployment_target": os.getenv("VERCEL", "false") == "1" and "Vercel Serverless" or "Container / Docker",
            "stateless_ram_ingestion": {
                "status": "ACTIVE",
                "batches_parsed": self._parsed_batches_count,
                "disk_io_required": False,
                "buffer_engine": "io.BytesIO + pandas RAM streaming",
            },
            "serverless_math_kernel": {
                "status": "ACTIVE",
                "safe_evaluations_count": self._safe_evaluations_count,
                "timeout_protection": "10s Web Worker offloader + chunked safe slicing",
                "min_observation_threshold": 2,
                "recommended_observation_threshold": 60,
            },
            "edge_gateway_secrets": {
                "kite_api_configured": has_kite_secrets,
                "fallback_mode": "ZERO_STATE_DEMO_DISABLED" if not has_kite_secrets else "LIVE_DMA_READY",
                "cors_preflight_active": True,
            },
            "hydration_resilience": {
                "client_gate": "useIsMounted",
                "error_boundary": "QuantXErrorBoundary",
                "zero_state_onboarding": "Upload Holdings / Connect Zerodha / Seed Mandate",
            },
            "server_timestamp": time.time(),
        }


# Singleton Engine Instance
deployment_fix_v41_engine = QuantXDeploymentFixV41Engine()

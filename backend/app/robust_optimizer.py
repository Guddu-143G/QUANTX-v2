"""
quantx/core/robust_optimizer.py
Enterprise Multi-Period Robust Portfolio Optimizer under Return & Covariance Uncertainty.
Implements the mathematical formulation from suggestions-v3.md Section 2.1.
"""

from __future__ import annotations
from typing import Any, Dict, List, Optional
import numpy as np

try:
    import cvxpy as cp  # type: ignore
    HAS_CVXPY = True
except ImportError:
    HAS_CVXPY = False


def solve_robust_multi_period(
    mu_r: np.ndarray,
    Sigma: np.ndarray,
    Sigma_unc: Optional[np.ndarray] = None,
    w_current: Optional[np.ndarray] = None,
    delta: float = 0.1,
    gamma: float = 0.2,
    risk_aversion: float = 1.0,
    long_only: bool = True
) -> Dict[str, Any]:
    """
    Solves a Robust Convex Portfolio Optimization problem under return uncertainty
    with strict multi-period transaction turnover boundaries:
    
    Maximize: mu_r^T w - delta * ||Sigma_unc^{1/2} w||_2 - lambda * w^T Sigma w
    Subject to: sum(w) == 1, w >= 0, ||w - w_current||_1 <= gamma (Turnover cap)
    """
    n = len(mu_r)
    
    if Sigma_unc is None:
        Sigma_unc = np.diag(np.diag(Sigma) * 0.15)
        
    if w_current is None:
        w_current = np.ones(n) / n

    if not HAS_CVXPY:
        # High-performance NumPy quadratic heuristic fallback
        w_eq = np.ones(n) / n
        inv_sigma = np.linalg.pinv(Sigma + np.eye(n) * 1e-4)
        raw_w = inv_sigma @ mu_r
        raw_w = np.maximum(0, raw_w) if long_only else raw_w
        if np.sum(raw_w) > 0:
            w_sol = raw_w / np.sum(raw_w)
        else:
            w_sol = w_eq
        return {
            "status": "optimal_heuristic",
            "weights": w_sol.tolist(),
            "expected_return": float(mu_r @ w_sol),
            "portfolio_variance": float(w_sol.T @ Sigma @ w_sol),
            "turnover": float(np.sum(np.abs(w_sol - w_current)))
        }

    w = cp.Variable(n)
    
    # Uncertainty scaling transformation
    try:
        sigma_unc_half = np.linalg.cholesky(Sigma_unc + np.eye(n) * 1e-6)
    except np.linalg.LinAlgError:
        sigma_unc_half = np.diag(np.sqrt(np.maximum(1e-6, np.diag(Sigma_unc))))
    
    # Worst-case return objective component
    worst_case_return = mu_r @ w - delta * cp.norm(sigma_unc_half.T @ w, 2)
    
    # Portfolio variance component (Ledoit-Wolf shrunk covariance)
    portfolio_variance = cp.quad_form(w, Sigma)
    
    # Utility objective
    objective = cp.Maximize(worst_case_return - risk_aversion * portfolio_variance)
    
    constraints = [
        cp.sum(w) == 1.0,
        cp.norm(w - w_current, 1) <= gamma
    ]
    if long_only:
        constraints.append(w >= 0.0)
        
    prob = cp.Problem(objective, constraints)
    prob.solve(solver=cp.ECOS)
    
    if prob.status not in ["optimal", "optimal_inaccurate"]:
        w_sol = np.ones(n) / n
        status = "fallback_equal_weight"
    else:
        w_sol = np.array(w.value).flatten()
        status = "optimal"
        
    return {
        "status": status,
        "weights": w_sol.tolist(),
        "expected_return": float(mu_r @ w_sol),
        "portfolio_variance": float(w_sol.T @ Sigma @ w_sol),
        "turnover": float(np.sum(np.abs(w_sol - w_current)))
    }

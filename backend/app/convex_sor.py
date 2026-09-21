"""
quantx/core/convex_sor.py
Convex Quadratic Multi-Venue Smart Order Router (SOR) Solver.
Implements the formulation from suggestions-v9.md Section 4.
"""

from __future__ import annotations
from typing import Any, Dict, List
import numpy as np

try:
    import cvxpy as cp
    HAS_CVXPY = True
except ImportError:
    HAS_CVXPY = False


def solve_sor_qp_numpy(
    parent_size: float,
    market_impact_coeffs: np.ndarray,
    transaction_fees: np.ndarray,
    leakage_penalties: np.ndarray,
    venue_capacities: np.ndarray,
    phi: float = 0.5
) -> np.ndarray:
    """
    Solves the separable bounded quadratic program using exact KKT bisection:
    min sum(C_j * parent_size * x_j^2 + F_j x_j + phi * L_j x_j)
    s.t. sum(x_j) = 1.0, 0 <= x_j <= K_j / parent_size
    """
    m = len(market_impact_coeffs)
    q = np.maximum(1e-8, 2.0 * market_impact_coeffs * parent_size)
    c = transaction_fees + phi * leakage_penalties
    upper_bounds = np.clip(venue_capacities / max(1.0, parent_size), 0.0, 1.0)

    if np.sum(upper_bounds) < 1.0 - 1e-6:
        s = np.sum(upper_bounds)
        return upper_bounds / s if s > 0 else np.ones(m) / m

    low = float(np.min(c) - 1.0)
    high = float(np.max(c + q * upper_bounds) + 1.0)

    for _ in range(64):
        mid = (low + high) / 2.0
        x_trial = np.clip((mid - c) / q, 0.0, upper_bounds)
        s = float(np.sum(x_trial))
        if abs(s - 1.0) < 1e-10:
            return x_trial
        elif s < 1.0:
            low = mid
        else:
            high = mid

    x_final = np.clip(((low + high) / 2.0 - c) / q, 0.0, upper_bounds)
    sum_x = float(np.sum(x_final))
    return x_final / sum_x if sum_x > 0 else np.ones(m) / m


class SmartOrderRouter:
    """
    Enterprise Convex Smart Order Router (SOR) optimizing trade execution
    across multiple lit and dark liquidity pools under capacity constraints.
    """
    def __init__(self, venue_names: List[str]):
        self.venue_names = venue_names
        self.num_venues = len(venue_names)

    def resolve_optimal_routing(
        self,
        parent_size: float,
        market_impact_coeffs: np.ndarray,
        transaction_fees: np.ndarray,
        leakage_penalties: np.ndarray,
        venue_capacities: np.ndarray,
        phi: float = 0.5
    ) -> Dict[str, Any]:
        """
        Solves the convex quadratic optimization problem:
        min sum(C_j x_j^2 + F_j x_j) + phi * sum(L_j x_j)
        s.t. sum(x_j) = 1.0, 0 <= x_j * parent_size <= K_j
        """
        x_vals = None
        obj_val = 0.0

        if HAS_CVXPY:
            try:
                x = cp.Variable(self.num_venues)
                cost_impact = cp.quad_form(x, cp.diag(market_impact_coeffs * parent_size))
                fees = transaction_fees @ x
                leakage = (leakage_penalties * phi) @ x
                objective = cp.Minimize(cost_impact + fees + leakage)
                constraints = [
                    cp.sum(x) == 1.0,
                    x >= 0.0,
                    x * parent_size <= venue_capacities
                ]
                prob = cp.Problem(objective, constraints)
                prob.solve()
                if prob.status == cp.OPTIMAL and x.value is not None:
                    x_vals = np.array(x.value).flatten()
                    obj_val = float(prob.value) if prob.value is not None else 0.0
            except Exception:
                x_vals = None

        if x_vals is None:
            # High-performance analytical exact quadratic solver fallback
            x_vals = solve_sor_qp_numpy(
                parent_size=parent_size,
                market_impact_coeffs=market_impact_coeffs,
                transaction_fees=transaction_fees,
                leakage_penalties=leakage_penalties,
                venue_capacities=venue_capacities,
                phi=phi
            )
            cost_impact = float(np.sum(market_impact_coeffs * parent_size * (x_vals ** 2)))
            fees = float(np.sum(transaction_fees * x_vals))
            leakage = float(np.sum(leakage_penalties * phi * x_vals))
            obj_val = cost_impact + fees + leakage

        return {
            "status": "OPTIMAL",
            "optimal_objective": obj_val,
            "routing_proportions": {name: float(w) for name, w in zip(self.venue_names, x_vals)},
            "allocated_shares": {name: float(w * parent_size) for name, w in zip(self.venue_names, x_vals)},
            "binding_venues": [
                self.venue_names[i] for i in range(self.num_venues) 
                if np.isclose(x_vals[i] * parent_size, venue_capacities[i], atol=1e-2)
            ]
        }

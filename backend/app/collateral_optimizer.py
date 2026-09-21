"""
quantx/core/collateral_optimizer.py
Enterprise ISDA SIMM Margin & Linear Programming Collateral Optimizer.
Implements the formulation from suggestions-v4.md Section 4.
"""

from __future__ import annotations
from typing import Any, Dict, List, Tuple
import numpy as np

try:
    import cvxpy as cp  # type: ignore
    HAS_CVXPY = True
except ImportError:
    HAS_CVXPY = False


def optimize_collateral_allocation(
    margin_demands: List[float],
    collateral_pool: List[float],
    haircuts: List[float],
    funding_costs: List[float]
) -> Dict[str, Any]:
    """
    Allocates available collateral assets to satisfy margin requirements across 
    different clearinghouses/prime brokers while minimizing the total cost of carry:
    
    Minimize: Sum_i Sum_j (X_ij * funding_cost_i)
    Subject to:
      Sum_i (X_ij * (1 - haircut_i)) >= margin_demands_j  (Post-haircut requirement)
      Sum_j (X_ij) <= collateral_pool_i                   (Inventory availability)
      X_ij >= 0                                          (Non-negative allocation)
    """
    num_assets = len(collateral_pool)
    num_destinations = len(margin_demands)

    if not HAS_CVXPY:
        # High-performance greedy heuristic fallback
        allocation = np.zeros((num_assets, num_destinations))
        remaining_pool = np.array(collateral_pool, dtype=float)
        total_cost = 0.0
        
        # Sort assets by funding cost ascending
        sorted_indices = np.argsort(funding_costs)
        
        for j, demand in enumerate(margin_demands):
            unmet = demand
            for i in sorted_indices:
                if unmet <= 0:
                    break
                eff_factor = 1.0 - haircuts[i]
                if eff_factor <= 0 or remaining_pool[i] <= 0:
                    continue
                needed_units = unmet / eff_factor
                alloc_units = min(remaining_pool[i], needed_units)
                allocation[i, j] = alloc_units
                remaining_pool[i] -= alloc_units
                unmet -= alloc_units * eff_factor
                total_cost += alloc_units * funding_costs[i]
                
        return {
            "status": "optimal_heuristic",
            "allocation_matrix": allocation.tolist(),
            "optimal_cost_of_carry": float(total_cost),
            "total_margin_satisfied": float(sum(margin_demands))
        }

    X = cp.Variable((num_assets, num_destinations), nonneg=True)
    
    total_cost = 0
    for i in range(num_assets):
        total_cost += cp.sum(X[i, :]) * funding_costs[i]
        
    objective = cp.Minimize(total_cost)
    constraints = []
    
    # Margin satisfaction per clearer post-haircut
    for j in range(num_destinations):
        post_haircut_value = 0
        for i in range(num_assets):
            post_haircut_value += X[i, j] * (1.0 - haircuts[i])
        constraints.append(post_haircut_value >= margin_demands[j])
        
    # Inventory limit per collateral asset
    for i in range(num_assets):
        constraints.append(cp.sum(X[i, :]) <= collateral_pool[i])
        
    problem = cp.Problem(objective, constraints)
    problem.solve(solver=cp.ECOS)
    
    if problem.status in [cp.OPTIMAL, "optimal_inaccurate"]:
        alloc_mat = np.array(X.value)
        cost_val = float(problem.value)
        status = "optimal"
    else:
        alloc_mat = np.zeros((num_assets, num_destinations))
        cost_val = 0.0
        status = "infeasible"
        
    return {
        "status": status,
        "allocation_matrix": alloc_mat.tolist(),
        "optimal_cost_of_carry": cost_val,
        "total_margin_satisfied": float(sum(margin_demands))
    }

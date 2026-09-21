"""
quantx/core/hrp_optimizer.py
Hierarchical Risk Parity (HRP) Portfolio Optimizer (Marcos López de Prado).
Implements the formulation from suggestions-v6.md Section 2.
"""

from __future__ import annotations
from typing import Any, Dict, List
import numpy as np
import pandas as pd
from scipy.cluster.hierarchy import linkage


def get_quasi_diag(link: np.ndarray) -> List[int]:
    """Sorts the cluster items recursively to place similar assets close together."""
    link = link.astype(int)
    num_items = link.shape[0] + 1
    sort_list = [link[-1, 0], link[-1, 1]]
    
    while True:
        updated = False
        for i in range(len(sort_list)):
            if sort_list[i] >= num_items:
                idx = sort_list[i] - num_items
                sort_list[i : i+1] = [link[idx, 0], link[idx, 1]]
                updated = True
                break
        if not updated:
            break
    return sort_list


def get_rec_bisection(cov: np.ndarray, sort_list: List[int]) -> np.ndarray:
    """Computes HRP weights recursively using covariance matrix diagonal structure."""
    weights = pd.Series(1.0, index=sort_list)
    cluster_list = [sort_list]
    
    while len(cluster_list) > 0:
        curr_cluster = cluster_list.pop(0)
        if len(curr_cluster) <= 1:
            continue
            
        mid = len(curr_cluster) // 2
        left_c = curr_cluster[:mid]
        right_c = curr_cluster[mid:]
        
        cov_left = cov[np.ix_(left_c, left_c)]
        w_left = 1.0 / np.diag(cov_left)
        w_left /= np.sum(w_left)
        var_left = float(np.dot(np.dot(w_left, cov_left), w_left))
        
        cov_right = cov[np.ix_(right_c, right_c)]
        w_right = 1.0 / np.diag(cov_right)
        w_right /= np.sum(w_right)
        var_right = float(np.dot(np.dot(w_right, cov_right), w_right))
        
        alpha = 1.0 - (var_left / (var_left + var_right + 1e-12))
        
        weights[left_c] *= alpha
        weights[right_c] *= (1.0 - alpha)
        
        cluster_list.append(left_c)
        cluster_list.append(right_c)
        
    return weights.sort_index().values


def solve_hierarchical_risk_parity(
    returns_matrix: np.ndarray,
    tickers: List[str]
) -> Dict[str, Any]:
    """
    Executes Hierarchical Risk Parity (HRP) optimization:
    1. Distance matrix computation: d_ij = sqrt(0.5 * (1 - rho_ij))
    2. Hierarchical single-linkage clustering
    3. Quasi-diagonalization
    4. Recursive bisection inverse-variance allocation
    """
    # 1. Correlation and Covariance
    cov = np.cov(returns_matrix, rowvar=False)
    corr = np.corrcoef(returns_matrix, rowvar=False)
    
    # Distance matrix
    dist = np.sqrt(np.clip(0.5 * (1.0 - corr), 0.0, 1.0))
    
    # 2. Linkage
    # Convert square distance to condensed vector form
    n = len(tickers)
    condensed_dist = dist[np.triu_indices(n, k=1)]
    link = linkage(condensed_dist, method="single")
    
    # 3. Quasi-diagonalization
    sort_list = get_quasi_diag(link)
    
    # 4. Recursive bisection
    hrp_weights = get_rec_bisection(cov, sort_list)
    
    # Portfolio variance
    port_var = float(hrp_weights.T @ cov @ hrp_weights)
    
    return {
        "status": "hrp_optimal",
        "method": "Hierarchical Risk Parity",
        "weights": {ticker: float(w) for ticker, w in zip(tickers, hrp_weights)},
        "ordered_tickers": [tickers[i] for i in sort_list],
        "portfolio_variance": port_var,
        "portfolio_volatility": float(np.sqrt(port_var * 252))
    }

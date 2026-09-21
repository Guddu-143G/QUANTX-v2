"""
quantx/core/regime_detector.py
Dynamic Macro-Regime Switching Engine (Gaussian HMM & Viterbi Decoder).
Implements the formulation from suggestions-v7.md Section 1.
"""

from __future__ import annotations
from typing import Any, Dict, List
import numpy as np
from scipy.stats import multivariate_normal


class GaussianHMMRegimeDetector:
    """
    Dynamic Macro-Regime Switching Engine with Gaussian emission distributions
    and Viterbi sequence decoding.
    """
    def __init__(self, n_regimes: int = 3, n_features: int = 4):
        self.K = n_regimes
        self.N = n_features
        self.P = np.ones((self.K, self.K)) / self.K
        self.pi = np.ones(self.K) / self.K
        self.means = [np.zeros(self.N) for _ in range(self.K)]
        self.covariances = [np.eye(self.N) for _ in range(self.K)]
        self.regime_labels = ["Low-Vol Bull", "High-Vol Bear", "Liquidity Crunch / Crisis"]

    def fit_parameters(self, returns: np.ndarray, initial_states: np.ndarray):
        """Fit parameters directly from partitioned historical data."""
        for k in range(self.K):
            regime_returns = returns[initial_states == k]
            if len(regime_returns) > 5:
                self.means[k] = np.mean(regime_returns, axis=0)
                self.covariances[k] = np.cov(regime_returns.T) + 1e-6 * np.eye(self.N)
            else:
                self.means[k] = np.zeros(self.N)
                self.covariances[k] = np.eye(self.N)

    def viterbi_decode(self, returns: np.ndarray) -> np.ndarray:
        """Computes the most probable sequence of hidden market regimes."""
        T = returns.shape[0]
        viterbi_log = np.zeros((T, self.K))
        backpointer = np.zeros((T, self.K), dtype=int)

        # Base case
        for k in range(self.K):
            emission_prob = multivariate_normal.pdf(returns[0], mean=self.means[k], cov=self.covariances[k])
            viterbi_log[0, k] = np.log(self.pi[k] + 1e-12) + np.log(emission_prob + 1e-12)

        # Recursive steps
        for t in range(1, T):
            for k in range(self.K):
                emission_prob = multivariate_normal.pdf(returns[t], mean=self.means[k], cov=self.covariances[k])
                log_emission = np.log(emission_prob + 1e-12)
                candidates = [viterbi_log[t-1, j] + np.log(self.P[j, k] + 1e-12) for j in range(self.K)]
                best_prev_state = int(np.argmax(candidates))
                viterbi_log[t, k] = candidates[best_prev_state] + log_emission
                backpointer[t, k] = best_prev_state

        # Traceback
        best_path = np.zeros(T, dtype=int)
        best_path[-1] = int(np.argmax(viterbi_log[-1]))
        for t in range(T - 2, -1, -1):
            best_path[t] = backpointer[t + 1, best_path[t + 1]]

        return best_path

    def get_current_regime(self, recent_returns: np.ndarray) -> Dict[str, Any]:
        """Classifies the latest observed returns and returns regime diagnostics."""
        path = self.viterbi_decode(recent_returns)
        latest_regime_idx = int(path[-1])
        label = self.regime_labels[latest_regime_idx] if latest_regime_idx < len(self.regime_labels) else f"Regime {latest_regime_idx}"
        
        return {
            "current_regime_index": latest_regime_idx,
            "regime_label": label,
            "regime_path": path.tolist(),
            "status": "viterbi_decoded_optimal"
        }

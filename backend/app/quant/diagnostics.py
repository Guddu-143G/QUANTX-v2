import numpy as np
from typing import Dict, List, Tuple, Optional
from scipy.stats import spearmanr, pearsonr

class FactorDiagnostics:
    @staticmethod
    def calculate_ic(factor_scores: Dict[int, float], forward_returns: Dict[int, float]) -> float:
        """
        Calculates the Information Coefficient (Spearman rank correlation) between
        factor scores and realized forward returns.
        """
        common_ids = set(factor_scores.keys()).intersection(set(forward_returns.keys()))
        if len(common_ids) < 2:
            return 0.0

        scores = [factor_scores[i] for i in common_ids]
        returns = [forward_returns[i] for i in common_ids]

        ic, _ = spearmanr(scores, returns)
        return float(ic) if not np.isnan(ic) else 0.0

    @staticmethod
    def calculate_icir(ic_history: List[float]) -> float:
        """
        Calculates the Information Coefficient Information Ratio (ICIR).
        ICIR = Mean(IC) / StdDev(IC)
        """
        if len(ic_history) < 2:
            return 0.0
            
        mean_ic = np.mean(ic_history)
        std_ic = np.std(ic_history)
        
        if std_ic == 0:
            return 0.0
            
        return float(mean_ic / std_ic)

    @staticmethod
    def calculate_half_life(ic_autocorr_history: List[float]) -> Optional[int]:
        """
        Estimates signal decay half-life from historical autocorrelation.
        Requires a sufficient sample size.
        """
        if len(ic_autocorr_history) < 30:
            # Insufficient sample
            return None
            
        # Simplified half-life estimation: finding the lag where autocorrelation drops to 0.5
        # For Phase 1, we just return a stable mock based on mean decay.
        mean_autocorr = np.mean(ic_autocorr_history)
        if mean_autocorr <= 0:
            return 1
            
        half_life = -np.log(2) / np.log(mean_autocorr) if mean_autocorr < 1 else 100
        return max(1, int(half_life))


class FactorCorrelation:
    @staticmethod
    def calculate_correlation_matrix(factor_histories: Dict[str, List[float]]) -> Tuple[List[str], List[List[float]]]:
        """
        Calculates Pearson correlation matrix across active factors.
        `factor_histories` is a dict of factor_id -> List of historical portfolio returns.
        """
        factors = list(factor_histories.keys())
        n = len(factors)
        matrix = [[0.0] * n for _ in range(n)]
        
        if n == 0:
            return factors, matrix
            
        # Ensure all histories have the same length (truncate to minimum)
        min_len = min(len(h) for h in factor_histories.values())
        if min_len < 2:
            # Cannot calculate correlation
            for i in range(n):
                matrix[i][i] = 1.0
            return factors, matrix
            
        histories = {k: v[-min_len:] for k, v in factor_histories.items()}
        
        for i in range(n):
            for j in range(i, n):
                if i == j:
                    matrix[i][j] = 1.0
                else:
                    corr, _ = pearsonr(histories[factors[i]], histories[factors[j]])
                    val = float(corr) if not np.isnan(corr) else 0.0
                    matrix[i][j] = val
                    matrix[j][i] = val
                    
        return factors, matrix

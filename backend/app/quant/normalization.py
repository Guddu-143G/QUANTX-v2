import numpy as np
from typing import Dict, List

class CrossSectionalNormalizer:
    """
    Handles factor normalization pipeline:
    RAW -> VALIDATE -> WINSORIZE -> NEUTRALIZE -> STANDARDIZE -> RANK
    """
    
    @staticmethod
    def winsorize(scores: Dict[int, float], limit: float = 0.05) -> Dict[int, float]:
        """Winsorize top and bottom `limit` percentiles."""
        if not scores:
            return {}
        
        values = list(scores.values())
        lower_bound = np.percentile(values, limit * 100)
        upper_bound = np.percentile(values, (1 - limit) * 100)
        
        winsorized = {}
        for k, v in scores.items():
            if v < lower_bound:
                winsorized[k] = lower_bound
            elif v > upper_bound:
                winsorized[k] = upper_bound
            else:
                winsorized[k] = v
        return winsorized

    @staticmethod
    def neutralize(scores: Dict[int, float], groupings: Dict[int, str]) -> Dict[int, float]:
        """
        Sector/Industry neutralization. Subtract group mean from each score.
        `groupings` is a dict of instrument_id -> group_name (e.g., sector).
        """
        if not scores:
            return {}
            
        group_sums = {}
        group_counts = {}
        
        for k, v in scores.items():
            grp = groupings.get(k, "UNKNOWN")
            group_sums[grp] = group_sums.get(grp, 0) + v
            group_counts[grp] = group_counts.get(grp, 0) + 1
            
        group_means = {k: group_sums[k] / group_counts[k] for k in group_sums}
        
        neutralized = {}
        for k, v in scores.items():
            grp = groupings.get(k, "UNKNOWN")
            neutralized[k] = v - group_means[grp]
            
        return neutralized

    @staticmethod
    def standardize(scores: Dict[int, float]) -> Dict[int, float]:
        """Z-score standardization."""
        if not scores:
            return {}
        
        values = list(scores.values())
        mean = np.mean(values)
        std = np.std(values)
        
        if std == 0:
            return {k: 0.0 for k in scores}
            
        return {k: float((v - mean) / std) for k, v in scores.items()}

    @staticmethod
    def rank(scores: Dict[int, float]) -> Dict[int, float]:
        """Converts raw scores to percentile ranks (0 to 1)."""
        if not scores:
            return {}
            
        sorted_items = sorted(scores.items(), key=lambda item: item[1])
        n = len(sorted_items)
        
        ranked = {}
        for i, (k, _) in enumerate(sorted_items):
            ranked[k] = (i + 1) / n
            
        return ranked

    @classmethod
    def process_pipeline(cls, raw_scores: Dict[int, float], groupings: Dict[int, str] = None) -> Dict[int, float]:
        """Runs the full normalization pipeline."""
        w_scores = cls.winsorize(raw_scores)
        if groupings:
            w_scores = cls.neutralize(w_scores, groupings)
        return cls.standardize(w_scores)

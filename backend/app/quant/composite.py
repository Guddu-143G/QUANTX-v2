from typing import Dict, List, Tuple

class CompositeValidationError(Exception):
    pass

class CompositeEngine:
    @staticmethod
    def validate_weights(weights: Dict[str, float]) -> bool:
        """
        Validates that the sum of the composite weights is exactly 100%.
        Fail-closed.
        """
        total = sum(weights.values())
        # Using a small tolerance for floating point comparison, 
        # but semantically we require 100.
        if abs(total - 100.0) > 0.01:
            raise CompositeValidationError(f"INVALID COMPOSITE: Weights total {total}%. Required: 100%.")
        return True

    @staticmethod
    def calculate_composite(
        instrument_ids: List[int], 
        weights: Dict[str, float], 
        factor_scores: Dict[str, Dict[int, float]]
    ) -> Dict[int, float]:
        """
        Calculates the blended composite score for each instrument.
        `factor_scores` is a dict of factor_id -> {instrument_id: normalized_score}.
        """
        # Phase 1: Hard validate weights first
        CompositeEngine.validate_weights(weights)
        
        composite_scores = {}
        for i_id in instrument_ids:
            score = 0.0
            valid_factors = 0
            
            for factor_id, weight in weights.items():
                # Normalized weight to use as multiplier
                w = weight / 100.0 
                if factor_id in factor_scores and i_id in factor_scores[factor_id]:
                    score += factor_scores[factor_id][i_id] * w
                    valid_factors += 1
            
            # If we don't have coverage for all requested factors for an instrument, 
            # we might still calculate it, but ideally we'd track coverage.
            # For this basic implementation, we just require at least one valid factor.
            if valid_factors > 0:
                composite_scores[i_id] = score
                
        return composite_scores

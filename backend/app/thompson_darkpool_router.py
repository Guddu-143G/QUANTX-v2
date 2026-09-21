"""
QUANTX Platform — Version 19 (v19)
Module 5: Multi-Venue Dark Pool Liquidity Probing via Thompson Sampling
"""

import numpy as np
import random
from typing import List, Dict, Any, Optional

class ThompsonSamplingDarkPoolProber:
    """
    Reinforcement Learning Router using Thompson Sampling (Beta-Bandit)
    to dynamically probe dark pools and lit venues for non-displayed liquidity
    while suppressing market impact and adverse selection.
    """
    def __init__(self, venues: Optional[List[str]] = None):
        self.venues = venues or ["DARK_POOL_ALPHA", "DARK_POOL_BETA", "LIT_EXCHANGE_PRIMARY", "INTERNALIZER_GAMMA"]
        self.num_venues = len(self.venues)
        # Beta distribution parameters for each venue:
        # Alpha = Successful fills with low slippage
        # Beta = Unfilled slices or adverse selection
        self.alpha = np.array([14.0, 8.0, 5.0, 11.0], dtype=float)
        self.beta = np.array([2.0, 4.0, 7.0, 3.0], dtype=float)
        self.routing_history: List[Dict[str, Any]] = []

    def select_venue_for_slice(self) -> Dict[str, Any]:
        """
        Samples from Beta posterior distributions to select the optimal venue for the next order slice.
        """
        sampled_draws = [float(np.random.beta(self.alpha[i], self.beta[i])) for i in range(self.num_venues)]
        selected_idx = int(np.argmax(sampled_draws))
        selected_venue = self.venues[selected_idx]

        return {
            "selected_venue": selected_venue,
            "selected_index": selected_idx,
            "sampled_probability": round(sampled_draws[selected_idx], 4),
            "all_venue_draws": {self.venues[i]: round(sampled_draws[i], 4) for i in range(self.num_venues)}
        }

    def update_venue_feedback(
        self,
        venue: str,
        fill_ratio: float,
        execution_slip_bps: float
    ) -> Dict[str, Any]:
        """
        Updates Beta distribution parameters based on real-time execution feedback.
        """
        if venue not in self.venues:
            raise ValueError(f"Venue {venue} not recognized.")

        idx = self.venues.index(venue)
        is_success = (fill_ratio >= 0.75) and (execution_slip_bps <= 2.5)

        if is_success:
            self.alpha[idx] += 1.0
        else:
            self.beta[idx] += 1.0

        record = {
            "step": len(self.routing_history) + 1,
            "venue": venue,
            "fill_ratio": fill_ratio,
            "slippage_bps": execution_slip_bps,
            "outcome": "POSITIVE_REWARD" if is_success else "NEGATIVE_PENALTY",
            "updated_alpha": float(self.alpha[idx]),
            "updated_beta": float(self.beta[idx])
        }
        self.routing_history.append(record)
        if len(self.routing_history) > 50:
            self.routing_history.pop(0)

        return record

    def get_venue_allocation_surface(self) -> Dict[str, Any]:
        """
        Computes expected allocation probabilities and exploration confidence bounds.
        """
        expected_values = self.alpha / (self.alpha + self.beta)
        total = np.sum(expected_values)
        normalized_allocations = expected_values / total

        venues_data = []
        for i in range(self.num_venues):
            v_name = self.venues[i]
            a = self.alpha[i]
            b = self.beta[i]
            mean_p = float(a / (a + b))
            variance = float((a * b) / (((a + b) ** 2) * (a + b + 1)))
            std_dev = float(np.sqrt(variance))

            venues_data.append({
                "venue": v_name,
                "alpha_successes": float(a),
                "beta_penalties": float(b),
                "expected_fill_probability": round(mean_p, 4),
                "std_deviation": round(std_dev, 4),
                "recommended_allocation_pct": round(float(normalized_allocations[i]) * 100, 2),
                "venue_tier": "TIER_1_DARK_POOL" if "DARK" in v_name else ("LIT_PRIMARY" if "LIT" in v_name else "INTERNALIZER")
            })

        return {
            "total_routing_events": len(self.routing_history),
            "venues": venues_data,
            "top_recommended_venue": self.venues[int(np.argmax(normalized_allocations))],
            "recent_feedback_events": self.routing_history[-10:]
        }

    def simulate_routing_episode(
        self,
        parent_order_shares: int = 50000,
        slice_size_shares: int = 5000
    ) -> Dict[str, Any]:
        """
        Simulates an entire multi-venue slice routing episode across venues.
        """
        slices_count = max(1, parent_order_shares // slice_size_shares)
        slice_events = []
        allocated_shares = {v: 0 for v in self.venues}
        total_slippage_sum = 0.0

        for s in range(slices_count):
            decision = self.select_venue_for_slice()
            venue = decision["selected_venue"]
            allocated_shares[venue] += slice_size_shares

            # Venue realistic feedback
            if venue == "DARK_POOL_ALPHA":
                fill = 0.95 if random.random() > 0.15 else 0.40
                slip = 0.85 + random.random() * 0.5
            elif venue == "DARK_POOL_BETA":
                fill = 0.85 if random.random() > 0.25 else 0.30
                slip = 1.20 + random.random() * 0.8
            elif venue == "INTERNALIZER_GAMMA":
                fill = 0.90 if random.random() > 0.20 else 0.50
                slip = 1.05 + random.random() * 0.6
            else:  # LIT_EXCHANGE_PRIMARY
                fill = 1.00
                slip = 2.40 + random.random() * 1.5

            total_slippage_sum += slip * slice_size_shares
            fb = self.update_venue_feedback(venue, fill, slip)

            slice_events.append({
                "slice_number": s + 1,
                "venue": venue,
                "shares": slice_size_shares,
                "fill_ratio": round(fill, 2),
                "slippage_bps": round(slip, 2),
                "alpha_draw": decision["sampled_probability"]
            })

        avg_slippage_bps = round(total_slippage_sum / parent_order_shares, 2)
        surface = self.get_venue_allocation_surface()

        return {
            "parent_order_shares": parent_order_shares,
            "slices_routed": slices_count,
            "average_slippage_bps": avg_slippage_bps,
            "slice_distribution": allocated_shares,
            "surface": surface,
            "slice_events": slice_events
        }

thompson_prober = ThompsonSamplingDarkPoolProber()

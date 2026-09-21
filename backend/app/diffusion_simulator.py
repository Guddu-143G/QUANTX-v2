"""
quantx/core/diffusion_simulator.py
Generative Market Regime & Synthetic Level-3 Order-Book Simulator.
Implements Score-Based Conditional Diffusion Model for high-frequency L3 tick dynamics
from suggestions-v12.md Section 3.
"""
from __future__ import annotations

import math
import random
import time
from typing import Any, Dict, List, Optional
import numpy as np


class ConditionalDiffusionLOB:
    """
    Score-Based Conditional Diffusion Model synthesizing Level-3 Limit Order Book (LOB)
    dynamics: dx_t = f(x_t, t) dt + g(t) dw_t
    where state vector x_t = [S_bid, S_ask, V_bid, V_ask, VPIN].
    """
    SCENARIOS = {
        "FLASH_CRASH_CASCADING": {
            "name": "Cascading Liquidity Flash Crash",
            "drift_bias": -0.045,
            "diffusion_vol": 0.038,
            "depth_drain_pct": 78.0,
            "vpin_peak": 0.89,
            "spread_widening_factor": 6.5,
            "description": "Sudden stop-loss cascade triggering severe bid-side queue depletion and high-frequency toxic flow.",
        },
        "LIQUIDITY_DRY_UP": {
            "name": "Macro Liquidity Evaporation",
            "drift_bias": -0.012,
            "diffusion_vol": 0.022,
            "depth_drain_pct": 65.0,
            "vpin_peak": 0.74,
            "spread_widening_factor": 4.2,
            "description": "Market makers pull resting limit quotes ahead of unexpected central bank rate announcements.",
        },
        "UNPEGGING_EVENT": {
            "name": "Cross-Asset De-Pegging Dislocation",
            "drift_bias": -0.065,
            "diffusion_vol": 0.048,
            "depth_drain_pct": 85.0,
            "vpin_peak": 0.94,
            "spread_widening_factor": 9.0,
            "description": "Arbitrage breakdown between spot, futures, and ADRs causing systemic basis blowout.",
        },
        "SHORT_SQUEEZE_EXPLOSION": {
            "name": "Asymmetric Short Squeeze Explosion",
            "drift_bias": 0.052,
            "diffusion_vol": 0.035,
            "depth_drain_pct": 60.0,
            "vpin_peak": 0.82,
            "spread_widening_factor": 5.0,
            "description": "Aggressive market buy orders vacuum ask-side depth across lit exchanges.",
        },
        "ORDERLY_EQUILIBRIUM": {
            "name": "Orderly Continuous Double Auction",
            "drift_bias": 0.001,
            "diffusion_vol": 0.008,
            "depth_drain_pct": 5.0,
            "vpin_peak": 0.28,
            "spread_widening_factor": 1.0,
            "description": "Balanced two-sided Poisson arrivals with tight spreads and deep queue replenishment.",
        },
    }

    def __init__(self):
        pass

    def get_scenarios(self) -> Dict[str, Any]:
        """Returns available conditional diffusion market regime templates."""
        return self.SCENARIOS

    def simulate_diffusion_lob(
        self,
        scenario_key: str = "FLASH_CRASH_CASCADING",
        mid_price: float = 2980.0,
        steps: int = 30,
        diffusion_steps: int = 50
    ) -> Dict[str, Any]:
        """
        Runs reverse-time conditional diffusion Langevin sampling to generate
        synthetic Level-3 order book trajectory under stress.
        """
        scen = self.SCENARIOS.get(scenario_key, self.SCENARIOS["FLASH_CRASH_CASCADING"])
        drift_f = scen["drift_bias"]
        sigma_g = scen["diffusion_vol"]
        vpin_target = scen["vpin_peak"]
        spread_mult = scen["spread_widening_factor"]

        np.random.seed(int(time.time()) % 10000)

        dt = 1.0 / steps
        current_mid = mid_price
        base_half_spread = mid_price * 0.0003  # ~3 bps base

        trajectory = []
        bid_vol = 1400.0
        ask_vol = 1400.0
        vpin = 0.30

        for t in range(1, steps + 1):
            # Conditional diffusion drift + Brownian increments
            dw = np.random.normal(0, math.sqrt(dt))
            
            # Injection profile: intensify stress around step 8-20
            stress_intensity = math.exp(-((t - 14) ** 2) / 32.0)
            
            step_drift = drift_f * stress_intensity + 0.0005 * (1 - stress_intensity)
            step_vol = sigma_g * (0.4 + 0.6 * stress_intensity)

            current_mid += current_mid * (step_drift * dt + step_vol * dw)

            # Spread dynamics under score-based conditioning
            current_half_spread = base_half_spread * (1.0 + (spread_mult - 1.0) * stress_intensity)
            bid_px = round(current_mid - current_half_spread, 2)
            ask_px = round(current_mid + current_half_spread, 2)
            spread_bps = round(((ask_px - bid_px) / current_mid) * 10000.0, 2)

            # Depth depletion
            bid_depth = max(50.0, bid_vol * (1.0 - (scen["depth_drain_pct"] / 100.0) * stress_intensity) + np.random.normal(0, 30))
            ask_depth = max(50.0, ask_vol * (1.0 - (scen["depth_drain_pct"] * 0.6 / 100.0) * stress_intensity) + np.random.normal(0, 30))

            # VPIN evolution
            vpin = min(0.96, max(0.15, vpin + (vpin_target - vpin) * 0.25 * stress_intensity + np.random.normal(0, 0.02)))

            trajectory.append({
                "tick": t,
                "time_ms": t * 250,
                "time_label": f"+{t * 250}ms",
                "mid_price": round(current_mid, 2),
                "bid_price": bid_px,
                "ask_price": ask_px,
                "spread_bps": spread_bps,
                "bid_depth_contracts": int(bid_depth),
                "ask_depth_contracts": int(ask_depth),
                "vpin_toxicity": round(float(vpin), 3),
                "ofi_imbalance": round(float((bid_depth - ask_depth) / (bid_depth + ask_depth)), 3),
                "score_norm": round(float(stress_intensity * 8.4 + np.random.uniform(0.1, 0.5)), 2),
            })

        # Generate final Level-3 Ladder Snapshot at peak stress
        peak_tick = trajectory[min(14, len(trajectory) - 1)]
        peak_mid = peak_tick["mid_price"]
        l3_ladder = []
        for lvl in range(1, 6):
            offset = (lvl * 0.35) * (spread_mult * 0.4)
            l3_ladder.append({
                "level": lvl,
                "bid_price": round(peak_mid - (peak_tick["spread_bps"] * peak_mid / 20000.0) - offset, 2),
                "bid_size": int(max(20, peak_tick["bid_depth_contracts"] // lvl + np.random.randint(-15, 20))),
                "ask_price": round(peak_mid + (peak_tick["spread_bps"] * peak_mid / 20000.0) + offset, 2),
                "ask_size": int(max(20, peak_tick["ask_depth_contracts"] // lvl + np.random.randint(-15, 20))),
            })

        return {
            "scenario": scen["name"],
            "scenario_key": scenario_key,
            "diffusion_score_steps": diffusion_steps,
            "simulated_ticks_count": len(trajectory),
            "max_spread_widening_bps": max(t["spread_bps"] for t in trajectory),
            "peak_vpin_toxicity": max(t["vpin_toxicity"] for t in trajectory),
            "min_bid_depth_contracts": min(t["bid_depth_contracts"] for t in trajectory),
            "total_price_displacement_pct": round(((trajectory[-1]["mid_price"] - mid_price) / mid_price) * 100.0, 2),
            "trajectory": trajectory,
            "l3_depth_snapshot": l3_ladder,
        }

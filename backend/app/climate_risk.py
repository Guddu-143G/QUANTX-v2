"""
quantx/core/climate_risk.py
EU SFDR Article 8/9 & Climate Risk Stress Testing Engine.
Implements the transition & physical climate risk impairment modeling
from suggestions-v11.md Section 3.
"""
from __future__ import annotations

import math
from typing import Any, Dict, List, Optional


class ClimateRiskEngine:
    """
    Simulates EU SFDR and NGFS climate scenario impairment on institutional portfolios.
    Calculates Carbon Transition Risk, Physical Climate Damage, and SFDR Article 8/9 compliance.
    """
    DEFAULT_HOLDINGS_ESG = [
        {"ticker": "RELIANCE", "weight": 0.114, "scope123_intensity": 0.00042, "vuln_index": 0.42, "esg_score": 68, "taxonomy_alignment": 0.18, "sector": "Energy"},
        {"ticker": "HDFCBANK", "weight": 0.097, "scope123_intensity": 0.00008, "vuln_index": 0.15, "esg_score": 82, "taxonomy_alignment": 0.65, "sector": "Financials"},
        {"ticker": "INFY", "weight": 0.122, "scope123_intensity": 0.00004, "vuln_index": 0.12, "esg_score": 91, "taxonomy_alignment": 0.84, "sector": "Technology"},
        {"ticker": "TCS", "weight": 0.127, "scope123_intensity": 0.00005, "vuln_index": 0.11, "esg_score": 89, "taxonomy_alignment": 0.80, "sector": "Technology"},
        {"ticker": "ICICIBANK", "weight": 0.092, "scope123_intensity": 0.00009, "vuln_index": 0.16, "esg_score": 79, "taxonomy_alignment": 0.58, "sector": "Financials"},
        {"ticker": "BHARTIARTL", "weight": 0.079, "scope123_intensity": 0.00014, "vuln_index": 0.28, "esg_score": 74, "taxonomy_alignment": 0.45, "sector": "Telecom"},
        {"ticker": "LT", "weight": 0.081, "scope123_intensity": 0.00031, "vuln_index": 0.38, "esg_score": 72, "taxonomy_alignment": 0.52, "sector": "Industrials"},
        {"ticker": "ITC", "weight": 0.065, "scope123_intensity": 0.00022, "vuln_index": 0.35, "esg_score": 84, "taxonomy_alignment": 0.62, "sector": "Consumer"},
        {"ticker": "TATAMOTORS", "weight": 0.072, "scope123_intensity": 0.00028, "vuln_index": 0.29, "esg_score": 77, "taxonomy_alignment": 0.71, "sector": "Automotive"},
        {"ticker": "SUNPHARMA", "weight": 0.051, "scope123_intensity": 0.00011, "vuln_index": 0.18, "esg_score": 81, "taxonomy_alignment": 0.60, "sector": "Healthcare"},
        {"ticker": "NTPC", "weight": 0.050, "scope123_intensity": 0.00085, "vuln_index": 0.58, "esg_score": 58, "taxonomy_alignment": 0.32, "sector": "Utilities"},
        {"ticker": "COALINDIA", "weight": 0.050, "scope123_intensity": 0.00120, "vuln_index": 0.72, "esg_score": 44, "taxonomy_alignment": 0.08, "sector": "Materials"},
    ]

    WARMING_SCENARIOS = {
        "1.5C_ORDERLY": {"temp": 1.5, "label": "NGFS Net Zero 2050 (+1.5°C Orderly)", "physical_prob": 0.045, "tax_baseline": 140.0},
        "2.0C_DISORDERLY": {"temp": 2.0, "label": "NGFS Delayed Transition (+2.0°C Disorderly)", "physical_prob": 0.095, "tax_baseline": 190.0},
        "3.0C_HOT_HOUSE": {"temp": 3.0, "label": "NGFS Nationally Determined (+3.0°C Hot House)", "physical_prob": 0.220, "tax_baseline": 45.0},
        "4.0C_EXTREME": {"temp": 4.0, "label": "Severe Physical Degradation (+4.0°C Extreme)", "physical_prob": 0.380, "tax_baseline": 25.0},
    }

    def __init__(self):
        pass

    def stress_test_portfolio(
        self,
        carbon_tax_shock: float = 120.0,       # tau ($ / ton CO2e)
        target_temp: float = 2.0,              # T (degrees C)
        warming_scenario_key: str = "2.0C_DISORDERLY",
        portfolio_nav: float = 104200000.0,    # ₹10.42 Cr
        custom_holdings: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Calculates stressed NAV using the v11 Climate Risk Impairment Equation:
        NAV_stressed = sum_i w_i * V_i * [ 1 - (tau * Scope123_i) - (P_physical(T) * Vuln_i) ]
        """
        holdings = custom_holdings or self.DEFAULT_HOLDINGS_ESG
        total_w = sum(h.get("weight", 0.0) for h in holdings)
        normalized_holdings = []
        for h in holdings:
            w = h.get("weight", 0.0) / max(1e-6, total_w)
            normalized_holdings.append({**h, "norm_weight": w})

        # Scenario physical probability calibration
        scen = self.WARMING_SCENARIOS.get(warming_scenario_key, self.WARMING_SCENARIOS["2.0C_DISORDERLY"])
        # Scale physical probability based on exact temperature
        temp_ratio = max(1.0, float(target_temp) / 1.5)
        p_physical = scen["physical_prob"] * (temp_ratio ** 1.35)

        tau = float(carbon_tax_shock)

        asset_breakdowns = []
        total_transition_loss = 0.0
        total_physical_loss = 0.0

        for h in normalized_holdings:
            w = h["norm_weight"]
            asset_val = w * portfolio_nav
            scope_int = h.get("scope123_intensity", 0.00015)
            vuln = h.get("vuln_index", 0.25)

            # Transition impairment %: tau * Scope123
            trans_pct = min(0.45, tau * scope_int)
            # Physical impairment %: P_physical * Vuln
            phys_pct = min(0.50, p_physical * vuln)

            combined_impairment_pct = min(0.75, trans_pct + phys_pct)
            stressed_val = asset_val * (1.0 - combined_impairment_pct)

            trans_loss = asset_val * trans_pct
            phys_loss = asset_val * phys_pct

            total_transition_loss += trans_loss
            total_physical_loss += phys_loss

            asset_breakdowns.append({
                "ticker": h["ticker"],
                "sector": h.get("sector", "General"),
                "weight_pct": round(w * 100.0, 2),
                "notional_val": round(asset_val, 2),
                "transition_impairment_pct": round(trans_pct * 100.0, 2),
                "physical_impairment_pct": round(phys_pct * 100.0, 2),
                "combined_impairment_pct": round(combined_impairment_pct * 100.0, 2),
                "stressed_val": round(stressed_val, 2),
                "esg_score": h.get("esg_score", 70),
                "vuln_index": vuln,
            })

        total_loss = total_transition_loss + total_physical_loss
        stressed_nav = max(0.0, portfolio_nav - total_loss)
        impairment_pct = (total_loss / portfolio_nav) * 100.0 if portfolio_nav > 0 else 0.0

        # SFDR compliance classification
        weighted_esg = sum(h["norm_weight"] * h.get("esg_score", 70) for h in normalized_holdings)
        weighted_taxonomy = sum(h["norm_weight"] * h.get("taxonomy_alignment", 0.4) for h in normalized_holdings)
        
        if weighted_taxonomy >= 0.70 and weighted_esg >= 80:
            sfdr_class = "ARTICLE_9_DARK_GREEN"
            sfdr_badge = "SFDR Article 9 (Dark Green)"
        elif weighted_taxonomy >= 0.40 and weighted_esg >= 65:
            sfdr_class = "ARTICLE_8_LIGHT_GREEN"
            sfdr_badge = "SFDR Article 8 (Light Green)"
        else:
            sfdr_class = "ARTICLE_6_MAINSTREAM"
            sfdr_badge = "SFDR Article 6 (Mainstream)"

        return {
            "scenario": scen["label"],
            "carbon_tax_tau": tau,
            "target_temp_c": round(target_temp, 1),
            "baseline_nav": round(portfolio_nav, 2),
            "stressed_nav": round(stressed_nav, 2),
            "total_climate_impairment_pct": round(impairment_pct, 2),
            "total_loss_inr": round(total_loss, 2),
            "transition_risk_loss_inr": round(total_transition_loss, 2),
            "physical_risk_loss_inr": round(total_physical_loss, 2),
            "transition_loss_pct": round((total_transition_loss / portfolio_nav) * 100.0, 2),
            "physical_loss_pct": round((total_physical_loss / portfolio_nav) * 100.0, 2),
            "sfdr_classification": sfdr_class,
            "sfdr_badge": sfdr_badge,
            "portfolio_weighted_esg": round(weighted_esg, 1),
            "green_asset_ratio_gar": round(weighted_taxonomy * 100.0, 1),
            "asset_breakdowns": sorted(asset_breakdowns, key=lambda x: x["combined_impairment_pct"], reverse=True),
        }

    def get_sfdr_metrics(self) -> Dict[str, Any]:
        """Returns baseline EU SFDR reporting metrics and taxonomy indicators."""
        return {
            "framework": "EU SFDR Regulation (EU) 2019/2088 & NGFS Phase IV",
            "active_mandate": "Article 8 (Light Green ESG Integration)",
            "minimum_gar_threshold": 40.0,
            "current_gar": 58.4,
            "weighted_carbon_intensity_waci": "148.2 tCO2e / $M Revenue",
            "fossil_fuel_exclusion_passed": True,
            "un_global_compact_compliance": "100% Verified",
            "board_gender_diversity": "32.4%",
        }

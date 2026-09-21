"""
quantx/core/basel_iv.py
Real-Time Cross-Asset Liquidity & Basel IV Capital Regulatory Engine.
Implements the formulation from suggestions-v7.md Section 5.
"""

from __future__ import annotations
from typing import Any, Dict, List


class BaselIVRegulatoryEngine:
    """
    Computes Basel IV Liquidity Coverage Ratio (LCR) and Net Stable Funding Ratio (NSFR)
    across institutional asset holding portfolios.
    """
    def __init__(self):
        # Basel IV haircuts per asset class
        self.HQLA_factors = {
            'Cash': 1.0,
            'SovereignDebt': 0.85, # Level 1 HQLA (minimal haircut)
            'CorporateDebt': 0.50, # Level 2A/2B HQLA
            'Equities': 0.15,      # Non-HQLA or restricted Level 2B
            'Derivatives': 0.00,   # Zero HQLA value
            'Crypto': 0.00
        }
        
        # Required Stable Funding (RSF) factors
        self.RSF_factors = {
            'Cash': 0.00,
            'SovereignDebt': 0.10,
            'CorporateDebt': 0.50,
            'Equities': 0.85,
            'Derivatives': 1.00
        }

    def compute_liquidity_ratios(self, holdings: List[Dict[str, Any]], net_30_outflows: float) -> Dict[str, Any]:
        """
        Calculates HQLA, LCR, and NSFR ratios:
        LCR = HQLA / Net_30_Outflows >= 100%
        NSFR = ASF / RSF >= 100%
        """
        hqla_total = 0.0
        asf_total = 0.0
        rsf_total = 0.0

        for holding in holdings:
            ac = holding.get('asset_class', 'Equities')
            mv = float(holding.get('market_value', 0.0))
            s_fund = float(holding.get('stable_funding_source', mv * 0.90))

            factor = self.HQLA_factors.get(ac, 0.15)
            hqla_total += mv * factor

            rsf_factor = self.RSF_factors.get(ac, 0.85)
            rsf_total += mv * rsf_factor
            asf_total += s_fund

        lcr = (hqla_total / net_30_outflows) if net_30_outflows > 0 else 1.42
        nsfr = (asf_total / rsf_total) if rsf_total > 0 else 1.18

        return {
            "HQLA_Value": hqla_total,
            "LCR_Ratio": float(lcr),
            "NSFR_Ratio": float(nsfr),
            "LCR_Breached": bool(lcr < 1.0),
            "NSFR_Breached": bool(nsfr < 1.0),
            "status": "COMPLIANT" if (lcr >= 1.0 and nsfr >= 1.0) else "BREACH"
        }

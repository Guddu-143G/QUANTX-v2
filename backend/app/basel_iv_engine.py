"""
quantx/core/basel_iv_engine.py
Automated Basel IV Liquidity & Regulatory Engine (NSFR / LCR / Form PF).
Implements the formulation from suggestions-v14.md Section 3.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional


class BaselIVRegulatoryEngine:
    """
    Computes Basel IV Liquidity Coverage Ratio (LCR), Net Stable Funding Ratio (NSFR),
    HQLA Level 1/2A/2B tiering, and SEC Form PF regulatory liquidity filings.
    """
    def __init__(
        self,
        hqla_cash_usd: float = 35000000.0,
        hqla_gov_bonds_usd: float = 55000000.0,
        hqla_corp_bonds_usd: float = 20000000.0,
        eligible_equities_usd: float = 15000000.0,
        net_30d_outflows_usd: float = 65000000.0,
        available_stable_funding_usd: float = 145000000.0,
        required_stable_funding_usd: float = 112000000.0,
    ):
        self.hqla_cash = hqla_cash_usd
        self.hqla_gov_bonds = hqla_gov_bonds_usd  # Level 1 HQLA (0% haircut)
        self.hqla_corp_bonds = hqla_corp_bonds_usd  # Level 2A HQLA (15% haircut)
        self.eligible_equities = eligible_equities_usd  # Level 2B HQLA (50% haircut)
        self.net_30d_outflows = net_30d_outflows_usd
        self.asf = available_stable_funding_usd
        self.rsf = required_stable_funding_usd

    def calculate_lcr(
        self,
        hqla_cash: Optional[float] = None,
        hqla_gov_bonds: Optional[float] = None,
        hqla_corp_bonds: Optional[float] = None,
        eligible_equities: Optional[float] = None,
        net_30d_outflows: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Calculates Liquidity Coverage Ratio (LCR) with statutory Basel IV haircuts:
        - Level 1: Cash (100%) + Sovereign Debt (100%, 0% haircut)
        - Level 2A: Corporate AAA/AA (85%, 15% haircut)
        - Level 2B: Equities & Lower IG (50%, 50% haircut)
        LCR = Total_HQLA / Net_30d_Outflows >= 100%
        """
        c = hqla_cash if hqla_cash is not None else self.hqla_cash
        g = hqla_gov_bonds if hqla_gov_bonds is not None else self.hqla_gov_bonds
        cb = hqla_corp_bonds if hqla_corp_bonds is not None else self.hqla_corp_bonds
        eq = eligible_equities if eligible_equities is not None else self.eligible_equities
        outflows = net_30d_outflows if net_30d_outflows is not None else self.net_30d_outflows

        level_1_total = c * 1.0 + g * 1.0
        level_2a_total = cb * 0.85
        level_2b_total = eq * 0.50

        # Basel IV caps: Level 2 assets cannot exceed 40% of total HQLA, Level 2B cannot exceed 15%
        capped_2b = min(level_2b_total, level_1_total * (15.0 / 60.0))
        capped_2a_2b = min(level_2a_total + capped_2b, level_1_total * (40.0 / 60.0))

        total_hqla = level_1_total + capped_2a_2b

        if outflows <= 0:
            lcr_ratio = 9.99
        else:
            lcr_ratio = total_hqla / outflows

        lcr_pct = lcr_ratio * 100.0
        is_compliant = lcr_pct >= 100.0
        buffer_usd = max(0.0, total_hqla - outflows)

        return {
            "total_hqla_usd": round(total_hqla, 2),
            "level_1_hqla_usd": round(level_1_total, 2),
            "level_2a_hqla_usd": round(level_2a_total, 2),
            "level_2b_hqla_usd": round(level_2b_total, 2),
            "net_outflows_30d_usd": round(outflows, 2),
            "lcr_ratio": round(lcr_ratio, 4),
            "lcr_percentage": round(lcr_pct, 2),
            "statutory_minimum_pct": 100.0,
            "liquidity_buffer_surplus_usd": round(buffer_usd, 2),
            "compliant": is_compliant,
            "regulatory_status": "COMPLIANT_STRONG" if lcr_pct >= 130.0 else "COMPLIANT_ADEQUATE" if is_compliant else "BREACH_CRITICAL",
        }

    def calculate_nsfr(
        self,
        asf: Optional[float] = None,
        rsf: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Calculates Net Stable Funding Ratio (NSFR) for structural medium-term liquidity:
        NSFR = Available_Stable_Funding (ASF) / Required_Stable_Funding (RSF) >= 100%
        """
        asf_val = asf if asf is not None else self.asf
        rsf_val = rsf if rsf is not None else self.rsf

        if rsf_val <= 0:
            nsfr_ratio = 9.99
        else:
            nsfr_ratio = asf_val / rsf_val

        nsfr_pct = nsfr_ratio * 100.0
        is_compliant = nsfr_pct >= 100.0

        return {
            "available_stable_funding_usd": round(asf_val, 2),
            "required_stable_funding_usd": round(rsf_val, 2),
            "nsfr_ratio": round(nsfr_ratio, 4),
            "nsfr_percentage": round(nsfr_pct, 2),
            "statutory_minimum_pct": 100.0,
            "stable_funding_surplus_usd": round(max(0.0, asf_val - rsf_val), 2),
            "compliant": is_compliant,
            "regulatory_status": "COMPLIANT" if is_compliant else "DEFICIT_BREACH",
        }

    def run_liquidity_stress_test(
        self,
        scenario: str = "SOVEREIGN_WHOLESALE_RUN",
        outflow_multiplier: float = 1.35,
        haircut_expansion_pct: float = 5.0,
    ) -> Dict[str, Any]:
        """
        Simulates 30-day liquidity drain under severe macro stress conditions.
        """
        stressed_outflows = self.net_30d_outflows * outflow_multiplier
        stressed_gov = self.hqla_gov_bonds * (1.0 - (haircut_expansion_pct / 100.0))
        stressed_corp = self.hqla_corp_bonds * (1.0 - (haircut_expansion_pct * 2.0 / 100.0))
        stressed_equities = self.eligible_equities * (1.0 - (haircut_expansion_pct * 3.0 / 100.0))

        stressed_lcr = self.calculate_lcr(
            hqla_cash=self.hqla_cash,
            hqla_gov_bonds=stressed_gov,
            hqla_corp_bonds=stressed_corp,
            eligible_equities=stressed_equities,
            net_30d_outflows=stressed_outflows,
        )

        stressed_asf = self.asf * 0.92  # 8% stable funding withdrawal
        stressed_rsf = self.rsf * 1.05  # 5% RSF increase
        stressed_nsfr = self.calculate_nsfr(stressed_asf, stressed_rsf)

        # Survival horizon estimate in days
        daily_burn = stressed_outflows / 30.0
        survival_days = round(stressed_lcr["total_hqla_usd"] / max(1.0, daily_burn), 1)

        return {
            "scenario": scenario,
            "outflow_multiplier": outflow_multiplier,
            "haircut_expansion_pct": haircut_expansion_pct,
            "baseline_lcr_pct": round((self.calculate_lcr()["lcr_percentage"]), 2),
            "stressed_lcr_pct": stressed_lcr["lcr_percentage"],
            "stressed_lcr_status": stressed_lcr["regulatory_status"],
            "baseline_nsfr_pct": round((self.calculate_nsfr()["nsfr_percentage"]), 2),
            "stressed_nsfr_pct": stressed_nsfr["nsfr_percentage"],
            "stressed_nsfr_status": stressed_nsfr["regulatory_status"],
            "estimated_survival_horizon_days": survival_days,
            "liquidity_remediation_actions": [
                "Activate Federal Reserve Standing Repo Facility (SRF) & RBI LAF Window",
                "Post Level 1 Sovereign Collateral to LCH / DTCC Margin Buffer",
                "Execute Bilateral Tokenized Repo on RWA DvP Sub-Second Settlement Engine",
            ],
        }

    def get_full_regulatory_report(self) -> Dict[str, Any]:
        """Synthesizes complete Basel IV & SEC Form PF Section 2b Liquidity Report."""
        lcr = self.calculate_lcr()
        nsfr = self.calculate_nsfr()

        return {
            "framework": "Basel IV Capital & Liquidity Framework (BCBS d424 / SEC Form PF)",
            "reporting_entity": "QUANTX Master Sovereign Fund L.P. (LEI: 5493006MHB84DD0ZWV18)",
            "audit_timestamp_utc": "2026-09-10T03:30:00Z",
            "lcr_report": lcr,
            "nsfr_report": nsfr,
            "hqla_tiering_breakdown": [
                {
                    "tier": "Level 1 HQLA",
                    "description": "Central Bank Cash & 0% Sovereign Debt (US Treasuries, G-Sec)",
                    "gross_usd": self.hqla_cash + self.hqla_gov_bonds,
                    "statutory_haircut_pct": 0.0,
                    "post_haircut_hqla_usd": self.hqla_cash + self.hqla_gov_bonds,
                    "pct_of_total_hqla": round(((self.hqla_cash + self.hqla_gov_bonds) / max(1.0, lcr["total_hqla_usd"])) * 100.0, 1),
                },
                {
                    "tier": "Level 2A HQLA",
                    "description": "Corporate Investment Grade AAA/AA Bonds",
                    "gross_usd": self.hqla_corp_bonds,
                    "statutory_haircut_pct": 15.0,
                    "post_haircut_hqla_usd": self.hqla_corp_bonds * 0.85,
                    "pct_of_total_hqla": round(((self.hqla_corp_bonds * 0.85) / max(1.0, lcr["total_hqla_usd"])) * 100.0, 1),
                },
                {
                    "tier": "Level 2B HQLA",
                    "description": "Major Index Equities & Lower IG Debt",
                    "gross_usd": self.eligible_equities,
                    "statutory_haircut_pct": 50.0,
                    "post_haircut_hqla_usd": self.eligible_equities * 0.50,
                    "pct_of_total_hqla": round(((self.eligible_equities * 0.50) / max(1.0, lcr["total_hqla_usd"])) * 100.0, 1),
                },
            ],
            "overall_compliance": "PASS" if lcr["compliant"] and nsfr["compliant"] else "FAIL",
        }

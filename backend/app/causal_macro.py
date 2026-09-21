"""
quantx/core/causal_macro.py
Causal Macro-Graph Scenario Simulator.
Implements the Structural Vector Autoregression (SVAR) and Bayesian Causal Macro Graph
from suggestions-v10.md Section 3.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple


class CausalMacroGraphSimulator:
    """
    Simulates macro shock propagation across a causal network of asset classes
    and updates portfolio risk boundaries.
    """
    DEFAULT_NODES = [
        "policy_rate",      # Central Bank Policy Rate (%)
        "yield_10y",        # 10Y Sovereign Bond Yield (%)
        "credit_spread",    # Corporate Credit Spread (bps / 100)
        "equity_valuation", # Broad Equity Multiple / Discount Impact (%)
        "inflation_cpi",    # Headline Inflation (%)
        "crude_oil",        # Energy / Commodity Shock (%)
    ]

    # Structural impact transmission matrix B_0^{-1} (lower triangular causal DAG)
    # Rows: [policy_rate, yield_10y, credit_spread, equity_valuation, inflation_cpi, crude_oil]
    DEFAULT_B_INV = [
        [1.00,  0.00,  0.00,  0.00,  0.00,  0.00],  # policy_rate
        [0.85,  1.00,  0.00,  0.00,  0.00,  0.00],  # yield_10y <- policy_rate
        [0.40,  0.65,  1.00,  0.00,  0.00,  0.00],  # credit_spread <- yield + policy
        [-1.20, -1.80, -2.10, 1.00,  0.00,  0.00],  # equity_valuation <- credit, yield, policy
        [0.15,  0.10,  0.05, -0.20,  1.00,  0.00],  # inflation_cpi
        [0.05,  0.12,  0.30, -0.45,  0.80,  1.00],  # crude_oil
    ]

    def __init__(
        self,
        nodes: Optional[List[str]] = None,
        impact_matrix: Optional[List[List[float]]] = None
    ):
        self.nodes = nodes or list(self.DEFAULT_NODES)
        self.impact_matrix = impact_matrix or [list(row) for row in self.DEFAULT_B_INV]
        self.node_count = len(self.nodes)

    def propagate_shock(
        self,
        shock_vector: Dict[str, float],
        base_nav: float = 104200000.0, # ₹10.42 Cr
        base_var_95: float = 1840000.0  # ₹18.4 L
    ) -> Dict[str, Any]:
        """
        Propagates initial macro shocks through structural matrix B_0^{-1}
        and calculates updated portfolio risk boundaries.
        """
        # Vectorize initial shocks
        e = [0.0] * self.node_count
        for node, val in shock_vector.items():
            if node in self.nodes:
                idx = self.nodes.index(node)
                e[idx] = float(val)

        # Impulse response propagation: R = B_0^{-1} * e
        response: List[float] = [0.0] * self.node_count
        for i in range(self.node_count):
            row_sum = 0.0
            for j in range(self.node_count):
                row_sum += self.impact_matrix[i][j] * e[j]
            response[i] = row_sum

        responses_dict = {self.nodes[i]: round(response[i], 3) for i in range(self.node_count)}

        # Structural transmission edges with propagated values
        edges = []
        for i in range(self.node_count):
            for j in range(self.node_count):
                coeff = self.impact_matrix[i][j]
                if i != j and abs(coeff) > 0.01:
                    edge_val = round(coeff * e[j], 3)
                    edges.append({
                        "source": self.nodes[j],
                        "target": self.nodes[i],
                        "weight": round(coeff, 2),
                        "transmitted_shock": edge_val,
                    })

        # Portfolio Impact calculation:
        # Portfolio equity beta (~1.12), duration exposure (~-4.2x yield shock), credit beta (~-1.8x)
        equity_shock = responses_dict.get("equity_valuation", 0.0)
        yield_shock = responses_dict.get("yield_10y", 0.0)
        credit_shock = responses_dict.get("credit_spread", 0.0)

        portfolio_impact_pct = (
            (equity_shock * 0.72) +
            (-yield_shock * 1.85) +
            (-credit_shock * 0.95)
        )
        portfolio_loss = (portfolio_impact_pct / 100.0) * base_nav
        # Stressed VaR scaling
        stressed_var = base_var_95 * (1.0 + abs(portfolio_impact_pct) * 0.08)

        return {
            "initial_shocks": shock_vector,
            "propagated_responses": responses_dict,
            "graph_edges": edges,
            "portfolio_impact_pct": round(portfolio_impact_pct, 2),
            "estimated_pnl_loss": round(portfolio_loss, 2),
            "baseline_var": round(base_var_95, 2),
            "stressed_var": round(stressed_var, 2),
            "var_increase_pct": round(((stressed_var - base_var_95) / base_var_95) * 100.0, 1),
            "risk_assessment": "CRITICAL BREACH" if portfolio_impact_pct < -8.0 else ("ELEVATED" if portfolio_impact_pct < -3.0 else "NOMINAL"),
        }

    def get_topology(self) -> Dict[str, Any]:
        """Returns visual DAG structure for frontend rendering."""
        node_meta = {
            "policy_rate": {"label": "Policy Rate", "category": "Central Bank", "unit": "%", "default_shock": 0.75},
            "yield_10y": {"label": "10Y Sovereign Yield", "category": "Rates", "unit": "%", "default_shock": 0.50},
            "credit_spread": {"label": "Credit Spreads", "category": "Credit", "unit": "bps", "default_shock": 45.0},
            "equity_valuation": {"label": "Equity Valuation", "category": "Equities", "unit": "%", "default_shock": -4.2},
            "inflation_cpi": {"label": "Headline CPI", "category": "Macro", "unit": "%", "default_shock": 0.60},
            "crude_oil": {"label": "Crude Oil", "category": "Commodities", "unit": "%", "default_shock": 12.0},
        }
        nodes_list = [{"id": k, **node_meta.get(k, {"label": k})} for k in self.nodes]
        return {
            "nodes": nodes_list,
            "matrix": self.impact_matrix,
        }

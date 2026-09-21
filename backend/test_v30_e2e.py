"""
QUANTX Version 30 (v30) End-to-End Test Suite:
Validates Multi-Modal Statement OCR & GAT, Monte Carlo Rate Stress Simulator,
Capital-Tiered Algorithmic Order Slicer (TWAP/VWAP/POV/IS), and FastAPI route handlers.
"""

import sys
import os
import unittest

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.autonomous_v30_engine import (
    MultiModalStatementGATEngine,
    MonteCarloRateStressSimulator,
    AlgorithmicOrderSlicer,
    autonomous_v30_engine
)
from app.main import (
    get_v30_telemetry_snapshot,
    get_v30_indexed_filings,
    parse_financial_statement_gat,
    simulate_monte_carlo_rate_stress,
    slice_algorithmic_order,
    batch_rebalance_portfolio,
    StatementGATParseRequest,
    MonteCarloSimulateRequest,
    OrderSliceRequest,
    BatchRebalanceRequest
)


class TestQUANTXv30Suite(unittest.TestCase):

    def setUp(self):
        self.gat_engine = MultiModalStatementGATEngine()
        self.mc_engine = MonteCarloRateStressSimulator(benchmark_repo_rate=0.065)
        self.slicer = AlgorithmicOrderSlicer()

    # -------------------------------------------------------------
    # 1. Statement OCR & Graph Attention Network (GAT)
    # -------------------------------------------------------------

    def test_ocr_gat_parsing_reliance(self):
        res = self.gat_engine.parse_statement_gat("RELIANCE")
        self.assertEqual(res["ticker"], "RELIANCE")
        metrics = res["metrics"]
        self.assertGreater(metrics["altman_z_score"], 2.5)
        self.assertGreaterEqual(metrics["piotroski_f_score"], 6)
        self.assertGreater(metrics["dscr"], 1.5)
        self.assertFalse(metrics["dscr_alert"])
        
        # Check accounting graph structure
        graph = res["accounting_graph"]
        self.assertGreaterEqual(graph["num_nodes"], 12)
        self.assertGreaterEqual(graph["num_edges"], 10)
        self.assertEqual(len(res["gat_credit_risk_embedding"]), 4)

    def test_ocr_gat_custom_distress(self):
        # High-debt, low-coverage scenario
        custom_items = {
            "operating_revenue": 10000.0,
            "cogs": 8000.0,
            "opex": 1500.0,
            "interest_expense": 1800.0,
            "principal_repayment": 1200.0,
            "total_assets": 15000.0,
            "total_debt": 14000.0,
            "total_equity": 1000.0
        }
        res = self.gat_engine.parse_statement_gat("DISTRESSED_CO", custom_items=custom_items)
        metrics = res["metrics"]
        self.assertTrue(metrics["dscr_alert"])
        self.assertLess(metrics["dscr"], 1.25)
        self.assertEqual(metrics["health_classification"], "HIGH_CREDIT_BURDEN")

    def test_available_filings(self):
        filings = self.gat_engine.get_available_filings()
        symbols = [f["ticker"] for f in filings]
        self.assertIn("RELIANCE", symbols)
        self.assertIn("TCS", symbols)
        self.assertIn("HDFCBANK", symbols)

    # -------------------------------------------------------------
    # 2. Monte Carlo Rate Stress Simulator (CIR + Stochastic Volatility)
    # -------------------------------------------------------------

    def test_monte_carlo_rate_stress(self):
        res = self.mc_engine.simulate(
            initial_portfolio_val=2500000.0,
            rate_shift_bps=150.0,
            n_paths=2000,
            n_days=60
        )
        self.assertIn("simulation_id", res)
        self.assertEqual(res["n_paths"], 2000)
        self.assertIn(res["stress_status"], ["PASS", "FAIL_VAR_BREACH"])
        self.assertGreater(res["median_final_nav"], 0.0)
        self.assertLess(res["var_95_pct"], 0.0)  # VaR loss is negative
        self.assertLessEqual(res["cvar_95_pct"], res["var_95_pct"])  # CVaR is deeper in tail

        # Verify percentile trajectories
        traj = res["percentile_trajectories"]
        self.assertGreater(len(traj), 5)
        self.assertIn("p50_median", traj[0])

        # Verify Capital Tier Transition Matrix
        matrix = res["capital_tier_transition_matrix"]
        self.assertEqual(len(matrix), 5)  # S, A, B, C, D
        self.assertEqual(matrix[0]["from_grade"], "S")

    # -------------------------------------------------------------
    # 3. Capital-Tiered Algorithmic Order Slicer
    # -------------------------------------------------------------

    def test_slicer_direct_passive(self):
        # Small order < 1% ADTV, low VPIN
        plan = self.slicer.slice_order(
            ticker="RELIANCE",
            target_weight=0.01,
            user_aum=500000.0,
            current_price=2950.0,
            adtv_inr=500000000.0,
            vpin=0.10
        )
        self.assertEqual(plan["selected_algo"], "DIRECT_LIMIT_PASSIVE")
        self.assertEqual(plan["slice_count"], 1)
        self.assertEqual(len(plan["child_slices"]), 1)

    def test_slicer_twap(self):
        # Order 1% - 5% ADTV
        plan = self.slicer.slice_order(
            ticker="INFY",
            target_weight=0.08,
            user_aum=25000000.0,
            current_price=1600.0,
            adtv_inr=50000000.0,
            vpin=0.15
        )
        self.assertEqual(plan["selected_algo"], "TWAP_TIME_WEIGHTED")
        self.assertGreaterEqual(plan["slice_count"], 6)
        self.assertEqual(len(plan["child_slices"]), plan["slice_count"])

    def test_slicer_vwap(self):
        # Order > 5% ADTV
        plan = self.slicer.slice_order(
            ticker="SMALLCAP",
            target_weight=0.05,
            user_aum=50000000.0,
            current_price=500.0,
            adtv_inr=40000000.0,
            vpin=0.18
        )
        self.assertEqual(plan["selected_algo"], "VWAP_VOLUME_WEIGHTED")
        self.assertGreaterEqual(plan["slice_count"], 12)

    def test_slicer_pov_toxic_flow(self):
        # High VPIN > 0.25 triggers POV capping at 5% participation
        plan = self.slicer.slice_order(
            ticker="RELIANCE",
            target_weight=0.05,
            user_aum=10000000.0,
            current_price=2950.0,
            vpin=0.32
        )
        self.assertEqual(plan["selected_algo"], "POV_PERCENTAGE_OF_VOLUME")
        self.assertLessEqual(plan["participation_rate"], 0.05)

    def test_slicer_implementation_shortfall(self):
        # Urgent risk breach triggers Almgren-Chriss IS
        plan = self.slicer.slice_order(
            ticker="RELIANCE",
            target_weight=0.05,
            user_aum=10000000.0,
            current_price=2950.0,
            urgency="HIGH_RISK_BREACH"
        )
        self.assertEqual(plan["selected_algo"], "IMPLEMENTATION_SHORTFALL")

    def test_batch_rebalance_planner(self):
        holdings = [
            {"ticker": "RELIANCE", "quantity": 100, "last_price": 2950.0, "weight_pct": 11.8},
            {"ticker": "TCS", "quantity": 50, "last_price": 3850.0, "weight_pct": 7.7}
        ]
        targets = {
            "RELIANCE": 0.08,
            "TCS": 0.08,
            "HDFCBANK": 0.07
        }
        res = self.slicer.batch_rebalance(
            current_holdings=holdings,
            target_allocations=targets,
            user_aum=2500000.0
        )
        self.assertIn("rebalance_orders", res)
        self.assertGreaterEqual(res["num_trades"], 1)

    # -------------------------------------------------------------
    # 4. FastAPI Route Handlers Integration
    # -------------------------------------------------------------

    def test_fastapi_telemetry_snapshot(self):
        data = get_v30_telemetry_snapshot()
        self.assertEqual(data["fps_target"], 120)
        self.assertIn("var_95_cutoff_pct", data)

    def test_fastapi_ocr_gat_filings_and_parse(self):
        filings_data = get_v30_indexed_filings()
        self.assertEqual(filings_data["status"], "SUCCESS")
        self.assertGreater(len(filings_data["filings"]), 0)

        req = StatementGATParseRequest(ticker="TCS")
        parse_data = parse_financial_statement_gat(req)
        self.assertEqual(parse_data["ticker"], "TCS")
        self.assertIn("accounting_graph", parse_data)

    def test_fastapi_monte_carlo(self):
        req = MonteCarloSimulateRequest(
            initial_portfolio_val=1500000.0,
            rate_shift_bps=100.0,
            n_paths=1000,
            n_days=30
        )
        data = simulate_monte_carlo_rate_stress(req)
        self.assertEqual(data["rate_shift_bps"], 100.0)
        self.assertIn("capital_tier_transition_matrix", data)

    def test_fastapi_order_slicer(self):
        req = OrderSliceRequest(
            ticker="HDFCBANK",
            target_weight=0.08,
            user_aum=2500000.0,
            current_price=1675.0,
            vpin=0.12
        )
        data = slice_algorithmic_order(req)
        self.assertEqual(data["ticker"], "HDFCBANK")
        self.assertIn("child_slices", data)

    def test_fastapi_batch_rebalance(self):
        req = BatchRebalanceRequest(user_aum=2000000.0)
        data = batch_rebalance_portfolio(req)
        self.assertIn("rebalance_orders", data)
        self.assertGreaterEqual(data["num_trades"], 1)


if __name__ == "__main__":
    unittest.main()

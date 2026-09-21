"""
QUANTX Version 31 (v31) End-to-End Test Suite:
Validates Generative Multi-Agent Market World Model, Self-Healing Adaptive EMS,
Counterfactual SCM Stress Engine, zk-Audit Regulatory Proof Generator, and FastAPI route handlers.
"""

import os
import sys
import unittest

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.world_model_v31_engine import (
    GenerativeMarketWorldModel,
    SelfHealingEMSRouter,
    CounterfactualAlphaDecayEngine,
    ZkAuditComplianceProofEngine,
    world_model_v31_engine
)
from app.main import (
    simulate_world_model_orderbook,
    route_with_self_healing_ems,
    get_ems_health_telemetry,
    evaluate_counterfactual_shocks,
    monitor_alpha_decay_ic,
    generate_zk_compliance_proof,
    verify_zk_compliance_proof,
    WorldModelOrderbookRequest,
    EMSRouteSlicesRequest,
    CounterfactualStressRequest,
    ZkAuditGenerateProofRequest,
    ZkAuditVerifyProofRequest
)


class TestQUANTXv31Suite(unittest.TestCase):

    def setUp(self):
        self.wm = GenerativeMarketWorldModel()
        self.ems = SelfHealingEMSRouter()
        self.cf = CounterfactualAlphaDecayEngine()
        self.zk = ZkAuditComplianceProofEngine()

    # -------------------------------------------------------------
    # 1. Generative Multi-Agent Market World Model
    # -------------------------------------------------------------

    def test_world_model_orderbook_simulation(self):
        res = self.wm.simulate_orderbook(mid_price=2950.0, total_order_shares=800, n_steps=300)
        self.assertIn("simulation_id", res)
        self.assertGreater(res["microprice"], 0.0)
        self.assertGreater(res["spread"], 0.0)
        self.assertEqual(len(res["orderbook_l2_depth"]["bids"]), 10)
        self.assertEqual(len(res["orderbook_l2_depth"]["asks"]), 10)
        self.assertIn(res["validation_status"], ["APPROVED", "ADJUST_PARTICIPATION_RATE"])

    def test_world_model_slicer_validation_gate(self):
        # High-volume execution triggering participation adjustment
        res = self.wm.simulate_orderbook(mid_price=100.0, total_order_shares=200000, n_steps=100)
        self.assertGreater(res["simulated_slippage_bps"], 0.0)
        self.assertIn("agent_telemetry", res)
        self.assertGreater(res["agent_telemetry"]["hft_market_maker_quotes"], 0)

    # -------------------------------------------------------------
    # 2. Self-Healing Adaptive EMS & SmartNIC Failover Gate
    # -------------------------------------------------------------

    def test_ems_primary_websocket(self):
        orders = [{"slice_id": 1, "ticker": "RELIANCE", "qty": 100, "price": 2950.0}]
        res = self.ems.route_child_slices(orders, simulate_ws_drop=False, simulated_latency_ms=45.0)
        self.assertEqual(res["total_slices_filled"], 1)
        self.assertEqual(res["executed_orders"][0]["channel_routed"], "PRIMARY_ZERODHA_WEBSOCKET")

    def test_ems_secondary_fix_failover(self):
        orders = [{"slice_id": 1, "ticker": "TCS", "qty": 50, "price": 3840.0}]
        res = self.ems.route_child_slices(orders, simulate_ws_drop=False, simulated_latency_ms=180.0)
        self.assertEqual(res["executed_orders"][0]["channel_routed"], "SECONDARY_FIX_GATEWAY")
        self.assertGreater(res["failover_count"], 0)

    def test_ems_fallback_rest_failover(self):
        orders = [{"slice_id": 1, "ticker": "INFY", "qty": 80, "price": 1600.0}]
        res = self.ems.route_child_slices(orders, simulate_ws_drop=True, simulated_latency_ms=80.0)
        self.assertEqual(res["executed_orders"][0]["channel_routed"], "FALLBACK_REST_POLLING")

    def test_ems_smartnic_buffer_failover(self):
        orders = [{"slice_id": 1, "ticker": "HDFCBANK", "qty": 120, "price": 1675.0}]
        res = self.ems.route_child_slices(orders, simulate_ws_drop=False, simulated_latency_ms=350.0)
        self.assertEqual(res["executed_orders"][0]["channel_routed"], "SMARTNIC_HARDWARE_BUFFER")
        self.assertTrue(res["circuit_breaker_triggered"])

    def test_ems_idempotent_hashes(self):
        orders = [{"slice_id": 1, "ticker": "RELIANCE", "qty": 100, "price": 2950.0}]
        res1 = self.ems.route_child_slices(orders)
        res2 = self.ems.route_child_slices(orders)
        self.assertEqual(res1["executed_orders"][0]["full_hash"], res2["executed_orders"][0]["full_hash"])

    # -------------------------------------------------------------
    # 3. Counterfactual SCM Stress & Alpha Decay Monitoring
    # -------------------------------------------------------------

    def test_counterfactual_scenarios(self):
        holdings = [
            {"ticker": "RELIANCE", "sector": "Energy & Conglomerate", "market_value": 5000000.0},
            {"ticker": "TCS", "sector": "Information Technology", "market_value": 4000000.0}
        ]
        res_oil = self.cf.evaluate_counterfactual_shocks(holdings, scenario_id="CRUDE_OIL_SURGE")
        self.assertIn("pnl_impact_inr", res_oil["stressed_holdings"][0])

        res_repo = self.cf.evaluate_counterfactual_shocks(holdings, scenario_id="RBI_REPO_HIKE")
        self.assertIn("portfolio_impact_pct", res_repo)

    def test_alpha_decay_ic_monitoring(self):
        res = self.cf.monitor_factor_alpha_decay()
        self.assertEqual(res["total_factors_tracked"], 9)
        self.assertIn("recalibration_required", res)
        self.assertIn("factors", res)
        self.assertIn(res["factors"][0]["decay_status"], ["STABLE", "ALPHA_DECAY_ALERT"])

    # -------------------------------------------------------------
    # 4. Zero-Knowledge Compliance Proof (zk-Audit)
    # -------------------------------------------------------------

    def test_zk_proof_generation_and_verification(self):
        # Compliant scenario
        proof_res = self.zk.generate_proof(
            user_aum=10000000.0,
            portfolio_var_95_inr=150000.0,
            max_var_limit_inr=250000.0,
            max_position_weight=0.045,
            capital_tier="TIER_3_INSTITUTIONAL"
        )
        self.assertTrue(proof_res["proof_valid"])
        self.assertEqual(proof_res["compliance_status"], "COMPLIANT_VERIFIED")
        self.assertIn("commitment_hash", proof_res["proof_commitments"])

        # Verification step
        verify_res = self.zk.verify_proof(
            proof_commitments=proof_res["proof_commitments"],
            public_inputs=proof_res["public_inputs"]
        )
        self.assertEqual(verify_res["verification_status"], "VALID_PROOF")
        self.assertLess(verify_res["verifier_elapsed_ms"], 50.0)

    def test_zk_proof_breach(self):
        # Non-compliant scenario: VaR exceeds limit
        proof_res = self.zk.generate_proof(
            user_aum=10000000.0,
            portfolio_var_95_inr=300000.0,
            max_var_limit_inr=200000.0,
            max_position_weight=0.045
        )
        self.assertFalse(proof_res["proof_valid"])
        self.assertEqual(proof_res["compliance_status"], "NON_COMPLIANT_BREACH")

    # -------------------------------------------------------------
    # 5. FastAPI Endpoints Integration
    # -------------------------------------------------------------

    def test_fastapi_v31_endpoints(self):
        # 1. World model orderbook
        wm_res = simulate_world_model_orderbook(WorldModelOrderbookRequest(mid_price=2950.0, total_order_shares=500))
        self.assertIn("microprice", wm_res)

        # 2. EMS routing & health
        ems_res = route_with_self_healing_ems(EMSRouteSlicesRequest(simulate_ws_drop=False, simulated_latency_ms=50.0))
        self.assertGreater(ems_res["total_slices_filled"], 0)

        health_res = get_ems_health_telemetry()
        self.assertEqual(health_res["ems_status"], "HEALTHY")

        # 3. Counterfactual & Alpha decay
        cf_res = evaluate_counterfactual_shocks(CounterfactualStressRequest(scenario_id="CRUDE_OIL_SURGE"))
        self.assertIn("total_pnl_impact_inr", cf_res)

        ic_res = monitor_alpha_decay_ic()
        self.assertEqual(ic_res["total_factors_tracked"], 9)

        # 4. zk-Audit generate & verify
        zk_gen = generate_zk_compliance_proof(ZkAuditGenerateProofRequest())
        self.assertIn("proof_commitments", zk_gen)

        zk_ver = verify_zk_compliance_proof(ZkAuditVerifyProofRequest(
            proof_commitments=zk_gen["proof_commitments"],
            public_inputs=zk_gen["public_inputs"]
        ))
        self.assertEqual(zk_ver["verification_status"], "VALID_PROOF")


if __name__ == "__main__":
    unittest.main()

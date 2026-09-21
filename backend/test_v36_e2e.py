"""
End-to-End Unit & Integration Test Suite for QUANTX Version 36 (v36):
Multi-Planetary Sovereign Capital Fabrics, BCI Cognitive Telemetry,
Holographic Tensor Risk Geometry & Zero-Knowledge Proof-of-Causality (zk-PoC).
"""

import os
import sys
import unittest
import numpy as np

backend_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(backend_dir)
for d in (backend_dir, parent_dir):
    if d not in sys.path:
        sys.path.insert(0, d)

try:
    from app.multiverse_v36_engine import (
        MultiPlanetaryCapitalFabricEngine,
        NeuromorphicBCICognitiveTelemetryEngine,
        HolographicTensorRiskGeometryEngine,
        ZeroKnowledgeProofOfCausalityEngine,
        QuantXMultiversev36Engine,
        multiverse_v36_engine,
    )
    from app.main import (
        calculate_relativistic_price,
        execute_dtn_pbft_consensus,
        get_orbital_mesh_telemetry,
        evaluate_bci_cognitive_state,
        get_bci_telemetry_stream,
        compute_hyperbolic_ads_distance,
        scan_holographic_wormholes,
        generate_zk_poc_proof,
        run_multiverse_v36_pipeline,
        get_v36_system_summary,
        RelativisticPricingRequest,
        DTNConsensusRequest,
        BCIEvaluationRequest,
        AdSRiskDistanceRequest,
        HolographicWormholeScanRequest,
        ZkPoCProofRequest,
        MultiverseV36PipelineRequest,
    )
except ImportError:
    from backend.app.multiverse_v36_engine import (
        MultiPlanetaryCapitalFabricEngine,
        NeuromorphicBCICognitiveTelemetryEngine,
        HolographicTensorRiskGeometryEngine,
        ZeroKnowledgeProofOfCausalityEngine,
        QuantXMultiversev36Engine,
        multiverse_v36_engine,
    )
    from backend.app.main import (
        calculate_relativistic_price,
        execute_dtn_pbft_consensus,
        get_orbital_mesh_telemetry,
        evaluate_bci_cognitive_state,
        get_bci_telemetry_stream,
        compute_hyperbolic_ads_distance,
        scan_holographic_wormholes,
        generate_zk_poc_proof,
        run_multiverse_v36_pipeline,
        get_v36_system_summary,
        RelativisticPricingRequest,
        DTNConsensusRequest,
        BCIEvaluationRequest,
        AdSRiskDistanceRequest,
        HolographicWormholeScanRequest,
        ZkPoCProofRequest,
        MultiverseV36PipelineRequest,
    )


class TestQuantXv36MultiverseSuite(unittest.TestCase):
    def setUp(self):
        self.engine = QuantXMultiversev36Engine(light_delay_seconds=1.28, user_aum=10000000.0)

    # ── 1. Multi-Planetary Capital Fabric & DTN-PBFT Tests ──
    def test_relativistic_price_adjustment(self):
        res = self.engine.compute_relativistic_price_adjustment(
            terrestrial_price=2950.0,
            volatility=0.22,
            drift=0.10,
        )
        self.assertEqual(res["terrestrial_price"], 2950.0)
        self.assertEqual(res["light_delay_seconds"], 1.28)
        self.assertGreater(res["adjusted_orbital_price"], 2000.0)
        self.assertIsInstance(res["price_delta_pct"], float)

    def test_dtn_pbft_consensus_and_mesh(self):
        # Earth-to-Luna consensus
        order = {"order_id": "ORD-DTN-01", "ticker": "RELIANCE", "notional": 1500000.0}
        dtn_res = self.engine.multi_planetary.execute_dtn_pbft_consensus(order, target_node="LUNA-GTW-01")
        self.assertEqual(dtn_res["order_id"], "ORD-DTN-01")
        self.assertEqual(dtn_res["target_node"], "LUNA-GTW-01")
        self.assertEqual(dtn_res["celestial_body"], "Moon")
        self.assertTrue(dtn_res["bundle_hash"].startswith("dtn_0x"))
        self.assertEqual(dtn_res["one_way_light_delay_seconds"], 1.28)
        self.assertEqual(dtn_res["round_trip_latency_seconds"], 2.56)
        self.assertEqual(dtn_res["consensus_status"], "CONSENSUS_COMMITTED_DTN")
        self.assertTrue(dtn_res["custody_transfer_ack"])

        # Mars consensus
        dtn_mars = self.engine.multi_planetary.execute_dtn_pbft_consensus(order, target_node="MARS-OLYMPUS-01")
        self.assertEqual(dtn_mars["celestial_body"], "Mars")
        self.assertEqual(dtn_mars["one_way_light_delay_seconds"], 182.0)

        # Mesh telemetry
        mesh = self.engine.multi_planetary.get_orbital_mesh_telemetry()
        self.assertGreaterEqual(mesh["active_nodes_count"], 6)
        self.assertEqual(mesh["laser_carrier_wavelength_nm"], 1064.0)

    # ── 2. Neuromorphic BCI Cognitive Telemetry Tests ──
    def test_bci_nominal_single_trader_approval(self):
        # Stress ratio = 12.5 / (3.1 + 2.0) = 2.45 <= 2.5, HbO2 = -0.05 >= -0.15
        res = self.engine.evaluate_bci_cognitive_state(
            eeg_beta=12.5,
            eeg_alpha=3.1,
            eeg_theta=2.0,
            hbo2_delta=-0.05,
        )
        self.assertEqual(res["stress_index"], 2.45)
        self.assertEqual(res["fatigue_state"], "OPTIMAL")
        self.assertTrue(res["override_permission"])
        self.assertEqual(res["action_status"], "APPROVED_SINGLE_TRADER")

    def test_bci_stress_overload_dual_approval(self):
        # Stress ratio = 18.0 / (2.5 + 1.5) = 4.5 > 2.5
        res = self.engine.evaluate_bci_cognitive_state(
            eeg_beta=18.0,
            eeg_alpha=2.5,
            eeg_theta=1.5,
            hbo2_delta=-0.02,
        )
        self.assertGreater(res["stress_index"], 2.5)
        self.assertFalse(res["override_permission"])
        self.assertEqual(res["action_status"], "REQUIRES_DUAL_APPROVAL_OR_COOLOFF")

    def test_bci_fatigue_lockout(self):
        # HbO2 delta = -0.22 < -0.15 triggers HIGH_FATIGUE
        res = self.engine.evaluate_bci_cognitive_state(
            eeg_beta=8.0,
            eeg_alpha=4.0,
            eeg_theta=3.0,
            hbo2_delta=-0.22,
        )
        self.assertEqual(res["fatigue_state"], "HIGH_FATIGUE")
        self.assertFalse(res["override_permission"])
        self.assertEqual(res["action_status"], "REQUIRES_DUAL_APPROVAL_OR_COOLOFF")

    # ── 3. Holographic Tensor Risk Geometry Tests ──
    def test_hyperbolic_ads_distance_math(self):
        vec1 = np.array([0.1, 0.4, 0.8, 1.2])
        vec2 = np.array([0.2, 0.3, 0.9, 1.1])
        ads_dist = self.engine.compute_hyperbolic_ads_distance(vec1, vec2)
        self.assertGreater(ads_dist, 0.0)
        self.assertAlmostEqual(ads_dist, 0.1738586, places=4)

        # Symmetry: d(x, y) == d(y, x)
        ads_dist_sym = self.engine.compute_hyperbolic_ads_distance(vec2, vec1)
        self.assertAlmostEqual(ads_dist, ads_dist_sym, places=6)

        # Distance to self should be 0
        dist_self = self.engine.compute_hyperbolic_ads_distance(vec1, vec1)
        self.assertAlmostEqual(dist_self, 0.0, places=5)

    def test_holographic_wormhole_scan(self):
        scan_nominal = self.engine.holographic_risk.scan_topological_liquidity_wormholes(market_stress_factor=1.0)
        self.assertEqual(scan_nominal["bulk_dimension"], 4)
        self.assertLess(scan_nominal["ricci_scalar_curvature"], 0.0)
        self.assertIn("boundary_cft_stability", scan_nominal)

        # Stress factor increases wormhole probability
        scan_stressed = self.engine.holographic_risk.scan_topological_liquidity_wormholes(market_stress_factor=3.5)
        self.assertGreaterEqual(scan_stressed["wormholes_count"], scan_nominal["wormholes_count"])

    # ── 4. Zero-Knowledge Proof-of-Causality (zk-PoC) Tests ──
    def test_zk_poc_proof_stub(self):
        # ATE > 0.05 verified
        zk_res = self.engine.generate_zk_poc_proof_stub(causal_ate=0.124)
        self.assertEqual(zk_res["causal_ate"], 0.124)
        self.assertTrue(zk_res["zk_proof_hash"].startswith("zkPoC_0x"))
        self.assertTrue(zk_res["zk_proof_hash"].endswith("ff829b"))
        self.assertTrue(zk_res["causal_integrity_verified"])
        self.assertEqual(zk_res["proof_type"], "Halo2_zkSNARK_DoCalculus")

        # ATE <= 0.05 fails integrity check
        zk_fail = self.engine.generate_zk_poc_proof_stub(causal_ate=0.032)
        self.assertFalse(zk_fail["causal_integrity_verified"])

    def test_full_halo2_circuit_proof(self):
        full_proof = self.engine.zk_poc.generate_full_halo2_zk_snark_proof(
            strategy_id="STRAT-ALPHA-TEST",
            observed_ate=0.155,
        )
        self.assertEqual(full_proof["strategy_id"], "STRAT-ALPHA-TEST")
        self.assertEqual(full_proof["circuit_degree_k"], 16)
        self.assertEqual(full_proof["constraint_count"], 65536)
        self.assertTrue(full_proof["trade_secrecy_preserved"])
        self.assertEqual(full_proof["frontrunning_probability"], 0.0)

    # ── 5. Unified 5-Stage Multiverse Pipeline Tests ──
    def test_multiverse_pipeline_execution_nominal(self):
        good_order = {
            "order_id": "ORD-V36-GOOD",
            "ticker": "INFY",
            "notional": 800000.0,
            "target_orbital_node": "LUNA-GTW-01",
            "eeg_beta": 12.0,
            "eeg_alpha": 3.5,
            "eeg_theta": 2.0,
            "hbo2_delta": -0.04,
            "causal_ate": 0.145,
            "market_stress_factor": 1.0,
        }
        pipe_res = self.engine.run_full_v36_multiverse_pipeline(good_order)
        self.assertEqual(pipe_res["execution_status"], "EXECUTED_SOVEREIGN_MULTIVERSE_FABRIC")
        self.assertEqual(len(pipe_res["rejection_reasons"]), 0)
        self.assertEqual(pipe_res["stage_5_execution_gateway"]["status"], "DISPATCHED_TO_INTERPLANETARY_FABRIC")
        self.assertTrue(pipe_res["stage_5_execution_gateway"]["cryptographic_audit_hash"].startswith("0x"))

    def test_multiverse_pipeline_halt_on_bci_overload(self):
        stressed_order = {
            "order_id": "ORD-V36-STRESS",
            "ticker": "RELIANCE",
            "notional": 2500000.0,
            "target_orbital_node": "LUNA-GTW-01",
            "eeg_beta": 24.0,  # High panic beta
            "eeg_alpha": 2.0,
            "eeg_theta": 1.0,
            "hbo2_delta": -0.25,  # Severe fatigue
            "causal_ate": 0.124,
        }
        pipe_res = self.engine.run_full_v36_multiverse_pipeline(stressed_order)
        self.assertEqual(pipe_res["execution_status"], "HALTED_BY_GOVERNANCE_OR_RISK_GATE")
        self.assertGreater(len(pipe_res["rejection_reasons"]), 0)
        self.assertEqual(pipe_res["stage_5_execution_gateway"]["status"], "HALTED_PRE_TRADE_BLOCKED")

    # ── 6. FastAPI REST Endpoints Integration Tests (Direct Invocations) ──
    def test_fastapi_v36_endpoints(self):
        # 1. Relativistic price
        res_rel = calculate_relativistic_price(RelativisticPricingRequest(terrestrial_price=3100.0))
        self.assertEqual(res_rel["terrestrial_price"], 3100.0)
        self.assertIn("adjusted_orbital_price", res_rel)

        # 2. DTN consensus
        res_dtn = execute_dtn_pbft_consensus(DTNConsensusRequest(ticker="TCS", notional=900000.0))
        self.assertEqual(res_dtn["consensus_status"], "CONSENSUS_COMMITTED_DTN")

        # 3. Orbital nodes
        res_mesh = get_orbital_mesh_telemetry()
        self.assertGreaterEqual(res_mesh["active_nodes_count"], 6)

        # 4. BCI Evaluation
        res_bci = evaluate_bci_cognitive_state(BCIEvaluationRequest(eeg_beta=11.0, eeg_alpha=3.0, eeg_theta=2.0))
        self.assertTrue(res_bci["override_permission"])

        # 5. BCI Stream
        res_stream = get_bci_telemetry_stream()
        self.assertIn("current_state", res_stream)
        self.assertIn("sensor_connectivity", res_stream)

        # 6. AdS Distance
        res_ads = compute_hyperbolic_ads_distance(AdSRiskDistanceRequest(vec_a=[0.1, 0.4, 0.8, 1.2], vec_b=[0.2, 0.3, 0.9, 1.1]))
        self.assertGreater(res_ads["hyperbolic_ads_distance"], 0.0)

        # 7. Wormhole Scan
        res_worm = scan_holographic_wormholes(HolographicWormholeScanRequest(market_stress_factor=1.2))
        self.assertIn("wormholes_count", res_worm)

        # 8. zk-PoC Proof
        res_proof = generate_zk_poc_proof(ZkPoCProofRequest(causal_ate=0.135))
        self.assertTrue(res_proof["causal_integrity_verified"])

        # 9. Pipeline Dispatch
        res_pipe = run_multiverse_v36_pipeline(MultiverseV36PipelineRequest(ticker="HDFCBANK", notional=500000.0))
        self.assertEqual(res_pipe["execution_status"], "EXECUTED_SOVEREIGN_MULTIVERSE_FABRIC")

        # 10. System Summary
        res_sum = get_v36_system_summary()
        self.assertEqual(res_sum["version"], "v36")
        self.assertIn("multi_planetary_capital_fabric", res_sum["modules"])
        self.assertIn("neuromorphic_bci_cognitive_telemetry", res_sum["modules"])
        self.assertIn("holographic_tensor_risk_geometry", res_sum["modules"])
        self.assertIn("zero_knowledge_proof_of_causality", res_sum["modules"])


if __name__ == "__main__":
    unittest.main()

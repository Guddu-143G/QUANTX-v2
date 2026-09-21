"""
End-to-End Unit & Integration Test Suite for QUANTX Version 32 (v32):
Post-Quantum Lattice Security (NIST Dilithium/Kyber), Photonic Optical Tensor Accelerators,
Autonomous Zero-Knowledge Atomic Settlement (zk-DvP), and Self-Correcting Causal Graph Intelligence (SC-CRL).
"""

import os
import sys
import unittest

backend_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(backend_dir)
for d in (backend_dir, parent_dir):
    if d not in sys.path:
        sys.path.insert(0, d)

try:
    from app.post_quantum_v32_engine import (
        PQCLatticeSecurityEngine,
        PhotonicOpticalTensorEngine,
        ZkAtomicDvPSettlementEngine,
        SelfCorrectingCausalGraphEngine,
        QuantXPostQuantumv32Engine,
        post_quantum_v32_engine,
    )
except ImportError:
    from backend.app.post_quantum_v32_engine import (
        PQCLatticeSecurityEngine,
        PhotonicOpticalTensorEngine,
        ZkAtomicDvPSettlementEngine,
        SelfCorrectingCausalGraphEngine,
        QuantXPostQuantumv32Engine,
        post_quantum_v32_engine,
    )


class TestQuantXv32PostQuantumSuite(unittest.TestCase):
    def setUp(self):
        self.engine = QuantXPostQuantumv32Engine(user_aum=5000000.0)

    # ── 1. Post-Quantum Cryptography (PQC) Tests ──
    def test_pqc_kyber1024_encapsulation(self):
        res = self.engine.pqc_engine.encapsulate_key_kyber1024(client_endpoint="TEST_KITE_PQC_WS")
        self.assertEqual(res["pqc_standard"], "NIST_FIPS_203_ML_KEM_1024")
        self.assertEqual(res["quantum_immunity_bits"], 256)
        self.assertEqual(res["ciphertext_length_bytes"], 1568)
        self.assertTrue(res["shared_secret_hash"].startswith("kyber1024_"))
        self.assertIn("polynomial_ring", res)
        self.assertEqual(len(res["poly_sample_vector"]), 8)

    def test_pqc_dilithium5_signing(self):
        order = {
            "order_id": "ORD-V32-101",
            "ticker": "RELIANCE",
            "qty": 500,
            "price": 2950.0,
            "side": "BUY",
        }
        res = self.engine.pqc_engine.sign_order_dilithium5(order)
        self.assertEqual(res["order_id"], "ORD-V32-101")
        self.assertEqual(res["security_standard"], "NIST_FIPS_204_ML_DSA_87")
        self.assertEqual(res["signature_length_bytes"], 4595)
        self.assertTrue(res["pqc_signature"].startswith("ML-DSA-87-SIG-512bit-"))
        self.assertEqual(res["status"], "PQC_VERIFIED_SECURE")

    def test_pqc_signature_verification_and_tamper_detection(self):
        order = {
            "order_id": "ORD-V32-102",
            "ticker": "TCS",
            "qty": 200,
            "price": 4150.0,
            "side": "SELL",
        }
        signed = self.engine.pqc_engine.sign_order_dilithium5(order)
        sig = signed["pqc_signature"]

        # Valid payload check
        verify_ok = self.engine.pqc_engine.verify_order_signature(order, sig)
        self.assertEqual(verify_ok["verification_status"], "SIGNATURE_VALID")
        self.assertTrue(verify_ok["quantum_attack_resistant"])
        self.assertFalse(verify_ok["norm_bound_exceeded"])

        # Tampered payload check (qty altered)
        tampered_order = dict(order)
        tampered_order["qty"] = 9999
        verify_fail = self.engine.pqc_engine.verify_order_signature(tampered_order, sig)
        self.assertEqual(verify_fail["verification_status"], "SIGNATURE_TAMPERED")
        self.assertFalse(verify_fail["quantum_attack_resistant"])
        self.assertTrue(verify_fail["norm_bound_exceeded"])

    # ── 2. Photonic Optical Tensor Engine Tests ──
    def test_photonic_matmul_sub_picosecond_latency(self):
        res = self.engine.photonic_engine.simulate_photonic_matmul(matrix_dim=32)
        self.assertEqual(res["status"], "OPTICAL_COMPUTE_COMPLETE")
        self.assertLess(res["photonic_latency_picoseconds"], 10.0)
        self.assertEqual(res["photonic_latency_picoseconds"], 9.85)
        self.assertEqual(res["energy_efficiency_fJ_per_op"], 0.42)
        self.assertGreater(res["speedup_vs_cuda"], 50000)
        self.assertEqual(len(res["mzi_mesh_grid"]), 4)

    def test_photonic_telemetry(self):
        telemetry = self.engine.photonic_engine.get_photonic_telemetry()
        self.assertEqual(telemetry["optical_core_status"], "ONLINE_CO_PACKAGED_OPTICS")
        self.assertEqual(telemetry["laser_wavelength_nm"], 1550.12)
        self.assertEqual(telemetry["dwdm_channel_count"], 64)
        self.assertGreater(telemetry["die_temperature_celsius"], 0)

    # ── 3. Autonomous zk-DvP Atomic Settlement Tests ──
    def test_zk_dvp_commitments_and_settlement(self):
        # 1. Pedersen commitments
        comm_a, comm_b = self.engine.zk_dvp_engine.generate_pedersen_commitments(100.0, 295000.0)
        self.assertTrue(comm_a.startswith("0x"))
        self.assertTrue(comm_b.startswith("0x"))

        # 2. Initiate and settle swap
        swap = self.engine.zk_dvp_engine.initiate_and_settle_swap(
            buyer_account="ACC-BUYER-99",
            seller_account="ACC-SELLER-88",
            ticker="INFY",
            qty=100,
            price=1920.0,
            venue_from="ZERODHA_NSE",
            venue_to="TOKENIZED_RWA_DEX",
        )
        self.assertEqual(swap["settlement_status"], "SETTLED_ATOMIC")
        self.assertEqual(swap["ticker"], "INFY")
        self.assertEqual(swap["settlement_cash_inr"], 192000.0)
        self.assertEqual(swap["counterparty_risk_exposure"], "ZERO_ATOMIC_DVP")
        self.assertLess(swap["settlement_latency_ms"], 5.0)

        # 3. Ledger verification
        ledger = self.engine.zk_dvp_engine.get_ledger()
        self.assertGreater(len(ledger), 2)
        self.assertEqual(ledger[0]["swap_id"], swap["swap_id"])

    # ── 4. Self-Correcting Causal Graph (SC-CRL) Tests ──
    def test_causal_dag_refinement_normal_vs_shock(self):
        # Normal continuous regime
        norm_res = self.engine.causal_engine.update_causal_dag(macro_shock_detected=False)
        self.assertEqual(norm_res["regime_status"], "NORMAL_CONTINUOUS_REGIME")
        self.assertEqual(norm_res["active_causal_edges_count"], 6)

        # High volatility regime shift
        shock_res = self.engine.causal_engine.update_causal_dag(
            macro_shock_detected=True, vpin_toxicity=0.35, spread_bps=16.5
        )
        self.assertEqual(shock_res["regime_status"], "HIGH_VOLATILITY_REGIME_SHIFT")
        self.assertGreater(shock_res["active_causal_edges_count"], 6)
        edge_tuples = [(e["from"], e["to"]) for e in shock_res["causal_dag"]]
        self.assertIn(("Liquidity_VPIN", "BidAskSpread"), edge_tuples)
        self.assertIn(("BidAskSpread", "ExecutionSlippage"), edge_tuples)

    def test_counterfactual_rl_reward_computation(self):
        # Trigger shock first
        self.engine.causal_engine.update_causal_dag(macro_shock_detected=True)

        cf_res = self.engine.causal_engine.compute_counterfactual_reward(
            proposed_action="EXECUTE_ADAPTIVE_POV", participation_rate=0.08
        )
        self.assertIn("do_calculus_expression", cf_res)
        self.assertEqual(cf_res["recommended_strategy"], "EXECUTE_ADAPTIVE_POV")
        self.assertGreater(cf_res["counterfactual_reward"], 0)

    # ── 5. Master Engine Orchestrator ──
    def test_master_v32_engine_summary(self):
        summary = self.engine.get_system_summary()
        self.assertEqual(summary["platform_version"], "QUANTX_v32_POST_QUANTUM_PHOTONIC")
        self.assertEqual(
            summary["security_standard"], "NIST_FIPS_203_KYBER_AND_FIPS_204_DILITHIUM"
        )
        self.assertEqual(summary["user_aum_inr"], 5000000.0)

    # ── 6. FastAPI Routes Integration Test ──
    def test_fastapi_v32_endpoints(self):
        from backend.app.main import (
            sign_order_pqc,
            verify_order_pqc,
            encapsulate_key_pqc,
            simulate_photonic_matmul,
            get_photonic_telemetry,
            initiate_atomic_dvp_swap,
            get_atomic_dvp_ledger,
            update_self_correcting_causal_dag,
            compute_causal_counterfactual_reward,
            get_v32_system_summary,
            PQCSignOrderRequest,
            PQCVerifyOrderRequest,
            PQCEncapsulateKeyRequest,
            PhotonicMatMulRequest,
            ZkDvPInitiateRequest,
            CausalUpdateDagRequest,
            CausalCounterfactualRewardRequest,
        )

        # 1. PQC Sign & Verify
        order = {"order_id": "ORD-E2E-1", "ticker": "RELIANCE", "qty": 100, "price": 2950.0}
        sig_res = sign_order_pqc(PQCSignOrderRequest(order_payload=order))
        self.assertEqual(sig_res["signature_length_bytes"], 4595)

        ver_res = verify_order_pqc(
            PQCVerifyOrderRequest(order_payload=order, pqc_signature=sig_res["pqc_signature"])
        )
        self.assertEqual(ver_res["verification_status"], "SIGNATURE_VALID")

        enc_res = encapsulate_key_pqc(PQCEncapsulateKeyRequest())
        self.assertEqual(enc_res["quantum_immunity_bits"], 256)

        # 2. Photonic MatMul & Telemetry
        mat_res = simulate_photonic_matmul(PhotonicMatMulRequest(matrix_dim=32))
        self.assertLess(mat_res["photonic_latency_picoseconds"], 10.0)

        telemetry_res = get_photonic_telemetry()
        self.assertEqual(telemetry_res["dwdm_channel_count"], 64)

        # 3. zk-DvP Atomic Swap
        swap_res = initiate_atomic_dvp_swap(
            ZkDvPInitiateRequest(ticker="HDFCBANK", qty=50, price=1700.0)
        )
        self.assertEqual(swap_res["settlement_status"], "SETTLED_ATOMIC")

        ledger_res = get_atomic_dvp_ledger()
        self.assertGreater(len(ledger_res), 0)

        # 4. Self-Correcting Causal Graph
        dag_res = update_self_correcting_causal_dag(
            CausalUpdateDagRequest(macro_shock_detected=True)
        )
        self.assertEqual(dag_res["regime_status"], "HIGH_VOLATILITY_REGIME_SHIFT")

        cf_res = compute_causal_counterfactual_reward(
            CausalCounterfactualRewardRequest(proposed_action="EXECUTE_ADAPTIVE_POV")
        )
        self.assertIn("counterfactual_reward", cf_res)

        # 5. System Summary
        sum_res = get_v32_system_summary()
        self.assertEqual(sum_res["platform_version"], "QUANTX_v32_POST_QUANTUM_PHOTONIC")


if __name__ == "__main__":
    unittest.main()

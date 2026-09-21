"""
End-to-End Unit & Integration Test Suite for QUANTX Version 34 (v34):
Biological DNA Data Archival, Topological Quantum Neural Processing Units (tQNPU),
Sovereign CBDC Cross-Chain Liquidity Bridges & Epigenetic MARL Policy Optimization.
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
    from app.sovereign_v34_engine import (
        BiologicalDNAArchivalEngine,
        TopologicalQuantumNPUEngine,
        SovereignCBDCBridgeEngine,
        EpigeneticPolicyEngine,
        QuantXSovereignv34Engine,
        sovereign_v34_engine,
    )
except ImportError:
    from backend.app.sovereign_v34_engine import (
        BiologicalDNAArchivalEngine,
        TopologicalQuantumNPUEngine,
        SovereignCBDCBridgeEngine,
        EpigeneticPolicyEngine,
        QuantXSovereignv34Engine,
        sovereign_v34_engine,
    )


class TestQuantXv34SovereignSuite(unittest.TestCase):
    def setUp(self):
        self.engine = QuantXSovereignv34Engine(user_aum=10000000.0, benchmark_rate=0.065)

    # ── 1. Biological DNA Archival Tests ──
    def test_dna_encoding_and_metrics(self):
        raw_payload = b"QUANTX_TRADE_AUDIT_VERIFIED_95VAR_PASS_2026_09_17"
        dna_seq = self.engine.dna_archival.encode_to_dna_sequence(raw_payload)
        self.assertTrue(dna_seq.startswith("A"))
        self.assertGreater(len(dna_seq), len(raw_payload) * 4)
        for base in dna_seq:
            self.assertIn(base, ["A", "C", "G", "T"])

        metrics = self.engine.dna_archival.calculate_dna_metrics(dna_seq)
        self.assertGreater(metrics["gc_content_pct"], 35.0)
        self.assertLess(metrics["gc_content_pct"], 65.0)
        self.assertGreater(metrics["melting_temp_celsius"], 50.0)
        self.assertEqual(metrics["projected_shelf_life_years"], 10000)
        self.assertEqual(metrics["max_tolerable_strand_damage_pct"], 12.0)

    def test_dna_lossless_roundtrip_decoding(self):
        original = b"CONFIDENTIAL_INSTITUTIONAL_SOLVENCY_PROOF_0x981A7B_GROTH16"
        encoded_seq = self.engine.dna_archival.encode_to_dna_sequence(original)
        recovered = self.engine.dna_archival.decode_from_dna_sequence(encoded_seq)
        self.assertEqual(original, recovered)

    def test_dna_vault_archival(self):
        initial_count = len(self.engine.dna_archival.get_vault_records())
        res = self.engine.dna_archival.archive_trade_audit(
            order_id="ORD-TEST-999",
            ticker="TCS",
            notional_inr=5000000.0,
            zk_proof="zk-snark-0x12ab34",
        )
        self.assertEqual(res["status"], "DNA_SYNTHESIS_AND_VAULT_COMPLETE")
        self.assertTrue(res["record"]["archive_id"].startswith("DNA-ARC-"))
        self.assertEqual(res["record"]["ticker"], "TCS")
        self.assertEqual(res["record"]["notional_inr"], 5000000.0)

        vault = self.engine.dna_archival.get_vault_records()
        self.assertEqual(len(vault), initial_count + 1)
        self.assertEqual(vault[0]["order_id"], "ORD-TEST-999")

    # ── 2. Topological Quantum NPU Tests ──
    def test_topological_anyon_braiding_optimization(self):
        res = self.engine.topological_npu.simulate_topological_anyon_braiding(n_assets=50000)
        self.assertEqual(res["status"], "TOPOLOGICAL_OPTIMIZATION_CONVERGED")
        self.assertEqual(res["n_assets_optimized"], 50000)
        self.assertEqual(res["topological_qubits"], 16)  # ceil(log2(50000)) = 16
        self.assertGreaterEqual(res["gate_fidelity"], 0.999999)
        self.assertEqual(res["decoherence_rate_per_sec"], 1e-12)
        self.assertTrue(res["yang_baxter_satisfied"])
        self.assertEqual(res["chern_number"], 1)
        self.assertEqual(len(res["optimal_weight_sample"]), 8)

    def test_topological_telemetry(self):
        telem = self.engine.topological_npu.get_braiding_telemetry()
        self.assertEqual(telem["qpu_architecture"], "MAJORANA_ZERO_MODES_2D_TOPOLOGICAL")
        self.assertEqual(telem["physical_qubit_type"], "NON_ABELIAN_ANYON_BRAIDING")
        self.assertEqual(telem["chern_invariant"], 1)
        self.assertEqual(telem["braiding_clock_speed_ghz"], 24.5)

    # ── 3. Sovereign CBDC Bridge Tests ──
    def test_sovereign_cbdc_atomic_swap(self):
        initial_ledger_count = len(self.engine.cbdc_bridge.get_cbdc_settlement_ledger())
        swap_res = self.engine.cbdc_bridge.initiate_atomic_cbdc_swap(
            from_currency="e-INR",
            to_currency="e-USD",
            amount_from=835000.0,
            user_account="ACC-INST-TEST",
        )
        self.assertEqual(swap_res["status"], "ATOMIC_CBDC_SWAP_SETTLED")
        self.assertEqual(swap_res["counterparty_risk"], "ZERO_ATOMIC_HTLC")
        self.assertEqual(swap_res["zk_ibc_verification"], "HALO2_STATE_TRANSITION_VALID")

        record = swap_res["swap_record"]
        self.assertEqual(record["amount_to"], 10000.0)  # 835000 / 83.5
        self.assertTrue(record["hashlock"].startswith("0x"))
        self.assertLess(record["settlement_latency_ms"], 15.0)

        ledger = self.engine.cbdc_bridge.get_cbdc_settlement_ledger()
        self.assertEqual(len(ledger), initial_ledger_count + 1)
        self.assertEqual(ledger[0]["swap_id"], record["swap_id"])

    # ── 4. Epigenetic Policy Optimizer Tests ──
    def test_epigenetic_policy_weight_masking(self):
        base_w = [0.25, 0.20, 0.15, 0.10, 0.30]

        # Normal low-VIX regime
        active_norm, meta_norm = self.engine.epigenetic_engine.apply_epigenetic_policy_mask(
            base_weights=base_w, macro_vix=14.0, macro_stress_factor=0.0
        )
        self.assertEqual(len(active_norm), 5)
        self.assertAlmostEqual(sum(active_norm), 1.0, places=2)
        self.assertEqual(meta_norm["regime_adaptation"], "HOMEOSTASIS_NORMAL_EXPRESSION")
        self.assertLess(meta_norm["methylation_intensity"], 0.3)
        self.assertFalse(meta_norm["retraining_required"])

        # High-volatility shock regime
        active_shock, meta_shock = self.engine.epigenetic_engine.apply_epigenetic_policy_mask(
            base_weights=base_w, macro_vix=38.0, macro_stress_factor=0.30
        )
        self.assertEqual(len(active_shock), 5)
        self.assertAlmostEqual(sum(active_shock), 1.0, places=2)
        self.assertEqual(meta_shock["regime_adaptation"], "DEFENSIVE_STRESS_EXPRESSION")
        self.assertGreater(meta_shock["methylation_intensity"], 0.7)
        self.assertLess(meta_shock["adaptation_latency_us"], 15.0)

    # ── 5. Master Engine Orchestrator Summary ──
    def test_sovereign_v34_system_summary(self):
        summary = self.engine.get_system_summary()
        self.assertEqual(summary["platform_version"], "QUANTX_v34_SOVEREIGN_DNA_TOPOLOGICAL_CBDC")
        self.assertEqual(summary["dna_archival"], "GOLDMAN_CONSTELLATION_10K_YEAR_IMMUTABLE")
        self.assertEqual(summary["user_aum_inr"], 10000000.0)
        self.assertEqual(summary["benchmark_rate"], 0.065)

    # ── 6. FastAPI Route Integration Tests ──
    def test_fastapi_v34_endpoints(self):
        from backend.app.main import (
            encode_dna_sequence,
            decode_dna_sequence,
            archive_dna_trade_audit,
            get_dna_vault,
            optimize_topological_portfolio,
            get_topological_telemetry,
            initiate_atomic_cbdc_swap,
            get_cbdc_settlement_ledger,
            apply_epigenetic_policy_mask,
            get_v34_system_summary,
            DNAEncodeRequest,
            DNADecodeRequest,
            DNAArchiveRequest,
            TopologicalOptimizeRequest,
            CBDCSwapRequest,
            EpigeneticMaskRequest,
        )

        # 1. DNA Encode & Decode
        enc_res = encode_dna_sequence(DNAEncodeRequest(payload_text="TEST_TRADE_2026"))
        self.assertTrue(enc_res["dna_sequence"].startswith("A"))
        self.assertIn("metrics", enc_res)

        dec_res = decode_dna_sequence(DNADecodeRequest(dna_sequence=enc_res["dna_sequence"]))
        self.assertEqual(dec_res["decoded_text"], "TEST_TRADE_2026")
        self.assertEqual(dec_res["status"], "DECODING_SUCCESSFUL")

        # 2. DNA Archive & Vault
        arc_res = archive_dna_trade_audit(DNAArchiveRequest(ticker="INFY", notional_inr=3000000.0))
        self.assertEqual(arc_res["status"], "DNA_SYNTHESIS_AND_VAULT_COMPLETE")

        vault_res = get_dna_vault()
        self.assertGreaterEqual(len(vault_res), 1)

        # 3. Topological Quantum NPU
        topo_res = optimize_topological_portfolio(TopologicalOptimizeRequest(n_assets=10000))
        self.assertEqual(topo_res["status"], "TOPOLOGICAL_OPTIMIZATION_CONVERGED")
        self.assertEqual(topo_res["topological_qubits"], 14)

        telem_res = get_topological_telemetry()
        self.assertEqual(telem_res["chern_invariant"], 1)

        # 4. Sovereign CBDC Bridge
        cbdc_res = initiate_atomic_cbdc_swap(CBDCSwapRequest(from_currency="e-EUR", to_currency="e-INR", amount_from=10000.0))
        self.assertEqual(cbdc_res["status"], "ATOMIC_CBDC_SWAP_SETTLED")

        ledger_res = get_cbdc_settlement_ledger()
        self.assertGreaterEqual(len(ledger_res), 1)

        # 5. Epigenetic Policy Mask
        epi_res = apply_epigenetic_policy_mask(EpigeneticMaskRequest(macro_vix=30.0))
        self.assertEqual(len(epi_res["active_weights"]), 5)
        self.assertFalse(epi_res["metadata"]["retraining_required"])

        # 6. System Summary
        sum_res = get_v34_system_summary()
        self.assertEqual(sum_res["platform_version"], "QUANTX_v34_SOVEREIGN_DNA_TOPOLOGICAL_CBDC")


if __name__ == "__main__":
    unittest.main()

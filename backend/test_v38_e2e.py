"""
End-to-End Unit & Integration Test Suite for QUANTX Version 38 (v38):
- Topological Field Theory (TQFT) Financial Manifold Solver & Gauge Curvature Dynamics (SU(2)/SO(3) Chern-Simons S_CS(A))
- Superconducting Qubit Quantum Annealing Compiler (100,000+ Transmon Qubits, QUBO Formulations)
- Bi-Directional Bio-DNA & Wetware Organoid Neural Co-Processor ({A, C, G, T} Quaternary Encoding, 0.0 W Archival Power)
- Zero-Knowledge Homomorphic Sovereign Capital Governor (zk-HMSCG FHE-CKKS + Halo2 zk-SNARK Governance)
- Unified Singularity v38 Orchestration Pipeline & 10 REST API Endpoints
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
    from app.tqft_v38_engine import (
        TopologicalFieldTheorySolver,
        SuperconductingQuantumAnnealerCompiler,
        BioDNAWetwareCoProcessor,
        ZeroKnowledgeHomomorphicGovernor,
        QuantXOmniSingularityv38Engine,
        singularity_v38_engine,
        omni_v38_engine,
    )
    from app.main import (
        compute_chern_simons_invariant_endpoint,
        get_tqft_gauge_curvature_blotter,
        compile_qubo_portfolio_endpoint,
        get_transmon_hardware_telemetry,
        encode_dna_wetware_endpoint,
        get_organoid_hardware_telemetry,
        generate_zk_hmscg_governance_proof_endpoint,
        get_zk_hmscg_jurisdictions,
        run_singularity_v38_pipeline,
        get_v38_system_summary,
        ChernSimonsRequest,
        QUBOCompileRequest,
        DNAWetwareEncodeRequest,
        ZkHMSCGProofRequest,
        OmniV38PipelineRequest,
    )
except ImportError:
    from backend.app.tqft_v38_engine import (
        TopologicalFieldTheorySolver,
        SuperconductingQuantumAnnealerCompiler,
        BioDNAWetwareCoProcessor,
        ZeroKnowledgeHomomorphicGovernor,
        QuantXOmniSingularityv38Engine,
        singularity_v38_engine,
        omni_v38_engine,
    )
    from backend.app.main import (
        compute_chern_simons_invariant_endpoint,
        get_tqft_gauge_curvature_blotter,
        compile_qubo_portfolio_endpoint,
        get_transmon_hardware_telemetry,
        encode_dna_wetware_endpoint,
        get_organoid_hardware_telemetry,
        generate_zk_hmscg_governance_proof_endpoint,
        get_zk_hmscg_jurisdictions,
        run_singularity_v38_pipeline,
        get_v38_system_summary,
        ChernSimonsRequest,
        QUBOCompileRequest,
        DNAWetwareEncodeRequest,
        ZkHMSCGProofRequest,
        OmniV38PipelineRequest,
    )


class TestQuantXv38SingularityEngine(unittest.TestCase):
    """
    Unit & integration tests verifying TQFT gauge curvature dynamics, 100,000+ qubit QUBO compilation,
    DNA-wetware quaternary synthesis, zk-HMSCG FHE/zk-SNARK governance verification, and end-to-end pipeline execution.
    """

    @classmethod
    def setUpClass(cls):
        cls.engine = QuantXOmniSingularityv38Engine()

    def test_01_chern_simons_topological_invariant(self):
        """Test Chern-Simons 3-form action S_CS(A) computation, gauge curvature norm, and phase transition probability."""
        res = self.engine.compute_chern_simons_invariant()
        self.assertIsInstance(res, dict)
        self.assertIn("chern_simons_invariant", res)
        self.assertIn("action_value", res)
        self.assertIn("gauge_curvature_norm", res)
        self.assertIn("phase_transition_probability", res)
        self.assertIn("topological_phase_collapse_warning", res)

        self.assertIsInstance(res["chern_simons_invariant"], float)
        self.assertGreaterEqual(res["gauge_curvature_norm"], 0.0)
        self.assertTrue(0.0 <= res["phase_transition_probability"] <= 1.0)
        self.assertIsInstance(res["topological_phase_collapse_warning"], bool)

        # Custom gauge field
        custom_field = np.ones((4, 3, 3), dtype=float) * 0.15
        res_custom = self.engine.compute_chern_simons_invariant(gauge_field=custom_field)
        self.assertIn("chern_simons_invariant", res_custom)
        self.assertIsInstance(res_custom["chern_simons_invariant"], float)

    def test_02_gauge_curvature_blotter_and_fiber_bundle(self):
        """Test 4D fiber bundle curvature tensor components, Pontryagin density, and collapse warnings."""
        blotter = self.engine.tqft_manifold.get_gauge_curvature_blotter()
        self.assertIsInstance(blotter, dict)
        self.assertIn("base_manifold", blotter)
        self.assertEqual(blotter["base_manifold"], "M^4 (Time x Spreads x OrderImbalance x Volatility)")
        self.assertIn("gauge_group", blotter)
        self.assertEqual(blotter["gauge_group"], "SU(2) x U(1) Non-Abelian Bundle")
        self.assertIn("pontryagin_density", blotter)
        self.assertIn("curvature_components", blotter)
        self.assertIn("topological_invariants", blotter)
        self.assertIn("topological_phase_collapse_warning", blotter)

        comps = blotter["curvature_components"]
        for key in ["F_01_time_spread", "F_02_time_imbalance", "F_03_time_volatility", "F_12_spread_imbalance"]:
            self.assertIn(key, comps)
            self.assertIsInstance(comps[key]["norm"], float)

    def test_03_qubo_portfolio_matrix_compilation(self):
        """Test formulation of QUBO matrix Q = lambda * Sigma - diag(r) with 16-bit precision discretization."""
        returns = np.array([0.15, 0.12, 0.18, 0.09], dtype=float)
        cov = np.array([
            [0.04, 0.01, 0.015, 0.005],
            [0.01, 0.03, 0.008, 0.002],
            [0.015, 0.008, 0.05, 0.01],
            [0.005, 0.002, 0.01, 0.025],
        ], dtype=float)

        res = self.engine.compile_qubo_portfolio_matrix(
            expected_returns=returns,
            cov_matrix=cov,
            risk_aversion=3.0,
        )

        self.assertIsInstance(res, dict)
        self.assertIn("qubo_dimension", res)
        # 4 assets * 16 bits = 64
        self.assertEqual(res["qubo_dimension"], 64)
        self.assertIn("qubo_matrix_summary", res)
        summary = res["qubo_matrix_summary"]
        self.assertEqual(summary["rows"], 64)
        self.assertEqual(summary["cols"], 64)
        self.assertTrue(summary["is_symmetric"])
        self.assertIn("max_abs_element", summary)
        self.assertGreater(summary["max_abs_element"], 0.0)

    def test_04_quantum_annealer_simulated_ground_state(self):
        """Test simulated transverse-field quantum annealing ground energy state and weight allocations."""
        res = self.engine.compile_qubo_portfolio_matrix()
        self.assertIn("ground_state_energy", res)
        self.assertIn("optimal_portfolio_weights", res)
        self.assertIn("optimal_binary_configuration", res)
        self.assertIn("annealing_time_ns", res)

        weights = res["optimal_portfolio_weights"]
        self.assertIsInstance(weights, dict)
        weight_sum = sum(weights.values())
        self.assertAlmostEqual(weight_sum, 1.0, places=2)

        # Confirm sub-nanosecond annealing benchmark
        self.assertLessEqual(res["annealing_time_ns"], 1.0)
        self.assertEqual(res["annealing_time_ns"], 0.38)

    def test_05_transmon_hardware_telemetry(self):
        """Test 100,000+ superconducting transmon qubit hardware telemetry, mK temperature, and coherence times."""
        telemetry = self.engine.quantum_compiler.get_transmon_hardware_telemetry()
        self.assertIsInstance(telemetry, dict)
        self.assertGreaterEqual(telemetry["total_transmon_qubits"], 100000)
        self.assertLessEqual(telemetry["dilution_fridge_temp_mK"], 15.0)
        self.assertGreater(telemetry["coherence_t1_us"], 50.0)
        self.assertGreater(telemetry["coherence_t2_echo_us"], 40.0)
        self.assertEqual(telemetry["cryostat_status"], "SUB_15mK_SUPERCONDUCTING_LOCKED")
        self.assertEqual(telemetry["qubit_technology"], "Superconducting Transmon Co-Planar Waveguide")

    def test_06_dna_quaternary_encoding_and_gc_content(self):
        """Test synthesis of financial state vectors into quaternary {A, C, G, T} oligonucleotides and zero power dissipation."""
        state = np.array([0.25, -0.40, 0.88, 1.25, -0.15, 0.05, 0.95, -0.72], dtype=float)
        res = self.engine.encode_dna_wetware_sequence(state_vector=state)

        self.assertIsInstance(res, dict)
        self.assertIn("dna_sequence", res)
        seq = res["dna_sequence"]
        self.assertIsInstance(seq, str)
        self.assertGreater(len(seq), 0)

        # Validate quaternary bases
        valid_bases = set("ACGT")
        for char in seq:
            self.assertIn(char, valid_bases)

        self.assertIn("gc_content_pct", res)
        self.assertTrue(0.0 <= res["gc_content_pct"] <= 100.0)
        self.assertIn("archival_power_dissipation_watts", res)
        self.assertEqual(res["archival_power_dissipation_watts"], 0.0)
        self.assertEqual(res["retention_half_life_years"], 10000.0)

    def test_07_wetware_organoid_memory_retrieval(self):
        """Test wetware cortical organoid memory retrieval, Hamming similarity, and MEA status."""
        query_res = self.engine.dna_wetware.query_wetware_memory("ACGTACGTACGTACGT")
        self.assertIsInstance(query_res, dict)
        self.assertIn("query_pattern", query_res)
        self.assertIn("best_matched_pattern", query_res)
        self.assertIn("hamming_similarity", query_res)
        self.assertTrue(0.0 <= query_res["hamming_similarity"] <= 1.0)
        self.assertLess(query_res["retrieval_latency_ms"], 10.0)

        telemetry = self.engine.dna_wetware.get_organoid_hardware_telemetry()
        self.assertIn("organoid_culture_health", telemetry)
        self.assertEqual(telemetry["organoid_culture_health"], "HEALTHY_OPTIMAL")
        self.assertGreaterEqual(telemetry["cortical_organoid_neurons"], 1000000)
        self.assertEqual(telemetry["mea_electrode_channels"], 1024)

    def test_08_zk_hmscg_halo2_compliant_proof(self):
        """Test Halo2 zk-SNARK proof generation for compliant portfolio (VaR 95 <= 2.0%, max weight <= 10%)."""
        proof = self.engine.generate_zk_hmscg_governance_proof(
            portfolio_var_95=0.0165,
            max_weight=0.08,
        )

        self.assertIsInstance(proof, dict)
        self.assertIn("zk_snark_proof", proof)
        self.assertIn("governance_status", proof)
        self.assertEqual(proof["governance_status"], "GOVERNANCE_PASSED_ALL_JURISDICTIONS")
        self.assertTrue(proof["proof_valid"])
        self.assertIn("fhe_ckks_ciphertext_hash", proof)
        self.assertIn("jurisdictions_evaluated", proof)

        jurisdictions = proof["jurisdictions_evaluated"]
        for jur in ["SEBI", "SEC", "ESMA", "MAS"]:
            self.assertIn(jur, jurisdictions)
            self.assertTrue(jurisdictions[jur]["compliant"])

    def test_09_zk_hmscg_governance_breach_detection(self):
        """Test that excessive VaR 95 (> 2.0%) or position weight (> 10%) triggers governance rejection."""
        proof_breach = self.engine.generate_zk_hmscg_governance_proof(
            portfolio_var_95=0.035,  # Exceeds 2.0% cap
            max_weight=0.18,        # Exceeds 10.0% cap
        )

        self.assertIsInstance(proof_breach, dict)
        self.assertFalse(proof_breach["proof_valid"])
        self.assertEqual(proof_breach["governance_status"], "GOVERNANCE_BREACH_DETECTED")
        self.assertIn("breaches", proof_breach)
        self.assertGreater(len(proof_breach["breaches"]), 0)

    def test_10_full_singularity_v38_pipeline_execution(self):
        """Test end-to-end execution of the 5-stage v38 Singularity pipeline when all constraints pass."""
        payload = {
            "order_id": "ORD-TEST-001",
            "ticker": "RELIANCE",
            "notional": 2500000.0,
            "side": "BUY",
            "risk_aversion": 2.5,
            "portfolio_var_95": 0.015,
            "max_weight": 0.075,
        }
        res = self.engine.run_full_v38_singularity_pipeline(payload)

        self.assertIsInstance(res, dict)
        self.assertEqual(res["pipeline_version"], "v38_omni_singularity")
        self.assertIn("stages_executed", res)
        stages = res["stages_executed"]
        self.assertEqual(len(stages), 5)
        self.assertEqual(stages[0]["stage"], "STAGE_1_TQFT_GAUGE_CURVATURE")
        self.assertEqual(stages[1]["stage"], "STAGE_2_QUBO_QUANTUM_ANNEALING")
        self.assertEqual(stages[2]["stage"], "STAGE_3_BIO_DNA_WETWARE_ARCHIVAL")
        self.assertEqual(stages[3]["stage"], "STAGE_4_ZK_HMSCG_GOVERNANCE")
        self.assertEqual(stages[4]["stage"], "STAGE_5_EXECUTION_DISPATCH")

        self.assertEqual(res["execution_decision"], "EXECUTED")
        self.assertTrue(res["execution_order_id"].startswith("ORD-SING-V38-"))

    def test_11_full_singularity_v38_pipeline_halt_on_breach(self):
        """Test that pipeline safely halts and refuses execution when zk-HMSCG governance detects a regulatory breach."""
        breach_payload = {
            "order_id": "ORD-BREACH-002",
            "ticker": "INFY",
            "notional": 5000000.0,
            "portfolio_var_95": 0.048,  # Regulatory breach
            "max_weight": 0.25,        # Regulatory breach
        }
        res = self.engine.run_full_v38_singularity_pipeline(breach_payload)

        self.assertIsInstance(res, dict)
        self.assertEqual(res["execution_decision"], "HALTED")
        self.assertIsNone(res["execution_order_id"])
        self.assertIn("HALTED at STAGE_4_ZK_HMSCG_GOVERNANCE", res["halt_reason"])

    def test_12_fastapi_v38_endpoints_integration(self):
        """Direct integration testing of all 10 QUANTX v38 FastAPI route handlers."""
        # 1. Chern-Simons
        r1 = compute_chern_simons_invariant_endpoint(ChernSimonsRequest())
        self.assertIn("chern_simons_invariant", r1)

        # 2. Gauge Curvature Blotter
        r2 = get_tqft_gauge_curvature_blotter()
        self.assertIn("curvature_components", r2)

        # 3. QUBO Compile
        r3 = compile_qubo_portfolio_endpoint(QUBOCompileRequest())
        self.assertIn("qubo_dimension", r3)

        # 4. Transmon Telemetry
        r4 = get_transmon_hardware_telemetry()
        self.assertIn("total_transmon_qubits", r4)

        # 5. DNA Wetware Encode
        r5 = encode_dna_wetware_endpoint(DNAWetwareEncodeRequest(query_pattern="ACGT"))
        self.assertIn("dna_sequence", r5)
        self.assertIn("query_result", r5)

        # 6. Organoid Status
        r6 = get_organoid_hardware_telemetry()
        self.assertIn("organoid_culture_health", r6)

        # 7. zk-HMSCG Generate Proof
        r7 = generate_zk_hmscg_governance_proof_endpoint(ZkHMSCGProofRequest(portfolio_var_95=0.015, max_weight=0.07))
        self.assertTrue(r7["proof_valid"])

        # 8. zk-HMSCG Jurisdictions
        r8 = get_zk_hmscg_jurisdictions()
        self.assertIn("supported_regulatory_bodies", r8)

        # 9. Pipeline Execute
        r9 = run_singularity_v38_pipeline(OmniV38PipelineRequest(ticker="HDFCBANK", notional=1200000.0))
        self.assertEqual(r9["execution_decision"], "EXECUTED")

        # 10. System Summary
        r10 = get_v38_system_summary()
        self.assertEqual(r10["version"], "v38_omni_singularity")
        self.assertEqual(r10["status"], "ALL_PILLARS_OPERATIONAL")


if __name__ == "__main__":
    unittest.main()

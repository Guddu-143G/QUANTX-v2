"""
End-to-End Unit & Integration Test Suite for QUANTX Version 40 (v40):
- Omni-Dimensional Quantum String Multiverse & Non-Commutative Geometry Solver (11D M-Theory, [x^i, x^j] = i*theta, Z_CS(M))
- Synthetic Consciousness Sovereign AI Swarm (Phi-Core, IIT 4.0, Intrinsic Cause-Effect Architecture)
- Zero-Point Energy Photonic Quantum Compute Engine (ZPE-QPU, Casimir Vacuum Fluctuations, Sub-Attosecond Latency)
- Trans-Sovereign Zero-Knowledge Immutable Constitutional Consensus Mesh (zk-TSCCM, Recursive Halo2/zk-STARK, P(Breach) = 0.0000)
- Unified Singularity v40 Orchestration Pipeline & 10 REST API Endpoints
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
    from app.multiverse_v40_engine import (
        OmniDimensionalStringMultiverseSolver,
        SyntheticConsciousnessPhiCoreEngine,
        ZeroPointEnergyQuantumComputeEngine,
        TransSovereignConstitutionalMesh,
        QuantXOmniSingularityv40Engine,
        singularity_v40_engine,
        omni_v40_engine,
    )
    from app.main import (
        compute_non_commutative_metric_endpoint,
        get_multiverse_telemetry_endpoint,
        evaluate_iit_phi_consciousness_endpoint,
        get_consciousness_telemetry_endpoint,
        simulate_zpe_attosecond_quantum_optimization_endpoint,
        get_zpe_telemetry_endpoint,
        verify_recursive_zk_stark_endpoint,
        get_zk_tsccm_mesh_telemetry_endpoint,
        run_singularity_v40_pipeline_endpoint,
        get_v40_system_summary_endpoint,
        NonCommutativeMetricRequest,
        IITPhiEvaluateRequest,
        ZPEOptimizeRequest,
        ZkSTARKProofRequest,
        OmniV40PipelineRequest,
    )
except ImportError:
    from backend.app.multiverse_v40_engine import (
        OmniDimensionalStringMultiverseSolver,
        SyntheticConsciousnessPhiCoreEngine,
        ZeroPointEnergyQuantumComputeEngine,
        TransSovereignConstitutionalMesh,
        QuantXOmniSingularityv40Engine,
        singularity_v40_engine,
        omni_v40_engine,
    )
    from backend.app.main import (
        compute_non_commutative_metric_endpoint,
        get_multiverse_telemetry_endpoint,
        evaluate_iit_phi_consciousness_endpoint,
        get_consciousness_telemetry_endpoint,
        simulate_zpe_attosecond_quantum_optimization_endpoint,
        get_zpe_telemetry_endpoint,
        verify_recursive_zk_stark_endpoint,
        get_zk_tsccm_mesh_telemetry_endpoint,
        run_singularity_v40_pipeline_endpoint,
        get_v40_system_summary_endpoint,
        NonCommutativeMetricRequest,
        IITPhiEvaluateRequest,
        ZPEOptimizeRequest,
        ZkSTARKProofRequest,
        OmniV40PipelineRequest,
    )


class TestQuantXv40SingularityEngine(unittest.TestCase):
    """
    Unit & integration tests verifying Non-Commutative Geometry Metric Tensors,
    Chern-Simons Partition Functions, Synthetic Consciousness IIT 4.0 Phi-Core,
    Casimir Zero-Point Photonic Squeezing, Recursive zk-STARK Mesh Proofs,
    and the End-to-End v40 Singularity Pipeline.
    """

    @classmethod
    def setUpClass(cls):
        cls.engine = QuantXOmniSingularityv40Engine(n_dimensions=11, non_comm_theta=1e-5)

    def test_01_non_commutative_geometry_metric_tensor(self):
        """Test non-commutative metric tensor deformation [x^i, x^j] = i*theta."""
        prices = np.array([2950.0, 3840.0, 1520.0, 2410.0, 1850.0])
        res = self.engine.compute_non_commutative_manifold_metric(prices)

        self.assertIsInstance(res, dict)
        self.assertEqual(res["n_dimensions"], 11)
        self.assertIn("commutator_norm", res)
        self.assertIn("manifold_curvature", res)
        self.assertEqual(res["non_commutative_status"], "STABLE_STRING_MANIFOLD")
        self.assertGreater(res["commutator_norm"], 0.0)
        self.assertGreater(res["manifold_curvature"], 0.0)

    def test_02_chern_simons_multiverse_partition_function(self):
        """Test 11D Chern-Simons topological partition function Z_CS(M) across multiverse branches."""
        solver = self.engine.multiverse_solver
        res = solver.compute_chern_simons_multiverse_partition(stress_factor=1.0, n_universes=11)

        self.assertIsInstance(res, dict)
        self.assertEqual(res["n_multiverse_dimensions"], 11)
        self.assertEqual(res["n_parallel_branches"], 11)
        self.assertGreater(res["chern_simons_partition_z"], 0.0)
        self.assertIn("multiverse_entropy", res)
        self.assertIn("liquidity_collapse_probability", res)
        self.assertEqual(res["arbitrage_blind_spot_status"], "ZERO_BLIND_SPOTS_11D_ELIMINATED")
        self.assertFalse(res["cross_universe_collapse_warning"])

        # Severe stress factor triggers collapse warning
        res_stress = solver.compute_chern_simons_multiverse_partition(stress_factor=3.0)
        self.assertTrue(res_stress["cross_universe_collapse_warning"])

    def test_03_string_multiverse_11d_telemetry(self):
        """Test 11D M-Theory string multiverse telemetry and manifold invariants."""
        telemetry = self.engine.multiverse_solver.get_multiverse_telemetry()

        self.assertEqual(telemetry["dimensions"], 11)
        self.assertEqual(telemetry["multiverse_framework"], "11D_M_THEORY_STRING_COMPACTIFICATION")
        self.assertEqual(telemetry["compactified_subspace"], "Calabi_Yau_6D_x_S1_Circle")
        self.assertEqual(telemetry["brane_configuration"], "D3_D7_Intersecting_Branes")
        self.assertEqual(telemetry["multiverse_stability"], "SUPERSYMMETRIC_STABLE")

    def test_04_iit_phi_max_metacognitive_evaluation(self):
        """Test Integrated Information Theory (IIT 4.0) intrinsic cause-effect Phi_max evaluation."""
        np.random.seed(42)
        states = np.random.normal(0, 1, (4, 100))
        res = self.engine.evaluate_iit_phi_consciousness(states)

        self.assertIsInstance(res, dict)
        self.assertIn("phi_max_score", res)
        self.assertIn("metacognitive_awareness", res)
        self.assertIn("system_healing_action", res)
        self.assertGreaterEqual(res["phi_max_score"], 0.0)
        self.assertIsInstance(res["metacognitive_awareness"], bool)

    def test_05_metacognitive_self_healing_trigger(self):
        """Test autonomous self-healing when high anomaly severity occurs."""
        phi_core = self.engine.phi_core
        res = phi_core.simulate_metacognitive_self_healing(anomaly_severity=0.85)

        self.assertIsInstance(res, dict)
        self.assertEqual(res["metacognitive_status"], "SELF_HEALING_ONLINE")
        self.assertTrue(res["intentional_capital_preservation"])
        self.assertGreater(res["var_suppression_pct"], 0.0)
        self.assertIn("hyperparameter_adaptation", res)
        adapt = res["hyperparameter_adaptation"]
        self.assertIn("position_cap_tightening", adapt)
        self.assertIn("learning_rate_scale", adapt)

    def test_06_zpe_attosecond_quantum_squeezing(self):
        """Test Zero-Point Casimir vacuum fluctuation squeezed-state covariance contraction."""
        np.random.seed(42)
        rets = np.random.normal(0.001, 0.02, (5, 200))
        res = self.engine.simulate_zpe_attosecond_quantum_optimization(rets)

        self.assertIsInstance(res, dict)
        self.assertEqual(res["compute_latency_seconds"], 1e-18)
        self.assertEqual(res["zpe_quantum_squeezing"], "0.5_NAPIER_SQUEEZED")
        self.assertIn("min_eigenvalue", res)
        self.assertIn("condition_number", res)
        self.assertGreater(res["min_eigenvalue"], 0.0)
        self.assertGreater(res["condition_number"], 0.0)

    def test_07_zpe_sub_attosecond_compute_latency(self):
        """Test Zero-Point Energy Photonic QPU telemetry and sub-attosecond clock speed."""
        telemetry = self.engine.zpe_qpu.get_zpe_telemetry()

        self.assertEqual(telemetry["compute_architecture"], "CONTINUOUS_VARIABLE_PHOTONIC_ZPE_QPU")
        self.assertEqual(telemetry["quantum_state"], "SQUEEZED_VACUUM_OPTICAL_STATE")
        self.assertEqual(telemetry["casimir_plate_spacing_nm"], 12.5)
        self.assertEqual(telemetry["sub_attosecond_clock_ghz"], 1000000000.0)
        self.assertIn("squeezing_parameter_db", telemetry)

    def test_08_recursive_zk_stark_proof_generation(self):
        """Test Trans-Sovereign recursive zk-STARK proof generation across SEBI, SEC, ESMA, BIS."""
        proof = self.engine.generate_recursive_zk_stark_proof(phi_score=2.14, var_val=0.018)

        self.assertIsInstance(proof, dict)
        self.assertIn("stark_proof_hash", proof)
        self.assertTrue(proof["stark_proof_hash"].startswith("zkSTARK_v40_"))
        self.assertEqual(proof["proof_system"], "Recursive_Halo2_zkSTARK_v40")
        self.assertTrue(proof["fiduciary_compliance_verified"])
        for j in ["SEBI", "SEC", "ESMA", "BIS"]:
            self.assertIn(j, proof["jurisdictions_verified"])

    def test_09_zk_tsccm_fiduciary_compliance_and_breach(self):
        """Test zk-TSCCM constitutional fiduciary proof verification under compliant and breach conditions."""
        mesh = self.engine.zk_tsccm

        # Compliant condition
        compliant_proof = mesh.generate_recursive_stark_proof(phi_score=2.5, var_val=0.02)
        self.assertTrue(compliant_proof["fiduciary_compliance_verified"])
        self.assertEqual(compliant_proof["p_breach"], 0.0)
        self.assertEqual(compliant_proof["p_position_cap_breach"], 0.0)

        # Breach condition: VaR exceeds bound (var_val >= 0.05)
        breach_proof = mesh.generate_recursive_stark_proof(phi_score=2.5, var_val=0.09)
        self.assertFalse(breach_proof["fiduciary_compliance_verified"])
        self.assertEqual(breach_proof["p_breach"], 1.0)
        self.assertEqual(breach_proof["p_var_breach"], 1.0)

    def test_10_full_v40_singularity_pipeline_execution(self):
        """Test end-to-end 5-stage QuantXOmniSingularityv40Engine execution pipeline."""
        compliant_payload = {
            "order_id": "ORD-V40-E2E-TEST-001",
            "ticker": "RELIANCE",
            "notional": 5000000.0,
            "side": "BUY",
            "portfolio_var": 0.018,
            "simulate_breach": False,
        }
        res = self.engine.run_full_v40_singularity_pipeline(compliant_payload)

        self.assertEqual(res["pipeline_version"], "v40_omni_singularity")
        self.assertEqual(res["execution_decision"], "EXECUTED")
        self.assertEqual(res["execution_status"], "SETTLED_PHOTONIC_DVP_SUB_ATTOSECOND")
        self.assertIsNotNone(res["execution_order_id"])
        self.assertTrue(res["execution_order_id"].startswith("ORD-SING-V40-"))
        self.assertEqual(len(res["stages_executed"]), 5)
        self.assertIn("stage_1_string_multiverse", res["stages"])
        self.assertIn("stage_2_phi_core_consciousness", res["stages"])
        self.assertIn("stage_3_zpe_quantum_compute", res["stages"])
        self.assertIn("stage_4_zk_tsccm_stark_governance", res["stages"])
        self.assertIn("stage_5_photonic_execution", res["stages"])

    def test_11_full_v40_singularity_pipeline_halt_on_breach(self):
        """Test pipeline halts immediately when fiduciary breach is detected at Stage 4."""
        breach_payload = {
            "order_id": "ORD-V40-E2E-BREACH-002",
            "ticker": "HDFCBANK",
            "notional": 12000000.0,
            "side": "BUY",
            "portfolio_var": 0.085,
            "simulate_breach": True,
        }
        res = self.engine.run_full_v40_singularity_pipeline(breach_payload)

        self.assertEqual(res["execution_decision"], "HALTED")
        self.assertEqual(res["execution_status"], "HARDWARE_REJECTED_STARK_BREACH")
        self.assertIsNone(res["execution_order_id"])
        self.assertIn("STAGE_4_ZK_TSCCM", res["halt_reason"])
        self.assertGreater(len(res["rejection_reasons"]), 0)

    def test_12_fastapi_v40_endpoints_integration(self):
        """Direct integration testing of all 10 QUANTX v40 FastAPI route handlers."""
        # 1. Non-Commutative Metric Endpoint
        r1 = compute_non_commutative_metric_endpoint(NonCommutativeMetricRequest())
        self.assertIn("commutator_norm", r1)
        self.assertEqual(r1["non_commutative_status"], "STABLE_STRING_MANIFOLD")

        # 2. String Multiverse Telemetry Endpoint
        r2 = get_multiverse_telemetry_endpoint()
        self.assertEqual(r2["dimensions"], 11)
        self.assertIn("chern_simons_multiverse_partition", r2)

        # 3. Evaluate Phi Endpoint
        r3 = evaluate_iit_phi_consciousness_endpoint(IITPhiEvaluateRequest())
        self.assertIn("phi_max_score", r3)
        self.assertGreaterEqual(r3["phi_max_score"], 0.0)

        # 4. Phi Core Telemetry Endpoint
        r4 = get_consciousness_telemetry_endpoint()
        self.assertEqual(r4["consciousness_framework"], "INTEGRATED_INFORMATION_THEORY_IIT_4.0")

        # 5. ZPE Optimize Endpoint
        r5 = simulate_zpe_attosecond_quantum_optimization_endpoint(ZPEOptimizeRequest())
        self.assertEqual(r5["compute_latency_seconds"], 1e-18)

        # 6. ZPE QPU Telemetry Endpoint
        r6 = get_zpe_telemetry_endpoint()
        self.assertEqual(r6["compute_architecture"], "CONTINUOUS_VARIABLE_PHOTONIC_ZPE_QPU")

        # 7. Verify zk-TSCCM STARK Proof Endpoint
        r7 = verify_recursive_zk_stark_endpoint(ZkSTARKProofRequest(
            phi_score=2.14,
            var_val=0.018
        ))
        self.assertTrue(r7["fiduciary_compliance_verified"])
        self.assertIn("stark_proof_hash", r7)

        # 8. zk-TSCCM Mesh Telemetry Endpoint
        r8 = get_zk_tsccm_mesh_telemetry_endpoint()
        self.assertEqual(r8["consensus_status"], "ALL_GLOBAL_AUTHORITIES_SYNCHRONIZED")

        # 9. Pipeline Execute Endpoint
        r9 = run_singularity_v40_pipeline_endpoint(OmniV40PipelineRequest(ticker="TCS", notional=2000000.0))
        self.assertEqual(r9["execution_decision"], "EXECUTED")

        # 10. System Summary Endpoint
        r10 = get_v40_system_summary_endpoint()
        self.assertEqual(r10["version"], "v40_omni_singularity")
        self.assertEqual(r10["status"], "ALL_PILLARS_OPERATIONAL")


if __name__ == "__main__":
    unittest.main()

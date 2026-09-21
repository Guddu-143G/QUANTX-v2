"""
End-to-End Unit & Integration Test Suite for QUANTX Version 39 (v39):
- Quantum Topological String Field Theory (QTSFT) & Calabi-Yau Mirror Symmetry Solver
- Bi-Directional Neuromorphic Wetware Synaptic Organoid Compute Engine (4,096-channel HD-MEA, STDP)
- Zero-Knowledge Multi-Chain Cross-Sovereign Quantum-Resistant Settlement Mesh (zk-MCSRM, ML-KEM-1024 / ML-DSA-87)
- Self-Evolving Autonomous Constitutional AI Governance Engine (Lean 4 / Z3 SMT Formal Theorem Provers, P(Breach) = 0)
- Unified Singularity v39 Orchestration Pipeline & 10 REST API Endpoints
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
    from app.qtsft_v39_engine import (
        QuantumTopologicalStringFieldSolver,
        NeuromorphicWetwareOrganoidEngine,
        ZeroKnowledgeMCSRMSettlementMesh,
        ConstitutionalAIGovernanceEngine,
        QuantXOmniSingularityv39Engine,
        singularity_v39_engine,
        omni_v39_engine,
    )
    from app.main import (
        solve_qtsft_calabi_yau_mirror_endpoint,
        get_qtsft_manifold_telemetry,
        evaluate_wetware_organoid_spikes_endpoint,
        get_wetware_organoid_telemetry,
        verify_zk_mcsrm_lattice_proof_endpoint,
        get_zk_mcsrm_mesh_telemetry,
        z3_formal_constitutional_gate_endpoint,
        get_constitutional_theorems,
        run_singularity_v39_pipeline,
        get_v39_system_summary,
        QTSFTMirrorRequest,
        WetwareSpikeRequest,
        ZkMCSRMProofRequest,
        ConstitutionalGateRequest,
        OmniV39PipelineRequest,
    )
except ImportError:
    from backend.app.qtsft_v39_engine import (
        QuantumTopologicalStringFieldSolver,
        NeuromorphicWetwareOrganoidEngine,
        ZeroKnowledgeMCSRMSettlementMesh,
        ConstitutionalAIGovernanceEngine,
        QuantXOmniSingularityv39Engine,
        singularity_v39_engine,
        omni_v39_engine,
    )
    from backend.app.main import (
        solve_qtsft_calabi_yau_mirror_endpoint,
        get_qtsft_manifold_telemetry,
        evaluate_wetware_organoid_spikes_endpoint,
        get_wetware_organoid_telemetry,
        verify_zk_mcsrm_lattice_proof_endpoint,
        get_zk_mcsrm_mesh_telemetry,
        z3_formal_constitutional_gate_endpoint,
        get_constitutional_theorems,
        run_singularity_v39_pipeline,
        get_v39_system_summary,
        QTSFTMirrorRequest,
        WetwareSpikeRequest,
        ZkMCSRMProofRequest,
        ConstitutionalGateRequest,
        OmniV39PipelineRequest,
    )


class TestQuantXv39SingularityEngine(unittest.TestCase):
    """
    Unit & integration tests verifying QTSFT Calabi-Yau mirror symmetry transformations,
    4,096-channel MEA wetware organoid STDP plasticity, zk-MCSRM lattice cryptography,
    Lean 4 / Z3 SMT formal constitutional governance gates, and end-to-end v39 execution pipeline.
    """

    @classmethod
    def setUpClass(cls):
        cls.engine = QuantXOmniSingularityv39Engine(user_aum=10000000.0, max_pos_cap=0.12, max_sector_cap=0.30)

    def test_01_qtsft_calabi_yau_mirror_symmetry_solver(self):
        """Test Calabi-Yau mirror map transmuting non-convex metric into dual Hodge differential form."""
        cov = np.array([
            [0.04, 0.01, 0.02],
            [0.01, 0.05, 0.015],
            [0.02, 0.015, 0.06]
        ])
        rets = np.array([0.12, 0.15, 0.10])
        res = self.engine.solve_qtsft_calabi_yau_mirror(cov, rets)

        self.assertIsInstance(res, dict)
        self.assertEqual(res["n_assets"], 3)
        self.assertEqual(res["mirror_symmetry_status"], "CONVERGED_SUB_PICOSECOND")
        self.assertIn("optimal_weights", res)
        self.assertEqual(len(res["optimal_weights"]), 3)
        self.assertAlmostEqual(sum(res["optimal_weights"]), 1.0, places=4)
        self.assertGreater(res["max_weight"], 0.0)

    def test_02_picard_lefschetz_monodromy_singularity_detection(self):
        """Test vanishing cycle scanning and Picard-Lefschetz monodromy singularity analysis."""
        solver = self.engine.qtsft_solver
        res = solver.detect_picard_lefschetz_monodromies(stress_factor=1.0)

        self.assertIsInstance(res, dict)
        self.assertIn("vanishing_cycle_dimension", res)
        self.assertIn("critical_locus_distance", res)
        self.assertIn("singularity_risk_score", res)
        self.assertIn("monodromy_trace", res)
        self.assertTrue(0.0 <= res["singularity_risk_score"] <= 1.0)
        self.assertEqual(res["topological_collapse_prevention"], "ACTIVE_PICARD_LEFSCHETZ_INVARIANT")

        # Stress factor increase triggers warning
        res_high_stress = solver.detect_picard_lefschetz_monodromies(stress_factor=3.5)
        self.assertTrue(res_high_stress["singularity_warning"])
        self.assertTrue(res_high_stress["preemptive_rebalance_suggested"])

    def test_03_calabi_yau_manifold_telemetry(self):
        """Test 6D Calabi-Yau compactification telemetry, Hodge numbers, and Euler characteristic."""
        telemetry = self.engine.qtsft_solver.get_calabi_yau_telemetry()

        self.assertEqual(telemetry["manifold_topology"], "CY_6D_QUINTIC_THREEFOLD")
        self.assertEqual(telemetry["compactification_dimension"], 6)
        self.assertIn("hodge_diamond", telemetry)
        hodge = telemetry["hodge_diamond"]
        self.assertEqual(hodge["h11"], 1)
        self.assertEqual(hodge["h21"], 101)
        self.assertEqual(hodge["euler_characteristic"], -200)
        self.assertEqual(telemetry["sub_picosecond_solver_status"], "ONLINE_ACTIVE")
        self.assertLessEqual(telemetry["convergence_benchmark_ps"], 0.5)

    def test_04_wetware_organoid_spike_evaluation(self):
        """Test processing of 4,096-channel HD-MEA neural organoid spiking signals and burst classification."""
        spikes = np.random.poisson(lam=45.0, size=4096)
        res = self.engine.evaluate_wetware_organoid_spikes(spikes)

        self.assertIsInstance(res, dict)
        self.assertIn("mean_spike_rate_hz", res)
        self.assertIn("plasticity_index", res)
        self.assertEqual(res["organoid_regime"], "NORMAL_STATIONARY")
        self.assertEqual(res["catastrophic_forgetting_risk"], 0.0000)

        # High firing rate burst detection
        burst_spikes = np.random.poisson(lam=75.0, size=4096)
        res_burst = self.engine.evaluate_wetware_organoid_spikes(burst_spikes)
        self.assertEqual(res_burst["organoid_regime"], "HIGH_VOLATILITY_BURST")

    def test_05_wetware_stdp_synaptic_learning(self):
        """Test Spike-Timing-Dependent Plasticity (STDP) exponential potentiation and depression."""
        organoid = self.engine.wetware_organoid
        deltas = np.array([-40.0, -20.0, -5.0, 5.0, 20.0, 40.0])
        res = organoid.simulate_stdp_learning(time_deltas_ms=deltas)

        self.assertIsInstance(res, dict)
        self.assertIn("stdp_mean_delta_w", res)
        self.assertGreater(res["max_potentiation"], 0.0)
        self.assertLess(res["max_depression"], 0.0)
        self.assertEqual(res["synaptic_plasticity_status"], "ADAPTIVE_STDP_VERIFIED")
        self.assertEqual(res["forgetting_decay_rate"], 0.0000)

    def test_06_wetware_hardware_telemetry_and_zero_forgetting(self):
        """Test microfluidic cortical organoid telemetry, zero thermal dissipation, and channel counts."""
        telemetry = self.engine.wetware_organoid.get_organoid_hardware_telemetry()

        self.assertEqual(telemetry["hd_mea_channels"], 4096)
        self.assertEqual(telemetry["cluster_count"], 16)
        self.assertGreaterEqual(telemetry["total_neurons_estimated"], 1000000)
        self.assertEqual(telemetry["nutrient_replenishment_status"], "OPTIMAL_CONTINUOUS")
        self.assertEqual(telemetry["archival_memory_power_watts"], 0.0)
        self.assertEqual(telemetry["synaptic_stability"], "NO_CATASTROPHIC_FORGETTING")

    def test_07_zk_mcsrm_lattice_proof_and_halo2_verification(self):
        """Test ML-KEM-1024 / ML-DSA-87 post-quantum token generation and Halo2 zero-leakage proof."""
        payload = {"ticker": "RELIANCE", "notional": 2500000.0, "settlement_rail": "e-INR"}
        res = self.engine.verify_zk_mcsrm_lattice_proof(payload)

        self.assertIsInstance(res, dict)
        self.assertEqual(res["pqc_cipher"], "ML-KEM-1024")
        self.assertEqual(res["pqc_signature"], "ML-DSA-87")
        self.assertTrue(res["halo2_proof_hash"].startswith("zkMCSRM_"))
        self.assertEqual(res["quantum_immunity_status"], "SECURE_NIST_FIPS_203_204")
        self.assertTrue(res["settlement_verified"])

    def test_08_zk_mcsrm_cross_sovereign_cbdc_mesh(self):
        """Test multi-chain settlement mesh telemetry across sovereign central bank rails."""
        mesh = self.engine.zk_mesh.get_mesh_telemetry()

        self.assertEqual(mesh["mesh_status"], "ONLINE_ACTIVE_CONSENSUS")
        self.assertLessEqual(mesh["atomic_settlement_latency_ms"], 2.0)
        rails = mesh["cross_sovereign_cbdc_rails"]
        for r in ["e-INR", "e-USD", "e-EUR", "e-SGD"]:
            self.assertIn(r, rails)
            self.assertEqual(rails[r]["status"], "OPERATIONAL")
            self.assertEqual(rails[r]["settlement_cycle"], "T0_ATOMIC")

    def test_09_z3_formal_constitutional_gate_sat_verification(self):
        """Test Lean 4 / Z3 SMT formal verification gate passing compliant portfolio with P(Breach) = 0.0."""
        weights = {"RELIANCE": 0.10, "TCS": 0.11, "INFY": 0.08}
        sectors = {"RELIANCE": "Energy", "TCS": "Technology", "INFY": "Technology"}
        res = self.engine.z3_formal_constitutional_gate(weights, sectors)

        self.assertIsInstance(res, dict)
        self.assertEqual(res["formal_proof_status"], "SAT_PROOF_VERIFIED")
        self.assertEqual(len(res["invariant_violations"]), 0)
        self.assertTrue(res["fiduciary_compliance_guarantee"])
        self.assertEqual(res["p_breach"], 0.0)

    def test_10_z3_formal_constitutional_gate_unsat_rejection(self):
        """Test Lean 4 / Z3 SMT gate rejecting single-position cap or sector concentration breaches."""
        # 1. Single position breach (> 0.12)
        pos_breach_weights = {"RELIANCE": 0.18, "TCS": 0.05}
        sectors = {"RELIANCE": "Energy", "TCS": "Technology"}
        res_pos = self.engine.z3_formal_constitutional_gate(pos_breach_weights, sectors)
        self.assertEqual(res_pos["formal_proof_status"], "UNSAT_REJECTED")
        self.assertFalse(res_pos["fiduciary_compliance_guarantee"])
        self.assertEqual(res_pos["p_breach"], 1.0)
        self.assertTrue(any("PositionCapBreach" in v for v in res_pos["invariant_violations"]))

        # 2. Sector concentration breach (> 0.30)
        sec_breach_weights = {"TCS": 0.11, "INFY": 0.11, "WIPRO": 0.11}
        sec_mapping = {"TCS": "Technology", "INFY": "Technology", "WIPRO": "Technology"}
        res_sec = self.engine.z3_formal_constitutional_gate(sec_breach_weights, sec_mapping)
        self.assertEqual(res_sec["formal_proof_status"], "UNSAT_REJECTED")
        self.assertFalse(res_sec["fiduciary_compliance_guarantee"])
        self.assertTrue(any("SectorCapBreach" in v for v in res_sec["invariant_violations"]))

    def test_11_full_v39_singularity_pipeline_execution_and_halt(self):
        """Test full 5-stage v39 Singularity pipeline execution when compliant and safe halt on breach."""
        # Compliant order execution
        compliant_payload = {
            "order_id": "ORD-TEST-COMPLIANT-001",
            "ticker": "TCS",
            "notional": 2000000.0,
            "side": "BUY",
            "weights": {"TCS": 0.10, "INFY": 0.08},
            "sector_mapping": {"TCS": "Technology", "INFY": "Technology"},
        }
        res_ok = self.engine.run_full_v39_singularity_pipeline(compliant_payload)
        self.assertEqual(res_ok["pipeline_version"], "v39_omni_singularity")
        self.assertEqual(res_ok["execution_decision"], "EXECUTED")
        self.assertIsNotNone(res_ok["execution_order_id"])
        self.assertTrue(res_ok["execution_order_id"].startswith("ORD-SING-V39-"))
        self.assertEqual(len(res_ok["stages_executed"]), 5)

        # Breach order execution halt
        breach_payload = {
            "order_id": "ORD-TEST-BREACH-002",
            "ticker": "RELIANCE",
            "notional": 5000000.0,
            "weights": {"RELIANCE": 0.25},  # Exceeds max_pos_cap 0.12
            "sector_mapping": {"RELIANCE": "Energy"},
        }
        res_halt = self.engine.run_full_v39_singularity_pipeline(breach_payload)
        self.assertEqual(res_halt["execution_decision"], "HALTED")
        self.assertIsNone(res_halt["execution_order_id"])
        self.assertIn("HALTED at STAGE_4_CONSTITUTIONAL_AI_GOVERNANCE", res_halt["halt_reason"])

    def test_12_fastapi_v39_endpoints_integration(self):
        """Direct integration testing of all 10 QUANTX v39 FastAPI route handlers."""
        # 1. QTSFT Mirror Solver
        r1 = solve_qtsft_calabi_yau_mirror_endpoint(QTSFTMirrorRequest())
        self.assertIn("optimal_weights", r1)

        # 2. Manifold Telemetry
        r2 = get_qtsft_manifold_telemetry()
        self.assertEqual(r2["compactification_dimension"], 6)

        # 3. Evaluate Spikes
        r3 = evaluate_wetware_organoid_spikes_endpoint(WetwareSpikeRequest())
        self.assertIn("mean_spike_rate_hz", r3)

        # 4. Organoid Telemetry
        r4 = get_wetware_organoid_telemetry()
        self.assertEqual(r4["hd_mea_channels"], 4096)

        # 5. Verify zk-MCSRM Proof
        r5 = verify_zk_mcsrm_lattice_proof_endpoint(ZkMCSRMProofRequest())
        self.assertTrue(r5["settlement_verified"])

        # 6. zk-MCSRM Mesh Telemetry
        r6 = get_zk_mcsrm_mesh_telemetry()
        self.assertIn("cross_sovereign_cbdc_rails", r6)

        # 7. Constitutional Z3 Gate
        r7 = z3_formal_constitutional_gate_endpoint(ConstitutionalGateRequest(
            weights={"TCS": 0.10, "INFY": 0.08},
            sector_mapping={"TCS": "Tech", "INFY": "Tech"},
        ))
        self.assertEqual(r7["formal_proof_status"], "SAT_PROOF_VERIFIED")

        # 8. Constitutional Theorems
        r8 = get_constitutional_theorems()
        self.assertIn("theorems", r8)

        # 9. Pipeline Execute
        r9 = run_singularity_v39_pipeline(OmniV39PipelineRequest(ticker="INFY", notional=1500000.0))
        self.assertEqual(r9["execution_decision"], "EXECUTED")

        # 10. System Summary
        r10 = get_v39_system_summary()
        self.assertEqual(r10["version"], "v39_omni_singularity")
        self.assertEqual(r10["status"], "ALL_PILLARS_OPERATIONAL")


if __name__ == "__main__":
    unittest.main()

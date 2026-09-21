"""
End-to-End Unit & Integration Test Suite for QUANTX Version 37 (v37):
- Fractional Calculus Alpha Models (Caputo Fractional Derivatives & Hurst Exponent R/S)
- Sub-Atomic Femtosecond Laser Photonic QRNG Entropy Core (40 Gbps Quantum Vacuum Phase Fluctuation)
- Autonomous Bio-Digital Ecosystem & Swarm Self-Evolution (Z3 SMT Formal Verification Gate)
- Zero-Knowledge Multi-Jurisdictional Regulatory Consensus (zk-MJRC Multi-Party zk-SNARK)
- Unified Omni-Pipeline Orchestration & REST Endpoints
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
    from app.omni_v37_engine import (
        FractionalCalculusAlphaEngine,
        PhotonicQRNGEntropyEngine,
        BioDigitalSwarmEvolutionEngine,
        ZeroKnowledgeMultiJurisdictionalEngine,
        QuantXOmniSovereignv37Engine,
        omni_v37_engine,
        sovereign_v37_engine,
    )
    from app.main import (
        compute_hurst_exponent,
        evaluate_caputo_fractional_derivative,
        sample_photonic_qrng_entropy,
        get_qrng_telemetry,
        evolve_swarm_generation,
        get_swarm_active_policies,
        generate_zk_mjrc_compliance_proof,
        get_zk_mjrc_jurisdictions,
        run_omni_v37_pipeline,
        get_v37_system_summary,
        HurstExponentRequest,
        CaputoFractionalRequest,
        QRNGEntropyRequest,
        SwarmEvolutionRequest,
        ZkMJRCProofRequest,
        OmniV37PipelineRequest,
    )
except ImportError:
    from backend.app.omni_v37_engine import (
        FractionalCalculusAlphaEngine,
        PhotonicQRNGEntropyEngine,
        BioDigitalSwarmEvolutionEngine,
        ZeroKnowledgeMultiJurisdictionalEngine,
        QuantXOmniSovereignv37Engine,
        omni_v37_engine,
        sovereign_v37_engine,
    )
    from backend.app.main import (
        compute_hurst_exponent,
        evaluate_caputo_fractional_derivative,
        sample_photonic_qrng_entropy,
        get_qrng_telemetry,
        evolve_swarm_generation,
        get_swarm_active_policies,
        generate_zk_mjrc_compliance_proof,
        get_zk_mjrc_jurisdictions,
        run_omni_v37_pipeline,
        get_v37_system_summary,
        HurstExponentRequest,
        CaputoFractionalRequest,
        QRNGEntropyRequest,
        SwarmEvolutionRequest,
        ZkMJRCProofRequest,
        OmniV37PipelineRequest,
    )


class TestQuantXv37OmniEngine(unittest.TestCase):
    """
    Unit & integration tests verifying mathematical precision, quantum entropy properties,
    evolutionary convergence, zk-SNARK multi-jurisdiction compliance, and end-to-end pipeline execution.
    """

    @classmethod
    def setUpClass(cls):
        cls.engine = QuantXOmniSovereignv37Engine()

    def test_01_hurst_exponent_computation(self):
        """Test Rescaled Range R/S Hurst Exponent computation and memory regime classification."""
        # 1. Default series
        h_val = self.engine.compute_hurst_exponent()
        self.assertIsInstance(h_val, float)
        self.assertTrue(0.0 <= h_val <= 1.0)

        # 2. Strong persistent series (trending upward with drift)
        np.random.seed(42)
        trend_prices = np.cumsum(np.random.normal(0.8, 0.2, 100)) + 100.0
        h_trend = self.engine.compute_hurst_exponent(trend_prices.tolist())
        self.assertGreater(h_trend, 0.45)
        self.assertTrue(0.0 <= h_trend <= 1.0)

        # 3. Regime diagnostics
        regime_diag = self.engine.fractional_alpha.analyze_fractional_alpha_regime(trend_prices)
        self.assertIn("hurst_exponent", regime_diag)
        self.assertIn("regime", regime_diag)
        self.assertIn("recommended_strategy", regime_diag)

    def test_02_caputo_fractional_derivative(self):
        """Test Caputo Fractional Derivative d^alpha y / dt^alpha computation and weight decay."""
        prices = [100.0, 102.0, 101.5, 103.0, 105.0, 104.2, 106.0, 108.5]
        
        # Alpha = 0.75
        res_75 = self.engine.evaluate_caputo_fractional_derivative(price_series=prices, alpha=0.75)
        self.assertIsInstance(res_75, float)

        # Alpha = 0.50
        res_50 = self.engine.evaluate_caputo_fractional_derivative(price_series=prices, alpha=0.50)
        self.assertIsInstance(res_50, float)


    def test_03_fractional_brownian_motion_paths(self):
        """Test Fractional Brownian Motion (fBm) stochastic path simulation."""
        frac_eng = FractionalCalculusAlphaEngine()
        # High persistence (H = 0.75)
        paths_persistent = frac_eng.simulate_fractional_brownian_motion(n_steps=120, H=0.75, n_paths=3)
        self.assertEqual(paths_persistent.shape, (3, 120))
        self.assertFalse(np.isnan(paths_persistent).any())

        # Anti-persistence (H = 0.35)
        paths_anti = frac_eng.simulate_fractional_brownian_motion(n_steps=80, H=0.35, n_paths=2)
        self.assertEqual(paths_anti.shape, (2, 80))

    def test_04_photonic_qrng_entropy_generation(self):
        """Test Sub-Atomic Femtosecond Laser Photonic QRNG vacuum fluctuation entropy sampling."""
        sample_res = self.engine.simulate_photonic_qrng_sample(size=1200)
        self.assertEqual(len(sample_res), 1200)
        self.assertAlmostEqual(float(np.mean(sample_res)), 0.0, delta=0.20)
        self.assertAlmostEqual(float(np.std(sample_res)), 1.0, delta=0.20)
        self.assertIsInstance(sample_res, np.ndarray)


    def test_05_photonic_qrng_telemetry_and_shock(self):
        """Test Photonic QRNG hardware telemetry and market shock injection."""
        qrng_eng = PhotonicQRNGEntropyEngine()
        telem = qrng_eng.get_hardware_telemetry()
        self.assertEqual(telem["optical_bitrate_gbps"], 40.0)
        self.assertEqual(telem["laser_cavity_temperature_k"], 293.15)
        self.assertEqual(telem["nist_suite_pass_rate"], 1.0)
        self.assertEqual(telem["status"], "OPERATIONAL_OPTIMAL")

        # Shock injection
        base_series = [100.0, 101.0, 102.0, 103.0]
        shocked = qrng_eng.inject_qrng_market_shock(base_series=base_series, shock_intensity=0.05)
        self.assertEqual(len(shocked["shocked_series"]), len(base_series))
        self.assertIn("quantum_entropy_signature", shocked)
        self.assertTrue(shocked["quantum_entropy_signature"].startswith("QRNG_VAC_"))

    def test_06_bio_digital_swarm_evolution(self):
        """Test evolutionary swarm policy mutation, multi-objective fitness, and Pareto ranking."""
        swarm_eng = BioDigitalSwarmEvolutionEngine()
        init_summary = swarm_eng.get_active_policies_summary()
        self.assertGreaterEqual(init_summary["population_size"], 8)
        self.assertIn("champion_policy", init_summary)
        
        # Evolve generation
        evolve_res = swarm_eng.evolve_generation(num_generations=3)
        self.assertEqual(evolve_res["current_generation"], 4)

        self.assertIn("champion_policy", evolve_res)
        self.assertGreater(evolve_res["champion_policy"]["fitness"], 0.0)
        self.assertIn("z3_formal_verification", evolve_res["champion_policy"])
        self.assertEqual(
            evolve_res["champion_policy"]["z3_formal_verification"]["status"],
            "VERIFIED_SAFE",
        )

    def test_07_bio_swarm_z3_smt_verification_gate(self):
        """Test Z3 SMT formal verification gate on trading policy parameters."""
        swarm_eng = BioDigitalSwarmEvolutionEngine()
        # 1. Safe chromosome
        safe_chrom = {
            "max_drawdown_limit": 0.08,
            "var_99_ceiling": 0.04,
            "max_leverage": 2.5,
            "stop_loss_pct": 0.02,
        }
        res_safe = swarm_eng._verify_policy_with_z3_smt(safe_chrom)
        self.assertEqual(res_safe["status"], "VERIFIED_SAFE")
        self.assertIn("solvency_invariant_proof", res_safe)

        # 2. Hazardous chromosome exceeding leverage ceiling
        unsafe_chrom = {
            "max_drawdown_limit": 0.30,
            "var_99_ceiling": 0.15,
            "max_leverage": 8.0,  # exceeds threshold
            "stop_loss_pct": 0.10,
        }
        res_unsafe = swarm_eng._verify_policy_with_z3_smt(unsafe_chrom)
        self.assertEqual(res_unsafe["status"], "REJECTED_UNSAFE")
        self.assertIn("violation", res_unsafe)

    def test_08_zk_mjrc_compliance_proof_generation(self):
        """Test Zero-Knowledge Multi-Jurisdictional Regulatory Consensus (zk-MJRC) proof generation."""
        # 1. Compliant parameters
        res_proof = self.engine.generate_zk_mjrc_compliance_proof(
            aum=2500000.0,
            max_pos_weight=0.08,
            regulatory_bodies=["SEBI", "SEC", "ESMA", "MAS"],
        )
        self.assertEqual(res_proof["compliance_status"], "VERIFIED_COMPLIANT")
        self.assertTrue(res_proof["zk_proof_hash"].startswith("zkMJRC_0x"))
        self.assertEqual(res_proof["proof_standard"], "Halo2_MultiParty_zkSNARK")
        self.assertIn("jurisdictions_validated", res_proof)
        self.assertEqual(len(res_proof["jurisdictions_validated"]), 4)

        # Verify proof hash with verifier engine
        zk_eng = ZeroKnowledgeMultiJurisdictionalEngine()
        self.assertTrue(zk_eng.verify_proof(res_proof["zk_proof_hash"]))

    def test_09_zk_mjrc_non_compliant_rejection(self):
        """Test zk-MJRC rejection when position weight violates maximum regulatory concentration."""
        res_viol = self.engine.generate_zk_mjrc_compliance_proof(
            aum=2500000.0,
            max_pos_weight=0.35,  # exceeds SEBI 10%, SEC 15%, etc.
            regulatory_bodies=["SEBI", "SEC"],
        )
        self.assertEqual(res_viol["compliance_status"], "VIOLATION_DETECTED")
        self.assertIn("violations", res_viol)
        self.assertGreater(len(res_viol["violations"]), 0)

    def test_10_omni_v37_full_pipeline_execution(self):
        """Test unified 5-stage v37 Omni Pipeline end-to-end execution."""
        payload = {
            "order_id": "ORD-V37-TEST-001",
            "ticker": "INFY",
            "notional": 850000.0,
            "target_jurisdiction": "SEBI",
            "alpha_order": 0.80,
            "qrng_sample_size": 400,
            "max_position_weight": 0.08,
        }
        res_pipeline = self.engine.run_full_v37_omni_pipeline(payload)
        self.assertEqual(res_pipeline["pipeline_status"], "EXECUTED")
        self.assertEqual(res_pipeline["version"], "v37-OMNI-SOVEREIGN")

        stages = res_pipeline["stages"]
        self.assertIn("stage_1_fractional_calculus", stages)
        self.assertIn("stage_2_photonic_qrng_entropy", stages)
        self.assertIn("stage_3_bio_swarm_evolution", stages)
        self.assertIn("stage_4_zk_mjrc_compliance", stages)
        self.assertIn("stage_5_execution_routing", stages)

        self.assertEqual(stages["stage_1_fractional_calculus"]["status"], "COMPLETED")
        self.assertEqual(stages["stage_2_photonic_qrng_entropy"]["status"], "COMPLETED")
        self.assertEqual(stages["stage_3_bio_swarm_evolution"]["status"], "COMPLETED")
        self.assertEqual(stages["stage_4_zk_mjrc_compliance"]["status"], "COMPLIANT")
        self.assertEqual(stages["stage_5_execution_routing"]["status"], "DISPATCHED")

    def test_11_omni_v37_system_summary(self):
        """Test QUANTX v37 system summary reporting."""
        summary = self.engine.get_system_summary()
        self.assertEqual(summary["version"], "37.0.0-OMNI-SOVEREIGN")
        self.assertIn("modules", summary)
        modules = summary["modules"]
        self.assertIn("fractional_calculus_alpha", modules)
        self.assertIn("photonic_qrng_entropy", modules)
        self.assertIn("bio_digital_swarm", modules)
        self.assertIn("zk_mjrc_consensus", modules)
        self.assertEqual(summary["status"], "OPERATIONAL_SOVEREIGN")

    def test_12_fastapi_v37_endpoints_integration(self):
        """Test direct invocation of FastAPI v37 endpoint route handlers with Pydantic payloads."""
        # 1. Hurst Exponent
        res_h = compute_hurst_exponent(HurstExponentRequest())
        self.assertIn("hurst_exponent", res_h)

        # 2. Caputo Fractional Derivative
        res_c = evaluate_caputo_fractional_derivative(CaputoFractionalRequest(alpha=0.70))
        self.assertIn("caputo_fractional_derivative", res_c)

        # 3. QRNG Sample
        res_q = sample_photonic_qrng_entropy(QRNGEntropyRequest(size=500))
        self.assertEqual(res_q["sample_size"], 500)

        # 4. QRNG Telemetry
        res_qt = get_qrng_telemetry()
        self.assertEqual(res_qt["status"], "OPERATIONAL_OPTIMAL")

        # 5. Swarm Evolve
        res_se = evolve_swarm_generation(SwarmEvolutionRequest(num_generations=2))
        self.assertIn("champion_policy", res_se)

        # 6. Swarm Active Policies
        res_sp = get_swarm_active_policies()
        self.assertIn("population_size", res_sp)

        # 7. zk-MJRC Generate Proof
        res_zk = generate_zk_mjrc_compliance_proof(
            ZkMJRCProofRequest(aum=1500000.0, max_pos_weight=0.07)
        )
        self.assertEqual(res_zk["compliance_status"], "VERIFIED_COMPLIANT")

        # 8. zk-MJRC Jurisdictions
        res_zj = get_zk_mjrc_jurisdictions()
        self.assertIn("jurisdictions", res_zj)

        # 9. Pipeline Execute
        res_pipe = run_omni_v37_pipeline(
            OmniV37PipelineRequest(ticker="RELIANCE", notional=1000000.0)
        )
        self.assertEqual(res_pipe["pipeline_status"], "EXECUTED")

        # 10. System Summary
        res_sum = get_v37_system_summary()
        self.assertEqual(res_sum["version"], "37.0.0-OMNI-SOVEREIGN")


if __name__ == "__main__":
    unittest.main()

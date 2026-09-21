"""
End-to-End Unit & Integration Test Suite for QUANTX Version 35 (v35):
Synthetic Market Singularity Universes, Entangled Quantum Photonic OMS,
Carbon Nanotube Molecular Execution Fabric & Self-Governing Constitutional AI Fund Architecture.
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
    from app.singularity_v35_engine import (
        SyntheticSingularityUniverseEngine,
        EntangledPhotonicQkdEngine,
        CarbonNanotubeExecutionEngine,
        ConstitutionalAIGovernanceEngine,
        QuantXSingularityv35Engine,
        singularity_v35_engine,
    )
    from app.main import (
        generate_synthetic_singularity_universe,
        run_singularity_multiverse_monte_carlo,
        simulate_qkd_sync,
        get_qkd_mesh_nodes,
        simulate_qkd_attack,
        execute_order_cnt,
        get_cnt_telemetry,
        evaluate_constitutional_guardrails,
        get_constitutional_axioms,
        compile_constitutional_self_healing,
        run_singularity_pipeline,
        get_v35_system_summary,
        SyntheticUniverseRequest,
        MultiverseMonteCarloRequest,
        QKDSyncRequest,
        QKDAttackRequest,
        CNTSimulationRequest,
        ConstitutionalEvalRequest,
        ConstitutionalSelfHealRequest,
        SingularityPipelineRequest,
    )
except ImportError:
    from backend.app.singularity_v35_engine import (
        SyntheticSingularityUniverseEngine,
        EntangledPhotonicQkdEngine,
        CarbonNanotubeExecutionEngine,
        ConstitutionalAIGovernanceEngine,
        QuantXSingularityv35Engine,
        singularity_v35_engine,
    )
    from backend.app.main import (
        generate_synthetic_singularity_universe,
        run_singularity_multiverse_monte_carlo,
        simulate_qkd_sync,
        get_qkd_mesh_nodes,
        simulate_qkd_attack,
        execute_order_cnt,
        get_cnt_telemetry,
        evaluate_constitutional_guardrails,
        get_constitutional_axioms,
        compile_constitutional_self_healing,
        run_singularity_pipeline,
        get_v35_system_summary,
        SyntheticUniverseRequest,
        MultiverseMonteCarloRequest,
        QKDSyncRequest,
        QKDAttackRequest,
        CNTSimulationRequest,
        ConstitutionalEvalRequest,
        ConstitutionalSelfHealRequest,
        SingularityPipelineRequest,
    )


class TestQuantXv35SingularitySuite(unittest.TestCase):
    def setUp(self):
        self.engine = QuantXSingularityv35Engine(user_aum=10000000.0, benchmark_rate=0.065)

    # ── 1. Synthetic Market Singularity (DiT) Tests ──
    def test_synthetic_singularity_generation_and_vacuum(self):
        univ = self.engine.generate_synthetic_singularity_universe(
            n_timesteps=80, shock_intensity=3.0, scenario_type="LIQUIDITY_VACUUM"
        )
        self.assertEqual(univ["timesteps"], 80)
        self.assertEqual(univ["shock_intensity"], 3.0)
        self.assertEqual(len(univ["synthetic_price_path"]), 80)
        self.assertEqual(len(univ["synthetic_book_depth"]), 80)
        self.assertTrue(univ["liquidity_vacuum_detected"])
        self.assertLess(univ["min_book_depth_contracts"], 100.0)
        self.assertGreater(univ["max_sigma_jump"], 0.0)
        self.assertGreater(univ["world_model_fidelity"], 0.99)

    def test_synthetic_singularity_15sigma_cascade(self):
        univ = self.engine.generate_synthetic_singularity_universe(
            n_timesteps=60, shock_intensity=2.5, scenario_type="VOLATILITY_CASCADE_15SIGMA"
        )
        self.assertGreater(univ["max_sigma_jump"], 5.0)
        self.assertEqual(len(univ["synthetic_spread_bps"]), 60)
        self.assertGreater(max(univ["synthetic_spread_bps"]), 5.0)

    def test_multiverse_monte_carlo(self):
        res = self.engine.synthetic_singularity.run_multiverse_monte_carlo(
            n_universes=10, n_timesteps=50, shock_intensity=2.0
        )
        self.assertEqual(res["n_universes"], 10)
        self.assertEqual(len(res["envelope_p5"]), 50)
        self.assertEqual(len(res["envelope_p50"]), 50)
        self.assertEqual(len(res["envelope_p95"]), 50)
        self.assertGreaterEqual(res["liquidity_vacuum_frequency_pct"], 0.0)
        self.assertGreater(res["worst_case_drawdown_pct"], 0.0)

    # ── 2. Entangled Quantum Photonic OMS (CV-QKD) Tests ──
    def test_entangled_qkd_sync_normal(self):
        order = {"order_id": "ORD-QKD-01", "ticker": "RELIANCE", "notional": 2000000.0}
        qkd = self.engine.simulate_entangled_qkd_sync(order)
        self.assertEqual(qkd["order_id"], "ORD-QKD-01")
        self.assertGreater(qkd["quantum_fidelity"], 0.9990)
        self.assertFalse(qkd["eavesdrop_detected"])
        self.assertEqual(qkd["channel_status"], "SECURE_ENTANGLED_LOCK")
        self.assertEqual(qkd["sync_latency_picoseconds"], 0.85)

    def test_entangled_qkd_eavesdropping_wavefunction_collapse(self):
        order = {"order_id": "ORD-QKD-HACK", "ticker": "NIFTY_FUT", "notional": 5000000.0}
        qkd = self.engine.simulate_entangled_qkd_sync(order, force_eavesdrop=True)
        self.assertTrue(qkd["eavesdrop_detected"])
        self.assertLess(qkd["quantum_fidelity"], 0.9990)
        self.assertGreater(qkd["wavefunction_collapse_entropy_delta_s"], 0.5)
        self.assertEqual(qkd["channel_status"], "COMPROMISED_CHANNEL_DROPPED")

    def test_qkd_mesh_nodes_and_attack_simulation(self):
        nodes = self.engine.entangled_qkd.get_quantum_mesh_nodes()
        self.assertEqual(nodes["mesh_status"], "ACTIVE_ENTANGLED_PHOTONIC_FABRIC")
        self.assertGreaterEqual(len(nodes["global_nodes"]), 6)
        self.assertEqual(nodes["carrier_wavelength_nm"], 1550.12)

        attack = self.engine.entangled_qkd.simulate_eavesdropping_attack("NSE-NY4-LINK")
        self.assertTrue(attack["eavesdrop_detected"])
        self.assertEqual(attack["compromised_channel"], "NSE-NY4-LINK")
        self.assertIn("REROUTE", attack["action_taken"])

    # ── 3. Carbon Nanotube Molecular Execution Fabric (CNT-EMS) Tests ──
    def test_cnt_order_execution_sub_picosecond(self):
        order = {"order_id": "ORD-CNT-88", "ticker": "TCS", "notional": 750000.0, "side": "BUY"}
        exec_res = self.engine.execute_order_cnt_fabric(order)
        self.assertEqual(exec_res["ticker"], "TCS")
        self.assertEqual(exec_res["execution_status"], "EXECUTED_SUB_PICOSECOND_CNT_FABRIC")
        self.assertLess(exec_res["gate_delay_per_stage_ps"], 1.2)
        self.assertGreater(exec_res["ballistic_transport_efficiency_pct"], 99.0)
        self.assertGreater(exec_res["switching_energy_dissipated_attojoules"], 0.0)

    def test_cnt_hardware_telemetry(self):
        telemetry = self.engine.cnt_execution.get_cnt_hardware_telemetry()
        self.assertEqual(telemetry["semiconductor_technology"], "CNT-FET (Carbon Nanotube Field-Effect Transistor)")
        self.assertLess(telemetry["thermal_dissipation_watts"], 1.0)
        self.assertEqual(telemetry["silicon_baseline_dissipation_watts"], 85.0)
        self.assertEqual(telemetry["cnt_diameter_nanometers"], 0.8)

    # ── 4. Constitutional AI Autonomous Governance Tests ──
    def test_constitutional_guardrail_approval(self):
        # A compliant order (notional 500,000 <= 800,000 cap on 10M AUM, VaR 80,000 <= 200,000 limit, spoof 0.0001)
        valid_order = {
            "ticker": "INFY",
            "notional": 500000.0,
            "estimated_var": 80000.0,
            "spoofing_score": 0.0001,
            "aml_score": 1.0,
            "gross_leverage": 1.0,
        }
        eval_res = self.engine.evaluate_constitutional_ai_guardrails(valid_order)
        self.assertTrue(eval_res["constitutional_approval"])
        self.assertEqual(eval_res["formal_proof_bound"]["probability_of_regulatory_breach"], 0.0)
        self.assertEqual(eval_res["action"], "EXECUTE_VIA_CNT_EMS")
        self.assertEqual(len(eval_res["rejection_reasons"]), 0)

    def test_constitutional_guardrail_rejection_and_self_heal(self):
        # A breaching order (notional 2,500,000 > 800,000 cap, VaR 450,000 > 200,000 limit, spoof 0.005 > 0.001)
        breach_order = {
            "ticker": "HIGH_RISK_ASSET",
            "notional": 2500000.0,
            "estimated_var": 450000.0,
            "spoofing_score": 0.005,
            "aml_score": 0.95,
            "gross_leverage": 2.2,
        }
        eval_res = self.engine.evaluate_constitutional_ai_guardrails(breach_order)
        self.assertFalse(eval_res["constitutional_approval"])
        self.assertEqual(eval_res["action"], "HALT_AND_SELF_HEAL")
        self.assertGreater(eval_res["formal_proof_bound"]["probability_of_regulatory_breach"], 0.0)
        self.assertGreater(len(eval_res["rejection_reasons"]), 2)

        # Trigger self-healing compiler
        healing = self.engine.constitutional_governance.compile_self_healing_gradient(
            violation_penalties=eval_res["violation_penalties"], lambda_const=150.0
        )
        self.assertEqual(healing["status"], "SELF_HEALING_GRADIENT_COMPILED")
        self.assertGreater(healing["gradient_norm"], 0.0)
        self.assertIn("position_cap_adjustment", healing["remedial_weight_delta"])

    def test_unified_singularity_pipeline(self):
        # 1. Valid order passes entire pipeline
        good_order = {
            "order_id": "ORD-PIPE-GOOD",
            "ticker": "HDFCBANK",
            "notional": 600000.0,
            "estimated_var": 90000.0,
            "spoofing_score": 0.0001,
        }
        pipe_res = self.engine.run_full_singularity_pipeline(good_order)
        self.assertEqual(pipe_res["execution_status"], "EXECUTED_SUCCESSFULLY")
        self.assertTrue(pipe_res["constitutional_check"]["constitutional_approval"])
        self.assertEqual(pipe_res["fix_zerodha_gateway"]["status"], "DISPATCHED_TO_EXCHANGE")
        self.assertTrue(pipe_res["fix_zerodha_gateway"]["cryptographic_audit_hash"].startswith("0x"))

        # 2. Bad order halted by constitutional checks
        bad_order = {
            "order_id": "ORD-PIPE-BAD",
            "ticker": "HDFCBANK",
            "notional": 5000000.0,
            "estimated_var": 800000.0,
            "spoofing_score": 0.05,
        }
        pipe_bad = self.engine.run_full_singularity_pipeline(bad_order)
        self.assertEqual(pipe_bad["execution_status"], "HALTED_AND_SELF_HEAL")
        self.assertEqual(pipe_bad["fix_zerodha_gateway"]["status"], "HALTED_PRE_TRADE_BLOCKED")

    # ── 5. FastAPI REST Integration Tests (Direct Handler Invocation) ──
    def test_fastapi_v35_endpoints(self):
        # 1. Singularity Universe Generation & Multiverse
        res_univ = generate_synthetic_singularity_universe(
            SyntheticUniverseRequest(n_timesteps=60, shock_intensity=2.5, scenario_type="LIQUIDITY_VACUUM")
        )
        self.assertEqual(res_univ["timesteps"], 60)
        self.assertIn("synthetic_price_path", res_univ)

        res_mv = run_singularity_multiverse_monte_carlo(
            MultiverseMonteCarloRequest(n_universes=5, n_timesteps=40, shock_intensity=2.0)
        )
        self.assertEqual(res_mv["n_universes"], 5)
        self.assertEqual(len(res_mv["envelope_p50"]), 40)

        # 2. QKD Sync, Nodes & Attack
        res_sync = simulate_qkd_sync(
            QKDSyncRequest(order_id="ORD-API-QKD", ticker="SBIN", notional=1200000.0)
        )
        self.assertEqual(res_sync["channel_status"], "SECURE_ENTANGLED_LOCK")

        res_nodes = get_qkd_mesh_nodes()
        self.assertGreater(len(res_nodes["global_nodes"]), 0)

        res_attack = simulate_qkd_attack(QKDAttackRequest(channel_id="NSE-NY4-LINK"))
        self.assertTrue(res_attack["eavesdrop_detected"])

        # 3. CNT Order Execution & Telemetry
        res_cnt = execute_order_cnt(
            CNTSimulationRequest(order_id="CNT-API-1", ticker="WIPRO", notional=400000.0, side="SELL")
        )
        self.assertEqual(res_cnt["execution_status"], "EXECUTED_SUB_PICOSECOND_CNT_FABRIC")

        res_telem = get_cnt_telemetry()
        self.assertEqual(res_telem["nanotube_chirality"], "(10, 0) Semiconducting Single-Walled Nanotube")

        # 4. Constitutional AI Evaluation, Axioms & Self-Heal
        res_eval = evaluate_constitutional_guardrails(
            ConstitutionalEvalRequest(
                ticker="BAJFINANCE",
                notional=450000.0,
                estimated_var=70000.0,
                spoofing_score=0.0001,
            )
        )
        self.assertTrue(res_eval["constitutional_approval"])

        res_axioms = get_constitutional_axioms()
        self.assertEqual(len(res_axioms["axioms"]), 5)

        res_heal = compile_constitutional_self_healing(
            ConstitutionalSelfHealRequest(
                violation_penalties={"position_cap_violation": 0.05, "var_limit_violation": 50000.0},
                lambda_const=100.0,
            )
        )
        self.assertEqual(res_heal["status"], "SELF_HEALING_GRADIENT_COMPILED")

        # 5. Singularity Pipeline Execution & System Summary
        res_pipe = run_singularity_pipeline(
            SingularityPipelineRequest(ticker="TCS", notional=400000.0, estimated_var=50000.0)
        )
        self.assertEqual(res_pipe["execution_status"], "EXECUTED_SUCCESSFULLY")

        res_sum = get_v35_system_summary()
        self.assertEqual(res_sum["version"], "v35")
        self.assertIn("synthetic_singularity_world_model", res_sum["modules"])


if __name__ == "__main__":
    unittest.main()

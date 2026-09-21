"""
test_v14_e2e.py
End-to-End integration test suite for all 5 v14 sovereign engines:
1. High-Frequency L3 Graph Attention Network (L3-GAT) Micro-Price Engine
2. Quantum VQE Covariance Decomposition & Non-Gaussian Tail Risk
3. Automated Basel IV Liquidity & Regulatory Engine (NSFR / LCR / Form PF)
4. Multi-Agent Deep Deterministic Policy Gradient (MADDPG) Execution Router
5. Zero-Knowledge zk-SNARK OTC Collateral Vault & ISDA SIMM Margin Engine
"""
from __future__ import annotations

import sys
import os

# Add backend directory to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.l3_gat_microprice import L3OrderBookGraphEngine
from app.quantum_vqe_risk import QuantumVQECovarianceEngine
from app.basel_iv_engine import BaselIVRegulatoryEngine
from app.maddpg_execution import MADDPGExecutionRouter
from app.zk_collateral_vault import ZKCollateralVaultEngine


def test_v14_engines():
    print("=== Testing 1. L3 Graph Attention Network (L3-GAT) Micro-Price Engine ===")
    l3_engine = L3OrderBookGraphEngine(ticker="RELIANCE")
    pred = l3_engine.predict_microprice_dynamics(mid_price=2980.0, spread_bps=3.5, imbalance_bias=0.25)
    assert pred["status"] == "OPTIMAL", f"L3 GAT failed: {pred}"
    assert "gat_micro_price" in pred
    assert "graph_attention_weights" in pred
    stream = l3_engine.simulate_tick_stream(steps=10)
    assert len(stream["stream"]) == 10
    print(f"L3-GAT OK! Direction: {pred['predicted_direction']} GAT Micro-Price: INR {pred['gat_micro_price']} Latency: {pred['inference_latency_us']}us")

    print("\n=== Testing 2. Quantum VQE Covariance & Non-Gaussian Tail Risk ===")
    vqe_engine = QuantumVQECovarianceEngine(max_iter=30)
    vqe_res = vqe_engine.run_vqe_portfolio_risk_analysis(vol_regime=0.18, fat_tail_kurtosis=4.8)
    assert vqe_res["status"] == "VQE_CONVERGED", f"VQE failed: {vqe_res}"
    assert len(vqe_res["optimized_weights"]) == 6
    assert "cornish_fisher_var_99_1d_pct" in vqe_res["non_gaussian_moments"]
    print(f"Quantum VQE OK! Ann Vol: {vqe_res['annualized_vol_pct']}% Variance Reduction: {vqe_res['variance_reduction_pct']}% CF-VaR (99%): {vqe_res['non_gaussian_moments']['cornish_fisher_var_99_1d_pct']}%")

    print("\n=== Testing 3. Basel IV Liquidity & Regulatory Engine ===")
    basel_engine = BaselIVRegulatoryEngine()
    report = basel_engine.get_full_regulatory_report()
    assert report["overall_compliance"] == "PASS", f"Basel IV report failed: {report}"
    assert report["lcr_report"]["lcr_percentage"] >= 100.0
    assert report["nsfr_report"]["nsfr_percentage"] >= 100.0
    stress = basel_engine.run_liquidity_stress_test(scenario="SOVEREIGN_WHOLESALE_RUN", outflow_multiplier=1.35)
    assert "stressed_lcr_pct" in stress
    print(f"Basel IV OK! LCR: {report['lcr_report']['lcr_percentage']}% NSFR: {report['nsfr_report']['nsfr_percentage']}% Stressed Survival: {stress['estimated_survival_horizon_days']} days")

    print("\n=== Testing 4. MADDPG Multi-Agent Execution Router ===")
    maddpg_engine = MADDPGExecutionRouter(ticker="RELIANCE", parent_order_size=50000, benchmark_price=2980.0)
    route = maddpg_engine.evaluate_multi_agent_route(remaining_quantity=50000, vpin_toxicity=0.68)
    assert route["status"] == "OPTIMAL_MULTI_AGENT_ROUTING", f"MADDPG route failed: {route}"
    assert len(route["actor_agents"]) == 3
    assert route["centralized_critic_evaluation"]["alpha_preserved_savings_bps"] >= 0.0
    episode = maddpg_engine.simulate_execution_episode(steps=15, initial_vpin=0.62)
    assert episode["status"] == "EPISODE_COMPLETED"
    print(f"MADDPG OK! Blended Slippage: {route['centralized_critic_evaluation']['blended_maddpg_slippage_bps']} bps Savings: INR {episode['final_cumulative_savings_inr']}")

    print("\n=== Testing 5. zk-SNARK OTC Collateral Vault & ISDA SIMM ===")
    zk_engine = ZKCollateralVaultEngine()
    simm = zk_engine.calculate_isda_simm_margin(interest_rate_delta_usd=12500000.0, fx_delta_usd=8500000.0)
    assert "total_initial_margin_usd" in simm
    proof = zk_engine.generate_groth16_proof(required_margin_usd=simm["total_initial_margin_usd"], collateral_asset_class="UST_TREASURY")
    assert proof["protocol_version"] == "zkSNARK-Groth16-v1"
    verify_res = zk_engine.verify_groth16_proof(proof)
    assert verify_res["is_valid"] is True, f"zk-SNARK verification failed: {verify_res}"
    vault = zk_engine.get_vault_status()
    assert vault["vault_status"] == "OPERATIONAL_ZK_PROTECTED"
    print(f"zk-SNARK Collateral OK! ISDA SIMM IM: ${simm['total_initial_margin_usd']:.2f} Proof Verified: {verify_res['is_valid']} in {verify_res['verification_time_ms']}ms")

    print("\n" + "=" * 55)
    print("ALL 5 v14 SOVEREIGN BACKEND ENGINES VERIFIED 100% SUCCESFULLY!")
    print("=" * 55)


if __name__ == "__main__":
    test_v14_engines()

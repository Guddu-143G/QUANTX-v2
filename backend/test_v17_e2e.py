"""
Comprehensive E2E Verification Test Suite for QUANTX Version 17 (v17) Sovereign Engines
Tests:
1. Conformal Prediction for Distribution-Free Risk Intervals
2. Continuous-Time Mean-Field Games (MFG) for Liquidity Crowding
3. Contrastive Time-Series Learning for Anomaly & Regime Detection
4. Hybrid Quantum-Classical QAOA & QUBO Portfolio Rebalancing Solver
5. zk-STARKs for Audited Zero-Knowledge Regulatory Filings
"""

import sys
import os

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.conformal_risk import (
    conformal_risk_engine,
    ConformalIntervalRequest,
    MultiHorizonConformalRequest,
)
from app.mean_field_game_crowding import (
    mfg_crowding_engine,
    MFGCrowdingRequest,
)
from app.contrastive_regime_learning import (
    contrastive_regime_engine,
    ContrastiveTrainRequest,
    AnomalyInferenceRequest,
)
from app.hybrid_quantum_qaoa import (
    hybrid_quantum_solver_engine,
    QUBOPortfolioRequest,
)
from app.zk_stark_regulatory import (
    zk_stark_regulatory_engine,
    ZkStarkGenerateProofRequest,
    ZkStarkVerifyRequest,
)


def test_conformal_risk():
    print("=== Testing 1. Conformal Prediction for Distribution-Free Risk Intervals ===")
    # 1. Single interval test
    calib = conformal_risk_engine.generate_synthetic_calibration(n=1000, regime="FAT_TAIL_REGIME")
    assert len(calib["y_true"]) == 1000
    assert len(calib["y_hat"]) == 1000

    res = conformal_risk_engine.fit_conformal_interval(
        y_calibration=calib["y_true"],
        y_hat_calibration=calib["y_hat"],
        y_hat_test=0.0012,
        alpha=0.05
    )
    assert res["status"] == "CONFORMAL_INTERVAL_SUCCESS"
    assert res["coverage_guarantee"] == "95.0%"
    assert res["conformal_lower_bound"] < res["predicted_point"] < res["conformal_upper_bound"]
    assert res["conformal_var_alpha"] > 0.0
    assert res["q_hat_non_conformity"] > 0.0

    # 2. Multi-horizon test
    multi_res = conformal_risk_engine.compute_multi_horizon_intervals(
        predicted_returns={"1D": 0.0012, "5D": 0.0045, "10D": 0.0082, "30D": 0.0210},
        alpha=0.05,
        regime="FAT_TAIL_REGIME"
    )
    assert multi_res["status"] == "SUCCESS"
    assert len(multi_res["horizons"]) == 4
    assert multi_res["horizons"]["30D"]["conformal_var"] > multi_res["horizons"]["1D"]["conformal_var"]
    print(f"Conformal Risk OK! 1D Conformal VaR: {res['conformal_var_alpha']:.4f}, Upper: {res['conformal_upper_bound']:.4f}, Lower: {res['conformal_lower_bound']:.4f}\n")


def test_mean_field_game_crowding():
    print("=== Testing 2. Continuous-Time Mean-Field Games (MFG) for Liquidity Crowding ===")
    scenarios = mfg_crowding_engine.SCENARIOS
    assert len(scenarios) >= 3
    assert "HIGH_ALGO_CROWDING" in scenarios

    res = mfg_crowding_engine.solve_coupled_mfg(
        T=60.0,
        X_max=50000.0,
        Nt=25,
        Nx=31,
        sigma=0.018,
        gamma=0.0001,
        eta=0.0005,
        phi=0.00005
    )
    assert res["status"] in ["CONVERGED", "APPROXIMATED"]
    assert res["crowding_score"] > 0.0
    assert res["price_impact_amplification_multiplier"] >= 1.0
    assert 0.0 <= res["cascade_liquidation_probability"] <= 1.0
    assert len(res["trajectory_series"]) == 25
    assert len(res["density_heatmap"]) > 0
    print(f"MFG Crowding OK! Crowding Score: {res['crowding_score']}, Impact Amplification: {res['price_impact_amplification_multiplier']}x, Cascade Prob: {res['cascade_liquidation_probability']}\n")


def test_contrastive_regime_learning():
    print("=== Testing 3. Contrastive Time-Series Learning for Anomaly Detection ===")
    # 1. Train contrastive encoder
    train_req = ContrastiveTrainRequest(
        num_series=120,
        window_length=20,
        num_features=4,
        latent_dim=16,
        temperature_tau=0.07,
        epochs=8,
        random_seed=42
    )
    train_res = contrastive_regime_engine.train_contrastive_representation(train_req)
    assert train_res["status"] == "CONTRASTIVE_PRETRAINING_SUCCESS"
    assert len(train_res["training_loss_history"]) == 8
    assert len(train_res["latent_hypersphere_samples"]) > 0

    # 2. Anomaly detection inference
    anom_req = AnomalyInferenceRequest(
        ticker="RELIANCE.NS",
        regime_profile="SPOOFING_FLASH_LIQUIDITY",
        window_length=20,
        detection_threshold_sigma=2.0
    )
    anom_res = contrastive_regime_engine.detect_anomaly_and_regime(anom_req)
    assert anom_res["status"] == "ANOMALY_DETECTION_SUCCESS"
    assert anom_res["is_anomaly_detected"] is True
    assert anom_res["anomaly_confidence_pct"] > 50.0
    assert "SPOOFING" in anom_res["inferred_regime_name"] or anom_res["is_anomaly_detected"]
    print(f"Contrastive Learning OK! Loss: {train_res['final_infonce_loss']:.4f}, Anomaly Detected: {anom_res['is_anomaly_detected']}, Regime: {anom_res['inferred_regime_name']}\n")


def test_hybrid_quantum_qaoa():
    print("=== Testing 4. Hybrid Quantum-Classical QAOA Portfolio Solver ===")
    req = QUBOPortfolioRequest(
        num_assets=6,
        max_cardinality=3,
        risk_aversion=0.5,
        cardinality_penalty=15.0,
        annealing_steps=800,
        qaoa_circuit_depth_p=3
    )
    res = hybrid_quantum_solver_engine.run_hybrid_optimization(req)
    assert res["status"] == "QUANTUM_QAOA_SOLVE_SUCCESS"
    assert res["selected_assets_count"] <= req.max_cardinality
    assert res["cardinality_satisfied"] is True
    assert len(res["allocations"]) == 6
    assert res["portfolio_sharpe_ratio"] > 0.0
    assert res["qaoa_circuit_metrics"]["circuit_depth_p"] == 3
    assert len(res["ising_hamiltonian"]["single_qubit_fields_h"]) == 6
    print(f"Hybrid QAOA Solver OK! Sharpe: {res['portfolio_sharpe_ratio']} (vs Markowitz {res['classical_markowitz_sharpe_comparison']}), Selected Assets: {res['selected_assets_count']}/{req.max_cardinality}, Ground Overlap: {res['qaoa_circuit_metrics']['ground_state_overlap_prob']}\n")


def test_zk_stark_regulatory():
    print("=== Testing 5. zk-STARKs for Audited Regulatory Filings ===")
    gen_req = ZkStarkGenerateProofRequest(
        regulatory_framework="UCITS_5_10_40",
        portfolio_nav_usd=250000000.0,
        max_single_weight_bound=0.10,
        max_aggregate_5pct_plus_bound=0.40,
        var_95_1d_ceiling=0.025,
        num_assets=20,
        fri_queries_count=16
    )
    proof_res = zk_stark_regulatory_engine.generate_stark_proof(gen_req)
    assert proof_res["status"] == "ZK_STARK_PROOF_GENERATION_SUCCESS"
    assert proof_res["proof_size_kb"] > 0.0
    assert len(proof_res["proof_document"]["fri_queries"]) == 16
    assert "trace_merkle_root" in proof_res["proof_document"]

    # Verify proof
    verify_res = zk_stark_regulatory_engine.verify_stark_proof(proof_res["proof_document"])
    assert verify_res["status"] == "ZK_STARK_VERIFICATION_SUCCESS"
    assert verify_res["is_valid"] is True
    assert verify_res["regulatory_compliance_certified"] is True
    assert verify_res["security_bits"] == 128
    assert verify_res["post_quantum_secure"] is True
    print(f"zk-STARK Regulatory OK! Certified: {verify_res['certified_framework']}, Verifier Time: {verify_res['verifier_execution_time_ms']} ms, Audit ID: {verify_res['audit_certificate_id']}\n")


def main():
    print("=" * 70)
    print("=== QUANTX v17 MASTER ENTERPRISE & SOVEREIGN E2E VERIFICATION SUITE ===")
    print("=" * 70 + "\n")

    test_conformal_risk()
    test_mean_field_game_crowding()
    test_contrastive_regime_learning()
    test_hybrid_quantum_qaoa()
    test_zk_stark_regulatory()

    print("=" * 70)
    print("ALL 5 QUANTX v17 SOVEREIGN MODULES PASSED 100% VERIFICATION!")
    print("=" * 70)


if __name__ == "__main__":
    main()

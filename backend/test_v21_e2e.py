"""
QUANTX v21 Enterprise Data-Aware Model Orchestrator & Purged Cross-Validation
Comprehensive End-to-End Test Suite
"""

import sys
import os
import pandas as pd
import numpy as np

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.model_orchestrator_engine import (
    DataQualityGate,
    PurgedGroupTimeSeriesSplit,
    FactorOrthogonalizer,
    PopulationStabilityIndex,
    QuantXModelOrchestrator,
    TrainModelRequest,
    EvaluateDriftRequest,
    PromoteChallengerRequest,
    DataQualityCheckRequest,
)
from app.main import (
    get_orchestrator_telemetry,
    list_orchestrator_models,
    get_champion_model,
    get_challenger_model,
    evaluate_model_drift,
    compare_shadow_challenger,
    train_model_pipeline,
    promote_challenger_model,
    check_data_quality_gate,
)


def test_v21_e2e():
    print("\n" + "=" * 80)
    print("=== RUNNING QUANTX v21 MODEL ORCHESTRATOR & PURGED TRAINING E2E SUITE ===")
    print("=" * 80)

    # --------------------------------------------------------------------------
    # 1. Bi-Temporal Data Quality Gate
    # --------------------------------------------------------------------------
    print("\n[+] 1. Testing 3-Point Data Quality Gate...")
    # 1a. Valid Dataset
    valid_dates = pd.date_range("2025-01-01", periods=90, freq="B")
    valid_prices = 24000.0 + np.cumsum(np.random.normal(10, 100, 90))
    df_valid = pd.DataFrame({"date": valid_dates, "price": valid_prices})
    res_valid = DataQualityGate.validate_dataset(df_valid)
    print(f"    -> Valid Dataset Check: valid={res_valid['is_valid']}, violations={res_valid['violations']}")
    assert res_valid["is_valid"] is True
    assert res_valid["checks"]["date_continuity"]["unique_trading_dates"] == 90
    assert res_valid["checks"]["stale_feed_check"]["passed"] is True
    assert res_valid["checks"]["outlier_zscore_check"]["outlier_count"] == 0

    # 1b. Violation 1: Insufficient dates (< 60)
    short_dates = pd.date_range("2025-01-01", periods=30, freq="B")
    df_short = pd.DataFrame({"date": short_dates, "price": np.full(30, 24000.0)})
    res_short = DataQualityGate.validate_dataset(df_short)
    print(f"    -> Short Dates Check: valid={res_short['is_valid']}, violations={res_short['violations']}")
    assert res_short["is_valid"] is False
    assert any("DATE_CONTINUITY_INSUFFICIENT" in v for v in res_short["violations"])

    # 1c. Violation 2: Stale Prices
    stale_dates = pd.date_range("2025-01-01", periods=70, freq="B")
    df_stale = pd.DataFrame({"date": stale_dates, "price": np.full(70, 25000.0)})
    res_stale = DataQualityGate.validate_dataset(df_stale)
    print(f"    -> Stale Prices Check: valid={res_stale['is_valid']}, violations={res_stale['violations']}")
    assert res_stale["is_valid"] is False
    assert any("STALE_PRICE_FLOW_DETECTED" in v for v in res_stale["violations"])

    # 1d. Violation 3: Outliers (|Z| > 4.5)
    outlier_prices = valid_prices.copy()
    outlier_prices[45] = outlier_prices[45] * 2.5  # Extreme spike
    df_outlier = pd.DataFrame({"date": valid_dates, "price": outlier_prices})
    res_outlier = DataQualityGate.validate_dataset(df_outlier)
    print(f"    -> Outlier Detection Check: valid={res_outlier['is_valid']}, violations={res_outlier['violations']}")
    assert res_outlier["is_valid"] is False
    assert any("EXTREME_ROLLING_OUTLIER" in v for v in res_outlier["violations"])
    print("    [PASS] Data Quality Gate conforms strictly to specs.")

    # --------------------------------------------------------------------------
    # 2. Purged and Embargoed Group Time-Series CV
    # --------------------------------------------------------------------------
    print("\n[+] 2. Testing Purged & Embargoed Cross-Validation (Marcos López de Prado)...")
    n_samples = 200
    dates = pd.date_range("2025-01-01", periods=n_samples, freq="B")
    df_cv = pd.DataFrame({
        "date": dates,
        "feature_1": np.random.normal(0, 1, n_samples),
        "target": np.random.normal(0.001, 0.02, n_samples),
    })

    splitter = PurgedGroupTimeSeriesSplit(n_splits=5, purge_window=5, embargo_window=10)
    splits = splitter.split(df_cv, group_col="date")
    summary = splitter.get_summary(total_samples=n_samples)

    assert len(splits) == 5
    for fold_idx, (train_idx, test_idx) in enumerate(splits):
        print(f"    -> Fold {fold_idx}: Train={len(train_idx)}, Test={len(test_idx)}")
        # Verify no intersection between train and test
        assert len(set(train_idx).intersection(set(test_idx))) == 0
        test_start = min(test_idx)
        test_end = max(test_idx)
        # Verify purge window before test is not in train
        purged_before = set(range(max(0, test_start - 5), test_start))
        assert len(set(train_idx).intersection(purged_before)) == 0
        # Verify embargo window after test is not in train
        embargoed_after = set(range(test_end + 1, min(n_samples, test_end + 1 + 10)))
        assert len(set(train_idx).intersection(embargoed_after)) == 0

    print("    [PASS] Purged K-Fold CV guarantees strict information leakage prevention.")

    # --------------------------------------------------------------------------
    # 3. Factor Sequential Orthogonalization (Gram-Schmidt)
    # --------------------------------------------------------------------------
    print("\n[+] 3. Testing Gram-Schmidt Sequential Factor Orthogonalization...")
    orthogonalizer = FactorOrthogonalizer()
    corr_factor1 = np.random.normal(0, 1, 100)
    corr_factor2 = 0.85 * corr_factor1 + 0.15 * np.random.normal(0, 1, 100)  # High collinearity
    corr_factor3 = -0.6 * corr_factor1 + 0.4 * np.random.normal(0, 1, 100)
    factor_df = pd.DataFrame({"f1": corr_factor1, "f2": corr_factor2, "f3": corr_factor3})

    initial_corr = factor_df.corr().iloc[0, 1]
    print(f"    -> Initial Pearson correlation (f1, f2): {initial_corr:.4f}")

    orth_df, residual_vars = orthogonalizer.orthogonalize(factor_df)
    final_corr = orth_df.corr().iloc[0, 1]
    print(f"    -> Orthogonalized Pearson correlation (f1, f2): {final_corr:.6f}")
    print(f"    -> Residual variance retentions: {residual_vars}")

    assert abs(final_corr) < 1e-2, f"Orthogonal vectors must have ~0 correlation, got {final_corr}"
    assert all(var > 0.0 for var in residual_vars.values())
    print("    [PASS] Gram-Schmidt Factor Orthogonalization successfully purged multicollinearity.")

    # --------------------------------------------------------------------------
    # 4. Population Stability Index (PSI) Drift Monitor
    # --------------------------------------------------------------------------
    print("\n[+] 4. Testing Population Stability Index (PSI) Drift Engine...")
    base_dist = np.random.normal(0.0, 1.0, 1000)
    similar_dist = np.random.normal(0.02, 1.02, 1000)
    drifted_dist = np.random.normal(0.85, 1.6, 1000)

    # 4a. Stable distribution
    stable_res = PopulationStabilityIndex.calculate_psi(base_dist, similar_dist)
    stable_psi = stable_res["psi_score"]
    stable_status = stable_res["status"]
    print(f"    -> Stable PSI: {stable_psi:.4f} (Status: {stable_status})")
    assert stable_psi < 0.10
    assert stable_status == "STABLE"

    # 4b. Drifted distribution
    drift_res = PopulationStabilityIndex.calculate_psi(base_dist, drifted_dist)
    drift_psi = drift_res["psi_score"]
    drift_status = drift_res["status"]
    print(f"    -> Drifted PSI: {drift_psi:.4f} (Status: {drift_status})")
    assert drift_psi >= 0.10
    assert drift_status in ["WARNING", "CRITICAL_DRIFT"]
    print("    [PASS] PSI Drift surveillance accurately categorizes regime distribution shifts.")

    # --------------------------------------------------------------------------
    # 5. FastAPI Endpoints & Model Orchestrator Pipeline
    # --------------------------------------------------------------------------
    print("\n[+] 5. Testing FastAPI v21 Endpoints & Orchestrator Operations...")

    # 5a. Telemetry
    telemetry = get_orchestrator_telemetry()
    print(f"    -> Telemetry Status: {telemetry['status']}, Cluster: {telemetry['cluster_status']}")
    print(f"    -> Registered Models: {telemetry['registered_models_count']}")
    assert telemetry["status"] == "ACTIVE"
    assert telemetry["champion"] is not None
    assert telemetry["challenger"] is not None

    # 5b. Models List
    models = list_orchestrator_models()
    print(f"    -> Models in Registry: {len(models)}")
    assert len(models) >= 2

    # 5c. Champion & Challenger
    champ = get_champion_model()
    chall = get_challenger_model()
    print(f"    -> Active Champion: {champ['name']} (Sharpe: {champ['sharpe_ratio']}, VaR: {champ['var_95_1d_pct']}%)")
    print(f"    -> Active Challenger: {chall['name']} (Sharpe: {chall['sharpe_ratio']}, VaR: {chall['var_95_1d_pct']}%)")
    assert champ["stage"] == "champion"
    assert chall["stage"] == "challenger"

    # 5d. Shadow Comparison
    comparison = compare_shadow_challenger()
    print(f"    -> Shadow Comparison: {comparison['status']}, Sharpe Delta: {comparison['sharpe_improvement_pct']:+.2f}%")
    print(f"    -> Decision: {comparison['decision']}")
    assert "sharpe_improvement_pct" in comparison
    assert "var_compliance" in comparison

    # 5e. Drift Evaluation
    drift_eval = evaluate_model_drift(EvaluateDriftRequest(model_id=champ["model_id"]))
    print(f"    -> Drift Eval: Model={drift_eval['model_id']}, Overall PSI={drift_eval['overall_psi']}, Status={drift_eval['drift_status']}")
    assert "feature_psi_breakdown" in drift_eval

    # 5f. Train Model Pipeline (Simulated Ray Cluster)
    print("\n[+] 6. Simulating Distributed Purged K-Fold Training Pipeline...")
    train_res = train_model_pipeline(
        TrainModelRequest(
            model_name="E2E-DeepAlpha-Ray-Worker",
            n_splits=5,
            purge_window=5,
            embargo_window=10,
        )
    )
    print(f"    -> Training Status: {train_res['status']}")
    print(f"    -> New Model ID: {train_res['model_id']}")
    print(f"    -> Mean Out-of-Sample Sharpe: {train_res['mean_out_of_sample_sharpe']}")
    print(f"    -> Folds: {train_res['fold_sharpes']}")
    assert train_res["status"] == "SUCCESS"
    assert len(train_res["fold_sharpes"]) == 5

    # 5g. Promote Challenger
    print("\n[+] 7. Testing Champion Promotion Gate...")
    promote_res = promote_challenger_model(PromoteChallengerRequest(challenger_id=chall["model_id"]))
    print(f"    -> Promotion Result: {promote_res['status']}")
    print(f"    -> New Champion: {promote_res['promoted_model_name']}")
    assert promote_res["status"] == "SUCCESS"
    new_champ = get_champion_model()
    assert new_champ["model_id"] == chall["model_id"]

    # 5h. Data Quality Gate Endpoint
    dq_res = check_data_quality_gate(DataQualityCheckRequest(symbol="NIFTY_50"))
    print(f"    -> Feature Ingestion Gate Check: Valid={dq_res['is_valid']}, Checks={list(dq_res['checks'].keys())}")
    assert dq_res["is_valid"] is True

    print("\n" + "=" * 80)
    print(">>> ALL QUANTX v21 E2E TESTS PASSED WITH 100% SPEC CONFORMANCE <<<")
    print("=" * 80)


if __name__ == "__main__":
    test_v21_e2e()

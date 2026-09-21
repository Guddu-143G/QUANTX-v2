"""
Comprehensive E2E Verification Test Suite for QUANTX Version 16 (v16) Sovereign Engines
Tests:
1. Transformer-SDE Generative Market World Model
2. Neuromorphic Event-Driven Microstructure Processing (SNN)
3. Topological Data Analysis (TDA) for Financial Crash Early Warning
4. Zero-Knowledge RWA Fractional Collateral Vaults (zk-RWA)
5. Multi-Agent Game-Theoretic Differential Execution Solvers
"""

import sys
import os

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.transformer_sde_world_model import (
    transformer_sde_engine,
    SDERolloutRequest,
    MacroConditioningVector,
)
from app.neuromorphic_snn_engine import (
    neuromorphic_snn_engine,
    ITCHTickEvent,
)
from app.tda_crash_warning import (
    tda_crash_engine,
    CorrelationMatrixInput,
)
from app.zk_rwa_vault import (
    zk_rwa_engine,
    MintZkRWAVaultRequest,
)
from app.differential_game_solver import (
    differential_game_solver_engine,
    DiffGameSolveRequest,
)


def test_transformer_sde_world_model():
    print("=== Testing 1. Transformer-SDE Generative Market World Model ===")
    scenarios = transformer_sde_engine.get_scenarios()
    assert len(scenarios) >= 4
    assert any(s["key"] == "HAWKISH_CENTRAL_BANK_RATE_SHOCK" for s in scenarios)

    req = SDERolloutRequest(
        scenario_key="HAWKISH_CENTRAL_BANK_RATE_SHOCK",
        num_trajectories=200,
        time_horizon_days=20,
        discretization_steps=30,
        total_portfolio_value_usd=10000000.0,
        macro_action=MacroConditioningVector(
            rate_hike_bps=250.0,
            liquidity_drain_billion_usd=180.0,
            geopolitical_risk_index=75.0,
            cpi_inflation_surprise_pct=1.4,
            algorithmic_order_shock_pct=-5.0,
        ),
    )
    res = transformer_sde_engine.run_counterfactual_rollout(req)
    assert res.status == "SDE_ROLLOUT_SUCCESS"
    assert res.num_trajectories == 200
    assert len(res.asset_projections) == 6
    assert len(res.trajectory_percentiles) == 20
    assert res.portfolio_stressed_var_95_usd > 0.0
    assert res.portfolio_stressed_var_99_usd >= res.portfolio_stressed_var_95_usd
    assert res.latent_space_dimensions["state_dim_d"] == 32
    print(
        f"Transformer-SDE OK! Exp PnL: ${res.expected_portfolio_pnl_usd:,.2f}, "
        f"99% VaR: ${res.portfolio_stressed_var_99_usd:,.2f}, Max DD: {res.max_portfolio_drawdown_pct}%\n"
    )


def test_neuromorphic_snn_engine():
    print("=== Testing 2. Neuromorphic SNN Microstructure Engine ===")
    event = ITCHTickEvent(
        event_type="ADD_ORDER",
        ticker="RELIANCE.NS",
        side="BUY",
        price=2982.50,
        shares=800,
        order_id=98741029,
        timestamp_ns=1773336000000000,
    )
    inf = neuromorphic_snn_engine.process_tick(event)
    assert inf.status == "SNN_INFERENCE_SUB_MICROSECOND_SUCCESS"
    assert inf.inference_latency_ns < 1000.0  # Sub-microsecond (<1000ns)
    assert inf.neuromorphic_energy_pj > 0.0
    assert inf.energy_efficiency_gain_x > 1000.0
    assert len(inf.active_neurons) > 0

    # Stream simulation
    stream_res = neuromorphic_snn_engine.simulate_stream(ticker="RELIANCE.NS", num_events=30)
    assert stream_res.status == "SNN_STREAM_SIMULATION_SUCCESS"
    assert stream_res.total_events_processed == 30
    assert stream_res.throughput_mpps > 0.0
    assert len(stream_res.directional_alpha_history) == 30
    print(
        f"Neuromorphic SNN OK! Latency: {inf.inference_latency_ns} ns, "
        f"Energy: {inf.neuromorphic_energy_pj} pJ/spike ({inf.energy_efficiency_gain_x}x gain vs GPU), "
        f"Throughput: {stream_res.throughput_mpps} Mpps\n"
    )


def test_tda_crash_warning():
    print("=== Testing 3. Topological Data Analysis (TDA) Crash Early Warning ===")
    # Test distance metric and Betti numbers
    corr_normal = tda_crash_engine.generate_default_correlation_matrix("NORMAL")
    metrics_normal = tda_crash_engine.estimate_betti_numbers(corr_normal, threshold=0.60)
    assert metrics_normal["betti_0"] >= 1
    assert "topological_entropy" in metrics_normal

    # Test full manifold analysis
    analysis = tda_crash_engine.analyze_manifold(
        CorrelationMatrixInput(threshold_distance=0.60)
    )
    assert analysis.status == "TDA_PERSISTENT_HOMOLOGY_SUCCESS"
    assert len(analysis.filtration_curve) > 0
    assert len(analysis.persistence_barcodes) > 0
    assert analysis.systemic_crash_risk_index >= 0.0

    # Test rolling trajectory
    sim = tda_crash_engine.simulate_rolling_crash_trajectory("2020_LIQUIDITY_CONTRACTION_ANALOGUE")
    assert sim.status == "TDA_ROLLING_SIMULATION_SUCCESS"
    assert len(sim.time_series_indices) == 12
    print(
        f"TDA Crash Warning OK! Betti-0: {analysis.betti_0_connected_components}, "
        f"Betti-1: {analysis.betti_1_cycle_complexity}, Entropy: {analysis.topological_entropy}, "
        f"Systemic Risk Index: {analysis.systemic_crash_risk_index}/100 ({analysis.early_warning_phase})\n"
    )


def test_zk_rwa_collateral_vaults():
    print("=== Testing 4. Zero-Knowledge RWA Fractional Collateral Vaults (zk-RWA) ===")
    assert len(zk_rwa_engine.active_vaults) >= 3
    assert zk_rwa_engine.SCHEMA_JSON["title"] == "ZkRWACollateralVaultContract"

    # Mint new vault
    mint_res = zk_rwa_engine.mint_vault(
        MintZkRWAVaultRequest(
            asset_class="PHYSICAL_GOLD_ALLOCATED",
            nominal_collateral_value_usd=25000000.0,
            required_margin_usd=18000000.0,
            custodian_entity="Brinks Vaults London",
            jurisdiction="UK_COMMON_LAW_TRUST",
        )
    )
    assert mint_res["status"] == "ZK_RWA_VAULT_MINTED_SUCCESS"
    assert mint_res["contract"]["pedersen_commitment_hash"].startswith("0x")
    assert "pi_a" in mint_res["contract"]["zk_proof"]

    # Verify zero-knowledge solvency proof
    ver_res = zk_rwa_engine.verify_contract(mint_res["contract"])
    assert ver_res.status == "ZK_VERIFICATION_COMPLETE"
    assert ver_res.verification_passed is True
    assert ver_res.underlying_portfolio_data_exposed is False
    assert ver_res.audit_hash_sha256.startswith("sha256:")
    print(
        f"zk-RWA Vault OK! Vault: {mint_res['vault_status']['vault_id']}, "
        f"Commitment: {mint_res['contract']['pedersen_commitment_hash'][:20]}..., "
        f"Groth16 Verified: {ver_res.verification_passed} ({ver_res.verification_latency_ms} ms)\n"
    )


def test_differential_game_solver():
    print("=== Testing 5. Multi-Agent Game-Theoretic Differential Execution Solver ===")
    req = DiffGameSolveRequest(
        parent_order_shares=50000.0,
        execution_horizon_seconds=300.0,
        arrival_price=2980.0,
        market_impact_alpha=0.00025,
        predatory_tracking_beta=0.00045,
        risk_aversion_gamma=0.00005,
        execution_urgency_lambda=0.00010,
        volatility_sigma=0.015,
        num_time_steps=20,
    )
    res = differential_game_solver_engine.solve_equilibrium(req)
    assert res.status == "STACKELBERG_DIFFERENTIAL_EQUILIBRIUM_SOLVED"
    assert len(res.trajectory) == 21
    assert res.blended_stackelberg_slippage_bps < res.twap_benchmark_slippage_bps
    assert res.alpha_cost_savings_inr > 0.0
    assert res.predatory_alpha_suppression_pct > 0.0
    print(
        f"Differential Game OK! Stackelberg Slip: {res.blended_stackelberg_slippage_bps} bps vs "
        f"TWAP {res.twap_benchmark_slippage_bps} bps vs Almgren {res.almgren_chriss_slippage_bps} bps, "
        f"Savings: INR {res.alpha_cost_savings_inr:,.2f} ({res.alpha_cost_savings_bps} bps)\n"
    )


if __name__ == "__main__":
    test_transformer_sde_world_model()
    test_neuromorphic_snn_engine()
    test_tda_crash_warning()
    test_zk_rwa_collateral_vaults()
    test_differential_game_solver()
    print("==================================================================")
    print("ALL 5 v16 SOVEREIGN BACKEND ENGINES VERIFIED 100% SUCCESSFULLY!")
    print("==================================================================")

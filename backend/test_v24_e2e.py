"""
test_v24_e2e.py
Institutional E2E Verification Suite for Suggestion v24:
Causal Machine Learning, Spatial-Temporal Graph Neural Networks,
Agentic LLM Reasoning Chains & Sub-Nanosecond Photonic Telemetry.
"""

import sys
import os
import numpy as np

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.causal_agentic_engine import (
    CausalDoCalculusEngine,
    SpatialTemporalGNNEngine,
    AgenticReActCopilot,
    SubNanosecondPTPTelemetry,
    QuantumMPSTensorOptimizer,
    QuantXCausalAgenticOrchestrator,
    causal_agentic_orchestrator,
    DoEffectRequest,
    STGNNContagionRequest,
    ReActVerifyRequest,
    MPSOptimizeRequest,
    CausalPipelineRequest,
)
from app.main import (
    get_causal_telemetry,
    compute_causal_do_effect,
    compute_st_gnn_contagion,
    run_agentic_react_verification,
    optimize_quantum_mps_lots,
    get_ptp_clock_telemetry,
    execute_v24_causal_pipeline,
)


def test_causal_do_calculus():
    print("\n[1/6] Testing Judea Pearl's Do-Calculus & Backdoor/Frontdoor Adjustment...")
    engine = CausalDoCalculusEngine(num_strata=5)

    np.random.seed(42)
    n = 1000
    # Confounder Z (e.g. macro interest rate shock)
    confounder = np.random.normal(0, 1, n)
    # Treatment X confounded by Z
    treatment = 0.5 * confounder + np.random.normal(0, 0.2, n)
    # Outcome Y affected by both Z and X
    outcome = 0.8 * confounder + 0.15 * treatment + np.random.normal(0, 0.1, n)

    # 1. Backdoor adjustment P(Y | do(X = 0.10))
    res_backdoor = engine.compute_backdoor_adjustment(
        treatment_val=0.10,
        treatment_data=treatment,
        confounder_data=confounder,
        outcome_data=outcome,
    )

    assert "causal_effect" in res_backdoor
    assert "observational_correlation" in res_backdoor
    assert "confounding_bias" in res_backdoor
    assert len(res_backdoor["strata_breakdown"]) > 0

    # The observational correlation is inflated due to confounder Z
    print(f"  -> Observational Correlation: {res_backdoor['observational_correlation']:.4f}")
    print(f"  -> Causal Do-Effect: {res_backdoor['causal_effect']:.5f}")
    print(f"  -> Confounding Bias Disentangled: {res_backdoor['confounding_bias']:.5f}")

    # 2. Frontdoor adjustment via mediator M (e.g. liquidity depth)
    mediator = 0.6 * treatment + np.random.normal(0, 0.1, n)
    res_frontdoor = engine.compute_frontdoor_adjustment(
        treatment_val=0.10,
        treatment_data=treatment,
        mediator_data=mediator,
        outcome_data=outcome,
    )
    assert "frontdoor_causal_effect" in res_frontdoor
    assert "mediator_transmission_pct" in res_frontdoor
    print(f"  -> Frontdoor Causal Effect via Mediator: {res_frontdoor['frontdoor_causal_effect']:.5f} (Transmission: {res_frontdoor['mediator_transmission_pct']}%)")


def test_st_gnn_liquidity_contagion():
    print("\n[2/6] Testing Spatial-Temporal Graph Neural Network (ST-GNN) Liquidity Contagion...")
    st_gnn = SpatialTemporalGNNEngine(tickers=["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK"])

    # 1. Test Cross-Quantilogram Adjacency Generation
    np.random.seed(101)
    returns = np.random.normal(0, 0.02, (250, 5))
    # Inject left-tail co-movement between assets 0, 2, 4 (Financials & Energy)
    returns[:20, [0, 2, 4]] -= 0.06
    adj = st_gnn.build_cross_quantilogram_adjacency(returns, quantile_tau=0.05)
    assert adj.shape == (5, 5)
    assert np.all(np.diag(adj) == 0.0), "Adjacency diagonal must be zero"
    print(f"  -> Cross-Quantilogram tail adjacency computed. Mean non-zero edge weight: {np.mean(adj[adj > 0]):.3f}")

    # 2. Test Contagion Propagation with severe OBI shock on HDFCBANK & ICICIBANK
    obi = np.array([-0.2, 0.1, -0.85, 0.05, -0.75])
    vpin = np.array([0.22, 0.15, 0.48, 0.18, 0.44])
    res_contagion = st_gnn.compute_contagion_index(
        adjacency_matrix=adj,
        order_imbalances=obi,
        vpin_vector=vpin,
    )

    assert "mean_systemic_contagion" in res_contagion
    assert "systemic_alert_level" in res_contagion
    assert "asset_contagion_profiles" in res_contagion

    profiles = res_contagion["asset_contagion_profiles"]
    assert "HDFCBANK" in profiles
    assert profiles["HDFCBANK"]["direct_obi"] == -0.85
    print(f"  -> Systemic Alert Level: {res_contagion['systemic_alert_level']}, Mean Contagion: {res_contagion['mean_systemic_contagion']:.4f}")
    print(f"  -> High risk nodes detected: {res_contagion['high_risk_nodes']}")


def test_agentic_react_copilot():
    print("\n[3/6] Testing Agentic ReAct (Reason + Act + Observe + Reflect) Copilot...")
    copilot = AgenticReActCopilot(max_var_limit=1840000.0, single_position_cap=0.12, sector_cap=0.30)

    # Case A: Compliant portfolio
    safe_weights = {
        "RELIANCE": 0.10,
        "TCS": 0.10,
        "HDFCBANK": 0.10,
        "INFY": 0.10,
        "ICICIBANK": 0.10,
        "CASH": 0.50,
    }
    res_safe = copilot.run_react_verification(safe_weights, simulated_var=1250000.0)
    assert res_safe["status"] == "APPROVED"
    assert res_safe["action"] == "EXECUTE_PORTFOLIO_ALLOCATION"
    assert "thought" in res_safe["react_chain"]
    assert "reflection" in res_safe["react_chain"]
    print("  -> Case A (Compliant): APPROVED and verified without modifications.")

    # Case B: Non-compliant portfolio breaching 95% VaR and position caps
    risky_weights = {
        "RELIANCE": 0.25, # Exceeds 12% cap
        "TCS": 0.20,
        "HDFCBANK": 0.30, # Exceeds 12% cap
        "INFY": 0.15,
        "ICICIBANK": 0.10,
    }
    res_risky = copilot.run_react_verification(risky_weights, simulated_var=2450000.0) # Exceeds 18.4 L
    assert res_risky["status"] == "MODIFIED_BY_AGENT"
    assert res_risky["action"] == "APPLY_SELF_REFLECTION_SCALING"
    assert len(res_risky["violations_detected"]) > 0

    sanitized = res_risky["sanitized_weights"]
    # Verify all single positions are capped <= 12%
    for sym, w in sanitized.items():
        if sym != "CASH":
            assert w <= 0.12 + 1e-4, f"Position {sym} weight {w} exceeded 12% cap"
    assert "CASH" in sanitized and sanitized["CASH"] > 0.0

    print(f"  -> Case B (Breach): Auto-corrected by Agent Reflection. Cash Buffer: {res_risky['cash_buffer_pct']}%")
    print(f"  -> Reflection message: {res_risky['react_chain']['reflection']}")


def test_quantum_mps_tensor_optimizer():
    print("\n[4/6] Testing Quantum-Inspired Matrix Product State (MPS) Discrete Lot Optimizer...")
    mps = QuantumMPSTensorOptimizer()

    target_weights = {
        "RELIANCE": 0.12,
        "TCS": 0.12,
        "HDFCBANK": 0.12,
        "INFY": 0.10,
        "ICICIBANK": 0.12,
        "CASH": 0.42,
    }
    prices = {
        "RELIANCE": 2984.20,
        "TCS": 4112.50,
        "HDFCBANK": 1634.80,
        "INFY": 1890.40,
        "ICICIBANK": 1182.60,
    }

    res_mps = mps.optimize_discrete_lots(
        target_weights=target_weights,
        asset_prices=prices,
        portfolio_nav=21500000.0,
        lot_size=25,
        bond_dimension_chi=16,
    )

    assert "discrete_allocations" in res_mps
    assert "total_allocated_notional" in res_mps
    assert "residual_cash_notional" in res_mps
    assert "tracking_error_bps" in res_mps

    for sym, alloc in res_mps["discrete_allocations"].items():
        # Shares must be exact multiple of lot_size
        assert alloc["shares"] % 25 == 0, f"{sym} shares ({alloc['shares']}) not a multiple of lot size 25"
        assert alloc["num_lots"] >= 0

    print(f"  -> MPS Discrete Lot allocations verified (lot_size=25). Tracking Error: {res_mps['tracking_error_bps']} bps")
    print(f"  -> Total allocated: INR {res_mps['total_allocated_notional']:,.2f} | Residual Cash: INR {res_mps['residual_cash_notional']:,.2f}")


def test_ptp_clock_telemetry():
    print("\n[5/6] Testing Sub-Nanosecond IEEE 1588v2 Hardware PTP Clock Telemetry...")
    ptp = SubNanosecondPTPTelemetry()
    telemetry = ptp.get_hardware_telemetry()

    assert telemetry["clock_status"] == "LOCKED_TO_ATOMIC_GRANDMASTER"
    assert telemetry["phy_timestamp_jitter_ns"] < 1.0, f"PTP jitter {telemetry['phy_timestamp_jitter_ns']} exceeds 1.0 ns"
    assert telemetry["jitter_under_threshold"] is True
    assert "order_queue_position_estimator" in telemetry
    assert "RELIANCE" in telemetry["order_queue_position_estimator"]
    print(f"  -> Hardware PTP Clock: LOCKED. PHY Jitter: {telemetry['phy_timestamp_jitter_ns']} ns (< 1.0 ns target)")
    print(f"  -> RELIANCE L3 Estimated Queue Position: #{telemetry['order_queue_position_estimator']['RELIANCE']['estimated_queue_pos']}")


def test_fastapi_v24_endpoints():
    print("\n[6/6] Testing FastAPI v24 Route Handlers with Pydantic Payloads...")

    # 1. Telemetry
    telemetry = get_causal_telemetry()
    assert telemetry["status"] == "ONLINE"
    assert "causal_inference" in telemetry["modules"]
    assert "liquidity_contagion" in telemetry["modules"]
    print("  -> get_causal_telemetry(): OK (Status: ONLINE)")

    # 2. Do-Effect
    do_res = compute_causal_do_effect(DoEffectRequest(treatment_val=0.08, sample_size=500))
    assert "causal_effect" in do_res
    print(f"  -> compute_causal_do_effect(): OK, Causal Effect={do_res['causal_effect']}")

    # 3. ST-GNN Contagion
    contagion_res = compute_st_gnn_contagion(STGNNContagionRequest())
    assert "mean_systemic_contagion" in contagion_res
    print(f"  -> compute_st_gnn_contagion(): OK, Systemic Alert={contagion_res['systemic_alert_level']}")

    # 4. ReAct Verification
    react_res = run_agentic_react_verification(ReActVerifyRequest(
        proposed_weights={"RELIANCE": 0.20, "TCS": 0.15, "HDFCBANK": 0.20, "INFY": 0.15, "ICICIBANK": 0.10, "CASH": 0.20},
        simulated_var=1950000.0,
    ))
    assert "react_chain" in react_res
    print(f"  -> run_agentic_react_verification(): OK, Action={react_res['action']}")

    # 5. MPS Optimize
    mps_res = optimize_quantum_mps_lots(MPSOptimizeRequest(lot_size=25))
    assert "discrete_allocations" in mps_res
    print(f"  -> optimize_quantum_mps_lots(): OK, Tracking Error={mps_res['tracking_error_bps']} bps")

    # 6. PTP Clock Telemetry
    ptp_res = get_ptp_clock_telemetry()
    assert ptp_res["phy_timestamp_jitter_ns"] < 1.0
    print(f"  -> get_ptp_clock_telemetry(): OK, Jitter={ptp_res['phy_timestamp_jitter_ns']} ns")

    # 7. Unified Pipeline Execute
    pipeline_res = execute_v24_causal_pipeline(CausalPipelineRequest(treatment_val=0.04, simulated_var=2100000.0))
    assert pipeline_res["status"] == "SUCCESS"
    assert "causal_do_calculus" in pipeline_res
    assert "spatial_temporal_gnn" in pipeline_res
    assert "agentic_react_verification" in pipeline_res
    print(f"  -> execute_v24_causal_pipeline(): OK, Final Action={pipeline_res['final_action']}")


if __name__ == "__main__":
    print("=" * 80)
    print("QUANTX INSTITUTIONAL PLATFORM - SUGGESTION v24 E2E VERIFICATION SUITE")
    print("=" * 80)

    try:
        test_causal_do_calculus()
        test_st_gnn_liquidity_contagion()
        test_agentic_react_copilot()
        test_quantum_mps_tensor_optimizer()
        test_ptp_clock_telemetry()
        test_fastapi_v24_endpoints()

        print("\n" + "=" * 80)
        print("ALL v24 CAUSAL AI, ST-GNN, REACT & PTP TESTS PASSED (100% SUCCESS)!")
        print("=" * 80)
        sys.exit(0)
    except AssertionError as ae:
        print(f"\n[FAIL] Assertion error: {ae}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] Unexpected exception: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(2)

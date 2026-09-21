"""
QUANTX v22 Master Architectural Specification: Autonomous MARL & Microstructure Execution Engine
Comprehensive End-to-End Test Suite
"""

import sys
import os
import math
import numpy as np

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.marl_orchestrator_engine import (
    MicrostructureEngine,
    MARLPolicySwarm,
    DeterministicRiskArbitrator,
    QuantXMARLOrchestrator,
    MicrostructureSignalsRequest,
    MARLRebalanceRequest,
    RiskArbitrationRequest,
    FatFingerCheckRequest,
)
from app.main import (
    get_marl_telemetry,
    get_all_microstructure_signals,
    compute_microstructure_signals,
    arbitrate_portfolio_weights,
    check_fat_finger_price_collar,
    execute_autonomous_marl_cycle,
)


def test_v22_e2e():
    print("\n" + "=" * 80)
    print("=== RUNNING QUANTX v22 AUTONOMOUS MARL & MICROSTRUCTURE SWARM E2E SUITE ===")
    print("=" * 80)

    # --------------------------------------------------------------------------
    # 1. Real-Time Order Book Microstructure Ingestion
    # --------------------------------------------------------------------------
    print("\n[+] 1. Testing L2/L3 Micro-Price and Order Book Imbalance (OBI)...")
    bid_px, ask_px = 189.40, 189.50
    bid_vol, ask_vol = 1200.0, 800.0

    signals = MicrostructureEngine.compute_signals(
        symbol="AAPL",
        bid_price=bid_px,
        ask_price=ask_px,
        bid_vol=bid_vol,
        ask_vol=ask_vol,
    )

    expected_mid = (189.40 + 189.50) / 2.0  # 189.45
    expected_micro = (1200.0 * 189.50 + 800.0 * 189.40) / 2000.0  # 189.46
    expected_obi = (1200.0 - 800.0) / 2000.0  # +0.20

    print(f"    -> Mid Price: {signals.mid_price} (Expected: {expected_mid})")
    print(f"    -> Micro Price: {signals.micro_price} (Expected: {expected_micro})")
    print(f"    -> OBI: {signals.obi} (Expected: {expected_obi})")
    print(f"    -> Spread: {signals.spread_bps:.2f} bps | Micro Dev: {signals.micro_price_dev_bps:.2f} bps")

    assert abs(signals.mid_price - expected_mid) < 1e-2
    assert abs(signals.micro_price - expected_micro) < 1e-2
    assert abs(signals.obi - expected_obi) < 1e-4
    assert signals.spread_bps > 0
    print("    [PASS] Micro-Price and OBI calculated according to market microstructure specifications.")

    # --------------------------------------------------------------------------
    # 2. MARL Policy Swarm Dec-POMDP Action Generation & Reward
    # --------------------------------------------------------------------------
    print("\n[+] 2. Testing MARL Swarm Dec-POMDP Action Bounds & Differential Sharpe Reward...")
    swarm = MARLPolicySwarm()
    current_weights = {"RELIANCE": 0.10, "TCS": 0.08, "CASH": 0.82}
    sample_factors = {
        "RELIANCE": {"momentum": 0.9, "value": 0.7, "quality": 0.8, "volatility": 0.2, "liquidity": 0.9, "sentiment": 0.6, "macro": 0.5, "technical": 0.7, "alt_data": 0.5},
        "TCS": {"momentum": -0.4, "value": 0.3, "quality": 0.5, "volatility": 0.4, "liquidity": 0.7, "sentiment": 0.3, "macro": 0.4, "technical": 0.2, "alt_data": 0.3},
    }
    sample_micro = {
        "RELIANCE": signals,
        "TCS": signals,
    }

    actions = swarm.generate_rebalance_proposals(current_weights, sample_factors, sample_micro)
    assert len(actions) == 2
    for a in actions:
        print(f"    -> Agent Action for {a.symbol}: delta={a.weight_delta:+.4f}, proposed={a.proposed_weight:.4f}, confidence={a.actor_confidence:.2f}, strategy={a.slicing_strategy}")
        assert -0.05 <= a.weight_delta <= 0.05, f"Action delta must be in [-0.05, +0.05], got {a.weight_delta}"

    # Test Differential Sharpe reward
    proposed_weights = {a.symbol: a.proposed_weight for a in actions}
    reward_res = swarm.compute_differential_sharpe_reward(
        delta_sharpe=0.25,
        weights_current=current_weights,
        weights_proposed=proposed_weights,
        portfolio_var_95=0.018,
        var_limit=0.025,
        avg_slippage_bps=2.5,
    )
    print(f"    -> Reward: {reward_res['reward']} (Delta Sharpe: {reward_res['delta_sharpe']}, Turnover Drag: -{reward_res['turnover_penalty']:.5f})")
    assert reward_res["reward"] > 0
    assert reward_res["var_excess"] == 0.0  # 0.018 <= 0.025
    print("    [PASS] MARL Dec-POMDP Policy Swarm conforms strictly to action space and reward formulation.")

    # --------------------------------------------------------------------------
    # 3. Deterministic Risk Arbitrator: Single-Name & Sector Caps
    # --------------------------------------------------------------------------
    print("\n[+] 3. Testing Deterministic Risk Arbitrator Position & Sector Caps...")
    arbitrator = DeterministicRiskArbitrator(max_position_cap=0.12, max_sector_cap=0.30)
    over_proposed = {
        "AAPL": 0.15,  # Exceeds 12% cap
        "MSFT": 0.10,
        "NVDA": 0.25,  # Exceeds 12% cap
    }
    sectors = {"AAPL": "Technology", "MSFT": "Technology", "NVDA": "Technology"}

    res = arbitrator.arbitrate_weights(over_proposed, sectors)
    print(f"    -> Approved: {res.is_approved}")
    print(f"    -> Adjustments Made: {len(res.adjustments_made)}")
    for adj in res.adjustments_made:
        print(f"       * {adj}")
    print(f"    -> Sanitized Weights: {res.sanitized_weights}")

    # Check that each position is <= 12%
    for ticker, w in res.sanitized_weights.items():
        if ticker != "CASH":
            assert w <= 0.12 + 1e-5, f"{ticker} weight {w} exceeds single-name cap 0.12"

    # Check that Technology sector sum is <= 30%
    tech_sum = sum(w for t, w in res.sanitized_weights.items() if sectors.get(t) == "Technology")
    print(f"    -> Technology Sector Total: {tech_sum:.2%}")
    assert tech_sum <= 0.30 + 1e-5, f"Sector total {tech_sum} exceeds 0.30"
    assert "CASH" in res.sanitized_weights
    assert res.sanitized_weights["CASH"] >= 0.0
    print("    [PASS] Single-name (12%) and sector concentration (30%) hard caps verified.")

    # --------------------------------------------------------------------------
    # 4. VaR Limit & Drawdown Circuit Breaker (-8.43%)
    # --------------------------------------------------------------------------
    print("\n[+] 4. Testing Drawdown Circuit Breaker (-8.43%) & VaR Threshold...")
    # 4a. Drawdown breach
    res_dd = arbitrator.arbitrate_weights(over_proposed, sectors, current_drawdown=-0.09)  # < -0.0843
    print(f"    -> Drawdown Breach Approved: {res_dd.is_approved}")
    print(f"    -> Rejection Reason: {res_dd.rejection_reasons}")
    assert res_dd.is_approved is False
    assert res_dd.circuit_breaker_triggered is True
    assert res_dd.sanitized_weights["CASH"] == 1.0

    # 4b. VaR regulatory cap breach
    res_var = arbitrator.arbitrate_weights(over_proposed, sectors, current_drawdown=-0.02, simulated_var_95=0.035)  # > 0.025
    print(f"    -> VaR Cap Breach Approved: {res_var.is_approved}")
    assert res_var.is_approved is False
    assert any("VAR_LIMIT_EXCEEDED" in r for r in res_var.rejection_reasons)
    print("    [PASS] Drawdown circuit breaker and VaR bounds correctly halt non-compliant allocations.")

    # --------------------------------------------------------------------------
    # 5. Fat-Finger Price Collar (2.0% distance from Micro-Price)
    # --------------------------------------------------------------------------
    print("\n[+] 5. Testing Fat-Finger Price Collar (2.0% Tolerance)...")
    micro_p = 100.0
    # 5a. Compliant limit order (1.2% divergence)
    pass_collar, msg_pass = arbitrator.verify_fat_finger_collar(101.20, micro_p)
    print(f"    -> Order 101.20 (Micro: 100.0): Approved={pass_collar} | Msg={msg_pass}")
    assert pass_collar is True

    # 5b. Non-compliant limit order (3.5% divergence)
    fail_collar, msg_fail = arbitrator.verify_fat_finger_collar(103.50, micro_p)
    print(f"    -> Order 103.50 (Micro: 100.0): Approved={fail_collar} | Msg={msg_fail}")
    assert fail_collar is False
    assert "FAT_FINGER_COLLAR_BREACH" in msg_fail
    print("    [PASS] Fat-finger collar rejects orders diverging > 2.0% from micro-price.")

    # --------------------------------------------------------------------------
    # 6. Master Orchestrator Autonomous Rebalance Cycle
    # --------------------------------------------------------------------------
    print("\n[+] 6. Testing Master QuantXMARLOrchestrator Autonomous Rebalance Cycle...")
    orchestrator = QuantXMARLOrchestrator()
    cycle_res = orchestrator.execute_autonomous_rebalance_cycle()
    print(f"    -> Cycle Status: {cycle_res['status']}")
    print(f"    -> Order Slices Generated: {len(cycle_res['order_slices'])}")
    print(f"    -> Cash Buffer: {cycle_res['cash_buffer_pct']}%")
    print(f"    -> Reward: {cycle_res['reward_breakdown']['reward']}")
    assert cycle_res["status"] == "SUCCESS"
    assert len(cycle_res["order_slices"]) > 0
    assert all(s["fat_finger_check"] == "PASSED" for s in cycle_res["order_slices"])
    print("    [PASS] Full autonomous rebalance cycle executes end-to-end.")

    # --------------------------------------------------------------------------
    # 7. FastAPI v22 REST Endpoints Verification
    # --------------------------------------------------------------------------
    print("\n[+] 7. Testing FastAPI v22 Endpoints...")
    # 7a. Telemetry
    telemetry = get_marl_telemetry()
    print(f"    -> Telemetry Status: {telemetry['status']}, Mode: {telemetry['mode']}")
    assert telemetry["status"] == "ONLINE"
    assert telemetry["mode"] == "AUTONOMOUS_MARL_L3_SWARM"

    # 7b. All microstructure signals
    all_sigs = get_all_microstructure_signals()
    print(f"    -> Tracked Microstructure Feeds: {len(all_sigs)}")
    assert "RELIANCE" in all_sigs
    assert "micro_price" in all_sigs["RELIANCE"]

    # 7c. Compute custom microstructure signals
    custom_sig = compute_microstructure_signals(MicrostructureSignalsRequest(
        symbol="TCS",
        bid_price=4112.00,
        ask_price=4113.50,
        bid_vol=820.0,
        ask_vol=950.0,
    ))
    print(f"    -> Custom Signal TCS Micro-Price: {custom_sig['micro_price']}, OBI: {custom_sig['obi']}")
    assert custom_sig["symbol"] == "TCS"

    # 7d. Arbitrate weights endpoint
    arbitrated = arbitrate_portfolio_weights(RiskArbitrationRequest(
        proposed_weights={"RELIANCE": 0.20, "TCS": 0.15, "HDFCBANK": 0.10},
    ))
    print(f"    -> Arbitrate Endpoint Approval: {arbitrated['is_approved']}, Sanitized: {arbitrated['sanitized_weights']}")
    assert arbitrated["sanitized_weights"]["RELIANCE"] <= 0.12

    # 7e. Fat-finger check endpoint
    ff_res = check_fat_finger_price_collar(FatFingerCheckRequest(limit_price=2985.0, micro_price=2984.5))
    print(f"    -> Fat Finger Check Endpoint: Approved={ff_res['is_approved']}")
    assert ff_res["is_approved"] is True

    # 7f. Execute cycle endpoint
    api_cycle = execute_autonomous_marl_cycle(MARLRebalanceRequest(current_drawdown=-0.015, simulated_var_95=0.014))
    print(f"    -> API Cycle Execution: Status={api_cycle['status']}")
    assert api_cycle["status"] == "SUCCESS"

    print("\n" + "=" * 80)
    print(">>> ALL QUANTX v22 E2E TESTS PASSED WITH 100% SPEC CONFORMANCE <<<")
    print("=" * 80)


if __name__ == "__main__":
    test_v22_e2e()

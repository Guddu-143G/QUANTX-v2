"""
QUANTX INSTITUTIONAL PLATFORM - SUGGESTION v26 E2E VERIFICATION SUITE
Tests Topological Data Analysis (TDA), Quantum-Classical Hybrid Tensor Networks (MPS),
Autonomous Code Synthesis (AEC-LLM) with Formal Z3 Theorem Prover, zk-MPC Dark Pool,
and Sub-100ns Lock-Free SPSC Ring Buffer Architecture.
"""

import sys
import os
import time
import numpy as np

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.tda_quantum_engine import (
    TopologicalDataAnalysisEngine,
    QuantumMPSTensorEngine,
    Z3FormalVerificationEngine,
    ZkMPCDarkPoolEngine,
    LockFreeRingBufferTelemetry,
    QuantXTDAQuantumMasterEngine,
    tda_quantum_orchestrator,
    TDAHomologyRequest,
    MPSTensorOptimizeRequest,
    Z3KernelVerifyRequest,
    ZkMPCMatchRequest,
    TDAQuantumPipelineRequest,
)
from app.main import (
    get_tda_quantum_telemetry,
    compute_tda_persistent_homology,
    optimize_mps_tensor_portfolio,
    verify_kernel_formal_safety,
    match_zk_mpc_dark_pool,
    get_spsc_buffer_status,
    execute_v26_tda_quantum_pipeline,
)


def run_test_suite():
    print("=" * 80)
    print("QUANTX INSTITUTIONAL PLATFORM - SUGGESTION v26 E2E VERIFICATION SUITE")
    print("=" * 80)

    # --------------------------------------------------------------------------
    # 1. Test Topological Data Analysis (TDA) & Persistent Homology
    # --------------------------------------------------------------------------
    print("\n[1/6] Testing Topological Data Analysis (Vietoris-Rips & Betti Numbers)...")
    tda = TopologicalDataAnalysisEngine(["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK"])
    
    # 1a. Normal correlation manifold
    rng = np.random.default_rng(42)
    mock_returns = rng.normal(0.001, 0.02, size=(100, 5))
    homology_normal = tda.compute_vietoris_rips_homology(mock_returns, epsilon=0.60)
    
    assert homology_normal["betti_0"] >= 1, "Betti 0 must be at least 1"
    assert homology_normal["betti_1_proxy"] >= 0, "Betti 1 cannot be negative"
    assert len(homology_normal["persistence_pairs"]) == 5
    assert homology_normal["wasserstein_shift"] > 0
    print(f"  -> Normal Manifold: Betti_0={homology_normal['betti_0']}, Betti_1={homology_normal['betti_1_proxy']}, Num Edges={homology_normal['num_edges']}")
    print(f"  -> Wasserstein Shift: {homology_normal['wasserstein_shift']:.6f} | Alert: {homology_normal['phase_transition_alert']}")

    # 1b. Manifold collapse / market flash crash (uniform correlation collapse)
    shock_factor = rng.normal(0.005, 0.08, size=(100, 1))
    collapsed_returns = np.repeat(shock_factor, 5, axis=1) + rng.normal(0, 0.0001, size=(100, 5))
    homology_shock = tda.compute_vietoris_rips_homology(collapsed_returns, epsilon=0.15)
    print(f"  -> Manifold Collapse Simulation: Betti_0={homology_shock['betti_0']}, Alert={homology_shock['phase_transition_alert']}")
    print("  -> TDA Persistent Homology successfully validated.")

    # --------------------------------------------------------------------------
    # 2. Test Quantum-Classical Hybrid Tensor Network (MPS) Portfolio Solver
    # --------------------------------------------------------------------------
    print("\n[2/6] Testing Quantum MPS Tensor Network Portfolio Optimization (DMRG)...")
    mps = QuantumMPSTensorEngine(["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK"], max_position_cap=0.12)
    mu = [0.14, 0.12, 0.11, 0.15, 0.10]
    mps_res = mps.solve_mps_tensor_portfolio(
        expected_returns=mu,
        portfolio_nav=21500000.0,
        bond_dimension=4,
        lot_size=25,
    )
    
    assert mps_res["bond_dimension_chi"] == 4
    assert mps_res["tracking_error_bps"] < 30.0, f"Tracking error too high: {mps_res['tracking_error_bps']} bps"
    assert mps_res["residual_cash_inr"] >= 0.0
    for sym, alloc in mps_res["allocations"].items():
        assert alloc["actual_weight_pct"] <= 12.5, f"Position cap breached for {sym}: {alloc['actual_weight_pct']}%"
        assert alloc["discrete_shares"] % 25 == 0, f"Lot size constraint violated for {sym}: {alloc['discrete_shares']}"
    print(f"  -> Ground State Energy: {mps_res['ground_state_energy']:.6f}")
    print(f"  -> Tracking Error: {mps_res['tracking_error_bps']} bps | Residual Cash: INR {mps_res['residual_cash_inr']:,.2f} ({mps_res['cash_weight_pct']}%)")
    print(f"  -> RELIANCE Discrete Lots: {mps_res['allocations']['RELIANCE']['discrete_lots']} lots ({mps_res['allocations']['RELIANCE']['discrete_shares']} shares)")

    # --------------------------------------------------------------------------
    # 3. Test Autonomous Code Synthesis & Z3 Formal Verification Gate
    # --------------------------------------------------------------------------
    print("\n[3/6] Testing Autonomous Code Synthesis & Z3 Formal Verification Gate...")
    z3_gate = Z3FormalVerificationEngine()

    # Case A: Provably Safe Alpha Kernel
    safe_kernel = {
        "kernel_name": "alpha_safe_momentum_c23",
        "has_division": True,
        "divisor_guaranteed_non_zero": True,
        "max_index": 64,
        "capacity": 128,
        "max_bound_magnitude": 50.0,
    }
    v_safe = z3_gate.verify_kernel_ast_safety(safe_kernel)
    assert v_safe["verified"] is True, "Safe kernel failed formal verification"
    assert v_safe["action"] == "HOT_RELOAD_APPROVED"
    print(f"  -> Safe Kernel: Verified={v_safe['verified']} | Action={v_safe['action']} | Proof Hash={v_safe['z3_proof_hash']}")

    # Case B: Buffer Overflow Counterexample (max_index >= capacity)
    unsafe_kernel = {
        "kernel_name": "alpha_unsafe_buffer_overflow",
        "has_division": False,
        "max_index": 256,
        "capacity": 128,
    }
    v_unsafe = z3_gate.verify_kernel_ast_safety(unsafe_kernel)
    assert v_unsafe["verified"] is False, "Unsafe buffer overflow was not caught"
    assert v_unsafe["action"] == "REJECTED_BY_Z3_THEOREM_PROVER"
    assert v_unsafe["counterexample"]["failing_property"] == "BUFFER_OVERFLOW"
    print(f"  -> Unsafe Kernel: Correctly Rejected={not v_unsafe['verified']} | Violation: {v_unsafe['counterexample']['failing_property']}")

    # --------------------------------------------------------------------------
    # 4. Test zk-MPC Dark Pool Matching Engine (Garbled Circuits)
    # --------------------------------------------------------------------------
    print("\n[4/6] Testing zk-MPC Dark Pool Matching Engine (Garbled Circuits)...")
    zk_darkpool = ZkMPCDarkPoolEngine()

    # 4a. Crossing orders (Bid >= Ask)
    trade_cross = zk_darkpool.match_orders_confidential(
        buyer_bid=2985.0,
        buyer_volume=5000,
        seller_ask=2975.0,
        seller_volume=4000,
        ticker="RELIANCE",
    )
    assert trade_cross["matched"] is True
    assert trade_cross["execution"]["midpoint_price_inr"] == 2980.0
    assert trade_cross["execution"]["matched_volume_shares"] == 4000
    assert trade_cross["execution"]["total_notional_inr"] == 11920000.0
    print(f"  -> Matched Confidential: Midpoint Price=INR {trade_cross['execution']['midpoint_price_inr']} | Vol={trade_cross['execution']['matched_volume_shares']} shares")
    print(f"  -> Zero-Knowledge Ticket Hash: {trade_cross['zero_knowledge_audit']['zk_trade_ticket_hash']}")

    # 4b. Non-crossing spread (Bid < Ask)
    trade_no_cross = zk_darkpool.match_orders_confidential(
        buyer_bid=2970.0,
        buyer_volume=5000,
        seller_ask=2985.0,
        seller_volume=4000,
        ticker="RELIANCE",
    )
    assert trade_no_cross["matched"] is False
    assert trade_no_cross["execution"]["matched_volume_shares"] == 0
    print("  -> Non-crossing spread correctly rejected with zero information leakage.")

    # --------------------------------------------------------------------------
    # 5. Test Sub-100ns Lock-Free SPSC Ring Buffer Architecture
    # --------------------------------------------------------------------------
    print("\n[5/6] Testing Sub-100ns Lock-Free SPSC Ring Buffer Architecture...")
    spsc = LockFreeRingBufferTelemetry()
    spsc_telem = spsc.get_ring_buffer_telemetry()
    assert spsc_telem["sla_compliant"] is True
    assert spsc_telem["measured_enqueue_latency_ns"] < 100.0, f"SLA violated: {spsc_telem['measured_enqueue_latency_ns']} ns"
    assert spsc_telem["dropped_packets"] == 0
    print(f"  -> Architecture: {spsc_telem['buffer_architecture']} ({spsc_telem['cache_line_alignment']})")
    print(f"  -> Measured Latency: {spsc_telem['measured_enqueue_latency_ns']} ns (SLA < {spsc_telem['target_sla_latency_ns']} ns)")
    print(f"  -> Capacity: {spsc_telem['capacity_slots']} slots | Fill: {spsc_telem['queue_fill_pct']}%")

    # --------------------------------------------------------------------------
    # 6. Test FastAPI v26 Route Handlers with Pydantic Payloads
    # --------------------------------------------------------------------------
    print("\n[6/6] Testing FastAPI v26 Route Handlers with Pydantic Payloads...")

    # 6a. Telemetry
    t_out = get_tda_quantum_telemetry()
    assert t_out["status"] == "ONLINE"
    assert "topological_data_analysis" in t_out["modules"]
    print(f"  -> get_tda_quantum_telemetry(): OK (Status: {t_out['status']})")

    # 6b. TDA Homology
    tda_req = TDAHomologyRequest(epsilon=0.65)
    tda_out = compute_tda_persistent_homology(tda_req)
    assert "betti_0" in tda_out
    print(f"  -> compute_tda_persistent_homology(): OK (Betti 0={tda_out['betti_0']}, Betti 1={tda_out['betti_1_proxy']})")

    # 6c. MPS Optimization
    mps_req = MPSTensorOptimizeRequest(portfolio_nav=25000000.0, bond_dimension=4)
    mps_out = optimize_mps_tensor_portfolio(mps_req)
    assert mps_out["tracking_error_bps"] >= 0.0
    print(f"  -> optimize_mps_tensor_portfolio(): OK (Tracking Error: {mps_out['tracking_error_bps']} bps)")

    # 6d. Z3 Formal Verification
    z3_req = Z3KernelVerifyRequest(kernel_name="momentum_filter_test")
    z3_out = verify_kernel_formal_safety(z3_req)
    assert z3_out["verified"] is True
    print(f"  -> verify_kernel_formal_safety(): OK (Action: {z3_out['action']})")

    # 6e. zk-MPC Dark Pool Match
    zk_req = ZkMPCMatchRequest(buyer_bid=3000.0, seller_ask=2990.0, buyer_volume=1000, seller_volume=1000)
    zk_out = match_zk_mpc_dark_pool(zk_req)
    assert zk_out["matched"] is True
    print(f"  -> match_zk_mpc_dark_pool(): OK (Midpoint Price: INR {zk_out['execution']['midpoint_price_inr']})")

    # 6f. SPSC Status
    spsc_out = get_spsc_buffer_status()
    assert spsc_out["sla_compliant"] is True
    print(f"  -> get_spsc_buffer_status(): OK (Latency: {spsc_out['measured_enqueue_latency_ns']} ns)")

    # 6g. Full Pipeline Execution
    pipe_req = TDAQuantumPipelineRequest(epsilon=0.60, bond_dimension=4)
    pipe_out = execute_v26_tda_quantum_pipeline(pipe_req)
    assert pipe_out["pipeline_status"] == "SUCCESS"
    assert pipe_out["executive_summary"]["z3_kernel_approved"] is True
    print(f"  -> execute_v26_tda_quantum_pipeline(): OK (Executive Summary: {pipe_out['executive_summary']['mps_ground_energy']:.4f} energy)")

    # --------------------------------------------------------------------------
    # Final Summary
    # --------------------------------------------------------------------------
    print("\n" + "=" * 80)
    print("ALL v26 TDA, QUANTUM MPS, Z3 SMT, ZK-MPC & SPSC TESTS PASSED (100% SUCCESS)!")
    print("=" * 80)


if __name__ == "__main__":
    run_test_suite()

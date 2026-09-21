"""
QUANTX INSTITUTIONAL PLATFORM - SUGGESTION v25 E2E VERIFICATION SUITE
Tests Neuromorphic Liquid Neural Networks (LNNs), Zero-Knowledge Proof-of-Solvency (zk-PoS),
Federated Cross-Desk Alpha Orchestrator with Differential Privacy, and Bare-Metal Sovereign Edge Firmware.
"""

import sys
import os
import time
import numpy as np

# Ensure backend root is in path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.neuromorphic_zk_engine import (
    QuantXLiquidCell,
    NeuromorphicLNNEngine,
    ZeroKnowledgeProofEngine,
    FederatedAlphaOrchestrator,
    SovereignEdgeFirmware,
    QuantXSovereignMasterEngine,
    sovereign_master_engine,
    LNNStepRequest,
    ZkSolvencyRequest,
    ZkVerifyRequest,
    FederatedAggregationRequest,
    SovereignPipelineRequest,
)
from app.main import (
    get_sovereign_telemetry,
    lnn_ode_step,
    generate_zk_solvency_proof,
    verify_zk_solvency_proof,
    federated_smpc_aggregation,
    get_edge_firmware_status,
    toggle_edge_offline_fallback,
    execute_v25_sovereign_pipeline,
)


def run_test_suite():
    print("=" * 80)
    print("QUANTX INSTITUTIONAL PLATFORM - SUGGESTION v25 E2E VERIFICATION SUITE")
    print("=" * 80)

    # --------------------------------------------------------------------------
    # 1. Test Neuromorphic Liquid Neural Network (LNN) ODE Solver
    # --------------------------------------------------------------------------
    print("\n[1/6] Testing Neuromorphic Liquid Neural Network (LNN) Continuous-Time ODE...")
    cell = QuantXLiquidCell(input_dim=5, hidden_dim=16, tau_base=0.10)
    h0 = np.zeros((16, 1))
    ticks_normal = np.array([2980.0, 4120.0, 1640.0, 1890.0, 1180.0]) / 2000.0

    # Step normal
    h1, tau1, regime1, readout1 = cell.step(h0, ticks_normal, dt=0.005)
    assert h1.shape == (16, 1), f"Unexpected state shape: {h1.shape}"
    assert tau1 > 0.0, f"Invalid tau_eff: {tau1}"
    assert "alpha_return_pct" in readout1, "Missing alpha_return_pct in readout"
    print(f"  -> Normal tick step: tau_eff={tau1*1000:.2f}ms | Regime={regime1} | Alpha={readout1['alpha_return_pct']}%")

    # Step flash crash / extreme input: input magnitude 10x
    ticks_shock = ticks_normal * 4.5
    h2, tau2, regime2, readout2 = cell.step(h1, ticks_shock, dt=0.001)
    print(f"  -> Shock tick step: tau_eff={tau2*1000:.2f}ms | Regime={regime2} | Volatility={readout2['predicted_volatility_pct']}%")
    assert tau2 < tau1, f"Effective tau should shrink under stress: {tau2} vs {tau1}"
    print("  -> LNN Dynamic time-constant adaptation successfully validated.")

    # --------------------------------------------------------------------------
    # 2. Test Zero-Knowledge Proof-of-Solvency & VaR Compliance (zk-PoS)
    # --------------------------------------------------------------------------
    print("\n[2/6] Testing Zero-Knowledge Proof-of-Solvency (Pedersen & Groth16)...")
    zk_engine = ZeroKnowledgeProofEngine()

    # Case A: Compliant Fund (Assets ₹21.5M, Liabilities ₹9.2M, Single weights <= 12%, VaR <= ₹18.4L)
    weights_compliant = np.array([0.11, 0.115, 0.10, 0.09, 0.11])
    prices = np.array([2980.0, 4120.0, 1640.0, 1890.0, 1180.0])
    proof_compliant = zk_engine.generate_solvency_proof(
        weights=weights_compliant,
        asset_prices=prices,
        liabilities_inr=9200000.0,
        portfolio_nav=21500000.0,
        max_var_limit=1840000.0,
    )
    assert proof_compliant["verification_status"] == "PROVEN_AND_SATISFIED", "Compliant proof failed generation"
    assert proof_compliant["pedersen_commitment_int"] > 0, "Invalid Pedersen commitment"

    # Verify zero-knowledge statement
    ver_res = zk_engine.verify_proof(
        commitment_int=proof_compliant["pedersen_commitment_int"],
        public_signals=proof_compliant["public_signals"],
        proof=proof_compliant["groth16_proof"],
    )
    assert ver_res["verified"] is True, f"zk-SNARK verification failed: {ver_res}"
    print(f"  -> Compliant zk-PoS generated & verified in {ver_res['verification_time_us']:.1f}us")
    print(f"  -> Commitment Hash: {proof_compliant['commitment_hash']} | Solvency Margin: INR {proof_compliant['private_witness_summary']['solvency_margin_inr']:,.2f}")

    # Case B: Non-compliant (Concentration breach: single weight = 45%)
    weights_breach = np.array([0.45, 0.05, 0.05, 0.05, 0.05])
    proof_breach = zk_engine.generate_solvency_proof(
        weights=weights_breach,
        asset_prices=prices,
        liabilities_inr=9200000.0,
        portfolio_nav=21500000.0,
        max_var_limit=1840000.0,
    )
    assert proof_breach["verification_status"] == "CONSTRAINT_BREACH_REJECTED", "Concentration breach should be rejected"
    assert proof_breach["public_signals"]["concentration_cap_satisfied"] is False
    ver_breach = zk_engine.verify_proof(
        commitment_int=proof_breach["pedersen_commitment_int"],
        public_signals=proof_breach["public_signals"],
        proof=proof_breach["groth16_proof"],
    )
    assert ver_breach["verified"] is False, "Breached circuit should fail verification"
    print("  -> Concentration breach correctly flagged and rejected by zk-SNARK circuit.")

    # --------------------------------------------------------------------------
    # 3. Test Federated Cross-Desk Alpha Orchestration with Differential Privacy
    # --------------------------------------------------------------------------
    print("\n[3/6] Testing Federated Multi-Desk Learning with (epsilon, delta)-DP & SMPC...")
    fed_orch = FederatedAlphaOrchestrator(epsilon=1.2, delta=1e-5, clipping_norm=1.0)
    fed_res = fed_orch.run_federated_round(custom_epsilon=1.5)

    assert len(fed_res["participating_desks"]) == 3, "Expected 3 participating desks"
    assert fed_res["privacy_parameters"]["epsilon"] == 1.5
    assert fed_res["privacy_parameters"]["sigma_noise_scale"] > 0
    assert len(fed_res["smpc_aggregated_weights"]) == 5
    assert np.isclose(np.sum(fed_res["smpc_aggregated_weights"]), 1.0, atol=1e-3)
    print(f"  -> Desks: {fed_res['participating_desks']}")
    print(f"  -> DP Noise Scale sigma: {fed_res['privacy_parameters']['sigma_noise_scale']:.4f}")
    print(f"  -> SMPC Aggregated Weights: {fed_res['smpc_aggregated_weights']}")
    print(f"  -> Consensus Sharpe: {fed_res['consensus_sharpe_projection']}")

    # --------------------------------------------------------------------------
    # 4. Test Sovereign Bare-Metal Edge Firmware & Sub-Microsecond Wasm
    # --------------------------------------------------------------------------
    print("\n[4/6] Testing Sovereign Bare-Metal Edge Firmware & Sub-500ns Execution...")
    edge = SovereignEdgeFirmware()
    telemetry = edge.get_firmware_telemetry()
    assert telemetry["sla_compliance"] is True, f"SLA latency breach: {telemetry['measured_inference_latency_ns']}ns"
    assert telemetry["measured_inference_latency_ns"] < 500.0, "Latency must be < 500ns"
    print(f"  -> Hardware: {telemetry['hardware_target']} ({telemetry['compilation_mode']})")
    print(f"  -> Measured Inference Latency: {telemetry['measured_inference_latency_ns']} ns (SLA < {telemetry['target_sla_latency_ns']} ns)")
    print(f"  -> Clock Jitter: {telemetry['clock_jitter_ns']} ns")

    # Test offline fallback toggle
    fb_res = edge.toggle_offline_fallback(enable=True)
    assert fb_res["offline_fallback_active"] is True
    assert "DELTA_NEUTRAL" in fb_res["action"]
    print(f"  -> Offline Fallback: {fb_res['action']} (Failover in {fb_res['failover_latency_us']}us)")
    edge.toggle_offline_fallback(enable=False)

    # --------------------------------------------------------------------------
    # 5. Test FastAPI v25 Route Handlers with Pydantic Payloads
    # --------------------------------------------------------------------------
    print("\n[5/6] Testing FastAPI v25 Route Handlers with Pydantic Payloads...")

    # 5a. Telemetry
    telem = get_sovereign_telemetry()
    assert telem["status"] == "ONLINE"
    assert "neuromorphic_lnn" in telem["modules"]
    print(f"  -> get_sovereign_telemetry(): OK (Status: {telem['status']})")

    # 5b. LNN Step
    lnn_req = LNNStepRequest(dt=0.008)
    lnn_out = lnn_ode_step(lnn_req)
    assert "effective_tau_ms" in lnn_out
    print(f"  -> lnn_ode_step(): OK (Tau: {lnn_out['effective_tau_ms']}ms, Regime: {lnn_out['regime']})")

    # 5c. zk Prove Solvency
    zk_req = ZkSolvencyRequest(portfolio_nav=25000000.0, liabilities_inr=10000000.0)
    zk_out = generate_zk_solvency_proof(zk_req)
    assert zk_out["verification_status"] == "PROVEN_AND_SATISFIED"
    print(f"  -> generate_zk_solvency_proof(): OK (Commitment: {zk_out['commitment_hash']})")

    # 5d. zk Verify Proof
    verify_req = ZkVerifyRequest(
        commitment_int=zk_out["pedersen_commitment_int"],
        public_signals=zk_out["public_signals"],
        proof=zk_out["groth16_proof"],
    )
    verify_out = verify_zk_solvency_proof(verify_req)
    assert verify_out["verified"] is True
    print(f"  -> verify_zk_solvency_proof(): OK (Verified in {verify_out['verification_time_us']:.1f}us)")

    # 5e. Federated SMPC Aggregation
    fed_req = FederatedAggregationRequest(epsilon=1.4)
    fed_out = federated_smpc_aggregation(fed_req)
    assert fed_out["privacy_parameters"]["epsilon"] == 1.4
    print(f"  -> federated_smpc_aggregation(): OK (Consensus Sharpe: {fed_out['consensus_sharpe_projection']})")

    # 5f. Edge Status & Toggle
    edge_out = get_edge_firmware_status()
    assert edge_out["sla_compliance"] is True
    toggle_out = toggle_edge_offline_fallback(enable=True)
    assert toggle_out["offline_fallback_active"] is True
    toggle_edge_offline_fallback(enable=False)
    print(f"  -> get_edge_firmware_status() & toggle: OK (Latency: {edge_out['measured_inference_latency_ns']}ns)")

    # 5g. Full Pipeline Execution
    pipe_req = SovereignPipelineRequest(dt=0.004, epsilon=1.2)
    pipe_out = execute_v25_sovereign_pipeline(pipe_req)
    assert pipe_out["pipeline_status"] == "SUCCESS"
    assert pipe_out["executive_summary"]["zk_solvency_proven"] is True
    print(f"  -> execute_v25_sovereign_pipeline(): OK (Regime: {pipe_out['executive_summary']['market_regime']}, Solvency Proven: {pipe_out['executive_summary']['zk_solvency_proven']})")

    # --------------------------------------------------------------------------
    # 6. Final Summary
    # --------------------------------------------------------------------------
    print("\n" + "=" * 80)
    print("ALL v25 NEUROMORPHIC LNN, ZK-POS, FEDERATED & EDGE TESTS PASSED (100% SUCCESS)!")
    print("=" * 80)


if __name__ == "__main__":
    run_test_suite()

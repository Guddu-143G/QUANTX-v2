"""
Comprehensive E2E Verification Test Suite for QUANTX Version 15 (v15) Sovereign Engines
Tests:
1. eBPF & FPGA L3 Direct-NIC ITCH 5.0 Packet Ingestion
2. Score-Based Generative Diffusion Stress Testing (SDE)
3. Zero-Knowledge Multi-Party Computation (zk-MPC) Multi-Desk Risk Aggregation
4. PPO Anti-Predatory Execution Router
5. Automated SEC Form PF & MiFID II Regulatory Compliance Engine
"""

import sys
import os

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.ebpf_l3_ingest import ebpf_engine
from app.diffusion_sde_stress import diffusion_sde_manager, SDERunRequest
from app.zk_mpc_risk import zk_mpc_engine
from app.ppo_anti_predatory import ppo_execution_agent
from app.regulatory_v15_engine import regulatory_v15_engine


def test_ebpf_l3_ingestion():
    print("=== Testing 1. FPGA & eBPF L3 Ingestion Engine ===")
    status = ebpf_engine.get_xdp_status()
    assert status["status"] == "ONLINE_ZERO_COPY_ACTIVE"
    assert status["hardware_bypass_latency_ns"] == 180

    frame = ebpf_engine.generate_synthetic_itch_frame(ticker="RELIANCE.NS", msg_type="A")
    parsed = ebpf_engine.parse_raw_itch_bytes(frame)
    assert parsed["msg_type"] == "A"
    assert parsed["ticker"] == "RELIANCE.NS"
    assert parsed["latency_overhead_ns"] == 180

    burst = ebpf_engine.simulate_burst(burst_size=500, ticker="RELIANCE.NS")
    assert burst["burst_size_packets"] == 500
    assert burst["effective_throughput_mpps"] > 0.0
    print(f"eBPF Ingestion OK! Status: {status['status']}, Latency: {parsed['latency_overhead_ns']}ns, Throughput: {burst['effective_throughput_mpps']} Mpps\n")


def test_diffusion_sde_stress():
    print("=== Testing 2. Score-Based Generative Diffusion Stress (SDE) ===")
    scenarios = diffusion_sde_manager.get_scenarios()
    assert len(scenarios) >= 4

    res = diffusion_sde_manager.run_stress_test(
        scenario_key="GEOPOLITICAL_STAGFLATION",
        num_samples=200,
        integration_steps=20,
        diffusion_noise_scale=1.0
    )
    assert res.status == "SDE_SIMULATION_SUCCESS"
    assert res.portfolio_stressed_var_99_pct > 0.0
    assert len(res.asset_breakdown) == 4
    assert len(res.reverse_diffusion_trajectory) > 0
    print(f"Diffusion SDE OK! Scenario: {res.scenario_name}, 99% VaR: {res.portfolio_stressed_var_99_pct}%, 99% CVaR: {res.portfolio_stressed_cvar_99_pct}%\n")


def test_zk_mpc_risk_aggregation():
    print("=== Testing 3. zk-MPC Multi-Desk Risk Aggregator ===")
    # Split secret
    secret_val = 8450000
    shares = zk_mpc_engine.split_secret(secret_val, threshold=3, num_shares=5)
    assert len(shares) == 5

    # Reconstruct from shares 1, 2, 3
    rec = zk_mpc_engine.reconstruct_aggregate_risk(shares[:3])
    assert rec == secret_val, f"Expected {secret_val}, got {rec}"

    # Reconstruct from shares 2, 4, 5
    rec_subset = zk_mpc_engine.reconstruct_aggregate_risk([shares[1], shares[3], shares[4]])
    assert rec_subset == secret_val, f"Expected {secret_val}, got {rec_subset}"

    # Full multi-desk simulation
    agg = zk_mpc_engine.run_multi_desk_aggregation(threshold_k=3, selected_indices=[1, 2, 4])
    assert agg.lagrange_verification_passed is True
    assert agg.reconstructed_aggregate_metric_usd > 0
    print(f"zk-MPC OK! Prime: {agg.prime_modulus}, Reconstructed VaR: ${agg.reconstructed_aggregate_metric_usd:,.2f}, Verified: {agg.lagrange_verification_passed}\n")


def test_ppo_anti_predatory_router():
    print("=== Testing 4. PPO Anti-Predatory Execution Router ===")
    # Test toxic flow reaction
    action_toxic = ppo_execution_agent.compute_action_slice(
        spread_bps=5.0,
        order_book_imbalance=-0.2,
        vpin_toxicity=0.85,
        current_step=1,
        remaining_shares=45000.0
    )
    assert action_toxic["route_type"] == "PASSIVE_DARK_POOL_PEGGED"
    assert action_toxic["urgency_multiplier"] == 0.35

    # Test favorable queue reaction
    action_fav = ppo_execution_agent.compute_action_slice(
        spread_bps=5.0,
        order_book_imbalance=0.75,
        vpin_toxicity=0.30,
        current_step=2,
        remaining_shares=40000.0
    )
    assert action_fav["route_type"] == "LIT_SWEEP_IOC"
    assert action_fav["urgency_multiplier"] == 1.40

    # Full episode simulation
    episode = ppo_execution_agent.simulate_full_episode(
        ticker="RELIANCE.NS",
        total_shares=50000.0,
        steps=10,
        initial_vpin=0.65
    )
    assert episode.status == "PPO_EPISODE_COMPLETED"
    assert len(episode.trajectory) == 10
    assert episode.total_savings_inr > 0
    print(f"PPO Router OK! Blended Slip: {episode.blended_ppo_slippage_bps} bps vs {episode.benchmark_twap_slippage_bps} bps TWAP, Savings: INR {episode.total_savings_inr:,.2f}\n")


def test_regulatory_v15_engine():
    print("=== Testing 5. Automated SEC Form PF & Regulatory Compliance Engine ===")
    filing = regulatory_v15_engine.generate_filing(
        regulatory_body="SEC_FORM_PF",
        reporting_period="Q3 2026",
        gross_notional_usd=104218420.0,
        var_95_1d_pct=1.77
    )
    assert filing["status"] == "FILING_GENERATED_SUCCESSFULLY"
    assert filing["schema_compliant"] is True
    assert filing["sha256_audit_hash"].startswith("sha256:")

    # Validate payload
    val = regulatory_v15_engine.validate_payload(filing["filing_payload"])
    assert val["valid"] is True
    assert len(val["errors"]) == 0

    history = regulatory_v15_engine.get_history()
    assert len(history) >= 1
    print(f"Regulatory Engine OK! Filing: {filing['filing_id']}, Audit Hash: {filing['sha256_audit_hash'][:24]}..., Validated: {val['valid']}\n")


if __name__ == "__main__":
    test_ebpf_l3_ingestion()
    test_diffusion_sde_stress()
    test_zk_mpc_risk_aggregation()
    test_ppo_anti_predatory_router()
    test_regulatory_v15_engine()
    print("=======================================================")
    print("ALL 5 v15 SOVEREIGN BACKEND ENGINES VERIFIED 100% SUCCESFULLY!")
    print("=======================================================")

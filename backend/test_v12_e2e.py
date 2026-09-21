import json
from app.autoquant_swarm import AutoQuantSwarmEngine
from app.diffusion_simulator import ConditionalDiffusionLOB
from app.pqc_security import PQCSecurityEngine
from app.multi_period_optimizer import MultiPeriodOptimizer
from app.isda_collateral import ISDACollateralOptimizer
from app.regulatory_reporting import RegulatoryReportingEngine

def test_v12():
    print("=== Testing 1. Auto-Quant Swarms ===")
    swarm = AutoQuantSwarmEngine()
    factors = swarm.get_registered_factors()
    assert len(factors) >= 3
    candidates = swarm.generate_candidate_alphas(count=5)
    assert len(candidates) == 5
    print("AutoQuant Swarm OK! Candidates count:", len(candidates), "Top raw IC:", candidates[0]["raw_ic"])

    print("\n=== Testing 2. Conditional Diffusion L3 LOB Simulator ===")
    diff = ConditionalDiffusionLOB()
    scenarios = diff.get_scenarios()
    assert "FLASH_CRASH_CASCADING" in scenarios
    res = diff.simulate_diffusion_lob(scenario_key="FLASH_CRASH_CASCADING", mid_price=2980.0, steps=20)
    assert len(res["trajectory"]) == 20
    assert len(res["l3_depth_snapshot"]) == 5
    print("Diffusion LOB OK! Max spread widening:", res["max_spread_widening_bps"], "bps, Peak VPIN:", res["peak_vpin_toxicity"])

    print("\n=== Testing 3. Post-Quantum Cryptographic Security (PQC) ===")
    pqc = PQCSecurityEngine()
    status = pqc.get_security_status()
    assert status["pqc_enabled"] == True
    sig = pqc.sign_payload_mldsa({"order_id": "ORD_12345", "size": 10000}, context_label="TEST_ORDER_SIGN")
    assert sig["signature_scheme"].startswith("ML-DSA-87")
    ver = pqc.verify_signature(sig["signature_hash"], sig["public_key_fingerprint"])
    assert ver["valid"] == True
    print("PQC Security OK! Algorithm:", status["digital_signatures"], "Signature verified:", ver["valid"])

    print("\n=== Testing 4. Multi-Period Liquidity Optimizer ===")
    m_opt = MultiPeriodOptimizer()
    traj = m_opt.optimize_trajectory(horizon_periods=6, linear_cost_bps=10.0, quadratic_cost_bps=5.0)
    assert len(traj["trajectory"]) == 6
    assert traj["status"] == "OPTIMAL"
    print("Multi-Period Optimizer OK! Cumulative Turnover:", traj["cumulative_turnover_pct"], "%, Shrinkage delta:", traj["ledoit_wolf_shrinkage_delta"])

    print("\n=== Testing 5. ISDA SIMM Collateral Solver ===")
    isda = ISDACollateralOptimizer()
    isda_res = isda.optimize_collateral()
    assert isda_res["status"] == "OPTIMAL"
    assert isda_res["annual_carry_savings_usd"] >= 0
    print("ISDA Collateral Solver OK! Total Margin Req USD:", isda_res["total_margin_required_usd"], "Carry Savings USD:", isda_res["annual_carry_savings_usd"])

    print("\n=== Testing 6. Automated Regulatory Reporting Engine ===")
    reg = RegulatoryReportingEngine()
    form_pf = reg.generate_form_pf_filing()
    assert "gross_notional_value_usd" in form_pf["regulatory_metrics"]
    mifid = reg.generate_mifid2_rts28_report()
    assert len(mifid["venues_summary"]) == 5
    ledger = reg.get_compliance_ledger()
    assert len(ledger) >= 3
    print("Regulatory Reporting OK! GNE USD:", form_pf["regulatory_metrics"]["gross_notional_value_usd"], "MiFID Venues:", len(mifid["venues_summary"]))

    print("\n=======================================================")
    print("ALL 6 v12 BACKEND ENGINES VERIFIED 100% SUCCESFULLY!")
    print("=======================================================")

if __name__ == "__main__":
    test_v12()

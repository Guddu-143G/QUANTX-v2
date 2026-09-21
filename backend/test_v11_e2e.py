import asyncio
import json
from app.quantum_optimizer import QuantumPortfolioOptimizer
from app.climate_risk import ClimateRiskEngine
from app.multimodal_altdata import MultimodalAltDataStreamer
from app.rl_guardrail import SelfHealingExecutionGuardrail

def test_all():
    print("=== Testing 1. Quantum Optimizer ===")
    q_opt = QuantumPortfolioOptimizer()
    q_caps = q_opt.get_quantum_capabilities()
    print("Quantum Caps:", q_caps["supported_algorithms"])
    res = q_opt.solve_qaoa_cardinality(p_layers=2)
    assert "discrete_weights" in res
    assert len(res["convergence_history"]) > 0
    print("QAOA success! Selected Assets:", res["selected_assets"], "Energy:", res["portfolio_metrics"]["qubo_ground_energy"])

    print("\n=== Testing 2. Climate Risk Engine ===")
    c_eng = ClimateRiskEngine()
    sfdr = c_eng.get_sfdr_metrics()
    assert sfdr["minimum_gar_threshold"] == 40.0
    stress = c_eng.stress_test_portfolio(carbon_tax_shock=150.0, target_temp=3.5, warming_scenario_key="HOT_HOUSE_WORLD")
    assert stress["sfdr_classification"] in ["ARTICLE_8_LIGHT_GREEN", "ARTICLE_6_MAINSTREAM", "ARTICLE_9_DARK_GREEN"]
    print("Climate stress success! Total loss INR:", stress["total_loss_inr"], "SFDR:", stress["sfdr_classification"])

    print("\n=== Testing 3. Multimodal Alt Data ===")
    alt = MultimodalAltDataStreamer()
    feed = alt.get_feed(limit=5)
    assert len(feed) > 0
    assert -1.0 <= feed[0]["sentiment_hawkish_dovish_score"] <= 1.0
    overlay = alt.get_factor_overlay()
    assert len(overlay["top_ticker_impacts"]) > 0
    print("Alt-Data success! Ingested:", len(feed), "Macro stance:", overlay["macro_stance"])

    print("\n=== Testing 4. RL Execution Guardrail ===")
    rl = SelfHealingExecutionGuardrail()
    eval_res = rl.evaluate_execution_health(current_slippage_bps=22.0, vpin_score=0.78, ticker="RELIANCE")
    assert eval_res["guardrail_engaged"] == True
    assert eval_res["recommended_action"] == "SWITCH_TO_DARK_POOL_PASSIVE_PEGGED"
    sim_res = rl.simulate_rl_episode(steps=15, initial_vpin=0.82, initial_slippage=25.0)
    assert len(sim_res) == 15
    print("RL Guardrail success! Engaged:", eval_res["guardrail_engaged"], "Trajectory steps:", len(sim_res))

    print("\nALL 4 v11 BACKEND MODULES VERIFIED 100% SUCCESFULLY!")

if __name__ == "__main__":
    test_all()

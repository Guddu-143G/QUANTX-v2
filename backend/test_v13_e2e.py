import json
from app.pinn_volatility import PINNVolatilityEngine
from app.gnn_contagion import HeterogeneousContagionGNN
from app.differential_game_execution import DifferentialGameExecutionEngine
from app.mpc_dark_pool import MPCDarkPoolEngine
from app.atomic_dvp_settlement import AtomicDvPSettlementEngine


def test_v13():
    print("=== Testing 1. PINN Arbitrage-Free Volatility Surface Engine ===")
    pinn = PINNVolatilityEngine()
    mesh = pinn.generate_surface_mesh()
    assert "mesh_points" in mesh
    assert len(mesh["mesh_points"]) == 150
    assert mesh["metrics"]["arbitrage_free_confidence_pct"] >= 99.0
    calib = pinn.calibrate_surface(epochs=20)
    assert calib["status"] == "CONVERGED"
    pricing = pinn.price_european_option(strike=2950.0, expiry_years=1.0, option_type="CALL")
    assert pricing["arbitrage_check"] == "PASSED_STRICT"
    assert "delta" in pricing["greeks"]
    print("PINN Engine OK! Surface nodes:", mesh["total_mesh_nodes"], "Arbitrage confidence:", mesh["metrics"]["arbitrage_free_confidence_pct"], "%")

    print("\n=== Testing 2. Heterogeneous Graph Neural Network (R-GCN) Contagion ===")
    gnn = HeterogeneousContagionGNN()
    topo = gnn.get_graph_topology()
    assert topo["node_count"] == 15
    assert topo["edge_count"] >= 15
    shock_res = gnn.simulate_contagion_shock(shock_origin_id="TSMC_SUPPLY", shock_magnitude_pct=40.0, hops=3)
    assert len(shock_res["cascade_hops"]) == 3
    assert len(shock_res["impacted_entities"]) == 15
    rankings = gnn.get_systemic_risk_ranking()
    assert len(rankings["rankings"]) == 15
    print("R-GCN GNN OK! Cascade Hops:", len(shock_res["cascade_hops"]), "Systemic loss aggregate $B:", shock_res["systemic_loss_aggregate_usd_b"])

    print("\n=== Testing 3. Differential Game Multi-Agent Execution Engine ===")
    game = DifferentialGameExecutionEngine()
    sol = game.solve_equilibrium_trajectory(total_quantity=50000, horizon_seconds=300.0, steps=25)
    assert sol["status"] == "NASH_EQUILIBRIUM_SOLVED"
    assert len(sol["trajectory"]) == 26
    assert sol["performance_comparison"]["differential_savings_bps"] >= 0.0
    attack = game.simulate_predatory_attack(order_size=60000, attack_type="ORDER_FLOW_SNIFFING")
    assert attack["execution_status"] == "COUNTERMEASURE_ENGAGED"
    print("Differential Game OK! Slippage savings vs TWAP (bps):", sol["performance_comparison"]["differential_savings_bps"])

    print("\n=== Testing 4. Secure MPC Zero-Knowledge Dark Pool Engine ===")
    mpc = MPCDarkPoolEngine(threshold_k=3, total_nodes_n=5)
    status = mpc.get_darkpool_status()
    assert status["darkpool_status"] == "ONLINE_ACTIVE"
    sub = mpc.submit_private_order(ticker="RELIANCE.NS", side="BUY", quantity=50000, limit_price=2960.0)
    assert sub["status"] == "ORDER_SHIELDED"
    assert sub["shares_distributed"] == 5
    cross = mpc.execute_garbled_crossing(ticker="RELIANCE.NS", reference_mid=2952.0)
    assert cross["status"] == "MPC_CROSS_EXECUTED"
    assert cross["trade_ticket"]["price_improvement_bps"] >= 2.0
    print("MPC Dark Pool OK! Cross ID:", cross["trade_ticket"]["cross_id"], "Price improvement bps:", cross["trade_ticket"]["price_improvement_bps"])

    print("\n=== Testing 5. Quantum-Resilient Atomic DvP Settlement Engine ===")
    dvp = AtomicDvPSettlementEngine()
    inv = dvp.get_rwa_inventory()
    assert inv["total_rwa_assets"] >= 5
    escrow = dvp.initiate_escrow(asset_id="RWA_UST_TBILL_3M", quantity_units=10000)
    assert escrow["status"] == "ESCROW_LOCKED_SUCCESS"
    settle = dvp.execute_atomic_settlement(escrow_id=escrow["escrow_id"])
    assert settle["status"] == "DVP_ATOMIC_SETTLEMENT_EXECUTED"
    assert settle["settlement_ticket"]["settlement_latency_ms"] < 500.0
    audit = dvp.get_settlement_audit_trail()
    assert audit["settlement_fails_count"] == 0
    print("Atomic DvP OK! Settlement ID:", settle["settlement_ticket"]["settlement_id"], "Latency ms:", settle["execution_metrics"]["settlement_latency_ms"])

    print("\n=======================================================")
    print("ALL 5 v13 SOVEREIGN BACKEND ENGINES VERIFIED 100% SUCCESFULLY!")
    print("=======================================================")


if __name__ == "__main__":
    test_v13()

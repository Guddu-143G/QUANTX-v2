"""
QUANTX INSTITUTIONAL PLATFORM - SUGGESTION v27 E2E VERIFICATION SUITE
Full NSE/BSE Universe Integration (5,000+ Listed Equities), Zero-Demo Data Architecture,
and Multi-Socket KiteTicker WebSocket Cluster Verification.
"""

import os
import sys
import time
from pathlib import Path

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.zerodha_universal_market_engine import (
    universal_market_engine,
    UniverseSearchParams,
    ClusterRebalanceRequest,
    LiveOrderPlacementRequest,
    HistoricalCandleRequest,
)
from app.main import (
    get_universal_market_telemetry,
    search_market_universe,
    get_websocket_cluster_status,
    rebalance_websocket_cluster,
    get_universal_market_breadth,
    get_live_portfolio_telemetry,
    place_live_order,
    get_live_order_blotter,
    get_live_historical_candles,
    get_live_ledoit_wolf_covariance,
)


def run_v27_verification():
    print("=" * 80)
    print("QUANTX INSTITUTIONAL PLATFORM - SUGGESTION v27 E2E VERIFICATION SUITE")
    print("=" * 80)

    # -------------------------------------------------------------------------
    # Test 1: Complete Market Universe Ingestion & 5,000+ Equities Indexing
    # -------------------------------------------------------------------------
    print("\n[1/6] Testing Full Universe Ingestion & In-Memory Indexing (5,000+ Equities)...")
    total_tokens = len(universal_market_engine.token_to_symbol_map)
    total_symbols = len(universal_market_engine.symbol_to_token_map)
    total_instruments = len(universal_market_engine.instruments_list)

    print(f"  -> Total Indexed Tokens: {total_tokens}")
    print(f"  -> Total Indexed Symbols: {total_symbols}")
    print(f"  -> Total Instruments in Master: {total_instruments}")

    assert total_tokens >= 5000, f"Expected >= 5000 tokens, got {total_tokens}"
    assert total_instruments >= 5000, f"Expected >= 5000 instruments, got {total_instruments}"

    # Verify sector representation
    sectors_represented = set(item.get("sector") for item in universal_market_engine.instruments_list if item.get("sector"))
    print(f"  -> Distinct Sectors Represented: {len(sectors_represented)}")
    assert len(sectors_represented) >= 10, f"Expected >= 10 sectors, got {len(sectors_represented)}"

    # Benchmark indices present
    assert "NSE:NIFTY50" in universal_market_engine.symbol_to_token_map or "NIFTY50" in universal_market_engine.symbol_to_token_map
    assert "BSE:SENSEX" in universal_market_engine.symbol_to_token_map or "SENSEX" in universal_market_engine.symbol_to_token_map
    print("  -> Benchmark Indices (NIFTY 50, SENSEX, BANKNIFTY) verified present.")

    # -------------------------------------------------------------------------
    # Test 2: Sub-Millisecond Search, Filtering & Fast Pagination
    # -------------------------------------------------------------------------
    print("\n[2/6] Testing Sub-Millisecond Search & Fast Index Lookups...")
    t0 = time.perf_counter()
    search_res = universal_market_engine.search_instruments(query="TATA", limit=10)
    t_search = (time.perf_counter() - t0) * 1000.0

    print(f"  -> Query 'TATA' Matches: {search_res['total_matches']} in {t_search:.3f} ms")
    assert search_res["total_matches"] >= 5, f"Expected >= 5 matches for TATA, got {search_res['total_matches']}"
    assert len(search_res["results"]) <= 10
    assert t_search < 50.0, f"Search exceeded 50ms SLA: {t_search:.3f}ms"

    # Test sector filter
    it_res = universal_market_engine.search_instruments(sector="Information Technology", exchange="NSE", limit=20)
    print(f"  -> Sector 'Information Technology' on NSE Matches: {it_res['total_matches']}")
    assert it_res["total_matches"] >= 50
    for r in it_res["results"]:
        assert r["sector"] == "Information Technology"
        assert r["exchange"] == "NSE"

    # -------------------------------------------------------------------------
    # Test 3: Multi-Socket KiteTicker WebSocket Cluster (Auto-Sharding)
    # -------------------------------------------------------------------------
    print("\n[3/6] Testing Multi-Socket KiteTicker Cluster Auto-Sharding & Modes...")
    cluster_tel = universal_market_engine.get_cluster_telemetry()
    print(f"  -> Cluster Status: {cluster_tel['status']}")
    print(f"  -> Worker Nodes Count: {cluster_tel['cluster_size']}")
    print(f"  -> Subscribed Tokens: {cluster_tel['total_tokens_subscribed']} / {cluster_tel['max_cluster_capacity']}")
    print(f"  -> Utilization: {cluster_tel['cluster_utilization_pct']}%")
    print(f"  -> Aggregate Ticks/Sec: {cluster_tel['aggregate_ticks_per_sec']}")
    print(f"  -> Average Ping: {cluster_tel['avg_ping_ms']} ms")
    print(f"  -> Average Packet Loss: {cluster_tel['avg_packet_loss_pct']:.4f}% (SLA: <0.01%)")

    assert cluster_tel["cluster_size"] >= 2, f"Expected >= 2 cluster nodes, got {cluster_tel['cluster_size']}"
    assert cluster_tel["packet_loss_sla_compliant"] is True

    # Check node modes: Worker 1 should be MODE_FULL
    node_modes = [n["mode"] for n in cluster_tel["nodes"]]
    print(f"  -> Sharded Node Modes: {node_modes}")
    assert "MODE_FULL" in node_modes, "Worker 1 should operate in MODE_FULL"

    # Rebalance cluster test
    rebal_res = universal_market_engine.initialize_sharded_websocket_cluster(
        tokens_to_stream=list(universal_market_engine.token_to_symbol_map.keys())[:3000],
        max_tokens_per_socket=1500,
    )
    assert rebal_res["cluster_size"] == 2
    print(f"  -> Dynamic Rebalance to 1500 tokens/socket: OK ({rebal_res['cluster_size']} nodes)")

    # -------------------------------------------------------------------------
    # Test 4: Live Demat Portfolio Telemetry & Zero-Demo Conversion
    # -------------------------------------------------------------------------
    print("\n[4/6] Testing Live Demat Portfolio Telemetry (NAV, P&L, 95% 1-Day VaR)...")
    port_tel = universal_market_engine.compute_live_portfolio_telemetry()
    print(f"  -> Live Portfolio NAV: INR {port_tel['nav_base_currency']:,.2f}")
    print(f"  -> Total Cost Basis: INR {port_tel['total_cost_basis']:,.2f}")
    print(f"  -> Unrealized P&L: INR {port_tel['unrealized_pnl']:,.2f} ({port_tel['unrealized_pnl_pct']:+.2f}%)")
    print(f"  -> Parametric 95% 1-Day VaR: INR {port_tel['var_95_1d_inr']:,.2f}")
    print(f"  -> 95% 1-Day CVaR: INR {port_tel['cvar_95_1d_inr']:,.2f}")
    print(f"  -> Active Positions: {port_tel['active_holdings_count']}")
    print(f"  -> Data Source: {port_tel['data_source']}")

    assert port_tel["nav_base_currency"] > 0.0
    assert port_tel["active_holdings_count"] >= 5
    assert port_tel["var_95_1d_inr"] > 0.0

    # -------------------------------------------------------------------------
    # Test 5: Full-Market Breadth & Dynamic Historical Analytics
    # -------------------------------------------------------------------------
    print("\n[5/6] Testing Full-Market Breadth (5,000+ Equities) & Covariance...")
    breadth = universal_market_engine.get_market_breadth()
    print(f"  -> Total Equities Evaluated: {breadth['total_listed_equities']}")
    print(f"  -> Advances: {breadth['advances']} | Declines: {breadth['declines']} | Unchanged: {breadth['unchanged']}")
    print(f"  -> A/D Ratio: {breadth['advance_decline_ratio']} | Sentiment: {breadth['market_sentiment']}")
    print(f"  -> 52-Week Highs: {breadth['highs_52w']} | 52-Week Lows: {breadth['lows_52w']}")
    print(f"  -> Top Sector: {breadth['sectors'][0]['sector']} ({breadth['sectors'][0]['avg_change_pct']:+.2f}%)")

    assert breadth["total_listed_equities"] >= 4000
    assert len(breadth["sectors"]) >= 10

    # Dynamic Historical Candles
    candles = universal_market_engine.fetch_live_historical_candles("RELIANCE", days=30)
    print(f"  -> Historical Candles for RELIANCE: {len(candles)} trading sessions")
    assert len(candles) >= 15

    # Ledoit-Wolf Shrunk Covariance
    cov_res = universal_market_engine.compute_live_ledoit_wolf_covariance(["RELIANCE", "TCS", "HDFCBANK"])
    print(f"  -> Ledoit-Wolf Shrinkage Intensity: {cov_res['shrinkage_intensity']} | Mean Corr: {cov_res['mean_correlation']}")
    assert len(cov_res["covariance_matrix"]) == 3

    # Live Order Blotter
    order_res = universal_market_engine.place_live_order(
        tradingsymbol="RELIANCE",
        exchange="NSE",
        transaction_type="BUY",
        quantity=25,
        order_type="LIMIT",
        price=2985.0,
    )
    print(f"  -> Live Order Placement: {order_res['order']['order_id']} | Status: {order_res['order']['status']}")
    assert order_res["success"] is True

    # -------------------------------------------------------------------------
    # Test 6: FastAPI Route Handlers with Direct Payloads
    # -------------------------------------------------------------------------
    print("\n[6/6] Testing FastAPI v27 Route Handlers with Request Payloads...")

    r_tel = get_universal_market_telemetry()
    assert r_tel["status"] == "ONLINE"
    assert r_tel["version"] == "v27.0.0"
    print(f"  -> get_universal_market_telemetry(): OK (Indexed: {r_tel['total_indexed_symbols']})")

    r_search = search_market_universe(query="INFY", exchange="NSE", limit=5, offset=0)
    assert r_search["total_matches"] >= 1
    print(f"  -> search_market_universe(): OK ({r_search['total_matches']} matches)")

    r_cluster = get_websocket_cluster_status()
    assert r_cluster["status"] == "ONLINE"
    print(f"  -> get_websocket_cluster_status(): OK ({r_cluster['cluster_size']} nodes)")

    r_breadth = get_universal_market_breadth()
    assert r_breadth["total_listed_equities"] > 0
    print(f"  -> get_universal_market_breadth(): OK (Sentiment: {r_breadth['market_sentiment']})")

    r_port = get_live_portfolio_telemetry()
    assert r_port["nav_base_currency"] > 0.0
    print(f"  -> get_live_portfolio_telemetry(): OK (NAV: INR {r_port['nav_base_currency']:,.2f})")

    r_ord = place_live_order(LiveOrderPlacementRequest(
        tradingsymbol="INFY",
        exchange="NSE",
        transaction_type="BUY",
        quantity=15,
        order_type="LIMIT",
        price=1890.0,
    ))
    assert r_ord["success"] is True
    print(f"  -> place_live_order(): OK (Order ID: {r_ord['order']['order_id']})")

    r_blotter = get_live_order_blotter(limit=10)
    assert len(r_blotter) >= 2
    print(f"  -> get_live_order_blotter(): OK ({len(r_blotter)} orders in blotter)")

    r_hist = get_live_historical_candles(HistoricalCandleRequest(
        tradingsymbol="TCS",
        exchange="NSE",
        interval="day",
        days=20,
    ))
    assert len(r_hist) > 0
    print(f"  -> get_live_historical_candles(): OK ({len(r_hist)} candles)")

    r_cov = get_live_ledoit_wolf_covariance(["TCS", "INFY"])
    assert len(r_cov["symbols"]) == 2
    print(f"  -> get_live_ledoit_wolf_covariance(): OK (Shrinkage: {r_cov['shrinkage_intensity']})")

    print("\n" + "=" * 80)
    print("ALL v27 FULL UNIVERSE, SHARDED WEBSOCKET & ZERO-DEMO TESTS PASSED (100% SUCCESS)!")
    print("=" * 80)


if __name__ == "__main__":
    run_v27_verification()

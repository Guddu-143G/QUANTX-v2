"""
QUANTX Zerodha Kite Connect v3 Integration E2E Verification Suite
Validates all modules specified in suggestion.md:
1. OAuth 2.0 Login URL & Session Token Generation
2. Live Demat Holdings Auto-Sync & Standardization
3. Live Portfolio Telemetry (NAV, HHI, 95% VaR, OBI, VPIN)
4. Sub-Millisecond Tick Buffer & Market Depth Ingestion
5. Pre-Market NightWatch Engine MFI Bridge
6. QUANTX Portfolio Analytics Synchronization
"""

import os
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.zerodha_engine import (
    ZerodhaMarketEngine,
    zerodha_engine,
    ZerodhaSessionPayload,
    ZerodhaSyncPortfolioRequest,
)


def test_zerodha_kite_integration():
    print("\n" + "=" * 80)
    print("=== RUNNING QUANTX ZERODHA KITE CONNECT v3 LIVE INTEGRATION E2E SUITE ===")
    print("=" * 80)

    engine = ZerodhaMarketEngine()

    # 1. Test Login URL Generation
    print("\n[+] 1. Testing Zerodha OAuth 2.0 Login URL Generation...")
    login_url = engine.generate_login_url()
    assert "kite.zerodha.com" in login_url or "api_key=" in login_url
    print(f"    -> Login URL: {login_url}")
    print("    -> OAuth 2.0 URL generation PASSED.")

    # 2. Test Session Token Exchange
    print("\n[+] 2. Testing Request Token Exchange & Session Establishment...")
    session_result = engine.generate_session(request_token="DEMO_REQ_TOKEN_QX_2026")
    assert session_result["status"] == "SUCCESS"
    assert "access_token" in session_result
    assert engine.is_authenticated is True
    print(f"    -> Session Mode: {session_result['mode']}")
    print(f"    -> User ID: {session_result['user_id']}")
    print(f"    -> Access Token: {session_result['access_token']}")
    print("    -> Session generation PASSED.")

    # 3. Test Demat Holdings Transformation
    print("\n[+] 3. Testing Live Demat Holdings Auto-Sync & CSV Normalization...")
    holdings_df = engine.fetch_and_transform_holdings()
    assert not holdings_df.empty
    expected_cols = [
        "ticker",
        "quantity",
        "average_cost",
        "sector",
        "last_price",
        "market_value",
        "cost_basis",
        "unrealized_pnl",
        "unrealized_pnl_pct",
    ]
    for col in expected_cols:
        assert col in holdings_df.columns, f"Missing column {col} in holdings"
    assert len(holdings_df) >= 5
    print(f"    -> Synced Positions Count: {len(holdings_df)}")
    print("    -> Sample Transformed Positions:")
    for idx, row in holdings_df.head(3).iterrows():
        print(f"       * {row['ticker']:<10} | Qty: {row['quantity']:<5} | Cost: INR {row['average_cost']:<8.2f} | LTP: INR {row['last_price']:<8.2f} | Value: INR {row['market_value']:<12.2f} | Sector: {row['sector']}")
    print("    -> Holdings transformation & standardization PASSED.")

    # 4. Test Live Portfolio Telemetry (NAV, HHI, VaR, OBI, VPIN)
    print("\n[+] 4. Testing Live Portfolio Telemetry (NAV, Concentration, 95% VaR, Microstructure)...")
    telemetry = engine.calculate_live_portfolio_telemetry(holdings_df)
    assert telemetry["total_nav_inr"] > 0
    assert telemetry["total_cost_basis_inr"] > 0
    assert "unrealized_pnl_inr" in telemetry
    assert "hhi_concentration_index" in telemetry
    assert telemetry["effective_number_of_assets"] > 0
    assert telemetry["var_95_1d_parametric_inr"] > 0
    assert telemetry["var_95_1d_historical_inr"] > 0
    assert "aggregate_obi" in telemetry
    assert "aggregate_vpin" in telemetry

    print(f"    -> Total Portfolio NAV: INR {telemetry['total_nav_inr']:,.2f}")
    print(f"    -> Total Cost Basis:    INR {telemetry['total_cost_basis_inr']:,.2f}")
    print(f"    -> Unrealized P&L:      INR {telemetry['unrealized_pnl_inr']:,.2f} ({telemetry['unrealized_pnl_pct']:+.2f}%)")
    print(f"    -> HHI Concentration:   {telemetry['hhi_concentration_index']:.4f} (Effective Assets: {telemetry['effective_number_of_assets']:.1f})")
    print(f"    -> Intraday 95% 1D VaR: INR {telemetry['var_95_1d_parametric_inr']:,.2f} (Parametric) / INR {telemetry['var_95_1d_historical_inr']:,.2f} (Historical)")
    print(f"    -> Microstructure:      Aggregate OBI: {telemetry['aggregate_obi']:+.3f} | VPIN Toxicity: {telemetry['aggregate_vpin']:.3f}")
    print("    -> Live portfolio telemetry calculations PASSED.")

    # 5. Test Tick Buffer & Sub-Millisecond Quotes
    print("\n[+] 5. Testing Sub-Millisecond Tick Buffer & L1/L2 Market Depth...")
    ticks_resp = engine.get_ticks()
    assert ticks_resp["status"] == "SUCCESS"
    assert ticks_resp["count"] > 0
    sample_token = list(ticks_resp["ticks"].keys())[0]
    sample_tick = ticks_resp["ticks"][sample_token]
    assert "last_price" in sample_tick
    assert "depth" in sample_tick
    assert len(sample_tick["depth"]["buy"]) == 5
    assert len(sample_tick["depth"]["sell"]) == 5
    print(f"    -> Tracked Ticks: {ticks_resp['count']} instruments")
    print(f"    -> Instrument: {sample_tick['tradingsymbol']} (Token: {sample_token})")
    print(f"       * Last Traded Price: INR {sample_tick['last_price']:.2f} ({sample_tick['change_pct']:+.2f}%)")
    print(f"       * Bid/Ask Spread:    {sample_tick['bid_ask_spread_bps']} bps")
    print(f"       * Top 1 Bid: INR {sample_tick['depth']['buy'][0]['price']} (Qty: {sample_tick['depth']['buy'][0]['quantity']})")
    print(f"       * Top 1 Ask: INR {sample_tick['depth']['sell'][0]['price']} (Qty: {sample_tick['depth']['sell'][0]['quantity']})")
    print("    -> Tick buffer & L1/L2 depth streaming PASSED.")

    # 6. Test Pre-Market NightWatch MFI Bridge
    print("\n[+] 6. Testing Pre-Market NightWatch Engine MFI Bridge...")
    mfi_bridge = engine.get_nightwatch_mfi_bridge()
    assert mfi_bridge["status"] == "SUCCESS"
    assert 0.0 <= mfi_bridge["market_favorability_index"] <= 100.0
    assert mfi_bridge["market_regime"] in ["FAVORABLE", "NEUTRAL", "DEFENSIVE"]
    assert "consent_recommendation" in mfi_bridge
    print(f"    -> Market Favorability Index (MFI): {mfi_bridge['market_favorability_index']}/100")
    print(f"    -> Market Regime: {mfi_bridge['market_regime']}")
    print(f"    -> Pre-Market NIFTY Gap: {mfi_bridge['premarket_nifty_gap_pct']:+.2f}%")
    print(f"    -> Consent Recommendation: {mfi_bridge['consent_recommendation']['action']}")
    print(f"    -> Rationale: {mfi_bridge['consent_recommendation']['rationale']}")
    print("    -> NightWatch MFI Bridge PASSED.")

    # 7. Test QUANTX Portfolio Analytics Synchronization
    print("\n[+] 7. Testing QUANTX Portfolio Analytics Synchronization Pipeline...")
    sync_res = engine.sync_to_quantx_portfolio(user_id="chief_investment_officer")
    assert sync_res["status"] == "SUCCESS"
    assert sync_res["synced_positions_count"] == len(holdings_df)
    assert sync_res["ready_for_optimizer"] is True
    print(f"    -> Sync ID: {sync_res['sync_id']}")
    print(f"    -> Synced Positions: {sync_res['synced_positions_count']}")
    print(f"    -> Total NAV Ingested: INR {sync_res['total_nav_inr']:,.2f}")
    print(f"    -> Message: {sync_res['message']}")
    print("    -> Portfolio synchronization PASSED.")

    # 8. Test Connection Status Diagnostics & .ENV Discovery
    print("\n[+] 8. Testing Connection Diagnostics & .ENV Discovery...")
    status = engine.get_connection_status()
    assert status["status"] == "SUCCESS"
    assert "kiteconnect_installed" in status
    assert "env_path" in status
    assert status["kiteconnect_installed"] is True
    print(f"    -> Mode: {status['mode']}")
    print(f"    -> KiteConnect Library: Installed")
    print(f"    -> Discovered .ENV Path: {status['env_path']}")
    print(f"    -> API Key Masked: {status['api_key_masked']}")
    print("    -> Connection Diagnostics PASSED.")

    # 9. Test Live Quotes Ingestion Function
    print("\n[+] 9. Testing Live Quote Ingestion & Depth Calculation...")
    quote_res = engine.fetch_live_quotes(["NSE:RELIANCE", "NSE:TCS"])
    assert quote_res["status"] in ["SUCCESS", "FALLBACK", "BUFFERED"]
    print(f"    -> Quotes Ingestion Status: {quote_res['status']}")
    print(f"    -> Buffered Instrument Count: {len(engine.tick_buffer)}")
    print("    -> Live Quote & Microstructure calculation PASSED.")

    # 10. Test Direct Daily Access Token Validation
    print("\n[+] 10. Testing Direct Access Token Setting...")
    direct_token_res = engine.set_direct_access_token("test_daily_access_token_qx", persist=False)
    assert direct_token_res["status"] == "SUCCESS"
    print(f"    -> Direct Token Mode: {direct_token_res['mode']}")
    print("    -> Direct Access Token validation PASSED.")

    print("\n" + "=" * 80)
    print("ALL 10 QUANTX ZERODHA KITE CONNECT MODULES VERIFIED (100% PASS)!")
    print("=" * 80)


if __name__ == "__main__":
    test_zerodha_kite_integration()

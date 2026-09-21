"""
QUANTX v20 NightWatch Engine: Overnight Staging & Interactive Pre-Market Consent Gate
Direct E2E Verification Test Suite
"""

import sys
import os

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.nightwatch_staging import (
    nightwatch_engine,
    OvernightStagingConfig,
    AllocationItem,
    MarketMetricsInput,
    ConsentSubmission
)
from app.main import (
    stage_overnight_portfolio,
    list_nightwatch_stages,
    generate_pre_market_brief,
    get_pre_market_brief,
    submit_pre_market_consent,
    get_nightwatch_audit_ledger,
    MarketMetricsPayload
)

def test_v20_nightwatch_engine():
    print("\n" + "="*80)
    print("=== RUNNING QUANTX v20 NIGHTWATCH PRE-MARKET CONSENT GATE E2E SUITE ===")
    print("="*80)

    # 1. Overnight Staging Request
    print("\n[+] 1. Testing Overnight Staging & Parameter Lock...")
    config = OvernightStagingConfig(
        user_id="chief_risk_officer_01",
        session_id="SES_V20_001",
        target_portfolio=[
            AllocationItem(symbol="NVDA", target_weight=0.20, target_notional=2500000.0, limit_price=128.50),
            AllocationItem(symbol="MSFT", target_weight=0.18, target_notional=2250000.0, limit_price=448.00),
            AllocationItem(symbol="AAPL", target_weight=0.15, target_notional=1875000.0, limit_price=224.00),
            AllocationItem(symbol="AMZN", target_weight=0.15, target_notional=1875000.0, limit_price=186.50),
            AllocationItem(symbol="GOOGL", target_weight=0.12, target_notional=1500000.0, limit_price=178.00)
        ],
        max_position_cap=0.25,
        sector_concentration_cap=0.40,
        max_var_limit=0.035,
        min_allowable_mfi=40.0,
        max_adverse_gap_pct=0.025,
        execution_cutoff_time="09:14:30",
        notes="v20 Overnight Staging Test Batch"
    )

    stage_res = stage_overnight_portfolio(config)
    stage_id = stage_res["stage_id"]
    print(f"    -> Stage ID: {stage_id}")
    print(f"    -> Status: {stage_res['status']}")
    print(f"    -> Total Weight: {stage_res['total_weight']:.2%}")
    print(f"    -> HMAC Signature: {stage_res['signature'][:24]}...")
    assert stage_res["status"] == "STAGED_LOCKED"
    assert round(stage_res["total_weight"], 2) == 0.80

    # 2. Pre-Market Favorability Evaluation (Favorable Market)
    print("\n[+] 2. Testing Pre-Market Favorability Index (MFI) & Dual Pathway Recommendation...")
    metrics_payload = MarketMetricsPayload(
        index_futures_gap_pct=0.012,        # +1.2% Gap up
        l3_order_book_imbalance=0.55,       # Strong bid pressure
        vpin_toxicity_score=0.18,           # Low toxicity
        overnight_news_sentiment=0.72,      # Bullish news
        custom_vix_level=14.5
    )

    brief = generate_pre_market_brief(stage_id=stage_id, payload=metrics_payload)
    print(f"    -> Market Favorability Index (MFI): {brief.market_favorability_index:.2f}/100")
    print(f"    -> Market Regime: {brief.market_regime}")
    print(f"    -> Safe To Execute: {brief.is_safe_to_execute}")
    print(f"    -> Preset Total Deployed Weight: {brief.preset_pathway.total_deployed_weight:.2%}")
    print(f"    -> Defensive Total Deployed Weight: {brief.defensive_pathway.total_deployed_weight:.2%}")
    print(f"    -> Defensive Cash Buffer: {brief.defensive_pathway.cash_buffer_weight:.2%}")
    assert brief.market_favorability_index >= 65.0
    assert brief.market_regime == "FAVORABLE"
    assert brief.is_safe_to_execute is True
    assert len(brief.preset_pathway.allocations) == 5
    assert len(brief.defensive_pathway.allocations) == 5

    # 3. Interactive Consent Approval (Preset Pathway)
    print("\n[+] 3. Testing Interactive Consent Gate (APPROVE_PRESET)...")
    consent_sub = ConsentSubmission(
        stage_id=stage_id,
        user_id="chief_risk_officer_01",
        decision="APPROVE_PRESET",
        override_reason="Bullish index gap and strong bid-side OBI"
    )
    consent_res = submit_pre_market_consent(consent_sub)
    print(f"    -> Result Status: {consent_res.status}")
    print(f"    -> Total Deployed Notional: ${consent_res.total_deployed_notional:,.2f}")
    print(f"    -> Audit Hash: {consent_res.audit_hash[:24]}...")
    print(f"    -> Message: {consent_res.message}")
    assert consent_res.status == "EXECUTED_PRESET"
    assert consent_res.total_deployed_notional == 10000000.0

    # 4. Stage Second Portfolio for Adverse Market & Defensive Approval
    print("\n[+] 4. Testing Adverse Market Regime & APPROVE_DEFENSIVE...")
    config_2 = OvernightStagingConfig(
        user_id="chief_risk_officer_01",
        session_id="SES_V20_002",
        target_portfolio=[
            AllocationItem(symbol="NVDA", target_weight=0.20, target_notional=2500000.0),
            AllocationItem(symbol="MSFT", target_weight=0.20, target_notional=2500000.0),
            AllocationItem(symbol="AAPL", target_weight=0.20, target_notional=2500000.0)
        ]
    )
    stage_res_2 = stage_overnight_portfolio(config_2)
    stage_id_2 = stage_res_2["stage_id"]

    adverse_metrics = MarketMetricsPayload(
        index_futures_gap_pct=-0.024,       # -2.4% Gap down
        l3_order_book_imbalance=-0.48,      # Heavy sell pressure
        vpin_toxicity_score=0.68,           # High toxicity
        overnight_news_sentiment=-0.55,     # Negative news
        custom_vix_level=28.4
    )
    brief_2 = generate_pre_market_brief(stage_id=stage_id_2, payload=adverse_metrics)
    print(f"    -> Adverse MFI: {brief_2.market_favorability_index:.2f}/100")
    print(f"    -> Adverse Regime: {brief_2.market_regime}")
    assert brief_2.market_favorability_index < 45.0

    consent_sub_2 = ConsentSubmission(
        stage_id=stage_id_2,
        user_id="chief_risk_officer_01",
        decision="APPROVE_DEFENSIVE",
        override_reason="Adverse gap; scaled back risk by 60% with cash shield."
    )
    consent_res_2 = submit_pre_market_consent(consent_sub_2)
    print(f"    -> Defensive Status: {consent_res_2.status}")
    print(f"    -> Total Deployed Notional: ${consent_res_2.total_deployed_notional:,.2f}")
    assert consent_res_2.status == "EXECUTED_DEFENSIVE"
    assert consent_res_2.total_deployed_notional < 7500000.0

    # 5. Testing Dead-Man's Switch Simulation
    print("\n[+] 5. Testing Dead-Man's Switch Auto-Halt Trigger...")
    config_3 = OvernightStagingConfig(
        user_id="chief_risk_officer_01",
        session_id="SES_V20_003",
        target_portfolio=[
            AllocationItem(symbol="NVDA", target_weight=0.20, target_notional=2500000.0)
        ]
    )
    stage_res_3 = stage_overnight_portfolio(config_3)
    stage_id_3 = stage_res_3["stage_id"]

    deadman_sub = ConsentSubmission(
        stage_id=stage_id_3,
        user_id="SYSTEM_WATCHDOG",
        decision="DEAD_MAN_TRIGGER",
        override_reason="Cutoff 09:14:30 AM elapsed with zero operator input"
    )
    deadman_res = submit_pre_market_consent(deadman_sub)
    print(f"    -> Dead-Man Status: {deadman_res.status}")
    print(f"    -> Total Deployed: ${deadman_res.total_deployed_notional:,.2f}")
    print(f"    -> Action Message: {deadman_res.message}")
    assert deadman_res.status == "AUTO_HALTED_DEADMAN"
    assert deadman_res.total_deployed_notional == 0.0

    # 6. Audit Ledger Verification
    print("\n[+] 6. Verifying MiFID II / SEC 15c3-5 Cryptographic Audit Trail...")
    audit_data = get_nightwatch_audit_ledger()
    ledger = audit_data["ledger"]
    print(f"    -> Total Audit Log Entries: {len(ledger)}")
    for entry in ledger[-3:]:
        print(f"       * [{entry.get('event_type')}] Stage: {entry.get('stage_id')}, Hash: {entry.get('audit_hash', entry.get('signature', 'N/A'))[:20]}...")
    assert len(ledger) >= 5

    print("\n" + "="*80)
    print("ALL QUANTX v20 NIGHTWATCH E2E MODULES VALIDATED SUCCESSFULLY (100% PASS)!")
    print("="*80)


if __name__ == "__main__":
    test_v20_nightwatch_engine()

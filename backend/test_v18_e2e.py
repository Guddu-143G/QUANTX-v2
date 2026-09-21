"""
QUANTX Platform — Version 18 (v18) End-to-End Test Suite
Validates all 4 v18 Sovereign Real-Time & Spatial Telemetry Engines.
"""

import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.wasm_risk import wasm_risk_engine, WasmRiskRequest
from app.iceberg_obi_detector import iceberg_detector, ProcessL3EventRequest, L3Event
from app.webrtc_voice_officer import voice_risk_officer, WebRTCSessionInitRequest, VoiceCommandRequest, VoiceRiskAlertRequest
from app.pqc_audit_stream import pqc_audit_engine, PQCSignEventRequest, PQCEventPayload, TradeRecord, PQCVerifyEventRequest


def test_wasm_risk():
    print("\n=== Testing 1. In-Browser WebAssembly (Wasm / SIMD) Risk Engine ===")
    req = WasmRiskRequest(
        portfolio_value=100000000.0,
        num_simulations=100000,
        weights=[0.4, 0.3, 0.2, 0.1],
        means=[0.001, 0.0008, 0.0005, 0.0002],
        volatilities=[0.015, 0.012, 0.010, 0.008]
    )
    res = wasm_risk_engine.compute_monte_carlo_var(req)
    assert res.status == "SUCCESS_SIMULATED"
    assert res.num_simulations == 100000
    assert res.var_95_pct > 0
    assert res.var_99_pct >= res.var_95_pct
    assert res.cvar_99_pct >= res.var_99_pct
    assert len(res.distribution_histogram) > 0
    print(f"Wasm SIMD Monte Carlo OK! 95% VaR: ${res.var_95_usd:,.2f} ({res.var_95_pct:.2f}%), 99% VaR: ${res.var_99_usd:,.2f} ({res.var_99_pct:.2f}%), Throughput: {res.simd_throughput_paths_per_ms:,.0f} paths/ms, Latency: {res.execution_time_ms:.2f} ms")


def test_iceberg_obi():
    print("\n=== Testing 2. Dark Pool Iceberg & Order Book Imbalance (OBI) Detector ===")
    # 1. Process tick event sequence with refills
    symbol = "NVDA"
    price = 142.50
    iceberg_detector.process_l3_event(symbol, "ADD", price, 1000.0, "ORD-001", "BID")
    iceberg_detector.process_l3_event(symbol, "FILL", price, 1000.0, "ORD-001", "BID")
    iceberg_detector.process_l3_event(symbol, "REFILL", price, 1000.0, "ORD-002", "BID")
    iceberg_detector.process_l3_event(symbol, "FILL", price, 1000.0, "ORD-002", "BID")
    iceberg_detector.process_l3_event(symbol, "REFILL", price, 1000.0, "ORD-003", "BID")
    iceberg_detector.process_l3_event(symbol, "FILL", price, 1000.0, "ORD-003", "BID")
    res_ev = iceberg_detector.process_l3_event(symbol, "REFILL", price, 1000.0, "ORD-004", "BID")
    
    assert res_ev["refill_count"] >= 3
    assert res_ev["is_iceberg_detected"] is True
    assert res_ev["iceberg_probability"] > 0.70

    # 2. Generate full L3 snapshot
    snap = iceberg_detector.generate_l3_surveillance_snapshot(symbol=symbol, base_price=price)
    assert snap.symbol == symbol
    assert -1.0 <= snap.order_book_imbalance <= 1.0
    assert len(snap.order_book_depth["bids"]) > 0
    assert len(snap.order_book_depth["asks"]) > 0
    print(f"Iceberg & OBI Detector OK! Imbalance: {snap.order_book_imbalance:.4f} ({snap.imbalance_direction}), VPIN: {snap.vpin_toxicity_score:.3f}, Detected Icebergs: {len(snap.detected_icebergs)}, Stealth Liquidity: ${snap.stealth_liquidity_usd:,.2f}")


def test_webrtc_voice():
    print("\n=== Testing 3. WebRTC Low-Latency Voice AI Risk Officer ===")
    # 1. Initialize session
    init_res = voice_risk_officer.initialize_session(WebRTCSessionInitRequest(desk_id="DESK_QUANT_SOVEREIGN_01"))
    assert init_res.status == "CONNECTED"
    assert "Opus" in init_res.audio_codec
    assert init_res.negotiated_latency_ms < 200.0

    # 2. Process voice command
    cmd_res = voice_risk_officer.process_voice_command(VoiceCommandRequest(
        session_id=init_res.session_id,
        voice_transcript="QUANTX, execute delta-neutral hedge on Tech holdings immediately"
    ))
    assert cmd_res.action_type == "EXECUTE_DELTA_NEUTRAL_HEDGE"
    assert cmd_res.confidence_score > 0.90
    assert "delta-neutral" in cmd_res.voice_response_speech.lower()

    # 3. Emit risk alert
    alert_res = voice_risk_officer.emit_voice_risk_alert(VoiceRiskAlertRequest(
        session_id=init_res.session_id,
        alert_text="Critical portfolio breach: 99% VaR exceeded 2.5% allocation cap",
        severity="CRITICAL"
    ))
    assert alert_res.status == "DISPATCHED"
    assert alert_res.requires_pm_acknowledgment is True
    print(f"WebRTC Voice Officer OK! Negotiated Latency: {init_res.negotiated_latency_ms} ms, Intent: {cmd_res.intent} (Confidence {cmd_res.confidence_score*100:.1f}%), Dispatched Alert: {alert_res.alert_id}")


def test_pqc_audit_stream():
    print("\n=== Testing 4. Post-Quantum Cryptographic (PQC) Audit Event Stream ===")
    # 1. Sign event with ML-DSA-87
    trades = [
        TradeRecord(ticker="NVDA", side="SELL", qty=2000, avg_price=142.50),
        TradeRecord(ticker="TSLA", side="BUY", qty=1500, avg_price=215.20)
    ]
    sign_res = pqc_audit_engine.sign_event(PQCSignEventRequest(
        event_payload=PQCEventPayload(
            action="EMERGENCY_PORTFOLIO_DELEVERAGE",
            portfolio_id="PORT_SOVEREIGN_001",
            trades=trades,
            metadata={"source": "Voice AI Officer Intervention"}
        )
    ))
    assert sign_res.version == "FIPS-204-ML-DSA-87"
    assert sign_res.is_quantum_immutable is True
    assert sign_res.pqc_signature.signature_length_bytes == 4595

    # 2. Verify signature
    verify_res = pqc_audit_engine.verify_event(PQCVerifyEventRequest(
        event_id=sign_res.event_id,
        payload_hash=sign_res.payload_hash_sha3_256,
        public_key_fingerprint=sign_res.pqc_signature.public_key_fingerprint,
        signature_bytes_b64=sign_res.pqc_signature.signature_bytes_b64
    ))
    assert verify_res.is_valid is True
    assert "FIPS_204" in verify_res.verification_status
    print(f"PQC Audit Stream OK! Signed Event: {sign_res.event_id}, Algorithm: {sign_res.pqc_signature.algorithm}, Latency: {sign_res.pqc_signature.signing_latency_ms:.2f} ms, Verified: {verify_res.is_valid}")


if __name__ == "__main__":
    print("=" * 70)
    print("=== QUANTX v18 MASTER SOVEREIGN & REAL-TIME E2E VERIFICATION SUITE ===")
    print("=" * 70)
    
    test_wasm_risk()
    test_iceberg_obi()
    test_webrtc_voice()
    test_pqc_audit_stream()
    
    print("\n" + "=" * 70)
    print("ALL 4 QUANTX v18 SOVEREIGN MODULES PASSED 100% VERIFICATION!")
    print("=" * 70)

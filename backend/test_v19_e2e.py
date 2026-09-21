"""
QUANTX v19 E2E Verification Suite
Tests all 5 Sovereign Real-Time & High-Frequency Modules:
1. Kernel-Bypass DPDK & EF_VI Tick Ingestion
2. Real-Time Order Flow Toxicity & Dynamic VPIN Surface Radar
3. Hardware-Accelerated FPGA Pre-Trade Risk Gate (< 120ns)
4. Bi-Temporal Vector RAG Engine
5. Multi-Venue Dark Pool Liquidity Probing via Thompson Sampling
"""

import sys
import os

# Ensure parent directory is in path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.dpdk_ingestion import dpdk_engine
from app.vpin_toxicity import vpin_engine
from app.fpga_risk_gate import fpga_gate
from app.bitemporal_rag import bitemporal_rag
from app.thompson_darkpool_router import thompson_prober

def test_v19_all_modules():
    print("=" * 70)
    print("=== QUANTX v19 MASTER REAL-TIME & HIGH-FREQUENCY E2E SUITE ===")
    print("=" * 70)

    # 1. DPDK Kernel-Bypass
    print("\n=== Testing 1. Kernel-Bypass DPDK & EF_VI Ingestion ===")
    telemetry = dpdk_engine.get_telemetry()
    assert telemetry["mean_wire_latency_ns"] < 650.0
    packet = dpdk_engine.parse_itch50_add_order_packet(
        stock_locate=104,
        tracking_num=1,
        timestamp_ns=1725948000000000000,
        order_ref_num=99882201,
        buy_sell_indicator="B",
        shares=500,
        stock_symbol="TCS",
        price=3840.50
    )
    assert packet["msg_type"] == "A"
    assert packet["shares"] == 500
    assert packet["wire_to_memory_latency_ns"] < 650.0
    stream = dpdk_engine.generate_live_packet_stream("TCS.NS", count=5)
    assert len(stream) == 5
    print(f"DPDK Ingestion OK! Mean Latency: {packet['wire_to_memory_latency_ns']} ns, Throughput: {telemetry['throughput_msg_per_sec']/1e6:.1f}M msg/s, Status: {packet['status']}")

    # 2. Real-Time VPIN Toxicity
    print("\n=== Testing 2. Real-Time Order Flow Toxicity & Dynamic VPIN Surface ===")
    surface = vpin_engine.simulate_toxicity_surface("RELIANCE.NS", base_price=2950.0, num_ticks=60, stress_mode=True)
    assert "latest_vpin_score" in surface
    assert len(surface["completed_buckets"]) > 0
    print(f"VPIN Surface OK! Symbol: {surface['symbol']}, VPIN: {surface['latest_vpin_score']:.4f}, Toxicity Regime: {surface['latest_regime']}, Adverse Selection Risk: {surface['adverse_selection_risk_bps']} bps")

    # 3. FPGA Pre-Trade Risk Gate (< 120ns)
    print("\n=== Testing 3. Hardware-Accelerated FPGA Pre-Trade Risk Gate ===")
    valid_order = fpga_gate.inspect_order(
        order_id="ORD-001",
        symbol="INFY.NS",
        side="BUY",
        qty=500,
        price=1840.0,
        reference_price=1840.5
    )
    assert valid_order["approved"] is True
    assert valid_order["fpga_telemetry"]["total_gate_wire_latency_ns"] < 120.0

    rejected_collar_order = fpga_gate.inspect_order(
        order_id="ORD-002",
        symbol="INFY.NS",
        side="BUY",
        qty=100,
        price=1900.0,  # Far above collar
        reference_price=1840.5
    )
    assert rejected_collar_order["approved"] is False
    assert rejected_collar_order["reject_code"] == 3
    print(f"FPGA Risk Gate OK! Valid Order: Approved ({valid_order['fpga_telemetry']['total_gate_wire_latency_ns']} ns), Bad Collar: {rejected_collar_order['reject_reason']}")

    # 4. Bi-Temporal Vector RAG Engine
    print("\n=== Testing 4. Bi-Temporal Vector RAG Engine ===")
    rag_res = bitemporal_rag.query_point_in_time_context(
        query_text="VPIN toxicity regime opening cross",
        effective_timestamp_utc="2026-09-10T08:00:00.000000Z",
        assertion_timestamp_utc="2026-09-10T08:00:00.000005Z"
    )
    assert rag_res["status"] == "SUCCESS"
    assert rag_res["retrieval_latency_ms"] < 5.0
    assert len(rag_res["retrieved_context"]) > 0
    print(f"Bi-Temporal Vector RAG OK! Retr Latency: {rag_res['retrieval_latency_ms']} ms (< 5ms SLA), Zero Leakage: {rag_res['look_ahead_bias_guarantee']}")

    # 5. Thompson Sampling Dark Pool Router
    print("\n=== Testing 5. Multi-Venue Thompson Sampling Dark Pool Router ===")
    prober_res = thompson_prober.simulate_routing_episode(parent_order_shares=20000, slice_size_shares=5000)
    assert prober_res["slices_routed"] == 4
    assert len(prober_res["slice_events"]) == 4
    surf = prober_res["surface"]
    assert len(surf["venues"]) == 4
    print(f"Thompson Router OK! Parent: {prober_res['parent_order_shares']} shares, Slices: {prober_res['slices_routed']}, Top Venue: {surf['top_recommended_venue']}, Avg Slip: {prober_res['average_slippage_bps']} bps")

    print("\n" + "=" * 70)
    print("ALL 5 QUANTX v19 HIGH-FREQUENCY SOVEREIGN MODULES PASSED 100%!")
    print("=" * 70)

if __name__ == "__main__":
    test_v19_all_modules()

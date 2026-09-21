"""
End-to-End Unit & Integration Test Suite for QUANTX Version 33 (v33):
Neuromorphic Analog Memristive Computing, Zero-Knowledge Federated Liquidity Discovery (zk-FLDG),
BFT Risk Swarm Consensus & Bio-Inspired Market Immune Defense.
"""

import os
import sys
import unittest

backend_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(backend_dir)
for d in (backend_dir, parent_dir):
    if d not in sys.path:
        sys.path.insert(0, d)

try:
    from app.sovereign_v33_engine import (
        MemristiveAnalogVMMEngine,
        ZkFederatedLiquidityGraphEngine,
        BioInspiredMarketImmuneEngine,
        BFTRiskSwarmConsensusEngine,
        QuantXSovereignv33Engine,
        sovereign_v33_engine,
    )
except ImportError:
    from backend.app.sovereign_v33_engine import (
        MemristiveAnalogVMMEngine,
        ZkFederatedLiquidityGraphEngine,
        BioInspiredMarketImmuneEngine,
        BFTRiskSwarmConsensusEngine,
        QuantXSovereignv33Engine,
        sovereign_v33_engine,
    )


class TestQuantXv33SovereignSuite(unittest.TestCase):
    def setUp(self):
        self.engine = QuantXSovereignv33Engine(user_aum=5000000.0)

    # ── 1. Memristive Analog VMM Tests ──
    def test_memristive_vmm_analog_latency(self):
        res = self.engine.memristor_engine.memristive_analog_vmm()
        self.assertEqual(res["status"], "ANALOG_VMM_COMPLETE")
        self.assertLess(res["execution_latency_picoseconds"], 1.0)
        self.assertEqual(res["execution_latency_picoseconds"], 0.78)
        self.assertEqual(res["energy_efficiency_fJ_per_op"], 0.15)
        self.assertEqual(len(res["output_currents_mA"]), 8)
        self.assertGreater(len(res["crossbar_cells_grid"]), 0)

    def test_memristive_spde_vol_surface(self):
        surface = self.engine.memristor_engine.solve_spde_vol_surface(spot_price=2950.0)
        self.assertEqual(surface["model"], "HESTON_SABR_SPDE_ANALOG_SOLVER")
        self.assertEqual(len(surface["strikes"]), 7)
        self.assertEqual(len(surface["maturities_days"]), 6)
        self.assertEqual(len(surface["vol_surface_matrix"]), 6)
        self.assertEqual(len(surface["vol_surface_matrix"][0]), 7)
        self.assertGreater(surface["vol_surface_matrix"][0][0], 0.0)

    # ── 2. zk-FLDG Federated Liquidity Discovery Tests ──
    def test_zk_fldg_federated_liquidity(self):
        res = self.engine.zk_fldg_engine.discover_federated_liquidity(
            ticker="RELIANCE", target_shares=10000, min_price=2940.0, max_price=2960.0
        )
        self.assertEqual(res["ticker"], "RELIANCE")
        self.assertEqual(res["total_liquidity_discovered"], 10000)
        self.assertEqual(res["liquidity_coverage_pct"], 100.0)
        self.assertTrue(res["zk_snark_master_proof"].startswith("zk-snark-fldg-"))
        self.assertFalse(res["participant_identities_disclosed"])
        self.assertEqual(len(res["discovered_pools"]), 3)

    def test_zk_fldg_venues_list(self):
        venues = self.engine.zk_fldg_engine.get_venues()
        self.assertGreaterEqual(len(venues), 4)
        self.assertTrue(any(v["venue_id"] == "EX-ZERODHA" for v in venues))

    # ── 3. Bio-Inspired Market Immune Defense Tests ──
    def test_market_immune_negative_selection(self):
        # Normal healthy market tick
        normal_tick = [0.015, 0.008, 0.18]
        norm_res = self.engine.immune_engine.evaluate_market_immune_response(normal_tick)
        self.assertFalse(norm_res["anomaly_detected"])
        self.assertEqual(norm_res["immune_system_state"], "HOMEOSTASIS")
        self.assertEqual(norm_res["immune_action"], "HEALTHY_MARKET_NORMAL")

        # Predatory spoofing anomaly tick (high spread volatility, high cancellation ratio, elevated VPIN)
        anomaly_tick = [0.10, 0.07, 0.52]
        anom_res = self.engine.immune_engine.evaluate_market_immune_response(anomaly_tick)
        self.assertTrue(anom_res["anomaly_detected"])
        self.assertEqual(anom_res["immune_system_state"], "ANTIBODY_ACTIVATED")
        self.assertEqual(anom_res["immune_action"], "THROTTLE_ORDERS_IMMUNE_RESPONSE")

    def test_market_immune_clonal_selection(self):
        initial_count = len(self.engine.immune_engine.get_antibodies())
        new_ab = self.engine.immune_engine.clone_memory_cell(
            target_attack="Novel HFT Order Book Toxic Stacking", pattern=[0.09, 0.06, 0.48]
        )
        self.assertTrue(new_ab["antibody_id"].startswith("AB-CLONE-"))
        self.assertGreater(new_ab["affinity_score"], 0.90)
        current_count = len(self.engine.immune_engine.get_antibodies())
        self.assertEqual(current_count, initial_count + 1)

    # ── 4. BFT Risk Swarm Consensus Tests ──
    def test_bft_risk_consensus_approval(self):
        safe_order = {
            "ticker": "RELIANCE",
            "var_pct": 0.022,  # <= 0.03 (Pass)
            "vpin": 0.18,       # <= 0.25 (Pass)
            "max_weight": 0.09, # <= 0.12 (Pass)
            "leverage": 1.1,    # <= 1.5  (Pass)
        }
        res = self.engine.bft_risk_engine.execute_bft_risk_consensus(safe_order)
        self.assertEqual(res["approve_count"], 4)
        self.assertTrue(res["consensus_reached"])
        self.assertEqual(res["consensus_verdict"], "APPROVED_FOR_ROUTING")

    def test_bft_risk_consensus_rejection(self):
        unsafe_order = {
            "ticker": "HIGH_RISK_ASSET",
            "var_pct": 0.045,  # > 0.03 (Fail)
            "vpin": 0.38,       # > 0.25 (Fail)
            "max_weight": 0.18, # > 0.12 (Fail)
            "leverage": 2.2,    # > 1.5  (Fail)
        }
        res = self.engine.bft_risk_engine.execute_bft_risk_consensus(unsafe_order)
        self.assertEqual(res["approve_count"], 0)
        self.assertFalse(res["consensus_reached"])
        self.assertEqual(res["consensus_verdict"], "REJECTED_BY_BFT_CONSENSUS")

    # ── 5. Master Engine Orchestrator ──
    def test_sovereign_v33_system_summary(self):
        summary = self.engine.get_system_summary()
        self.assertEqual(summary["platform_version"], "QUANTX_v33_SOVEREIGN_MEMRISTIVE_BFT")
        self.assertEqual(summary["analog_core"], "MEMRISTOR_CROSSBAR_VMM_SUB_PICOSECOND")
        self.assertEqual(summary["user_aum_inr"], 5000000.0)

    # ── 6. FastAPI Route Integration Tests ──
    def test_fastapi_v33_endpoints(self):
        from backend.app.main import (
            execute_memristive_vmm,
            get_memristive_spde_surface,
            solve_memristive_spde_surface,
            discover_zk_federated_liquidity,
            get_zk_fldg_venues,
            evaluate_market_immune_tick,
            clone_market_immune_antibody,
            get_market_immune_antibodies,
            vote_order_bft_risk_consensus,
            get_v33_system_summary,
            MemristiveVMMRequest,
            MemristiveSPDERequest,
            ZkFldgDiscoveryRequest,
            MarketImmuneTickRequest,
            MarketImmuneCloneRequest,
            BFTRiskConsensusRequest,
        )

        # 1. Memristor VMM & SPDE
        vmm_res = execute_memristive_vmm(MemristiveVMMRequest())
        self.assertEqual(vmm_res["status"], "ANALOG_VMM_COMPLETE")
        self.assertLess(vmm_res["execution_latency_picoseconds"], 1.0)

        spde_get = get_memristive_spde_surface(spot_price=2950.0, r=0.065, v0=0.04)
        self.assertEqual(spde_get["model"], "HESTON_SABR_SPDE_ANALOG_SOLVER")
        self.assertEqual(len(spde_get["vol_surface_matrix"]), 6)

        spde_post = solve_memristive_spde_surface(MemristiveSPDERequest(spot_price=3000.0))
        self.assertEqual(spde_post["spot_price"], 3000.0)

        # 2. zk-FLDG Liquidity Discovery
        fldg_res = discover_zk_federated_liquidity(
            ZkFldgDiscoveryRequest(ticker="TCS", target_shares=8000, min_price=3900.0, max_price=3950.0)
        )
        self.assertEqual(fldg_res["ticker"], "TCS")
        self.assertTrue(fldg_res["zk_snark_master_proof"].startswith("zk-snark-fldg-"))

        venues_res = get_zk_fldg_venues()
        self.assertGreaterEqual(len(venues_res), 4)

        # 3. Market Immune Defense
        tick_res = evaluate_market_immune_tick(
            MarketImmuneTickRequest(market_state=[0.015, 0.008, 0.18])
        )
        self.assertFalse(tick_res["anomaly_detected"])
        self.assertEqual(tick_res["immune_action"], "HEALTHY_MARKET_NORMAL")

        clone_res = clone_market_immune_antibody(
            MarketImmuneCloneRequest(target_attack="Novel HFT Order Book Toxic Stacking")
        )
        self.assertTrue(clone_res["antibody_id"].startswith("AB-CLONE-"))

        abs_res = get_market_immune_antibodies()
        self.assertGreaterEqual(len(abs_res), 3)

        # 4. BFT Risk Swarm Consensus
        bft_res = vote_order_bft_risk_consensus(
            BFTRiskConsensusRequest(
                order_id="ORD-TEST-001",
                ticker="RELIANCE",
                shares=2000,
                price=2950.0,
                var_pct=0.02,
                vpin=0.15,
                max_weight=0.08,
                leverage=1.0,
            )
        )
        self.assertEqual(bft_res["approve_count"], 4)
        self.assertTrue(bft_res["consensus_reached"])
        self.assertEqual(bft_res["consensus_verdict"], "APPROVED_FOR_ROUTING")

        # 5. System Summary
        sum_res = get_v33_system_summary()
        self.assertEqual(sum_res["platform_version"], "QUANTX_v33_SOVEREIGN_MEMRISTIVE_BFT")


if __name__ == "__main__":
    unittest.main()

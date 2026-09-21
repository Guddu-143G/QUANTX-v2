"""
QUANTX v29 Visual Financial Analytics, Rate-Wise Statements, Capital-Tiered Grading & DL-10 Engine
End-to-End Institutional Test Suite
"""

import sys
import os
import unittest
import numpy as np

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.visual_dl10_engine import (
    QuantXVisualAnalytics,
    QuantXRateWiseFinancialStatementEngine,
    QuantXCapitalTierGradingEngine,
    QuantXDL10StockRecommender,
    visual_analytics_engine,
    rate_statement_engine,
    capital_grading_engine,
    dl10_recommender_engine,
    RateCurveData,
)
from app.main import (
    get_visual_analytics_telemetry,
    compute_return_histograms,
    compute_slippage_distribution,
    compute_correlation_heatmaps,
    compute_waterfall_bridge,
    compute_nested_donut_allocation,
    get_rate_curves,
    update_rate_curves,
    compute_rate_wise_statements,
    evaluate_portfolio_grading,
    get_dl10_stock_recommendation,
    batch_screen_dl10_universe,
    HistogramAnalysisRequest,
    SlippageDistRequest,
    HeatmapsRequest,
    WaterfallRequest,
    NestedDonutRequest,
    RateStatementsRequest,
    RateCurveUpdateRequest,
    PortfolioGradingRequest,
    DL10RecommendRequest,
    DL10BatchScreenRequest,
)


class TestQuantXVisualDL10V29(unittest.TestCase):
    def setUp(self):
        self.visual_engine = QuantXVisualAnalytics()
        self.rate_engine = QuantXRateWiseFinancialStatementEngine()
        self.grading_engine = QuantXCapitalTierGradingEngine()
        self.dl10_engine = QuantXDL10StockRecommender()

    def test_01_empirical_and_parametric_histograms(self):
        """Test empirical return histograms, Gaussian/Student-t fits, skewness, kurtosis, and tail cutoffs."""
        np.random.seed(42)
        sim_returns = [float(x) for x in np.random.standard_t(df=5, size=252) * 0.015 + 0.001]
        metrics = self.visual_engine.compute_return_histogram_and_moments(returns=sim_returns, num_bins=20)

        self.assertEqual(metrics.sample_size, 252)
        self.assertGreater(metrics.annualized_vol_pct, 10.0)
        self.assertGreater(metrics.kurtosis, 2.0)  # Heavy tailed
        self.assertGreater(metrics.var_95_pct, 0.0)
        self.assertGreater(metrics.cvar_95_pct, metrics.var_95_pct)  # CVaR > VaR
        self.assertGreater(metrics.var_99_pct, metrics.var_95_pct)  # 99% VaR > 95% VaR
        self.assertGreater(metrics.cvar_99_pct, metrics.var_99_pct)  # 99% CVaR > 99% VaR

        self.assertEqual(len(metrics.empirical_bins), 20)
        self.assertEqual(len(metrics.fitted_normal_curve), 20)
        self.assertEqual(len(metrics.fitted_student_t_curve), 20)

    def test_02_trade_slippage_distribution(self):
        """Test slippage distribution analysis, volume impact buckets, and median/P95 metrics."""
        sim_trades = [{"slippage_bps": float(x)} for x in [1.2, 2.5, 3.8, 8.4, 15.2, 0.8, 4.1, 22.0]]
        res = self.visual_engine.compute_trade_slippage_distribution(trades=sim_trades)

        self.assertEqual(res.total_trades_analyzed, 8)
        self.assertGreater(res.p95_slippage_bps, res.mean_slippage_bps)
        self.assertGreater(len(res.buckets), 3)

    def test_03_correlation_and_intensity_heatmaps(self):
        """Test NxN Pearson/Kendall correlation matrices, 11 GICS sector rotation, and 24h spread heatmap."""
        res = self.visual_engine.generate_correlation_and_intensity_heatmaps()

        n = len(res.symbols)
        self.assertGreaterEqual(n, 5)
        self.assertEqual(len(res.pearson_matrix), n)
        self.assertEqual(len(res.pearson_matrix[0]), n)
        self.assertEqual(len(res.kendall_matrix), n)

        # Diagonal of Pearson correlation must be exactly 1.0
        for i in range(n):
            self.assertAlmostEqual(res.pearson_matrix[i][i], 1.0, places=2)
            self.assertAlmostEqual(res.kendall_matrix[i][i], 1.0, places=2)

        # Sector rotation intensity covers 11 GICS sectors
        self.assertEqual(len(res.sector_rotation_intensity), 11)
        # 24-hour spread heatmap covers 6 sessions
        self.assertEqual(len(res.intraday_liquidity_spread_heatmap), 6)

    def test_04_waterfall_bridge(self):
        """Test P&L attribution bridge and capital flow waterfall calculations."""
        res = self.visual_engine.generate_waterfall_bridge(
            gross_alpha=5000000.0,
            market_beta=2000000.0,
            stt_fees=300000.0,
            slippage=200000.0,
            financing_cost=100000.0
        )
        self.assertEqual(len(res.pnl_attribution_bridge), 6)
        net_step = res.pnl_attribution_bridge[-1]
        self.assertEqual(net_step["step"], "Net Realized Portfolio P&L")
        expected_net = 5000000.0 + 2000000.0 - 300000.0 - 200000.0 - 100000.0
        self.assertAlmostEqual(net_step["delta"], expected_net, places=2)

        self.assertEqual(len(res.capital_flow_waterfall), 5)
        self.assertAlmostEqual(res.summary["net_realized_pnl"], expected_net, places=2)

    def test_05_nested_donut_allocation(self):
        """Test 3-tier concentric nested donut radial structure (Asset Class -> Sector -> Holdings)."""
        res = self.visual_engine.generate_nested_donut_allocation()

        self.assertGreaterEqual(len(res.inner_ring_asset_classes), 2)
        self.assertGreaterEqual(len(res.middle_ring_sectors), 3)
        self.assertGreaterEqual(len(res.outer_ring_holdings), 5)

        total_inner_weight = sum(item["weight_pct"] for item in res.inner_ring_asset_classes)
        self.assertAlmostEqual(total_inner_weight, 100.0, delta=1.0)
        self.assertGreater(res.yield_overlay["blended_income_yield_pct"], 0.0)

    def test_06_rate_wise_statements_and_wacc(self):
        """Test holding-level WACC recalculation, DSCR evaluation, credit risk flags, and DCF deltas."""
        sample_holdings = [
            {"ticker": "RELIANCE", "sector": "Energy", "price": 2980.0, "weight_pct": 20.0, "beta": 1.1, "debt_equity_ratio": 0.40, "ebitda_cr": 150000.0, "interest_cr": 18000.0, "fcff_cr": 45000.0},
            {"ticker": "DEBT_HEAVY", "sector": "Infrastructure", "price": 450.0, "weight_pct": 10.0, "beta": 1.4, "debt_equity_ratio": 2.50, "ebitda_cr": 5000.0, "interest_cr": 4200.0, "fcff_cr": 800.0},
        ]
        res = self.rate_engine.evaluate_rate_statements(holdings=sample_holdings, rate_shock_bps=150.0)

        self.assertEqual(len(res.holdings_statements), 2)
        self.assertGreater(res.portfolio_weighted_wacc_shocked, res.portfolio_weighted_wacc_base)
        self.assertGreater(res.portfolio_wacc_delta_bps, 0.0)

        # DEBT_HEAVY should trigger credit risk flag due to low DSCR (< 1.25x)
        debt_heavy = next(h for h in res.holdings_statements if h.ticker == "DEBT_HEAVY")
        self.assertTrue(debt_heavy.credit_risk_flag)
        self.assertLess(debt_heavy.dscr_shocked, 1.25)
        self.assertGreaterEqual(res.high_credit_risk_count, 1)

    def test_07_capital_tier_classification_and_constraints(self):
        """Test capital tier scale classification: Micro (<5L), HNI (5L-50L), Institutional (>50L)."""
        tier_micro = self.grading_engine.classify_capital_tier(350000.0)
        self.assertEqual(tier_micro["tier"], "TIER_1_MICRO")
        self.assertEqual(tier_micro["max_pos_cap"], 0.15)
        self.assertEqual(tier_micro["max_sector_cap"], 0.35)

        tier_hni = self.grading_engine.classify_capital_tier(2500000.0)
        self.assertEqual(tier_hni["tier"], "TIER_2_HNI")
        self.assertEqual(tier_hni["max_pos_cap"], 0.12)
        self.assertEqual(tier_hni["max_sector_cap"], 0.30)

        tier_inst = self.grading_engine.classify_capital_tier(85000000.0)
        self.assertEqual(tier_inst["tier"], "TIER_3_INSTITUTIONAL")
        self.assertEqual(tier_inst["max_pos_cap"], 0.08)
        self.assertEqual(tier_inst["max_sector_cap"], 0.25)

    def test_08_portfolio_quality_score_and_grading(self):
        """Test Portfolio Quality Scorecard (PQS) and Grade S/A/B/C/D assignment."""
        # Institutional scale mandate (8% single position cap)
        balanced_holdings = [
            {"ticker": f"STK_{i}", "sector": f"Sector_{i % 4}", "weight_pct": 7.5, "altman_z": 3.8, "dscr": 2.5}
            for i in range(12)
        ]
        res_optimal = self.grading_engine.evaluate_portfolio_grading(
            aum_inr=60000000.0,  # Tier 3 Institutional
            holdings=balanced_holdings,
            cash_balance=7500000.0,
            total_fees_paid=4500.0
        )
        self.assertIn(res_optimal.grade, ["S", "A"])
        self.assertGreaterEqual(res_optimal.pqs_score, 80.0)

        # Concentrated breach portfolio: 1 single stock at 35%
        breach_holdings = [
            {"ticker": "OVERWEIGHT", "sector": "Tech", "weight_pct": 35.0, "altman_z": 1.9, "dscr": 1.1},
            {"ticker": "STK_2", "sector": "Tech", "weight_pct": 25.0, "altman_z": 2.0, "dscr": 1.2},
            {"ticker": "STK_3", "sector": "Finance", "weight_pct": 40.0, "altman_z": 2.1, "dscr": 1.3},
        ]
        res_breach = self.grading_engine.evaluate_portfolio_grading(
            aum_inr=60000000.0,
            holdings=breach_holdings,
            cash_balance=0.0,
            total_fees_paid=95000.0
        )
        self.assertIn(res_breach.grade, ["C", "D"])
        self.assertLess(res_breach.pqs_score, 70.0)
        self.assertGreater(len(res_breach.concentration_penalties["single_position_breaches"]), 0)

    def test_09_dl10_stock_recommender_pipeline(self):
        """Test full 10-layer neural pipeline for high-quality instrument."""
        res = self.dl10_engine.recommend(
            ticker="RELIANCE",
            user_aum=1200000.0,
            current_price=2950.0,
            atr_14=42.0,
            altman_z=3.9,
            piotroski_f=8,
            vpin=0.18,
            obi=0.15,
            adtv_inr=650000000.0
        )
        self.assertEqual(res.ticker, "RELIANCE")
        self.assertIn(res.decision, ["STRONG_BUY", "BUY"])
        self.assertEqual(len(res.layer_trace), 10)
        # Verify all 10 layers passed
        for step in res.layer_trace:
            self.assertEqual(step.status, "PASSED")

        # Stop loss should be placed 2*ATR below current price
        expected_sl = 2950.0 - (2.0 * 42.0)
        self.assertAlmostEqual(res.stop_loss, expected_sl, places=1)
        self.assertGreater(res.target_price, res.current_price)
        self.assertGreater(res.risk_reward_ratio, 1.5)
        self.assertGreater(len(res.shap_attributions), 3)

    def test_10_dl10_rejection_gates(self):
        """Test Layer 4 (VPIN > 0.35) and Layer 5 (Altman Z < 1.81) rejection gates."""
        # High toxicity rejection (VPIN > 0.35)
        res_toxic = self.dl10_engine.recommend(
            ticker="TOXIC_TICKER",
            user_aum=1000000.0,
            current_price=120.0,
            vpin=0.42,  # Toxic
            altman_z=3.5
        )
        self.assertEqual(res_toxic.decision, "REJECT")
        self.assertIn("Layer 4", res_toxic.decision_reason)

        # Distress bankruptcy rejection (Altman Z < 1.81)
        res_distress = self.dl10_engine.recommend(
            ticker="DISTRESS_CO",
            user_aum=1000000.0,
            current_price=45.0,
            vpin=0.20,
            altman_z=1.45  # Distress
        )
        self.assertEqual(res_distress.decision, "REJECT")
        self.assertIn("Layer 5", res_distress.decision_reason)

    def test_11_dl10_adtv_scaling_and_batch_screen(self):
        """Test Layer 8 ADTV market impact scale-down and batch screening."""
        # Institutional user trading illiquid stock
        res_illiquid = self.dl10_engine.recommend(
            ticker="SMALLCAP",
            user_aum=50000000.0,  # 5 Crore AUM -> 8% is 40 Lakhs
            current_price=250.0,
            adtv_inr=10000000.0,  # 1 Crore ADTV -> 1% is 1 Lakh
            altman_z=3.2,
            vpin=0.19
        )
        # Allocation must scale down to respect 1% ADTV: 1L / 500L = 0.20%
        self.assertLess(res_illiquid.recommended_alloc_pct, 1.0)
        l8_step = res_illiquid.layer_trace[7]  # Layer 8
        self.assertEqual(l8_step.status, "SCALED_DOWN")

        # Test batch screening
        screen_res = self.dl10_engine.batch_screen(symbols=["RELIANCE", "TCS", "INFY"])
        self.assertEqual(len(screen_res), 3)

    def test_12_fastapi_rest_handlers(self):
        """Test all FastAPI REST handler functions for v29."""
        # Telemetry
        tel = get_visual_analytics_telemetry()
        self.assertEqual(tel["status"], "ONLINE")
        self.assertEqual(tel["version"], "v29.0.0")

        # Histogram handler
        hist = compute_return_histograms(HistogramAnalysisRequest(num_bins=18))
        self.assertEqual(len(hist.empirical_bins), 18)

        # Slippage distribution handler
        slip = compute_slippage_distribution(SlippageDistRequest())
        self.assertGreater(slip.total_trades_analyzed, 0)

        # Heatmaps handler
        hm = compute_correlation_heatmaps(HeatmapsRequest())
        self.assertEqual(len(hm.sector_rotation_intensity), 11)

        # Waterfall handler
        wf = compute_waterfall_bridge(WaterfallRequest())
        self.assertIn("Net Realized Portfolio P&L", wf.pnl_attribution_bridge[-1]["step"])

        # Nested donut handler
        nd = compute_nested_donut_allocation(NestedDonutRequest())
        self.assertGreater(len(nd.inner_ring_asset_classes), 0)

        # Rate curves handler
        rc = get_rate_curves()
        self.assertEqual(rc["status"], "SUCCESS")

        # Rate statements handler
        rs = compute_rate_wise_statements(RateStatementsRequest(rate_shock_bps=100.0))
        self.assertGreater(len(rs.holdings_statements), 0)

        # Portfolio grading handler
        gr = evaluate_portfolio_grading(PortfolioGradingRequest(aum_inr=1500000.0))
        self.assertIn(gr.grade, ["S", "A", "B", "C", "D"])

        # DL10 recommend handler
        rec = get_dl10_stock_recommendation(DL10RecommendRequest(ticker="TCS"))
        self.assertEqual(rec.ticker, "TCS")
        self.assertEqual(len(rec.layer_trace), 10)

        # DL10 batch screen handler
        batch = batch_screen_dl10_universe(DL10BatchScreenRequest(symbols=["TCS", "INFY"]))
        self.assertEqual(len(batch["screened_stocks"]), 2)


if __name__ == "__main__":
    unittest.main()

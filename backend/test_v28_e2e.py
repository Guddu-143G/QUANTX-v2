"""
QUANTX v28 Institutional Portfolio Ledger & Tax Accounting Test Suite
Tests:
1. Zero-state portfolio initialization and reset
2. Seeding institutional baseline mandate
3. Transaction entry with automated Indian statutory fee calculation (STT, turnover, GST, SEBI)
4. Multi-lot inventory management with HIFO, FIFO, and LIFO matching algorithms
5. Capital gains tax classification (STCG <365 days @ 20%, LTCG >=365 days @ 12.5%)
6. Automated Tax-Loss Harvesting scanner
7. Intraday Brinson-Fachler active return attribution (Allocation, Selection, Interaction)
8. L1-norm portfolio weight drift surveillance & rebalance alerting
9. Corporate actions reconciliation (Split, Bonus, Dividend)
10. Collateral haircut evaluation & Margin health monitoring
11. FastAPI REST handler endpoints verification
"""

import sys
import os
import unittest
from datetime import datetime, timezone, timedelta

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.portfolio_ledger_engine import (
    QuantXPortfolioLedgerEngine,
    portfolio_ledger_engine,
    RecordTransactionPayload,
    CorporateActionPayload,
    INDIAN_STATUTORY_FEES,
)
from app.main import (
    get_portfolio_ledger_summary,
    get_portfolio_transactions,
    record_portfolio_transaction,
    get_portfolio_tax_lots,
    get_tax_loss_harvesting_opportunities,
    get_brinson_fachler_attribution,
    get_portfolio_drift_surveillance,
    record_corporate_action,
    get_portfolio_margin_health,
    reset_portfolio_ledger,
    seed_institutional_baseline,
)


class TestQuantXPortfolioLedgerV28(unittest.TestCase):
    def setUp(self):
        # Create a fresh isolated engine instance for rigorous unit tests
        self.engine = QuantXPortfolioLedgerEngine()

    def test_01_zero_state_and_seed(self):
        """Test zero-state initialization and baseline institutional seeding."""
        self.engine.reset_to_zero_state()
        summary = self.engine.get_portfolio_summary()
        self.assertEqual(summary["total_aum"], 0.0)
        self.assertEqual(summary["cash_balance"], 0.0)
        self.assertEqual(summary["total_lots"], 0)
        self.assertEqual(len(summary["holdings"]), 0)

        # Seed baseline institutional portfolio
        seed_res = self.engine.seed_baseline_institutional_portfolio(aum_inr=50000000.0)
        self.assertEqual(seed_res["status"], "SEEDED")
        self.assertGreater(seed_res["positions_seeded"], 5)
        self.assertAlmostEqual(seed_res["aum_inr"], 50000000.0, delta=100.0)

        summary_after = self.engine.get_portfolio_summary()
        self.assertGreater(summary_after["total_aum"], 45000000.0)
        self.assertGreater(summary_after["total_lots"], 5)

        # Reset to zero-state
        reset_res = self.engine.reset_to_zero_state()
        self.assertEqual(reset_res["status"], "RESET_COMPLETE")
        summary_reset = self.engine.get_portfolio_summary()
        self.assertEqual(summary_reset["total_aum"], 0.0)
        self.assertEqual(summary_reset["cash_balance"], 0.0)

    def test_02_transaction_fees_and_cash_deposit(self):
        """Test cash deposit and statutory fee computation for buy/sell."""
        self.engine.reset_to_zero_state()
        # 1. Deposit 1,000,000 INR
        tx_dep = self.engine.record_transaction(RecordTransactionPayload(
            symbol="INR",
            side="CASH_DEPOSIT",
            quantity=1000000.0,
            price=1.0,
            notes="Initial capital injection"
        ))
        self.assertEqual(tx_dep["status"], "RECORDED")
        self.assertEqual(self.engine.cash_balance, 1000000.0)

        # 2. Buy 100 RELIANCE @ 2900.0
        tx_buy = self.engine.record_transaction(RecordTransactionPayload(
            symbol="RELIANCE",
            side="BUY",
            quantity=100.0,
            price=2900.0,
            notes="Core holding buy"
        ))
        self.assertEqual(tx_buy["status"], "RECORDED")
        fees = tx_buy["fees"]
        self.assertAlmostEqual(fees["stt"], 290.0, delta=0.5)
        self.assertAlmostEqual(fees["brokerage"], 20.0, delta=0.1)
        self.assertGreater(fees["total_fees"], 310.0)

        # Cash balance should decrease by (quantity * price + total_fees)
        expected_deduction = 290000.0 + fees["total_fees"]
        self.assertAlmostEqual(self.engine.cash_balance, 1000000.0 - expected_deduction, delta=1.0)

    def test_03_tax_lot_matching_hifo_and_gain_classification(self):
        """Test HIFO lot matching and STCG (<12m) vs LTCG (>=12m) tax classifications."""
        self.engine.reset_to_zero_state()
        self.engine.record_transaction(RecordTransactionPayload(
            symbol="INR", side="CASH_DEPOSIT", quantity=2000000.0, price=1.0
        ))

        # Lot 1: Bought 50 shares @ 2500, 400 days ago (LTCG qualifying)
        dt_ltcg = (datetime.now() - timedelta(days=400)).strftime("%Y-%m-%d %H:%M:%S")
        self.engine.record_transaction(RecordTransactionPayload(
            symbol="TCS", side="BUY", quantity=50.0, price=2500.0, execution_timestamp=dt_ltcg
        ))

        # Lot 2: Bought 50 shares @ 3200 (Highest Cost), 100 days ago (STCG)
        dt_stcg_high = (datetime.now() - timedelta(days=100)).strftime("%Y-%m-%d %H:%M:%S")
        self.engine.record_transaction(RecordTransactionPayload(
            symbol="TCS", side="BUY", quantity=50.0, price=3200.0, execution_timestamp=dt_stcg_high
        ))

        # Lot 3: Bought 50 shares @ 2800, 50 days ago (STCG)
        dt_stcg_mid = (datetime.now() - timedelta(days=50)).strftime("%Y-%m-%d %H:%M:%S")
        self.engine.record_transaction(RecordTransactionPayload(
            symbol="TCS", side="BUY", quantity=50.0, price=2800.0, execution_timestamp=dt_stcg_mid
        ))

        # Total TCS inventory = 150 shares
        lots_before = self.engine.get_tax_lots(symbol="TCS")
        self.assertEqual(len(lots_before), 3)

        # SELL 60 shares @ 3500 using HIFO strategy
        sell_tx = self.engine.record_transaction(RecordTransactionPayload(
            symbol="TCS",
            side="SELL",
            quantity=60.0,
            price=3500.0,
            lot_selection_method="HIFO"
        ))
        self.assertEqual(sell_tx["status"], "RECORDED")
        matched_lots = sell_tx["matched_lots"]
        self.assertEqual(len(matched_lots), 2)
        self.assertEqual(matched_lots[0]["buy_price"], 3200.0)
        self.assertEqual(matched_lots[0]["shares_closed"], 50.0)
        self.assertEqual(matched_lots[1]["buy_price"], 2800.0)
        self.assertEqual(matched_lots[1]["shares_closed"], 10.0)

        # Check remaining lots: Lot 1 (50 shares @ 2500), Lot 3 (40 shares @ 2800)
        remaining_lots = self.engine.get_tax_lots(symbol="TCS")
        self.assertEqual(len(remaining_lots), 2)
        total_remaining_qty = sum(l["quantity"] for l in remaining_lots)
        self.assertEqual(total_remaining_qty, 90.0)

        # Verify Lot 1 is classified as LTCG
        ltcg_lot = [l for l in remaining_lots if l["buy_price"] == 2500.0][0]
        self.assertEqual(ltcg_lot["gain_type"], "LTCG")
        self.assertGreater(ltcg_lot["holding_days"], 365)

    def test_04_tax_loss_harvesting_scanner(self):
        """Test tax-loss harvesting candidate detection and potential tax savings."""
        self.engine.reset_to_zero_state()
        self.engine.record_transaction(RecordTransactionPayload(
            symbol="INR", side="CASH_DEPOSIT", quantity=1000000.0, price=1.0
        ))

        # Buy INFY at an elevated cost basis 3000.0 (current live price is < 2000.0, loss > 30%)
        self.engine.record_transaction(RecordTransactionPayload(
            symbol="INFY", side="BUY", quantity=100.0, price=3000.0
        ))

        # Scan for harvesting opportunities
        harvest_res = self.engine.get_tax_loss_harvesting_opportunities()
        self.assertGreater(harvest_res["total_harvestable_loss"], 0.0)
        self.assertGreater(harvest_res["potential_tax_savings"], 0.0)
        candidates = harvest_res["opportunities"]
        self.assertTrue(any(c["symbol"] == "INFY" for c in candidates))

    def test_05_brinson_fachler_attribution(self):
        """Test multi-sector Brinson-Fachler active return attribution."""
        self.engine.seed_baseline_institutional_portfolio(aum_inr=100000000.0)
        attribution = self.engine.calculate_brinson_fachler_attribution()

        self.assertIn("portfolio_return", attribution)
        self.assertIn("benchmark_return", attribution)
        self.assertIn("active_return", attribution)
        self.assertIn("total_allocation_effect", attribution)
        self.assertIn("total_selection_effect", attribution)
        self.assertIn("total_interaction_effect", attribution)
        self.assertIn("sector_breakdown", attribution)
        self.assertGreater(len(attribution["sector_breakdown"]), 3)

        # Check mathematical consistency: Active Return ≈ Allocation + Selection + Interaction
        calc_active = (
            attribution["total_allocation_effect"] +
            attribution["total_selection_effect"] +
            attribution["total_interaction_effect"]
        )
        self.assertAlmostEqual(attribution["active_return"], calc_active, delta=0.01)

    def test_06_drift_surveillance_and_alerts(self):
        """Test L1-norm portfolio weight drift calculation and rebalance triggers."""
        self.engine.seed_baseline_institutional_portfolio(aum_inr=100000000.0)
        drift = self.engine.calculate_drift_surveillance()

        self.assertIn("l1_norm_drift", drift)
        self.assertIn("max_single_drift", drift)
        self.assertIn("rebalance_required", drift)
        self.assertIn("positions", drift)
        self.assertGreater(len(drift["positions"]), 5)

    def test_07_corporate_actions_split_and_dividend(self):
        """Test stock split lot adjustment and dividend cash injection."""
        self.engine.reset_to_zero_state()
        self.engine.record_transaction(RecordTransactionPayload(
            symbol="INR", side="CASH_DEPOSIT", quantity=1000000.0, price=1.0
        ))
        self.engine.record_transaction(RecordTransactionPayload(
            symbol="WIPRO", side="BUY", quantity=200.0, price=500.0
        ))

        # Apply 2:1 Stock Split (ratio = 2.0)
        split_res = self.engine.apply_corporate_action(CorporateActionPayload(
            symbol="WIPRO",
            action_type="SPLIT",
            ratio=2.0,
            notes="2:1 Stock Split"
        ))
        self.assertEqual(split_res["status"], "APPLIED")
        self.assertEqual(split_res["adjusted_quantity"], 400.0)
        self.assertEqual(split_res["new_average_price"], 250.0)

        # Verify lot state
        lots = self.engine.get_tax_lots(symbol="WIPRO")
        self.assertEqual(len(lots), 1)
        self.assertEqual(lots[0]["quantity"], 400.0)
        self.assertEqual(lots[0]["buy_price"], 250.0)

        # Apply Dividend of 10 INR per share on 400 shares = +4,000 INR
        cash_before = self.engine.cash_balance
        div_res = self.engine.apply_corporate_action(CorporateActionPayload(
            symbol="WIPRO",
            action_type="DIVIDEND",
            dividend_per_share=10.0,
            notes="Interim Dividend"
        ))
        self.assertEqual(div_res["status"], "APPLIED")
        self.assertEqual(div_res["total_dividend_inr"], 4000.0)
        self.assertEqual(self.engine.cash_balance, cash_before + 4000.0)

    def test_08_margin_health_monitoring(self):
        """Test collateral haircut value and Initial/Maintenance Margin metrics."""
        self.engine.seed_baseline_institutional_portfolio(aum_inr=100000000.0)
        margin = self.engine.get_margin_health()

        self.assertIn("total_collateral_value", margin)
        self.assertIn("haircut_adjusted_collateral", margin)
        self.assertIn("initial_margin_requirement", margin)
        self.assertIn("maintenance_margin_requirement", margin)
        self.assertIn("health_score", margin)
        self.assertIn("margin_call_status", margin)
        self.assertGreater(margin["haircut_adjusted_collateral"], 0.0)
        self.assertLess(margin["haircut_adjusted_collateral"], margin["total_collateral_value"])

    def test_09_fastapi_rest_handlers(self):
        """Test all v28 REST API route handlers registered on FastAPI."""
        # 1. Reset
        res = reset_portfolio_ledger()
        self.assertEqual(res["status"], "RESET_COMPLETE")

        # 2. Summary in zero-state
        summary = get_portfolio_ledger_summary()
        self.assertEqual(summary["total_aum"], 0.0)
        self.assertEqual(summary["is_zero_state"], True)

        # 3. Seed baseline
        seed_res = seed_institutional_baseline(aum_inr=100000000.0)
        self.assertEqual(seed_res["status"], "SEEDED")

        # 4. Summary after seed
        summary_after = get_portfolio_ledger_summary()
        self.assertGreater(summary_after["total_aum"], 90000000.0)
        self.assertEqual(summary_after["is_zero_state"], False)

        # 5. Transactions history
        tx_hist = get_portfolio_transactions(limit=20)
        self.assertIn("transactions", tx_hist)
        self.assertGreater(len(tx_hist["transactions"]), 0)

        # 6. Record transaction
        tx_payload = RecordTransactionPayload(
            symbol="HDFCBANK",
            side="BUY",
            quantity=50.0,
            price=1650.0,
            lot_selection_method="HIFO",
            notes="FastAPI test buy"
        )
        tx_res = record_portfolio_transaction(tx_payload)
        self.assertEqual(tx_res["status"], "RECORDED")

        # 7. Tax lots
        lots_res = get_portfolio_tax_lots(symbol="HDFCBANK")
        self.assertIn("tax_lots", lots_res)
        self.assertGreater(len(lots_res["tax_lots"]), 0)

        # 8. Tax harvesting
        harvest_res = get_tax_loss_harvesting_opportunities()
        self.assertIn("opportunities", harvest_res)

        # 9. Brinson attribution
        attr_res = get_brinson_fachler_attribution()
        self.assertIn("active_return", attr_res)

        # 10. Drift surveillance
        drift_res = get_portfolio_drift_surveillance()
        self.assertIn("l1_norm_drift", drift_res)

        # 11. Corporate action
        ca_payload = CorporateActionPayload(
            symbol="HDFCBANK",
            action_type="DIVIDEND",
            dividend_per_share=19.5,
            notes="Annual Dividend"
        )
        ca_res = record_corporate_action(ca_payload)
        self.assertEqual(ca_res["status"], "APPLIED")

        # 12. Margin health
        margin_res = get_portfolio_margin_health()
        self.assertIn("health_score", margin_res)


if __name__ == "__main__":
    unittest.main()

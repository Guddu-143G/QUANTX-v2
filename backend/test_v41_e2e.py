"""
End-to-End Unit & Integration Test Suite for QUANTX Version 41 (v41):
- Production Deployment Fixes for Portfolio & Risk Engine
- Stateless RAM Data Ingestion (io.BytesIO, Zero Disk I/O, Zero ENOENT Crashes)
- Serverless Math Kernel with Safe Observation Thresholds (>= 2 days min, >= 60 days recommended)
- Edge API Gateway Proxy & Fallback Secrets Vault (ZERO_STATE_DEMO_DISABLED)
- Unified v41 REST API Route Handlers
"""

import os
import sys
import unittest
import numpy as np

backend_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(backend_dir)
for d in (backend_dir, parent_dir):
    if d not in sys.path:
        sys.path.insert(0, d)

try:
    from app.deployment_fix_v41_engine import (
        QuantXDeploymentFixV41Engine,
        deployment_fix_v41_engine,
        StatelessParseResponse,
        SafeRiskComputeRequest,
    )
    from app.main import (
        stateless_parse_holdings_endpoint,
        compute_safe_risk_metrics_endpoint,
        get_v41_system_summary_endpoint,
        get_v41_telemetry_endpoint,
        get_portfolio_status_endpoint,
        StatelessCSVUploadRequest,
    )
except ImportError:
    from backend.app.deployment_fix_v41_engine import (
        QuantXDeploymentFixV41Engine,
        deployment_fix_v41_engine,
        StatelessParseResponse,
        SafeRiskComputeRequest,
    )
    from backend.app.main import (
        stateless_parse_holdings_endpoint,
        compute_safe_risk_metrics_endpoint,
        get_v41_system_summary_endpoint,
        get_v41_telemetry_endpoint,
        get_portfolio_status_endpoint,
        StatelessCSVUploadRequest,
    )


class TestQuantXv41DeploymentResilienceEngine(unittest.TestCase):
    """
    Unit & integration tests verifying:
    1. Stateless RAM buffer parsing (no disk I/O, zero ENOENT crashes).
    2. Header normalization and column aliasing (symbol -> ticker).
    3. Null-safe risk computation (handling empty arrays, short histories, dimension mismatches).
    4. Diagnostic deployment telemetry and zero-state fallback mechanisms.
    """

    @classmethod
    def setUpClass(cls):
        cls.engine = QuantXDeploymentFixV41Engine()

    def test_01_stateless_csv_parsing_valid(self):
        """Test parsing valid CSV directly from bytes in RAM."""
        sample_csv = b"ticker,quantity,average_cost,sector\nRELIANCE,100,2950.0,Energy\nTCS,50,3800.0,IT\nINFY,75,1500.0,IT\n"
        res = self.engine.parse_holdings_stateless(sample_csv)

        self.assertIsInstance(res, dict)
        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(res["count"], 3)
        self.assertTrue(res.get("memory_buffered", False))
        self.assertEqual(res["holdings"][0]["ticker"], "RELIANCE")
        self.assertEqual(res["holdings"][0]["quantity"], 100)
        self.assertEqual(res["holdings"][0]["market_value"], 295000.0)
        expected_nav = (100 * 2950.0) + (50 * 3800.0) + (75 * 1500.0)
        self.assertAlmostEqual(res["total_nav"], expected_nav, places=2)

    def test_02_stateless_csv_parsing_symbol_alias_and_casing(self):
        """Test symbol alias to ticker, whitespace trimming, and uppercase normalization."""
        sample_csv = b" SYMBOL , quantity , avg_cost \n  hdfcbank , 40 , 1650.50 \n icicibank , 60 , 1120.00 \n"
        res = self.engine.parse_holdings_stateless(sample_csv)

        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(res["count"], 2)
        self.assertEqual(res["holdings"][0]["ticker"], "HDFCBANK")
        self.assertEqual(res["holdings"][1]["ticker"], "ICICIBANK")
        self.assertEqual(res["holdings"][0]["sector"], "Equities")

    def test_03_stateless_csv_parsing_missing_columns(self):
        """Test validation error when required columns are absent."""
        invalid_csv = b"asset_name,units\nAPPLE,10\n"
        res = self.engine.parse_holdings_stateless(invalid_csv)

        self.assertEqual(res["status"], "VALIDATION_ERROR")
        self.assertEqual(res["count"], 0)
        self.assertEqual(res["holdings"], [])
        self.assertIn("ticker", res["message"])

    def test_04_stateless_csv_parsing_empty_payload(self):
        """Test zero-state response on empty byte payload without throwing exceptions."""
        res_none = self.engine.parse_holdings_stateless(b"")
        self.assertEqual(res_none["status"], "ZERO_STATE")
        self.assertEqual(res_none["count"], 0)
        self.assertEqual(res_none["total_nav"], 0.0)

    def test_05_stateless_csv_parsing_corrupted_data(self):
        """Test resilient exception catching on binary/corrupted bytes."""
        corrupted_bytes = b"\x00\xff\xfe\x01\x02\x03\xaa\xbb\xcc\xdd"
        res = self.engine.parse_holdings_stateless(corrupted_bytes)
        # Should catch gracefully and return EXCEPTION or VALIDATION_ERROR without crashing
        self.assertIn(res["status"], ["EXCEPTION", "VALIDATION_ERROR"])
        self.assertEqual(res["count"], 0)

    def test_06_safe_risk_computation_normal_126_obs(self):
        """Test safe risk metrics computation for 126 observations with 3 assets."""
        np.random.seed(42)
        returns = np.random.normal(0.0008, 0.012, (126, 3))
        weights = np.array([0.4, 0.35, 0.25])
        portfolio_val = 1_000_000.0

        res = self.engine.compute_risk_metrics_safe(returns, weights, portfolio_value=portfolio_val)

        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(res["observation_count"], 126)
        self.assertTrue(res["is_sufficient_history"])
        self.assertGreater(res["var_95_parametric_amount"], 0.0)
        self.assertGreaterEqual(res["cvar_95_parametric_amount"], res["var_95_parametric_amount"])
        self.assertGreater(res["annualized_volatility"], 0.0)
        self.assertIn("sharpe_ratio", res)

    def test_07_safe_risk_computation_short_history_below_recommended(self):
        """Test history with 10 observations (>= 2 min, < 60 recommended)."""
        np.random.seed(101)
        returns = np.random.normal(0.001, 0.015, (10, 2))
        weights = np.array([0.5, 0.5])

        res = self.engine.compute_risk_metrics_safe(returns, weights, portfolio_value=500_000.0)

        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(res["observation_count"], 10)
        self.assertFalse(res["is_sufficient_history"])
        self.assertGreater(res["var_95_parametric_amount"], 0.0)

    def test_08_safe_risk_computation_insufficient_history_fallback(self):
        """Test graceful zero-state fallback when observation count is < 2 trading days."""
        returns_1obs = np.array([[0.01, -0.02]])
        weights = np.array([0.5, 0.5])

        res = self.engine.compute_risk_metrics_safe(returns_1obs, weights)

        self.assertEqual(res["status"], "ZERO_STATE_FALLBACK")
        self.assertFalse(res["is_sufficient_history"])
        self.assertEqual(res["var_95_parametric_amount"], 0.0)
        self.assertIn("Insufficient date overlap", res["reason"])

    def test_09_safe_risk_computation_dimension_mismatch(self):
        """Test defensive handling of mismatched asset count between returns and weights."""
        returns_3assets = np.ones((50, 3)) * 0.001
        weights_2assets = np.array([0.6, 0.4])

        res = self.engine.compute_risk_metrics_safe(returns_3assets, weights_2assets)

        self.assertEqual(res["status"], "ZERO_STATE_FALLBACK")
        self.assertIn("Dimension mismatch", res["reason"])

    def test_10_safe_risk_computation_empty_inputs(self):
        """Test defensive handling of None and empty inputs."""
        res1 = self.engine.compute_risk_metrics_safe(None, [1.0])
        self.assertEqual(res1["status"], "ZERO_STATE_FALLBACK")

        res2 = self.engine.compute_risk_metrics_safe(np.array([]), [1.0])
        self.assertEqual(res2["status"], "ZERO_STATE_FALLBACK")

        res3 = self.engine.compute_risk_metrics_safe(np.ones((20, 2)), None)
        self.assertEqual(res3["status"], "ZERO_STATE_FALLBACK")

    def test_11_deployment_telemetry_inspection(self):
        """Test deployment telemetry output and configuration state."""
        telemetry = self.engine.get_deployment_telemetry()

        self.assertEqual(telemetry["version"], "v41.0.0")
        self.assertEqual(telemetry["stateless_ram_ingestion"]["status"], "ACTIVE")
        self.assertFalse(telemetry["stateless_ram_ingestion"]["disk_io_required"])
        self.assertEqual(telemetry["serverless_math_kernel"]["status"], "ACTIVE")
        self.assertEqual(telemetry["serverless_math_kernel"]["min_observation_threshold"], 2)
        self.assertEqual(telemetry["serverless_math_kernel"]["recommended_observation_threshold"], 60)
        self.assertIn("hydration_resilience", telemetry)
        self.assertEqual(telemetry["hydration_resilience"]["client_gate"], "useIsMounted")


class TestFastAPIv41EndpointsIntegration(unittest.TestCase):
    """
    Direct integration tests for QUANTX v41 FastAPI route handlers:
    - POST /api/v1/v41/stateless/parse-holdings
    - POST /api/v1/v41/risk/compute-safe-metrics
    - GET /api/v1/v41/system/summary
    - GET /api/v1/v41/telemetry
    - GET /api/v1/portfolio (Zero-state fallback verification)
    """

    def test_12_stateless_parse_endpoint_payload(self):
        """Test stateless parse holdings endpoint using JSON payload."""
        import asyncio
        csv_str = "ticker,quantity,average_cost\nTCS,100,3850.0\nINFY,200,1520.0\n"
        req = StatelessCSVUploadRequest(csv_content=csv_str)

        # Call endpoint handler asynchronously
        res = asyncio.run(stateless_parse_holdings_endpoint(file=None, payload=req))

        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(res["count"], 2)
        self.assertEqual(res["holdings"][0]["ticker"], "TCS")
        self.assertEqual(res["holdings"][0]["quantity"], 100)
        self.assertAlmostEqual(res["total_nav"], (100 * 3850.0) + (200 * 1520.0), places=2)

    def test_13_compute_safe_risk_metrics_endpoint(self):
        """Test safe risk metrics compute endpoint."""
        req = SafeRiskComputeRequest(
            returns=[[0.01, 0.02], [-0.01, 0.01], [0.005, -0.005], [0.002, 0.003], [0.012, -0.008]],
            weights=[0.6, 0.4],
            portfolio_value=2_000_000.0,
        )
        res = compute_safe_risk_metrics_endpoint(req)

        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(res["observation_count"], 5)
        self.assertGreater(res["var_95_parametric_amount"], 0.0)
        self.assertEqual(res["portfolio_value"], 2_000_000.0)

    def test_14_v41_system_summary_endpoint(self):
        """Test v41 system summary endpoint response structure."""
        res = get_v41_system_summary_endpoint()

        self.assertEqual(res["status"], "ONLINE")
        self.assertEqual(res["version"], "v41.0.0")
        self.assertIn("resilience_highlights", res)
        self.assertIn("telemetry", res)
        self.assertGreater(len(res["resilience_highlights"]), 3)

    def test_15_v41_telemetry_endpoint(self):
        """Test v41 diagnostic telemetry endpoint."""
        res = get_v41_telemetry_endpoint()

        self.assertEqual(res["version"], "v41.0.0")
        self.assertIn("stateless_ram_ingestion", res)
        self.assertIn("serverless_math_kernel", res)
        self.assertIn("edge_gateway_secrets", res)

    def test_16_portfolio_zero_state_gateway_fallback(self):
        """Test edge gateway fallback when Kite API credentials are intentionally absent."""
        # Temporarily ensure secrets are absent
        old_key = os.environ.pop("QUANTX_KITE_API_KEY", None)
        old_tok = os.environ.pop("QUANTX_KITE_ACCESS_TOKEN", None)
        try:
            res = get_portfolio_status_endpoint()
            self.assertEqual(res["mode"], "ZERO_STATE_DEMO_DISABLED")
            self.assertIn("Zerodha Kite credentials missing", res["message"])
            self.assertIn("metrics", res)
            self.assertIn("holdings", res)
        finally:
            if old_key is not None:
                os.environ["QUANTX_KITE_API_KEY"] = old_key
            if old_tok is not None:
                os.environ["QUANTX_KITE_ACCESS_TOKEN"] = old_tok


if __name__ == "__main__":
    unittest.main()

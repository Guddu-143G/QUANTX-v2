"""
test_v23_e2e.py
Institutional E2E Verification Suite for Suggestion v23 Deep Learning & AI Trading Copilot:
1. Gated Residual Network (GRN) & GLU Gating Mathematics
2. Temporal Fusion Transformer (TFT) Multi-Horizon Quantile Forecaster (q10 <= q50 <= q90)
3. TCN-CNN Microstructure & Chart Pattern Analyzer (Dilated Causal Convolutions)
4. Soft Actor-Critic (SAC) Deep RL Execution Assistant (Continuous Action & Shortfall Reward)
5. Variational Autoencoder (VAE) Microstructure Anomaly & Spoofing Detector (ELBO Reconstruction Loss)
6. Vision-Language Multi-Modal Trading Copilot & Bi-Temporal RAG Synthesizer
7. FastAPI HTTP Route Functions Verification
"""

import sys
import os
import numpy as np

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.dl_trading_engine import (
    GatedResidualNetwork,
    DeepQuantForecaster,
    TCNPatternAnalyzer,
    SACExecutionAssistant,
    VAEAnomalyDetector,
    VisionLanguageTradingCopilot,
    QuantXDLTradingAssistant,
    MarketAnalysisRequest,
    ForecastRequest,
    AnomalyCheckRequest,
    SACSliceRequest,
    CopilotReasoningRequest,
    dl_trading_assistant,
)
from app.main import (
    get_dl_telemetry,
    analyze_dl_market_state,
    get_dl_forecast,
    detect_dl_patterns,
    get_sac_execution_slice,
    check_vae_anomaly,
    copilot_reasoning,
)


def test_grn_mathematics():
    print("\n[1/7] Testing Gated Residual Network (GRN) & GLU Activation...")
    grn = GatedResidualNetwork(input_dim=14, hidden_dim=32, output_dim=16, dropout_rate=0.0)
    
    x = np.random.randn(5, 14)
    out = grn.forward(x)
    
    assert out.shape == (5, 16), f"Expected shape (5, 16), got {out.shape}"
    # Verify LayerNorm property on output: mean ~ 0, var ~ 1
    mean = np.mean(out, axis=-1)
    std = np.std(out, axis=-1)
    assert np.all(np.abs(mean) < 1e-4), f"LayerNorm mean not centered: {mean}"
    assert np.all(np.abs(std - 1.0) < 1e-2), f"LayerNorm std not unit: {std}"
    print("  -> GRN forward pass, GLU gating, and LayerNorm verified successfully.")


def test_tft_forecaster():
    print("\n[2/7] Testing TFT Multi-Horizon Quantile Forecaster...")
    forecaster = DeepQuantForecaster(input_features=14, hidden_dim=32)
    
    # 60 timesteps, 14 features
    features = np.random.randn(60, 14)
    res = forecaster.predict_quantiles(features)
    
    assert "multi_horizon_quantiles" in res
    assert "uncertainty_cone" in res
    assert "predicted_direction" in res
    
    for h in [1, 5, 15, 30]:
        q = res["multi_horizon_quantiles"][f"t+{h}"]
        q10 = q["q10_downside"]
        q50 = q["q50_median"]
        q90 = q["q90_upside"]
        spread = q["uncertainty_spread"]
        
        # Verify strict non-parametric quantile monotonicity
        assert q10 <= q50 <= q90, f"Quantile monotonicity violated at horizon {h}: {q10} <= {q50} <= {q90}"
        assert spread >= 0, f"Spread must be non-negative: {spread}"
        assert abs((q90 - q10) - spread) < 1e-3, "Spread mismatch"
        
    print(f"  -> Quantile monotonicity verified (q10 <= q50 <= q90). Direction: {res['predicted_direction']}, Confidence: {res['confidence_score']:.1%}")


def test_tcn_pattern_analyzer():
    print("\n[3/7] Testing TCN-CNN Dilated Causal Pattern Engine...")
    tcn = TCNPatternAnalyzer(hidden_dim=32, kernel_size=3)
    
    # Generate prices with an intentional upward breakout
    np.random.seed(123)
    prices = 2900.0 + np.cumsum(np.random.normal(0.2, 1.5, 60))
    # Spike the end for breakout
    prices[-5:] += np.array([5.0, 12.0, 20.0, 32.0, 45.0])
    volumes = np.random.uniform(500, 2000, 60)
    volumes[-3:] *= 4.0 # High volume on breakout
    spread_history = np.full(60, 3.2) + np.random.normal(0, 0.2, 60)
    obi_history = np.full(60, 0.15) + np.random.normal(0, 0.05, 60)
    
    patterns = tcn.detect_patterns(prices, volumes, spread_history, obi_history)
    assert len(patterns) > 0, "Expected at least one pattern detected"
    
    pattern_types = [p["pattern_name"] for p in patterns]
    print(f"  -> Detected {len(patterns)} patterns: {pattern_types}")
    for p in patterns:
        assert p["confidence"] >= 0.0 and p["confidence"] <= 1.0
        assert p["expected_direction"] in ["BULLISH", "BEARISH", "NEUTRAL", "STRONG_BULLISH", "STRONG_BEARISH"]


def test_sac_execution_assistant():
    print("\n[4/7] Testing Soft Actor-Critic (SAC) Deep RL Execution Assistant...")
    sac = SACExecutionAssistant()
    
    # State 1: Urgent execution (4 min left, large volume)
    res_urgent = sac.recommend_execution_slice(
        remaining_volume=10000.0,
        remaining_time_minutes=4.0,
        spread_bps=2.5,
        vpin=0.18,
        obi=0.20,
        annualized_vol=0.22,
        arrival_price=3000.0,
    )
    
    # State 2: Patient execution (90 min left, high toxicity)
    res_patient = sac.recommend_execution_slice(
        remaining_volume=10000.0,
        remaining_time_minutes=90.0,
        spread_bps=6.5,
        vpin=0.75, # Toxic
        obi=-0.40,
        annualized_vol=0.35,
        arrival_price=3000.0,
    )
    
    # Assertions on continuous action space
    assert 0.0 <= res_urgent["recommended_slice_fraction"] <= 1.0
    assert 0.0 <= res_patient["recommended_slice_fraction"] <= 1.0
    # Urgent slice should be larger than patient slice
    assert res_urgent["recommended_slice_qty"] > res_patient["recommended_slice_qty"], \
        f"Urgent slice ({res_urgent['recommended_slice_qty']}) should exceed patient slice ({res_patient['recommended_slice_qty']})"
    
    # Assert limit offset bounds
    assert abs(res_urgent["limit_offset_bps"]) <= 25.0
    assert abs(res_patient["limit_offset_bps"]) <= 25.0
    assert "entropy_bonus" in res_urgent
    assert "expected_shortfall_bps" in res_urgent
    print(f"  -> SAC action recommendations verified: Urgent slice={res_urgent['recommended_slice_fraction']:.1%}, Patient slice={res_patient['recommended_slice_fraction']:.1%}")


def test_vae_anomaly_detector():
    print("\n[5/7] Testing Variational Autoencoder (VAE) Microstructure Anomaly Detector...")
    vae = VAEAnomalyDetector(input_dim=20, latent_dim=4, anomaly_threshold=0.045)
    
    # Normal depth vector
    normal_depth = np.array([
        2984.2, 1450.0, 2984.0, 2100.0, 2983.8, 1850.0, 2983.5, 3200.0, 2983.0, 4500.0,
        2985.1, 1120.0, 2985.4, 1600.0, 2985.8, 1950.0, 2986.0, 2800.0, 2986.5, 3900.0,
    ])
    res_normal = vae.score_microstructure_anomaly(normal_depth)
    assert not res_normal["anomaly_detected"], f"Expected normal flow, got anomaly: {res_normal}"
    
    # Anomaly depth vector: Extreme layer spoofing / quote stuffing
    spoofed_depth = normal_depth.copy()
    spoofed_depth[1::2] *= 100.0 # 100x irregular volume spikes
    spoofed_depth[0] = 3100.0 # wild disjoint price
    res_spoofed = vae.score_microstructure_anomaly(spoofed_depth)
    assert res_spoofed["anomaly_detected"], "Expected spoofed flow to trigger anomaly alert"
    assert res_spoofed["reconstruction_loss"] > res_normal["reconstruction_loss"]
    print(f"  -> VAE ELBO loss verified: Normal recon={res_normal['reconstruction_loss']}, Spoofed recon={res_spoofed['reconstruction_loss']} (Anomaly={res_spoofed['anomaly_detected']})")


def test_multimodal_copilot():
    print("\n[6/7] Testing Vision-Language Multimodal Trading Copilot...")
    copilot = VisionLanguageTradingCopilot()
    
    prices = 2950.0 + np.cumsum(np.random.normal(0.5, 2.0, 60))
    res = copilot.analyze_chart_and_context(
        symbol="RELIANCE",
        prices=prices,
        rsi=24.5, # Oversold
        macd={"macd": -3.2, "signal": -4.5, "histogram": 1.3}, # Bullish histogram crossover
        bollinger={"upper": 3050.0, "mid": 2980.0, "lower": 2920.0},
        portfolio_state={"weight_pct": 8.5, "unrealized_pnl_pct": -1.2},
    )
    
    assert "technical_indicator_analysis" in res
    assert "bitemporal_rag_context" in res
    assert "strategic_copilot_guidance" in res
    assert "actionable_bias" in res
    print(f"  -> Copilot reasoning verified. Bias: {res['actionable_bias']}, Strategy: {res['strategic_copilot_guidance']}")


def test_fastapi_endpoints():
    print("\n[7/7] Testing v23 FastAPI Route Handlers with Pydantic Payloads...")
    
    # 1. Telemetry
    telemetry = get_dl_telemetry()
    assert telemetry["status"] == "ONLINE"
    assert "tft_forecaster" in telemetry["modules"]
    print("  -> get_dl_telemetry(): OK (Status: ONLINE)")
    
    # 2. Analyze Market State (Unified Pipeline)
    market_res = analyze_dl_market_state(MarketAnalysisRequest(
        symbol="TCS",
        spread_bps=2.8,
        vpin=0.21,
        obi=0.08
    ))
    assert market_res["status"] == "SUCCESS"
    assert market_res["symbol"] == "TCS"
    assert "tft_forecast" in market_res
    assert "vae_microstructure_anomaly" in market_res
    assert "tcn_detected_patterns" in market_res
    assert "sac_execution_assistance" in market_res
    assert "multimodal_copilot" in market_res
    print(f"  -> analyze_dl_market_state(): OK, overall status={market_res['overall_status']}")
    
    # 3. Forecast
    forecast_res = get_dl_forecast(ForecastRequest(symbol="INFY", sequence_length=60))
    assert "multi_horizon_quantiles" in forecast_res
    assert forecast_res["symbol"] == "INFY"
    print("  -> get_dl_forecast(): OK, quantiles predicted")
    
    # 4. Patterns Detect
    patterns_res = detect_dl_patterns(MarketAnalysisRequest(symbol="HDFCBANK", spread_bps=3.0, obi=0.10))
    assert "patterns_detected" in patterns_res
    print(f"  -> detect_dl_patterns(): OK, {patterns_res['total_patterns']} patterns detected")
    
    # 5. SAC Slice
    sac_res = get_sac_execution_slice(SACSliceRequest(
        remaining_volume=4000.0,
        remaining_time_minutes=25.0,
        spread_bps=3.1,
        vpin=0.22,
        obi=0.15,
        arrival_price=1650.0
    ))
    assert "recommended_slice_qty" in sac_res
    assert "limit_offset_bps" in sac_res
    print(f"  -> get_sac_execution_slice(): OK, slice={sac_res['recommended_slice_qty']} shares")
    
    # 6. VAE Anomaly
    vae_res = check_vae_anomaly(AnomalyCheckRequest())
    assert "anomaly_detected" in vae_res
    assert "reconstruction_loss" in vae_res
    print(f"  -> check_vae_anomaly(): OK, recon_loss={vae_res['reconstruction_loss']}")
    
    # 7. Copilot Reason
    copilot_res = copilot_reasoning(CopilotReasoningRequest(
        symbol="RELIANCE",
        rsi=55.0,
        user_query="Evaluate intraday liquidity and execution risk."
    ))
    assert "strategic_copilot_guidance" in copilot_res
    print(f"  -> copilot_reasoning(): OK, bias={copilot_res['actionable_bias']}")


if __name__ == "__main__":
    print("=" * 75)
    print("QUANTX INSTITUTIONAL PLATFORM - SUGGESTION v23 E2E VERIFICATION")
    print("=" * 75)
    
    try:
        test_grn_mathematics()
        test_tft_forecaster()
        test_tcn_pattern_analyzer()
        test_sac_execution_assistant()
        test_vae_anomaly_detector()
        test_multimodal_copilot()
        test_fastapi_endpoints()
        
        print("\n" + "=" * 75)
        print("ALL v23 DEEP LEARNING & AI TRADING COPILOT TESTS PASSED (100% SUCCESS)!")
        print("=" * 75)
        sys.exit(0)
    except AssertionError as ae:
        print(f"\n[FAIL] Assertion error: {ae}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] Unexpected exception: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(2)

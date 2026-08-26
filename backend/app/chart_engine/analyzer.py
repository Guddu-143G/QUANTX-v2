import pandas as pd
from .indicators import add_indicators
from .patterns import detect_patterns
from .structure import get_latest_structure
from .support_resistance import detect_support_resistance
from .market_regime import detect_market_regime
from .scoring import calculate_quantx_score
from .explanation import generate_explanation

def analyze_chart_data(df: pd.DataFrame, symbol: str = "UNKNOWN") -> dict:
    """
    Main orchestrator for Phase 1 Deterministic Chart Analyzer.
    """
    # 1. Add Indicators
    df = add_indicators(df)
    
    # 2. Add Patterns
    df = detect_patterns(df)
    
    # Get the latest row for scoring
    last = df.iloc[-1]
    
    # Extract active patterns
    patterns = []
    if last.get('pattern_doji'): patterns.append('Doji')
    if last.get('pattern_bullish_engulfing'): patterns.append('Bullish Engulfing')
    if last.get('pattern_bearish_engulfing'): patterns.append('Bearish Engulfing')
    if last.get('pattern_hammer'): patterns.append('Hammer')
    if last.get('pattern_shooting_star'): patterns.append('Shooting Star')
    
    # 3. Structure & S/R
    struct = get_latest_structure(df)
    sr = detect_support_resistance(df)
    
    # 4. Market Regime
    regime = detect_market_regime(df)
    
    # Prepare metrics payload for scoring
    # Calculate volume SMA
    vol_sma = df['volume'].rolling(20).mean().iloc[-1] if len(df) >= 20 else df['volume'].mean()
    vol_ratio = last['volume'] / vol_sma if vol_sma > 0 else 1.0
    
    close_change = last['close'] - df.iloc[-2]['close'] if len(df) > 1 else 0
    macd_hist = last.get('MACDh_12_26_9', 0)
    
    vwap_val = last.get('VWAP_D', 0)
    if pd.isna(vwap_val) and 'VWAP_d' in last: vwap_val = last['VWAP_d']
    
    metrics = {
        "trend": {
            "price_above_ema20": bool(last['close'] > last.get('EMA_20', 0)),
            "ema20_above_ema50": bool(last.get('EMA_20', 0) > last.get('EMA_50', 0)),
            "ema20": float(last.get('EMA_20', 0)),
            "ema50": float(last.get('EMA_50', 0))
        },
        "momentum": {
            "rsi": float(last.get('RSI_14', 50)),
            "macd": float(last.get('MACD_12_26_9', 0)),
            "macd_hist": float(macd_hist),
            "state": "Strong" if macd_hist > 0 else "Weak"
        },
        "volume": {
            "volume_ratio": float(vol_ratio),
            "raw": float(last['volume'])
        },
        "vwap": {
            "value": float(vwap_val),
            "price_above_vwap": bool(last['close'] > vwap_val)
        },
        "volatility": {
            "atr": float(last.get('ATRr_14', 0)),
            "bb_width": float((last.get('BBU_20_2.0', 0) - last.get('BBL_20_2.0', 0)) / last['close'] * 100 if last.get('BBU_20_2.0') else 0)
        },
        "structure": struct,
        "patterns": patterns,
        "regime": regime,
        "support_resistance": {
            "resistance": [float(r) for r in sr['resistance']],
            "support": [float(s) for s in sr['support']]
        },
        "close_change": float(close_change),
        "current_price": float(last['close'])
    }
    
    # 5. Score Engine
    score_result = calculate_quantx_score(metrics)
    
    # 6. ML Confidence Engine
    # Only import here to avoid circular dependencies if needed
    try:
        from ..quant.ml_model import predict_signal_confidence
        ml_confidence = predict_signal_confidence(metrics)
    except Exception as e:
        print("Failed to run ML prediction:", e)
        ml_confidence = 50.0
        
    score_result['ml_confidence'] = ml_confidence
    
    # 7. Explanation Engine
    explanation = generate_explanation(metrics, score_result)
    
    return {
        "symbol": symbol,
        "metrics": metrics,
        "score": score_result,
        "explanation": explanation
    }

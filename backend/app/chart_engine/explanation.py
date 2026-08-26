def generate_explanation(metrics: dict, score_result: dict) -> dict:
    """
    Generates deterministic rule-based natural language explanation for the QuantX score.
    """
    positive = []
    negative = []
    
    # Trend
    if metrics.get('trend', {}).get('price_above_ema20'):
        positive.append("Price is trending above the EMA20")
    else:
        negative.append("Price is below the EMA20")
        
    if metrics.get('trend', {}).get('ema20_above_ema50'):
        positive.append("EMA20 is above EMA50 (Bullish Crossover)")
    else:
        negative.append("EMA20 is below EMA50 (Bearish Crossover)")
        
    # Momentum
    rsi = metrics.get('momentum', {}).get('rsi', 50)
    if rsi > 70:
        negative.append(f"RSI is overbought ({rsi:.1f})")
    elif rsi > 50:
        positive.append(f"RSI shows positive momentum ({rsi:.1f})")
    elif rsi < 30:
        positive.append(f"RSI is oversold ({rsi:.1f}), potential bounce")
    else:
        negative.append(f"RSI shows negative momentum ({rsi:.1f})")
        
    # Volume
    vol_ratio = metrics.get('volume', {}).get('volume_ratio', 1.0)
    if vol_ratio > 1.2:
        if metrics.get('close_change', 0) > 0:
            positive.append(f"Strong buying volume ({vol_ratio:.1f}x average)")
        else:
            negative.append(f"Heavy selling volume ({vol_ratio:.1f}x average)")
            
    # VWAP
    if metrics.get('vwap', {}).get('price_above_vwap'):
        positive.append("Price is holding above VWAP")
    else:
        negative.append("Price is trading below VWAP")
        
    # Structure
    struct = metrics.get('structure')
    if struct == 'HH/HL':
        positive.append("Higher-high market structure")
    elif struct == 'LH/LL':
        negative.append("Lower-low market structure")
        
    return {
        "positive_factors": positive,
        "negative_factors": negative,
        "risk": "MODERATE", # Fixed for Phase 1
        "setup_quality": "HIGH" if score_result['score'] >= 75 else "MODERATE" if score_result['score'] >= 50 else "LOW"
    }

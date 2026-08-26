def calculate_quantx_score(metrics: dict) -> dict:
    """
    Calculates the aggregate QuantX score out of 100 based on weighted metrics.
    
    Weights:
    Trend: 20%
    Momentum: 20%
    Market Structure: 15%
    Volume: 15%
    VWAP: 10%
    Volatility: 10%
    Candlestick: 10%
    """
    score = 0
    
    # 1. Trend (20)
    trend = metrics.get('trend', {})
    trend_score = 0
    if trend.get('price_above_ema20'): trend_score += 10
    if trend.get('ema20_above_ema50'): trend_score += 10
    score += trend_score
    
    # 2. Momentum (20)
    momentum = metrics.get('momentum', {})
    mom_score = 0
    rsi = momentum.get('rsi', 50)
    macd_hist = momentum.get('macd_hist', 0)
    
    if 50 < rsi < 70: mom_score += 10
    elif rsi >= 70: mom_score += 5 # Overbought, less bullish
    elif 30 <= rsi <= 50: mom_score += 5 # Neutral-bearish
    # below 30 is oversold, maybe bounce but technically bearish momentum
    
    if macd_hist > 0: mom_score += 10
    score += mom_score
    
    # 3. Structure (15)
    struct = metrics.get('structure', 'RANGE')
    struct_score = 0
    if struct == 'HH/HL': struct_score = 15
    elif struct in ('EXPANDING', 'CONTRACTING', 'RANGE'): struct_score = 7.5
    elif struct == 'LH/LL': struct_score = 0
    score += struct_score
    
    # 4. Volume (15)
    vol = metrics.get('volume', {})
    vol_score = 0
    if vol.get('volume_ratio', 1.0) > 1.2:
        if metrics.get('close_change', 0) > 0:
            vol_score = 15
        else:
            vol_score = 0 # High volume down day is bearish
    else:
        vol_score = 7.5 # Average volume
    score += vol_score
    
    # 5. VWAP (10)
    vwap = metrics.get('vwap', {})
    vwap_score = 10 if vwap.get('price_above_vwap') else 0
    score += vwap_score
    
    # 6. Volatility (10)
    # We want moderate volatility. Too high is risky, too low is dead.
    # For a directional score, we'll give neutral 5 points.
    score += 5 
    
    # 7. Candlestick (10)
    patterns = metrics.get('patterns', [])
    candle_score = 5
    if 'Bullish Engulfing' in patterns or 'Hammer' in patterns or 'Morning Star' in patterns:
        candle_score = 10
    elif 'Bearish Engulfing' in patterns or 'Shooting Star' in patterns:
        candle_score = 0
    score += candle_score
    
    # Final signal mapping
    if score >= 65:
        signal = 'BULLISH'
    elif score <= 40:
        signal = 'BEARISH'
    else:
        signal = 'NEUTRAL'
        
    return {
        "score": round(score),
        "signal": signal,
        "confidence": min(100, round(abs(score - 50) * 2)) # Distance from 50
    }

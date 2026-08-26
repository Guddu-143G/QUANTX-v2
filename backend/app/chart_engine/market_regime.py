import pandas as pd

def detect_market_regime(df: pd.DataFrame) -> str:
    """
    Classifies the current market regime based on ADX and EMA slopes.
    """
    if len(df) < 2:
        return "UNKNOWN"
        
    last_row = df.iloc[-1]
    prev_row = df.iloc[-2]
    
    # Get values safely, defaulting to 0 if indicator is missing
    adx = last_row.get('ADX_14', 0)
    ema20 = last_row.get('EMA_20', 0)
    ema50 = last_row.get('EMA_50', 0)
    
    ema20_prev = prev_row.get('EMA_20', 0)
    
    ema_slope = ema20 - ema20_prev
    is_trending = adx > 25
    
    if is_trending:
        if ema_slope > 0 and ema20 > ema50:
            return "TRENDING BULLISH"
        elif ema_slope < 0 and ema20 < ema50:
            return "TRENDING BEARISH"
        else:
            return "TRENDING"
    else:
        # We could check Bollinger Band width for HIGH/LOW volatility ranges
        return "SIDEWAYS"

import pandas as pd

def detect_support_resistance(df: pd.DataFrame, window=10) -> dict:
    """
    Detects key support and resistance levels from recent swing points.
    """
    is_high = df['high'] == df['high'].rolling(window=window*2+1, center=True).max()
    is_low = df['low'] == df['low'].rolling(window=window*2+1, center=True).min()
    
    highs = df[is_high]['high'].dropna()
    lows = df[is_low]['low'].dropna()
    
    # Sort descending for resistance, ascending for support
    # We take the most recent 5 peaks/troughs to find current relevant levels
    recent_highs = sorted(highs.tail(5).tolist(), reverse=True)
    recent_lows = sorted(lows.tail(5).tolist())
    
    # Unique values, top 2
    resistances = []
    for h in recent_highs:
        if not resistances or abs(h - resistances[-1]) > (h * 0.001): # 0.1% threshold to deduplicate
            resistances.append(h)
            if len(resistances) >= 2: break
            
    supports = []
    for l in recent_lows:
        if not supports or abs(l - supports[-1]) > (l * 0.001):
            supports.append(l)
            if len(supports) >= 2: break
            
    return {
        "resistance": resistances,
        "support": supports
    }

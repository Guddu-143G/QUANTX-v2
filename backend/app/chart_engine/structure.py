import pandas as pd
import numpy as np

def get_latest_structure(df: pd.DataFrame, window=5) -> str:
    """
    Detects the current market structure (HH/HL, LH/LL, etc.) based on recent swing highs and lows.
    """
    # Calculate local highs and lows
    # Forward-looking is okay here because we are looking historically to define current state
    # We dropna to get just the peak/trough points
    is_high = df['high'] == df['high'].rolling(window=window*2+1, center=True).max()
    is_low = df['low'] == df['low'].rolling(window=window*2+1, center=True).min()
    
    highs = df[is_high]['high']
    lows = df[is_low]['low']
    
    if len(highs) >= 2 and len(lows) >= 2:
        last_high, prev_high = highs.iloc[-1], highs.iloc[-2]
        last_low, prev_low = lows.iloc[-1], lows.iloc[-2]
        
        hh = last_high > prev_high
        hl = last_low > prev_low
        lh = last_high < prev_high
        ll = last_low < prev_low
        
        if hh and hl: return "HH/HL"
        if lh and ll: return "LH/LL"
        if hh and ll: return "EXPANDING"
        if lh and hl: return "CONTRACTING"
        
    return "RANGE"

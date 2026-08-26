import pandas as pd
import numpy as np

def detect_patterns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Detects deterministic candlestick patterns.
    Returns the dataframe with pattern columns added.
    """
    df = df.copy()
    
    # Helper series
    op = df['open']
    hi = df['high']
    lo = df['low']
    cl = df['close']
    
    body = (cl - op).abs()
    range_hl = hi - lo
    
    upper_wick = np.where(cl > op, hi - cl, hi - op)
    lower_wick = np.where(cl > op, op - lo, cl - lo)
    
    # 1. Doji
    # Body is very small compared to range
    df['pattern_doji'] = (body <= (range_hl * 0.1)) & (range_hl > 0)
    
    # 2. Bullish Engulfing
    # Previous body is bearish, current body is bullish and engulfs previous body
    prev_op = op.shift(1)
    prev_cl = cl.shift(1)
    
    prev_bearish = prev_cl < prev_op
    curr_bullish = cl > op
    
    df['pattern_bullish_engulfing'] = (
        prev_bearish & 
        curr_bullish & 
        (op <= prev_cl) & 
        (cl >= prev_op) &
        (body > (prev_op - prev_cl).abs())
    )
    
    # 3. Bearish Engulfing
    df['pattern_bearish_engulfing'] = (
        ~prev_bearish & # Prev was bullish
        ~curr_bullish & # Curr is bearish
        (op >= prev_cl) & 
        (cl <= prev_op) &
        (body > (prev_cl - prev_op).abs())
    )
    
    # 4. Hammer
    # Small body, long lower wick (at least 2x body), short upper wick
    df['pattern_hammer'] = (
        (lower_wick >= 2 * body) & 
        (upper_wick <= body) & 
        (body > 0)
    )
    
    # 5. Shooting Star
    # Small body, long upper wick, short lower wick
    df['pattern_shooting_star'] = (
        (upper_wick >= 2 * body) & 
        (lower_wick <= body) & 
        (body > 0)
    )
    
    return df

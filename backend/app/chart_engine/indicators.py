import pandas as pd
import pandas_ta as ta

def add_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Takes an OHLCV dataframe and appends technical indicators.
    Required columns: 'open', 'high', 'low', 'close', 'volume'
    The index should ideally be a DatetimeIndex for accurate VWAP calculation.
    """
    df = df.copy()
    
    # Ensure columns are lowercase
    cols = {c: c.lower() for c in df.columns}
    df = df.rename(columns=cols)
    
    # EMAs
    df.ta.ema(length=20, append=True)
    df.ta.ema(length=50, append=True)
    
    # RSI
    df.ta.rsi(length=14, append=True)
    
    # MACD
    df.ta.macd(fast=12, slow=26, signal=9, append=True)
    
    # ATR
    df.ta.atr(length=14, append=True)
    
    # Bollinger Bands
    df.ta.bbands(length=20, std=2, append=True)
    
    # ADX
    df.ta.adx(length=14, append=True)
    
    # VWAP
    # Fallback to simple volume weighted average if ta.vwap fails due to no datetime index
    try:
        df.ta.vwap(append=True)
    except Exception:
        typical_price = (df['high'] + df['low'] + df['close']) / 3
        df['VWAP_D'] = (typical_price * df['volume']).cumsum() / df['volume'].cumsum()
        
    return df

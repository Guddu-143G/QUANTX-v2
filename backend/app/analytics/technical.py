import pandas as pd
from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, timedelta
import math

from ..market.kite_auth import get_kite_client, load_access_token
from ..auth import get_db

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])

def calculate_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def calculate_macd(series: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9):
    exp1 = series.ewm(span=fast, adjust=False).mean()
    exp2 = series.ewm(span=slow, adjust=False).mean()
    macd = exp1 - exp2
    signal_line = macd.ewm(span=signal, adjust=False).mean()
    return macd, signal_line

def calculate_bollinger_bands(series: pd.Series, window: int = 20, num_std: int = 2):
    rolling_mean = series.rolling(window=window).mean()
    rolling_std = series.rolling(window=window).std()
    upper_band = rolling_mean + (rolling_std * num_std)
    lower_band = rolling_mean - (rolling_std * num_std)
    return upper_band, lower_band

@router.get("/indicators/{tradingsymbol}")
def get_indicators(tradingsymbol: str, exchange: str = "NSE"):
    token = load_access_token()
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated with Kite")
        
    with get_db() as db:
        row = db.execute(
            "SELECT instrument_token FROM kite_instruments WHERE exchange = ? AND tradingsymbol = ?",
            (exchange.upper(), tradingsymbol.upper())
        ).fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Instrument not found in database")
            
        instrument_token = row["instrument_token"]

    kite = get_kite_client()
    kite.set_access_token(token)
    
    # Fetch 90 days of daily data for indicator calculation
    to_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    from_date = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d 00:00:00")
    
    try:
        data = kite.historical_data(instrument_token, from_date, to_date, "day")
        if not data or len(data) < 26:
            raise HTTPException(status_code=400, detail="Not enough data to calculate indicators")
            
        df = pd.DataFrame(data)
        df.set_index("date", inplace=True)
        
        # Calculate Indicators
        df['RSI'] = calculate_rsi(df['close'])
        macd, signal_line = calculate_macd(df['close'])
        df['MACD'] = macd
        df['MACD_Signal'] = signal_line
        upper, lower = calculate_bollinger_bands(df['close'])
        df['BB_Upper'] = upper
        df['BB_Lower'] = lower
        
        latest = df.iloc[-1]
        
        def safe_round(val, decimals=2):
            if pd.isna(val) or math.isnan(val):
                return None
            return round(val, decimals)
        
        # QUANTX SCORE Algorithm
        momentum = 50
        rsi_val = latest['RSI']
        if not pd.isna(rsi_val):
            if rsi_val > 50:
                momentum += 20
            elif rsi_val < 30:
                momentum -= 20
                
        macd_val = latest['MACD']
        macd_sig = latest['MACD_Signal']
        if not pd.isna(macd_val) and not pd.isna(macd_sig):
            if macd_val > macd_sig:
                momentum += 20
            else:
                momentum -= 10
                
        momentum = max(0, min(100, momentum))
        quality = 70 + (len(tradingsymbol) % 20)
        quantx_score = (momentum * 0.6) + (quality * 0.4)
        
        return {
            "status": "success",
            "symbol": tradingsymbol,
            "indicators": {
                "rsi": safe_round(latest['RSI']),
                "macd": safe_round(latest['MACD']),
                "macd_signal": safe_round(latest['MACD_Signal']),
                "bb_upper": safe_round(latest['BB_Upper']),
                "bb_lower": safe_round(latest['BB_Lower']),
            },
            "scores": {
                "quantx_score": safe_round(quantx_score / 100),
                "momentum": momentum,
                "quality": quality
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

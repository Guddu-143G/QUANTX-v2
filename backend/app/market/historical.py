from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, timedelta
from typing import Optional

from .kite_auth import get_kite_client, load_access_token
from ..auth import get_db

router = APIRouter(prefix="/api/v1/market/historical", tags=["historical"])

@router.get("/{tradingsymbol}")
def get_historical_data(
    tradingsymbol: str,
    interval: str = Query("5minute", description="minute, 3minute, 5minute, 15minute, 30minute, 60minute, day"),
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    exchange: str = "NSE"
):
    token = load_access_token()
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated with Kite")
        
    # Find instrument token
    with get_db() as db:
        row = db.execute(
            "SELECT instrument_token FROM kite_instruments WHERE exchange = ? AND tradingsymbol = ?",
            (exchange.upper(), tradingsymbol.upper())
        ).fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Instrument not found in database. Run sync first.")
            
        instrument_token = row["instrument_token"]

    kite = get_kite_client()
    kite.set_access_token(token)
    
    # Default to last 5 days if dates not provided
    if not to_date:
        to_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if not from_date:
        from_date = (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d 00:00:00")
        
    try:
        data = kite.historical_data(instrument_token, from_date, to_date, interval)
        formatted_data = []
        for d in data:
            formatted_data.append({
                "t": d["date"].strftime("%H:%M") if interval != "day" else d["date"].strftime("%Y-%m-%d"),
                "full_date": d["date"].isoformat(),
                "o": d["open"],
                "h": d["high"],
                "l": d["low"],
                "c": d["close"],
                "v": d["volume"]
            })
            
        return {"status": "success", "data": formatted_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

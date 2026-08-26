from fastapi import APIRouter, HTTPException
from ..market.kite_auth import get_kite_client, load_access_token

router = APIRouter(prefix="/api/v1/portfolio", tags=["portfolio"])

@router.get("/holdings")
def get_holdings():
    token = load_access_token()
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated with Kite")
        
    kite = get_kite_client()
    kite.set_access_token(token)
    
    try:
        data = kite.holdings()
        
        # Format the holdings to match the frontend expectations
        # Frontend expects: ticker, name, qty, avg, ltp, value, pnl, pnlPct, weight, sector, signal
        # Note: sector/signal are mock fields in the frontend, we'll assign defaults.
        
        formatted = []
        total_value = sum((item['last_price'] * item['quantity']) for item in data)
        
        for item in data:
            qty = item['quantity']
            if qty == 0:
                continue
            
            avg = item['average_price']
            ltp = item['last_price']
            value = qty * ltp
            pnl = value - (qty * avg)
            pnlPct = (pnl / (qty * avg)) * 100 if (qty * avg) > 0 else 0
            weight = (value / total_value) * 100 if total_value > 0 else 0
            
            formatted.append({
                "ticker": item['tradingsymbol'],
                "name": item['tradingsymbol'],
                "token": item['instrument_token'],
                "qty": qty,
                "avg": avg,
                "ltp": ltp,
                "value": value,
                "pnl": pnl,
                "pnlPct": pnlPct,
                "weight": weight,
                "sector": "Equity",
                "signal": "HOLD" # We'll just default this for now
            })
            
        return {"status": "success", "data": formatted}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/positions")
def get_positions():
    token = load_access_token()
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated with Kite")
        
    kite = get_kite_client()
    kite.set_access_token(token)
    
    try:
        data = kite.positions()
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

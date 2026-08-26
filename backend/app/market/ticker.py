import os
from pydantic import BaseModel
from kiteconnect import KiteTicker
from fastapi import APIRouter, HTTPException
from typing import List

from .kite_auth import load_access_token
from .redis_client import publish_tick

router = APIRouter(prefix="/api/v1/market/ticker", tags=["ticker"])

# Global reference to keep track of the ticker instance
_ticker_instance = None

def on_ticks(ws, ticks):
    # Callback to receive ticks.
    for tick in ticks:
        instrument_token = tick.get("instrument_token")
        if instrument_token:
            publish_tick(instrument_token, tick)

def on_connect(ws, response):
    # Callback on successful connect.
    print("Successfully connected to Kite Ticker")

def on_close(ws, code, reason):
    # On connection close.
    print(f"Kite Ticker closed: {code} - {reason}")

@router.post("/start")
def start_ticker():
    global _ticker_instance
    if _ticker_instance:
        return {"status": "already_running"}
        
    api_key = os.getenv("KITE_API_KEY")
    access_token = load_access_token()
    
    if not api_key or not access_token:
        raise HTTPException(status_code=400, detail="Missing API Key or Access Token. Please login to Kite first.")
        
    try:
        kws = KiteTicker(api_key, access_token)
        
        kws.on_ticks = on_ticks
        kws.on_connect = on_connect
        kws.on_close = on_close
        
        # Connect in a separate thread so it doesn't block FastAPI
        kws.connect(threaded=True)
        _ticker_instance = kws
        
        return {"status": "started", "message": "Kite Ticker connected in background thread"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start ticker: {str(e)}")

@router.post("/stop")
def stop_ticker():
    global _ticker_instance
    if _ticker_instance:
        _ticker_instance.close()
        _ticker_instance = None
        return {"status": "stopped"}
    return {"status": "not_running"}

class SubscriptionRequest(BaseModel):
    instrument_tokens: List[int]

@router.post("/subscribe")
def subscribe_instruments(payload: SubscriptionRequest):
    global _ticker_instance
    if not _ticker_instance:
        raise HTTPException(status_code=400, detail="Ticker is not running. Call /start first.")
        
    _ticker_instance.subscribe(payload.instrument_tokens)
    _ticker_instance.set_mode(_ticker_instance.MODE_FULL, payload.instrument_tokens)
    return {"status": "subscribed", "tokens": payload.instrument_tokens}

@router.post("/unsubscribe")
def unsubscribe_instruments(payload: SubscriptionRequest):
    global _ticker_instance
    if not _ticker_instance:
        raise HTTPException(status_code=400, detail="Ticker is not running.")
        
    _ticker_instance.unsubscribe(payload.instrument_tokens)
    return {"status": "unsubscribed", "tokens": payload.instrument_tokens}

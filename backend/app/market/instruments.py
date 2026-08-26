import sqlite3
from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from typing import List, Optional
from datetime import datetime

from .kite_auth import get_kite_client, load_access_token
from ..auth import get_db, now

router = APIRouter(prefix="/api/v1/market/instruments", tags=["instruments"])

def sync_instruments_task():
    token = load_access_token()
    if not token:
        print("Cannot sync instruments: No access token found.")
        return
    
    kite = get_kite_client()
    kite.set_access_token(token)
    
    try:
        instruments = kite.instruments()
        
        with get_db() as db:
            rows = []
            for item in instruments:
                # Convert date/expiry to string if present
                expiry = item.get("expiry")
                if expiry:
                    expiry = expiry.isoformat() if hasattr(expiry, "isoformat") else str(expiry)

                rows.append((
                    item.get("instrument_token"),
                    item.get("exchange_token"),
                    item.get("tradingsymbol"),
                    item.get("name"),
                    item.get("last_price"),
                    expiry,
                    item.get("strike"),
                    item.get("tick_size"),
                    item.get("lot_size"),
                    item.get("instrument_type"),
                    item.get("segment"),
                    item.get("exchange"),
                    now().isoformat()
                ))
            
            query = """
                INSERT INTO kite_instruments (
                    instrument_token, exchange_token, tradingsymbol, name, 
                    last_price, expiry, strike, tick_size, lot_size, 
                    instrument_type, segment, exchange, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(instrument_token) DO UPDATE SET
                    exchange_token=excluded.exchange_token,
                    tradingsymbol=excluded.tradingsymbol,
                    name=excluded.name,
                    last_price=excluded.last_price,
                    expiry=excluded.expiry,
                    strike=excluded.strike,
                    tick_size=excluded.tick_size,
                    lot_size=excluded.lot_size,
                    instrument_type=excluded.instrument_type,
                    segment=excluded.segment,
                    exchange=excluded.exchange,
                    updated_at=excluded.updated_at
            """
            
            # Disable synchronous for faster bulk insert
            db.execute("PRAGMA synchronous = OFF")
            db.execute("PRAGMA journal_mode = MEMORY")
            db.executemany(query, rows)
            
        print(f"Successfully synced {len(instruments)} instruments.")
    except Exception as e:
        print(f"Failed to sync instruments: {e}")

@router.post("/sync")
def trigger_sync(background_tasks: BackgroundTasks):
    background_tasks.add_task(sync_instruments_task)
    return {"status": "success", "message": "Instrument sync started in the background."}

@router.get("/search")
def search_instruments(q: str = Query(..., min_length=2), limit: int = 20, exchange: Optional[str] = None):
    with get_db() as db:
        query = "SELECT * FROM kite_instruments WHERE tradingsymbol LIKE ? OR name LIKE ?"
        params = [f"%{q.upper()}%", f"%{q.upper()}%"]
        if exchange:
            query += " AND exchange = ?"
            params.append(exchange)
        query += " LIMIT ?"
        params.append(limit)
        
        results = db.execute(query, params).fetchall()
        return [dict(r) for r in results]

@router.get("/{exchange}/{tradingsymbol}")
def get_instrument(exchange: str, tradingsymbol: str):
    with get_db() as db:
        row = db.execute("SELECT * FROM kite_instruments WHERE exchange = ? AND tradingsymbol = ?", (exchange.upper(), tradingsymbol.upper())).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Instrument not found")
        return dict(row)

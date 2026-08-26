from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import sqlite3
import uuid
import datetime
import os
import yfinance as yf
from .kite_auth import get_kite_client
from ..auth import DATABASE_PATH, current_user

router = APIRouter(prefix="/api/v1/execution", tags=["execution"])

class OrderRequest(BaseModel):
    ticker: str
    side: str # "BUY" or "SELL"
    quantity: int
    order_type: str # "MARKET" or "LIMIT"
    price: float = 0.0 # Relevant if LIMIT
    execution_mode: str = "PAPER" # "PAPER" or "LIVE"

@router.post("/order")
def place_order(payload: OrderRequest, request: Request):
    user = current_user(request)
    
    if payload.execution_mode == "LIVE":
        try:
            kite = get_kite_client()
            order_id = kite.place_order(
                variety=kite.VARIETY_REGULAR,
                exchange=kite.EXCHANGE_NSE,
                tradingsymbol=payload.ticker,
                transaction_type=kite.TRANSACTION_TYPE_BUY if payload.side.upper() == "BUY" else kite.TRANSACTION_TYPE_SELL,
                quantity=payload.quantity,
                product=kite.PRODUCT_CNC, # Cash and Carry by default for portfolio
                order_type=kite.ORDER_TYPE_MARKET if payload.order_type.upper() == "MARKET" else kite.ORDER_TYPE_LIMIT,
                price=payload.price if payload.order_type.upper() == "LIMIT" else None
            )
            return {"status": "success", "order_id": order_id, "mode": "LIVE"}
        except Exception as e:
            # Handle Kite errors cleanly
            raise HTTPException(status_code=400, detail=f"Live order failed: {str(e)}")
            
    elif payload.execution_mode == "PAPER":
        # Simulate execution
        price_to_fill = payload.price
        if payload.order_type.upper() == "MARKET":
            try:
                # Use yfinance to get live market price for realistic simulation
                ticker_obj = yf.Ticker(payload.ticker)
                fast_info = ticker_obj.fast_info
                live_price = fast_info.last_price
                if live_price:
                    price_to_fill = round(live_price, 2)
                else:
                    price_to_fill = 100.0
            except:
                price_to_fill = 100.0 # Fallback for demo
            
        order_id = f"pap_{uuid.uuid4().hex[:12]}"
        
        with sqlite3.connect(DATABASE_PATH) as conn:
            conn.execute('''
                INSERT INTO paper_orders (id, user_id, ticker, side, quantity, order_type, price, status, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                order_id, 
                user["id"], 
                payload.ticker, 
                payload.side.upper(), 
                payload.quantity, 
                payload.order_type.upper(), 
                price_to_fill, 
                "COMPLETE", 
                datetime.datetime.now(datetime.timezone.utc).isoformat()
            ))
            
        return {"status": "success", "order_id": order_id, "mode": "PAPER", "filled_price": price_to_fill}
        
    else:
        raise HTTPException(status_code=400, detail="Invalid execution mode")

@router.get("/blotter")
def get_blotter(request: Request, mode: str = "PAPER"):
    user = current_user(request)
    
    if mode == "LIVE":
        try:
            kite = get_kite_client()
            orders = kite.orders()
            # Map Kite orders to our UI format
            return {"status": "success", "data": [
                {
                    "id": o.get("order_id"),
                    "time": o.get("order_timestamp"),
                    "ticker": o.get("tradingsymbol"),
                    "side": o.get("transaction_type"),
                    "qty": o.get("quantity"),
                    "px": o.get("average_price") or o.get("price"),
                    "type": o.get("order_type"),
                    "status": o.get("status"),
                    "value": (o.get("average_price") or 0) * o.get("quantity")
                } for o in orders
            ]}
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to fetch live orders: {str(e)}")
            
    else:
        # Paper mode
        with sqlite3.connect(DATABASE_PATH) as conn:
            conn.row_factory = sqlite3.Row
            rows = conn.execute('''
                SELECT * FROM paper_orders WHERE user_id = ? ORDER BY timestamp DESC
            ''', (user["id"],)).fetchall()
            
            return {"status": "success", "data": [
                {
                    "id": r["id"],
                    "time": r["timestamp"].replace("T", " ")[:19],
                    "ticker": r["ticker"],
                    "side": r["side"],
                    "qty": r["quantity"],
                    "px": r["price"],
                    "type": r["order_type"],
                    "status": r["status"],
                    "value": r["price"] * r["quantity"]
                } for r in rows
            ]}

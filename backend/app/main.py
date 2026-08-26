from __future__ import annotations

import csv
import io
import os
from dotenv import load_dotenv
load_dotenv()

from typing import Annotated

import os
from fastapi import FastAPI, File, Form, HTTPException, Request, Response, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel, Field

from .analysis import AnalysisInputError, analyze_portfolio
from .middleware import AuditLogMiddleware
from .ai.vision import VisionService
from .auth import SESSION_TTL_HOURS, authenticate, capture_lead, create_session, create_user, current_user, email_available, initialise_database, profile, revoke_session, update_profile
from .quant.routes import router as quant_router
from .risk.engine import risk_engine
from .risk.stress import stress_engine
from .risk.surveillance import surveillance_engine
from .ws import ws_manager
from .market.kite_auth import router as kite_auth_router
from .market.instruments import router as instruments_router
from .market.ticker import router as ticker_router
from .market.execution import router as execution_router
from .market.historical import router as historical_router
from .market.earnings import router as earnings_router
from .portfolio.holdings import router as portfolio_router
from .research.news import router as research_router
from .copilot.chat import router as copilot_router

app = FastAPI(title="QUANTX Portfolio Intelligence API", version="1.0.0")
app.add_middleware(AuditLogMiddleware)
app.include_router(quant_router)
app.include_router(kite_auth_router)
app.include_router(instruments_router)
app.include_router(ticker_router)
app.include_router(execution_router)
app.include_router(historical_router)
app.include_router(earnings_router)
app.include_router(portfolio_router)
app.include_router(research_router)
app.include_router(copilot_router)

@app.websocket("/ws/risk")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # We don't expect messages from client in this simple setup,
            # but we need to await receive to keep connection open.
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

import asyncio

@app.websocket("/ws/market")
async def market_websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    from .market.redis_client import redis_async
    
    pubsub = redis_async.pubsub()
    
    async def reader(ws: WebSocket, ps):
        try:
            async for message in ps.listen():
                if message["type"] == "message":
                    # message["data"] is already a JSON string of the tick
                    await ws.send_text(message["data"])
        except asyncio.CancelledError:
            pass
        except Exception as e:
            print(f"PubSub reader error: {e}")

    reader_task = asyncio.create_task(reader(websocket, pubsub))
    
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("action") == "subscribe":
                tokens = data.get("tokens", [])
                channels = [f"market:ticks:{t}" for t in tokens]
                if channels:
                    await pubsub.subscribe(*channels)
            elif data.get("action") == "unsubscribe":
                tokens = data.get("tokens", [])
                channels = [f"market:ticks:{t}" for t in tokens]
                if channels:
                    await pubsub.unsubscribe(*channels)
    except WebSocketDisconnect:
        pass
    finally:
        reader_task.cancel()
        await pubsub.close()

class KillSwitchRequest(BaseModel):
    reason: str

@app.post("/api/v1/risk/kill-switch")
async def trigger_kill_switch(payload: KillSwitchRequest, request: Request):
    user = current_user(request)
    result = surveillance_engine.activate_kill_switch(payload.reason, user["email"])
    await ws_manager.broadcast({"type": "risk.kill_switch", "data": result})
    return result

@app.post("/api/v1/risk/kill-switch/reset")
async def reset_kill_switch(payload: KillSwitchRequest, request: Request):
    user = current_user(request)
    result = surveillance_engine.reset_kill_switch(payload.reason, user["email"])
    await ws_manager.broadcast({"type": "risk.kill_switch.restored", "data": result})
    return result

@app.get("/api/v1/risk/limits")
def get_risk_limits(request: Request):
    # For phase 1, we pass dummy current metrics
    current_metrics = {
        "portfolio_beta": 0.94,
        "portfolio_var": 1.77,
        "sector_concentration": 23.0,
        "single_position": 8.4,
        "margin_utilization": 72.0
    }
    return risk_engine.evaluate(current_metrics)

@app.post("/api/v1/risk/stress/matrix")
def get_scenario_matrix(request: Request):
    scenarios = [
        {"name": "Market -5%", "shocks": {"NIFTY": -0.05}},
        {"name": "Market -10%", "shocks": {"NIFTY": -0.10}},
        {"name": "Volatility +25%", "shocks": {"Volatility": 0.25}},
        {"name": "Volatility +50%", "shocks": {"Volatility": 0.50}},
    ]
    results = []
    for sc in scenarios:
        res = stress_engine.parametric_stress(sc["shocks"])
        results.append({
            "scenario": sc["name"],
            "pnl_pct": res.portfolio_pnl_pct,
            "new_var": res.new_var,
            "new_beta": res.new_beta,
            "drawdown": res.new_drawdown
        })
    return {"matrix": results}

@app.get("/api/v1/risk/stress/monte-carlo")
def get_monte_carlo(paths: int = 10000, request: Request = None):
    # Constrain paths to prevent memory blowouts in the demo
    paths = max(1000, min(paths, 100000))
    return stress_engine.monte_carlo_stress(paths=paths)

app.add_middleware(
    SessionMiddleware,
    secret_key="your-super-secret-key", # In prod, read from env
    https_only=True, # Secure cookies
    same_site="strict"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    holdings: list[dict]
    prices: list[dict]
    benchmark_ticker: str | None = None
    risk_free_rate: float = Field(default=0.06, ge=-0.2, le=1.0)
    max_position_weight: float = Field(default=0.12, gt=0, le=1)
    max_sector_weight: float = Field(default=0.30, gt=0, le=1)


class RegisterRequest(BaseModel):
    email: str
    full_name: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str

class ProfileUpdate(BaseModel):
    full_name: str
    title: str
    desk: str
    preferences: dict = {}

class LeadRequest(BaseModel):
    email: str
    source: str = "newsletter"

@app.post("/api/v1/leads", status_code=201)
def capture_lead_endpoint(payload: LeadRequest):
    return capture_lead(payload.email, payload.source)


from .csv_parser import validate_holdings_csv, validate_prices_csv

def parse_csv(raw: bytes, name: str) -> list[dict[str, str]]:
    # Left for legacy json support temporarily
    try:
        text = raw.decode("utf-8-sig")
        rows = list(csv.DictReader(io.StringIO(text)))
    except (UnicodeDecodeError, csv.Error) as exc:
        raise HTTPException(422, f"Could not read {name} as a UTF-8 CSV: {exc}") from exc
    if not rows or not rows[0]:
        raise HTTPException(422, f"{name} is empty or has no header row.")
    return rows


def run_analysis(**kwargs):
    try:
        return analyze_portfolio(**kwargs)
    except AnalysisInputError as exc:
        raise HTTPException(422, str(exc)) from exc


@app.get("/health")
def health():
    return {"status": "ok", "service": "quantx-analysis", "data_mode": "user_csv"}


@app.on_event("startup")
def startup():
    initialise_database()


def establish_session(response: Response, user: dict):
    token = create_session(user["id"])
    response.set_cookie("quantx_session", token, httponly=True, secure=os.getenv("APP_ENV") == "production", samesite="strict", max_age=SESSION_TTL_HOURS * 3600, path="/")
    return {"user": user}


@app.post("/api/v1/auth/register", status_code=201)
def register(payload: RegisterRequest, response: Response):
    return establish_session(response, create_user(payload.email, payload.full_name, payload.password))


@app.post("/api/v1/auth/login")
def login(payload: LoginRequest, response: Response):
    return establish_session(response, authenticate(payload.email, payload.password))


@app.get("/api/v1/auth/email-availability")
def check_email_availability(email: str):
    """Live registration feedback without returning account details."""
    return {"available": email_available(email)}


@app.post("/api/v1/auth/logout", status_code=204)
def logout(request: Request, response: Response):
    revoke_session(request.cookies.get("quantx_session"))
    response.delete_cookie("quantx_session", path="/")


@app.get("/api/v1/auth/me")
def me(request: Request):
    return {"user": current_user(request)}

@app.get("/api/v1/profile")
def get_profile(request: Request):
    return profile(current_user(request)["id"])

@app.patch("/api/v1/profile")
def patch_profile(payload: ProfileUpdate, request: Request):
    return update_profile(current_user(request)["id"], **payload.model_dump())


@app.post("/api/v1/portfolio/analyze")
async def analyze_csv(
    request: Request,
    holdings_file: Annotated[UploadFile, File(...)],
    prices_file: Annotated[UploadFile, File(...)],
    benchmark_ticker: Annotated[str | None, Form()] = None,
    risk_free_rate: Annotated[float, Form()] = 0.06,
    max_position_weight: Annotated[float, Form()] = 0.12,
    max_sector_weight: Annotated[float, Form()] = 0.30,
):
    current_user(request)
    if not holdings_file.filename.lower().endswith(".csv") or not prices_file.filename.lower().endswith(".csv"):
        raise HTTPException(422, "Both inputs must be CSV files.")
    holdings_data = validate_holdings_csv(await holdings_file.read())
    required_tickers = {h["ticker"] for h in holdings_data}
    
    prices_data = validate_prices_csv(
        await prices_file.read(), 
        required_tickers=required_tickers, 
        benchmark_ticker=benchmark_ticker
    )
    
    return run_analysis(
        holdings=holdings_data,
        prices=prices_data,
        benchmark_ticker=benchmark_ticker,
        risk_free_rate=risk_free_rate,
        max_position_weight=max_position_weight,
        max_sector_weight=max_sector_weight,
    )


@app.post("/api/v1/portfolio/analyze-json")
def analyze_json(payload: AnalyzeRequest, request: Request):
    current_user(request)
    return run_analysis(**payload.model_dump())

import pandas as pd
import numpy as np
import datetime
import math
from .chart_engine.analyzer import analyze_chart_data
from .chart_engine.backtest import run_historical_backtest

def clean_floats(obj):
    if isinstance(obj, dict):
        return {k: clean_floats(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_floats(v) for v in obj]
    elif isinstance(obj, (float, np.floating)):
        return None if math.isnan(obj) or math.isinf(obj) else float(obj)
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.bool_):
        return bool(obj)
    return obj

class ChartAnalyzeRequest(BaseModel):
    symbol: str = "TCS"
    timeframe: str = "15m"

def generate_mock_ohlcv(symbol, periods=100):
    dates = pd.date_range(end=datetime.datetime.now(), periods=periods, freq="15min")
    np.random.seed(42) # For reproducible 'mock' look if needed, or remove for dynamic
    returns = np.random.normal(loc=0.0001, scale=0.002, size=periods)
    
    start_price = 3400.0 if symbol == "TCS" else 1500.0
    close_prices = start_price * np.exp(np.cumsum(returns))
    
    high_prices = close_prices * (1 + np.abs(np.random.normal(0, 0.001, periods)))
    low_prices = close_prices * (1 - np.abs(np.random.normal(0, 0.001, periods)))
    open_prices = np.roll(close_prices, 1)
    open_prices[0] = start_price
    
    volumes = np.random.lognormal(mean=10, sigma=1, size=periods)
    
    # Inject breakout at end
    if np.random.random() > 0.7:
        close_prices[-1] = high_prices[-2] * 1.01
        high_prices[-1] = close_prices[-1] * 1.002
        volumes[-1] = volumes[-2] * 2.5
        
    return pd.DataFrame({
        'open': open_prices,
        'high': high_prices,
        'low': low_prices,
        'close': close_prices,
        'volume': volumes
    }, index=dates)

@app.post("/api/v1/analyze-chart/backtest")
async def backtest_chart(payload: ChartAnalyzeRequest):
    # Generate a larger dataset for backtesting (e.g. 5000 candles)
    df = generate_mock_ohlcv(payload.symbol, periods=5000)
    try:
        stats = run_historical_backtest(df, symbol=payload.symbol)
        
        return clean_floats(stats)
    except Exception as e:
        print("Backtest Error:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ml/train")
async def train_ml_model():
    try:
        from .quant.ml_model import train_xgboost_model
        result = train_xgboost_model()
        return result
    except Exception as e:
        print("ML Training Error:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ml/walk-forward")
async def walk_forward_ml():
    try:
        from .quant.ml_model import run_walk_forward_validation
        result = run_walk_forward_validation(n_splits=5)
        return result
    except Exception as e:
        print("Walk Forward Error:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/analyze-chart")
async def analyze_chart(payload: ChartAnalyzeRequest):
    # Phase 1: We mock 100 candles of OHLCV data for the deterministic engine
    df = generate_mock_ohlcv(payload.symbol, periods=100)
    
    try:
        # Run the deterministic engine
        analysis = analyze_chart_data(df, symbol=payload.symbol)
        
        return clean_floats(analysis)
        
    except Exception as e:
        print("Chart Analysis Error:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/chart-stream")
async def chart_stream(websocket: WebSocket, symbol: str = "TCS"):
    await websocket.accept()
    # Generate initial history
    df = generate_mock_ohlcv(symbol, periods=100)
    
    # We will simulate ticking every second
    try:
        while True:
            # Randomly perturb the latest candle's close price
            last_idx = df.index[-1]
            current_close = df.at[last_idx, 'close']
            tick = current_close * (1 + np.random.normal(0, 0.0005))
            
            df.at[last_idx, 'close'] = tick
            df.at[last_idx, 'high'] = max(df.at[last_idx, 'high'], tick)
            df.at[last_idx, 'low'] = min(df.at[last_idx, 'low'], tick)
            df.at[last_idx, 'volume'] += np.random.lognormal(mean=2, sigma=1)
            
            # Occasionally roll over to a new candle
            if np.random.random() > 0.95:
                new_idx = last_idx + pd.Timedelta(minutes=15)
                new_row = pd.DataFrame({
                    'open': [tick],
                    'high': [tick * 1.0001],
                    'low': [tick * 0.9999],
                    'close': [tick],
                    'volume': [0]
                }, index=[new_idx])
                df = pd.concat([df, new_row]).tail(100)
            
            # Run pipeline
            analysis = analyze_chart_data(df, symbol=symbol)
            
            await websocket.send_json(clean_floats(analysis))
            await asyncio.sleep(1.0)
            
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print("WS Chart Stream Error:", e)

class RiskScanRequest(BaseModel):
    holdings: list[str]

@app.post("/api/v1/portfolio/risk-scan")
def scan_portfolio_risk(req: RiskScanRequest):
    alerts = []
    
    for sym in req.holdings:
        # Mock recent history for the holding
        df = generate_mock_ohlcv(sym, periods=100)
        
        # Inject some randomness so we actually get alerts
        if np.random.random() > 0.7:
            # Force a bearish setup
            df['close'] = df['close'] * np.linspace(1, 0.95, 100)
            
        analysis = analyze_chart_data(df, symbol=sym)
        
        # Check risk thresholds: BEARISH signal or low score
        if analysis['score']['signal'] == 'BEARISH' or analysis['score']['score'] < 40:
            alerts.append({
                "symbol": sym,
                "score": analysis['score']['score'],
                "ml_confidence": analysis['score'].get('ml_confidence', 0),
                "structure": analysis['metrics']['structure'],
                "reason": "Deteriorating technicals and negative ML prediction."
            })
            
    return {"status": "success", "alerts": clean_floats(alerts)}

@app.websocket("/ws/screener")
async def screener_stream(websocket: WebSocket):
    await websocket.accept()
    
    symbols = ["TCS", "RELIANCE", "HDFCBANK", "INFY", "ICICIBANK", "SBIN", "ITC", "LART", "BAJFINANCE", "BHARTIARTL"]
    
    # Generate initial history for all
    dfs = {sym: generate_mock_ohlcv(sym, periods=100) for sym in symbols}
    
    try:
        while True:
            results = []
            
            for sym in symbols:
                df = dfs[sym]
                
                # Simulate tick
                last_idx = df.index[-1]
                current_close = df.at[last_idx, 'close']
                tick = current_close * (1 + np.random.normal(0, 0.0005))
                
                df.at[last_idx, 'close'] = tick
                df.at[last_idx, 'high'] = max(df.at[last_idx, 'high'], tick)
                df.at[last_idx, 'low'] = min(df.at[last_idx, 'low'], tick)
                df.at[last_idx, 'volume'] += np.random.lognormal(mean=2, sigma=1)
                
                if np.random.random() > 0.95:
                    new_idx = last_idx + pd.Timedelta(minutes=15)
                    new_row = pd.DataFrame({
                        'open': [tick],
                        'high': [tick * 1.0001],
                        'low': [tick * 0.9999],
                        'close': [tick],
                        'volume': [0]
                    }, index=[new_idx])
                    dfs[sym] = pd.concat([df, new_row]).tail(100)
                    df = dfs[sym]
                
                # Run pipeline
                analysis = analyze_chart_data(df, symbol=sym)
                results.append(analysis)
            
            await websocket.send_json(clean_floats(results))
            await asyncio.sleep(2.0)
            
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print("WS Screener Stream Error:", e)

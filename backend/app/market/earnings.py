from __future__ import annotations
from datetime import datetime, timedelta
from fastapi import APIRouter
import random

router = APIRouter(prefix="/api/v1/market", tags=["market"])

# Deterministic earnings calendar — seeded mock data for DEMO mode
# Real mode would hit NSE Corporate Actions API
_SEED = [
    {"ticker": "INFY", "company": "Infosys Ltd", "sector": "Technology", "seed": 101},
    {"ticker": "TCS", "company": "Tata Consultancy Services", "sector": "Technology", "seed": 102},
    {"ticker": "HDFCBANK", "company": "HDFC Bank", "sector": "Financials", "seed": 103},
    {"ticker": "RELIANCE", "company": "Reliance Industries", "sector": "Energy", "seed": 104},
    {"ticker": "ICICIBANK", "company": "ICICI Bank", "sector": "Financials", "seed": 105},
    {"ticker": "WIPRO", "company": "Wipro Ltd", "sector": "Technology", "seed": 106},
    {"ticker": "LT", "company": "Larsen & Toubro", "sector": "Industrials", "seed": 107},
    {"ticker": "SBIN", "company": "State Bank of India", "sector": "Financials", "seed": 108},
    {"ticker": "BHARTIARTL", "company": "Bharti Airtel", "sector": "Telecom", "seed": 109},
    {"ticker": "ITC", "company": "ITC Ltd", "sector": "Consumer", "seed": 110},
    {"ticker": "AXISBANK", "company": "Axis Bank", "sector": "Financials", "seed": 111},
    {"ticker": "MARUTI", "company": "Maruti Suzuki India", "sector": "Auto", "seed": 112},
    {"ticker": "TATAMOTORS", "company": "Tata Motors", "sector": "Auto", "seed": 113},
    {"ticker": "SUNPHARMA", "company": "Sun Pharmaceutical", "sector": "Healthcare", "seed": 114},
    {"ticker": "NTPC", "company": "NTPC Ltd", "sector": "Utilities", "seed": 115},
    {"ticker": "TITAN", "company": "Titan Company", "sector": "Consumer", "seed": 116},
    {"ticker": "ADANIPORTS", "company": "Adani Ports", "sector": "Industrials", "seed": 117},
    {"ticker": "CIPLA", "company": "Cipla Ltd", "sector": "Healthcare", "seed": 118},
    {"ticker": "ULTRACEMCO", "company": "UltraTech Cement", "sector": "Materials", "seed": 119},
    {"ticker": "ASIANPAINT", "company": "Asian Paints", "sector": "Consumer", "seed": 120},
]

_EPS_BASES = {
    "INFY": (18.4, 2.1), "TCS": (29.2, 1.8), "HDFCBANK": (44.2, 3.2),
    "RELIANCE": (24.6, 2.8), "ICICIBANK": (18.8, 2.4), "WIPRO": (6.2, 0.9),
    "LT": (31.4, 3.1), "SBIN": (7.4, 1.2), "BHARTIARTL": (4.8, 0.7),
    "ITC": (9.2, 0.8), "AXISBANK": (14.2, 1.6), "MARUTI": (84.6, 6.2),
    "TATAMOTORS": (8.4, 1.4), "SUNPHARMA": (22.1, 2.0), "NTPC": (4.1, 0.5),
    "TITAN": (12.8, 1.1), "ADANIPORTS": (11.2, 1.3), "CIPLA": (14.6, 1.4),
    "ULTRACEMCO": (42.1, 4.2), "ASIANPAINT": (18.4, 1.9),
}


def _make_earnings(item: dict, offset_days: int) -> dict:
    rng = random.Random(item["seed"] + offset_days)
    ticker = item["ticker"]
    eps_base, eps_std = _EPS_BASES.get(ticker, (10.0, 1.0))
    eps_estimate = round(eps_base + rng.gauss(0, eps_std * 0.3), 2)
    eps_prev = round(eps_base * rng.uniform(0.88, 0.98), 2)
    rev_estimate = round(eps_estimate * rng.uniform(80, 140), 0)
    iv_rank = round(rng.uniform(42, 88), 1)
    implied_move = round(rng.uniform(2.8, 7.4), 1)

    # Historical post-earnings moves for last 8 quarters
    hist_moves = [round(rng.gauss(0, implied_move * 0.6), 2) for _ in range(8)]

    date = (datetime.now() + timedelta(days=offset_days)).strftime("%Y-%m-%d")
    time_str = rng.choice(["09:15", "11:30", "14:00", "15:30", "After Market"])

    return {
        "ticker": ticker,
        "company": item["company"],
        "sector": item["sector"],
        "date": date,
        "time": time_str,
        "eps_estimate": eps_estimate,
        "eps_prev": eps_prev,
        "eps_surprise_prev": round(rng.uniform(-8, 12), 1),
        "revenue_estimate_cr": rev_estimate,
        "iv_rank": iv_rank,
        "implied_move_pct": implied_move,
        "avg_post_move_pct": round(sum(abs(m) for m in hist_moves) / len(hist_moves), 2),
        "historical_moves": hist_moves,
        "consensus": rng.choice(["BEAT", "BEAT", "IN-LINE", "MISS"]),
        "analyst_count": rng.randint(8, 32),
        "days_to_earnings": offset_days,
    }


def _generate_calendar() -> list[dict]:
    events = []
    offsets = [1, 2, 3, 4, 5, 7, 8, 9, 10, 12, 14, 15, 16, 18, 19, 21, 22, 24, 26, 28]
    for item, offset in zip(_SEED, offsets):
        events.append(_make_earnings(item, offset))
    return sorted(events, key=lambda x: x["date"])


@router.get("/earnings-calendar")
async def earnings_calendar(days: int = 30, sector: str | None = None):
    """
    Returns upcoming earnings events for the next `days` days.
    Filtered by sector if provided. DEMO mode uses deterministic mock data.
    """
    events = _generate_calendar()
    if sector and sector.lower() != "all":
        events = [e for e in events if e["sector"].lower() == sector.lower()]
    cutoff = (datetime.now() + timedelta(days=days)).strftime("%Y-%m-%d")
    events = [e for e in events if e["date"] <= cutoff]
    return {"status": "success", "count": len(events), "data": events}

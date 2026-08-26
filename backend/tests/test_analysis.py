import pytest
import pandas as pd
import numpy as np
from app.analysis import analyze_portfolio, AnalysisInputError

def test_analyze_portfolio_empty_holdings():
    with pytest.raises(AnalysisInputError, match="At least one holding is required."):
        analyze_portfolio(holdings=[], prices=[])

def test_analyze_portfolio_success():
    # Simple portfolio
    holdings = [
        {"ticker": "AAPL", "sector": "Technology", "quantity": 10, "average_cost": 150.0},
        {"ticker": "MSFT", "sector": "Technology", "quantity": 5, "average_cost": 250.0}
    ]
    
    prices = [
        {"ticker": "AAPL", "date": "2023-01-01", "close": 150.0},
        {"ticker": "MSFT", "date": "2023-01-01", "close": 250.0},
        {"ticker": "AAPL", "date": "2023-01-02", "close": 155.0},
        {"ticker": "MSFT", "date": "2023-01-02", "close": 260.0},
    ]
    
    res = analyze_portfolio(holdings, prices)
    
    assert "summary" in res
    assert "performance" in res
    assert "risk" in res
    
    # 10*155 + 5*260 = 1550 + 1300 = 2850
    assert res["summary"]["market_value"] == 2850.0
    
    # Cost = 10*150 + 5*250 = 1500 + 1250 = 2750
    assert res["summary"]["cost_basis"] == 2750.0
    
    # Unrealized = 100
    assert res["summary"]["unrealized_pnl"] == 100.0

def test_analyze_portfolio_missing_prices():
    holdings = [
        {"ticker": "AAPL", "sector": "Technology", "quantity": 10, "average_cost": 150.0},
        {"ticker": "GOOG", "sector": "Technology", "quantity": 5, "average_cost": 250.0}
    ]
    
    prices = [
        {"ticker": "AAPL", "date": "2023-01-01", "close": 150.0},
        {"ticker": "AAPL", "date": "2023-01-02", "close": 155.0},
    ]
    
    with pytest.raises(AnalysisInputError, match="Missing price history for tickers: {'GOOG'}"):
        analyze_portfolio(holdings, prices)

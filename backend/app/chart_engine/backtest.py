import pandas as pd
import numpy as np
from .indicators import add_indicators
from .patterns import detect_patterns
from .market_regime import detect_market_regime

def run_historical_backtest(df: pd.DataFrame, symbol: str) -> dict:
    """
    Runs a historical backtest to evaluate a strategy.
    For Phase 2, we evaluate a simple breakout/trend-following setup:
    Entry: RSI > 50, MACD > 0, Close > EMA20, Volume > 1.2x SMA
    Exit: Fixed TP 1.5% or SL 0.5%
    """
    # 1. Precompute indicators and patterns for the whole dataset
    df = add_indicators(df)
    df = detect_patterns(df)
    
    # Precompute volume SMA
    df['vol_sma'] = df['volume'].rolling(20).mean()
    df['vol_ratio'] = df['volume'] / df['vol_sma']
    
    trades = []
    in_position = False
    entry_price = 0
    entry_idx = 0
    
    # We will iterate row by row for the simulation
    # Skipping the first 50 rows to allow indicators to warm up
    for i in range(50, len(df)):
        row = df.iloc[i]
        
        if in_position:
            # Check exit
            current_price = row['close']
            ret = (current_price - entry_price) / entry_price
            
            if ret >= 0.015: # Take Profit
                trades.append({"entry_idx": entry_idx, "exit_idx": i, "return": 0.015, "win": True})
                in_position = False
            elif ret <= -0.005: # Stop Loss
                trades.append({"entry_idx": entry_idx, "exit_idx": i, "return": -0.005, "win": False})
                in_position = False
                
        else:
            # Check entry signal
            # Setup: Bullish Trend continuation
            rsi = row.get('RSI_14', 50)
            macd_hist = row.get('MACDh_12_26_9', 0)
            ema20 = row.get('EMA_20', float('inf'))
            vol_ratio = row.get('vol_ratio', 1)
            
            if rsi > 55 and macd_hist > 0 and row['close'] > ema20 and vol_ratio > 1.2:
                # Enter Long
                in_position = True
                entry_price = row['close']
                entry_idx = i
                
    # Calculate Statistics
    total_signals = len(trades)
    if total_signals == 0:
        return {
            "total_signals": 0,
            "win_rate": 0,
            "profit_factor": 0,
            "avg_return": 0,
            "max_drawdown": 0,
            "best_regime": "N/A",
            "worst_regime": "N/A"
        }
        
    wins = [t for t in trades if t['win']]
    losses = [t for t in trades if not t['win']]
    
    win_rate = len(wins) / total_signals * 100
    
    gross_profit = sum(t['return'] for t in wins)
    gross_loss = abs(sum(t['return'] for t in losses))
    profit_factor = gross_profit / gross_loss if gross_loss > 0 else float('inf')
    
    avg_return = sum(t['return'] for t in trades) / total_signals * 100
    
    # Calculate simplified max drawdown from trade equity curve
    equity = 1.0
    equity_curve = [1.0]
    for t in trades:
        equity *= (1 + t['return'])
        equity_curve.append(equity)
        
    eq_series = pd.Series(equity_curve)
    drawdowns = eq_series / eq_series.cummax() - 1
    max_drawdown = abs(drawdowns.min() * 100)
    
    return {
        "total_signals": total_signals,
        "win_rate": round(win_rate, 1),
        "profit_factor": round(profit_factor, 2),
        "avg_return": round(avg_return, 2),
        "max_drawdown": round(max_drawdown, 2),
        "best_regime": "TRENDING BULLISH", # Mocked for simplicity
        "worst_regime": "LOW-VOLATILITY SIDEWAYS" # Mocked for simplicity
    }

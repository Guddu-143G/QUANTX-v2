import numpy as np
import pandas as pd
from typing import Any

TRADING_DAYS = 252

class AnalysisInputError(ValueError):
    pass

def analyze_portfolio(
    holdings: list[dict], prices: list[dict], benchmark_ticker: str | None = None,
    risk_free_rate: float = 0.06, max_position_weight: float = 0.12, max_sector_weight: float = 0.30,
) -> dict[str, Any]:
    
    if not holdings:
        raise AnalysisInputError("At least one holding is required.")
        
    df_prices = pd.DataFrame(prices)
    df_prices['date'] = pd.to_datetime(df_prices['date'])
    df_prices['close'] = df_prices['close'].astype(float)
    
    # Pivot prices to have dates as index and tickers as columns
    price_matrix = df_prices.pivot(index='date', columns='ticker', values='close').sort_index()
    price_matrix.ffill(inplace=True) # Forward fill missing prices
    price_matrix.dropna(inplace=True) # Drop rows that still have NaNs
    
    if len(price_matrix) < 2:
        raise AnalysisInputError("Insufficient price history. At least 2 common days required.")

    # Convert holdings to DataFrame
    df_holdings = pd.DataFrame(holdings)
    df_holdings['quantity'] = df_holdings['quantity'].astype(float)
    df_holdings['average_cost'] = df_holdings['average_cost'].astype(float)
    
    # Ensure all holding tickers are in the price matrix
    missing_tickers = set(df_holdings['ticker']) - set(price_matrix.columns)
    if missing_tickers:
        raise AnalysisInputError(f"Missing price history for tickers: {missing_tickers}")

    # Latest prices
    latest_prices = price_matrix.iloc[-1]
    
    # Portfolio Valuation
    df_holdings['last_price'] = df_holdings['ticker'].map(latest_prices)
    df_holdings['market_value'] = df_holdings['quantity'] * df_holdings['last_price']
    df_holdings['cost_basis'] = df_holdings['quantity'] * df_holdings['average_cost']
    df_holdings['unrealized_pnl'] = df_holdings['market_value'] - df_holdings['cost_basis']
    
    total_value = df_holdings['market_value'].sum()
    if total_value <= 0:
        raise AnalysisInputError("Portfolio market value must be greater than zero.")
        
    df_holdings['weight'] = df_holdings['market_value'] / total_value
    df_holdings['unrealized_return'] = np.where(df_holdings['cost_basis'] > 0, df_holdings['unrealized_pnl'] / df_holdings['cost_basis'], 0)
    
    # Daily Returns
    daily_returns = price_matrix.pct_change().dropna()
    
    # Portfolio Returns
    portfolio_daily_returns = daily_returns[df_holdings['ticker']].dot(df_holdings.set_index('ticker')['weight'])
    
    # Metrics
    obs = len(portfolio_daily_returns)
    ann_return = (1 + portfolio_daily_returns).prod() ** (TRADING_DAYS / obs) - 1 if obs > 0 else 0
    volatility = portfolio_daily_returns.std() * np.sqrt(TRADING_DAYS)
    
    downside_returns = portfolio_daily_returns[portfolio_daily_returns < 0]
    downside_dev = downside_returns.std() * np.sqrt(TRADING_DAYS) if len(downside_returns) > 0 else 0
    
    sharpe = (ann_return - risk_free_rate) / volatility if volatility > 0 else 0
    sortino = (ann_return - risk_free_rate) / downside_dev if downside_dev > 0 else 0
    
    # Drawdown
    cumulative = (1 + portfolio_daily_returns).cumprod()
    running_max = cumulative.cummax()
    drawdown = (cumulative - running_max) / running_max
    max_dd = drawdown.min()
    
    # VaR / CVaR
    losses = -portfolio_daily_returns
    var95 = np.percentile(losses, 95) if len(losses) > 0 else 0
    cvar95 = losses[losses >= var95].mean() if len(losses[losses >= var95]) > 0 else var95
    
    # HHI & Concentration
    hhi = (df_holdings['weight'] ** 2).sum()
    effective_names = 1 / hhi if hhi > 0 else 0
    sector_weights = df_holdings.groupby('sector')['weight'].sum().to_dict()
    
    # Benchmark
    benchmark = benchmark_ticker.upper().strip() if benchmark_ticker else None
    beta = information_ratio = tracking_error = active_return = correlation_to_benchmark = None
    
    if benchmark and benchmark in price_matrix.columns:
        bench_returns = daily_returns[benchmark]
        cov_matrix = np.cov(portfolio_daily_returns, bench_returns)
        variance = np.var(bench_returns, ddof=1)
        beta = cov_matrix[0, 1] / variance if variance > 0 else 0
        
        active_returns = portfolio_daily_returns - bench_returns
        te = active_returns.std() * np.sqrt(TRADING_DAYS)
        information_ratio = (active_returns.mean() * TRADING_DAYS) / te if te > 0 else 0
        tracking_error = te
        
        bench_ann_return = (1 + bench_returns).prod() ** (TRADING_DAYS / obs) - 1
        active_return = ann_return - bench_ann_return
        correlation_to_benchmark = np.corrcoef(portfolio_daily_returns, bench_returns)[0, 1]
    
    # Position Level Stats
    position_rows = []
    for _, row in df_holdings.iterrows():
        ticker = row['ticker']
        ticker_rets = daily_returns[ticker]
        pos_vol = ticker_rets.std() * np.sqrt(TRADING_DAYS)
        
        # Marginal Risk Contribution
        cov = np.cov(ticker_rets, portfolio_daily_returns)[0, 1]
        port_var = portfolio_daily_returns.var(ddof=1)
        marginal_risk = cov / port_var if port_var > 0 else 0
        
        position_rows.append({
            "ticker": ticker,
            "sector": row['sector'],
            "quantity": row['quantity'],
            "average_cost": round(row['average_cost'], 6),
            "last_price": round(row['last_price'], 6),
            "as_of": str(price_matrix.index[-1].date()),
            "market_value": round(row['market_value'], 6),
            "weight": round(row['weight'], 6),
            "unrealized_pnl": round(row['unrealized_pnl'], 6),
            "unrealized_return": round(row['unrealized_return'], 6),
            "annualized_volatility": round(pos_vol, 6),
            "history_observations": obs,
            "marginal_risk_contribution": round(marginal_risk * row['weight'], 6)
        })
        
    position_rows.sort(key=lambda x: x['weight'], reverse=True)
    
    grade = "A" if sharpe > 1.5 else "B" if sharpe > 1.0 else "C" if sharpe > 0.5 else "D"
    
    return {
        "disclaimer": "Quantitative decision-support analysis based only on the uploaded CSV data.",
        "data_quality": {
            "mode": "user_csv",
            "portfolio_dates": obs,
            "first_date": str(price_matrix.index[0].date()),
            "last_date": str(price_matrix.index[-1].date()),
            "warnings": [],
            "source_rows": {"holdings": len(holdings), "prices": len(prices)},
            "latest_price_dates": [str(price_matrix.index[-1].date())],
            "excluded_price_rows": {}
        },
        "summary": {
            "market_value": round(total_value, 6),
            "cost_basis": round(df_holdings['cost_basis'].sum(), 6),
            "unrealized_pnl": round(df_holdings['unrealized_pnl'].sum(), 6),
            "research_grade": grade,
            "research_score": 85 # Placeholder
        },
        "performance": {
            "annualized_return": round(ann_return, 6),
            "annualized_volatility": round(volatility, 6),
            "sharpe_ratio": round(sharpe, 6),
            "sortino_ratio": round(sortino, 6),
            "calmar_ratio": round(ann_return / abs(max_dd), 6) if max_dd != 0 else None,
            "max_drawdown": round(max_dd, 6),
            "observations": obs
        },
        "risk": {
            "historical_var_95_1d": round(var95, 6),
            "historical_cvar_95_1d": round(cvar95, 6),
            "var_95_currency": round(var95 * total_value, 6),
            "cvar_95_currency": round(cvar95 * total_value, 6),
            "beta": round(beta, 6) if beta is not None else None,
            "information_ratio": round(information_ratio, 6) if information_ratio is not None else None,
            "tracking_error": round(tracking_error, 6) if tracking_error is not None else None,
            "active_return": round(active_return, 6) if active_return is not None else None,
            "benchmark_correlation": round(correlation_to_benchmark, 6) if correlation_to_benchmark is not None else None
        },
        "concentration": {
            "hhi": round(hhi, 6),
            "effective_number_of_positions": round(effective_names, 6),
            "largest_position_weight": round(df_holdings['weight'].max(), 6),
            "sector_weights": [{"sector": k, "weight": round(v, 6)} for k, v in sorted(sector_weights.items(), key=lambda x: x[1], reverse=True)]
        },
        "positions": position_rows,
        "findings": [],
        "proposed_allocation": {
            "method": "risk-adjusted return score",
            "constraints": {"max_position_weight": max_position_weight, "max_sector_weight": max_sector_weight},
            "weights": [] # Placeholder for now, handled by separate Allocation Engine
        },
    }

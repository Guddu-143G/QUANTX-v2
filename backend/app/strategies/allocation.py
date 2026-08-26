import numpy as np
import pandas as pd
from scipy.optimize import minimize
from typing import List, Dict

class AllocationEngine:
    
    @staticmethod
    def _get_returns_matrix(prices_df: pd.DataFrame) -> pd.DataFrame:
        """Helper to get daily returns from a price DataFrame."""
        return prices_df.pivot(index='date', columns='ticker', values='close').sort_index().pct_change().dropna()

    @staticmethod
    def equal_weight(tickers: List[str]) -> Dict[str, float]:
        weight = 1.0 / len(tickers)
        return {ticker: weight for ticker in tickers}

    @staticmethod
    def minimum_variance(prices_df: pd.DataFrame, max_weight: float = 0.15) -> Dict[str, float]:
        returns = AllocationEngine._get_returns_matrix(prices_df)
        cov_matrix = returns.cov().values * 252
        num_assets = len(returns.columns)
        
        def portfolio_variance(weights):
            return weights.T @ cov_matrix @ weights
            
        constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1.0})
        bounds = tuple((0.0, max_weight) for _ in range(num_assets))
        init_guess = np.array(num_assets * [1.0 / num_assets])
        
        opt_result = minimize(portfolio_variance, init_guess, method='SLSQP', bounds=bounds, constraints=constraints)
        
        return {ticker: float(weight) for ticker, weight in zip(returns.columns, opt_result.x)}

    @staticmethod
    def maximum_diversification(prices_df: pd.DataFrame, max_weight: float = 0.15) -> Dict[str, float]:
        returns = AllocationEngine._get_returns_matrix(prices_df)
        cov_matrix = returns.cov().values * 252
        vols = np.sqrt(np.diag(cov_matrix))
        num_assets = len(returns.columns)
        
        def diversification_ratio(weights):
            port_vol = np.sqrt(weights.T @ cov_matrix @ weights)
            weighted_vols = weights.T @ vols
            return -weighted_vols / port_vol # Minimize negative ratio
            
        constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1.0})
        bounds = tuple((0.0, max_weight) for _ in range(num_assets))
        init_guess = np.array(num_assets * [1.0 / num_assets])
        
        opt_result = minimize(diversification_ratio, init_guess, method='SLSQP', bounds=bounds, constraints=constraints)
        
        return {ticker: float(weight) for ticker, weight in zip(returns.columns, opt_result.x)}

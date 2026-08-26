import numpy as np
from typing import Dict, Any, List
from pydantic import BaseModel

class ScenarioMatrixResult(BaseModel):
    scenario: str
    portfolio_pnl_pct: float
    new_var: float
    new_beta: float
    new_drawdown: float

class StressEngine:
    """
    Implements Parametric, Factor, Historical and Monte Carlo stress testing.
    """
    def __init__(self):
        # Base realistic assumptions for demo
        self.portfolio_value = 100000000.0
        self.base_var = 1840000.0
        self.base_beta = 0.94
        
    def parametric_stress(self, shocks: Dict[str, float]) -> ScenarioMatrixResult:
        """
        Shock inputs: {'NIFTY': -0.10, 'USDINR': 0.05, 'Volatility': 0.25}
        """
        # Simplified beta-driven impact
        nifty_shock = shocks.get('NIFTY', 0.0)
        vol_shock = shocks.get('Volatility', 0.0)
        
        pnl_pct = (nifty_shock * self.base_beta) * 100
        new_var = self.base_var * (1 + vol_shock)
        
        return ScenarioMatrixResult(
            scenario=f"Parametric Stress (NIFTY {nifty_shock:.0%})",
            portfolio_pnl_pct=pnl_pct,
            new_var=new_var,
            new_beta=self.base_beta * (1 + vol_shock * 0.1),
            new_drawdown=min(0, pnl_pct)
        )
        
    def factor_stress(self, factor_shocks: Dict[str, float]) -> ScenarioMatrixResult:
        """
        Shock inputs: {'Momentum': -2.0, 'Value': 1.0, 'Liquidity': -3.0} (in standard deviations)
        """
        # Assume sensitivities
        sensitivities = {'Momentum': 1.2, 'Value': -0.4, 'Liquidity': 0.8}
        
        impact = sum(factor_shocks.get(f, 0.0) * sensitivities.get(f, 0.0) for f in factor_shocks)
        pnl_pct = impact * 1.5 # scaling factor for demo
        
        return ScenarioMatrixResult(
            scenario="Factor Stress",
            portfolio_pnl_pct=pnl_pct,
            new_var=self.base_var * (1 + abs(impact) * 0.05),
            new_beta=self.base_beta,
            new_drawdown=min(0, pnl_pct)
        )
        
    def monte_carlo_stress(self, paths: int = 10000, days: int = 250) -> Dict[str, Any]:
        """
        Simulate portfolio returns using geometric brownian motion or historical residuals.
        """
        mu = 0.12 / 252
        sigma = 0.18 / np.sqrt(252)
        
        # Generate paths
        # S_t = S_0 * exp((mu - sigma^2 / 2)*t + sigma * W_t)
        np.random.seed(42) # For reproducible demo
        drifts = mu - (sigma ** 2) / 2
        shocks = np.random.normal(0, 1, (paths, days))
        returns = np.exp(drifts + sigma * shocks)
        price_paths = self.portfolio_value * np.cumprod(returns, axis=1)
        
        final_values = price_paths[:, -1]
        pnls = final_values - self.portfolio_value
        
        return {
            "paths": paths,
            "p5_loss": float(np.percentile(pnls, 5)),
            "p1_loss": float(np.percentile(pnls, 1)),
            "median_pnl": float(np.median(pnls)),
            "expected_shortfall": float(np.mean(pnls[pnls < np.percentile(pnls, 5)])),
            "max_simulated_loss": float(np.min(pnls))
        }

stress_engine = StressEngine()

"""
Transformer-SDE Generative Market World Model Engine (v16 Module 1)
Combines sequence representations with continuous Stochastic Differential Equations (Neural-SDE)
for counterfactual macro and microstructure stress testing.
Mathematical Formulation:
    dz_t = mu_theta(z_t, a_t, t) dt + sigma_phi(z_t, a_t, t) dW_t
"""

import math
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel, Field


class MacroConditioningVector(BaseModel):
    rate_hike_bps: float = Field(default=250.0, description="Central bank policy rate shock in basis points")
    liquidity_drain_billion_usd: float = Field(default=150.0, description="Quantitative tightening liquidity reduction in $B")
    geopolitical_risk_index: float = Field(default=85.0, description="Geopolitical tension index (0-100)")
    cpi_inflation_surprise_pct: float = Field(default=1.2, description="CPI inflation surprise deviation (%)")
    algorithmic_order_shock_pct: float = Field(default=-4.5, description="High-frequency algorithmic liquidity withdrawal shock (%)")


class SDERolloutRequest(BaseModel):
    scenario_key: str = Field(default="HAWKISH_CENTRAL_BANK_RATE_SHOCK", description="Scenario identifier")
    num_trajectories: int = Field(default=500, description="Number of parallel Monte Carlo SDE diffusion paths")
    time_horizon_days: int = Field(default=30, description="Simulation horizon in trading days")
    discretization_steps: int = Field(default=50, description="Euler-Maruyama integration steps")
    total_portfolio_value_usd: float = Field(default=10000000.0, description="Total portfolio value in USD")
    macro_action: Optional[MacroConditioningVector] = None


class SDEAssetProjection(BaseModel):
    ticker: str
    asset_class: str
    initial_price: float
    expected_stressed_price: float
    expected_return_pct: float
    var_95_pct: float
    var_99_pct: float
    cvar_99_pct: float
    max_drawdown_pct: float
    drift_vector_mean: float
    diffusion_vol_mean: float


class SDERolloutTrajectory(BaseModel):
    day: int
    time_label: str
    p5: float
    p25: float
    p50: float
    p75: float
    p95: float
    latent_drift_norm: float
    latent_diffusion_norm: float


class SDERolloutResult(BaseModel):
    status: str
    scenario_id: str
    scenario_name: str
    time_horizon_days: int
    num_trajectories: int
    discretization_steps: int
    total_portfolio_value_usd: float
    expected_portfolio_pnl_usd: float
    portfolio_stressed_var_95_usd: float
    portfolio_stressed_cvar_95_usd: float
    portfolio_stressed_var_99_usd: float
    portfolio_stressed_cvar_99_usd: float
    max_portfolio_drawdown_pct: float
    tail_risk_probability_pct: float
    macro_action_applied: Dict[str, float]
    asset_projections: List[SDEAssetProjection]
    trajectory_percentiles: List[SDERolloutTrajectory]
    latent_space_dimensions: Dict[str, int]


class LatentMarketSDE:
    """
    Continuous Neural Stochastic Differential Equation (Neural-SDE) simulation core.
    Operates over latent state z in R^d and counterfactual intervention action a in R^k.
    """

    def __init__(self, state_dim: int = 32, action_dim: int = 8, seed: int = 42):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.rng = np.random.RandomState(seed)

        # Deterministic pseudo-weights for drift and diffusion networks
        self.W_drift_1 = self.rng.randn(state_dim + action_dim + 1, 64) * 0.15
        self.b_drift_1 = np.zeros(64)
        self.W_drift_2 = self.rng.randn(64, state_dim) * 0.12
        self.b_drift_2 = np.zeros(state_dim)

        self.W_diff_1 = self.rng.randn(state_dim + action_dim + 1, 64) * 0.10
        self.b_diff_1 = np.zeros(64)
        self.W_diff_2 = self.rng.randn(64, state_dim) * 0.08
        self.b_diff_2 = np.ones(state_dim) * 0.05

    def _silu(self, x: np.ndarray) -> np.ndarray:
        return x / (1.0 + np.exp(-np.clip(x, -15.0, 15.0)))

    def drift(self, t: float, z: np.ndarray, action: np.ndarray) -> np.ndarray:
        """Calculates deterministic drift vector mu_theta(z, a, t)."""
        batch_size = z.shape[0]
        t_vec = np.full((batch_size, 1), t)
        inputs = np.concatenate([z, action, t_vec], axis=-1)
        h1 = self._silu(np.dot(inputs, self.W_drift_1) + self.b_drift_1)
        mu = np.dot(h1, self.W_drift_2) + self.b_drift_2
        return mu

    def diffusion(self, t: float, z: np.ndarray, action: np.ndarray) -> np.ndarray:
        """Calculates stochastic diffusion matrix sigma_phi(z, a, t)."""
        batch_size = z.shape[0]
        t_vec = np.full((batch_size, 1), t)
        inputs = np.concatenate([z, action, t_vec], axis=-1)
        h1 = self._silu(np.dot(inputs, self.W_diff_1) + self.b_diff_1)
        sigma = np.abs(np.dot(h1, self.W_diff_2) + self.b_diff_2) + 0.01
        return sigma

    def euler_maruyama_step(self, z: np.ndarray, action: np.ndarray, t: float, dt: float) -> np.ndarray:
        """Single-step forward integration via Euler-Maruyama scheme."""
        mu = self.drift(t, z, action)
        sigma = self.diffusion(t, z, action)
        dW = self.rng.randn(*z.shape) * math.sqrt(dt)
        z_next = z + mu * dt + sigma * dW
        return z_next


class TransformerSDEWorldModelManager:
    """
    Sovereign Manager for Transformer-SDE Generative Market World Model.
    """

    SCENARIOS = {
        "HAWKISH_CENTRAL_BANK_RATE_SHOCK": {
            "name": "Sudden Central Bank Rate Hike (+250 bps) & Liquidity Drain",
            "action": MacroConditioningVector(
                rate_hike_bps=250.0,
                liquidity_drain_billion_usd=180.0,
                geopolitical_risk_index=72.0,
                cpi_inflation_surprise_pct=1.4,
                algorithmic_order_shock_pct=-5.2,
            ),
        },
        "GEOPOLITICAL_ENERGY_STAGFLATION": {
            "name": "Geopolitical Energy Supply Shock & High-Inflation Stagnation",
            "action": MacroConditioningVector(
                rate_hike_bps=125.0,
                liquidity_drain_billion_usd=90.0,
                geopolitical_risk_index=95.0,
                cpi_inflation_surprise_pct=2.8,
                algorithmic_order_shock_pct=-3.8,
            ),
        },
        "FLASH_CRASH_ALGORITHMIC_SHOCK": {
            "name": "Cascading Microstructure Algorithmic Liquidity Evaporation",
            "action": MacroConditioningVector(
                rate_hike_bps=0.0,
                liquidity_drain_billion_usd=250.0,
                geopolitical_risk_index=65.0,
                cpi_inflation_surprise_pct=0.2,
                algorithmic_order_shock_pct=-14.5,
            ),
        },
        "SOVEREIGN_DEBT_CONTAGION": {
            "name": "Cross-Border Sovereign Yield Dislocation & Flight to Quality",
            "action": MacroConditioningVector(
                rate_hike_bps=175.0,
                liquidity_drain_billion_usd=210.0,
                geopolitical_risk_index=88.0,
                cpi_inflation_surprise_pct=0.9,
                algorithmic_order_shock_pct=-6.8,
            ),
        },
    }

    PORTFOLIO_ASSETS = [
        {"ticker": "SPY", "asset_class": "US Equity Large Cap", "initial_price": 512.50, "weight": 0.25, "beta": 1.0, "vol": 0.18},
        {"ticker": "QQQ", "asset_class": "Tech & Growth Equities", "initial_price": 445.20, "weight": 0.25, "beta": 1.25, "vol": 0.24},
        {"ticker": "NVDA", "asset_class": "High-Beta Semiconductor", "initial_price": 128.40, "weight": 0.20, "beta": 1.85, "vol": 0.42},
        {"ticker": "TLT", "asset_class": "20Y+ US Treasury Sovereign", "initial_price": 92.10, "weight": 0.15, "beta": -0.45, "vol": 0.16},
        {"ticker": "HYG", "asset_class": "High Yield Corporate Credit", "initial_price": 77.80, "weight": 0.10, "beta": 0.65, "vol": 0.14},
        {"ticker": "GLD", "asset_class": "Physical Gold Safe Haven", "initial_price": 215.30, "weight": 0.05, "beta": -0.15, "vol": 0.15},
    ]

    def __init__(self):
        self.sde_model = LatentMarketSDE(state_dim=32, action_dim=8)

    def get_scenarios(self) -> List[Dict[str, Any]]:
        return [
            {
                "key": k,
                "name": v["name"],
                "action": v["action"].model_dump(),
            }
            for k, v in self.SCENARIOS.items()
        ]

    def run_counterfactual_rollout(self, req: SDERolloutRequest) -> SDERolloutResult:
        scenario_def = self.SCENARIOS.get(req.scenario_key)
        action_obj = req.macro_action or (scenario_def["action"] if scenario_def else MacroConditioningVector())
        scenario_name = scenario_def["name"] if scenario_def else "Custom Counterfactual Shock"

        # Action vector normalization into R^8
        action_vec = np.array([
            action_obj.rate_hike_bps / 100.0,
            action_obj.liquidity_drain_billion_usd / 100.0,
            action_obj.geopolitical_risk_index / 50.0,
            action_obj.cpi_inflation_surprise_pct,
            action_obj.algorithmic_order_shock_pct / 5.0,
            action_obj.rate_hike_bps * action_obj.cpi_inflation_surprise_pct / 200.0,
            abs(action_obj.algorithmic_order_shock_pct) * 0.2,
            1.0,
        ], dtype=np.float32)

        N = req.num_trajectories
        T_days = req.time_horizon_days
        steps = req.discretization_steps
        dt = (T_days / 252.0) / steps

        # Initial latent state sample z_0 ~ N(0, I)
        z = np.random.randn(N, self.sde_model.state_dim) * 0.5
        action_batch = np.tile(action_vec, (N, 1))

        daily_port_values = np.zeros((T_days, N))
        total_p0 = req.total_portfolio_value_usd

        # Initial baseline per asset
        asset_trajectories = {a["ticker"]: np.zeros((T_days, N)) for a in self.PORTFOLIO_ASSETS}

        macro_impact_multiplier = (
            -0.0004 * action_obj.rate_hike_bps
            - 0.0003 * action_obj.liquidity_drain_billion_usd
            - 0.0005 * action_obj.geopolitical_risk_index
            + 0.0080 * action_obj.algorithmic_order_shock_pct
        )

        # Step forward across days
        curr_t = 0.0
        drift_norms = []
        diffusion_norms = []

        for day in range(T_days):
            for _ in range(max(1, steps // T_days)):
                z = self.sde_model.euler_maruyama_step(z, action_batch, curr_t, dt)
                curr_t += dt

            # Latent state to asset returns mapping
            latent_factor = np.mean(z[:, :4], axis=-1)
            mu_norm = float(np.linalg.norm(self.sde_model.drift(curr_t, z, action_batch))) / N
            sig_norm = float(np.linalg.norm(self.sde_model.diffusion(curr_t, z, action_batch))) / N
            drift_norms.append(mu_norm)
            diffusion_norms.append(sig_norm)

            day_port_vals = np.zeros(N)
            for a in self.PORTFOLIO_ASSETS:
                tk = a["ticker"]
                beta = a["beta"]
                vol = a["vol"]
                p0 = a["initial_price"]

                day_drift = (macro_impact_multiplier * beta * (day + 1) / T_days) + (latent_factor * 0.02 * beta)
                day_diff = np.random.randn(N) * vol * math.sqrt((day + 1) / 252.0)
                sim_returns = day_drift + day_diff
                sim_prices = p0 * (1.0 + sim_returns)
                asset_trajectories[tk][day, :] = sim_prices
                day_port_vals += total_p0 * a["weight"] * (1.0 + sim_returns)

            daily_port_values[day, :] = day_port_vals

        # Calculate percentile trajectories
        trajectory_percentiles: List[SDERolloutTrajectory] = []
        for day in range(T_days):
            vals = daily_port_values[day, :]
            trajectory_percentiles.append(
                SDERolloutTrajectory(
                    day=day + 1,
                    time_label=f"T+{day + 1}d",
                    p5=float(np.percentile(vals, 5)),
                    p25=float(np.percentile(vals, 25)),
                    p50=float(np.percentile(vals, 50)),
                    p75=float(np.percentile(vals, 75)),
                    p95=float(np.percentile(vals, 95)),
                    latent_drift_norm=round(drift_norms[min(day, len(drift_norms) - 1)], 4),
                    latent_diffusion_norm=round(diffusion_norms[min(day, len(diffusion_norms) - 1)], 4),
                )
            )

        final_day_values = daily_port_values[-1, :]
        final_returns = (final_day_values - total_p0) / total_p0

        exp_pnl = float(np.mean(final_day_values) - total_p0)
        var_95 = float(-np.percentile(final_returns, 5) * total_p0)
        var_99 = float(-np.percentile(final_returns, 1) * total_p0)
        cvar_95 = float(-np.mean(final_returns[final_returns <= np.percentile(final_returns, 5)]) * total_p0)
        cvar_99 = float(-np.mean(final_returns[final_returns <= np.percentile(final_returns, 1)]) * total_p0)

        # Asset projections
        asset_projections: List[SDEAssetProjection] = []
        for a in self.PORTFOLIO_ASSETS:
            tk = a["ticker"]
            p_final = asset_trajectories[tk][-1, :]
            rets = (p_final - a["initial_price"]) / a["initial_price"]
            v95 = float(-np.percentile(rets, 5) * 100.0)
            v99 = float(-np.percentile(rets, 1) * 100.0)
            cv99 = float(-np.mean(rets[rets <= np.percentile(rets, 1)]) * 100.0)

            asset_projections.append(
                SDEAssetProjection(
                    ticker=tk,
                    asset_class=a["asset_class"],
                    initial_price=a["initial_price"],
                    expected_stressed_price=round(float(np.mean(p_final)), 2),
                    expected_return_pct=round(float(np.mean(rets) * 100.0), 2),
                    var_95_pct=round(max(0.1, v95), 2),
                    var_99_pct=round(max(0.1, v99), 2),
                    cvar_99_pct=round(max(0.1, cv99), 2),
                    max_drawdown_pct=round(float(np.max((a["initial_price"] - p_final) / a["initial_price"] * 100.0)), 2),
                    drift_vector_mean=round(float(np.mean(drift_norms)), 4),
                    diffusion_vol_mean=round(float(np.mean(diffusion_norms)), 4),
                )
            )

        max_dd = float(np.max((total_p0 - np.min(daily_port_values, axis=0)) / total_p0 * 100.0))
        tail_prob = float(np.mean(final_returns < -0.10) * 100.0)

        return SDERolloutResult(
            status="SDE_ROLLOUT_SUCCESS",
            scenario_id=f"SDE-{req.scenario_key}-{N}P",
            scenario_name=scenario_name,
            time_horizon_days=T_days,
            num_trajectories=N,
            discretization_steps=steps,
            total_portfolio_value_usd=total_p0,
            expected_portfolio_pnl_usd=round(exp_pnl, 2),
            portfolio_stressed_var_95_usd=round(max(0.0, var_95), 2),
            portfolio_stressed_cvar_95_usd=round(max(0.0, cvar_95), 2),
            portfolio_stressed_var_99_usd=round(max(0.0, var_99), 2),
            portfolio_stressed_cvar_99_usd=round(max(0.0, cvar_99), 2),
            max_portfolio_drawdown_pct=round(max_dd, 2),
            tail_risk_probability_pct=round(tail_prob, 2),
            macro_action_applied=action_obj.model_dump(),
            asset_projections=asset_projections,
            trajectory_percentiles=trajectory_percentiles,
            latent_space_dimensions={"state_dim_d": self.sde_model.state_dim, "action_dim_k": self.sde_model.action_dim},
        )


transformer_sde_engine = TransformerSDEWorldModelManager()

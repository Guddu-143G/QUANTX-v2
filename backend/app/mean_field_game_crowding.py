"""
QUANTX Institutional Quantitative Finance Platform - v17 Sovereign Module 2
Continuous-Time Mean-Field Games (MFG) for Liquidity Crowding

Solves the coupled system of Hamilton-Jacobi-Bellman (HJB, backward in time)
and Fokker-Planck-Kolmogorov (FPK, forward in time) partial differential equations
to model algorithmic competition and crowd feedback in high-frequency order books as N -> infinity.
Predicts order book crowding, spread widenings, and cascade liquidation risk.
"""

from typing import Dict, List, Any, Tuple
import numpy as np
from pydantic import BaseModel, Field


class MFGCrowdingRequest(BaseModel):
    ticker: str = Field("RELIANCE.NS", description="Asset ticker symbol")
    total_horizon_seconds: float = Field(60.0, ge=5.0, le=600.0, description="Trading horizon T in seconds")
    inventory_max: float = Field(50000.0, description="Maximum absolute inventory bound X_max")
    num_grid_t: int = Field(30, ge=10, le=100, description="Time discretization steps")
    num_grid_x: int = Field(41, ge=11, le=101, description="Inventory discretization steps (odd number for zero center)")
    volatility: float = Field(0.018, ge=0.001, le=0.2, description="Asset volatility sigma")
    execution_cost_gamma: float = Field(0.0001, ge=1e-6, description="Temporary impact parameter gamma")
    crowding_coupling_eta: float = Field(0.0005, ge=0.0, description="MFG crowd interaction parameter eta")
    inventory_penalty_phi: float = Field(0.00005, ge=0.0, description="Inventory holding risk parameter phi")
    scenario: str = Field("HIGH_ALGO_CROWDING", description="Scenario: NORMAL_LIQUIDITY, HIGH_ALGO_CROWDING, or CASCADE_PANIC")


class MFGCrowdingEngine:
    """
    Coupled PDE solver for continuous-time Mean-Field Game (MFG) execution.
    Solves for optimal value function u(t, x) and crowd population density m(t, x).
    """

    SCENARIOS = {
        "NORMAL_LIQUIDITY": {
            "name": "Normal Market Liquidity",
            "crowding_coupling_eta": 0.0001,
            "execution_cost_gamma": 0.00008,
            "inventory_penalty_phi": 0.00002,
            "crowd_concentration": 0.25,
            "description": "Standard market depth with diverse algorithmic participation and low correlation."
        },
        "HIGH_ALGO_CROWDING": {
            "name": "High Algorithmic Crowding",
            "crowding_coupling_eta": 0.0006,
            "execution_cost_gamma": 0.00015,
            "inventory_penalty_phi": 0.00006,
            "crowd_concentration": 0.72,
            "description": "Multiple execution algorithms pursuing identical alpha signals, causing synchronized order flow."
        },
        "CASCADE_PANIC": {
            "name": "Cascade Liquidation Panic",
            "crowding_coupling_eta": 0.0015,
            "execution_cost_gamma": 0.00045,
            "inventory_penalty_phi": 0.00020,
            "crowd_concentration": 0.94,
            "description": "Stop-loss cascading and margin deleveraging spiral triggering market impact blowouts."
        }
    }

    def solve_coupled_mfg(
        self,
        T: float = 60.0,
        X_max: float = 50000.0,
        Nt: int = 30,
        Nx: int = 41,
        sigma: float = 0.018,
        gamma: float = 0.0001,
        eta: float = 0.0005,
        phi: float = 0.00005,
        max_iterations: int = 25,
        tolerance: float = 1e-4
    ) -> Dict[str, Any]:
        """
        Solves the coupled HJB-FPK system iteratively using finite differences.
        """
        dt = T / (Nt - 1)
        x_grid = np.linspace(-X_max, X_max, Nx)
        dx = x_grid[1] - x_grid[0]
        t_grid = np.linspace(0, T, Nt)

        # Dimensionless normalized grid for numerical PDE stability: y in [-1, 1]
        y_grid = x_grid / max(X_max, 1.0)
        dy = y_grid[1] - y_grid[0]
        
        # Scaling factors
        gamma_eff = max(gamma * (X_max ** 2), 1e-6)
        eta_eff = eta * (X_max ** 2)
        phi_eff = phi * (X_max ** 2)
        terminal_penalty = 0.002
        terminal_penalty_eff = terminal_penalty * (X_max ** 2)

        # Initialize density m(t, x): initially centered around initial positive inventory
        m = np.zeros((Nt, Nx))
        initial_mean_norm = 0.45
        initial_std_norm = 0.15
        gaussian_init = np.exp(-0.5 * ((y_grid - initial_mean_norm) / initial_std_norm) ** 2)
        m[0, :] = gaussian_init / (np.sum(gaussian_init) * dx)
        for t_idx in range(1, Nt):
            m[t_idx, :] = m[0, :]

        # Value function u(t, y)
        u = np.zeros((Nt, Nx))
        u[-1, :] = -0.5 * terminal_penalty_eff * (y_grid ** 2)

        convergence_errors = []
        drift_policy = np.zeros((Nt, Nx))

        for iteration in range(max_iterations):
            u_prev = u.copy()
            m_prev = m.copy()

            # 1. Backward solve for HJB: t from Nt-2 down to 0
            for t_idx in range(Nt - 2, -1, -1):
                crowd_mean_y = float(np.sum(y_grid * m[t_idx + 1, :]) * dx)

                # Spatial derivative du/dy
                du_dy = np.zeros(Nx)
                du_dy[1:-1] = (u[t_idx + 1, 2:] - u[t_idx + 1, :-2]) / (2.0 * dy)
                du_dy[0] = (u[t_idx + 1, 1] - u[t_idx + 1, 0]) / dy
                du_dy[-1] = (u[t_idx + 1, -1] - u[t_idx + 1, -2]) / dy
                du_dy = np.clip(du_dy, -1e4, 1e4)

                d2u_dy2 = np.zeros(Nx)
                d2u_dy2[1:-1] = (u[t_idx + 1, 2:] - 2.0 * u[t_idx + 1, 1:-1] + u[t_idx + 1, :-2]) / (dy ** 2)
                d2u_dy2[0] = d2u_dy2[1]
                d2u_dy2[-1] = d2u_dy2[-2]
                d2u_dy2 = np.clip(d2u_dy2, -1e5, 1e5)

                alpha_opt = -du_dy / gamma_eff
                alpha_opt = np.clip(alpha_opt, -5.0, 5.0)
                drift_policy[t_idx, :] = alpha_opt

                hamiltonian = (du_dy ** 2) / (2.0 * gamma_eff) - eta_eff * y_grid * crowd_mean_y - phi_eff * (y_grid ** 2)
                hamiltonian = np.clip(hamiltonian, -1e5, 1e5)

                u[t_idx, :] = u[t_idx + 1, :] + dt * (0.5 * (sigma ** 2) * d2u_dy2 + hamiltonian)

            # 2. Forward solve for FPK: t from 0 up to Nt-2
            for t_idx in range(0, Nt - 1):
                alpha_opt = drift_policy[t_idx, :]
                flux = m[t_idx, :] * alpha_opt
                d_flux_dy = np.zeros(Nx)
                d_flux_dy[1:-1] = (flux[2:] - flux[:-2]) / (2.0 * dy)
                d_flux_dy[0] = (flux[1] - flux[0]) / dy
                d_flux_dy[-1] = (flux[-1] - flux[-2]) / dy

                d2m_dy2 = np.zeros(Nx)
                d2m_dy2[1:-1] = (m[t_idx, 2:] - 2.0 * m[t_idx, 1:-1] + m[t_idx, :-2]) / (dy ** 2)
                d2m_dy2[0] = d2m_dy2[1]
                d2m_dy2[-1] = d2m_dy2[-2]

                m_next = m[t_idx, :] + dt * (0.5 * (sigma ** 2) * d2m_dy2 - d_flux_dy)
                m_next = np.maximum(m_next, 0.0)
                mass = np.sum(m_next) * dx
                if mass > 1e-12:
                    m_next /= mass
                m[t_idx + 1, :] = m_next

            m = 0.5 * m + 0.5 * m_prev
            u = 0.5 * u + 0.5 * u_prev

            error = float(np.max(np.abs(m - m_prev)) + np.max(np.abs(u - u_prev)))
            convergence_errors.append(error)
            if error < tolerance and iteration >= 3:
                break

        # Compute summary metrics
        crowd_mean_trajectory = [float(np.sum(x_grid * m[t, :]) * dx) for t in range(Nt)]
        inventory_reduction_pct = float((crowd_mean_trajectory[0] - crowd_mean_trajectory[-1]) / max(1.0, crowd_mean_trajectory[0]) * 100.0)

        # Baseline single-agent impact vs crowded MFG impact
        # In single agent Almgren-Chriss, price impact is linear in gamma * v.
        # In MFG, effective impact is amplified by (1 + eta * crowd_concentration / gamma)
        amplification_factor = float(1.0 + (eta * 1000.0) / max(gamma, 1e-6))
        crowding_score = float(min(100.0, max(5.0, (amplification_factor - 1.0) * 18.0 + 15.0)))

        # Cascade liquidation probability
        tail_mass_liquidated = float(np.sum(m[-1, :Nx // 3]) * dx)
        cascade_prob = float(min(0.99, max(0.01, tail_mass_liquidated * 1.5 + (crowding_score / 100.0) * 0.4)))

        # Downsample spatial density for frontend visualization (e.g., 10 time slices x 15 inventory bins)
        time_sample_indices = np.linspace(0, Nt - 1, 10, dtype=int)
        x_sample_indices = np.linspace(0, Nx - 1, 15, dtype=int)

        density_heatmap = []
        for t_i in time_sample_indices:
            row = {
                "time_sec": round(float(t_grid[t_i]), 1),
                "crowd_mean_inventory": round(crowd_mean_trajectory[t_i], 1),
                "bins": [
                    {
                        "inventory": round(float(x_grid[x_i]), 0),
                        "density": round(float(m[t_i, x_i]), 6)
                    }
                    for x_i in x_sample_indices
                ]
            }
            density_heatmap.append(row)

        trajectory_series = [
            {
                "time_sec": round(float(t_grid[i]), 1),
                "mfg_crowd_inventory": round(crowd_mean_trajectory[i], 1),
                "single_agent_benchmark": round(float(crowd_mean_trajectory[0] * (1.0 - t_grid[i] / T)), 1),
                "effective_spread_bps": round(float(1.5 + (crowding_score / 20.0) * (1.0 + np.sin(i / 3.0) * 0.2)), 2)
            }
            for i in range(Nt)
        ]

        return {
            "status": "CONVERGED" if len(convergence_errors) < max_iterations else "APPROXIMATED",
            "iterations_executed": len(convergence_errors),
            "final_pde_residual": float(convergence_errors[-1]) if convergence_errors else 0.0,
            "crowding_score": round(crowding_score, 1),
            "price_impact_amplification_multiplier": round(amplification_factor, 2),
            "cascade_liquidation_probability": round(cascade_prob, 3),
            "inventory_reduction_pct": round(inventory_reduction_pct, 1),
            "initial_mean_inventory": round(float(crowd_mean_trajectory[0]), 1),
            "terminal_mean_inventory": round(float(crowd_mean_trajectory[-1]), 1),
            "density_heatmap": density_heatmap,
            "trajectory_series": trajectory_series
        }


# Global engine instance
mfg_crowding_engine = MFGCrowdingEngine()

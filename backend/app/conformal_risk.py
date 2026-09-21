"""
QUANTX Institutional Quantitative Finance Platform - v17 Sovereign Module 1
Conformal Prediction for Distribution-Free Risk Intervals

Provides finite-sample valid prediction intervals and distribution-free VaR/CVaR
guarantees without parametric distribution assumptions (Gaussian or Student's t).
Uses Split Conformal Prediction with exact (1 - alpha) empirical coverage bounds.
"""

from typing import Dict, List, Any, Optional
import numpy as np
from pydantic import BaseModel, Field


class ConformalIntervalRequest(BaseModel):
    alpha: float = Field(0.05, ge=0.001, le=0.5, description="Target miscoverage rate (e.g., 0.05 for 95% coverage)")
    predicted_point: float = Field(0.0012, description="Point prediction for test return")
    sample_size: int = Field(1000, ge=100, le=10000, description="Calibration sample size")
    regime: str = Field("FAT_TAIL_REGIME", description="Market regime: NORMAL, FAT_TAIL_REGIME, or REGIME_SHIFT")
    asset_ticker: str = Field("RELIANCE.NS", description="Asset or portfolio ticker")


class MultiHorizonConformalRequest(BaseModel):
    alpha: float = Field(0.05, ge=0.001, le=0.5)
    predicted_returns: Dict[str, float] = Field(
        default_factory=lambda: {
            "1D": 0.0012,
            "5D": 0.0045,
            "10D": 0.0082,
            "30D": 0.0210
        }
    )
    regime: str = Field("FAT_TAIL_REGIME")


class ConformalRiskEngine:
    """
    Distribution-free risk interval estimator using Split Conformal Prediction
    to guarantee finite-sample coverage for VaR and tail return boundaries.
    """

    def __init__(self, alpha: float = 0.05):
        self.alpha = float(alpha)

    def generate_synthetic_calibration(
        self,
        n: int = 1000,
        regime: str = "FAT_TAIL_REGIME",
        seed: int = 42
    ) -> Dict[str, np.ndarray]:
        """
        Generates realistic calibration return series and model point predictions
        under various market distributional regimes.
        """
        rng = np.random.default_rng(seed)

        if regime == "NORMAL":
            # Gaussian distribution
            y_true = rng.normal(loc=0.0005, scale=0.012, size=n)
            noise = rng.normal(loc=0.0, scale=0.0025, size=n)
            y_hat = y_true - noise
        elif regime == "FAT_TAIL_REGIME":
            # Student's t distribution with df=3 (heavy tails / kurtosis > 6)
            t_samples = rng.standard_t(df=3.0, size=n)
            y_true = 0.0004 + t_samples * (0.014 / np.sqrt(3.0))
            # Model predictions with occasional residual outliers
            model_error = rng.normal(loc=0.0, scale=0.003, size=n)
            y_hat = y_true - model_error
        else:  # REGIME_SHIFT
            # Mixture of two distributions (bimodal volatility regime)
            n1 = n // 2
            n2 = n - n1
            part1 = rng.normal(loc=0.001, scale=0.008, size=n1)
            part2 = rng.normal(loc=-0.004, scale=0.028, size=n2)
            y_true = np.concatenate([part1, part2])
            rng.shuffle(y_true)
            y_hat = y_true * 0.7 + rng.normal(0, 0.004, size=n)

        return {"y_true": y_true, "y_hat": y_hat}

    def fit_conformal_interval(
        self,
        y_calibration: np.ndarray,
        y_hat_calibration: np.ndarray,
        y_hat_test: float,
        alpha: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Computes conformal non-conformity scores on calibration data and projects
        distribution-free prediction bounds on test return predictions.
        """
        target_alpha = self.alpha if alpha is None else float(alpha)
        if len(y_calibration) != len(y_hat_calibration):
            raise ValueError("Calibration ground truth and predictions must have identical dimensions.")

        # Calculate non-conformity scores s_t = |y_t - y_hat_t|
        scores = np.abs(y_calibration - y_hat_calibration)
        n = len(scores)

        # Finite-sample adjusted quantile level: ceil((n + 1) * (1 - alpha)) / n
        q_level = float(np.ceil((n + 1) * (1.0 - target_alpha)) / n)
        q_level = min(1.0, max(0.0, q_level))

        # Empirical quantile of non-conformity scores
        q_hat = float(np.quantile(scores, q_level, method="higher"))

        lower_bound = float(y_hat_test - q_hat)
        upper_bound = float(y_hat_test + q_hat)
        interval_width = float(upper_bound - lower_bound)

        # Calculate empirical calibration coverage
        calib_in_bounds = (y_calibration >= (y_hat_calibration - q_hat)) & (
            y_calibration <= (y_hat_calibration + q_hat)
        )
        empirical_coverage = float(np.mean(calib_in_bounds))

        # Compute benchmark parametric Gaussian VaR
        calib_residuals = y_calibration - y_hat_calibration
        gaussian_std = float(np.std(calib_residuals))
        # Standard normal inverse CDF (Winitzki / Acklam approximation)
        p = 1.0 - target_alpha
        # Approximation for standard normal z-score
        # For p = 0.95 -> ~1.644853, p = 0.99 -> ~2.326348
        if p >= 0.5:
            t = np.sqrt(-2.0 * np.log(max(1e-12, 1.0 - p)))
            c0, c1, c2 = 2.515517, 0.802853, 0.010328
            d1, d2, d3 = 1.432788, 0.189269, 0.001308
            z_score = float(t - ((c2 * t + c1) * t + c0) / (((d3 * t + d2) * t + d1) * t + 1.0))
        else:
            t = np.sqrt(-2.0 * np.log(max(1e-12, p)))
            c0, c1, c2 = 2.515517, 0.802853, 0.010328
            d1, d2, d3 = 1.432788, 0.189269, 0.001308
            z_score = float(- (t - ((c2 * t + c1) * t + c0) / (((d3 * t + d2) * t + d1) * t + 1.0)))

        gaussian_var_alpha = float(z_score * gaussian_std)
        gaussian_lower = float(y_hat_test - gaussian_var_alpha)

        # Compute Conformal VaR & CVaR
        conformal_var = float(-lower_bound if lower_bound < 0 else 0.0)
        # Tail non-conformity values beyond q_hat for Expected Shortfall
        tail_scores = scores[scores >= q_hat]
        q_cvar = float(np.mean(tail_scores)) if len(tail_scores) > 0 else q_hat
        conformal_cvar = float(-(y_hat_test - q_cvar) if (y_hat_test - q_cvar) < 0 else 0.0)

        # Histogram of non-conformity scores for visual distribution
        hist_counts, bin_edges = np.histogram(scores, bins=25)
        histogram = [
            {
                "bin_start": float(bin_edges[i]),
                "bin_end": float(bin_edges[i + 1]),
                "count": int(hist_counts[i]),
                "frequency": float(hist_counts[i] / n)
            }
            for i in range(len(hist_counts))
        ]

        return {
            "status": "CONFORMAL_INTERVAL_SUCCESS",
            "alpha": target_alpha,
            "coverage_guarantee": f"{(1.0 - target_alpha) * 100.0:.1f}%",
            "finite_sample_q_level": q_level,
            "q_hat_non_conformity": q_hat,
            "predicted_point": float(y_hat_test),
            "conformal_lower_bound": lower_bound,
            "conformal_upper_bound": upper_bound,
            "interval_width": interval_width,
            "conformal_var_alpha": conformal_var,
            "conformal_cvar_alpha": conformal_cvar,
            "parametric_gaussian_var": gaussian_var_alpha,
            "parametric_gaussian_lower": gaussian_lower,
            "risk_underestimation_by_gaussian_pct": max(
                0.0,
                float((conformal_var - gaussian_var_alpha) / max(conformal_var, 1e-6) * 100.0)
            ),
            "empirical_calibration_coverage": empirical_coverage,
            "calibration_sample_size": n,
            "non_conformity_histogram": histogram
        }

    def compute_multi_horizon_intervals(
        self,
        predicted_returns: Dict[str, float],
        alpha: float = 0.05,
        regime: str = "FAT_TAIL_REGIME"
    ) -> Dict[str, Any]:
        return self.compute_multi_horizon(predicted_returns, alpha=alpha, regime=regime)

    def compute_multi_horizon(
        self,
        predicted_returns: Dict[str, float],
        alpha: float = 0.05,
        regime: str = "FAT_TAIL_REGIME"
    ) -> Dict[str, Any]:
        """
        Computes distribution-free conformal bounds across multiple forecast horizons (1D, 5D, 10D, 30D).
        """
        calib_data = self.generate_synthetic_calibration(n=1000, regime=regime)
        horizons_scale = {
            "1D": 1.0,
            "5D": np.sqrt(5.0),
            "10D": np.sqrt(10.0),
            "30D": np.sqrt(30.0)
        }

        horizon_results = {}
        for h, y_hat in predicted_returns.items():
            scale = horizons_scale.get(h, 1.0)
            # Scale calibration residuals by square-root-of-time diffusion factor
            scaled_y_true = calib_data["y_true"] * scale
            scaled_y_hat = calib_data["y_hat"] * scale
            res = self.fit_conformal_interval(
                y_calibration=scaled_y_true,
                y_hat_calibration=scaled_y_hat,
                y_hat_test=y_hat,
                alpha=alpha
            )
            horizon_results[h] = {
                "horizon": h,
                "predicted_point": y_hat,
                "conformal_lower": res["conformal_lower_bound"],
                "conformal_upper": res["conformal_upper_bound"],
                "q_hat": res["q_hat_non_conformity"],
                "conformal_var": res["conformal_var_alpha"],
                "conformal_cvar": res["conformal_cvar_alpha"],
                "gaussian_var": res["parametric_gaussian_var"],
                "empirical_coverage": res["empirical_calibration_coverage"]
            }

        return {
            "status": "SUCCESS",
            "alpha": alpha,
            "coverage_guarantee": f"{(1.0 - alpha) * 100.0:.1f}%",
            "regime": regime,
            "horizons": horizon_results
        }


# Global engine instance
conformal_risk_engine = ConformalRiskEngine(alpha=0.05)

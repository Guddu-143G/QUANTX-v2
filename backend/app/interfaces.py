"""
quantx/core/interfaces.py
Enterprise Plugin Interfaces for QUANTX Quantitative Extensions.
Implements the abstract base classes specified in suggestions-v2.md.
"""

from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Tuple


class BaseDataContract(ABC):
    """
    Standardizes ingestion of custom asset positions and pricing series,
    improving on original CSV models.
    """
    @abstractmethod
    def validate_schema(self, data: Any) -> bool:
        """Enforces columns, types, null handling, and date sequences."""
        pass

    @abstractmethod
    def align_observation_windows(self, holdings: Any, prices: Any) -> Tuple[Any, Any]:
        """Aligns asset price schedules to match historical periods securely."""
        pass


class BaseFactor(ABC):
    """
    Interface for implementing custom AlphaLab Factor Families.
    Allows quants to inject proprietary signals alongside standard tilts.
    """
    def __init__(self, name: str, category: str, parameters: Dict[str, Any]):
        self.name = name
        self.category = category  # e.g., "Momentum", "Value", "Alternative", "Microstructure"
        self.parameters = parameters

    @abstractmethod
    def compute_signal(self, price_data: Any, fundamental_data: Optional[Any] = None) -> Any:
        """
        Returns a rolling cross-sectional factor score vector normalized 
        between -1.0 and 1.0 (z-score adjusted).
        """
        pass

    @abstractmethod
    def calculate_information_coefficient(
        self, signal: Any, forward_returns: Any, horizons: List[int] = [5, 21, 63]
    ) -> Dict[int, float]:
        """Tracks rolling IC and decay curves over different days."""
        pass


class BaseOptimizer(ABC):
    """
    Interface for convex quadratic portfolio optimization solvers.
    """
    def __init__(self, risk_free_rate: float = 0.06):
        self.risk_free_rate = risk_free_rate

    @abstractmethod
    def solve_allocation(
        self, 
        expected_returns: Any, 
        covariance_matrix: Any, 
        constraints: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Solves allocation under constraints (e.g., position/sector weights, UCITS 5/10/40).
        Returns target weights, active bindings, and the shadow cost of constraints.
        """
        pass

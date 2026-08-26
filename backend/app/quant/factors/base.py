from abc import ABC, abstractmethod
from typing import Dict, Any, List
from datetime import datetime

class Factor(ABC):
    """
    Base contract for all Quantitative Factors in QUANTX Alpha Lab.
    """
    
    @property
    @abstractmethod
    def factor_id(self) -> str:
        """Unique identifier for the factor."""
        pass

    @property
    @abstractmethod
    def version(self) -> str:
        """Version string of the factor implementation."""
        pass
        
    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable name of the factor."""
        pass

    @abstractmethod
    def compute(self, instrument_ids: List[int], as_of: datetime, data_service) -> Dict[int, float]:
        """
        Computes the raw factor values for the given instruments at the given time.
        Must use PointInTimeDataService (passed as `data_service`) to avoid look-ahead bias.
        
        Returns:
            Dict mapping instrument_id to raw factor value.
        """
        pass

    @abstractmethod
    def validate(self, raw_scores: Dict[int, float]) -> bool:
        """
        Validates the computed raw scores (e.g., checks for excessive missing values).
        """
        pass

    @abstractmethod
    def metadata(self) -> Dict[str, Any]:
        """
        Returns factor metadata required by Phase 1.5 specifications.
        """
        pass

    @abstractmethod
    def diagnostics(self) -> Dict[str, Any]:
        """
        Returns the specific diagnostics (e.g., specific rules for IC or half-life).
        """
        pass

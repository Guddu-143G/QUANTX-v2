from enum import Enum
from typing import Dict, Any

class FactorStatus(str, Enum):
    ACTIVE = "ACTIVE"
    MONITOR = "MONITOR"
    DECAY = "DECAY"
    STALE = "STALE"
    BLOCKED = "BLOCKED"
    RETIRED = "RETIRED"

class AlphaHealthMonitor:
    @staticmethod
    def evaluate_factor_health(
        ic_history: list[float], 
        icir: float, 
        coverage: float, 
        data_freshness_hours: float, 
        expected_ic: float
    ) -> FactorStatus:
        """
        Evaluates the health status of a quantitative factor.
        Rules:
        - If data is older than 48h (for daily factors), it's STALE.
        - If coverage < 0.5, it's BLOCKED.
        - If IC and ICIR are significantly below expectations, it's DECAY.
        - If IC is slightly below expectations, it's MONITOR.
        - Otherwise ACTIVE.
        """
        # Hard blocks
        if data_freshness_hours > 48:
            return FactorStatus.STALE
            
        if coverage < 0.50:
            return FactorStatus.BLOCKED
            
        if not ic_history:
            return FactorStatus.MONITOR
            
        # Recent IC performance
        recent_ic = sum(ic_history[-5:]) / min(5, len(ic_history))
        
        if recent_ic < (expected_ic * 0.3) or icir < 0.2:
            return FactorStatus.DECAY
            
        if recent_ic < (expected_ic * 0.7) or coverage < 0.8:
            return FactorStatus.MONITOR
            
        return FactorStatus.ACTIVE

    @staticmethod
    def evaluate_composite_health(
        factors_health: Dict[str, FactorStatus], 
        weights: Dict[str, float]
    ) -> str:
        """
        Evaluates composite health based on the health of its underlying factors.
        Returns: 'HEALTHY', 'WARNING', 'BLOCKED'
        """
        try:
            total = sum(weights.values())
            if abs(total - 100.0) > 0.01:
                return "BLOCKED"
        except:
            return "BLOCKED"
            
        for factor_id, weight in weights.items():
            if weight > 0:
                status = factors_health.get(factor_id, FactorStatus.STALE)
                if status in [FactorStatus.BLOCKED, FactorStatus.STALE, FactorStatus.RETIRED]:
                    return "BLOCKED"
                if status == FactorStatus.DECAY and weight >= 15.0:
                    return "WARNING"
                if status == FactorStatus.MONITOR and weight >= 25.0:
                    return "WARNING"
                    
        return "HEALTHY"

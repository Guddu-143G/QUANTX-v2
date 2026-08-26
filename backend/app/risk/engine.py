import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from collections import defaultdict
from .models import RiskLimit, RiskBreach

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

class BreachEngine:
    def __init__(self):
        self.active_breaches: Dict[str, RiskBreach] = {}
        
    def detect_or_update(self, limit: RiskLimit) -> Optional[RiskBreach]:
        if limit.status not in ["BREACH", "CRITICAL WARNING"]:
            # If there was an active breach for this limit, resolve it
            if limit.key in self.active_breaches:
                breach = self.active_breaches[limit.key]
                breach.status = "RESOLVED"
                breach.resolution = "AUTOMATIC_RECOVERY"
                # Keep it in history (we would log it to DB here)
                del self.active_breaches[limit.key]
            return None
            
        # We have a breach condition
        if limit.key in self.active_breaches:
            breach = self.active_breaches[limit.key]
            breach.peak_value = max(breach.peak_value, limit.current)
            breach.observed_value = limit.current
            breach.duration_seconds = int((datetime.now(timezone.utc) - datetime.fromisoformat(breach.timestamp)).total_seconds())
            return breach
            
        # New breach
        breach = RiskBreach(
            id=f"AL-{uuid.uuid4().hex[:6].upper()}",
            limit_key=limit.key,
            metric_name=limit.name,
            observed_value=limit.current,
            limit_value=limit.limit,
            peak_value=limit.current,
            timestamp=now_iso(),
            status="DETECTED"
        )
        self.active_breaches[limit.key] = breach
        return breach

    def get_active_breaches(self) -> List[RiskBreach]:
        return list(self.active_breaches.values())


class RiskLimitEngine:
    """
    Centralized limit engine (Beta, Volatility, VaR, Concentration).
    """
    def __init__(self):
        self.breach_engine = BreachEngine()
        # Default policy limits
        self.policy_limits = {
            "portfolio_beta": 1.10,
            "portfolio_var": 2.3,
            "sector_concentration": 25.0,
            "single_position": 10.0,
            "margin_utilization": 80.0
        }
        
    def evaluate(self, metrics: Dict[str, float]) -> Dict[str, Any]:
        """
        Evaluate current metrics against the policy limits.
        """
        results = []
        for key, limit_val in self.policy_limits.items():
            current_val = metrics.get(key, 0.0)
            
            # Create a limit object
            limit_obj = RiskLimit(
                name=key.replace("_", " ").title(),
                key=key,
                limit=limit_val,
                current=current_val,
                unit="%" if "var" not in key and "beta" not in key else ("" if "beta" in key else "%")
            )
            
            # Check for breaches
            self.breach_engine.detect_or_update(limit_obj)
            
            results.append(limit_obj.model_dump() | {"status": limit_obj.status, "utilization": limit_obj.utilization, "headroom": limit_obj.headroom})
            
        return {
            "limits": results,
            "breaches": [b.model_dump() for b in self.breach_engine.get_active_breaches()]
        }

# Global singleton for demonstration
risk_engine = RiskLimitEngine()

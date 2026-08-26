from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime

class RiskLimit(BaseModel):
    name: str
    key: str
    limit: float
    current: float
    unit: str = "%"
    
    @property
    def utilization(self) -> float:
        return (self.current / self.limit) * 100 if self.limit > 0 else 0

    @property
    def headroom(self) -> float:
        return max(0.0, self.limit - self.current)
        
    @property
    def status(self) -> str:
        util = self.utilization
        if util > 100: return "BREACH"
        if util >= 95: return "CRITICAL WARNING"
        if util >= 85: return "WARNING"
        if util >= 70: return "NORMAL"
        return "GREEN"


class RiskBreach(BaseModel):
    id: str
    limit_key: str
    metric_name: str
    observed_value: float
    limit_value: float
    peak_value: float
    timestamp: str
    status: Literal["DETECTED", "VALIDATING", "CONFIRMED", "ESCALATED", "MITIGATION", "RESOLVED"]
    resolution: Optional[str] = None
    duration_seconds: int = 0

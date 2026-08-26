from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

class UserBase(BaseModel):
    email: str
    full_name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    last_login_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class PortfolioConstraintBase(BaseModel):
    max_position_weight: float = Field(default=0.10, ge=0.0, le=1.0)
    max_sector_weight: float = Field(default=0.30, ge=0.0, le=1.0)
    max_portfolio_drawdown: float = Field(default=0.15, ge=0.0, le=1.0)
    cash_reserve_target: float = Field(default=0.05, ge=0.0, le=1.0)

class PortfolioConstraintResponse(PortfolioConstraintBase):
    id: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InstrumentBase(BaseModel):
    ticker: str
    name: Optional[str] = None
    type: str

class InstrumentResponse(InstrumentBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class PortfolioPositionBase(BaseModel):
    instrument_id: int
    quantity: float
    average_cost: float

class PortfolioPositionResponse(PortfolioPositionBase):
    id: int
    instrument: InstrumentResponse

    model_config = ConfigDict(from_attributes=True)

class PortfolioMetricResponse(BaseModel):
    id: int
    calculated_at: datetime
    cagr: Optional[float] = None
    volatility: Optional[float] = None
    sharpe_ratio: Optional[float] = None
    sortino_ratio: Optional[float] = None
    max_drawdown: Optional[float] = None
    beta: Optional[float] = None
    var_95: Optional[float] = None
    cvar_95: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

class PortfolioResponse(BaseModel):
    id: int
    name: str
    currency: str
    cash_balance: float
    created_at: datetime
    updated_at: datetime
    positions: List[PortfolioPositionResponse] = []
    constraints: List[PortfolioConstraintResponse] = []
    metrics: List[PortfolioMetricResponse] = []

    model_config = ConfigDict(from_attributes=True)

class RiskEvaluationViolation(BaseModel):
    type: str
    sector: Optional[str] = None
    instrument: Optional[str] = None
    current_weight: Optional[float] = None
    limit: Optional[float] = None
    message: str

class RiskEvaluationResponse(BaseModel):
    status: str # "PASS" or "BLOCK"
    violations: List[RiskEvaluationViolation] = []
    warnings: List[RiskEvaluationViolation] = []

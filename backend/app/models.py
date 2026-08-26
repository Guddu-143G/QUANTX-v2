from datetime import datetime, UTC
from typing import List, Optional

from sqlalchemy import ForeignKey, String, Integer, Float, Boolean, JSON, DateTime, Index
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

def utc_now():
    return datetime.now(UTC)

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Relationships
    sessions: Mapped[List["Session"]] = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    portfolios: Mapped[List["Portfolio"]] = relationship("Portfolio", back_populates="user")
    audit_logs: Mapped[List["AuditLog"]] = relationship("AuditLog", back_populates="user")

class Session(Base):
    __tablename__ = "sessions"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    user: Mapped["User"] = relationship("User", back_populates="sessions")

class Portfolio(Base):
    __tablename__ = "portfolios"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="INR")
    cash_balance: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    
    user: Mapped["User"] = relationship("User", back_populates="portfolios")
    positions: Mapped[List["PortfolioPosition"]] = relationship("PortfolioPosition", back_populates="portfolio")
    snapshots: Mapped[List["PortfolioSnapshot"]] = relationship("PortfolioSnapshot", back_populates="portfolio")
    constraints: Mapped[List["PortfolioConstraint"]] = relationship("PortfolioConstraint", back_populates="portfolio")
    metrics: Mapped[List["PortfolioMetric"]] = relationship("PortfolioMetric", back_populates="portfolio")

class Sector(Base):
    __tablename__ = "sectors"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    
    instruments: Mapped[List["Instrument"]] = relationship("Instrument", back_populates="sector")

class Instrument(Base):
    __tablename__ = "instruments"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    ticker: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String(255))
    type: Mapped[str] = mapped_column(String(50), default="EQUITY")  # EQUITY, ETF, INDEX
    sector_id: Mapped[Optional[int]] = mapped_column(ForeignKey("sectors.id"))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    sector: Mapped[Optional["Sector"]] = relationship("Sector", back_populates="instruments")
    price_history: Mapped[List["PriceHistory"]] = relationship("PriceHistory", back_populates="instrument")

class PortfolioPosition(Base):
    __tablename__ = "portfolio_positions"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    portfolio_id: Mapped[int] = mapped_column(ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False)
    instrument_id: Mapped[int] = mapped_column(ForeignKey("instruments.id"), nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    average_cost: Mapped[float] = mapped_column(Float, default=0.0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    
    portfolio: Mapped["Portfolio"] = relationship("Portfolio", back_populates="positions")
    instrument: Mapped["Instrument"] = relationship("Instrument")

class PortfolioSnapshot(Base):
    __tablename__ = "portfolio_snapshots"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    portfolio_id: Mapped[int] = mapped_column(ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False)
    snapshot_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    total_value: Mapped[float] = mapped_column(Float, nullable=False)
    cash_value: Mapped[float] = mapped_column(Float, nullable=False)
    invested_value: Mapped[float] = mapped_column(Float, nullable=False)
    
    portfolio: Mapped["Portfolio"] = relationship("Portfolio", back_populates="snapshots")

class PortfolioConstraint(Base):
    __tablename__ = "portfolio_constraints"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    portfolio_id: Mapped[int] = mapped_column(ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False)
    max_position_weight: Mapped[float] = mapped_column(Float, default=0.10)
    max_sector_weight: Mapped[float] = mapped_column(Float, default=0.30)
    max_portfolio_drawdown: Mapped[float] = mapped_column(Float, default=0.15)
    cash_reserve_target: Mapped[float] = mapped_column(Float, default=0.05)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    
    portfolio: Mapped["Portfolio"] = relationship("Portfolio", back_populates="constraints")

class PortfolioMetric(Base):
    __tablename__ = "portfolio_metrics"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    portfolio_id: Mapped[int] = mapped_column(ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False)
    calculated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    cagr: Mapped[Optional[float]] = mapped_column(Float)
    volatility: Mapped[Optional[float]] = mapped_column(Float)
    sharpe_ratio: Mapped[Optional[float]] = mapped_column(Float)
    sortino_ratio: Mapped[Optional[float]] = mapped_column(Float)
    max_drawdown: Mapped[Optional[float]] = mapped_column(Float)
    beta: Mapped[Optional[float]] = mapped_column(Float)
    var_95: Mapped[Optional[float]] = mapped_column(Float)
    cvar_95: Mapped[Optional[float]] = mapped_column(Float)
    
    portfolio: Mapped["Portfolio"] = relationship("Portfolio", back_populates="metrics")

class PriceHistory(Base):
    __tablename__ = "price_history"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    instrument_id: Mapped[int] = mapped_column(ForeignKey("instruments.id", ondelete="CASCADE"), nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    close: Mapped[float] = mapped_column(Float, nullable=False)
    
    instrument: Mapped["Instrument"] = relationship("Instrument", back_populates="price_history")
    
    __table_args__ = (Index("idx_instrument_date", "instrument_id", "date", unique=True),)

class Benchmark(Base):
    __tablename__ = "benchmarks"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    instrument_id: Mapped[int] = mapped_column(ForeignKey("instruments.id"), nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)

class AnalysisRun(Base):
    __tablename__ = "analysis_runs"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    run_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    input_payload: Mapped[dict] = mapped_column(JSON, nullable=False)
    output_result: Mapped[dict] = mapped_column(JSON, nullable=False)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    resource_type: Mapped[Optional[str]] = mapped_column(String(100))
    resource_id: Mapped[Optional[str]] = mapped_column(String(100))
    details: Mapped[Optional[dict]] = mapped_column(JSON)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45))
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    
    user: Mapped[Optional["User"]] = relationship("User", back_populates="audit_logs")

# --- PHASE 1.2: POINT-IN-TIME (PiT) DATA MODELS ---

class Exchange(Base):
    __tablename__ = "exchanges"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    mic_code: Mapped[Optional[str]] = mapped_column(String(10))

class IndexMembership(Base):
    __tablename__ = "index_memberships"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    index_name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    instrument_id: Mapped[int] = mapped_column(ForeignKey("instruments.id"), nullable=False)
    effective_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    weight: Mapped[Optional[float]] = mapped_column(Float)

class OHLCVBar(Base):
    __tablename__ = "ohlcv_bars"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    instrument_id: Mapped[int] = mapped_column(ForeignKey("instruments.id", ondelete="CASCADE"), nullable=False)
    interval: Mapped[str] = mapped_column(String(10), default="1d") # 1d, 1h, 1m
    effective_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    open: Mapped[float] = mapped_column(Float, nullable=False)
    high: Mapped[float] = mapped_column(Float, nullable=False)
    low: Mapped[float] = mapped_column(Float, nullable=False)
    close: Mapped[float] = mapped_column(Float, nullable=False)
    volume: Mapped[float] = mapped_column(Float, nullable=False)
    source: Mapped[str] = mapped_column(String(50))
    dataset_version: Mapped[str] = mapped_column(String(50))
    
    __table_args__ = (Index("idx_ohlcv_inst_time", "instrument_id", "effective_time", "interval", unique=True),)

class MarketTick(Base):
    __tablename__ = "market_ticks"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    instrument_id: Mapped[int] = mapped_column(ForeignKey("instruments.id", ondelete="CASCADE"), nullable=False)
    effective_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    volume: Mapped[float] = mapped_column(Float, nullable=False)
    source: Mapped[str] = mapped_column(String(50))

class CorporateAction(Base):
    __tablename__ = "corporate_actions"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    instrument_id: Mapped[int] = mapped_column(ForeignKey("instruments.id"), nullable=False)
    action_type: Mapped[str] = mapped_column(String(50), nullable=False) # DIVIDEND, SPLIT, MERGER
    effective_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    source: Mapped[str] = mapped_column(String(50))

class FinancialStatement(Base):
    __tablename__ = "financial_statements"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    instrument_id: Mapped[int] = mapped_column(ForeignKey("instruments.id"), nullable=False)
    statement_type: Mapped[str] = mapped_column(String(50), nullable=False) # QUARTERLY, ANNUAL
    period_end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    effective_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    data: Mapped[dict] = mapped_column(JSON, nullable=False)
    source: Mapped[str] = mapped_column(String(50))

class FundamentalObservation(Base):
    __tablename__ = "fundamental_observations"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    instrument_id: Mapped[int] = mapped_column(ForeignKey("instruments.id"), nullable=False)
    metric: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. PE_RATIO, EPS
    value: Mapped[float] = mapped_column(Float, nullable=False)
    effective_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    source: Mapped[str] = mapped_column(String(50))
    dataset_version: Mapped[str] = mapped_column(String(50))

class NewsEvent(Base):
    __tablename__ = "news_events"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    content: Mapped[Optional[str]] = mapped_column(String)
    url: Mapped[Optional[str]] = mapped_column(String(500))
    effective_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    source: Mapped[str] = mapped_column(String(50))

class SentimentObservation(Base):
    __tablename__ = "sentiment_observations"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    instrument_id: Mapped[Optional[int]] = mapped_column(ForeignKey("instruments.id"))
    news_id: Mapped[Optional[int]] = mapped_column(ForeignKey("news_events.id"))
    sentiment_score: Mapped[float] = mapped_column(Float, nullable=False)
    confidence: Mapped[Optional[float]] = mapped_column(Float)
    effective_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    source: Mapped[str] = mapped_column(String(50))

class MacroObservation(Base):
    __tablename__ = "macro_observations"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    indicator: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. INDIA_VIX, USD_INR
    value: Mapped[float] = mapped_column(Float, nullable=False)
    effective_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    source: Mapped[str] = mapped_column(String(50))

class AlternativeData(Base):
    __tablename__ = "alternative_data"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    instrument_id: Mapped[Optional[int]] = mapped_column(ForeignKey("instruments.id"))
    dataset_name: Mapped[str] = mapped_column(String(100), nullable=False)
    data: Mapped[dict] = mapped_column(JSON, nullable=False)
    effective_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    source: Mapped[str] = mapped_column(String(50))

class KiteInstrument(Base):
    __tablename__ = "kite_instruments"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    instrument_token: Mapped[int] = mapped_column(Integer, unique=True, index=True, nullable=False)
    exchange_token: Mapped[Optional[int]] = mapped_column(Integer)
    tradingsymbol: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String(255))
    last_price: Mapped[Optional[float]] = mapped_column(Float)
    expiry: Mapped[Optional[str]] = mapped_column(String(50))
    strike: Mapped[Optional[float]] = mapped_column(Float)
    tick_size: Mapped[Optional[float]] = mapped_column(Float)
    lot_size: Mapped[Optional[int]] = mapped_column(Integer)
    instrument_type: Mapped[Optional[str]] = mapped_column(String(50))
    segment: Mapped[Optional[str]] = mapped_column(String(50))
    exchange: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

# --- PHASE 1.5: FACTOR ENGINE MODELS ---

class FactorDefinition(Base):
    __tablename__ = "factor_definitions"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(500))
    category: Mapped[str] = mapped_column(String(50), nullable=False) # MOMENTUM, VALUE, QUALITY, etc.

class FactorVersion(Base):
    __tablename__ = "factor_versions"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    factor_id: Mapped[int] = mapped_column(ForeignKey("factor_definitions.id"), nullable=False)
    version: Mapped[str] = mapped_column(String(50), nullable=False)
    formula: Mapped[str] = mapped_column(String, nullable=False)
    parameters: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    author_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    
    __table_args__ = (Index("idx_factor_version", "factor_id", "version", unique=True),)

class FactorObservation(Base):
    __tablename__ = "factor_observations"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    factor_version_id: Mapped[int] = mapped_column(ForeignKey("factor_versions.id"), nullable=False)
    instrument_id: Mapped[int] = mapped_column(ForeignKey("instruments.id"), nullable=False)
    raw_value: Mapped[float] = mapped_column(Float, nullable=False)
    effective_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class FactorScore(Base):
    __tablename__ = "factor_scores"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    factor_version_id: Mapped[int] = mapped_column(ForeignKey("factor_versions.id"), nullable=False)
    instrument_id: Mapped[int] = mapped_column(ForeignKey("instruments.id"), nullable=False)
    normalized_score: Mapped[float] = mapped_column(Float, nullable=False) # Z-score
    percentile: Mapped[Optional[float]] = mapped_column(Float)
    effective_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class FactorReturn(Base):
    __tablename__ = "factor_returns"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    factor_version_id: Mapped[int] = mapped_column(ForeignKey("factor_versions.id"), nullable=False)
    period: Mapped[str] = mapped_column(String(10), nullable=False) # 1D, 5D, 20D
    ic: Mapped[float] = mapped_column(Float, nullable=False) # Information Coefficient
    effective_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

# --- PHASE 1.20: COMPOSITE ENGINE MODELS ---

class CompositeDefinition(Base):
    __tablename__ = "composite_definitions"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(500))

class CompositeVersion(Base):
    __tablename__ = "composite_versions"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    composite_id: Mapped[int] = mapped_column(ForeignKey("composite_definitions.id"), nullable=False)
    version: Mapped[str] = mapped_column(String(50), nullable=False)
    weights: Mapped[dict] = mapped_column(JSON, nullable=False) # Must sum to 100%
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    author_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))

class ResearchRun(Base):
    __tablename__ = "research_runs"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    composite_version_id: Mapped[int] = mapped_column(ForeignKey("composite_versions.id"), nullable=False)
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    parameters: Mapped[dict] = mapped_column(JSON, nullable=False)
    results: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    author_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))

class BacktestRun(Base):
    __tablename__ = "backtest_runs"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    research_run_id: Mapped[int] = mapped_column(ForeignKey("research_runs.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False) # QUEUED, RUNNING, COMPLETED, FAILED
    metrics: Mapped[Optional[dict]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

class DataQualityEvent(Base):
    __tablename__ = "data_quality_events"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    severity: Mapped[str] = mapped_column(String(20), nullable=False) # INFO, WARNING, ERROR, CRITICAL
    error_id: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. ALPHA-DATA-001
    component: Mapped[str] = mapped_column(String(100), nullable=False)
    message: Mapped[str] = mapped_column(String(500), nullable=False)
    context_data: Mapped[Optional[dict]] = mapped_column(JSON)
    effective_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)

# --- PHASE 2: RISK COMMAND CENTER MODELS ---

class RiskModelVersion(Base):
    __tablename__ = "risk_model_versions"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    version: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class RiskSnapshot(Base):
    __tablename__ = "risk_snapshots"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    portfolio_id: Mapped[int] = mapped_column(ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    market_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    calculation_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    data_version: Mapped[str] = mapped_column(String(50), nullable=False)
    risk_model_version_id: Mapped[Optional[int]] = mapped_column(ForeignKey("risk_model_versions.id"))
    
    # Portfolio Snapshot attributes
    nav: Mapped[float] = mapped_column(Float, nullable=False)
    gross_exposure: Mapped[float] = mapped_column(Float, nullable=False)
    net_exposure: Mapped[float] = mapped_column(Float, nullable=False)
    cash: Mapped[float] = mapped_column(Float, nullable=False)
    long_exposure: Mapped[float] = mapped_column(Float, nullable=False)
    short_exposure: Mapped[float] = mapped_column(Float, nullable=False)
    leverage: Mapped[float] = mapped_column(Float, nullable=False)
    
    # Core Risk Metrics
    beta: Mapped[Optional[float]] = mapped_column(Float)
    volatility: Mapped[Optional[float]] = mapped_column(Float)
    tracking_error: Mapped[Optional[float]] = mapped_column(Float)

class VaRObservation(Base):
    __tablename__ = "var_observations"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    snapshot_id: Mapped[int] = mapped_column(ForeignKey("risk_snapshots.id", ondelete="CASCADE"), nullable=False)
    method: Mapped[str] = mapped_column(String(50), nullable=False) # Historical, Parametric, MonteCarlo
    confidence_level: Mapped[float] = mapped_column(Float, nullable=False) # e.g. 0.95
    horizon_days: Mapped[int] = mapped_column(Integer, nullable=False) # 1, 5, 10
    value: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="VALID") # VALID, STALE, UNKNOWN, INVALID

class CVaRObservation(Base):
    __tablename__ = "cvar_observations"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    snapshot_id: Mapped[int] = mapped_column(ForeignKey("risk_snapshots.id", ondelete="CASCADE"), nullable=False)
    method: Mapped[str] = mapped_column(String(50), nullable=False)
    confidence_level: Mapped[float] = mapped_column(Float, nullable=False)
    horizon_days: Mapped[int] = mapped_column(Integer, nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="VALID")

class PortfolioExposure(Base):
    __tablename__ = "portfolio_exposures"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    snapshot_id: Mapped[int] = mapped_column(ForeignKey("risk_snapshots.id", ondelete="CASCADE"), nullable=False)
    exposure_type: Mapped[str] = mapped_column(String(50), nullable=False) # SECTOR, FACTOR, CURRENCY
    name: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. Technology, Momentum, USD
    exposure_value: Mapped[float] = mapped_column(Float, nullable=False) # Absolute or Percentage

class StressScenario(Base):
    __tablename__ = "stress_scenarios"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    shock_description: Mapped[str] = mapped_column(String(500), nullable=False)
    probability_pa: Mapped[Optional[float]] = mapped_column(Float)
    parameters: Mapped[dict] = mapped_column(JSON, nullable=False)

class StressResult(Base):
    __tablename__ = "stress_results"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    snapshot_id: Mapped[int] = mapped_column(ForeignKey("risk_snapshots.id", ondelete="CASCADE"), nullable=False)
    scenario_id: Mapped[int] = mapped_column(ForeignKey("stress_scenarios.id", ondelete="CASCADE"), nullable=False)
    impact_pct: Mapped[float] = mapped_column(Float, nullable=False)
    loss_value: Mapped[float] = mapped_column(Float, nullable=False)
    worst_asset: Mapped[Optional[str]] = mapped_column(String(100))
    worst_asset_pct: Mapped[Optional[float]] = mapped_column(Float)
    recovery_months: Mapped[Optional[str]] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(20), default="VALID") # WITHIN LIMITS, ELEVATED, BREACH

class RiskLimit(Base):
    __tablename__ = "risk_limits"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    portfolio_id: Mapped[int] = mapped_column(ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    metric_type: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. VAR_95, BETA, LEVERAGE
    threshold: Mapped[float] = mapped_column(Float, nullable=False)
    is_upper_bound: Mapped[bool] = mapped_column(Boolean, default=True)

class RiskLimitEvent(Base):
    __tablename__ = "risk_limit_events"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    limit_id: Mapped[int] = mapped_column(ForeignKey("risk_limits.id", ondelete="CASCADE"), nullable=False)
    snapshot_id: Mapped[int] = mapped_column(ForeignKey("risk_snapshots.id", ondelete="CASCADE"), nullable=False)
    current_value: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False) # HEALTHY, ELEVATED, BREACH

class RiskBreach(Base):
    __tablename__ = "risk_breaches"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("risk_limit_events.id", ondelete="CASCADE"), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    escalation_status: Mapped[str] = mapped_column(String(50), default="OPEN") # OPEN, ACKNOWLEDGED, RESOLVED

class RiskAuditLog(Base):
    __tablename__ = "risk_audit_events"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. RECONCILIATION_FAILED, STALE_DATA
    description: Mapped[str] = mapped_column(String, nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False)

# QUANTX Roadmap

This roadmap outlines the four-phase plan to transform QUANTX from a CSV analytics tool into a production-grade algorithmic execution platform.

## Phase 1: Portfolio Intelligence
**Objective**: Transform the existing CSV analytics application into a serious portfolio intelligence platform.
- **Data & DB**: Migrate to PostgreSQL (using SQLAlchemy/Alembic) with robust data models.
- **Analytics Engine**: Implement professional financial analytics (Performance, Risk, Concentration, Risk Contribution).
- **Risk Engine v1**: Create a `PreTradeRiskEngine` for historical analysis and constraint validation.
- **Allocation Engine**: Implement constrained portfolio optimizers (Mean-Variance, Risk Parity, etc.).
- **UI**: Build a professional dashboard with rich financial charting.
- **No Live Trading**: Exclusively operates on uploaded/historical data.

## Phase 2: Real-Time Market & Broker Intelligence
**Objective**: Turn QUANTX into a real-time portfolio monitoring platform.
- **Market Data**: Subscribe to real-time broker WebSocket feeds.
- **Data Quality**: Implement stale-data, gap, and timestamp anomaly detection.
- **Broker Adapter (Read-Only)**: Securely connect to brokers to sync live holdings and cash.
- **Reconciliation Engine**: Reconcile QUANTX state with the broker's actual state.
- **Real-Time UI**: Push updates to the React dashboard via WebSockets.
- **No Automated Live Trading**.

## Phase 3: Quant Research, Risk Control, & Paper Trading
**Objective**: Build the quantitative decision infrastructure and paper trading simulator.
- **Strategy Engine**: Framework for algorithmic strategies (Momentum, Mean Reversion, ML-based).
- **Backtesting & Validation**: Robust engine supporting walk-forward testing and transaction costs.
- **Risk Engine v2**: The hard trading gate enforcing strict limits and position sizing.
- **Paper Trading Engine**: Simulates realistic execution (slippage, partial fills, rejections).
- **AI Copilot**: Explainability layer querying internal data.
- **No Live Capital Exposed**.

## Phase 4: Controlled Live Trading Infrastructure
**Objective**: Introduce actual broker order execution with absolute risk control.
- **Execution Engine**: Boundary layer communicating with broker APIs for order management.
- **Order State Machine**: Safely handle `UNKNOWN` states, rejections, and idempotency.
- **Circuit Breakers & Kill Switches**: Multi-level emergency controls.
- **Live Trading Gateway**: Strict explicit user activation after passing risk and paper-trading prerequisites.
- **Compliance & Trust**: Every trade is fully explainable, logged, and reconciled.

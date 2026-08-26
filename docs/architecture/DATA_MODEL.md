# QUANTX Database Architecture

This document describes the transition from local SQLite to PostgreSQL and outlines the logical domains and schema structures required for the production platform.

## 1. Core Principle
PostgreSQL is the source of truth for persistent state (User profiles, execution logs, portfolio configurations). Redis is used for ephemeral state (live market prices, WebSockets, rate limiting).

## 2. Logical Domains

### Domain 1: Users & Auth
- `users`: Core identity (email, password_hash, MFA configuration).
- `user_profiles`: Risk tolerance, desk, name.
- `sessions`: Token hashes and expiries.
- `user_consents`: RBI Account Aggregator style explicit consents for data access.

### Domain 2: Broker Connections
- `broker_accounts`: The linked external broker account IDs.
- `broker_tokens`: Encrypted storage for access/refresh tokens.
- `broker_permissions`: Mapped authorizations (read-only, execution allowed).

### Domain 3: Instrument Master
Centralized lookup to avoid using unstable ticker symbols.
- `instruments`: `id`, `name`, `type` (equity, futures, options).
- `instrument_identifiers`: Links the internal ID to exchange tokens (e.g., NSE token `256265` -> `RELIANCE`).
- `corporate_actions`: Historical record of splits and dividends for P&L adjustments.

### Domain 4: Portfolio
- `portfolios`: Overall cash and margin utilization.
- `portfolio_positions`: Current reconciled holdings (`quantity`, `average_cost`).
- `portfolio_constraints`: Risk policy (max_sector_weight, daily_loss_limit).
- `portfolio_snapshots`: Daily EOD snapshots of the portfolio's total value.

### Domain 5: Execution & Trades
- `orders`: The internal intent (`client_order_id`, `idempotency_key`, `status`).
- `executions`: The actual fills received from the broker (price, timestamp, quantity).
- `trade_decisions` (Journal): Logs *why* a trade happened (strategy_id, risk_approval_id, signal_strength).

## 3. Safe Schema Evolution
- The database schema is managed using **Alembic** migrations.
- Migrations must support zero-downtime deployments.
- No dropping columns without a multi-phase deprecation window.

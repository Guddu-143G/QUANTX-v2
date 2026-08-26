# QUANTX API Contract

This document specifies the transition from the legacy API into the new REST + WebSocket structure for the Real-Time Portfolio Intelligence platform.

## 1. REST Endpoints (Historical & Configuration)

All endpoints utilize OpenAPI (Swagger) schema validation via FastAPI.

### Authentication & Users
- `POST /api/v1/auth/login` (Standard / OAuth2)
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `PATCH /api/v1/users/risk-policy` (Update portfolio constraints)

### Broker Integration
- `POST /api/v1/brokers/connect` (Initiate OAuth flow with broker)
- `GET /api/v1/brokers/status` (Check connection health and token expiry)

### Portfolios & Risk
- `GET /api/v1/portfolios/{id}` (Read-only historical snapshot)
- `GET /api/v1/portfolios/{id}/positions`
- `GET /api/v1/risk/metrics` (VaR, CVaR, Beta, Max Drawdown)

### Trading
- `GET /api/v1/orders` (List today's orders)
- `POST /api/v1/orders` (Manual order entry - Must pass Risk Engine)
- `DELETE /api/v1/orders/{id}` (Cancel order)

### Strategies & Backtesting
- `GET /api/v1/strategies` (List available automated strategies)
- `POST /api/v1/backtests/run` (Initiate asynchronous backtest task)

## 2. WebSocket Events (Real-Time Streams)

Real-time UI updates bypass full-page REST polls.

### Connection
- **Endpoint:** `ws://api.domain.com/ws/v1/stream`
- **Authentication:** Validated via HTTP-only secure session cookie upon connection upgrade.

### Published Event Schemas

#### `MarketTickReceived`
```json
{
  "event": "MarketTickReceived",
  "data": {
    "instrument_id": "NSE:RELIANCE",
    "last_price": 1420.50,
    "timestamp": "2026-08-23T09:31:05.123Z"
  }
}
```

#### `OrderStateChanged`
```json
{
  "event": "OrderStateChanged",
  "data": {
    "client_order_id": "req-xyz-123",
    "broker_order_id": "brk-98765",
    "status": "PARTIALLY_FILLED",
    "filled_qty": 50,
    "remaining_qty": 50,
    "average_price": 1419.80
  }
}
```

#### `RiskAlert`
```json
{
  "event": "RiskAlert",
  "data": {
    "severity": "CRITICAL",
    "message": "Daily Loss Limit (1%) breached. Automated trading halted."
  }
}
```

## 3. Idempotency

All POST requests affecting live state (orders, execution commands) MUST contain an `Idempotency-Key` header to prevent duplicate execution during network retries.

# Trading Lifecycle & Execution Management

This document defines the lifecycle of an order within the QUANTX platform. It emphasizes safe state transitions, exception handling, and isolation of simulated trading.

## 1. The Order State Machine

Every order explicitly traverses a defined state machine.

```text
CREATED -> RISK_CHECK -> APPROVED -> SUBMITTED -> ACKNOWLEDGED -> OPEN -> PARTIALLY_FILLED -> FILLED
```

### Alternative Terminal States:
- **REJECTED**: Rejected by the broker or exchange.
- **CANCEL_REQUESTED** -> **CANCELLED**: The user or strategy aborted the order.
- **EXPIRED**: Good-Till-Cancelled or Day orders that expired.
- **FAILED**: Internal QUANTX error before submission.
- **UNKNOWN**: The most dangerous state.

## 2. Managing the UNKNOWN State

If QUANTX loses network connectivity after sending an `ORDER_SUBMIT` API call but before receiving an `ACKNOWLEDGED` response, the order is placed in the **UNKNOWN** state.

**CRITICAL RULE:** Do NOT blindly resubmit an order in the UNKNOWN state.
Instead:
1. Halt further automated orders for that strategy.
2. The ReconciliationService pings the broker to determine the actual state (Did it fill? Is it open? Does it exist?).
3. Only resume operations after state reconciliation.

## 3. Idempotency

Every order command must include a `client_order_id` and an `idempotency_key`. 
If a duplicate request is received, the Execution Engine returns the existing order state rather than submitting a second order. This prevents double execution during network retries.

## 4. Execution Quality Tracking

QUANTX tracks the timestamp of every phase of an order to determine slippage and latency.
- `signal_time` -> `decision_time` -> `submission_time` -> `broker_ack_time` -> `exchange_time` -> `fill_time`

These metrics calculate Implementation Shortfall, allowing the system to determine if a strategy remains profitable after accounting for actual execution costs and latency.

## 5. Walk-Forward Validation & Paper Trading

Before deploying a strategy live:
1. **Backtest**: Run over historical data. (Must include brokerage, STT, exchange charges, slippage).
2. **Walk-Forward Test**: Train on period A, validate on period B, test on period C.
3. **Paper Trading**: Simulate latency, partial fills, rejections, and slippage. Do not assume perfect execution.

**Isolation:** Paper orders follow a physically separate execution path from live orders. They use a separate database namespace and order router to prevent simulated orders from reaching a live broker API.

## 6. Emergency Kill Switch

A highly visible Kill Switch is available on the frontend. It operates in configurable levels:
- **Level 1**: Pause strategy (no new signals).
- **Level 2**: Block new orders.
- **Level 3**: Cancel all pending entry orders.
- **Level 4**: Emergency liquidation (requires explicit configuration/authorization).

Activating the kill switch records a high-priority audit event.

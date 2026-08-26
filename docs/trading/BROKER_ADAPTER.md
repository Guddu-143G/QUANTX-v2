# Broker Adapter Pattern

QUANTX connects to external financial brokers using the Adapter Pattern. This prevents the core execution and strategy engines from being coupled to any specific broker's API quirks or structures.

## 1. Adapter Interface

Every broker adapter must implement a standard asynchronous interface:

```python
class BrokerAdapter:
    async def connect(self):
        """Establish connection and verify credentials."""
        pass

    async def get_account(self):
        """Retrieve cash and margin availability."""
        pass

    async def get_positions(self):
        """Retrieve current broker holdings for reconciliation."""
        pass

    async def get_orders(self):
        """Retrieve the daily order book from the broker."""
        pass

    async def place_order(self, order_intent):
        """Place an order and return the broker's order ID."""
        pass

    async def modify_order(self, order_intent):
        """Modify an existing open order."""
        pass

    async def cancel_order(self, broker_order_id):
        """Cancel an open order."""
        pass

    async def stream_market_data(self, subscriptions):
        """Establish a WebSocket connection for market data."""
        pass
        
    async def stream_order_updates(self):
        """Establish a WebSocket connection for live order/fill updates."""
        pass
```

## 2. Pluggable Architecture

Initial supported adapters will target the Indian securities market:
- **Zerodha (Kite Connect)**
- **Upstox**
- **Angel One**

Strategies and the Risk Engine never reference "Zerodha" or "Upstox." They simply call `ExecutionService.place_order(intent)`. The routing layer delegates the call to the currently authenticated `BrokerAdapter`.

## 3. Real-Time Market Data

- The adapter must utilize the broker's WebSocket feeds, not REST polling.
- Each tick received must be normalized into a standard QUANTX `MarketTick` structure: `instrument_id`, `timestamp`, `exchange_timestamp`, `last_price`, `bid`, `ask`, `volume`.
- A dedicated Heartbeat monitor detects if the WebSocket silently drops or if data goes stale.

## 4. Failure Handling

Broker APIs fail. The adapter must gracefully handle and categorize errors:
- **Rate Limit Errors**: Trigger exponential backoff. Do NOT spam the broker.
- **Authentication Errors**: Trigger token rotation or prompt the user for re-authentication. Halt trading.
- **5xx / Network Timeouts**: Trigger the UNKNOWN order state reconciliation flow (as defined in `TRADING_LIFECYCLE.md`). Do not assume the order failed.
- **Invalid Order Constraints**: Immediately reflect as REJECTED in the internal database, logging the broker's reason code.

# QUANTX Architecture

This document describes the target event-driven architecture for the QUANTX Real-Time Portfolio Intelligence & Algorithmic Trading Platform. 

## 1. High-Level Architecture Overview

QUANTX transitions from a basic request-response CSV analytics tool into an event-driven, streaming application capable of real-time trading and risk management.

### The Closed-Loop Flow

```text
MARKET DATA -> NORMALIZATION -> FEATURE ENGINE -> PORTFOLIO STATE -> SIGNAL ENGINE -> RISK ENGINE -> POSITION SIZING -> ORDER INTENT -> PRE-TRADE RISK CHECK -> EXECUTION ENGINE -> BROKER -> ORDER EVENTS -> RECONCILIATION -> PORTFOLIO STATE
```

**Crucial Safety Boundary:** The Signal Engine (AI/ML or Quantitative Strategies) *never* bypasses the Risk Engine. All signals are merely proposals. The Risk Engine acts as a hard gate.

## 2. Event-Driven Backbone

The system utilizes a pub-sub / stream-processing backbone (e.g., Redis Streams initially, upgradeable to Kafka/Redpanda).

### Core Components
1. **API Gateway (FastAPI)**: Routes REST and WebSocket traffic from the React frontend.
2. **Portfolio Service**: Reconstructs the real-time state of the user's holdings based on broker syncs, cash balances, and executed orders.
3. **Risk Service**: The most critical component. It evaluates every proposed trade, limits exposure, enforces stop-losses, and manages circuit breakers.
4. **Strategy Service**: Houses pluggable algorithmic and ML-based trading strategies. Generates trade signals.
5. **Market Data Service**: Subscribes to broker WebSockets (e.g., Kite Connect, Upstox), normalizes ticks, and publishes them to the event bus.
6. **Execution Service**: The boundary layer communicating with external broker APIs for placing, modifying, and canceling orders.
7. **Reconciliation Service**: Constantly compares QUANTX internal state with the broker's actual state.

## 3. Technology Stack

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **UI Library:** Tailwind CSS, shadcn/ui, Radix UI
- **State Management:** Zustand, TanStack Query
- **Charts:** Lightweight Charts / (or Recharts for static)
- **Communication:** REST for historical/static data; WebSockets for real-time prices, P&L, order updates.

### Backend
- **Framework:** Python 3.12+ with FastAPI (asyncio, httpx)
- **Data Validation:** Pydantic v2
- **Database (OLTP):** PostgreSQL (managed via SQLAlchemy 2 & Alembic)
- **Caching & Event Bus:** Redis
- **Background Jobs:** Celery (or equivalent durable job system)
- **Data Processing:** NumPy, pandas, Polars (for high-speed tabular data)
- **ML & Quants:** scikit-learn, statsmodels, PyTorch

## 4. Production Deployment Topology

The infrastructure targets containerized, horizontally scalable deployments.

```text
Cloud Load Balancer
        ↓
    API Gateway
        ↓
 FastAPI Microservices (Portfolio, Risk, Strategy)
        ↓
      Redis (Event Bus & Cache)
        ↓
    PostgreSQL (Source of Truth)
        ↓
     Workers (Broker Adapters, Analytics)
```

## 5. Security & Isolation

- **Paper Trading vs. Live:** Paper trading execution uses physically isolated execution paths, credentials, and database namespaces.
- **Compliance Boundary:** A strict logical separation between Signal Generation and Broker Execution, governed by the Pre-Trade Risk Engine.
- **Credential Storage:** Broker tokens are stored in an encrypted vault; never exposed to the frontend browser.

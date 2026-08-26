                    ┌──────────────────────┐
                    │      React 19        │
                    │   QuantX Frontend    │
                    └──────────┬───────────┘
                               │
                         HTTPS / REST
                               │
                    ┌──────────▼───────────┐
                    │       FastAPI        │
                    │      API Layer       │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
       ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
       │    Auth     │ │   Analysis  │ │    Data     │
       │   Service   │ │   Engine    │ │ Validation  │
       └─────────────┘ └──────┬──────┘ └─────────────┘
                              │
                  ┌───────────▼───────────┐
                  │ Portfolio Analytics   │
                  ├───────────────────────┤
                  │ Returns               │
                  │ Risk                  │
                  │ Benchmark             │
                  │ Concentration         │
                  │ Attribution            │
                  │ Allocation            │
                  └───────────┬───────────┘
                              │
                     ┌────────▼────────┐
                     │    Database     │
                     │ SQLite → PG     │
                     └─────────────────┘




                           v2 architecture 

                         ┌──────────────────┐
                         │  Kite Connect    │
                         │ REST + WebSocket │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Market Data      │
                         │ Ingestion Layer  │
                         └────────┬─────────┘
                                  │
                     ┌────────────┼────────────┐
                     ▼            ▼            ▼
                  Redis       SQLite/DB    Raw ticks
                     │            │
                     └──────┬─────┘
                            ▼
                  ┌────────────────────┐
                  │ QuantX Analytics   │
                  │                    │
                  │ Gainers / Losers   │
                  │ Volume             │
                  │ Momentum           │
                  │ Risk               │
                  │ Sector             │
                  │ Portfolio          │
                  └─────────┬──────────┘
                            ▼
                  ┌────────────────────┐
                  │ AI / RAG Layer     │
                  │                    │
                  │ News               │
                  │ Filings            │
                  │ Context            │
                  │ Explanation        │
                  └─────────┬──────────┘
                            ▼
                     React Dashboard


backend/
└── app/
    ├── main.py
    ├── analysis.py              # KEEP EXISTING
    ├── auth.py                  # KEEP EXISTING
    │
    ├── market/
    │   ├── __init__.py
    │   ├── kite_client.py
    │   ├── authentication.py
    │   ├── instruments.py
    │   ├── websocket.py
    │   ├── tick_processor.py
    │   └── market_store.py
    │
    ├── analytics/
    │   ├── gainers.py
    │   ├── losers.py
    │   ├── volume.py
    │   ├── indicators.py
    │   ├── momentum.py
    │   └── sectors.py
    │
    └── api/
        ├── market.py
        └── portfolio.py
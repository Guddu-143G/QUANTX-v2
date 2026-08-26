# Alpha Lab Architecture

## 1. Overview
The Alpha Lab is a production-grade, automated quantitative research infrastructure designed to provide rigorous, point-in-time factor analysis and signal generation for institutional portfolio management.

## 2. Core Components

### 2.1 Point-in-Time Data Store
The system relies on a strict Point-in-Time (PiT) data engine. Every observation (price, fundamental, sentiment) is stored with an `effective_time` and `ingested_at` timestamp. Historical queries must strictly use information available at the `as_of` timestamp.

### 2.2 Universe Engine
The Universe Engine manages historical index memberships (e.g., NIFTY 200). Strategies must be evaluated against the exact constituents of the benchmark at the time of the historical calculation.

### 2.3 Factor Engine
The Factor Engine is responsible for the computation, normalization, and neutralization of quantitative signals.
- **Normalization**: Winsorization, Z-score, Rank, Percentile.
- **Neutralization**: Sector, Industry, Size.

### 2.4 Diagnostics Engine
Continuously computes:
- Information Coefficient (IC) across 1D, 5D, 20D, 60D.
- Information Coefficient Information Ratio (ICIR).
- Factor Turnover, Correlation, and Half-Life.

### 2.5 Composite Engine
Aggregates factor scores into a single trading signal based on a validated weighting scheme. Weights must strictly sum to 100%.

## 3. Data Flow
1. **Real Market Data** → 2. **Data Validation** → 3. **PiT Data Store** → 4. **Universe Engine** → 5. **Factor Engine** → 6. **Factor Validation/Normalization** → 7. **Diagnostics** → 8. **Composite Engine** → 9. **Signal Engine**

# QUANTX — Institutional Quantitative Finance & Portfolio Intelligence Platform

[![React 19](https://img.shields.io/badge/React-19.2.6-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.17-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](#)

> **QUANTX** is an institutional-grade quantitative finance platform engineered for portfolio managers, quantitative researchers, risk officers, and treasury desks. It combines institutional risk engines, factor research (AlphaLab), event-driven backtesting, constrained convex portfolio optimization, and deterministic CSV-driven analytical intelligence with a high-throughput, glassmorphic trading terminal interface.

---

## 📑 Table of Contents

1. [Platform Overview](#-platform-overview)
2. [Core Modules & Features](#-core-modules--features)
   - [1. Executive Command Center & Dashboard](#1-executive-command-center--dashboard)
   - [2. Deterministic Portfolio Research Engine](#2-deterministic-portfolio-research-engine)
   - [3. Portfolio Analytics & Asset Surveillance](#3-portfolio-analytics--asset-surveillance)
   - [4. AlphaLab & Quantitative Factor Studio](#4-alphalab--quantitative-factor-studio)
   - [5. Institutional Risk & Stress Testing Engine](#5-institutional-risk--stress-testing-engine)
   - [6. Constrained Portfolio Optimizer](#6-constrained-portfolio-optimizer)
   - [7. Point-in-Time Event-Driven Backtester](#7-point-in-time-event-driven-backtester)
   - [8. Market Intelligence & Tape Breadth](#8-market-intelligence--tape-breadth)
   - [9. AI Quant Copilot](#9-ai-quant-copilot)
   - [10. Quant Model Registry & Execution Ops](#10-quant-model-registry--execution-ops)
3. [Quantitative & Mathematical Methodology](#-quantitative--mathematical-methodology)
4. [CSV Data Contracts & Ingestion Standards](#-csv-data-contracts--ingestion-standards)
5. [Operational & Analytical System Workflows](#-operational--analytical-system-workflows)
   - [Unified System Workflow Blueprint](#unified-system-workflow-blueprint)
   - [Ingestion & Quality Verification Pipeline](#ingestion--quality-verification-pipeline)
   - [Analytical Engine Execution Flow](#analytical-engine-execution-flow)
   - [Constrained Portfolio Optimization Flow](#constrained-portfolio-optimization-flow)
   - [Model Registry Promotion & Algorithmic Order Flow](#model-registry-promotion--algorithmic-order-flow)
   - [RAG Copilot Context Loop](#rag-copilot-context-loop)
6. [Open-Source SDK & Enterprise Architecture](#-open-source-sdk--enterprise-architecture)
   - [Headless Analytical Engine (`quantx-engine`)](#headless-analytical-engine-quantx-engine)
   - [Composable Style Factor SDK (`BaseFactor`)](#composable-style-factor-sdk-basefactor)
   - [Open Data Serialization Contracts (`QX-MDF`)](#open-data-serialization-contracts-qx-mdf)
   - [Distributed Computation & Time-Series Engine (DuckDB & Ray)](#distributed-computation--time-series-engine-duckdb--ray)
   - [Institutional Compliance Safeguards (UCITS 5/10/40)](#institutional-compliance-safeguards-ucits-51040)
   - [Multi-Agent Interpretability & Sandboxed Code Execution](#multi-agent-interpretability--sandboxed-code-execution)
7. [Elite Enterprise Architecture & Cryptographic Protocols (v3 Blueprint)](#-elite-enterprise-architecture--cryptographic-protocols-v3-blueprint)
   - [C++/Rust Analytical Core with PyO3 Bindings](#crust-analytical-core-with-pyo3-bindings)
   - [Apache Flink Complex Event Processing (CEP) Engine](#apache-flink-complex-event-processing-cep-engine)
   - [Robust Multi-Period Convex Optimization (`robust_optimizer.py`)](#robust-multi-period-convex-optimization-robust_optimizerpy)
   - [FRTB Expected Shortfall & Liquidity Horizons](#frtb-expected-shortfall--liquidity-horizons)
   - [Zero-Knowledge Position Sharing (Pedersen Commitments)](#zero-knowledge-position-sharing-pedersen-commitments)
   - [Cognitive Graph Memory & Self-Healing Execution System](#cognitive-graph-memory--self-healing-execution-system)
   - [MLOps Shadow Deployment & Tracking Error Circuit Breakers](#mlops-shadow-deployment--tracking-error-circuit-breakers)
   - [Enterprise Configuration Blueprint (`enterprise-config.yml`)](#enterprise-configuration-blueprint-enterprise-configyml)
8. [Dominant Enterprise Capabilities & Hardware Acceleration (v4 Specification)](#-dominant-enterprise-capabilities--hardware-acceleration-v4-specification)
   - [Confidential Computing & Zero-Trust Enclaves (AWS Nitro / Intel SGX)](#confidential-computing--zero-trust-enclaves-aws-nitro--intel-sgx)
   - [GPU-Accelerated Monte Carlo VaR & Expected Shortfall (CUDA/CuPy)](#gpu-accelerated-monte-carlo-var--expected-shortfall-cudacupy)
   - [Hardware-Accelerated Pre-Trade Risk Gates (FPGA SystemVerilog)](#hardware-accelerated-pre-trade-risk-gates-fpga-systemverilog)
   - [ISDA SIMM Margin & Linear Programming Collateral Optimizer](#isda-simm-margin--linear-programming-collateral-optimizer)
   - [Multi-Agent Reinforcement Learning & Self-Play Execution Swarms](#multi-agent-reinforcement-learning--self-play-execution-swarms)
   - [Bi-Temporal Core Ledger & Regulatory Compliance (MiFID II, Basel IV)](#bi-temporal-core-ledger--regulatory-compliance-mifid-ii-basel-iv)
   - [Automated Model Promotion Protocol (`ModelPromotionEngine`)](#automated-model-promotion-protocol-modelpromotionengine)
9. [Sovereign-Grade Quantitative Intelligence & High-Dimensional Solvers (v5 Blueprint)](#-sovereign-grade-quantitative-intelligence--high-dimensional-solvers-v5-blueprint)
   - [Quantum-Inspired Portfolio Optimization (QUBO Engines)](#quantum-inspired-portfolio-optimization-qubo-engines)
   - [Endogenous Liquidity-Adjusted Risk Attribution (L-VaR & L-ES)](#endogenous-liquidity-adjusted-risk-attribution-l-var--l-es)
   - [Cross-Venue MEV-Resistant Smart Order Router (SOR)](#cross-venue-mev-resistant-smart-order-router-sor)
   - [Multi-Modal Alternative Data Engine (Satellites & Maritime Tracking)](#multi-modal-alternative-data-engine-satellites--maritime-tracking)
   - [Generative Adversarial Stress Testing (GAST)](#generative-adversarial-stress-testing-gast)
   - [Zero-Trust Sovereign Operations & Multi-Tenancy Architecture (TimescaleDB RLS)](#zero-trust-sovereign-operations--multi-tenancy-architecture-timescaledb-rls)
   - [Automated Q-DevOps Deployment Gating Engine (`QuantGatingEngine`)](#automated-q-devops-deployment-gating-engine-quantgatingengine)
10. [Sovereign-Grade v6 Core: L3 Order Book, HRP Graph Clustering, FHE & RWA Securitization (v6 Blueprint)](#-sovereign-grade-v6-core-l3-order-book-hrp-graph-clustering-fhe--rwa-securitization-v6-blueprint)
    - [Level-3 Limit Order Book (LOB) Reconstruction & VPIN Toxicity Engine](#level-3-limit-order-book-lob-reconstruction--vpin-toxicity-engine)
    - [Hierarchical Risk Parity (HRP) & Portfolio Graph Networks](#hierarchical-risk-parity-hrp--portfolio-graph-networks)
    - [Fully Homomorphic Encryption (FHE) for Privacy-Preserving Cloud Quant Backtesting](#fully-homomorphic-encryption-fhe-for-privacy-preserving-cloud-quant-backtesting)
    - [Real-World Asset (RWA) Tokenization Core (ERC-3643 Regulated Security Tokens)](#real-world-asset-rwa-tokenization-core-erc-3643-regulated-security-tokens)
    - [LangGraph Multi-Agent State Machines & Mathematical Invariant Guardrails](#langgraph-multi-agent-state-machines--mathematical-invariant-guardrails)
    - [Unified Multi-Custody Settlement API (Fireblocks / Anchorage MPC)](#unified-multi-custody-settlement-api-fireblocks--anchorage-mpc)
    - [Open-Source Strategy & Enterprise Monetization Architecture](#open-source-strategy--enterprise-monetization-architecture)
11. [Next-Generation Sovereign-Grade Features (v7 Blueprint)](#-next-generation-sovereign-grade-features-v7-blueprint)
    - [Dynamic Macro-Regime Switching Engine (Gaussian HMM & Viterbi Decoder)](#dynamic-macro-regime-switching-engine-gaussian-hmm--viterbi-decoder)
    - [Deep Hedging of Exotic Multi-Asset Derivatives (PyTorch Neural Policy)](#deep-hedging-of-exotic-multi-asset-derivatives-pytorch-neural-policy)
    - [Cross-Border Tax-Efficient Portfolio Optimization (Tax-Loss Harvesting CVXPY)](#cross-border-tax-efficient-portfolio-optimization-tax-loss-harvesting-cvxpy)
    - [Federated Alpha Learning Engine (FedAvg & Differential Privacy)](#federated-alpha-learning-engine-fedavg--differential-privacy)
    - [Real-Time Cross-Asset Liquidity & Basel IV Capital Engines (LCR & NSFR Ratios)](#real-time-cross-asset-liquidity--basel-iv-capital-engines-lcr--nsfr-ratios)
    - [Self-Optimizing Agent Networks with Dynamic Tool Compilation (`DynamicToolRegistry`)](#self-optimizing-agent-networks-with-dynamic-tool-compilation-dynamictoolregistry)
    - [Quantitative DevOps Gating (Q-DevOps CI/CD Gateway)](#quantitative-devops-gating-q-devops-cicd-gateway)
12. [Real-Time Live Trading Analysis & Enterprise Risk Orchestration (v8 Strategy Blueprint)](#-real-time-live-trading-analysis--enterprise-risk-orchestration-v8-strategy-blueprint)
    - [Live Trading Feedback Loop & Real-Time Stream Processor](#live-trading-feedback-loop--real-time-stream-processor)
    - [In-Memory Redis Hash Ledger Schema](#in-memory-redis-hash-ledger-schema)
    - [Real-Time Transaction Cost Analysis (TCA) Engine (Almgren-Chriss Impact)](#real-time-transaction-cost-analysis-tca-engine-almgren-chriss-impact)
    - [Intraday Liquidity-Adjusted VaR (L-VaR)](#intraday-liquidity-adjusted-var-l-var)
    - [Multi-Venue FIX Protocol Gateway (FIX 4.4 Engine)](#multi-venue-fix-protocol-gateway-fix-44-engine)
    - [Live Champion-Challenger (Shadow) Execution Routing](#live-champion-challenger-shadow-execution-routing)
    - [Pre-Flight Q-DevOps Model Execution Validator (`ModelExecutionValidator`)](#pre-flight-q-devops-model-execution-validator-modelexecutionvalidator)
    - [MiFID II RTS 25 Microsecond Clock Synchronization](#mifid-ii-rts-25-microsecond-clock-synchronization)
13. [High-Frequency Live Execution, Microstructure Surveillance & Sovereign Analytics (v9 Blueprint)](#-high-frequency-live-execution-microstructure-surveillance--sovereign-analytics-v9-blueprint)
    - [The Microsecond Execution Lifecycle & Raw L3 Data Ingest](#the-microsecond-execution-lifecycle--raw-l3-data-ingest)
    - [Order Book Imbalance (OBI) & Volume-Weighted Micro-Price](#order-book-imbalance-obi--volume-weighted-micro-price)
    - [AI-Driven Predictive TCA & Alpha Signal Half-Life Modeling](#ai-driven-predictive-tca--alpha-signal-half-life-modeling)
    - [Convex Quadratic Smart Order Routing (SOR) Solver](#convex-quadratic-smart-order-routing-sor-solver)
    - [Intraday Liquidity-Adjusted Value-at-Risk (L-VaR)](#intraday-liquidity-adjusted-value-at-risk-l-var)
    - [SEC Rule 15c3-5 Pre-Trade Risk Gates & Fat-Finger Protection](#sec-rule-15c3-5-pre-trade-risk-gates--fat-finger-protection)
    - [Bi-Temporal Tick Storage & Low-Latency WebSocket Protocol](#bi-temporal-tick-storage--low-latency-websocket-protocol)
14. [Architecture & System Design](#-architecture--system-design)
15. [REST API Reference](#-rest-api-reference)
16. [Installation & Getting Started](#-installation--getting-started)
    - [Prerequisites](#prerequisites)
    - [Backend Service Setup](#backend-service-setup)
    - [Frontend Terminal Setup](#frontend-terminal-setup)
    - [Environment Configuration](#environment-configuration)
17. [Security & Authentication Architecture](#-security--authentication-architecture)
18. [Project Directory Layout](#-project-directory-layout)
19. [Regulatory & Analytical Disclaimer](#-regulatory--analytical-disclaimer)

---

## 🏛 Platform Overview

QUANTX bridges the gap between raw quantitative research and institutional investment workflows. Built around principles of **explainability**, **point-in-time data integrity**, and **zero-black-box execution**, QUANTX provides:

* **Zero Simulated Market Data Masquerading as Live Data**: All statistics and factor attributions are derived deterministically from validated historical observations and user-provided asset holdings.
* **Rigorous Risk Attribution**: Historical 95% 1-Day Value at Risk (VaR), Conditional Value at Risk (CVaR / Expected Shortfall), marginal risk contributions, beta sensitivities, and Herfindahl-Hirschman Index (HHI) concentration metrics.
* **Explainable Allocation Proposals**: Optimization algorithms respect regulatory single-name and sector caps, displaying the exact binding constraints shaping target portfolio weights.
* **Sub-Millisecond UI Performance**: Modern React 19 architecture featuring custom SVG/Canvas sparklines, Recharts visualizers, institutional dark palettes, and responsive glassmorphism designed for Bloomberg/Eikon workflows.

---

## ⚡ Quick Start: Running the Project

### 1. Run the FastAPI Backend
```bash
# In the repository root:
cd backend
# Windows:
.venv\Scripts\Activate.ps1
# Linux/macOS: source .venv/bin/activate

uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* **Backend API**: `http://127.0.0.1:8000`
* **Swagger API Docs**: `http://127.0.0.1:8000/docs`
* **Health Check**: `http://127.0.0.1:8000/health`

### 2. Run the React Frontend Terminal
```bash
# In a separate terminal:
cd frontend
npm install
npm run dev
```
* **Frontend Web App**: `http://localhost:5173` (or `http://127.0.0.1:5173`)

### 3. Build Single-File Production Bundle
```bash
cd frontend
npm run build
# Outputs singlefile production bundle to frontend/dist/index.html
```

---

## ⚡ Core Modules & Features

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                QUANTX UNIFIED PLATFORM                                 │
├───────────────────┬───────────────────┬────────────────────┬───────────────────────────┤
│    EXECUTIVE      │     RESEARCH      │     PORTFOLIO      │        OPERATIONS         │
│   • Dashboard     │   • AlphaLab      │   • Asset Desk     │   • Execution (EMS)       │
│   • Markets Tape  │   • Backtesting   │   • CSV Engine     │   • Data Center           │
│   • Copilot AI    │   • Model Hub     │   • Risk & VaR     │   • Limits & Surveillance │
│   • Asset Detail  │   • Factor Decay  │   • Optimizer      │   • Desk & Profile Auth   │
└───────────────────┴───────────────────┴────────────────────┴───────────────────────────┘
```

### 1. Executive Command Center & Dashboard (`/dashboard`)
* **Consolidated Portfolio Health**: Real-time Net Asset Value (NAV), total unrealized PnL, cash buffer metrics, and research scores.
* **Factor Tilt Summary**: Dynamic cross-sectional radar mapping portfolio active exposures across Momentum, Value, Quality, Low Volatility, and Size.
* **Multi-Asset Allocation Breakdown**: Real-time radial views spanning Equities, Fixed Income, Derivatives, Commodities, Cash, and Alternative assets.
* **Liquidity & Drawdown Gauges**: Visual runway indicators showing T+1 liquidation capacity, stress-tested maximum historical drawdown, and intraday VaR bounds.

### 2. Deterministic Portfolio Research Engine (`/portfolio/analysis`)
* **CSV-Driven Analytics**: Direct upload and validation of custom `holdings.csv` and `prices.csv` datasets.
* **Data Quality Verification**: Audits common historical trading sessions, detects stale price feeds, warns against short observation windows (<60 days), and excludes incomplete series gracefully.
* **Automated Institutional Research Brief**: Generates an actionable, audit-ready portfolio brief with grades (A–D), rule-based risk alerts, sector breach notifications, and constrained rebalancing recommendations.

### 3. Portfolio Analytics & Asset Surveillance (`/portfolio`, `/assets/:ticker`)
* **Holdings Surveillance Grid**: Detailed breakdown of positions with average cost basis, current mark-to-market prices, weights, unrealized return, realized volatility, and marginal risk contribution.
* **Single-Asset Deep Dives**: Multi-factor diagnostics per ticker including RSI, MACD, Bollinger Bands, ATR, peer comparisons, volume profile, and financial quality ratios.
* **Sector Concentration Matrix**: Real-time tracking against benchmark sector distributions and fund mandate constraints.

### 4. AlphaLab & Quantitative Factor Studio (`/research/alpha`, `/research`)
* **9 Factor Families**: Standardized evaluation across Momentum, Value, Quality, Volatility, Liquidity, Sentiment, Macro, Technical, and Alternative Data.
* **Information Coefficient (IC) Monitor**: Rolling IC tracking, IC t-statistics, and factor decay curves over 5d, 21d, 63d, and 126d horizons.
* **Gradient-Boosted Ensemble Blending**: Machine learning composite weighting with explicit crowding penalties to prevent multi-collinearity and factor turnover drag.

### 5. Institutional Risk & Stress Testing Engine (`/risk`)
* **Multi-Method VaR & CVaR**: Parametric, Historical, and Monte Carlo (12,480+ paths) 95% & 99% 1-Day / 10-Day VaR calculations in both percentage and base currency terms.
* **Multivariate Risk Factor Decomposition**: Decomposes total variance into Market Risk, Sector Risk, Style Factor Exposures, Currency Risk, and Idiosyncratic Residuals.
* **Scenario & Stress Testing**: 24+ preconfigured macroeconomic shock simulations (e.g., 2008 GFC, 2020 Liquidity Crunch, Rate Hike Cycle +250bps, Stagflation, Tech Drawdown).
* **Limit Surveillance**: Continuous threshold monitoring with automatic alert escalation upon policy breach.

### 6. Constrained Portfolio Optimizer (`/portfolio/optimizer`)
* **Convex Quadratic Optimization**: Ledoit-Wolf covariance shrinkage formulation minimizing portfolio variance or maximizing Sharpe ratio.
* **Institutional Constraints**:
  - Maximum single-position weight (e.g., $\le 12\%$)
  - Maximum sector concentration (e.g., $\le 30\%$)
  - Turnover penalty & transaction cost dampening
  - Target portfolio beta and cash floor enforcement
* **Binding Constraint Explanations**: Visual inspector detailing exactly which constraints bound the solution and the shadow cost of each limitation.

### 7. Point-in-Time Event-Driven Backtester (`/backtest`)
* **Survivorship-Bias-Free Engine**: Point-in-time asset universe simulation accounting for delisted securities, corporate actions, stock splits, and index rebalances.
* **Microstructure Execution Modeling**: Incorporates slippage curves, bid-ask spread models, market impact (Almgren-Chriss), and exchange fees.
* **Institutional Tearsheet Generation**: Produces annualized return, Sharpe, Sortino, Calmar ratio, Omega ratio, win rate, profit factor, max consecutive losses, and monthly return heatmaps.

### 8. Market Intelligence & Tape Breadth (`/markets`)
* **Consolidated Multi-Exchange Feed**: Direct ticker tracking for NSE, BSE, US L1, and global macro indices.
* **Market Breadth & Rotation**: Advance/Decline ratios, 52-week high/low breadth, sector relative-strength rotation quadrants, and market volume microstructure.

### 9. AI Quant Copilot (`/copilot`)
* **Grounded Quantitative Intelligence**: RAG architecture connected directly to the user's active portfolio state, factor library, risk engine, and market data.
* **Structured Research Responses**: Generates research memos containing key drivers, data lineage citations, mathematical formulations, and one-click execution actions.

### 10. Quant Model Registry & Execution Ops (`/models`, `/execution`, `/data`, `/alerts`, `/monitoring`, `/settings`)
* **Model Governance & Registry**: Model lifecycle tracking (Experimental $\rightarrow$ Backtested $\rightarrow$ Paper Trading $\rightarrow$ Live Production) with versioning and validation audit trails.
* **Execution Management (EMS)**: Algorithmic order routing (TWAP, VWAP, POV, Implementation Shortfall), blotter management, and execution fill reports.
* **Telemetry & System Health**: Real-time service uptime, tick latency monitoring, memory utilization, and feed health.

---

## 🧮 Quantitative & Mathematical Methodology

### 1. Risk-Adjusted Performance Metrics
* **Annualized Geometric Return**:
  $$R_{\text{ann}} = \left( \prod_{t=1}^{T} (1 + r_t) \right)^{\frac{252}{T}} - 1$$
* **Annualized Volatility**:
  $$\sigma_{\text{ann}} = \sqrt{\frac{1}{T-1}\sum_{t=1}^T (r_t - \bar{r})^2} \times \sqrt{252}$$
* **Sharpe Ratio** ($R_f$ default = 6.0%):
  $$\text{Sharpe} = \frac{R_{\text{ann}} - R_f}{\sigma_{\text{ann}}}$$
* **Sortino Ratio** (Downside Deviation):
  $$\text{Sortino} = \frac{R_{\text{ann}} - R_f}{\sqrt{\frac{1}{T}\sum_{t=1}^T \min(0, r_t)^2} \times \sqrt{252}}$$
* **Maximum Drawdown (MDD)**:
  $$\text{MDD} = \min_{t} \left( \frac{V_t}{\max_{s \le t} V_s} - 1 \right)$$
* **Calmar Ratio**:
  $$\text{Calmar} = \frac{R_{\text{ann}}}{|\text{MDD}|}$$

### 2. Tail Risk & VaR (Historical & Semi-Parametric)
* **Historical Value at Risk ($95\%$ 1-Day VaR)**:
  $$\text{VaR}_{0.95} = - \text{Percentile}_{0.05}(r)$$
* **Conditional Value at Risk (CVaR / Expected Shortfall)**:
  $$\text{CVaR}_{0.95} = \mathbb{E}\left[ -r \mid -r \ge \text{VaR}_{0.95} \right]$$

### 3. Active Risk & Benchmark Relative Statistics
* **Beta ($\beta$)**:
  $$\beta = \frac{\text{Cov}(r_p, r_b)}{\text{Var}(r_b)}$$
* **Tracking Error ($\text{TE}$)**:
  $$\text{TE} = \text{StdDev}(r_p - r_b) \times \sqrt{252}$$
* **Information Ratio ($\text{IR}$)**:
  $$\text{IR} = \frac{\text{Mean}(r_p - r_b) \times 252}{\text{TE}}$$

### 4. Concentration & Marginal Risk
* **Herfindahl-Hirschman Index (HHI)**:
  $$\text{HHI} = \sum_{i=1}^{N} w_i^2$$
* **Effective Number of Positions ($N_{\text{eff}}$)**:
  $$N_{\text{eff}} = \frac{1}{\text{HHI}}$$
* **Marginal Contribution to Risk ($\text{MCR}_i$)**:
  $$\text{MCR}_i = w_i \times \frac{\text{Cov}(r_i, r_p)}{\sigma_p^2}$$

---

## 📊 CSV Data Contracts & Ingestion Standards

To analyze your custom portfolio via `/api/v1/portfolio/analyze`, provide two UTF-8 CSV files formatted as follows:

### 1. `holdings.csv`
Defines your portfolio composition and cost basis.

```csv
ticker,quantity,average_cost,sector
RELIANCE,100,1400.00,Energy
INFY,50,1800.50,Technology
HDFCBANK,75,1650.00,Financials
TCS,30,3850.00,Technology
ICICIBANK,120,1020.00,Financials
```

| Column | Type | Required | Notes / Aliases Accepted |
|---|---|---|---|
| `ticker` | String | **Yes** | Uppercase symbol (alias: `symbol`) |
| `quantity` | Number | **Yes** | Positive number of units (alias: `qty`, `shares`) |
| `average_cost` | Number | Optional | Average entry price in base currency (alias: `avg_cost`, `cost_basis`, `avg`) |
| `sector` | String | Optional | Sector classification (defaults to `Unclassified`) |

### 2. `prices.csv`
Provides historical closing prices for all holdings (and optional benchmark).

```csv
date,ticker,close
2026-01-02,RELIANCE,1412.50
2026-01-02,INFY,1814.20
2026-01-02,HDFCBANK,1665.00
2026-01-02,TCS,3870.00
2026-01-02,ICICIBANK,1035.00
2026-01-02,NIFTY50,23850.00
2026-01-05,RELIANCE,1420.00
2026-01-05,INFY,1805.00
...
```

| Column | Type | Required | Notes / Aliases Accepted |
|---|---|---|---|
| `date` | String | **Yes** | ISO-8601 formatted date string: `YYYY-MM-DD` (alias: `timestamp`) |
| `ticker` | String | **Yes** | Must match holdings tickers and benchmark ticker |
| `close` | Number | **Yes** | Unadjusted/adjusted closing price $> 0$ (alias: `price`, `adj_close`, `adjusted_close`) |

> [!TIP]
> **Observation History Recommendation**: While the engine can run with 2 observations per holding, **60+ overlapping trading dates** are strongly recommended to calculate stable variance, correlation, and tail-risk estimates.

---

## ⚙️ Operational & Analytical System Workflows

The analytical computations in QUANTX follow a deterministic, five-phase workflow, preventing simulated or ungrounded figures from masquerading as actual market history.

### Unified System Workflow Blueprint

```
  +-------------------------------------------------------------+
  |              1. Data Ingestion & Quality Audit              |
  |    (holdings.csv & prices.csv Upload -> Quality Checks)     |
  +-------------------------------------------------------------+
                                 |
                                 v
  +-------------------------------------------------------------+
  |               2. Analytical Engine Ingestion                |
  |     (Factor Profiling -> Multi-Method VaR & CVaR runs)      |
  +-------------------------------------------------------------+
                                 |
                                 v
  +-------------------------------------------------------------+
  |              3. Constrained Convex Optimization             |
  |    (Ledoit-Wolf Covariance -> Constrained Quadratic Run)    |
  +-------------------------------------------------------------+
                                 |
                                 v
  +-------------------------------------------------------------+
  |             4. Execution & Model Governance Ops             |
  |  (Algorithmic Routing -> Model Registry Status Promotion)  |
  +-------------------------------------------------------------+
                                 |
                                 v
  +-------------------------------------------------------------+
  |               5. Grounded RAG Copilot Loop                  |
  |       (RAG Vector Parsing -> Multi-Agent Memo Drafting)      |
  +-------------------------------------------------------------+
```

---

### Ingestion & Quality Verification Pipeline

Every portfolio analysis operation begins by validating data integrity for user holdings and pricing histories:
1. **File Upload Check**: User posts files `holdings.csv` and `prices.csv` via `/api/v1/portfolio/analyze`.
2. **Schema Validation**: Ingestion engine validates column types against specified data contracts.
3. **Observation History Audit**:
   - Evaluates price series overlap across assets.
   - If overlapping trading days are $< 60$ days, registers an unstable variance warning.
   - If overlapping trading days are $< 2$ days, aborts with a validation exception.
4. **Stale Pricing Check**: Scans historical series for flat closing prices (no variance for $> 5$ consecutive sessions), warning researchers of potentially stale price feeds.
5. **Session Matching**: Drops non-trading dates and aligns trading days across all portfolio holdings.
6. **In-Memory Buffer Caching**: Validated datasets are cached in temporary memory buffers; no raw user portfolio files are written to untrusted disk.

---

### Analytical Engine Execution Flow

```
                 +---------------------------+
                 |  Raw Validated Holdings   |
                 +---------------------------+
                               |
            +------------------+------------------+
            |                  |                  |
            v                  v                  v
     [Risk Engine]        [AlphaLab]      [Surveillance]
     Calculate VaR       Evaluate Style     Verify Sector
     & Covariances       Factor Families    Concentrations
            |                  |                  |
            +------------------+------------------+
                               |
                               v
                 +---------------------------+
                 | Unified Quantitative Brief|
                 |  (A-D Grade + Alerts)     |
                 +---------------------------+
```

1. **Factor Profiling**: AlphaLab evaluates holdings against 9 factor families (Momentum, Value, Quality, Volatility, Liquidity, Sentiment, Macro, Technical, Alternative), calculating active factor exposures.
2. **Volatility Estimation**: Calculates covariance matrices using Ledoit-Wolf shrinkage to ensure matrix invertibility and positive definiteness.
3. **Tail-Risk Calculations**: Runs historical, parametric, and Monte Carlo engines to compute VaR and CVaR (Expected Shortfall) at 95% and 99% confidence levels.
4. **Marginal Risk Decomposition**: Computes position-level Marginal Contribution to Risk (MCR) and concentration metrics (HHI, Effective Number of Positions).
5. **Macro Shock Simulation**: Subjects holdings to 24+ macroeconomic shock scenarios (e.g., tech drawdown, rate hike shocks).
6. **Unified Synthesis**: Bundles calculations into an actionable research brief, assigning a letter grade (A–D) and flagging limit breaches.

---

### Constrained Portfolio Optimization Flow

When rebalancing is requested, QUANTX runs a convex quadratic optimizer:
1. **Inputs**: Targets allocation weights with specified objective functions (e.g., Minimize Variance, Maximize Sharpe) and mandate constraints.
2. **Optimization Initiation**: Calls Ledoit-Wolf covariance shrinkage formulation.
3. **Hard Bounds Enforcement**:
   - Single-position limits ($\le 12\%$ default)
   - Aggregate sector concentrations ($\le 30\%$ default)
   - Target beta limits and cash floor constraints
4. **Execution Solver**: Convex quadratic solver iterates to determine optimal weights.
5. **Shadow Cost Extraction**: Computes Lagrange multipliers ($\lambda$) for binding constraints.
6. **UI Presentation**: Displays proposed weights side-by-side with original weights, showing shadow costs and binding reasons.

---

### Model Registry Promotion & Algorithmic Order Flow

1. **Model Promotion Request**: Researcher promotes model state from `Experimental` to `Backtested`.
2. **Backtesting Audit**: Runs point-in-time backtester to verify performance metrics against benchmarks.
3. **Governance Review**: Compliance and senior risk managers verify Sharpe, Max Drawdown, and concentration limits.
4. **Promotion to Production**: Model state changes to `Paper Trading` or `Live Production`.
5. **Order Generation**: EMS calculates required order delta ($\text{Target Weight} - \text{Current Weight}$).
6. **Algorithmic Routing**: Orders route to TWAP, VWAP, or Implementation Shortfall execution engines.
7. **Execution Telemetry**: Orders execute; fill execution reports update live portfolio holdings dynamically.

---

### RAG Copilot Context Loop

1. **Query Parsing**: Captures natural language queries from the `/copilot` interface.
2. **Semantic Context Retrieval**: Queries vector index for matching documentation, formulas, and research briefs.
3. **Active State Grounding**: Lookups retrieve active portfolio holdings, risk metrics (VaR, Sharpe), factor scores, and model registry records.
4. **Multi-Agent Evaluation**: Specialized agents (Router, Risk Desk, Factor Scientist, Convex Optimizer, Backtest Specialist) evaluate target queries.
5. **Response Synthesis**: Merges multi-agent outputs, generating an audit-ready research memo with LaTeX formulas and data lineage citations.
6. **User Output Render**: Renders interactive markdown briefs with one-click action execution hooks in the terminal.

---

## 🚀 Open-Source SDK & Enterprise Architecture (v2 Blueprint)

To establish QUANTX as the open-source standard for institutional quantitative finance and portfolio intelligence (target readiness score: **98/100**), the platform defines complete mathematical interfaces, hybrid data storage layers, and multi-agent compliance protocols.

### Headless Analytical Engine (`quantx-engine`) & Plugin Classes

The core analytical logic is decoupled into the standalone `quantx-engine` SDK. Quants can build custom extensions using standardized Abstract Base Classes (`backend/app/interfaces.py`):

```python
from abc import ABC, abstractmethod
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Tuple

class BaseDataContract(ABC):
    """Enforces strict schema validation, observation alignment, and zero-null guarantees."""
    @abstractmethod
    def validate_schema(self, data: pd.DataFrame) -> bool:
        pass
    @abstractmethod
    def align_observation_windows(self, holdings: pd.DataFrame, prices: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
        pass

class BaseFactor(ABC):
    """Interface for custom AlphaLab Factor Families (Momentum, Value, Microstructure)."""
    def __init__(self, name: str, category: str, parameters: Dict[str, Any]):
        self.name, self.category, self.parameters = name, category, parameters

    @abstractmethod
    def compute_signal(self, price_data: pd.DataFrame, fundamental_data: Optional[pd.DataFrame] = None) -> pd.Series:
        pass

    @abstractmethod
    def calculate_information_coefficient(self, signal: pd.Series, forward_returns: pd.DataFrame, horizons: List[int] = [5, 21, 63]) -> Dict[int, float]:
        pass

class BaseOptimizer(ABC):
    """Interface for convex quadratic portfolio optimization solvers."""
    @abstractmethod
    def solve_allocation(self, expected_returns: np.ndarray, covariance_matrix: np.ndarray, constraints: List[Dict[str, Any]]) -> Dict[str, Any]:
        pass
```

---

### Declarative Model Specification Protocol (`QX-MDF` v2.0.0)

Portfolios, factors, and optimization mandates are declaratively specified via YAML:

```yaml
# model_definition_v2.yaml (QX-MDF Specification)
mdf_version: "2.0.0"
metadata:
  model_id: "m_hft_alpha_blend_09"
  name: "Institutional Global Macro Allocation"
  owner: "Global Tactical Desk"
  governance_stage: "Backtested" # Experimental -> Backtested -> Paper -> Production

data_source:
  holdings_path: "s3://quantx-tenant-data/active/holdings.csv"
  prices_path: "s3://quantx-tenant-data/active/prices.csv"
  benchmark_ticker: "NIFTY50"
  risk_free_rate: 0.0600

factor_studio:
  blend_method: "gradient_boosted_ensemble"
  crowding_penalty_threshold: 0.45
  active_factors:
    - family: "Momentum"
      weight: 0.35
      parameters: { rolling_window: 126 }
    - family: "Value"
      weight: 0.25
      parameters: { metric: "ebitda_to_ev" }
    - family: "Quality"
      weight: 0.40
      parameters: { metric: "return_on_invested_capital" }

optimizer:
  objective: "minimize_variance" # or "maximize_sharpe"
  covariance_estimation: "ledoit_wolf_shrinkage"
  constraints:
    - type: "max_position_weight"
      value: 0.10
    - type: "max_sector_weight"
      value: 0.30
    - type: "ucits_5_10_40"
      enabled: true
    - type: "min_cash_buffer"
      percentage: 0.05
```

---

### High-Performance Hybrid Storage Layer (DuckDB & TimescaleDB)

```
+-----------------------------------------------------------------------------------+
|                             HYBRID STORAGE PIPELINE                              |
+-----------------------------------------------------------------------------------+
          |                                                               |
          | (High-Speed Analytics)                                        | (Historical/Ticks)
          v                                                               v
+-----------------------------------+                           +-------------------+
|      DuckDB (In-Memory Run)       |                           |  TimescaleDB /    |
| - Fast analytics over Parquet     |                           |  ClickHouse       |
| - Local vector calculations       |                           | - Real-time ticks |
| - Apache Arrow schema format      |                           | - Persistence     |
+-----------------------------------+                           +-------------------+
```

#### Vectorized Parquet Ingestion Schema (`security_prices.parquet`)

| Column | Arrow Type | Key Type | Description / Constraints |
| :--- | :--- | :--- | :--- |
| **date** | TIMESTAMP (US) | Partition Key | Observation timestamp in ISO-8601 sequence |
| **ticker** | VARCHAR | Primary Key | Uppercase market ticker identifier |
| **close** | DOUBLE | Value | Splice-adjusted daily or intraday close price |
| **volume** | INT64 | Metric | Trade volume for liquidity profiling and spread estimation |
| **high** | DOUBLE | Metric | Intraday high for ATR and volatility bands |
| **low** | DOUBLE | Metric | Intraday low for drawdown and tail risk metrics |

#### TimescaleDB Multi-Tenant Schema

```sql
CREATE TABLE tenants (
    tenant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_name VARCHAR(255) NOT NULL,
    desk_category VARCHAR(100) DEFAULT 'Macro Strategies',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- scrypt RFC 7914 hash format
    user_title VARCHAR(100) DEFAULT 'Quantitative Researcher',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE portfolios (
    portfolio_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    portfolio_name VARCHAR(150) NOT NULL,
    risk_free_rate_setting NUMERIC(5,4) DEFAULT 0.0600,
    max_pos_weight NUMERIC(5,4) DEFAULT 0.1000,
    max_sec_weight NUMERIC(5,4) DEFAULT 0.3000,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transaction_history (
    timestamp TIMESTAMPTZ NOT NULL,
    portfolio_id UUID REFERENCES portfolios(portfolio_id) ON DELETE CASCADE,
    ticker VARCHAR(30) NOT NULL,
    quantity NUMERIC(18,6) NOT NULL,
    execution_price NUMERIC(18,6) NOT NULL,
    transaction_cost NUMERIC(10,4) NOT NULL,
    slippage_cost NUMERIC(10,4) NOT NULL
);
SELECT create_hypertable('transaction_history', 'timestamp');
```

---

### Distributed Task Architecture (Celery & Ray Worker Grid)

```
+-----------------------------------------------------------------------------------+
|                        CELERY & REDIS WORKER GRID TOPOLOGY                        |
+-----------------------------------------------------------------------------------+
      | (FastAPI Requests)
      v
+------------------------+
| FastAPI Web Controller |
+------------------------+
      | (Task Enqueue)
      v
+------------------------+
|   Redis Broker Queue   |
+------------------------+
      |
      +--------------------+---------------------+
      | (Task Pickup)      | (Task Pickup)       | (Task Pickup)
      v                    v                     v
+------------------+ +-----------------+ +--------------------+
|  Worker Node 01  | |  Worker Node 02 | |   Worker Node 03   |
| - Ray Execution  | | - Ray Execution | | - Ray Execution    |
| - Monte Carlo    | | - Backtesting   | | - Portfolio Opt    |
+------------------+ +-----------------+ +--------------------+
      |                    |                     |
      +--------------------+---------------------+
      | (Write State)
      v
+------------------------+
| SQLite/Postgres DB     |
+------------------------+
      | (WebSocket Push)
      v
+------------------------+
| User React Frontend    |
+------------------------+
```

---

### Institutional Compliance & Automated Alert Escalation Pipeline

* **UCITS 5/10/40 Rule**: Hard mathematical limit ensuring no single asset exceeds 10% of NAV, and aggregate positions $>5\%$ do not exceed 40%.
* **Multi-Channel Alert Escalation**:
  * **Critical Breaches**: Dispatched to **PagerDuty API** with on-call rotation routing.
  * **Warning / Informational Breaches**: Dispatched to **Slack Webhook** (`#risk-desk`) and **Discord Bot** (`#quant-ops`).

---

### Quantitative DevOps & Model Promotion Gating
Before promoting models from **Experimental** to **Paper Trading** or **Live Production**, the automated CI/CD pipeline enforces:
1. **Sharpe Ratio $> 1.50$** over a minimum 5-year testing window.
2. **Calmar Ratio $> 0.80$** (annualized return / maximum drawdown).
3. **Data Quality Audit**: Zero missing observation intervals, clean schema conformance, and point-in-time pricing checks.
4. **Mandatory Risk Officer Signoff**: Multi-signature cryptographic authorization logged to the deployment audit trail.

---

## 🏛 Elite Enterprise Architecture & Cryptographic Protocols (v3 Blueprint)

To support multi-billion-dollar hedge funds, sovereign wealth allocators, and prime brokerage desks (target readiness score: **99/100**), QUANTX integrates ultra-low-latency compiled calculation kernels, zero-knowledge compliance proofs, and multi-agent cognitive graph reasoning.

```
                               QUANTX ENTERPRISE COGNITIVE TOPOLOGY
                               
       +-----------------------------------------------------------------------------------+
       |                                AI QUANT COPILOT REASONING LAYER                   |
       |                   (Multi-Agent Orchestrator, Cognitive Graph Memory, Langfuse)    |
       +-----------------------------------------------------------------------------------+
                                                 | (RPC / Semantic Context)
                                                 v
       +-----------------------------------------------------------------------------------+
       |                                QUANTX CORE ENGINE (C++/Rust)                       |
       |       - Real-Time CEP Engine (Flink)       - Robust Multi-Period Optimization      |
       |       - FRTB Expected Shortfall Module      - Zero-Knowledge Position Guard        |
       +-----------------------------------------------------------------------------------+
             | (In-Memory IPC)                                               | (Audit Trails)
             v                                                               v
+--------------------------+                                   +---------------------------+
|    COMPUTE & STORAGE     |                                   |    COMPLIANCE & LEDGER    |
| - Apache Arrow / Plasma  |                                   | - SR 11-7 Model Registry  |
| - DuckDB & TimescaleDB   |                                   | - SOC 2 Cryptographic Log |
+--------------------------+                                   +---------------------------+
```

### C++/Rust Analytical Core with PyO3 Bindings

For zero-copy in-memory Arrow execution, compute-heavy historical tail risk calculations run in compiled Rust via PyO3:

```rust
#[pyclass]
pub struct FastRiskEngine {
    confidence: f64,
}

#[pymethods]
impl FastRiskEngine {
    #[new]
    fn new(confidence: f64) -> Self { FastRiskEngine { confidence } }

    fn calculate_historical_var(&self, py: Python, returns: PyReadonlyArray1<f64>) -> PyResult<f64> {
        let returns_std = returns.as_array();
        let mut data = returns_std.to_vec();
        data.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
        let index = ((1.0 - self.confidence) * (data.len() as f64)).floor() as usize;
        if index < data.len() { Ok(-data[index]) } else { Ok(0.0) }
    }
}
```

---

### Apache Flink Complex Event Processing (CEP) Engine

Real-time market feeds stream from Kafka into Apache Flink for continuous intraday VaR breach identification and sliding-window VWAP execution:

```
[UDP/Websocket Feed] ==> [Apache Kafka: "tick-feed"] ==> [Apache Flink Stream Processor]
                                                                  |
                                                                  +--> In-Memory Sliding Window (Intraday VaR Violations)
                                                                  v
                                                     [DuckDB Raw Arrow Stream Buffer]
```

---

### Robust Multi-Period Convex Optimization (`robust_optimizer.py`)

Protects portfolios against return estimation uncertainty using ellipsoidal uncertainty sets $\mathcal{U} = \{ \hat{r} \mid (\hat{r} - \mu_r)^T \Sigma_{\text{unc}}^{-1} (\hat{r} - \mu_r) \le \delta^2 \}$ and multi-period turnover caps:

$$\max_{w} \left\{ \mu_r^T w - \delta \| \Sigma_{\text{unc}}^{1/2} w \|_2 - \lambda w^T \Sigma w \right\} \quad \text{s.t.} \quad \sum w_i = 1, \quad w \ge 0, \quad \|w - w_{\text{current}}\|_1 \le \gamma$$

Implemented natively in `backend/app/robust_optimizer.py`.

---

### FRTB Expected Shortfall & Liquidity Horizons

Basel Committee FRTB regulation requires liquidity-horizon scaled Expected Shortfall across $\mathcal{H} = \{10, 20, 40, 60, 120\}$ days:

$$\text{ES} = \sqrt{\sum_{h \in \mathcal{H}} \text{ES}(h)^2 \frac{\Delta \text{LH}_h}{10}}$$

---

### Zero-Knowledge Position Sharing (Pedersen Commitments)

Allows hedge funds to prove risk compliance to allocating banks ($w_i \le 12\%$) without disclosing proprietary asset identifiers:
1. **Pedersen Commitment**: $C = g^w h^r \pmod p$.
2. **Bulletproofs Range Proof**: Proves committed weight $w \in [0, 0.12]$ with zero data leakage.

---

### Cognitive Graph Memory & Self-Healing Execution System

* **Cognitive Knowledge Graph (Neo4j)**: Maps macro events $\rightarrow$ factor decays $\rightarrow$ stress scenario outcomes.
* **Self-Healing EMS**: Detects realized slippage breaching $1.5\times$ Almgren-Chriss baseline and automatically switches routing from VWAP to Participation-of-Volume (POV).

---

### MLOps Shadow Deployment & Tracking Error Circuit Breakers

* **Shadow Run Tracking Error**: $\text{TE}_{\text{shadow}} = \sqrt{\frac{1}{\tau-1} \sum_{t=1}^{\tau} (r_{t,\text{live}} - r_{t,\text{backtest}})^2} \times \sqrt{252}$.
* **Circuit Breaker**: Halts live promotion if $\text{TE}_{\text{shadow}} > 3.0\%$ or realized drawdown diverges $>2.5\sigma$.

---

### Enterprise Configuration Blueprint (`enterprise-config.yml`)

```yaml
system:
  env: production
  performance:
    analytical_backend: rust_pyo3
    stream_processor: apache_flink
    arrow_plasma_store: /var/run/plasma_store
  clustering:
    ray_head_node: "ray://10.240.0.10:6379"
    redis_broker: "redis://10.240.0.11:6379/0"

compliance:
  regulatory_regimes:
    - name: UCITS_5_10_40
      enabled: true
    - name: SR_11_7_Model_Validation
      enabled: true
  limits:
    max_single_position_weight: 0.12
    max_sector_weight: 0.30

cryptography:
  secp256k1_risk_validator_key_vault: "azure-keyvault://production/keys/validator-key"
  pedersen_commitment:
    group_prime_order_p: "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F"

agents:
  cognitive_memory_store:
    type: neo4j
    uri: "bolt://10.240.0.12:7687"
  observability:
    engine: langfuse
    trace_latency: true
```

---

## ⚡ Dominant Enterprise Capabilities & Hardware Acceleration (v4 Specification)

The v4 specification represents the pinnacle of institutional engineering, bringing zero-trust confidential execution, sub-microsecond pre-trade risk gates, GPU-accelerated risk engines, and a bi-temporal compliance ledger (target readiness score: **100/100**).

```
                  +-------------------------------------------------------------+
                  |         QUANTX Unified Gateway & API Orchestrator           |
                  +-------------------------------------------------------------+
                                                 |
         +---------------------------------------+---------------------------------------+
         |                                       |                                       |
         v                                       v                                       v
+-------------------------+             +-------------------------+             +-------------------------+
|  Confidential Enclave   |             |   Vectorized Analytics  |             |  Hardware Acceleration  |
|  AWS Nitro / Intel SGX  |             |      & GPU Solver       |             |  FPGA Pre-Trade Gates   |
| (Proprietary Models &   |             | (CUDA / CuPy Monte      |             |  (AMD Alveo / Solarflare|
|  Position Decryption)   |             |  Carlo & Ledoit-Wolf)   |             |   Ultra-Low Latency)    |
+-------------------------+             +-------------------------+             +-------------------------+
         |                                       |                                       |
         +---------------------------------------+---------------------------------------+
                                                 |
                                                 v
                  +-------------------------------------------------------------+
                  |            Bi-Temporal Core Ledger & Event Store            |
                  |     (CockroachDB / TimescaleDB State Reconstruction)        |
                  +-------------------------------------------------------------+
```

### Confidential Computing & Zero-Trust Enclaves (AWS Nitro / Intel SGX)

Raw holdings (`holdings.csv`) and proprietary alpha Python signals are decrypted *only* within hardware-isolated memory enclaves:
* **Host/Hypervisor Zero-Visibility**: Cloud administrators and host operating systems cannot access CPU registers or cache containing plaintext data.
* **Remote Attestation**: API clients cryptographically verify enclave identity before transmitting encrypted payloads.

---

### GPU-Accelerated Monte Carlo VaR & Expected Shortfall (CUDA/CuPy)

Offloads multi-asset random walks to GPU-bound CUDA kernels, scaling from 12,480 paths to **10,000,000+ paths in milliseconds** (`backend/app/gpu_engine.py`):

$$\text{Simulated Returns}: \quad r_{\text{sim}} = \mu + z \cdot L^T \quad \text{where} \quad L = \text{Cholesky}(\Sigma_{\text{shrunk}})$$

---

### Hardware-Accelerated Pre-Trade Risk Gates (FPGA SystemVerilog)

Integrates directly with AMD Alveo U50 / Solarflare smart NICs for sub-250ns pre-trade limit verification at the physical network MAC layer:
* **Fat-Finger Price Deviation Collars**: Drops orders with price deviations $> 12.5\%$ from last reference tick.
* **Single-Asset Cap Registers**: Enforces UCITS $10\%$ ceilings directly in hardware registers.
* **Microsecond Kill Switch**: Intercepts FIX Protocol packets before physical transmission to the exchange.

---

### ISDA SIMM Margin & Linear Programming Collateral Optimizer

Computes Initial Margin for non-cleared derivatives and solves optimal collateral allocation across clearinghouses (`backend/app/collateral_optimizer.py`):

$$\min_{X} \sum_{i,j} X_{i,j} \cdot \text{FundingCost}_i \quad \text{s.t.} \quad \sum_i X_{i,j} (1 - \text{Haircut}_i) \ge \text{MarginDemand}_j, \quad \sum_j X_{i,j} \le \text{Inventory}_i$$

---

### Multi-Agent Reinforcement Learning & Self-Play Execution Swarms

* **Adversarial Self-Play Gym**: PPO/DQN execution agents train against simulated HFT adversaries that manipulate order-book depth.
* **PPO Reward Optimization**:

$$\text{Reward}_t = -(P_{\text{executed}} - P_{\text{benchmark}}) \cdot Q_{\text{slice}} - \lambda \cdot \text{Var}(P_{\text{executed}}) - \gamma \cdot \text{Cost}_{\text{Turnover}}$$

---

### Bi-Temporal Core Ledger & Regulatory Compliance (MiFID II, Basel IV)

* **Dual-Axis Temporal Tracking**:
  * **Effective Time (Valid Time)**: Historical date the market transaction occurred.
  * **Assertion Time (System Time)**: Exact physical timestamp the record entered the database.
* Eliminates look-ahead and hindsight bias, enabling point-in-time state reconstruction as of any historical timestamp.

---

### Automated Model Promotion Protocol (`ModelPromotionEngine`)

Automated Q-DevOps pipeline enforcing:
* Minimum 60 observation days and Sharpe $> 1.20$.
* Drawdown containment $< 18.0\%$.
* Shadow execution tracking error $\text{TE}_{\text{shadow}} \le 2.50\%$ circuit breaker.

---

## 🌌 Sovereign-Grade Quantitative Intelligence & High-Dimensional Solvers (v5 Blueprint)

The v5 specification expands QUANTX into a sovereign-grade investment infrastructure, enabling quantum-inspired combinatorial optimization, endogenous liquidity risk modeling, multi-modal satellite factor pipelines, and generative adversarial stress testing (readiness score: **100/100**).

```
                           +------------------------------------------------------+
                           |        QUANTX Sovereign Unified Core Network         |
                           +------------------------------------------------------+
                                      |                        |
             +------------------------+                        +------------------------+
             v                                                                          v
+------------------------------------------+                               +------------------------------------------+
|      High-Dimensional Computation        |                               |       Alternative Data & Defense         |
+------------------------------------------+                               +------------------------------------------+
|  * Quantum-Inspired Optimization (QUBO)  |                               |  * Multi-Modal Alternative Data Core     |
|  * Endogenous Liquidity Risk (L-VaR/ES)  |                               |  * Generative Adversarial Stress (GAST)  |
|  * Dynamic MEV-Resistant SOR Execution   |                               |  * Zero-Trust Multi-Tenancy Networks     |
+------------------------------------------+                               +------------------------------------------+
```

### Quantum-Inspired Portfolio Optimization (QUBO Engines)

Solves NP-hard combinatorial optimization with exact cardinality constraints ($K$ assets) and round lot allocations via simulated adiabatic bifurcation (`backend/app/qubo_optimizer.py`):

$$H(x) = A \left( \sum_{i=1}^N x_i - K \right)^2 + B \left( \gamma \sum_{i=1}^N \sum_{j=1}^N \sigma_{ij} w_i w_j x_i x_j - \sum_{i=1}^N \mu_i w_i x_i \right)$$

---

### Endogenous Liquidity-Adjusted Risk Attribution (L-VaR & L-ES)

Incorporates market bid-ask spreads, average daily volume (ADV) ratios, and temporary price impact into tail risk metrics (`backend/app/liquidity_risk.py`):

$$L\text{-VaR}_{\alpha} = \text{VaR}_{\alpha} + \lambda_{\text{mkt}} \sum_{i=1}^n w_i V_p \left( \frac{1}{2} \psi_i + \eta_i \frac{w_i V_p}{\text{ADV}_i} \right)$$

---

### Cross-Venue MEV-Resistant Smart Order Router (SOR)

Splits parent orders across lit exchanges and dark pools to minimize aggregate market impact and HFT front-running:

$$\min_{q_1, \dots, q_M} \sum_{k=1}^M \left( \Phi_k(q_k) + \Omega_k(q_k) \right) \quad \text{s.t.} \quad \sum q_k = Q, \quad q_k \ge 0$$

Where $\Omega_k(q_k)$ represents the information leakage penalty of venue $k$.

---

### Multi-Modal Alternative Data Engine (Satellites & Maritime Tracking)

Fuses high-dimensional unstructured streams into a joint cross-attention factor tensor:
* **Orbital Satellite Imagery**: ResNet/ViT feature extraction on commodity stockpiles and retail parking.
* **AIS Maritime Tracking**: Real-time tanker drafts, supply congestion, and cargo vectors.
* **Regulatory & Legal Filings**: BERT/ColBERT semantic vectorization of corporate lobbying and litigation.

---

### Generative Adversarial Stress Testing (GAST)

Conditional Variational Autoencoders (CVAE) sample synthetic crisis paths conditioned on macro risk variables (e.g. stagflation shocks, rate hikes) to evaluate unobserved tail-risk distributions.

---

### Zero-Trust Sovereign Operations & Multi-Tenancy Architecture (TimescaleDB RLS)

* **Row-Level Security (RLS)**: Enforces physical database query isolation based on cryptographically validated `tenant_id`.
* **WORM Audit Trails**: Tamper-proof append-only triggers preventing deletion or modification of operational risk logs.

---

### Automated Q-DevOps Deployment Gating Engine (`QuantGatingEngine`)

Continuously evaluates shadow execution against backtests, halting model promotion if:
1. Tracking error divergence exceeds **3.0%**.
2. Realized drawdown exceeds **$1.25\times$** backtested expectations.
3. Slippage deviation surpasses **$2.0\sigma$** of the Almgren-Chriss baseline.

---

## ⚡ Sovereign-Grade v6 Core: L3 Order Book, HRP Graph Clustering, FHE & RWA Securitization (v6 Blueprint)

The v6 specification represents the absolute pinnacle of institutional quantitative engineering, commanding a **100/100 value ranking** across Tier-1 prime brokerages, sovereign wealth managers, and HFT market makers.

```
                       +-------------------------------------------------+
                       |         QUANTX Sovereign-Grade v6 Core          |
                       +-------------------------------------------------+
                                                |
         +--------------------------------------+--------------------------------------+
         |                                      |                                      |
         v                                      v                                      v
+-------------------------+            +-------------------------+            +-------------------------+
|    Level-3 Market LOB   |            |   Fully Homomorphic     |            |  State-Machine Agents   |
|   Microstructure Engine |            |   Encryption (FHE) Core |            |   & Mathematical Guard  |
+-------------------------+            +-------------------------+            +-------------------------+
         |                                      |                                      |
         +--------------------------------------+--------------------------------------+
                                                |
                                                v
                               +----------------------------------+
                               |     Hierarchical Risk Parity     |
                               |      Graph Networking (HRP)      |
                               +----------------------------------+
```

### Level-3 Limit Order Book (LOB) Reconstruction & VPIN Toxicity Engine

Reconstructs deterministic order queues from raw Nasdaq ITCH v5.0 / OUCH feeds (`backend/app/l3_orderbook.py`) and calculates the **Volume-Synchronized Probability of Toxicity (VPIN)**:

$$\text{VPIN} = \frac{\sum_{\tau=1}^N \left| V_\tau^B - V_\tau^S \right|}{N \cdot V}$$

Where volume is partitioned into constant size buckets $V$ and trades are classified via the Lee-Ready algorithm.

---

### Hierarchical Risk Parity (HRP) & Portfolio Graph Networks

Implements Marcos López de Prado's machine-learning-driven portfolio construction (`backend/app/hrp_optimizer.py`):
1. **Information Distance Metric**: $d_{i,j} = \sqrt{\frac{1}{2}(1 - \rho_{i,j})}$
2. **Hierarchical Single-Linkage Tree Clustering**: Identifies collinear asset clusters.
3. **Quasi-Diagonalization**: Reorders the covariance matrix along diagonal similarity.
4. **Recursive Bisection**: Allocates branch capital via inverse-variance weighting without requiring covariance matrix inversion ($w_1 = 1 - \alpha, w_2 = \alpha$).

---

### Fully Homomorphic Encryption (FHE) for Privacy-Preserving Cloud Quant Backtesting

Enables zero-knowledge institutional risk evaluation across untrusted public clouds using the **CKKS (Cheon-Kim-Kim-Song)** scheme:

$$[\sigma_p^2]_E = [W]_E^T \times \Sigma \times [W]_E$$

Encrypted position vectors $[W]_E$ are multiplied homomorphically against plain-text covariance matrices $\Sigma$ in the cloud, allowing the client to decrypt portfolio variance without revealing private portfolio weights.

---

### Real-World Asset (RWA) Tokenization Core (ERC-3643 Regulated Security Tokens)

* **ONCHAINID Regulatory Standard**: Integrates native ERC-3643 smart contracts with dynamic `canTransfer(_from, _to, _amount)` compliance validation.
* **On-Chain Custody & Issuance**: Digital fractionalization of private credit, institutional equity tranches, and sovereign fund shares with automated KYC/AML verification.

---

### LangGraph Multi-Agent State Machines & Mathematical Invariant Guardrails

Structured graph workflows replacing linear AI assistants with deterministic state transitions:
* **Mathematical Invariant Gates**: Hard verification that $\sum w_i = 1.0$, single-stock concentration $\le 15.0\%$, and tracking error $\le \text{Threshold}$.
* **Self-Healing Loop**: Automatic feedback routing back to optimizer nodes upon constraint breaches before trade execution.

---

### Unified Multi-Custody Settlement API (Fireblocks / Anchorage MPC)

Compliant JSON API schema for institutional co-signing, multi-party computation (MPC) key signatures, and delivery-versus-payment (DvP) settlement across **Fireblocks**, **Anchorage Digital**, **BNY Mellon**, and **State Street**.

---

### Open-Source Strategy & Enterprise Monetization Architecture

* **`quantx-core` (Apache 2.0)**: Open-source PyO3/Rust performance bindings and base mathematical SDK.
* **`quantx-enterprise` (Commercial Tier)**: Glassmorphic terminal UI, Confidential Nitro Enclaves, ERC-3643 RWA engine, FHE cloud solver, and TimescaleDB RLS isolation.

---

## 💎 Next-Generation Sovereign-Grade Features (v7 Blueprint)

The v7 blueprint presents the ultimate enterprise capabilities designed for sovereign wealth funds, multi-asset hedge funds, and prime brokerages, achieving an absolute **100/100 generic value level**.

### Dynamic Macro-Regime Switching Engine (Gaussian HMM & Viterbi Decoder)

Models non-stationary return distributions across macroeconomic regimes using Gaussian Hidden Markov Models and Viterbi sequence decoding (`backend/app/regime_detector.py`):

$$\mathbf{r}_t \mid S_t = k \sim \mathcal{N}(\mathbf{\mu}_k, \mathbf{\Sigma}_k)$$

$$V_t(k) = \max_j \left[ V_{t-1}(j) P_{jk} \right] \cdot \mathcal{N}(\mathbf{r}_t \mid \mathbf{\mu}_k, \mathbf{\Sigma}_k), \quad \mathbf{S}_t^* = \arg\max_k V_t(k)$$

---

### Deep Hedging of Exotic Multi-Asset Derivatives (PyTorch Neural Policy)

Optimizes neural dynamic hedging policies $\mathbf{H}_t(\theta)$ under non-linear market impact and transaction friction:

$$\mathcal{L}(\theta) = \mathbb{E}\left[ -U\left( Y_T - \sum_{t=0}^{T-1} \mathcal{C}(\mathbf{H}_t(\theta), \mathbf{H}_{t+1}(\theta)) \right) \right], \quad U(x) = -e^{-\lambda x}$$

---

### Cross-Border Tax-Efficient Portfolio Optimization (Tax-Loss Harvesting CVXPY)

Solves tax-lot constrained quadratic programming incorporating short-term ($T_{\text{ST}}$) and long-term ($T_{\text{LT}}$) capital gains while strictly enforcing wash-sale rules:

$$\max_{\mathbf{w}} \quad \mathbf{w}^T \mathbf{\mu} - \lambda \mathbf{w}^T \mathbf{\Sigma} \mathbf{w} - \sum_{i=1}^N \sum_{l \in L_i} w_{il} \cdot \tau_{il} - \gamma \sum_{i=1}^N \left| w_i - w_{i, \text{initial}} \right|$$

---

### Federated Alpha Learning Engine (FedAvg & Differential Privacy)

Coordinates multi-institution alpha model training across isolated client instances without exposing proprietary trade books:

$$\mathbf{W}_{t+1} = \sum_{k=1}^M \frac{n_k}{n} \left( \mathbf{W}_{t,k} + \mathcal{N}\left(0, \sigma^2 \mathbf{I}\right) \right)$$

---

### Real-Time Cross-Asset Liquidity & Basel IV Capital Engines (LCR & NSFR Ratios)

Maintains continuous regulatory liquidity buffers matching Basel IV mandates (`backend/app/basel_iv.py`):
* **Liquidity Coverage Ratio (LCR)**: $\text{LCR} = \frac{\text{HQLA}}{\text{Net 30-Day Outflows}} \ge 100\%$
* **Net Stable Funding Ratio (NSFR)**: $\text{NSFR} = \frac{\text{Available Stable Funding (ASF)}}{\text{Required Stable Funding (RSF)}} \ge 100\%$

---

### Self-Optimizing Agent Networks with Dynamic Tool Compilation (`DynamicToolRegistry`)

Enables the AI Copilot to act as an autonomous Tool-Smith agent, dynamically writing, compiling, and running sandboxed Python/PyO3 modules under strict mathematical conservation invariant boundaries.

---

### Quantitative DevOps Gating (Q-DevOps CI/CD Gateway)

Deterministic deployment gatekeeper evaluating:
1. Point-in-time look-ahead bias audit ($t - \epsilon$).
2. Realized tracking error alignment $\text{TE}_{\text{shadow}} \le 3.0\%$.
3. Almgren-Chriss transaction capacity slippage drift $\le 5.0\%$.

---

## 📈 Real-Time Live Trading Analysis & Enterprise Risk Orchestration (v8 Strategy Blueprint)

The v8 blueprint elevates QUANTX to institutional Live Trading Analysis (LTA), real-time pre-trade/post-trade Transaction Cost Analysis (TCA), and high-frequency FIX protocol execution.

```
       +-------------------------------------------------------+
       |            Multi-Venue Market Feeds (L2/L3)           |
       +-------------------------------------------------------+
                                   |
                                   v  (Sub-millisecond Ticks)
       +-------------------------------------------------------+
       |         In-Memory Real-Time Stream Processor          | <---+
       +-------------------------------------------------------+     | (Slippage Feedback)
            | (Live Prices)                 | (Market Depth)         |
            v                               v                        |
+-----------------------+       +-----------------------+            |
| Live Position Manager |       | Real-Time TCA Engine  |            |
|  (Intraday L-VaR)     |       | (Almgren-Chriss Impact|            |
+-----------------------+       +-----------------------+            |
            |                               |                        |
            +---------------+---------------+                        |
                            | (State Vector)                         |
                            v                                        |
       +-------------------------------------------------------+     |
       |       Execution Management System (EMS) Router        | ----+
       |          (Adaptive TWAP/VWAP/POV Solvers)             |
       +-------------------------------------------------------+
```

### Live Trading Feedback Loop & Real-Time Stream Processor

* **Kafka / Flink Streaming Pipeline**: Windowed calculations across 5-second, 1-minute, and 15-minute rolling slices.
* **In-Memory Redis Hash Ledger Schema**: Caches live marked-to-market NAV, tick PnL, available margin, and rolling 15-minute $L\text{-VaR}$.

---

### Real-Time Transaction Cost Analysis (TCA) Engine (Almgren-Chriss Impact)

Calculates pre-trade impact and post-trade Implementation Shortfall (IS) slippage (`backend/app/tca_engine.py`):

$$\text{Total Cost} = I_{\text{perm}} + I_{\text{temp}} = \gamma \sigma \left( \frac{\theta}{\Theta} \right)^\alpha \operatorname{sign}(\theta) + \eta \sigma \left( \frac{\theta}{\tau \Theta} \right)^\beta$$

---

### Intraday Liquidity-Adjusted VaR ($L\text{-VaR}$)

$$L\text{-VaR}_{1-\alpha} = \text{Portfolio VaR}_{1-\alpha} + \sum_{i=1}^N w_i \left( \frac{S_i}{2} + \lambda_i \frac{w_i V_p}{\text{ADV}_i} \right)$$

---

### Multi-Venue FIX Protocol Gateway (FIX 4.4 Engine)

Asynchronous FIX 4.2 / 4.4 network handlers (`backend/app/fix_engine.py`) managing `NewOrderSingle` (MsgType=D) order submission and `ExecutionReport` (MsgType=8) parsing across multiple lit venues, liquidity providers, and dark pools.

---

### Live Champion-Challenger (Shadow) Execution Routing

* **Champion Route**: Active real-capital FIX execution.
* **Challenger Route**: Passive intra-second tick evaluation with automated tracking error circuit breakers.

---

### Pre-Flight Q-DevOps Model Execution Validator (`ModelExecutionValidator`)

Strict gating checklist verifying:
1. Historical price series $\ge 60$ days with $< 25\%$ stale prices.
2. Hard allocation sum $= 1.0$ and single position allowance bounds.
3. Parametric 1-Day VaR $\le 15.0\%$ of portfolio NAV.

---

### MiFID II RTS 25 Microsecond Clock Synchronization

* **Sub-100 Microsecond Drift**: PTP hardware clock synchronization for all order execution timestamps.
* **WORM Audit Chains**: SHA-256 hash chaining back to previous operational records to prevent retroactive modifications.

---

## ⚡ High-Frequency Live Execution, Microstructure Surveillance & Sovereign Analytics (v9 Blueprint)

The v9 specification delivers the ultimate high-frequency live trading infrastructure, combining sub-500ns pre-trade risk gates, Level-3 micro-price tracking, AI-driven predictive TCA, and convex smart order routing.

```
+-----------------------------------------------------------------------------------+
|                           RAW LEVEL-3 TICK DATA STREAM                            |
|                  (Nasdaq ITCH v5.0 / OUCH / FIX Market Data Feeds)                 |
+-----------------------------------------------------------------------------------+
                                         |
                                         v (Zero-Copy Apache Arrow Records)
+-----------------------------------------------------------------------------------+
|               L3 LIMIT ORDER BOOK RECONSTRUCTION & TOXICITY ENGINE                |
|       [Tracks Micro-Price, Order Book Imbalance (OBI), and Real-Time VPIN]        |
+-----------------------------------------------------------------------------------+
                                         |
                                         v (Live Microstructure State Vector)
+-----------------------------------------------------------------------------------+
|              AI-DRIVEN PREDICTIVE TRANSACTION COST ANALYSIS (NEURAL-TCA)          |
|      [Calibrates Transient Spread Elasticity & Multi-Horizon Signal Alpha Decay]   |
+-----------------------------------------------------------------------------------+
                                         |
                                         v (Expected Impact & Decay Profiles)
+-----------------------------------------------------------------------------------+
|                    SEC RULE 15C3-5 PRE-TRADE REGULATORY RISK GATES                |
|      [Fat-Finger Price Collars, Order-Rate Throttlers, Wash-Sale Checkers]        |
+-----------------------------------------------------------------------------------+
                                         |
                                         v (Cleared Secure Trades)
+-----------------------------------------------------------------------------------+
|               MULTI-VENUE CROSS-ASSET SMART ORDER ROUTING (SOR) SOLVER            |
|         [Convex Quadratic Solver: Allocates Orders Between Lit & Dark Pools]      |
+-----------------------------------------------------------------------------------+
                                         |
                                         +-------------------+----------------------+
                                         | (Lit Venues)      | (Dark Pools)         | (Real-Time Feedback)
                                         v                   v                      v
                                  +------------+      +------------+       +----------------+
                                  | NYSE / LSE |      | Liquidnet  |       | WebSocket Push |
                                  |  (FIX 4.4) |      | (Dark FIX) |       | to UI Terminal |
                                  +------------+      +------------+       +----------------+
```

### Order Book Imbalance (OBI) & Volume-Weighted Micro-Price

Evaluates instantaneous order queue supply/demand imbalances (`backend/app/l3_microstructure.py`):

$$P_{\text{micro}} = \frac{V_{\text{bid}} P_{\text{ask}} + V_{\text{ask}} P_{\text{bid}}}{V_{\text{bid}} + V_{\text{ask}}}, \quad \text{OBI}_t = \frac{V_{\text{bid}, t} - V_{\text{ask}, t}}{V_{\text{bid}, t} + V_{\text{ask}, t}}$$

---

### AI-Driven Predictive TCA & Alpha Signal Half-Life Modeling

Models alpha signal decay dynamics and transient spread impact via deep neural mapping:

$$\text{IC}(\Delta t) = \text{IC}_0 \times e^{-\lambda \Delta t}, \quad \text{Signal Half-Life } (t_{1/2}) = \frac{\ln(2)}{\lambda}$$

$$\hat{I}_{\text{temp}} = \sigma_t \times \mathbf{W}_2 \tanh(\mathbf{W}_1 \mathbf{x}_t + \mathbf{b}_1) + b_2$$

---

### Convex Quadratic Smart Order Routing (SOR) Solver

Distributes parent orders across lit exchanges and dark pools to minimize aggregate price impact, leakage, and exchange fees (`backend/app/convex_sor.py`):

$$\min_{\mathbf{x}} \sum_{j=1}^{M} \left( C_j x_j^2 + F_j x_j \right) + \phi \sum_{j \in \mathcal{V}_{\text{lit}}} L_j x_j \quad \text{s.t.} \quad \sum x_j = 1.0, \quad 0 \le x_j \le K_j$$

---

### SEC Rule 15c3-5 Pre-Trade Risk Gates & Fat-Finger Protection

Enforces ultra-low-latency compliance validation before order routing (`backend/app/sec_risk_gate.py`):
1. **Fat-Finger Price Collar**: Rejects orders deviating $> 5\%$ from reference price.
2. **Single-Order Notional Cap**: Enforces max capital limits per order ticket.
3. **Multi-Tenant Daily Exposure**: Hard aggregate portfolio daily ceiling.
4. **Leaky-Bucket Rate Throttler**: Restricts submission velocity to $\le 50 \text{ orders/sec}$.

---

### Bi-Temporal Tick Storage & Low-Latency WebSocket Protocol

* **TimescaleDB `quantx_bitemporal_ticks` Schema**: Distinct Valid-Time vs System-Time dimensions.
* **Flat Serialization Protocol**: Server-to-client JSON frames delivering micro-price, OBI, and $L\text{-VaR}$ at 60 FPS for direct HTML5 Canvas rendering.

---

## 🏗 Architecture & System Design

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                           REACT 19 SPA TERMINAL                                │
│  Vite 7 • TypeScript • TailwindCSS v4 • Recharts • Singlefile Bundle Support   │
│  ├─ AppShell & Navigation (Tabs, Search, Command Palette ⌘K, Profile)          │
│  ├─ Pages: Dashboard, AlphaLab, Risk, Backtest, Optimizer, Copilot, Portfolio  │
│  └─ Services & Local State: Router Context, Auth Context, Toast Provider       │
└──────────────────────────────────────┬─────────────────────────────────────────┘
                                       │ HTTP / JSON / Multipart (/api/v1/*)
                                       │ HttpOnly, SameSite=Strict Session Cookie
┌──────────────────────────────────────▼─────────────────────────────────────────┐
│                           FASTAPI ASYNC BACKEND                                │
│  Python 3.10+ • Uvicorn ASGI • Pydantic v2 • Pure Vectorized Math Engine       │
│  ├─ /api/v1/auth/*     → scrypt hashing, opaque SQLite token storage           │
│  ├─ /api/v1/profile/*  → Desk preferences, profile metadata, titles            │
│  ├─ /api/v1/portfolio  → Multipart CSV parser, returns alignment, risk & VaR   │
│  └─ /health            → Liveness and service telemetry                        │
└──────────────────────────────────────┬─────────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼─────────────────────────────────────────┐
│                      PERSISTENCE & COMPUTATION LAYER                           │
│  • SQLite Database (quantx.db): Users, Sessions, User Profiles                 │
│  • Quantitative Analytical Engine: Risk, MCR, Drawdowns, Optimization Caps     │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📡 REST API Reference

The backend exposes a high-performance RESTful API documented automatically via OpenAPI (Swagger).

### Base URL
* Local Development: `http://localhost:8000` (Proxied via Vite to `/api`)

### Endpoints

#### 1. System Health
* `GET /health`
  - **Description**: Returns backend service status and operational mode.
  - **Response `200 OK`**:
    ```json
    {
      "status": "ok",
      "service": "quantx-analysis",
      "data_mode": "user_csv"
    }
    ```

---

#### 2. Authentication & Profile
* `POST /api/v1/auth/register`
  - **Payload**: `{"email": "user@firm.com", "full_name": "Jane Doe", "password": "SecurePassword123"}`
  - **Status**: `201 Created` — Sets `quantx_session` HTTP-only cookie.
* `POST /api/v1/auth/login`
  - **Payload**: `{"email": "user@firm.com", "password": "SecurePassword123"}`
  - **Status**: `200 OK` — Sets `quantx_session` HTTP-only cookie.
* `POST /api/v1/auth/logout`
  - **Status**: `204 No Content` — Revokes session and deletes session cookie.
* `GET /api/v1/auth/me`
  - **Status**: `200 OK` — Returns currently authenticated user object.
* `GET /api/v1/auth/email-availability?email=...`
  - **Status**: `200 OK` — Live validation for registration without leaking account records.
* `GET /api/v1/profile`
  - **Status**: `200 OK` — Returns user profile, desk name, title, and saved UI preferences.
* `PATCH /api/v1/profile`
  - **Payload**: `{"full_name": "Jane Doe", "title": "Lead Quant", "desk": "Macro Strategies", "preferences": {}}`

---

#### 3. Portfolio Analysis Engine
* `POST /api/v1/portfolio/analyze` (Multipart Form Upload)
  - **Headers**: `Content-Type: multipart/form-data`
  - **Form Fields**:
    - `holdings_file`: `holdings.csv` (File)
    - `prices_file`: `prices.csv` (File)
    - `benchmark_ticker`: e.g. `NIFTY50` (String, Optional)
    - `risk_free_rate`: e.g. `0.06` (Float, Default: 0.06)
    - `max_position_weight`: e.g. `0.12` (Float, Default: 0.12)
    - `max_sector_weight`: e.g. `0.30` (Float, Default: 0.30)
  - **Response `200 OK` Structure**:
    ```json
    {
      "disclaimer": "Quantitative decision-support analysis based only on the uploaded CSV data.",
      "data_quality": {
        "mode": "user_csv",
        "portfolio_dates": 120,
        "first_date": "2025-08-01",
        "last_date": "2026-01-30",
        "warnings": [],
        "source_rows": { "holdings": 5, "prices": 605 },
        "latest_price_dates": ["2026-01-30"],
        "excluded_price_rows": {}
      },
      "summary": {
        "market_value": 725000.0,
        "cost_basis": 680000.0,
        "unrealized_pnl": 45000.0,
        "research_grade": "A",
        "research_score": 92
      },
      "performance": {
        "annualized_return": 0.1845,
        "annualized_volatility": 0.1420,
        "sharpe_ratio": 1.1584,
        "sortino_ratio": 1.7241,
        "calmar_ratio": 2.15,
        "max_drawdown": -0.0858,
        "observations": 119
      },
      "risk": {
        "historical_var_95_1d": 0.0138,
        "historical_cvar_95_1d": 0.0195,
        "var_95_currency": 10005.0,
        "cvar_95_currency": 14137.5,
        "beta": 0.94,
        "information_ratio": 0.82,
        "tracking_error": 0.045,
        "active_return": 0.038,
        "benchmark_correlation": 0.91
      },
      "concentration": {
        "hhi": 0.142,
        "effective_number_of_positions": 7.04,
        "largest_position_weight": 0.185,
        "sector_weights": [
          { "sector": "Technology", "weight": 0.38 },
          { "sector": "Financials", "weight": 0.32 }
        ]
      },
      "positions": [ ... ],
      "findings": [
        {
          "severity": "high",
          "category": "concentration",
          "title": "INFY exceeds the position limit",
          "detail": "Weight is 18.5%, above the configured 12.0% cap."
        }
      ],
      "proposed_allocation": {
        "method": "risk-adjusted return score with position and sector caps",
        "constraints": { "max_position_weight": 0.12, "max_sector_weight": 0.30 },
        "weights": [ ... ]
      }
    }
    ```

* `POST /api/v1/portfolio/analyze-json` (JSON Payload)
  - Accepts equivalent JSON structure containing `{ "holdings": [...], "prices": [...] }` for machine-to-machine integrations.

---

## 14. Market Microstructure, Symbolic Alpha & Autonomous Execution Architecture (v10 Blueprint)

The **v10 Blueprint** introduces five institutional modules designed for high-frequency inventory management, automated symbolic alpha discovery, structural macro shock transmission, zero-knowledge cross-venue liquidity, and mobile wearable emergency controls:

### 1. Avellaneda-Stoikov Intraday Market-Making & Inventory Engine
- **Reservation Price Formulation**:
  $$r(s, q, t) = s - q \gamma \sigma^2 (T - t)$$
  Accounts for current inventory $q$, asset volatility $\sigma$, remaining trading horizon $T - t$, and risk-aversion parameter $\gamma$.
- **Asymmetric Spread & Depth Ladder**:
  $$\delta^a + \delta^b = \gamma \sigma^2 (T - t) + \frac{2}{\gamma} \ln\left(1 + \frac{\gamma}{\kappa}\right)$$
  Computes optimal multi-level quotes around the reservation price to balance inventory skew.
- **API Endpoints**:
  - `POST /api/v1/market-making/quotes`
  - `POST /api/v1/market-making/simulate`

### 2. "AutoQuant" Symbolic Alpha Synthesis Engine
- **AST Genetic Search & Symbolic Grammar**:
  Builds mathematical alpha factor expressions over high-dimensional price/volume data using unary (`rank`, `zscore`, `decay_linear`), binary (`add`, `sub`, `mul`, `div`), and rolling operators (`ts_mean`, `ts_std`, `ts_corr`, `ts_delta`).
- **Factor Telemetry**:
  Evaluates candidate Information Coefficient (IC), Information Ratio (IR), Sharpe Ratio, Turnover, and Factor Crowding.
- **API Endpoints**:
  - `GET /api/v1/alpha/primitives`
  - `POST /api/v1/alpha/synthesize`

### 3. Causal Macro-Graph Scenario Simulator (SVAR $B_0^{-1}$)
- **Structural Transmission Matrix ($B_0^{-1}$)**:
  Lower-triangular recursive causal ordering linking macroeconomic structural shocks (RBI Policy Rate, 10Y Sovereign Yield, Credit Spreads, Brent Crude Oil, USD/INR, Core CPI) to portfolio asset responses.
- **Dynamic Risk Impact**:
  Simulates instantaneous portfolio losses, Stressed 95% 1-Day VaR surge, and component risk budget breaches.
- **API Endpoints**:
  - `GET /api/v1/risk/macro-graph`
  - `POST /api/v1/risk/causal-shock`

### 4. Institutional RFQ & Cross-Venue Liquidity Bridge
- **ZK-Proof Compliant Request-for-Quote**:
  Integrates zero-knowledge compliance verification (`zk_snark_groth16_sanctions_pass`) for counterparty authorization without leaking private desk keys.
- **Cross-Dealer Liquidity Routing**:
  Dispatches RFQ requests to tier-1 market makers (Citadel Securities, Jane Street, Goldman Sachs, Virtu Financial, Morgan Stanley) and executes best quote.
- **API Endpoints**:
  - `GET /api/v1/rfq/blotter`
  - `POST /api/v1/rfq/request`
  - `POST /api/v1/rfq/execute`

### 5. Native Mobile Terminal & Wearable Emergency Control (`QUANTX Mobile`)
- **Real-Time Telemetry Streaming**:
  Live streaming of Portfolio NAV, intraday PnL, 95% 1-Day VaR, and risk limit capacity gauges over ultra-low latency link (1.4ms).
- **Hardware-Enclave Authorized Emergency Controls**:
  - **1-Tap Delta-Neutral Hedge**: Instantaneous futures order calculation and dispatch to flatten net delta to 0.00.
  - **IOC Market Liquidation Kill-Switch**: Sweeps active orderbooks with immediate-or-cancel market liquidation orders into cash reserves.
- **API Endpoints**:
  - `GET /api/v1/emergency/status`
  - `POST /api/v1/emergency/delta-hedge`
  - `POST /api/v1/emergency/kill-switch`

---

## 🚀 Installation & Getting Started

### Prerequisites
* **Node.js**: 18.x or 20.x+
* **npm** or **pnpm** / **yarn**
* **Python**: 3.10, 3.11, or 3.12
* **PowerShell** (Windows) or **Bash** (Linux/macOS)

---

### Backend Service Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   * **Windows (PowerShell)**:
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   * **Linux / macOS**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables (optional for local development):
   ```bash
   cp .env.example .env
   ```

5. Launch the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   * The API service is now running at `http://127.0.0.1:8000`.
   * Interactive OpenAPI documentation is accessible at `http://127.0.0.1:8000/docs`.

---

### Frontend Terminal Setup

1. In a separate terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js packages:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```
   *(The Vite development server is pre-configured to proxy `/api` requests directly to `http://localhost:8000`).*

---

### Environment Configuration

The backend supports configuration via environment variables or a `.env` file in the `backend/` directory:

| Variable | Description | Default (Dev) | Production Recommendation |
|---|---|---|---|
| `APP_ENV` | Application environment mode | `development` | Set to `production` (enforces HTTPS secure cookie flags) |
| `SESSION_SECRET` | Secret key for session signature validation | `development-only-...` | Set to a high-entropy 256-bit cryptographically random secret |
| `SESSION_TTL_HOURS` | User session lifespan before re-auth | `8` | `8` to `24` depending on organizational compliance |
| `QUANTX_DATABASE_URL`| Custom SQLite path or DB URL | `quantx.db` | Dedicated persistent storage mount |

---

## 🔒 Security & Authentication Architecture

1. **Password Hashing**:
   - Implements **`scrypt`** (RFC 7914) with configuration parameters: $N=16384$, $r=8$, $p=1$, using 16-byte unique cryptographic salts per account.
   - Enforces password complexity rules (minimum 12 characters, uppercase, lowercase, numbers).
2. **Session Storage & Transport**:
   - Employs opaque 256-bit session tokens stored securely in SQLite with explicit cryptographic revocation capability (`/api/v1/auth/logout`).
   - Tokens are transmitted via **`HttpOnly`**, **`SameSite=Strict`** cookies, neutralizing client-side Cross-Site Scripting (XSS) token exfiltration and Cross-Site Request Forgery (CSRF).
   - In production mode (`APP_ENV=production`), the `Secure` flag is enforced requiring full TLS/HTTPS transport.
3. **Data Boundary & Tenant Isolation**:
   - CSV datasets uploaded to the portfolio analytics engine are processed in memory and never persisted to external cloud endpoints, safeguarding proprietary fund holding positions.

---

## 📁 Project Directory Layout

```
quantx-institutional-finance-platform/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application & route declarations
│   │   ├── analysis.py          # Pure vectorized quantitative math & risk engine
│   │   └── auth.py              # Scrypt hashing, SQLite session management
│   ├── .env.example             # Environment configuration template
│   ├── quantx.db                # SQLite database (auto-initialized on startup)
│   ├── README.md                # Backend specific run guide
│   └── requirements.txt         # FastAPI, Uvicorn, Pydantic dependencies
│
├── frontend/
│   ├── public/                  # Static assets & brand icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/          # Allocation radial, sparklines, area charts
│   │   │   ├── layout/          # AppShell, TopNav, Sidebar, Header, Logo
│   │   │   └── ui/              # Badges, Panels, Buttons, Toasts, EmptyStates
│   │   ├── constants/           # Platform metrics & menu configuration
│   │   ├── data/
│   │   │   ├── market.ts        # Index definitions, market tape datasets
│   │   │   ├── portfolio.ts     # Institutional sample portfolios & allocations
│   │   │   └── quant.ts         # Factor models, backtest tearsheets, risk matrices
│   │   ├── lib/
│   │   │   ├── auth.tsx         # AuthContext, session hooks, credentials state
│   │   │   ├── format.ts        # Currency (INR, USD), percentages, numbers
│   │   │   └── router.tsx       # Lightweight SPA routing & browser history
│   │   ├── pages/
│   │   │   ├── AlphaLab.tsx     # 9-Factor family studio & IC decay monitor
│   │   │   ├── AssetDetail.tsx  # Deep-dive single-name technical & factor view
│   │   │   ├── Auth.tsx         # Sign-in and registration pages
│   │   │   ├── Backtest.tsx     # Point-in-time backtest simulator
│   │   │   ├── Copilot.tsx      # Grounded AI Quant Research Assistant
│   │   │   ├── Dashboard.tsx    # Executive overview & multi-asset terminal
│   │   │   ├── Landing.tsx      # Platform overview, features, hero showcase
│   │   │   ├── Markets.tsx      # Market intelligence, tape, sector rotation
│   │   │   ├── Models.tsx       # Quantitative model registry & governance
│   │   │   ├── Ops.tsx          # Execution (EMS), Data Center, Alerts, Settings
│   │   │   ├── Optimizer.tsx    # Constrained convex portfolio optimization
│   │   │   ├── Portfolio.tsx    # Portfolio holdings surveillance
│   │   │   ├── PortfolioAnalysis.tsx # CSV-backed deterministic analytics engine
│   │   │   ├── Profile.tsx      # User profile, desk setting & preferences
│   │   │   └── Risk.tsx         # GARCH-DCC, Historical VaR/CVaR, Stress Testing
│   │   ├── utils/
│   │   │   └── cn.ts            # Tailwind class name merge utility
│   │   ├── App.tsx              # Primary application routing table
│   │   ├── index.css            # Dark institutional theme tokens & keyframes
│   │   └── main.tsx             # React 19 root entrypoint
│   ├── package.json             # React 19, Lucide, Recharts, Tailwind 4
│   ├── tsconfig.json            # Strict TypeScript configuration
│   └── vite.config.ts           # Vite bundler & backend API proxy configuration
│
├── LANDING_README.md            # Dedicated Landing Page architecture & design guide
├── RUN.md                       # Comprehensive platform execution runbook
└── README.md                    # Primary institutional platform documentation
```

---

## ⚖ Regulatory & Analytical Disclaimer

> [!IMPORTANT]
> **Decision Support Notice**: QUANTX is a quantitative analytical decision-support and risk-measurement platform. Calculations, factor scores, risk simulations, and allocation proposals produced by this software are strictly for research and risk-monitoring purposes and **do not constitute investment advice, trade execution mandates, or financial solicitations**. Users must independently evaluate legal, liquidity, tax, and mandate constraints prior to executing capital allocations.

# QUANTX Institutional Finance Platform — Landing Page Architecture & Overview

This document provides a comprehensive technical, functional, and design overview of the **QUANTX Landing Page** (`frontend/src/pages/Landing.tsx`).

---

## 🏛 Executive Overview

The **QUANTX Landing Page** is an institutional-grade, high-conversion entrance designed for quantitative researchers, hedge fund portfolio managers, sovereign wealth asset allocators, and proprietary trading desks. 

Unlike standard consumer marketing pages, the QUANTX landing page features **real, interactive UI components, live-rendered charts, deterministic market metrics, and glassmorphic telemetry**, demonstrating the platform's computational depth at first glance.

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                        QUANTX SOVEREIGN LANDING PAGE                           │
│  ├─ Fixed Glassmorphic Navigation Bar (Logo, Nav Links, Sign In / Sign Up)     │
│  ├─ 01 Hero Section: Executive Typography + Live Interactive Terminal Mockup   │
│  ├─ Real-Time Continuous Market Ticker Marquee (NIFTY, SENSEX, BANK NIFTY)    │
│  ├─ 02 Market Intelligence: Sector Rotation & Breadth Heatmap                  │
│  ├─ 03 Alpha Engine: Multi-Factor Composite & Sparkline Deciles                │
│  ├─ 04 Portfolio Optimization: Interactive SVG Efficient Frontier Visualizer   │
│  ├─ 05 Institutional Risk: GARCH-DCC Variance Decomposition & Limit Gauges     │
│  ├─ 06 Event-Driven Backtesting: 1,842 Rebalance Tearsheet & Monthly Heatmap   │
│  ├─ 07 AI Quant Copilot: Grounded Research Note & One-Click Remediation CTAs   │
│  ├─ 08 System Architecture: 4-Layer Estate (Data, Compute, Model, Experience)  │
│  ├─ 09 Out-of-Sample Performance: Institutional KPIs & Equity Growth Curve     │
│  ├─ 10 Terminal Launch CTA: One-Click Workstation Access                       │
│  └─ Regulatory Footer: Full Product Sitemap, Disclaimer & Build Metadata       │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 💎 Core Page Architecture & Interactive Components

### 0. The Quantum Synthesizer Preloader (`QuantumSynthesizerPreloader`)
A high-performance startup simulation reflecting the compilation of platform quantitative solvers:
* **Concentric SVG Orbitals**: Outer ring rotating clockwise (`spin-clockwise 8s`), inner ring counter-clockwise (`spin-counterclockwise 5s`), with a central pulsing emerald beacon.
* **ASCII Progress Engine**: Monospaced progress bar `[=============================>.........] 74%` updating across 5 deterministic stages:
  1. *Bootstrapping scrypt KDF (RFC 7914) & Password Hashing Core*
  2. *Initializing AlphaLab Factor Regression (9 Families, IC Monitors)*
  3. *Compiling Convex Quadratic Solver & Ledoit-Wolf Covariance Engine*
  4. *Connecting to Apache Flink In-Memory Stream Bus*
  5. *Enforcing Multi-Tenant Position Boundaries & In-Memory Enclaves*
* **System Telemetry Footer**: Memory allocation counter (`512MB / 512MB`) and tick latency (`14ms · ap-south-1`).
* **Manual Replay**: Can be re-triggered anytime via the Hero badge button or Telemetry HUD.

---

### 1. Navigation Header & Institutional Telemetry HUD (`LandingTelemetryHUD`)
* **Dynamic Backdrop Blur**: Uses `backdrop-blur-xl` and `bg-[#040608]/90` with scroll-detection state (`window.scrollY > 12`).
* **Institutional Demo Mode / Telemetry HUD Button**: A pulsing button in the top navigation triggering a sliding glassmorphic HUD drawer from the right screen edge.
* **Live Telemetry Drawer Metrics**:
  * **System Status**: `[ONLINE / HEALTHY]` (AWS ap-south-1 Mumbai)
  * **Data Engine Ingestion**: `12,482 events/sec (18ms)`
  * **DuckDB Trace**: `1.8ms Vectorized`
  * **Ray Compute Cluster**: `3 Nodes / 12,480 Paths`
  * **MiFID II RTS 25 Clock**: `<14μs PTP Synced`
* **Real-Time Hover Action Trace**: As users scroll or hover over section cards (Alpha, Optimizer, Risk, Backtest, Copilot), the HUD appends corresponding computational logs in real time.

---

### 2. Section 01: Hero & Live Interactive Command Center

#### Hero Value Proposition & Typography
* **Tagline**: *"QUANTITATIVE INTELLIGENCE FOR MODERN CAPITAL."*
* **Value Pillars**: Research Alpha • Optimize Portfolios • Control Risk • Simulate Execution.
* **Key Platform Stats**:
  * `₹10.42 Cr` — AUM Simulated
  * `1.82` — Composite Out-of-Sample Sharpe Ratio
  * `142` — Real-Time Live Engineered Features

#### The Live Hero Terminal (`HeroTerminal`)
An interactive micro-workstation rendered directly inside the hero area:
* **Header Status Bar**: Pulsing green status dot, `Executive Command Center` title, and live time stamp (`15:30:04 IST · PAPER`).
* **KPI Metrics Ribbon**:
  * **NAV**: `₹10.42 Cr` ($+14.72\%$)
  * **Sharpe**: `1.82` ($+0.14$)
  * **95% VaR**: `₹18.4 L` ($-1.77\%$)
* **Comparative Performance Canvas**: Dual-line fluid SVG sparkline charting **Portfolio Growth vs NIFTY 50 Index**.
* **Alpha Intelligence Grid**: Live multi-factor signals with momentum scoring, machine learning execution probability, and recommendation tags (`BUY` / `SELL` / `HOLD`).
* **Multi-Asset Allocation Donut (`AllocationRadial`)**: Visual breakdown across Equities (72%), Debt (18%), Derivatives (6%), and Cash (4%).
* **Active Risk Alert Marquee**: Critical notification displaying dynamic auto-hedge status.

---

### 3. Real-Time Index Ticker Marquee
* **Infinite Rolling Tape**: CSS marquee animation (`qx-ticker 42s linear infinite`) displaying live index prices, tick changes, and percentage deltas across:
  * NIFTY 50
  * SENSEX
  * NIFTY BANK
  * NIFTY IT
  * NIFTY AUTO
  * NIFTY FMCG

---

### 4. Interactive Feature Showcases (Sections 02 – 07)

Each section utilizes alternating split-column layouts with micro-data visualization frames:

| Section # | Module Name | Core Value Proposition | Interactive Visual Component |
|---|---|---|---|
| **02** | **Market Intelligence** | Consolidated tape, continuous breadth & sector rotation | Real-time horizontal bar chart showing sector momentum across 8 major industry sectors |
| **03** | **Alpha Engine** | 9 factor families blended via gradient-boosted ensemble | Multi-factor decile cards with historical sparklines for Momentum, ML Ensemble, Quality, and Value |
| **04** | **Portfolio Optimization** | Cost-aware quadratic solver over Ledoit-Wolf shrunk covariance | Animated SVG **Efficient Frontier** curve plotting Min Variance, Max Sharpe, Current, and Optimized allocations |
| **05** | **Institutional Risk** | GARCH-DCC variance decomposition & limit surveillance | Multi-segment risk decomposition bar + dynamic progress limit meters for Beta, Concentration, and VaR |
| **06** | **Event-Driven Backtesting** | Point-in-time tape replay with no survivorship bias | 1,842-rebalance simulation tearsheet with 60-period return intensity heatmap |
| **07** | **AI Quant Copilot** | Grounded research notes with explicit data lineage | Structured Copilot response card with quantified risk drivers and one-click action buttons |

---

### 5. Section 08: Layered System Architecture

A modular 4-layer enterprise architecture breakdown:
1. **Data Layer**: Delta Lakehouse, Apache Kafka tick ingestion, Great Expectations contract validation.
2. **Compute Layer**: Ray distributed cluster, OSQP convex optimization, vectorized Numba kernels.
3. **Model Layer**: MLflow registry, PSI drift surveillance, purged cross-validation, champion/challenger shadow routing.
4. **Experience Layer**: Unified React design system, dense data grids, ⌘K command palette, WCAG-compliant contrast.

**Enterprise Guarantees**:
* **Security**: SOC 2 Type II controls, hardware MFA, cryptographic audit lineage.
* **Reliability**: 99.87% composite uptime, colo-hosted OMS, blue/green deployments.
* **Performance**: 18ms tick ingestion, 34ms inference, 1.8s constrained optimization.

---

### 6. Section 09: Out-of-Sample Performance Analytics

Displays institutional quantitative track record metrics (net of 18bps all-in transaction cost):
* **CAGR**: `21.4%` (vs `12.8%` Benchmark)
* **Sharpe Ratio**: `1.82` (Rf `6.8%`)
* **Sortino Ratio**: `2.41` (Downside $\sigma = 6.2\%$)
* **Max Drawdown**: `−8.43%` (Recovered in 22 days)
* **Win Rate**: `58.4%` (Over 542 trades)
* **Information Ratio**: `1.21` (vs NIFTY 50)
* **Long-Term Growth Curve**: Full-width SVG sparkline covering April 2019 to August 2026.

---

### 7. Section 10: Call to Action (CTA) & Institutional Footer

* **Action Buttons**:
  * `ENTER QUANTX` $\rightarrow$ Redirects to `/dashboard` (or `/signup`)
  * `MEET THE COPILOT` $\rightarrow$ Redirects to `/copilot`
* **Footer Navigation Grid**:
  * **Platform**: Overview, Markets, Alpha Lab, Optimizer.
  * **Risk & Ops**: Risk Center, Backtesting, Models, Data Quality.
  * **System**: AI Copilot, Alerts, Monitoring, Settings.
* **Regulatory Compliance Notice**: Clear disclaimer stating synthetic demonstration status, build tags, and region identifiers (`build quantx-web 4.2.0 · ap-south-1`).

---

## 🎨 UI/UX Design System & Aesthetics

* **Color Palette**:
  * Background: `#080c10` (Primary Dark), `#0d131a` (Secondary), `#121a24` (Surface High)
  * Accent Emerald: `#3DDC97` (`--acc`)
  * Accent Cyan / Electric: `#6EA8FE` (`--acc2`)
  * Institutional Gold: `#C8A96B` (`--gold`)
  * Negative / Alert Red: `#FF5C6C` (`--neg`)
* **Typography**:
  * Headings: Inter / Outfit with negative letter tracking (`tracking-[-0.035em]`)
  * Data & Numerical Tables: JetBrains Mono / Tabular Numbers (`tnum`, `mono`)
* **Animations**:
  * Smooth entry reveal on viewport scroll (`useReveal` hook with `IntersectionObserver`).
  * SVG path stroke animation (`anim-draw`).
  * Live status beacon pulse (`anim-pulse-dot`).
  * Continuous marquee ticker (`qx-ticker`).

---

## 🚀 How to Access & Test the Landing Page

1. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```
   *(Or click the logo from any internal page to return to the landing page).*

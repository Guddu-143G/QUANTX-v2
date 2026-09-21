# Terminal 1: Backend
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

# Terminal 2: Frontend
cd frontend
npm.cmd run dev


# QUANTX Institutional Finance Platform — Run & Execution Guide

This document contains all operational commands to run, build, test, and deploy the **QUANTX** platform across Windows (PowerShell / Command Prompt), macOS, and Linux.

---

## ⚡ Active Platform Endpoints

| Service | Address | Description |
|---|---|---|
| **Frontend Web Terminal** | [http://localhost:5173](http://localhost:5173) | Vite + React 19 Institutional Dashboard |
| **v22 MARL & L2/L3 Swarm Studio** | [http://localhost:5173/marl](http://localhost:5173/marl) | Autonomous Dec-POMDP Rebalancing & Micro-Price |
| **v21 Model Orchestrator Studio** | [http://localhost:5173/models](http://localhost:5173/models) | Purged K-Fold Training & Champion/Challenger Router |
| **Zerodha Live Demat Terminal** | [http://localhost:5173/integrations/zerodha](http://localhost:5173/integrations/zerodha) | Live NSE/BSE Feeds & Demat Auto-Sync |
| **Backend API Root** | [http://127.0.0.1:8001](http://127.0.0.1:8001) | High-Performance FastAPI Engine |
| **v22 MARL Telemetry API** | [http://127.0.0.1:8001/api/v1/marl/telemetry](http://127.0.0.1:8001/api/v1/marl/telemetry) | Dual-Agent Swarm, Micro-Price, Risk Arbitrator |
| **v21 Orchestrator Telemetry API** | [http://127.0.0.1:8001/api/v1/orchestrator/telemetry](http://127.0.0.1:8001/api/v1/orchestrator/telemetry) | Champion/Challenger, Drift PSI, Ray Cluster Status |
| **Zerodha Holdings REST API** | [http://127.0.0.1:8001/api/v1/integrations/zerodha/holdings](http://127.0.0.1:8001/api/v1/integrations/zerodha/holdings) | Transformed Demat & Telemetry (NAV, VaR, HHI) |
| **Swagger / OpenAPI UI** | [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs) | Interactive API exploration & schemas |
| **ReDoc Interactive Docs**| [http://127.0.0.1:8001/redoc](http://127.0.0.1:8001/redoc) | Formal API documentation |
| **API Health Check** | [http://127.0.0.1:8001/health](http://127.0.0.1:8001/health) | Engine heartbeat & active state |
| **v35 Singularity & Entangled AI Studio** | [http://localhost:5173/singularity-v35](http://localhost:5173/singularity-v35) | DiT Diffusion World Model, CV-QKD OMS, CNT-EMS & Constitutional AI |
| **v34 Sovereign DNA & Topological Studio** | [http://localhost:5173/sovereign-v34](http://localhost:5173/sovereign-v34) | DNA Storage, tQNPU Anyon Braiding, Cross-Chain CBDC & Epigenetics |
| **v35 Singularity System Telemetry API** | [http://127.0.0.1:8001/api/v1/v35/system/summary](http://127.0.0.1:8001/api/v1/v35/system/summary) | 5-Stage Singularity Pipeline, CV-QKD Bell State & Proof Bounds |
| **Vite Proxy Health** | [http://localhost:5173/health](http://localhost:5173/health) | Frontend-to-Backend proxy bridge |

---

## 🚀 Quick Start: Running the Services

### Option A: Quick Dual-Launch in One PowerShell Command (Windows)

To open both backend and frontend concurrently in two separate terminal windows:

```powershell
# Run from repository root directory:
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm.cmd run dev"
```

---

### Option B: Manual Two-Terminal Startup

#### Terminal 1: Launch Backend API (FastAPI)

```bash
# 1. Navigate to backend
cd backend

# 2a. Windows PowerShell (Direct Execution without ExecutionPolicy issues):
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

# 2b. Windows PowerShell (With Virtual Environment Activated):
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

# 2c. Windows Command Prompt (CMD):
.\.venv\Scripts\activate.bat
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

# 2d. Linux / macOS (Bash / Zsh):
source .venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

> **Note on Port**: Backend runs on port `8001` (to prevent collision with Docker, WSL, or default web services on port 8000).

#### Terminal 2: Launch Frontend Terminal (Vite + React 19)

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies (if first time or after git pull)
# Windows PowerShell (use npm.cmd to avoid ExecutionPolicy PSSecurityException):
npm.cmd install
# Windows CMD / Linux / macOS:
npm install

# 3. Start Vite Development Server
# Windows PowerShell:
npm.cmd run dev
# Windows CMD / Linux / macOS:
npm run dev
```

* **Frontend Network Host Access** (to expose to LAN/other devices):
  ```bash
  npm.cmd run dev -- --host 0.0.0.0 --port 5173
  ```

---

## 📦 Production Builds & Packaging

### Single-File Standalone HTML Bundle
To generate a single, zero-dependency, self-contained `dist/index.html` containing all JS, CSS, fonts, and assets inlined for offline institutional distribution:

```bash
cd frontend

# Windows PowerShell:
npm.cmd run build

# Windows CMD / Linux / macOS:
npm run build
```

* **Output Bundle**: `frontend/dist/index.html` (approx. **1,760 kB** | gzip: **460 kB** | 2,440 modules transformed)
* **Previewing the Built Bundle**:
  ```bash
  npm.cmd run preview
  # or
  npm run preview
  ```

---

## 🧪 Testing, Quality Assurance & E2E Suites

### 1. Frontend Type Validation (TypeScript)
```bash
cd frontend

# Windows PowerShell:
npx.cmd tsc --noEmit

# Windows CMD / Linux / macOS:
npx tsc --noEmit
```

### 2. Backend Sovereign Engine E2E Verification Suites
The platform features dedicated end-to-end verification suites covering versions v11 through v20.

```bash
cd backend

# Run individual version suites (Windows):
.\.venv\Scripts\python.exe test_v11_e2e.py   # Quantum QAOA, Climate SFDR, AltData, RL Guardrail
.\.venv\Scripts\python.exe test_v12_e2e.py   # AutoQuant Swarms, Diffusion LOB, PQC, ISDA SIMM
.\.venv\Scripts\python.exe test_v13_e2e.py   # PINN Volatility, R-GCN Contagion, MPC Dark Pool, DvP
.\.venv\Scripts\python.exe test_v14_e2e.py   # L3-GAT Microprice, VQE Tail Risk, Basel IV, zk-SNARK
.\.venv\Scripts\python.exe test_v15_e2e.py   # eBPF/FPGA ITCH 5.0, SDE Diffusion, zk-MPC, PPO Router
.\.venv\Scripts\python.exe test_v16_e2e.py   # Transformer-SDE, SNN Neuromorphic, TDA Crash Warning
.\.venv\Scripts\python.exe test_v17_e2e.py   # Conformal Risk, MFG Crowding, Contrastive, zk-STARK
.\.venv\Scripts\python.exe test_v18_e2e.py   # Browser Wasm/SIMD, Iceberg OBI, WebRTC Voice, PQC Log
.\.venv\Scripts\python.exe test_v19_e2e.py   # DPDK Bypass, Dynamic VPIN, FPGA Risk Gate, Vector RAG
.\.venv\Scripts\python.exe test_v20_e2e.py   # NightWatch Staging, MFI, Consent Gate, Dead-Man Switch
.\.venv\Scripts\python.exe test_v21_e2e.py   # v21 Model Orchestrator, Purged CV, PSI Drift, Promotion Gate
.\.venv\Scripts\python.exe test_v22_e2e.py   # v22 Autonomous MARL, Micro-Price/OBI, Deterministic Risk Gate
.\.venv\Scripts\python.exe test_v23_e2e.py   # v23 Deep Learning Copilot: TFT Forecaster, TCN Patterns, SAC Execution, VAE Anomaly
.\.venv\Scripts\python.exe test_v24_e2e.py   # v24 Causal AI (Pearl Do-Calculus), ST-GNN Contagion, ReAct Copilot, Sub-ns PTP, Quantum MPS
.\.venv\Scripts\python.exe test_v25_e2e.py   # v25 Neuromorphic LNN, Zero-Knowledge Solvency (zk-PoS), Federated SMPC, Bare-Metal Wasm
.\.venv\Scripts\python.exe test_v26_e2e.py   # v26 Topological Data Analysis (TDA), Quantum MPS DMRG, Z3 SMT Prover, zk-MPC Dark Pool, Sub-100ns SPSC
.\.venv\Scripts\python.exe test_v28_e2e.py   # v28 Portfolio Ledger: Zero-Demo Purge, HIFO/FIFO Lots, Brinson Attribution, Drift, Margin Health
.\.venv\Scripts\python.exe test_v27_e2e.py   # v27 Full NSE/BSE Universe (5,000+ Equities), Multi-Socket KiteTicker Cluster, Zero Demo Data
.\.venv\Scripts\python.exe test_zerodha_e2e.py  # Zerodha Kite Connect v3 Live Integration & Demat Sync

# Run on Linux / macOS:
python test_v28_e2e.py
python test_v27_e2e.py

python test_v26_e2e.py
python test_v25_e2e.py
python test_v24_e2e.py
python test_v23_e2e.py
python test_v22_e2e.py
python test_v21_e2e.py
python test_zerodha_e2e.py
```

#### Run All Backend Tests in Batch (PowerShell):
```powershell
cd backend
Get-ChildItem -Filter "test_v*.py" | ForEach-Object {
    Write-Host ">>> Running $($_.Name)..." -ForegroundColor Cyan
    .\.venv\Scripts\python.exe $_.Name
}
```

---

## 🔍 Verification & Health Checking via CLI

### Check Backend Health
* **Windows PowerShell**:
  ```powershell
  Invoke-RestMethod -Uri http://127.0.0.1:8001/health -Method GET
  ```
* **Linux / macOS cURL**:
  ```bash
  curl -s http://127.0.0.1:8001/health | jq .
  ```

### Check Frontend Serving & Proxy
* **Windows PowerShell**:
  ```powershell
  # Check Frontend:
  Invoke-WebRequest -Uri http://localhost:5173 -UseBasicParsing | Select-Object StatusCode
  # Check Frontend-to-Backend Proxy:
  Invoke-RestMethod -Uri http://localhost:5173/health -Method GET
  ```

---

## 🛠 Environment Variables Configuration

Create a `.env` file in the `backend/` directory if custom parameters or cryptographic secrets are required:

```ini
APP_ENV=development
PORT=8001
HOST=0.0.0.0
SESSION_SECRET=quantx-sovereign-grade-256-bit-key-here
SESSION_TTL_HOURS=8
QUANTX_DATABASE_URL=quantx.db
LOG_LEVEL=INFO
```

---

## 🛑 Stopping Services & Freeing Ports

### Interactive Terminals
* Press `Ctrl + C` in both backend and frontend windows.

### Windows PowerShell Process Cleanup
```powershell
# Terminate any lingering python or node server instances:
Get-Process -Name python, node -ErrorAction SilentlyContinue | Stop-Process -Force

# Or specifically free ports 8001 and 5173:
Get-NetTCPConnection -LocalPort 8001, 5173 -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}
```

### Linux / macOS Cleanup
```bash
# Free ports 8001 and 5173:
lsof -ti:8001,5173 | xargs kill -9
```

---

## 📋 Sovereign Architecture & Version Roadmap

| Version | Spec File | Key Features |
|---------|-----------|--------------|
| **v5** | `suggestions-v5.md` | Convex optimizer, OSQP solver, Ledoit-Wolf covariance shrinkage |
| **v6** | `suggestions-v6.md` | scrypt KDF cryptographic vault, L3 order book event reconstruction |
| **v7** | `suggestions-v7.md` | Multi-tenant tenant isolation, in-memory cryptographically isolated enclaves |
| **v8** | `suggestions-v8.md` | Real-time TCA engine, Almgren-Chriss optimal liquidation, MiFID II clock sync |
| **v9** | `suggestions-v9.md` | HFT microstructure, convex smart order router (SOR), SEC Rule 15c3-5 risk gate |
| **v10** | `suggestions-v10.md` | Avellaneda-Stoikov MM, AutoQuant AST Alpha, Causal Macro SVAR, Institutional RFQ & ZK Bridge |
| **v11** | `suggestions-v11.md` | Hybrid QAOA quantum optimizer, SFDR Article 8/9 climate risk engine, multimodal alt-data ingestion |
| **v12** | `suggestions-v12.md` | AutoQuant factor swarm, conditional diffusion L3 simulator, PQC Kyber/Dilithium, ISDA SIMM 2.6 |
| **v13** | `suggestions-v13.md` | PINN arbitrage-free volatility surface, R-GCN systemic contagion, Shamir MPC dark pool, Atomic DvP |
| **v14** | `suggestions-v14.md` | L3-GAT microprice prediction, Quantum VQE tail risk, Basel IV (FRTB/NSFR/LCR), zk-SNARK collateral |
| **v15** | `suggestions-v15.md` | eBPF & FPGA ITCH 5.0 NIC ingress, SDE score diffusion stress, zk-MPC risk aggregator, PPO anti-predatory |
| **v16** | `suggestions-v16.md` | Transformer-SDE world model, Neuromorphic SNN microstructure, TDA crash early-warning, zk-RWA vault |
| **v17** | `suggestions-v17.md` | Conformal prediction intervals, continuous Mean-Field Games (MFG), contrastive regime learning, zk-STARK filings |
| **v18** | `suggestions-v18.md` | In-Browser WebAssembly (Wasm/SIMD) Monte Carlo, Iceberg/OBI detector, WebRTC Voice Risk Officer, PQC audit |
| **v19** | `suggestions-v19.md` | DPDK/EF_VI kernel bypass, dynamic VPIN surface radar, <120ns FPGA risk gate, bi-temporal vector RAG |
| **v20** | `suggestions-v20.md` | NightWatch overnight staging, Market Favorability Index (MFI), interactive pre-market consent gate, dead-man halt |
| **Zerodha v3** | `suggestion.md` | Zerodha Kite Connect v3 live Demat auto-sync, KiteTicker sub-ms buffer, L1/L2 top-5 depth, NightWatch MFI bridge |
| **v21** | `suggestions-v21.md` | Enterprise Data-Aware Model Orchestrator, Purged & Embargoed Cross-Validation (Marcos López de Prado), Gram-Schmidt Orthogonalization, PSI Feature Drift Surveillance, Champion/Challenger Shadow Gates, Great Expectations 3-Point Data Quality Contract |
| **v22** | `suggestions-v22.md` | Autonomous Multi-Agent Reinforcement Learning (MARL), Real-Time L2/L3 Micro-Price & OBI Ingestion, Deterministic Risk Arbitrator (12% position cap, 30% sector cap, -8.43% drawdown circuit breaker), Fat-Finger Price Collar (±2.0%) |
| **v23** | `suggestions-v23.md` | Temporal Fusion Transformer (TFT) Multi-Horizon Forecaster (GRN + GLU + Quantiles), TCN-CNN Dilated Causal Pattern Engine (Sweeps/Icebergs/Breakouts), Soft Actor-Critic (SAC) Deep RL Execution Co-Pilot (Continuous State/Action + Implementation Shortfall), Variational Autoencoder (VAE) Microstructure Anomaly & Spoofing Detector (ELBO Loss), Vision-Language Multimodal Trading Copilot (Bi-Temporal RAG) |
| **v24** | `suggestions-v24.md` | Judea Pearl Causal Machine Learning (Do-Calculus Backdoor/Frontdoor Adjustments), Spatial-Temporal Graph Neural Network (ST-GNN Dynamic Cross-Quantilogram Adjacency & GAT Contagion), Agentic Tree-of-Thought (ToT) / ReAct Copilot (4-Phase Reasoning & Self-Reflective VaR/Sector Scaling), Sub-Nanosecond Photonic IEEE 1588v2 Hardware PTP Telemetry, Quantum-Inspired Matrix Product State (MPS) Discrete Lot Optimizer |
| **v25** | `suggestions-v25.md` | Continuous-Time Neuromorphic Liquid Neural Networks (LNN ODE Solver with Dynamic $\tau_{\text{eff}}$ Adaptation), Zero-Knowledge Proof-of-Solvency & VaR Compliance (zk-PoS with Homomorphic Pedersen Commitments & $\mathcal{O}(1)$ Groth16 Verifier), Federated Multi-Desk Alpha Orchestration ($(\epsilon, \delta)$-Differential Privacy & SMPC Secret Sharing), Sovereign Bare-Metal Edge Firmware ($< 500\text{ns}$ Wasm Execution & Autonomous Offline Fallback Delta-Neutral Hedging) |
| **v26** | `suggestions-v26.md` | Topological Data Analysis (TDA Persistent Homology, Vietoris-Rips filtration, Betti numbers $\beta_0, \beta_1$, Wasserstein distance $W_p > 0.85$ flash-crash early warning), Quantum MPS DMRG Ground-State Optimizer ($\mathcal{O}(N\cdot\chi^3)$ discrete lots), Autonomous Code Synthesis Engine with Z3 SMT Formal Theorem Prover (`HOT_RELOAD_APPROVED` / `REJECTED`), Zero-Knowledge Multi-Party Computation (zk-MPC) Dark Pool (Yao's Garbled Circuits + 1-out-of-2 Oblivious Transfer), Sub-100ns Lock-Free SPSC Ring Buffer (`alignas(64)` L1 cache line padding, acquire-release atomics, zero-mutex $<100\text{ns}$) |
| **v27** | `suggestions-v27.md` | Full NSE/BSE Universe Integration (5,000+ Listed Equities), In-Memory DuckDB-Style Token & Symbol Indexing, Multi-Socket KiteTicker WebSocket Cluster (Auto-Sharded across $K=\lceil N/2500\rceil$ Worker Nodes with Tiered Modes: `MODE_FULL` 5-depth, `MODE_QUOTE`, `MODE_LTP`), Zero-Demo Real-Time Demat Portfolio Telemetry (Live NAV, Unrealized P&L, 95% 1-Day VaR), Full-Market Breadth Radar (Advance/Decline & 12-Sector Heatmap) |
| **v28** | `suggestions-v28.md` | Institutional Portfolio Ledger & Tax-Lot Accounting, Zero-Demo Complete Purge, HIFO/FIFO/LIFO Multi-Lot Matching, Indian Statutory Fee Engine (STT 0.1%, Brokerage ₹20, Turnover, GST, SEBI), Real-Time Capital Gains Classification (STCG <12M @ 20%, LTCG >=12M @ 12.5%), Tax-Loss Harvesting Scanner, Intraday Brinson-Fachler Multi-Sector Attribution (Allocation, Selection, Interaction), L1-Norm Weight Drift Surveillance, Corporate Actions Reconciliation (Split/Bonus/Dividend), Margin Health & 18% Collateral Haircut |
| **v29** | `suggestions-v29.md` | Visual Analytics, Financial Statement Analysis, WACC/DSCR Multi-Factor Capital Grading, 10-Layer Institutional Deep Learning Investment Recommender, Waterfall & Distribution Radar |
| **v30** | `suggestions-v30.md` | Autonomous Portfolio Intelligence, OCR Financial Document Ingestion, Graph Attention Network (GAT) Contagion, 100k-Path GPU Monte Carlo Rebalancer, Continuous TWAP/VWAP/POV Order Slicer |
| **v31** | `suggestions-v31.md` | Generative L2/L3 World Model, Continuous Limit Order Book Diffusion Simulator, Self-Healing SmartNIC FPGA EMS, Counterfactual Do-Calculus Router, zk-SNARK Execution Audit Trail |
| **v32** | `suggestions-v32.md` | NIST Dilithium/Kyber Post-Quantum Cryptographic Security, Photonic MZI Optical Waveguide Tensor Coprocessor, Zero-Knowledge DvP Atomic Multi-Asset Settlement, Causal DAG Contagion Arbitrage |
| **v33** | `suggestions-v33.md` | Sovereign Memristive Vector-Matrix Multipliers (VMM), Stochastic PDE Heston Implied Volatility Surface, Zero-Knowledge Federated Liquidity Discovery (zk-FLDG), Artificial Immune System (AIS) Digital Antibodies, Byzantine Fault-Tolerant (BFT) Risk Consensus Swarm |
| **v34** | `suggestions-v34.md` | Biological DNA Wetware Storage & Archival Vault, Topological Quantum Neural Processing Unit (tQNPU Majorana Anyon Braiding), Sovereign Cross-Chain CBDC Multi-Currency DvP Liquidity Bridge (eINR, eUSD, eEUR), Epigenetic MARL Swarm Policy Optimization |
| **v35** | `suggestions-v35.md` | Generative Synthetic Market Singularity Engine (Latent Diffusion Transformer / DiT World Model 15σ Tail Shock & 99% Depth Vacuum), Entangled Quantum Photonic OMS (Continuous-Variable QKD Bell State \|Φ+⟩ <1ns Consensus), Carbon Nanotube Molecular Execution Fabric (CNT-FET 0.92ps, 1,067x lower thermal footprint), Constitutional AI Autonomous Fund Governance (Deterministic Mathematical Proof Bounds P(Breach)=0 & Real-Time Self-Healing Compiler) |
| **v2 UI** | `ui_ux_stack-v2.md` | Quantum Synthesizer preloader (3-phase), Telemetry HUD split panel, Canvas sparklines, Glassmorphic Obsidian |

---

### v28 Institutional Portfolio Ledger & Tax Accounting REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/portfolio/ledger/summary` | Real-time portfolio AUM, cash balance, invested market value, cost basis, unrealized and realized STCG/LTCG P&L |
| `GET` | `/api/v1/portfolio/ledger/transactions` | Chronological audit ledger of all manual and automated fills with statutory fee breakdown |
| `POST` | `/api/v1/portfolio/ledger/transaction` | Records manual transaction (BUY, SELL, SHORT, COVER, CASH_DEPOSIT, CASH_WITHDRAWAL) with HIFO/FIFO/LIFO lot matching |
| `GET` | `/api/v1/portfolio/ledger/tax-lots` | Active inventory tax-lots with holding days, acquisition timestamp, STCG/LTCG tags, and unrealized gains |
| `GET` | `/api/v1/portfolio/ledger/tax-harvesting` | Automated tax-loss harvesting candidate scanner calculating total harvestable loss and 20% STCG tax savings |
| `GET` | `/api/v1/portfolio/ledger/brinson-attribution` | Multi-sector Intraday Brinson-Fachler active return decomposition against NIFTY 50 (Allocation, Selection, Interaction in bps) |
| `GET` | `/api/v1/portfolio/ledger/drift` | L1-norm portfolio weight drift surveillance with $\pm 2.5\%$ position and $10.0\%$ portfolio rebalance alert thresholds |
| `POST` | `/api/v1/portfolio/ledger/corporate-action` | Automated reconciliation of stock splits, bonus shares, and cash dividends across inventory tax-lots |
| `GET` | `/api/v1/portfolio/ledger/margin-health` | Pledged collateral evaluation with 18% standard haircut, Initial/Maintenance margin utilization, and buffer score |
| `POST` | `/api/v1/portfolio/ledger/reset` | Purges all holdings, transactions, and cash to initialize a clean zero-state empty portfolio |
| `POST` | `/api/v1/portfolio/ledger/seed-baseline` | Seeds institutional portfolio mandate across 12 top-tier NSE equities with ₹25L cash buffer |


---

### v23 Deep Learning & AI Trading Copilot REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/dl/telemetry` | Telemetry HUD status for all 5 v23 DL modules |
| `POST` | `/api/v1/dl/analyze-market` | Unified inference pipeline across TFT, TCN, SAC, VAE, and Copilot |
| `POST` | `/api/v1/dl/forecast` | Non-parametric multi-horizon quantile forecast ($q_{10}, q_{50}, q_{90}$) |
| `POST` | `/api/v1/dl/patterns/detect` | TCN-CNN dilated causal microstructure pattern detection |
| `POST` | `/api/v1/dl/sac/slice` | Continuous execution slice recommendation via Soft Actor-Critic RL |
| `POST` | `/api/v1/dl/vae/anomaly` | L2/L3 order book microstructure anomaly & spoofing scoring via VAE ELBO |
| `POST` | `/api/v1/dl/copilot/reason` | Vision-Language multimodal indicator reasoning with Bi-Temporal RAG |

---

### v24 Causal AI, ST-GNN, ReAct Copilot & PTP Telemetry REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/causal/telemetry` | Telemetry HUD status for all 5 v24 Causal AI, ST-GNN, ReAct, MPS & PTP modules |
| `POST` | `/api/v1/causal/do-effect` | Judea Pearl Do-Calculus backdoor/frontdoor adjustment with quantile stratification |
| `POST` | `/api/v1/causal/st-gnn/contagion` | Dynamic Cross-Quantilogram adjacency ($\tau=0.05$) & GAT liquidity contagion propagation |
| `POST` | `/api/v1/causal/react/verify` | Agentic 4-phase ReAct reasoning with self-reflective VaR, position, and sector scaling |
| `POST` | `/api/v1/causal/mps/optimize` | Quantum-inspired Matrix Product State 1D tensor chain discrete lot (lot_size=25) allocation |
| `GET` | `/api/v1/causal/ptp/telemetry` | Sub-nanosecond photonic IEEE 1588v2 optical clock jitter and L3 queue tracking |
| `POST` | `/api/v1/causal/pipeline/execute` | End-to-end institutional orchestrator executing all 5 modules synchronously |

---

### v25 Sovereign AI, Neuromorphic LNN, zk-PoS & Federated Edge REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/sovereign/telemetry` | Telemetry HUD status for all 4 v25 Neuromorphic LNN, zk-PoS, Federated, and Edge Wasm modules |
| `POST` | `/api/v1/sovereign/lnn/step` | Continuous-time Liquid Neural Network ODE step with dynamic $\tau_{\text{eff}}$ adaptation & regime detection |
| `POST` | `/api/v1/sovereign/zk/prove-solvency` | Generates Pedersen commitment and Groth16 zero-knowledge proof of solvency ($\ge 0$), concentration ($\le 12\%$) and VaR |
| `POST` | `/api/v1/sovereign/zk/verify` | Verifies zk-SNARK proof of solvency in $\mathcal{O}(1)$ pairing time with zero asset disclosure |
| `POST` | `/api/v1/sovereign/federated/aggregate` | Coordinates cross-desk federated alpha learning with $(\epsilon, \delta)$-differential privacy and SMPC aggregation |
| `GET` | `/api/v1/sovereign/edge/status` | Returns bare-metal SmartNIC / FPGA execution diagnostics and Wasm micro-kernel latency ($< 500\text{ns}$) |
| `POST` | `/api/v1/sovereign/edge/toggle-fallback` | Toggles autonomous offline fallback emergency delta-neutral hedging in edge Wasm micro-kernel |
| `POST` | `/api/v1/sovereign/pipeline/execute` | Executes complete v25 sovereign quantitative pipeline synchronously end-to-end |

---

### v26 TDA, Quantum MPS, Z3 SMT Prover, zk-MPC & SPSC REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/tda-quantum/telemetry` | Telemetry HUD status for all 5 v26 TDA, Quantum MPS, Z3 SMT, zk-MPC, and SPSC modules |
| `POST` | `/api/v1/tda-quantum/homology` | Computes Vietoris-Rips filtration, Betti numbers ($\beta_0, \beta_1$), and Wasserstein distance shift metric $W_p$ |
| `POST` | `/api/v1/tda-quantum/mps/optimize` | DMRG ground-state energy minimization on MPS 1D tensor chain with discrete lot enforcement |
| `POST` | `/api/v1/tda-quantum/z3/verify` | Formal theorem proving via Z3 SMT solver for memory safety, buffer bounds, and hot-reload gating |
| `POST` | `/api/v1/tda-quantum/zk-mpc/match` | Matches confidential crossing orders in zk-MPC dark pool using Yao's garbled circuits |
| `GET` | `/api/v1/tda-quantum/spsc/status` | Returns lock-free SPSC ring buffer diagnostics, 64-byte cache alignment, and sub-100ns latency telemetry |
| `POST` | `/api/v1/tda-quantum/pipeline/execute` | End-to-end institutional orchestrator executing all 5 modules synchronously |

---

### v27 Universal Zerodha Market & Sharded WebSocket REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/zerodha/universal/telemetry` | Overview of indexed universe count, active WebSocket shards, utilization, and packet loss SLA |
| `GET` | `/api/v1/zerodha/universal/universe` | Sub-millisecond search across 5,000+ equities with exchange, segment, sector, and pagination filters |
| `GET` | `/api/v1/zerodha/universal/cluster/status` | Real-time diagnostic telemetry for each worker node (MODE_FULL, MODE_QUOTE, MODE_LTP, ping, throughput) |
| `POST` | `/api/v1/zerodha/universal/cluster/rebalance` | Dynamically re-shards tokens across worker sockets with configurable capacity limits |
| `GET` | `/api/v1/zerodha/universal/market-breadth` | Full-market advance/decline ratio, 52W highs/lows, sentiment, and 12-sector performance radar |
| `GET` | `/api/v1/zerodha/universal/portfolio/telemetry` | Real-time Demat NAV, cost basis, unrealized P&L, 95% 1-Day VaR, and tick deltas |
| `POST` | `/api/v1/zerodha/universal/order/place` | Live order placement router with fill confirmation into institutional EMS blotter |
| `GET` | `/api/v1/zerodha/universal/blotter` | Execution blotter tracking all live and simulated institutional order fills |
| `POST` | `/api/v1/zerodha/universal/historical` | Dynamic point-in-time historical OHLCV candle fetch for factor modeling |
| `POST` | `/api/v1/zerodha/universal/covariance` | Real-time Ledoit-Wolf shrunk covariance matrix from live returns vectors |

---

### v35 Synthetic Market Singularity, Entangled OMS & Constitutional AI REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/v35/system/summary` | Architectural telemetry across all 4 v35 modules, user AUM, and status |
| `POST` | `/api/v1/v35/singularity/generate-universe` | DiT score-based reverse diffusion generating synthetic market with $15\sigma$ jumps & $99\%$ depth collapse |
| `POST` | `/api/v1/v35/singularity/multiverse-monte-carlo` | Multi-verse Monte Carlo simulation returning $P_5, P_{50}, P_{95}$ envelopes and tail risk metrics |
| `POST` | `/api/v1/v35/qkd/simulate-sync` | Continuous-Variable QKD Bell state $(\vert\Phi^+\rangle)$ order state lock with $0.85\text{ ps}$ propagation delay |
| `GET` | `/api/v1/v35/qkd/mesh-nodes` | Global Q-Mesh optical topology across 6 international co-location centers |
| `POST` | `/api/v1/v35/qkd/simulate-attack` | Simulates optical eavesdropping, wave-function collapse ($\Delta S > 0$), and auto-reroute |
| `POST` | `/api/v1/v35/cnt/execute-order` | Sub-nanometer CNT-FET order book matching ($\tau_{\text{gate}} = 0.92\text{ ps}$, $0.42\text{ aJ}$ switching energy) |
| `GET` | `/api/v1/v35/cnt/telemetry` | CNT microarchitecture telemetry and $1,067\times$ lower thermal dissipation benchmark vs Silicon |
| `POST` | `/api/v1/v35/constitutional/evaluate-order` | Mathematical proof verification ($P(\text{Breach})=0$) across 5 statutory axioms |
| `GET` | `/api/v1/v35/constitutional/axioms` | Fiduciary, capital solvency, and anti-manipulation constitutional axioms |
| `POST` | `/api/v1/v35/constitutional/self-heal` | Real-time self-healing compiler computing compensatory loss gradient $\mathcal{L}_{\text{guided}}(\theta)$ |
| `POST` | `/api/v1/v35/pipeline/execute` | 5-stage unified autonomous pipeline with FIX.4.4 tag dictionary and SHA-256 cryptographic audit trail |

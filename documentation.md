# QUANTX Institutional Finance Platform Documentation

## 1. Project Overview

**QUANTX** is an institutional finance platform designed to calculate portfolio statistics from user-supplied CSV data. It provides analytical decision support by processing portfolio holdings and historical prices to generate performance, risk, and concentration metrics, as well as a constrained allocation proposal.

It is strictly an analytical tool and does not generate simulated market data or label CSV snapshots as live data.

## 2. System Architecture

The project follows a standard modern client-server architecture:

### Backend
- **Framework**: FastAPI (Python)
- **Server**: Uvicorn
- **Database**: SQLite (`quantx.db`)
- **Key Modules**:
  - `app/main.py`: Application entry point and router setup.
  - `app/analysis.py`: Core financial logic for calculating portfolio metrics.
  - `app/auth.py`: Authentication logic, handling local registration and session management using scrypt hashes and HTTP-only cookies.

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite (with `vite-plugin-singlefile`)
- **Styling**: Tailwind CSS 4
- **Charting & Icons**: Recharts, Lucide React
- **Architecture**: A single-page application (SPA) where the development server proxies `/api` and `/health` requests directly to the local backend.

## 3. Data Contracts (CSV)

The analysis API requires user-supplied CSV files with specific column structures.

### `holdings.csv` (Required Columns)
```csv
ticker,quantity,average_cost,sector
RELIANCE,100,1400,Energy
INFY,50,1800,Technology
```

### `prices.csv` (Required Columns)
```csv
date,ticker,close
2026-01-02,RELIANCE,1412.50
2026-01-02,INFY,1814.20
```
*Note: A common benchmark ticker (e.g., `NIFTY50`) should be included in `prices.csv` and specified during the API call. The API requires at least two dated observations per holding (60+ sessions are recommended for meaningful risk estimates).*

## 4. API Endpoints

### Core Analysis
- `GET /health` : Health check endpoint.
- `POST /api/v1/portfolio/analyze` : Accepts multipart form data (`holdings_file`, `prices_file`) and optional parameters (`benchmark_ticker`, `risk_free_rate`, `max_position_weight`, `max_sector_weight`).
- `POST /api/v1/portfolio/analyze-json` : Equivalent JSON payload for software integrations.

### Authentication (`/api/v1/auth`)
- Provides endpoints for local registration, sign-in, sign-out, and checking current session status.
- Sessions are opaque, server-revocable, and sent in HTTP-only, `SameSite=Strict` cookies.

## 5. Setup & Installation

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1   # On Windows
   # source .venv/bin/activate    # On Linux/macOS
   ```
   .\.venv\Scripts\uvicorn app.main:app --reload --port 8000   #to run the command significantly

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables (copy `.env.example` to `.env` and set `SESSION_SECRET`).
5. Run the development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server (it will automatically proxy API requests to `http://127.0.0.1:8000`):
   ```bash
   npm run dev
   ```

## 6. Security Considerations

- **Authentication Limits**: Local authentication is currently limited to self-registration. For a production financial application, robust infrastructure (Email verification, MFA, SSO, audit logs) must be implemented.
- **Cookies**: In production (`APP_ENV=production`), HTTPS must be enabled to ensure session cookies are marked as `Secure`.

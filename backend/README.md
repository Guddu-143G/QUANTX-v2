# QUANTX analysis API

This API calculates portfolio statistics from user-supplied CSV files. It does not generate simulated market data and never labels a CSV snapshot as live data.

## Run

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The frontend dev server proxies `/api` to this service.

## Authentication

The service provides local registration, sign-in, sign-out and current-session endpoints under `/api/v1/auth`. Passwords are stored with scrypt hashes; sessions are opaque, server-revocable and sent in HTTP-only, SameSite=Strict cookies. Copy `.env.example` to `.env` (or set the variables through your deployment platform) and set a unique `SESSION_SECRET` before production. HTTPS is required in production (`APP_ENV=production`) so session cookies are marked Secure.

Local auth is deliberately limited to self-registration. Email verification, MFA, SSO, password reset delivery, audit-log retention and account provisioning require approved identity/email infrastructure before enabling this for a real finance operation.

## CSV contracts

`holdings.csv` (required columns):

```csv
ticker,quantity,average_cost,sector
RELIANCE,100,1400,Energy
INFY,50,1800,Technology
```

`prices.csv` (required columns):

```csv
date,ticker,close
2026-01-02,RELIANCE,1412.50
2026-01-02,INFY,1814.20
```

Use a common benchmark ticker, such as `NIFTY50`, in `prices.csv`, then submit it as `benchmark_ticker`. The API needs at least two dated observations per holding; 60+ common sessions produces more meaningful risk estimates.

## Endpoints

- `GET /health`
- `POST /api/v1/portfolio/analyze` — multipart `holdings_file`, `prices_file`, optional `benchmark_ticker`, `risk_free_rate`, `max_position_weight`, `max_sector_weight`
- `POST /api/v1/portfolio/analyze-json` — the equivalent JSON payload for integrations

The result includes data freshness, validation warnings, performance/risk/concentration metrics, position diagnostics, a constrained allocation proposal, and machine-readable research findings. It is analytical decision support, not investment advice.

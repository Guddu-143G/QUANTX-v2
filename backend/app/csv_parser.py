import csv
import io
from datetime import datetime
from collections import defaultdict
from fastapi import HTTPException

class CSVValidationError(HTTPException):
    def __init__(self, message: str):
        super().__init__(status_code=422, detail=message)

def validate_holdings_csv(raw: bytes) -> list[dict]:
    try:
        text = raw.decode("utf-8-sig")
        rows = list(csv.DictReader(io.StringIO(text)))
    except (UnicodeDecodeError, csv.Error) as exc:
        raise CSVValidationError(f"Could not read holdings as a UTF-8 CSV: {exc}")
    
    if not rows:
        raise CSVValidationError("Holdings CSV is empty.")

    required_columns = {"ticker", "quantity", "average_cost", "sector"}
    actual_columns = set(rows[0].keys())
    missing_columns = required_columns - actual_columns
    if missing_columns:
        raise CSVValidationError(f"Holdings CSV missing required columns: {', '.join(missing_columns)}")

    validated = []
    seen_tickers = set()

    for idx, row in enumerate(rows, start=2): # +1 for header, +1 for 0-index
        ticker = row.get("ticker", "").strip()
        if not ticker:
            raise CSVValidationError(f"Row {idx}: missing ticker.")
        
        if ticker in seen_tickers:
            raise CSVValidationError(f"Duplicate ticker found: {ticker} on row {idx}.")
        seen_tickers.add(ticker)

        try:
            quantity = float(row["quantity"])
            if quantity <= 0:
                raise ValueError
        except ValueError:
            raise CSVValidationError(f"Row {idx} ({ticker}): quantity must be a positive number.")

        try:
            avg_cost = float(row["average_cost"])
            if avg_cost < 0:
                raise ValueError
        except ValueError:
            raise CSVValidationError(f"Row {idx} ({ticker}): average_cost must be a non-negative number.")

        sector = row.get("sector", "").strip()
        if not sector:
            raise CSVValidationError(f"Row {idx} ({ticker}): missing sector.")

        validated.append({
            "ticker": ticker,
            "quantity": quantity,
            "average_cost": avg_cost,
            "sector": sector
        })

    return validated


def validate_prices_csv(raw: bytes, required_tickers: set, benchmark_ticker: str = None) -> list[dict]:
    try:
        text = raw.decode("utf-8-sig")
        rows = list(csv.DictReader(io.StringIO(text)))
    except (UnicodeDecodeError, csv.Error) as exc:
        raise CSVValidationError(f"Could not read prices as a UTF-8 CSV: {exc}")
    
    if not rows:
        raise CSVValidationError("Prices CSV is empty.")

    required_columns = {"date", "ticker", "close"}
    actual_columns = set(rows[0].keys())
    missing_columns = required_columns - actual_columns
    if missing_columns:
        raise CSVValidationError(f"Prices CSV missing required columns: {', '.join(missing_columns)}")

    validated = []
    ticker_observations = defaultdict(set)
    all_dates = set()

    for idx, row in enumerate(rows, start=2):
        ticker = row.get("ticker", "").strip()
        if not ticker:
            raise CSVValidationError(f"Row {idx}: missing ticker.")
        
        date_str = row.get("date", "").strip()
        try:
            # support YYYY-MM-DD
            dt = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            raise CSVValidationError(f"Row {idx} ({ticker}): invalid date format '{date_str}'. Expected YYYY-MM-DD.")
        
        if dt in ticker_observations[ticker]:
            raise CSVValidationError(f"Duplicate observation for {ticker} on {date_str}.")
        
        ticker_observations[ticker].add(dt)
        all_dates.add(dt)

        try:
            close_price = float(row["close"])
            if close_price <= 0:
                raise ValueError
        except ValueError:
            raise CSVValidationError(f"Row {idx} ({ticker}): close price must be a positive number.")

        validated.append({
            "date": date_str,
            "ticker": ticker,
            "close": close_price
        })

    # Validate that all required tickers (from holdings) exist in prices
    missing_tickers = required_tickers - set(ticker_observations.keys())
    if missing_tickers:
        raise CSVValidationError(f"Prices CSV is missing history for holdings tickers: {', '.join(missing_tickers)}")

    # Validate benchmark
    if benchmark_ticker:
        if benchmark_ticker not in ticker_observations:
            raise CSVValidationError(f"Missing benchmark ticker '{benchmark_ticker}' in prices data.")
        required_tickers.add(benchmark_ticker)

    # Validate sufficient observations
    for ticker in required_tickers:
        obs_count = len(ticker_observations[ticker])
        if obs_count < 60:
            raise CSVValidationError(f"{ticker} has only {obs_count} historical observations. At least 60 sessions are recommended for reliable risk analysis.")
            
    return validated

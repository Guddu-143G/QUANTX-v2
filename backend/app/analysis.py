from __future__ import annotations

import math
from collections import defaultdict
from datetime import date
from statistics import fmean, stdev
from typing import Any

TRADING_DAYS = 252


class AnalysisInputError(ValueError):
    pass


def number(row: dict, *names: str, required: bool = True) -> float | None:
    for name in names:
        value = row.get(name)
        if value not in (None, ""):
            try:
                return float(str(value).replace(",", "").replace("₹", ""))
            except ValueError as exc:
                raise AnalysisInputError(f"Invalid numeric value for '{name}': {value}") from exc
    if required:
        raise AnalysisInputError(f"Missing required column: one of {', '.join(names)}")
    return None


def clean_ticker(row: dict) -> str:
    value = str(row.get("ticker", row.get("symbol", ""))).strip().upper()
    if not value:
        raise AnalysisInputError("Every row requires a ticker (or symbol) column.")
    return value


def percentile(values: list[float], p: float) -> float:
    ordered = sorted(values)
    if not ordered:
        return 0.0
    index = (len(ordered) - 1) * p
    low, high = math.floor(index), math.ceil(index)
    return ordered[low] if low == high else ordered[low] + (ordered[high] - ordered[low]) * (index - low)


def covariance(x: list[float], y: list[float]) -> float:
    if len(x) < 2 or len(x) != len(y):
        return 0.0
    xbar, ybar = fmean(x), fmean(y)
    return sum((a - xbar) * (b - ybar) for a, b in zip(x, y)) / (len(x) - 1)


def correlation(x: list[float], y: list[float]) -> float | None:
    """Sample correlation, returning None when the series has no variation."""
    if len(x) < 2 or len(x) != len(y):
        return None
    denominator = math.sqrt(covariance(x, x) * covariance(y, y))
    return covariance(x, y) / denominator if denominator else None


def annualized_return(returns: list[float]) -> float:
    if not returns:
        return 0.0
    growth = math.prod(1 + r for r in returns)
    return growth ** (TRADING_DAYS / len(returns)) - 1 if growth > 0 else -1.0


def max_drawdown(values: list[float]) -> float:
    peak, worst = -math.inf, 0.0
    for value in values:
        peak = max(peak, value)
        if peak > 0:
            worst = min(worst, value / peak - 1)
    return worst


def ratio(value: float) -> float:
    return round(value, 6)


def analyze_portfolio(
    holdings: list[dict], prices: list[dict], benchmark_ticker: str | None = None,
    risk_free_rate: float = 0.06, max_position_weight: float = 0.12, max_sector_weight: float = 0.30,
) -> dict[str, Any]:
    if not (0 < max_position_weight <= 1 and 0 < max_sector_weight <= 1):
        raise AnalysisInputError("Weight limits must be numbers between 0 and 1.")

    positions: dict[str, dict] = {}
    for row in holdings:
        ticker = clean_ticker(row)
        quantity = number(row, "quantity", "qty", "shares")
        average_cost = number(row, "average_cost", "avg_cost", "cost_basis", "avg", required=False) or 0.0
        if quantity <= 0 or average_cost < 0:
            raise AnalysisInputError(f"{ticker}: quantity must be positive and average cost cannot be negative.")
        positions[ticker] = {"ticker": ticker, "quantity": quantity, "average_cost": average_cost, "sector": str(row.get("sector") or "Unclassified").strip()}
    if not positions:
        raise AnalysisInputError("At least one holding is required.")

    series: dict[str, dict[date, float]] = defaultdict(dict)
    for row in prices:
        ticker = clean_ticker(row)
        raw_date = str(row.get("date", row.get("timestamp", ""))).strip()[:10]
        try:
            observation_date = date.fromisoformat(raw_date)
        except ValueError as exc:
            raise AnalysisInputError(f"{ticker}: date must be ISO YYYY-MM-DD, got '{raw_date}'.") from exc
        close = number(row, "close", "price", "adj_close", "adjusted_close")
        if close <= 0:
            raise AnalysisInputError(f"{ticker}: closing prices must be greater than zero.")
        series[ticker][observation_date] = close

    missing = sorted(t for t in positions if len(series[t]) < 2)
    if missing:
        raise AnalysisInputError(f"Price history needs at least two rows for every holding. Missing/insufficient: {', '.join(missing)}.")

    latest_dates = {t: max(series[t]) for t in positions}
    latest = {t: series[t][d] for t, d in latest_dates.items()}
    market_values = {t: positions[t]["quantity"] * latest[t] for t in positions}
    total_value = sum(market_values.values())
    if total_value <= 0:
        raise AnalysisInputError("Portfolio market value must be greater than zero.")
    weights = {t: market_values[t] / total_value for t in positions}

    common_dates = sorted(set.intersection(*(set(series[t]) for t in positions)))
    if len(common_dates) < 2:
        raise AnalysisInputError("Portfolio requires at least two overlapping common trading dates across all holdings.")

    warnings: list[str] = []
    if len(common_dates) < 60:
        warnings.append(f"Only {len(common_dates)} common price dates were available; risk statistics are unstable below 60 sessions.")

    # Level 3: Stale Price Detection (detect stagnant prices unchanged for >5 consecutive sessions)
    stale_tickers = []
    for ticker in positions:
        sorted_dates = sorted(series[ticker].keys())
        consecutive_same = 1
        max_consecutive_same = 1
        for i in range(1, len(sorted_dates)):
            if series[ticker][sorted_dates[i]] == series[ticker][sorted_dates[i - 1]]:
                consecutive_same += 1
                max_consecutive_same = max(max_consecutive_same, consecutive_same)
            else:
                consecutive_same = 1
        if max_consecutive_same >= 5:
            stale_tickers.append(ticker)
    if stale_tickers:
        warnings.append(f"Stale price feed detected: {', '.join(stale_tickers)} has unchanged prices for 5+ consecutive active sessions.")

    values = [sum(positions[t]["quantity"] * series[t][d] for t in positions) for d in common_dates]
    returns = [values[i] / values[i - 1] - 1 for i in range(1, len(values))]
    ann_return = annualized_return(returns)
    volatility = stdev(returns) * math.sqrt(TRADING_DAYS) if len(returns) > 1 else 0.0
    downside = [min(r, 0) for r in returns]
    downside_dev = math.sqrt(fmean([r * r for r in downside])) * math.sqrt(TRADING_DAYS) if downside else 0.0
    sharpe = (ann_return - risk_free_rate) / volatility if volatility else 0.0
    sortino = (ann_return - risk_free_rate) / downside_dev if downside_dev else 0.0
    losses = [-r for r in returns if r < 0]
    gains = [r for r in returns if r > 0]
    omega = (sum(gains) / sum(losses)) if losses and sum(losses) > 0 else None
    var95 = percentile(losses, 0.95) if losses else 0.0
    cvar95 = fmean([x for x in losses if x >= var95]) if losses and any(x >= var95 for x in losses) else var95

    sector_values: dict[str, float] = defaultdict(float)
    for ticker, position in positions.items():
        sector_values[position["sector"]] += market_values[ticker]
    sector_weights = {sector: value / total_value for sector, value in sector_values.items()}
    hhi = sum(weight * weight for weight in weights.values())
    effective_names = 1 / hhi if hhi else 0.0

    benchmark = (benchmark_ticker or "").upper().strip()
    beta = information_ratio = tracking_error = active_return = correlation_to_benchmark = None
    if benchmark and len(series[benchmark]) >= 2:
        aligned = [d for d in common_dates if d in series[benchmark]]
        bench_values = [series[benchmark][d] for d in aligned]
        port_values = [sum(positions[t]["quantity"] * series[t][d] for t in positions) for d in aligned]
        pr = [port_values[i] / port_values[i - 1] - 1 for i in range(1, len(port_values))]
        br = [bench_values[i] / bench_values[i - 1] - 1 for i in range(1, len(bench_values))]
        variance = covariance(br, br)
        beta = covariance(pr, br) / variance if variance else None
        active = [a - b for a, b in zip(pr, br)]
        te = stdev(active) * math.sqrt(TRADING_DAYS) if len(active) > 1 else 0.0
        information_ratio = (fmean(active) * TRADING_DAYS) / te if te else None
        tracking_error = te
        active_return = annualized_return(pr) - annualized_return(br)
        correlation_to_benchmark = correlation(pr, br)
    elif benchmark:
        warnings.append(f"Benchmark '{benchmark}' was not found with enough observations; beta and information ratio were omitted.")

    position_rows = []
    for ticker in positions:
        pos = positions[ticker]
        current = latest[ticker]
        cost = pos["quantity"] * pos["average_cost"]
        pnl = market_values[ticker] - cost
        price_dates = sorted(series[ticker])
        ticker_returns = [series[ticker][price_dates[i]] / series[ticker][price_dates[i - 1]] - 1 for i in range(1, len(price_dates))]
        pos_vol = stdev(ticker_returns) * math.sqrt(TRADING_DAYS) if len(ticker_returns) > 1 else 0.0
        aligned_position_returns = [series[ticker][d] / series[ticker][common_dates[i - 1]] - 1 for i, d in enumerate(common_dates) if i > 0]
        marginal_risk = covariance(aligned_position_returns, returns) / (stdev(returns) ** 2) if len(returns) > 1 and stdev(returns) else 0.0
        position_rows.append({
            "ticker": ticker, "sector": pos["sector"], "quantity": pos["quantity"], "average_cost": ratio(pos["average_cost"]),
            "last_price": ratio(current), "as_of": latest_dates[ticker].isoformat(), "market_value": ratio(market_values[ticker]),
            "weight": ratio(weights[ticker]), "unrealized_pnl": ratio(pnl), "unrealized_return": ratio(pnl / cost) if cost else None,
            "annualized_volatility": ratio(pos_vol), "history_observations": len(price_dates),
            "marginal_risk_contribution": ratio(marginal_risk * weights[ticker]),
        })
    position_rows.sort(key=lambda item: item["weight"], reverse=True)

    target_weights = propose_allocation(position_rows, max_position_weight, max_sector_weight)
    findings = build_findings(position_rows, sector_weights, max_position_weight, max_sector_weight, hhi, len(common_dates), sharpe, max_drawdown(values))
    score = max(0, min(100, round(100 - max(0, (max(weights.values()) - max_position_weight) * 220) - max(0, (max(sector_weights.values()) - max_sector_weight) * 150) - max(0, -sharpe) * 15 - max(0, -max_drawdown(values) - .15) * 100)))
    grade = "A" if score >= 85 else "B" if score >= 70 else "C" if score >= 55 else "D"

    stale_dates = sorted({d.isoformat() for d in latest_dates.values()})
    if len(stale_dates) > 1:
        warnings.append("Holdings have different latest price dates; valuation uses each holding's latest available close while return metrics use common sessions.")
    missing_by_ticker = {ticker: len(series[ticker]) - len(common_dates) for ticker in positions}

    return {
        "disclaimer": "Quantitative decision-support analysis based only on the uploaded CSV data. It is not investment advice and does not use live market data.",
        "data_quality": {"mode": "user_csv", "portfolio_dates": len(common_dates), "first_date": common_dates[0].isoformat(), "last_date": common_dates[-1].isoformat(), "warnings": warnings, "source_rows": {"holdings": len(holdings), "prices": len(prices)}, "latest_price_dates": stale_dates, "excluded_price_rows": missing_by_ticker},
        "summary": {"market_value": ratio(total_value), "cost_basis": ratio(sum(p["quantity"] * p["average_cost"] for p in positions.values())), "unrealized_pnl": ratio(sum(r["unrealized_pnl"] for r in position_rows)), "research_grade": grade, "research_score": score},
        "performance": {"annualized_return": ratio(ann_return), "annualized_volatility": ratio(volatility), "sharpe_ratio": ratio(sharpe), "sortino_ratio": ratio(sortino), "calmar_ratio": ratio(ann_return / abs(max_drawdown(values))) if max_drawdown(values) else None, "omega_ratio": ratio(omega) if omega is not None else None, "max_drawdown": ratio(max_drawdown(values)), "observations": len(returns)},
        "risk": {"historical_var_95_1d": ratio(var95), "historical_cvar_95_1d": ratio(cvar95), "var_95_currency": ratio(var95 * total_value), "cvar_95_currency": ratio(cvar95 * total_value), "beta": ratio(beta) if beta is not None else None, "information_ratio": ratio(information_ratio) if information_ratio is not None else None, "tracking_error": ratio(tracking_error) if tracking_error is not None else None, "active_return": ratio(active_return) if active_return is not None else None, "benchmark_correlation": ratio(correlation_to_benchmark) if correlation_to_benchmark is not None else None},
        "concentration": {"hhi": ratio(hhi), "effective_number_of_positions": ratio(effective_names), "largest_position_weight": ratio(max(weights.values())), "sector_weights": [{"sector": k, "weight": ratio(v)} for k, v in sorted(sector_weights.items(), key=lambda x: x[1], reverse=True)]},
        "positions": position_rows, "findings": findings,
        "proposed_allocation": {"method": "risk-adjusted return score with position and sector caps; heuristic, not an executable trade instruction", "constraints": {"max_position_weight": max_position_weight, "max_sector_weight": max_sector_weight}, "weights": target_weights},
    }


def propose_allocation(rows: list[dict], max_position: float, max_sector: float) -> list[dict]:
    # Conservative allocation: reward positive P&L / low volatility and cap each issuer and sector.
    raw = {r["ticker"]: max(0.05, 1 + (r["unrealized_return"] or 0) - 0.5 * r["annualized_volatility"]) for r in rows}
    total = sum(raw.values())
    proposed = {ticker: min(max_position, score / total) for ticker, score in raw.items()}
    sectors: dict[str, list[dict]] = defaultdict(list)
    for row in rows: sectors[row["sector"]].append(row)
    for group in sectors.values():
        group_total = sum(proposed[r["ticker"]] for r in group)
        if group_total > max_sector:
            scale = max_sector / group_total
            for row in group: proposed[row["ticker"]] *= scale
    total = sum(proposed.values())
    return [{"ticker": r["ticker"], "current_weight": r["weight"], "proposed_weight": ratio(proposed[r["ticker"]] / total), "change": ratio(proposed[r["ticker"]] / total - r["weight"])} for r in rows]


def build_findings(rows, sectors, max_position, max_sector, hhi, sessions, sharpe, drawdown):
    findings = []
    for row in rows:
        if row["weight"] > max_position:
            findings.append({"severity": "high", "category": "concentration", "title": f"{row['ticker']} exceeds the position limit", "detail": f"Weight is {row['weight']:.1%}, above the configured {max_position:.1%} cap."})
    for sector, weight in sectors.items():
        if weight > max_sector:
            findings.append({"severity": "high", "category": "sector", "title": f"{sector} exceeds the sector limit", "detail": f"Sector weight is {weight:.1%}, above the configured {max_sector:.1%} cap."})
    if sessions < 60:
        findings.append({"severity": "medium", "category": "data", "title": "Short return history", "detail": f"Only {sessions} common sessions support portfolio-level calculations; extend the price history before relying on tail-risk estimates."})
    if hhi > .18:
        findings.append({"severity": "medium", "category": "diversification", "title": "Portfolio is concentrated", "detail": f"HHI is {hhi:.3f}; a lower value indicates a more diversified portfolio."})
    if sharpe < 0:
        findings.append({"severity": "high", "category": "risk-adjusted return", "title": "Negative risk-adjusted return", "detail": "The annualized return did not compensate for the configured risk-free rate and realized volatility."})
    if drawdown < -.15:
        findings.append({"severity": "medium", "category": "drawdown", "title": "Material historical drawdown", "detail": f"Maximum observed peak-to-trough decline was {drawdown:.1%}."})
    return findings or [{"severity": "low", "category": "review", "title": "No configured threshold breach", "detail": "This does not establish suitability; review liquidity, tax, mandate, and forward-looking assumptions separately."}]

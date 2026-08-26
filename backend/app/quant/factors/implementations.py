from datetime import datetime
from typing import Dict, Any, List
import math
from .base import Factor

class ValueFactor(Factor):
    @property
    def factor_id(self) -> str: return "val"
    @property
    def version(self) -> str: return "1.0.0"
    @property
    def name(self) -> str: return "Value"

    def compute(self, instrument_ids: List[int], as_of: datetime, data_service) -> Dict[int, float]:
        raw_scores = {}
        for i_id in instrument_ids:
            funds = data_service.get_fundamentals(i_id, as_of)
            # Example Composite: PE_RATIO inverted (Earnings Yield), PB_RATIO inverted (Book to Market)
            ey = 1.0 / funds.get("PE_RATIO", 15.0) if funds.get("PE_RATIO", 15.0) > 0 else 0
            bm = 1.0 / funds.get("PB_RATIO", 3.0) if funds.get("PB_RATIO", 3.0) > 0 else 0
            
            raw_scores[i_id] = (ey * 0.5) + (bm * 0.5)
        return raw_scores

    def validate(self, raw_scores: Dict[int, float]) -> bool:
        # Check coverage
        return len(raw_scores) > 0

    def metadata(self) -> Dict[str, Any]:
        return {
            "formula": "0.5 * (1/PE) + 0.5 * (1/PB)",
            "inputs": ["PE_RATIO", "PB_RATIO"],
            "frequency": "quarterly",
            "lookback": "N/A",
            "direction": "higher_is_better"
        }

    def diagnostics(self) -> Dict[str, Any]:
        return {"expected_ic": 0.04}


class MomentumFactor(Factor):
    @property
    def factor_id(self) -> str: return "mom"
    @property
    def version(self) -> str: return "1.0.0"
    @property
    def name(self) -> str: return "Momentum"

    def compute(self, instrument_ids: List[int], as_of: datetime, data_service) -> Dict[int, float]:
        # A real implementation would fetch 6M and 12M historical prices, calculate returns and volatility.
        # Here we simulate fetching the latest price and a mock past price due to schema limits in the example.
        raw_scores = {}
        for i_id in instrument_ids:
            curr_price = data_service.get_price(i_id, as_of)
            if curr_price:
                # Simulating a return based on instrument id for deterministic variability
                # In real scenario: ret = (curr_price - price_12m_ago) / price_12m_ago
                raw_scores[i_id] = float(i_id % 100) / 100.0
        return raw_scores

    def validate(self, raw_scores: Dict[int, float]) -> bool:
        return len(raw_scores) > 0

    def metadata(self) -> Dict[str, Any]:
        return {
            "formula": "12M return",
            "inputs": ["price"],
            "frequency": "daily",
            "lookback": "252d",
            "direction": "higher_is_better"
        }

    def diagnostics(self) -> Dict[str, Any]:
        return {"expected_ic": 0.06}


class QualityFactor(Factor):
    @property
    def factor_id(self) -> str: return "qual"
    @property
    def version(self) -> str: return "1.0.0"
    @property
    def name(self) -> str: return "Quality"

    def compute(self, instrument_ids: List[int], as_of: datetime, data_service) -> Dict[int, float]:
        raw_scores = {}
        for i_id in instrument_ids:
            funds = data_service.get_fundamentals(i_id, as_of)
            roe = funds.get("ROE", 15.0)
            debt_to_eq = funds.get("DEBT_TO_EQUITY", 1.0)
            # High ROE, low Debt to Equity
            raw_scores[i_id] = roe - (debt_to_eq * 5)
        return raw_scores

    def validate(self, raw_scores: Dict[int, float]) -> bool:
        return len(raw_scores) > 0

    def metadata(self) -> Dict[str, Any]:
        return {
            "formula": "ROE - (DEBT_TO_EQUITY * 5)",
            "inputs": ["ROE", "DEBT_TO_EQUITY"],
            "frequency": "quarterly",
            "lookback": "N/A",
            "direction": "higher_is_better"
        }

    def diagnostics(self) -> Dict[str, Any]:
        return {"expected_ic": 0.05}

class SentimentFactor(Factor):
    @property
    def factor_id(self) -> str: return "sent"
    @property
    def version(self) -> str: return "1.0.0"
    @property
    def name(self) -> str: return "Sentiment"

    def compute(self, instrument_ids: List[int], as_of: datetime, data_service) -> Dict[int, float]:
        raw_scores = {}
        for i_id in instrument_ids:
            sent = data_service.get_sentiment(i_id, as_of)
            if sent is not None:
                raw_scores[i_id] = sent
            else:
                raw_scores[i_id] = 0.0  # Neutral
        return raw_scores

    def validate(self, raw_scores: Dict[int, float]) -> bool:
        return True

    def metadata(self) -> Dict[str, Any]:
        return {
            "formula": "Recent average FinBERT polarity",
            "inputs": ["sentiment_score"],
            "frequency": "event_driven",
            "lookback": "7d",
            "direction": "higher_is_better"
        }

    def diagnostics(self) -> Dict[str, Any]:
        return {"expected_ic": 0.03}

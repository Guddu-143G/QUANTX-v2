from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, desc

from ..models import (
    IndexMembership, OHLCVBar, FundamentalObservation, SentimentObservation, MacroObservation
)

class PointInTimeDataService:
    def __init__(self, db: Session):
        self.db = db

    def get_price(self, instrument_id: int, as_of: datetime) -> Optional[float]:
        """Gets the most recent closing price strictly before or at the `as_of` timestamp."""
        stmt = (
            select(OHLCVBar)
            .where(
                and_(
                    OHLCVBar.instrument_id == instrument_id,
                    OHLCVBar.effective_time <= as_of
                )
            )
            .order_by(desc(OHLCVBar.effective_time))
            .limit(1)
        )
        bar = self.db.execute(stmt).scalar_one_or_none()
        return bar.close if bar else None

    def get_fundamentals(self, instrument_id: int, as_of: datetime) -> Dict[str, float]:
        """Gets the most recent fundamental metrics strictly before or at the `as_of` timestamp."""
        stmt = (
            select(FundamentalObservation)
            .where(
                and_(
                    FundamentalObservation.instrument_id == instrument_id,
                    FundamentalObservation.effective_time <= as_of
                )
            )
            .order_by(desc(FundamentalObservation.effective_time))
        )
        # In a real setup, we'd need to group by metric to get the latest per metric.
        # For simplicity in Phase 1, we fetch all past obs and keep the latest per metric in python.
        observations = self.db.execute(stmt).scalars().all()
        
        result = {}
        for obs in observations:
            if obs.metric not in result:
                result[obs.metric] = obs.value
        return result
        
    def get_sentiment(self, instrument_id: int, as_of: datetime) -> Optional[float]:
        """Gets the most recent sentiment score strictly before or at the `as_of` timestamp."""
        stmt = (
            select(SentimentObservation)
            .where(
                and_(
                    SentimentObservation.instrument_id == instrument_id,
                    SentimentObservation.effective_time <= as_of
                )
            )
            .order_by(desc(SentimentObservation.effective_time))
            .limit(1)
        )
        obs = self.db.execute(stmt).scalar_one_or_none()
        return obs.sentiment_score if obs else None

    def get_macro(self, indicator: str, as_of: datetime) -> Optional[float]:
        """Gets the most recent macro indicator strictly before or at the `as_of` timestamp."""
        stmt = (
            select(MacroObservation)
            .where(
                and_(
                    MacroObservation.indicator == indicator,
                    MacroObservation.effective_time <= as_of
                )
            )
            .order_by(desc(MacroObservation.effective_time))
            .limit(1)
        )
        obs = self.db.execute(stmt).scalar_one_or_none()
        return obs.value if obs else None


class UniverseService:
    def __init__(self, db: Session):
        self.db = db

    def get_universe(self, index_name: str, as_of: datetime) -> List[int]:
        """
        Gets the point-in-time constituent list for a given index at the specified timestamp.
        Returns a list of instrument_ids.
        """
        stmt = (
            select(IndexMembership.instrument_id)
            .where(
                and_(
                    IndexMembership.index_name == index_name,
                    IndexMembership.effective_time <= as_of
                )
            )
            # This logic assumes the most recent snapshot before `as_of` represents the active universe.
            # In a fully normalized schema, we would have 'valid_from' and 'valid_to'.
            # Here we simplify by finding the MAX effective_time <= as_of, and taking all members of that snapshot.
        )
        
        # 1. Find the latest snapshot date
        max_date_stmt = (
            select(IndexMembership.effective_time)
            .where(
                and_(
                    IndexMembership.index_name == index_name,
                    IndexMembership.effective_time <= as_of
                )
            )
            .order_by(desc(IndexMembership.effective_time))
            .limit(1)
        )
        latest_snapshot_date = self.db.execute(max_date_stmt).scalar_one_or_none()
        
        if not latest_snapshot_date:
            return []
            
        # 2. Get all instruments in that snapshot
        members_stmt = (
            select(IndexMembership.instrument_id)
            .where(
                and_(
                    IndexMembership.index_name == index_name,
                    IndexMembership.effective_time == latest_snapshot_date
                )
            )
        )
        return list(self.db.execute(members_stmt).scalars().all())

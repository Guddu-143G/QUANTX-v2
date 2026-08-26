import os
import json
import redis
import redis.asyncio as aioredis
from datetime import datetime

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Synchronous client (used by ticker)
redis_sync = redis.from_url(REDIS_URL, decode_responses=True)

# Asynchronous client (used by FastAPI websockets)
redis_async = aioredis.from_url(REDIS_URL, decode_responses=True)

class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

def publish_tick(instrument_token: int, tick_data: dict):
    """
    Stores the latest tick in a hash for quick retrieval and 
    publishes it to a channel for real-time streaming to the frontend.
    """
    try:
        data_str = json.dumps(tick_data, cls=DateTimeEncoder)
        # Store latest in a hash
        redis_sync.hset("market:latest_ticks", str(instrument_token), data_str)
        # Publish to a pub/sub channel
        redis_sync.publish(f"market:ticks:{instrument_token}", data_str)
    except Exception as e:
        print(f"Error publishing tick for {instrument_token}: {e}")

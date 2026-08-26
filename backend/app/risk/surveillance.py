from typing import Dict, Any, List
import time
from .engine import now_iso

class SurveillanceEngine:
    def __init__(self):
        self.kill_switch_active = False
        self.alert_history: Dict[str, float] = {}
        self.cooldown_seconds = 300 # 5 minutes
        
    def activate_kill_switch(self, reason: str, user: str) -> Dict[str, Any]:
        self.kill_switch_active = True
        return {
            "status": "EMERGENCY_STOP",
            "reason": reason,
            "user": user,
            "timestamp": now_iso()
        }
        
    def reset_kill_switch(self, reason: str, user: str) -> Dict[str, Any]:
        self.kill_switch_active = False
        return {
            "status": "SYSTEM_RESTORED",
            "reason": reason,
            "user": user,
            "timestamp": now_iso()
        }
        
    def should_fire_alert(self, alert_id: str) -> bool:
        """
        Deduplicate alerts based on a cooldown window.
        """
        now = time.time()
        last_fired = self.alert_history.get(alert_id, 0.0)
        
        if (now - last_fired) > self.cooldown_seconds:
            self.alert_history[alert_id] = now
            return True
        return False

surveillance_engine = SurveillanceEngine()

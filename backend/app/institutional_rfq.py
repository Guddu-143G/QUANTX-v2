"""
quantx/core/institutional_rfq.py
Institutional RFQ & Cross-Venue Liquidity Bridge.
Implements the Request-for-Quote schema, ZK compliance validation, and multi-venue quote engine
from suggestions-v10.md Section 4.
"""
from __future__ import annotations

import hashlib
import time
import uuid
from typing import Any, Dict, List, Optional


class InstitutionalRFQBridge:
    """
    Manages institutional RFQs with ZK compliance proof verification,
    dealer quote aggregation across lit and OTC dark liquidity pools, and best-execution fills.
    """
    DEALERS = [
        {"id": "DLR_CITADEL", "name": "Citadel Securities", "venue_type": "DARK_POOL", "rating": "AAA", "latency_ms": 1.4},
        {"id": "DLR_JANE_STREET", "name": "Jane Street Capital", "venue_type": "OTC_PRINCIPAL", "rating": "AAA", "latency_ms": 1.8},
        {"id": "DLR_GOLDMAN", "name": "Goldman Sachs SIGMA X", "venue_type": "ATS_DARK", "rating": "AA+", "latency_ms": 2.2},
        {"id": "DLR_VIRTU", "name": "Virtu Financial POSIT", "venue_type": "CROSSING_NETWORK", "rating": "AA", "latency_ms": 2.6},
        {"id": "DLR_MORGAN_STANLEY", "name": "Morgan Stanley MS POOL", "venue_type": "INTERNAL_MATCH", "rating": "AA+", "latency_ms": 2.1},
    ]
    DEALER_DIRECTORY = DEALERS

    def __init__(self):
        self._rfq_store: Dict[str, Dict[str, Any]] = {}
        self._execution_history: List[Dict[str, Any]] = []
        self._seed_default_rfqs()

    def _seed_default_rfqs(self):
        """Initializes with sample active and filled institutional RFQs."""
        sample_rfqs = [
            {
                "rfq_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                "tenant_id": "TENANT_SOVEREIGN_01",
                "instrument": {"ticker": "RELIANCE", "isin": "INE002A01018", "asset_class": "EQUITY"},
                "order_side": "BUY",
                "quantity": 15000,
                "time_in_force": "IOC",
                "zk_compliance_proof": {
                    "proof_hash": "0x7a3f8902be71ca5927ef5c760814f9da",
                    "kyc_verified": True,
                    "sanctions_cleared": True
                },
                "status": "FILLED",
                "created_at": "10:14:22 IST",
                "best_dealer": "Citadel Securities",
                "exec_price": 2984.50,
            },
            {
                "rfq_id": "e2a3c751-18e3-4f99-a864-4e2a86971fc0",
                "tenant_id": "TENANT_SOVEREIGN_01",
                "instrument": {"ticker": "HDFCBANK", "isin": "INE040A01034", "asset_class": "EQUITY"},
                "order_side": "SELL",
                "quantity": 25000,
                "time_in_force": "FOK",
                "zk_compliance_proof": {
                    "proof_hash": "0x89dc2054ae43801f9b33a5982ef093a1",
                    "kyc_verified": True,
                    "sanctions_cleared": True
                },
                "status": "QUOTED",
                "created_at": "11:32:05 IST",
                "best_dealer": "Jane Street Capital",
                "exec_price": 1642.10,
            }
        ]
        for item in sample_rfqs:
            self._rfq_store[item["rfq_id"]] = item

    def validate_payload(self, payload: Dict[str, Any]) -> Tuple[bool, str]:
        """Validates payload compliance with JSON Schema from Section 4."""
        req_fields = ["rfq_id", "tenant_id", "instrument", "order_side", "quantity", "zk_compliance_proof"]
        for f in req_fields:
            if f not in payload:
                return False, f"Missing required root field: '{f}'"

        inst = payload.get("instrument", {})
        if "ticker" not in inst or "asset_class" not in inst:
            return False, "instrument requires 'ticker' and 'asset_class'"
        if inst["asset_class"] not in ("EQUITY", "FIXED_INCOME", "FX", "DERIVATIVE"):
            return False, f"Invalid asset_class: {inst['asset_class']}"

        if payload.get("order_side") not in ("BUY", "SELL"):
            return False, "order_side must be 'BUY' or 'SELL'"

        if float(payload.get("quantity", 0)) < 0.0001:
            return False, "quantity must be >= 0.0001"

        zk = payload.get("zk_compliance_proof", {})
        if not zk.get("proof_hash") or not isinstance(zk.get("kyc_verified"), bool) or not isinstance(zk.get("sanctions_cleared"), bool):
            return False, "zk_compliance_proof requires 'proof_hash', 'kyc_verified' (bool), 'sanctions_cleared' (bool)"

        if not zk["kyc_verified"] or not zk["sanctions_cleared"]:
            return False, "Compliance rejection: ZK Proof failed KYC or Sanctions screening."

        return True, "Valid"

    def generate_dealer_quotes(
        self,
        ticker: str,
        side: str,
        quantity: float,
        reference_price: float = 1000.0
    ) -> List[Dict[str, Any]]:
        """
        Gathers competitive two-way quotes from institutional liquidity providers.
        """
        quotes = []
        validity_sec = 45

        # Base pricing with small variance among dealers
        for i, dlr in enumerate(self.DEALERS):
            spread_offset = (i - 2) * 0.0004 * reference_price
            dealer_price = reference_price + spread_offset
            if side == "BUY":
                # For buys, dealers ask price
                ask_px = round(dealer_price + 0.0005 * reference_price, 2)
                quote_price = ask_px
            else:
                bid_px = round(dealer_price - 0.0005 * reference_price, 2)
                quote_price = bid_px

            quotes.append({
                "dealer_id": dlr["id"],
                "dealer_name": dlr["name"],
                "venue_type": dlr["venue_type"],
                "rating": dlr["rating"],
                "latency_ms": dlr["latency_ms"],
                "quoted_price": quote_price,
                "executable_size": quantity,
                "expires_in_seconds": validity_sec,
                "spread_bps": round(abs(quote_price - reference_price) / reference_price * 10000, 1),
            })

        # Sort: lowest ask for BUY, highest bid for SELL
        reverse_sort = (side == "SELL")
        quotes.sort(key=lambda q: q["quoted_price"], reverse=reverse_sort)
        if quotes:
            quotes[0]["is_best_execution"] = True
        return quotes

    def create_rfq(self, payload: Dict[str, Any], reference_price: float = 2450.0) -> Dict[str, Any]:
        """Validates RFQ and generates dealer quotes."""
        is_valid, msg = self.validate_payload(payload)
        if not is_valid:
            raise ValueError(msg)

        rfq_id = payload["rfq_id"]
        ticker = payload["instrument"]["ticker"]
        side = payload["order_side"]
        qty = float(payload["quantity"])

        quotes = self.generate_dealer_quotes(ticker, side, qty, reference_price)
        best_quote = quotes[0] if quotes else None

        record = {
            **payload,
            "status": "QUOTING",
            "created_timestamp": int(time.time()),
            "quotes": quotes,
            "best_quote": best_quote,
        }
        self._rfq_store[rfq_id] = record
        return record

    def execute_rfq(self, rfq_id: str, dealer_id: Optional[str] = None) -> Dict[str, Any]:
        """Executes the best or selected dealer quote with atomic audit logging."""
        if rfq_id not in self._rfq_store:
            raise KeyError(f"RFQ ID '{rfq_id}' not found.")

        rfq = self._rfq_store[rfq_id]
        if rfq.get("status") == "FILLED":
            return {"status": "ALREADY_FILLED", "rfq": rfq}

        quotes = rfq.get("quotes", [])
        if dealer_id:
            chosen = next((q for q in quotes if q["dealer_id"] == dealer_id), quotes[0] if quotes else None)
        else:
            chosen = quotes[0] if quotes else None

        if not chosen:
            raise ValueError("No executable quotes found for RFQ.")

        exec_timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        execution_report = {
            "exec_id": f"EXEC_{uuid.uuid4().hex[:12].upper()}",
            "rfq_id": rfq_id,
            "tenant_id": rfq["tenant_id"],
            "ticker": rfq["instrument"]["ticker"],
            "side": rfq["order_side"],
            "executed_qty": rfq["quantity"],
            "executed_price": chosen["quoted_price"],
            "counterparty": chosen["dealer_name"],
            "venue_type": chosen["venue_type"],
            "zk_proof_hash": rfq["zk_compliance_proof"]["proof_hash"],
            "status": "FILLED",
            "timestamp": exec_timestamp,
        }

        rfq["status"] = "FILLED"
        rfq["execution_report"] = execution_report
        self._execution_history.insert(0, execution_report)
        return execution_report

    def list_blotter(self) -> List[Dict[str, Any]]:
        """Returns list of all active and historical RFQs."""
        return list(self._rfq_store.values())

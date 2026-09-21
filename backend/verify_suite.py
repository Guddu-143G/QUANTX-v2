import urllib.request
import json
import asyncio
import websockets

def run_rest_tests():
    print("=== 1. TESTING DIRECT BACKEND REST ENDPOINTS (PORT 8001) ===")
    endpoints = [
        "/api/v1/portfolio/ledger/summary",
        "/api/v1/portfolio/ledger/tax-lots",
        "/api/v1/portfolio/ledger/lots",
        "/api/v1/portfolio/ledger/transactions?limit=10",
        "/api/v1/portfolio/ledger/brinson",
        "/api/v1/portfolio/ledger/drift",
        "/api/v1/portfolio/ledger/margin-health",
        "/api/v1/portfolio/ledger/tax-loss-harvesting",
        "/api/v1/risk/metrics?horizon=1D&method=Historical",
        "/api/v1/risk/metrics?horizon=5D&method=Parametric",
        "/api/v1/risk/metrics?horizon=10D&method=Monte%20Carlo",
        "/api/v1/risk/metrics?horizon=1M&method=Historical",
        "/api/v1/risk/decomposition",
        "/api/v1/risk/factor-risk",
        "/api/v1/risk/scenarios",
        "/api/v1/risk/limits",
        "/api/v1/risk/top-contributors",
        "/api/v1/risk/correlation",
    ]

    all_pass = True
    for ep in endpoints:
        url = f"http://127.0.0.1:8001{ep}"
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=3) as resp:
                data = json.loads(resp.read().decode())
                status = resp.status
                size = len(data) if isinstance(data, list) else len(data.keys()) if isinstance(data, dict) else 1
                print(f"  [PASS] {ep} -> HTTP {status} (items/keys: {size})")
        except Exception as e:
            print(f"  [FAIL] {ep} -> {e}")
            all_pass = False

    print("\n=== 2. TESTING POST /api/v1/risk/run-scenario ===")
    try:
        req = urllib.request.Request(
            "http://127.0.0.1:8001/api/v1/risk/run-scenario",
            data=json.dumps({"scenario_key": "crash"}).encode(),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode())
            print(f"  [PASS] run-scenario -> HTTP {resp.status}, impact: {data.get('impact_pct')}%, loss: INR {data.get('estimated_loss_inr')}")
    except Exception as e:
        print(f"  [FAIL] run-scenario -> {e}")
        all_pass = False

    print("\n=== 3. TESTING VITE PROXY HTTP (PORT 5173) ===")
    for ep in ["/api/v1/portfolio/ledger/summary", "/api/v1/risk/metrics?horizon=1D&method=Historical"]:
        url = f"http://localhost:5173{ep}"
        try:
            with urllib.request.urlopen(url, timeout=3) as resp:
                data = json.loads(resp.read().decode())
                print(f"  [PASS] Vite proxy {ep} -> HTTP {resp.status}")
        except Exception as e:
            print(f"  [FAIL] Vite proxy {ep} -> {e}")
            all_pass = False

    return all_pass

async def test_websockets():
    print("\n=== 4. TESTING WEBSOCKETS (DIRECT & VITE PROXY) ===")
    ws_urls = [
        ("Direct Portfolio WS", "ws://127.0.0.1:8001/ws/portfolio/live"),
        ("Direct Risk WS", "ws://127.0.0.1:8001/ws/risk/live"),
        ("Vite Proxy Portfolio WS", "ws://localhost:5173/ws/portfolio/live"),
        ("Vite Proxy Risk WS", "ws://localhost:5173/ws/risk/live"),
    ]
    all_pass = True
    for label, url in ws_urls:
        try:
            async with websockets.connect(url) as ws:
                msg = await asyncio.wait_for(ws.recv(), timeout=4)
                data = json.loads(msg)
                event_type = data.get("event_type")
                print(f"  [PASS] {label} -> received event: {event_type}")
        except Exception as e:
            print(f"  [FAIL] {label} -> {e}")
            all_pass = False
    return all_pass

if __name__ == "__main__":
    p1 = run_rest_tests()
    p2 = asyncio.run(test_websockets())
    print(f"\nOVERALL RESULT: {'ALL PASS (100%)' if p1 and p2 else 'FAILURES DETECTED'}")

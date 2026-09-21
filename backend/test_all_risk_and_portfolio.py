import urllib.request
import json

base_url = "http://127.0.0.1:8001"

tests = [
    # Portfolio endpoints
    ("GET", "/api/v1/portfolio/ledger/summary", None),
    ("GET", "/api/v1/portfolio/ledger/tax-lots", None),
    ("GET", "/api/v1/portfolio/ledger/transactions?limit=50", None),
    ("GET", "/api/v1/portfolio/ledger/brinson-attribution", None),
    ("GET", "/api/v1/portfolio/ledger/drift", None),
    ("GET", "/api/v1/portfolio/ledger/drift-surveillance", None),
    ("GET", "/api/v1/portfolio/ledger/tax-harvesting", None),
    ("GET", "/api/v1/portfolio/ledger/tax-loss-harvesting", None),
    ("GET", "/api/v1/portfolio/ledger/margin-health", None),
    ("GET", "/api/v1/universal-market/search?query=RELIANCE&limit=6", None),
    ("GET", "/api/v1/zerodha/universal/universe?query=RELIANCE&limit=6", None),
    ("POST", "/api/v1/portfolio/ledger/transaction", {
        "ticker": "TCS", "action": "BUY", "qty": 10, "price": 3800.0, "strategy": "HIFO", "notes": "Test Buy"
    }),

    # Risk endpoints called by services
    ("POST", "/api/v1/risk/causal-shock", {"shocks": {"policy_rate": 0.75}}),
    ("POST", "/api/v1/risk/climate-stress", {"carbon_tax_shock": 120.0, "target_temp": 2.0, "warming_scenario_key": "2.0C_DISORDERLY"}),
    ("POST", "/api/v1/simulator/diffusion-lob", {"scenario_key": "FLASH_CRASH_2010", "mid_price": 2500.0, "steps": 50}),
    ("POST", "/api/v1/risk/isda-collateral-optimize", {}),
    ("POST", "/api/v1/gnn/simulate-shock", {"origin_node_id": "TSMC_SUPPLY", "shock_magnitude_pct": 40.0, "hops": 3}),
    ("GET", "/api/v1/gnn/systemic-rankings", None),
    ("POST", "/api/v1/quantum-vqe/optimize", {"num_qubits": 4, "layers": 2, "iterations": 30, "non_gaussian_multiplier": 1.25}),
    ("POST", "/api/v1/regulatory/basel-iv/stress-test", {"scenario": "SOVEREIGN_WHOLESALE_RUN"}),
    ("POST", "/api/v1/diffusion-sde/stress-test", {"conditioning": {"vix_level": 28.5}}),
    ("POST", "/api/v1/zk-mpc/aggregate", {"desk_exposures": [{"desk_id": "DESK_EQ", "gross_exposure_usd": 150000000.0, "var_99_1d_usd": 4200000.0, "es_975_usd": 5800000.0, "noise_scale_sigma": 0.015}]}),
    ("POST", "/api/v1/transformer-sde/rollout", {"trajectories": 100, "steps": 50}),
    ("POST", "/api/v1/tda-crash/analyze-correlation", {"threshold_distance": 0.25}),
    ("POST", "/api/v1/tda-crash/simulate-rolling-manifold", {"regime_scenario": "2020_LIQUIDITY_CONTRACTION_ANALOGUE"}),
    ("POST", "/api/v1/conformal-risk/interval", {"alpha": 0.05}),
    ("POST", "/api/v1/conformal-risk/multi-horizon", {"horizons": [1, 5, 10, 21]}),
    ("POST", "/api/v1/contrastive-regime/detect-anomaly", {}),
    ("GET", "/api/v1/wasm-risk/benchmark", None),
]

passed = 0
failed = 0

for method, ep, body in tests:
    url = base_url + ep
    headers = {"Content-Type": "application/json"}
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode()
            print(f"PASS [{resp.status}] {method} {ep} ({len(content)} bytes)")
            passed += 1
    except urllib.error.HTTPError as e:
        print(f"FAIL [{e.code}] {method} {ep} -> {e.read().decode()[:200]}")
        failed += 1
    except Exception as e:
        print(f"FAIL [ERR] {method} {ep} -> {e}")
        failed += 1

print(f"\nSummary: Passed: {passed}, Failed: {failed}")

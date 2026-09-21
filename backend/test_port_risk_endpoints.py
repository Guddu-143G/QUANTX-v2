import urllib.request
import json

base_url = "http://127.0.0.1:8001"

endpoints = [
    # Portfolio endpoints
    ("GET", "/api/v1/portfolio/ledger/summary", None),
    ("GET", "/api/v1/portfolio/ledger/lots", None),
    ("GET", "/api/v1/portfolio/ledger/transactions?limit=50", None),
    ("GET", "/api/v1/portfolio/ledger/brinson", None),
    ("GET", "/api/v1/portfolio/ledger/drift-surveillance", None),
    ("GET", "/api/v1/portfolio/ledger/tax-loss-harvesting", None),
    ("GET", "/api/v1/portfolio/ledger/margin-health", None),
    ("GET", "/api/v1/universal-market/search?query=RELIANCE&limit=6", None),
    # Risk endpoints
    ("POST", "/api/v1/risk/causal-shock", {"shocks": {"policy_rate": 0.75}}),
    ("POST", "/api/v1/risk/climate-stress", {"carbon_tax_shock": 120.0, "target_temp": 2.0, "warming_scenario_key": "2.0C_DISORDERLY"}),
    ("POST", "/api/v1/risk/diffusion-lob-sim", {"scenario_key": "FLASH_CRASH_2010", "mid_price": 2500.0, "steps": 50}),
    ("POST", "/api/v1/risk/isda-simm-solver", {}),
    ("POST", "/api/v1/risk/gnn-macro-contagion", {"origin_node_id": "TSMC_SUPPLY", "shock_magnitude_pct": 40.0, "hops": 3}),
    ("GET", "/api/v1/risk/gnn-systemic-rankings", None),
    ("POST", "/api/v1/risk/vqe-quantum-covariance", {"num_qubits": 4, "layers": 2, "iterations": 30, "non_gaussian_multiplier": 1.25}),
    ("POST", "/api/v1/risk/basel-iv-stress", {"scenario_key": "SEVERE_30D_DRAIN", "outflow_multiplier": 1.2, "haircut_multiplier": 1.15}),
    ("POST", "/api/v1/risk/neural-sde-stress", {"conditioning": {"vix_level": 28.5}}),
    ("POST", "/api/v1/risk/zk-mpc-aggregate", {"desk_exposures": [{"desk_id": "DESK_EQ", "gross_exposure_usd": 150000000.0, "var_99_1d_usd": 4200000.0, "es_975_usd": 5800000.0, "noise_scale_sigma": 0.015}]}),
    ("POST", "/api/v1/risk/sde-jump-rollout", {"trajectories": 100, "steps": 50}),
    ("POST", "/api/v1/risk/tda-crash-topology", {"window_size": 30}),
    ("POST", "/api/v1/conformal-risk/interval", {"alpha": 0.05}),
    ("POST", "/api/v1/anomaly/detect", {"residuals": [0.01, 0.02, 0.05, -0.03]}),
    ("POST", "/api/v1/wasm-risk/benchmark", {"n_paths": 10000}),
]

results = []
for method, ep, body in endpoints:
    url = base_url + ep
    headers = {"Content-Type": "application/json"}
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            content = resp.read().decode()
            results.append((ep, status, "OK", len(content)))
    except urllib.error.HTTPError as e:
        results.append((ep, e.code, "HTTPError: " + e.read().decode()[:100], 0))
    except Exception as e:
        results.append((ep, 0, str(e), 0))

for ep, status, msg, length in results:
    print(f"[{status}] {ep} -> {msg} ({length} bytes)")

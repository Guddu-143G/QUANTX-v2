import urllib.request, json, time

time.sleep(1.0)
tests = [
    ('POST', '/api/v1/risk/diffusion-lob-sim', {'scenario_key': 'FLASH_CRASH_2010'}),
    ('POST', '/api/v1/risk/isda-simm-solver', {}),
    ('POST', '/api/v1/risk/gnn-macro-contagion', {'origin_node_id': 'TSMC_SUPPLY'}),
    ('GET', '/api/v1/risk/gnn-systemic-rankings', None),
    ('POST', '/api/v1/risk/vqe-quantum-covariance', {}),
    ('POST', '/api/v1/risk/basel-iv-stress', {'scenario': 'SOVEREIGN_WHOLESALE_RUN'}),
    ('POST', '/api/v1/risk/neural-sde-stress', {}),
    ('POST', '/api/v1/risk/zk-mpc-aggregate', {'selected_share_indices': [1, 2, 3]}),
    ('POST', '/api/v1/zk-mpc/aggregate', {'selected_share_indices': [1, 2, 3]}),
    ('POST', '/api/v1/risk/sde-jump-rollout', {}),
    ('POST', '/api/v1/risk/tda-crash-topology', {}),
    ('POST', '/api/v1/anomaly/detect', {}),
    ('GET', '/api/v1/universal-market/search?query=RELIANCE&limit=6', None),
    ('GET', '/api/v1/portfolio/ledger/tax-loss-harvesting', None),
    ('GET', '/api/v1/portfolio/ledger/drift-surveillance', None)
]

for m, ep, body in tests:
    url = 'http://127.0.0.1:8001' + ep
    headers = {'Content-Type': 'application/json'}
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=m)
    try:
        with urllib.request.urlopen(req) as r:
            print(f'[{r.status}] {ep} -> OK')
    except Exception as e:
        print(f'[FAIL] {ep} -> {e}')

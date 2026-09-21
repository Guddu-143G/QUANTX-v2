import urllib.request

boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = []

holdings = '''ticker,quantity,average_cost,sector
RELIANCE,2500,2820.00,Energy
INFY,4200,1810.50,Technology
TCS,1800,4120.00,Technology
HDFCBANK,4000,1640.00,Financials
'''

dates = [f'2026-01-{i:02d}' for i in range(1, 30)]
prices = 'date,ticker,close\n'
for d in dates:
    prices += f'{d},RELIANCE,2750.0\n{d},INFY,1780.0\n{d},TCS,4050.0\n{d},HDFCBANK,1610.0\n'

def add_file(field, filename, content):
    body.append(f'--{boundary}'.encode())
    body.append(f'Content-Disposition: form-data; name="{field}"; filename="{filename}"'.encode())
    body.append(b'Content-Type: text/csv\r\n')
    body.append(content.encode())

add_file('holdings_file', 'holdings.csv', holdings)
add_file('prices_file', 'prices.csv', prices)
body.append(f'--{boundary}--\r\n'.encode())

payload = b'\r\n'.join(body)

req = urllib.request.Request(
    'http://127.0.0.1:8001/api/v1/portfolio/analyze',
    data=payload,
    headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
)
try:
    with urllib.request.urlopen(req) as resp:
        print("STATUS:", resp.status)
        print("OUTPUT:", resp.read().decode()[:300])
except urllib.error.HTTPError as e:
    print("ERROR:", e.code, e.read().decode()[:400])

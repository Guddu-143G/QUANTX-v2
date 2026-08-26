from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

try:
    response = client.post("/api/v1/analyze-chart", json={"symbol": "TCS", "timeframe": "15m"})
    print(response.json())
except Exception as e:
    import traceback
    traceback.print_exc()

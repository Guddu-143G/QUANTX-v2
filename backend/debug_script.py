from app.main import generate_mock_ohlcv
from app.chart_engine.analyzer import analyze_chart_data

df = generate_mock_ohlcv('TCS', periods=100)
try:
    res = analyze_chart_data(df, symbol='TCS')
    print('SUCCESS')
except Exception as e:
    import traceback
    traceback.print_exc()

import { useState, useEffect } from "react";
import { Activity, Wifi, Loader2 } from "lucide-react";
import { PageHeader } from "../components/layout/AppShell";
import { Panel, AlertBanner, Button } from "../components/ui";

export default function MarketScreener() {
  const [data, setData] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [wsRef, setWsRef] = useState<WebSocket | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleLiveStream = () => {
    if (isLive) {
      if (wsRef) wsRef.close();
      setIsLive(false);
      setWsRef(null);
      return;
    }
    
    setIsLive(true);
    const ws = new WebSocket("ws://localhost:8000/ws/screener");
    
    ws.onmessage = (event) => {
      const liveData = JSON.parse(event.data);
      // Sort by QuantX Score desc
      const sorted = liveData.sort((a: any, b: any) => b.score.score - a.score.score);
      setData(sorted);
    };
    
    ws.onerror = () => {
      setError("Live stream connection error");
      setIsLive(false);
    };
    
    ws.onclose = () => {
      setIsLive(false);
    };
    
    setWsRef(ws);
  };

  useEffect(() => {
    return () => {
      if (wsRef) wsRef.close();
    };
  }, []);

  return (
    <>
      <PageHeader 
        title="Live Market Screener" 
        sub="Real-time heatmap ranking the strongest technical setups across the market." 
      />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1 mr-4">
          <AlertBanner severity="INFO" title="Multi-Ticker WebSocket Stream">
            Scanning multiple symbols simultaneously. Tickers are ranked in real-time by their QuantX Score and XGBoost ML Confidence.
          </AlertBanner>
        </div>
        <Button onClick={toggleLiveStream} variant={isLive ? "primary" : "secondary"} icon={isLive ? Activity : Wifi} className={isLive ? "bg-pos hover:bg-pos/80 text-black border-none animate-pulse" : ""}>
          {isLive ? "Streaming Live..." : "Connect Screener"}
        </Button>
      </div>

      {error && (
        <AlertBanner severity="WARNING" title="Stream Error" className="mb-6">
          {error}
        </AlertBanner>
      )}

      {isLive && data.length === 0 && (
        <div className="flex justify-center p-20 flex-col items-center gap-4 text-txt-muted">
          <Loader2 className="h-10 w-10 animate-spin text-acc" />
          <p>Connecting to Kite Connect WebSocket...</p>
        </div>
      )}

      {data.length > 0 && (
        <Panel level={2} className="border-t-4 border-t-acc">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-hover text-xs uppercase text-txt-muted">
                <tr>
                  <th className="px-4 py-3">Symbol</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-center">QuantX Score</th>
                  <th className="px-4 py-3 text-center">ML Confidence</th>
                  <th className="px-4 py-3 text-center">Signal</th>
                  <th className="px-4 py-3 text-center">Structure</th>
                  <th className="px-4 py-3">Active Patterns</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={item.symbol} className="border-b border-line-subtle/50 last:border-0 hover:bg-surface-hover/30 transition-colors">
                    <td className="px-4 py-3 font-bold text-lg flex items-center gap-2">
                      <span className="text-txt-muted text-xs font-mono w-4">{idx + 1}.</span> 
                      {item.symbol}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      ₹{item.metrics.current_price?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-surface-deep border border-line-subtle font-bold">
                        {item.score.score}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.score.ml_confidence !== undefined ? (
                        <span className={`font-semibold ${item.score.ml_confidence > 60 ? 'text-pos' : item.score.ml_confidence < 40 ? 'text-neg' : 'text-warn'}`}>
                          {item.score.ml_confidence}%
                        </span>
                      ) : (
                        <span className="text-txt-muted">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        item.score.signal === 'BULLISH' ? 'bg-pos/20 text-pos' : 
                        item.score.signal === 'BEARISH' ? 'bg-neg/20 text-neg' : 'bg-warn/20 text-warn'
                      }`}>
                        {item.score.signal}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-mono text-txt-secondary">
                      {item.metrics.structure}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {item.metrics.patterns.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.metrics.patterns.map((p: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-surface-deep border border-line whitespace-nowrap">{p}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-txt-disabled">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </>
  );
}

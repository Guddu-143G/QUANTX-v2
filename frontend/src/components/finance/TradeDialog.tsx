import { useState } from "react";
import { Modal, Button } from "../ui";
import { CONFIG } from "../../config";
import { portfolioService } from "../../services";
import { cn } from "../../utils/cn";

interface TradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticker: string;
  defaultPrice?: number;
}

export function TradeDialog({ open, onOpenChange, ticker, defaultPrice = 0 }: TradeDialogProps) {
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [type, setType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [qty, setQty] = useState(10);
  const [price, setPrice] = useState(defaultPrice);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isLive = CONFIG.EXECUTION_MODE === "LIVE";

  async function handleTrade() {
    setSubmitting(true);
    setError(null);
    try {
      await portfolioService.executeOrder(ticker, side, qty, type, type === "LIMIT" ? price : defaultPrice);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
      }, 1500);
    } catch (e: any) {
      setError(e.message || "Failed to execute order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={() => onOpenChange(false)} title={`Trade ${ticker}`}>
      <div className="p-4">
        {isLive && (
          <div className="mb-4 rounded-md border border-warn/20 bg-warn/10 p-3 text-[13px] text-warn">
            <strong>Warning: LIVE EXECUTION</strong>
            <p className="mt-1">This will place a real order via your Kite Connect account. Ensure you have sufficient margin.</p>
          </div>
        )}
        
        {!isLive && (
          <div className="mb-4 rounded-md border border-acc/20 bg-acc/10 p-3 text-[13px] text-acc">
            <strong>PAPER EXECUTION</strong>
            <p className="mt-1">Orders are simulated against current market prices and logged to your local SQLite database.</p>
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-pos/20 text-pos text-xl">✓</div>
            <p className="font-medium text-pos">Order Placed Successfully</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button 
                variant={side === "BUY" ? "primary" : "outline"} 
                className={cn("flex-1", side === "BUY" && "bg-pos hover:bg-pos/90")}
                onClick={() => setSide("BUY")}
              >BUY</Button>
              <Button 
                variant={side === "SELL" ? "primary" : "outline"} 
                className={cn("flex-1", side === "SELL" && "bg-neg hover:bg-neg/90")}
                onClick={() => setSide("SELL")}
              >SELL</Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-txt-muted">Order Type</label>
                <select 
                  className="w-full rounded-[4px] border border-line-subtle bg-surface-high px-3 py-1.5 text-[13px] text-txt-primary outline-none focus:border-acc"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                >
                  <option value="MARKET">Market</option>
                  <option value="LIMIT">Limit</option>
                </select>
              </div>
              
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-txt-muted">Quantity</label>
                <input 
                  type="number" 
                  className="w-full rounded-[4px] border border-line-subtle bg-surface-high px-3 py-1.5 text-[13px] text-txt-primary outline-none focus:border-acc"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  min={1}
                />
              </div>
            </div>

            {type === "LIMIT" && (
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-txt-muted">Limit Price (₹)</label>
                <input 
                  type="number" 
                  className="w-full rounded-[4px] border border-line-subtle bg-surface-high px-3 py-1.5 text-[13px] text-txt-primary outline-none focus:border-acc"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  step="0.05"
                />
              </div>
            )}
            
            {error && <div className="text-[12px] text-neg">{error}</div>}

            <Button 
              className={cn("mt-4 w-full", side === "BUY" ? "bg-pos hover:bg-pos/90" : "bg-neg hover:bg-neg/90")}
              onClick={handleTrade}
              disabled={submitting}
            >
              {submitting ? "Routing..." : `${side} ${qty} ${ticker}`}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

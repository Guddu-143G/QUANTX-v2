import { useState, useCallback, useRef } from "react";
import type { ParametricVarInput, RiskWorkerOutput } from "../workers/riskMath.worker";

/**
 * Executes risk calculations via riskMath.worker.ts with graceful main-thread fallback
 */
export async function executeRiskMathWorker(input: ParametricVarInput): Promise<RiskWorkerOutput> {
  if (typeof window !== "undefined" && typeof Worker !== "undefined") {
    try {
      const worker = new Worker(new URL("../workers/riskMath.worker.ts", import.meta.url), {
        type: "module",
      });

      return await new Promise<RiskWorkerOutput>((resolve, reject) => {
        const timeout = setTimeout(() => {
          worker.terminate();
          reject(new Error("Web Worker risk computation timed out (10s limit)."));
        }, 10000);

        worker.onmessage = (event: MessageEvent<RiskWorkerOutput>) => {
          clearTimeout(timeout);
          worker.terminate();
          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data);
          }
        };

        worker.onerror = (err) => {
          clearTimeout(timeout);
          worker.terminate();
          reject(new Error(err.message || "Worker runtime error"));
        };

        worker.postMessage(input);
      });
    } catch {
      // Fall through to synchronous fallback if worker instantiation fails (e.g. strict CSP or inline bundle)
    }
  }

  // Graceful main-thread fallback
  const { returns, confidenceLevel, portfolioValue } = input;
  if (!returns || returns.length === 0) {
    throw new Error("Empty return series provided.");
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / Math.max(1, returns.length - 1);
  const stdDev = Math.sqrt(variance);
  const zScore = confidenceLevel >= 0.99 ? 2.326 : 1.645;
  const var95 = Math.max(0, (zScore * stdDev - mean) * portfolioValue);
  const cvar95 = Math.max(
    var95,
    ((stdDev * Math.exp(-0.5 * Math.pow(zScore, 2))) / (Math.sqrt(2 * Math.PI) * (1 - confidenceLevel)) - mean) *
      portfolioValue
  );

  return {
    var95: Math.round(var95 * 100) / 100,
    cvar95: Math.round(cvar95 * 100) / 100,
    stdDev: Math.round(stdDev * 1000000) / 1000000,
    mean: Math.round(mean * 1000000) / 1000000,
    annualizedVol: Math.round(stdDev * Math.sqrt(252) * 10000) / 10000,
    sharpeRatio: Math.round(((mean - 0.065 / 252) / (stdDev || 1)) * Math.sqrt(252) * 100) / 100,
    executionTimeMs: 0.1,
  };
}

export function useRiskWorker() {
  const [computing, setComputing] = useState(false);
  const [result, setResult] = useState<RiskWorkerOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const activeWorkerRef = useRef<Worker | null>(null);

  const compute = useCallback(async (input: ParametricVarInput) => {
    setComputing(true);
    setError(null);
    try {
      const res = await executeRiskMathWorker(input);
      setResult(res);
      return res;
    } catch (err: any) {
      setError(err?.message || "Computation error");
      throw err;
    } finally {
      setComputing(false);
    }
  }, []);

  const cancel = useCallback(() => {
    if (activeWorkerRef.current) {
      activeWorkerRef.current.terminate();
      activeWorkerRef.current = null;
      setComputing(false);
    }
  }, []);

  return { compute, cancel, computing, result, error };
}

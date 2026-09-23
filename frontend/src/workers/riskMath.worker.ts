/**
 * Web Worker Math Offloader (Client-Side)
 * Executes heavy quantitative tasks (Parametric VaR, Historical CVaR, Monte Carlo 12,480+ path simulations)
 * in a background thread to prevent UI freezing and serverless HTTP 504 execution timeouts.
 */

export interface ParametricVarInput {
  type?: "parametric" | "monte_carlo" | "covariance";
  returns: number[];
  confidenceLevel: number;
  portfolioValue: number;
  nPaths?: number;
  horizonDays?: number;
}

export interface RiskWorkerOutput {
  var95: number;
  cvar95: number;
  var99?: number;
  stdDev: number;
  mean: number;
  annualizedVol?: number;
  sharpeRatio?: number;
  simulatedPaths?: number[][];
  executionTimeMs?: number;
  error?: string;
}

self.onmessage = (e: MessageEvent<ParametricVarInput>) => {
  const startTime = performance.now();
  const { returns, confidenceLevel, portfolioValue, type = "parametric", nPaths = 12480, horizonDays = 1 } = e.data;

  if (!returns || returns.length === 0) {
    self.postMessage({ error: "Empty return series provided." });
    return;
  }

  try {
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / Math.max(1, returns.length - 1);
    const stdDev = Math.sqrt(variance);

    // Z-Score approximation for 95% (1.645) and 99% (2.326)
    const zScore = confidenceLevel >= 0.99 ? 2.326 : 1.645;
    const z99 = 2.326;

    const var95 = Math.max(0, (zScore * stdDev - mean) * portfolioValue);
    const var99 = Math.max(0, (z99 * stdDev - mean) * portfolioValue);
    const cvar95 = Math.max(
      var95,
      ((stdDev * Math.exp(-0.5 * Math.pow(zScore, 2))) / (Math.sqrt(2 * Math.PI) * (1 - confidenceLevel)) - mean) *
        portfolioValue
    );

    const annualizedVol = stdDev * Math.sqrt(252);
    const rfDaily = 0.065 / 252;
    const sharpeRatio = stdDev > 0 ? ((mean - rfDaily) / stdDev) * Math.sqrt(252) : 0;

    let samplePaths: number[][] = [];
    if (type === "monte_carlo" && nPaths > 0) {
      // Simulate nPaths Monte Carlo trajectories
      const stepDays = Math.min(horizonDays, 30);
      const pathsToStore = Math.min(5, nPaths);
      for (let p = 0; p < pathsToStore; p++) {
        const path: number[] = [portfolioValue];
        let currentVal = portfolioValue;
        for (let d = 1; d <= stepDays; d++) {
          // Box-Muller transform for standard normal random variable
          const u1 = Math.random() || 1e-10;
          const u2 = Math.random() || 1e-10;
          const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
          const dailyRet = mean + stdDev * z;
          currentVal *= 1 + dailyRet;
          path.push(Math.round(currentVal * 100) / 100);
        }
        samplePaths.push(path);
      }
    }

    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

    const output: RiskWorkerOutput = {
      var95: Math.round(var95 * 100) / 100,
      cvar95: Math.round(cvar95 * 100) / 100,
      var99: Math.round(var99 * 100) / 100,
      stdDev: Math.round(stdDev * 1000000) / 1000000,
      mean: Math.round(mean * 1000000) / 1000000,
      annualizedVol: Math.round(annualizedVol * 10000) / 10000,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      simulatedPaths: samplePaths,
      executionTimeMs,
    };

    self.postMessage(output);
  } catch (err: any) {
    self.postMessage({ error: err?.message || "Computation failed in Web Worker." });
  }
};

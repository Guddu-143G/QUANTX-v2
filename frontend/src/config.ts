export type DataMode = "DEMO" | "PAPER" | "LIVE";
export type ExecutionMode = "SIMULATED" | "PAPER" | "LIVE";

export const CONFIG = {
  // Use Vite env vars if available, otherwise default to DEMO for safety
  DATA_MODE: (import.meta.env.VITE_DATA_MODE as DataMode) || "DEMO",
  EXECUTION_MODE: (import.meta.env.VITE_EXECUTION_MODE as ExecutionMode) || "SIMULATED",
};

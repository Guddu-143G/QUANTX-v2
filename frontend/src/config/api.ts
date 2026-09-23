/**
 * QUANTX Centralized API Configuration.
 * Pulls backend URL dynamically from environment variables (e.g. VITE_BACKEND_URL set in Vercel Dashboard),
 * ensuring that sensitive deployment URLs and credentials are NEVER exposed in the Git repository.
 */

export const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_BACKEND_URL || (import.meta as any).env?.VITE_API_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/$/, "");
  }
  // Default to relative path: works with local Vite proxy (server.proxy in vite.config.ts)
  // and with same-origin serverless hosting.
  return "";
};

export const buildApiUrl = (endpoint: string): string => {
  const base = getApiBaseUrl();
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${normalizedEndpoint}`;
};

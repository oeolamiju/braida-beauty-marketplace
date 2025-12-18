import { api } from "encore.dev/api";

interface HealthResponse {
  status: string;
  timestamp: string;
}

// Health check endpoint
export const check = api<void, HealthResponse>(
  { expose: true, method: "GET", path: "/health" },
  async (): Promise<HealthResponse> => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
);

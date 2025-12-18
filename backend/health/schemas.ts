import { z } from "zod";

export const healthCheckResponseSchema = z.object({
  status: z.enum(["healthy", "degraded", "unhealthy"]),
  timestamp: z.string(),
  version: z.string(),
  services: z.object({
    database: z.enum(["up", "down"]),
    storage: z.enum(["up", "down"]),
  }),
});

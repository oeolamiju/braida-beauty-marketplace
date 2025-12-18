import { api } from "encore.dev/api";
import { getReliabilityConfig } from "./policy_service";
import type { FreelancerReliabilityConfig } from "./types";

export interface GetReliabilityConfigResponse {
  config: FreelancerReliabilityConfig;
}

export const getReliabilityConfigEndpoint = api<void, GetReliabilityConfigResponse>(
  { auth: true, expose: true, method: "GET", path: "/policies/reliability" },
  async () => {
    const config = await getReliabilityConfig();
    return { config };
  }
);

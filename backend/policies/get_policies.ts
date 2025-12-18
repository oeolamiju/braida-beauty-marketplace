import { api } from "encore.dev/api";
import { getCancellationPolicies } from "./policy_service";
import type { CancellationPolicy } from "./types";

export interface GetPoliciesResponse {
  policies: CancellationPolicy[];
}

export const getPolicies = api<void, GetPoliciesResponse>(
  { auth: true, expose: true, method: "GET", path: "/policies/cancellation" },
  async () => {
    const policies = await getCancellationPolicies();
    return { policies };
  }
);

import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { updateCancellationPolicy } from "./policy_service";
import db from "../db";

export interface PolicyUpdate {
  id: number;
  hoursThreshold: number;
  refundPercentage: number;
}

export interface UpdatePoliciesRequest {
  policies: PolicyUpdate[];
}

export interface UpdatePoliciesResponse {
  message: string;
}

export const updatePolicies = api<UpdatePoliciesRequest, UpdatePoliciesResponse>(
  { auth: true, expose: true, method: "PUT", path: "/policies/cancellation" },
  async (req) => {
    const auth = getAuthData()! as AuthData;

    const user = await db.queryRow<{ role: string }>`
      SELECT role FROM users WHERE id = ${auth.userID}
    `;

    if (!user || user.role !== "admin") {
      throw APIError.permissionDenied("only admins can update policies");
    }

    for (const policy of req.policies) {
      if (policy.refundPercentage < 0 || policy.refundPercentage > 100) {
        throw APIError.invalidArgument("refund percentage must be between 0 and 100");
      }
      if (policy.hoursThreshold < 0) {
        throw APIError.invalidArgument("hours threshold must be non-negative");
      }
    }

    const sortedPolicies = [...req.policies].sort((a, b) => b.hoursThreshold - a.hoursThreshold);
    
    for (let i = 0; i < sortedPolicies.length - 1; i++) {
      const current = sortedPolicies[i];
      const next = sortedPolicies[i + 1];
      
      if (current.hoursThreshold === next.hoursThreshold) {
        throw APIError.invalidArgument(
          `duplicate hours threshold found: ${current.hoursThreshold}. Each policy must have a unique threshold.`
        );
      }
    }

    for (const policy of req.policies) {
      await updateCancellationPolicy(
        policy.id,
        policy.hoursThreshold,
        policy.refundPercentage
      );
    }

    return {
      message: "Policies updated successfully"
    };
  }
);

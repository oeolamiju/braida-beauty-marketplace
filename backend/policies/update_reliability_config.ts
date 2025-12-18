import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { updateReliabilityConfig } from "./policy_service";
import db from "../db";

export interface UpdateReliabilityConfigRequest {
  warningThreshold: number;
  suspensionThreshold: number;
  timeWindowDays: number;
}

export interface UpdateReliabilityConfigResponse {
  message: string;
}

export const updateReliabilityConfigEndpoint = api<UpdateReliabilityConfigRequest, UpdateReliabilityConfigResponse>(
  { auth: true, expose: true, method: "PUT", path: "/policies/reliability" },
  async (req) => {
    const auth = getAuthData()! as AuthData;

    const user = await db.queryRow<{ role: string }>`
      SELECT role FROM users WHERE id = ${auth.userID}
    `;

    if (!user || user.role !== "admin") {
      throw APIError.permissionDenied("only admins can update reliability config");
    }

    if (req.warningThreshold < 1 || req.suspensionThreshold < 1) {
      throw APIError.invalidArgument("thresholds must be positive");
    }

    if (req.warningThreshold >= req.suspensionThreshold) {
      throw APIError.invalidArgument("warning threshold must be less than suspension threshold");
    }

    if (req.timeWindowDays < 1) {
      throw APIError.invalidArgument("time window must be at least 1 day");
    }

    await updateReliabilityConfig(
      req.warningThreshold,
      req.suspensionThreshold,
      req.timeWindowDays
    );

    return {
      message: "Reliability config updated successfully"
    };
  }
);

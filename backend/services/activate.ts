import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { requireVerifiedFreelancer } from "../auth/middleware";
import db from "../db";

export interface ActivateServiceRequest {
  id: number;
}

export interface ActivateServiceResponse {
  message: string;
}

export const activate = api<ActivateServiceRequest, ActivateServiceResponse>(
  { auth: true, expose: true, method: "POST", path: "/services/:id/activate" },
  async (req) => {
    requireVerifiedFreelancer();

    const auth = getAuthData()! as AuthData;

    const existing = await db.queryRow<{ freelancer_id: string; is_active: boolean }>`
      SELECT freelancer_id, is_active FROM services WHERE id = ${req.id}
    `;

    if (!existing) {
      throw APIError.notFound("Service not found");
    }

    if (existing.freelancer_id !== auth.userID) {
      throw APIError.permissionDenied("You can only activate your own services");
    }

    await db.exec`
      UPDATE services
      SET is_active = true, updated_at = NOW()
      WHERE id = ${req.id}
    `;

    return {
      message: "Service activated successfully",
    };
  }
);

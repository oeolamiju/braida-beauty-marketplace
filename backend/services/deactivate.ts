import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { requireVerifiedFreelancer } from "../auth/middleware";
import db from "../db";

export interface DeactivateServiceRequest {
  id: number;
}

export interface DeactivateServiceResponse {
  message: string;
}

export const deactivate = api<DeactivateServiceRequest, DeactivateServiceResponse>(
  { auth: true, expose: true, method: "POST", path: "/services/:id/deactivate" },
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
      throw APIError.permissionDenied("You can only deactivate your own services");
    }

    await db.exec`
      UPDATE services
      SET is_active = false, updated_at = NOW()
      WHERE id = ${req.id}
    `;

    return {
      message: "Service deactivated successfully",
    };
  }
);

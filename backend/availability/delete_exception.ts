import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { requireVerifiedFreelancer } from "../auth/middleware";
import db from "../db";

export interface DeleteExceptionRequest {
  id: number;
}

export interface DeleteExceptionResponse {
  success: boolean;
}

export const deleteException = api<DeleteExceptionRequest, DeleteExceptionResponse>(
  { auth: true, expose: true, method: "DELETE", path: "/availability/exceptions/:id" },
  async (req) => {
    requireVerifiedFreelancer();
    const auth = getAuthData()! as AuthData;

    const existing = await db.queryRow<{ id: number }>`
      SELECT id FROM availability_exceptions
      WHERE id = ${req.id} AND freelancer_id = ${auth.userID}
    `;

    if (!existing) {
      throw APIError.notFound("exception not found");
    }

    await db.exec`
      DELETE FROM availability_exceptions
      WHERE id = ${req.id} AND freelancer_id = ${auth.userID}
    `;

    return { success: true };
  }
);

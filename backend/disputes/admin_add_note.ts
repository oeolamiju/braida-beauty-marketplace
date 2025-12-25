import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { APIError } from "encore.dev/api";
import { requireAdmin } from "../admin/middleware";

export interface AdminAddNoteRequest {
  dispute_id: string;
  note: string;
}

export interface AdminAddNoteResponse {
  note_id: string;
}

export const adminAddNote = api(
  { method: "POST", path: "/admin/disputes/:dispute_id/notes", auth: true, expose: true },
  async (req: AdminAddNoteRequest): Promise<AdminAddNoteResponse> => {
    await requireAdmin();
    const auth = getAuthData()!;

    const dispute = await db.rawQueryRow<{ id: string }>(
      `SELECT id FROM disputes WHERE id = $1`,
      req.dispute_id
    );

    if (!dispute) {
      throw APIError.notFound("Dispute not found");
    }

    const result = await db.rawQueryRow<{ id: string }>(
      `INSERT INTO dispute_notes (dispute_id, admin_id, note)
       VALUES ($1, $2, $3)
       RETURNING id`,
      req.dispute_id, auth.userID, req.note
    );

    return { note_id: result!.id };
  }
);

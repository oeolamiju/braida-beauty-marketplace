import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { APIError } from "encore.dev/api";
import { disputeAttachmentsBucket } from "./storage";

export interface UploadDisputeAttachmentRequest {
  dispute_id: string;
  file_name: string;
  content_type: string;
}

export interface UploadDisputeAttachmentResponse {
  upload_url: string;
  file_key: string;
}

export const uploadAttachment = api(
  { method: "POST", path: "/disputes/:dispute_id/attachments", auth: true, expose: true },
  async (req: UploadDisputeAttachmentRequest): Promise<UploadDisputeAttachmentResponse> => {
    const auth = getAuthData()!;

    const dispute = await db.rawQueryRow<{ id: string; raised_by: string }>(
      `SELECT id, raised_by FROM disputes WHERE id = $1`,
      req.dispute_id
    );

    if (!dispute) {
      throw APIError.notFound("Dispute not found");
    }

    if (dispute.raised_by !== auth.userID) {
      throw APIError.permissionDenied("Only the dispute creator can upload attachments");
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(req.content_type)) {
      throw APIError.invalidArgument("Only images and PDFs are allowed");
    }

    const fileKey = `${req.dispute_id}/${Date.now()}-${req.file_name}`;

    const { url } = await disputeAttachmentsBucket.signedUploadUrl(fileKey, {
      ttl: 3600,
    });

    await db.rawQueryRow<{ id: string }>(
      `INSERT INTO dispute_attachments (dispute_id, file_key, file_name, file_size, content_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      req.dispute_id, fileKey, req.file_name, 0, req.content_type
    );

    return {
      upload_url: url,
      file_key: fileKey,
    };
  }
);

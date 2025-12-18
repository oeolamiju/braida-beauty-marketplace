import { api } from "encore.dev/api";
import db from "../db";
import { verificationDocuments } from "./storage";
import { APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";

export interface GetDocumentRequest {
  freelancerId: string;
}

export interface GetDocumentResponse {
  downloadUrl: string;
}

export const getDocument = api<GetDocumentRequest, GetDocumentResponse>(
  { method: "GET", path: "/verification/document/:freelancerId", expose: true, auth: true },
  async (req): Promise<GetDocumentResponse> => {
    const auth = getAuthData() as AuthData;

    if (auth.role !== 'ADMIN' && auth.userID !== req.freelancerId) {
      throw APIError.permissionDenied("access denied to verification documents");
    }

    const result = await db.queryRow<{
      verification_id_document_path: string | null;
      verification_status: string;
    }>`
      SELECT verification_id_document_path, verification_status
      FROM freelancer_profiles
      WHERE user_id = ${req.freelancerId}
    `;

    if (!result || !result.verification_id_document_path) {
      throw APIError.notFound("verification document not found");
    }

    const documentPath = result.verification_id_document_path;
    const { url } = await verificationDocuments.signedDownloadUrl(documentPath, {
      ttl: 300,
    });

    return { downloadUrl: url };
  }
);

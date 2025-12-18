import { api } from "encore.dev/api";
import { requireFreelancer } from "../auth/middleware";
import db from "../db";
import { verificationDocuments } from "./storage";
import { APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { validateFileUpload, PRESETS } from "../shared/file_validation";

export interface SubmitVerificationRequest {
  legalName: string;
  dateOfBirth: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  idDocumentData: string;
  idDocumentType: "passport" | "brp" | "driving_licence";
}

export interface SubmitVerificationResponse {
  status: string;
  submittedAt: string;
}

export const submit = api<SubmitVerificationRequest, SubmitVerificationResponse>(
  { method: "POST", path: "/verification/submit", expose: true, auth: true },
  async (req): Promise<SubmitVerificationResponse> => {
    requireFreelancer();
    const auth = getAuthData() as AuthData;

    const { legalName, dateOfBirth, addressLine1, addressLine2, city, postcode, idDocumentData, idDocumentType } = req;

    if (!legalName || !dateOfBirth || !addressLine1 || !city || !postcode || !idDocumentData) {
      throw APIError.invalidArgument("all verification fields are required");
    }

    const dobDate = new Date(dateOfBirth);
    if (isNaN(dobDate.getTime())) {
      throw APIError.invalidArgument("invalid date of birth");
    }

    const age = (Date.now() - dobDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (age < 18) {
      throw APIError.invalidArgument("must be 18 or older to verify");
    }

    const buffer = validateFileUpload(idDocumentData, 'application/octet-stream', PRESETS.DOCUMENT_10MB);

    const timestamp = Date.now();
    const documentPath = `${auth.userID}/${timestamp}_${idDocumentType}`;

    await verificationDocuments.upload(documentPath, buffer, {
      contentType: 'application/octet-stream',
    });

    const result = await db.queryRow<{
      verification_status: string;
      verification_submitted_at: Date;
    }>`
      UPDATE freelancer_profiles
      SET
        verification_legal_name = ${legalName},
        verification_date_of_birth = ${dateOfBirth},
        verification_address_line1 = ${addressLine1},
        verification_address_line2 = ${addressLine2 || null},
        verification_city = ${city},
        verification_postcode = ${postcode},
        verification_id_document_path = ${documentPath},
        verification_status = 'pending',
        verification_submitted_at = NOW(),
        verification_reviewed_at = NULL,
        verification_reviewed_by = NULL,
        verification_rejection_note = NULL,
        updated_at = NOW()
      WHERE user_id = ${auth.userID}
      RETURNING verification_status, verification_submitted_at
    `;

    if (!result) {
      throw APIError.notFound("freelancer profile not found");
    }

    const previousStatus = await db.queryRow<{ verification_status: string }>`
      SELECT verification_status FROM verification_action_logs
      WHERE freelancer_id = ${auth.userID}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const isResubmission = previousStatus && previousStatus.verification_status === 'rejected';

    await db.exec`
      INSERT INTO verification_action_logs (freelancer_id, action, previous_status, new_status, notes)
      VALUES (${auth.userID}, ${isResubmission ? 'resubmitted' : 'submitted'}, ${previousStatus?.verification_status || 'unverified'}, 'pending', 'Verification submitted')
    `;

    return {
      status: result.verification_status,
      submittedAt: result.verification_submitted_at.toISOString(),
    };
  }
);

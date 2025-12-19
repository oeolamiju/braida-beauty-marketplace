import { api, Header } from "encore.dev/api";
import db from "../db";
import { APIError } from "encore.dev/api";
import { verifyWebhookSignature } from "./veriff_service";

export interface VeriffWebhookEvent {
  id: string;
  feature: string;
  code: number;
  action: string;
  vendorData?: string;
  verification?: {
    id: string;
    status: string;
    code: number;
    reason?: string;
  };
}

export interface WebhookResponse {
  received: boolean;
}

interface WebhookRequest {
  signature: Header<"x-signature">;
  event: VeriffWebhookEvent;
}

export const webhook = api(
  { method: "POST", path: "/verification/webhook", expose: true, auth: false },
  async ({ signature, event }: WebhookRequest): Promise<WebhookResponse> => {
    const body = JSON.stringify(event);

    if (!signature || !verifyWebhookSignature(body, signature)) {
      throw APIError.permissionDenied("Invalid webhook signature");
    }

    if (event.action === "verification.status.updated" && event.vendorData && event.verification) {
      const userId = event.vendorData;
      let newStatus = "pending";

      if (event.verification.status === "approved") {
        newStatus = "verified";
      } else if (event.verification.status === "declined" || event.verification.status === "resubmission_requested") {
        newStatus = "rejected";
      }

      const profile = await db.queryRow<{
        verification_status: string;
      }>`
        SELECT verification_status
        FROM freelancer_profiles
        WHERE user_id = ${userId}
      `;

      if (profile) {
        await db.exec`
          UPDATE freelancer_profiles
          SET 
            verification_status = ${newStatus},
            verification_reviewed_at = NOW(),
            verification_rejection_note = ${event.verification.reason || null},
            updated_at = NOW()
          WHERE user_id = ${userId}
        `;

        await db.exec`
          INSERT INTO verification_action_logs (freelancer_id, action, previous_status, new_status, notes)
          VALUES (
            ${userId},
            'webhook_update',
            ${profile.verification_status},
            ${newStatus},
            ${event.verification.reason || `Veriff webhook: ${event.verification.status}`}
          )
        `;
      }
    }

    return { received: true };
  }
);

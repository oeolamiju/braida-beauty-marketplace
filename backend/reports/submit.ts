import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { ReportIssueType } from "./types";
import { trackEvent } from "../analytics/track";

export interface SubmitReportRequest {
  reportedUserId: string;
  freelancerId?: string;
  bookingId?: string;
  issueType: ReportIssueType;
  description: string;
  attachmentUrl?: string;
}

export interface SubmitReportResponse {
  reportId: string;
}

export const submit = api(
  { method: "POST", path: "/reports", expose: true, auth: true },
  async (req: SubmitReportRequest): Promise<SubmitReportResponse> => {
    const auth = getAuthData()!;

    if (req.description.trim().length < 10) {
      throw new Error("Description must be at least 10 characters");
    }

    if (auth.userID === req.reportedUserId) {
      throw new Error("Cannot report yourself");
    }

    const reportedUser = await db.queryRow<{ id: string }>`
      SELECT id FROM users WHERE id = ${req.reportedUserId}
    `;

    if (!reportedUser) {
      throw new Error("Reported user not found");
    }

    if (req.freelancerId) {
      const freelancer = await db.queryRow<{ id: string }>`
        SELECT id FROM freelancers WHERE id = ${req.freelancerId} AND user_id = ${req.reportedUserId}
      `;
      if (!freelancer) {
        throw new Error("Freelancer not found or does not belong to reported user");
      }
    }

    if (req.bookingId) {
      const booking = await db.queryRow<{ id: string }>`
        SELECT id FROM bookings 
        WHERE id = ${req.bookingId} 
        AND (client_id = ${auth.userID} OR freelancer_id IN (
          SELECT id FROM freelancers WHERE user_id = ${auth.userID}
        ))
      `;
      if (!booking) {
        throw new Error("Booking not found or you do not have access");
      }
    }

    const result = await db.queryRow<{ id: string }>`
      INSERT INTO reports (
        reporter_id, 
        reported_user_id, 
        freelancer_id,
        booking_id,
        issue_type, 
        description, 
        attachment_url
      )
      VALUES (
        ${auth.userID}, 
        ${req.reportedUserId}, 
        ${req.freelancerId || null},
        ${req.bookingId || null},
        ${req.issueType}, 
        ${req.description}, 
        ${req.attachmentUrl || null}
      )
      RETURNING id
    `;

    await trackEvent(auth.userID, "report_submitted", {
      issueType: req.issueType,
      reportedUserId: req.reportedUserId,
    });

    return { reportId: result!.id };
  }
);

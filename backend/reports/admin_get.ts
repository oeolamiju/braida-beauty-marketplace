import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { Report, ReportAdminAction, ReportIssueType, ReportStatus, AccountStatus } from "./types";

export interface AdminGetReportResponse {
  report: Report;
  actions: ReportAdminAction[];
}

export const adminGet = api(
  { method: "GET", path: "/admin/reports/:id", expose: true, auth: true },
  async ({ id }: { id: string }): Promise<AdminGetReportResponse> => {
    const auth = getAuthData()!;

    const user = await db.queryRow<{ role: string }>`
      SELECT role FROM users WHERE id = ${auth.userID}
    `;

    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const report = await db.queryRow<{
      id: string;
      reporter_id: string;
      reported_user_id: string;
      freelancer_id: string | null;
      booking_id: string | null;
      issue_type: ReportIssueType;
      description: string;
      attachment_url: string | null;
      status: ReportStatus;
      created_at: Date;
      updated_at: Date;
      reporter_email: string;
      reported_user_email: string;
      reporter_name: string;
      reported_user_name: string;
    }>`
      SELECT 
        r.id,
        r.reporter_id,
        r.reported_user_id,
        r.freelancer_id,
        r.booking_id,
        r.issue_type,
        r.description,
        r.attachment_url,
        r.status,
        r.created_at,
        r.updated_at,
        reporter.email as reporter_email,
        reported.email as reported_user_email,
        reporter.full_name as reporter_name,
        reported.full_name as reported_user_name
      FROM reports r
      JOIN users reporter ON r.reporter_id = reporter.id
      JOIN users reported ON r.reported_user_id = reported.id
      WHERE r.id = ${id}
    `;

    if (!report) {
      throw new Error("Report not found");
    }

    const actionsGen = db.query<{
      id: string;
      report_id: string;
      admin_id: string;
      action_type: string;
      notes: string | null;
      previous_account_status: AccountStatus | null;
      new_account_status: AccountStatus | null;
      created_at: Date;
      admin_email: string;
    }>`
      SELECT 
        a.id,
        a.report_id,
        a.admin_id,
        a.action_type,
        a.notes,
        a.previous_account_status,
        a.new_account_status,
        a.created_at,
        admin.email as admin_email
      FROM report_admin_actions a
      JOIN users admin ON a.admin_id = admin.id
      WHERE a.report_id = ${id}
      ORDER BY a.created_at DESC
    `;

    const actionsList: ReportAdminAction[] = [];
    for await (const a of actionsGen) {
      actionsList.push({
        id: a.id,
        reportId: a.report_id,
        adminId: a.admin_id,
        actionType: a.action_type,
        notes: a.notes || undefined,
        previousAccountStatus: a.previous_account_status || undefined,
        newAccountStatus: a.new_account_status || undefined,
        createdAt: a.created_at,
        adminEmail: a.admin_email,
      });
    }

    return {
      report: {
        id: report.id,
        reporterId: report.reporter_id,
        reportedUserId: report.reported_user_id,
        freelancerId: report.freelancer_id || undefined,
        bookingId: report.booking_id || undefined,
        issueType: report.issue_type,
        description: report.description,
        attachmentUrl: report.attachment_url || undefined,
        status: report.status,
        createdAt: report.created_at,
        updatedAt: report.updated_at,
        reporterEmail: report.reporter_email,
        reportedUserEmail: report.reported_user_email,
        reporterName: report.reporter_name,
        reportedUserName: report.reported_user_name,
      },
      actions: actionsList,
    };
  }
);

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { Report, ReportStatus, ReportIssueType } from "./types";
import { requireAdmin } from "../admin/middleware";

export interface AdminListReportsRequest {
  status?: ReportStatus;
  issueType?: ReportIssueType;
  limit?: number;
  offset?: number;
}

export interface AdminListReportsResponse {
  reports: Report[];
  total: number;
}

export const adminList = api(
  { method: "POST", path: "/admin/reports/list", expose: true, auth: true },
  async (req: AdminListReportsRequest): Promise<AdminListReportsResponse> => {
    await requireAdmin();
    const auth = getAuthData()!;

    const limit = req.limit || 50;
    const offset = req.offset || 0;

    let countQuery: any;
    let listQuery: any;

    if (req.status && req.issueType) {
      countQuery = db.queryRow<{ count: number }>`
        SELECT COUNT(*)::int as count
        FROM reports r
        WHERE r.status = ${req.status} AND r.issue_type = ${req.issueType}
      `;
      listQuery = db.query<{
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
        WHERE r.status = ${req.status} AND r.issue_type = ${req.issueType}
        ORDER BY r.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (req.status) {
      countQuery = db.queryRow<{ count: number }>`
        SELECT COUNT(*)::int as count
        FROM reports r
        WHERE r.status = ${req.status}
      `;
      listQuery = db.query<{
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
        WHERE r.status = ${req.status}
        ORDER BY r.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (req.issueType) {
      countQuery = db.queryRow<{ count: number }>`
        SELECT COUNT(*)::int as count
        FROM reports r
        WHERE r.issue_type = ${req.issueType}
      `;
      listQuery = db.query<{
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
        WHERE r.issue_type = ${req.issueType}
        ORDER BY r.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      countQuery = db.queryRow<{ count: number }>`
        SELECT COUNT(*)::int as count
        FROM reports r
      `;
      listQuery = db.query<{
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
        ORDER BY r.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const countResult = await countQuery;
    const total = countResult?.count || 0;
    const reportsGen = await listQuery;

    const reportsList: Report[] = [];
    for await (const r of reportsGen) {
      reportsList.push({
        id: r.id,
        reporterId: r.reporter_id,
        reportedUserId: r.reported_user_id,
        freelancerId: r.freelancer_id || undefined,
        bookingId: r.booking_id || undefined,
        issueType: r.issue_type,
        description: r.description,
        attachmentUrl: r.attachment_url || undefined,
        status: r.status,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        reporterEmail: r.reporter_email,
        reportedUserEmail: r.reported_user_email,
        reporterName: r.reporter_name,
        reportedUserName: r.reported_user_name,
      });
    }

    return {
      reports: reportsList,
      total,
    };
  }
);

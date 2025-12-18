export type ReportIssueType = "safety" | "quality" | "payment" | "harassment" | "fraud" | "other";
export type ReportStatus = "new" | "under_review" | "resolved";
export type AccountStatus = "active" | "warned" | "suspended" | "banned";

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  freelancerId?: string;
  bookingId?: string;
  issueType: ReportIssueType;
  description: string;
  attachmentUrl?: string;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
  reporterEmail?: string;
  reportedUserEmail?: string;
  reporterName?: string;
  reportedUserName?: string;
}

export interface ReportAdminAction {
  id: string;
  reportId: string;
  adminId: string;
  actionType: string;
  notes?: string;
  previousAccountStatus?: AccountStatus;
  newAccountStatus?: AccountStatus;
  createdAt: Date;
  adminEmail?: string;
}

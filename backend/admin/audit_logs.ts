import { api } from "encore.dev/api";
import { requireAdminPermission } from "./rbac";
import { queryAuditLogs, AuditEventType, logAuditEvent } from "../shared/audit_logger";

export { logAuditEvent };

export interface QueryAuditLogsRequest {
  eventType?: AuditEventType;
  actorId?: string;
  targetType?: string;
  targetId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogEntry {
  id: number;
  eventType: string;
  actorId: string;
  actorName?: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, any> | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface QueryAuditLogsResponse {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  totalPages: number;
}

export const listAuditLogs = api<QueryAuditLogsRequest, QueryAuditLogsResponse>(
  { method: "GET", path: "/admin/audit-logs", expose: true, auth: true },
  async (req): Promise<QueryAuditLogsResponse> => {
    await requireAdminPermission("settings", "view");

    const page = req.page || 1;
    const limit = Math.min(req.limit || 50, 100);
    const offset = (page - 1) * limit;

    const result = await queryAuditLogs({
      eventType: req.eventType,
      actorId: req.actorId,
      targetType: req.targetType,
      targetId: req.targetId,
      startDate: req.startDate ? new Date(req.startDate) : undefined,
      endDate: req.endDate ? new Date(req.endDate) : undefined,
      limit,
      offset,
    });

    return {
      logs: result.logs.map(log => ({
        ...log,
        createdAt: log.createdAt.toISOString(),
      })),
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit),
    };
  }
);


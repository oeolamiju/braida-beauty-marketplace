import { api } from "encore.dev/api";
import { requireAdmin } from "./middleware";
import { ListAdminLogsRequest, ListAdminLogsResponse, AdminActionLog } from "./types";
import db from "../db";

export const listLogs = api(
  { method: "POST", path: "/admin/logs/list", expose: true },
  async (req: ListAdminLogsRequest): Promise<ListAdminLogsResponse> => {
    await requireAdmin();

    const limit = req.limit || 50;
    const offset = req.offset || 0;

    let countQuery = `SELECT COUNT(*) as count FROM admin_action_logs l WHERE 1=1`;
    let selectQuery = `
      SELECT 
        l.id,
        l.admin_id,
        u.email as admin_email,
        l.action_type,
        l.target_type,
        l.target_id,
        l.details,
        l.ip_address,
        l.created_at
      FROM admin_action_logs l
      LEFT JOIN users u ON l.admin_id = u.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (req.adminId) {
      countQuery += ` AND l.admin_id = $${params.length + 1}`;
      selectQuery += ` AND l.admin_id = $${params.length + 1}`;
      params.push(req.adminId);
    }

    if (req.targetType) {
      countQuery += ` AND l.target_type = $${params.length + 1}`;
      selectQuery += ` AND l.target_type = $${params.length + 1}`;
      params.push(req.targetType);
    }

    if (req.targetId) {
      countQuery += ` AND l.target_id = $${params.length + 1}`;
      selectQuery += ` AND l.target_id = $${params.length + 1}`;
      params.push(req.targetId);
    }

    if (req.actionType) {
      countQuery += ` AND l.action_type = $${params.length + 1}`;
      selectQuery += ` AND l.action_type = $${params.length + 1}`;
      params.push(req.actionType);
    }

    const countResult = await db.rawQueryAll(countQuery, ...params);
    const total = countResult[0]?.count || 0;

    selectQuery += ` ORDER BY l.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const logsResult = await db.rawQueryAll(selectQuery, ...params);

    const logs: AdminActionLog[] = logsResult.map((row: any) => ({
      id: row.id,
      adminId: row.admin_id,
      adminEmail: row.admin_email,
      actionType: row.action_type,
      targetType: row.target_type,
      targetId: row.target_id,
      details: row.details || undefined,
      ipAddress: row.ip_address || undefined,
      createdAt: new Date(row.created_at),
    }));

    return { logs, total };
  }
);

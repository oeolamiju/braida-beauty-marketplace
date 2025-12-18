import db from "../db";
import { getAuthData } from "~encore/auth";

export type AuditEventType =
  // Auth events
  | "user_registered"
  | "user_login"
  | "user_login_failed"
  | "password_reset_requested"
  | "password_reset_completed"
  | "email_verified"
  
  // Booking events
  | "booking_created"
  | "booking_accepted"
  | "booking_declined"
  | "booking_cancelled"
  | "booking_completed"
  | "booking_disputed"
  
  // Payment events
  | "payment_initiated"
  | "payment_succeeded"
  | "payment_failed"
  | "refund_initiated"
  | "refund_completed"
  | "payout_processed"
  
  // KYC events
  | "kyc_submitted"
  | "kyc_approved"
  | "kyc_rejected"
  
  // Admin actions
  | "admin_user_suspended"
  | "admin_user_unsuspended"
  | "admin_user_banned"
  | "admin_service_deactivated"
  | "admin_service_activated"
  | "admin_dispute_resolved"
  | "admin_review_removed"
  | "admin_settings_changed";

export interface AuditLogEntry {
  eventType: AuditEventType;
  userId?: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// Log an audit event
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const auth = getAuthData();
    const actorId = auth?.userID || entry.userId || "system";

    await db.exec`
      INSERT INTO audit_logs (
        event_type,
        actor_id,
        target_type,
        target_id,
        details,
        ip_address,
        user_agent,
        created_at
      ) VALUES (
        ${entry.eventType},
        ${actorId},
        ${entry.targetType || null},
        ${entry.targetId || null},
        ${entry.details ? JSON.stringify(entry.details) : null},
        ${entry.ipAddress || null},
        ${entry.userAgent || null},
        NOW()
      )
    `;
  } catch (error) {
    // Log to console but don't fail the operation
    console.error("Failed to write audit log:", error);
  }
}

// Query audit logs (for admin)
export interface AuditLogQuery {
  eventType?: AuditEventType;
  actorId?: string;
  targetType?: string;
  targetId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface AuditLogResult {
  id: number;
  eventType: string;
  actorId: string;
  actorName?: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, any> | null;
  ipAddress: string | null;
  createdAt: Date;
}

export async function queryAuditLogs(query: AuditLogQuery): Promise<{
  logs: AuditLogResult[];
  total: number;
}> {
  const limit = query.limit || 50;
  const offset = query.offset || 0;

  // Build dynamic query
  let conditions = "1=1";
  const params: any[] = [];
  let paramIndex = 1;

  if (query.eventType) {
    conditions += ` AND al.event_type = $${paramIndex++}`;
    params.push(query.eventType);
  }

  if (query.actorId) {
    conditions += ` AND al.actor_id = $${paramIndex++}`;
    params.push(query.actorId);
  }

  if (query.targetType) {
    conditions += ` AND al.target_type = $${paramIndex++}`;
    params.push(query.targetType);
  }

  if (query.targetId) {
    conditions += ` AND al.target_id = $${paramIndex++}`;
    params.push(query.targetId);
  }

  if (query.startDate) {
    conditions += ` AND al.created_at >= $${paramIndex++}`;
    params.push(query.startDate);
  }

  if (query.endDate) {
    conditions += ` AND al.created_at <= $${paramIndex++}`;
    params.push(query.endDate);
  }

  // Get total count
  const countResult = await db.rawQueryRow<{ count: number }>(
    `SELECT COUNT(*)::int as count FROM audit_logs al WHERE ${conditions}`,
    ...params
  );

  // Get logs with actor name
  params.push(limit, offset);
  const logsGen = db.rawQuery<AuditLogResult>(
    `SELECT 
      al.id,
      al.event_type as "eventType",
      al.actor_id as "actorId",
      u.name as "actorName",
      al.target_type as "targetType",
      al.target_id as "targetId",
      al.details,
      al.ip_address as "ipAddress",
      al.created_at as "createdAt"
    FROM audit_logs al
    LEFT JOIN users u ON al.actor_id = u.id
    WHERE ${conditions}
    ORDER BY al.created_at DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
    ...params
  );

  const logs: AuditLogResult[] = [];
  for await (const log of logsGen) {
    logs.push(log);
  }

  return {
    logs,
    total: countResult?.count || 0,
  };
}

// Helper to mask sensitive data in logs
export function maskSensitiveData(data: Record<string, any>): Record<string, any> {
  const sensitiveFields = ["password", "token", "secret", "apiKey", "cardNumber"];
  const masked = { ...data };

  for (const field of sensitiveFields) {
    if (field in masked) {
      masked[field] = "***REDACTED***";
    }
  }

  return masked;
}

// Helper to extract IP from request headers
export function extractIpAddress(headers: Record<string, string>): string | undefined {
  return (
    headers["x-forwarded-for"]?.split(",")[0].trim() ||
    headers["x-real-ip"] ||
    headers["cf-connecting-ip"]
  );
}


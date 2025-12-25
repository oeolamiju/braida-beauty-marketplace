import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";

export interface RescheduleRequest {
  id: number;
  bookingId: number;
  requestedBy: number;
  requestedAt: Date;
  newStartTime: Date;
  newEndTime: Date;
  status: string;
  respondedAt?: Date;
  respondedBy?: number;
  responseNote?: string;
  booking: {
    serviceId: number;
    serviceName: string;
    currentStartTime: Date;
    currentEndTime: Date;
  };
}

export interface ListRescheduleRequestsResponse {
  requests: RescheduleRequest[];
}

export const listRescheduleRequests = api<void, ListRescheduleRequestsResponse>(
  { auth: true, expose: true, method: "GET", path: "/bookings/reschedule/requests" },
  async () => {
    const auth = getAuthData()! as AuthData;

    const requests = await db.queryAll<{
      id: number;
      booking_id: number;
      requested_by: number;
      requested_at: Date;
      new_start_time: Date;
      new_end_time: Date;
      status: string;
      responded_at?: Date;
      responded_by?: number;
      response_note?: string;
      service_id: number;
      service_name: string;
      current_start_time: Date;
      current_end_time: Date;
    }>`
      SELECT 
        rr.id,
        rr.booking_id,
        rr.requested_by::int,
        rr.requested_at,
        rr.new_start_time,
        rr.new_end_time,
        rr.status,
        rr.responded_at,
        rr.responded_by::int,
        rr.response_note,
        s.id as service_id,
        s.title as service_name,
        b.start_datetime as current_start_time,
        b.end_datetime as current_end_time
      FROM reschedule_requests rr
      JOIN bookings b ON rr.booking_id = b.id
      JOIN services s ON b.service_id = s.id
      WHERE (b.freelancer_id = ${auth.userID} OR b.client_id = ${auth.userID})
        AND rr.status = 'pending'
      ORDER BY rr.requested_at DESC
    `;

    return {
      requests: requests.map(r => ({
        id: r.id,
        bookingId: r.booking_id,
        requestedBy: r.requested_by,
        requestedAt: r.requested_at,
        newStartTime: r.new_start_time,
        newEndTime: r.new_end_time,
        status: r.status,
        respondedAt: r.responded_at,
        respondedBy: r.responded_by,
        responseNote: r.response_note,
        booking: {
          serviceId: r.service_id,
          serviceName: r.service_name,
          currentStartTime: r.current_start_time,
          currentEndTime: r.current_end_time
        }
      }))
    };
  }
);

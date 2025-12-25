import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";
import crypto from "crypto";

const appUrl = secret("AppURL");

export interface ShareBookingRequest {
  bookingId: number;
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  expiresInHours?: number;
}

export interface ShareBookingResponse {
  shareLink: string;
  shareCode: string;
  expiresAt: string;
}

export interface GetSharedBookingRequest {
  shareCode: string;
}

export interface SharedBookingInfo {
  stylistName: string;
  serviceTitle: string;
  appointmentDate: string;
  appointmentTime: string;
  approximateLocation: string;
  estimatedEndTime: string;
  status: string;
  clientName: string;
}

export const shareBooking = api<ShareBookingRequest, ShareBookingResponse>(
  { method: "POST", path: "/bookings/:bookingId/share", expose: true, auth: true },
  async (req): Promise<ShareBookingResponse> => {
    const auth = getAuthData()!;

    // Get booking and verify ownership
    const booking = await db.queryRow<{
      id: number;
      client_id: string;
      freelancer_id: string;
      status: string;
    }>`
      SELECT id, client_id, freelancer_id, status
      FROM bookings
      WHERE id = ${req.bookingId}
    `;

    if (!booking) {
      throw APIError.notFound("Booking not found");
    }

    // Allow both client and freelancer to share
    if (booking.client_id !== auth.userID && booking.freelancer_id !== auth.userID) {
      throw APIError.permissionDenied("You can only share your own bookings");
    }

    // Generate share code
    const shareCode = crypto.randomBytes(16).toString("hex");
    const expiresInHours = req.expiresInHours || 48;
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    // Store share record
    await db.exec`
      INSERT INTO booking_shares (
        booking_id,
        share_code,
        shared_by,
        recipient_name,
        recipient_email,
        recipient_phone,
        expires_at
      ) VALUES (
        ${req.bookingId},
        ${shareCode},
        ${auth.userID},
        ${req.recipientName},
        ${req.recipientEmail || null},
        ${req.recipientPhone || null},
        ${expiresAt}
      )
    `;

    const baseUrl = appUrl() || "https://braida.uk";
    const shareLink = `${baseUrl}/shared-booking/${shareCode}`;

    return {
      shareLink,
      shareCode,
      expiresAt: expiresAt.toISOString(),
    };
  }
);

export const getSharedBooking = api<GetSharedBookingRequest, SharedBookingInfo>(
  { method: "GET", path: "/shared-booking/:shareCode", expose: true },
  async (req): Promise<SharedBookingInfo> => {
    // Get share record
    const share = await db.queryRow<{
      booking_id: number;
      expires_at: Date;
      is_revoked: boolean;
    }>`
      SELECT booking_id, expires_at, is_revoked
      FROM booking_shares
      WHERE share_code = ${req.shareCode}
    `;

    if (!share) {
      throw APIError.notFound("Share link not found or invalid");
    }

    if (share.is_revoked) {
      throw APIError.permissionDenied("This share link has been revoked");
    }

    if (new Date() > share.expires_at) {
      throw APIError.permissionDenied("This share link has expired");
    }

    // Get booking details (limited info for safety)
    const booking = await db.queryRow<{
      service_title: string;
      freelancer_name: string;
      client_name: string;
      start_datetime: Date;
      end_datetime: Date;
      freelancer_area: string;
      status: string;
    }>`
      SELECT 
        s.title as service_title,
        fp.display_name as freelancer_name,
        CONCAT(c.first_name, ' ', c.last_name) as client_name,
        b.start_datetime,
        b.end_datetime,
        fp.location_area as freelancer_area,
        b.status
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users c ON b.client_id = c.id
      JOIN freelancer_profiles fp ON b.freelancer_id = fp.user_id
      WHERE b.id = ${share.booking_id}
    `;

    if (!booking) {
      throw APIError.notFound("Booking not found");
    }

    // Log access
    await db.exec`
      UPDATE booking_shares
      SET last_accessed_at = NOW(), access_count = access_count + 1
      WHERE share_code = ${req.shareCode}
    `;

    return {
      stylistName: booking.freelancer_name,
      serviceTitle: booking.service_title,
      appointmentDate: booking.start_datetime.toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      appointmentTime: booking.start_datetime.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      approximateLocation: booking.freelancer_area,
      estimatedEndTime: booking.end_datetime.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: booking.status,
      clientName: booking.client_name,
    };
  }
);

export const revokeBookingShare = api(
  { method: "POST", path: "/bookings/:bookingId/share/revoke", expose: true, auth: true },
  async (req: { bookingId: number; shareCode: string }): Promise<{ success: boolean }> => {
    const auth = getAuthData()!;

    const share = await db.queryRow<{ shared_by: string }>`
      SELECT shared_by FROM booking_shares
      WHERE booking_id = ${req.bookingId} AND share_code = ${req.shareCode}
    `;

    if (!share) {
      throw APIError.notFound("Share not found");
    }

    if (share.shared_by !== auth.userID) {
      throw APIError.permissionDenied("You can only revoke your own shares");
    }

    await db.exec`
      UPDATE booking_shares
      SET is_revoked = true, revoked_at = NOW()
      WHERE share_code = ${req.shareCode}
    `;

    return { success: true };
  }
);


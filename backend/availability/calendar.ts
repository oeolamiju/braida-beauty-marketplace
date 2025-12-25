import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { requireFreelancer } from "../auth/middleware";
import db from "../db";
import { APIError } from "encore.dev/api";

export interface CalendarEvent {
  id: string;
  type: "booking" | "blocked" | "exception";
  title: string;
  start: string;
  end: string;
  status?: string;
  clientName?: string;
  serviceTitle?: string;
  bookingId?: number;
  color?: string;
}

export interface GetCalendarRequest {
  startDate: string; // ISO date
  endDate: string; // ISO date
  view?: "month" | "week" | "day";
}

export interface GetCalendarResponse {
  events: CalendarEvent[];
  blockedSlots: { start: string; end: string; reason?: string }[];
}

export const getCalendar = api<GetCalendarRequest, GetCalendarResponse>(
  { method: "GET", path: "/availability/calendar", expose: true, auth: true },
  async (req): Promise<GetCalendarResponse> => {
    requireFreelancer();
    const auth = getAuthData()!;

    const startDate = new Date(req.startDate);
    const endDate = new Date(req.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw APIError.invalidArgument("Invalid date format");
    }

    const events: CalendarEvent[] = [];

    // Get bookings
    const bookingsGen = db.query<{
      id: number;
      service_title: string;
      client_name: string;
      start_datetime: Date;
      end_datetime: Date;
      status: string;
    }>`
      SELECT 
        b.id,
        s.title as service_title,
        CONCAT(u.first_name, ' ', u.last_name) as client_name,
        b.start_datetime,
        b.end_datetime,
        b.status
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.client_id = u.id
      WHERE b.freelancer_id = ${auth.userID}
        AND b.start_datetime >= ${startDate}
        AND b.start_datetime <= ${endDate}
        AND b.status NOT IN ('cancelled', 'expired')
      ORDER BY b.start_datetime
    `;

    for await (const booking of bookingsGen) {
      const statusColors: Record<string, string> = {
        pending: "#FFA500",
        confirmed: "#22C55E",
        completed: "#3B82F6",
        disputed: "#EF4444",
      };

      events.push({
        id: `booking-${booking.id}`,
        type: "booking",
        title: booking.service_title,
        start: booking.start_datetime.toISOString(),
        end: booking.end_datetime.toISOString(),
        status: booking.status,
        clientName: booking.client_name,
        serviceTitle: booking.service_title,
        bookingId: booking.id,
        color: statusColors[booking.status] || "#6B7280",
      });
    }

    // Get blocked time slots
    const blockedSlotsGen = db.query<{
      id: number;
      exception_date: Date;
      start_time: string;
      end_time: string;
      reason: string | null;
      is_unavailable: boolean;
    }>`
      SELECT id, exception_date, start_time, end_time, reason, is_unavailable
      FROM availability_exceptions
      WHERE freelancer_id = ${auth.userID}
        AND exception_date >= ${startDate.toISOString().split("T")[0]}
        AND exception_date <= ${endDate.toISOString().split("T")[0]}
        AND is_unavailable = true
    `;

    const blockedSlots: { start: string; end: string; reason?: string }[] = [];

    for await (const blocked of blockedSlotsGen) {
      const dateStr = blocked.exception_date.toISOString().split("T")[0];
      const start = new Date(`${dateStr}T${blocked.start_time}`);
      const end = new Date(`${dateStr}T${blocked.end_time}`);

      events.push({
        id: `blocked-${blocked.id}`,
        type: "blocked",
        title: blocked.reason || "Blocked",
        start: start.toISOString(),
        end: end.toISOString(),
        color: "#9CA3AF",
      });

      blockedSlots.push({
        start: start.toISOString(),
        end: end.toISOString(),
        reason: blocked.reason || undefined,
      });
    }

    return { events, blockedSlots };
  }
);

export interface BlockTimeRequest {
  date: string; // ISO date (YYYY-MM-DD)
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  reason?: string;
  recurring?: boolean;
  recurringEndDate?: string;
}

export interface BlockTimeResponse {
  id: number;
  message: string;
}

export const blockTime = api<BlockTimeRequest, BlockTimeResponse>(
  { method: "POST", path: "/availability/block", expose: true, auth: true },
  async (req): Promise<BlockTimeResponse> => {
    requireFreelancer();
    const auth = getAuthData()!;

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(req.startTime) || !timeRegex.test(req.endTime)) {
      throw APIError.invalidArgument("Invalid time format. Use HH:MM");
    }

    // Check for conflicting bookings
    const conflictingBooking = await db.queryRow<{ id: number }>`
      SELECT b.id
      FROM bookings b
      WHERE b.freelancer_id = ${auth.userID}
        AND DATE(b.start_datetime) = ${req.date}
        AND b.status IN ('pending', 'confirmed')
        AND (
          (b.start_datetime::time <= ${req.startTime}::time AND b.end_datetime::time > ${req.startTime}::time)
          OR (b.start_datetime::time < ${req.endTime}::time AND b.end_datetime::time >= ${req.endTime}::time)
          OR (b.start_datetime::time >= ${req.startTime}::time AND b.end_datetime::time <= ${req.endTime}::time)
        )
    `;

    if (conflictingBooking) {
      throw APIError.failedPrecondition(
        "Cannot block this time slot - you have an existing booking"
      );
    }

    const result = await db.queryRow<{ id: number }>`
      INSERT INTO availability_exceptions (
        freelancer_id,
        exception_date,
        start_time,
        end_time,
        reason,
        is_unavailable
      ) VALUES (
        ${auth.userID},
        ${req.date},
        ${req.startTime},
        ${req.endTime},
        ${req.reason || null},
        true
      )
      RETURNING id
    `;

    // Handle recurring blocks
    if (req.recurring && req.recurringEndDate) {
      const startDate = new Date(req.date);
      const endDate = new Date(req.recurringEndDate);
      let currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + 7); // Start from next week

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split("T")[0];
        await db.exec`
          INSERT INTO availability_exceptions (
            freelancer_id,
            exception_date,
            start_time,
            end_time,
            reason,
            is_unavailable
          ) VALUES (
            ${auth.userID},
            ${dateStr},
            ${req.startTime},
            ${req.endTime},
            ${req.reason || null},
            true
          )
        `;
        currentDate.setDate(currentDate.getDate() + 7);
      }
    }

    return {
      id: result!.id,
      message: "Time blocked successfully",
    };
  }
);

export const unblockTime = api(
  { method: "DELETE", path: "/availability/block/:id", expose: true, auth: true },
  async (req: { id: number }): Promise<{ success: boolean }> => {
    requireFreelancer();
    const auth = getAuthData()!;

    await db.exec`
      DELETE FROM availability_exceptions
      WHERE id = ${req.id} AND freelancer_id = ${auth.userID}
    `;

    return { success: true };
  }
);

// iCal export
export const exportIcal = api(
  { method: "GET", path: "/availability/ical", expose: true, auth: true },
  async (): Promise<{ icalData: string; filename: string }> => {
    requireFreelancer();
    const auth = getAuthData()!;

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 6, 0);

    const bookingsGen = db.query<{
      id: number;
      service_title: string;
      client_name: string;
      client_email: string;
      start_datetime: Date;
      end_datetime: Date;
      status: string;
      notes: string | null;
    }>`
      SELECT 
        b.id,
        s.title as service_title,
        u.name as client_name,
        u.email as client_email,
        b.start_datetime,
        b.end_datetime,
        b.status,
        b.notes
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.client_id = u.id
      WHERE b.freelancer_id = ${auth.userID}
        AND b.start_datetime >= ${startDate}
        AND b.start_datetime <= ${endDate}
        AND b.status IN ('confirmed', 'completed')
      ORDER BY b.start_datetime
    `;

    let icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Braida//Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Braida Bookings
`;

    for await (const booking of bookingsGen) {
      const uid = `booking-${booking.id}@braida.uk`;
      const dtStart = formatIcalDate(booking.start_datetime);
      const dtEnd = formatIcalDate(booking.end_datetime);
      const description = booking.notes
        ? `Client: ${booking.client_name}\\nNotes: ${booking.notes}`
        : `Client: ${booking.client_name}`;

      icalContent += `BEGIN:VEVENT
UID:${uid}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${booking.service_title} - ${booking.client_name}
DESCRIPTION:${description}
STATUS:${booking.status === "confirmed" ? "CONFIRMED" : "COMPLETED"}
END:VEVENT
`;
    }

    icalContent += "END:VCALENDAR";

    return {
      icalData: icalContent,
      filename: "braida-calendar.ics",
    };
  }
);

function formatIcalDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}


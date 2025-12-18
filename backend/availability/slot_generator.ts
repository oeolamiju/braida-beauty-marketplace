import db from "../db";

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface GenerateSlotOptions {
  freelancerId: string;
  date: Date;
  durationMinutes: number;
  minLeadTimeHours: number;
  maxBookingsPerDay: number | null;
}

export interface SlotGenerationResult {
  slots: Date[];
  bookings: TimeRange[];
  exceptions: TimeRange[];
}

function parseTimeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

function isOverlapping(range1: TimeRange, range2: TimeRange): boolean {
  return range1.start < range2.end && range1.end > range2.start;
}

function isSlotAvailable(
  slotStart: Date,
  slotEnd: Date,
  bookings: TimeRange[],
  blockedExceptions: TimeRange[]
): boolean {
  const slotRange = { start: slotStart, end: slotEnd };

  for (const booking of bookings) {
    if (isOverlapping(slotRange, booking)) {
      return false;
    }
  }

  for (const exception of blockedExceptions) {
    if (isOverlapping(slotRange, exception)) {
      return false;
    }
  }

  return true;
}

export async function generateAvailableSlots(
  options: GenerateSlotOptions
): Promise<SlotGenerationResult> {
  const { freelancerId, date, durationMinutes, minLeadTimeHours, maxBookingsPerDay } = options;

  const dayOfWeek = date.getDay();
  const dateStr = date.toISOString().split('T')[0];
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const now = new Date();
  const earliestSlotStart = addMinutes(now, minLeadTimeHours * 60);

  const rulesIter = db.query<{
    start_time: string;
    end_time: string;
  }>`
    SELECT start_time, end_time
    FROM availability_rules
    WHERE stylist_id = ${freelancerId}
      AND day_of_week = ${dayOfWeek}
      AND is_active = true
    ORDER BY start_time
  `;
  
  const rules = [];
  for await (const rule of rulesIter) {
    rules.push(rule);
  }

  const exceptionsIter = db.query<{
    start_datetime: Date;
    end_datetime: Date;
    type: string;
  }>`
    SELECT start_datetime, end_datetime, type
    FROM availability_exceptions
    WHERE stylist_id = ${freelancerId}
      AND start_datetime < ${endOfDay.toISOString()}
      AND end_datetime > ${startOfDay.toISOString()}
  `;
  
  const exceptions = [];
  for await (const exception of exceptionsIter) {
    exceptions.push(exception);
  }

  const bookingsIter = db.query<{
    start_datetime: Date;
    end_datetime: Date;
  }>`
    SELECT start_datetime, end_datetime
    FROM bookings
    WHERE stylist_id = ${freelancerId}
      AND status IN ('pending', 'confirmed')
      AND start_datetime < ${endOfDay.toISOString()}
      AND end_datetime > ${startOfDay.toISOString()}
  `;
  
  const bookings = [];
  for await (const booking of bookingsIter) {
    bookings.push(booking);
  }

  if (maxBookingsPerDay !== null && bookings.length >= maxBookingsPerDay) {
    return {
      slots: [],
      bookings: bookings.map(b => ({ start: b.start_datetime, end: b.end_datetime })),
      exceptions: exceptions.map(e => ({ start: e.start_datetime, end: e.end_datetime })),
    };
  }

  const blockedExceptions = exceptions
    .filter(e => e.type === 'blocked')
    .map(e => ({ start: e.start_datetime, end: e.end_datetime }));

  const bookingRanges = bookings.map(b => ({
    start: b.start_datetime,
    end: b.end_datetime,
  }));

  const slots: Date[] = [];

  for (const rule of rules) {
    const startMinutes = parseTimeToMinutes(rule.start_time);
    const endMinutes = parseTimeToMinutes(rule.end_time);

    const ruleStart = new Date(date);
    ruleStart.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);

    const ruleEnd = new Date(date);
    ruleEnd.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);

    let currentSlotStart = ruleStart;

    while (currentSlotStart < ruleEnd) {
      const currentSlotEnd = addMinutes(currentSlotStart, durationMinutes);

      if (currentSlotEnd > ruleEnd) {
        break;
      }

      if (currentSlotStart >= earliestSlotStart) {
        if (isSlotAvailable(currentSlotStart, currentSlotEnd, bookingRanges, blockedExceptions)) {
          slots.push(new Date(currentSlotStart));
        }
      }

      currentSlotStart = addMinutes(currentSlotStart, 15);
    }
  }

  return {
    slots,
    bookings: bookingRanges,
    exceptions: exceptions.map(e => ({ start: e.start_datetime, end: e.end_datetime })),
  };
}

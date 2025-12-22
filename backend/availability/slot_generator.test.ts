import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { generateAvailableSlots, type GenerateSlotOptions } from "./slot_generator";
import db from "../db";

describe("Slot Generator", () => {
  const testFreelancerId = "test-freelancer-availability";
  const testClientId = "test-client-availability";
  
  beforeEach(async () => {
    await db.exec`DELETE FROM availability_rules WHERE stylist_id = ${testFreelancerId}`;
    await db.exec`DELETE FROM availability_exceptions WHERE stylist_id = ${testFreelancerId}`;
    await db.exec`DELETE FROM bookings WHERE stylist_id = ${testFreelancerId}`;
    await db.exec`DELETE FROM users WHERE id IN (${testFreelancerId}, ${testClientId})`;
    
    await db.exec`
      INSERT INTO users (id, email, first_name, last_name, role, status)
      VALUES 
        (${testFreelancerId}, 'freelancer-test@test.com', 'Test', 'Freelancer', 'FREELANCER', 'active'),
        (${testClientId}, 'client-test@test.com', 'Test', 'Client', 'CLIENT', 'active')
    `;
  });

  afterEach(async () => {
    await db.exec`DELETE FROM availability_rules WHERE stylist_id = ${testFreelancerId}`;
    await db.exec`DELETE FROM availability_exceptions WHERE stylist_id = ${testFreelancerId}`;
    await db.exec`DELETE FROM bookings WHERE stylist_id = ${testFreelancerId}`;
    await db.exec`DELETE FROM users WHERE id IN (${testFreelancerId}, ${testClientId})`;
  });

  it("should generate slots for a day with availability rules", async () => {
    // Use a date far in the future to avoid timezone/current time issues
    const testDate = new Date();
    testDate.setFullYear(2030, 5, 15); // June 15, 2030 - far in future
    testDate.setHours(0, 0, 0, 0);
    const dayOfWeek = testDate.getDay();

    await db.exec`
      INSERT INTO availability_rules (stylist_id, day_of_week, start_time, end_time)
      VALUES (${testFreelancerId}, ${dayOfWeek}, '09:00', '17:00')
    `;

    const options: GenerateSlotOptions = {
      freelancerId: testFreelancerId,
      date: testDate,
      durationMinutes: 60,
      minLeadTimeHours: 0,
      maxBookingsPerDay: null,
    };

    const result = await generateAvailableSlots(options);
    
    // Should generate slots for a future date
    expect(result.slots.length).toBeGreaterThan(0);
  });

  it("should respect minimum lead time", async () => {
    const now = new Date();
    const testDate = new Date(now);
    testDate.setHours(0, 0, 0, 0);
    const dayOfWeek = testDate.getDay();

    await db.exec`
      INSERT INTO availability_rules (stylist_id, day_of_week, start_time, end_time)
      VALUES (${testFreelancerId}, ${dayOfWeek}, '00:00', '23:59')
    `;

    const options: GenerateSlotOptions = {
      freelancerId: testFreelancerId,
      date: testDate,
      durationMinutes: 60,
      minLeadTimeHours: 48,
      maxBookingsPerDay: null,
    };

    const result = await generateAvailableSlots(options);
    
    expect(result.slots.length).toBe(0);
  });

  it("should exclude blocked exceptions", async () => {
    const testDate = new Date('2025-12-22');
    const dayOfWeek = testDate.getDay();

    await db.exec`
      INSERT INTO availability_rules (stylist_id, day_of_week, start_time, end_time)
      VALUES (${testFreelancerId}, ${dayOfWeek}, '09:00', '17:00')
    `;

    const blockStart = new Date('2025-12-22T10:00:00Z');
    const blockEnd = new Date('2025-12-22T12:00:00Z');

    await db.exec`
      INSERT INTO availability_exceptions (stylist_id, start_datetime, end_datetime, type)
      VALUES (${testFreelancerId}, ${blockStart.toISOString()}, ${blockEnd.toISOString()}, 'blocked')
    `;

    const options: GenerateSlotOptions = {
      freelancerId: testFreelancerId,
      date: testDate,
      durationMinutes: 60,
      minLeadTimeHours: 0,
      maxBookingsPerDay: null,
    };

    const result = await generateAvailableSlots(options);
    
    const blockedSlots = result.slots.filter(slot => {
      const slotEnd = new Date(slot.getTime() + 60 * 60000);
      return slot >= blockStart && slotEnd <= blockEnd;
    });
    
    expect(blockedSlots.length).toBe(0);
    expect(result.exceptions.length).toBe(1);
  });

  it("should exclude slots overlapping with existing bookings", async () => {
    const testDate = new Date('2025-12-22');
    const dayOfWeek = testDate.getDay();

    await db.exec`
      INSERT INTO availability_rules (stylist_id, day_of_week, start_time, end_time)
      VALUES (${testFreelancerId}, ${dayOfWeek}, '09:00', '17:00')
    `;

    const bookingStart = new Date('2025-12-22T14:00:00Z');
    const bookingEnd = new Date('2025-12-22T15:00:00Z');

    await db.exec`
      INSERT INTO bookings (
        client_id, stylist_id, service_id, start_datetime, end_datetime,
        location_type, price_base_pence, total_price_pence, status
      )
      VALUES (
        ${testClientId}, ${testFreelancerId}, 1, ${bookingStart.toISOString()}, ${bookingEnd.toISOString()},
        'stylist_travels_to_client', 5000, 5000, 'confirmed'
      )
    `;

    const options: GenerateSlotOptions = {
      freelancerId: testFreelancerId,
      date: testDate,
      durationMinutes: 60,
      minLeadTimeHours: 0,
      maxBookingsPerDay: null,
    };

    const result = await generateAvailableSlots(options);
    
    const conflictingSlots = result.slots.filter(slot => {
      const slotEnd = new Date(slot.getTime() + 60 * 60000);
      return (slot < bookingEnd && slotEnd > bookingStart);
    });
    
    expect(conflictingSlots.length).toBe(0);
    expect(result.bookings.length).toBe(1);
  });

  it("should respect max bookings per day", async () => {
    const testDate = new Date('2025-12-22');
    const dayOfWeek = testDate.getDay();

    await db.exec`
      INSERT INTO availability_rules (stylist_id, day_of_week, start_time, end_time)
      VALUES (${testFreelancerId}, ${dayOfWeek}, '09:00', '17:00')
    `;

    await db.exec`
      INSERT INTO bookings (
        client_id, stylist_id, service_id, start_datetime, end_datetime,
        location_type, price_base_pence, total_price_pence, status
      )
      VALUES (
        ${testClientId}, ${testFreelancerId}, 1, '2025-12-22T10:00:00Z', '2025-12-22T11:00:00Z',
        'stylist_travels_to_client', 5000, 5000, 'confirmed'
      ),
      (
        ${testClientId}, ${testFreelancerId}, 1, '2025-12-22T14:00:00Z', '2025-12-22T15:00:00Z',
        'stylist_travels_to_client', 5000, 5000, 'confirmed'
      )
    `;

    const options: GenerateSlotOptions = {
      freelancerId: testFreelancerId,
      date: testDate,
      durationMinutes: 60,
      minLeadTimeHours: 0,
      maxBookingsPerDay: 2,
    };

    const result = await generateAvailableSlots(options);
    
    expect(result.slots.length).toBe(0);
  });

  it("should handle edge case: slot at end of day boundary", async () => {
    // Use far future date to avoid current time issues
    const testDate = new Date();
    testDate.setFullYear(2030, 5, 16); // June 16, 2030
    testDate.setHours(0, 0, 0, 0);
    const dayOfWeek = testDate.getDay();

    await db.exec`
      INSERT INTO availability_rules (stylist_id, day_of_week, start_time, end_time)
      VALUES (${testFreelancerId}, ${dayOfWeek}, '16:00', '17:00')
    `;

    const options: GenerateSlotOptions = {
      freelancerId: testFreelancerId,
      date: testDate,
      durationMinutes: 60,
      minLeadTimeHours: 0,
      maxBookingsPerDay: null,
    };

    const result = await generateAvailableSlots(options);
    
    expect(result.slots.length).toBeGreaterThanOrEqual(1);
  });

  it("should handle multiple availability rules on same day", async () => {
    // Use far future date to avoid current time issues
    const testDate = new Date();
    testDate.setFullYear(2030, 5, 17); // June 17, 2030
    testDate.setHours(0, 0, 0, 0);
    const dayOfWeek = testDate.getDay();

    await db.exec`
      INSERT INTO availability_rules (stylist_id, day_of_week, start_time, end_time)
      VALUES 
        (${testFreelancerId}, ${dayOfWeek}, '09:00', '12:00'),
        (${testFreelancerId}, ${dayOfWeek}, '14:00', '17:00')
    `;

    const options: GenerateSlotOptions = {
      freelancerId: testFreelancerId,
      date: testDate,
      durationMinutes: 60,
      minLeadTimeHours: 0,
      maxBookingsPerDay: null,
    };

    const result = await generateAvailableSlots(options);
    
    // With two availability windows, we should get multiple slots for a future date
    expect(result.slots.length).toBeGreaterThan(0);
    expect(result.slots[0]).toBeInstanceOf(Date);
  });
});

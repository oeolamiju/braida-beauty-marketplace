import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { sendNotification } from "../notifications/send";

export interface EmergencyContactRequest {
  bookingId: number;
  latitude?: number;
  longitude?: number;
  message?: string;
}

export interface EmergencyContactResponse {
  alertSent: boolean;
  emergencyNumbers: EmergencyNumber[];
  braidaSupportNumber: string;
  braidaSupportEmail: string;
}

interface EmergencyNumber {
  name: string;
  number: string;
  description: string;
}

const UK_EMERGENCY_NUMBERS: EmergencyNumber[] = [
  {
    name: "Emergency Services",
    number: "999",
    description: "Police, Fire, Ambulance - for immediate emergencies",
  },
  {
    name: "Non-Emergency Police",
    number: "101",
    description: "For non-emergency police enquiries",
  },
  {
    name: "NHS Direct",
    number: "111",
    description: "For non-emergency medical advice",
  },
  {
    name: "National Domestic Abuse Helpline",
    number: "0808 2000 247",
    description: "24-hour freephone helpline",
  },
  {
    name: "Samaritans",
    number: "116 123",
    description: "Emotional support - available 24/7",
  },
];

export const triggerEmergencyAlert = api<EmergencyContactRequest, EmergencyContactResponse>(
  { method: "POST", path: "/safety/emergency-alert", expose: true, auth: true },
  async (req): Promise<EmergencyContactResponse> => {
    const auth = getAuthData()!;

    // Get booking and user details
    const booking = await db.queryRow<{
      id: number;
      client_id: string;
      freelancer_id: string;
      status: string;
      start_datetime: Date;
      service_title: string;
      freelancer_name: string;
      client_name: string;
    }>`
      SELECT 
        b.id, b.client_id, b.freelancer_id, b.status, b.start_datetime,
        s.title as service_title,
        CONCAT(f.first_name, ' ', f.last_name) as freelancer_name,
        CONCAT(c.first_name, ' ', c.last_name) as client_name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users f ON b.freelancer_id = f.id
      JOIN users c ON b.client_id = c.id
      WHERE b.id = ${req.bookingId}
    `;

    if (!booking) {
      return {
        alertSent: false,
        emergencyNumbers: UK_EMERGENCY_NUMBERS,
        braidaSupportNumber: "+44 20 1234 5678",
        braidaSupportEmail: "support@braida.uk",
      };
    }

    // Verify user is part of booking
    const isClient = booking.client_id === auth.userID;
    const isFreelancer = booking.freelancer_id === auth.userID;

    if (!isClient && !isFreelancer) {
      return {
        alertSent: false,
        emergencyNumbers: UK_EMERGENCY_NUMBERS,
        braidaSupportNumber: "+44 20 1234 5678",
        braidaSupportEmail: "support@braida.uk",
      };
    }

    // Log emergency alert
    await db.exec`
      INSERT INTO safety_alerts (
        booking_id,
        triggered_by,
        alert_type,
        latitude,
        longitude,
        message,
        status
      ) VALUES (
        ${req.bookingId},
        ${auth.userID},
        'emergency',
        ${req.latitude || null},
        ${req.longitude || null},
        ${req.message || null},
        'active'
      )
    `;

    // Notify Braida support team
    await sendNotification({
      userId: "system",
      type: "emergency_alert",
      title: "🚨 EMERGENCY ALERT",
      message: `Emergency alert triggered for booking #${req.bookingId}. User: ${isClient ? booking.client_name : booking.freelancer_name}`,
      data: {
        bookingId: req.bookingId,
        triggeredBy: auth.userID,
        latitude: req.latitude,
        longitude: req.longitude,
        message: req.message,
      },
    });

    // Get user's emergency contacts
    const emergencyContacts = await db.query<{
      name: string;
      phone: string;
      email: string;
    }>`
      SELECT name, phone, email
      FROM user_emergency_contacts
      WHERE user_id = ${auth.userID}
    `;

    // Notify emergency contacts
    for await (const contact of emergencyContacts) {
      // In production, this would send SMS/email to contacts
      console.log(`Notifying emergency contact: ${contact.name} at ${contact.phone || contact.email}`);
    }

    return {
      alertSent: true,
      emergencyNumbers: UK_EMERGENCY_NUMBERS,
      braidaSupportNumber: "+44 20 1234 5678",
      braidaSupportEmail: "support@braida.uk",
    };
  }
);

export const getEmergencyInfo = api(
  { method: "GET", path: "/safety/emergency-info", expose: true },
  async (): Promise<{ emergencyNumbers: EmergencyNumber[]; braidaSupportNumber: string; braidaSupportEmail: string }> => {
    return {
      emergencyNumbers: UK_EMERGENCY_NUMBERS,
      braidaSupportNumber: "+44 20 1234 5678",
      braidaSupportEmail: "support@braida.uk",
    };
  }
);

export interface EmergencyContact {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  relationship: string;
}

export const listEmergencyContacts = api(
  { method: "GET", path: "/safety/emergency-contacts", expose: true, auth: true },
  async (): Promise<{ contacts: EmergencyContact[] }> => {
    const auth = getAuthData()!;

    const contactsGen = db.query<EmergencyContact>`
      SELECT id, name, phone, email, relationship
      FROM user_emergency_contacts
      WHERE user_id = ${auth.userID}
      ORDER BY created_at DESC
    `;

    const contacts: EmergencyContact[] = [];
    for await (const contact of contactsGen) {
      contacts.push(contact);
    }

    return { contacts };
  }
);

export const addEmergencyContact = api(
  { method: "POST", path: "/safety/emergency-contacts", expose: true, auth: true },
  async (req: { name: string; phone?: string; email?: string; relationship: string }): Promise<EmergencyContact> => {
    const auth = getAuthData()!;

    if (!req.phone && !req.email) {
      throw new Error("Phone or email is required");
    }

    const result = await db.queryRow<EmergencyContact>`
      INSERT INTO user_emergency_contacts (user_id, name, phone, email, relationship)
      VALUES (${auth.userID}, ${req.name}, ${req.phone || null}, ${req.email || null}, ${req.relationship})
      RETURNING id, name, phone, email, relationship
    `;

    return result!;
  }
);

export const deleteEmergencyContact = api(
  { method: "DELETE", path: "/safety/emergency-contacts/:id", expose: true, auth: true },
  async (req: { id: number }): Promise<{ success: boolean }> => {
    const auth = getAuthData()!;

    await db.exec`
      DELETE FROM user_emergency_contacts
      WHERE id = ${req.id} AND user_id = ${auth.userID}
    `;

    return { success: true };
  }
);


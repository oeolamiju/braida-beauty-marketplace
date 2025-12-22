import { secret } from "encore.dev/config";

const resendApiKey = secret("ResendAPIKey");
const fromEmail = secret("FromEmail");

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const { to, subject, html } = params;

  console.log(`[EMAIL] Attempting to send email to: ${to}`);
  console.log(`[EMAIL] Subject: ${subject}`);

  if (!resendApiKey()) {
    const error = "ResendAPIKey not configured. Please add it in Settings to enable email notifications.";
    console.error(`[EMAIL ERROR] ${error}`);
    throw new Error(error);
  }

  const from = fromEmail() || "Braida <noreply@braida.uk>";
  console.log(`[EMAIL] From address: ${from}`);
  
  const requestBody = {
    from,
    to: [to],
    subject,
    html,
  };
  
  console.log(`[EMAIL] Making request to Resend API...`);
  
  let response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey()}`,
      },
      body: JSON.stringify(requestBody),
    });
  } catch (fetchError) {
    console.error(`[EMAIL ERROR] Network error while calling Resend API:`, fetchError);
    throw new Error(`Network error while sending email: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
  }

  console.log(`[EMAIL] Resend API response status: ${response.status}`);

  if (!response.ok) {
    const error = await response.text();
    console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, response.status, error);
    console.error(`[EMAIL ERROR] Response headers:`, JSON.stringify(Object.fromEntries(response.headers.entries())));
    throw new Error(`Failed to send email: ${response.status} - ${error}`);
  }

  const responseData = await response.json() as { id: string };
  console.log(`[EMAIL SUCCESS] Email sent to ${to}. Resend ID:`, responseData.id);
}

export function getBookingRequestEmail(freelancerName: string, clientName: string, serviceName: string, bookingDate: Date, bookingId: number): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .button { display: inline-block; padding: 12px 24px; background: #000; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Booking Request</h1>
          </div>
          <div class="content">
            <p>Hi ${freelancerName},</p>
            <p>You have received a new booking request from <strong>${clientName}</strong>.</p>
            <p><strong>Service:</strong> ${serviceName}</p>
            <p><strong>Date & Time:</strong> ${bookingDate.toLocaleString()}</p>
            <p>Please review and respond to this booking request as soon as possible.</p>
            <a href="https://braida-beauty-marketplace-production.up.railway.app/freelancer/bookings/${bookingId}" class="button">View Booking</a>
          </div>
          <div class="footer">
            <p>© 2025 Braida Beauty Marketplace. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getBookingAcceptedEmail(clientName: string, freelancerName: string, serviceName: string, bookingDate: Date, bookingId: number): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dcfce7; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .button { display: inline-block; padding: 12px 24px; background: #000; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Booking Confirmed</h1>
          </div>
          <div class="content">
            <p>Hi ${clientName},</p>
            <p>Great news! Your booking with <strong>${freelancerName}</strong> has been confirmed.</p>
            <p><strong>Service:</strong> ${serviceName}</p>
            <p><strong>Date & Time:</strong> ${bookingDate.toLocaleString()}</p>
            <p>We'll send you a reminder before your appointment.</p>
            <a href="https://braida-beauty-marketplace-production.up.railway.app/client/bookings/${bookingId}" class="button">View Booking Details</a>
          </div>
          <div class="footer">
            <p>© 2025 Braida Beauty Marketplace. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getBookingDeclinedEmail(clientName: string, freelancerName: string, serviceName: string, bookingDate: Date): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #fee2e2; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .button { display: inline-block; padding: 12px 24px; background: #000; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Declined</h1>
          </div>
          <div class="content">
            <p>Hi ${clientName},</p>
            <p>Unfortunately, <strong>${freelancerName}</strong> is unable to accept your booking request.</p>
            <p><strong>Service:</strong> ${serviceName}</p>
            <p><strong>Date & Time:</strong> ${bookingDate.toLocaleString()}</p>
            <p>We encourage you to explore other available beauty professionals on our platform.</p>
            <a href="https://braida-beauty-marketplace-production.up.railway.app/client/discover" class="button">Browse Services</a>
          </div>
          <div class="footer">
            <p>© 2025 Braida Beauty Marketplace. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getBookingReminderEmail(userName: string, serviceName: string, bookingDate: Date, bookingId: number, hoursUntil: number): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #fef3c7; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .button { display: inline-block; padding: 12px 24px; background: #000; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Booking Reminder</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>This is a friendly reminder that your appointment is coming up in <strong>${hoursUntil} hours</strong>.</p>
            <p><strong>Service:</strong> ${serviceName}</p>
            <p><strong>Date & Time:</strong> ${bookingDate.toLocaleString()}</p>
            <p>Please make sure you're ready for your appointment. If you need to cancel or reschedule, please do so as soon as possible.</p>
            <a href="https://braida-beauty-marketplace-production.up.railway.app/client/bookings/${bookingId}" class="button">View Booking</a>
          </div>
          <div class="footer">
            <p>© 2025 Braida Beauty Marketplace. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getPaymentReceiptEmail(clientName: string, serviceName: string, amount: number, bookingId: number): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .button { display: inline-block; padding: 12px 24px; background: #000; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .amount { font-size: 24px; font-weight: bold; color: #16a34a; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Receipt</h1>
          </div>
          <div class="content">
            <p>Hi ${clientName},</p>
            <p>Thank you for your payment. Your booking has been confirmed and payment has been securely held in escrow.</p>
            <p><strong>Service:</strong> ${serviceName}</p>
            <div class="amount">$${(amount / 100).toFixed(2)}</div>
            <p>Your payment will be released to the service provider after successful completion of your appointment.</p>
            <a href="https://braida-beauty-marketplace-production.up.railway.app/client/bookings/${bookingId}" class="button">View Booking</a>
          </div>
          <div class="footer">
            <p>© 2025 Braida Beauty Marketplace. All rights reserved.</p>
            <p>This is an automated receipt for your records.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getRefundEmail(clientName: string, serviceName: string, amount: number, reason: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .amount { font-size: 24px; font-weight: bold; color: #2563eb; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Refund Processed</h1>
          </div>
          <div class="content">
            <p>Hi ${clientName},</p>
            <p>A refund has been processed for your booking.</p>
            <p><strong>Service:</strong> ${serviceName}</p>
            <div class="amount">$${(amount / 100).toFixed(2)}</div>
            <p><strong>Reason:</strong> ${reason}</p>
            <p>The refund will appear in your account within 5-10 business days depending on your bank.</p>
          </div>
          <div class="footer">
            <p>© 2025 Braida Beauty Marketplace. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getPayoutEmail(freelancerName: string, amount: number, bookingCount: number): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dcfce7; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .button { display: inline-block; padding: 12px 24px; background: #000; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .amount { font-size: 28px; font-weight: bold; color: #16a34a; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Payout Processed</h1>
          </div>
          <div class="content">
            <p>Hi ${freelancerName},</p>
            <p>Great news! Your payout has been processed.</p>
            <div class="amount">$${(amount / 100).toFixed(2)}</div>
            <p><strong>Bookings included:</strong> ${bookingCount}</p>
            <p>The funds should arrive in your connected account within 2-3 business days.</p>
            <a href="https://braida-beauty-marketplace-production.up.railway.app/freelancer/earnings" class="button">View Earnings</a>
          </div>
          <div class="footer">
            <p>© 2025 Braida Beauty Marketplace. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getReviewReminderEmail(clientName: string, freelancerName: string, serviceName: string, bookingId: number): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #fef3c7; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .button { display: inline-block; padding: 12px 24px; background: #000; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⭐ How was your experience?</h1>
          </div>
          <div class="content">
            <p>Hi ${clientName},</p>
            <p>We hope you enjoyed your recent appointment with <strong>${freelancerName}</strong>!</p>
            <p><strong>Service:</strong> ${serviceName}</p>
            <p>Your feedback helps other clients make informed decisions and helps beauty professionals improve their services.</p>
            <p>Would you mind taking a moment to leave a review?</p>
            <a href="https://braida-beauty-marketplace-production.up.railway.app/client/bookings/${bookingId}" class="button">Leave a Review</a>
          </div>
          <div class="footer">
            <p>© 2025 Braida Beauty Marketplace. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

import { api } from "encore.dev/api";
import { CronJob } from "encore.dev/cron";
import db from "../db";
import { sendNotification } from "../notifications/send";
import { calculatePayoutAmounts, createPayoutRecord } from "../payouts/payout_service";

export const processAutoConfirmationsEndpoint = api(
  { expose: false, method: "POST", path: "/payments/cron/auto-confirm" },
  async () => {
    const now = new Date();

    const bookingsToConfirm = await db.queryAll<{
      id: number;
      client_id: string;
      freelancer_id: string;
      auto_confirm_at: string;
    }>`
      SELECT b.id, b.client_id, b.freelancer_id, b.auto_confirm_at
      FROM bookings b
      WHERE b.auto_confirm_at IS NOT NULL
        AND b.auto_confirm_at <= ${now.toISOString()}
        AND b.status = 'confirmed'
        AND b.payment_status = 'paid'
        AND NOT EXISTS (
          SELECT 1 FROM disputes d
          WHERE d.booking_id = b.id
            AND d.status != 'resolved'
        )
    `;

    for (const booking of bookingsToConfirm) {
      try {
        const payment = await db.queryRow<{
          id: number;
          escrow_status: string;
          amount_pence: number;
          platform_fee_pence: number;
        }>`
          SELECT id, escrow_status, amount_pence, platform_fee_pence
          FROM payments
          WHERE booking_id = ${booking.id} AND status = 'succeeded'
          ORDER BY created_at DESC
          LIMIT 1
        `;

        if (!payment || payment.escrow_status !== 'held') {
          continue;
        }

        await db.exec`
          UPDATE payments
          SET escrow_status = 'released',
              escrow_released_at = NOW(),
              updated_at = NOW()
          WHERE id = ${payment.id}
        `;

        await db.exec`
          UPDATE bookings
          SET completed_at = NOW(),
              auto_confirm_at = NULL,
              updated_at = NOW()
          WHERE id = ${booking.id}
        `;

        await db.exec`
          INSERT INTO booking_audit_logs (booking_id, user_id, action, new_status, metadata)
          VALUES (
            ${booking.id}, 'system', 'auto_confirmed', 'confirmed',
            ${JSON.stringify({ autoConfirm: true, confirmedAt: now.toISOString() })}
          )
        `;

        const serviceAmountDollars = (payment.amount_pence - payment.platform_fee_pence) / 100;
        const amounts = await calculatePayoutAmounts(serviceAmountDollars);
        
        try {
          await createPayoutRecord(
            booking.freelancer_id,
            booking.id,
            amounts
          );
        } catch (error: any) {
          console.error("Failed to create payout record:", error.message);
        }

        await sendNotification({
          userId: booking.freelancer_id,
          type: "payment_released",
          title: "Payment Released",
          message: "Service auto-confirmed after 24 hours. Your payment has been released.",
          data: { 
            bookingId: booking.id,
            amountPence: payment.amount_pence - payment.platform_fee_pence,
          },
        });

        await sendNotification({
          userId: booking.client_id,
          type: "service_auto_confirmed",
          title: "Service Confirmed",
          message: "Your booking was automatically confirmed. If there are any issues, please contact support.",
          data: { bookingId: booking.id },
        });

        console.log(`Auto-confirmed booking ${booking.id}`);
      } catch (error) {
        console.error(`Failed to auto-confirm booking ${booking.id}:`, error);
      }
    }

    console.log(`Processed ${bookingsToConfirm.length} auto-confirmations`);
    return { confirmed: bookingsToConfirm.length };
  }
);

const _ = new CronJob("process-auto-confirms", {
  title: "Process Auto-Confirmations",
  schedule: "*/10 * * * *",
  endpoint: processAutoConfirmationsEndpoint,
});

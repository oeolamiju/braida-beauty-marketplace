import { api } from "encore.dev/api";
import { CronJob } from "encore.dev/cron";
import db from "../db";
import { processPayoutNow } from "./payout_service";

export const processScheduledPayoutsEndpoint = api(
  { expose: false, method: "POST", path: "/payouts/cron/process-scheduled" },
  async () => {
    console.log("Processing scheduled payouts...");
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const payouts = await db.queryAll<{ id: number }>`
      SELECT p.id
      FROM payouts p
      JOIN payout_accounts pa ON pa.freelancer_id = p.freelancer_id
      JOIN users u ON u.id = p.freelancer_id
      WHERE p.status IN ('pending', 'scheduled')
        AND p.scheduled_date <= ${today}
        AND pa.payouts_enabled = true
        AND u.verified_freelancer = true
      ORDER BY p.scheduled_date ASC, p.id ASC
    `;
    
    console.log(`Found ${payouts.length} payouts to process`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const payout of payouts) {
      try {
        await processPayoutNow(payout.id);
        successCount++;
        console.log(`Processed payout ${payout.id} successfully`);
      } catch (error: any) {
        failCount++;
        console.error(`Failed to process payout ${payout.id}:`, error.message);
      }
    }
    
    console.log(`Payout processing complete: ${successCount} succeeded, ${failCount} failed`);
    return { successCount, failCount };
  }
);

const _ = new CronJob("process-scheduled-payouts", {
  title: "Process Scheduled Payouts",
  schedule: "0 9 * * 5",
  endpoint: processScheduledPayoutsEndpoint,
});

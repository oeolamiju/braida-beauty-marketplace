import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { getAccountStatus } from "./stripe_connect";
import { PayoutAccount } from "./types";

export interface RefreshAccountStatusResponse {
  account: PayoutAccount;
}

export const refreshAccountStatus = api(
  { method: "POST", path: "/payouts/account/refresh", expose: true, auth: true },
  async (): Promise<RefreshAccountStatusResponse> => {
    const auth = getAuthData()!;
    
    const account = await db.queryRow`
      SELECT id, stripe_account_id 
      FROM payout_accounts 
      WHERE freelancer_id = ${auth.userID}
    `;
    
    if (!account) {
      throw APIError.notFound("Payout account not found");
    }
    
    const status = await getAccountStatus(account.stripe_account_id);
    
    await db.exec`
      UPDATE payout_accounts 
      SET 
        account_status = ${status.accountStatus},
        onboarding_completed = ${status.onboardingCompleted},
        payouts_enabled = ${status.payoutsEnabled},
        details_submitted = ${status.detailsSubmitted},
        requirements_due = ${JSON.stringify(status.requirementsDue)},
        updated_at = NOW()
      WHERE id = ${account.id}
    `;
    
    const updated = await db.queryRow<{
      id: number;
      freelancer_id: number;
      stripe_account_id: string;
      account_status: string;
      onboarding_completed: boolean;
      payouts_enabled: boolean;
      details_submitted: boolean;
      requirements_due: any;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT 
        id,
        freelancer_id,
        stripe_account_id,
        account_status,
        onboarding_completed,
        payouts_enabled,
        details_submitted,
        requirements_due,
        created_at,
        updated_at
      FROM payout_accounts 
      WHERE id = ${account.id}
    `;
    
    if (!updated) {
      throw APIError.notFound("Updated account not found");
    }
    
    return {
      account: {
        id: updated.id,
        freelancerId: updated.freelancer_id,
        stripeAccountId: updated.stripe_account_id,
        accountStatus: updated.account_status as any,
        onboardingCompleted: updated.onboarding_completed,
        payoutsEnabled: updated.payouts_enabled,
        detailsSubmitted: updated.details_submitted,
        requirementsDue: updated.requirements_due,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      },
    };
  }
);

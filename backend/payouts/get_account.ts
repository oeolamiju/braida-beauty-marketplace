import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { PayoutAccount } from "./types";

export interface GetPayoutAccountResponse {
  account?: PayoutAccount;
}

export const getAccount = api(
  { method: "GET", path: "/payouts/account", expose: true, auth: true },
  async (): Promise<GetPayoutAccountResponse> => {
    const auth = getAuthData()!;
    
    const account = await db.queryRow`
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
      WHERE freelancer_id = ${auth.userID}
    `;
    
    if (!account) {
      return { account: undefined };
    }
    
    return {
      account: {
        id: account.id,
        freelancerId: account.freelancer_id,
        stripeAccountId: account.stripe_account_id,
        accountStatus: account.account_status,
        onboardingCompleted: account.onboarding_completed,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        requirementsDue: account.requirements_due,
        createdAt: account.created_at,
        updatedAt: account.updated_at,
      },
    };
  }
);

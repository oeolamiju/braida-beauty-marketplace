import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { createConnectedAccount, createAccountLink } from "./stripe_connect";

export interface CreatePayoutAccountRequest {
  returnUrl: string;
  refreshUrl: string;
}

export interface CreatePayoutAccountResponse {
  accountId: string;
  onboardingUrl: string;
}

export const createAccount = api(
  { method: "POST", path: "/payouts/account", expose: true, auth: true },
  async (req: CreatePayoutAccountRequest): Promise<CreatePayoutAccountResponse> => {
    const auth = getAuthData()!;
    
    const userResult = await db.queryRow`
      SELECT id, email, user_type, verified_freelancer 
      FROM users 
      WHERE id = ${auth.userID}
    `;
    
    if (!userResult) {
      throw APIError.unauthenticated("User not found");
    }
    
    if (userResult.user_type !== "freelancer") {
      throw APIError.permissionDenied("Only freelancers can create payout accounts");
    }
    
    if (!userResult.verified_freelancer) {
      throw APIError.permissionDenied("Only Braida Verified freelancers can create payout accounts");
    }
    
    const existingAccount = await db.queryRow`
      SELECT id, stripe_account_id 
      FROM payout_accounts 
      WHERE freelancer_id = ${auth.userID}
    `;
    
    if (existingAccount) {
      const accountLink = await createAccountLink(
        existingAccount.stripe_account_id,
        req.refreshUrl,
        req.returnUrl
      );
      
      return {
        accountId: existingAccount.stripe_account_id,
        onboardingUrl: accountLink.url,
      };
    }
    
    const stripeAccount = await createConnectedAccount(userResult.email);
    
    await db.exec`
      INSERT INTO payout_accounts (
        freelancer_id,
        stripe_account_id,
        account_status,
        onboarding_completed,
        payouts_enabled,
        details_submitted
      ) VALUES (
        ${auth.userID},
        ${stripeAccount.id},
        'pending',
        false,
        false,
        false
      )
    `;
    
    const accountLink = await createAccountLink(
      stripeAccount.id,
      req.refreshUrl,
      req.returnUrl
    );
    
    return {
      accountId: stripeAccount.id,
      onboardingUrl: accountLink.url,
    };
  }
);

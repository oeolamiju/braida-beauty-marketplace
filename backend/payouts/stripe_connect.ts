import Stripe from "stripe";
import { secret } from "encore.dev/config";

const stripeSecretKey = secret("StripeSecretKey");

let stripe: Stripe;

export function getStripeClient(): Stripe {
  if (!stripe) {
    stripe = new Stripe(stripeSecretKey(), {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return stripe;
}

export async function createConnectedAccount(email: string, country: string = "US") {
  const stripe = getStripeClient();
  
  const account = await stripe.accounts.create({
    type: "express",
    email,
    country,
    capabilities: {
      transfers: { requested: true },
    },
    settings: {
      payouts: {
        schedule: {
          interval: "manual",
        },
      },
    },
  });

  return account;
}

export async function createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
  const stripe = getStripeClient();
  
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });

  return accountLink;
}

export async function getAccountStatus(accountId: string) {
  const stripe = getStripeClient();
  
  const account = await stripe.accounts.retrieve(accountId);
  
  return {
    accountStatus: account.charges_enabled && account.payouts_enabled ? "active" : 
                   account.requirements?.currently_due?.length ? "restricted" : "pending",
    onboardingCompleted: account.details_submitted || false,
    payoutsEnabled: account.payouts_enabled || false,
    detailsSubmitted: account.details_submitted || false,
    requirementsDue: account.requirements?.currently_due || [],
  };
}

export async function createPayout(accountId: string, amount: number, currency: string = "usd") {
  const stripe = getStripeClient();
  
  const payout = await stripe.payouts.create(
    {
      amount: Math.round(amount * 100),
      currency,
    },
    {
      stripeAccount: accountId,
    }
  );

  return payout;
}

export async function createTransfer(accountId: string, amount: number, currency: string = "usd") {
  const stripe = getStripeClient();
  
  const transfer = await stripe.transfers.create({
    amount: Math.round(amount * 100),
    currency,
    destination: accountId,
  });

  return transfer;
}

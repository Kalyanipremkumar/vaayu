/**
 * Payment types shared by the paywall UI and the webhook handlers.
 * Razorpay handles INR, Stripe handles USD / international.
 */

/** Which gateway a charge runs through, chosen by the user's region. */
export type PaymentProvider = 'razorpay' | 'stripe';

/** Supported billing currencies. */
export type Currency = 'INR' | 'USD';

/** Pay-per-valuation pricing, kept in the smallest currency unit's parent. */
export interface ValuationPrice {
  provider: PaymentProvider;
  currency: Currency;
  /** Human-facing amount, e.g. 99 (INR) or 1.99 (USD). */
  amount: number;
}

/** Result of a completed checkout, persisted onto the valuation row. */
export interface PaymentConfirmation {
  provider: PaymentProvider;
  paymentId: string;
  currency: Currency;
  amount: number;
  verified: boolean;
}

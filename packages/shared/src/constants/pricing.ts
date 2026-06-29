/**
 * Constants that encode the three-layer valuation methodology.
 * Pure numbers — no secrets, safe to ship in any bundle. The actual AI call
 * that *fills in* these values runs server-side; these bound and combine them.
 */

import type {
  ArtistTier,
  ArtworkCondition,
  PaymentProvider,
  ValuationPrice,
  ValuationPurpose,
} from '../types';

/** Layer-2 artist multiplier band per recognition tier. */
export const ARTIST_TIER_MULTIPLIERS: Record<ArtistTier, { min: number; max: number }> = {
  emerging: { min: 0.7, max: 1.0 },
  'mid-career': { min: 1.0, max: 1.8 },
  established: { min: 1.8, max: 3.5 },
  'blue-chip': { min: 3.5, max: 10 },
};

/** Default Layer-2 multiplier when the artist is unknown / unverifiable. */
export const UNKNOWN_ARTIST_MULTIPLIER = 0.8;

/** Layer-3 work-level adjustment band. */
export const WORK_ADJUSTMENT_RANGE = { min: 0.7, max: 1.5 } as const;

/** Indicative condition contribution within the Layer-3 band (guidance only). */
export const CONDITION_FACTORS: Record<ArtworkCondition, number> = {
  excellent: 1.5,
  good: 1.15,
  fair: 0.9,
  poor: 0.7,
};

/** Spread applied around the mid estimate to produce low / high. */
export const ESTIMATE_SPREAD = { lowFactor: 0.85, highFactor: 1.2 } as const;

/** Standard disclaimer shown on every valuation (screen + PDF). */
export const VALUATION_DISCLAIMER =
  'This valuation is generated from the details you provided and an AI model. It is indicative guidance only — not a certified appraisal, insurance valuation, or auction estimate. Actual prices vary with demand, provenance, condition, and market conditions.';

/**
 * Valuation purposes. `instruction` is appended to the model prompt server-side
 * so the estimate reflects the right kind of value; `label` is the UI option.
 */
export const VALUATION_PURPOSES: readonly {
  key: ValuationPurpose;
  label: string;
  instruction: string;
}[] = [
  {
    key: 'fair_market',
    label: 'Fair market value',
    instruction:
      'VALUATION PURPOSE — Fair Market Value: the price a willing buyer and willing seller would agree on, neither under compulsion. This is the default, balanced retail-resale value.',
  },
  {
    key: 'insurance',
    label: 'Insurance / replacement',
    instruction:
      'VALUATION PURPOSE — Insurance / Replacement Value: the retail cost to replace this work with a comparable one. This is typically HIGHER than fair market value (full retail, not resale). Lean to the upper end of defensible.',
  },
  {
    key: 'auction',
    label: 'Auction estimate',
    instruction:
      'VALUATION PURPOSE — Auction Estimate: the realistic hammer-price range expected at auction, before buyer’s premium. This typically sits at or below fair-market retail; present a sensible low–high auction range.',
  },
] as const;

/** Pay-per-valuation pricing by region. */
export const VALUATION_PRICES: Record<PaymentProvider, ValuationPrice> = {
  razorpay: { provider: 'razorpay', currency: 'INR', amount: 99 },
  stripe: { provider: 'stripe', currency: 'USD', amount: 1.99 },
};

/** Upload constraints enforced on the client and re-checked server-side. */
export const UPLOAD_LIMITS = {
  maxBytes: 10 * 1024 * 1024, // 10 MB
  maxWidthPx: 2048,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
} as const;

/** Rate limit on the valuation endpoint, enforced server-side. */
export const VALUATION_RATE_LIMIT = { maxPerMinute: 10 } as const;

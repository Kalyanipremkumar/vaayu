/**
 * Constants that encode the three-layer valuation methodology.
 * Pure numbers — no secrets, safe to ship in any bundle. The actual AI call
 * that *fills in* these values runs server-side; these bound and combine them.
 */

import type {
  ArtistTier,
  ArtworkCondition,
  CareerStage,
  PaymentProvider,
  PricingPosture,
  SellingChannel,
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

// ─────────────────────────────────────────────────────────────────────────────
// Artist Mode — forward pricing constants (Layers 4 & 5, floor/ceiling).
// Pure numbers; the artist math in pricing-engine.ts combines them.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Career stages an artist self-reports, mapped to the collector-mode
 * {@link ArtistTier} so the same Layer-2 multiplier band drives both modes.
 * `renowned` maps to `blue-chip`.
 */
export const CAREER_STAGES: readonly {
  key: CareerStage;
  label: string;
  tier: ArtistTier;
  description: string;
}[] = [
  {
    key: 'emerging',
    label: 'Emerging',
    tier: 'emerging',
    description: 'Recent graduate or self-taught. 0–5 years of practice. Few exhibitions.',
  },
  {
    key: 'mid-career',
    label: 'Mid-career',
    tier: 'mid-career',
    description: '5–15 years of practice. Multiple gallery shows. Growing collector base.',
  },
  {
    key: 'established',
    label: 'Established',
    tier: 'established',
    description: 'Recognized within tradition. Institutional collectors. Possibly published.',
  },
  {
    key: 'renowned',
    label: 'Renowned',
    tier: 'blue-chip',
    description: 'National / international recognition. Museum collections. Multiple publications.',
  },
] as const;

/** Map a self-reported career stage to the Layer-2 recognition tier. */
export const CAREER_STAGE_TO_TIER: Record<CareerStage, ArtistTier> = {
  emerging: 'emerging',
  'mid-career': 'mid-career',
  established: 'established',
  renowned: 'blue-chip',
};

/** Posture (Layer 5) multipliers applied to the ask price. */
export const PRICING_POSTURES: readonly {
  key: PricingPosture;
  label: string;
  factor: number;
  description: string;
}[] = [
  {
    key: 'sell_quickly',
    label: 'Sell quickly',
    factor: 0.9,
    description: 'A slight discount on the ask. Signals willingness to negotiate.',
  },
  {
    key: 'balanced',
    label: 'Balanced',
    factor: 1.0,
    description: 'The straight middle. Recommended for most artists.',
  },
  {
    key: 'hold',
    label: 'Hold for the right buyer',
    factor: 1.1,
    description: 'A slight premium. Signals you are not in a hurry.',
  },
] as const;

/** Quick lookup of posture key → factor. */
export const PRICING_POSTURE_FACTORS: Record<PricingPosture, number> = {
  sell_quickly: 0.9,
  balanced: 1.0,
  hold: 1.1,
};

/** Channels an artist can sell through, with display labels. */
export const SELLING_CHANNELS: readonly { key: SellingChannel; label: string }[] = [
  { key: 'gallery', label: 'Gallery' },
  { key: 'direct', label: 'Direct (Instagram, WhatsApp)' },
  { key: 'art_fair', label: 'Art fair' },
  { key: 'varnam', label: 'Varnam marketplace' },
  { key: 'commission', label: 'Custom commission' },
];

/** Varnam marketplace commission, as a fraction (Layer 4 gross-up). */
export const VARNAM_COMMISSION_PCT = 10;

/** Art-fair headline premium over the ask (booth fees consume it; net = ask). */
export const ART_FAIR_PREMIUM = 1.14;

/** Custom-commission bespoke premium (the artist keeps it; net = quoted). */
export const COMMISSION_PREMIUM = 1.3;

/** Indicative payment-processing fee on direct sales (display note only). */
export const DIRECT_PROCESSING_PCT = 2;

/** Gallery commission slider bounds (percent). */
export const GALLERY_CUT_RANGE = { min: 20, max: 60, default: 40 } as const;

/** Floor / ceiling spread around the artist ask price. */
export const ARTIST_PRICE_SPREAD = { floorFactor: 0.77, ceilingFactor: 1.27 } as const;

/** Standard disclaimer shown on every artist pricing recommendation. */
export const ARTIST_PRICING_DISCLAIMER =
  'This is AI-generated pricing guidance based on the details you provided and Vaayu’s methodology — not a guarantee of sale. Final prices depend on demand, channel, timing, and negotiation. Treat the floor as your absolute minimum.';

/** Upload constraints enforced on the client and re-checked server-side. */
export const UPLOAD_LIMITS = {
  maxBytes: 10 * 1024 * 1024, // 10 MB
  maxWidthPx: 2048,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
} as const;

/** Rate limit on the valuation endpoint, enforced server-side. */
export const VALUATION_RATE_LIMIT = { maxPerMinute: 10 } as const;

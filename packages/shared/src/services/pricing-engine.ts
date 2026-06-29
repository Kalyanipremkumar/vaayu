/**
 * Pure pricing math for the Vaayu three-layer methodology.
 *
 * IMPORTANT: this module contains NO network calls and NO secrets. The actual
 * Claude vision call that *produces* the per-layer numbers runs server-side
 * (see the pricing Edge Function). These functions take the model's raw layer
 * outputs, enforce the methodology's guardrails, and assemble the final result.
 * Keeping the math here means it is fully unit-testable and reused verbatim by
 * web, mobile, and the server.
 */

import {
  ARTIST_PRICE_SPREAD,
  ARTIST_TIER_MULTIPLIERS,
  ART_FAIR_PREMIUM,
  COMMISSION_PREMIUM,
  ESTIMATE_SPREAD,
  PRICING_POSTURE_FACTORS,
  UNKNOWN_ARTIST_MULTIPLIER,
  VARNAM_COMMISSION_PCT,
  WORK_ADJUSTMENT_RANGE,
} from '../constants/pricing';
import { clamp } from '../utils/format';
import type {
  ArtistTier,
  ChannelPrice,
  Dimensions,
  PricingPosture,
  SellingChannel,
  ValuationInput,
  ValuationResult,
} from '../types';

/** The raw, unvalidated layer output the model returns (before guardrails). */
export interface RawLayerOutput {
  baseValue: { amount: number; rationale: string };
  artistMultiplier: { multiplier: number; rationale: string; tier?: ArtistTier | null };
  workAdjustment: { multiplier: number; rationale: string };
  confidenceScore: number;
  comparables?: string[];
  fullReport: string;
}

/** A low / mid / high INR triple. */
export interface EstimateRange {
  low: number;
  mid: number;
  high: number;
}

/**
 * Clamp the model's artist multiplier into the band allowed for its claimed
 * tier. If no tier is given (artist unknown/unverified), fall back to the
 * conservative default rather than trusting an unbounded multiplier.
 */
export function clampArtistMultiplier(multiplier: number, tier?: ArtistTier | null): number {
  if (!tier) return UNKNOWN_ARTIST_MULTIPLIER;
  const band = ARTIST_TIER_MULTIPLIERS[tier];
  return clamp(multiplier, band.min, band.max);
}

/** Clamp the model's work-level adjustment into the Layer-3 band. */
export function clampWorkAdjustment(multiplier: number): number {
  return clamp(multiplier, WORK_ADJUSTMENT_RANGE.min, WORK_ADJUSTMENT_RANGE.max);
}

/**
 * Combine the three layers into a low / mid / high estimate.
 *   mid  = base × artistMultiplier × workAdjustment
 *   low  = mid × 0.85
 *   high = mid × 1.20
 * All results are rounded to whole rupees.
 */
export function combineLayers(
  baseValue: number,
  artistMultiplier: number,
  workAdjustment: number,
): EstimateRange {
  const mid = baseValue * artistMultiplier * workAdjustment;
  return {
    low: Math.round(mid * ESTIMATE_SPREAD.lowFactor),
    mid: Math.round(mid),
    high: Math.round(mid * ESTIMATE_SPREAD.highFactor),
  };
}

/**
 * Score how complete the user-supplied context is, contributing to the final
 * confidence score. Returns 0–100. The model's own confidence is blended with
 * this server-side signal so a sparse submission can never report high
 * confidence even if the model is overeager.
 */
export function contextCompletenessScore(input: ValuationInput): number {
  let score = 40; // baseline: image + tradition + medium + dimensions are required
  if (input.artistKnown && input.artistName?.trim()) score += 20;
  if (input.yearCreated) score += 10;
  if (input.provenanceNotes?.trim()) score += 20;
  if (input.dimensions.heightCm > 0 && input.dimensions.widthCm > 0) score += 10;
  // Deeper optional criteria each reinforce the signal (the total is clamped to 100).
  const c = input.criteria;
  if (c?.exhibitionHistory?.trim()) score += 10;
  if (c?.publications?.trim()) score += 10;
  if (c?.editionType) score += 5;
  if (c?.priorSaleLowInr || c?.priorSaleHighInr) score += 10;
  return clamp(score, 0, 100);
}

/**
 * Blend the model's confidence with the context-completeness signal, capping at
 * the lower of the two so confidence reflects the weakest link.
 */
export function blendConfidence(modelConfidence: number, contextScore: number): number {
  const blended = Math.round(modelConfidence * 0.6 + contextScore * 0.4);
  return clamp(Math.min(blended, modelConfidence, contextScore + 15), 0, 100);
}

/**
 * Take the model's raw layer output plus the original input, apply all
 * methodology guardrails, and assemble the final, persistable ValuationResult.
 */
export function assembleValuation(raw: RawLayerOutput, input: ValuationInput): ValuationResult {
  const artistMultiplier = clampArtistMultiplier(
    raw.artistMultiplier.multiplier,
    raw.artistMultiplier.tier,
  );
  const workAdjustment = clampWorkAdjustment(raw.workAdjustment.multiplier);
  const range = combineLayers(raw.baseValue.amount, artistMultiplier, workAdjustment);
  const confidence = blendConfidence(raw.confidenceScore, contextCompletenessScore(input));

  return {
    estimatedLowInr: range.low,
    estimatedMidInr: range.mid,
    estimatedHighInr: range.high,
    confidenceScore: confidence,
    reasoning: {
      baseValue: raw.baseValue,
      artistMultiplier: {
        multiplier: artistMultiplier,
        rationale: raw.artistMultiplier.rationale,
        ...(raw.artistMultiplier.tier ? { tier: raw.artistMultiplier.tier } : {}),
      },
      workAdjustment: { multiplier: workAdjustment, rationale: raw.workAdjustment.rationale },
      ...(raw.comparables?.length ? { comparables: raw.comparables } : {}),
    },
    fullReport: raw.fullReport,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Artist Mode — pure forward-pricing math (Layers 4 & 5, floor/ceiling).
// The net mid value comes from the collector valuation (Layers 1–3, server-side);
// everything below is deterministic and fully unit-testable.
// ─────────────────────────────────────────────────────────────────────────────

/** Square centimetres in one square foot. */
const SQ_CM_PER_SQ_FT = 929.0304;

/** Area of a work in square feet, given its centimetre dimensions. */
export function squareFeet(dimensions: Dimensions): number {
  const areaSqCm = Math.max(0, dimensions.heightCm) * Math.max(0, dimensions.widthCm);
  return areaSqCm / SQ_CM_PER_SQ_FT;
}

/**
 * Compute the headline (quoted) and net price for one channel from the artist's
 * ask price. The principle: the artist's NET stays constant; the headline price
 * is grossed up so commissions don't erode it. Art-fair and commission are the
 * exceptions where the premium is kept (booth fees / bespoke nature).
 */
export function channelPrice(
  channel: SellingChannel,
  askInr: number,
  galleryCutPct: number,
): ChannelPrice {
  switch (channel) {
    case 'gallery': {
      const cut = clamp(galleryCutPct, 0, 90) / 100;
      const quoted = Math.round(askInr / (1 - cut));
      return { channel, quotedInr: quoted, netInr: askInr };
    }
    case 'varnam': {
      const quoted = Math.round(askInr / (1 - VARNAM_COMMISSION_PCT / 100));
      return { channel, quotedInr: quoted, netInr: askInr };
    }
    case 'art_fair': {
      // Headline premium covers booth fees; the artist still nets the ask.
      const quoted = Math.round(askInr * ART_FAIR_PREMIUM);
      return { channel, quotedInr: quoted, netInr: askInr };
    }
    case 'commission': {
      // Bespoke premium is kept by the artist: net = quoted.
      const quoted = Math.round(askInr * COMMISSION_PREMIUM);
      return { channel, quotedInr: quoted, netInr: quoted };
    }
    case 'direct':
    default:
      // No commission; the artist receives the full ask (minus processing).
      return { channel, quotedInr: askInr, netInr: askInr };
  }
}

/** Inputs to {@link computeArtistPricing} beyond the underlying valuation. */
export interface ArtistPricingParams {
  /** Net mid value from the three-layer valuation (base × artist × work). */
  netMidInr: number;
  dimensions: Dimensions;
  posture: PricingPosture;
  channels: SellingChannel[];
  galleryCutPct: number;
}

/** The numeric portion of an artist pricing result (no underlying valuation). */
export interface ArtistPriceBreakdown {
  askInr: number;
  floorInr: number;
  ceilingInr: number;
  perSqFtInr: number;
  areaSqFt: number;
  channels: ChannelPrice[];
}

/**
 * Apply Layer 5 (posture) to the net mid value to get the ask, then derive the
 * floor, ceiling, per-square-foot rate, and Layer-4 channel prices. Pure math.
 */
export function computeArtistPricing(params: ArtistPricingParams): ArtistPriceBreakdown {
  const { netMidInr, dimensions, posture, channels, galleryCutPct } = params;
  const askInr = Math.round(netMidInr * (PRICING_POSTURE_FACTORS[posture] ?? 1));
  const floorInr = Math.round(askInr * ARTIST_PRICE_SPREAD.floorFactor);
  const ceilingInr = Math.round(askInr * ARTIST_PRICE_SPREAD.ceilingFactor);
  const areaSqFt = squareFeet(dimensions);
  const perSqFtInr = areaSqFt > 0 ? Math.round(askInr / areaSqFt) : 0;
  const seen = new Set<SellingChannel>();
  const channelPrices = channels
    .filter((c) => (seen.has(c) ? false : (seen.add(c), true)))
    .map((c) => channelPrice(c, askInr, galleryCutPct));
  return { askInr, floorInr, ceilingInr, perSqFtInr, areaSqFt, channels: channelPrices };
}

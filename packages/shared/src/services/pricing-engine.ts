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
  ARTIST_TIER_MULTIPLIERS,
  ESTIMATE_SPREAD,
  UNKNOWN_ARTIST_MULTIPLIER,
  WORK_ADJUSTMENT_RANGE,
} from '../constants/pricing';
import { clamp } from '../utils/format';
import type { ArtistTier, ValuationInput, ValuationResult } from '../types';

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

/**
 * Core domain types for the Vaayu valuation flow.
 * These are the contract shared by the web client, the mobile client, and the
 * server-side pricing Edge Function — keep them framework-agnostic.
 */

/** Condition grades a user can assign to an artwork. */
export type ArtworkCondition = 'excellent' | 'good' | 'fair' | 'poor';

/** Recognition tier an artist falls into, driving the Layer 2 multiplier. */
export type ArtistTier = 'emerging' | 'mid-career' | 'established' | 'blue-chip';

/** Physical dimensions of a work, in centimetres. */
export interface Dimensions {
  heightCm: number;
  widthCm: number;
}

/**
 * Everything the user supplies (plus the image) that the pricing engine needs.
 * `imageBase64` is only ever handled server-side; clients send it to the
 * Edge Function and never embed an Anthropic key themselves.
 */
export interface ValuationInput {
  imageBase64: string;
  artistName?: string;
  artistKnown: boolean;
  tradition: string;
  medium: string;
  dimensions: Dimensions;
  yearCreated?: number;
  condition: ArtworkCondition;
  provenanceNotes?: string;
}

/** Per-layer reasoning the AI returns, mirrored into `valuations.ai_reasoning`. */
export interface ValuationReasoning {
  baseValue: { amount: number; rationale: string };
  artistMultiplier: { multiplier: number; rationale: string; tier?: ArtistTier };
  workAdjustment: { multiplier: number; rationale: string };
  comparables?: string[];
}

/** The full result returned by the pricing engine and rendered as a report. */
export interface ValuationResult {
  estimatedLowInr: number;
  estimatedMidInr: number;
  estimatedHighInr: number;
  confidenceScore: number;
  reasoning: ValuationReasoning;
  fullReport: string;
}

/** A persisted valuation row (camelCase view of the `valuations` table). */
export interface Valuation extends ValuationResult {
  id: string;
  userId: string;
  artworkImageUrl: string;
  artistName: string | null;
  artistKnown: boolean;
  tradition: string | null;
  medium: string | null;
  dimensionsHeightCm: number | null;
  dimensionsWidthCm: number | null;
  yearCreated: number | null;
  condition: ArtworkCondition | null;
  provenanceNotes: string | null;
  wasPaid: boolean;
  paymentId: string | null;
  createdAt: string;
}

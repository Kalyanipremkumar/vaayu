/**
 * Core domain types for the Vaayu valuation flow.
 * These are the contract shared by the web client, the mobile client, and the
 * server-side pricing Edge Function — keep them framework-agnostic.
 */

/** Condition grades a user can assign to an artwork. */
export type ArtworkCondition = 'excellent' | 'good' | 'fair' | 'poor';

/** Recognition tier an artist falls into, driving the Layer 2 multiplier. */
export type ArtistTier = 'emerging' | 'mid-career' | 'established' | 'blue-chip';

/** Which value the valuation represents — the same work values differently by purpose. */
export type ValuationPurpose = 'fair_market' | 'insurance' | 'auction';

/** Whether the work is one-of-a-kind or part of an edition. */
export type EditionType = 'unique' | 'limited' | 'open';

/** Physical dimensions of a work, in centimetres. */
export interface Dimensions {
  heightCm: number;
  widthCm: number;
}

/**
 * Deeper, optional evaluation criteria shared by BOTH collector and artist modes.
 * Every field is optional and backward-compatible; when present each sharpens the
 * Layer-2 (recognition) or Layer-3 (work-level) reasoning and the confidence score.
 */
export interface ValuationCriteria {
  /** Where the work / artist has exhibited and with whom (Layer 2). */
  exhibitionHistory?: string;
  /** Press, catalogues, awards, or publications (Layer 2). */
  publications?: string;
  /** Unique, limited edition, or open edition (Layer 3). */
  editionType?: EditionType;
  /** Name of the series this work belongs to, if any (Layer 3). */
  seriesName?: string;
  /** Whether the work is signed by the artist (Layer 3). */
  signed?: boolean;
  /** Whether the work is framed / mounted (Layer 3). */
  framed?: boolean;
  /** Lower bound of comparable prior sales for similar work, in INR (anchor). */
  priorSaleLowInr?: number;
  /** Upper bound of comparable prior sales for similar work, in INR (anchor). */
  priorSaleHighInr?: number;
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
  purpose?: ValuationPurpose;
  /** Deeper optional criteria (both modes); see {@link ValuationCriteria}. */
  criteria?: ValuationCriteria;
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

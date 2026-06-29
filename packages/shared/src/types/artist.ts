/**
 * Domain types for Vaayu **Artist Mode** — forward pricing ("what should I
 * charge?") as opposed to collector-mode valuation ("what is this worth?").
 * The same three-layer methodology produces a net mid value; Artist Mode adds
 * two deterministic layers on top: channel adjustment (Layer 4) and posture
 * (Layer 5). All of the artist-specific math is pure and lives in the engine.
 */

import type { ArtistTier } from './valuation';
import type { ValuationInput, ValuationResult } from './valuation';

/** Which of the two app modes the user is in. */
export type AppMode = 'collector' | 'artist';

/**
 * Self-reported career stage. Drives the Layer-2 multiplier band. Maps onto the
 * collector-mode {@link ArtistTier} (`renowned` → `blue-chip`).
 */
export type CareerStage = 'emerging' | 'mid-career' | 'established' | 'renowned';

/** Sales channels an artist can quote a work in. */
export type SellingChannel = 'gallery' | 'direct' | 'art_fair' | 'varnam' | 'commission';

/** How aggressively the artist wants to price, shaping the ask (Layer 5). */
export type PricingPosture = 'sell_quickly' | 'balanced' | 'hold';

/**
 * The artist's career context. Stored on their profile so it isn't re-entered
 * for every artwork. Grounds Layer 2 in stated career rather than image guesswork.
 */
export interface ArtistProfile {
  careerStage: CareerStage;
  /** Years actively selling (0–30 slider). */
  yearsSelling: number;
  /** Exhibitions in the last 3 years (0–30 slider). */
  exhibitions3yr: number;
  /** Institutional / museum collectors, free text. Empty if none yet. */
  institutionalCollectors?: string;
}

/**
 * Everything Artist Mode needs to price one piece. Extends the collector
 * {@link ValuationInput} (artwork + deeper criteria) with artist-specific fields.
 */
export interface ArtistPricingInput extends ValuationInput {
  profile: ArtistProfile;
  /** Channels the artist plans to sell this work in (at least one). */
  channels: SellingChannel[];
  /** The artist's gallery commission as a percentage (20–60). */
  galleryCutPct: number;
  posture: PricingPosture;
  /** What the artist spent on materials (pigments, paper, frame), INR. */
  materialsCostInr?: number;
  /** Hours worked on this piece. */
  hoursWorked?: number;
  /** Free text of past sale prices for similar work — anchors the recommendation. */
  pastSalePrices?: string;
  /** Awards / press / recognition, free text. */
  recognition?: string;
}

/** A per-channel price: what to quote and what the artist nets. */
export interface ChannelPrice {
  channel: SellingChannel;
  /** Headline price to quote in this channel, INR. */
  quotedInr: number;
  /** What the artist actually receives after this channel's deductions, INR. */
  netInr: number;
}

/**
 * The full artist pricing recommendation. `valuation` carries the underlying
 * Layer 1–3 result (base / artist / work) so the reasoning can be shown.
 */
export interface ArtistPricingResult {
  /** Recommended ask price (net the artist receives), INR. = mid × posture. */
  askInr: number;
  /** Absolute negotiation minimum, INR. = ask × 0.77. */
  floorInr: number;
  /** Aspirational ceiling for negotiation room, INR. = ask × 1.27. */
  ceilingInr: number;
  /** Ask expressed per square foot — the consistency rate. */
  perSqFtInr: number;
  /** Square footage of the work (for display). */
  areaSqFt: number;
  posture: PricingPosture;
  /** Channel-specific quoted/net prices for the channels the artist selected. */
  channels: ChannelPrice[];
  /** The underlying three-layer valuation (base × artist × work). */
  valuation: ValuationResult;
}

/** Re-export for convenience at call sites that map career stage → tier. */
export type { ArtistTier };

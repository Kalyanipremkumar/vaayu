import { describe, expect, it } from 'vitest';
import {
  assembleValuation,
  blendConfidence,
  channelPrice,
  clampArtistMultiplier,
  clampWorkAdjustment,
  combineLayers,
  computeArtistPricing,
  contextCompletenessScore,
  squareFeet,
  type RawLayerOutput,
} from './pricing-engine';
import type { ValuationInput } from '../types';

const baseInput: ValuationInput = {
  imageBase64: 'data:image/jpeg;base64,xxx',
  artistKnown: false,
  tradition: 'mithila',
  medium: 'natural-pigment',
  dimensions: { heightCm: 60, widthCm: 90 },
  condition: 'good',
};

describe('combineLayers', () => {
  it('applies the mid = base × artist × work formula with 0.85 / 1.20 spread', () => {
    const range = combineLayers(10000, 1.0, 1.0);
    expect(range.mid).toBe(10000);
    expect(range.low).toBe(8500);
    expect(range.high).toBe(12000);
  });

  it('compounds multipliers and rounds to whole rupees', () => {
    // low/high are derived from the UNrounded mid to avoid double-rounding drift.
    const midRaw = 12345 * 1.8 * 1.3;
    const range = combineLayers(12345, 1.8, 1.3);
    expect(range.mid).toBe(Math.round(midRaw));
    expect(range.low).toBe(Math.round(midRaw * 0.85));
    expect(range.high).toBe(Math.round(midRaw * 1.2));
  });
});

describe('clampArtistMultiplier', () => {
  it('falls back to the unknown-artist default when no tier is given', () => {
    expect(clampArtistMultiplier(5.0, null)).toBe(0.8);
    expect(clampArtistMultiplier(5.0, undefined)).toBe(0.8);
  });

  it('clamps an over-eager multiplier into the tier band', () => {
    // established band is 1.8–3.5; a model claiming 9x is pulled back to 3.5.
    expect(clampArtistMultiplier(9, 'established')).toBe(3.5);
    expect(clampArtistMultiplier(0.1, 'established')).toBe(1.8);
  });

  it('passes through a multiplier already inside the band', () => {
    expect(clampArtistMultiplier(2.5, 'established')).toBe(2.5);
  });
});

describe('clampWorkAdjustment', () => {
  it('clamps into the 0.7–1.5 band', () => {
    expect(clampWorkAdjustment(2)).toBe(1.5);
    expect(clampWorkAdjustment(0.1)).toBe(0.7);
    expect(clampWorkAdjustment(1.1)).toBe(1.1);
  });
});

describe('contextCompletenessScore', () => {
  it('gives a sparse submission a low score', () => {
    expect(contextCompletenessScore(baseInput)).toBe(50); // baseline 40 + valid dims 10
  });

  it('rewards a fully documented submission', () => {
    const rich: ValuationInput = {
      ...baseInput,
      artistKnown: true,
      artistName: 'Sita Devi',
      yearCreated: 1975,
      provenanceNotes: 'Acquired from the artist; exhibited 1980.',
    };
    expect(contextCompletenessScore(rich)).toBe(100);
  });
});

describe('blendConfidence', () => {
  it('never reports much higher than the weakest signal', () => {
    // Model very confident (95) but context thin (50) -> capped near context.
    expect(blendConfidence(95, 50)).toBeLessThanOrEqual(65);
  });
});

describe('squareFeet', () => {
  it('converts cm dimensions to square feet', () => {
    // 60 × 45 cm = 2700 cm² ≈ 2.906 sq ft
    expect(squareFeet({ heightCm: 60, widthCm: 45 })).toBeCloseTo(2.906, 2);
  });

  it('returns 0 for non-positive dimensions', () => {
    expect(squareFeet({ heightCm: 0, widthCm: 45 })).toBe(0);
  });
});

describe('channelPrice', () => {
  it('grosses up a gallery quote so net equals the ask', () => {
    // 40% commission: quote = ask / 0.6
    expect(channelPrice('gallery', 28500, 40)).toEqual({
      channel: 'gallery',
      quotedInr: Math.round(28500 / 0.6),
      netInr: 28500,
    });
  });

  it('grosses up Varnam by its 10% commission', () => {
    expect(channelPrice('varnam', 28500, 40)).toEqual({
      channel: 'varnam',
      quotedInr: Math.round(28500 / 0.9),
      netInr: 28500,
    });
  });

  it('keeps direct at the ask (net = quoted)', () => {
    expect(channelPrice('direct', 28500, 40)).toEqual({
      channel: 'direct',
      quotedInr: 28500,
      netInr: 28500,
    });
  });

  it('lets the artist keep the commission premium', () => {
    const c = channelPrice('commission', 28500, 40);
    expect(c.quotedInr).toBe(c.netInr);
    expect(c.quotedInr).toBeGreaterThan(28500);
  });
});

describe('computeArtistPricing', () => {
  it('applies posture to the ask and derives floor/ceiling/per-sq-ft', () => {
    const r = computeArtistPricing({
      netMidInr: 28500,
      dimensions: { heightCm: 60, widthCm: 45 },
      posture: 'balanced',
      channels: ['gallery', 'direct'],
      galleryCutPct: 40,
    });
    expect(r.askInr).toBe(28500); // balanced × 1.0
    expect(r.floorInr).toBe(Math.round(28500 * 0.77));
    expect(r.ceilingInr).toBe(Math.round(28500 * 1.27));
    expect(r.perSqFtInr).toBe(Math.round(28500 / squareFeet({ heightCm: 60, widthCm: 45 })));
    expect(r.channels).toHaveLength(2);
  });

  it('discounts the ask under a sell-quickly posture', () => {
    const r = computeArtistPricing({
      netMidInr: 28500,
      dimensions: { heightCm: 60, widthCm: 45 },
      posture: 'sell_quickly',
      channels: ['direct'],
      galleryCutPct: 40,
    });
    expect(r.askInr).toBe(Math.round(28500 * 0.9));
  });

  it('de-duplicates repeated channels', () => {
    const r = computeArtistPricing({
      netMidInr: 10000,
      dimensions: { heightCm: 30, widthCm: 30 },
      posture: 'balanced',
      channels: ['gallery', 'gallery', 'direct'],
      galleryCutPct: 40,
    });
    expect(r.channels.map((c) => c.channel)).toEqual(['gallery', 'direct']);
  });
});

describe('assembleValuation', () => {
  it('produces a guardrailed, fully-formed result', () => {
    const raw: RawLayerOutput = {
      baseValue: { amount: 50000, rationale: 'Mithila ~₹14k/sqft × ~5.8 sqft' },
      artistMultiplier: { multiplier: 9, rationale: 'overclaimed', tier: 'established' },
      workAdjustment: { multiplier: 3, rationale: 'overclaimed' },
      confidenceScore: 95,
      comparables: ['Comparable A'],
      fullReport: 'Report body',
    };
    const result = assembleValuation(raw, baseInput);

    // Multipliers were clamped: 50000 × 3.5 × 1.5
    expect(result.reasoning.artistMultiplier.multiplier).toBe(3.5);
    expect(result.reasoning.workAdjustment.multiplier).toBe(1.5);
    expect(result.estimatedMidInr).toBe(Math.round(50000 * 3.5 * 1.5));
    expect(result.estimatedLowInr).toBe(Math.round(result.estimatedMidInr * 0.85));
    expect(result.confidenceScore).toBeLessThan(95);
    expect(result.reasoning.comparables).toEqual(['Comparable A']);
  });
});

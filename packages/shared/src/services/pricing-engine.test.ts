import { describe, expect, it } from 'vitest';
import {
  assembleValuation,
  blendConfidence,
  clampArtistMultiplier,
  clampWorkAdjustment,
  combineLayers,
  contextCompletenessScore,
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

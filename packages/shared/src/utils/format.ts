/** Presentation helpers shared across web and mobile. */

/**
 * Format an INR integer amount the Indian way (lakh/crore grouping), e.g.
 * 125000 -> "₹1,25,000". Rounds to whole rupees.
 */
export function formatInr(amount: number): string {
  const rounded = Math.round(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rounded);
}

/**
 * Format a price range compactly, e.g. "₹85,000 – ₹1,20,000".
 */
export function formatInrRange(low: number, high: number): string {
  return `${formatInr(low)} – ${formatInr(high)}`;
}

/**
 * Convert centimetre dimensions to area in square feet, used by Layer-1
 * per-sq-ft benchmarks. 1 sq ft = 929.0304 cm².
 */
export function cmDimensionsToSqFt(heightCm: number, widthCm: number): number {
  const areaCm2 = heightCm * widthCm;
  return areaCm2 / 929.0304;
}

/** Clamp a number into [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

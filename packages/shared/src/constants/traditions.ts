/**
 * Art traditions / styles offered in the valuation context form.
 * `baseLowPerSqFtInr` / `baseHighPerSqFtInr` are indicative Layer-1 benchmarks
 * used only as priors and guardrails — the AI may refine within reason, but the
 * server should never let a base value drift wildly outside these for a known
 * tradition. Set to null for non-painting categories priced per piece.
 */
export interface TraditionBenchmark {
  /** Stable key stored in the DB. */
  key: string;
  /** Display label shown in the dropdown. */
  label: string;
  /** Indian folk art vs broader fine-art category. */
  group: 'folk' | 'fine-art';
  baseLowPerSqFtInr: number | null;
  baseHighPerSqFtInr: number | null;
}

export const TRADITIONS: readonly TraditionBenchmark[] = [
  // --- Indian folk traditions (where the methodology was developed) ---
  {
    key: 'mithila',
    label: 'Mithila / Madhubani',
    group: 'folk',
    baseLowPerSqFtInr: 8000,
    baseHighPerSqFtInr: 25000,
  },
  {
    key: 'warli',
    label: 'Warli',
    group: 'folk',
    baseLowPerSqFtInr: 5000,
    baseHighPerSqFtInr: 15000,
  },
  { key: 'gond', label: 'Gond', group: 'folk', baseLowPerSqFtInr: 6000, baseHighPerSqFtInr: 18000 },
  {
    key: 'pattachitra',
    label: 'Pattachitra',
    group: 'folk',
    baseLowPerSqFtInr: 7000,
    baseHighPerSqFtInr: 22000,
  },
  {
    key: 'kalamkari',
    label: 'Kalamkari',
    group: 'folk',
    baseLowPerSqFtInr: 5000,
    baseHighPerSqFtInr: 16000,
  },
  { key: 'phad', label: 'Phad', group: 'folk', baseLowPerSqFtInr: 6000, baseHighPerSqFtInr: 18000 },
  {
    key: 'kalighat',
    label: 'Kalighat',
    group: 'folk',
    baseLowPerSqFtInr: 7000,
    baseHighPerSqFtInr: 20000,
  },
  {
    key: 'tanjore',
    label: 'Tanjore (Thanjavur)',
    group: 'folk',
    baseLowPerSqFtInr: 12000,
    baseHighPerSqFtInr: 40000,
  },
  // --- Broader fine-art categories (expanding over time) ---
  {
    key: 'oil-painting',
    label: 'Oil Painting',
    group: 'fine-art',
    baseLowPerSqFtInr: 4000,
    baseHighPerSqFtInr: 30000,
  },
  {
    key: 'acrylic-painting',
    label: 'Acrylic Painting',
    group: 'fine-art',
    baseLowPerSqFtInr: 3500,
    baseHighPerSqFtInr: 25000,
  },
  {
    key: 'watercolour',
    label: 'Watercolour',
    group: 'fine-art',
    baseLowPerSqFtInr: 3000,
    baseHighPerSqFtInr: 20000,
  },
  {
    key: 'print',
    label: 'Print / Serigraph',
    group: 'fine-art',
    baseLowPerSqFtInr: 2000,
    baseHighPerSqFtInr: 15000,
  },
  {
    key: 'photography',
    label: 'Photography',
    group: 'fine-art',
    baseLowPerSqFtInr: null,
    baseHighPerSqFtInr: null,
  },
  {
    key: 'sculpture',
    label: 'Sculpture',
    group: 'fine-art',
    baseLowPerSqFtInr: null,
    baseHighPerSqFtInr: null,
  },
  {
    key: 'other',
    label: 'Other',
    group: 'fine-art',
    baseLowPerSqFtInr: null,
    baseHighPerSqFtInr: null,
  },
] as const;

/** Mediums offered in the context form. */
export const MEDIUMS: readonly { key: string; label: string }[] = [
  { key: 'natural-pigment', label: 'Natural Pigment' },
  { key: 'oil', label: 'Oil' },
  { key: 'acrylic', label: 'Acrylic' },
  { key: 'watercolour', label: 'Watercolour' },
  { key: 'ink', label: 'Ink' },
  { key: 'gouache', label: 'Gouache' },
  { key: 'mixed-media', label: 'Mixed Media' },
  { key: 'digital-print', label: 'Digital / Giclée Print' },
  { key: 'photographic-print', label: 'Photographic Print' },
  { key: 'bronze', label: 'Bronze' },
  { key: 'stone', label: 'Stone' },
  { key: 'wood', label: 'Wood' },
  { key: 'other', label: 'Other' },
] as const;

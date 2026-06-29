/**
 * System prompt for the Vaayu pricing engine. This is the verbatim prompt that
 * enforces the three-layer methodology. It is consumed ONLY by the server-side
 * Edge Function that calls Claude — never imported into a client bundle for an
 * actual API call (no Anthropic key lives client-side).
 */

export const PRICING_SYSTEM_PROMPT = `You are an expert art appraiser specializing in Indian folk art and global fine art markets. Your job is to provide accurate, defensible valuations using a strict three-layer methodology.

CRITICAL RULES:
- Always output valuations in Indian Rupees (INR)
- Never invent comparables you cannot verify
- If artist is unknown or cannot be verified, state this clearly and use conservative defaults
- Confidence scores should reflect actual data quality: 90+ only when you have strong comparables and verified artist info
- Be conservative — underestimate rather than overestimate

THE THREE-LAYER METHODOLOGY:

Layer 1: Base value from tradition/medium benchmark
- Calculate from known market data for this medium and tradition
- Express as price per square foot for paintings, or per piece for sculpture/photography

Layer 2: Artist multiplier
- Determine recognition tier from any information provided, weighing these parameters
  (the checklist experienced gallerists use):
  1. Education & training
  2. Exhibition history — where, and with whom
  3. Range across styles, subjects, and mediums
  4. Collector base — especially institutions or respected names
  5. Coverage in credible publications
  6. Whether the per-square-foot rate aligns with the above
  7. Whether it is sold through a reputed gallery or curator
- Only credit a parameter when there is actual evidence for it (in the image, the
  artist name, or the provided notes). Absence of evidence is not evidence of standing.
- Tiers: emerging (0.7-1.0x), mid-career (1.0-1.8x), established (1.8-3.5x), blue-chip (3.5-10x+)
- If the artist is unknown or unverifiable, use 0.8x and say so plainly.

Layer 3: Work-level adjustment
- Consider: condition, dimensions, materials, theme rarity, composition, provenance
- Also weigh, when provided: edition type (unique commands more than limited, limited more than
  open), whether the work is signed, whether it belongs to a recognised series, and whether it is
  framed/mounted. Treat unique + signed + a documented series as modest upward signals.
- If prior-sale anchors for comparable work are provided, keep the estimate consistent with them
  unless the layers clearly justify departing — and explain any departure.
- A standout / favourite-quality example earns a modest premium; issues earn a discount
- Range: 0.7x (significant issues) to 1.5x (exceptional)

THE HYPE CHECK (affects confidence, not price):
- A high price must be grounded in quality and the verifiable parameters above, not hype.
- When the inputs do not justify a high figure, keep the estimate conservative AND lower the
  confidence score. Never let unverified hype inflate either the price or the confidence.

OUTPUT FORMAT: Return strict JSON matching the schema. Include reasoning for every layer.`;

/**
 * JSON schema description appended to the user turn so the model returns a shape
 * the server can validate before persisting. Kept alongside the prompt so the
 * two evolve together.
 */
export const PRICING_OUTPUT_CONTRACT = `Return ONLY a JSON object with this exact shape (no markdown, no prose outside the JSON):
{
  "baseValue": { "amount": number, "rationale": string },
  "artistMultiplier": { "multiplier": number, "rationale": string, "tier": "emerging" | "mid-career" | "established" | "blue-chip" | null },
  "workAdjustment": { "multiplier": number, "rationale": string },
  "confidenceScore": number,
  "comparables": string[],
  "fullReport": string
}`;

/**
 * Appended to the system prompt when the request comes from **Artist Mode**.
 * The methodology and output contract are identical (we still return base ×
 * artist × work); only the framing of Layer 2 and the tone change. The
 * deterministic Layer 4 (channel) and Layer 5 (posture) math is applied AFTER
 * this call, in pure code — the model must NOT attempt them.
 */
export const ARTIST_MODE_PROMPT_ADDENDUM = `ARTIST MODE — FORWARD PRICING:
This request is from the artist pricing for their OWN work, not a collector valuing a purchase.
- The artist has SELF-REPORTED their career stage, years selling, exhibitions, and collectors.
  Ground the Layer-2 multiplier in these stated facts, not in guesses from the image. Place the
  work within the stated tier's band using the exhibitions/years/collectors as within-tier signals.
- Do NOT inflate the tier beyond what the artist reports. If the stated career is modest, keep the
  multiplier modest — a defensible price the artist can actually justify matters more than a high one.
- The 'baseValue' is still the per-square-foot tradition rate × area, exactly as in collector mode.
- 'fullReport' should read as warm guidance to the artist ("at your stage…"), not a cold appraisal.
- IMPORTANT: still return ONLY the base × artist × work valuation. Channel-specific prices, floor,
  ceiling, and posture adjustments are computed deterministically by Vaayu AFTER your response —
  do not include them.`;

/** Trim and cap a free-text field for safe inclusion in the prompt context. */
function field(label: string, value: string | number | boolean | undefined | null): string | null {
  if (value === undefined || value === null || value === '') return null;
  const text = typeof value === 'string' ? value.trim() : String(value);
  if (!text) return null;
  return `- ${label}: ${text.slice(0, 500)}`;
}

/**
 * The shape the context builder reads. Intentionally a structural subset of
 * `ValuationInput` + the artist extras, so both modes can pass their input
 * straight in without the shared package importing client types.
 */
export interface PromptContextInput {
  artistKnown?: boolean;
  artistName?: string;
  tradition?: string;
  medium?: string;
  dimensions?: { heightCm: number; widthCm: number };
  yearCreated?: number;
  condition?: string;
  provenanceNotes?: string;
  purposeInstruction?: string;
  criteria?: {
    exhibitionHistory?: string;
    publications?: string;
    editionType?: string;
    seriesName?: string;
    signed?: boolean;
    framed?: boolean;
    priorSaleLowInr?: number;
    priorSaleHighInr?: number;
  };
  /** Present only for Artist Mode. */
  artist?: {
    careerStage?: string;
    yearsSelling?: number;
    exhibitions3yr?: number;
    institutionalCollectors?: string;
    materialsCostInr?: number;
    hoursWorked?: number;
    pastSalePrices?: string;
    recognition?: string;
  };
}

/**
 * Build the textual context block describing the artwork (and, for Artist Mode,
 * the artist) that is appended to the user turn alongside the image. Centralised
 * here so collector and artist requests share one consistent, deeper criteria set.
 */
export function buildPromptContext(input: PromptContextInput): string {
  const c = input.criteria ?? {};
  const a = input.artist;
  const lines: (string | null)[] = [
    field('Tradition / style', input.tradition),
    field('Medium', input.medium),
    input.dimensions
      ? field('Dimensions (cm)', `${input.dimensions.heightCm} × ${input.dimensions.widthCm}`)
      : null,
    field('Condition', input.condition),
    field('Year created', input.yearCreated),
    input.artistKnown
      ? field('Artist', input.artistName)
      : '- Artist: unknown / unverified (use conservative defaults)',
    field('Provenance notes', input.provenanceNotes),
    field('Exhibition history', c.exhibitionHistory),
    field('Publications / press / awards', c.publications),
    field('Edition', c.editionType),
    field('Series', c.seriesName),
    c.signed !== undefined ? field('Signed', c.signed ? 'yes' : 'no') : null,
    c.framed !== undefined ? field('Framed / mounted', c.framed ? 'yes' : 'no') : null,
    c.priorSaleLowInr || c.priorSaleHighInr
      ? field(
          'Prior sales of comparable work (INR)',
          `${c.priorSaleLowInr ?? '?'} to ${c.priorSaleHighInr ?? '?'}`,
        )
      : null,
  ];

  if (a) {
    lines.push(
      '',
      'ARTIST (self-reported):',
      field('Career stage', a.careerStage),
      field('Years actively selling', a.yearsSelling),
      field('Exhibitions in last 3 years', a.exhibitions3yr),
      field('Institutional / museum collectors', a.institutionalCollectors),
      field('Materials cost (INR)', a.materialsCostInr),
      field('Hours worked', a.hoursWorked),
      field('Past sale prices (similar work)', a.pastSalePrices),
      field('Awards / press / recognition', a.recognition),
    );
  }

  if (input.purposeInstruction) lines.push('', input.purposeInstruction);

  return lines.filter((l) => l !== null).join('\n');
}

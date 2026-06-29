// Vaayu - generate-valuation Edge Function (Deno).
// Server-side AI valuation so the Anthropic key never reaches a client.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import {
  FREE_VALUATION_LIMIT,
  PRICING_SYSTEM_PROMPT,
  PRICING_OUTPUT_CONTRACT,
  ARTIST_MODE_PROMPT_ADDENDUM,
  buildPromptContext,
  assembleValuation,
  sanitizeFreeText,
} from './_shared.ts';

const MODEL = Deno.env.get('VAAYU_CLAUDE_MODEL') ?? 'claude-sonnet-4-6';
const RATE_LIMIT_PER_MINUTE = 10;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

// Purpose-specific guidance appended to the prompt. Mirrors VALUATION_PURPOSES
// in @vaayu/shared (kept inline here to avoid re-bundling for one feature).
const PURPOSE_INSTRUCTIONS: Record<string, string> = {
  fair_market:
    'VALUATION PURPOSE - Fair Market Value: the price a willing buyer and willing seller would agree on, neither under compulsion. This is the default, balanced retail-resale value.',
  insurance:
    'VALUATION PURPOSE - Insurance / Replacement Value: the retail cost to replace this work with a comparable one. This is typically HIGHER than fair market value (full retail, not resale). Lean to the upper end of defensible.',
  auction:
    'VALUATION PURPOSE - Auction Estimate: the realistic hammer-price range expected at auction, before buyer premium. This typically sits at or below fair-market retail; present a sensible low-high auction range.',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function parseImage(imageBase64: string): { mediaType: string; data: string } {
  const match = /^data:(image\/[a-zA-Z+]+);base64,(.*)$/s.exec(imageBase64);
  if (match) return { mediaType: match[1], data: match[2] };
  return { mediaType: 'image/jpeg', data: imageBase64 };
}

function extractJson(text: string): unknown {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in model output');
  return JSON.parse(candidate.slice(start, end + 1));
}

/** Verify a Razorpay payment signature = HMAC-SHA256(order|payment, keySecret). */
async function verifyRazorpay(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${orderId}|${paymentId}`),
  );
  const hex = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hex === signature;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!supabaseUrl || !serviceKey || !anonKey || !anthropicKey) {
    return json({ error: 'Server is not configured. Missing required secrets.' }, 500);
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) return json({ error: 'Unauthorized' }, 401);

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const mode = payload.mode === 'artist' ? 'artist' : 'collector';
  const imageBase64 = typeof payload.imageBase64 === 'string' ? payload.imageBase64 : '';
  const artworkImageUrl =
    typeof payload.artworkImageUrl === 'string' ? payload.artworkImageUrl : '';
  const tradition = typeof payload.tradition === 'string' ? payload.tradition : '';
  const medium = typeof payload.medium === 'string' ? payload.medium : '';
  const rzpOrderId = typeof payload.razorpayOrderId === 'string' ? payload.razorpayOrderId : null;
  const rzpPaymentId =
    typeof payload.razorpayPaymentId === 'string' ? payload.razorpayPaymentId : null;
  const rzpSignature =
    typeof payload.razorpaySignature === 'string' ? payload.razorpaySignature : null;
  const purpose =
    payload.purpose === 'insurance' || payload.purpose === 'auction'
      ? payload.purpose
      : 'fair_market';

  if (!imageBase64) return json({ error: 'imageBase64 is required' }, 400);
  // artworkImageUrl is only persisted in collector mode; artist mode isn't saved (Phase 1).
  if (mode === 'collector' && !artworkImageUrl) {
    return json({ error: 'artworkImageUrl is required' }, 400);
  }
  if (!tradition || !medium) return json({ error: 'tradition and medium are required' }, 400);

  const { mediaType, data: imageData } = parseImage(imageBase64);
  if (!ALLOWED_MIME.has(mediaType)) {
    return json({ error: 'Image must be JPEG, PNG, or WebP' }, 400);
  }

  const dims = (payload.dimensions ?? {}) as { heightCm?: number; widthCm?: number };

  // Deeper, optional evaluation criteria (both modes).
  const rawCriteria = (payload.criteria ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? sanitizeFreeText(v) : undefined);
  const num = (v: unknown) => (v === undefined || v === null || v === '' ? undefined : Number(v));
  const editionType =
    rawCriteria.editionType === 'unique' ||
    rawCriteria.editionType === 'limited' ||
    rawCriteria.editionType === 'open'
      ? rawCriteria.editionType
      : undefined;
  const criteria = {
    exhibitionHistory: str(rawCriteria.exhibitionHistory),
    publications: str(rawCriteria.publications),
    editionType,
    seriesName: str(rawCriteria.seriesName),
    signed: typeof rawCriteria.signed === 'boolean' ? rawCriteria.signed : undefined,
    framed: typeof rawCriteria.framed === 'boolean' ? rawCriteria.framed : undefined,
    priorSaleLowInr: num(rawCriteria.priorSaleLowInr),
    priorSaleHighInr: num(rawCriteria.priorSaleHighInr),
  };

  const input = {
    imageBase64,
    artistName: typeof payload.artistName === 'string' ? payload.artistName : undefined,
    artistKnown: payload.artistKnown === true,
    tradition,
    medium,
    dimensions: { heightCm: Number(dims.heightCm) || 0, widthCm: Number(dims.widthCm) || 0 },
    yearCreated: payload.yearCreated ? Number(payload.yearCreated) : undefined,
    condition: (payload.condition ?? 'good') as 'excellent' | 'good' | 'fair' | 'poor',
    provenanceNotes:
      typeof payload.provenanceNotes === 'string'
        ? sanitizeFreeText(payload.provenanceNotes)
        : undefined,
    criteria,
  };

  // Artist Mode: the artist's self-reported career context (drives Layer 2).
  const rawArtist = (payload.artist ?? {}) as Record<string, unknown>;
  const artist =
    mode === 'artist'
      ? {
          careerStage: str(rawArtist.careerStage),
          yearsSelling: num(rawArtist.yearsSelling),
          exhibitions3yr: num(rawArtist.exhibitions3yr),
          institutionalCollectors: str(rawArtist.institutionalCollectors),
          materialsCostInr: num(rawArtist.materialsCostInr),
          hoursWorked: num(rawArtist.hoursWorked),
          pastSalePrices: str(rawArtist.pastSalePrices),
          recognition: str(rawArtist.recognition),
        }
      : undefined;

  const sinceIso = new Date(Date.now() - 60_000).toISOString();
  const { count: recentCount } = await admin
    .from('valuations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', sinceIso);
  if ((recentCount ?? 0) >= RATE_LIMIT_PER_MINUTE) {
    return json({ error: 'Too many valuations. Please wait a minute and try again.' }, 429);
  }

  let freeUsed = 0;
  let isPaid = false;
  let verifiedPaymentId: string | null = null;

  // Payment / free-quota gate applies to collector mode only. Artist Mode is
  // free and unmetered in Phase 1 (no payment, not persisted).
  if (mode === 'collector') {
    const { data: profile, error: profileError } = await admin
      .from('user_profiles')
      .select('free_valuations_used')
      .eq('id', user.id)
      .maybeSingle();
    if (profileError) return json({ error: 'Could not load your profile.' }, 500);

    freeUsed = profile?.free_valuations_used ?? 0;
    if (freeUsed >= FREE_VALUATION_LIMIT) {
      // Free quota exhausted — require a verified Razorpay payment.
      const rzpSecret = Deno.env.get('RAZORPAY_KEY_SECRET');
      if (!rzpSecret) {
        return json(
          { error: 'Payments are not configured yet.', code: 'payments_unconfigured' },
          503,
        );
      }
      if (!rzpOrderId || !rzpPaymentId || !rzpSignature) {
        return json(
          { error: 'Free valuations exhausted. Payment required.', code: 'payment_required' },
          402,
        );
      }
      const ok = await verifyRazorpay(rzpOrderId, rzpPaymentId, rzpSignature, rzpSecret);
      if (!ok) {
        return json({ error: 'Payment could not be verified.', code: 'payment_invalid' }, 402);
      }
      isPaid = true;
      verifiedPaymentId = rzpPaymentId;
    }
  }

  const purposeInstruction = PURPOSE_INSTRUCTIONS[purpose] ?? PURPOSE_INSTRUCTIONS.fair_market;
  const contextLines = buildPromptContext({
    artistKnown: input.artistKnown,
    artistName: input.artistName,
    tradition: input.tradition,
    medium: input.medium,
    dimensions: input.dimensions,
    yearCreated: input.yearCreated,
    condition: input.condition,
    provenanceNotes: input.provenanceNotes,
    purposeInstruction: mode === 'collector' ? purposeInstruction : undefined,
    criteria,
    artist,
  });

  const systemPrompt =
    mode === 'artist'
      ? `${PRICING_SYSTEM_PROMPT}\n\n${ARTIST_MODE_PROMPT_ADDENDUM}`
      : PRICING_SYSTEM_PROMPT;
  const task =
    mode === 'artist'
      ? 'Price this artwork for the artist using the three-layer methodology (return base × artist × work only).'
      : 'Appraise this artwork using the three-layer methodology.';

  const anthropic = new Anthropic({ apiKey: anthropicKey });

  let rawText: string;
  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 8000,
      thinking: { type: 'adaptive' },
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageData } },
            {
              type: 'text',
              text: `${task}\n\nArtwork context:\n${contextLines}\n\n${PRICING_OUTPUT_CONTRACT}`,
            },
          ],
        },
      ],
    });
    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') throw new Error('No text block in model response');
    rawText = textBlock.text;
  } catch (err) {
    console.error('Claude call failed:', err);
    return json(
      { error: 'The valuation engine is temporarily unavailable. Please try again.' },
      502,
    );
  }

  let result;
  try {
    const raw = extractJson(rawText) as Parameters<typeof assembleValuation>[0];
    result = assembleValuation(raw, input);
  } catch (err) {
    console.error('Could not parse/assemble valuation:', err, rawText.slice(0, 500));
    return json({ error: 'The valuation could not be generated. Please try again.' }, 502);
  }

  // Artist Mode (Phase 1): return the three-layer valuation without persisting.
  // The client applies the deterministic channel/posture math and renders. No
  // free-quota increment, no payment, no valuations row.
  if (mode === 'artist') {
    return json({ ...result });
  }

  const { data: inserted, error: insertError } = await admin
    .from('valuations')
    .insert({
      user_id: user.id,
      artwork_image_url: artworkImageUrl,
      artist_name: input.artistKnown ? (input.artistName ?? null) : null,
      artist_known: input.artistKnown,
      tradition: input.tradition,
      medium: input.medium,
      dimensions_height_cm: input.dimensions.heightCm || null,
      dimensions_width_cm: input.dimensions.widthCm || null,
      year_created: input.yearCreated ?? null,
      condition: input.condition,
      provenance_notes: input.provenanceNotes ?? null,
      purpose,
      estimated_low_inr: result.estimatedLowInr,
      estimated_mid_inr: result.estimatedMidInr,
      estimated_high_inr: result.estimatedHighInr,
      confidence_score: result.confidenceScore,
      ai_reasoning: result.reasoning,
      full_report: result.fullReport,
      was_paid: isPaid,
      payment_id: verifiedPaymentId,
    })
    .select('id')
    .single();
  if (insertError || !inserted) {
    console.error('Insert failed:', insertError);
    return json({ error: 'Could not save the valuation.' }, 500);
  }

  if (!isPaid) {
    await admin
      .from('user_profiles')
      .update({ free_valuations_used: freeUsed + 1 })
      .eq('id', user.id);
  }

  return json({ id: inserted.id, ...result });
});

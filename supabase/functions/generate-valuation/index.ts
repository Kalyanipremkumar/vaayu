// Vaayu — generate-valuation Edge Function (Deno).
//
// Runs the AI valuation SERVER-SIDE so the Anthropic key never reaches a client.
// Flow: verify the caller's JWT → gate on free-quota/payment → rate-limit →
// sanitise input → call Claude (vision) with the three-layer prompt → apply the
// pure methodology guardrails → persist with the service-role key → return.
//
// The pricing methodology (prompt + pure math) is the SINGLE SOURCE in
// packages/shared; `_shared.ts` is its esbuild bundle (pnpm build:edge-shared).

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import {
  FREE_VALUATION_LIMIT,
  PRICING_SYSTEM_PROMPT,
  PRICING_OUTPUT_CONTRACT,
  assembleValuation,
  sanitizeFreeText,
} from './_shared.ts';

// User's spec named "Claude Sonnet 4" → current Sonnet 4 family id. Override via
// the VAAYU_CLAUDE_MODEL secret (e.g. claude-opus-4-8 for higher-quality runs).
const MODEL = Deno.env.get('VAAYU_CLAUDE_MODEL') ?? 'claude-sonnet-4-6';
const RATE_LIMIT_PER_MINUTE = 10;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

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

/** Split an optional data-URI prefix off a base64 image and detect its mime. */
function parseImage(imageBase64: string): { mediaType: string; data: string } {
  const match = /^data:(image\/[a-zA-Z+]+);base64,(.*)$/s.exec(imageBase64);
  if (match) return { mediaType: match[1], data: match[2] };
  return { mediaType: 'image/jpeg', data: imageBase64 };
}

/** Tolerantly extract a JSON object from the model's text (strips code fences). */
function extractJson(text: string): unknown {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in model output');
  return JSON.parse(candidate.slice(start, end + 1));
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

  // --- Authenticate the caller -------------------------------------------------
  const authHeader = req.headers.get('Authorization') ?? '';
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) return json({ error: 'Unauthorized' }, 401);

  // Service-role client for privileged reads/writes (bypasses RLS).
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // --- Parse + validate the request --------------------------------------------
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const imageBase64 = typeof payload.imageBase64 === 'string' ? payload.imageBase64 : '';
  const artworkImageUrl =
    typeof payload.artworkImageUrl === 'string' ? payload.artworkImageUrl : '';
  const tradition = typeof payload.tradition === 'string' ? payload.tradition : '';
  const medium = typeof payload.medium === 'string' ? payload.medium : '';
  const paymentId = typeof payload.paymentId === 'string' ? payload.paymentId : null;

  if (!imageBase64) return json({ error: 'imageBase64 is required' }, 400);
  if (!artworkImageUrl) return json({ error: 'artworkImageUrl is required' }, 400);
  if (!tradition || !medium) return json({ error: 'tradition and medium are required' }, 400);

  const { mediaType, data: imageData } = parseImage(imageBase64);
  if (!ALLOWED_MIME.has(mediaType)) {
    return json({ error: 'Image must be JPEG, PNG, or WebP' }, 400);
  }

  const dims = (payload.dimensions ?? {}) as { heightCm?: number; widthCm?: number };
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
  };

  // --- Rate limit (per user, last 60s) -----------------------------------------
  const sinceIso = new Date(Date.now() - 60_000).toISOString();
  const { count: recentCount } = await admin
    .from('valuations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', sinceIso);
  if ((recentCount ?? 0) >= RATE_LIMIT_PER_MINUTE) {
    return json({ error: 'Too many valuations. Please wait a minute and try again.' }, 429);
  }

  // --- Quota / payment gate ----------------------------------------------------
  const { data: profile, error: profileError } = await admin
    .from('user_profiles')
    .select('free_valuations_used')
    .eq('id', user.id)
    .maybeSingle();
  if (profileError) return json({ error: 'Could not load your profile.' }, 500);

  const freeUsed = profile?.free_valuations_used ?? 0;
  const hasFreeRemaining = freeUsed < FREE_VALUATION_LIMIT;
  const isPaid = Boolean(paymentId);
  if (!hasFreeRemaining && !isPaid) {
    return json(
      { error: 'Free valuations exhausted. Payment required.', code: 'payment_required' },
      402,
    );
  }

  // --- Build the model request -------------------------------------------------
  const contextLines = [
    `Tradition / style: ${input.tradition}`,
    `Medium: ${input.medium}`,
    `Dimensions: ${input.dimensions.heightCm} cm (H) x ${input.dimensions.widthCm} cm (W)`,
    `Condition: ${input.condition}`,
    input.artistKnown && input.artistName
      ? `Artist (user-provided): ${input.artistName}`
      : 'Artist: unknown / unverified',
    input.yearCreated ? `Year created: ${input.yearCreated}` : 'Year created: not provided',
    input.provenanceNotes
      ? `Provenance notes: ${input.provenanceNotes}`
      : 'Provenance: none provided',
  ].join('\n');

  const anthropic = new Anthropic({ apiKey: anthropicKey });

  let rawText: string;
  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 8000,
      thinking: { type: 'adaptive' },
      system: PRICING_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: imageData },
            },
            {
              type: 'text',
              text: `Appraise this artwork using the three-layer methodology.\n\nArtwork context:\n${contextLines}\n\n${PRICING_OUTPUT_CONTRACT}`,
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

  // --- Apply methodology guardrails (pure, shared) ------------------------------
  let result;
  try {
    const raw = extractJson(rawText) as Parameters<typeof assembleValuation>[0];
    result = assembleValuation(raw, input);
  } catch (err) {
    console.error('Could not parse/assemble valuation:', err, rawText.slice(0, 500));
    return json({ error: 'The valuation could not be generated. Please try again.' }, 502);
  }

  // --- Persist + decrement quota (service role) --------------------------------
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
      estimated_low_inr: result.estimatedLowInr,
      estimated_mid_inr: result.estimatedMidInr,
      estimated_high_inr: result.estimatedHighInr,
      confidence_score: result.confidenceScore,
      ai_reasoning: result.reasoning,
      full_report: result.fullReport,
      was_paid: isPaid,
      payment_id: paymentId,
    })
    .select('id')
    .single();
  if (insertError || !inserted) {
    console.error('Insert failed:', insertError);
    return json({ error: 'Could not save the valuation.' }, 500);
  }

  // Only consume a free credit when the user wasn't paying for this one.
  if (!isPaid) {
    await admin
      .from('user_profiles')
      .update({ free_valuations_used: freeUsed + 1 })
      .eq('id', user.id);
  }

  return json({ id: inserted.id, ...result });
});

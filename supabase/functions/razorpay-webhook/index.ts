// Vaayu - razorpay-webhook Edge Function (Deno).
// Receives Razorpay webhooks, verifies the signature over the raw body, and
// records captured payments in the ledger (idempotent by payment id). This is
// reconciliation/audit; the valuation itself is gated by inline verification.
//
// Deploy with verify_jwt = false (Razorpay sends no Supabase JWT).

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from '@supabase/supabase-js';

/** HMAC-SHA256(rawBody, secret) as lowercase hex. */
async function hmacHex(body: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
  if (!supabaseUrl || !serviceKey || !webhookSecret) {
    return new Response('Not configured', { status: 503 });
  }

  const raw = await req.text();
  const signature = req.headers.get('x-razorpay-signature') ?? '';
  const expected = await hmacHex(raw, webhookSecret);
  if (signature !== expected) {
    return new Response('Invalid signature', { status: 400 });
  }

  let event: { event?: string; payload?: { payment?: { entity?: Record<string, unknown> } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }

  if (event.event === 'payment.captured' || event.event === 'payment.authorized') {
    const p = event.payload?.payment?.entity ?? {};
    const notes = (p.notes ?? {}) as Record<string, unknown>;
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { error } = await admin.from('payments').upsert(
      {
        user_id: typeof notes.user_id === 'string' ? notes.user_id : null,
        provider: 'razorpay',
        provider_order_id: typeof p.order_id === 'string' ? p.order_id : null,
        provider_payment_id: typeof p.id === 'string' ? p.id : null,
        amount: typeof p.amount === 'number' ? p.amount : null,
        currency: typeof p.currency === 'string' ? p.currency : null,
        status: 'captured',
      },
      { onConflict: 'provider_payment_id' },
    );
    if (error) {
      console.error('Ledger upsert failed:', error);
      // Still 200 so Razorpay does not retry forever on a transient DB issue.
    }
  }

  // Acknowledge all (verified) events.
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

// Vaayu - create-payment-order Edge Function (Deno).
// Creates a Razorpay order for a single paid valuation (INR). The secret key
// never reaches the client; the browser only gets the order id + public key id.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from '@supabase/supabase-js';

// ₹99 per valuation, in paise.
const VALUATION_AMOUNT_PAISE = 9900;
const CURRENCY = 'INR';

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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const keyId = Deno.env.get('RAZORPAY_KEY_ID');
  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
  if (!supabaseUrl || !anonKey) return json({ error: 'Server is not configured.' }, 500);
  if (!keyId || !keySecret) {
    return json({ error: 'Payments are not configured yet.', code: 'payments_unconfigured' }, 503);
  }

  // Authenticate the caller.
  const authHeader = req.headers.get('Authorization') ?? '';
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) return json({ error: 'Unauthorized' }, 401);

  // Create the Razorpay order.
  const auth = btoa(`${keyId}:${keySecret}`);
  let order: { id?: string; amount?: number; currency?: string };
  try {
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: VALUATION_AMOUNT_PAISE,
        currency: CURRENCY,
        receipt: `val_${user.id.slice(0, 8)}_${Date.now()}`,
        notes: { user_id: user.id, kind: 'single_valuation' },
      }),
    });
    if (!res.ok) {
      console.error('Razorpay order failed:', res.status, await res.text());
      return json({ error: 'Could not start checkout. Please try again.' }, 502);
    }
    order = await res.json();
  } catch (err) {
    console.error('Razorpay order error:', err);
    return json({ error: 'Could not start checkout. Please try again.' }, 502);
  }

  return json({
    orderId: order.id,
    amount: order.amount ?? VALUATION_AMOUNT_PAISE,
    currency: order.currency ?? CURRENCY,
    keyId,
  });
});

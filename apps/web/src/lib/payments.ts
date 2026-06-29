/**
 * Razorpay pay-per-valuation. Creates an order via the server, opens Razorpay
 * Checkout, and returns the payment fields the server then verifies. The key
 * secret never touches the client.
 */
import { supabase } from './supabase';

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

export interface RazorpayPayment {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

interface OrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Minimal shape of the global Razorpay constructor injected by checkout.js.
interface RazorpayCtor {
  new (options: Record<string, unknown>): { open: () => void };
}
declare global {
  interface Window {
    Razorpay?: RazorpayCtor;
  }
}

/** Inject the Razorpay Checkout script once. */
function loadCheckout(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const existing = document.querySelector(`script[src="${CHECKOUT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Could not load checkout.')));
      return;
    }
    const script = document.createElement('script');
    script.src = CHECKOUT_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load the payment checkout.'));
    document.body.appendChild(script);
  });
}

/**
 * Run the full pay flow for a single valuation. Resolves with the payment
 * fields on success, or rejects if checkout fails or the user dismisses it.
 */
export async function payForValuation(userEmail?: string): Promise<RazorpayPayment> {
  const { data, error } = await supabase.functions.invoke<OrderResponse>('create-payment-order', {
    body: {},
  });
  if (error || !data?.orderId) {
    throw new Error('Could not start checkout. Please try again.');
  }

  await loadCheckout();
  if (!window.Razorpay) throw new Error('Payment checkout is unavailable.');

  return new Promise<RazorpayPayment>((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: data.keyId,
      order_id: data.orderId,
      amount: data.amount,
      currency: data.currency,
      name: 'Vaayu',
      description: 'AI artwork valuation',
      prefill: userEmail ? { email: userEmail } : undefined,
      theme: { color: '#0E3A38' },
      handler: (response: RazorpayHandlerResponse) => {
        resolve({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled.')),
      },
    });
    rzp.open();
  });
}

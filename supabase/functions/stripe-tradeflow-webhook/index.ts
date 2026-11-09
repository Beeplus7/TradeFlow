import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@17.7.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

type PlanId = 'starter' | 'pro' | 'elite' | 'hybrid';

serve(async (req) => {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!stripeKey || !supabaseUrl || !serviceKey) {
    return new Response('missing secrets', { status: 500 });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-02-24.acacia',
    httpClient: Stripe.createFetchHttpClient(),
  });

  const raw = await req.text();
  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      const sig = req.headers.get('stripe-signature');
      if (!sig) return new Response('missing signature', { status: 400 });
      event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
    } else {
      // Local / first-wire fallback — verify signature in production
      event = JSON.parse(raw) as Stripe.Event;
    }
  } catch (e) {
    return new Response(`webhook error: ${String(e)}`, { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceKey);

  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'customer.subscription.updated'
  ) {
    const obj = event.data.object as Stripe.Checkout.Session | Stripe.Subscription;
    const meta = (obj as { metadata?: Record<string, string> }).metadata ?? {};
    let userId = meta.user_id;
    let plan = meta.plan as PlanId | undefined;

    if ('client_reference_id' in obj && obj.client_reference_id) {
      userId = userId || obj.client_reference_id;
    }

    if (
      event.type === 'checkout.session.completed' &&
      (obj as Stripe.Checkout.Session).mode === 'subscription' &&
      (obj as Stripe.Checkout.Session).subscription
    ) {
      const subId = (obj as Stripe.Checkout.Session).subscription as string;
      const sub = await stripe.subscriptions.retrieve(subId);
      userId = userId || sub.metadata?.user_id;
      plan = plan || (sub.metadata?.plan as PlanId);
    }

    if (userId && plan) {
      await admin.from('billing_prefs').upsert(
        {
          user_id: userId,
          plan,
          status: 'active',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );
      await admin.from('timeline').insert({
        user_id: userId,
        event_key: 'billing.stripe.active',
        payload: { plan, event: event.type },
      });
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    const userId = sub.metadata?.user_id;
    if (userId) {
      await admin
        .from('billing_prefs')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

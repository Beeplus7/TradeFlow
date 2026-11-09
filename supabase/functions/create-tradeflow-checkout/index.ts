import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@17.7.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

type PlanId = 'starter' | 'pro' | 'elite' | 'hybrid';

const PLAN_ENV: Record<PlanId, string> = {
  starter: 'STRIPE_PRICE_STARTER',
  pro: 'STRIPE_PRICE_PRO',
  elite: 'STRIPE_PRICE_ELITE',
  hybrid: 'STRIPE_PRICE_HYBRID',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anon = Deno.env.get('SUPABASE_ANON_KEY');
    if (!stripeKey || !supabaseUrl || !anon) {
      return json({ ok: false, error: 'Server secrets missing' }, 500);
    }

    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;
    if (!token) return json({ ok: false, error: 'missing session' }, 401);

    const supabase = createClient(supabaseUrl, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return json({ ok: false, error: 'invalid session' }, 401);
    }

    const body = await req.json();
    const plan = body.plan as PlanId;
    if (!PLAN_ENV[plan]) {
      return json({ ok: false, error: 'invalid plan' }, 400);
    }

    const priceId = Deno.env.get(PLAN_ENV[plan]);
    if (!priceId) {
      return json({ ok: false, error: `price not configured for ${plan}` }, 500);
    }

    const appUrl =
      Deno.env.get('APP_URL') ??
      Deno.env.get('EXPO_PUBLIC_APP_URL') ??
      'http://localhost:8081';

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-02-24.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      allow_promotion_codes: true,
      client_reference_id: user.id,
      success_url: `${appUrl}/app/settings?checkout=success&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/app/settings?checkout=cancelled&plan=${plan}`,
      metadata: {
        product: 'tradeflow',
        plan,
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          product: 'tradeflow',
          plan,
          user_id: user.id,
        },
      },
    });

    return json({
      ok: true,
      url: session.url,
      session_id: session.id,
      plan,
    });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 400);
  }
});

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

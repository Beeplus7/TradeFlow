import { Linking, Platform } from 'react-native';
import { assertSupabase } from '../supabase';
import { pushTimeline } from './timeline';

export type PlanId = 'starter' | 'pro' | 'elite' | 'hybrid';

export type BillingPrefs = {
  user_id: string;
  plan: PlanId;
  status: 'paper' | 'active' | 'past_due';
  updated_at: string;
};

export const PLANS: {
  id: PlanId;
  label: string;
  price: string;
  blurb: string;
  stripe: boolean;
}[] = [
  {
    id: 'starter',
    label: 'Starter',
    price: '£49',
    blurb: 'Journey + Simulator',
    stripe: true,
  },
  {
    id: 'pro',
    label: 'Pro',
    price: '£99',
    blurb: 'Full OS · Guardian',
    stripe: true,
  },
  {
    id: 'elite',
    label: 'Elite',
    price: '£299',
    blurb: 'Priority tribe',
    stripe: true,
  },
  {
    id: 'hybrid',
    label: 'Hybrid',
    price: '£49+10%',
    blurb: 'Base + gains share · cap £299',
    stripe: true,
  },
];

export async function ensureBilling(userId: string): Promise<BillingPrefs> {
  const supabase = assertSupabase();
  const existing = await supabase
    .from('billing_prefs')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data as BillingPrefs;

  const { data, error } = await supabase
    .from('billing_prefs')
    .insert({ user_id: userId, plan: 'starter', status: 'paper' })
    .select('*')
    .single();
  if (error) throw error;
  return data as BillingPrefs;
}

/** Local preference only — no charge. */
export async function selectPlanPaper(
  userId: string,
  plan: PlanId,
): Promise<BillingPrefs> {
  const supabase = assertSupabase();
  const { data, error } = await supabase
    .from('billing_prefs')
    .upsert(
      {
        user_id: userId,
        plan,
        status: 'paper',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single();
  if (error) throw error;
  await pushTimeline(userId, 'billing.plan.paper', { plan });
  return data as BillingPrefs;
}

/** @deprecated use selectPlanPaper or startStripeCheckout */
export async function selectPlan(
  userId: string,
  plan: PlanId,
): Promise<BillingPrefs> {
  return selectPlanPaper(userId, plan);
}

/**
 * Creates a Stripe Checkout session (test mode) via Supabase Edge Function
 * and opens the hosted URL. Secret key never touches the client.
 */
export async function startStripeCheckout(plan: PlanId): Promise<{
  url: string;
  sessionId: string;
}> {
  const supabase = assertSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Sign in required for Stripe checkout.');
  }

  const { data, error } = await supabase.functions.invoke(
    'create-tradeflow-checkout',
    {
      body: { plan },
    },
  );

  if (error) {
    throw new Error(error.message || 'Checkout failed');
  }
  const payload = data as {
    ok?: boolean;
    url?: string;
    session_id?: string;
    error?: string;
  };
  if (!payload?.ok || !payload.url) {
    throw new Error(payload?.error || 'No checkout URL returned');
  }

  await pushTimeline(session.user.id, 'billing.checkout.started', {
    plan,
    session_id: payload.session_id,
  });

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.location.href = payload.url;
  } else {
    const supported = await Linking.canOpenURL(payload.url);
    if (!supported) throw new Error('Cannot open Stripe Checkout URL');
    await Linking.openURL(payload.url);
  }

  return { url: payload.url, sessionId: payload.session_id ?? '' };
}

/** After return from Checkout success URL — optimistic active mark. */
export async function markCheckoutReturn(
  userId: string,
  plan: PlanId,
): Promise<BillingPrefs> {
  const supabase = assertSupabase();
  const { data, error } = await supabase
    .from('billing_prefs')
    .upsert(
      {
        user_id: userId,
        plan,
        status: 'active',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single();
  if (error) throw error;
  await pushTimeline(userId, 'billing.checkout.return', { plan });
  return data as BillingPrefs;
}

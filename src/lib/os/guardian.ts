import { assertSupabase } from '../supabase';
import type { Profile } from '../../types/db';
import { ensureFinanceDish } from './finance';
import { fetchProfile } from './profile';

export type GuardianStatus = 'protected' | 'triggered';

export type GuardianState = {
  user_id: string;
  status: GuardianStatus;
  risk_pct: 8 | 15 | 25;
  peak_equity_gbp: number;
  equity_gbp: number;
  drawdown_pct: number;
  vault_gbp: number;
  locked_at: string | null;
  updated_at: string;
};

export async function ensureGuardianState(
  userId: string,
): Promise<GuardianState> {
  const supabase = assertSupabase();
  const existing = await supabase
    .from('guardian_states')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data as GuardianState;

  const profile = await fetchProfile(userId);
  const dish = await ensureFinanceDish(userId);
  const equity = Number(dish.live_gbp);
  const { data, error } = await supabase
    .from('guardian_states')
    .insert({
      user_id: userId,
      status: 'protected',
      risk_pct: profile?.risk_pct ?? 15,
      peak_equity_gbp: equity,
      equity_gbp: equity,
      drawdown_pct: 0,
      vault_gbp: Number(dish.safety_gbp),
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as GuardianState;
}

export function computeDrawdown(peak: number, equity: number): number {
  if (peak <= 0) return 0;
  const dd = ((peak - equity) / peak) * 100;
  return Number(Math.max(0, dd).toFixed(2));
}

/**
 * Paper Guardian check (~10s cron equivalent).
 * Syncs equity from finance dish, updates peak/drawdown, triggers tap-out.
 */
export async function runGuardianCheck(
  userId: string,
): Promise<GuardianState> {
  const supabase = assertSupabase();
  const [state, dish, profile] = await Promise.all([
    ensureGuardianState(userId),
    ensureFinanceDish(userId),
    fetchProfile(userId),
  ]);

  if (state.status === 'triggered') return state;

  const riskPct = (profile?.risk_pct ?? state.risk_pct ?? 15) as 8 | 15 | 25;
  const equity = Number(dish.live_gbp);
  const peak = Math.max(Number(state.peak_equity_gbp), equity);
  const drawdown = computeDrawdown(peak, equity);

  if (drawdown >= riskPct) {
    // Tap-out: protect £10 vault, zero live desk for the session
    const vault = Number(dish.safety_gbp);
    const { data, error } = await supabase
      .from('guardian_states')
      .update({
        status: 'triggered',
        risk_pct: riskPct,
        peak_equity_gbp: peak,
        equity_gbp: equity,
        drawdown_pct: drawdown,
        vault_gbp: vault,
        locked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select('*')
      .single();
    if (error) throw error;

    await supabase
      .from('finance_dishes')
      .update({
        live_gbp: 0,
        safety_gbp: Number((vault + equity).toFixed(2)),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    await supabase.from('timeline').insert({
      user_id: userId,
      event_key: 'guardian.triggered',
      payload: { drawdown_pct: drawdown, risk_pct: riskPct },
    });

    return data as GuardianState;
  }

  const { data, error } = await supabase
    .from('guardian_states')
    .update({
      status: 'protected',
      risk_pct: riskPct,
      peak_equity_gbp: peak,
      equity_gbp: equity,
      drawdown_pct: drawdown,
      vault_gbp: Number(dish.safety_gbp),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select('*')
    .single();
  if (error) throw error;
  return data as GuardianState;
}

/** Dev / paper stress: apply a loss to live equity then re-check. */
export async function simulateDrawdownHit(
  userId: string,
  lossGbp: number,
): Promise<GuardianState> {
  const dish = await ensureFinanceDish(userId);
  const next = Math.max(0, Number((Number(dish.live_gbp) - lossGbp).toFixed(2)));
  const supabase = assertSupabase();
  await supabase
    .from('finance_dishes')
    .update({ live_gbp: next, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  return runGuardianCheck(userId);
}

export async function resetGuardianProtected(
  userId: string,
): Promise<GuardianState> {
  const supabase = assertSupabase();
  const dish = await ensureFinanceDish(userId);
  // Restore a paper live desk if emptied by tap-out
  const live =
    Number(dish.live_gbp) > 0 ? Number(dish.live_gbp) : 35;
  await supabase
    .from('finance_dishes')
    .update({
      live_gbp: live,
      safety_gbp: 10,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  const { data, error } = await supabase
    .from('guardian_states')
    .upsert(
      {
        user_id: userId,
        status: 'protected',
        peak_equity_gbp: live,
        equity_gbp: live,
        drawdown_pct: 0,
        vault_gbp: 10,
        locked_at: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single();
  if (error) throw error;
  return data as GuardianState;
}

export function riskLabel(profile: Profile | null, state: GuardianState | null) {
  const pct = profile?.risk_pct ?? state?.risk_pct ?? 15;
  if (pct === 8) return 'Conservative · 8%';
  if (pct === 25) return 'Aggressive · 25%';
  return 'Balanced · 15%';
}

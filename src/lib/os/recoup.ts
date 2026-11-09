import { assertSupabase } from '../supabase';
import { pushTimeline } from './timeline';

export type RecoupPlan = {
  user_id: string;
  day_index: number;
  target_gbp: number;
  recovered_gbp: number;
  status: 'active' | 'complete' | 'paused';
  updated_at: string;
};

export const RECOUP_DAYS = 18;

export async function ensureRecoup(userId: string): Promise<RecoupPlan> {
  const supabase = assertSupabase();
  const existing = await supabase
    .from('recoup_plans')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data as RecoupPlan;

  const { data, error } = await supabase
    .from('recoup_plans')
    .insert({ user_id: userId, day_index: 1, target_gbp: 50 })
    .select('*')
    .single();
  if (error) throw error;
  return data as RecoupPlan;
}

export async function advanceRecoupDay(userId: string): Promise<RecoupPlan> {
  const plan = await ensureRecoup(userId);
  if (plan.status === 'complete') return plan;

  const daily = Number((Number(plan.target_gbp) / RECOUP_DAYS).toFixed(2));
  const nextDay = Math.min(RECOUP_DAYS, plan.day_index + 1);
  const recovered = Number(
    (Number(plan.recovered_gbp) + daily).toFixed(2),
  );
  const complete = nextDay >= RECOUP_DAYS;

  const supabase = assertSupabase();
  const { data, error } = await supabase
    .from('recoup_plans')
    .update({
      day_index: nextDay,
      recovered_gbp: Math.min(Number(plan.target_gbp), recovered),
      status: complete ? 'complete' : 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select('*')
    .single();
  if (error) throw error;
  await pushTimeline(userId, 'recoup.day', { day: nextDay, recovered });
  return data as RecoupPlan;
}

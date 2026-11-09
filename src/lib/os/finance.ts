import { assertSupabase } from '../supabase';
import type { FinanceDish } from '../../types/db';

export async function fetchFinanceDish(
  userId: string,
): Promise<FinanceDish | null> {
  const supabase = assertSupabase();
  const { data, error } = await supabase
    .from('finance_dishes')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as FinanceDish | null;
}

export async function ensureFinanceDish(userId: string): Promise<FinanceDish> {
  const existing = await fetchFinanceDish(userId);
  if (existing) return existing;

  const supabase = assertSupabase();
  const { data, error } = await supabase
    .from('finance_dishes')
    .upsert({
      user_id: userId,
      fake_gbp: 5,
      live_gbp: 35,
      safety_gbp: 10,
      day_spent_gbp: 0,
      day_cap_gbp: 7,
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as FinanceDish;
}

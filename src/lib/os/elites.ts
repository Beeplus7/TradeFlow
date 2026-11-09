import { assertSupabase } from '../supabase';
import { pushTimeline } from './timeline';

export type Elite = {
  id: string;
  user_id: string;
  label: string;
  wallet_address: string | null;
  score: number;
  created_at: string;
};

export const MAX_PERSONAL_ELITES = 10;

export async function fetchElites(userId: string): Promise<Elite[]> {
  const supabase = assertSupabase();
  const { data, error } = await supabase
    .from('elites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Elite[];
}

export async function addElite(input: {
  userId: string;
  label: string;
  wallet?: string;
  score?: number;
}): Promise<Elite> {
  const existing = await fetchElites(input.userId);
  if (existing.length >= MAX_PERSONAL_ELITES) {
    throw new Error(`Personal EliteFlow capped at ${MAX_PERSONAL_ELITES}.`);
  }
  const supabase = assertSupabase();
  const { data, error } = await supabase
    .from('elites')
    .insert({
      user_id: input.userId,
      label: input.label.trim(),
      wallet_address: input.wallet?.trim() || null,
      score: input.score ?? Math.round(55 + Math.random() * 40),
    })
    .select('*')
    .single();
  if (error) throw error;
  await pushTimeline(input.userId, 'elite.added', { label: input.label });
  return data as Elite;
}

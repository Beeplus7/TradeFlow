import { assertSupabase } from '../supabase';
import { currentWeekStart } from '../week';
import type { DayKey } from './flowChain';
import type { Journey } from '../../types/db';

export async function ensureWeekJourney(userId: string): Promise<Journey> {
  const supabase = assertSupabase();
  const week = currentWeekStart();
  const existing = await supabase
    .from('journeys')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', week)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data as Journey;

  const { data, error } = await supabase
    .from('journeys')
    .insert({ user_id: userId, week_start: week })
    .select('*')
    .single();
  if (error) throw error;
  return data as Journey;
}

export async function markDayDone(
  userId: string,
  day: DayKey,
): Promise<Journey> {
  const supabase = assertSupabase();
  const week = currentWeekStart();
  const col = `${day}_done`;
  const { data, error } = await supabase
    .from('journeys')
    .upsert(
      {
        user_id: userId,
        week_start: week,
        [col]: true,
      },
      { onConflict: 'user_id,week_start' },
    )
    .select('*')
    .single();
  if (error) throw error;

  await supabase.from('timeline').insert({
    user_id: userId,
    event_key: `journey.${day}.done`,
    payload: { day, week_start: week },
  });

  return data as Journey;
}

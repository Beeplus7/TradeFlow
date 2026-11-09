import { assertSupabase } from '../supabase';
import { pushTimeline } from './timeline';

export type LockKind =
  | 'tilt'
  | 'fomo'
  | 'revenge'
  | 'overtrade'
  | 'guardian_ignore';

export type DisciplineState = {
  user_id: string;
  score: number;
  lock_kind: LockKind | null;
  locked_until: string | null;
  updated_at: string;
};

export type DisciplineEvent = {
  id: string;
  user_id: string;
  kind: string;
  note: string;
  created_at: string;
};

const COOLDOWN_MS: Record<LockKind, number> = {
  tilt: 10 * 60 * 1000,
  fomo: 30 * 60 * 1000,
  revenge: 24 * 60 * 60 * 1000,
  overtrade: 10 * 60 * 1000,
  guardian_ignore: 30 * 60 * 1000,
};

export async function ensureDiscipline(
  userId: string,
): Promise<DisciplineState> {
  const supabase = assertSupabase();
  const existing = await supabase
    .from('discipline_states')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return clearIfExpired(existing.data as DisciplineState);

  const { data, error } = await supabase
    .from('discipline_states')
    .insert({ user_id: userId, score: 100 })
    .select('*')
    .single();
  if (error) throw error;
  return data as DisciplineState;
}

async function clearIfExpired(state: DisciplineState): Promise<DisciplineState> {
  if (!state.locked_until) return state;
  if (new Date(state.locked_until).getTime() > Date.now()) return state;
  const supabase = assertSupabase();
  const { data, error } = await supabase
    .from('discipline_states')
    .update({
      lock_kind: null,
      locked_until: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', state.user_id)
    .select('*')
    .single();
  if (error) throw error;
  return data as DisciplineState;
}

export function isLocked(state: DisciplineState | null): boolean {
  if (!state?.locked_until || !state.lock_kind) return false;
  return new Date(state.locked_until).getTime() > Date.now();
}

export async function triggerLock(
  userId: string,
  kind: LockKind,
): Promise<DisciplineState> {
  const supabase = assertSupabase();
  const state = await ensureDiscipline(userId);
  const until = new Date(Date.now() + COOLDOWN_MS[kind]).toISOString();
  const nextScore = Math.max(0, Number(state.score) - 12);
  const { data, error } = await supabase
    .from('discipline_states')
    .update({
      lock_kind: kind,
      locked_until: until,
      score: nextScore,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select('*')
    .single();
  if (error) throw error;

  await supabase.from('discipline_events').insert({
    user_id: userId,
    kind,
    note: `Cooldown ${kind} · breathe · £50 In Smile Out`,
  });
  await pushTimeline(userId, `discipline.${kind}`, { until });
  return data as DisciplineState;
}

export async function fetchDisciplineEvents(
  userId: string,
): Promise<DisciplineEvent[]> {
  const supabase = assertSupabase();
  const { data, error } = await supabase
    .from('discipline_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []) as DisciplineEvent[];
}

export async function breatheReset(userId: string): Promise<DisciplineState> {
  const supabase = assertSupabase();
  const { data, error } = await supabase
    .from('discipline_states')
    .upsert(
      {
        user_id: userId,
        lock_kind: null,
        locked_until: null,
        score: 100,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single();
  if (error) throw error;
  await pushTimeline(userId, 'discipline.reset', {});
  return data as DisciplineState;
}

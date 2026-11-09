import { assertSupabase } from '../supabase';

export type TimelineEvent = {
  id: string;
  user_id: string;
  event_key: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export async function fetchTimeline(
  userId: string,
  limit = 24,
): Promise<TimelineEvent[]> {
  const supabase = assertSupabase();
  const { data, error } = await supabase
    .from('timeline')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as TimelineEvent[];
}

export async function pushTimeline(
  userId: string,
  eventKey: string,
  payload: Record<string, unknown> = {},
): Promise<void> {
  const supabase = assertSupabase();
  await supabase.from('timeline').insert({
    user_id: userId,
    event_key: eventKey,
    payload,
  });
}

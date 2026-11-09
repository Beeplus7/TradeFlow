import { assertSupabase } from '../supabase';

export type ExchangeVenue = 'binance' | 'bybit' | 'paper';

export type ExchangeConnection = {
  user_id: string;
  venue: ExchangeVenue;
  paper_mode: boolean;
  label: string | null;
  key_hint: string | null;
  updated_at: string;
};

export async function fetchConnection(
  userId: string,
): Promise<ExchangeConnection | null> {
  const supabase = assertSupabase();
  const { data, error } = await supabase
    .from('exchange_connections')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as ExchangeConnection | null;
}

export async function ensureConnection(
  userId: string,
): Promise<ExchangeConnection> {
  const existing = await fetchConnection(userId);
  if (existing) return existing;
  const supabase = assertSupabase();
  const { data, error } = await supabase
    .from('exchange_connections')
    .insert({
      user_id: userId,
      venue: 'paper',
      paper_mode: true,
      label: 'Paper desk',
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as ExchangeConnection;
}

/**
 * Paper-first connect. Live keys are never stored here —
 * only venue preference + optional last-4 hint for UI.
 */
export async function saveConnection(input: {
  userId: string;
  venue: ExchangeVenue;
  paperMode: boolean;
  keyHint?: string;
}): Promise<ExchangeConnection> {
  const supabase = assertSupabase();
  const label =
    input.venue === 'paper'
      ? 'Paper desk'
      : `${input.venue} · ${input.paperMode ? 'PAPER' : 'LIVE FLAG OFF'}`;

  const { data, error } = await supabase
    .from('exchange_connections')
    .upsert(
      {
        user_id: input.userId,
        venue: input.venue,
        // Force paper until Phase 8 live executors ship
        paper_mode: true,
        label,
        key_hint: input.keyHint?.slice(-4) ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single();
  if (error) throw error;
  return data as ExchangeConnection;
}

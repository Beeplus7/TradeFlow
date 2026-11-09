import { assertSupabase } from '../supabase';

export type SimTrade = {
  id: string;
  user_id: string;
  mode: 'sim';
  venue: 'paper';
  symbol: string;
  side: 'buy' | 'sell';
  notional_gbp: number;
  pnl_gbp: number;
  traded_on: string;
  created_at: string;
};

export type SimSession = {
  id: string;
  user_id: string;
  stake_gbp: number;
  result_gbp: number | null;
  discipline_proof: boolean;
  created_at: string;
};

const SYMBOLS = ['BTC', 'ETH', 'SOL'] as const;

export async function fetchSimTrades(userId: string): Promise<SimTrade[]> {
  const supabase = assertSupabase();
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .eq('mode', 'sim')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as SimTrade[];
}

export async function placeSimTrade(input: {
  userId: string;
  side: 'buy' | 'sell';
  symbol?: string;
  notional?: number;
}): Promise<SimTrade> {
  const supabase = assertSupabase();
  const symbol =
    input.symbol ?? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  const notional = input.notional ?? 1.5;
  // Disciplined sim: small random edge, capped — not casino
  const edge = (Math.random() - 0.42) * 0.35;
  const pnl = Number((notional * edge).toFixed(2));

  const { data, error } = await supabase
    .from('trades')
    .insert({
      user_id: input.userId,
      mode: 'sim',
      venue: 'paper',
      symbol,
      side: input.side,
      notional_gbp: notional,
      pnl_gbp: pnl,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as SimTrade;
}

export function simSummary(trades: SimTrade[]) {
  const pnl = trades.reduce((a, t) => a + Number(t.pnl_gbp), 0);
  const wins = trades.filter((t) => Number(t.pnl_gbp) > 0).length;
  const winRate = trades.length ? wins / trades.length : 0;
  // Discipline proof: ≥3 trades and win rate ≥ 40% (design: proof before live)
  const disciplineProof = trades.length >= 3 && winRate >= 0.4;
  return {
    count: trades.length,
    pnl: Number(pnl.toFixed(2)),
    wins,
    winRate,
    disciplineProof,
    bank: Number((5 + pnl).toFixed(2)),
  };
}

export async function saveDisciplineProof(
  userId: string,
  resultGbp: number,
): Promise<SimSession> {
  const supabase = assertSupabase();
  const { data, error } = await supabase
    .from('simulations')
    .insert({
      user_id: userId,
      stake_gbp: 5,
      result_gbp: resultGbp,
      discipline_proof: true,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as SimSession;
}

import { assertSupabase } from '../supabase';
import type { FinanceDish, Journey, Profile } from '../../types/db';
import { GO_THRESHOLD } from '../../types/db';
import { ensureFinanceDish } from './finance';
import {
  ensureGuardianState,
  type GuardianState,
} from './guardian';
import { dayDone } from './flowChain';

export const DAY_CAP_GBP = 7;
export const MAX_TICK_GBP = 2;
/** Slippage guard — reject if simulated slip > this fraction of notional */
export const MAX_SLIP_PCT = 0.012;

export type LiveTrade = {
  id: string;
  user_id: string;
  mode: 'live';
  venue: 'binance' | 'bybit' | 'paper';
  symbol: string;
  side: 'buy' | 'sell';
  notional_gbp: number;
  pnl_gbp: number;
  traded_on: string;
  created_at: string;
};

export type GateCheck = {
  id: string;
  label: string;
  ok: boolean;
};

export type CapStatus = {
  spent: number;
  cap: number;
  remaining: number;
  locked: boolean;
};

const SYMBOLS = ['BTC', 'ETH', 'SOL'] as const;

export function capStatus(dish: FinanceDish | null): CapStatus {
  const spent = Number(dish?.day_spent_gbp ?? 0);
  const cap = Number(dish?.day_cap_gbp ?? DAY_CAP_GBP);
  const remaining = Math.max(0, Number((cap - spent).toFixed(2)));
  return { spent, cap, remaining, locked: remaining <= 0 };
}

/** Gate 5 greens — all required before paper execute. */
export function gateFive(input: {
  profile: Profile | null;
  journey: Journey | null;
  dish: FinanceDish | null;
  guardian: GuardianState | null;
}): GateCheck[] {
  const go =
    input.journey?.go_score != null &&
    Number(input.journey.go_score) >= GO_THRESHOLD;
  const risk = Boolean(input.profile?.risk_pct);
  const wed = dayDone(input.journey, 'wed');
  const shield = input.guardian?.status !== 'triggered';
  const room = !capStatus(input.dish).locked;

  return [
    { id: 'go', label: 'Assessment GO ≥68%', ok: go },
    { id: 'risk', label: 'Risk profile set', ok: risk },
    { id: 'wed', label: 'Wed discipline proof', ok: wed },
    { id: 'guardian', label: 'Guardian PROTECTED', ok: shield },
    { id: 'cap', label: '£7/day room remaining', ok: room },
  ];
}

export function allGatesGreen(gates: GateCheck[]): boolean {
  return gates.every((g) => g.ok);
}

export async function fetchTodayLiveTrades(
  userId: string,
): Promise<LiveTrade[]> {
  const supabase = assertSupabase();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .eq('mode', 'live')
    .eq('traded_on', today)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as LiveTrade[];
}

export async function placePaperExecute(input: {
  userId: string;
  side: 'buy' | 'sell';
  notional?: number;
  venue?: 'binance' | 'bybit' | 'paper';
  gates: GateCheck[];
  guardian: GuardianState | null;
}): Promise<{ trade: LiveTrade; dish: FinanceDish; log: string }> {
  if (!allGatesGreen(input.gates)) {
    throw new Error('Gate 5 incomplete — all greens required.');
  }
  if (input.guardian?.status === 'triggered') {
    throw new Error('Guardian TRIGGERED — execution locked.');
  }

  const notional = Number((input.notional ?? MAX_TICK_GBP).toFixed(2));
  if (notional <= 0 || notional > MAX_TICK_GBP) {
    throw new Error(`Notional must be £0.01–£${MAX_TICK_GBP}.`);
  }

  const dish = await ensureFinanceDish(input.userId);
  const cap = capStatus(dish);
  if (cap.locked || notional > cap.remaining + 1e-9) {
    throw new Error(
      `£7/day LOCKED — £${cap.spent.toFixed(2)}/£${cap.cap.toFixed(2)} spent.`,
    );
  }

  // Slippage guard (paper): reject oversized simulated slip
  const slip = Math.random() * 0.02;
  if (slip > MAX_SLIP_PCT) {
    throw new Error(
      `Slippage guard — ${(slip * 100).toFixed(2)}% > ${(MAX_SLIP_PCT * 100).toFixed(1)}% max.`,
    );
  }

  const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  const edge = (Math.random() - 0.48) * 0.2;
  const pnl = Number((notional * edge).toFixed(2));
  const venue = input.venue ?? 'paper';

  const supabase = assertSupabase();
  const { data, error } = await supabase
    .from('trades')
    .insert({
      user_id: input.userId,
      mode: 'live',
      venue,
      symbol,
      side: input.side,
      notional_gbp: notional,
      pnl_gbp: pnl,
    })
    .select('*')
    .single();
  if (error) throw error;

  const nextSpent = Number((cap.spent + notional).toFixed(2));
  const nextLive = Number((Number(dish.live_gbp) + pnl).toFixed(2));
  const { data: updated, error: dishErr } = await supabase
    .from('finance_dishes')
    .update({
      day_spent_gbp: nextSpent,
      live_gbp: nextLive,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', input.userId)
    .select('*')
    .single();
  if (dishErr) throw dishErr;

  await ensureGuardianState(input.userId);
  await supabase
    .from('guardian_states')
    .update({
      equity_gbp: nextLive,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', input.userId);

  const log = `[PAPER] ${input.side.toUpperCase()} ${symbol} £${notional.toFixed(2)} slip=${(slip * 100).toFixed(2)}% pnl=${pnl >= 0 ? '+' : ''}£${pnl.toFixed(2)} · £${nextSpent.toFixed(2)}/£${cap.cap.toFixed(2)}`;

  return { trade: data as LiveTrade, dish: updated as FinanceDish, log };
}

export async function resetDayCapIfNeeded(userId: string): Promise<FinanceDish> {
  // Client-side day boundary: if last spend day differs, zero spent.
  // Trades are dated; we recompute spent from today's live notionals.
  const supabase = assertSupabase();
  const dish = await ensureFinanceDish(userId);
  const trades = await fetchTodayLiveTrades(userId);
  const spent = Number(
    trades.reduce((a, t) => a + Number(t.notional_gbp), 0).toFixed(2),
  );
  if (Math.abs(spent - Number(dish.day_spent_gbp)) < 0.001) return dish;

  const { data, error } = await supabase
    .from('finance_dishes')
    .update({
      day_spent_gbp: spent,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select('*')
    .single();
  if (error) throw error;
  return data as FinanceDish;
}

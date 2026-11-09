import { assertSupabase } from '../supabase';
import { currentWeekStart } from '../week';
import type { Journey } from '../../types/db';
import { GO_THRESHOLD } from '../../types/db';

export type Regime = 'calm' | 'normal' | 'volatile' | 'extreme';

export type AssessmentResult = {
  score: number;
  regime: Regime;
  go: boolean;
  source: 'coingecko' | 'local';
};

function regimeFromScore(score: number): Regime {
  if (score >= 80) return 'extreme';
  if (score >= 68) return 'volatile';
  if (score >= 45) return 'normal';
  return 'calm';
}

/** Local deterministic score so offline / API fail still demos the meter. */
function localScore(): number {
  const day = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < day.length; i += 1) {
    hash = (hash * 31 + day.charCodeAt(i)) % 1000;
  }
  return Math.round(55 + (hash % 30) + (hash % 7) * 0.3);
}

async function coinGeckoScore(): Promise<number | null> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1',
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { prices?: [number, number][] };
    const prices = json.prices?.map((p) => p[1]) ?? [];
    if (prices.length < 8) return null;
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i += 1) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance =
      returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length;
    const vol = Math.sqrt(variance) * 1000;
    return Math.max(40, Math.min(92, Math.round(48 + vol * 18)));
  } catch {
    return null;
  }
}

export async function runAssessment(): Promise<AssessmentResult> {
  const cg = await coinGeckoScore();
  const score = cg ?? localScore();
  return {
    score,
    regime: regimeFromScore(score),
    go: score >= GO_THRESHOLD,
    source: cg != null ? 'coingecko' : 'local',
  };
}

export async function fetchWeekJourney(userId: string): Promise<Journey | null> {
  const supabase = assertSupabase();
  const week = currentWeekStart();
  const { data, error } = await supabase
    .from('journeys')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', week)
    .maybeSingle();
  if (error) throw error;
  return data as Journey | null;
}

export async function saveAssessment(
  userId: string,
  result: AssessmentResult,
): Promise<Journey> {
  const supabase = assertSupabase();
  const week = currentWeekStart();
  const { data, error } = await supabase
    .from('journeys')
    .upsert(
      {
        user_id: userId,
        week_start: week,
        go_score: result.score,
        mon_done: result.go,
      },
      { onConflict: 'user_id,week_start' },
    )
    .select('*')
    .single();
  if (error) throw error;

  await supabase.from('timeline').insert({
    user_id: userId,
    event_key: result.go ? 'assessment.go' : 'assessment.nogo',
    payload: {
      score: result.score,
      regime: result.regime,
      source: result.source,
      threshold: GO_THRESHOLD,
    },
  });

  return data as Journey;
}

import { assertSupabase } from '../supabase';
import { ensureFinanceDish } from './finance';
import { pushTimeline } from './timeline';

export type LegacyVault = {
  id: string;
  user_id: string;
  reinvest_gbp: number;
  smile_gbp: number;
  hmrc_gbp: number;
  vault_gbp: number;
  vault_unlock_at: string | null;
  updated_at: string;
};

/** 40 reinvest / 30 smile / 20 HMRC / 10 vault */
export const LEGACY_SPLIT = {
  reinvest: 0.4,
  smile: 0.3,
  hmrc: 0.2,
  vault: 0.1,
} as const;

export async function ensureLegacyVault(userId: string): Promise<LegacyVault> {
  const supabase = assertSupabase();
  const existing = await supabase
    .from('legacy_vaults')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data as LegacyVault;

  const { data, error } = await supabase
    .from('legacy_vaults')
    .insert({ user_id: userId })
    .select('*')
    .single();
  if (error) throw error;
  return data as LegacyVault;
}

/** Paper Friday split dry-run against current live PnL / dish. */
export async function runLegacySplit(
  userId: string,
  smileOutGbp?: number,
): Promise<LegacyVault> {
  const dish = await ensureFinanceDish(userId);
  const smile =
    smileOutGbp ??
    Math.max(0, Number(dish.live_gbp) - 20); // paper: surplus above baseline
  const amount = Number(Math.max(0, smile).toFixed(2));

  const reinvest = Number((amount * LEGACY_SPLIT.reinvest).toFixed(2));
  const smilePart = Number((amount * LEGACY_SPLIT.smile).toFixed(2));
  const hmrc = Number((amount * LEGACY_SPLIT.hmrc).toFixed(2));
  const vault = Number((amount * LEGACY_SPLIT.vault).toFixed(2));

  const current = await ensureLegacyVault(userId);
  const supabase = assertSupabase();
  const { data, error } = await supabase
    .from('legacy_vaults')
    .update({
      reinvest_gbp: Number(current.reinvest_gbp) + reinvest,
      smile_gbp: Number(current.smile_gbp) + smilePart,
      hmrc_gbp: Number(current.hmrc_gbp) + hmrc,
      vault_gbp: Number(current.vault_gbp) + vault,
      vault_unlock_at: new Date(
        Date.now() + 90 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select('*')
    .single();
  if (error) throw error;

  await pushTimeline(userId, 'legacy.split', {
    amount,
    reinvest,
    smile: smilePart,
    hmrc,
    vault,
  });
  return data as LegacyVault;
}

export function hmrcCsv(vault: LegacyVault): string {
  const rows = [
    ['bucket', 'gbp'],
    ['reinvest', String(vault.reinvest_gbp)],
    ['smile_out', String(vault.smile_gbp)],
    ['hmrc', String(vault.hmrc_gbp)],
    ['vault', String(vault.vault_gbp)],
  ];
  return rows.map((r) => r.join(',')).join('\n');
}

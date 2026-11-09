import { assertSupabase } from '../supabase';
import { pushTimeline } from './timeline';

export type WalletScan = {
  id: string;
  user_id: string;
  label: string;
  wallet_hint: string | null;
  score: number;
  scanned_at: string;
};

const SAMPLE = [
  'Whale-North',
  'Flow-Delta',
  'Vault-7',
  'Quiet-Alpha',
  'Legacy-Run',
  'Tilt-Free',
  'Cap-Respect',
  'Smile-Out',
  'Guardian-Hold',
  'Eyes-Boat',
];

/** Paper Eyes Boat — batch scan (stands in for 100-wallet / 30s cron). */
export async function runEyesBoatScan(userId: string): Promise<WalletScan[]> {
  const supabase = assertSupabase();
  const batch = SAMPLE.map((label) => ({
    user_id: userId,
    label,
    wallet_hint: `0x${Math.random().toString(16).slice(2, 8)}…`,
    score: Math.round(40 + Math.random() * 55),
  }));
  const { data, error } = await supabase
    .from('wallet_scans')
    .insert(batch)
    .select('*');
  if (error) throw error;
  await pushTimeline(userId, 'eyesboat.scan', { count: batch.length });
  return (data ?? []) as WalletScan[];
}

export async function fetchRecentScans(
  userId: string,
  limit = 40,
): Promise<WalletScan[]> {
  const supabase = assertSupabase();
  const { data, error } = await supabase
    .from('wallet_scans')
    .select('*')
    .eq('user_id', userId)
    .order('scanned_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as WalletScan[];
}

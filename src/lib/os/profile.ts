import { assertSupabase } from '../supabase';
import type {
  ExchangeMode,
  ExperienceLevel,
  Profile,
  RiskProfile,
} from '../../types/db';

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const supabase = assertSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

function makeClearId(userId: string): string {
  const short = userId.replace(/-/g, '').slice(0, 8).toUpperCase();
  return `TF-${short}`;
}

export async function saveOnboarding(input: {
  userId: string;
  displayName?: string;
  riskProfile: RiskProfile;
  riskPct: 8 | 15 | 25;
  experienceLevel: ExperienceLevel;
  exchangeMode: ExchangeMode;
}): Promise<Profile> {
  const supabase = assertSupabase();
  const clearId = makeClearId(input.userId);
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: input.userId,
      display_name: input.displayName ?? null,
      risk_profile: input.riskProfile,
      risk_pct: input.riskPct,
      experience_level: input.experienceLevel,
      exchange_mode: input.exchangeMode,
      clear_id: clearId,
      onboarding_complete: true,
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as Profile;
}

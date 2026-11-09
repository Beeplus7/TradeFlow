export type RiskProfile = 'conservative' | 'balanced' | 'aggressive';
export type ExperienceLevel = 'beginner' | 'rebuild' | 'active';
export type ExchangeMode = 'connected' | 'simulator';

export type Profile = {
  id: string;
  display_name: string | null;
  risk_profile: RiskProfile | null;
  risk_pct: 8 | 15 | 25 | null;
  experience_level: ExperienceLevel | null;
  clear_id: string | null;
  exchange_mode: ExchangeMode | null;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
};

export type Journey = {
  id: string;
  user_id: string;
  week_start: string;
  mon_done: boolean;
  tue_done: boolean;
  wed_done: boolean;
  thu_done: boolean;
  fri_done: boolean;
  go_score: number | null;
  created_at: string;
};

export type FinanceDish = {
  user_id: string;
  fake_gbp: number;
  live_gbp: number;
  safety_gbp: number;
  day_spent_gbp: number;
  day_cap_gbp: number;
  updated_at: string;
};

export type GuardianStatus = 'protected' | 'triggered';

export type GuardianState = {
  user_id: string;
  status: GuardianStatus;
  risk_pct: 8 | 15 | 25;
  peak_equity_gbp: number;
  equity_gbp: number;
  drawdown_pct: number;
  vault_gbp: number;
  locked_at: string | null;
  updated_at: string;
};

/** Architecture: Con 8% · Bal 15% · Agg 25% Guardian tap-out */
export const RISK_OPTIONS: {
  profile: RiskProfile;
  pct: 8 | 15 | 25;
  label: string;
  blurb: string;
  dailyStop: string;
}[] = [
  {
    profile: 'conservative',
    pct: 8,
    label: 'Conservative',
    blurb: 'Guardian tight · slow Flow',
    dailyStop: '2% daily stop',
  },
  {
    profile: 'balanced',
    pct: 15,
    label: 'Balanced',
    blurb: 'Commonwealth default · steady',
    dailyStop: '4% daily stop',
  },
  {
    profile: 'aggressive',
    pct: 25,
    label: 'Aggressive',
    blurb: 'Wide rails · fast Flow',
    dailyStop: '6% daily stop',
  },
];

/** From tradeflow-onboarding-pure / onboarding-os */
export const EXPERIENCE_OPTIONS: {
  id: ExperienceLevel;
  title: string;
  blurb: string;
  uprm: string;
}[] = [
  {
    id: 'beginner',
    title: 'Complete beginner',
    blurb: 'Zero knowledge. Perfect place to start.',
    uprm: 'UPRM: Patient',
  },
  {
    id: 'rebuild',
    title: 'Tried before, lost',
    blurb: 'We reset context. No shame in Flow.',
    uprm: 'UPRM: Rebuild',
  },
  {
    id: 'active',
    title: 'Trading already',
    blurb: 'We tighten risk & elevate assessment.',
    uprm: 'UPRM: Direct',
  },
];

export const GO_THRESHOLD = 68;

export const ONBOARDING_STEPS = [
  'Welcome',
  'Experience',
  '£50 Dish',
  'Exchange',
  'Risk',
  'ClearID',
] as const;

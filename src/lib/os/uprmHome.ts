import type { Journey } from '../../types/db';
import { GO_THRESHOLD } from '../../types/db';
import { dayDone, doneCount } from './flowChain';

export type HealthTile = {
  id: string;
  label: string;
  value: string;
  sub: string;
  bar: number;
  tone: 'gold' | 'ready' | 'wait' | 'danger';
};

export type ModuleStatus = 'live' | 'ready' | 'next' | 'locked' | 'admin';

export function flowProgress(journey: Journey | null): number {
  return Math.round((doneCount(journey) / 5) * 100);
}

export function welcomeName(email: string | null | undefined, display?: string | null) {
  if (display?.trim()) return display.trim().split(/\s+/)[0];
  if (!email) return 'Trader';
  const local = email.split('@')[0] ?? 'Trader';
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export function companionLine(input: {
  onboarding: boolean;
  goScore: number | null;
  monDone: boolean;
  chainDone: number;
  guardian: 'protected' | 'triggered' | null;
}): string {
  if (!input.onboarding) {
    return 'UPRM is ready. Finish onboarding so your risk rails and dish lock in.';
  }
  if (input.goScore == null) {
    return 'Your desk is live. Run Assessment — ≥68% GO unlocks Monday on the Heart.';
  }
  if (!input.monDone && input.goScore < GO_THRESHOLD) {
    return `GO sits at ${input.goScore}%. Wait for regime ≥${GO_THRESHOLD}% before the Heart opens.`;
  }
  if (input.chainDone < 5) {
    return `FlowChain ${input.chainDone}/5. Must-complete is non-negotiable — continue the Heart.`;
  }
  if (input.guardian === 'triggered') {
    return 'Guardian triggered. Shield is holding the vault — reset before live ticks.';
  }
  return 'Heart open this week. Legacy, Guardian, and Execute stay on your UPRM spine.';
}

export function buildHealthTiles(input: {
  goScore: number | null;
  chainDone: number;
  dishTotal: number | null;
  daySpent: number | null;
  dayCap: number | null;
  guardian: 'protected' | 'triggered' | null;
}): HealthTile[] {
  const go = input.goScore ?? 0;
  const goOk = input.goScore != null && input.goScore >= GO_THRESHOLD;
  const spent = input.daySpent ?? 0;
  const cap = input.dayCap ?? 7;
  const capPct = Math.min(100, Math.round((spent / cap) * 100));

  return [
    {
      id: 'chain',
      label: 'FlowChain',
      value: `${input.chainDone}/5`,
      sub: input.chainDone >= 5 ? 'Heart open' : 'Must-complete',
      bar: Math.round((input.chainDone / 5) * 100),
      tone: input.chainDone >= 5 ? 'ready' : 'gold',
    },
    {
      id: 'go',
      label: 'Assessment GO',
      value: input.goScore != null ? `${input.goScore}%` : '—',
      sub: goOk ? 'GO unlocked' : `Need ${GO_THRESHOLD}%`,
      bar: go,
      tone: goOk ? 'ready' : input.goScore != null ? 'wait' : 'gold',
    },
    {
      id: 'cap',
      label: '£7 day cap',
      value: `£${spent.toFixed(0)}/£${cap.toFixed(0)}`,
      sub: spent >= cap ? 'LOCKED' : 'Room left',
      bar: capPct,
      tone: spent >= cap ? 'danger' : 'gold',
    },
    {
      id: 'guard',
      label: 'Guardian',
      value:
        input.guardian === 'triggered'
          ? 'RED'
          : input.guardian === 'protected'
            ? 'OK'
            : '—',
      sub:
        input.guardian === 'triggered'
          ? 'Tap-out'
          : input.dishTotal != null
            ? `Dish £${input.dishTotal.toFixed(0)}`
            : 'Shield pending',
      bar: input.guardian === 'triggered' ? 100 : input.guardian === 'protected' ? 35 : 0,
      tone:
        input.guardian === 'triggered'
          ? 'danger'
          : input.guardian === 'protected'
            ? 'ready'
            : 'wait',
    },
  ];
}

export function moduleStatus(
  href: string,
  ctx: {
    onboarding: boolean;
    goScore: number | null;
    chainDone: number;
    journey: Journey | null;
  },
): ModuleStatus {
  if (href.startsWith('/app/admin')) return 'admin';
  if (!ctx.onboarding) {
    return href === '/app/onboarding' ? 'next' : 'locked';
  }
  if (href === '/app/onboarding') return 'live';
  if (href === '/app/assessment') {
    return ctx.goScore == null ? 'next' : 'live';
  }
  if (href === '/app/journey' || href === '/app/simulator') {
    if (ctx.goScore == null) return 'locked';
    return ctx.chainDone < 5 ? 'ready' : 'live';
  }
  if (href === '/app/execute') {
    return dayDone(ctx.journey, 'wed') ? 'ready' : 'locked';
  }
  if (href === '/app/guardian' || href === '/app/finance') return 'ready';
  if (href === '/app/uprm') return 'live';
  return 'ready';
}

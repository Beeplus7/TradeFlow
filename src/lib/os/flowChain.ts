import type { Journey } from '../../types/db';

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';

export const FLOW_DAYS: {
  key: DayKey;
  label: string;
  title: string;
  must: string;
  href: string;
}[] = [
  {
    key: 'mon',
    label: 'MON',
    title: 'Assessment',
    must: '68% GO unlock',
    href: '/app/assessment',
  },
  {
    key: 'tue',
    label: 'TUE',
    title: 'EliteFlow',
    must: 'Intel gather',
    href: '/app/journey/tue',
  },
  {
    key: 'wed',
    label: 'WED',
    title: 'Simulator',
    must: '£5 fake proof',
    href: '/app/simulator',
  },
  {
    key: 'thu',
    label: 'THU',
    title: 'Execute',
    must: '£7/day live',
    href: '/app/execute',
  },
  {
    key: 'fri',
    label: 'FRI',
    title: 'Legacy',
    must: '40/30/20/10',
    href: '/app/legacy',
  },
];

const ORDER: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri'];

export function dayDone(journey: Journey | null, day: DayKey): boolean {
  if (!journey) return false;
  return Boolean(journey[`${day}_done` as keyof Journey]);
}

/** Previous day must be complete — skip locks next RED. */
export function canAccessDay(journey: Journey | null, day: DayKey): boolean {
  const idx = ORDER.indexOf(day);
  if (idx <= 0) {
    // Monday: needs GO score path — mon unlocks via assessment; allow view always
    return true;
  }
  for (let i = 0; i < idx; i += 1) {
    if (!dayDone(journey, ORDER[i])) return false;
  }
  return true;
}

export function dayStatus(
  journey: Journey | null,
  day: DayKey,
): 'done' | 'open' | 'locked' {
  if (dayDone(journey, day)) return 'done';
  if (canAccessDay(journey, day)) return 'open';
  return 'locked';
}

export function doneCount(journey: Journey | null): number {
  return ORDER.filter((d) => dayDone(journey, d)).length;
}

export function columnForDay(day: DayKey): keyof Journey {
  return `${day}_done` as keyof Journey;
}

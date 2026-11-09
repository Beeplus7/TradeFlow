import { useCallback, useState } from 'react';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useAuth } from '../../src/lib/auth/AuthProvider';
import { ScreenFrame } from '../../src/components/layout/ScreenFrame';
import { FlowProgressRing } from '../../src/components/os/FlowProgressRing';
import { fetchWeekJourney } from '../../src/lib/os/assessment';
import { FLOW_DAYS, dayStatus, doneCount } from '../../src/lib/os/flowChain';
import { fetchFinanceDish } from '../../src/lib/os/finance';
import { ensureGuardianState } from '../../src/lib/os/guardian';
import { fetchProfile } from '../../src/lib/os/profile';
import {
  buildHealthTiles,
  companionLine,
  flowProgress,
  moduleStatus,
  welcomeName,
  type ModuleStatus,
} from '../../src/lib/os/uprmHome';
import { fetchTimeline, type TimelineEvent } from '../../src/lib/os/timeline';
import { ADMIN_ROUTES, OS_ROUTES } from '../../src/navigation/routes';
import { colors } from '../../src/theme/colors';
import { GO_THRESHOLD } from '../../src/types/db';
import type { Journey, Profile } from '../../src/types/db';

type Dash = {
  profile: Profile | null;
  onboarding: boolean;
  goScore: number | null;
  monDone: boolean;
  dishTotal: number | null;
  fake: number;
  live: number;
  safety: number;
  daySpent: number | null;
  dayCap: number | null;
  guardian: 'protected' | 'triggered' | null;
  journey: Journey | null;
  timeline: TimelineEvent[];
};

const CORE_HREFS = new Set([
  '/app/onboarding',
  '/app/assessment',
  '/app/finance',
  '/app/journey',
  '/app/simulator',
  '/app/execute',
  '/app/guardian',
  '/app/legacy',
  '/app/uprm',
]);

function statusColor(s: ModuleStatus) {
  if (s === 'live' || s === 'next') return colors.gold;
  if (s === 'ready') return colors.ready;
  if (s === 'locked') return colors.danger;
  return colors.textMuted;
}

function statusLabel(s: ModuleStatus) {
  if (s === 'next') return 'NEXT';
  if (s === 'live') return 'LIVE';
  if (s === 'ready') return 'READY';
  if (s === 'locked') return 'LOCKED';
  return 'ADMIN';
}

/**
 * UPRM Production Dashboard — Plug & Play composition + live Supabase data.
 */
export default function DashboardScreen() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [dash, setDash] = useState<Dash | null>(null);
  const [busy, setBusy] = useState(true);

  const tileW: `${number}%` =
    width >= 900 ? '23%' : width >= 560 ? '47%' : '100%';
  const modW: `${number}%` =
    width >= 1100 ? '23%' : width >= 800 ? '31%' : width >= 560 ? '47%' : '100%';
  const deskW: `${number}%` = width >= 900 ? '48%' : '100%';

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setBusy(false);
        return;
      }
      setBusy(true);
      Promise.all([
        fetchProfile(user.id),
        fetchWeekJourney(user.id),
        fetchFinanceDish(user.id),
        ensureGuardianState(user.id).catch(() => null),
        fetchTimeline(user.id, 6).catch(() => []),
      ])
        .then(([profile, journey, dish, guardian, timeline]) => {
          setDash({
            profile,
            onboarding: Boolean(profile?.onboarding_complete),
            goScore:
              journey?.go_score != null ? Number(journey.go_score) : null,
            monDone: Boolean(journey?.mon_done),
            dishTotal: dish
              ? Number(dish.fake_gbp) +
                Number(dish.live_gbp) +
                Number(dish.safety_gbp)
              : null,
            fake: Number(dish?.fake_gbp ?? 5),
            live: Number(dish?.live_gbp ?? 35),
            safety: Number(dish?.safety_gbp ?? 10),
            daySpent: dish != null ? Number(dish.day_spent_gbp) : null,
            dayCap: dish != null ? Number(dish.day_cap_gbp) : null,
            guardian: guardian?.status ?? null,
            journey: journey ?? null,
            timeline: timeline ?? [],
          });
        })
        .catch(() => setDash(null))
        .finally(() => setBusy(false));
    }, [user]),
  );

  if (loading || (user && busy && !dash)) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/app/login" />;
  }

  const chainDone = doneCount(dash?.journey ?? null);
  const progress = flowProgress(dash?.journey ?? null);
  const name = welcomeName(user.email, dash?.profile?.display_name);
  const health = buildHealthTiles({
    goScore: dash?.goScore ?? null,
    chainDone,
    dishTotal: dash?.dishTotal ?? null,
    daySpent: dash?.daySpent ?? null,
    dayCap: dash?.dayCap ?? null,
    guardian: dash?.guardian ?? null,
  });

  const spent = dash?.daySpent ?? 0;
  const cap = dash?.dayCap ?? 7;
  const left = Math.max(0, cap - spent);

  const nextHref = !dash?.onboarding
    ? '/app/onboarding'
    : dash.goScore == null
      ? '/app/assessment'
      : chainDone < 5
        ? '/app/journey'
        : '/app/legacy';

  const nextLabel = !dash?.onboarding
    ? 'Continue onboarding'
    : dash.goScore == null
      ? 'Run Assessment GO'
      : chainDone < 5
        ? 'Open Journey Heart'
        : 'Open Legacy vault';

  const companion = companionLine({
    onboarding: Boolean(dash?.onboarding),
    goScore: dash?.goScore ?? null,
    monDone: Boolean(dash?.monDone),
    chainDone,
    guardian: dash?.guardian ?? null,
  });

  const ctx = {
    onboarding: Boolean(dash?.onboarding),
    goScore: dash?.goScore ?? null,
    chainDone,
    journey: dash?.journey ?? null,
  };

  const coreMods = OS_ROUTES.filter(
    (r) => r.href !== '/app' && CORE_HREFS.has(r.href),
  );
  const moreMods = OS_ROUTES.filter(
    (r) => r.href !== '/app' && !CORE_HREFS.has(r.href),
  );

  const goLabel =
    dash?.goScore != null
      ? `${dash.goScore}% ${dash.goScore >= GO_THRESHOLD ? 'GO' : 'NO-GO'}`
      : 'NOT RUN';

  return (
    <ScreenFrame maxWidth={1120}>
      <View style={styles.topBar}>
        <Text style={styles.logo}>
          TRADE FLOW <Text style={styles.logoGold}>£50 IN SMILE OUT</Text>
        </Text>
        <View style={styles.topActions}>
          <Pressable
            style={styles.iconBtn}
            onPress={() => router.push('/app/settings')}
          >
            <Text style={styles.iconBtnText}>Settings</Text>
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => router.push('/')}>
            <Text style={styles.iconBtnText}>Site</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.kicker}>UPRM HOME · PRODUCTION DESK</Text>
      <Text style={styles.title}>
        Welcome back, <Text style={styles.titleGold}>{name}</Text>
      </Text>
      <View style={styles.badgeRow}>
        <Text style={styles.badge}>ACTIVE</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.companion}>
        <View style={styles.companionMark}>
          <Text style={styles.companionMarkText}>UP</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.companionLabel}>
            COMPANION · UPRM REMEMBERS JOURNEY NOT SESSION
          </Text>
          <Text style={styles.companionCopy}>{companion}</Text>
        </View>
      </View>

      <View style={styles.heroGrid}>
        <View style={styles.ringCard}>
          <FlowProgressRing progress={progress} label="Flow as One" />
          <Text style={styles.ringSub}>
            {chainDone}/5 · Heart {chainDone >= 5 ? 'OPEN' : 'LOCKED'}
          </Text>
          <Text style={styles.goChip}>{goLabel}</Text>
        </View>
        <View style={styles.healthWrap}>
          {health.map((h) => (
            <View key={h.id} style={[styles.healthTile, { width: tileW }]}>
              <Text style={styles.healthLabel}>{h.label}</Text>
              <Text
                style={[
                  styles.healthValue,
                  {
                    color:
                      h.tone === 'ready'
                        ? colors.ready
                        : h.tone === 'danger'
                          ? colors.danger
                          : colors.white,
                  },
                ]}
              >
                {h.value}
              </Text>
              <Text style={styles.healthSub}>{h.sub}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${h.bar}%`,
                      backgroundColor:
                        h.tone === 'danger' ? colors.danger : colors.gold,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.deskRow}>
        <View style={[styles.deskCard, { width: deskW }]}>
          <Text style={styles.deskKicker}>£50 DISH</Text>
          <Text style={styles.deskLine}>£{dash?.fake.toFixed(0)} Fake · Simulator</Text>
          <Text style={styles.deskLine}>
            £{dash?.live.toFixed(0)} Live · £{cap.toFixed(0)}/day Mon–Fri
          </Text>
          <Text style={styles.deskLine}>
            £{dash?.safety.toFixed(0)} Safety · Guardian vault
          </Text>
          <Text style={styles.deskCap}>
            £{spent.toFixed(2)} of £{cap.toFixed(2)} — £{left.toFixed(2)} left
          </Text>
        </View>
        <View style={[styles.deskCard, styles.consoleCard, { width: deskW }]}>
          <Text style={styles.deskKicker}>LIVE CONSOLE · GATE 5</Text>
          <Text style={styles.consoleLine}>
            → £{spent.toFixed(2)} / £{cap.toFixed(2)} TODAY
          </Text>
          <Text style={styles.consoleLine}>
            ✓ GO · Risk · Wed proof · Guardian · Cap room
          </Text>
          <Text style={styles.consoleLine}>
            Guardian{' '}
            {dash?.guardian === 'triggered' ? 'TRIGGERED' : 'PROTECTED'} · 10s
            check
          </Text>
          <Pressable onPress={() => router.push('/app/execute')}>
            <Text style={styles.deskLink}>Open Execution →</Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        style={styles.nextBanner}
        onPress={() => router.push(nextHref as any)}
      >
        <View>
          <Text style={styles.nextKicker}>NEXT ACTION</Text>
          <Text style={styles.nextTitle}>{nextLabel}</Text>
        </View>
        <Text style={styles.nextArrow}>→</Text>
      </Pressable>

      <Text style={styles.section}>FLOWCHAIN · MON–FRI THE HEART</Text>
      <View style={styles.days}>
        {FLOW_DAYS.map((d) => {
          const st = dayStatus(dash?.journey ?? null, d.key);
          return (
            <Pressable
              key={d.key}
              style={[
                styles.day,
                st === 'done' && styles.dayDone,
                st === 'locked' && styles.dayLocked,
                st === 'open' && styles.dayOpen,
              ]}
              onPress={() => {
                if (st === 'locked') return;
                router.push(d.href as any);
              }}
            >
              <Text style={styles.dayLabel}>{d.label}</Text>
              <Text style={styles.dayTitle}>{d.title}</Text>
              <Text
                style={[
                  styles.dayState,
                  {
                    color:
                      st === 'done'
                        ? colors.ready
                        : st === 'locked'
                          ? colors.danger
                          : colors.gold,
                  },
                ]}
              >
                {st.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.section}>UPRM TIMELINE</Text>
      <View style={styles.timeline}>
        {(dash?.timeline?.length ?? 0) === 0 ? (
          <Text style={styles.empty}>
            No events yet — move through Assessment → Heart.
          </Text>
        ) : (
          dash!.timeline.map((e) => (
            <View key={e.id} style={styles.tlRow}>
              <View style={styles.tlDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.tlKey}>{e.event_key}</Text>
                <Text style={styles.tlWhen}>
                  {new Date(e.created_at).toLocaleString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <Text style={styles.section}>OS MODULES</Text>
      <View style={styles.grid}>
        {coreMods.map((route) => {
          const st = moduleStatus(route.href, ctx);
          return (
            <Pressable
              key={route.href}
              style={[styles.mod, { width: modW }, st === 'next' && styles.modNext]}
              onPress={() => {
                if (st === 'locked') return;
                router.push(route.href as any);
              }}
            >
              <Text style={[styles.modBadge, { color: statusColor(st) }]}>
                {statusLabel(st)}
              </Text>
              <Text style={styles.modTitle}>{route.title}</Text>
              <Text style={styles.modSub}>{route.subtitle}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.section}>MORE DESK</Text>
      <View style={styles.grid}>
        {moreMods.map((route) => (
          <Pressable
            key={route.href}
            style={[styles.mod, { width: modW }]}
            onPress={() => router.push(route.href as any)}
          >
            <Text style={styles.modTitle}>{route.title}</Text>
            <Text style={styles.modSub}>{route.subtitle}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.section}>ADMIN</Text>
      <View style={styles.grid}>
        {ADMIN_ROUTES.map((route) => (
          <Pressable
            key={route.href}
            style={[styles.mod, { width: modW }]}
            onPress={() => router.push(route.href as any)}
          >
            <Text style={[styles.modBadge, { color: colors.textMuted }]}>
              ADMIN
            </Text>
            <Text style={styles.modTitle}>{route.title}</Text>
            <Text style={styles.modSub}>{route.subtitle}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.signOut} onPress={() => signOut()}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    gap: 12,
  },
  logo: {
    fontFamily: 'Montserrat_800ExtraBold',
    color: colors.white,
    fontSize: 14,
    letterSpacing: 1,
  },
  logoGold: { color: colors.gold, fontSize: 11 },
  topActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBtnText: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.goldLight,
    fontSize: 12,
  },
  kicker: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2,
    color: colors.gold,
  },
  title: {
    marginTop: 8,
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 30,
    color: colors.white,
    letterSpacing: -0.6,
  },
  titleGold: { color: colors.gold },
  badgeRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  badge: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.4,
    color: colors.ready,
    borderWidth: 1,
    borderColor: 'rgba(61,220,151,0.35)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  email: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    color: colors.goldLight,
  },
  companion: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.28)',
    backgroundColor: 'rgba(14,36,71,0.65)',
    flexDirection: 'row',
    gap: 14,
  },
  companionMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companionMarkText: {
    fontFamily: 'Montserrat_800ExtraBold',
    color: colors.navy,
    fontSize: 12,
  },
  companionLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 9,
    letterSpacing: 1.2,
    color: colors.gold,
  },
  companionCopy: {
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
    color: colors.white,
    fontSize: 14,
    lineHeight: 21,
  },
  heroGrid: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  ringCard: {
    minWidth: 180,
    flexGrow: 1,
    maxWidth: 260,
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  ringSub: {
    marginTop: 12,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  goChip: {
    marginTop: 8,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    color: colors.gold,
  },
  healthWrap: {
    flex: 1,
    minWidth: 260,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  healthTile: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    minWidth: 140,
  },
  healthLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  healthValue: {
    marginTop: 6,
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 22,
  },
  healthSub: {
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    fontSize: 12,
  },
  barTrack: {
    marginTop: 10,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  barFill: { height: 4, borderRadius: 2 },
  deskRow: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  deskCard: {
    minWidth: 240,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E376B',
    backgroundColor: '#0E1D3D',
  },
  consoleCard: {
    backgroundColor: '#070D1F',
    borderColor: 'rgba(212,175,55,0.35)',
  },
  deskKicker: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.6,
    color: colors.gold,
    marginBottom: 10,
  },
  deskLine: {
    fontFamily: 'Inter_400Regular',
    color: colors.white,
    fontSize: 14,
    marginBottom: 4,
  },
  deskCap: {
    marginTop: 10,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 12,
    color: colors.goldLight,
  },
  consoleLine: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    color: colors.goldLight,
    marginBottom: 6,
  },
  deskLink: {
    marginTop: 10,
    fontFamily: 'Inter_600SemiBold',
    color: colors.gold,
  },
  nextBanner: {
    marginTop: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.45)',
    backgroundColor: 'rgba(212,175,55,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextKicker: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 2,
    color: colors.gold,
  },
  nextTitle: {
    marginTop: 4,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 18,
    color: colors.white,
  },
  nextArrow: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 28,
    color: colors.gold,
  },
  section: {
    marginTop: 28,
    marginBottom: 12,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2,
    color: colors.goldLight,
  },
  days: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  day: {
    flexGrow: 1,
    minWidth: 100,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  dayDone: { borderColor: 'rgba(61,220,151,0.4)' },
  dayOpen: { borderColor: 'rgba(212,175,55,0.5)' },
  dayLocked: { borderColor: 'rgba(240,113,120,0.45)', opacity: 0.75 },
  dayLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1,
    color: colors.gold,
  },
  dayTitle: {
    marginTop: 4,
    fontFamily: 'Montserrat_700Bold',
    color: colors.white,
    fontSize: 13,
  },
  dayState: {
    marginTop: 6,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 9,
    letterSpacing: 1,
  },
  timeline: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  empty: { fontFamily: 'Inter_400Regular', color: colors.textMuted },
  tlRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    alignItems: 'flex-start',
  },
  tlDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
    marginTop: 5,
  },
  tlKey: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 12,
    color: colors.white,
  },
  tlWhen: {
    marginTop: 2,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.textMuted,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  mod: {
    minWidth: 150,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  modNext: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(212,175,55,0.08)',
  },
  modBadge: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 9,
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  modTitle: {
    fontFamily: 'Montserrat_700Bold',
    color: colors.white,
    fontSize: 14,
  },
  modSub: {
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    fontSize: 12,
  },
  signOut: {
    marginTop: 36,
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  signOutText: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.gold,
  },
});
